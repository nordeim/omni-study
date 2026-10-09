# Remediation Plan — Session 19 (S19): the RUM diagnostics panel

**Audit surfaces (this session, session-29 workspace run at `b3b8a0b`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
165 unit ✓ against the S18 codebase), the mobile-drawer check on BOTH apps
(backdrop oklab(0 0 0/0.2)+blur(4px), 288px white panel, 20 links, no
footer, Escape-close superset — the briefing's priority item), and the
reference re-sweep: **the reference is UNCHANGED since S18** — its account
is still zero-data (0/0 stats), its Settings five-tab sweep matches every
S17/S18 measurement (school "Lincoln High", Daily Study Goal: 4 hours,
Account created 9/28/2026, the Enable Notifications master toggle, all five
per-tab headers, the Subjects/Holidays zero-empty states), the branding
split stays stable (title "AcademiaFlow (Copy)" vs in-app "StudyFlow"),
and the nav inventory is still exactly 20 views in the same order.

**The S18 code audit (the recent changes):** the RUM route
(`src/app/api/rum/route.ts`), the beacon
(`src/components/layout/rum-beacon.tsx`), the validation seam, and the
Docker artifacts were reviewed line-by-line — CLEAN. One documentation nit
found: the GET handler's comment says "the user's most recent 200 events
per metric" while the code takes the last 200 events OVERALL then filters
per metric (a reasonable single-user approximation; the comment
overstates). Fixed in passing this session.

**The governing decision.** With the parity backlog empty (the reference
unchanged) and the audit backlog empty (S18 clean), the session executes
the documented next surface from the session-28 narrative: **the RUM
diagnostics panel** — the owner-facing visible surface for the p75 field
data (the S18 v2 option; the GET endpoint was v1's inspection surface,
curl-only). The brief's superset goal ("production ready 'superset' of the
original reference site in terms of functionality while maintaining visual
parity") governs: the panel is a pure functional superset on a surface the
reference does not have, and it adds ZERO chrome to any parity-pinned
surface.

---

## Evidence (measured this session)

| Check | Result |
|---|---|
| Baseline gates (b3b8a0b) | lint ✓ tsc ✓ 165 unit ✓ (the documented S18 state) |
| Mobile drawer (390x844, both apps) | GREEN — backdrop oklab(0 0 0 / 0.2)+blur(4px), 288px panel, 20 links, no footer, Escape-close |
| Reference account state | UNCHANGED since S18 (zero-data, 0/0, profile values intact) |
| Reference Settings five-tab sweep | matches S17/S18 measurements exactly (all headers/fields/empty states) |
| Reference nav inventory | 20 views, same order |
| S18 code audit (route/beacon/seam/Docker) | CLEAN; one comment nit (the GET "per metric" wording) |

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase;
   verification-only parity work (all GREEN).
2. **No nav link to the panel** — the sidebar/drawer/Settings are
   parity-pinned surfaces (20 links, five tabs). The panel lives at the
   URL `/rum` (owner-direct, documented in README + DEPLOYMENT.md §8).
   An explicit e2e guard pins the absence of any `/rum` link in the shell.
3. **The login route stays un-instrumented** (S18 contract) — the panel
   only surfaces AUTHED shell telemetry.
4. **The Docker real-run** remains the owner's step (no daemon here).

---

## Families and fixes

### S19-A (HIGH) — the pure diagnostics seam (`src/lib/rum-diagnostics.ts`)

A dependency-free module the panel (and the tests) ride:

- `RUM_METRIC_ORDER` — TTFB, FCP, LCP, CLS, INP (the web-vitals v6 set).
- `RUM_METRIC_LABELS` — the human names ("Time to First Byte", "First
  Contentful Paint", "Largest Contentful Paint", "Cumulative Layout
  Shift", "Interaction to Next Paint").
- `CWV_THRESHOLDS` — the public CWV rating bounds per metric (TTFB
  800/1800ms, FCP 1800/3000ms, LCP 2500/4000ms, CLS 0.1/0.25, INP
  200/500ms; good ≤ good-bound, NI ≤ ni-bound, poor above).
- `classifyP75(metric, value)` — `'good' | 'needs-improvement' | 'poor'`
  via the thresholds (the panel re-derives the rating from the p75 VALUE —
  the per-event ratings are the beacon's in-the-moment calls; p75 is what
  CrUX/field data reports).
- `formatMetricValue(metric, value)` — `"812 ms"` for the ms metrics
  (0dp — field data has no sub-ms meaning), `"0.04"` for CLS (unitless,
  2dp).
- `RUM_GET_AGGREGATE` TypeScript type — `{ p75: Record<string, number>,
  samples: number, total: number, recent: Array<{metric, value, rating,
  navigationType, path, sessionId, createdAt}> }` (the GET /api/rum
  response contract, typed once).
- `buildPanelRows(aggregate)` — the display model: per-metric card rows
  (label, formatted p75, derived rating, sampled-or-not) in
  RUM_METRIC_ORDER, plus `{ hasData: boolean }` (samples > 0) and the
  recent rows mapped with a bounded display time. Pure: no Date, no DOM —
  the caller formats times (testability).

### S19-B (HIGH) — the route + the panel component

**Route** (`src/app/rum/page.tsx` — a SERVER component):

- `getCurrentUser()` → `redirect("/login")` when unauthenticated (the
  server-side gate — no client flash, the login route's own pattern).
- `export const metadata: Metadata = { title: "Performance Diagnostics" }`
  (the layout's template renders "Performance Diagnostics · StudyFlow").
- Renders `<RumPanel />`.

**Panel** (`src/components/rum/rum-panel.tsx` — a CLIENT component):

- On mount, in parallel: `apiGet("/api/auth/me")` →
  `useThemeStore.loadFromUser(user)` (the panel themes exactly like the
  shell — the boot script already applied the cached theme pre-paint),
  and `apiGet("/api/rum")` → the aggregate. An auth failure redirects to
  `/login` (defense in depth — the server already gated); a RUM fetch
  failure renders an inline retry state.
- Renders: the page header ("Performance Diagnostics" + the one-line
  explainer "Real-user Core Web Vitals from your own visits, reported at
  p75 — the field-data convention."), five metric cards (label, formatted
  p75, the derived rating badge colored good/needs-improvement/poor), a
  samples line ("N samples in the p75 window · M total events"), the
  recent-samples table (Metric, Value, Rating, Path, When — the GET's 10
  most recent), and a Refresh button (re-fetches GET /api/rum).
- Empty state (samples 0): "No field data yet. Browse the app and come
  back — the beacon reports on every visit."
- Styling: `sf-canvas`/`sf-card` + standard Tailwind utilities +
  `rgb(var(--sf-primary))` for the accent — dark mode rides the `.dark`
  class the theme system already manages; responsive (cards stack on
  mobile, the table scrolls). No new CSS classes needed (no Tailwind v4
  surface risk: standard utilities only, the v4 `@custom-variant dark`
  contract already in globals.css).
- The panel mounts NOTHING in the shell — no sidebar/drawer/Settings
  changes; `<RumBeacon />` itself is untouched.

### S19-C (MEDIUM) — the GET comment nit + docs alignment

- The `GET /api/rum` comment corrected: "p75 per metric over the user's
  most recent 200 events (all metrics, most-recent-first), then filtered
  per metric — a single-user-scale approximation of per-metric windows."
- README (the /rum surface row + the diagnostics feature row + counts),
  AGENTS.md (the panel contract: URL-direct, no nav linkage, the
  /rum → /login redirect), CLAUDE.md (the seam in the pyramid + counts),
  PAD (ADR-017 — the diagnostics panel, with the alternatives-rejected
  table), SKILL.md (AP-67 if new lessons land), DEPLOYMENT.md §8 (the
  post-deploy "visit /rum" step), `.env.example` (audited — no new env
  vars), this plan's execution log, `worklog.md`, the session narrative.

---

## TDD order

1. **RED unit** — `tests/rum-diagnostics.test.ts`: `classifyP75` at the
   exact boundaries for all five metrics (good-bound inclusive, NI-bound
   inclusive, above = poor); `formatMetricValue` (ms 0dp, CLS 2dp);
   `buildPanelRows` full-data (five cards in order, ratings derived),
   empty-data (hasData false, five unsampled cards), partial (one metric
   only); the labels/order completeness (5 entries, matching keys).
2. **RED e2e** — `tests/e2e/s19-rum-panel.spec.ts` (demo-user
   storageState; NO new registrations — the register budget stays put):
   - **anon redirect:** a fresh context (no storageState) `page.goto("/rum")`
     → the URL ends at `/login` (the server gate).
   - **the panel renders the field data:** POST a deterministic batch
     (known values: LCP 2345, CLS 0.03, TTFB 120 …) via the request
     fixture → `page.goto("/rum")` → the metric cards show the formatted
     values; the recent table contains the batch's path; the explainer +
     samples line render; `document.title` is "Performance Diagnostics ·
     StudyFlow".
   - **the empty state renders when no data:** (uses the same authed
     context — the suite's own beacon rows exist by now, so instead of
     hunting emptiness this pin asserts the EMPTY-STATE COPY exists in the
     component's rendered output when the aggregate has samples 0 —
     driven through the seam: `buildPanelRows({samples:0,...})` is the
     unit pin; the e2e asserts the panel's data-present branch. The e2e
     empty-state copy check rides the unit layer instead.)
   - **zero-nav-linkage guard:** `page.goto("/")` → no
     `a[href="/rum"]` anywhere in the shell; the drawer check stays 20
     links (the standing check re-run covers this).
3. **GREEN** — the seam → the panel component → the route. (No shell
   mount — nothing else changes.)
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone
   Settings sweep; a CWV spot-check on the standalone build (CLS still
   0.00 — the panel must not shift anything anywhere).
6. Evidence captures: `/rum` desktop light + dark + mobile 390x844 (the
   committed capture script pattern) → `docs/screenshots/s19-*.png`.
7. Docs (S19-C) + the 3-commit pattern + the SSH-wrapper push.

## Risks

- **The panel is a NEW client surface** — the only new-DOM risk lives on
  `/rum` itself (not a parity surface). The shell's DOM is untouched;
  the s16 CLS pins + the byte-parity guards re-run in the full suite.
- **The e2e db accumulates RumEvent rows** — the s19 spec posts its OWN
  deterministic batch and asserts on those values' presence (the p75
  over a mixed window could shift with the suite's own beacon rows; the
  card VALUE pin uses the POSTED values only when they dominate the
  window — the spec posts LARGE values (e.g. LCP 4001) and asserts the
  card renders, plus the recent-table row (most-recent-first) carries
  the exact value; the p75 exactness is unit-pinned instead, on
  `classifyP75`/`buildPanelRows`).
- **`/rum` must not appear in the sitemap** (`src/app/sitemap.ts` — a
  diagnostics route is not a public content surface; it is auth-gated.
  The sitemap enumerates public routes only — verified unchanged).
- **Server-component gate + client fetch double-reads auth** (the server
  redirects; the client re-fetches /api/auth/me for the theme) — the
  established shell pattern; one extra GET on a single owner-facing page.

---

## Execution log (post-completion)

**TDD observed.** RED unit: `tests/rum-diagnostics.test.ts` — 14 designed
failures (the module absent — the import fails, exactly as planned). RED
e2e: `tests/e2e/s19-rum-panel.spec.ts` — 3 designed failures (the absent
`/rum` route: the anon redirect, the panel rendering, the refresh) + the
zero-nav-linkage guard passing on arrival (the guard convention — it pins
the absence forever).

**GREEN (families):** the pure seam `src/lib/rum-diagnostics.ts`
(RUM_METRIC_ORDER/LABELS, the public CWV_THRESHOLDS, classifyP75,
formatMetricValue, buildPanelRows — 14 unit pins: boundary-exact
classifications per metric, the ms-0dp/CLS-2dp formatting split, the
full/empty/partial display models) → the client panel
`src/components/rum/rum-panel.tsx` (parallel /api/auth/me [theme via
loadFromUser] + GET /api/rum; five p75 cards with rating badges; the
samples line; the recent-events table; Refresh; the empty state; the
good-bounds footer; sf-canvas/sf-card + standard utilities — no new CSS)
→ the server-gated route `src/app/rum/page.tsx` (getCurrentUser +
redirect + the Performance Diagnostics metadata + noindex) → the
`GET /api/rum` comment correction (S19-C: the window is the last 200
events all-metrics, then filtered per metric).

**Two honest test iterations (the tests were corrected against the
seam, and two lessons recorded as AP-67).** (1) The first anon-gate e2e
failed because `browser.newContext()` INSIDE a test inherits the
file-level `test.use({ storageState })` — the "manual fresh context"
carried the session cookie and the panel rendered for the "anonymous"
visitor (empirically confirmed by dumping `ctx.cookies()`); the fix
passes an EXPLICIT EMPTY storageState
(`{ cookies: [], origins: [] }`). (2) The label assertions
strict-mode-collided — "Time to First Byte" resolves in BOTH the metric
cards and the recent table's Metric column; scoped to the cards region
(`getByRole("region", …)`) and the value pin to a table cell
(`getByRole("cell", …)`), with the p75-card exactness left to the unit
layer (the e2e p75 window is shared with the suite's own beacon rows —
not deterministic).

**Gates.** lint ✓ · tsc ✓ · **179 unit ✓** (165 + 14 new) · build ✓ ·
**258 e2e ✓** (cold `db/e2e.db`, 4.3 min — the 254 prior pins untouched,
the beacon live on every shell load) = **437 tests green**.

**Verification re-runs.** The standing drawer check GREEN on arrival
(backdrop + 288px panel + 20 links + no footer + Escape-close); the
reference re-sweep UNCHANGED since S18 (zero-data account, all five
Settings tabs matching, 20 nav views, stable branding split — the
committed `scripts/ref-dash-sweep-s29.mjs` probe); the clone Settings
sweep parity ✓ (headers, goal, created line, master toggle); the s16
CLS pins green in the full suite (the panel is a separate route — zero
shell impact).

**Evidence.** 3 captures via the committed
`scripts/capture-s19-evidence.mjs` (the `/rum` panel desktop light +
DARK — themed through the production loadFromUser path via a fulfilled
/api/auth/me with themeMode "dark" — + mobile 390×844) →
`docs/screenshots/s19-rum-panel-*.png`. VLM-verified (all three PASS:
the five cards + ratings + the table render in each mode; the dark
capture shows proper dark theming; the mobile capture shows the cards
stacked with no overflow).

**Docs aligned.** README (badge 437, the diagnostics feature row, the
/rum surface mention on the /api/rum row, counts 179/258, the
session-19 plan row, the S19 captures line), AGENTS.md (the panel
contract + the capture command + counts), CLAUDE.md (the panel contract
+ the S19 seam in the pyramid + counts), PAD (ADR-017 with the
alternatives-rejected table; the test-distribution table to 438 = 179
unit + 259 e2e incl. setup), SKILL.md (AP-67 + the 437 badge),
DEPLOYMENT.md §8.1 (the post-deploy "visit /rum" step).
`.env.example` audited — unchanged (no new env vars: the panel reads
none).
