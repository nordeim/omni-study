# Remediation Plan — Session 48 (S48): the dark × landscape × volume family — the S13 volume profile (300/200/250) swept through the theme space's dark half at the LANDSCAPE viewport (844×390, the iPhone-class landscape — the 390–430px-tall band's canonical width, the LAST viewport band), navigated through the drawer, as a standing, executable guarantee

**Audit surfaces (this session, the session_115/116 workspace re-verified at `696c8e9`):** the
baseline gates re-confirm the documented **984-green** state on arrival (lint
✓ tsc ✓ **693 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓**), the S31 preflight GREEN before the checks, the drawer
check GREEN, the live agent-browser 390×844 walkthrough GREEN (**the mobile
navigation menu is working as expected** — the standing emphasis), the
reference re-swept **UNCHANGED since S19–S47**, the copy sweep 14/20 (the 6
data-state non-gaps), and the S47 one-command standing suite (**31 rows, the
29-audit version**) launched for the arrival check; its result is recorded in
the execution log below.

## The governing finding (this session's work)

**The dark × landscape × volume family is the documented bracketed non-gap — and
this session closes it** (the S47 summary's own named next candidate: "the
landscape × volume cells (844×390, both mode halves — the S45 summary's named
family, the last viewport band)" — the S42→S43 / S44→S45 / S46→S47 family
pattern: the dark half first, the light mirror is the S49 candidate).

The coverage map, verified against the standing scripts (grep-verified this
session):

- `scripts/data-volume-audit.mjs` (S13): the 300/200/250 profile, the
  payload/long-task/click-latency budgets — **1280×800, LIGHT + VIOLET only**
  (line 77: `viewport: { width: 1280, height: 800 }`; zero theme references) —
  the desktop, once, default theme only.
- `landscape-sweep` (S35) + `accent-landscape-sweep` (S40): the landscape
  viewport family at 844×390 — **SEED volume** (the `STRESS|countMany|
  createMany|deleteMany` grep returns ZERO hits in both) and **LIGHT only**
  (S35 violet; S40's every PATCH carries `themeMode: "light"` — the mode +
  volume axes are their blind spots).
- `accent-volume-sweep` (S42) + `accent-volume-light-sweep` (S43): 7 accents ×
  the 7 volume views — **1280×800 only** (`const W = 1280`).
- `accent-volume-dark-mobile-sweep` (S44) + `accent-volume-light-mobile-sweep`
  (S45): the mobile halves — **390×844 only** (`const W = 390`).
- `accent-volume-dark-midband-sweep` (S46) + `accent-volume-light-midband-sweep`
  (S47): the mid-band halves — **768×1024 only** (`const W = 768`).
- NO dark sweep runs at 844 at all (dark-sweep / accent-dark-sweep /
  dark-mobile-sweep grep-verified at other widths).

So the cross-axis cell **dark × landscape × accent × volume** is ZERO-coverage
at every accent: the densest renderings (the 300-row Tasks list, the 250-event
terminal panel, the 200-note list) had never been rendered in DARK at the
844×390 landscape layout under ANY accent at volume (S35 proved landscape
light+violet at seed; S40 accent × landscape at seed light; S42 dark × volume
at desktop 1280; S44 dark × volume at mobile 390; S46 dark × volume at
mid-band 768 — the 844 width in DARK at volume was never rendered by any
standing audit under any accent), the S13 volume budgets had never been
measured at the landscape viewport in DARK under a theme variation, AND the
DRAWER's active-link tint had never been read through the real navigation
lifecycle in DARK at LANDSCAPE at VOLUME. The S42/S44/S46 dark doctrine
govers: flashbulbs are ALWAYS findings (a light surface on the dark canvas);
unreadable < 2.2 with the CTA-face exemption ONLY (the light-mode calendar-day
+ yellow-pill exemptions do NOT apply in dark — those surfaces re-theme);
lowcontrast < 3.2 = WARN.

