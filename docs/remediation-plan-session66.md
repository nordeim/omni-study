# Remediation Plan — Session 66 (S66): the S65+1 stability confirmation — the standing arrival audit (the fresh-clone rebuild arrival)

**The session's governing question (2026-10-17):** the S65 session closed the S64+1
stability confirmation with the 1133 gate re-confirmed and the standing suite
GREEN 35/35 on run 1 (zero incidents — the fourth consecutive zero-incident
run 1), and exactly three doc-only commits have landed since (`be03e43` —
the S65 evidence commit: the plan + the 35-row envelope + 7 screenshots +
session_185/186 + the README row + the worklog entry; `7abc382` —
session_187, the S65 process log, + the ticked plan checkbox + the worklog
note; `31ac662` — session_188, +97, the owner's S65 conversation transcript
committed by the owner; all verified by `git show --stat`: zero app code,
the last app-code change remains the S52 four-file fix). This session owed
the standing arrival audit per the documented protocol (the S65 "suggested
next steps" ③ — the arrival re-sweep) and read **ZERO findings on every
axis**: the baseline gates re-confirmed byte-for-byte on a FRESH CLONE (the
workspace was reset mid-arrival — see the arrival section), the standing
checks all GREEN, the reference re-swept **UNCHANGED** since S52–S65, the
Mode-C review clean, the dep-audit GREEN, and the registry landscape
stable. **Zero code changes by design** (the
S53/S54/S56/S58/S59/S60/S61/S62/S63/S64/S65 precedent: the smallest safe
diff is no diff on a verified-green production codebase).

## The scope (validated against the codebase before execution)

1. **The arrival — the workspace RESET mid-arrival, the fresh-clone rebuild
   recipe exercised end-to-end.** The session's first attempt (pre-restart)
   completed the full document review and the environment reset (custom.db
   re-seeded to the 303,104-byte pin) with lint ✓ tsc ✓ 834 unit ✓ build ✓
   green, but the workspace-manager connection dropped mid-e2e (three
   consecutive tool-call EOF failures) and the operator restart revealed
   the workspace FULLY RESET — the checkout deleted. The rebuild followed
   the documented S52+ recipe verbatim: `git clone
   https://github.com/nordeim/omni-study.git` at `31ac662` (the expected
   remote HEAD), `.env` from `.env.example` (diff-identical:
   `DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""` +
   `NEXT_PUBLIC_SITE_URL`), `bun install` (489 packages), `db:push` +
   `db:seed` (custom.db **303,104 bytes** — byte-identical the S63/S64/S65
   fresh-seed pin), and the playwright chromium v1243 install step (the
   workspace cache had only v1200 after the reset; `bunx playwright install
   chromium` restored the pinned 153.0.8010.12 / v1243 pair). The five core
   docs re-read (AGENTS/CLAUDE/README/PAD/SKILL), the S65 baseline docs
   (session_187, the S65 plan, session_188, the worklog tail) absorbed —
   all pre-restart reads held (the repo content was identical at
   `31ac662`); the post-S65 commits verified doc-only by `git show
   --stat`; the skills/ catalog consulted (agent-browser, tdd,
   clone-app-pat-pro, tailwind-patterns); skills/ excluded from
   checking/testing/compilation per the standing contract.
2. **The baseline gates**: lint, tsc, the 834-test unit layer, the
   production build, the cold-`db/e2e.db` e2e (299).
3. **The standing checks**: the dev-server daemon (the S32 recipe —
   re-derived by trial AGAIN this session: a bare `nohup … &` died within
   one call, `nohup setsid … &` died within two, the documented
   subshell-exits-immediately form `( setsid bun run dev </dev/null
   >/dev/null 2>&1 & )` survives — the AGENTS.md "re-derived by trial in
   sessions 59, 62, and 65" note now also counts 66), the preflight, the
   drawer-check, the live agent-browser 390×844 walkthrough on the clone
   (the mobile-navigation emphasis + the Tailwind v4 trap surfaces), the
   desktop sidebar states + the shared mobile drawer state, the reference
   re-sweep (BOTH sidebar states — the post-S52 protocol), the Mode-C code
   review, the dep-audit + the registry re-check, the scandihaven patterns
   reference.
4. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows.

## The findings

**ZERO findings — app code, test code, and docs alike.** Every axis of the
arrival audit read GREEN:

| Check | Verdict |
|-------|---------|
| Post-S65 commits | `be03e43` (the S65 evidence, 13 files, +783) + `7abc382` (session_187 + the ticked checkbox + the worklog note) + `31ac662` (session_188, +97, the owner's S65 transcript) all verified **doc-only** by `git show --stat` — zero app-code changes since the S52 four-file fix |
| Baseline gates (fresh clone) | lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.61 s) build ✓ cold-db **299 e2e ✓** (4.7 min) = **1133 green** — byte-for-byte the documented S65 state, zero flake |
| Dev-server preflight | GREEN (hydrated + navigation-stable, health 200 via the S32 daemon recipe) |
| Drawer-check (S14) | GREEN (backdrop/panel/links/footer + Escape-close) |
| Live 390×844 walkthrough (clone) | GREEN — login (demo@studyflow.app) → scrollWidth 390 → sidebar hidden (`display: none` on the aside) → burger visible (the visibility-filtered locator: aria-label "Open navigation menu", `offsetParent !== null` — the S58 lesson) → the drawer 20 links in the exact reference order (`/Dashboard`…`/Settings`) → nav scrollable **1068 vs 755** → panel 288px, 48px labeled links. The active-link triple-pin EXACT (violet-600 `rgb(124, 58, 237)` + the violet→indigo 10% gradient `linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))` on the `.sf-nav-active` label-wrapper SPAN + the trailing violet-500 dot `rgb(139, 92, 246)` 6×6px — read on the VISIBLE drawer instance after the first probe matched the hidden desktop-pane instance, the standard dual-instance read). Notes via the drawer with auto-close ✓ (URL /Notes, drawerOpen false, scrollWidth 390, the visible H2 "Notes" identity heading at 390px — the S8-H mobile stack pattern), Escape-close ✓ |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the nav UL `flex flex-col gap-1`: display flex / gap 4px / column / **zero margin children** across all 20), trap 9 (the drawer backdrop `backdrop-filter: blur(4px)` — probed on the backdrop-filter property, not `filter`, per the v4 notched-blur contract), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)` — the documented expected form) |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260px / main width 1020, 20 visible labels; collapsed via the "Collapse sidebar" button (aria-label flips to "Expand sidebar" in the collapsed state): 80/80/1200 with 20 icon-only links (svgX 33, all icons at the identical x — the x-position probe per the S52 protocol — **zero label spans in the DOM**: the labels UNMOUNT in the collapsed state, stronger than hidden), the glyph `rotate: 180deg` (v4's rotate property ≡ the reference's rotate-180 matrix; the `transform` property reads "none" — the documented v4 form), `sf-sidebar-collapsed` "1" persisted; the mobile drawer SHARING the state (the 288px panel, 44px icon-only links, svgX 32, nav scrollable 988 vs 755, 20 aria-named icon-only links — the clone's accessible-name superset); the preference restored to expanded ("0") + the reload round-trip verified (aside 260 after reload, main ml 260px) |
| Reference re-sweep | **UNCHANGED since S52–S65** — the four anchors (title "AcademiaFlow (Copy)"; greeting "Good morning, sepnetflix2023 👋" [the hour-07 UTC bucket — the morning band 0–11, correct per the bucket map]; the 20-view href order `/Dashboard`…`/Settings` byte-identical; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020, 20 labels, `sidebarOpen "true"`; collapsed via the unlabeled position-button: 80/80/1200, icon-only svgX 33, the `matrix(-1, 0, 0, -1, 0, 0)` glyph, `sidebarOpen "false"` persisted) + the shared collapsed drawer (the nav census per the S58 lesson: the drawer's own visible nav x0 w288, the 288px panel, 44px icon-only links, svgX 32, nav 912 vs 744, the reference's own DIV backdrop `blur(4px)` + `rgba(0, 0, 0, 0.2)` — the v3-era form; the clone's `oklab(0 0 0 / 0.2)` is the documented v4-equivalent, trap 7's dual-serialization acceptance); the reference's drawer does NOT close on Escape (the clone's documented superset, verified live via the GEOMETRY probe — the S62 doctrine, first-probe correct: after Escape the 288px panel remains + the backdrop remains present); the stored preference restored to `"true"` before session close (aside 260 verified after the restore reload); 2 reference captures saved (the desktop expanded gated on the CTA "Start My Day" verified in-frame at x1093/y46/155×36 + both h1s read ["StudyFlow", "Good morning, sepnetflix2023 👋"]; the mobile labeled drawer, 20 labels 48px verified in-frame) |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT in `src/app/layout.tsx:44`) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| The registry re-check | **UNCHANGED** — braces: the latest published IS the lockfile's own 3.0.3 (the fix release does not exist — unfixable upstream). deepmerge-ts: the stable fix path re-confirmed on **Prisma 7.10.1** (`@prisma/config@7.10.1` → deepmerge-ts 8.0.2; the 7.x stable line still ends at 7.10.1, no newer 7.x has shipped), the `latest` dist-tag still on the Prisma 8 RC (8.0.0-rc.23, not production-safe; `prev` = 7.10.1; the `next` tag also an 8.0.0-rc.10 RC channel — no stable change). The S56–S65 judgment call re-affirmed: the major ORM upgrade stays the named next-step candidate for a DEDICATED session (owner decision, stable at 7.10.1 for an eleventh consecutive re-check) |
| `.env` / db / test contracts | `.env` created from `.env.example` on the fresh clone (diff-identical by construction) with `DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`; `db/` at the repo root (custom.db re-seeded to the 303,104-byte pin + e2e.db scratch deleted-cold every run; never colliding); the three-tool db-path resolution pinned by `tests/db-path.test.ts`; vitest.config.ts (834/20 files, `*.test.ts` only) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation via the shell-supplied `E2E_DATABASE_URL`, workers 1, retries 0) verified working |
| Scandihaven patterns reference | reviewed (HEAD `d4789c3`, verified by `git ls-remote`) — unchanged since the S52–S65 reviews; no architecture changes warranted |
| SSH infrastructure | rebuilt after the workspace reset (the reset also wiped `/home/z/my-project/bin/` + the venv paramiko): the Appendix A shim re-written at `/home/z/my-project/bin/ssh` (on PATH for the wrapper invocation), paramiko 5.0.0 re-installed into the venv python, the operator key materialized (0600, outside the repo) + fingerprint-verified (ed25519, SHA256 `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — the S59–S65-documented identity, an exact match), the wrapper dry-run GREEN with the explicit --remote `git@github.com:nordeim/omni-study.git` (remote main @ `31ac662` == local HEAD — no remote-ahead state this cycle) |

