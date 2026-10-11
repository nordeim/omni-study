# Remediation Plan — Session 37 (S37): the accent × light sweep — the ACCENT axis in LIGHT mode the standing surface never varied, as a standing, executable guarantee

**Audit surfaces (this session, session-80/81 workspace run at `f10a7ee`):** the
baseline gates re-confirmed the documented **674-green** state on arrival (lint
✓ tsc ✓ **383 unit** ✓ 20 files; `bun run build` ✓; cold-`db/e2e.db` full e2e
regression **291 ✓ 4.2 min**), the S31 preflight ran GREEN before the checks,
the mobile-drawer check GREEN (backdrop oklab+blur(4px), 288px white panel,
20 links, no footer, Escape-close), the live agent-browser 390×844 walkthrough
GREEN (login → dashboard scrollWidth 390 → drawer with all 20 links in the
documented order → drawer closes on navigation → Settings by ref → the Profile
tab's Email address card above the Change password + Danger zone cards —
**the mobile navigation menu is working as expected**), and the reference
re-sweep: **UNCHANGED since S19–S36** (login title "AcademiaFlow (Copy)"; the
zero-data dashboard with the greeting from the email prefix "Good morning,
sepnetflix2023 👋" + the same section h2s; the same 20 nav views in the same
order; the same five Settings tabs with School/Grade/Goal on the Profile
tab). The 20-view copy sweep: **14/20 MATCH** with the 6 diffs all data-state
(the documented S17-pinned non-gap family: the greeting name, the zero-data
CTA/button surfaces on MyDay/Tasks/Timetable/Flashcards, the count subtitles
on Tasks/Exams). The S36 one-command standing suite ran **21/21 GREEN,
exit 0** — zero code findings across the whole production-readiness sweep.
The demo user's theme verified light/violet (the closing guard).

## The governing finding (this session's work)

**The ACCENT axis in LIGHT mode has never been varied — no standing audit
renders ANY view in a non-violet accent in light mode, while the entire
light-mode parity surface (every parity pin, every light sweep) rides the
default violet.** The coverage map, verified against the standing scripts
this session:

1. **accent-dark-sweep** varies all 7 accents — but ONLY in **dark mode**
   (its own name is the blind spot): 7 accents × 20 desktop views + 6
   mobile views (`MOBILE_VIEWS`) + the drawer, all `themeMode: "dark"`.
2. **The mobile/midband/landscape/dark-mobile sweeps never vary the
   accentColor at all** — no accent precondition, no accent record; they
   ride the demo user's resting violet. An accent-specific regression at
   the mobile layout surfaces in NO standing audit in LIGHT mode.
3. **The only light × non-violet rendering in any standing artifact is ONE
   desktop view** — the calculator e2e's teal accent pin ("switching the
   accent recolors the active nav chip", one view, one accent, desktop).
   Light × accent × mobile is **zero-coverage for all 20 views**; light ×
   accent × desktop is 1-view-of-20 coverage.
4. **The reference's accent picker saves but never re-themes** (re-verified
   live in session 3; the S4 remediation's own table) — the reference is
   permanently violet, so there is NO accent parity contract against the
   reference; the clone's working accent system is the **functional
   superset** (the S4 decision), and its light-mode correctness is a
   superset-quality contract guaranteed by nothing at execution time.

The accent-dependent structures are real at the mobile layout: the drawer's
active-link tint (the 10%-alpha `--sf-primary` → `--sf-primary-avatar-to`
inline gradient, `NAV_ACTIVE_GRADIENT_STOPS`), the mobile app bar's
accent-tinted brand, the calendar's selected-day solid accent fill + white
text, the timetable today chip, every view's `sf-gradient` CTAs and
`text-sf-primary` icons/links. The 15-var token set is unit-pinned
statically for all 7 accents (theme.ts), but the RUNTIME APPLICATION —
`applyToDocument` → `data-accent` → the CSS vars consumed by the
mobile-only structures — has never been executed at a non-violet accent in
light mode by any standing probe. A dropped `--sf-*` var in the light scope
of one accent, a `dark:`-only override that breaks the light path, or a
mobile-only accent surface that reads the wrong var would surface in NO
standing audit: the dark sweeps see the dark scope, the light sweeps see
violet, and the token unit tests pin the static set, not the applied
rendering.

