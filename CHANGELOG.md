# Changelog

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与 [SemVer](https://semver.org/lang/zh-CN/)。

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
