# Remediation Plan — Session 49 (S49): the light × landscape × volume family — the S13 volume profile (300/200/250) swept through the theme space's light half at the LANDSCAPE viewport (844×390, the iPhone-class landscape — the 390–430px-tall band's canonical width, the LAST viewport band), navigated through the drawer, as a standing, executable guarantee

**Audit surfaces (this session, the session_119/120 workspace re-verified at `4e7f30f`):** the
baseline gates re-confirm the documented **1024-green** state on arrival (lint
✓ tsc ✓ **733 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.6 min** — after the documented fresh-environment
`bunx playwright install chromium` step), the S31 preflight GREEN before the
checks, the drawer check GREEN, the live agent-browser 390×844 walkthrough
GREEN (**the mobile navigation menu is working as expected** — the standing
emphasis), the reference re-swept **UNCHANGED since S19–S48** (login title
"AcademiaFlow (Copy)", the email-prefix greeting, the 20 nav views in the same
order, the five Settings tabs), the copy sweep 14/20 (the 6 data-state
non-gaps), and the S48 one-command standing suite (**32 rows, the 30-audit
version**) launched for the arrival check; its result is recorded in the
execution log below.

## The governing finding (this session's work)

**The light × landscape × volume family is the documented bracketed non-gap — and
this session closes it** (the S48 summary's own named next candidate: "the
light × landscape × volume cell (844×390) — the S49 mirror, completing the
cross-axis's last band (needs the THREE light exemptions from the S43/S45/S47
doctrine)" — the S42→S43 / S44→S45 / S46→S47 / S48→S49 family pattern: the
last zero-coverage cell of the volume × theme × viewport cross-axis).

The coverage map, verified against the standing scripts (grep-verified this
session):

- `scripts/data-volume-audit.mjs` (S13): the 300/200/250 profile, the
  payload/long-task/click-latency budgets — **1280×800, LIGHT + VIOLET only**
  (line 77: `viewport: { width: 1280, height: 800 }`; zero theme references) —
  the desktop, once, default theme only.
- `landscape-sweep` (S35) + `accent-landscape-sweep` (S40): the landscape
  viewport family at 844×390 — **SEED volume** (the `STRESS|countMany|
  createMany|deleteMany` grep returns ZERO hits in both) and **LIGHT only**
  (S35 violet; S40's every PATCH carries `themeMode: "light"` — 8 hits, all
  light — the volume axis is the blind spot).
- `accent-volume-sweep` (S42) + `accent-volume-light-sweep` (S43): 7 accents ×
  the 7 volume views — **1280×800 only** (`const W = 1280`).
- `accent-volume-dark-mobile-sweep` (S44) + `accent-volume-light-mobile-sweep`
  (S45): the mobile halves — **390×844 only** (`const W = 390`).
- `accent-volume-dark-midband-sweep` (S46) + `accent-volume-light-midband-sweep`
  (S47): the mid-band halves — **768×1024 only** (`const W = 768`).
- `accent-volume-dark-landscape-sweep` (S48): the landscape half — **844×390
  DARK only** (its mode precondition requires dark; its own seam's rot-guard
  comment names the light family as "the documented S49 mirror").
- NO light sweep runs at 844×390 at all (every "844" grep hit in the light
  sweeps is a comment reference or the mobile HEIGHT of 390×844 — verified).

