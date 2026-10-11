# Session 78 — The S35 summary

The omni-study iteration (S35, workspace session 76/77) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace refreshed (`git pull` to `dc590c2`), the
documented **649-green baseline re-confirmed** (lint ✓ tsc ✓ 358 unit ✓
build ✓ 291 cold-db e2e ✓). Standing checks all GREEN: the preflight, the
drawer check, the live 390×844 mobile walkthrough (**the mobile
navigation menu is working as expected** — 20 links in order, drawer
closes, no overflow), the reference re-swept **UNCHANGED since S19–S34**,
the copy sweep 14/20 (6 data-state non-gaps), and the S34 one-command
suite **19/19 GREEN** with zero code findings.

**The genuine finding** — The HEIGHT axis: every pinned viewport in the
standing surface is portrait-tall (390×844, 768×1024, 1280×800, 1440×900,
1024×800 — heights 800–1024), while real phones in landscape are 390–430px
tall. The phone-landscape class (844×390) had ZERO standing coverage, and
its height-dependent structures were guaranteed by nothing: the drawer
nav whose scroll is the ONLY path to links 8–20 at 390 height (measured:
scrollHeight 1068 vs clientHeight 301), the fixed h-16 app bar covering
16% of the viewport, the pt-* heading clearance under it, and four views'
`h-[calc(100vh-8rem)]` panes rendering at 262px. This session's
exploration validated the whole landscape band clean (740×360, 844×390,
932×430 × 20 views + the 320×568 edge, findings 0) — the state was green,
the guarantee was absent (the S34 lesson one axis out).

**The fix (TDD, 13 new pins)** —
- `scripts/landscape-sweep.mjs` + the `classifyLandscapeSweep` seam: the
  suite's **18th standing stage**, sweeping all 20 views at 844×390 (the
  iPhone-class landscape) **through the drawer** (so every click past
  link ~7 exercises the nav scroll), with per-view
  heading/overflow/drawer/app-bar/console assertions + the NEW
  **heading-clearance pin** (the heading's top ≥ the fixed 64px bar — a
  pt regression would hide the heading under the glass bar while every
  portrait probe stayed green) + the **drawerNavScrollable
  short-viewport contract** (a non-scrolling nav at 390 height means the
  drawer geometry changed — links beyond the fold unreachable)
- Validation: the probe **findings 0**; the clean-window full suite
  **20/20 GREEN, exit 0** (the S32 differential remedy applied first —
  the dev server restarted to clear the spent ai: budget); full gates
  **662 green**

**Pushed to main** — `298a5be` (feat) + `8b602dc` (transcript) + this
summary via the SSH wrapper (key verified + shredded; note: the wrapper's
DEFAULT remote is a different repo — pass `--remote
git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (now 20 rows) in a clean 15-min window
(avoid back-to-back suite runs within the ai: budget window — the S32
differential). The standing open item remains the first real
`docker compose --profile init up` on your Docker host; 320×568 reflow
(validated clean this session), iPad-landscape 1024×768 (the sidebar
vehicle), and dark-mode landscape are documented as future surfaces.
