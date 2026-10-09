import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, checkRateLimit, hashPassword, verifyPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation";
import { BadRequestError, errorResponse } from "@/lib/server/http";

// S24 (ADR-022) — POST { currentPassword, newPassword }: the account-security
// rotation. A signed-in user who knows their current password rotates it
// WITHOUT the S15 forgot-password dance (which is designed for the locked-out
// user — its no-SMTP reset URL surfaces in the response JSON, an awkward path
// for the hygiene-rotating owner).
//
// Contract (docs/remediation-plan-session24.md):
//  - auth-gated (401 JSON for anonymous callers — the API-route convention),
//    then rate-limited 10/15-min PER USER (the S14 seam's default budget — a
//    rare, sensitive write).
//  - the current password is VERIFIED against the stored scrypt hash first
//    (timing-safe) — a stolen session cookie cannot rotate the password
//    silently; a wrong current password → 400 "Your current password is
//    incorrect." (the caller is the authenticated account owner — no
//    enumeration surface; clear feedback, the inline login-error posture).
//  - the schema's refine rejects current === new with the actionable copy
//    (a no-op rotation the user thinks happened).
//  - the register family's policy applies to the new password (min 8 /
//    max 200 — ONE policy, no drift).
//  - the SESSION SURVIVES the rotation by design: the cookie is an HMAC
//    over AUTH_SECRET, not the password (stateless — revoking OTHER sessions
//    would need a per-request DB epoch check, the rejected alternative in
//    ADR-022).
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    // The S14 seam: 10 sensitive writes / 15 min per user.
    const limit = checkRateLimit(`changePw:${user.id}`, 10);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many password changes — wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      // The refine copy (the same-password rule) surfaces verbatim; a
      // missing/short field gets the family's standard wording.
      const message = parsed.error.issues[0]?.message;
      throw new BadRequestError(
        message === "The new password must be different from your current password."
          ? message
          : "Enter your current password and a new password of at least 8 characters.",
      );
    }

    // getCurrentUser deliberately never reads the hash — this route reads it
    // itself (the minimum-privilege pattern; the hash never leaves the route).
    const record = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!record || !verifyPassword(parsed.data.currentPassword, record.passwordHash)) {
      // The guard runs BEFORE any write — the stored hash is untouched.
      throw new BadRequestError("Your current password is incorrect.");
    }

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(parsed.data.newPassword) },
    });

    // The session cookie is untouched — stateless HMAC survives the owner's
    // own rotation (documented; ADR-022's rejected revocation alternative).
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
