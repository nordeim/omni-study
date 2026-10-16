# Remediation Plan — Session 61 (S61): the S60+1 stability confirmation — the standing arrival audit

**The session's governing question (2026-10-17):** the S60 session closed the
S59+1 stability confirmation with the 1133 gate re-confirmed on a fresh clone
and the standing suite GREEN 35/35, and exactly two doc-only commits have
landed since (`f986301` — session_166, the S60 process log, + the ticked plan
checkbox + the worklog note; `44b9528` — session_167, the S60 narrative; both
verified by `git show --stat`: zero app code). This session owed the standing
arrival audit per the documented protocol (the S60 "suggested next steps" ③ —
the arrival re-sweep) and read **ZERO findings on every axis**: the baseline
gates re-confirmed byte-for-byte on a fresh clone, the standing checks all
GREEN, the reference re-swept **UNCHANGED** since S52–S60, the Mode-C review
clean, the dep-audit GREEN, and the registry landscape stable. **Zero code
changes by design** (the S53/S54/S56/S58/S59/S60 precedent: the smallest safe
diff is no diff on a verified-green production codebase).

## The scope (validated against the codebase before execution)

1. **The arrival** — the workspace had been RESET (the S52/S53/S55/S57/S58/
   S59/S60 fresh-clone recipe): clone at `44b9528` (3,368 files), `bun
   install` 489 packages (6.73 s), `.env` from `.env.example` (DATABASE_URL
   `file:../db/custom.db` + AUTH_SECRET ""), `db:push` + `db:seed` (the demo
   user + sample data), the `bunx playwright install chromium` step (v1243
   headless shell, matching the Playwright 1.63 pin). The five core docs
   re-read (AGENTS/CLAUDE/README/PAD/SKILL), the S60 baseline docs
   (session_166, the S60 plan, session_167, the worklog tail) absorbed, the
   understanding validated against the codebase (HEAD doc-only, the count
   anchors 1133/834/299, the last app-code change = the S52 four-file fix).
   The skills/ catalog consulted (agent-browser, tdd, clone-app-pat-pro,
   tailwind-patterns); skills/ excluded from checking/testing/compilation
   per the standing contract.
2. **The baseline gates**: lint, tsc, the 834-test unit layer, the production
   build, the cold-`db/e2e.db` e2e (299).
3. **The standing checks**: the dev-server daemon (the S32 recipe), the
   preflight, the drawer-check, the live agent-browser 390×844 walkthrough on
   the clone (the mobile-navigation emphasis + the Tailwind v4 trap surfaces),
   the desktop sidebar states + the shared mobile drawer state, the reference
   re-sweep (BOTH sidebar states — the post-S52 protocol), the Mode-C code
   review, the dep-audit + the registry re-check, the scandihaven patterns
   reference.
4. **The confirmation**: `bun scripts/standing-suite.mjs` — all 35 rows.

## The findings

**ZERO findings — app code, test code, and docs alike.** Every axis of the
arrival audit read GREEN:

| Check | Verdict |
|-------|---------|
| Post-S60 commits | `f986301` (session_166 + plan checkbox + worklog, +79/−12) and `44b9528` (session_167, +76) both verified **doc-only** by `git show --stat` — zero app-code changes since the S52 four-file fix |
| Baseline gates | lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.58 s) build ✓ cold-db **299 e2e ✓** (4.6 min) = **1133 green** — byte-for-byte the documented S60 state, zero flake |
| Dev-server preflight | GREEN (hydrated + navigation-stable, health 200 via the S32 daemon recipe) |
| Drawer-check (S14) | GREEN (backdrop/panel/links/footer + Escape-close) |
| Live 390×844 walkthrough (clone) | GREEN — login (demo@studyflow.app) → scrollWidth 390 → sidebar hidden → burger visible (the visibility-filtered locator per the S58 lesson) → the drawer 20 links in the exact reference order → nav scrollable **1068 vs 755** → panel 288px, 48px labeled links. The active-link triple-pin: violet-600 `rgb(124, 58, 237)` + the violet→indigo 10% gradient `linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))` (the `.sf-nav-active` label-wrapper span, inline style) + the trailing violet-500 dot `rgb(139, 92, 246)` (6px). Notes via the drawer with auto-close ✓, Escape-close ✓ |
| Tailwind v4 trap surfaces | CLEAN — trap 4 (the nav UL `flex flex-col gap-1`: display flex / gap 4px / column / **zero margin children**), trap 9 (the drawer backdrop BUTTON `backdrop-filter: blur(4px)` — probed on the backdrop-filter property, not `filter`, per the v4 notched-blur contract), trap 7 (`bg-black/20` serializing `oklab(0 0 0 / 0.2)` — the documented expected form) |
| **The mobile navigation menu** | **working as expected — NO Tailwind v4 bug found** |
| Desktop sidebar states (clone) | expanded aside 260 / main ml 260 / main width 1020; collapsed via the "Collapse sidebar" button: 80/80/1200 with 20 icon-only links (svgX 33, the x-position probe per the S52 protocol — all icons identical, zero visible labels), the empty footer (the `mt-auto` placeholder, content unmounted — the designed S52 parity), the glyph `rotate: 180deg` (v4's rotate property ≡ the reference's rotate-180 matrix), `sf-sidebar-collapsed` "1" persisted; the mobile drawer SHARING the state (the 288px panel, 44px icon-only links, svgX 32, nav scrollable 988 vs 755, no labels); the preference restored to expanded ("0") + the reload round-trip verified (the labeled drawer: 20 labels, 48px links) |
| Reference re-sweep | **UNCHANGED since S52–S60** — the four anchors (title "AcademiaFlow (Copy)"; greeting "Good evening, sepnetflix2023 👋" [the hour-21 UTC bucket — the evening band 17–23, correct per the bucket map]; the 20-view href order `/Dashboard`…`/Settings` byte-identical; the five Settings tabs Appearance/Profile/Subjects/Holidays/Notifications) + BOTH sidebar states re-measured (expanded 260/260/1020; collapsed 80/80/1200, chevron-only header, empty footer, icon-only svgX 33, the `matrix(-1, 0, 0, -1, 0, 0)` glyph, `sidebarOpen "false"` persisted) + the shared collapsed drawer (the nav census per the S58 lesson: the drawer's own visible nav x0 w288, the 288px panel, 44px icon-only links, svgX 32, nav 912 vs 744, the reference's own DIV backdrop `blur(4px)` serializing `rgba(0, 0, 0, 0.2)` — the v3-era form; the clone's `oklab(0 0 0 / 0.2)` is the documented v4-equivalent, trap 7's dual-serialization acceptance); the reference's drawer does NOT close on Escape (the clone's documented superset, verified live again); the stored preference restored to `"true"` before session close; 2 reference captures saved |
| Mode-C code review | ZERO app-code findings — the static scan clean (zero TODO/FIXME/`: any`/`console.log`; the single `eval(` hit = the documented prose comment in `src/lib/calculator.ts` line 4; the one `dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT in `src/app/layout.tsx:44`; the SDK server-only in the 4 AI routes — chat/generate-cards/generate-questions/math-solve) |
| Dep-audit | GREEN (exit 0) — 2 advisories documented as non-production (braces via eslint-config-next, dev surface; deepmerge-ts via the prisma CLI — both OUTSIDE the standalone runtime trace), 0 runtime-reachable |
| The registry re-check | **UNCHANGED** — braces: the latest published IS the lockfile's own 3.0.3 (the fix release does not exist — unfixable upstream). deepmerge-ts: the stable fix path re-confirmed on **Prisma 7.10.1** (`@prisma/config@7.10.1` → deepmerge-ts 8.0.2; the 7.x stable line still ends at 7.10.1, no newer 7.x has shipped), the `latest` dist-tag still on the Prisma 8 RC (8.0.0-rc.23, not production-safe; `prev` = 7.10.1; the `next` tag also an 8.0.0-rc.10 RC channel — no stable change). The S56/S57/S58/S59/S60 judgment call re-affirmed: the major ORM upgrade stays the named next-step candidate for a DEDICATED session (owner decision) |
| `.env` / db / test contracts | `.env` = `.env.example` verbatim with `DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`; `db/` at the repo root (custom.db + e2e.db, never colliding; the e2e scratch deleted-cold every run); the three-tool db-path resolution pinned by `tests/db-path.test.ts`; vitest.config.ts (834/20 files, `*.test.ts` only) + playwright.config.ts (299, standalone :3100 + `db/e2e.db` isolation via the shell-supplied `E2E_DATABASE_URL`, workers 1, retries 0) verified working |
| Scandihaven patterns reference | reviewed (HEAD `d4789c3`, verified by `git ls-remote`) — unchanged since the S52–S60 reviews; no architecture changes warranted |

### Non-gaps (documented, no action)

- The Docker `init` profile (`docker compose --profile init up`) remains
  an owner-host action — not executable in this workspace.
- The Prisma 7 upgrade — the named next-step candidate (owner decision;
  a dedicated session, not an in-session drive-by), stable at 7.10.1 for a
  sixth consecutive re-check.
- The reference's Escape-close absence — the clone's documented superset,
  not a gap to close.

## The ToDo list

- [x] The arrival: the fresh-clone rebuild (the S52/S53/S55/S57/S58/S59/S60
      recipe) at `44b9528`, the five core docs + the S60 baseline docs
      re-read, the understanding validated against the codebase (HEAD
      doc-only, the count anchors 1133/834/299)
- [x] The baseline gates: lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.58 s)
      build ✓ cold-db **299 e2e ✓** (4.6 min) = **1133 green**
- [x] The dev daemon (the S32 recipe, health 200) + the preflight GREEN
      + the drawer-check GREEN
- [x] The live agent-browser 390×844 walkthrough GREEN (the mobile
      navigation working; traps 4/7/9 verified live clean; both desktop
      sidebar states + the shared drawer state measured to the pin; the
      preference restored with the reload round-trip verified)
- [x] The reference re-sweep with the operator account — BOTH sidebar
      states + the shared drawer — **UNCHANGED**; the preference restored
- [x] The Mode-C review (both post-S60 commits verified doc-only; the
      static scan clean) + the dep-audit GREEN + the registry re-check
      (braces unchanged; the Prisma 7.10.1 fix path re-confirmed; no newer
      7.x; the `latest` dist-tag still on the Prisma 8 RC)
- [x] The scandihaven patterns reference re-verified (unchanged,
      `d4789c3`)
- [x] This plan written and validated against the codebase
- [x] The confirmation: `bun scripts/standing-suite.mjs` — all 35 rows
      (launched detached on the daemon per the S32 recipe)
- [x] The evidence: the 35-row envelope
      (`docs/screenshots/s61-standing-suite-evidence.json` with the
      session context header) + the 5 dev-server screenshots + the 2
      reference captures
- [x] Docs: this plan's execution log, session_168 (narrative) +
      session_169 (Chinese summary), the README session-61 row, the
      worklog entry
- [x] Commit + push to `main` (the SSH wrapper, key verified + shredded)

## Why the diff is zero (the judgment call)

The session's mandate is parity + production-readiness. The audit found the
app sound on every axis — the reference unchanged, the clone matching it at
every measured token, the mobile navigation working with no Tailwind v4 bug,
the static scan clean, the dep posture unchanged — and the
S53/S54/S56/S58/S59/S60 precedent applies directly: on a verified-green
production codebase with zero findings, the smallest safe diff is **no
diff**. The count anchors (1133/834/299) are untouched by construction; the
only tree changes are the session's documentation (this plan, the session
logs, the README row, the worklog entry) and the evidence captures.

## The execution log (2026-10-17, the S61 session)

- **The arrival**: the workspace had been RESET — the fresh-clone rebuild
  (the S52/S53/S55/S57/S58/S59/S60 recipe): clone at `44b9528` (verified
  doc-only: session_167, +76; `f986301` likewise doc-only: session_166 +
  the ticked plan checkbox + the worklog note, +79/−12), `bun install` 489
  packages (6.73 s), `.env` from `.env.example`, `db:push` + `db:seed` (the
  demo user + sample data), `bunx playwright install chromium` (v1243 —
  matched the 1.63 pin). The five core docs read; the S60 baseline docs
  re-read; the understanding validated (HEAD doc-only, the count anchors,
  the last app-code change = S52).
- **The baseline gates**: lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.58 s)
  build ✓ cold-db e2e **299/299 ✓** (4.6 min) = **1133 green** —
  byte-for-byte the documented S60 state.
- **The standing checks**: the daemon via the S32 recipe (health 200), the
  preflight GREEN, the drawer-check GREEN, the live 390×844 walkthrough
  GREEN — the mobile navigation menu working as expected, NO Tailwind v4
  bug (traps 4/7/9 verified live clean), both desktop sidebar states + the
  shared mobile drawer state measured to the pin, the preference restored
  to expanded (round-trip through a reload, pref "0").
- **The reference re-sweep** (the operator account, 1280×800 then
  390×844): UNCHANGED — the four anchors (the hour-21 "Good evening"
  greeting — the evening bucket correct per the map) + BOTH sidebar states
  + the shared collapsed drawer (288px, 44px links, svgX 32, nav 912 vs
  744, the reference's own `blur(4px)` + `rgba(0, 0, 0, 0.2)` DIV
  backdrop); the Escape-close absence on the reference re-verified (the
  clone's documented superset); the stored preference restored to `"true"`
  before session close; 2 reference captures saved
  (`s61-reference-desktop-expanded-1280.png` — gated on the CTA verified
  in-frame at x1093/y46/155×36 + the h1 greeting read, per the S59 capture
  lesson; `s61-reference-mobile-drawer-labeled-390.png` — 20 labels, 48px
  links, verified in-frame).
- **The Mode-C review + the dep work**: both post-S60 commits verified
  doc-only; the static scan clean (all three documented exceptions
  re-verified); the dep-audit exit 0 (the 2 non-production advisories);
  **the registry re-check** — braces unchanged (3.0.3 = latest, unfixable
  upstream); the Prisma 7.x stable line still ends at 7.10.1 (carrying the
  fixed `@prisma/config@7.10.1 → deepmerge-ts@8.0.2`), the `latest`
  dist-tag still on the Prisma 8 RC (8.0.0-rc.23) — the S56 judgment call
  re-affirmed: the major upgrade stays the dedicated-session candidate
  (owner decision). Scandihaven unchanged (`d4789c3`, via `git ls-remote`).
- **The SSH infrastructure prepared while the suite ran**: paramiko 5.0.0
  installed into the venv python (3.12.15), the Appendix A shim deployed at
  `/home/z/my-project/bin/ssh` (outside the repo), the operator key
  materialized (0600) + fingerprint-verified (ed25519, SHA256
  `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` — the S59/S60-documented
  key identity), the wrapper dry-run GREEN with the explicit --remote
  `git@github.com:nordeim/omni-study.git` (remote main @ 44b9528 == local
  HEAD).
- **The confirmation**: `bun scripts/standing-suite.mjs` launched detached
  on the daemon (the S32 recipe — the interactive sessions closed first
  per the OOM lesson) — **run 1 read 34/35**: the ai-a11y stage (31/33)
  exited 1 on a Node.js fatal-error footer — the transient heap-OOM class
  (AGENTS.md's documented ~4 GB container ceiling; the crash struck AFTER
  the heaviest stages, the 8 volume sweeps + the cwv pair). Investigated
  per the Mode-B discipline: the ai-a11y audit re-run STANDALONE read
  exit 0 with `findings: []` (twice) — the audit itself GREEN in
  isolation, the suite failure the transient-infra class, not a code
  finding. The resolution: stray processes cleared, the dev daemon
  restarted cleanly (health 200, 2932 MB available), the FULL suite
  re-launched (run 2, 22:35 UTC, ~70 min wall) — **GREEN 35/35, ZERO
  total findings** (the S31 preflight, the 33 standing audits, the
  theme-restore closing guard light/violet), with ZERO code changes
  between the runs. The 35-row envelope with the session context header
  (the run-1 incident recorded in the `suiteRuns` context field) saved
  as `docs/screenshots/s61-standing-suite-evidence.json` (summary "35/35
  green", green: true, failed: [], aborted: false — all 35 rows
  `"findings": 0`).
- **The evidence captures**: 5 dev-server screenshots (a fresh session +
  re-login per the S53–S60 lesson): `s61-clone-desktop-expanded-1280.png`
  (aside 260 / ml 260 — gated on the CTA verified in-frame at
  x1101/y32/147×36 + the h1 greeting read, the S59 capture-lesson
  doctrine applied), `s61-clone-desktop-collapsed-1280.png` (aside 80 /
  ml 80 / svgX 33), `s61-clone-mobile-drawer-icononly-390.png` (the
  shared collapsed state — the 288px panel, 44px icon-only links,
  verified in-frame), `s61-clone-mobile-drawer-labeled-390.png` (the
  default — after the preference restore + reload, 48px labeled links),
  and `s61-clone-mobile-notes-390.png` (navigated through the drawer,
  the auto-close verified in-frame). Plus the 2 reference captures
  (227,334 / 71,833 bytes — saved earlier in the session).
- **The capture-delta classification**: the S61 capture set vs the S60
  counterparts reads 0/−747/−44/−37/−367 bytes — the collapsed capture
  **byte-identical** (216,857 = 216,857, the strongest structural
  signal); the expanded delta (−747) classified per the S59/S60 evidence
  discipline (pixel-diff localization + y-band histogram): **751 px
  (0.073%) fully localized at the sidebar footer's `sf-clock-chip`**
  (x 30-103, y 678-695 — the live clock digits, the exact element the
  S60 DOM probe identified at that position), with **the ENTIRE
  mid-content band (y 80-639) reading ZERO differing pixels** and the
  greeting row also zero (both sessions in the same evening bucket) —
  the deterministic proof the structure is byte-stable; NOT the
  mid-settle class (which reads diffuse). The drawer/notes deltas
  (−44/−37/−367) sit within the clock/data class (the app-bar clock at
  390, the note timestamps).
- **The docs**: this plan + session_168 (narrative) + session_169 (Chinese
  summary) + the README session-61 row + the worklog entry. The count
  anchors (1133/834/299) untouched — zero code changes.
