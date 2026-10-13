# Session 112 — The S46 summary

The omni-study iteration (S46, workspace session 111) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace had been reset again (the documented
pattern); the repo re-cloned at the S45 state (`1ca3d7a` = the S45 push
`3133d0c` + the user's session_110 log updates), the environment
re-established (.env per the contract, `db/` seeded at the repo root,
`bun install`, the Playwright chromium-headless-shell v1243 download — the
fresh sandbox cache gap), and the documented **909-green baseline
re-confirmed** (lint ✓ tsc ✓ 618 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓
4.6 min). Standing checks all GREEN: the preflight, the drawer check, the
live 390×844 mobile walkthrough (**the mobile navigation menu is working as
expected** — 20 links in order, drawer closes on navigation, the active
link's violet gradient verified on the inner span at the re-open), **the
mid-band geometry anchor measured at 768×1024** (the drawer nav scrollHeight
1068 vs clientHeight 935 → scrollable TRUE — the empirical anchor for this
session's seam contract), the reference re-swept **UNCHANGED since
S19–S45**, the copy sweep 14/20 (6 data-state non-gaps), and the S45
one-command standing suite **29/29** (the in-flight 27-audit version —
every stage green).

**Two environmental findings on the way to the baseline** (both documented
in AGENTS.md, the `bun run test:e2e` row — the S46 extension of the S45
day-boundary lesson): (1) the **s22 bundled-`.env` class** — Next's
standalone output COPIES the repo-root `.env` into
`.next/standalone/.env` at build time, so a REAL AUTH_SECRET in the dev
`.env` leaks into the bundle and the boot guard correctly boots (the
negative-spawn spec times out); the fix is the `.env.example` dev posture
(`AUTH_SECRET=""`) + a rebuild; (2) the **s23 always-cold-db class** — the
import round-trip posts a FIXED-id envelope, so any second consecutive run
against the aged scratch db reads `created: 0, updated: 1` and fails; the
fix is `rm -f db/e2e.db` before EVERY full e2e run.

**The genuine finding** — The S45 summary's own first named next candidate:
**the dark × mid-band × volume family** (the mid-band/landscape × volume
cells, the dark half first — the S42→S43 / S44→S45 family pattern). The
coverage map, verified against the standing scripts: the S13 data-volume
audit runs 1280×800 light+violet only, the S34/S39 mid-band sweeps run
LIGHT at SEED volume (the mode + volume axes are their blind spots), the
S42–S45 volume × accent sweeps run 1280/390 only, and **NO dark sweep runs
at 768 at all**. So the cross-axis cell **dark × mid-band × accent ×
volume** was ZERO-coverage at every accent: the densest renderings had
never been rendered in DARK at the 768×1024 stacked layout under ANY
accent, the S13 volume budgets had never been measured at the mid-band
viewport in DARK under a theme variation, and the DRAWER's active-link tint
had never been read through the real navigation lifecycle in DARK at
MID-BAND at VOLUME.

**The fix (TDD, 37 new pins; 618 → 655 unit)** —
- The `accent-volume-dark-midband-sweep` probe: the S13 profile
  (300/200/250) inserted through Prisma and COUNT-verified, then 7 accents ×
  the 7 volume-affected views navigated THROUGH THE DRAWER (the only vehicle
  below 1024) at 768×1024 in DARK mode, with the MID-BAND vehicle contract
  (the sidebar hidden + the hamburger visible — the below-lg family, the
  S34/S39 doctrine at volume) + the drawer-own nav-scroll contract at the
  mid-band geometry (the nav MUST scroll at 1024 height — scrollHeight 1068
  vs clientHeight ~935, measured: links ~17–20 sit below the fold), the
  below-lg structural family at volume (the drawer closes on navigation,
  the fixed glass app bar with the 2-digit-hour clock — lg:hidden,
  identical at 768, the heading clearance under the 64px bar), the S13
  budgets (the drawer-click → heading ≤ 1500ms, long tasks ≤ 1500ms, the
  /api/tasks ≤ 500KB B1 bound), the DARK checker (flashbulbs ALWAYS
  findings; unreadable < 2.2 with the CTA-face exemption ONLY — the
  calendar-day and yellow-pill light exemptions do NOT apply in dark, those
  surfaces re-theme; lowcontrast < 3.2 = WARN), and the interaction
  evidence in DARK at MID-BAND at volume (the pendingView pattern).
- The `classifyAccentVolumeDarkMidbandSweep` seam on the S42–S45 doctrine:
  the viewport guard (768×1024 BOTH axes), the mode rot guard (mode MUST be
  dark — the light × mid-band × volume family is the documented S47 mirror),
  the volume-EXACT guard, the ALL-ACCENTS + ALL-VIEWS guards, the MID-BAND
  vehicle contract + the drawer-own scroll contract, the structural
  below-lg family at volume, the S13 B2/B3 budgets with boundary-exact
  pins, and the DARK detector family with the CTA-face-only exemption.
- The shell-presence guard folded in from birth (the AP-90 lesson applied to
  the mid-band vehicle) — no field corrections needed; the exploration read
  GREEN on the first try.
- The runner's 28th audit stage (25-min budget; ~3.0 min measured — ~8.4×
  headroom) directly after its light-mobile sibling (the volume family:
  dark desktop, light desktop, dark mobile, light mobile, then dark
  mid-band) — the suite now 30 rows.

**Gates** — lint ✓ tsc ✓ **655 unit** ✓ build ✓ cold-db **291 e2e** ✓
= **946 green** (was 909; +37 unit pins; the 291 prior pins untouched by
construction — zero app code, zero CSS, zero Tailwind v4 surface, zero
parity-pinned bytes).

**The validation suite** — the S32 differential (dev server restarted by
PID, preflight GREEN, the fresh clean window): **30/30 GREEN, exit 0** —
the new accent-volume-dark-midband-sweep row GREEN inside the suite on its
first integration run (identical counts to the exploration —
deterministic), every other stage green, the theme-restore closing guard
light/violet. The evidence envelope
`docs/screenshots/s46-accent-volume-dark-midband-sweep-evidence.json` (30
stage rows) + the evidence screenshot
`s46-accent-volume-dark-midband-teal-tasks-768.png` (the Tasks view at 300
rows in DARK under TEAL at 768×1024 with the drawer OPEN on the navigated
Tasks view — the teal gradient on the active link, linkCount 20, mainNodes
7,894, 964 stress-row surfaces, zero flashbulbs, zero non-exempt
unreadable, the nav geometry 1068 vs 935, the click latency 1,246ms — all
verified in-frame) + the standing 31 refreshed.

**Pushed to main** — the feat commit + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different repo —
pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command — `bun
scripts/standing-suite.mjs` (30 rows; ~100 min) in a clean window (the S32
differential). The standing open items remain the first real `docker
compose --profile init up` on your Docker host and the upstream dep patches
(braces > 3.0.3, Prisma's deepmerge-ts pin). The volume × theme cross-axis
now covers FIVE halves (dark desktop, light desktop, dark mobile, light
mobile, dark mid-band) — the named next candidates are the **light ×
mid-band × volume cell** (the S47 mirror — needs the THREE light
exemptions, the S43/S45 doctrine), the **landscape × volume cells**
(844×390, both mode halves), or the second cross-axis (**RUM-beacon
behavior under suite volume**). Also worth carrying forward: **the two e2e
operational lessons** (the bundled-`.env` s22 class + the always-cold-db
s23 class — AGENTS.md). No new AP lesson this session — the S46 probe was
born with the S42–S45 guards folded in and the exploration read GREEN on
the first try: the accumulated doctrine is doing its job.
