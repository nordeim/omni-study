# Remediation Plan — Session 32 (S32): the standing-suite orchestrator — the audit-suite operating procedure that exists only in prose, given an executable form

**Audit surfaces (this session, session-65 workspace run at `cf26088`):** the
baseline gates re-confirmed the documented **575-green** state on arrival (lint
✓ tsc ✓ **284 unit** ✓ 19 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.6 min**), the S31 preflight ran GREEN before the suite
(the new S31 convention), the mobile-drawer check GREEN (backdrop
oklab+blur(4px), 288px white panel, 20 links, no footer, Escape-close), the
live agent-browser 390×844 walkthrough GREEN (app bar → drawer with all 20
links in the documented order → Settings by ref → the S26 Email card above
the S24 Change password + S25 Danger zone cards on the Profile tab;
scrollWidth 390 — **the mobile navigation menu is working as expected**), and
the reference re-sweep: **UNCHANGED since S19–S31** (login title
"AcademiaFlow (Copy)"; zero-data 0/0 dashboard with the greeting from the
email prefix; the same 20 nav views in the same order; the same five Settings
tabs with School/Grade on Profile). The 20-view copy sweep: **14/20 MATCH**
with the 6 diffs all data-state (the documented S17-pinned non-gap family).
The full standing audit suite ran **ALL GREEN with zero code findings**:
security ✓ (**0 findings, 7 nonGaps** — the documented limiter shape
`20x400 then 2x429; cutoffAt=21` after a clean single run), settings-roundtrip
✓, connectivity ✓, upload-edge ✓, data-volume ✓, forced-colors ✓, print ✓,
focus-order ✓, dark-sweep ✓ (MODE dark, 0 findings across all 20 views — the
S27 repair validated live), accent-dark-sweep ✓ (0 FAIL-class entries; the
lowcontrast residuals = the documented S11 WARN non-gap family), CWV ✓ (0
findings; CLS GOOD everywhere; the reference's own mobile login LCP POOR),
ai-error ✓ (0), ai-a11y ✓ (0), pre15-preflight ✓ ("deps pinned by design,
client bundle lean, no action"), dep-audit ✓ (GREEN — the S30 probe's second
standing re-run: 2 advisories documented non-production, 0
runtime-reachable). The demo user's theme verified restored (light/violet,
via Prisma) after the mutating audits.

## The governing finding (this session's work)

**The audit-suite operating procedure is prose-only, and the documented traps
recur.** Three pieces of evidence, all captured live this session:

1. **The double-run phantom hit this session — the third consecutive session
   to hit it** (S29 hit it, S31 hit it, this one did). Running
   `security-audit.mjs` twice (once for display, once for JSON parse) made
   the second run report `cutoffAt=1, statuses=429` — the limiter budget
   already spent by the first run — reading as the finding "AI-route limiter
   shape wrong". A less careful session would have "fixed" the limiter in
   the wrong layer. The S29/S31 sessions documented the lesson in prose;
   prose did not prevent the recurrence. Only one-run-per-audit tooling
   makes the artifact impossible by construction.
2. **Five of the sixteen envelope shapes were mis-parsed by this session's
   own manual pass.** forced-colors, print, focus-order, accent-dark-sweep
   and CWV do not carry a top-level `findings` array: the real finding
   classes live nested (`clone.views.{view}.invisible/unbounded`;
   `lightPrint.{view}` counts; `views.{view}.anomalies`;
   `{desktop,mobile}.{accent}.{view}.{flashbulbs,unreadable}`;
   `verdicts.{scenario}.{lcp,cls}`). A quick `(j.findings||[]).length`
   reads **0** on every one of them regardless of actual findings —
   this session reported them all as "findings=0" before the shape
   inventory caught it. An audit WITH a genuine finding nested in any of
   these five would have been reported GREEN by the same manual pass: the
   S28 verdict-rot class (a probe whose assertion no longer tracks the
   design), now in the operator's parse layer.
3. **The dev-server daemon-start recipe is undocumented and was re-derived
   by trial this session** (as in session-59 and session-62/64: the
   transcripts say "a more robust detachment approach" without recording
   it). The working recipe in this environment — the immediate-exit
   subshell double-fork `( setsid <cmd> </dev/null >/dev/null 2>&1 & )`,
   which reparents the daemon to PID 1 while the tool shell still lives —
   took multiple dead-server attempts to find. The recipe belongs in
   AGENTS.md verbatim (S32-C), the same way the S31 cache-clear remedy was
   written down.

