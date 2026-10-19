# Remediation Plan — Session 77 (S77): the S76+1 stability confirmation — the standing arrival audit (the tenth fresh-clone rebuild of the chain)

**The session's governing question (2026-10-19):** the S76 session closed
the S75+1 stability confirmation with the 1133 gates re-confirmed
byte-for-byte on the ninth fresh-clone rebuild, the standing suite GREEN
35/35 ON RUN 1 (the single fresh-budget launch — the second consecutive
clean RUN 1 form), and the capture-delta reading the greeting-bucket +
date + clock-digit families (the evening→morning transition pair — the
chain's second bucket transition). Since the S76 close, SIX commits landed
(`7a429a8` — the S76 evidence [the plan + the 35-row envelope + the 7
captures + session_239/240 + the README row + the worklog entry];
`f0a5082` — session_241, the S76 process log; `b1ba640` — session_242,
the S76 Chinese final transcript; `5d2f3bc` — session_243, the S76 raw
process log; `1fd496b` — session_244, the S76 final summary; `ed452f0` —
session_245, the S76 raw process log + a skills/-folder update [the
agent-browser SKILL refreshed upstream, the full-page-screenshot +
replicate-web-app + reference-run skills added, skill-creator slimmed] —
all in the EXCLUDED zone, zero app-code impact). This session owed the
standing arrival audit per the documented protocol (the S76 "open for
you" ③) and read **ZERO findings on every axis**: the baseline gates
re-confirmed byte-for-byte on the TENTH fresh-clone rebuild, the standing
checks all GREEN, the reference re-swept **UNCHANGED since S52–S76** (the
26th consecutive sweep), the Mode-C review clean, the dep-audit GREEN, and
the registry landscape stable. **Zero code changes by design** (the
S53–S76 precedent: the smallest safe diff is no diff on a verified-green
production codebase).

## The scope (validated against the codebase before execution)

1. **The arrival**: the workspace RESET at session open (the same
   one-session cadence as S71→S72 … S75→S76; the TENTH fresh-clone
   rebuild of the chain: S66/S67/S68/S69/S71/S73/S74/S75/S76/S77). The
   fresh clone at `ed452f0`; the six post-S76 commits verified doc-only
   for the app (the `ed452f0` skills/-folder deltas confined to the
   excluded zone); the five core docs re-read (AGENTS/CLAUDE/
   Project_Architecture_Document unchanged since `193132f` [S52], the
   SKILL doc unchanged since `c5378bc`, README advanced only by the
   session-76 row, the worklog advanced only by the S76 entries, `src/`
   still `193132f`); the session docs (session_244 +
   remediation-plan-session76 + the worklog tail + session_245)
   absorbed; the last app-code change remains the S52 four-file fix.
2. **The environment rebuilt** (the S71–S76 reset-boundary recipe, now a
   ten-times-field-tested routine): `.env` from `.env.example`
   (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`), `bun
   install` 489 (8.05 s), `db:push` + `db:seed` to the **303,104-byte
   pin byte-identical**, the Playwright chromium v1243 reinstall
   (**FOREGROUND form — the S76 lesson applied from the start**; 114.3
   MiB, first-try, no reaping this cycle).
3. **The baseline gates + the standing checks + the reference re-sweep +
   the Mode-C review**: the full documented sequence, unchanged from the
   S70–S76 executions.
4. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows,
   the suite as the window's ONLY consumer (the S66–S76 standing
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
| Post-S76 commits | `7a429a8` (S76 evidence) + `f0a5082` (session_241) + `b1ba640` (session_242) + `5d2f3bc` (session_243) + `1fd496b` (session_244) + `ed452f0` (session_245 + the skills/-folder update) verified — **zero app-code changes since the S52 four-file fix `193132f`** (the skills/ deltas live in the EXCLUDED zone: the agent-browser SKILL refreshed, full-page-screenshot + replicate-web-app + reference-run added, skill-creator slimmed — excluded from code checking/testing/compilation per the standing contract) |
| Baseline gates (fresh-clone rebuild) | lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.67 s) build ✓ cold-db **299 e2e ✓** (4.5 min, zero flake) = **1133 green** — byte-for-byte the documented state, the counts' THIRTEENTH consecutive identical reading |
| Build warning | The ONE Turbopack warning = the documented session-22 edge-runtime notice for `process.exit(1)` in `src/instrumentation.ts:31` (the AUTH_SECRET boot guard's intentional fail-fast; known behavior per AGENTS.md session-22 — not a finding) |
| Dev-server daemon | GREEN — the S32 subshell recipe `( setsid bun run dev </dev/null >/dev/null 2>&1 & )` surviving every subsequent tool call (health 200). ONE process note: an IMPROVISED launch form (`setsid bash -c 'exec bun run dev …' &` — no subshell-exit) was REAPED at the first tool-call boundary; the documented subshell form survived — the recipe's structure (the subshell backgrounds the daemon AND exits while the tool shell lives, re-parenting the daemon to PID 1 before the reaper sweeps) is load-bearing, not cosmetic |
| Dev-server preflight | GREEN after the daemon relaunch (navigations 1 in the 8s window — a single compile-triggered reload on first hit, hydrated ✓; the fresh clone carries no stale `.next/dev` cache) |
| Drawer-check (S14) | GREEN (backdrop blur(4px) / panel 288 / 20 links / no footer / Escape-close superset) |
| Live 390×844 walkthrough (clone) | GREEN — login (demo@studyflow.app) → scrollWidth 390 → sidebar hidden (`display: none` on the aside) → burger visible (aria-label "Open navigation menu") → the greeting **"Good morning, Demo Student 👋"** (the MORNING bucket — the same-bucket pair with S76; S76 ~01:15 UTC morning, S77 ~04:15 UTC morning) → the drawer census exact (the root wrapper `fixed inset-0 z-50 lg:hidden` carrying the backdrop BUTTON 390×844 + the panel DIV 288×844 as its two children; 20 links in the exact reference order at 48px; the NAV element itself the scroll container **1068 vs 755** [the VERTICAL pair; scrollW 288 = clientW 288 by design]) |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the drawer nav UL: display flex / column / rowGap 4px / margin 0px), trap 9 (the backdrop BUTTON `backdrop-filter: blur(4px)`), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)`) — all three read clean in ONE probe (the IIFE-wrapped form — the S76 lesson applied from the start) |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Active-link triple-pin | EXACT (violet-600 label span `rgb(124, 58, 237)` + the violet→indigo 10% gradient `linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))` on the label-wrapper span + the trailing violet-500 dot background `rgb(139, 92, 246)` at computed **w 6px / h 6px / border-radius 3.35544e+07px** [the rounded-full computed form] — read on the drawer's own VISIBLE instance, the S75/S76 probe form) |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260px / main width 1020, 20 leaf labels (the **40 text-bearing spans** = the documented two-span-per-link structure), 0 aria-labeled; collapsed via the "Collapse sidebar" button: **80/80/1200**, nav icon svgX **33** + the header chevron svg **x=32** with the glyph **`rotate: 180deg`** (v4's rotate property — the computed `rotate`, not `transform`), `sf-sidebar-collapsed` "1" persisted, **zero text-bearing label spans in the nav** (the labels UNMOUNT), 20 aria-labeled icon-only links; the mobile drawer SHARING the state (288px panel, 44px icon-only links, svgX 32, nav scrollable **988 vs 755**, 20 aria-named, 0 text-bearing); the preference restored ("0") + the reload round-trip verified (260/1020 restored) |
| Notes via the drawer | ✓ (auto-close unmounts the drawer — the fixed-drawer count 0; H2 identity "Notes", scrollWidth 390 no overflow) |
| Escape-close (clone) | ✓ (the drawer unmounts — the clone's documented superset) |
| Reference re-sweep | **UNCHANGED since S52–S76** (the 26th consecutive unchanged sweep) — the four anchors (title "AcademiaFlow (Copy)"; greeting **"Good morning, sepnetflix2023 👋"** [the MORNING bucket — the same-bucket morning pair, the settled state read clean this cycle with NO transient "there" fallback observed]; the 20-view order byte-identical: Dashboard/MyDay/Tasks/Calendar/Events/Timetable/Assignments/Exams/Notes/Flashcards/PracticeTests/StudyGroups/GradeTracker/Analytics/Files/Calculator/MathSolver/AIAssistant/FocusTimer/Settings; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020, 20 labels, `sidebarOpen "true"`; collapsed 80/80/1200, svgX 33, the chevron `matrix(-1, 0, 0, -1, 0, 0)` glyph at svg x=32, `sidebarOpen "false"`, zero text-bearing labels) + the shared collapsed drawer (288px panel, 44px links, nav svgX 32, nav 912 vs 744, ZERO aria-named — the clone's a11y superset; the DIV backdrop `blur(4px)` + `rgba(0, 0, 0, 0.2)` — the panel's SIBLING div found via the GLOBAL backdrop-filter probe, + the documented glass header blur(20px)); the reference's drawer does NOT close on Escape (the clone's documented superset, verified live via the GEOMETRY probe — the panel + backdrop both remain); the stored preference restored to `"true"`; 2 reference captures saved (the desktop expanded re-taken ONCE at nav-scroll-top after the scroll-state artifact was diagnosed — see the process note; the mobile labeled drawer likewise, 20 labels 48px verified in-frame) |
| Reference nav-scroll-state observation | The FIRST reference desktop comparison read 11 changed bands (rows 126–598) — diagnosed to the reference sidebar nav's **persisted scroll offset** differing between the S76 and S77 capture flows (S76's flow left the nav at scroll-top; S77's Settings→Dashboard flow left scrollTop 199): the active-link violet wash at different rows + subpixel-shifted label glyphs + the scroll shadow. Re-taking both reference captures at nav-scroll-top (the S76 condition) collapsed the delta to the documented families. A capture-condition artifact, not a reference change — the anchors all verified live UNCHANGED |
| Reference Flashcards-wash observation | The settled reference comparison shows ONE full-width band (rows 558–605, x 17–242) + a small mobile strip (rows 551–570, x 32–51) on the **Flashcards nav link**: a subtle `rgb(248, 250, 252)` wash on the link's inner wrapper present in S77's captures (and verified LIVE via computed styles) that S76's captures did not carry. The reference's Flashcards page itself unchanged ("No decks yet" — the same empty state documented across the chain); the account data unchanged. The reference's own live-state link tint (data/time-driven on its backend; the cause not externally determinable), NOT a structural change and NOT a parity gap (the violet ACTIVE wash sits on Dashboard in both captures; the anchors, geometry, order, and states all exact). Recorded as a probe observation, no action |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log` in `src/`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT in `src/app/layout.tsx:44` — both re-verified) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| The registry re-check | **UNCHANGED** — braces: the latest published IS the lockfile's own 3.0.3 (the fix release does not exist — unfixable upstream). Prisma: the repo on `^6.11.1` (lockfile 6.19.3); the 7.x stable line still ends at 7.10.1, the `prisma` CLI's `latest` dist-tag still on the Prisma 8 RC (8.0.0-rc.23) — a **twenty-second** consecutive re-check; the `@prisma/client` package's own `latest` dist-tag reads the stable 7.10.1 (the runtime client ships stable while the CLI's latest sits on the 8 RC — the standing accurate reading); no landscape change warranting action; the major upgrade stays the dedicated-session candidate (owner decision) |
| `.env` / db / test contracts | `.env` created from `.env.example` (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`); `db/` at the repo root (custom.db re-seeded to the 303,104-byte pin byte-identical; e2e.db scratch deleted-cold for the run); vitest.config.ts (834/20 files) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation) verified working |
| Scandihaven patterns reference | reviewed (HEAD `d4789c3`, verified by `git ls-remote`) — unchanged since the S52–S76 reviews; no architecture changes warranted |
| SSH infrastructure | REBUILT post-reset (the seventh rebuild of the chain — the S76 form): the dedicated venv `/home/z/ssh-venv` (uv, Python 3.12) + paramiko 5.1.0 (same version as the S71–S76 builds); the Appendix A shim at /home/z/my-project/bin/ssh (compile-checked, the venv-python shebang); the operator key materialized (0600, outside the repo) + fingerprint-verified by parsing the embedded **wire-format public blob** (SHA256 `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — the S59–S76 documented identity, an exact match, cross-checked against paramiko's own `Ed25519Key` parse) + the wrapper dry-run GREEN **first-try with the `--remote git@github.com:nordeim/omni-study.git` flag** (remote main @ `ed452f0` == local HEAD — "Everything up-to-date"; the S74–S76 invocation-hygiene lesson applied from the start). TWO in-session corrections to the verification script itself (recorded below as process notes): the AUTH_MAGIC length (15 bytes — openssh's `sshkey.c` serializes `sizeof("openssh-key-v1")` INCLUDING the trailing NUL) and the fingerprint hash scope (ssh-keygen hashes the FULL 51-byte public blob, not the bare 32-byte key material) |

### Non-gaps (documented, no action)

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace.
- The Prisma major upgrade — the named next-step candidate (owner
  decision; a dedicated session, not an in-session drive-by), the repo
  stable on 6.x (lockfile 6.19.3), the 7.x stable line ending at 7.10.1
  for a twenty-second consecutive re-check.
- The reference's Escape-close absence — the clone's documented superset,
  not a gap to close.
- The reference's Flashcards nav-link gray wash — the reference's own
  live-state tint (see the findings table); not a parity contract item.

### Session-specific process notes (recorded without generalizing to doctrines)

- **The daemon-launch form is load-bearing**: the improvised
  `setsid bash -c 'exec …' &` form (no subshell-exit) was REAPED at the
  first tool-call boundary; the documented subshell form
  `( setsid … </dev/null >/dev/null 2>&1 & )` survived. The structure —
  the subshell backgrounds the daemon AND exits while the tool shell
  lives — is what re-parents the daemon to PID 1 before the reaper
  sweeps. (S76's note generalized the reaping to the INSTALLER step;
  this cycle extends it to ANY non-subshell detached form.)
- **The reference's sidebar nav persists its scroll offset across
  navigations**: the S76/S77 capture flows left different scroll
  positions, producing an 11-band capture-delta (the active-wash rows +
  subpixel glyph shifts + the scroll shadow) that a naive classifier
  would misread as a reference change. The remedy: re-take reference
  captures at a NORMALIZED nav scroll state (scroll-top — the S76
  condition), then classify. The anchors verified live UNCHANGED
  independent of the scroll state.
- **The S77 SSH-verification script corrections**: the wire-format
  AUTH_MAGIC is 15 bytes (sizeof includes the trailing NUL — a 14-byte
  magic misaligns every subsequent field), and the ssh-keygen SHA256
  fingerprint hashes the full 51-byte public blob (authname
  length-prefix + key material), not the bare 32-byte keymat. Both were
  in-session discoveries on a freshly-written verifier; the S74–S76
  builds' verifiers carried the correct forms.
- **The capture-delta classifier expected the CLOCK-DIGIT family ONLY
  (the same-bucket morning pair, same date) and read exactly that** —
  plus the two reference-side observations (the nav-scroll artifact,
  remediated by the re-take; the Flashcards wash, a live-state tint).

## The ToDo list

- [x] The arrival: the fresh clone at `ed452f0`, the six post-S76
      commits verified (doc-only for the app; the skills/ deltas in the
      excluded zone), the five core docs re-read, the session docs read
      (session_244 + remediation-plan-session76 + the worklog tail +
      session_245)
- [x] The environment rebuilt: `.env` from `.env.example`, `bun install`
      489 (8.05 s), `db:push` + `db:seed` to the 303,104-byte pin
      (byte-identical), chromium v1243 FOREGROUND first-try (114.3 MiB —
      the S76 lesson applied from the start)
- [x] The baseline gates: lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.67 s)
      build ✓ cold-db **299 e2e ✓** (4.5 min) = **1133 green** on the
      tenth fresh-clone rebuild — the thirteenth consecutive identical
      reading
- [x] The dev daemon (the S32 subshell recipe verbatim — the improvised
      form reaped, the documented form surviving; health 200) + the
      preflight GREEN + the drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/9/7 verified live clean in one probe;
      the active-link triple-pin exact; both desktop sidebar states +
      the shared drawer state measured to the pin; the preference
      restored with the reload round-trip verified)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED** (the 26th consecutive
      sweep); the preference restored; the 2 captures re-taken at
      nav-scroll-top after the scroll-state artifact diagnosis
- [x] The Mode-C review (the post-S76 commits verified; the static scan
      clean) + the dep-audit GREEN + the registry re-check (braces
      unchanged; the Prisma landscape unchanged — a twenty-second
      consecutive re-check)
- [x] The scandihaven patterns reference re-verified (unchanged,
      `d4789c3`)
- [x] The SSH infrastructure rebuilt (the dedicated venv + paramiko 5.1.0
      + the Appendix A shim compile-checked) + the operator key
      materialized + fingerprint-verified via the wire-format public
      blob (cross-checked against paramiko) + the wrapper dry-run GREEN
      FIRST-TRY with the required `--remote` flag (remote @ `ed452f0`
      == local HEAD)
- [x] This plan written and validated against the codebase
- [x] The evidence captures (5 dev-server + 2 reference) + the
      capture-delta classification vs the S76 counterparts (the
      CLOCK-DIGIT family — the same-bucket morning pair; the collapsed
      pair BYTE-IDENTICAL — the zero-diff form; the reference
      nav-scroll artifact remediated by the re-take; the Flashcards
      live-state wash recorded) — classified by the pure-stdlib Python
      PNG decoder with the x-distribution cross-check
- [ ] The confirmation: `bun scripts/standing-suite.mjs` — the suite as
      the window's ONLY consumer (ONE launch via the S32 setsid recipe,
      the limiter budget fresh) — the result appended below
