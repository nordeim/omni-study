import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, checkRateLimit, verifyPassword } from "@/lib/auth";
import { changeEmailSchema } from "@/lib/validation";
import { BadRequestError, errorResponse } from "@/lib/server/http";

// S26 (ADR-024) — POST { password, newEmail, confirmEmail }: the
// account-identity rotation. A signed-in user who proves their password
// changes the address they log in with — the email is the login
// identifier, the last immutable account field before this route (a
// typo'd registration address — with no SMTP the verification code
// surfaces directly, so a typo CAN be verified — or a decommissioned
// school email had no in-app path except raw SQLite surgery).
//
// Contract (docs/remediation-plan-session26.md):
//  - auth-gated (401 JSON for anonymous callers — the API-route
//    convention), then rate-limited 10/15-min PER USER (the S14 seam's
//    default budget — a rare, sensitive write).
//  - the password is VERIFIED against the stored scrypt hash first
//    (timing-safe) — a stolen session cookie cannot hijack the account
//    identity; a wrong password → 400 "Your password is incorrect."
//    (the S25 copy; the caller is the authenticated account owner — no
//    enumeration surface; the guard runs BEFORE any write).
//  - the schema's refine demands the typed confirm (newEmail ===
//    confirmEmail) — a mistyped address is UNRECOVERABLE through the UI
//    (the next login needs the new address); the refine copy surfaces
//    verbatim.
//  - the must-differ guard (route-side — the current email is server
//    state): posting the account's own address → 400 "This is already
//    your email address." (the S24 must-differ posture).
//  - the uniqueness guard: an address owned by ANY existing account
//    (verified or not) → 409 (the register route's conflict family —
//    claiming an unverified owner's address would lock THAT owner out of
//    their own re-registration path).
//  - emailVerified STAYS TRUE: with no SMTP (ADR-013) a re-verification
//    OTP would surface to the same actor who just proved the password —
//    proving nothing, and creating a lockout footgun at the next login.
//    The password proof IS the verification for the change.
//  - the SESSION SURVIVES the change by design: the cookie is an HMAC
//    over the user id, not the email (stateless — the S24 contract).
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    // The S14 seam: 10 sensitive writes / 15 min per user.
    const limit = checkRateLimit(`changeEmail:${user.id}`, 10);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many email changes — wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const parsed = changeEmailSchema.safeParse(body);
    if (!parsed.success) {
      // The refine copy (the confirm-match rule) surfaces verbatim; a
      // missing/short password or malformed email gets the family's
      // standard wording.
      const message = parsed.error.issues[0]?.message;
      throw new BadRequestError(
        message === "The email addresses do not match."
          ? message
          : "Enter your password and the new email address twice.",
      );
    }

    // Emails are stored lowercase (the register/login convention).
    const newEmail = parsed.data.newEmail.toLowerCase();

    // getCurrentUser deliberately never reads the hash — this route reads it
    // itself (the minimum-privilege pattern; the hash never leaves the route).
    const record = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true, email: true },
    });
    if (!record || !verifyPassword(parsed.data.password, record.passwordHash)) {
      // The guard runs BEFORE any write — the identity is untouched.
      throw new BadRequestError("Your password is incorrect.");
    }

    // The must-differ guard (route-side): a no-op change never lands.
    if (newEmail === record.email) {
      throw new BadRequestError("This is already your email address.");
    }

    // The uniqueness guard: ANY existing owner (verified or not) keeps the
    // address — claiming it would lock that owner out of their own
    // re-registration path.
    const existing = await db.user.findUnique({ where: { email: newEmail }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try a different address." },
        { status: 409 },
      );
    }

    // The ONE write — emailVerified stays true (the password proof IS the
    // verification for the change; the rejected re-verification alternative
    // is documented in ADR-024).
    await db.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });

    // The session cookie is untouched — stateless HMAC survives the owner's
    // own identity rotation (the S24 contract). The email rides back so the
    // client updates the theme store's user slice.
    return NextResponse.json({ ok: true, email: newEmail });
  } catch (err) {
    return errorResponse(err);
  }
}
