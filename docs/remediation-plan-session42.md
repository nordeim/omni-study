# Remediation Plan — Session 42 (S42): the data-volume × dark × accent stress — the S13 volume profile swept through the theme space's dark-accent half (1280×800, navigated through the sidebar), as a standing, executable guarantee

**Audit surfaces (this session, session-97/98 workspace run at `49cc456`):** the
baseline gates re-confirmed the documented **778-green** state on arrival (lint
✓ tsc ✓ **487 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.4 min**), the S31 preflight ran GREEN before the checks,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → the active link "Notes" with the violet
NAV_ACTIVE_GRADIENT_STOPS gradient after drawer navigation → drawer closes on
navigation — **the mobile navigation menu is working as expected**), and the
reference re-sweep: **UNCHANGED since S19–S41** (login title "AcademiaFlow
(Copy)"; the zero-data dashboard with the greeting from the email prefix "Good
morning, sepnetflix2023 👋"; the same 20 nav views in the same order; the same
five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications). The
20-view copy sweep (the `:3200` standalone server on `db/custom.db`):
**14/20 MATCH** with the 6 diffs all data-state (the documented S17-pinned
non-gap family: the greeting name, the zero-data CTA/button surfaces on
MyDay/Tasks/Timetable/Flashcards, the count subtitles on Tasks/Exams). The S41
one-command standing suite result is recorded in the execution log below.

## The governing finding (this session's work)

**The data-volume axis has never crossed the theme space: the S13 volume
profile (300 tasks / 200 notes / 250 events) runs in LIGHT mode + VIOLET only,
at 1280×800, and every theme-space sweep (S27–S41) runs at SEED volume (tens
of rows) — so the densest renderings the app can produce have never carried a
theme variation, and the theme contracts have never been measured at volume.**
The S41 summary's own named next step ("the next production-readiness axes
are beyond the theme space: the data-volume × dark × accent stress"). The
coverage map, verified against the standing scripts this session:

- `data-volume-audit` (S13): inserts 300 tasks / 200 notes / 250 events via
  Prisma (marker `STRESS-S13-`), measures API payload + latency, DOM node
  counts, long tasks (1.5 s window), nav-click latency, and the Events
  terminal panel's structure across the 7 volume-affected views (Tasks,
  Dashboard, MyDay, Notes, Events, Analytics, Calendar) — **ZERO theme
  references** (`grep -n "themeMode\|accentColor\|dark\|sf-primary"` → no
  matches): it logs in, renders, and measures in whatever the demo user's
  resting theme is (light + violet), once, at 1280×800.
- `dark-sweep` (S27): all 20 views in dark — violet only, seed volume.
- `accent-dark-sweep` (S38): 7 accents × 20 views × desktop 1280×800 + mobile
  390×844 — dark, seed volume, DIRECT GOTO (never reads the sidebar's active
  link).
- `accent-light/midband/landscape/desktop` (S37/S39/S40/S41): 7 accents × 20
  views in light at 390/768/844/1280 — seed volume.
- The e2e layer: no spec renders a 300-row collection under a non-default
  theme.

So the cross-axis cell — **300+ rows × dark × accent** — is ZERO-coverage at
every one of the 7 accents. Four gaps ride in that one sentence:

1. **The contrast gap**: the dark-mode detector family (the S38 checker —
   flashbulbs + unreadable < 2.2 + lowcontrast < 3.2) has never run over the
   DENSE renderings: 300 task rows (75 high-priority pills, 60 completed
   strikethroughs, the My Day chip column), the 250-event 7-day terminal
   panel (the S13-measured ~36 rows per day section), the 200-note list with
   pinned rows, the Dashboard's volume-swollen Today's Tasks / upcoming
   lists, the Analytics charts over 300+ rows of aggregated data. Density
   multiplies the surfaces the theme touches — a contrast defect that fires
   once per row is invisible at seed volume (1–2 rows) and systematic at
   volume (300 rows).
2. **The performance gap**: the S13 volume budgets (long tasks ≤ 1.5 s per
   view, nav-click latency, payload bounds) have never been measured under a
   theme variation. The theme lifecycle re-applies 15 CSS vars + the dark
   class to `<html>` and every accent-dependent surface re-computes — at
   volume, the re-theme cost rides the same main thread that renders 300
   rows. The assumption "performance is theme-invariant" is exactly the kind
   of unproven bracket the S37–S41 doctrine exists to close.
