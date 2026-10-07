import { describe, expect, it } from "vitest";
import {
  checkRateLimit,
  createSessionToken,
  hashPassword,
  readSessionToken,
  resetRateLimit,
  verifyPassword,
} from "@/lib/auth";

describe("password hashing (scrypt)", () => {
  it("hashes and verifies round-trip", () => {
    const hash = hashPassword("Demo1234!");
    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(verifyPassword("Demo1234!", hash)).toBe(true);
    expect(verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("salts every hash (two hashes of the same password differ)", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("rejects malformed stored hashes without throwing", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "scrypt$only")).toBe(false);
  });
});

describe("session tokens (HMAC)", () => {
  it("round-trips a valid token", () => {
    const token = createSessionToken("user-123");
    const payload = readSessionToken(token);
    expect(payload?.uid).toBe("user-123");
    expect(payload?.exp).toBeGreaterThan(Date.now());
  });

  it("rejects tampered payloads", () => {
    const token = createSessionToken("user-123");
    const [body, mac] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ uid: "attacker", iat: 0, exp: 9e15 })).toString("base64url");
    expect(readSessionToken(`${forged}.${mac}`)).toBeNull();
    expect(readSessionToken(`${body}.deadbeef`)).toBeNull();
  });

  it("rejects structurally invalid tokens", () => {
    expect(readSessionToken("")).toBeNull();
    expect(readSessionToken("no-dot")).toBeNull();
    expect(readSessionToken("a.b.c.d")).toBeNull();
    expect(readSessionToken(`${Buffer.from("not json").toString("base64url")}.x`)).toBeNull();
  });

  it("honors a different AUTH_SECRET (tokens do not survive a key change)", () => {
    const token = createSessionToken("user-123");
    const previous = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "a-completely-different-key";
    try {
      expect(readSessionToken(token)).toBeNull();
    } finally {
      if (previous === undefined) delete process.env.AUTH_SECRET;
      else process.env.AUTH_SECRET = previous;
    }
  });
});

describe("login rate limiting", () => {
  const ip = "203.0.113.99";
  it("allows up to the budget then blocks with a retry window", () => {
    resetRateLimit(ip);
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip).ok).toBe(true);
    }
    const blocked = checkRateLimit(ip);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(900);
  });

  it("counts IPs independently", () => {
    resetRateLimit(ip);
    const other = "198.51.100.7";
    resetRateLimit(other);
    for (let i = 0; i < 10; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip).ok).toBe(false);
    expect(checkRateLimit(other).ok).toBe(true);
    resetRateLimit(other);
  });

  it("resetRateLimit clears the window", () => {
    resetRateLimit(ip);
    for (let i = 0; i < 10; i++) checkRateLimit(ip);
    resetRateLimit(ip);
    expect(checkRateLimit(ip).ok).toBe(true);
  });
});
