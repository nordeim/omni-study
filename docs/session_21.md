I'll continue the omni-study multi-session task. This briefing references `docs/session_18.md` and `docs/session_19.md`, meaning sessions 16–18 have likely landed on remote. Let me first verify the workspace state.
本地工作区已有 `omni-study` 仓库。让我刷新工作区并确认真实状态：
工作区已刷新至 `9af907b`，`docs/session_19.md` 刚从远端拉取。让我检查文档体系确认会话 16–18 的落地情况：
仓库已有 session_16–19 文档，但整改计划停留在 session13（无 session14–18 的独立 remediation plan）。让我看完整 git 历史和关键文档：
Sessions 1–13 有完整的 fix+audit 提交模式，但 session 14 之后只有 "update session log" 提交。让我检查这些提交的实际内容：
Session 14–18 均为纯文档提交（无代码变更）。现在读取关键文档——先是当前会话指令 `docs/session_19.md`：
状态已明确：**S13（韧性迭代）已完成并推送**（`88c0626`，348 tests green：123 unit + 225 e2e），`docs/session_19.md` 是上一会话的原始叙述。本会话将执行 **S14 审计迭代**，建议面为：离线/连通性 UX、settings 持久化回路、安全审查（限流/cookie 标志/MIME 白名单）、AI 表面 a11y 深度 + 常设移动端抽屉检查。

先建立任务清单：
现在精读关键文档。先读 S13 整改计划与 worklog 尾部：
S13 上下文完整。现在精读核心五文档（先看规模）：
AGENTS.md 行超长导致输出被持久化。改用持久化文件分段读取：
AGENTS.md 已完整内化。现在读 README 与 skills 目录：
README 已内化。现在看 skills 目录与 PAD/SKILL 的最新部分：
环境契约验证通过。现在重建环境并运行基线门禁：
发现陈旧脚本问题（`check-db-state.mjs` 引用不存在的模型）。检查其他脚本的陈旧度：
多个陈旧脚本确认为原仓库遗留（引用不存在的模型/绝对路径）。这是 S14 的清理候选。先跑基线门禁：
基线门禁绿灯（lint ✓ · tsc ✓ · 123 unit ✓ —— 与 S13 文档一致）。启动 dev server 验证数据库：
审计脚本需要 :3000 上的外部 dev server。用 setsid+nohup 启动并跨工具调用保活：
环境就绪。开始 S14 审计。先审查安全相关源码（cookie 标志、限流覆盖）：
Auth 路由已审（cookie 标志齐全、login/register 均限流）。现在搜索离线/连通性处理与 AI a11y 相关代码：
AI 转写列表无 aria-live（S14-D 候选发现）。现在检查 settings 视图的持久化回路：
AI 路由无限流确认。现在做常设移动端抽屉检查（双站 390×844）。先看既往脚本如何探针参考站：
现在编写常设移动端抽屉检查脚本（S14 优先检查项）：
探针选中了隐藏的桌面侧栏。检查克隆端移动抽屉的真实 DOM 结构：
修正探针——克隆抽屉为 `role=dialog` 结构。更新脚本用可见性过滤：
**常设移动端抽屉检查：GREEN** ✓（backdrop 等价序列化、288px 白面板、20 链接、无 footer、Escape 关闭超集）。

现在深入审计四个 S14 表面。先检查 toast 组件的 a11y 细节与数据加载错误处理：
Toast 有 aria-live（错误会被朗读）。S14-D 聚焦转写区。现在编写四个 S14 审计工具（连通性、settings 回路、安全、AI a11y）：
结果需复核（探针假阳性纪律）。检查 "unavailable" 消息来源与 onoffline 假阳性：
确认：AI 离线路径由通用 catch 兜底（S13 回滚真实覆盖传输失败）。但 A0 探针有假阳性（`typeof window.onoffline` 恒非 undefined）。修正探针：
连通性审计完成：**1 项发现**（无全局连通性感知）+ 5 项验证过的非差距。现在写 settings 回路审计：
Settings 默认在 Appearance 标签，Display name 在 Profile 标签。修正导航：
头像在 Appearance 标签（S11 教训）。修正 B2/B5 先切回 Appearance：
B4 是探针伪影（重载后默认在 Appearance 标签，#display-name 不在 DOM）。修正后复核：
Settings 审计完成：**1 项发现**（空白名原样持久化）+ 4 项非差距。现在编写安全审计：
安全审计有 2 个探针伪影需复核（cookie path 正则、logout 无状态语义）。验证 logout 路由代码：
Logout 为无状态会话的既有文档化设计（token 至过期前有效）。修正两处探针误判：
安全审计定稿：**3 项发现** + 4 项非差距。现在编写 AI a11y 审计（S14-D）：
D1/D4 是探针顺序伪影（空转写无 `<ul>`；D4 在 MathSolver 页运行）。修正后重跑：
AI a11y 审计定稿：**3 项发现** + 1 项非差距。最后验证剩余陈旧脚本的可运行性（hygiene 家族）：
审计阶段完成。现在验证剩余代码接缝（api.ts、solver 容器、AI 路由结构），为整改计划做文件级对齐：
验证 resilience spec 的 toast 断言（网络错误映射可能影响它）：
Resilience spec 无 toast 文本断言（安全）。检查 e2e 套件中是否有真实 AI 调用会被限流 pin 毒化：
仅 resilience spec 触碰 AI 路由且全部被拦截（无真实服务端调用）——限流 pin 安全。现在撰写 S14 整改计划：
整改计划已保存并逐文件验证。开始 TDD 执行——先看现有测试约定：
写 RED 单元测试（api-offline + auth 扩展）：
单元 RED 观察到位（3 失败：offline 映射×2 + 自定义 max×1）。现在写 e2e RED spec：
构建并观察 e2e RED 状态：
7 失败/1 通过——检查每个失败模式是否为设计内 RED：
全部 7 个 spec 均为设计内 RED。开始 GREEN 阶段——按家族逐一实现。

