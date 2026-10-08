I'll continue the omni-study multi-session task. This is now Session 21 (briefing references `docs/session_20.md`, `docs/remediation-plan-session14.md`, `docs/session_21.md`). Let me first establish the actual repository state.
工作区已就位，仓库中也包含 `session_20.md`。现在让我刷新工作区并确认实际的 git 状态。
Local tree is clean at `92ea87f`. Let me pull from remote to see if sessions 15–20 pushed newer commits.
Pull brought in `docs/session_21.md` (new commit `e1b8cec`). Now let me see the full commit history with dates to understand sessions 15–20.
Fix commits exist through session-14, then only "update session log" commits after. Let me check what those recent commits actually changed and read the session 15–21 docs to understand what happened in those sessions.
Sessions 15–21 appear to be briefing-only commits (no fix commits after session-14). Let me read the worklog and session docs to understand the current state.
Now I understand the workflow pattern. Let me read the key session docs to determine what this session (S15 audit) should focus on.
`session_21.md` is the raw narrative of the previous conversation (S14 hardening, landed at `92ea87f`+`e1b8cec`, 363 tests green). This conversation executes the **S15 audit iteration**. Let me read `session_20.md` and the S14 remediation plan's forward-looking sections.
Clear picture now. This session executes the **S15 audit iteration** on the suggested surfaces: login/registration UX depth, Files search parity, keyboard shortcuts, and a pre-1.0 sweep (deps/bundle/Lighthouse). Let me review the S14 remediation plan and core docs.
AGENTS.md has very long lines. Let me read it in a line-wrapped form.
AGENTS.md fully internalized. Now CLAUDE.md and README.md.
Now the PAD's recent ADRs and the SKILL's AP entries (tails).
Core docs internalized (contracts, traps, AP-1..58, ADR-001..012). Now validating against the codebase — env contract, S14 seams, then baseline gates.
Environment contract and S14 seams verified. Running baseline gates now.
Baseline gates GREEN (lint ✓ · tsc ✓ · 131 unit ✓ — matches documented S14 state). Starting the dev server for the audits.
Dev server up. Running the standing mobile-drawer check FIRST (the priority item).
**Drawer check: GREEN** ✓ (backdrop equivalence, 288px panel, 20 links, no footer, Escape-close superset). Now the S15 audit. Let me examine the target surfaces — login page first.
Login page analyzed: password toggle exists, no inline validation, forgot-password is a toast fallback, "Sign up" only fills demo creds (though `/api/auth/register` exists). Now the Files view search.
Files view has search + type filter + view toggle — but search is scoped to the current folder only. Let me check keyboard handling in calculator/AI composer, then look at the register route.
Calculator is click-only (no physical-keyboard input); AI composer has Enter-to-send only. Now let me probe the reference site to establish parity ground truth. Let me check how existing scripts authenticate against the reference.
I have the reference-auth pattern. Now let me build the S15 audit. First, interactive exploration of the reference site's login/forgot-password/signup behavior using agent-browser.
Reference login structure matches the clone's known spec. Let me probe the "Forgot password?" behavior.
**Finding A2:** The reference has a real in-page "Reset your password" flow (Email + "Send reset link" + "Back to sign in"). Let me test what submitting it does.
Reference forgot-password is a full 3-state flow with a real backend endpoint. Now the "Sign up" behavior.
**Finding A3:** Reference "Sign up" opens a real "Create your account" form (Email/Password/Confirm Password). The clone's Sign up only fills demo creds while its register API is unreachable. Let me probe the reference's validation behavior.
Reference uses native browser validation (no custom inline states). Let me test a successful registration on the reference to see the endpoint and post-register behavior.
Reference registration ends at a "Verify your email" 6-digit OTP screen. Now let me log in to the reference and probe the Files view search scope.
Reference Files chrome matches the clone. The account is empty — let me create probe data (folder + file) to test search scope behavior.
File uploaded into ProbeFolder. Now the critical scope test: go back to All Files (root) and search for the in-folder file.
Reference search from root does NOT find in-folder files — folder-scoped like the clone. Let me verify the positive case (search inside the folder) to complete the parity verification.
**B1 verdict: PARITY** — reference Files search is folder-scoped like the clone (verified both directions). Let me clean up the probe data on the reference.
File deleted (no confirmation dialog — noted as a parity data point). Now remove ProbeFolder.
Probe data cleaned. Family B: search scope is parity (non-gap); reference deletes have no confirmation — let me check the clone's behavior, then probe the reference calculator's keyboard support.
Clone files-view has no delete confirmation either — parity. Now the key keyboard test on the reference calculator.
**C1: Reference calculator ignores physical keys (display stays "0")** — click-only, same as the clone. Parity. Now checking for global shortcuts on the reference.
No global shortcuts on the reference. Let me check the reference AI composer's Enter behavior, then close the browser session.
Enter-to-send confirmed on the reference (parity). The audit's interactive phase is complete. Closing the browser and running the pre-1.0 dependency/bundle sweep.
No safe upgrades (majors across the board — deliberate pin). Let me survey the dependency footprint and check for advisories.
Lean dep footprint (19 runtime deps). Now the bundle-size story — running the production build (also needed for e2e later).
Build complete (144M standalone = mostly server-side Prisma/Next binaries; 1.2M client static — lean). Now let me check the existing auth test coverage to understand the blast radius of the auth-flow redesign.
Let me test whether the reference blocks login for the unverified probe account — this decides the login-gating design.
**Reference blocks unverified login** with "Please verify your email before logging in. Check your email for the verification code." Let me see how it renders.
The reference renders login errors as an inline `role=alert` block (text-red-700 text-sm) between Password and Sign in — not a toast. Let me test wrong-password to see if invalid credentials render the same way.
**Finding A1 (real):** Reference renders login errors inline (`role=alert`, text-red-700, between Password and Sign in). The clone toasts instead. Let me check what session-4 recorded about this.
The clone pins the toast; the reference renders errors inline. Let me check the reference's register-screen error rendering (duplicate email).
Duplicate register on the reference re-enters the verify screen (platform re-sends). Let me capture the remaining screen copy precisely — forgot flow + verify-screen chrome measurements.
所有参考测量值已捕获。最后进行一次结构检查——子界面是否保留了 Logo/h1 品牌区块？
Sub-screens replace the brand block (no h1/logo). Let me screenshot the verify screen for the record, then close the browser.
Audit's interactive phase complete. Now let me check the DB-access pattern used by existing audit scripts, then write the three S15 audit tools.
Pattern confirmed. Now writing the three S15 audit tools.
Now the keyboard audit script:
Now the pre-1.0 preflight audit:
Let me make the audit's Prisma reads resilient to the pre-fix schema (models don't exist yet) so the pre-fix run captures all findings:
Let me make `signup()` resilient so the pre-fix run records each family's finding instead of crashing at A2:
Auth audit pre-fix: 7 findings recorded as designed. Now the keyboard audit:
All three audits captured. Preflight is GREEN (0 findings — deps pinned, 1183KB client bundle, zero long tasks). Now validating the remediation design against the codebase file-by-file before writing the plan.
Line 297 looks anomalous (`const istoryOpen, setHistoryOpen]`) — let me verify the raw file:
That line is syntactically broken, yet gates passed. Let me re-verify typecheck right now:
Syntax looks invalid yet tsc passes. Let me check git state of this file and test the construct in isolation:
The construct IS a syntax error in isolation, yet repo tsc passes. Let me test tsc against the actual file directly:
The direct-tsc output was truncated by `head -8` — let me see the full diagnostic list and check the incremental cache:
The isolated line errored, but the full file parses. Let me extract the exact context lines and test them:
The parser silently recovers. Let me dump the AST for that statement to see what TypeScript actually parsed:
The parser silently parsed it as an ArrayBindingPattern `"istoryOpen, setHistoryOpen]"` — binding `istoryOpen`, not `historyOpen`. But line 412 uses `historyOpen`... let me check for another declaration:
Let me dump the exact binding element names and run a cold typecheck (cache deleted):
**Audit discovery (E1):** The file at HEAD contains `const istoryOpen, setHistoryOpen]` — TypeScript's parser **silently repairs the missing `[`** and binds exactly `historyOpen`/`setHistoryOpen` with ZERO diagnostics (cold typecheck passes). Semantically perfect, cosmetically broken — a one-character restore while I edit this file. Now let me capture the remaining button chrome from the reference for the plan:
Let me settle the sub-screen text alignment with a quick VLM check on the captured reference screenshot:
Layout settled: centered composition, Back at top, full-width primary. The audit is complete — now writing the remediation plan.
Plan saved. Now TDD execution — RED unit tests first. Let me review the existing test structure:
Now writing the RED unit tests — auth seams and calculator key map:
RED observed (8 failed — seams absent). Now the calculator key-map pins:
Designed RED confirmed. Now the schema validation pins:
All unit RED states observed (8+4+6 designed failures). Now GREEN — the seams in `auth.ts`:
Let me tidy the mid-file import (move to top):
Now the validation schemas:
Now `mapPhysicalKey` in calculator.ts:
Unit GREEN (66 tests across the three files). Now the Prisma schema:
Schema pushed, client regenerated. Now the routes — register rework first:
Now the verify-email route:
Now the login route — the unverified gate + copy alignment:
路由已完成。在构建登录页面之前，让我从参考站点中获取确切的子屏幕文案（一行被截断了）：
Clean 3-element structure confirmed. Let me also re-measure the verify screen's vertical rhythm:
The signup screen geometry: Back→h2 gap is tight (~8px). The submit didn't go through — let me fill properly with refs:
Verify screen fully measured (Back→h2 gap = 96px vs signup's 8px). Let me measure the forgot + check-email screens' geometry too:
All geometry captured. Now writing the full login page state machine:
Let me verify the Input component forwards refs (needed by the OTP boxes):
Input forwards refs. Now the calculator keyboard listener + the line-301 bracket restore:


我将从会话中断处继续进行 omni-study Session-21 的工作。首先，让我确认当前的工作区状态以及上一会话中未提交的工作。
仓库不在 `/home/z/my-project/` 中。让我搜索一下它的位置：
The workspace has been reset — the repo no longer exists locally. Per the briefing, I'll re-clone it:
Cloned successfully. Now let me establish the actual repo state — which sessions landed on remote:
仓库目前处于 `e1b8cec` 状态，且目录结构干净——远程仓库已包含 S14 的修复（`363` 个测试），但**上一会话中正在进行的 S15/Session-21 工作从未提交，且已随着重置的工作区而丢失**。我需要验证哪些内容被保存了下来，并重做丢失的工作。让我检查一下上一次的提交记录和关键文件：
The repo is at the S14-completed state. The previous conversation's S15 work (auth flow redesign, calculator keyboard, etc.) was never committed — it's all lost. I must redo it. Let me first verify the current state of the target files and read the key docs:
Confirmed — all S15 work is lost; the codebase is at pure S14 state. Let me now review the key documents to re-establish context. First the session-21 narrative and worklog:
现在我已经掌握了完整的情况。`docs/session_21.md` 确认 S14 已落地（363 个测试呈绿色），且此前中断的对话正在执行 **S15 审计迭代**（auth 流程深度、计算器键盘超集、E1 括号 bug）——但其所有工作都在工作区重置时丢失了。我必须将其完全重做。让我来制定任务计划：
现在正在查看这五个核心文档：
AGENTS.md and CLAUDE.md internalized. Now README and the PAD/SKILL recent sections:
Core docs internalized. Now the skills catalog and the S14 plan's forward-looking recommendation:
Docs and skills catalog reviewed. Now rebuilding the environment:
Database initialized. Now baseline gates:
基准校验通过 (lint ✓ · tsc ✓ · 131 unit ✓)。现在让我检查一下用于参考站探测的现有 `probe-script` 模式，然后查看我需要重新构建的 S15 目标文件：
现在让我启动 dev server，并读取我即将修改的关键源文件：
找到了 E1 括号 Bug。现在让我检查一下计算器视图和库接缝：
现在我已经理解了所有约定。让我加载 `agent-browser` 技能来探测参考站点的 `auth flows`：
Both tools available. The repo's established precedent is Playwright probe scripts — I'll follow that. Now writing the reference-site auth-flow probe script to re-capture the exact copy/geometry (lost in the workspace reset):
Probe 已完成。让我来分析一下结果：
A1 confirmed — the reference renders login errors as a shadcn Alert (`role=alert`, `bg-red-50/70 border-red-200 rounded-xl`). Let me see the remaining findings:
所有参考数据已捕获。完整情况已构建完成 —— 参考 auth 流程是一个 5 状态机（登录 → 注册 → 验证 OTP → 忘记密码 → 检查邮箱，并带有内联 shadcn 警报）。现在，在编写整改计划之前，让我先核对一下代码库的衔接处 —— Alert 组件、计算器键盘 token、文件搜索：
The engine normalizes ×/÷ glyphs — `mapPhysicalKey` design is clear. Now the seed script (critical: the demo user must survive the `emailVerified` gate) and the me/api seams:
现在让我检查一下可能将当前的 toast 登录错误行为锁定的现有 e2e 断言：
The existing spec pins the old toast copy — will update in the same change. Let me verify the alert's exact position from the probe data:
位置信号存在歧义 —— 让我通过一个针对性的探针来解决这个问题：
位置已确定：alert 位于 Password 字段和 Sign in 按钮之间，处于表单的 `space-y-4 sm:space-y-5` 间距内（20px 间距）。我现在已掌握完整的 ground truth。正在编写 S15 整改计划：
计划已保存。现在开始执行 S15 审计工具并运行修复前的审计以作记录：
修复前审计已记录 —— 所有发现均已按设计确认为 RED。现在进入 TDD。**步骤 1：RED 单元测试。** 让我先检查现有的测试规范：
Conventions clear. Writing the RED unit tests — appending the new seams to the three test files:
接下来是计算器按键映射和验证 Schema 的 RED 测试：
现在让我们来观察 RED 状态：
**RED observed exactly as designed — 18 failures** (8 auth + 4 calculator + 6 validation). Now GREEN. First the `auth.ts` seams:
Now the validation schemas and `mapPhysicalKey`:
仓库的 Zod 约定是 strip-mode（允许额外的键）——我的测试预期过于严格了。正在修复该测试以符合约定：
**Unit GREEN — 66 tests across the three files.** Now the Prisma schema:
Now update the seed to create the demo user as verified (and upgrade existing ones idempotently):
Now push the schema and re-seed:
Schema 已推送，客户端已重新生成，演示用户已升级。接下来是六条 auth 路由——首先进行 register 重构：
Now the verify-email route:
Now the login route — the unverified gate + copy alignment:
路由已完成。在构建登录页面状态机之前，让我先确认一下参考子界面的组合几何结构（Back-button 对齐，居中）：
Back 为左对齐，h2/副文案居中，留有每屏特定的间距（8/16/96px）。再确认一下——子屏幕的输入框/提交按钮的具体类名：
已捕获完整的子屏幕样式（h-10 sm:h-11 输入框，带前导图标，44px 提交按钮 bg-slate-900 rounded-xl shadow-sm）。现在正在检查克隆的 Input 组件，随后构建登录状态机：
Input 组件转发 refs —— 很好。再进行一次 DOM 探测，以确定 verify/check-email 子文案的具体组成：
文案组成已基本解析完成，但 email-line 外层文本仍不明确。让我检查一下仓库的 VLM 脚本是如何调用 vision model 的，然后对截图进行一次视觉读取：
VLM 揭示了 shield/envelope 图标组合（解释了 96px 的间距）。让我用 DOM 探针验证这些假设（纪律：VLM = 假设，DOM = 真理）：
所有组合已通过 DOM 验证。最后进行一次微探针，以获取重发行文本和图标字形：
所有测量已完成。正在检查 lucide 图标的可用性，随后编写完整的登录状态机：
所有图标均可用。正在编写完整的登录页面状态机：
登录状态机已完成。现在进行计算器视图 —— E1 括号恢复 + 物理键盘监听器：
文件状态似乎发生了非原子性的偏移。让我直接验证这三个修改的当前状态：
The file appears inconsistent between reads. Let me check git diff and timestamps:
Git 显示仅应用了 import 修改——该括号行对 Edit 工具的字符串匹配有抵抗力（可能是一个不可见的字符异常）。我将通过 Python 确定性地修复它：
The file keeps flip-flopping. Let me get a definitive simultaneous snapshot:
谜团已解——无论如何，该文件现在已保持稳定且括号已修复（HEAD 中保留了损坏的版本）。让我来验证所有三项修改并补齐缺失的部分：
The full git diff shows ONLY the import change — meaning the bracket line is identical to HEAD. **E1 was a phantom**: a terminal-output artifact that swallows `[` after "const " misled both sessions; codepoint-level inspection proves the file was always correct. Valuable lesson to document. Now adding the keyboard listener:
Listener added. Running the fast gates on all changes so far:
Lint error: sync setState in effect. The cleanest fix — make `page.tsx` a server component that awaits `searchParams` and passes the token as a prop (no effect, no hydration mismatch). Restructuring:
Gates clean. Running full unit suite + restarting dev server for the new routes:
Dev server live with the new routes. Running the post-fix audits:
Typing and Escape work, but Enter evaluates stale state — the `[]`-deps effect captured the mount-time `submit` closure (`display="0"`). Classic stale-closure bug. Fixing with the latest-ref pattern:
**Keyboard audit GREEN.** Now a full manual flow probe of the complete auth journey before writing the e2e specs:
门禁步骤可能触发了内存中的登录速率限制器（探测运行会消耗 10次/IP/15分钟 的额度）。正在重启开发环境以重置限制器并重新运行：
网关故障在重启后依然存在——这是一个真实存在的 Bug。正在通过快照进行直接调试：
网关独立运行（`403` + 正确的 `alert`）。`journey-probe` 的步骤本身存在 `probe` bug —— 对其进行埋点以查看实际状态：
The debug works — the probe's generic `[role="alert"]` selector must be matching the toast stack's live region (leftover from step 3's welcome toast). Checking the toast component:
Toast 使用了 `role="status"` —— 而不是问题所在。让我输出原始 gate 文本，以找出真正的不匹配之处：
**All 9 journey steps GREEN.** The failure was a read race (text read before React committed). Now writing the e2e specs. First, checking calculator spec conventions:
Now writing the new auth-flows e2e spec:
Now updating the wrong-password pin in auth.spec.ts and adding calculator keyboard pins:
`hydrated` 被限制在另一个 `describe` 块中 —— 将其移至模块作用域：
Gates 状态正常。现在正在构建并运行新的 e2e specs：
Next.js 的 `__next-route-announcer__` 也带有 `role="alert"` —— 严格模式冲突（同时也是 journey-probe 不稳定的原因）。将定位器限定在 auth card 范围内。让我也检查一下 calculator 的失败原因：
Two simple spec bugs: the announcer collision + a pre-filled GPA field. Fixing all four:
已知陷阱 10（`lab()` 序列化）+ GPA 标签页上未挂载的显示。正在修复这两处：
我的引脚（pin）获取到了错误的 hex —— `red-200` 是 `rgb(254, 202, 202)`。正在修复：
All 23 targeted specs green. Now the **full regression suite** — all prior 232 + new specs:
239 个通过，2 个失败 —— 两个 session-9 的 "fresh user" 测试很可能使用了旧的 register-auto-login 契约。正在检查：
已找到根本原因——`registerFreshUser` 依赖于旧的自动登录契约。正在将其更新为 S15 验证流程（按 `AGENTS` 规则在同一变更中）：
所有 session-9 spec 均已通过。让我扫描一下是否还有其他依赖于旧 `register` 合约的 spec：
只有 `session9` 使用了旧合约。正在使用冷数据库进行最终的全套回归测试：
**FULL REGRESSION GREEN: 241 e2e passed** (232 prior + 9 new) = **390 total tests green** (149 unit + 241 e2e). Now the verification phase — the standing mobile-drawer check + audits + evidence:
**抽屉检查：通过。** 接下来进行 1.0 版本前的预检和证据截图捕获。正在检查 capture 约定：
现在正在编写 S15 证据捕获和预检脚本：
预检通过 (GREEN) + 捕获的 5 张证据截图。VLM 抽查（假设检查规范）：
4/5 通过 — OTP 截图的第 6 个方框发生竞态。正在通过显式状态断言进行重新捕获：
The note went missing in this run. Let me dump the actual verify-screen content to see what happened:
注意到存在速率限制耗尽的迹象（我的探测在 :3000 端口上消耗了 `register` 预算）。正在重启开发环境并重新运行捕获：
在其他情况下，记录是存在的——捕获脚本本身存在问题。添加诊断转储：
**Root cause found**: `waitForSelector("h2")` resolved on the signup screen's own h2 — the evaluate ran before the register completed. Fixing with a text-specific wait:
All evidence verified. Now the final phase — env verification, docs alignment, session narrative, worklog, then commit + push:
环境契约已验证。现在开始更新文档——首先从 README 开始：
现在查看 `AGENTS.md` 和 `CLAUDE.md`：
Now the PAD — ADR-013:
Now the SKILL.md anti-pattern entries:
Now the remediation plan's execution log:
协调计划中关于 E1 虚拟项的发现部分：
接下来是会话日志和 `worklog` 条目：
文档已完成。最终门禁验证与提交准备：
所有检查已通过。现在让我查阅 push-wrapper 技能文档，然后进行提交：
推送技能已完全领会。现在进行三步提交。**提交 1 —— 修复**（源码 + 测试 + 审计工具 + 证据 + 计划）：
All 3 commits landed. Verifying clean tree, then materializing the SSH key and pushing:
代码树已清理，但不存在 ssh 二进制文件 —— 正在检查 paramiko 并部署 shim：
paramiko 5.0.0 已安装。正在仓库外部部署 ssh shim：
Now materializing the operator key (outside the repo, 0600) and verifying its fingerprint:
密钥已验证。正在通过 wrapper 执行 dry-run：
远程仓库有新的提交——正在 fetch 并 rebase：
Origin 未显示新的 commit，但 push 操作被拒绝。正在检查实际的 remote ref：
远程仓库确切地处于预期位置（可进行 fast-forward）。查看完整的 dry-run 输出以找出真正的错误：
该 wrapper 的默认远程仓库是旧的 `task-management` 仓库——我需要 `--remote git@github.com:nordeim/omni-study.git`。正在检查 wrapper 的参数：
**试运行通过 (Dry-run GREEN)** — 快进 (fast-forward) `e1b8cec..dc80195` 已在正确的远程仓库完成身份验证。正在执行实际推送：
**推送已验证** — 远程 `main` @ `dc80195` == 本地 HEAD。正在销毁操作员密钥并清理：
**Session 21 完成 — S15 认证流迭代已推送到 main @ `dc80195`** ✅

由于工作区重置，上一会话未提交的工作已丢失。本次会话完整重做并超越了原计划：

- **390 个测试通过**（149 个单元测试 + 241 个端到端测试，之前为 363 个）
- **完整的参考认证旅程**：行内错误、注册 → 6 位验证 → 登录限制、忘记 → 重置深层链接（`/login?token=`）、ADR-013 自托管 token 交付
- **计算器物理键盘超集**（审计发现并修复了 stale-closure 漏洞）
- **记录了 3 个新经验**（AP-59..61），包括“幻影括号”输出残留
- 所有审计全部通过（GREEN），抽屉检查全部通过（GREEN），5 个 VLM 验证的截图，文档已对齐，密钥已销毁

**建议后续操作**：拉取并尝试注册流程（界面上会显示验证码）；或继续下一次迭代 — 重置屏幕的移动端几何布局、Lighthouse/CWV 通过或 Docker 部署演练。
