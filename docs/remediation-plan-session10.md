# Session 10 Remediation Plan — Dark-Mode Consistency (the Tailwind v4 `@theme inline` trap)

> Audit: 2026-10-08, dual-app (live reference `omni-study1.base44.app` logged in as
> `sepnetflix2023@outlook.com` vs local clone dev server, both at 1280×800 desktop +
> 390×844 mobile; scripted dark-mode contrast sweep `scripts/dark-sweep.mjs` over all
> 20 views + per-surface DOM probes).
>
> Mobile drawer (the standing priority) re-verified FIRST and **GREEN**: 288px white
> `shadow-2xl` panel (dark: `slate-950`), 20 links (icon set identical —
> `file-question` vs `file-question-mark` is the same glyph under a newer lucide),
> no footer, backdrop `rgba(0,0,0,0.2)` + `blur(4px)` on the reference ≡ the clone's
> `oklab(0 0 0 / 0.2)` serialization + `blur(4px)` (v4 trap 7). One functional
> delta: the clone's drawer closes on **Escape**; the reference's does not (open
> via hamburger, closed only by backdrop tap — synthetic-click quirk re-confirmed).
> Escape-to-close is a standard Radix pattern and stays (superset).
>
> Session focus chosen from the session-10 suggestion in `docs/session_11.md`:
> **dark-mode consistency** (never audited — every prior session audited light
> mode), keyboard a11y, and responsive edge cases.

## The governing discovery — the reference's Dark mode is a platform no-op

Live-measured on the reference after Settings → Appearance → Dark → Save Preferences:

- `<html class="dark">` IS applied, and `body` gets `rgb(10, 10, 10)` +
  `rgb(250, 250, 250)` (neutral-950/neutral-50 — the platform shell).
- **The app's own markup never re-themes**: the canvas root still carries the light
  gradient `linear-gradient(to right bottom, rgb(248,250,252), rgb(255,255,255),
  rgba(245,243,255,0.3))`, the sidebar stays `rgba(255,255,255,0.8)` glass, every
  card stays `rgb(255,255,255)` / `rgb(241,245,259)` borders, h1 stays slate-800.
  The dark body is fully covered by the light canvas — the visible UI is
  unchanged (VLM read the reference's "dark" dashboard as "properly themed light
  mode"; DOM probes confirm: zero dark variants in the reference's rendered app
  markup). Same for the System option.

**Decision (the established platform-bug precedent):** where the reference ships a
broken platform behavior, the clone implements the *intended* behavior as the
documented superset (same call as the reference's yellow gradient-button text, its
broken note title, its non-persisting AI generation). The clone's full dark mode
stays and is now audited against **internal consistency** — the reference cannot
be the dark measuring stick. Dark-mode design conventions follow the codebase's
existing `.dark` blocks: low-alpha dark-tint gradients over the zinc-950 canvas
(the `.dark .sf-calc-display` / `.dark .sf-canvas` precedent) and the
`*-dark` accent tokens for text.

## Root cause (the biggest single finding of this audit)

### S10-1 · The shadcn base tokens are LITERAL values inside `@theme inline` — generated utilities can never re-theme

`src/app/globals.css` defines `--color-card: hsl(0 0% 100%)`, `--color-muted`,
`--color-popover`, `--color-input`, `--color-accent`, `--color-secondary`,
`--color-border`, `--color-background/foreground` etc. as **literal** values inside
`@theme inline`. With the `inline` option, Tailwind v4 compiles utilities by
substituting the theme value *at build time*: `bg-card` becomes
`background-color: hsl(0 0% 100%)` — **no `var()` indirection**. The `.dark { … }`
block that re-declares `--color-card: hsl(240 10% 5.92%)` therefore overrides the
*custom property* (visible to `getComputedStyle` — it reads back `#0e0e11`) but can
never reach the *already-inlined utility values*. Every utility-built surface stays
light in dark mode:

