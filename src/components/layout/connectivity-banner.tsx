"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";

// ConnectivityBanner — the global offline indicator (S14-A0).
//
// The audit found every per-request failure path already recovers (the S13
// AI bounce-back, dialogs that keep their forms, SPA navigation on cached
// data) but NOTHING tells the user WHY actions are failing — they discover
// a dropped network one raw "Failed to fetch" toast at a time. This banner
// is the ambient signal: navigator.onLine drives a floating pill that
// appears the moment the browser fires `offline` and disappears on
// `online`.
//
// Design notes:
//  - SUPSET territory (the reference has no offline handling at all).
//  - Renders null while online → the online DOM is byte-identical (the
//    light-mode parity guarantee is structural, not stylistic).
//  - A floating pill (fixed, bottom-center) — zero layout shift, no CLS,
//    touches none of the reference-measured chrome (app bar, sidebar,
//    content offsets).
//  - role="status" + aria-live="polite": the state change announces to
//    screen readers (WCAG 4.1.3 — the same contract the toast stack uses).
//  - useSyncExternalStore subscribes to the browser's online/offline events
//    (the React-idiomatic external-system bridge): the server snapshot
//    assumes online (no hydration mismatch), and a hard load while offline
//    corrects immediately after hydration.

function subscribeToConnectivity(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function ConnectivityBanner() {
  const online = React.useSyncExternalStore(
    subscribeToConnectivity,
    () => navigator.onLine,
    // Server snapshot: assume online — the banner renders null in SSR HTML.
    () => true,
  );

  if (online) return null;

  return (
    <div
      role="status"
      data-offline="true"
      className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 shadow-lg dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
    >
      <WifiOff className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      You&rsquo;re offline — changes can&rsquo;t be saved right now
    </div>
  );
}
