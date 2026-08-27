# DECISIONS —— 重大决策记录

格式：问题 / 候选 / 选择 / 为什么 / 证据 / 何时重新评估。

## D1 载体形态：动态插件 vs 部署插件
- 问题：企业模式以什么形态交付。
- 候选：① 动态 Cordis 插件（会话级、需 UI 授权、重启即失）；② 部署插件 `plugins/dsh-enterprise`（host client 双半，durable）。
- 选择：**② 部署插件**。
- 为什么：客户端激活需审批且与"never 审批策略"冲突；企业模式应持久、可开关、可迭代；与已装生态（dsh-image-inline/dsh-github）一致。
- 证据：本机实验（cordis_run 返回 awaiting-approval）+ 已装插件范式 + README 安装流程。

## D2 UI 接入：替换 sidebar/conversation vs shell.overlay 全屏浮层
- 候选：① 替换主列（真"模式"但丢失原界面、退出复杂）；② `sidebar.footer.action` 入口 + `shell.overlay` 全屏浮层。
- 选择：**②**。
- 为什么：原 DSH 零改动、退出=关闭浮层、可靠可逆；聊天留在原生界面（不重造）。
- 证据：Slot 树查询（replaceRisk 标注）+ dsh-image-inline 已验证 overlay 机制。

## D3 数据存储：storageDomain vs 自有 JSON
- 候选：① storage hub domain（zod schema、原子写、迁移器）；② 自有 `$DSH_HOME/enterprise/*.json`（tmp+rename）。
- 选择：**②（MVP）**，①未来可平滑迁移。
- 为什么：避免 zod 依赖（部署插件的依赖解析窄），数据量小，语义简单；②满足命名空间隔离与原子写。
- 证据：storage-domain 需 zod schema（依赖须引入）；dsh-github 同款"最小依赖"插件实践。

## D4 成本模型：复刻积分 vs 真实成本
- 候选：① Accio 式积分（虚币/充值/倍率）；② 真实价格表 × Tokens（归一化额度）。
- 选择：**②**。
- 为什么：透明、可审计、可对账；DSH 已有 dsh-cost-line 的 `usageCost` 投影（按模型真实定价、峰谷、source+checkedAt）——**直接复用即得**；"积分"是 Accio 商业化产物。
- 证据：dsh-cost-line README（本机已安装）；Open-Questions Q2/Q3。

## D5 成员体系：真实认证 vs 产品内身份
- 候选：① 接网关做真身份；② 产品内身份（成员表 + 演示映射标注）。
- 选择：**②（MVP）**。
- 为什么：DSH 本机单用户，真实多用户需网关级身份注入（dsh-mobile-gate 先例），是独立课题；MVP 先把产品结构与归因跑通。
- 何时重估：P2 接网关/多用户时，把"网关心跳身份→memberId"映射接入即可，规则不变。

## D6 资产共享：一键共享 vs 审核发布
- 候选：① 成员一键发布；② Admin 审核发布。
- 选择：**①（MVP 创建者可发布，Admin 可撤回/强制）**，审核流 P2。
- 为什么：MVP 要快；发布权约束在 Admin 撤回能力上兜底。
- 何时重估：企业真实多人使用后，若资产事故多发，开审核流。

## D7 命名：Enterprise Mode（不叫"积分/席位"）
- 选择：品牌名 Enterprise Mode；额度面板叫「使用量与成本」；成员角色叫 拥有者/管理员/成员（UI 标注 Owner/Admin/Member）。
- 为什么：避免与 Accio 品牌混淆；「成本」比「积分」诚实。

## D8 面板数据口径（诚实优先）
- 选择：所有聚合标注来源与限制（最近 40 会话 / 演示映射 / 未知价格显式 `?`）。
- 为什么：管理层误读成本比缺功能更糟；dsh-cost-line 的"价目表 integrity"原则为项目标配。

## D9 开源 + BYO API（自托管）定位
- 问题：开源后的商业模式与成本语义。
- 候选：① 复刻 Accio 积分/充值（商业 SaaS 逻辑）；② 开源自托管 + 企业买源头 API。
- 选择：**②**（dsh-enterprise 为 MIT 开源插件；上游 API 由企业自购配置；本插件只加企业治理层）。
- 为什么：DSH 本身支持多 Provider 配置（settings → 模型）；「真实成本 + 预算规则」比「平台积分」透明；无支付/合规负担；数据留本机符合企业私有化诉求。
- 证据：DSH llm 服务（registerConfigurableProviders / listProviders）；Accio 双货币（积分 + i豆）观察；COST-MODEL D4。
- 何时重估：若社区出现「托管版需求」，另立项目（本插件保持开源核心）。

## D10 产品文档归属
- 选择：产品模型文档随项目走（`docs/`），Accio 事实调研留在研究仓库（`research/`）。
- 为什么：开源仓库的读者要的是「为什么这么设计」；Accio 调研证据单独归档，避免两个事实源。