- [ ] The docs: session_246 (narrative) + session_247 (Chinese summary)
      + the README session-77 row + the worklog entry
- [ ] The evidence commit + the push via the SSH wrapper (main only) —
      the operator key shredded at session close

## The execution log

**04:08 UTC — the arrival.** The workspace found RESET (the omni-study
checkout absent, the shim + venv paramiko absent — the one-session
persisted cadence repeating as S76→S77). The fresh clone at `ed452f0`;
the six post-S76 commits verified (doc-only for the app; the `ed452f0`
skills/-folder update confined to the excluded zone); the five core docs
re-read (pins exact: AGENTS/CLAUDE/PAD `193132f`, the SKILL doc
`c5378bc`, README `7a429a8` [the session-76 row], the worklog advanced
by the S76 entries, `src/` `193132f`); the session docs absorbed.

**04:09–04:12 — the environment rebuild.** `.env` from `.env.example`;
`bun install` 489 (8.05 s); `db:push` + `db:seed` → **303,104 bytes = the
pin byte-identical**; the Playwright chromium v1243 reinstall in the
FOREGROUND form (the S76 lesson applied from the start) — completed
normally first-try (114.3 MiB), no reaping this cycle.

**04:12–04:17 — the baseline gates.** lint ✓ tsc ✓ **834 unit ✓** (20
files, 3.67 s) build ✓ (exit 0, the one documented session-22
edge-runtime warning) cold-db e2e **299/299 ✓** (4.5 min, zero flake) =
**1133 GREEN** — the counts' THIRTEENTH consecutive identical reading.

