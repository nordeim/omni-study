import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp, hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validation";

// S15 (ADR-013) — POST { token, password }: the reset deep-link screen
// (`/login?token=<48hex>`). A valid unexpired token rewrites the password
// hash and burns the token family; the client returns to the sign-in
// state with a success note.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = checkRateLimit(`reset:${ip}`);
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
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const record = await db.passwordResetToken.findFirst({
    where: { token: parsed.data.token, expiresAt: { gt: new Date() } },
    select: { userId: true },
  });
  if (!record) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash: hashPassword(parsed.data.password) },
    }),
    db.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
