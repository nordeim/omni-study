# Remediation Plan — Session 57 (S57): the AP-90 pre-mount gate race — the two-spec e2e hardening

**The session's governing question (2026-10-16):** the S56 session closed
zero-findings/zero-code with the standing suite GREEN 35/35, and exactly one
doc-only commit has landed since (`ce97049` — session_151, the S56 process
log, verified by `git show --stat`: 1 file, +70). This session owed the
standing arrival audit — and the fresh-clone baseline e2e run produced the
project's first F1-class finding in two sessions: a full-run flake in the
S8-A nav-icons pin (298/299, "Expected length: 20 / Received length: 0"),
which the session traced to the documented AP-90 race class and closed as a
two-spec test-code-only fix.

## The scope (validated against the codebase before execution)

1. **The arrival** — the workspace had been RESET (the S52/S53/S55
   fresh-clone recipe): clone at `ce97049`, `bun install` 489 packages,
   `.env` from `.env.example` (DATABASE_URL `file:../db/custom.db` +
   AUTH_SECRET ""), `db:push` + `db:seed`, the `bunx playwright install
   chromium` step (the v1243 headless shell — matched the Playwright 1.63
   pin this time). The five core docs re-read, the S56 baseline docs
   (session_149/150/151, the S56 plan, the worklog tail) absorbed, the
   understanding validated against the codebase (HEAD doc-only, the count
   anchors 1133/834/299, the last app-code change = the S52 four-file fix).
2. **The baseline gates**: lint, tsc, the 834-test unit layer, the
   production build, the cold-`db/e2e.db` e2e (299).
3. **The standing checks**: the dev-server daemon (the S32 recipe), the
   preflight, the drawer-check, the live agent-browser 390×844 walkthrough
   on the clone (the mobile-navigation emphasis + the Tailwind v4 trap
   surfaces), the reference re-sweep (BOTH sidebar states — the post-S52
   protocol), the Mode-C code review, the dep-audit + the registry
   re-check, the scandihaven patterns reference.
4. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows.

## The findings

**ZERO app-code findings. TWO test-suite findings (F1 observed live in the
full-run baseline; F2 the same latent class, proven deterministically).**
Every other stage of the arrival audit read GREEN:

