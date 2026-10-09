// S19 (ADR-017) — the RUM diagnostics seam.
//
// The owner-facing panel at /rum renders the GET /api/rum aggregate
// (p75 per metric + recent samples). Everything display-logical is a PURE
// function in this module so the unit layer can pin it end-to-end:
//
//  - classifyP75 re-derives the rating from the p75 VALUE via the public
//    CWV bounds — the per-event `rating` field is the beacon's
//    in-the-moment call for THAT visit; the panel reports field data at
//    p75 (the CrUX convention), and a p75 that crosses a threshold is a
//    different answer than any single visit's rating.
//  - formatMetricValue renders the ms metrics at 0dp (field data has no
//    sub-ms meaning) and CLS unitless at 2dp.
//  - buildPanelRows maps the GET aggregate into the display model: one
//    card per metric (in RUM_METRIC_ORDER) whether or not it has been
//    sampled, the hasData flag (the empty state), and the recent samples
//    passed through untouched (the caller formats times — purity keeps
//    this testable).
//
// The thresholds are the public CWV rating bounds (web.dev/vitals):
//   TTFB  good ≤ 800ms,  NI ≤ 1800ms
//   FCP   good ≤ 1800ms, NI ≤ 3000ms
//   LCP   good ≤ 2500ms, NI ≤ 4000ms
//   CLS   good ≤ 0.1,    NI ≤ 0.25    (unitless)
//   INP   good ≤ 200ms,  NI ≤ 500ms

export const RUM_METRIC_ORDER = ["TTFB", "FCP", "LCP", "CLS", "INP"] as const;

export type RumMetric = (typeof RUM_METRIC_ORDER)[number];

export const RUM_METRIC_LABELS: Record<RumMetric, string> = {
  TTFB: "Time to First Byte",
  FCP: "First Contentful Paint",
  LCP: "Largest Contentful Paint",
  CLS: "Cumulative Layout Shift",
  INP: "Interaction to Next Paint",
};

export interface CwvBounds {
  /** Inclusive upper bound for the "good" rating. */
  good: number;
  /** Inclusive upper bound for the "needs-improvement" rating. */
  ni: number;
}

export const CWV_THRESHOLDS: Record<RumMetric, CwvBounds> = {
  TTFB: { good: 800, ni: 1800 },
  FCP: { good: 1800, ni: 3000 },
  LCP: { good: 2500, ni: 4000 },
  CLS: { good: 0.1, ni: 0.25 },
  INP: { good: 200, ni: 500 },
};

export type CwvRating = "good" | "needs-improvement" | "poor";

/** Derive the CWV rating from a p75 value via the public bounds. */
export function classifyP75(metric: RumMetric, value: number): CwvRating {
  const bounds = CWV_THRESHOLDS[metric];
  if (value <= bounds.good) return "good";
  if (value <= bounds.ni) return "needs-improvement";
  return "poor";
}

/** Render a metric value for the owner: ms at 0dp, CLS unitless at 2dp. */
export function formatMetricValue(metric: RumMetric, value: number): string {
  if (metric === "CLS") return value.toFixed(2);
  return `${Math.round(value)} ms`;
}

/** The GET /api/rum response contract (typed once — the panel + tests ride it). */
export interface RumRecentEvent {
  metric: string;
  value: number;
  rating: string;
  navigationType: string;
  path: string;
  sessionId: string;
  createdAt: string;
}

export interface RumGetAggregate {
  p75: Record<string, number>;
  samples: number;
  total: number;
  recent: RumRecentEvent[];
}

export interface RumPanelCard {
  metric: RumMetric;
  label: string;
  /** null when the metric has no p75 in the window (unsampled). */
  formatted: string | null;
  /** The p75 value, null when unsampled. */
  value: number | null;
  /** Derived from the p75 value — only meaningful when sampled. */
  rating: CwvRating | null;
  sampled: boolean;
}

export interface RumPanelRows {
  cards: RumPanelCard[];
  /** samples > 0 — the panel's empty-state flag. */
  hasData: boolean;
  samples: number;
  total: number;
  /** The GET's most-recent-first samples, untouched (the caller formats times). */
  recent: RumRecentEvent[];
}

/** Map the GET aggregate into the display model (pure — no Date, no DOM). */
export function buildPanelRows(aggregate: RumGetAggregate): RumPanelRows {
  const cards: RumPanelCard[] = RUM_METRIC_ORDER.map((metric) => {
    const value = aggregate.p75[metric];
    if (typeof value === "number" && Number.isFinite(value)) {
      return {
        metric,
        label: RUM_METRIC_LABELS[metric],
        formatted: formatMetricValue(metric, value),
        value,
        rating: classifyP75(metric, value),
        sampled: true,
      };
    }
    return {
      metric,
      label: RUM_METRIC_LABELS[metric],
      formatted: null,
      value: null,
      rating: null,
      sampled: false,
    };
  });
  return {
    cards,
    hasData: aggregate.samples > 0,
    samples: aggregate.samples,
    total: aggregate.total,
    recent: aggregate.recent,
  };
}
