# Remediation Plan — Session 46 (S46): the dark × mid-band × volume family — the S13 volume profile (300/200/250) swept through the theme space's dark half at the MID-BAND viewport (768×1024, the md breakpoint — the switchiest width in the 391–1023px band), navigated through the drawer, as a standing, executable guarantee

**Audit surfaces (this session, the session_109/110 workspace re-run at `1ca3d7a`):** the
baseline gates re-confirmed the documented **909-green** state on arrival (lint
✓ tsc ✓ **618 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓**; the fresh sandbox needed the Playwright
chromium-headless-shell v1243 download — an environmental step, not a code
finding), the S31 preflight ran GREEN before the checks, the drawer check GREEN,
the live agent-browser 390×844 walkthrough GREEN (**the mobile navigation menu
is working as expected** — the standing emphasis), the reference re-swept
**UNCHANGED since S19–S45**, the copy sweep 14/20 (the 6 data-state non-gaps),
and the S45 one-command standing suite (**29 rows, the 27-audit version**)
launched in the background for the arrival check; its result is recorded in the
execution log below.

## The governing finding (this session's work)

**The dark × mid-band × volume family is the documented bracketed non-gap — and
this session closes it** (the S45 summary's own first named next candidate:
"the mid-band/landscape × volume cells (768×1024 / 844×390, both mode halves
each)" — this session takes the mid-band × DARK half, the S42→S43 / S44→S45
family pattern: the dark half first).

The coverage map, verified against the standing scripts (grep-verified this
session):

- `scripts/data-volume-audit.mjs` (S13): the 300/200/250 profile, the
  payload/long-task/click-latency budgets — **1280×800, LIGHT + VIOLET only**
  (line 77: `viewport: { width: 1280, height: 800 }`; zero theme references) —
  the desktop, once, default theme only.
- `midband-sweep` (S34) + `accent-midband-sweep` (S39): the mid-band viewport
  family at 768×1024 — **SEED volume** (the `STRESS|countMany|createMany|
  deleteMany` grep returns ZERO hits) and **LIGHT only** (S34 violet, S39 every
  PATCH `themeMode: "light"` — the mode axis is their blind spot).
- `accent-volume-sweep` (S42) + `accent-volume-light-sweep` (S43): 7 accents ×
  the 7 volume views — **1280×800 only** (`const W = 1280` — the viewport axis
  is their blind spot).
- `accent-volume-dark-mobile-sweep` (S44) + `accent-volume-light-mobile-sweep`
  (S45): the mobile halves — **390×844 only** (`const W = 390`), dark then
  light.
- **NO dark sweep runs at 768** — `dark-sweep`/`accent-dark-sweep`/
  `dark-mobile-sweep` all run at other widths (grep for `width: 768` across
  the three: zero hits).

So the cross-axis cell **dark × mid-band × accent × volume** is ZERO-coverage
at every accent: the densest renderings (the 300-row Tasks list, the 250-event
terminal panel, the 200-note list) had never been rendered in DARK at the
768×1024 stacked layout under ANY accent (S36 proved dark × 390 at seed; S38
dark × 1280+390 at seed; S44 dark × 390 at volume — the 768 width in DARK was
never rendered by any standing audit at any volume), the S13 volume budgets
had never been measured at the mid-band viewport in DARK under a theme
variation, AND the DRAWER's active-link tint had never been read through the
real navigation lifecycle in DARK at MID-BAND at VOLUME (S34 proved mid-band
light+violet at seed; S39 accent × mid-band at seed LIGHT; S42 dark × volume
at DESKTOP 1280; S44 dark × volume at MOBILE 390). The S42/S44 dark doctrine
governs: flashbulbs ALWAYS findings; unreadable < 2.2 with the CTA-face
exemption ONLY (the light-mode calendar-day + yellow-pill exemptions do NOT
apply in dark — those surfaces re-theme); lowcontrast < 3.2 = WARN.

## Families and fixes

### S46-A (HIGH) — the seam `classifyAccentVolumeDarkMidbandSweep` + the unit pins

The seam (inserted after the S45 classifier, before the cwv section), on the
S44/S45 doctrine with the S34/S39 mid-band vehicle:

- the **mode rot guard** (mode MUST be dark — the light × mid-band × volume
  family is the documented future cross-axis candidate, the S47 mirror; an
  envelope with `mode=light` fed here reads NON-green, never a silent
  re-scope);
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
  below 1024, the S34/S39 mid-band contract at volume) + the **drawer-own
  nav-scroll contract** (drawerNavScrollable — the nav MUST scroll at 1024
  height: the 20 nav rows measure scrollHeight ~1068 vs the ~934px nav area
  [the 1024 viewport minus the ~90px brand header], so links ~17–20 sit below
  the fold and the nav's scroll is the only path to them — the S44/S45 mobile
  contract carried to the mid-band geometry, empirically verified this session
  BEFORE the pins were written);
- the per-accent **applied self-verification** (applied === the accent key);
- the **drawer link census** (linkCount === 20) + the drawer-error class (an
  error string is a FINDING, never a swallow);
- the **interaction classes in DARK at MID-BAND at volume**: the tint rot
  (activeTint none/empty — the S8 no-var class) + the active-state mismatch
  (activeLabel ≠ the view);
- the **structural mobile family at volume** (drawerClosed / appBar /
  headingClearance — the S33/S35/S36 contracts; the fixed glass app bar with
  the 2-digit-hour clock renders below lg at 768 too, and the heading clears
  the 64px bar via the pt-20 offset);
- the **S16 overflow class** (scrollWidth > 768 — a 300-row list must never
  widen the 768px document);
- the **S13 B2/B3 volume budgets** with boundary-exact pins (longTaskTotal ≤
  1500ms; clickLatencyMs ≤ 1500ms over the drawer-close + view-mount path; the
  boundary value 1500 stays green on both);
- the **DARK detector family** (the S42/S44 doctrine): flashbulbs ALWAYS
  findings (a light surface on the dark canvas); unreadable < 2.2 counted
  INDEPENDENTLY of the findings array with the **CTA-face exemption ONLY**
  (`rgb(255, 255, 255)` white-on-accent — the S11 family-2 non-gap; the
  light-mode calendar-day slate-300 + yellow-pill yellow-500 exemptions do
  NOT apply in dark — those surfaces re-theme); lowcontrast < 3.2 = WARN
  (rides the note, never the findings);
- the **/api/tasks ≤ 500KB B1 bound** (the boundary 500,000 stays green).

The pin block (appended after the S45 describe block): ~35 pins — the s46
envelope generator (7 accents × 7 views + the drawer record per accent at
768×1024 dark under the volume profile, WITH the dark flashbulbs family, the
activeLabel-defaults-filled interaction contract), the GREEN shape with the
swept counts (49 renderings / 49 active-tint readings / 7 drawer records /
MODE dark), the ALL-VIEWS + ALL-ACCENTS guards, the historical S13-shape
envelope → shape-error, the historical S42/S43 desktop envelopes → the
viewport shape-errors, the historical **S44/S45 mobile envelopes (390×844) →
the viewport shape-errors** (the mid-band seam owns 768×1024; the mobile pair
own 390×844), the **S44 dark envelope re-scoped to 768×1024 → GREEN** (the
same dark family shape — the cross-check that the seams discriminate on the
viewport, not the shape), the missing-volume/missing-drawer/missing-mode
shape-errors, the wrong-viewport family (1280×800 AND 390×844 AND 844×390),
the mode-rot family (mode=light → non-green), the volume-rot family (tasks 0 /
notes 199 / events 0), the applied-mismatch family, the MID-BAND
vehicle-contract family, the drawer-nav-scroll family, the tint-rot +
interaction families, the overflow family (scrollWidth 778 → finding), the
structural mobile family, the B3/B2 budget families with boundaries, the
strict-record families, the independent-counting family, the CTA-face
exemption with a strictness negative (a non-white unreadable still counts) +
the two dark-doctrine negatives (the slate-300 calendar day and the yellow-500
pill do NOT exempt in dark), the WARN family, the drawer-error + link-census
families, the B1 bound with boundary, the unknown-audit guard.

### S46-B (HIGH) — the probe: `scripts/accent-volume-dark-midband-sweep.mjs`

