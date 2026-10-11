# Remediation Plan — Session 35 (S35): the phone-landscape short-viewport sweep — the HEIGHT axis the standing surface never varied, as a standing, executable guarantee

**Audit surfaces (this session, session-76/77 workspace run at `dc590c2`):** the
baseline gates re-confirmed the documented **649-green** state on arrival (lint
✓ tsc ✓ **358 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.6 min**), the S31 preflight ran GREEN before the suite,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → Settings by ref → the S26/S24/S25 cards on the Profile
tab — **the mobile navigation menu is working as expected**), and the reference
re-sweep: **UNCHANGED since S19–S34** (login title "AcademiaFlow (Copy)";
zero-data 0/0 dashboard with the greeting from the email prefix; the same 20
nav views in the same order; the same five Settings tabs with School/Grade/Goal
on Profile). The 20-view copy sweep: **14/20 MATCH** with the 6 diffs all
data-state (the documented S17-pinned non-gap family). The S34 one-command
standing suite ran **19/19 GREEN, exit 0** — zero code findings across the
whole production-readiness sweep. The demo user's theme verified light/violet
(the closing guard).

## The governing finding (this session's work)

**The HEIGHT axis has never been varied — every pinned viewport in the
standing surface is portrait-tall, and the phone-landscape class (844×390, a
real and common device class) is guaranteed by NOTHING.** The pinned viewports:
390×844 (mobile-sweep), 768×1024 (midband-sweep), 1280×800 (the audit
scripts), 1440×900 (the e2e specs), 1024×800 (the single lg-boundary pin on
Dashboard). Every height ever pinned is ≥ 768px. Real phones in landscape are
390–430px TALL, and that height band stresses structures no pinned height
touches. Three pieces of evidence, all captured live this session:

1. **The height-dependent structures are real and load-bearing at 390.** The
   mobile drawer's nav (`flex-1 overflow-y-auto`, mobile-chrome.tsx:125)
   carries 20 reference-measured ~40px rows — measured live this session:
   **scrollHeight 1068 vs clientHeight 301 at 844×390** — the nav scroll is
   not decorative, it is the ONLY way links 8–20 (Analytics → Settings, more
   than half the app) are reachable in landscape, and no standing audit has
   ever verified it. The fixed `h-16` glass app bar covers **16% of a 390px
   viewport** (vs 8% at the pinned 800px desktop heights) — the `pt-20`
   clearance keeps the first heading below it, unverified. Four views render
   `h-[calc(100vh-8rem)]` panes — **262px tall at 390** (Tasks shows its
   `md:flex` aside at 844 width; Flashcards stacks its column; Notes carries
   a `min-h-[480px]` guard that switches the whole view to page-scroll) —
   height-dependent layout decisions at a height no probe has ever visited.
2. **The width band is NOT the finding** — 844 sits inside the S34 band
   (391–1023) and the S34 sweep verified the width-driven structure at 768.
   What S34 never varied was the HEIGHT: its 768×1024 representative is an
   iPad-portrait height; the phone-landscape class combines an in-band width
   with a 390px height — the drawer-as-vehicle + scroll-required-nav +
   short-pane trio that only co-occurs in phone landscape.
3. **This session's executable exploration is the evidence the current state
   is green — across the whole landscape band.** A parametrized probe swept
   **three landscape widths (844×390, 740×360, 932×430) × 20 views** plus the
   **320×568 narrow-portrait edge**: every view rendered its identity heading
   (h1||h2) with clearance under the app bar, zero horizontal overflow at
   every width (scrollWidth === viewport on every view), the drawer closed on
   navigation, the nav scrolled with the last link operable, zero console
   errors. Findings 0 at every width. The state is green today; the guarantee
   is absent — the AP-79 lesson one axis out: *"a viewport band between
   pinned widths is a blind band"* generalizes to *an axis never varied is an
   axis never verified*.

