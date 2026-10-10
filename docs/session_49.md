# Session 49 — the S26 execution transcript (session-47 workspace run)

The workspace had been reset — the repo freshly cloned to `5682c95`
(the S25 push `952888c` + the session-log update). Dependencies
installed, `.env` created from `.env.example`, the schema pushed +
seeded (`db/custom.db` at the repo root — the documented contract),
the dev server started on :3000.

The review docs read in order: AGENTS.md, CLAUDE.md, README.md, the
Project_Architecture_Document, the SKILL; then session_46 (the S25
transcript), remediation-plan-session25, the repo worklog, session_47
(the S25 session summary). The S25 seams verified present + audited
line-by-line — CLEAN (the schema, the route, the card + handler, the
specs).

Baseline gates matched the documented state: lint ✓ tsc ✓ 253 unit ✓
build ✓ — plus the cold-`db/e2e.db` full e2e regression 284 ✓ (4.4
min) = the documented 537-green state re-confirmed on arrival.

The standing checks FIRST (the brief's priority item): the
mobile-drawer check GREEN on both apps (backdrop `oklab(0 0 0/0.2)` +
blur(4px), the 288px white panel, 20 links, no footer, the
Escape-close superset) — and additionally live-verified with
agent-browser at 390×844: the app bar renders with brand + greeting,
the drawer opens as a dialog with all 20 links, the Settings link
navigates, the Profile tab renders, the drawer closes. **The mobile
navigation menu is working as expected.** The reference re-sweep
(dashboard + the five-tab Settings — robust selector-waits after the
documented slow first paint): UNCHANGED since S19–S25. The clone-side
Settings sweep: parity ✓. The scandihaven repo re-reviewed — unchanged
since 10-04, no new patterns. Docker unavailable (the owner's
documented step).

The governing decision: both backlogs empty → the session-44/47
narrative's production-readiness sweep had found TWO gaps — the
account deletion (shipped as S25) and the email-modification surface
(the one left unaddressed). This session re-swept it: **a signed-in
user cannot change their own email address** — the login identifier,
the last immutable account field (a typo'd registration address CAN be
verified with no SMTP — the code surfaces directly; a decommissioned
school email has no in-app path except raw SQLite surgery). A scratch
reference probe (deleted after) confirmed the reference's Settings has
ZERO email-change surfaces across all five tabs — a pure SUPERSET
feature, the account-identity rotation completing the account arc
(S15 journey, S24 security, S25 exit, S26 identity).

Plan saved to `docs/remediation-plan-session26.md` and validated
against the codebase: no existing change-email surface anywhere; the
register budget RE-DERIVED by grep (the AP-71 lesson — never trust a
documented count: parity-session9 registers 2, s16 1, S17 3,
auth-flows 3, s24 1 = 10/10 loopback; BOTH new registrations ride
DISTINCT client IPs 192.0.2.26/.27); the S24/S25 card pins verified
VISIBILITY-only by grep — the Email card inserts between the Profile
card and the S24 card (identity → security → destructive exit).

TDD RED: the schema pins added to `tests/validation.test.ts` (5
failures — the absent export); the e2e spec
`tests/e2e/s26-change-email.spec.ts` written (7 specs — the route
answered 404, the panel lacked the card).

TDD GREEN — zero implementation iterations: the schema seam
(`changeEmailSchema`) → the route (`POST /api/auth/change-email`) →
the store's `setEmail` action → the panel card. Live dev-server sanity
probes (throwaway, deleted after): the guard family (the exact
400/409/401 copies; the demo still signing in), the full terminal
round-trip (register → verify → login → change 200 → me 200 with the
new email → the old-email login 401 → the new-email login 200), the
panel probe (the card order by y-coordinate [Profile 182 < Email 738
< ChangePw 1135 < Danger 1475], the early inline error, the success
note, the identity block showing the new email, the fields cleared,
mobile 390px no overflow) — all GREEN.

Full gate: lint ✓ tsc ✓ 258 unit ✓ (253 + 5) build ✓ — the first
cold-db full e2e regression **failed ONE spec** (the fresh-user
journey at the identity-block pin — a STRICT-MODE violation: the
page-wide p-locator matched BOTH the Profile identity block AND the
sidebar footer's user line, the two surfaces that render the email
slice; the live store update drives both). Fixed by pinning BOTH
surfaces with scoped locators (`getByRole("tabpanel", { name:
"Profile" })` + `getByRole("complementary")`) — a STRONGER pin. The
re-run: **291 e2e ✓ (4.4 min)** = **549 tests green** (258 unit + 290
chromium + the 1 setup). The authoritative count breakdown via
`playwright test --list` + the vitest per-file listing; the PAD's
test-distribution table updated to 45 files exactly.

Verification re-runs: the drawer check GREEN again post-change; the
clone Settings sweep parity ✓; the agent-browser mobile walkthrough
(the drawer + the Settings Profile tab rendering the Email address card
above the S24/S25 cards at 390×844 + no horizontal overflow).

Evidence: the committed `scripts/capture-s26-evidence.mjs` (the
S24/S25 capture pattern — the dev server restarted cleanly by PID
first [the AP-70 lesson] so the in-memory limiter was fresh).
`s26-change-email-evidence.json`: the guard family (wrong-password /
mismatched-confirm / short-password / same-email 400s + the
duplicate-email 409, the exact copies) + the demo-still-signs-in
pre-write proof + the anon 401 + the fresh-user rotation (registered
201 → verified login 200 → change 200 → the DB-LEVEL check through
Prisma [newAddressResolves, sameAccountId, emailVerifiedStillTrue,
oldAddressGone] → me 200 with the new email → the old-email login 401
→ the new-email login 200 → the cleanup delete 200) + the screenshot
chrome reads (light + DARK through the production loadFromUser path +
mobile no-overflow) + the success-state chrome (the note + the live
identity-block update + the demo restore login 200) + four dev-server
screenshots (the Settings Profile tab with the Email address card —
desktop light + DARK + mobile 390px + the success-note state with the
live identity-block update). VLM verification: all four PASS via
`scripts/vlm-verify-s26.mjs`.

Docs alignment: README (badge 549, the Auth row's email-rotation
clause, the `/api/auth/change-email` API row, counts 258/291, the
vitest seam list, the E2E notes' S26 family, the captures line, the
Project Status session-26 row, the file-hierarchy counts), AGENTS (the
email-change contract + 2 capture commands + the counts), CLAUDE (the
contract + the S26 seam + the S26 pins + the counts), PAD (ADR-024
with the alternatives-rejected table; the test-distribution table to
549 = 258 unit + 290 chromium + the 1 setup, 45 files), SKILL (the 549
badge), DEPLOYMENT.md §8.5 (the post-deploy email-change walkthrough).
`.env.example` audited — unchanged (the route reads no env vars). The
execution log appended to the plan; the session_48 narrative + this
transcript written; the worklog entry next.

One curiosity handled before staging: the four S25 PNGs were found
re-rendered with the CURRENT chrome (the Email address card now
visible in them) while their S25 evidence JSON pair stayed untouched —
an inconsistent evidence set (the S25 VLM descriptions and JSON
chrome-reads describe the page WITHOUT the S26 card). Restored to the
committed bytes (`git checkout --`) so every session's evidence set
stays internally consistent; the S26 captures carry the current-chrome
proofs.

Then the commit phase: the feat commit (the seam + the route + the
store action + the panel + the pins + the captures + the plan + the
docs + the narrative + the transcript) and the log commit, both to
main — then the push via the SSH wrapper (`docs/ssh_git_wrapper_v3.py`
+ the paramiko shim, the documented steps), the remote verified ==
local HEAD, and the operator key destroyed after.
