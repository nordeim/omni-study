# Remediation Plan — Session 17 (S17): the fresh-user journey — zero-data empty states + the Settings depth

**Audit surfaces (from `docs/session_24.md`'s suggested next batch + this
briefing's parity mandate):** (a) the reference's account was re-provisioned
empty on 2026-09-28 ("Account created: 9/28/2026" — zero subjects/tasks/
exams), which makes the reference's **zero-data empty states** measurable
for the first time (S6 measured populated states; S9 measured
partially-empty ones); (b) the reference's **Settings tab content** — the
Profile/Subjects/Holidays/Notifications tab bodies were never DOM-audited
(S5/S8/S9 pinned the Appearance cards, tab-list chrome and tab icons only);
(c) the standing mobile-drawer check (GREEN on arrival — unchanged since
S14). The session-24 branding question is also settled (see non-gaps).

**Method.** Playwright sweeps over BOTH apps logged in — the reference with
its (now empty) account, the clone with freshly-registered+verified
accounts (the register API surfaces the 6-digit code — ADR-013). The
leftover S15/S16 probe rows on the reference ("Audit test task one",
"Audit task with meta", "Audit assignment one", "Audit midterm",
"Audit Biology Deck") were deleted via the reference's own UI first so the
reference measures its TRUE zero state; its account retains benign profile
values set while measuring the save flow (school "Lincoln High", grade
"9th Grade", goal 4h, notifications on — restored). The reference's User
entity shape captured from its own network traffic (`PUT …/entities/User/me`).

---

## Evidence (measured, both apps, fresh/zero state)

### A. The Settings five-tab content (never previously audited)

| Tab | Reference (measured) | Clone today | Verdict |
|---|---|---|---|
| Profile | header "Your account and study information"; avatar + name + email; **School Name** input (placeholder "Your school..."); **Grade Level** select — 12 options: 6th–12th Grade, College Freshman/Sophomore/Junior/Senior, Graduate; **Daily Study Goal** slider 1–12h (default 4, label "Daily Study Goal: 4 hours"); **Save Profile**; static "**Account created: 9/28/2026**" | display-name input + Save profile + Sign out (the S14 surface) — none of the study-profile fields | **GAP (A1, functional)** |
| Notifications | header "Manage your notification preferences"; **Enable Notifications** master toggle + hint "Receive reminders for tasks and assignments"; **Save Preferences** — persisted as `notifications_enabled` | 4 local-only detail rows + a muted note; no master toggle, nothing persisted | **GAP (A2)** |
| Subjects | header "Manage your subjects and classes"; zero-empty state "**No subjects yet. Add your first subject to get started!**" | no header; no zero-empty state | **GAP (A3)** |
| Holidays | headers "**Holidays & Breaks**" + "Set your school holidays and breaks"; zero-empty state "**No holidays set. Add your school holidays!**" | no headers; no zero-empty state | **GAP (A4)** |
| Appearance | first line "**Customize how StudyFlow looks**" | absent | **GAP (A5, minor)** |

The reference's persisted User entity (its own PUT body, captured live):

```json
{"theme":"dark","accent_color":"#8b5cf6","avatar":"🎓",
 "notifications_enabled":true,"study_goal_hours":4,
 "grade_level":"9th Grade","school_name":"Lincoln High"}
```

### B. Zero-data empty states (fresh registration on both apps)

| View | Reference (measured) | Clone today | Verdict |
|---|---|---|---|
| Dashboard | greeting / stats grid ("Today's Progress 0/0 tasks completed · Pending Tasks 0 · Due Soon 0 · Focus Time 0h") / "No tasks for today. Add some from My Day!" / "No upcoming exams" / "No upcoming assignments" | **exact match** (verified line-for-line) | parity ✓ |
| Analytics | **stat cards ALWAYS render** (0/0 · "0% completion rate", 0/0 · "0% avg progress", 0h · "total study hours", 0 · "exams scheduled") + charts' "No subject data yet" + priority "No active items" | `!hasAnyData` gates the stat cards behind a "No data yet / Complete tasks…" EmptyState | **GAP (B1)** |
| Grade Tracker | **stat cards only** (0% / 0 / 0) — NO empty-state block | EmptyState "No grades yet / Add your first assessment score…" INSTEAD of the stat cards | **GAP (B2)** |
| Tasks | "No tasks yet / **Create your first task to get started** / Create Task" | no hint line | **GAP (B3)** |
| Notes | "No notes yet / **Create your first note** / New Note" (+ right pane "Select a note / Choose a note from the sidebar or create a new one" ✓) | no hint line (left pane) | **GAP (B4)** |
| Assignments | "No assignments yet / **Add your first assignment to start tracking**" | hint "…start tracking coursework." (extra word + period) | **GAP (B5)** |
| Exams | "No exams found / **Add your exams to start tracking**" | hint "Add your first exam to start preparing in good time." | **GAP (B6)** |
| Flashcards | "No decks yet / **Create your first flashcard deck**" (+ right pane ✓) | hint carries a trailing period | **GAP (B7, trivial)** |
| Practice Tests | "No practice tests yet / **Create your first practice test**" | hint "…to check what you really know." (invented tail) | **GAP (B8)** |
| Files | "No files yet / **Upload your first file to get started**" | hint "Upload a file, add a link, or create a folder to get started." | **GAP (B9)** |
| Study Groups (mobile 390px) | BOTH panes stacked: left "No study groups / **Create a group to collaborate**" + right "Select a group / Choose a study group from the sidebar or create a new one" | the `lg:hidden` fallback renders "Create a group to plan meetings and keep everyone on track." (invented) and no right-pane placeholder | **GAP (B10, mobile-only)** |
| MyDay / Calendar / Events / Timetable / Calculator / MathSolver / AIAssistant / FocusTimer | — | — | parity ✓ (S9-B and standing pins) |

### Non-gaps (documented, do not fix)

1. **The greeting "there" flash.** The reference's greeting reads
   "Good evening, there 👋" on the first paint and settles to
   "Good evening, sepnetflix2023 👋" once its user entity loads (the Base44
   async-entity artifact — measured both states). The clone's pre-warmed
   shell (ADR-014) renders the final name at FIRST paint — no flash, no
   layout shift. Steady-state parity holds; the clone's behavior is the
   documented superset. Do NOT add a "there" fallback (it would reintroduce
   the S16-A shift class).
2. **The branding split is now STABLE and decided.** The reference's
   document.title + login h1 read "AcademiaFlow (Copy)" (the Base44
   platform app name) while its in-app chrome — sidebar, mobile app bar,
   Settings subtitle ("Customize your StudyFlow experience") — still reads
   "StudyFlow". The clone keeps "StudyFlow" throughout: it matches the
   reference's IN-APP brand; the platform-level title is a hosted-platform
   artifact a self-hosted app does not carry. Decided non-gap (the S16
   open question is closed).
3. The reference's hamburger is unlabeled; the clone's is labeled (the
   standing a11y superset). The drawer check ran GREEN on arrival.
4. Study Groups DESKTOP two-pane empty states, Notes/Flashcards right-pane
   placeholders: parity ✓.
5. The reference's account display name renders as the email-prefix
   fallback ("sepnetflix2023") — the clone's register persists the same
   fallback (`email.split("@")[0]`) → parity on fresh registrations.
6. The clone's display-name editing + Sign out on the Profile tab and the
   4 notification detail rows are SUPERSET features — they stay.

---

## Families and fixes

### S17-A (HIGH) — the Profile tab's study-profile fields (functional)

**Data model:** `prisma/schema.prisma` User += `schoolName String @default("")`,
`gradeLevel String @default("")`, `studyGoalHours Int @default(4)`,
`notificationsEnabled Boolean @default(true)`. The e2e global-setup pushes
the schema fresh; the dev db needs one `bun run db:push` (additive columns —
no data loss; the seed upgrade is unnecessary because the defaults carry
the reference's own defaults).

**Seam:** `preferencesSchema` (validation.ts) += `schoolName` (bounded 120),
`gradeLevel` (enum of the 12 reference-measured options + ""), `studyGoalHours`
(int 1–12), `notificationsEnabled` (boolean) — all optional, exactly like
the existing fields. The preferences route persists them; `/api/auth/me`
already returns the full user record (getCurrentUser) so the new fields
flow to the client with no route change.

**Store:** `useThemeStore` += the four fields (loaded in `loadFromUser`,
defaulted) — the same pattern as `userName`. The theme-cache payload
(`{mode, accent}`) is untouched (the S11 sync contract).

**UI (settings-view.tsx Profile tab):** per-tab header "Your account and
study information"; School Name `Input` (placeholder "Your school...");
Grade Level `Select` with the 12 reference options (placeholder "Select
grade"); Daily Study Goal slider — the shared Slider primitive, min 1
max 12 step 1, live label "Daily Study Goal: N hours"; the static
"Account created: <M/D/YYYY>" line from the user record's createdAt (the
theme store carries `createdAt` — add it to the user slice); the save
button relabels to "Save Profile" (the reference's capitalization) and
PATCHes the four fields + the display name in one request. The display-name
input and Sign out stay (superset).

### S17-B (MEDIUM) — the Notifications master toggle (functional)

The Notifications tab gains the reference's structure at the top: header
"Manage your notification preferences"; a master `Switch` labelled
"Enable Notifications" with hint "Receive reminders for tasks and
assignments"; a "Save Preferences" button that PATCHes
`notificationsEnabled`. The four detail rows + muted note stay BELOW it as
the documented superset (locally stored preferences, as today).

### S17-C (MEDIUM) — the Settings tab headers + zero-empty states

Appearance: first line "Customize how StudyFlow looks". Subjects: header
"Manage your subjects and classes" + `SimpleEmptyState`-style zero state
"No subjects yet. Add your first subject to get started!". Holidays:
headers "Holidays & Breaks" + "Set your school holidays and breaks" + zero
state "No holidays set. Add your school holidays!". (The demo user has
subjects/holidays seeded — the zero states render only for fresh accounts.)

### S17-D (MEDIUM) — Analytics renders its stat cards at zero data

Remove the `!hasAnyData` EmptyState branch in `analytics-view.tsx` — the
four stat cards render ALWAYS (values degrade to 0/0 · "0% completion
rate", etc.; the charts already render their own "No subject data yet"
empty text and the priority distribution its "No active items" state —
verify both survive with all-zero data on a fresh account). The "No data
yet / Complete tasks…" block is DELETED (non-parity chrome).

### S17-E (MEDIUM) — Grade Tracker renders its stat cards at zero grades

Same family: `gradetracker-view.tsx` renders the three stat cards
(0% / 0 / 0) ALWAYS; the "No grades yet" EmptyState branch is DELETED; the
below-stat sections (per-subject rows, the trend chart) render only with
data (the reference's own behavior — its zero-state view is stats-only).

### S17-F (MEDIUM) — the empty-state hint copy family (7 views)

| View | Hint today | Hint (reference-measured) |
|---|---|---|
| Tasks | — | "Create your first task to get started" |
| Notes | — | "Create your first note" |
| Assignments | "Add your first assignment to start tracking coursework." | "Add your first assignment to start tracking" |
| Exams | "Add your first exam to start preparing in good time." | "Add your exams to start tracking" |
| Flashcards | "Create your first flashcard deck." | "Create your first flashcard deck" |
| Practice Tests | "Create your first practice test to check what you really know." | "Create your first practice test" |
| Files | "Upload a file, add a link, or create a folder to get started." | "Upload your first file to get started" |

### S17-G (MEDIUM, mobile-only) — Study Groups mobile fallback copy + placeholder

The `lg:hidden` branch's empty state: hint → "Create a group to
collaborate" (the reference's measured copy), and below the list the
mobile branch renders the right pane's "Select a group / Choose a study
group from the sidebar or create a new one" placeholder (the reference
stacks BOTH panes at 390px — measured). Desktop two-pane rendering is
untouched (parity ✓).

---

## TDD order

1. **RED unit** — `tests/validation.test.ts` extends: the preferences
   schema accepts the four new fields (and the 12 grade options round-trip);
   rejects studyGoalHours 0/13 and an unknown gradeLevel.
2. **RED e2e** — `tests/e2e/s17-fresh-user.spec.ts`:
   - **one fresh registration** (API-based `registerFreshUser` pattern —
     no login-limiter pressure) then, in that context: Analytics stat cards
     render at zero (0/0 + "0% completion rate" …) with "No data yet"
     ABSENT; Grade Tracker stat cards render (0% / 0 / 0) with "No grades
     yet" ABSENT; the seven empty-hint pins (S17-F table); StudyGroups
     mobile (390px) shows "Create a group to collaborate" AND the
     "Select a group" placeholder; Settings zero-empty states (Subjects +
     Holidays) render.
   - **demo-user specs** (storageState): the Profile tab renders School
     Name / Grade Level (12 options) / Daily Study Goal (slider 1–12,
     "Account created" line, per-tab headers); Save Profile persists
     (fill → save → reload → values survive); the Notifications master
     toggle renders + Save Preferences persists.
3. **GREEN** — schema → validation → route → store → settings-view →
   the seven hint fixes → analytics/gradetracker always-stat-cards → the
   studygroups mobile fallback.
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the empty-state sweep re-run on the clone
   (fresh account) vs the recorded reference JSON — every B-row green;
   the standing drawer check; the copy sweep (chrome copy unchanged on
   populated views).
6. Evidence captures (`scripts/capture-s17-evidence.mjs`): fresh-account
   Analytics + Grade Tracker + the Settings Profile/Notifications tabs +
   mobile StudyGroups, light mode, committed to `docs/screenshots/`.
7. Docs: README (feature row + counts + plan entry), AGENTS (commands +
   the fresh-user contract), CLAUDE (contract + counts), PAD (ADR-015 +
   the User-model extension), SKILL (AP-64..65 + counts), this plan's
   execution log, `worklog.md`, session narrative.

## Risks

- **The Prisma migration is additive** (4 defaulted columns) — `db push`
  on the dev db and the e2e global-setup handle it; no seed change needed.
- **The demo-user Settings spec mutates the demo user's profile** — assert
  idempotently (re-fill + re-save each run; the e2e db persists).
- **Register count:** ONE fresh registration per e2e run in the s17 spec
  (the S16 mobile-geometry spec already registers one; total stays ≪ 10 —
  register is not the login rate limiter, and the S15 plan documents the
  budget).
- **The Notifications master toggle must not regress the S14 pins** — the
  four detail rows and their localStorage behavior stay untouched below
  the new reference-structure block.
- **Analytics at zero with the demo user is unreachable** (seeded data) —
  the zero pins run in the fresh-account context only.
- **`page.pdf()`-free captures:** the evidence script reuses the
  capture-studyflow session pattern (login → view → screenshot).

---

## Execution log (post-completion)

**TDD observed.** RED: `tests/validation.test.ts` — 3 designed failures (the
grade enum, the 1–12 goal bound, the school length bound; unknown keys are
STRIPPED by Zod until the schema declares them, so the rejects only bind
once the fields exist). RED e2e: all 7 designed `s17-fresh-user.spec.ts`
failures observed (the "No data yet" block, the missing hints, the absent
Profile fields, the absent master toggle, the invented StudyGroups copy).

**GREEN (families):** the schema (4 defaulted User columns — additive
`db:push`, no seed change) → the preferences schema/route (the four fields
validated + persisted + returned) → `getCurrentUser`'s select +
`PublicUserShape` + the theme store's user slice (the study fields +
`accountCreatedAt`) → the settings-view five-tab rework (Profile: header,
School Name, the 12-option Grade Level Select, the 1–12h goal slider with
a live-hours label, the Account-created line, "Save Profile"; Notifications:
header + the persisted master toggle + "Save Preferences" with the four
detail rows kept below as the superset; Subjects/Holidays: headers +
zero-empty states; Appearance: its opening line) → the seven hint fixes →
the Analytics/GradeTracker always-stat-cards rework → the StudyGroups
mobile copy fix.

**Two honest iterations during GREEN.**
(1) The S17-C spec failed on a REAL discovery: the clone's register created
3 starter subjects ("a sensible nicety") the reference never creates — its
fresh journey is zero-subject (measured). Removed (the seeded demo account
keeps its showcase subjects).
(2) The S17-G spec's "the reference stacks both panes" interpretation was
WRONG: geometry probes showed the reference's mobile two-pane views
SQUEEZE (its left pane flex-shrinks to ~222px, its right pane clips to
~112px — its own non-responsive layout; Notes clips to 14px). The clone's
stacked mobile fallback stays (the S8-H superset — copy parity, not quirk
parity); only the invented "plan meetings" hint was replaced with the
reference's measured copy, and the fallback placeholder was reverted (the
desktop right pane already carries it).

**One live incident (now AP-65b).** After `db push` + `db:generate`, the
long-running dev server kept the OLD generated Prisma client — Turbopack
hot-reloads app code but not node_modules — so `/api/auth/me` 500'd on the
new select fields and every login bounced back to `/login` (the login POST
itself succeeds; the me-route crash breaks the auth gate). The standing
drawer check caught it. Dev-server restart = the fix. Documented in
AGENTS/PAD/SKILL.

**Registration budget (the S16 convention enforced).** The first full-suite
run failed S17-G with `register 429`: the suite's total registrations
(S9×2 + auth-flows×3 + S16×1 + the s17 spec's 5) exceeded the register
limiter's 10/IP/15min. The spec was consolidated to THREE registrations
(one zero-stats journey, one hints+Settings journey, one mobile journey) —
total suite budget now 9/10.

**Gates.** lint ✓ · tsc ✓ · **158 unit ✓** (154 + 4 new) · build ✓ ·
**249 e2e ✓** (cold `db/e2e.db`, 4.3 min) = **407 tests green** — the 244
prior pins untouched.

**Verification re-runs (all GREEN).** The empty-state sweep re-run on a
fresh clone account: all seven hints verbatim, the Analytics/GradeTracker
stat cards render at zero with the EmptyStates ABSENT, the charts' "No
subject data yet" surviving. The standing drawer check GREEN (after the
dev-server restart above — its first failures were the stale-client
symptom, not a regression). The reference's leftover probe rows deleted
via its own UI (its account keeps the benign profile values set while
measuring the save flow: school "Lincoln High", grade "9th Grade", goal
4h, notifications on — restored).

**Evidence.** 7 captures via the committed
`scripts/capture-s17-evidence.mjs`: zero-data Analytics + Grade Tracker,
the Tasks/Notes empty states, the Settings Profile (filled) +
Notifications tabs, and the mobile StudyGroups copy —
`docs/screenshots/s17-*.png`.

**Docs aligned.** README (badge 407, the Fresh-user journey feature row,
counts 158/249, the plan entry + captures line + project-status row, the
preferences API row), AGENTS.md (the capture command + the FRESH-USER
JOURNEY contract + counts), CLAUDE.md (the contract + counts + the S17
seams in the pyramid), PAD (ADR-015 + the distribution table + date),
SKILL.md (AP-64..65 + counts). `.env.example` audited — no changes (the
new fields are DB columns, not env vars).
