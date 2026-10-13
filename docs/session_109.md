# Session 109 — The S45 summary

The omni-study iteration (S45, workspace session 108) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace had been reset again (the documented
pattern); the repo re-cloned at the S44 state (`84fcc01` = the S44 push
`1246fcd` + the user's session_107 log updates), the environment
re-established (.env per the contract, `db/` seeded at the repo root,
`bun install`, the Playwright chromium-headless-shell v1243 download — the
fresh sandbox cache gap), and the documented **874-green baseline
re-confirmed** (lint ✓ tsc ✓ 583 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓
4.3 min). Standing checks all GREEN: the preflight, the drawer check, the
live 390×844 mobile walkthrough (**the mobile navigation menu is working as
expected** — 20 links in order, drawer closes on navigation, the active
link's violet gradient verified on the inner span at the re-open), the
reference re-swept **UNCHANGED since S19–S44**, the copy sweep 14/20 (6
data-state non-gaps), and the S44 one-command standing suite **28/28** (the
in-flight 26-audit version — every stage green).

**The genuine finding** — The S44 summary's own first named next candidate:
**the light × mobile × volume family — the documented bracketed non-gap**.
The coverage map, verified against the standing scripts: the S13
data-volume audit runs 1280×800 light+violet only, every mobile-viewport
sweep runs at seed volume, the S42/S43 volume × accent sweeps run 1280×800
only, and the S44 dark-mobile volume sweep is DARK only (its mode
precondition — the mode axis is its blind spot). So the cross-axis cell
**light × mobile × accent × volume** was ZERO-coverage at every accent: the
densest renderings had never been rendered in LIGHT at the stacked mobile
layout under ANY accent, the S13 volume budgets had never been measured at
the mobile viewport in LIGHT under a theme variation, and the DRAWER's
active-link tint had never been read through the real navigation lifecycle
in LIGHT at MOBILE at VOLUME.

**The fix (TDD, 35 new pins; 583 → 618 unit)** —
- The `accent-volume-light-mobile-sweep` probe: the S13 profile
  (300/200/250) inserted through Prisma and COUNT-verified, then 7 accents ×
  the 7 volume-affected views navigated THROUGH THE DRAWER (the only vehicle
  below 1024) at 390×844 in LIGHT mode, with the MOBILE vehicle contract
  (the sidebar hidden + the hamburger visible — the INVERSE of the desktop
  seams) + the drawer-own nav-scroll contract (the nav MUST scroll at 844
  height — the only path to links ~14–20), the mobile structural family at
  volume (the drawer closes on navigation, the fixed glass app bar with the
  2-digit-hour clock, the heading clearance under the 64px bar), the S13
  budgets (the drawer-click → heading ≤ 1500ms over the drawer-close +
  view-mount path, long tasks ≤ 1500ms, the /api/tasks ≤ 500KB B1 bound),
  the LIGHT checker (NO flashbulbs — the class exists only in dark, light
  surfaces are by-design on the light canvas; unreadable < 2.2 with the
  THREE signature-strict light exemptions — the CTA-face + the calendar
  adjacent-month slate-300 + the yellow priority-pill yellow-500;
  lowcontrast < 3.2 = WARN), the light-mode hydration gate (the greeting
  heading — the S43 lesson), and the interaction evidence in LIGHT at MOBILE
  at volume (the pendingView pattern).
- The `classifyAccentVolumeLightMobileSweep` seam on the S43–S44 doctrine:
  the mode rot guard INVERTED (mode MUST be light — the dark × mobile ×
  volume family is the S44 audit's own; the MODE is the discriminator on
  this very 390×844 cell), the volume-EXACT guard, the ALL-ACCENTS +
  ALL-VIEWS guards, the MOBILE vehicle contract + the drawer-own scroll
  contract, the structural mobile finding classes at volume, the S13 B2/B3
  budgets with boundary-exact pins, and the LIGHT detector family with the
  THREE signature-strict exemptions.
- The light-mode hydration gate + the shell-presence guard folded in from
  birth (the AP-90 lesson applied to the mobile vehicle in LIGHT: the
  header is the post-mount observable) — no field corrections needed; the
  exploration read GREEN on the first try.
- The runner's 27th audit stage (25-min budget; ~2.9 min measured — ~8.5×
  headroom) directly after its dark sibling (the volume family together:
  dark desktop, light desktop, dark mobile, then light mobile) — the suite
  now 29 rows.

**Gates** — lint ✓ tsc ✓ **618 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **909 green** (was 874; +35 unit pins; the 291 prior pins untouched by
construction — zero app code, zero CSS, zero Tailwind v4 surface, zero
parity-pinned bytes). ONE environmental finding on the way: the e2e scratch
db had aged across the UTC midnight boundary (the seed's idempotent upserts
do not refresh day-relative dates on existing rows → 4 deterministic
date-relative failures); deleting `db/e2e.db` re-seeded fresh → 291 green.
Documented in AGENTS.md (the day-boundary lesson).

**The validation suite** — the S32 differential (dev server restarted by
PID, preflight GREEN, the fresh clean window): **29/29 GREEN, exit 0** —
the new accent-volume-light-mobile-sweep row GREEN inside the suite on its
first integration run (identical counts to the exploration —
deterministic), every other stage green, the theme-restore closing guard
light/violet. The evidence envelope
`docs/screenshots/s45-accent-volume-light-mobile-sweep-evidence.json` (29
stage rows) + the evidence screenshot
`s45-accent-volume-light-mobile-teal-tasks-390.png` (the Tasks view at 300
rows in LIGHT under TEAL at 390×844 with the drawer OPEN on the navigated
Tasks view — the teal gradient on the active link, linkCount 20, mainNodes
7,894, 964 stress-row surfaces, zero non-exempt unreadable, scrollWidth 390,
the click latency 1,227ms — all verified in-frame) + the standing 31
refreshed.

**Pushed to main** — the feat commit + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different repo —
pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command — `bun
scripts/standing-suite.mjs` (29 rows; ~95 min) in a clean window (the S32
differential). The standing open items remain the first real `docker
compose --profile init up` on your Docker host and the upstream dep patches
(braces > 3.0.3, Prisma's deepmerge-ts pin). The volume × theme cross-axis
is now swept on ALL FOUR mobile/desktop halves (dark desktop, light
desktop, dark mobile, light mobile) — the named next candidates are the
**mid-band/landscape × volume cells** (768×1024 / 844×390, both mode halves
each), or the second cross-axis (**RUM-beacon behavior under suite
volume**). Also worth noting for future sessions: **the e2e day-boundary
lesson** — delete `db/e2e.db` when an e2e run crosses a UTC midnight
boundary (the seed's idempotent upserts preserve the original day-relative
dates; the 4 date-relative specs fail deterministically on an aged scratch
db). No new AP lesson this session — the S45 probe was born with the
S42/S43/S44 guards folded in and the exploration read GREEN on the first
try: the accumulated doctrine is doing its job.
