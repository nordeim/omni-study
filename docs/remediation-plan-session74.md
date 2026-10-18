# Remediation Plan — Session 74 (S74): the S73+1 stability confirmation — the standing arrival audit (the seventh fresh-clone rebuild of the chain)

**The session's governing question (2026-10-18/19):** the S73 session closed
the S72+1 stability confirmation with the 1133 gates re-confirmed
byte-for-byte on the sixth fresh-clone rebuild, the standing suite GREEN
35/35 **on run 1** (the seventh consecutive clean-envelope run 1), and the
capture-delta holding at one zero-diff pair. Since the S73 close, FOUR
doc-only commits landed (`216605d` — session_223, the S73 process log;
`3da0d1a` — session_224, the S73 Chinese final transcript; `2a95223` —
session_225, the S73 English raw process log; `83573e0` — session_226, the
S73 Chinese-form record committed by the owner; all verified doc-only).
This session owed the standing arrival audit per the documented protocol
(the S73 "suggested next steps" ③) and read **ZERO findings on every
axis**: the baseline gates re-confirmed byte-for-byte on the seventh
fresh-clone rebuild, the standing checks all GREEN, the reference re-swept
**UNCHANGED since S52–S73**, the Mode-C review clean, the dep-audit GREEN,
and the registry landscape stable. **Zero code changes by design** (the
S53–S73 precedent: the smallest safe diff is no diff on a verified-green
production codebase).

## The scope (validated against the codebase before execution)

1. **The arrival**: the workspace RESET at session open (the S73
   persisted-workspace streak broken after one session — the same
   one-session cadence as S70→S71 and S72→S73; the SEVENTH fresh-clone
   rebuild of the chain: S66/S67/S68/S69/S71/S73/S74). The fresh clone at
   `83573e0`; the post-S73 commits verified doc-only; the five core docs
   re-read (AGENTS/CLAUDE/Project_Architecture_Document unchanged since
   `193132f` [S52], the SKILL doc unchanged since `c5378bc`, README
   advanced only by the session-73 row, the worklog advanced only by the
   S73 entries); the session docs (session_225 +
   remediation-plan-session73 + the worklog tail + session_226) absorbed;
   the last app-code change remains the S52 four-file fix.