### Non-gaps (documented, no action)

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace.
- The Prisma 7 upgrade — the named next-step candidate (owner decision;
  a dedicated session, not an in-session drive-by), stable at 7.10.1 for an
  eleventh consecutive re-check.
- The reference's Escape-close absence — the clone's documented superset,
  not a gap to close.

### Session-specific process notes (recorded without generalizing to doctrines)

- **The mid-arrival connection drop + workspace reset**: the session's
  first attempt was interrupted mid-e2e by three consecutive
  workspace-manager EOF failures (reported to the operator per the
  standing rule; the restart revealed the checkout deleted). All
  pre-restart reads held — the clone landed at the identical `31ac662`.
  The rebuild recipe (the S52+ documented sequence) restored the full
  environment without deviation; the gates re-confirmed byte-for-byte on
  the fresh clone.
- **The daemon-start recipe re-derived by trial (again)**: a bare
  `nohup bun run dev > log &` died within one tool call; `setsid nohup … &
  disown` survived one call then died; ONLY the documented AGENTS.md
  subshell form `( setsid bun run dev </dev/null >/dev/null 2>&1 & )` —
  the subshell exits immediately while the tool shell lives, the daemon
  reparents to PID 1 before the reaper walks the tree — survived
  durably. The AGENTS.md recipe note ("re-derived by trial in sessions
  59, 62, and 65") now also counts this session.
- **The reference labeled-drawer first-census misread**: the first
  post-collapse drawer census at 390×844 read the LABELED state (48px
  links, nav 992 vs 744) — the session's own first blind
  `document.querySelectorAll('button')[0].click()` (attempting the burger
  before locating it properly) had toggled the preference back to "true".
  Re-done cleanly (collapse at 1280×800 → verify pref "false" → viewport
  390×844 → reload → verify pref "false" held → open via the
  snapshot-located burger) → the icon-only census EXACT to every pin
  (44px, 912 vs 744). Recorded as the S52 probe lesson's sibling: locate
  the control before clicking it; verify the state before reading the
  census.
- **The reference burger has NO aria-label** (documented since S52 — the
  clone's aria-label is the superset): a coordinate mouse-click at (30,30)
  missed (the button's live geometry differed from the stale read); the
  snapshot-ref click (`agent-browser snapshot -i` → the unnamed button
  ref) worked on the first try.

## The ToDo list

- [x] The arrival: the first attempt's document review + environment reset
      + lint/tsc/834/build green (pre-restart), the connection drop
      reported to the operator, the restart's workspace reset discovered,
      the fresh-clone rebuild recipe executed (clone at `31ac662`, .env
      from .env.example, bun install 489, db:push + db:seed to the
      303,104-byte pin, chromium v1243 reinstalled), the post-S65 commits
      verified doc-only
- [x] The baseline gates: lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.61 s)
      build ✓ cold-db **299 e2e ✓** (4.7 min) = **1133 green** on the
      fresh clone
- [x] The dev daemon (the S32 recipe, health 200, surviving tool-call
      boundaries) + the preflight GREEN + the drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/7/9 verified live clean; both desktop
      sidebar states + the shared drawer state measured to the pin; the
      preference restored with the reload round-trip verified)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED**; the preference restored
- [x] The Mode-C review (the post-S65 commits verified doc-only; the
      static scan clean) + the dep-audit GREEN + the registry re-check
      (braces unchanged; the Prisma 7.10.1 fix path re-confirmed; no newer
      7.x; the `latest` dist-tag still on the Prisma 8 RC)
- [x] The scandihaven patterns reference re-verified (unchanged,
      `d4789c3`)
- [x] The SSH infrastructure rebuilt post-reset (shim + paramiko 5.0.0 +
      the operator key fingerprint-verified + the wrapper dry-run GREEN —
      the freshness probe read clean at `31ac662`)
- [x] This plan written and validated against the codebase
- [x] The confirmation run 1: `bun scripts/standing-suite.mjs` — **34/35
      on run 1** (the cwv-volume-stress stage: 2 budget breaches, both on
      the Tasks view — LCP 4836 > 4400 + longTaskTotal 2016 > 2000); the
      variance study decisive (below); the corrected validation run 2
      launched per the S51 precedent
- [x] The confirmation run 2: **34/35 again — TWO independent artifacts,
      both now classified with decisive evidence**: (a) the
      **cwv-volume-stress stage GREEN in-suite this time** (Tasks LCP
      4060, longTaskTotal 1182 — comfortably inside the budgets,
      confirming the run-1 breach as the cold-workspace load artifact);
      (b) the **security stage FAILED with the pre-spent-budget
      differential** (the C-family probe measured the AI-route limiter
      cutoffAt=16 with statuses 400,429 — run 1's own security probe had
      spent 4 of the 20/15-min in-memory budget, and run 2 fifteen
      minutes later inherited the partially-spent limiter; the finding's
      own remedy names it: restart the dev server). **The remedy applied
      and verified: the dev daemon restarted (the in-memory limiter
      cleared) → the security stage standalone re-run read ZERO findings,
      exit 0** (7 nonGaps, the documented family). No prior session ran
      the suite twice — the cross-run limiter poisoning is new territory,
      classified as a measurement-environment artifact, NOT a code
      regression (zero code changes since S52). The clean-envelope run 3
      launched on the fresh limiter + the warm workspace (PID 16149,
      10:14 UTC) — the verdict recorded below
- [x] The confirmation run 3: **34/35 — the security differential AGAIN,
      and the root cause found in the codebase's own encoded guidance**:
      the fresh daemon was started at 10:13:38 and the remedy verification
      (the standalone security audit at 10:13:56) read GREEN — but that
      manual audit's own C-probe (22 requests against the shared
      20/15-min `ai:<demo-user>` budget) OVERLAPPED run 3's security
      stage (~10:15), pre-spending the window the suite needed. The
      `src/lib/suite-verdict.ts` classification comment (the S32/S49
      encoded lesson) states it exactly: "the suite must be the window's
      ONLY consumer (no manual audit runs before/during)" — the session's
      well-intentioned remedy verification violated precisely that. The
      S49 precedent had closed the same class the same way ("confirmed
      environmental twice: the dev server restarted → the security audit
      standalone findings [] GREEN, and the validation suite's security
      stage GREEN on the fresh window"). **Run 4 protocol per the encoded
      guidance**: the full daemon tree killed + restarted (11:24:18),
      NO manual audit runs before/during, the suite launched as the
      window's only consumer (PID 20006, 11:25 UTC) — the security stage
      already read ZERO findings in-suite (the raw stage output verified
      by file read, consuming nothing); the full verdict recorded below
- [x] The confirmation run 4 (the clean envelope per the encoded protocol):
      **GREEN 35/35, ZERO total findings, ZERO incidents** — every row
      green, `failed: []`, `aborted: false`; the security stage ZERO
      findings in-suite on the fresh-limiter + suite-as-only-consumer
      protocol; the cwv-volume-stress stage GREEN in-suite (the third
      consecutive green reading: 4176 / 4164 standalone + the in-suite
      green). The 35-row envelope with the 4-run context header saved as
      `docs/screenshots/s66-standing-suite-evidence.json`
- [x] The evidence captures: the 5 dev-server screenshots + the
      capture-delta classification vs the S65 counterparts — fully the
      clock/data family with ZERO structural movement (the classification
      below)
- [x] The docs: session_189 (narrative) + session_190 (Chinese summary) +
      the README session-66 row + the worklog entries
- [x] The evidence commit + the push via the SSH wrapper + the follow-up
      (session_191, the process log) — the evidence commit `ccec0fc`
      pushed and verified (remote main @ `ccec0fc` == local HEAD); this
      follow-up commit carries session_191 + the ticked checkbox + the
      worklog note

## The execution log

- **The baseline gates re-confirmed byte-for-byte on the fresh clone**:
  lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.61 s) build ✓ cold-db e2e 299/299
  (4.7 min) = **1133 green**, zero flake — the count anchors untouched.