**The landscape geometry** (the short-viewport family, the S35/S40 doctrine):
at 390 height the 20 nav rows (scrollHeight ~1068) cannot fit the ~301px nav
area (the 390 viewport minus the ~89px brand header) — the nav MUST scroll;
links ~8–20 sit below the fold and the nav's scroll is the only path to them.
The fixed h-16 app bar covers 16% of the 390px viewport, so the
heading-clearance contract (the heading's box top ≥ the 64px bar) is at its
tightest here. The geometry anchor is re-measured empirically this session
BEFORE the pins are finalized (the S46/S47 protocol).

## Families and fixes

### S48-A (HIGH) — the seam `classifyAccentVolumeDarkLandscapeSweep` + the unit pins

The seam (inserted after the S47 classifier, before the cwv section), on the
S42/S44/S46 dark doctrine with the S35/S40 landscape vehicle:

- the **viewport guard** (844×390 BOTH axes — the 1280×800 desktop, 390×844
  mobile, and 768×1024 mid-band envelopes each read shape-error: the sibling
  families own those surfaces);
- the **mode rot guard** (mode MUST be dark — the light × landscape × volume
  family is the documented S49 mirror; an envelope with `mode=light` fed here
  reads NON-green, never a silent re-scope);
- the **volume-EXACT guard** (300/200/250 — a seed-volume envelope is its own
  rot class, the S38 retirement applied to the volume axis);
- the **ALL-ACCENTS + ALL-VIEWS guards** (the 7 accents; the 7 volume-affected
  views by DISPLAY labels — the S13 set; a missing key is a LOUD shape-error,
  never green-by-omission);
- the **LANDSCAPE vehicle contract** (the below-lg family: sidebarVisible MUST
  be false + hamburgerVisible MUST be true — the drawer is the only vehicle
  below 1024, the S35/S40 landscape contract at volume) + the **drawer-own
  nav-scroll contract** (drawerNavScrollable — the nav MUST scroll at 390
  height: the 20 nav rows measure scrollHeight ~1068 vs the ~301px nav area,
  so links ~8–20 sit below the fold and the nav's scroll is the only path to
  them — the S35/S40 geometry, re-verified empirically this session BEFORE
  the pins are written);
- the per-accent **applied self-verification** (applied === the accent key);
- the **drawer link census** (linkCount === 20) + the drawer-error class (an
  error string is a FINDING, never a swallow);
- the **interaction classes in DARK at LANDSCAPE at volume**: the tint rot
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
- the **DARK detector family** (the S42/S44/S46 doctrine): flashbulbs are
  ALWAYS findings; unreadable < 2.2 counted INDEPENDENTLY of the findings
  array with the **CTA-face exemption ONLY** (`rgb(255, 255, 255)`
  white-on-accent — the S11 family-2 non-gap; the light-mode calendar-day +
  yellow-pill exemptions do NOT apply in dark, those surfaces re-theme);
  lowcontrast < 3.2 = WARN (rides the note, never the findings);
- the **/api/tasks ≤ 500KB B1 bound** (the boundary 500,000 stays green).

The pin block (appended after the S47 describe block): ~38 pins — the s48
envelope generator (7 accents × 7 views + the drawer record per accent at
844×390 DARK under the volume profile, with the DARK record shape — the
flashbulbs/unreadable/lowcontrast keys, the activeLabel-defaults-filled
interaction contract), the GREEN shape with the swept counts (49 renderings /
49 active-tint readings / 7 drawer records / MODE dark + the CTA-face
exemption note), the ALL-VIEWS + ALL-ACCENTS guards, the historical
S13-shape envelope → shape-error, the historical S42/S43 desktop + S44/S45
mobile + S46/S47 mid-band envelopes fed here → the viewport shape-errors (the
landscape seam owns 844×390), the **historical S47 LIGHT-midband envelope fed
here → NON-green via the mode rot guard** (NOT a shape-error: the viewport
fails first at 768×1024 — use the S44 dark envelope re-scoped to 844×390 →
GREEN for the mode cross-check; the S44 envelope re-scoped is the
cross-check that the seam discriminates on the viewport, not the shape), the
missing-volume/missing-drawer/missing-mode shape-errors, the wrong-viewport
family (1280×800 AND 390×844 AND 768×1024 AND the W/H swap 390×844), the
mode-rot family (mode=light → non-green), the volume-rot family (tasks 0 /
notes 199 / events 0), the applied-mismatch family, the LANDSCAPE
vehicle-contract family, the drawer-nav-scroll family, the tint-rot +
interaction families, the overflow family (scrollWidth 854 → finding), the
structural below-lg family, the B3/B2 budget families with boundaries, the
strict-record families, the independent-counting family, the CTA-face
exemption with a strictness negative (a non-white CTA-face-shaped text still
counts) + the TWO dark-doctrine negatives (the slate-300 calendar day + the
yellow-500 pill do NOT exempt in dark), the WARN family, the drawer-error +
link-census families, the B1 bound with boundary, the unknown-audit guard.

### S48-B (HIGH) — the probe: `scripts/accent-volume-dark-landscape-sweep.mjs`

The S46/S47 probe verbatim (the volume lifecycle + the drawer vehicle + the
pendingView interaction pattern + the below-lg structural family + the S13
measurement family + the finally-race fix + the AP-85 trailing-write exit +
the precondition fail() THROWS), re-anchored to the landscape dark half:

- `W = 844; H = 390` (the S35/S40 landscape class — the short viewport),
  `MAX_WIDTH = 844`;
- the **DARK checker verbatim** (the S42/S44/S46 dark detector family:
  flashbulbs + unreadable + lowcontrast, the effective-background walk over
  main/aside/header/dialog with the dark canvas fallback `rgb(9, 9, 11)`, the
  `display:none` guard for the hidden desktop sidebar and the closed drawer);
- the **drawer-scoped DARK checker** (the S46 drawer checker re-anchored);
- the **dark-mode precondition through the REAL lifecycle** (PATCH
  themeMode=dark → goto → the dark class + the greeting heading — no
  first-paint race in dark, the S42/S46 note);
- the **per-accent gate with the shell-presence guard** (`data-accent ===
  accent && html.dark && !!document.querySelector("header")` — the AP-90
  lesson, on BOTH the initial gate and the per-accent gates from birth: the
  S47 field correction folded in);
- the **drawer-own nav-scroll contract re-measured per accent** (scrollHeight
  ~1068 vs clientHeight ~301 at 390 height — the S35/S40 landscape geometry,
  re-verified empirically);
- the marker `STRESS-S48-` (no collision with S13/S42–S47); the closing
  restore light/violet + the pre-exit cleanup (idempotent) + the catch-path
  restore;
- the exit-code computation with the CTA-face exemption ONLY (no flashbulb
  exemption — flashbulbs always fail).

### S48-C (MEDIUM) — the runner: the 30th stage

`scripts/standing-suite.mjs`: the STAGES entry
`{ name: "accent-volume-dark-landscape-sweep", file:
"scripts/accent-volume-dark-landscape-sweep.mjs", runtime: "node", timeoutMs:
25 * 60_000 }` directly after accent-volume-light-midband-sweep (the volume
family together: dark desktop, light desktop, dark mobile, light mobile, dark
mid-band, light mid-band, then dark landscape) + the stage-count literals
(`0/30`, `${i + 1}/30` ×2, `30/30`) + the header comment (the suite now
**32 rows**: preflight + 30 audits + theme-restore).

### S48-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the new unit-count line + the accent-volume-dark-landscape-sweep
command entry + the 30-audit suite entry), vitest.config.ts (the count
comment), CLAUDE.md (the count + the S48 seam note appended to the seam
history), PAD §8.1 (the classifier + the per-file count + the Total line),
README.md (the badge + the count lines ×2 + the session-48 status row),
omni-study_SKILL.md (the counts). `.env.example` audited (matches, tracked).

