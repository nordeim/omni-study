# Remediation Plan — Session 18 (S18): the RUM hook + Docker packaging

**Audit surfaces (this session, session-27):** the standing checks all ran
GREEN on arrival — the mobile-drawer check (backdrop equivalence, 288px
panel, 20 links, no footer, Escape-close superset), the baseline gates
(lint ✓ tsc ✓ 158 unit ✓ against the S17 codebase), and the reference
re-sweep: **the reference is UNCHANGED since S17** — its account is still
zero-data (0/0 tasks, 0 pending, 0 due soon, 0h focus), its Settings tabs
carry exactly the S17-measured structure (school "Lincoln High", Grade
Level, Daily Study Goal: 4 hours, Account created 9/28/2026, the Enable
Notifications master toggle, the per-tab headers, the Subjects/Holidays
zero-empty states), and the branding split stays stable (title
"AcademiaFlow (Copy)" vs in-app "StudyFlow" — the documented non-gap).
The clone-side Settings sweep matches all five tab bodies. The CWV audit
on the freshly-built standalone: **CLS 0.00 on every scenario** (the S16
load-stability contract intact), login LCP GOOD everywhere, dashboard
mobile-throttled LCP 2640ms NI (the documented S16 band; the reference
measures POOR there at 4284ms with CLS 0.261).

**The governing decision.** With the parity backlog empty (the reference
unchanged, the S17 iteration landed), the session executes the two
standing backlog items from the session-24 list: (a) the **RUM hook** —
web-vitals reporting to an in-app endpoint, the production-observability
superset feature the reference does not have; (b) the **Docker packaging
pass** — the DEPLOYMENT.md walkthrough for one-command containerized
deployment.

---

## Evidence (measured this session)

| Check | Result |
|---|---|
| Mobile drawer (390x844, both apps) | GREEN — backdrop oklab(0 0 0 / 0.2)+blur(4px), 288px panel, 20 links, no footer, Escape-close |
| Baseline gates | lint ✓ tsc ✓ 158 unit ✓ (the documented S17 state) |
| Reference account state | UNCHANGED since S17 (zero-data, profile values intact) |
| Reference Settings five-tab sweep | matches S17 measurements exactly (all headers/fields/empty states) |
| Clone Settings five-tab sweep | parity ✓ on every tab (Profile study fields + Save Profile; Notifications master + 4 superset rows; Subjects/Holidays headers; Appearance line) |
| CWV (fresh standalone :3200) | clone CLS 0.00 ×7 scenarios; LCP GOOD ×5, NI ×2 (throttled mobile — the S16 band); reference: mobile POOR/POOR |
| Reference nav inventory | 20 views, unchanged |

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no new parity surface exists to
   chase this session; the parity work is verification-only (all GREEN).
2. **The reference's mobile two-pane squeeze + greeting flash** remain
   the documented S17 non-gaps (the clone's stacked fallbacks and
   pre-warmed paint stay as the supersets).
3. **No UI readout surface for the RUM data in v1** — the GET endpoint
   is the inspection surface (curl). A visible panel would add chrome to
   pinned surfaces; the beacon renders null (zero DOM) so visual parity
   is preserved byte-for-byte. A future iteration may surface p75s in a
   diagnostics panel if the owner wants one.
