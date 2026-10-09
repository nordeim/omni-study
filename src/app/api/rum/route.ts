import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, requireUser } from "@/lib/auth";
import { errorResponse, parseWith, readJson } from "@/lib/server/http";
import { rumBatchSchema } from "@/lib/validation";

// S18 (ADR-016) — the RUM hook's server side.
//
// POST /api/rum: the authed beacon's batched report. Auth-gated (an
// unauthenticated metrics endpoint is an abuse surface), rate-limited
// per user (1000/15 min — a human pageload cadence is ~2-3 batched
// flushes; the e2e suite itself drives ~250 shell loads, so the budget
// covers a full run), validated through the Zod batch seam, and each
// event UPSERTS on the (sessionId, metric) unique pair — web-vitals'
// final-value-wins semantics (an LCP/CLS re-report updates the row in
// place instead of duplicating it).
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const limit = checkRateLimit(`rum:${user.id}`, 1000);
    if (!limit.ok) {
      // A monitoring beacon must never surface errors to the user — the
      // 429 carries Retry-After for correctness, and the client swallows
      // it (missing samples beat broken UX).
      return NextResponse.json(
        { error: "Too many metric reports." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }
    const body = await readJson(req);
    const data = parseWith(rumBatchSchema, body as Record<string, unknown>);
    const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300);

    // Upsert every event in the batch; the unique (sessionId, metric)
    // pair makes reposts idempotent (final value wins).
    for (const event of data.events) {
      await db.rumEvent.upsert({
        where: { sessionId_metric: { sessionId: data.sessionId, metric: event.metric } },
        create: {
          userId: user.id,
          metric: event.metric,
          value: event.value,
          rating: event.rating,
          navigationType: event.navigationType,
          path: event.path,
          sessionId: data.sessionId,
          userAgent: event.userAgent || userAgent,
        },
        update: {
          value: event.value,
          rating: event.rating,
          navigationType: event.navigationType,
          path: event.path,
        },
      });
    }
    return NextResponse.json({ ok: true, stored: data.events.length });
  } catch (err) {
    return errorResponse(err);
  }
}

// GET /api/rum: the owner's inspection surface — p75 per metric over the
// user's most recent 200 events (all metrics, most-recent-first), then
// filtered per metric: a single-user-scale approximation of per-metric
// windows (the CWV convention: field data is reported at p75), plus the
// total sample count, the 10 most recent events, and (S20 v3) the
// per-metric `trends` — the ≤ 20 most recent values in chronological
// order (oldest → newest), the sparkline source for the /rum panel's
// cards. The visible surface is the /rum diagnostics panel (S19/S20);
// this endpoint remains the scriptable contract (curl) and the bulk dump
// lives at GET /api/rum/export.
export async function GET() {
  try {
    const user = await requireUser();
    const events = await db.rumEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        metric: true,
        value: true,
        rating: true,
        navigationType: true,
        path: true,
        sessionId: true,
        createdAt: true,
      },
    });

    const p75: Record<string, number> = {};
    const trends: Record<string, number[]> = {};
    for (const metric of ["LCP", "INP", "CLS", "FCP", "TTFB"] as const) {
      const values = events.filter((e) => e.metric === metric).map((e) => e.value);
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        // Nearest-rank p75: ceil(0.75 * n) - 1 (the CWV reporting rule).
        const rank = Math.max(0, Math.ceil(0.75 * sorted.length) - 1);
        p75[metric] = sorted[rank]!;
        // S20: the sparkline series — the 20 most recent values of this
        // metric (values is desc), reversed to chronological order.
        trends[metric] = values.slice(0, 20).reverse();
      }
    }

    const total = await db.rumEvent.count({ where: { userId: user.id } });
    return NextResponse.json({ p75, samples: events.length, total, recent: events.slice(0, 10), trends });
  } catch (err) {
    return errorResponse(err);
  }
}
