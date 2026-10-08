import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp, generateVerificationCode } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validation";

// S15 (ADR-013) — POST { email }: the verify screen's "Resend" affordance.
// Only an existing UNVERIFIED account gets a fresh code (included in the
// response — the no-SMTP self-hosted delivery). Unknown or verified
// accounts get the SAME uniform 200 { ok: true } so nothing enumerates.
const CODE_TTL_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = checkRateLimit(`verify:${ip}`);
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
    select: { id: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    await db.verificationToken.deleteMany({ where: { userId: user.id } });
    const code = generateVerificationCode();
    await db.verificationToken.create({
      data: { userId: user.id, code, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    });
    return NextResponse.json({ ok: true, code });
  }

  return NextResponse.json({ ok: true });
}
