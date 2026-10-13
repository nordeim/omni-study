# Session 114 — The S47 narrative

The omni-study S47 iteration (the light × mid-band × volume family — the
S46 summary's own first named next candidate, the S47 mirror: the
S42→S43 / S44→S45 / S46→S47 family pattern; each dark half is followed by
its light mirror). This is the session transcript; the summary lives in
`docs/session_115.md`.

## The arrival

The workspace had been reset again (the documented pattern — the prior
session's local clone was destroyed after its push landed). The repo
re-cloned at `246f81a` (the S46 feat push `d9458c9` + the SKILL-count
alignment `10c9081` + the user's session_113 log updates); the environment
re-established (.env per the contract with `DATABASE_URL="file:../db/custom.db"`
and the S46 dev posture `AUTH_SECRET=""` — the bundled-`.env` lesson — with
`db/` at the repo root, `bun install`, the Playwright
chromium-headless-shell v1243 download — the fresh sandbox cache gap,
environmental), `db:push` + `db:seed` (the demo user + sample data).

Docs review: AGENTS.md, CLAUDE.md, README.md,
Project_Architecture_Document.md, omni-study_SKILL.md; session_112.md (the
S46 summary), remediation-plan-session46.md, the worklog tail, session_113.md
(the user's process log). Every current-state claim re-verified against the
codebase: the S46 artifacts present and clean (the
`accent-volume-dark-midband-sweep` probe, the
`classifyAccentVolumeDarkMidbandSweep` seam, the 37-pin block, the runner's
28-stage/30-row state, the s46 evidence, the standing 31); skills/
excluded per the brief; `.env.example` matches and is tracked.

## The baseline

**The 946-green baseline re-confirmed**: lint ✓ tsc ✓ **655 unit** ✓ (20
files) build ✓ cold-`db/e2e.db` **291 e2e ✓ 4.8 min** (the S46
always-cold-db convention applied: `rm -f db/e2e.db` before the run).

## The standing checks (all GREEN before the suite)

The S31 preflight GREEN; the drawer check GREEN; the live agent-browser
390×844 walkthrough GREEN — login → dashboard scrollWidth 390 → the drawer
with all 20 links in the documented order (nav scrollHeight 1068 vs
clientHeight 755 at 844 height) → navigate to Notes → **the drawer closes
on navigation** → the active link "Notes" carrying the violet
NAV_ACTIVE_GRADIENT_STOPS gradient on the inner span at the re-open —
**the mobile navigation menu is working as expected**. The mid-band
geometry anchor measured at 768×1024: the drawer nav scrollHeight 1068 vs
clientHeight 935 → scrollable TRUE, sidebarVisible=false +
hamburgerVisible=true (identical to the S46 measurement — the empirical
anchor for this session's seam contract, taken BEFORE the pins were
finalized). The reference re-swept **UNCHANGED since S19–S46** (the login
title "AcademiaFlow (Copy)", the email-prefix greeting, the 20 nav views
in the same order, the five Settings tabs). The copy sweep 14/20 MATCH
(the 6 data-state non-gaps). The arrival standing suite (30 rows, the
in-flight 28-audit version) launched for the arrival check.

## The genuine finding — and a transient one

**The governing finding**: the light × mid-band × volume cell —
ZERO-coverage at every accent, grep-verified (the S13 data-volume audit
runs 1280×800 light+violet only; the S34/S39 mid-band sweeps run LIGHT at
SEED volume; the S42–S45 volume × accent sweeps run 1280/390 only; the S46
mid-band volume sweep is DARK only — its own seam's rot-guard comment
names the light family as "the documented S47 mirror").

**The transient one**: the arrival suite read **29/30** — the S42
accent-volume-sweep stage fired its precondition ("the INVERTED chrome
contract broke at 1280 — sidebarVisible=false") once, inside the suite,
after the 17-min accent-dark stage had heated the server. Root cause: the
S42 probe's INITIAL chrome gate waited only on `html.dark` — which the
theme lifecycle's applyToDocument can satisfy when /api/auth/me resolves
while React has not yet COMMITTED the shell DOM, so the chrome read raced
the aside mount. Zero app bytes changed since the S46 30/30; green
standalone — the race, not a regression. **The field correction**: the
AP-90 shell-presence guard folded into the INITIAL gate's wait
(`html.dark && !!document.querySelector("aside nav")` — the S43
per-accent-gate correction applied to the initial gate; the S43
light-desktop sibling already safe via its greeting-heading gate).
Verified standalone post-fix: exit 0, findings 0.

## The fix (TDD, 38 new pins; 655 → 693 unit)

- The `accent-volume-light-midband-sweep` probe: the S13 profile
  (300/200/250) inserted through Prisma and COUNT-verified, then 7 accents ×
  the 7 volume-affected views navigated THROUGH THE DRAWER (the only vehicle
  below 1024) at 768×1024 in LIGHT mode, with the MID-BAND vehicle contract
  (the sidebar hidden + the hamburger visible) + the drawer-own nav-scroll
  contract at the mid-band geometry (scrollHeight 1068 vs clientHeight ~935,
  measured: links ~17–20 sit below the fold), the below-lg structural family
  at volume, the S13 budgets (the drawer-click → heading ≤ 1500ms, long
  tasks ≤ 1500ms, the /api/tasks ≤ 500KB B1 bound), the LIGHT checker with
  the THREE signature-strict light exemptions (the CTA-face + the calendar
  adjacent-month slate-300 + the yellow priority-pill yellow-500; NO
  flashbulbs — the class exists only in dark), the light-mode hydration gate
  (the greeting heading), and the interaction evidence via the pendingView
  pattern.
- The `classifyAccentVolumeLightMidbandSweep` seam on the S43–S46 doctrine:
  the mode rot guard INVERTED (mode MUST be light — the dark half is the
  S46 audit's own: the mode is the discriminator on this very cell), the
  viewport guard (768×1024 BOTH axes), the volume-EXACT guard, the
  ALL-ACCENTS + ALL-VIEWS guards, the MID-BAND vehicle contract + the
  drawer-own scroll contract, the structural below-lg family at volume, the
  S13 B2/B3 budgets with boundary-exact pins, and the LIGHT detector family
  with the THREE exemptions.
- The runner's 29th audit stage (25-min budget; ~3.0 min measured — ~8.5×
  headroom) directly after its dark mid-band sibling (the volume family:
  dark desktop, light desktop, dark mobile, light mobile, dark mid-band,
  then light mid-band) — the suite now 31 rows.

## The exploration and the validation

**The exploration** (the genuine run 1, after the arrival suite): **EXIT 0,
findings 0, 2m58s** — 49 renderings + 7 drawer records under the
COUNT-verified profile; the interaction GREEN (activeLabel === the view on
all 49 readings, activeTint a linear-gradient on all 49 — 7 DISTINCT
accent-correct pairs, the light × mid-band × volume cell closed); zero
non-exempt unreadable (65 total, ALL exempt: 23 CTA-face + 28 calendar +
14 yellow-pill — the identical counts to the S45 light mobile half,
deterministic); 3,284 lowcontrast WARN; the budgets with huge headroom
(max clickLatency 719ms vs 1500ms; max longTaskTotal 0ms); Tasks 7,894
mainNodes per accent (identical to all five prior halves); /api/tasks
112,960 bytes (the byte count identical to all prior halves). **The genuine
envelope classified GREEN at the new seam on the FIRST try** (the temporary
harness convention; deleted after).

**The validation suite** (the S32 differential: dev server restarted by
PID, preflight GREEN, the fresh clean window): **31/31 GREEN, exit 0** —
the new accent-volume-light-midband-sweep row GREEN inside the suite on
its first integration run (identical counts to the exploration —
deterministic), the fixed S42 stage green, every other stage green, the
theme-restore closing guard light/violet.

## The evidence

The screenshot
`docs/screenshots/s47-accent-volume-light-midband-teal-tasks-768.png` —
**verified in-frame** (the Tasks view at 300 rows in LIGHT under TEAL at
768×1024 with the DRAWER OPEN on the navigated Tasks view: the teal
NAV_ACTIVE_GRADIENT_STOPS gradient `rgba(20, 184, 166, 0.1) →
rgba(6, 182, 212, 0.1)` on the active link, linkCount 20, lightClass true,
mainNodes 7,894, 964 stress-row surfaces, zero non-exempt unreadable, 1
CTA-face exempt, scrollWidth 768, the nav geometry 1068 vs 935 scrollable,
the click latency 1,126ms — all verified in-frame); the evidence envelope
`s47-accent-volume-light-midband-sweep-evidence.json` (31 stage rows); the
standing 31 refreshed via capture-studyflow.mjs (theme verified via the
DB: light/violet).

## The close-out

No new AP lesson — the S47 probe was born with the S42–S46 guards folded
in (the COUNT-verified volume lifecycle, the light hydration gate, the
shell-presence gate, the finally-race fix, the AP-85 flush-callback exit)
and the exploration read GREEN on the first try: the accumulated doctrine
is doing its job. ONE field correction (not a new lesson — the AP-90
family applied to the S42 initial gate, root-caused from the single
in-suite failure and validated by the 31/31). The worklog entry + this
narrative + the session_115 summary + the plan's execution log + the
commit + the push to main via the SSH wrapper.