### S48-E (MEDIUM) — the evidence + the session record

`scripts/capture-s48-evidence.mjs` (the S47 pattern mirrored onto the dark
landscape half: the Tasks view at 300 rows in DARK under TEAL at 844×390 with
the drawer OPEN on the navigated Tasks view — the teal
NAV_ACTIVE_GRADIENT_STOPS gradient on the active link, linkCount 20, the
in-frame verification incl. the dark flashbulb/unreadable probes with the
CTA-face exemption + the landscape nav-scroll geometry) →
`docs/screenshots/s48-accent-volume-dark-landscape-teal-tasks-844.png`; the
evidence envelope `docs/screenshots/s48-accent-volume-dark-landscape-sweep-evidence.json`
(the validation suite's JSON envelope — 32 stage rows); the standing 32
refreshed via capture-studyflow.mjs (theme restored light/violet, verified
via the DB); the worklog entry + the session_117 narrative + the session_118
summary + this plan's execution log.

## Non-gaps (documented, do not fix)

- **The light × landscape × volume cell** — the documented S49 mirror (the
  S42→S43 / S44→S45 / S46→S47 / S48→S49 family pattern; needs the THREE light
  exemptions, the S43/S45/S47 doctrine).
- **The RUM-beacon second cross-axis** (RUM-beacon behavior under suite
  volume) — a future cross-axis candidate (the S44–S47 summaries' named
  family).
- **The 13 volume-invariant views** (Timetable, Assignments, Exams,
  Flashcards, Practice Tests, Study Groups, Grade Tracker, Files, Calculator,
  Math Solver, AI Assistant, Focus Timer, Settings) — they render no
  task/note/event rows; their coverage is the seed sweeps' own contract: the
  light × landscape × SEED × accent cell is the S40 accent-landscape-sweep's
  own (closed there); the DARK × landscape × SEED cell for the 13 invariant
  views remains a documented future candidate (the S46 plan's own note,
  carried to the landscape band).
- **The lowcontrast WARN family** — the S11 non-gap (2.2 ≤ contrast < 3.2) —
  WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed backpressure,
  filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3, Prisma's
  deepmerge-ts pin)** — the owner's standing open items (Docker unavailable
  in this sandbox; the patches land upstream).

