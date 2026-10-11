# Session 80 — The S36 dark-mode mobile sweep

The workspace refreshed with a `git pull` (`de0391a..4516254` — the
session_79 transcript added on the remote); the working tree clean, the
environment intact (bun 1.3.14, the seeded `db/custom.db` in place). The
task plan set, then the core docs read (AGENTS through the S35 rows + the
daemon recipe, CLAUDE through the S35 seam, README, PAD through the S35
rows, SKILL through AP-80; then session_78 + session_79 +
remediation-plan-session35 + the worklog S35 entry); every current-state
claim re-verified against the codebase on arrival (24 models, the
662-green documentation, the S35 seam + runner + 87 pins, the
.env/db-at-root contract, the vitest 20-file/371 config).

## Baseline + standing checks (all GREEN)

The baseline gates re-confirmed the documented **662-green** state: lint ✓
tsc ✓ **371 unit** ✓ (20 files) build ✓ cold-`db/e2e.db` **291 e2e** ✓
(4.7 min). The dev server was already healthy; the S31 preflight GREEN
(hydrated + navigation-stable); the mobile-drawer check GREEN (backdrop
oklab+blur(4px), 288px white panel, 20 links, no footer, Escape-close).
The live agent-browser 390×844 walkthrough GREEN: login → dashboard
scrollWidth 390 → the drawer with all 20 links in the documented order →
Settings by ref → the Profile tab with the S26 Email card above the S24
Change password + S25 Danger zone cards — **the mobile navigation menu is
working as expected**. The reference re-sweep: **UNCHANGED since S19–S35**
(login title "AcademiaFlow (Copy)"; the zero-data dashboard with the
greeting from the email prefix "Good morning, sepnetflix2023 👋"; the same
20 nav views in the same order; the same five Settings tabs with
School/Grade/Goal on Profile). The 20-view copy sweep: **14/20 MATCH**
with the 6 diffs all data-state (the documented S17-pinned non-gap
family). The S35 one-command standing suite ran **20/20 GREEN, exit 0** —
zero code findings across the whole production-readiness sweep; the demo
user's theme verified light/violet (the closing guard).

## The finding

**The MODE axis at the mobile viewport has never been varied.** The
standing surface varied width (S33 390 / S34 768 / the desktop pins) and
height (S35 844×390) — but pinned LIGHT at every mobile viewport. The
coverage map, verified against the standing scripts this session:

- **dark-sweep** renders all 20 views in dark — but at **1280×800
  desktop** (sidebar layout, `lg:flex-row` desktop panes).
- **accent-dark-sweep** renders dark at **390×844** for only **6 views**
  (`MOBILE_VIEWS` = Dashboard, MyDay, Timetable, Tasks, Settings,
  Calendar) plus the drawer. The other **14 views — Events, Assignments,
  Exams, Notes, Flashcards, Practice Tests, Study Groups, Grade Tracker,
  Analytics, Files, Calculator, Math Solver, AI Assistant, Focus Timer —
  had NEVER been rendered in dark at the stacked mobile layout by any
  standing audit.**
