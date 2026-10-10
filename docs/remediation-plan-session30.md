# Remediation Plan — Session 30 (S30): the dependency-security audit — the never-audited surface, given a standing reachability-classified probe

**Audit surfaces (this session, session-59 workspace run at `6d17a67`):** the
full production-readiness sweep ran on arrival — the baseline gates (lint ✓
tsc ✓ 258 unit ✓; `bun run build` ✓; the cold-`db/e2e.db` full e2e regression
**291 ✓ (4.6 min)** = the documented **549-green** state re-confirmed), the
mobile-drawer check (backdrop `oklab(0 0 0/0.2)` + blur(4px), 288px white
panel, 20 links, no footer, Escape-close superset) **plus a live
agent-browser walkthrough at 390×844** (the app bar with the
Open-navigation-menu button + brand + live clock; the drawer opens as a
dialog with all 20 links; the Settings link navigates by ref; the Profile
tab renders the S26 Email address card above the S24 Change password + S25
Danger zone cards; scrollWidth 390 — **the mobile navigation menu is working
as expected**), and the reference re-sweep (login + dashboard + drawer +
Settings/Profile at 390×844): **the reference is UNCHANGED since S19–S29**
(zero-data 0/0, greeting from the email prefix, "Saturday, October 10,
2026"; the same 20 nav views in the same order; the login/title
"AcademiaFlow (Copy)" platform-rename artifact with the in-app "StudyFlow"
branding; the same five Settings tabs with School/Grade/Goal/Account
created). The 20-view copy sweep: **14/20 MATCH** with the 6 diffs all
data-state (the documented S17-pinned non-gap family). The recent code
changes audited: the S28 `scripts/connectivity-audit.mjs` family A4 repair
(line-by-line — the designed-channel assertion with the three guards, CLEAN)
and the S29 docs/config-comment changes (verified in place). The standing
audit suite ran **all GREEN with zero code findings**: security ✓ (0
findings, 7 nonGaps, the documented limiter shape `20x400 then 2x429;
cutoffAt=21`), settings-roundtrip ✓, connectivity ✓ (the S28 repair
validated live), upload-edge ✓, data-volume ✓, forced-colors ✓, print ✓,
focus-order ✓, CWV ✓ (0 findings; CLS 0.00 everywhere; throttled-mobile
dashboard LCP NI 2644/2728 ms — the documented S16 state; the reference's
own mobile login LCP POOR 7952 ms + its dashboard LCP 4312 ms / CLS 0.261),
dark-sweep ✓ (the S27 repair validated live: MODE dark, flashbulb=0
unreadable=0 across all 20 views), accent-dark-sweep ✓ (0 FAIL; the residual
lowcontrast entries = the documented S11 verified non-gap family),
ai-error-audit ✓ (0), ai-a11y-audit ✓ (0), pre15-preflight ✓ ("deps pinned
by design, client bundle lean, no action"). The demo user's theme verified
restored (light/violet, via Prisma) after the mutating audits.

## The governing finding (this session's work)

With both backlogs empty, the reference unchanged, and every standing audit
green, the sweep looked for the un-audited surface — and found one: **the
dependency-security surface**. `scripts/pre15-preflight.mjs` (the S15
pre-1.0 dependency sweep) measures `outdatedCount` only; its verdict today
reads "GREEN — deps pinned by design (majors), client bundle lean, no
action" **while `bun audit` on the same tree reports 2 HIGH advisories**.
Two tools measuring different surfaces (outdated-ness vs security
advisories) with no probe covering the second — the tooling-integrity class
S27 (mode-forcing rot) and S28 (verdict rot) documented, this time as a
plain GAP: the advisory surface was simply never enumerated.

The verified findings (each re-derived from the executable truth this
session):

1. **`braces` <= 3.0.3 (GHSA-vfj7-8cjw-p6xm, HIGH)** — reached only through
   `eslint-config-next › @next/eslint-plugin-next › fast-glob › micromatch
   › braces` (a devDependency chain). NOT in the production standalone
   trace (`.next/standalone/node_modules` = 13 module roots: `@img`, `@next`,
   `@prisma`, `@swc`, `client-only`, `detect-libc`, `next`, `react`,
   `react-dom`, `semver`, `sharp`, `styled-jsx`, `z-ai-web-dev-sdk` — grep-
   verified this session). **Unfixable at source today: 3.0.3 IS the latest
   version on npm** (`npm view braces@latest` → 3.0.3; the advisory covers
   every published 3.x; no patched release exists). The exploit class
   (stack exhaustion through deeply nested glob patterns) requires feeding
   adversarial patterns to the linter — a local dev-time surface only.
2. **`deepmerge-ts` < 8.0.0 (GHSA-ggr8-5vv4-36mx, HIGH)** — reached only
   through `prisma › @prisma/config › deepmerge-ts`. `prisma` is declared
   in `dependencies` (the CLI ships with the prod tree), BUT the app
   runtime imports only `@prisma/client` — the standalone trace carries
   `@prisma` (the generated client) and NOT the `prisma` CLI or
   `@prisma/config`; `deepmerge-ts` is NOT in the trace (verified). **Not
   overridable at source: `@prisma/config@6.19.3` pins `deepmerge-ts`
   exactly at `7.1.5`** (an exact pin, not a range — Prisma's own
   lockfile-tested choice; an override to 8.x would fight the upstream pin
   inside Prisma's CLI). The exploit class (stack exhaustion merging
   recursive object graphs) requires controlling the Prisma config the CLI
   loads — a local CLI-time surface only.

**Both advisories are therefore verified NON-PRODUCTION (dev/CLI surface,
unfixable at source today) — the deliverable is not a version bump; it is
the standing audit that classifies every current and future advisory by
RUNTIME REACHABILITY against the standalone trace, fails loudly on anything
runtime-reachable, and documents the non-production family with its
classification evidence.** This is the S27/S28 doctrine applied proactively:
self-describing output, loud genuine findings, verified preconditions.

## Families and fixes

### S30-A (HIGH) — the pure seam `src/lib/dep-audit.ts` + the unit pins `tests/dep-audit.test.ts`

Three pure functions (the CLAUDE.md doctrine: pure logic lives in
`src/lib/*` seams with unit tests; views/scripts orchestrate, they don't
compute):

- `parseBunAuditOutput(text: string): AuditAdvisory[]` — parses `bun audit`'s
  text output (no JSON reporter exists in bun 1.3.14; the format captured
  byte-exact this session: module line `name  <range>`, optional
  `(direct dependency)` marker line, indented ` › `-separated path chains,
  `severity: title - url` lines, blank-separated blocks, trailing
  summary/trailer lines). Pinned with today's exact two-advisory output as
  the fixture + the edge cases (zero advisories, the marker-line tolerance,
  low/moderate/critical severities, no phantom advisories from the
  summary/trailer lines).
- `classifyAdvisory(advisory, ctx): ClassifiedAdvisory` — the reachability
  verdict. `ctx` carries the runtime module roots (from
  `.next/standalone/node_modules`), the prod `dependencies` list, and the
  dev `devDependencies` list. Rules, in order: (1) the advisory's module IS
  in the runtime roots (top-level or scoped) → surface `runtime`, verdict
  **FAIL — runtime-reachable**; (2) not in the roots + every path's root
  package is a devDependency → surface `dev`, NON-PRODUCTION; (3) not in
  the roots + any path's root is a prod dependency → surface `cli`
  (prod-declared tooling the runtime never imports — the prisma-CLI class),
  NON-PRODUCTION; (4) roots that classify neither way → surface
  `unclassified` (still non-production — not in the trace — but the
  rationale says so honestly). Pinned: the runtime case, the scoped-module
  runtime case (`@prisma/client`), the braces/dev case, the
  deepmerge-ts/cli case, runtime-beats-dev (a runtime module stays FAIL
  even when a path roots in devDependencies — the trace is the
  reachability truth), mixed-roots → cli, the unclassified fallback.
- `buildDepAuditEnvelope(advisories, ctx, ranAt): DepAuditEnvelope` — the
  self-describing artifact: `{ ranAt, source: "bun audit",
  runtimeModules, totalAdvisories, runtimeFindings, nonProductionFindings,
  verdict }` with the verdict GREEN iff `runtimeFindings` is empty. Pinned:
  the empty case (GREEN, 0/0), the all-non-production case (GREEN with the
  documented entries), the mixed case (1 runtime + 2 non-production →
  FAIL with both families present).

### S30-B (HIGH) — the standing runner `scripts/dep-audit.mjs`

Run as `bun scripts/dep-audit.mjs` (the `bun prisma/seed.ts` precedent —
the script imports the `src/lib/dep-audit.ts` seam and bun transpiles TS
natively; plain `node` cannot import `.ts`). The runner:

1. **Self-verifies its precondition (the S27 doctrine)**: the standalone
   trace `.next/standalone/node_modules` must EXIST **and be newer than
   `bun.lock`** — a stale trace would misclassify (a newly-added runtime
   dependency would read as non-production). Missing or stale → `stderr`
   message + `process.exit(1)` with NO findings emitted.
2. Spawns `bun audit` in the repo root, captures the text output, hands it
   to the seam.
3. Reads the runtime module roots (top-level `node_modules` entries,
   scoped pairs expanded), the prod/dev dependency lists from
   `package.json`.
4. Prints the envelope as JSON (the self-describing-output convention) and
   exits non-zero iff any runtime-reachable finding exists — **a probe must
   never normalize a genuine finding away** (the S28 loud-criterion
   doctrine).

**Negative controls (the S27/S28 validation convention, executed before
shipping):** (a) a scratch copy with a fabricated runtime-reachable
advisory (module `next`) must exit 1 with the loud FAIL verdict; (b) the
stale-trace precondition (touch `bun.lock` newer than the trace) must exit
1 with no findings; (c) the genuine two-advisory run must exit 0 with both
advisories documented as NON-PRODUCTION with their classification evidence.
Scratch copies deleted after validation.

### S30-C (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

- `AGENTS.md`: the commands-table entry for `bun scripts/dep-audit.mjs`.
- `vitest.config.ts`: the header comment's seam list gains dep-audit (18
  files) and the test count (258 → the new count).
