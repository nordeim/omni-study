# Session 97 — The S41 summary

The omni-study iteration (S41, workspace session 96) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace re-cloned fresh (the sandbox had been
reset; `9b88f09` on main), the environment rebuilt, and the documented
**754-green baseline re-confirmed** (lint ✓ tsc ✓ 463 unit ✓ build ✓
291 cold-db e2e ✓ 4.4 min). Standing checks all GREEN: the preflight,
the drawer check, the live 390×844 mobile walkthrough (**the mobile
navigation menu is working as expected** — 20 links in order, drawer
closes on navigation, the active link's violet gradient verified after
navigation), the reference re-swept **UNCHANGED since S19–S40**, the
copy sweep 14/20 (6 data-state non-gaps), and the S40 one-command
standing suite **24/24 GREEN** with zero code findings on arrival.

**The genuine finding** — The documented S40 next-step: **the desktop
light-accent family + the SIDEBAR vehicle's interaction**. The desktop
1280×800 × light × accent cell of the theme-space matrix was
ZERO-coverage (accent-dark covers 1280 dark only; the light accent
sweeps are 390/768/844 only), AND the SIDEBAR's active-link accent
tint — the desktop navigation vehicle, the surface the reference's
desktop users actually navigate with — was verified at ZERO views,
ZERO accents, in EITHER mode (the e2e pins read the tint on the
Dashboard link only, violet only; accent-dark's desktop pass navigates
by direct goto and never reads it). Plus the vehicle contract INVERTS
at desktop (sidebar visible + hamburger hidden — never asserted) and
the sidebar nav has its OWN scroll contract at 800 height (measured
scrollHeight 1068 vs clientHeight 534 — the only path to links ~13–20).

**The fix (TDD, 24 new pins; 463 → 487 unit)** —
- The `accent-desktop-sweep` probe: all 20 views per accent navigated
  THROUGH THE SIDEBAR at 1280×800, with the interaction evidence read
  DIRECTLY while each view is active (the sidebar is always in the DOM
  — no next-open indirection), the sidebar-own scroll contract
  re-measured per accent, the per-view headingOffset (the content
  clears the fixed 260px sidebar) + the sidebar-persistence contract,
  the aside-scoped sidebar record per accent with the tint on the FINAL
  navigated view. The envelope ends with the S39-F flush-callback exit
  (AP-85) from birth.
- The `classifyAccentDesktopSweep` seam on the S37–S40 doctrine: the
  ALL-ACCENTS + ALL-VIEWS + sidebar-present guards (the display-label
  convention from birth), the INVERTED vehicle contract, the
  sidebar-own scroll contract, the applied self-verification, and the
  two interaction finding classes (the tint rot + the active-state
  mismatch) on the DESKTOP vehicle.
- The runner's 24th audit stage (20-min budget; ~3.2 min measured —
  ~6× headroom) directly after accent-landscape-sweep — the suite now
  25 rows.
- **The field correction the probe's own first run caught**: the
  sidebar-visibility check — `offsetParent` reads **null for
  position:fixed elements in Chromium even when fully rendered**; the
  rendered check for the fixed sidebar is `getClientRects().length >
  0`. The precondition fired loudly on run 1 (exit 1, zero findings
  measured — the self-verifying doctrine working as designed) and the
  genuine run went clean.
- Validation: the exploration swept the whole family clean first
  (findings 0 across 140 sidebar-navigated renderings; 7 distinct
  accent-correct tint pairs — the S39/S40 proof extended to the DESKTOP
  vehicle; the nav scrollable at every accent; the heading offset
  × 140); the genuine run classified GREEN at the seam on the first
  try.

**Gates** — lint ✓ tsc ✓ **487 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **778 green** (was 754; +24 unit pins; the 291 prior pins untouched
by construction — zero app code, zero CSS, zero Tailwind v4 surface,
zero parity-pinned bytes).

**The validation suite** — the first clean-window run read **24/25**
(the new stage aborted environmentally — the page renderer died
mid-evaluate under the container's memory ceiling with the leftover
agent-browser daemons running; the loud-failure doctrine surfaced it as
a RED row, and an immediate probe re-run read deterministic-clean). The
remedy applied (the interactive daemons closed, the dev server
restarted, the suite re-run): **25/25 GREEN, exit 0** — the new
accent-desktop-sweep row GREEN inside the suite on its integration run
(identical counts to the exploration: 140 renderings, 140 tint
readings, 7 sidebar records, 94/28/21 exempt, 596 WARN — deterministic;
~3.2 min against the 20-min budget), the theme-restore closing guard
light/violet. The evidence envelope
`docs/screenshots/s41-accent-desktop-sweep-evidence.json` (25 stage
rows) + the evidence screenshot
`docs/screenshots/s41-accent-desktop-sidebar-teal-notes-1280.png` (the
desktop in light under TEAL, the sidebar's active link on the navigated
Notes view, the nav scrolled into view — linkCount 20, the teal
gradient, navScrollable 1068-vs-534, the heading at x=292 clearing the
fixed 260px sidebar, all verified in-frame). The standing 31
screenshots refreshed; the theme guard light/violet verified via
Prisma. The operational lesson recorded: close the interactive browser
sessions BEFORE launching the standing suite (the AGENTS.md OOM trap
re-hit).

**Pushed to main** — the feat commit + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different
repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (25 rows; ~70 min) in a clean window
(the S32 differential). The standing open items remain the first real
`docker compose --profile init up` on your Docker host and the upstream
dep patches (braces > 3.0.3, Prisma's deepmerge-ts pin). The theme-space
matrix is now FULLY swept at every documented combo INCLUDING the
vehicle-interaction evidence on BOTH vehicles at every vehicle-viewport
(drawer: 390/768/844 light + 390 dark; sidebar: 1280 light + 1280 dark
via accent-dark's goto pass) — the next production-readiness axes are
beyond the theme space: the data-volume × dark × accent stress, or the
first cross-axis stress (e.g. RUM-beacon behavior under a full-suite
sweep volume). New lesson recorded: AP-87 (a vehicle never varied is a
vehicle never verified — the drawer-vehicle proofs left the desktop
vehicle's interaction unverified in every mode).
