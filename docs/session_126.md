# Session 126 — The S50 iteration narrative

## The scope

The S46 plan's carried note + the S49 plan's own non-gap entry, closed as
the standing next candidate: **the dark × landscape × SEED cell for the 13
volume-invariant views (844×390)** — Timetable, Assignments, Exams,
Flashcards, Practice Tests, Study Groups, Grade Tracker, Files, Calculator,
Math Solver, AI Assistant, Focus Timer, Settings (the views that render no
task/note/event rows, so the S48/S49 volume sweeps never navigated them).
With this session the landscape band's SEED-volume surface is closed on
BOTH halves (the light half is the S40 accent-landscape-sweep's own — all
20 views; the dark half for the 13 volume-invariant views is this
session's).

## The arrival audit (the 1064-green baseline)

The workspace was RESET this session — a fresh `git clone` to `c7ea46a`
(the S49 feat push `3a78f41` + the session-log commits — S49 complete: the
volume × theme × viewport cross-axis COMPLETE, all EIGHT halves, 1064
green, the 33-row suite, zero pin corrections). The environment rebuilt
from the contract: `.env` created from `.env.example` (the dev posture
`AUTH_SECRET=""`; `DATABASE_URL="file:../db/custom.db"` — the `db/` folder
at the repo root, verified), `bun install` (489 packages), `bun run
db:push` + `bun run db:seed` (the demo user at `db/custom.db`).

ONE fresh-environment lesson re-learned on arrival, the documented one: the
first cold-db e2e attempt failed **267/291** with the Playwright
`Executable doesn't exist at chromium_headless_shell-1243/...` launcher
error — the browser cache does not survive a workspace reset (the cache
held 1200; the installed @playwright/test 1.63 needs 1243). `bunx
playwright install chromium` (114 MiB) restored the pass: ONE intermediate
run read **289/291** (the stale-cache residue class — two resilience-spec
timing flakes), the re-run **291 passed (4.5 min)**. The baseline gates
then re-confirmed the documented state exactly: lint ✓ tsc ✓ **773 unit ✓**
(20 files) build ✓ cold-`db/e2e.db` **291 e2e ✓** = **1064 green**.

## The standing checks

- **Preflight GREEN** — the dev server booted via the S32 recipe
  (`( setsid bun run dev … & )` + the `/api/health` probe), hydrated and
  navigation-stable.
- **The drawer check GREEN** — the standing S14 probe, both apps, backdrop /
  panel / links / footer / Escape-close.
- **The live agent-browser 390×844 walkthrough GREEN** — the mobile
  navigation menu is working as expected: scrollWidth 390, sidebar hidden,
  burger visible, drawer 20 links, the nav scrollable (1068 vs 755), Notes
  via the drawer, the drawer closes on navigation, and the re-opened
  drawer's active link "Notes" carries the violet gradient on the INNER
  SPAN (the S40 ACTIVE_READER scope — a first reading on the `<a>` wrapper
  showed "none" because the wrapper carries no style; the span does).
- **The reference re-sweep UNCHANGED since S19–S49** — logged in at
  390×844 and 1280×800: the title "AcademiaFlow (Copy)", the email-prefix
  greeting, the 20 nav views in the documented order, the five Settings
  tabs. The reference's OWN drawer verified in the same walkthrough: 20
  links, a 288px panel, the nav scrollable (992 vs 744), auto-closes on
  navigation, the Notes view renders its h2 — **the mobile navigation
  parity confirmed on BOTH apps** (the reference's hamburger is unlabeled —
  the documented quirk; the clone's aria-label is the intentional
  superset).
- **The copy sweep via the :3200 standalone (ephemeral real AUTH_SECRET):
  14/20 MATCH** — the 6 documented data-state non-gaps (the reference
  account is zero-data; the clone demo account is seeded) — identical to
  the S49 record. The :3200 server killed by PID after.
- **The code audit (Mode C) ZERO app-code findings** — the S49 diff
  verified test/seam/probe-only (`git show --stat`: suite-verdict +363,
  suite-verdict.test +388, the probe, the runner, the docs — zero app
  code); the security scan clean (no TODO/FIXME markers, no `any` types,
  no console.log, no eval, no hardcoded secrets in `src/`; the one
  `dangerouslySetInnerHTML` is the documented THEME_BOOT_SCRIPT constant;
  `z-ai-web-dev-sdk` imports only in the 4 server-side AI routes); the
  24-model schema count ✓; the `.env.example` ↔ codebase env contract ✓
  (the three app vars; the script-only vars are inline-passed); the
  dependency audit GREEN (2 advisories documented non-production — braces
  dev-only via eslint-config-next, deepmerge-ts CLI-only via prisma; both
  upstream, not actionable here). **No Tailwind v4 bug found in the mobile
  navigation** — the drawer's `backdrop-blur-xs` (the trap-9 pin), the
  `flex flex-col gap-1` nav list (the trap-4 ban honored), the custom
  `.sf-nav-active` class (not a Tailwind utility — immune to the trap-13
  literal-inlining), and the `hidden lg:flex` sidebar contract all
  verified live on BOTH apps.

## The coverage map (grep-verified)

- `landscape-sweep` (S35): 20 views at 844×390 — LIGHT + violet only.
- `accent-landscape-sweep` (S40): 7 accents × 20 views at 844×390 — LIGHT
  only (its every PATCH carries `themeMode: "light"`, 8 hits).
- `dark-mobile-sweep` (S36): dark × 390×844 only.
- `accent-dark-sweep` (S38): dark × 1280×800 + 390×844 only — the 844
  width in NEITHER surface.
- `accent-volume-dark-landscape-sweep` (S48): dark × 844×390 × 7 accents —
  the 7 volume-affected views only, under the 300/200/250 profile.
- `accent-volume-light-landscape-sweep` (S49): the light mirror — the same
  7-view volume set.

**So the dark × landscape × SEED cell for the 13 volume-invariant views is
ZERO-coverage at every accent** — those 13 view bodies had never been
rendered in dark at the 844×390 landscape layout under ANY accent, and the
drawer's active-link tint had never been read through the real navigation
lifecycle in dark at landscape at SEED on those views. The S50 scope
confirmed.

## The TDD build

- **RED**: the 32-pin S50 block appended after the S49 block in
  `tests/suite-verdict.test.ts` (the s50Envelope fixture: 7 accents × the
  13-view set at 844×390 dark, the per-view records carrying the dark
  detector family — flashbulbs/unreadable/lowcontrast — plus the
  interaction evidence). Result: **18 failed / 503 passed (521 in file)** —
  the shape-error pins pass vacuously through the unknown-audit path, the
  verdict pins fail — the documented RED pattern. ONE pin authored with a
  defect (a tint-rot pin referencing "Notes" — a view NOT in the 13-view
  set, so the override would silently no-op and the assertion would fail
  forever) — caught and fixed BEFORE the RED run; one duplicate S48
  cross-check pin removed in the same pass.
- **GREEN**: the `classifyAccentDarkLandscapeSeedSweep` seam in
  `src/lib/suite-verdict.ts` (inserted after the S49 classifier, before
  the cwv section) + the AUDIT_NAMES entry + the dispatch arm. ONE pin
  correction during GREEN: the structural family's combined note used
  "app-bar" (hyphenated) where the pin expects "/app bar/i" — refactored
  into the S49 pattern's THREE distinct blocks (drawer-stuck / missing
  bars / clearance breaches), each with its own note. Result: **521/521 in
  the file; the full unit layer 805 (773 + 32)**; lint ✓ tsc ✓.