2. **The environment rebuilt** (the S71/S73 reset-boundary recipe, now a
   seven-times-field-tested routine): `.env` from `.env.example`
   (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`), `bun
   install` 489 (7.60 s), `db:push` + `db:seed` to the **303,104-byte pin
   byte-identical**, the Playwright chromium v1243 reinstall (114.3 MiB).
3. **The baseline gates + the standing checks + the reference re-sweep +
   the Mode-C review**: the full documented sequence, unchanged from the
   S70–S73 executions.
4. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows,
   the suite as the window's ONLY consumer (the S66–S73 standing protocol:
   no manual audits before/during; the security stage verified from the
   raw stage output — a file read — never by re-running the audit).

## The findings

**ZERO findings — app code, test code, and docs alike.** Every axis of
the arrival audit read GREEN:

| Check | Verdict |
|-------|---------|
| Post-S73 commits | `216605d` (session_223) + `3da0d1a` (session_224) + `2a95223` (session_225) + `83573e0` (session_226) verified **doc-only** — zero app-code changes since the S52 four-file fix `193132f` |
| Baseline gates (fresh-clone rebuild) | lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.57 s) build ✓ cold-db **299 e2e ✓** (4.5 min, zero flake) = **1133 green** — byte-for-byte the documented state, the counts' TENTH consecutive identical reading |
| Build warning | The ONE Turbopack warning = the documented session-22 edge-runtime notice for `process.exit(1)` in `src/instrumentation.ts:31` (the AUTH_SECRET boot guard's intentional fail-fast; known behavior per AGENTS.md session-22 — not a finding) |
| Dev-server preflight | GREEN **first-try** (the fresh clone carries no stale `.next/dev` cache — the S72 reload-loop remedy not needed this cycle) |
| Drawer-check (S14) | GREEN (backdrop blur(4px) / panel 288 / 20 links / no footer / Escape-close superset) |
| Live 390×844 walkthrough (clone) | GREEN — login (demo@studyflow.app) → scrollWidth 390 → sidebar hidden (`display: none` on the aside) → burger visible (aria-label "Open navigation menu") → the greeting **"Good evening, Demo Student 👋"** (the EVENING bucket — the chain's first morning→evening bucket transition between capture epochs) → the drawer census exact (the root wrapper `fixed inset-0 z-50 lg:hidden` carrying the backdrop BUTTON 390×844 + the panel DIV 288×844 as its two children; 20 links in the exact reference order at 48px; the NAV element itself the scroll container **1068 vs 755** [the VERTICAL pair; scrollW 288 = clientW 288 by design]) |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the drawer nav UL: display flex / column / rowGap 4px / margin 0px), trap 9 (the backdrop BUTTON `backdrop-filter: blur(4px)`), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)`) — all three read clean in ONE probe |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Active-link triple-pin | EXACT (violet-600 label span `rgb(124, 58, 237)` + the violet→indigo 10% gradient `linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))` on the label-wrapper span + the trailing violet-500 dot `rgb(139, 92, 246)` — computed **w 6px / h 6px / border-radius 3.35544e+07px [the rounded-full computed form]**) |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260px / main width 1020, 20 leaf labels (the 40 text-bearing spans = 20 label-wrapper + 20 `ml-3 truncate` leaf labels — the documented two-span-per-link structure), 0 aria-labeled; collapsed via the "Collapse sidebar" button (aria-label "Expand sidebar" on re-probe): **80/80/1200**, nav icon svgX **33** + the header chevron svg **x=32** with the glyph **`rotate: 180deg`** (v4's rotate property — the computed `rotate`, not `transform`), `sf-sidebar-collapsed` "1" persisted, **zero text-bearing label spans in the nav** (the labels UNMOUNT), 20 aria-labeled icon-only links; the mobile drawer SHARING the state (288px panel, 44px icon-only links, svgX 32, nav scrollable **988 vs 755**, 20 aria-named, 0 text-bearing); the preference restored ("0") + the reload round-trip verified (260/1020 restored) |
| Notes via the drawer | ✓ (auto-close unmounts the drawer — the fixed-drawer count 0; H2 identity "Notes", no overflow) |
| Escape-close (clone) | ✓ (the drawer unmounts — the clone's documented superset) |
| Reference re-sweep | **UNCHANGED since S52–S73** (the 23rd consecutive unchanged sweep) — the four anchors (title "AcademiaFlow (Copy)"; greeting **"Good evening, sepnetflix2023 👋"** [the EVENING bucket — BOTH sites in the same bucket, the first morning→evening pair transition]; the 20-view order byte-identical: Dashboard/MyDay/Tasks/Calendar/Events/Timetable/Assignments/Exams/Notes/Flashcards/PracticeTests/StudyGroups/GradeTracker/Analytics/Files/Calculator/MathSolver/AIAssistant/FocusTimer/Settings; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020, 20 labels, `sidebarOpen "true"`; collapsed 80/80/1200, svgX 33, the chevron `matrix(-1, 0, 0, -1, 0, 0)` glyph at svg x=32, `sidebarOpen "false"`, zero text-bearing labels) + the shared collapsed drawer (288px panel, 44px links, svgX 32, nav 912 vs 744, ZERO aria-named — the clone's a11y superset; the DIV backdrop `blur(4px)` + `rgba(0, 0, 0, 0.2)` — the panel's SIBLING div found via the GLOBAL backdrop-filter probe); the reference's drawer does NOT close on Escape (the clone's documented superset, verified live via the GEOMETRY probe — the panel + backdrop both remain); the stored preference restored to `"true"`; 2 reference captures saved (the desktop expanded gated on the CTA "Start My Day" verified in-frame at x1093/y46/155×36 + both h1s read; the mobile labeled drawer, 20 labels 48px verified in-frame) |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log` in `src/`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT in `src/app/layout.tsx:44` — both re-verified) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| The registry re-check | **UNCHANGED** — braces: the latest published IS the lockfile's own 3.0.3 (the fix release does not exist — unfixable upstream). Prisma: the repo on `^6.11.1` (lockfile 6.19.3); the 7.x stable line still ends at 7.10.1, the `prisma` CLI's `latest` dist-tag still on the Prisma 8 RC (8.0.0-rc.23) — a **nineteenth** consecutive re-check; the `@prisma/client` package's own `latest` dist-tag reads the stable 7.10.1 (the runtime client ships stable while the CLI's latest sits on the 8 RC — the standing accurate reading); no landscape change warranting action; the major upgrade stays the dedicated-session candidate (owner decision) |
| `.env` / db / test contracts | `.env` created from `.env.example` (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`); `db/` at the repo root (custom.db re-seeded to the 303,104-byte pin byte-identical; e2e.db scratch deleted-cold for the run); vitest.config.ts (834/20 files) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation) verified working |
| Scandihaven patterns reference | reviewed (HEAD `d4789c3`, verified by `git ls-remote`) — unchanged since the S52–S73 reviews; no architecture changes warranted |
| SSH infrastructure | REBUILT post-reset (the fourth rebuild of the chain — the S73 form): the dedicated venv `/home/z/ssh-venv` (uv, Python 3.12) + paramiko 5.1.0 (same version as the S71–S73 builds); the Appendix A shim at /home/z/my-project/bin/ssh (compile-checked, the venv-python shebang); the operator key materialized (0600, outside the repo) + fingerprint-verified by parsing the embedded **wire-format public blob** (SHA256 `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — the S59–S73 documented identity, an exact match) + the full key-structure consistency check (checkints match, the priv-section 32-byte pub == the blob key material, the 64-byte private key's tail == the pub, the comment `pete@pop-os`, the [1, 2] block padding — all exact; the parse re-derived the two documented wire-format subtleties: the raw null-terminated magic + the private-section-not-second-blob read) + the wrapper dry-run GREEN with the shim prepended to PATH and the correct `--remote git@github.com:nordeim/omni-study.git` (remote main @ `83573e0` == local HEAD — "Everything up-to-date", the freshness probe clean) |

### Non-gaps (documented, no action)

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace.
- The Prisma major upgrade — the named next-step candidate (owner
  decision; a dedicated session, not an in-session drive-by), the repo
  stable on 6.x (lockfile 6.19.3), the 7.x stable line ending at 7.10.1
  for a nineteenth consecutive re-check.
- The reference's Escape-close absence — the clone's documented superset,
  not a gap to close.

### Session-specific process notes (recorded without generalizing to doctrines)

- **The greeting bucket transitioned morning→evening between the S73 and
  S74 capture epochs** — the chain's FIRST cross-bucket capture-delta. S73
  captured ~09:00 UTC (the morning bucket); S74 captured ~19:15 UTC (the
  evening bucket). The greeting h1 text swap ("Good morning" → "Good
  evening") is in-frame in the desktop layouts (main content, rows 35–65)
  and shows through the drawer backdrops' 4px blur in the mobile drawer
  captures (rows 77–117) — a documented in-page text family, zero
  structural movement. A same-bucket pair can no longer be assumed for
  the S75 capture-delta; the classifier must expect the greeting strip.
- **The collapsed zero-diff streak ended at FOUR consecutive** (S71–S73):
  the S74 collapsed pair differs (217,284 vs 217,382 bytes) because the
  greeting text is in-frame in the collapsed layout too — the
  greeting-bucket family, NOT structural movement. The S71–S73
  byte-identical readings had required the same morning bucket; the
  evening bucket breaks the streak by the documented family.
- **The suite launch required the S32 setsid subshell recipe**: the first
  launch used a bare `nohup … &` and was REAPED at stage 2 when the tool
  shell exited (the documented S32 lesson applies to the suite as well);
  the relaunch via `( setsid … & )` survived. The dead first run left no
  residue (its stage 2 settings-roundtrip was re-run and closed by the
  relaunched suite's own stages).
- **The key-structure parse hit one S74-specific bug**: the checkints
  unpack initially assigned the second checkint VALUE as the section
  offset (a `c1, q = struct.unpack(...")` slip) — fixed to read the
  offset as 8 after the checkints pair; the corrected parse verified
  every structure field exactly. The two documented wire-format
  subtleties (the raw null-terminated magic; the
  private-section-not-second-blob read) were re-derived correctly on the
  first attempt this cycle.
- **The wrapper dry-run must pass `--remote`**: the wrapper's DEFAULT
  remote is the task-management repo (its birth repo); a first dry-run
  invocation without the flag authenticated fine but pushed toward the
  WRONG repository (rejected as non-fast-forward — correct behavior).
  The corrected invocation with `--remote git@github.com:nordeim/omni-study.git`
  is GREEN. An invocation-hygiene note, not an infra defect.

## The ToDo list

- [x] The arrival: the fresh clone at `83573e0`, the post-S73 commits
      verified doc-only, the five core docs re-read, the session docs
      read (session_225 + remediation-plan-session73 + the worklog tail +
      session_226)
- [x] The environment rebuilt: `.env` from `.env.example`, `bun install`
      489 (7.60 s), `db:push` + `db:seed` to the 303,104-byte pin
      (byte-identical), chromium v1243 (114.3 MiB)
- [x] The baseline gates: lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.57 s)
      build ✓ cold-db **299 e2e ✓** (4.5 min) = **1133 green** on the
      seventh fresh-clone rebuild — the tenth consecutive identical
      reading
- [x] The dev daemon (the S32 subshell recipe, health 200; the preflight
      GREEN first-try — no stale cache on a fresh clone) + the
      drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/9/7 verified live clean in one probe;
      the active-link triple-pin exact; both desktop sidebar states +
      the shared drawer state measured to the pin; the preference
      restored with the reload round-trip verified)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED**; the preference restored
