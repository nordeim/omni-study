# Session 10 — Session-9 Data-State/Chart-Axes Parity Remediation (audit → plan → TDD execution → docs → push)

> The 10th working session on this repo, executing the session-9 remediation
> iteration. Session 8 was completed and pushed at `d06eefe` (its recovery log
> is `session_9.md`). This session ran a fresh dual-app audit against the live
> reference, found 19 measured gap families, executed them TDD-style, and
> finished with docs alignment + the 3-commit push. The session itself was
> interrupted once mid-documentation (context exhaustion) and resumed cleanly
> from the uncommitted workspace — the final gates were re-verified from
> scratch before committing.

## What happened

**Onboarding & baseline.** Fresh workspace state confirmed (clone at
`1cb2297`, the session-9 head). All root docs (AGENTS/CLAUDE/README/PAD/SKILL),
`docs/session_8.md`, `docs/remediation-plan-session8.md`, `worklog.md`, and
`docs/session_9.md` reviewed; understanding validated against the codebase.
Environment rebuilt: `.env` `DATABASE_URL="file:../db/custom.db"` with `db/`
at the repo root, `bun install`, `db:push` + `db:seed`, dev daemon via
`scripts/dev-daemon.py`. Baseline gates green: lint ✓ / tsc ✓ / 100 unit ✓.
The scandihaven reference repo + both `skills/` catalogs re-reviewed;
`skills/` excluded from all checks/tests/compilation as instructed.

**Dual-app audit (agent-browser).** Logged into the live reference
(`omni-study1.base44.app`) and the local clone; named browser sessions; both
desktop (1280×800) and mobile (390×844) viewports. The standing mobile-drawer
priority verified FIRST and GREEN: 288px white `shadow-2xl` panel, 20 links,
no footer, backdrop `rgba(0,0,0,0.2)` + `blur(4px)` ≡ the clone's
`oklab(0 0 0 / 0.2)` serialization + `blur(4px)` (the documented v4 trap 7).

**Method note — the VLM swap discovery.** Pairwise VLM screenshot comparison
(`scripts/vlm-compare-s9.mjs`) produced systematically SWAPPED image
attributions: it labeled the reference's `sepnetflix2023` user as "clone" and
vice versa (the "black avatar" and "empty data" findings were inverted — the
clone actually has MORE data). Every VLM finding was therefore re-verified
with direct DOM computed-style probes on BOTH apps before acting; VLM was
demoted to a hypothesis generator. This rule is now documented in AGENTS.md.

**19 measured gap families (S9-A…S9-S)** — verified against `src/` before
planning: the dashboard overdue-alert banner (missing feature —
red-50→orange-50 gradient, icon block, "You have N overdue item(s)", ghost
View All), the MyDay amber greeting-titled empty state + bare quick-add row,
the Tasks outline filter BUTTON (not combobox) + empty My Lists body, the
calendar SUNDAY-first grid (October 2026 starts at Sep 27 — 35 cells) + the
icon/tab mode switch, the Files house breadcrumb + grid3x3 toggle, the
text-only Grid Builder, Assignments "Active"-default slim rows (no subject
span/description paragraph), the Exams orange "Tomorrow" badge, the Analytics
AREA charts with axes/gridlines (vs HTML bar charts), FocusTimer
flame/target/zap + coffee icons, Settings tab icons, Notes folder/tag
combobox icons, the Flashcards deck-row ellipsis menu, the AI wand-sparkles
composer, the dashboard slim inline section empties, and the Study Groups
hint wording. Non-gaps documented too (avatar chrome identical, reference
data-state surfaces broken/empty, timetable grids identical).

**Plan + TDD execution.** Plan saved as
`docs/remediation-plan-session9.md` (evidence, fixes, non-gaps, codebase
alignment table, execution order) and validated file-by-file against the
codebase before execution. RED first: `tests/date.test.ts` monthGrid
Sunday-first expectation observed failing; `tests/e2e/parity-session9.spec.ts`
written from the measurements and observed RED on the pre-remediation build
(24 failed / 2 passed). Then GREEN family by family with `bun run test` +
rebuilds between checkpoints: the `monthGrid()` rework (+`CALENDAR_WEEKDAYS`
constant), the seed additions (overdue "Return library books" task +
1-day-out "Vocabulary pop quiz" exam), the dashboard banner +
`DashSectionEmpty`, the MyDay empty/quick-add rework, the Tasks filter button,
the calendar mode switch, the quick icon-fix batch (Files/Timetable/
FocusTimer/Settings/Notes/Assignments/Exams/StudyGroups/AI), the Flashcards
deck-row menu, and the Analytics `AreaChart` SVG rebuild.

