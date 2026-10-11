# Session 76 — The S35 phone-landscape short-viewport sweep

The workspace refreshed with a `git pull` (`9dabdc1..dc590c2` — the
session_75 workspace log added on the remote); the working tree clean, the
environment intact (bun 1.3.14, the seeded `db/custom.db` in place, 3.6 GB
available). The task plan set, then the core docs read (AGENTS through the
S34 rows + the daemon recipe, CLAUDE through the S34 seam, README, PAD
through the S34 rows, SKILL through AP-79; then session_74 + session_75 +
remediation-plan-session34 + the worklog S34 entry); every current-state
claim re-verified against the codebase on arrival (24 models, the 649-green
documentation, the S34 seam + runner + 74 pins, the .env/db-at-root
contract, the vitest 20-file/358 config).

## Baseline + standing checks (all GREEN)

The baseline gates re-confirmed the documented **649-green** state: lint ✓
tsc ✓ **358 unit** ✓ (20 files) build ✓ cold-`db/e2e.db` **291 e2e** ✓
(4.6 min). The dev server started via the documented double-fork recipe;
the S31 preflight GREEN (hydrated + navigation-stable); the mobile-drawer
check GREEN (backdrop oklab+blur(4px), 288px white panel, 20 links, no
footer, Escape-close). The live agent-browser 390×844 walkthrough GREEN:
login → dashboard scrollWidth 390 → the drawer with all 20 links in the
documented order → Settings by ref → the S26 Email card above the S24
Change password + S25 Danger zone cards on the Profile tab — **the mobile
navigation menu is working as expected**. The reference re-sweep:
**UNCHANGED since S19–S34** (login title "AcademiaFlow (Copy)"; the
zero-data 0/0 dashboard with the greeting from the email prefix; the same
20 nav views in the same order; the same five Settings tabs with
School/Grade/Goal on Profile). The 20-view copy sweep: **14/20 MATCH**
with the 6 diffs all data-state (the documented S17-pinned non-gap
family). The S34 one-command standing suite ran **19/19 GREEN, exit 0** —
zero code findings across the whole production-readiness sweep; the demo
user's theme verified light/violet (the closing guard).

## The finding

**The HEIGHT axis has never been varied.** The standing surface pinned
five viewports and every one is portrait-tall — 390×844 (mobile-sweep),
768×1024 (midband-sweep), 1280×800 (the audit scripts), 1440×900 (the e2e
specs), 1024×800 (the single lg-boundary pin) — heights 800–1024. Real
phones in landscape are 390–430px tall, and that height band stresses
structures no pinned height touches:

- **The drawer nav's scroll is load-bearing at 390** — measured live this
  session: **scrollHeight 1068 vs clientHeight 301** (the 20
  reference-measured ~40px rows under the ~88px brand header). Links 8–20
  (Analytics → Settings — more than half the app) are reachable in
  landscape ONLY through that scroll, and no standing audit had ever
  verified it.
- **The fixed h-16 app bar covers 16% of a 390px viewport** (vs 8% at the
  pinned desktop heights); the `pt-20` clearance keeps the first heading
  below it — unverified at any short height.
- **Four views render `h-[calc(100vh-8rem)]` panes — 262px at 390**
  (Tasks shows its `md:flex` aside at 844 width; Flashcards stacks its
  column; Notes carries a `min-h-[480px]` guard that switches the whole
  view to page-scroll) — height-dependent layout decisions at a height no
  probe had ever visited.

The width is NOT the finding (844 sits inside the S34 band, verified at
768) — what S34 never varied was the HEIGHT. The phone-landscape class
combines an in-band width with a 390px height: the drawer-as-vehicle +
scroll-required-nav + short-pane trio that only co-occurs there. The
exploration validated the whole band clean BEFORE the plan: **844×390,
740×360, 932×430 × 20 views, findings 0 at every width** (identity heading
h1||h2 WITH clearance, scrollWidth === viewport on every view, zero
console errors, the nav scroll required + the last link operable after
scroll) — plus the **320×568 narrow-portrait edge: findings 0**. The state
green; the guarantee absent — the AP-79 lesson one axis out.

## The fix (TDD, 13 new pins)

