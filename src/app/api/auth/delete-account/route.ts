import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, requireUser, checkRateLimit, verifyPassword } from "@/lib/auth";
import { deleteAccountSchema } from "@/lib/validation";
import { BadRequestError, errorResponse } from "@/lib/server/http";

// S25 (ADR-023) — POST { password, confirmation: "DELETE" }: the ownership
// exit. A signed-in user who proves their password and types the word
// DELETE permanently erases their own account — the ONE cascade write
// (every user relation in the schema carries onDelete: Cascade, verified)
// wipes the complete data footprint: subjects, lists, tasks, assignments,
// exams, events, timetable, notebooks, notes, decks+cards, practice
// tests, groups, grades, focus sessions, folders+files, chat, calc
// history, holidays, RUM events, and both token families.
//
// Contract (docs/remediation-plan-session25.md):
//  - auth-gated (401 JSON for anonymous callers — the API-route
//    convention), then rate-limited 10/15-min PER USER (the S14 seam's
//    default budget — a rare, terminal write).
//  - the password is VERIFIED against the stored scrypt hash first
//    (timing-safe) — a stolen session cookie cannot erase the account
//    silently; a wrong password → 400 "Your password is incorrect."
//    (the caller is the authenticated account owner — no enumeration
//    surface; the guard runs BEFORE any write).
//  - the schema's refine demands the typed word DELETE (case-exact) —
//    the deliberate gesture before an irreversible cascade.
//  - the session cookie DIES with the account (maxAge: 0 — the logout
//    route's exact mechanism); a surviving cookie is doubly dead anyway
//    (the HMAC validates but the user id no longer resolves — me 401s).
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    // The S14 seam: 10 terminal writes / 15 min per user.
    const limit = checkRateLimit(`delAcc:${user.id}`, 10);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many deletion attempts — wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      // The refine copy (the typed-confirmation rule) surfaces verbatim; a
      // missing/short password gets the family's standard wording.
      const message = parsed.error.issues[0]?.message;
      throw new BadRequestError(
        message === "Type DELETE to confirm."
          ? message
          : "Enter your password and type DELETE to confirm.",
      );
    }

    // getCurrentUser deliberately never reads the hash — this route reads it
    // itself (the minimum-privilege pattern; the hash never leaves the route).
    const record = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!record || !verifyPassword(parsed.data.password, record.passwordHash)) {
      // The guard runs BEFORE any write — the account is untouched.
      throw new BadRequestError("Your password is incorrect.");
    }

    // The ONE cascade write — the schema's own onDelete: Cascade on all 22
    // user relations wipes the complete data footprint atomically.
    await db.user.delete({ where: { id: user.id } });

    // The session dies with the account (the logout route's cookie flags).
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
