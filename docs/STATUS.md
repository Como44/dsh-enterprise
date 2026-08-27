# STATUS —— 当前真实状态

> 更新：第 3 轮（开源化 + BYO API 定位）。本文件是唯一状态来源，每轮结束更新。

## 当前阶段
**开源仓库就绪（MIT + 产品文档随项目），等待发布决策与 MVP 对账收尾。**

## 已完成
0. **开源项目化（本轮）**：
   - 仓库根：`F:\dsh-plugins\dsh-enterprise`（真实目录，已 git init；`F:\DeepSeek Harness\plugins\dsh-enterprise` 为 junction；profile 依赖 `link:F:/dsh-plugins/dsh-enterprise` 不变，dump-config PASS，state API 200）；
   - 开源文件：MIT LICENSE、README（BYO API 定位 + 架构 + 路线图）、CONTRIBUTING、CHANGELOG（0.1.0）、.gitignore；
   - 产品文档 12 份随项目迁入 `docs/`（PROJECT/DECISIONS/STATUS/BACKLOG + 8 份模型）；Accio 事实调研留在研究仓库（research/accio/）。
1. **Accio 调研**（证据标注）：
   - 能力地图 `research/accio/ACCIO-CAPABILITY-MAP.md`（15 类能力，确认度×DSH 状态）；
   - 企业版实证：**Accio Work Business**（2026-08 香港上线，港媒 4 篇）；团队 Skills/Agent 一键共享（3 篇报道）；i豆 vs 积分两套货币（论坛实测）；省钱技巧/企业知识库文章；官方 changelog 地址确认（accio.com/work/documents/en/changelog.html）；
   - 未知事实集中到 `research/accio/OPEN-QUESTIONS.md`（9 条，均不阻塞；需用户截图验证的已打包列好）。
2. **DSH 调研**：
   - 服务目录/事件/Slot/类型定义全量过一遍（agentPresets、skills、sessionQuery、sessionStats、tokenMeter、**usageCost（dsh-cost-line）**、schedule、agentTeams、subagents、credentials、authorization、mcpClient、workspaceRegistry、webServer、apiProxy RPC 信封）；
   - 生态扫描：awesome-dsh-plugin ×2、dsh-usage-plugin、DSH-plugin(kbtime)（用量/费用/峰谷）、dsh-mobile-gate（多人访问网关先例）、dsh-session-manager（会话/工作区删除）。
3. **产品模型**：`design/` 下 8 份文档 + `ACCIO-TO-DSH.md` 映射表（A/B/C/D 四分法）。
4. **代码现状**（前两轮已交付，非本轮新写）：
   - `plugins/dsh-enterprise`（F:\DeepSeek Harness\plugins\dsh-enterprise，junction 于 F:\dsh-plugins\dsh-enterprise，已装进 web profile）；
   - host：企业数据 API + 持久化 + 种子 + agent.create/bind/update；client：绿色视觉 + 智能体页（页签/搜索/Banner/添加入口）+ 五步创建向导 + 首页 chips + 最近任务；
   - 已验证：`/plugins/dsh-enterprise/state` 200、dump-config 通过、语法与括号栈 0 失衡。

## 正在进行
- 无（本轮以文档为主，按用户指示暂停主体开发）。

## 下一步
1. MVP 对账：把「已实现 vs MVP.md」差异补齐（用量成本页接 `usageCost` 真实价格、企业额度字段、版本/推荐字段、Connections 占位页）；
2. 请用户验证 OPEN-QUESTIONS（提供 Business 版截图：成员管理/积分明细/后台总览/知识库/连接管理）——**批量验证，不逐条打断**；
3. 用户确认产品模型（PRODUCT-MODEL / MVP 范围）后进入 P0 收尾开发。

## 阻塞项
- 无阻塞。真实多人身份（P2）依赖网关方案，未定。

## 需要用户判断
- ① PRODUCT-MODEL 中「离职资产规则」（Q5）与「成本=真实价格而非积分」（D4）是否认可；
- ② 是否愿意提供 Accio Work Business 后台截图（见 OPEN-QUESTIONS 集中清单）。
