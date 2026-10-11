# Session 72 — The S34 mid-band light-mode sweep

The workspace refreshed with a `git pull` (`c8fbbf0..0f6add0` — the
session_71 transcript added on the remote); the working tree clean, the
environment intact (bun install no-op, the seeded `db/custom.db` in place).
The task plan set, then the core docs read (AGENTS through the S33 rows +
the daemon recipe, CLAUDE through the S33 seam, README, PAD, SKILL through
AP-78); every current-state claim re-verified against the codebase on
arrival (24 models, the 638-green documentation, the S33 seam + runner +
63 pins, the Notes mobile h2 present, the .env/db-at-root contract).

## Baseline + standing checks (all GREEN)

**The documented 638-green state re-confirmed** (lint ✓ tsc ✓ **334→347**
unit ✓ 20 files; build ✓; cold-`db/e2e.db` full e2e regression **291 ✓
4.4 min**). The dev server started first attempt via the documented
double-fork recipe; the S31 preflight GREEN; the drawer check GREEN; the
live agent-browser 390×844 walkthrough GREEN — the drawer with all 20
links in the documented order, Settings by ref, the S26/S24/S25 cards on
the Profile tab, scrollWidth 390. **The mobile navigation menu is working
as expected.**

Reference re-sweep: **UNCHANGED since S19–S33** (login title
"AcademiaFlow (Copy)"; the zero-data 0/0 dashboard; the same 20 nav views
in the same order; the same five Settings tabs with School/Grade on
Profile). The copy sweep: **14/20 MATCH** with the 6 data-state non-gaps
(the documented S17 family). **The S33 one-command standing suite ran
18/18 GREEN, exit 0** — zero code findings on arrival.

## The finding

The viewport continuum BETWEEN the pinned widths — the whole **391–1023px
band** — appears in NO standing audit: the mobile sweep pins 390, the
desktop audits pin 1280/1440, and the single lg pin covers only the
sidebar appearance on Dashboard at 1024. The band contains two live
breakpoints with real structural switches — at sm (640) the stat grids go
multi-column; at md (768) the **Timetable swaps its entire layout** (the
mobile accordion hides, the min-w-[900px] scroll canvas appears) while
headers go flex-row and grids go 2-col — and the **drawer is the only
navigation vehicle through the whole band** (the sidebar is lg:flex). The
S16 lesson one band out: a gap between pinned widths hides forever.

The exploration validated the whole band clean BEFORE the plan was
written — a parametrized probe swept **640, 767, 768, and 1023 × 20
views: findings 0 at every width**. The state green; the guarantee
absent.

## The fix (TDD, 11 new pins)

- **RED:** 11 pins in `tests/suite-verdict.test.ts` (the GREEN shape with
  the chrome contract; the shape-error family incl. the 390-viewport
  guard; the mode-rot family; the findings-present family; the NEW
  chrome-contract family — `sidebarVisible: true` → non-green with the
  lg-contract note) → 6 failed as expected.
- **GREEN:** `classifyMidbandSweep` in `src/lib/suite-verdict.ts` +
  the `AUDIT_NAMES` entry → **358/358** (was 347).
- **The probe** `scripts/midband-sweep.mjs`: all 20 views at 768×1024
  navigated **through the drawer**, asserting per view the S33 family
  (identity heading h1||h2, scrollWidth ≤ 768, drawer-closes, the app bar
  + clock, zero console errors) + the chrome vehicle-contract
  precondition (sidebar hidden + hamburger visible — a broken lg
  contract aborts loudly). **Genuine run 1: findings 0, exit 0** — clean
  on the first executable sweep (the h1||h2 union selector from the
  start; the S33 first-run-defect class did not recur).
- **The runner:** the suite's 17th audit stage (between mobile-sweep and
  dark-sweep); the stage-count literals 17 → 18 — 19 rows total.

## The validation runs

The first full-suite run: **18/19 — security alone**, the documented S32
pre-spent-budget differential (cutoffAt=16: this session's own first
suite run's ai-error/ai-a11y stages had spent 4 of the ai: budget within
the 15-min window). Verified against the raw envelope before
classification — NOT a code defect, unrelated to the change. The
documented remedy applied: the dev server restarted by PID (the in-memory
limiter cleared), preflight GREEN, then the clean-window re-run.

**The clean-window validation run: 19/19 GREEN, exit 0** — the evidence
envelope captured to `docs/screenshots/s34-midband-sweep-evidence.json`
(the midband row GREEN inside the suite on both runs).

Gates re-run: lint ✓ tsc ✓ **358 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **649 green**. The mid-band evidence screenshot captured
(`s34-midband-timetable-768.png` — the Timetable at 768 with the md-swap
in-frame: canvas visible, accordion hidden, scrollWidth 768). The drawer
check GREEN; the standing 31 refreshed (theme verified light/violet via
Prisma).

Docs aligned across every layer (AGENTS, vitest, CLAUDE, PAD §8.1,
README, SKILL + **AP-79** — the viewport-continuum lesson: when a surface
is width-dependent, pin the BREAKPOINT widths where the structure swaps,
not just the device-class endpoints). Worklog + this narrative.

## Session summary

**Validation** — the 638-green baseline re-confirmed; every standing
check GREEN (preflight, drawer, the live 390×844 walkthrough, the
reference UNCHANGED, the copy sweep 14/20, the S33 suite 18/18).

**The genuine finding** — the entire 391–1023px viewport band was
guaranteed by nothing: two live breakpoints (sm 640, md 768), the
Timetable's layout swap at md, the multi-column transitions, and the
drawer-only navigation territory — all un-probed while the audit surface
pinned only the device-class endpoints.

**The fix (TDD, 11 pins)** — `scripts/midband-sweep.mjs` + the
`classifyMidbandSweep` seam: the suite's **17th standing stage**, sweeping
all 20 views at 768×1024 (the md breakpoint, iPad portrait) **through the
drawer**, with the chrome vehicle-contract class (a broken lg contract
reads non-green at the seam). Validation: the full suite **19/19 GREEN**,
full gates **649 green**, all docs aligned with AP-79.

**Pushed** — to `main` via the SSH wrapper (key verified + shredded).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (now 19 rows) in a clean 15-min window.
The standing open item remains the first real
`docker compose --profile init up` on your Docker host; landscape
(844×390) and 320px reflow are documented as future surfaces.
