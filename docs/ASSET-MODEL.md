# ASSET-MODEL —— 企业 AI 资产模型

> 核心问题（人话）：**一个员工创造的 AI 能力，怎么从"个人能力"变成"公司能力"？公司怎么保证能力留下来、版本不混乱？**

## 1. 什么算"企业 AI 资产"

只要是「企业里可以被别人复用的 AI 能力」就算：Agent、Skill、Plugin、Knowledge（P1），Prompt/Agent Team（P2 观察项）。
统一进 `assets` 表（refType 区分），一处看全。

## 2. 资产的双轴：归属 × 共享

```text
                  归属（orgId 谁持有）
          organization（企业）      personal（个人）

共享     enterprise  企业共享（全员可见/可用）   发布态（个人 → 企业）
         personal    企业私有（仅创建者+Admin）  个人私有（离职归个人）
```

- **新建默认：归属=个人，共享=个人**（先私有，符合直觉）；
- **发布动作**（personal→enterprise 且归属转企业）：MVP 为 Admin 一键发布；P2 支持审核流；
- **撤回动作**：企业共享→回个人私有（仅创建者可发起，Admin 可强制）；
- **推荐/默认**：Admin 可把资产标为 `recommended`（首页"企业推荐能力"），或设为企业默认（新 Agent 自动带）。

## 3. 生命周期（MVP 实现 → P2 扩展）

```text
草稿 draft（P2 显式化；MVP 创建即 published）
  → 发布 published（企业共享）
  → 推荐 recommended（可以叠加）
  → 版本 version++（每次"升级"自动 +1，旧版本保留字段）
  → 撤回 unpublished → 归档 archived（不删除，可恢复）
  → 删除 delete（仅个人私有或 创建者+Admin 同意；企业共享删除=归档）
  → 转移 transfer（P2：移交归属人或企业）
```

## 4. 员工离职的资产处理（产品决策，非 Accio 确认 —— 见 OPEN-QUESTIONS Q5）

| 资产类型 | 规则（本产品决策） |
|---|---|
| 企业共享（organization+enterprise） | **留在企业**；创建者字段保留（显示"原创建者"）；可被 Admin 重新指派 |
| 企业私有（organization+personal） | 留在企业但仅 Admin 可见，可归档或（Admin）公开 |
| 个人私有（personal） | 归档，随成员移除进入"待处理箱"；Admin 可发布为企业资产或删除 |

产品里要写清楚一句人话：**"员工可以离开，公司的方法留下来。"**（这是 Accio 企业版宣传同样想表达的点）

## 5. 版本与"当前方法"

- 企业层不复制 DSH 版本系统，而是：资产行 `version` + `updatedAt` + 变更摘要（P1）；
- 提供「当前采用版本」的显式说明（如：询盘分析 Skill v3 为当前版）；
- AgentPreset / Skill 的文件级版本仍由 DSH 管理（`agentPresets` 的 copy/remove 等），企业层只记录"哪个版本被企业引用"。

## 6. 与 DSH 的引用关系

| 资产类型 | DSH 实体 | 引用方式 | 企业层需要做的 |
|---|---|---|---|
| Agent | AgentPreset | `presetId` | 归属/共享/推荐/归档 + 创建向导（绑定 preset 或空白） |
| Skill | skills registry | `refId=name` | 共享/推荐 + 展示 modelInvocable |
| Plugin | profile bundles | `refId=name` | 企业默认启用清单（P2 治理） |
| Knowledge | workspace/fs 目录 | `refId=path` | 目录索引 + 可见范围（P1 最小） |
