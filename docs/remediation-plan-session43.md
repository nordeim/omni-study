# Remediation Plan — Session 43 (S43): the volume × LIGHT family — the S13 volume profile swept through the theme space's light-accent half (1280×800, navigated through the sidebar), as a standing, executable guarantee

**Audit surfaces (this session, session-100/101 workspace run at `386e363`):** the
baseline gates re-confirmed the documented **809-green** state on arrival (lint
✓ tsc ✓ **518 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.4 min**), the S31 preflight ran GREEN before the checks,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → the active link "Notes" with the violet
NAV_ACTIVE_GRADIENT_STOPS gradient after drawer navigation → drawer closes on
navigation — **the mobile navigation menu is working as expected**), and the
reference re-sweep: **UNCHANGED since S19–S42** (login title "AcademiaFlow
(Copy)"; the zero-data dashboard with the greeting from the email prefix "Good
morning, sepnetflix2023 👋"; the same 20 nav views in the same order; the same
five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications). The
20-view copy sweep (the `:3200` standalone server on `db/custom.db`):
**14/20 MATCH** with the 6 diffs all data-state (the documented S17-pinned
non-gap family). The S42 one-command standing suite result is recorded in the
execution log below.

## The governing finding (this session's work)

**The volume × LIGHT family is the documented bracketed non-gap — and it is
still zero-coverage: the S13 data-volume audit (300 tasks / 200 notes / 250
events) runs in LIGHT mode + VIOLET only with ZERO theme references (verified
by grep again this session), the S37–S41 light-accent sweeps run at SEED
volume (verified: no STRESS markers, no countMany, no prisma inserts in any
of the four light probes), and the S42 accent-volume-sweep runs in DARK only
(its own seam reads `mode !== "dark"` as the rot class — its name is the
blind spot).** So the cross-axis cell **light × accent × volume** is
ZERO-coverage at every one of the 7 accents — the theme-space × volume matrix
is half-closed: dark × accent × volume swept (S42), light × accent × volume
never. The S42 summary's own first named next candidate.

The four gaps that ride in that one sentence (the S42 family, mirrored onto
the light half):

1. **The contrast gap**: the light-mode detector family (unreadable < 2.2
   with the THREE signature-strict light exemptions + lowcontrast < 3.2 WARN)
   has never run over the DENSE renderings at ANY accent: the 300-row Tasks
   list (75 high-priority pills — the yellow-pill exemption family at
   DENSITY, 60 completed strikethroughs, the My Day chip column), the
   250-event terminal panel, the 200-note list with pinned rows, the
   Dashboard's volume-swollen Today's Tasks / upcoming lists, the Analytics
   charts over 300+ rows. In light mode the calendar adjacent-month days and
   the yellow priority pills ARE the reference's own design (they re-theme in
   dark — which is why the dark seam exempts ONLY the CTA-face); at volume
   these families render at 5–10× their seed density, and a NON-exempt
   contrast defect that fires once per row would be systematic here while
   invisible at seed.