- [x] The Mode-C review (the post-S73 commits verified doc-only; the
      static scan clean) + the dep-audit GREEN + the registry re-check
      (braces unchanged; the Prisma landscape unchanged; the CLI
      `latest` dist-tag still on the Prisma 8 RC — a nineteenth
      consecutive re-check)
- [x] The scandihaven patterns reference re-verified (unchanged,
      `d4789c3`)
- [x] The SSH infrastructure rebuilt (the dedicated venv + paramiko 5.1.0
      + the Appendix A shim compile-checked) + the operator key
      materialized + fingerprint-verified via the wire-format public
      blob + the wrapper dry-run GREEN (remote @ `83573e0` == local HEAD)
- [x] This plan written and validated against the codebase
- [x] The evidence captures (5 dev-server + 2 reference) + the
      capture-delta classification vs the S73 counterparts (the
      greeting-bucket + clock-digit families only, zero structural
      movement; classified by the pure-stdlib Python PNG decoder, the
      standing cross-check form)
- [x] The confirmation: `bun scripts/standing-suite.mjs` — the suite as
      the window's ONLY consumer (no manual audits before/during; the
      security stage verified from the raw stage output) — **result
      appended below**
- [x] The docs: session_227 (narrative) + session_228 (Chinese summary)
      + the README session-74 row + the worklog entry