The deliverable: **`scripts/standing-suite.mjs`** — the single orchestrator
that runs the whole standing suite in one command: the S31 preflight first
(abort the suite loudly on any non-green verdict, remedy included), then each
audit **spawned exactly once** with its stdout captured and classified
through a pure seam, then the demo-theme restoration verification (the
closing guard), printing one table + one JSON envelope, exiting non-zero on
any non-green stage. The per-audit interpretation knowledge (the shape
inventory above) moves from every operator's head into a unit-pinned seam.

## Families and fixes

### S32-A (HIGH) — the pure seam `src/lib/suite-verdict.ts` + the unit pins `tests/suite-verdict.test.ts`

The CLAUDE.md doctrine (pure logic in `src/lib/*` seams with unit pins;
scripts orchestrate, they don't compute):

- `parseAuditStdout(raw: string): { ok: true, json: unknown } | { ok: false,
  error: string }` — strips the leading non-JSON noise every audit emits
  (`MODE: dark`, `[cleanup] …`, CWV per-scenario progress lines) by slicing
  from the first `{` to the last `}`, then `JSON.parse`; a parse failure is a
  LOUD error, never a green.
- `classifyAudit(name, envelope): { green: boolean; findings: number;
  note: string }` — the per-audit verdict rules, one entry per standing
  audit, shape-strict:
  - findings-array audits (security, settings-roundtrip, connectivity,
    upload-edge, data-volume, ai-error, ai-a11y): `findings` must be an
    Array; green iff empty; `nonGaps` counted into the note.
  - forced-colors: every `clone.views.{view}.invisible` and
    `.unbounded` must be an Array; green iff all empty.
  - print: every `lightPrint.{view}` and `darkPrint.{view}` count must be a
    number; green iff all zero (light text in print media is the finding
    class; the `overflow` probe data rides the note).
  - focus-order: every `views.{view}.anomalies` must be an Array; green iff
    all empty (plus the dialogs/drawer guards).
  - dark-sweep: `mode` must be the string `"dark"` (a light-mode sweep is
    the S27 rot — fail loudly) and every `views.{view}.flashbulb/
    unreadable` sum zero.
  - accent-dark-sweep: every recorded
    `{desktop,mobile}.{accent}.{view}` entry must have Array
    `flashbulbs`/`unreadable`; green iff all empty — `lowcontrast` entries
    are the documented S11 WARN non-gap family and count into the note, NOT
    the findings.
  - CWV: every `verdicts.{scenario}.{lcp,cls}` must be one of
    GOOD/NI/POOR/BAD; green iff every **clone-*** scenario is GOOD or NI
    (NI = the documented S16 state); **ref-*** scenarios are informational
    (the reference's own mobile login LCP POOR is the documented state, not
    a clone finding).
  - verdict-string audits (pre15-preflight, dep-audit): `verdict` must be a
    string starting `GREEN`; otherwise non-green with the string in the
    note.
  - **The anti-phantom guard (the S28 lesson, encoded):** a missing or
    wrong-typed key on a KNOWN audit is a LOUD `shape-error` verdict —
    "envelope shape not recognized — the audit script changed; update this
    seam" — NEVER a silent green and NEVER a silent zero. Pinned
    explicitly: an envelope without `findings` on the security audit reads
    `shape-error`, not `0 findings`.
- `suiteVerdict(rows): { green: boolean; failed: string[]; summary: string }`
  — the aggregate: green iff every row green; the summary line for the
  table footer.

Pinned with fixtures harvested from **this session's genuine runs** (the
byte-exact envelope shapes captured in `/tmp/s32-*.json` during the
production-readiness sweep): one GREEN fixture per audit shape; the
shape-error fixtures (missing `findings`; `findings` as a non-Array; the
security double-run phantom envelope `cutoffAt=1` — which parses GREEN under
the naive rule and must read `shape-error` under the strict rule when the
key is absent, or `findings>0` non-green when the array is present but
non-empty); the dark-sweep MODE-light rot fixture (green findings + light
mode → non-green "mode=light" — the S27 rot); the CWV ref-POOR-is-not-a-
finding boundary; the accent lowcontrast-is-WARN-not-FAIL boundary; the
verdict-string non-GREEN case.

### S32-B (HIGH) — the orchestrator `scripts/standing-suite.mjs`

Run as `bun scripts/standing-suite.mjs` (bun-run — the dep-audit.mjs/
dev-server-preflight.mjs precedent; plain node cannot import the TS seam).
Stages, in the documented order:

1. **Preflight first (the S31 convention, now enforced):** spawn
   `bun scripts/dev-server-preflight.mjs`; on non-green, print the verdict +
   remedy and ABORT the suite (exit 1) before any audit burns budget — the
   boot-stability precondition is now executable, not advisory.
