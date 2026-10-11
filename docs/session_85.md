# Session 85 — The S37 summary

The omni-study iteration (S37, workspace session 82/83) is complete and
pushed. Here's what happened:

## Session Summary

**Validation** — The workspace rebuilt from a clean clone (`git clone` at
`f10a7ee`), the documented **674-green baseline re-confirmed** (lint ✓
tsc ✓ 383 unit ✓ build ✓ 291 cold-db e2e ✓). Standing checks all GREEN:
the preflight, the drawer check, the live 390×844 mobile walkthrough
(**the mobile navigation menu is working as expected** — 20 links in
order, drawer closes, Profile cards correct), the reference re-swept
**UNCHANGED since S19–S36**, the copy sweep 14/20 (6 data-state
non-gaps), and the S36 one-command standing suite **21/21 GREEN** with
zero code findings.

**The genuine finding** — The **ACCENT axis in LIGHT mode**. The
accent-dark-sweep varies all 7 accents ONLY in dark mode (its own name
is the blind spot); the mobile/midband/landscape/dark-mobile sweeps
never vary the accentColor at all; the only light × non-violet rendering
in any standing artifact was ONE desktop calculator e2e view — **light ×
accent × mobile was zero-coverage for all 20 views**, while the
reference's accent picker saves but never re-themes (the clone's working
accent system is the functional superset, so its light-mode correctness
was guaranteed by nothing at execution time).

**The fix (TDD, 19 new pins)** —
- `scripts/accent-light-sweep.mjs` + the `classifyAccentLightSweep`
  seam: the suite's **20th standing stage** — all 7 accents × 20 views
  at 390×844 in LIGHT mode (PATCHed through the settings API — the real
  lifecycle, self-verified on `<html data-accent>`), asserting per view
  the identity family + the light contrast detector family + zero
  console errors, plus the drawer per accent (the INNER-span active-tint
  read). The **ALL-ACCENTS guard** (a missing accent is a shape-error,
  never green-by-omission) and the **three signature-strict non-gap
  exemptions**: the CTA-face, the calendar adjacent-month slate-300 days
  (**re-verified live on the reference this session** — the identical
  rgb(203, 213, 225)), and the yellow-500 priority-pill vocabulary.
- Validation: the probe **findings 0, exit 0**; the exploration swept
  the whole accent-light family clean first (light × 390×844 / 1280×800
  / 768×1024 × 7 accents × 20 views, findings 0 everywhere — the accent
  axis itself CLEAN, zero accent-dependent unreadable detections); the
  clean-window full suite **22/22 GREEN, exit 0** (the S32 differential
  remedy applied first — the dev server restarted to clear the spent
  ai:/RUM budgets); full gates **693 green**.

**Pushed to main** — `dc12317` (feat) + this summary via the SSH wrapper
(key verified + shredded; the wrapper's DEFAULT remote is a different
repo — pass `--remote git@github.com:nordeim/omni-study.git`).

**Suggested next steps**: future sweeps stay ONE command —
`bun scripts/standing-suite.mjs` (now 22 rows) in a clean 15-min window
(avoid back-to-back suite runs within the ai:/RUM budget windows — the
S32 differential). The standing open items remain the first real
`docker compose --profile init up` on your Docker host; the accent ×
dark × mobile × 14 views matrix (the accent-dark family's contract —
extend accent-dark-sweep's MOBILE_VIEWS); and the upstream dep patches
(braces > 3.0.3, Prisma's deepmerge-ts pin) will clear the dep-audit
envelope when they land.