2. **The performance gap**: the S13 volume budgets (long tasks ≤ 1.5 s per
   view, click→heading ≤ 1.5 s, the /api/tasks ≤ 500 KB bound) have never
   been measured under an accent variation in LIGHT. The theme lifecycle
   re-applies 15 CSS vars to `<html>` per accent — at volume that cost rides
   the same main thread that renders 300 rows. S42 proved the budgets hold in
   dark; the light half is a separate rendering path (white cards on the
   light canvas gradient — the dark family's surface inversion).
3. **The interaction gap (the light × volume cell)**: the SIDEBAR's
   active-link tint has been read through the real navigation lifecycle in
   LIGHT at SEED volume only (S41, 140 readings) and in DARK at volume (S42,
   49 readings) — the light × volume cell is zero-coverage. The tint must
   resolve the accent-correct NAV_ACTIVE_GRADIENT_STOPS pair while the DOM
   carries 8,000+ nodes.
4. **The volume self-verification gap (the S42 doctrine, applied from
   birth)**: the sweep must COUNT-verify the 300/200/250 marker rows through
   Prisma BEFORE measuring — a sweep that silently measured seed volume must
   never read green-by-omission.

**The companion finding (the anti-phantom doctrine, AP-83):** the light probe
is born with the full S42 envelope guard set — ALL-ACCENTS + ALL-VIEWS (the
7-volume-view set) + volume-counts-exact + the applied self-verification +
viewport + mode contracts — because the coverage IS the guarantee.

## Families and fixes

### S43-A (HIGH) — the seam `classifyAccentVolumeLightSweep` + the unit pins

The seam (`src/lib/suite-verdict.ts`) gains, in the S37–S42 doctrine shape
(the S42 classifier as the direct model, the LIGHT family folded in):

1. **The AUDIT_NAMES entry** `accent-volume-light-sweep` + the dispatch arm.
2. **The envelope metadata shape**: `mode` (string — shape-error if missing;
   `mode !== "light"` reads NON-green, the S27 rot-guard family INVERTED —
   the DARK half is the S42 audit's own contract), `viewport` (exactly
   `{width: 1280, height: 800}` on BOTH axes — the S13 audit's own viewport;
   a 390/768/844 envelope fed here is a shape-error), `volume`
   (`{tasks: 300, notes: 200, events: 250}` EXACTLY — the S13 profile; a
   seed-volume envelope is its own rot class), `chrome` (`sidebarVisible:
   true` + `hamburgerVisible: false` + `sidebarNavScrollable: true` — the
   S41/S42 INVERTED vehicle contract + the sidebar-own scroll contract).
3. **The ALL-ACCENTS guard**: every one of the 7 accents must carry a record.
4. **The ALL-VIEWS guard** (the 7 display labels Dashboard, My Day, Tasks,
   Calendar, Events, Notes, Analytics — the S13 volume-affected set; the
   other 13 views are volume-invariant and stay covered by the S38/S41 seed
   sweeps): every accent's view map must carry all 7.
5. **The per-view record shape**: `heading`, `scrollWidth`, `sidebarVisible`,
   `headingOffset`, `unreadable` / `lowcontrast` (Arrays — the LIGHT detector
   family), `consoleErrors` (Array), `activeTint` + `activeLabel` (strings —
   the light × volume interaction evidence), AND the volume contracts:
   `nodes`, `mainNodes`, `longTaskTotal`, `clickLatencyMs` — **NO `flashbulbs`
   key** (the light family's own shape, the S37/S39/S40/S41 convention: the
   flashbulb class — a light surface on the dark canvas — exists only in
   dark; in light mode light surfaces are by-design).
6. **The sidebar record** per accent (`linkCount` + `unreadable` +
   `lowcontrast` + `activeView` + `activeTint`, `error?` — an error string is
   a FINDING, never a swallow).
7. **The finding classes the seam owns** (counted independently of the
   findings array, the anti-phantom doctrine):
   - mode rot / viewport rot / volume rot (the three metadata contracts)
   - the INVERTED chrome vehicle contract + the sidebar-own scroll contract
   - applied-mismatch (per accent — the self-verified `<html data-accent>`)
   - the volume budgets: `longTaskTotal > 1500` per view (the S13 B3 class)
     and `clickLatencyMs > 1500` per view (the S13 B2 class; the boundary
     value 1500 stays green on both)
   - the tint rot (`activeTint` "none"/empty — the S8 no-var class) and the
     active-state mismatch (`activeLabel` ≠ the view)
   - overflow (`scrollWidth > 1280`) and console errors
   - the API payload bound (the S13 B1 class): `api."/api/tasks".bytes >
     500_000`
   - unreadable non-exempt with the **THREE light exemptions**, each
     SIGNATURE-STRICT (the S37/S41 doctrine):
     (a) the CTA-face — white `rgb(255, 255, 255)` on accent-500 (the S11
         family-2 non-gap);
     (b) the calendar adjacent-month day numbers — slate-300
         `rgb(203, 213, 225)`, 1–2 digit text (the S6-G reference-measured
         pin);
     (c) the yellow priority-pill text — yellow-500 `rgb(234, 179, 8)` on
         the yellow-50 pill, the {high, medium, low} vocabulary (the S6/S8
         reference-measured pin).
     Any OTHER unreadable combination is a genuine finding (counted) — with a
     strictness negative pin per family (the exempt signature with a mutated
     color or text still counts).
   - lowcontrast < 3.2 = WARN (the S11 non-gap family — rides the note,
     never the findings).
8. **TDD**: ~30 unit pins in `tests/suite-verdict.test.ts` — the
   s43Envelope generator (the GREEN shape at 1280×800 light with the volume
   keys + the 7-view × 7-accent matrix, NO flashbulbs keys), the historical
   pre-S43 shapes (the S13 data-volume envelope's flat findings/nonGaps
   shape; the S42 DARK envelope fed here = the mode rot non-green), the
   missing-key/missing-accent/missing-view shape-error families, the
   mode-rot family (mode=dark → non-green), the viewport-rot family
   (390×844 AND 768×1024 AND 844×390), the volume-rot family (tasks 0 /
   notes 199 / events 0 → each a non-green), the chrome family, the budget
   families (longTaskTotal 1600 → finding; clickLatencyMs 1600 → finding;
   the boundary values 1500 → green), the unreadable exemption families (all
   three exempt signatures green + the strictness negatives: a slate-400
   numeric entry counts, a yellow-400 "high" counts, a non-white CTA-face
   mutation counts), the dark-exemptions-do-NOT-apply... inverted: this seam
   OWNS the three light exemptions, the WARN family, the S13 B1 API-bound
   family (512,000 bytes → finding; the boundary 500,000 green), the
   sidebar-error family, the sidebar link-census family (linkCount 19 →
   finding), the tint-rot + active-mismatch families, the overflow family,
   the unknown-audit guard (the audit name is unknown to the CURRENT seam →
   the RED step; GREEN after).

### S43-B (HIGH) — the probe: `scripts/accent-volume-light-sweep.mjs`

The S42 probe model (the sidebar vehicle, the per-view interaction reads, the
self-verifying preconditions, the COUNT-verified volume lifecycle, the
finally-race fix, the AP-85 flush-callback exit from birth) with the LIGHT
checker family (the S41 accent-desktop-sweep's light detector — NO flashbulb
detection) folded in:

1. **The volume lifecycle (Prisma)**: pre-clean any `STRESS-S43-` marker rows
   (idempotent), insert the S13 profile (300 tasks — 100 today/MyDay, 100
   overdue, 100 future; 200 notes with pinned rows; 250 events over the
   7-day window — the S13/S42 datatypes verbatim), then **verify the counts
   through Prisma** (`countMany` === 300/200/250) — a mismatch fails LOUDLY
   (exit 1, no findings measured). Cleanup in the pre-exit block
   (deleteMany by prefix — idempotent).
2. **The preconditions**: the viewport on BOTH axes; LIGHT mode through the
   REAL lifecycle (PATCH `themeMode: "light"` + the applied self-verification
   on `!html.dark`); the INVERTED chrome contract (the S41
   `getClientRects().length > 0` check for the fixed sidebar;
   `offsetParent` for the hamburger); the accent per pass (PATCH +
   self-verify `data-accent` + `!dark`).
3. **The sweep**: 7 accents × the 7 volume views, navigated THROUGH THE
   SIDEBAR (the click doubles as the B2 measurement: `clickLatencyMs` = the
   elapsed from the link click to the identity heading visible). Per view:
   the heading + `headingOffset` + `sidebarVisible` + `scrollWidth` +
   `activeTint`/`activeLabel` (read DIRECTLY while the view is active — the
   light × volume interaction cell) + the LIGHT checker
   (unreadable/lowcontrast over `main *, aside *, header *, [role=dialog]
   *` — NO flashbulbs) + the S13 measure (DOM census, the 1.5 s long-task
   window) + the console errors with the 429-RUM exact-text filter.
4. **The sidebar record** per accent (the aside-scoped light checker on the
   final navigated view) + the per-accent sidebar-own nav-scroll re-measure
   (the S41/S42 pattern).
5. **The API stats** (once, theme-invariant): `/api/tasks`, `/api/notes`,
   `/api/events` — payload bytes + latency inside the page context; the
   `/api/tasks` bytes > 500 KB bound rides the findings (the S13 B1 class).
6. **The closing restore**: light + violet, explicit + awaited + VERIFIED
   (the demo user's resting state), with the failure-path restore in the
   catch; the marker-row cleanup + browser close + Prisma disconnect ALL
   BEFORE the AP-85 flush-callback exit (`process.stdout.write(json, () =>
   process.exit(code))` — the S42 finally-race fix from birth).

### S43-C (MEDIUM) — the runner: the 25th stage

`scripts/standing-suite.mjs` gains `{ name: "accent-volume-light-sweep",
runtime: "node", timeoutMs: 25 * 60_000 }` directly after
`accent-volume-sweep` (the volume family together: dark then light) + the
stage-count literals 24 → 25 (the suite now 27 rows: preflight + 25 audits +
theme-restore). The 25-min budget: the S42 volume precedent (~2.6 min
measured for the dark half; the light half carries the same checker cost).

### S43-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the unit-count line + the accent-volume-light-sweep command entry
+ the 25-audit suite entry), vitest.config.ts (the count + the S43 seam
note), CLAUDE.md (the count + the S43 seam note), PAD §8.1 (the
suite-verdict row + the per-file count + the Total), README.md (the badge +
the counts + the session-43 status row), omni-study_SKILL.md (the counts +
the AP-89 lesson if the exploration surfaces one).

### S43-E (MEDIUM) — the evidence + the session record

`s43-accent-volume-light-sweep-evidence.json` (the validation suite's 27
rows), the evidence screenshot
(`s43-accent-volume-light-teal-tasks-1280.png` — the Tasks view at 300 rows
in LIGHT under TEAL at 1280×800 with the sidebar's active link on the
navigated Tasks view + the dense list rendering clean) via a capture script,
the standing 31 refreshed via `capture-studyflow.mjs` (theme restored light +
verified via Prisma), the worklog entry + the session_102 narrative + the
session_103 summary.

## Non-gaps (documented, do not fix)

- **The dark × accent × volume cell** — the S42 audit's own contract (its
  seam's mode guard reads dark; this session's probe owns the light half).