- `CLAUDE.md`: the unit-layer line (258 → the new count; the seam list
  gains the S30 dep-audit parser/classifier).
- `Project_Architecture_Document.md` §8.1: the test-distribution table
  gains the dep-audit row; the Total row re-derived (45 → 46 files; 549 →
  the new total; 17 → 18 unit files).
- `README.md`: the tests badge (549 → the new total), the §Testing counts,
  the session-30 status row, the captures note.
- `omni-study_SKILL.md`: §11's green-state counts + **AP-75** (the
  never-audited-surface lesson — see below).
- `worklog.md` (repo root): the S30 entry.

**AP-75 (the lesson, MEDIUM):** the S27/S28 rot classes were validated-once
artifacts silently drifting; S30's class is the artifact that was never
validated at all — two dependency tools measuring different surfaces
(outdated-count vs security advisories) read together as "dependency
hygiene covered" while the advisory surface had no probe. The guard:
enumerate the security surfaces explicitly (runtime trace / dev tree / CLI
tree) and give each a reachability verdict; when a tool's verdict says
"no action", ask what question it actually answered. A HIGH advisory in a
dev-only chain is a documented risk, not an emergency — but that
classification must be EVIDENCED (the standalone trace), not assumed.

### S30-D (MEDIUM) — the session record

