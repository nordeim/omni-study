# Remediation Plan — Session 33 (S33): the mobile light-mode sweep — the mobile navigation menu and the 20-view mobile surface as a standing, executable guarantee

**Audit surfaces (this session, session-67/68 workspace run at `252d700`):** the
baseline gates re-confirmed the documented **625-green** state on arrival (lint
✓ tsc ✓ **334 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.4 min**), the S31 preflight ran GREEN before the suite,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → Settings by ref → the S26 Email card above the S24 Change
password + S25 Danger zone cards on the Profile tab — **the mobile navigation
menu is working as expected**), and the reference re-sweep: **UNCHANGED since
S19–S32** (login title "AcademiaFlow (Copy)"; zero-data 0/0 dashboard with the
greeting from the email prefix; the same 20 nav views in the same order; the
same five Settings tabs with School/Grade on Profile). The 20-view copy sweep:
**14/20 MATCH** with the 6 diffs all data-state (the documented S17-pinned
non-gap family — the seeded clone vs the zero-data reference; the Flashcards
"Create Deck" refOnly button is the reference's EMPTY-state CTA, and the
clone's zero-deck copy "Create your first flashcard deck" is already
e2e-pinned in s17-fresh-user.spec.ts). The S32 one-command standing suite ran
**17/17 GREEN, exit 0** — zero code findings across the whole production-
readiness sweep (the S32 ai-a11y probe-row fix validated live inside the
suite: findings 0, cleanup removed 0). The demo user's theme verified
light/violet (the closing guard). Seed idempotency re-verified empirically
(re-run `bun run db:seed` on the seeded db: every count byte-identical —
"topping up subjects only"). Git hygiene verified (.env, db/*.db, dev.log,
server.log, *.key all gitignored; working tree clean).

## The governing finding (this session's work)

**The mobile surface — the very thing every session brief says to "pay
particular attention to" — is guaranteed by PROSE, not by tooling.** Three
pieces of evidence, all captured live this session:

1. **The 390×844 walkthrough is a manual prose procedure, re-executed by hand
   every session.** Every session narrative since S14 carries "the live
   agent-browser 390×844 walkthrough GREEN — the app bar, the drawer with all
   20 links in the documented order, Settings by ref, scrollWidth 390". That
   is exactly the AP-77 class the S32 session named: *"when a procedure's
   correct execution depends on sequence + interpretation knowledge, encode it
   as ONE command — prose lessons do not prevent operational mistakes,
   tooling does."* The S32 session encoded the audit suite; the mobile
   walkthrough — operator-knowledge transmitted through session narratives —
   remained prose.
2. **The light-mode mobile surface across all 20 views is un-probed.** The
   e2e "20 views render" coverage runs at 1440×900 (desktop —
   navigation.spec.ts `test.use`); mobile-navigation.spec.ts covers the app
   bar + drawer geometry + **two** navigation round-trips (Tasks, Settings);
   accent-dark-sweep covers **6** mobile views in DARK mode; the copy sweep
   runs at 1280×800. No standing audit asserts, per view at 390×844 in light
   mode: the drawer round-trip navigates, the view renders its identity
   heading, there is no horizontal overflow, and zero console errors. The S16
   lesson documented the class: *"mobile-only parity gaps hide behind desktop
   pins — a responsive reference and a fixed-value clone measure IDENTICAL at
   desktop; the drift is only visible at <sm."* A future `min-w-[...]` element
   or drawer regression would surface in NO standing audit.
3. **This session's manual sweep is the evidence the current state is green —
   and the proof the check is repeatable enough to encode.** The live
   agent-browser pass (login at 390×844, then every view): scrollWidth 390 on
   all 20 views, the drawer opens/closes, all 20 links in the documented
   order, the app bar + clock render. The probe ships GREEN today and pins
   the guarantee for every future sweep.

The deliverable: **`scripts/mobile-sweep.mjs`** — the standing probe that
sweeps all 20 views at 390×844 in light mode **through the drawer itself**
(the mobile navigation menu is the vehicle, not a bystander), asserting per
view: the drawer opened and closed on navigation, the identity heading
rendered, `documentElement.scrollWidth ≤ 390`, zero console errors, and the
fixed glass app bar (brand + 2-digit-hour clock) — with the S27
self-verifying-precondition doctrine (the viewport is asserted, the mode is
set through the settings API and verified on `<html>`, the applied mode rides
the envelope) and the S32 anti-phantom shape contract (a top-level `findings`
array + a per-view record the seam validates loudly).

## Families and fixes

### S33-A (HIGH) — the seam extension `classifyMobileSweep` + the unit pins

The CLAUDE.md doctrine (pure logic in `src/lib/*` seams with unit pins):

- `AUDIT_NAMES` gains `"mobile-sweep"` (after `"focus-order"`, before
  `"dark-sweep"` — the light-mode family before the dark-mode family, the
  documented stage order).
- `classifyAudit("mobile-sweep", envelope)` → `classifyMobileSweep`:
  - `mode` must be the string `"light"` — anything else is a non-green
    `mode=X — the sweep ran in the wrong mode (the S27 rot class)` finding
    (a dark-mode run of a LIGHT-mode sweep is the exact S27 family; the
    dark/accent mobile surfaces belong to their own audits).
  - `viewport` must be an object carrying `width: 390` (the probe's own
    self-verification rides the envelope; a sweep at another width is a
    shape-error — the finding classes are width-dependent).
  - `views` must be an object; every `views.{view}` must carry a string
    `heading`, a number `scrollWidth`, a boolean `drawerClosed`, a boolean
    `appBar`, and an Array `consoleErrors` — a missing or wrong-typed key is
    a LOUD `shape-error` (the anti-phantom guard; never a silent 0).
  - `findings` must be an Array; green iff empty. The note counts the views
    swept and the drawer round-trips.
- Pinned in `tests/suite-verdict.test.ts` (the S24–S26 in-file extension
  pattern): the GREEN shape fixture; the shape-error family (missing
  `findings`; `findings` non-Array; a view missing `scrollWidth`;
  `viewport.width` 1280); the mode-rot family (`mode: "dark"` → non-green
  with the mode in the note); the findings-present family (an overflow
  finding at 512 → non-green, findings 1).

### S33-B (HIGH) — the probe `scripts/mobile-sweep.mjs`

Run as `node scripts/mobile-sweep.mjs` (node-run like dark-sweep/
forced-colors/print — it imports no TS seam; the runner classifies). Stages:

1. **Self-verifying preconditions (the S27/S32 doctrine):** launch
   Chromium at 390×844; login as the demo user (demo@studyflow.app); assert
   `window.innerWidth === 390` (a viewport that failed to apply fails loudly
   BEFORE any measurement); PATCH `themeMode: "light"` through the settings
   API (the real lifecycle — never a forced class), await the response, then
   reload and assert `<html>` carries no `dark` class. Any precondition
   failure: loud stderr + `process.exit(1)` with NO findings — the probe
   never measures a state it cannot verify.
2. **The drawer-content check (once, on the first open):** the hamburger
   opens the dialog; exactly 20 links in the documented NAV order; the brand
   header ("StudyFlow" + "Your study companion"); no footer. (The geometry
   itself stays in drawer-check-s14 — both apps, reference-dependent; this is
   the clone-side content/order pin.)
3. **The 20-view sweep, navigated THROUGH THE DRAWER:** for each view in NAV
   order — open the drawer (hamburger), click the view's link (exact label),
   then assert: the URL is the view's path; the drawer dialog is hidden
   (closed on navigation); the view's identity heading is visible (the
   per-view expected heading; Dashboard is the time-aware greeting regex —
   the copy-sweep pattern); `documentElement.scrollWidth ≤ 390` (no
   horizontal overflow); zero console errors on the page (a page-level
   listener from before the first navigation; the count is per-view since
   the last navigation); the fixed glass app bar renders with the brand and
   the 2-digit-hour clock. A ~1200 ms data settle per view (between the
   copy-sweep's 700 and the dark-sweep's 1800 — the drawer nav + fetch).
4. **The closing restore:** an explicit, awaited `themeMode: "light"` PATCH
   (the demo resting state — never RELY on it being already correct; the
   theme-spec lesson), then browser close.
5. **Output:** one JSON envelope `{ source: "mobile-sweep", mode, viewport,
   views: {...}, findings: [...], drawer: { linkCount, order } }`; exit 0
   iff findings empty AND preconditions held.

**Findings vocabulary (each is a real, actionable class):**
`overflow` (scrollWidth > 390), `no-heading` (identity heading never
rendered), `drawer-stuck` (the dialog did not close after link navigation),
`console-error` (a page error surfaced during the view), `app-bar` (the bar/
brand/clock missing), `link-count` (the drawer did not carry exactly 20
links in order), `precondition` (never emitted — preconditions exit 1 with
no findings).

**Negative controls (the S27–S32 validation convention):** (a) the
fabricated findings envelope through the seam reads non-green (unit-pinned);
(b) the mode-rot envelope (`mode: "dark"`) reads non-green with the mode in
the note (unit-pinned); (c) the dead-server case aborts at the standing-
suite preflight stage (validated live in S31/S32 — the runner's stage-0
enforcement, unchanged); (d) the genuine run against the healthy dev server
→ findings 0, exit 0 (the validation run inside the full suite).

### S33-C (HIGH) — the runner update `scripts/standing-suite.mjs`

- `STAGES` gains `{ name: "mobile-sweep", file: "scripts/mobile-sweep.mjs",
  runtime: "node" }` after `focus-order`, before `dark-sweep` — the light-
  mode mobile family before the dark-mode families (the sweep PATCHes light
  explicitly, so the subsequent dark-sweep/accent stages are unaffected; the
  closing theme guard still verifies light/violet at suite end).
- The stage-count literals 16 → 17 (`stage 0/17`, `stage ${i+1}/17`, the
  closing `stage 17/17`) — the suite is now 18 rows (preflight + 16 audits +
  the theme guard).
- The mobile-sweep stage makes ZERO AI requests (no ai: budget interaction
  with the security stage — the S32 pre-spent-budget class is impossible
  here by construction).

### S33-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

- `AGENTS.md`: the commands-table entry `node scripts/mobile-sweep.mjs` +
  the standing-suite entry's audit list gains mobile-sweep + the unit-count
  line (334 → the new count).
- `vitest.config.ts`: the header seam list note + the counts (20 files → 21
  if the pins ride a new file — they ride `tests/suite-verdict.test.ts`, so
  20 files; 334 → the new count).
- `CLAUDE.md`: the unit-layer count + the mobile-sweep seam mention.
- `Project_Architecture_Document.md` §8.1: the suite-verdict row's
  description + the Total row re-derived (tests 625 → the new count).
- `README.md`: the session-33 status row + the §Testing counts + the badge.
- `omni-study_SKILL.md`: the counts ×2 + **AP-78** (the lesson — below).
- `worklog.md` (repo root): the S33 entry.

**AP-78 (the lesson, MEDIUM):** the S32 lesson (AP-77) encoded the audit
suite's operating procedure; S33 finds the SAME class one layer out — **the
manual verification walkthrough**. The mobile 390×844 walkthrough had been
executed by hand and narrated in every session since S14 while nothing
executable pinned what it verified: the per-session prose was the ONLY
carrier of the mobile-navigation guarantee, and the light-mode mobile surface
across all 20 views (overflow, render, console, drawer round-trip) appeared
in NO standing audit — the e2e layer pinned desktop (1440×900) and the audit
scripts pinned dark (6 views). The tell: a session brief that says "pay
particular attention to the mobile navigation menu" was answered by a
HAND-RUN walkthrough whose scope and assertions lived in the operator's head.
The guard: when a manual walkthrough is part of a recurring verification,
encode ITS assertions as a standing probe in the suite — a walkthrough that
cannot be run by the suite is a walkthrough a future session may skip, run
differently, or silently shrink (the scope-drift class). The mobile-sweep
probe is the walkthrough's executable twin: same vehicle (the drawer), same
assertions, one command, unit-pinned interpretation.

### S33-E (MEDIUM) — the session record + evidence

`docs/remediation-plan-session33.md` (this file, with the execution log), the
session narrative, the S33 evidence JSON
(`docs/screenshots/s33-mobile-sweep-evidence.json` — the genuine 18-stage
suite envelope), and the standing-31 screenshot refresh (no app bytes move;
the refresh proves the tree unchanged).

## Non-gaps (documented, do not fix)

1. **No e2e spec is added** (the S27–S32 convention: probe scripts are
   execution-validated, not browser-pinned; the suite runner IS the probe —
   the e2e layer already pins the drawer geometry + the two round-trips +
   the app-bar chrome at 390×844 in mobile-navigation.spec.ts).
2. **The drawer GEOMETRY stays in drawer-check-s14** (both apps,
   reference-dependent) — mobile-sweep is the clone-side navigation/render/
   overflow/content guarantee.
3. **The 6 dark-mode mobile views stay in accent-dark-sweep** — the
   mobile-sweep is the LIGHT-mode complement, mode-rot-guarded the same way
   dark-sweep guards its dark mode.
4. **The reference-side mobile re-sweep stays manual** (agent-browser) — the
   standing suite is clone-side by design (the S32 non-gap #2); the
   reference-dependent checks keep their own commands.
5. **The copy sweep stays outside the suite** (reference-dependent; 14/20 +
   6 data-state non-gaps — the documented S17 family, re-confirmed this
   session).

## TDD order

1. **RED:** extend `tests/suite-verdict.test.ts` with the mobile-sweep
   classifier pins (the GREEN fixture; the shape-error family; the mode-rot
   family; the findings-present family). Run → fails (classifyAudit reads
   "unknown audit" / shape-error on every pin). Capture the failing run.
2. **GREEN:** implement `classifyMobileSweep` + the `AUDIT_NAMES` entry in
   `src/lib/suite-verdict.ts`. Run → the new pins green alongside 334.
3. **The probe:** `scripts/mobile-sweep.mjs` (node-run; the self-verifying
   preconditions; the drawer-content check; the 20-view drawer-navigation
   sweep; the closing restore). Execution-validate live against the dev
   server → findings 0, exit 0.
4. **The runner:** the STAGES entry + the 17-count literals; the genuine
   full-suite re-run → **18/18 GREEN, exit 0** (the validation run; its
   envelope is the S33 evidence).
5. **Full gates re-run:** lint → typecheck → unit (the new count) → build →
   cold-`db/e2e.db` 291 e2e — the regression confirmation (zero app code,
   zero CSS, zero Tailwind v4 surface, zero parity-pinned bytes).
6. **Standing checks re-run:** the drawer check; the standing 31 screenshots
   refreshed via capture-studyflow.mjs (theme restored light, verified via
   Prisma); the S33 evidence JSON captured.
7. **Docs** (S33-D) + the session record (S33-E) + commit + push via the
   SSH wrapper.

## Risks

- **The console-error listener may surface dev-mode noise** (the Next.js dev
  overlay) — if the genuine run surfaces any, they get classified with
  evidence BEFORE shipping (the S32 run-1 discipline: verify every finding
  against the codebase before treating it as noise OR a defect); documented
  exclusions must be signature-strict (the S32 lesson — a non-matching
  console error stays a finding).
- **The Dashboard greeting is time-aware** — the heading assertion is a
  regex (the copy-sweep pattern), never a hardcoded greeting bucket.
- **Drawer-navigation timing** — the drawer close + SPA navigation are
  gated on OBSERVABLE end states (dialog hidden + URL + heading visible,
  `waitForFunction` polls — the S8/S16 lesson: never a bare count/sleep).
- **The suite's total runtime grows ~1 min** (20 drawer navigations + a
  settle each) — acceptable against the S32 suite's ~20 min.

## Execution log (session 67/68 — filled as executed)

- TDD RED: 13 new pins in tests/suite-verdict.test.ts (the GREEN shape;
  the shape-error family [missing findings / non-Array findings / a view
  record missing scrollWidth / a non-boolean drawerClosed / a non-390
  viewport / a non-string mode]; the mode-rot family [mode=dark →
  non-green with the mode + the S27 class in the note]; the
  findings-present family [overflow / drawer-stuck / link-count]) →
  7 failed / 56 passed (the unknown-audit guard already shape-errors the
  unknown name — those pins pass for the right reason post-implementation).
- TDD GREEN: `classifyMobileSweep` + the AUDIT_NAMES entry in
  src/lib/suite-verdict.ts → 63/63; the full unit layer **347** (20 files).
- The probe scripts/mobile-sweep.mjs — first-run artifact fixed (the
  drawer must CLOSE after the content check: the open overlay intercepts
  the hamburger click — the e2e-documented interception class).
- Genuine run 1: **18/20 clean, 2 findings** — each verified against the
  codebase BEFORE classification (the S32 run-1 discipline):
  (1) StudyGroups "no-heading" = a PROBE artifact — its mobile stack
  renders an **h2** (the S8-H pattern; "the single h1 lives in the
  desktop pane"), the selector looked for h1 only; fixed with the
  copy-sweep's h1||h2 union (`main h1:visible, main h2:visible`);
  (2) Notes "no-heading" = **the GENUINE finding** — the clone's mobile
  stack (the no-overflow `lg:hidden` list, the superset design) had LOST
  the identity heading: the reference renders its "Notes" **h1 at
  390px** (its own two-pane overflows to 416px there), and the clone's
  desktop h1 parity pins passed the whole time — the S16
  mobile-only-gap class exactly, 20 sessions old.
- The genuine fix: notes-view.tsx's mobile stack gains the identity h2
  (the StudyGroups S8-H pattern — book-open icon + "Notes"; main h1 count
  stays 1; zero desktop bytes move — the block is display:none ≥lg, the
  parity-session8 h1-count + pane-h1 pins and the navigation.spec
  heading assertions unaffected by construction).
- Genuine run 2 (post-fix): **findings 0, exit 0** — all 20 views clean
  (identity heading, scrollWidth 390, drawer closed, app bar + clock,
  zero console errors).
- The runner: STAGES gains mobile-sweep between focus-order and
  dark-sweep; the stage-count literals 16 → 17. The genuine full-suite
  validation run: **18/18 GREEN, exit 0** (preflight + 16 audits + the
  theme guard) — the evidence envelope captured to
  docs/screenshots/s33-mobile-sweep-evidence.json.
- Gates re-run: lint ✓ tsc ✓ **347 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ = **638 green** (was 625; +13 unit pins; the 291 prior
  pins untouched by construction).
- Reference-side mobile sweep documented (the non-gap family): the
  reference's OWN mobile horizontal overflow at 390px — Notes 416,
  Timetable 395, Flashcards 391, Calculator 429, MathSolver 417 — where
  the clone stays 390 on every view (the superset; no action; the
  reference's visible-h1-everywhere model confirmed across all 20 views).
- Docs aligned (the AP-74 guard): AGENTS, vitest.config.ts, CLAUDE, PAD
  §8.1 (also correcting the S32 per-row typo — the suite-verdict row
  said 48 tests where the file carried 50; the S32 total had been
  computed with 50), README, SKILL (+AP-78), the worklog entry, the
  session narrative.
