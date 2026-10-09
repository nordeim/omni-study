# Remediation Plan — Session 25 (S25): the account-deletion flow (the ownership exit)

**Audit surfaces (this session, session-44 workspace run at `98a389e`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
249 unit ✓ against the S24 codebase; `bun run build` ✓; the cold-`db/e2e.db`
full e2e regression **279 ✓ (4.4 min)** = the documented **528-green** state
re-confirmed on arrival), the mobile-drawer check on BOTH apps (backdrop
`oklab(0 0 0/0.2)`+blur(4px), 288px white panel, 20 links, no footer,
Escape-close superset — the brief's priority item — **the mobile navigation
menu is working as expected**), the reference re-sweep (login → dashboard →
the five-tab Settings sweep, robust waits — the reference's slow first paint
documented): **the reference is UNCHANGED since S19–S24** (the zero-data
account 0/0, school "Lincoln High", Daily Study Goal: 4 hours, Account
created 9/28/2026, the Notifications master toggle, 20 nav views in the same
order, the branding split stable), the clone-side Settings sweep parity ✓
(incl. the S24 Change password card rendering below the pinned surfaces),
and the S24 code audit (the recent changes: the `changePasswordSchema` seam,
the `POST /api/auth/change-password` route, the panel's Change password
card, the specs — reviewed line-by-line) — **CLEAN**. The test configs +
`DATABASE_URL="file:../db/custom.db"` + `.env.example` verified current.
Docker re-verified unavailable in the sandbox; the first real
`docker compose --profile init up` stays the owner's documented step
(DEPLOYMENT.md §8). The scandihaven reference repo re-reviewed — unchanged
since 10-04 (top commit `d4789c3`); no new patterns to adopt.

## The governing decision (this session's work)

With the parity backlog empty (the reference unchanged) and the audit
backlog empty (S24 clean), the standing superset goal governed. This
session's production-readiness sweep (the S22/S24 pattern) found **ONE
genuine user-facing gap**: **a signed-in user cannot delete their own
account.** The ownership story is otherwise complete — the owner can take
every byte OUT (S21 export), bring it back IN (S23 import), and rotate the
password (S24) — but the final ownership gesture, **leaving**, requires raw
SQLite surgery (`rm db/custom.db` wipes EVERYONE; hand-deleting one user's
22 content collections is unreasonable). A self-hosted owner closing a
household account, a parent removing a graduated student's account, or a
user exercising data-erasure expectations has no in-app path.

Verified this session (scratch probe, deleted after): the reference's
Settings has **ZERO account-deletion surfaces** across all five tabs (no
delete/close/remove/erase affordance, no danger zone — the Base44 platform
handles accounts outside the app). So this is a **pure superset feature** —
the clone being a functional superset is the standing goal — and the
natural completion of the account arc: S15 shipped the reference's full
account journey, S24 added the clone's own account-security rotation, S25
adds the clone's own ownership exit (the right-to-erasure).

### The semantics (tight scope, resolved by design)

- **Password proof required.** The route verifies the stored scrypt hash
  first — a stolen session cookie cannot erase the account silently (the
  same posture as S24's rotation; the 30-day stateless session is the
  wider window, the password proof narrows THIS surface to the account
  owner).
- **Typed confirmation required.** The UI and the schema both require the
  word `DELETE` (the confirmation refine lives IN the Zod schema — the
  pure seam, unit-pinned; a bare password-proof delete would make an
  accidental Enter-key press irreversible).
- **ONE cascade write.** `db.user.delete({ where: { id } })` — the schema's
  own `onDelete: Cascade` on **all 22 user relations** (verified by grep —
  every `user User @relation` carries Cascade) wipes the complete data
  footprint in one statement: subjects, lists, tasks, assignments, exams,
  events, timetable, notebooks, notes, decks+cards, practice tests,
  groups, grades, focus sessions, folders+files, chat, calc history,
  holidays, RUM events, and both token families. No hand-enumerated
  deleteMany chain to drift from the schema.
