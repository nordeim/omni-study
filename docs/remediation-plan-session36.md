# Remediation Plan — Session 36 (S36): the dark-mode mobile sweep — the MODE axis at the mobile viewport the standing surface never varied, as a standing, executable guarantee

**Audit surfaces (this session, session-78/79 workspace run at `4516254`):** the
baseline gates re-confirmed the documented **662-green** state on arrival (lint
✓ tsc ✓ **371 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.7 min**), the S31 preflight ran GREEN before the checks,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → Settings by ref → the S26 Email card above the S24 Change
password + S25 Danger zone cards on the Profile tab — **the mobile navigation
menu is working as expected**), and the reference re-sweep: **UNCHANGED since
S19–S35** (login title "AcademiaFlow (Copy)"; the zero-data dashboard with the
greeting from the email prefix "Good morning, sepnetflix2023 👋" + the same
section h2s; the same 20 nav views in the same order; the same five Settings
tabs with School/Grade/Goal on the Profile tab). The 20-view copy sweep:
**14/20 MATCH** with the 6 diffs all data-state (the documented S17-pinned
non-gap family). The S35 one-command standing suite ran **20/20 GREEN,
exit 0** — zero code findings across the whole production-readiness sweep.
The demo user's theme verified light/violet (the closing guard).

## The governing finding (this session's work)

**The MODE axis at the mobile viewport has never been varied — dark mode ×
the drawer-navigated mobile sweep is guaranteed by NOTHING, and 14 of the 20
views have never been rendered in dark at the stacked mobile layout by any
standing audit.** The coverage map, verified against the standing scripts
this session:

1. **dark-sweep** renders all 20 views in dark — but at **1280×800 desktop**
   (sidebar layout, desktop panes). The two-pane views (Tasks, Notes,
   Flashcards, StudyGroups) render their `lg:flex-row` desktop arrangement
   there; the stacked mobile arrangement (`flex-col`, the h2 identity, the
   mobile action rows) never renders.
2. **accent-dark-sweep** renders dark at **390×844** for only **6 views**
   (`MOBILE_VIEWS = ["Dashboard", "MyDay", "Timetable", "Tasks", "Settings",
   "Calendar"]`) plus the drawer. The other **14 views — Events, Assignments,
   Exams, Notes, Flashcards, Practice Tests, Study Groups, Grade Tracker,
   Analytics, Files, Calculator, Math Solver, AI Assistant, Focus Timer —
   have NEVER been rendered in dark at the mobile stacked layout by any
   standing audit.**
3. **dark × 768×1024 (mid-band) and dark × 844×390 (phone landscape) have
   ZERO coverage** — the S34/S35 sweeps pin light mode by construction.
4. Every mobile-family sweep is **mode-rot-guarded to light** —
   `classifyMobileSweep`/`classifyMidbandSweep`/`classifyLandscapeSweep`
   read `mode !== "light"` as NON-GREEN ("the dark/accent surfaces belong
   to their own audits") — so the mobile sweeps can never catch a dark-mode
   regression by construction. The "own audit" the notes point to exists
   only for 6 of 20 views.

Dark mode is the clone's **superset feature** (the reference's own
Dark/System options are a measured Base44 platform no-op — the S10-1
contract), so its correctness at the most common real-world dark usage —
phone, portrait, at night — is a superset-quality contract. The mobile-only
dark-relevant structures are real: the stacked two-pane panes carry
`dark:border-slate-800` variants (notes-view.tsx:98, flashcards-view.tsx:218),
the mobile app bar carries `dark:shadow-black/20` + `dark:text-slate-300`
(mobile-chrome.tsx:38-61), the drawer panel carries `dark:bg-slate-950`
(mobile-chrome.tsx:97) — every one of those `dark:` variants is a
superset-only code path that no standing audit exercises at the mobile
layout for 14 of 20 views. A dropped `dark:` variant, a `text-slate-800`
without its `dark:` partner, or a light surface that fails to flip would
surface in NO standing audit: the dark-sweep sees the desktop layout (where
that element is hidden or arranged differently), accent-dark-sweep sees 6
views, and the mobile sweeps pin light.

