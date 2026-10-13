# Remediation Plan — Session 45 (S45): the light × mobile × volume family — the S13 volume profile (300/200/250) swept through the theme space's light half at the mobile viewport (390×844), navigated through the drawer, as a standing, executable guarantee

**Audit surfaces (this session, the session-106/107 workspace re-run at `84fcc01`):** the
baseline gates re-confirmed the documented **874-green** state on arrival (lint
✓ tsc ✓ **583 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.3 min**; the fresh sandbox needed the Playwright
chromium-headless-shell v1243 download — an environmental step, not a code
finding), the S31 preflight ran GREEN before the checks, the drawer check GREEN
(backdrop oklab+blur(4px), 288px white panel, 20 links, no footer,
Escape-close), the live agent-browser 390×844 walkthrough GREEN (login →
dashboard scrollWidth 390 → drawer with all 20 links in the documented order →
navigate to Notes → drawer closes on navigation → the active link "Notes"
carrying the violet NAV_ACTIVE_GRADIENT_STOPS gradient on the inner span, read
twice: once post-navigation and once at the re-open — **the mobile navigation
menu is working as expected**), and the reference re-sweep: **UNCHANGED since
S19–S44** (login title "AcademiaFlow (Copy)"; the email-prefix greeting "Good
evening, sepnetflix2023 👋" — the time bucket varies by hour, the email prefix
is the invariant; the same 20 nav views in the same order; the same five
Settings tabs Appearance/Profile/Subjects/Holidays/Notifications). The 20-view
copy sweep (the `:3200` standalone server on `db/custom.db`): **14/20 MATCH**
with the 6 diffs all data-state (the documented S17-pinned non-gap family). The
S44 one-command standing suite (28 rows, the 26-audit version) launched in the
background for the arrival check; its result is recorded in the execution log
below.

## The governing finding (this session's work)

**The light × mobile × volume family is the documented bracketed non-gap — and
this session closes it** (the S44 summary's own first named next candidate:
"the light × mobile × volume cell (the mirrored light half at 390×844 — needs
the THREE light exemptions, the S43 doctrine)").

The coverage map, verified against the standing scripts (grep-verified this
session):

- `scripts/data-volume-audit.mjs` (S13): the 300/200/250 profile, the
  payload/long-task/click-latency budgets — **1280×800, LIGHT + VIOLET only**
  (line 77: `viewport: { width: 1280, height: 800 }`; zero theme references) —
  the desktop, once, default theme only.
- `mobile/midband/landscape/dark-mobile` (S33/S34/S35/S36): the mobile viewport
  family — **SEED volume** (grep for `STRESS|countMany|createMany|deleteMany`
  across all five: ZERO hits).
- `accent-light/midband/landscape/desktop` (S37/S39/S40/S41): the accent family
  at mobile/mid-band/landscape/desktop — **SEED volume** (the same grep).
- `accent-volume-sweep` (S42) + `accent-volume-light-sweep` (S43): 7 accents ×
  the 7 volume views — **1280×800 only** (`const W = 1280` at lines 79/83 —
  the viewport axis is their blind spot; S42 dark, S43 light).
- `accent-volume-dark-mobile-sweep` (S44): the mobile viewport at volume —
  **DARK only** (its mode precondition at lines 470–472:
  `if (mode !== "dark") fail(...)`; its seam's rot guard:
  `mode ≠ dark → non-green`).

