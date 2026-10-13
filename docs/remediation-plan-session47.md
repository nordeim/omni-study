# Remediation Plan — Session 47 (S47): the light × mid-band × volume family — the S13 volume profile (300/200/250) swept through the theme space's light half at the MID-BAND viewport (768×1024, the md breakpoint — the switchiest width in the 391–1023px band), navigated through the drawer, as a standing, executable guarantee

**Audit surfaces (this session, the session_112/113 workspace re-run at `246f81a`):** the
baseline gates re-confirm the documented **946-green** state on arrival (lint
✓ tsc ✓ **655 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓**; the fresh sandbox needed the Playwright
chromium-headless-shell v1243 download — an environmental step, not a code
finding), the S31 preflight GREEN before the checks, the drawer check GREEN,
the live agent-browser 390×844 walkthrough GREEN (**the mobile navigation menu
is working as expected** — the standing emphasis), the reference re-swept
**UNCHANGED since S19–S46**, the copy sweep 14/20 (the 6 data-state non-gaps),
and the S46 one-command standing suite (**30 rows, the 28-audit version**)
launched for the arrival check; its result is recorded in the
execution log below.

## The governing finding (this session's work)

**The light × mid-band × volume family is the documented bracketed non-gap — and
this session closes it** (the S46 summary's own first named next candidate:
"the light × mid-band × volume cell (the S47 mirror — needs the THREE light
exemptions, the S43/S45 doctrine)" — the S42→S43 / S44→S45 / S46→S47 family
pattern: each dark half is followed by its light mirror).

The coverage map, verified against the standing scripts (grep-verified this
session):

- `scripts/data-volume-audit.mjs` (S13): the 300/200/250 profile, the
  payload/long-task/click-latency budgets — **1280×800, LIGHT + VIOLET only**
  (line 77: `viewport: { width: 1280, height: 800 }`; zero theme references) —
  the desktop, once, default theme only.
- `midband-sweep` (S34) + `accent-midband-sweep` (S39): the mid-band viewport
  family at 768×1024 — **SEED volume** (the `STRESS|countMany|createMany|
  deleteMany` grep returns ZERO hits in both) and **LIGHT only** (S34 violet;
  S39 every PATCH `themeMode: "light"`, lines 263/271 — the volume axis is
  their blind spot).
- `accent-volume-sweep` (S42) + `accent-volume-light-sweep` (S43): 7 accents ×
  the 7 volume views — **1280×800 only** (`const W = 1280` — the viewport axis
  is their blind spot).
- `accent-volume-dark-mobile-sweep` (S44) + `accent-volume-light-mobile-sweep`
  (S45): the mobile halves — **390×844 only** (`const W = 390`).
- `accent-volume-dark-midband-sweep` (S46): the mid-band viewport at volume —
  **DARK only** (its mode precondition reads `mode !== "dark"` → fail, line
  478 — the mode axis is its blind spot; its own seam's rot-guard comment
  names the light family as "the documented S47 mirror").

