# Session 90 — The S39 accent × mid-band drawer-navigation sweep

The workspace re-cloned fresh (the sandbox had been reset; the remote
main at `f4c8ef8` — the session_89 transcript on top of the S38 push
`8f32213` + `575510e`); the environment rebuilt (`.env` per the contract
with `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`bun install` 489 packages, `db:push` + `db:seed` — the demo user with
the showcase data). The core docs read (AGENTS through the S38 rows,
CLAUDE, README, PAD through the S38 rows, SKILL through AP-83), then the
session docs (session_88 + session_89 + remediation-plan-session38 +
the worklog S38 entry); every current-state claim re-verified against
the codebase on arrival (the vitest 20-file/419 config, the playwright
291-spec config, the 22-row STAGES list, the `classifyAccentDarkSweep`
seam, the 20 NAV_ITEMS; skills/ excluded per the brief).

## The validation on arrival

The **710-green baseline re-confirmed**: lint ✓ tsc ✓ **419 unit** ✓
(20 files) build ✓ cold-`db/e2e.db` **291 e2e** ✓ (4.4 min). The
standing checks all GREEN: the S31 preflight, the mobile-drawer check,
the live agent-browser 390×844 walkthrough (**the mobile navigation
menu is working as expected** — login → dashboard scrollWidth 390 →
the drawer's 20 links in the documented order → drawer closes on
navigation on every view probed → the Settings five tabs → the Profile
tab's Email address card above the Change password + Danger zone
cards), the reference re-sweep **UNCHANGED since S19–S38** (the login
title "AcademiaFlow (Copy)", the zero-data dashboard with the
email-prefix greeting "Good morning, sepnetflix2023 👋", the same 20
nav views in the same order, the same five Settings tabs), the copy
sweep **14/20 MATCH** with the 6 diffs all data-state (the documented
S17 family — run against the `:3200` standalone server on
`db/custom.db`), and the S38 one-command standing suite **22/22 GREEN,
exit 0** — zero code findings on arrival.

One transient artifact diagnosed during the walkthrough (not a code
finding): after a failed covered-click, the closed drawer's brand span
lingered mid-transition and `elementFromPoint` picked it up over the
hamburger — a clean reload shows the drawer fully unmounts (Radix
removes the content from the DOM), and the standing probes pin the
drawer-closed geometry properly. One workspace incident en route: a
`:3200` standalone kill by the wrong PID (`next-server` was the DEV
server's child, not the standalone's — the standalone is
`bun .next/standalone/server.js`) took the dev server down; both
restarted cleanly, the copy sweep re-run canonical.

## The governing finding — the accent × mid-band cell + the navigation-interaction gap

The documented S38 next-step (the session-88 summary's standing open
items: "the drawer-navigation × accent interaction at mid-band"). The
coverage map, verified against the standing scripts this session:

1. **The mid-band 768×1024 × accent cell is ZERO-coverage**:
   midband-sweep (S34) sweeps all 20 views through the drawer at 768 —
   LIGHT only, **violet only** (zero `accentColor` references);
   accent-light (S37) sweeps all 7 accents — **390×844 only**
   (viewport-guarded); accent-dark (S38) sweeps all 7 accents at
   1280×800 + 390×844 — **dark only**; the 768 width is in NEITHER
   accent surface.
2. **The navigation-interaction gap**: the accent sweeps navigate by
   DIRECT GOTO, so the only drawer-active-tint reading they take is on
   the DASHBOARD link (the landing view) — once per accent. The
   active-link tint on a NON-Dashboard view, applied through the real
   navigation lifecycle (click a different link → `aria-current=page`
   moves → the `.sf-nav-active` 10%-alpha `NAV_ACTIVE_GRADIENT_STOPS`
   gradient re-tints the NEW link), was verified at **zero views,
   zero accents, in either mode** — and the tint rides a
   dynamically-built CSS var name (the S8 kebab-case lesson: a
   camelCase token silently resolves to no var and the gradient
   computes to `none`).
3. The mid-band is the band where the drawer is the ONLY navigation
   vehicle (the sidebar is `lg:flex` = ≥1024) AND the md structures
   that never render at 390 appear (the Tasks `hidden md:flex w-64`
   aside, the two-pane Notes/Flashcards `w-80` layouts, the Timetable
   `min-w-[900px]` canvas) — the switchiest width in the 391–1023px
   band, never probed at a non-violet accent by any standing audit.

## The exploration (the genuine run 1)

The accent × mid-band drawer-navigation family swept clean BEFORE the
plan was finalized — **7 accents × 20 views navigated THROUGH THE
DRAWER at 768×1024 in light mode** (PATCHed through the settings API,
self-verified on `<html data-accent>`, every view recorded explicitly):
**findings 0 across all 140 renderings + 7 drawer records**. The
interaction itself is GREEN — the first standing proof: `activeLabel ===
the view` on all 140 readings (the aria-current link follows the
navigation at every accent), `activeTint` read a `linear-gradient` on
all 140 (7 DISTINCT accent-correct `NAV_ACTIVE_GRADIENT_STOPS` pairs —
violet rgba(139,92,246,.1)→rgba(99,102,241,.1) through teal
rgba(20,184,166,.1)→rgba(6,182,212,.1)), and the drawer's active link
on the FINAL navigated view (Settings) verified per accent (7/7). The
structural family clean: scrollWidth ≤ 768 everywhere (the Timetable
canvas inside its container at every accent), drawer-closed-on-
navigation × 140, the app bar + clock × 140, zero console errors (the
429-RUM class filtered per the signature). The surfaced unreadable
entries — all three documented families: **108 CTA-face** (white on
accent-500 — the S11 family-2), **28 calendar adjacent-month days**
(slate-300 — the S6-G pin), **21 yellow priority pills** (yellow-500 —
the S6/S8 pin); **zero non-exempt**; **588 lowcontrast WARN** (the S11
non-gap family). No genuine finding — the plan shipped as the coverage
extension.

The genuine-run classification caught one real defect IN THE SEAM's
first draft (the anti-phantom guard doing its job): the probe records
views by their DISPLAY labels ("My Day" — the drawer links' accessible
names, the S34 convention) while the first ALL-VIEWS list used the
PATH-style labels ("MyDay" — the S38 accent-dark convention); the
missing-"MyDay" shape-error fired on the first real envelope, and the
seam's canonical list switched to the display-label convention (the
vehicle family's own). A guard that fires on its first real envelope is
a guard that works.

## The fix (TDD, 21 new pins)

- **RED**: the S39 pin block in `tests/suite-verdict.test.ts` (the
  GREEN shape with all 7 accents × 20 views + the interaction keys +
  the drawer per accent; the ALL-VIEWS guard; the ALL-ACCENTS guard;
  the historical S34-shape envelope — a violet-only midband sweep, the
  exact pre-S39 state; the missing-drawer / missing-mode /
  wrong-viewport shape-errors; the mode-rot family ode=dark →
  non-green — the dark × mid-band combos are the documented S36
  non-gap family]; the applied-mismatch family; the vehicle-contract
  family; the tint-rot family ctiveTint "none" → the S8 no-var rot
  class, a FINDING]; the interaction family ctiveLabel ≠ the view →
  the active state did not follow the navigation]; the overflow family
  [scrollWidth 800 → finding]; the strict-record families incl. the
  missing activeTint; the drawer-error-is-a-finding family; the
  independent-counting family; the three signature-strict exemption
  families each with a positive + a strictness negative; the WARN
  family; the unknown-audit guard) → **12 failed / 144 passed** under
  the current seam (the audit name unknown to it — the 12 = the
  GREEN-shape + finding-family pins; the 9 shape-error pins passed
  vacuously through the unknown-audit path, documented in the plan).
- **GREEN**: `classifyAccentMidbandSweep` implemented in
  `src/lib/suite-verdict.ts` — the AUDIT_NAMES entry + the dispatch
  arm + the classifier: the viewport 768×1024 + mode light + chrome
  vehicle contracts, the ALL-ACCENTS + ALL-VIEWS (display-label
  convention) + drawer-present shape guards, the per-accent `applied`
  self-verification, and the finding classes this seam owns — the
  applied-mismatch, the drawer-error (never a swallow), the **tint
  rot** (activeTint "none"/empty — the S8 class), the **active-state
  mismatch** (activeLabel ≠ the view — the interaction contract), the
  overflow class, and the independent contrast counting with the three
  S37-exact signature-strict exemptions → **156/156** in the file; the
  full unit layer **440** (was 419; +21 pins).
- **The probe**: `scripts/accent-midband-sweep.mjs` — all 20 views per
  accent navigated THROUGH THE DRAWER at 768×1024 (the S34 vehicle
  pattern), the per-view interaction evidence (the active link's label
  + inner-span gradient read at every drawer open — 20 readings per
  accent), the S37 light contrast checkers verbatim (the view checker
  + the dialog-scoped drawer checker), the S34 structural family
  (heading, scrollWidth, drawer-closes, app bar, console errors), the
  self-verifying preconditions (both viewport axes, the chrome vehicle
  contract, the PATCHed + verified mode/accent, the awaited closing
  restore, the failure-path restore), and the exit-0 contract
  (findings + non-exempt detections === 0). Genuine run 1: **findings
  0** — the envelope classified GREEN at the seam ("7 accents swept ×
  140 view renderings + 140 active-tint readings + 7 drawer records at
  768×1024 in MODE light, navigated through the drawer; every accent
  self-verified applied; 108 CTA-face exempt; 28 calendar adjacent-day
  exempt; 21 yellow-pill exempt; 588 WARN").
- **The runner**: `scripts/standing-suite.mjs` gains the 22nd audit
  stage `{ name: "accent-midband-sweep", timeoutMs: 20 min }` directly
  after `accent-light-sweep` (the light family together), the
  stage-count literals 21 → 22, the header stage list updated.
- **The evidence capture**: `scripts/capture-s39-evidence.mjs` — the
  drawer OPEN at 768×1024 in LIGHT mode under the TEAL accent with the
  ACTIVE LINK ON THE NAVIGATED NOTES VIEW (navigated through the
  drawer; `activeLabel === "Notes"` + the teal gradient verified
  in-frame before the capture).

## The second genuine finding — the stdout-flush race (S39-F)

The validation run 1 came back **22/23**: the new accent-midband row
GREEN on its first suite integration (identical counts to the
exploration — deterministic), every stage green EXCEPT
accent-light-sweep — "stdout did not parse: SyntaxError … position
145742". The diagnosis: the probe had SUCCEEDED (findings 0, the exit
code and the theme restore clean) but its ~150KB envelope was TRUNCATED
at 146176 bytes, ending mid-string inside a detector entry.
`console.log(bigJson)` on a pipe is an ASYNC write, and the bare
`process.exit(code)` right after it terminated the process before the
write fully flushed — the classic Node exit-truncation race,
load-dependent and nondeterministic (the same probe parsed full-size in
the arrival suite hours earlier; every S37/S38 suite run before it was a
latent coin flip that came up heads). A truncated envelope reading
"stdout did not parse" is a FALSE FAILURE — exactly the phantom class
the S32 seam exists to prevent, caught this time in the runner's own
stdout capture.

The fix (the documented-safe pattern): the exit code is computed FIRST,
then the envelope write carries the exit in its flush callback —
`process.stdout.write(json + "\n", () => process.exit(exitCode))` —
applied to accent-light-sweep.mjs and accent-midband-sweep.mjs (the two
>64KB process.exit probes; accent-dark is safe by construction — it
exits naturally after its console.log; every other standing probe's
envelope measures <8KB). The validation re-run launched in a fresh clean
window. The lesson is AP-85: a probe that prints a big envelope must
ride the flush callback.

(The validation re-run + the remaining gates ran after this point —
the results are recorded in the plan's execution log and the summary.)
