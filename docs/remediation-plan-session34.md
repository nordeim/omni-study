# Remediation Plan — Session 34 (S34): the mid-band light-mode sweep — the 391–1023px viewport continuum between the pinned endpoints, as a standing, executable guarantee

**Audit surfaces (this session, session-72/73 workspace run at `0f6add0`):** the
baseline gates re-confirmed the documented **638-green** state on arrival (lint
✓ tsc ✓ **347 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.4 min**), the S31 preflight ran GREEN before the suite,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → Settings by ref → the S26/S24/S25 cards on the Profile tab
— **the mobile navigation menu is working as expected**), and the reference
re-sweep: **UNCHANGED since S19–S33** (login title "AcademiaFlow (Copy)";
zero-data 0/0 dashboard with the greeting from the email prefix; the same 20
nav views in the same order; the same five Settings tabs with School/Grade on
Profile). The 20-view copy sweep: **14/20 MATCH** with the 6 diffs all
data-state (the documented S17-pinned non-gap family). The S33 one-command
standing suite ran **18/18 GREEN, exit 0** — zero code findings across the
whole production-readiness sweep. The demo user's theme verified light/violet
(the closing guard).

## The governing finding (this session's work)

**The viewport continuum between the pinned widths — the whole 391–1023px
band — is guaranteed by NOTHING.** The standing surface treats "mobile" as
ONE width (the S33 390×844 sweep) and "desktop" as two (the 1280×800 audit
scripts and the 1440×900 e2e specs), plus a single lg-pin (1024×800 — the
sidebar-appearance spec on Dashboard ONLY). Three pieces of evidence, all
captured live this session:

1. **The band contains TWO live breakpoints with real structural switches.**
   At `sm` (640) the stat-card grids go multi-column
   (`shared.tsx` — `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`) and the
   sm-family switches engage. At `md` (768) the **Timetable swaps its entire
   layout** — the `md:hidden` mobile accordion hides and the `md:block`
   `min-w-[900px]` scroll canvas appears inside `overflow-x-auto`
   (timetable-view.tsx:240/310) — while task/exam headers go `md:flex-row`,
   grids go `md:grid-cols-2`, and the Tasks search goes `md:w-64`. None of
   these switches is asserted at its boundary width by ANY standing audit.
2. **The whole band is drawer-navigation territory** (`sidebar = hidden
   lg:flex`, `app bar = lg:hidden` — mobile-chrome.tsx): at 391–1023 the
   mobile navigation menu is STILL the only navigation vehicle, yet the
   drawer round-trip is only swept at 390 (mobile-sweep) — a drawer
   regression that only manifests at a wider canvas would surface in no
   standing audit.
3. **This session's executable exploration is the evidence the current state
   is green — across the whole band.** A parametrized probe swept **four
   widths (640, 767, 768, 1023) × 20 views**: every view rendered its
   identity heading (the h1||h2 union — the two-pane mobile stacks are
   `lg:hidden` and render their h2s through the whole band), zero horizontal
   overflow at every width, zero console errors, the drawer carried 20 links
   and closed on navigation. Findings 0 at all four widths. The state is
   green today; the guarantee is absent — the S16 lesson one band out:
   *"mobile-only parity gaps hide behind desktop pins"* generalizes to
   *any gap between pinned widths hides forever*.

The deliverable: **`scripts/midband-sweep.mjs`** — the standing probe at
**768×1024** (the md breakpoint — the switchiest width in the band: the
Timetable layout swap + the multi-column transitions + the flex-row headers,
all at md; iPad portrait, a real device class), navigated THROUGH THE DRAWER
(the navigation vehicle through the whole band), asserting per view the S33
family — the identity heading, `documentElement.scrollWidth ≤ 768`, the
drawer closed on navigation, the fixed glass app bar (brand + 2-digit-hour
clock), zero console errors — plus the mid-band chrome contract: the sidebar
hidden AND the hamburger visible (the drawer-is-the-vehicle precondition),
with the S27 self-verifying-precondition doctrine (the viewport asserted,
light mode PATCHed through the settings API and verified on `<html>`) and
the S32 anti-phantom shape contract.

## Families and fixes