The S44 probe verbatim (the volume lifecycle + the drawer vehicle + the
pendingView interaction pattern + the mobile structural family + the S13
measurement family + the finally-race fix + the AP-85 trailing-write exit +
the precondition fail() THROWS), re-anchored to the mid-band:

- `W = 768; H = 1024` (the S34/S39 mid-band class — the md breakpoint, the
  switchiest width in the 391–1023px band), `MAX_WIDTH = 768`;
- the **dark checker verbatim** (the S42/S44 dark detector family: flashbulbs
  + unreadable + lowcontrast, the effective-background walk over
  main/aside/header/dialog, the `display:none` guard for the hidden desktop
  sidebar and the closed drawer);
- the **drawer-scoped dark checker** (the S44 DRAWER_CHECKER verbatim);
- the **dark-mode precondition through the REAL lifecycle** (PATCH
  themeMode=dark → goto → the dark-class + main-h1 gate — the S42/S44 note:
  no first-paint race in dark);
- the **per-accent gate with the shell-presence guard** (`data-accent ===
  accent && html.dark && !!document.querySelector("header")` — the AP-90
  lesson: the app bar exists only after the auth gate mounts the shell);
- the **drawer-own nav-scroll contract re-measured per accent** (scrollHeight
  ~1068 vs clientHeight ~934 at 1024 height — the mid-band geometry, verified
  empirically before the pins);
- the marker `STRESS-S46-` (no collision with S13/S42/S43/S44/S45); the
  closing restore light/violet + the pre-exit cleanup (idempotent) + the
  catch-path restore.

### S46-C (MEDIUM) — the runner: the 28th stage

`scripts/standing-suite.mjs`: the STAGES entry
`{ name: "accent-volume-dark-midband-sweep", file:
"scripts/accent-volume-dark-midband-sweep.mjs", runtime: "node", timeoutMs:
25 * 60_000 }` directly after accent-volume-light-mobile-sweep (the volume
family together: dark desktop, light desktop, dark mobile, light mobile, then
dark mid-band) + the stage-count literals (`0/28`, `${i + 1}/28` ×2, `28/28`)
+ the header comment (the suite now **30 rows**: preflight + 28 audits +
theme-restore).

### S46-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the new unit-count line + the accent-volume-dark-midband-sweep
command entry + the 28-audit suite entry), vitest.config.ts (the count
comment), CLAUDE.md (the count + the S46 seam note appended to the seam
history), PAD §8.1 (the classifier + the per-file count + the Total line),
README.md (the badge + the count lines ×2 + the session-46 status row),
omni-study_SKILL.md (the counts). `.env.example` audited (matches, tracked).

### S46-E (MEDIUM) — the evidence + the session record

`scripts/capture-s46-evidence.mjs` (the S45 pattern mirrored: the Tasks view
at 300 rows in DARK under TEAL at 768×1024 with the drawer OPEN on the
navigated Tasks view — the teal NAV_ACTIVE_GRADIENT_STOPS gradient on the
active link, linkCount 20, the in-frame verification incl. the dark
flashbulb/unreadable probes with the CTA-face-only exemption) →
`docs/screenshots/s46-accent-volume-dark-midband-teal-tasks-768.png`; the
evidence envelope `docs/screenshots/s46-accent-volume-dark-midband-sweep-evidence.json`
(the validation suite's JSON envelope — 30 stage rows); the standing 31
refreshed via capture-studyflow.mjs (theme restored light/violet, verified
via the DB); the worklog entry + the session_111 narrative + the session_112
summary + this plan's execution log.

## Non-gaps (documented, do not fix)

- **The light × mid-band × volume cell** — the S47 mirror (the same 768×1024
  cell in light mode; needs the THREE light exemptions, the S43/S45 doctrine).
- **The landscape × volume cells** (844×390 × light/dark) — future cross-axis
  candidates (the S45 summary's named family, the second half).
- **The RUM-beacon second cross-axis** (RUM-beacon behavior under suite
  volume) — a future cross-axis candidate (the S44/S45 summary's named
  family).
- **The 13 volume-invariant views** (Timetable, Assignments, Exams,
  Flashcards, Practice Tests, Study Groups, Grade Tracker, Files, Calculator,
  Math Solver, AI Assistant, Focus Timer, Settings) — they render no
  task/note/event rows; their mid-band coverage is the S34/S39 seed-volume
  sweeps' own contract (light only — the dark × mid-band seed coverage rides
  the S38 accent-dark mobile pass at 390 and the S36 dark-mobile pass at 390;
  the dark × mid-band × SEED cell for the 13 invariant views remains a
  documented future candidate, folded into the S47 mirror's family).
- **The lowcontrast WARN family** — the S11 non-gap (2.2 ≤ contrast < 3.2) —
  WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed backpressure,
  filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3, Prisma's
  deepmerge-ts pin)** — the owner's standing open items (Docker unavailable
  in this sandbox; the patches land upstream).

