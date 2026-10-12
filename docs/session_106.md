# Session 106 — The S44 summary

The omni-study iteration (S44, workspace session 105) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace had been reset again (the documented
pattern); the repo re-cloned at the S43 state (`e14be49`), the environment
re-established (.env per the contract, `db/` seeded at the repo root,
`bun install`, the Playwright chromium-headless-shell v1243 download —
the fresh sandbox cache gap), and the documented **841-green baseline
re-confirmed** (lint ✓ tsc ✓ 550 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓
4.3 min). Standing checks all GREEN: the preflight, the drawer check, the
live 390×844 mobile walkthrough (**the mobile navigation menu is working
as expected** — 20 links in order, drawer closes on navigation, the active
link's violet gradient verified on the inner span), the reference re-swept
**UNCHANGED since S19–S43**, the copy sweep 14/20 (6 data-state non-gaps),
and the S43 one-command standing suite **27/27** (the in-flight 25-stage
version — every stage green).

**The genuine finding** — The S43 summary's own first named next
candidate: **the dark × mobile × volume family — the documented bracketed
non-gap**. The coverage map, verified against the standing scripts: the
S13 data-volume audit runs 1280×800 light+violet only (zero theme
references), every mobile-viewport sweep (S33–S37/S39/S40) runs at SEED
volume, and the S42/S43 volume × accent sweeps run 1280×800 only (their
viewport guards read the desktop — the viewport axis is their blind
spot). So the cross-axis cell **dark × mobile × accent × volume** was
ZERO-coverage at every accent: the densest renderings had never been
rendered in dark at the stacked mobile layout under ANY accent, the S13
volume budgets had never been measured at the mobile viewport under a
theme variation, and the DRAWER's active-link tint had never been read
through the real navigation lifecycle in DARK at MOBILE at VOLUME.

**The fix (TDD, 33 new pins; 550 → 583 unit)** —
- The `accent-volume-dark-mobile-sweep` probe: the S13 profile (300/200/250)
  inserted through Prisma and COUNT-verified, then 7 accents × the 7
  volume-affected views navigated THROUGH THE DRAWER (the only vehicle
  below 1024) at 390×844 in dark mode, with the MOBILE vehicle contract
  (the sidebar hidden + the hamburger visible — the INVERSE of the desktop
  seams) + the drawer-own nav-scroll contract (the nav MUST scroll at 844
  height — the only path to links ~14–20), the mobile structural family at
  volume (the drawer closes on navigation, the fixed glass app bar with
  the 2-digit-hour clock, the heading clearance under the 64px bar), the
  S13 budgets (the drawer-click → heading ≤ 1500ms over the drawer-close +
  view-mount path, long tasks ≤ 1500ms, the /api/tasks ≤ 500KB B1 bound),
  the DARK checker (flashbulbs ALWAYS findings; unreadable < 2.2 with the
  CTA-face exemption ONLY — the light-mode calendar-day + yellow-pill
  exemptions do NOT apply in dark, those surfaces re-theme; lowcontrast
  WARN), and the interaction evidence in dark at mobile at volume (the
  pendingView pattern — each drawer open reads the active link while the
  previous view is active).
- The `classifyAccentVolumeDarkMobileSweep` seam on the S37–S43 doctrine:
  the mode rot guard (mode MUST be dark — the light × mobile × volume
  family is the documented future cross-axis candidate), the volume-EXACT
  guard, the ALL-ACCENTS + ALL-VIEWS guards, the MOBILE vehicle contract
  + the drawer-own scroll contract, the structural mobile finding classes
  at volume, the S13 B2/B3 budgets with boundary-exact pins, and the
  light-exemptions-do-NOT-apply pins (the re-theme doctrine).
- The shell-presence guard folded into the per-accent wait from birth (the
  AP-90 lesson applied to the mobile vehicle: the header/app bar is the
  post-mount observable at 390) — no field corrections needed; the
  exploration read GREEN on the first try.
- The runner's 26th audit stage (25-min budget; ~2.9 min measured — ~8.7×
  headroom) directly after accent-volume-light-sweep (the volume family
  together: dark desktop, light desktop, then dark mobile) — the suite now
  28 rows.

**Gates** — lint ✓ tsc ✓ **583 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **874 green** (was 841; +33 unit pins; the 291 prior pins untouched by
construction — zero app code, zero CSS, zero Tailwind v4 surface, zero
parity-pinned bytes).

**The validation suite** — the S32 differential (dev server restarted
by PID, preflight GREEN, the fresh clean window): **28/28 GREEN, exit 0** —
the new accent-volume-dark-mobile-sweep row GREEN inside the suite on its
first integration run (identical counts to the exploration —
deterministic), every other stage green, the theme-restore closing guard
light/violet (verified via the DB directly as well). The evidence envelope
`docs/screenshots/s44-accent-volume-dark-mobile-sweep-evidence.json` (28
stage rows) + the evidence screenshot
`s44-accent-volume-dark-mobile-teal-tasks-390.png` (the Tasks view at 300
rows in DARK under TEAL at 390×844 with the drawer OPEN on the navigated
Tasks view — the teal NAV_ACTIVE_GRADIENT_STOPS gradient on the active
link, mainNodes 7,894, 964 stress-row surfaces, zero flashbulbs, zero
non-exempt unreadable, scrollWidth 390, the click latency 982ms — all
verified in-frame) + the standing 31 refreshed.

**Pushed to main** — the feat commit + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different
repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command — `bun
scripts/standing-suite.mjs` (28 rows; ~90 min) in a clean window (the
S32 differential). The standing open items remain the first real
`docker compose --profile init up` on your Docker host and the upstream
dep patches (braces > 3.0.3, Prisma's deepmerge-ts pin). The volume ×
theme cross-axis now covers dark desktop + light desktop + dark mobile —
the named next candidates are the **light × mobile × volume cell** (the
mirrored light half at 390×844 — needs the THREE light exemptions, the
S43 doctrine), the **mid-band/landscape × volume cells** (768×1024 /
844×390), or the second cross-axis (RUM-beacon behavior under suite
volume). No new AP lesson this session — the S44 probe was born with the
S42/S43 guards folded in (the COUNT-verified volume lifecycle, the
shell-presence gate from birth, the finally-race fix), and the
exploration read GREEN on the first try: the accumulated doctrine is
doing its job.