So the cross-axis cell **light × landscape × accent × volume** is ZERO-coverage
at every accent: the densest renderings (the 300-row Tasks list, the 250-event
terminal panel, the 200-note list) had never been rendered in LIGHT at the
844×390 landscape layout under ANY non-violet accent at volume (S35 proved
landscape light+violet at seed; S40 accent × landscape at seed light; S43
light × volume at desktop 1280; S45 light × volume at mobile 390; S47 light ×
volume at mid-band 768; S48 dark × volume at landscape 844 — the 844 width in
LIGHT at volume was never rendered by any standing audit under any accent), the
S13 volume budgets had never been measured at the landscape viewport in LIGHT
under an accent variation, AND the DRAWER's active-link tint had never been
read through the real navigation lifecycle in LIGHT at LANDSCAPE at VOLUME.
The S43/S45/S47 light doctrine governs: NO flashbulbs (the class exists only
in dark — a light surface on the light canvas is by-design); unreadable < 2.2
with the THREE signature-strict light exemptions (the CTA-face white-on-accent
+ the calendar adjacent-month slate-300 day numbers + the yellow-500
priority-pill high/medium/low — the reference's own design in light);
lowcontrast < 3.2 = WARN.

**The landscape geometry** (the short-viewport family, the S35/S40/S48
doctrine — RE-MEASURED EMPIRICALLY THIS SESSION in LIGHT before the plan was
finalized): at 390 height the 20 nav rows (scrollHeight ~1068) cannot fit the
~301px nav area (the 390 viewport minus the ~89px brand header) — the nav MUST
scroll; links ~8–20 sit below the fold and the nav's scroll is the only path
to them (measured live: 1068 vs 301, scrollable TRUE — identical to the
S35/S40/S48 measurements). The fixed h-16 app bar covers 16% of the 390px
viewport, so the heading-clearance contract (the heading's box top ≥ the 64px
bar) is at its tightest here (measured live: the Dashboard greeting top 80 ≥
64; the Notes :visible h2 top 586 ≥ 64 — the hidden desktop h1 is exactly why
the probes filter :visible). The vehicle contract holds (sidebarVisible=false
+ hamburgerVisible=true at 844). The light-mode hydration gate applies (the
S43/S45/S47 lesson: `!html.dark` is TRUE at first paint, so the initial gate
is the POST-MOUNT observable — the greeting heading).

## Families and fixes

### S49-A (HIGH) — the seam `classifyAccentVolumeLightLandscapeSweep` + the unit pins

The seam (inserted after the S48 classifier, before the cwv section), on the
S43/S45/S47 light doctrine with the S35/S40/S48 landscape vehicle:

- the **viewport guard** (844×390 BOTH axes — the 1280×800 desktop, 390×844
  mobile, and 768×1024 mid-band envelopes each read shape-error: the sibling
  families own those surfaces; the transposed pair of the mobile 390×844 is a
  different device class);
- the **mode rot guard INVERTED** (mode MUST be light — the dark × landscape ×
  volume family is the S48 audit's own: the mode is the discriminator on this
  very cell; an envelope with `mode=dark` fed here reads NON-green, never a
  silent re-scope);
- the **volume-EXACT guard** (300/200/250 — a seed-volume envelope is its own
  rot class, the S38 retirement applied to the volume axis);
- the **ALL-ACCENTS + ALL-VIEWS guards** (the 7 accents; the 7 volume-affected
  views by DISPLAY labels — the S13 set; a missing key is a LOUD shape-error,
  never green-by-omission);
- the **LANDSCAPE vehicle contract** (the below-lg family: sidebarVisible MUST
  be false + hamburgerVisible MUST be true — the drawer is the only vehicle
  below 1024, the S35/S40/S48 landscape contract at volume) + the **drawer-own
  nav-scroll contract** (drawerNavScrollable — the nav MUST scroll at 390
  height: the 20 nav rows measure scrollHeight ~1068 vs the ~301px nav area,
  so links ~8–20 sit below the fold and the nav's scroll is the only path to
  them — the S35/S40/S48 geometry, re-verified empirically this session
  BEFORE the pins are written);
- the per-accent **applied self-verification** (applied === the accent key);
- the **drawer link census** (linkCount === 20) + the drawer-error class (an
  error string is a FINDING, never a swallow);
- the **interaction classes in LIGHT at LANDSCAPE at volume**: the tint rot
  (activeTint none/empty — the S8 no-var class) + the active-state mismatch
  (activeLabel ≠ the view);
- the **structural below-lg family at volume** (drawerClosed / appBar /
  headingClearance — the S33/S35/S40 contracts; the fixed glass app bar with
  the 2-digit-hour clock renders below lg at 844 too, and the heading clears
  the 64px bar via the pt-20 offset at the SHORT viewport);
- the **S16 overflow class** (scrollWidth > 844 — a 300-row list must never
  widen the 844px document);
- the **S13 B2/B3 volume budgets** with boundary-exact pins (longTaskTotal ≤
  1500ms; clickLatencyMs ≤ 1500ms over the drawer-close + view-mount path; the
  boundary value 1500 stays green on both);
- the **LIGHT detector family** (the S43/S45/S47 doctrine): NO flashbulb term
  (the class exists only in dark); unreadable < 2.2 counted INDEPENDENTLY of
  the findings array with the **THREE signature-strict light exemptions** (the
  CTA-face `rgb(255, 255, 255)` white-on-accent — the S11 family-2 non-gap;
  the calendar adjacent-month day numbers `rgb(203, 213, 225)` + 1–2-digit
  text; the yellow priority-pill `rgb(234, 179, 8)` + high/medium/low) — each
  with a strictness negative; lowcontrast < 3.2 = WARN (rides the note, never
  the findings);
- the **/api/tasks ≤ 500KB B1 bound** (the boundary 500,000 stays green).

The pin block (appended after the S48 describe block): ~40 pins — the s49
envelope generator (7 accents × 7 views + the drawer record per accent at
844×390 LIGHT under the volume profile, with the LIGHT record shape — the
unreadable/lowcontrast keys, NO flashbulbs keys, the activeLabel-defaults-
filled interaction contract), the GREEN shape with the swept counts (49
renderings / 49 active-tint readings / 7 drawer records / MODE light), the
ALL-VIEWS + ALL-ACCENTS guards, the historical S13-shape envelope →
shape-error, the historical S42/S43 desktop + S44/S45 mobile + S46/S47
mid-band envelopes fed here → the viewport shape-errors (the landscape seam
owns 844×390), **the historical S48 DARK-landscape envelope fed here →
NON-green via the mode rot guard** (the dark shape is a SUPERSET of the light
shape — its extra flashbulbs keys ride along, the shape checks require keys
and never reject extras; the mode is the discriminator on this very cell, the
S48→S49 mirror pattern — documented as its own assertion), **the S45 light
mobile envelope re-scoped to 844×390 → GREEN** (the cross-check that the seam
discriminates on the viewport, not the shape), the
missing-volume/missing-drawer/missing-mode shape-errors, the wrong-viewport
family (1280×800 AND 390×844 AND 768×1024), the mode-rot family (mode=dark →
non-green), the volume-rot family (tasks 0 / notes 199 / events 0), the
applied-mismatch family, the LANDSCAPE vehicle-contract family, the
drawer-nav-scroll family, the tint-rot + interaction families, the overflow
family (scrollWidth 854 → finding), the structural below-lg family, the B3/B2
budget families with boundaries, the strict-record families, the
independent-counting family, the THREE light exemptions each with a
strictness negative (a non-white CTA-shaped text still counts; a slate-300
NON-day-number text still counts; a yellow-500 non-pill text still counts),
the WARN family, the drawer-error + link-census families, the B1 bound with
boundary, the unknown-audit guard.

### S49-B (HIGH) — the probe: `scripts/accent-volume-light-landscape-sweep.mjs`

The S47 light probe verbatim (the volume lifecycle + the drawer vehicle + the
pendingView interaction pattern + the below-lg structural family + the S13
measurement family + the LIGHT checker with the light canvas fallback
`rgb(248, 250, 252)` + the light-mode hydration gate [the greeting heading —
the S43/S45/S47 lesson: `!html.dark` is TRUE at first paint, so the gate is
the POST-MOUNT observable] + the finally-race fix + the AP-85 trailing-write
exit + the precondition fail() THROWS), re-anchored to the landscape light
half (the S48 vehicle verbatim):

- `W = 844; H = 390` (the S35/S40/S48 landscape class — the short viewport),
  `MAX_WIDTH = 844`;
- the **LIGHT checker verbatim** (the S43/S45/S47 light detector family:
  unreadable + lowcontrast with the effective-background walk, NO flashbulbs —
  the class exists only in dark; the `display:none` guard for the hidden
  desktop sidebar and the closed drawer);
- the **drawer-scoped LIGHT checker** (the S47 drawer checker re-anchored);
- the **light-mode precondition through the REAL lifecycle** (PATCH
  themeMode=light → goto → the greeting-heading hydration gate → the mode
  read-back — no first-paint race in light);
- the **per-accent gate with the shell-presence guard from birth**
  (`data-accent === accent && !html.dark && !!document.querySelector("header")`
  — the AP-90 lesson, on BOTH the initial gate and the per-accent gates from
  birth: the S47 field correction + the S48 doctrine applied);
- the **drawer-own nav-scroll contract re-measured per accent** (scrollHeight
  ~1068 vs clientHeight ~301 at 390 height — the S35/S40/S48 landscape
  geometry, re-verified empirically this session);
- the marker `STRESS-S49-` (no collision with S13/S42–S48); the closing
  restore light/violet + the pre-exit cleanup (idempotent) + the catch-path
  restore;
- the exit-code computation with the THREE light exemptions (the CTA-face +
  the calendar adjacent-day + the yellow priority-pill; NO flashbulb term).

### S49-C (MEDIUM) — the runner: the 31st stage

`scripts/standing-suite.mjs`: the STAGES entry
`{ name: "accent-volume-light-landscape-sweep", file:
"scripts/accent-volume-light-landscape-sweep.mjs", runtime: "node", timeoutMs:
25 * 60_000 }` directly after accent-volume-dark-landscape-sweep (the volume
family together: dark desktop, light desktop, dark mobile, light mobile, dark
mid-band, light mid-band, dark landscape, then light landscape — the cross-axis
COMPLETE) + the stage-count literals (`0/31`, `${i + 1}/31` ×2, `31/31`) + the
header comment (the suite now **33 rows**: preflight + 31 audits +
theme-restore).

### S49-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the new unit-count line + the accent-volume-light-landscape-sweep
command entry + the 31-audit suite entry), vitest.config.ts (the count
comment), CLAUDE.md (the count + the S49 seam note appended to the seam
history), PAD §8.1 (the classifier + the per-file count + the Total line),
README.md (the badge + the count lines ×2 + the session-49 status row),
omni-study_SKILL.md (the counts). `.env.example` audited (matches, tracked).