So the cross-axis cell **light × mid-band × accent × volume** is ZERO-coverage
at every accent: the densest renderings (the 300-row Tasks list, the 250-event
terminal panel, the 200-note list) had never been rendered in LIGHT at the
768×1024 stacked layout under ANY accent at volume (S34 proved mid-band
light+violet at seed; S39 accent × mid-band at seed light; S43 light × volume
at desktop 1280; S45 light × volume at mobile 390 — the 768 width in LIGHT at
volume was never rendered by any standing audit under any accent), the S13
volume budgets had never been measured at the mid-band viewport in LIGHT under
a theme variation, AND the DRAWER's active-link tint had never been read
through the real navigation lifecycle in LIGHT at MID-BAND at VOLUME (S34
proved mid-band light+violet at seed; S39 accent × mid-band at seed LIGHT; S43
light × volume at DESKTOP 1280; S45 light × volume at MOBILE 390). The S43/S45
light doctrine governns: NO flashbulb class (the flashbulb exists only in
dark — a light surface on the light canvas is by-design); unreadable < 2.2 with
the THREE signature-strict light exemptions (the CTA-face white-on-accent, the
calendar adjacent-month slate-300 day numbers, the yellow-500 priority-pill
vocabulary — the reference's own design in light); lowcontrast < 3.2 = WARN.

## Families and fixes

### S47-A (HIGH) — the seam `classifyAccentVolumeLightMidbandSweep` + the unit pins

The seam (inserted after the S46 classifier, before the cwv section), on the
S43/S45 light doctrine with the S34/S39/S46 mid-band vehicle:

- the **mode rot guard INVERTED** (mode MUST be light — the dark × mid-band ×
  volume family is the S46 audit's own contract; an envelope with `mode=dark`
  fed here reads NON-green, never a silent re-scope);
- the **viewport guard** (768×1024 BOTH axes — the 1280×800 desktop, 390×844
  mobile, and 844×390 landscape envelopes each read shape-error: the sibling
  families own those surfaces);
- the **volume-EXACT guard** (300/200/250 — a seed-volume envelope is its own
  rot class, the S38 retirement applied to the volume axis);
- the **ALL-ACCENTS + ALL-VIEWS guards** (the 7 accents; the 7 volume-affected
  views by DISPLAY labels — the S13 set; a missing key is a LOUD shape-error,
  never green-by-omission);
- the **MID-BAND vehicle contract** (the below-lg family: sidebarVisible MUST
  be false + hamburgerVisible MUST be true — the drawer is the only vehicle
  below 1024, the S34/S39/S46 mid-band contract at volume) + the **drawer-own
  nav-scroll contract** (drawerNavScrollable — the nav MUST scroll at 1024
  height: the 20 nav rows measure scrollHeight ~1068 vs the ~934px nav area
  [the 1024 viewport minus the ~90px brand header], so links ~17–20 sit below
  the fold and the nav's scroll is the only path to them — the S46 geometry,
  re-verified empirically this session BEFORE the pins are written);
- the per-accent **applied self-verification** (applied === the accent key);
- the **drawer link census** (linkCount === 20) + the drawer-error class (an
  error string is a FINDING, never a swallow);
- the **interaction classes in LIGHT at MID-BAND at volume**: the tint rot
  (activeTint none/empty — the S8 no-var class) + the active-state mismatch
  (activeLabel ≠ the view);
- the **structural below-lg family at volume** (drawerClosed / appBar /
  headingClearance — the S33/S35/S36 contracts; the fixed glass app bar with
  the 2-digit-hour clock renders below lg at 768 too, and the heading clears
  the 64px bar via the pt-20 offset);
- the **S16 overflow class** (scrollWidth > 768 — a 300-row list must never
  widen the 768px document);
- the **S13 B2/B3 volume budgets** with boundary-exact pins (longTaskTotal ≤
  1500ms; clickLatencyMs ≤ 1500ms over the drawer-close + view-mount path; the
  boundary value 1500 stays green on both);
- the **LIGHT detector family** (the S43/S45 doctrine): **NO flashbulb term**
  (the class exists only in dark — the light view record carries NO flashbulbs
  key at all); unreadable < 2.2 counted INDEPENDENTLY of the findings array
  with the **THREE signature-strict light exemptions** (the CTA-face
  `rgb(255, 255, 255)` white-on-accent — the S11 family-2 non-gap; the
  calendar adjacent-month day numbers `rgb(203, 213, 225)` slate-300 with 1–2
  digit text — the S6-G pin; the yellow priority-pill `rgb(234, 179, 8)`
  yellow-500 with high/medium/low text — the S6/S8 pin); lowcontrast < 3.2 =
  WARN (rides the note, never the findings);
- the **/api/tasks ≤ 500KB B1 bound** (the boundary 500,000 stays green).

The pin block (appended after the S46 describe block): ~37 pins — the s47
envelope generator (7 accents × 7 views + the drawer record per accent at
768×1024 LIGHT under the volume profile, with the LIGHT record shape — NO
flashbulbs key, the activeLabel-defaults-filled interaction contract), the
GREEN shape with the swept counts (49 renderings / 49 active-tint readings /
7 drawer records / MODE light + the THREE exemption counts), the ALL-VIEWS +
ALL-ACCENTS guards, the historical S13-shape envelope → shape-error, the
historical S42/S43 desktop envelopes → the viewport shape-errors, the
historical **S44/S45 mobile envelopes (390×844) → the viewport shape-errors**
(the mid-band seam owns 768×1024; the mobile pair own 390×844), the
**historical S46 DARK-MIDBAND envelope (768×1024, mode=dark) → NON-green via
the mode rot guard** (NOT a shape-error: the viewport passes; the MODE is the
discriminator on this very cell — the S44/S45 mirror pattern), the **S45 light
envelope re-scoped to 768×1024 → GREEN** (the same light family shape — the
cross-check that the seams discriminate on the viewport, not the shape), the
missing-volume/missing-drawer/missing-mode shape-errors, the wrong-viewport
family (1280×800 AND 390×844 AND 844×390), the mode-rot family (mode=dark →
non-green), the volume-rot family (tasks 0 / notes 199 / events 0), the
applied-mismatch family, the MID-BAND vehicle-contract family, the
drawer-nav-scroll family, the tint-rot + interaction families, the overflow
family (scrollWidth 778 → finding), the structural below-lg family, the B3/B2
budget families with boundaries, the strict-record families, the
independent-counting family, the THREE light exemptions with strictness
negatives (each exemption's signature is strict: a non-white CTA-face-shaped
text still counts; a slate-300 NON-day-number still counts; a yellow-500
non-pill text still counts), the WARN family, the drawer-error + link-census
families, the B1 bound with boundary, the unknown-audit guard.

### S47-B (HIGH) — the probe: `scripts/accent-volume-light-midband-sweep.mjs`

The S46 probe verbatim (the volume lifecycle + the drawer vehicle + the
pendingView interaction pattern + the below-lg structural family + the S13
measurement family + the finally-race fix + the AP-85 trailing-write exit +
the precondition fail() THROWS), re-anchored to the light half:

- `W = 768; H = 1024` (the S34/S39/S46 mid-band class — the md breakpoint),
  `MAX_WIDTH = 768`;
- the **LIGHT checker verbatim** (the S43/S45 light detector family: unreadable
  + lowcontrast, the effective-background walk over main/aside/header/dialog
  with the light canvas fallback `rgb(248, 250, 252)`, the `display:none`
  guard for the hidden desktop sidebar and the closed drawer — NO flashbulb
  collection: the class exists only in dark);
- the **drawer-scoped LIGHT checker** (the S45 drawer checker re-anchored);
- the **light-mode precondition through the REAL lifecycle with the S43/S45
  hydration gate** (PATCH themeMode=light → goto → the GREETING-HEADING gate —
  `main h1` renders only after the auth gate resolves the shell; `!html.dark`
  is TRUE at first paint and can never be the gate);
- the **per-accent gate with the shell-presence guard** (`data-accent ===
  accent && !html.dark && !!document.querySelector("header")` — the AP-90
  lesson: the app bar exists only after the auth gate mounts the shell);
- the **drawer-own nav-scroll contract re-measured per accent** (scrollHeight
  ~1068 vs clientHeight ~934 at 1024 height — the S46 mid-band geometry,
  re-verified empirically);
- the marker `STRESS-S47-` (no collision with S13/S42–S46); the closing
  restore light/violet + the pre-exit cleanup (idempotent) + the catch-path
  restore;
- the exit-code computation with the THREE light exemptions (the CTA-face +
  the calendar adjacent-day + the yellow priority-pill), NO flashbulb term.

### S47-C (MEDIUM) — the runner: the 29th stage

`scripts/standing-suite.mjs`: the STAGES entry
`{ name: "accent-volume-light-midband-sweep", file:
"scripts/accent-volume-light-midband-sweep.mjs", runtime: "node", timeoutMs:
25 * 60_000 }` directly after accent-volume-dark-midband-sweep (the volume
family together: dark desktop, light desktop, dark mobile, light mobile, dark
mid-band, then light mid-band) + the stage-count literals (`0/29`, `${i + 1}/29`
×2, `29/29`) + the header comment (the suite now **31 rows**: preflight + 29
audits + theme-restore).

### S47-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the new unit-count line + the accent-volume-light-midband-sweep
command entry + the 29-audit suite entry), vitest.config.ts (the count
comment), CLAUDE.md (the count + the S47 seam note appended to the seam
history), PAD §8.1 (the classifier + the per-file count + the Total line),
README.md (the badge + the count lines ×2 + the session-47 status row),
omni-study_SKILL.md (the counts). `.env.example` audited (matches, tracked).

