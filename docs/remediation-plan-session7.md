# Remediation Plan — Session 7 Lightly-Probed Views & Flashcards Parity Audit

**Date:** 2026-10-07 (session 7)
**Scope:** Fifth-order re-audit of the StudyFlow clone against the live reference
(`https://omni-study1.base44.app`, authed as `sepnetflix2023@outlook.com`).
Sessions 1–6 closed the token, chrome, view-body, interactive-chrome, and
populated-row gaps. This session audited the surfaces prior sessions could
only see data-empty or probe lightly: **Flashcards (deck + cards + study mode,
unlocked by creating real reference data)**, the **Timetable week grid +
My Classes panel**, **Analytics stat cards + charts**, the **Study Groups /
Practice Tests create dialogs** (including the reference's working
**AI question generation**), the Grade Tracker summary icons, and the Notes
editor title. The mobile drawer (standing priority) was re-verified identical
on both apps.

**Method:** dual logged-in agent-browser sessions (`ref` + `clone`), DOM/computed
probes at 1280×800 and 375×700, reference data creation (a "Audit Biology Deck"
with one card), dialog field-by-field measurement, screenshots. Raw probe
artifacts live in `/home/z/my-project/audit-s7/` (workspace, not committed).

---

## Audit baseline (all green at session start)

| Check | Result |
|---|---|
| `git pull` sync with `origin/main` | ✅ clean (merged remote `docs/session_6.md` log @ c1ff5ed) |
| `bun run lint` / `bun run typecheck` | ✅ exit 0 |
| `bun run test` (Vitest) | ✅ 96/96 |
| Dev server `/api/health` | ✅ `{"status":"ok","db":"up","app":"studyflow"}` |
| `.env` → `DATABASE_URL="file:../db/custom.db"`, `db/` at repo root | ✅ in place |
| `.env.example` | ✅ present and matching |
| Vitest + Playwright configs | ✅ wired (`bun run test` / `bun run test:e2e`) |
| Mobile drawer (standing user priority) | ✅ re-verified identical: 288px white `shadow-2xl` panel + `bg-black/20` backdrop computing `blur(4px)` + 20 nav links on BOTH apps (drawer captures: `audit-s7/ref-mobile-drawer.png` / `clone-mobile-drawer.png`) |
| Session-6 pins (task card rows, amber MyDay card, sliders, exam grid, calendar) | ✅ MyDay amber gradient + Suggestions re-verified on the reference; S6 e2e pins still in the suite |

**Reference data created this session:** "Audit Biology Deck" (blue swatch,
description "Cell structure audit") + one card ("What is the mitochondria?" /
"The powerhouse of the cell"). Study Groups and Practice Tests creation were
attempted and confirmed **broken** on the reference (see non-gaps).

---

## Gaps found (fix list)

### S7-A — HIGH · Flashcards: the whole view is a two-panel layout with colored deck rows, a card GRID, and a 3D-flip study mode — the clone renders a different design

**Evidence (measured on the live reference with a real deck + card):**

Layout — `div.flex.h-[calc(100vh-8rem)].gap-6` with TWO panels:

1. **Left sidebar** `div.w-80.flex.flex-col.border-r.border-slate-100.pr-6`
   (320px, hairline border-r, NO card wrapper):
   - header `div.flex.items-center.justify-between.mb-4` — the **view h1 lives
     here**: `h1.text-2xl.font-bold.text-slate-800.flex.items-center.gap-2` with
     a `layers w-6 h-6 text-violet-500` icon + a **36×36 gradient icon-button**
     (`linear-gradient(to right, rgb(139,92,246), rgb(79,70,229))`, plus glyph)
   - search `div.relative.mb-4` with a `search w-4 h-4 text-slate-400` icon
     INSIDE the input (`absolute left-3 top-1/2`), placeholder "Search decks..."
   - deck list `div.flex-1.overflow-y-auto.space-y-2` — rows spaced 8px:
     `button.w-full.text-left.p-4.rounded-xl.transition-all.group.bg-slate-50.hover:bg-slate-100.border-2.border-transparent`
     (r12, slate-50 bg, 76px) wrapping `div.flex.items-center.gap-3`:
     - **40px `w-10 h-10 rounded-xl` icon block** with inline
       `background-color` = the deck's picked color (measured
       `rgb(59,130,246)`) + white `layers w-5 h-5` icon
     - `h3.font-semibold.text-slate-800.truncate` deck name +
       `p.text-xs.text-slate-500` "N card(s)"
     - trailing ellipsis menu button (h-8 w-8, `opacity-0.group-hover:opacity-100`)