So the cross-axis cell **light × mobile × accent × volume** is ZERO-coverage
at every accent: the densest renderings (the 300-row Tasks list, the 250-event
terminal panel, the 200-note list) had never been rendered in LIGHT at the
stacked mobile layout under ANY accent, the S13 volume budgets had never been
measured at the mobile viewport in LIGHT under a theme variation, AND the
DRAWER's active-link tint had never been read through the real navigation
lifecycle in LIGHT at MOBILE at VOLUME (S37 proved light × accent at mobile at
SEED; S40 accent × drawer at SEED light; S43 light × volume at DESKTOP; S44
dark × volume at MOBILE). The S43 doctrine governs the light half: the THREE
signature-strict light exemptions (the CTA-face white-on-accent + the calendar
adjacent-month slate-300 day numbers + the yellow-500 priority-pill
vocabulary), NO flashbulb class (a light surface on the light canvas is
by-design — the class exists only in dark), and the light-mode hydration gate
(`!html.dark` is TRUE at first paint, so the post-mount observable is the
greeting heading — the S41/S43 lesson).

## Families and fixes

### S45-A (HIGH) — the seam `classifyAccentVolumeLightMobileSweep` + the unit pins

The seam (inserted after the S44 classifier, before the cwv section), on the
S44 doctrine with the S43 light family:

- the **mode rot guard INVERTED** (mode MUST be light — the dark × mobile ×
  volume half is the S44 audit's own contract; an envelope with `mode=dark`
  fed here reads NON-green, never a silent re-scope);
- the **viewport guard** (390×844 BOTH axes — the 1280×800 desktop, 768×1024
  mid-band, and 844×390 landscape envelopes each read shape-error: the
  sibling families own those surfaces);
- the **volume-EXACT guard** (300/200/250 — a seed-volume envelope is its own
  rot class, the S38 retirement applied to the volume axis);
- the **ALL-ACCENTS + ALL-VIEWS guards** (the 7 accents; the 7 volume-affected
  views by DISPLAY labels — the S13 set; a missing key is a LOUD shape-error,
  never green-by-omission);
- the **MOBILE vehicle contract INVERTED** (sidebarVisible MUST be false +
  hamburgerVisible MUST be true — the drawer is the only vehicle below 1024) +
  the **drawer-own nav-scroll contract** (drawerNavScrollable — the nav MUST
  scroll at 844 height, the only path to links ~14–20);
- the per-accent **applied self-verification** (applied === the accent key);
- the **drawer link census** (linkCount === 20) + the drawer-error class (an
  error string is a FINDING, never a swallow);
- the **interaction classes in LIGHT at MOBILE at volume**: the tint rot
  (activeTint none/empty — the S8 no-var class) + the active-state mismatch
  (activeLabel ≠ the view);
- the **structural mobile family at volume** (drawerClosed / appBar /
  headingClearance — each a finding class) + the S16 overflow class
  (scrollWidth > 390);
- the **S13 B2/B3 volume budgets** with boundary-exact pins (longTaskTotal ≤
  1500ms; clickLatencyMs ≤ 1500ms over the drawer-close + view-mount path; the
  boundary value 1500 stays green on both);
- the **LIGHT detector family** (the S43 doctrine): NO flashbulb class — the
  view and drawer records carry NO flashbulbs key (the light family's own
  record shape); unreadable < 2.2 counted INDEPENDENTLY of the findings array
  with the **THREE signature-strict light exemptions** (the CTA-face
  `rgb(255, 255, 255)` white-on-accent + the calendar adjacent-day
  `rgb(203, 213, 225)` slate-300 with 1–2-digit text + the yellow priority
  pill `rgb(234, 179, 8)` yellow-500 with high/medium/low — each
  signature-strict: the right color with the wrong text still counts);
  lowcontrast < 3.2 = WARN (rides the note, never the findings);
- the **/api/tasks ≤ 500KB B1 bound** (the boundary 500,000 stays green).