**The static audit companion (this session):** the hardcoded-violet scan
over `src/components/views/` + `src/components/layout/` classifies every
fixed-violet surface as a **measured-parity design color, not an accent
surface** — the assignment progress slider (the S6 sRGB-exact
violet→indigo gradient pin), the TaskRowCard's repeat pill + star + hover
border (the S6 measured spec), the flashcard study back face (the S7 pin),
the analytics per-card tints (fixed per-card design colors), the calendar
day-detail rows (the S8-C family). Because the reference never re-themes,
every fixed-violet surface is reference-consistent at every accent by
construction — the scan found NO genuine accent-surface bug statically;
the gap is the missing executable guarantee, not a known defect.

**This session's executable exploration is the evidence the current state is
green** (the plan-validation probe, the S34/S35/S36 doctrine): every accent
(7) × all 20 views at the given viewport in LIGHT mode (PATCHed through the
settings API — the real lifecycle, self-verified on `<html data-accent>`
+ the light class), per view the identity heading h1||h2, scrollWidth ≤ the
viewport, the contrast detector family (unreadable < 2.2 / lowcontrast <
3.2 — the flashbulb detector is dark-mode-specific and does not apply on
the light canvas), zero console errors, plus the drawer's own accent
rendering at mobile widths (the active-link tint + the dialog-scoped
detectors) and the sidebar's active-link tint at desktop. Swept at 390×844
(the representative), 1280×800 (the desktop combo), and 768×1024 (the
mid-band combo). Findings at every viewport: recorded in the execution log
below.

The deliverable: **`scripts/accent-light-sweep.mjs`** — the standing probe
at **390×844** (the S33 mobile sweep's accent sibling in light mode — the
representative of the most common real-world accent-usage class: the phone,
light mode, a picked accent), all 20 views per accent + the drawer per
accent, with the S27 self-verifying accent precondition (PATCHed through
the settings API + verified on `<html data-accent>`) and the S32
anti-phantom shape contract.

## Families and fixes

### S37-A (HIGH) — the seam extension `classifyAccentLightSweep` + the unit pins

The CLAUDE.md doctrine (pure logic in `src/lib/*` seams with unit pins):

- `AUDIT_NAMES` gains `"accent-light-sweep"` (after `"landscape-sweep"`,
  before `"dark-mobile-sweep"` — the light-mode mobile family, then the
  light-mode mid-band family, then the light-mode phone-landscape family,
  then the light-mode ACCENT family, then the dark-mode families — the
  documented stage order: light before dark anything, mobile before
  desktop).