- [x] The evidence commit + the push via the SSH wrapper (main only) —
      pushed and verified; the operator key shredded at session close

## The execution log

**19:01 UTC — the arrival.** The workspace found RESET (the omni-study
checkout absent, the shim + venv paramiko absent — the one-session
persisted cadence repeating as S73→S74). The fresh clone at `83573e0`;
the four post-S73 commits verified doc-only; the five core docs re-read;
the session docs absorbed.

**19:02–19:04 — the environment rebuild.** `.env` from `.env.example`;
`bun install` 489 (7.60 s); `db:push` + `db:seed` → **303,104 bytes =
the pin byte-identical**; the Playwright chromium v1243 reinstall (114.3
MiB).

**19:04–19:08 — the baseline gates.** lint ✓ tsc ✓ **834 unit ✓** (20
files, 3.57 s) build ✓ (exit 0, 50/50 static pages, the one documented
session-22 edge-runtime warning) cold-db e2e **299/299 ✓** (4.5 min,
zero flake) = **1133 GREEN** — the counts' TENTH consecutive identical
reading.

**19:08–19:10 — the daemon + the standing checks.** The S32 subshell
recipe launched the daemon (health 200); the preflight GREEN
**first-try** (the fresh clone carries no stale dev cache); the
drawer-check GREEN.

**19:10–19:16 — the walkthroughs.** The clone 390×844 walkthrough fully
GREEN (the census exact + traps 4/9/7 in ONE probe, the triple-pin
exact, Notes auto-close, Escape-close, both desktop states, the shared
icon-only drawer, the reload round-trip). The greeting read the
**EVENING** bucket ("Good evening, Demo Student 👋" — the chain's first
morning→evening capture transition). The reference re-sweep with the
operator account: the four anchors + both sidebar states + the shared
drawer + the Escape-close absence — **UNCHANGED** (the 23rd consecutive
unchanged sweep); the preference restored; the 2 reference captures
saved (227,606 / 71,748 bytes).

