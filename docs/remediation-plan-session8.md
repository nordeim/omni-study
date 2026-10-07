# Session 8 Remediation Plan — Deep Chrome & View-Layout Parity

> Audit: 2026-10-07/08, dual-app (live reference `omni-study1.base44.app` logged in as
> `sepnetflix2023@outlook.com` vs local clone dev server, both at 1280×800 desktop +
> 390×844 mobile). Every measurement below is a live computed-style / DOM probe from
> the reference, re-verified this session after the session-8 workspace reset
> (the prior session-8 pass was never committed).
>
> Mobile drawer (the standing priority) re-verified FIRST and **GREEN**: 288px white
> `shadow-2xl` panel (`rgba(0,0,0,0.25) 0px 25px 50px -12px`), 20 links, no footer,
> backdrop `rgba(0,0,0,0.2)` + `blur(4px)` — the clone's `oklab(0 0 0 / 0.2)`
> serialization is the same rendered color (v4 trap 7).

## Measured gap families

16 families. Verified against `src/` before planning (file/line refs below).

### S8-A · Sidebar chrome (icons, gradient stop, tagline, collapse button)

1. **6 nav icon swaps** (reference `nav a svg` classes, live-measured):
   | view | reference | clone renders | fix |
   |---|---|---|---|
   | Tasks | `lucide-square-check-big` | `lucide-list-checks` | `ListChecks → SquareCheckBig` |
   | Calendar | `lucide-calendar` | `lucide-calendar-days` | `CalendarDays → Calendar` |
   | Events | `lucide-calendar-days` | `lucide-calendar-plus` | `CalendarPlus → CalendarDays` |
   | Timetable | `lucide-calendar` | `lucide-calendar` | ✓ keep |
   | Notes | `lucide-book-open` | `lucide-notebook` | `Notebook → BookOpen` |
   | Files | `lucide-folder-open` | `lucide-folder` | `Folder → FolderOpen` |
   | Math Solver | `lucide-calculator` | `lucide-square-radical` | `SquareRadical → Calculator` |
   (Analytics `lucide-chart-column` already matches — `BarChart3` renders under its
   new lucide name; Practice Tests `file-question-mark` is the same glyph.)
