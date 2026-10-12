# Remediation Plan — Session 44 (S44): the dark × mobile × volume family — the S13 volume profile (300/200/250) swept through the theme space's dark half at the mobile viewport (390×844), navigated through the drawer, as a standing, executable guarantee

**Audit surfaces (this session, the session-103/104 workspace re-run at `e14be49`):** the
baseline gates re-confirmed the documented **841-green** state on arrival (lint
✓ tsc ✓ **550 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.3 min**; the fresh sandbox needed the Playwright
chromium-headless-shell v1243 download — an environmental step, not a code
finding), the S31 preflight ran GREEN before the checks, the drawer check GREEN
(backdrop oklab+blur(4px), 288px white panel, 20 links, no footer,
Escape-close), the live agent-browser 390×844 walkthrough GREEN (login →
dashboard scrollWidth 390 → drawer with all 20 links in the documented order →
the active link "Notes" with the violet NAV_ACTIVE_GRADIENT_STOPS gradient on
the inner span → drawer closes on navigation — **the mobile navigation menu is
working as expected**), and the reference re-sweep: **UNCHANGED since S19–S43**
(login title "AcademiaFlow (Copy)"; the zero-data dashboard with the greeting
from the email prefix "Good morning, sepnetflix2023 👋"; the same 20 nav views
in the same order; the same five Settings tabs
Appearance/Profile/Subjects/Holidays/Notifications). The 20-view copy sweep
(the `:3200` standalone server on `db/custom.db`): **14/20 MATCH** with the 6
diffs all data-state (the documented S17-pinned non-gap family). The S43
one-command standing suite result is recorded in the execution log below.

## The governing finding (this session's work)

**The dark × mobile × volume family is the documented bracketed non-gap — and
it is still zero-coverage: the S13 data-volume audit (300 tasks / 200 notes /
250 events) runs at 1280×800 in LIGHT mode + VIOLET only with ZERO theme
references (grep-verified), every mobile-viewport sweep (S33 mobile, S34
midband, S35 landscape, S36 dark-mobile, S37/S39/S40 accent-mobile variants)
runs at SEED volume (no STRESS markers, no countMany, no Prisma inserts —
grep-verified), and both volume × accent sweeps (S42 dark, S43 light) run at
1280×800 only (their seams' viewport guards read the desktop 1280×800 — the
viewport axis is their blind spot).** So the cross-axis cell **dark × mobile ×
accent × volume** is ZERO-coverage at every one of the 7 accents: the densest
renderings (the 300-row Tasks list, the 250-event terminal panel, the 200-note
list) had never been rendered in dark at the stacked mobile layout under ANY
accent (S36 proved dark × mobile at seed; S42 proved dark × volume at desktop;
neither owns the triple intersection), the S13 volume budgets had never been
measured at the mobile viewport under a theme variation, AND the DRAWER's
active-link tint had never been read through the real navigation lifecycle in
DARK at MOBILE at VOLUME (S40 proved accent × drawer-tint at 844×390 light;
S42 proved dark × tint at desktop; S36 proved dark × drawer at seed without
per-accent interaction evidence). The S43 summary's own named first candidate.

The four gaps that ride in that one sentence:

1. **The contrast gap (the dark detector family at mobile at volume)**: the
   dark-mode detectors (flashbulb — a light surface on the dark canvas —
   ALWAYS a finding; unreadable < 2.2 with the CTA-face exemption ONLY — the
   S42 dark doctrine: the calendar adjacent-month days and the yellow priority
   pills RE-THEME in dark, so the light-mode exemptions do NOT apply) have
   never run over the DENSE renderings at the STACKED mobile layout at ANY
   accent: the 300-row Tasks list (75 high-priority pills — the pill family
   re-themed in dark, so a drift at volume is a genuine finding), the
   250-event terminal panel (intentionally dark in BOTH themes — at mobile it
   stacks full-width), the 200-note list with pinned rows, the Dashboard's
   volume-swollen Today's Tasks / upcoming lists, the Analytics charts over
   300+ rows. The mobile stacking re-flows every one of these surfaces (the
   two-pane views stack below lg — the S8-H pattern), so a contrast defect
   invisible at desktop-stacking could fire at mobile-stacking and vice versa.
