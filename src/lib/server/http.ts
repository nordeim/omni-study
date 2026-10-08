import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { db } from "@/lib/db";
import { requireUser, UnauthorizedError } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Server HTTP helpers — uniform JSON envelopes, Zod validation at every
// boundary, and Prisma error mapping. The CRUD factory scopes every query
// by the session user (no cross-user access by construction).
// ---------------------------------------------------------------------------

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new BadRequestError("Request body must be valid JSON");
  }
}

export class BadRequestError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** S13-C3: build a download Content-Disposition that speaks BOTH filename
 * dialects — an ASCII-safe quoted fallback (RFC 2183) AND the RFC 5987
 * `filename*=UTF-8''<pct-encoded>` extended form every modern browser
 * prefers for non-ASCII names. The pre-fix code percent-encoded the name
 * INSIDE the quoted string, so browsers saved "%D1%84…" as the literal
 * filename. Pure string logic — unit-pinned in tests/files.test.ts. */
export function buildContentDisposition(name: string): string {
  const source = name.trim() ? name : "download";
  // RFC 5987: UTF-8 percent-encoding of the exact original name.
  const extended = encodeURIComponent(source);
  // RFC 2183 quoted-string: ASCII-printable only, no quotes/backslashes.
  const fallback = source
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "_")
    .trim();
  return `attachment; filename="${fallback || "download"}"; filename*=UTF-8''${extended}`;
}

type Ctx = { params: Promise<Record<string, string>> };

/** Wrap a route handler: auth + uniform error mapping. */
export function withUser(
  handler: (userId: string, req: Request, ctx: Ctx | undefined) => Promise<Response>,
) {
  return async (req: Request, ctx?: Ctx) => {
    try {
      const user = await requireUser();
      return await handler(user.id, req, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function errorResponse(err: unknown): Response {
  if (err instanceof UnauthorizedError) return jsonError(401, "Authentication required");
  if (err instanceof BadRequestError) return jsonError(400, err.message);
  if (err instanceof NotFoundError) return jsonError(404, err.message);
  const anyErr = err as { code?: string; message?: string };
  if (anyErr?.code === "P2002") return jsonError(409, "A record with this value already exists");
  if (anyErr?.code === "P2025") return jsonError(404, "Record not found");
  console.error("[api] unhandled error:", err);
  return jsonError(500, "Internal server error");
}

// ---- CRUD factory -----------------------------------------------------------

export interface CrudDelegate<TRecord, TCreateInput> {
  list: (userId: string) => Promise<TRecord[]>;
  create: (userId: string, input: TCreateInput) => Promise<TRecord>;
  update: (userId: string, id: string, input: Partial<TCreateInput>) => Promise<TRecord>;
  remove: (userId: string, id: string) => Promise<void>;
}

/** Collection routes: GET (list) + POST (create). */
export function makeCollectionRoutes<TRecord, TCreateInput extends Record<string, unknown>>(
  delegate: CrudDelegate<TRecord, TCreateInput>,
) {
  const GET = withUser(async (userId) => jsonOk(await delegate.list(userId)));
  const POST = withUser(async (userId, req) => {
    const body = await readJson(req);
    const record = await delegate.create(userId, body as TCreateInput);
    return jsonOk(record, { status: 201 });
  });
  return { GET, POST };
}

/** Item routes: PATCH (update) + DELETE. `id` comes from the route params. */
export function makeItemRoutes<TRecord, TCreateInput extends Record<string, unknown>>(
  delegate: CrudDelegate<TRecord, TCreateInput>,
) {
  const PATCH = withUser(async (userId, req, ctx) => {
    const id = (await ctx?.params)?.id;
    if (!id) throw new BadRequestError("Missing record id");
    const body = await readJson(req);
    const record = await delegate.update(userId, id, body as Partial<TCreateInput>);
    return jsonOk(record);
  });
  const DELETE = withUser(async (userId, _req, ctx) => {
    const id = (await ctx?.params)?.id;
    if (!id) throw new BadRequestError("Missing record id");
    await delegate.remove(userId, id);
    return jsonOk({ ok: true });
  });
  return { PATCH, DELETE };
}

/** Shared parse helper — throws BadRequestError with field context. */
export function parseWith<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path?.length ? ` at ${issue.path.join(".")}` : "";
    throw new BadRequestError(`Invalid input${where}: ${issue?.message ?? "validation failed"}`);
  }
  return result.data;
}

/** Coerce incoming ISO-ish date strings to Date; null for empty/null, undefined when absent. */
export function toDate(value: unknown): Date | null | undefined {
  if (value === null || value === "") return null;
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export { db };