- **The standing checks all GREEN**: the preflight (hydrated +
  navigation-stable) + the drawer-check (backdrop/panel/links/footer +
  Escape-close) + the live agent-browser 390×844 walkthrough (the mobile
  navigation menu working as expected; NO Tailwind v4 bug — traps 4/7/9
  verified live clean; the active-link triple-pin exact; both desktop
  sidebar states + the shared drawer measured to every pin; the
  preference restored with the reload round-trip verified).
- **The reference re-swept UNCHANGED since S52–S65**: the four anchors
  (incl. the hour-7 "Good morning" greeting — the morning bucket, correct
  per the bucket map), both sidebar states, the shared drawer with its own
  DIV backdrop, the Escape-close absence via the geometry probe
  (first-probe correct), the preference restored to "true", the 2
  reference captures saved with absolute paths.
- **The Mode-C review ZERO app-code findings** (the post-S65 commits
  verified doc-only; the static scan clean — the two documented exceptions
  re-verified); the dep-audit exit 0 (the 2 documented non-production
  advisories); the registry re-check UNCHANGED (braces 3.0.3 = latest —
  unfixable upstream; the Prisma 7.x stable line still ends at 7.10.1, the
  latest dist-tag still on the Prisma 8 RC — stable at 7.10.1 for an
  eleventh consecutive re-check); scandihaven unchanged (d4789c3).