- **The session dies with the account.** The route clears the cookie
  (maxAge: 0 — the logout route's exact mechanism); a surviving cookie is
  doubly dead (the HMAC validates but the user id no longer resolves —
  `/api/auth/me` 401s).
- **Errors render INLINE** (`role="alert"` — the S15 auth convention:
  auth errors never render as toasts). Success never renders — the client
  redirects to `/login` (the logout pattern: clear the theme cache +
  `window.location.replace`).
- **Route name**: `POST /api/auth/delete-account` — the auth family's
  verb-noun convention (login, logout, change-password, forgot-password…);
  a DELETE-method + body request would be the odd one out in the family.

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase. The
   Danger zone card adds ZERO chrome to any parity-pinned surface (the
   Profile tab's pinned surfaces — the "Your account and study
   information" header, the avatar + identity block, Display name / School
   Name / Grade Level / Daily Study Goal, Save Profile + Sign out, the
   Account-created line — stay byte-identical; the S24 Change password
   card stays byte-identical; the new card is a purely additive sf-card
   BELOW both, the S23/S24 additive-below pattern).
2. **No soft-delete / grace period** — a recycle bin is a product of its
   own; the owner who wants a safety net exports first (S21 — the /export
   page is one nav away and the card's copy points there).
3. **No export-before-delete integration** (no auto-download) — a surprise
   500 KB JSON download mid-confirm is worse than the documented pointer;
   the warning copy names the exit.
4. **No email notification on deletion** — there is no SMTP by design (the
   S15 trade-off); the immediate redirect is the acknowledgment.
5. **No rate-limit e2e pin** — the route reuses the pinned
   `checkRateLimit` seam (the S14 family); an exhaustion pin would poison
   the route budget for the other S25 specs (the C1 pattern, documented).
6. **No admin/other-user deletion** — there is no admin surface in the
   product (single-owner households); deleting ANOTHER user is raw-DB
   territory by design.
7. **The Docker real-run** remains the owner's step (no daemon here).

---

## Families and fixes

### S25-A (HIGH) — the schema seam (`src/lib/validation.ts`)

`deleteAccountSchema` — the pure, unit-pinned validation (the
login/register/reset/change family pattern):

```ts
export const deleteAccountSchema = z
  .object({
    password: z.string().min(8).max(200),
    confirmation: z.string(),
  })
  .refine((v) => v.confirmation === "DELETE", {
    message: "Type DELETE to confirm.",
  });
```

One policy with the register family (min 8 / max 200 on the password —
every password in the system is min-8 by construction), plus the typed
confirmation rule at the seam (the refine rides the object, so the route's
`safeParse` failure message IS the actionable copy).

### S25-B (HIGH) — the route (`POST /api/auth/delete-account`)

`src/app/api/auth/delete-account/route.ts` (the change-password route
pattern — auth conventions, one operation, clear JSON errors):

- `requireUser()` (401 JSON for anonymous callers — `UnauthorizedError`
  through `errorResponse`, the API-route convention), then
  `checkRateLimit(`delAcc:${user.id}`, 10)` (the S14 seam's default
  budget — a rare, terminal write; 429 + `Retry-After`).
- Body → `deleteAccountSchema.safeParse` → failure → 400 with the FIRST
  issue's message (the confirmation refine copy surfaces verbatim; a
  missing/short password gets the family's standard wording).
- `db.user.findUnique({ where: { id: user.id }, select: { passwordHash } })`
  (getCurrentUser deliberately never reads the hash — the route reads it
  itself), `verifyPassword(password, hash)` → failure → 400
  **"Your password is incorrect."** (the caller is the authenticated
  account owner — no enumeration surface; the guard runs BEFORE any
  write).
- `db.user.delete({ where: { id: user.id } })` — the ONE cascade write.
- The session cookie CLEARED (`SESSION_COOKIE`, maxAge: 0 — the logout
  route's exact flags: httpOnly, lax, secure-in-prod, path "/").
- Success → `{ ok: true }` (the panel redirects; the account is gone).

### S25-C (MEDIUM) — the Profile tab extension (`src/components/views/settings-view.tsx`)

A third `sf-card` (the additive-below pattern — max-w-lg, BELOW the S24
Change password card, inside the same TabsContent):

- `section[aria-label="Danger zone"]`: the h3 header ("Danger zone", the
  tab's own `text-[15px] font-semibold` pattern), the warning copy
  ("Permanently delete your account and all your data — subjects, tasks,
  notes, flashcards, grades, files. This cannot be undone." + the
  export-first pointer: "To keep a copy, download your data from the
  Export page first."), and a "Delete account…" outline button with red
  text (the Sign out button's pattern).
- Clicking it reveals the confirmation form (the two-step reveal — a
  always-visible delete form is an accident waiting for an Enter key):
  Password (`Input type="password"`, `autoComplete="current-password"`)
  + Confirmation (`Input`, placeholder "Type DELETE", `autoComplete="off"`,
  `spellCheck={false}`) + "Permanently delete my account"
  (`variant="destructive"` — the shadcn destructive token, red-600-family
  in both modes) + a Cancel outline button that re-hides the form.
- Client-side pre-checks (the S24 pattern): all-filled + the confirmation
  word (`DELETE` — case-exact, the early inline error, no request).
- The POST rides `apiSend("POST", "/api/auth/delete-account", {...})`; on
  success: clear the theme cache (`THEME_CACHE_KEY` — the logout
  pattern) + `window.location.replace("/login")`.
- Errors inline as `role="alert"`; NO success note (the redirect is the
  feedback); busy state disables the buttons. Standard utilities only, the
  sf-card pattern, dark-mode via the existing `.dark` contract — NO new
  CSS (zero Tailwind v4 surface). Responsive to 390px. ZERO nav linkage
  (the shell stays 20 links).

### S25-D (MEDIUM) — the pins

**Unit (`tests/validation.test.ts`, the schema-family pattern):**
- accepts a valid pair (password + "DELETE");
- rejects a missing/short(<8)/long(>200) password;
- rejects a wrong confirmation word ("delete" lowercase / "REMOVE" /
  empty) with the refine copy verbatim (case-exact).

**E2E (`tests/e2e/s25-delete-account.spec.ts`, the S24 conventions —
demo-user storageState where possible, ONE fresh registration for the
terminal journey):**
1. **The anon gate:** POST without a session → 401 JSON (the AP-67
   explicit empty storageState).
2. **The wrong-password rejection:** the demo user POSTs a wrong password
   (+ "DELETE") → 400 + "Your password is incorrect." — the guard runs
   before any write: the demo user still signs in with the original
   password afterwards (the pre-write proof, the S24 pattern).
3. **The wrong-confirmation rejection:** the correct password + a wrong
   word → 400 with the refine copy ("Type DELETE to confirm.") — a
   half-confirmed delete never lands.
4. **The validation family:** a short password → 400 (the register
   policy, min 8 — ONE policy, no drift).
5. **The full deletion journey (the fresh-user round-trip — the S17/S24
   ONE-registration convention):** register `s25-<salt>@e2e.test` → verify
   (the surfaced code) → sign in through the login UI → the Settings
   Profile tab renders the pinned surfaces + the S24 Change password card
   + the Danger zone card BELOW them → click "Delete account…" → the form
   reveals → a wrong confirmation word → the early inline error
   (`role="alert"`) → the correct password + "DELETE" → submit → the
   redirect lands on `/login` → the OLD credentials login answers 401
   "Invalid email or password" (the account is GONE — the uniform login
   error, no enumeration signal) → the (cleared) session's `/api/auth/me`
   answers 401. The demo user is untouched by construction (the terminal
   journey runs on the fresh user — the poisoned-record lesson designed
   out).

**Register/login budgets (counted, documented):** ONE fresh registration
(the suite's existing ~9 + 1 = 10/10 — EXACTLY the register limiter's cap,
`retries: 0` makes it deterministic; no other spec registers beyond the
existing ~9); 4 delete-account POSTs (3 on the demo user — all rejected
pre-write — + 1 on the fresh user; well under the 10/15-min per-user
budget; no other spec POSTs the route); ONE failed login probe
(post-deletion 401 — successful logins RESET the IP limiter, so the login
budget is unaffected).

### S25-E (MEDIUM) — docs alignment

README (the Auth feature row's deletion clause; the
`/api/auth/delete-account` API row; the badge + counts; the E2E notes'
S25 pin family; the captures line; the Project Status session-25 row),
AGENTS.md (the account-deletion contract in Architecture facts + the
capture commands + the counts), CLAUDE.md (the contract + the S25 seam +
the S25 pins + the counts), PAD (ADR-023 — the ownership-exit contract
with the alternatives-rejected table: no soft-delete/grace period / no
auto-export integration / no email notification / no other-user deletion /
no rate-limit pin; the test-distribution table to the new count), SKILL.md
(the counts badge; an AP entry if lessons land), DEPLOYMENT.md §8.4 (the
post-deploy account-deletion walkthrough), `.env.example` audited
(unchanged — the route reads no env vars), this plan's execution log, the
session narrative + transcript, `worklog.md`.

---

## TDD order

1. **RED unit** — the deleteAccountSchema pins (the absent schema —
   validation.test.ts fails to import it).
2. **RED e2e** — `tests/e2e/s25-delete-account.spec.ts` (the route
   answers 404; the panel lacks the card).
3. **GREEN** — the schema → the route → the panel card. Rebuild.
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone Settings
   sweep; a live agent-browser mobile walkthrough (the S23/S24 pattern).
6. Evidence captures via a committed `scripts/capture-s25-evidence.mjs`
   (the S22/S23/S24 pattern): the API round-trip proof (the
   wrong-password/wrong-confirmation/short-password 400 family + the
   demo-still-signs-in pre-write proof + the anon 401 + the fresh-user
   deletion [register → verify → login → create content → delete → the
   content CASCADE-verified gone at the DB level via Prisma → login 401 →
   me 401] + the demo restore proof, as JSON) + dev-server screenshots of
   the remediated codebase (the Settings Profile tab with the Danger zone
   card — desktop light + DARK + mobile 390px + the revealed
   confirmation-form state) → `docs/screenshots/s25-*.png|json`.
7. Docs (S25-E) + the commit pattern + the SSH-wrapper push.

## Risks

- **The demo user's account** — the terminal journey runs on a FRESH user
  by construction (the S17/S24 pattern); the demo-user specs only
  exercise the rejection guards (pre-write) — the shared setup sign-in
  can never break mid-suite (the S4 poisoned-record lesson designed out).
- **The register budget is EXACTLY at the cap** (10/10) — `retries: 0`
  keeps it deterministic; if a future session adds another registering
  spec, one must be consolidated first (documented here for the next
  auditor).
- **The cascade completeness** — verified by grep this session (all 22
  user relations Cascade) AND pinned empirically in the evidence capture
  (content rows exist → delete → rows gone, queried through Prisma
  directly — not through any app route).
- **The redirect race** — the deletion response clears the cookie
  server-side; the client's `window.location.replace("/login")` rides the
  Set-Cookie applied by the fetch (same-origin credentials) — the
  /api/auth/me 401 pin proves the cookie actually died.
- **Irreversibility UX** — the two-step reveal + the typed word + the
  export-first pointer + `variant="destructive"` are the four guardrails;
  a confirm Dialog would add a fifth but the inline reveal is the S23/S24
  card pattern (one less overlay family on a pinned surface).
- **Timing-safe comparison** — `verifyPassword` already uses
  `timingSafeEqual` (the existing seam; no new crypto).

---

## Execution log (session-44 workspace run)

- **RED observed (both layers, exactly as designed):** the unit layer
  failed to import the absent `deleteAccountSchema` export (4 failures,
  39 existing pins untouched); all 5 chromium e2e specs failed against
  the pre-change build (the route answered 404; the panel lacked the
  card) — the setup project passed on arrival by design. Two spec bugs
  caught and fixed BEFORE the run: a getByLabel/placeholder mismatch
  (the label is "Confirmation"; the placeholder is "Type DELETE") and
  the ellipsis-character mismatch (the button renders U+2026 — the
  regex needed the literal character, not three escaped dots).
- **GREEN — zero implementation iterations:**
  1. `src/lib/validation.ts` — `deleteAccountSchema` (the register
     family's min-8/max-200 policy on the password + the
     typed-confirmation refine [case-exact DELETE] whose message IS
     the actionable copy + strip mode). 4/4 unit pins green
     first-try.
  2. `src/app/api/auth/delete-account/route.ts` — the route (auth →
     the S14 rate limit → the schema → the pre-write password
     verification → the ONE cascade write → the cookie cleared).
  3. `src/components/views/settings-view.tsx` — the Danger zone card
     (additive-below the S24 Change password card; the two-step
     reveal; the client-side pre-checks; role="alert" errors; NO
     success note — the redirect IS the feedback; NO new CSS — zero
     Tailwind v4 surface).
  4. Live dev-server sanity probes (throwaway): the guard family (400s
     with the exact copies), the full terminal round-trip on a
     throwaway account (register → verify → login → content created →
     delete 200 + cookie cleared → the CASCADE verified at the DB
     level through Prisma [user gone, every row gone 0/0/0] → the
     old-credentials login 401 → me with the old cookie 401), the
     panel probe (the card renders below the pinned surfaces + the
     S24 card; the two-step reveal; the early inline error; the
     Cancel re-hide) — all GREEN. An earlier crashed probe run's
     leftover rows investigated and cleaned (the cascade itself was
     never at fault — the leftovers belonged to a user whose script
     died before its delete call).
- **ONE honest full-regression iteration (AP-71):** the first
  cold-db full e2e run failed ONLY the fresh-user journey (register
  429) while the spec passed in isolation — the suite's register
  budget was ALREADY 10/10 before S25 (the corrected count: S9
  registers 2, not 1, and s16-perf-parity registers 1 through the UI
  — the S24-documented ~8+1=9 was off by two). Fixed by having the
  spec's register/verify POSTs ride a DISTINCT client IP
  (`x-forwarded-for: 192.0.2.25` — the RFC 5737 TEST-NET range):
  behind a proxy distinct users have distinct IPs, the loopback
  pile-up is the suite artifact, no production change, no prior pin
  touched, the limiter logic itself stays pinned by the existing 429
  specs. Re-run GREEN.
- **Full gate GREEN:** lint ✓ tsc ✓ **253 unit ✓** (249 + 4) build ✓
  **284 e2e ✓** (cold `db/e2e.db`, 4.4 min — the 279 prior pins
  untouched) = **537 tests green** (253 unit + 283 chromium + the 1
  setup). The authoritative count breakdown via `playwright test
  --list` + the vitest per-file listing; the PAD's test-distribution
  table re-reconciled to EXACT (44 files — the prior session's
  40-file total was itself a reconciliation drift, now corrected).
- **Verification re-runs GREEN:** the standing drawer check (all six
  checks true, both apps); the clone Settings sweep parity ✓; a live
  agent-browser mobile walkthrough at 390×844 (the app bar + clock
  render; the drawer opens as a dialog with all 20 links; the
  Flashcards link navigates; the drawer closes; the Settings Profile
  tab renders the Danger zone card below the S24 card; the two-step
  reveal works; no horizontal overflow — scrollWidth 390).
- **Evidence captured** (`scripts/capture-s25-evidence.mjs`,
  committed): `s25-delete-account-evidence.json` (the guard family
  [wrong-password / wrong-confirmation / short-password → the exact
  400 copies] + the demo-still-signs-in pre-write proof + the anon
  401 + the fresh-user deletion [registered 201 → verified login 200
  → content created 1/1/1 → delete 200 with the cookie cleared → the
  CASCADE verified at the DB level through Prisma directly: userGone
  true, every content count 0 → the old-credentials login 401
  "Invalid email or password" → the cleared session's me 401] + the
  screenshot chrome reads [light + DARK via the production
  loadFromUser path + mobile no-overflow] + the revealed-form chrome +
  the cancelledFormHidden + the demo-intact login 200) + four
  dev-server screenshots (the Settings Profile tab with the Danger
  zone card — desktop light + DARK + mobile 390px, and the revealed
  confirmation-form state). VLM-verified: all four PASS via
  `scripts/vlm-verify-s25.mjs`. The dev server was restarted cleanly
  by PID first (the AP-70 lesson) so the in-memory limiter was fresh
  for the captures.
- **Docs aligned:** README (badge 537, the Auth feature row's deletion
  clause, the `/api/auth/delete-account` API row, counts 253/284, the
  vitest seam list, the E2E notes' S25 pin family, the captures line,
  the Project Status session-25 row, the file-hierarchy counts),
  AGENTS (the account-deletion contract in Architecture facts + 2
  capture commands + the counts), CLAUDE (the account-deletion
  contract + the S25 seam in the unit list + the S25 pins in the e2e
  list + the counts), PAD (ADR-023 with the alternatives-rejected
  table; the test-distribution table to 537 = 253 unit + 283 chromium
  + the 1 setup — the "Unit — pure seams" row to 15 files / 209
  tests, the Total re-reconciled to 44 files exactly, the pre-push
  checklist counts 253+/283+), SKILL (the 537 badge + AP-71),
  DEPLOYMENT.md §8.4 (the post-deploy deletion walkthrough). `.env.example`
  audited — unchanged (the route reads no env vars).