### S49-E (MEDIUM) — the evidence + the session record

`scripts/capture-s49-evidence.mjs` (the S48 pattern mirrored onto the light
landscape half: the Tasks view at 300 rows in LIGHT under TEAL at 844×390 with
the drawer OPEN on the navigated Tasks view — the teal
NAV_ACTIVE_GRADIENT_STOPS gradient on the active link, linkCount 20, the
in-frame verification incl. the light unreadable probes with the THREE light
exemptions + the landscape nav-scroll geometry) →
`docs/screenshots/s49-accent-volume-light-landscape-teal-tasks-844.png`; the
evidence envelope `docs/screenshots/s49-accent-volume-light-landscape-sweep-evidence.json`
(the validation suite's JSON envelope — 33 stage rows); the standing 32
refreshed via capture-studyflow.mjs (theme restored light/violet, verified
via the DB); the worklog entry + the session_121 narrative + the session_122
summary + this plan's execution log.

## Non-gaps (documented, do not fix)

- **The volume × theme × viewport cross-axis is now COMPLETE** (all EIGHT
  halves: dark/light × desktop/mobile/mid-band/landscape) — no zero-coverage
  volume cell remains on the map.
- **The RUM-beacon second cross-axis** (RUM-beacon behavior under suite
  volume) — a future cross-axis candidate (the S45–S48 summaries' named
  family).
- **The DARK × landscape × SEED cell for the 13 volume-invariant views**
  (Timetable, Assignments, Exams, Flashcards, Practice Tests, Study Groups,
  Grade Tracker, Files, Calculator, Math Solver, AI Assistant, Focus Timer,
  Settings — they render no task/note/event rows) — the light × landscape ×
  SEED × accent cell is the S40 accent-landscape-sweep's own (closed there);
  the dark half remains a documented future candidate (the S46 plan's own
  note, carried to the landscape band).
- **The lowcontrast WARN family** — the S11 non-gap (2.2 ≤ contrast < 3.2) —
  WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed backpressure,
  filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3, Prisma's
  deepmerge-ts pin)** — the owner's standing open items (Docker unavailable
  in this sandbox; the patches land upstream).

