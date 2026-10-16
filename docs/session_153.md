# Session 153 — S57 summary

**S57 已完成并推送到 main**（证据提交，远端 == 本地已验证，密钥已销毁）。

本次会话是 **S56 之后的到场审计会话**：自 S56 以来仅有一个纯文档提交
（ce97049 = session_151，git show --stat 验证）。工作区已被重置，按
S52/S53/S55 配方执行全新克隆重建（bun install 489 包、.env 来自
.env.example、db:push + db:seed、playwright chromium v1243）。

**本次会话的唯一发现 —— F1/F2：AP-90 挂载前门控竞争（测试套件缺陷，
零应用代码缺陷）**：

- **F1（实跑观察到）**：基线冷库 e2e 第 1 轮读到 **298/299** —— 
  parity-session8 的 S8-A 导航图标 pin 报 "Expected length: 20 /
  Received length: 0"（911 毫秒，无超时 —— 竞争签名而非真实缺陷签名）。
- **根因（代码研读）**：page.tsx 中 `loadFromUser()` 在 `await
  dataPromise`（初始集合预热）**之前**应用主题（`--sf-primary`），
  而 shell 要等认证与预热**两者**都完成才从 Splash 翻转（S16-A 防
  CLS 设计）—— 所以 `hydrated()` 门控在 Splash 期间即可满足，
  `evaluateAll`（不自动等待）读到 0 个图标。这正是 **AP-90 已归档
  教训**："挂载前可满足的等待条件不能作为挂载后读取的门控" —— 该
  守卫此前已应用到 S43 扫描探针及其 S41/S42 兄弟，但未回移植到
  这两个 e2e 规格。
- **F2（同机制的潜在孪生）**：accessibility 的 S12-B "首个 Tab 停靠"
  测试 —— `gotoMode` 的模式等待（html.dark 缺席）可被**预水合引导
  脚本**在首帧满足，挂载前按 Tab 会落在 `<body>` 上。
- **确定性复现（RED）**：一次性诊断规格（运行后删除）—— 仅对
  Dashboard 的 5 个预热端点注入 600 毫秒延迟（/api/auth/me 保持
  快速）：F1 读到 `shell: false / icons: 0`（与实跑失败逐字节一致）；
  F2 读到 `BODY "Loading StudyFlow…"`。
- **修复（TDD，仅测试代码，两文件 +14 行）**：把 AP-90 守卫
  `waitForFunction(() => !!document.querySelector("aside nav"))` 折入
  两个规格，注释记录机制；断言不变、pin 数不变、应用代码零触碰。
- **GREEN 证明**：同一诊断在**相同延迟**下用修复后门控重跑 —— F1
  读到 20/20 图标、F2 读到 `A "Skip to main content"`；诊断删除后
  全量冷库重跑 **299 通过（4.6 分钟）= 1133 green**，计数锚恢复。

**到场审计（其余全部 GREEN）**：预检 + 抽屉检查 GREEN；实时 390×844
走查 GREEN —— **移动端导航菜单工作正常，未发现 Tailwind v4 bug**
（陷阱 4/7/9 运行态验证干净）；克隆双态侧边栏（260/260/1020 与
80/80/1200 + 共享抽屉 288px/svgX 32/988 对 755）全部吻合；**参考
站点重扫：自 S52 以来无变化**（四锚点 + 双态 + 共享抽屉，偏好已恢复
展开 "true"）；Mode-C 审查零应用代码发现（静态扫描干净，三项已归档
例外复核）；dep-audit GREEN（2 项建议均非生产面、0 运行时可达）。

**注册表复查**：braces 不变（3.0.3 = 最新发布版，修复版不存在）；
deepmerge-ts 的稳定修复路径在 **Prisma 7.10.1** 上再次确认
（@prisma/config@7.10.1 → deepmerge-ts 8.0.2；7.x 稳定线终于
7.10.1），新漂移一项：`latest` dist-tag 现指向 **Prisma 8 RC**
（8.0.0-rc.23）—— 7.x 稳定版仍在 `prev` 上。S56 的判断决策再获
确认：大版本 ORM 升级保持为**专设会话的指定下一步候选**（所有者
决策），不做会话内顺手升级。

**确认**：常设审计套件在守护进程上完整重跑（S32 分离配方）—— 判定
与 35 行证据信封见 `docs/screenshots/s57-standing-suite-evidence.json`；
5 张开发服务器截图（套件后重开 + 重登）+ 2 张参考站点截图已保存。

**下一步**：常设未决项更新为 —— ① 所有者决策：是否为 deepmerge-ts
建议专设 Prisma 7 升级会话（完整再验证弧）；② 所有者 Docker 主机上的
首次真实 `docker compose --profile init up`；③ braces 等待上游发布
修复版。到场复扫（双态）继续保留在协议中。