### S34-A (HIGH) — the seam extension `classifyMidbandSweep` + the unit pins

The CLAUDE.md doctrine (pure logic in `src/lib/*` seams with unit pins):

- `AUDIT_NAMES` gains `"midband-sweep"` (after `"mobile-sweep"`, before
  `"dark-sweep"` — the light-mode mobile family, then the light-mode
  mid-band family, then the dark-mode families, the documented stage order).
- `classifyAudit("midband-sweep", envelope)` → `classifyMidbandSweep`:
  - `mode` must be the string `"light"` — anything else is a non-green
    `mode=X — the sweep ran in the wrong mode (the S27 rot class)` finding.
  - `viewport` must be an object carrying `width: 768` — the sweep at
    another width (390 included) is a shape-error: the finding classes are
    width-dependent, and the band's representative width is the md
    breakpoint.
  - `chrome` must be an object with boolean `sidebarVisible` and boolean
    `hamburgerVisible` — a missing or wrong-typed key is a LOUD shape-error
    (the anti-phantom guard). And a well-formed envelope whose
    `sidebarVisible === true` or `hamburgerVisible === false` reads
    NON-GREEN with the vehicle-contract note (the lg contract — sidebar only
    ≥1024 — broke; the drawer is the vehicle through the whole band; the
    seam is the interpretation layer, the S32 doctrine).
  - `views` must be an object; every `views.{view}` must carry a string
    `heading`, a number `scrollWidth`, a boolean `drawerClosed`, a boolean
    `appBar`, and an Array `consoleErrors` — shape-strict.
  - `drawer` must carry `linkCount` (number) + `order` (string).
  - `findings` must be an Array; green iff empty AND the chrome contract
    holds. The note counts the views swept and the drawer round-trips.
- Pinned in `tests/suite-verdict.test.ts` (the S33 in-file extension
  pattern): the GREEN shape fixture; the shape-error family (missing
  `findings`; a view record missing `scrollWidth`; `viewport.width` 390 — a
  mobile-sweep envelope fed to the mid-band classifier must shape-error; a
  missing `chrome`); the mode-rot family (`mode: "dark"` → non-green with
  the mode in the note); the findings-present family (an overflow finding at
  800 → non-green); the chrome-contract family (`sidebarVisible: true` →
  non-green with the lg-contract note — the NEW class this audit owns).

### S34-B (HIGH) — the probe `scripts/midband-sweep.mjs`

Run as `node scripts/midband-sweep.mjs` (node-run like mobile-sweep — it
imports no TS seam; the runner classifies). Stages:

1. **Self-verifying preconditions (the S27/S32/S33 doctrine):** launch
   Chromium at 768×1024; login as the demo user (demo@studyflow.app); assert
   `window.innerWidth === 768`; PATCH `themeMode: "light"` through the
   settings API (the real lifecycle), await, reload, verify `<html>` carries
   no `dark` class; **the chrome contract**: the desktop `aside` sidebar is
   hidden AND the "Open navigation menu" hamburger is visible (the drawer is
   the vehicle at 768 — if the lg contract broke, the probe refuses to
   measure). Any precondition failure: loud stderr + `process.exit(1)` with
   NO findings.
2. **The drawer-content check (once, on the first open):** the hamburger
   opens the dialog; exactly 20 links in the documented NAV order; no
   footer. Close it before the sweep (the overlay-interception class).
3. **The 20-view sweep, navigated THROUGH THE DRAWER:** for each view in NAV
   order — open the drawer, click the view's link, then assert: the URL is
   the view's path; the drawer dialog is hidden (closed on navigation); the
   identity heading is visible (h1 OR h2 — the two-pane mobile stacks render
   h2s through the whole band, the S8-H pattern; Dashboard is the
   time-aware greeting regex); `documentElement.scrollWidth ≤ 768` (no
   horizontal overflow — the Timetable's min-w-[900px] canvas must live
   INSIDE its overflow-x-auto container, never widen the document); zero
   console errors (per-view delta); the fixed glass app bar renders with the
   brand and the 2-digit-hour clock (the app bar is lg:hidden — visible
   through the whole band). A ~1200 ms data settle per view.
