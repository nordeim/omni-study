# Session 82 — The S36 summary

The omni-study iteration (S36, workspace session 78/79) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace refreshed (`git pull` to `4516254`), the
documented **662-green baseline re-confirmed** (lint ✓ tsc ✓ 371 unit ✓
build ✓ 291 cold-db e2e ✓). Standing checks all GREEN: the preflight,
the drawer check, the live 390×844 mobile walkthrough (**the mobile
navigation menu is working as expected** — 20 links in order, drawer
closes, no overflow), the reference re-swept **UNCHANGED since S19–S35**,
the copy sweep 14/20 (6 data-state non-gaps), and the S35 one-command
suite **20/20 GREEN** with zero code findings.

**The genuine finding** — The **MODE axis at the mobile viewport**. The
standing surface varied width (S33/S34) and height (S35) but pinned
LIGHT at every mobile viewport: dark-sweep renders dark at desktop only
(1280×800); accent-dark-sweep renders dark at 390×844 for only 6 views
(+ the drawer) — so **14 of 20 views had never been rendered in dark at
the stacked mobile layout by any standing audit**, and every light
mobile sweep is mode-rot-guarded by construction. The mobile-only dark
structures (the stacked panes' `dark:border-slate-800`, the app bar's
`dark:shadow-black/20`, the drawer's `dark:bg-slate-950` panel) are
superset-only code paths — the reference's own dark mode is a measured
Base44 no-op, so this is the superset's quality contract, and it was
guaranteed by nothing.

**The fix (TDD, 12 new pins)** —
- `scripts/dark-mobile-sweep.mjs` + the `classifyDarkMobileSweep` seam:
  the suite's **19th standing stage** — the S33 mobile sweep's dark
  sibling at 390×844, all 20 views navigated THROUGH THE DRAWER in dark
  mode (PATCHed through the settings API — the real lifecycle,
  self-verified), asserting per view the S33/S35 structural family +
  the dark-sweep detector family (flashbulb/unreadable) extended to the
  mobile chrome, plus the drawer's own dark rendering in the envelope
  and the **INDEPENDENT dark-detection counting** (a non-empty detector
  array with an empty findings array still reads non-green) and the
  **INVERSE mode-rot guard** (mode MUST be dark).
- Validation: the probe **findings 0**; the exploration swept the whole
  dark-mobile family clean first (dark × 390×844 / 768×1024 / 844×390,
  findings 0 everywhere); the clean-window full suite **21/21 GREEN,
  exit 0** (the S32 differential remedy applied first — the dev server
  restarted to clear the spent ai: budget); full gates **674 green**.

**Pushed to main** — `36d40f6` (feat) + `f4e5246` (transcript) + this
summary via the SSH wrapper (key verified + shredded; the wrapper's
DEFAULT remote is a different repo — pass `--remote
git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (now 21 rows) in a clean 15-min window
(avoid back-to-back suite runs within the ai: budget window — the S32
differential). The standing open items remain the first real
`docker compose --profile init up` on your Docker host; the
accent × dark × mobile full matrix (the accent-dark family's contract);
and the upstream dep patches (braces > 3.0.3, Prisma's deepmerge-ts pin)
will clear the dep-audit envelope when they land.
