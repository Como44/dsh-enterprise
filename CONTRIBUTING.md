# Contributing

感谢您想为 dsh-enterprise 贡献力量。

## 项目原则（请先读）

1. **复用 DSH，不重造**：能用 DSH 原生能力（agentPresets / skills / sessionQuery / projections / credentials / authorization / schedule / agentTeams…）就绝不自己实现一遍；
2. **数据隔离**：企业数据只写 `$DSH_HOME/enterprise/`；DSH 数据只读引用；
3. **成本诚实**：任何价格都必须来自验证过的官方价目（含 source + checkedAt），未知价格显示 `?`，不做估算；
4. **不复制品牌**：不引入 Accio/其他产品的 logo、插画、图标素材与私有代码；
5. **零侵入**：只通过 Slot 叠加，不修改 DSH 原生界面；改动必须保持「卸载插件 = 完全恢复原 DSH」。

## 提交流程

1. Fork + 分支（`feat/…`、`fix/…`）；
2. 改代码前先看 `docs/`（产品模型是实现的依据）与 `DECISIONS.md`（重大决策记录）；
3. 提交前必须通过：
   - `node --check lib/index.js && node --check lib/client.js`
   - 括号/括号栈检查（编辑 `lib/client.js` 的 JSX 替代写法时尤其注意嵌套平衡）
4. PR 说明：改了什么、为什么、如何手动验证（界面路径）；
5. 涉及产品语义（权限/成本/资产规则）的改动，请先在 `docs/DECISIONS.md` 记录「问题/候选/选择/为什么/证据/何时重估」。

## 代码约定

- `lib/index.js`：Node ESM，只有 `node:*` 内置依赖；服务通过 `ctx.get()`/`ctx.inject()` 获取；
- `lib/client.js`：`window.__ModuleLoader__.load` + `factory(require)`，**无 JSX/TS**，一律 `React.createElement`；样式写在 `CSS` 模板字符串（`entm-` 前缀，深浅色变量）；
- 中文 UI + 英文技术标识；数字/时间格式化统一走 `fmtNum/fmtMs/timeAgo`；
- 所有聚合数据在 UI 上标注口径（来源/限制），诚实优先。
