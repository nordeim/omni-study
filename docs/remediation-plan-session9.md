# Session 9 Remediation Plan — Data-State Surfaces, Chart Axes & Icon-Level Parity

> Audit: 2026-10-08, dual-app (live reference `omni-study1.base44.app` logged in as
> `sepnetflix2023@outlook.com` vs local clone dev server, both at 1280×800 desktop +
> 390×844 mobile; paired screenshots + per-view DOM probes in `research/s9-probe/`).
>
> Mobile drawer (the standing priority) re-verified FIRST and **GREEN**: 288px white
> `shadow-2xl` panel, 20 links (icon set identical — `file-question` vs
> `file-question-mark` is the same glyph under a newer lucide), no footer, backdrop
> `rgba(0,0,0,0.2)` + `blur(4px)` on the reference ≡ the clone's `oklab(0 0 0 / 0.2)`
> serialization + `blur(4px)` (v4 trap 7). Sidebar/tagline/collapse (S8-A), Events
> dark panel + cyan New Event + CW label (S5), stat cards, view-header icons, login
> card, timetable week grid (113 identical 60px cells) — all re-verified GREEN.
>
> Method note: VLM pairwise comparison (`scripts/vlm-compare-s9.mjs`) produced
> systematically SWAPPED image attributions (it labeled the reference's
> `sepnetflix2023` user as "clone" and vice versa). Every finding below was
> therefore re-verified with direct DOM computed-style probes on BOTH apps; VLM
> output was used only as a hypothesis generator. Data-driven differences
> (seeded vs reference account content) are excluded.

## Measured gap families

19 families. Verified against `src/` before planning (file refs below).

### S9-A · Dashboard overdue alert banner (missing feature)