2. **The performance gap (the mobile main thread at volume)**: the S13 volume
   budgets (long tasks ≤ 1.5 s per view, click→heading ≤ 1.5 s, the
   /api/tasks ≤ 500 KB bound) have never been measured at the 390-viewport
   under a theme variation in dark. The mobile layout renders the same 300
   rows on a narrower, taller canvas with the drawer's open/close animation in
   the navigation path — the B2 click budget at mobile measures the
   drawer-link click → identity heading (the drawer must CLOSE, the view must
   mount, the heading must render — a strictly longer path than the S42
   sidebar click).
3. **The interaction gap (the dark × mobile × volume cell)**: the DRAWER's
   active-link tint has been read through the real navigation lifecycle at
   844×390 in light (S40, per-view), at 768×1024 in light (S39), in dark at
   desktop (S42), in dark at mobile at SEED (S36's drawer record — final view
   only, no accent variation) — the dark × mobile × volume cell with per-view
   interaction evidence is zero-coverage. The tint must resolve the
   accent-correct NAV_ACTIVE_GRADIENT_STOPS pair (read on the inner span at
   the next drawer open — the S40 pendingView pattern) while the DOM carries
   thousands of stress-row nodes.
4. **The volume self-verification gap (the S42 doctrine, applied from
   birth)**: the sweep must COUNT-verify the 300/200/250 marker rows through
   Prisma BEFORE measuring — a sweep that silently measured seed volume must
   never read green-by-omission.

**The companion finding (the anti-phantom doctrine, AP-83):** the mobile probe
is born with the full S42/S43 envelope guard set — ALL-ACCENTS + ALL-VIEWS
(the 7-volume-view set) + volume-counts-exact + the applied self-verification +
viewport + mode contracts — because the coverage IS the guarantee.

## Families and fixes

### S44-A (HIGH) — the seam `classifyAccentVolumeDarkMobileSweep` + the unit pins

The seam (`src/lib/suite-verdict.ts`) gains, in the S37–S43 doctrine shape
(the S42 dark classifier as the direct model — the DARK detector family; the
S43 volume lifecycle keys; the MOBILE vehicle contract from the S36/S40
families):

1. **The AUDIT_NAMES entry** `accent-volume-dark-mobile-sweep` + the dispatch
   arm.
2. **The envelope metadata shape**: `mode` (string — shape-error if missing;
   `mode !== "dark"` reads NON-green — the S27 rot-guard family, NOT inverted:
   the dark half is this audit's contract, the S42/S43 desktop pair own their
   halves), `viewport` (exactly `{width: 390, height: 844}` on BOTH axes — the
   S33/S36 mobile class; a 1280×800/768×1024/844×390 envelope fed here is a
   shape-error), `volume` (`{tasks: 300, notes: 200, events: 250}` EXACTLY —
   the S13 profile; a seed-volume envelope is its own rot class),
   `chrome` (`sidebarVisible: false` + `hamburgerVisible: true` +
   `drawerNavScrollable: true` — the MOBILE vehicle contract: the sidebar is
   `hidden lg:flex` so below 1024 the DRAWER is the only vehicle; the
   app bar's hamburger is the vehicle's handle; the drawer-own nav scroll is
   the only path to links ~14–20 at 844 height — measured scrollHeight 1068
   vs clientHeight ≈ 700).
3. **The ALL-ACCENTS guard**: every one of the 7 accents must carry a record.
4. **The ALL-VIEWS guard** (the 7 display labels Dashboard, My Day, Tasks,
   Calendar, Events, Notes, Analytics — the S13 volume-affected set; the other
   13 views are volume-invariant and stay covered by the S38/S40 seed
   sweeps): every accent's view map must carry all 7.
