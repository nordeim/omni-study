# Remediation Plan — Session 38 (S38): the accent × dark × mobile 20-view matrix — the 14 views the accent-dark family never rendered at mobile, as a standing, executable guarantee

**Audit surfaces (this session, session-85/86 workspace run at `e11eb93`):** the
baseline gates re-confirmed the documented **693-green** state on arrival (lint
✓ tsc ✓ **402 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.5 min**), the S31 preflight ran GREEN before the checks,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → drawer closes on navigation → Settings by ref → the five
tabs → the Profile tab's Email address card above the Change password +
Danger zone cards — **the mobile navigation menu is working as expected**),
and the reference re-sweep: **UNCHANGED since S19–S37** (login title
"AcademiaFlow (Copy)"; the zero-data dashboard with the greeting from the
email prefix "Good morning, sepnetflix2023 👋"; the same 20 nav views in the
same order; the same five Settings tabs). The 20-view copy sweep: **14/20
MATCH** with the 6 diffs all data-state (the documented S17-pinned non-gap
family: the greeting name, the zero-data CTA/button surfaces on
MyDay/Tasks/Timetable/Flashcards, the count subtitles on Tasks/Exams). One
workspace incident during the sweep, diagnosed and resolved: the first
`:3200` standalone server (started for the sweep) was killed by a
`server.js` name match that missed the actual `next-server (v16.4.0)`
process name — the stale server kept serving `db/e2e.db` (the e2e database
with E2E-prefixed probe rows) and the first sweep pass measured the wrong
database; killed **by PID** (the AP-70 lesson), restarted with
`file:../db/custom.db`, and the canonical sweep re-run (14/20, the
documented family). The S37 one-command standing suite result is recorded
in the execution log below.

## The governing finding (this session's work)

**The accent × dark × MOBILE combo covers only 6 of 20 views — the other 14
have NEVER been rendered in dark × accent at the stacked mobile layout by
any standing audit.** The coverage map, verified against the standing
scripts this session:

