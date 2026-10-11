# Remediation Plan — Session 40 (S40): the accent × landscape drawer-navigation sweep — the short-viewport band's accent half (844×390), navigated through the drawer (the vehicle), as a standing, executable guarantee

**Audit surfaces (this session, session-91/92 workspace run at `8101a94`):** the
baseline gates re-confirmed the documented **731-green** state on arrival (lint
✓ tsc ✓ **440 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.4 min**), the S31 preflight ran GREEN before the checks,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → drawer closes on navigation → Settings by ref → the Profile
tab's Email address card above the Change password + Danger zone cards —
**the mobile navigation menu is working as expected**), and the reference
re-sweep: **UNCHANGED since S19–S39** (login title "AcademiaFlow (Copy)"; the
zero-data dashboard with the greeting from the email prefix "Good afternoon,
sepnetflix2023 👋"; the same 20 nav views in the same order; the same five
Settings tabs). The 20-view copy sweep (the `:3200` standalone server on
`db/custom.db`): **14/20 MATCH** with the 6 diffs all data-state (the
documented S17-pinned non-gap family: the greeting name, the zero-data
CTA/button surfaces on MyDay/Tasks/Timetable/Flashcards, the count subtitles
on Tasks/Exams). The S39 one-command standing suite result is recorded in the
execution log below.

## The governing finding (this session's work)