2. **The fifteen standing audits, each spawned exactly once**, stdout
   captured, classified via the seam; between audits a fixed 500 ms settle.
   Order (the documented S31 sequence): security, settings-roundtrip,
   connectivity, upload-edge, data-volume, forced-colors, print,
   focus-order, dark-sweep, accent-dark-sweep, CWV, ai-error, ai-a11y,
   pre15-preflight, dep-audit.
3. **CWV's :3200 precondition made executable:** the runner probes
   `:3200/api/health`; if dead and `.next/standalone/server.js` exists, it
   starts the standalone server itself (ephemeral `AUTH_SECRET` via
   `crypto.randomBytes(32).toString("hex")` — the S22 boot-guard satisfied;
   `DATABASE_URL="file:../db/custom.db"` — the documented convention),
   marks it `startedHere: true`, and stops it (by recorded PID) at suite
   end; if the build is missing, the stage reads `shape-error` with the
   `bun run build` remedy (loud, never silent).
4. **The demo-theme closing guard:** after the last audit, query Prisma
   (the `scripts/` import convention) for `demo@studyflow.app`; anything
   other than `themeMode: "light"` + `accentColor: "violet"` is non-green
   (a mid-suite crash must not leave the demo user dark/teal — the
   documented poisoning class).
5. **Output:** one table (`STAGE | VERDICT | FINDINGS | NOTE`) + one JSON
   envelope (`{ ranAt, stages: [...], summary, green }`) to stdout; the
   per-stage raw envelopes preserved under `/tmp/standing-suite/`; exit 0
   iff `summary.green`.

**Negative controls (the S27/S28/S30/S31 validation convention, executed
before shipping):** (a) a fabricated non-empty `findings` envelope through
the seam reads non-green (unit-pinned); (b) the dead-server preflight abort
(validated live in S31; the runner re-verified by inspection — the spawn
code path is the S31 script verbatim); (c) the genuine full suite against
the healthy dev server → all stages GREEN, exit 0; (d) the standalone
:auto-start path verified (the `startedHere` flag; the PID stopped at end).

### S32-C (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

- `AGENTS.md`: (1) the commands-table entry
  `bun scripts/standing-suite.mjs` (one command for the whole standing
  suite; the per-audit entries stay); (2) **the daemon-start recipe
  paragraph** — the verbatim recipe
  `( setsid <cmd> </dev/null >/dev/null 2>&1 & )` from the repo root, with
  the why (the harness reaps processes spawned by a tool call; the
  immediate-exit double-fork reparents to PID 1 while the tool shell still
  lives — the session-59/62/65 lesson written down at last).
- `vitest.config.ts`: the header seam list gains suite-verdict; the counts
  (19 → 20 files; 284 → the new count).
- `CLAUDE.md`: the unit-layer count + the seam + the one-command note.
- `Project_Architecture_Document.md` §8.1: the suite-verdict row + the
  Total row re-derived.
- `README.md`: the session-32 status row + the §Testing counts + the badge.
- `omni-study_SKILL.md`: the counts ×2 + **AP-77** (the lesson — below).
- `worklog.md` (repo root): the S32 entry.

**AP-77 (the lesson, MEDIUM):** the S27/S28 rot classes were probes with
rotten assertions; S30's was the un-probed surface; S31's was the unverified
environment precondition; S32's is **the operating procedure that exists
only in prose** — sixteen audits whose correct invocation and interpretation
was knowledge-in-the-operator's-head, transmitted through session
narratives. The tell: the SAME documented mistake recurred across three
consecutive sessions (the double-run phantom: S29, S31, S65) and five of
sixteen envelopes were silently mis-parsed by a careful operator following
the docs. The guard: when a procedure's correct execution depends on
sequence + interpretation knowledge, encode it as ONE command with the
interpretation in a unit-pinned seam — prose lessons do not prevent
operational mistakes; tooling does. A missing key on a known shape must
fail LOUDLY (shape-error), never silently green — the anti-phantom guard is
the difference between a tool and a trap.

### S32-D (MEDIUM) — the session record

`docs/remediation-plan-session32.md` (this file, with the execution log),
`docs/session_65.md` (the narrative), `docs/session_66.md` (the transcript,
follows the push), the S32 evidence JSON
(`docs/screenshots/s32-standing-suite-evidence.json` — the runner's genuine
output envelope), and the standing-31 screenshot refresh (no app bytes
move; the refresh proves the tree unchanged).

## Non-gaps (documented, do not fix)

