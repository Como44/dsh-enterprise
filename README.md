# dsh-enterprise — DSH Enterprise Mode（开源企业工作台）

> **企业自购上游 API + 自托管**的 Agent-first 企业工作台：把 DSH 从「个人 Agent Harness」升级为「公司可以多人使用、共同沉淀 AI 能力、统一管理权限 / 资产 / 成本 / 外部账号的 AI 工作平台」。
> 产品理念参考 Accio Work Business（企业版），但**不复刻品牌、素材或私有实现**；成本模型采用**真实 API 价格 × 用量**（无平台积分、无充值，企业只买源头 API）。

## 为什么是 BYO API

```text
企业  →  购买上游 API（DeepSeek / OpenAI 兼容 / 其他 Provider）
       →  DSH 内配置 Provider 与模型
       →  dsh-enterprise 企业层：
           · 用量与成本面板（真实价格表 × Tokens，可对账）
           · 企业额度（预算规则，P2 强制执行）
           · 数据全部留在本机（$DSH_HOME/enterprise/ 只存企业记录）
```

没有「积分」：积分是 Accio 平台商业化产物（且与阿里生态 i豆并存）。开源版给企业的是**透明、可审计、可对账**的开支视图。

## 功能（MVP）

```text
Enterprise（全屏工作台，DSH 原界面零改动）
├── 总览       我的智能体 · 最近工作 · 快速开始 · 企业推荐能力
├── 智能体     企业 Agent 目录（全部/企业共享/个人）+ 五步创建向导（选择起点→身份与模型→插件→技能→用户信息）
├── 技能       企业可用 Skill
├── 企业资产   智能体/技能/插件 统一视图（创建者/归属/个人⇄企业共享/更新时间）
├── 使用量     企业总用量 + 按智能体 + 按成员（DSH 会话统计真实聚合）
└── 组织
    ├── 成员   Owner / Admin / Member（添加/删除/改角色）
    └── 设置   企业名称/说明 · 计费方式说明 · 演示数据重置
```

## 安装

```bash
dsh plugin --profile web add github:Como44/dsh-enterprise
# 或本地开发：dsh plugin --profile web add link:F:\dsh-plugins\dsh-enterprise
# 重启 dsh web，浏览器硬刷新（Ctrl+Shift+R）
```

使用：DSH 侧边栏底部「Enterprise」→ 打开企业工作台；「退出企业模式」回到原 DSH。

## 架构

```text
plugins/dsh-enterprise/
├── lib/index.js    host：GET/POST /plugins/dsh-enterprise/state（企业数据 + 实时聚合 DSH 数据）+ 持久化（原子写）
└── lib/client.js   client：全屏工作台（shell.overlay）+ 入口按钮（sidebar.footer.action）
docs/               产品模型文档（PRODUCT-MODEL / DATA-MODEL / PERMISSION-MODEL / COST-MODEL / ASSET-MODEL / ACCOUNT-MODEL / UI-IA / MVP / ACCIO-TO-DSH）
```

- **复用优先**：AgentPreset（角色）、Skills、会话与统计（`sessionStats`）、模型成本（`usageCost`，可配 dsh-cost-line）、凭证库（`credentials`）、授权流（`authorization`）、团队（`agentTeams`）、调度（`schedule`）——企业层只加「归属/可见性/归因/预算」。
- **数据隔离**：企业记录只在 `$DSH_HOME/enterprise/data.json`；DSH 对象全部只读引用。
- **零侵入**：Slot 叠加（入口 + 全屏浮层），卸载即完全恢复原 DSH。

## 安全与边界

- 路由仅本机回环可达（与 DSH Web 服务同源）；凭证值永不进入企业层（只存引用键）；
- 未收录价格的模型显示「未知价格」而非估算（继承 dsh-cost-line 的价格完整性原则）；
- MVP 成员为**产品内身份**（DSH 本机单用户）；真实多人身份 P2 接网关。

## 与 Accio 的关系

参考其产品范式（Agent-first、企业资产共享、用量可见、组织控制层），明确不复制：Logo/插画/图标素材/私有代码/未公开实现；不引入平台代币与充值体系；不做 Agent Hub 市场与静默更新（企业内共享必须显式）。

## 路线图

- **MVP（当前）**：企业空间、成员三态、资产中心、用量面板、统一后台、创建向导；
- **P1**：成本明细（真实价格表 + 时间趋势）、企业/成员额度（只读+告警）、企业知识库最小版、推荐资产、连接目录、审计视图；
- **P2**：额度强制执行（预算规则）、连接完整管理（授权/绑定/Scope）、Agent Team 企业视图、Automation 企业化、Channels、精细权限、真实多人身份。

详见 `docs/MVP.md`、`docs/ACCIO-TO-DSH.md` 与 `BACKLOG.md`。

## 开发

```bash
# 开发环境：把插件 link 进 web profile 后，改 lib/ 文件 → 重启 dsh web → 硬刷新
node --check lib/index.js && node --check lib/client.js
```
