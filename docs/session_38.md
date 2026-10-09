# Session 38 — the S22 iteration: the AUTH_SECRET production boot guard

Git pull brought the repo to `8576767` (the S21 push `75601e7` + the
session-37 transcript). The review docs read (session_36,
remediation-plan-session21, the repo worklog, session_37); the S21 seams
verified present (the `data-export` seam, the `/api/export/data` route,
the server-gated `/export` page, the client panel, the s21 spec, the
capture script) and audited line-by-line — **CLEAN** (plus a live
agent-browser verification: the page renders the count grid, and the
authenticated download answers the full S13/S14 header contract with the
versioned envelope body). `DATABASE_URL="file:../db/custom.db"` with
`db/` at the repo root, `.env.example` matching the codebase, the vitest
+ playwright configs current. Baseline gates matched the documented
state: lint ✓ tsc ✓ 201 unit ✓ build ✓ and a cold-db full e2e
regression 267 ✓ — the documented 468-green state re-confirmed on
arrival.

The standing checks FIRST (the brief's priority item): the
**mobile-drawer check GREEN** on both apps — backdrop
`oklab(0 0 0/0.2)`+blur(4px), the 288px white panel, 20 links, no
footer, the Escape-close superset — and additionally live-verified with
agent-browser at 390×844 (the drawer opens as a dialog, the Flashcards
link navigates, the view renders, the drawer closes). **The mobile
navigation menu is working as expected.** The reference re-sweep (login
→ dashboard → the five-tab Settings sweep): **UNCHANGED since
S19/S20/S21** — the zero-data account 0/0, school "Lincoln High", Daily
Study Goal: 4 hours, Account created 9/28/2026, the Notifications master
toggle, the per-tab headers, the Subjects/Holidays zero-empty states, 20
nav views in the same order, the branding split stable. The clone-side
Settings sweep: parity ✓. No Tailwind v4 bugs (all traps remain pinned
by tests). Docker re-verified unavailable in the sandbox (`docker:
command not found`) — the first real `docker compose --profile init up`
stays the owner's documented step (DEPLOYMENT.md §8). The scandihaven
reference repo reviewed — the same gate/health/idempotent-seed/docs
convention family, with ONE pattern omni-study had not adopted:
**boot-time environment validation** (`instrumentation.ts` +
`parseServerEnv()` fail-fast).

Governing decision: with both backlogs empty (the reference unchanged,
the S21 code clean) and the 468-test regression green on arrival, a
production-readiness sweep governed — and found ONE genuine gap.
`src/lib/auth.ts`'s `secret()` silently fell back to the public
`DEV_FALLBACK_SECRET` constant (committed in the repo) when
`AUTH_SECRET` was unset — **regardless of NODE_ENV**. The only existing
enforcement was Docker-side (compose's `${AUTH_SECRET:?}`); the
documented non-Docker production path (`bun run start`, DEPLOYMENT.md
§4) had NONE: an owner who missed the env step got a silently-booted
server whose session cookies were signed with a publicly-known constant
— forgeable sessions for any user id, with no warning anywhere. The
README's promise is "production-ready … a codebase you fully own"; a
silent insecure default is the opposite. The session shipped **the
AUTH_SECRET production boot guard** (the scandihaven boot-validation
convention, adapted to this codebase's pure-seam pattern) — zero
runtime surface (boot-time only), zero parity impact.

The mechanism was validated EMPIRICALLY before adoption (a scratch
instrumentation probe, deleted after): `register()` runs at standalone
boot but never during `next build`; a plain `throw` is CAUGHT by Next
("Failed to prepare server") and the process keeps serving 500s — a
silently-degraded server, strictly worse than refusing to boot; the
fail-fast mechanism is `console.error` + `process.exit(1)` (clean exit,
the message on stderr). That lesson is recorded as **AP-69**.

Plan saved: `docs/remediation-plan-session22.md` — validated against
the codebase before execution (the `DEV_FALLBACK_SECRET` references are
auth.ts-only; port 3999 unused; the sitemap/rewrites untouched by a
boot-time guard).

TDD: **RED** — 14 unit failures (the absent seam module) + the e2e
negative-spawn failure (the standalone server booted and served instead
of exiting; the positive control + shell guards passed on arrival by
design). **GREEN** — the pure seam (`src/lib/env-check.ts`:
`DEV_FALLBACK_SECRET`'s new single source + `authSecretBootStatus` with
the full boundary matrix — production + missing/empty/whitespace/the
pasted constant = fatal; < 32 chars = warn; dev/test unset = warn, dev
never blocks) → the boot hook (`src/instrumentation.ts` — nodejs-guarded
register, console.error + process.exit(1) on fatal) → the auth.ts
single-source refactor (the local const becomes the seam import) → the
e2e webServer secret to a 64-hex value (models the production shape,
keeps the weak-secret warn out of every suite boot). **No implementation
iterations needed** — the first implementation passed the tests.

**FULL REGRESSION GREEN: 269 e2e ✓** (cold `db/e2e.db`, 4.5 min — the
267 prior pins untouched) = **484 tests green** (215 unit + 269 e2e).

Evidence: 4 captures via the committed
`scripts/capture-s22-evidence.mjs` — the boot-guard evidence JSON (the
negative spawn: exited true, exitCode 1, the full actionable message
("AUTH_SECRET is required in production … openssl rand -hex 32 …
DEPLOYMENT.md §4"), the port refused after exit; the positive-control
health 200; the dev-boot warn line) + three dev-server screenshots of
the remediated codebase (the dashboard, the `/export` owner surface, the
mobile 390px dashboard — no mobile overflow). VLM-verified: all three
PASS (the mobile capture's initial "missing app bar" FAIL was a VLM
misread — a direct DOM probe confirmed the fixed 64px glass app bar with
brand + clock at top=0, the S9 VLM-is-a-hypothesis lesson re-applied;
the re-captured image passes).

Docs aligned: README (badge 484, the Security-hardening row's boot
guard, the env-var "enforced at boot" note, counts 215/269, the S22 e2e
notes, the captures line, the Project Status row, the Troubleshooting
row), AGENTS (the boot-guard contract + 2 capture commands + counts),
CLAUDE (the boot-guard contract + the S22 seam + the S22 pins + counts),
PAD (ADR-020 with the alternatives-rejected table: warn-only /
per-route check / env-schema library / build-time check / pre-push
secret scan / Docker-only; the test-distribution table to 484 = 215 unit
+ 268 chromium + the 1 setup), SKILL (the 484 badge + AP-69),
DEPLOYMENT.md (§3 the enforced-at-boot note + the boot-exit
troubleshooting row), `.env.example` (the enforcement comment), the
plan's execution log, this narrative, the worklog entry.

**Session complete — the S22 AUTH_SECRET boot guard: 484 tests green,
ready to commit and push to main.**

**What governed this session:** both backlogs empty again (the reference
unchanged since S19/S20/S21; the S21 code audited clean) — the
production-readiness lens governed, and the one genuine gap found was
the silent forgeable-secret default on the documented non-Docker
production path. The fix follows the established seam pattern (pure
unit-pinned decision + a thin enforcement hook) and adds zero runtime
surface.

**Landed (TDD, 484 tests green — 215 unit + 269 e2e):**
- **The seam**: `src/lib/env-check.ts` — `authSecretBootStatus` (the
  boundary matrix) + `DEV_FALLBACK_SECRET`'s single source
- **The guard**: `src/instrumentation.ts` — production boots without a
  real secret exit non-zero with the actionable `openssl rand -hex 32`
  message; weak secrets warn; dev/test never block (one honest warn
  line)
- **The pins**: 14 unit + 2 e2e (the negative spawn + the positive
  control)

**Next:** the first real `docker compose --profile init up` on a Docker
host remains the owner's one open verification step (DEPLOYMENT.md §8).
Set `AUTH_SECRET` before your next production start — the server now
enforces it (the message tells you exactly how). The superset story now
covers observability (S18→S20), portability (S21), and fail-fast
production boot hygiene (S22); the remaining documented candidates (an
import/restore tool, scheduled backups, a pre-push secret-scan gate)
stay deliberate ADR rejections, revisitable on request.
