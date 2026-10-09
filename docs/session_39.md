I'll continue the task from where we left off. Let me start by setting up the task plan and refreshing the workspace.
The repo exists. Let me refresh it with git pull and check its status.
Workspace refreshed — session_37.md was just pulled in. Now let me read the core documents.
Let me read the files one at a time to avoid output truncation.
The lines in these docs are extremely long. Let me create wrapped versions for easier reading.
AGENTS.md read completely. Now let me read CLAUDE.md.
Now let me read README.md.
Now let me read the session documents — session_36.md first.
Now let me read the worklog tail and the remediation plan for session 21.
Now let me check the skills catalog to identify the relevant skills for the audit.
Let me quickly skim the agent-browser skill for the visual checks.
Tools are ready. Now let me validate my understanding against the codebase — checking S21 seams, configs, and the DATABASE_URL contract.
All S21 seams, `.env` (`DATABASE_URL="file:../db/custom.db"`), `.env.example`, and `db/` at repo root verified. Now checking test configs and running baseline gates.
Baseline gates GREEN (lint ✓ tsc ✓ 201 unit ✓) — matches the documented S21 state. Now let me audit the S21 code changes line by line.
S21 code audited — seam, route, page, panel all clean. Let me check the test specs quickly.
Now let me start the dev server with a proper daemonized launcher (the sandbox kills background processes between calls).
Dev server is UP. Now the standing checks — the mobile-drawer check first (the brief's priority item).
**DRAWER CHECK: GREEN** — mobile navigation works as expected on both apps. Now the reference re-sweep to check for changes since S19/S20/S21.
Reference dashboard sweep: **UNCHANGED** — zero-data account, 20 nav views in same order. Now the Settings sweep.
Reference Settings: **UNCHANGED** — school "Lincoln High", goal 4 hours, created 9/28/2026, master toggle ON. Now the clone-side sweep.
Clone Settings parity ✓. Now let me do a live agent-browser walkthrough of the clone's key surfaces including the S21 /export page.
Signed in — shell renders with all 20 nav views and a working dashboard. Now the S21 /export surface.
/export page renders with the count grid (51 rows / 20 collections), and the API returns 401 for anonymous callers — the auth gate works. Let me verify the authenticated download via the browser session.
The full download contract verified live. Now the mobile navigation walkthrough at 390×844.
Mobile chrome renders correctly. Now opening the drawer and testing navigation.
**Mobile navigation verified working end-to-end** — drawer opens → Flashcards link navigates → drawer closes. Now let me review the scandihaven reference repo for tech stack patterns.
scandihaven reviewed — same convention family (gate order, health, idempotent seeds, docs layering), already implemented here. Notable candidate patterns: boot-time env validation, pre-push secret scan, coverage gates. Now let me probe the reference login page for the parity check.
Reference login page structure matches the clone. Let me log in and sweep key reference surfaces.
Reference login works, dashboard zero-data, 20 nav views — **reference UNCHANGED**. Now let me run the authoritative full audit: build + complete e2e suite. First, cleanup of browser sessions and dev server.
**FULL REGRESSION GREEN: 267 e2e passed** (4.7 min, cold db) — 468 tests green total, matching the documented S21 state. Let me verify Docker availability and examine a potential production-readiness gap I want to check — the AUTH_SECRET fallback behavior.
A real production-readiness gap found: `secret()` silently falls back to a **publicly-known dev constant** when AUTH_SECRET is unset — even in production. Let me check the cookie flags and how the e2e/docker paths set the secret.
Cookie flags are correct (httpOnly + lax + secure-in-prod). The confirmed gap: the standalone production path silently uses the **public dev fallback secret** when AUTH_SECRET is unset — forgeable sessions. Let me check one more surface — the "Continue with Google" button behavior in the clone.
The Google button has an honest documented fallback — no gap. Let me do a final sweep for open issues (TODOs, next.config), then form the session plan.
No TODOs; config clean. Next 16.1.1 (instrumentation.ts stable). Before finalizing the session plan, let me empirically validate the two critical Next.js mechanics the fix depends on — that instrumentation `register()` runs in the standalone build (not during `next build`) and that a throw crashes the server process.
Build succeeds (register does NOT run at build time). Now the standalone server without AUTH_SECRET:
The throw is CAUGHT by Next.js — the server logs "Failed to prepare server" but does NOT exit (timeout had to kill it). Let me check if the degraded server still serves requests.
**Critical finding**: a `throw` leaves the server in a degraded 500-everything state — NOT fail-fast. The fix needs an explicit `process.exit(1)`. Let me verify that mechanism.
All mechanism facts validated: `process.exit(1)` in `register()` cleanly terminates the standalone server (exit code 1, message on stderr), while `throw` leaves a degraded 500-server — the design must use explicit exit. Now let me remove the scratch probe and write the remediation plan.
Now writing the S22 remediation plan:
Plan saved. Now validating it against the codebase before execution.
The `-r` flag mangled that output — let me re-run correctly.
Plan validated — `DEV_FALLBACK_SECRET` only lives in auth.ts, port 3999 is free. Now **TDD Step 1: RED unit tests**. Let me check test conventions first.
Now writing the RED unit tests:
**RED unit observed** (absent seam module). Now the RED e2e spec:
For a true RED, I must rebuild — the current `.next/standalone` still has the scratch probe baked in (source already removed).
**RED observed at both layers** — unit (absent module) + e2e (server boots instead of refusing; the positive control passes on arrival, correct-by-design). Now **Step 3: GREEN** — the pure seam first:
Now the instrumentation boot hook:
Now the auth.ts single-source refactor and the playwright secret:
GREEN implementation in place. Now the unit check, rebuild, and the S22 e2e:
**GREEN at both layers** — 215 unit (201 + 14 new), the negative spawn exits in 296ms with the actionable message, positive control healthy. Quick dev-boot sanity check, then the full regression:
Dev boots with exactly the designed one-line warn. Quick app sanity check, then full regression:
**FULL REGRESSION GREEN: 269 e2e** (cold db, 4.5 min) = **484 tests green** (215 unit + 269 e2e). Now the verification re-runs — the standing drawer check and clone Settings sweep.
Verification re-runs GREEN. Now the evidence capture script — let me study the S21 pattern first.
Dev server is running. Now writing the S22 evidence capture script:
All evidence GREEN. Let me verify the captures and visually check the dashboard screenshot.
Let me check the VLM verification pattern and run a spot-check on the new captures.
VLM flags a possible issue on the mobile capture — per the repo's convention, VLM findings are hypotheses; DOM probes are the authority. Let me probe directly.
DOM probe confirms the app bar IS there (fixed, top=0, 64px, brand + clock) — the VLM finding was a misread. The probe re-captured the screenshot; let me re-verify.
All 3 VLM verifications PASS. Cleaning up the throwaway diagnostic probe per the S9 precedent, then checking doc counts for alignment.
Now the docs alignment phase. Let me get the authoritative test-count breakdown first.
484 total (215 unit + 268 chromium + 1 setup). Now aligning the docs — README first.
Now the README captures line, Project Status row, and Troubleshooting:
Let me check what actually applied in the README:
The captures line applied; the other two didn't. Let me apply them with exact strings:
README main sections done. Let me catch remaining count references in the file tree:
README aligned. Now AGENTS.md:
Now the boot-guard contract in AGENTS.md — right after the DATABASE_URL contract section:
AGENTS.md aligned. Now CLAUDE.md:
Adding the S22 e2e pins to CLAUDE.md's E2E bullet:
CLAUDE.md aligned. Now the PAD — ADR-020 and the test distribution table:
ADR-020 added. Now the PAD test distribution table:
PAD aligned. Now the SKILL.md — badge + AP-69:
SKILL.md aligned with AP-69. Now DEPLOYMENT.md §4:
Now `.env.example` — the AUTH_SECRET enforcement note:
Now appending the execution log to the remediation plan:
Now the session narrative (docs/session_38.md):
Now the worklog entry:
Now updating the workspace-level worklog and preparing for the push phase:
Now the final gates before commit — full verification pass:
All gates green. Let me check the established commit pattern before committing:
The pattern is clear: feat commit (everything except session log), then "update session log" commit (session narrative + worklog). Let me check git identity and commit:
Both commits landed, tree clean. Now the push phase — reading the SSH wrapper instructions first:
No ssh binary — deploying the paramiko shim per Appendix A. Let me check for an existing shim first:
Deploying the paramiko shim (outside the repo per the operator contract):
Now materializing the operator key (0600, outside the repo) and verifying it:
Key verified (ed25519). Now the dry-run with the shim on PATH:
The wrapper defaults to the old task-management remote — passing the omni-study remote explicitly. Dry-run now:
Dry-run passed — clean fast-forward `8576767..ff8fbcc`. Now the real push:
**PUSH CONFIRMED: remote main @ `ff8fbcc` == local HEAD.** Final cleanup — shredding the operator key and removing the shim:
## Session Complete ✅

**The S22 iteration is pushed to `main` @ `ff8fbcc`** — 484 tests green (215 unit + 269 e2e, cold-db full regression).

**What this session did:**

1. **All standing checks GREEN on arrival**: mobile navigation verified working (probe + live 390×844 agent-browser walkthrough on both apps), the reference site re-swept **UNCHANGED** since S19/S20/S21, the S21 export code audited clean, no Tailwind v4 bugs, all configs (DATABASE_URL, vitest/playwright, .env.example) verified current.

2. **The audit found one genuine production-readiness gap**: `AUTH_SECRET` silently fell back to a public repo constant in production — forgeable sessions on the non-Docker path. Fixed via TDD with a pure seam + a Next.js `instrumentation.ts` boot guard that **refuses to boot** with an actionable message (the `throw`-is-caught pitfall validated empirically and recorded as AP-69). Dev keeps zero-config startup with one honest warning line.

3. Docs, worklog, session narrative, evidence captures, and screenshots all aligned; two commits pushed via the SSH wrapper with the remote ref verified.

**Suggested next steps**: set `AUTH_SECRET` before your next production start (the guard will remind you); run `docker compose --profile init up` on your Docker host — the one remaining open verification step. Future candidates (import/restore tool, scheduled backups, pre-push secret scan) remain documented ADR rejections, revisitable on request.
