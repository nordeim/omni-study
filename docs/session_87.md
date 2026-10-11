# Session 87 — The S38 accent × dark mobile 20-view matrix

The workspace refreshed with a `git pull` (`c8d20f6..e11eb93` — the
session_86 transcript added on the remote); the working tree clean, the
environment intact (node_modules warm, `db/custom.db` at the repo root,
`.env` per the contract with `DATABASE_URL="file:../db/custom.db"`,
`.env.example` git-tracked). The core docs read (AGENTS through the S37
rows, CLAUDE, README, PAD through the S37 rows, SKILL through AP-82),
then the session docs (session_85 + session_86 +
remediation-plan-session37 + the worklog S37 entry); every current-state
claim re-verified against the codebase on arrival (the vitest 20-file/402
config, the playwright 291-spec config, the 21-stage STAGES list, the
`classifyAccentLightSweep` seam, the accent-dark-sweep's six-view
`MOBILE_VIEWS`, the 20 `NAV_ITEMS`; skills/ excluded per the brief).

## The validation on arrival

The **693-green baseline re-confirmed**: lint ✓ tsc ✓ **402 unit** ✓
(20 files) build ✓ cold-`db/e2e.db` **291 e2e** ✓ (4.5 min). The
standing checks all GREEN: the S31 preflight, the mobile-drawer check,
the live agent-browser 390×844 walkthrough (**the mobile navigation menu
is working as expected** — login → dashboard scrollWidth 390 → the
drawer's 20 links in the documented order → drawer closes on navigation
→ the Settings five tabs → the Profile tab's Email address card above
the Change password + Danger zone cards), the reference re-sweep
**UNCHANGED since S19–S37** (the login title "AcademiaFlow (Copy)", the
zero-data dashboard with the email-prefix greeting, the same 20 nav
views in the same order, the same five Settings tabs), the copy sweep
**14/20 MATCH** with the 6 diffs all data-state (the documented S17
family), and the S37 one-command standing suite **22/22 GREEN, exit 0**
— zero code findings on arrival.

One workspace incident during the copy sweep, diagnosed and resolved:
the first `:3200` standalone server (started for the sweep with
`db/e2e.db` by mistake, then "killed" by a `server.js` name match that
missed the actual `next-server (v16.4.0)` process name) kept serving the
e2e database — the first sweep pass measured E2E-prefixed probe rows.
Killed **by PID** (the AP-70 lesson re-learned: the standalone server's
process name is `next-server`, never `server.js`), restarted with
`file:../db/custom.db`, and the canonical sweep re-run: 14/20 with
exactly the documented six data-state diffs.

## The governing finding — the accent × dark × MOBILE 14-view gap

The documented S37 next-step (the session-85 summary's standing open
items). The coverage map, verified against the standing scripts this
session:

1. **accent-dark-sweep's mobile pass sweeps only 6 of 20 views**
   (`MOBILE_VIEWS` — Dashboard, MyDay, Timetable, Tasks, Settings,
   Calendar); the other 14 (Events, Assignments, Exams, Notes,
   Flashcards, PracticeTests, StudyGroups, GradeTracker, Analytics,
   Files, Calculator, MathSolver, AIAssistant, FocusTimer) are rendered
   in dark × every accent at DESKTOP only.
2. **mobile/midband/landscape never vary the accentColor** (zero
   references — verified by grep) and are LIGHT-only; **dark-mobile
   never varies the accentColor** (rides violet); **accent-light sweeps
   all 20 views but LIGHT only** (mode-rot guarded).
3. So dark × accent × mobile = **zero coverage for 14 views at all 7
   accents** — the combo family S36 closed for the MODE axis and S37
   closed for the LIGHT half of the ACCENT axis, one dimension out.
4. **The companion anti-phantom gap**: the envelope's mobile surface
   records only NON-CLEAN views (omission-means-clean — the S11 shape),
   so the seam cannot distinguish "clean because measured" from "clean
   because never rendered" — a `MOBILE_VIEWS` shrink reads
   green-by-omission.

## The exploration (the plan-validation probe)

The accent × dark × mobile family swept clean BEFORE the plan was
finalized — **7 accents × 20 views + the drawer per accent at 390×844 in
dark** (PATCHed through the settings API, self-verified on `<html
data-accent>` + the dark class, every view recorded explicitly):
**flashbulbs 0, non-exempt unreadable 0, scrollWidth ≤ 390 on every
rendering, zero console errors, the drawer clean at every accent**. The
surfaced entries classified with evidence BEFORE shipping (the S32
run-1 discipline): the 3 CTA-face entries (white on orange-500,
contrast 2.15 — the Calendar chip + the "11" selected day + the
PracticeTests "Start Test" — the documented S11 family-2, the same
entries the desktop pass carries) and the 48 lowcontrast WARN entries
(three documented families: the Assignments amber pills, the Calendar
slate-400 adjacent-month days — the dark sibling of the S6-G light pin —
and the accent-600 text boundary band). No genuine finding surfaced —
the plan shipped as the coverage extension.

## The fix (TDD, 17 new pins + 4 re-based)

