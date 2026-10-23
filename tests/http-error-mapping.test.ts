import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "@/lib/auth";
import {
  BadRequestError,
  NotFoundError,
  errorResponse,
} from "@/lib/server/http";

/**
 * Session-91 remediation pin — the P2003 FK-violation mapping (the audit's
 * LOW finding #10).
 *
 * The CRUD factory's shared errorResponse mapped only P2002 → 409 and
 * P2025 → 404; a create/update carrying a nonexistent subjectId/listId/
 * notebookId raised Prisma P2003 and surfaced as a 500 "Internal server
 * error" (the import route maps P2003 locally — the factory paths did
 * not). The fix: P2003 → 400 "referenced record not found", a client
 * error for client-supplied references.
 *
 * Importing http.ts instantiates the PrismaClient singleton (no query —
 * construction only), which is safe in the vitest node environment.
 */

describe("errorResponse — Prisma error mapping (S91)", () => {
  it("maps P2003 (FK violation) to 400 with an actionable message", () => {
    const res = errorResponse({ code: "P2003", message: "Foreign key constraint failed" });
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("maps P2002 (unique violation) to 409", () => {
    const res = errorResponse({ code: "P2002", message: "Unique constraint failed" });
    expect(res.status).toBe(409);
  });

  it("maps P2025 (record not found) to 404", () => {
    const res = errorResponse({ code: "P2025", message: "Record not found" });
    expect(res.status).toBe(404);
  });

  it("maps the typed error families unchanged", () => {
    expect(errorResponse(new UnauthorizedError()).status).toBe(401);
    expect(errorResponse(new BadRequestError("bad")).status).toBe(400);
    expect(errorResponse(new NotFoundError("gone")).status).toBe(404);
  });

  it("unknown errors still fall to 500 (never silently swallowed)", () => {
    const res = errorResponse(new Error("boom"));
    expect(res.status).toBe(500);
  });
});
