# Remediation Plan — Session 20 (S20): the RUM panel v3 — per-metric trends + CSV export

**Audit surfaces (this session, session-34 workspace run at `7481f4c`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
179 unit ✓ against the S19 codebase), the mobile-drawer check on BOTH apps
(backdrop oklab(0 0 0/0.2)+blur(4px), 288px white panel, 20 links, no
footer, Escape-close superset — the briefing's priority item), the reference
re-sweep: **the reference is UNCHANGED since S19** (zero-data account 0/0,
all five Settings tabs matching every S17/S18/S19 measurement — school
"Lincoln High", Daily Study Goal: 4 hours, Account created 9/28/2026, the
Notifications master toggle, the Subjects/Holidays zero-empty states, 20
nav views in the same order, the branding split stable), the clone-side
Settings sweep parity ✓ (all five tabs, the goal/created/master-toggle
fields; the created-line date difference is the documented demo-seed vs
reference-account non-gap), and the 20-view copy sweep: 13/20 MATCH with
the 7 remaining diffs all DATA-STATE (the seeded demo showcase vs the
reference's zero-data account — the S17-pinned non-gap family).

**The S19 code audit (the recent changes):** the pure seam
(`src/lib/rum-diagnostics.ts`), the panel component
(`src/components/rum/rum-panel.tsx`), the server-gated route
(`src/app/rum/page.tsx`), the e2e spec (the AP-67 empty-storageState anon
gate), and the `/api/rum` GET comment correction were reviewed line-by-line
— **CLEAN**. Docker remains unavailable in the sandbox (`docker: command
not found` — re-verified this session), so the first real
`docker compose --profile init up` stays the owner's documented step
(DEPLOYMENT.md §8).

**The governing decision.** With the parity backlog empty (the reference
unchanged) and the audit backlog empty (S19 clean), the session executes
the documented next surface from the session-33 narrative's "Next" list:
**the optional v3 panel polish — sparklines + CSV export**. The brief's
superset goal ("production ready 'superset' of the original reference site
in terms of functionality while maintaining visual parity") governs: both
additions are pure functional supersets on the owner-facing `/rum` surface
(the reference has no diagnostics surface at all), and they add ZERO
chrome to any parity-pinned surface (the shell's 20-link nav is untouched;
the panel is URL-direct, guarded by the zero-nav-linkage e2e pin).

---

## Evidence (measured this session)

| Check | Result |
|---|---|
| Baseline gates (7481f4c) | lint ✓ tsc ✓ 179 unit ✓ (the documented S19 state) |
| Mobile drawer (390x844, both apps) | GREEN — backdrop oklab(0 0 0 / 0.2)+blur(4px), 288px panel, 20 links, no footer, Escape-close |
| Reference account state | UNCHANGED since S19 (zero-data, 0/0, profile values intact) |
| Reference Settings five-tab sweep | matches S17/S18/S19 measurements exactly |
| Reference nav inventory | 20 views, same order |
| Clone Settings sweep | parity ✓ (five tabs, goal/created/master-toggle) |
| 20-view copy sweep | 13/20 MATCH; 7 data-state-only diffs (the documented non-gap) |
| S19 code audit (seam/panel/route/spec) | CLEAN |
| Docker daemon | unavailable (re-verified) — the real run stays the owner's step |

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase;
   verification-only parity work (all GREEN).
2. **No nav link to the panel** — the sidebar/drawer/Settings are
   parity-pinned surfaces (20 links, five tabs). The panel lives at the
   URL `/rum` (owner-direct, documented in README + DEPLOYMENT.md §8.1).
   The existing e2e guard pins the absence of any `/rum` link in the shell.
3. **The login route stays un-instrumented** (S18 contract).
4. **The Docker real-run** remains the owner's step (no daemon here —
   re-verified).
5. **The copy-sweep data-state diffs** are the S17-documented non-gap (the
   demo seed vs the reference's zero-data account; the fresh-user spec
   pins the zero-state parity).

---

## Families and fixes

### S20-A (HIGH) — the pure seams (`src/lib/rum-diagnostics.ts`)

Two new pure functions + one display-model extension, all unit-pinned:

- `buildSparklinePoints(values: number[], width: number, height: number)` →
  `Array<{ x: number, y: number }>` — the card sparkline geometry:
  - `[]` for an empty series (the caller renders no SVG).
  - A single value renders a VISIBLE flat line: two points at the vertical
    center, `x` 0 → width (a one-point polyline is invisible).
  - `min === max` (a flat series) guards the division: the same centered
    two-or-more-point line.
  - Otherwise `x` evenly spaced over `[0, width]` (`n > 1`), `y` inverted-
    normalized into `[PAD, height - PAD]` with `PAD = 2` (the stroke stays
    inside the viewBox), larger value → smaller `y`.
- `toRumCsv(events: RumRecentEvent[]): string` — the export body builder:
  - Header `metric,value,rating,navigationType,path,sessionId,createdAt`;
    one row per event, in the CALLER's order (the route feeds chronological).
  - RFC-4180 escaping: a field containing a comma, double quote, or
    newline is wrapped in quotes with inner quotes doubled; numbers are
    RAW (analysis-grade — no display formatting).
  - Each row terminated with `\n` (empty input → the header line only).
- `buildPanelRows` extension: `RumGetAggregate` gains the OPTIONAL
  `trends?: Record<string, number[]>` (backward compatible — the GET
  contract grows additively); each card gains `points: number[]` (the raw
  per-metric trend values, oldest → newest, non-finite filtered, `[]` when
  the metric has no trend data). The panel component computes geometry via
  `buildSparklinePoints` — the seam stays Date/DOM free.

### S20-B (HIGH) — the GET extension + the export route

**`GET /api/rum` (additive):** the response gains `trends` — per metric,
the ≤ 20 most recent values in CHRONOLOGICAL order (oldest → newest),
derived from the same 200-event window the p75 already uses (filter per
metric, take 20, reverse). The existing fields (`p75`, `samples`, `total`,
`recent`) are unchanged.

**`GET /api/rum/export`** (`src/app/api/rum/export/route.ts` — new):

- `requireUser()` (the API contract: 401 JSON for anonymous callers — not
  a redirect; same as every API route).
- The user's most recent **2000** events (`take: 2000` desc), reversed to
  chronological order, mapped to the `RumRecentEvent` wire shape
  (`createdAt` → ISO string), serialized through `toRumCsv`.
- Response headers follow the S13/S14 download contract:
  `Content-Type: text/csv; charset=utf-8`,
  `Content-Disposition: attachment` via `buildContentDisposition()` (the
  RFC 2183 fallback + RFC 5987 extended form — the S13 seam, reused),
  `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.
  The filename is dated: `studyflow-rum-YYYY-MM-DD.csv` (ASCII-safe).
- No rate limit (a read endpoint, auth-gated, single-user scale — the same
  posture as the GET aggregate).

### S20-C (MEDIUM) — the panel component updates (`rum-panel.tsx`)

- **MetricCard sparkline:** when `card.points.length > 0`, render an
  inline `svg` (`viewBox="0 0 100 28"`, `preserveAspectRatio="none"`,
  `aria-hidden="true"`, `w-full h-7`) with ONE `polyline` —
  `fill="none"`, `stroke="rgb(var(--sf-primary))"` (the accent token, so
  the 7 accents + dark mode theme it), `strokeWidth 1.5`,
  `vectorEffect="non-scaling-stroke"` (the stroke stays uniform under the
  non-uniform viewBox scaling). The points string comes from
  `buildSparklinePoints(card.points, 100, 28)`. Standard utilities only —
  NO new CSS (zero Tailwind v4 surface risk).
- **The Export CSV action:** an outline-styled anchor
  (`<a href="/api/rum/export">`) beside Refresh in the header — a real
  navigation link (the session cookie rides it; no JS). It links FROM
  `/rum` (the zero-nav-linkage guard pins the SHELL free of `/rum` links —
  unaffected).
- **The footer copy** gains the trend-window sentence ("the sparkline on
  each card shows your 20 most recent samples per metric").
- Mobile 390px: the sparkline is `w-full h-7` inside the card (stacks
  naturally); the header actions row carries Back-to-app + Export CSV +
  Refresh (fits 358px of content width at the smallest sizes).

### S20-D (MEDIUM) — docs alignment

README (the panel row gains trends + export; the API table gains the
`/api/rum/export` row; counts), AGENTS.md (the v3 contract — the trends
window, the export route's header set + 2000-row cap; counts), CLAUDE.md
(the S20 seam in the pyramid + counts), PAD (ADR-018 — the v3 polish with
the alternatives-rejected table), SKILL.md (AP-68 if new lessons land),
DEPLOYMENT.md §8.1 (the export mention), `.env.example` audit (no new env
vars — the export reads none), this plan's execution log, `worklog.md`,
the session narrative + transcript.

---

## TDD order

1. **RED unit** — extend `tests/rum-diagnostics.test.ts`:
   - `buildSparklinePoints`: empty → `[]`; single value → the two-point
     flat centered line; flat series (min === max) → centered; a known
     4-value series → EXACT normalized coordinates (the worked example —
     x spacing, the inverted y, the PAD inset); width/height respected.
   - `toRumCsv`: empty → header line only; a known event → the exact row
     with RAW values; a path containing a comma and a quote → RFC-4180
     escaping (quoted field, doubled inner quote); ordering preserved.
   - `buildPanelRows`: cards carry `points` when `trends` present (order
     preserved), `[]` when the aggregate omits `trends` entirely
     (backward compat), `[]` for an unsampled metric.
2. **RED e2e** — `tests/e2e/s20-rum-export.spec.ts` (demo-user
   storageState; NO new registrations):
   - **the export round-trip:** POST a deterministic probe batch →
     `request.get("/api/rum/export")` → 200, `content-type` `text/csv`,
     the header row present, the probe row present (exact raw value),
     `content-disposition` attachment, `nosniff`, `private, no-store`.
   - **the anon gate:** a truly-anonymous context (the AP-67 explicit
     empty storageState) → `request.get("/api/rum/export")` → 401.
   - **the trends contract:** `request.get("/api/rum")` → the `trends`
     field carries the posted metric's value.
   - **the panel renders the sparklines + the export action:** POST a
     batch → `page.goto("/rum")` → the cards region contains ≥ 1
     `polyline` (the sparklines render for sampled metrics); the Export
     CSV action link exists (`a[href="/api/rum/export"]`).
   - **the zero-nav-linkage guard re-run** (the shell stays `/rum`-free —
     the existing s19 pin re-executes in the full suite anyway).
3. **GREEN** — the seam functions → the GET `trends` extension → the
   export route → the panel component. (No shell mount — nothing else
   changes.)
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone
   Settings sweep (the panel changes must not touch the shell).
6. Evidence captures: `/rum` desktop light + dark + mobile 390×844 with
   sparklines + the export action visible (the committed capture-script
   pattern — extend `scripts/capture-s20-evidence.mjs`) →
   `docs/screenshots/s20-*.png`; capture the exported CSV body as
   evidence.
7. Docs (S20-D) + the 3-commit pattern + the SSH-wrapper push.

## Risks

- **The panel is the only touched client surface** — the shell's DOM is
  untouched; the s16 CLS pins + the byte-parity guards re-run in the full
  suite. The S19 card-label pins assert TEXT (labels), which the sparkline
  SVG does not alter; the `4001 ms` cell pin is table-scoped.
- **The GET response grows `trends`** — additive; the s18/s19 pins assert
  field PRESENCE, never an exact key set. The unit fixtures for
  `buildPanelRows` omit `trends` in the old cases (the optional-field
  backward-compat pin) and supply it in the new ones.
- **The export reads up to 2000 rows** — a single-user scale bound (the
  whole table is typically < 2000 rows for months; `db:reset` clears the
  scratch). No pagination (the data-volume audit convention: measured
  bounds over speculative pagination).
- **The sparkline under `preserveAspectRatio="none"`** could distort the
  STROKE — countered by `vectorEffect="non-scaling-stroke"`; the PAD=2
  inset keeps the geometry inside the viewBox.
- **`/api/rum/export` vs the `[id]` route family** — no conflict: the
  nested folder resolves before any dynamic segment under `/api/rum`
  (there is none); the physical `/api/rum/export` route serves cleanly.

---

## Execution log (post-completion)

**TDD observed.** RED unit: `tests/rum-diagnostics.test.ts` — 13 designed
failures (the absent seam functions `buildSparklinePoints`/`toRumCsv` and
the absent `points` card field). RED e2e:
`tests/e2e/s20-rum-export.spec.ts` — 4 designed failures (the absent
`/api/rum/export` route: the export round-trip + the anon 401; the absent
`trends` field; the absent panel chrome).

**GREEN (families):** the pure seam `src/lib/rum-diagnostics.ts`
(`buildSparklinePoints` — the empty/single/flat edge cases, the PAD=2
inset, the inverted normalization; `toRumCsv` — the 7-column header, RAW
values, RFC-4180 escaping; `buildPanelRows`' `points` pass-through with
the non-finite filter + the optional-`trends` backward compat) → the GET
`/api/rum` `trends` extension (the ≤ 20 most recent values per metric,
reversed to chronological, from the same 200-event window) → the export
route `src/app/api/rum/export/route.ts` (2000-event chronological dump,
the `toRumCsv` body, the S13 `buildContentDisposition` + S14
nosniff/private-no-store headers, the dated ASCII filename) → the panel
updates (the `aria-hidden` sparkline SVG per sampled card —
`viewBox 0 0 100 28`, `preserveAspectRatio="none"` +
`vectorEffect="non-scaling-stroke"`, the accent token stroke; the Export
CSV anchor beside Refresh; the footer's trend-window sentence).

**One honest implementation iteration (the tests were the spec).** The
exact-coordinate unit pins bind the x expression to the multiply-first
form — `(i * width) / (n-1)` — because `(i / (n-1)) * width` takes a
different floating-point rounding path (33.33333333333333 vs
33.333333333333336 at width 100 / n 4). The implementation was corrected
to the canonical form. Recorded with the capture-probe lesson as AP-68.

**One honest capture-script iteration (AP-68).** The first evidence
probe POST failed 400: it posted 25 events in ONE batch (the S18
10-event cap) and, worse, under ONE sessionId per metric — the
(sessionId, metric) UPSERT would have collapsed each 5-value series to a
single row. The fix posts each value under a DISTINCT sessionId in
single-event batches (25 POSTs, ~1s).

**Gates.** lint ✓ · tsc ✓ · **192 unit ✓** (179 + 13 new) · build ✓ ·
**262 e2e ✓** (cold `db/e2e.db`, 4.4 min — the 258 prior pins untouched,
the beacon live on every shell load) = **454 tests green**.

**Verification re-runs.** The standing drawer check GREEN on arrival
(this session, before the changes — backdrop + 288px panel + 20 links +
no footer + Escape-close on BOTH apps); the mobile-navigation spec
(10 pins) re-ran green inside the full suite; the clone Settings sweep
parity ✓ (five tabs, goal/created/master-toggle — run on arrival); the
reference re-sweep UNCHANGED since S19 (the committed
ref-dash-sweep-s29 + ref-settings-sweep probes); the 20-view copy sweep
13/20 MATCH with the 7 data-state-only diffs (the documented non-gap).

**Evidence.** 4 captures via the committed
`scripts/capture-s20-evidence.mjs`: the `/rum` panel desktop light +
DARK (themed through the production loadFromUser path) + mobile
390×844 — each showing 5 sparklines + the Export CSV action, mobile
with NO horizontal overflow — + the exported CSV head
(`s20-rum-export-head.txt`; the full body measured 109 rows, the
attachment disposition `studyflow-rum-2026-10-09.csv` with the RFC 5987
extended form). VLM-verified via the committed
`scripts/vlm-verify-s20.mjs` (all three PASS: the sparklines render in
every mode, the Export CSV action visible, the dark capture properly
themed, the mobile capture stacked with no overflow).

**Docs aligned.** README (badge 454, the panel v3 row, the
`/api/rum/export` API row, the `trends` mention on the `/api/rum` row,
counts 192/262, the session-20 plan row, the S20 captures line), AGENTS
(the v3 contract + the capture command + counts), CLAUDE (the v3
contract + the S20 seams in the pyramid + counts), PAD (ADR-018 with the
alternatives-rejected table; the test-distribution table to
454 = 192 unit + 262 e2e incl. setup), SKILL (AP-68 + the 454 badge),
DEPLOYMENT.md §8.1 (the sparkline + export walkthrough).
`.env.example` audited — unchanged (no new env vars: the export reads
none).