## TDD order

1. The S49 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
2. `classifyAccentVolumeLightLandscapeSweep` in `src/lib/suite-verdict.ts`
   (GREEN — the file, then the full unit layer 733 + ~40 = ~773).
3. `scripts/accent-volume-light-landscape-sweep.mjs` (the exploration — the
   genuine run 1 against the dev server, AFTER the arrival suite completes:
   the volume lifecycle and the dev server are shared surfaces; the family
   validated clean BEFORE the runner integration).
4. The runner's 31st stage + the literals.
5. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
6. The gates re-run (lint, tsc, the new unit count, build, cold-db 291 e2e —
   `rm -f db/e2e.db` before EVERY full run, the S46 always-cold-db lesson).
7. The evidence + the docs + the commit + the push.

## Risks

- **The drawer open/close cost at volume at the landscape viewport in light**:
  49 navigations × (drawer open + link click + drawer close + render settle +
  checker + measure) — the S44/S45 mobile halves measured ~2.9 min; the S46/S47
  mid-band halves ~3.0 min; the S48 dark landscape half 2m58s — the same band
  expected (the light half renders the same 300/200/250 density over the SHORT
  canvas). Mitigation: the 25-min stage budget (~8× headroom); the exploration
  measures the real duration BEFORE the runner integration (the S38-C lesson).