The pin block (appended after the S44 describe block): ~35 pins — the s45
envelope generator (7 accents × 7 views + the drawer record per accent at
390×844 light under the volume profile, NO flashbulbs keys, the
activeLabel-defaults-filled interaction contract), the GREEN shape with the
swept counts (49 renderings / 49 active-tint readings / 7 drawer records /
MODE light), the ALL-VIEWS + ALL-ACCENTS guards, the historical S13-shape
envelope → shape-error, the historical S42/S43 desktop envelopes → the
viewport shape-errors, the historical **S44 dark-mobile envelope → NON-green
via the mode rot** (the same 390×844 cell — the MODE is this seam's
discriminator), the historical S44 envelope with `mode=light` → GREEN (extra
dark-only flashbulbs keys ride along — the shape checks required keys; the
LIGHT shape carries NO flashbulb family), the missing-volume/missing-drawer/
missing-mode shape-errors, the wrong-viewport family, the mode-rot family, the
volume-rot family (tasks 0 / notes 199 / events 0), the applied-mismatch
family, the MOBILE vehicle-contract family, the drawer-nav-scroll family, the
tint-rot + interaction families, the overflow family, the structural mobile
family, the B3/B2 budget families with boundaries, the strict-record families,
the independent-counting family, the THREE exemption families each with a
strictness negative, the WARN family, the drawer-error + link-census families,
the B1 bound with boundary, the unknown-audit guard.

### S45-B (HIGH) — the probe: `scripts/accent-volume-light-mobile-sweep.mjs`

The S44 probe verbatim (the volume lifecycle + the drawer vehicle + the
pendingView interaction pattern + the mobile structural family + the S13
measurement family + the finally-race fix + the AP-85 trailing-write exit),
with the S43 light family substituted:

- the **light checker** (the S43 CHECKER verbatim: unreadable < 2.2 cap 12 +
  lowcontrast < 3.2 cap 14, the effective-background walk over
  main/aside/header/dialog, the light default bg fallback `{248, 250, 252}`,
  the `display:none` guard for the hidden desktop sidebar and the closed
  drawer — NO flashbulb section);
- the **drawer-scoped light checker** (the S44 DRAWER_CHECKER minus the
  flashbulb section: linkCount + unreadable + lowcontrast + the active
  reading on the final navigated view);
- the **light-mode precondition through the REAL lifecycle** (PATCH
  themeMode=light → goto → the greeting-heading hydration gate → the applied
  mode read — the S43 lesson: `!html.dark` is TRUE at first paint, so the
  gate is the POST-MOUNT greeting heading);
- the **per-accent gate with the shell-presence guard** (`data-accent ===
  accent && !html.dark && !!document.querySelector("header")` — the S44
  mobile shell observable: the app bar exists only after the auth gate
  mounts the shell);
- the **exit-code computation with the THREE light exemptions** (isCtaFace +
  isCalendarAdjacentDay [slate-300 + 1–2-digit] + isYellowPriorityPill
  [yellow-500 + high/medium/low]) — a light surface is by-design in light
  mode, so there is NO flashbulb term;
- the marker `STRESS-S45-` (no collision with S13/S42/S43/S44); the closing
  restore light/violet + the pre-exit cleanup (idempotent) + the catch-path
  restore.

### S45-C (MEDIUM) — the runner: the 27th stage

`scripts/standing-suite.mjs`: the STAGES entry
`{ name: "accent-volume-light-mobile-sweep", file:
"scripts/accent-volume-light-mobile-sweep.mjs", runtime: "node", timeoutMs:
25 * 60_000 }` directly after accent-volume-dark-mobile-sweep (the volume
family together: dark desktop, light desktop, dark mobile, then light
mobile) + the stage-count literals (`0/27`, `${i + 1}/27`, `27/27`) + the
header comment (the suite now **29 rows**: preflight + 27 audits +
theme-restore).

### S45-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the new unit-count line + the accent-volume-light-mobile-sweep
command entry + the 27-audit suite entry), vitest.config.ts (the count
comment), CLAUDE.md (the count + the S45 seam note appended to the seam
history), PAD §8.1 (the classifier + the per-file count + the Total line),
README.md (the badge + the count lines ×2 + the session-45 status row),
omni-study_SKILL.md (the counts). `.env.example` audited (matches, tracked).

### S45-E (MEDIUM) — the evidence + the session record