The deliverable: **`scripts/landscape-sweep.mjs`** — the standing probe at
**844×390** (the iPhone-class landscape — the most common phone-landscape
device class; the representative of the 390–430px-tall band), navigated
THROUGH THE DRAWER (the navigation vehicle below lg — same doctrine as
S33/S34), asserting per view the S33/S34 family — the identity heading, no
horizontal overflow (`documentElement.scrollWidth ≤ 844`), the drawer closed
on navigation, the fixed glass app bar (brand + 2-digit-hour clock), zero
console errors — plus the two NEW short-viewport contracts this audit owns:
**the heading-clearance pin** (per view: the identity heading's box top sits
at/below the fixed bar's 64px — at 390 the bar covers 16% of the viewport; a
padding regression would slide the heading under the glass bar and every
portrait probe would stay green) and **the drawer-nav-scroll contract** (the
nav MUST be scrollable at 390 height — scrollHeight > clientHeight; the 20
reference-measured rows cannot fit the ~300px nav area, so a non-scrolling
reading means the drawer geometry changed — and the last link must be
operable after scroll: the sweep's 20 drawer navigations prove it). With the
S27 self-verifying-precondition doctrine (the viewport asserted on BOTH axes,
light mode PATCHed through the settings API and verified on `<html>`) and the
S32 anti-phantom shape contract.

## Families and fixes

### S35-A (HIGH) — the seam extension `classifyLandscapeSweep` + the unit pins

The CLAUDE.md doctrine (pure logic in `src/lib/*` seams with unit pins):

- `AUDIT_NAMES` gains `"landscape-sweep"` (after `"midband-sweep"`, before
  `"dark-sweep"` — the light-mode mobile family, then the light-mode
  mid-band family, then the light-mode phone-landscape family, then the
  dark-mode families, the documented stage order).
- `classifyAudit("landscape-sweep", envelope)` → `classifyLandscapeSweep`:
  - `mode` must be the string `"light"` — anything else is a non-green
    `mode=X — the sweep ran in the wrong mode (the S27 rot class)` finding.
  - `viewport` must be an object carrying BOTH `width: 844` AND `height:
    390` — the sweep at another size (390×844 portrait included) is a
    shape-error: the finding classes are HEIGHT-dependent (the new axis),
    and the phone-landscape class is this audit's contract.
  - `chrome` must be an object with boolean `sidebarVisible`, boolean
    `hamburgerVisible`, AND boolean `drawerNavScrollable` — a missing or
    wrong-typed key is a LOUD shape-error (the anti-phantom guard). A
    well-formed envelope whose `sidebarVisible === true` or
    `hamburgerVisible === false` reads NON-GREEN with the vehicle-contract
    note (the lg contract — the drawer is the vehicle below 1024). A
    well-formed envelope whose `drawerNavScrollable === false` reads
    NON-GREEN with the short-viewport geometry note (at 390 height the 20
    reference-measured rows cannot fit the ~300px nav area — a
    non-scrolling nav means the drawer geometry changed; links beyond the
    fold would be unreachable) — the NEW class this audit owns.
  - `views` must be an object; every `views.{view}` must carry a string
    `heading`, a number `scrollWidth`, a boolean `drawerClosed`, a boolean
    `appBar`, a boolean `headingClearance`, and an Array `consoleErrors` —
    shape-strict (headingClearance is the new per-view key: the fixed-bar
    clearance).
  - `drawer` must carry `linkCount` (number) + `order` (string).
  - `findings` must be an Array; green iff empty AND both contracts hold.
    The note counts the views swept and the drawer round-trips.
- Pinned in `tests/suite-verdict.test.ts` (the S33/S34 in-file extension
  pattern): the GREEN shape fixture (chrome with the nav-scroll contract +
  per-view headingClearance); the shape-error family (missing `findings`; a
  view record missing `headingClearance`; the 390×844 PORTRAIT envelope fed
  to the landscape classifier — shape-error, the classes are
  height-dependent; a 768×1024 mid-band envelope fed to the landscape
  classifier — same; a missing `drawerNavScrollable` on the chrome record);
  the mode-rot family (`mode: "dark"` → non-green with the mode in the
  note); the findings-present family (a heading-clearance finding at Focus
  Timer → non-green); the vehicle-contract family (`sidebarVisible: true` →
  non-green with the lg-contract note); the short-viewport-contract family
  (`drawerNavScrollable: false` → non-green with the geometry note — the NEW
  class).

### S35-B (HIGH) — the probe `scripts/landscape-sweep.mjs`

Run as `node scripts/landscape-sweep.mjs` (node-run like mobile/midband — it
imports no TS seam; the runner classifies). Stages:

1. **Self-verifying preconditions (the S27/S32/S33/S34 doctrine):** launch
   Chromium at 844×390; login as the demo user (demo@studyflow.app); assert
   `window.innerWidth === 844 && window.innerHeight === 390` (BOTH axes —
   the height is this audit's axis); PATCH `themeMode: "light"` through the
   settings API (the real lifecycle), await, reload, verify `<html>` carries
   no `dark` class; **the chrome contract**: the desktop `aside` sidebar is
   hidden AND the "Open navigation menu" hamburger is visible. Any
   precondition failure: loud stderr + `process.exit(1)` with NO findings.
2. **The drawer-content check (once, on the first open):** the hamburger
   opens the dialog; exactly 20 links in the documented NAV order; no
   footer; **the short-viewport contract measured**: the nav's
   `scrollHeight > clientHeight` (the scroll REQUIRED at 390 — recorded in
   the envelope as `drawerNavScrollable`) + the last link (Settings)
   scrolled into view and visible (the operability proof). Close it before
   the sweep (the overlay-interception class).
3. **The 20-view sweep, navigated THROUGH THE DRAWER:** for each view in NAV
   order — open the drawer (the nav auto-scrolls the link into view — every
   iteration past link ~7 exercises the nav scroll), click the view's link,
   then assert: the URL is the view's path; the drawer dialog is hidden
   (closed on navigation); the identity heading is visible (h1 OR h2 — the
   two-pane mobile stacks render h2s below lg, the S8-H pattern; Dashboard
   is the time-aware greeting regex); **the heading clearance**: the
   heading's `getBoundingClientRect().top >= 63` (the fixed h-16 bar is 64;
   1px sub-pixel tolerance — at 390 the bar covers 16% of the viewport);
   `documentElement.scrollWidth <= 844` (no horizontal overflow); zero
   console errors (per-view delta); the fixed glass app bar renders with the
   brand and the 2-digit-hour clock. A ~1200 ms data settle per view.
4. **The closing restore:** an explicit, awaited `themeMode: "light"` PATCH
   (the demo resting state), then browser close.
5. **Output:** one JSON envelope `{ source: "landscape-sweep", mode,
   viewport: { width: 844, height: 390 }, chrome: { sidebarVisible,
   hamburgerVisible, drawerNavScrollable }, drawer: { linkCount, order },
   views: {...}, findings: [...] }`; exit 0 iff findings empty AND
   preconditions held.

**Findings vocabulary:** the S33/S34 family — `overflow` (scrollWidth >
844), `no-heading`, `drawer-stuck`, `console-error`, `app-bar`, `link-count`,
`precondition` (never emitted — preconditions exit 1 with no findings) —
plus `heading-clearance` (the identity heading's top sits under the fixed
app bar) — the new per-view class.

**Negative controls (the S27–S34 validation convention):** (a) the
fabricated findings envelope through the seam reads non-green (unit-pinned);
(b) the mode-rot envelope (`mode: "dark"`) reads non-green (unit-pinned);
(c) the short-viewport-contract envelope (`drawerNavScrollable: false`)
reads non-green (unit-pinned); (d) the dead-server case aborts at the
standing-suite preflight stage (the runner's stage-0 enforcement,
unchanged); (e) the genuine run against the healthy dev server → findings 0,
exit 0.

### S35-C (HIGH) — the runner update `scripts/standing-suite.mjs`

- `STAGES` gains `{ name: "landscape-sweep", file:
  "scripts/landscape-sweep.mjs", runtime: "node" }` after `midband-sweep`,
  before `dark-sweep` — the light-mode mobile family, then the light-mode
  mid-band family, then the light-mode phone-landscape family, then the
  dark-mode families (the sweep PATCHes light explicitly; the closing theme
  guard still verifies light/violet at suite end).
- The stage-count literals 18 → 19 (`stage 0/19`, `stage ${i+1}/19`, the
  closing `stage 19/19`) — the suite is now 20 rows (preflight + 18 audits
  + the theme guard).
- The landscape-sweep stage makes ZERO AI requests (no ai: budget
  interaction with the security stage — impossible by construction).

### S35-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

- `AGENTS.md`: the commands-table entry `node scripts/landscape-sweep.mjs` +
  the standing-suite entry's audit list gains landscape-sweep (17 → 18
  standing audits) + the unit-count line (358 → the new count).
