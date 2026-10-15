# Session 147 — S55 summary

**S55 已完成并推送到 main**（测试代码修复提交 + 会话日志提交，远端 == 本地
已验证，密钥已销毁）。

本次会话是 **测试套件加固会话**：工作区被重置后的全新克隆重建中，整个
会话期间沙箱时钟都停在 **UTC 10 月 15 日** —— 项目历史上第一次在 "15 日"
运行完整 playwright e2e 门禁，由此发现 **两个测试层缺陷**（应用代码零发现）：

- **F1（确定性，3/3 复现，297/299）**：两个日历 "取消选中今天" 的 pin
  （parity-session8 + dark-mode）硬编码点击 "15 日" 来移动选区 —— 但当
  UTC 日期恰为 15 日时，这一点击落在 **已被选中的今天** 上：选区不动、
  today 单元格保持 violet-500 选中填充、`waitForFunction` 等待染色直到
  45 秒超时。此前 54 个会话从未命中：完整 playwright 门禁从未在 UTC 15
  日运行过（S54 的基线 e2e 运行于 10 月 14 日 UTC 23 时；午夜后的常设
  套件是 agent-browser 脚本，不是 playwright 套件）。修复：从网格自身的
  `[data-today]` 标记读取 "另一天"（今天=15 → 点 16）—— 永不点击今天，
  且与运行器时钟无关（S28 设计通道原则）。断言不变。
- **F2（闪断，2/~10 复现）**：S52-F 抽屉面板宽度 pin 在 `toBeVisible()`
  之后立即测量 `getBoundingClientRect().width`，与面板 0.25 秒
  `sf-slide-in` 入场动画（`scale(0.98)`）竞态 —— 动画中读数 ≈282px，
  |282−288|=6 超出 <2px 容差。修复：`expect.poll` 轮询最终宽度（S8
  最终值原则；常设 drawer-check 一直免疫 —— 它读的是 transform 无关的
  `getComputedStyle().width`）。动画本身是对等行为，保留。

**验证**：两个日历 spec 在 15 日当天通过（1.1 秒，45 秒超时消失）；s52
spec 连跑 6/6 全绿；完整门禁恢复 **1133 green**（lint ✓ tsc ✓ 834 单元 ✓
构建 ✓ 冷库 299 e2e ✓，4.7 分钟）。**计数锚点（1133/834/299）不变** ——
修复纯测试代码，pin 数量无变化。

**到场审计（其余全部 GREEN）**：预检 + 抽屉检查 GREEN；实时 390×844 走查
GREEN —— **移动端导航菜单工作正常，未发现 Tailwind v4 bug**（陷阱 4/7/9
运行态验证干净）；克隆双态侧边栏（260/260/1020 与 80/80/1200 + 共享抽屉
288px/svgX 32/988 对 755）全部吻合；**参考站点重扫：自 S52/S53/S54 以来
无变化**（四个常设锚点 + 双态 + 共享抽屉，偏好已恢复展开）；Mode-C 审查
零应用代码发现；依赖审计 GREEN + 注册表复查（braces 3.0.3 仍是最新发布版；
deepmerge-ts 8.0.2 仍需 RC 阶段的 Prisma 8 —— 两项建议在上游均无法修复）。

**scandihaven 技术栈模式参考**：其移动导航测试纪律（390×844 焦点受限
Radix 抽屉）、Tailwind v4 字面量 token 契约、作用域断言 E2E 原则均已
在本代码库体现 —— 无需架构变更（最小安全差异原则）。

**确认**：常设审计套件在守护进程上完整重跑（判定见
`docs/remediation-plan-session55.md` 执行日志 + 35 行证据信封
`docs/screenshots/s55-standing-suite-evidence.json`）。

**下一步**：常设未决项不变 —— 所有者 Docker 主机上的首次真实
`docker compose --profile init up`；上游依赖补丁（braces > 3.0.3 与携带
deepmerge-ts ≥ 8 的稳定版 Prisma）。到场复扫（双态）继续保留在协议中。