- **The 13 volume-invariant views** (Timetable, Assignments, Exams,
  Flashcards, Practice Tests, Study Groups, Grade Tracker, Files, Calculator,
  Math Solver, AI Assistant, Focus Timer, Settings) — they render no
  task/note/event rows; their light × accent coverage is the S41 seed-volume
  matrix's own contract.
- **The mobile/mid-band/landscape × volume cells** (390/768/844 × light/dark
  × accent × volume) — future cross-axis candidates (the S42 summary's named
  next-step family; the desktop viewport is the S13 audit's own and this
  session stays on it).
- **The lowcontrast WARN family** — the S11 non-gap (accent-600 text on the
  canvas, 2.2 ≤ contrast < 3.2) — WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed backpressure,
  filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3, Prisma's
  deepmerge-ts pin)** — the owner's standing open items (Docker unavailable
  in this sandbox; the patches land upstream).

## TDD order

1. The S43 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
2. `classifyAccentVolumeLightSweep` in `src/lib/suite-verdict.ts` (GREEN —
   the file, then the full unit layer 518 + ~30 = ~548).
3. `scripts/accent-volume-light-sweep.mjs` (the exploration — the genuine
   run 1 against the dev server, AFTER the arrival suite completes: the
   volume lifecycle and the dev server are shared surfaces; the family
   validated clean BEFORE the runner integration).
