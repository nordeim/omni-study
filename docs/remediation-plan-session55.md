# Remediation Plan — Session 55 (S55): the date-fragile calendar pins + the drawer-panel measurement race

**The session's governing question (2026-10-15/16):** the S54 session closed the
S53+1 stability confirmation with zero findings and zero code changes. This
session owes the repo the standing arrival audit — and this time the arrival
fell on the **15th of the month (UTC)**, a date no prior session ever ran the
full e2e gate on. The audit found **two test-suite defects** (one
deterministic, one flaky) — both in the e2e layer, zero in app code.

## The scope (validated against the codebase before execution)

1. **The arrival**: the workspace was RESET (no local checkout) — the
   fresh-clone rebuild per the S52/S53 recipe: clone at `be7ccc9`,
   `bun install` (489 packages), `.env` from `.env.example` with
   `DATABASE_URL="file:../db/custom.db"`, `db:push` + `db:seed`, the
   documented `bunx playwright install chromium` step (the cache held
   chromium-1200; Playwright 1.63 needs 1243 — the first full e2e run
   failed 276/299 on the missing executable until the install).
2. **The baseline gates**: lint, tsc, the 834-test unit layer, the
   production build — then the cold-`db/e2e.db` e2e.
3. **The standing checks**: the dev-server daemon (the S32 recipe), the
   preflight, the drawer-check, the live agent-browser 390×844 walkthrough
   on the clone (mobile-nav emphasis + the Tailwind v4 trap surfaces), the
   reference re-sweep (BOTH sidebar states — the post-S52 protocol).
4. **The code audit (Mode C)**: post-S54 commits, the static security scan,
   the dep-audit, the dep-registry re-check (the standing open item).
5. **The parity patterns reference**: the scandihaven repo
   (AGENTS/CLAUDE/PAD/SKILL + its skills catalog) reviewed for the
   tech-stack patterns — the mobile-nav testing discipline (390×844
   focus-trapped Radix drawer), the Tailwind v4 literal-token contract, the
   scoped-assertion E2E doctrine — all already embodied in this codebase;
   no architecture changes warranted (the house doctrine: the smallest
   safe diff).

## The findings

### F1 — deterministic: the two calendar "deselect today" pins hardcode day 15

`tests/e2e/parity-session8.spec.ts:222` and `tests/e2e/dark-mode.spec.ts:176`
both expose the today-cell tint by clicking a fixed "other" day:

```ts
const other = grid.locator("button").filter({ hasText: "15" }).first();
await other.click();
// then waitForFunction: the today cell's tint appears
```

The calendar initializes its selection **on today**. Clicking day 15 moves
the selection and unselects today — **unless today IS the 15th**, in which
case the click lands on the already-selected today, the selection does not
move, the today cell keeps the violet-500 selected fill, and the
`waitForFunction` for the tint runs into the 45 s timeout. **The sandbox
clock read 2026-10-15 UTC for this entire session** — the failure
reproduced 3/3 full runs (297/299 each time, exactly these two specs).

Why no prior session saw it: the full playwright e2e gate has never run on
a UTC 15th before. S54's baseline e2e ran on Oct 14 (hour ~23 UTC — the
session's own "Good evening" observation); the post-midnight standing suite
is agent-browser-based (the 33 audit scripts), not the playwright suite.
Live validation this session: on the clone's calendar (today = the 15th),
clicking day **16** deselects today and the tint `rgb(237, 233, 254)`
appears immediately — the fix shape confirmed before writing it.

**Verdict: a test-suite date-fragility defect. The app code is correct**
(the reference initializes the selection on today; clicking another day
moves it — verified live on BOTH apps).

### F2 — flaky: the S52-F drawer-panel width pin measures mid-animation

`tests/e2e/s52-sidebar-collapse.spec.ts:181` measures the drawer panel
immediately after `expect(drawer).toBeVisible()`:

```ts
const panelW = await drawer.locator(":scope > div")
  .evaluate((el) => Math.round(el.getBoundingClientRect().width)));
expect(Math.abs(panelW - 288)).toBeLessThan(2);
```

