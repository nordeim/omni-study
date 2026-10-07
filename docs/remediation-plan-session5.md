# Remediation Plan — Session 5 Interactive-Chrome & View-Body Parity Audit

**Date:** 2026-10-07 (session 5)
**Scope:** Third-order re-audit of the StudyFlow clone against the live reference
(`https://omni-study1.base44.app`, authed as `sepnetflix2023@outlook.com`).
Sessions 1–4 closed the token-level gaps (palette, radius, shadow, mobile chrome,
text metrics, heading semantics, login card, gradient end-stops). This audit went
one level deeper: **interactive chrome and view bodies** — the buttons inside the
views, dialog/overlay chrome, form controls, and the full body layouts of the
views that were never DOM-audited (Events, FocusTimer, Settings Appearance,
Calculator keypad, Timetable, GradeTracker, Notes, Files, MyDay).

**Method:** dual logged-in agent-browser sessions (`ref` + `clone`, 1280×800),
computed-style + bounding-box probes on both apps side by side, plus a 20-view
screenshot survey with dominant-palette diffing and VLM verification of every
suspect surface. Every gap below was measured before being accepted. Raw probe
artifacts live in `/home/z/my-project/audit-s5/` (workspace, not committed).

---

## Audit baseline (all green at session start)

| Check | Result |
|---|---|
| `git pull` sync with `origin/main` | ✅ clean (merged remote `docs/session_4.md` @ 17e5c34) |
| `bun run lint` / `bun run typecheck` | ✅ exit 0 |
| `bun run test` (Vitest) | ✅ 87/87 |
| Dev server `/api/health` | ✅ `{"status":"ok","db":"up","app":"studyflow"}` |
| All session-4 pins (view headers, stat metrics, empty states, login card, blur-xs) | ✅ re-verified during the survey |

**Dominant-palette sweep (all 20 views, both apps):** 19/20 views are
light-on-light with no measurable body divergence at the palette level. **Events
is the outlier: 58.2% dark pixels in the reference vs 0.1% in the clone** — the
reference's Events view is a dark terminal-style panel that no prior session
DOM-audited (session 4 verified only its view header).

---

## Gaps found (fix list)

### S5-A — HIGH · Primary CTAs are SOLID violet; the reference renders a violet→indigo GRADIENT + shadow

**Evidence (computed on the reference, repeated across views):** every primary
CTA renders `background-image: linear-gradient(to right, rgb(139, 92, 246),
rgb(79, 70, 229))` (violet-500 → indigo-600 — the same end-stop family as the
S4-G brand-chip tokens) with the v3 `shadow` (`0 1px 3px / 0 1px 2px
rgba(0,0,0,0.1)`) on compact buttons and `shadow-lg` tinted
`rgba(139,92,246,0.25)` on empty-state CTAs. Measured on: Add Task (Tasks),
New Event, Add Class (Timetable), Add Assignment, Add Exam, New Note (Notes,
icon-only), Create Deck, Create Test, Create Group, Add Grade, Solve
(MathSolver), Create Event (dialog submit), Save Preferences (Settings), the
FocusTimer play button (64px circle), the Calculator `=` key, and the active
Calendar/FocusTimer mode pills. The clone renders all of these as solid
`bg-sf-primary` (`rgb(139,92,246)`).

**Pixel verification of the gradient:** sampled the reference's Add Task button
crop — background pixels run `(136,91,245)` → `(82,71,230)` left-to-right: a
real horizontal gradient, not a solid.

**Fix:** add a `gradient` variant to the shared Button + a small
`.sf-btn-gradient` helper for non-Button surfaces, routed through the EXISTING
accent tokens — `background-image: linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))`
(inline-style sRGB stops per trap 5 — v4 interpolates utility gradients in
oklab), white text, v3 `shadow` (compact) / tinted `shadow-lg` (empty-state
CTAs + FocusTimer play). Migrate every CTA listed above. Hover darkens both
stops (reference `hover:from-violet-600 hover:to-indigo-700` analog: darken
each token ~1 step via a hover rule).

**Verification:** e2e pin — the Tasks "Add Task" button computes a
linear-gradient containing both `rgb(139, 92, 246)` and `rgb(79, 70, 229)`;
unit tests pin the gradient CSS var pair stays intact.

