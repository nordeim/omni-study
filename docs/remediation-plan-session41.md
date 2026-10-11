# Remediation Plan — Session 41 (S41): the desktop light-accent sidebar-navigation sweep — the desktop family's light half (1280×800), navigated through the sidebar (the desktop vehicle), as a standing, executable guarantee

**Audit surfaces (this session, session-95/96 workspace run at `9b88f09`):** the
baseline gates re-confirmed the documented **754-green** state on arrival (lint
✓ tsc ✓ **463 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.4 min**), the S31 preflight ran GREEN before the checks,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → the active link "Notes" with the violet
NAV_ACTIVE_GRADIENT_STOPS gradient after drawer navigation → drawer closes on
navigation — **the mobile navigation menu is working as expected**), and the
reference re-sweep: **UNCHANGED since S19–S40** (login title "AcademiaFlow
(Copy)"; the zero-data dashboard with the greeting from the email prefix "Good
evening, sepnetflix2023 👋"; the same 20 nav views in the same order; the same
five Settings tabs). The 20-view copy sweep (the `:3200` standalone server on
`db/custom.db`): **14/20 MATCH** with the 6 diffs all data-state (the
documented S17-pinned non-gap family: the greeting name, the zero-data
CTA/button surfaces on MyDay/Tasks/Timetable/Flashcards, the count subtitles
on Tasks/Exams). The S40 one-command standing suite result is recorded in the
execution log below.

## The governing finding (this session's work)

**The desktop light-accent combo (1280×800 × light × accent) is ZERO-coverage
at every one of the 7 accents, AND the SIDEBAR's active-link accent tint (the
desktop navigation vehicle) has never been read on a NON-Dashboard view through
the real navigation lifecycle by ANY standing artifact — in either mode.** The
coverage map, verified against the standing scripts this session:

- `accent-dark-sweep` (S38): all 7 accents × 20 views at desktop **1280×800**
  — **DARK only** (its own name is the blind spot), navigated by DIRECT GOTO,
  and its desktop pass never reads the sidebar's active link at all (the
  drawer record is the mobile pass's own surface).
- `accent-light-sweep` (S37): all 7 accents × 20 views — **390×844 only**,
  DIRECT GOTO.
- `accent-midband-sweep` (S39): all 7 accents × 20 views — **768×1024 only**,
  through the drawer.
- `accent-landscape-sweep` (S40): all 7 accents × 20 views — **844×390 only**,
  through the drawer.
- `dark-sweep` (S27): 1280×800 — dark, violet only.
- The e2e layer: the S8 gradient pin reads the tint on the **DASHBOARD** link
  only, violet only (`parity-session8.spec.ts` — `nav a[aria-current="page"] >
  span` after `goto("/Dashboard")`); `navigation.spec.ts` moves aria-current to
  Tasks but never reads the TINT on the navigated link.

So the desktop light-accent family — the documented S37 "bracketed non-gap"
(bracketed by per-accent pins at 390 light [S37], 768 light [S39], 1280 dark
[S38]) — is the S40 summary's own named next step ("the desktop light-accent
family (currently the documented bracketed non-gap)"). Three gaps ride in that
one sentence:

1. **The viewport × mode gap**: at 1280×800 in LIGHT mode, no view has ever
   been rendered at a non-violet accent by any standing audit. The desktop
   light structures — the sidebar's own glass panel, the clock chip, the
   `lg:ml-[260px]` content offset, the `lg:p-8` desktop padding rhythm, the
   Timetable's min-w-[900px] canvas fitting INSIDE the 956px desktop content
   area (at 1280 it fits; at 844 it needed the container) — and their
   accent-dependent surfaces (the `.sf-gradient` CTAs, the active-link tint,
   the brand gradient) have never been exercised at a non-violet accent in
   light by any standing probe.