- `vitest.config.ts`: the header seam list note + the count (358 → the new
  count; still 20 files — the pins ride `tests/suite-verdict.test.ts`).
- `CLAUDE.md`: the unit-layer count + the landscape-sweep seam mention.
- `Project_Architecture_Document.md` §8.1: the suite-verdict row's
  description + the Total row re-derived (649 → the new count).
- `README.md`: the session-35 status row + the §Testing counts + the badge.
- `omni-study_SKILL.md`: the counts ×2 + **AP-80** (the lesson — below).
- `worklog.md` (repo root): the S35 entry.

**AP-80 (the lesson, MEDIUM):** S16 taught that mobile-only gaps hide behind
desktop pins; S33 encoded the 390×844 portrait walkthrough; S34 pinned the
width continuum between the pinned widths; S35 finds the SAME class one AXIS
out — **the height axis**. The standing surface pinned five viewports and
every one was portrait-tall (heights 800–1024); the phone-landscape class
(844×390 — a real, common device class) had zero coverage, and the
height-dependent structures — the drawer nav whose scroll is the ONLY path to
links 8–20 at 390 (measured 1068px of content in a 301px area), the fixed
app bar at 16% of the viewport, the `pt-*` heading clearance under it, the
`h-[calc(100vh-8rem)]` panes at 262px, the `min-h-[480px]` guards — were
guaranteed by nothing. The guard: when a surface depends on BOTH viewport
axes (fixed chrome, viewport-percentage panes, scroll-required lists), pin
the orientation extreme of the REAL device class (phone landscape), not just
the portrait heights — an axis never varied is an axis never verified.

