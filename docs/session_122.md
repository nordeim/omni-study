# Session 122 — The S49 summary

The omni-study iteration (S49, workspace session 121) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace was RESET this session: a fresh `git clone`
to `4e7f30f` (the S48 feat push `616bb2e` + the user's session_119/120 log
updates), the environment rebuilt from the contract (.env from
.env.example with the dev posture `AUTH_SECRET=""`, `bun install`,
`db:push` + `db:seed` — the demo user + 13 subjects at the repo-root
`db/custom.db`). ONE fresh-environment lesson re-learned, the documented
one: the first cold-db e2e attempt failed 267/291 with the Playwright
`Executable doesn't exist` launcher error — the browser cache does not
survive a workspace reset; `bunx playwright install chromium` restored the
full pass. The documented **1024-green baseline re-confirmed** (lint ✓ tsc
✓ 733 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓ 4.6 min). Standing checks
all GREEN: the preflight, the drawer check, the live 390×844 mobile
walkthrough (**the mobile navigation menu is working as expected** — 20
links in order, the nav scrollable 1068 vs 755 at 844 height, drawer
closes on navigation, the Notes active-link violet gradient verified on
the inner span at the re-open), **the landscape geometry anchor
re-measured at 844×390 in LIGHT** (the drawer nav scrollHeight 1068 vs
clientHeight 301 → scrollable TRUE — identical to the S35/S40/S48
measurements, the empirical anchor for this session's seam contract, taken
BEFORE the pins were finalized; the vehicle contract holds; the heading
clearance verified at the short viewport — the Dashboard greeting top 80 ≥
the 64px bar, the Notes :visible h2 top 586), the reference re-swept
**UNCHANGED since S19–S48**, and the copy sweep 14/20 (6 data-state
non-gaps).

**ONE environmental differential, documented and closed** — the first
arrival-suite launch was accidentally killed at stage 10/30 (a
syntax-verification one-liner on the just-edited runner EXECUTED the
module, spawning a second concurrent suite instance; both were killed to
protect the shared surfaces — the DB verified clean after). The relaunched
arrival suite then read **31/32** — the single failure the security
stage's own **documented pre-spent-budget differential**: the killed first
instance had already spent the in-memory login-limiter window on the same
dev-server process. Confirmed environmental twice: the dev server
restarted by PID → the security audit standalone read findings: [] GREEN
(run exactly ONCE — a diagnostic re-run trio first re-spent the AI-limiter
budget and read the C-family finding, the window's-ONLY-consumer doctrine
re-learned), and the validation suite below ran the security stage on the
fresh window → GREEN inside the suite. ZERO code findings — the limiter
code is correct.

