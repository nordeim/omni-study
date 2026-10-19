# Remediation Plan — Session 76 (S76): the S75+1 stability confirmation — the standing arrival audit (the ninth fresh-clone rebuild of the chain)

**The session's governing question (2026-10-19):** the S75 session closed
the S74+1 stability confirmation with the 1133 gates re-confirmed
byte-for-byte on the eighth fresh-clone rebuild, the standing suite GREEN
35/35 ON RUN 1 (the single fresh-budget launch — the S74 double-launch
lesson applied from the start), and the capture-delta reading the
clock-digit family only (the cleanest reading of the chain — the collapsed
pair byte-identical again with the same-bucket evening pair). Since the
S75 close, FIVE doc-only commits landed (`ca5221f` — the S75 evidence
[the plan + the 35-row envelope + the 7 captures + session_233/234 + the
README row + the worklog entry]; `5a5ab1b` — session_235, the S75 process
log; `a56d514` — session_236, the S75 Chinese final transcript; `312b780`
— session_237, the S75 raw process log; `cd53dab` — session_238, the S75
final summary; all verified doc-only). This session owed the standing
arrival audit per the documented protocol (the S75 "open for you" ③) and
read **ZERO findings on every axis**: the baseline gates re-confirmed
byte-for-byte on the NINTH fresh-clone rebuild, the standing checks all
GREEN, the reference re-swept **UNCHANGED since S52–S75** (the 25th
consecutive sweep), the Mode-C review clean, the dep-audit GREEN, and the
registry landscape stable. **Zero code changes by design** (the S53–S75
precedent: the smallest safe diff is no diff on a verified-green
production codebase).

## The scope (validated against the codebase before execution)

1. **The arrival**: the workspace RESET at session open (the same
   one-session cadence as S70→S71, S72→S73, S73→S74, and S74→S75; the
   NINTH fresh-clone rebuild of the chain:
   S66/S67/S68/S69/S71/S73/S74/S75/S76). The fresh clone at `cd53dab`;
   the five post-S75 commits verified doc-only; the five core docs
   re-read (AGENTS/CLAUDE/Project_Architecture_Document unchanged since
   `193132f` [S52], the SKILL doc unchanged since `c5378bc`, README
   advanced only by the session-75 row, the worklog advanced only by the
   S75 entries); the session docs (session_237 +
   remediation-plan-session75 + the worklog tail + session_238)
   absorbed; the last app-code change remains the S52 four-file fix.
2. **The environment rebuilt** (the S71/S73/S74/S75 reset-boundary
   recipe, now a nine-times-field-tested routine): `.env` from
   `.env.example` (`DATABASE_URL="file:../db/custom.db"` + 
   `AUTH_SECRET=""`), `bun install` 489 (7.18 s), `db:push` + `db:seed`
   to the **303,104-byte pin byte-identical**, the Playwright chromium
   v1243 reinstall (114.3 MiB).
3. **The baseline gates + the standing checks + the reference re-sweep +
   the Mode-C review**: the full documented sequence, unchanged from the
   S70–S75 executions.
4. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows,
   the suite as the window's ONLY consumer (the S66–S75 standing
   protocol: no manual audits before/during; the security stage verified
   from the raw stage output — a file read — never by re-running the
   audit; the limiter budget fresh — no AI-route consumption in the
   15-min window before the launch; ONE launch via the S32 setsid
   subshell recipe, first-try).

## The findings

**ZERO findings — app code, test code, and docs alike.** Every axis of
the arrival audit read GREEN:

| Check | Verdict |
|-------|---------|
| Post-S75 commits | `ca5221f` (S75 evidence) + `5a5ab1b` (session_235) + `a56d514` (session_236) + `312b780` (session_237) + `cd53dab` (session_238) verified **doc-only** — zero app-code changes since the S52 four-file fix `193132f` (the four test-file deltas since `193132f` are the documented S55/S57 test-code-only e2e hardening commits `3ddb6c7`/`c5378bc`, not app code) |
| Baseline gates (fresh-clone rebuild) | lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.67 s) build ✓ cold-db **299 e2e ✓** (4.6 min, zero flake) = **1133 green** — byte-for-byte the documented state, the counts' TWELFTH consecutive identical reading |
| Build warning | The ONE Turbopack warning = the documented session-22 edge-runtime notice for `process.exit(1)` in `src/instrumentation.ts:31` (the AUTH_SECRET boot guard's intentional fail-fast; known behavior per AGENTS.md session-22 — not a finding) |
| Dev-server preflight | GREEN **first-try** (the fresh clone carries no stale `.next/dev` cache) |
| Drawer-check (S14) | GREEN (backdrop blur(4px) / panel 288 / 20 links / no footer / Escape-close superset) |
| Live 390×844 walkthrough (clone) | GREEN — login (demo@studyflow.app) → scrollWidth 390 → sidebar hidden (`display: none` on the aside) → burger visible (aria-label "Open navigation menu") → the greeting **"Good morning, Demo Student 👋"** (the MORNING bucket — the evening→morning transition, the chain's second bucket transition; S75 captured ~23:00 UTC evening, S76 ~01:15 UTC morning) → the drawer census exact (the root wrapper `fixed inset-0 z-50 lg:hidden` carrying the backdrop BUTTON 390×844 + the panel DIV 288×844 as its two children; 20 links in the exact reference order at 48px; the NAV element itself the scroll container **1068 vs 755** [the VERTICAL pair; scrollW 288 = clientW 288 by design]) |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the drawer nav UL: display flex / column / rowGap 4px / margin 0px), trap 9 (the backdrop BUTTON `backdrop-filter: blur(4px)`), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)`) — all three read clean in ONE probe |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Active-link triple-pin | EXACT (violet-600 label span `rgb(124, 58, 237)` + the violet→indigo 10% gradient `linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))` on the label-wrapper span + the trailing violet-500 dot `rgb(139, 92, 246)` at computed **w 6px / h 6px / border-radius 3.35544e+07px** [the rounded-full computed form] — read on the drawer's own VISIBLE instance, the S75 probe form applied from the start) |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260px / main width 1020, 20 leaf labels (the 40 text-bearing spans = the documented two-span-per-link structure), 0 aria-labeled; collapsed via the "Collapse sidebar" button: **80/80/1200**, nav icon svgX **33** + the header chevron svg **x=32** with the glyph **`rotate: 180deg`** (v4's rotate property — the computed `rotate`, not `transform`), `sf-sidebar-collapsed` "1" persisted, **zero text-bearing label spans in the nav** (the labels UNMOUNT), 20 aria-labeled icon-only links; the mobile drawer SHARING the state (288px panel, 44px icon-only links, svgX 32, nav scrollable **988 vs 755**, 20 aria-named, 0 text-bearing); the preference restored ("0") + the reload round-trip verified (260/1020 restored) |
| Notes via the drawer | ✓ (auto-close unmounts the drawer — the fixed-drawer count 0; H2 identity "Notes", scrollWidth 390 no overflow) |
| Escape-close (clone) | ✓ (the drawer unmounts — the clone's documented superset) |
| Reference re-sweep | **UNCHANGED since S52–S75** (the 25th consecutive unchanged sweep) — the four anchors (title "AcademiaFlow (Copy)"; greeting **"Good morning, sepnetflix2023 👋"** [the MORNING bucket — BOTH sites in the same bucket, the evening→morning transition pair]; the 20-view order byte-identical: Dashboard/MyDay/Tasks/Calendar/Events/Timetable/Assignments/Exams/Notes/Flashcards/PracticeTests/StudyGroups/GradeTracker/Analytics/Files/Calculator/MathSolver/AIAssistant/FocusTimer/Settings; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020, 20 labels, `sidebarOpen "true"`; collapsed 80/80/1200, svgX 33, the chevron `matrix(-1, 0, 0, -1, 0, 0)` glyph at svg x=32, `sidebarOpen "false"`, zero text-bearing labels) + the shared collapsed drawer (288px panel, 44px links, svgX 32, nav 912 vs 744, ZERO aria-named — the clone's a11y superset; the DIV backdrop `blur(4px)` + `rgba(0, 0, 0, 0.2)` — the panel's SIBLING div found via the GLOBAL backdrop-filter probe); the reference's drawer does NOT close on Escape (the clone's documented superset, verified live via the GEOMETRY probe — the panel + backdrop both remain); the stored preference restored to `"true"`; 2 reference captures saved (the desktop expanded gated on the CTA "Start My Day" verified in-frame at x1093/y46/155×36 + both h1s read; the mobile labeled drawer, 20 labels 48px verified in-frame) |
| Reference greeting probe observation | The FIRST post-login render on the reference's `/` redirect read **"Good morning, there 👋"** — the reference's generic fallback while the profile fetch is in flight; the settled Dashboard render reads **"Good morning, sepnetflix2023 👋"** (the account identity block in Settings → Profile confirmed intact: 🎓 ssepnetflix2023). A transient render state of the reference itself, not a parity gap — the clone resolves the greeting from the session user (no fallback window); the settled states (what the captures compare) match. Recorded as a probe observation, no action |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log` in `src/`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT in `src/app/layout.tsx:44` — both re-verified) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| The registry re-check | **UNCHANGED** — braces: the latest published IS the lockfile's own 3.0.3 (the fix release does not exist — unfixable upstream). Prisma: the repo on `^6.11.1` (lockfile 6.19.3); the 7.x stable line still ends at 7.10.1, the `prisma` CLI's `latest` dist-tag still on the Prisma 8 RC (8.0.0-rc.23) — a **twenty-first** consecutive re-check; the `@prisma/client` package's own `latest` dist-tag reads the stable 7.10.1 (the runtime client ships stable while the CLI's latest sits on the 8 RC — the standing accurate reading); no landscape change warranting action; the major upgrade stays the dedicated-session candidate (owner decision) |
| `.env` / db / test contracts | `.env` created from `.env.example` (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`); `db/` at the repo root (custom.db re-seeded to the 303,104-byte pin byte-identical; e2e.db scratch deleted-cold for the run); vitest.config.ts (834/20 files) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation) verified working |
| Scandihaven patterns reference | reviewed (HEAD `d4789c3`, verified by `git ls-remote`) — unchanged since the S52–S75 reviews; no architecture changes warranted |
| SSH infrastructure | REBUILT post-reset (the sixth rebuild of the chain — the S75 form): the dedicated venv `/home/z/ssh-venv` (uv, Python 3.12) + paramiko 5.1.0 (same version as the S71–S75 builds); the Appendix A shim at /home/z/my-project/bin/ssh (compile-checked, the venv-python shebang); the operator key materialized (0600, outside the repo) + fingerprint-verified by parsing the embedded **wire-format public blob** (SHA256 `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — the S59–S75 documented identity, an exact match — FIRST-TRY with the S74 checkints fix pre-applied: checkints `3917d528` matching, the priv-section 32-byte pub == the blob key material, the 64-byte private key's tail == the pub, the comment `pete@pop-os`, the [1, 2] block padding — all exact) + the wrapper dry-run GREEN **first-try with the `--remote git@github.com:nordeim/omni-study.git` flag** (remote main @ `cd53dab` == local HEAD — "Everything up-to-date"; the S74/S75 invocation-hygiene lesson applied from the start) |

### Non-gaps (documented, no action)

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace.
- The Prisma major upgrade — the named next-step candidate (owner
  decision; a dedicated session, not an in-session drive-by), the repo
  stable on 6.x (lockfile 6.19.3), the 7.x stable line ending at 7.10.1
  for a twenty-first consecutive re-check.
- The reference's Escape-close absence — the clone's documented superset,
  not a gap to close.
- The reference's transient post-login "there" greeting fallback — the
  reference's own profile-fetch render window, not a parity gap (the
  settled states match; recorded above).

### Session-specific process notes (recorded without generalizing to doctrines)

- **The capture-delta classifier EXPECTED the greeting-bucket family (the
  S74/S75 note) and NEEDED it**: S75 captured the EVENING bucket
  (~23:00 UTC), S76 the MORNING bucket (~01:15 UTC) — the chain's second
  bucket transition (the evening→morning direction, the reverse of the
  S74 morning→evening first). The classified families: the
  GREETING-BUCKET + DATE family (the h1 "Good evening"→"Good morning"
  swap in the main content rows 34–65 [x 391–838 expanded / x 211–658
  collapsed]; the date-line swap "Sunday, October 18"→"Monday, October
  19" rows 77–91; through the drawer backdrops' 4px blur rows 75–117)
  + the CLOCK-DIGIT family (the sidebar-footer clock rows 678–695 + the
  footer date chip rows 708–719 [x 30–153]; the reference footer clock
  rows 649–666 + its date chip 678–687; the app-bar clocks through the
  blur rows 17–46 [x 298–371 — ALL in the backdrop region, zero in any
  panel]; the Notes app-bar clock rows 27–36; the dashboard stat-card
  time chips — the three 9-row bands expanded [561–569/666–674/771–779,
  x 1003–1017] and collapsed [537–545/618–626/699–707, x 943–957]).
  ZERO structural movement, zero changed pixels in any drawer panel or
  sidebar chrome. The collapsed pair is NOT byte-identical this cycle
  (the greeting is in-frame in the collapsed layout — the S74 form; the
  byte-identical streak stands at one).
- **The detached-chromium-reinstall reaping**: the parallel
  `setsid bunx playwright install chromium` launched at rebuild time was
  reaped before downloading (an empty log, no chromium-1243 at the
  e2e-gate turn) — the S32 reaping lesson applies to the INSTALLER too;
  the direct foreground re-run completed normally (114.3 MiB). The
  parallel-detached form of the recipe is NOT reliable for the installer
  step; the foreground form is. (S75 ran the detached installer
  successfully; the reaping is intermittent, not deterministic — both
  forms remain valid, the foreground one the reliable one.)
- **The eval-context variable persistence**: agent-browser's `eval`
  shares one JS context across calls — a bare `const root` in a second
  probe hit "Identifier has already been declared"; the IIFE-wrapped
  form (`(() => { ... })()`) is the reliable probe shape for multi-probe
  sessions.

## The ToDo list

- [x] The arrival: the fresh clone at `cd53dab`, the five post-S75
      commits verified doc-only, the five core docs re-read, the session
      docs read (session_237 + remediation-plan-session75 + the worklog
      tail + session_238)
- [x] The environment rebuilt: `.env` from `.env.example`, `bun install`
      489 (7.18 s), `db:push` + `db:seed` to the 303,104-byte pin
      (byte-identical), chromium v1243 (114.3 MiB — the foreground
      re-run after the detached installer was reaped)
- [x] The baseline gates: lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.67 s)
      build ✓ cold-db **299 e2e ✓** (4.6 min) = **1133 green** on the
      ninth fresh-clone rebuild — the twelfth consecutive identical
      reading
- [x] The dev daemon (the S32 subshell recipe, health 200; the preflight
      GREEN first-try — no stale cache on a fresh clone) + the
      drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/9/7 verified live clean in one probe;
      the active-link triple-pin exact [on the drawer's own visible
      instance — the S75 form applied from the start]; both desktop
      sidebar states + the shared drawer state measured to the pin; the
      preference restored with the reload round-trip verified)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED** (the 25th consecutive
      sweep); the preference restored
- [x] The Mode-C review (the post-S75 commits verified doc-only; the
      static scan clean) + the dep-audit GREEN + the registry re-check
      (braces unchanged; the Prisma landscape unchanged; the CLI
      `latest` dist-tag still on the Prisma 8 RC — a twenty-first
      consecutive re-check)
- [x] The scandihaven patterns reference re-verified (unchanged,
      `d4789c3`)
- [x] The SSH infrastructure rebuilt (the dedicated venv + paramiko 5.1.0
      + the Appendix A shim compile-checked) + the operator key
      materialized + fingerprint-verified via the wire-format public
      blob FIRST-TRY (the S74 checkints fix pre-applied) + the wrapper
      dry-run GREEN FIRST-TRY with the required `--remote` flag (remote
      @ `cd53dab` == local HEAD)
- [x] This plan written and validated against the codebase
- [x] The evidence captures (5 dev-server + 2 reference) + the
      capture-delta classification vs the S75 counterparts (the
      GREETING-BUCKET + DATE + CLOCK-DIGIT families — the
      evening→morning transition pair; zero structural movement;
      classified by the pure-stdlib Python PNG decoder with the
      x-distribution cross-check)
- [x] The confirmation: `bun scripts/standing-suite.mjs` — the suite as
      the window's ONLY consumer (ONE launch via the S32 setsid recipe,
      the limiter budget fresh) — **GREEN 35/35 ON RUN 1** (the tenth
      consecutive clean-envelope reading; the result appended below)
- [x] The docs: session_239 (narrative) + session_240 (Chinese summary)
      + the README session-76 row + the worklog entry
- [ ] The evidence commit + the push via the SSH wrapper (main only) —
      the operator key shredded at session close

## The execution log

**01:12 UTC — the arrival.** The workspace found RESET (the omni-study
checkout absent, the shim + venv paramiko absent — the one-session
persisted cadence repeating as S75→S76). The fresh clone at `cd53dab`;
the five post-S75 commits verified doc-only; the five core docs re-read
(pins exact: AGENTS/CLAUDE/PAD `193132f`, the SKILL doc `c5378bc`,
README `ca5221f` [the session-75 row], the worklog advanced by the S75
entries, `src/` `193132f`); the session docs absorbed.

**01:13–01:14 — the environment rebuild.** `.env` from `.env.example`;
`bun install` 489 (7.18 s); `db:push` + `db:seed` → **303,104 bytes = the
pin byte-identical**; the Playwright chromium v1243 reinstall — the
parallel detached installer was REAPED (an empty log at the e2e-gate
turn; the S32 reaping lesson applies to the installer step), the
foreground re-run completing normally (114.3 MiB).

**01:14–01:22 — the baseline gates.** lint ✓ tsc ✓ **834 unit ✓** (20
files, 3.67 s) build ✓ (exit 0, the one documented session-22
edge-runtime warning) cold-db e2e **299/299 ✓** (4.6 min, zero flake) =
**1133 GREEN** — the counts' TWELFTH consecutive identical reading.

**01:23–01:24 — the daemon + the standing checks.** The S32 subshell
recipe launched the daemon (health 200); the preflight GREEN
**first-try** (the fresh clone carries no stale dev cache); the
drawer-check GREEN.

**01:24–01:31 — the walkthroughs.** The clone 390×844 walkthrough fully
GREEN (the census exact + traps 4/9/7 in ONE probe, the triple-pin exact
on the drawer's own visible instance — the S75 form applied from the
start, Notes auto-close, Escape-close, both desktop states, the shared
icon-only drawer, the reload round-trip). The greeting read the
**MORNING** bucket ("Good morning, Demo Student 👋" — the
evening→morning transition, the chain's second bucket transition). The
reference re-sweep with the operator account: the four anchors + both
sidebar states + the shared drawer + the Escape-close absence —
**UNCHANGED** (the 25th consecutive unchanged sweep); the preference
restored; the 2 reference captures saved (228,251 / 71,804 bytes). The
one probe observation: the reference's transient post-login "there"
greeting fallback (the profile-fetch render window) — the settled state
reads "Good morning, sepnetflix2023 👋"; recorded above, no action.

**01:31–01:33 — the Mode-C + the SSH infra.** The static scan clean;
the dep-audit exit 0 (the 2 non-production advisories); the registry
re-check UNCHANGED (twenty-first); scandihaven unchanged (`d4789c3`).
The SSH infrastructure rebuilt: the dedicated venv + paramiko 5.1.0, the
Appendix A shim compile-checked, the operator key materialized + the
wire-format fingerprint EXACT MATCH FIRST-TRY (the S74 checkints fix
pre-applied) + the full key-structure consistency check, the wrapper
dry-run GREEN FIRST-TRY with the `--remote` flag (remote @ `cd53dab`
== local HEAD). The 5 dev-server screenshots saved (the CTA gate
x1101/y32/147×36 + the dev-tools badge compact 32×32 in the
nextjs-portal shadow root; the labeled drawer via the reload round-trip
reading 20 labels/48px first-try); the capture-delta classification vs
the S75 counterparts: **the GREETING-BUCKET + DATE + CLOCK-DIGIT
families** (the evening→morning transition pair) — ZERO structural
movement, zero changed pixels in any drawer panel or sidebar chrome;
the collapsed pair NOT byte-identical (the greeting in-frame in the
collapsed layout — the S74 form) — classified by the pure-stdlib Python
PNG decoder with the x-distribution cross-check.

**01:33 — the suite launch.** The standing suite launched detached at
01:33:27 UTC via the S32 setsid subshell recipe (ONE launch — the
S74/S75 lesson applied from the start) as the window's ONLY consumer
(all browser sessions closed, the daemon tree healthy, the limiter
budget fresh — no AI-route consumption this session). While the suite
runs: this plan + the narrative docs written with the suite result
PENDING (the S69–S75 anti-fabrication discipline).

**THE STANDING SUITE RESULT (appended after completion):**

- **GREEN 35/35 ON RUN 1** (01:33:27 → ~02:40 UTC, ~67 min) — the single
  fresh-budget launch held: ZERO total findings (all 35 rows
  `findings: 0`), ZERO incidents (`failed: []`), not aborted, the
  security row **ZERO findings + 7 nonGaps** (the healthy limiter shape
  — the ONE-launch recipe with the fresh budget paying off again: no
  reaped first run, no double-launch artifact), the cwv-volume-stress
  ZERO findings in-suite (the 7 volume-affected views × 2-run medians
  at 390×844 under the Lighthouse throttle [4x CPU + Slow-4G] in light
  mode at the 300/200/250 volume profile against the standalone build —
  the budget families hold: LCP ≤ 4400 [the parity anchor — the
  reference's own seed dashboard measures 4416–4432ms under the same
  preset], CLS ≤ 0.1, FCP ≤ 1500, TTFB ≤ 500, longTasks ≤ 2000; the INP
  proxy Dashboard→Tasks **1444ms** under the full throttle) — the
  **TENTH consecutive clean-envelope reading** and the second
  consecutive clean RUN 1 form; the theme-restore closing guard
  light/violet (a mid-suite crash must not leave the demo user
  mutated). The 35-row envelope saved
  (`docs/screenshots/s76-standing-suite-evidence.json`) and verified
  against the real stage table before this appendix: stage count 35,
  all green, total findings 0, failed [], not aborted, every raw stage
  file exposing a findings collection read empty — the anti-fabrication
  check.