2. **The vehicle-interaction gap**: the S39/S40 interaction proofs proved the
   DRAWER's active-link accent tint follows the navigation (aria-current
   moves → the `.sf-nav-active` 10%-alpha `NAV_ACTIVE_GRADIENT_STOPS` gradient
   re-tints) — at 768×1024 and 844×390. The SIDEBAR — the desktop vehicle,
   the one surface the reference's desktop users actually navigate with — has
   its tint verified at ZERO views, ZERO accents, in EITHER mode (the e2e
   pins read Dashboard-only; accent-dark's desktop pass navigates by direct
   goto and never reads it). The tint rides the same dynamically-built CSS
   var name (`toCssVar` kebab-case suffixes — the S8 lesson: a camelCase token
   silently resolves to no var and the gradient computes to `none`), and the
   mobile navigation menu's desktop sibling is the owner's standing
   per-session emphasis.
3. **The vehicle-contract INVERSION + the sidebar-own scroll contract**: at
   1280 the navigation vehicle contract INVERTS — the sidebar MUST be visible
   (`lg:flex` = ≥1024) and the hamburger/app bar MUST be hidden (`lg:hidden`)
   — the mirror of the S33/S34/S35/S39/S40 vehicle contracts, never asserted
   by any standing probe at this width. AND the sidebar nav is its own
   short-viewport structure at 800 height: measured this session
   (scrollHeight **1068** vs clientHeight **534**) — the nav's scroll is the
   ONLY path to links ~13–20, the desktop sibling of the S35
   drawerNavScrollable contract, never measured by any standing probe.

The desktop accent structures are real: the sidebar's active-link 10%-alpha
gradient (the same NavItemLink inner-span inline `backgroundImage` — the
sidebar and the drawer render IDENTICAL nav items by construction, the S3
extraction), the brand tile's accent gradient, every view's `sf-gradient` CTAs
at the desktop layout — the 15-var token set is unit-pinned statically for all
7 accents, but the RUNTIME APPLICATION at 1280×800 in LIGHT mode through the
sidebar-navigation lifecycle had never been executed at a non-violet accent by
any standing probe.

**The companion finding (the anti-phantom doctrine, AP-83 applied):** any
future probe for this combo must be born with the S37/S38/S39/S40 envelope
guards — the ALL-ACCENTS + ALL-VIEWS + sidebar-present + applied + viewport +
mode contracts — because the coverage IS the guarantee: an envelope that
records only what it touched cannot distinguish "clean because measured" from
"clean because never rendered".

## Families and fixes

### S41-A (HIGH) — the seam `classifyAccentDesktopSweep` + the unit pins

The seam (`src/lib/suite-verdict.ts`) gains, in the S37/S38/S39/S40-doctrine
shape (the S40 classifier as the direct model, the desktop family's own
contracts folded in):

1. **The AUDIT_NAMES entry** `accent-desktop-sweep` + the dispatch arm.
2. **The envelope metadata shape**: `mode` (string — shape-error if missing;
   `mode !== "light"` reads NON-green, the S27 rot-guard family — the desktop
   DARK accent family belongs to accent-dark-sweep, its own standing
   surface), `viewport` (must be exactly `{width: 1280, height: 800}` on BOTH
   axes — the canonical desktop width the dark family already sweeps; a
   390×844/768×1024/844×390 envelope fed here is a shape-error, never a
   silent re-scope), `chrome` (`sidebarVisible: true` +
   `hamburgerVisible: false` + `sidebarNavScrollable: true` — the INVERTED
   vehicle contract AND the sidebar-own scroll contract; a broken
   sidebarNavScrollable at 800 height is its own finding class: links ~13–20
   would be unreachable).
3. **The ALL-ACCENTS guard** (`ACCENT_DESKTOP_ALL_ACCENTS`): every one of
   violet, blue, green, orange, pink, red, teal must be a key on `accents` —
   a missing accent is a LOUD shape-error, never green-by-omission.
4. **The ALL-VIEWS guard**: every accent's `views` map must carry all 20
   canonical view labels (the DISPLAY-label convention — the sidebar links'
   accessible names, the S34/S39/S40 convention) — a missing view is a LOUD
   shape-error. Every view is recorded EXPLICITLY (clean views carry empty
   detector arrays — the S38 retirement of omission-means-clean, applied
   from birth).