3. **The interaction gap (the never-read dark cell)**: the SIDEBAR's
   active-link accent tint has NEVER been read through the real navigation
   lifecycle in DARK mode at ANY volume — S41 proved it in LIGHT (140
   readings), and the S41 summary's "sidebar: 1280 dark via accent-dark's
   goto pass" is a goto pass that never reads the sidebar's active link at
   all. The dark × sidebar × navigation-lifecycle cell is genuinely
   zero-coverage.
4. **The volume self-verification gap**: no standing probe asserts the rows
   it renders are actually THERE (the S13 audit inserts and assumes). An
   anti-phantom volume sweep must verify the insert counts through Prisma
   BEFORE measuring — a sweep that silently measured seed volume would read
   green-by-omission (the S38 retirement of omission-means-clean, applied to
   the volume axis).

**The companion finding (the anti-phantom doctrine, AP-83 applied):** any
future probe for this combo must be born with the S37–S41 envelope guards —
ALL-ACCENTS + ALL-VIEWS (the 7-volume-view set) + volume-counts-exact + the
applied self-verification + viewport + mode contracts — because the coverage
IS the guarantee: an envelope that records only what it touched cannot
distinguish "clean because measured" from "clean because never rendered".

## Families and fixes

### S42-A (HIGH) — the seam `classifyAccentVolumeSweep` + the unit pins

The seam (`src/lib/suite-verdict.ts`) gains, in the S37–S41 doctrine shape
(the S41 classifier as the direct model, the volume family's contracts folded
in):

1. **The AUDIT_NAMES entry** `accent-volume-sweep` + the dispatch arm.
2. **The envelope metadata shape**: `mode` (string — shape-error if missing;
   `mode !== "dark"` reads NON-green, the S27 rot-guard family — the volume ×
   LIGHT family is the documented bracketed non-gap, bracketed by the S13
   data-volume audit [light × violet × volume] + the S37–S41 light-accent
   sweeps [light × accent × seed]; the dark half is the harsher environment —
   the flashbulb class only exists in dark, and the Events terminal panel
   sits on the dark canvas), `viewport` (exactly `{width: 1280, height: 800}`
   on BOTH axes — the S13 audit's own viewport; a 390/768/844 envelope fed
   here is a shape-error), `volume` (`{tasks: 300, notes: 200, events: 250}`
   EXACTLY — the S13 profile; a seed-volume envelope [0/0/0 or missing rows]
   is its own rot class: the sweep measured the wrong density and must never
   read green), `chrome` (`sidebarVisible: true` + `hamburgerVisible: false`
   + `sidebarNavScrollable: true` — the S41 INVERTED vehicle contract + the
   sidebar-own scroll contract).
3. **The ALL-ACCENTS guard** (`ACCENT_VOLUME_ALL_ACCENTS`): every one of the
   7 accents must carry a record — an accent that silently did not run must
   never read green-by-omission.
4. **The ALL-VIEWS guard** (`ACCENT_VOLUME_ALL_VIEWS` — the 7 display labels
   Dashboard, My Day, Tasks, Calendar, Events, Notes, Analytics — the S13
   volume-affected set; the other 13 views render no task/note/event rows so
   volume cannot change them, and they stay covered by the S38/S41 seed
   sweeps): every accent's view map must carry all 7 — the omission-means-
   clean recording is RETIRED (the S38 doctrine).
