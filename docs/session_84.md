# Session 84 — The S37 accent × light sweep

The workspace refreshed from a clean clone (`git clone` at `f10a7ee` — the
session_83 transcript had landed on the remote; the local workspace had
been reset); the environment rebuilt (bun install, `db:push` + `db:seed`
the fresh `db/custom.db`), and `.env` recreated per the contract
(`DATABASE_URL="file:../db/custom.db"`, the db folder at the repo root).
The core docs read (AGENTS through the S36 rows, CLAUDE, README, PAD
through the S36 rows, SKILL through AP-81), then the session docs
(session_82 + session_83 + remediation-plan-session36 + the worklog S36
entry); every current-state claim re-verified against the codebase on
arrival (the vitest 20-file/383 config, the playwright 291-spec config,
the 19-audit STAGES list, the .env.example git-tracked, the db/ folder at
the root; skills/ excluded per the brief).

## The validation on arrival

The **674-green baseline re-confirmed**: lint ✓ tsc ✓ **383 unit** ✓
(20 files) build ✓ cold-`db/e2e.db` **291 e2e** ✓ (4.2 min). The
standing checks all GREEN: the S31 preflight, the mobile-drawer check,
the live agent-browser 390×844 walkthrough (**the mobile navigation menu
is working as expected** — login → dashboard scrollWidth 390 → the
drawer's 20 links in the documented order → drawer closes on navigation
→ the Settings Profile tab's Email address card above the Change
password + Danger zone cards), the reference re-sweep **UNCHANGED since
S19–S36** (the login title, the zero-data dashboard with the
email-prefix greeting, the same 20 nav views in the same order, the same
five Settings tabs with School/Grade/Goal on Profile), the copy sweep
**14/20 MATCH** with the 6 diffs all data-state (the documented S17
family), and the S36 one-command standing suite **21/21 GREEN, exit 0** —
zero code findings on arrival.

## The governing finding — the ACCENT axis in LIGHT mode

The production-readiness sweep's next un-varied axis. The coverage map,
verified against the standing scripts this session:

1. **accent-dark-sweep** varies all 7 accents — but ONLY in **dark mode**
   (its own name is the blind spot).
2. **The mobile/midband/landscape/dark-mobile sweeps never vary the
   accentColor at all** — they ride the demo user's resting violet.
3. **The only light × non-violet rendering in any standing artifact is
   ONE desktop calculator view** (the teal e2e pin). Light × accent ×
   mobile: zero coverage for all 20 views.
4. **The reference's accent picker saves but never re-themes**
   (re-verified live in session 3) — the clone's working accent system is
   the functional superset, so its light-mode correctness is a
   superset-quality contract guaranteed by nothing at execution time.

The static audit companion (the hardcoded-violet scan) classified every
fixed-violet surface as a measured-parity design color — the reference
never re-themes, so fixed-violet is reference-consistent at every accent
by construction; no genuine accent-surface bug found statically.

## The exploration (the plan-validation probe)

The accent-light family swept clean BEFORE the plan was finalized —
**accent × light × 390×844, × 1280×800, and × 768×1024, each 7 accents ×
20 views**, findings 0 at every viewport after the non-gap
classification. The tint verification proved every accent's drawer
active-link gradient re-themes correctly (the 10%-alpha
NAV_ACTIVE_GRADIENT_STOPS pair read on the INNER span — the outer `<a>`
read returns none). Every surfaced contrast entry classified with
evidence BEFORE shipping (the S32 run-1 discipline): the CTA-face (108
white-on-accent-500 — the S11 family-2), the calendar adjacent-month
days (28 slate-300 entries — the S6-G pin, **re-verified LIVE on the
reference this session: the reference's own adjacent days render the
identical rgb(203, 213, 225)**), the yellow priority-pill vocabulary (21
yellow-500 {high,medium,low} entries — the S6/S8 pin), and the 429-RUM
backpressure console entries (the S18 beacon's designed 1000/15-min
budget, exhausted by the day's sweep volume — every 429 in the dev log
is POST /api/rum; the beacon swallows failures by design). **The accent
axis itself: CLEAN** — zero accent-dependent unreadable detections.

## The fix (TDD, 19 new pins)

