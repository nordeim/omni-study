# Session 45 — the S25 iteration: the account-deletion flow (the ownership exit)

Fresh clone at `98a389e` (the S24 push `0764793` + the session-44
session-log update — the workspace had been reset). The review docs
read (session_43, remediation-plan-session24, the repo worklog,
session_44); the S24 seams verified present and audited line-by-line
(the `changePasswordSchema` seam, the `POST /api/auth/change-password`
route, the panel's Change password card + handler, the specs) —
**CLEAN**. `DATABASE_URL="file:../db/custom.db"` with `db/` at the
repo root, `.env.example` matching the codebase, the vitest +
playwright configs current. Baseline gates matched the documented
state: lint ✓ tsc ✓ 249 unit ✓ build ✓, and the cold-`db/e2e.db` full
e2e regression **279 ✓ (4.4 min)** — the documented 528-green state
re-confirmed on arrival.

The standing checks FIRST (the brief's priority item): the
**mobile-drawer check GREEN** on both apps — backdrop
`oklab(0 0 0/0.2)`+blur(4px), the 288px white panel, 20 links, no
footer, the Escape-close superset — and additionally live-verified
with agent-browser at 390×844 (the app bar renders with brand +
clock, the drawer opens as a dialog with all 20 links, the Flashcards
link navigates, the view renders, the drawer closes). **The mobile
navigation menu is working as expected.** The reference re-sweep
(login → dashboard → the five-tab Settings sweep, robust
selector-waits — the reference's slow first paint is documented): the
reference is **UNCHANGED since S19–S24** — the zero-data account 0/0,
school "Lincoln High", Daily Study Goal: 4 hours, Account created
9/28/2026, the Notifications master toggle, 20 nav views in the same
order, the branding split stable. The clone-side Settings sweep:
parity ✓ (the S24 Change password card rendering below the pinned
surfaces). No Tailwind v4 bugs (all traps remain pinned — the new
Danger zone card uses standard utilities only, zero new CSS). Docker
re-verified unavailable in the sandbox; the first real `docker
compose --profile init up` stays the owner's documented step
(DEPLOYMENT.md §8). The scandihaven reference repo re-reviewed —
unchanged since 10-04 (top commit `d4789c3`); no new patterns to
adopt.

Governing decision: with both backlogs empty (the reference unchanged,
the S24 code clean) and the full regression green on arrival, the
standing superset goal governed — and this session's
production-readiness sweep (the S22/S24 pattern) found **ONE genuine
user-facing gap: a signed-in user cannot delete their own account.**
The ownership story was otherwise complete — the owner can take every
byte OUT (S21 export), bring it back IN (S23 import), and rotate the
password (S24) — but the final ownership gesture, LEAVING, required
raw SQLite surgery (`rm db/custom.db` wipes EVERYONE; hand-deleting
one user's 22 content collections is unreasonable). Verified by a
scratch reference probe (deleted after): the reference's Settings has
ZERO account-deletion surfaces across all five tabs — a pure SUPERSET
feature, the natural completion of the account arc (S15 the
reference's journey, S24 the clone's rotation, S25 the clone's
right-to-erasure). Technical feasibility verified before the plan: all
22 user relations in `prisma/schema.prisma` carry `onDelete: Cascade`
(grep-verified — ONE `db.user.delete` wipes the complete footprint).

Plan saved: `docs/remediation-plan-session25.md` — validated against
the codebase before execution (no existing deletion surface anywhere
in src/ or tests/; the schema family's policy confirmed min-8/max-200;
the Profile tab's card chain enumerated for the additive-below
placement; the register budget counted — and CORRECTED: the
S24-documented ~8+1=9/10 was off by two, the real pre-S25 count was
10/10 [S9 registers 2, not 1; s16-perf-parity also registers 1 through
the UI]).

TDD: **RED** — the unit layer failed to import the absent
`deleteAccountSchema` (4 failures); all 5 e2e specs failed (the route
answered 404; the panel lacked the card). **GREEN** — the schema seam
(`deleteAccountSchema`: the register family's min-8/max-200 policy on
the password + the typed-confirmation `.refine` demanding the
CASE-EXACT word `DELETE` whose message IS the actionable copy + strip
mode) → the route (`POST /api/auth/delete-account`: requireUser → the
S14 rate limit `delAcc:${user.id}` 10/15-min → the schema → the
password VERIFIED against the stored scrypt hash FIRST [a wrong
password → 400 pre-write — the account untouched] → the ONE cascade
write `db.user.delete` [all 22 relations] → the session cookie CLEARED
[maxAge 0 — the logout mechanism]) → the panel card (the Settings
Profile tab's **Danger zone** card — a purely additive sf-card BELOW
the S24 Change password card: the two-step reveal [the form is HIDDEN
until "Delete account…" is clicked], the warning copy with the
export-first pointer, Password + Confirmation fields, the destructive
final button + Cancel, errors INLINE as `role="alert"`, NO success
note — the theme cache cleared + `window.location.replace("/login")`,
the redirect IS the feedback). 4/4 unit pins green first-try.

Three honest iterations recorded: (1) a spec locator bug caught
pre-run (getByLabel vs the placeholder — "Confirmation" is the label,
"Type DELETE" the placeholder); (2) the ellipsis-character mismatch
(the button renders U+2026, the regex needed the literal char, not
three escaped dots); (3) **the register-budget exhaustion** — the full
cold-DB regression failed ONLY the fresh-user journey (429 on
register) while the spec passed in isolation: the suite's register
budget was already 10/10 (the corrected count above). Fixed by having
the spec's register/verify POSTs ride a DISTINCT client IP
(`x-forwarded-for: 192.0.2.25` — the RFC 5737 TEST-NET range): behind
a proxy distinct users have distinct IPs, the loopback pile-up is the
suite artifact, no production change, no prior pin touched. Recorded
as **AP-71**.

**FULL REGRESSION GREEN: 284 e2e ✓** (cold `db/e2e.db`, 4.4 min — the
279 prior pins untouched) = **537 tests green** (253 unit + 284 e2e =
283 chromium + the 1 setup). The authoritative count breakdown taken
via `playwright test --list` + the vitest per-file listing; the PAD's
test-distribution table re-reconciled to EXACT (44 files — the prior
session's 40-file total was itself a reconciliation drift, now
corrected).

Verification re-runs GREEN: the standing drawer check (all six checks
true, both apps); the clone Settings sweep parity ✓; a live
agent-browser mobile walkthrough at 390×844 (the app bar + clock
render; the drawer opens as a dialog with all 20 links; the Flashcards
link navigates; the drawer closes; the Settings Profile tab renders
the Danger zone card below the S24 card at 390×844; the two-step
reveal works; NO horizontal overflow — scrollWidth 390).

Evidence: 5 captures via the committed
`scripts/capture-s25-evidence.mjs` —
`s25-delete-account-evidence.json` (the guard family with the exact
400 copies [wrong-password / wrong-confirmation / short-password] +
the demo-still-signs-in pre-write proof + the anon 401 + the
fresh-user deletion [registered 201 → verified login 200 → content
created 1/1/1 → delete 200 with the cookie cleared → the CASCADE
verified at the DB level through Prisma directly: user gone, every
row gone 0/0/0 → the old-credentials login 401 "Invalid email or
password" → the cleared session's me 401] + the screenshot chrome
reads [light + DARK via the production loadFromUser path + mobile
no-overflow] + the revealed-form chrome + the cancelledFormHidden +
the demo-intact login 200) + four dev-server screenshots (the Settings
Profile tab with the Danger zone card — desktop light + DARK + mobile
390px, and the revealed confirmation-form state). VLM-verified: all
four PASS via `scripts/vlm-verify-s25.mjs`.

Docs aligned: README (badge 537, the Auth feature row's deletion
clause, the `/api/auth/delete-account` API row, counts 253/284, the
vitest seam list, the E2E notes' S25 pin family, the captures line,
the Project Status session-25 row, the file-hierarchy counts), AGENTS
(the account-deletion contract in Architecture facts + 2 capture
commands + the counts), CLAUDE (the account-deletion contract + the
S25 seam + the S25 pins + the counts), PAD (ADR-023 with the
alternatives-rejected table: no soft-delete / no auto-export / no
email notification / no other-user deletion / no rate-limit pin / no
DELETE-method route; the test-distribution table to 537 = 253 unit +
283 chromium + the 1 setup, re-reconciled to 44 files exactly), SKILL
(the 537 badge + AP-71), DEPLOYMENT.md §8.4 (the post-deploy
account-deletion walkthrough + the export-first note). `.env.example`
audited — unchanged (the route reads no env vars).

**Session complete — the S25 account-deletion flow: 537 tests green,
ready to commit and push to main.**

**What governed this session:** both backlogs empty again (the
reference unchanged since S19–S24; the S24 code audited clean) — the
standing superset goal governed, and the production-readiness sweep
(the S22/S24 pattern) found the ONE genuine user-facing gap: the
ownership exit was missing.

**Landed (TDD, 537 tests green — 253 unit + 284 e2e):**
- **The seam**: `deleteAccountSchema` in `src/lib/validation.ts` —
  the register family's password policy + the typed-DELETE refine
  (ONE policy, no drift; case-exact by design)
- **The route**: `POST /api/auth/delete-account` — the password proof
  (pre-write), the rate limit, the ONE cascade write, the
  session-dies-with-the-account contract
- **The UI**: the Settings Profile tab's Danger zone card with the
  two-step reveal (the pinned S17 surfaces + the S24 card
  byte-identical)
- **The pins**: 4 unit + 5 e2e (the fresh user's register/verify POSTs
  ride a distinct client IP — the corrected budget count)

**Next:** the first real `docker compose --profile init up` on a
Docker host remains the owner's one open verification step
(DEPLOYMENT.md §8). The superset story now covers observability
(S18→S20), portability (S21 export + S23 import — the full
round-trip), fail-fast production boot hygiene (S22),
account-security rotation (S24), and the complete ownership exit
(S25 — export, import, rotate, erase); the remaining documented
candidates (scheduled backups, a pre-push secret-scan gate) stay
deliberate ADR rejections, revisitable on request.
