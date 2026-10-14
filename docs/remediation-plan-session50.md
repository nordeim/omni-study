# Remediation Plan — Session 50 (S50): the dark × landscape × SEED family — the 13 volume-invariant views swept through the theme space's dark half at the LANDSCAPE viewport (844×390, the iPhone-class landscape), navigated through the drawer, as a standing, executable guarantee

**Audit surfaces (this session, the session_123/124/125 workspace re-verified at
`c7ea46a`):** the baseline gates re-confirm the documented **1064-green** state
on arrival (lint ✓ tsc ✓ **773 unit** ✓ 20 files; `bun run build` ✓; cold-
`db/e2e.db` full e2e regression **291 ✓ 4.5 min** — after the documented
fresh-environment `bunx playwright install chromium` step; ONE intermediate
run read 289/291 — the stale-cache class, resolved by the documented install),
the S31 preflight GREEN before the checks, the drawer check GREEN, the live
agent-browser 390×844 walkthrough GREEN (**the mobile navigation menu is
working as expected** — the standing emphasis: scrollWidth 390, sidebar
hidden, burger visible, drawer 20 links, nav scrollable 1068 vs 755, Notes
via the drawer, closes on navigation, the re-open's active link "Notes" with
the violet gradient on the inner span — read on the SPAN, not the `<a>`
wrapper, the S40 ACTIVE_READER scope), the reference re-swept **UNCHANGED
since S19–S49** (login title "AcademiaFlow (Copy)", the email-prefix greeting
"Good evening, sepnetflix2023 👋", the 20 nav views in the same order, the
five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications; the
reference's own drawer: 20 links, 288px panel, nav scrollable 992 vs 744,
auto-closes on navigation — the mobile navigation PARITY confirmed on BOTH
apps), the copy sweep 14/20 (the 6 documented data-state non-gaps — the
reference account is zero-data), the dependency audit GREEN (2 advisories
documented non-production: braces ≤3.0.3 dev-only via eslint-config-next,
deepmerge-ts CLI-only via prisma — both upstream, not actionable here), and
the S49 one-command standing suite (**33 rows, the 31-audit version**)
launched for the arrival check; its result is recorded in the execution log
below.

## The governing finding (this session's work)

**The dark × landscape × SEED family for the 13 volume-invariant views is the
documented bracketed non-gap — and this session closes it** (the S46 plan's
carried note + the S49 plan's own non-gap entry: "The DARK × landscape ×
SEED cell for the 13 volume-invariant views … the light × landscape × SEED ×
accent cell is the S40 accent-landscape-sweep's own (closed there); the dark
half remains a documented future candidate" — carried to the landscape band
by the S48/S49 volume closes).

The coverage map, verified against the standing scripts (grep-verified this
session):

- `landscape-sweep` (S35): 20 views at 844×390 through the drawer — **LIGHT +
  violet ONLY** (zero accentColor references; every mode reference is light).
- `accent-landscape-sweep` (S40): 7 accents × 20 views at 844×390 through the
  drawer — **LIGHT only** (its every PATCH carries `themeMode: "light"` —
  8 hits, all light; the mode axis is its blind spot).
- `dark-mobile-sweep` (S36): dark × 390×844 — the MOBILE portrait viewport
  only (its VIEWPORT constant grep-verified at W=390).
- `accent-dark-sweep` (S38): 7 accents × 20 views in dark — **1280×800
  desktop + 390×844 mobile ONLY** (its viewport constants grep-verified; the
  844×390 width is in NEITHER surface).
- `accent-volume-dark-landscape-sweep` (S48): dark × 844×390 × 7 accents —
  **the 7 volume-affected views ONLY** (its VIEWS list grep-verified:
  Dashboard, My Day, Tasks, Calendar, Events, Notes, Analytics) under the
  300/200/250 volume profile.