- Custom CSS that references the vars directly DOES re-theme (`.sf-card` →
  `rgb(15,23,42)`, `body` background/color, the `* { border-color }` reset) — which
  is exactly why the app *looks* mostly dark and the bug stayed invisible for nine
  sessions: dark cards + dark canvas + dark text around **light-mode orphan islands**.
- The correct pattern (shadcn's own Tailwind v4 setup) is raw-triplet vars in
  `:root`/`.dark` referenced through `hsl(var(--x))` inside `@theme inline` — the
  utilities then inline `hsl(var(--card))`, which resolves at **runtime**. The
  repo already uses this exact shape for the accent tokens
  (`--color-sf-primary: rgb(var(--sf-primary))`) — the base palette simply never
  got the same indirection.

**Measured symptoms (dark mode, dev server):**

| Surface | Measured | Expected (dark) |
|---|---|---|
| Tasks "Active" filter button (`bg-card`) | `rgb(255,255,255)` bg + inherited `rgb(250,250,250)` text → **contrast 1.04, invisible** | `rgb(14,14,17)` |
| MyDay "More Options", Timetable "Grid Builder", Files "New Folder", MathSolver "Upload Image"/"Clear", Calculator "History", Settings "Save Preferences" (all `variant="outline"`) | same white-on-white (1.04) | dark |
| Dialog content (`bg-card`) | `rgb(255,255,255)` + near-white title text — **unreadable dialogs** | `rgb(14,14,17)` |
| DropdownMenu / Select content (`bg-popover`) | white menus (dark text via inlined `--popover-foreground` — readable but light-chrome) | `rgb(9,9,11)` |
| Calculator tabs list (`bg-muted`) + tab triggers | `rgb(244,244,245)` flashbulb | `hsl(240 3.7% 15.9%)` |
| PracticeTests status badges (`bg-muted`) | `rgb(244,244,245)` flashbulb | dark |
| FocusTimer Reset/Skip icon buttons (`outline`) | white flashbulbs | dark |

Affected token utilities across 22 files (`rg 'bg-card|bg-muted|bg-secondary|bg-accent|bg-popover|border-input|…'`):
`ui/{button,dialog,dropdown-menu,select,tabs,toast,badge,input,primitives,card}.tsx` +
view-level usages in events/tasks/myday/flashcards/calculator/timetable/studygroups/
settings/practicetests/notes/gradetracker/exams/assignments.

**Fix (globals.css only — one root fix repairs every symptom):**

1. Add raw triplet vars to `:root` (light) mirroring today's literal values:
   `--background/foreground/card/card-foreground/popover/popover-foreground/
   primary/primary-foreground/secondary/secondary-foreground/muted/
   muted-foreground/accent/accent-foreground/destructive/destructive-foreground/
   border/input/ring`.
2. Rewrite the existing `.dark` block to set the SAME raw vars (values unchanged
   from today's `--color-*` dark declarations).
3. Rewrite the `@theme inline` base palette as `hsl(var(--background))` etc.
4. Shadow pin: today's `.dark { --shadow-sm: … 0.3 }` is equally dead (utilities
   inline the light geometry). Route it the same way: `:root/.dark
   --sf-shadow-sm` raw vars + `@theme inline { --shadow-sm: var(--sf-shadow-sm) }`
   (light computed value byte-identical: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` — the
   e2e v3-shadow pin must stay green). If Tailwind rejects a var() reference in
   the shadow namespace, fall back to keeping the literal pin and dropping the
   cosmetic dark shadow line (documented).
5. `--radius-sm` and the pinned hex palette stay untouched (theme-independent).

**Light-mode risk: none by construction** — `hsl(var(--card))` with
`--card: 0 0% 100%` computes to the identical `rgb(255,255,255)`; every existing
light-mode e2e pin (dialog geometry/chrome, outline palette, gray form ramp,
calculator display, tabs, badges) is the regression net.

## View-level gradient/tint leftovers (inline styles cannot carry `dark:` variants)

Six families, all the same shape: an inline-style gradient/tint authored for the
light-mode reference parity work (S3–S9) that renders identically in dark mode.
Fix pattern per the `.dark .sf-calc-display` precedent: move to a globals.css
class with a `.dark` override (sRGB-exact light values preserved verbatim — the
S3/S5/S9 pins keep passing).

### S10-2 · Dashboard overdue banner (S9-A surface)

`dashboard-view.tsx` line ~178: inline `linear-gradient(to right, #fef2f2, #fff7ed)`.
The banner already carries `dark:` variants for border/icon-block/text — only the
gradient is dead. Fix: `.sf-overdue-banner` class; `.dark` override
`rgb(127 29 29 / 0.2) → rgb(124 45 18 / 0.14)` (red-800/orange-900 washes over the
zinc-950 canvas; the existing red-300/400 dark text then reads correctly, including
the "View All" ghost whose `dark:text-slate-200` was measured contrast 1.13 on the
light gradient).

### S10-3 · MyDay "Today's Progress" amber card (S6-C surface)

`myday-view.tsx` line ~142: inline `linear-gradient(to right, #fffbeb, #fff7ed)`
(amber-50 → orange-50) with `dark:text-amber-400` title measured at contrast 1.61
on the light gradient. Fix: `.sf-amber-card` class; `.dark` override
`rgb(120 53 15 / 0.22) → rgb(124 45 18 / 0.16)` (amber-800/orange-900 washes).
Border + inner text already carry dark variants (verify while implementing).

### S10-4 · Inline accent-tint surfaces: Timetable today-header + mobile chips + Calendar today-cell

Three surfaces share the shape `style={{ backgroundColor: "rgb(var(--sf-primary-softest))" }}`
(or `-empty-from`), all light 50/100-level tints with no dark counterpart:

- `timetable-view.tsx` ~319: the grid's today HEADER cell (S8-E surface) — measured
  `rgb(245,243,255)` flashbulb + `text-slate-300` (dark variant of the day name)
  at contrast 1.35; the bold date under it is `text-sf-primary-strong` with NO dark
  variant (violet-500 on the light tint).
- `timetable-view.tsx` ~252: the mobile accordion's today date chips (same inline tint).
- `calendar-view.tsx` ~250: the TODAY-unselected cell tint
  `rgb(var(--sf-primary-empty-from))` — measured `rgb(237,233,254)` flashbulb on the
  dark calendar card (masked in the sweep only because today is also the *selected*
  day by default; probed by selecting day 15 first). Its text already has
  `dark:text-sf-primary-strong-dark`.

Fix: `.sf-today-tint` class = `rgb(var(--sf-primary-softest))` (light, unchanged) /
`.dark` = `rgb(var(--sf-primary-soft-dark) / 0.3)`; calendar cell keeps its
`-empty-from` value in light via the same class family (or a sibling class) with
the identical dark treatment; add `dark:text-sf-primary-strong-dark` to the
timetable today date.

### S10-5 · Sidebar clock chip (S3-B/S3-C surface)

`sidebar.tsx` `SidebarClock`: inline
`linear-gradient(to bottom right, rgb(var(--sf-primary-softest)), rgb(var(--sf-primary-softest-adjacent)))`
+ inline `--sf-primary-deep`/`--sf-primary-strong` text colors. In dark the chip
stays a light violet-50→indigo-50 island (readable but a flashbulb; deep/strong
violets would sink into a dark chip). Fix: `.sf-clock-chip` class with the light
gradient verbatim (S3 pin: computed stops `rgb(245, 243, 255)`/`rgb(238, 242, 255)`)
+ `.dark` gradient `rgb(var(--sf-primary-soft-dark) / 0.35) → rgb(var(--sf-primary-soft-dark) / 0.12)`
(the `.dark .sf-calc-display` stops — the two surfaces are design siblings) and
`.dark` text color `rgb(var(--sf-primary-strong-dark))` (violet-300, measured
focus-ring parity). Time text stays `--sf-primary-deep` in light (pinned
`rgb(109,40,217)` via the S3 e2e).

### S10-6 · Settings selected theme-mode buttons (S5-F surface)

`settings-view.tsx` ~162: inline `borderColor: --sf-primary` +
`backgroundColor: rgb(var(--sf-primary-softest))` on the selected Light/Dark/System
card — measured `rgb(245,243,255)` + `dark:text-slate-100` label at contrast 1.0.
Fix: `.sf-selected-tint` class (light verbatim) + `.dark` background
`rgb(var(--sf-primary-soft-dark) / 0.3)`; border stays the accent in both modes.
Icon inherits currentColor (slate-100 in dark) — correct once the bg is dark.

### S10-7 · Analytics SVG charts hardcode light-mode colors

`analytics-view.tsx` (S9-K `AreaChart`, the S7 donut, the grade-trend chart):
gridlines `stroke="#f1f5f9"`, axis labels `fill="#666"` (12px), Task Activity area
`fill="#e2e8f0"`, donut track `stroke="#f1f5f9"`, grade-trend axes
`stroke="#e2e8f0"`. On the dark `.sf-card` (rgb(15,23,42)) the light-filled area is
a bright block and the light gridlines glare. Fix: Tailwind SVG presentation
utilities with `dark:` variants (CSS `fill`/`stroke` properties override the SVG
attributes): gridlines → `dark:stroke-slate-800`, axis labels →
`dark:fill-slate-400`, Task Activity area → `dark:fill-slate-800`, donut/grade-trend
tracks → `dark:stroke-slate-800`. Slate-400/800 are pinned hexes. The Focus Time
violet line + gradient area and the colored donut sectors already read correctly
in dark (accent-driven). The hover-dot white ring stays (readable both modes).

## Verified non-gaps (do NOT "fix")

1. **The reference's Dark/System options** — platform no-op (measured; see the
   governing discovery). The clone's working dark mode is the superset.
2. **Escape closes the clone's drawer** but not the reference's — Radix-standard
   superset behavior, kept.
3. **Keyboard a11y** — audited login/dashboard/Tasks: every icon-only button
   carries `aria-label` (0 unlabeled across 46 probed); focus rings are visible
   accent outlines (`sf-focus` → `outline: 2px solid` violet; measured
   `solid 3px rgb(196,181,253)` on Tasks in dark). Dialogs/dialog titles come from
   Radix primitives (focus trap + labelled). The clone is the a11y superset —
   no changes.
4. **Responsive edge cases** — all 20 views probed at 390×844 (no horizontal
   overflow anywhere; the timetable's `min-w-[900px]` grid scrolls inside its
   `overflow-x-auto` by design), 820×1180 (two-pane views render their `md:flex`
   asides; no overflow), 1280×800. Mobile flashcards stack (S7 superset).
5. **Mobile drawer in dark** — `bg-white dark:bg-slate-950` panel (measured
   `rgb(2,6,23)`), light links, glass app bar via `.dark .glass` ✓.
6. **Login card in dark** — dark-aware (unpinned oklab serialization `lab(…)`
   acceptable: dark mode has no reference parity to match).
7. **Analytics stat-card icon blocks** — intentional `dark:*-950/60` oklch tints ✓.
8. **Events terminal panel** — `slate-900` by design in BOTH themes (S5 pin).
9. **`bg-white` view chrome** — every `bg-white` in views is paired with
   `dark:bg-slate-900` (sweep-verified; the flashbulb findings were all
   token-utility or inline-style surfaces).
10. **GradeTracker trend chart** — accent-var strokes + slate-400 labels (readable
    both modes; only its axis lines get the S10-7 dark stroke).

## Codebase alignment (validated file-by-file before execution)

| File | Touches |
|---|---|
| `src/app/globals.css` | S10-1 (raw vars + `.dark` rename + `@theme inline` indirection + shadow wiring), new classes `.sf-overdue-banner`, `.sf-amber-card`, `.sf-today-tint`, `.sf-clock-chip` (+ text rules), `.sf-selected-tint` with `.dark` overrides |
| `src/components/views/dashboard-view.tsx` | S10-2 (inline gradient → class) |
| `src/components/views/myday-view.tsx` | S10-3 (inline gradient → class) |
| `src/components/views/timetable-view.tsx` | S10-4 (2 inline tints → class; today-date dark text) |
| `src/components/views/calendar-view.tsx` | S10-4 (today-cell inline tint → class) |
| `src/components/layout/sidebar.tsx` | S10-5 (inline gradient/text colors → class) |
| `src/components/views/settings-view.tsx` | S10-6 (inline selected tint → class) |
| `src/components/views/analytics-view.tsx` | S10-7 (SVG dark utilities) |
| `tests/e2e/dark-mode.spec.ts` | NEW — the session-10 pin family (below) |
| `scripts/dark-sweep.mjs` | NEW — the audit tool (committed per the S9 audit-tooling precedent) |

No seed, schema, or API changes. No `prisma/`, `src/lib/`, or route changes.

## TDD execution order

1. **RED** — write `tests/e2e/dark-mode.spec.ts` first. Strategy: the spec PATCHes
   `/api/settings/preferences` `{ themeMode: "dark" }` (shared storageState; the
   config is `workers: 1` + `fullyParallel: false` so the mutation is safe),
   reloads, asserts `html.dark`, then pins every family; at the end it PATCHes
   back to `light` AND awaits the response (the S4 accent-restore precedent).
   Expected RED state on the current build: the token-utility pins fail
   (white bgs), the class pins fail (light gradients), ~15+ failures.
2. **GREEN S10-1** — the globals.css indirection rework; `bun run build`; re-run
   the new spec (token pins flip green) + the full suite (light-mode regression
   net — dialog/outline/tabs/calculator/badge pins must stay green untouched).
3. **GREEN S10-2..S10-7** — class moves + SVG dark utilities, one family at a
   time, re-running the new spec's family block between checkpoints.
4. **Re-sweep** — `node scripts/dark-sweep.mjs` must report every view CLEAN
   (0 flashbulbs, 0 unreadable) in dark; re-verify the light sweep by eye on the
   dashboard (cards white, banner gradient intact).
5. **Full gates** — `lint → typecheck → test → build → test:e2e` (the 184 prior
   specs are the light-mode byte-parity net; the new spec takes the suite to
   184+N).
6. **Mobile drawer dark re-probe** (standing priority holds in dark too).

## Risks & guards

- **The `hsl(var(--x))` indirection changes CSS emission** — guarded by the entire
  light-mode e2e family (computed values are mathematically identical).
- **The shadow var() wiring is the one piece Tailwind might reject** — isolated
  first, with the documented fallback (keep the literal pin, drop the cosmetic
  `.dark` shadow line).
- **Dialog/dropdown dark chrome has no reference to match** — the dark values come
  from the repo's own existing `.dark` token declarations (the values the author
  already chose); this session only makes them *reachable*.
- **Playwright synthetic-click quirk**: agent-browser could not open the Tasks
  filter DropdownMenu (re-hit of the S7 Radix finding) — the e2e spec drives it
  with real trusted Playwright clicks (the S9 tasks.spec already does).

---

## Execution log (post-execution addendum)

Executed TDD-style on 2026-10-08, exactly per the order above.

**RED.** `tests/e2e/dark-mode.spec.ts` written first — 10 pins across 6
describes (token utilities ×1, banner/amber/clock ×3, timetable/calendar ×2,
settings/analytics ×2, dark mobile drawer ×1, light regression guard ×1).
Mode strategy per the plan: `page.request.patch("/api/settings/preferences")`
+ `waitForFunction(html.dark)` + an `afterEach` light restore (awaited).
Observed RED on the pre-remediation build: **9 failed / 1 passed** (the light
regression guard — correctly green before AND after). Failure modes exactly
the designed ones: filter button `rgb(255,255,255)` vs `rgb(14,14,17)`;
banner gradient `rgb(254,242,242)…` vs the dark washes.

**GREEN S10-1 (the root fix).** globals.css: `:root` + `.dark` raw triplets
(`--background/foreground/card/card-foreground/popover/popover-foreground/
primary/primary-foreground/secondary/secondary-foreground/muted/
muted-foreground/accent/accent-foreground/destructive/
destructive-foreground/border/input/ring`), `@theme inline` rewired to
`hsl(var(--x))`, shadows routed through `:root/.dark --sf-shadow-sm/md/lg`
with `@theme inline { --shadow-*: var(--sf-shadow-*) }`. **Compiled-output
verification**: `.bg-card{background-color:hsl(var(--card))}` and
`.shadow-sm{--tw-shadow:var(--sf-shadow-sm);…}` — the var() references
survive the build (the one open risk in the plan, closed). 10/11 spec pins
flipped green; the 11th failure was pin-side (`dark:text-red-300` serialized
as `lab()` — trap 10 family) → `--color-red-300: #fca5a5` joined the pin
block → 11/11 after rebuild.

**GREEN S10-2..S10-7.** The six class moves (`sf-overdue-banner`,
`sf-amber-card`, `sf-today-tint` + `sf-today-cell`, `sf-clock-chip` +
`.sf-clock-time/.sf-clock-date`, `sf-selected-tint`) + the timetable today
date `dark:text-sf-primary-strong-dark` + the analytics SVG dark utilities
(`dark:stroke-slate-800` gridlines/donut/grade-trend axes,
`dark:fill-slate-400` axis labels, `dark:fill-slate-800` Task Activity area).
All inline styles removed from the views; the light values moved verbatim
into the classes.

**Verification.**
- `node scripts/dark-sweep.mjs` re-run: **ALL 20 VIEWS CLEAN** in dark
  (0 flashbulbs, 0 unreadable — the pre-fix sweep flagged 10 views).
- Dev-server probes: banner `rgba(127,29,29,0.2)→rgba(124,45,18,0.14)`,
  clock chip `rgba(76,29,149,0.35)→rgba(76,29,149,0.12)` + violet-300 time
  text; VLM spot-checks on the refreshed captures: dark dashboard "consistently
  dark, no leftovers", light dashboard regression PASS (banner + white cards
  + violet accents intact).
