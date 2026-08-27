# Changelog

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与 [SemVer](https://semver.org/lang/zh-CN/)。

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
