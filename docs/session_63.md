# Session 63 — The S31 transcript (follows the push)

The workspace was already in place from the S30 run (pulled
`b7cd043..739b082` — the session_61 transcript added on the remote). The
task plan set, then the core docs read in bounded chunks (AGENTS through
the S30 commands + the S9 quirks, CLAUDE through the S30 seam, README
through the session-30 status row, PAD through §8.1's S30 rows, SKILL
through AP-75) — every current-state claim re-verified against the
codebase on arrival (24 models, the 564-green documentation, the S30
dep-audit seam + runner + 15 pins in place, the `.env` / `db/`-at-root
contract with `.env.example` git-tracked, the vitest 18-file / playwright
27-spec configs; skills/ excluded from checking/testing per the brief).

Session docs next: session_60, session_61, remediation-plan-session30,
the worklog S30 entry. This workspace run = session 62 by the
file-counter convention (files 1–61 exist).

Environment verified. Baseline gates: lint ✓ tsc ✓ 273 unit ✓ build ✓,
then the cold-db e2e regression.

**Baseline 564-green re-confirmed** (291 e2e, 4.5 min, cold db). Standing
checks FIRST — the dev server started via the subshell double-fork
detachment (the first attempt died with the shell session — the prior
sessions' daemon lesson), then the drawer probe, then the live
agent-browser walkthrough.

**DRAWER CHECK: GREEN** — backdrop oklab+blur(4px), 288px panel, 20
links, no footer, Escape-close. Now the live 390×844 walkthrough: signed
in at /Dashboard; the drawer opened with all 20 links; Settings
navigated by ref; the Profile tab showed the S26 Email address card
above the S24 Change password + S25 Danger zone cards; scrollWidth 390.

**Mobile navigation menu working as expected.**

Reference re-sweep (a separate agent-browser session to preserve local
state): the login title reads "AcademiaFlow (Copy)" (the documented
platform-rename artifact); the dashboard is the documented zero-data
state (0/0, greeting from the email prefix, "Saturday, October 10,
2026"); the drawer carries the same 20 links in the same order (the href
ground truth); the Settings tabs are the same five with School/Grade/
Goal on Profile.

**Reference re-sweep: UNCHANGED since S19–S30.** The 20-view copy sweep
(against the :3200 standalone): 14/20 MATCH, the 6 diffs all data-state
non-gaps (the documented S17-pinned family).

Governing decision: both backlogs empty + the standing superset goal →
the production-readiness sweep. Security first (single run — the S29
double-run lesson): the first parse exposed the session's own double-run
artifact (the AI-limiter budget already spent by my own first run) —
resolved by the clean dev-server restart, and the single re-run:
**security ✓ (0 findings, 7 nonGaps — the documented limiter shape)**.
Settings-roundtrip ✓.

Then connectivity — and the genuine finding surfaced. The audit failed
with an OPAQUE 30 s `page.click` timeout on the disabled login submit
button ("element was detached from the DOM, retrying" + repeated
same-URL navigations in the log). A first hypothesis — a cold-route
hydration race — was disproven by warming `/login` (HTTP 200 in 29 ms)
and re-running: the same timeout. The dedicated diagnostic probe
(framenavigated recording + hydration observation over a 15 s window)
captured the true state: **/login in a sustained full-page reload loop**
— 17+ main-frame navigations per 15 s, React never hydrated, the fills
discarded on every reload. The daemon had just been restarted cleanly
(the S9 lesson's remedy was in effect) and the loop persisted: the S9
remedy is INSUFFICIENT for this variant. The differential proof:
`rm -rf .next/dev` (the 282 MB Turbopack incremental cache) + restart →
healthy (the button enables after fill; the click lands on /Dashboard).
A control unclean-kill + restart WITHOUT the cache clear did NOT
re-trigger the loop — the corruption is non-deterministic (a kill
mid-cache-write), which makes the loud standing probe MORE valuable, not
less. Throughout the loop, `/api/health` answered 200: liveness ≠
stability ≠ hydration.

After the cache clear, the suite resumed and ran **all GREEN with zero
code findings**: connectivity ✓ (the S28 repair validated live),
upload-edge ✓, data-volume ✓, forced-colors ✓, print ✓, focus-order ✓,
dark-sweep ✓ (the S27 repair validated live: MODE dark, 0 findings),
accent-dark-sweep ✓ (0 fails), CWV ✓ (0 findings; CLS GOOD everywhere;
the reference's own mobile login LCP POOR), ai-error ✓ (0), ai-a11y ✓
(0), pre15-preflight ✓ ("deps pinned by design, client bundle lean, no
action"), and dep-audit ✓ (GREEN — the S30 probe's first standing
re-run: 2 advisories documented non-production, 0 runtime-reachable).
Demo theme restored + verified (light/violet via Prisma).

Plan saved to docs/remediation-plan-session31.md and validated against
the codebase before execution: no name collisions; the vitest include
covers `tests/**/*.test.ts`; login-card.tsx:497's
`disabled={busy || !email || !password}` confirmed as the hydration
signal; the preflight design fills but never submits (zero login
requests, zero rate-limit budget).

TDD RED: tests/dev-preflight.test.ts written first — 11 pins (the four
verdicts; the NAV_LOOP_THRESHOLD boundary; loop-beats-no-hydration;
loop-beats-mid-window-hydration; unreachable-beats-all; the
honest-remedy guards — the loop remedy names `.next/dev`, the
unreachable remedy names `bun run dev` and NOT the cache clear). Run
fails (module not found).

TDD GREEN: src/lib/dev-preflight.ts implemented —
`classifyBootStability` + `NAV_LOOP_THRESHOLD` (5 — healthy 0–1
post-load navs vs the captured loop's ~1/s sustained). 11/11; the full
unit layer: **284 passed (19 files)**.

The runner scripts/dev-server-preflight.mjs (bun-run — the
dep-audit.mjs precedent; the 8 s post-load navigation window; the
fill-and-enable hydration signal; the self-describing JSON envelope).
Genuine run against the healthy dev server: **GREEN, exit 0** (1 benign
nav — an HMR settle — well under the threshold; hydrated true).

Negative controls (validated, scratch server deleted after): (a) the
dead port (`PREFLIGHT_BASE=http://localhost:3999`) → **exit 1, verdict
`unreachable`**, remedy names `bun run dev` and NOT the cache clear; (b)
the scratch self-reloading login-shaped page on :3998 (email + password
inputs, a never-enabling disabled submit, a 400 ms `location.reload()`
loop — the captured failure state faithfully modeled) → **exit 1,
verdict `reload-loop`** (19 navs in the window, hydrated false), remedy
names `rm -rf .next/dev`; (c) the genuine healthy dev server → **exit
0, verdict `green`**.

Gates re-run: lint ✓ tsc ✓ 284 unit ✓ (19 files) build ✓ **cold-db 291
e2e ✓ (4.5 min) = 575 green** (was 564; +11 unit pins; the 291 prior
pins untouched by construction — zero app code, zero CSS, zero Tailwind
v4 surface, zero parity-pinned bytes).

Standing checks re-run post-change: the drawer check GREEN; the standing
31 screenshots refreshed via capture-studyflow.mjs (29 byte-changed —
the S29/S30 pattern; theme restored light, verified via Prisma:
light/violet); the S31 evidence JSON captured
(docs/screenshots/s31-dev-preflight-evidence.json — the captured
reload-loop state, the differential proof, the non-determinism control,
the negative controls, the gates, the standing checks).

Docs aligned (the AP-74 guard applied to this change — grep every doc
layer for the quantities): AGENTS.md (the `bun scripts/
dev-server-preflight.mjs` command entry + the 284-test line + the
S9-lesson extension — a daemon restart alone does NOT clear the
reload-loop variant), vitest.config.ts (19 files / 284 tests + the
seam), CLAUDE.md (the unit-layer 284 line + the S31 seam description +
the preflight-first debugging note), PAD §8.1 (the dev-preflight row +
the Total row: 47 files / 575 tests / 284 unit / 19 unit files),
README.md (the 575 badge + the 284 hierarchy/§Testing lines + the S31
seam + the session-31 status row), SKILL.md (the 575/284 counts ×2 +
**AP-76** — the environment-precondition lesson). The docs-form GREEN
re-grep returns zero stale counts in the living layers; the remaining
273/564 mentions are the per-session history rows and ADR records
(correctly untouched — the S29 convention).

Worklog entry + the session_62 narrative written. The change set
reviewed (42 files: the seam + the tests + the runner + the plan + the
evidence + the refreshed 31 + seven doc layers + the worklog + the
narrative; package.json / bun.lock / prisma verified untouched — the
S30 lesson). Commit `79845cc` created.

Push environment: the Appendix-A shim at /home/z/my-project/bin/ssh,
paramiko 5.0.0, the operator key materialized (0600, fingerprint
SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — the same key as
S28/S29/S30). Dry-run passed with the explicit
`--remote git@github.com:nordeim/omni-study.git` (the wrapper's default
remote is the wrong repo — the session-55 lesson). Real push now.

**PUSH CONFIRMED: remote main @ 79845cc == local HEAD.** Operator key
shredded after. Writing the session transcript (this file), then the
final session-log commit + push.

## Session Complete ✅

**S31 shipped and pushed to `main` @ `79845cc`** (remote verified via the
SSH wrapper, key shredded after) — **575 tests green** (284 unit + 291
e2e cold-db; zero app code touched — one new pure seam, one new test
file, one new standing script, doc alignment).

**What I did:**
1. **Validated the current status** — pulled to `739b082`, reviewed all
   docs (core + session_60/61 + the S30 plan + the worklog), baseline
   **564-green re-confirmed**, and the full standing-audit suite (incl.
   the S30 dep-audit's first standing re-run) ran **ALL GREEN with zero
   code findings**. The **mobile navigation menu is working as
   expected** (drawer probe + live 390×844 agent-browser walkthrough),
   and the **reference site re-swept UNCHANGED** since S19–S30.
2. **Found and closed the un-verified environment precondition** — a
   stale Turbopack `.next/dev` cache put `/login` into a reload loop
   (17+ navs/15 s, React never hydrated) that **survived a clean daemon
   restart** while `/api/health` stayed 200; the audits failed OPAQUELY
   (a click timeout naming the disabled button, not the cache). Built
   the standing **`bun scripts/dev-server-preflight.mjs`** probe:
   measures navigation stability + hydration (never submits — zero auth
   budget), classifies through the unit-pinned seam, names the exact
   class-specific remedy on every failure class (`rm -rf .next/dev` for
   the loop; `bun run dev` for a dead server; the staged retry/restart/
   cache-clear for no-hydration).
3. **TDD throughout** — 11 new unit pins, negative controls validated
   (dead port / scratch reload-loop server / genuine healthy), full
   regression **575 green**, the standing 31 screenshots refreshed,
   every doc layer re-aligned with **AP-76** recording the lesson.

**Suggested next steps:** the remaining open item stays the first real
`docker compose --profile init up` on your Docker host; when upstream
patches land (braces > 3.0.3, Prisma widening its deepmerge-ts pin),
`bun update && bun run build && bun scripts/dep-audit.mjs` will show
them cleared; the scheduled-backups / secret-scan-gate ADR rejections
remain revisitable on request.
