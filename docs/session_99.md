# Session 99 — The S42 data-volume × dark × accent stress

The workspace re-cloned fresh (the sandbox had been reset; the remote
main at `49cc456` — the session_98 transcript on top of the S41 push
`bfdcf8c`); the environment rebuilt (`.env` per the contract with
`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`bun install` 489 packages, `db:push` + `db:seed` — the demo user with
the showcase data). The core docs read (AGENTS through the S41 rows,
CLAUDE, README, PAD through §8.1, SKILL through AP-87), then the session
docs (session_97 + session_98 + remediation-plan-session41 + the worklog
S41 entry); every current-state claim re-verified against the codebase
on arrival (the vitest 20-file/487 config, the playwright 291-spec
config, the 23-row STAGES list, the `classifyAccentDesktopSweep` seam,
the 20 NAV_ITEMS, the S13 data-volume audit's zero theme references;
skills/ excluded per the brief).

## The validation on arrival

The **778-green baseline re-confirmed**: lint ✓ tsc ✓ **487 unit** ✓
(20 files) build ✓ cold-`db/e2e.db` **291 e2e** ✓ (4.4 min). The
standing checks all GREEN: the S31 preflight, the mobile-drawer check,
the live agent-browser 390×844 walkthrough (**the mobile navigation
menu is working as expected** — login → dashboard scrollWidth 390 →
the drawer's 20 links in the documented order → the active link
"Notes" with the violet `NAV_ACTIVE_GRADIENT_STOPS` gradient after
drawer navigation → the drawer closes on navigation), the reference
re-sweep **UNCHANGED since S19–S41** (the login title "AcademiaFlow
(Copy)", the zero-data dashboard with the email-prefix greeting "Good
morning, sepnetflix2023 👋", the same 20 nav views in the same order,
the same five Settings tabs), the copy sweep **14/20 MATCH** with the
6 diffs all data-state (the documented S17 family — run against the
`:3200` standalone server on `db/custom.db`), and the S41 one-command
standing suite **25/25 GREEN, exit 0** (launched before this session's
runner edit — the in-flight run held the 23-stage version loaded at
launch) — zero code findings on arrival.

## The governing finding — the data-volume axis has never crossed the theme space

The documented S41 next-step (the session_97 summary's standing next
candidates, its first-named: "the data-volume × dark × accent stress").
The coverage map, verified against the standing scripts this session:

1. **The S13 volume profile runs LIGHT + VIOLET only**: the
   data-volume audit (`scripts/data-volume-audit.mjs`) inserts 300
   tasks / 200 notes / 250 events and measures payloads, long tasks,
   click latency across the 7 volume-affected views — with **zero
   theme references** (`grep` for themeMode/accentColor/dark/sf-primary
   → no matches): it renders once, in whatever the demo user's resting
   theme is (light + violet), at 1280×800.
2. **Every theme-space sweep runs at SEED volume**: dark-sweep (S27,
   violet only), accent-dark (S38, 7 accents × 20 views × two
   viewports), accent-light/midband/landscape/desktop (S37/S39/S40/
   S41) — all at the seed's tens of rows. The densest renderings the
   app can produce — the 300-row Tasks list, the 250-event 7-day
   terminal panel, the 200-note list — had **never carried a theme
   variation**, and the theme contracts (the dark contrast family, the
   accent application, the interaction tint) had **never been measured
   at volume**. Density multiplies the surfaces the theme touches: a
   contrast defect that fires once per row is invisible at seed volume
   (1–2 rows) and systematic at volume (300 rows).
3. **The never-read dark interaction cell**: the SIDEBAR's active-link
   accent tint had never been read through the real navigation
   lifecycle in DARK mode at ANY volume — S41 proved it in LIGHT (140
   readings at 1280×800), and the S41 summary's "sidebar: 1280 dark
   via accent-dark's goto pass" is a goto pass that never reads the
   sidebar's active link at all.
4. **The volume self-verification gap**: no standing probe asserts the
   rows it renders are actually THERE (the S13 audit inserts and
   assumes) — an anti-phantom volume sweep must COUNT-verify the
   insert through Prisma before measuring, or it could silently
   measure seed volume and read green-by-omission (the S38 retirement
   of omission-means-clean, applied to the volume axis).

## The exploration (the genuine run 1)

The volume × dark × accent family swept clean BEFORE the runner
integration — **7 accents × the 7 volume-affected views navigated
THROUGH THE SIDEBAR at 1280×800 in dark mode under the COUNT-verified
300/200/250 profile** (PATCHed through the settings API, self-verified
on `<html data-accent>` + `html.dark`, every view recorded explicitly,
**~2.6 min measured** — ~10× headroom under the 25-min budget):
**findings 0 across all 49 renderings + 7 sidebar records**. The
interaction itself is GREEN — the never-read dark cell closed:
`activeLabel === the view` on all 49 readings and `activeTint` read a
`linear-gradient` on all 49 — **7 DISTINCT accent-correct
`NAV_ACTIVE_GRADIENT_STOPS` pairs**, the S41 proof extended to DARK
mode. The volume budgets hold with huge headroom: **max clickLatency
652ms** (the Tasks click → "All Tasks" heading visible, the 8,179-node
rendering) against the 1500ms budget, and **max longTaskTotal 0ms** —
the 300-row renders never block the main thread ≥ 50ms at any accent.
The density is real and visible in the measurements: Tasks 8,179 DOM
nodes, My Day 3,666, Events 3,418, Notes 2,715 (vs the ~500–1,500-node
seed renderings). Zero flashbulbs across all 49 (the dark doctrine —
no light surface on the dark canvas at any accent at volume); 2
CTA-face exempt (the dark doctrine's single exemption family — white
on accent-500); **32 lowcontrast WARN** (the S11 non-gap family). The
API stats (theme-invariant, measured once): /api/tasks **112,960
bytes @ 102ms** (the B1 bound holds at 300 rows), /api/notes 77,410 @
30ms, /api/events 79,952 @ 72ms. The sidebar link census 20/20 per
accent; the INVERTED chrome contract held at arrival (sidebar visible
+ hamburger hidden at 1280); the sidebar nav scrollable at 800 height
re-measured per accent (7/7); the cleanup deleted 300/200/250 marker
rows. No genuine finding — the coverage extension shipped as planned.

The genuine envelope classified **GREEN at the new seam on the first
try** (via a temporary vitest harness importing the seam — the note
reads: "7 accents swept × 49 view renderings + 49 active-tint
readings + 7 sidebar records at 1280×800 in MODE dark under the
300/200/250 volume profile, navigated through the sidebar (the desktop
vehicle); every accent self-verified applied; the volume budgets hold
(long tasks ≤ 1500ms, clicks ≤ 1500ms, the /api/tasks payload 112960
bytes ≤ 500000); 2 CTA-face exempt; 32 WARN").

## The fix (TDD, 31 new pins)

- **RED**: the S42 pin block in `tests/suite-verdict.test.ts` (the
  GREEN shape with all 7 accents × the 7 volume views + the volume
  keys [nodes/mainNodes/longTaskTotal/clickLatencyMs] + the S38 dark
  detector keys [flashbulbs/unreadable/lowcontrast] + the interaction
  keys + the api record + the sidebar per accent; the ALL-VIEWS guard;
  the ALL-ACCENTS guard; the historical S13-shape envelope — the
  data-volume audit's own flat findings/nonGaps shape, the exact
  pre-S42 state; the missing-volume / missing-sidebar / missing-mode
  shape-errors; the wrong-viewport family [the 390×844 AND the
  768×1024 AND the 844×390 sibling envelopes]; the mode-rot family
  [mode=light → non-green — the volume × light family is the
  documented bracketed non-gap]; the volume-rot family [tasks 0 /
  notes 199 / events 0 → each a non-green — the wrong-density class];
  the applied-mismatch family; the INVERTED vehicle-contract family;
  the scroll-contract family; the tint-rot family; the interaction
  family; the overflow family; the S13 B3 budget family
  [longTaskTotal 1600 → finding, the boundary 1500 green]; the S13 B2
  budget family [clickLatencyMs 1600 → finding, the boundary 1500
  green]; the flashbulb family [ALWAYS findings]; the strict-record
  families incl. the missing longTaskTotal / clickLatencyMs /
  flashbulbs; the sidebar-error family; the sidebar link-census
  family [linkCount 19 → finding]; the independent-counting family;
  the CTA-face exemption family with a strictness negative; the
  light-exemptions-do-NOT-apply-in-dark family [a slate-300 numeric
  entry + a yellow-500 pill entry → both COUNT]; the WARN family; the
  S13 B1 API-bound family [512,000 bytes → finding, the boundary
  500,000 green]; the unknown-audit guard) → **18 failed / 216
  passed** under the current seam (the audit name unknown to it; the
  13 shape-error pins passed vacuously through the unknown-audit path
  — documented). One test-file syntax fix on the way (an unquoted
  `"My Day"` object key — the parse error caught before any RED
  reading).
- **GREEN**: the seam implementation `classifyAccentVolumeSweep` (the
  AUDIT_NAMES entry + the dispatch arm + the classifier: the
  volume-EXACT guard — 300/200/250, a seed-volume envelope is its own
  rot class; the ALL-ACCENTS + ALL-VIEWS guards — the 7 volume-affected
  views, the display-label convention; the INVERTED chrome contract +
  the sidebar-own scroll contract; the per-accent applied
  self-verification; the sidebar link census; the interaction classes
  in DARK — the tint rot + the active-state mismatch; the S13 B2/B3
  volume budgets with boundary-exact pins; the flashbulb class; the
  unreadable counting with the CTA-face exemption ONLY — the
  light-mode calendar-day + yellow-pill exemptions do NOT apply in
  dark, those surfaces re-theme; the /api/tasks ≤ 500KB B1 bound) →
  **234/234 in the file; the full unit layer 518** (487 + 31). lint ✓
  tsc ✓.
- **The probe** `scripts/accent-volume-sweep.mjs`: the S41 model (the
  sidebar vehicle, the per-view interaction reads, the
  self-verifying preconditions, the AP-85 flush-callback exit from
  birth) + the S38 dark checker verbatim (flashbulbs + the
  effectiveBg walk) + the S13 volume lifecycle (the pre-clean → the
  insert → the COUNT verification → the finally-safe cleanup) + the
  S13 measure (the DOM census + the 1.5s long-task window) + the
  click→heading latency (the sidebar click doubles as the B2
  measurement) + the API stats once (the B1 bound). **The design
  correction over the S39–S41 shape — the finally-race fix**: the
  cleanup + the browser close + the Prisma disconnect ALL complete
  BEFORE the AP-85 flush-callback exit (a `finally` block races the
  exit-carrying write — the exit could fire mid-cleanup); the
  precondition `fail()` now THROWS a `PreconditionError` so the
  catch-path restore + cleanup run for every failure class, and the
  catch itself restores + cleans up + exits 1.
- **The runner**: the 24th audit stage `{ accent-volume-sweep,
  timeoutMs: 25 min }` directly after `accent-dark-sweep` (the dark
  family together) — the suite now **26 rows** (preflight + 24 audits
  + theme-restore).

## The validation suite

The S32 differential applied (the dev server restarted by PID, the
preflight GREEN, the fresh clean window — the S41 OOM lesson: the
interactive browser sessions closed before the launch): **26/26 GREEN,
exit 0** — the new accent-volume-sweep row GREEN inside the suite on
its **first integration run** (identical counts to the exploration —
deterministic: 49 renderings, 49 tint readings, 7 sidebar records, 2
CTA-face exempt, 32 WARN, the /api/tasks payload 112,960 bytes), every
other stage green, the theme-restore closing guard light/violet
(verified via Prisma directly as well). The evidence envelope
`docs/screenshots/s42-accent-volume-sweep-evidence.json` (26 stage
rows).

## Gates

lint ✓ tsc ✓ **518 unit** ✓ (20 files — was 487) build ✓ cold-`db/e2e.db`
**291 e2e** ✓ (4.5 min) = **809 green** (was 778; +31 unit pins; the 291
prior pins untouched by construction — zero app code, zero CSS, zero
Tailwind v4 surface, zero parity-pinned bytes).

## Evidence + docs + push

The evidence screenshot
`docs/screenshots/s42-accent-volume-dark-teal-tasks-1280.png` via
`scripts/capture-s42-evidence.mjs`: the Tasks view at **300 rows in
DARK mode under the TEAL accent** at 1280×800 with the SIDEBAR's
ACTIVE LINK on the navigated Tasks view (the teal
NAV_ACTIVE_GRADIENT_STOPS gradient rgba(20,184,166,.1)→rgba(6,182,212,.1)),
the dense task list rendering clean in-frame (mainNodes 7,894, 964
stress-row surfaces, zero flashbulbs, scrollWidth 1280, the heading at
x=572 clearing the fixed 260px sidebar, the click→heading latency
909ms — all verified in-frame before the capture). The standing 31
screenshots refreshed via `capture-studyflow.mjs` (theme restored
light, verified via Prisma: light/violet).

Docs aligned (the AP-74 guard): AGENTS.md (the 518 line + the
accent-volume-sweep command entry + the 24-audit suite entry),
vitest.config.ts (518), CLAUDE.md (518 + the S42 seam note), PAD §8.1
(the suite-verdict row extended with the S42 classifier + the per-file
count 203 → 234 + Total 809/518), README (the 809 badge + the 518
lines ×2 + the S42 classifier mention + the session-42 status row),
SKILL.md (the 809/518 counts ×2 + AP-88). The worklog entry + this
session_99 narrative + the session_100 summary + the session-42
remediation plan with the execution log. `.env.example` audited
(matches the codebase, git-tracked — included in the commit per the
brief).