- **The light lowcontrast WARN volume**: the S43 light desktop half read a
  WARN band in the thousands (the light canvas carries more sub-3.2 surfaces
  by design); the S45 light mobile half 3,270; the S47 light mid-band half
  3,284 — the same band expected and the WARN class never fails (the S11
  non-gap family).
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server + the probe's
  chromium + the volume DOM — close every interactive browser session before
  the launch; the container ceiling is ~4 GB.
- **The light-mode first-paint race** (the S43/S45/S47 lesson): `!html.dark`
  is TRUE at first paint — the initial mode gate MUST wait on the POST-MOUNT
  observable (the greeting heading), and the per-accent gates carry the
  shell-presence guard from birth (the AP-90 lesson; the S47 initial-gate
  field correction folded in).
- **The pendingView interaction read at volume at the SHORT viewport**: the
  drawer open reads the active link while the previous view is active — at
  volume the re-open renders 20 links over a DOM carrying thousands of stress
  nodes; the read is scroll-independent (the active link stays in the DOM with
  computed styles — the S40 note).
- **The marker-row collision**: the standing suite's data-volume stage uses
  `STRESS-S13-`; S42–S48 use `STRESS-S42-`…`STRESS-S48-`; this probe uses
  `STRESS-S49-` — no collision. The pre-clean + the pre-exit cleanup make
  partial runs idempotent.
- **The RUM budget**: 49 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text 429
  filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The arrival-suite overlap**: the S49 exploration must NOT run while the
  standing suite holds the dev server + the shared DB (the data-volume stage
  inserts its own marker rows) — the TDD unit work runs during the suite;
  the exploration runs after it completes.

## Execution log (session 121 — filled as executed)