**This session's executable exploration is the evidence the current state is
green** (the plan-validation probe, the S34/S35 doctrine): dark mode PATCHed
through the settings API (the S27 real lifecycle, self-verified on `<html>`)
at the given viewport, all 20 views navigated THROUGH THE DRAWER with the
S33 structural family (identity heading h1||h2, heading clearance under the
fixed bar, no horizontal overflow, drawer closed, app bar + clock, zero
console errors) PLUS the dark-sweep detector family (flashbulb + unreadable)
extended to the mobile chrome (the `header *` scope — the mobile app bar's
brand + clock text must read dark-clean). Swept at 390×844 (the
representative), 768×1024 (the mid-band combo), and 844×390 (the landscape
combo). Findings at every viewport: recorded in the execution log below.

The deliverable: **`scripts/dark-mobile-sweep.mjs`** — the standing probe at
**390×844** (the S33 mobile sweep's dark sibling — the representative of the
most common real-world dark-mobile usage class: phone portrait at night),
navigated THROUGH THE DRAWER, asserting per view the S33 structural family
plus the dark detector family, with the S27 self-verifying precondition
(dark PATCHed through the settings API + verified on `<html>`) and the S32
anti-phantom shape contract.

## Families and fixes

### S36-A (HIGH) — the seam extension `classifyDarkMobileSweep` + the unit pins

The CLAUDE.md doctrine (pure logic in `src/lib/*` seams with unit pins):

- `AUDIT_NAMES` gains `"dark-mobile-sweep"` (after `"landscape-sweep"`,
  before `"dark-sweep"` — the light-mode mobile family, then the light-mode
  mid-band family, then the light-mode phone-landscape family, then the
  DARK-MODE mobile family, then the dark-mode desktop families — the
  documented stage order: light mobile before dark anything, mobile before
  desktop).