- **RED**: 15 pins in `tests/suite-verdict.test.ts` (the GREEN shape
  with all 7 accents; the shape-error family incl. the missing-accent
  envelope — the ALL-ACCENTS guard — and the desktop/mid-band envelopes
  fed to the mobile classifier; the mode-rot family [mode=dark — the
  INVERSE-inverse guard]; the findings-present, CTA-face,
  independent-counting, applied-mismatch, and vehicle-contract families)
  → 8 failed under the unknown-audit guard.
- **GREEN**: `classifyAccentLightSweep` + the `AUDIT_NAMES` entry in
  `src/lib/suite-verdict.ts` (after dark-mobile-sweep, before
  dark-sweep) → 114/114; then the two signature-strict exemption
  families (the calendar adjacent-day + the yellow-pill, each with a
  positive + a signature-strictness negative pin — a slate-300
  non-day-number text and a yellow-500 text outside the priority
  vocabulary still read non-green) → **118/118**; the full unit layer
  **402**.
- **The probe** `scripts/accent-light-sweep.mjs`: the self-verifying
  accent preconditions per accent (PATCHed through the settings API,
  verified on `<html data-accent>` + the light class), the chrome
  vehicle contract with the S16 hydration wait, the per-accent 20-view
  sweep at 390×844 (direct goto — the accent-dark-sweep's navigation
  pattern), the light contrast detector family (flashbulb does not apply
  on the light canvas), the drawer per accent, the 429-RUM
  exact-text-signature filter, and the explicit awaited closing
  violet/light restore. **Genuine run: findings 0, exit 0**; the
  envelope classified GREEN at the seam.
- **The runner**: STAGES gains accent-light-sweep between
  dark-mobile-sweep and dark-sweep (light mobile → light mid-band →
  light phone-landscape → DARK mobile → LIGHT accent → dark desktop →
  accent dark); the stage-count literals 20 → 21 (the suite now 22
  rows).
- **The validation protocol** (the S32 differential): the dev server
  restarted by PID first (the ai: + RUM budgets cleared), the S31
  preflight GREEN, then the clean-window full-suite run: **22/22 GREEN,
  exit 0** — the evidence envelope
  `docs/screenshots/s37-accent-light-sweep-evidence.json` (the
  accent-light-sweep row GREEN inside the suite: "7 accents swept × 140
  view renderings + 7 drawer records at 390×844 in MODE light; every
  accent self-verified applied").
- **Full gates re-run green**: lint ✓ tsc ✓ **402 unit** ✓ build ✓
  cold-db **291 e2e** ✓ = **693 green** (was 674; +19 unit pins; zero
  app code, zero CSS, zero Tailwind v4 surface, zero parity-pinned
  bytes).

## The evidence + the docs

The accent-light evidence screenshot
`docs/screenshots/s37-accent-light-drawer-teal-390.png` (the drawer OPEN
at 390×844 in light mode under the TEAL accent — the teal-tinted active
Dashboard link, the light panel) via `scripts/capture-s37-evidence.mjs`;
the standing 31 screenshots refreshed via `capture-studyflow.mjs`
(theme restored light, verified via Prisma: light/violet). Docs aligned
(the AP-74 guard): AGENTS (the command entry + the 20-audit suite entry
+ the 402 line), vitest.config.ts (402 + the S37 seam note), CLAUDE.md
(402 + the S37 seam), PAD §8.1 (the suite-verdict row + the per-file
count 99 → 118 + Total 693/402), README (the 693 badge + the 402 lines
×2 + the S37 classifier mention + the session-37 status row), SKILL.md
(the 693/402 counts ×2 + **AP-82** — the accent-never-varied-in-light
lesson), the worklog S37 entry, and this narrative.

**Pushed to main** — the feat commit + the transcript + the summary via
the SSH wrapper (key verified + shredded; the wrapper's DEFAULT remote
is a different repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (now 22 rows) in a clean 15-min window.
The standing open items remain: the first real `docker compose --profile
init up` on the owner's Docker host; the accent × dark × mobile × 14
views matrix (the accent-dark family's contract — extend
accent-dark-sweep's MOBILE_VIEWS); and the upstream dep patches (braces
> 3.0.3, Prisma's deepmerge-ts pin) will clear the dep-audit envelope
when they land.