## TDD order

1. The S48 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
2. `classifyAccentVolumeDarkLandscapeSweep` in `src/lib/suite-verdict.ts`
   (GREEN — the file, then the full unit layer 693 + ~38 = ~731).
3. `scripts/accent-volume-dark-landscape-sweep.mjs` (the exploration — the
   genuine run 1 against the dev server, AFTER the arrival suite completes:
   the volume lifecycle and the dev server are shared surfaces; the family
   validated clean BEFORE the runner integration).
4. The runner's 30th stage + the literals.
5. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
6. The gates re-run (lint, tsc, the new unit count, build, cold-db 291 e2e —
   `rm -f db/e2e.db` before EVERY full run, the S46 always-cold-db lesson).
7. The evidence + the docs + the commit + the push.

## Risks

- **The drawer open/close cost at volume at the landscape viewport in dark**:
  49 navigations × (drawer open + link click + drawer close + render settle +
  checker + measure) — the S44/S45 mobile halves measured ~2.9 min; the S46/S47
  mid-band halves ~3.0 min; the landscape half renders the same 300/200/250
  density over the SHORT canvas, so the same band is expected. Mitigation: the
  25-min stage budget (~8× headroom); the exploration measures the real
  duration BEFORE the runner integration (the S38-C lesson).
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server + the probe's
  chromium + the volume DOM — close every interactive browser session before
  the launch; the container ceiling is ~4 GB.
- **The dark lowcontrast WARN volume**: the S42 dark desktop half read ~30
  WARN; the S44 dark mobile half 32; the S46 dark mid-band half 32 — the same
  band expected and the WARN class never fails (the S11 non-gap family).
