# Remediation Plan — Session 22 (S22): the production AUTH_SECRET boot guard

**Audit surfaces (this session, session-38 workspace run at `8576767`):** the
standing checks all ran GREEN on arrival — the baseline gates (lint ✓ tsc ✓
201 unit ✓ against the S21 codebase, then build ✓ + a cold-db full e2e
regression 267 ✓ = the documented 468-green state re-confirmed), the
mobile-drawer check on BOTH apps (backdrop `oklab(0 0 0/0.2)`+blur(4px),
288px white panel, 20 links, no footer, Escape-close superset — the brief's
priority item; additionally live-verified with agent-browser at 390×844:
the drawer opens as a dialog, the Flashcards link navigates, the view
renders, the drawer closes — **the mobile navigation menu is working as
expected**), the reference re-sweep (login → dashboard → the five-tab
Settings sweep): **the reference is UNCHANGED since S19/S20/S21** (the
zero-data account 0/0, school "Lincoln High", Daily Study Goal: 4 hours,
Account created 9/28/2026, the Notifications master toggle, the per-tab
headers, the Subjects/Holidays zero-empty states, 20 nav views in the same
order, the branding split stable), the clone-side Settings sweep parity ✓,
and the S21 code audit (the recent changes: the `data-export` seam, the
`/api/export/data` route, the server-gated `/export` page, the client
panel, the s21 spec — reviewed line-by-line, plus a live agent-browser
verification of the page + the authenticated download contract: the
attachment disposition + nosniff + private/no-store headers and the
versioned envelope body) — **CLEAN**. Docker re-verified unavailable in
the sandbox (`docker: command not found`); the first real `docker compose
--profile init up` stays the owner's documented step (DEPLOYMENT.md §8).
The scandihaven reference repo re-reviewed — same convention family
(gate order, health, idempotent seed, docs layering), with one pattern
omni-study has NOT adopted: **boot-time environment validation**
(`instrumentation.ts` + `parseServerEnv()` fail-fast).

## The gap found (the session's governing decision)

With the parity backlog empty (reference unchanged) and the audit backlog
empty (S21 clean), a production-readiness sweep was run. It found ONE
genuine gap:

**`src/lib/auth.ts` `secret()` silently falls back to the public
`DEV_FALLBACK_SECRET` constant ("dev-only-insecure-session-secret",
committed in the repo) when `AUTH_SECRET` is unset — regardless of
`NODE_ENV`.** The only existing enforcement is Docker-side
(`docker-compose.yml`'s `${AUTH_SECRET:?}`), while the documented
non-Docker production path (`bun run build && bun run start` —
DEPLOYMENT.md §4) has NONE: an owner who follows the deployment doc but
forgets the secret gets a silently-booted server whose session cookies are
signed with a **publicly-known constant — any reader of the repo can forge
a valid session cookie for any user id** (full account takeover), with no
warning anywhere. The README's promise is "production-ready … a codebase
you fully own"; a silent insecure default is the exact opposite of that
promise. `.env.example` and DEPLOYMENT.md both say "REQUIRED in
production", but prose does not protect against a missed step — a
fail-fast guard does.

### Mechanism facts (validated empirically this session, scratch-probe)

| Check | Result |
|---|---|
| `instrumentation.ts` `register()` runs at standalone-server boot | ✓ (log observed at boot) |
| `register()` does NOT run during `next build` (build with `AUTH_SECRET` unset) | ✓ (build exits 0, no hook output) |
| `throw` inside `register()` | **CAUGHT by Next** — "Failed to prepare server", the process keeps running and every request 500s (a silently-degraded server — unacceptable) |
| `process.exit(1)` after `console.error` inside `register()` | ✓ clean termination, exit code 1, message on stderr |
| Standalone boot WITH a 64-char `AUTH_SECRET` | ✓ health `{"status":"ok","db":"up"}` |
| Cookie flags today (`login/route.ts`) | httpOnly + sameSite lax + secure-in-prod ✓ (no gap there) |

The guard therefore logs an actionable message and calls `process.exit(1)`
on the fatal path — the only mechanism that actually refuses to boot.

---

## Non-gaps (documented, do not fix)

1. **The reference is unchanged** — no parity surface exists to chase;
   verification-only parity work (all GREEN). The boot guard adds ZERO
   chrome to any parity-pinned surface (it is server boot-time only).
2. **The dev fallback stays for dev/test** — zero-config local dev is a
   core README promise ("`cp .env.example .env` → `bun run dev`"); the
   guard only warns outside production, never blocks.
3. **Docker's `${AUTH_SECRET:?}` stays** — belt-and-braces with the new
   universal guard (compose fails with its own message before the
   container even starts).
4. **The Docker real-run** remains the owner's step (no daemon here).
5. **No env-schema library, no broader env validation surface** — the app
   reads exactly three env vars; a validation library for one required
   secret is over-engineering (ADR-020 alternatives-rejected).
6. **No pre-push secret-scan gate** (the scandihaven CI pattern) — the
   repo already gitignores `.env`/`db/*.db`/SSH keys and the wrapper
   never commits them; documented as a considered-and-rejected
   alternative in ADR-020.

---

## Families and fixes

### S22-A (HIGH) — the pure seam (`src/lib/env-check.ts`)

A new dependency-free pure module, unit-pinned end-to-end:

- `DEV_FALLBACK_SECRET` — **moved** here from `src/lib/auth.ts` (one
  source; auth.ts imports it — behavior identical, the constant value is
  unchanged).
- `authSecretBootStatus(nodeEnv, authSecret)` →
  `{ level: "ok" | "warn" | "fatal"; message: string }`:
  - `nodeEnv === "production"` + missing/empty/whitespace-only secret →
    **fatal** — the actionable message ("AUTH_SECRET is required in
    production … forgeable sessions … `openssl rand -hex 32` …
    DEPLOYMENT.md §4").
  - production + the secret equals `DEV_FALLBACK_SECRET` → **fatal**
    (someone pasted the public constant into their env — equally
    forgeable).
  - production + shorter than 32 chars (after trim) → **warn** (weak
    HMAC key — `openssl rand -hex 32` yields 64 hex chars — but the
    server boots; warn, not fatal, so a 40-char hand-made secret does
    not lock the owner out).
  - production + otherwise → **ok**.
  - non-production + unset → **warn** ("using the insecure dev-only
    fallback … set a real secret before deploying") — the boot log gets
    one honest line; dev never blocks.
  - non-production + set → **ok**.

### S22-B (HIGH) — the boot hook (`src/instrumentation.ts`)

The Next.js instrumentation file (new; runs once per server boot — dev,
`next start`, and the standalone build, never during `next build`):

- `register()` guards `process.env.NEXT_RUNTIME === "nodejs"` (the hook
  also loads in the edge runtime — skip there).
- Calls the seam with `process.env.NODE_ENV` / `process.env.AUTH_SECRET`.
- **fatal** → `console.error("[boot] " + message)` then
  `process.exit(1)` — the validated fail-fast mechanism (a plain throw
  is caught by Next and leaves a degraded 500-everything server).
- **warn** → `console.warn("[boot] " + message)`; **ok** → silent.
- Relative import of the seam (`./lib/env-check`) — instrumentation is a
  special build entry; relative keeps it alias-independent.

### S22-C (MEDIUM) — the single-source refactor (`src/lib/auth.ts`)

`DEV_FALLBACK_SECRET` becomes an import from the seam (the local const is
removed; the value and `secret()` behavior are byte-identical). This
guarantees the seam's fatal-case constant check can never drift from the
fallback auth actually uses.

### S22-D (MEDIUM) — the e2e secret models the production shape

`playwright.config.ts` webServer `AUTH_SECRET`:
`"playwright-e2e-session-secret"` (30 chars) → a 64-hex-char value —
models the documented production shape (`openssl rand -hex 32`) and keeps
the new weak-secret warn from printing on every e2e run. Storage-state
compatibility is a non-issue: the setup project re-signs-in fresh each
run and overwrites `tests/e2e/.auth/user.json`.

### S22-E (MEDIUM) — docs alignment

README (the Security-hardening row gains the boot guard; the env-var
table's AUTH_SECRET note gains "enforced at boot"; the Project Status
table gains the session-22 row; test counts), AGENTS.md (the boot-guard
contract in Architecture facts + the capture command + counts), CLAUDE.md
(the contract + counts), PAD (ADR-020 — the boot-time secret enforcement
with the alternatives-rejected table: warn-only / per-route check /
env-schema library / build-time check / pre-push secret scan), SKILL.md
(the counts badge + AP entry if lessons land), DEPLOYMENT.md §4 (the
fail-fast note: the server refuses to boot without AUTH_SECRET — quote
the guard message), `.env.example` (the AUTH_SECRET comment gains the
enforcement sentence), this plan's execution log, `worklog.md`, the
session narrative + transcript.

---

## TDD order

1. **RED unit** — `tests/env-check.test.ts` (pure, no env dependency —
   explicit args):
   - production + undefined → fatal; + `""` → fatal; + `"   "` → fatal.
   - production + the `DEV_FALLBACK_SECRET` value → fatal.
   - production + 64-hex → ok; + 32 chars → ok (boundary).
   - production + 31 chars → warn (boundary, one under).
   - development + undefined → warn; + set → ok.
   - the fatal messages name the remedy (`openssl rand -hex 32`) and the
     doc (`DEPLOYMENT.md §4`).
   - `DEV_FALLBACK_SECRET` is re-exported from the seam and equals the
     historical value ("dev-only-insecure-session-secret") — the
     single-source pin.
2. **RED e2e** — `tests/e2e/s22-boot-guard.spec.ts` (demo-user
   storageState; NO new registrations):
   - **the negative spawn:** `child_process.spawn("bun",
     [".next/standalone/server.js"])` with an EXPLICIT env object (PATH,
     PORT=3999, NODE_ENV=production, DATABASE_URL=e2e db) that omits
     AUTH_SECRET entirely → the process must EXIT (≤ 20 s) with a
     non-zero code and stderr/stdout containing "AUTH_SECRET is required
     in production" + "openssl rand -hex 32"; the port must not be
     serving after exit (connection refused).
   - **the positive control:** the suite's own webServer (booted WITH
     AUTH_SECRET) answers `/api/health` → 200 `{"status":"ok"}` — the
     guard never misfires on a properly-configured boot.
   - RED observation: the negative spawn currently does NOT exit (the
     server boots and serves — exitCode null after timeout-kill); the
     positive control passes on arrival (correct-by-design: it pins the
     guard's non-interference).
3. **GREEN** — the seam → the instrumentation hook → the auth.ts
   single-source refactor → the playwright secret. Rebuild.
4. Full gate: `lint → typecheck → test → build → test:e2e` (cold
   `db/e2e.db`).
5. **Verification re-runs:** the standing drawer check; the clone
   Settings sweep (the guard must not touch any runtime surface — it is
   boot-time only; the e2e suite's 267 pins are the regression net).
6. Evidence captures via the committed `scripts/capture-s22-evidence.mjs`
   (the S21 capture pattern): a dev-server boot log excerpt (the warn
   line + the healthy app), the negative boot-guard output (exit code +
   the message) as JSON, the positive-control health response, and
   dev-server screenshots (dashboard light, the `/export` owner surface,
   mobile 390×844) → `docs/screenshots/s22-*.png|json`.
7. Docs (S22-E) + the 3-commit pattern + the SSH-wrapper push.

## Risks

- **A fatal-path false positive would brick every boot.** Mitigated three
  ways: the fatal condition is production-only AND secret-empty-only; the
  e2e suite itself boots the standalone server with AUTH_SECRET set ~500
  times over 267 specs (any misfire fails the whole suite loudly); the
  unit boundary pins (32/31 chars, dev paths) pin the thresholds.
- **`process.exit(1)` inside a Next hook is unusual** — validated
  empirically BEFORE adoption (the scratch-probe table above): the
  alternative (throw) leaves a degraded 500-server, which is strictly
  worse than refusing to boot.
- **The e2e negative spawn adds ~2-6 s** (spawn → register → exit) —
  negligible against the 4.7-minute suite.
- **Port 3999 collision** — nothing else in the repo or the suite uses
  3999 (3100 webServer, 3200 the cwv audit, 3000 dev); the spec kills
  the child in a finally.

---

## Execution log (session-38 workspace run)

- **RED observed (both layers, exactly as designed):** the unit file
  failed to load (the absent `@/lib/env-check` module); the e2e negative
  spawn FAILED against a freshly rebuilt standalone (the server booted
  and served — exitCode null at the 20 s timeout-kill) while the
  positive control + the shell guards passed on arrival
  (correct-by-design).
- **GREEN — no implementation iterations needed:**
  1. `src/lib/env-check.ts` — the pure seam (`DEV_FALLBACK_SECRET`'s new
     single source + `authSecretBootStatus` with the full boundary
     matrix). 14/14 unit pins green.
  2. `src/instrumentation.ts` — `register()` (nodejs-runtime-guarded)
     → console.error + process.exit(1) on fatal, one console.warn on
     warn. Rebuild + the S22 e2e spec: 2/2 green (the negative spawn
     exits in 296 ms with the actionable message; the positive control
     200 {"status":"ok","db":"up"}).
  3. `src/lib/auth.ts` — the local const replaced by the seam import
     (behavior byte-identical).
  4. `playwright.config.ts` — the webServer secret to a 64-hex value.
- **Dev-path verified live:** `bun run dev` boots fine with exactly one
  warn line (`[boot] AUTH_SECRET is not set — using the insecure
  dev-only fallback …`), the app + login render normally.
- **Full gate GREEN:** lint ✓ tsc ✓ 215 unit ✓ (201 + 14) build ✓
  **269 e2e ✓** (cold `db/e2e.db`, 4.5 min — the 267 prior pins
  untouched) = **484 tests green**.
- **Verification re-runs GREEN:** the standing drawer check (all checks
  true, both apps); the clone Settings sweep parity ✓ (the guard is
  boot-time only — zero runtime surface).
- **Evidence captured** (`scripts/capture-s22-evidence.mjs`, committed):
  `s22-boot-guard-evidence.json` (the negative spawn: exited true,
  exitCode 1, the full actionable message, port refused after exit; the
  positive control health 200; the dev-boot warn line) + three
  dev-server screenshots (the dashboard, the `/export` owner surface,
  the mobile 390px dashboard — no mobile overflow). VLM-verified: all
  three PASS (the mobile capture's initial "missing app bar" FAIL was a
  VLM misread — a direct DOM probe confirmed the fixed 64px glass bar
  with brand + clock at top=0, per the S9 VLM-is-a-hypothesis lesson;
  the re-captured image passes).
- **Docs aligned:** README (badge 484, the Security-hardening row's boot
  guard, the env-var note, counts 215/269, the S22 e2e notes, the
  captures line, the Project Status row, the Troubleshooting row),
  AGENTS (the boot-guard contract + 2 commands + counts), CLAUDE (the
  boot-guard contract + the S22 seam + the S22 pins + counts), PAD
  (ADR-020 + the test-distribution table to 484 = 215 unit + 268
  chromium + the 1 setup, two new rows), SKILL (the 484 badge + AP-69),
  DEPLOYMENT.md (§3 the enforced-at-boot note + the boot-exit
  troubleshooting row), `.env.example` (the enforcement comment).