5. **The per-view record shape (strict — the S39/S40 record + the desktop
   keys)**: `heading` (non-empty string), `scrollWidth` (number — `> 1280`
   counts as a finding, the S16/S34 overflow class), `sidebarVisible`
   (boolean — the sidebar PERSISTS through navigation, the desktop vehicle
   contract per view; the drawer-closes sibling), `headingOffset` (boolean —
   the identity heading's box left at/right of the fixed 260px sidebar; the
   desktop clearance contract — a `lg:ml-[260px]` regression would slide the
   content UNDER the glass sidebar; 1px sub-pixel tolerance), `unreadable` +
   `lowcontrast` (arrays — the S37 light contrast detector family),
   `consoleErrors` (array), `activeTint` (string — the sidebar's active-link
   inner-span gradient reading while THIS view was active; the empty/`"none"`
   reading is the S8 no-var rot class and counts as a FINDING), and
   `activeLabel` (string — the `aria-current=page` link's label when the tint
   was read; a value ≠ the view's own label is the interaction FINDING: the
   active state did not follow the navigation).
6. **The sidebar record per accent**: `linkCount` (number) +
   `unreadable`/`lowcontrast` (the aside-scoped detectors) + `activeTint` +
   `activeView` — an `error` string on the record counts as a FINDING (a
   sidebar whose detectors failed is a finding, never a swallow — the S38
   doctrine); a missing sidebar record is a shape-error.
7. **The applied-mismatch guard**: `accents[a].applied !== a` counts as a
   finding per mismatch (the S37/S38/S39/S40 family).
8. **The counting semantics (S37/S39/S40-exact)**: the independent
   contrast-detection count with the three SIGNATURE-STRICT non-gap
   exemptions — the CTA-face (`color === "rgb(255, 255, 255)"` — the S11
   family-2), the calendar adjacent-month days (slate-300
   `rgb(203, 213, 225)` + 1-2-digit text — the S6-G pin), and the yellow
   priority-pill vocabulary (yellow-500 `rgb(234, 179, 8)` + {high, medium,
   low} — the S6/S8 pin); `lowcontrast` entries are WARN (the note, never
   the findings); non-empty `consoleErrors` per view ride the findings array
   as the probe recorded them.

