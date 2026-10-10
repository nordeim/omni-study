I'll start by internalizing this comprehensive task. Let me create a structured plan and then work through it meticulously.
The workspace has been reset — no `omni-study` repo exists locally. Let me clone it fresh.
The repo is cloned — it's a mature project (session 26+). Now let me review the key documentation. These are large files, so let me first check the docs structure.
The repo is far more advanced than the task description suggests — sessions up to 51 exist, with prior sessions already handling `.env`, `db/` folder, vitest/playwright. Let me read the core docs to understand the current state. Given the large volume, I'll use a combination of direct reads (for the most critical current-status docs) and check recent git history.
Now let me read the most critical current-status documents.
session_51.md documents the previous session's work (S26 email-change flow, pushed at `702cf7f`/`301fd90`). Now let me read session_50.md and the remediation plan for session 26.
Both session 50 and 51 describe the S26 work (email-change flow) — the repo is at the S26 state with 549 tests green. Now let me read the remediation plan for session 26 and the worklog tail to complete my understanding.
Now I have a clear picture of the current state. Let me verify what the last two "update session log" commits contained, then review the core conventions docs (AGENTS.md) and check the skills catalog.
Now let me read the core conventions doc (AGENTS.md) and check the skills catalog.
The file has very long lines. Let me read it in a controlled way.
I've internalized AGENTS.md conventions. Now let me check the skills catalog for relevant audit/review skills, and look at the README's project status section.
I now have the full picture. Let me set up the environment and validate the baseline state. First, check the toolchain and install dependencies.
Baseline gates: lint ✓, tsc ✓, 258 unit ✓. Now the production build and full e2e regression to confirm the documented 549-green state.
**Full regression GREEN: 291 e2e passed** — the documented 549-green state (258 unit + 291 e2e) is confirmed on arrival. Now let me update the todo list and audit the recent S26 changes, then run the standing checks.
Now let me audit the S26 code changes line-by-line (the recent changes).
S26 code audit is **CLEAN** — schema, route, store action, and panel card all follow the documented contracts. Now let me start the dev server and run the standing checks (mobile drawer first — the priority item).
The "Ecmascript" message is the documented edge-runtime warning for `process.exit` in instrumentation.ts (known behavior, AGENTS.md session-22), and the AUTH_SECRET dev-fallback warning is the documented dev path. Dev server is up. Now the standing mobile-drawer check:
**DRAWER CHECK: GREEN** — the mobile navigation menu works (backdrop, panel, 20 links, no footer, Escape-close on both apps). Now the reference re-sweep. Let me check the agent-browser tooling available.
Interesting — there are S27/S29-named scripts in the repo but the worklog only documents up to S26. Let me investigate this discrepancy to validate my understanding of the current status.
The "s27/s29" script suffixes are session numbers (not S-levels) — consistent with the repo history. My session is session 52; the next feature iteration would be S27. Now let me check the reference sweep scripts and run the reference re-sweep.
Let me run both reference sweep probes to re-check the reference site for changes.
Reference dashboard UNCHANGED (20 nav views, same order, branding split stable, zero-data 0/0). Now the Settings sweep:
Reference Settings UNCHANGED (school "Lincoln High", 4-hour goal, account created 9/28/2026). Now the clone-side sweep for parity:
Clone-side Settings parity ✓ (reference surfaces + the S24/S25/S26 superset cards). Now let me check the scandihaven repo for new patterns and verify Docker availability.
scandihaven unchanged since 10-04 (no new patterns); Docker unavailable (the documented owner's step). Both backlogs are empty. Per the governing pattern, I'll now run a production-readiness sweep to find the next genuine gap for S27. Let me systematically audit the API surface.
Most non-limited routes are CRUD shells (auth-gated by design). But `import/data` is in the no-limit list while the S23 plan documents a rate limit. Let me verify.
All sensitive routes are rate-limited (my grep -L was a false alarm — import route has it on line 59). Let me run the 20-view copy sweep against the live reference to catch any deeper changes, then continue the production-readiness sweep.
The copy sweep needs the standalone build on :3200. Let me start it per the script's convention.
The S22 boot guard is working as designed — production boot refuses without AUTH_SECRET (exit 1). For the sweep server I need to supply a secret. Let me check the documented pattern:
The db-path contract resolves correctly from standalone. The earlier failure was purely the S22 boot guard needing AUTH_SECRET. Let me start the :3200 server properly:
Copy sweep: 14/20 MATCH, all 6 remaining diffs are the documented data-state non-gap family (seeded demo vs reference's zero-data account). Reference is UNCHANGED. Now let me continue the production-readiness sweep from the user-friction angle — walking the app via agent-browser and probing the less-audited surfaces.
Clone Settings parity ✓ across tabs. Now let me walk the app via agent-browser as a real user to find friction points (the production-readiness sweep).
Let me now run the full standing audit suite (the production-readiness sweep) against the current state — dark sweep, accent×dark, forced-colors, print, focus-order, security, connectivity, settings roundtrip, upload edge, data volume, CWV.
Servers are up — the audits are just slow (20 views × both apps). Let me run them individually with longer timeouts.
The dark-sweep shows unexpected results. Let me read the script to understand what it's actually measuring before drawing conclusions.
The dark-sweep result is suspicious — white-bg entries suggest it may have measured LIGHT mode (the theme lifecycle correcting the forced class). Let me verify with the MODE line and the demo user's stored preference.
Key finding: `MODE:` printed EMPTY — the forced dark class did NOT stick. The demo user's stored preference is "light", so the theme lifecycle (`/api/auth/me` → `loadFromUser`) corrects the forced class on every full page load. Let me check the worklog history of this script to understand the documented GREEN state.
The committed dark-sweep audit script is producing misleading output — it sweeps in LIGHT mode (the forced class gets corrected by the auth theme lifecycle). Let me inspect the actual findings to characterize this precisely.
Now I have a solid characterization. The unreadable entries need verification against the reference (the parity standard). Let me check the code and probe the reference's calendar directly.
The yellow pill and slate-300 days are reference-measured designs (documented in code comments as measured with live reference data) — parity-preserved non-gaps. The real finding is the dark-sweep tooling regression. Let me confirm by running its successor (accent-dark-sweep, which uses the correct API pattern) and verifying the dark surfaces are properly audited by it.
The accent-dark sweep (correct API-driven dark mode) shows some FAIL/WARN hits. Let me check the worklog for the documented expected state after the S11 B-family fix — are these residuals or regressions?
The accent-dark residual hits are all **documented verified non-gaps** from session-11 (the S11 audit's "8 verified non-gaps" family — accent CTA faces, adjacent-month dimming, subject-colored class cards). The one genuine finding so far: `dark-sweep.mjs` has silently rotted. Let me continue the sweep with the remaining standing audits to complete the picture.
The Events sr-only input is `aria-hidden` + `tabIndex=-1` — a deliberately hidden programmatic control (non-gap). Continuing the sweep — security, settings roundtrip, connectivity:
Security and settings-roundtrip: CLEAN. Let me run the remaining standing audits (connectivity, upload-edge, data-volume, print, focus-order):
Focus-order: CLEAN (anomalies are only the documented dev-mode NEXTJS-PORTAL artifact). Let me check for the same tooling-rot class in other scripts — any that force state via DOM/localStorage instead of the API path.
Only dark-sweep.mjs uses direct forcing. Let me check how the standing capture script (capture-studyflow.mjs) handles its dark phase — and what the boot script actually reads:
The finding is fully characterized: `dark-sweep.mjs` sets the STALE key `sf-theme-mode` while the boot script reads `sf-theme` (THEME_CACHE_KEY) — and the auth-correction window overrides the forced class anyway. The correct API pattern exists in the repo (capture-studyflow.mjs, accent-dark-sweep.mjs). Let me complete the sweep with the CWV audit and the live mobile walkthrough.
CWV: CLS 0.00 everywhere (S16 contract intact), LCP matches the documented state. Now the final standing check — the live agent-browser mobile walkthrough at 390×844 (the brief's priority item):
Mobile login works — app bar with "Open navigation menu" renders. Now the drawer (the priority item):
Mobile walkthrough GREEN — drawer opens as dialog, 20 links, navigates to Settings, no overflow. Let me verify the S26 Email card on mobile Profile tab and the Escape-close, then wrap up the standing checks.
All standing checks are GREEN. The production-readiness sweep found exactly ONE genuine gap: the rotted `dark-sweep.mjs` audit tool. Let me verify no other references to the stale key exist, then check the AGENTS.md entry I'll need to update.
Now I have the complete picture. Let me update the todo list and write the S27 remediation plan following the repo's established format.
Let me check the doc structures I'll need to align (PAD ADRs, SKILL.md AP entries, CLAUDE.md conventions):
Now let me write the S27 remediation plan. First, let me capture the current (broken) state as RED evidence:
Plan saved. Now validating it against the codebase — the PATCH route contract and accent-dark-sweep's exact pattern:
Plan validated against the codebase. Now executing S27-A — the dark-sweep repair (RED already captured: MODE empty, 97/7 false findings in light mode):
The fix is applied. Let me verify the full file coherence and run it (GREEN phase):
GREEN achieved — flashbulb=0, unreadable=0 across all 20 views in real dark mode, preference restored to light. Now the negative control — validating the precondition guard's exit path with a scratch probe:
Negative control validated — exit 1, loud stderr line, no stdout findings, scratch deleted. TDD cycle complete. Now the full gates re-run:
Full gates re-run GREEN (291 e2e, 4.8m). Now the post-change drawer check, then the evidence captures. First restart the dev server cleanly by PID (AP-70):
All 31 screenshots refreshed. Now let me create the S27 evidence JSON following the repo's format:
All 31 standing captures refreshed; the per-session evidence pairs (s2X-*.png) stayed byte-identical — no restoration needed (the S26 lesson checked). Now building the S27 evidence JSON:
Evidence captured. Now the docs alignment (S27-B) — starting with AGENTS.md:
README updated. Now the PAD — ADR-025. Let me study the ADR-024 format:
PAD updated with ADR-025. Now SKILL.md — AP-72:
Now CLAUDE.md — let me check its command/tools section:
CLAUDE.md doesn't list audit scripts (only core commands). Let me add the audit-tool doctrine to its principles section:
CLAUDE.md updated. Now let me append the execution log to the remediation plan and verify `.env.example` is tracked:
Now let me verify `.env.example` tracking and the full change set, then write the session narrative:
Now the worklog entry (appending to the repo's worklog.md):
Worklog properly structured. Now let me prepare the commit — first reading the SSH wrapper instructions:
Let me check the wrapper's default remote and verify the environment (ssh binary / paramiko):
No ssh binary and paramiko missing — I'll need the shim path. First, the commit. Let me do the final review and stage:
All staged. Now the feat commit — following the repo's Conventional Commits pattern:
Feat commit `45d5eb0` created. Now the push phase — install paramiko, deploy the shim, materialize the key:
paramiko works on `/usr/bin/python3` (3.13). Deploying the shim with the right shebang:
Shim deployed. Now materialize the operator key (from the task brief) and verify it:
Dry-run passed — clean fast-forward `301fd90..45d5eb0`. Now the real push:
**PUSH CONFIRMED: remote main @ `45d5eb0` == local HEAD.** Now shredding the operator key and cleaning up:
Now updating the workspace worklog per protocol:
## Session Complete ✅

**S27 shipped and pushed to `main` @ `45d5eb0`** (remote verified via the SSH wrapper, key shredded after) — 549 tests green.

**What I did:**
1. **Validated the current status** — the repo was already at the S26 state (email-change flow); docs cross-checked against the codebase, all baseline gates re-confirmed (258 unit + 291 e2e).
2. **Standing checks all GREEN** — the mobile navigation menu verified via probe + live agent-browser walkthrough at 390×844; the reference site re-swept **unchanged**; clone parity holds.
3. **Full production-readiness audit** found one genuine defect: the `dark-sweep.mjs` audit tool had silently rotted (sweeping in *light* mode with 97 phantom findings). Repaired via TDD: API-driven mode forcing, self-verifying precondition (fails loudly, emits no findings), evidence + docs aligned (ADR-025, AP-72).

**Suggested next steps:** run the first real `docker compose --profile init up` on your Docker host (the one remaining open verification); revisit the scheduled-backups / secret-scan-gate ADR rejections on request.
