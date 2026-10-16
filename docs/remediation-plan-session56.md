# Remediation Plan — Session 56 (S56): the S55+1 stability confirmation + the registry-landscape shift

**The session's governing question (2026-10-15/16):** the S55 session closed
the date-fragile calendar pins + the drawer-panel measurement race (a
three-file test-code-only fix) with the gates restored to 1133 green and the
standing suite GREEN 35/35. Since then, exactly one commit has landed
(`f8f1204` — session_148, the S55 process log), **doc-only** (verified by
`git show --stat`: 1 file, +106, docs/session_148.md only). This session
owes the repo the standing arrival audit — and this time the audit's one
genuine development is in the **dep-registry landscape**: the standing
upstream-wait position on the deepmerge-ts advisory has shifted (a stable
Prisma line now carries the fix), which this plan documents and disposes.

## The scope (validated against the codebase before execution)

1. **The arrival audit** (the workspace-pull recipe — the S51/S54
   precedent: the environment survived intact, no fresh-clone rebuild
   needed): `git pull` to `f8f1204`, the five core docs re-read
   (AGENTS, CLAUDE, README, PAD, SKILL), the S55 baseline docs
   (session_146/147/148, the S55 plan with its execution log, the
   worklog tail) absorbed, the understanding validated against the
   codebase (HEAD doc-only, the count anchors 1133/834/299, the
   environment intact: node_modules, `db/` at the repo root, `.env` =
   `.env.example` verbatim, `.next/standalone` present).
2. **The baseline gates**: lint, tsc, the 834-test unit layer, the
   production build, the cold-`db/e2e.db` e2e (299) — the documented
   **1133 green** re-confirmed.
3. **The standing checks**: the dev-server daemon (the S32 recipe), the
   preflight, the drawer-check, the live agent-browser 390×844
   walkthrough on the clone (the mobile-navigation emphasis + the
   Tailwind v4 trap surfaces), the reference re-sweep (**BOTH sidebar
   states** — the post-S52 protocol), the Mode-C code review, the
   dep-audit — plus the **registry re-check** of the two advisories
   (the standing open item).
4. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows.

## The findings

**ZERO app-code findings. ZERO test-suite findings.** Every stage of the
arrival audit read GREEN:

| Check | Verdict |
|-------|---------|
| Post-S55 commit | `f8f1204` verified **doc-only** by `git show --stat` (session_148 only, +106) — zero app-code changes since the S55 three-file e2e fix (which itself touched zero app code; the last app-code change remains the S52 four-file fix) |
| Baseline gates | lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.61 s) build ✓ cold-db 299 e2e ✓ (4.6 min) = **1133 green** — byte-for-byte the documented S55 state, and the S55 F1 date-fragility fix verified live: the run crossed no UTC 15th hazard this time (the 16th), but the S55-fixed pins read the grid's own `[data-today]` marker — runner-clock-independent by construction |
| Dev-server preflight | GREEN (hydrated + navigation-stable) |
| Drawer-check (S14) | GREEN (backdrop/panel/links/footer + Escape-close) |
| Live 390×844 walkthrough (clone) | GREEN — login → scrollWidth 390 → sidebar hidden → burger visible → drawer 20 links in the reference order → nav scrollable **1068 vs 755** → Notes via the drawer → auto-close → the active link violet-600 `rgb(124, 58, 237)` + the violet→indigo 10% gradient + the trailing violet-500 dot `rgb(139, 92, 246)` → Escape-close |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the nav UL `flex flex-col gap-1`: display flex / gap 4px / column / **zero margin children**), trap 9 (the drawer backdrop `blur(4px)`), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)` — the documented expected form) |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260 / main width 1020; collapsed aside 80 / main ml 80 / main width 1200 / 20 icon-only links svgX 33 / footer 0 children / the glyph `rotate: 180deg` (v4's rotate property ≡ the reference's rotate-180 matrix) / `sf-sidebar-collapsed` persisted; the mobile drawer SHARING the state (the 288px panel, 20 icon-only links svgX 32, nav scrollable 988 vs 755) — the S52 contract intact; the preference restored to expanded before moving on |
| Reference re-sweep | **UNCHANGED since S52/S53/S54/S55** — the four anchors (title "AcademiaFlow (Copy)"; greeting "Good evening, sepnetflix2023 👋" [the hour-23 UTC bucket]; the 20-view href order `/Dashboard`…`/Settings` byte-identical; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020; collapsed 80/80/1200, chevron-only header, empty footer, icon-only svgX 33, `matrix(-1, 0, 0, -1, 0, 0)` glyph, `sidebarOpen "false"`) + the shared collapsed drawer (288px, icon-only svgX 32, nav 912 vs 744, the reference's own `blur(4px)` backdrop). The stored preference restored to `"true"` before session close |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT; the SDK server-only in the 4 AI routes) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| `.env` / db / test contracts | `.env` = `.env.example` verbatim with `DATABASE_URL="file:../db/custom.db"`; `db/` at the repo root (custom.db + e2e.db); the three-tool db-path resolution pinned by `tests/db-path.test.ts`; vitest.config.ts (834/20) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation, workers 1, retries 0) verified working |
| Scandihaven patterns reference | reviewed (unchanged since 2026-10-04) — the mobile-nav testing discipline, the Tailwind v4 literal-token contract, the scoped-assertion E2E doctrine all already embodied; no architecture changes warranted |

### The one development: the dep-registry landscape shifted (the judgment call)

The standing open item — the fresh registry re-check of the two advisories —
produced **new evidence this session**:

- **`braces`** — UNCHANGED: the latest published version IS 3.0.3, the
  lockfile's own exact version. The advisory's fix needs a release
  > 3.0.3 which **does not exist on npm**. Unfixable upstream, full
  stop — the house position stands.
- **`deepmerge-ts`** — **CHANGED**: the lockfile carries the vulnerable
  `deepmerge-ts@7.1.5` via `prisma@6.19.3 › @prisma/config@6.19.3`. The
  fresh registry query shows the **Prisma 6.x line has ENDED at 6.19.3**
  (`@prisma/config@6.19.3` still pins deepmerge-ts 7.1.5 — no newer 6.x
  exists), while the **stable Prisma 7 line (7.10.1, dist-tag `prev`)
  now carries `@prisma/config@7.10.1` with the fixed `deepmerge-ts@8.0.2`**
  (the latest Prisma 8 line remains RC-only at 8.0.0-rc.23 — still not
  production-safe). The fix path now exists on a stable line — but it
  requires the **major ORM upgrade 6.19.3 → 7.10.1**.

**The disposal (the best-recommendation judgment call):** do NOT drive-by
the major upgrade inside an arrival-audit session. The reasoning:

1. **The advisory is non-production by construction** — deepmerge-ts is
   reached only from the `prisma` CLI (dev/build tooling); the app
   runtime (`@prisma/client` in the standalone trace) never imports it.
   0 runtime-reachable, per the standing dep-audit's own classification.
   The production risk being "fixed" is zero; what the upgrade would buy
   is a cleaner `bun audit` report.
2. **A major ORM upgrade is the highest-risk class of change for THIS
   codebase.** ADR-002's three-anchor `DATABASE_URL` contract was
   verified empirically against Prisma 6.x (the runtime re-anchoring, the
   shell-env CLI anchoring, the `.env`-loaded CWD foot-gun); Prisma 7
   reworked the config loading (`prisma.config.ts` + `defineConfig`, the
   `.env` auto-load paths), changed the generator story, and bumps the
   node-engine floor (`^20.19 || ^22.12 || >=24`). Every one of those
   surfaces is pinned: `tests/db-path.test.ts`, the `db:*` npm scripts,
   the e2e `global-setup.ts`, the seed, the Docker `init` profile, the
   standalone trace.
3. **The house doctrine** (the smallest safe diff on a verified-green
   production codebase) + the S53/S54/S55 precedent (zero findings →
   zero code changes by design) both point the same way: the upgrade
   deserves its own dedicated session with a full re-verification arc
   (the db-path tests re-run against 7.x CLI behavior, the generator
   re-pin, the cold-db e2e, the standing suite) — an owner-decision
   item, recorded here as the **named next-step candidate**.

**Non-gaps (documented, no action):**

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace (no daemon,
  re-verified this session).
- The Prisma 7 upgrade itself — the named next-step candidate above
  (owner decision; a dedicated session, not an in-session drive-by).

## The ToDo list

- [x] The arrival audit: `git pull` to `f8f1204`, the five core docs +
      the S55 baseline docs re-read, the understanding validated against
      the codebase (doc-only HEAD, count anchors, environment intact)
- [x] The baseline gates — lint ✓ tsc ✓ 834 unit ✓ build ✓ cold-db
      299 e2e ✓ = **1133 green** (4.6 min)
- [x] The dev daemon (the S32 recipe, health 200) + the preflight GREEN
      + the drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/7/9 verified live clean; both desktop
      sidebar states + the shared drawer state measured to the pin)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED**; the preference restored
- [x] The Mode-C review (the doc-only HEAD verified; the static scan
      clean) + the dep-audit GREEN + **the registry re-check with the
      new stable-Prisma-7 evidence** (the judgment call recorded)
- [x] The scandihaven patterns reference re-verified (unchanged)
- [x] This plan written and validated against the codebase
- [x] The confirmation: `bun scripts/standing-suite.mjs` — all 35 rows
      (launched detached on the daemon per the S32 recipe)
- [x] The evidence: the 35-row envelope under `docs/screenshots/` + the
      5 dev-server screenshots (the S55 capture set mirrored) + the 2
      reference captures
- [x] Docs: this plan's execution log, session_149 (narrative) +
      session_150 (summary), the README session-56 row, the worklog
      entry
- [ ] Commit + push to `main` (the SSH wrapper, key verified + shredded)

## Why zero code changes (the judgment call)

The session's mandate is parity + production-readiness. The audit found
the codebase sound on every axis: the reference is unchanged (both
sidebar states re-measured to the pin), the clone's implementation
matches it at every measured token, the mobile navigation works with no
Tailwind v4 bug, the 1133-gate is green with no flakes, and the one
development (the registry shift) is a NON-production advisory whose fix
is a major ORM upgrade — the highest-risk change class for this repo,
and therefore an owner-decision item scheduled for its own session, not
an in-session drive-by. The S53/S54 precedent applies directly: **the
smallest safe diff is no diff on a verified-green production
codebase.** The TDD approach applies to code changes; with zero code
changes owed, the session's executable confirmation is the standing
suite (the 35-row envelope) + the fresh evidence captures.

## The execution log (2026-10-15/16, the S56 session)

- **The arrival**: the workspace pulled fast-forward
  (`3ddb6c7` → `f8f1204` — session_148, doc-only, verified by
  `git show --stat`); the environment survived intact (node_modules,
  `db/` with custom.db + e2e.db, `.env` = `.env.example`, the standalone
  build present) — the S51/S54 arrival precedent, no fresh-clone
  rebuild needed.
- **The baseline**: lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.61 s)
  build ✓ (exit 0) + **cold-db 299 e2e ✓** (4.6 min) = **1133 green** —
  the S55 state re-confirmed byte-for-byte.
- **The standing checks**: the daemon (the S32 recipe, health 200), the
  preflight GREEN, the drawer-check GREEN, the live 390×844 walkthrough
  GREEN — the mobile navigation menu working as expected, NO Tailwind v4
  bug (traps 4/7/9 verified live clean), both desktop sidebar states +
  the shared mobile drawer state measured to the pin, the preference
  restored to expanded.
- **The reference re-sweep** (the operator account, 1280×800 then
  390×844): UNCHANGED — the four anchors + BOTH sidebar states + the
  shared drawer reproduced exactly; the preference restored to `"true"`
  before session close; 2 reference captures saved
  (`s56-reference-desktop-expanded-1280.png`,
  `s56-reference-mobile-drawer-labeled-390.png`).
- **The Mode-C review + the dep work**: the HEAD commit doc-only; the
  static scan clean; the dep-audit exit 0; **the registry re-check —
  the NEW evidence**: braces 3.0.3 = latest (unchanged, unfixable);
  the Prisma 6.x line ended at 6.19.3 (still carrying deepmerge-ts
  7.1.5) while the stable Prisma 7.10.1 carries the fixed
  `@prisma/config@7.10.1 → deepmerge-ts@8.0.2` — the standing
  upstream-wait position UPDATED to "fixable via a major ORM upgrade;
  recommend a dedicated session" (the judgment call above).
- **The confirmation**: `bun scripts/standing-suite.mjs` launched
  detached on the daemon (the S32 recipe) at ~23:55 UTC — **GREEN
  35/35, zero total findings** (~72 min wall; the S31 preflight, the
  33 standing audits, the theme-restore closing guard light/violet).
  The 35-row envelope saved as
  `docs/screenshots/s56-standing-suite-evidence.json` with the session
  context header. One timing note: the run crossed the UTC midnight
  (the clone's own login read "Good evening" at hour-23 and "Good
  morning" at hour-1 after the suite — BOTH correct per the
  reference-probed bucket map, the S54 precedent).
- **The evidence captures**: 5 dev-server screenshots (after re-login —
  the suite's scripts closed the named agent-browser session, the
  S53/S54/S55 lesson): s56-clone-desktop-expanded-1280.png (aside 260 /
  ml 260), s56-clone-desktop-collapsed-1280.png (aside 80 / ml 80),
  s56-clone-mobile-drawer-icononly-390.png (the shared collapsed state —
  the 288px panel, icon-only svgX 32, verified in-frame),
  s56-clone-mobile-drawer-labeled-390.png (the default — after the
  preference restore + reload, labeled, 288px),
  s56-clone-mobile-notes-390.png (navigated through the drawer, the
  auto-close verified in-frame). The capture set byte-mirrors the S55
  counterparts (217.1/240.0/47.8/67.4/101.1 KB vs
  217.3/239.5/47.4/67.1/100.8 KB) — the same rendered states. Plus the
  2 reference captures (`s56-reference-desktop-expanded-1280.png` 216.2
  KB, `s56-reference-mobile-drawer-labeled-390.png` 62.3 KB).
- **The docs**: this plan + session_149 (narrative) + session_150
  (summary) + the README session-56 row + the worklog entry. The count
  anchors (1133/834/299) untouched — zero code changes.