4. The runner's 25th stage + the literals.
5. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
6. The gates re-run (lint, tsc, the new unit count, build, cold-db 291 e2e).
7. The evidence + the docs + the commit + the push.

## Risks

- **The checker's cost at volume**: the light checker iterates every
  `main/aside/header/dialog` element — at 300 rows (4,000–8,000 nodes) the
  S42 dark half measured ~2.6 min for the whole sweep; the light half
  carries the same cost. Mitigation: the 25-min stage budget; the checker's
  entry caps (12 unreadable / 14 lowcontrast) bound the arrays; the
  exploration measures the real duration BEFORE the runner integration (the
  S38-C lesson).
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server (1.1 GB RSS)
  + the probe's chromium + the volume DOM — close every interactive browser
  session before the launch; the container ceiling is 3.9 GB.
- **The yellow-pill/calendar-day exemption density**: at 300 rows the Tasks
  list carries ~75 high-priority pills; the exemption counting is
  SIGNATURE-STRICT (the exact yellow-500 color + the exact vocabulary), so a
  drift in the pill design at volume still counts — the strictness negative
  pins hold the line.
- **The marker-row collision**: the standing suite's data-volume stage uses
  `STRESS-S13-`; the S42 probe uses `STRESS-S42-`; this probe uses
  `STRESS-S43-` — no collision. The pre-clean + the pre-exit cleanup make
  partial runs idempotent.
