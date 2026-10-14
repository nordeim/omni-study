# Session 127 — The S50 summary

## What shipped

**The dark × landscape × SEED sweep for the 13 volume-invariant views** —
the S46 plan's carried note + the S49 plan's own non-gap entry, closed as
the standing next candidate: `scripts/accent-dark-landscape-seed-sweep.mjs`
(7 accents × Timetable, Assignments, Exams, Flashcards, Practice Tests,
Study Groups, Grade Tracker, Files, Calculator, Math Solver, AI Assistant,
Focus Timer, Settings — the views that render no task/note/event rows, so
the S48/S49 volume sweeps never navigated them — at 844×390 in DARK at
SEED volume, navigated through the drawer), the
`classifyAccentDarkLandscapeSeedSweep` seam, 32 unit pins, and the runner's
32nd audit stage.

## The coverage map (why this cell)

Verified by grep against the standing scripts: the S35/S40 landscape
sweeps run LIGHT only (S40's every PATCH carries `themeMode: "light"`), the
S36/S38 dark sweeps run 390×844 mobile + 1280×800 desktop only (the 844
width in NEITHER surface), and the S48/S49 volume sweeps navigate the 7
volume-affected views only. So the 13 volume-invariant view bodies had
NEVER been rendered in dark at the 844×390 landscape layout under ANY
accent, and the drawer's active-link tint had never been read through the
real navigation lifecycle in dark at landscape at SEED on those views.
With this session the landscape band's SEED surface is closed on BOTH
halves (the light half is the S40 audit's own — all 20 views; the dark
half for the 13 volume-invariant views is this session's).

## The exploration (genuine run 1)

**EXIT 0, findings 0, 2m43s** (~4.4× headroom under the 20-min budget):

- 91 renderings (7 accents × 13 views), every view recorded EXPLICITLY
  (the S38 retirement of omission-means-clean, applied from birth);
- the interaction GREEN — activeLabel === the view on all 91 readings via
  the pendingView pattern, activeTint a linear-gradient on all 91 (7
  DISTINCT accent-correct NAV_ACTIVE_GRADIENT_STOPS pairs — the dark ×
  landscape × seed cell closed);
- the LANDSCAPE vehicle contract holds (sidebarVisible=false +
  hamburgerVisible=true — the below-lg family) + drawerNavScrollable=true
  (the nav geometry confirmed at 390 height: scrollHeight 1068 vs
  clientHeight 301, links ~8–20 below the fold);
- ZERO flashbulbs across all 91 + 7 drawer records (the dark doctrine);
- 1 unreadable, ALL exempt (the CTA-face — white on the amber-500 "Start
  Test" button, the S11 family-2 non-gap);
- 58 lowcontrast WARN (the S11 non-gap family);
- the drawer link census 20/20 per accent (the full NAV even though only
  13 are navigated);
- scrollWidth 844 max on every rendering.

**GREEN at the new seam on the FIRST try** (the temporary bun harness,
deleted after) — ZERO pin corrections needed at classification time.

## TDD

- **RED**: 32 pins (773 → 805 unit; 18 failed / 503 passed under the
  un-extended seam — the shape-error pins pass vacuously through the
  unknown-audit path, documented). ONE pin defect caught BEFORE the RED
  run (a tint-rot pin referencing "Notes" — a view not in the 13-view
  set; the override would silently no-op), one duplicate cross-check pin
  removed.
- **GREEN**: the seam (the viewport guard [844×390 BOTH axes], the mode
  rot guard [mode MUST be dark — the light half at seed is the S40
  audit's own], the ALL-ACCENTS + ALL-VIEWS guards on the 13-view set,
  the LANDSCAPE vehicle contract + the drawer-own nav-scroll contract,
  the per-accent applied self-verification, the drawer-error check, the
  20-link census, the interaction classes at seed, the overflow class,
  the three structural contracts, the DARK detector family [flashbulbs
  always findings, counted independently; unreadable with the CTA-face
  exemption ONLY, each with a dark-doctrine negative — a slate-300 day
  number and a yellow-500 pill still COUNT in dark; lowcontrast WARN]).
  ONE correction during GREEN: the structural family refactored into the
  S49 pattern's three distinct blocks (the note phrasing). 805/805 in the
  layer; lint ✓ tsc ✓.
- The mode-discriminator pin (the S50 envelope with mode=light → NON-green
  via the mode rot) + the disjoint-sets discriminators (the S48/S49
  7-view volume envelopes → shape-error on the missing 13 views; the
  S42/S44/S46 envelopes → shape-error on the viewport).

## The validation suite (the S32 differential)

The dev server restarted by PID, preflight GREEN, every interactive
browser session closed first (the S41 OOM lesson), the fresh clean
window: **34/34 GREEN, exit 0** — the new accent-dark-landscape-seed-sweep
row GREEN inside the suite on its FIRST integration run (identical counts
to the exploration — deterministic: 91 renderings, 91 tint readings, 7
distinct tints, 0 flashbulbs, 1 CTA-face exempt, 58 WARN, census 20/20),
every other stage green, the theme-restore closing guard light/violet.

## Gates

lint ✓ tsc ✓ **805 unit** ✓ (20 files — was 773) build ✓ cold-db **291
e2e** ✓ (4.5 min) = **1096 green** (was 1064; +32 unit pins; the 291
prior pins untouched by construction — zero app code, zero CSS, zero
Tailwind v4 surface, zero parity-pinned bytes).

## The evidence

- `docs/screenshots/s50-accent-dark-landscape-seed-sweep-evidence.json`
  (34 stage rows);
- `docs/screenshots/s50-accent-dark-landscape-seed-teal-exams-844.png` —
  the Exams view (a volume-invariant view) in DARK under TEAL at 844×390
  with the drawer OPEN on the navigated Exams view: the teal
  NAV_ACTIVE_GRADIENT_STOPS gradient rgba(20, 184, 166, 0.1) → rgba(6,
  182, 212, 0.1) on the active link, linkCount 20, darkClass true,
  mainNodes 107, zero flashbulbs, zero non-exempt unreadable,
  scrollWidth 844, the nav geometry 1068 vs 301 scrollable, the click
  latency 447ms — all verified in-frame;
- the standing 31 refreshed (capture-studyflow.mjs; the theme verified
  via the DB light/violet, zero stress markers — the SEED probe inserts
  none by design).

## The session's audit record (the arrival + the review)

The 1064-green baseline re-confirmed on arrival (after the documented
fresh-environment `bunx playwright install chromium` step; ONE
intermediate 289/291 stale-cache run, then 291 ✓). The arrival standing
suite **33/33 GREEN**. The live agent-browser mobile walkthrough GREEN on
BOTH apps — **the mobile navigation menu is working as expected**, with
the reference's own drawer verified in the same pass (20 links, 288px
panel, nav scrollable, auto-close on nav). The reference re-swept
**UNCHANGED since S19–S49**. The copy sweep 14/20 (the 6 documented
data-state non-gaps). The code audit (Mode C): **zero app-code findings**
— the S49 diff is test/seam/probe-only; the security scan clean; **no
Tailwind v4 bug found in the mobile navigation** (the drawer's
backdrop-blur-xs trap-9 pin, the flex-gap trap-4 ban, the custom
.sf-nav-active class, and the hidden-lg:flex sidebar contract all
verified live). The `.env` contract verified (DATABASE_URL
"file:../db/custom.db", the db/ folder at the repo root); the
vitest + playwright suites verified present and correct; the
`.env.example` verified matching the codebase (tracked in git; the
`.env`/`db/*.db`/`dev.log` ignore contract intact).

## Suggested next steps

Future sweeps stay ONE command — `bun scripts/standing-suite.mjs` (34
rows; ~110 min) in a clean window (the S32 differential — and never
syntax-check the runner via an import: the module EXECUTES on load; use
`node --check`). The standing open items remain the first real `docker
compose --profile init up` on your Docker host and the upstream dep
patches (braces > 3.0.3, Prisma's deepmerge-ts pin). The named next
candidate is the **RUM-beacon second cross-axis** (RUM-beacon behavior
under suite volume — the S45–S49 summaries' named family, now the last
standing named candidate).