5. **The per-view record shape**: `heading`, `scrollWidth`, `drawerClosed`,
   `appBar`, `headingClearance` (the S33/S35 mobile structural family), the
   DARK detector family — `flashbulbs` / `unreadable` / `lowcontrast`
   (Arrays), `consoleErrors` (Array), `activeTint` + `activeLabel` (strings —
   the dark × mobile × volume interaction evidence, read at the next drawer
   open), AND the volume contracts: `nodes`, `mainNodes`, `longTaskTotal`,
   `clickLatencyMs`.
6. **The drawer record per accent** (`linkCount` + `flashbulbs` + `unreadable`
   + `lowcontrast` + `activeView` + `activeTint`, `error?` — an error string
   is a FINDING, never a swallow).
7. **The finding classes the seam owns** (counted independently of the
   findings array, the anti-phantom doctrine):
   - mode rot / viewport rot (shape-error) / volume rot (the metadata
     contracts)
   - the MOBILE vehicle contract (sidebarVisible must be FALSE +
     hamburgerVisible must be TRUE — the INVERSE of the S41/S42/S43 desktop
     seams) + the drawer-own nav-scroll contract
   - applied-mismatch (per accent — the self-verified `<html data-accent>`)
   - the volume budgets: `longTaskTotal > 1500` per view (the S13 B3 class)
     and `clickLatencyMs > 1500` per view (the S13 B2 class; the boundary
     value 1500 stays green on both)
   - the tint rot (`activeTint` "none"/empty — the S8 no-var class) and the
     active-state mismatch (`activeLabel` ≠ the view)
   - overflow (`scrollWidth > 390` — the S16 mobile-only-gap class) and
     console errors
   - the structural mobile family: the drawer that did not close on
     navigation, the missing app bar (brand + 2-digit-hour clock), the
     heading clearance breach (the heading's box top under the fixed 64px
     bar)
   - the API payload bound (the S13 B1 class): `api."/api/tasks".bytes >
     500_000`
   - flashbulbs ALWAYS findings (every entry — the S38 dark doctrine)
   - unreadable with the **SINGLE dark exemption**, SIGNATURE-STRICT: the
     CTA-face — white `rgb(255, 255, 255)` on accent-500 (the S11 family-2
     non-gap). The light-mode exemptions (the calendar adjacent-month
     slate-300 days, the yellow-500 priority pills) do NOT apply — those
     surfaces re-theme in dark (the S42 doctrine). Any OTHER unreadable
     combination is a genuine finding (counted) — with a strictness negative
     pin (the exempt signature with a mutated color still counts).
   - lowcontrast < 3.2 = WARN (the S11 non-gap family — rides the note,
     never the findings).
8. **TDD**: ~32 unit pins in `tests/suite-verdict.test.ts` — the
   s44Envelope generator (the GREEN shape at 390×844 dark with the volume
   keys + the dark detector keys + the mobile structural keys + the
   interaction keys + the api record + the per-accent drawer record), the
   GREEN note (49 renderings + 49 tint readings + 7 drawer records + MODE
   dark + 390×844 + 300/200/250), the historical pre-S44 shapes (the S13
   data-volume envelope's flat findings/nonGaps shape; the S42 DARK desktop
   envelope fed here → the viewport shape-error; the S43 light envelope fed
   here → the viewport shape-error), the missing-key/missing-accent/
   missing-view shape-error families, the mode-rot family (mode=light →
   non-green), the volume-rot family (tasks 0 / notes 199 / events 0 → each a
   non-green), the chrome family (a VISIBLE sidebar at 390 is the finding
   class; a HIDDEN hamburger is the same class), the drawer-nav-scroll
   family, the budget families (longTaskTotal 1600 → finding;
   clickLatencyMs 1600 → finding; the boundary values 1500 → green), the
   structural families (drawerClosed=false → finding; appBar=false →
   finding; headingClearance=false → finding), the flashbulb family (one
   entry → finding, always), the unreadable exemption family (the CTA-face
   exempt + the strictness negative: a slate-100 unreadable entry counts;
   the light-exemptions-do-NOT-apply pin: a slate-300 calendar-day signature
   COUNTS in dark — the re-theme doctrine), the WARN family, the S13 B1
   API-bound family (512,000 bytes → finding; the boundary 500,000 green),
   the drawer-error family, the drawer link-census family (linkCount 19 →
   finding), the independent-counting family, the unknown-audit guard (the
   audit name is unknown to the CURRENT seam → the RED step; GREEN after).

