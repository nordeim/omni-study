# Session 54 — the S28 session log

I'll continue the task from where the previous session left off. The
workspace still had the repo (not reset this time), so it was refreshed
with `git pull` to `270a898` (the S27 push `45d5eb0` + the session-log
update `270a898`). Dependencies verified installed; the schema re-pushed
+ re-seeded (`db/custom.db` had gone stale in the workspace — the demo
user `demo@studyflow.app` re-seeded; the `.env`
`DATABASE_URL="file:../db/custom.db"` contract + `db/` at the repo root +
`.env.example` git-tracked all verified current).

The review docs read in order: AGENTS.md, CLAUDE.md, README.md, the
Project_Architecture_Document (the ADR index through ADR-025), the SKILL
(the AP index through AP-72); then session_53 (the S27 transcript),
remediation-plan-session27, the repo worklog (the S27 entry), session_52
(the S27 narrative). The S27 seams verified present + audited
line-by-line — CLEAN (the repaired `scripts/dark-sweep.mjs`: the
API-driven mode forcing, the self-verifying precondition with
`waitForFunction`, the loud-failure guards on all three paths, the
`{ mode, views }` envelope, the awaited light-restore). The test configs
(vitest + playwright) verified current. The scandihaven repo re-reviewed
— unchanged since 10-04 (`d4789c3`); no new patterns to adopt.

Baseline gates matched the documented state: lint ✓ tsc ✓ 258 unit ✓
build ✓ — plus the cold-`db/e2e.db` full e2e regression 291 ✓ (4.4 min) =
the documented 549-green state re-confirmed on arrival.

