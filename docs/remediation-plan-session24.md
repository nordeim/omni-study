# Remediation Plan — Session 24 (S24): the change-password flow (account security)

**Audit surfaces (this session, session-41 workspace run at `10e632e`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
245 unit ✓ against the S23 codebase; the data-import unit file re-run 30/30),
the mobile-drawer check on BOTH apps (backdrop `oklab(0 0 0/0.2)`+blur(4px),
288px white panel, 20 links, no footer, Escape-close superset — the brief's
priority item — **the mobile navigation menu is working as expected**), the
reference re-sweep (login → dashboard → the five-tab Settings sweep): **the
reference is UNCHANGED since S19–S23** (the zero-data account 0/0, school
"Lincoln High", Daily Study Goal: 4 hours, Account created 9/28/2026, the
Notifications master toggle, 20 nav views in the same order, the branding
split stable), the clone-side Settings sweep parity ✓, and the S23 code
audit (the recent changes: the `data-import` seam, the `POST /api/import/data`
route, the panel's Restore card, the specs — reviewed line-by-line) —
**CLEAN**, plus a live export→import round-trip probe (the downloaded
envelope re-imported idempotently: 0 created / N updated, the anon gates
401). Docker re-verified unavailable in the sandbox; the first real
`docker compose --profile init up` stays the owner's documented step
(DEPLOYMENT.md §8). The scandihaven reference repo re-reviewed — unchanged
since 10-04; no new patterns to adopt.

## The governing decision (this session's work)

With the parity backlog empty (the reference unchanged), the audit backlog
empty (S23 clean), the standing superset goal governed. This session's
production-readiness sweep (the S22 pattern) found **ONE genuine user-facing
gap**: **a signed-in user has no way to rotate their password.** The only
path is the S15 forgot-password flow — which is designed for the LOCKED-OUT
user, not the hygiene-rotating one (its no-SMTP reset URL surfaces in the
response JSON + muted on-screen notes — the documented self-hosted
trade-off — an awkward dance for a user who knows their current password).

Verified this session (scratch probe, deleted after): the reference's
Settings has ZERO password-related surfaces across all five tabs (no
password inputs, no security section — the Base44 platform handles accounts
outside the app). So this is a **pure superset feature** — the clone being a
functional superset is the standing goal — and the natural continuation of
the auth arc: S15 shipped the reference's full account journey; S24 adds the
clone's own account-security rotation.

### The semantics (tight scope, resolved by design)

- **Current password required.** The route verifies the stored scrypt hash
  first — a stolen session cookie cannot rotate the password silently (the
  30-day stateless session is the wider window; the current-password proof
  narrows THIS surface to the account owner).
- **The register password policy applies** (`min(8).max(200)` — the same
  rule family as login/register/reset: ONE policy, no drift).
- **The new password must differ from the current one** (a rotation that
  lands on the same value is a no-op the user thinks happened — reject with
  the actionable message; the rule lives IN the Zod schema's `.refine`, the
  pure seam, unit-pinned).
- **The session survives** (stateless HMAC — the cookie is signed with
  AUTH_SECRET, not the password; the user stays signed in across their own
  rotation — the standard UX). Revoking OTHER sessions needs a per-user
  epoch checked on every request — a stateless-contract break documented as
  a non-gap (the same single-instance posture as the S14 in-memory rate
  limiter).
- **Errors render INLINE** (`role="alert"` — the S15 auth convention: auth
  errors never render as toasts); success renders as `role="status"` (the
  S23 pattern) and clears the fields.

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase. The
   change-password card adds ZERO chrome to any parity-pinned surface (the
   Profile tab's pinned surfaces — the "Your account and study information"
   header, the avatar + identity block, Display name / School Name / Grade
   Level / Daily Study Goal, Save Profile + Sign out, the Account-created
   line — stay byte-identical; the new card is a purely additive sf-card
   BELOW the pinned card, the S23 Restore-card pattern).
2. **No other-session revocation** — stateless sessions cannot be revoked
   without a per-request DB epoch check (a contract break); documented here.
3. **No password-strength meter** — the reference family has none and the
   policy is the documented min-8; a meter is chrome, not function.
4. **No email notification on change** — there is no SMTP by design (the
   S15 trade-off); the in-app success note is the acknowledgment.
5. **No rate-limit e2e pin** — the route reuses the pinned `checkRateLimit`
   seam (the S14 family); an exhaustion pin would poison the route budget
   for the other S24 specs (the C1 pattern, documented).
6. **The Docker real-run** remains the owner's step (no daemon here).

---

## Families and fixes

### S24-A (HIGH) — the schema seam (`src/lib/validation.ts`)

`changePasswordSchema` — the pure, unit-pinned validation (the
login/register/reset family pattern):

```ts
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(200),
    newPassword: z.string().min(8).max(200),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "The new password must be different from your current password.",
  });
```

One policy with the register family (min 8 / max 200), plus the
same-password rule at the seam (the refine rides the object, so the route's
`safeParse` failure message IS the actionable copy).

### S24-B (HIGH) — the route (`POST /api/auth/change-password`)

`src/app/api/auth/change-password/route.ts` (the reset-password route
pattern — auth conventions, one operation, clear JSON errors):

- `requireUser()` (401 JSON for anonymous callers — `UnauthorizedError`
  through `errorResponse`, the API-route convention), then
  `checkRateLimit(`changePw:${user.id}`, 10)` (the S14 seam's default
  budget — a rare, sensitive write; 429 + `Retry-After`).
- Body → `changePasswordSchema.safeParse` → failure → 400 with the FIRST
  issue's message (the schema's refine copy surfaces verbatim; a
  missing/short field gets the standard "Enter a valid email and a password
  of at least 8 characters."-family wording — the login route's posture).
- `db.user.findUnique({ where: { id: user.id }, select: { passwordHash } })`
  (getCurrentUser deliberately never reads the hash — the route reads it
  itself), `verifyPassword(current, hash)` → failure → 400
  **"Your current password is incorrect."** (the caller is the
  authenticated account owner — no enumeration surface; clear feedback
  beats ambiguity here, the reference's own inline login-error posture).
- `db.user.update({ data: { passwordHash: hashPassword(new) } })`.
- Success → `{ ok: true }` (the panel renders the acknowledgment; the
  session cookie is untouched — stateless).

### S24-C (MEDIUM) — the Profile tab extension (`src/components/views/settings-view.tsx`)

A second `sf-card` (the S23 additive-below pattern — max-w-lg, below the
pinned Profile card, inside the same TabsContent):

- `section[aria-label="Change password"]`: the h3 header
  ("Change password", the tab's own `text-[15px] font-semibold` pattern),
  three `Input type="password"` fields — Current password
  (`autoComplete="current-password"`), New password
  (`autoComplete="new-password"`), Confirm new password — each with its
  `Label`, an `Update Password` button (the `variant="gradient"` primary,
  disabled while busy or until all three fields are filled), the busy
  state, the inline error (`role="alert"`, the S15 auth chrome) and the
  success note (`role="status"`, "Password updated." — clears the fields).
- Client-side pre-checks (the S23 size-pre-check pattern): the confirm
  match + the min-8 rule → the early inline error, no request.
- The POST rides `apiSend("POST", "/api/auth/change-password", {...})`.
- Standard utilities only, the sf-card pattern, dark-mode via the existing
  `.dark` contract — NO new CSS (zero Tailwind v4 surface). Responsive to
  390px. ZERO nav linkage (the shell stays 20 links).

### S24-D (MEDIUM) — the pins

**Unit (`tests/validation.test.ts`, the schema-family pattern):**
- accepts a valid differing pair;
- rejects a missing/short(<8)/long(>200) current and new password;
- rejects the same-password pair with the refine message (the actionable
  copy pinned verbatim).

**E2E (`tests/e2e/s24-change-password.spec.ts`, the S23 conventions —
demo-user storageState where possible, ONE fresh registration for the
mutation journey):**
1. **The anon gate:** POST without a session → 401 JSON (the AP-67
   explicit empty storageState).
2. **The wrong-current rejection:** the demo user POSTs a wrong current
   password → 400 + "Your current password is incorrect." (the demo user's
   hash is NEVER touched — the guard runs before any write).
3. **The same-password rejection:** current == new → 400 with the refine
   copy (a no-op rotation never lands).
4. **The full rotation round-trip (the fresh-user journey — the S17
   registerFreshUser pattern, ONE registration against the ~8/10 register
   budget):** register `s24-pw-<stamp>@e2e.test` → verify (the surfaced
   code) → sign in via the login API (fresh request context — NOT the
   shared storageState) → change the password → the OLD password login
   returns 401 "Invalid email or password" → the NEW password login
   returns 200 (the rotation landed; the demo user untouched — the
   poisoned-record lesson designed out).
5. **The panel journey:** the Settings Profile tab renders the Change
   password card BELOW the pinned surfaces (the card + its three labeled
   fields visible); a mismatched confirm → the early inline error; a
   correct submission on the fresh user → the success note renders
   (`role="status"`). The existing S17 Profile pins re-run green as the
   regression net (additive-below is presence-safe).

### S24-E (MEDIUM) — docs alignment

README (the auth-features row gains the change-password; the
`/api/auth/change-password` API row; counts; the Project Status
session-24 row; the captures line), AGENTS.md (the change-password
contract in Architecture facts + counts), CLAUDE.md (the contract + the
S24 seam + counts), PAD (ADR-022 — the account-security rotation contract
with the alternatives-rejected table: no other-session revocation / no
strength meter / no email notification / no rate-limit pin; the
test-distribution table to the new count), SKILL.md (the counts badge; an
AP entry if lessons land), `.env.example` audited (unchanged — the route
reads no env vars), this plan's execution log, the session narrative +
transcript, `worklog.md`.

---

## TDD order

1. **RED unit** — the changePasswordSchema pins (the absent schema —
   validation.test.ts fails to import it).
2. **RED e2e** — `tests/e2e/s24-change-password.spec.ts` (the route
   answers 404; the panel lacks the card).
3. **GREEN** — the schema → the route → the panel card. Rebuild.
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone Settings
   sweep; a live agent-browser mobile walkthrough (the S23 pattern).
6. Evidence captures via a committed `scripts/capture-s24-evidence.mjs`
   (the S22/S23 pattern): the API round-trip proof (the wrong-current 400,
   the same-password 400, the fresh-user rotation with the old-401/new-200
   login pair, as JSON) + dev-server screenshots of the remediated
   codebase (the Settings Profile tab with the Change password card —
   desktop light + DARK + mobile 390px, and the success-note state) →
   `docs/screenshots/s24-*.png|json`.
7. Docs (S24-E) + the commit pattern + the SSH-wrapper push.

## Risks

- **The demo user's password** — the mutation journey runs on a FRESH user
  by construction (the S17 pattern); the demo-user specs only exercise the
  rejection guards (pre-write) — the shared setup sign-in can never break
  mid-suite (the S4 poisoned-record lesson designed out).
- **The register budget** — one new registration: ~9 of the 10/IP/15-min
  budget; counted and documented (no other spec registers beyond the
  existing ~8).
- **The Profile tab pins** — the card is additive BELOW the pinned card;
  the S17 pins are presence/value-based — the regression net re-proves
  them.
- **Timing-safe comparison** — `verifyPassword` already uses
  `timingSafeEqual` (the existing seam; no new crypto).
- **The stateless session survives the rotation** — documented behavior
  (the cookie is AUTH_SECRET-signed, not password-derived); revoking other
  sessions is the rejected alternative (ADR-022).

---

## Execution log (session-42 workspace run)

- **RED observed (both layers, exactly as designed):** the unit layer
  failed to import the absent `changePasswordSchema` export (4 failures,
  35 existing pins untouched); all 5 chromium e2e specs failed against
  the pre-change build (the route answered 404; the panel lacked the
  card) — the setup project passed on arrival by design.
- **GREEN — one honest e2e iteration (the documented substring-matching
  locator lesson re-applied to `getByLabel`: "New password" also matches
  "Confirm new password" — `exact: true`; the AGENTS quirk extended in
  the same session), zero implementation iterations:**
  1. `src/lib/validation.ts` — `changePasswordSchema` (the register
     family's min-8/max-200 policy on both fields + the must-differ
     refine + strip mode). 4/4 unit pins green first-try.
  2. `src/app/api/auth/change-password/route.ts` — the route (auth →
     the S14 rate limit → the schema → the pre-write current-password
     verification → the hash rotation; the stateless session untouched).
  3. `src/components/views/settings-view.tsx` — the Change password
     card (additive-below the pinned S17 Profile surfaces; the
     client-side pre-checks; role="alert" errors / role="status"
     success; NO new CSS — zero Tailwind v4 surface).
  4. Live dev-server sanity probes (throwaway): the guard family (400s
     with the exact copies), the full rotation round-trip on the demo
     account (rotate → old 401 → new 200 → session survives → restored),
     the anon 401 — all GREEN; the panel probe (3 fields + the button +
     the pinned surfaces above — visible on desktop).
- **Full gate GREEN:** lint ✓ tsc ✓ **249 unit ✓** (245 + 4) build ✓
  **279 e2e ✓** (cold `db/e2e.db`, 4.4 min — the 274 prior pins
  untouched) = **528 tests green** (249 unit + 278 chromium + the 1
  setup).
- **Verification re-runs GREEN:** the standing drawer check (all six
  checks true, both apps); the clone Settings sweep parity ✓; a live
  agent-browser mobile walkthrough at 390×844 (the app bar + clock
  render; the drawer opens as a dialog with all 20 links; the
  Flashcards link navigates; the drawer closes; the Settings Profile
  tab renders the Change password card below the pinned surfaces).
- **Evidence captured** (`scripts/capture-s24-evidence.mjs`, committed):
  `s24-change-password-evidence.json` (the guard family [wrong-current /
  same-password / short-new → the exact 400 copies] + the demo-still-
  signs-in pre-write proof + the anon 401 + the fresh-user rotation
  [registered 201 → verified login 200 → rotate 200 → session survives
  me 200 → the old-password login 401 "Invalid email or password" → the
  new-password login 200] + the screenshot chrome reads [light + DARK
  via the production loadFromUser path + mobile no-overflow] + the
  success note "Password updated." + the demo-restored login 200) +
  four dev-server screenshots (the Settings Profile tab with the Change
  password card — desktop light + DARK + mobile 390px, and the
  success-note state). VLM-verified: all four PASS via
  `scripts/vlm-verify-s24.mjs`.
- **Docs aligned:** README (badge 528, the Auth feature row's rotation
  clause, the `/api/auth/change-password` API row, counts 249/279, the
  E2E notes' S24 pin family, the captures line, the Project Status
  session-24 row — also removing a pre-existing dangling three-line
  S22 fragment after the captures paragraph), AGENTS (the
  change-password contract in Architecture facts + 2 capture commands +
  the counts + the getByLabel substring quirk extension), CLAUDE (the
  change-password contract + the S24 seam in the unit list + the S24
  pins in the e2e list + the counts), PAD (ADR-022 with the
  alternatives-rejected table; the test-distribution table to 528 = 249
  unit + 278 chromium + the 1 setup — the "Unit — pure seams" row to
  15 files / 205 tests), SKILL (the 528 badge), DEPLOYMENT.md §8.3 (the
  post-deploy rotation walkthrough + the AUTH_SECRET-rotation
  invalidation note). `.env.example` audited — unchanged (the route
  reads no env vars).