**04:17–04:19 — the daemon + the standing checks.** The FIRST daemon
launch — an IMPROVISED form (`setsid bash -c 'exec bun run dev …' &`,
no subshell-exit) — was REAPED at the first tool-call boundary (curl 200
in-call, then connection refused); the documented S32 subshell recipe
relaunched verbatim and survived every subsequent call (health 200). The
preflight GREEN (hydrated + navigation-stable); the drawer-check GREEN.

**04:19–04:26 — the walkthroughs.** The clone 390×844 walkthrough fully
GREEN (the census exact + traps 4/9/7 in ONE IIFE-wrapped probe, the
triple-pin exact on the drawer's own visible instance, Notes auto-close,
Escape-close, both desktop states, the shared icon-only drawer, the
reload round-trip). The greeting read the **MORNING** bucket ("Good
morning, Demo Student 👋" — the same-bucket pair with S76). The
reference re-sweep with the operator account: the four anchors + both
sidebar states + the shared drawer + the Escape-close absence —
**UNCHANGED** (the 26th consecutive unchanged sweep); the settled
greeting read clean with NO transient "there" fallback this cycle; the
preference restored.

**04:24–04:28 — the captures + the classification.** The 5 dev-server
screenshots saved (the CTA gate x1101/y32/147×36 + the dev-tools badge
32×32; the labeled drawer via the reload round-trip 20 labels/48px
first-try). The capture-delta classification vs the S76 counterparts
(the pure-stdlib Python PNG decoder + the x-distribution cross-check,
the classifier expecting the CLOCK-DIGIT family for the same-bucket
morning pair): the clone captures read **the CLOCK-DIGIT family ONLY**
(the sidebar-footer clock rows 678–695; the app-bar clocks through the
drawer backdrops' blur rows 17–46 [x 305–356 — ALL in the backdrop
region]; the Notes app-bar clock rows 27–36) with **the collapsed pair
BYTE-IDENTICAL** (217,654 = 217,654 — the zero-diff form back, the S75
form) — ZERO structural movement, zero changed pixels in any drawer
panel or sidebar chrome. The reference captures: the FIRST comparison
read 11 bands (rows 126–598) — diagnosed as the reference sidebar nav's
PERSISTED SCROLL OFFSET differing between the capture flows (the
active-wash rows + subpixel glyph shifts + the scroll shadow); both
reference captures RE-TAKEN at nav-scroll-top (the S76 condition),
collapsing the delta to the footer-clock band (rows 649–666) + the
app-bar clock through the blur (rows 17–46) + the ONE Flashcards
nav-link wash band (rows 558–605 desktop; rows 551–570 x 32–51 mobile)
— the reference's own live-state tint (verified present live via
computed styles; the Flashcards page itself unchanged — "No decks yet"),
recorded as a probe observation.

