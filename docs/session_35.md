我将开始处理这个全面的 omni-study 代码库审计和修复任务。让我先制定一个任务清单并检查当前的工作区状态。
工作区已存在于 `/home/z/my-project/omni-study`。让我检查一下 `git status` 和工作日志，以了解当前的状态。
上一会话的工作日志显示 S19 (RUM diagnostics panel) 已完成。让我检查一下远程状态，看看本地 commits 是否已被推送，并查看会话文档。
远程仓库有一个本地没有的新 commit (`7481f4c`) —— 那很可能是 session_33.md 的转录内容。让我来拉取它。
工作区已刷新至 `7481f4c`，包含 `session_33.md`。现在让我阅读会话文档和仓库工作日志，以了解当前状态。
现在我了解了当前的状态：S19（RUM 诊断面板）已推送到 main @ `0b12a43`，而 `session_33.md` 是它的转录内容。本次会话是下一次迭代（S20）。让我阅读一下仓库工作日志和 S19 修复计划。
现在让我阅读仓库工作日志（最近的部分）和核心文档。先从工作日志的尾部开始。
S19 已完全记录。现在让我查看核心文档 —— AGENTS.md、CLAUDE.md 和 README.md。
文档中行很长。我将通过持久化的输出分块读取 AGENTS.md。
让我使用 Bash 直接提取剩余的 `AGENTS.md` 部分，以避免嵌套问题。
现在我来完整阅读 CLAUDE.md。
现在让我来查看 README.md。
Now let me review the Project_Architecture_Document.md structure and key ADRs.
现在让我查看 `omni-study_SKILL.md` 的结构，特别是最近的 anti-pattern 条目。
已完全理解文档。现在，让我根据这些文档对代码库进行验证——检查 S18/S19 衔接点、配置以及环境状态。
所有 S18/S19 衔接点均已验证到位，`.env` 符合 `DATABASE_URL` 契约，测试套件已配置完成。现在让我运行 baseline gates 以确认已记录的状态。
Baseline gates GREEN (lint ✓ typecheck ✓ 179 unit ✓) — 符合文档中记录的 S19 状态。现在让我查看技能目录，以确定用于审计的相关技能。
The skills catalog confirms the relevant skills (agent-browser, clone-app-pat-pro, tdd, code-review-and-audit, nextjs16-tailwind4). Now let me start the dev server and run the standing checks — the mobile drawer check first (the brief's priority item).
我来检查一下是否有正在运行的开发服务器，并根据需要启动一个。
开发服务器已启动。现在让我执行移动端抽屉（mobile drawer）的例行检查（简报中的优先项）。
**Mobile drawer check: GREEN** — the clone's backdrop oklab(0 0 0/0.2)+blur(4px), 288px white panel, 20 links, no footer, and the Escape-close superset all verified. The mobile navigation menu is working as expected.

Now the reference re-sweep to check for account-state/surface changes since S19.
Reference dashboard stable — zero-data account, 20 nav views, branding split intact. Now the Settings five-tab sweep on the reference.
Reference Settings sweep confirms **UNCHANGED since S19** — Profile tab intact (school, grade, goal "Daily Study Goal: 4 hours", "Account created: 9/28/2026"), zero-empty states on Subjects/Holidays. Both backlogs are clean on arrival.

Now let me audit the S19 code changes (the most recent changes) line-by-line.
S19 源代码干净整洁。让我再检查一下 S19 测试文件和 /api/rum 路由（S19-C 修复）。
S19 测试和路由很干净。让我核实一下完整的 S19 diff，以确保我已审计了所有变更。
S19 审计完成 —— 所有代码文件均已审查完毕。两项待办事项已清空。让我检查一下这个沙盒中是否可以使用 Docker（这是最后一个待处理的验证步骤），并检查其余开放的文档项。
Docker 依然不可用（已记录的负责人步骤）。两项待办任务均已完成，因此文档中记录的下一个待处理事项 —— **RUM 面板 v3 优化（趋势图，CSV 导出）** —— 将主导本次 S20 会话。让我完成验证测试：克隆端 Settings 清理以及 20 视图复制扫描。
Clone Settings parity GREEN. Now the 20-view copy sweep against the live reference.
copy-sweep 需要 :3200 端口上的 standalone build。我先检查一下 script contract，然后进行 build。
验证测试完成 — 所有固定检查均通过（GREEN）：文本扫描中 13/20 匹配 + 7 个仅涉及数据状态的差异（已记录的演示与零数据账户之间的非差异项）。让我停止 :3200 服务器并查阅简报中提到的相关仓库内技能。
技能已参考。让我根据简报检查一下 `scandihaven` 参考仓库是否依然可用。
`scandihaven` 模式已确认（属于相同的 `gate`/`health`/`idempotent-seed` 规范系列——`omni-study` 已经实现）。所有验证工作均已完成（显示为绿色）。现在让我来设计 S20 迭代。首先，验证新文件的计划目标以及我将要重用的 `helper` 的 `signatures`。
所有规划均已确认。现在让我来编写 S20 的整改计划。
计划已保存。现在让我根据代码库进行验证——检查 `s18` spec 断言、现有的 unit fixtures 以及 `next.config.ts` 的 rewrites。
计划已验证：s18 的 pins 是基于存在性的（加性趋势是安全的），重写仅映射 PascalCase 视图，并且可选的 `trends` 字段保持了现有 fixtures 的通过。现在开始执行 TDD —— **第一步：RED 单元测试**。让我先阅读现有的测试文件。
现有测试很明确。现在开始编写 RED 单元测试——即 S20 引脚。
现在正在将 S20 测试块追加到文件末尾：
现在正在观察 RED 单元失败：
已观察到 **RED 单元** — 刚好 13 个预期失败（缺失的接缝函数），14 个先前的 pin 均通过。现在执行 **步骤 2：RED e2e 规范**。
**RED e2e observed** — 4 designed failures (absent route/trends/chrome). Now **Step 3: GREEN implementation** — starting with the pure seam.
现在更新 `buildPanelRows` 并添加两个新函数：
Now the unit tests should go GREEN:
浮点路径存在差异：测试规范期望使用 `i * width / (n-1)`（先相乘的形式），而我的实现使用了 `(i / (n-1)) * width`。我将把实现与规范的标准表达形式对齐：
**单元测试 GREEN：27 个测试**（14 个原有 + 13 个新增）。现在是 GET 聚合扩展：
接下来是导出路由：
现在进行面板组件更新 —— 迷你图 (sparkline)、导出操作以及页脚文案：
实现已确保达标 (GREEN)。现在执行快速检查：lint、typecheck 和完整单元测试：
**快速检查全部通过：192 个单元测试**（179 个原有 + 13 个新增）。现在重新构建并运行 S20 e2e 规范：
**所有 4 个 S20 e2e 测试均已通过 (GREEN)。** 现在进行全面回归测试 —— 冷启动 e2e db 并测试完整测试套件：
**全量回归测试通过：262 个 e2e**（258 个之前 + 4 个新增），冷数据库，4.4 分钟。**总计 454 个测试通过**（192 个单元测试 + 262 个 e2e）。现在进行验证性重新运行和证据捕获。让我检查一下 S19 捕获脚本模式：
让我编写 S20 证据捕获脚本，遵循 S19 模式：
探测 POST 请求超过了 10 个事件的批量限制。让我来修复这个捕获脚本——使用不同的 `sessionId` 进行分批（`upsert` 会合并相同 `session` 中的重复项）：
已全部捕获：3 种模式下的 5 个 sparklines + export link，无移动端溢出，export 合约已验证（109 行 CSV）。现在让我按照既定模式对捕获的内容进行 VLM 验证：
**所有 3 次 VLM 验证均已通过。** 现在进入文档对齐阶段。从 README 开始：
README 已对齐。接下来处理 AGENTS.md：
接下来是 CLAUDE.md：
CLAUDE.md 已对齐。接下来是 PAD —— 添加 ADR-018 并更新测试分布表：
PAD aligned. Now SKILL.md — adding AP-68 and updating counts:
SKILL.md 已与 AP-68 对齐。现在进行 DEPLOYMENT.md §8.1 的导出提及：
DEPLOYMENT.md 已对齐。.env.example 已审计——未发生变化（导出功能未读取任何新的 env vars；它使用的是 db 和 auth，这两者均已包含在内）。现在开始填写该计划的执行日志：
现在正在编写会话记录 (docs/session_34.md)：
让我验证一下测试数量一致性——精确计算实际的 e2e 测试数量：
Playwright 报告的计数是权威的。让我来获取确切的每个项目的明细：
让我获取每个文件的权威计数，以核对 PAD 表：
测量出的各文件计数显示 PAD 表格中存在历史偏差（calculator 12→11，mobile-navigation 11→10，navigation 41→42，theme-system 12→11）。让我用测量值修正该表格，并添加明确的 setup 行，以便所有内容保持一致（192 unit + 261 chromium + 1 setup = 454）：
表格现在内部一致了。让我修复一下 session_34.md 中的计数引用（它之前有一个过时的数字）：
Now appending the S20 entry to the repo worklog.md:
现在进行最后的门禁检查并更新工作区工作日志：
所有门控已通过（显示为绿色）。现在开始提交和推送阶段。让我先阅读一下 SSH wrapper 的操作说明：
SSH shim 需要重新部署（根据交接规范，已清理）。让我重新构建它，检查 git 身份，并准备提交：
Shim 已部署。现在执行 3 次提交模式——先进行 feat 提交：
3 个 commit 已顺利全部提交。现在进行 SSH 推送 —— 实现 operator key 并进行验证：
Key parses as a valid ed25519. Now the dry-run to authenticate and negotiate:
The wrapper authenticated successfully but defaulted to its built-in `task-management` remote — I must pass the correct `--remote` for omni-study:
试推送已通过 —— 从 `7481f4c` 到 `fa16864` 的干净快进（fast-forward）。现在执行正式推送：
**PUSH CONFIRMED: remote main @ `fa16864` == local HEAD.** 现在进行最后的清理工作——销毁操作员密钥、移除 shim、停止 dev server：
**会话已完成 — S20 RUM panel v3 已推送到 `main` 分支 @ `fa16864`** ✅

**本次会话内容：**

1. **工作区已更新**至 `7481f4c` (S19 + session_33)。所有五份核心文档和四份审查文档均已仔细阅读；已针对基准检查点（lint ✓ tsc ✓ 179 unit ✓）验证了 S19 的衔接点。

2. **所有例行检查均为绿色（通过）**：两个应用上的移动端抽屉（背景遮罩 + 288px 面板 + 20 个链接 + Escape-close 超集 —— 移动端导航正常工作）；自 S19 以来，参考站点未发生更改；克隆端设置保持一致；20 个视图的复制扫描仅显示了已记录的数据状态非差异项；S19 代码审计无异常。

3. **S20 迭代（TDD，454 个测试通过）**：文档中记录的下一个界面 —— `/rum` 上的**趋势折线图**（每个度量卡有 accent 主题的 SVG，使用纯单元固定的几何形状）+ **CSV 导出**（`GET /api/rum/export` —— 符合 RFC-4180 标准的原始值下载，带有 S13/S14 标头契约）。零平价固定（parity-pinned）的 chrome 变更；记录了两个新课程（AP-68）。

4. **证据**：3 个经过 VLM 验证的捕获（亮色/暗色/移动端）+ 导出的 CSV 头部。所有文档均已对齐（README/AGENTS/CLAUDE/PAD ADR-018/SKILL/DEPLOYMENT），`.env.example` 已审计且未变更。

5. **推送**：3 个 commit 模式 → 通过 SSH 包装器推送到 `main` 分支，远程已验证。

**建议的后续步骤**：在你的 Docker 主机上运行 `docker compose --profile init up`（这是最后一个开放验证步骤）；访问你已部署应用的 `/rum` 页面，查看趋势填充情况和导出 CSV。可选择的未来 v4 优化：在图表卡上增加基于 p75 历史记录的时间窗口选择器。