### S5-A-NON-GAP — the reference's gradient-button TEXT renders YELLOW (platform bug; clone keeps white)

**Evidence:** the reference's gradient buttons compute `color: rgb(255, 255, 0)`
(broken `--primary-foreground` on the Base44 platform — it also leaks cyan
`rgb(34, 211, 238)` on the Events "New Event" link). **Pixel-verified:** the
Add Task crop contains 180 yellow-ish glyph pixels (`(221, 210, 65)` cores)
vs 21 white; VLM on a 4× zoom answers "The text on the button is yellow."
The design intent (and every non-broken reference surface) is white-on-gradient.
**Decision:** the clone renders WHITE text (documented non-gap, same family as
the "AcademiaFlow (Copy)" title artifact and the broken reference accent
picker). Pixel evidence retained in the audit artifacts.

### S5-B — HIGH · Events view body: the reference is a DARK terminal-style panel; the clone is a light 7-day-strip design

**Evidence (full DOM tree measured):** the reference's Events body is ONE panel
`bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl w-full`
(956×473, r16):

- Header `p-4 border-b border-slate-700`: `P.text-xs text-slate-400 uppercase
  tracking-wider` "EVENTS" + right-aligned `flex items-center gap-1` with FOUR
  24px icon buttons (chevron-left, circle/today, chevron-right, chevron-down).
- Date block `flex items-baseline gap-2`: `SPAN.text-4xl font-bold` day number
  ("7") + `SPAN.text-lg font-medium` weekday ("Wed") + `P.text-sm
  text-slate-400` "Oct 2026 CW 41" (ISO calendar-week).
- "New Event" button: `h-9 px-4 py-2 w-full mt-3 justify-start rounded-md
  text-cyan-400 hover:text-cyan-300 hover:bg-slate-800` + 16px calendar svg.
- Day list `max-h-[calc(100vh-400px)] min-h-[300px] overflow-y-auto`:
  sections `border-b border-slate-800 last:border-b-0` with header
  `px-4 py-2 bg-slate-800/50` (`H3.text-sm font-semibold text-slate-300`
  "Today" / "Tomorrow" / "Friday, October 9" … 7 days) and body `p-2` with
  empty `P.text-sm text-slate-500 px-2 py-3` "No events".

Also: the reference's view **h1 is "Events & Reminders"** (clone renders
"Events"; subtitle matches). The reference's create-event is BROKEN (Create
clicks close the dialog, nothing persists, no toast, survives reload) — the
clone keeps its working CRUD (superset).

**Fix:** rebuild `events-view.tsx`'s body to the measured dark-panel spec
(dark-mode-safe: the panel is dark in both themes by design). Day/week
navigation via the four header buttons (prev day / today / next day / native
date-picker behind the chevron-down — honest superset). Event rows (not
measurable on the reference — 0 events, broken create) render INSIDE the dark
sections with a dark-theme row design: white title, `text-slate-400` time
range, subject color dot, hover `bg-slate-800/60`. Keep all clone CRUD flows.
Update the view title to "Events & Reminders".

**S5-B2 (superset extension): the reference's event dialog field set.**
Measured: Title*, Location / Link, Description, Start + End (datetime-local),
Repeat combobox ("No repeat"), Reminders (Add button + `15` +
`minutes`-combobox + "before", multi-add), Color (6 swatches), Create Event.
**Fix:** extend the Prisma `Event` model with `location String?`,
`repeat String` (none/daily/weekly/monthly), `reminders String` (JSON minutes
array — display + honor the first via `setTimeout`-based toast while the view
is open), align the dialog to the reference layout, keep the clone's date/time
inputs. Schema + validation + seed + e2e db re-push.

**Verification:** e2e pins — panel bg `rgb(15, 23, 42)`, "EVENTS" label
present, big day number renders, cyan New Event button, day-section headers
slate-300; title h1 "Events & Reminders".

### S5-C — MEDIUM · Dialog chrome: radius, width, inputs, labels diverge

**Evidence (reference "New Event" dialog vs clone):**

