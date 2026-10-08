# Remediation Plan — Session 16 (S16): CWV/performance audit + auth-screen mobile geometry + fresh copy sweep

**Audit surfaces (from `docs/session_22.md`'s suggested next batch):** (a) a
Lighthouse/CWV pass over both themes — the pre-1.0 preflight covered bundle
size and long tasks but no CWV scores existed; (b) the auth sub-screens'
mobile geometry (S15 measured and built them at desktop only); (c) a fresh
copy sweep of the twenty views against the live reference (the last full
copy pass was session-9). The standing mobile-drawer check ran first (GREEN
— unchanged from S14/S15).

**Method.** Lighthouse-class synthetic measurement WITHOUT the Lighthouse
dependency (the repo pins deps by design): buffered `PerformanceObserver`
entries (LCP/CLS/FCP — the same APIs Lighthouse itself reads), Navigation
Timing TTFB, `longtask` observer, CDP throttling (4× CPU + 150 ms RTT /
1.6 Mbps — the Lighthouse mobile preset, cache disabled), mobile 390×844
and desktop 1280×800, light and dark. All measurements on the production
standalone build (`:3200` — never `:3100`, the Playwright webServer owns
it). The reference app measured with the same instrumentation for the
parity comparison. Committed tools:
`scripts/cwv-audit-s16.mjs` (the CWV matrix), `scripts/cls-source-probe-s16.mjs`
(shift attribution), `scripts/mobile-auth-geo-probe-s16.mjs` (both apps'
auth sub-screens at 390×844), `scripts/copy-sweep-s16.mjs` (the 20-view
copy diff).

---

## Evidence (measured, both apps)

### A. CWV matrix (medians; CWV good = LCP ≤ 2500 ms, CLS ≤ 0.1)

| Scenario | Clone | Reference | Verdict |
|---|---|---|---|
| login mobile throttled | LCP 632–648 ms · CLS 0 | LCP 7596–7668 ms · CLS 0 | clone GOOD / ref POOR (12× faster) |
| login desktop | LCP 128–180 ms · CLS 0 | LCP 1916–3856 ms · CLS 0 | clone GOOD |
| dashboard mobile throttled (L+D) | LCP 2308–2352 ms · **CLS 0.117** | (ref measurement unstable — platform bootstrap abort) | LCP GOOD · **CLS NEEDS-IMPROVEMENT** |
| dashboard desktop (L+D) | LCP 336–416 ms · **CLS 0.125** | LCP 1104–1136 ms · CLS 0.088 | **CLS NI vs ref GOOD** |
| nav-switch INP proxy (4× CPU) | 195–473 ms synthetic (real unthrottled 30–60 ms, S13-verified) | — | acceptable |
| transferred JS | login 179 KB / app 283 KB | 634–1087 KB | clone 2–4× leaner |

### B. CLS source attribution (`cls-source-probe-s16.mjs`)

ONE shift entry at t≈152–210 ms (unthrottled), value 0.117–0.125, sources
= the stats grid + the `lg:grid-cols-3` sections grid. Mechanism: the
shell flips from `Splash` to the app on `/api/auth/me` with an EMPTY data
store; the dashboard's five parallel fetches then land, the conditional
overdue banner (S9-A) inserts above the stats grid, and the sections grow
from slim-empty to populated — everything below shifts. The reference
gates its first paint on data (its desktop CLS is 0.088, inside GOOD).

### C. Auth sub-screen mobile geometry (390×844, both apps)

| Element | Clone | Reference | Verdict |
|---|---|---|---|
| any screen horizontal overflow | 0 px | 0 px | parity ✓ |
| card width / x | 358 px @ x16 | 358 px @ x16 | parity ✓ |
| OTP boxes | 6 × 40×44 | 6 × 40×44 | parity ✓ |
| sub-screen inputs | 40 px (h-10) | 40 px | parity ✓ |
| sub-screen submits | 40 px | 40 px | parity ✓ |
| Google button | 54 px | 54 px | parity ✓ |
| **Sign in button** | **48 px** | **44 px** (`h-11 sm:h-12`) | **GAP — mobile only** |
| **sub-screen h2 font** | **24 px** | **20 px** (`text-xl sm:text-2xl`) | **GAP — mobile only** |
| **verify Back→h2 (bottom→top)** | **88 px** | **76 px** (circle `mb-3 sm:mb-4`, h2 `mt-2 sm:mt-4`-family) | **GAP — mobile only** |
| **forgot Back→h2 (top→top)** | **36 px** | **28 px** (h2 `mt-2 sm:mt-4`-family) | **GAP — mobile only** |

### D. Copy sweep (20 views, fresh reference sweep, logged in)

**20/20 substance parity.** Direct text matches on 14; the dashboard copy
re-verified by targeted probe (greeting pattern, date line, "Start My
Day", "View All", section h2s all match). The sweep's five flagged rows
were data-state (task/exam counts differ between accounts) or DOM-tag
differences (the reference's Tasks-aside rows are `<button>`s where the
clone's are list rows — visually identical; "Add Your First Task" exists
in the clone's MyDay empty state, line 296 of myday-view; "All Tasks" is
the clone's aside row, line 211 of tasks-view). The reference account now
holds a demo deck ("Audit Biology Deck") — data, not chrome.

### Non-gaps (documented, do not fix)

1. **Eager view bundle (no code-splitting):** all 20 views statically
   imported → 283 KB app JS. Every clone surface still lands in the LCP
   GOOD band while the reference's own eager platform bundle (634–1087 KB)
   measures POOR on throttled mobile (7.6 s LCP). Splitting would add
   first-switch chunk flashes and risk 241 passing e2e pins for an
   already-2–4×-leaner app. **Deliberate non-gap** — revisit only if a
   real-user CWV regression appears.
2. **INP:** 195–473 ms only under the 4×-CPU synthetic; the S13
   data-volume audit measured 30–60 ms real interaction latency.
3. Copy/labels/overflow/OTP/inputs/buttons: parity (table C).
4. The reference's own dashboard CLS is 0.088 (GOOD band) — the standard
   to meet is ≤ 0.1, not 0.
5. `ref-dashboard-mobile` CWV measurement is unstable (the Base44
   bootstrap aborts the first navigation under throttle) — the desktop
   reference numbers stand as the comparison baseline.

---

## Families and fixes

### S16-A (HIGH) — Dashboard load CLS 0.117–0.125 (NI band; reference 0.088 GOOD)

**Fix: parallel data pre-warm before the shell flips.** The auth effect in
`src/app/page.tsx` currently awaits `/api/auth/me` and flips
`status→authed` with an empty data store. New: a per-view initial-
collections seam (`src/lib/view-collections.ts`,
`INITIAL_COLLECTIONS: Record<ViewId, CollectionKey[]>` — the same sets the
views themselves fetch, centralized) drives `useDataStore.getState().loadAll(...)`
fired IN PARALLEL with the auth call (the cookie already exists; the data
calls need no auth result); the shell flips only after both resolve. The
`Splash → shell` replacement is shift-free (replacements are not moves);
with data pre-loaded the dashboard's first render IS the final geometry —
the conditional banner and populated sections never re-layout. The views'
own `loadAll` effects short-circuit (`status` already `loading/ready`) —
no double fetch. Views with no collections (calculator/mathsolver/
aiassistant) declare `[]` and wait on auth alone.

**Trade-off (deliberate):** the Splash holds for the data-fetch tail
(~200 ms on the throttled profile — measured: the five collections are
~16 KB). Measured post-fix LCP stays inside GOOD (the data fetch shares
the auth round-trip window; it is not additive). This mirrors the
reference's own gated first paint. Failure of a pre-warm fetch never
blocks the app: `loadAll` failures set `status:error`, the shell still
flips (auth resolved), and the views' own effects retry — the pre-warm
only ever HELDS the Splash, it cannot brick it (guarded with
`.catch(() => {})` on the await).

**Guard:** an e2e CLS pin — cold `/Dashboard` load instrumented with the
same buffered layout-shift observer, asserting total CLS ≤ 0.02.

### S16-B (MEDIUM, mobile-only) — sub-screen h2 24 px vs reference 20 px at <sm

`text-2xl` → `text-xl sm:text-2xl` on the five sub-screen h2s (signup,
verify, forgot, check-email, reset) in `login-card.tsx`. Desktop renders
24 px unchanged — every S15 desktop pin passes byte-identically.

### S16-C (MEDIUM, mobile-only) — Sign in button 48 px vs reference 44 px at <sm

`h-12` → `h-11 sm:h-12` on the signin submit (the reference's measured
responsive pattern; its class string contains both `h-11` and `h-12`).
Desktop 48 px unchanged (the session-4 pin). Sub-screen submits are
already 40 px parity — untouched.

### S16-D (LOW, mobile-only) — verify/forgot Back→h2 spacing drift (12/8 px)

Verify: circle `mx-auto mt-4 mb-4` → `mx-auto mb-3 sm:mb-4` and the h2
gains `mt-2 sm:mt-4` (mobile bottom→top 88 → 76 px = the reference's
measured value; desktop 96 px preserved). Forgot: h2 `mt-4` → `mt-2
sm:mt-4` (mobile top→top 36 → 28 px; desktop 16 px preserved). The
check-email envelope circle takes the same family classes for
consistency. Signup's gap already measures 28 px parity on both —
untouched.

---

## TDD order

1. **RED unit** — `tests/view-collections.test.ts`: the seam exists;
   every NAV view id has an entry; every entry key is a valid
   CollectionKey; dashboard's set = [tasks, assignments, exams,
   focusSessions, subjects]; the three no-data views declare `[]`.
   (Import fails pre-fix → RED.)
2. **RED e2e** — `tests/e2e/s16-perf-parity.spec.ts`:
   - mobile auth geometry (390×844, one registration, reusing the auth
     flow): signup h2 font 20 px; Sign in button 44 px; verify
     Back→h2 76 px; forgot Back→h2 28 px. All four fail pre-fix
     (24/48/88/36).
   - dashboard CLS guard: buffered layout-shift observer on a cold
     /Dashboard load (fresh context, no throttle), total CLS ≤ 0.02.
     Fails pre-fix (0.117+).
3. **GREEN** — the seam + the page.tsx pre-warm (auth+data parallel,
   `useAppStore.getState().view` read AFTER `hydrate()` — no stale
   closure) + the four responsive class fixes in login-card.tsx.
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** `cwv-audit-s16.mjs` (CLS ≤ 0.02
   everywhere; LCP still GOOD), `mobile-auth-geo-probe-s16.mjs`
   (mobile parity table green), `copy-sweep-s16.mjs` (still 20/20),
   `drawer-check-s14.mjs` (standing priority).
6. Evidence captures (`scripts/capture-s16-evidence.mjs`): the CLS
   before/after JSON, the auth sub-screens at mobile, VLM spot-checks.
7. Docs: README (badge/counts/CWV row), AGENTS (commands + the
   load-stability contract), CLAUDE (contract + counts), PAD (ADR-014 +
   distribution), SKILL (AP-62..63: the pre-warm pattern + the
   "responsive-class mobile audit" lesson), this plan's execution log,
   `worklog.md`, session narrative.

## Risks

- **Rate limiter:** the new mobile-geometry spec registers ONE account
  (the flow walks signup→verify→forgot in a single context); total real
  registrations per e2e run stay ≪ 10.
- **The pre-warm must not regress view-switch tests:** the views' own
  loadAll effects run unchanged; the spec-level `hydrated()` gates are
  unaffected (the Splash simply resolves later — every existing wait
  already gates on `main`/h1, not on Splash disappearance).
- **Dark-mode pre-warm:** theme applies from `/api/auth/me` →
  `loadFromUser(user)` BEFORE the shell flips (unchanged order — the
  pre-paint boot script + this ordering are what keep dark LCP clean).
- **CLS pin flake margin:** asserted at ≤ 0.02 (not 0) — the live clock
  sits in a fixed app bar (out of flow) and the greeting uses a stable
  text line; 0.02 headroom absorbs engine noise.

---

## Execution log (post-completion)

**TDD observed.** RED: `tests/view-collections.test.ts` failed on the
missing module (import error — the seam absent); the three designed e2e
failures observed exactly as measured — Sign in 48px (expected 44), the
mobile journey failed at the signup h2 (24px vs 20px), and the CLS guard
read **0.122** (the audit's own number). GREEN: the seam
(`src/lib/view-collections.ts`) + the page.tsx parallel pre-warm + the
four login-card responsive fixes.

**One honest iteration during GREEN.** The verify-screen spacing first
shipped as circle `mb-3 sm:mb-4` + h2 `mt-2 sm:mt-4` — the spec measured
68px, not 76: the circle's margin-bottom and the h2's margin-top COLLAPSE
as adjacent block siblings (max, not sum). The reference avoids the
collapse structurally (its h2 sits inside a wrapper div). The landed fix
puts the whole rhythm on the circle — `mb-5 sm:mb-8` (20px/32px: 56+20 =
76 mobile, 64+32 = 96 desktop) with a margin-less h2. A pt-based variant
was tried first and rejected: padding moves the TEXT but not the box top
the measurement reads.

**Gates.** lint ✓ · tsc ✓ · **154 unit ✓** (149 + 5 new) · build ✓ ·
**244 e2e ✓** (cold `db/e2e.db`, 3.7 min) = **398 tests green** — the 241
prior pins untouched (all four fixes are mobile-only responsive-class
changes; every ≥sm value is byte-identical, which is exactly why the
desktop pins kept passing without edits).

**Verification re-runs (all GREEN).**
`cwv-audit-s16.mjs`: dashboard CLS **0.00** on all four scenarios
(mobile/desktop × light/dark — was 0.117–0.125); mobile-throttled LCP
2428 ms (was 2308 — the data-fetch tail riding the auth window, still
GOOD); desktop LCP 368–376 ms. **Bonus measurement:** the reference's own
mobile dashboard finally captured (the retry logic landed it): LCP
4404 ms (POOR) · **CLS 0.372 (POOR)** — the reference's mobile dashboard
is the worst CWV performer of the whole matrix; the clone now leads every
axis. `mobile-auth-geo-probe-s16.mjs`: the full mobile table green
(Sign in 44px, sub-screen h2 20px, overflowX 0 everywhere).
`copy-sweep-s16.mjs`: 14/20 direct + 6 data-state rows = 20/20 substance
(after hardening the sweep's login gate — the reference's login page
itself renders a `<main>`, so the old wait resolved pre-auth).
`drawer-check-s14.mjs`: GREEN (the standing priority). INP proxy on the
fixed build: 233–366 ms under the 4× CPU synthetic (was 392 median).

**Site drift observed mid-session (documented, deliberately not
chased).** The reference's login page rebranded to **"AcademiaFlow
(Copy)"** (document title + login h1) between the first and second sweeps
— while its own sidebar still reads "StudyFlow" and its account data
mutates (the demo deck appeared, then disappeared). The owner is actively
experimenting with the template; the clone keeps the StudyFlow identity
(repo-wide brand + the reference's own in-app brand) and records the
drift here. Revisit if the reference's branding stabilizes.

**Evidence.** 6 mobile captures via `scripts/capture-s16-evidence.mjs`
(signin/signup/verify/forgot/check-email + the dashboard at 390×844) —
VLM spot-check 5/6 PASS; the dashboard capture's FAIL was a VLM mis-read
of the glass app bar (DOM probe: banner exists, fixed, "StudyFlow · live
clock" — the standing mobile-navigation e2e pin is the real authority and
passed). Committed audit tools: `cwv-audit-s16.mjs`,
`cls-source-probe-s16.mjs`, `mobile-auth-geo-probe-s16.mjs`,
`copy-sweep-s16.mjs`, `capture-s16-evidence.mjs`, `vlm-verify-s16.mjs`;
the five throwaway diagnostic probes deleted per the S9 precedent.

**Docs aligned.** README (badge 398, the Performance row, counts 154/244,
the plan entry + captures line), AGENTS.md (6 new commands + the
LOAD-STABILITY contract + the S16 testing quirk), CLAUDE.md (the contract
+ counts), PAD (ADR-014 + distribution), SKILL.md (AP-62..63 + counts).
`.env.example` audited — matches `.env`, no changes (no new env vars).
