# Remediation Plan — Session 39 (S39): the accent × mid-band drawer-navigation sweep — the 391–1023px band's accent half, navigated through the drawer (the vehicle), as a standing, executable guarantee

**Audit surfaces (this session, session-88/89 workspace run at `f4c8ef8`):** the
baseline gates re-confirmed the documented **710-green** state on arrival (lint
✓ tsc ✓ **419 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.4 min**), the S31 preflight ran GREEN before the checks,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → drawer closes on navigation on every view → Settings by
ref → the Profile tab's Email address card above the Change password + Danger
zone cards — **the mobile navigation menu is working as expected**), and the
reference re-sweep: **UNCHANGED since S19–S38** (login title "AcademiaFlow
(Copy)"; the zero-data dashboard with the greeting from the email prefix
"Good morning, sepnetflix2023 👋"; the same 20 nav views in the same order;
the same five Settings tabs). The 20-view copy sweep (the `:3200` standalone
server on `db/custom.db`): **14/20 MATCH** with the 6 diffs all data-state
(the documented S17-pinned non-gap family: the greeting name, the zero-data
CTA/button surfaces on MyDay/Tasks/Timetable/Flashcards, the count subtitles
on Tasks/Exams). The S38 one-command standing suite result is recorded in the
execution log below.

## The governing finding (this session's work)

**The accent × mid-band combo (768×1024, the md breakpoint — the switchiest
width in the 391–1023px band) is ZERO-coverage at every one of the 7 accents
— and the accent sweeps never NAVIGATE through the drawer, so the
active-link accent tint on a non-Dashboard view has never been verified at
any accent, at any viewport, in either mode.** The coverage map, verified
against the standing scripts this session:

- `midband-sweep.mjs` (S34): all 20 views at 768×1024, navigated THROUGH
  THE DRAWER — **LIGHT only** (mode-rot guarded) and **violet only** (zero
  `accentColor` references — verified by grep this session).
- `accent-light-sweep.mjs` (S37): all 7 accents × 20 views + the drawer —
  **390×844 only** (viewport-guarded: "the desktop/mid-band light-accent
  combos are documented non-gaps" — the mid-band was folded into that
  documentation when nothing swept it), navigated by DIRECT GOTO.
- `accent-dark-sweep.mjs` (S38): all 7 accents × 20 views at desktop
  1280×800 AND mobile 390×844 + the drawer per accent — **dark only**, and
  the 768 width is in NEITHER surface; navigated by DIRECT GOTO.
- `mobile-sweep.mjs` (S33) / `landscape-sweep.mjs` (S35) /
  `dark-mobile-sweep.mjs` (S36): 390×844 / 844×390 / 390×844-dark — violet
  only, mobile portrait/landscape only.

So the mid-band × accent cell of the theme-space matrix is the one the S38
summary's own next-steps named ("the drawer-navigation × accent interaction
at mid-band"): the S38 worklog records "the theme-space matrix (mode ×
accent × viewport) is now FULLY swept at every documented combo — the next
production-readiness axis is beyond the theme space (e.g. the
drawer-navigation × accent interaction at mid-band…)". Two gaps ride in that
one sentence:

1. **The viewport gap**: at 768×1024 the md structures that never render at
   390 appear (the Tasks `hidden md:flex w-64` aside, the two-pane
   Notes/Flashcards `w-80` panes side-by-side, the Timetable's min-w-[900px]
   canvas, multi-column grids) — and their accent-dependent surfaces (the
   `sf-gradient` CTAs inside the asides/panes, the accent-tinted chips) have
   never been rendered at a non-violet accent by any standing audit. The
   mid-band is also the band where the drawer is the ONLY navigation vehicle
   (the sidebar is `lg:flex` = ≥1024) — the vehicle-contract + accent
   interaction is unmeasured.