4. **The login page is not instrumented** — an unauthenticated beacon
   endpoint is an abuse surface; the login CWV is already pinned by
   `s16-perf-parity.spec.ts` (LCP 632ms throttled-mobile GOOD vs the
   reference's 7540ms POOR).

---

## Families and fixes

### S18-A (HIGH) — the RUM collection pipeline (functional superset)

**Library:** `web-vitals@6` (added). Metric shape: `{ name: 'CLS'|'FCP'|
'INP'|'LCP'|'TTFB', value, rating: 'good'|'needs-improvement'|'poor',
navigationType, id }`.

**Data model** (`prisma/schema.prisma`): a new `RumEvent` model —
additive, no existing model changes:

```prisma
model RumEvent {
  id             String   @id @default(cuid())
  userId         String
  metric         String   // TTFB | FCP | LCP | CLS | INP
  value          Float    // ms (CLS is unitless)
  rating         String   // good | needs-improvement | poor
  navigationType String   @default("navigate")
  path           String   @default("")   // SPA path at report time (bounded 200)
  sessionId      String   @default("")   // one per pageload (crypto UUID)
  userAgent      String   @default("")   // bounded 300
  createdAt      DateTime @default(now())
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([sessionId, metric])   // upsert dedupe — the final value wins
  @@index([userId, createdAt])
}
```

**Seam** (`src/lib/validation.ts`): `rumEventSchema` (metric enum, value
non-negative float, rating enum, navigationType enum, bounded path/
sessionId/userAgent) + `rumBatchSchema` (the POST body: `{ sessionId,
events: rumEventSchema[] }` with a 10-event cap).

**Route** (`src/app/api/rum/route.ts`):
- `POST` — `withUser` + `parseWith(rumBatchSchema)` +
  `checkRateLimit(\`rum:${user.id}\`, 1000)` (15-min window; the e2e
  suite drives ~250 shell loads × ~2-3 flushes — the budget covers the
  suite AND bounds abuse on the auth-gated write surface). Each event
  UPSERTS on `(sessionId, metric)` — a re-reported metric updates its
  value (the web-vitals final-value-wins semantics), never duplicates.
- `GET` — `withUser`; returns `{ p75, samples, recent }`: p75 per metric
  over the user's most recent 200 events per metric, the total sample
  count, and the 10 most recent events. Single-user scale — fetch + JS
  aggregation, no SQL percentiles.

**Client** (`src/components/rum-beacon.tsx`): a `"use client"` component
that renders **null** (zero DOM — the byte-parity guards stay green).
On mount (the authed shell only — mounted in `src/app/page.tsx` next to
`ConnectivityBanner`): dynamic-import `web-vitals`, register
`onTTFB/onFCP/onLCP/onCLS/onINP`, buffer reported metrics, and flush ONE
batched `fetch("/api/rum", { method: "POST", keepalive: true,
credentials: "same-origin" })` per microtask batch (TTFB+FCP landing
together = one POST). The `sessionId` is one `crypto.randomUUID()` per
pageload. A `pagehide`/`visibilitychange` handler flushes the finals
(LCP/CLS/INP report at hide). Failures are swallowed (a monitoring
beacon must never surface errors — no toast, no console spam beyond a
debug-level guard).

**Store/superset impact:** none — no visible chrome, no store changes,
no new env vars.

### S18-B (MEDIUM) — Docker packaging (the DEPLOYMENT.md walkthrough)

- `Dockerfile` — multi-stage: (1) `oven/bun` deps+build stage (`bun
  install`, `bun run db:generate`-equivalent prisma generate, `bun run
  build`), (2) `node:22-slim` runtime copying `.next/standalone` +
  `.next/static` + `public/` + `prisma/schema.prisma` (the db-path
  anchor contract). `AUTH_SECRET`/`NEXT_PUBLIC_SITE_URL`/`DATABASE_URL`
  (absolute `file:/data/custom.db`) at runtime; `/data` volume for the
  SQLite file; `db:push`+`db:seed` via a one-shot profile or the
  documented exec.
- `.dockerignore` — node_modules, .next, db, docs, tests, skills,
  dev.log.
- `docker-compose.yml` — the app service + the `db-data` volume +
  env-file passthrough, healthcheck on `/api/health`.
- `docs/DEPLOYMENT.md` — a new §Docker section walking the build/run/
  seed/init flow and the auth-env contract.
- **Honest caveat (documented in the plan + DEPLOYMENT.md):** the dev
  sandbox has no Docker daemon — the artifacts are validated
  structurally (the standalone layout, the db-path absolute-URL rule
  pinned by `tests/db-path.test.ts`, the health endpoint) but the
  container build itself is not executed here; the walkthrough marks
  the first `docker compose up` on the owner's Docker host as the
  remaining verification step.

### S18-C — docs alignment

README (badge/counts + the Observability feature row + Docker section
pointer), AGENTS.md (the RUM contract + commands + counts), CLAUDE.md
(contract + counts), PAD (ADR-016 + the RumEvent model in the data
architecture), SKILL.md (AP-66: the beacon contract + the
final-value-wins upsert pattern), `.env.example` (audited — no new env
vars), this plan's execution log, `worklog.md`, the session narrative.

---

## TDD order

1. **RED unit** — `tests/validation.test.ts` extends: `rumEventSchema`
   accepts each metric/rating/navigationType; rejects an unknown metric,
   a negative value, an unknown rating, an over-long path; the batch
   schema caps at 10 events and requires a sessionId.
2. **RED e2e** — `tests/e2e/s18-rum.spec.ts` (demo-user storageState
   context; NO new registrations — the register budget stays 9/10):
   - **beacon journey:** load `/` (the shell), wait for the beacon's
     POST(s), then `GET /api/rum` via the request fixture → `p75` has ≥1
     metric key and `recent` contains an event whose `metric` is TTFB or
     FCP with a sane rating; `samples ≥ 1`.
   - **API contract:** a direct `POST /api/rum` with a valid batch → 200
     → the event appears in `recent` (most-recent-first); reposting the
     SAME (sessionId, metric) → the row is UPDATED (upsert — the count
     does not grow, the value changes); an invalid metric → 400 with
     the `{ error }` envelope; an unauthenticated POST (fresh context,
     no storageState) → 401.
   - **zero-chrome guard:** the rendered `<body>` of `/` contains no
     beacon DOM (`[data-rum]` absent / the byte-parity specs stay green
     untouched).
3. **GREEN** — schema → `db:push` → validation seam → the route (POST
   upserts + GET aggregates) → the beacon component → the page.tsx
   mount.
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone
   Settings sweep; the CWV spot-check (CLS still 0.00 — the beacon must
   not shift anything).
6. Evidence captures: the network panel firing `/api/rum` POSTs + the
   GET JSON (committed under `docs/screenshots/s18-*.png` via a
   committed capture script).
7. Docs (S18-C) + the 3-commit pattern + the SSH-wrapper push.

## Risks

- **POST volume during the e2e suite:** every shell-loading spec fires
  the beacon (~250 loads × 2-3 batched flushes ≈ 500-750 POSTs) — the
  1000/15-min per-user budget covers it; the beacon swallows 429s
  silently (fire-and-forget), so even a budget miss degrades to
  missing samples, never a spec failure. The s18 spec itself asserts
  only its OWN posted events (deterministic) plus the beacon's TTFB/FCP
  arrival (always reported early, before any budget pressure).
- **The unique constraint is global** (`sessionId, metric`) — sessionIds
  are crypto UUIDs; cross-user collision is negligible.
- **The e2e db accumulates RumEvent rows across runs** (scratch db) —
  the s18 spec asserts on recency order and its own rows, never on
  absolute counts; `bun run db:reset` clears it.
- **web-vitals v6 types** are strict (`MetricType` union) — the beacon
  types its callback as `(m: MetricType) => void`.
- **The dev server must be restarted after the schema push** (AP-65b —
  the stale-Prisma-client incident): push, regenerate, THEN restart
  before diagnosing anything.
- **Docker artifacts are authored, not container-built here** (no
  daemon) — the caveat is documented; the app code itself is unaffected.

---

## Execution log (post-completion)

**TDD observed.** RED unit: `tests/validation.test.ts` — 7 designed
failures (the metric/rating/navigationType enums, the value bounds, the
batch cap + sessionId bound) — the schemas didn't exist, exactly as
planned. RED e2e: `tests/e2e/s18-rum.spec.ts` — 4 designed failures
(the absent `/api/rum` route: the beacon journey, the POST contract, the
400, the 401); the zero-chrome guard passed on arrival (the guard
convention — it pins the absence forever).

**GREEN (families):** the `RumEvent` model (additive `db:push`, 22
models now) + the `rumEventSchema`/`rumBatchSchema` seam → the
`POST/GET /api/rum` route (auth-gated, `checkRateLimit("rum:${id}",
1000)`, upsert-on-(sessionId, metric), p75 nearest-rank aggregation) →
the `<RumBeacon />` client component (null-render, dynamic
web-vitals import, microtask-batched keepalive flushes, the
visibilitychange/pagehide finals flush, all failures swallowed) → the
page.tsx mount beside ConnectivityBanner.

**One honest iteration during GREEN.** web-vitals v6's `onXXX` callbacks
return VOID — the planned `unregister` pattern (a returned stop
function, the v4/v5 API) failed typecheck; disposal now gates INSIDE
the callback (`if (disposed) return`). Documented as AP-66(a).

**One test corrected against the seam (not the seam against the
test).** The sessionId bound belongs on the BATCH schema (one per POST
body), not the event — the first RED run misplaced it; the test was
fixed to bound the event's path/userAgent and the batch's sessionId.

**Gates.** lint ✓ · tsc ✓ · **165 unit ✓** (158 + 7 new) · build ✓ ·
**254 e2e ✓** (cold `db/e2e.db`, 4.4 min — the beacon fired on every
shell-loading spec, ~500+ real POSTs absorbed by the 1000/15-min
budget with ZERO suite interference) = **419 tests green** — the 249
prior pins untouched.

**Docker (S18-B).** The artifacts (Dockerfile / .dockerignore /
docker-compose.yml / DEPLOYMENT.md §8) were validated WITHOUT a Docker
daemon via `scripts/docker-layout-sim-s27.sh` — a faithful local
simulation of the runtime stage's filesystem (prod-deps install → the
standalone overlay in the COPY order → src/lib + prisma → the db-rm
guard → `file:<abs>/custom.db`): db push ✓, seed ✓ (the src/lib import
chain works), boot ✓, `/api/health` `{"status":"ok","db":"up"}` ✓,
`/login` 200 ✓, `POST /api/rum` anon → 401 ✓, the SQLite file on the
"volume" ✓. TWO simulation bugs found + fixed on the way (the `cp -r`
nesting divergence — AP-66(c) — and the stale-db discovery — AP-66(b),
now guarded by `RUN rm -rf /app/db` in the image). The first real
`docker compose --profile init up` on the owner's Docker host is the
remaining verification step (documented in DEPLOYMENT.md §8 + the
compose header).

**Verification re-runs.** The standing drawer check GREEN on arrival;
the reference re-sweep UNCHANGED since S17 (zero-data account, stable
branding, all five Settings tabs matching); the clone Settings sweep
parity ✓; the CWV re-audit CLS 0.00 on every scenario (the beacon adds
zero layout impact).

**Evidence.** 4 captures via the committed
`scripts/capture-s18-evidence.mjs` (the beacon-live dashboard desktop +
mobile, the GET /api/rum aggregate page, the un-instrumented login) +
`docs/screenshots/s18-rum-beacon-posts.json` (the captured beacon POST
payloads — sessionId, TTFB/FCP values, ratings, paths).

**Docs aligned.** README (badge 419, the RUM + Docker feature rows, the
`/api/rum` endpoint row, counts 165/254, the session-18 plan row, the
captures line, 22 models), AGENTS.md (the capture + sim commands, the
RUM observability + Docker contracts, counts), CLAUDE.md (the contracts
+ the S18 seams in the pyramid + counts), PAD (ADR-016 + the ER model +
22-model counts), SKILL.md (AP-66 + counts). `.env.example` audited —
no changes (no new env vars: the beacon reads none; the compose-level
STUDYFLOW_PORT is a compose variable, not an app env var).
