# Changelog

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与 [SemVer](https://semver.org/lang/zh-CN/)。

## [0.6.3] - 2026-08-27

### Fixed（闪回防护：渲染错误不再被静默卸载）

- **ErrorBoundary 包裹整个企业模式界面**：任何子组件渲染异常不再导致 slot 卸载、界面闪回 DSH 原生页，而是显示「界面渲染出错（已拦截）」卡片 + 错误消息 + 「返回 DSH」按钮；
- 若再次出现闪回，错误文本会直接显示在界面上（此前是被 React 静默卸载，无从排查）——把它截图/发给我即可定位根因；
- 修正 package.json description 里的历史乱码（`闂?`），版本号 0.6.3。

## [0.6.2] - 2026-08-27

### Fixed / Changed

- **「会话设置」收拢**：模式（DSH 预设）/ 模型 / 权限 折叠进输入卡内的「会话设置」展开区，工具栏只保留 工作目录 / 会话设置 / 发送 —— 模式不再占据主工具栏（仍是新会话的设置项，默认「跟随角色」）；
- **清理乱码数据**：移除命令行测试产生的乱码角色（`测试角色` 存储值与 `agent-agent` 预设目录）——该乱码来自 shell 测试调用（控制台 GBK），向导路径（浏览器）不受影响；角色目录名改为 ASCII slug 且中文名正常写入 preset.yml。

## [0.6.1] - 2026-08-27

### Changed（角色与模式分离）

- **DSH 预置（standard/code/minimal/cordis）= 新会话的模式设置**，不再是角色智能体：新任务工具栏新增「模式」选择（跟随角色 / 标准 / 代码 / 极简 / 运行时等），选模式时以该预置作为新会话运行方式（提示：不加载角色人设，模式=会话设置）；
- **新任务页右栏 = 单个默认角色**：右侧面板展示企业默认智能体（仅一个：头像/名称/说明/技能/开始对话），不再展示预置角色卡片网格；底部「可用智能体」网格移除；
- 智能体页移除「DSH 预置角色」区块（只展示企业智能体）；
- 修复中文名生成的角色 id（slug 仅 ASCII，中文名自动加随机尾缀）；验证：`agent-agent` 类目录名不再出现，角色名会正确写入 preset.yml。

### Notes

- 0.6.0 开始新建智能体即生成真实 AgentPreset（核心文件 + 人设上下文），可直接开始；本次只做展示层分离。

## [0.6.0] - 2026-08-27

### Added（核心架构修正：新建智能体 = 生成真实 AgentPreset + 核心文件）

- **新建智能体真正生效**：空白智能体 → host 自动在 `$DSH_HOME/.agent-presets/<agent-id>/` 生成真实 AgentPreset 目录：
  - `agent.cordis.yml`：以部署 `minimal` 预置为基底 + `dsh-persona` 行（**人设文本 = 上下文装配的核心**，遮蔽部署默认人设；支持 {{model}}/{{cwd}} 变量）；
  - `preset.yml`：名称/说明/排序（被 agentPresets 实时发现）；
  - **五个核心文件** `IDENTITY.md / SOUL.md / AGENTS.md / MEMORY.md / USER.md`（对齐 Accio 核心文件概念：身份/职责/能力/风格/用户信息，由向导字段自动生成，可后续编辑）；
- 创建后 agent 的 `presetId` 指向新角色 → **卡片立即「对话」**（无需再绑定已有预置）；agentPresets 名录为无缓存实时读取，重启前即可见；
- 智能体详情新增「核心文件（上下文）」标签展示。

### Notes

- 生成的角色目录属用户级（`.agent-presets`），与部署预置隔离；删除该目录即移除角色；
- 原有「绑定预置角色」路径保留（演示 Agent / 复用部署角色）。

## [0.5.3] - 2026-08-27

### Changed（UI 对齐 DSH 原生风格）

- **主题 token 直连**：全部配色改为消费 DSH 原生主题变量（`--dsw-alias-bg-base / bg-layer-1 / border-l1·l2 / label-primary·secondary / brand-primary / state-* / dsw-specific-sidebar-fill`）——深浅色与主题切换**自动跟随 DSH**，删除自维护调色板与 prefers-color-scheme 覆盖；
- **视觉度量原生化**：卡片/弹窗/向导圆角 12–16 → 8–10；阴影改为轻量；侧边栏使用 DSH 专属侧栏填充色；主操作按钮保持品牌色，次级按钮/智能体按钮/chips 改为中性描边风格；Banner 从绿色渐变改为中性面板样式；错误/警告标签使用 DSH 状态色。

## [0.5.2] - 2026-08-27

### Changed（新任务页工具栏补齐）

- **新任务输入卡**增加与聊天一致的工具栏：选择工作目录 + **模型下拉**（默认模型/全目录，创建会话后自动应用 `session.selectModel`）+ 权限·原生说明 + 圆形发送键；
- 场景 chips 与主发送按钮均使用所选模型。

## [0.5.1] - 2026-08-27

### Changed（对话区分度 + 基础选项）

- **对话双栏气泡**：助手消息左对齐（智能体头像 + 白卡气泡），用户消息右对齐绿色气泡，工具调用为灰色摘要行（⚙ 前缀）——不再单列不分；
- **聊天工具栏新增**：当前工作区（点击打开/新建工作区）、**模型切换**（`llm.models` 目录下拉 → `session.selectModel` 立即生效）、**权限·原生**（说明 DSH allow/ask/deny 在每次动作与审批面板生效）；
- 会话头部显示 会话标题 + 智能体标签（agentPreset 名称）。

## [0.5.0] - 2026-08-27

### Fixed（UI 检测计划 A3/A4/A5 三项）

- **历史会话无法在模式内打开**：① `/conversation` 端点在此前从未被加载（服务器未真正重启——重启机制失效，见下）；② 冷会话（历史/非 live）surface 读取失败时**无回退**。已加 `readSession` 原始日志回退（同样的消息映射），冷会话也能在模式内打开；
- **工作区无法新增**：「选择工作目录」弹窗新增「新建工作区」（`workspaces.pickDirectory` → `create({path})` → 刷新快照）；
- **重启机制失效（根因修复）**：此前所有「延迟重启」脚本在受限会话中静默未执行（logs/restart-once.log 缺失，服务器 PID 一直未变）。改为 **Windows 任务计划（schtasks）一次性任务** + 日志三阶段（begin/kill/done），可验证。

### Added（BYO-API 配置页）

- **组织 → API 配置**：`llm.providers` 目录（41 个 Provider，显示 已启用/未启用 + 配置命名空间）+ 通用 `settings.describe/mutate` 编辑器（schemastery 递归转标量表单，密钥字段不回显，`expectedRevision` 冲突保护）；默认模型命名空间（agent-default-model）可配置；
- 说明区明确模型清单由 Provider 路由自动解析（无需逐个新增模型）。

### Notes

- Provider 配置变更后**重启 dsh web** 确保完全生效（llm 路由在启动时组装）；
- 新增 `docs/UI-AUDIT.md` 检测计划（A 关键路径 / B 已修问题 / C 待检项 / D 已知限制）。

## [0.4.2] - 2026-08-27

### Changed（UI 对齐 Accio Work「新任务」截图）

- **新任务界面居中化**：智能体头像/名称/描述居中（右上「切换智能体」）、大输入卡（圆角 + 阴影 + 占位「输入问题…(@引用文件)」）、底部工具栏（选择工作目录 + 圆形绿色发送键）、场景 chips 居中横排；
- **侧边栏智能体分组交互**：组头 hover 显示「新建任务」（✏️）按钮 → 点击立即在该智能体下新建对话（createSession + 模式内打开），组头点击选中该智能体到新任务页，「N 项/收起」保留；
- 新任务页底部保留「可用智能体」网格（点选即切换目标智能体）。

## [0.4.1] - 2026-08-27

### Fixed

- **点击 Enterprise 闪回原生 DSH 界面**（根因）：`NewTaskPage / SettingsPage / MembersModal / TeamEditorModal` 在 `if (!snap) return …` 之后调用 `useState`/`useEffect`，违反 React Hooks 顺序规则 —— 首帧（快照加载前）1 个 hook，快照到达后变 3+ hooks，React 抛错导致 overlay 槽被卸载。已将全部 hooks 移到早期返回之前（SettingsPage/TeamEditorModal 用 `useEffect` 同步快照数据）；
- MembersModal 提交后自动清空输入；TeamEditorModal 打开时重置表单。

## [0.4.0] - 2026-08-27

### Added（模式内直接对话，不再跳转原生 DSH）

- **模式内会话界面 ChatPage**：「新任务」发送或「开始任务」→ 在该模式内创建 DSH 会话并**直接对话**（消息列表 + 输入框 + 轮询增量刷新 1.6s）；
- **统一 RPC 封装** `apiCall(method, payload)`：`session.create` 创建、`session.prompt`（mode: queue）发送，全部留在 Enterprise 模式内；
- **host 会话读取端点** `GET /plugins/dsh-enterprise/conversation?sessionId=&after=`：读取会话 surface（user/message、assistant/message、tool/result），支持 `after=seq` 增量轮询；标题/预置角色随响应返回；
- 侧边栏「任务」、Agent 详情「最近会话」、工作区打开 —— 全部改为**模式内打开会话**（不再关闭 overlay）；
- 发送中状态（…）、发送按钮禁用、Enter 发送/Shift+Enter 换行、自动滚动到底部。

### Notes

- 消息渲染为纯文本（用户/助手气泡 + 工具行摘要）；富文本/图片/流式高亮后续迭代；
- 轮询为最佳努力：会话被删除或服务未挂载时静默降级（不报错不打断）。

## [0.3.0] - 2026-08-27

### Changed（结构性重构：Agent-first 会话模式）

- **取消首页**：默认界面改为「新任务」——选择智能体（企业 Agent / 预置角色）→ 场景快捷入口（办公提效/设计/建站/采购/数据分析）→「开始任务」以该角色创建 DSH 会话并进入对话（复用 `session.create{agentPreset}`）；
- **侧边栏重排**（对齐 Accio Work 结构）：新任务 / 智能体 / 插件 / 知识库(P1 占位) + **任务分组**（按智能体分组的会话列表，组头收起/展开）+ 组织组（企业资产/技能/成员/使用量/连接/设置）；
- **智能体团队**（复用 DSH agentTeams）：团队 = 企业定义（名称/说明/TL 预置角色/成员角色）；「以团队开始」用 TL 开会话；团队详情可查看**运行时视图**（成员/任务看板，best-effort 对 live 会话）；
- **DSH 原生设置映射**：设置页展示 主题/语言（client theme/locale 只读）+ Provider/默认模型/插件数/角色数，附「在 DSH 中打开设置」入口指引；
- 新增动作：`team.create / team.update / team.delete / team.runtime`（runtime 为只读查询，不落盘）。

### Notes

- 团队运行时依赖会话为 live（DSH agentTeams 需要实际 Team 会话）；非团队会话显示提示而非报错；
- 知识库页为 P1 占位（目录索引 + 可见范围）。

## [0.2.0] - 2026-08-27

### Added

- **真实成本面板**：使用量页接入 `usageCost` 投影（dsh-cost-line）：估算成本卡 + 「按模型（真实价格）」表（输入/输出/缓存 Tokens + 成本，未收录价格标记 `?`）；按智能体表新增成本列；未知价格诚实提示；
- **企业额度**：org 增加预算字段（月度 / 成本上限 / 告警阈值），使用量页展示，设置页可编辑（P1 记账展示，P2 强制执行）；
- **资产推荐**：资产行「推荐」开关（asset.recommend），首页「企业推荐能力」改为读取推荐资产（无推荐时回退到技能列表）；
- **连接与 Provider 页**：展示当前部署 Provider 列表、默认模型（llm + agentDefaultModel 只读），外部账号目录占位（P1）；
- **成员额度列**：成员表新增「月度额度」列（预留字段，默认 —）；
- 首页导航「Organization」分组更名为与 UI-IA 一致的「组织」，新增「连接」入口。

### Notes

- 成本数据来源：`sessionProjections.stateOf(session, 'usageCost')`（live）与投影缓存（cold）；未启用 dsh-cost-line 时显示引导提示而非报错；
- 版本语义：0.2.0 为 MVP 收尾（成本/额度/推荐/Provider 可见性），0.1.0 基础上无破坏性变更。

## [0.1.0] - 2026-08-27

### Added

- **企业工作台（MVP）**：DSH 侧边栏入口 + 全屏浮层（`shell.overlay`），原界面零改动；
- **总览**：我的智能体 / 最近工作 / 快速开始（场景 chips）/ 企业推荐能力；
- **智能体页**：全部/企业共享/个人页签、搜索、Banner、卡片（圆头像+能力标签+绿色「对话」按钮）、DSH 预置角色卡；
- **五步创建智能体向导**：选择起点（空白/预置角色）→ 身份与模型（头像风格+实时预览）→ 插件 → 技能（自动调用开关）→ 用户信息 → 完成并启动；
- **企业资产中心**：智能体/技能/插件统一视图 + 个人⇄企业共享切换；
- **使用量**：企业总用量 + 按智能体/按成员（DSH `sessionStats` 投影真实聚合）；
- **成员管理**：Owner/Admin/Member，添加/删除/改角色；
- **设置**：企业名称/说明、计费方式说明（BYO API）、演示数据重置；
- **host 数据层**：`GET/POST /plugins/dsh-enterprise/state`，企业记录原子持久化于 `$DSH_HOME/enterprise/data.json`；
- **引用层**：AgentPreset 名录、Skill 目录、会话列表与标题、会话统计、工作区、插件（bundles）——全部只读引用；
- 演示种子数据（示例企业/成员/智能体，UI 带「演示」徽标）。

### Notes

- 成员为产品内身份（DSH 本机单用户）；真实多人身份 P2 接网关；
- 成本面板暂为用量维度（turns/steps/Tokens）；真实价格成本（per-model）见 `docs/COST-MODEL.md`（复用 dsh-cost-line 的 `usageCost` 投影，P1 接入）。