The unit pins (`tests/suite-verdict.test.ts`, the S41 block after the S40
block; **24 pins as executed** — the GREEN shape, the guards, the families,
the exemptions, the WARN band, the unknown-audit guard): a full-shape fixture
generator (`s41Envelope`) building the 7 accents × 20 views + the sidebar per
accent envelope at 1280×800 with the per-view `activeTint`/`activeLabel`
interaction keys AND the desktop `headingOffset`/`sidebarVisible` keys, then
the pin families — the GREEN shape with the swept counts in the note (140
renderings + 140 tint readings + 7 sidebar records); the ALL-VIEWS guard (a
view missing from one accent); the ALL-ACCENTS guard (an accent missing); the
historical S38-shape envelope (an accent-dark desktop envelope — the flat
`desktop`/`mobile` maps, the exact pre-S41 shape — fed to the new classifier,
a shape-error); the missing sidebar record; the missing-mode shape-error; the
wrong-viewport shape-error (the 390×844 envelope AND the 768×1024 envelope
AND the 844×390 envelope — the sibling families); the mode-rot family
(`mode: "dark"` → non-green — the desktop dark accent family belongs to
accent-dark-sweep); the applied-mismatch family; the INVERTED
vehicle-contract family (`sidebarVisible: false` → the finding; and
`hamburgerVisible: true` → the finding — the mirror contract); the
scroll-contract family (`sidebarNavScrollable: false` → the S41-own class);
the tint-rot family (`activeTint: "none"` → the S8 no-var finding); the
interaction family (`activeLabel` ≠ the view's own label → the finding); the
overflow family (`scrollWidth: 1400` → finding); the strict-record family (a
record missing `lowcontrast` → shape-error; `activeTint` missing →
shape-error; `headingOffset` missing → shape-error; `sidebarVisible` missing
→ shape-error); the sidebar-error-is-a-finding family; the counting
preservation on the new shape (CTA-face / calendar-day / yellow-pill
exemptions each with a positive + a signature-strictness negative pin); the
lowcontrast WARN family; the unknown-audit guard. TDD: RED first — the
GREEN-shape + finding-family pins fail under the current seam (the audit name
is unknown to it); GREEN: the seam implementation; then the full-file re-run.

### S41-B (HIGH) — the probe: `scripts/accent-desktop-sweep.mjs`

1. **The vehicle**: all 20 views are navigated THROUGH THE SIDEBAR (the
   desktop vehicle — the S33/S34/S35/S39/S40 pattern's vehicle INVERSION; the
   sidebar is the only chrome ≥1024), per accent, at 1280×800: click the
   sidebar link (Playwright auto-scrolls below-fold links into the nav's
   scroll — the S35 proof, the desktop sibling) → the view renders its
   identity heading (h1 — the desktop ViewHeader) → the heading OFFSET holds
   (box left ≥ 260 − 1px — the content clears the fixed sidebar) → settle →
   `scrollWidth ≤ 1280` → the sidebar STILL VISIBLE (the vehicle persists) →
   the ACTIVE-LINK READING while THIS view is active (the label + the inner
   span's inline `backgroundImage` — `activeLabel` MUST equal the view's own
   label; `activeTint` MUST read a `linear-gradient`, never `none` — the S8
   no-var rot class) → the light contrast detector family (unreadable < 2.2 /
   lowcontrast < 3.2 — the S37 CHECKER verbatim) → zero console errors (the
   429-RUM backpressure exact-text filter).
2. **The sidebar-own scroll contract (measured at the start of EVERY
   accent's pass, the S35/S40 pattern)**: the nav MUST be scrollable at 800
   height (`scrollHeight > clientHeight` — measured 1068 vs 534) — a
   non-scrolling reading means the sidebar geometry changed (links beyond
   the fold would be unreachable at desktop); rides the envelope's
   `chrome.sidebarNavScrollable` (asserted per accent — an accent whose
   sidebar nav renders non-scrollable is the finding).
3. **The active-tint interaction readings**: the reading happens directly
   after each view settles (the sidebar is always in the DOM — no
   next-open indirection like the drawer family): 20 readings per accent,
   each while ITS view is active (the first on the Dashboard goto landing,
   the last on the final navigated view). The probe asserts `activeLabel ===
   the expected view` loudly (the aria-current follows the navigation — the
   interaction proof on the DESKTOP vehicle) and the tint reads a
   `linear-gradient` (a `none` is the S8 no-var rot class — a finding).
4. **The sidebar record per accent** (the S37/S39/S40 DRAWER_CHECKER
   pattern, aside-scoped): the aside-scoped contrast detectors on the
   sidebar (the brand header, the nav links, the clock chip, the user
   footer), `linkCount === 20` asserted loudly, the `activeView` +
   `activeTint` on the final navigated view (a NON-Dashboard view — the
   first standing reading of the tint on a navigated sidebar link per
   accent).
5. **Self-verifying preconditions (the S27/S32/S33–S40 doctrine)**: the
   viewport asserted on BOTH axes; the INVERTED chrome vehicle contract (the
   desktop sidebar visible + the hamburger hidden at 1280); the mode PATCHed
   through the settings API (the real lifecycle) + verified on `<html>`;
   every accent PATCHed + self-verified on `<html data-accent>`; the closing
   restore an explicit, awaited, VERIFIED violet/light PATCH; the
   failure-path restore in the catch.
6. **The envelope**: `{ source, mode: "light", viewport: {1280×800}, chrome,
   accents: {accent → {applied, views: {label → record}, sidebar}}, findings
   }` — every view recorded explicitly on the single surface (clean views
   carry empty detector arrays), the S38/S39/S40 shape from birth. **The
   S39-F flush-callback ending** (the AP-85 lesson): the envelope measures
   ~130KB, so the exit code is computed FIRST, then
   `process.stdout.write(json + "\n", () => process.exit(exitCode))`.
7. **Out of scope (documented non-goals)**: the desktop dark accent family
   (accent-dark-sweep's own standing surface at 1280 dark), the collapsed
   sidebar state (the e2e navigation spec pins the 76px collapse), and any
   flashbulb detection (the light canvas does not carry the class — the S37
   doctrine).

### S41-C (MEDIUM) — the runner: the 24th stage

`scripts/standing-suite.mjs`: the STAGES array gains
`{ name: "accent-desktop-sweep", file: "scripts/accent-desktop-sweep.mjs",
runtime: "node", timeoutMs: 20 * 60_000 }` — placed directly after
`accent-landscape-sweep` (the light accent family together: light mobile →
light mid-band → light phone-landscape → **light desktop** → dark mobile →
light accent (390) → light accent (768, the vehicle) → light accent (844×390,
the vehicle at the short viewport) → **light accent (1280×800, the SIDEBAR
vehicle — the S41 stage)** → dark desktop → accent dark). The measured
runtime estimate is ~8–11 min (7 accents × [20 sidebar-navigated views ×
~3–3.5 s + the applied verification + the sidebar record]) — over the
10-min default, so the stage carries its own 20-min budget (the
S38-C/S39-C/S40-C per-stage `timeoutMs` override pattern, ~2× headroom);
every other stage keeps its default. The stage-count literals `23 → 24` (the
`stage ${i + 1}/23` prints ×2, the `stage 0/23` print, the `stage 23/23`
theme-restore print) and the header comment's stage list.

### S41-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the accent-desktop-sweep command entry after
accent-landscape-sweep + the 23-audit suite entry + the unit-count line),
vitest.config.ts (the new unit count + the S41 seam note), CLAUDE.md (the
count + the seam note), PAD §8.1 (the suite-verdict row extended + the
per-file count + the Total), README.md (the badge + the count lines + the
session-41 status row), omni-study_SKILL.md (the counts ×2 + the AP-87
lesson — the vehicle-never-varied lesson), the worklog S41 entry, this
plan's execution log, the session narrative (`docs/session_96.md`) + the
summary (`docs/session_97.md`).

### S41-E (MEDIUM) — the evidence + the session record

The evidence envelope: the clean-window validation suite run's
`docs/screenshots/s41-accent-desktop-sweep-evidence.json` (25 stage rows,
the accent-desktop-sweep row GREEN inside the suite with the new note).
The evidence screenshot: the desktop 1280×800 in LIGHT mode under a
non-violet accent with the SIDEBAR's ACTIVE LINK ON A NAVIGATED VIEW (the
tint verification in-frame — e.g. the TEAL accent with the Notes link
active after navigating to Notes through the sidebar, a below-fold link
scrolled into view — the sidebar-vehicle story in one frame), via a
`scripts/capture-s41-evidence.mjs` modeled on the S40 capture script. The
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
- **The desktop dark accent family** — accent-dark-sweep's own standing
  surface (all 7 accents × 20 views at 1280×800 dark); NOT a non-gap, a
  swept surface — this audit's sibling, never its scope.
- **The collapsed sidebar state** — the e2e navigation spec pins the
  76px/260px collapse toggle; the sweep exercises the default expanded
  state only.

## TDD order

1. **The exploration (BEFORE the plan finalizes)** — the probe itself
   (S41-B) runs as the exploration against the dev server once the
   arrival suite completes (the theme-PATCH stages must not interleave):
   the whole accent × desktop light sidebar-navigation family swept, every
   finding classified with evidence BEFORE any seam/runner change ships
   (the S32 run-1 discipline). Expected families: the CTA-face, the
   calendar adjacent days, the yellow pills, and the WARN band (all
   documented above); anything else is a genuine finding and re-scopes
   this plan.
2. **RED** — the S41 pin block written first; the GREEN-shape +
   finding-family pins fail under the current seam (the audit name is
   unknown to it — `classifyAudit` shape-errors every envelope for the
   new name; the shape-error pins pass vacuously through the
   unknown-audit path and will re-pass for the right reason after the
   seam exists); `bunx vitest run tests/suite-verdict.test.ts` shows the
   failures.
3. **GREEN** — the seam implementation (S41-A); the file re-runs clean;
   the full unit layer re-runs clean.
4. **The genuine re-run** — the probe's run 1 evidence re-checked against
   the seam (the raw envelope classified GREEN at the new classifier).
5. **The runner integration** (S41-C) + the validation protocol — the dev
   server restarted by PID (the S32 clean-window remedy — the ai:/RUM
   budgets), the S31 preflight GREEN, then the clean-window full-suite
   run **25/25 GREEN, exit 0**; the evidence envelope captured.
6. **The gates** — lint ✓ tsc ✓ unit (the new count) ✓ build ✓ cold-db
   **291 e2e** ✓ (the 291 prior pins untouched by construction — zero
   app code, zero CSS, zero Tailwind v4 surface, zero parity-pinned
   bytes).
7. **The standing checks** — the drawer check GREEN; the evidence
   screenshot captured; the standing 31 screenshots refreshed; the theme
   verified light/violet via Prisma (the closing guard).
8. **The docs** — S41-D + S41-E; the workspace worklog; the commit + the
   push via the SSH wrapper (`--remote git@github.com:nordeim/omni-study.git`).

## Risks

- **The suite runtime grows ~8–11 min** (the new stage) — the suite runs
  ~70 min total; the ai: budget is untouched (zero AI requests by
  construction).
- **The RUM budget under the day's sweep volume** — the exploration (7
  pageloads + 140 client-side navigations per run) + the genuine runs +
  the suite's own sweeps can exhaust the 1000/15-min beacon budget; the
  429 class is documented, the probe filters the exact-text signature,
  and the validation run restarts the dev server first (the S32
  differential).