- **The standing suite run 1** (launched detached, PID 7641, 07:56 UTC,
  after all interactive browser sessions closed — the OOM lesson):
  **34/35 green — the cwv-volume-stress stage FAILED with 2 budget
  breaches, both on the Tasks view** (LCP 4836 > 4400 [the parity
  anchor], longTaskTotal 2016 > 2000 [the S13 B3 sibling]; maxLongTask
  1309). Every other stage green, zero incidents. The first suite
  run-1 failure since the S51 in-suite correction — investigated
  decisively per the S47/S51 precedent (documented, never silent):
- **The variance study (the S51 protocol, 3 points, all with IDENTICAL
  mainNodes 7894 — the same rendering workload)**: (1) the suite's
  run-1 reading — Tasks LCP 4836, longTaskTotal 2016, taken ~70 min
  into the suite's sustained browser workload on the freshly-rebuilt
  workspace (the first-ever suite run on the cold clone); (2) the
  standalone re-run — LCP 4176, longTaskTotal 1301, maxLongTask 805,
  **0 findings, exit 0**; (3) the standalone re-run again — LCP 4164,
  longTaskTotal 1236, maxLongTask 778, **0 findings, exit 0**. The
  standalone readings cluster within 12 ms (LCP) / 65 ms (longTask) of
  each other; the suite's run-1 readings sit **+660 / +750 ms above the
  stable cluster** — far outside the runs-2/3 variance and consistent
  with the S51 system-load noise mechanism, widened by the cold-cache
  first-run condition. **Classification: a system-load measurement
  artifact of the first suite run on the freshly-rebuilt workspace, NOT
  a code regression** (impossible — zero code changes since the S52
  four-file fix; the identical mainNodes prove the same workload)
  **and NOT a budget defect** (the 4400 parity anchor holds with
  224–236 ms headroom on the stable readings; the reference's own seed
  dashboard measures 4416–4432 ms under the same preset — the S51
  re-anchor remains principled). **The budgets are untouched** (no
  guard weakened to make a gate pass). The corrected validation run 2
  launched per the S51 precedent (the suite re-run on the now-warm
  workspace; PID 12379, 09:04 UTC).