**04:28–04:31 — the Mode-C + the SSH infra.** The static scan clean; the
dep-audit exit 0 (the 2 non-production advisories); the registry
re-check UNCHANGED (twenty-second); scandihaven unchanged (`d4789c3`).
The SSH infrastructure rebuilt: the dedicated venv + paramiko 5.1.0, the
Appendix A shim compile-checked, the operator key materialized + the
wire-format fingerprint EXACT MATCH (cross-checked against paramiko's
own parse — the verification script carried TWO in-session corrections:
the 15-byte AUTH_MAGIC and the full-blob fingerprint scope) + the
wrapper dry-run GREEN FIRST-TRY with the `--remote` flag (remote @
`ed452f0` == local HEAD).

**04:29 — the suite launch.** All browser sessions closed; the standing
suite launched detached at 04:29 UTC via the S32 setsid subshell recipe
(ONE launch — the window's ONLY consumer; the limiter budget fresh — no
AI-route consumption this session). While the suite runs: this plan +
the narrative docs written with the suite result PENDING (the S69–S76
anti-fabrication discipline).

## The standing suite result — GREEN 35/35 ON RUN 1

**05:34 UTC — THE RESULT.** The suite completed at 05:34:32 UTC
(launched 04:29:15 — ~65 min, the full 34-stage run + the closing guard):
**ZERO total findings, ZERO incidents** — the security row ZERO findings
+ 7 nonGaps (the healthy limiter shape), cwv-volume-stress ZERO findings
in-suite (the INP proxy Dashboard→Tasks **1638 ms** under the full
Lighthouse throttle [4x CPU + Slow-4G] at the 300/200/250 volume profile
against the standalone build, ≤ 3000 budget; LCP ≤ 4400 anchored on the
reference's own seed-dashboard 4416–4432 ms), cwv GREEN with the
reference's own POOR states informational, the theme-restore guard
light/violet (a mid-suite crash must not leave the demo user mutated) —
the **ELEVENTH consecutive clean-envelope reading** and the **THIRD
consecutive clean RUN 1 form** (S75/S76/S77). The 35-row envelope saved
(`docs/screenshots/s77-standing-suite-evidence.json`, with the
launch-provenance note) and verified against the real stage table (35
rows, all green, total findings 0, failed [], not aborted — the
anti-fabrication check; the envelope's stage names match the table
row-for-row).

ONE resilience data point worth recording: the operating session hit a
mid-run boundary — the tool shell timed out and the session RESTARTED
while the suite stood at ~stage 18/33 — and the setsid-detached suite
ran through it unaffected to completion (the S32 detach survives
session restarts, not just tool-call boundaries; the relaunched session
found the envelope complete on disk — the standing-suite protocol's
handoff form working exactly as designed).
