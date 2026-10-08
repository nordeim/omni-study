# Session-15 Remediation Plan — Auth-Flow Depth, Calculator Keyboard Superset, Hygiene

**Audit surfaces (from `docs/session_20.md`'s suggested next batch):** login/registration
UX depth (password toggle, inline validation states, forgot-password flow shape),
Files-view search scope parity, keyboard-command depth (calculator/AI composer
beyond Enter-to-send), and a pre-1.0 sweep (dependency audit, bundle budget,
long-task check) — plus the standing mobile-drawer priority check.

**Status: EXECUTING** — the audit phase completed with the reference ground
truth re-probed fresh (`scripts/ref-auth-probe-s15.mjs` +
`scripts/ref-alert-position-probe.mjs`; JSON in `/tmp/s15-ref-auth-probe.json`).

---

## 1. Audit findings

### Real gaps (fix this session)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| **A1** | HIGH | Login errors render as toasts; the reference renders them **inline** in the form: a shadcn-Alert-shaped `role="alert"` div (`relative w-full border p-4 … text-foreground bg-red-50/70 border-red-200 rounded-xl`, 54px tall) sitting between the **Password field and the Sign in button** (20px gaps from the form's `space-y-4 sm:space-y-5`). Copy: `Invalid email or password` — **no trailing period** (the clone's toast copy has one). | ref-alert-position-probe.mjs; wrong-password + unverified-login DOM captures |
| **A2** | HIGH | "Forgot password?" is a toast dead-end; the reference has a real **3-state in-page flow**: (1) "Reset your password" (h2 24px/700, Back→h2 gap 16px, copy "Enter your email and we'll send you a link to reset your password", Email field 44px, "Send reset link" submit, "Back to sign in"); (2) "Check your email" (h2, the submitted email, a **green** Alert `bg-green-50/70 border-green-200 rounded-xl` — "Please check your email for the password reset link. It may take a few minutes to arrive.", full-width "Back to sign in" `type=submit`); (3) an unprobed email-link reset screen. Backend endpoint observed: `POST /auth/reset-password-request`. | ref-auth-probe-s15.mjs states `forgot` / `forgotCheckEmail` + network log |
| **A3** | HIGH | "Sign up" only fills demo credentials; the reference opens a real **"Create your account"** form (h2 24px/700, Back→h2 gap 8px, Email + Password ("Min. 8 characters") + **Confirm Password** ("Re-enter password"), 44px inputs, "Create account" submit) whose registration lands on a **"Verify your email"** 6-digit OTP screen (h2 24px/700, Back→h2 gap **96px**, "Enter the verification code sent to your email" + the address, six 40×44px `rounded-lg border-input bg-background` boxes `inputMode=numeric` (first: `autocomplete=one-time-code`), "Verify email" submit + "Resend" link). The clone HAS `/api/auth/register` but it auto-logs-in with zero verification — the email is never proven and the UI never reaches it. Duplicate register on the reference **re-enters the verify screen** (platform re-sends). Unverified login is gated with an inline red Alert: "Please verify your email before logging in. Check your email for the verification code." | ref-auth-probe-s15.mjs states `signup` / `verify` / `duplicateRegister` / `loginUnverified` |
| **E1** | ~~MEDIUM~~ **PHANTOM (resolved in execution)** | `src/components/views/calculator-view.tsx:301` APPEARED to read `const istoryOpen, setHistoryOpen] = React.useState(false);` — a missing opening `[`. Execution falsified it: some tool outputs swallow the `[` following `const ` (both this and the prior session read that artifact); the codepoint dump, the git diff, and clean lint/tsc all show the file was ALWAYS correct. No fix landed — see the execution log and AP-61. | codepoint inspection (`0x5b` present) + `git diff` (line unchanged from HEAD) |
| **C0** | LOW | The clone's calculator ignores the physical keyboard — click-only. The **reference also ignores it** (parity, verified), so this is not a parity gap; but the clone's mandate is a functional **superset**: a guarded physical-key listener (digits/operators/Enter/Backspace/Escape) is the natural superset feature. | reference calculator key test (prior session log) + S15 keyboard audit |

### Verified non-gaps (documented, no action)

| ID | Verdict | Evidence |
|----|---------|----------|
| **B1** | Files search scope is **folder-scoped on BOTH apps** — reference search from root does NOT find in-folder files; the positive case (search inside the folder) finds them. The clone's `files-view.tsx` filters `parentId === currentFolderId` (folders AND files) before the name match — same semantics. | reference both-directions test (prior session log); clone code `src/components/views/files-view.tsx:132–140` |
| **C1** | No global keyboard shortcuts on the reference; AI-composer Enter-to-send is parity on both. The calculator keyboard superset is tracked as C0 above. | reference probes (prior session log) |
| **D1** | Pre-1.0 preflight GREEN: runtime deps pinned deliberately (majors across the board — Next 16.4/React 19/Tailwind 4 era pins), 19 runtime deps (lean), ~1.2 MB client static bundle, zero long tasks under `data-volume-audit`. Re-verified this session: `bun pm ls` clean, no advisories in the lockfile graph, build size unchanged. | pre-1.0 sweep (prior session log + this session's re-run) |
| **—** | Reference file/folder deletion has **no confirmation dialog** — the clone matches (parity). | reference probe (prior session log) |
| **—** | Mobile drawer standing check: **GREEN** (S14) — re-run after remediation. | `scripts/drawer-check-s14.mjs` |

### Design decisions (documented, self-hosted context)

- **No SMTP exists in this app.** The reference's verification code and reset
  link arrive by platform email. The self-hosted clone surfaces them **to the
  actor themselves** (the register/forgot response JSON carries `code` /
  `resetUrl`, and the verify/check-email screens show a muted "Self-hosted
  note" below the parity content — the same additive pattern as the login
  card's demo-account hint). Without this the flows would be dead ends —
  unusable, not "secure". Trade-off: email verification proves nothing beyond
  self-consistency in the no-SMTP context, and `resetUrl` presence signals
  account existence — the register route ALREADY returns a 409 for existing
  accounts (documented), and the app's threat model is single-user
  self-hosted. Recorded in PAD ADR-013.
- **Unverified duplicates re-send** (reference platform behavior): register
  with an existing-but-unverified email regenerates the code and returns the
  verify state. A verified duplicate keeps the 409.
- **Sub-screens replace the brand block** (no h1/logo, measured `hasH1=false`)
  but keep the 448px card chrome and the top strip.
- **The reference's own title reads "AcademiaFlow (Copy)"** — the clone keeps
  its pinned "Welcome to StudyFlow" brand identity (documented since S4).

---

## 2. Fix design (file-by-file, validated against the codebase)

| # | File | Change |
|---|------|--------|
| 1 | `prisma/schema.prisma` | `User.emailVerified Boolean @default(false)` + `verificationTokens VerificationToken[]` / `passwordResetTokens PasswordResetToken[]` relations; new models `VerificationToken` (userId, code 6-digit, expiresAt 15 min) and `PasswordResetToken` (userId, token 48-hex, expiresAt 30 min), both `onDelete: Cascade`. |
| 2 | `prisma/seed.ts` | Create the demo user with `emailVerified: true`; in the already-present branch, `update` it to `emailVerified: true` (idempotent upgrade for pre-S15 databases — otherwise the login gate would lock the demo account out of every existing db). |
| 3 | `src/lib/auth.ts` | New pure seams: `generateVerificationCode()` (crypto-random 6-digit, leading zeros allowed), `generateResetToken()` (24-byte hex), `normalizeVerificationCode(input)` (tolerates pasted spaces/dashes; returns null for non-digit garbage). |
| 4 | `src/lib/validation.ts` | New schemas: `verifyEmailSchema` (email + `^\d{6}$` code), `forgotPasswordSchema` (email), `resetPasswordSchema` (48-hex token + password ≥ 8). `registerSchema` unchanged. |
| 5 | `src/lib/calculator.ts` | New pure seam `mapPhysicalKey(key: string): string \| null` — digits/`.`/`(`/`)`/`%`/`^` pass through, `*`→`×`, `/`→`÷` (keypad glyph parity; the tokenizer normalizes back), `Enter`/`=`→`=`, `Backspace`→`⌫`, `Escape`→`C`, everything else `null`. |
| 6 | `src/app/api/auth/register/route.ts` | Rework: NO session cookie; create unverified user + starter subjects + VerificationToken (15 min). Response `201 { ok, email, code }`. Existing unverified email → regenerate code, same 201 (platform re-send behavior). Existing verified email → 409 (unchanged copy). Rate limit unchanged (`register:${ip}`). |
| 7 | `src/app/api/auth/verify-email/route.ts` | NEW: `{ email, code }` → latest unexpired token for the user; `normalizeVerificationCode` the input; match → `emailVerified: true`, delete the family's tokens, set the session cookie, `200 { user }`. No match/expired → 400 "Invalid verification code". |
| 8 | `src/app/api/auth/resend-verification/route.ts` | NEW: `{ email }` → regenerate the code for an existing UNVERIFIED user (`200 { ok, code }`); unknown/verified → uniform `200 { ok: true }` (no enumeration, nothing leaks). Rate-limited (`verify:${ip}`). |
| 9 | `src/app/api/auth/login/route.ts` | After password verification (so the gate never becomes an enumeration oracle): `!user.emailVerified` → 403 with the reference copy "Please verify your email before logging in. Check your email for the verification code." Invalid-credentials copy loses the trailing period ("Invalid email or password"). |
| 10 | `src/app/api/auth/forgot-password/route.ts` | NEW: `{ email }` → always `200 { ok: true }`; when the account exists, create a PasswordResetToken (30 min) and include `resetUrl: "/login?token=<hex>"` (self-hosted delivery — decision above). Rate-limited (`forgot:${ip}`). |
| 11 | `src/app/api/auth/reset-password/route.ts` | NEW: `{ token, password }` → unexpired token lookup → update `passwordHash`, delete the family's tokens, `200 { ok: true }`. Invalid/expired → 400 "This reset link is invalid or has expired." |
| 12 | `src/app/login/page.tsx` | Full state machine: `signin` (existing parity form + inline Alert replacing the error toast; success toast + redirect unchanged) · `signup` · `verify` (OTP boxes with auto-advance + paste + Ref forwarding) · `forgot` · `check-email` (green Alert + full-width Back) · `reset` (superset: reached via `?token=`). Sub-screens: Back-to-sign-in link (ArrowLeft + text-sm slate-500), h2 24px/700, 44px inputs, per-state Back→h2 gaps (8/96/16px), reference placeholders ("Min. 8 characters", "Re-enter password"), muted self-hosted notes (code / reset link). Demo-credentials helper becomes a "Use demo account" link on the SIGN IN state only (it filled creds; the sub-screens have no room — and it keeps the e2e demo hint stable). |
| 13 | `src/components/views/calculator-view.tsx` | ~~E1 bracket restore~~ (phantom — see execution log) + guarded physical-keyboard listener: `React.useEffect` window keydown → skip when the target is INPUT/TEXTAREA/SELECT/contentEditable or a Radix dialog is open; `mapPhysicalKey` → `press()`/`submit()`. |
| 14 | `tests/auth.test.ts` | RED→GREEN unit pins for the three auth seams (8 tests). |
| 15 | `tests/calculator.test.ts` | RED→GREEN unit pins for `mapPhysicalKey` (4 tests). |
| 16 | `tests/validation.test.ts` | RED→GREEN unit pins for the three schemas (6 tests). |
| 17 | `tests/e2e/auth.spec.ts` | Update the wrong-password pin: inline `role=alert` copy/position (was the toast copy with a trailing period). |
| 18 | `tests/e2e/auth-flows.spec.ts` | NEW: signup→verify→login golden path (reads the code from the self-hosted note), unverified-login gate, forgot→check-email→reset-link→new-password→login, resend. StorageState opt-out like auth.spec.ts; unique per-run emails; login-budget-aware (≤ 4 real logins). |
| 19 | `tests/e2e/calculator.spec.ts` | Physical-keyboard pins (type/evaluate/backspace/clear + glyph mapping). |
| 20 | `scripts/auth-flow-audit-s15.mjs`, `scripts/keyboard-audit-s15.mjs`, `scripts/pre15-preflight.mjs` | Audit tools (run pre-fix for the record, re-run post-fix for GREEN evidence). |

**Schema push + client regen:** `bun run db:push` (Prisma client regenerates);
`bun run db:seed` upgrades the demo user in-place (idempotent).

---

## 3. TDD execution order

1. **RED unit** — `tests/auth.test.ts` (seams), `tests/calculator.test.ts`
   (key map), `tests/validation.test.ts` (schemas): 18 designed failures.
2. **GREEN unit** — `auth.ts` seams → `validation.ts` schemas →
   `calculator.ts` `mapPhysicalKey`. Prisma schema + push + seed upgrade.
3. **GREEN routes** — register rework → verify-email → resend-verification →
   login gate → forgot-password → reset-password.
4. **GREEN UI** — login page state machine (all six states + inline alerts),
   calculator listener + E1 restore.
5. **RED→GREEN e2e** — `auth-flows.spec.ts` + calculator keyboard pins +
   updated `auth.spec.ts`; then the FULL suite (363 prior + new).
6. **Verification** — re-run the three S15 audits + the standing drawer check;
   evidence screenshots; VLM spot-check (hypothesis-only discipline).
7. **Docs** — README / AGENTS / CLAUDE / PAD (ADR-013) / SKILL (AP-59..61) /
   this plan's execution log; session narrative; worklog.

**Risks & mitigations.** (a) The login-gate could lock out pre-S15 databases —
mitigated by the seed's idempotent upgrade + a one-off migration note in the
plan. (b) The auth.spec toast pin breaks — updated in the same change (the
AGENTS rule). (c) e2e login rate budget (10/IP/15 min): the new spec uses at
most 4 real logins (signup-verify cookie set is NOT a login; gate test 1;
reset test 1; plus the file-level storageState opt-out keeps the shared
session intact). (d) The OTP Ref forwarding requires `Input` to forward refs
— verified (`src/components/ui/input.tsx` uses `React.forwardRef`). (e) The
`?token=` reset deep-link must survive the login page's client-only render —
`useSearchParams` inside a ` Suspense` boundary or `window.location.search`
read in an effect (chosen: effect read — no RSC suspense restructuring).

---

## 4. Execution log

*(appended after completion — see the tail of this file)*

---

## 5. Execution log (completed)

**Reference ground truth (re-probed fresh this session).**
`scripts/ref-auth-probe-s15.mjs` (+ `ref-alert-position-probe.mjs`,
`ref-subscreen-geo-probe.mjs`, two throwaway micro-probes) captured every
state: the login error alert (shadcn-Alert shape, `bg-red-50/70
border-red-200 rounded-xl p-4`, 54px, between Password and Sign in, copy
"Invalid email or password" — no trailing period), the signup form (h2
24px/700, Back→h2 8px, 44px inputs, Email/Password "Min. 8
characters"/Confirm "Re-enter password", `h-10 sm:h-11 bg-slate-900
shadow-sm rounded-xl` submit), the verify screen (64px slate-100 circle +
`shield-check`, 16px gaps, "We've sent a 6-digit code to <email>",
six 40×44 `rounded-lg border-input bg-background` boxes — 6px gaps,
centered, first `autocomplete=one-time-code`, helper `text-xs mt-3`,
"Didn't receive the code? Resend"), the forgot form (gap 16px, copy,
"Send reset link"), the check-email screen (envelope circle, "We've sent
password reset instructions to <email>", GREEN alert `bg-green-50/70
border-green-200`, full-width text-style Back), the unverified-login gate
copy, and duplicate-register → re-verify (platform re-send).

**TDD.** RED: 18 designed unit failures observed (8 auth seams + 4
`mapPhysicalKey` + 6 schemas — the seams absent). GREEN:
`generateVerificationCode`/`generateResetToken`/`normalizeVerificationCode`
in `src/lib/auth.ts`; the three schemas in `src/lib/validation.ts`;
`mapPhysicalKey` in `src/lib/calculator.ts` → **149 unit green** (131 + 18;
one designed-RED correction: the forgot-schema extra-key pin — the repo's
Zod convention is strip mode). Prisma: `emailVerified` + the two token
models pushed; the seed upgraded the demo user in place. Routes: register
rework (no auto-login, platform duplicate behavior), verify-email (match →
burn → sign in), resend-verification (uniform 200), login gate (403 after
password verification), forgot-password (always-200 + resetUrl), reset-password
(one-shot consume). UI: the six-state login machine (`login/page.tsx` became
a SERVER component awaiting `searchParams` → `login-card.tsx` receives
`initialResetToken` — the lint-clean, hydration-clean deep-link shape);
the calculator listener with the latest-ref indirection.

**One real execution bug (caught by the audit, now AP-59):** the keyboard
listener's `[]`-deps closure evaluated the mount-time display forever —
the audit's Enter probe typed `12+3` and got `0`. Fixed with the
latest-ref pattern.

**E2E.** NEW `tests/e2e/auth-flows.spec.ts` (5 specs: signup form shape,
register→verify→signed-in, the unverified gate, the full forgot→reset
journey, the sign-in-state byte-parity guard) + 4 calculator
physical-keyboard pins + the updated wrong-password pin (inline alert with
measured chrome, trap-10 dual serialization, red-200 = `rgb(254, 202, 202)`).
Touched-test updates in the same change: `parity-session9.spec.ts`'s
`registerFreshUser` now completes the verify step (the register response
carries the code); `calculator.spec.ts`'s `hydrated` helper hoisted to
module scope. Three spec-side artifacts fixed during the run (now AP-60):
the `__next-route-announcer__` role=alert collision (card-scoped locators),
the bare-`waitForSelector("h2")` race (text-scoped waits), the pre-filled
GPA grade (explicit clear).

**Gates.** lint ✓ · tsc ✓ · **149 unit ✓** · build ✓ · **241 e2e ✓**
(cold `db/e2e.db`, 3.8 min) = **390 tests green** — the 232 prior pins
untouched in substance (one helper updated for the new register contract;
the login card's S4-F chrome pins pass unchanged in the sign-in state).

**E1 was a phantom (now AP-61).** The suspected `const [historyOpen…`
one-character syntax break does not exist: some tool outputs swallow the
`[` following `const `, and BOTH sessions read that artifact — while lint,
tsc, the codepoint dump (`0x5b` present), and the git diff (the line
unchanged from HEAD) all said the file was correct. No fix landed; the
phantom is documented so it is never re-derived. (The calculator file's
real S15 diff: the `mapPhysicalKey` import + the keyboard listener.)

**Verification re-runs (all GREEN).** `auth-flow-audit-s15.mjs`: 3/3
findings fixed (inline alert between Password and Sign in, no toast; the
real signup form; the real forgot flow). `keyboard-audit-s15.mjs`:
supersetWorking true (`12+3` → Enter → `15` → Escape → `0`).
`auth-journey-probe-s15.mjs`: 9/9 steps (register → code note → verify →
app; the gate; forgot → check-email → reset link → reset screen → success
note → new-password login). `drawer-check-s14.mjs`: **GREEN** (the standing
priority — backdrop equivalence, 288px panel, 20 links, no footer,
Escape-close superset). `pre15-preflight.mjs`: GREEN (31 runtime deps,
majors pinned by design, 1240 KB client static, zero outdated).

**Evidence.** 5 captures via `scripts/capture-s15-evidence.mjs`:
`s15-login-inline-error.png`, `s15-signup-form.png`, `s15-verify-otp.png`,
`s15-check-email.png`, `s15-calculator-keyboard.png` — VLM spot-checked
5/5 PASS (after one capture-script race fix — the h2 wait, AP-60b).

**Docs aligned.** README (badge 390, the Auth + Calculator-keyboard
feature rows, counts 149/241, the three new API rows, the plan entry +
project-status row, the captures line, the e2e notes), AGENTS.md (7 new
commands + the AUTH-FLOW contract + 3 testing quirks), CLAUDE.md (the
contract + pyramid + counts), PAD (ADR-013 + the distribution table +
totals), SKILL.md (AP-59..61 + counts). `.env.example` audited — matches
`.env`, no changes (no new environment variables were introduced).