2. **Right detail** (flex-1):
   - header: `h2.text-xl.font-bold.text-slate-800` (20px) + `p.text-slate-500`
     description + buttons — **"AI Generate"** outline (h-9, sparkles icon) +
     **"Add Card"** gradient (h-9) + **"Study"** gradient (h-9, 104px, appears
     only when cards exist). Gradient text renders yellow on the reference —
     the documented Base44 platform bug; the clone keeps white.
   - empty state: `flex.flex-col.items-center.justify-center.py-16.px-4.text-center`
     + `h3.text-xl.font-semibold.text-slate-800.mb-2` "No cards in this deck" +
     "Add Card" CTA; deck-less state = "Select a deck" +
     "Choose a flashcard deck from the sidebar".
   - **card grid**: `div.grid.md:grid-cols-2.lg:grid-cols-3.gap-4`; card =
     `div.bg-white.rounded-xl.border.border-slate-200.p-4.hover:shadow-md.transition-shadow.group`:
     - top row `div.flex.items-start.justify-between.mb-3` — difficulty badge
       `span.text-xs.px-2.py-0.5.rounded-full.bg-yellow-100.text-yellow-700`
       "medium" + hover-revealed `div.flex.gap-1.opacity-0.group-hover:opacity-100`
       edit/delete buttons (h-7 w-7, `pen`/`trash-2` w-3.5, delete `text-red-500`)
     - `p.font-medium.text-slate-800.mb-2` question +
       `p.text-sm.text-slate-500.line-clamp-2` answer
   - **study mode** (replaces the detail when "Study" clicked): `div.w-full.max-w-2xl`;
     flip card `div.relative.h-80.cursor-pointer.perspective-1000` wrapping
     `div.absolute.inset-0.rounded-2xl.shadow-xl` (`transform-style: preserve-3d`):
     front `div.absolute.inset-0.bg-gradient-to-br.from-violet-500.to-indigo-600.rounded-2xl.p-8.flex.items-center.justify-center.backface-hidden`
     + `p.text-2xl.text-white.text-center.font-medium`; back
     `div.absolute.inset-0.bg-white.border-2.border-violet-200.rounded-2xl.p-8.flex.items-center.justify-center`
     (`transform: rotateY(180deg)`) + `p.text-xl.text-slate-700.text-center`;
     footer: "Exit Study" outline button (137px) + prev/next
     `h-10.rounded-md.px-8` chevron (`chevron-left/right w-5 h-5`) buttons.

3. **Create Deck dialog**: "Deck Name \*" (`e.g., Biology Chapter 5`),
   "Description" (`What's this deck about?`), **"Color" label + 6 round
   swatches** `button.w-8.h-8.rounded-full.transition-transform` with
   backgroundColors violet-500 `rgb(139,92,246)`, blue-500 `rgb(59,130,246)`,
   emerald-500 `rgb(16,185,129)`, amber-500 `rgb(245,158,11)`, red-500
   `rgb(239,68,68)`, pink-500 `rgb(236,72,153)` (selected = scaled).
   **Add Card dialog**: "What do you want to remember?" front +
   "The answer..." back textareas + gradient "Add Card".

The clone renders: ViewHeader + search above a `lg:grid-cols-[340px_1fr]` of
two `sf-card`s; transparent divide-y deck rows with subject pills +
progress bars (no colors, no icon blocks, no menu); detail header with
18px h3 + Edit/Delete ghost buttons; a single inline flip card with
Front/Back labels and ← Previous / Next → / Mark mastered / Reset controls
(no card grid, no study mode, no AI Generate); deck dialog with
Name/Description/Subject (no swatches); card dialog labeled
"Front (question)"/"Back (answer)".