## TDD order

1. The drawer-nav geometry pre-measurement at 768×1024 (the empirical anchor
   for the nav-scroll contract: scrollHeight vs clientHeight in the open
   drawer — pin the contract to the measured reality, the AP-88 doctrine).
2. The S46 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
3. `classifyAccentVolumeDarkMidbandSweep` in `src/lib/suite-verdict.ts`
   (GREEN — the file, then the full unit layer 618 + ~35 = ~653).
4. `scripts/accent-volume-dark-midband-sweep.mjs` (the exploration — the
   genuine run 1 against the dev server, AFTER the arrival suite completes:
   the volume lifecycle and the dev server are shared surfaces; the family
   validated clean BEFORE the runner integration).
5. The runner's 28th stage + the literals.
6. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
7. The gates re-run (lint, tsc, the new unit count, build, cold-db 291 e2e —
   delete `db/e2e.db` if a run crosses a UTC midnight boundary, the S45
   day-boundary lesson).
8. The evidence + the docs + the commit + the push.

## Risks

- **The drawer open/close cost at volume at the mid-band viewport**: 49
  navigations × (drawer open + link click + drawer close + render settle +
  checker + measure) — the S44/S45 mobile halves measured ~2.9 min; the
  mid-band half renders the same 300/200/250 density over a wider canvas, so
  the same band is expected. Mitigation: the 25-min stage budget (~8×
  headroom); the exploration measures the real duration BEFORE the runner
  integration (the S38-C lesson).
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server + the probe's
  chromium + the volume DOM — close every interactive browser session before
  the launch; the container ceiling is ~4 GB.
- **The nav-scroll margin at 1024 height is thinner than at 844** (~134px vs
  ~314px of over-scroll): a future nav-row height change that shrinks rows
  below ~46px would flip the mid-band nav to non-scrolling and the contract
  would read as a finding — the CORRECT behavior (the link geometry changed;
  links ~17–20 would sit below the fold) — but the pre-measurement (step 1)
  anchors today's value in the plan and the envelope documents the measured
  geometry per accent.
- **The pendingView interaction read at volume**: the drawer open reads the
  active link while the previous view is active — at volume the re-open
  renders 20 links over a DOM carrying thousands of stress nodes; the read is
  scroll-independent (the active link stays in the DOM with computed styles —
  the S40 note).
- **The marker-row collision**: the standing suite's data-volume stage uses
  `STRESS-S13-`; S42–S45 use `STRESS-S42-`…`STRESS-S45-`; this probe uses
  `STRESS-S46-` — no collision. The pre-clean + the pre-exit cleanup make
  partial runs idempotent.
- **The RUM budget**: 49 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text 429
  filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The arrival-suite overlap**: the S46 exploration must NOT run while the
  standing suite holds the dev server + the shared DB (the data-volume stage
  inserts its own marker rows) — the TDD unit work runs during the suite;
  the exploration runs after it completes.

## Execution log (session 111 — filled as executed)