- **RED:** 13 pins in `tests/suite-verdict.test.ts` (the GREEN shape with
  both contracts; the shape-error family — missing findings / a view
  record missing `headingClearance` / the 390×844 PORTRAIT envelope and
  the 768×1024 mid-band envelope both fed to the landscape classifier /
  a missing + a non-boolean `drawerNavScrollable`; the mode-rot family;
  the findings-present family — a heading-clearance finding + an overflow
  finding; the vehicle-contract family; the short-viewport-contract
  family) → **7 failed** under the unknown-audit guard (the S33/S34 RED
  pattern).
- **GREEN:** `classifyLandscapeSweep` + the `AUDIT_NAMES` entry in
  `src/lib/suite-verdict.ts` → **87/87** in the file; the full unit layer
  **371** (20 files; was 358). The classifier: viewport MUST be 844×390
  on BOTH axes (the finding classes are height-dependent — the new
  axis); per-view shape-strict with the `headingClearance` key; the
  chrome record carries the vehicle contract + the NEW
  `drawerNavScrollable` short-viewport contract (a non-scrolling nav at
  390 height means the drawer geometry changed — links beyond the fold
  unreachable); mode-rot-guarded (the S27 class).
- **The probe:** `scripts/landscape-sweep.mjs` — the 20-view sweep at
  844×390 (the iPhone-class landscape) navigated THROUGH THE DRAWER (so
  every click past link ~7 exercises the nav scroll), asserting per view
  the S33/S34 family + the heading clearance (top ≥ 63 — the 64px bar
  with 1px sub-pixel tolerance); the drawer-content check measures the
  nav scroll on the first open + the last-link operability; the
  self-verifying preconditions assert BOTH viewport axes + light mode
  through the settings API (the S27 doctrine). **Genuine run 1: findings
  0, exit 0** — all 20 views clean on the first executable sweep.
- **The runner:** STAGES gains landscape-sweep between midband-sweep and
  dark-sweep (the light-mode family order: mobile → mid-band →
  phone-landscape → dark); the stage-count literals 18 → 19 — the suite
  now 20 rows.

## The validation runs

The validation protocol applied the S32 differential remedy BEFORE the
run: the dev server restarted by PID (the in-memory ai: limiter cleared —
this session's first suite run's ai-error/ai-a11y stages had spent the
budget), the S31 preflight GREEN, then the clean-window run. The full
evidence set: the suite envelope
(`docs/screenshots/s35-landscape-sweep-evidence.json`), the landscape
evidence screenshot (`docs/screenshots/s35-landscape-drawer-844.png` —
the drawer OPEN at 844×390 mid-nav-scroll: the fixed app bar, the
390px-tall panel, the scrolled nav), and the standing 31 refreshed (theme
restored light, verified via Prisma: light/violet).

## Session summary

- **The genuine finding:** the HEIGHT axis — every pinned viewport was
  portrait-tall; the phone-landscape class (844×390) had zero coverage
  while carrying real height-dependent structures (the scroll-required
  drawer nav at 1068px-of-content-in-301px, the 16%-height fixed bar, the
  clearance under it, the viewport-percentage panes at 262px). Validated
  clean across the band (740×360 / 844×390 / 932×430 + the 320×568
  edge) — state green, guarantee absent.
- **The fix:** the suite's 18th standing audit (landscape-sweep at
  844×390) + the classifyLandscapeSweep seam + 13 unit pins; two NEW
  seam classes (the heading-clearance per-view key; the
  drawerNavScrollable short-viewport contract); full gates re-run green —
  **662 green** (371 unit + 291 e2e; was 649).
- **The lesson (AP-80):** an axis never varied is an axis never verified
  — when a surface depends on BOTH viewport axes (fixed chrome,
  viewport-percentage panes, scroll-required lists), pin the orientation
  extreme of the REAL device class (phone landscape), not just the
  portrait heights.
- **Non-gaps documented:** the landscape band's other widths (validated
  clean; the probe pins the representative 844×390); 320×568 reflow
  (validated clean; future surface); iPad-landscape 1024×768 (the
  sidebar vehicle — the desktop surface); dark-mode landscape (the
  light-mode family per the S33/S34 convention); the copy sweep stays
  outside the suite.
