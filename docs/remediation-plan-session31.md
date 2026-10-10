# Remediation Plan — Session 31 (S31): the dev-server boot-stability preflight — the stale-Turbopack-cache reload loop, given a standing loud-diagnosis probe

**Audit surfaces (this session, session-62 workspace run at `739b082`):** the
full production-readiness sweep ran on arrival — the baseline gates (lint ✓
tsc ✓ 273 unit ✓; `bun run build` ✓; the cold-`db/e2e.db` full e2e regression
**291 ✓ (4.5 min)** = the documented **564-green** state re-confirmed), the
mobile-drawer check (backdrop `oklab(0 0 0/0.2)` + blur(4px), 288px white
panel, 20 links, no footer, Escape-close superset) **plus a live
agent-browser walkthrough at 390×844** (the app bar with the
Open-navigation-menu button + brand + live clock; the drawer opens as a
dialog with all 20 links; the Settings link navigates by ref; the Profile
tab renders the S26 Email address card above the S24 Change password + S25
Danger zone cards; scrollWidth 390 — **the mobile navigation menu is working
as expected**), and the reference re-sweep (login + dashboard + drawer +
Settings/Profile at 390×844): **the reference is UNCHANGED since S19–S30**
(zero-data 0/0, greeting from the email prefix, "Saturday, October 10,
2026"; the same 20 nav views in the same order; the login/title
"AcademiaFlow (Copy)" platform-rename artifact with the in-app "StudyFlow"
branding; the same five Settings tabs with School/Grade/Goal fields). The
20-view copy sweep: **14/20 MATCH** with the 6 diffs all data-state (the
documented S17-pinned non-gap family). The standing audit suite ran **all
GREEN with zero code findings**: security ✓ (0 findings, 7 nonGaps, the
documented limiter shape after a clean single run), settings-roundtrip ✓,
connectivity ✓ (the S28 repair validated live), upload-edge ✓, data-volume ✓,
forced-colors ✓, print ✓, focus-order ✓, CWV ✓ (0 findings; CLS GOOD
everywhere; clone throttled-mobile dashboard LCP NI — the documented S16
state; the reference's own mobile login LCP POOR), dark-sweep ✓ (the S27
repair validated live: MODE dark, 0 findings across all 20 views),
accent-dark-sweep ✓ (0 fails), ai-error-audit ✓ (0), ai-a11y-audit ✓ (0),
pre15-preflight ✓ ("deps pinned by design, client bundle lean, no action"),
dep-audit ✓ (GREEN — the S30 probe's first standing re-run: 2 advisories
documented non-production, 0 runtime-reachable). The demo user's theme
verified restored (light/violet, via Prisma) after the mutating audits.

## The governing finding (this session's work)

Mid-suite, the connectivity audit **failed with an opaque 30-second
`page.click` timeout**: the login submit button stayed `disabled`, the
Playwright log showed "element was detached from the DOM, retrying" +
repeated "navigated to http://localhost:3000/login" — and a dedicated
diagnostic probe (nav-event recording + hydration observation) captured the
real state: **the /login route was in a continuous full-page reload loop**
(17+ main-frame navigations inside a 15-second window; React never
hydrated; the fills were discarded on every reload). This is the S9
"Fast Refresh rebuild loop" failure mode — but with a sharper, previously
undocumented edge:

1. **The S9 remedy ("restart the daemon cleanly") is INSUFFICIENT for this
   variant.** The session's daemon HAD just been restarted (a clean boot,
   healthy `/api/health`, warm `/login` HTTP 200 in 29 ms) — the reload
   loop persisted across the restart. The differential proof: the SAME
   daemon-restart procedure + `rm -rf .next/dev` (the 282 MB Turbopack
   incremental cache) → the loop is gone, login works end-to-end (button
   enables, click lands on /Dashboard). The stale state lives IN the
   `.next/dev` cache, not in the daemon process.
2. **The corruption is non-deterministic** (the unclean-kill recipe: a
   `pkill` while Turbopack is mid-cache-write, e.g. while browser-context
   audits hammer a route) — a deliberate unclean kill + restart WITHOUT a
   cache clear did NOT reproduce the loop a second time. One proven
   occurrence + one proven remedy; the non-determinism makes the loud
   standing probe MORE valuable, not less (an intermittent, opaque
   environment failure is exactly the class a future session would
   misdiagnose as an app defect — "the login card's button never enables"
   — and "fix" the wrong layer, the S28 phantom-finding lesson's mirror
   image).