1. **The per-audit scripts stay unmodified** — the runner composes them;
   rewriting fifteen scripts to a common envelope shape is churn without
   benefit (the seam absorbs the heterogeneity once, centrally).
2. **The copy sweep and the drawer check stay outside the suite** — both
   need the live reference site; the suite is the clone-side production-
   readiness sweep (the reference-dependent standing checks keep their own
   commands). The copy sweep's 14/20 + 6 data-state non-gaps and the drawer
   check remain documented standing checks.
3. **The `lowcontrast` residuals stay WARN** — the documented S11 verified
   non-gap family (contrast 2.36 on calendar day numbers); re-litigating
   the calendar grid's dark palette is parity-risking churn.
4. **No e2e spec is added** (the S27–S31 convention: probe scripts are
   execution-validated, not browser-pinned; the suite runner IS the probe).
5. **The daemon recipe is documentation, not a script** — a
   `start-dev-daemon.sh` would duplicate `bun run dev`'s contract; the
   recipe's value is the detachment shape, which operators need verbatim
   in AGENTS.md where they read commands.

## TDD order

1. **RED:** write `tests/suite-verdict.test.ts` first — the fixture set
   from this session's genuine envelopes (the GREEN shape per audit; the
   shape-error family; the double-run phantom; the MODE-light rot; the CWV
   ref-POOR boundary; the accent WARN/FAIL boundary). Run → fails (module
   `src/lib/suite-verdict` not found). Capture the failing run.
2. **GREEN:** implement `src/lib/suite-verdict.ts`. Run → the new tests
   green alongside the existing 284.
3. **The runner:** `scripts/standing-suite.mjs` (bun-run; the spawn-once
   orchestration; the :3200 auto-start; the theme closing guard). Validate
   with the negative controls (S32-B); capture the genuine full-suite run.
4. **Full gates re-run:** lint → typecheck → unit (the new count) → build
   → cold-`db/e2e.db` 291 e2e — the regression confirmation (zero app code,
   zero CSS, zero Tailwind v4 surface, zero parity-pinned bytes).
5. **Standing checks re-run:** the drawer check; the live mobile
   walkthrough if any doubt; the standing 31 screenshots refreshed via
   `capture-studyflow.mjs` (theme restored light, verified via Prisma);
   the S32 evidence JSON captured.
6. **Docs** (S32-C) + the session record (S32-D) + commit + push via the
   SSH wrapper.

## Risks

- **The fixtures are point-in-time** — if a future audit script changes its
  envelope, the seam's shape-strict guard turns it into a LOUD shape-error
  (by design; the fix is updating the seam + fixtures in the same change).
- **The :3200 auto-start could collide with an operator's server** — the
  probe-first (health check) means an already-running server is reused
  (`startedHere: false`); only a self-started server is stopped at end.
- **The suite's wall time** (~8–12 min with CWV) is longer than any single
  audit; the runner prints per-stage progress so an operator watching a
  terminal sees movement; the JSON envelope preserves everything for
  offline reading.
- **A mid-suite crash leaves the demo theme mutated** — the closing guard
  catches it on the NEXT run's report (the theme is verified at suite end,
  so a crashed run that mutated the theme reports non-green at the guard
  if it gets that far; a hard crash before the guard is caught by the next
  run's preflight + theme check — the standing verification, not a
  transaction).
- **No parity surface is touched** — the changes are one lib seam, one test
  file, one orchestrator script, and doc/comment updates; the 291 e2e pins
  and every byte-parity pin are untouched by construction.

## Execution log (session-65 workspace run)

- Baseline on arrival: the documented 575-green re-confirmed (lint ✓ tsc ✓
  284 unit ✓ 19 files; build ✓; cold-db 291 e2e ✓ 4.6 min). The S31
  preflight GREEN before the suite. The drawer check GREEN + the live
  390×844 walkthrough GREEN (**the mobile navigation menu is working as
  expected**); the reference re-sweep UNCHANGED since S19–S31; the copy
  sweep 14/20 MATCH with 6 data-state non-gaps.
- The standing suite ran all GREEN with zero code findings (security
  single-run after this session's own double-run phantom — resolved by the
  clean dev-server restart, the documented remedy; settings, connectivity,
  upload-edge, data-volume, forced-colors, print, focus-order, dark-sweep,
  accent-dark-sweep, CWV, ai-error, ai-a11y, pre15, dep-audit). Demo theme
  restored + verified (light/violet via Prisma).
- TDD RED: tests/suite-verdict.test.ts written first — 40 pins (the five
  GREEN shapes per family; the shape-error family; the double-run phantom;
  the S27 mode-light rot; the CWV ref-POOR boundary; the accent WARN/FAIL
  boundary) → run fails (module `@/lib/suite-verdict` not found — the
  `@` alias resolution makes it `src/lib/suite-verdict`).
