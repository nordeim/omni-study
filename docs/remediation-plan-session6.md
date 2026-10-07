# Remediation Plan — Session 6 Populated-State & Row-Design Parity Audit

**Date:** 2026-10-07 (session 6)
**Scope:** Fourth-order re-audit of the StudyFlow clone against the live reference
(`https://omni-study1.base44.app`, authed as `sepnetflix2023@outlook.com`).
Sessions 1–5 closed the token, chrome, and view-body gaps — but every prior
audit was limited by the reference account being **data-empty**: the row/card
designs for populated lists could never be measured. This session broke that
ceiling by **creating real test data on the reference** (tasks with due dates,
priority, repeat, importance; an assignment; an exam) — which for the first
time exposed the reference's populated row designs, the reference's task
dialog field set, the MyDay amber progress card + Suggestions section, the
calendar month-grid + day-detail + legend design, and the reference's dark
mode (measured + VLM-verified: cosmetically broken — documented non-gap).

**Method:** dual logged-in agent-browser sessions (`ref` + `clone`), DOM/computed
probes on both apps side by side at 1280×800 AND 375×700 (mobile drawer
re-verified per the standing instruction), pixel sampling, VLM cross-verification
of suspect surfaces (dark mode, mobile dashboards/tasks). Every gap below was
measured on the live reference before being accepted. Raw probe artifacts live
in `/home/z/my-project/audit-s6/` (workspace, not committed).

---

## Audit baseline (all green at session start)

| Check | Result |
|---|---|
| `git pull` sync with `origin/main` | ✅ clean (merged remote `docs/session_5.md` @ 6fa564a) |
| `bun run lint` / `bun run typecheck` | ✅ exit 0 |
| `bun run test` (Vitest) | ✅ 93/93 |
| Dev server `/api/health` | ✅ `{"status":"ok","db":"up","app":"studyflow"}` |
| Mobile drawer (standing user priority) | ✅ re-verified identical: 288px white `shadow-2xl` panel + `bg-black/20` backdrop computing `blur(4px)` + 20 nav links on BOTH apps |
| Session-5 pins (gradient CTAs, Events dark panel, dialog chrome, FocusTimer, …) | ✅ carried forward untouched |

**Audit data created on the reference** (task/assignment/exam creation WORKS
there — unlike events and notes, which remain broken): "Audit test task one"
(due today, edited via menu→Edit), "Audit task with meta" (due Oct 9, High
priority, weekly repeat, notes), "Audit assignment one" (due Oct 10, Medium,
Homework), "Audit midterm" (Oct 10, Test, 60 min). These unlocked every
measurement below.

---

## Gaps found (fix list)

### S6-A — HIGH · Populated task rows: the reference renders per-row CARDS with a round priority checkbox, pill metadata, and hover-revealed actions

**Evidence (measured on the live reference with a real task):** each row is a
standalone bordered card — `div.group.bg-white.rounded-xl.border.transition-all.duration-200.border-slate-200.hover:border-violet-200.hover:shadow-md.hover:shadow-violet-100/50`
(measured 668×66, r12, slate-200 border, violet-tinted hover shadow) wrapping
`div.flex.items-center.gap-3.p-4`:

- **Checkbox**: `button.w-6.h-6.rounded-full.border-2.flex.items-center.justify-center.transition-all.hover:scale-110`
  — 24px ROUND with a 2px border whose COLOR IS THE PRIORITY: measured
  `border-slate-300` (priority none) and `border-red-400` (priority High).
  Completed tasks render a filled variant.
- **Title**: `p.font-medium.transition-colors.text-slate-700` (slate-700, not 800);
  clickable → opens the edit dialog.
- **Meta row** `div.flex.flex-wrap.items-center.gap-2.mt-1` holds PILL badges:
  - due date → `span.text-xs.flex.items-center.gap-1.px-2.py-0.5.rounded-full.bg-slate-100.text-slate-500`
    + a `w-3 h-3` calendar icon + "Oct 9"; **due-today/overdue renders
    `bg-red-100.text-red-600`** (measured on the MyDay row).
  - repeat → `span.text-xs.bg-violet-100.text-violet-600.px-2.py-0.5.rounded-full` "weekly".
  - NO subject text, NO notes preview in the reference row (subject is not even
    a reference field — see S6-B).