3. **The probe-side gap (the S27/S28 doctrine's missing arm):** the
   browser-context audits assume a hydrated, navigation-stable dev server
   as a PRECONDITION, but no probe verifies it. When the precondition is
   violated the audits fail OPAQUELY (a generic click timeout whose
   Playwright log points at the button, not at the cache) — the
   connectivity audit spent its 30 s budget producing a stack trace that
   names neither the reload loop nor the remedy. The S27 doctrine ("a
   probe asserts its own precondition, failing loudly with no findings
   when it cannot verify the state it is about to measure") has a
   boot-stability arm that does not exist yet.

**The deliverable: a standing dev-server boot-stability preflight** —
`node scripts/dev-server-preflight.mjs` — that loads `/login` on the dev
server, measures the two stability signals (main-frame navigation count in
a fixed post-load window; the login form's hydration — fill both fields,
wait for the submit button to enable), classifies the boot state through a
pure seam, and exits 1 with a LOUD verdict naming the exact remedy on
failure (`rm -rf .next/dev` + restart — the S9-lesson extension), a
distinct verdict for a dead server, and GREEN only on a hydrated, stable
boot. Run it before any dev-server audit suite (the AGENTS.md convention
this plan installs).

## Families and fixes

### S31-A (HIGH) — the pure seam `src/lib/dev-preflight.ts` + the unit pins `tests/dev-preflight.test.ts`

The CLAUDE.md doctrine (pure logic lives in `src/lib/*` seams with unit
tests; scripts orchestrate, they don't compute):

- `classifyBootStability(input: BootStabilityInput): BootStabilityVerdict`
  — the classifier. Input: `{ reachable: boolean; navigations: number;
  hydrated: boolean }` (`navigations` = main-frame same-path navigations
  observed in the fixed post-load window; `hydrated` = the login submit
  button enabled after both fields were filled). Output:
  `{ verdict: "green" | "reload-loop" | "no-hydration" | "unreachable";
  remedy: string | null }`. Rules, in order (the louder finding wins — the
  S28 doctrine):
  1. `!reachable` → `unreachable` — the remedy names starting the dev
     server (`bun run dev`), NOT the cache clear (a dead server is not a
     stale cache; the diagnosis must be honest).
  2. `navigations >= NAV_LOOP_THRESHOLD` (5) → `reload-loop` — the remedy
     names the full sequence: stop the daemon, `rm -rf .next/dev`, restart
     (`bun run dev`), re-run this preflight. The threshold is derived from
     the measured classes: a healthy boot observes 0 post-load navigations
     (Turbopack's first-compile may legitimately full-reload once or
     twice); the captured loop state observed ~1 navigation/second
     sustained. 5 sits between with margin on both sides.
  3. `!hydrated` → `no-hydration` — the page is navigation-stable but
     React never attached (the S9 silent class). The remedy is staged:
     a first hit compiles slowly — retry once; a persistent no-hydration
     on a warm route is stale daemon state — restart the daemon; if it
     STILL persists, clear `.next/dev`.
  4. else → `green`, `remedy: null`.
  Pinned: the four verdicts; the boundary (4 navigations = not a loop,
  5 = loop); `reload-loop` beats `no-hydration` (a looping page also never
  hydrates — the loop is the louder, more actionable diagnosis);
  `reload-loop` beats a `hydrated: true` reading (a mid-window hydration
  sample from a page that keeps reloading is not stability);
  `unreachable` beats everything (no measurement is possible); the remedy
  strings carry their class's remedy (`rm -rf .next/dev` present on the
  loop remedy, ABSENT from the unreachable remedy — the honest-diagnosis
  guard).

### S31-B (HIGH) — the standing runner `scripts/dev-server-preflight.mjs`

Run as `node scripts/dev-server-preflight.mjs` (plain node — the runner
imports the TS seam... no: the S30 precedent — plain node cannot import
`.ts`; run with `bun scripts/dev-server-preflight.mjs`, the
`prisma/seed.ts`/`dep-audit.mjs` precedent). The runner:

1. Resolves the base URL from `PREFLIGHT_BASE` (default
   `http://localhost:3000` — the dev-server convention; the audits' BASE).
2. Opens `/login` with a hard 10 s `goto` budget; a connection failure →
   the seam's `unreachable` envelope + exit 1 (no further probing).
3. Counts main-frame same-path navigations for a fixed 8 s window AFTER
   the load event (the healthy baseline is 0; the loop state sustains
   ~1/s).
4. Fills the demo credentials and waits up to 10 s for the submit button
   to enable — the hydration signal (the SSR button renders `disabled`;
   only hydrated React + landed input events can enable it).
5. Hands `{ reachable, navigations, hydrated }` to the seam, prints the
   self-describing JSON envelope (`{ ranAt, base, navigations, hydrated,
   verdict, remedy }` — the S27 convention), exits 0 iff `green`.

**Negative controls (the S27/S28/S30 validation convention, executed
before shipping):** (a) a dead port (`PREFLIGHT_BASE=http://localhost:3999`)
→ exit 1, verdict `unreachable`, the remedy names `bun run dev` and does
NOT name the cache clear; (b) a scratch self-reloading server on :3998
serving a login-shaped page (email + password inputs, a `disabled` submit
button that never enables, a 400 ms `location.reload()` loop) → exit 1,
verdict `reload-loop`, the remedy names `rm -rf .next/dev` (the control
models the captured failure state faithfully: navigations accumulate AND
hydration never completes); (c) the genuine healthy dev server → exit 0,
verdict `green`, 0 post-load navigations. Scratch server deleted after
validation.

### S31-C (MEDIUM) — the docs alignment (the AP-74 guard applied to THIS change)

- `AGENTS.md`: (1) the commands-table entry for
  `bun scripts/dev-server-preflight.mjs` (run it before any dev-server
  audit suite); (2) the **S9-lesson extension** in the testing-quirks
  section — the clean-restart remedy is insufficient when the Turbopack
  `.next/dev` cache has gone stale (the reload-loop state survives a
  daemon restart; only `rm -rf .next/dev` clears it; the boot-stability
  preflight detects it loudly).
- `vitest.config.ts`: the header comment's seam list gains dev-preflight
  and the counts (18 → 19 files; 273 → the new count).
- `CLAUDE.md`: the unit-layer count + the seam list gains the S31
  boot-stability classifier; the workflow note (preflight before the
  audit suite).
- `Project_Architecture_Document.md` §8.1: the test-distribution table
  gains the dev-preflight row; the Total row re-derived (46 → 47 files;
  564 → the new total; 18 → 19 unit files).
- `README.md`: the session-31 status row; the §Testing counts.
- `omni-study_SKILL.md`: §11's green-state counts + **AP-76** (the
  lesson — see below).
- `worklog.md` (repo root): the S31 entry.

**AP-76 (the lesson, MEDIUM):** the S27/S28 rot classes were probes with
rotten assertions; S30's was the surface with no probe; S31's is the
**environment precondition no probe verified** — the audits trusted "the
dev server is up" (`/api/health` 200) as "the dev server is MEASURABLE",
and the two are different things: a dev server can serve 200s while its
route graph reload-loops, turning every browser-context audit into an
opaque timeout that names the SYMPTOM (a disabled button) instead of the
CAUSE (a stale `.next/dev` cache the daemon restart never touches). The
guard: verify the boot-stability precondition (navigation-stable +
hydrated) before measuring anything against a dev server, and make the
precondition's failure LOUDER than the audits' failure — a 30 s Playwright
timeout is a stack trace, not a diagnosis. Liveness ≠ stability ≠
hydration: three distinct server states, three distinct remedies, one
probe that names which one it found.

### S31-D (MEDIUM) — the session record

`docs/remediation-plan-session31.md` (this file, with the execution log),
`docs/session_62.md` (the narrative), `docs/session_63.md` (the transcript,
follows the push), the S31 evidence JSON
(`docs/screenshots/s31-dev-preflight-evidence.json` — the captured
reload-loop diagnostic output, the differential proof [restart-without-
clear still broken → clear → healthy], the negative controls, the gates),
and the standing-31 screenshot refresh (no app bytes move; the refresh
proves the tree unchanged).

## Non-gaps (documented, do not fix)

1. **The `.next/dev` cache itself** — Turbopack's incremental cache is a
   dev-mode performance feature; the corruption requires an unclean kill
   mid-write. The remedy (delete + let the next boot rebuild) is the
   documented Turbopack answer; "fixing" the cache (git-ignoring it
   differently, pinning Turbopack versions, or switching to webpack) is
   out of scope for zero production benefit (the standalone build — the
   production surface — never touches `.next/dev`).
2. **The connectivity audit's login sequence stays as-is** — adding the
   hydration gate to every audit's login is the wrong layer (N copies of
   the same guard); the preflight runs ONCE before the suite (the
   AGENTS.md convention) and the S31-B controls prove the failure class
   is detected pre-suite.
3. **The zero-e2e-change rule** — no e2e spec is added (the S27/S28/S30
   convention: probe scripts are execution-validated with negative
   controls, not browser-pinned; the preflight itself IS the
   browser-context probe).
4. **`page.goto`'s `waitUntil: "load"` on a looping page** — the loop
   state's load events DO settle briefly (each reload completes); the
   runner's goto succeeds and the WINDOW COUNT is the detector. No
   `domcontentloaded` tuning needed (verified against the captured loop:
   17 navs in 15 s means the loads complete; the count catches it).

## TDD order

1. **RED**: write `tests/dev-preflight.test.ts` first (the full pin set —
   the four verdicts, the navigation threshold boundary, the
   louder-finding-wins precedence pairs, the honest-remedy guards). Run →
   fails (module `src/lib/dev-preflight` not found). Capture the failing
   run.
2. **GREEN**: implement `src/lib/dev-preflight.ts` (the types + the
   classifier, no fs/browser — pure). Run → all new tests green alongside
   the existing 273.
3. **The runner**: `scripts/dev-preflight.mjs` (browser context + the seam
   import; bun-run); validate with the three negative controls (S31-B);
   capture the genuine healthy run's envelope.
4. **Full gates re-run**: lint → typecheck → unit (the new count) → build
   → cold-`db/e2e.db` 291 e2e — the regression confirmation (no app code,
   no CSS, zero Tailwind v4 surface, zero parity-pinned bytes touched).
5. **Standing checks re-run**: the drawer check GREEN post-change; the
   standing 31 screenshots refreshed via `capture-studyflow.mjs` (the dev
   server restarted cleanly; theme restored light and verified via
   Prisma); the S31 evidence JSON captured.
6. **Docs** (S31-C) + the session record (S31-D) + commit + push via the
   SSH wrapper.

## Risks

- **The .mjs→.ts import requires bun** — the same documented constraint
  as `scripts/dep-audit.mjs` (the AGENTS.md entry says
  `bun scripts/dev-server-preflight.mjs`; plain node cannot import
  TypeScript).
- **The navigation threshold could misfire** — a future Next/Turbopack
  that legitimately full-reloads ≥5 times post-load would read as a loop;
  the threshold is a named constant in the seam, unit-pinned at the
  boundary, and the remedy is non-destructive (a cache rebuild costs one
  warm-up), so a false positive is cheap and self-healing.
- **The hydration fill uses the demo credentials but never submits** — the
  preflight fills both fields and observes the enable transition
  (`disabled={busy || !email || !password}`, login-card.tsx:497) WITHOUT
  clicking submit: zero login requests, zero rate-limit budget (the
  10/IP/15-min limiter never sees the preflight).
- **No parity surface is touched** — the changes are one new lib seam, one
  new test file, one new script, and doc/comment updates; the 291 e2e
  pins and every byte-parity pin are untouched by construction.

## Execution log (session-62 workspace run)

- Baseline on arrival: the documented 564-green state re-confirmed (lint ✓
  tsc ✓ 273 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓ 4.5 min). The
  standing checks FIRST, all GREEN: the drawer probe + the live
  agent-browser 390×844 walkthrough (the app bar, the drawer dialog with
  all 20 links, Settings navigation by ref, the S26/S24/S25 cards on the
  Profile tab, scrollWidth 390 — **the mobile navigation menu is working
  as expected**); the reference re-sweep **UNCHANGED since S19–S30**; the
  copy sweep 14/20 MATCH with 6 data-state non-gaps.
- The standing audit suite ran all GREEN with zero code findings
  (security single-run after the documented double-run artifact resolved
  by the clean dev-server restart; settings-roundtrip, connectivity, 
  upload-edge, data-volume, forced-colors, print, focus-order, dark-sweep,
  accent-dark-sweep, CWV, ai-error, ai-a11y, pre15-preflight, and the
  S30 dep-audit's first standing re-run — GREEN, 2 advisories documented
  non-production, 0 runtime-reachable). Demo theme restored + verified
  (light/violet via Prisma).
- **The finding (captured mid-suite):** after a mid-suite daemon restart,
  the connectivity audit failed OPAQUELY — a 30 s `page.click` timeout on
  the disabled login submit button; the Playwright log showed repeated
  same-URL navigations + "element was detached". The diagnostic probe
  captured the true state: /login in a sustained full-page reload loop
  (17+ main-frame navigations per 15 s; React never hydrated). The S9
  remedy (clean daemon restart) was ALREADY in effect and did not clear
  it. The differential: `rm -rf .next/dev` (282 MB) + restart → healthy
  (login completes to /Dashboard). A control unclean-kill + restart
  WITHOUT the cache clear did NOT re-trigger the loop (non-deterministic
  corruption — kill mid-cache-write), which sharpens the lesson: the
  stale-cache state is intermittent, survives restarts, and only the
  cache clear removes it.
- TDD RED: `tests/dev-preflight.test.ts` written first — 11 pins (the
  classifier matrix: green, unreachable, reload-loop at the ≥5 boundary,
  no-hydration, loop-beats-no-hydration, loop-beats-hydrated,
  unreachable-beats-all, the honest-remedy guards — the loop remedy names
  `.next/dev`, the unreachable remedy does not) → run fails (module not
  found).
- TDD GREEN: `src/lib/dev-preflight.ts` implemented → 12/12; the full
  unit layer: **284 passed (19 files)**.
- The runner `scripts/dev-server-preflight.mjs` (bun-run; the seam
  import; the 8 s post-load navigation window; the fill-and-enable
  hydration signal). Genuine run against the healthy dev server: **GREEN,
  exit 0** (0 post-load navigations, hydrated true).
- Negative controls (validated, scratch server deleted after): (a) the
  dead port → **exit 1, verdict `unreachable`**, remedy names `bun run
  dev` and NOT the cache clear; (b) the scratch self-reloading
  login-shaped page on :3998 → **exit 1, verdict `reload-loop`**, remedy
  names `rm -rf .next/dev`; (c) the genuine healthy dev server → **exit
  0, verdict `green`**.
- Gates re-run: lint ✓ tsc ✓ 284 unit ✓ (19 files) build ✓ cold-`db/
  e2e.db` **291 e2e ✓ = 575 green** (was 564; the 291 prior pins
  untouched by construction — zero app code, zero CSS, zero parity
  surface).
- Standing checks re-run post-change: the drawer check GREEN; the dev
  server restarted cleanly; the standing 31 screenshots refreshed via
  `capture-studyflow.mjs` (theme restored light, verified via Prisma);
  the S31 evidence set captured
  (`docs/screenshots/s31-dev-preflight-evidence.json`).
- Docs aligned (the AP-74 guard applied to this change): AGENTS.md (the
  preflight command entry + the S9-lesson extension), vitest.config.ts
  (19 files / 284 tests + the seam in the list), CLAUDE.md (the unit
  layer 284 line + the preflight-first note + the seam), PAD §8.1 (the
  dev-preflight row + the Total row: 47 files / 575 tests / 284 unit /
  19 unit files), README (the session-31 status row + the §Testing
  counts), SKILL.md (the 575/284 counts + **AP-76**). The re-grep across
  every living doc layer returns zero stale counts.
- The session record: this plan + the session_62 narrative + the worklog
  entry; the session_63 transcript follows the push (the S27–S30 commit
  pattern).