- **The sidebar-link click flake** — 140 link clicks per genuine run with
  links ~13–20 below the 534px fold (the click auto-scrolls the link into
  the nav's scroll — the S35 proof, the desktop sibling); a flaky click
  surfaces as a finding or a precondition failure and the run is re-run
  (the loud-failure doctrine, accepted — the S38/S39/S40 risk family).
- **The activeLabel read race** — the reading happens after the view
  settled (the 1200 ms band), so the aria-current state is stable; a race
  would surface as the interaction FINDING (the loud-failure doctrine).
- **The envelope size** (~130KB — 7 accents × 20 views × the strict
  record + the tint strings) — the S39-F flush-callback ending is applied
  from birth (the AP-85 lesson; a bare process.exit can truncate the
  async pipe write).
- **The e2e database must be cold for the 291 gates** (`db/e2e.db`
  deleted before the run — the seed short-circuits on the demo user).
- **The `:3200`/`:3100` traps** — kill every standalone listener BY PID
  before any sweep measures a server; verify the served database first
  (the AP-70 lesson, re-learned S38/S39/S40).

## Execution log (session 96 — filled as executed)

- The arrival standing suite (the S40 one-command suite, run in the fresh
  clean window after the dev-server restart by PID): **24/24 GREEN, exit
  0** — zero code findings on arrival (the accent-landscape row GREEN
  inside the suite with identical counts to its S40 validation run —
  deterministic).
- The exploration (the genuine run 1, the probe itself against the dev
  server, `/tmp/s41-exploration.json`, ~3.2 min measured — under the
  20-min stage budget with ~6× headroom): **the family is CLEAN — findings
  0 across all 140 sidebar-navigated renderings + 7 sidebar records**:
  - **the interaction is GREEN**: `activeLabel === the view` on all 140
    readings (the aria-current link follows the navigation through the
    SIDEBAR at every accent — the desktop vehicle's first standing proof),
    `activeTint` read a `linear-gradient` on all 140 (7 DISTINCT
    accent-correct pairs — the violet rgba(139,92,246,.1)→rgba(99,102,241,.1)
    through teal rgba(20,184,166,.1)→rgba(6,182,212,.1) — the per-accent
    NAV_ACTIVE_GRADIENT_STOPS pairs, the S39/S40 proof extended to the
    DESKTOP vehicle at 1280×800);
  - **the sidebar-own contracts hold at EVERY accent**: the sidebar nav
    scrollable at 800 height (re-measured per accent, 7/7 — the only path
    to links ~13–20), the heading offset under the fixed 260px sidebar
    × 140 (the lg:ml-[260px] content contract), the sidebar persistent
    through navigation × 140, the INVERTED chrome contract (sidebar
    visible + hamburger hidden) on arrival;
  - **structural family clean**: scrollWidth ≤ 1280 on every rendering
    (the Timetable canvas fits the 956px desktop content area at every
    accent), zero console errors (the 429-RUM class filtered per the
    signature);
  - **the surfaced unreadable entries — all three documented families**:
    94 CTA-face (white on accent-500 — the S11 family-2; the desktop
    layout renders fewer CTA-face surfaces than the portrait stacks'
    108), 28 calendar adjacent-month days (slate-300 — the S6-G pin, the
    identical count to the sibling sweeps), 21 yellow priority pills
    (yellow-500 — the S6/S8 pin, identical); **zero non-exempt**;
  - **596 WARN** (the S11 non-gap family — 580 view + 16 sidebar-scope
    lowcontrast entries at the desktop layout).
  No genuine finding surfaced — the plan ships as the coverage extension
  (no re-scope needed). The envelope classified **GREEN at the new seam**
  ("7 accents swept × 140 view renderings + 140 active-tint readings + 7
  sidebar records at 1280×800 in MODE light, navigated through the sidebar
  (the desktop vehicle); every accent self-verified applied; the
  sidebar-own contracts hold (nav scrollable, heading offset); 94 CTA-face
  exempt; 28 calendar adjacent-day exempt; 21 yellow-pill exempt; 596
  WARN") — the first classification of a real envelope, clean on the first
  try (the S39 label-convention lesson held: the display-label convention
  from birth).
- **The S41-B field correction (the probe's own first run)**: the
  sidebar-visibility check in the first draft used `offsetParent !== null`
  (the drawer-vehicle sweeps' pattern) — but the desktop sidebar is
  `position: fixed`, and **offsetParent reads null for fixed elements in
  Chromium even when fully rendered** (verified live: offsetParent false,
  display flex, getClientRects 1, width 260 at 1280). The rendered check
  for a fixed-position element is `getClientRects().length > 0` (0 when
  display:none — the below-1024 state the drawer-vehicle sweeps assert
  through offsetParent, which stays correct for THEIR vehicle). Fixed in
  the chrome precondition + the per-view persistence check + the evidence
  capture script before the genuine run; the precondition fired LOUDLY on
  the first run (exit 1, no findings measured) — the self-verifying
  doctrine working as designed. Recorded as a lesson candidate for the
  session narrative (the offsetParent-fixed quirk).
- **The validation run 1 — the environmental abort (documented, re-run)**:
  the first clean-window suite run read **24/25** — every stage GREEN
  except the NEW accent-desktop-sweep row: "stage exited 1 — at
  UtilityScript.evaluate (<anonymous>:313:16)" with a **0-byte stdout**
  (the probe never reached its final envelope write; the stderr tail
  carried an in-page evaluate exception). The immediate re-run of the
  probe against the same dev server: **exit 0, findings 0, 140 renderings
  — deterministic-clean** (identical counts to the exploration). The
  diagnosis: the container's memory ceiling (3.9GB) was squeezed at the
  moment the stage ran — the AGENTS.md OOM trap ("`next dev` OOMs in ~4GB
  containers when several headless browsers run — close extra sessions
  before long e2e/dev sessions"): the live agent-browser chrome daemons
  (~500MB across 3 processes, left open from the session's earlier
  walkthrough/reference sweeps) + the dev server (1.1GB RSS) + the stage's
  own chromium left ~1.5GB free, and the page's renderer died mid-evaluate
  (the in-flight evaluate rejected with the UtilityScript stack — the
  loud-failure doctrine: the abort surfaced as a RED row, never a silent
  green). The remedy applied: the agent-browser daemons closed (3.0GB
  free — 2× the headroom), the dev server restarted by PID, and the
  validation suite re-run in the fresh clean window (the S38/S39/S40
  accepted-risk family: a flaky surface aborts loudly and the run is
  re-run). The session narrative records the operational lesson: close
  the interactive browser sessions BEFORE launching the standing suite.
