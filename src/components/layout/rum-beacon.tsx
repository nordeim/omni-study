"use client";

import * as React from "react";

// RumBeacon — the RUM hook's client side (S18, ADR-016).
//
// A real-user-monitoring beacon: web-vitals v6 (TTFB/FCP/LCP/CLS/INP)
// reported to the in-app endpoint POST /api/rum. The reference has
// nothing like this — pure SUPERSET, production observability for a
// self-hosted app (the S16 audit tooling measured the reference's own
// field performance as POOR/POOR on mobile; this hook gives the clone's
// owner the same visibility into REAL visits).
//
// Design notes:
//  - Renders null — ZERO DOM. The online DOM stays byte-identical (the
//    same contract as ConnectivityBanner; the byte-parity guards and
//    the CLS pins stay green untouched).
//  - Mounted in the AUTHED shell only (src/app/page.tsx): an
//    unauthenticated metrics endpoint is an abuse surface; the login
//    page's CWV is already pinned by s16-perf-parity.spec.ts.
//  - web-vitals is DYNAMICALLY imported — it never lands in the login
//    route's critical bundle, and the ~2KB loads only post-auth.
//  - Batched flush: reported metrics buffer and flush as ONE
//    fetch-keepalive POST per microtask batch (TTFB+FCP landing together
//    = one request). The server UPSERTS on (sessionId, metric), so the
//    final-value-wins re-reports (LCP/CLS/INP report at hide/unload)
//    UPDATE rows in place — never duplicates.
//  - Failures are swallowed entirely: a monitoring beacon must never
//    surface errors (no toast, no console spam — a 429 or a dropped
//    request just means missing samples).
//  - ONE sessionId per mount (crypto.randomUUID) — groups a pageload's
//    reports and carries the upsert identity.

type VitalMetric = {
  name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  navigationType: string;
};

export function RumBeacon() {
  React.useEffect(() => {
    const sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `rum-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let pending: VitalMetric[] = [];
    let flushing = false;
    let disposed = false;

    const flush = async () => {
      if (flushing || pending.length === 0) return;
      flushing = true;
      const events = pending;
      pending = [];
      try {
        await fetch("/api/rum", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sessionId,
            events: events.slice(0, 10).map((m) => ({
              metric: m.name,
              value: Math.round(m.value * 1000) / 1000, // 3dp — CLS keeps precision
              rating: m.rating,
              navigationType: (m.navigationType || "navigate").slice(0, 20),
              path: window.location.pathname.slice(0, 200),
            })),
          }),
          keepalive: true,
          credentials: "same-origin",
        });
      } catch {
        // Swallowed by design — see the header note.
      } finally {
        flushing = false;
        if (pending.length > 0 && !disposed) void flush();
      }
    };

    const onReport = (metric: VitalMetric) => {
      if (disposed) return; // web-vitals v6 exposes no unsubscribe — gate here.
      pending.push(metric);
      if (pending.length >= 10) {
        void flush();
        return;
      }
      // Microtask-batch: metrics landing in the same tick share one POST.
      queueMicrotask(() => void flush());
    };

    // The finals (LCP/CLS/INP) report when the page becomes hidden or
    // unloads — flush the buffer then, before the browser tears down.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onPageHide = () => void flush();

    void import("web-vitals")
      .then(({ onTTFB, onFCP, onLCP, onCLS, onINP }) => {
        // web-vitals v6 returns void (no unsubscribe) — disposal is handled
        // by the disposed gate in onReport.
        onTTFB(onReport);
        onFCP(onReport);
        onLCP(onReport);
        onCLS(onReport);
        onINP(onReport);
      })
      .catch(() => {
        // web-vitals unavailable (offline build edge) — no telemetry, no
        // user impact. Swallowed by design.
      });

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      void flush();
    };
  }, []);

  return null;
}
