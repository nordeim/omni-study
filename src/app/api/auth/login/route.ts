import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  checkRateLimit,
  clientIp,
  createSessionToken,
  hashPassword,
  resetRateLimit,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = checkRateLimit(ip);
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
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // Uniform error — no user-enumeration signal.
  const invalid = NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  if (!user) return invalid;
  if (!verifyPassword(parsed.data.password, user.passwordHash)) return invalid;

  resetRateLimit(ip);
  const token = createSessionToken(user.id);
  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarEmoji: user.avatarEmoji,
      themeMode: user.themeMode,
      accentColor: user.accentColor,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