- **The standing suite run 2** (PID 12379, 09:04–10:12 UTC): **34/35
  again — two independent artifacts, both decisively classified**:
  (a) the **cwv-volume-stress stage GREEN in-suite** (Tasks LCP 4060,
  longTaskTotal 1182, maxLongTask 701, mainNodes 7894 — comfortably
  inside the budgets; the run-1 breach confirmed as the cold-workspace
  system-load artifact, the variance study's prediction holding);
  (b) the **security stage FAILED** with the C-family probe measuring
  the AI-route limiter at cutoffAt=16, statuses 400,429 — the
  **pre-spent-budget differential**: run 1's own security C-probe had
  spent 4 of the 20-per-15-min in-memory AI budget against the dev
  daemon, and run 2 (launched ~68 min later, but the limiter window
  and the daemon's memory persisting across runs) inherited the
  partially-spent budget, shifting the measured cutoff from 20 to 16.
  The finding's own remedy names the fix: restart the dev server
  (clears the in-memory limiter). **The remedy applied and verified**:
  the daemon restarted by PID (the AP-70 lesson), the `.next/dev`
  cache cleared preventively, the health 200 restored, and the
  security stage standalone re-run read **ZERO findings, exit 0** (7
  nonGaps — the documented family). No prior session ran the suite
  twice within one session — the cross-run limiter poisoning is new
  territory recorded here (the S13/S14 in-run poisoning lessons'
  cross-run sibling). Classification: a measurement-environment
  artifact, NOT a code regression (zero code changes since S52).
- **The clean-envelope run 3** (PID 16149, 10:14 UTC): **34/35 — the
  security differential again**, and the root cause found in the
  codebase's own encoded guidance. The run-2 remedy (daemon restart +
  standalone verification) was correct in isolation but the
  VERIFICATION ITSELF poisoned run 3: the standalone security audit at
  10:13:56 read GREEN on the fresh limiter — spending its C-probe's 22
  requests against the shared `ai:<demo-user>` 20/15-min budget — and
  run 3's security stage (~10:15, ~60-90 s later, still inside the
  15-min window) measured cutoffAt=16 (the interleaved accounting of
  the two overlapping probes). The `src/lib/suite-verdict.ts`
  classification comment — the S32/S49 encoded lesson, in the codebase
  since the S51-era seam work — states the protocol exactly: "the
  limiter is a SHARED 20/15-min per-user budget across EVERY audit
  invocation, so any manual audit run inside the suite's window (before
  or during) consumes it... the suite must be the window's ONLY
  consumer (no manual audit runs before/during)". The S49 commit
  message records the same class closed the same way (the accidentally
  killed first suite instance → the pre-spent window → restart →
  standalone GREEN → the validation suite's security stage GREEN on
  the fresh window). **Lesson recorded: the remedy verification is
  itself a consumer — after a daemon restart, launch the suite
  directly; verify the security stage's verdict from the raw stage
  output (a file read, consuming nothing), never by re-running the
  audit.**
