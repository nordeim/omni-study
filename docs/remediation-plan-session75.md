# Remediation Plan — Session 75 (S75): the S74+1 stability confirmation — the standing arrival audit (the eighth fresh-clone rebuild of the chain)

**The session's governing question (2026-10-18/19):** the S74 session closed
the S73+1 stability confirmation with the 1133 gates re-confirmed
byte-for-byte on the seventh fresh-clone rebuild, the standing suite GREEN
35/35 on the clean relaunch (the remediated launch incident), and the
capture-delta reading the greeting-bucket + clock-digit families (the
chain's first morning→evening transition). Since the S74 close, FIVE
doc-only commits landed (`4083a3e` — the S74 evidence [the plan + the
envelope + the captures + session_227/228 + the README row + the worklog
entry]; `7d771ee` — session_229, the S74 process log; `f995145` —
session_230, the S74 Chinese final transcript; `e750883` — session_231,
the S74 English raw process log; `a23c9cf` — session_232, the S75
Chinese-form record committed by the owner; all verified doc-only). This
session owed the standing arrival audit per the documented protocol (the
S74 "open for you" ③) and read **ZERO findings on every axis**: the
baseline gates re-confirmed byte-for-byte on the EIGHTH fresh-clone
rebuild, the standing checks all GREEN, the reference re-swept
**UNCHANGED since S52–S74**, the Mode-C review clean, the dep-audit GREEN,
and the registry landscape stable. **Zero code changes by design** (the
S53–S74 precedent: the smallest safe diff is no diff on a verified-green
production codebase).

## The scope (validated against the codebase before execution)

1. **The arrival**: the workspace RESET at session open (the same
   one-session cadence as S70→S71, S72→S73, and S73→S74; the EIGHTH
   fresh-clone rebuild of the chain: S66/S67/S68/S69/S71/S73/S74/S75).
   The fresh clone at `a23c9cf`; the five post-S74 commits verified
   doc-only; the five core docs re-read (AGENTS/CLAUDE/Project_Architecture_Document
   unchanged since `193132f` [S52], the SKILL doc unchanged since
   `c5378bc`, README advanced only by the session-74 row, the worklog
   advanced only by the S74 entries); the session docs (session_231 +
   remediation-plan-session74 + the worklog tail + session_232)
   absorbed; the last app-code change remains the S52 four-file fix.
2. **The environment rebuilt** (the S71/S73/S74 reset-boundary recipe,
   now an eight-times-field-tested routine): `.env` from `.env.example`
   (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`), `bun
   install` 489 (6.97 s), `db:push` + `db:seed` to the **303,104-byte pin
   byte-identical**, the Playwright chromium v1243 reinstall (114.3 MiB).
3. **The baseline gates + the standing checks + the reference re-sweep +
   the Mode-C review**: the full documented sequence, unchanged from the
   S70–S74 executions.
4. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows,
   the suite as the window's ONLY consumer (the S66–S74 standing
   protocol: no manual audits before/during; the security stage verified
   from the raw stage output — a file read — never by re-running the
   audit; the limiter budget fresh — no AI-route consumption in the
   15-min window before the launch; the S74 double-launch lesson applied
   by launching ONCE via the S32 setsid subshell recipe, first-try).

## The findings

**ZERO findings — app code, test code, and docs alike.** Every axis of
the arrival audit read GREEN:

| Check | Verdict |
|-------|---------|
| Post-S74 commits | `4083a3e` (S74 evidence) + `7d771ee` (session_229) + `f995145` (session_230) + `e750883` (session_231) + `a23c9cf` (session_232) verified **doc-only** — zero app-code changes since the S52 four-file fix `193132f` |
| Baseline gates (fresh-clone rebuild) | lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.59–3.61 s) build ✓ cold-db **299 e2e ✓** (4.5 min, zero flake) = **1133 green** — byte-for-byte the documented state, the counts' ELEVENTH consecutive identical reading |
| Build warning | The ONE Turbopack warning = the documented session-22 edge-runtime notice for `process.exit(1)` in `src/instrumentation.ts:31` (the AUTH_SECRET boot guard's intentional fail-fast; known behavior per AGENTS.md session-22 — not a finding) |
| Dev-server preflight | GREEN **first-try** (the fresh clone carries no stale `.next/dev` cache) |
| Drawer-check (S14) | GREEN (backdrop blur(4px) / panel 288 / 20 links / no footer / Escape-close superset) |
| Live 390×844 walkthrough (clone) | GREEN — login (demo@studyflow.app) → scrollWidth 390 → sidebar hidden (`display: none` on the aside) → burger visible (aria-label "Open navigation menu") → the greeting **"Good evening, Demo Student 👋"** (the EVENING bucket — the SECOND consecutive same-bucket evening pair) → the drawer census exact (the root wrapper `fixed inset-0 z-50 lg:hidden` carrying the backdrop BUTTON 390×844 + the panel DIV 288×844 as its two children; 20 links in the exact reference order at 48px; the NAV element itself the scroll container **1068 vs 755** [the VERTICAL pair; scrollW 288 = clientW 288 by design]) |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the drawer nav UL: display flex / column / rowGap 4px / margin 0px), trap 9 (the backdrop BUTTON `backdrop-filter: blur(4px)`), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)`) — all three read clean in ONE probe |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Active-link triple-pin | EXACT (violet-600 label span `rgb(124, 58, 237)` + the violet→indigo 10% gradient `linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))` on the label-wrapper span + the trailing violet-500 dot `rgb(139, 92, 246)` at computed **w 6px / h 6px / border-radius 3.35544e+07px** [the rounded-full computed form] — read on the drawer's own VISIBLE instance after the hidden-desktop-instance geometry miss was caught and re-scoped) |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260px / main width 1020, 20 leaf labels (the 40 text-bearing spans = the documented two-span-per-link structure), 0 aria-labeled; collapsed via the "Collapse sidebar" button: **80/80/1200**, nav icon svgX **33** + the header chevron svg **x=32** with the glyph **`rotate: 180deg`** (v4's rotate property — the computed `rotate`, not `transform`), `sf-sidebar-collapsed` "1" persisted, **zero text-bearing label spans in the nav** (the labels UNMOUNT), 20 aria-labeled icon-only links; the mobile drawer SHARING the state (288px panel, 44px icon-only links, svgX 32, nav scrollable **988 vs 755**, 20 aria-named, 0 text-bearing); the preference restored ("0") + the reload round-trip verified (260/1020 restored) |
| Notes via the drawer | ✓ (auto-close unmounts the drawer — the fixed-drawer count 0; H2 identity "Notes", scrollWidth 390 no overflow) |
| Escape-close (clone) | ✓ (the drawer unmounts — the clone's documented superset) |
| Reference re-sweep | **UNCHANGED since S52–S74** (the 24th consecutive unchanged sweep) — the four anchors (title "AcademiaFlow (Copy)"; greeting **"Good evening, sepnetflix2023 👋"** [the EVENING bucket — BOTH sites in the same bucket, the second consecutive same-bucket evening pair]; the 20-view order byte-identical: Dashboard/MyDay/Tasks/Calendar/Events/Timetable/Assignments/Exams/Notes/Flashcards/PracticeTests/StudyGroups/GradeTracker/Analytics/Files/Calculator/MathSolver/AIAssistant/FocusTimer/Settings; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020, 20 labels, `sidebarOpen "true"`; collapsed 80/80/1200, svgX 33, the chevron `matrix(-1, 0, 0, -1, 0, 0)` glyph at svg x=32, `sidebarOpen "false"`, zero text-bearing labels) + the shared collapsed drawer (288px panel, 44px links, svgX 32, nav 912 vs 744, ZERO aria-named — the clone's a11y superset; the DIV backdrop `blur(4px)` + `rgba(0, 0, 0, 0.2)` — the panel's SIBLING div found via the GLOBAL backdrop-filter probe); the reference's drawer does NOT close on Escape (the clone's documented superset, verified live via the GEOMETRY probe — the panel + backdrop both remain); the stored preference restored to `"true"`; 2 reference captures saved (the desktop expanded gated on the CTA "Start My Day" verified in-frame at x1093/y46/155×36 + both h1s read; the mobile labeled drawer, 20 labels 48px verified in-frame) |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log` in `src/`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT in `src/app/layout.tsx:44` — both re-verified) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| The registry re-check | **UNCHANGED** — braces: the latest published IS the lockfile's own 3.0.3 (the fix release does not exist — unfixable upstream). Prisma: the repo on `^6.11.1` (lockfile 6.19.3); the 7.x stable line still ends at 7.10.1, the `prisma` CLI's `latest` dist-tag still on the Prisma 8 RC (8.0.0-rc.23) — a **twentieth** consecutive re-check; the `@prisma/client` package's own `latest` dist-tag reads the stable 7.10.1 (the runtime client ships stable while the CLI's latest sits on the 8 RC — the standing accurate reading); no landscape change warranting action; the major upgrade stays the dedicated-session candidate (owner decision) |
| `.env` / db / test contracts | `.env` created from `.env.example` (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`); `db/` at the repo root (custom.db re-seeded to the 303,104-byte pin byte-identical; e2e.db scratch deleted-cold for the run); vitest.config.ts (834/20 files) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation) verified working |
| Scandihaven patterns reference | reviewed (HEAD `d4789c3`, verified by `git ls-remote`) — unchanged since the S52–S74 reviews; no architecture changes warranted |
| SSH infrastructure | REBUILT post-reset (the fifth rebuild of the chain — the S74 form): the dedicated venv `/home/z/ssh-venv` (uv, Python 3.12) + paramiko 5.1.0 (same version as the S71–S74 builds); the Appendix A shim at /home/z/my-project/bin/ssh (compile-checked, the venv-python shebang); the operator key materialized (0600, outside the repo) + fingerprint-verified by parsing the embedded **wire-format public blob** (SHA256 `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — the S59–S74 documented identity, an exact match — FIRST-TRY this cycle with the S74 checkints fix pre-applied) + the full key-structure consistency check (checkints match `3917d528`, the priv-section 32-byte pub == the blob key material, the 64-byte private key's tail == the pub, the comment `pete@pop-os`, the [1, 2] block padding — all exact) + the wrapper dry-run GREEN **first-try with the `--remote git@github.com:nordeim/omni-study.git` flag** (remote main @ `a23c9cf` == local HEAD — "Everything up-to-date"; the S74 invocation-hygiene lesson applied from the start) |

### Non-gaps (documented, no action)

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace.
- The Prisma major upgrade — the named next-step candidate (owner
  decision; a dedicated session, not an in-session drive-by), the repo
  stable on 6.x (lockfile 6.19.3), the 7.x stable line ending at 7.10.1
  for a twentieth consecutive re-check.
- The reference's Escape-close absence — the clone's documented superset,
  not a gap to close.

### Session-specific process notes (recorded without generalizing to doctrines)

- **The capture-delta classifier EXPECTED the greeting-bucket strip (the
  S74 note) and did NOT need it**: both S74 and S75 captured in the
  EVENING bucket — the second consecutive same-bucket evening pair — so
  every changed pixel this cycle is the CLOCK-DIGIT family, and the
  collapsed pair returned BYTE-IDENTICAL (217,284 = 217,284 bytes — the
  zero-diff form back after the S74 greeting-bucket break: same evening
  bucket + same-day re-seed + no clock visible in the collapsed layout).
  The cleanest capture-delta reading of the chain: ONE band per capture,
  every band at a documented chip position, zero changed pixels in any
  drawer panel or sidebar chrome.
- **Two probe-form corrections this cycle** (the standing
  document-before-doctrine discipline): (1) the active-link triple-pin's
  geometry first read 0×0 — the `a[aria-current="page"]` selector found
  the HIDDEN desktop sidebar's instance (a display:none subtree has zero
  bounding rects); the correct form scopes to the drawer root's own
  visible instance. (2) The reference's burger carries NO aria-label
  (the reference's zero-aria surface — the clone's a11y superset); the
  positional form (x≈17/y≈14/w=36, the only visible icon-only button in
  the app bar) is the reliable finder. Both corrections re-derived
  live; no doctrine promotion (the chain's record already covers the
  forms).
- **The screenshot path form**: agent-browser's positional screenshot
  path resolves against the browser process's CWD, not the tool shell's —
  a relative path failed with ENOENT against an existing directory; the
  ABSOLUTE path form is the reliable one. (The first capture was
  recovered from the temp default; the remaining six saved direct.)
- **The suite launch applied the S74 lesson from the start**: ONE launch
  via the S32 setsid subshell recipe (no bare-nohup first attempt, no
  double launch, the limiter budget fresh — no AI-route consumption in
  the window before).

## The ToDo list

- [x] The arrival: the fresh clone at `a23c9cf`, the five post-S74
      commits verified doc-only, the five core docs re-read, the session
      docs read (session_231 + remediation-plan-session74 + the worklog
      tail + session_232)
- [x] The environment rebuilt: `.env` from `.env.example`, `bun install`
      489 (6.97 s), `db:push` + `db:seed` to the 303,104-byte pin
      (byte-identical), chromium v1243 (114.3 MiB)
- [x] The baseline gates: lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.59–3.61 s)
      build ✓ cold-db **299 e2e ✓** (4.5 min) = **1133 green** on the
      eighth fresh-clone rebuild — the eleventh consecutive identical
      reading
- [x] The dev daemon (the S32 subshell recipe, health 200; the preflight
      GREEN first-try — no stale cache on a fresh clone) + the
      drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/9/7 verified live clean in one probe;
      the active-link triple-pin exact [on the drawer's own visible
      instance]; both desktop sidebar states + the shared drawer state
      measured to the pin; the preference restored with the reload
      round-trip verified)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED**; the preference restored
- [x] The Mode-C review (the post-S74 commits verified doc-only; the
      static scan clean) + the dep-audit GREEN + the registry re-check
      (braces unchanged; the Prisma landscape unchanged; the CLI
      `latest` dist-tag still on the Prisma 8 RC — a twentieth
      consecutive re-check)
- [x] The scandihaven patterns reference re-verified (unchanged,
      `d4789c3`)
- [x] The SSH infrastructure rebuilt (the dedicated venv + paramiko 5.1.0
      + the Appendix A shim compile-checked) + the operator key
      materialized + fingerprint-verified via the wire-format public
      blob FIRST-TRY (the S74 checkints fix pre-applied) + the wrapper
      dry-run GREEN FIRST-TRY with the required `--remote` flag (remote
      @ `a23c9cf` == local HEAD)
- [x] This plan written and validated against the codebase
- [x] The evidence captures (5 dev-server + 2 reference) + the
      capture-delta classification vs the S74 counterparts (the
      CLOCK-DIGIT family ONLY — the cleanest reading of the chain; the
      collapsed pair BYTE-IDENTICAL again; classified by the
      pure-stdlib Python PNG decoder with the x-distribution
      cross-check)
- [x] The confirmation: `bun scripts/standing-suite.mjs` — the suite as
      the window's ONLY consumer (ONE launch via the S32 setsid recipe,
      the limiter budget fresh) — **GREEN 35/35 ON RUN 1** (the ninth
      consecutive clean-envelope reading; the result appended below)
- [x] The docs: session_233 (narrative) + session_234 (Chinese summary)
      + the README session-75 row + the worklog entry
- [ ] The evidence commit + the push via the SSH wrapper (main only) —
      the operator key shredded at session close

## The execution log

**22:50 UTC — the arrival.** The workspace found RESET (the omni-study
checkout absent, the shim + venv paramiko absent — the one-session
persisted cadence repeating as S74→S75). The fresh clone at `a23c9cf`;
the five post-S74 commits verified doc-only; the five core docs re-read
(pins exact: AGENTS/CLAUDE/PAD `193132f`, the SKILL doc `c5378bc`,
README `4083a3e` [the session-74 row], the worklog advanced by the S74
entries, `src/` `193132f`); the session docs absorbed.

**22:51 — the environment rebuild.** `.env` from `.env.example`; `bun
install` 489 (6.97 s); `db:push` + `db:seed` → **303,104 bytes = the pin
byte-identical**; the Playwright chromium v1243 reinstall (114.3 MiB,
launched detached in parallel with the first gates).

**22:52–22:58 — the baseline gates.** lint ✓ tsc ✓ **834 unit ✓** (20
files, 3.59–3.61 s) build ✓ (exit 0, the one documented session-22
edge-runtime warning) cold-db e2e **299/299 ✓** (4.5 min, zero flake) =
**1133 GREEN** — the counts' ELEVENTH consecutive identical reading.

**22:59–23:00 — the daemon + the standing checks.** The S32 subshell
recipe launched the daemon (health 200); the preflight GREEN
**first-try** (the fresh clone carries no stale dev cache); the
drawer-check GREEN.

**23:00–23:03 — the walkthroughs.** The clone 390×844 walkthrough fully
GREEN (the census exact + traps 4/9/7 in ONE probe, the triple-pin exact
on the drawer's own visible instance after the hidden-desktop geometry
miss was re-scoped, Notes auto-close, Escape-close, both desktop states,
the shared icon-only drawer, the reload round-trip). The greeting read
the **EVENING** bucket ("Good evening, Demo Student 👋" — the second
consecutive same-bucket evening pair). The reference re-sweep with the
operator account: the four anchors + both sidebar states + the shared
drawer + the Escape-close absence — **UNCHANGED** (the 24th consecutive
unchanged sweep); the preference restored; the 2 reference captures
saved (227,613 / 71,747 bytes).

**23:03–23:04 — the Mode-C + the SSH infra.** The static scan clean;
the dep-audit exit 0 (the 2 non-production advisories); the registry
re-check UNCHANGED (twentieth); scandihaven unchanged (`d4789c3`). The
SSH infrastructure rebuilt: the dedicated venv + paramiko 5.1.0, the
Appendix A shim compile-checked, the operator key materialized + the
wire-format fingerprint EXACT MATCH FIRST-TRY (the S74 checkints fix
pre-applied) + the full key-structure consistency check, the wrapper
dry-run GREEN FIRST-TRY with the `--remote` flag (remote @ `a23c9cf`
== local HEAD). The 5 dev-server screenshots saved (the CTA gate
x1101/y32/147×36 + the dev-tools badge compact 32×32 in the
nextjs-portal shadow root; the labeled drawer via the reload round-trip
reading 20 labels/48px first-try); the capture-delta classification vs
the S74 counterparts: **the CLOCK-DIGIT family ONLY** (the
sidebar-footer clock rows 678–695 [750 px]; the reference footer clock
rows 649–666 [765 px]; the app-bar clocks through the drawer backdrops'
blur rows 17–46 [1231/1231/1327 px]; the Notes app-bar clock rows 27–36
[259 px]) — ZERO structural movement, zero changed pixels in any drawer
panel or sidebar chrome; the collapsed pair BYTE-IDENTICAL (217,284 =
217,284 bytes — the zero-diff form returned with the same-bucket
evening pair) — classified by the pure-stdlib Python PNG decoder with
the x-distribution cross-check.

**23:05 — the suite launch.** The standing suite launched detached at
23:05 UTC via the S32 setsid subshell recipe (ONE launch — the S74
double-launch lesson applied from the start) as the window's ONLY
consumer (all browser sessions closed, the daemon tree healthy, the
limiter budget fresh — no AI-route consumption this session). While the
suite runs: this plan + the narrative docs written with the suite
result PENDING (the S69–S74 anti-fabrication discipline).

**THE STANDING SUITE RESULT (appended after completion):**

- **GREEN 35/35 ON RUN 1** (23:05 → ~00:17 UTC, ~72 min) — the single
  fresh-budget launch held: ZERO total findings (all 35 rows
  `findings: 0`), ZERO incidents (`failed: []`), the security row
  **ZERO findings + 7 nonGaps** (the healthy limiter shape — the S74
  double-launch lesson applied from the start paid off: ONE launch via
  the setsid recipe, the budget fresh, no reaped first run), the
  cwv-volume-stress ZERO findings in-suite (the 7 volume-affected
  views × 2-run medians at 390×844 under the Lighthouse throttle [4x
  CPU + Slow-4G] in light mode at the 300/200/250 volume profile
  against the standalone build — the budget families hold: LCP ≤ 4400
  [the parity anchor — the reference's own seed dashboard measures
  4416–4432ms under the same preset], CLS ≤ 0.1, FCP ≤ 1500, TTFB ≤
  500, longTasks ≤ 2000; the INP proxy Dashboard→Tasks **1466ms**
  under the full throttle) — the **NINTH consecutive clean-envelope
  reading** and the return of the clean RUN 1 form (the S66–S73
  streak form, restored after the S74 remediated-relaunch reading);
  the theme-restore closing guard light/violet (a mid-suite crash must
  not leave the demo user mutated). The 35-row envelope saved
  (`docs/screenshots/s75-standing-suite-evidence.json`) and verified
  against the real stage table before this appendix: stage count 35,
  all green, total findings 0, failed [], not aborted — the
  anti-fabrication check.
