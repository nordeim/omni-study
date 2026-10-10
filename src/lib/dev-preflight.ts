// The S31 dev-server boot-stability seam.
//
// WHY THIS EXISTS (the session-31 finding): a stale Turbopack `.next/dev`
// cache can put a dev-server route into a sustained full-page reload loop
// (captured: 17+ main-frame navigations per 15 s on /login; React never
// hydrates; form fills are discarded on every reload). The loop SURVIVES a
// daemon restart — the S9 lesson's "restart the daemon cleanly" remedy is
// insufficient for this variant; only `rm -rf .next/dev` clears it. The
// browser-context audits that assume a hydrated, stable dev server then
// fail OPAQUELY (a 30 s click timeout naming the disabled button, not the
// cache) — an environment failure dressed as an app defect (the S28
// phantom-finding lesson's mirror image).
//
// This seam classifies the measured boot signals into the honest verdict +
// remedy. Pure logic only (explicit args; never touches a browser) — the
// runner `scripts/dev-server-preflight.mjs` owns the measurement and prints
// the self-describing envelope (the S27 doctrine).
//
// Precedence (the S28 louder-finding-wins doctrine): unreachable beats
// everything (no measurement is possible); the reload loop beats both a
// mid-window hydration reading and the no-hydration signal (the loop names
// the actual cause AND the actual remedy).

/** Main-frame same-path navigations in the fixed post-load window that
 *  indicate a reload LOOP rather than legitimate HMR full-reloads. Derived
 *  from the measured classes: a healthy boot observes 0 post-load
 *  navigations (first-compile may legitimately full-reload once or twice);
 *  the captured loop state sustained ~1 navigation/second. 5 sits between
 *  with margin on both sides. Unit-pinned at the boundary. */
export const NAV_LOOP_THRESHOLD = 5;

export type BootVerdict = "green" | "reload-loop" | "no-hydration" | "unreachable";

export interface BootStabilityInput {
  /** The initial page load succeeded (a connection failure is its own class — a dead server is not a stale cache). */
  reachable: boolean;
  /** Main-frame same-path navigations observed in the fixed post-load window. */
  navigations: number;
  /** The login submit button enabled after both fields were filled — requires hydrated React + landed input events. */
  hydrated: boolean;
}

export interface BootStabilityVerdict {
  verdict: BootVerdict;
  /** null on green; names the class-specific remedy otherwise. */
  remedy: string | null;
}

export function classifyBootStability(input: BootStabilityInput): BootStabilityVerdict {
  // 1. A dead server gets the start-the-server remedy — NEVER the cache
  //    clear (the honest-diagnosis guard: each class names its own remedy).
  if (!input.reachable) {
    return {
      verdict: "unreachable",
      remedy: "Dev server not reachable — start it (bun run dev) and re-run the preflight.",
    };
  }

  // 2. The reload loop — the loudest finding. The stale Turbopack cache
  //    survives a daemon restart; only the cache clear removes it.
  if (input.navigations >= NAV_LOOP_THRESHOLD) {
    return {
      verdict: "reload-loop",
      remedy:
        "Dev server route is in a full-page reload loop — stale Turbopack cache. " +
        "Stop the daemon, run: rm -rf .next/dev, restart (bun run dev), re-run this preflight. " +
        "A daemon restart alone does NOT clear it (the S9 lesson extended).",
    };
  }

  // 3. Navigation-stable but React never attached — the S9 silent class.
  //    Staged remedy: slow first compile → stale daemon state → stale cache.
  if (!input.hydrated) {
    return {
      verdict: "no-hydration",
      remedy:
        "Page is navigation-stable but never hydrated — retry once (a first hit compiles slowly); " +
        "if it persists, restart the dev daemon; if it STILL persists, stop the daemon, " +
        "rm -rf .next/dev, and restart (bun run dev).",
    };
  }

  // 4. Hydrated and navigation-stable.
  return { verdict: "green", remedy: null };
}