**Fix:** extend `FlashcardDeck` with `color String @default("#8b5cf6")` and
`Flashcard` with `difficulty String @default("medium")`; rebuild the view to
the measured two-panel layout (h1 + gradient icon-button + icon-search inside
the sidebar; colored deck rows with ellipsis menus; detail h2 20px +
AI Generate/Add Card/Study buttons; the card grid; the 3D study mode with Exit
Study + chevron nav); rebuild both dialogs to the measured field sets
(swatch picker; reference placeholders). **AI Generate** = functional superset
wired to `z-ai-web-dev-sdk` via a new `/api/ai/generate-cards` route (the
reference's button exists but the platform's deck-AI is unmeasurable; our
version generates cards from the deck name/description/subject). The clone's
responsive stacking below `lg` stays (the reference's mobile keeps the w-80
sidebar and pushes the detail off-screen — worse UX; documented non-gap).
Mastered/reset controls move into study mode as superset actions.

**Verification:** unit pins — Zod accepts `color` on decks + `difficulty` on
cards; e2e pins — deck row bg `rgb(248,250,252)` + radius 12px + 40px icon
block with inline deck color, card grid `lg:grid-cols-3`, difficulty badge bg
`rgb(254,249,195)`, study front gradient stops
`rgb(139,92,246)→rgb(79,70,229)`, dialog swatch colors, "AI Generate" button
present.

### S7-B — MEDIUM · Study Groups / Practice Tests create dialogs: swatch palette drift + the reference's measured dialog designs (creation itself is broken there)

**Evidence (measured):**

- **Study Groups dialog** (reference): "Group Name \*"
  (`e.g., Math Study Squad`), "What's this group about?" description, **the
  same 6-swatch Color picker as decks** (violet/blue/emerald/amber/red/pink-500,
  in that order). The clone's dialog already HAS a Color section with 6
  swatches but renders **green-500 `rgb(34,197,94)`** where the reference has
  **emerald-500 `rgb(16,185,129)`**, **orange-500 `rgb(249,115,22)`** where the
  reference has **amber-500 `rgb(245,158,11)`**, and orders pink before red
  (reference: red before pink).
- **Practice Tests dialog** (reference, fully measured):
  `grid.grid-cols-2.gap-4` — "Test Title \*"
  (`e.g., Biology Chapter 5 Review`) + "Time Limit (minutes)" number (default
  60, h-9 inputs); below: `div.flex.justify-between.items-center` with
  `p.text-sm.text-slate-500` "N questions added" + **"AI Generate Questions"**
  outline button (h-9, sparkles icon, enabled once a title exists); below: the
  question list `div.space-y-2.max-h-60.overflow-y-auto` of
  `div.p-3.bg-slate-50.rounded-lg.text-sm` items — `p.font-medium` question +
  `p.text-slate-500.text-xs.mt-1` "Type: multiple_choice | true_false |
  short_answer"; "Create Test" gradient (disabled until questions exist).
  **AI generation WORKS on the reference** (generated 10 audit questions);
  test CREATION is broken there (dialog resets, nothing persists — verified
  twice + reload).

The clone's Practice Test dialog: "New Practice Test" / Title / Subject /
Date / Total questions / Duration — a different field set with no questions
array and no AI generation.

**Fix:** correct the Study Groups swatch palette to the measured set
(emerald-500, amber-502... `#f59e0b`, red-then-pink order — reuse the same
`DECK_COLORS` constant as S7-A); rework the Practice Test dialog to the
measured layout (2-col grid title + time limit + AI Generate Questions +
scrollable question list + "N questions added" counter); extend
`PracticeTest` with `questions String @default("[]")`
(JSON `[{question, type}]`, types multiple_choice/true_false/short_answer);
wire "AI Generate Questions" to a new `/api/ai/generate-questions` route
(z-ai-web-dev-sdk, server-side) — a working superset of the reference's
generate-then-fail flow. Keep the clone's Subject/Date fields as dialog
superset rows below the measured pair. The clone's test-taking/scoring flow
stays (superset).