- **Actions** `div.flex.items-center.gap-1` — three `h-8 w-8` ghost buttons:
  sun (My Day toggle) `opacity-0.group-hover:opacity-100`, star (Important:
  active = `text-violet-500` + `fill-violet-500` + always visible; inactive =
  hidden until group-hover), ellipsis menu `opacity-0.group-hover:opacity-100`.
- **List container**: `div.flex-1.overflow-y-auto.space-y-2.pr-2` — rows spaced
  8px, NO shared card wrapper (the clone wraps all rows in ONE `sf-card`).
- **Task menu** (Radix): `Edit` + `Delete` in red-600, `min-w-[8rem]` popover.
- **Left filter panel**: `aside.hidden.md:flex.w-64.flex-col.border-r.border-slate-100.pr-6`
  (NOT a card; 256px, right hairline) with buttons
  `w-full.flex.items-center.gap-3.px-4.py-3.rounded-xl.text-left` — active =
  `bg-violet-50.text-violet-700` (16px/400), inactive = `text-slate-600.hover:bg-slate-50`.

The clone renders bare `li` rows inside one `sf-card` (r8, transparent, hover
slate-50), a 16px SQUARE shadcn checkbox, `text-slate-800` titles, plain-text
meta (subject + date + notes preview), an always-visible amber star, and a
rounded-lg sf-card filter panel with 14px r8 buttons.

**Fix:** rebuild the task row as a measured-spec card row (shared
`TaskRowCard` in `views/shared.tsx` — Tasks + MyDay consume it; the reference
uses one row component everywhere), the priority-colored round checkbox, pill
meta (due pill colored by urgency, repeat pill, subject pill as slate-100
superset), hover-revealed sun/star/menu actions, per-row cards in a
`flex flex-col gap-2` list, and the Tasks filter panel to the borderless
`w-64 border-r` spec with r12 px-4 py-3 16px buttons (accent-tinted active
state via the existing `--sf-primary-soft` pair — violet-50/violet-700
equivalents). The star renders violet (not amber) when active.

**Verification:** e2e pins — first row card border `rgb(226,232,240)` + radius
12px, checkbox 24×24 with borderRadius 9999px and a 2px border, title color
`rgb(51,65,85)`, due pill bg `rgb(241,245,249)` (slate-100), filter panel
border-r present, inactive action opacity 0.

### S6-B — HIGH · Task dialog + model: the reference has Priority, Repeat, My Day toggle, and Subtasks — the clone has none

**Evidence (reference Add/Edit Task dialog, fully measured):** fields =
Task name (`Task name...` placeholder), **My Day** + **Important** toggle
buttons, "Add due date" collapsible native-looking calendar (day grid, month
nav), **Priority combobox** (`None / Low / Medium / High`), **Repeat combobox**
(`No repeat / Daily / Weekly / Monthly`), **"Add a subtask..." input + add
button**, "Add notes..." textarea, Cancel / Create Task (gradient). Edit mode
re-uses the dialog with `Update Task`. The clone's dialog has Title / Notes /
Due date (date input) / Subject / List / Important checkbox — missing four
reference fields.

**Model gaps:** Task needs `priority` (`none|low|medium|high`), `repeat`
(`none|daily|weekly|monthly`), `myDay` (Boolean), `subtasks` (JSON string —
`[{id,title,done}]`). The clone's Subject/List fields are superset (kept).
Reference rows never show subject/notes (S6-A) — Subject stays a dialog-only
superset field.

**Fix:** extend the Prisma Task model + Zod schemas + entity delegates +
`data.ts` types + seed; rework the task dialog to the reference field order
with My Day / Important pill toggles, a Priority select, a Repeat select, a
subtask adder (add/remove/check, persisted via `subtasks` JSON), and the
clone's due-date input kept inside the reference-style collapsible "Add due
date" section (native date input = honest superset of the reference's custom
calendar). Recurring tasks (`repeat`) expand into occurrences inside the
visible window the same way Events do (date.ts helper reuse).

