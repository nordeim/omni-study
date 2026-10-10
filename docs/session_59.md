I'll continue the task. Let me start by setting up the workspace and tracking this multi-phase effort.
The workspace has been reset — no `omni-study` directory. I'll clone the repository now.
Repository cloned successfully on `main` branch with clean status. The repo shows extensive prior session history (S28 completed). Now let me review the documentation structure.
All required session files exist (session_55, session_56, remediation-plan-session28). Now let me read the core documents.
The docs have very long lines. Let me read them in chunks.
AGENTS.md fully reviewed. Now CLAUDE.md in chunks.
Now let me read README.md and the remaining core docs.
Now the Project Architecture Document (769 lines) — reading in chunks.
The PAD has very long ADR lines. Reading in 60-line chunks.
All 26 ADRs reviewed. Now the remaining PAD sections (topology, data, design system, security, testing, deployment).
PAD fully reviewed. I noticed some stale sections (§9.3 "no Dockerfile" vs the actual Dockerfile shipped in S18; §6.3 "registration seeds three starter subjects" vs ADR-015's zero-subjects). I'll note these for the remediation plan. Now the SKILL doc.
SKILL.md fully reviewed. I've noted several stale spots (§11 "106 unit / 194 e2e", §7 "21 models", §8 open reduced-motion gap — all outdated vs the current 549-test state). Now the session documents.
Session docs reviewed. Now the worklog (757 lines) — checking structure and the latest entries.
The picture is now complete: HEAD is at S28 (pushed), 549 tests green, both backlogs empty, reference unchanged. Both session_55/56 are S28 transcripts; this session follows as the S29 workspace run. Now let me validate understanding against the codebase.
`.env` doesn't exist (fresh clone — gitignored) and `db/` needs creation. Let me review the skills catalog and verify the codebase state.
24 models total (docs say "22" in CLAUDE/PAD, "21" in SKILL — all stale; truth: 21 base + 2 S15 token models + RumEvent = 24). Checking test configs and remaining structure.
There's a `ref-dash-sweep-s29.mjs` script — let me investigate its provenance (possible leftover artifact).
The S28 A4 repair is verified clean in the code. `ref-dash-sweep-s29.mjs` is a tracked S19-era reference-probe script (its "session-29" label is the old workspace numbering). Now let me set up the environment per the brief: `.env`, `db/` at root, install, schema push, seed.
**Baseline 549-green re-confirmed** (lint ✓ tsc ✓ 258 unit ✓ build ✓ 291 e2e ✓ 4.6min cold-db). Now the standing checks — dev server + mobile drawer probe.
**DRAWER CHECK: GREEN.** Now the live agent-browser mobile walkthrough at 390×844.
The known covered-element quirk (documented in session_55) — using the ref approach instead.
**Mobile walkthrough GREEN** — drawer with 20 links, Settings navigation, S26/S24/S25 cards on Profile, scrollWidth 390 (no overflow). Now the reference site re-sweep.
Notable: the reference site's login page now says **"AcademiaFlow (Copy)"** — a platform-rename artifact (already noted by the S19-era probe script). Let me log in and check the in-app state.
**Reference re-sweep: UNCHANGED since S19–S28** — zero-data dashboard (0/0, greeting, stat cards, empty sections), 20 nav views, in-app "StudyFlow / Your study companion" branding (the "AcademiaFlow (Copy)" title is the documented platform-rename artifact), same five Settings tabs with Profile fields, MyDay amber empty state. Both backlogs remain empty.

Now the production-readiness sweep. During my doc review I spotted genuine doc-vs-code drift. Let me gather that evidence systematically.
Key precision: **24 models total** (21 original + 2 S15 token models + RumEvent); "22 user relations" claims are correct (Flashcard is deck-scoped). The "22 models"/"21 models" doc claims are the drift. Let me check version claims and remaining spots.
Versions verified (next 16.4.0, prisma 6.19.3, zod 4.6.5, playwright 1.63 — all match doc claims). Now the standing-audit suite — security first (fresh dev server, full AI budget).
I double-ran the security audit (the documented budget artifact). Following the session_55 playbook: clean dev-server restart by PID, then one run per audit with saved outputs.
S28 repair validated live — 0 findings. Continuing the sweep: data-volume, forced-colors, print, focus-order.
Dark-sweep GREEN (S27 repair validated: MODE dark, 0/0 across 20 views). Now accent-dark-sweep, then CWV on :3200.
The accent-dark sweep timed out at 300s (7 accents × 26 surfaces is heavy). Let me check for mutated theme state and re-run with a longer timeout.
The interrupted sweep left the demo user at dark/orange. Restoring via the settings API (the real application path), then re-running with a longer timeout.
Let me inspect the accent-dark JSON structure directly to reconcile with the documented S11 non-gap family.
The S11 non-gap family is present as documented (Calendar adjacent-month 2.36 in `lowcontrast`, zero FAIL findings). Now the CWV audit on :3200.
**Full standing-audit suite: GREEN** (11/11 audits, zero code defects; S27+S28 repairs validated live). Completing the parity verification with the 20-view copy sweep.
Copy sweep: **14/20 MATCH, 6 data-state diffs** — the documented S17 non-gap family (reference account is zero-data). The sweep found **zero code defects**; the genuine defect family is **documentation drift**. Let me kill the :3200 server and verify the session-file numbering.
Numbering confirmed: this is workspace session 57 (docs session_57.md narrative + session_58.md transcript; the S29 remediation plan). Let me verify the remaining doc claims against code — including a suspected stale `backdrop-blur-sm` claim in SKILL §5.
All evidence gathered. The src tree has no `hooks/` dir (PAD's "reserved" line is stale). Now writing the S29 remediation plan.
Plan saved. Now validating each claim/line number against the codebase before execution.
**Plan validated** — every line number and claim verified. Executing S29-A/B/C/D now.
Now the PAD edits:
Still need to remove the stale `hooks/` line from the PAD tree:
Now the SKILL.md edits (S29-A §7, S29-C):
Now the README edits:
Now the README session-29 status row (after the session-28 row) and the captures line note:
Now the README captures line (S29 note) and the vitest.config.ts comment (S29-D):
Now the vitest.config.ts comment fix (S29-D):
Now adding AP-74 to the SKILL.md anti-patterns table:
GREEN-phase verification — re-grep every touched claim across all layers:
All claims verified. GREEN phase complete. Now the full gates re-run (lint → typecheck → unit → build → e2e):
One e2e failure in the s23 import round-trip — investigating (my changes are docs-only, so this is either a persistent-db artifact or a flake).
The failure is `updated: 1` vs expected `created: 1` — the persistent e2e-db artifact (envelope ids already exist from the earlier baseline run). Let me read how the spec handles run-uniqueness:
The failure is my operating miss, not a code defect: the S27/S28 convention is a **cold-db e2e run** (delete `db/e2e.db` first) — the s23 spec uses fixed envelope ids, so a second run against the persistent db finds the rows existing (`updated: 1` vs `created: 1`). Deleting and re-running cold:
**Gates GREEN: 549 (cold-db 291 e2e ✓ 4.7min)**. Now standing checks + screenshot refresh — dev server restart by PID first (AP-70).
Standing 31 refreshed (29 byte-changed + 2 byte-identical login pages); s2X evidence pairs untouched. Now building the S29 evidence JSON:
Now appending the execution log to the remediation plan:
Now the worklog entry (repo root):
Now the session_57.md narrative (for the feat commit):
Now reviewing the full change set before the commit:
Change set is complete and clean (no .env, no db files, no keys). Final diff sanity check, then commit:
All diffs match the plan exactly. Committing now with the repo's conventional style:
Commit created. Now the push phase — reading the SSH wrapper instructions:
Key verified (same fingerprint as the S28 session: SHA256:3ddaNl...). Dry-run with the correct remote:
**PUSH CONFIRMED: remote main @ 54c1b04 == local HEAD.** Shredding the operator key and writing the session transcript:
All pushed and verified. Adding the outer workspace worklog entry (the session convention):
## Session Complete ✅

**S29 shipped and pushed to `main`** (`54c1b04` feat + `c55ed2e` session log — remote verified both times via the SSH wrapper, key shredded after). **549 tests green** (258 unit + 291 e2e cold-db).

**What I did:**
1. **Validated the current status** — repo cloned to the S28 state; all docs cross-checked; baseline 549-green re-confirmed on arrival.
2. **Standing checks all GREEN** — the mobile navigation menu verified working (drawer probe + live agent-browser 390×844 walkthrough, no Tailwind v4 bug); the reference site re-swept **UNCHANGED** (the "AcademiaFlow (Copy)" title is a platform-rename artifact; in-app branding is still StudyFlow).
3. **Full production-readiness sweep** — 11 standing audits + CWV + copy sweep all green with zero code findings. The genuine defect family: **documentation drift** — stale model counts (22/21 vs the schema's 24), three false PAD claims (zero-subjects, "no Dockerfile", reduced-motion), stale SKILL counts, a scaffold-era config comment. All layers re-aligned, with the correct "all 22 user relations" claims verified and untouched.

**Suggested next steps:** the remaining open item is the first real `docker compose --profile init up` on your Docker host (PAD §9.3 now documents the shipped config); the scheduled-backups / secret-scan-gate ADR rejections remain revisitable on request.