- **The RUM budget**: 49 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text 429
  filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The arrival-suite overlap**: the S43 exploration must NOT run while the
  standing suite holds the dev server + the shared DB (the data-volume stage
  inserts its own marker rows) — the TDD unit work runs during the suite;
  the exploration runs after it completes.

## Execution log (session 102 — filled as executed)

- ARRIVAL: the 809-green baseline re-confirmed (lint ✓ tsc ✓ 518 unit ✓
  20 files; build ✓; cold-`db/e2e.db` 291 e2e ✓ 4.4 min). Preflight GREEN;
  drawer check GREEN; the live 390×844 walkthrough GREEN (20 links in
  order, drawer closes on nav, the Notes active-link violet gradient —
  read on the inner span, the correct surface); reference UNCHANGED since
  S19–S42; copy sweep 14/20 MATCH (the 6 data-state non-gaps). The arrival
  standing suite launched (26 rows, the in-flight run holding the 24-stage
  version loaded at launch).
- The coverage map re-verified against the standing scripts: the S13
  data-volume audit carries ZERO theme references (`grep -c "themeMode\|
  accentColor\|sf-primary\|dark"` → 0); the four light accent sweeps
  (S37/S39/S40/S41) carry ZERO volume lifecycle (no STRESS markers, no
  countMany, no prisma inserts — the "300" grep hits are wait/timeout
  constants); the S42 seam's own mode guard reads dark (its name is the
  blind spot). The light × accent × volume cell is confirmed
  zero-coverage.
