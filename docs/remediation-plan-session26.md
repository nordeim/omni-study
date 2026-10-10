# Remediation Plan — Session 26 (S26): the email-change flow (the account-identity rotation)

**Audit surfaces (this session, session-47 workspace run at `5682c95`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
253 unit ✓ against the S25 codebase; `bun run build` ✓; the cold-`db/e2e.db`
full e2e regression **284 ✓ (4.4 min)** = the documented **537-green** state
re-confirmed on arrival), the mobile-drawer check on BOTH apps (backdrop
`oklab(0 0 0/0.2)`+blur(4px), 288px white panel, 20 links, no footer,
Escape-close superset — the brief's priority item — **the mobile navigation
menu is working as expected**), the reference re-sweep (login → dashboard →
the five-tab Settings sweep, robust waits — the reference's slow first paint
documented): **the reference is UNCHANGED since S19–S25** (the zero-data
account 0/0, school "Lincoln High", Daily Study Goal: 4 hours, Account
created 9/28/2026, 20 nav views in the same order, the branding split
stable), the clone-side Settings sweep parity ✓ (incl. the S24 Change
password card + the S25 Danger zone card rendering below the pinned
surfaces), and the S25 code audit (the recent changes: the
`deleteAccountSchema` seam, the `POST /api/auth/delete-account` route, the
panel's Danger zone card, the specs — reviewed line-by-line) — **CLEAN**.
The test configs + `DATABASE_URL="file:../db/custom.db"` + `.env.example`
verified current. Docker re-verified unavailable in the sandbox (the
owner's documented step — DEPLOYMENT.md §8). The scandihaven reference repo
re-reviewed — unchanged since 10-04 (top commit `d4789c3`); no new patterns
to adopt.

## The governing decision (this session's work)

With the parity backlog empty (the reference unchanged) and the audit
backlog empty (S25 clean), the standing superset goal governed. The
session-44/47 narrative's production-readiness sweep had found TWO genuine
gaps: the account deletion (shipped as S25) **and the email-modification
surface** — the one left unaddressed. This session re-swept it: **a
signed-in user cannot change their own email address.** The email is the
login identifier — the last immutable account field. A student who
registered with a typo'd address (with no SMTP the verification code
surfaces directly, so a typo'd email CAN be verified — the code never
travels to the address), or whose address is decommissioned (a school
email → a personal email at graduation), has no in-app path: the only fix
is raw SQLite surgery. The account arc is otherwise complete — the owner
can rotate the password (S24), leave (S25), take every byte out (S21) and
back in (S23) — but cannot update the identity they log in with.

Verified this session (scratch probe, deleted after): the reference's
Settings has **ZERO email-change surfaces** across all five tabs (no
email input, no change/update-email affordance, no email text anywhere in
the Profile tab — the Base44 platform handles accounts outside the app).
So this is a **pure superset feature** — the clone being a functional
superset is the standing goal — and the natural continuation of the
account arc: S15 shipped the reference's full account journey, S24 added
the clone's own account-security rotation, S25 the ownership exit, **S26
adds the account-identity rotation.**

### The semantics (tight scope, resolved by design)

- **Password proof required.** The route verifies the stored scrypt hash
  first — a stolen session cookie cannot hijack the account identity (the
  same posture as S24/S25; the 30-day stateless session is the wider
  window, the password proof narrows THIS surface to the account owner).
- **Typed confirmation required (the confirm field).** The UI and the
  schema both demand the new email twice — `newEmail` must equal
  `confirmEmail` (the refine lives in the Zod schema, the pure seam,
  unit-pinned). The guard protects against the typo lockout: a mistyped
  address is UNRECOVERABLE through the UI (the next login needs the new
  address) — unlike the password, which the forgot-password flow can
  rescue, a typo'd email has NO rescue path.
- **Must-differ + uniqueness at the route.** The current email is server
  state (not in the body), so the must-differ rule lives in the ROUTE
  (which reads the record anyway for the password proof): posting the
  current address → 400 "This is already your email address." (a no-op
  change the user thinks happened — the S24 must-differ posture); posting
  an address owned by ANY existing account (verified or not) → 409
  "An account with this email already exists. Try a different address."
  (the register route's conflict family; a claimable-looking unverified
  address is rejected too — claiming it would lock THAT owner out of
  their own re-registration path).
- **`emailVerified` STAYS TRUE.** With no SMTP (ADR-013), a re-verification
  OTP would surface to the same actor who just proved the password —
  proving nothing beyond the password proof, and creating a lockout
  footgun (the login gate would bounce the next sign-in until
  "re-verification"). The password proof IS the verification for the
  change. (The re-verification alternative is documented as rejected.)
- **The session SURVIVES the change by design.** The cookie is an HMAC
  over the user id (not the email) — the same stateless contract as S24.
- **Case normalization.** Emails are stored lowercase (the register and
  login routes both lowercase); the change route lowercases the new
  address before the uniqueness probe and the write.
- **Errors render INLINE** (`role="alert"` — the S15/S24/S25 auth
  convention: auth errors never render as toasts). Success renders as
  `role="status"` ("Email address updated.") + the fields cleared + the
  identity block's email line updated through the theme store (the email
  rides `useThemeStore`'s user slice — a new `setEmail` action).
- **Route name**: `POST /api/auth/change-email` — the auth family's
  verb-noun convention (login, logout, change-password, delete-account…).

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase. The
   Email card adds ZERO chrome to any parity-pinned surface (the Profile
   tab's pinned surfaces — the "Your account and study information"
   header, the avatar + identity block (which KEEPS displaying the email —
   now live-updating), Display name / School Name / Grade Level / Daily
   Study Goal, Save Profile + Sign out, the Account-created line — stay
   byte-identical; the S24 Change password card and the S25 Danger zone
   card stay byte-identical; the new card is a purely additive sf-card
   BELOW the main Profile card and ABOVE the S24 card — the natural
   account order: identity → security → destructive exit; the S24/S25
   specs pin VISIBILITY, not position — verified by grep).
2. **No re-verification OTP** — documented above (the rejected
   alternative: theater without SMTP + a lockout footgun).
3. **No notification of the OLD address** — there is no SMTP by design
   (the S15 trade-off); the inline success note is the acknowledgment.
4. **No email-change rate-limit e2e pin** — the route reuses the pinned
   `checkRateLimit` seam (the S14 family); an exhaustion pin would poison
   the route budget for the other S26 specs (the C1 pattern, documented).
5. **No admin/other-user email change** — there is no admin surface in
   the product (single-owner households).
6. **The Docker real-run** remains the owner's step (no daemon here).

---

## Families and fixes

### S26-A (HIGH) — the schema seam (`src/lib/validation.ts`)

`changeEmailSchema` — the pure, unit-pinned validation (the
login/register/reset/change family pattern):

```ts
export const changeEmailSchema = z
  .object({
    password: z.string().min(8).max(200),
    newEmail: z.string().email().max(200),
    confirmEmail: z.string().email().max(200),
  })
  .refine((v) => v.newEmail === v.confirmEmail, {
    message: "The email addresses do not match.",
  });
```

One policy with the register family (the email field's `z.string()
.email().max(200)` — the same shape everywhere; the register family's
min-8/max-200 on the password), plus the confirm-match rule at the seam
(the refine rides the object, so the route's `safeParse` failure message
IS the actionable copy).

### S26-B (HIGH) — the route (`POST /api/auth/change-email`)

`src/app/api/auth/change-email/route.ts` (the change-password route
pattern — auth conventions, one operation, clear JSON errors):

- `requireUser()` (401 JSON for anonymous callers — `UnauthorizedError`
  through `errorResponse`, the API-route convention), then
  `checkRateLimit(`changeEmail:${user.id}`, 10)` (the S14 seam's default
  budget — a rare, sensitive write; 429 + `Retry-After`).
- Body → `changeEmailSchema.safeParse` → failure → 400 with the FIRST
  issue's message (the confirm-match refine copy surfaces verbatim; a
  missing/short password gets the family's standard wording).
- `db.user.findUnique({ where: { id: user.id }, select: { passwordHash,
  email } })` (getCurrentUser deliberately never reads the hash — the
  route reads it itself), `verifyPassword(password, hash)` → failure →
  400 **"Your password is incorrect."** (the S25 copy; the caller is the
  authenticated account owner — no enumeration surface; the guard runs
  BEFORE any write).
- The must-differ guard: `newEmail === record.email` (both lowercased) →
  400 **"This is already your email address."**
- The uniqueness guard: `db.user.findUnique({ where: { email:
  newEmail } })` → exists → 409 **"An account with this email already
  exists. Try a different address."** (the register route's conflict
  family).
- `db.user.update({ where: { id: user.id }, data: { email: newEmail } })`
  — the ONE write; `emailVerified` stays true (documented above).
- The session cookie is untouched (stateless HMAC survives — the S24
  contract). Success → `{ ok: true, email }` (the client updates the
  theme store's email slice).

### S26-C (MEDIUM) — the Profile tab extension (`src/components/views/settings-view.tsx` + `src/lib/store.ts`)

A new `sf-card` (purely additive — BELOW the main Profile card, ABOVE the
S24 Change password card, inside the same TabsContent; `section
[aria-label="Email address"]`):

- The h3 header ("Email address", the tab's own `text-[15px]
  font-semibold` pattern), the copy ("Update the address you use to sign
  in. You'll need your current password."), and a simple form (the S24
  always-visible pattern — email change is NOT destructive, no two-step
  reveal): New email (`Input type="email"`, `autoComplete="off"`,
  `spellCheck={false}`, placeholder "e.g. you@example.com"), Confirm new
  email (the same), Current Password (`Input type="password"`,
  `autoComplete="current-password"`), a "Update email address" button
  (default variant) + NO cancel (nothing to hide — the S24 pattern).
- Client-side pre-checks (the S24/S25 pattern): all-filled + the
  confirm-match (the early inline error, no request).
- The POST rides `apiSend("POST", "/api/auth/change-email", {...})`; on
  success: the theme store's email slice updated (the new `setEmail`
  action on `useThemeStore` — the identity block's email line re-renders
  live), the fields cleared, a `role="status"` success note ("Email
  address updated.").
- Errors inline as `role="alert"`; standard utilities only, the sf-card
  pattern, dark-mode via the existing `.dark` contract — NO new CSS
  (zero Tailwind v4 surface). Responsive to 390px. ZERO nav linkage (the
  shell stays 20 links).

**The store action (`src/lib/store.ts`):** `setEmail: (email: string) =>
void` on the ThemeState interface + the implementation (`set({ email })`)
— the setAvatar pattern (a one-line user-slice setter; the email rides
the same slice).

### S26-D (MEDIUM) — the pins

**Unit (`tests/validation.test.ts`, the schema-family pattern):**
- accepts a valid triple (password + matching emails);
- rejects a missing/short(<8)/long(>200) password;
- rejects a malformed new email;
- rejects a mismatched confirm with the refine copy verbatim.

**E2E (`tests/e2e/s26-change-email.spec.ts`, the S24/S25 conventions —
demo-user storageState where possible, fresh registrations on DISTINCT
client IPs [the AP-71 RFC 5737 TEST-NET pattern — the loopback register
budget is at 10/10]):**
1. **The anon gate:** POST without a session → 401 JSON (the AP-67
   explicit empty storageState).
2. **The wrong-password rejection:** the demo user POSTs a wrong password
   (+ valid emails) → 400 + "Your password is incorrect." — the guard
   runs before any write: the demo user still signs in with the original
   password afterwards (the pre-write proof, the S24/S25 pattern).
3. **The mismatched-confirm rejection:** the correct password + a
   mismatched confirm → 400 with the refine copy ("The email addresses do
   not match.") — a half-confirmed change never lands.
4. **The validation family:** a short password → 400 (the register
   policy, min 8 — ONE policy, no drift).
5. **The same-email rejection:** the demo user posts their OWN email as
   the new email → 400 "This is already your email address." (a no-op
   change never lands; the demo record untouched).
6. **The duplicate-email rejection (409):** a throwaway unverified
   account is registered on a distinct IP first; the demo user posts ITS
   address → 409 "An account with this email already exists." (the
   register route's conflict family).
7. **The full change journey (the fresh-user round-trip — the S17/S24/S25
   ONE-registration convention, distinct IP):** register
   `s26-<salt>@e2e.test` → verify (the surfaced code) → sign in through
   the login UI → the Settings Profile tab renders the pinned surfaces +
   the Email address card (below the Profile card, above the S24 card) +
   the S24 Change password card + the S25 Danger zone card → a mismatched
   confirm → the early inline error (`role="alert"`) → the correct
   password + the new address (repeated twice) → the success note
   (`role="status"`) → **the identity block shows the NEW email** (the
   live store update) → the session SURVIVES (`/api/auth/me` 200 with
   the new email) → the OLD email login answers 401 "Invalid email or
   password" → the NEW email login answers 200 (the demo user is
   untouched by construction — the poisoned-record lesson designed out).

**Register/login budgets (counted, documented, AP-71-corrected):** the
suite's loopback register budget is 10/10 (parity-session9 2 +
s16-perf-parity 1 + s17-fresh-user 3 + auth-flows 3 + s24 1 = 10;
s25 already rides 192.0.2.25). TWO new registrations, both on DISTINCT
client IPs (192.0.2.26 for the 409 target, 192.0.2.27 for the fresh-user
journey) — behind a proxy distinct users have distinct IPs; the loopback
pile-up is the suite artifact; no production change, no prior pin
touched. 6 change-email POSTs on the demo user (all rejected pre-write —
well under the 10/15-min per-user budget) + 1 on the fresh user; no
other spec POSTs the route. ONE failed login probe (the old-email 401 —
successful logins RESET the IP limiter, so the login budget is
unaffected).

### S26-E (MEDIUM) — docs alignment

README (the Auth feature row's email-rotation clause, the
`/api/auth/change-email` API row, the badge + counts, the E2E notes' S26
pin family, the captures line, the Project Status session-26 row, the
file-hierarchy counts), AGENTS.md (the email-change contract in
Architecture facts + the capture commands + the counts), CLAUDE.md (the
contract + the S26 seam + the S26 pins + the counts), PAD (ADR-024 — the
account-identity rotation with the alternatives-rejected table: no
re-verification OTP / no old-address notification / no
admin/other-user change / no rate-limit pin / the route-side
must-differ+uniqueness placement; the test-distribution table to the new
count), SKILL.md (the counts badge; an AP entry only if a new lesson
lands), DEPLOYMENT.md §8.5 (the post-deploy email-change walkthrough +
the "sign in with the NEW address" note), `.env.example` audited
(unchanged — the route reads no env vars), this plan's execution log,
the session narrative + transcript, `worklog.md`.

---

## TDD order

1. **RED unit** — the changeEmailSchema pins (the absent schema —
   validation.test.ts fails to import it).
2. **RED e2e** — `tests/e2e/s26-change-email.spec.ts` (the route
   answers 404; the panel lacks the card).
3. **GREEN** — the schema → the route → the store action → the panel
   card. Rebuild.
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone
   Settings sweep; a live agent-browser mobile walkthrough (the S23/S24/
   S25 pattern).
6. Evidence captures via a committed `scripts/capture-s26-evidence.mjs`
   (the S24/S25 capture pattern): the API round-trip proof (the
   wrong-password/mismatched-confirm/short-password/same-email 400
   family + the 409 duplicate + the demo-still-signs-in pre-write proof
   + the anon 401 + the fresh-user change [register → verify → login →
   change → me 200 with the new email → old-email login 401 →
   new-email login 200] + the demo restore proof, as JSON) +
   dev-server screenshots of the remediated codebase (the Settings
   Profile tab with the Email address card — desktop light + DARK +
   mobile 390px + the success-note state) → `docs/screenshots/
   s26-*.png|json`. VLM verification via `scripts/vlm-verify-s26.mjs`.
7. Docs (S26-E) + the commit pattern + the SSH-wrapper push.

## Risks

- **The demo user's account** — the round-trip runs on a FRESH user by
  construction (the S17/S24/S25 pattern); the demo-user specs only
  exercise the rejection guards (pre-write) — the shared setup sign-in
  can never break mid-suite (the S4 poisoned-record lesson designed out).
- **The register budget** — the loopback budget is 10/10 (AP-71); BOTH
  new registrations ride DISTINCT client IPs (192.0.2.26/.27 — RFC 5737
  TEST-NET); `retries: 0` keeps everything deterministic.
- **The typo lockout** — the confirm-match refine (schema) + the
  must-differ and uniqueness guards (route) are the three guardrails; the
  e2e round-trip proves the old address STOPS working and the new one
  works (the semantics the user must understand before submitting).
- **The identity-block update** — the email rides the theme store's user
  slice; the new `setEmail` action keeps the block live without a reload
  (pinned in the e2e round-trip: the NEW email renders in the identity
  block).
- **Radix tab panes UNMOUNT inactive panes** (the S14 quirk) — the spec
  clicks the Profile tab before reading pane-scoped DOM (the S24/S25
  pattern).
- **getByLabel substring matching** (the S24 lesson) — "New email" also
  matches "Confirm new email": `exact: true` on the field locators.

---

## Execution log (session-47 workspace run)

- **RED observed (both layers, exactly as designed):** the unit layer
  failed to import the absent `changeEmailSchema` export (5 failures,
  the 248 existing pins untouched); all 7 chromium e2e specs failed
  against the pre-change build (the route answered 404; the panel
  lacked the card) — the setup project passed on arrival by design.
- **GREEN — zero implementation iterations:**
  1. `src/lib/validation.ts` — `changeEmailSchema` (the register
     family's min-8/max-200 policy on the password + the email shape
     everywhere + the confirm-match refine whose message IS the
     actionable copy + strip mode). 5/5 unit pins green first-try.
  2. `src/app/api/auth/change-email/route.ts` — the route (auth → the
     S14 rate limit → the schema → the pre-write password verification
     → the must-differ guard → the uniqueness guard → the ONE write →
     the untouched session cookie + the `{ ok, email }` response).
  3. `src/lib/store.ts` — the `setEmail` action (the setAvatar
     pattern; the theme store's user slice).
  4. `src/components/views/settings-view.tsx` — the Email address card
     (additive-below the main Profile card, ABOVE the S24 card: the
     natural account order identity → security → destructive exit; the
     always-visible form, the client-side pre-checks, role="alert"
     errors, the role="status" success note + the live identity-block
     update through setEmail; NO new CSS — zero Tailwind v4 surface).
  5. Live dev-server sanity probes (throwaway, deleted after): the
     guard family (the anon 401, the wrong-password/mismatched/same-
     email/short-password 400s with the exact copies, the demo
     still signing in) + the full terminal round-trip (register →
     verify → login → change 200 → me 200 with the NEW email → the
     old-email login 401 → the new-email login 200 → cleanup) + the
     panel probe (the card renders in the right order [Profile 182 <
     Email 738 < ChangePw 1135 < Danger 1475 y-coordinates], the early
     inline error, the success note, the identity block showing the
     new email, the fields cleared, mobile 390px no overflow) — all
     GREEN.
- **ONE honest full-regression iteration:** the first cold-db full e2e
  run failed ONLY the fresh-user journey at the identity-block pin — a
  STRICT-MODE violation: the page-wide `locator("p", { hasText:
  newEmail })` resolved to TWO elements (the Profile tab's identity
  block AND the sidebar footer's user line — the email slice renders
  on BOTH surfaces; the live store update drives both). The fix pins
  BOTH surfaces with scoped locators (`getByRole("tabpanel", { name:
  "Profile" })` + `getByRole("complementary")`) — a STRONGER pin, not
  a weaker one. No production change. Re-run GREEN.
- **Full gate GREEN:** lint ✓ tsc ✓ **258 unit ✓** (253 + 5) build ✓
  **291 e2e ✓** (cold `db/e2e.db`, 4.4 min — the 284 prior pins
  untouched) = **549 tests green** (258 unit + 290 chromium + the 1
  setup). The authoritative count breakdown via `playwright test
  --list` (291 tests in 28 files) + the vitest per-file listing (17
  unit files); the PAD's test-distribution table updated to 45 files
  exactly.
- **Verification re-runs GREEN:** the standing drawer check (all six
  checks true, both apps); the clone Settings sweep parity ✓; a live
  agent-browser mobile walkthrough at 390×844 (the drawer opens as a
  dialog with all 20 links; the Settings → Profile tab renders the
  Email address card with its three fields + the Update button, the
  S24/S25 cards still rendering; no horizontal overflow).
- **Evidence captured** (`scripts/capture-s26-evidence.mjs`,
  committed): `s26-change-email-evidence.json` (the guard family
  [wrong-password / mismatched-confirm / short-password / same-email
  → the exact 400 copies; the duplicate-email 409] + the
  demo-still-signs-in pre-write proof + the anon 401 + the fresh-user
  rotation [registered 201 → verified login 200 → change 200 → the
  DB-LEVEL check through Prisma: newAddressResolves, sameAccountId,
  emailVerifiedStillTrue, oldAddressGone → me 200 with the new email
  → the old-email login 401 → the new-email login 200 → the cleanup
  delete 200] + the screenshot chrome reads [light + DARK through the
  production loadFromUser path + mobile no-overflow, every field
  present] + the success-state chrome [the note, the live
  identity-block update, the demo restore login 200]). VLM-verified:
  all four PASS via `scripts/vlm-verify-s26.mjs` (the dev server was
  restarted cleanly by PID first — the AP-70 lesson — so the in-memory
  limiter was fresh for the captures).
- **Docs aligned:** README (badge 549, the Auth feature row's
  email-rotation clause, the `/api/auth/change-email` API row, counts
  258/291, the vitest seam list, the E2E notes' S26 pin family, the
  captures line, the Project Status session-26 row, the file-hierarchy
  counts), AGENTS (the email-change contract in Architecture facts + 2
  capture commands + the counts), CLAUDE (the email-change contract +
  the S26 seam in the unit list + the S26 pins in the e2e list + the
  counts), PAD (ADR-024 with the alternatives-rejected table; the
  test-distribution table to 549 = 258 unit + 290 chromium + the 1
  setup — the "Unit — pure seams" row to 214 tests, the S26 row, the
  Total to 45 files, the pre-push checklist counts 258+/290+), SKILL
  (the 549 badge), DEPLOYMENT.md §8.5 (the post-deploy email-change
  walkthrough + the sign-in-with-the-new-address note). `.env.example`
  audited — unchanged (the route reads no env vars).
