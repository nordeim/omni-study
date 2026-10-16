我将系统地继续执行此任务。首先，让我设置任务跟踪并检查当前工作区状态。
The workspace has been reset. Cloning the omni-study repository now:
仓库已克隆。Git 日志显示项目处于非常先进的状态（S56 会话已完成）。现在让我来复核一下核心文档：
该仓库高度成熟 —— 包含 151 个会话文件，直至 session56 的修复计划，以及一个包含 461KB 内容的大型工作日志。让我先阅读一下最新的会话文档，以了解当前状态：
S56（零发现稳定性确认）已作为 `51a9071` 推送，外加一个仅包含文档的 `ce97049`。我的会话是 S57。让我阅读 S56 的修复计划和工作日志的尾部：
Now I understand the cadence. This is a fresh clone (workspace reset), so I need the fresh-clone rebuild path. Let me examine the environment, worklog tail, and core doc structures:
`.env.example` already matches the codebase with the correct `DATABASE_URL`. Now let me check the worklog tail and core doc structures:
The worklog confirms the S57 cadence. Now let me start the environment rebuild (the long-running `bun install`) while I review the core docs in parallel:
Comprehensive briefings received. Now let me proceed with the fresh-clone environment rebuild:
489 packages installed (matches documented count). Now setting up `.env`, database, and Playwright chromium:
Verified: `ce97049` is doc-only (session_151, +70). Zero app-code changes since S52. Now running the baseline gates while chromium installs:
Lint ✓ tsc ✓ 834 unit ✓ (20 files, 3.34s). Now the production build:
Build ✓, chromium v1243 installed. Now the cold-db e2e gate (299 tests, ~5 min):
One e2e failure — `S8-A nav icons match the reference's lucide set`. This is a potential finding (S56 was 299/299). Investigating:
The spec found 0 nav icons instead of 20. Let me examine the spec and the component to diagnose:
The spec queries `nav a svg` which found 0 elements — possibly a mount-timing flake or a real regression. Let me reproduce it (TDD doctrine: reproduce RED first):
Isolated re-run passes — this looks like a timing flake in the full run. Let me check the `hydrated()` gate against the theme boot script (pre-React-mount race theory):
The boot script only handles the `dark` class — `--sf-primary` is React-mounted, so `hydrated()` did pass. Let me check the failure's error context, then re-run the full cold suite to characterize reproducibility:
No artifacts preserved. Running the full cold suite again to characterize the failure (S55 doctrine: 3 consecutive runs for determinism):
Run #2: **299/299 GREEN** — the run-1 failure is a flake. Before dismissing it, let me verify the race mechanism against the documented AP-90 doctrine (shell-presence gate before shell-DOM reads). Checking the app mount sequence:
The mechanism is confirmed — `page.tsx` renders `<Splash/>` during the async auth+pre-warm, and if `--sf-primary` is applied pre-shell, `hydrated()` is satisfiable pre-mount (the exact AP-90 class). Let me verify when the theme vars are applied:
**Race mechanism confirmed.** In `page.tsx`: `loadFromUser(user)` sets `--sf-primary` **before** `await dataPromise` (the collection pre-warm), and the shell mounts only after the pre-warm settles. So `hydrated()` is satisfiable while `<Splash/>` still shows — the exact AP-90 class. Let me scan for all specs with this latent unsafe pattern:
Only ONE spec has the unsafe pattern. Let me broaden the scan to any `page.evaluate`/`evaluateAll` reading shell DOM right after the hydrated gate:
`session7` and `session9` are safe (auto-waiting `expect(...).toBeVisible()` gates before the evaluate). Let me check `gotoMode` in accessibility.spec.ts (the Tab-stop test also reads post-mount DOM without an auto-wait):
`gotoMode` waits on the `html.dark` class — which the **pre-paint boot script** can satisfy before mount (AP-90's exact documented first crash). So two specs carry the latent class. Let me do a thorough scan of ALL post-gate non-auto-waiting reads:
Scan verdict: **F1** (session8 nav-icons, reproduced) + **F2** (accessibility Tab-stop, same latent class — mode gate satisfiable pre-mount by the boot script) need hardening; the rest are safe (auto-waiting locators or non-shell reads). Checking the e2e server config to design the RED reproduction:
`reuseExistingServer` is on — each fresh invocation boots a new server. Writing the RED reproduction loop script (persisted per the script-persistence rule):
0/10 natural reproduction — the race is rare in isolation (full-run memory pressure widens it). Per plan, now the **deterministic mechanism proof**: a throwaway diagnostic spec with injected pre-warm latency. First, checking what the Dashboard pre-warms:
**机制已确定性地证明 — 两者均呈红色（未通过）：**
- **F1**: gate-pass 时的 `shell: false; icons: 0` — 与实际运行失败的特征完全一致
- **F2**: 第一个 Tab 焦点 = `BODY "Loading StudyFlow…"` — Tab-stop 测试的潜在失败模式

这正是 AP-90 类：*在组件挂载（pre-mount）前满足的等待条件，不能作为组件挂载后（post-mount）读取的判断依据*。现在进入绿色（通过）阶段 — 仅针对测试代码的修复（已记录的 AP-90 防护：外壳存在（shell-presence））：
Both fixes applied. Now proving GREEN under the identical racing condition — updating the diagnostic to mirror the fixed gate shape:
**GREEN under identical racing conditions** — icons read 20, Tab stop = skip link. TDD loop closed: RED → fix → GREEN. Removing the throwaway diagnostic and verifying the full cold suite:
**299/299 GREEN with the fixes** — count anchors intact (1133 total). Now the Mode-C code audit:
Static scan clean — all documented exceptions verified. Now dep-audit + the registry re-check (the standing open item):
Registry landscape re-confirmed: braces 3.0.3 = latest (unfixable upstream); stable Prisma 7.10.1 (`prev`) carries the fixed deepmerge-ts 8.0.2; `latest` is now the Prisma 8 RC (not production-safe). The S56 judgment call stands. Checking for newer 7.x and confirming the working tree:
Prisma 7.x stable line confirmed ended at 7.10.1. Mode-C audit complete. Now the dev daemon (S32 recipe) + preflight + drawer-check:
Preflight GREEN, drawer-check GREEN. Now the live agent-browser mobile walkthrough — loading the skill first:
Now the live 390×844 walkthrough on the clone (named session per the dual-app doctrine):
Mobile shell contract verified (390 / sidebar hidden / burger visible). Opening the drawer:
20 links in exact reference order. My selector grabbed the hidden desktop nav — let me target the drawer's visible nav properly:
Nav scrollable (1068/755) + **trap 4 clean** (flex/gap 4px/column/zero margins). Now traps 9/7 + active-link styling:
Traps 9/7 clean + active violet-600 + gradient confirmed. The trailing-dot probe grabbed the wrong span — probing correctly:
Trailing violet-500 dot `rgb(139, 92, 246)` verified (all 3 active-link pins). Now navigating to Notes via the drawer + auto-close check:
Notes reached via drawer with auto-close ✓. Now the Escape-close check:
Escape-close ✓ — **mobile walkthrough fully GREEN, no Tailwind v4 bug**. Now the desktop sidebar states at 1280×800:
Expanded: aside 260 ✓ main 1020 ✓. The marginLeft probe returned null — re-probing with geometry:
Expanded 260/260/1020 ✓. Now collapsing the sidebar:
Collapsed 80/80/1200 + svgX 33 ×20 + empty footer + persisted ✓. Probing the chevron glyph rotation separately:
Glyph `rotate: 180deg` ✓ — collapsed state fully verified. Now the shared drawer state (collapsed → icon-only at 390×844):
Shared collapsed drawer verified (288px panel, icon-only svgX 32, nav 988/755). Restoring the expanded preference per the closing protocol:
Expanded restored + round-trip ✓. Clone walkthrough **fully GREEN**. Now the reference re-sweep with the operator account:
Anchors ①② verified (title + "Good morning" greeting — hour-2 UTC bucket correct). Now anchor ③ (20-view href order) + expanded state:
Anchor ③ + expanded 260/260/1020 ✓. Now anchor ④ (five Settings tabs):
All four anchors verified. Now the reference collapsed state:
Reference collapsed state matches every pin. Now the reference mobile drawer (shared collapsed state) at 390×844:
Reference shared drawer verified (288px / svgX 32 / 912 vs 744 / blur(4px)) — **reference UNCHANGED since S52**. Restoring the preference and capturing reference evidence:
Reference captures saved. Closing the reference drawer + session, then verifying scandihaven is unchanged:
Scandihaven unchanged (d4789c3, 2026-10-04). Now closing interactive sessions (OOM lesson) and launching the standing suite detached:
Suite running (stage 3/33, preflight passed). While it runs, writing the session docs. First checking the formats:
Now writing the remediation plan (the suite runs in the background):
Now writing session_152 (narrative):
Now session_153 (Chinese summary):
Suite at stage 7/33. Adding the README session-57 row while it runs:
README row added. Now preparing the SSH push infrastructure while the suite runs — reading the wrapper skill doc:
Deploying the SSH push infrastructure (shim outside the repo + key materialization):
Key verified (ed25519). Testing the wrapper dry-run with the correct remote:
Dry-run GREEN (remote == local HEAD @ ce97049). Checking whether AGENTS.md documents the hydrated-gate pattern (doctrine alignment check):
Checking exactly what the S55 test-fix commit touched (the precedent for doc scope):
S55 precedent confirmed (test files + docs, no AGENTS/SKILL). But my F1/F2 refines AP-90's own claim ("Playwright specs are safe by auto-waiting") — extending the SKILL.md AP-90 row with the S57 carve-out:
AP-90 row extended with the S57 e2e back-port. Updating the workspace worklog while the suite runs:
**STANDING SUITE: GREEN — 35/35!** (~72 min wall). Extracting the verdict table and saving the evidence envelope:
Envelope saved (35/35, zero findings). Now the 5 dev-server screenshots — re-open + re-login first (the S53–S56 lesson):
All captures saved — byte-mirroring the S56 set. Finalizing the remediation plan with the confirmed verdict:
Now appending the S57 entry to the repo worklog:
Worklog appended. Final pre-commit verification:
Commit `c5378bc` created (16 files, +773). Now the push via the SSH wrapper:
The wrapper itself already verified the remote (@c5378bc == local HEAD, exit 0). The manual ls-remote failed only because it lacked the key context. Shredding the key:
**PUSH VERIFIED: remote main @ c5378bc == local HEAD.** Key shredded. Now stopping the daemon by PID and writing the process log follow-up:
Follow-up commit created. Re-materializing the key for the final push:
All verified. Updating the workspace worklog with the final state and completing the todo list:
**S57 complete and pushed to main** (`c5378bc` + `1e103c8`, remote == local verified, key shredded, daemon stopped).

The session found and fixed the project's first observed e2e flake in two sessions: the baseline run read **298/299** — root-caused to the documented **AP-90 pre-mount gate race** (the theme applies before the data pre-warm settles, so the specs' gates could pass on the Splash screen). Both affected specs were hardened with the shell-presence guard via a full TDD loop (deterministic RED → fix → GREEN), restoring **1133 green**. The standing suite confirmed **GREEN 35/35**; the reference re-swept **unchanged**; the mobile menu works with **no Tailwind v4 bug**.

**Suggested next steps**: ① decide on the dedicated Prisma 7 upgrade session (the deepmerge-ts advisory's fix path, re-confirmed on stable 7.10.1); ② run the Docker `init` profile on your host; ③ continue the arrival re-sweep protocol next session.