- TDD RED: 32 S43 pins in tests/suite-verdict.test.ts (the s43Envelope
  generator at 1280×800 light with the volume keys + the light detector
  keys + the interaction keys + the api record — NO flashbulbs keys; the
  GREEN shape with the swept counts + the MODE light note; the ALL-VIEWS +
  ALL-ACCENTS guards; the historical S13-shape envelope; the historical
  S42 DARK envelope fed here → the mode rot non-green [the inverted
  guard]; the missing-volume/missing-sidebar/missing-mode shape-errors;
  the wrong-viewport family [390×844 AND 768×1024 AND 844×390]; the
  mode-rot family [mode=dark → non-green]; the volume-rot family [tasks 0
  / notes 199 / events 0 → each a non-green]; the applied-mismatch family;
  the INVERTED vehicle-contract family; the scroll-contract family; the
  tint-rot family; the interaction family; the overflow family; the S13 B3
  budget family [longTaskTotal 1600 → finding, the boundary 1500 green];
  the S13 B2 budget family [clickLatencyMs 1600 → finding, the boundary
  1500 green]; the strict-record families incl. the missing
  longTaskTotal/clickLatencyMs; the LIGHT-shape-carries-no-flashbulbs
  family [the sibling S42 envelope with mode=light reads GREEN here — the
  dark-only keys are ignored]; the sidebar-error family; the sidebar
  link-census family [linkCount 19 → finding]; the independent-counting
  family; the CTA-face exemption family with a strictness negative; the
  calendar adjacent-day exemption family with a strictness negative [a
  slate-300 NON-numeric text counts]; the yellow-pill exemption family
  with TWO strictness negatives [a yellow-400 "high" counts; a yellow-500
  "urgent" counts]; the WARN family; the S13 B1 API-bound family [512,000
  bytes → finding, the boundary 500,000 green]; the unknown-audit guard)
  → **20 failed / 246 passed** under the current seam (the audit name
  unknown to it; the 12 shape-error pins passed vacuously through the
  unknown-audit path — documented).