4. **The closing restore:** an explicit, awaited `themeMode: "light"` PATCH
   (the demo resting state), then browser close.
5. **Output:** one JSON envelope `{ source: "midband-sweep", mode, viewport,
   chrome: { sidebarVisible, hamburgerVisible }, drawer: { linkCount,
   order }, views: {...}, findings: [...] }`; exit 0 iff findings empty AND
   preconditions held.

**Findings vocabulary:** the S33 family — `overflow` (scrollWidth > 768),
`no-heading`, `drawer-stuck`, `console-error`, `app-bar`, `link-count`,
`precondition` (never emitted — preconditions exit 1 with no findings) —
plus `vehicle` (the chrome contract broke: the sidebar rendered or the
hamburger vanished at 768).

**Negative controls (the S27–S33 validation convention):** (a) the
fabricated findings envelope through the seam reads non-green (unit-pinned);
(b) the mode-rot envelope (`mode: "dark"`) reads non-green (unit-pinned);
(c) the chrome-contract envelope (`sidebarVisible: true`) reads non-green
(unit-pinned); (d) the dead-server case aborts at the standing-suite
preflight stage (the runner's stage-0 enforcement, unchanged); (e) the
genuine run against the healthy dev server → findings 0, exit 0.

### S34-C (HIGH) — the runner update `scripts/standing-suite.mjs`

- `STAGES` gains `{ name: "midband-sweep", file:
  "scripts/midband-sweep.mjs", runtime: "node" }` after `mobile-sweep`,
  before `dark-sweep` — the light-mode mobile family, then the light-mode
  mid-band family, then the dark-mode families (the sweep PATCHes light
  explicitly; the closing theme guard still verifies light/violet at suite
  end).
- The stage-count literals 17 → 18 (`stage 0/18`, `stage ${i+1}/18`, the
  closing `stage 18/18`) — the suite is now 19 rows (preflight + 17 audits
  + the theme guard).
- The midband-sweep stage makes ZERO AI requests (no ai: budget
  interaction with the security stage — impossible by construction).

### S34-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

- `AGENTS.md`: the commands-table entry `node scripts/midband-sweep.mjs` +
  the standing-suite entry's audit list gains midband-sweep (16 → 17
  standing audits) + the unit-count line (347 → the new count).
- `vitest.config.ts`: the header seam list note + the count (347 → the new
  count; still 20 files — the pins ride `tests/suite-verdict.test.ts`).
- `CLAUDE.md`: the unit-layer count + the midband-sweep seam mention.
- `Project_Architecture_Document.md` §8.1: the suite-verdict row's
  description + the Total row re-derived (638 → the new count).
- `README.md`: the session-34 status row + the §Testing counts + the badge.
- `omni-study_SKILL.md`: the counts ×2 + **AP-79** (the lesson — below).
- `worklog.md` (repo root): the S34 entry.

**AP-79 (the lesson, MEDIUM):** S16 taught that mobile-only gaps hide
behind desktop pins; S33 encoded the 390 walkthrough; S34 finds the SAME
class one band out — **the viewport continuum between pinned widths**. The
audit surface treated "mobile" as one width and "desktop" as two, leaving
the whole 391–1023px band — two live breakpoints (sm 640, md 768), the
Timetable's accordion→canvas layout swap, the multi-column grid
transitions, and the drawer-only navigation territory — un-probed by any
standing audit. The guard: when a surface is width-dependent, pin the
BREAKPOINT widths where the structure swaps, not just the device-class
endpoints; a viewport band between two pinned widths is a blind band, and
any regression inside it surfaces in no standing audit. The midband-sweep
probe pins the band's switchiest width (768, the md breakpoint) with the
same drawer-vehicle doctrine as the mobile sweep.

### S34-E (MEDIUM) — the session record + evidence

`docs/remediation-plan-session34.md` (this file, with the execution log),
the session narrative, the S34 evidence JSON
(`docs/screenshots/s34-midband-sweep-evidence.json` — the genuine 19-stage
suite envelope), the mid-band evidence screenshot
(`docs/screenshots/s34-midband-timetable-768.png` — the Timetable at
768×1024, the view whose layout swaps at md), and the standing-31 screenshot
refresh (no app bytes move; the refresh proves the tree unchanged).