- **The pendingView interaction read at volume at the SHORT viewport**: the
  drawer open reads the active link while the previous view is active — at
  volume the re-open renders 20 links over a DOM carrying thousands of stress
  nodes; the read is scroll-independent (the active link stays in the DOM with
  computed styles — the S40 note).
- **The marker-row collision**: the standing suite's data-volume stage uses
  `STRESS-S13-`; S42–S47 use `STRESS-S42-`…`STRESS-S47-`; this probe uses
  `STRESS-S48-` — no collision. The pre-clean + the pre-exit cleanup make
  partial runs idempotent.
- **The RUM budget**: 49 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text 429
  filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The arrival-suite overlap**: the S48 exploration must NOT run while the
  standing suite holds the dev server + the shared DB (the data-volume stage
  inserts its own marker rows) — the TDD unit work runs during the suite;
  the exploration runs after it completes.

## Execution log (session 117 — filled as executed)

- ARRIVAL: the workspace pulled to `696c8e9` (the S47 feat push `11f059f` +
  the user's session_116 log update), the environment verified (.env per the
  contract with the S46/S47 dev posture `AUTH_SECRET=""`, `db/custom.db`
  seeded at the repo root, `bun install`, node_modules present, the
  Playwright chromium cache present). **The 984-green baseline gates
  re-confirmed at the S47 state**: lint ✓ tsc ✓ **693 unit ✓** (20 files)
  build ✓ cold-`db/e2e.db` **291 e2e ✓ (4.7 min)** = 984 green.
- Standing checks FIRST: the S31 preflight GREEN; the mobile-drawer check
  GREEN; the live agent-browser 390×844 walkthrough GREEN (login → dashboard
  scrollWidth 390 → drawer 20 links in the documented order → the nav
  scrollable 1068 vs 755 at 844 height → navigate to Notes → the drawer
  closes on navigation → the active link "Notes" with the violet
  NAV_ACTIVE_GRADIENT_STOPS gradient on the inner span at the re-open —
  **the mobile navigation menu is working as expected**); **the LANDSCAPE
  geometry anchor MEASURED at 844×390** (the drawer nav scrollHeight 1068
  vs clientHeight 301 → scrollable TRUE — identical to the S35/S40
  measurement, the empirical anchor for this session's seam contract, taken
  BEFORE the pins were finalized; the vehicle contract holds
  [sidebarVisible=false + hamburgerVisible=true]; the heading clearance
  verified at the short viewport [the Dashboard greeting top 80 ≥ the 64px
  bar; the Notes :visible h2 clears too — the @top0 reading is the HIDDEN
  desktop h1, exactly why the probes filter :visible]); the reference
  re-swept **UNCHANGED since S19–S47** (login title "AcademiaFlow (Copy)",
  the email-prefix greeting, the 20 nav views in the same order, the five
  Settings tabs); the copy sweep 14/20 MATCH (the 6 data-state non-gaps).
  The arrival standing suite launched (31 rows, the in-flight 29-audit
  version).
- The coverage map re-verified against the standing scripts (grep-verified):
  the S13 data-volume audit runs 1280×800 light+violet (line 77); the
  S35/S40 landscape sweeps run 844×390 LIGHT at SEED volume (zero
  STRESS/countMany/createMany/deleteMany markers; S40's every PATCH carries
  themeMode "light"); the S42–S47 volume sweeps run W=1280/W=390/W=768 only;
  NO dark sweep runs at 844 at all. **The dark × landscape × volume cell is
  confirmed zero-coverage at every accent — the S48 scope.**