- TDD GREEN: the seam implementation `classifyAccentVolumeLightSweep`
  (the AUDIT_NAMES entry + the dispatch arm + the classifier: the mode rot
  guard INVERTED [mode ≠ light → non-green — the dark half is the S42
  audit's contract], the volume-EXACT guard [300/200/250], the ALL-ACCENTS
  + ALL-VIEWS guards [the 7 volume-affected views, display-label
  convention], the INVERTED chrome contract + the sidebar-own scroll
  contract, the per-accent applied self-verification, the sidebar link
  census, the interaction classes in LIGHT at volume [the tint rot + the
  active-state mismatch — the light × volume cell], the S13 B2/B3 volume
  budgets with boundary-exact pins, the LIGHT detector family [NO
  flashbulb class; unreadable counting with the THREE signature-strict
  light exemptions — the CTA-face + the calendar adjacent-month slate-300
  days + the yellow-500 priority-pill vocabulary; lowcontrast WARN], the
  /api/tasks ≤ 500KB B1 bound) → **266/266 in the file; the full unit
  layer 550** (518 + 32). lint ✓ tsc ✓.
- The probe `scripts/accent-volume-light-sweep.mjs`: the S42 model (the
  sidebar vehicle, the per-view interaction reads, the self-verifying
  preconditions, the COUNT-verified volume lifecycle, the finally-race fix
  — the cleanup + browser close + Prisma disconnect ALL complete BEFORE
  the AP-85 flush-callback exit, the precondition fail() THROWS) + the
  S41 LIGHT checker verbatim (unreadable/lowcontrast — no flashbulbs) +
  the marker `STRESS-S43-` (no collision with S13/S42) + the THREE light
  exemptions mirrored in the exit-code computation.
- The runner: the 25th audit stage `{ accent-volume-light-sweep,
  timeoutMs: 25 min }` directly after accent-volume-sweep (the volume
  family together: dark then light) + the stage-count literals + the
  header comment — the suite now 27 rows.
- The evidence capture script `scripts/capture-s43-evidence.mjs`
  (the S42 pattern mirrored: the Tasks view at 300 rows in LIGHT under
  TEAL at 1280×800 with the sidebar's active link, the in-frame
  verification incl. the light-mode unreadable probe with the three
  exemptions).
- Docs aligned (the AP-74 guard): AGENTS.md (the 550 line + the
  accent-volume-light-sweep command entry + the 25-audit suite entry +
  the stage enumeration), vitest.config.ts (550), CLAUDE.md (550 + the
  S43 seam note), PAD §8.1 (the S43 classifier extension + the per-file
  count 234 → 266 + Total 841/550), README (the 841 badge + the 550
  lines ×2 + the session-43 status row), SKILL.md (the 841/550 counts ×2
  + AP-89 — a mode half swept does not transfer its proof to the sibling
  mode: each mode owns its own exemption families, its own detector
  classes, and its own rendering path).
- **The arrival suite read 25/26** — the accent-light-sweep stage exited
  1 mid-sweep: "page.evaluate: Target crashed" (the page renderer died —
  the S41-documented environmental OOM class, not a code finding). The
  remedy per the S41 doctrine: the dev server restarted by PID, the
  failed probe re-run standalone → **deterministic-clean (exit 0,
  findings 0)**. The loud-failure doctrine worked as designed.
- **The exploration's own field correction (run 1 → run 2)**: the first
  run failed the INVERTED chrome precondition (sidebarVisible=false,
  hamburgerVisible=false at 1280) — the root cause: the S42 dark model's
  mode gate (`!html.dark`) is TRUE at first paint in light mode, BEFORE
  hydration + the auth gate mount the shell, so the chrome check raced
  the shell mount. The fix: the S41 light-mode gate adopted (the greeting
  heading — `main h1` renders only after the auth gate resolves and the
  shell mounts). **Run 2: EXIT 0, findings 0, ~2.6 min measured** (~10×
  headroom under the 25-min budget) — the envelope: 49 renderings + 7
  sidebar records under the COUNT-verified 300/200/250 profile; the
  interaction GREEN (activeLabel === the view on all 49; activeTint a
  gradient on all 49 — 7 DISTINCT accent-correct pairs — the light ×
  volume cell closed); the budgets hold with huge headroom (max
  clickLatency 709ms vs the 1500ms budget; max longTaskTotal 0ms); the
  density real (Tasks 8,179 nodes / My Day 3,666 / Events 3,418 / Notes
  2,715 — identical to the dark half, deterministic); 16 CTA-face + 28
  calendar-day + 14 yellow-pill exempt (the three light families — the
  yellow pills at density); 3,404 lowcontrast WARN (the S11 non-gap
  family at volume — the accent-600 text surfaces scale with row count);
  the API stats /api/tasks 112,960 bytes @ 50ms (the B1 bound holds) +
  /api/notes 77,410 @ 33ms + /api/events 79,952 @ 59ms; the sidebar link
  census 20/20 per accent. **The genuine envelope classified GREEN at
  the new seam on the FIRST try** (via a temporary vitest harness —
  deleted after, the S42 convention).
- **The validation run 1 read 26/27** — the NEW accent-volume-light-sweep
  stage exited 1 inside the suite with an empty JSON (a page.evaluate
  TypeError), reproduced standalone: `Cannot read properties of null
  (reading 'scrollHeight')` at the nav-geometry evaluate — **a genuine
  race, not environmental**: the per-accent wait (`data-accent ===
  accent && !dark`) can pass at FIRST PAINT via the theme boot script's
  CACHED accent (applied pre-hydration), while the auth gate has not yet
  mounted the shell — the immediate `aside nav` read then crashes. The
  exploration's run 2 had passed only by timing luck. **The
  shell-presence fix**: the accent gates fold `!!
  document.querySelector("aside nav")` in (the aside nav exists only
  after the shell mounts) — applied to the S43 probe AND back-ported to
  the S41 accent-desktop-sweep + the S42 accent-volume-sweep (the same
  latent race in both sidebar-vehicle siblings; the drawer-vehicle probes
  S37/S39/S40 are safe by Playwright's actionable-click auto-waiting).
  The standalone re-run post-fix: **exit 0, findings 0, identical counts
  to the exploration (deterministic — 141,463 total nodes both runs)**.
  New lesson recorded: **AP-90** (a wait condition satisfiable pre-mount
  is not a gate for post-mount reads — gate on the DOM observable you
  are about to read).