**The genuine finding** — The S48 summary's own named next candidate:
**the light × landscape × volume family** (the S49 mirror, completing the
volume × theme × viewport cross-axis's LAST band: the S42→S43 / S44→S45 /
S46→S47 / S48→S49 family pattern). The coverage map, verified against the
standing scripts: the S13 data-volume audit runs 1280×800 light+violet
only, the S35/S40 landscape sweeps run 844×390 LIGHT at SEED volume (zero
volume markers; S40's every PATCH carries themeMode "light"), the S42–S47
volume × accent sweeps run 1280/390/768 only, and the S48 landscape volume
sweep is DARK only. So the cross-axis cell **light × landscape × accent ×
volume** was ZERO-coverage at every accent: the densest renderings had
never been rendered in LIGHT at the 844×390 landscape layout under ANY
non-violet accent at volume, the S13 volume budgets had never been
measured at the landscape viewport in LIGHT under an accent variation, and
the DRAWER's active-link tint had never been read through the real
navigation lifecycle in LIGHT at LANDSCAPE at VOLUME.

**The fix (TDD, 40 new pins; 733 → 773 unit)** —
- The `accent-volume-light-landscape-sweep` probe: the S13 profile
  (300/200/250) inserted through Prisma and COUNT-verified, then 7 accents
  × the 7 volume-affected views navigated THROUGH THE DRAWER at 844×390 in
  LIGHT mode, with the LANDSCAPE vehicle contract (the below-lg family) +
  the drawer-own nav-scroll contract at the landscape geometry
  (scrollHeight 1068 vs clientHeight ~301 — links ~8–20 below the fold,
  the nav's scroll the only path to them), the below-lg structural family
  at volume (drawer-closes-on-navigation, the fixed glass app bar with the
  2-digit-hour clock, the heading clearance under the 64px bar at its
  tightest — the bar covers 16% of the 390px viewport), the S13 budgets
  (the drawer-click → heading ≤ 1500ms, long tasks ≤ 1500ms, the /api/tasks
  ≤ 500KB B1 bound), the LIGHT checker with the THREE signature-strict
  light exemptions (the CTA-face white-on-accent + the calendar
  adjacent-month slate-300 day numbers + the yellow priority-pill
  yellow-500 — the reference's own design in light; NO flashbulbs — the
  class exists only in dark), the light-mode precondition through the REAL
  lifecycle with the greeting-heading hydration gate (the S43/S45/S47
  lesson: `!html.dark` is TRUE at first paint, so the gate is the
  POST-MOUNT observable), the per-accent gate with the shell-presence
  guard from birth (the AP-90 lesson applied to the landscape vehicle),
  and the interaction evidence via the pendingView pattern.
- The `classifyAccentVolumeLightLandscapeSweep` seam on the S43/S45/S47
  light doctrine with the S35/S40/S48 landscape vehicle: the viewport
  guard (844×390 BOTH axes — the transposed pair is a different device
  class), the mode rot guard INVERTED (mode MUST be light — the dark half
  is the S48 audit's own: the mode is the discriminator on this very
  cell), the volume-EXACT guard, the ALL-ACCENTS + ALL-VIEWS guards, the
  LANDSCAPE vehicle contract + the drawer-own scroll contract at the
  landscape geometry, the structural below-lg family at volume, the S13
  B2/B3 budgets with boundary-exact pins, and the LIGHT detector family
  with the THREE signature-strict light exemptions. **ZERO pin corrections
  — the RED phase read clean on the first try** (22 failed / 467 passed;
  the shape-error pins pass vacuously through the unknown-audit path,
  documented).
- The runner's 31st audit stage (25-min budget; ~3.0 min measured — ~8×
  headroom) directly after its dark landscape sibling — the suite now 33
  rows, **the volume × theme × viewport cross-axis COMPLETE: all EIGHT
  halves** (dark/light × desktop/mobile/mid-band/landscape).

**Gates** — lint ✓ tsc ✓ **773 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **1064 green** (was 1024; +40 unit pins; the 291 prior pins untouched by
construction — zero app code, zero CSS, zero Tailwind v4 surface, zero
parity-pinned bytes).

**The validation suite** — the S32 differential (dev server restarted by
PID, preflight GREEN, the fresh clean window): **33/33 GREEN, exit 0** —
the new accent-volume-light-landscape-sweep row GREEN inside the suite on
its FIRST integration run (identical counts to the exploration —
deterministic: 49 renderings, 49 active-tint readings, 7 distinct tints,
Tasks 7,894 mainNodes, /api/tasks 112,960 bytes, 23 CTA-face + 28
calendar-day + 14 yellow-pill exempt, 3,284 WARN), the security stage
green on the fresh window, every other stage green, the theme-restore
closing guard light/violet. The evidence envelope
`docs/screenshots/s49-accent-volume-light-landscape-sweep-evidence.json`
(33 stage rows) + the evidence screenshot
`s49-accent-volume-light-landscape-teal-tasks-844.png` (the Tasks view at
300 rows in LIGHT under TEAL at 844×390 with the drawer OPEN on the
navigated Tasks view — the teal gradient on the active link, linkCount 20,
lightClass true, mainNodes 7,894, 964 stress-row surfaces, zero
non-exempt unreadable, scrollWidth 844, the nav geometry 1068 vs 301
scrollable, the click latency 1,159ms — all verified in-frame) + the
standing 31 refreshed.

**Pushed to main** — the feat commit + the process-log commits via the
SSH wrapper (key verified + shredded; the wrapper's DEFAULT remote is a
different repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command — `bun
scripts/standing-suite.mjs` (33 rows; ~110 min) in a clean window (the S32
differential — and never syntax-check the runner via an import: the
module EXECUTES on load; use `node --check`). The standing open items
remain the first real `docker compose --profile init up` on your Docker
host and the upstream dep patches (braces > 3.0.3, Prisma's deepmerge-ts
pin). The volume × theme × viewport cross-axis is now COMPLETE (all EIGHT
halves) — the named next candidates are the **second cross-axis
(RUM-beacon behavior under suite volume — the S45–S48 summaries' named
family)** or the **dark × landscape × SEED cell for the 13 volume-invariant
views** (the S46 plan's carried note). No new AP lesson from the probe
itself — it was born with the S43–S48 guards folded in, the RED phase read
clean on the first try, and the exploration read GREEN on the first try —
but the runner-execution trap (an `import()` syntax check SPAWNS the
suite) is now documented in this summary and the plan's process note as
the session's one operational lesson.
