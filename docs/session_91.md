# Session 91 — The S39 summary

The omni-study iteration (S39, workspace session 90) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace re-cloned fresh (the sandbox had been
reset; `f4c8ef8` on main), the environment rebuilt, and the documented
**710-green baseline re-confirmed** (lint ✓ tsc ✓ 419 unit ✓ build ✓
291 cold-db e2e ✓ 4.4 min). Standing checks all GREEN: the preflight,
the drawer check, the live 390×844 mobile walkthrough (**the mobile
navigation menu is working as expected** — 20 links in order, drawer
closes on navigation, Profile cards correct), the reference re-swept
**UNCHANGED since S19–S38**, the copy sweep 14/20 (6 data-state
non-gaps), and the S38 one-command standing suite **22/22 GREEN** with
zero code findings on arrival.

**The genuine finding** — The documented S38 next-step: **the accent ×
mid-band combo + the navigation-interaction gap**. The mid-band
768×1024 × accent cell of the theme-space matrix was ZERO-coverage
(midband-sweep is light+violet only; the accent sweeps are 390/1280
only), AND the accent sweeps navigate by DIRECT GOTO — so the drawer's
active-link accent tint was only ever read on the DASHBOARD link (once
per accent); the tint on a NON-Dashboard view, applied through the
real navigation lifecycle (aria-current moves → the `.sf-nav-active`
10%-alpha `NAV_ACTIVE_GRADIENT_STOPS` gradient re-tints), was verified
at ZERO views, ZERO accents, in either mode.

**The fix (TDD, 21 new pins; 419 → 440 unit)** —
- The `accent-midband-sweep` probe: all 20 views per accent navigated
  THROUGH THE DRAWER at 768×1024, with the per-view interaction
  evidence (activeLabel MUST equal the view — the active state follows
  the navigation; activeTint MUST read a gradient — "none" is the S8
  no-var rot class, a FINDING) + the drawer record per accent with the
  tint on the FINAL navigated view.
- The `classifyAccentMidbandSweep` seam on the S37/S38 doctrine: the
  ALL-ACCENTS + ALL-VIEWS + drawer-present guards (the display-label
  convention — the first draft's path-label mismatch was caught by the
  seam's own ALL-VIEWS guard on the first real envelope), the vehicle
  contract, the applied self-verification, and the two interaction
  finding classes (the tint rot + the active-state mismatch).
- The runner's 22nd audit stage (20-min budget) directly after
  accent-light-sweep.
- Validation: the exploration swept the whole family clean first
  (findings 0 across 140 drawer-navigated renderings; 7 distinct
  accent-correct tint pairs — the first standing proof); the genuine
  run classified GREEN at the seam.

**The second genuine finding (S39-F, mid-execution)** — The validation
run 1 came back 22/23: accent-light-sweep read "stdout did not parse"
— the probe had SUCCEEDED (findings 0) but its ~150KB envelope was
TRUNCATED at 146176 bytes by the bare `process.exit()` firing before
the ASYNC pipe write flushed (a latent, nondeterministic race in the
big-envelope probes since S37 — every prior run was a coin flip that
came up heads). The fix: the exit code computed first, then
`process.stdout.write(json, () => process.exit(exitCode))` — the flush
callback carries the exit, so it can never cut the envelope (applied
to accent-light + accent-midband; accent-dark was already safe by
natural exit). The validation re-run: **23/23 GREEN, exit 0** — both
fixed probes GREEN inside the suite.

**Gates** — lint ✓ tsc ✓ **440 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **731 green** (was 710; +21 unit pins; the 291 prior pins untouched
by construction — zero app code, zero CSS, zero Tailwind v4 surface,
zero parity-pinned bytes).

**Pushed to main** — the feat commit + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different
repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (23 rows; ~55 min) in a clean window
(the S32 differential). The standing open items remain the first real
`docker compose --profile init up` on your Docker host and the upstream
dep patches (braces > 3.0.3, Prisma's deepmerge-ts pin). The next
production-readiness axes beyond the theme space: the landscape ×
accent drawer-navigation combo (the 844×390 sibling), the desktop
light-accent family (currently the documented bracketed non-gap), or
the data-volume × dark × accent stress. New lessons recorded: AP-84
(an interaction never varied is an interaction never verified) and
AP-85 (a probe that prints a big envelope must ride the flush
callback).
