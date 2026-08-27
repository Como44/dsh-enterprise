# DATA-MODEL —— 数据模型（企业层）

> 原则：企业层只存「归属/可见性/预算/审计索引」；一切执行数据（会话、角色、技能、文件、凭证）继续由 DSH 持有，**引用不复制**。
> 持久化：`$DSH_HOME/enterprise/`（JSON 文件，原子写；未来可换 storageDomain/SQLite）。

## 1. 文件布局

```text
$DSH_HOME/enterprise/
├── data.json           # 组织/成员/资产/外部账号目录（MVP 一份，P1 视体积拆分）
└── usage.json          # (P1) 用量/成本聚合缓存（避免每次全量重算；可重建，非权威）
```

## 2. 核心记录（MVP）

```jsonc
// org（0..n；MVP 支持 1 个主企业 + 切换，多企业预留）
{ "id": "org-1", "name": "…", "description": "…", "plan": "enterprise", "createdAt": 0,
  "defaults": { "defaultAgentId": null, "defaultSkillIds": [] } }

// member（含演示身份标记；真实多用户 P2 才有认证）
{ "id": "u-self", "name": "…", "email": "…", "role": "owner|admin|member",
  "color": "#…", "joinedAt": 0, "lastActiveAt": 0, "quota": null }

// agent：企业 Agent = 引用 DSH AgentPreset + 企业资产字段
{ "id": "agent-…", "name": "…", "description": "…", "icon": "…", "color": "…",
  "presetId": "cordis | …",          // 引用 DSH 角色；null=纯企业描述 Agent（无启动能力）
  "skills": ["…"], "plugins": ["…"], "model": "", "workspace": "",
  "visibility": "enterprise|personal",  // 共享状态
  "status": "draft|published|archived", // 生命周期（MVP: 创建即 published，预留）
  "ownerId": "u-…", "orgId": "org-1", "version": 1, "createdAt": 0, "updatedAt": 0,
  "creatorId": "u-…" }

// asset（统一资产视图的行；Agent/Skill/Plugin/Knowledge 都进这张表，按 refType 区分）
{ "id": "asset-…", "refType": "agent|skill|plugin|knowledge",
  "refId": "…", "name": "…", "orgId": "org-1",
  "ownerId": "u-…", "sharing": "personal|enterprise", "recommended": false,
  "status": "active|archived", "version": 1, "createdAt": 0, "updatedAt": 0 }

// account（外部账号目录：P1 只读展示，P2 完整管理）
{ "id": "acc-…", "platform": "github|feishu|alibaba|shopify|custom-mcp…",
  "label": "…", "connection": { "credentialKey": "…", "scope": { "…": "…" } },
  "boundAgents": ["agent-…"], "createdBy": "u-…", "status": "connected|error|disconnected" }

// knowledge（P1 最小版：目录索引）
{ "id": "kb-…", "title": "…", "path": "…", "visibility": "enterprise|personal",
  "orgId": "org-1", "ownerId": "u-…", "tags": [], "updatedAt": 0 }

// budget（P1 只读展示额度；P2 规则可编辑）
{ "id": "b-…", "orgId": "org-1", "scope": "org|member:<id>",
  "period": "month", "quota": { "costCny": null, "tokens": null },  // null=不限
  "alerts": [ { "thresholdPercent": 80, "notify": true } ] }
```

## 3. 引用 DSH 的对象（永不复制）

| DSH 对象 | 读取方式 | 企业层如何使用 |
|---|---|---|
| AgentPreset | `agentPresets.list()` | Agent 卡片真实能力来源；「对话」用 presetId 开会话 |
| Skill | `skills.list()` | 技能页、Agent 详情、资产行 |
| 会话 | `sessionQuery.listSessions()/readTitleSnapshots()` | 最近工作、归因、审计索引 |
| 会话统计 | `sessionStats` 投影（turns/steps/llmMs/decodeTokens） | 用量面板 |
| 会话成本 | `usageCost` 投影（dsh-cost-line：按模型真实定价） | 成本面板（MVP 优先复用） |
| 工作区 | `workspaceRegistry.list()` | 资源页/归属 |
| 元件/依赖清单 | profile `dsh.profile.bundles` | Plugin 资产行 |
| 凭证 | `credentials`（引用键，不读值） | 外部账号连接的授权状态 |
| Provider/Model | `llm.listProviders()/listModels()` | 成本模型映射（模型倍率来源） |

## 4. 版本与迁移

- `data.json` 顶层 `version`；升级只做增量迁移（当前 version=1）；
- 所有 `refId` 均为「软引用」：DSH 对象删除时企业行保留但标记 `orphan`（P1 提供清理提示）。

## 5. 一致性与并发

- MVP：单文件整写（临时文件 + rename），读取在内存缓存；
- P1 若拆分文件：仍保持「单写者」语义（DSH 单进程内串行）；
- DSH 数据变化（会话新增）无需企业层感知：面板每次拉取实时聚合，成本使用缓存 + TTL。