| Check | Verdict |
|-------|---------|
| Post-S56 commit | `ce97049` verified **doc-only** by `git show --stat` (session_151 only, +70) — zero app-code changes since the S52 four-file fix |
| Baseline gates (run 1) | lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.34 s) build ✓ — but the cold-db e2e read **298/299**: F1 observed live (the S8-A nav-icons pin — "Expected length: 20 / Received length: 0", no timeout, 911 ms — the race signature, not a real defect signature) |
| F1 root cause | **The AP-90 pre-mount gate race.** `page.tsx` applies the theme (`loadFromUser` → `applyToDocument` → `--sf-primary`) BEFORE `await dataPromise` (the initial-collections pre-warm), while the shell flips off `<Splash/>` only after BOTH auth and the pre-warm settle. The spec's `hydrated()` gate (the `--sf-primary` inline var) is therefore satisfiable while the Splash still shows; `evaluateAll` on `nav a svg` then reads 0 icons. Under the full run's memory pressure the pre-warm occasionally resolves late — the window is closed in normal conditions (the S55/S56 299/299 runs) but opens under load |
| F1 reproduction | Isolated re-run PASS; a 10× cold single-spec loop 10/10 PASS (the race is rare without full-run load — the honest characterization: 1 observed live failure in 3 full-context runs + 0/10 isolated + 0/1 isolated); then a **deterministic diagnostic** (a throwaway spec, run then deleted): delaying ONLY the five Dashboard pre-warm endpoints by 600 ms while `/api/auth/me` stays fast reproduced the exact signature — `shell present at gate-pass: false; icons read: 0`, the assertion failing byte-identically to the live run |
| F2 root cause | The same AP-90 class in `accessibility.spec.ts` S12-B ("first Tab stop is the skip link"): the `gotoMode` mode wait (`html.dark` absent) is satisfiable **at first paint** by the pre-hydration boot script (light = no `.dark` to wait away), and `hydrated()` likewise — so the `Tab` press can land on `<body>` while the Splash shows. Latent (never flaked in ~40 sessions of this spec) but the identical mechanism — AP-90's own documented first crash shape |
| F2 reproduction | The same deterministic diagnostic: under the 600 ms pre-warm delay, the first Tab stop read `BODY "Loading StudyFlow…"` — `expect(first.tag).toBe("A")` failing exactly as predicted |
| The fix (TDD, test-code only) | The documented AP-90 guard — `await page.waitForFunction(() => !!document.querySelector("aside nav"))` folded in before the shell-DOM reads in BOTH tests (parity-session8.spec.ts S8-A + accessibility.spec.ts S12-B), with the mechanism documented in the spec comments. Assertions unchanged; pin counts unchanged; +14 lines across two files; **zero app code touched** |
| The GREEN proof | The same diagnostic re-run with the FIXED gate shape under the IDENTICAL 600 ms delay: F1 reads 20/20 icons, F2 reads `A "Skip to main content"` — the fix defeats the race, not just the symptom. The diagnostic deleted; the full cold e2e re-run with the fixes: **299 passed (4.6 min)** — the count anchors restored |
| Dev-server preflight | GREEN (hydrated + navigation-stable) |
| Drawer-check (S14) | GREEN (backdrop/panel/links/footer + Escape-close) |
| Live 390×844 walkthrough (clone) | GREEN — login → scrollWidth 390 → sidebar hidden → burger visible → drawer 20 links in the reference order → nav scrollable **1068 vs 755** → Notes via the drawer → auto-close → the active link violet-600 `rgb(124, 58, 237)` + the violet→indigo 10% gradient + the trailing violet-500 dot `rgb(139, 92, 246)` → Escape-close |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the nav UL `flex flex-col gap-1`: display flex / gap 4px / column / **zero margin children**), trap 9 (the drawer backdrop `blur(4px)`), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)` — the documented expected form) |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260 / main width 1020; collapsed aside 80 / main ml 80 / main width 1200 / 20 icon-only links svgX 33 / footer 0 children / the glyph `rotate: 180deg` (v4's rotate property ≡ the reference's rotate-180 matrix) / `sf-sidebar-collapsed` persisted; the mobile drawer SHARING the state (the 288px panel, 20 icon-only links svgX 32, nav scrollable 988 vs 755); the preference restored to expanded (round-trip verified through a reload) |
| Reference re-sweep | **UNCHANGED since S52/S53/S54/S55/S56** — the four anchors (title "AcademiaFlow (Copy)"; greeting "Good morning, sepnetflix2023 👋" [the hour-2 UTC bucket]; the 20-view href order `/Dashboard`…`/Settings` byte-identical; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020; collapsed 80/80/1200, chevron-only header, empty footer, icon-only svgX 33, `matrix(-1, 0, 0, -1, 0, 0)` glyph, `sidebarOpen "false"` persisted) + the shared collapsed drawer (288px, icon-only svgX 32, nav 912 vs 744, the reference's own `blur(4px)` backdrop serializing `rgba(0, 0, 0, 0.2)` — the v3-era form; the clone's `oklab(0 0 0 / 0.2)` is the documented v4-equivalent, trap 7's dual-serialization acceptance). The stored preference restored to `"true"` before session close; 2 reference captures saved |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT in `src/app/layout.tsx`; the SDK server-only in the 4 AI routes) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| The registry re-check | braces — UNCHANGED (3.0.3 = the latest published; the fix release does not exist). deepmerge-ts — the stable fix path re-confirmed on **Prisma 7.10.1** (`@prisma/config@7.10.1` → deepmerge-ts 8.0.2; the 7.x stable line ends at 7.10.1), with one registry-drift note: the `latest` dist-tag now points at the **Prisma 8 RC** (8.0.0-rc.23) — the 7.x stable remains on `prev`. The S56 judgment call re-affirmed: the major ORM upgrade stays the named next-step candidate for a DEDICATED session (owner decision) — the advisory is non-production by construction (CLI-surface only, 0 runtime-reachable) and the upgrade remains the highest-risk change class for this repo |
| `.env` / db / test contracts | `.env` = `.env.example` verbatim with `DATABASE_URL="file:../db/custom.db"`; `db/` at the repo root (custom.db + e2e.db); the three-tool db-path resolution pinned by `tests/db-path.test.ts`; vitest.config.ts (834/20) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation, workers 1, retries 0) verified working |
| Scandihaven patterns reference | reviewed (HEAD `d4789c3`, 2026-10-04 — unchanged) — the mobile-nav testing discipline, the Tailwind v4 literal-token contract, the scoped-assertion E2E doctrine all already embodied; no architecture changes warranted |

### Why F1/F2 are test-suite defects, not app bugs (the S28/ADR-026 reasoning)

The app's behavior is BY DESIGN: `page.tsx` applies the theme before the
pre-warm settles so a returning user never sees an unthemed flash (the
S16-A no-CLS Splash→shell replacement — the shell flips only when BOTH auth
and the initial collections have settled, which is exactly what kills the
layout shift). The specs' gates were the stale expectation: a wait
condition satisfiable PRE-MOUNT (`--sf-primary`, or the boot script's
`.dark` handling) is not a gate for POST-MOUNT reads — the documented
AP-90 lesson, previously applied to the S43 sweep probes and their S41/S42
siblings but not back-ported to these two e2e specs. The fix asserts the
design (gate on the shell itself), not the accident (gate on the theme
observable) — the probe now tracks the designed channel.

**Non-gaps (documented, no action):**

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace (no daemon,
  re-verified).
- The Prisma 7 upgrade — the named next-step candidate (owner decision;
  a dedicated session, not an in-session drive-by).
- The Splash/pre-warm design itself — parity behavior, deliberately
  untriggered by the fix (the fix gates the TEST, not the app).

## The ToDo list

- [x] The arrival: the fresh-clone rebuild (the S52/S53/S55 recipe) at
      `ce97049`, the five core docs + the S56 baseline docs re-read, the
      understanding validated against the codebase
- [x] The baseline gates — run 1: lint ✓ tsc ✓ 834 unit ✓ build ✓ +
      cold-db e2e **298/299** (F1 observed live)
- [x] F1/F2 root-caused (the AP-90 pre-mount gate race — the code-read:
      `loadFromUser` applies the theme BEFORE `await dataPromise`; the
      boot script satisfies the mode gate at first paint)
- [x] F1/F2 reproduced RED (the live full-run signature + the
      deterministic 600 ms pre-warm-delay diagnostic: F1 `shell false /
      icons 0`; F2 `BODY "Loading StudyFlow…"`)
- [x] The fixes (test-code only, TDD): the shell-presence gate
      (`!!document.querySelector("aside nav")`) folded into both specs,
      the mechanism documented in the spec comments
- [x] The GREEN proof: the diagnostic re-run under the IDENTICAL delay —
      F1 20/20 icons, F2 `A "Skip to main content"`; the diagnostic
      deleted
- [x] The baseline gates — run 2 with the fixes: lint ✓ tsc ✓ 834 unit ✓
      build ✓ cold-db **299 e2e ✓** (4.6 min) = **1133 green**, the count
      anchors restored
- [x] The dev daemon (the S32 recipe, health 200) + the preflight GREEN
      + the drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/7/9 verified live clean; both desktop
      sidebar states + the shared drawer state measured to the pin)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED**; the preference restored
- [x] The Mode-C review (the doc-only HEAD verified; the static scan
      clean) + the dep-audit GREEN + the registry re-check (the stable
      Prisma 7.10.1 fix path re-confirmed; the `latest` dist-tag drift to
      the Prisma 8 RC noted; the S56 judgment call re-affirmed)
- [x] The scandihaven patterns reference re-verified (unchanged,
      `d4789c3`)
- [x] This plan written and validated against the codebase
- [x] The confirmation: `bun scripts/standing-suite.mjs` — all 35 rows
      (launched detached on the daemon per the S32 recipe at 02:17 UTC —
      **GREEN 35/35, zero total findings**, ~72 min wall)
- [x] The evidence: the 35-row envelope
      (`docs/screenshots/s57-standing-suite-evidence.json` with the session
      context header) + the 5 dev-server screenshots (the S56 capture set
      mirrored) + the 2 reference captures
- [x] Docs: this plan's execution log, session_152 (narrative) +
      session_153 (summary), the README session-57 row, the SKILL AP-90
      row extension (the e2e back-port), the worklog entry
- [ ] Commit + push to `main` (the SSH wrapper, key verified + shredded)

## Why the diff is two spec files and nothing else (the judgment call)

The session's mandate is parity + production-readiness. The audit found
the app sound on every axis — the reference unchanged, the clone matching
it at every measured token, the mobile navigation working with no
Tailwind v4 bug, the static scan clean — and the ONE observed defect
(298/299) traced to a test-gate race, not to app behavior. The S55
precedent applies directly: harden the gate, touch nothing else. The
assertions are unchanged (they still pin the same reference-measured
truths), the pin counts are unchanged (299), the app code is untouched —
the smallest safe diff that restores the verified-green 1133 gate. The
TDD loop is complete: RED (live + deterministic) → fix → GREEN
(deterministic + full suite).

## The execution log (2026-10-16, the S57 session)

- **The arrival**: the workspace had been RESET — the fresh-clone rebuild
  (the S52/S53/S55 recipe): clone at `ce97049` (verified doc-only:
  session_151, +70 — the S56 process log), `bun install` 489 packages,
  `.env` from `.env.example`, `db:push` + `db:seed` (the demo user +
  sample data), `bunx playwright install chromium` (v1243 — matched the
  1.63 pin). The five core docs + the S56 baseline docs re-read; the
  understanding validated (HEAD doc-only, the count anchors, the last
  app-code change = S52).
- **The baseline, run 1**: lint ✓ tsc ✓ **834 unit ✓** (20 files,
  3.34 s) build ✓ — then the cold-db e2e read **298/299**: the S8-A
  nav-icons pin failed with "Expected length: 20 / Received length: 0"
  (911 ms, no timeout — the race signature). The failure investigated
  immediately: isolated re-run PASS → a 10× cold single-spec loop 10/10
  PASS → the code-read (page.tsx: the theme applied before the pre-warm
  await; the boot script satisfying the mode gate at first paint) → the
  deterministic diagnostic (a 600 ms delay on ONLY the five Dashboard
  pre-warm endpoints): **F1 RED reproduced** (`shell present at
  gate-pass: false; icons read: 0` — byte-identical to the live failure)
  and **F2 RED proven** (the Tab-stop test's latent twin: `BODY
  "Loading StudyFlow…"`).
- **The fixes (TDD)**: the documented AP-90 guard — the shell-presence
  wait (`!!document.querySelector("aside nav")`) folded into both specs
  with the mechanism documented in the comments. **The GREEN proof**: the
  diagnostic re-run under the IDENTICAL delay — F1 reads 20/20 icons, F2
  reads `A "Skip to main content"`; the diagnostic deleted. The full
  cold e2e re-run: **299 passed (4.6 min)** — **1133 green** restored,
  the count anchors untouched (+14 test-code lines, two files).
- **The standing checks**: the daemon via the S32 recipe (health 200),
  the preflight GREEN, the drawer-check GREEN, the live 390×844
  walkthrough GREEN — the mobile navigation menu working as expected, NO
  Tailwind v4 bug (traps 4/7/9 verified live clean), both desktop
  sidebar states + the shared mobile drawer state measured to the pin,
  the preference restored to expanded (round-trip through a reload).
- **The reference re-sweep** (the operator account, 1280×800 then
  390×844): UNCHANGED — the four anchors (the title, the hour-2
  "Good morning" greeting, the 20-view href order byte-identical, the
  five Settings tabs) + BOTH sidebar states (expanded 260/260/1020;
  collapsed 80/80/1200 with the chevron-only header, the empty footer,
  the icon-only svgX 33, the `matrix(-1, 0, 0, -1, 0, 0)` glyph,
  `sidebarOpen "false"` persisted) + the shared collapsed drawer (the
  288px panel, the icon-only svgX 32, nav 912 vs 744, the reference's
  own `blur(4px)` backdrop). The stored preference restored to `"true"`
  before session close; 2 reference captures saved
  (`s57-reference-desktop-expanded-1280.png`,
  `s57-reference-mobile-drawer-labeled-390.png`).
- **The Mode-C review + the dep work**: the HEAD commit doc-only; the
  static scan clean (all three documented exceptions re-verified); the
  dep-audit exit 0 (the 2 non-production advisories); **the registry
  re-check** — braces unchanged (3.0.3 = latest, unfixable upstream);
  the stable Prisma 7.x line still ends at 7.10.1 (carrying the fixed
  `@prisma/config@7.10.1 → deepmerge-ts@8.0.2`), with the `latest`
  dist-tag now pointing at the Prisma 8 RC (8.0.0-rc.23) — the S56
  judgment call re-affirmed: the major upgrade stays the dedicated-
  session candidate (owner decision).
- **The scandihaven reference**: unchanged (`d4789c3`, 2026-10-04).
- **The confirmation + the evidence**: `bun scripts/standing-suite.mjs`
  launched detached on the daemon (the S32 recipe — the interactive
  sessions closed first per the OOM lesson) at 02:17 UTC — **GREEN 35/35,
  ZERO total findings** (~72 min wall; the S31 preflight, the 33 standing
  audits, the theme-restore closing guard light/violet). The 35-row
  envelope with the session context header saved as
  `docs/screenshots/s57-standing-suite-evidence.json`. The 5 dev-server
  screenshots captured after a re-open + re-login (the S53–S56 lesson —
  the suite's scripts close the named session):
  `s57-clone-desktop-expanded-1280.png` (aside 260 / ml 260),
  `s57-clone-desktop-collapsed-1280.png` (aside 80 / ml 80),
  `s57-clone-mobile-drawer-icononly-390.png` (the shared collapsed state
  — the 288px panel, icon-only, verified in-frame),
  `s57-clone-mobile-drawer-labeled-390.png` (the default — after the
  preference restore + reload, 20 labeled links, 288px), and
  `s57-clone-mobile-notes-390.png` (navigated through the drawer, the
  auto-close verified in-frame). The capture set byte-mirrors the S56
  counterparts (216.9/240.2/47.8/67.4/101.1 KB vs
  217.1/240.0/47.8/67.4/101.1 KB) — the same rendered states. Plus the 2
  reference captures (216.6 / 62.3 KB).
- **The docs**: this plan + session_152 (narrative) + session_153
  (summary) + the README session-57 row + the SKILL AP-90 row extension
  (the S57 e2e back-port: Playwright's auto-waiting protects actionable
  locators/clicks — NOT bare `evaluateAll`/`page.evaluate` reads) + the
  worklog entry. The count anchors (1133/834/299) restored and untouched
  by the fix — test-code only; the app code untouched.