- **The probe** `scripts/accent-dark-landscape-seed-sweep.mjs`: the S40
  landscape vehicle verbatim re-anchored to the dark half on the 13-view
  set — the dark-mode precondition through the REAL lifecycle (the
  greeting-heading gate), the per-accent gate with the shell-presence
  guard from birth (the AP-90 lesson), the S42/S44/S46/S48 dark checker +
  the drawer-scoped dark checker, the pendingView tint pattern, the
  heading-clearance/app-bar/scrollWidth contracts, the 20-link census,
  the CTA-face-only exit computation, the AP-85 flush-callback exit.
  `node --check` OK. NO Prisma import — SEED volume, no marker rows, no
  API stats (the seed density is the documented resting state).
- **The runner's 32nd stage**: the stage entry after the S49 row
  (timeoutMs 20 min — the S40 precedent: its 20-view light sweep measured
  9–12 min under the same budget; 13 views ≈ 6–8 min expected) + the
  header comment + the /32 literals. `node --check` OK — NEVER an import
  (the S49 process lesson: the module EXECUTES on load).

## The docs alignment (the AP-74 guard)

AGENTS.md (the 805 line + the S50 command row + the 32-audit suite entry),
vitest.config.ts (the 805 header + the S50 classifier note), CLAUDE.md
(the 805 count + the S50 seam note on the unit-test line), PAD §8.1 (the
S50 classifier row + the suite-verdict pin count 489 → 521 + the Total
1064 → 1096), README.md (the badge 1096 + the count lines + the
session-50 status row), omni-study_SKILL.md (the counts ×2).

## The execution protocol (the S32 differential)

The arrival standing suite (33 rows, the 31-audit version) launched FIRST
on the fresh clean window (the dev server restarted by PID before it) —
the exploration must not run while the suite holds the shared surfaces.
The TDD unit work ran during the suite. After the arrival suite completes:
the genuine exploration (run 1), the runner patch verification, the
validation suite (34 rows — the 32-audit version), the evidence capture,
the final gates, the session docs, the worklog, the commit, and the push
(via the SSH wrapper with `--remote git@github.com:nordeim/omni-study.git`
— the wrapper's DEFAULT remote is a different repo, the S122 note).