`docs/remediation-plan-session30.md` (this file, with the execution log),
`docs/session_59.md` (the narrative), `docs/session_60.md` (the transcript,
follows the push), the S30 evidence JSON
(`docs/screenshots/s30-dep-audit-evidence.json` — the bun-audit raw output,
the classification envelope, the negative controls, the gates), and the
standing-31 screenshot refresh (no app bytes move; the refresh proves the
tree unchanged).

## Non-gaps (documented, do not fix)

1. **The two advisories themselves** — verified dev/CLI-surface only,
   unfixable at source (braces 3.0.3 is the latest published; deepmerge-ts
   is pinned exactly by @prisma/config). Overriding either would fight
   upstream pins for zero production benefit. They ride as DOCUMENTED
   non-production entries in the standing audit's envelope.
2. **`scripts/pre15-preflight.mjs` stays as-is** — it measures a different
   surface (outdated-count, pinned majors, client bundle size); its
   "no action" verdict is correct FOR ITS QUESTION. The gap was coverage,
   not a wrong verdict.
3. **The zero-e2e-change rule** — no e2e spec is added for the script (the
   S27/S28 convention: probe scripts are execution-validated with negative
   controls, not browser-pinned; this probe needs no browser at all).
4. **The `prisma` package's placement in `dependencies`** — moving it to
   devDependencies would change the install surface for every deployment
   story (compose, standalone) for zero runtime benefit (the trace proves
   it never ships); not this session's risk to take.

