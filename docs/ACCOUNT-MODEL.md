# ACCOUNT-MODEL —— 企业外部账号与连接资源

> 目标（人话）：公司有很多"外面的系统"（国际站店铺、Shopify、GitHub、飞书、CRM…），企业层要把它们统一管起来，并且**严格禁止个人账号、企业账号、Agent 权限互相污染**。
> 不写死任何平台：抽象层在上，Alibaba/Shopify 只是它的实例。

## 1. 对象（人话 → 专业名）

| 对象 | 人话 | 英文 |
|---|---|---|
| 外部账号 | 公司拥有的某个外部系统的身份（"张三的 GitHub"或"公司国际站店铺"） | External Account |
| 连接 | 一条实际授权的凭证接入 | Connection（DSH `credentials` + `authorization` 承载） |
| 资源范围 | 这条连接能用到的资源边界（哪些仓库/店铺/组织/目录） | Resource Scope |
| Agent 绑定 | 哪个数字员工被允许用哪条连接 | Agent Binding |
| 成员权限 | 谁可以创建/撤销/使用连接 | Member Permission |

## 2. 关系图

```text
External Account ──拥有──> Connection ──引用──> Credential（DSH 凭据库，值永不回读）
      │                              │
      │                              └── Scope（店铺A/组织X/目录Y…）
      │                                       │
      │                                        v
      └── 被 Administration 可见           Agent Binding（Agent → Connection + Scope）
                                                    │
                                                    任务（会话）执行时按绑定选连接
```

## 3. 隔离原则（五条铁律）

1. **凭证值只在 DSH 凭据库**，企业层只存引用键（`credentialKey`），永不存储/回显；
2. **两个账号两条连接**：即使同一平台同一 API，也按账号实体分开（避免多账号串用）；
3. **Agent 只绑"连接+范围"**，不持有凭证；Agent 可用能力 = 绑定关系可推导集；
4. **成员权限与连接授权是两道门**：成员能创建连接 ≠ 该连接被企业允许；Agent 可用连接 ≠ 成员可使用该 Agent（回 PERMISSION-MODEL）；
5. 断开连接 → 立即失效相关 Agent 能力，但历史会话/产物不受影响（数据归企业）。

## 4. 状态机

```text
draft（草稿）→ authorized（已授权，oauth/API Key 验证通过）→ error（中断/过期）
                                        ↕ 刷新/重新授权
connected（正常使用中）→ revoked（撤销，历史保留）→ removed（从目录移除）
```

## 5. 落地排期

| 阶段 | 内容 |
|---|---|
| P0（MVP） | 不做（连接目录预留 `accounts` 表字段） |
| P1 | 只读目录：列出企业已配置的连接（从 DSH credentials 可描述视图读取状态），展示「所属成员/状态/绑定 Agent」 |
| P2 | 完整管理：创建/授权（复用 `authorization` 流）/撤销/删除；Agent 绑定 UI；Scope 编辑；成员权限控制 |

## 6. 对 DSH 的复用

- `credentials.describe()`（无值视图：configured/source/writable）→ 连接状态；
- `authorization.registerFlow/begin/describe` → 授权流程（OAuth/API Key）；
- `mcpClient` → MCP 型连接；
- 未来接平台：Alibaba（店铺 API）、GitHub（已由 dsh-github 提供工具）、飞书（lark-* 工具集）——全部表现为「平台插件 + 连接条目」，企业层无需感知平台细节。