**1. A0b — api.ts 网络错误映射接缝：**
**验证 A0b 单元 GREEN：**
**2. A0 — ConnectivityBanner 组件：**
**3. B3 — settings 路由守卫 + 客户端 trim：**
**4. C1 — 限流器泛化 + 四个 AI 路由：**
Auth 单元 GREEN（13 通过）。将限流应用到四个 AI 路由：
**5. C3 — 下载响应头加固：**
**6/7. D1/D2/D3 — 转写区与求解器的 live region：**
**8. E1 — 删除陈旧脚本：**
全部 GREEN 变更已应用。运行门禁序列：
Lint 规则禁止在 effect 内同步 setState。改用 `useSyncExternalStore`（外部系统订阅的惯用法）：
三重门禁绿灯（lint ✓ · tsc ✓ · **131 unit ✓** = 123 + 8 新 pin）。构建并跑 S14 spec 验证 GREEN：
A0 在第一个断言失败——检查 Dashboard 视图的 h1 实际内容：
Dashboard 的 h1 是时段问候语而非 "Dashboard"——修正 spec 断言：
**S14 spec 全 8 pin GREEN。** 运行完整回归套件（225 prior + 8 new）：
**全部 232 个 e2e 测试通过**（225 个原有 + 7 个新增，冷数据库）= **363 个测试全部通过**（131 个单元测试 + 232 个端到端测试）。

现在进行验证阶段——先确认 dev server 已热载新代码，再复跑审计：
Dev server 已热载（B3 守卫生效）。更新审计脚本以验证修复后状态（banner 出现、限流生效、消息映射）：
C3 已修复（hardened ✓）但 C1 补丁未应用。检查并修复：
限流验证通过（20→429）。将 MIME allowlist 重分类为文档化决策，复跑其余审计：
连通性审计修复后：**0 发现 / 7 非差距**。复跑 settings 与 a11y 审计：
D1 探针检查 `<ul>` 本身而非其 live 容器（修复放在容器 div 上）。修正探针语义：
**四项审计全部 GREEN。** 现在编写证据截图脚本（参照 capture-s13 惯例）：
运行证据截图前重启 dev server 清空限流预算：
4 张证据截图完成。快速 VLM 抽检（假设生成器纪律——截图状态已由脚本内 waitForFunction 断言验证）：
VLM 确认 banner+toast+bounce-back 全部到位。但发现 a11y 审计在聊天史留下探针消息（unroute 后挂起请求继续到真实服务器）。清理污染行并重拍：
8 行探针数据已清。发现新审计教训：**unroute 会让挂起的请求继续到真实服务器**。修补 capture 脚本 step 4（先 reload 杀掉挂起请求再 unroute）：
证据截图验证通过。进入文档对齐阶段。先更新 README：
README 完成。现在更新 AGENTS.md（命令表 + 新契约 + 测试怪癖）：
CLAUDE.md 更新（契约 + 测试金字塔 + 数量）：
PAD 更新（ADR-012 + 数量 + 威胁模型 + 已知问题修正）：
SKILL.md 完成。现在附加整改计划执行日志：
撰写本会话叙述 `docs/session_20.md`：
更新仓库根 worklog.md（追加 S14 条目）：
最终验证与提交准备。检查 git 状态与 .env.example 一致性：
全门禁绿灯。检查 S13 的 3-commit 模式文件分布以复刻：
复刻 3-commit 模式。**Commit 1（修复）：**
**Commit 2（文档）：**
**Commit 3（会话日志）：**
3 个提交就绪，工作树干净。现在按技能说明执行 SSH 包装脚本推送：
推送手册已内化。检查环境（ssh 二进制/paramiko/已有 shim）：
Shim 已就绪（session-18 遗产）。物化操作员密钥并验证指纹：
Dry-run 绿灯（fast-forward `9af907b..92ea87f`）。执行真实推送：
**推送已验证** —— 远端 `main` @ `92ea87f` == 本地 HEAD，密钥已粉碎。清理 dev daemon 并更新工作区 worklog：
**Session 14（加固迭代）完成并已推送至 main @ `92ea87f` —— 363 tests green（131 unit + 232 e2e）。**

**发现：** S13 只 hardened 了单请求失败路径，但四类**环境态**完全不可见——断网无任何提示（用户只能看一个个 "Failed to fetch" toast 猜）、空白显示名可被原样保存、四个 AI 路由（唯一按请求计费面）完全无限流、AI 回复对屏幕阅读器完全静默。

**修复（TDD，8 unit + 7 e2e 新 pin）：** 全局离线横幅（在线渲染 null——结构性 byte-parity）+ 人类可读的离线消息；每用户 20/15 分钟 AI 预算（429 + Retry-After）；下载响应 nosniff + no-store；空白名 400；转写区与求解器 aria-live。四项审计复跑全绿，抽屉常设检查 GREEN。一个新教训（AP-56）：unroute 会放行挂起的请求到真实服务器。

**建议下一步：** 拉取仓库亲测——断网发送 AI 消息看横幅+回弹；或按 session_20 建议的下一批表面（登录 UX 深度、Files 搜索对等、键盘快捷键、pre-1.0 依赖/体积审计）继续迭代。