| Aspect | Reference | Clone |
|---|---|---|
| Width | 448px (`max-w-md`) | 512px (`max-w-lg`) |
| Radius | **8px** (`rounded-lg`) | 16px (`rounded-2xl`) |
| Inputs | `h-9` 36px, `bg-transparent`, border `rgb(229,229,229)` (v3 gray-200) | `h-10` 40px, white bg, zinc border |
| Textarea | `min-h-[60px]` | 80px |
| Labels | `text-sm font-medium`, default foreground | + `text-slate-700` tint |
| Submit | gradient h-9 (see S5-A) | solid violet |

**Fix:** `src/components/ui/dialog.tsx` content → `rounded-lg` + `max-w-md`;
`input.tsx` base → `h-9 bg-transparent` + gray-200 border (login's h-12/r12
classes override as today — S4-F pins stay green); `label.tsx` → default color;
textarea `min-h-[60px]`.

**Verification:** e2e pin — dialog radius 8px, width ≤448+ε, first input
height 36px.

### S5-D — MEDIUM · Form-control palette: the reference uses v3 GRAY, the clone uses zinc; outline buttons lost their shadow-sm

**Evidence (measured on Grid Builder, New Folder, History, Upload Image, Clear,
Settings/Calculator tabs, All Notebooks/All Tags selects):**

| Token | Reference | Clone |
|---|---|---|
| Outline/secondary text | `rgb(10, 10, 10)` (gray-950) | `rgb(9, 9, 11)` (zinc-950) |
| Outline/select border | `rgb(229, 229, 229)` (gray-200) | `rgb(228, 228, 231)` (zinc-200) |
| Inactive tab text | `rgb(115, 115, 115)` (gray-400) | `rgb(113, 113, 122)` (zinc-400) |
| Outline button shadow | v3 `shadow-sm` (`0 1px 2px rgb(0 0 0 / 0.05)`) | none |
| Select placeholder | gray-400 | zinc-400 |

**Fix:** pin the v3 gray scale in `@theme` (200 `#E5E5E5`, 300 `#D4D4D4`, 400
`#737373`, 500 `#6B7280`, 950 `#0A0A0A`) if absent; swap Button
outline/secondary/ghost, Select trigger, and Tabs variants to gray + add the
pinned `shadow-sm` to outline/secondary. Views keep slate (the reference uses
slate for view text/borders — verified).

**Verification:** e2e pin — Timetable "Grid Builder" border `rgb(229, 229,
229)`, text `rgb(10, 10, 10)`, shadow non-zero.

### S5-E — HIGH · FocusTimer: full body redesign to the reference layout

**Evidence (full tree measured; clone diverges everywhere):**

| Element | Reference | Clone |
|---|---|---|
| Header | CENTERED `text-3xl` + 32px icon + centered subtitle, `max-w-2xl` column | left-aligned ViewHeader lg |
| Stats | `grid grid-cols-3 gap-4` cards `bg-white rounded-xl p-4 text-center border border-slate-100` (24px icon, `text-2xl`/700 value, `text-xs` label): "0 Pomodoros" / "0h 0m Today" / "0 Sessions" | "Today's Sessions" list card |
| Main card | `bg-white rounded-3xl p-8 shadow-xl border border-slate-100` | sf-card r16 |
| Mode buttons | `px-4 py-2 rounded-xl text-sm font-medium` h36 r12; active = GRADIENT + shadow-lg + white | h32 r6; active solid |
| Ring | **256px** (`w-64 h-64`), circles r=120 sw=8; track `rgb(241,245,249)`, progress = SVG `url(#gradient)` stroke | 220px r=110 |
| Time | `text-5xl font-bold text-slate-800 font-mono` (48px) + mode label below | (smaller) |
| Controls | THREE round buttons: reset 48px white, play **64px gradient circle**, skip 48px white (`rounded-full`) | pill buttons row |
| Subject row | `mt-8 pt-6 border-t` + shadcn Select h-9 flanked by 40px `volume2` + `settings2` icon buttons | Select only |
| Progress dots | 4× `w-3 h-3 rounded-full bg-slate-200` (cycle dots) | none |
| Presets | TWO-LINE buttons `px-6 py-3 rounded-xl` 64px tall: `P.font-semibold` name + `P.text-xs opacity-70` durations; active `bg-violet-100` | small text buttons |