- `accent-volume-light-landscape-sweep` (S49): the light mirror — the same
  7-view volume set, LIGHT only.

So the cross-axis cell **dark × landscape (844×390) × accent × SEED for the
13 volume-invariant views** (Timetable, Assignments, Exams, Flashcards,
Practice Tests, Study Groups, Grade Tracker, Files, Calculator, Math Solver,
AI Assistant, Focus Timer, Settings — they render no task/note/event rows,
so the S48 volume sweep never navigated them) is ZERO-coverage at every
accent: those 13 view BODIES had never been rendered in DARK at the 844×390
landscape layout under ANY accent (S35 proved landscape light+violet at
seed; S40 accent × landscape at seed light — all 20 views but light only;
S48 dark × landscape at volume — only the 7 volume views), AND the DRAWER's
active-link tint had never been read through the real navigation lifecycle
in DARK at LANDSCAPE at SEED on those 13 views (the S48/S49 tint readings
rode the 7-view volume set). The S42/S44/S46/S48 dark doctrine governs:
flashbulbs always findings (a light surface on the dark canvas); unreadable
< 2.2 with the CTA-face exemption ONLY (the light-mode calendar adjacent-day
slate-300 + the yellow priority-pill yellow-500 exemptions do NOT apply in
dark — those surfaces re-theme); lowcontrast < 3.2 = WARN.

**The landscape geometry** (the short-viewport family, the S35/S40/S48/S49
doctrine — re-measured empirically THIS SESSION in LIGHT and re-confirmed
against the S48 dark measurements): at 390 height the 20 nav rows
(scrollHeight ~1068) cannot fit the ~301px nav area (the 390 viewport minus
the ~89px brand header) — the nav MUST scroll; links ~8–20 sit below the
fold and the nav's scroll is the only path to them (measured live this
session in light: 1068 vs 755 at 390×844 portrait; the S48 dark landscape
reading: 1068 vs 301). The fixed h-16 app bar covers 16% of the 390px
viewport, so the heading-clearance contract (the heading's box top ≥ the
64px bar) is at its tightest here. The vehicle contract holds
(sidebarVisible=false + hamburgerVisible=true at 844). The dark-mode
hydration gate applies (the S42/S48 lesson: the dark class is applied by
the theme lifecycle after /api/auth/me resolves — no first-paint race in
dark, but the greeting heading is the shell-presence observable, and the
per-accent gates carry the shell-presence guard from birth — the AP-90
lesson).

## The session's audit findings (Mode C — the codebase review)

- **Zero app-code findings.** The S49 commit (`3a78f41`) touched only the
  test/seam/probe layer (`src/lib/suite-verdict.ts` +363, 
  `tests/suite-verdict.test.ts` +388, the probe, the runner, the docs) —
  verified by `git show --stat`; the classifier audited line-by-line
  (shape guards → mode/volume/vehicle contracts → per-accent self-verification
  → independent counting — all well-formed).
- **Security scan clean:** no TODO/FIXME markers, no `any` types, no
  console.log, no eval, no hardcoded secrets in `src/`; the only
  `dangerouslySetInnerHTML` is the THEME_BOOT_SCRIPT constant (documented);
  `z-ai-web-dev-sdk` imports live only in the 4 server-side AI routes ✓.