### S44-B (HIGH) — the probe: `scripts/accent-volume-dark-mobile-sweep.mjs`

The S43 probe model (the volume lifecycle, the API stats, the MEASURE block,
the finally-race fix, the AP-85 flush-callback exit, the precondition-throw
doctrine) with the S40 drawer-vehicle lifecycle (the open → pendingView read →
click → close → render path, the headingClearance, the appBar, the
DRAWER_CHECKER) and the S42 dark checker family folded in:

1. **The volume lifecycle (Prisma)**: pre-clean any `STRESS-S44-` marker rows
   (idempotent), insert the S13 profile (300 tasks — 100 today/MyDay, 100
   overdue, 100 future; 200 notes with pinned rows; 250 events over the
   7-day window — the S13/S42/S43 datatypes verbatim), then **verify the
   counts through Prisma** (`count` === 300/200/250) — a mismatch fails
   LOUDLY (exit 1, no findings measured). Cleanup in the pre-exit block
   (deleteMany by prefix — idempotent).
2. **The preconditions**: the viewport on BOTH axes; DARK mode through the
   REAL lifecycle (PATCH `themeMode: "dark"` + the `html.dark` wait — itself
   post-hydration, the S42 note); the MOBILE chrome contract (the sidebar
   hidden + the hamburger visible — a broken lg contract aborts loudly); the
   accent per pass (PATCH + self-verify `data-accent` + `html.dark` + the
   shell-presence guard folded into the wait — `!!document.querySelector(
   "header")` at mobile, the AP-90 lesson applied to the mobile vehicle: the
   hamburger/app bar is the post-mount observable at 390).
3. **The drawer-own nav-scroll contract** (re-measured per accent at the
   first drawer open): at 844 height the 20 nav rows (scrollHeight 1068)
   cannot fit the nav area — the nav MUST be scrollable; a non-scrolling
   reading is a finding (the S35/S41 pattern applied to the mobile vehicle).
4. **The sweep**: 7 accents × the 7 volume views, navigated THROUGH THE
   DRAWER (the click doubles as the B2 measurement: `clickLatencyMs` = the
   elapsed from the drawer-link click to the identity heading visible — the
   drawer-close + view-mount + heading-render path). Per view: the heading
   (h1 OR h2 — the S8-H two-pane stacking) + `headingClearance` (the heading
   top ≥ 64 − 1) + `drawerClosed` + `appBar` (brand + the 2-digit-hour
   clock) + `scrollWidth` ≤ 390 + the active-tint interaction evidence (the
   S40 pendingView pattern: each drawer open reads the PREVIOUS view's
   active link — the label must equal the view, the tint must be a
   linear-gradient) + the DARK checker (flashbulb + unreadable + lowcontrast
   over `main *, aside *, header *, [role=dialog] *` — the display:none
   guard handles the hidden desktop sidebar) + the S13 measure (DOM census,
   the 1.5 s long-task window) + the console errors with the 429-RUM
   exact-text filter.
5. **The drawer record per accent** (the drawer-scoped DARK checker on the
   final navigated view — the open drawer's own rendering: the
   dark:bg-slate-950 panel, the nav links, the active-link tint) + the
   link-census === 20.
6. **The API stats** (once, theme-invariant): `/api/tasks`, `/api/notes`,
   `/api/events` — payload bytes + latency inside the page context; the
   `/api/tasks` bytes > 500 KB bound rides the findings (the S13 B1 class).