- ARRIVAL: the fresh clone at `1ca3d7a` (the S45 push `3133d0c` + the user's
  session_110 log updates), the environment re-established (.env per the
  contract, `db/` seeded at the repo root, `bun install`, the Playwright
  chromium-headless-shell v1243 download), the **909-green baseline
  re-confirmed** (lint ✓ tsc ✓ 618 unit ✓ 20 files; build ✓; cold-`db/e2e.db`
  291 e2e ✓ 4.6 min). Preflight GREEN; drawer check GREEN; the live 390×844
  walkthrough GREEN (20 links in order, drawer closes on nav, the Notes
  active-link violet gradient on the inner span at the re-open — the mobile
  navigation menu is working as expected); the mid-band geometry anchor
  MEASURED at 768×1024 (nav scrollHeight 1068 vs clientHeight 935 →
  scrollable TRUE — the empirical anchor for the seam's nav-scroll contract,
  taken BEFORE the pins were finalized); reference UNCHANGED since S19–S45
  (login title "AcademiaFlow (Copy)", the email-prefix greeting, the 20 nav
  views in the same order, the five Settings tabs); copy sweep 14/20 MATCH
  (the 6 data-state non-gaps). The arrival standing suite launched (29 rows,
  the in-flight 27-audit version — the S46 stage commented out at launch and
  re-added after the run loaded, the documented pattern).
- TWO environmental findings on the way to the baseline (both documented in
  AGENTS.md, the `bun run test:e2e` row — the S46 extension of the S45
  day-boundary lesson): (1) the s22 negative-spawn spec times out when the
  repo-root `.env` carries a REAL AUTH_SECRET — Next's standalone output
  COPIES the repo `.env` into `.next/standalone/.env` at build time, so the
  bundled secret satisfies the guard and the server correctly boots; the fix
  is the `.env.example` dev posture (`AUTH_SECRET=""` — dev falls back to
  the local constant with the boot warning) + a rebuild; (2) the
  s23-import round-trip reads `created: 0, updated: 1` on any SECOND
  consecutive run against the aged scratch db (the fixed-id envelope —
  not just across midnights, across ANY re-run); the fix is the cold-db
  convention: `rm -f db/e2e.db` before EVERY full e2e run. After both fixes:
  291 e2e ✓ cold.
- TDD RED: 37 S46 pins in tests/suite-verdict.test.ts (the s46Envelope
  generator at 768×1024 dark with the volume keys + the below-lg structural
  keys + the dark detector keys + the interaction keys + the per-accent
  drawer record; the GREEN shape with the swept counts + the MODE dark note;
  the ALL-VIEWS + ALL-ACCENTS guards; the historical S13-shape envelope; the
  historical S42/S43 desktop envelopes fed here → the viewport
  shape-errors; the historical S44/S45 mobile envelopes fed here → the
  viewport shape-errors [the mid-band seam owns 768×1024; the mobile pair
  own 390×844]; the S44 dark envelope re-scoped to 768×1024 → GREEN [the
  seams discriminate on the viewport, not the shape]; the
  missing-volume/missing-drawer/missing-mode shape-errors; the
  wrong-viewport family [1280×800 AND 390×844 AND 844×390]; the mode-rot
  family [mode=light → non-green]; the volume-rot family [tasks 0 / notes
  199 / events 0 → each a non-green]; the applied-mismatch family; the
  MID-BAND vehicle-contract family; the drawer-nav-scroll family
  [scrollHeight ~1068 vs the ~935px nav area at 1024 height]; the tint-rot +
  interaction families; the overflow family [scrollWidth 778 > 768 →
  finding]; the structural mobile family [drawerClosed=false + appBar=false
  + headingClearance=false → each a finding]; the S13 B3/B2 budget families
  with the boundary-exact 1500 pins; the strict-record families [missing
  longTaskTotal/clickLatencyMs]; the flashbulb family [the dark class — a
  light surface on the dark canvas is ALWAYS a finding]; the
  independent-counting family; the CTA-face exemption with a strictness
  negative + the TWO dark-doctrine negatives [the slate-300 calendar day and
  the yellow-500 pill do NOT exempt in dark]; the WARN family; the
  drawer-error family; the drawer link-census family [linkCount 19 →
  finding]; the S13 B1 API-bound family [512,000 bytes → finding, the
  boundary 500,000 green]; the unknown-audit guard) → **21 failed / 350
  passed** under the current seam (the audit name unknown to it; the 16
  shape-error pins passed vacuously through the unknown-audit path —
  documented; all 21 failures verified in the S46 block).
