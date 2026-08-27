# BACKLOG —— 暂不实现但值得未来考虑

> 优先级：P1（下一批）/ P2（远期）/ Idea（未排期）。来源：Accio 对比 + 用户要求 + 社区反馈。

## P1
- [ ] 成本明细接入 `usageCost`（真实价格表、峰谷、模型维度、时间趋势图）
- [ ] 企业额度/成员额度（只读 + 告警；数据口径标注）
- [ ] 企业知识库最小版（目录索引 + 可见范围 + Agent 引用字段）
- [ ] 推荐资产/企业默认 Agent/Skill
- [ ] Connections 只读目录（账号/连接/绑定 Agent/状态）
- [ ] 审计视图（按成员/Agent 过滤会话）
- [ ] 资产转移 + 离职资产处理箱
- [ ] Plugin 依赖清单展示（供应链透明，不静默更新）
- [ ] 创建向导：模型选择接入真实模型目录（llm.listModels）
- [ ] 时间趋势图（轻量 SVG bar，不引图表库）

## P2
- [ ] 成员额度强制执行（预算规则；llm/stream 拦截或会话策略）
- [ ] 连接完整管理（authorization 流复用：创建/授权/撤销/绑定/Scope）
- [ ] Agent Team 企业视图（复用 agentTeams 服务，只读到管理）
- [ ] Automation 企业化（谁创建/谁拥有/用谁额度/失败通知；复用 schedule）
- [ ] Channels（IM 入口；本地为 dsh-mobile-gate 网关方向，非 IM 平台）
- [ ] 精细权限（部门/资源级 ACL；PERMISSION-MODEL 加 scope 列）
- [ ] 知识库检索与 Agent 自动引用（复用会话检索 base）
- [ ] 企业 Plugin 白名单/依赖治理（allowlist、更新窗口、回滚）
- [ ] 真实多人身份（网关会话→memberId 映射；dsh-mobile-gate 先例）
- [ ] 审计导出（CSV/JSON）

## Idea（观察项）
- [ ] Prompt 资产化（可复用提示词模板）
- [ ] 用量预测（按趋势给预算建议）
- [ ] 货币切换/汇率（dsh-cost-line 已有 CNY/USD 基础）
- [ ] 多企业真正并发（多 orgId 全链路）
- [ ] 团队「当前方法」数字人（企业方法版本页）