- TDD RED: **40 S48 pins** in tests/suite-verdict.test.ts (the s48Envelope
  generator at 844×390 DARK with the volume keys + the below-lg structural
  keys + the DARK detector keys [flashbulbs/unreadable/lowcontrast] + the
  interaction keys + the per-accent drawer record; the GREEN shape with the
  swept counts + the MODE dark note; the ALL-VIEWS + ALL-ACCENTS guards;
  the historical S13-shape envelope; the historical S42/S43 desktop +
  S44/S45 mobile + S46/S47 mid-band envelopes fed here → the viewport
  shape-errors [the landscape seam owns 844×390 — the TRANSPOSED pair is a
  different device class]; the mode discriminator pin [the S44 dark envelope
  re-scoped to 844×390 with mode=light → NON-green via the mode rot; the
  S47 LIGHT-shaped envelope re-scoped → shape-error — the dark seam requires
  the flashbulbs keys the light family does not carry, the shape is the
  first guard]; the S44 dark envelope re-scoped to 844×390 → GREEN [the
  seams discriminate on the viewport, not the shape]; the
  missing-volume/missing-drawer/missing-mode shape-errors; the wrong-viewport
  family [1280×800 AND 390×844 AND 768×1024]; the mode-rot family
  [mode=light → non-green]; the volume-rot family [tasks 0 / notes 199 /
  events 0 → each a non-green]; the applied-mismatch family; the LANDSCAPE
  vehicle-contract family; the drawer-nav-scroll family [the ~301px nav
  area at 390 height]; the tint-rot + interaction families; the overflow
  family [scrollWidth 854 > 844 → finding]; the structural below-lg family
  [drawerClosed=false + appBar=false + headingClearance=false → each a
  finding]; the S13 B3/B2 budget families with the boundary-exact 1500
  pins; the strict-record families [missing longTaskTotal/clickLatencyMs];
  the flashbulb family [a light surface on the dark canvas is ALWAYS a
  finding]; the drawer-error family; the drawer link-census family
  [linkCount 19 → finding]; the independent-counting family; the CTA-face
  exemption with a strictness negative [a non-white CTA-shaped text still
  counts] + the TWO dark-doctrine negatives [the slate-300 calendar day +
  the yellow-500 pill do NOT exempt in dark]; the WARN family; the S13 B1
  API-bound family [512,000 bytes → finding, the boundary 500,000 green];
  the unknown-audit guard) → **22 failed / 427 passed** under the current
  seam (449 in the file; the audit name unknown to it; the shape-error pins
  pass vacuously through the unknown-audit path — documented; all 22
  failures verified in the S48 block).