- `classifyAudit("dark-mobile-sweep", envelope)` → `classifyDarkMobileSweep`:
  - `mode` must be the string `"dark"` — anything else is a non-green
    `mode=X — the sweep ran in the wrong mode (the S27 rot class; the
    DARK-mode mobile surface is this audit's contract — the light mobile
    family belongs to mobile-sweep)` finding.
  - `viewport` must be an object carrying BOTH `width: 390` AND `height:
    844` — the sweep at another size is a shape-error (the 844×390 landscape
    envelope fed to this classifier shape-errors: the portrait mobile class
    is this audit's contract; the landscape combo is a documented non-gap).
  - `chrome` must be an object with boolean `sidebarVisible` + boolean
    `hamburgerVisible` — the vehicle contract (the lg contract: below 1024
    the drawer is the vehicle). A well-formed envelope whose
    `sidebarVisible === true` or `hamburgerVisible === false` reads NON-GREEN
    with the vehicle-contract note.
  - `views` must be an object; every `views.{view}` must carry a string
    `heading`, a number `scrollWidth`, a boolean `drawerClosed`, a boolean
    `appBar`, a boolean `headingClearance`, an Array `flashbulbs`, an Array
    `unreadable`, and an Array `consoleErrors` — shape-strict (flashbulbs +
    unreadable are the dark-sweep detector keys ported to the mobile sweep —
    the NEW per-view keys this audit owns; headingClearance carried from
    S35).
  - `drawer` must carry `linkCount` (number) + `order` (string) + `dark`
    (an object with `flashbulbs` + `unreadable` counts — the drawer's own
    dark rendering is part of this audit's contract: the panel is
    `dark:bg-slate-950`, its brand header and nav links must read
    dark-clean).
  - `findings` must be an Array; green iff empty AND the summed dark
    detections are zero AND both contracts hold. The dark detections are
    counted INDEPENDENTLY of the findings array (the dark-sweep semantics:
    findings = findings.length + Σ flashbulbs + Σ unreadable across views +
    the drawer's counts) — a probe that forgets to push a detector hit into
    findings still reads NON-GREEN at the seam (the anti-phantom doctrine).
  - The note counts the views swept, the drawer round-trips, and the dark
    detection totals.
- Pinned in `tests/suite-verdict.test.ts` (the S33/S34/S35 in-file extension
  pattern): the GREEN shape fixture (per-view flashbulbs/unreadable arrays +
    the drawer dark record); the shape-error family (missing `findings`; a
  view record missing `flashbulbs`; a view record missing `unreadable`; the
  drawer record missing `dark`; the 844×390 LANDSCAPE envelope fed to the
  dark-mobile classifier — shape-error, the portrait mobile class is this
  audit's contract; the 768×1024 mid-band envelope — same); the mode-rot
  family (`mode: "light"` → non-green with the mode in the note — the
  INVERSE rot guard from every light sweep: here LIGHT is the wrong mode);
  the findings-present family (a flashbulb finding at Notes → non-green);
  the dark-detection family (a view record with a NON-EMPTY flashbulbs
  array and an EMPTY findings array → STILL non-green — the independent
  counting, the dark-sweep semantics); the vehicle-contract family
  (`sidebarVisible: true` → non-green with the lg-contract note).

### S36-B (HIGH) — the probe `scripts/dark-mobile-sweep.mjs`

Run as `node scripts/dark-mobile-sweep.mjs` (node-run like mobile/midband/
landscape — it imports no TS seam; the runner classifies). Stages:

1. **Self-verifying preconditions (the S27/S32/S33/S34/S35 doctrine):**
   launch Chromium at 390×844; login as the demo user (demo@studyflow.app);
   assert `window.innerWidth === 390 && window.innerHeight === 844`; PATCH
   `themeMode: "dark"` through the settings API (the real lifecycle — never
   a forced class), await, reload, verify `<html>` carries the `dark` class;
   **the chrome contract**: the desktop `aside` sidebar is hidden AND the
   "Open navigation menu" hamburger is visible. Any precondition failure:
   loud stderr + `process.exit(1)` with NO findings (and a restoring light
   PATCH where the mode was half-applied).
2. **The drawer-content check (once, on the first open):** the hamburger
   opens the dialog; exactly 20 links in the documented NAV order; no
   footer; **the drawer's own dark rendering measured** (the DRAWER_CHECKER:
   flashbulb + unreadable scoped to the dialog; the panel's computed
   background recorded — `dark:bg-slate-950`). Close it before the sweep
   (the overlay-interception class).
3. **The 20-view sweep, navigated THROUGH THE DRAWER:** for each view in NAV
   order — open the drawer, click the view's link, then assert: the URL is
   the view's path; the drawer dialog is hidden (closed on navigation); the
   identity heading is visible (h1 OR h2 — the S8-H union; Dashboard is the
   time-aware greeting regex); the heading clearance (top ≥ 63 — the fixed
   h-16 bar); `documentElement.scrollWidth <= 390`; **the dark detector
   family** (the dark-sweep CHECKER extended: flashbulb — opaque light
   backgrounds (luminance > 0.80) ≥ 40×20px on the dark canvas, unreadable —
   contrast < 2.2 against the effective bg — with the `header *` scope added
   to the unreadable loop so the mobile app bar's brand + clock text is
   covered); the fixed glass app bar renders with the brand and the
   2-digit-hour clock; zero console errors (per-view delta). A ~1200 ms
   data settle per view.
4. **The closing restore:** an explicit, awaited `themeMode: "light"` PATCH
   (the demo resting state), then browser close.
5. **Output:** one JSON envelope `{ source: "dark-mobile-sweep", mode,
   viewport: { width: 390, height: 844 }, chrome: { sidebarVisible,
   hamburgerVisible }, drawer: { linkCount, order, dark: { flashbulbs,
   unreadable, panelBg } }, views: {...}, findings: [...] }`; exit 0 iff
   findings empty AND dark detections zero AND preconditions held.

**Findings vocabulary:** the S33/S35 family — `overflow`, `no-heading`,
`drawer-stuck`, `console-error`, `app-bar`, `link-count`, `heading-clearance`
— plus `flashbulb` and `unreadable` (the dark-sweep detector classes, now
per-view at the mobile layout) and `drawer-flashbulb`/`drawer-unreadable`
(the drawer's own dark rendering). `precondition` is never emitted —
preconditions exit 1 with no findings.

**Negative controls (the S27–S35 validation convention):** (a) the
fabricated findings envelope through the seam reads non-green (unit-pinned);
(b) the mode-rot envelope (`mode: "light"`) reads non-green (unit-pinned —
the inverse guard); (c) the dark-detection envelope (a non-empty flashbulbs
array with an empty findings array) reads non-green (unit-pinned — the
independent counting); (d) the dead-server case aborts at the
standing-suite preflight stage (the runner's stage-0 enforcement,
unchanged); (e) the genuine run against the healthy dev server → findings 0,
exit 0.

### S36-C (HIGH) — the runner update `scripts/standing-suite.mjs`

- `STAGES` gains `{ name: "dark-mobile-sweep", file:
  "scripts/dark-mobile-sweep.mjs", runtime: "node" }` after
  `landscape-sweep`, before `dark-sweep` — the light-mode mobile family,
  then the light-mode mid-band family, then the light-mode phone-landscape
  family, then the DARK-MODE mobile family, then the dark-mode desktop
  families (the sweep PATCHes dark explicitly and restores light at the
  end; the closing theme guard still verifies light/violet at suite end).
- The stage-count literals 19 → 20 (`stage 0/20`, `stage ${i+1}/20`, the
  closing `stage 20/20`) — the suite is now 21 rows (preflight + 19 audits
  + the theme guard).
- The dark-mobile-sweep stage makes ZERO AI requests (no ai: budget
  interaction with the security stage — impossible by construction).

### S36-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

- `AGENTS.md`: the commands-table entry `node scripts/dark-mobile-sweep.mjs`
  + the standing-suite entry's audit list gains dark-mobile-sweep (18 → 19
  standing audits) + the unit-count line (371 → the new count).
- `vitest.config.ts`: the header seam list note + the count (371 → the new
  count; still 20 files — the pins ride `tests/suite-verdict.test.ts`).
- `CLAUDE.md`: the unit-layer count + the dark-mobile-sweep seam mention.
- `Project_Architecture_Document.md` §8.1: the suite-verdict row's
  description + the Total row re-derived (662 → the new count).
- `README.md`: the session-36 status row + the §Testing counts + the badge.
- `omni-study_SKILL.md`: the counts ×2 + **AP-81** (the lesson — below).
- `worklog.md` (repo root): the S36 entry.

**AP-81 (the lesson, MEDIUM):** S16 taught that mobile-only gaps hide behind
desktop pins; S33 encoded the light mobile walkthrough; S34 pinned the width
continuum; S35 pinned the height axis; S36 finds the SAME class one axis
out — the MODE. The standing surface varied width and height but pinned
light at every mobile viewport: dark × mobile was covered for 6 of 20 views
(accent-dark-sweep's mobile pass), and 14 views had never been rendered in
dark at the stacked mobile layout by any standing audit. The dark: variants
on the mobile-only structures (the stacked panes' borders, the app bar's
shadow, the drawer's panel) are superset-only code paths — a regression
there surfaces in no light-pinned probe and no desktop dark sweep. The
guard: when a surface is theme-dependent, pin the MODE × viewport combo of
the real usage class (phone portrait at night), not just the light mode at
every width — a mode never varied at a viewport is a blind combo.

### S36-E (MEDIUM) — the session record + evidence

`docs/remediation-plan-session36.md` (this file, with the execution log),
the session narrative, the S36 evidence JSON
(`docs/screenshots/s36-dark-mobile-sweep-evidence.json` — the genuine
21-stage suite envelope), the dark-mobile evidence screenshot
(`docs/screenshots/s36-dark-mobile-drawer-390.png` — the drawer OPEN at
390×844 in dark mode: the dark panel, the dark app bar, the nav links —
the dark-mobile story in one frame), and the standing-31 screenshot
refresh (no app bytes move; the refresh proves the tree unchanged).

## Non-gaps (documented, do not fix)

1. **No e2e spec is added** (the S27–S35 convention: probe scripts are
   execution-validated, not browser-pinned; the e2e layer already pins the
   dark token contract at desktop and the accent-dark surfaces at mobile
   for 6 views).
2. **Dark × mid-band (768×1024) and dark × landscape (844×390) stay
   un-pinned as combos** — validated clean THIS session by the exploration
   probe (the evidence below); the standing probe pins dark × 390×844 (the
   representative: the most common real-world dark-mobile usage class). A
   future regression at another dark viewport surfaces through the same
   mobile-only dark structures at 390×844 (the stacked panes, the drawer,
   the app bar all render there) or through the desktop dark-sweep.
3. **The accent × dark × mobile full matrix stays un-pinned** —
   accent-dark-sweep's 6 mobile views × 7 accents remain the accent
   coverage; the dark-mobile-sweep pins the DEFAULT (violet) accent in
   dark. An accent-specific dark-mobile regression is the accent-dark
   family's contract.
4. **The copy sweep stays outside the suite** (reference-dependent; 14/20 +
   6 data-state non-gaps — the documented S17 family, re-confirmed this
   session).
5. **The reference's dark mode is a no-op (S10-1)** — there is no
   dark-mode PARITY contract to sweep against the reference; this audit is
   a superset-quality contract (the clone's own dark implementation).

## TDD order

1. **RED:** extend `tests/suite-verdict.test.ts` with the dark-mobile-sweep
   classifier pins (the GREEN fixture; the shape-error family incl. the
   landscape/mid-band envelopes fed to the dark-mobile classifier; the
   mode-rot family with mode=light — the inverse guard; the
   findings-present family; the dark-detection family — a non-empty
   flashbulbs array with empty findings still non-green; the
   vehicle-contract family). Run → fails (classifyAudit reads "unknown
   audit" on the new name — the unknown-audit guard). Capture the failing
   run.
2. **GREEN:** implement `classifyDarkMobileSweep` + the `AUDIT_NAMES` entry
   in `src/lib/suite-verdict.ts`. Run → the new pins green alongside 371.
3. **The probe:** `scripts/dark-mobile-sweep.mjs` (node-run; the
   self-verifying preconditions incl. the dark-mode real-lifecycle PATCH +
   the chrome contract; the drawer-content check + the drawer's own dark
   rendering; the 20-view drawer-navigation sweep at 390×844 in dark with
   the S33 structural family + the dark detector family + the heading
   clearance; the closing restore). Execution-validate live against the
   dev server → findings 0, exit 0.
4. **The runner:** the STAGES entry + the 20-count literals; the genuine
   full-suite re-run → **21/21 GREEN, exit 0** (the validation run; its
   envelope is the S36 evidence). Run it in a CLEAN ai: window (restart
   the dev server by PID first — the S32 pre-spent-budget remedy; this
   session's first suite run's ai-error/ai-a11y stages spent the budget).
5. **Full gates re-run:** lint → typecheck → unit (the new count) → build →
   cold-`db/e2e.db` 291 e2e — the regression confirmation (zero app code,
   zero CSS, zero Tailwind v4 surface, zero parity-pinned bytes).
6. **Standing checks re-run:** the drawer check; the dark-mobile evidence
   screenshot; the standing 31 screenshots refreshed via
   capture-studyflow.mjs (theme restored light, verified via Prisma); the
   S36 evidence JSON captured.
7. **Docs** (S36-D) + the session record (S36-E) + commit + push via the
   SSH wrapper.

## Risks

- **The dark PATCH must restore light even on failure paths** (the theme-
  spec lesson — an aborted restore persists dark and poisons every later
  light pin; the probe's `finally` + the explicit awaited closing PATCH).
- **The flashbulb detector may surface intentional light surfaces** — the
  Events view is an intentionally-dark terminal panel (`bg-slate-900`) in
  BOTH themes (fine in dark); the sf-gradient CTAs and avatars are already
  excluded by the CHECKER's class filter. Any genuine hit is classified
  with evidence BEFORE shipping (the S32 run-1 discipline).
- **The unreadable detector's `header *` scope extension** — the mobile
  app bar's glass background is translucent (backdrop blur); the
  effective-bg walk falls through to the body background — the same
  semantics the dark-sweep already applies to the desktop sidebar (`aside
  *`); the app bar text (`dark:text-slate-300` brand + clock) must pass
  2.2 against the dark canvas.
- **The console-error listener may surface dev-mode noise** (the Next.js
  overlay) — any genuine finding is classified with evidence BEFORE
  shipping; documented exclusions must be signature-strict.
- **The Dashboard greeting is time-aware** — the heading assertion is the
  regex (the copy-sweep pattern), never a hardcoded bucket.
- **The suite's total runtime grows ~1 min** (20 drawer navigations +
  detector passes at a third mode) — acceptable against the S35 suite's
  ~27 min.
- **The suite validation run must avoid the S32 differential** — the
  ai-error/ai-a11y stages of an earlier same-window run spend the ai:
  budget the security stage probes; restart the dev server by PID (the
  in-memory limiter clears) and re-run in the clean window.

## Execution log (session 78/79 — filled as executed)

- The exploration (the plan-validation probe, parametrized by viewport, dark
  mode PATCHed through the settings API — the real lifecycle, self-verified
  on `<html>`): the dark-mobile family swept clean BEFORE the plan was
  written — **dark × 390×844, dark × 768×1024, and dark × 844×390 × 20 views
  each through the drawer, findings 0 at every viewport** (identity heading
  h1||h2 with clearance under the 64px bar, scrollWidth === the viewport
  width on every view, zero console errors, the drawer 20 links + its own
  dark rendering clean — panel `rgb(2, 6, 23)` — and ZERO flashbulb /
  unreadable detections across all 60 view renderings; the vehicle contract
  held at every viewport: sidebar hidden, hamburger visible). The state
  green; the guarantee absent — the AP-78/79/80 lineage one axis out: the
  MODE.
- TDD RED: 12 new pins in tests/suite-verdict.test.ts (the GREEN shape with
  the detector arrays + the drawer dark record; the shape-error family
  [missing findings / a view record missing flashbulbs / a view record
  missing unreadable / the drawer record missing dark / the 844×390
  landscape envelope fed to the dark-mobile classifier / the 768×1024
  mid-band envelope fed to the dark-mobile classifier]; the mode-rot family
  [mode=light → non-green with the mode + the S27 class in the note — the
  INVERSE rot guard]; the findings-present family [a flashbulb finding at
  Notes]; the dark-detection family [a NON-EMPTY flashbulbs array with an
  EMPTY findings array → still non-green — the independent counting]; the
  vehicle-contract family [sidebarVisible true → the lg-contract note]) →
  7 failed / 92 passed (the unknown-audit guard already shape-errors the
  unknown name — those pins pass for the right reason post-implementation).
- TDD GREEN: `classifyDarkMobileSweep` + the AUDIT_NAMES entry in
  src/lib/suite-verdict.ts (after landscape-sweep, before dark-sweep) →
  **99/99** in the file; the full unit layer **383** (20 files; was 371).
- The probe scripts/dark-mobile-sweep.mjs (node-run; the self-verifying
  preconditions — BOTH-axes viewport assertion, dark mode PATCHed through
  the settings API + verified on `<html>`, the chrome vehicle contract; the
  drawer-content check + the drawer's OWN dark rendering measured on the
  first open [the dark:bg-slate-950 panel background recorded in the
  envelope]; the 20-view sweep navigated THROUGH THE DRAWER at 390×844 in
  dark with the S33/S35 structural family + the heading-clearance pin + the
  dark-sweep detector family extended to the mobile chrome; the explicit
  awaited closing light PATCH). **Genuine run 1: findings 0, exit 0** — all
  20 views clean on the first executable sweep; the theme restored light
  (verified via Prisma: light/violet).
- The runner: STAGES gains dark-mobile-sweep between landscape-sweep and
  dark-sweep (the family order: light mobile → light mid-band → light
  phone-landscape → DARK mobile → dark desktop; zero AI requests); the
  stage-count literals 19 → 20 (the suite now 21 rows: preflight + 19
  audits + the theme guard).
- The validation protocol (the S32 differential applied BEFORE the run):
  the dev server restarted by PID (the in-memory ai: limiter cleared — this
  session's own first suite run's ai-error/ai-a11y stages had spent the
  budget), the S31 preflight GREEN, then the clean-window full-suite run:
  **21/21 GREEN, exit 0** — the evidence envelope captured to
  docs/screenshots/s36-dark-mobile-sweep-evidence.json (21 stage rows; the
  dark-mobile-sweep row GREEN inside the suite: "20 views swept through the
  drawer at 390×844 in MODE dark; drawer carried 20 links; vehicle contract
  holds; 0 dark detections").
- Gates re-run: lint ✓ tsc ✓ **383 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ (4.5 min) = **674 green** (was 662; +12 unit pins; the 291
  prior pins untouched by construction — zero app code, zero CSS, zero
  Tailwind v4 surface, zero parity-pinned bytes).
- The dark-mobile evidence screenshot captured via
  scripts/capture-s36-evidence.mjs:
  docs/screenshots/s36-dark-mobile-drawer-390.png — the drawer OPEN at
  390×844 in dark mode (the dark glass app bar, the dark panel with its
  nav links; the measured geometry rides the capture envelope: panelBg
  rgb(2, 6, 23), 20 links, the app bar brand + clock visible, scrollWidth
  390; the panel pixels verified in-frame: rgb(2, 6, 23)).
- Standing checks re-run post-change: the drawer check GREEN; the standing
  31 screenshots refreshed via capture-studyflow.mjs (theme restored light,
  verified via Prisma: **light/violet** — the User field is `accentColor`).
- Docs aligned (the AP-74 guard): AGENTS (the dark-mobile-sweep command
  entry after landscape-sweep + the 19-audit suite entry + the 383 line),
  vitest.config.ts (383 + the S36 seam note), CLAUDE (383 + the S36 seam),
  PAD §8.1 (the suite-verdict row extended + the per-file count 87 → 99 +
  Total 674/383), README (the 674 badge + the 383 lines ×2 + the S36
  classifier mention + the session-36 status row), SKILL (the 674/383
  counts ×2 + AP-81), the worklog entry, the session narrative
  (session_80.md).
