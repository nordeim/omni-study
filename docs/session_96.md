# Session 96 — The S41 desktop light-accent sidebar-navigation sweep

The workspace re-cloned fresh (the sandbox had been reset; the remote
main at `9b88f09` — the session_95 transcript on top of the S40 push
`8fdfc83`); the environment rebuilt (`.env` per the contract with
`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`bun install` 489 packages, `db:push` + `db:seed` — the demo user with
the showcase data). The core docs read (AGENTS through the S40 rows,
CLAUDE, README, PAD through §8.1, SKILL through AP-86), then the session
docs (session_94 + session_95 + remediation-plan-session40 + the worklog
S40 entry); every current-state claim re-verified against the codebase
on arrival (the vitest 20-file/463 config, the playwright 291-spec
config, the 22-row STAGES list, the `classifyAccentLandscapeSweep` seam,
the 20 NAV_ITEMS; skills/ excluded per the brief).

## The validation on arrival

The **754-green baseline re-confirmed**: lint ✓ tsc ✓ **463 unit** ✓
(20 files) build ✓ cold-`db/e2e.db` **291 e2e** ✓ (4.4 min). The
standing checks all GREEN: the S31 preflight, the mobile-drawer check,
the live agent-browser 390×844 walkthrough (**the mobile navigation
menu is working as expected** — login → dashboard scrollWidth 390 →
the drawer's 20 links in the documented order → the active link
"Notes" with the violet `NAV_ACTIVE_GRADIENT_STOPS` gradient after
drawer navigation → the drawer closes on navigation), the reference
re-sweep **UNCHANGED since S19–S40** (the login title "AcademiaFlow
(Copy)", the zero-data dashboard with the email-prefix greeting "Good
evening, sepnetflix2023 👋", the same 20 nav views in the same order,
the same five Settings tabs), the copy sweep **14/20 MATCH** with the
6 diffs all data-state (the documented S17 family — run against the
`:3200` standalone server on `db/custom.db`), and the S40 one-command
standing suite **24/24 GREEN, exit 0** — zero code findings on arrival.

## The governing finding — the desktop light-accent cell + the SIDEBAR vehicle's interaction

The documented S40 next-step (the session_94 summary's standing next
candidates, its first-named: "the desktop light-accent family (currently
the documented bracketed non-gap)"). The coverage map, verified against
the standing scripts this session:

1. **The desktop 1280×800 × light × accent cell is ZERO-coverage**:
   accent-dark-sweep (S38) sweeps all 7 accents at 1280×800 — **dark
   only** (its own name is the blind spot); accent-light (S37) sweeps
   all 7 accents — **390×844 only**; accent-midband (S39) — **768×1024
   only**; accent-landscape (S40) — **844×390 only**; dark-sweep (S27)
   sweeps 1280×800 dark, violet only. The desktop LIGHT accent surface
   was the S37-documented "bracketed non-gap" — bracketed by per-accent
   pins at 390 light, 768 light, and 1280 dark, never swept itself.
2. **The SIDEBAR-vehicle interaction gap**: the S39/S40 interaction
   proofs proved the DRAWER's active-link accent tint follows the
   navigation — at 768×1024 and 844×390. The SIDEBAR (the desktop
   vehicle, the surface the reference's desktop users actually navigate
   with) had its tint verified at **zero views, zero accents, in either
   mode**: the e2e layer reads the tint on the **Dashboard** link only,
   violet only (`parity-session8.spec.ts` reads `nav a[aria-current=
   "page"] > span` right after `goto("/Dashboard")`;
   `navigation.spec.ts` moves aria-current to Tasks but never reads the
   TINT on the navigated link); accent-dark's desktop pass navigates by
   direct goto and never reads the sidebar's active link at all. The
   tint rides the same dynamically-built CSS var name (`toCssVar`
   kebab-case suffixes — the S8 lesson: a camelCase token silently
   resolves to no var and the gradient computes to `none`).
3. **The vehicle contract INVERTS at desktop + the sidebar-own scroll
   contract**: at 1280 the navigation vehicle contract inverts — the
   sidebar MUST be visible (`lg:flex` = ≥1024) and the hamburger/app
   bar MUST be hidden (`lg:hidden`) — the mirror of the S33/S34/S35/
   S39/S40 vehicle contracts, never asserted by any standing probe at
   this width. AND the sidebar nav is its own short-viewport structure
   at 800 height: measured this session (scrollHeight **1068** vs
   clientHeight **534**) — the nav's scroll is the ONLY path to links
   ~13–20, the desktop sibling of the S35 drawerNavScrollable contract,
   never measured by any standing probe.

## The exploration (the genuine run 1)

The accent × desktop light sidebar-navigation family swept clean BEFORE
the plan was finalized — **7 accents × 20 views navigated THROUGH THE
SIDEBAR at 1280×800 in light mode** (PATCHed through the settings API,
self-verified on `<html data-accent>`, every view recorded explicitly,
~3.2 min measured): **findings 0 across all 140 renderings + 7 sidebar
records**. The interaction itself is GREEN — the S39/S40 proof extended
to the DESKTOP vehicle: `activeLabel === the view` on all 140 readings
(the aria-current link follows the navigation at every accent — read
DIRECTLY while each view is active; the sidebar is always in the DOM,
no next-open indirection), `activeTint` read a `linear-gradient` on all
140 (7 DISTINCT accent-correct `NAV_ACTIVE_GRADIENT_STOPS` pairs —
violet rgba(139,92,246,.1)→rgba(99,102,241,.1) through teal
rgba(20,184,166,.1)→rgba(6,182,212,.1)), and the sidebar record's
active link on the FINAL navigated view (Settings) verified per accent
(7/7). The sidebar-own contracts hold at EVERY accent: the sidebar nav
scrollable at 800 height (re-measured per accent, 7/7 — the only path
to links ~13–20), the heading offset under the fixed 260px sidebar ×
140 (the `lg:ml-[260px]` content contract), the sidebar persistent
through navigation × 140, the INVERTED chrome contract (sidebar visible
+ hamburger hidden). The structural family clean: scrollWidth ≤ 1280
everywhere (the Timetable canvas fits the 956px desktop content area at
every accent), zero console errors (the 429-RUM class filtered per the
signature). The surfaced unreadable entries — all three documented
families: **94 CTA-face** (white on accent-500 — the S11 family-2; the
desktop layout renders fewer CTA-face surfaces than the portrait
stacks' 108), **28 calendar adjacent-month days** (slate-300 — the
S6-G pin, the identical count to the sibling sweeps), **21 yellow
priority pills** (yellow-500 — the S6/S8 pin, identical) — **zero
non-exempt**; **596 lowcontrast WARN** (the S11 non-gap family — 580
view-scope + 16 sidebar-scope entries at the desktop layout). No
genuine finding — the plan shipped as the coverage extension.

The genuine envelope classified **GREEN at the new seam on the first
try** (the S39 label-convention lesson held — the S41 seam used the
display-label convention from birth: "7 accents swept × 140 view
renderings + 140 active-tint readings + 7 sidebar records at 1280×800
in MODE light, navigated through the sidebar (the desktop vehicle);
every accent self-verified applied; the sidebar-own contracts hold (nav
scrollable, heading offset); 94 CTA-face exempt; 28 calendar
adjacent-day exempt; 21 yellow-pill exempt; 596 WARN").

**The S41-B field correction**: the probe's first draft checked the
sidebar's visibility through `offsetParent !== null` (the drawer-vehicle
sweeps' pattern) — but the desktop sidebar is `position: fixed`, and
**offsetParent reads null for fixed elements in Chromium even when
fully rendered** (verified live: offsetParent false, display flex,
getClientRects 1, width 260 at 1280). The rendered check for a
fixed-position element is `getClientRects().length > 0`. The
precondition fired LOUDLY on the probe's first run (exit 1, zero
findings measured — the self-verifying doctrine working as designed),
the check fixed in the chrome precondition + the per-view persistence
check + the evidence capture script, and the genuine run went clean.
The drawer-vehicle sweeps' own offsetParent checks stay correct for
THEIR vehicle (the aside is display:none below 1024 — offsetParent
null for the right reason there).

## The fix (TDD, 24 new pins)

- **RED**: the S41 pin block in `tests/suite-verdict.test.ts` (the
  GREEN shape with all 7 accents × 20 views + the interaction keys +
  the desktop headingOffset/sidebarVisible keys + the sidebar per
  accent; the ALL-VIEWS guard; the ALL-ACCENTS guard; the historical
  S38-shape envelope — an accent-dark desktop pass, the flat
  desktop/mobile maps, the exact pre-S41 state; the missing-sidebar /
  missing-mode / wrong-viewport shape-errors [the 390×844 AND the
  768×1024 AND the 844×390 sibling envelopes]; the mode-rot family
  [mode=dark → non-green — the desktop dark accent family belongs to
  accent-dark-sweep]; the applied-mismatch family; the INVERTED
  vehicle-contract family [a hidden sidebar AND a visible hamburger —
  the mirror contract]; the scroll-contract family
  [sidebarNavScrollable=false → the S41-own finding class]; the
  tint-rot family [activeTint "none" → the S8 no-var class, a FINDING];
  the interaction family [activeLabel ≠ the view]; the overflow family
  [scrollWidth 1400]; the strict-record families incl. the missing
  headingOffset + the missing sidebarVisible; the sidebar-error family;
  the independent-counting family; the three signature-strict exemption
  families each with a positive + a strictness negative; the WARN
  family; the unknown-audit guard) → **13 failed / 190 passed** under
  the current seam (the audit name unknown to it; the 11 shape-error
  pins passed vacuously through the unknown-audit path — documented).
- **GREEN**: the seam implementation `classifyAccentDesktopSweep` in
  `src/lib/suite-verdict.ts` — the AUDIT_NAMES entry + the dispatch arm
  + the classifier (the 1280×800 viewport guard on BOTH axes; the
  INVERTED chrome vehicle contract [sidebarVisible true +
  hamburgerVisible false] + the sidebarNavScrollable scroll contract;
  the ALL-ACCENTS + ALL-VIEWS [display-label convention] +
  sidebar-present shape guards; the per-accent applied
  self-verification; the per-view headingOffset + sidebarVisible shape
  gates; the finding classes the seam owns — applied-mismatch,
  sidebar-error [never a swallow], the TINT ROT, the ACTIVE-STATE
  MISMATCH, the overflow class; the independent contrast counting with
  the three S37-exact signature-strict exemptions) → **203/203** in the
  file; the full unit layer **487** (was 463; +24 pins). lint ✓ tsc ✓.
- **The probe** `scripts/accent-desktop-sweep.mjs`: the S40 model with
  the desktop-vehicle differences — the navigation through the SIDEBAR
  (Playwright auto-scrolls below-fold links into the nav's scroll, the
  S35 proof's desktop sibling), the per-view interaction evidence read
  DIRECTLY while each view is active (the sidebar is always in the DOM
  — no next-open indirection), the sidebar-own scroll contract
  re-measured per accent, the per-view headingOffset (the content
  clears the fixed 260px sidebar) + the sidebarVisible persistence, the
  S37 light contrast checkers verbatim (main-scope + aside-scoped), the
  self-verifying preconditions, the 429-RUM exact-text filter, and the
  S39-F flush-callback exit from birth (the AP-85 lesson).
- **The runner**: the 23rd audit stage `{ accent-desktop-sweep,
  timeoutMs: 20 min }` directly after accent-landscape-sweep (the light
  accent family together: 390 → 768 → 844 → **1280**) + the stage-count
  literals 23 → 24 — the suite now 25 rows.

## The validation suite (the clean window)

The first clean-window run read **24/25** — every stage GREEN except the
new accent-desktop-sweep row, which aborted environmentally: "stage
exited 1 — at UtilityScript.evaluate" with a 0-byte stdout (the page's
renderer died mid-evaluate under the container's memory ceiling — the
AGENTS.md OOM trap: the live agent-browser chrome daemons left open from
the session's earlier walkthrough/reference sweeps (~500MB) + the dev
server (1.1GB RSS) + the stage's own chromium squeezed the 3.9GB
container; the loud-failure doctrine worked — a RED row, never a silent
green). The immediate probe re-run against the same server: **exit 0,
findings 0, 140 renderings — deterministic-clean**. The remedy: the
interactive browser daemons closed (3.0GB free — 2× the headroom), the
dev server restarted by PID, the suite re-run.

**The re-run: 25/25 GREEN, exit 0** — the new accent-desktop-sweep row
GREEN inside the suite on its second integration (identical counts to
the exploration: 140 renderings, 140 tint readings, 7 sidebar records,
94/28/21 exempt, 596 WARN — deterministic; ~3.2 min measured against
the 20-min stage budget), every other stage green, the theme-restore
closing guard light/violet. The evidence envelope captured to
`docs/screenshots/s41-accent-desktop-sweep-evidence.json` (25 stage
rows). The operational lesson recorded: close the interactive browser
sessions BEFORE launching the standing suite.

## The gates

lint ✓ tsc ✓ **487 unit** ✓ (20 files) build ✓ cold-`db/e2e.db` **291
e2e** ✓ (4.5 min) = **778 green** (was 754; +24 unit pins; the 291 prior
pins untouched by construction — zero app code, zero CSS, zero Tailwind v4
surface, zero parity-pinned bytes).

## The evidence + the standing checks

The drawer check GREEN; the S41 evidence screenshot
`docs/screenshots/s41-accent-desktop-sidebar-teal-notes-1280.png` via
`scripts/capture-s41-evidence.mjs` — the desktop 1280×800 in LIGHT mode
under the TEAL accent with the SIDEBAR's ACTIVE LINK ON THE NAVIGATED
NOTES VIEW, the nav SCROLLED into view (the record verified in-frame:
linkCount 20, activeLabel "Notes", the teal active-tint gradient
rgba(20, 184, 166, 0.1) → rgba(6, 182, 212, 0.1) — the
NAV_ACTIVE_GRADIENT_STOPS teal pair — navScrollable true [scrollHeight
1068 vs clientHeight 534], the Notes heading at x=292 clearing the fixed
260px sidebar, light mode, scrollWidth 1280); the standing 31
screenshots refreshed via `capture-studyflow.mjs` (theme restored
light); the closing theme guard verified via Prisma: **light/violet**.

Docs aligned (the AP-74 guard): AGENTS.md (the 487 line + the
accent-desktop-sweep command entry + the 23-audit suite entry),
vitest.config.ts (487), CLAUDE.md (487 + the S41 seam note), PAD §8.1
(the suite-verdict row extended with the S41 classifier + the per-file
count 179 → 203 + Total 778/487), README (the 778 badge + the 487 lines
×2 + the S41 classifier mention + the session-41 status row), SKILL.md
(the 778/487 counts ×2 + AP-87 — the vehicle-never-varied lesson). The
worklog entry + the session_96 narrative + the session_97 summary.
