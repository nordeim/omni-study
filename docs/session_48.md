# Session 48 — the S26 iteration: the email-change flow (the account-identity rotation)

Fresh clone at `5682c95` (the S25 push `952888c` + the session-47
session-log update). The review docs read (session_46, remediation-
plan-session25, the repo worklog, session_47); the S25 seams verified
present and audited line-by-line (the `deleteAccountSchema` seam, the
`POST /api/auth/delete-account` route, the panel's Danger zone card +
handler, the specs) — **CLEAN**. `DATABASE_URL="file:../db/custom.db"`
with `db/` at the repo root, `.env.example` matching the codebase, the
vitest + playwright configs current. Baseline gates matched the
documented state: lint ✓ tsc ✓ 253 unit ✓ build ✓, and the
cold-`db/e2e.db` full e2e regression **284 ✓ (4.4 min)** — the
documented 537-green state re-confirmed on arrival.

The standing checks FIRST (the brief's priority item): the
**mobile-drawer check GREEN** on both apps — backdrop
`oklab(0 0 0/0.2)`+blur(4px), the 288px white panel, 20 links, no
footer, the Escape-close superset — and additionally live-verified
with agent-browser at 390×844 (the app bar renders with brand +
greeting, the drawer opens as a dialog with all 20 links, the Settings
link navigates, the Profile tab renders the new card, the drawer
closes). **The mobile navigation menu is working as expected.** The
reference re-sweep (login → dashboard → the five-tab Settings sweep,
robust waits — the reference's slow first paint is documented): the
reference is **UNCHANGED since S19–S25** — the zero-data account 0/0,
school "Lincoln High", Daily Study Goal: 4 hours, Account created
9/28/2026, 20 nav views in the same order, the branding split stable.
The clone-side Settings sweep: parity ✓ (the S24 Change password card
and the S25 Danger zone card rendering below the pinned surfaces). No
Tailwind v4 bugs (all traps remain pinned — the new Email address card
uses standard utilities only, zero new CSS). Docker re-verified
unavailable in the sandbox; the first real `docker compose --profile
init up` stays the owner's documented step (DEPLOYMENT.md §8). The
scandihaven reference repo re-reviewed — unchanged since 10-04 (top
commit `d4789c3`); no new patterns to adopt.

Governing decision: with both backlogs empty (the reference unchanged,
the S25 code clean) and the full regression green on arrival, the
standing superset goal governed — and the session-44/47 narrative's
production-readiness sweep had found TWO gaps: the account deletion
(shipped as S25) **and the email-modification surface** — the one left
unaddressed. This session re-swept it: **a signed-in user cannot
change their own email address.** The email is the login identifier —
the last immutable account field. A student who registered with a
typo'd address (with no SMTP the verification code surfaces directly,
so a typo'd email CAN be verified — the code never travels to the
address), or whose address is decommissioned (a school email → a
personal email at graduation), had no in-app path except raw SQLite
surgery. Verified by a scratch reference probe (deleted after): the
reference's Settings has ZERO email-change surfaces across all five
tabs — a pure SUPERSET feature, the natural continuation of the
account arc (S15 the reference's journey, S24 the clone's security
rotation, S25 the clone's ownership exit, S26 the clone's identity
rotation).

Plan saved: `docs/remediation-plan-session26.md` — validated against
the codebase before execution (no existing change-email surface
anywhere in src/ or tests/; the register budget RE-DERIVED by grep per
AP-71 — the loopback count is 10/10 [parity-session9 2 + s16 1 + S17 3
+ auth-flows 3 + s24 1], so BOTH new registrations ride DISTINCT
client IPs 192.0.2.26/.27; the S24/S25 card pins verified
VISIBILITY-only by grep — the Email card inserts between the Profile
card and the S24 card, the natural account order identity → security
→ destructive exit).

TDD RED: the schema pins added to `tests/validation.test.ts` (5
failures — the absent export; the 248 existing pins untouched); the
e2e spec `tests/e2e/s26-change-email.spec.ts` written (7 specs — the
route answered 404, the panel lacked the card).

TDD GREEN — zero implementation iterations: the schema seam
(`changeEmailSchema` — 5/5 unit pins first-try) → the route
(`POST /api/auth/change-email`: requireUser → the S14 rate limit →
the schema → the password VERIFIED against the stored scrypt hash
FIRST [a wrong password → 400 pre-write] → the route-side must-differ
guard [the account's own address → 400] + uniqueness guard [ANY
existing owner, verified or not → 409] → the ONE write with
`emailVerified` STAYING true [the password proof IS the verification —
the rejected re-verification OTP would surface to the same actor who
just proved the password, proving nothing, and locking them out at the
next login] → the session cookie UNTOUCHED [the S24 stateless
contract] + the `{ ok, email }` response) → the store's `setEmail`
action (the setAvatar pattern — the theme store's user slice) → the
panel card (the Settings Profile tab's Email address card: always
visible [email change is NOT destructive — no two-step reveal], the
typed-twice confirm guarding the typo lockout [a mistyped address is
unrecoverable through the UI], errors INLINE as role="alert", the
role="status" success note + the LIVE identity-block/sidebar update
through setEmail; NO new CSS).

One honest full-regression iteration: the first cold-db run failed
ONLY the fresh-user journey at the identity-block pin — a STRICT-MODE
violation: the page-wide `locator("p", { hasText: newEmail })`
resolved to TWO elements (the Profile identity block AND the sidebar
footer's user line — the email slice renders on BOTH surfaces; the
live store update drives both). The fix pins BOTH surfaces with scoped
locators — a STRONGER pin. No production change. Re-run GREEN.

Full gate: lint ✓ tsc ✓ 258 unit ✓ (253 + 5) build ✓ 291 e2e ✓
(cold `db/e2e.db`, 4.4 min — the 284 prior pins untouched) = **549
tests green** (258 unit + 290 chromium + the 1 setup). The
authoritative count breakdown via `playwright test --list` (291 tests
in 28 files) + the vitest per-file listing; the PAD's
test-distribution table updated to 45 files exactly.

Verification re-runs: the drawer check GREEN again post-change; the
clone Settings sweep parity ✓; the agent-browser mobile walkthrough
(the drawer + the Settings Profile tab rendering the Email address card
above the S24/S25 cards at 390×844 + no horizontal overflow).

Evidence: the committed `scripts/capture-s26-evidence.mjs` (the S24/S25
capture pattern; the dev server restarted cleanly by PID first — the
AP-70 lesson — so the in-memory limiter was fresh).
`s26-change-email-evidence.json`: the guard family (the exact 400/409
copies incl. the same-email and duplicate-email guards) + the
demo-still-signs-in pre-write proof + the anon 401 + the fresh-user
rotation (registered 201 → verified login 200 → change 200 → the
DB-LEVEL check through Prisma [newAddressResolves, sameAccountId,
emailVerifiedStillTrue, oldAddressGone] → me 200 with the new email →
the old-email login 401 → the new-email login 200 → the cleanup
delete 200) + the screenshot chrome reads (light + DARK through the
production loadFromUser path + mobile no-overflow) + the success-state
chrome (the note + the live identity-block update + the demo restore).
VLM verification: all four captures PASS via
`scripts/vlm-verify-s26.mjs`.

Docs alignment: README (badge 549, the Auth row's email-rotation
clause, the `/api/auth/change-email` API row, counts 258/291, the
vitest seam list, the E2E notes' S26 family, the captures line, the
Project Status session-26 row, the file-hierarchy counts), AGENTS (the
email-change contract + 2 capture commands + the counts), CLAUDE (the
contract + the S26 seam + the S26 pins + the counts), PAD (ADR-024
with the alternatives-rejected table; the test-distribution table to
549 = 258 unit + 290 chromium + the 1 setup, 45 files), SKILL (the 549
badge), DEPLOYMENT.md §8.5 (the post-deploy email-change walkthrough +
the sign-in-with-the-new-address note). `.env.example` audited —
unchanged (the route reads no env vars).

Then the commit phase: the feat commit (the seam + the route + the
store action + the panel + the pins + the captures + the plan + the
docs + the narrative + the transcript) and the log commit, both to
main — then the push via the SSH wrapper (`docs/ssh_git_wrapper_v3.py`
+ the paramiko shim, the documented steps), the remote verified ==
local HEAD, and the operator key destroyed after.
