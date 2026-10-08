import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Auth — email/password with scrypt hashing and HMAC-signed stateless
// session cookies (the AUTH_SECRET contract from .env.example).
//
// Session format: base64url(payload).base64url(hmac-sha256(payload))
//   payload = { uid, iat, exp }  (exp = iat + SESSION_TTL_MS)
// The HMAC covers the payload; tampering or expiry invalidates the cookie.
// Stateless sessions keep the hot path free of session-store round trips;
// revocation = client cookie clear (logout) — acceptable for this app's
// threat model and documented in Project_Architecture_Document.md.

export const SESSION_COOKIE = "sf_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEV_FALLBACK_SECRET = "dev-only-insecure-session-secret";

function secret(): string {
  return process.env.AUTH_SECRET?.trim() || DEV_FALLBACK_SECRET;
}

// ---- Password hashing (scrypt: memory-hard, in Node stdlib) ----------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// ---- S15: email-verification + password-reset primitives -------------------
// Pure seams so the auth routes stay thin shells. The reference's platform
// emails a 6-digit code and a reset link; this self-hosted app has no SMTP,
// so the routes surface them to the actor directly (ADR-013).

/** Crypto-random 6-digit code, zero-padded (randomInt over [0, 1e6)). */
export function generateVerificationCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** 24 random bytes as lowercase hex — the reset-link token (48 chars). */
export function generateResetToken(): string {
  return randomBytes(24).toString("hex");
}

/**
 * Normalize a user-entered verification code: tolerate pasted formatting
 * (spaces / dashes / dots) around and inside the digits, reject anything
 * that isn't exactly six digits after cleaning.
 */
export function normalizeVerificationCode(input: string | null | undefined): string | null {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[\s.\-]/g, "");
  return /^\d{6}$/.test(cleaned) ? cleaned : null;
}

// ---- Session tokens ---------------------------------------------------------

export interface SessionPayload {
  uid: string;
  iat: number;
  exp: number;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const now = Date.now();
  const payload: SessionPayload = { uid: userId, iat: now, exp: now + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---- Request context (route handlers / server components) ------------------

export async function getCurrentUser() {
  const store = await cookies();
  const payload = readSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await db.user.findUnique({
    where: { id: payload.uid },
    select: {
      id: true,
      email: true,
      name: true,
      avatarEmoji: true,
      themeMode: true,
      accentColor: true,
      createdAt: true,
    },
  });
  return user;
}

/** Throwing variant for API routes — 401 with a JSON body. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "UnauthorizedError";
  }
}

// ---- Rate limiting (in-memory, per-key) -----------------------------------
// Mirrors the reference app's limiter shape: 10 attempts per IP per 15 min
// window for login (and register, under a separate `register:` prefix).
// Single-process in-memory store — documented limitation for multi-instance
// deployments (see Project_Architecture_Document.md).
// S14-C1: the budget generalizes — checkRateLimit(key, max) lets the AI
// routes pass a per-USER budget (20/15 min) while login/register keep the
// default 10. The four AI call sites are the app's only per-request COST
// surface (each triggers an LLM completion).

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max: number = MAX_ATTEMPTS): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterSec: 0 };
  }
  if (entry.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimit(ip: string): void {
  attempts.delete(ip);
}

/** Best-effort client IP for rate limiting (behind the gateway/proxy). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