**Verification:** e2e pins — Study Groups swatch #3 = `rgb(16,185,129)` and
#4 = `rgb(245,158,11)`; Practice Test dialog renders "Test Title" +
"Time Limit (minutes)" + "AI Generate Questions"; a generated question renders
in the `bg-slate-50` list with its "Type:" label.

### S7-C — HIGH · Timetable: the reference's week grid is a grid-cols-8 time table with full day-name headers and 60px hour rows; My Classes carries today's date

**Evidence (measured on the reference, empty classes):**

- Desktop week grid: `div.hidden.md:block.overflow-x-auto` >
  `div.min-w-[900px]` with a header `div.grid.grid-cols-8.border-b.border-slate-100`
  — "Time" cell `p-3.text-center.text-sm.font-medium.text-slate-500` + 7 day
  heads `div.p-3.text-center.border-l.border-slate-100` each holding
  `p.text-sm.font-medium.text-slate-600` "Sunday" +
  `p.text-lg.font-bold.text-slate-700` "4". Body: `div.relative` >
  `div.grid.grid-cols-8` with the Time column of `div.h-[60px].border-b.border-slate-50.px-3.py-1`
  hourly cells + `span.text-xs.text-slate-400` labels in **"7 AM" format**
  (no leading zero, no minutes).
- Mobile (`md:hidden`): accordion day rows —
  `div.border-b.border-slate-100.last:border-b-0` >
  `button.w-full.flex.items-center.justify-between.p-4.hover:bg-slate-50` with
  a 40px `div.w-10.h-10.rounded-xl.bg-slate-100.text-slate-600` date chip
  (`text-xs` "Sun" + date) + day name + "N classes" + chevron.
- Week selector bar: `flex.items-center.justify-between.bg-white.rounded-xl.p-4.shadow-sm.border.border-slate-100`
  (the clone renders p-3) — "October 2026" `h2.font-semibold.text-slate-700`
  (16px) + "Oct 4 - Oct 10" `p.text-sm.text-slate-500`.
- **My Classes**: `div.bg-white.rounded-2xl.shadow-sm.border.border-slate-100.p-6`
  with header `div.flex.items-center.justify-between.mb-4` —
  `h2.text-lg.font-bold.text-slate-800` (18px) "My Classes" +
  `p.text-sm.text-slate-500` **today's long date** ("Wednesday, October 7") —
  then `div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-4` and the
  empty hint `p.text-center.text-slate-400.py-8` "No subjects added yet. Go to
  Settings to add subjects."

The clone renders: a `grid-cols-[60px_repeat(7,1fr)]` grid with compact
"Sun 4"-style headers (`text-xs uppercase`), 64px (h-16) hour rows in
"08:00 AM" format, no mobile accordion, and an sf-card My Classes with a
plain header (no today-date, header-only border-b).

**Fix:** rebuild the desktop grid to the grid-cols-8 spec — full day-name
headers (text-sm/500 + `text-lg font-bold` date), `h-[60px]` hour cells with
`border-b border-slate-50`, **"7 AM" time labels** (12h, trimmed hour),
`min-w-[900px]` inside `overflow-x-auto`; add the mobile accordion
(`md:hidden`) with 40px date chips + "N classes" + expand chevron; My Classes
header gains the today long-date + `p-6` body + the reference's empty hint
wording; week bar `p-3`→`p-4`. Keep Grid Builder, Week A/B alternation, and
class editing (superset).

**Verification:** e2e pins — day head contains "Sunday" + `text-lg` date,
hour cell height 60px, first time label matches /^(\d{1,2}) (AM|PM)$/, My
Classes h2 + today date string, mobile accordion visible at 375px.

### S7-D — HIGH · Analytics: the reference's four stat cards are icon-block cards with fraction values, and the charts are 7-day windows

**Evidence (measured on the reference):**