- **The clean-envelope run 4** per the encoded protocol: the full daemon
  tree killed (all four processes this time — the run-3 restart's grep
  had matched only two of the four tree lines) + `.next/dev` cleared +
  a fresh daemon at 11:24:18, NO manual audit runs before/during, the
  suite launched as the window's only consumer (PID 20006, 11:25 UTC).
  **GREEN 35/35 on run 4, ZERO total findings, ZERO incidents** (every
  row green, `failed: []`, `aborted: false`; the security stage ZERO
  findings in-suite; the cwv-volume-stress stage GREEN in-suite — the
  third consecutive green reading after the variance study). The 35-row
  envelope with the 4-run context header saved as
  `docs/screenshots/s66-standing-suite-evidence.json` (~68 min wall,
  11:25–12:32 UTC).
- **The evidence captures** (a fresh session + re-login per the S53+
  lesson): the 5 dev-server screenshots —
  `s66-clone-desktop-expanded-1280.png` (aside 260 / ml 260 — gated on
  the CTA "Start My Day" verified in-frame at x1101/y32/147×36 + both
  h1s read ["StudyFlow", "Good afternoon, Demo Student 👋"] — the S59
  capture-lesson doctrine applied), `s66-clone-desktop-collapsed-1280.png`
  (aside 80 / svgX 33, the dev-tools badge settled compact before the
  capture per the S65 lesson), `s66-clone-mobile-drawer-icononly-390.png`
  (the shared collapsed state — the 288px panel, 44px icon-only links,
  svgX 32, settled ~2 s before the capture per the S65 lesson),
  `s66-clone-mobile-drawer-labeled-390.png` (the default — after the
  preference restore + reload, 20 labeled links, 48px, pref "0"), and
  `s66-clone-mobile-notes-390.png` (navigated through the drawer, the
  auto-close verified in-frame, drawerOpen false, the H2 "Notes"
  identity heading read, scrollWidth 390). Plus the 2 reference captures
  (228,167 / 71,801 bytes — saved during the re-sweep) and the variance
  study + the suite envelope JSONs.
