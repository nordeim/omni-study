# Session 93 — The S40 accent × landscape drawer-navigation sweep

The workspace re-cloned fresh (the sandbox had been reset; the remote
main at `8101a94` — the session_92 transcript on top of the S39 push
`eece1e3` + `f4c8ef8`); the environment rebuilt (`.env` per the contract
with `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`bun install` 489 packages, `db:push` + `db:seed` — the demo user with
the showcase data). The core docs read (AGENTS through the S39 rows,
CLAUDE, README, PAD through §8.1, SKILL through AP-85), then the session
docs (session_91 + session_92 + remediation-plan-session39 + the worklog
S39 entry); every current-state claim re-verified against the codebase
on arrival (the vitest 20-file/440 config, the playwright 291-spec
config, the 23-row STAGES list, the `classifyAccentMidbandSweep` seam,
the 20 NAV_ITEMS; skills/ excluded per the brief).

## The validation on arrival

The **731-green baseline re-confirmed**: lint ✓ tsc ✓ **440 unit** ✓
(20 files) build ✓ cold-`db/e2e.db` **291 e2e** ✓ (4.4 min). The
standing checks all GREEN: the S31 preflight, the mobile-drawer check,
the live agent-browser 390×844 walkthrough (**the mobile navigation
menu is working as expected** — login → dashboard scrollWidth 390 →
the drawer's 20 links in the documented order → drawer closes on
navigation (Notes) → the Settings five tabs → the Profile tab's Email
address card above the Change password + Danger zone cards), the
reference re-sweep **UNCHANGED since S19–S39** (the login title
"AcademiaFlow (Copy)", the zero-data dashboard with the email-prefix
greeting "Good afternoon, sepnetflix2023 👋", the same 20 nav views in
the same order, the same five Settings tabs), the copy sweep **14/20
MATCH** with the 6 diffs all data-state (the documented S17 family —
run against the `:3200` standalone server on `db/custom.db`), and the
S39 one-command standing suite **23/23 GREEN, exit 0** — zero code
findings on arrival.

## The governing finding — the accent × landscape cell + the interaction at the short viewport

The documented S39 next-step (the session_91 summary's standing next
candidates, its first-named: "the landscape × accent drawer-navigation
combo (the 844×390 sibling)"). The coverage map, verified against the
standing scripts this session:

1. **The landscape 844×390 × accent cell is ZERO-coverage**:
   landscape-sweep (S35) sweeps all 20 views through the drawer at 844 —
   LIGHT only, **violet only** (zero `accentColor` references, verified
   by grep); accent-light (S37) sweeps all 7 accents — **390×844 only**
   (viewport-guarded); accent-midband (S39) sweeps all 7 accents —
   **768×1024 only** (viewport-guarded); accent-dark (S38) sweeps all 7
   accents at 1280×800 + 390×844 — **dark only**; the 844×390 width is
   in NEITHER accent surface.
2. **The navigation-interaction gap at the short viewport**: the S39
   accent-midband-sweep proved the drawer's active-link accent tint
   follows the navigation (aria-current moves → the `.sf-nav-active`
   10%-alpha `NAV_ACTIVE_GRADIENT_STOPS` gradient re-tints) — at
   **768×1024 only**. At 844×390 the same tint, read on a NON-Dashboard
   view's link through the real navigation lifecycle, was verified at
   **zero views, zero accents** — and the tint rides a
   dynamically-built CSS var name (`toCssVar` kebab-case suffixes — the
   S8 lesson: a camelCase token silently resolves to no var and the
   gradient computes to `none`).
3. The landscape band is the SHORT-VIEWPORT band: the drawer nav whose
   scroll is the ONLY path to links 8–20 at 390 height (measured S35:
   scrollHeight 1068 vs clientHeight 301), the fixed h-16 app bar
   covering 16% of the viewport, the pt-* heading clearance under it,
   the h-[calc(100vh-8rem)] panes at 262px — and those
   height-dependent structures had never been exercised at a non-violet
   accent by any standing audit (the S35 contracts were proven in
   light+violet only).

## The exploration (the genuine run 1)

The accent × landscape drawer-navigation family swept clean BEFORE the
plan was finalized — **7 accents × 20 views navigated THROUGH THE
DRAWER at 844×390 in light mode** (PATCHed through the settings API,
self-verified on `<html data-accent>`, every view recorded explicitly,
~5.5 min measured): **findings 0 across all 140 renderings + 7 drawer
records**. The interaction itself is GREEN — the S39 proof extended to
the short viewport: `activeLabel === the view` on all 140 readings (the
aria-current link follows the navigation at every accent), `activeTint`
read a `linear-gradient` on all 140 (7 DISTINCT accent-correct
`NAV_ACTIVE_GRADIENT_STOPS` pairs — violet rgba(139,92,246,.1)→rgba
(99,102,241,.1) through teal rgba(20,184,166,.1)→rgba(6,182,212,.1)),
and the drawer's active link on the FINAL navigated view (Settings)
verified per accent (7/7). The short-viewport contracts hold at EVERY
accent: the drawer nav scrollable at 390 height (re-measured per
accent, 7/7 — the only path to links 8–20), the heading clearance under
the fixed 64px bar × 140. The structural family clean: scrollWidth ≤
844 everywhere (the Timetable canvas inside its container at every
accent), drawer-closed-on-navigation × 140, the app bar + clock × 140,
zero console errors (the 429-RUM class filtered per the signature). The
surfaced unreadable entries — all three documented families: **108
CTA-face** (white on accent-500 — the S11 family-2), **28 calendar
adjacent-month days** (slate-300 — the S6-G pin), **21 yellow priority
pills** (yellow-500 — the S6/S8 pin) — the identical counts to the S37
and S39 explorations, the same exempt surfaces rendering at every
width; **zero non-exempt**; **588 lowcontrast WARN** (the S11 non-gap
family — the identical count to the S39 mid-band exploration). No
genuine finding — the plan shipped as the coverage extension.

The genuine envelope classified **GREEN at the new seam on the first
try** (the S39 label-convention lesson held — the S40 seam used the
display-label convention from birth: "7 accents swept × 140 view
renderings + 140 active-tint readings + 7 drawer records at 844×390 in
MODE light, navigated through the drawer; every accent self-verified
applied; the short-viewport contracts hold; 108 CTA-face exempt; 28
calendar adjacent-day exempt; 21 yellow-pill exempt; 588 WARN").

## The fix (TDD, 23 new pins)

- **RED**: the S40 pin block in `tests/suite-verdict.test.ts` (the
  GREEN shape with all 7 accents × 20 views + the interaction keys +
  the headingClearance key + the drawer per accent; the ALL-VIEWS
  guard; the ALL-ACCENTS guard; the historical S35-shape envelope — a
  violet-only landscape sweep, the exact pre-S40 state; the
  missing-drawer / missing-mode / wrong-viewport shape-errors [the
  390×844 AND the 768×1024 sibling envelopes]; the mode-rot family
  [mode=dark → non-green — the dark × landscape combos are the
  documented S36 non-gap family]; the applied-mismatch family; the
  vehicle-contract family; the short-viewport-contract family
  [drawerNavScrollable=false → the S35-own finding class]; the
  tint-rot family [activeTint "none" → the S8 no-var class, a FINDING];
  the interaction family [activeLabel ≠ the view → the active state did
  not follow the navigation]; the overflow family; the strict-record
  families incl. the missing headingClearance; the drawer-error family;
  the independent-counting family; the three signature-strict
  exemption families each with a positive + a strictness negative; the
  WARN family; the unknown-audit guard) → **13 failed / 166 passed**
  under the current seam (the audit name unknown to it; the 10
  shape-error pins passed vacuously through the unknown-audit path,
  documented).
- **GREEN**: the seam implementation — `classifyAccentLandscapeSweep`
  in `src/lib/suite-verdict.ts` (the AUDIT_NAMES entry + the dispatch
  arm + the classifier: the 844×390 viewport guard on BOTH axes, the
  chrome vehicle contract + the drawerNavScrollable short-viewport
  contract, the ALL-ACCENTS + ALL-VIEWS [display-label convention] +
  drawer-present shape guards, the per-accent applied self-verification,
  the per-view headingClearance shape gate, the finding classes the
  seam owns — applied-mismatch, drawer-error [never a swallow], the
  TINT ROT, the ACTIVE-STATE MISMATCH, the overflow class — and the
  independent contrast counting with the three S37-exact
  signature-strict exemptions) → **179/179 in the file**; the full unit
  layer **463** (was 440); lint ✓ tsc ✓.
- **The probe**: `scripts/accent-landscape-sweep.mjs` — the S39 model
  with the S35 short-viewport contracts folded in: the
  `drawerNavScrollable` measurement at the first drawer open of EVERY
  accent (any non-scrollable reading a FINDING + the aggregate chrome
  boolean false), the per-view `headingClearance` (the identity
  heading's box top ≥ the fixed 64px bar − 1px sub-pixel tolerance),
  the per-view interaction evidence (20 activeLabel/activeTint readings
  per accent through the drawer), the drawer record per accent with the
  tint on the FINAL navigated view, the S37 light contrast checkers
  verbatim, the self-verifying preconditions (viewport BOTH axes, mode
  + accent PATCHed through the settings API and self-verified), the
  429-RUM exact-text filter, the explicit awaited closing violet/light
  restore with its verification, the failure-path restore in the catch,
  and the **S39-F flush-callback ending from birth** (the AP-85 lesson
  — the ~135KB envelope rides `process.stdout.write(json, () =>
  process.exit(code))`, never a bare process.exit).
- **The runner**: `scripts/standing-suite.mjs` gains the 23rd audit
  stage `{ accent-landscape-sweep, timeoutMs: 20 min }` directly after
  `accent-midband-sweep` (the light accent family together: light
  mobile → light mid-band → light phone-landscape → dark mobile →
  light accent 390 → light accent 768 → **light accent 844×390** →
  dark desktop → accent dark) + the stage-count literals 22 → 23 —
  the suite now **24 rows**.

## The validation run

The S32 differential applied BEFORE the run (the dev server restarted
by PID — the in-memory ai:/RUM limiters cleared, the S31 preflight
GREEN), then the clean-window full-suite run: **24/24 GREEN, exit 0**.
The new accent-landscape-sweep row GREEN inside the suite on its first
integration — identical counts to the exploration (140 renderings, 140
tint readings, 7 drawer records, 108/28/21 exempt, 588 WARN —
deterministic; ~5.5 min measured against the 20-min stage budget,
~3.6× headroom). Every other stage green: the mobile/midband/landscape
light sweeps, the dark-mobile, the accent-light (the S39-F-fixed probe
full-size), the accent-midband, the dark-sweep, the accent-dark, the
cwv, the ai-error/ai-a11y, the pre15-preflight, the dep-audit (2
advisories documented as non-production — the standing upstream item),
and the theme-restore closing guard light/violet. The evidence envelope
captured to
`docs/screenshots/s40-accent-landscape-sweep-evidence.json` (24 stage
rows).

## The gates + the standing checks

Gates re-run: lint ✓ tsc ✓ **463 unit** ✓ (20 files) build ✓ cold-
`db/e2e.db` **291 e2e** ✓ (4.5 min) = **754 green** (was 731; +23 unit
pins; the 291 prior pins untouched by construction — zero app code,
zero CSS, zero Tailwind v4 surface, zero parity-pinned bytes).

Standing checks re-run post-change: the drawer check GREEN; the S40
evidence screenshot
`docs/screenshots/s40-accent-landscape-drawer-teal-notes-844.png` —
the drawer OPEN at 844×390 in LIGHT mode under the TEAL accent with
the ACTIVE LINK ON THE NAVIGATED NOTES VIEW and the nav SCROLLED into
view (the record verified in-frame: linkCount 20, activeLabel "Notes",
the teal active-tint gradient rgba(20, 184, 166, 0.1) → rgba(6, 182,
212, 0.1) — the NAV_ACTIVE_GRADIENT_STOPS teal pair — light mode,
navScrollable true, scrollWidth 844); the standing 31 screenshots
refreshed via `capture-studyflow.mjs` (theme restored light); the
closing theme guard verified via Prisma: **light/violet**.

## The docs aligned (the AP-74 guard)

AGENTS.md (the 463 line + the accent-landscape-sweep command entry +
the 22-audit suite entry), vitest.config.ts (463), CLAUDE.md (463 + the
S40 seam note), PAD §8.1 (the suite-verdict row extended with the S39 +
S40 classifiers + the per-file count 156 → 179 + Total 754/463),
README (the 754 badge + the 463 lines ×2 + the S40 classifier mention +
the session-40 status row), SKILL.md (the 754/463 counts ×2 + AP-86 —
the viewport-contract lesson: a contract proven at one viewport is not
proven at another; the height-dependent structures ride their own
vehicle contract), this session's remediation plan
(`docs/remediation-plan-session40.md` with the filled execution log),
the worklog S40 entry, this narrative + the session_94 summary.