- Full gates: **lint ✓ · tsc ✓ · 106 unit ✓ (8 files) · build ✓ ·
  194 e2e ✓ (2.8 min, clean `db/e2e.db` + auth state) = 300 tests green.**
  The 183 prior chromium specs stayed green UNTOUCHED — the light-mode
  byte-parity guarantee held (the plan's core risk control).

**Stale-pin migrations:** none needed — every prior pin passed as-written
(the light values are byte-identical by construction; the drawer-pin locator
in the NEW spec was fixed during RED when it matched the canvas wrapper
instead of the panel).

**Discoveries during execution:**
1. The **drawer pin locator lesson**: `.locator("div").filter({ has: nav }).first()`
   matches the OUTERMOST wrapper (the canvas), not the drawer panel —
   `getByRole("navigation").locator("xpath=ancestor::div[1]")` targets the
   panel (nav's direct parent). The pre-fix run's `rgb(9,9,11)` canvas bg
   exposed it.
2. **`dark:text-red-300` was unpinned** (lab() serialization) — red-300
   `#fca5a5` joined the pin block (trap 10 family, 12th pin extension).
3. The Playwright reporter counts the setup project's 1 test in the total:
   "194 e2e" = 193 chromium + 1 setup (the docs' e2e counts follow the
   reporter).

**Captures.** All 30 refreshed via `node scripts/capture-studyflow.mjs`
(24 light + the NEW 6 dark captures: dark-{Dashboard,Tasks,Calendar,Analytics,
Settings} + dark-mobile-navigation-drawer; the script now force-restores
light at start and end so the dev user's resting state is light).

**Deliverables:** globals.css (token indirection + 6 new class families +
red-300 pin), dashboard/myday/timetable/calendar/sidebar/settings/analytics
view edits, `tests/e2e/dark-mode.spec.ts` (10 pins), `scripts/dark-sweep.mjs`
(audit tooling, committed per the S9 precedent), capture script dark phase,
30 refreshed screenshots, aligned root docs (README/AGENTS/CLAUDE/PAD/SKILL
AP-43..46 + ADR-008), this execution log, the session_12.md narrative, and
the worklog entry.
