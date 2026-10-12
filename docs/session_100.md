# Session 100 — The S42 summary

The omni-study iteration (S42, workspace session 99) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace re-cloned fresh (the sandbox had been
reset; `49cc456` on main), the environment rebuilt, and the documented
**778-green baseline re-confirmed** (lint ✓ tsc ✓ 487 unit ✓ build ✓
291 cold-db e2e ✓ 4.4 min). Standing checks all GREEN: the preflight,
the drawer check, the live 390×844 mobile walkthrough (**the mobile
navigation menu is working as expected** — 20 links in order, drawer
closes on navigation, the active link's violet gradient verified after
navigation), the reference re-swept **UNCHANGED since S19–S41**, the
copy sweep 14/20 (6 data-state non-gaps), and the S41 one-command
standing suite **25/25 GREEN** with zero code findings on arrival.

**The genuine finding** — The documented S41 next-step: **the
data-volume × dark × accent stress**. The S13 volume profile (300
tasks / 200 notes / 250 events) runs in LIGHT + VIOLET only (the
data-volume audit has zero theme references), and every theme-space
sweep (S27–S41) runs at SEED volume — so the densest renderings the
app can produce had never carried a theme variation, the volume
budgets had never been measured under a theme variation, AND the
SIDEBAR's active-link tint had never been read through the navigation
lifecycle in DARK mode at any volume (S41 proved it in light;
accent-dark's desktop pass navigates by direct goto and never reads
it). Plus the volume self-verification gap: no standing probe asserts
the rows it renders are actually there.

**The fix (TDD, 31 new pins; 487 → 518 unit)** —
- The `accent-volume-sweep` probe: the S13 profile inserted through
  Prisma and **COUNT-verified** (a sweep that silently measured seed
  volume must never run), then 7 accents × the 7 volume-affected views
  (the S13 set) navigated THROUGH THE SIDEBAR at 1280×800 in dark
  mode, with the S41 desktop contracts + the interaction evidence in
  DARK (the never-read cell) + the S38 dark detector family + the S13
  volume measurement family (the 1500ms long-task budget; the
  click→heading 1500ms interactivity budget — the sidebar click
  doubles as the measurement) + the sidebar record per accent + the
  API stats once (the /api/tasks ≤ 500KB bound).
- The `classifyAccentVolumeSweep` seam on the S37–S41 doctrine: the
  volume-EXACT guard (300/200/250 — a seed-volume envelope is its own
  rot class, the S38 omission-means-clean retirement applied to the
  volume axis), the ALL-ACCENTS + ALL-VIEWS guards, the S13 B2/B3
  budget classes with boundary-exact pins, the flashbulb class, the
  CTA-face exemption ONLY (the light-mode calendar-day + yellow-pill
  exemptions do NOT apply in dark — those surfaces re-theme), the
  sidebar link census, and the B1 payload bound.
- **The design correction over the S39–S41 probe shape — the
  finally-race fix**: the cleanup + browser close + Prisma disconnect
  all complete BEFORE the AP-85 flush-callback exit (a `finally` block
  races the exit-carrying write), and the precondition `fail()` now
  throws so the catch-path restore + cleanup run for every failure
  class.
- The runner's 25th audit stage (25-min budget; ~2.6 min measured —
  ~10× headroom) directly after accent-dark-sweep — the suite now 26
  rows.
- Validation: the exploration swept the whole family clean first
  (findings 0 across 49 renderings; **7 distinct accent-correct tint
  pairs — the never-read dark sidebar-tint cell closed**; max
  clickLatency 652ms and max longTaskTotal 0ms — huge budget headroom;
  Tasks at 8,179 DOM nodes, the density real; zero flashbulbs; 2
  CTA-face exempt; 32 WARN); the genuine envelope classified GREEN at
  the seam on the first try.

**Gates** — lint ✓ tsc ✓ **518 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **809 green** (was 778; +31 unit pins; the 291 prior pins untouched
by construction — zero app code, zero CSS, zero Tailwind v4 surface,
zero parity-pinned bytes).

**The validation suite** — the S32 differential applied (dev server
restarted by PID, preflight GREEN, the fresh clean window):
**26/26 GREEN, exit 0** — the new accent-volume-sweep row GREEN inside
the suite on its first integration run (identical counts to the
exploration — deterministic), every other stage green, the
theme-restore closing guard light/violet. The evidence envelope
`docs/screenshots/s42-accent-volume-sweep-evidence.json` (26 stage
rows) + the evidence screenshot
`s42-accent-volume-dark-teal-tasks-1280.png` (the Tasks view at 300
rows in DARK under TEAL, the sidebar's active link on the navigated
Tasks view with the teal gradient, the dense list rendering clean
in-frame — mainNodes 7,894, zero flashbulbs, scrollWidth 1280). The
standing 31 screenshots refreshed; the theme guard light/violet
verified via Prisma.

**Pushed to main** — the feat commit + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different
repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (26 rows; ~75 min) in a clean window
(the S32 differential). The standing open items remain the first real
`docker compose --profile init up` on your Docker host and the upstream
dep patches (braces > 3.0.3, Prisma's deepmerge-ts pin). The cross-axis
space now has its first swept cell (volume × dark × accent at 1280):
the named next candidates are the volume × LIGHT family (the documented
bracketed non-gap — bracketed by S13 light × violet × volume + S37–S41
light × accent × seed), the dark × mobile × volume cell, or the second
cross-axis (RUM-beacon behavior under suite volume). New lesson
recorded: AP-88 (a contract proven at seed volume is not proven at
volume — density multiplies the surfaces the theme touches).
