# Accio → DSH 映射表

> 列含义：用户价值（人话）· Accio 行为（证据）· DSH 已有能力（本机验证）· DSH 缺失 · 实现方式 · 是否进入 MVP。
> 证据档位见 `research/accio/ACCIO-CAPABILITY-MAP.md`；未确认项标注「产品决策」或指向 OPEN-QUESTIONS。

## A 类：DSH 已经有 → 只做管理与 UI

| Accio 概念 | 用户价值 | Accio 行为 | DSH 已有能力 | 实现方式 | MVP |
|---|---|---|---|---|---|
| Agent 角色（数字员工） | 用「角色」启动对话 | Agent 是一级对象，档案化 | `agentPresets.list()`（id/name/description/trust/broken） | 企业层只加归属/可见性/绑定视图 | ✅ |
| Skill 目录 | 团队方法可调用 | 技能中心，可安装/分配 | `skills.list()`（modelInvocable 等）+ skill-filesystem | 企业层加共享状态/推荐 | ✅ |
| Agent Team（TL/成员/任务） | 多角色协作 | Team 模式 | `agentTeams`（spawnTeammate/listTasks/updateTask/waitForChange） | 管理视图（P1 只读展示） | P1 |
| SubAgent | 后台并行 | 临时执行者 | `subagents`（startContinuable/listChildren/…） | 用量归因到父 Agent（P1） | P1 |
| Automation | 定时/事件触发 | 自动化任务 | `schedule` 服务 + `workflowEngine` | 企业层：谁创建/谁拥有/用谁额度（P2） | P2 |
| 权限策略（allow/ask/deny） | 动作前把关 | 权限指南 + 审批 | `approval` / `sandboxPolicy` / `permissionPresets` | 企业层只做「角色→预设」映射视图 | ✅(只读) |
| MCP / Connector 授权 | 连通外部 | Connector OAuth/Key | `mcpClient` / `credentials` / `authorization` | 企业目录视图（P1 只读，P2 完整） | P1 |
| Workspace | 项目环境 | Team 关联工作区 | `workspaceRegistry` + `workspaces` client | 企业层标记「公司/个人」 | ✅(字段) |
| 会话与上下文 | 可回溯工作 | Session 列表/历史 | `sessionQuery`（listSessions/readTitleSnapshots）+ 会话日志 | 直接引用，加归属标签 | ✅ |

## B 类：DSH 有底层，缺企业层 → 开发治理层

| Accio 概念 | 用户价值 | Accio 行为 | DSH 底层 | 缺失治理 | 实现方式 | MVP |
|---|---|---|---|---|---|---|
| Credits/用量面板 | 知道谁用了多少 | 0.26 起 Credits 面板 | `sessionStats`（turns/steps/llmMs/decodeTokens）+ `tokenMeter` + `dsh-cost-line` 的 `usageCost` 投影（按模型真实定价、峰谷计价、source+checkedAt 价目表） | 企业聚合：按 成员/Agent/模型 分组 + 估算成本 + 时间趋势 | 企业层读投影做聚合视图 | ✅（用量+估算成本） |
| 团队积分池/额度 | 控制成本 | Credits 充值/消耗 | 无额度概念 | 额度模型（企业池 + 成员额度 + 预算规则） | `AIComputeBudget`（P1 只读展示，P2 强制执行） | P1 |
| 企业知识库 | Agent 用公司知识 | 知识库（六维3层） | fs/workspace + 会话检索（sessionQuery） | 知识条目表 + 可见范围 + Agent 引用 | 新表 `knowledge`（P1 最小版：文件目录索引） | P1 |
| 资产共享（团队一键共享） | 能力留公司 | 企业版 App 端一键共享 | AgentPreset/Skill 均为本地对象 | 「个人→企业」发布/撤回 + 推荐/默认 | `assets` 表 + 共享状态机 | ✅ |
| 审计 | 谁做了什么 | 企业级审计 | 完整会话日志（可 trace/query） | 企业视图（不重做日志） | 聚合层：按成员/Agent 过滤会话 | P1 |
| 多账号隔离 | 账号不串 | Connector 多账号 | credentials 多 key + authorization | 账号目录 + Agent 绑定 + 范围 | ACCOUNT-MODEL 表 | P1（只读） |

## C 类：DSH 完全没有 → 本插件实现（限定范围）

| Accio 概念 | 用户价值 | 实现方式 | MVP |
|---|---|---|---|
| 企业空间（组织） | 公司拥有的工作台 | `org` 记录 + 本地单实例企业 + 可切换（产品决策） | ✅ |
| 成员与角色 | 谁在管理谁在使用 | `members` 表（owner/admin/member 三态） | ✅ |
| 企业资产中心（Agent/Skill/Plugin 统一视图） | 统一管理可复用能力 | `assets` 表 + 引用 DSH 对象 | ✅ |
| 企业 AI 额度面板 | 成本可见 | 聚合 sessionStats/usageCost + 预算字段 | ✅ |
| 创建智能体向导 | 员工自助建角色 | 五步向导（已实现，绑定预置角色） | ✅ |
| 外部账号目录 | 统一连接资源 | `accounts` 表 + credentials 引用 | P1 |

## D 类：Accio 特有业务/商业化设计 → 不盲目复制，记录决策

| Accio 行为 | 为什么只是它的商业模式 | DSH 的处理 |
|---|---|---|
| 平台 i豆（阿里生态代币） | 平台生态计费，不是通用 AI 成本 | 不引入；用真实 API 价格表计费 |
| 积分充值/支付/套餐 | SaaS 商业化 | 不复制；额度=预算规则（可选） |
| Agent Hub 市场分发+静默更新 | 生态治理，供应链风险大 | 不做市场；企业内共享需显式发布 |
| 绑定阿里国际站店铺的「生意助手」 | 垂直业务能力 | 抽象为 External Account + Connector 绑定 |
| 移动端/桌面端体验 | 产品形态 | DSH 是 Web + LAN 网关（dsh-mobile-gate）；不复制桌面端 |

## 关键判断（供产品模型使用）

1. **80% 底层能力 DSH 已有**，企业层的核心工作是「对象关系 + 可见性 + 归因 + 政令视图」，不是重造 Agent 引擎；
2. **成本层是最值得做的差异化**：DSH 已有真实 per-model 计费（dsh-cost-line），企业面板能给出比 Accio 积分更透明的结果（真实 API 价格 + 峰谷 + 缓存命中）；
3. **资产共享是三倍价值点**：DSH 的 AgentPreset/Skill 本来就面向「文件化」，企业层加共享状态即成立；
4. 多用户/认证是最大未知：DSH 本机单用户，多人访问已有 dsh-mobile-gate 网关先例；真正的「企业多人」需要网关 + 身份映射，列入 OPEN-QUESTIONS 并在 MVP 中按「本地企业空间 + 成员表（演示身份）」处理。