**Fix:** rework `focustimer-view.tsx` to this layout. The progress ring uses an
SVG `<defs><linearGradient>` wired to the accent tokens (both stops via CSS
vars on the svg element). The two 40px buttons become REAL superset features:
`volume2` = working completion-chime mute toggle (WebAudio oscillator), and
`settings2` = a small popover (chime on/off already covered; add auto-start
breaks toggle). The 4 dots show the pomodoro cycle position (long-break
interval = 4, standard). Keep the drift-free engine + session logging + the
Today stats derived from focus sessions.

**Verification:** e2e pins — ring 256px, play button 64px round with gradient,
mode buttons r12/h36, presets 64px two-line, 3 stat cards present.

### S5-F — HIGH · Settings Appearance: theme cards, swatch sizes, avatar buttons, swatch colors

**Evidence (measured):**

| Element | Reference | Clone |
|---|---|---|
| Theme selector | THREE 88px-tall cards `flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2` (24px icon + `text-sm font-medium` label); selected = `border-violet-500 bg-violet-50`; unselected = `border-slate-200 hover:border-slate-300` | 36px pill toggle buttons; System solid violet |
| Accent swatches | `w-12 h-12 rounded-xl` (48px, r12), selected = `ring-2 ring-offset-2 ring-slate-400 scale-110`; plain `transition-transform hover:scale-110` | 40px with check icon + white text |
| Swatch colors | blue `59,130,246` · **green `16,185,129` (emerald-500)** · **orange `245,158,11` (amber-500)** · pink `236,72,153` · red `239,68,68` · teal `20,184,166` | blue ✓ · green `34,197,94` (green-500) · orange `249,115,22` (orange-500) |
| Avatar buttons | `w-12 h-12 rounded-xl text-2xl`; selected = `bg-violet-100 ring-2 ring-violet-500 scale-110`; unselected `bg-slate-100 hover:bg-slate-200` | 40px transparent |
| Save | "Save Preferences" gradient h-9 w185 | (check) |

**Fix:** rework the Appearance tab to the card/selectors spec; **migrate the
green accent to the emerald family and orange to the amber family** in
`theme.ts` (primary/strong/deep/soft/softest/gradientTo/avatar/empty pairs) so
the swatch face equals the applied accent; keep the 14-var completeness pins
(unit tests updated first — RED).

**Verification:** e2e pins — theme cards 88px with 2px border + selected
violet-50 bg; swatch 48px; unit pins — emerald/amber token values.

### S5-G — MEDIUM · Calendar view-switcher is a bordered segmented control

**Evidence:** reference = `flex items-center gap-2 bg-white rounded-lg border
border-slate-200 p-1` container; tabs h32 text-**12px**; active "Calendar" =
solid violet bg + white text; inactive "Timeline" = gray-950 on white. Clone =
two 36px white pills, 14px text.

**Fix:** `calendar-view.tsx` mode switch → the segmented spec (12px text).

**Verification:** e2e pin — container border + p-1 + active tab bg
`rgb(139, 92, 246)`.

### S5-H — MEDIUM · Calculator: keypad layout, key colors, display gradient

**Evidence (reference, full grid dump):** card `bg-white rounded-2xl border
border-slate-200 shadow-lg overflow-hidden`, `max-w-md mx-auto`. Display area
`bg-gradient-to-br from-violet-50 to-indigo-50 p-6` (h120) with value
`text-4xl font-bold text-slate-800 mt-2 break-all` (36px/700) — right side
holds the value; keypad area `p-4 bg-slate-50`. Keys 98×56 r6 18px/600:
**18-key grid — row 1: `Clear` (white bg, red-600 text) + `⌫` (lucide-delete
icon, gray-950) + TWO EMPTY cells**; rows: 7 8 9 ÷ / 4 5 6 × / 1 2 3 − / 0 . = +
  ; digits white bg slate-700 text; operators (÷ × − +) slate-700 bg white
text; `=` GRADIENT bg white text (normal span); minus key is ASCII "-"
(codepoint 45, clone renders U+2212). The clone has a `%` key the reference
lacks, `C` instead of "Clear", `=` solid + col-span-2, and 80px keys.

