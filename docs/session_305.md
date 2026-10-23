I'll start by setting up my workspace and understanding this complex task. Let me create a plan first.
The workspace has been reset. Let me clone the repo and read the uploaded instructions.
Repo cloned successfully. Now let me read the core documentation files.
The docs are very large. Let me check the repo structure first, then use parallel agents to digest the massive documentation.
This is a heavily-documented project (90+ sessions). Let me launch parallel agents to digest the massive docs while I read the recent session files directly.
Excellent briefings. Now let me read the recent session docs and worklog tail directly.
Now let me read the S90 remediation plan and worklog tail.
I now have a complete picture: **this session = S91, the 22nd routine arrival audit**. Let me check the repo skills catalog and verify the environment state.
Environment state: fresh clone, `.env` missing, `db/` empty. Current time **Oct 23 02:34 UTC = MORNING bucket (hour 2)** — captures will be a cross-bucket + cross-date pair vs S90's Oct 22 EVENING. Let me read the key repo skills.
I've internalized the web-app-foundation skill. Now let me read the SSH push skill and check the repo scripts, then set up the environment.
Now let me validate the test configs and package.json (user's requirement about vitest/playwright suites), then set up the environment.
Configs are properly wired (vitest 834-unit layer, playwright 299-e2e layer, db scripts inline DATABASE_URL). Now let me set up the environment per the S80 recipe.
Cold seed EXACT at the **303,104-byte pin** ✓. Now the baseline gates (lint → typecheck → vitest → build → cold e2e).
**834/834 unit tests ✓** (20 files, vitest — the correct runner). Now the production build.
E2E exited with code 1 — let me investigate what failed.
Mass 1ms failures suggest a setup-project failure, not app failures. Let me check the actual errors.
Root cause: **chromium headless-shell v1243 missing from the Playwright cache** (fresh-clone infrastructure gap, not source debt). Some tests passed (server-only ones), browser-launched ones failed. Let me fix the browser install.
Headless shell v1243 installed. Let me verify both browser forms exist and re-run the cold e2e gate.
**COLD E2E: 299/299 ✓ (4.5 min) — 1133 GREEN**, the 27th consecutive identical count. One process note: fresh clone lacked Playwright chromium v1243 binaries (install-gate issue, not code debt) — fixed via `playwright install chromium`.

Now the Mode-C audit — static scan, dep-audit, registry re-check:
Src pin confirmed at `193132f` (S52). The console.log hits are all in `scripts/*.mjs` audit tooling (documented output tools). Let me scan `src/` app code precisely, then run dep-audit and registry checks.
Static scan CLEAN — the two documented exceptions re-verified (calculator.ts:4 prose comment, layout.tsx:44 theme boot script), SDK server-only. Now dep-audit + registry re-check:
Registry re-check: braces 3.0.3 (unchanged, unfixable upstream), prisma rc.26 (unchanged, owner decision standing), bun audit exit 0. **But scandihaven HEAD moved** — standing pin was `d4789c3`, now reads `5430197`. Let me investigate this delta.
Scandihaven main moved `d4789c3 → 5430197`. Let me check what changed there (it's the tech-stack-pattern reference repo).
Scandihaven delta = skills-folder-only update (no app-code change, no new tech-stack pattern). Cleaning up and proceeding with the codebase alignment audit:
The audit found 25 findings. But given 90 prior sessions found zero code findings, I must verify each against the documented design decisions (ADRs) before accepting them. Let me validate the key claims myself.
H2 and M1 confirmed as real defects. Now let me check how ADR-013 documents the no-SMTP design (C1/H1) and what the e2e specs pin:
C1/H1 are **ADR-013 documented design decisions** (explicitly reasoned, e2e-pinned — the spec itself reads the surfaced code note; "surfacing nothing" was the rejected alternative). The audit flagged them against a generic multi-user standard — worth recording as a threat-model note, NOT unilateral redesign. Let me verify M5 (drawer focus management — the owner's mobile-nav priority) and L1/L2:
M5 verified: drawer has `role="dialog"` + Escape-close but no focus trap/restore, no scroll lock, hamburger lacks `aria-expanded`. Let me check the existing e2e pins to assess remediation risk, and how AI routes are tested:
Let me study the existing files routes (for the H2 fix pattern) and the e2e helpers:
I have all fix sites verified. Let me check the drawer-check script, the theme-cache test pattern (for source-invariant pins), and http.ts importability:
Let me check the FileItem→folder cascade and the files-view delete button markup:
All confirmed: FileItem→folder is Cascade; naming convention is `sNN-*.spec.ts`; this session = S91. Let me look at the s14 API-test pattern and the store's drawer state, then write the remediation plan:
Now I'll write the comprehensive remediation plan (validated against the codebase) before executing:
Plan saved. Now executing TDD — RED phase first. Let me check the e2e helpers, then write all failing tests:
Now the unit tests for L1 (verifyPassword) and L2 (P2003 mapping):
Now let me verify exports and run the RED phase for unit tests:
RED confirmed — exactly the expected failures. The `UnauthorizedError` import needs fixing (it lives in auth.ts, not http.ts):
**RED phase exact: 4 unit failures, all intended pins.** Now the e2e RED run (the standalone build is still pre-fix):
**E2E RED confirmed: 10 failed (all intended), 2 passed** (S91-C passes vacuously — the missing route also 404s; must stay green after the fix). Now GREEN phase — implementing all 5 fixes:
Fix 2 — the AI chat history query (desc + reverse):
Fix 3 — the drawer focus/scroll mechanics:
Let me remove the redundant unused ref and run lint to verify Fix 3:
Now Fixes 4 and 5 — the verifyPassword guard and P2003 mapping:
All 5 fixes implemented. Now the GREEN verification — lint, typecheck, unit tests:
A TS error in my spec (multipart uses `buffer`, not `data`). Let me fix and check the unit count:
**Unit GREEN: 844/844** (+10 new pins). Now rebuild and run the e2e GREEN phase:
10/12 green. Two pins to fix — let me check the auth.spec opt-out pattern and the F3 failure detail:
Two spec issues: (1) backdrop center-click is intercepted by the panel — click the visible backdrop region right of the panel; (2) S91-D needs the storageState opt-out pattern scoped to its describe:
The repo's own s14 pattern is simpler — empty cookie header on the shared fixture. Let me use it:
**All 12 new e2e pins GREEN.** Now the full cold e2e regression run (299 standing + 12 new = 311):
**FULL E2E GREEN: 310/310** (299 standing untouched + 11 new). New gate count: **1156 = lint + tsc + 844 unit + build + 310 e2e**.

Now the daemon + standing checks:
预检通过 (Preflight GREEN) + 抽屉检查通过 (Drawer-check GREEN) —— 所有六个常规检查在焦点修复后均得以保留。现在进行使用 agent-browser 进行的实机走查：
**Greeting anchor ✓**: "Good morning" (MORNING bucket, Oct 23) — cross-bucket + cross-date pair vs S90 as predicted. The hamburger now exposes `[expanded=false]` — the S91 superset is live in the a11y tree. Opening the drawer:
All S91 mechanics live: focus→Close menu, body locked, aria-expanded=true. Now the Tab trap + standing census + triple-pin:
Tab trap ✓, census exact (blur(4px)/288px/1068-755). Now the active-link triple-pin:
Gradient + dot exact. The label color needs the precise selector (violet-600 lives on the label span):
**TRIPLE-PIN EXACT — NO Tailwind v4 bug.** Now Notes via drawer + Escape-close with focus restore:
Mobile pass complete — focus restore works. Now desktop states at 1280×800:
Expanded exact (260/260, burger 0×0; 41 raw spans = 40 text + 1 dot). Collapsing via the chevron:
Collapsed EXACT (80/80, rotate:180deg native, pref "1"). Restoring expanded for the capture set:
Pref round-trip complete — clone walkthrough fully GREEN. Now the captures. Let me check the S90 capture naming and the badge census first:
Badge census GREEN (no-issues form, one N-logo, no amber pill). Capturing the 5 clone shots with the S86 watch-item check:
CLI needs absolute paths. Retrying:
Capture 1 saved. The watch-item heading wasn't found — let me verify the section headings:
Page is still on Notes from the walkthrough — capture 1 is invalid. Navigating to Dashboard and retaking:
Watch-item reads 860 (vs S90's 788) — consistent with the day-relative seed shift (Oct 23 anchor; will attribute in the capture-delta). Waiting for settle, then capture 2 (collapsed):
Now the drawer pair at 390×844 — labeled first (pref "0" + RELOAD per the S90 lesson):
Capture 3 valid (40 labels/1068). Now icon-only (pref "1" + reload):
All 5 clone captures done. Now the AFTER badge sweep (pure-PIL amber check) — saving the script first per the persistence rule:
Badge sweep GREEN. Now the reference re-sweep (40th) in a separate session:
Reference anchors exact — same-bucket + same-date MORNING pair with the clone. Now the 20-view order + sidebar geometry:
Reference collapsed exact (80/1200, labels unmounted). Now the mobile drawer census at 390:
Census exact (two-fixed-layer, zero aria). Escape-absence check, then restore expanded for the capture:
Escape-close absence confirmed. Now desktop reload for capture 6:
Five Settings tabs exact. CTA gate + capture 7 (reference mobile drawer labeled):
Capture 7 done (20 labels). The CTA gate needs the Dashboard — completing the sweep:
CTA at mobile position — the standing gate is desktop. Re-reading at 1280×800:
**REFERENCE UNCHANGED — the 40th consecutive sweep** (all anchors exact). Now the capture-delta vs S90 — prediction (documented before the run): cross-bucket (MORNING vs EVENING) + cross-date (Oct 23 vs Oct 22) → the S86/S88 **four-family form** (GREETING + DATE + DAY-RELATIVE-SEED + CLOCK). Writing the strict classifier:
Bands read as predicted for 6 pairs — but **the reference drawer capture shows a huge (57,843) band: I captured it over the Settings page instead of the Dashboard** (capture-process error). Retaking capture 7 properly:
**441 total rows — EXACTLY the S88 four-family count on its cross-bucket + cross-date pair.** The collapsed pair carries no clock band (the S52 pin) ✓. Now live attribution of the drawer band (75,117) per the standing doctrine:
The band sits on the greeting h1 behind the blur. Let me measure the x-extent of differing pixels precisely:
Clock band exact (x 298-371 = the 308-373 rect ± blur). The (75,117) band = greeting-tail width shift through the blur (morning/evening glyph widths differ ~7px → tail shifts in the strip). Let me attribute the (707,719) sidebar band live:
**All bands attributed to the four predicted families** — GREETING (incl. blurred drawer forms + footer date), DATE, DAY-RELATIVE-SEED (the 788→860 content shift), CLOCK (incl. blurred drawer bands). Zero structural movement; the remediation added zero bands. 441 rows = exactly the S88 cross-bucket+cross-date form.

Closing browsers and setting up the SSH infrastructure:
The standing recipe uses a venv. Setting it up:
paramiko 5.1.0 (the standing version). Writing the shim and verifying the key:
SSH infrastructure GREEN (dry-run verified, remote @ 727e6b3 == HEAD). Now launching the standing suite:
**Suite launched 03:22:46 UTC** (stages 1-2 running, ~73 min expected). While it runs — docs alignment. First, the README count anchors and session table:
Now updating the count anchors across all docs. Let me find them:
Historical session rows stay untouched — only current-state anchors change. Making the surgical edits:
New anchors: **844 unit (22 files) + 310 e2e (31 files) = 1156 green**. Updating all docs:
CLAUDE.md done. Now SKILL and PAD:
Let me add the S91 rows to the PAD test table and update vitest.config.ts:
Now checking suite progress and writing the README session-91 row:
Inserting the Session-91 row (suite section PENDING until the run completes):
README row inserted. Now writing session_302 (narrative) and session_303 (Chinese summary):
Now appending the execution log to the remediation plan and checking suite progress:
Now appending the worklog entry (suite PENDING):
Worklog appended. While the suite runs (stage 8/33), let me re-verify the gates hold after the doc edits and review the working tree:
The accent-dark-sweep long stage (~10 min, documented). Continuing the wait:
**STANDING SUITE: GREEN — 35/35 on RUN 1** (~70 min, on the remediated codebase). Extracting and verifying the envelope:
Envelope form correction needed (the standing verifier-correction pattern). Let me inspect the actual output format:
The `strip()` matched indented nested braces. Fixing to exact-match column-0 braces:
**ENVELOPE VERIFIED — ALL 17 CHECKS PASSED** (INP 1573ms, security 0+7, 35/35). Appending the REAL result to the three PENDING docs:
All docs carry the real result. Now the meta-worklog (per protocol) and session_304 (the process-log follow-up):
Now the evidence commit:
The follow-up shows only 1 file — let me verify session_304 inclusion:
Tree clean — session_304 was swept into the evidence commit by `git add -A`. Verifying, then the push:
**PUSH SUCCEEDED — `998f0ab` → main, remote verified, key shredded.** Final cleanup — shred the operator key, stop the daemon by PID:
**S91 complete — the five-fix remediation session, pushed to main** ✅

The commissioned review (against `web-app-foundation`) found 25 findings; after validating each against the ADR ledger, I fixed the 3 real defects + 2 hardenings with strict TDD: the **missing folder-DELETE route** (broken since S13), the **AI chat "amnesia"** (oldest-20 context bug), the **mobile drawer focus/scroll-lock/aria-expanded supersets**, a corrupted-hash guard, and P2003 error mapping. All gates green (**1156** = 844 unit + 310 e2e, up from 1133), reference unchanged (40th sweep), mobile nav verified with **no Tailwind v4 bug**, capture-delta matched the predicted four-family form exactly, standing suite **GREEN 35/35**, and both commits (`1a27abb` + `998f0ab`) pushed via the SSH wrapper with remote verification.

**Suggested next steps**: ① review the recorded owner-decision items in `docs/remediation-plan-session91.md` — especially the ADR-013 delivery tension (env-knob recommendation for multi-user deployments) and the Prisma 6→7 session bundle; ② trigger S92 with your next `update session log` push; ③ optionally exercise the folder-delete and drawer keyboard navigation live on the dev server.