- Stat grid of `rounded-xl.bg-card.border-0.shadow-sm` cards (r12, **no
  border**), body `p-6` + `div.flex.items-center.gap-4` with a **48px
  `w-12.h-12.rounded-xl` colored icon block** + text stack
  (`p.text-sm.text-slate-500` label / `p.text-2xl.font-bold.text-slate-800`
  value / `p.text-xs.text-slate-400` sub):
  1. "Tasks Completed" — `square-check-big w-6 h-6` icon, bg violet-100
     `rgb(237,233,254)` text violet-600; value "0/2"; sub "0% completion rate"
  2. "Assignments" — `book-open`, bg blue-100 `rgb(219,234,254)` blue-600;
     "0/1"; "0% avg progress"
  3. "Focus Time" — `clock`, bg emerald-100 `rgb(220,252,231)` emerald-600;
     "0h"; "total study hours"
  4. "Upcoming Exams" — `graduation-cap`, bg orange-100 `rgb(255,237,213)`
     orange-600; "1"; "exams scheduled"
- Chart cards: `grid.lg:grid-cols-2.gap-6` of `rounded-xl.border.bg-card.shadow`
  cards, header `div.flex.flex-col.space-y-1.5.p-6` >
  `div.font-semibold.tracking-tight.text-lg.flex.items-center.gap-2` with a
  `trending-up w-5 h-5 text-violet-500` icon — titles **"Task Activity (Last
  7 Days)"** and **"Focus Time (Last 7 Days)"**; 7-day windows with day-name
  (Thu…Wed) axes.