## TDD order

1. **RED**: write `tests/dep-audit.test.ts` first (the full pin set above —
   parser fixtures incl. today's byte-exact two-advisory output, the
   classifier matrix, the envelope assembly). Run → fails (module
   `src/lib/dep-audit` not found). Capture the failing run.
2. **GREEN**: implement `src/lib/dep-audit.ts` (types + the three
   functions, no fs/spawn — pure). Run → all new tests green alongside the
   existing 258.
3. **The runner**: `scripts/dep-audit.mjs` (fs + spawn + the seam import);
   validate with the three negative controls (S30-B); capture the genuine
   run's envelope.
4. **Full gates re-run**: lint → typecheck → unit (the new count) → build →
   cold-`db/e2e.db` 291 e2e — the regression confirmation (no app code, no
   CSS, zero Tailwind v4 surface, zero parity-pinned bytes touched).
5. **Standing checks re-run**: the drawer check GREEN post-change; the
   standing 31 screenshots refreshed via `capture-studyflow.mjs` (the dev
   server restarted cleanly by PID first — the AP-70 lesson; theme restored
   light and verified via Prisma); the S30 evidence JSON captured.
6. **Docs** (S30-C) + the session record (S30-D) + commit + push via the
   SSH wrapper.

## Risks

- **The .mjs→.ts import requires bun** — documented in the AGENTS.md entry
  (`bun scripts/dep-audit.mjs`, the seed-script precedent); plain `node`
  cannot import TypeScript. The script prints the requirement if run under
  node and the import fails (the error is self-explanatory; the command
  entry is the guard).