### S35-E (MEDIUM) — the session record + evidence

`docs/remediation-plan-session35.md` (this file, with the execution log),
the session narrative, the S35 evidence JSON
(`docs/screenshots/s35-landscape-sweep-evidence.json` — the genuine 20-stage
suite envelope), the landscape evidence screenshot
(`docs/screenshots/s35-landscape-drawer-844.png` — the drawer OPEN at
844×390 mid-scroll, the short-viewport story in one frame: the fixed app
bar, the 390px-tall panel, the scrolled nav), and the standing-31 screenshot
refresh (no app bytes move; the refresh proves the tree unchanged).

## Non-gaps (documented, do not fix)

1. **No e2e spec is added** (the S27–S34 convention: probe scripts are
   execution-validated, not browser-pinned; the e2e layer already pins the
   drawer geometry + round-trips at 390 portrait and the lg-boundary swap at
   1024).
2. **The landscape band's other widths are not separately pinned** —
   740×360 and 932×430 were validated clean THIS session (the exploration
   evidence); the standing probe pins 844×390 (the iPhone-class landscape,
   the representative). A future regression at another landscape width
   surfaces through the same height-dependent structures at 390-tall (the
   nav scroll, the clearance, the short panes all engage there) or through
   the portrait endpoints.
3. **320×568 narrow-portrait reflow stays un-pinned** — validated clean
   this session (findings 0, scrollWidth 320 on every view); lower-risk (no
   structural breakpoint between 320 and 390). Documented for a future
   session (the S34 non-gap #4 lineage).
4. **iPad-landscape (1024×768) stays un-pinned as a combo** — at 1024 the
   lg contract engages the sidebar (the desktop vehicle); its structure is
   the desktop surface (the 1024 lg-boundary pin on Dashboard + the
   1280/1440 desktop audits). Same class as the S34 non-gap #2.
5. **Dark-mode landscape stays un-pinned** — the light-mode family per the
   S33/S34 convention; dark mobile is covered by accent-dark-sweep's 6
   mobile views (390×844 portrait) and dark-sweep's 20 desktop views.
6. **The copy sweep stays outside the suite** (reference-dependent; 14/20 +
   6 data-state non-gaps — the documented S17 family, re-confirmed this
   session).

## TDD order

1. **RED:** extend `tests/suite-verdict.test.ts` with the landscape-sweep
   classifier pins (the GREEN fixture; the shape-error family incl. the
   portrait/mid-band envelopes fed to the landscape classifier; the mode-rot
   family; the findings-present family incl. the heading-clearance finding;
   the vehicle-contract family; the short-viewport-contract family). Run →
   fails (classifyAudit reads "unknown audit" on the new name — the
   unknown-audit guard). Capture the failing run.
2. **GREEN:** implement `classifyLandscapeSweep` + the `AUDIT_NAMES` entry
   in `src/lib/suite-verdict.ts`. Run → the new pins green alongside 358.
3. **The probe:** `scripts/landscape-sweep.mjs` (node-run; the
   self-verifying preconditions incl. both-axes viewport + the chrome
   contract; the drawer-content check + the nav-scroll contract + the
   last-link operability; the 20-view drawer-navigation sweep at 844×390
   with the heading-clearance pin; the closing restore).
   Execution-validate live against the dev server → findings 0, exit 0.
4. **The runner:** the STAGES entry + the 19-count literals; the genuine
   full-suite re-run → **20/20 GREEN, exit 0** (the validation run; its
   envelope is the S35 evidence). Run it in a CLEAN ai: window (restart the
   dev server by PID first — the S32 pre-spent-budget remedy; this
   session's first suite run's ai-error/ai-a11y stages spent the budget).
5. **Full gates re-run:** lint → typecheck → unit (the new count) → build →
   cold-`db/e2e.db` 291 e2e — the regression confirmation (zero app code,
   zero CSS, zero Tailwind v4 surface, zero parity-pinned bytes).
6. **Standing checks re-run:** the drawer check; the landscape evidence
   screenshot; the standing 31 screenshots refreshed via
   capture-studyflow.mjs (theme restored light, verified via Prisma); the
   S35 evidence JSON captured.
7. **Docs** (S35-D) + the session record (S35-E) + commit + push via the
   SSH wrapper.

## Risks

- **The drawer must close after the content check** (the S33/S34
  convention — the open overlay intercepts the hamburger; the probe closes
  it via Escape and waits for hidden before the per-view loop).
- **The nav-scroll measurement must happen while the drawer is OPEN** (the
  nav's clientHeight is 0 when hidden — the contract is measured on the
  first open, before the Escape).
- **The heading-clearance tolerance**: the fixed bar is exactly 64px (h-16)
  and the `pt-20` contract puts the first heading at y=80 — the pin reads
  `top >= 63` (1px sub-pixel tolerance); a heading at y < 63 is UNDER the
  bar (a genuine finding), a heading at 63–80 is the designed clearance.
- **The console-error listener may surface dev-mode noise** (the Next.js
  overlay) — any genuine finding is classified with evidence BEFORE
  shipping (the S32 run-1 discipline); documented exclusions must be
  signature-strict.
- **The Dashboard greeting is time-aware** — the heading assertion is the
  regex (the copy-sweep pattern), never a hardcoded bucket.
- **The suite's total runtime grows ~1 min** (20 drawer navigations at a
  third viewport) — acceptable against the S34 suite's ~26 min.
