import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  checkRateLimit,
  clientIp,
  createSessionToken,
  normalizeVerificationCode,
} from "@/lib/auth";
import { verifyEmailSchema } from "@/lib/validation";

// S15 (ADR-013) — POST { email, code }: the "Verify your email" screen.
// Matching the latest unexpired code flips emailVerified, burns the
// token family, and SIGNS THE USER IN (the reference's verify screen is
// the end of the registration journey — it lands in the app).
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
  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, emailVerified: true },
  });
  if (!user) {
    // No enumeration: same shape as a wrong code.
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  const code = normalizeVerificationCode(parsed.data.code);
  const token = code
    ? await db.verificationToken.findFirst({
        where: { userId: user.id, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      })
    : null;

  if (!token || token.code !== code) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  const [verified] = await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        avatarEmoji: true,
        themeMode: true,
        accentColor: true,
      },
    }),
    db.verificationToken.deleteMany({ where: { userId: user.id } }),
  ]);

  const res = NextResponse.json({ user: verified });
  res.cookies.set(SESSION_COOKIE, createSessionToken(verified.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