- TDD GREEN: the seam implementation `classifyAccentVolumeDarkMidbandSweep`
  (the AUDIT_NAMES entry + the dispatch arm + the classifier: the viewport
  guard [768×1024 BOTH axes], the mode rot guard [mode ≠ dark → non-green —
  the light × mid-band × volume family is the documented S47 mirror], the
  volume-EXACT guard [300/200/250], the ALL-ACCENTS + ALL-VIEWS guards, the
  MID-BAND vehicle contract [the below-lg family] + the drawer-own scroll
  contract at the mid-band geometry, the per-accent applied
  self-verification, the drawer link census + the drawer-error class, the
  interaction classes in DARK at MID-BAND at volume [the tint rot + the
  active-state mismatch], the structural below-lg family at volume, the S16
  overflow class at the mid-band width, the S13 B2/B3 budgets with
  boundary-exact pins, the DARK detector family [flashbulbs always findings;
  the CTA-face exemption ONLY; lowcontrast WARN], and the /api/tasks ≤ 500KB
  B1 bound) → **371/371 in the file; the full unit layer 655 (618 + 37)**;
  lint ✓ tsc ✓.
- The probe scripts/accent-volume-dark-midband-sweep.mjs: the S44 volume
  lifecycle + drawer vehicle verbatim (the COUNT-verified 300/200/250
  insert, the marker STRESS-S46-, the API stats, the MEASURE block, the
  pendingView pattern, the below-lg structural family, the finally-race fix
  from birth, the precondition fail() THROWS) + the S42/S44 dark checker
  verbatim + the drawer-scoped dark checker + the dark-mode precondition
  through the REAL lifecycle (no first-paint race in dark) + the per-accent
  gate with the shell-presence guard folded in (`data-accent === accent &&
  html.dark && !!header` — the AP-90 lesson applied to the mid-band vehicle)
  + the drawer-own nav-scroll contract re-measured per accent at the
  mid-band geometry (scrollHeight ~1068 vs clientHeight ~935 at 1024
  height). Syntax ✓ (node --check).
- The runner: the 28th audit stage { accent-volume-dark-midband-sweep,
  timeoutMs: 25 min } directly after accent-volume-light-mobile-sweep (the
  volume family: dark desktop, light desktop, dark mobile, light mobile,
  then dark mid-band) + the stage-count literals (0/28, ${i+1}/28 ×2, 28/28)
  + the header comment — the suite now **30 rows**. Syntax ✓. The in-flight
  arrival run holds the 27-stage version loaded at launch (the documented
  pattern — the runner edits are invisible to it; the S46 entry was
  commented out at launch and re-added after the module loaded).
- The docs aligned (the AP-74 guard): AGENTS (the 655 line + the
  accent-volume-dark-midband-sweep command entry + the 28-audit suite entry
  + the TWO e2e lessons: the bundled-.env s22 class + the always-cold-db s23
  class), vitest.config.ts (655), CLAUDE (655 + the S46 seam note appended to
  the seam history), PAD §8.1 (the S46 classifier note + the per-file count
  334 → 371 + Total 946/655), README (the 946 badge + the 655 lines ×2 +
  the session-46 status row), SKILL (the 946/655 counts ×2). The evidence
  capture script scripts/capture-s46-evidence.mjs (the S45 pattern mirrored:
  the Tasks view at 300 rows in DARK under TEAL at 768×1024 with the drawer
  OPEN on the navigated Tasks view — the dark checker with the CTA-face-only
  exemption + the mid-band nav-scroll geometry verified in-frame; marker
  STRESS-S46-CAP-). Syntax ✓. `.env.example` audited (matches, tracked).
