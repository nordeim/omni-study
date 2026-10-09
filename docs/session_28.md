# Session 28 — the S18 RUM + Docker iteration narrative

*The session-26 briefing's suggested surfaces were (a) a reference
account-state re-sweep when it next changes, (b) the RUM hook from the
session-24 list, (c) the Docker packaging pass. The re-sweep found the
reference UNCHANGED since S17 (its account still zero-data, the
branding split stable, every Settings tab matching the S17
measurements) — so the session executed the two standing backlog items
as the S18 iteration: the RUM observability hook + the Docker
packaging. 419 tests green (165 unit + 254 e2e).*

---

## What happened

1. **Workspace recovery + baseline.** Fresh clone at `29279d4` (S17
   landed). The five core docs re-read; the environment rebuilt
   (`bun install`, `.env` from `.env.example`, `db:push` + `db:seed`);
   baseline gates matched the documented state (lint ✓ tsc ✓ 158 unit
   ✓); the S17 seams verified present (the 4 User columns, the
   preferences schema fields, `INITIAL_COLLECTIONS`, the s17 spec).

2. **The standing checks all ran GREEN first.** The mobile-drawer check
   (the briefing's priority item): backdrop equivalence + the 288px
   panel + 20 links + no footer + the Escape-close superset. The CWV
   re-audit on a fresh standalone build: **CLS 0.00 on every scenario**
   (the S16 load-stability contract intact), login LCP GOOD everywhere,
   throttled-mobile dashboard LCP 2640ms NI (the documented S16 band —
   the reference measures 4284ms POOR with CLS 0.261 there).

3. **The reference re-sweep (backlog item a): UNCHANGED.** The account
   is still zero-data; the branding split stays stable (title
   "AcademiaFlow (Copy)" vs in-app "StudyFlow" — the documented
   non-gap); the Settings five-tab sweep matches every S17 measurement
   (school "Lincoln High", Grade Level, Daily Study Goal: 4 hours,
   Account created 9/28/2026, the Enable Notifications master toggle,
   the per-tab headers, the zero-empty states). The clone-side sweep
   matches all five tab bodies. **Parity work this session was
   verification-only — all GREEN.** (One probe lesson for the record:
   Radix tab bodies need REAL Playwright clicks; `evaluate`-driven
   `.click()` does not switch Radix tabs.)

4. **The governing decision.** With the parity backlog empty, the
   session-24 backlog items governed: the **RUM hook** — web-vitals
   reporting to an in-app endpoint, the production-observability
   superset the reference does not have — and the **Docker packaging**
   — the DEPLOYMENT.md walkthrough for one-command deployment.

5. **The plan** (`docs/remediation-plan-session18.md`) — S18-A the RUM
   pipeline (the RumEvent model, the Zod batch seam, the auth-gated
   rate-limited upserting route, the null-rendering beacon), S18-B the
   Docker artifacts, S18-C the docs alignment; the non-gaps documented
   (no UI readout panel in v1 — the GET endpoint is the inspection
   surface; the login route deliberately un-instrumented). Validated
   file-by-file before execution.

6. **TDD.** RED: 7 unit failures + 4 e2e failures observed as designed.
   GREEN: `web-vitals@6` + the additive `RumEvent` model (the 22nd) +
   `rumEventSchema`/`rumBatchSchema` + `POST/GET /api/rum` + the
   `<RumBeacon />` component mounted in the authed shell.

7. **Two honest iterations.** (1) web-vitals v6's `onXXX` callbacks
   return VOID — the planned v4/v5-style unregister pattern failed
   typecheck; disposal now gates inside the callback. (2) The
   sessionId bound was misplaced on the event schema by the first RED
   test — it belongs on the batch (one per POST body); the test was
   corrected against the seam, not the seam against the test.

8. **The rate-limit budget was sized by measurement, not guesswork.**
   The beacon fires on EVERY shell-loading e2e spec (~250 loads × 2-3
   batched flushes ≈ 500-750 POSTs per full run) — the 1000/15-min
   per-user budget admits the suite's own traffic with margin; the full
   suite ran GREEN with the beacon live (zero interference, the
   failures-swallowed contract doing its job).

9. **The Docker packaging without a Docker daemon.** The sandbox has no
   Docker — so the runtime layout was validated by FAITHFUL LOCAL
   SIMULATION (`scripts/docker-layout-sim-s27.sh`): the prod-deps
   install → the standalone overlay in the Dockerfile's COPY order →
   `src/lib` + `prisma` → the db-rm guard → the absolute `file:` URL →
   `db push` ✓ → `seed` ✓ → boot ✓ → `/api/health` ok ✓ → `/login` 200
   ✓ → `POST /api/rum` anon 401 ✓ → the SQLite file on the "volume" ✓.
   The first real `docker compose --profile init up` on the owner's
   Docker host is the documented remaining verification step
   (DEPLOYMENT.md §8). TWO real discoveries on the way (both now
   AP-66): the output tracer snapshots the build machine's
   `db/custom.db` INTO `.next/standalone/db/` (a naive
   `COPY .next/standalone` would ship stale database bytes — the image
   now guards with `.dockerignore` + `RUN rm -rf /app/db` + the
   absolute URL), and bash `cp -r src dst` NESTES where Docker COPY
   MERGES (the simulation must copy with `src/.` semantics or it
   diverges from the real build).

10. **Gates + verification.** lint ✓ tsc ✓ **165 unit ✓** (158 + 7
    new) build ✓ **254 e2e ✓** (cold `db/e2e.db`, 4.4 min) = **419
    tests green** — the 249 prior pins untouched. The standing drawer
    check GREEN on arrival; the reference re-sweep GREEN; the CWV
    re-audit CLS 0.00 (the beacon adds zero layout impact).

11. **Evidence + docs.** 4 captures (`docs/screenshots/s18-*.png`) via
    the committed `scripts/capture-s18-evidence.mjs` — the beacon-live
    dashboard (desktop + mobile — visual parity intact), the
    `GET /api/rum` aggregate page, the un-instrumented login — plus
    `s18-rum-beacon-posts.json` (the captured POST payloads: sessionId,
    TTFB/FCP values, ratings, paths). VLM-verified. README/AGENTS/
    CLAUDE/PAD (ADR-016)/SKILL (AP-66)/DEPLOYMENT (§8) aligned;
    `.env.example` audited — no changes (no new env vars). 3-commit
    pattern + SSH wrapper push to main.

## Suggested next surfaces

(a) The first REAL `docker compose --profile init up` on the owner's
Docker host — the one remaining unexecuted verification step (any
divergence is an issue against DEPLOYMENT.md §8); (b) a RUM
diagnostics PANEL if the owner wants a visible surface for the p75s
(v2 — the GET endpoint is v1's inspection surface); (c) the reference
owner is still actively experimenting — re-sweep its account-state
surfaces when they next change (the standing AP-64 discipline); (d)
the audit backlog is otherwise empty — the next iteration is whichever
surface the owner's next brief prioritizes.