The panel carries `.sf-toast-in` — the 0.25 s `sf-slide-in` entry
animation whose `from` state is `translateY(8px) scale(0.98)`
(`globals.css:678`). `getBoundingClientRect()` **includes transforms**:
mid-animation the panel reads 288 × ~0.979 ≈ **282 px** → |282 − 288| = 6,
breaching the 2 px tolerance. `toBeVisible()` passes during the animation,
so the evaluate races the entry animation — observed failing 2 of ~10 runs
(1.9 s fast-fail), passing the rest. The standing `drawer-check-s14.mjs`
script is immune by construction: it measures `getComputedStyle(el).width`
(the CSS width — transform-independent).

**Verdict: a measurement-race defect in the pin** (the S8/S51 doctrine —
"transition cells animate reads; poll the FINAL value" — applies; the
animation itself is parity behavior and stays).

### Non-gaps (documented, no action)

- **The app code**: zero defects found on any axis this session. The
  calendar selection model and the drawer entry animation are both
  parity-correct.
- **The two dep advisories** (braces via eslint-config-next;
  deepmerge-ts via the prisma CLI): the fresh registry re-check — braces
  latest published IS the lockfile's own 3.0.3 (the fix release still does
  not exist); deepmerge-ts 8.0.2 exists but requires the Prisma major
  (latest 8.0.0-rc.23 — still RC-only). Both remain unfixable upstream;
  the upstream-wait position stands with fresh evidence.
- **The Docker `init` profile** remains an owner-host action (no daemon in
  this workspace).
- **The chromium-1200 vs 1243 cache gap**: environment, not repo — the
  documented `bunx playwright install chromium` step resolves it; no repo
  change warranted (the lockfile pins Playwright 1.63.0 correctly).

## The audit record (all other axes GREEN)

| Check | Verdict |
|-------|---------|
| Post-S54 commits | `22e6f28` (evidence) + `d99755d` + `be7ccc9` verified — the last two **doc-only** by `git show --stat` (session_144/145 + worklog); zero app-code changes since the S52 four-file fix |
| Baseline gates | lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.38 s) build ✓ — e2e 297/299 (F1 ×2, deterministic on the 15th) + F2 observed flaky |
| Dev-server preflight | GREEN (hydrated + navigation-stable) |
| Drawer-check (S14) | GREEN (backdrop/panel/links/footer + Escape-close) |
| Live 390×844 walkthrough (clone) | GREEN — login → scrollWidth 390 → sidebar hidden → burger visible → drawer **20 links** in the reference order → nav scrollable **1068 vs 755** → Notes via the drawer → auto-close → the active link violet-600 `rgb(124, 58, 237)` + the trailing violet-500 dot `rgb(139, 92, 246)` → Escape-close |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the nav UL `flex flex-col gap-1`: display flex / gap 4px / column / **zero margin children**), trap 9 (the drawer backdrop `blur(4px)`), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)`) — **the mobile navigation menu is working as expected; NO Tailwind v4 bug** |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260 / main width 1020; collapsed aside 80 / main ml 80 / main width 1200 / 20 icon-only links svgX 33 / footer 0 children / the glyph `rotate: 180deg` (v4's rotate property ≡ the reference's rotate-180 matrix) / `sf-sidebar-collapsed "1"` persisted |
| Mobile drawer shared state (clone) | the 288 px panel, 20 icon-only links svgX 32, nav scrollable 988 vs 755 — the S52 contract intact |
| Reference re-sweep | **UNCHANGED since S52/S53/S54** — the four anchors (title "AcademiaFlow (Copy)"; greeting "Good evening, sepnetflix2023 👋"; the 20-view href order `/Dashboard`…`/Settings` byte-identical; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020; collapsed 80/80/1200, chevron-only header, empty footer, icon-only svgX 33, `matrix(-1, 0, 0, -1, 0, 0)` glyph, `sidebarOpen "false"`) + the shared collapsed drawer (288 px, icon-only svgX 32, nav 912 vs 744, the reference's own `blur(4px)` backdrop). The stored preference restored to `"true"` before session close |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log`/`eval` — the single "eval" hit is a prose comment; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT; the SDK server-only in the 4 AI routes) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production, 0 runtime-reachable |
| Dep registry re-check | braces 3.0.3 = latest published (no fix exists); deepmerge-ts 8.0.2 needs Prisma 8 (latest 8.0.0-rc.23, RC-only) — both unfixable upstream |
| `.env` / db / test contracts | `.env` = `.env.example` verbatim with `DATABASE_URL="file:../db/custom.db"`; `db/` at the repo root (custom.db + e2e.db); the three-tool db-path resolution pinned by `tests/db-path.test.ts`; vitest.config.ts (834/20) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation, workers 1, retries 0) verified working |