2. **The interaction gap**: the accent sweeps navigate by DIRECT GOTO, so
   the only drawer-active-tint reading they take is on the DASHBOARD link
   (the landing view) — once per accent. The active-link tint on ANY other
   view's link, applied through the real navigation lifecycle (click a
   different link in the drawer → `aria-current=page` moves → the
   `.sf-nav-active` 10%-alpha `NAV_ACTIVE_GRADIENT_STOPS` gradient re-tints
   the NEW link), is verified at… zero views, zero accents. The tint rides
   a dynamically-built CSS var name (`toCssVar` kebab-case suffixes — the
   S8 lesson: a camelCase token silently resolves to no var and the
   gradient computes to `none`), and the mobile navigation menu — the
   owner's standing per-session emphasis — under a non-violet accent
   mid-flight is guaranteed by nothing at execution time.

The mobile/mid-band accent structures are real: the drawer's active-link
10%-alpha gradient (the inner span's inline `backgroundImage`), the app
bar's accent-tinted brand, every view's `sf-gradient` CTAs, the calendar's
selected-day accent fill — the 15-var token set is unit-pinned statically
for all 7 accents, but the RUNTIME APPLICATION at 768×1024 through the
drawer-navigation lifecycle had never been executed at a non-violet accent
by any standing probe.

**The companion finding (the anti-phantom doctrine, AP-82/AP-83 applied):**
any future probe for this combo must be born with the S37/S38 envelope
guards — the ALL-ACCENTS + ALL-VIEWS + drawer-present + applied +
viewport + mode contracts — because the coverage IS the guarantee: an
envelope that records only what it touched cannot distinguish "clean
because measured" from "clean because never rendered".

## Families and fixes

### S39-A (HIGH) — the seam `classifyAccentMidbandSweep` + the unit pins

The seam (`src/lib/suite-verdict.ts`) gains, in the S37/S38-doctrine shape:

1. **The AUDIT_NAMES entry** `accent-midband-sweep` + the dispatch arm.
2. **The envelope metadata shape**: `mode` (string — shape-error if
   missing; `mode !== "light"` reads NON-green, the S27 rot-guard family —
   the dark × mid-band combos are the documented S36 non-gap family
   [dark-mobile-sweep's own classifier comment], and this audit owns the
   LIGHT mid-band accent surface), `viewport` (must be exactly
   `{width: 768, height: 1024}` — the md-breakpoint mid-band class; a
   390/1280/844×390 envelope fed here is a shape-error, never a silent
   re-scope), `chrome` (`sidebarVisible: false` + `hamburgerVisible: true`
   — the vehicle contract; a broken lg contract is the vehicle-contract
   FINDING class, S34's).
3. **The ALL-ACCENTS guard** (`ACCENT_MIDBAND_ALL_ACCENTS`): every one of
   violet, blue, green, orange, pink, red, teal must be a key on
   `accents` — a missing accent is a LOUD shape-error, never
   green-by-omission.
4. **The ALL-VIEWS guard**: every accent's `views` map must carry all 20
   canonical view labels (the NAV_ITEMS order) — a missing view is a LOUD
   shape-error. Every view is recorded EXPLICITLY (clean views carry empty
   detector arrays — the S38 retirement of omission-means-clean, applied
   from birth here).
5. **The per-view record shape (strict)**: `heading` (non-empty string),
   `scrollWidth` (number — `> 768` counts as a finding, the S16/S34
   overflow class), `drawerClosed` (boolean — the drawer must close on
   navigation, the vehicle contract), `appBar` (boolean — the fixed glass
   app bar with the 2-digit-hour clock), `unreadable` + `lowcontrast`
   (arrays — the S37 light contrast detector family), `consoleErrors`
   (array), `activeTint` (string — the drawer's active-link inner-span
   gradient reading while THIS view was active; the empty/`"none"` reading
   is the S8 no-var rot class and counts as a FINDING), and `activeLabel`
   (string — the `aria-current=page` link's label when the tint was read;
   a value ≠ the view's own label is the interaction FINDING: the active
   state did not follow the navigation).
6. **The drawer record per accent**: `linkCount` (number) +
   `unreadable`/`lowcontrast` (the dialog-scoped detectors) +
   `activeTint` + `activeView` — an `error` string on the record counts as
   a FINDING (a drawer that failed to open is a finding, never a swallow —
   the S38 doctrine); a missing drawer record is a shape-error.
7. **The applied-mismatch guard**: `accents[a].applied !== a` counts as a
   finding per mismatch (the S37/S38 family).
8. **The counting semantics (S37-exact)**: the independent contrast-detection
   count with the three SIGNATURE-STRICT non-gap exemptions — the CTA-face
   (`color === "rgb(255, 255, 255)"` — the S11 family-2), the calendar
   adjacent-month days (slate-300 `rgb(203, 213, 225)` + 1-2-digit text —
   the S6-G pin), and the yellow priority-pill vocabulary (yellow-500
   `rgb(234, 179, 8)` + {high, medium, low} — the S6/S8 pin); `lowcontrast`
   entries are WARN (the note, never the findings); non-empty
   `consoleErrors` per view ride the findings array as the probe recorded
   them.

The unit pins (`tests/suite-verdict.test.ts`, the S39 block after the S38
block): a full-shape fixture generator (`s39Envelope`) building the 7
accents × 20 views + the drawer per accent envelope with the per-view
`activeTint`/`activeLabel` interaction keys, then the pin families — the
GREEN shape with the swept counts in the note (140 renderings + 140 tint
readings + 7 drawer records); the ALL-VIEWS guard (a view missing from one
accent); the ALL-ACCENTS guard (an accent missing); the historical
S34-shape envelope (a violet-only midband envelope fed to the new
classifier — the exact pre-S39 state — a shape-error); the missing drawer
record; the missing-mode shape-error; the wrong-viewport shape-error (the
390 envelope); the mode-rot family (`mode: "dark"` → non-green); the
applied-mismatch family; the vehicle-contract family
(`sidebarVisible: true` → the finding); the tint-rot family
(`activeTint: "none"` → the S8 no-var finding); the interaction family
(`activeLabel` ≠ the view's own label → the finding); the overflow family
(`scrollWidth: 800` → finding); the strict-record family (a record missing
`lowcontrast` → shape-error; `activeTint` missing → shape-error); the
counting preservation on the new shape (CTA-face / calendar-day /
yellow-pill exemptions each with a positive + a signature-strictness
negative pin); the drawer-error-is-a-finding family. TDD: RED first — the
GREEN-shape + finding-family pins fail under the current seam (the audit
name is unknown to it); GREEN: the seam implementation; then the full-file
re-run.

### S39-B (HIGH) — the probe: `scripts/accent-midband-sweep.mjs`

1. **The vehicle**: all 20 views are navigated THROUGH THE DRAWER (the
   S33/S34 pattern — the drawer is the only vehicle below 1024), per
   accent, at 768×1024: open the drawer → read the CURRENT active link
   (label + the inner span's inline `backgroundImage` — the
   previously-navigated view's tint) → click the next link → the drawer
   closes → the identity heading renders (h1 OR h2 — the S8-H union) →
   settle → `scrollWidth ≤ 768` → the light contrast detector family
   (unreadable < 2.2 / lowcontrast < 3.2 — the S37 CHECKER verbatim) →
   zero console errors (the 429-RUM backpressure exact-text filter).
2. **The active-tint interaction readings**: each drawer open reads the
   active link while the PREVIOUS view is still active — the per-view
   `activeLabel` + `activeTint` pair (20 readings per accent; the first
   reads the Dashboard landing, the last comes from the dedicated
   drawer-record open on the final view). The probe asserts
   `activeLabel === the expected view` loudly (the aria-current follows
   the navigation — the interaction proof) and the tint reads a
   `linear-gradient` (a `none` is the S8 no-var rot class — a finding).
3. **The drawer record per accent** (the S37 DRAWER_CHECKER pattern): the
   dialog-scoped contrast detectors on the open drawer (brand header, nav
   links, close button), `linkCount === 20` asserted loudly, the
   `activeView` + `activeTint` on the final navigated view (a
   NON-Dashboard view — the first standing reading of the tint on a
   navigated link per accent).
4. **Self-verifying preconditions (the S27/S32/S33–S38 doctrine)**: the
   viewport asserted on BOTH axes; the chrome vehicle contract (the
   desktop sidebar hidden + the hamburger visible at 768); the mode
   PATCHed through the settings API (the real lifecycle) + verified on
   `<html>`; every accent PATCHed + self-verified on `<html
   data-accent>`; the closing restore an explicit, awaited, VERIFIED
   violet/light PATCH; the failure-path restore in the catch.
5. **The envelope**: `{ source, mode: "light", viewport: {768×1024},
   chrome, accents: {accent → {applied, views: {label → record}, drawer}},
   findings }` — every view recorded explicitly on the single surface
   (clean views carry empty detector arrays), the S38 shape from birth.
6. **Out of scope (documented non-goals)**: the dark × mid-band family
   (the documented S36 non-gap — dark-mobile at 390 + dark-sweep/accent-dark
   at 1280 bracket it), the desktop light-accent family (S37's
   viewport-guard comment folds it into the documented non-gaps — the
   sidebar's active-tint mechanism is the same `.sf-nav-active` class the
   drawer uses, pinned per accent at 390 light and 1280 dark), and any
   flashbulb detection (the light canvas does not carry the class — the
   S37 doctrine).

### S39-C (MEDIUM) — the runner: the 23rd stage

`scripts/standing-suite.mjs`: the STAGES array gains
`{ name: "accent-midband-sweep", file: "scripts/accent-midband-sweep.mjs",
runtime: "node", timeoutMs: 20 * 60_000 }` — placed directly after
`accent-light-sweep` (the light family together: light mobile → light
mid-band → light phone-landscape → dark mobile → light accent (390) →
**light accent (768, the vehicle)** → dark desktop → accent dark). The
measured runtime estimate is ~9–12 min (7 accents × [20 drawer-navigated
views × ~3–3.5 s + the applied verification + the drawer record]) — over
the 10-min default, so the stage carries its own 20-min budget (the S38-C
per-stage `timeoutMs` override pattern, ~70% headroom); every other stage
keeps its default. The stage-count literals `21 → 22` (the `i + 1}/21`
prints and the theme-restore row) and the header comment's stage list.

### S39-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the accent-midband-sweep command entry after accent-light-sweep
+ the 23-audit suite entry + the unit-count line), vitest.config.ts (the
new unit count + the S39 seam note), CLAUDE.md (the count + the seam
note), PAD §8.1 (the suite-verdict row extended + the per-file count +
the Total), README.md (the badge + the count lines + the session-39
status row), omni-study_SKILL.md (the counts ×2 + AP-84 — the interaction lesson — and AP-85 — the stdout-flush lesson, S39-F),
the worklog S39 entry, this plan's execution log, the session narrative
(`docs/session_90.md`) + the summary (`docs/session_91.md`).

### S39-F (HIGH, discovered mid-execution) — the stdout-flush race in the big-envelope probes

The validation run's genuine discovery: the accent-light-sweep stage
read **"stdout did not parse: SyntaxError … at position 145742"** — the
probe's ~150KB envelope was TRUNCATED at 146176 bytes (ending mid-string
inside a detector entry), while the probe itself had SUCCEEDED
(findings 0 — the exit code and the theme restore were clean). The
root cause: `console.log(bigJson)` on a PIPE is an ASYNCHRONOUS write —
a bare `process.exit(code)` right after it can terminate the process
before the pending write fully flushes into the pipe (the classic Node
exit-truncation footgun; the race is load-dependent and nondeterministic
— the same probe parsed full-size in the arrival suite hours earlier,
and the S37/S38 suite runs before it). The risk family: every probe
whose envelope exceeds the 64KB pipe buffer — accent-light (~150KB, the
confirmed victim), accent-midband (~130KB, the new probe — lucky in its
first suite run), accent-dark (~60KB, borderline but SAFE by
construction: it exits NATURALLY after console.log — no process.exit on
the success path). Every other standing probe's envelope measures <8KB.
A truncated envelope reading "stdout did not parse" is a FALSE FAILURE
— exactly the phantom class the S32 seam exists to prevent, now in the
runner's own stdout capture.

**The fix** (the documented-safe pattern): the exit code is computed
FIRST, then the envelope write carries the exit in its flush callback —
`process.stdout.write(json + "\n", () => process.exit(exitCode))` — the
callback fires only after every prior byte has flushed to the pipe, so
the exit can never cut the envelope. Applied to accent-light-sweep.mjs
+ accent-midband-sweep.mjs (the two >64KB process.exit probes); the
catch-path `process.exit(1)`s stay (their stdout is empty; stderr
truncation is cosmetic and the runner only reads its tail). The full
validation re-run exercises both fixed probes inside the suite.

### S39-E (MEDIUM) — the evidence + the session record

The evidence envelope: the clean-window validation suite run's
`docs/screenshots/s39-accent-midband-sweep-evidence.json` (23 stage rows,
the accent-midband-sweep row GREEN inside the suite with the new note).
The evidence screenshot: the drawer OPEN at 768×1024 in LIGHT mode under
a non-violet accent with the ACTIVE LINK ON A NAVIGATED VIEW (the tint
verification in-frame — e.g. the TEAL accent with the Notes link active
after navigating to Notes through the drawer), via a
`scripts/capture-s39-evidence.mjs` modeled on the S37/S38 capture
scripts. The session docs: the narrative + the summary.

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
- **The dark × mid-band family** — the documented S36 non-gap
  (dark-mobile-sweep's classifier comment: "the landscape/mid-band dark
  combos are documented non-gaps" — the stacked-mobile dark structures
  are swept at 390 dark [S36], the desktop dark structures at 1280
  [dark-sweep + accent-dark's desktop pass]; the mid-band renders the
  same components).
- **The desktop light-accent family** — S37's viewport guard documents
  the desktop/mid-band light-accent combos as non-gaps; this session
  closes the MID-BAND half (the named next step — the drawer vehicle at
  the switchiest width); the desktop half remains bracketed (the same
  `.sf-nav-active` mechanism is pinned per accent at 390 light + the
  desktop dark pass covers the 1280 rendering), documented as the
  remaining known limitation rather than swept this session (the
  one-axis-per-session doctrine).

## TDD order

1. **The exploration (BEFORE the plan finalizes)** — the probe itself
   (S39-B) runs as the exploration against the dev server once the
   arrival suite completes (the theme-PATCH stages must not interleave):
   the whole accent × mid-band drawer-navigation family swept, every
   finding classified with evidence BEFORE any seam/runner change ships
   (the S32 run-1 discipline). Expected families: the CTA-face, the
   calendar adjacent days, the yellow pills, and the WARN band (all
   documented above); anything else is a genuine finding and re-scopes
   this plan.
2. **RED** — the S39 pin block written first; the GREEN-shape +
   finding-family pins fail under the current seam (the audit name is
   unknown to it — `classifyAudit` shape-errors every envelope for the
   new name; the shape-error pins pass vacuously through the
   unknown-audit path and will re-pass for the right reason after the
   seam exists); `bunx vitest run tests/suite-verdict.test.ts` shows the
   failures.
3. **GREEN** — the seam implementation (S39-A); the file re-runs clean;
   the full unit layer re-runs clean.
4. **The genuine re-run** — the probe's run 1 evidence re-checked against
   the seam (the raw envelope classified GREEN at the new classifier).
5. **The runner integration** (S39-C) + the validation protocol — the dev
   server restarted by PID (the S32 clean-window remedy — the ai:/RUM
   budgets), the S31 preflight GREEN, then the clean-window full-suite
   run **23/23 GREEN, exit 0**; the evidence envelope captured.
6. **The gates** — lint ✓ tsc ✓ unit (the new count) ✓ build ✓ cold-db
   **291 e2e** ✓ (the 291 prior pins untouched by construction — zero
   app code, zero CSS, zero Tailwind v4 surface, zero parity-pinned
   bytes).
7. **The standing checks** — the drawer check GREEN; the evidence
   screenshot captured; the standing 31 screenshots refreshed; the theme
   verified light/violet via Prisma (the closing guard).
8. **The docs** — S39-D + S39-E; the workspace worklog; the commit + the
   push via the SSH wrapper (`--remote git@github.com:nordeim/omni-study.git`).

## Risks

- **The suite runtime grows ~9–12 min** (the new stage) — the suite runs
  ~55 min total; the ai: budget is untouched (zero AI requests by
  construction).
- **The RUM budget under the day's sweep volume** — the exploration (140
  navigated loads) + the genuine runs + the suite's own sweeps can
  exhaust the 1000/15-min beacon budget; the 429 class is documented,
  the probe filters the exact-text signature, and the validation run
  restarts the dev server first (the S32 differential).
- **The drawer-click flake** — 140 drawer opens + 140 link clicks per
  genuine run; a flaky open/click surfaces as a finding or a
  precondition failure and the run is re-run (the loud-failure doctrine,
  accepted — the S38 risk family).
- **The activeLabel mid-flight read** — the `aria-current=page` state is
  read at the NEXT drawer open (the previous view still active); the
  drawer open happens after the view settled (the 1200 ms band), so the
  state is stable; a race would surface as the interaction FINDING (the
  loud-failure doctrine).
- **The envelope size grows** (7 accents × 20 views × the strict record +
  the tint strings) — well under 1 MB; the suite's stdout parse handles
  multi-KB envelopes (the S37/S38 precedent).
- **The e2e database must be cold for the 291 gates** (`db/e2e.db`
  deleted before the run — the seed short-circuits on the demo user).
- **The `:3200`/`:3100` traps** — kill every standalone listener BY PID
  before any sweep measures a server; verify the served database first
  (the AP-70 lesson, re-learned S38).

## Execution log (session 90 — filled as executed)

- The arrival standing suite (the S38 one-command suite, run in the fresh
  clean window after the dev-server restart by PID): **22/22 GREEN, exit
  0** — zero code findings on arrival (the accent-dark-sweep row: "280
  view renderings probed (7 accents × 20 views × desktop+mobile) + 7
  drawer records; 6 CTA-face exempt"; the accent-light row: "7 accents
  swept × 140 view renderings + 7 drawer records at 390×844").
- The exploration (the genuine run 1, the probe itself against the dev
  server, `/tmp/s39-exploration.json`): **the family is CLEAN — findings
  0 across all 140 drawer-navigated renderings + 7 drawer records**:
  - **the interaction is GREEN**: `activeLabel === the view` on all 140
    readings (the aria-current link follows the navigation through the
    drawer at every accent), `activeTint` read a `linear-gradient` on
    all 140 (7 DISTINCT accent-correct pairs — the violet
    rgba(139,92,246,.1)→rgba(99,102,241,.1), blue rgba(59,130,246,.1)→…,
    green rgba(16,185,129,.1)→…, orange rgba(245,158,11,.1)→…, pink
    rgba(236,72,153,.1)→…, red rgba(239,68,68,.1)→…, teal
    rgba(20,184,166,.1)→rgba(6,182,212,.1) — the per-accent
    NAV_ACTIVE_GRADIENT_STOPS pairs, the first standing proof of the
    tint on NON-Dashboard views per accent);
  - **the drawer's active link on the FINAL navigated view** (Settings)
    verified per accent (7/7 — `activeView === "Settings"` with the
    accent gradient on its inner span);
  - **structural family clean**: scrollWidth ≤ 768 on every rendering
    (the Timetable canvas inside its container at every accent),
    drawer-closed-on-navigation × 140, the app bar + clock × 140, zero
    console errors (the 429-RUM class filtered per the signature);
  - **the surfaced unreadable entries — all three documented families**:
    108 CTA-face (white on accent-500 — the S11 family-2, the same
    light-mode family S37 measured), 28 calendar adjacent-month days
    (slate-300 1-2-digit — the S6-G pin), 21 yellow priority pills
    (yellow-500 {high,medium,low} — the S6/S8 pin); **zero non-exempt**;
  - **588 lowcontrast WARN** (the S11 non-gap family — ~4.2/rendering,
    the amber-pill/slate-400/accent-600 band, consistent with S37's
    light-sweep family).
  No genuine finding surfaced — the plan ships as the coverage extension
  (no re-scope needed). The envelope classified **GREEN at the new seam**
  ("7 accents swept × 140 view renderings + 140 active-tint readings + 7
  drawer records at 768×1024 in MODE light, navigated through the
  drawer; every accent self-verified applied; 108 CTA-face exempt; 28
  calendar adjacent-day exempt; 21 yellow-pill exempt; 588 WARN").
- The mid-execution fix (the label-convention mismatch, caught by the
  seam itself at the genuine-run classification): the probe records
  views by their DISPLAY labels ("My Day", "Practice Tests" — the drawer
  links' accessible names, the S34 midband-sweep envelope convention)
  while the seam's first ALL-VIEWS list used the PATH-style labels
  ("MyDay" — the S38 accent-dark convention); the seam's canonical list
  + the S39 pin fixture switched to the DISPLAY-label convention (the
  vehicle family's own) — the anti-phantom guard fired exactly as
  designed on the first real envelope (a missing "MyDay" view = a loud
  shape-error), which is the seam doing its job on a real shape drift.
- The validation run 1: **22/23 green** — the new accent-midband-sweep
  row GREEN inside the suite on its first integration (identical counts
  to the exploration: 140 renderings, 140 tint readings, 7 drawer
  records, 108/28/21 exempt, 588 WARN — deterministic), every stage
  green EXCEPT accent-light-sweep: "stdout did not parse: SyntaxError …
  position 145742" — the S39-F discovery (the stdout-flush race; the
  probe had SUCCEEDED, findings 0, its ~150KB envelope truncated at
  146176 bytes by the bare process.exit before the async pipe write
  flushed). The fix applied (S39-F above) to accent-light-sweep.mjs +
  accent-midband-sweep.mjs; the validation re-run launched in a fresh
  clean window (the dev server restarted by PID — the S32 differential).
- The validation re-run (the S39-F fix in place, the fresh clean window —
  the dev server restarted by PID, the S31 preflight GREEN): **23/23
  GREEN, exit 0** — the accent-light-sweep row GREEN with the FIXED
  probe (the full 147321-byte envelope parsed: "7 accents swept × 140
  view renderings + 7 drawer records at 390×844"), the
  accent-midband-sweep row GREEN on its second suite run (identical
  counts — deterministic), every other stage green, the theme-restore
  closing guard light/violet. The evidence envelope captured to
  `docs/screenshots/s39-accent-midband-sweep-evidence.json` (23 stage
  rows).
- Gates re-run: lint ✓ tsc ✓ **440 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ (4.5 min) = **731 green** (was 710; +21 unit pins; the
  291 prior pins untouched by construction — zero app code, zero CSS,
  zero Tailwind v4 surface, zero parity-pinned bytes).
- Standing checks re-run post-change: the drawer check GREEN; the S39
  evidence screenshot captured via `scripts/capture-s39-evidence.mjs`:
  `docs/screenshots/s39-accent-midband-drawer-teal-notes-768.png` — the
  drawer OPEN at 768×1024 in LIGHT mode under the TEAL accent with the
  ACTIVE LINK ON THE NAVIGATED NOTES VIEW (the record verified
  in-frame: linkCount 20, activeLabel "Notes", the teal active-tint
  gradient `rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1)` — the
  NAV_ACTIVE_GRADIENT_STOPS teal pair — light mode, scrollWidth 768);
  the standing 31 screenshots refreshed via `capture-studyflow.mjs`
  (theme restored light); the closing theme guard verified via Prisma:
  **light/violet**.
- Docs aligned (the AP-74 guard): AGENTS.md (the 440 line + the
  accent-midband-sweep command entry + the 21-audit suite entry),
  vitest.config.ts (440 + the S39 seam note), CLAUDE.md (440 + the S39
  seam note), PAD §8.1 (the suite-verdict row extended + the per-file
  count 135 → 156 + Total 731/440), README (the 731 badge + the 440
  lines ×2 + the S39 classifier mention + the session-39 status row),
  SKILL.md (the 731/440 counts ×2 + AP-84 + AP-85). The worklog entry +
  the session_90 narrative + the session_91 summary.
