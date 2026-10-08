# Session 22 — the S15 auth-flow iteration narrative

*The session-21 briefing resumed with the workspace RESET: the previous
conversation's in-flight S15 work (audit findings, RED tests, partial
implementation) had never been committed and was lost. This session
re-cloned at `e1b8cec`, re-probed the reference ground truth from scratch,
re-did the full TDD cycle, and landed the iteration. 390 tests green
(149 unit + 241 e2e).*

---

## What happened

1. **Workspace recovery.** `git clone` at `e1b8cec` (S14 landed: 363 tests
   green); the five core docs re-read; the environment rebuilt
   (`bun install`, `.env` from `.env.example`, `db:push` + `db:seed`);
   baseline gates matched the documented state (lint ✓ tsc ✓ 131 unit ✓).

2. **Reference ground truth re-probed fresh** (`scripts/ref-auth-probe-s15.mjs`
   + three micro-probes): the login inline-error alert (position, classes,
   copy), the signup form (fields, placeholders, geometry), the verify OTP
   screen (shield circle, email line, six 40×44 boxes, Resend row), the
   forgot 3-state flow (form → check-email green alert → reset link), the
   unverified-login gate copy, duplicate-register re-send behavior. A VLM
   pass on the captures generated the icon-composition hypotheses that the
   DOM probes then confirmed (the discipline: VLM hypothesizes, DOM verifies).

3. **Pre-fix audits recorded** (`auth-flow-audit-s15.mjs` all-false,
   `keyboard-audit-s15.mjs` false — the designed RED evidence) and the
   remediation plan saved (`docs/remediation-plan-session15.md`), validated
   file-by-file against the codebase.

4. **TDD.** 18 designed RED unit failures (auth seams 8, `mapPhysicalKey` 4,
   schemas 6) → GREEN seams in `auth.ts`/`validation.ts`/`calculator.ts` →
   **149 unit green**. Prisma `emailVerified` + `VerificationToken` +
   `PasswordResetToken` pushed; the seed upgraded the demo user in place
   (otherwise the gate would lock every pre-S15 database out).

5. **Six routes + the six-state login machine.** Register no longer
   auto-logs-in (platform duplicate behavior preserved); verify-email burns
   the token family and signs in; resend is uniform-200; the login gate
   (403, reference copy) sits AFTER password verification; forgot-password
   is always-200 with a 30-min one-shot token; reset-password consumes it.
   The login page became a SERVER component awaiting `searchParams` that
   seeds the client machine with `initialResetToken` — the
   `/login?token=<48hex>` deep-link renders in the SSR HTML (no effect
   setState, no hydration mismatch — the lint rule that killed the naive
   effect approach). No SMTP exists: the code and reset URL surface to the
   actor (response JSON + muted on-screen notes — ADR-013's documented
   self-hosted trade-off).

6. **The calculator superset.** `mapPhysicalKey` (pure seam) + a guarded
   window keydown listener (form-control + open-dialog guards). The first
   implementation had a stale-closure bug the keyboard audit caught
   immediately (Enter evaluated the mount-time display "0" forever) —
   fixed with the latest-ref indirection (now AP-59).

7. **E1 was a phantom.** The "missing bracket" at calculator-view line 301
   — investigated across TWO sessions with parser-repair theories — does
   not exist: some tool outputs swallow the `[` after `const `, and the
   codepoint dump + git diff proved the file was always correct. The
   lesson is now AP-61 (trust the gates; dump codepoints before
   "fixing" impossible syntax that compiles).

8. **E2E + regressions.** `auth-flows.spec.ts` (5 specs), 4 calculator
   keyboard pins, the updated wrong-password pin; three spec-side artifacts
   fixed during the run (the `__next-route-announcer__` role=alert
   collision, the bare-h2 wait race, the pre-filled GPA grade — AP-60);
   `registerFreshUser` in session9's spec now completes verification. Full
   gate: lint ✓ tsc ✓ 149 unit ✓ build ✓ **241 e2e ✓** (cold db) =
   **390 tests green**.

9. **Verification.** All three S15 audits re-run GREEN; the standing
   drawer check GREEN; the pre-1.0 preflight GREEN (deps pinned by design,
   1240 KB client static); 5 evidence captures (`s15-*.png`) VLM-verified
   5/5; docs aligned (README/AGENTS/CLAUDE/PAD ADR-013/SKILL AP-59..61/
   the plan's execution log); `.env.example` unchanged (no new env vars).

## Suggested next surfaces

The remaining audit backlog from session-20's list is now fully worked.
Natural candidates for a next iteration: (a) a Lighthouse/perf budget pass
over both themes (the preflight covered size/long-tasks — CWV scores were
not measured); (b) the reset screen's mobile geometry (the superset screen
was built to the sub-screen family conventions but not mobile-probed);
(c) an i18n/copy audit of the twenty views against a fresh reference
sweep (the last full copy pass was session-9); or (d) packaging: a Docker
image + DEPLOYMENT.md walkthrough of the new auth env requirements.