### S47-E (MEDIUM) — the evidence + the session record

`scripts/capture-s47-evidence.mjs` (the S46 pattern mirrored: the Tasks view
at 300 rows in LIGHT under TEAL at 768×1024 with the drawer OPEN on the
navigated Tasks view — the teal NAV_ACTIVE_GRADIENT_STOPS gradient on the
active link, linkCount 20, the in-frame verification incl. the light
unreadable/lowcontrast probes with the THREE light exemptions) →
`docs/screenshots/s47-accent-volume-light-midband-teal-tasks-768.png`; the
evidence envelope `docs/screenshots/s47-accent-volume-light-midband-sweep-evidence.json`
(the validation suite's JSON envelope — 31 stage rows); the standing 31
refreshed via capture-studyflow.mjs (theme restored light/violet, verified
via the DB); the worklog entry + the session_114 narrative + the session_115
summary + this plan's execution log.

## Non-gaps (documented, do not fix)

- **The landscape × volume cells** (844×390 × light/dark) — future cross-axis
  candidates (the S45 summary's named family, the remaining half after the
  mid-band pair closes).
- **The RUM-beacon second cross-axis** (RUM-beacon behavior under suite
  volume) — a future cross-axis candidate (the S44/S45/S46 summaries' named
  family).
- **The 13 volume-invariant views** (Timetable, Assignments, Exams,
  Flashcards, Practice Tests, Study Groups, Grade Tracker, Files, Calculator,
  Math Solver, AI Assistant, Focus Timer, Settings) — they render no
  task/note/event rows; their coverage is the seed sweeps' own contract: the
  light × mid-band × SEED × accent cell is the S39 accent-midband-sweep's
  own (closed there); the DARK × mid-band × SEED cell for the 13 invariant
  views remains a documented future candidate (the S46 plan's own note).
- **The lowcontrast WARN family** — the S11 non-gap (2.2 ≤ contrast < 3.2) —
  WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed backpressure,
  filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3, Prisma's
  deepmerge-ts pin)** — the owner's standing open items (Docker unavailable
  in this sandbox; the patches land upstream).

