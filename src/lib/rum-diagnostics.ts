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
  /**
   * S20 (v3): per metric, the ≤ 20 most recent values in CHRONOLOGICAL
   * order (oldest → newest) from the same 200-event window — the sparkline
   * source. OPTIONAL for backward compatibility with the S19 contract
   * (an aggregate without trends simply renders trend-free cards).
   */
  trends?: Record<string, number[]>;
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
  /**
   * S20 (v3): the metric's trend values (oldest → newest, non-finite
   * filtered) — the sparkline source; [] when the aggregate carries no
   * trend data for the metric.
   */
  points: number[];
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
    const points = (aggregate.trends?.[metric] ?? []).filter((v) => typeof v === "number" && Number.isFinite(v));
    const value = aggregate.p75[metric];
    if (typeof value === "number" && Number.isFinite(value)) {
      return {
        metric,
        label: RUM_METRIC_LABELS[metric],
        formatted: formatMetricValue(metric, value),
        value,
        rating: classifyP75(metric, value),
        sampled: true,
        points,
      };
    }
    return {
      metric,
      label: RUM_METRIC_LABELS[metric],
      formatted: null,
      value: null,
      rating: null,
      sampled: false,
      points,
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

// ---------------------------------------------------------------------------
// S20 (v3) — the sparkline geometry + the CSV export body. Both pure.
// ---------------------------------------------------------------------------

/** The vertical inset that keeps the sparkline stroke inside the viewBox. */
const SPARKLINE_PAD = 2;

export interface SparkPoint {
  x: number;
  y: number;
}

/**
 * Normalize a value series (oldest → newest) into sparkline coordinates:
 * x evenly spaced over [0, width]; y inverted-normalized (larger value →
 * smaller y) into [PAD, height - PAD]. Edge cases are first-class:
 * an empty series → [] (the caller renders no SVG); a SINGLE value or a
 * flat series (min === max) → a visible centered line (a one-point
 * polyline would be invisible — the seam promotes it to two points).
 */
export function buildSparklinePoints(values: number[], width: number, height: number): SparkPoint[] {
  const series = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (series.length === 0) return [];
  const mid = height / 2;
  if (series.length === 1) {
    return [
      { x: 0, y: mid },
      { x: width, y: mid },
    ];
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min;
  const span = height - 2 * SPARKLINE_PAD;
  return series.map((v, i) => ({
    x: (i * width) / (series.length - 1),
    y: range === 0 ? mid : SPARKLINE_PAD + (1 - (v - min) / range) * span,
  }));
}

/** The CSV export header — the wire column order (raw, analysis-grade). */
const RUM_CSV_HEADER = "metric,value,rating,navigationType,path,sessionId,createdAt";

const RUM_CSV_COLUMNS: Array<(e: RumRecentEvent) => string> = [
  (e) => e.metric,
  (e) => String(e.value),
  (e) => e.rating,
  (e) => e.navigationType,
  (e) => e.path,
  (e) => e.sessionId,
  (e) => e.createdAt,
];

/**
 * RFC-4180 escaping: a field containing a comma, double quote, or newline
 * is wrapped in quotes with inner quotes doubled; other fields pass raw.
 */
function csvField(field: string): string {
  return /[",\r\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
}

/**
 * Build the export body: the header line plus one row per event, in the
 * CALLER's order (the route feeds chronological). Values are RAW — no
 * display formatting (the CSV is analysis-grade, not presentation-grade).
 */
export function toRumCsv(events: RumRecentEvent[]): string {
  const rows = events.map((e) => RUM_CSV_COLUMNS.map((col) => csvField(col(e))).join(","));
  return [RUM_CSV_HEADER, ...rows].join("\n") + "\n";
}
