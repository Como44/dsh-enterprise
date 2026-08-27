# STATUS —— 当前真实状态

> 更新：第 4~5 轮（UI 迭代 v0.6.x：闪回修复 + Agent-first + 自动生成 Preset）。本文件是唯一状态来源，每轮结束更新。

## 当前阶段
**v0.6.6 已发布并部署到本机**（GitHub Release + `C:\Users\xqcom\.dsh\enterprise` 数据 + 用户级 `.agent-presets` 自动补齐），等待用户硬刷验证后进入 P0 收尾。

## 已完成
0. **开源与发布（前轮）**：MIT + 产品文档 12 份（docs/）+ README/CONTRIBUTING/CHANGELOG；仓库 `Como44/dsh-enterprise`（public），发布 v0.1.0…v0.6.6；awesome-dsh-plugin 已收录（Enterprise & Team）。
1. **架构落地**：host `lib/index.js`（状态快照/会话视图/持久化/action 集）+ client `lib/client.js`（Slot 注入：sidebar.footer.action 入口 + shell.overlay 全屏工作台）；纯 DSH 原生主题令牌（`--dsw-*` → `--entm-*`），不替换任何原生 UI。
2. **产品原则已贯彻**：
   - Agent-first：任务从智能体开始；DSH 预置（standard/code/minimal/cordis）= **新会话的会话设置（模式）**，不是角色智能体；新任务右栏仅 **一个** 企业默认角色；
   - 新建智能体 = 生成**真实 AgentPreset**（`agent.cordis.yml` + preset.yml + IDENTITY/SOUL/AGENTS/MEMORY/USER.md 五核心文件，用户级 `$DSH_HOME/.agent-presets/`）；
   - BYO-API/自托管：无积分/虚拟币，管理员在「API 配置」页配置源头 API；成本 = 真实价格投影（usageCost）。
3. **v0.6.3~0.6.6 关键修复（本轮冲刺）**：
   - **v0.6.3** ErrorBoundary 包裹整个 overlay：渲染异常不再静默卸载 slot → 闪回防护（错误可见化）；
   - **v0.6.4** 用 ErrorBoundary 捕获到真实报错 `settingsOpen is not defined` → 补上 0.6.2 遗失的 `useState` 声明（闪回根因）；
   - **v0.6.5** 任务侧边栏 **Agent-first 分组**：组标题 = 企业智能体名（不再出现「标准模式/创造模式」等预置名），无归属会话收进「临时任务」；
   - **v0.6.6** 启动自动 `ensureAgentPresets`：为所有 `presetId` 为空的智能体（含演示智能体与丢失旧预设的「运营助手」）**自动生成真实 AgentPreset 并持久化绑定**（幂等）→ 默认角色 = 真实企业智能体，不再回退显示「标准模式」；状态 GET 兜底 ensure。
4. **数据现状（本机验证）**：
   - `data.json`：org=测试企业；6 智能体全部 `presetId` 绑定（agent-agent / agent-agent-vptm… / agent-attn「运营助手」），authored=true，5 核心文件就位；
   - `.agent-presets/` 已生成 6 个用户级预设目录；状态接口 200（含 6 agents + 10 presets + 40 会话）；
   - 客户端 bundle（rev 随文件变化）已确认包含 0.6.5 分组修复；host 为 0.6.6（重启后 PID 8296）。
5. **开发/验证基建**：restart-once 机制（schtasks + `F:\rh.cmd` → `restart-dsh-once.cmd`，40s 延迟 + 日志）已验证可用；控制台 GBK 乱码 ≠ 文件损坏（验证走 Node readFileSync）；package.json 任何 PowerShell 写入后必须去 BOM。

## 正在进行
- 用户硬刷验证 v0.6.6（任务侧边栏「临时任务」组 + 默认角色=供应分析 Agent + 智能体可直接对话）。

## 下一步（优先级排序，用户确认后执行）
1. **P0-1 智能体详情改版**：左侧 身份/插件/技能/核心文件 页签 + 右侧实时预览；核心文件可编辑（写回 `.agent-presets/<id>/` 对应 MD）。
2. **P0-2「设为企业默认」**：默认角色选择（当前为第一位智能体）。
3. MVP 对账：用量成本页接真实价格、企业额度字段、Connections 页完善。
4. 生态推广：awesome-dsh-plugin 收录复核 + README 功能截图（等 UI 稳定）。

## 阻塞项
- 无阻塞。真实多人身份（P2）依赖网关方案，未定。

## 需要用户判断
- ① 智能体详情改版交互（左标签 + 右预览 + 核心文件可编辑）是否认可，确认后开工；
- ② PRODUCT-MODEL 中「离职资产规则」（Q5）与「成本=真实价格」（D4）是否认可（不阻塞当前开发）。
