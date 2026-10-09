# Session 42 — the S24 iteration: the change-password flow (account security)

Git pull (fresh clone at `10e632e` — the S23 push `21c04f8` + the
session-log update). The review docs read (session_40,
remediation-plan-session23, the repo worklog, session_41); the S23
seams verified present and audited line-by-line (the `data-import`
seam, the `POST /api/import/data` route, the panel's Restore card, the
specs, the capture script) — **CLEAN**, plus a live export→import
round-trip probe (the downloaded envelope re-imported idempotently:
0 created / N updated; the anon gates 401).
`DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root,
`.env.example` matching the codebase, the vitest + playwright configs
current. Baseline gates matched the documented state: lint ✓ tsc ✓ 245
unit ✓.

The standing checks FIRST (the brief's priority item): the
**mobile-drawer check GREEN** on both apps — backdrop
`oklab(0 0 0/0.2)`+blur(4px), the 288px white panel, 20 links, no
footer, the Escape-close superset — and additionally live-verified with
agent-browser at 390×844 (the drawer opens as a dialog with all 20
links, the Flashcards link navigates, the view renders, the drawer
closes). **The mobile navigation menu is working as expected.** The
reference re-sweep (login → dashboard → the five-tab Settings sweep):
**UNCHANGED since S19–S23** — the zero-data account 0/0, school
"Lincoln High", Daily Study Goal: 4 hours, Account created 9/28/2026,
the Notifications master toggle, 20 nav views in the same order, the
branding split stable. The clone-side Settings sweep: parity ✓. No
Tailwind v4 bugs (all traps remain pinned — the change-password card
uses standard utilities only, zero new CSS). Docker re-verified
unavailable in the sandbox; the first real `docker compose --profile
init up` stays the owner's documented step (DEPLOYMENT.md §8). The
scandihaven reference repo re-reviewed — unchanged since 10-04; no new
patterns to adopt.

Governing decision: with both backlogs empty (the reference unchanged,
the S23 code clean) and the full regression green on arrival, the
standing superset goal governed — and this session's
production-readiness sweep (the S22 pattern) found **ONE genuine
user-facing gap: a signed-in user has no way to rotate their
password.** The only path was the S15 forgot-password flow — designed
for the LOCKED-OUT user, not the hygiene-rotating owner (its no-SMTP
reset URL surfaces in the response JSON — an awkward dance for a user
who knows their current password). Verified by a scratch reference
probe (deleted after): the reference's Settings has ZERO
password-related surfaces across all five tabs — a pure SUPERSET
feature, the natural continuation of the auth arc (S15 shipped the
reference's full account journey; S24 adds the clone's own
account-security rotation).

Plan saved: `docs/remediation-plan-session24.md` — validated against
the codebase before execution (no existing change-password surface
anywhere in src/ or tests/; the schema family's policy confirmed
min-8/max-200; the Profile tab's pinned surfaces enumerated for the
additive-below placement; the register budget counted: ~8 existing +
1 new = 9/10).

TDD: **RED** — the unit layer failed to import the absent
`changePasswordSchema` (4 failures); all 5 e2e specs failed (the route
answered 404; the panel lacked the card). **GREEN** — the schema seam
(`changePasswordSchema`: the register family's min-8/max-200 policy on
BOTH fields + the must-differ `.refine` whose message IS the actionable
copy + strip mode) → the route (`POST /api/auth/change-password`:
requireUser → the S14 rate limit `changePw:${user.id}` 10/15-min → the
schema → the current password VERIFIED against the stored scrypt hash
FIRST [a wrong current → 400 pre-write — the stored hash untouched; the
caller is the authenticated owner, no enumeration surface] → the new
hash written; the stateless session SURVIVES the rotation by design)
→ the panel card (the Settings Profile tab's **Change password** card —
a purely additive sf-card BELOW the pinned S17 surfaces, the S23
Restore-card pattern: three autoComplete-typed password fields, the
client-side pre-checks [all-filled / min-8 / confirm-match /
must-differ], errors INLINE as `role="alert"` [the S15 auth
convention], success as `role="status"` + the fields cleared). 4/4
unit pins green first-try; one honest e2e iteration (the documented
substring-matching locator lesson re-applied to `getByLabel` —
`exact: true`; the AGENTS quirk extended in the same session).

**FULL REGRESSION GREEN: 279 e2e ✓** (cold `db/e2e.db`, 4.4 min — the
274 prior pins untouched) = **528 tests green** (249 unit + 279 e2e =
278 chromium + the 1 setup).

Evidence: 5 captures via the committed
`scripts/capture-s24-evidence.mjs` —
`s24-change-password-evidence.json` (the guard family with the exact
400 copies + the demo-still-signs-in pre-write proof + the anon 401 +
the fresh-user rotation [registered 201 → verified login 200 → rotate
200 → the session survives me 200 → the old-password login 401
"Invalid email or password" → the new-password login 200] + the
screenshot chrome reads [light + DARK via the production loadFromUser
path + mobile no-overflow] + the success note "Password updated." +
the demo-restored login 200) + four dev-server screenshots (the
Settings Profile tab with the Change password card — desktop light +
DARK + mobile 390px, and the success-note state). VLM-verified: all
four PASS via `scripts/vlm-verify-s24.mjs`.

Docs aligned: README (badge 528, the Auth feature row's rotation
clause, the `/api/auth/change-password` API row, counts 249/279, the
E2E notes' S24 pin family, the captures line, the Project Status
session-24 row — also removing a pre-existing dangling three-line S22
fragment after the captures paragraph), AGENTS (the change-password
contract in Architecture facts + 2 capture commands + the counts + the
getByLabel substring quirk extension), CLAUDE (the change-password
contract + the S24 seam + the S24 pins + the counts), PAD (ADR-022
with the alternatives-rejected table: no other-session revocation / no
strength meter / no email notification / no rate-limit pin / no forced
re-login; the test-distribution table to 528), SKILL (the 528 badge),
DEPLOYMENT.md §8.3 (the post-deploy rotation walkthrough + the
AUTH_SECRET-rotation invalidation note). `.env.example` audited —
unchanged (the route reads no env vars).

**Session complete — the S24 change-password flow: 528 tests green,
ready to commit and push to main.**

**What governed this session:** both backlogs empty again (the
reference unchanged since S19–S23; the S23 code audited clean) — the
standing superset goal governed, and the production-readiness sweep
(the S22 pattern) found the ONE genuine user-facing gap: the
account-security rotation was missing.

**Landed (TDD, 528 tests green — 249 unit + 279 e2e):**
- **The seam**: `changePasswordSchema` in `src/lib/validation.ts` —
  the register family's policy + the must-differ refine (ONE policy,
  no drift)
- **The route**: `POST /api/auth/change-password` — the
  current-password proof (pre-write), the rate limit, the
  session-survives contract
- **The UI**: the Settings Profile tab's Change password card (the
  pinned S17 surfaces byte-identical)
- **The pins**: 4 unit + 5 e2e

**Next:** the first real `docker compose --profile init up` on a
Docker host remains the owner's one open verification step
(DEPLOYMENT.md §8). The superset story now covers observability
(S18→S20), portability (S21 export + S23 import — the full
round-trip), fail-fast production boot hygiene (S22), and
account-security rotation (S24); the remaining documented candidates
(scheduled backups, a pre-push secret-scan gate) stay deliberate ADR
rejections, revisitable on request.
