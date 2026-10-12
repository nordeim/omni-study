# Session 103 — The S43 summary

The omni-study iteration (S43, workspace session 102) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace survived this time (no reset — the S42
state intact at `386e363` after the pull added session_101), the
environment verified as-is (.env per the contract, `db/` seeded at the
repo root), and the documented **809-green baseline re-confirmed** (lint
✓ tsc ✓ 518 unit ✓ build ✓ 291 cold-db e2e ✓ 4.4 min). Standing checks
all GREEN: the preflight, the drawer check, the live 390×844 mobile
walkthrough (**the mobile navigation menu is working as expected** — 20
links in order, drawer closes on navigation, the active link's violet
gradient verified on the inner span), the reference re-swept
**UNCHANGED since S19–S42**, the copy sweep 14/20 (6 data-state
non-gaps), and the S42 one-command standing suite **25/26** — the one
non-green row (accent-light-sweep: "Target crashed") was the
S41-documented environmental renderer-death class; the standalone
re-run read **deterministic-clean**, the loud-failure doctrine working
as designed.

**The genuine finding** — The S42 summary's own first named next
candidate: **the volume × LIGHT family — the documented bracketed
non-gap**. The coverage map, verified against the standing scripts: the
S13 data-volume audit runs LIGHT + VIOLET only (zero theme references,
grep-verified), the S37–S41 light-accent sweeps run at SEED volume
(zero volume lifecycle — no STRESS markers, no countMany, no prisma
inserts), and the S42 accent-volume-sweep runs DARK only (its seam's
own mode guard — its name the blind spot). So the cross-axis cell
**light × accent × volume** was ZERO-coverage at every accent: the
densest renderings (the 300-row Tasks list, the 250-event terminal
panel, the 200-note list) had never carried an accent in light, the
S13 volume budgets had never been measured under an accent in light,
and the sidebar's active-link tint had never been read in LIGHT at
VOLUME (S41 proved light at seed; S42 proved dark at volume).

**The fix (TDD, 32 new pins; 518 → 550 unit)** —
- The `accent-volume-light-sweep` probe: the S13 profile (300/200/250)
  inserted through Prisma and COUNT-verified, then 7 accents × the 7
  volume-affected views navigated THROUGH THE SIDEBAR at 1280×800 in
  light mode, with the S13 budgets (long tasks ≤ 1500ms, click→heading
  ≤ 1500ms, the /api/tasks ≤ 500KB B1 bound), the LIGHT checker
  (unreadable < 2.2 with the THREE signature-strict light exemptions —
  the CTA-face, the calendar adjacent-month slate-300 days, the
  yellow-500 priority pills; lowcontrast < 3.2 = WARN; NO flashbulbs —
  that class exists only in dark), and the interaction evidence in
  light at volume.
- The `classifyAccentVolumeLightSweep` seam on the S37–S42 doctrine:
  the mode rot guard INVERTED (mode MUST be light — the dark half is
  the S42 audit's contract), the volume-EXACT guard, the ALL-ACCENTS +
  ALL-VIEWS guards, the INVERTED chrome + sidebar-own scroll
  contracts, the boundary-exact budget pins, and the three
  signature-strict exemptions with strictness negatives.
- **Two field corrections the probe's own lifecycle caught** (the
  exploration exists to catch these BEFORE the runner integration):
  1. The light-mode hydration gate: the S42 dark model's mode gate
     (`!html.dark`) is TRUE at first paint in light mode — before the
     auth gate mounts the shell — so the chrome check raced. The S41
     greeting-heading gate adopted (a post-mount observable).
  2. The shell-presence race (caught by the validation run 1, then
     reproduced standalone): the per-accent gate (`data-accent ===
     accent`) can pass at first paint via the theme boot script's
     CACHED accent while the aside is not yet in the DOM — the
     immediate nav-geometry evaluate then crashes. The fix folds
     `!!document.querySelector("aside nav")` into the accent gates —
     applied to the S43 probe AND back-ported to the S41/S42
     sidebar-vehicle siblings (latent in both; the drawer-vehicle
     probes verified safe by Playwright's actionable-click
     auto-waiting). New lesson **AP-90**.
- The runner's 25th audit stage (25-min budget; ~2.6 min measured —
  ~10× headroom) directly after accent-volume-sweep — the suite now 27
  rows.

**Gates** — lint ✓ tsc ✓ **550 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **841 green** (was 809; +32 unit pins; the 291 prior pins untouched
by construction — zero app code, zero CSS, zero Tailwind v4 surface,
zero parity-pinned bytes).

**The validation suite** — run 1 read 26/27 (the new stage's
shell-presence crash — the genuine race above), the fix applied, run 2
(the S32 differential: dev server restarted by PID, preflight GREEN,
the fresh clean window): **27/27 GREEN, exit 0** — the new
accent-volume-light-sweep row GREEN inside the suite (identical counts
to the exploration — deterministic: 49 renderings, 49 tint readings, 7
sidebar records, 16 CTA-face + 28 calendar-day + 14 yellow-pill exempt,
3,404 WARN, the /api/tasks payload 112,960 bytes), every other stage
green, the theme-restore closing guard light/violet (verified via the
DB directly as well). The evidence envelope
`docs/screenshots/s43-accent-volume-light-sweep-evidence.json` (27
stage rows) + the evidence screenshot
`s43-accent-volume-light-teal-tasks-1280.png` (the Tasks view at 300
rows in LIGHT under TEAL, the sidebar's active link with the teal
gradient — mainNodes 7,894, 964 stress-row surfaces, zero non-exempt
unreadable, scrollWidth 1280, all verified in-frame). The standing 31
refreshed; the theme guard light/violet verified via Prisma.

**Pushed to main** — the feat commit + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different
repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command — `bun
scripts/standing-suite.mjs` (27 rows; ~80 min) in a clean window (the
S32 differential). The standing open items remain the first real
`docker compose --profile init up` on your Docker host and the upstream
dep patches (braces > 3.0.3, Prisma's deepmerge-ts pin). The volume ×
theme cross-axis is now swept on BOTH halves (dark + light at 1280):
the named next candidates are the **dark × mobile × volume cell** (the
390-viewport volume family), the **second cross-axis** (RUM-beacon
behavior under suite volume), or the mid-band/landscape volume cells.
New lessons recorded: **AP-89** (a mode half swept does not transfer
its proof to the sibling mode — each mode owns its own exemption
families, detector classes, and rendering path) and **AP-90** (a wait
condition satisfiable pre-mount is not a gate for post-mount reads —
the theme boot script satisfies accent/mode waits from cache at first
paint; gate on the DOM observable you are about to read).
