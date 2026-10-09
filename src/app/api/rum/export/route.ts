import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { buildContentDisposition, errorResponse } from "@/lib/server/http";
import { toRumCsv, type RumRecentEvent } from "@/lib/rum-diagnostics";

// S20 (ADR-018) — the RUM CSV export route.
//
// The bulk-dump twin of the GET /api/rum aggregate: the owner's field
// data as a spreadsheet-ready text/csv download (raw values — analysis
// grade, no display formatting). The body is built by the pure seam
// (toRumCsv — RFC-4180 escaping, unit-pinned); this route owns auth,
// the query, and the download header contract.
//
// Contract: auth-gated (401 JSON for anonymous callers — the API-route
// convention, NOT a redirect), the user's most recent 2000 events in
// CHRONOLOGICAL order (oldest first — the natural reading order for an
// export), and the S13/S14 download headers: attachment disposition via
// buildContentDisposition (the RFC 2183 fallback + RFC 5987 extended
// form), nosniff, and private/no-store (a single-user diagnostics dump
// never belongs in an intermediary cache). No rate limit — a read
// endpoint at single-user scale, the same posture as the GET aggregate.
export async function GET() {
  try {
    const user = await requireUser();
    const events = await db.rumEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 2000,
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

    // Chronological (oldest → newest) — the export reading order.
    const wire: RumRecentEvent[] = [...events].reverse().map((e) => ({
      metric: e.metric,
      value: e.value,
      rating: e.rating,
      navigationType: e.navigationType,
      path: e.path,
      sessionId: e.sessionId,
      createdAt: e.createdAt.toISOString(),
    }));

    const today = new Date().toISOString().slice(0, 10);
    return new NextResponse(toRumCsv(wire), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        // The S13 seam: ASCII-safe fallback + RFC 5987 extended form.
        "Content-Disposition": buildContentDisposition(`studyflow-rum-${today}.csv`),
        // The S14 download contract: no sniffing, no intermediary caching.
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
