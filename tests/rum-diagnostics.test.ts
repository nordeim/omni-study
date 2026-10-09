// S19 — the RUM diagnostics seam (docs/remediation-plan-session19.md).
//
// The panel at /rum renders the GET /api/rum aggregate. Everything
// display-logical is a PURE function here so the unit layer can pin it:
// the public CWV rating bounds (classifyP75 re-derives the rating from
// the p75 VALUE — the per-event ratings are the beacon's in-the-moment
// calls, p75 is what field data reports), the value formatting (ms 0dp,
// CLS unitless 2dp), and the display-model builder (cards + empty state).
import { describe, expect, it } from "vitest";
import {
  CWV_THRESHOLDS,
  RUM_METRIC_LABELS,
  RUM_METRIC_ORDER,
  buildPanelRows,
  classifyP75,
  formatMetricValue,
} from "../src/lib/rum-diagnostics";

describe("CWV_THRESHOLDS + RUM_METRIC_ORDER (S19 seam shape)", () => {
  it("covers exactly the web-vitals v6 metric set, in order", () => {
    expect(RUM_METRIC_ORDER).toEqual(["TTFB", "FCP", "LCP", "CLS", "INP"]);
  });

  it("declares good/ni bounds for every metric (and nothing else)", () => {
    expect(Object.keys(CWV_THRESHOLDS).sort()).toEqual(["CLS", "FCP", "INP", "LCP", "TTFB"]);
    for (const bounds of Object.values(CWV_THRESHOLDS)) {
      expect(bounds.good).toBeGreaterThan(0);
      expect(bounds.ni).toBeGreaterThan(bounds.good);
    }
  });

  it("labels every metric with a human name", () => {
    expect(Object.keys(RUM_METRIC_LABELS).sort()).toEqual([...RUM_METRIC_ORDER].sort());
    for (const label of Object.values(RUM_METRIC_LABELS)) {
      expect(label.length).toBeGreaterThan(3);
    }
  });
});

describe("classifyP75 (the public CWV bounds — boundary-exact)", () => {
  it("TTFB: good ≤ 800ms, NI ≤ 1800ms, poor above", () => {
    expect(classifyP75("TTFB", 800)).toBe("good");
    expect(classifyP75("TTFB", 800.5)).toBe("needs-improvement");
    expect(classifyP75("TTFB", 1800)).toBe("needs-improvement");
    expect(classifyP75("TTFB", 1801)).toBe("poor");
  });

  it("FCP: good ≤ 1800ms, NI ≤ 3000ms, poor above", () => {
    expect(classifyP75("FCP", 1800)).toBe("good");
    expect(classifyP75("FCP", 1801)).toBe("needs-improvement");
    expect(classifyP75("FCP", 3000)).toBe("needs-improvement");
    expect(classifyP75("FCP", 3001)).toBe("poor");
  });

  it("LCP: good ≤ 2500ms, NI ≤ 4000ms, poor above", () => {
    expect(classifyP75("LCP", 2500)).toBe("good");
    expect(classifyP75("LCP", 2501)).toBe("needs-improvement");
    expect(classifyP75("LCP", 4000)).toBe("needs-improvement");
    expect(classifyP75("LCP", 4001)).toBe("poor");
  });

  it("CLS: good ≤ 0.1, NI ≤ 0.25, poor above (unitless)", () => {
    expect(classifyP75("CLS", 0.1)).toBe("good");
    expect(classifyP75("CLS", 0.11)).toBe("needs-improvement");
    expect(classifyP75("CLS", 0.25)).toBe("needs-improvement");
    expect(classifyP75("CLS", 0.26)).toBe("poor");
  });

  it("INP: good ≤ 200ms, NI ≤ 500ms, poor above", () => {
    expect(classifyP75("INP", 200)).toBe("good");
    expect(classifyP75("INP", 201)).toBe("needs-improvement");
    expect(classifyP75("INP", 500)).toBe("needs-improvement");
    expect(classifyP75("INP", 501)).toBe("poor");
  });
});

describe("formatMetricValue (ms 0dp — CLS unitless 2dp)", () => {
  it("rounds the ms metrics to whole milliseconds", () => {
    expect(formatMetricValue("LCP", 2345.6)).toBe("2346 ms");
    expect(formatMetricValue("TTFB", 120)).toBe("120 ms");
    expect(formatMetricValue("FCP", 1899.4)).toBe("1899 ms");
    expect(formatMetricValue("INP", 0)).toBe("0 ms");
  });

  it("formats CLS with two decimals, no unit", () => {
    expect(formatMetricValue("CLS", 0.03456)).toBe("0.03");
    expect(formatMetricValue("CLS", 0)).toBe("0.00");
    expect(formatMetricValue("CLS", 0.25)).toBe("0.25");
  });
});

describe("buildPanelRows (the display model)", () => {
  const full = {
    p75: { TTFB: 120, FCP: 1900, LCP: 2345, CLS: 0.03, INP: 210 } as Record<string, number>,
    samples: 42,
    total: 118,
    recent: [
      {
        metric: "LCP",
        value: 2345,
        rating: "good",
        navigationType: "navigate",
        path: "/",
        sessionId: "s1",
        createdAt: "2026-10-09T02:00:00.000Z",
      },
    ],
  };

  it("builds one card per metric, in RUM_METRIC_ORDER, ratings derived from the p75 value", () => {
    const rows = buildPanelRows(full);
    expect(rows.hasData).toBe(true);
    expect(rows.cards.map((c) => c.metric)).toEqual(RUM_METRIC_ORDER);
    const byMetric = Object.fromEntries(rows.cards.map((c) => [c.metric, c]));
    expect(byMetric.TTFB.formatted).toBe("120 ms");
    expect(byMetric.TTFB.rating).toBe("good");
    expect(byMetric.LCP.rating).toBe("good"); // 2345 ≤ 2500
    expect(byMetric.FCP.rating).toBe("needs-improvement"); // 1900 in (1800, 3000]
    expect(byMetric.CLS.formatted).toBe("0.03");
    expect(byMetric.INP.rating).toBe("needs-improvement"); // 210 in (200, 500]
  });

  it("marks unsampled metrics (no p75) as unsampled, keeps the card slot", () => {
    const rows = buildPanelRows({
      p75: { LCP: 3000 },
      samples: 3,
      total: 3,
      recent: [],
    });
    expect(rows.hasData).toBe(true);
    expect(rows.cards).toHaveLength(5);
    const lcp = rows.cards.find((c) => c.metric === "LCP")!;
    expect(lcp.sampled).toBe(true);
    expect(lcp.rating).toBe("needs-improvement"); // 3000 in (2500, 4000]
    for (const card of rows.cards.filter((c) => c.metric !== "LCP")) {
      expect(card.sampled).toBe(false);
      expect(card.formatted).toBeNull();
    }
  });

  it("the empty aggregate renders the no-data state with all five card slots", () => {
    const rows = buildPanelRows({ p75: {}, samples: 0, total: 0, recent: [] });
    expect(rows.hasData).toBe(false);
    expect(rows.cards).toHaveLength(5);
    expect(rows.cards.every((c) => !c.sampled)).toBe(true);
  });

  it("passes the recent samples through untouched (the caller formats times)", () => {
    const rows = buildPanelRows(full);
    expect(rows.recent).toEqual(full.recent);
  });
});