- **dark × 768×1024 and dark × 844×390 had ZERO coverage.**
- Every mobile-family sweep is **mode-rot-guarded to light** — the
  classifiers read `mode !== "light"` as NON-GREEN ("the dark/accent
  surfaces belong to their own audits") — so the mobile sweeps can never
  catch a dark regression by construction. The "own audit" the notes
  point to existed for 6 of 20 views.

The mobile-only dark-relevant structures are real: the stacked two-pane
panes carry `dark:border-slate-800` (notes-view.tsx:98,
flashcards-view.tsx:218), the mobile app bar carries
`dark:shadow-black/20` + `dark:text-slate-300` (mobile-chrome.tsx:38-61),
the drawer panel carries `dark:bg-slate-950` (mobile-chrome.tsx:97) —
every one a superset-only code path (the reference's own Dark/System
options are a measured Base44 no-op — S10-1). A dropped `dark:` variant
or a light surface that fails to flip would surface in NO standing audit.

The exploration validated the whole dark-mobile family clean BEFORE the
plan: **dark × 390×844, dark × 768×1024, and dark × 844×390 — 20 views
each through the drawer, findings 0 at every viewport** (identity heading
h1||h2 with clearance, scrollWidth === the viewport, zero console
errors, the drawer 20 links + its own dark rendering clean — panel
`rgb(2, 6, 23)` — and zero flashbulbs/unreadable detections across all
60 view renderings). The state green; the guarantee absent — the
AP-78/79/80 lineage one axis out: the MODE.

## The fix (TDD, 12 new pins)

- **RED:** 12 pins in `tests/suite-verdict.test.ts` (the GREEN shape
  with the detector arrays + the drawer dark record; the shape-error
  family — missing findings / a view record missing `flashbulbs` / a
  view record missing `unreadable` / the drawer record missing `dark` /
  the 844×390 landscape envelope and the 768×1024 mid-band envelope both
  fed to the dark-mobile classifier; the mode-rot family — `mode=light`,
  the INVERSE rot guard; the findings-present family — a flashbulb
  finding; the dark-detection family — a NON-EMPTY flashbulbs array with
  an EMPTY findings array still reads non-green, the independent
  counting; the vehicle-contract family) → **7 failed** under the
  unknown-audit guard (the S33/S34/S35 RED pattern).
- **GREEN:** `classifyDarkMobileSweep` + the `AUDIT_NAMES` entry in
  `src/lib/suite-verdict.ts` → **99/99** in the file; the full unit
  layer **383** (20 files; was 371). The classifier: viewport MUST be
  390×844 (the portrait mobile class — the landscape/mid-band dark
  combos are documented non-gaps); per-view shape-strict with the
  flashbulbs/unreadable detector keys (the dark-sweep family ported to
  the mobile layout); the drawer record gains `dark {flashbulbs,
  unreadable}` (the drawer's own dark rendering); the dark detections
  counted INDEPENDENTLY of the findings array (a probe that forgets to
  push a detector hit still reads NON-GREEN); the INVERSE mode-rot guard
  (mode MUST be dark — light is the wrong mode here).
- **The probe:** `scripts/dark-mobile-sweep.mjs` — the S33 mobile
  sweep's dark sibling: the 20-view sweep at 390×844 navigated THROUGH
  THE DRAWER in dark mode (PATCHed through the settings API — the real
  lifecycle, self-verified on `<html>`), asserting per view the S33/S35
  structural family (identity heading, heading clearance ≥ the 64px bar,
  scrollWidth ≤ 390, drawer closed, app bar + clock, zero console
  errors) PLUS the dark-sweep detector family (flashbulb + unreadable)
  extended to the mobile chrome (the `header *` scope — the app bar's
  brand + clock text must read dark-clean); the drawer-content check
  measures the drawer's own dark rendering on the first open (the
  dark:bg-slate-950 panel background recorded). **Genuine run 1:
  findings 0, exit 0** — all 20 views clean on the first executable
  sweep; the theme restored light (verified via Prisma: light/violet).
- **The runner:** STAGES gains dark-mobile-sweep between
  landscape-sweep and dark-sweep (the family order: light mobile →
  light mid-band → light phone-landscape → DARK mobile → dark desktop);
  the stage-count literals 19 → 20 — the suite now 21 rows.

## The validation runs

The validation protocol applied the S32 differential remedy BEFORE the
run: the dev server restarted by PID (the in-memory ai: limiter cleared —
this session's first suite run's ai-error/ai-a11y stages had spent the
budget), the S31 preflight GREEN, then the clean-window run. The full
evidence set: the suite envelope
(`docs/screenshots/s36-dark-mobile-sweep-evidence.json`), the dark-mobile
evidence screenshot (`docs/screenshots/s36-dark-mobile-drawer-390.png` —
the drawer OPEN at 390×844 in dark mode: the dark glass app bar, the
dark panel, the nav links), and the standing 31 refreshed (theme
restored light, verified via Prisma: light/violet).

## Session summary

- **The genuine finding:** the MODE axis — dark × mobile was covered for
  6 of 20 views; 14 views had never been rendered in dark at the stacked
  mobile layout; every light mobile sweep is mode-rot-guarded by
  construction. Validated clean across the dark-mobile family (dark ×
  390×844 / 768×1024 / 844×390) — state green, guarantee absent.
- **The fix:** the suite's 19th standing audit (dark-mobile-sweep at
  390×844) + the classifyDarkMobileSweep seam + 12 unit pins; NEW seam
  classes (the per-view flashbulbs/unreadable detector keys; the drawer
  dark record; the INDEPENDENT dark-detection counting; the INVERSE
  mode-rot guard); full gates re-run green — **674 green** (383 unit +
  291 e2e; was 662).
- **The lesson (AP-81):** a mode never varied at a viewport is a blind
  combo — when a surface is theme-dependent, pin the MODE × viewport
  combo of the real usage class (phone portrait at night), not just the
  light mode at every width.
- **Non-gaps documented:** dark × mid-band and dark × landscape
  (validated clean this session; the probe pins the representative dark
  × 390×844); the accent × dark × mobile full matrix (the
  accent-dark-sweep family's contract); no dark-mode PARITY contract
  exists (the reference's dark is a no-op — this audit is a
  superset-quality contract); the copy sweep stays outside the suite.