- **The parser depends on bun's text format** — pinned by the unit
  fixtures; a future bun release that changes the format fails the unit
  layer on the next run (the format-change guard catches rot early — the
  AP-72 lesson's happy path).
- **The stale-trace precondition could surprise** — the message names the
  remedy (`bun run build`) and the precondition is exactly the S27
  self-verification doctrine; a probe classifying against a stale trace is
  worse than a loud failure.
- **No parity surface is touched** — the changes are one new lib seam, one
  new test file, one new script, and doc/comment updates; the 291 e2e pins
  and every byte-parity pin are untouched by construction.

## Execution log (session-59 workspace run)

- Baseline on arrival: the documented 549-green state re-confirmed (lint ✓
  tsc ✓ 258 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓ 4.6 min). The
  standing checks FIRST, all GREEN: the drawer probe + the live
  agent-browser 390×844 walkthrough (the app bar, the drawer dialog with
  all 20 links, Settings navigation by ref, the S26/S24/S25 cards on the
  Profile tab, scrollWidth 390 — **the mobile navigation menu is working as
  expected**); the reference re-sweep **UNCHANGED since S19–S29** (zero-data
  0/0, the "AcademiaFlow (Copy)" platform-rename artifact, in-app
  StudyFlow branding, the same 20 nav views, the same five Settings tabs);
  the copy sweep 14/20 MATCH with 6 data-state non-gaps.
- The full standing-audit suite re-ran GREEN with **zero code findings**:
  security ✓ (0 findings, the documented limiter shape — single run, the
  S29 double-run lesson), settings-roundtrip ✓, connectivity ✓ (the S28
  repair validated live), upload-edge ✓, data-volume ✓, forced-colors ✓,
  print ✓, focus-order ✓, CWV ✓ (0 findings; CLS 0.00; clone
  throttled-mobile dashboard LCP NI 2644/2728 ms — the documented S16
  state; the reference's own mobile login POOR 7952 ms / dashboard LCP
  4312 ms + CLS 0.261), dark-sweep ✓ (the S27 repair validated live),
  accent-dark-sweep ✓ (0 FAIL; the residual lowcontrast = the documented
  S11 non-gap family), **ai-error-audit ✓ (0) and ai-a11y-audit ✓ (0)** —
  the two AI-surface audits from the AGENTS.md table, run this session to
  complete the suite — and pre15-preflight ✓ ("deps pinned by design,
  client bundle lean, no action"). The demo user's theme verified restored
  (light/violet, via Prisma) after the mutating audits.
- **The finding**: `bun audit` on the same tree preflight blessed reports
  **2 HIGH advisories** (`braces` <=3.0.3 GHSA-vfj7-8cjw-p6xm,
  dev-only via eslint-config-next, 3.0.3 IS the latest npm version — no
  upstream patch exists; `deepmerge-ts` <8.0.0 GHSA-ggr8-5vv4-36mx,
  CLI-only via `@prisma/config`'s EXACT 7.1.5 pin). Both verified absent
  from the 13-root standalone trace (`.next/standalone/node_modules`) —
  the dependency-security surface had NO probe (preflight measures
  outdated-count only).
- **TDD RED** (captured): `tests/dep-audit.test.ts` written first (15
  pins: the parser fixtures incl. today's byte-exact two-advisory report,
  the marker-line tolerance, the clean-report case, every severity grade,
  no phantom advisories from the trailer; the classifier matrix — runtime,
  scoped-runtime, dev, cli, runtime-beats-dev, mixed-roots, unclassified;
  the envelope contracts — GREEN-empty, GREEN-documented, FAIL-mixed) →
  run fails (module not found, no tests). First implementation iteration
  caught by the pins: the severity line was parsed but never ASSIGNED
  (the "high" default masked it — the multi-severity pin exposed the bug;
  the exact reason the fixture pins every severity grade).
- **TDD GREEN** (captured): `src/lib/dep-audit.ts` (parseBunAuditOutput +
  classifyAdvisory + buildDepAuditEnvelope) → 15/15; the full unit layer
  **273 passed (18 files)**.
- **The runner**: `scripts/dep-audit.mjs` (bun-run; the seam import;
  self-verifying preconditions). First genuine run tripped the
  stale-trace precondition CORRECTLY — this session's own earlier
  `bun update braces` experiment had touched `bun.lock` after the build
  (and, on inspection, had injected a direct `braces` prod dependency into
  `package.json` — reverted to byte-identical HEAD; the guard caught a
  REAL staleness, not a synthetic one). After the rebuild: **GREEN, exit
  0** — 2 advisories classified (braces: dev; deepmerge-ts: cli), 18
  runtime module roots (scoped pairs expanded) riding the envelope.
- **Negative controls** (validated, scratch copy deleted after): (a) the
  fabricated runtime-reachable advisory (module `next`) → **exit 1**,
  verdict "FAIL — 1 runtime-reachable advisory(ies) present", the loud
  stderr — the guard is not a rubber stamp; (b) the stale-trace
  precondition (bun.lock touched newer than the trace) → **exit 1, ZERO
  stdout bytes** (no findings emitted), the stderr remedy naming
  `bun run build`; (c) the genuine two-advisory run → **exit 0**, both
  documented with classification evidence.
- **Gates re-run**: lint ✓ tsc ✓ 273 unit ✓ (18 files) build ✓ cold-`db/
  e2e.db` **291 e2e ✓ (4.8 min) = 564 green** (was 549), the 291 prior
  pins untouched by construction (no app code, no CSS, zero parity
  surface).
- **Standing checks re-run post-change**: the drawer check GREEN; the dev
  server restarted cleanly by PID first (the AP-70 lesson); the standing
  31 screenshots refreshed via `capture-studyflow.mjs` (29 byte-changed —
  the S29 pattern; theme restored light and verified via Prisma:
  light/violet); the S30 evidence set captured
  (`docs/screenshots/s30-dep-audit-evidence.json`).
- **Docs aligned** (the AP-74 guard applied to this change): AGENTS.md
  (the `bun scripts/dep-audit.mjs` command entry + the 273-test line);
  vitest.config.ts (18 files / 273 tests + the dep-audit seam in the
  list); CLAUDE.md (the unit-layer 273 line + the S30 seam description);
  PAD §8.1 (the dep-audit row + the Total row: 46 files / 564 tests /
  273 unit / 18 unit files); README (the 564 badge, the 273 hierarchy +
  §Testing lines, the session-30 status row, the captures note); SKILL.md
  (the 564/273 counts ×2 + **AP-75**). The re-grep across every living
  doc layer returns zero stale counts; the remaining 258/549 mentions are
  the per-session history rows and ADR Context/Consequences records
  (correctly untouched — the S29 convention).
- The session record: this plan + the session_59 narrative + the worklog
  entry; the session_60 transcript follows the push (the S27–S29 commit
  pattern).