## Non-gaps (documented, do not fix)

1. **No e2e spec is added** (the S27–S33 convention: probe scripts are
   execution-validated, not browser-pinned; the e2e layer already pins the
   lg-boundary sidebar swap at 1024 — mobile-navigation.spec.ts — and the
   drawer geometry + round-trips at 390).
2. **The band's other widths are not separately pinned** — 640/767/1023
   were validated clean THIS session (the exploration evidence); the
   standing probe pins 768 (the md breakpoint, the switchiest width). A
   future regression at another in-band width surfaces through the
   structural switches at 768 (the grids/canvas/drawer all engage there)
   or through the mobile/desktop endpoints.
3. **The reference-side mid-band sweep stays manual** (the S32/S33
   non-gap: the standing suite is clone-side by design; the reference
   itself overflows at 390 on 5 views — the clone is the superset — and
   its mid-band behavior was documented in S33's reference-side mobile
   sweep).
4. **Landscape (844×390) and 320px reflow stay un-pinned** — real surfaces,
   but lower-risk (no structural breakpoint between 390 and 320; landscape
   changes height, not the width-driven structure). Documented for a
   future session.
5. **The copy sweep stays outside the suite** (reference-dependent; 14/20 +
   6 data-state non-gaps — the documented S17 family, re-confirmed this
   session).

## TDD order

1. **RED:** extend `tests/suite-verdict.test.ts` with the midband-sweep
   classifier pins (the GREEN fixture; the shape-error family; the mode-rot
   family; the findings-present family; the chrome-contract family). Run →
   fails (classifyAudit reads "unknown audit" on the new name — the
   unknown-audit guard). Capture the failing run.
2. **GREEN:** implement `classifyMidbandSweep` + the `AUDIT_NAMES` entry in
   `src/lib/suite-verdict.ts`. Run → the new pins green alongside 347.
3. **The probe:** `scripts/midband-sweep.mjs` (node-run; the self-verifying
   preconditions incl. the chrome contract; the drawer-content check; the
   20-view drawer-navigation sweep at 768×1024; the closing restore).
   Execution-validate live against the dev server → findings 0, exit 0.
4. **The runner:** the STAGES entry + the 18-count literals; the genuine
   full-suite re-run → **19/19 GREEN, exit 0** (the validation run; its
   envelope is the S34 evidence).
5. **Full gates re-run:** lint → typecheck → unit (the new count) → build →
   cold-`db/e2e.db` 291 e2e — the regression confirmation (zero app code,
   zero CSS, zero Tailwind v4 surface, zero parity-pinned bytes).
6. **Standing checks re-run:** the drawer check; the mid-band evidence
   screenshot; the standing 31 screenshots refreshed via
   capture-studyflow.mjs (theme restored light, verified via Prisma); the
   S34 evidence JSON captured.
7. **Docs** (S34-D) + the session record (S34-E) + commit + push via the
   SSH wrapper.

## Risks

- **The drawer must close after the content check** (the S33 first-run
  artifact — the open overlay intercepts the hamburger; the probe closes it
  via Escape and waits for hidden before the per-view loop).
- **The Timetable canvas at 768** is a DESIGNED horizontal scroll
  (min-w-[900px] inside overflow-x-auto) — the probe asserts
  `documentElement.scrollWidth ≤ 768` (the document must never widen), NOT
  that the canvas fits (it must not — that is the md design).
- **The console-error listener may surface dev-mode noise** (the Next.js
  overlay) — any genuine finding is classified with evidence BEFORE
  shipping (the S32 run-1 discipline); documented exclusions must be
  signature-strict.
- **The Dashboard greeting is time-aware** — the heading assertion is the
  regex (the copy-sweep pattern), never a hardcoded bucket.
- **The suite's total runtime grows ~1 min** (20 drawer navigations at a
  second width) — acceptable against the S33 suite's ~25 min.

## Execution log (session 72/73 — filled as executed)