5. **The per-view record shape**: `heading` (non-empty string), `scrollWidth`
   (number), `sidebarVisible` (boolean — the vehicle persists per view),
   `headingOffset` (boolean — the lg:ml-[260px] clearance), `activeTint` +
   `activeLabel` (strings — the interaction evidence in DARK, the never-read
   cell), `flashbulbs` / `unreadable` / `lowcontrast` (Arrays — the S38 dark
   detector family), `consoleErrors` (Array), AND the volume contracts:
   `nodes` (number), `mainNodes` (number), `longTaskTotal` (number), `click`
   LatencyMs` (number) — the S13 measurement family.
6. **The sidebar record** per accent (`linkCount` + `unreadable` +
   `lowcontrast` + `activeView` + `activeTint`, `error?` — an error string is
   a FINDING, never a swallow).
7. **The finding classes the seam owns** (counted independently of the
   findings array, the anti-phantom doctrine):
   - mode rot / viewport rot / volume rot (the three metadata contracts)
   - the INVERTED chrome vehicle contract + the sidebar-own scroll contract
   - applied-mismatch (per accent — the self-verified `<html data-accent>`)
   - the volume budgets: `longTaskTotal > 1500` per view (the S13 B3 class —
     main-thread blocking under stress) and `clickLatencyMs > 1500` per view
     (the S13 B2 class — nav interactivity under stress; the S13 probe's own
     800 ms budget included a fixed 400 ms settle, so the click→heading
     budget at 1500 ms catches hard blocking with 2× the headroom for the
     300-row fetch+render)
   - flashbulbs (ALWAYS findings — the dark doctrine; a light surface in
     dark mode)
   - unreadable non-exempt (the CTA-face exemption ONLY — the dark doctrine:
     white `rgb(255, 255, 255)` on accent-500 is the S11 family-2 non-gap;
     the light-mode calendar-day + yellow-pill exemptions do NOT apply — in
     dark those surfaces re-theme and any unreadable hit is genuine)
   - the tint rot (`activeTint` "none"/empty — the S8 no-var class) and the
     active-state mismatch (`activeLabel` ≠ the view — the interaction
     contract, now in DARK)
   - overflow (`scrollWidth > 1280`) and console errors (the findings array's
     `console-error` kind)
   - the API payload bound (the S13 B1 class): `api."/api/tasks".bytes >
     500_000` — the unbounded-payload guard, measured once (theme-invariant)
8. **TDD**: ~26 unit pins in `tests/suite-verdict.test.ts` — the s42Envelope
   generator (the GREEN shape at 1280×800 with the volume keys + the 7-view ×
   7-accent matrix), the historical pre-S42 shapes (an accent-dark desktop
   envelope fed here = shape-error [no volume]; a seed-volume envelope = the
   volume rot), the missing-key/missing-accent/missing-view shape-error
   families, the mode-rot family (ode=light), the viewport-rot family
   (390×844 AND 768×1024 AND 844×390), the volume-rot family (tasks 0/notes
   200/events 250 → each a non-green), the chrome family, the budget families
   (longTaskTotal 1600 → finding; clickLatencyMs 1600 → finding; the
   boundary values 1500 → green), the flashbulb family, the unreadable
   exemption family (CTA-face exempt + a strictness negative: a
   slate-on-slate unreadable entry counts), the tint-rot + active-mismatch
   families, the overflow family, the API-bound family, the sidebar-error
   family, the unknown-audit guard stays GREEN (the audit name is unknown to
   the CURRENT seam → the RED step; GREEN after).

### S42-B (HIGH) — the probe: `scripts/accent-volume-sweep.mjs`

The S41 probe model (the sidebar vehicle, the per-view interaction reads, the
self-verifying preconditions, the AP-85 flush-callback exit from birth) with
the S38 DARK checker (flashbulbs + the effectiveBg walk over `main *, aside *,
header *, [role=dialog] *`) and the S13 volume lifecycle folded in:

1. **The volume lifecycle (Prisma)**: pre-clean any `STRESS-S42-` marker rows
   (idempotent — a prior crashed run leaves rows), insert the S13 profile
   (300 tasks — 100 today/MyDay, 100 overdue, 100 future; 200 notes with
   pinned rows; 250 events spread over the 7-day window — the S13 datatypes
   verbatim), then **verify the counts through Prisma** (`countMany` ===
   300/200/250) — a mismatch fails LOUDLY (exit 1, no findings measured).
   Cleanup in the `finally` block (deleteMany by prefix — idempotent).
2. **The preconditions**: the viewport on BOTH axes; dark mode through the
   REAL lifecycle (PATCH `themeMode: "dark"` + the applied self-verification
   on `html.dark`); the INVERTED chrome contract (the S41
   `getClientRects().length > 0` check for the fixed sidebar — the
   offsetParent-null-for-fixed quirk; `offsetParent` for the hamburger);
   the accent per pass (PATCH + self-verify `data-accent`).
3. **The sweep**: 7 accents × the 7 volume views, navigated THROUGH THE
   SIDEBAR (the desktop vehicle — the click is also the interactivity
   measurement: `clickLatencyMs` = the elapsed from the link click to the
   identity heading visible). Per view: the heading + `headingOffset` +
   `sidebarVisible` + `scrollWidth` + `activeTint`/`activeLabel` (read
   DIRECTLY while the view is active — the first DARK-mode readings of the
   sidebar's active-link tint through the navigation lifecycle) + the S38
   dark checker (flashbulbs/unreadable/lowcontrast) + the S13 measure (DOM
   nodes, main nodes, the 1.5 s long-task window) + the console errors with
   the 429-RUM exact-text filter.
4. **The sidebar record** per accent (the aside-scoped checker on the final
   navigated view) + the per-accent sidebar-own nav-scroll re-measure (the
   S41 pattern).
5. **The API stats** (once, theme-invariant): `/api/tasks`, `/api/notes`,
   `/api/events` — payload bytes + latency inside the page context; the
   `/api/tasks` bytes > 500 KB bound rides the findings (the S13 B1 class).
6. **The closing restore**: light + violet, explicit + awaited + VERIFIED,
   with the failure-path restore in the catch; the marker-row cleanup in the
   finally; the AP-85 flush-callback exit (`process.stdout.write(json,
   () => process.exit(code))` — the envelope measures ~100KB+ at volume).

### S42-C (MEDIUM) — the runner: the 24th stage

`scripts/standing-suite.mjs` gains `{ name: "accent-volume-sweep", runtime:
"node", timeoutMs: 25 * 60_000 }` directly after `accent-dark-sweep` (the
dark family together: dark-sweep → accent-dark-sweep → accent-volume-sweep)
+ the stage-count literals 23 → 24 (the suite now 26 rows: preflight + 24
audits + theme-restore). The 25-min budget: the S38-C/S39/S40/S41 lesson —
the probe measures ~10–15 min (49 renderings × the volume checker's cost over
4000–8000-node DOMs) and the default 10-min budget would SIGKILL it.

### S42-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the 511 line + the accent-volume-sweep command entry + the
24-audit suite entry), vitest.config.ts (511 + the S42 seam note), CLAUDE.md
(511 + the S42 seam note), PAD §8.1 (the suite-verdict row + the per-file
count + the Total), README.md (the badge + the counts + the session-42
status row), omni-study_SKILL.md (the counts + the AP-88 lesson).

### S42-E (MEDIUM) — the evidence + the session record

`s42-accent-volume-sweep-evidence.json` (the validation suite's 26 rows),
the evidence screenshot (`s42-accent-volume-dark-teal-tasks-1280.png` — the
Tasks view at 300 rows in DARK under TEAL at 1280×800 with the sidebar's
active link on Tasks + the dense task list rendering clean) via
`scripts/capture-s42-evidence.mjs`, the standing 31 refreshed via
`capture-studyflow.mjs` (theme restored light + verified via Prisma), the
worklog entry + the session_99 narrative + the session_100 summary.

## Non-gaps (documented, do not fix)

- **The light × accent × volume cell** — bracketed by the S13 data-volume
  audit (light × violet × volume: the performance + payload contracts) and
  the S37/S39/S40/S41 light-accent sweeps (light × accent × seed: the
  contrast families). The dark half is the harsher environment (the
  flashbulb class only exists in dark; the Events terminal panel sits on
  the dark canvas). A future session may close it the S41 way.
- **The 13 volume-invariant views** (Timetable, Assignments, Exams,
  Flashcards, Practice Tests, Study Groups, Grade Tracker, Files,
  Calculator, Math Solver, AI Assistant, Focus Timer, Settings) — they
  render no task/note/event rows; their dark × accent coverage is the S38
  seed-volume matrix's own contract.
- **The dark × mobile × volume cell** — the S36 dark-mobile + S38 mobile
  passes own the mobile dark coverage at seed; the volume axis at mobile is
  a future cross-axis candidate (documented as the S42 summary's next-step
  candidate).
- **The 588–596 lowcontrast WARN family** — the S11 non-gap (accent-600
  text on the dark canvas, 2.2 ≤ contrast < 3.2) — WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed
  backpressure, filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3,
  Prisma's deepmerge-ts pin)** — the owner's standing open items (Docker
  unavailable in this sandbox; the patches land upstream).

## TDD order

1. The S42 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
2. `classifyAccentVolumeSweep` in `src/lib/suite-verdict.ts` (GREEN — the
   file, then the full unit layer 511 = 487 + ~24).
3. `scripts/accent-volume-sweep.mjs` (the exploration — the genuine run 1
   against the dev server; the family validated clean BEFORE the runner
   integration).
4. The runner's 24th stage + the literals.
5. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
6. The gates re-run (lint, tsc, 511 unit, build, cold-db 291 e2e = 799
   green projected).
7. The evidence + the docs + the commit + the push.

## Risks

- **The volume checker's cost**: the S38 checker iterates every
  `main/aside/header/dialog` element — at 300 rows (4000–8000 nodes) it may
  take 2–8 s per rendering × 49 renderings. Mitigation: the 25-min stage
  budget; the checker's existing early-exit caps (12 flashbulbs / 10
  unreadable / 14 lowcontrast) bound the entry arrays; the exploration
  measures the real duration BEFORE the runner integration (the S38-C
  lesson).
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server (1.1 GB RSS)
  + the probe's chromium + the volume DOM — close every interactive browser
  session before the launch; the container ceiling is 3.9 GB.
- **The click-latency budget calibration**: the S13 probe measured
  clickLatencyMs including a fixed 400 ms settle; this probe measures
  click→heading-visible. The exploration's measured values calibrate the
  budget (the 1500 ms default catches hard blocking with headroom; if the
  measured band runs hotter the plan documents the recalibrated constant
  BEFORE the seam ships — the seam and the probe must agree).
- **The RUM budget**: 49 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text
  429 filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The marker-row collision**: the standing suite's data-volume stage
  (stage 5) uses `STRESS-S13-`; this probe uses `STRESS-S42-` — no
  collision. The pre-clean + the finally-cleanup make partial runs
  idempotent.

## Execution log (session 99 — filled as executed)

- ARRIVAL: the 778-green baseline re-confirmed (lint ✓ tsc ✓ 487 unit ✓
  20 files; build ✓; cold-`db/e2e.db` 291 e2e ✓ 4.4 min). Preflight GREEN;
  drawer check GREEN; the live 390×844 walkthrough GREEN (20 links in
  order, drawer closes on nav, the Notes active-link violet gradient);
  reference UNCHANGED since S19–S41; copy sweep 14/20 MATCH (the 6
  data-state non-gaps). The arrival standing suite (launched before the
  runner edit — the in-flight run held the 23-stage version loaded at
  launch): **25/25 GREEN, exit 0** — zero code findings on arrival.
- TDD RED: 31 S42 pins in tests/suite-verdict.test.ts → **18 failed /
  216 passed** under the current seam (the audit name unknown to it; the
  13 shape-error pins passed vacuously through the unknown-audit path —
  documented). One test-file syntax fix on the way (an unquoted `"My
  Day"` object key — the parse error caught before any RED reading).