**19:16–19:19 — the Mode-C + the SSH infra.** The static scan clean; the
dep-audit exit 0 (the 2 non-production advisories); the registry re-check
UNCHANGED (nineteenth); scandihaven unchanged (`d4789c3`). The SSH
infrastructure rebuilt: the dedicated venv + paramiko 5.1.0, the
Appendix A shim compile-checked, the operator key materialized + the
wire-format fingerprint EXACT MATCH + the full key-structure consistency
check, the wrapper dry-run GREEN (remote @ `83573e0` == local HEAD). The
5 dev-server screenshots saved (the labeled drawer via the reload
round-trip reading 20 labels/48px first-try; the dev-tools badge compact
32×32 in the nextjs-portal shadow root); the capture-delta
classification vs the S73 counterparts: the GREETING-BUCKET family (the
chain's first morning→evening transition — the h1 text swap in the main
content rows 35–65 + through the drawer backdrops' blur rows 77–117) +
the CLOCK-DIGIT family (the sidebar-footer clock rows 678–695; the
reference footer clock rows 649–666; the app-bar clocks through the
blur rows 19–46 / 27–36) — ZERO structural movement, zero changed pixels
in any drawer panel or sidebar chrome; the collapsed zero-diff streak
ended at four (the greeting in-frame in the collapsed layout — the
documented family) — classified by the pure-stdlib Python PNG decoder.

**19:19 — the suite launch (the incident and the clean relaunch).** The
standing suite launched detached at 19:19 UTC as the window's ONLY
consumer (all browser sessions closed, the daemon tree healthy). A
FIRST launch attempt via a bare `nohup … &` was REAPED at stage 2 when
the tool shell exited (the S32 lesson — it applies to the suite as well);
the relaunch via the S32 setsid subshell recipe survived. **But the
relaunched suite's stage 1 security read 1 finding** ("AI-route limiter
shape wrong, cutoffAt=1, statuses=429" + 6 nonGaps — the chain's record
is ZERO findings + 7 nonGaps): the reaped first run's security probe had
already consumed the demo user's 20-per-15-min AI budget at ~19:17, and
the relaunch's own probe landed ~50 s later INSIDE the same window —
reading cutoffAt=1 (the very first burst request 429). The finding is a
**double-launch process artifact, not a codebase defect**: the limiter
implementation (`src/lib/auth.ts` `checkRateLimit`, 20/15 min per-user)
is unchanged since S52, and the same code read ZERO findings in S69–S73.
REMEDIATION: the polluted run was stopped at stage 7 (its stage 2 had
already restored the theme — verified light/violet via a Prisma read);
the workspace waited out the 15-minute limiter window (reset ~19:32);
the full suite was relaunched at 19:34 UTC with a fresh budget, and its
stage 1 security read **ZERO findings + 7 nonGaps** (verified from the
raw stage output at 19:34:25 — the file-read protocol). While the suite
runs: this plan + the narrative docs written with the suite result
PENDING (the S69–S73 anti-fabrication discipline).

**THE STANDING SUITE RESULT (appended after completion):**

- **GREEN 35/35 on the clean relaunch** (19:34 → ~20:40 UTC, ~66 min) —
  ZERO total findings (all 35 rows `findings: 0`), ZERO incidents
  (`failed: []`), the security row **ZERO findings + 7 nonGaps** (the
  healthy limiter shape on the fresh budget — the double-launch artifact
  remediated), cwv-volume-stress ZERO findings in-suite (the 7
  volume-affected views × 2-run medians at 390×844 under the Lighthouse
  throttle [4x CPU + Slow-4G] in light mode at the 300/200/250 volume
  profile against the standalone build — the budget families hold: LCP
  ≤ 4400 [the parity anchor — the reference's own seed dashboard measures
  4416–4432ms under the same preset], CLS ≤ 0.1, FCP ≤ 1500, TTFB ≤ 500,
  longTasks ≤ 2000; the INP proxy Dashboard→Tasks 1841ms under the full
  throttle) — the **EIGHTH consecutive clean-envelope reading** (on the
  remediated relaunch); the theme-restore closing guard light/violet (a
  mid-suite crash must not leave the demo user mutated). The 35-row
  envelope saved (`docs/screenshots/s74-standing-suite-evidence.json`,
  with the launch-incident provenance noted) and verified against the
  real stage table before this appendix: stage count 35, all green,
  total findings 0, failed [], not aborted — the anti-fabrication check.