## TDD order

1. The S47 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
2. `classifyAccentVolumeLightMidbandSweep` in `src/lib/suite-verdict.ts`
   (GREEN — the file, then the full unit layer 655 + ~37 = ~692).
3. `scripts/accent-volume-light-midband-sweep.mjs` (the exploration — the
   genuine run 1 against the dev server, AFTER the arrival suite completes:
   the volume lifecycle and the dev server are shared surfaces; the family
   validated clean BEFORE the runner integration).
4. The runner's 29th stage + the literals.
5. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
6. The gates re-run (lint, tsc, the new unit count, build, cold-db 291 e2e —
   `rm -f db/e2e.db` before EVERY full run, the S46 always-cold-db lesson).
7. The evidence + the docs + the commit + the push.

## Risks

- **The drawer open/close cost at volume at the mid-band viewport in light**:
  49 navigations × (drawer open + link click + drawer close + render settle +
  checker + measure) — the S44/S45 mobile halves measured ~2.9 min; the S46
  dark mid-band half measured ~3.0 min; the light mirror renders the same
  300/200/250 density over the same canvas, so the same band is expected.
  Mitigation: the 25-min stage budget (~8× headroom); the exploration measures
  the real duration BEFORE the runner integration (the S38-C lesson).
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server + the probe's
  chromium + the volume DOM — close every interactive browser session before
  the launch; the container ceiling is ~4 GB.
