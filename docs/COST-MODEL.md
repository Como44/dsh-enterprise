# COST-MODEL —— AI 使用额度与成本模型

> 目标（人话）：让企业管理员看到「谁、在哪个 Agent 上、用了哪个模型、花了多少钱」，并可选地上限。
> **不引入"积分"**：积分是 Accio 的虚币（充值/套餐/i豆），DSH 版本直接采用**真实成本计量**——更透明、可审计、可对账。

## 1. 归一化对象

```text
Token（真实计量）＋ API 价格表（Provider×Model，含峰谷/缓存价）＋ Session 归因
        ↓ 归一化
企业可理解的 AI 使用额度：成本（CNY/USD 可选）＋ Tokens ＋ 调用量
```

| DSH 已有 | 提供什么 | 用法 |
|---|---|---|
| `sessionStats` 投影 | turns/steps/llmMs/ttft/decodeTokens/toolMs | 用量维度（会话/回合/步骤/耗时） |
| `tokenMeter` | 会话 token 测量（含缓存命中） | 会话级 token |
| `usageCost` 投影（**dsh-cost-line 已实现**） | 按模型归因的真实成本（请求头→消息行，use-time 价格，峰谷调度，source+checkedAt 价目表，CNY/USD） | 成本维度——**MVP 直接复用** |
| `llm.listModels/listProviders` | 模型目录 | 倍率/价格映射的补充来源 |

## 2. 维度视图（MVP 全部可做）

| 视图 | 分组键 | 来源 |
|---|---|---|
| 企业总消耗 | 时间（日/周/月） | 会话投影聚合 |
| 成员消耗 | memberId（会话→成员：MVP 为演示映射，P2 真身份） | 同上 |
| Agent 消耗 | agentPreset/企业 Agent | 同上 |
| 模型消耗 | provider+model | usageCost 明细 |
| 任务/会话消耗 | session（最近 N + 可下沉单会话） | 同上 |
| 估算成本 | 同维度 × 真实价格 | usageCost |

## 3. 额度（P1 只读，P2 强制执行）

```text
额度 = 预算规则（Budget Rule）：
  scope: 企业 | 成员:<id>
  period: 日/周/月
  limit: 成本上限（CNY）或 Token 上限（null=不限）
  alerts: [ { thresholdPercent: 80, notify: true } ]
```

- MVP：仅有企业总额度字段展示（UI 显示"本月估算成本"，不做拦截）；
- P1：成员额度展示 + 告警提示；
- P2：强制执行（达到额度时 DSH 侧拒绝/降级：接入 `llm/stream` waterfall 或会话策略，需谨慎设计）；加"预算规则"编辑页。

## 4. 成本正确性承诺（继承 dsh-cost-line 原则）

- 价格必须是**已验证的官方价**（每条含 `source` URL + `checkedAt`，未收录模型显示"未知价格"而非估算）；
- `priceOverrides` 允许企业配置自定义模型价格（如内部 MCP 计价）；
- 峰谷价按**调用发生时间**解析，不手动切换；
- 计量口径明确：usageCost 走 `request/header → assistant/message` 归因（与官方统计行口径一致），会话压缩不改变数值。

## 5. 与 Accio 积分的关键差异（产品决策）

| 维度 | Accio 积分 | DSH Enterprise |
|---|---|---|
| 单位 | 积分（虚币，规则不透明） | 真实价格 × Tokens（透明可对账） |
| 来源 | 套餐/充值/赠送 | 无需充值；消费即记录 |
| 倍率 | 模型/上下文/工具的内部倍率 | 官方价目表（可覆盖） |
| 平台耦合 | 阿里生态 i豆并存 | 无平台代币 |
| 可审计 | 面板可见 | 可下钻到单会话单消息 |

## 6. 实现笔记

- 聚合缓存：`usage.json`（TTL，非权威，可删重建）；第一次构建时按 40—200 会话扫描；
- 读取路径：`sessionQuery.listSessions()` → 每会话 `sessionStats` + `usageCost`（投影注册表优先，缺失时后端兜底）；
- 需要下钻单会话时用 `sessionQuery.readSession()/listEvents()`（勿在列表模式下全量展开）。