7. **The closing restore**: light + violet, explicit + awaited + VERIFIED
   (the demo user's resting state), with the failure-path restore in the
   catch; the marker-row cleanup + browser close + Prisma disconnect ALL
   BEFORE the AP-85 flush-callback exit (`process.stdout.write(json, () =>
   process.exit(code))` — the S42/S43 finally-race fix from birth).

### S44-C (MEDIUM) — the runner: the 26th stage

`scripts/standing-suite.mjs` gains `{ name: "accent-volume-dark-mobile-sweep",
runtime: "node", timeoutMs: 25 * 60_000 }` directly after
`accent-volume-light-sweep` (the volume family together: dark desktop, light
desktop, then dark mobile) + the stage-count literals 25 → 26 (the suite now
28 rows: preflight + 26 audits + theme-restore). The 25-min budget: the S42
desktop dark half measured ~2.6 min; the mobile half carries the drawer
open/close per view (~1 s extra per view) — the same order of magnitude, the
budget keeps ~10× headroom.

### S44-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the unit-count line + the accent-volume-dark-mobile-sweep command
entry + the 26-audit suite entry), vitest.config.ts (the count + the S44 seam
note), CLAUDE.md (the count + the S44 seam note), PAD §8.1 (the
suite-verdict row + the per-file count + the Total), README.md (the badge +
the counts + the session-44 status row), omni-study_SKILL.md (the counts + any
new AP lesson the exploration surfaces).

### S44-E (MEDIUM) — the evidence + the session record

`s44-accent-volume-dark-mobile-sweep-evidence.json` (the validation suite's 28
rows), the evidence screenshot
(`s44-accent-volume-dark-mobile-teal-tasks-390.png` — the Tasks view at 300
rows in DARK under TEAL at 390×844 with the drawer OPEN on the navigated
Tasks view showing the teal active-link gradient, the dense stacked list
rendering clean in-frame) via a capture script, the standing 31 refreshed via
`capture-studyflow.mjs` (theme restored light + verified via Prisma), the
worklog entry + the session_105 narrative + the session_106 summary.

## Non-gaps (documented, do not fix)

- **The dark × DESKTOP × volume cell** — the S42 audit's own contract (its
  seam's viewport guard reads 1280×800; this session's probe owns the mobile
  half).
- **The light × mobile × volume cell** — the mirrored light half at 390×844:
  a future cross-axis candidate (the S43 pattern of one half per session; the
  light mobile family needs the THREE light exemptions — the S37/S43 doctrine
  — not the dark family this probe carries).
- **The mid-band/landscape × volume cells** (768×1024, 844×390 × light/dark ×
  accent × volume) — future cross-axis candidates (the S43 summary's named
  family).
- **The 13 volume-invariant views** (Timetable, Assignments, Exams,
  Flashcards, Practice Tests, Study Groups, Grade Tracker, Files, Calculator,
  Math Solver, AI Assistant, Focus Timer, Settings) — they render no
  task/note/event rows; their dark × mobile coverage is the S36 seed-volume
  sweep's own contract, their accent × mobile coverage the S40 seed-volume
  contract.
- **The lowcontrast WARN family** — the S11 non-gap (2.2 ≤ contrast < 3.2) —
  WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed backpressure,
  filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3, Prisma's
  deepmerge-ts pin)** — the owner's standing open items (Docker unavailable
  in this sandbox; the patches land upstream).

## TDD order

1. The S44 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
2. `classifyAccentVolumeDarkMobileSweep` in `src/lib/suite-verdict.ts`
   (GREEN — the file, then the full unit layer 550 + ~32 = ~582).
3. `scripts/accent-volume-dark-mobile-sweep.mjs` (the exploration — the
   genuine run 1 against the dev server, AFTER the arrival suite completes:
   the volume lifecycle and the dev server are shared surfaces; the family
   validated clean BEFORE the runner integration).
4. The runner's 26th stage + the literals.
5. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
6. The gates re-run (lint, tsc, the new unit count, build, cold-db 291 e2e).
7. The evidence + the docs + the commit + the push.

## Risks

- **The drawer open/close cost at volume**: 49 navigations × (drawer open +
  link click + drawer close + render settle + checker + measure) — the S42
  desktop half measured ~2.6 min; the mobile half adds ~1 s per view (the
  drawer animation + the extra open for the pendingView read). Mitigation:
  the 25-min stage budget (~10× headroom); the exploration measures the real
  duration BEFORE the runner integration (the S38-C lesson).
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server (1.1 GB RSS) +
  the probe's chromium + the volume DOM at the narrow viewport — close every
  interactive browser session before the launch; the container ceiling is
  ~4 GB.
