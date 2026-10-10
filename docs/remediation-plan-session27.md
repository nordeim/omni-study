# Remediation Plan — Session 27 (S27): the dark-sweep audit-tool repair — the self-verifying precondition

**Audit surfaces (this session, session-52 workspace run at `301fd90`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
258 unit ✓; `bun run build` ✓; the cold-`db/e2e.db` full e2e regression
**291 ✓ (4.4 min)** = the documented **549-green** state re-confirmed on
arrival), the mobile-drawer check on BOTH apps (backdrop
`oklab(0 0 0/0.2)`+blur(4px), 288px white panel, 20 links, no footer,
Escape-close superset — the brief's priority item) **plus a live
agent-browser walkthrough at 390×844** (the app bar renders, the drawer
opens as a dialog with all 20 links, the Settings link navigates, the
Profile tab renders the S26 Email address card above the S24/S25 cards, no
horizontal overflow — **the mobile navigation menu is working as
expected**), the reference re-sweep (dashboard + the five-tab Settings +
the 20-view copy sweep): **the reference is UNCHANGED since S19–S26** (the
zero-data account 0/0, school "Lincoln High", Daily Study Goal: 4 hours,
Account created 9/28/2026, 20 nav views in the same order, the branding
split stable; the copy sweep 14/20 MATCH with the 6 remaining diffs all
DATA-STATE — the documented S17-pinned non-gap family), the clone-side
Settings sweep parity ✓, and the S26 code audit (the recent changes: the
`changeEmailSchema` seam, the `POST /api/auth/change-email` route, the
panel's Email address card, the store's `setEmail` action, the specs —
reviewed line-by-line) — **CLEAN**. The test configs +
`DATABASE_URL="file:../db/custom.db"` (db/ at the repo root) +
`.env.example` (matches the codebase, committed) verified current. Docker
re-verified unavailable in the sandbox (the owner's documented step —
DEPLOYMENT.md §8). The scandihaven reference repo re-reviewed — unchanged
since 10-04 (top commit `d4789c3`); no new patterns to adopt.

The production-readiness sweep then re-ran the full standing-audit suite
(the S22/S24 pattern — both backlogs empty, so the standing superset goal
governed): security ✓ (no enumeration, cookie flags, rate limits, MIME,
download headers, auth-gating), settings-roundtrip ✓ (0 failures),
connectivity ✓, upload-edge ✓, data-volume ✓ (0 findings after 750 probe
rows), forced-colors ✓ (1 hit = the Events view's deliberately hidden
`aria-hidden` `sr-only` date trigger — a non-gap), print ✓, focus-order ✓
(anomalies are the documented dev-mode NEXTJS-PORTAL artifact only), CWV ✓
(CLS 0.00 everywhere; LCP as documented — throttled-mobile dashboard NI,
the reference's own mobile login POOR 7.4 s), and accent-dark-sweep — its
residual LOWCONTRAST hits are the **documented S11 verified non-gap
family** (accent-500 CTA faces ~2.15–2.8, the Calendar adjacent-month
dimming 2.36 dark mirroring the light 2.2, the Timetable subject-colored
class cards, the muted type pills — verified against the reference in
session-11; do not "fix" byte-parity-pinned reference-measured surfaces).

## The governing decision (this session's work)

The sweep found exactly ONE genuine defect, of the **tooling-integrity
class** (the AP-69/AP-70 family — a validated-once mechanism silently
rotting after a later change):

**`scripts/dark-sweep.mjs` — the standing AGENTS.md-documented dark-mode
audit tool — silently stopped auditing dark mode after the session-11
theme-lifecycle change.** Run today it sweeps in **LIGHT mode**: the
`MODE:` line prints empty, and the detectors report **97 false
"flashbulbs"** (every ordinary white card on the light canvas) and **7
false "unreadable"** flags (the reference-measured light-mode muted
surfaces — the amber-500-on-yellow-50 `medium` priority pill at 1.85 and
the Calendar adjacent-month slate-300-on-white days at 1.48 — both
documented reference-measured designs). A future session running the
documented command would chase 97 phantom defects.

**The root cause (two stacked defects):**

1. **The stale localStorage key.** The script forces the mode by
   `document.documentElement.classList.add("dark")` +
   `localStorage.setItem("sf-theme-mode", "dark")` (line 95). But the S11
   pre-paint boot script (`src/lib/theme.ts`, `THEME_CACHE_KEY`) reads
   **`sf-theme`** — the `sf-theme-mode` key is read by NOTHING in the
   codebase (verified by grep). The forced class therefore has no cache
   backing it across the very next full page load the script itself
   performs (`page.goto(BASE + "/Dashboard")`).
2. **The auth-correction window.** Even a correctly-forced class is
   corrected: on every full load the boot script applies the cached (or
   matchMedia-light) mode pre-paint, then `/api/auth/me` resolves and
   `loadFromUser` applies the **user's stored preference** — the demo
   user's `themeMode` is `light`, so the dark class is removed before the
   first view is ever probed (the S11 lifecycle working exactly as
   designed; the AGENTS.md testing quirk "dark-mode specs toggle the theme
   via the API, not the UI" documents the correct pattern).

The session-10 run worked because at that time there was no pre-paint
boot script and no per-load auth correction — the forced class survived
full loads. The S11 lifecycle (a genuine improvement for the app) silently
invalidated the probe's forcing mechanism, and no assertion existed to
catch it: the script trusted its own side effect, the exact lesson class
as AP-69 (the boot guard: "validated once, silently degraded later") and
AP-70 (the zombie dev server: "a stale mechanism that still runs, wrongly").

### The semantics (tight scope, resolved by design)

- **The mode is set through the REAL application path** — the settings API
  (`PATCH /api/settings/preferences { themeMode: "dark" }`), exactly the
  convention `scripts/accent-dark-sweep.mjs` and
  `scripts/capture-studyflow.mjs` already use. This forces the same
  server-persisted → boot-cache → pre-paint → auth-confirmed chain a real
  dark-mode user rides, so the probe can never diverge from the
  production theme lifecycle again.
- **The precondition is SELF-VERIFIED and FAILS LOUDLY.** After the PATCH,
  the script waits for `document.documentElement.classList.contains
  ("dark")` (polled, not a fixed sleep). If the dark class is not present
  at sweep time the script prints an explicit
  `DARK-SWEEP PRECONDITION FAILED` line to stderr, exits **non-zero**
  (`process.exit(1)`), and emits no per-view JSON — a probe that cannot
  verify its own mode must never emit findings that look like findings
  (the AP-69 fail-fast posture applied to tooling).
- **The applied mode rides the structured output.** The output JSON gains a
  `mode: "dark"` field (and the console `MODE:` line stays for humans), so
  every saved artifact is self-describing — a future reader can tell at a
  glance which mode produced the findings.
- **No state is left mutated.** The sweep restores the demo user's
  preference to `light` at the end (the capture-script convention — the
  PATCH is awaited; ending right after the last probe could abort the
  in-flight request and persist dark, poisoning later light-mode pins).
- **The detectors are UNTOUCHED.** The flashbulb/unreadable CHECKER probe
  and its thresholds (lum > 0.80 / contrast < 2.2) are the session-10
  contract, byte-identical — only the mode-forcing block and the output
  envelope change. Zero app-code changes, zero new CSS, zero Tailwind v4
  surface, zero parity-pinned bytes touched.

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase.
   This session touches NO app code at all.
2. **The accent-dark-sweep residual LOWCONTRAST hits** — the S11 verified
   non-gap family (accent CTA faces, adjacent-month dimming, subject
   class-card colors, muted type pills). They sit ABOVE the dark-sweep
   unreadable bar (< 2.2); fixing them would break byte-parity on
   reference-measured surfaces.
3. **The light-mode "unreadable" surfaces the broken run surfaced** (the
   amber `medium` pill 1.85, the Calendar slate-300 adjacent days 1.48) —
   both reference-measured (documented in `calendar-view.tsx`'s S6-G
   comment and the S8 dashboard measurement); parity-preserved by design.
4. **The Events view's `sr-only` date input** (forced-colors sweep hit) —
   deliberately `aria-hidden` + `tabIndex=-1`; a programmatic trigger,
   never keyboard-reachable.
5. **The dev-mode NEXTJS-PORTAL focus anomalies** — a dev-tools artifact;
   the production build has no portal (validated in S12 against the
   standalone build).
6. **No unit pins for the probe scripts** — browser-context probes need a
   live server; the repo's convention is execution-validated evidence
   (the drawer-check/capture-script pattern). The app seams they cover are
   already unit/e2e-pinned elsewhere (the theme lifecycle by
   `tests/theme.test.ts` + `tests/e2e/theme-system.spec.ts`).

---

## Families and fixes

### S27-A (HIGH) — the repair (`scripts/dark-sweep.mjs`)

Replace the mode-forcing block (lines ~93–99) with the API-driven,
self-verifying pattern:

1. After the login `waitForURL`, `PATCH /api/settings/preferences` with
   `{ themeMode: "dark" }` via `page.request` (the storageState cookie
   rides the request context — the accent-dark-sweep pattern); a
   non-2xx response is a precondition failure.
2. `page.goto(BASE + "/Dashboard")` then poll
   `waitForFunction(() => document.documentElement.classList.contains
   ("dark"))` — the class is applied by the real lifecycle (pre-paint
   cache, auth-confirmed), never by the probe.
3. If the wait fails: print `DARK-SWEEP PRECONDITION FAILED: the dark
   class never applied — the sweep refuses to measure the wrong mode
   (see AGENTS.md dark-sweep entry)` to stderr and `process.exit(1)`
   with no per-view JSON.
4. Read the applied mode once (`document.documentElement.className`) and
   emit it as the structured `mode` field + the human `MODE:` line.
5. After the 20-view sweep, `PATCH` `themeMode: "light"` back, await the
   response, and verify the dark class is gone (leave-no-state guard).

### S27-B (MEDIUM) — docs alignment

- **AGENTS.md** — the dark-sweep command-table entry gains the
  self-verifying precondition + the API pattern note (one line, matching
  the accent-dark-sweep entry's style).
- **README.md** — the audit-tools row updated the same way; the Project
  Status table gains the session-27 row; the captures line gains the
  S27 evidence set.
- **Project_Architecture_Document.md** — **ADR-025** (the self-verifying
  audit-tool precondition: a probe must assert its own precondition and
  fail loudly rather than silently measure the wrong state; the S11
  lifecycle invalidated the forced-class approach — the API path is the
  only forcing mechanism that rides the production chain).
- **omni-study_SKILL.md** — **AP-72** (the tooling-rot lesson: audit tools
  validated once can silently rot under later app changes; self-assert
  the precondition, set state through the real application path, never a
  parallel side-channel).
- **CLAUDE.md** — the commands section note where the audit tools are
  listed (matching AGENTS.md).

## TDD order

Probe scripts are execution-validated (the repo's drawer-check/capture
convention) — the RED/GREEN cycle rides the script's own output:

1. **RED (observed, captured):** run the current script → `MODE:` empty,
   flashbulb=97 + unreadable=7 across 20 views measured in LIGHT mode
   (saved as the before-state evidence; `/tmp/dark-sweep-before.json`).
2. **GREEN (target):** apply S27-A → re-run → `mode: "dark"`, the human
   `MODE: dark`, and flashbulb=0 + unreadable=0 across all 20 views in
   REAL dark mode (the session-10 post-fix state, consistent with the
   S11 non-gap family sitting above the 2.2 bar and the e2e dark pins
   passing in the full 549 regression).
3. **The negative control:** the precondition guard is validated by
   construction — the RED run already demonstrates the failure mode the
   guard now makes loud (empty MODE → non-zero exit). A scratch probe of
   the guard's exit path (PROMPT-fail injection) confirms exit code 1 +
   the stderr line, then is discarded.
4. **Full gates re-run:** lint → typecheck → 258 unit → build → cold-db
   291 e2e (the script change touches no app code; the regression
   re-confirms nothing else moved).
5. **Standing checks re-run:** the drawer check GREEN post-change; the
   demo user left light-preferring (the restore guard verified).

## Risks

- **The PATCH could fail silently** (network, auth) → guarded: non-2xx is
  a precondition failure with the loud exit.
- **The dark class might take >1 poll cycle** (the S16 lesson: gate on
  the observable end state, never a fixed sleep) → `waitForFunction`
  with the default 30 s budget.
- **The restore PATCH could be aborted** if the script exits early → the
  restore runs in a `finally` and is awaited (the theme-spec lesson:
  ending right after a click can abort the in-flight request and poison
  every later light pin).
- **Stale dev-server state** (the AP-70 zombie) → the dev server is
  restarted cleanly by PID before the evidence captures, and the port is
  verified down first.
- **No parity surface is touched** — the change is a probe script only;
  the 291 e2e pins and every byte-parity pin are untouched by
  construction (verified in the gates re-run).

## Execution log (session-52 workspace run)

- Baseline on arrival: the documented 549-green state re-confirmed (lint ✓
  tsc ✓ 258 unit ✓ build ✓ cold-`db/e2e.db` 291 e2e ✓ 4.4 min); the
  standing checks FIRST, all GREEN (the drawer probe on both apps + the
  live agent-browser 390×844 walkthrough — app bar, drawer dialog with 20
  links, Settings navigation, the S26 Email card on the Profile tab, no
  overflow; the reference re-sweep UNCHANGED since S19–S26 — dashboard,
  five-tab Settings, the 20-view copy sweep at 14/20 MATCH with 6
  data-state non-gaps; the clone Settings parity ✓; the S26 code audited
  line-by-line CLEAN; scandihaven unchanged since 10-04; Docker
  unavailable — the documented owner's step).
- The production-readiness sweep (the S22/S24 pattern): security ✓,
  settings-roundtrip ✓, connectivity ✓, upload-edge ✓, data-volume ✓
  (0 findings, 750 probe rows cleaned), forced-colors ✓ (1 hit = the
  Events view's deliberately hidden `aria-hidden` `sr-only` date trigger
  — a non-gap), print ✓, focus-order ✓ (dev-mode NEXTJS-PORTAL anomalies
  only), CWV ✓ (CLS 0.00 everywhere; throttled-mobile dashboard LCP NI —
  the documented S16 state; the reference's own mobile login POOR 7.4 s),
  accent-dark-sweep ✓ (the residual LOWCONTRAST hits = the documented S11
  verified non-gap family — accent CTA faces, adjacent-month dimming,
  subject class-card colors, muted type pills).
- **The finding**: `dark-sweep.mjs` run three times — consistently `MODE:`
  empty, 97 flashbulbs + 7 unreadable, all in LIGHT mode (the 7 "unreadable"
  entries characterized: the amber `medium` pill 1.85 + the Calendar
  adjacent-month slate-300 days 1.48 — both reference-measured, documented
  in the `calendar-view.tsx` S6-G comment and the S8 dashboard measurement).
  Root cause verified: the stale `sf-theme-mode` key (grep: read by
  NOTHING — the real cache key is `sf-theme` in `src/lib/theme.ts`) + the
  auth-correction window (the demo user's stored `themeMode` is `light`,
  verified via Prisma).
- **TDD RED** (captured): `/tmp/dark-sweep-before.json` — MODE empty,
  flashbulb=97 unreadable=7 across 20 views in light mode.
- **The fix applied** (`scripts/dark-sweep.mjs` only): the API-driven
  mode-forcing block (PATCH → polled `waitForFunction(dark)` → the
  self-verifying mode read), the loud-failure guards on all three
  precondition paths (PATCH non-2xx / wait timeout / final mode read),
  the `{ mode, views }` output envelope, and the awaited light-restore
  before close. The CHECKER probe and thresholds byte-identical; zero
  app code touched.
- **TDD GREEN** (captured): `MODE: dark` + `mode: "dark"`, flashbulb=0
  unreadable=0 across all 20 views in REAL dark mode — the session-10
  post-fix state, consistent with the S11 non-gap family (2.15–3.07)
  sitting above the <2.2 bar and the e2e dark pins passing in the 549
  regression. The demo user's preference verified restored to light via
  Prisma post-sweep.
- **The negative control**: a scratch copy (never-true `waitForFunction`
  injection, deleted after) → exit 1, the `DARK-SWEEP PRECONDITION
  FAILED` stderr line, EMPTY stdout (no findings emitted). The guard's
  exit path validated.
- **Gates re-run**: lint ✓ tsc ✓ 258 unit ✓ build ✓ cold-db 291 e2e ✓
  (4.8 min) — 549 green, the 291 prior pins untouched (no app code
  touched, verified by construction).
- **Standing checks re-run post-change**: the drawer check GREEN; the
  dev server restarted cleanly by PID first (the AP-70 lesson) before
  the captures; the standing 31 screenshots refreshed via
  `capture-studyflow.mjs` (24 light + 7 dark; theme restored light);
  the per-session evidence pairs byte-identical (no restoration needed —
  the S26 lesson checked).
- Evidence: `docs/screenshots/s27-dark-sweep-evidence.json` (the
  before-state with the per-view false-positive table + the false-unreadable
  entries; the after-state; the guard probe; the restore proof; the
  gates; the walkthrough summary).
- Docs aligned: AGENTS.md (the dark-sweep entry — the self-verifying
  precondition + the API pattern), README.md (the session-27 status row +
  the captures line), PAD (ADR-025 with the alternatives-rejected table),
  SKILL.md (AP-72), CLAUDE.md (the audit-tools-self-verify principle).
  `.env.example` audited — matches the codebase (db-path/site/env-check
  contracts), already tracked in git.

