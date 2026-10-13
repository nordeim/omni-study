# Session 115 — The S47 summary

The omni-study iteration (S47, workspace session 114) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace had been reset again (the documented
pattern); the repo re-cloned at `246f81a` (the S46 push `d9458c9` + the
SKILL-count alignment `10c9081` + the user's session_113 log updates), the
environment re-established (.env per the contract with the S46 dev posture
`AUTH_SECRET=""`, `db/` seeded at the repo root, `bun install`, the
Playwright chromium-headless-shell v1243 download — the fresh sandbox cache
gap), and the documented **946-green baseline re-confirmed** (lint ✓ tsc ✓
655 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓ 4.8 min). Standing checks
all GREEN: the preflight, the drawer check, the live 390×844 mobile
walkthrough (**the mobile navigation menu is working as expected** — 20
links in order, drawer closes on navigation, the Notes active-link violet
gradient verified on the inner span at the re-open), **the mid-band
geometry anchor re-measured at 768×1024** (the drawer nav scrollHeight
1068 vs clientHeight 935 → scrollable TRUE — identical to S46, the
empirical anchor for this session's seam contract), the reference re-swept
**UNCHANGED since S19–S46**, and the copy sweep 14/20 (6 data-state
non-gaps).

**One transient finding on the way** (root-caused and fixed): the arrival
standing suite read **29/30** — the S42 accent-volume-sweep stage fired
its INVERTED-chrome precondition ONCE inside the suite (sidebarVisible
read false at 1280). The root cause: the S42 probe's INITIAL chrome gate
waited only on `html.dark`, which applyToDocument can satisfy when
/api/auth/me resolves while React has not yet committed the shell DOM —
the AP-90 shell-presence race family, on the initial gate (the per-accent
gates were fixed in S43; the initial gate was not). Zero app bytes had
changed; green standalone. **The fix**: the shell-presence guard folded
into the initial gate (`html.dark && !!document.querySelector("aside
nav")`), verified standalone (exit 0, findings 0) and inside the
validation suite (green). The S43 light-desktop sibling is already safe
(greeting-heading gate).

**The genuine finding** — The S46 summary's own first named next
candidate: **the light × mid-band × volume family** (the S47 mirror — the
S42→S43 / S44→S45 / S46→S47 family pattern). The coverage map, verified
against the standing scripts: the S13 data-volume audit runs 1280×800
light+violet only, the S34/S39 mid-band sweeps run LIGHT at SEED volume
(the volume axis is their blind spot), the S42–S45 volume × accent sweeps
run 1280/390 only, and the S46 mid-band volume sweep is DARK only (its
mode precondition). So the cross-axis cell **light × mid-band × accent ×
volume** was ZERO-coverage at every accent: the densest renderings had
never been rendered in LIGHT at the 768×1024 stacked layout under ANY
accent at volume, the S13 volume budgets had never been measured at the
mid-band viewport in LIGHT under a theme variation, and the DRAWER's
active-link tint had never been read through the real navigation
lifecycle in LIGHT at MID-BAND at VOLUME.

**The fix (TDD, 38 new pins; 655 → 693 unit)** —
- The `accent-volume-light-midband-sweep` probe: the S13 profile
  (300/200/250) inserted through Prisma and COUNT-verified, then 7 accents
  × the 7 volume-affected views navigated THROUGH THE DRAWER at 768×1024
  in LIGHT mode, with the MID-BAND vehicle contract (the below-lg family)
  + the drawer-own nav-scroll contract at the mid-band geometry
  (scrollHeight 1068 vs clientHeight ~935), the below-lg structural family
  at volume (drawer-closes-on-navigation, the fixed glass app bar with the
  2-digit-hour clock, the heading clearance under the 64px bar), the S13
  budgets (the drawer-click → heading ≤ 1500ms, long tasks ≤ 1500ms, the
  /api/tasks ≤ 500KB B1 bound), the LIGHT checker with the THREE
  signature-strict light exemptions (the CTA-face + the calendar
  adjacent-month slate-300 + the yellow priority-pill yellow-500; NO
  flashbulbs — the class exists only in dark), the light-mode hydration
  gate (the greeting heading — `!html.dark` is TRUE at first paint), and
  the interaction evidence via the pendingView pattern.
- The `classifyAccentVolumeLightMidbandSweep` seam on the S43–S46
  doctrine: the mode rot guard INVERTED (mode MUST be light — the dark
  half is the S46 audit's own: the mode is the discriminator on this very
  cell), the viewport guard (768×1024 BOTH axes), the volume-EXACT guard,
  the ALL-ACCENTS + ALL-VIEWS guards, the MID-BAND vehicle contract + the
  drawer-own scroll contract, the structural below-lg family at volume,
  the S13 B2/B3 budgets with boundary-exact pins, and the LIGHT detector
  family with the THREE exemptions.
- The runner's 29th audit stage (25-min budget; ~3.0 min measured — ~8.5×
  headroom) directly after its dark mid-band sibling — the suite now 31
  rows.

**Gates** — lint ✓ tsc ✓ **693 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **984 green** (was 946; +38 unit pins; the 291 prior pins untouched by
construction — zero app code, zero CSS, zero Tailwind v4 surface, zero
parity-pinned bytes).

**The validation suite** — the S32 differential (dev server restarted by
PID, preflight GREEN, the fresh clean window): **31/31 GREEN, exit 0** —
the new accent-volume-light-midband-sweep row GREEN inside the suite on
its first integration run (identical counts to the exploration —
deterministic: 49 renderings, 49 active-tint readings, 7 distinct tints,
Tasks 7,894 mainNodes, 112,960 bytes, 23/28/14 exempt), the fixed S42
stage green, every other stage green, the theme-restore closing guard
light/violet. The evidence envelope
`docs/screenshots/s47-accent-volume-light-midband-sweep-evidence.json` (31
stage rows) + the evidence screenshot
`s47-accent-volume-light-midband-teal-tasks-768.png` (the Tasks view at 300
rows in LIGHT under TEAL at 768×1024 with the drawer OPEN on the navigated
Tasks view — the teal gradient on the active link, linkCount 20,
lightClass true, mainNodes 7,894, 964 stress-row surfaces, zero
non-exempt unreadable, the nav geometry 1068 vs 935, the click latency
1,126ms — all verified in-frame) + the standing 31 refreshed.

**Pushed to main** — the feat commit + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different repo —
pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command — `bun
scripts/standing-suite.mjs` (31 rows; ~105 min) in a clean window (the S32
differential). The standing open items remain the first real `docker
compose --profile init up` on your Docker host and the upstream dep patches
(braces > 3.0.3, Prisma's deepmerge-ts pin). The volume × theme cross-axis
now covers ALL SIX halves (dark desktop, light desktop, dark mobile, light
mobile, dark mid-band, light mid-band) — the named next candidates are the
**landscape × volume cells** (844×390, both mode halves — the S45 summary's
named family, the last viewport band) or the second cross-axis
(**RUM-beacon behavior under suite volume**). Also worth carrying forward:
**the S42 initial-gate field correction** (the AP-90 shell-presence race —
now folded into every volume probe's initial gate). No new AP lesson this
session — the S47 probe was born with the S42–S46 guards folded in and the
exploration read GREEN on the first try: the accumulated doctrine is doing
its job.