- The exploration (the plan-validation probe, parametrized by width): the
  whole band swept clean BEFORE the plan was written — **640, 767, 768, and
  1023 × 20 views, findings 0 at every width** (identity heading h1||h2,
  scrollWidth === the viewport width on every view, zero console errors,
  the drawer 20 links + closes; at 768: sidebarVisible false,
  hamburgerVisible true). The evidence validated the per-view heading model
  and the vehicle contract against the codebase before any pin was written.
- TDD RED: 11 new pins in tests/suite-verdict.test.ts (the GREEN shape
  with the chrome contract; the shape-error family [missing findings / a
  view record missing scrollWidth / the 390 viewport — a mobile-sweep
  envelope fed to the mid-band classifier / a missing chrome record / a
  non-boolean chrome field]; the mode-rot family [mode=dark → non-green
  with the mode + the S27 class in the note]; the findings-present family
  [overflow at 800]; the chrome-contract family [sidebarVisible true → the
  lg-contract note; hamburgerVisible false → the vehicle note]) →
  6 failed / 352 passed (the unknown-audit guard already shape-errors the
  unknown name — those pins pass for the right reason post-implementation).
- TDD GREEN: `classifyMidbandSweep` + the AUDIT_NAMES entry in
  src/lib/suite-verdict.ts → **358/358** (20 files; was 347).
- The probe scripts/midband-sweep.mjs (node-run; the self-verifying
  preconditions incl. the chrome vehicle contract; the drawer-content
  check; the 20-view sweep navigated THROUGH THE DRAWER at 768×1024; the
  explicit awaited closing light PATCH). **Genuine run 1: findings 0,
  exit 0** — all 20 views clean on the first executable sweep (the band
  was validated clean by the exploration; the S33 first-run-defect class
  did not recur — the probe's heading selector used the h1||h2 union from
  the start, the S33 lesson applied).
- The runner: STAGES gains midband-sweep between mobile-sweep and
  dark-sweep; the stage-count literals 17 → 18 (the suite now 19 rows:
  preflight + 17 audits + the theme guard).
- The first full-suite validation run: **18/19 — security alone**, the
  documented **S32 pre-spent-budget differential** (cutoffAt=16,
  statuses=400,429 — this session's OWN first suite run's ai-error/ai-a11y
  stages had spent 4 of the ai: budget's 20 within the 15-min window; the
  S32 session's run-2 measured cutoffAt=15 the same way). Verified against
  the raw envelope BEFORE classification: NOT a code defect, and unrelated
  to the S34 change (the security stage probes the AI limiter shape; the
  midband stage makes zero AI requests). The documented remedy applied:
  the dev server restarted by PID (the in-memory limiter cleared), the S31
  preflight GREEN, then the clean-window re-run.
- **The clean-window validation run: 19/19 GREEN, exit 0** — the evidence
  envelope captured to docs/screenshots/s34-midband-sweep-evidence.json
  (19 stage rows; the midband-sweep row GREEN inside the suite on BOTH
  runs — the new stage itself was never the failure).
- Gates re-run: lint ✓ tsc ✓ **358 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ (4.6 min) = **649 green** (was 638; +11 unit pins; the 291
  prior pins untouched by construction — zero app code, zero CSS, zero
  Tailwind v4 surface, zero parity-pinned bytes).
- The mid-band evidence screenshot captured via scripts/capture-s34-evidence.mjs:
  docs/screenshots/s34-midband-timetable-768.png — the Timetable at
  768×1024 with the md-swap verified in-frame (the "Week grid" canvas
  visible, the "Week grid mobile" accordion hidden, scrollWidth 768).
- Standing checks re-run post-change: the drawer check GREEN; the standing
  31 screenshots refreshed via capture-studyflow.mjs (theme restored
  light, verified via Prisma: light/violet).
- Docs aligned (the AP-74 guard): AGENTS (the midband-sweep command entry
  + the 17-audit suite entry + the 358 line), vitest.config.ts (358 + the
  S34 seam note), CLAUDE (358 + the S34 seam), PAD §8.1 (the suite-verdict
  row extended + the row count 63 → 74 + Total 649/358), README (the 649
  badge + the 358 lines + the S34 classifier mention + the session-34
  status row), SKILL (the 649/358 counts ×2 + AP-79), the worklog entry,
  the session narrative.
