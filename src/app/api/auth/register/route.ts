import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  checkRateLimit,
  clientIp,
  createSessionToken,
  hashPassword,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = checkRateLimit(`register:${ip}`);
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
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Invalid registration data" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in." },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash: hashPassword(parsed.data.password),
      name: parsed.data.name || email.split("@")[0]!,
      // Sensible starter subjects so a fresh account isn't empty.
      subjects: {
        create: [
          { name: "Mathematics", color: "#8b5cf6" },
          { name: "Physics", color: "#3b82f6" },
          { name: "Literature", color: "#ec4899" },
        ],
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarEmoji: true,
      themeMode: true,
      accentColor: true,
    },
  });

  const token = createSessionToken(user.id);
  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