- **The shell-presence race at mobile** (the AP-90 lesson): the per-accent
  wait (`data-accent === accent && html.dark`) can pass at first paint via
  the theme boot script's cached accent + the S43 light-gate's mirror — the
  fix folds the shell-presence observable into the wait (the hamburger/app
  bar at mobile — `header` exists only after the auth gate mounts the
  shell).
- **The pendingView interaction read at volume**: the drawer open reads the
  active link while the previous view is active — at volume the re-open
  renders 20 links over a DOM carrying thousands of stress nodes; the read
  is scroll-independent (the active link stays in the DOM with computed
  styles — the S40 note).
- **The marker-row collision**: the standing suite's data-volume stage uses
  `STRESS-S13-`; S42 uses `STRESS-S42-`; S43 uses `STRESS-S43-`; this probe
  uses `STRESS-S44-` — no collision. The pre-clean + the pre-exit cleanup
  make partial runs idempotent.
- **The RUM budget**: 49 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text 429
  filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The arrival-suite overlap**: the S44 exploration must NOT run while the
  standing suite holds the dev server + the shared DB (the data-volume stage
  inserts its own marker rows) — the TDD unit work runs during the suite;
  the exploration runs after it completes.

## Execution log (session 105 — filled as executed)

- ARRIVAL (the re-run after a mid-session sandbox reset): the fresh clone at
  `e14be49`, the environment re-established (.env per the contract, `db/`
  seeded, `bun install`, the Playwright chromium-headless-shell v1243
  download), the **841-green baseline re-confirmed** (lint ✓ tsc ✓ 550 unit
  ✓ 20 files; build ✓; cold-`db/e2e.db` 291 e2e ✓ 4.3 min). Preflight
  GREEN; drawer check GREEN; the live 390×844 walkthrough GREEN (20 links
  in order, drawer closes on nav, the Notes active-link violet gradient on
  the inner span); reference UNCHANGED since S19–S43; copy sweep 14/20
  MATCH (the 6 data-state non-gaps). The arrival standing suite launched
  (27 rows).
- The coverage map re-verified against the standing scripts: the S13
  data-volume audit runs 1280×800 light+violet (zero theme references); the
  four mobile-vehicle sweeps (S33/S34/S35/S36) + the three accent-mobile
  sweeps (S37/S39/S40) carry ZERO volume lifecycle (no STRESS markers, no
  countMany, no prisma inserts); the S42/S43 volume sweeps run 1280×800
  only (their VIEWPORT constants grep-verified at W=1280/H=800). The dark ×
  mobile × volume cell is confirmed zero-coverage.
- TDD RED: 33 S44 pins in tests/suite-verdict.test.ts (the s44Envelope
  generator at 390×844 dark with the volume keys + the dark detector keys +
  the mobile structural keys + the interaction keys + the per-accent drawer
  record — the GREEN shape with the swept counts + the MODE dark note; the
  ALL-VIEWS + ALL-ACCENTS guards; the historical S13-shape envelope; the
  historical S42 DARK desktop envelope fed here → the viewport shape-error
  [the S42/S43 pair own 1280×800]; the historical S43 light desktop
  envelope fed here → the same viewport guard; the missing-volume/missing-
  drawer/missing-mode shape-errors; the wrong-viewport family [1280×800 AND
  768×1024 AND 844×390]; the mode-rot family [mode=light → non-green]; the
  volume-rot family [tasks 0 / notes 199 / events 0 → each a non-green];
  the applied-mismatch family; the MOBILE vehicle-contract family [a
  VISIBLE sidebar at 390 + a HIDDEN hamburger — the INVERSE of the desktop
  seams]; the drawer-nav-scroll family; the tint-rot family; the
  interaction family; the overflow family [scrollWidth 410 → finding]; the
  structural mobile family [drawerClosed=false + appBar=false +
  headingClearance=false → each a finding]; the S13 B3 budget family
  [longTaskTotal 1600 → finding, the boundary 1500 green]; the S13 B2
  budget family [clickLatencyMs 1600 → finding, the boundary 1500 green];
  the strict-record families [missing longTaskTotal/clickLatencyMs]; the
  flashbulb family [one entry → finding, ALWAYS]; the independent-counting
  family; the CTA-face exemption family with a strictness negative; the
  light-exemptions-do-NOT-apply family [a slate-300 calendar-day signature
  COUNTS in dark + a yellow-500 pill signature COUNTS — the re-theme
  doctrine]; the WARN family; the drawer-error family; the drawer
  link-census family [linkCount 19 → finding]; the S13 B1 API-bound family
  [512,000 bytes → finding, the boundary 500,000 green]; the unknown-audit
  guard) → **19 failed / 280 passed** under the current seam (the audit
  name unknown to it; the 14 shape-error pins passed vacuously through the
  unknown-audit path — documented).
