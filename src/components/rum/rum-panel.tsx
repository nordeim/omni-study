"use client";

import * as React from "react";
import { Activity, RefreshCw } from "lucide-react";
import { apiGet, ApiError } from "@/lib/api";
import { useThemeStore } from "@/lib/store";
import type { PublicUserShape } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  buildPanelRows,
  buildSparklinePoints,
  RUM_METRIC_LABELS,
  type CwvRating,
  type RumGetAggregate,
  type RumPanelCard,
} from "@/lib/rum-diagnostics";

// RumPanel — the RUM diagnostics panel (S19, ADR-017).
//
// The owner-facing visible surface for the p75 field data the S18 beacon
// collects. The reference has nothing like this — pure SUPERSET, and it
// adds ZERO chrome to any parity-pinned surface: the panel lives at the
// URL /rum (server-gated — src/app/rum/page.tsx redirects anonymous
// visitors to /login before any render) and is linked from NOWHERE
// (an e2e guard pins the shell link-free; the owner navigates directly,
// per README + DEPLOYMENT.md §8).
//
// Theming: the layout's pre-paint boot script already applied the cached
// theme; on mount the panel loads /api/auth/me and calls
// useThemeStore.loadFromUser — exactly the shell's pattern — so the
// account's dark mode + accent apply. The cards ride sf-card + the
// standard Tailwind utilities (the .dark variant contract in
// globals.css), so dark mode and the 7 accents work with no new CSS.
//
// Data: GET /api/rum (the S18 aggregate — p75 per metric, samples,
// total, the 10 most recent events). The display model is built by the
// pure seam (buildPanelRows); this component only renders + refreshes.

const RATING_VARIANT: Record<CwvRating, "success" | "warning" | "destructive"> = {
  good: "success",
  "needs-improvement": "warning",
  poor: "destructive",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// S20 (v3): the sparkline viewport — a non-uniformly scaled viewBox
// (preserveAspectRatio="none") whose stroke stays uniform via
// vectorEffect="non-scaling-stroke". The geometry comes from the pure
// seam (buildSparklinePoints — unit-pinned, edge cases first-class).
const SPARK_WIDTH = 100;
const SPARK_HEIGHT = 28;

function MetricCard({ card }: { card: RumPanelCard }) {
  const spark = buildSparklinePoints(card.points, SPARK_WIDTH, SPARK_HEIGHT);
  return (
    <div className="sf-card flex flex-col gap-2 p-4">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
          {card.formatted ?? <span className="text-base font-normal text-slate-400 dark:text-slate-500">—</span>}
        </p>
        {card.rating ? (
          <Badge variant={RATING_VARIANT[card.rating]}>
            {card.rating === "needs-improvement" ? "needs improvement" : card.rating}
          </Badge>
        ) : null}
      </div>
      {spark.length > 0 ? (
        // Decorative trend line (aria-hidden): the accent token themes it
        // across the 7 accents + dark mode with no new CSS.
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
          preserveAspectRatio="none"
          className="h-7 w-full"
        >
          <polyline
            fill="none"
            stroke="rgb(var(--sf-primary))"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            points={spark.map((p) => `${p.x},${p.y}`).join(" ")}
          />
        </svg>
      ) : null}
      <p className="text-[11px] leading-4 text-slate-400 dark:text-slate-500">
        {card.metric}
        {card.sampled ? " · p75" : " · no samples yet"}
      </p>
    </div>
  );
}

export function RumPanel() {
  const [state, setState] = React.useState<"loading" | "ready" | "error">("loading");
  const [aggregate, setAggregate] = React.useState<RumGetAggregate | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const loadFromUser = useThemeStore((s) => s.loadFromUser);

  const loadAggregate = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await apiGet<RumGetAggregate>("/api/rum");
      setAggregate(data);
      setState("ready");
    } catch {
      setState((prev) => (prev === "loading" ? "error" : prev));
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // The shell's own pattern: the auth call carries the theme (the
        // boot script already painted the cached theme pre-hydration).
        // The server gate already redirected anonymous visitors — this
        // is defense in depth for a stale page after a sign-out.
        const { user } = await apiGet<{ user: PublicUserShape }>("/api/auth/me");
        if (cancelled) return;
        loadFromUser(user);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        // Non-auth failures fall through — the aggregate fetch below owns
        // the panel's own error surface.
      }
      void loadAggregate();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAggregate, loadFromUser]);

  const rows = aggregate ? buildPanelRows(aggregate) : null;

  return (
    <div className="sf-canvas min-h-screen">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: "rgb(var(--sf-primary))" }}
            >
              <Activity className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Performance Diagnostics</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-user Core Web Vitals from your own visits, reported at p75 — the field-data convention.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-50"
            >
              Back to app
            </a>
            {/* S20: a real navigation link — the session cookie rides it; the
                browser downloads the CSV. Authed like every API route. */}
            <a
              href="/api/rum/export"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground dark:text-slate-200 dark:hover:text-slate-50"
            >
              Export CSV
            </a>
            <Button variant="outline" size="sm" onClick={() => void loadAggregate()} disabled={refreshing || state === "loading"}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} strokeWidth={1.75} />
              Refresh
            </Button>
          </div>
        </header>

        {state === "loading" ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">Loading field data…</p>
        ) : state === "error" ? (
          <div className="sf-card flex flex-col gap-3 p-6">
            <p className="text-sm text-slate-700 dark:text-slate-300">Could not load the field data.</p>
            <Button size="sm" className="w-fit" onClick={() => void loadAggregate()}>
              Try again
            </Button>
          </div>
        ) : rows ? (
          <>
            {!rows.hasData ? (
              <div className="sf-card p-6">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  No field data yet. Browse the app and come back — the beacon reports on every visit.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {rows.samples} {rows.samples === 1 ? "sample" : "samples"} in the p75 window · {rows.total} total{" "}
                {rows.total === 1 ? "event" : "events"}
              </p>
            )}

            <section aria-label="Core Web Vitals at p75" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {rows.cards.map((card) => (
                <MetricCard key={card.metric} card={card} />
              ))}
            </section>

            <section aria-label="Recent samples" className="sf-card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    <th className="px-4 py-3 font-medium">Metric</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Path</th>
                    <th className="px-4 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.recent.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                        No recent samples yet.
                      </td>
                    </tr>
                  ) : (
                    rows.recent.map((e, i) => (
                      <tr
                        key={`${e.sessionId}-${e.metric}-${i}`}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                          {RUM_METRIC_LABELS[e.metric as keyof typeof RUM_METRIC_LABELS] ?? e.metric}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-700 dark:text-slate-300">
                          {e.metric === "CLS" ? e.value.toFixed(2) : `${Math.round(e.value)} ms`}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">{e.rating}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-slate-500 dark:text-slate-400">{e.path || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">{formatWhen(e.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>

            <footer className="text-xs leading-5 text-slate-400 dark:text-slate-500">
              Good bounds — TTFB ≤ 800 ms · FCP ≤ 1800 ms · LCP ≤ 2500 ms · CLS ≤ 0.10 · INP ≤ 200 ms. The p75 window
              covers your most recent 200 events; unsampled metrics simply have no visits reporting them yet. Each
              card's trend line shows that metric's 20 most recent samples (oldest → newest); Export CSV downloads
              your most recent 2000 events.
            </footer>
          </>
        ) : null}
      </main>
    </div>
  );
}
