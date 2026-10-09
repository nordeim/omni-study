# Session 34 — the S20 iteration: the RUM panel v3 (trends + CSV export)

Git pull brought the repo to `7481f4c` (the S19 push + the session-33
transcript). The review docs read (session_32, remediation-plan-session19,
the repo worklog, session_33); the S19 seams verified present (the pure
`rum-diagnostics` seam, the panel component, the server-gated `/rum`
route, the s19 spec, the beacon, `/api/rum`, the Docker artifacts, the
vitest + playwright configs, `DATABASE_URL="file:../db/custom.db"` with
`db/` at the repo root, `.env.example` matching the codebase). Baseline
gates matched the documented state: lint ✓ tsc ✓ 179 unit ✓.

The standing checks FIRST (the brief's priority item): the
**mobile-drawer check GREEN** on both apps — backdrop
`oklab(0 0 0/0.2)`+blur(4px), the 288px white panel, 20 links, no
footer, the Escape-close superset. **The mobile navigation menu is
working as expected.** The reference re-sweep: **UNCHANGED since S19** —
the account still zero-data (0/0 stats), all five Settings tabs matching
every S17/S18/S19 measurement (school "Lincoln High", Daily Study Goal:
4 hours, Account created 9/28/2026, the master toggle, the per-tab
headers, the zero-empty states), 20 nav views in the same order, the
branding split stable. The clone-side Settings sweep: parity ✓. The
20-view copy sweep (against a fresh standalone build on :3200): 13/20
MATCH with the 7 remaining diffs all DATA-STATE (the seeded demo
showcase vs the reference's zero-data account — the S17-pinned non-gap
family; the fresh-user spec pins the zero-state parity).

The S19 code audit (the recent changes): the pure seam, the panel, the
route, the spec, and the GET comment correction reviewed line-by-line —
**CLEAN**. Docker re-verified unavailable in the sandbox (`docker:
command not found`) — the first real `docker compose --profile init up`
stays the owner's documented step (DEPLOYMENT.md §8).

Governing decision: with both backlogs empty (the reference unchanged,
the S19 code clean), the session executed the documented next surface
from the session-33 narrative's "Next" list — **the optional v3 panel
polish: sparklines + CSV export**. The brief's superset goal governs:
pure functional supersets on the owner-facing `/rum` surface, ZERO
chrome on any parity-pinned surface.

Plan saved: `docs/remediation-plan-session20.md` — validated before
execution (the s18/s19 pins are presence-based so the additive `trends`
field is safe; `next.config.ts` rewrites only map the 20 PascalCase
paths so `/api/rum/export` serves cleanly; the optional `trends` field
keeps the existing unit fixtures passing — pinned as the backward-compat
test).

TDD: **RED** — 13 unit failures (the absent `buildSparklinePoints` /
`toRumCsv` / `points`) + 4 e2e failures (the absent export route, the
absent trends field, the absent panel chrome). **GREEN** — the pure seam
(`buildSparklinePoints`: the empty/single-value/flat-series edge cases
first-class, the PAD=2 inset, the inverted normalization; `toRumCsv`:
the 7-column header, RAW analysis-grade values, RFC-4180 escaping;
`buildPanelRows`' points pass-through) → the GET `/api/rum` `trends`
extension (the ≤ 20 most recent values per metric, chronological) → the
`GET /api/rum/export` route (the 2000-event chronological dump, the S13
`buildContentDisposition` + S14 nosniff/private-no-store headers, the
dated ASCII filename) → the panel updates (the aria-hidden sparkline SVG
per sampled card — the accent token stroke under
`preserveAspectRatio="none"` + `vectorEffect="non-scaling-stroke"`, no
new CSS; the Export CSV anchor; the footer's trend-window sentence).

Two honest iterations, both recorded as **AP-68**: (1) the
exact-coordinate unit pins bind the x expression to the multiply-first
form — `(i * width) / (n-1)` — because `(i / (n-1)) * width` takes a
different floating-point rounding path (the tests were the spec; the
implementation was corrected); (2) the first evidence-capture probe POST
failed 400 — it posted 25 events in ONE batch (over the S18 10-event
cap) under ONE sessionId per metric (the (sessionId, metric) upsert
would have collapsed each 5-value series to one row) — the fix posts
each value under a DISTINCT sessionId in single-event batches.

**FULL REGRESSION GREEN: 262 e2e ✓** (cold `db/e2e.db`, 4.4 min — the
258 prior pins untouched, the beacon live on every shell load) =
**454 tests green** (192 unit + 262 e2e).

Evidence: 4 captures via the committed `scripts/capture-s20-evidence.mjs`
(the `/rum` panel desktop light + DARK + mobile 390×844 — 5 sparklines +
the Export CSV action in every mode, no mobile overflow — + the exported
CSV head). VLM-verified: all three PASS. The mobile-navigation spec
(10 pins) re-ran green inside the full suite — the shell is untouched.

Docs aligned: README (badge 454, the panel v3 row, the
`/api/rum/export` row, counts 192/262, the plan row, the captures
line), AGENTS (the v3 contract + the capture command + counts), CLAUDE
(the v3 contract + the S20 seams + counts), PAD (ADR-018 with the
alternatives-rejected table; the test-distribution table re-measured
via `playwright test --list` — the four stale per-file rows corrected
and the setup row made explicit: 454 = 192 unit + 261 chromium + the
1 setup), SKILL (AP-68 + the 454 badge), DEPLOYMENT §8.1 (the
sparkline + export walkthrough), `.env.example` audited — unchanged
(no new env vars: the export reads none).

**Session complete — the S20 RUM panel v3: 454 tests green, ready to
commit and push to main.**

**What governed this session:** the reference re-swept UNCHANGED since
S19 and the S19 code audited clean — so the session-33 narrative's
documented next surface governed: the v3 panel polish (sparklines + CSV
export).

**Landed (TDD, 454 tests green — 192 unit + 262 e2e):**
- **The sparklines**: each sampled card on `/rum` carries an
  accent-themed SVG trend line (the metric's 20 most recent samples,
  oldest → newest) — the geometry is the pure, unit-pinned
  `buildSparklinePoints` seam
- **The CSV export**: `GET /api/rum/export` downloads the owner's most
  recent 2000 events as a spreadsheet-ready RFC-4180 CSV (raw values,
  the S13/S14 download-header contract), reached via the panel's new
  Export CSV action

**Notable finds (now AP-68):** the trend-probe trap (the batch cap +
the upsert collapsing same-session series) and the floating-point
rounding-path divergence in exact-coordinate pins.

**Next:** the first real `docker compose --profile init up` on a Docker
host remains the owner's one open verification step (DEPLOYMENT.md §8);
after a few visits, open `/rum` to watch the trends fill in — and
Export CSV for offline analysis. The v3 polish closes the documented
S18→S20 observability arc (beacon → aggregate → panel → trends/export).