- THE EXPLORATION (the genuine run 1, after the arrival suite read **29/29
  GREEN, exit 0** — every stage green, the theme-restore closing guard
  light/violet): **EXIT 0, findings 0, ~3.0 min measured** (2m59.318s — the
  same band as the S44/S45 mobile halves' ~2.9 min; ~8.4× headroom under the
  25-min budget). The envelope: 49 renderings (7 accents × 7 views) + 7
  drawer records under the COUNT-verified 300/200/250 profile; the
  interaction GREEN — activeLabel === the view on all 49 readings via the
  pendingView pattern, activeTint a linear-gradient on all 49 [**7 DISTINCT
  accent-correct NAV_ACTIVE_GRADIENT_STOPS pairs — the dark × mid-band ×
  volume cell closed**]; the MID-BAND vehicle contract holds
  [sidebarVisible=false + hamburgerVisible=true + drawerNavScrollable=true
  — the nav scroll geometry confirmed at 1024 height: scrollHeight 1068 vs
  clientHeight ~935, links ~17–20 below the fold]; the volume budgets hold
  with huge headroom [max clickLatency 789ms vs the 1500ms budget over the
  drawer-close + view-mount path; max longTaskTotal 0ms]; the density real
  [Tasks 7,894 mainNodes / My Day 3,381 / Events 3,133 / Notes 2,430 —
  identical to the four prior halves, deterministic; 20,209 total nodes for
  the teal accent's 7 views]; **zero flashbulbs across all 49 + 7 drawer
  records** [the dark doctrine at the mid-band layout]; **2 CTA-face exempt
  [the S11 family-2 non-gap — identical to the S42/S44 dark halves]; zero
  non-exempt unreadable**; 32 lowcontrast WARN [the S11 non-gap family —
  identical to the S42/S44 dark counts]; the API stats: /api/tasks 112,960
  bytes @ 66ms — the B1 bound holds — + /api/notes 77,410 @ 73ms +
  /api/events 79,952 @ 20ms [the byte counts identical to the prior halves —
  deterministic]; the drawer link census 20/20 per accent; scrollWidth 768
  on every rendering [no overflow]; the structural family holds
  [drawerClosed + appBar + headingClearance all true]; the cleanup deleted
  the 300/200/250 marker rows. **The genuine envelope classified GREEN at
  the new seam on the FIRST try** (via the temporary vitest harness —
  deleted after, the S42–S45 convention; the note matched /49 view
  renderings/ + /768×1024/ + /MODE dark/ + /300\/200\/250/ + /2 CTA-face/).
  The theme restored light/violet (verified via the DB directly as well).
- THE VALIDATION SUITE (the S32 differential — dev server restarted by PID,
  preflight GREEN, the fresh clean window): the 30-row version launched
  (preflight + the 28 audits incl. the new accent-volume-dark-midband-sweep
  stage + the theme-restore closing guard) — result recorded below.
- THE VALIDATION RESULT: **30/30 GREEN, exit 0** — the new
  accent-volume-dark-midband-sweep row GREEN inside the suite on its FIRST
  integration run (identical counts to the exploration — 49 renderings, 49
  active-tint readings, 112,960 bytes, 2 CTA-face exempt, 32 WARN —
  deterministic), every other stage green, the theme-restore closing guard
  light/violet. The evidence envelope extracted to
  `docs/screenshots/s46-accent-volume-dark-midband-sweep-evidence.json`
  (30 stage rows — the S43+ convention).
- THE GATES: lint ✓ tsc ✓ **655 unit** ✓ (20 files) build ✓ cold-db **291
  e2e ✓ (4.4 min)** = **946 green** (was 909; +37 unit pins; the 291 prior
  pins untouched by construction — zero app code, zero CSS, zero Tailwind
  v4 surface, zero parity-pinned bytes). The cold-db convention applied
  (`rm -f db/e2e.db` before the run — this session's own s23 lesson).
- THE EVIDENCE: the screenshot
  `docs/screenshots/s46-accent-volume-dark-midband-teal-tasks-768.png` via
  scripts/capture-s46-evidence.mjs — **verified in-frame** (the Tasks view
  at 300 rows in DARK under TEAL at 768×1024 with the DRAWER OPEN on the
  navigated Tasks view: the teal NAV_ACTIVE_GRADIENT_STOPS gradient
  `rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1)` on the active link,
  linkCount 20, darkClass true, mainNodes 7,894, 964 stress-row surfaces,
  zero flashbulbs, zero non-exempt unreadable, scrollWidth 768, the nav
  geometry 1068 vs 935 scrollable, the click latency 1,246ms — all verified
  in-frame); the standing 31 refreshed via capture-studyflow.mjs (theme
  restored light); the theme verified via the DB: light/violet.