- TDD GREEN: the `classifyAccentVolumeSweep` seam (the AUDIT_NAMES entry +
  the dispatch arm + the classifier: the volume-EXACT guard [300/200/250 —
  the seed-volume rot class], the ALL-ACCENTS + ALL-VIEWS guards [the 7
  volume-affected views, display-label convention], the INVERTED chrome
  contract + the sidebar-own scroll contract, the per-accent applied
  self-verification, the sidebar link census [linkCount ≠ 20 its own
  finding class], the interaction classes in DARK [the tint rot + the
  active-state mismatch — the never-read cell], the S13 B2/B3 volume
  budgets [clickLatencyMs/longTaskTotal > 1500 → findings; the boundary
  1500 green], the flashbulb class [ALWAYS findings], the unreadable
  counting with the CTA-face exemption ONLY [the light-mode calendar-day +
  yellow-pill exemptions do NOT apply in dark], the /api/tasks ≤ 500KB B1
  bound) → **234/234 in the file; the full unit layer 518** (487 + 31).
  lint ✓ tsc ✓.
- The probe `scripts/accent-volume-sweep.mjs`: the S41 model + the S38
  dark checker + the S13 volume lifecycle, with the finally-race fix
  (the design correction over the S39–S41 shape: the cleanup + the
  browser close + the Prisma disconnect ALL complete BEFORE the AP-85
  flush-callback exit — a `finally` block would race the exit-carrying
  write; the precondition `fail()` now THROWS a PreconditionError so the
  catch-path restore + cleanup run for every failure class, and the
  catch itself restores + cleans + exits 1).