- `accent-dark-sweep.mjs` (S11, the accent family's own probe): the mobile
  pass sweeps `MOBILE_VIEWS = ["Dashboard", "MyDay", "Timetable", "Tasks",
  "Settings", "Calendar"]` — 6 views + the drawer, per accent, at 390×844
  in dark. The other 14 views (Events, Assignments, Exams, Notes,
  Flashcards, PracticeTests, StudyGroups, GradeTracker, Analytics, Files,
  Calculator, MathSolver, AIAssistant, FocusTimer) are rendered in dark ×
  every accent at **desktop only** (1280×800, the sidebar layout).
- `mobile-sweep.mjs` (S33) / `midband-sweep.mjs` (S34) /
  `landscape-sweep.mjs` (S35): 20 views each, **LIGHT only** (mode-rot
  guarded), and `accentColor` never varied (zero references — verified by
  grep this session).
- `dark-mobile-sweep.mjs` (S36): all 20 views + the drawer at 390×844 in
  dark — but `accentColor` never varied (rides violet; zero references).
- `accent-light-sweep.mjs` (S37): all 7 accents × 20 views + the drawer at
  390×844 — **LIGHT only** (mode-rot guarded: `mode MUST be light`).

So dark × accent × mobile has **zero coverage for 14 of 20 views at every
one of the 7 accents** — exactly the combo family S36 closed for the MODE
axis and S37 closed for the LIGHT half of the ACCENT axis. The mobile-only
dark structures are the S36-documented superset-only code paths (the
stacked panes' `dark:border-slate-800` on Notes/Flashcards, the app bar's
`dark:shadow-black/20` + `dark:text-slate-300`, the drawer's
`dark:bg-slate-950` panel) — and the mobile-only **accent**-dependent
structures (the drawer's active-link 10%-alpha
`NAV_ACTIVE_GRADIENT_STOPS` gradient on the dark panel, every view's
`sf-gradient` CTAs, the calendar's selected-day accent fill) had their dark
rendering verified for only 6 views per accent. Dark mode is the clone's
SUPERSET feature (the reference's own Dark/System options are a measured
Base44 no-op — S10-1), and the working accent system is the functional
superset (the reference's picker saves but never re-themes — re-verified
S3) — so this combo's correctness is guaranteed by nothing at execution
time. This is the documented remaining open item from session 85/86 (the
S37 summary's next steps: "the accent × dark × mobile × 14 views matrix —
extend accent-dark-sweep's MOBILE_VIEWS").

**The companion finding (the anti-phantom gap in the envelope shape):** the
accent-dark envelope's mobile surface records only NON-CLEAN views
(omission-means-clean — the S11 shape), so the seam cannot distinguish
"clean because measured" from "clean because never rendered". A `MOBILE_VIEWS`
shrink (the exact rot this session closes) reads **green-by-omission**
today: the current seam (`classifyAccentDarkSweep`) has no ALL-ACCENTS
guard, no ALL-VIEWS guard, no mode guard, and no viewport guard — every
one of those rot classes is silent. This is the S37 lesson (the
ALL-ACCENTS guard: "an accent that silently did not run must never read
green-by-omission") applied one dimension out: the VIEW dimension of the
mobile pass.

## Families and fixes

### S38-A (HIGH) — the seam guards on `classifyAccentDarkSweep` + the unit pins

The seam (`src/lib/suite-verdict.ts`, `classifyAccentDarkSweep`) gains, in
the S37-doctrine shape:

1. **The envelope metadata shape**: `mode` (string — shape-error if
   missing), `mobileViewport` (must be exactly `{width: 390, height: 844}`
   — the mobile pass's contract; a desktop/mid-band viewport fed here is a
   shape-error, never a silent re-scope), `applied` (an object mapping all
   7 accent keys to their self-verified `<html data-accent>` readings).
2. **The ALL-ACCENTS guard (both surfaces + `applied`)**: every one of
   violet, blue, green, orange, pink, red, teal must be a key on
   `desktop`, `mobile`, and `applied` — a missing accent is a LOUD
   shape-error, never green-by-omission (the S37 guard applied to this
   audit).
3. **The ALL-VIEWS guard (both surfaces)**: every accent's view map must
   carry all 20 canonical view names (the `NAV_ITEMS` order: Dashboard,
   MyDay, Tasks, Calendar, Events, Timetable, Assignments, Exams, Notes,
   Flashcards, PracticeTests, StudyGroups, GradeTracker, Analytics, Files,
   Calculator, MathSolver, AIAssistant, FocusTimer, Settings) — a missing
   view is a LOUD shape-error. The omission-means-clean recording shape is
   RETIRED: the probe records every view explicitly (clean views carry
   empty detector arrays), desktop and mobile alike.
4. **The drawer record (mobile, per accent)**: must be present per accent
   with `linkCount` (number) + the three detector arrays; an `error`
   string on the record (the guarded drawer-open catch) counts as a
   FINDING — a drawer that failed to open is a finding, never a swallow.
5. **The per-view record shape (strict)**: desktop records carry
   `flashbulbs`/`unreadable`/`lowcontrast` arrays; mobile records carry
   those plus `scrollWidth` (number) — a mobile `scrollWidth > 390`
   counts as a finding (the S16 mobile-only-gap class; measured, never
   ignored).
6. **The mode rot guard**: `mode !== "dark"` reads NON-green (a finding,
   the S27 rot-guard family — the accent × light family belongs to
   accent-light-sweep, the INVERSE guard of S37's).
7. **The applied-mismatch guard**: `applied[a] !== a` counts as a finding
   per mismatch (the S37 applied-mismatch family — the accent that did
   not apply through the real lifecycle).
8. **The counting semantics preserved**: flashbulbs are ALWAYS findings;
   white-on-accent unreadable entries (`color === "rgb(255, 255, 255)"`)
   are the CTA-face exemption (the S11 family-2 non-gap, counted into the
   note); lowcontrast entries are WARN (the S11 non-gap family, the note
   never the findings).

The unit pins (`tests/suite-verdict.test.ts`, the S38 block after the S37
block): a full-shape fixture generator (`s38AccentMaps`) building the 7
accents × 20 views × both surfaces + drawer envelope, then the pin
families — the GREEN shape with the swept counts in the note; the
missing-view guards (mobile + desktop, each a shape-error); the
missing-accent guard (a shape-error); the historical 6-view mobile
envelope (the pre-S38 shape — the exact rot — a shape-error); the missing
drawer record; the missing-mode shape-error; the wrong-viewport
shape-error; the mode-rot family (`mode: "light"` → non-green); the
applied-mismatch family; the drawer-error-is-a-finding family; the mobile
overflow family (`scrollWidth: 420` → finding); the strict-record family
(a record missing `lowcontrast` → shape-error); and the counting
preservation on the new shape (CTA-face / WARN / flashbulbs — the updated
S11/S65 pins, their fixtures rebuilt on the full shape). TDD: RED first —
the guard pins fail under the current seam (it reads the same envelopes
green); GREEN: the seam implementation; then the full-file re-run.

### S38-B (HIGH) — the probe: `scripts/accent-dark-sweep.mjs`

1. `MOBILE_VIEWS` is RETIRED — the mobile pass sweeps **all 20 views**
   (the `VIEWS` list), direct goto (the probe's navigation pattern; the
   drawer-navigation structural family is the S36 dark-mobile-sweep's
   contract), per accent, at 390×844 in dark, with the Settings
   Avatar-tab interaction preserved (the emoji grid's accent-tinted
   swatch — the mobile-only accent surface).
2. **Every view recorded explicitly** on both surfaces (clean views carry
   empty detector arrays) — the envelope shape the ALL-VIEWS guard
   enforces.
3. **The applied self-verification**: the existing `waitForFunction`
   (dark class + `data-accent`) is kept and strengthened — `applied !==
   accent` fails LOUDLY (exit 1, the S37 `fail()` pattern, with the
   closing restore attempted first), and the per-accent reading rides the
   envelope's `applied` map for the seam's mismatch guard.
4. **The mobile records gain `scrollWidth`** (the CHECKER returns it; the
   seam counts > 390 as a finding).
5. **The drawer record per accent is unconditional**: `linkCount` + the
   detector arrays, with the guarded catch recording `{error, ...}` (a
   finding at the seam) instead of a swallowed error; the probe asserts
   `linkCount === 20` loudly.
6. **The viewport assertion**: the mobile page asserts BOTH axes applied
   (390×844 — the S33/S37 doctrine) before sweeping.
7. **The envelope metadata**: `mode: "dark"`, `mobileViewport` (the
   asserted reading), `applied` (the per-accent map).
8. **The failure-path restore**: the whole sweep rides a try/catch whose
   catch restores light + violet before re-raising (the S37 pattern);
   the closing restore stays explicit + awaited.
9. **Out of scope (documented non-goals)**: console-error capture (the
   S36 dark-mobile-sweep owns the dark × mobile console family; this
   audit's contract is the contrast detector family), the
   drawer-navigation structural family (S36's contract), and any change
   to the desktop pass's detector family (only its recording shape
   changes — every view recorded).

### S38-C (LOW, discovered mid-execution) — the runner's per-stage timeout

`scripts/standing-suite.mjs`: the STAGE_TIMEOUT_MS constant is 10 minutes —
the pre-S38 accent-dark stage (6 mobile views) fit comfortably, but the
extended mobile 20-view matrix measures **~17–18 min** (7 accents × [20
desktop + 20 mobile + the drawer], the 1.4 s settle band preserved — the
measurement quality is never traded for the timeout). The fix: an optional
per-stage `timeoutMs` override on the STAGES entries (the
accent-dark-sweep stage carries 25 min — ~40% headroom over the measured
run; every other stage keeps the 10-min default, so a genuinely-hung fast
stage still surfaces quickly), consumed as
`spec.timeoutMs ?? STAGE_TIMEOUT_MS` in `runAuditStage`. The first
validation attempt was killed at this discovery (the runner would have
SIGKILLed the stage at 10 min → exit 124 → a non-green row that is a
HARNESS limit, not a code finding — exactly the phantom class the S32
seam exists to prevent), the fix applied, and the validation re-run in a
fresh clean window.

### S38-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the accent-dark-sweep command entry: 20 mobile views + the
guards; the suite runtime note), vitest.config.ts (the new unit count +
the S38 seam note), CLAUDE.md (the count + the seam note), PAD §8.1 (the
suite-verdict row extended + the per-file count + the Total),
README.md (the badge + the count lines + the session-38 status row),
omni-study_SKILL.md (the counts + AP-83 — the lesson), the worklog S38
entry, this plan's execution log, the session narrative + summary.

### S38-E (MEDIUM) — the evidence + the session record

The evidence envelope: the clean-window validation suite run's
`docs/screenshots/s38-accent-dark-mobile-sweep-evidence.json` (22 stage
rows, the accent-dark-sweep row GREEN inside the suite with the new
note). The evidence screenshot: the drawer OPEN at 390×844 in DARK mode
under a non-violet accent (mirroring the S37 light-accent drawer
capture), via a `scripts/capture-s38-evidence.mjs` modeled on the S37
capture script. The session docs: `docs/session_87.md` (the narrative) +
`docs/session_88.md` (the summary).

## Non-gaps (documented, do not fix)

- **The CTA-face** — white-on-accent-500 unreadable entries, the
  documented S11 family-2 (the reference's own accent-CTA choice; the
  same design in light mode). Already exempt at the seam; counted into
  the note.
- **The lowcontrast WARN family** — 2.2 ≤ contrast < 3.2, the
  accent-600-on-dark family (the accent-dark-sweep's own documented WARN
  family; the codebase's dark convention is strongDark). Rides the note,
  never the findings.
- **The 429-RUM backpressure** — under the heavy sweep volume the S18
  beacon's designed 1000/15-min budget exhausts and the browser's
  network-layer console line surfaces (not app-suppressible). This probe
  captures no console errors by contract (S38-B.9), so the class cannot
  surface here; documented for the suite window regardless.
- **The fixed-violet surfaces** — the S37 static scan classified every
  hardcoded-violet surface as measured-parity design color (the reference
  never re-themes; fixed-violet is reference-consistent at every accent
  by construction). No genuine accent-surface bug exists statically.
- **The reference's accent picker no-op** — the reference saves but never
  re-themes (re-verified S3): the clone's working accent system is the
  functional SUPERSET, so this combo is a superset-quality contract, not
  a parity contract.

## TDD order

1. **The exploration (BEFORE the plan finalizes)** — the S38 exploration
   probe sweeps the whole accent × dark × mobile family (7 accents × 20
   views + the drawer at 390×844, dark, PATCHed through the settings API
   and self-verified) and classifies every surfaced entry with evidence
   BEFORE any code changes (the S32 run-1 discipline). Expected families:
   the CTA-face and the WARN band (both documented above); anything else
   is a genuine finding and re-scopes this plan.
2. **RED** — the S38 pin block written first; the guard pins fail under
   the current seam (it reads the same envelopes green); `bunx vitest run
   tests/suite-verdict.test.ts` shows the failures.
3. **GREEN** — the seam implementation (S38-A); the file re-runs clean;
   the full unit layer re-runs clean.
4. **The probe** — S38-B; the genuine run 1 against the dev server; every
   finding classified with evidence before any exemption ships (the S32
   discipline); the clean genuine re-run if the exit logic needs
   alignment.
5. **The validation protocol** — the dev server restarted by PID (the
   S32 clean-window remedy — the ai:/RUM budgets), the S31 preflight
   GREEN, then the clean-window full-suite run **22/22 GREEN, exit 0**;
   the evidence envelope captured.
6. **The gates** — lint ✓ tsc ✓ unit (the new count) ✓ build ✓ cold-db
   **291 e2e** ✓ (the 291 prior pins untouched by construction — zero
   app code, zero CSS, zero Tailwind v4 surface, zero parity-pinned
   bytes).
7. **The standing checks** — the drawer check GREEN; the evidence
   screenshot captured; the standing 31 screenshots refreshed; the theme
   verified light/violet via Prisma (the closing guard).
8. **The docs** — S38-D + S38-E; the workspace worklog; the commit + the
   push via the SSH wrapper (`--remote git@github.com:nordeim/omni-study.git`).

## Risks

- **The suite runtime grows ~3–4 min** (the mobile pass adds 14 views × 7
  accents with the 1.4 s settle band) — acceptable against the S37
  suite's ~32 min; the ai: budget is untouched (zero AI requests by
  construction).
- **The RUM budget under the day's sweep volume** — the exploration (140
  mobile loads) + the genuine runs + the suite's own sweeps can exhaust
  the 1000/15-min beacon budget; the 429 class is documented (the S18
  backpressure), this probe captures no console errors, and the suite's
  affected stages filter the exact-text signature.
- **The S32 differential** — back-to-back suite runs in one server window
  spend the in-memory ai:/RUM limiters; the validation run MUST restart
  the dev server by PID first (the documented remedy).
- **The envelope size grows** (7 accents × 20 views × 2 surfaces + the
  drawer, explicit empty arrays) — the JSON envelope stays well under
  1 MB; the suite's stdout parse is unaffected (parseAuditStdout handles
  multi-KB envelopes; the S37 envelope is the same order).
- **The drawer flake per accent** — the guarded catch now records a
  FINDING (not a swallow); a flaky drawer read surfaces as a non-green
  stage and the suite is re-run — the loud-failure doctrine, accepted.
- **The existing pins are RE-BASED** (the S11/S65 accent-dark fixtures
  gain the full shape; ~6 pins updated) — the pin COUNT grows (the new
  S38 block); the vitest.config.ts count and every doc that carries it
  update in the same commit (the AP-74 guard).
- **The `:3200` standalone trap (re-learned this session)** — the
  standalone server's process name is `next-server (v16.4.0)`, NOT
  `server.js`: kill by PID (the AP-70 lesson), verify the port is free,
  and confirm the served database before any sweep measures it.

## Execution log (session 87 — filled as executed)

- The arrival standing suite (the S37 one-command suite, run in the clean
  window after the dev-server restart by PID): **22/22 GREEN, exit 0** —
  zero code findings on arrival. The accent-dark-sweep row: "31 entries
  probed; 5 CTA-face exempt … 122 WARN" (the omission-shape counting —
  the non-clean desktop + mobile entries across all 7 accents).
- The exploration (the plan-validation probe, `/tmp/s38-exploration.json`
  — 7 accents × 20 views + the drawer per accent at 390×844 in dark,
  PATCHed through the settings API, self-verified on `<html data-accent>`
  + the dark class, every view recorded explicitly): **the family is
  CLEAN — the state green, the guarantee absent** (the S36/S37 pattern):
  - **flashbulbs 0** across all 140 view renderings + 7 drawer records
    (zero opaque light surfaces in dark at mobile at every accent);
  - **non-exempt unreadable 0** — the only unreadable entries are **3
    CTA-face** (white on orange-500, contrast 2.15: the Calendar
    "Calendar" chip + the "11" selected day + the PracticeTests "Start
    Test" button — the documented S11 family-2, the same entries the
    desktop pass and the arrival suite row carry);
  - **lowcontrast WARN 48** — three documented families, each verified
    per-accent: the Assignments amber pills ("essay"/"worksheet", 3.07 —
    all 7 accents), the Calendar slate-400 adjacent-month days
    ("27".."30", 2.36 — all 7 accents, the dark sibling of the S6-G
    light pin), and the accent-600 text boundary entries (the Calendar
    chip + PracticeTests CTA at 2.49–2.54 — the accent-dark-sweep's own
    documented WARN band);
  - **scrollWidth ≤ 390 on every rendering** — zero mobile overflow at
    every accent (the layout is accent-independent, as designed);
  - **zero console errors** (the 429-RUM backpressure class filtered per
    the documented S18 signature);
  - **the drawer clean at every accent** (0/0/0 detectors on all 7).
  No genuine finding surfaced — the plan ships as the coverage extension
  (no re-scope needed).
- (the TDD execution continues below as it completes)
- TDD RED: 17 new pins in the S38 block (the GREEN shape with the swept
  counts in the note; the ALL-VIEWS guards mobile + desktop; the
  ALL-ACCENTS guards [a surface + the applied map]; the historical
  6-view mobile envelope — the exact pre-S38 rot; the missing-drawer /
  missing-mode / wrong-viewport shape-errors; the mode-rot family
  [mode=light → non-green]; the applied-mismatch family; the
  drawer-error-is-a-finding family; the mobile overflow family
  [scrollWidth 420 → finding]; the strict-record families incl. the
  missing scrollWidth) + the 4 S11/S65 accent-dark pins re-based on the
  full-shape `s38Envelope` generator → **15 failed / 120 passed** under
  the current seam (it reads the same envelopes green — the exact
  phantom class the guards close).
- TDD GREEN: `classifyAccentDarkSweep` rebuilt (S38-A) → **135/135** in
  the file; the full unit layer **419** (20 files; was 402); lint ✓
  tsc ✓.
- The probe (S38-B) rewritten: MOBILE_VIEWS RETIRED, all 20 mobile views
  per accent + the drawer census, every view recorded explicitly, the
  applied self-verification, the viewport assertion, the scrollWidth
  readings, the failure-path restore. **Genuine run 1: findings 0** (6
  CTA-face exempt — the mobile 3 plus the desktop pass's own entries;
  138 WARN; 0 overflow; 0 drawer errors; 20 desktop + 21 mobile records
  per accent; ~17–18 min measured) — the envelope classified **GREEN at
  the seam**: "280 view renderings probed (7 accents × 20 views ×
  desktop+mobile) + 7 drawer records; 6 CTA-face exempt … 138 WARN".
- The S38-C discovery (mid-execution): the extended stage's ~17–18 min
  EXCEEDS the runner's 10-min STAGE_TIMEOUT_MS — the first validation
  attempt was killed at stage 7 (the runner would have SIGKILLed the
  accent-dark stage at 10 min → exit 124 → a non-green row that is a
  HARNESS limit, not a code finding). The per-stage `timeoutMs` override
  applied (the accent-dark stage carries 25 min); the dev server
  restarted by PID; the validation re-run launched in the fresh clean
  window.
- The validation run: **22/22 GREEN, exit 0** — the accent-dark-sweep
  row GREEN inside the suite with the new note ("280 view renderings
  probed (7 accents × 20 views × desktop+mobile) + 7 drawer records; 6
  CTA-face exempt … 138 WARN"); the raw envelope verified full-shape
  (all 7 accents on both surfaces, 21 mobile records per accent, the
  applied/mobileViewport/mode metadata); the evidence envelope captured
  to `docs/screenshots/s38-accent-dark-mobile-sweep-evidence.json` (22
  stage rows).
- Gates re-run: lint ✓ tsc ✓ **419 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ (4.6 min) = **710 green** (was 693; +17 unit pins; the
  291 prior pins untouched by construction — zero app code, zero CSS,
  zero Tailwind v4 surface, zero parity-pinned bytes).
- Standing checks re-run post-change: the drawer check GREEN; the S38
  evidence screenshot captured via `scripts/capture-s38-evidence.mjs`:
  `docs/screenshots/s38-accent-dark-drawer-teal-390.png` — the drawer
  OPEN at 390×844 in DARK mode under the TEAL accent (the record
  verified in-frame: linkCount 20, the teal active-tint gradient
  `rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1)` — the
  NAV_ACTIVE_GRADIENT_STOPS teal pair — dark class applied,
  scrollWidth 390); the standing 31 screenshots refreshed via
  `capture-studyflow.mjs`; the closing theme guard verified via Prisma:
  **light/violet**.
- Docs aligned (the AP-74 guard): AGENTS.md (the S38-extended
  accent-dark-sweep command entry + the 419 line), vitest.config.ts (419
  + the S38 seam note), CLAUDE.md (419 + the S38 seam), PAD §8.1 (the
  suite-verdict row rebuilt + the per-file count 118 → 135 + Total
  710/419), README (the 710 badge + the 419 lines ×2 + the S38
  classifier mention + the session-38 status row), SKILL.md (the 710/419
  counts ×2 + AP-83), the worklog S38 entry, the session_87 narrative +
  the session_88 summary.