- **The suite validation run must avoid the S32 differential** — the
  ai-error/ai-a11y stages of an earlier same-window run spend the ai:
  budget the security stage probes; restart the dev server by PID (the
  in-memory limiter clears) and re-run in the clean window.

## Execution log (session 76/77 — filled as executed)

- The exploration (the plan-validation probe, parametrized by viewport on
  BOTH axes): the landscape band swept clean BEFORE the plan was written —
  **844×390, 740×360, and 932×430 × 20 views, findings 0 at every width**
  (identity heading h1||h2 with clearance, scrollWidth === the viewport
  width on every view, zero console errors, the drawer 20 links + closes;
  the nav scroll REQUIRED at every landscape height — at 844×390 measured
  scrollHeight 1068 vs clientHeight 301; the last link operable after
  scroll) — plus the **320×568 narrow-portrait edge: findings 0** (the
  future-surface documentation). The evidence validated the per-view
  heading-clearance model and the nav-scroll contract against the codebase
  before any pin was written.
- TDD RED: 13 new pins in tests/suite-verdict.test.ts (the GREEN shape
  with both contracts; the shape-error family [missing findings / a view
  record missing headingClearance / the 390×844 PORTRAIT envelope fed to
  the landscape classifier / the 768×1024 mid-band envelope fed to the
  landscape classifier / a missing drawerNavScrollable / a non-boolean
  drawerNavScrollable]; the mode-rot family [mode=dark → non-green with
  the mode + the S27 class in the note]; the findings-present family [a
  heading-clearance finding at Focus Timer; an overflow finding at 900];
  the vehicle-contract family [sidebarVisible true → the lg-contract
  note]; the short-viewport-contract family [drawerNavScrollable false →
  the geometry note]) → 7 failed / 80 passed (the unknown-audit guard
  already shape-errors the unknown name — those pins pass for the right
  reason post-implementation).
