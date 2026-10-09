// S22 (ADR-020) — the server boot guard.
//
// Next.js loads this file's register() once per server boot (dev,
// next start, and the standalone build — NEVER during `next build`,
// validated empirically) and in both the nodejs and edge runtimes; the
// NEXT_RUNTIME guard keeps the check on the Node side only (the edge
// runtime has no process.exit semantics worth relying on and never owns
// the auth secret).
//
// The decision logic lives in the pure seam (src/lib/env-check.ts —
// unit-pinned); this hook only owns the env and the enforcement:
//   fatal → console.error + process.exit(1). The explicit exit is the
//   validated mechanism — a plain throw is CAUGHT by Next ("Failed to
//   prepare server") and the process keeps serving 500s: a silently
//   degraded server is strictly worse than one that refuses to boot.
//   warn → one console.warn line (dev fallback / weak secret); ok →
//   silent.
//
// The relative import (not the "@/…" alias) keeps this special build
// entry alias-independent.

import { authSecretBootStatus } from "./lib/env-check";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const status = authSecretBootStatus(process.env.NODE_ENV, process.env.AUTH_SECRET);

  if (status.level === "fatal") {
    console.error(`[boot] ${status.message}`);
    process.exit(1);
  }
  if (status.level === "warn") {
    console.warn(`[boot] ${status.message}`);
  }
}