- TDD GREEN: the seam implementation `classifyAccentVolumeDarkLandscapeSweep`
  (the AUDIT_NAMES entry + the dispatch arm + the classifier: the viewport
  guard [844×390 BOTH axes — the transposed pair is a different device
  class], the mode rot guard [mode ≠ dark → non-green — the light ×
  landscape × volume family is the documented S49 mirror], the volume-EXACT
  guard [300/200/250], the ALL-ACCENTS + ALL-VIEWS guards, the LANDSCAPE
  vehicle contract [the below-lg family] + the drawer-own scroll contract
  at the landscape geometry [the ~301px nav area at 390 height], the
  per-accent applied self-verification, the drawer link census + the
  drawer-error class, the interaction classes in DARK at LANDSCAPE at
  volume [the tint rot + the active-state mismatch], the structural below-lg
  family at volume, the S16 overflow class at the landscape width, the S13
  B2/B3 budgets with boundary-exact pins, the DARK detector family
  [flashbulbs always findings; the CTA-face exemption ONLY; lowcontrast
  WARN], and the /api/tasks ≤ 500KB B1 bound) → **449/449 in the file; the
  full unit layer 733 (693 + 40)**; lint ✓ tsc ✓. ONE RED-phase pin
  correction (the mode-discriminator pin): the S47 light envelope re-scoped
  reads SHAPE-ERROR here (its record shape carries NO flashbulbs keys — the
  light family's own doctrine; the dark seam requires them), so the pin
  re-anchored to the complete S44 dark shape with mode=light → NON-green
  via the mode rot (the S44→S45 mirror pattern), with the light-shape
  shape-error documented as its own assertion.
- The probe scripts/accent-volume-dark-landscape-sweep.mjs: the S46/S47
  volume lifecycle + drawer vehicle verbatim (the COUNT-verified 300/200/250
  insert, the marker STRESS-S48-, the API stats, the MEASURE block, the
  pendingView pattern, the below-lg structural family, the finally-race fix
  from birth, the precondition fail() THROWS) + the S42/S44/S46 DARK
  checker verbatim (the dark canvas fallback, the display:none guard) + the
  drawer-scoped DARK checker + the dark-mode precondition through the REAL
  lifecycle with the greeting-heading initial gate (the S47 field
  correction folded in) + the per-accent gate with the shell-presence guard
  from birth (`data-accent === accent && html.dark && !!header` — the AP-90
  lesson applied to the landscape vehicle) + the drawer-own nav-scroll
  contract re-measured per accent at the landscape geometry (scrollHeight
  ~1068 vs clientHeight ~301 at 390 height) + the exit-code computation
  with the CTA-face exemption ONLY. Syntax ✓ (node --check).
- The runner: the 30th audit stage { accent-volume-dark-landscape-sweep,
  timeoutMs: 25 min } directly after accent-volume-light-midband-sweep (the
  volume family: dark desktop, light desktop, dark mobile, light mobile,
  dark mid-band, light mid-band, then dark landscape) + the stage-count
  literals (0/30, ${i+1}/30 ×2, 30/30) + the header comment (the suite now
  **32 rows**). Syntax ✓. The in-flight arrival run holds the 29-stage
  version loaded at launch (the documented pattern — the runner edits are
  invisible to it).
- The docs aligned (the AP-74 guard): AGENTS (the 733 line + the
  accent-volume-dark-landscape-sweep command entry + the 30-audit suite
  entry), vitest.config.ts (733), CLAUDE (733 + the S48 seam note appended
  to the seam history), PAD §8.1 (the S48 classifier note + the per-file
  count 409 → 449 + Total 1024/733), README (the 1024 badge + the 733 lines
  ×2 + the session-48 status row), SKILL (the 1024/733 counts ×2). The
  evidence capture script scripts/capture-s48-evidence.mjs (the S47 pattern
  mirrored onto the dark landscape half: the Tasks view at 300 rows in DARK
  under TEAL at 844×390 with the drawer OPEN on the navigated Tasks view —
  the dark checker with the CTA-face exemption + the flashbulb probe + the
  landscape nav-scroll geometry verified in-frame; marker STRESS-S48-CAP-).
  Syntax ✓. `.env.example` audited (matches, tracked).
- THE ARRIVAL SUITE: **31/31 GREEN, exit 0** — every stage green (the
  S33–S47 surface: the mobile/midband/landscape/dark-mobile seed sweeps, the
  accent-light/midband/landscape/desktop sweeps, the dark family, all SIX
  volume halves S42–S47, the cwv/ai/pre15/dep stages, and the theme-restore
  closing guard light/violet). NO field corrections needed this session —
  the S42 initial-gate fix (the S47 field correction) held green inside the
  suite.
- THE EXPLORATION (the genuine run 1, after the arrival suite completed):
  **EXIT 0, findings 0, ~3.0 min measured (2m58.380s — the same band as the
  S44–S47 halves; ~8.5× headroom under the 25-min budget)**. The envelope:
  49 renderings (7 accents × 7 views) + 7 drawer records under the
  COUNT-verified 300/200/250 profile; the interaction GREEN — activeLabel
  === the view on all 49 readings via the pendingView pattern, activeTint a
  linear-gradient on all 49 [**7 DISTINCT accent-correct
  NAV_ACTIVE_GRADIENT_STOPS pairs — the dark × landscape × volume cell
  closed**]; the LANDSCAPE vehicle contract holds [sidebarVisible=false +
  hamburgerVisible=true + drawerNavScrollable=true — the nav scroll
  geometry confirmed at 390 height: scrollHeight 1068 vs clientHeight 301,
  links ~8–20 below the fold]; the volume budgets hold with huge headroom
  [max clickLatency 803ms vs the 1500ms budget over the drawer-close +
  view-mount path; max longTaskTotal 0ms]; the density real [Tasks 7,894
  mainNodes per accent — identical to all six prior halves, deterministic];
  **zero flashbulbs across all 49 + 7 drawer records [the dark doctrine at
  the landscape layout]; 2 CTA-face exempt [the S11 family-2 non-gap —
  identical to the S42/S44/S46 dark halves]; zero non-exempt unreadable;
  32 lowcontrast WARN [the S11 non-gap family — identical to the S44/S46
  dark counts]**; the API stats: /api/tasks 112,960 bytes @ 59ms — the B1
  bound holds [the byte counts identical to all prior halves —
  deterministic] — + /api/notes 77,410 @ 25ms + /api/events 79,952 @ 25ms;
  the drawer link census 20/20 per accent; scrollWidth 844 max on every
  rendering; the cleanup deleted the 300/200/250 marker rows. **The genuine
  envelope classified GREEN at the new seam on the FIRST try** (via the
  temporary bun harness — deleted after, the S42–S47 convention; the note
  matched /49 view renderings/ + /844×390/ + /MODE dark/ + /300\/200\/250/
  + /2 CTA-face/ + /32 WARN/). The theme restored light/violet (the closing
  restore, verified in the run).
- THE VALIDATION SUITE (the S32 differential — dev server restarted by
  PID, preflight GREEN, the fresh clean window, every interactive browser
  session closed first): the 32-row version launched (preflight + the 30
  audits incl. the new accent-volume-dark-landscape-sweep stage + the
  theme-restore closing guard) — result recorded below.
- THE VALIDATION RESULT: **32/32 GREEN, exit 0** — the new
  accent-volume-dark-landscape-sweep row GREEN inside the suite on its
  FIRST integration run (identical counts to the exploration —
  deterministic: 49 renderings, 49 active-tint readings, 7 distinct tints,
  Tasks 7,894 mainNodes, 112,960 bytes, 2 CTA-face exempt, 32 WARN), every
  other stage green, the theme-restore closing guard light/violet. The
  evidence envelope extracted to
  `docs/screenshots/s48-accent-volume-dark-landscape-sweep-evidence.json`
  (32 stage rows — the S43+ convention).
- THE GATES: lint ✓ tsc ✓ **733 unit** ✓ (20 files) build ✓ cold-db **291
  e2e ✓ (4.8 min)** = **1024 green** (was 984; +40 unit pins; the 291
  prior pins untouched by construction — zero app code, zero CSS, zero
  Tailwind v4 surface, zero parity-pinned bytes). The cold-db convention
  applied (`rm -f db/e2e.db` before the run — the S46 lesson).
- THE EVIDENCE: the screenshot
  `docs/screenshots/s48-accent-volume-dark-landscape-teal-tasks-844.png` via
  scripts/capture-s48-evidence.mjs — **verified in-frame** (the Tasks view
  at 300 rows in DARK under TEAL at 844×390 with the DRAWER OPEN on the
  navigated Tasks view: the teal NAV_ACTIVE_GRADIENT_STOPS gradient
  `rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1)` on the active link,
  linkCount 20, darkClass true, mainNodes 7,894, 964 stress-row surfaces,
  zero flashbulbs, zero non-exempt unreadable, scrollWidth 844, the nav
  geometry 1068 vs 301 scrollable, the click latency 1,205ms — all
  verified in-frame); the standing 31 refreshed via capture-studyflow.mjs
  (theme restored light); the theme verified via the DB: light/violet.
- THE DOCS + THE RECORD: the worklog entry + the session_117 narrative +
  the session_118 summary + this plan's execution log + the session_119
  process log. The commit + the push via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/omni-study.git`,
  key verified + shredded).