- TDD GREEN: `classifyLandscapeSweep` + the AUDIT_NAMES entry in
  src/lib/suite-verdict.ts → **87/87** in the file; the full unit layer
  **371** (20 files; was 358).
- The probe scripts/landscape-sweep.mjs (node-run; the self-verifying
  preconditions incl. BOTH-axes viewport + the chrome contract; the
  drawer-content check + the SHORT-VIEWPORT contract measured on the
  first open + the last-link operability; the 20-view sweep navigated
  THROUGH THE DRAWER at 844×390 with the heading-clearance pin; the
  explicit awaited closing light PATCH). **Genuine run 1: findings 0,
  exit 0** — all 20 views clean on the first executable sweep (the band
  was validated clean by the exploration; the S33 first-run-defect class
  did not recur).
- The runner: STAGES gains landscape-sweep between midband-sweep and
  dark-sweep; the stage-count literals 18 → 19 (the suite now 20 rows:
  preflight + 18 audits + the theme guard).
- The validation protocol (the S32 differential applied BEFORE the run):
  the dev server restarted by PID (the in-memory ai: limiter cleared —
  this session's OWN first suite run's ai-error/ai-a11y stages had spent
  the budget), the S31 preflight GREEN, then the clean-window full-suite
  run: **20/20 GREEN, exit 0** — the evidence envelope captured to
  docs/screenshots/s35-landscape-sweep-evidence.json (20 stage rows; the
  landscape-sweep row GREEN inside the suite: "20 views swept through the
  drawer at 844×390 … vehicle + nav-scroll contracts hold").
- Gates re-run: lint ✓ tsc ✓ **371 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ (4.7 min) = **662 green** (was 649; +13 unit pins; the 291
  prior pins untouched by construction — zero app code, zero CSS, zero
  Tailwind v4 surface, zero parity-pinned bytes).
- The landscape evidence screenshot captured via
  scripts/capture-s35-evidence.mjs:
  docs/screenshots/s35-landscape-drawer-844.png — the drawer OPEN at
  844×390 with the nav scrolled to its middle (the short-viewport story
  in one frame: the fixed glass app bar, the 390px-tall panel, the
  mid-list links in-frame after scroll; the measured geometry rides the
  capture envelope: navScrollRequired true, scrollHeight 1068 vs
  clientHeight 301, the mid-list link visible after scroll, scrollWidth
  844).
- Standing checks re-run post-change: the standing 31 screenshots
  refreshed via capture-studyflow.mjs (theme restored light, verified via
  Prisma: **light/violet** — the User field is `accentColor`, the S34
  field-name lesson re-confirmed).
- Docs aligned (the AP-74 guard): AGENTS (the landscape-sweep command
  entry + the 18-audit suite entry + the 371 line), vitest.config.ts (371
  + the S35 seam note), CLAUDE (371 + the S35 seam), PAD §8.1 (the
  suite-verdict row extended + the per-file count 74 → 87 + Total
  662/371), README (the 662 badge + the 371 lines ×2 + the S35 classifier
  mention + the session-35 status row), SKILL (the 662/371 counts ×2 +
  AP-80), the worklog entry, the session narrative (session_76.md).