The clone renders: `rounded-2xl border` stat cards (r16 + border) with corner
chips and different labels ("Completion Rate/of all tasks", "Focus This
Month", "Average Grade", "Active Work"), and 14-day chart windows with
different titles.

**Fix:** rebuild the four stat cards to the measured spec (48px icon blocks
in the reference's four tints; labels "Tasks Completed" X/Y + "N% completion
rate", "Assignments" done/total + "N% avg progress", "Focus Time" formatted +
"total study hours", "Upcoming Exams" count + "N exams scheduled"; r12
border-0 shadow-sm cards); retitle and re-window the two charts to
"Task Activity (Last 7 Days)" / "Focus Time (Last 7 Days)" (7-day day-name
axes); keep the clone's grade-trend and subject-distribution charts below as
superset. Icons accent-tinted via the existing STAT palette only where the
reference uses violet (the reference's four tints are per-card constants —
violet/blue/emerald/orange — measured, so they stay literal with palette pins
already in `@theme`).

**Verification:** e2e pins — stat labels + values ("Tasks Completed" with a
"/" value, sub "% completion rate"), icon-block bg `rgb(237,233,254)` etc.,
card radius 12px + border 0, chart title "Task Activity (Last 7 Days)".

### S7-E — LOW · Grade Tracker summary icons: award/target/chart-column at w-8 h-8, strokeWidth 2

**Evidence (measured):** reference summary cards — gradient card icon
`award w-8 h-8 mb-3 opacity-80`; "Total Grades" `target w-8 h-8
text-emerald-500 mb-3`; "Subjects Tracked" `chart-column w-8 h-8
text-blue-500 mb-3`; all strokeWidth 2. The clone renders `trending-up`,
`clipboard-list`, `award` at `h-6 w-6` strokeWidth 1.75 without mb-3.

**Fix:** swap to the measured icons/sizes/weights (award/target/chart-column,
`w-8 h-8 mb-3`, strokeWidth 2, gradient card `opacity-80`).

**Verification:** e2e pin — summary svgs carry `w-8 h-8` + the measured icon
names.

### S7-F — LOW · Notes editor title input: "Note title..." placeholder, bold intent

**Evidence (measured):** the reference's title input class list ends with the
author's intent `text-xl font-bold border-0 px-0 focus-visible:ring-0`
(placeholder "Note title...") — but the shadcn base's `md:text-sm` wins at
desktop, so it RENDERS 14px/700 (a platform CSS bug in the same family as the
gradient-button yellow text — documented non-gap). The clone renders 18px/600
with placeholder "Untitled".

**Fix:** align to the reference's unambiguous intent: placeholder
"Note title...", `text-xl font-bold` (20px/700), border-0 styling kept.

**Verification:** e2e pin — title input placeholder "Note title..." +
computed fontWeight 700.

---

## Audited NON-gaps (no action — do not re-chase)

| Suspect | Verdict |
|---|---|
| Reference Study Group creation | **Broken on the reference** (form fills, swatch picks, Create Group clicks, nothing persists — verified twice + reload). The clone's working group CRUD stays the superset. |
| Reference Practice Test creation | **Broken the same way** (AI questions generate, Create Test resets the dialog, nothing persists — verified + reload). The clone's working CRUD + test-taking flow stays the superset. |
| Reference mobile Flashcards layout | Keeps the fixed `w-80` sidebar — the detail pane is pushed off-screen at 375px (unreachable). The clone's responsive stacking is the better superset; keep. |
| Reference note-title renders 14px | The author's `text-xl font-bold` is overridden by the shadcn base `md:text-sm` (responsive variants win the cascade). Platform bug; the clone follows the intent (S7-F). |
| Gradient-button yellow text (S5) | Unchanged — clone keeps white text. |
| Reference dark mode | Still cosmetically broken on the reference (S6 VLM evidence); clone keeps complete dark mode. |
| Mobile drawer (standing priority) | Re-verified identical this session: 288px white `shadow-2xl` panel + `blur(4px)` backdrop + 20 links, both apps. |
| MyDay amber card + Suggestions (S6) | Re-verified present on the reference (`from-amber-50 to-orange-50` + border-amber-100 + Suggestions section). |
| AI Assistant quick modes | Same `p-4 bg-white rounded-xl border border-slate-200 hover:shadow-lg` cards, 32px icons, six modes; clone's accent-aware hover is the equivalent. GREEN. |
| Task menu / edit dialog (S6) | Reference Radix popovers/dialogs do not open under synthetic clicks (probed again this session); the S6 measurements + clone implementation stand. |
| Grade Tracker summary cards (structure) | `sf-gradient` + white bordered cards match the reference's gradient + `border-slate-200` cards; only icons differ (S7-E). |

---

## Execution order (TDD)

1. **RED (unit):** `tests/validation.test.ts` — deck `color` schema (hex
   string, default), flashcard `difficulty` (easy/medium/hard), practice-test
   `questions` (JSON array of `{question, type}` with the three types).
2. **Schema:** FlashcardDeck.color, Flashcard.difficulty, PracticeTest.questions
   → `db:push` (custom + e2e), `validation.ts`, `entities.ts`, `data.ts`,
   seed updates (a colored deck with difficulty-tagged cards; a practice test
   with generated-style questions).
3. **RED (e2e, written against the current build):**
   `tests/e2e/parity-session7.spec.ts` — pins for S7-A..S7-F as listed above.
4. **View reworks:** Flashcards (two-panel layout + dialogs + card grid +
   study mode) → Study Groups (swatch palette) + Practice Tests (dialog +
   questions + AI) → Timetable (grid-cols-8 week grid + mobile accordion +
   My Classes) → Analytics (stat cards + 7-day charts) → Grade Tracker icons
   → Notes title input.
5. **AI routes:** `/api/ai/generate-cards` + `/api/ai/generate-questions`
   (z-ai-web-dev-sdk, server-only, Zod-validated, auth-gated).
6. **Full gate:** `lint → typecheck → test → build → test:e2e`.
7. **Live re-verification** of every pin against the reference measurements,
   then the screenshot refresh (24 captures), VLM spot check of reworked views.
8. **Docs:** README/AGENTS/CLAUDE/PAD/SKILL + this plan's execution log;
   `worklog.md`; commit + push via the SSH wrapper.

---

## Execution log (post-plan addendum)

All fixes landed TDD-style: the 3 unit expectations were written first and
observed failing (deck color, card difficulty, practice-test questions),
then the schema/validation/entity/data layer, then the view reworks, then
green (99 unit). The 17 e2e parity pins in
`tests/e2e/parity-session7.spec.ts` were written against the reference
measurements and observed failing on the pre-remediation build (17 failed,
1 unrelated pass) before the component changes landed.

**Fixes as landed:**

| ID | Change | Files |
|---|---|---|
| S7-A | Flashcards rebuilt to the measured two-panel layout: `h-[calc(100vh-8rem)]` flex with a `w-80 border-r` sidebar (h1 + 36px gradient New Deck icon-button + inline-icon search + `space-y-2` deck rows `p-4 rounded-xl bg-slate-50 border-2 border-transparent` with 40px colored icon blocks, h3 names, `p.text-xs` counts); detail pane (h2 `text-xl font-bold` + AI Generate outline + Add Card gradient + Study gradient) + `md:grid-cols-2 lg:grid-cols-3` card grid (`rounded-xl border p-4 hover:shadow-md` cards, difficulty pills easy-emerald/medium-yellow/hard-red, hover-revealed h-7 edit/delete) + 3D study mode (`h-80 perspective-1000` flip, sRGB-exact violet→indigo front, white/violet-200 back, Exit Study, `h-10 px-8` chevron nav, mastered toggle); both dialogs reworked (swatch picker, "e.g., Biology Chapter 5" / "What's this deck about?" / "What do you want to remember?" / "The answer..." placeholders); **AI Generate** wired to the new `/api/ai/generate-cards` route (superset — verified live: 6 cards generated for "Mechanics recall") | `flashcards-view.tsx`, `schema.prisma`, `validation.ts`, `entities.ts`, `data.ts`, `seed.ts`, `api/ai/generate-cards/route.ts` |
| S7-B | Study Groups swatch palette corrected to the measured set (emerald-500 `#10b981`, amber-500 `#f59e0b`, red-before-pink order; `w-8 h-8` scale-on-select); Practice Tests dialog rebuilt to the measured layout (`grid-cols-2` Test Title * + Time Limit (minutes) default 60 + "N questions added" counter + AI Generate Questions + `max-h-60` scrollable `bg-slate-50 rounded-lg` question list with "Type:" labels + removable rows); manual question adder + Subject/Date kept as superset rows; **AI Generate Questions** wired to `/api/ai/generate-questions` (verified live: 10 questions for "Photosynthesis basics"); PracticeTest model + `questions` JSON + duration default 60 | `studygroups-view.tsx`, `practicetests-view.tsx`, `schema.prisma`, `validation.ts`, `entities.ts`, `data.ts`, `seed.ts`, `api/ai/generate-questions/route.ts` |
| S7-C | Timetable rebuilt: desktop week grid to the measured `grid-cols-8` spec (Time column `p-3 text-sm font-medium text-slate-500` + 7 day heads `p-3 border-l` with full day names + `text-lg font-bold` dates; `h-[60px] border-b border-slate-50` hour cells labelled **"7 AM"**-style; `min-w-[900px]` scroll canvas); NEW mobile accordion (`md:hidden` — border-b day rows, 40px rounded-xl date chips, "N classes", rotating chevron, expandable colored class rows); week-nav bar `p-3→p-4` + h2 16px + range `text-sm`; My Classes rebuilt to `p-6` + header row (h2 `text-lg font-bold` + today's long date) + 3-col grid + measured empty hint. **BONUS BUG FIX:** the week grid's column→ISO mapping was `(col+1)%7` — every column rendered two days ahead of its header (Tuesday's classes under "Sunday"); corrected to `(col+6)%7` | `timetable-view.tsx`, `tests/e2e/parity-session5.spec.ts` (S5-J header pin upgraded) |
| S7-D | Analytics rebuilt: four stat cards to the measured spec (`rounded-xl bg-white shadow-sm` r12 border-0 + `p-6` + 48px `w-12 h-12 rounded-xl` icon blocks — Tasks Completed (square-check-big, violet-100) "X/Y · N% completion rate", Assignments (book-open, blue-100) "X/Y · N% avg progress", Focus Time (clock, **green-100** — the measured tint) "total study hours", Upcoming Exams (graduation-cap, orange-100) "N exams scheduled"); chart cards retitled "Task Activity (Last 7 Days)" / "Focus Time (Last 7 Days)" with 7-day day-name axes + trending-up icon headers; grade-trend + subject-distribution kept as superset below | `analytics-view.tsx` |
| S7-E | Grade Tracker summary icons swapped to the measured set: award (`w-8 h-8 mb-3 opacity-80`) on the gradient card, target (emerald-500) on Total Grades, chart-column (blue-500) on Subjects Tracked; strokeWidth 2; `aria-label="Grade summary"` pin anchor | `gradetracker-view.tsx` |
| S7-F | Notes editor title input aligned to the reference's authored intent: placeholder "Note title...", `text-xl font-bold` (the reference itself renders 14px via its shadcn `md:text-sm` override — documented platform-bug non-gap) | `notes-view.tsx` |

**Palette pins (trap 2/10 family):** blue-100, emerald-100/600/700, green-100/600,
orange-100/600, yellow-100/700, pink-500, red-100/700 added to the `@theme` pin
block (incl. the green-100 `#dcfce7` fix for the measured Focus Time tint).

**Discoveries during execution:**

1. **The reference's Focus Time tint is green-100, not emerald-100** — the
   measured `rgb(220,252,231)` = `#dcfce7` = v3 green-100 (emerald-100 is
   `#d1fae5`). Pinned accordingly.
2. **A pre-existing week-grid misalignment (S7-C bonus fix):** the old
   `colToIso = (col+1)%7` mapping rendered every day column's classes two
   weekdays ahead of its header (Sunday's column carried Tuesday's classes).
   The full-day-name headers exposed it immediately; corrected to
   `(col+6)%7` with class-block + Grid-Builder placement verified.
3. **Reseeding under a running dev server corrupts session auth** — the
   server's Prisma client keeps the deleted SQLite inode open and
   intermittently 401s (mid-capture redirects to /login). Operation order:
   reseed → restart dev → capture.
4. **Long capture runs degrade a shared Chromium** under the 4 GB container
   ceiling — late-run locators time out. `capture-studyflow.mjs` now
   relaunches the browser every 7 views + before the mobile phase, and the
   Flashcards capture opens the seeded deck first (the view otherwise
   screenshots its "Select a deck" empty state).
5. **Radix popovers/dialogs on the reference do not open under synthetic
   DOM clicks** (re-probed this session) — the S6 menu/dialog measurements
   + clone implementations stand.
6. **`innerText` reflects `capitalize`** (S6 finding) applies to the
   difficulty pills — the pins read `textContent` ("medium"), not
   `innerText` ("Medium").

**Final gate (all green):** lint ✓ · typecheck ✓ · 99 unit ✓ · build ✓ ·
123 e2e ✓ (222 total = 123 prior-equivalent + 17 new parity pins − 0
removed; the S5-J timetable header pin was upgraded in place). Live
dev-server probes re-verified every measurement (deck row slate-50/r12 +
40px violet icon block, h2 20px detail + AI Generate/Add Card/Study, card
grid 3-col + difficulty pills, study mode gradient stops + 320px flip card +
working flip, timetable grid-cols-8 "Sunday/4" heads + 60px "7 AM" hour
cells + My Classes today date, analytics 4 tinted stat cards + 7-day chart
titles, grade tracker award/target/chart-column icons, group swatches
emerald/amber/red-pink order, practice-test dialog + 10 AI-generated
questions, 6 AI-generated deck cards). VLM review of the refreshed captures
confirms the two-panel Flashcards, the grid-cols-8 timetable, the tinted
analytics cards, the mobile drawer, and the grade-tracker icons.

**Screenshots:** all 24 captures refreshed via
`scripts/capture-studyflow.mjs` (login + 20 desktop views + 3 mobile) after
the reseed with color/difficulty/questions demo data; the Flashcards
capture now shows the populated deck detail + card grid.