`scripts/capture-s45-evidence.mjs` (the S44 pattern mirrored: the Tasks view
at 300 rows in LIGHT under TEAL at 390×844 with the drawer OPEN on the
navigated Tasks view — the teal NAV_ACTIVE_GRADIENT_STOPS gradient on the
active link, linkCount 20, the in-frame verification incl. the light-mode
unreadable probes with the THREE exemptions) →
`docs/screenshots/s45-accent-volume-light-mobile-teal-tasks-390.png`; the
evidence envelope `docs/screenshots/s45-accent-volume-light-mobile-sweep-evidence.json`
(the validation suite's JSON envelope — 29 stage rows); the standing 31
refreshed via capture-studyflow.mjs (theme restored light/violet, verified
via the DB); the worklog entry + the session_108 narrative + the session_109
summary + this plan's execution log.

## Non-gaps (documented, do not fix)

- **The dark × mobile × volume cell** — the S44 audit's own contract (its
  seam's mode guard reads dark; this session's probe owns the light half).
- **The mid-band/landscape × volume cells** (768×1024 / 844×390 × light/dark ×
  accent × volume) — future cross-axis candidates (the S44 summary's named
  family).
- **The RUM-beacon second cross-axis** (RUM-beacon behavior under suite
  volume) — a future cross-axis candidate (the S44 summary's named family).
- **The 13 volume-invariant views** (Timetable, Assignments, Exams,
  Flashcards, Practice Tests, Study Groups, Grade Tracker, Files, Calculator,
  Math Solver, AI Assistant, Focus Timer, Settings) — they render no
  task/note/event rows; their light × mobile coverage is the S37 seed-volume
  sweep's own contract, their dark × mobile coverage the S36 seed contract.
- **The lowcontrast WARN family** — the S11 non-gap (2.2 ≤ contrast < 3.2) —
  WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed backpressure,
  filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3, Prisma's
  deepmerge-ts pin)** — the owner's standing open items (Docker unavailable
  in this sandbox; the patches land upstream).

## TDD order

1. The S45 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
2. `classifyAccentVolumeLightMobileSweep` in `src/lib/suite-verdict.ts`
   (GREEN — the file, then the full unit layer 583 + ~35 = ~618).
3. `scripts/accent-volume-light-mobile-sweep.mjs` (the exploration — the
   genuine run 1 against the dev server, AFTER the arrival suite completes:
   the volume lifecycle and the dev server are shared surfaces; the family
   validated clean BEFORE the runner integration).
4. The runner's 27th stage + the literals.
5. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
6. The gates re-run (lint, tsc, the new unit count, build, cold-db 291 e2e).
7. The evidence + the docs + the commit + the push.

## Risks

- **The drawer open/close cost at volume in light**: 49 navigations × (drawer
  open + link click + drawer close + render settle + checker + measure) — the
  S44 dark half measured ~2.9 min; the light half is expected in the same
  band. Mitigation: the 25-min stage budget (~8× headroom); the exploration
  measures the real duration BEFORE the runner integration (the S38-C
  lesson).
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server + the probe's
  chromium + the volume DOM at the narrow viewport — close every interactive
  browser session before the launch; the container ceiling is ~4 GB.
- **The light-mode hydration race** (the S43 lesson): in light mode
  `!html.dark` is TRUE at first paint — BEFORE hydration + the auth gate
  resolve the shell, so the chrome contract check races. The gate is the
  POST-MOUNT greeting heading (the S41/S43 pattern), and the per-accent gate
  folds the shell-presence observable in (the header at 390 — the S44 form).
- **The pendingView interaction read at volume**: the drawer open reads the
  active link while the previous view is active — at volume the re-open
  renders 20 links over a DOM carrying thousands of stress nodes; the read is
  scroll-independent (the active link stays in the DOM with computed styles —
  the S40 note).