**Execution discoveries** (all in the plan's addendum + AGENTS.md): `count()`
does not auto-wait (chart pins must gate on auto-waiting assertions); a
manually-started debug server on :3100 collides with the Playwright webServer
and serves the deleted `db/e2e.db` inode (POST /api/tasks 500s — kill :3100
before e2e); a long-lived dev daemon accumulates stale Turbopack state (Fast
Refresh rebuild loop — inputs refuse to fill; restart cleanly); the unpinned
red/orange banner palette serialized as `lab()` before the pin-block extension
(red-50/red-200/orange-50); `Filter` renders as `lucide-funnel` in this
lucide version (re-hit S8 lesson); reseeding invalidates browser sessions
(re-hit S7 lesson).

**Stale-pin migrations:** S5-G calendar segmented-switch pin → capitalized
"Calendar" tab; S6-C MyDay Suggestions pin → row-scoped Add button (the second
seeded suggestion); `tasks.spec.ts` golden path → filter BUTTON + DropdownMenu
and Enter-submits quick-add (S9-Q).

**Interruption + clean resume.** The session hit context exhaustion right
after "updating documentation — first the exact test counts". The resume
verified the workspace (53 uncommitted files: 17 view components + date.ts +
seed + globals.css + the new spec + the plan + 24 refreshed screenshots),
then RE-RAN every gate from scratch for authoritative counts: dev daemon
stopped → lint ✓ → `tsc --noEmit` ✓ → unit ✓ → `next build` ✓ → clean
`db/e2e.db` + auth state → **184 e2e ✓** (2.6 min). Per-spec distribution
recorded: parity-session9 = 25 tests / 15 describes (159 → 184 e2e).

**Docs aligned:** README (badge 290, feature rows for the banner/calendar/
analytics, plan entry + project-table row, counts 106/184), AGENTS.md (S9
architecture facts: banner + slim empties, filter button + MyDay amber empty,
Sunday-first calendar + mode switch, area charts + Active-default + Tomorrow
badge; trap 10 red-50/200/orange-50 extension; four new testing quirks),
CLAUDE.md (pyramid counts + the session-9 pin family), PAD (ADR-007 counts +
session-9 pins + test-distribution row + the stale unit row 99 → 106 fixed),
SKILL.md (counts 290 + AP-38…AP-42). `.env.example` verified complete
(DATABASE_URL contract, NEXT_PUBLIC_SITE_URL, AUTH_SECRET). Screenshots: all
24 refreshed under `docs/screenshots/` and VLM-verified
(`scripts/vlm-verify-s9.mjs`, 7 reworked views).

**The .env.example env-contract fix.** Verifying the "working `.env.example`
that matches the codebase" requirement surfaced a pre-existing doc-vs-code
misalignment: `NEXT_PUBLIC_SITE_URL` was documented everywhere (README,
DEPLOYMENT, PAD, SKILL — "used for metadata, sitemap.xml, and robots.txt")
but never consumed by a single line of code. Implemented the documented
behavior TDD-style (RED `tests/site.test.ts` → GREEN): `src/lib/site.ts`
(`siteUrl()`, default `http://localhost:3000`), `src/app/sitemap.ts`
(root + the 20 view paths + login = 22 URLs, verified prerendered in the
build), `src/app/robots.ts` (allow-all + sitemap pointer), and `metadataBase`
in `layout.tsx` — 5 new unit tests (106 total), the exact-match SPA rewrites
provably never touch the new routes, and every gate re-run GREEN:
lint ✓ · tsc ✓ · **106 unit ✓** · build ✓ · **184 e2e ✓** = **290 green**.

**Commit & push.** Three commits on `main` following the repo convention:
fix (all src/tests/seed/screenshots/scripts), docs (plan + aligned docs),
session log (this file + worklog). Pushed via `docs/ssh_git_wrapper_v3.py`
with the provided ed25519 deploy key (dry-run first, remote verified at the
new head, key destroyed per the runbook).

## Where the project stands

Visual parity is now measured-exact across every surface family the audit
series has touched: chrome (S3/S4), interactive chrome (S5), populated rows
(S6), lightly-probed views (S7), deep chrome/layout (S8), and data-state
surfaces + chart axes + icon-level details (S9). The clone remains the
functional superset: working CRUD everywhere the reference is broken (notes,
events, study groups, practice tests), AI generation that persists, full dark
mode, responsive mobile flashcards. The mobile drawer (the standing user
priority) has been re-verified identical in every session since S3.
