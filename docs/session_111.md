# Session 111 — The S46 narrative

The omni-study S46 iteration (the dark × mid-band × volume family — the
S45 summary's own first named next candidate, the mid-band/landscape ×
volume cells, the dark half first: the S42→S43 / S44→S45 family pattern).
This is the session transcript; the summary lives in
`docs/session_112.md`.

## The arrival

The workspace had been reset again (the documented pattern — the prior
session's local clone was destroyed after its push landed). The repo
re-cloned at `1ca3d7a` (the S45 feat push `3133d0c` + the user's
session_110 log updates); the environment re-established (.env per the
contract with `DATABASE_URL="file:../db/custom.db"` and `db/` at the repo
root, `bun install`, the Playwright chromium-headless-shell v1243 download
— the fresh sandbox cache gap, environmental), `db:push` + `db:seed` (the
demo user + sample data).

Docs review: AGENTS.md, CLAUDE.md, README.md,
Project_Architecture_Document.md, omni-study_SKILL.md; session_109.md (the
S45 summary), remediation-plan-session45.md, the worklog tail, session_110.md
(the user's process log). Every current-state claim re-verified against the
codebase: the S45 artifacts present and clean (the
`accent-volume-light-mobile-sweep` probe, the
`classifyAccentVolumeLightMobileSweep` seam, the 35-pin block, the runner's
27-stage/29-row state, the s45 evidence, the standing 31); skills/
excluded per the brief; `.env.example` matches and is tracked.

## The baseline — and two environmental findings

**The 909-green baseline re-confirmed**: lint ✓ tsc ✓ **618 unit** ✓ (20
files) build ✓ cold-`db/e2e.db` **291 e2e ✓ 4.6 min** — after diagnosing
TWO environmental findings on the way (both now documented in AGENTS.md,
the `bun run test:e2e` row — the S46 extension of the S45 day-boundary
lesson):

1. **The s22 bundled-`.env` class**: the negative-spawn spec times out
   when the repo-root `.env` carries a REAL AUTH_SECRET — Next's
   standalone output COPIES the repo `.env` into `.next/standalone/.env`
   at build time, so the bundled secret satisfies the boot guard and the
   server correctly boots (the spec's explicit env omission controls the
   process env, NOT the bundled file). The fix: the `.env.example` dev
   posture (`AUTH_SECRET=""` — dev falls back to the local constant with
   the boot warning) + a rebuild.
2. **The s23 always-cold-db class**: the import round-trip posts a
   FIXED-id envelope, so any SECOND consecutive run against the aged
   scratch db reads `created: 0, updated: 1` instead of
   `created: 1, updated: 0` and fails — not just across UTC midnights
   (the S45 lesson), across ANY re-run. The fix: `rm -f db/e2e.db`
   before EVERY full e2e run.

## The standing checks (all GREEN before the suite)

The S31 preflight GREEN; the drawer check GREEN; the live agent-browser
390×844 walkthrough GREEN — login → dashboard scrollWidth 390 → the drawer
with all 20 links in the documented order (nav scrollHeight 1068 vs
clientHeight 755 at 844) → navigate to Notes → **the drawer closes on
navigation** → the active link "Notes" carrying the violet
NAV_ACTIVE_GRADIENT_STOPS gradient on the inner span, read at the re-open
(**the mobile navigation menu is working as expected** — the standing
emphasis); **the mid-band geometry anchor measured at 768×1024** (the
chrome contract: sidebarVisible=false + hamburgerVisible=true; the drawer
nav scrollHeight **1068** vs clientHeight **935** → scrollable TRUE — the
empirical anchor for the seam's nav-scroll contract, taken BEFORE the pins
were finalized; links ~17–20 sit below the fold at 1024 height); the
reference re-sweep **UNCHANGED since S19–S45** (login title "AcademiaFlow
(Copy)", the email-prefix greeting "Good morning, sepnetflix2023 👋" — the
bucket varies by hour, the email prefix is the invariant, the same 20 nav
views in the same order, the same five Settings tabs
Appearance/Profile/Subjects/Holidays/Notifications); the 20-view copy
sweep against the `:3200` standalone **14/20 MATCH** (the 6 diffs all
data-state — the documented S17 family). The clean window: :3200 killed by
PID, the dev server restarted fresh, the arrival standing suite (29 rows,
the in-flight 27-audit version — the S46 stage commented out at launch and
re-added after the run loaded, the documented pattern) launched detached.

## The coverage map (the S46 scope confirmed)

Grep-verified against the standing scripts: the S13 data-volume audit runs
`viewport: { width: 1280, height: 800 }` (line 77) — desktop, light+violet
only, zero theme references; `midband-sweep` (S34) + `accent-midband-sweep`
(S39) run 768×1024 — SEED volume (the `STRESS|countMany|createMany|
deleteMany` grep returns ZERO hits) and LIGHT only (S39's every PATCH
carries `themeMode: "light"`); the S42/S43 volume × accent sweeps run
`const W = 1280`; the S44/S45 mobile volume sweeps run `const W = 390` with
mode preconditions `mode !== "dark"` / `mode !== "light"`; and **NO dark
sweep runs at 768 at all** (dark-sweep / accent-dark-sweep /
dark-mobile-sweep grep-verified at other widths). **The dark × mid-band ×
volume cell is ZERO-coverage at every accent**: the densest renderings (the
300-row Tasks list, the 250-event terminal panel, the 200-note list) had
never been rendered in DARK at the 768×1024 stacked layout under ANY
accent, the S13 volume budgets had never been measured at the mid-band
viewport in DARK under a theme variation, AND the DRAWER's active-link tint
had never been read through the real navigation lifecycle in DARK at
MID-BAND at VOLUME (S34 proved mid-band light+violet at seed; S39 accent ×
mid-band at seed light; S42 dark × volume at desktop; S44 dark × volume at
mobile).

## The plan

`docs/remediation-plan-session46.md` written per the S45 plan structure
(the audit surfaces, the governing finding, the families S46-A/B/C/D/E, the
non-gaps, the TDD order, the risks, the execution log — filled as
executed).

## TDD RED → GREEN

**RED**: 37 S46 pins appended to `tests/suite-verdict.test.ts` (the
s46Envelope generator — the DARK family's record shape WITH the flashbulbs
family, re-anchored to 768×1024) → **21 failed / 350 passed** under the
un-extended seam (the audit name unknown to it; the 16 shape-error pins
pass vacuously through the unknown-audit path — documented; all 21
failures verified in the S46 block).

**GREEN**: the `classifyAccentVolumeDarkMidbandSweep` seam in
`src/lib/suite-verdict.ts` (the AUDIT_NAMES entry + the dispatch arm + the
classifier: the viewport guard [768×1024 BOTH axes], the mode rot guard
[mode MUST be dark — the light × mid-band × volume family is the
documented S47 mirror], the volume-EXACT guard [300/200/250], the
ALL-ACCENTS + ALL-VIEWS guards, the MID-BAND vehicle contract [the
below-lg family] + the drawer-own scroll contract at the mid-band geometry,
the per-accent applied self-verification, the drawer link census + the
drawer-error class, the interaction classes in DARK at MID-BAND at volume,
the structural below-lg family at volume, the S16 overflow class at the
mid-band width, the S13 B2/B3 budgets with boundary-exact pins, the DARK
detector family [flashbulbs always findings; the CTA-face exemption ONLY —
the light-mode calendar-day + yellow-pill exemptions do NOT apply in dark],
the /api/tasks ≤ 500KB B1 bound) → **371/371 in the file; the full unit
layer 655 (618 + 37)**; lint ✓ tsc ✓.

## The probe

`scripts/accent-volume-dark-midband-sweep.mjs`: the S44 volume lifecycle +
drawer vehicle verbatim (the COUNT-verified 300/200/250 insert, the marker
`STRESS-S46-`, the API stats, the MEASURE block, the pendingView pattern,
the below-lg structural family, the finally-race fix from birth, the
precondition fail() THROWS) + the S42/S44 dark checker verbatim + the
drawer-scoped dark checker + the dark-mode precondition through the REAL
lifecycle (no first-paint race in dark) + the per-accent gate with the
shell-presence guard folded in (`data-accent === accent && html.dark &&
!!header` — the AP-90 lesson applied to the mid-band vehicle) + the
drawer-own nav-scroll contract re-measured per accent at the mid-band
geometry. Syntax ✓; the flashbulb mentions grep-verified detector-only.

## The runner + the docs (during the in-flight arrival suite)

The 28th audit stage (25-min budget) directly after
accent-volume-light-mobile-sweep (the volume family: dark desktop, light
desktop, dark mobile, light mobile, then dark mid-band) + the stage-count
literals (0/28, `${i+1}/28` ×2, 28/28) + the header comment — the suite
now **30 rows**. Docs aligned (the AP-74 guard): AGENTS (the 655 line +
the command entry + the 28-audit suite entry + the TWO e2e lessons),
vitest.config.ts (655), CLAUDE (655 + the S46 seam note), PAD §8.1 (the
S46 classifier note + 334 → 371 + Total 946/655), README (the 946 badge +
the 655 lines ×2 + the session-46 status row), SKILL (the 946/655 counts
×2). The evidence capture script `scripts/capture-s46-evidence.mjs` (the
S45 pattern mirrored; marker `STRESS-S46-CAP-`). `.env.example` audited
(matches, tracked).

## The arrival suite + the exploration

**The arrival suite: 29/29 GREEN, exit 0** (the theme-restore closing guard
light/violet). The exploration — the genuine run 1 of the S46 probe:
**EXIT 0, findings 0, ~3.0 min measured** (2m59.318s — the same band as
the S44/S45 mobile halves' ~2.9 min; ~8.4× headroom under the 25-min
budget). The envelope: 49 renderings + 7 drawer records under the
COUNT-verified 300/200/250 profile; the interaction GREEN — activeLabel ===
the view on all 49 readings, activeTint a linear-gradient on all 49 [7
DISTINCT accent-correct NAV_ACTIVE_GRADIENT_STOPS pairs — **the dark ×
mid-band × volume cell closed**]; the MID-BAND vehicle contract holds
[sidebarVisible=false + hamburgerVisible=true + drawerNavScrollable=true —
the nav scroll geometry confirmed at 1024 height: 1068 vs ~935]; the
budgets hold with huge headroom [max click 789ms vs 1500; max longTask
0ms]; the density real [Tasks 7,894 mainNodes / My Day 3,381 / Events
3,133 / Notes 2,430 — identical to the four prior halves, deterministic];
**zero flashbulbs across all 49 + 7 drawer records**; **zero non-exempt
unreadable** — 2 total, both CTA-face exempt [the S11 family-2 non-gap —
identical to the S42/S44 dark halves]; 32 lowcontrast WARN [the S11
non-gap family — identical to the S42/S44 dark counts]; the API stats
/api/tasks 112,960 bytes @ 66ms (the B1 bound holds) + /api/notes 77,410
@ 73ms + /api/events 79,952 @ 20ms (the byte counts identical to the
prior halves — deterministic); the drawer census 20/20 per accent;
scrollWidth 768 on every rendering; the cleanup deleted the marker rows.
**The genuine envelope classified GREEN at the new seam on the FIRST try**
(the temporary vitest harness — deleted after, the S42–S45 convention).
The theme restored light/violet (verified via the DB).

## The validation suite (the S32 differential)

Dev server restarted by PID, preflight GREEN, the fresh clean window:
**30/30 GREEN, exit 0** — the new accent-volume-dark-midband-sweep row
GREEN inside the suite on its FIRST integration run (identical counts to
the exploration — 49 renderings, 112,960 bytes, 2 CTA-face exempt, 32 WARN
— deterministic), every other stage green, the theme-restore closing guard
light/violet. The evidence envelope extracted to
`docs/screenshots/s46-accent-volume-dark-midband-sweep-evidence.json`
(30 stage rows).

## The gates

lint ✓ tsc ✓ **655 unit** ✓ (20 files) build ✓ cold-db **291 e2e ✓** =
**946 green** (was 909; +37 unit pins; the 291 prior pins untouched by
construction — zero app code, zero CSS, zero Tailwind v4 surface, zero
parity-pinned bytes).

## The evidence

The screenshot
`docs/screenshots/s46-accent-volume-dark-midband-teal-tasks-768.png` —
**verified in-frame** (the Tasks view at 300 rows in DARK under TEAL at
768×1024 with the DRAWER OPEN on the navigated Tasks view: the teal
NAV_ACTIVE_GRADIENT_STOPS gradient `rgba(20, 184, 166, 0.1) →
rgba(6, 182, 212, 0.1)` on the active link, linkCount 20, darkClass true,
mainNodes 7,894, 964 stress-row surfaces, zero flashbulbs, zero non-exempt
unreadable, scrollWidth 768, the nav geometry 1068 vs 935, the click
latency 1,246ms — all verified in-frame); the standing 31 refreshed via
capture-studyflow.mjs (theme restored light); the theme verified via the
DB: light/violet.

## The close-out

No new AP lesson — the S46 probe was born with the S42/S43/S44/S45 guards
folded in (the COUNT-verified volume lifecycle, the shell-presence gate,
the finally-race fix, the AP-85 flush-callback exit) and the exploration
read GREEN on the first try: the accumulated doctrine is doing its job.
TWO operational notes (not AP lessons — environmental): the bundled-`.env`
s22 class + the always-cold-db s23 class (AGENTS.md, the `bun run
test:e2e` row). The worklog entry + this narrative + the session_112
summary + the plan's execution log + the commit + the push to main via the
SSH wrapper.
