import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  checkRateLimit,
  clientIp,
  generateVerificationCode,
  hashPassword,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

// S15 (ADR-013) — registration no longer auto-logs-in: it creates an
// UNVERIFIED account plus a 6-digit VerificationToken (15 min) and the
// client advances to the "Verify your email" screen (the reference's
// measured flow). No SMTP exists in this self-hosted app, so the code is
// returned to the registrant directly — the code IS the email here.
// Duplicate behavior mirrors the reference platform: an existing
// UNVERIFIED account re-sends (same 201); a VERIFIED one keeps the 409.

const CODE_TTL_MS = 15 * 60 * 1000;

async function issueVerificationCode(userId: string): Promise<string> {
  // One live code per user: supersede any earlier tokens.
  await db.verificationToken.deleteMany({ where: { userId } });
  const code = generateVerificationCode();
  await db.verificationToken.create({
    data: { userId, code, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });
  return code;
}

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

  // Platform behavior: an unverified duplicate RE-SENDS and re-enters the
  // verify screen; only a verified account reports the conflict.
  if (existing?.emailVerified) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in." },
      { status: 409 },
    );
  }

  if (existing) {
    const code = await issueVerificationCode(existing.id);
    return NextResponse.json({ ok: true, email, code }, { status: 201 });
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash: hashPassword(parsed.data.password),
      name: parsed.data.name || email.split("@")[0]!,
      // S17 (measured on the reference's fresh account): registrations start
      // with ZERO subjects — its Settings/Subjects tab renders the
      // "No subjects yet. Add your first subject to get started!" empty
      // state and its Timetable the "No subjects added yet" hint. The old
      // three starter subjects were invented chrome the reference never
      // creates; the seeded DEMO account keeps its showcase subjects.
    },
    select: { id: true },
  });

  const code = await issueVerificationCode(user.id);
  return NextResponse.json({ ok: true, email, code }, { status: 201 });
}