Reference renders a conditional banner between the greeting header and the stats
grid when overdue items exist (live-measured with the reference's 1 overdue task):

- Container: `bg-gradient-to-r from-red-50 to-orange-50 border border-red-200
  rounded-2xl p-4` (computed gradient `rgb(254,242,242) → rgb(255,247,237)`,
  border `rgb(254,202,202)` = red-200, radius 16px).
- Inner `flex items-center gap-3`(+) with icon block `w-10 h-10 rounded-xl
  bg-red-100 flex items-center justify-center` + `circle-alert w-5 h-5 text-red-500`.
- Text col: `h3 font-semibold text-red-700` "You have {N} overdue item(s)" +
  `p text-sm text-red-600` "Don't forget to complete them!".
- CTA: right-aligned link to `/Tasks` rendering a ghost "View All" button
  (transparent bg).

Clone: nothing — the feature is absent. Fix: conditional banner in
`dashboard-view.tsx` (accent-agnostic red/orange family, pinned hexes);
seed ONE overdue task so the demo/e2e state exercises it.

### S9-B · MyDay empty-state rework (amber, greeting-titled)

Reference (live-measured, 0 today-tasks): bare `text-center py-12` wrapper (NO
card) with `w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100
to-orange-100 flex items-center justify-center` block + `sun w-10 h-10
text-amber-500`, `h3 text-xl font-semibold text-slate-700 mb-2` —
"**Good morning!**" (time-aware greeting, capitalized) — + `p text-slate-500
mb-6` "What would you like to accomplish today?" + CTA "Add Your First Task"
(`linear-gradient(to right, rgb(245,158,11), rgb(249,115,22))` = amber-500 →
orange-500, h-9, rounded-md; the reference's yellow button text is the known
Base44 platform bug — clone keeps white).

Clone: `sf-card` + the standard violet `EmptyState` ("No tasks yet"). Fix:
view-local amber empty state; title uses the `greeting()` map from `router.ts`.

### S9-C · Tasks status filter chrome

Reference "Active" control: a plain outline **button** — white bg, `border-input`
(gray-200), `lucide-filter w-4 h-4` icon + "Active" text, NO chevron, no
combobox role (synthetic click opens nothing measurable). Clone: a Radix Select
combobox with chevron-down. Fix: replace the Select with an outline
DropdownMenu trigger (`filter` icon + current value) — chrome parity, keeps the
status-filter function as the superset.

### S9-D · Tasks "No lists yet" extra placeholder

Reference My Lists body (`.space-y-1`) is EMPTY when no lists exist. Clone
renders a "No lists yet" placeholder row. Fix: remove the placeholder text.

### S9-E · Calendar month grid is SUNDAY-first (layout shift)

Reference weekday header runs **Sun…Sat** and the October 2026 grid starts at
**27** (Sep 27, Sunday) with 35 cells (exactly 5 weeks). Clone: Mon…Sun header,
grid starts 28, 42 cells. Fix: `monthGrid()` in `src/lib/date.ts` becomes
Sunday-first (`first.getDay()`, weeks = `ceil((lead + daysInMonth) / 7)`),
weekday header order in `calendar-view.tsx`, and the day-of-week column mapping
for dots follows. Unit tests updated first (RED). Also: weekday header row gains
the reference's `mb-2` tail.

### S9-F · Calendar mode-switch chrome (icons + 32px tabs + white container)

Reference segmented control: container `flex items-center gap-2 bg-white
rounded-lg border border-slate-200 p-1` (42px tall); tabs `h-8 rounded-md px-3
text-xs` — "Calendar" (solid `bg-violet-500` + `grid3x3` icon) / "Timeline"
(ghost + `list` icon). Clone: 24px tabs (`py-1`), no icons, `capitalize` CSS with
lowercase raw text. Fix: rework the switch — icons + `h-8` tabs + bordered white
container; keep raw text capitalized ("Calendar"/"Timeline") and drop the
`capitalize` class.

### S9-G · Files breadcrumb home icon + grid-view glyph

Reference breadcrumb root: `house` icon + "All Files"
(`flex items-center gap-1 hover:text-violet-600 transition-colors
text-slate-800`). Clone: text-only. Reference view toggle: `grid3x3` + `list`;
clone renders `layout-grid` + `list` (different glyph). Fix: add `House` icon to
the breadcrumb root; swap `LayoutGrid` → `Grid3x3`.

### S9-H · Timetable "Grid Builder" extra icon

Reference "Grid Builder" outline button is TEXT-ONLY (no svg). Clone adds a
`grid3x3` icon. Fix: remove the icon.

### S9-I · Assignments default filter + row content

1. Reference status filter defaults to **"Active"** (combobox — kept as a real
   combobox here); clone defaults to "All".
2. Reference assignment rows render ONLY: 24px round checkbox, title + blue
   due pill, priority pill (flag), type pill (capitalize), gradient slider + %
   label, hover ellipsis. Clone ADDS a subject text span + a `line-clamp-2`
   description paragraph. Fix: default "Active"; drop the subject span +
   description paragraph from rows (fields remain in the model + edit dialog).

### S9-J · Exams "Tomorrow" urgency bucket

Reference: days===1 → label "**Tomorrow**", `bg-orange-100 text-orange-600`
(live-measured); days>=2 → "N days" amber (S6 measurement stands). Clone:
"1 day" amber for the same bucket. Fix: add the Tomorrow bucket with the orange
family.

### S9-K · Analytics 7-day charts need axes + gridlines (area charts)

Reference charts are recharts **area** charts (416×250): X-axis day labels
(Fri…Thu, `fill #666`, 12px), Y-axis ticks (0, 0.5, 1, 1.5, 2 — and 0h…4h for
focus), horizontal gridlines `stroke-dasharray 3 3`; Task Activity = single area
path filled `#e2e8f0` (slate-200); Focus Time = gradient-filled area
(`url(#focusGradient)`, stops #8b5cf6) + `#8b5cf6` line on top. Clone: HTML bar
charts with 10px labels below and no axes/gridlines. Fix: rebuild
`BarChart`→`AreaChart` SVG components with axes, gridlines, and the measured
fills; keep hover tooltips as the superset.

### S9-L · FocusTimer icon swaps

Reference stat-card icons: Pomodoros = `flame`, Today = `target`, Sessions =
`zap` (clone: brain/flame/timer). Long Break preset icon: `coffee` (clone:
`moon`). Fix: four icon swaps.

### S9-M · Settings tab icons

Reference tabs carry icons (28px tabs): Appearance `palette`, Profile `user`,
Subjects `book-open`, Holidays `calendar`, Notifications `bell`. Clone: all five
tabs are text-only. Fix: add the icons to the tab triggers.

### S9-N · Notes combobox leading icons

Reference filter comboboxes: "All Notebooks" trigger = `folder` icon + chevron;
"All Tags" = `tag` icon + chevron. Clone: chevron only. Fix: add the leading
icons (w-4 h-4, shrink-0, in the trigger before the value).

### S9-O · Flashcards deck-row hover menu

Reference deck row carries a hover-revealed `h-8 w-8` ghost **ellipsis** menu
button (`opacity-0 group-hover:opacity-100`; its Radix menu doesn't open under
synthetic clicks — contents unmeasurable). Clone: no per-deck menu. Fix: add a
hover-revealed ellipsis DropdownMenu with Edit deck / Deck color / Delete
actions (superset contents; chrome parity).

### S9-P · AI composer icon

Reference composer submit button: `wand-sparkles` (clone: `sparkles`). Fix:
swap the icon.

### S9-Q · MyDay quick-add extra submit button

Reference quick-add row: input (with inline plus) + "More Options" outline
button ONLY — Enter submits. Clone adds a gradient Plus submit button. Fix:
remove it.

### S9-R · Dashboard section empty states (slim inline)

Reference empty sections (live-measured on Today's Tasks): inside the flush
`divide-y` body, `<div class="p-8 text-center text-slate-500">` + leading
`w-12 h-12 mx-auto text-slate-300 mb-3` icon + `<p>` message. Clone renders the
80px-gradient `SimpleEmptyState`. Fix: slim `DashSectionEmpty` inline component
for the three dashboard sections (exams/assignments share the pattern with
graduation-cap/book-open icons).

### S9-S · Study Groups right-pane hint text

Reference: "Choose a study group from the sidebar **or create a new one**".
Clone: "…to see its members and meetings." Fix: align the wording.

## Codebase alignment (validated)

| family | file(s) |
|---|---|
| S9-A | `src/components/views/dashboard-view.tsx`, `prisma/seed.ts` (overdue demo task) |
| S9-B/Q | `src/components/views/myday-view.tsx` (empty state + quick-add row) |
| S9-C/D | `src/components/views/tasks-view.tsx` |
| S9-E/F | `src/lib/date.ts`, `tests/date.test.ts`, `src/components/views/calendar-view.tsx` |
| S9-G | `src/components/views/files-view.tsx` |
| S9-H | `src/components/views/timetable-view.tsx` |
| S9-I | `src/components/views/assignments-view.tsx` |
| S9-J | `src/components/views/exams-view.tsx` |
| S9-K | `src/components/views/analytics-view.tsx` |
| S9-L | `src/components/views/focustimer-view.tsx` |
| S9-M | `src/components/views/settings-view.tsx` |
| S9-N | `src/components/views/notes-view.tsx` |
| S9-O | `src/components/views/flashcards-view.tsx` |
| S9-P | `src/components/views/aiassistant-view.tsx` |
| S9-R | `src/components/views/dashboard-view.tsx` (+ `shared.tsx` if shared) |
| S9-S | `src/components/views/studygroups-view.tsx` |

## Execution order (TDD)

1. **RED unit**: `tests/date.test.ts` — monthGrid Sunday-first + 5-week October
   2026 (35 cells, first cell Sep 27).
2. **RED e2e**: `tests/e2e/parity-session9.spec.ts` — pins per family
   (banner presence + gradient stops, MyDay amber empty-state block, Tasks
   filter button icon, calendar Sun-first header + first-cell text, mode-switch
   icons + 32px tabs, Files house breadcrumb + grid3x3 toggle, Grid Builder
   text-only, assignments default "Active" + no description node, exam Tomorrow
   orange badge, analytics axis-label texts, focus stat icons, settings tab
   icons, notes combobox icons, deck-row ellipsis, composer wand-sparkles,
   quick-add two-child row, dashboard slim empty, groups hint text).
3. GREEN per family in the order above with `bun run test` / rebuilds between
   checkpoints; stale-pin sweep for pins my reworks invalidate (S6 dashboard
   rows, S7 analytics bar-chart assertions, S8-F tasks header pin).
4. Full gate: `lint → typecheck → test → build → test:e2e`; screenshots via
   `node scripts/capture-studyflow.mjs`; docs aligned (README/AGENTS/CLAUDE/PAD/
   SKILL + this plan's execution log).

## Non-gaps (audited, no action)

- **Avatar chrome** — identical 36px `from-violet-400 to-indigo-500` gradient
  circle on both apps (VLM "black avatar" was the swapped-image artifact; the
  reference's initial "s" comes from its `sepnetflix2023` account name).
- **Practice Tests / Grade Tracker / Study Groups data states** — the reference
  account has no practice tests/grades/groups (its creation flows are broken,
  re-confirmed); the clone's seeded, working data is the documented superset.
- **Dashboard stat cards** — labels/subs/icons match exactly (Today's Progress
  target / Pending square-check-big / Due Soon book-open / Focus Time flame);
  only VALUES differ by data.
- **Timetable grid** — 113 identical `h-[60px] border-b border-slate-50 px-3
  py-1` cells; the clone's extra buttons are class-card actions (superset).
- **Flashcards deck row chrome** — `bg-slate-50 border-2 border-transparent
  p-4 rounded-xl` + solid deck-color icon block on both; only deck colors
  differ by data. The VLM "blue gradient vs solid purple" was a swap artifact.
- **MyDay amber progress card** — renders on the clone with today-tasks; the
  reference hides it only because its account has 0 tasks today (state-driven).
- **Tasks aside** — list/star filter icons, My Lists split, counts all match.
- **View headers** — all 12 probed h1 icons identical (file-question naming =
  lucide version difference, same glyph).
- **Assignments priority pill casing** — reference raw "Medium" vs clone raw
  "high" + `capitalize` class renders identically.

---

## Execution log (post-plan addendum)

All fixes landed TDD-style: the unit expectation first (`tests/date.test.ts` —
`monthGrid` Sunday-first: October 2026 = 35 cells, first cell Sep 27, observed
RED), then the e2e parity pins in `tests/e2e/parity-session9.spec.ts` were
written from the reference measurements and observed RED on the pre-remediation
build (initial run: 24 failed / 2 passed), then the component changes landed
family by family with `bun run test` + rebuilds between checkpoints. The final
spec consolidates the pins to **25 tests** (15 describes — several
selector/geometry pins were merged during hardening).

**Fixes as landed:**

| ID | Change | Files |
|---|---|---|
| S9-A | Conditional overdue banner between greeting and stats: `from-red-50 to-orange-50 border-red-200 rounded-2xl p-4`, `w-10 h-10 bg-red-100` icon block + `circle-alert text-red-500`, `text-red-700` "You have N overdue item(s)" + `text-red-600` sub + ghost View All link to `/Tasks`; palette pins red-50/red-200/orange-50 in `globals.css` (the unpinned classes serialized as `lab()`); seeded the incomplete overdue task "Return library books" (medium, literature) | `dashboard-view.tsx`, `globals.css`, `prisma/seed.ts` |
| S9-B | MyDay empty state reworked: bare `text-center py-12` (no card) + `w-20 h-20 from-amber-100 to-orange-100` sun block (`sun w-10 h-10 text-amber-500`) + greeting-titled `text-xl font-semibold text-slate-700` h3 ("Good morning!" — the `greeting()` map) + `text-slate-500` sub + amber-500→orange-500 gradient CTA | `myday-view.tsx` |
| S9-C | Tasks status filter: Radix Select combobox → outline `h-9` button (`border-input`, leading `filter`/funnel icon, no chevron) opening a DropdownMenu (All/Active/Completed); function preserved as the superset | `tasks-view.tsx` |
| S9-D | "No lists yet" placeholder row removed — the My Lists `.space-y-1` body renders empty like the reference | `tasks-view.tsx` |
| S9-E | `monthGrid()` Sunday-first: `lead = first.getDay()`, dynamic weeks `ceil((lead + daysInMonth) / 7)` (Oct 2026 = 35 cells, starts Sep 27); `CALENDAR_WEEKDAYS` Sun…Sat constant drives the header; weekday header row gains `mb-2`; day-of-week column mapping for dots follows | `src/lib/date.ts`, `calendar-view.tsx`, `tests/date.test.ts` |
| S9-F | Mode switch rework: white `bg-white rounded-lg border border-slate-200 p-1` container, `h-8 rounded-md px-3 text-xs` tabs with `grid3x3` (Calendar, solid `bg-violet-500`) / `list` (Timeline) icons, capitalized raw text (no `capitalize` class) | `calendar-view.tsx` |
| S9-G | Files breadcrumb root: `House` icon + "All Files" (`hover:text-violet-600`); view toggle `LayoutGrid` → `Grid3x3` | `files-view.tsx` |
| S9-H | Timetable Grid Builder button: `grid3x3` icon removed (text-only like the reference) | `timetable-view.tsx` |
| S9-I | Assignments: status filter defaults "Active"; rows drop the subject span + `line-clamp-2` description paragraph (title + due/priority/type pills + slider + ellipsis only — fields stay on the model + edit dialog) | `assignments-view.tsx` |
| S9-J | Exams urgency: days===1 → "Tomorrow" in `bg-orange-100 text-orange-600` (orange-100/600 already pinned); days≥2 keeps the amber "N days"; seeded the 1-day-out "Vocabulary pop quiz" (literature, quiz, 30 min) | `exams-view.tsx`, `prisma/seed.ts` |
| S9-K | Analytics 7-day charts rebuilt as SVG `AreaChart` components: X-axis day labels (12px `#666`), Y-axis ticks (0/0.5/1/1.5/2; `0h…4h` focus), horizontal `stroke-dasharray="3 3"` gridlines; Task Activity = single area filled `#e2e8f0`; Focus Time = `#8b5cf6` line over `url(#focusGradient)` violet gradient area; hover tooltips kept as the superset | `analytics-view.tsx` |
| S9-L | FocusTimer stat icons: Pomodoros `flame`, Today `target`, Sessions `zap`; Long Break preset `coffee` | `focustimer-view.tsx` |
| S9-M | Settings tabs: leading icons on all five triggers (palette/user/book-open/calendar/bell) | `settings-view.tsx` |
| S9-N | Notes combobox triggers: leading `folder` (notebook) / `tag` (tags) icons, `w-4 h-4 shrink-0` | `notes-view.tsx` |
| S9-O | Flashcards deck rows: hover-revealed `h-8 w-8` ghost ellipsis DropdownMenu (Edit deck / Deck color swatches / Delete — superset contents, chrome parity) | `flashcards-view.tsx` |
| S9-P | AI composer submit icon: `sparkles` → `wand-sparkles` | `aiassistant-view.tsx` |
| S9-Q | MyDay quick-add: gradient Plus submit button removed — input (inline plus) + "More Options" outline button only, Enter submits | `myday-view.tsx` |
| S9-R | Dashboard section empty states: `DashSectionEmpty` inline component (`p-8 text-center` + `w-12 h-12 mx-auto text-slate-300 mb-3` icon + `text-slate-500` message) for Today's Tasks / Exams / Assignments — replacing the 80px-gradient `SimpleEmptyState` | `dashboard-view.tsx` |
| S9-S | Study Groups right-pane hint: "Choose a study group from the sidebar or create a new one" | `studygroups-view.tsx` |

**Stale-pin migrations (S5/S6/tasks specs):** the S5-G Calendar segmented-switch
pin now asserts the capitalized "Calendar" tab (the re-measured design); the
S6-C MyDay Suggestions pin scopes the Add button to the specific suggestion row
(the seeded overdue task adds a second one — strict-mode violation); the
tasks.spec golden path drives the new filter BUTTON + DropdownMenu (was
combobox/option) and the MyDay quick-add submits via Enter (S9-Q).

**Discoveries during execution:**

1. **VLM pairwise comparison systematically SWAPPED image attributions** —
   the model described the reference's `sepnetflix2023` account as "clone" and
   vice versa (avatar, data-state, flashcard findings were inverted). Every
   finding was re-verified with direct DOM computed-style probes on BOTH apps;
   VLM was demoted to a hypothesis generator (documented in AGENTS.md).
2. **`count()` does NOT auto-wait** — chart-pin locators counted right after
   `goto` raced the async data fetch and failed intermittently. Gate SVG/chart
   assertions on auto-waiting `expect(...).toBeVisible()`/`toHaveCount()`,
   never a bare `count()` snapshot. Same for the overdue banner (renders only
   after the tasks fetch resolves).
3. **A manually-started debug server on :3100 poisons the whole e2e suite** —
   it collides with the Playwright `webServer`, keeps serving the DELETED
   `db/e2e.db` inode (readonly-looking writes → POST /api/tasks 500 with a
   confusing "Sprisma" query error), and produces phantom failures. Kill every
   :3100 listener before `test:e2e`.
4. **A long-lived dev daemon accumulates stale Turbopack state** — after
   dozens of HMR edits the dev server entered a Fast Refresh rebuild loop:
   login inputs refused to fill (React never hydrated) and capture locators
   detached mid-run. A clean daemon restart fixed both.
5. **`Filter` renders as `lucide-funnel` in this lucide version** (re-hit from
   S8) — the Tasks filter-button pin accepts both class names.
6. **The unpinned red/orange banner palette serialized as `lab()`** (trap 10
   family) — red-50/red-200/orange-50 joined the pin block before the banner
   gradient/border pins could pass.
7. **Reseeding under a running dev server corrupts the browser session**
   (re-hit from S7): the new demo-user id invalidates the cookie — re-login
   after `db:seed` + dev restart.

**Final verification (all gates, freshly re-run for this addendum):**
lint ✓ · `tsc --noEmit` ✓ · **106 unit ✓** (8 files) · `next build` ✓ ·
**184 e2e ✓** (2.6 min, clean `db/e2e.db` + auth state reset) = **290 tests
green**. All 24 screenshots refreshed via `node scripts/capture-studyflow.mjs`
(deck-row selector updated for the S9-O restructure); VLM spot-check via
`scripts/vlm-verify-s9.mjs` passed on the seven most-reworked views
(Dashboard/Calendar/Analytics/MyDay/Tasks/Settings/Flashcards).

**Post-audit env-contract fix (the "working .env.example" requirement):**
audit of `.env.example` against the code found `NEXT_PUBLIC_SITE_URL`
documented (README/DEPLOYMENT/PAD/SKILL — "metadata, sitemap.xml, robots.txt")
but never actually consumed anywhere. Implemented the documented behavior
TDD-style: `tests/site.test.ts` RED first (5 expectations), then
`src/lib/site.ts` (`siteUrl()` — whitespace/trailing-slash trimmed,
`http://localhost:3000` default), `src/app/sitemap.ts` (root + 20 NAV_ITEMS
paths + `/login` = 22 URLs, verified prerendered), `src/app/robots.ts`
(allow-all + sitemap pointer), and `metadataBase` in `layout.tsx` — GREEN,
and the exact-match SPA rewrites provably never touch `/sitemap.xml` or
`/robots.txt`. The `.env.example` now matches the codebase line-for-line.