## The ToDo list

- [x] Fresh-clone rebuild (the workspace was reset): install, .env,
      db:push + db:seed, playwright chromium
- [x] The five core docs + the S54 baseline docs re-read (AGENTS, CLAUDE,
      README, PAD, SKILL, session_142–145, the S54 plan, the worklog tail)
- [x] Baseline gates → 834 unit + build green; e2e 297/299 → **F1 found**
      (reproduced 3/3; root-caused to the hardcoded day-15 click)
- [x] The s52 spec re-run loop → **F2 found** (reproduced 2/~10;
      root-caused to the sf-slide-in scale(0.98) measurement race)
- [x] Live validation of both fix shapes on the dev server (day-16 click
      exposes the today tint; the panel measures 288 once settled)
- [x] The standing checks: preflight GREEN, drawer-check GREEN, the live
      walkthrough GREEN, the Tailwind v4 traps 4/7/9 clean
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — UNCHANGED; the preference restored
- [x] Mode-C review + dep-audit + the registry re-check
- [x] This plan written and validated against the codebase
- [x] **F1 fix (TDD)**: make the "other day" selection date-aware in both
      specs — read from the grid's own `[data-today]` marker
      (`today === 15 ? 16 : 15`) — never clicking today,
      runner-clock-independent; the assertions unchanged
- [x] **F2 fix (TDD)**: poll the FINAL panel width (`expect.poll` on the
      bounding-rect delta) so the measurement waits out the 0.25 s entry
      animation; the <2 px tolerance semantics preserved
- [x] Full gates re-run: lint ✓ tsc ✓ 834 unit ✓ build ✓ **cold-db 299 e2e ✓**
      (4.7 min) = **1133 green** (the count anchors untouched — the fixes
      are test-code only, no pin count change)
- [x] The flake loop re-verified: the s52 spec run 6/6 green (was 2/~10
      flaky pre-fix)
- [x] The standing suite: `bun scripts/standing-suite.mjs` — **GREEN 35/35**
      (launched detached on the daemon ~22:23 UTC, ~67 min wall)
- [x] Evidence: the 35-row envelope
      (`docs/screenshots/s55-standing-suite-evidence.json`) + 5 dev-server
      screenshots (byte-mirroring the S54 set) + 2 reference captures
- [x] Docs: this plan's execution log, session_146 (narrative) +
      session_147 (summary), the README session-55 row, the worklog entry
- [ ] Commit + push to `main` (the SSH wrapper, key verified + shredded)

## Why test-code-only changes (the judgment call)

The session's mandate is parity + production-readiness. The audit found
the app code sound on every axis: the reference is unchanged (both sidebar
states re-measured to the pin), the clone's implementation matches it at
every measured token, the mobile navigation works with no Tailwind v4 bug,
and the two defects are both in the e2e layer — one a date-fragile pin
that would fail ANY future session that runs the gate on a UTC 15th, the
other a measurement race that makes the S52 pin flaky. Fixing the pins
(test-code only, zero app-code, zero pin-count change) is exactly the
smallest safe diff: it hardens the 1133-gate itself — the executable
specification the house doctrine leans on — without touching a
verified-green production codebase. The TDD arc applies directly: both
defects were reproduced RED first (F1 3/3 full runs; F2 captured in a
re-run loop with the exact 282-vs-288 reading), the fixes drive them
GREEN, and the full cold-db regression re-run proves the 297 prior pins
untouched.