The standing checks FIRST (the brief's priority item): the mobile-drawer
check GREEN on the clone — **plus a live agent-browser walkthrough at
390×844** (the app bar renders with the Open-navigation-menu button +
brand + live clock; the drawer opens as a dialog with all 20 links; the
Settings link navigates; the Profile tab renders the S26 Email address
card above the S24 Change password + S25 Danger zone cards; scrollWidth
390 — no horizontal overflow). **The mobile navigation menu is working
as expected.** The reference re-sweep (login
`sepnetflix2023@outlook.com` + dashboard + Settings + Profile tab):
**UNCHANGED since S19–S27** — the zero-data account 0/0, the greeting
from the email prefix, the same 20 nav views in the same order, the
"StudyFlow / Your study companion" branding split, the same five
Settings tabs (school / 9th grade / 4-hour goal / created 9/28/2026);
the 20-view copy sweep 14/20 MATCH with the 6 remaining diffs all
DATA-STATE (the documented S17-pinned non-gap family). The reference has
ZERO email-change/password/deletion surfaces in its Settings — the
clone's S24–S26 cards remain pure superset.

The governing decision: both backlogs empty + the standing superset goal
→ a production-readiness sweep (the S22/S24/S27 pattern) governed. The
sweep re-ran the full standing-audit suite: security ✓ (0 findings — one
transient "AI-route limiter shape wrong" note was MY double-run artifact:
the first run consumed the 20/15-min per-user AI budget and the second
run's probe started at 429; a clean dev-server restart by PID + a single
re-run showed the documented shape `20x400 then 2x429; cutoffAt=21`),
settings-roundtrip ✓, upload-edge ✓, data-volume ✓ (0 findings after 750
probe rows inserted + cleaned), forced-colors ✓ (1 hit = the Events
view's deliberately hidden `aria-hidden` `sr-only` date trigger — a
non-gap), print ✓, focus-order ✓ (the dev-mode NEXTJS-PORTAL artifacts
only), CWV ✓ (CLS 0.00 everywhere; throttled-mobile dashboard LCP NI
2620 ms — the documented S16 state; the reference's own mobile login
POOR), **dark-sweep ✓** (the S27 repair validated live this session:
`MODE: dark`, flashbulb=0 unreadable=0 across all 20 views in REAL dark
mode, preference restored), and accent-dark-sweep ✓ (its residual hits
are the documented S11 verified non-gap family — the accent CTA faces at
2.15, the Calendar adjacent-month dimming 2.36 dark, the Timetable
subject-colored class cards, the muted type pills).

**The sweep found exactly ONE genuine defect — again of the
tooling-integrity class (the AP-69/AP-70/AP-72 family), this time a
VERDICT rot: `scripts/connectivity-audit.mjs` family A4, the
login-offline probe, had silently rotted after the S15 auth-flow
change.** It reported "Login offline shows no/silent feedback" with
`toast: []` — while the SAME finding's measured bodyText contained "You
appear to be offline. Check your connection and try again." **A finding
disproved by its own measured evidence.** Root cause (verified): A4 was
written in S14 against the then-current design — the login card toasted
auth errors, and `toast: []` was the silent-failure signal. S15
(ADR-013) then replaced the login card's error rendering with the
reference's MEASURED pattern — auth errors render INLINE as a
`role=alert` red wash between Password and Sign in (`login-card.tsx`:
"the reference's measured pattern, replacing the S14 toast"), pinned by
`tests/e2e/auth-flows.spec.ts` (`div.shadow-2xl` `getByRole("alert")` +
`toHaveURL(/\/login/)`). The probe was never re-validated against the
change; every session since S15 that ran the audit (S22–S27, including
the S27 session that reported "connectivity ✓") received this phantom
finding — the sessions trusted the aggregate verdict and never re-read
the findings array. A future session acting on it would revert the login
card to toasts and break the S15 reference-parity pins. **S28: the
connectivity-audit A4 repair + the designed-channel doctrine.**

A dedicated reproduction probe (a scratch copy of the A4 flow
enumerating ALL announcement roles) confirmed the real behavior: url
`/login`, the role=alert InlineAlert with the offline message, the
submit button re-enabled, the user still on the card. The e2e S15 family
corroborates (it pins the exact behavior the phantom finding denies).

Plan saved to `docs/remediation-plan-session28.md` and validated against
the codebase: the auth card container `div.shadow-2xl` verified at
`login-card.tsx:383`; the catch `setError` + `setBusy(false)` verified;
no `role=status` anywhere on the login route; ai-a11y-audit's role=status
usage is the DESIGNED AI-surface channel (not rotted) — only A4.

TDD — the probe-script form (execution-validated, the S27 convention):
**RED** observed + captured (the phantom finding + the reproduction
probe output). **GREEN — zero implementation iterations**: the A4 block
replaced (the assertion now reads the DESIGNED channel from the live
DOM: the `role=alert` texts scoped to the `div.shadow-2xl` card — never
page-wide, Next's route announcer also carries role=alert — plus the
stays-on-card guard `url === "/login"` and the button-recovered guard
`!disabled && text !== "Signing in…"`; the genuine-failure criterion
stays LOUD: no announcement or a lost card keeps a REAL finding "Login
offline fails silently or loses the card"). Re-run: findings 0;
"Login offline announces the failure through the S15 inline alert (stays
on the card, button recovered)" in nonGaps with the measured
`{ url, alert, button }` riding the verdict. **The negative control**: a
scratch copy with a never-satisfiable criterion (deleted after) → exit 1
+ the loud stderr finding + the measured JSON printed — the guard is not
a rubber stamp.

Gates re-run: lint ✓ tsc ✓ 258 unit ✓ build ✓ **291 e2e ✓** (cold
db/e2e.db, 4.5 min) = 549 green, the 291 prior pins untouched by
construction (no app code touched).

Verification re-runs: the drawer check GREEN post-change; the dev server
restarted cleanly by PID first (the AP-70 lesson) before the captures;
the standing 31 screenshots refreshed via `capture-studyflow.mjs` (24
light + 7 dark; theme restored light). Evidence:
`docs/screenshots/s28-login-offline-inline-alert.png` (the
login-offline state with the S15 inline alert) +
`docs/screenshots/s28-connectivity-audit-evidence.json` (the before-state
with the phantom finding, the reproduction probe, the after-state with
findings 0, the negative control, the gates, the standing checks).

Docs alignment: AGENTS (the connectivity-audit entry — the
designed-channel note), README (the session-28 status row + the captures
line), PAD (ADR-026 with the alternatives-rejected table: both-channels
acceptance rejected — a toast on the login route is now the WRONG
design; fixing the app rejected — parity-breaking; retiring the probe
rejected — a genuine resilience surface; unit pins for probes rejected —
the S27 convention), SKILL (AP-73 — the expectation-rot lesson: the tell
is a finding whose own measured evidence disproves it; assert the
designed channel; read the findings array, not the aggregate verdict),
CLAUDE (the designed-channel clause). `.env.example` audited — matches
the codebase, git-tracked (included in the commit per the brief).

Then the commit phase: the feat commit to main (including this
session_54 narrative + the worklog entry) — pushed via the SSH wrapper
(`docs/ssh_git_wrapper_v3.py`), remote verified, the operator key
shredded after; then the follow-up "update session log" commit adding
this session's transcript.

## Session Complete ✅

**S28 — the connectivity-audit A4 repair (the designed-channel doctrine)
— pushed to `main`**, 549 tests green (258 unit + 291 e2e, cold-DB full
regression; no app code touched — the 291 prior pins untouched by
construction).

**What this session did:**

1. **All standing checks GREEN on arrival** — the mobile navigation menu
   verified working (the drawer probe + a live agent-browser walkthrough
   at 390×844), the reference re-swept **UNCHANGED since S19–S27**, the
   S27 code audited clean AND its repair validated live (MODE dark, 0/0
   across 20 views), the 549-test regression re-confirmed,
   `DATABASE_URL="file:../db/custom.db"` + the test configs +
   `.env.example` verified current.

2. **Governing decision**: with both backlogs empty, the
   production-readiness sweep re-ran the full standing-audit suite and
   found the ONE genuine defect — the connectivity audit's A4
   login-offline probe had silently rotted after the S15 auth-flow
   change (asserting the retired S14 toast design while S15 replaced the
   login card's errors with the reference's measured inline role=alert).
   The phantom finding was disproved by its own measured evidence.
   Repaired with the probe-script TDD form: the designed-channel
   assertion (scoped to the auth card), the stays-on-card +
   button-recovered guards, the loud genuine-failure criterion, the
   measured state riding the verdict, the negative control.

3. **The doctrine** (ADR-026/AP-73): a probe's VERDICT must track the
   DESIGN — the tell for expectation rot is a finding whose own measured
   evidence disproves it. Assert the designed channel scoped to its
   container, keep the genuine-failure criterion loud, and re-run every
   standing audit after any change that touches what it measures —
   reading the findings array, not the aggregate verdict.

**Suggested next steps**: the remaining open item stays the first real
`docker compose --profile init up` on the owner's Docker host. The
superset story now covers observability + portability + fail-fast boot
hygiene + the complete account arc + audit-tool integrity (both rot
classes: mode-forcing S27 and verdict S28); scheduled backups and a
pre-push secret-scan gate remain documented ADR rejections, revisitable
on request.
