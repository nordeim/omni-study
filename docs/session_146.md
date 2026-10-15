# Session 146 — S55 narrative: the date-fragile calendar pins + the drawer-panel measurement race

The S55 session (2026-10-15/16) — the standing arrival audit that, for the
first time in the project's history, ran the full playwright e2e gate on a
**UTC 15th** — plus the two test-suite remediations that arrival surfaced.
Zero app-code findings; two e2e-layer defects fixed test-code-only.

## The arrival — the fresh-clone rebuild

The workspace had been RESET (no local checkout). The S52/S53 fresh-clone
recipe: clone at `be7ccc9`, `bun install` (489 packages, 5.8 s), `.env`
from `.env.example` with `DATABASE_URL="file:../db/custom.db"` +
`AUTH_SECRET=""`, `db:push` + `db:seed` (the demo user + sample data),
and the documented `bunx playwright install chromium` step — the cache
held chromium-1200 from an older Playwright while 1.63 pins 1243, so the
first e2e attempt failed 276/299 on the missing headless-shell executable
until the install ran (an environment step, not a repo defect).

The five core docs re-read (AGENTS: the commands, the DATABASE_URL
contract, the 13 Tailwind v4 traps, the testing quirks; CLAUDE: the
identity + the six-phase workflow; README: the session table through
session-54; PAD: the ADRs + the 49-file/1133-test distribution; SKILL:
the counts + the parity protocol), then the S54 baseline docs
(session_142/143/144/145, the S54 plan with its execution log, the
worklog tail). The scandihaven patterns reference reviewed in parallel
(AGENTS/CLAUDE/PAD/SKILL + its skills catalog): the mobile-nav testing
discipline, the Tailwind v4 literal-token contract, the scoped-assertion
E2E doctrine — all already embodied here; no architecture change
warranted.

## The baseline gates — F1 found

lint ✓ tsc ✓ **834 unit ✓** (20 files, 3.38 s) build ✓ — then the
cold-`db/e2e.db` e2e: **297/299**, the same two specs failing in three
consecutive full runs:

- `dark-mode.spec.ts:171` — "calendar today cell (unselected) uses the
  dark accent tint" — 45.3 s timeout
- `parity-session8.spec.ts:206` — "selected cell = accent fill; today
  (unselected) = 100-level tint; hover stripped" — 45.2 s timeout

**The root cause (from the error-context page snapshot):** the calendar
grid showed `button "Thursday, October 15, 2026 (Today)" [active]
[pressed]` — the sandbox clock read 2026-10-15 UTC for the whole session.
Both specs expose the today-cell tint by clicking a hardcoded "other"
day, **"15"** — and on the 15th of a month that click lands on the
already-selected TODAY: the selection does not move, the today cell
keeps the violet-500 selected fill, and the `waitForFunction` for the
tint runs out the 45 s timeout. Deterministic on any UTC 15th.

Why 54 sessions never saw it: the full playwright gate had never run on
a UTC 15th before. S54's baseline e2e ran Oct 14 (hour ~23 UTC — that
session's own "Good evening" observation); the post-midnight standing
suite is agent-browser-based (the 33 audit scripts), not the playwright
suite. The S45/S46 day-boundary rules cover seed aging, not this
selection-model interaction.

**Live validation before the fix:** on the clone's calendar (today =
the 15th, selected by default), clicking day **16** moved the selection
and the today tint `rgb(237, 233, 254)` appeared immediately — the fix
shape confirmed on the running app.

## The flake loop — F2 found

The s52 spec's S52-F pin ("collapsed → the drawer renders icon-only
links in the 288px panel") failed once in the full runs (1.9 s fast-fail)
and passed in the others. A re-run loop reproduced it 2 of ~10 times
with the exact reading:

```
Expected: < 2
Received: 6          // |panelW − 288| = 6 → panelW = 282
```

**The root cause:** the drawer panel carries `.sf-toast-in` — the 0.25 s
`sf-slide-in` entry animation whose `from` state is
`translateY(8px) scale(0.98)` (`globals.css:678`). The pin measures
`getBoundingClientRect().width` immediately after
`expect(drawer).toBeVisible()` — which passes during the animation — and
**bounding rects include transforms**: 288 × ~0.979 ≈ 282 px mid-flight,
breaching the <2 px tolerance. The standing `drawer-check-s14.mjs` script
is immune by construction: it measures `getComputedStyle(el).width` (the
CSS width — transform-independent). The animation itself is parity
behavior and stays.

## The fixes (TDD — both defects reproduced RED first)

- **F1** (`parity-session8.spec.ts` + `dark-mode.spec.ts`): the "other"
  day is now read from the grid's own `[data-today]` marker —
  `today === 15 ? 16 : 15` — never clicking today, and independent of
  the runner's clock (the S28 designed-channel doctrine: the test reads
  the app's own state). The assertions are unchanged.