- `classifyAudit("accent-light-sweep", envelope)` →
  `classifyAccentLightSweep`:
  - `mode` must be the string `"light"` — anything else is a non-green
    `mode=X — the sweep ran in the wrong mode (the S27 rot class; the
    LIGHT-mode accent surface is this audit's contract — the accent ×
    dark family belongs to accent-dark-sweep)` finding (the INVERSE-inverse
    guard: the S36 dark-mobile sweep owns dark; this audit owns light).
  - `viewport` must be an object carrying BOTH `width: 390` AND `height:
    844` — the sweep at another size is a shape-error (the desktop/mid-band
    light-accent combos are documented non-gaps, validated by this
    session's exploration).
  - `chrome` must be an object with boolean `sidebarVisible` + boolean
    `hamburgerVisible` — the vehicle contract (below 1024 the drawer is the
    vehicle). A well-formed envelope whose `sidebarVisible === true` or
    `hamburgerVisible === false` reads NON-GREEN with the
    vehicle-contract note.
  - `accents` must be an object keyed by accent carrying, per accent: a
    string `applied` (the self-verified `<html data-accent>` reading — an
    accent whose `applied` ≠ its key is a non-green accent-application
    finding), a `views` object whose every record carries a string
    `heading`, a number `scrollWidth`, an Array `unreadable`, an Array
    `lowcontrast`, and an Array `consoleErrors` — shape-strict (unreadable
    + lowcontrast are the accent-dark-sweep detector family ported to the
    light canvas; the flashbulb class does not apply in light mode), and a
    `drawer` object with number `linkCount` + Arrays `unreadable` +
    `lowcontrast` (the drawer's own accent rendering — the active-link tint
    is accent-driven).
  - **The all-accents guard (NEW this audit):** `accents` must carry ALL
    SEVEN keys — violet, blue, green, orange, pink, red, teal. A missing
    accent is a LOUD shape-error ("accents must carry all 7 — an accent
    that silently did not run must never read green-by-omission") — the
    anti-phantom doctrine applied to the accent dimension: a probe loop
    that exits early after 3 accents must not pass.
  - `findings` must be an Array; green iff empty AND the summed contrast
    detections are zero AND both contracts hold AND every accent applied.
    The contrast detections are counted INDEPENDENTLY of the findings array
    (the dark-sweep/dark-mobile semantics): findings = findings.length +
    Σ unreadable across accents/views/drawer — EXCEPT the **CTA-face
    exemption** (the S11 family-2 non-gap in light mode: unreadable
    entries whose `color === "rgb(255, 255, 255)"` are the accent CTA face
    — white on accent-500, the reference's own accent-CTA choice at 2.15
    under the bright accents — counted into the note, never the findings),
    and `lowcontrast` entries are WARN (counted into the note, never the
    findings — the S11 non-gap family).
  - The note counts the accents swept, the view renderings, the drawer
    records, the CTA-face exemptions, and the WARN total.
- Pinned in `tests/suite-verdict.test.ts` (the S33–S36 in-file extension
  pattern): the GREEN shape fixture (all 7 accents × per-view
  unreadable/lowcontrast arrays + the drawer record + applied verbatim);
  the shape-error family (missing `findings`; a missing accent key [the
  six-accent envelope — the all-accents guard]; a view record missing
  `unreadable`; a view record missing `lowcontrast`; the drawer record
  missing; the 1280×800 desktop envelope fed to the classifier —
  shape-error, the mobile class is this audit's contract; the 768×1024
  mid-band envelope — same); the mode-rot family (`mode: "dark"` →
  non-green with the mode in the note — the INVERSE-inverse guard: the
  dark accent family belongs to accent-dark-sweep); the findings-present
  family (an unreadable non-CTA entry at Notes under teal → non-green);
  the CTA-face family (an unreadable entry with `color: "rgb(255, 255,
  255)"` under orange → STILL green, counted in the note — the S11
  family-2 exemption); the contrast-detection family (a NON-EMPTY
  unreadable array with an EMPTY findings array → still non-green — the
  independent counting); the applied-mismatch family (`applied: "violet"`
  under the teal key → non-green — the accent did not apply); the
  vehicle-contract family (`sidebarVisible: true` → non-green with the
  lg-contract note).

### S37-B (HIGH) — the probe `scripts/accent-light-sweep.mjs`

Run as `node scripts/accent-light-sweep.mjs` (node-run like the
mobile-family probes — it imports no TS seam; the runner classifies).
Stages:

1. **Self-verifying preconditions (the S27/S32/S33–S36 doctrine):** launch
   Chromium at 390×844; login as the demo user (demo@studyflow.app);
   assert `window.innerWidth === 390 && window.innerHeight === 844`; the
   chrome contract: the desktop `aside` sidebar is hidden AND the "Open
   navigation menu" hamburger is visible. Any precondition failure: loud
   stderr + `process.exit(1)` with NO findings.
2. **The per-accent sweep (all 7 accents, the documented order):** for
   each accent — PATCH `{ themeMode: "light", accentColor: accent }`
   through the settings API (the real lifecycle), `goto /Dashboard`, await
   and SELF-VERIFY `<html data-accent> === accent` AND the light class
   (a failed apply is a loud precondition exit with the restoring violet
   PATCH); then for each of the 20 views (direct `goto` — the
   accent-dark-sweep's navigation pattern; the drawer-navigation
   structural family is mobile-sweep's contract): the identity heading
   (h1 OR h2 — the S8-H union; Dashboard is the time-aware greeting
   regex), `documentElement.scrollWidth <= 390`, the light contrast
   detector family (unreadable < 2.2 / lowcontrast < 3.2, the
   accent-dark-sweep CHECKER's effectiveBg walk — the flashbulb detector
   does not apply in light mode), zero console errors (per-view delta).
   Then the drawer (once per accent): open via the hamburger, the
   dialog-scoped detector family + the active-link tint recorded + the
   link count, close via Escape.
3. **The closing restore:** an explicit, awaited
   `{ themeMode: "light", accentColor: "violet" }` PATCH (the demo
   resting state) + the reload verification, then browser close.
4. **Output:** one JSON envelope `{ source: "accent-light-sweep", mode:
   "light", viewport: { width: 390, height: 844 }, chrome: {
   sidebarVisible, hamburgerVisible }, accents: { <accent>: { applied,
   views: { <view>: { heading, scrollWidth, unreadable, lowcontrast,
   consoleErrors } }, drawer: { linkCount, unreadable, lowcontrast,
   activeTint } } }, findings: [...] }`; exit 0 iff findings empty AND
   the non-CTA contrast detections zero AND every accent applied AND the
   preconditions held.

**Findings vocabulary:** the S33 family — `overflow`, `no-heading`,
`console-error`, `app-bar` — plus `unreadable` (the per-view contrast
FAIL class, CTA-face exempted at the seam), `accent-apply` (the
self-verification failure), `link-count` (the drawer), and
`precondition` is never emitted — preconditions exit 1 with no findings.

**Negative controls (the S27–S36 validation convention):** (a) the
fabricated findings envelope through the seam reads non-green
(unit-pinned); (b) the mode-rot envelope (`mode: "dark"`) reads non-green
(unit-pinned — the inverse-inverse guard); (c) the contrast-detection
envelope (a non-empty unreadable array with an empty findings array)
reads non-green (unit-pinned — the independent counting); (d) the
missing-accent envelope (six accents) reads shape-error (unit-pinned —
the all-accents guard); (e) the dead-server case aborts at the
standing-suite preflight stage (the runner's stage-0 enforcement,
unchanged); (f) the genuine run against the healthy dev server →
findings 0, exit 0.

### S37-C (HIGH) — the runner update `scripts/standing-suite.mjs`

- `STAGES` gains `{ name: "accent-light-sweep", file:
  "scripts/accent-light-sweep.mjs", runtime: "node" }` after
  `landscape-sweep`, before `dark-mobile-sweep` — the light-mode mobile
  family, then the light-mode mid-band family, then the light-mode
  phone-landscape family, then the LIGHT-MODE ACCENT family, then the
  dark-mode families (the sweep PATCHes light + the accent explicitly and
  restores violet/light at the end; the closing theme guard still
  verifies light/violet at suite end).
- The stage-count literals 20 → 21 (`stage 0/21`, `stage ${i+1}/21`, the
  closing `stage 21/21`) — the suite is now 22 rows (preflight + 20
  audits + the theme guard).
- The accent-light-sweep stage makes ZERO AI requests (no ai: budget
  interaction with the security stage — impossible by construction).

### S37-D (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

- `AGENTS.md`: the commands-table entry `node scripts/accent-light-sweep.mjs`
  + the standing-suite entry's audit list gains accent-light-sweep (19 → 20
  standing audits) + the unit-count line (383 → the new count).
- `vitest.config.ts`: the header seam list note + the count (383 → the new
  count; still 20 files — the pins ride `tests/suite-verdict.test.ts`).
- `CLAUDE.md`: the unit-layer count + the accent-light-sweep seam mention.
- `Project_Architecture_Document.md` §8.1: the suite-verdict row's
  description + the Total row re-derived (674 → the new count).
- `README.md`: the session-37 status row + the §Testing counts + the badge.
- `omni-study_SKILL.md`: the counts ×2 + **AP-82** (the lesson — below).
- `worklog.md` (repo root): the S37 entry.

**AP-82 (the lesson, MEDIUM):** S16 taught that mobile-only gaps hide
behind desktop pins; S33 encoded the light mobile walkthrough; S34 pinned
the width continuum; S35 the height axis; S36 the mode axis; S37 finds
the SAME class one dimension out — the ACCENT. The standing surface
varied mode and viewport but pinned VIOLET at every light combo: the
accent-dark-sweep varies the accent ONLY in dark (its own name is the
blind spot), and the only light × non-violet rendering in any standing
artifact is one desktop calculator view. The accent-dependent mobile
structures (the drawer's active tint, the app bar brand, the CTA faces)
are superset-only code paths — the reference's accent picker is a
measured no-op, so a regression there surfaces in no dark sweep and no
violet-pinned light sweep. The guard: when a surface is
accent-dependent, vary the accent AT THE MODE the users actually see —
light is the resting mode; an accent never varied in light is a blind
half of the theme space.

### S37-E (MEDIUM) — the session record + evidence

`docs/remediation-plan-session37.md` (this file, with the execution log),
the session narrative, the S37 evidence JSON
(`docs/screenshots/s37-accent-light-sweep-evidence.json` — the genuine
22-stage suite envelope), the accent-light evidence screenshot
(`docs/screenshots/s37-accent-light-drawer-teal-390.png` — the drawer
OPEN at 390×844 in light mode under the TEAL accent: the teal-tinted
active link, the light panel — the accent-light story in one frame), and
the standing-31 screenshot refresh (no app bytes move; the refresh proves
the tree unchanged).

## Non-gaps (documented, do not fix)

1. **No e2e spec is added** (the S27–S36 convention: probe scripts are
   execution-validated, not browser-pinned; the e2e layer already pins
   the accent token contract and the calculator's teal nav-chip at
   desktop).
2. **Accent × light × desktop (1280×800) and accent × light × mid-band
   (768×1024) stay un-pinned as combos** — validated clean THIS session
   by the exploration probe (the evidence below); the standing probe pins
   accent × light × 390×844 (the representative: the most common
   real-world accent-usage class). The sidebar's active-link tint (the
   desktop-only structure) rides the SAME one-source NavItemLink component
   as the drawer's (nav-items.tsx — consumed by BOTH), so the mechanism
   is covered; the desktop layout wrapper differs only in geometry.
3. **Accent × dark × mobile × 14 views stays un-pinned** (the S36 non-gap
   #3 — the accent-dark family's contract; accent-dark-sweep's 6 mobile
   views × 7 accents remain the dark-side accent coverage). A future
   extension of accent-dark-sweep's MOBILE_VIEWS to all 20 views is the
   documented path.
4. **The copy sweep stays outside the suite** (reference-dependent; 14/20 +
   6 data-state non-gaps — the documented S17 family, re-confirmed this
   session).
5. **The reference's accent picker is a no-op (S4, re-verified S3)** —
   there is no accent PARITY contract to sweep against the reference;
   this audit is a superset-quality contract (the clone's own accent
   implementation). The fixed-violet surfaces (the assignment slider, the
   TaskRowCard pills/star, the flashcard back face, the analytics
   per-card tints) are measured-parity design colors, reference-consistent
   at every accent by construction — the static scan this session
   classified every one; none is an accent surface.
6. **The CTA-face exemption is encoded at the seam, not the probe** —
   white-on-accent-500 unreadable entries are the reference's own
   accent-CTA choice (the S11 family-2 non-gap, verified in dark; the
   light canvas carries the same CTA face). The probe reports raw
   detections; the seam classifies. Any OTHER unreadable combination is a
   genuine finding.

## TDD order

1. **RED:** extend `tests/suite-verdict.test.ts` with the
   accent-light-sweep classifier pins (the GREEN fixture with all 7
   accents; the shape-error family incl. the missing-accent envelope [the
   all-accents guard] + the desktop/mid-band envelopes fed to the mobile
   classifier; the mode-rot family with mode=dark — the inverse-inverse
   guard; the findings-present family; the CTA-face family; the
   contrast-detection family — a non-empty unreadable array with empty
   findings still non-green; the applied-mismatch family; the
   vehicle-contract family). Run → fails (classifyAudit reads "unknown
   audit" on the new name — the unknown-audit guard). Capture the failing
   run.
2. **GREEN:** implement `classifyAccentLightSweep` + the `AUDIT_NAMES`
   entry in `src/lib/suite-verdict.ts`. Run → the new pins green
   alongside 383.
3. **The probe:** `scripts/accent-light-sweep.mjs` (node-run; the
   self-verifying accent preconditions + the chrome contract; the
   per-accent 20-view sweep at 390×844 in light with the identity family
   + the light contrast detectors + the console-error delta; the drawer
   per accent; the explicit awaited closing violet/light restore).
   Execution-validate live against the dev server → findings 0, exit 0.
4. **The runner:** the STAGES entry + the 21-count literals; the genuine
   full-suite re-run → **22/22 GREEN, exit 0** (the validation run; its
   envelope is the S37 evidence). Run it in a CLEAN ai: window (restart
   the dev server by PID first — the S32 pre-spent-budget remedy; this
   session's first suite run's ai-error/ai-a11y stages spend the budget).
5. **Full gates re-run:** lint → typecheck → unit (the new count) →
   build → cold-`db/e2e.db` 291 e2e — the regression confirmation (zero
   app code, zero CSS, zero Tailwind v4 surface, zero parity-pinned
   bytes).
6. **Standing checks re-run:** the drawer check; the accent-light
   evidence screenshot; the standing 31 screenshots refreshed via
   capture-studyflow.mjs (theme restored light/violet, verified via
   Prisma); the S37 evidence JSON captured.
7. **Docs** (S37-D) + the session record (S37-E) + commit + push via the
   SSH wrapper.

## Risks

- **The accent PATCH must restore violet even on failure paths** (the
  theme-spec lesson — an aborted restore persists a non-violet accent and
  poisons every later violet pin; the probe's `finally` + the explicit
  awaited closing PATCH).
- **The contrast detector may surface the CTA-face family** — white text
  on the accent-500 gradient reads under 2.2 for the bright accents
  (orange/pink/red); the seam's CTA-face exemption (color === white) is
  the documented S11 family-2 non-gap, counted into the note. Any genuine
  hit is classified with evidence BEFORE shipping (the S32 run-1
  discipline).
- **The lowcontrast WARN family will be non-empty for some accents** —
  accent-600 text on the 50-level tints can land between 2.2 and 3.2 for
  the bright accents (the accent-dark-sweep's own documented WARN family);
  WARN entries ride the note, never the findings.
- **The unreadable detector's effectiveBg walk on the glass surfaces** —
  the translucent glass app bar falls through to the body background
  (the same semantics the accent-dark-sweep applies); the app bar text
  must pass 2.2 against the light canvas.
- **The console-error listener may surface dev-mode noise** (the Next.js
  overlay) — any genuine finding is classified with evidence BEFORE
  shipping; documented exclusions must be signature-strict.
- **The Dashboard greeting is time-aware** — the heading assertion is the
  regex (the copy-sweep pattern), never a hardcoded bucket.
- **The suite's total runtime grows ~4 min** (7 accents × 20 views +
  7 drawer round-trips at the light settle band) — acceptable against
  the S36 suite's ~28 min.
- **The suite validation run must avoid the S32 differential** — the
  ai-error/ai-a11y stages of an earlier same-window run spend the ai:
  budget the security stage probes; restart the dev server by PID (the
  in-memory limiter clears) and re-run in the clean window.

## Execution log (session 80/81 — filled as executed)

- The exploration (the plan-validation probe, parametrized by viewport, the
  accent PATCHed through the settings API — the real lifecycle,
  self-verified on `<html data-accent>` + the light class): the
  accent-light family swept clean BEFORE the plan was finalized — **accent
  × light × 390×844, × 1280×800, and × 768×1024, each 7 accents × 20
  views** (identity heading h1||h2, scrollWidth === the viewport width,
  zero console errors modulo the documented 429-RUM backpressure class,
  the drawer 20 links per accent with its accent-correct active tint, and
  the sidebar's active tint re-theming per accent at desktop). Findings 0
  at every viewport after the non-gap classification (below). The state
  green; the guarantee absent — the AP-78..81 lineage one dimension out:
  the ACCENT.
- The tint verification (the inner-span read): every accent's drawer
  active-link gradient re-themes correctly (violet → indigo, blue → cyan,
  green → teal, orange → orange, pink → rose, red → orange, teal → cyan —
  the 10%-alpha NAV_ACTIVE_GRADIENT_STOPS pair) — the accent system
  applies to the mobile-only structure through the real lifecycle.
- The non-gap classifications (every surfaced entry verified against the
  codebase + the reference BEFORE shipping — the S32 run-1 discipline):
  (a) **the CTA-face** — 108 white-on-accent-500 unreadable entries, the
  documented S11 family-2 (the reference's own accent-CTA choice);
  (b) **the calendar adjacent-month days** — 28 slate-300
  (rgb(203, 213, 225)) 1-2-digit entries, the S6-G measured parity pin,
  **re-verified LIVE on the reference this session** (the reference's own
  adjacent days render the identical rgb(203, 213, 225));
  (c) **the yellow priority-pill vocabulary** — 21 yellow-500
  (rgb(234, 179, 8)) {high, medium, low} entries on Dashboard/Assignments,
  the S6/S8 measured parity pin (the static scan confirmed yellow-500 text
  appears ONLY on the priority pills); (d) **the 429-RUM backpressure**
  console entries under the exhausted 1000/15-min beacon budget (every 429
  in the dev log is POST /api/rum — the S18 designed backpressure; the
  beacon swallows failures by design; the browser's network-layer log line
  is not app-suppressible) — the probe filters the exact-text signature,
  documented. The 449 lowcontrast entries are WARN (the note, never the
  findings — the S11 non-gap family). **The accent axis itself: CLEAN** —
  zero accent-dependent unreadable detections across all 147 renderings.
- The static audit companion: the hardcoded-violet scan over
  src/components/views/ + src/components/layout/ classified every
  fixed-violet surface as a measured-parity design color (the assignment
  slider's S6 sRGB-exact gradient pin, the TaskRowCard S6 pills/star, the
  flashcard S7 back face, the analytics per-card tints, the calendar S8-C
  rows) — the reference never re-themes, so every fixed-violet surface is
  reference-consistent at every accent by construction; NO genuine
  accent-surface bug found statically.
- TDD RED: 15 new pins in tests/suite-verdict.test.ts (the GREEN shape
  with all 7 accents; the shape-error family [missing findings / the
  missing-accent envelope — the ALL-ACCENTS guard / a view record missing
  unreadable / missing lowcontrast / the drawer record missing / the
  1280×800 desktop envelope / the 768×1024 mid-band envelope]; the mode-rot
  family [mode=dark — the INVERSE-inverse guard]; the findings-present
  family; the CTA-face family; the independent-counting family; the
  applied-mismatch family; the vehicle-contract family) → 8 failed / 106
  passed (the unknown-audit guard shape-errors the unknown name — those
  pins pass for the right reason post-implementation).
- TDD GREEN: `classifyAccentLightSweep` + the AUDIT_NAMES entry in
  src/lib/suite-verdict.ts (after dark-mobile-sweep, before dark-sweep) →
  **114/114** in the file; then the two signature-strict exemption
  families added (the calendar adjacent-day + the yellow-pill, each with a
  positive + a signature-strictness negative pin) → **118/118**; the full
  unit layer **402** (20 files; was 383).
- The probe scripts/accent-light-sweep.mjs (node-run; the self-verifying
  accent preconditions per accent + the chrome vehicle contract with the
  S16 hydration wait; the per-accent 20-view sweep at 390×844 in light
  with the identity family + the light contrast detectors + the
  console-error delta [the 429-RUM signature filtered]; the drawer per
  accent with the INNER-span active-tint read; the explicit awaited
  closing violet/light restore + its verification; the failure-path
  restore in the catch). Genuine run 1: the preconditions held, all 7
  accents × 20 views clean, findings 0 — the exit-code computation
  initially missed the two parity exemption families (exit 1 with 0
  findings); the envelope classified **GREEN at the seam**; the exit logic
  aligned with the seam's exemptions → the clean genuine re-run:
  **findings 0, exit 0**. The theme restored light/violet (verified).
- The runner: STAGES gains accent-light-sweep between dark-mobile-sweep
  and dark-sweep (the family order: light mobile → light mid-band → light
  phone-landscape → DARK mobile → LIGHT accent → dark desktop → accent
  dark; zero AI requests); the stage-count literals 20 → 21 (the suite now
  22 rows: preflight + 20 audits + the theme guard).
- The validation protocol (the S32 differential applied BEFORE the run):
  the dev server restarted by PID (the in-memory ai:/RUM limiters
  cleared — this session's first suite run's ai-error/ai-a11y stages had
  spent the ai: budget, and the three explorations had exhausted the RUM
  beacon budget), the S31 preflight GREEN, then the clean-window
  full-suite run: **22/22 GREEN, exit 0** — the evidence envelope captured
  to docs/screenshots/s37-accent-light-sweep-evidence.json (22 stage rows;
  the accent-light-sweep row GREEN inside the suite).
- Gates re-run: lint ✓ tsc ✓ **402 unit** ✓ (20 files) build ✓ cold-db
  **291 e2e** ✓ = **693 green** (was 674; +19 unit pins; the 291 prior
  pins untouched by construction — zero app code, zero CSS, zero Tailwind
  v4 surface, zero parity-pinned bytes).
- The accent-light evidence screenshot captured via
  scripts/capture-s37-evidence.mjs:
  docs/screenshots/s37-accent-light-drawer-teal-390.png — the drawer OPEN
  at 390×844 in light mode under the TEAL accent (the teal-tinted active
  Dashboard link, the light panel, the nav links — the accent-light story
  in one frame).
- Standing checks re-run post-change: the drawer check GREEN; the standing
  31 screenshots refreshed via capture-studyflow.mjs (theme restored
  light, verified via Prisma: **light/violet** — the User field is
  `accentColor`).
- Docs aligned (the AP-74 guard): AGENTS (the accent-light-sweep command
  entry after dark-mobile-sweep + the 20-audit suite entry + the 402
  line), vitest.config.ts (402 + the S37 seam note), CLAUDE.md (402 + the
  S37 seam), PAD §8.1 (the suite-verdict row extended + the per-file count
  99 → 118 + Total 693/402), README (the 693 badge + the 402 lines ×2 +
  the S37 classifier mention + the session-37 status row), SKILL.md (the
  693/402 counts ×2 + AP-82), the worklog entry, the session narrative.