2. **Active nav gradient stop** — reference:
   `linear-gradient(to right, rgba(139,92,246,0.1), rgba(99,102,241,0.1))`
   (violet-500 → **indigo-500**). Clone renders stop 2 with `--sf-primary-strong`
   (violet-600 `124 58 237`). Fix: route stop 2 through `--sf-primary-avatar-to`
   (`99 102 241` — exactly the reference's indigo-500, already a token).
3. **Brand tagline truncation** — reference tagline computes
   `text-overflow: clip; overflow: visible` (never truncates); clone has
   `truncate`. Fix: drop `truncate` on the tagline `p` (keep on `h1`).
4. **Collapse/expand button size** — reference: `h-9 w-9` button (36px,
   `rounded-lg`, icon renders 16px via the shadcn `[&_svg]:size-4` override).
   Clone: `p-1.5` (28px) `rounded-md`. Fix: `h-9 w-9 rounded-lg` on both buttons.

### S8-B · Dashboard flush-body rows

Reference cards are `rounded-2xl border border-slate-100 shadow-sm overflow-hidden`
with header `p-6 border-b` + body `divide-y divide-slate-50` (NO body padding).
Rows run edge-to-edge:

- **Exam row**: `p-4 hover:bg-slate-50 transition-colors`; inside —
  `flex items-start justify-between mb-2` with `h3 font-medium text-slate-700` +
  badge `text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600` ("2d");
  then `p.text-xs text-slate-400 mt-2 flex items-center gap-1` with
  `calendar w-3 h-3` icon + "Oct 10, 12:00 AM".
- **Assignment row**: `flex items-center gap-4 p-4 hover:bg-slate-50`; inside —
  `w-1 h-12 rounded-full` subject-color strip (inline `rgb(148,163,184)` when no
  subject), `flex-1 min-w-0` with `h3 font-medium text-slate-700 truncate` +
  `clock w-3 h-3` + due text; right `text-right min-w-[120px]` with priority pill
  `inline-flex items-center gap-1.5 rounded-full font-medium border
  text-yellow-500 bg-yellow-50 border-yellow-200 text-xs px-2 py-0.5` + `flag w-3 h-3`.
- **Task row**: unchanged S6-D bare row, but in the flush body.

Fix: `SectionCard` gains `flush` mode (body `divide-y divide-slate-50`, no `p-6`);
dashboard's three lists convert to flush rows.

### S8-C · Calendar rework

Reference month card is a SIMPLE card — not the clone's header-split
`overflow-hidden` design:

- Card: `bg-white rounded-2xl border border-slate-200 p-6` (border-**200**).
- Title row: `flex items-center justify-between mb-6`; `h2 text-xl font-bold
  text-slate-800`; **exactly 2** ghost `h-9 w-9` chevron nav buttons — NO "Today"
  button (clone has 3).
- Weekday header: `grid grid-cols-7 gap-1 mb-2`, cells
  `text-center text-sm font-medium text-slate-500 py-2` (clone:
  `text-xs uppercase tracking-wide text-slate-400`).
- Day cells (live-verified by clicking day 15): selected = `bg-violet-500
  text-white` fill; **today (unselected) = `bg-violet-100 text-violet-700` tint**;
  normal = `hover:bg-slate-100`. Selected/today cells STRIP the hover class.
  Clone today cell is wrongly the solid accent fill and has no selected state at
  all. Accent-aware: selected = `rgb(var(--sf-primary))`, today =
  `rgb(var(--sf-primary-empty-from))` family.
- Day detail: simple `rounded-2xl border border-slate-200 bg-white p-6` card,
  `h3 font-bold text-slate-800 mb-4` long date, body `space-y-4`, empty =
  `p.text-slate-400 text-center py-8`.

### S8-D · MyDay rework

Reference MyDay (max-w-3xl mx-auto column):

1. **Header block**: `flex items-center gap-4 mb-2` with a **56px
   `w-14 h-14 rounded-2xl` amber gradient block** (`from-amber-400 to-orange-500`,
   `shadow-lg shadow-amber-500/30`, `sun w-7 h-7 text-white`) + h1 `text-3xl
   font-bold text-slate-800` + `p.text-slate-500` weekday date. Clone has bare
   h1+p (no icon block).
2. **Quick-add**: `mb-6` form, `flex gap-3`, input wrapper `relative flex-1`
   with `plus w-5 h-5 text-slate-400` icon at `absolute left-4 top-1/2`.
3. **Today's list**: `space-y-3 mb-8` (clone: `flex flex-col gap-2`).
4. **Suggestions**: NOT a card — a bare toggle `button.flex items-center gap-2
   text-slate-500 hover:text-slate-700 mb-4` (sparkles `w-4 h-4` +
   `span.text-sm font-medium` + rotating `chevron-right w-4 h-4`), expanding to
   `space-y-2 overflow-hidden` rows: `flex items-center gap-3 p-3 bg-slate-50
   rounded-xl hover:bg-slate-100 transition-colors` with `circle w-5 h-5
   text-slate-300` + `font-medium text-slate-600 truncate` title +
   `clock w-3 h-3` date + trailing add affordance. Clone renders an sf-card with
   a header row and outline buttons — full rework.

### S8-E · Timetable today tint + week-nav buttons

- **Today column tint belongs on the HEADER cell**: reference Wednesday header =
  `p-3 text-center border-l border-slate-100 bg-violet-50` (`rgb(245,243,255)` =
  `--sf-primary-softest`); body columns are transparent. Clone tints the BODY
  column via **`bg-sf-primary-softest/50` — a utility that DOES NOT EXIST in
  `@theme`** (renders transparent; the only sf-primary utilities defined are
  `--color-sf-primary{,-foreground,-soft,-soft-dark,-strong,-strong-dark}`).
  Fix: header-cell inline `backgroundColor: rgb(var(--sf-primary-softest))`,
  drop the dead body class.
- Body day columns: `relative border-l border-slate-100 cursor-pointer
  hover:bg-slate-50/50` (clone: `border-slate-50`, no hover).
- **Week-nav chevrons**: reference = ghost `h-9 w-9` (rounded-md) buttons —
  clone uses `outline` + `rounded-full`. Fix to ghost `size="iconSm"`.
- Mobile accordion today row: `hover:bg-slate-50` + today `bg-violet-50` row tint
  (clone tints only the chip).

### S8-F · Tasks panel + search icon

Reference Tasks = `flex h-[calc(100vh-8rem)]`:

- **Aside**: `hidden md:flex w-64 flex-col border-r border-slate-100 pr-6`
  (clone: always-visible stacked `lg:w-64`).
- Filter buttons: `w-full flex items-center gap-3 px-4 py-3 rounded-xl
  transition-all text-left` + active `bg-violet-50 text-violet-700`; label =
  `span.flex-1.font-medium`; count = `span.text-sm text-slate-400`. **Icons:
  `list w-5 h-5` (All Tasks) + `star w-5 h-5` (Important)** — clone has none.
- Sections: `space-y-1 mb-6` (filters) then `border-t border-slate-100 pt-6`
  (My Lists) with `flex items-center justify-between mb-4` header + `h-7 w-7`
  ghost add button.
- **Main header**: ONE row — `flex flex-col md:flex-row md:items-center
  justify-between gap-4 mb-6`: left `h1 text-2xl font-bold` + `p.text-slate-500`
  "N tasks"; right `flex items-center gap-3` = search (`relative flex-1 md:w-64`,
  **`search w-4 h-4` icon at `absolute left-3 top-1/2`**, `h-9` input) +
  "Active" outline dropdown + gradient Add Task. Clone: two rows, no search icon.

### S8-G · Notes two-pane rework

Reference Notes = `flex h-[calc(100vh-8rem)] gap-6` (NO page-level header):

- Left `w-80 flex flex-col border-r border-slate-100 pr-6`: header row
  (`h1 text-2xl font-bold text-slate-800 flex items-center gap-2` +
  **`book-open w-6 h-6 text-violet-500`** + ONE `h-9 w-9` gradient plus button
  wired to a **Radix dropdown menu** — New Note / New Notebook), search
  (`relative mb-4` + `search w-4 h-4` icon at left-3, input `pl-10`), selects row
  `flex gap-2 mb-4` with **Radix combobox triggers** (`role="combobox"`, h-9),
  list `flex-1 overflow-y-auto space-y-4` with the centered 80px-block empty
  state + New Note gradient button.
- Right `flex-1 flex flex-col min-w-0` — **bare, no card**: centered
  `py-16 px-4` empty state (80px gradient block, book-open `w-10 h-10`,
  `h3 text-xl font-semibold text-slate-800 mb-2` "Select a note", `p
  text-slate-500 max-w-sm mb-6`). Clone has a page ViewHeader + h2 pane title +
  two icon buttons + native `<select>`s + sf-card editor pane.

### S8-H · Study Groups two-pane rework

Same two-pane pattern as Notes (`flex h-[calc(100vh-8rem)] gap-6`):

- Left `w-80 flex flex-col border-r border-slate-100 pr-6`: `h1 text-2xl
  font-bold` + **`users w-6 h-6 text-violet-500`** + `h-9 w-9` gradient plus
  (plain), search with icon, list `flex-1 overflow-y-auto space-y-2`, centered
  empty state (users `w-10 h-10`).
- Right `flex-1 flex flex-col`: "Select a group / Choose a study group from the
  sidebar…" centered empty.
Clone: page ViewHeader + grid layout + sf-card list + separate detail card.

### S8-I · Analytics icon headers + 3 missing cards

Reference Analytics (after stats grid `grid-cols-2 lg:grid-cols-4` — clone:
`sm:grid-cols-2 xl:grid-cols-4`):

- Chart-card headers carry **per-card icons** (`w-5 h-5 text-violet-500`):
  Task Activity = `trending-up`, Focus Time = `clock`, Assignment Status =
  `book-open`, Subject Workload = `target`. Clone's ChartCard hardcodes
  TrendingUp.
- **"Assignment Status" card MISSING** on the clone: recharts pie (250px) —
  measured sector fill `#94a3b8` (slate-400, "Not Started"). Build an SVG donut
  (Not Started `#94a3b8`, In Progress `#8b5cf6`, Completed `#22c55e` — the latter
  two unmeasurable on the empty reference account; palette follows the reference's
  slate-400 measurement + the app's accent/emerald conventions).
- **"Subject Workload" card MISSING**: body `h-[250px] flex items-center
  justify-center text-slate-400` empty / subject bars when data exists.
- **"Active Items by Priority" card MISSING**: flame `w-5 h-5 text-violet-500`
  header + `flex flex-wrap gap-4` chips `flex items-center gap-3 px-4 py-3
  bg-slate-50 rounded-xl` (`w-4 h-4 rounded-full` dot + `p.font-medium
  text-slate-800` count + `p.text-xs text-slate-500` label).

### S8-J · Dead utility sweep

`bg-sf-primary-softest/50` (timetable body column) resolves to nothing — see
S8-E. No other dead sf-* utility usages exist (verified by grep).

### S8-K · Calculator Clear icon

Reference Clear key = `rotate-ccw w-5 h-5 mr-2` + "Clear" text (red). Clone:
text-only. Fix: add `<RotateCcw className="h-5 w-5 mr-2" />`… at `h-5 w-5` with
flex layout (note: reference uses `mr-2` inside a non-gap button).

### S8-L · MathSolver single-column rework

Reference = `max-w-4xl mx-auto space-y-6` single column (clone: `grid
lg:grid-cols-2` side-by-side). Input card `bg-white rounded-2xl border
border-slate-200 p-6 shadow-sm`:

- textarea `min-h-[120px] text-lg border-0 focus-visible:ring-0 resize-none p-0`
  (clone: `min-h-[220px] text-[15px]` inside a bordered sf-card)
- footer `flex items-center justify-between mt-4 pt-4 border-t border-slate-100`:
  left `flex gap-2` = Upload Image (outline, **`camera w-4 h-4`**) + Clear
  (outline, **`refresh-cw w-4 h-4`** — clone uses `Eraser`); right = Solve
  (**`sparkles w-4 h-4`** gradient — clone has this ✓).
- Solution panel below the input card. Clone's EXAMPLES pills are a kept
  superset (reference ships the same examples inside the placeholder).

### S8-M · AI Assistant quick-action icons

Reference icons (`w-8 h-8 text-violet-500`): Study Tips = **`brain`** (clone:
Lightbulb), Summarize = **`file-text`** (clone: ListChecks), Solve Problem =
**`calculator`** (clone: Wand2), Essay Ideas = **`lightbulb`** (clone:
GraduationCap). Explain Concept (book-open) + Translate (languages) match.

### S8-N · Focus Timer complete button

Reference timer control row: reset (`rotate-ccw w-5 h-5`), play (`play w-6 h-6
text-white ml-1`), **complete = `check w-5 h-5`** — clone renders `SkipForward`.

### S8-O · Settings tab list chrome

Reference TabsList: `inline-flex items-center justify-center rounded-lg
text-muted-foreground bg-white border border-slate-200 p-1 flex-wrap` —
bg-white + border + **no fixed h-9**. Clone's shadcn stock: `h-9 bg-muted`.
Fix via className on the Settings usage (keep the shared default stock).

### S8-P · Search icons + exam card slimming

- Assignments + Exams search inputs: add `search w-4 h-4` icon
  (`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`, input `pl-9`).
- Exam card detail rows: reference renders ONLY date + time·duration — **no
  location row**; footer = type pill ONLY (no topics counter). Keep location +
  topics in the edit dialog as superset fields, drop from the card.

## Codebase alignment (validated)

| family | file(s) |
|---|---|
| S8-A | `src/components/layout/nav-items.tsx` (NAV_ICONS + active gradient), `sidebar.tsx` (tagline + collapse) |
| S8-B | `src/components/views/shared.tsx` (SectionCard), `dashboard-view.tsx` |
| S8-C | `src/components/views/calendar-view.tsx` |
| S8-D | `src/components/views/myday-view.tsx` |
| S8-E | `src/components/views/timetable-view.tsx` |
| S8-F | `src/components/views/tasks-view.tsx` |
| S8-G | `src/components/views/notes-view.tsx` (+ `ui/dropdown-menu` if absent) |
| S8-H | `src/components/views/studygroups-view.tsx` |
| S8-I | `src/components/views/analytics-view.tsx` |
| S8-K | `src/components/views/calculator-view.tsx` |
| S8-L | `src/components/views/mathsolver-view.tsx` |
| S8-M | `src/components/views/aiassistant-view.tsx` |
| S8-N | `src/components/views/focustimer-view.tsx` |
| S8-O | `src/components/views/settings-view.tsx` |
| S8-P | `src/components/views/assignments-view.tsx`, `exams-view.tsx` |

Radix `DropdownMenu` exists (`ui/dropdown-menu.tsx` — used by exams). The Notes
comboboxes reuse the existing `ui/select.tsx` (Radix Select renders
`role="combobox"` triggers). No schema/data changes; no new tokens (S8-A reuses
`--sf-primary-avatar-to`, S8-C/S8-E reuse `--sf-primary-empty-from` /
`--sf-primary-softest` as inline styles).

## TDD execution order

1. **RED unit** — `tests/theme.test.ts`: pin `avatarTo` = indigo-500 (`99 102 241`)
   and the nav-gradient stop-2 token choice (guards S8-A2).
2. **RED e2e** — new `tests/e2e/parity-session8.spec.ts` pinning (against the
   production build): nav icon lucide class names (6 swaps), active nav gradient
   stop 2 = `rgba(99,102,241,0.1)` (violet accent), collapse button 36px,
   dashboard flush rows (row x == card x, divide-y body), calendar selected/today
   fills + weekday header + h2 text-xl + 2 nav buttons, MyDay header block +
   suggestions toggle, timetable today header tint + ghost nav buttons, tasks
   aside icons + single-row header + search icon, notes h1-in-pane + bare right
   pane, studygroups two-pane, analytics chart icons + Assignment Status +
   Subject Workload + priority chips, calculator Clear icon, mathsolver
   single-column + button icons, AI quick-action icon names, focustimer check
   button, settings tablist bg-white/border, assignments/exams search icons,
   exam card detail rows (no location).
3. **GREEN** — implement per family (A→P), rebuilding between checkpoints.
4. Update the S6/S7 specs where the reworked surfaces invalidate old pins
   (dashboard inset rows → flush; calendar solid-today pin → tint semantics;
   timetable body tint → header tint; notes pane title level).

## Out of scope / non-gaps

- Flashcards deck icons (verified identical — VLM misread in the earlier pass).
- Practice Tests icon (`file-question-mark` == `file-question`, lucide rename).
- Events view (dark panel, pinned S5 — unchanged).
- Mobile drawer (standing priority — GREEN, re-verified this session).

## Execution log (post-plan addendum)

All fixes landed TDD-style: the theme unit expectation (`NAV_ACTIVE_GRADIENT_STOPS`
pinning `avatarTo` = indigo-500 `99 102 241` + the kebab-case `toCssVar`) was
written first and observed failing, then the e2e parity pins in
`tests/e2e/parity-session8.spec.ts` were written from the reference measurements
and observed failing on the pre-remediation build (the initial RED run: 42
tests, 41 failed), then the component changes landed family by family with
rebuilds between checkpoints — the final spec consolidates the pins to 36
tests (several selector/geometry pins were merged during hardening).

**Fixes as landed:**

| ID | Change | Files |
|---|---|---|
| S8-A | 6 nav icon swaps (SquareCheckBig/Calendar/CalendarDays/BookOpen/FolderOpen/Calculator) + ACTIVE nav gradient stop-2 routed through `--sf-primary-avatar-to` (indigo-500) — pinned by `NAV_ACTIVE_GRADIENT_STOPS` in theme.ts; brand tagline `truncate` dropped (renders full, `text-overflow: clip`); collapse/expand buttons to `h-9 w-9 rounded-lg` | `nav-items.tsx`, `sidebar.tsx`, `theme.ts`, `tests/theme.test.ts` |
| S8-B | `SectionCard` gained a `flush` prop (body = `divide-y divide-slate-50`, no padding); Dashboard Today's Tasks bare rows + exam rows (`h3 font-medium` + red-100 rounded-full urgency badge + calendar-icon date) + assignment rows (4px subject strip + clock due line + yellow priority pill) all edge-to-edge | `shared.tsx`, `dashboard-view.tsx` |
| S8-C | Calendar rework: simple `rounded-2xl border-slate-200 p-6` month card, `text-xl font-bold` h2, exactly 2 ghost `h-9 w-9` chevron navs (Today button removed), `text-sm font-medium text-slate-500 py-2` weekday header, SELECTED = solid accent fill + white text / TODAY (unselected) = `--sf-primary-empty-from` tint + strong text (both hover-stripped), day-detail simple card with font-bold h3 long date + centered empty text; mobile date tests updated | `calendar-view.tsx`, `tests/date.test.ts` |
| S8-D | MyDay: 56px amber-gradient sun block + `text-3xl` h1 header row; duplicate amber card removed (single card after header); Suggestions rebuilt as a bare toggle (sparkles + rotating chevron) expanding `bg-slate-50 rounded-xl` rows with circle icons | `myday-view.tsx` |
| S8-E | Timetable TODAY tint moved from the (dead-utility) body column to the column HEADER cell (`bg-violet-50`, inline style); week-nav chevrons to ghost `h-9 w-9 rounded-lg`; mobile accordion today row tinted | `timetable-view.tsx` |
| S8-F | Tasks rebuilt as a full-height two-pane: `hidden md:flex w-64 border-r pr-6` aside (list/star icon buttons + flex-1 labels + border-t My Lists split) + single-row main header (h1 + count / icon search + filter + gradient Add Task); mobile fallback h1→h2; the duplicated mobile list removed | `tasks-view.tsx` |
| S8-G | Notes rebuilt two-pane: `w-80 border-r pr-6` left pane (h1 + `book-open` icon INSIDE + 36px gradient DropdownMenu New Note/New Notebook + icon search + notebook/tag Radix Select comboboxes) + BARE right pane (centered empty state; the editor itself keeps sf-card chrome) | `notes-view.tsx` |
| S8-H | Study Groups rebuilt two-pane (same skeleton; group rows p-4 hover + swatch dot; bare right pane with centered empty state) | `studygroups-view.tsx` |
| S8-I | Analytics: `ChartCard` gained an `icon` prop (trending-up/clock/book-open/target headers); NEW Assignment Status SVG donut (Not-Started `#94a3b8` measured) + Subject Workload card (`h-[250px]` body) + Active Items by Priority card (flame header + slate-50 r12 chips, medium `#f59e0b` / high `#ef4444`); stats grid `grid-cols-2 lg:grid-cols-4` | `analytics-view.tsx`, `shared.tsx` |
| S8-J | Dead-utility sweep: the timetable's `bg-sf-primary-softest/50` (undefined utility — only `--color-sf-primary{,-foreground,-soft,-soft-dark,-strong,-strong-dark}` exist in `@theme`) replaced with the inline-style header tint; Files' `bg-sf-primary-softest` chip likewise inlined | `timetable-view.tsx`, `files-view.tsx` |
| S8-K | Calculator Clear key icon → `rotate-ccw` | `calculator-view.tsx` |
| S8-L | MathSolver rebuilt as a single `max-w-4xl` column: input card (borderless `min-h-[120px] text-lg` textarea + border-t footer with camera/refresh-cw/sparkles icon buttons) + solution card BELOW | `mathsolver-view.tsx` |
| S8-M | AI Assistant quick-action icons swapped to the measured set + hero refreshed | `aiassistant-view.tsx` |
| S8-N | FocusTimer complete button SkipForward → `check`; `formatMinutes` import fixed | `focustimer-view.tsx` |
| S8-O | Settings tab list chrome: `bg-white` wrapped + bordered TabsList; content inside one card | `settings-view.tsx` |
| S8-P | Assignments + Exams search inputs gained the inline `search w-4 h-4` icon (`pl-9` inputs); exam card slimmed to date + time·duration rows (location row + topics counter dropped — both stay in the edit dialog as superset fields) | `assignments-view.tsx`, `exams-view.tsx` |

**Stale-pin migrations (S5/S6/S7 specs):** the S5-L Notes pin now asserts the
measured dropdown/combobox design; the S6 dashboard-row and calendar-today pins
were updated to the flush/selected-today semantics; the S7-B group-dialog pin
followed the new + icon-button CTA.

**Discoveries during execution:**

1. **Dynamically-built CSS var names must be kebab-case** — the first
   implementation built `var(--sf-primary-avatarTo)` (camelCase token name),
   which silently resolved NO var and computed the gradient to `none`. Fixed
   with `NAV_ACTIVE_GRADIENT_STOPS.toCssVar` (the kebab suffix); unit-pinned.
2. **`transition-all` cells animate color reads** — clicking a calendar cell
   and immediately evaluating its computed background caught a MID-TRANSITION
   blend (`rgb(184,157,250)` between violet-500 and violet-100). Post-click
   color asserts must `waitForFunction` the FINAL value.
3. **Post-click evaluates race React's re-render** — an evaluate issued right
   after `click()` reads pre-render state even when hydration completed
   earlier (calendar selection, theme accent). Poll for the end state.
4. **`Filter` renders as `lucide-funnel` in this lucide version** — same
   glyph, different class name; the icon-pin approach must assert the exact
   rendered class, not the import name.
5. **The reference's own flex-shrink measures 34.2×36** on the Flashcards
   deck icon block — pins that assert icon geometry must accept the flexed
   size, not the authored 40px.
6. **The selected/today cells must STRIP the hover class** — a
   `hover:bg-slate-100` on the selected cell overrides the accent fill on
   hover (the reference strips it; verified by class-list probe).
7. **`rounded-full` serializes as `3.35544e+07px`** (known trap 11) — the
   exam urgency-badge pin uses an `isRound` helper instead of parsing the
   serialized radius.
8. **Month-nav button count must be scoped** — day cells are ALSO buttons;
   the "exactly 2 chevron navs" pin scopes to the month-card header row.
9. **The e2e db persists across debugging runs** — leftover created rows
   poison strict-mode locators in later specs; clean `db/e2e.db` when a run
   goes sideways, then re-run the affected specs.

**Final gates (observed):** lint ✓ · tsc ✓ · 100 unit ✓ · build ✓ · 159 e2e ✓
(259 total tests: 100 unit — 99 prior + 1 new S8 pin — and 159 e2e — 123 prior
specs + 36 new S8 pins). Dev-server
probes re-verified every family fix against the reference measurements; VLM
spot-checked the six most-reworked views in the refreshed captures
(`scripts/vlm-verify-s8.mjs` — sidebar-confusion misreads resolved by the
DOM-level pins). All 24 screenshots refreshed via
`node scripts/capture-studyflow.mjs`.