- **The marker-row collision**: the standing suite's data-volume stage uses
  `STRESS-S13-`; S42/S43/S44 use `STRESS-S42-`/`STRESS-S43-`/`STRESS-S44-`;
  this probe uses `STRESS-S45-` — no collision. The pre-clean + the pre-exit
  cleanup make partial runs idempotent.
- **The RUM budget**: 49 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text 429
  filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The arrival-suite overlap**: the S45 exploration must NOT run while the
  standing suite holds the dev server + the shared DB (the data-volume stage
  inserts its own marker rows) — the TDD unit work runs during the suite;
  the exploration runs after it completes.

## Execution log (session 108 — filled as executed)

- ARRIVAL: the fresh clone at `84fcc01` (the S44 push `1246fcd` + the user's
  session_107 log updates), the environment re-established (.env per the
  contract, `db/` seeded at the repo root, `bun install`, the Playwright
  chromium-headless-shell v1243 download), the **874-green baseline
  re-confirmed** (lint ✓ tsc ✓ 583 unit ✓ 20 files; build ✓; cold-`db/e2e.db`
  291 e2e ✓ 4.3 min). Preflight GREEN; drawer check GREEN; the live 390×844
  walkthrough GREEN (20 links in order, drawer closes on nav, the Notes
  active-link violet gradient on the inner span); reference UNCHANGED since
  S19–S44; copy sweep 14/20 MATCH (the 6 data-state non-gaps). The arrival
  standing suite launched (28 rows).
- The coverage map re-verified against the standing scripts (the greps above):
  the light × mobile × volume cell is confirmed zero-coverage — the S45 scope.
- TDD RED: 35 S45 pins in tests/suite-verdict.test.ts (the s45Envelope
  generator at 390×844 light with the volume keys + the mobile structural
  keys + the interaction keys + the per-accent drawer record — the LIGHT
  family's own record shape: NO flashbulbs keys; the GREEN shape with the
  swept counts + the MODE light note; the ALL-VIEWS + ALL-ACCENTS guards;
  the historical S13-shape envelope; the historical S42/S43 desktop
  envelopes fed here → the viewport shape-errors; the historical S44
  dark-mobile envelope fed here → NON-green via the mode rot [the same
  390×844 cell, the MODE is the discriminator]; the S44 envelope with
  mode=light → GREEN [the no-flashbulbs family — extra dark-only keys ride
  along]; the missing-volume/missing-drawer/missing-mode shape-errors; the
  wrong-viewport family [1280×800 AND 768×1024 AND 844×390]; the mode-rot
  family [mode=dark → non-green]; the volume-rot family [tasks 0 / notes
  199 / events 0 → each a non-green]; the applied-mismatch family; the
  MOBILE vehicle-contract family; the drawer-nav-scroll family; the tint-rot
  + interaction families; the overflow family [scrollWidth 410 → finding];
  the structural mobile family [drawerClosed=false + appBar=false +
  headingClearance=false → each a finding]; the S13 B3/B2 budget families
  with the boundary-exact 1500 pins; the strict-record families [missing
  longTaskTotal/clickLatencyMs]; the independent-counting family; the THREE
  exemption families each with a strictness negative [the CTA-face
  non-white + the calendar slate-300 non-day + the yellow-400 wrong-shade];
  the WARN family; the drawer-error family; the drawer link-census family
  [linkCount 19 → finding]; the S13 B1 API-bound family [512,000 bytes →
  finding, the boundary 500,000 green]; the unknown-audit guard) → **21
  failed / 313 passed** under the current seam (the audit name unknown to
  it; the 14 shape-error pins passed vacuously through the unknown-audit
  path — documented; all 21 failures verified in the S45 block).