- **The mobile navigation menu is working as expected** — the standing
  emphasis, verified on BOTH apps this session (see the audit surfaces
  above). **No Tailwind v4 bug found:** the drawer's `backdrop-blur-xs`
  (trap 9 — v4's blur-scale shift, correctly the 4px v3 semantics), the
  `flex flex-col gap-1` nav list (trap 4 — no margin children inside
  space-* containers), the custom `.sf-nav-active` class in globals.css
  (NOT a Tailwind utility — immune to the @theme inline literal-inlining
  trap 13), and the `hidden lg:flex` sidebar contract all verified live.
- **The environment contract verified:** `.env` created from `.env.example`
  with `DATABASE_URL="file:../db/custom.db"`; the `db/` folder at the repo
  root (gitignored, `.gitkeep` tracked); `db/custom.db` seeded; the health
  endpoint `{"status":"ok","db":"up"}`; the vitest + playwright configs
  present and correct (the test suites already wired — `bun run test` 773
  unit, `bun run test:e2e` 291 e2e vs the standalone build on :3100 with
  the isolated `db/e2e.db`).
- **The `.env.example` matches the codebase** (the three app env vars:
  DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL — the script-only vars
  CWV_BASE/CWV_RUNS/PREFLIGHT_BASE/E2E_PORT are inline-passed by their
  tools, not .env citizens).

## Families and fixes

### S50-A (HIGH) — the seam `classifyAccentDarkLandscapeSeedSweep` + the unit pins

The seam (inserted after the S49 classifier, before the cwv section), on the
S40 seed-envelope shape with the S42/S44/S46/S48 dark doctrine:

- the **viewport guard** (844×390 BOTH axes — the 1280×800 desktop, 390×844
  mobile, and 768×1024 mid-band envelopes each read shape-error: the
  sibling families own those surfaces; the transposed pair of the mobile
  390×844 is a different device class);
- the **mode rot guard** (mode MUST be dark — the light × landscape × SEED
  family is the S40 audit's own: the mode is the discriminator on this
  very cell; an envelope with `mode=light` fed here reads NON-green, never
  a silent re-scope);
- the **ALL-ACCENTS + ALL-VIEWS guards** (the 7 accents; the 13
  volume-invariant views — a missing view is a shape-error, never
  green-by-omission, the S38 retirement);
- the **LANDSCAPE vehicle contract** (sidebarVisible=false +
  hamburgerVisible=true — the below-lg family) + the **drawer-own
  nav-scroll contract** at the landscape geometry (the nav MUST scroll at
  390 height — scrollHeight ~1068 vs the ~301px nav area);
- the per-accent **applied self-verification**, the **drawer-error check**
  (a drawer that failed to open is a finding, never a swallow), the
  **drawer link census** (linkCount === 20 — the drawer always carries all
  20 links even though only 13 are navigated);
- the **interaction classes** (the tint rot — an activeTint that computed
  to none/empty is the S8 no-var rot class; the active-state mismatch —
  the drawer's active link must be the view that was active when the tint
  was read);
- the **overflow class** (scrollWidth ≤ 844);
- the **structural below-lg family** (drawerClosed, appBar, headingClearance);
- the **DARK detector family** (flashbulbs always findings — counted
  independently of the findings array; unreadable < 2.2 with the CTA-face
  exemption ONLY, each dark-doctrine negative: a slate-300 day number and
  a yellow-500 pill still COUNT in dark — those surfaces re-theme;
  lowcontrast < 3.2 = WARN);
- the AUDIT_NAMES entry (`accent-dark-landscape-seed-sweep`) + the dispatch
  arm.

The unit pins (~38, the S40/S48 pin families re-anchored): the GREEN shape
(7 accents × 13 views → 91 renderings + 91 active-tint readings + 7 drawer
records), the ALL-VIEWS/ALL-ACCENTS guards, the historical-envelope
discriminators (the S35/S40 light landscape, S38 dark desktop, S42–S49
volume envelopes each read shape-error or non-green through their own
axis), the mode-discriminator mirror pins (the S40 light envelope fed here
→ NON-green via the mode rot; the S48 dark volume envelope fed here →
shape-error on the missing 13 views), the vehicle/scroll/applied/drawer/
tint/active/overflow/structural families, the flashbulb counting doctrine,
the CTA-face strictness + the two dark-doctrine negatives, the lowcontrast
WARN ride, and the unknown-audit guard.

### S50-B (HIGH) — the probe: `scripts/accent-dark-landscape-seed-sweep.mjs`

The S40 landscape vehicle verbatim (the same login, viewport precondition,
chrome contract, nav-scroll contract, pendingView tint pattern, heading/
clearance/app-bar/scrollWidth contracts, drawer record, closing restore +
the AP-85 flush-callback exit) re-anchored to the dark half on the 13-view
set:

- the **dark-mode precondition through the REAL lifecycle** (PATCH
  `themeMode: "dark"` + the greeting-heading shell-presence gate — the S48
  pattern);
- the **per-accent gate with the shell-presence guard from birth** (the
  AP-90 lesson: `data-accent === a && html.dark && !!document.querySelector("header")`);
- the **DARK checker** (the S42/S44/S46/S48 detector family verbatim:
  flashbulbs + unreadable/lowcontrast over main/aside/header/dialog) + the
  **drawer-scoped dark checker**;
- the **exit-code computation with the CTA-face exemption ONLY** (the
  light-mode exemptions do NOT apply in dark);
- NO volume lifecycle (SEED — no Prisma import, no marker rows, no API
  stats: the seed density is the documented resting state).

### S50-C (MEDIUM) — the runner: the 32nd stage

`scripts/standing-suite.mjs`: the stage entry after the S49 row
(`accent-dark-landscape-seed-sweep`, runtime node, timeoutMs 20 min — the
S40 precedent: its 20-view light sweep measured 9–12 min with the same
budget; 13 views ≈ 6–8 min expected) + the header comment + the stage-count
literals. Syntax-checked with `node --check` ONLY (never an import — the
S49 process lesson: the module EXECUTES on load).

### S50-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

AGENTS.md (the unit-count line 773 → the new count + the command-table row
+ the standing-suite audit-count line), vitest.config.ts (the header
comment), CLAUDE.md (the counts + the S50 seam note), PAD §8.1 (the
classifier note + the per-file count + the Total line), README.md (the
badge counts + the session-50 status row), omni-study_SKILL.md (the counts).

### S50-E (MEDIUM) — the evidence + the session record

The evidence screenshot (a dark × landscape rendering on a NON-Dashboard
view of the 13 — e.g. the Timetable or Exams view in DARK under TEAL at
844×390 with the drawer OPEN on the navigated view) + the evidence JSON
envelope + the refreshed standing captures + the session narrative
(session_126) + the summary (session_127) + this plan's execution log.

## Non-gaps (documented, do not fix)

- **The volume × theme × viewport cross-axis is COMPLETE** (all EIGHT
  halves: dark/light × desktop/mobile/mid-band/landscape) — closed S42–S49;
  this session closes the SEED-volume dark half at the landscape band for
  the 13 volume-invariant views (the light half is S40's own, all 20 views).
- **The RUM-beacon second cross-axis** (RUM-beacon behavior under suite
  volume) — the remaining named future candidate (the S45–S49 summaries'
  named family).
- **The lowcontrast WARN family** — the S11 non-gap (2.2 ≤ contrast < 3.2) —
  WARN, never a finding.
- **The RUM 429 backpressure console line** — the S18 designed backpressure,
  filtered by the exact-text signature.
- **Docker compose init + the upstream dep patches (braces > 3.0.3, Prisma's
  deepmerge-ts pin)** — the owner's standing open items (Docker unavailable
  in this sandbox; the patches land upstream).
- **The 6 copy-sweep data-state non-gaps** — the reference account is
  zero-data; the clone demo account is seeded (documented since S17).

## TDD order

1. The S50 pin block in `tests/suite-verdict.test.ts` (RED — the audit name
   unknown to the current seam; the shape-error pins pass vacuously through
   the unknown-audit path, documented).
2. `classifyAccentDarkLandscapeSeedSweep` in `src/lib/suite-verdict.ts` +
   the AUDIT_NAMES entry + the dispatch arm (GREEN — the file, then the
   full unit layer 773 + ~38 = ~811).
3. `scripts/accent-dark-landscape-seed-sweep.mjs` (the exploration — the
   genuine run 1 against the dev server, AFTER the arrival suite completes:
   the dev server is a shared surface; the family validated clean BEFORE
   the runner integration).
4. The runner's 32nd stage + the literals (node --check only).
5. The validation suite (the S32 differential: dev server restarted by PID,
   the preflight GREEN, the fresh clean window — the S41 OOM lesson: the
   interactive browser sessions closed BEFORE the launch).
6. The gates re-run (lint, tsc, the new unit count, build, cold-db 291 e2e —
   `rm -f db/e2e.db` before EVERY full run, the S46 always-cold-db lesson).
7. The evidence + the docs + the session logs + the worklog + the commit +
   the push (via the SSH wrapper — `--remote git@github.com:nordeim/omni-study.git`,
   the S122 note: the wrapper's DEFAULT remote is a different repo).

## Risks

- **The drawer open/close cost at the landscape viewport in dark at seed**:
  91 navigations × (drawer open + link click + drawer close + render settle
  + checker) — the S40 20-view light sweep measured 9–12 min (140 navs);
  13 views ≈ 6–8 min expected. Mitigation: the 20-min stage budget (~3×
  headroom); the exploration measures the real duration BEFORE the runner
  integration (the S38-C lesson).
- **The dark flashbulb surface at the landscape layout**: the 13 views
  include intentionally-light surfaces (the Events terminal panel is
  covered by S48; but the Files/Calculator/Math Solver views carry white
  cards that MUST re-theme in dark — the S10 `@theme inline` trap's own
  family). Mitigation: the S42/S44/S46/S48 dark checker verbatim; the
  dark-sweep (1280×800) and accent-dark-sweep (desktop+mobile) already
  proved these views dark-clean at OTHER viewports — the landscape width
  renders the same components.
- **The OOM trap** (the S41 lesson, AGENTS.md): the dev server + the
  probe's chromium — close every interactive browser session before the
  launch; the container ceiling is ~4 GB.
- **The pendingView interaction read at the SHORT viewport**: the drawer
  open reads the active link while the previous view is active — the read
  is scroll-independent (the active link stays in the DOM with computed
  styles — the S40 note).
- **The RUM budget**: 91 navigations × the beacon's batched posts could
  exhaust the 1000/15-min per-user RUM budget mid-sweep — the exact-text
  429 filter keeps the class silent (the S33+ doctrine), and the beacon's
  failures-swallowed contract (ADR-016) means the app itself never degrades.
- **The arrival-suite overlap**: the S50 exploration must NOT run while the
  standing suite holds the dev server + the shared DB — the TDD unit work
  runs during the suite; the exploration runs after it completes.
- **The AI Assistant / Math Solver views at seed**: their empty-state
  surfaces render fine offline; no AI calls are made by the probe (the
  views render their empty/history states — the seeded demo data).

## Execution log (filled as executed)

- ARRIVAL: the workspace re-cloned fresh (`c7ea46a` on main — the S49 feat
  `3a78f41` + the session-log commits), the five core docs re-read
  (AGENTS/CLAUDE/README/PAD/SKILL — the long lines via persisted chunks),
  the S49 baseline docs (session_121/122/123/124/125, the S49 plan, the
  worklog tail) absorbed. The environment rebuilt: `.env` from
  `.env.example`, `bun install` (489 packages), `db:push` + `db:seed`.
- BASELINE GATES: lint ✓ tsc ✓ 773 unit ✓ (20 files) build ✓; the first
  cold-db e2e attempt read 267/291 — the documented fresh-environment
  Playwright launcher class (the chromium cache version mismatch —
  headless_shell-1243 needed, 1200 present); after `bunx playwright install
  chromium`: ONE run 289/291 (the stale-cache residue class), the re-run
  **291 passed (4.5 min)** — the 1064-green baseline re-confirmed.
- The dev server started via the S32 daemon recipe; preflight GREEN;
  drawer-check GREEN.
- THE MOBILE NAVIGATION WALKTHROUGH (the standing emphasis): login at
  390×844 → scrollWidth 390, sidebar hidden, burger visible → drawer 20
  links, nav scrollable (1068 vs 755) → Notes via the drawer → closes on
  navigation → the re-open's active link "Notes" with the violet gradient
  (read on the INNER SPAN — the S40 ACTIVE_READER scope; a first reading
  on the `<a>` wrapper showed "none" — the wrapper carries no style, the
  span does). **The mobile navigation menu is working as expected.**
- THE REFERENCE RE-SWEEP: logged in at 390×844 and 1280×800 — title
  "AcademiaFlow (Copy)", the email-prefix greeting, the 20 nav views in
  the documented order, the five Settings tabs. The reference's own
  drawer: 20 links, 288px panel, nav scrollable (992 vs 744), auto-closes
  on navigation, the Notes view renders its h2. **UNCHANGED since
  S19–S49** — the mobile navigation parity confirmed on BOTH apps.
- THE COPY SWEEP via the :3200 standalone (ephemeral real AUTH_SECRET):
  **14/20 MATCH** (the 6 documented data-state non-gaps — identical to the
  S49 record). The :3200 server killed by PID after.
- THE CODE AUDIT (Mode C): the S49 diff verified test/seam/probe-only
  (zero app code); the security scan clean (no TODO/any/console.log/eval/
  hardcoded secrets; the SDK server-only; the one dangerouslySetInnerHTML
  is the documented THEME_BOOT_SCRIPT); the 24-model schema count ✓; the
  .env.example ↔ codebase env contract ✓; the dep-audit GREEN (2
  documented non-production advisories). **Zero app-code findings.**
- THE COVERAGE MAP verified by grep: S35 landscape = light+violet; S40
  accent-landscape = light only (8 themeMode "light" PATCHes); S36
  dark-mobile = 390×844; S38 accent-dark = 1280+390 only; S48 dark
  landscape volume = the 7 volume views only; S49 = the light mirror.
  **dark × landscape × SEED × the 13 volume-invariant views is
  ZERO-coverage — the S50 scope confirmed.**
- THE ARRIVAL STANDING SUITE launched (33 rows, the 31-audit version) via
  the S32 daemon recipe on the fresh clean window (dev server restarted
  by PID first). **RESULT: 33/33 GREEN, exit 0** — the documented arrival
  state validated clean on the fresh window (the theme-restore closing
  guard light/violet).

## Execution log (the TDD phase — filled as executed)

- **TDD RED**: the 32-pin S50 block appended after the S49 block in
  `tests/suite-verdict.test.ts` (the s50Envelope fixture: 7 accents × the
  13-view set at 844×390 dark). ONE pin defect caught BEFORE the RED run
  (a tint-rot pin referencing "Notes" — a view NOT in the 13-view set;
  the override would silently no-op) + one duplicate S48 cross-check pin
  removed. Result: **18 failed / 503 passed (521 in file)** — the
  shape-error pins pass vacuously through the unknown-audit path, the
  verdict pins fail — the documented RED pattern.
- **TDD GREEN**: the `classifyAccentDarkLandscapeSeedSweep` seam + the
  AUDIT_NAMES entry + the dispatch arm. ONE pin correction during GREEN:
  the structural family's combined note hyphenated "app-bar" where the
  pin expects "/app bar/i" — refactored into the S49 pattern's THREE
  distinct blocks (drawer-stuck / missing bars / clearance breaches).
  Result: **521/521 in the file; the full unit layer 805 (773 + 32)**;
  lint ✓ tsc ✓.
- **The probe** `scripts/accent-dark-landscape-seed-sweep.mjs` written
  (the S40 landscape vehicle verbatim, re-anchored to the dark half on
  the 13-view set; the dark-mode precondition through the REAL lifecycle;
  the shell-presence guard from birth; the dark checker + the
  drawer-scoped dark checker; the CTA-face-only exit; the AP-85
  flush-callback exit; NO Prisma — SEED volume). `node --check` OK.
- **The runner's 32nd stage** added (timeoutMs 20 min, the S40 precedent)
  + the header comment + the /32 literals. `node --check` OK — never an
  import (the S49 process lesson).
- **The docs alignment** (the AP-74 guard): AGENTS (the 805 line + the
  S50 command row + the 32-audit suite entry), vitest.config.ts (the 805
  header + the S50 classifier note), CLAUDE (the 805 count + the S50
  seam note), PAD §8.1 (the S50 classifier row + the suite-verdict pin
  count 489 → 521 + the Total 1064 → 1096), README (the badge 1096 + the
  count lines + the session-50 status row), SKILL (the counts ×2).
- **THE EXPLORATION (genuine run 1)** — after the arrival suite completed
  (the dev server restarted by PID, preflight GREEN, the fresh clean
  window): **EXIT 0, findings 0, 2m43s** (~4.4× headroom under the
  20-min budget). The genuine envelope verified: 91 renderings (7 accents
  × 13 views), 7 DISTINCT accent-correct tints, activeLabel === view on
  all 91 readings, ZERO flashbulbs, 1 unreadable ALL-exempt (the
  CTA-face — white on the amber-500 "Start Test" button, the S11
  family-2 non-gap), 58 lowcontrast WARN (the S11 non-gap family), the
  drawer census 20/20 per accent, max scrollWidth 844, the vehicle
  contract holds (sidebarVisible=false + hamburgerVisible=true), the
  drawerNavScrollable contract holds.
- **GREEN at the new seam — FIRST try** (the temporary bun harness,
  deleted after): `{green: true, findings: 0, note: "7 accents swept × 91
  view renderings + 91 active-tint readings + 7 drawer records at 844×390
  in MODE dark at SEED volume … 1 CTA-face exempt … 58 WARN"}`.
- **THE VALIDATION SUITE launched** (34 rows, the 32-audit version — the
  new S50 stage integrated) on the fresh clean window (the dev server
  restarted by PID, preflight GREEN, every interactive browser session
  closed first — the S41 OOM lesson). **RESULT: 34/34 GREEN, exit 0** —
  the new accent-dark-landscape-seed-sweep row GREEN inside the suite on
  its FIRST integration run (identical counts to the exploration —
  deterministic: 91 renderings, 91 tint readings, 7 distinct tints, 0
  flashbulbs, 1 CTA-face exempt, 58 WARN, census 20/20), every other
  stage green, the theme-restore closing guard light/violet.
- **THE EVIDENCE**: the screenshot
  `s50-accent-dark-landscape-seed-teal-exams-844.png` via
  `capture-s50-evidence.mjs` (verified in-frame: the teal gradient
  rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1) on the active Exams
  link, linkCount 20, darkClass true, mainNodes 107, zero flashbulbs,
  zero non-exempt unreadable, scrollWidth 844, the nav geometry 1068 vs
  301 scrollable, the click latency 447ms) + the evidence envelope JSON
  (34 stage rows) + the standing 31 refreshed (capture-studyflow.mjs);
  the theme verified via the DB (light/violet, zero stress markers — the
  SEED probe inserts none by design).
- **THE FINAL GATES: lint ✓ tsc ✓ 805 unit ✓ (20 files) build ✓ cold-db
  291 e2e ✓ (4.5 min) = 1096 green** (was 1064; +32 unit pins; the 291
  prior pins untouched by construction).
- The session_126 narrative + the session_127 summary + this plan's
  execution log + the worklog entry; the commit + the push via the SSH
  wrapper (`--remote git@github.com:nordeim/omni-study.git`).