**Fix:** rework the Basic keypad to the 18-key spec (drop the % key — the
engine still accepts `%` via typed input; `C` → "Clear" red-600; `=` gradient
normal span; ASCII "-" label). Display → gradient + 36px/700 value. Key width
follows the card (max-w-md).

**Verification:** e2e pins — 18 keys, Clear text + red color, `=` gradient,
empty row-1 cells (grid item count), display bg gradient.

### S5-I — LOW · MyDay quick-add row

**Evidence:** reference = bare `form.mb-6` > `flex gap-3`: input `h-48 r-12`
placeholder "Add a task for today..." + "More Options" outline button (h48,
w127, white/gray-200). Clone = an sf-card wrapper, input h40 r6, icon buttons.
The clone's empty-state greeting ("Good morning!") already matches.

**Fix:** bare flex row, `h-12 rounded-xl` input, text "More Options" button
(expands the clone's extra fields — keep superset behavior).

**Verification:** e2e pin — input height 48px r12 on MyDay.

### S5-J — MEDIUM · Timetable: week-nav bar, All Weeks select, day headers, My Classes grid

**Evidence:** the reference has (1) a separate week-nav bar `bg-white
rounded-xl` (h78): 36px round prev/next + centered "October 2026" +
"Oct 4 - Oct 10" week-range; (2) an "All Weeks" **Select** in the header row
(options measured: **All Weeks / Week A / Week B** — alternating-week
timetables); (3) week-grid day headers carry date numbers ("Sunday 4",
"Monday 5"); (4) "My Classes" = `grid-cols-1 md:grid-cols-2 lg:grid-cols-3
gap-4` CARDS (empty: "No subjects added yet. Go to…" `text-center
text-slate-400 py-8`). The clone has a card-header month nav, no week-type
select, plain day headers, and a LIST layout.

**Fix:** rework `timetable-view.tsx`: standalone week-nav bar; add `weekType`
to the Prisma Timetable model (`ALL|A|B`, default ALL) + select filter +
class-dialog week-type field (superset feature the reference controls imply);
day headers with date numbers; My Classes as a 3-col card grid.

**Verification:** e2e pins — nav bar present with week-range text, All Weeks
select options, My Classes grid cards.

### S5-K — MEDIUM · Files: breadcrumb, segmented view toggle, section label, toolbar shape

**Evidence:** reference breadcrumb = `text-sm` plain buttons `flex items-center
gap-1 hover:text-violet-600` (h20); filter row = search (flex-1) + "All Types"
Select (160×36) + **segmented view toggle** `flex border border-slate-200
rounded-lg overflow-hidden` (74×38, two icon buttons inside); section micro-
label `P.text-xs font-semibold text-slate-500 uppercase mb-3` "Files"; toolbar =
New Folder (outline) + Upload (gradient) only. Clone: breadcrumb pills, two
separate toggle buttons, three buttons (incl. "Add Link"), no section label.

**Fix:** text-link breadcrumbs; segmented bordered toggle; add the "Files"
micro-label; demote Add Link to an icon-only outline button (36px, Link2 icon,
aria-label) so the toolbar reads New Folder / [+link] / Upload — superset kept,
visual noise minimized.

**Verification:** e2e pin — segmented toggle container border; breadcrumb
button height 20px; label text present.

### S5-L — MEDIUM · Notes: left-pane structure

**Evidence:** reference left pane (`w-80`, `border-r border-slate-100 pr-6`):
title row "Notes" + **gradient icon-only "+" button** (36px); search; **"All
Notebooks" + "All Tags" as two SELECTS side-by-side** (shadcn h-9, flex gap-2);
list `flex-1 overflow-y-auto space-y-4`; right pane "Select a note" empty
state. Clone: different toolbar (New Notebook text button) and single-select
filters.

**Fix:** restructure to the measured layout (New Note = gradient icon button;
notebook + tag SELECTS; keep the clone's notebook model + editor).

**Verification:** e2e pin — left pane width 320px, two comboboxes, gradient
icon-only button.

### S5-M — MEDIUM · GradeTracker: three stat cards, first is a gradient card

**Evidence:** reference = `grid` of 3: card 1 `bg-gradient-to-br
from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-*` (24px white
icon + `P.text-sm opacity-90` "Overall Average" + `P.text-4xl font-bold mt-2`
"0%"); cards 2–3 `bg-white rounded-2xl p-6 border border-slate-200` with
COLORED 24px icons (emerald "Total Grades", blue "Subjects Tracked") +
`text-sm text-slate-500` labels + `text-4xl` slate-800 values. Clone = 4 white
cards (Overall / Best Subject / Total Grades / Passing) 227×154.

**Fix:** 3-card row to the reference spec; the clone's "Best Subject" and
passing stats fold into the existing subjects table/charts below (kept data,
matched chrome).

**Verification:** e2e pin — first card background-image gradient + white text;
3 cards.

### S5-N — LOW · AI Assistant quick-action cards + chat footer

**Evidence:** reference quick actions = `p-4 bg-white rounded-xl border
border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all
text-left group` (308×102): 32px violet icon + `H3.font-semibold
text-slate-800` (16px/600) ONLY. Chat footer: textarea (60px, "Ask me
anything...") + 60px send button + `P.text-xs text-slate-400 mt-2` "Press
Enter to send, Shift + Enter for new line". The clone's h1 ("AI Study
Assistant") already matches. Clone cards: 36px chip + title + description
(123px); textarea 44px; no hint.

**Fix:** card internals → 32px icon + title (drop the descriptions); footer →
60px textarea + send + the hint line.

**Verification:** e2e pin — quick-action h3 16px/600, no description paragraph;
hint text present.

---

## Audited NON-gaps (no action — do not re-chase)

| Suspect | Verdict |
|---|---|
| Gradient-button text computes `rgb(255,255,0)` (yellow) / Events link cyan `rgb(34,211,238)` | Base44 platform bug (broken `--primary-foreground`); pixel-verified yellow glyphs. The clone renders white text — design intent. Evidence in S5-A-NON-GAP. |
| Reference create-event closes the dialog but persists nothing (no toast, survives reload) | Reference feature is broken; the clone's working CRUD is the superset. Event-row design is therefore not measurable — the clone's dark-theme row design is the documented decision. |
| Reference account is data-empty (Tasks 0, Events 0, Notes 0, …) | Row/card designs for populated lists can't be re-measured; the clone's existing audited row designs carry forward. The "0" counts in the reference's filter buttons are data, not chrome. |
| Dashboard "Start My Day" CTA | Already gradient + tinted shadow-lg since S4-G (both tinted layers measured `rgba(139,92,246,0.25)`); re-verified GREEN. |
| AI Assistant view title | Already "AI Study Assistant" (the S4-D table row listed the sidebar label). |
| MyDay empty-state greeting | Already time-aware "Good morning! / What would you like to accomplish today?" — matches. |
| MyDay header, all 20 view headers, stat cards, empty states, login card, mobile chrome, sidebar | Re-verified GREEN at session start (survey + spot probes). |
| `oklab/lab` serialization family | Existing trap 7 — e2e assertions already accept both serializations. |

---

## Execution order (TDD)

1. **RED (unit):** `tests/theme.test.ts` — emerald/amber accent migrations + the
   14-var set stays complete; `tests/validation.test.ts` — Event
   location/repeat/reminders + Timetable weekType schemas.
2. **RED (e2e, written first against the current build):** S5 pins — gradient
   CTA (Tasks), dialog chrome (radius 8 / ≤448px / 36px inputs), outline
   button gray+shadow-sm (Grid Builder), Events dark panel + title, FocusTimer
   (ring 256 / play 64 gradient / presets two-line / 3 stat cards), Settings
   (theme cards 88px / 48px swatches), Calendar segmented tabs, Calculator
   (18-key / Clear red / = gradient / display gradient), MyDay input 48/12,
   Timetable (week bar + All Weeks options + My Classes grid), Files
   (breadcrumb 20px + segmented toggle + label), GradeTracker (gradient first
   card), Notes (two selects + icon button), AI (quick-action h3 + hint).
3. **Foundations:** Button `gradient` variant + outline/secondary gray +
   shadow-sm; Input h-9/transparent/gray; Dialog rounded-lg + max-w-md; Label;
   Select trigger gray; Tabs gray; `@theme` gray pins.
4. **theme.ts:** emerald/amber accent migrations (token pairs × all vars).
5. **Schema:** Event.location/repeat/reminders + Timetable.weekType → db:push
   (custom + e2e), seed + validation updates.
6. **View reworks (biggest first):** Events (dark panel + dialog) → FocusTimer →
   Settings Appearance → Calculator → Timetable → GradeTracker → Notes → Files
   → Calendar tabs → MyDay → AI cards.
7. **Full gate:** `lint → typecheck → test → build → test:e2e`.
8. **Live re-verification** of every pin against the reference measurements
   (dual-browser probes), then screenshot refresh (24 captures), VLM spot
   check.
9. **Docs:** README/AGENTS/CLAUDE/PAD/SKILL + this plan's execution log;
   worklog.md; commit + push via the SSH wrapper.

---

## Execution log (post-plan addendum)

All fixes landed TDD-style: the unit expectations were updated first and
observed failing (6 RED: emerald/amber tokens, 15-var set, event fields,
weekType), then the foundations, then the view reworks, then green. The 19
e2e parity pins in `tests/e2e/parity-session5.spec.ts` were written against
the reference measurements and observed failing on the pre-remediation
build before the component changes landed.

**Fixes as landed:**

| ID | Change | Files |
|---|---|---|
| S5-A | `gradient` Button variant (`sf-gradient` + `sf-gradient-shadow`, sRGB-exact stops through `--sf-primary`/`--sf-primary-gradient-to`, hover via the new `--sf-primary-gradient-to-strong` token) applied to every primary CTA (Add Task/Class/Assignment/Exam/Grade, New Note/Event, Create Deck/Test/Group, Solve, Save Preferences, dialog submits, AI send, `=` key, FocusTimer play); empty-state CTAs use the accent-tinted `.sf-gradient-shadow-lg` | `button.tsx`, `globals.css`, `theme.ts`, 12 view files |
| S5-B | Events body rebuilt to the dark terminal panel (slate-900 rounded-2xl shadow-2xl, EVENTS label + 4 nav buttons, big date + CW 41 label via new `isoWeekNumber`, cyan New Event link, 7 day sections with slate-800/50 headers, year-less section labels); working CRUD rows render inside the dark sections; day/prev/today/next navigation + a native date picker behind the chevron-down | `events-view.tsx`, `date.ts` |
| S5-B2 | Event model + dialog extended: `location`, `repeat` (none/daily/weekly/monthly — occurrences EXPAND into the 7-day window), `reminders` (JSON minutes array, multi-add UI, toast fires while the view is open); 6-swatch color picker (reference-measured count) | `schema.prisma`, `validation.ts`, `entities.ts`, `data.ts`, `events-view.tsx`, `seed.ts` |
| S5-C | Dialog → `max-w-md` + `rounded-lg` (448px / 8px measured); Input → `h-9 bg-transparent`; Textarea → `min-h-[60px]`; Label → default foreground (no slate tint) | `dialog.tsx`, `input.tsx` |
| S5-D | The shadcn base palette migrated zinc→GRAY (`--foreground` gray-950, `--input`/`--border` gray-200, `--muted-foreground` gray-400) + gray scale pinned in `@theme`; Select trigger → transparent bg; outline buttons keep the pinned v3 `shadow-sm` | `globals.css`, `select.tsx` |
| S5-E | FocusTimer rebuilt: centered 30px title + 32px icon, 3 stat cards (Pomodoros/Today/Sessions), rounded-3xl shadow-xl main card, h9/r12 gradient-active mode pills, 256px ring (r120 sw8, SVG gradient stroke via `<linearGradient>`), 48px mono time, 48/64/48 round controls, subject select flanked by working volume (WebAudio chime) + auto-breaks settings buttons, 4 cycle dots, two-line 64px presets | `focustimer-view.tsx` |
| S5-F | Settings Appearance rebuilt: 88px border-2 theme cards (selected = accent border + softest tint), 48px swatches with ring+scale selection (check icon removed), 48px text-2xl avatar tiles (selected = soft tint + accent ring + scale), gradient Save; green→EMERALD and orange→AMBER accent migrations so the swatch face equals the applied accent | `settings-view.tsx`, `theme.ts` |
| S5-G | Calendar mode switch → bordered segmented control (white/rounded-lg/p-1, 12px tabs, active = solid accent) | `calendar-view.tsx` |
| S5-H | Calculator rebuilt: card `rounded-2xl border-slate-200 shadow-lg max-w-md`, display = `.sf-calc-display` softest gradient + 36px/700 value, slate-50 keypad tray, 2-col Clear(red-600)/⌫(lucide-delete) row + 4×4 grid, operators slate-700, `=` gradient, ASCII "-", % key dropped (engine still accepts typed %) | `calculator-view.tsx`, `globals.css` |
| S5-I | MyDay quick-add → bare `flex gap-3` row: h-12 rounded-xl input + "More Options" outline + gradient add | `myday-view.tsx` |
| S5-J | Timetable rebuilt: standalone week-nav bar (36px round outline buttons + month + week range), All Weeks/Week A/Week B select + `weekType` model field + class-dialog Week select, Sunday-first day headers with date numbers, My Classes as a 1/2/3-col card grid with week badges | `timetable-view.tsx`, `schema.prisma`, `validation.ts`, `entities.ts`, `data.ts`, `seed.ts` |
| S5-K | Files: text-link breadcrumb (h20, hover accent), segmented rounded-lg view toggle, "Files" micro-label, Upload → gradient, Add Link demoted to icon-only outline (superset kept) | `files-view.tsx` |
| S5-L | Notes: reference two-pane layout (w-80 border-r left pane with title row + icon-only gradient New Note + folder-plus, search, side-by-side All Notebooks/All Tags selects, space-y list; editor right; mobile stacked fallback) | `notes-view.tsx` |
| S5-M | GradeTracker: 3 stat cards — first a full `sf-gradient` card ("Overall Average", white text), then white cards (Total Grades/emerald icon, Subjects Tracked/blue icon); Best-subject + passing stats fold into the By-Subject summary line | `gradetracker-view.tsx` |
| S5-N | AI quick actions → 32px accent icon + 16px/600 title (descriptions dropped); chat card → rounded-2xl min-h-500; composer → 60px textarea + 60px gradient send + the Enter/Shift+Enter hint line | `aiassistant-view.tsx` |

**Discoveries during execution:**

1. **Unpinned palette colors serialize as `lab()`** — `text-cyan-400`
   computed as `lab(76.6045 -40.9406 -29.6231)` and `text-red-600` as
   `lab(48.4493 77.4328 61.5452)` in Chromium (v4's oklch defaults). Pinned
   `cyan-300/400` + `red-600` in `@theme` (trap 2/7 family) so the Events
   panel's cyan link and the Calculator's red Clear compute as exact rgb().
2. **Modern `rgb(0 0 0 / 0.1)` box-shadow syntax serializes as
   `rgba(0, 0, 0, 0.1)`** — the e2e pins accept the rgba form (trap 7 family,
   now documented in AGENTS.md).
3. **`getByRole({ name })` is case-insensitive AND substring-based** —
   "New note" also matched the "New notebook" button (strict-mode violation);
   "Add Link" collided with "Add link". The pins use `exact: true`.
4. **getByLabel only resolves controls with a real label association** — the
   Reminders label wraps a control GROUP; the pin asserts its text instead.
5. **SQLite keeps serving a deleted file via the open handle** — reseeding
   `db/custom.db` under a running dev server changes nothing until the server
   restarts (the daemonizer restart releases the stale inode).
6. **The reference's keypad row 1 is a SEPARATE 2-col grid** (Clear + ⌫ at
   half width) followed by the 4×4 grid — the DOM order probe initially
   suggested 18 keys in one grid.

**Final gate (all green):** lint ✓ · typecheck ✓ · 93 unit ✓ · build ✓ ·
91 e2e ✓ (184 total = 72 prior + 19 new parity pins). Dev-server probes
re-verified every fix against the reference measurements
(Add Task gradient + v3 shadow byte-identical, dialog 448px/8px/36px, Events
panel slate-900 + CW 41 + populated sections, FocusTimer ring 256/play
64/dots 4, Calculator Clear 203px red-600 + display gradient + 448px card);
VLM review of the refreshed captures confirms the Events dark panel, the
FocusTimer layout, and the Settings appearance cards.

**Screenshots:** all 24 captures refreshed via
`scripts/capture-studyflow.mjs` (login + 20 desktop views + 3 mobile).