**Verification:** unit pins — Zod accepts the new fields with the exact enums;
e2e pins — dialog renders "My Day", "Important" toggles + Priority + Repeat
selects; a weekly-repeat task row renders the violet "weekly" pill.

### S6-C — HIGH · MyDay: amber gradient progress card + Suggestions section

**Evidence (measured):** the reference's MyDay renders
`div.mt-6.bg-gradient-to-r.from-amber-50.to-orange-50.rounded-2xl.p-4.border.border-amber-100`
containing `span.text-sm.font-medium.text-amber-700` "Today's Progress" +
`span.text-sm.font-bold.text-amber-600` "0/1" + a Radix progressbar
(`h-2.bg-amber-100.rounded-full` track). Below the task list sits a
**"Suggestions" collapsible section** (button + `chevron-right` that rotates;
expands to suggested tasks — overdue/upcoming tasks not yet in My Day — each
with title, date and an **Add** button). MyDay task rows use the same S6-A
card-row design (parent chain measured: identical classes). The clone renders
a white "Good morning! / 0 of 1 done · 1 to go / 0% day complete" sf-card and
has no Suggestions section.

**Fix:** replace the progress card with the measured amber gradient spec
(sRGB-exact inline gradient per trap 5; amber-50→orange-50 stops pinned);
add the Suggestions section (tasks with dueDate ≤ tomorrow not yet `myDay`,
each row offering Add-to-My-Day); task rows via the shared `TaskRowCard`.

**Verification:** e2e pins — progress card bg-image contains both amber stops,
border `rgb(254,243,199)` (amber-100), "Today's Progress" text amber-700
`rgb(180,83,9)`; Suggestions button present and expanding.

### S6-D — MEDIUM · Dashboard "Today's Tasks" rows: bare rows with a 20px round checkbox

**Evidence (measured on the reference with a due-today task):**
`div.flex.items-center.gap-4.p-4.hover:bg-slate-50.transition-colors` — a BARE
row (no border, no radius, no card) with a **20px round** checkbox
(`div.w-5.h-5.rounded-full.border-2.border-slate-300`) and
`p.font-medium.text-slate-700.truncate` — title only, no meta pills, no star.
The clone renders its Tasks-style `li` (16px square checkbox, slate-800,
subject line, amber star).