- **The capture-delta classification** (the S66 set vs the S65
  counterparts): **fully the clock/data family with ZERO structural
  movement — widened deterministically by the GREETING-BUCKET CROSSING**
  (S65's captures: the morning bucket "Good morning"; S66's: the
  afternoon bucket "Good afternoon" — the session crossed 12:00 UTC
  between the reference sweep and the clone captures; the S60/S62
  precedent: a bucket crossing widens the clock family by the greeting
  band; same calendar day Oct 17 — no date-line crossing):
  (1) the desktop expanded — 8,153 px (0.796%): the greeting row
  y 40-79 **6,734 px** (the one-line desktop greeting
  "Good morning" → "Good afternoon") + the footer sf-clock-chip band
  y 640-719 **1,012 px** (the live clock) + the top band 407 px;
  (2) the desktop collapsed — 7,141 px: the greeting row 6,734 px + the
  top band 407 px — **the footer band ZERO** (the collapsed footer is
  empty by the S52 contract — the byte-identity of S63–S65 was the
  same-bucket morning pair; the S66 delta is the greeting crossing,
  correctly absent from the footer);
  (3) the mobile drawers (icon-only 6,069 px, labeled 6,013 px) — ALL
  differences at **x 288-382, the blurred BACKDROP region right of the
  288px panel**: the app-bar clock band y 0-39 (~1,400 px) + the
  wrapped two-line greeting y 80-159 (~4,220 px) — the DOM probe
  confirms the mobile greeting h1 at x16/y80/w358/h72 (two wrapped
  lines, y 80-152) showing through the blur; **the drawer panels
  themselves pixel-identical** (zero differing px at x < 288);
  (4) the mobile Notes view — 366 px ALL at the app-bar clock band
  (x 307-360, y 27-36). No DOM-probe ambiguity remained: every band
  localized to a named clock/greeting surface.
- **The docs**: this plan + session_189 (narrative) + session_190
  (Chinese summary) + the README session-66 row + the worklog entries.
  The count anchors (1133/834/299) untouched — zero code changes.