- TDD GREEN: the seam implementation `classifyAccentVolumeDarkMobileSweep`
  (the AUDIT_NAMES entry + the dispatch arm + the classifier: the mode rot
  guard [mode ≠ dark → non-green — the light × mobile × volume family is
  the documented future cross-axis candidate], the volume-EXACT guard
  [300/200/250], the ALL-ACCENTS + ALL-VIEWS guards [the 7 volume-affected
  views, display-label convention], the MOBILE vehicle contract INVERTED
  [sidebarVisible MUST be false + hamburgerVisible MUST be true — the
  drawer is the only vehicle below 1024] + the drawer-own scroll contract
  [the nav MUST scroll at 844 height], the per-accent applied
  self-verification, the drawer link census, the interaction classes in
  DARK at MOBILE at volume [the tint rot + the active-state mismatch], the
  structural mobile family at volume [the stuck drawer + the missing app
  bar + the heading-clearance breach], the S13 B2/B3 volume budgets with
  boundary-exact pins, the DARK detector family [flashbulbs ALWAYS
  findings; unreadable counting with the CTA-face exemption ONLY — the
  light-mode calendar-day + yellow-pill exemptions do NOT apply in dark,
  those surfaces re-theme; lowcontrast WARN], the /api/tasks ≤ 500KB B1
  bound) → **299/299 in the file; the full unit layer 583** (550 + 33).
  lint ✓ tsc ✓.
- The probe `scripts/accent-volume-dark-mobile-sweep.mjs`: the S43 volume
  lifecycle model (the COUNT-verified 300/200/250 insert, the marker
  `STRESS-S44-`, the API stats, the MEASURE block, the finally-race fix —
  the cleanup + browser close + Prisma disconnect ALL complete BEFORE the
  AP-85 flush-callback exit, the precondition fail() THROWS) + the S40
  drawer-vehicle lifecycle (the open → pendingView read → click → close →
  render path, the headingClearance, the appBar, the DRAWER_CHECKER with
  the dark family) + the S42 dark checker verbatim (flashbulb + unreadable
  + lowcontrast over main/aside/header/dialog) + the shell-presence guard
  folded into the per-accent wait (`!!document.querySelector("header")` —
  the AP-90 lesson applied to the mobile vehicle: the app bar is the
  post-mount observable at 390) + the MOBILE chrome contract + the
  drawer-own nav-scroll contract re-measured per accent.
- The runner: the 26th audit stage `{ accent-volume-dark-mobile-sweep,
  timeoutMs: 25 min }` directly after accent-volume-light-sweep (the
  volume family together: dark desktop, light desktop, then dark mobile) +
  the stage-count literals 25 → 26 + the header comment — the suite now 28
  rows.
- The evidence capture script `scripts/capture-s44-evidence.mjs` (the S43
  pattern mirrored: the Tasks view at 300 rows in DARK under TEAL at
  390×844 with the drawer OPEN on the navigated Tasks view showing the
  teal active-link gradient, the in-frame verification incl. the dark-mode
  flashbulb + unreadable probes with the CTA-face exemption).