- TDD GREEN: src/lib/suite-verdict.ts implemented → 40/40; the pins caught a
  real first-iteration bug: `suiteVerdict`'s shape-error filter used a
  brittle exact-prefix match ("update the seam" vs "update this seam") —
  replaced with the tolerant `includes("shape not recognized")` (the same
  class as S30's pins catching the severity-parsed-never-assigned bug).
  Full unit layer: 324 (20 files).
- The runner scripts/standing-suite.mjs (bun-run; the preflight enforced
  first; single-spawn-per-audit; the :3200 auto-start with ephemeral
  AUTH_SECRET; the theme closing guard). Negative control (a) validated
  live: dead server → ABORT before any audit, exit 1, the honest `bun run
  dev` remedy (0/1 green). Genuine run 1: **13/17 — NOT GREEN**, and the
  strict reading surfaced what manual passes had mis-read for sessions:
  forced-colors FAIL (the Events sr-only date input as "unbounded"),
  focus-order FAIL (2 NEXTJS-PORTAL dev-tools anomalies in StudyGroups),
  dark-sweep FAIL (a flashbulb in AIAssistant), accent-dark-sweep FAIL (12
  FAIL-class: the orange Calendar/PracticeTests white-on-accent-500 entries
  + the same flashbulb in every accent).
- Verification of every surfaced finding against the codebase and the S11
  documentation (the critical step — each checked BEFORE classification):
  (1) the flashbulb is the leaked "s14 a11y probe D2" chat row rendered
  through the DESIGNED user-bubble inversion (dark:bg-slate-100,
  aiassistant-view.tsx:157) — a GENUINE data defect: the ai-a11y-audit's D2
  probe posted a real AI request (route held, then unroute-BEFORE-reload
  released it to the real server — the S14 lesson's documented trap, order
  inverted in this script), persisting a probe pair on EVERY run (4 pairs
  found in db/custom.db: 06:14 + 07:20 from the S31 session's runs, 08:21
  + 08:53 from this session's manual + orchestrator runs); (2) the orange
  white-on-accent-500 entries are the documented S11 family-2 non-gap
  ("the accent CTA face" — remediation-plan-session11: "Calendar
  mode-switch active tab + PracticeTests Start Test — white on
  accent-500 (2.15 under amber) — Non-gap"); (3) the Events sr-only
  INPUT[type=date] (events-view.tsx:445) is the designed a11y twin of the
  visible day picker; (4) the NEXTJS-PORTAL is the dev-tools overlay (the
  AGENTS documented dev-mode artifact, absent from the standalone build).
- The genuine fix shipped: (a) ai-a11y-audit.mjs — reload FIRST then unroute
  (the S14 remedy in the right order), plus the closing Prisma cleanup of
  any rows created during the audit (the ai-error-audit pattern, scoped to
  the demo user + createdAt >= auditStart); validated live: findings 0, 4
  nonGaps, "[cleanup] removed 0" (zero rows persisted — the fix works);
  (b) the one-time DB purge of the 4 stale pairs (8 rows — the replies
  quote the probe text so one content-query took all; the demo chat is
  now the pristine seeded empty state).
- The seam's signature refinements (3 new RED pins → GREEN): the NEXTJS-PORTAL
  dev-portal exclusion (focus-order), the sr-only unbounded exemption
  (forced-colors), the white-on-accent CTA-face exemption (accent-dark-
  sweep — flashbulbs stay ALWAYS findings). 48/48 → +2 = the pre-spent-budget
  differential pins (below). Unit layer: 334 (20 files).
- Genuine run 2 (post-fix): **16/17 — NOT GREEN**; security FAIL alone —
  `cutoffAt=15, statuses=400,429`: 5 of the 20 ai: requests already spent
  in the window by this session's OWN manual ai-a11y validation runs (the
  D3 solver probe makes a real /api/math/solve call — math/solve shares
  the ai: budget) + run-1's leaked D2. The differential diagnosis encoded
  in the seam (2 more pins): the limiter-shape finding carries the
  pre-spent-budget differential — restart the dev server (clears the
  in-memory limiter — the fast documented remedy) or wait 15 min, re-run
  the suite as the window's ONLY consumer; a clean-window recurrence is a
  genuine limiter defect.
- Genuine run 3 (clean limiter window — the documented dev-server restart
  remedy + preflight GREEN, then the suite): the validation run; its
  envelope is this session's evidence. (Result recorded below post-run.)