- TDD GREEN: the seam implementation `classifyAccentVolumeLightMobileSweep`
  (the AUDIT_NAMES entry + the dispatch arm + the classifier: the mode rot
  guard INVERTED [mode ≠ light → non-green — the dark × mobile × volume
  family is the S44 audit's own], the volume-EXACT guard [300/200/250], the
  ALL-ACCENTS + ALL-VIEWS guards, the MOBILE vehicle contract INVERTED +
  the drawer-own scroll contract, the per-accent applied self-verification,
  the drawer link census + the drawer-error class, the interaction classes
  in LIGHT at MOBILE at volume [the tint rot + the active-state mismatch],
  the structural mobile family at volume, the S16 overflow class, the S13
  B2/B3 budgets with boundary-exact pins, the LIGHT detector family with the
  THREE signature-strict light exemptions counted independently, and the
  /api/tasks ≤ 500KB B1 bound) → **334/334 in the file; the full unit layer
  618 (583 + 35)**; lint ✓ tsc ✓.
- The probe scripts/accent-volume-light-mobile-sweep.mjs (778 lines): the
  S44 volume lifecycle + drawer vehicle verbatim (the COUNT-verified
  300/200/250 insert, the marker STRESS-S45-, the API stats, the MEASURE
  block, the pendingView pattern, the mobile structural family, the
  finally-race fix from birth, the precondition fail() THROWS) + the S43
  light checker verbatim (NO flashbulbs — the class exists only in dark;
  the light default bg fallback {248, 250, 252}) + the drawer-scoped light
  checker + the light-mode precondition through the REAL lifecycle (the
  greeting-heading hydration gate — the S43 lesson) + the per-accent gate
  with the shell-presence guard folded in (`data-accent === accent &&
  !html.dark && !!header` — the S44 mobile shell observable) + the
  exit-code computation with the THREE light exemptions. Syntax ✓
  (node --check); the flashbulb mentions grep-verified comment-only.
- The runner: the 27th audit stage { accent-volume-light-mobile-sweep,
  timeoutMs: 25 min } directly after accent-volume-dark-mobile-sweep (the
  volume family together: dark desktop, light desktop, dark mobile, then
  light mobile) + the stage-count literals (0/27, ${i+1}/27 ×2, 27/27) +
  the header comment — the suite now **29 rows**. Syntax ✓. The in-flight
  arrival run holds the 26-stage version loaded at launch (the documented
  pattern — the runner edits are invisible to it).
- The docs aligned (the AP-74 guard): AGENTS (the 618 line + the
  accent-volume-light-mobile-sweep command entry + the 27-audit suite
  entry), vitest.config.ts (618), CLAUDE (618 + the S45 seam note appended
  to the seam history), PAD §8.1 (the S45 classifier note + the per-file
  count 299 → 334 + Total 909/618), README (the 909 badge + the 618 lines
  ×2 + the session-45 status row), SKILL (the 909/618 counts ×2). The
  evidence capture script scripts/capture-s45-evidence.mjs (the S44 pattern
  mirrored: the Tasks view at 300 rows in LIGHT under TEAL at 390×844 with
  the drawer OPEN on the navigated Tasks view — the light unreadable probe
  with the THREE exemptions; marker STRESS-S45-CAP-). Syntax ✓.
- THE EXPLORATION (the genuine run 1, after the arrival suite read 28/28
  GREEN): EXIT 0, findings 0, **~2.9 min measured** (2m56.759s — the S44
  dark half measured the same; ~8.5× headroom under the 25-min budget). The
  envelope: 49 renderings (7 accents × 7 views) + 7 drawer records under the
  COUNT-verified 300/200/250 profile; the interaction GREEN — activeLabel
  === the view on all 49 readings via the pendingView pattern, activeTint a
  linear-gradient on all 49 [**7 DISTINCT accent-correct
  NAV_ACTIVE_GRADIENT_STOPS pairs — the light × mobile × volume cell
  closed**]; the MOBILE vehicle contract holds [sidebarVisible=false +
  hamburgerVisible=true + drawerNavScrollable=true — the nav scroll geometry
  confirmed at 844 height]; the volume budgets hold with huge headroom [max
  clickLatency 780ms vs the 1500ms budget over the drawer-close + view-mount
  path; max longTaskTotal 0ms]; the density real [Tasks 7,894 mainNodes /
  My Day 3,381 / Events 3,133 / Notes 2,430 — identical to the dark half,
  deterministic; 141,463 total nodes]; **zero non-exempt unreadable** — 65
  total, all exempt [23 CTA-face + 28 calendar adjacent-day + 14 yellow-pill
  — the THREE signature-strict light exemptions at the stacked mobile
  layout]; 3,270 lowcontrast WARN [the S11 non-gap family — the S43 desktop
  light half read 3,404: the stacked mobile layout surfaces slightly fewer
  low-contrast nodes]; the API stats: /api/tasks 112,960 bytes @ 53ms — the
  B1 bound holds — + /api/notes 77,410 @ 23ms + /api/events 79,952 @ 28ms;
  the drawer link census 20/20 per accent; the cleanup deleted the
  300/200/250 marker rows. **The genuine envelope classified GREEN at the
  new seam on the FIRST try** (via the temporary vitest harness — deleted
  after, the S42/S43/S44 convention; the note matched /49 view renderings/ +
  /MODE light/ + /23 CTA-face + 28 calendar-day + 14 yellow-pill/). The
  theme restored light/violet (verified via the DB directly as well).
- THE VALIDATION SUITE (the S32 differential — dev server restarted by PID
  6118, preflight GREEN, the fresh clean window): **29/29 GREEN, exit 0** —
  the new accent-volume-light-mobile-sweep row GREEN inside the suite on its
  FIRST integration run (identical counts to the exploration — 49
  renderings, 112,960 bytes, 23/28/14 exempt, 3,270 WARN — deterministic),
  every other stage green, the theme-restore closing guard light/violet. The
  evidence envelope extracted to
  `docs/screenshots/s45-accent-volume-light-mobile-sweep-evidence.json`
  (29 stage rows — the S43 convention).
- THE GATES: lint ✓ tsc ✓ **618 unit** ✓ (20 files) build ✓ cold-db **291
  e2e ✓ (4.4 min)** = **909 green** (was 874; +35 unit pins; the 291 prior
  pins untouched by construction — zero app code, zero CSS, zero Tailwind v4
  surface, zero parity-pinned bytes). ONE ENVIRONMENTAL FINDING on the way:
  the first e2e re-run read 287/291 — the e2e scratch db had aged across the
  UTC midnight boundary between the baseline run (22:35, pre-midnight, 291
  green) and the gates re-run (00:2x, post-midnight): the global setup
  re-seeds every run, but the seed's IDEMPOTENT UPSERTS do not refresh
  day-relative dates on existing rows, so today's tasks / the +1-day exam
  badge / the assignment due-in pills / the s23 import round-trip dates each
  read one day stale → 4 deterministic failures (parity-session6 ×2,
  parity-session9, s23-import). Deleting `db/e2e.db` re-seeded fresh → 291
  green. Environmental, not a code finding — documented in AGENTS.md (the
  day-boundary lesson, the `bun run test:e2e` row).
- THE EVIDENCE: the screenshot
  `docs/screenshots/s45-accent-volume-light-mobile-teal-tasks-390.png` via
  scripts/capture-s45-evidence.mjs — **verified in-frame** (the Tasks view
  at 300 rows in LIGHT under TEAL at 390×844 with the DRAWER OPEN on the
  navigated Tasks view: the teal NAV_ACTIVE_GRADIENT_STOPS gradient
  `rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1)` on the active link,
  linkCount 20, lightClass true, mainNodes 7,894, 964 stress-row surfaces,
  zero non-exempt unreadable, scrollWidth 390, the click latency 1,227ms —
  all verified in-frame); the standing 31 refreshed via
  capture-studyflow.mjs (theme restored light); the theme verified via the
  DB: light/violet.