- Docs aligned (the AP-74 guard): AGENTS.md (the 583 line + the
  accent-volume-dark-mobile-sweep command entry + the 26-audit suite
  entry), vitest.config.ts (583), CLAUDE.md (583 + the S44 seam note), PAD
  §8.1 (the S44 classifier extension + the per-file count 266 → 299 + Total
  874/583), README (the 874 badge + the 583 lines ×2 + the session-44
  status row), SKILL.md (the 874/583 counts ×2).
- **The arrival standing suite read 27/27 GREEN** (the in-flight 25-stage
  version loaded at launch — the documented S43 pattern; every stage green
  incl. the S43 accent-volume-light-sweep row; the theme-restore closing
  guard light/violet).
- **The exploration (the genuine run 1): EXIT 0, findings 0, ~2.9 min
  measured** (~8.7× headroom under the 25-min budget). The envelope: 49
  renderings + 7 drawer records under the COUNT-verified 300/200/250
  profile; the interaction GREEN (activeLabel === the view on all 49 via
  the pendingView pattern; activeTint a linear-gradient on all 49 — 7
  DISTINCT accent-correct NAV_ACTIVE_GRADIENT_STOPS pairs — the dark ×
  mobile × volume cell closed); the MOBILE vehicle contract holds
  (sidebarVisible=false + hamburgerVisible=true + drawerNavScrollable=true
  — the nav scroll geometry confirmed at 844 height); the budgets hold
  with huge headroom (max clickLatency 708ms vs the 1500ms budget over
  the drawer-close + view-mount path; max longTaskTotal 0ms); the density
  real (Tasks 7,894 mainNodes / My Day 3,381 / Events 3,133 / Notes 2,430
  — the Tasks density identical to the desktop halves, deterministic;
  141,463 total nodes); zero flashbulbs across all 49 (the dark doctrine
  at the mobile layout); 2 CTA-face exempt (the S11 family-2 non-gap —
  the only unreadable entries); 32 lowcontrast WARN (the S11 non-gap
  family); the API stats /api/tasks 112,960 bytes @ 38ms (the B1 bound
  holds) + /api/notes 77,410 @ 56ms + /api/events 79,952 @ 26ms; the
  drawer link census 20/20 per accent; the cleanup deleted the
  300/200/250 marker rows. **The genuine envelope classified GREEN at the
  new seam on the FIRST try** (via a temporary vitest harness — deleted
  after, the S42/S43 convention).
- The validation protocol launched (the S32 differential: dev server
  restarted by PID, preflight GREEN, the fresh clean window): the 28-row
  suite (the current 26-stage runner, the new stage 20 directly after
  accent-volume-light-sweep).
- **The validation run: 28/28 GREEN, exit 0** (the S32 differential) — the
  new accent-volume-dark-mobile-sweep row GREEN inside the suite on its
  FIRST integration run (identical counts to the exploration —
  deterministic), every other stage green, the theme-restore closing guard
  light/violet (verified via the DB directly as well). The evidence
  envelope docs/screenshots/s44-accent-volume-dark-mobile-sweep-evidence.json
  (28 stage rows).
- Gates re-run: lint ✓ tsc ✓ **583 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ (4.4 min) = **874 green** (was 841; +33 unit pins; the 291
  prior pins untouched by construction — zero app code, zero CSS, zero
  Tailwind v4 surface, zero parity-pinned bytes).
- The evidence: the S44 screenshot
  docs/screenshots/s44-accent-volume-dark-mobile-teal-tasks-390.png (the
  Tasks view at 300 rows in DARK under TEAL at 390×844 with the drawer
  OPEN on the navigated Tasks view — the teal gradient on the active link,
  linkCount 20, mainNodes 7,894, 964 stress-row surfaces, zero flashbulbs,
  zero non-exempt unreadable, scrollWidth 390, the click latency 982ms —
  all verified in-frame) + the standing 31 refreshed (the theme restored
  light/violet, verified via Prisma).
- No new AP lesson: the probe was born with the S42/S43 guards folded in
  and the exploration read GREEN on the first try.