- ARRIVAL: the workspace re-cloned fresh (`4e7f30f` — the S48 feat push
  `616bb2e` + the user's session_119/120 log updates), the environment
  rebuilt (.env created from .env.example per the contract with the dev
  posture `AUTH_SECRET=""`, `bun install`, `bun run db:push` + `db:seed` —
  the demo user + 13 subjects, `db/custom.db` at the repo root). **The
  1024-green baseline gates re-confirmed at the S48 state**: lint ✓ tsc ✓
  **733 unit ✓ (20 files)** build ✓ cold-`db/e2e.db` **291 e2e ✓ (4.6 min)**
  = 1024 green — after the documented fresh-environment Playwright chromium
  install (the first e2e attempt failed 267/291 with the
  `Executable doesn't exist` launcher error; `bunx playwright install
  chromium` restored the full pass — the known fresh-clone step).
- Standing checks FIRST: the S31 preflight GREEN; the mobile-drawer check
  GREEN; the live agent-browser 390×844 walkthrough GREEN (login → dashboard
  scrollWidth 390 → drawer 20 links in the documented order → the nav
  scrollable 1068 vs 755 at 844 height → navigate to Notes → the drawer
  closes on navigation → the active link "Notes" with the violet
  NAV_ACTIVE_GRADIENT_STOPS gradient on the inner span at the re-open —
  **the mobile navigation menu is working as expected**); **the LANDSCAPE
  geometry anchor RE-MEASURED at 844×390 in LIGHT** (the drawer nav
  scrollHeight 1068 vs clientHeight 301 → scrollable TRUE — identical to the
  S35/S40/S48 measurements, the empirical anchor for this session's seam
  contract, taken BEFORE the pins were finalized; the vehicle contract holds
  [sidebarVisible=false + hamburgerVisible=true]; the heading clearance
  verified at the short viewport [the Dashboard greeting top 80 ≥ the 64px
  bar; the Notes :visible h2 top 586 — the @top0 reading is the HIDDEN
  desktop h1, exactly why the probes filter :visible]); the reference
  re-swept **UNCHANGED since S19–S48** (login title "AcademiaFlow (Copy)",
  the email-prefix greeting "Good evening, sepnetflix2023 👋", the 20 nav
  views in the same order, the five Settings tabs: Appearance, Profile,
  Subjects, Holidays, Notifications); the copy sweep 14/20 MATCH (the 6
  data-state non-gaps). The arrival standing suite launched (32 rows, the
  in-flight 30-audit version).
- The coverage map re-verified against the standing scripts (grep-verified):
  the S13 data-volume audit runs 1280×800 light+violet (line 77); the
  S35/S40 landscape sweeps run 844×390 LIGHT at SEED volume (zero
  STRESS/countMany/createMany/deleteMany markers; S40's every PATCH carries
  themeMode "light"); the S42–S47 volume sweeps run W=1280/W=390/W=768 only;
  the S48 landscape volume sweep is DARK only (its mode precondition requires
  dark). **The light × landscape × volume cell is confirmed zero-coverage at
  every accent — the S49 scope.**
- TDD RED: **40 S49 pins** in tests/suite-verdict.test.ts (the s49Envelope
  generator at 844×390 LIGHT with the volume keys + the below-lg structural
  keys + the LIGHT detector keys [unreadable/lowcontrast — NO flashbulbs,
  the class exists only in dark] + the interaction keys + the per-accent
  drawer record; the GREEN shape with the swept counts + the MODE light
  note; the ALL-VIEWS + ALL-ACCENTS guards; the historical S13-shape
  envelope; the historical S42/S43 desktop + S44/S45 mobile + S46/S47
  mid-band + S48 dark-landscape envelopes fed here → the viewport
  shape-errors [the landscape seam owns 844×390 — the TRANSPOSED pair is a
  different device class]; the mode discriminator pin [the S48 DARK-landscape
  envelope fed here → NON-green via the mode rot — the dark shape is a
  SUPERSET of the light shape, its extra flashbulbs keys ride along, the
  shape checks require keys and never reject extras, so the mode guard is
  what discriminates]; the S45 light mobile envelope re-scoped to 844×390 →
  GREEN [the seams discriminate on the viewport, not the shape]; the
  missing-volume/missing-drawer/missing-mode shape-errors; the wrong-viewport
  family [1280×800 AND 390×844 AND 768×1024]; the mode-rot family
  [mode=dark → non-green]; the volume-rot family [tasks 0 / notes 199 /
  events 0 → each a non-green]; the applied-mismatch family; the LANDSCAPE
  vehicle-contract family; the drawer-nav-scroll family [the ~301px nav
  area at 390 height]; the tint-rot + interaction families; the overflow
  family [scrollWidth 854 > 844 → finding]; the structural below-lg family
  [drawerClosed=false + appBar=false + headingClearance=false → each a
  finding]; the S13 B3/B2 budget families with the boundary-exact 1500
  pins; the strict-record families [missing longTaskTotal/clickLatencyMs];
  the drawer-error family; the drawer link-census family [linkCount 19 →
  finding]; the independent-counting family; the THREE light exemptions
  each with a strictness negative [a non-white CTA-shaped text still counts;
  a slate-300 NON-day-number text still counts; a yellow-500 non-pill text
  still counts]; the WARN family; the S13 B1 API-bound family [512,000
  bytes → finding, the boundary 500,000 green]; the unknown-audit guard) →
  **22 failed / 467 passed** under the current seam (489 in the file; the
  audit name unknown to it; the shape-error pins pass vacuously through the
  unknown-audit path — documented; all 22 failures verified in the S49
  block). **ZERO pin corrections — the RED phase read clean on the first
  try.**
- TDD GREEN: the seam implementation `classifyAccentVolumeLightLandscapeSweep`
  (the AUDIT_NAMES entry + the dispatch arm + the classifier: the viewport
  guard [844×390 BOTH axes — the transposed pair is a different device
  class], the mode rot guard INVERTED [mode ≠ light → non-green — the dark
  half is the S48 audit's own: the mode is the discriminator on this very
  cell], the volume-EXACT guard [300/200/250], the ALL-ACCENTS + ALL-VIEWS
  guards, the LANDSCAPE vehicle contract [the below-lg family] + the
  drawer-own scroll contract at the landscape geometry [the ~301px nav area
  at 390 height], the per-accent applied self-verification, the drawer link
  census + the drawer-error class, the interaction classes in LIGHT at
  LANDSCAPE at volume [the tint rot + the active-state mismatch], the
  structural below-lg family at volume, the S16 overflow class at the
  landscape width, the S13 B2/B3 budgets with boundary-exact pins, the
  LIGHT detector family [NO flashbulbs; unreadable < 2.2 with the THREE
  signature-strict light exemptions; lowcontrast WARN], and the /api/tasks
  ≤ 500KB B1 bound) → **489/489 in the file; the full unit layer 773 (733 +
  40)**; lint ✓ tsc ✓.
- The probe scripts/accent-volume-light-landscape-sweep.mjs: the S47 light
  volume lifecycle + drawer vehicle verbatim (the COUNT-verified 300/200/250
  insert, the marker STRESS-S49-, the API stats, the MEASURE block, the
  pendingView pattern, the below-lg structural family, the finally-race fix
  from birth, the precondition fail() THROWS) + the S43/S45/S47 LIGHT
  checker verbatim (the light canvas fallback, NO flashbulbs) + the
  drawer-scoped LIGHT checker + the light-mode precondition through the REAL
  lifecycle with the greeting-heading hydration gate (the S43/S45/S47
  lesson: !html.dark is TRUE at first paint) + the per-accent gate with the
  shell-presence guard from birth (`data-accent === accent && !html.dark &&
  !!header` — the AP-90 lesson applied to the landscape vehicle) + the
  drawer-own nav-scroll contract re-measured per accent at the landscape
  geometry (scrollHeight ~1068 vs clientHeight ~301 at 390 height) + the
  exit-code computation with the THREE light exemptions. Syntax ✓
  (node --check).
- The runner: the 31st audit stage { accent-volume-light-landscape-sweep,
  timeoutMs: 25 min } directly after the S48 dark landscape sibling (the
  volume family: dark desktop, light desktop, dark mobile, light mobile,
  dark mid-band, light mid-band, dark landscape, then light landscape — the
  cross-axis COMPLETE) + the stage-count literals (0/31, ${i+1}/31 ×2,
  31/31) + the header comment (the suite now **33 rows**). Syntax ✓. The
  runner edits are PARKED as a patch during the arrival-suite re-run (see
  the process note below) and re-applied BEFORE the validation suite — the
  in-flight arrival run holds the 30-stage version loaded at launch (the
  documented pattern — the runner edits are invisible to it).
- PROCESS NOTE (the mid-run interruption, documented honestly): the FIRST
  arrival-suite launch (30-audit version) was accidentally killed at stage
  10/30 — a syntax-verification one-liner (`bun -e 'import(…)'`) on the
  just-edited runner EXECUTED the module, spawning a second concurrent
  suite instance against the shared dev server + DB; both instances were
  killed to protect the shared surfaces. The DB verified clean after the
  kill (theme light/violet via Prisma, zero stress markers), the runner
  temporarily reverted via `git diff | git checkout` (the S49 patch parked
  at /tmp/s49-runner.patch), and the arrival suite relaunched clean on the
  documented 30-audit baseline.
- The docs aligned (the AP-74 guard): AGENTS (the 773 line + the
  accent-volume-light-landscape-sweep command entry + the 31-audit suite
  entry), vitest.config.ts (773), CLAUDE (773 + the S49 seam note appended
  to the seam history), PAD §8.1 (the S49 classifier note + the per-file
  count 449 → 489 + Total 1064/773), README (the 1064 badge + the 773
  lines ×2 + the session-49 status row), SKILL (the 1064/773 counts ×2).
  The evidence capture script scripts/capture-s49-evidence.mjs (the S48
  pattern mirrored onto the light landscape half: the Tasks view at 300
  rows in LIGHT under TEAL at 844×390 with the drawer OPEN on the navigated
  Tasks view — the light checker with the THREE light exemptions verified
  in-frame + the landscape nav-scroll geometry; marker STRESS-S49-CAP-).
  Syntax ✓. `.env.example` audited (matches, tracked). The session_121
  narrative written during the suite run.

## Execution log (session 121 — the validation phase)

- THE ARRIVAL SUITE (the relaunched 30-audit version): **31/32 GREEN — the
  single failure the documented pre-spent-budget differential**: the
  security stage found the in-memory login-limiter window pre-spent — the
  accidentally-killed FIRST suite instance had already run the security
  stage against the same dev-server process (the remedy in the stage's own
  note: "restart the dev server (clears the in-memory limiter) … then
  re-run the suite as the window's ONLY consumer"). The differential was
  confirmed environmental, twice: (1) the dev server restarted by PID →
  the security audit standalone read findings: [] GREEN — but run exactly
  ONCE (a first diagnostic re-run trio spent the AI-limiter budget and
  read the C-family finding — the window's-ONLY-consumer doctrine
  re-learned on the spot); (2) the validation suite below ran the security
  stage on the fresh window (the S32 differential's dev-server restart) →
  GREEN inside the suite. ZERO code findings — the limiter code is
  correct; the failure class was the documented environmental differential.
- THE EXPLORATION (the genuine run 1, after the arrival suite completed):
  **EXIT 0, findings 0, ~3.0 min measured (3m3.081s — the same band as the
  S44–S48 halves; ~8.2× headroom under the 25-min budget)**. The envelope:
  49 renderings (7 accents × 7 views) + 7 drawer records under the
  COUNT-verified 300/200/250 profile; the interaction GREEN — activeLabel
  === the view on all 49 readings via the pendingView pattern, activeTint a
  linear-gradient on all 49 [**7 DISTINCT accent-correct
  NAV_ACTIVE_GRADIENT_STOPS pairs — the light × landscape × volume cell
  closed**]; the LANDSCAPE vehicle contract holds [sidebarVisible=false +
  hamburgerVisible=true + drawerNavScrollable=true — the nav scroll
  geometry confirmed at 390 height: scrollHeight 1068 vs clientHeight 301,
  links ~8–20 below the fold]; the volume budgets hold with huge headroom
  [max clickLatency 817ms vs the 1500ms budget over the drawer-close +
  view-mount path; max longTaskTotal 0ms]; the density real [Tasks 7,894
  mainNodes per accent — identical to all seven prior halves, deterministic];
  **zero non-exempt unreadable — 65 total, ALL exempt [23 CTA-face + 28
  calendar adjacent-day + 14 yellow-pill — the THREE signature-strict light
  exemptions, the identical counts to the S45 light mobile half and the S47
  light mid-band half: deterministic]; 3,284 lowcontrast WARN [the S11
  non-gap family — identical to the S47 half's count]**; the API stats:
  /api/tasks 112,960 bytes @ 515ms — the B1 bound holds [the byte counts
  identical to all prior halves — deterministic]; the drawer link census
  20/20 per accent; scrollWidth 844 max on every rendering; the cleanup
  deleted the 300/200/250 marker rows. **The genuine envelope classified
  GREEN at the new seam on the FIRST try** (via the temporary bun harness —
  deleted after, the S42–S48 convention; the note matched /49 view
  renderings/ + /844×390/ + /MODE light/ + /300\/200\/250/ + /23 CTA-face
  + 28 calendar-day + 14 yellow-pill/ + /3284 WARN/). The theme restored
  light/violet (the closing restore, verified in the run).
- THE VALIDATION SUITE (the S32 differential — dev server restarted by
  PID, preflight GREEN, the fresh clean window, the runner patch
  re-applied): the 33-row version launched (preflight + the 31 audits
  incl. the new accent-volume-light-landscape-sweep stage + the
  theme-restore closing guard).
- THE VALIDATION RESULT: **33/33 GREEN, exit 0** — the new
  accent-volume-light-landscape-sweep row GREEN inside the suite on its
  FIRST integration run (identical counts to the exploration —
  deterministic: 49 renderings, 49 active-tint readings, 7 drawer records,
  /api/tasks 112,960 bytes, 23 CTA-face + 28 calendar-day + 14 yellow-pill
  exempt, 3,284 WARN), the security stage green on the fresh window (the
  environmental differential's closing proof), every other stage green,
  the theme-restore closing guard light/violet. The evidence envelope
  extracted to
  `docs/screenshots/s49-accent-volume-light-landscape-sweep-evidence.json`
  (33 stage rows).
- THE GATES: lint ✓ tsc ✓ **773 unit** ✓ (20 files) build ✓ cold-db **291
  e2e ✓ (4.6 min)** = **1064 green** (was 1024; +40 unit pins; the 291
  prior pins untouched by construction — zero app code, zero CSS, zero
  Tailwind v4 surface, zero parity-pinned bytes). The cold-db convention
  applied (`rm -f db/e2e.db` before the run — the S46 lesson).
- THE EVIDENCE: the screenshot
  `docs/screenshots/s49-accent-volume-light-landscape-teal-tasks-844.png`
  via scripts/capture-s49-evidence.mjs — **verified in-frame** (the Tasks
  view at 300 rows in LIGHT under TEAL at 844×390 with the DRAWER OPEN on
  the navigated Tasks view: the teal NAV_ACTIVE_GRADIENT_STOPS gradient
  `rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1)` on the active link,
  linkCount 20, lightClass true, mainNodes 7,894, 964 stress-row surfaces,
  zero non-exempt unreadable [1 CTA-face exempt], scrollWidth 844, the nav
  geometry 1068 vs 301 scrollable, the click latency 1,159ms — all
  verified in-frame); the standing 31 refreshed via capture-studyflow.mjs
  (theme restored light); the theme verified via the DB: light/violet, and
  the DB verified free of stress markers.
- THE DOCS + THE RECORD: the worklog entry + the session_121 narrative +
  the session_122 summary + this plan's execution log + the session_123
  session log + the session_124 process log. The commit + the push via the
  SSH wrapper (`docs/ssh_git_wrapper_v3.py --remote
  git@github.com:nordeim/omni-study.git`, key verified + shredded).
