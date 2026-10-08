import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp, generateResetToken } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validation";

// S15 (ADR-013) — POST { email }: the "Reset your password" screen. The
// response is ALWAYS 200 { ok: true } (no enumeration — the reference's
// check-email screen shows the same copy for any address). When the
// account exists, a one-shot PasswordResetToken (30 min) is created and
// the reset URL is included in the response: this app has no SMTP, so the
// response IS the delivery (surfaced on the check-email screen as a muted
// self-hosted note — see docs/remediation-plan-session15.md). The
// register route's 409 already discloses existing accounts; this stays
// within the app's documented single-user threat model.
const RESET_TTL_MS = 30 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = checkRateLimit(`forgot:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${limit.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
  });

  if (user) {
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = generateResetToken();
    await db.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
    });
    return NextResponse.json({ ok: true, resetUrl: `/login?token=${token}` });
  }

  return NextResponse.json({ ok: true });
}