- The exploration (the genuine run 1, **~2.6 min measured** — ~10×
  headroom under the 25-min budget): **EXIT 0, findings 0** across 49
  renderings + 7 sidebar records. The evidence: every accent self-verified
  applied; **7 DISTINCT accent-correct NAV_ACTIVE_GRADIENT_STOPS tint
  gradients** (the never-read dark sidebar-tint cell — verified at all 49
  view readings, activeLabel === the view on all 49); the volume budgets
  hold with huge headroom (**max clickLatency 652ms** [Tasks, the
  8,179-node rendering] vs the 1500ms budget; **max longTaskTotal 0ms** —
  the 300-row renders never block the main thread ≥ 50ms); the density is
  real (Tasks 8,179 nodes / My Day 3,666 / Events 3,418 / Notes 2,715 —
  vs the ~500–1,500-node seed renderings); zero flashbulbs across all 49;
  2 CTA-face exempt (the dark doctrine's single exemption family); 32
  lowcontrast WARN (the S11 non-gap family); the API stats:
  /api/tasks 112,960 bytes @ 102ms (the B1 bound holds at 300 rows),
  /api/notes 77,410 @ 30ms, /api/events 79,952 @ 72ms; the sidebar link
  census 20/20 per accent; the INVERTED chrome contract held at arrival;
  the cleanup deleted 300/200/250 marker rows. **The genuine envelope
  classified GREEN at the new seam on the FIRST try** (via a temporary
  vitest harness importing the seam — the note reads: "7 accents swept ×
  49 view renderings + 49 active-tint readings + 7 sidebar records at
  1280×800 in MODE dark under the 300/200/250 volume profile ... 2
  CTA-face exempt ... 32 WARN").
- The runner integration: the 24th audit stage
  `{ accent-volume-sweep, timeoutMs: 25 min }` directly after
  accent-dark-sweep (the dark family together) + the stage-count
  literals — the suite now 26 rows (preflight + 24 audits +
  theme-restore).
- The validation protocol (the S32 differential: the dev server
  restarted by PID, the preflight GREEN, the fresh clean window — the
  S41 OOM lesson: the interactive browser sessions closed before the
  launch): **26/26 GREEN, exit 0** — the new accent-volume-sweep row
  GREEN inside the suite on its **first integration run** (identical
  counts to the exploration — deterministic: 49 renderings, 49 tint
  readings, 7 sidebar records, 2 CTA-face exempt, 32 WARN, the
  /api/tasks payload 112,960 bytes), every other stage green, the
  theme-restore closing guard light/violet (verified via Prisma
  directly as well). The evidence envelope
  `docs/screenshots/s42-accent-volume-sweep-evidence.json` (26 stage
  rows).
- Gates re-run: lint ✓ tsc ✓ 518 unit ✓ (20 files — was 487) build ✓
  cold-db 291 e2e ✓ (4.5 min) = **809 green** (was 778; +31 unit pins;
  the 291 prior pins untouched by construction — zero app code, zero
  CSS, zero Tailwind v4 surface, zero parity-pinned bytes).
- The evidence screenshot
  `docs/screenshots/s42-accent-volume-dark-teal-tasks-1280.png` via
  `scripts/capture-s42-evidence.mjs` (the Tasks view at 300 rows in
  DARK under TEAL at 1280×800 with the sidebar's active link on the
  navigated Tasks view — the teal gradient, mainNodes 7,894, 964
  stress-row surfaces, zero flashbulbs, scrollWidth 1280, the heading
  clearing the fixed sidebar, the click latency 909ms — all verified
  in-frame before the capture). The standing 31 refreshed via
  `capture-studyflow.mjs` (theme restored light, verified via Prisma:
  light/violet).
- Docs aligned (the AP-74 guard): AGENTS.md (the 518 line + the
  accent-volume-sweep command entry + the 24-audit suite entry),
  vitest.config.ts (518), CLAUDE.md (518 + the S42 seam note), PAD §8.1
  (the suite-verdict row + the per-file count 203 → 234 + Total
  809/518), README (the 809 badge + the 518 lines ×2 + the S42
  classifier mention + the session-42 status row), SKILL.md (the
  809/518 counts ×2 + AP-88). The worklog entry + the session_99
  narrative + the session_100 summary + this plan's execution log.
  `.env.example` audited (matches the codebase, git-tracked — included
  in the commit per the brief).