**The accent × landscape combo (844×390, the iPhone-class phone-landscape —
the 390–430px-tall band's canonical width) is ZERO-coverage at every one of
the 7 accents**, and the drawer-navigation interaction at the short viewport
was never varied per accent. The coverage map, verified against the standing
scripts this session:

- `landscape-sweep.mjs` (S35): all 20 views at 844×390, navigated THROUGH
  THE DRAWER — **LIGHT only** (mode-rot guarded) and **violet only** (zero
  `accentColor` references — verified by grep this session).
- `accent-light-sweep.mjs` (S37): all 7 accents × 20 views + the drawer —
  **390×844 only** (viewport-guarded), navigated by DIRECT GOTO.
- `accent-midband-sweep.mjs` (S39): all 7 accents × 20 views + the drawer —
  **768×1024 only** (viewport-guarded), navigated through the drawer.
- `accent-dark-sweep.mjs` (S38): all 7 accents × 20 views at desktop
  1280×800 AND mobile 390×844 + the drawer per accent — **dark only**; the
  844×390 width is in NEITHER surface.
- `mobile-sweep.mjs` (S33) / `midband-sweep.mjs` (S34) /
  `dark-mobile-sweep.mjs` (S36): 390×844 / 768×1024 / 390×844-dark — violet
  only, portrait-tall only.

So the landscape × accent cell of the theme-space matrix is the one the S39
summary's own next-steps named first ("the landscape × accent
drawer-navigation combo (the 844×390 sibling)"). Two gaps ride in that one
sentence:

1. **The viewport gap**: at 844×390 the SHORT-VIEWPORT structures that never
   render at portrait-tall sizes appear — the drawer nav whose scroll is the
   ONLY path to links 8–20 at 390 height (measured S35: scrollHeight 1068 vs
   clientHeight 301), the fixed h-16 app bar covering 16% of the viewport,
   the pt-* heading clearance under it, the h-[calc(100vh-8rem)] panes at
   262px — and their accent-dependent surfaces (the drawer's active-link
   tint, the sf-gradient CTAs at the landscape layout, the app bar's
   accent-tinted brand) have never been rendered at a non-violet accent by
   any standing audit. The landscape band is also a drawer-vehicle band
   (the sidebar is `lg:flex` = ≥1024) — the vehicle-contract + accent
   interaction at the short viewport is unmeasured.
2. **The interaction gap**: the S39 accent-midband-sweep proved the drawer's
   active-link accent tint follows the navigation (aria-current moves → the
   `.sf-nav-active` 10%-alpha `NAV_ACTIVE_GRADIENT_STOPS` gradient re-tints)
   — at **768×1024 only**. At 844×390 the same tint, read on a NON-Dashboard
   view's link through the real navigation lifecycle, is verified at ZERO
   views, ZERO accents. The tint rides a dynamically-built CSS var name
   (`toCssVar` kebab-case suffixes — the S8 lesson: a camelCase token
   silently resolves to no var and the gradient computes to `none`), and the
   mobile navigation menu — the owner's standing per-session emphasis —
   under a non-violet accent at the short viewport is guaranteed by nothing
   at execution time.

The landscape accent structures are real: the drawer's active-link
10%-alpha gradient (the inner span's inline `backgroundImage`), the app
bar's accent-tinted brand, every view's `sf-gradient` CTAs at the landscape
layout — the 15-var token set is unit-pinned statically for all 7 accents,
but the RUNTIME APPLICATION at 844×390 through the drawer-navigation
lifecycle had never been executed at a non-violet accent by any standing
probe.

**The companion finding (the anti-phantom doctrine, AP-83 applied):** any
future probe for this combo must be born with the S37/S38/S39 envelope
guards — the ALL-ACCENTS + ALL-VIEWS + drawer-present + applied + viewport +
mode contracts — because the coverage IS the guarantee: an envelope that
records only what it touched cannot distinguish "clean because measured"
from "clean because never rendered".

## Families and fixes

### S40-A (HIGH) — the seam `classifyAccentLandscapeSweep` + the unit pins

The seam (`src/lib/suite-verdict.ts`) gains, in the S37/S38/S39-doctrine
shape (the S39 classifier as the direct model, the landscape family's own
contracts folded in):

1. **The AUDIT_NAMES entry** `accent-landscape-sweep` + the dispatch arm.
2. **The envelope metadata shape**: `mode` (string — shape-error if
   missing; `mode !== "light"` reads NON-green, the S27 rot-guard family —
   the dark × landscape combos are the documented S36 non-gap family
   [dark-mobile-sweep's own classifier comment], and this audit owns the
   LIGHT landscape accent surface), `viewport` (must be exactly
   `{width: 844, height: 390}` on BOTH axes — the iPhone-class landscape;
   a 390×844/768×1024/1280×800 envelope fed here is a shape-error, never a
   silent re-scope), `chrome` (`sidebarVisible: false` +
   `hamburgerVisible: true` + `drawerNavScrollable: true` — the vehicle
   contract AND the short-viewport contract, the S35 family; a broken
   drawerNavScrollable at 390 height is its own finding class: links 8–20
   would be unreachable).
3. **The ALL-ACCENTS guard** (`ACCENT_LANDSCAPE_ALL_ACCENTS`): every one of
   violet, blue, green, orange, pink, red, teal must be a key on
   `accents` — a missing accent is a LOUD shape-error, never
   green-by-omission.
4. **The ALL-VIEWS guard**: every accent's `views` map must carry all 20
   canonical view labels (the DISPLAY-label convention — the drawer links'
   accessible names, the S34/S39 convention) — a missing view is a LOUD
   shape-error. Every view is recorded EXPLICITLY (clean views carry empty
   detector arrays — the S38 retirement of omission-means-clean, applied
   from birth).
5. **The per-view record shape (strict — the S39 record + the S35
   landscape keys)**: `heading` (non-empty string), `scrollWidth` (number —
   `> 844` counts as a finding, the S16/S34 overflow class),
   `drawerClosed` (boolean — the drawer must close on navigation, the
   vehicle contract), `appBar` (boolean — the fixed glass app bar with the
   2-digit-hour clock), `headingClearance` (boolean — the identity
   heading's box top at/below the fixed 64px bar; the S35 contract, 1px
   sub-pixel tolerance), `unreadable` + `lowcontrast` (arrays — the S37
   light contrast detector family), `consoleErrors` (array), `activeTint`
   (string — the drawer's active-link inner-span gradient reading while
   THIS view was active; the empty/`"none"` reading is the S8 no-var rot
   class and counts as a FINDING), and `activeLabel` (string — the
   `aria-current=page` link's label when the tint was read; a value ≠ the
   view's own label is the interaction FINDING: the active state did not
   follow the navigation).
6. **The drawer record per accent**: `linkCount` (number) +
   `unreadable`/`lowcontrast` (the dialog-scoped detectors) + `activeTint`
   + `activeView` — an `error` string on the record counts as a FINDING (a
   drawer that failed to open is a finding, never a swallow — the S38
   doctrine); a missing drawer record is a shape-error.
7. **The applied-mismatch guard**: `accents[a].applied !== a` counts as a
   finding per mismatch (the S37/S38/S39 family).
8. **The counting semantics (S37/S39-exact)**: the independent
   contrast-detection count with the three SIGNATURE-STRICT non-gap
   exemptions — the CTA-face (`color === "rgb(255, 255, 255)"` — the S11
   family-2), the calendar adjacent-month days (slate-300
   `rgb(203, 213, 225)` + 1-2-digit text — the S6-G pin), and the yellow
   priority-pill vocabulary (yellow-500 `rgb(234, 179, 8)` + {high,
   medium, low} — the S6/S8 pin); `lowcontrast` entries are WARN (the
   note, never the findings); non-empty `consoleErrors` per view ride the
   findings array as the probe recorded them.

The unit pins (`tests/suite-verdict.test.ts`, the S40 block after the S39
block; **23 pins as executed** — the GREEN shape, the guards, the families,
the exemptions, the WARN band, the unknown-audit guard): a full-shape fixture generator (`s40Envelope`) building the 7
accents × 20 views + the drawer per accent envelope at 844×390 with the
per-view `activeTint`/`activeLabel` interaction keys AND the landscape
`headingClearance` key, then the pin families — the GREEN shape with the
swept counts in the note (140 renderings + 140 tint readings + 7 drawer
records); the ALL-VIEWS guard (a view missing from one accent); the
ALL-ACCENTS guard (an accent missing); the historical S35-shape envelope (a
violet-only landscape sweep envelope fed to the new classifier — the exact
pre-S40 state — a shape-error); the missing drawer record; the missing-mode
shape-error; the wrong-viewport shape-error (the 390×844 envelope AND the
768×1024 envelope — the sibling families); the mode-rot family (`mode:
"dark"` → non-green); the applied-mismatch family; the
vehicle-contract family (`sidebarVisible: true` → the finding); the
short-viewport-contract family (`drawerNavScrollable: false` → the finding
— the S35-own class); the heading-clearance family (`headingClearance:
false` — the landscape-own class, counted as the probe's finding rides the
findings array; the pin asserts the seam's shape gate on the boolean);
the tint-rot family (`activeTint: "none"` → the S8 no-var finding); the
interaction family (`activeLabel` ≠ the view's own label → the finding);
the overflow family (`scrollWidth: 900` → finding); the strict-record
family (a record missing `lowcontrast` → shape-error; `activeTint` missing
→ shape-error; `headingClearance` missing → shape-error); the counting
preservation on the new shape (CTA-face / calendar-day / yellow-pill
exemptions each with a positive + a signature-strictness negative pin);
the drawer-error-is-a-finding family; the lowcontrast WARN family; the
unknown-audit guard. TDD: RED first — the GREEN-shape + finding-family
pins fail under the current seam (the audit name is unknown to it); GREEN:
the seam implementation; then the full-file re-run.

### S40-B (HIGH) — the probe: `scripts/accent-landscape-sweep.mjs`

1. **The vehicle**: all 20 views are navigated THROUGH THE DRAWER (the
   S33/S34/S35/S39 pattern — the drawer is the only vehicle below 1024),
   per accent, at 844×390: open the drawer → read the CURRENT active link
   (label + the inner span's inline `backgroundImage` — the
   previously-navigated view's tint) → click the next link → the drawer
   closes → the identity heading renders (h1 OR h2 — the S8-H union) → the
   heading CLEARANCE holds (box top ≥ 64px − 1px) → settle →
   `scrollWidth ≤ 844` → the light contrast detector family (unreadable
   < 2.2 / lowcontrast < 3.2 — the S37 CHECKER verbatim) → zero console
   errors (the 429-RUM backpressure exact-text filter).
2. **The short-viewport contract (measured on the first drawer open per
   accent, the S35 pattern)**: the nav MUST be scrollable at 390 height
   (`scrollHeight > clientHeight`) — a non-scrolling reading means the
   drawer geometry changed (links beyond the fold would be unreachable in
   landscape); rides the envelope's `chrome.drawerNavScrollable` (asserted
   per accent — an accent whose drawer renders non-scrollable is the
   finding).
3. **The active-tint interaction readings**: each drawer open reads the
   active link while the PREVIOUS view is still active — the per-view
   `activeLabel` + `activeTint` pair (20 readings per accent; the first
   reads the Dashboard landing, the last comes from the dedicated
   drawer-record open on the final view). The probe asserts
   `activeLabel === the expected view` loudly (the aria-current follows
   the navigation — the interaction proof) and the tint reads a
   `linear-gradient` (a `none` is the S8 no-var rot class — a finding).
4. **The drawer record per accent** (the S37/S39 DRAWER_CHECKER pattern):
   the dialog-scoped contrast detectors on the open drawer, `linkCount ===
   20` asserted loudly, the `activeView` + `activeTint` on the final
   navigated view (a NON-Dashboard view — the first standing reading of
   the tint on a navigated link per accent at the short viewport).
5. **Self-verifying preconditions (the S27/S32/S33–S39 doctrine)**: the
   viewport asserted on BOTH axes (the HEIGHT is this audit's axis); the
   chrome vehicle contract (the desktop sidebar hidden + the hamburger
   visible at 844); the mode PATCHed through the settings API (the real
   lifecycle) + verified on `<html>`; every accent PATCHed + self-verified
   on `<html data-accent>`; the closing restore an explicit, awaited,
   VERIFIED violet/light PATCH; the failure-path restore in the catch.
6. **The envelope**: `{ source, mode: "light", viewport: {844×390},
   chrome, accents: {accent → {applied, views: {label → record}, drawer}},
   findings }` — every view recorded explicitly on the single surface
   (clean views carry empty detector arrays), the S38/S39 shape from
   birth. **The S39-F flush-callback ending** (the AP-85 lesson): the
   envelope measures ~130KB, so the exit code is computed FIRST, then
   `process.stdout.write(json + "\n", () => process.exit(exitCode))`.
7. **Out of scope (documented non-goals)**: the dark × landscape family
   (the documented S36 non-gap — dark-mobile at 390 + dark-sweep/accent-dark
   at 1280 bracket it), the desktop light-accent family (the documented
   S37 non-gap — the same `.sf-nav-active` mechanism is pinned per accent
   at 390 light [S37], 768 light [S39], and 1280 dark [S38]), and any
   flashbulb detection (the light canvas does not carry the class — the
   S37 doctrine).

### S40-C (MEDIUM) — the runner: the 24th stage

`scripts/standing-suite.mjs`: the STAGES array gains
`{ name: "accent-landscape-sweep", file: "scripts/accent-landscape-sweep.mjs",
runtime: "node", timeoutMs: 20 * 60_000 }` — placed directly after
`accent-midband-sweep` (the light accent family together: light mobile →
light mid-band → light phone-landscape → dark mobile → light accent (390) →
**light accent (768, the vehicle)** → **light accent (844×390, the vehicle
at the short viewport)** → dark desktop → accent dark). The measured
runtime estimate is ~9–12 min (7 accents × [20 drawer-navigated views ×
~3–3.5 s + the applied verification + the drawer record]) — over the
10-min default, so the stage carries its own 20-min budget (the S38-C/S39
per-stage `timeoutMs` override pattern, ~70% headroom); every other stage
keeps its default. The stage-count literals `22 → 23` (the
`stage ${i + 1}/22` prints ×2, the `stage 0/22` print, the `stage 22/22`
theme-restore print) and the header comment's stage list.

### S40-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the accent-landscape-sweep command entry after
accent-midband-sweep + the 24-row suite entry + the unit-count line),
vitest.config.ts (the new unit count + the S40 seam note), CLAUDE.md (the
count + the seam note), PAD §8.1 (the suite-verdict row extended + the
per-file count + the Total), README.md (the badge + the count lines + the
session-40 status row), omni-study_SKILL.md (the counts ×2 + the AP-86
lesson — the vehicle-contract axis lesson), the worklog S40 entry, this
plan's execution log, the session narrative (`docs/session_93.md`) + the
summary (`docs/session_94.md`).

### S40-E (MEDIUM) — the evidence + the session record

The evidence envelope: the clean-window validation suite run's
`docs/screenshots/s40-accent-landscape-sweep-evidence.json` (24 stage rows,
the accent-landscape-sweep row GREEN inside the suite with the new note).
The evidence screenshot: the drawer OPEN at 844×390 in LIGHT mode under a
non-violet accent with the ACTIVE LINK ON A NAVIGATED VIEW (the tint
verification in-frame — e.g. the TEAL accent with the Notes link active
after navigating to Notes through the drawer, the drawer nav SCROLLED —
the short-viewport story in one frame), via a
`scripts/capture-s40-evidence.mjs` modeled on the S39 capture script. The
session docs: the narrative + the summary.

## Non-gaps (documented, do not fix)

- **The CTA-face** — white-on-accent-500 unreadable entries, the
  documented S11 family-2 (the reference's own accent-CTA choice). Exempt
  at the seam, signature-strict; counted into the note.
- **The calendar adjacent-month days** — slate-300 1-2-digit text on the
  light canvas, the S6-G reference-measured pin (re-verified live on the
  reference in S37). Exempt, signature-strict.
- **The yellow priority-pill vocabulary** — yellow-500 {high, medium, low}
  on the yellow-50 pill, the S6/S8 pin. Exempt, signature-strict.
- **The lowcontrast WARN family** — 2.2 ≤ contrast < 3.2, the S11 non-gap
  family. Rides the note, never the findings.
- **The 429-RUM backpressure** — the S18 beacon's designed 1000/15-min
  budget under the day's sweep volume; the exact-text signature filter
  (the S33+ doctrine).
- **The fixed-violet surfaces** — the S37 static scan classified every
  hardcoded-violet surface as measured-parity design color (the reference
  never re-themes). Reference-consistent at every accent by construction.
- **The dark × landscape family** — the documented S36 non-gap
  (dark-mobile-sweep's classifier comment: "the landscape/mid-band dark
  combos are documented non-gaps").
- **The desktop light-accent family** — the documented S37 non-gap
  (bracketed by the per-accent pins at 390 light + 768 light + 1280 dark;
  the S39 plan documents the bracket).

## TDD order

1. **The exploration (BEFORE the plan finalizes)** — the probe itself
   (S40-B) runs as the exploration against the dev server once the
   arrival suite completes (the theme-PATCH stages must not interleave):
   the whole accent × landscape drawer-navigation family swept, every
   finding classified with evidence BEFORE any seam/runner change ships
   (the S32 run-1 discipline). Expected families: the CTA-face, the
   calendar adjacent days, the yellow pills, and the WARN band (all
   documented above); anything else is a genuine finding and re-scopes
   this plan.
2. **RED** — the S40 pin block written first; the GREEN-shape +
   finding-family pins fail under the current seam (the audit name is
   unknown to it — `classifyAudit` shape-errors every envelope for the
   new name; the shape-error pins pass vacuously through the
   unknown-audit path and will re-pass for the right reason after the
   seam exists); `bunx vitest run tests/suite-verdict.test.ts` shows the
   failures.
3. **GREEN** — the seam implementation (S40-A); the file re-runs clean;
   the full unit layer re-runs clean.
4. **The genuine re-run** — the probe's run 1 evidence re-checked against
   the seam (the raw envelope classified GREEN at the new classifier).
5. **The runner integration** (S40-C) + the validation protocol — the dev
   server restarted by PID (the S32 clean-window remedy — the ai:/RUM
   budgets), the S31 preflight GREEN, then the clean-window full-suite
   run **24/24 GREEN, exit 0**; the evidence envelope captured.
6. **The gates** — lint ✓ tsc ✓ unit (the new count) ✓ build ✓ cold-db
   **291 e2e** ✓ (the 291 prior pins untouched by construction — zero
   app code, zero CSS, zero Tailwind v4 surface, zero parity-pinned
   bytes).
7. **The standing checks** — the drawer check GREEN; the evidence
   screenshot captured; the standing 31 screenshots refreshed; the theme
   verified light/violet via Prisma (the closing guard).
8. **The docs** — S40-D + S40-E; the workspace worklog; the commit + the
   push via the SSH wrapper (`--remote git@github.com:nordeim/omni-study.git`).

## Risks

- **The suite runtime grows ~9–12 min** (the new stage) — the suite runs
  ~65 min total; the ai: budget is untouched (zero AI requests by
  construction).
- **The RUM budget under the day's sweep volume** — the exploration (140
  navigated loads) + the genuine runs + the suite's own sweeps can
  exhaust the 1000/15-min beacon budget; the 429 class is documented,
  the probe filters the exact-text signature, and the validation run
  restarts the dev server first (the S32 differential).
- **The drawer-click flake** — 140 drawer opens + 140 link clicks per
  genuine run at the short viewport (links 8–20 live below the fold; the
  click auto-scrolls the link into view — the S35 proof); a flaky
  open/click surfaces as a finding or a precondition failure and the run
  is re-run (the loud-failure doctrine, accepted — the S38/S39 risk
  family).
- **The activeLabel mid-flight read** — the `aria-current=page` state is
  read at the NEXT drawer open (the previous view still active); the
  drawer open happens after the view settled (the 1200 ms band), so the
  state is stable; a race would surface as the interaction FINDING (the
  loud-failure doctrine).
- **The envelope size** (~130KB — 7 accents × 20 views × the strict
  record + the tint strings) — the S39-F flush-callback ending is applied
  from birth (the AP-85 lesson; a bare process.exit can truncate the
  async pipe write — the accent-light coin flip caught in S39).
- **The e2e database must be cold for the 291 gates** (`db/e2e.db`
  deleted before the run — the seed short-circuits on the demo user).
- **The `:3200`/`:3100` traps** — kill every standalone listener BY PID
  before any sweep measures a server; verify the served database first
  (the AP-70 lesson, re-learned S38/S39).

## Execution log (session 93 — filled as executed)

- The arrival standing suite (the S39 one-command suite, run in the fresh
  clean window after the dev-server restart by PID): **23/23 GREEN, exit
  0** — zero code findings on arrival (the accent-light row: "7 accents
  swept × 140 view renderings + 7 drawer records at 390×844"; the
  accent-midband row GREEN inside the suite with identical counts to its
  S39 validation run — deterministic).
- The exploration (the genuine run 1, the probe itself against the dev
  server, `/tmp/s40-exploration.json`): **the family is CLEAN — findings 0
  across all 140 drawer-navigated renderings + 7 drawer records** (~5.5
  min measured — under the 20-min stage budget with ~3.6× headroom):
  - **the interaction is GREEN**: `activeLabel === the view` on all 140
    readings (the aria-current link follows the navigation through the
    drawer at every accent, at the SHORT viewport), `activeTint` read a
    `linear-gradient` on all 140 (7 DISTINCT accent-correct pairs — the
    violet rgba(139,92,246,.1)→rgba(99,102,241,.1) through teal
    rgba(20,184,166,.1)→rgba(6,182,212,.1) — the per-accent
    NAV_ACTIVE_GRADIENT_STOPS pairs, the S39 proof extended to 844×390);
  - **the short-viewport contracts hold at EVERY accent**: the drawer nav
    scrollable at 390 height (re-measured per accent, 7/7 — the only path
    to links 8–20), the heading clearance under the fixed 64px bar × 140,
    the drawer's active link on the FINAL navigated view (Settings)
    verified per accent (7/7);
  - **structural family clean**: scrollWidth ≤ 844 on every rendering
    (the Timetable canvas inside its container at every accent),
    drawer-closed-on-navigation × 140, the app bar + clock × 140, zero
    console errors (the 429-RUM class filtered per the signature);
  - **the surfaced unreadable entries — all three documented families**:
    108 CTA-face (white on accent-500 — the S11 family-2, identical to
    the S37/S39 counts), 28 calendar adjacent-month days (slate-300 —
    the S6-G pin), 21 yellow priority pills (yellow-500 — the S6/S8
    pin); **zero non-exempt**;
  - **588 lowcontrast WARN** (the S11 non-gap family — the identical
    count to the S39 mid-band exploration, the same views rendering the
    same WARN surfaces at both widths).
  No genuine finding surfaced — the plan ships as the coverage extension
  (no re-scope needed). The envelope classified **GREEN at the new seam**
  ("7 accents swept × 140 view renderings + 140 active-tint readings + 7
  drawer records at 844×390 in MODE light, navigated through the drawer;
  every accent self-verified applied; the short-viewport contracts hold;
  108 CTA-face exempt; 28 calendar adjacent-day exempt; 21 yellow-pill
  exempt; 588 WARN") — the first classification of a real envelope, clean
  on the first try (the S39 label-convention lesson held: the S40 seam
  used the display-label convention from birth).
- The validation run (the S32 differential applied — dev server
  restarted by PID, preflight GREEN, the fresh clean window): **24/24
  GREEN, exit 0** — the new accent-landscape-sweep row GREEN inside the
  suite on its first integration (identical counts to the exploration:
  140 renderings, 140 tint readings, 7 drawer records, 108/28/21
  exempt, 588 WARN — deterministic; ~5.5 min measured against the
  20-min stage budget), every other stage green, the theme-restore
  closing guard light/violet. The evidence envelope captured to
  `docs/screenshots/s40-accent-landscape-sweep-evidence.json` (24 stage
  rows).
- Gates re-run: lint ✓ tsc ✓ **463 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ (4.5 min) = **754 green** (was 731; +23 unit pins; the
  291 prior pins untouched by construction — zero app code, zero CSS,
  zero Tailwind v4 surface, zero parity-pinned bytes).
- Standing checks re-run post-change: the drawer check GREEN; the S40
  evidence screenshot captured via `scripts/capture-s40-evidence.mjs`:
  `docs/screenshots/s40-accent-landscape-drawer-teal-notes-844.png` —
  the drawer OPEN at 844×390 in LIGHT mode under the TEAL accent with
  the ACTIVE LINK ON THE NAVIGATED NOTES VIEW, the nav SCROLLED into
  view (the record verified in-frame: linkCount 20, activeLabel
  "Notes", the teal active-tint gradient rgba(20, 184, 166, 0.1) →
  rgba(6, 182, 212, 0.1) — the NAV_ACTIVE_GRADIENT_STOPS teal pair —
  light mode, navScrollable true, scrollWidth 844); the standing 31
  screenshots refreshed via `capture-studyflow.mjs` (theme restored
  light); the closing theme guard verified via Prisma: **light/violet**.
- Docs aligned (the AP-74 guard): AGENTS.md (the 463 line + the
  accent-landscape-sweep command entry + the 22-audit suite entry),
  vitest.config.ts (463), CLAUDE.md (463 + the S40 seam note), PAD §8.1
  (the suite-verdict row extended with the S39 + S40 classifiers + the
  per-file count 156 → 179 + Total 754/463), README (the 754 badge +
  the 463 lines ×2 + the S40 classifier mention + the session-40 status
  row), SKILL.md (the 754/463 counts ×2 + AP-86). The worklog entry +
  the session_93 narrative + the session_94 summary.