- **F2** (`s52-sidebar-collapse.spec.ts`): the width check is now
  `expect.poll(...)` on `|boundingWidth − 288|` — polling the FINAL
  width until the entry animation settles (the S8 settled-value
  doctrine). The <2 px tolerance semantics preserved.

GREEN: the two calendar specs pass on the 15th (1.1 s each — the 45 s
timeouts gone); the s52 spec passes 6/6 in the re-run loop.

## The gates restored

lint ✓ tsc ✓ **834 unit ✓** build ✓ (exit 0 — the one Turbopack warning
is the documented S22 boot-guard `process.exit(1)`, pre-existing) and
the full cold-db e2e: **299 passed (4.7 min)** — **1133 green**, the
count anchors intact (the fixes are test-code only; no pin count
change).

## The standing checks — all GREEN

The dev daemon (the S32 recipe, health 200) → the preflight GREEN → the
drawer-check GREEN. The live agent-browser 390×844 walkthrough GREEN:
login → scrollWidth 390 → sidebar hidden → burger visible → the drawer
20 links in the reference order → nav scrollable 1068 vs 755 → Notes via
the drawer → auto-close → the active link violet-600 `rgb(124, 58, 237)`
+ the trailing violet-500 dot `rgb(139, 92, 246)` → Escape-close. The
Tailwind v4 trap surfaces verified live clean — **the mobile navigation
menu is working as expected; NO Tailwind v4 bug** (trap 4: the nav UL
`flex flex-col gap-1` — display flex / gap 4px / column / zero margin
children; trap 9: the backdrop `blur(4px)`; trap 7: `bg-black/20`
serializing `oklab(0 0 0 / 0.2)`).

The desktop sidebar states: expanded aside 260 / main ml 260 / width
1020; collapsed aside 80 / main ml 80 / width 1200 / 20 icon-only links
svgX 33 / footer 0 children / the glyph `rotate: 180deg` (v4's rotate
property ≡ the reference's rotate-180 matrix) / `sf-sidebar-collapsed`
persisted. The mobile drawer sharing the state: the 288 px panel, 20
icon-only links svgX 32, nav scrollable 988 vs 755. The preference
restored to expanded before moving on.

## The reference re-sweep — UNCHANGED

The operator account, 1280×800 then 390×844: the four standing anchors
reproduced (title "AcademiaFlow (Copy)"; greeting "Good evening,
sepnetflix2023 👋" — the hour-22 UTC bucket; the 20-view href order
byte-identical; the five Settings tabs). BOTH sidebar states re-measured
per the post-S52 protocol: expanded 260/260/1020; collapsed 80/80/1200
with the chevron-only header, the empty footer, the icon-only
left-aligned links svgX 33, the `matrix(-1, 0, 0, -1, 0, 0)` glyph,
`sidebarOpen "false"` persisted; the mobile drawer SHARING the state
(the 288 px panel, 20 icon-only links svgX 32, nav 912 vs 744, the
reference's own `blur(4px)` backdrop). The stored preference restored
to `"true"` before session close. **UNCHANGED since S52/S53/S54.**

## The code audit (Mode C) — zero app-code findings

Both post-S54 commits verified doc-only (`git show --stat`: `d99755d` =
session_144 + the worklog note; `be7ccc9` = session_145). The static
scan clean (zero TODO/FIXME/`: any`/`console.log`/`eval` — the single
"eval" hit is a prose comment in calculator.ts; the one
`dangerouslySetInnerHTML` = the documented THEME_BOOT_SCRIPT; the SDK
server-only in the 4 AI routes). The standing dep-audit script exit 0
(2 advisories documented as non-production, 0 runtime-reachable).

The dep registry re-check (the standing open item): `braces` latest
published IS the lockfile's own 3.0.3 (the fix release still does not
exist); `deepmerge-ts` 8.0.2 exists but requires the Prisma major
(latest 8.0.0-rc.23 — still RC-only, not production-safe);
eslint-config-next latest 16.4.2. Both advisories remain unfixable
upstream — the upstream-wait position re-confirmed with fresh registry
evidence.

## The confirmation

`bun scripts/standing-suite.mjs` launched detached on the daemon —
the verdict recorded in the remediation plan's execution log and the
evidence envelope (`docs/screenshots/s55-standing-suite-evidence.json`).

## The judgment call — test-code-only

The audit found the app code sound on every axis; both defects live in
the e2e layer. Fixing the pins hardens the 1133-gate itself — the
executable specification the house doctrine leans on — without touching
a verified-green production codebase. F1 would have failed ANY future
session running the gate on a UTC 15th; F2 made the S52 pin flaky.
The smallest safe diff is the two-line-family test fix; the count
anchors (1133/834/299) are untouched by construction.