- **RED**: the S38 pin block in `tests/suite-verdict.test.ts` (the
  GREEN shape with all 7 accents × 20 views on BOTH surfaces + the
  drawer per accent; the ALL-VIEWS guards [mobile + desktop]; the
  ALL-ACCENTS guards [a surface + the applied map]; the historical
  6-view mobile envelope — the exact pre-S38 rot; the missing-drawer,
  missing-mode, and wrong-viewport shape-errors; the mode-rot family
  [mode=light → non-green — the INVERSE of accent-light's guard]; the
  applied-mismatch family; the drawer-error-is-a-finding family; the
  mobile overflow family [scrollWidth 420 → finding]; the strict-record
  families) → **15 failed** under the current seam (it reads the same
  envelopes green).
- **GREEN**: `classifyAccentDarkSweep` rebuilt in
  `src/lib/suite-verdict.ts` — the envelope metadata shape (`mode` +
  `mobileViewport` 390×844 + the per-accent `applied` map), the
  ALL-ACCENTS guard on both surfaces + the applied map, the ALL-VIEWS
  guard on both surfaces (the omission-means-clean recording RETIRED),
  the drawer-present guard with the drawer-open failure counted as a
  FINDING, the mode rot guard, the applied-mismatch guard, the mobile
  scrollWidth overflow class, and the S11 counting semantics preserved
  (flashbulbs ALWAYS findings; white-on-accent = the CTA-face
  exemption; lowcontrast = WARN) → **135/135** in the file; the full
  unit layer **419** (was 402; +17 pins; the 4 S11/S65 accent-dark pins
  re-based on the full-shape fixture generator).
- **The probe** `scripts/accent-dark-sweep.mjs`: `MOBILE_VIEWS`
  RETIRED — the mobile pass sweeps **all 20 views** per accent at
  390×844 (+ the Settings Avatar tab interaction + the drawer per
  accent with the link census asserted at 20), every view recorded
  EXPLICITLY on both surfaces, the per-accent `applied` self-verification
  (fail loudly + restore on mismatch), the both-axes viewport assertion,
  the scrollWidth reading on every mobile record, the unconditional
  drawer record (the guarded catch records a FINDING-class `{error}`
  record, never a swallow), and the failure-path restore in the catch.
  **Genuine run: findings 0** (6 CTA-face exempt, 138 WARN, 0 overflow,
  0 drawer errors, all 7 accents self-verified applied) — the envelope
  classified **GREEN at the seam**: "280 view renderings probed (7
  accents × 20 views × desktop+mobile) + 7 drawer records".
- **The runner** (the mid-execution discovery): the extended stage
  measures **~17–18 min** — over the suite's 10-min STAGE_TIMEOUT_MS
  (the first validation attempt was killed at this discovery; the
  runner would have SIGKILLed the stage at 10 min → exit 124 → a
  non-green row that is a HARNESS limit, not a code finding). The fix:
  an optional per-stage `timeoutMs` override on the STAGES entries (the
  accent-dark-sweep stage carries 25 min; every other stage keeps the
  10-min default) consumed as `spec.timeoutMs ?? STAGE_TIMEOUT_MS`.
- **The validation protocol** (the S32 differential): the dev server
  restarted by PID first, the S31 preflight GREEN, then the clean-window
  full-suite run: **22/22 GREEN, exit 0** — the evidence envelope
  `docs/screenshots/s38-accent-dark-mobile-sweep-evidence.json`.
- **Full gates re-run green**: lint ✓ tsc ✓ **419 unit** ✓ build ✓
  cold-db **291 e2e** ✓ = **710 green** (was 693; +17 unit pins; zero
  app code, zero CSS, zero Tailwind v4 surface, zero parity-pinned
  bytes).

## The evidence + the docs

The accent-dark evidence screenshot
`docs/screenshots/s38-accent-dark-drawer-teal-390.png` (the drawer OPEN
at 390×844 in DARK mode under the TEAL accent — the teal-tinted active
Dashboard link on the dark:bg-slate-950 panel) via
`scripts/capture-s38-evidence.mjs`; the standing 31 screenshots
refreshed via `capture-studyflow.mjs` (theme restored light, verified
via Prisma: light/violet). Docs aligned (the AP-74 guard): AGENTS (the
S38-extended command entry + the 419 line), vitest.config.ts (419 + the
S38 seam note), CLAUDE.md (419 + the S38 seam), PAD §8.1 (the
suite-verdict row + the per-file count 118 → 135 + Total 710/419),
README (the 710 badge + the 419 lines ×2 + the S38 classifier mention +
the session-38 status row), SKILL.md (the 710/419 counts ×2 + **AP-83**
— the envelope-must-prove-its-own-coverage lesson), the worklog S38
entry, this narrative, and the summary (session_88).

**Pushed to main** — the feat commit + the summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different
repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (22 rows; the accent-dark stage now
budgeted 25 min — the full suite runs ~45 min) in a clean window (the
S32 differential: restart the dev server by PID between back-to-back
runs). The standing open items remain: the first real `docker compose
--profile init up` on the owner's Docker host; and the upstream dep
patches (braces > 3.0.3, Prisma's deepmerge-ts pin) will clear the
dep-audit envelope when they land. The theme-space matrix (mode ×
accent × viewport) is now FULLY swept at every documented combo — the
next production-readiness axis is beyond the theme space (e.g. the
drawer-navigation × accent interaction at mid-band, or the data-volume
× dark × accent stress).