- **The light lowcontrast WARN volume**: the S45 light mobile half read 3,270
  WARN entries at the stacked layout; the S43 light desktop half read 3,404 —
  the mid-band light rendering sits in the same band and the WARN class never
  fails (the S11 non-gap family).
- **The pendingView interaction read at volume**: the drawer open reads the
  active link while the previous view is active — at volume the re-open
  renders 20 links over a DOM carrying thousands of stress nodes; the read is
  scroll-independent (the active link stays in the DOM with computed styles —
  the S40 note).
- **The marker-row collision**: the standing suite's data-volume stage uses
  `STRESS-S13-`; S42–S46 use `STRESS-S42-`…`STRESS-S46-`; this probe uses
  `STRESS-S47-` — no collision. The pre-clean + the pre-exit cleanup make
  partial runs idempotent.
- **The RUM budget**: 49 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text 429
  filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The arrival-suite overlap**: the S47 exploration must NOT run while the
  standing suite holds the dev server + the shared DB (the data-volume stage
  inserts its own marker rows) — the TDD unit work runs during the suite;
  the exploration runs after it completes.

## Execution log (session 114 — filled as executed)

- ARRIVAL: the fresh clone at `246f81a` (the S46 feat push `d9458c9` + the
  SKILL-count alignment `10c9081` + the user's session_113 log updates), the
  environment re-established (.env per the contract with the S46 dev posture
  `AUTH_SECRET=""`, `db/` seeded at the repo root, `bun install`, the
  Playwright chromium-headless-shell v1243 download). **The 984-target
  baseline gates re-confirmed at the S46 state**: lint ✓ tsc ✓ **655 unit ✓**
  (20 files) build ✓ cold-`db/e2e.db` **291 e2e ✓ (4.8 min)** = 946 green.
  Preflight GREEN; drawer check GREEN; the live agent-browser 390×844
  walkthrough GREEN (20 links in order, the nav scrollable 1068 vs 755 at
  844 height, the drawer closes on nav, the Notes active-link violet
  NAV_ACTIVE_GRADIENT_STOPS gradient on the inner span at the re-open —
  **the mobile navigation menu is working as expected**); the mid-band
  geometry anchor MEASURED at 768×1024 (nav scrollHeight 1068 vs
  clientHeight 935 → scrollable TRUE + sidebarVisible=false +
  hamburgerVisible=true — the empirical anchor for the seam's nav-scroll
  contract, taken BEFORE the pins were finalized; identical to the S46
  measurement); reference UNCHANGED since S19–S46 (login title "AcademiaFlow
  (Copy)", the email-prefix greeting, the 20 nav views in the same order,
  the five Settings tabs); copy sweep 14/20 MATCH (the 6 data-state
  non-gaps). The arrival standing suite launched (30 rows, the in-flight
  28-audit version — the S47 stage did not exist at launch, so no
  comment-out dance was needed).
- TDD RED: **38 S47 pins** in tests/suite-verdict.test.ts (the s47Envelope
  generator at 768×1024 LIGHT with the volume keys + the below-lg structural
  keys + the LIGHT detector keys [NO flashbulbs key — the S43/S45 doctrine]
  + the interaction keys + the per-accent drawer record; the GREEN shape
  with the swept counts + the MODE light note; the ALL-VIEWS + ALL-ACCENTS
  guards; the historical S13-shape envelope; the historical S42/S43 desktop
  envelopes fed here → the viewport shape-errors; the historical S44/S45
  mobile envelopes fed here → the viewport shape-errors [the mid-band seam
  owns 768×1024; the mobile pair own 390×844]; the historical S46 DARK
  MIDBAND envelope fed here → NON-green via the MODE rot guard [the viewport
  passes; the mode is the discriminator on this very cell — the S44→S45
  mirror pattern]; the S45 light envelope re-scoped to 768×1024 → GREEN
  [the seams discriminate on the viewport, not the shape]; the
  missing-volume/missing-drawer/missing-mode shape-errors; the
  wrong-viewport family [1280×800 AND 390×844 AND 844×390]; the mode-rot
  family [mode=dark → non-green]; the volume-rot family [tasks 0 / notes
  199 / events 0 → each a non-green]; the applied-mismatch family; the
  MID-BAND vehicle-contract family; the drawer-nav-scroll family; the
  tint-rot + interaction families; the overflow family [scrollWidth 778 >
  768 → finding]; the structural below-lg family [drawerClosed=false +
  appBar=false + headingClearance=false → each a finding]; the S13 B3/B2
  budget families with the boundary-exact 1500 pins; the strict-record
  families [missing longTaskTotal/clickLatencyMs]; the LIGHT-shape
  no-flashbulbs pin [the S46 dark envelope with mode=light reads GREEN —
  the extra dark-only flashbulbs keys ride along]; the drawer-error family;
  the drawer link-census family [linkCount 19 → finding]; the
  independent-counting family; the THREE light exemptions each with a
  strictness negative [a non-white CTA-shaped text, a slate-300
  non-day-number, a yellow-500 non-pill text each still count]; the WARN
  family; the S13 B1 API-bound family [512,000 bytes → finding, the
  boundary 500,000 green]; the unknown-audit guard) → **22 failed / 387
  passed** under the current seam (409 in the file; the audit name unknown
  to it; the 16 shape-error pins passed vacuously through the unknown-audit
  path — documented; all 22 failures verified in the S47 block).
- TDD GREEN: the seam implementation `classifyAccentVolumeLightMidbandSweep`
  (the AUDIT_NAMES entry + the dispatch arm + the classifier: the viewport
  guard [768×1024 BOTH axes], the mode rot guard INVERTED [mode ≠ light →
  non-green — the dark × mid-band × volume family is the S46 audit's
  contract, the mode is the discriminator on this very cell], the
  volume-EXACT guard [300/200/250], the ALL-ACCENTS + ALL-VIEWS guards, the
  MID-BAND vehicle contract [the below-lg family] + the drawer-own scroll
  contract at the mid-band geometry, the per-accent applied
  self-verification, the drawer link census + the drawer-error class, the
  interaction classes in LIGHT at MID-BAND at volume [the tint rot + the
  active-state mismatch], the structural below-lg family at volume, the S16
  overflow class at the mid-band width, the S13 B2/B3 budgets with
  boundary-exact pins, the LIGHT detector family [NO flashbulb term — the
  class exists only in dark; the THREE signature-strict light exemptions;
  lowcontrast WARN], and the /api/tasks ≤ 500KB B1 bound) → **409/409 in
  the file; the full unit layer 693 (655 + 38)**; lint ✓ tsc ✓.
- The probe scripts/accent-volume-light-midband-sweep.mjs: the S46 volume
  lifecycle + drawer vehicle verbatim (the COUNT-verified 300/200/250
  insert, the marker STRESS-S47-, the API stats, the MEASURE block, the
  pendingView pattern, the below-lg structural family, the finally-race fix
  from birth, the precondition fail() THROWS) + the S43/S45 LIGHT checker
  verbatim (unreadable + lowcontrast, the light canvas fallback
  rgb(248, 250, 252), NO flashbulb collection) + the drawer-scoped LIGHT
  checker + the light-mode precondition through the REAL lifecycle with the
  S43/S45 hydration gate (the greeting heading — `!html.dark` is TRUE at
  first paint) + the per-accent gate with the shell-presence guard folded
  in (`data-accent === accent && !html.dark && !!header` — the AP-90
  lesson applied to the mid-band vehicle) + the drawer-own nav-scroll
  contract re-measured per accent at the mid-band geometry (scrollHeight
  ~1068 vs clientHeight ~935 at 1024 height) + the exit-code computation
  with the THREE light exemptions (no flashbulb term). Syntax ✓
  (node --check).
- The runner: the 29th audit stage { accent-volume-light-midband-sweep,
  timeoutMs: 25 min } directly after accent-volume-dark-midband-sweep (the
  volume family: dark desktop, light desktop, dark mobile, light mobile,
  dark mid-band, then light mid-band) + the stage-count literals (0/29,
  ${i+1}/29 ×2, 29/29) + the header comment (the suite now **31 rows**).
  Syntax ✓. The in-flight arrival run holds the 28-stage version loaded at
  launch (the documented pattern — the runner edits are invisible to it).
- The docs aligned (the AP-74 guard): AGENTS (the 693 line + the
  accent-volume-light-midband-sweep command entry + the 29-audit suite
  entry), vitest.config.ts (693), CLAUDE (693 + the S47 seam note appended
  to the seam history), PAD §8.1 (the S47 classifier note + the per-file
  count 371 → 409 + Total 984/693), README (the 984 badge + the 693 lines
  ×2 + the session-47 status row), SKILL (the 984/693 counts ×2). The
  evidence capture script scripts/capture-s47-evidence.mjs (the S46 pattern
  mirrored onto the light half: the Tasks view at 300 rows in LIGHT under
  TEAL at 768×1024 with the drawer OPEN on the navigated Tasks view — the
  light checker with the THREE exemptions + the mid-band nav-scroll
  geometry verified in-frame; marker STRESS-S47-CAP-). Syntax ✓.
  `.env.example` audited (matches, tracked).
- THE ARRIVAL SUITE: **29/30 GREEN, exit 1 — ONE transient stage failure,
  root-caused and fixed this session** (a genuine field correction, the
  AP-90 family): the S42 accent-volume-sweep stage fired its precondition
  ("the INVERTED chrome contract broke at 1280 — sidebarVisible=false")
  inside the suite run — the S42 probe's INITIAL chrome gate waited only on
  `html.dark`, which the theme lifecycle's applyToDocument can satisfy when
  /api/auth/me resolves while React has not yet COMMITTED the shell DOM, so
  the chrome read raced the aside mount (observed ONCE, after the 17-min
  accent-dark stage had heated the server; green standalone — zero app
  bytes changed since the S46 30/30, the race not a regression). The fix:
  the shell-presence guard folded into the INITIAL gate's wait
  (`html.dark && !!document.querySelector("aside nav")` — the S43
  per-accent-gate correction, applied to the initial gate; the S43
  light-desktop sibling is already safe via its greeting-heading gate).
  Verified standalone post-fix: **exit 0, findings 0**, the envelope
  identical (sidebarVisible=true + hamburgerVisible=false +
  sidebarNavScrollable=true). Every other stage green.
- THE EXPLORATION (the genuine run 1, after the arrival suite completed):
  **EXIT 0, findings 0, ~3.0 min measured** (2m58.155s — the same band as
  the S44/S45 mobile halves' ~2.9 min and the S46 dark mid-band half's
  ~3.0 min; ~8.5× headroom under the 25-min budget). The envelope: 49
  renderings (7 accents × 7 views) + 7 drawer records under the
  COUNT-verified 300/200/250 profile; the interaction GREEN — activeLabel
  === the view on all 49 readings via the pendingView pattern, activeTint
  a linear-gradient on all 49 [**7 DISTINCT accent-correct
  NAV_ACTIVE_GRADIENT_STOPS pairs — the light × mid-band × volume cell
  closed**]; the MID-BAND vehicle contract holds [sidebarVisible=false +
  hamburgerVisible=true + drawerNavScrollable=true — the nav scroll
  geometry confirmed at 1024 height: scrollHeight 1068 vs clientHeight
  ~935, links ~17–20 below the fold]; the volume budgets hold with huge
  headroom [max clickLatency 719ms vs the 1500ms budget over the
  drawer-close + view-mount path; max longTaskTotal 0ms]; the density real
  [Tasks 7,894 mainNodes per accent — identical to all five prior halves,
  deterministic]; **zero non-exempt unreadable — 65 total, ALL exempt [23
  CTA-face + 28 calendar adjacent-day + 14 yellow-pill — the THREE
  signature-strict light exemptions, the identical counts to the S45 light
  mobile half: deterministic]**; 3,284 lowcontrast WARN [the S11 non-gap
  family — the S45 light mobile half read 3,270: the same band]; the API
  stats: /api/tasks 112,960 bytes @ 416ms — the B1 bound holds [the byte
  count identical to all prior halves — deterministic]; the drawer link
  census 20/20 per accent; scrollWidth 768 on every rendering [no
  overflow]; the structural family holds [drawerClosed + appBar +
  headingClearance all true]; the cleanup deleted the 300/200/250 marker
  rows. **The genuine envelope classified GREEN at the new seam on the
  FIRST try** (via the temporary bun harness — deleted after, the S42–S46
  convention; the note matched /49 view renderings/ + /768×1024/ + /MODE
  light/ + /300\/200\/250/ + /23 CTA-face/ + /28 calendar-day/ + /14
  yellow-pill/). The theme restored light/violet (verified via the DB
  directly as well).
- THE VALIDATION SUITE (the S32 differential — dev server restarted by
  PID, preflight GREEN, the fresh clean window): the 31-row version
  launched (preflight + the 29 audits incl. the new
  accent-volume-light-midband-sweep stage + the theme-restore closing
  guard) — result recorded below.
- THE VALIDATION RESULT: **31/31 GREEN, exit 0** — the new
  accent-volume-light-midband-sweep row GREEN inside the suite on its
  FIRST integration run (identical counts to the exploration —
  deterministic: 49 renderings, 49 active-tint readings, 7 distinct tints,
  Tasks 7,894 mainNodes, 112,960 bytes, 23/28/14 exempt), the FIXED S42
  stage green (the initial-gate correction validated inside the suite),
  every other stage green, the theme-restore closing guard light/violet.
  The evidence envelope extracted to
  `docs/screenshots/s47-accent-volume-light-midband-sweep-evidence.json`
  (31 stage rows — the S43+ convention).
- THE GATES: lint ✓ tsc ✓ **693 unit** ✓ (20 files) build ✓ cold-db **291
  e2e ✓ (4.4 min)** = **984 green** (was 946; +38 unit pins; the 291 prior
  pins untouched by construction — zero app code, zero CSS, zero Tailwind
  v4 surface, zero parity-pinned bytes). The cold-db convention applied
  (`rm -f db/e2e.db` before the run — the S46 lesson).
- THE EVIDENCE: the screenshot
  `docs/screenshots/s47-accent-volume-light-midband-teal-tasks-768.png` via
  scripts/capture-s47-evidence.mjs — **verified in-frame** (the Tasks view
  at 300 rows in LIGHT under TEAL at 768×1024 with the DRAWER OPEN on the
  navigated Tasks view: the teal NAV_ACTIVE_GRADIENT_STOPS gradient
  `rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1)` on the active link,
  linkCount 20, lightClass true, mainNodes 7,894, 964 stress-row surfaces,
  zero non-exempt unreadable, 1 CTA-face exempt, scrollWidth 768, the nav
  geometry 1068 vs 935 scrollable, the click latency 1,126ms — all
  verified in-frame); the standing 31 refreshed via capture-studyflow.mjs
  (theme restored light); the theme verified via the DB: light/violet.