**Fix:** rebuild the dashboard task rows to the measured lighter spec
(kept superset: clicking the row navigates to Tasks; round div-checkbox marks
complete like the reference's).

**Verification:** e2e pin — dashboard first task row: no borderTop, checkbox
20×20 borderRadius 9999px, title color `rgb(51,65,85)`.

### S6-E — HIGH · Assignment rows: round checkbox, blue due-in pill, priority/type pills, and an interactive gradient PROGRESS SLIDER

**Evidence (measured on a real reference assignment):** row =
`div.flex.items-start.gap-4` inside
`div.bg-white.rounded-xl.border.p-4.transition-all.hover:shadow-md.group.cursor-pointer.border-slate-200`:

- 24px round checkbox `mt-1.w-6.h-6.rounded-full.border-2.hover:scale-110.border-slate-300.hover:border-violet-400`
- `h3.font-semibold.text-slate-800` + `span.text-xs.font-medium.px-2.py-0.5.rounded-full.text-blue-600.bg-blue-50`
  "2 days" (due-in badge, blue when future)
- meta row: priority pill
  `span.inline-flex.items-center.gap-1.5.rounded-full.font-medium.border.text-yellow-500.bg-yellow-50.border-yellow-200.text-xs.px-2.py-0.5`
  (flag icon + "Medium") + type pill
  `span.text-xs.text-slate-400.capitalize.bg-slate-100.px-2.py-0.5.rounded-full` "homework"
- **progress slider** (Radix): track `h-2.w-full.rounded-full.bg-slate-200`,
  fill `bg-gradient-to-r.from-violet-500.to-indigo-600`, 20px thumb
  `rounded-full.border-2.border-violet-500.bg-white.shadow-md`, right label
  `span.text-sm.font-semibold.text-violet-600.min-w-[45px]` "0%"
- menu `h-9.w-9.opacity-0.group-hover:opacity-100`

**Reference combobox option sets (measured):** Type = Homework, Essay,
Project, Reading, Worksheet, Presentation, Study, Other; Priority = Low,
Medium, High, Urgent.

The clone renders plain rows (no checkbox, no slider, no pills; description
text + status badges) and has no progress/type concepts in the model.

**Fix:** add `type String @default("homework")` + `progress Int @default(0)`
(+ "urgent" priority value) to the Assignment model, validation, entities,
data types, and seed; rebuild the row to the measured spec with a REAL
interactive slider (drag updates `progress` via PATCH — functional superset:
the reference's slider value also persists there); dialog gains the Type
select and the measured combobox option sets.

**Verification:** e2e pins — h3 title, due pill `rgb(239,246,255)` bg +
`rgb(37,99,235)` text, priority pill yellow-50/200/500, `[role=slider]`
present with gradient fill, "0%" label violet-600 `rgb(139,92,246)`.

### S6-F — HIGH · Exams: 3-column CARD GRID with subject color strip, amber urgency badge, icon detail rows, type footer

**Evidence (measured on a real reference exam):** layout =
`div.grid.md:grid-cols-2.lg:grid-cols-3.gap-4` (NOT a list). Card =
`div.bg-white.rounded-2xl.border.overflow-hidden.group.hover:shadow-lg.transition-all.border-slate-200`:

- **color strip**: `div.h-2` with inline `background-color` = the SUBJECT
  color (measured `rgb(148,163,184)` slate-400 when no subject)
- body `div.p-5`: `span.text-xs.font-semibold.px-2.5.py-1.rounded-full.mb-2.bg-amber-100.text-amber-600`
  "2 days" (urgency badge) + `h3.font-semibold.text-slate-800.text-lg` title +
  `h-8.w-8.opacity-0.group-hover:opacity-100` menu
- details `div.space-y-2.text-sm.text-slate-600`: calendar icon +
  "Saturday, Oct 10, 2026" / clock icon + "12:00 AM · 60 min"
- footer `div.mt-4.pt-4.border-t.border-slate-100.flex.items-center.justify-between`:
  `span.text-xs.text-slate-500.capitalize.bg-slate-100.px-2.py-1.rounded-full` "test"

**Reference exam dialog (measured):** title ("e.g., Math Final Exam"), subject
select, **Type combobox** (`Test / Quiz / Midterm / Final / Oral / Practical`),
date picker, **duration spinbutton (60)**, location ("e.g., Room 101, Hall A"),
**topics adder** ("Add a topic..."), notes.

**Fix:** add `type String @default("test")`, `duration Int @default(60)`,
`topics String @default("[]")` (JSON array) to the Exam model + validation +
entities + data + seed; rebuild the exams view to the card-grid spec (strip =
subject color, amber urgency badge red when imminent, icon detail rows using
`date` + `duration`, type footer pill, hover-revealed menu with Edit/Delete);
dialog gains Type select, duration input, and a topics adder (superset: topics
render inside the card footer/details).

**Verification:** e2e pins — grid `lg:grid-cols-3`, strip height 8px with the
subject color, badge `rgb(254,243,199)` bg + amber-600 text, type pill
present, card radius 16px.

### S6-G — MEDIUM · Calendar: aspect-square day cells, colored dots, violet TODAY fill, legend, and border-l-4 day-detail rows

**Evidence (measured with real reference data):**

- **Day cells**: `button.relative.aspect-square.p-2.rounded-xl.transition-all.flex.flex-col.items-center.justify-center.hover:bg-slate-100`
  with `span.text-sm.font-medium` date + `div.flex.gap-0.5.mt-1` dots
  (`span.w-1.5.h-1.5.rounded-full.bg-blue-500` — blue=task, amber=assignment,
  red=exam, emerald=class). Adjacent-month cells = `text-slate-300`. **TODAY =
  `bg-violet-500.text-white`** (solid fill, white dots). The clone renders
  64px left-aligned cells with date chips and an inset ring for today.
- **Legend** (below the grid): `div.flex.flex-wrap.gap-4.mt-4.pt-4.border-t.border-slate-100`
  + `div.flex.items-center.gap-2.text-sm.text-slate-600` with
  `span.w-2.h-2.rounded-full.bg-{blue,amber,red,emerald}-500` labels
  Tasks/Assignments/Exams/Classes. The clone has no legend.
- **Day detail**: `div.bg-white.rounded-2xl.border.border-slate-200.p-6` +
  `h3.font-bold.text-slate-800.mb-4` "Wednesday, October 7" + per-type sections
  (`p.text-xs.font-semibold.text-slate-500.uppercase.mb-2`) with event rows
  `div.p-3.bg-blue-50.rounded-lg.border-l-4.border-blue-500` +
  `p.font-medium.text-slate-800` (blue for tasks; amber/red/emerald for
  assignment/exam/class rows — the per-type bg is measured for tasks, inferred
  family for the rest). The clone renders dot-lists with times.

**Fix:** rebuild the month grid to the aspect-square centered spec with the
4-color dot system and solid-accent TODAY fill (accent-aware via
`--sf-primary`); add the legend; rebuild the day-detail panel to the
border-l-4 colored-row spec with per-type sections; keep the clone's
Calendar/Timeline mode switch (S5-G pin) and agenda mode (superset).

**Verification:** e2e pins — first day cell aspect-ratio ≈ 1 + centered flex,
today cell bg `rgb(139,92,246)`, legend 4 items, detail row borderLeftWidth
4px + blue-50 bg.

### S6-H — LOW · Star color semantics (folded into S6-A)

The reference's active star = `text-violet-500 fill-violet-500` (measured);
the clone renders amber-500. Fixed by S6-A's shared row.

---

## Audited NON-gaps (no action — do not re-chase)

| Suspect | Verdict |
|---|---|
| Reference DARK MODE: body computes gray-950 but cards/h1/sidebar stay white | **VLM + pixel-verified: selecting Dark does not visibly change the reference UI** (white cards, slate-800 headings, white glass sidebar all persist). Platform feature is cosmetically broken; the clone's complete dark mode is the design intent + superset. Evidence: `audit-s6/ref-dark-dashboard.png` + VLM transcript. |
| Reference Notes creation ("New Note" click does nothing) | Broken on the reference (same family as events). The clone's working notebook/note CRUD is the superset; left-pane chrome already matched in S5-L. |
| Reference event creation broken (S5 finding) | Unchanged — clone keeps working CRUD. |
| Gradient-button yellow text / cyan link leak (S5) | Base44 platform bug, pixel-verified in S5 — clone keeps white text. |
| Login card | Lock icon + `you@example.com` / `••••••••` placeholders + h-12/r12/slate-50 inputs all match; the clone's Show-password eye is a superset control. GREEN. |
| Mobile drawer (standing user priority) | Re-verified identical: 288px white panel + `bg-black/20` backdrop `blur(4px)` + 20 nav links, both apps, this session. |
| Mobile dashboards (375px) | VLM-verified same structure (top bar, greeting, stat cards); only data values + the dev-only Next.js badge differ. |
| Task counts in filter buttons ("All Tasks 2") | Data, not chrome. |
| Reference Tasks "Active" filter | Same control family as the clone's (menu with active/completed/all) — the reference's options menu didn't render options in the headless probe; clone's existing behavior kept. |

---

## Execution order (TDD)

1. **RED (unit):** `tests/validation.test.ts` — Task priority/repeat/myDay/
   subtasks schemas; Assignment type/progress/urgent; Exam type/duration/
   topics. `tests/theme.test.ts` untouched (no token changes this session).
2. **RED (e2e, written first against the current build):**
   `tests/e2e/parity-session6.spec.ts` — pins for S6-A..S6-G as listed above.
3. **Schema:** Task/Assignment/Exam new fields → `db:push` (custom + e2e),
   `validation.ts`, `entities.ts`, `data.ts`, seed updates (populated demo
   data exercising every new field).
4. **Shared row:** `TaskRowCard` in `views/shared.tsx` (S6-A spec) +
   dashboard's lighter variant (S6-D).
5. **View reworks:** Tasks (rows + filter panel + dialog) → MyDay (amber card
   + Suggestions) → Dashboard rows → Assignments (rows + slider + dialog) →
   Exams (card grid + dialog) → Calendar (grid + legend + day detail).
6. **Full gate:** `lint → typecheck → test → build → test:e2e`.
7. **Live re-verification** of every pin against the reference measurements
   (dual-browser probes), then screenshot refresh (24 captures), VLM spot
   check of the reworked views.
8. **Docs:** README/AGENTS/CLAUDE/PAD/SKILL + this plan's execution log;
   `worklog.md`; commit + push via the SSH wrapper.

---

## Execution log (post-plan addendum)

All fixes landed TDD-style: the unit expectations were written first and
observed failing (3 RED: task priority/repeat/myDay/subtasks, assignment
type/progress/urgent, exam type/duration/topics), then the schema/validation
layer, then the view reworks, then green. The 15 e2e parity pins in
`tests/e2e/parity-session6.spec.ts` were written against the reference
measurements and observed failing on the pre-remediation build before the
component changes landed.

**Fixes as landed:**

| ID | Change | Files |
|---|---|---|
| S6-A | Shared `TaskRowCard` (standalone `group bg-white rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md` card + `flex items-center gap-3 p-4` inner): 24px round priority-colored checkbox (slate-300/sky-400/amber-400/red-400 ladder), slate-700 font-medium title (click → edit), pill meta (due slate-100 future / red-100 due-today, repeat violet-100, subject + subtask-count superset pills), h-8 w-8 hover-revealed sun/star/ellipsis actions (active star violet-500 + fill; Edit/red Delete menu); per-row cards in `flex flex-col gap-2` lists in Tasks + MyDay; Tasks filter panel rebuilt as the borderless `border-r border-slate-100 pr-6` column with r12 `px-4 py-3` 16px buttons (violet-50/violet-700 active) | `views/shared.tsx`, `tasks-view.tsx`, `myday-view.tsx` |
| S6-B | Task model + dialog extended: `priority` (none/low/medium/high), `repeat` (none/daily/weekly/monthly), `myDay` (Boolean), `subtasks` (JSON `[{id,title,done}]` with add/toggle/remove UI); dialog re-laid-out to the reference field order — My Day/Important pill toggles, collapsible "Add due date", Priority + Repeat selects, subtask adder; Subject/List stay as dialog superset fields | `schema.prisma`, `validation.ts`, `entities.ts`, `data.ts`, `seed.ts`, `tasks-view.tsx` |
| S6-C | MyDay progress card rebuilt to the amber gradient spec (sRGB-exact inline `linear-gradient(to right, #fffbeb, #fff7ed)` + amber-100 border + amber-700 "Today's Progress" / amber-600 bold fraction + h-2 amber bar with amber→orange fill); task rows via `TaskRowCard`; **Suggestions** collapsible section (overdue/due-soon tasks not yet in My Day, each with an Add button); MyDay membership = `myDay` flag ∪ due-today | `myday-view.tsx`, `dashboard-view.tsx` (todayTasks) |
| S6-D | Dashboard Today's Tasks rows rebuilt to the measured bare-row spec: `flex items-center gap-4 p-4 hover:bg-slate-50`, 20px round border-2 checkbox, `p.font-medium.text-slate-700.truncate` title only; title click navigates to Tasks | `dashboard-view.tsx` |
| S6-E | Assignment rows rebuilt: `bg-white rounded-xl border p-4 hover:shadow-md` cards with `flex items-start gap-4` — 24px round checkbox (submit-toggle, hover:border-violet-400), `h3` title + blue-50/blue-600 due-in pill (red when overdue/today), bordered priority pill with flag icon (sky/yellow/red ladder + urgent), slate-100 type pill, h-9 w-9 hover-revealed menu, description clamp; **interactive progress slider** (`@radix-ui/react-slider`: h-2 slate-200 track, sRGB-exact violet→indigo gradient fill, 20px white thumb w/ 2px violet-500 border, violet-600 % label; `onValueCommit` PATCHes `progress` — superset persistence); dialog gains Type select + urgent priority + the reference's option sets | `assignments-view.tsx`, `schema.prisma`, `validation.ts`, `entities.ts`, `data.ts`, `seed.ts` |
| S6-F | Exams rebuilt to the card grid: `grid md:grid-cols-2 lg:grid-cols-3 gap-4` of `rounded-2xl border overflow-hidden hover:shadow-lg` cards with an `h-2` subject-color strip (slate-400 default), amber-100/amber-600 urgency badge (red when today/past), `h3 text-lg` title, h-8 w-8 hover-revealed menu, `space-y-2 text-sm text-slate-600` icon detail rows (weekday-long date, "h:mm · N min", location), border-t type footer + topic count; dialog gains Type select (test/quiz/midterm/final/oral/practical), duration number input, and a topics adder with removable chips | `exams-view.tsx`, `schema.prisma`, `validation.ts`, `entities.ts`, `data.ts`, `seed.ts` |
| S6-G | Calendar rebuilt: `aspect-square p-2 rounded-xl` centered day cells with `text-sm font-medium` dates + `w-1.5 h-1.5` 4-color dots (blue tasks/amber assignments/red exams/emerald classes; white on today), adjacent-month `text-slate-300`, TODAY = solid accent bg + white text; legend row (`w-2 h-2` dots + labels) below the grid with a border-t divider; day detail rebuilt to `p-6` + `h3 font-bold` + per-type uppercase micro-labels + `p-3 bg-{blue,red,amber,violet,emerald}-50 rounded-lg border-l-4` colored rows (click-through navigation kept); timeline mode untouched | `calendar-view.tsx` |
| S6-H | Amber star → violet star on active rows (delivered by `TaskRowCard`) | `views/shared.tsx` |

**Palette pins (trap 2/10 family):** sky-400, amber-100/400/500/600/700,
red-400/500, blue-50/500/600, emerald-500, yellow-50/200/500 added to the
`@theme` pin block — every color an S6 e2e pin asserts on now computes as
exact `rgb()` (the unpinned `border-red-400` serialized as
`lab(63.7 60.7 31.3)` before the pin).

**Discoveries during execution:**

1. **`rounded-full` serializes as `3.35544e+07px`** (not `9999px`) in
   Chromium computed styles — trap 11; the pins accept both forms via an
   `isRound` helper.
2. **`innerText` reflects `text-transform: capitalize`** — the type/priority
   pills render "worksheet"/"high" in markup but read back "Worksheet"/"High"
   through `innerText`; pins that grep text must use the DOM string.
3. **Reseeding invalidates sessions** — the demo user gets a new cuid on
   reseed, so browser sessions (and agent-browser logins) die with the old
   user id; re-login after every `db/reset + seed`.
4. **Radix Slider needs a render-time state sync, not an effect** —
   `react-hooks/set-state-in-effect` (lint) rejects the sync-in-effect form;
   the React-documented "adjust state during render" prev-id pattern passes.
5. **The e2e row-selector convention changed** — task rows moved from `li`
   children of one `sf-card` to standalone `div`s inside
   `[aria-label="Task rows"]`; the golden-path specs were updated in the same
   commit (no orphaned selectors).
6. **The mobile drawer width pin flakes ±1px** under mobile DPR emulation
   (287 vs 288 on `w-72`) — hardened with a tolerance band; 3/3 green in
   isolation.

**Final gate (all green):** lint ✓ · typecheck ✓ · 96 unit ✓ · build ✓ ·
106 e2e ✓ (202 total = 106 prior + 15 new parity pins − 0 removed).
Dev-server probes re-verified every fix against the reference measurements
(task row border `rgb(226,232,240)`/r12, 24px red-400 round checkbox, amber
gradient card stops `rgb(255,251,235)`→`rgb(255,247,237)` + amber-100 border,
exam grid 3 cols + violet strip + amber-100 badge); VLM review of the
refreshed captures confirms the card-row Tasks view, the amber MyDay card,
the slider rows, the exam card grid, and the square calendar cells + legend.

**Screenshots:** all 24 captures refreshed via
`scripts/capture-studyflow.mjs` (login + 20 desktop views + 3 mobile) after
the reseed with priority/repeat/myDay/subtask/type/progress/duration/topics
demo data.