## The execution log (2026-10-15/16, the S55 session)

- **The arrival**: the workspace was RESET — the fresh-clone rebuild per
  the S52/S53 recipe (clone at `be7ccc9`, `bun install` 489 packages,
  `.env` from `.env.example` with `DATABASE_URL="file:../db/custom.db"` +
  `AUTH_SECRET=""`, `db:push` + `db:seed`, the documented
  `bunx playwright install chromium` step — the cache held chromium-1200
  while Playwright 1.63 pins 1243; the first e2e attempt failed 276/299
  on the missing executable until the install ran).
- **The baseline**: lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.38 s) build ✓
  — the cold-db e2e **297/299 × 3 consecutive runs**: F1 reproduced
  (the two 45 s calendar timeouts, deterministic on the UTC 15th).
- **The flake loop**: the s52 spec re-run ~10× — F2 reproduced 2×
  (the |282−288|=6 width reading) and the error-context snapshot captured
  (the mid-animation scale race root-caused to `sf-slide-in`).
- **The fixes (TDD)**: F1 — the date-aware "other day" read from the
  grid's own `[data-today]` marker in both specs; F2 — `expect.poll` on
  the settled panel width. Test-code only; assertions unchanged.
- **GREEN**: the two calendar specs pass on the 15th (1.1 s each); the
  s52 spec 6/6 in the re-run loop; the full gates re-run — lint ✓ tsc ✓
  834 unit ✓ build ✓ (exit 0; the one Turbopack warning = the documented
  S22 boot-guard `process.exit(1)`, pre-existing) + **cold-db 299 e2e ✓**
  (4.7 min) = **1133 green**.
- **The standing checks**: the daemon (health 200), preflight GREEN,
  drawer-check GREEN, the live 390×844 walkthrough GREEN (mobile nav
  working; traps 4/7/9 verified live clean; both desktop sidebar states
  + the shared drawer state measured to the pin).
- **The reference re-sweep** (the operator account, 1280×800 then
  390×844): UNCHANGED — the four anchors + BOTH sidebar states + the
  shared drawer reproduced exactly; the preference restored to
  `"true"` before session close.
- **The Mode-C review + the dep work**: both post-S54 commits doc-only;
  the static scan clean; the dep-audit exit 0; the npm registry queries
  (braces 3.0.3 = latest; deepmerge-ts 8.0.2 exists but Prisma 8 latest
  = 8.0.0-rc.23, RC-only; eslint-config-next 16.4.2) — both advisories
  remain unfixable upstream.
- **The confirmation**: `bun scripts/standing-suite.mjs` launched
  detached on the daemon (the S32 recipe) at ~22:23 UTC — **GREEN 35/35**
  (~67 min wall; the S31 preflight, the 33 standing audits, the
  theme-restore closing guard light/violet). The 35-row envelope saved
  as `docs/screenshots/s55-standing-suite-evidence.json` with the
  session context header.
- **The evidence captures**: 5 dev-server screenshots (after re-login —
  the suite's scripts had closed the named agent-browser session, the
  S53/S54 lesson): s55-clone-desktop-expanded-1280.png (aside 260 /
  ml 260), s55-clone-desktop-collapsed-1280.png (aside 80 / ml 80),
  s55-clone-mobile-drawer-icononly-390.png (the shared collapsed state —
  the 288px panel, icon-only svgX 32), s55-clone-mobile-drawer-labeled-390.png
  (the default — after the preference restore + reload, labeled,
  288px), s55-clone-mobile-notes-390.png (navigated through the drawer,
  auto-close verified). The capture set byte-mirrors the S54
  counterparts (239.5/217.3/47.4/67.1/100.8 KB vs
  239.9/217.3/47.8/67.4/100.9 KB) — the same rendered states. Plus 2
  reference captures (s55-reference-desktop-expanded-1280.png,
  s55-reference-mobile-drawer-labeled-390.png).
- **The docs**: this plan + session_146 (narrative) + session_147
  (summary) + the README session-55 row + the worklog entry. The count
  anchors (1133/834/299) untouched — test-code-only changes.
