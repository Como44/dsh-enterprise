// dsh-enterprise — client bundle: the Enterprise Mode working surface.
//
// Two additive contributions, both through the Slot system, no shipped UI is
// replaced:
//   - sidebar.footer.action "Enterprise"  -> opens the mode
//   - shell.overlay (full-screen surface)  -> the Enterprise workbench itself
//
// The overlay is a complete independent workspace: left nav, Overview, Agents,
// Skills, Assets, Usage & Cost, Members, Settings. It reads its data from the
// host route /plugins/dsh-enterprise/state and never touches DSH session,
// profile, or workspace data.
window.__ModuleLoader__.load({
  id: 'dsh-enterprise',
  factory: (require) => {
    const React = require('react')
    const { useState, useEffect } = React
    const el = React.createElement

    const ROUTE = '/plugins/dsh-enterprise/state'
    const ROUTE_CONV = '/plugins/dsh-enterprise/conversation'

    // ------------------------------------------------------------------ css
    const CSS = `
.entm-ic { display: block; }
.entm-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; background: var(--entm-bg); color: var(--entm-text); pointer-events: auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Roboto, sans-serif; }
.entm-overlay { --entm-bg: #f7f8fa; --entm-panel: #ffffff; --entm-border: #e4e7ea; --entm-text: #171b20; --entm-text2: #7a828c; --entm-accent: #00a573; --entm-accent-strong: #008f63; --entm-accent-soft: #e6f6ef; --entm-danger: #e5484d; --entm-ok: #00a573; --entm-shadow: 0 12px 40px rgba(16,24,32,.12); --entm-hover: #f1f3f5; }
@media (prefers-color-scheme: dark) { .entm-overlay { --entm-bg: #101114; --entm-panel: #17181c; --entm-border: #26272c; --entm-text: #f2f3f6; --entm-text2: #969ca6; --entm-accent: #23b586; --entm-accent-strong: #23b586; --entm-accent-soft: rgba(0,165,115,.16); --entm-danger: #f47070; --entm-ok: #23b586; --entm-shadow: 0 12px 40px rgba(0,0,0,.5); --entm-hover: #1e1f24; } }
.entm-sidebar { width: 226px; flex: none; display: flex; flex-direction: column; background: var(--entm-panel); border-right: 1px solid var(--entm-border); padding: 14px 10px 12px; }
.entm-brand { display: flex; gap: 10px; align-items: center; padding: 2px 8px 12px; }
.entm-brand-mark { width: 30px; height: 30px; border-radius: 9px; background: var(--entm-accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 750; font-size: 15px; flex: none; }
.entm-brand-name { font-size: 13.5px; font-weight: 700; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entm-brand-sub { font-size: 11px; color: var(--entm-text2); }
.entm-nav { flex: 1; overflow: auto; display: flex; flex-direction: column; gap: 2px; padding-top: 2px; }
.entm-group { font-size: 11px; letter-spacing: .06em; color: var(--entm-text2); padding: 16px 10px 4px; }
.entm-nav-item { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--entm-text); }
.entm-nav-item:hover { background: var(--entm-hover); }
.entm-nav-item.active { background: var(--entm-accent-soft); color: var(--entm-accent); font-weight: 650; }
.entm-nav-item svg { color: var(--entm-text2); }
.entm-nav-item.active svg { color: var(--entm-accent); }
.entm-sidebar-task { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12.5px; color: var(--entm-text); }
.entm-sidebar-task:hover { background: var(--entm-hover); }
.entm-sidebar-task .t { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entm-sidebar-task .d { font-size: 10.5px; color: var(--entm-text2); flex: none; }
.entm-sidebar-foot { border-top: 1px solid var(--entm-border); padding-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.entm-user { display: flex; align-items: center; gap: 8px; padding: 4px 8px; font-size: 12.5px; }
.entm-user-dot { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 600; flex: none; }
.entm-exit { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; color: var(--entm-text2); cursor: pointer; }
.entm-exit:hover { background: var(--entm-hover); color: var(--entm-text); }
.entm-main { flex: 1; overflow: auto; padding: 24px 32px 60px; }
.entm-page { max-width: 1120px; margin: 0 auto; }
.entm-h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
.entm-sub { font-size: 13px; color: var(--entm-text2); margin: 0 0 18px; line-height: 1.55; }
.entm-sec { margin: 24px 0 0; }
.entm-sec-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 10px; }
.entm-sec-title { font-size: 14.5px; font-weight: 650; }
.entm-sec-link { font-size: 12.5px; color: var(--entm-accent); cursor: pointer; }
.entm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(205px, 1fr)); gap: 12px; }
.entm-card { background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 12px; padding: 15px 14px 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
.entm-card:hover { border-color: var(--entm-accent); box-shadow: var(--entm-shadow); }
.entm-card-active { border-color: var(--entm-accent); background: var(--entm-accent-soft); }
.entm-card-top { display: flex; gap: 10px; align-items: center; }
.entm-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex: none; }
.entm-card-title { font-size: 14px; font-weight: 650; line-height: 1.3; }
.entm-card-desc { font-size: 12px; color: var(--entm-text2); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px; }
.entm-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.entm-tag { font-size: 10.5px; padding: 2px 7px; border-radius: 999px; background: var(--entm-hover); color: var(--entm-text2); }
.entm-tag.accent { background: var(--entm-accent-soft); color: var(--entm-accent); }
.entm-tag.warn { background: rgba(224,140,0,.13); color: #b45309; }
.entm-card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.entm-agent-btn { width: 100%; border: 1px solid var(--entm-accent); background: var(--entm-accent-soft); color: var(--entm-accent); border-radius: 8px; padding: 7px 10px; font-size: 12.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: background .12s; }
.entm-agent-btn:hover { background: var(--entm-accent); color: #fff; }
.entm-agent-btn[disabled] { opacity: .55; cursor: default; }
.entm-caption { font-size: 11.5px; color: var(--entm-text2); }
.entm-btn { border: 1px solid var(--entm-border); background: var(--entm-panel); color: var(--entm-text); border-radius: 8px; padding: 7px 14px; font-size: 12.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background .12s, border-color .12s; }
.entm-btn:hover { background: var(--entm-hover); }
.entm-btn.primary { background: var(--entm-accent); border-color: var(--entm-accent); color: #fff; font-weight: 600; }
.entm-btn.primary:hover { background: var(--entm-accent-strong); border-color: var(--entm-accent-strong); }
.entm-btn.ghost { border-color: transparent; }
.entm-btn.danger { color: var(--entm-danger); }
.entm-btn.sm { padding: 4px 10px; font-size: 12px; }
.entm-btn[disabled] { opacity: .5; cursor: default; }
.entm-list { background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 12px; overflow: hidden; }
.entm-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--entm-border); cursor: pointer; font-size: 13px; }
.entm-row:last-child { border-bottom: none; }
.entm-row:hover { background: var(--entm-hover); }
.entm-row-main { flex: 1; min-width: 0; }
.entm-row-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entm-row-sub { font-size: 11.5px; color: var(--entm-text2); margin-top: 2px; }
.entm-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
.entm-input, .entm-select, .entm-textarea { background: var(--entm-panel); border: 1px solid var(--entm-border); color: var(--entm-text); border-radius: 8px; padding: 7px 10px; font-size: 12.5px; outline: none; font-family: inherit; }
.entm-input:focus, .entm-select:focus, .entm-textarea:focus { border-color: var(--entm-accent); }
.entm-input { min-width: 200px; }
.entm-tabs { display: flex; gap: 18px; border-bottom: 1px solid var(--entm-border); margin-bottom: 16px; }
.entm-tab { padding: 7px 2px 9px; font-size: 13px; color: var(--entm-text2); cursor: pointer; border-bottom: 2px solid transparent; }
.entm-tab.active { color: var(--entm-text); font-weight: 650; border-bottom-color: var(--entm-accent); }
.entm-banner { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 12px; background: linear-gradient(135deg, #e9f8f1, #d8f3e6); border: 1px solid #c8ead9; margin-bottom: 18px; }
.entm-banner-ic { width: 40px; height: 40px; border-radius: 10px; background: var(--entm-accent); color: #fff; display: flex; align-items: center; justify-content: center; flex: none; }
.entm-banner-t { font-size: 13.5px; font-weight: 700; }
.entm-banner-d { font-size: 12px; color: var(--entm-text2); margin-top: 2px; }
.entm-banner-x { margin-left: auto; color: var(--entm-text2); cursor: pointer; padding: 4px; border-radius: 6px; }
.entm-banner-x:hover { background: rgba(0,0,0,.06); }
.entm-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.entm-chip { display: inline-flex; align-items: center; gap: 7px; padding: 7px 14px; border: 1px solid var(--entm-border); background: var(--entm-accent-soft); color: var(--entm-accent); border-radius: 999px; font-size: 12.5px; cursor: pointer; }
.entm-chip:hover { border-color: var(--entm-accent); background: var(--entm-accent); color: #fff; }
.entm-table { width: 100%; border-collapse: collapse; background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 12px; overflow: hidden; font-size: 12.5px; }
.entm-table th { text-align: left; font-size: 11px; letter-spacing: .04em; text-transform: uppercase; color: var(--entm-text2); font-weight: 600; padding: 9px 12px; border-bottom: 1px solid var(--entm-border); }
.entm-table td { padding: 9px 12px; border-bottom: 1px solid var(--entm-border); vertical-align: middle; }
.entm-table tr:last-child td { border-bottom: none; }
.entm-table tr:hover td { background: var(--entm-hover); }
.entm-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.entm-stat { background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 12px; padding: 14px; }
.entm-stat-num { font-size: 22px; font-weight: 700; }
.entm-stat-label { font-size: 11.5px; color: var(--entm-text2); margin-top: 3px; }
.entm-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 430px; max-width: 92vw; background: var(--entm-panel); border-left: 1px solid var(--entm-border); box-shadow: var(--entm-shadow); z-index: 10010; display: flex; flex-direction: column; }
.entm-drawer-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--entm-border); }
.entm-drawer-body { flex: 1; overflow: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.entm-field { display: flex; flex-direction: column; gap: 5px; }
.entm-field label { font-size: 11.5px; color: var(--entm-text2); }
.entm-kv { display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; }
.entm-kv > div { display: flex; gap: 10px; }
.entm-kv b { width: 92px; flex: none; color: var(--entm-text2); font-weight: 500; }
.entm-modal-mask { position: fixed; inset: 0; background: rgba(12,14,18,.45); z-index: 10020; display: flex; align-items: center; justify-content: center; }
.entm-modal { width: 420px; max-width: 92vw; background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 14px; box-shadow: var(--entm-shadow); padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.entm-modal h3 { margin: 0; font-size: 15px; }
.entm-toasts { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); z-index: 10030; display: flex; flex-direction: column; gap: 8px; align-items: center; }
.entm-toast { background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 10px; box-shadow: var(--entm-shadow); padding: 9px 14px; font-size: 12.5px; }
.entm-toast.err { border-color: var(--entm-danger); color: var(--entm-danger); }
.entm-empty { text-align: center; color: var(--entm-text2); font-size: 12.5px; padding: 36px 0; }
.entm-note { font-size: 11.5px; color: var(--entm-text2); line-height: 1.6; }
.entm-divider { height: 1px; background: var(--entm-border); margin: 4px 0; }
/* wizard (创建智能体) — Accio-style 5-step modal */
.entm-wiz { width: 680px; max-width: 94vw; max-height: 88vh; overflow: hidden; background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 14px; box-shadow: var(--entm-shadow); display: flex; flex-direction: column; }
.entm-wiz-head { display: flex; align-items: center; gap: 10px; padding: 14px 18px 0; }
.entm-wiz-title { font-size: 15px; font-weight: 700; }
.entm-wiz-step { font-size: 11.5px; color: var(--entm-text2); }
.entm-wiz-progress-wrap { padding: 10px 18px 0; }
.entm-wiz-progress { height: 4px; border-radius: 999px; background: var(--entm-hover); overflow: hidden; }
.entm-wiz-progress > div { height: 100%; background: var(--entm-accent); border-radius: 999px; transition: width .2s; }
.entm-wiz-percent { text-align: right; font-size: 11.5px; color: var(--entm-text2); padding: 6px 18px 0; }
.entm-wiz-body { flex: 1; overflow: auto; padding: 12px 18px 4px; display: flex; gap: 18px; }
.entm-wiz-form { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.entm-wiz-preview { width: 232px; flex: none; }
.entm-wiz-foot { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px 16px; border-top: 1px solid var(--entm-border); margin-top: 8px; }
.entm-option-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.entm-option-card { border: 1.5px solid var(--entm-border); border-radius: 12px; padding: 12px; cursor: pointer; background: var(--entm-panel); transition: border-color .12s; }
.entm-option-card:hover { border-color: var(--entm-accent); }
.entm-option-card.active { border-color: var(--entm-accent); background: var(--entm-accent-soft); }
.entm-option-ic { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; background: var(--entm-hover); margin-bottom: 8px; }
.entm-option-card.active .entm-option-ic { background: var(--entm-accent-soft); }
.entm-option-name { font-size: 12.5px; font-weight: 650; }
.entm-option-desc { font-size: 11px; color: var(--entm-text2); margin-top: 3px; line-height: 1.5; }
.entm-avatar-styles { display: flex; gap: 6px; flex-wrap: wrap; }
.entm-style-tab { padding: 5px 12px; border-radius: 999px; border: 1px solid var(--entm-border); font-size: 12px; cursor: pointer; color: var(--entm-text2); }
.entm-style-tab.active { border-color: var(--entm-accent); color: var(--entm-accent); background: var(--entm-accent-soft); font-weight: 600; }
.entm-avatar-row { display: flex; gap: 8px; flex-wrap: wrap; }
.entm-avatar-pick { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; border: 1.5px solid var(--entm-border); cursor: pointer; background: var(--entm-panel); }
.entm-avatar-pick:hover { border-color: var(--entm-accent); }
.entm-avatar-pick.active { border-color: var(--entm-accent); background: var(--entm-accent-soft); }
.entm-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 11px; border: 1px solid var(--entm-border); border-radius: 10px; background: var(--entm-panel); }
.entm-toggle-row:hover { border-color: var(--entm-accent); }
.entm-toggle { width: 36px; height: 20px; border-radius: 999px; background: var(--entm-hover); position: relative; cursor: pointer; flex: none; transition: background .15s; }
.entm-toggle.on { background: var(--entm-accent); }
.entm-toggle::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left .15s; }
.entm-toggle.on::after { left: 18px; }
.entm-toggle-label { font-size: 12.5px; font-weight: 600; }
.entm-toggle-sub { font-size: 11px; color: var(--entm-text2); margin-top: 2px; }
.entm-skill-row { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border: 1px solid var(--entm-border); border-radius: 10px; cursor: pointer; }
.entm-skill-row:hover { border-color: var(--entm-accent); }
.entm-skill-check { width: 16px; height: 16px; border-radius: 5px; border: 1.5px solid var(--entm-border); flex: none; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; background: var(--entm-panel); }
.entm-skill-row.checked .entm-skill-check { background: var(--entm-accent); border-color: var(--entm-accent); }
.entm-preview-card { border: 1px solid var(--entm-border); border-radius: 12px; padding: 14px; background: var(--entm-panel); }
.entm-dashed-btn { width: 100%; border: 1.5px dashed var(--entm-accent); color: var(--entm-accent); background: transparent; border-radius: 10px; padding: 10px; font-size: 12.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.entm-dashed-btn:hover { background: var(--entm-accent-soft); }
/* inline chat */
.entm-chat { display: flex; flex-direction: column; height: calc(100vh - 96px); min-height: 420px; max-width: 860px; }
.entm-chat-scroll { flex: 1; overflow: auto; padding: 14px 2px; display: flex; flex-direction: column; gap: 10px; }
.entm-msg { display: flex; align-items: flex-start; gap: 8px; }
.entm-msg.user { justify-content: flex-end; }
.entm-msg.assistant { justify-content: flex-start; }
.entm-msg-avatar { width: 26px; height: 26px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; font-size: 13px; background: var(--entm-accent-soft); }
.entm-msg-bubble { max-width: 74%; padding: 9px 13px; border-radius: 12px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; background: var(--entm-panel); border: 1px solid var(--entm-border); }
.entm-msg.user .entm-msg-bubble { background: var(--entm-accent); border-color: var(--entm-accent); color: #fff; align-self: flex-end; }
.entm-msg-tool { display: flex; align-items: flex-start; gap: 6px; font-size: 11.5px; color: var(--entm-text2); padding: 1px 4px; }
.entm-msg-pending { opacity: .6; }
.entm-composer { background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 12px; padding: 12px; flex: none; }
/* new task (Accio-style centered) */
.entm-newtask { max-width: 720px; margin: 0 auto; padding-top: 6vh; display: flex; flex-direction: column; align-items: center; gap: 24px; }
.entm-newtask-hero { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.entm-newtask-switch { position: absolute; right: 0; top: 0; }
.entm-composer-card { width: 100%; background: var(--entm-panel); border: 1px solid var(--entm-border); border-radius: 16px; box-shadow: var(--entm-shadow); padding: 16px; }
.entm-composer-toolbar { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
.entm-send { width: 34px; height: 34px; border-radius: 50%; background: var(--entm-accent); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex: none; }
.entm-send:disabled { opacity: .5; cursor: default; }
.entm-task-new { opacity: 0; transition: opacity .12s; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--entm-text2); flex: none; }
.entm-task-group:hover .entm-task-new { opacity: 1; }
.entm-task-new:hover { background: var(--entm-hover); color: var(--entm-accent); }
`

    // ---------------------------------------------------------------- store
    const store = {
      open: false,
      snap: null,
      status: 'idle', // idle | loading | error
      err: '',
      page: 'newtask', // newtask | agents | plugins | knowledge | members | usage | connections | assets | skills | settings
      agentsTab: 'agents', // agents | teams
      newTaskAgentId: '',
      agentSel: null, // {kind:'agent'|'preset', id}
      teamSel: null,
      teamEditor: null, // { mode:'create'|'edit', id? }
      teamRuntimeSessionId: null,
      expandedGroups: {},
      chat: null, // { sessionId, title, agentPreset, messages[], seq }
      chatSending: false,
      search: '',
      filter: 'all', // all | enterprise | personal (Agents tabs)
      assetType: 'all',
      assetSharing: 'all',
      membersOpen: false,
      workspacesOpen: false,
      bannerDismissed: false,
      wizard: null, // { step: 1..5, draft: {...} }
      toasts: [],
    }
    const listeners = new Set()
    function emit() {
      for (const fn of listeners) fn()
    }
    function subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    }
    function useStore() {
      const [snapshot, setSnapshot] = useState(store)
      useEffect(() => subscribe(() => setSnapshot({ ...store })), [])
      return snapshot
    }
    function toast(text, kind) {
      const id = Date.now() + Math.random()
      store.toasts.push({ id, text, kind: kind || 'ok' })
      emit()
      setTimeout(() => {
        store.toasts = store.toasts.filter((t) => t.id !== id)
        emit()
      }, 3200)
    }
    async function refresh() {
      store.status = 'loading'
      emit()
      try {
        const res = await fetch(ROUTE)
        const body = await res.json()
        if (!body || body.ok !== true) throw new Error((body && body.error) || 'snapshot failed')
        store.snap = body.state
        store.status = 'idle'
        store.err = ''
        emit()
        return body.state
      } catch (error) {
        store.status = 'error'
        store.err = String(error && error.message ? error.message : error)
        emit()
        return null
      }
    }
    async function post(action, payload) {
      try {
        const res = await fetch(ROUTE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload: payload || {} }),
        })
        const body = await res.json()
        if (!body || body.ok !== true) throw new Error((body && body.error) || '操作失败')
        store.snap = body.state
        emit()
        return true
      } catch (error) {
        toast(String(error && error.message ? error.message : error), 'err')
        return false
      }
    }
    const open = () => {
      store.open = true
      emit()
      if (store.snap === null) refresh()
    }
    const close = () => {
      store.open = false
      store.agentSel = null
      emit()
    }

    // ---------------------------------------------------------------- utils
    function uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })
    }
    function timeAgo(ms) {
      if (!ms) return ''
      const diff = Date.now() - ms
      const m = Math.floor(diff / 60000)
      if (m < 1) return '刚刚'
      if (m < 60) return `${m} 分钟前`
      const h = Math.floor(m / 60)
      if (h < 24) return `${h} 小时前`
      const d = Math.floor(h / 24)
      if (d < 30) return `${d} 天前`
      const date = new Date(ms)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    function fmtMs(ms) {
      if (!ms) return '—'
      if (ms < 1000) return `${Math.round(ms)}ms`
      if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
      return `${(ms / 60000).toFixed(1)}m`
    }
    function fmtNum(n) {
      return (n || 0).toLocaleString('en-US')
    }
    function esc(text) {
      return String(text ?? '')
    }

    // ---------------------------------------------------------------- icons
    const I = {
      home: 'M3 10.5 12 3l9 7.5M5 9.6V21h5.2v-5h3.6v5H19V9.6',
      bot: 'M12 3v2M7.5 9.5a4.5 4.5 0 0 1 9 0v3.5a4.5 4.5 0 0 1-9 0V9.5ZM9.2 11h.01M14.8 11h.01M9.5 20h5M12 17.5v2.5',
      spark: 'M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3ZM18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z',
      box: 'M3.5 7.2 12 3l8.5 4.2v9.8L12 21l-8.5-4V7.2ZM3.5 7.2 12 11.4l8.5-4.2M12 11.4V21',
      users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
      chart: 'M3.5 3.5v17h17M7.5 15.5v-4M12 15.5V8M16.5 15.5v-6.5',
      sliders: 'M4 21v-6M4 11V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1.5 15h5M9.5 8h5M17.5 16h5',
      search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.3-4.3',
      plus: 'M12 5v14M5 12h14',
      x: 'M6 6l12 12M18 6 6 18',
      play: 'M8 5.5 19 12l-11 6.5v-13Z',
      ext: 'M14 5h5v5M19 5l-9 9M19 13.5V19H5V5h5.5',
      logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
      refresh: 'M21 4v6h-6M3 20v-6h6M20.5 10a8.5 8.5 0 0 0-14.5-3L3 10M3.5 14a8.5 8.5 0 0 0 14.5 3L21 14',
      flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
      lock: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v10h-13V11Z',
      pen: 'M4 20l4-1L19 8l-3-3L5 16l-1 4ZM13.5 6.5l4 4',
      dot3: 'M5 12h.01M12 12h.01M19 12h.01',
      gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
    }
    function Icon({ d, size }) {
      return el('svg', {
        viewBox: '0 0 24 24', width: size || 16, height: size || 16, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        className: 'entm-ic',
      }, el('path', { d }))
    }

    // ---------------------------------------------------------- entry point
    function EntryButton(props) {
      const wide = props && props.wide !== false
      return el(
        'div',
        {
          style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
          onClick: open,
          title: '进入 Enterprise Mode（企业工作台）',
        },
        el('span', { style: { display: 'flex' } }, el(Icon, { d: I.flag, size: 14 })),
        wide ? el('span', { style: { fontSize: 12.5 } }, 'Enterprise') : null,
      )
    }

    // -------------------------------------------------------------- sidebar
    function groupSessions(snap) {
      const presetMap = new Map((snap.presets || []).map((p) => [p.id, p]))
      const groups = new Map()
      for (const row of (snap.sessions || [])) {
        const key = row.agentPreset || '__default__'
        const preset = key === '__default__' ? null : presetMap.get(key)
        const name = preset ? preset.name : (key === '__default__' ? '默认会话' : key)
        if (!groups.has(key)) groups.set(key, { key, name, icon: preset ? '🛰' : '🚀', items: [] })
        groups.get(key).items.push(row)
      }
      return [...groups.values()].sort((a, b) => (b.items[0].createdAt ?? 0) - (a.items[0].createdAt ?? 0))
    }

    function TaskList() {
      const s = useStore()
      const snap = s.snap
      if (!snap || !(snap.sessions || []).length) return null
      const groups = groupSessions(snap)
      const toggle = (key) => { store.expandedGroups = { ...store.expandedGroups, [key]: !store.expandedGroups[key] }; emit() }
      const pickGroup = (key) => {
        store.page = 'newtask'
        store.newTaskAgentId = key === '__default__' ? '' : key
        emit()
      }
      const newTaskFor = async (key) => {
        if (!key || key === '__default__') { toast('默认角色组：请先选择一位企业智能体'); return }
        const preset = (snap.presets || []).find((p) => p.id === key) || { id: key, name: key }
        await startTaskEntry({ kind: 'preset', preset }, '')
        refresh()
      }
      return el('div', null,
        el('div', { className: 'entm-group' }, '任务'),
        groups.map((g) => {
          const expanded = s.expandedGroups[g.key]
          const rows = expanded ? g.items : g.items.slice(0, 3)
          return el('div', { key: g.key },
            el('div', { className: 'entm-sidebar-task entm-task-group', style: { fontWeight: 650 }, onClick: () => pickGroup(g.key) },
              el('span', null, g.icon),
              el('span', { className: 't' }, esc(g.name)),
              el('span', { className: 'd', onClick: (e) => { e.stopPropagation(); toggle(g.key) }, style: { cursor: 'pointer' } }, expanded ? '收起' : g.items.length + ' 项'),
              el('span', { className: 'entm-task-new', title: '新建任务', onClick: (e) => { e.stopPropagation(); newTaskFor(g.key) } },
                el(Icon, { d: I.pen, size: 12 })),
            ),
            rows.map((row) =>
              el('div', { key: row.id, className: 'entm-sidebar-task', title: esc(row.title || '未命名会话'), onClick: () => openChat(row.id) },
                el('span', { className: 't' }, esc(row.title || '(未命名会话)')),
                el('span', { className: 'd' }, timeAgo(row.createdAt)),
              ),
            ),
            !expanded && g.items.length > 3 ? el('div', { className: 'entm-sidebar-task', onClick: () => toggle(g.key) },
              el('span', { className: 't', style: { color: 'var(--entm-accent)' } }, '展开'),
              el('span', { className: 'd' }, g.items.length + ' 项'),
            ) : null,
          )
        }),
      )
    }

    function Sidebar() {
      const s = useStore()
      const snap = s.snap
      const org = snap ? snap.org : null
      const self = snap ? snap.members.find((m) => m.role === 'owner') : null
      const navMain = [
        { id: 'newtask', label: '新任务', icon: 'plus' },
        { id: 'agents', label: '智能体', icon: 'bot' },
        { id: 'plugins', label: '插件', icon: 'ext' },
        { id: 'knowledge', label: '知识库', icon: 'lock' },
      ]
      const navMgmt = [
        { id: 'assets', label: '企业资产', icon: 'box' },
        { id: 'skills', label: '技能', icon: 'spark' },
        { id: 'members', label: '成员', icon: 'users' },
        { id: 'usage', label: '使用量', icon: 'chart' },
        { id: 'connections', label: '连接', icon: 'flag' },
        { id: 'apiconfig', label: 'API 配置', icon: 'sliders' },
        { id: 'settings', label: '设置', icon: 'gear' },
      ]
      const item = (nav) =>
        el('div', {
          key: nav.id,
          className: 'entm-nav-item' + (s.page === nav.id ? ' active' : ''),
          onClick: () => { store.page = nav.id; store.agentSel = null; store.teamSel = null; emit() },
        }, el(Icon, { d: I[nav.icon] }), el('span', null, nav.label))
      return el(
        'div', { className: 'entm-sidebar' },
        el('div', { className: 'entm-brand' },
          el('div', { className: 'entm-brand-mark' }, 'E'),
          el('div', null,
            el('div', { className: 'entm-brand-name' }, esc(org ? org.name : 'Enterprise')),
            el('div', { className: 'entm-brand-sub' }, '企业模式 · 自托管'),
          ),
        ),
        el('div', { className: 'entm-nav' },
          navMain.map(item),
          el(TaskList, null),
          el('div', { className: 'entm-group' }, '组织'),
          navMgmt.map(item),
        ),
        el('div', { className: 'entm-sidebar-foot' },
          self ? el('div', { className: 'entm-user' },
            el('div', { className: 'entm-user-dot', style: { background: self.color || '#00a573' } }, esc(self.name.slice(0, 1))),
            el('div', null,
              el('div', { style: { fontWeight: 600, fontSize: 12.5 } }, esc(self.name)),
              el('div', { style: { fontSize: 11, color: 'var(--entm-text2)' } }, 'Owner')),
          ) : null,
          el('div', { className: 'entm-exit', onClick: close },
            el(Icon, { d: I.logout }), el('span', null, '退出企业模式')),
        ),
      )
    }

    // --------------------------------------------------------------- pages
    function resolveTaskTarget(snap, id) {
      const agent = (snap.agents || []).find((a) => a.id === id)
      if (agent) return { kind: 'agent', agent }
      const preset = (snap.presets || []).find((p) => p.id === id)
      if (preset) return { kind: 'preset', preset }
      const firstUsable = (snap.agents || []).find((a) => a.presetId) ?? (snap.presets || []).find((p) => !p.broken)
      return firstUsable ? (firstUsable.name && firstUsable.preset && firstUsable.id.indexOf('agent-') === 0 ? { kind: 'agent', agent: firstUsable } : { kind: 'preset', preset: firstUsable }) : null
    }

    function NewTaskPage() {
      const s = useStore()
      const snap = s.snap
      const [draft, setDraft] = useState('')
      const [models, setModels] = useState([])
      const [modelSel, setModelSel] = useState('')
      useEffect(() => {
        let alive = true
        apiCall('llm.models', {}).then((v) => {
          if (!alive) return
          const groups = v && Array.isArray(v.groups) ? v.groups : []
          const rows = []
          for (const g of groups) {
            for (const m of (g.models || [])) rows.push({ id: `${g.id}/${m.id}`, label: `${g.name || g.id} · ${m.name || m.id}` })
          }
          setModels(rows)
        }).catch(() => {})
        return () => { alive = false }
      }, [])
      if (!snap) return el(Loading, null)
      const target = resolveTaskTarget(snap, s.newTaskAgentId)
      const chips = ['办公提效', '设计', '建站', '采购', '数据分析']
      const sendNow = () => {
        const text = draft.trim()
        setDraft('')
        startTaskEntry(target, text, modelSel)
      }
      const heroColor = target && (target.kind === 'agent' ? target.agent.color || '#00a573' : '#00a573')
      return el('div', { className: 'entm-newtask' },
        el('div', { className: 'entm-newtask-hero' },
          el('button', { className: 'entm-btn entm-newtask-switch', onClick: () => { store.page = 'agents'; emit() } },
            el(Icon, { d: I.bot, size: 13 }), '切换智能体'),
          el('div', { className: 'entm-icon', style: { width: 52, height: 52, background: heroColor + '22', color: heroColor } },
            el('span', null, esc(target && (target.kind === 'agent' ? target.agent.icon || '🤖' : '🛰') || '🤖'))),
          el('div', { style: { fontSize: 18, fontWeight: 700 } }, esc(target ? (target.kind === 'agent' ? target.agent.name : target.preset.name) : '未选择智能体')),
          el('div', { className: 'entm-sub', style: { margin: 0, maxWidth: 560 } }, esc(target ? (target.kind === 'agent' ? target.agent.description : target.preset.description || 'DSH 预置角色，可直接开始') : '选择一位企业智能体开始工作')),
        ),
        el('div', { className: 'entm-composer-card' },
          el('textarea', {
            className: 'entm-textarea', rows: 3, style: { width: '100%', resize: 'vertical', border: 'none', boxShadow: 'none', padding: '4px 2px', fontSize: 13.5 },
            placeholder: '输入问题…(@引用文件)',
            value: draft,
            onChange: (e) => setDraft(e.target.value),
            onKeyDown: (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendNow() } },
          }),
          el('div', { className: 'entm-composer-toolbar' },
            el('button', { className: 'entm-btn sm', onClick: () => { store.workspacesOpen = true; emit() } },
              el(Icon, { d: I.box, size: 13 }), '选择工作目录'),
            models.length > 0 ? el('select', { className: 'entm-select', style: { maxWidth: 240 }, value: modelSel, onChange: (e) => setModelSel(e.target.value) },
              el('option', { value: '' }, '默认模型'),
              models.map((m) => el('option', { key: m.id, value: m.id }, m.label)),
            ) : null,
            el('button', { className: 'entm-btn sm', onClick: () => toast('权限跟随 DSH 原生：allow/ask/deny 在每次动作与审批面板中生效') },
              el(Icon, { d: I.lock, size: 12 }), '权限·原生'),
            el('span', { style: { flex: 1 } }),
            el('button', { className: 'entm-send', title: '发送', onClick: sendNow, disabled: !draft.trim() },
              el(Icon, { d: I.play, size: 14 })),
          ),
        ),
        el('div', { className: 'entm-chips', style: { justifyContent: 'center' } },
          chips.map((c) => el('div', { key: c, className: 'entm-chip', onClick: () => startTaskEntry(target, `请开始一项「${c}」相关工作`, modelSel) }, el(Icon, { d: I.spark, size: 13 }), c)),
        ),
        el('div', { className: 'entm-sec', style: { width: '100%' } },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '可用智能体'), el('span', { className: 'entm-sec-link', onClick: () => { store.page = 'agents'; emit() } }, '管理 →')),
          el('div', { className: 'entm-grid' },
            (snap.agents || []).map((a) => el(AgentCard, { key: a.id, agent: a })),
            (snap.presets || []).filter((p) => !p.broken).map((p) => el(PresetCard, { key: p.id, preset: p })),
          ),
        ),
      )
    }

    // -------- inline chat (mode-internal conversation; no jump to native DSH)
    function presetNameOf(snap, id) {
      if (!id) return '会话'
      const p = (snap.presets || []).find((x) => x.id === id)
      if (p) return p.name
      const a = (snap.agents || []).find((x) => x.presetId === id)
      return a ? a.name : id
    }

    function ChatPage() {
      const s = useStore()
      const snap = s.snap
      const chat = s.chat
      const [draft, setDraft] = useState('')
      const [models, setModels] = useState([])
      const [modelSel, setModelSel] = useState('')
      const [busyModel, setBusyModel] = useState(false)
      const scrollRef = React.useRef(null)
      useEffect(() => {
        if (!chat) return undefined
        const timer = setInterval(() => { refreshChat(chat.seq) }, 1600)
        return () => clearInterval(timer)
      }, [chat ? chat.sessionId : null])
      useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }, [chat ? chat.messages.length : 0])
      useEffect(() => {
        let alive = true
        apiCall('llm.models', {}).then((v) => {
          if (!alive) return
          const groups = v && Array.isArray(v.groups) ? v.groups : []
          const rows = []
          for (const g of groups) {
            for (const m of (g.models || [])) rows.push({ id: `${g.id}/${m.id}`, label: `${g.name || g.id} · ${m.name || m.id}` })
          }
          setModels(rows)
          if (snap && snap.defaultModel && snap.defaultModel.provider) setModelSel(`${snap.defaultModel.provider}/${snap.defaultModel.model}`)
        }).catch(() => {})
        return () => { alive = false }
      }, [])
      if (!chat) {
        return el('div', { className: 'entm-page' }, el('div', { className: 'entm-empty' }, '请从「新任务」选择一个智能体开始会话'))
      }
      const send = () => {
        const t = draft.trim()
        if (!t) return
        setDraft('')
        promptChat(t)
      }
      const changeModel = async (key) => {
        setModelSel(key)
        if (!chat || !key || key.indexOf('/') === -1) return
        const at = key.indexOf('/')
        const provider = key.slice(0, at)
        const model = key.slice(at + 1)
        setBusyModel(true)
        try {
          await apiCall('session.selectModel', { sessionId: chat.sessionId, provider, model })
          toast(`会话模型已切换：${model}`)
        } catch (error) {
          toast('模型切换失败: ' + String(error && error.message ? error.message : error), 'err')
        }
        setBusyModel(false)
      }
      const agentLabel = presetNameOf(snap, chat.agentPreset)
      const workspace = chat.cwd ? (snap ? (snap.workspaces || []).find((w) => w.path === chat.cwd) : null) : null
      const agentMeta = snap && chat.agentPreset ? ((snap.agents || []).find((a) => a.presetId === chat.agentPreset) || (snap.presets || []).find((p) => p.id === chat.agentPreset)) : null
      return el('div', { className: 'entm-page entm-chat' },
        el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--entm-border)', flexWrap: 'wrap' } },
          el('div', { className: 'entm-nav-item', style: { padding: '4px 8px' }, onClick: () => { store.page = 'newtask'; emit() } },
            el('span', null, '←'), el('span', null, '新任务')),
          el('div', { className: 'entm-row-title', style: { fontSize: 15 } }, esc(chat.title || '新会话')),
          el('span', { className: 'entm-tag accent' }, esc(agentLabel)),
        ),
        el('div', { className: 'entm-chat-scroll', ref: scrollRef },
          chat.messages.length === 0 ? el('div', { className: 'entm-empty' }, '输入第一条消息，开始与这个智能体对话…') : null,
          chat.messages.map((m, i) =>
            m.kind === 'tool'
              ? el('div', { key: i, className: 'entm-msg-tool' }, el('span', null, '⚙'), el('span', null, esc(m.text)))
              : m.kind === 'user'
                ? el('div', { key: i, className: 'entm-msg user' }, el('div', { className: 'entm-msg-bubble' }, esc(m.text)))
                : el('div', { key: i, className: 'entm-msg assistant' },
                    el('div', { className: 'entm-msg-avatar' }, el('span', null, esc(agentMeta ? (agentMeta.icon || (agentMeta.presetId ? '🛰' : '🤖')) : '🤖'))),
                    el('div', { className: 'entm-msg-bubble' }, esc(m.text)),
                  ),
          ),
          s.chatSending ? el('div', { className: 'entm-msg assistant' },
            el('div', { className: 'entm-msg-avatar' }, el('span', null, '🤖')),
            el('div', { className: 'entm-msg-bubble entm-msg-pending' }, '…')) : null,
        ),
        el('div', { className: 'entm-composer' },
          el('textarea', {
            className: 'entm-textarea', rows: 2, style: { width: '100%', resize: 'vertical' },
            placeholder: '输入问题…（Enter 发送，Shift+Enter 换行）',
            value: draft, onChange: (e) => setDraft(e.target.value),
            onKeyDown: (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } },
          }),
          el('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' } },
            el('button', { className: 'entm-btn sm', onClick: () => { store.workspacesOpen = true; emit() } },
              el(Icon, { d: I.box, size: 13 }), workspace ? esc(workspace.title) : '选择工作目录'),
            models.length > 0 ? el('select', { className: 'entm-select', style: { maxWidth: 240 }, value: modelSel, disabled: busyModel, onChange: (e) => changeModel(e.target.value) },
              el('option', { value: '' }, '默认模型'),
              models.map((m) => el('option', { key: m.id, value: m.id }, m.label)),
            ) : null,
            el('button', { className: 'entm-btn sm', title: '权限跟随 DSH 原生 allow/ask/deny', onClick: () => toast('权限跟随 DSH 原生：allow/ask/deny 在每次动作与审批面板中生效；可在 DSH 原生会话中调整') },
              el(Icon, { d: I.lock, size: 12 }), '权限·原生'),
            el('span', { style: { flex: 1 } }),
            el('button', { className: 'entm-btn primary', onClick: send, disabled: s.chatSending }, el(Icon, { d: I.play, size: 14 }), '发送'),
          ),
        ),
      )
    }

    function AgentCard({ agent }) {
      const pick = () => {
        if (store.page === 'newtask') { store.newTaskAgentId = agent.id; emit(); return }
        store.agentSel = { kind: 'agent', id: agent.id }
        emit()
      }
      return el('div', { className: 'entm-card' + (store.page === 'newtask' && store.newTaskAgentId === agent.id ? ' entm-card-active' : ''), onClick: pick },
        el('div', { className: 'entm-card-top' },
          el('div', { className: 'entm-icon', style: { background: (agent.color || '#00a573') + '22', color: agent.color || '#00a573' } }, el('span', null, esc(agent.icon || '🤖'))),
          el('div', { className: 'entm-card-title' }, esc(agent.name)),
        ),
        el('div', { className: 'entm-card-desc' }, esc(agent.description)),
        el('div', { className: 'entm-tags' },
          el('span', { className: 'entm-tag accent' }, '企业'),
          agent.demo ? el('span', { className: 'entm-tag warn' }, '演示') : null,
          agent.presetId ? el('span', { className: 'entm-tag accent' }, agent.preset ? agent.preset.name : agent.presetId) : null,
          (agent.capabilities || []).slice(0, 2).map((c) => el('span', { key: c, className: 'entm-tag' }, c)),
        ),
        el(StartButton, { agent }),
      )
    }

    function PresetCard({ preset }) {
      const pick = () => {
        if (store.page === 'newtask') { store.newTaskAgentId = preset.id; emit(); return }
        store.agentSel = { kind: 'preset', id: preset.id }
        emit()
      }
      return el('div', { className: 'entm-card' + (store.page === 'newtask' && store.newTaskAgentId === preset.id ? ' entm-card-active' : ''), onClick: pick },
        el('div', { className: 'entm-card-top' },
          el('div', { className: 'entm-icon', style: { background: 'var(--entm-accent-soft)', color: 'var(--entm-accent)' } }, el('span', null, '🛰')),
          el('div', { className: 'entm-card-title' }, esc(preset.name)),
        ),
        el('div', { className: 'entm-card-desc' }, esc(preset.description || 'DSH 预置角色')),
        el('div', { className: 'entm-tags' },
          el('span', { className: 'entm-tag accent' }, '预置'),
          el('span', { className: 'entm-tag' }, preset.trust === 'user' ? '用户创建' : '系统预置')),
        el('button', { className: 'entm-agent-btn', onClick: (e) => { e.stopPropagation(); startPreset(preset.id, preset.name) } },
          el(Icon, { d: I.play, size: 13 }), '对话'),
      )
    }

    function StartButton({ agent }) {
      const canStart = !!agent.presetId
      const start = (e) => {
        e.stopPropagation()
        if (!canStart) {
          toast('演示智能体：请先在详情中绑定一个 DSH 预置角色，或直接开始一个预置角色。')
          return
        }
        startPreset(agent.presetId, agent.name)
      }
      return el('button', { className: 'entm-agent-btn', onClick: start },
        el(Icon, { d: I.play, size: 13 }), canStart ? '对话' : '试用详情')
    }

    function SessionRow({ row }) {
      return el('div', { className: 'entm-row', onClick: () => openChat(row.id) },
        el('span', { style: { display: 'flex', color: 'var(--entm-text2)' } }, el(Icon, { d: I.home, size: 14 })),
        el('div', { className: 'entm-row-main' },
          el('div', { className: 'entm-row-title' }, esc(row.title || '(未命名会话)')),
          el('div', { className: 'entm-row-sub' }, `${timeAgo(row.createdAt)} · ${row.agentPreset ? '角色 ' + row.agentPreset : '默认角色'}`)),
        row.stats ? el('span', { className: 'entm-tag' }, `${row.stats.turns} 回合`) : null,
        el('span', { className: 'entm-caption' }, '打开 →'),
      )
    }

    // -------- agent pages
    function AgentsPage() {
      const s = useStore()
      const snap = s.snap
      if (!snap) return el(Loading, null)
      const search = s.search.toLowerCase()
      const match = (text) => String(text || '').toLowerCase().includes(search)
      let agents = (snap.agents || []).filter((a) => {
        if (s.filter === 'enterprise' && a.visibility !== 'enterprise') return false
        if (s.filter === 'personal' && a.visibility !== 'personal') return false
        return match(a.name) || match(a.description)
      })
      let presets = (snap.presets || []).filter((p) => !p.broken && s.filter !== 'personal' && match(p.name + p.description))
      const tabs = [
        { id: 'all', label: '全部' },
        { id: 'enterprise', label: '企业共享' },
        { id: 'personal', label: '个人' },
      ]
      return el('div', { className: 'entm-page' },
        el('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' } },
          el('div', null,
            el('h1', { className: 'entm-h1' }, '智能体'),
            el('p', { className: 'entm-sub' }, '管理企业的个性化智能体，创建新角色，并开始对话。'),
          ),
          el('div', { style: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' } },
            el('input', { className: 'entm-input', placeholder: '搜索智能体', value: s.search, onChange: (e) => { store.search = e.target.value; emit() } }),
            el('button', { className: 'entm-btn primary', onClick: () => { store.wizard = { step: 1, draft: wizardDraft() }; emit() } },
              el(Icon, { d: I.plus, size: 14 }), '添加智能体'),
          ),
        ),
        !s.bannerDismissed ? el('div', { className: 'entm-banner' },
          el('div', { className: 'entm-banner-ic' }, el(Icon, { d: I.bot, size: 18 })),
          el('div', null,
            el('div', { className: 'entm-banner-t' }, '告别重复劳动：30 秒搭建你的企业 AI 团队'),
            el('div', { className: 'entm-banner-d' }, '智能体是你的数字员工。创建企业角色、关联技能与插件，让员工直接开始工作。'),
          ),
          el('div', { className: 'entm-banner-x', onClick: () => { store.bannerDismissed = true; emit() } }, el(Icon, { d: I.x, size: 14 })),
        ) : null,
        el('div', { className: 'entm-tabs' },
          el('div', { className: 'entm-tab' + (s.agentsTab === 'agents' ? ' active' : ''), onClick: () => { store.agentsTab = 'agents'; emit() } }, '智能体'),
          el('div', { className: 'entm-tab' + (s.agentsTab === 'teams' ? ' active' : ''), onClick: () => { store.agentsTab = 'teams'; emit() } }, '团队'),
        ),
        s.agentsTab === 'teams' ? el(TeamsPanel, null) : el('div', null,
          el('div', { className: 'entm-tabs' },
            tabs.map((t) =>
              el('div', { key: t.id, className: 'entm-tab' + (s.filter === t.id ? ' active' : ''), onClick: () => { store.filter = t.id; emit() } }, t.label)),
          ),
          agents.length > 0 ? el('div', { className: 'entm-grid' }, agents.map((a) => el(AgentCard, { key: a.id, agent: a }))) : null,
          presets.length > 0 ? el('div', { className: 'entm-sec' },
            el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, 'DSH 预置角色'), el('span', { className: 'entm-caption' }, '可直接开始对话')),
            el('div', { className: 'entm-grid' }, presets.map((p) => el(PresetCard, { key: p.id, preset: p }))),
          ) : null,
          agents.length === 0 && presets.length === 0 ? el('div', { className: 'entm-empty' }, '没有匹配的智能体。') : null,
        ),
      )
    }

    // -------- teams (enterprise team definitions + DSH agentTeams runtime view)
    function TeamsPanel() {
      const s = useStore()
      const snap = s.snap
      if (!snap) return el(Loading, null)
      const teams = snap.teams || []
      const presetName = (id) => {
        if (!id) return '（未绑定）'
        const p = (snap.presets || []).find((x) => x.id === id)
        return p ? p.name : id
      }
      return el('div', null,
        el('div', { className: 'entm-toolbar' },
          el('p', { className: 'entm-note', style: { margin: 0 } }, '团队 = DSH 已有 agentTeams 能力的企业级定义：以 TL 开始会话，会话内可委派成员、共享任务看板。'),
          el('button', { className: 'entm-btn primary', onClick: () => { store.teamEditor = { mode: 'create' }; emit() } },
            el(Icon, { d: I.plus, size: 14 }), '创建团队'),
        ),
        teams.length === 0 ? el('div', { className: 'entm-empty' }, '还没有团队。创建后即可「以团队开始」（用 TL 角色开会话）。') :
        el('div', { className: 'entm-grid' }, teams.map((t) =>
          el('div', { key: t.id, className: 'entm-card', onClick: () => { store.teamSel = t.id; emit() } },
            el('div', { className: 'entm-card-top' },
              el('div', { className: 'entm-icon', style: { background: 'var(--entm-accent-soft)', color: 'var(--entm-accent)' } }, el('span', null, '👥')),
              el('div', { className: 'entm-card-title' }, esc(t.name))),
            el('div', { className: 'entm-card-desc' }, esc(t.description || '未填写说明')),
            el('div', { className: 'entm-tags' },
              el('span', { className: 'entm-tag accent' }, 'TL: ' + presetName(t.tlPresetId)),
              el('span', { className: 'entm-tag' }, t.memberPresetIds.length + ' 位成员')),
            el('div', { style: { display: 'flex', gap: 8 } },
              el('button', { className: 'entm-agent-btn', onClick: (e) => { e.stopPropagation(); startTeam(t) } },
                el(Icon, { d: I.play, size: 13 }), '以团队开始'),
            ),
          ),
        )),
      )
    }

    function startTeam(team) {
      if (!team.tlPresetId) { toast('团队尚未绑定 TL 角色：请先编辑团队', 'err'); return }
      startPreset(team.tlPresetId, `${team.name}（TL）`)
    }

    function TeamEditorModal() {
      const s = useStore()
      const snap = s.snap
      const [name, setName] = useState('')
      const [desc, setDesc] = useState('')
      const [tl, setTl] = useState('')
      const [members, setMembers] = useState([])
      useEffect(() => {
        if (!s.teamEditor || !snap) return
        if (s.teamEditor.mode === 'edit' && s.teamEditor.id) {
          const t = (snap.teams || []).find((x) => x.id === s.teamEditor.id)
          if (t) {
            setName(t.name || '')
            setDesc(t.description || '')
            setTl(t.tlPresetId || '')
            setMembers(Array.isArray(t.memberPresetIds) ? t.memberPresetIds : [])
            return
          }
        }
        setName('')
        setDesc('')
        setTl('')
        setMembers([])
      }, [s.teamEditor ? (s.teamEditor.mode + ':' + (s.teamEditor.id || '')) : null])
      if (!s.teamEditor) return null
      const presets = snap ? (snap.presets || []).filter((p) => !p.broken) : []
      const editing = snap && s.teamEditor.mode === 'edit' ? (snap.teams || []).find((t) => t.id === s.teamEditor.id) : null
      const toggleMember = (id) => {
        setMembers(members.includes(id) ? members.filter((x) => x !== id) : [...members, id])
      }
      const submit = async () => {
        if (!name.trim()) { toast('请填写团队名称', 'err'); return }
        if (editing) {
          const ok = await post('team.update', { id: editing.id, name: name.trim(), description: desc, tlPresetId: tl, memberPresetIds: members })
          if (ok) { toast('团队已更新'); store.teamEditor = null; emit() }
          return
        }
        const ok = await post('team.create', { name: name.trim(), description: desc, tlPresetId: tl, memberPresetIds: members })
        if (ok) { toast('团队已创建'); store.teamEditor = null; emit() }
      }
      return el('div', { className: 'entm-modal-mask', onClick: () => { store.teamEditor = null; emit() } },
        el('div', { className: 'entm-modal', style: { width: 480 }, onClick: (e) => e.stopPropagation() },
          el('h3', null, editing ? '编辑团队' : '创建团队'),
          el('div', { className: 'entm-field' }, el('label', null, '团队名称'), el('input', { className: 'entm-input', value: name, onChange: (e) => setName(e.target.value) })),
          el('div', { className: 'entm-field' }, el('label', null, '团队说明'), el('input', { className: 'entm-input', value: desc, onChange: (e) => setDesc(e.target.value) })),
          el('div', { className: 'entm-field' }, el('label', null, 'TL 智能体角色（以其开始会话）'),
            el('select', { className: 'entm-select', value: tl, onChange: (e) => setTl(e.target.value) },
              presets.length === 0 ? el('option', { value: '' }, '（暂无预置角色）') : null,
              presets.map((p) => el('option', { key: p.id, value: p.id }, esc(p.name))))),
          el('div', { className: 'entm-field' }, el('label', null, '成员智能体角色（可在会话中被 TL 委派）'),
            presets.map((p) =>
              el('div', { key: p.id, className: 'entm-skill-row' + (members.includes(p.id) ? ' checked' : ''), onClick: () => toggleMember(p.id) },
                el('div', { className: 'entm-skill-check' }, members.includes(p.id) ? '✓' : ''),
                el('div', { className: 'entm-toggle-label' }, esc(p.name)))),
            presets.length === 0 ? el('p', { className: 'entm-note' }, '暂无预置角色可添加成员') : null,
          ),
          el('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
            el('button', { className: 'entm-btn', onClick: () => { store.teamEditor = null; emit() } }, '取消'),
            el('button', { className: 'entm-btn primary', onClick: submit }, '保存')),
        ))
    }

    function TeamDrawer() {
      const s = useStore()
      const snap = s.snap
      if (!snap || !s.teamSel) return null
      const team = (snap.teams || []).find((t) => t.id === s.teamSel)
      if (!team) return null
      const presetName = (id) => {
        if (!id) return '（未绑定）'
        const p = (snap.presets || []).find((x) => x.id === id)
        return p ? p.name : id
      }
      const tlSessions = (snap.sessions || []).filter((r) => r.agentPreset === team.tlPresetId).slice(0, 5)
      const del = async () => {
        if (!window.confirm(`确定删除团队「${team.name}」吗？`)) return
        const ok = await post('team.delete', { id: team.id })
        if (ok) { store.teamSel = null; toast('团队已删除'); emit() }
      }
      return el(DrawerShell, { title: team.name, icon: '👥', color: '#00a573',
          body: el('div', { className: 'entm-drawer-body' },
            el('div', { className: 'entm-card-desc', style: { minHeight: 0 } }, esc(team.description || '未填写说明')),
            el('div', { className: 'entm-kv' },
              el('div', null, el('b', null, 'TL 角色'), el('span', null, esc(presetName(team.tlPresetId)))),
              el('div', null, el('b', null, '成员角色'), el('span', null, (team.memberPresetIds || []).map((id) => presetName(id)).join('、') || '—')),
              el('div', null, el('b', null, '运行机制'), el('span', null, 'DSH agentTeams：TL 会话内可委派成员 / 共享任务看板')),
            ),
            el('div', { style: { display: 'flex', gap: 8 } },
              el('button', { className: 'entm-btn primary', onClick: () => startTeam(team) }, el(Icon, { d: I.play, size: 13 }), '以团队开始'),
              el('button', { className: 'entm-btn', onClick: () => { store.teamEditor = { mode: 'edit', id: team.id }; emit() } }, '编辑'),
              el('button', { className: 'entm-btn danger', onClick: del }, '删除'),
            ),
            tlSessions.length > 0 ? el('div', null,
              el('div', { className: 'entm-sec-title', style: { marginBottom: 8, fontSize: 13 } }, '最近团队会话（点击查看运行时）'),
              el('div', { className: 'entm-list' }, tlSessions.map((r) =>
                el('div', { key: r.id, className: 'entm-row', onClick: () => openTeamRuntime(r.id) },
                  el('div', { className: 'entm-row-main' },
                    el('div', { className: 'entm-row-title' }, esc(r.title || '(未命名会话)')),
                    el('div', { className: 'entm-row-sub' }, `${timeAgo(r.createdAt)} · 点击加载 成员/任务`)),
                  el('span', { className: 'entm-caption' }, '运行时 →')))),
            ) : el('div', { className: 'entm-empty' }, '还没有团队会话：点击「以团队开始」建立第一个。'),
            el(TeamRuntimeView, { sessionId: s.teamRuntimeSessionId }),
          ),
        })
    }

    function TeamRuntimeView({ sessionId }) {
      const [runtime, setRuntime] = useState(null)
      useEffect(() => {
        if (!sessionId) { setRuntime(null); return }
        let alive = true
        fetch(ROUTE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'team.runtime', payload: { sessionId } }),
        }).then((r) => r.json()).then((body) => {
          if (!alive) return
          if (body && body.ok) setRuntime(body.runtime)
          else setRuntime(null)
        }).catch(() => { if (alive) setRuntime(null) })
        return () => { alive = false }
      }, [sessionId])
      if (!sessionId || !runtime) return null
      if (runtime.note && !runtime.members) return el('div', { className: 'entm-empty' }, esc(runtime.note))
      return el('div', null,
        el('div', { className: 'entm-sec-title', style: { marginBottom: 8, fontSize: 13 } }, '运行时（DSH agentTeams）'),
        runtime.members ? el('div', { className: 'entm-list' }, runtime.members.map((m, i) =>
          el('div', { key: i, className: 'entm-row' },
            el('div', { className: 'entm-row-main' },
              el('div', { className: 'entm-row-title' }, esc(m.name || '成员 ' + (i + 1))),
              el('div', { className: 'entm-row-sub' }, esc((m.role || '') + (m.status ? ' · ' + m.status : '')))),
            el('span', { className: 'entm-tag accent' }, esc(m.role || 'member'))))) : null,
        runtime.tasks ? el('div', { style: { marginTop: 8 } },
          el('div', { className: 'entm-sec-title', style: { marginBottom: 8, fontSize: 13 } }, '任务看板'),
          el('div', { className: 'entm-list' }, runtime.tasks.map((t) =>
            el('div', { key: t.id, className: 'entm-row' },
              el('div', { className: 'entm-row-main' },
                el('div', { className: 'entm-row-title' }, esc(t.title)),
                el('div', { className: 'entm-row-sub' }, t.blockers ? '阻塞: ' + t.blockers.join('、') : '无阻塞')),
              el('span', { className: 'entm-tag' }, esc(t.status || '')))))) : null,
      )
    }

    function openTeamRuntime(sessionId) {
      store.teamRuntimeSessionId = sessionId
      emit()
    }


    function AgentDrawer() {
      const s = useStore()
      const snap = s.snap
      if (!snap || !s.agentSel) return null
      const sel = s.agentSel
      const memberOf = (id) => (snap.members || []).find((m) => m.id === id)
      if (sel.kind === 'preset') {
        const preset = (snap.presets || []).find((p) => p.id === sel.id)
        if (!preset) return null
        const sessions = (snap.sessions || []).filter((r) => r.agentPreset === preset.id).slice(0, 5)
        return el(DrawerShell, { title: preset.name,
            body: el('div', { className: 'entm-drawer-body' },
              el('div', { className: 'entm-tags' }, el('span', { className: 'entm-tag accent' }, 'DSH 预置角色'), el('span', { className: 'entm-tag' }, preset.trust === 'user' ? '用户创建' : '系统预置'), preset.broken ? el('span', { className: 'entm-tag warn' }, '不可用') : null),
              el('div', { className: 'entm-card-desc', style: { minHeight: 0 } }, esc(preset.description || '无说明')),
              el('div', { className: 'entm-kv' },
                el('div', null, el('b', null, '所属企业'), el('span', null, esc(snap.org ? snap.org.name : ''))),
                el('div', null, el('b', null, '可见性'), el('span', null, '企业共享')),
                el('div', null, el('b', null, '模型'), el('span', null, '跟随 DSH 默认')),
              ),
              el('div', { style: { display: 'flex', gap: 8, marginTop: 4 } },
                el('button', { className: 'entm-btn primary', onClick: () => startPreset(preset.id, preset.name) }, el(Icon, { d: I.play, size: 13 }), '对话'),
                el('button', { className: 'entm-btn', onClick: () => { store.agentSel = null; emit() } }, '关闭')),
              sessions.length > 0 ? el('div', null,
                el('div', { className: 'entm-sec-title', style: { marginBottom: 8 } }, '最近会话'),
                el('div', { className: 'entm-list' }, sessions.map((r) => el(SessionRow, { key: r.id, row: r }))),
              ) : null,
            ),
          })
      }
      const agent = (snap.agents || []).find((a) => a.id === sel.id)
      if (!agent) return null
      const creator = memberOf(agent.creatorId)
      const sessions = (snap.sessions || []).filter((r) => agent.presetId && r.agentPreset === agent.presetId).slice(0, 5)
      const presets = (snap.presets || []).filter((p) => !p.broken)
      const canEdit = agent.demo
      const body = el('div', { className: 'entm-drawer-body' },
        el('div', { className: 'entm-tags' },
          agent.demo ? el('span', { className: 'entm-tag warn' }, '演示') : null,
          agent.presetId ? el('span', { className: 'entm-tag accent' }, '已绑定 ' + (agent.preset ? agent.preset.name : agent.presetId)) : null,
          agent.visibility === 'enterprise' ? el('span', { className: 'entm-tag accent' }, '企业共享') : el('span', { className: 'entm-tag' }, '个人')),
        el('div', { className: 'entm-card-desc', style: { minHeight: 0 } }, esc(agent.description)),
        (agent.capabilities || []).length > 0 ? el('div', null,
          el('div', { className: 'entm-sec-title', style: { marginBottom: 6, fontSize: 13 } }, '能力'),
          el('div', { className: 'entm-tags' }, agent.capabilities.map((c) => el('span', { key: c, className: 'entm-tag accent' }, c))),
        ) : null,
        (agent.skills || []).length > 0 ? el('div', null,
          el('div', { className: 'entm-sec-title', style: { marginBottom: 6, fontSize: 13 } }, '技能'),
          el('div', { className: 'entm-tags' }, agent.skills.map((sk) => el('span', { key: sk, className: 'entm-tag' }, sk))),
        ) : null,
        el('div', { className: 'entm-kv' },
          el('div', null, el('b', null, '模型'), el('span', null, agent.model || '跟随 DSH 默认')),
          el('div', null, el('b', null, 'Workspace'), el('span', null, agent.workspace || '（由会话选择）')),
          el('div', null, el('b', null, '创建者'), el('span', null, creator ? esc(creator.name) : '—')),
          el('div', null, el('b', null, '所属企业'), el('span', null, esc(snap.org ? snap.org.name : ''))),
          el('div', null, el('b', null, '可见性'), el('span', null, agent.visibility === 'enterprise' ? '企业共享' : '个人')),
        ),
        canEdit ? el('div', { className: 'entm-field' },
          el('label', null, '绑定 DSH 预置角色（绑定后即可对话）'),
          el('select', { className: 'entm-select', id: 'entm-bind-preset', defaultValue: '' },
            el('option', { value: '' }, '选择预置角色…'),
            presets.map((p) => el('option', { key: p.id, value: p.id }, `${p.name}${p.description ? ' — ' + p.description : ''}`))),
          el('button', { className: 'entm-btn', onClick: () => {
            const value = document.getElementById('entm-bind-preset').value
            if (!value) { toast('请先选择预置角色'); return }
            bindPreset(agent.id, value)
          } }, '保存绑定'),
        ) : null,
        el('div', { style: { display: 'flex', gap: 8 } },
          el('button', { className: 'entm-btn primary', onClick: () => startButtonFor(agent) }, el(Icon, { d: I.play, size: 13 }), agent.presetId ? '对话' : '试用详情'),
          el('button', { className: 'entm-btn', onClick: () => { store.agentSel = null; emit() } }, '关闭')),
        sessions.length > 0 ? el('div', null,
          el('div', { className: 'entm-sec-title', style: { marginBottom: 8, fontSize: 13 } }, '最近会话'),
          el('div', { className: 'entm-list' }, sessions.map((r) => el(SessionRow, { key: r.id, row: r }))),
        ) : null,
      )
      return el(DrawerShell, { title: agent.name, icon: agent.icon, color: agent.color, body })
    }

    function DrawerShell({ title, icon, color, body }) {
      return el('div', { className: 'entm-drawer' },
        el('div', { className: 'entm-drawer-head' },
          icon ? el('div', { className: 'entm-icon', style: { background: (color || '#00a573') + '22', color: color || '#00a573' } }, el('span', null, icon)) : null,
          el('div', { className: 'entm-card-title', style: { fontSize: 15 } }, esc(title)),
          el('div', { style: { marginLeft: 'auto', display: 'flex', gap: 6 } },
            el('button', { className: 'entm-btn ghost sm', onClick: () => { store.agentSel = null; emit() } }, el(Icon, { d: I.x, size: 14 }))),
        ),
        body,
      )
    }

    function startButtonFor(agent) {
      if (!agent.presetId) {
        toast('演示智能体：请先绑定一个 DSH 预置角色。')
        return
      }
      startPreset(agent.presetId, agent.name)
    }

    async function bindPreset(agentId, presetId) {
      const ok = await post('agent.bind', { id: agentId, presetId })
      if (ok) toast('绑定成功，现在可以对话了')
    }

    async function startPreset(presetId, name) {
      try {
        toast(`正在用 ${name} 开启会话…`)
        const sessionId = await createSession(presetId)
        if (!sessionId) { toast('会话创建失败', 'err'); return }
        openChat(sessionId)
      } catch (error) {
        toast('开启会话失败: ' + String(error && error.message ? error.message : error), 'err')
      }
    }

    // -------- unified DSH RPC + inline chat (stay inside Enterprise mode)
    async function apiCall(method, payload) {
      const res = await fetch('/api/' + method, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'client-request', rpcId: uuid(), method, payload: payload || {} }),
      })
      const env = await res.json()
      const result = env && env.result
      if (result && result.ok === true) return result.value ?? { accepted: true }
      const msg = result && result.error ? result.error.message : 'RPC 失败: ' + method
      throw new Error(String(msg || 'unknown'))
    }

    async function createSession(presetId) {
      const value = await apiCall('session.create', { agentPreset: presetId })
      return value && value.sessionId ? value.sessionId : null
    }

    function openChat(sessionId) {
      store.chat = { sessionId, title: null, agentPreset: null, messages: [], seq: 0 }
      store.page = 'chat'
      store.chatSending = false
      emit()
      refreshChat(0)
    }

    async function refreshChat(afterSeq) {
      const c = store.chat
      if (!c) return
      try {
        const res = await fetch(`${ROUTE_CONV}?sessionId=${encodeURIComponent(c.sessionId)}&after=${afterSeq || 0}`)
        const body = await res.json()
        if (!body || body.ok !== true) return
        const next = store.chat
        if (!next) return
        const merged = afterSeq ? [...next.messages, ...(body.messages || [])] : (body.messages || [])
        store.chat = {
          ...next,
          messages: merged,
          seq: body.seq || 0,
          title: body.title ?? next.title,
          agentPreset: body.agentPreset ?? next.agentPreset,
          cwd: body.cwd ?? next.cwd,
        }
        emit()
      } catch {
        /* polling is best-effort */
      }
    }

    async function promptChat(text) {
      const c = store.chat
      if (!c) return
      store.chatSending = true
      emit()
      try {
        await apiCall('session.prompt', {
          sessionId: c.sessionId,
          mode: 'queue',
          content: [{ type: 'text', text }],
        })
        store.chatSending = false
        emit()
        refreshChat(c.seq)
      } catch (error) {
        store.chatSending = false
        emit()
        toast('发送失败: ' + String(error && error.message ? error.message : error), 'err')
      }
    }

    async function startTaskEntry(target, text, modelKey) {
      if (!target) { toast('还没有可用的智能体：请先创建或绑定一个预置角色', 'err'); return }
      const presetId = target.kind === 'preset' ? target.preset.id : target.agent.presetId
      if (!presetId) {
        toast('该智能体未绑定 DSH 预置角色：请先绑定（详情 → 保存绑定），或直接选择预置角色。')
        return
      }
      try {
        const sessionId = await createSession(presetId)
        if (!sessionId) { toast('会话创建失败', 'err'); return }
        if (modelKey && modelKey.indexOf('/') !== -1) {
          const at = modelKey.indexOf('/')
          try {
            await apiCall('session.selectModel', { sessionId, provider: modelKey.slice(0, at), model: modelKey.slice(at + 1) })
          } catch {
            /* model selection is best-effort */
          }
        }
        openChat(sessionId)
        if (text && text.trim()) promptChat(text.trim())
      } catch (error) {
        toast('开始任务失败: ' + String(error && error.message ? error.message : error), 'err')
      }
    }

    // -------- create wizard (Accio-style 5-step)
    const AVATAR_STYLES = {
      '商务': ['🧑‍💼', '👔', '💼', '🧑‍💻', '🕴️'],
      '智能': ['🤖', '🛸', '🧠', '📡', '⚙️'],
      '机器人': ['🤖', '🦾', '🎛️', '📟', '🔩'],
      '卡通': ['🐱', '🐻', '🍀', '🦊', '🐣'],
      '专业': ['📊', '🔬', '🎯', '💡', '📈'],
    }
    function wizardDraft() {
      return {
        start: 'blank',
        name: '',
        avatarStyle: '商务',
        avatar: '🧑‍💼',
        description: '描述这个智能体的功能…',
        model: '',
        plugins: [],
        skills: [],
        autoInvokeSkills: false,
        pfHowToCall: '',
        pfLanguage: '中文',
        pfNote: '',
        pfBackground: '',
      }
    }
    function wizardColor(name) {
      const palette = ['#00a573', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']
      return palette[(String(name).length + String(name).charCodeAt(0)) % palette.length]
    }

    function Toggle({ on, onChange }) {
      return el('div', { className: 'entm-toggle' + (on ? ' on' : ''), onClick: (e) => { e.stopPropagation(); onChange(!on) } })
    }

    function CreateWizard() {
      const s = useStore()
      if (!s.wizard) return null
      const w = s.wizard
      const d = w.draft
      const step = w.step
      const snap = s.snap
      const presets = snap ? (snap.presets || []).filter((p) => !p.broken) : []
      const skills = snap ? (snap.skills || []) : []
      const plugins = snap ? (snap.plugins || []) : []
      const set = (patch) => { w.draft = { ...d, ...patch }; emit() }
      const stepTitles = ['选择起点', '身份与模型', '插件', '技能', '用户信息']
      const nextTitle = step < 5 ? ('下一步：' + stepTitles[step]) : '完成并启动'
      const percent = (step - 1) * 25

      const stepBody =
        step === 1 ? el('div', null,
          el('div', { style: { fontSize: 13.5, fontWeight: 650, marginBottom: 10 } }, '选择起点'),
          el('p', { className: 'entm-note', style: { marginTop: 0, marginBottom: 12 } }, '选择一个模板以快速开始，或者从头开始构建你的智能体。'),
          el('div', { className: 'entm-option-grid' },
            el('div', { className: 'entm-option-card' + (d.start === 'blank' ? ' active' : ''), onClick: () => set({ start: 'blank' }) },
              el('div', { className: 'entm-option-ic' }, '➕'),
              el('div', { className: 'entm-option-name' }, '空白智能体'),
              el('div', { className: 'entm-option-desc' }, '从一个完全空白的画布开始。'),
            ),
            presets.slice(0, 5).map((p) =>
              el('div', { key: p.id, className: 'entm-option-card' + (d.start === 'preset:' + p.id ? ' active' : ''), onClick: () => set({ start: 'preset:' + p.id }) },
                el('div', { className: 'entm-option-ic' }, '🛰'),
                el('div', { className: 'entm-option-name' }, esc(p.name)),
                el('div', { className: 'entm-option-desc' }, esc(p.description || 'DSH 预置角色，绑定后可立即开始对话')),
              ),
            ),
          ),
          presets.length === 0 ? el('p', { className: 'entm-note', style: { marginTop: 10 } }, '当前没有可绑定的 DSH 预置角色。') : null,
        ) :

        step === 2 ? el('div', null,
          el('div', { style: { fontSize: 13.5, fontWeight: 650, marginBottom: 10 } }, '身份与模型'),
          el('p', { className: 'entm-note', style: { marginTop: 0, marginBottom: 12 } }, '定义智能体的基本信息、头像与模型。'),
          el('div', { className: 'entm-field' }, el('label', null, '名称'),
            el('input', { className: 'entm-input', placeholder: '例如：我的编程助手', value: d.name, onChange: (e) => set({ name: e.target.value }) })),
          el('div', { className: 'entm-field' }, el('label', null, '智能体头像'),
            el('div', { className: 'entm-avatar-styles' },
              Object.keys(AVATAR_STYLES).map((st) =>
                el('div', { key: st, className: 'entm-style-tab' + (d.avatarStyle === st ? ' active' : ''), onClick: () => set({ avatarStyle: st, avatar: AVATAR_STYLES[st][0] }) }, st))),
            el('div', { className: 'entm-avatar-row' },
              AVATAR_STYLES[d.avatarStyle].map((a) =>
                el('div', { key: a, className: 'entm-avatar-pick' + (d.avatar === a ? ' active' : ''), onClick: () => set({ avatar: a }) }, a))),
          ),
          el('div', { className: 'entm-field' }, el('label', null, '描述'),
            el('textarea', { className: 'entm-textarea', rows: 3, style: { resize: 'vertical' }, value: d.description, onChange: (e) => set({ description: e.target.value }) })),
          el('div', { className: 'entm-field' }, el('label', null, '模型'),
            el('select', { className: 'entm-select', value: d.model, onChange: (e) => set({ model: e.target.value }) },
              el('option', { value: '' }, '跟随 DSH 默认模型'),
              el('option', { value: 'manual' }, '对话时手动选择')),
          ),
        ) :

        step === 3 ? el('div', null,
          el('div', { style: { fontSize: 13.5, fontWeight: 650, marginBottom: 10 } }, '关联你的插件'),
          el('p', { className: 'entm-note', style: { marginTop: 0, marginBottom: 12 } }, '选择默认关联到该智能体的插件，每次新会话都会自动携带。'),
          plugins.length === 0 ? el('div', { className: 'entm-empty' }, '当前部署未配置可展示的插件。') :
          plugins.map((p) =>
            el('div', { key: p.id, className: 'entm-toggle-row' },
              el('div', { style: { minWidth: 0 } },
                el('div', { className: 'entm-toggle-label' }, esc(p.name)),
                el('div', { className: 'entm-toggle-sub' }, '部署 bundle · 默认关闭，单会话可临时调整')),
              el(Toggle, {
                on: d.plugins.includes(p.id),
                onChange: (on) => set({ plugins: on ? [...d.plugins, p.id] : d.plugins.filter((x) => x !== p.id) }),
              }),
            ),
          ),
        ) :

        step === 4 ? el('div', null,
          el('div', { style: { fontSize: 13.5, fontWeight: 650, marginBottom: 10 } }, '技能'),
          el('p', { className: 'entm-note', style: { marginTop: 0, marginBottom: 12 } }, '配置预装技能并从目录添加。'),
          el('div', { className: 'entm-toggle-row' },
            el('div', null,
              el('div', { className: 'entm-toggle-label' }, '自动调用 Skill'),
              el('div', { className: 'entm-toggle-sub' }, '开启后，Agent 会在对话过程中自动调用可用技能；自动调用会占用更多调用额度。')),
            el(Toggle, { on: d.autoInvokeSkills, onChange: (on) => set({ autoInvokeSkills: on }) }),
          ),
          el('div', { style: { marginTop: 10 } },
            skills.length === 0 ? el('div', { className: 'entm-empty' }, '暂无已添加技能') :
            skills.map((sk) => {
              const checked = d.skills.includes(sk.name)
              return el('div', { key: sk.name, className: 'entm-skill-row' + (checked ? ' checked' : ''), onClick: () => set({ skills: checked ? d.skills.filter((x) => x !== sk.name) : [...d.skills, sk.name] }) },
                el('div', { className: 'entm-skill-check' }, checked ? '✓' : ''),
                el('div', { style: { minWidth: 0 } },
                  el('div', { className: 'entm-toggle-label' }, `/${esc(sk.name)}`),
                  el('div', { className: 'entm-toggle-sub' }, esc(sk.description))),
              )
            }),
            skills.length > 0 ? el('div', { style: { marginTop: 8, display: 'flex', gap: 8 } },
              el('button', { className: 'entm-dashed-btn', onClick: () => set({ skills: skills.map((x) => x.name) }) }, el(Icon, { d: I.plus, size: 13 }), '添加全部技能'),
            ) : null,
          ),
        ) :

        el('div', null,
          el('div', { style: { fontSize: 13.5, fontWeight: 650, marginBottom: 10 } }, '用户信息'),
          el('p', { className: 'entm-note', style: { marginTop: 0, marginBottom: 12 } }, '告诉智能体关于用户的信息，包括称呼、偏好和背景。'),
          el('div', { style: { display: 'flex', gap: 10 } },
            el('div', { className: 'entm-field', style: { flex: 1 } }, el('label', null, '如何称呼你'),
              el('input', { className: 'entm-input', placeholder: '例如：小明，或彬彬', value: d.pfHowToCall, onChange: (e) => set({ pfHowToCall: e.target.value }) })),
            el('div', { className: 'entm-field', style: { width: 140 } }, el('label', null, '偏好语言'),
              el('select', { className: 'entm-select', value: d.pfLanguage, onChange: (e) => set({ pfLanguage: e.target.value }) },
                el('option', { value: '中文' }, '中文'), el('option', { value: 'English' }, 'English'))),
          ),
          el('div', { className: 'entm-field' }, el('label', null, '备注'),
            el('input', { className: 'entm-input', placeholder: '简短补充，例如所在城市、职业等', value: d.pfNote, onChange: (e) => set({ pfNote: e.target.value }) })),
          el('div', { className: 'entm-field' }, el('label', null, '补充背景'),
            el('textarea', { className: 'entm-textarea', rows: 3, style: { resize: 'vertical' }, value: d.pfBackground, onChange: (e) => set({ pfBackground: e.target.value }) })),
        )

      const preview = el('div', { className: 'entm-wiz-preview' },
        el('div', { style: { fontSize: 11.5, color: 'var(--entm-text2)', marginBottom: 6 } }, '智能体预览 · 预览智能体效果'),
        el('div', { className: 'entm-preview-card' },
          el('div', { className: 'entm-icon', style: { width: 52, height: 52, background: (wizardColor(d.name || '新') + '22'), color: wizardColor(d.name || '新') } }, el('span', null, esc(d.avatar || '🤖'))),
          el('div', { className: 'entm-tag accent', style: { marginTop: 8 } }, '新'),
          el('div', { className: 'entm-row-title', style: { marginTop: 6, fontSize: 14 } }, esc(d.name || '新建智能体')),
          el('div', { className: 'entm-card-desc', style: { minHeight: 0 } }, esc(d.description || '还没有描述')),
          el('div', { className: 'entm-tags', style: { marginTop: 8 } },
            el('span', { className: 'entm-tag' }, '风格：' + d.avatarStyle),
            el('span', { className: 'entm-tag' }, d.model ? '手动模型' : '跟随默认'),
            ...(d.skills.length ? [el('span', { className: 'entm-tag' }, d.skills.length + ' 个技能')] : []),
          ),
        ),
        el('p', { className: 'entm-note', style: { marginTop: 8 } }, '创建后可在智能体详情中继续绑定预置角色、调整共享状态。'),
      )

      return el('div', { className: 'entm-modal-mask', onClick: () => { store.wizard = null; emit() } },
        el('div', { className: 'entm-wiz', onClick: (e) => e.stopPropagation() },
          el('div', { className: 'entm-wiz-head' },
            el('div', { className: 'entm-icon', style: { width: 30, height: 30, background: 'var(--entm-accent-soft)', color: 'var(--entm-accent)' } }, el(Icon, { d: I.bot, size: 14 })),
            el('div', null,
              el('div', { className: 'entm-wiz-title' }, '创建智能体'),
              el('div', { className: 'entm-wiz-step' }, `第 ${step}/5 步 · ${stepTitles[step - 1]}`),
            ),
          ),
          el('div', { className: 'entm-wiz-progress-wrap' },
            el('div', { className: 'entm-wiz-progress' }, el('div', { style: { width: percent + '%' } })),
          ),
          el('div', { className: 'entm-wiz-percent' }, '完成 ' + percent + '%'),
          el('div', { className: 'entm-wiz-body' },
            el('div', { className: 'entm-wiz-form' }, stepBody),
            step === 2 ? preview : null,
          ),
          el('div', { className: 'entm-wiz-foot' },
            step > 1 ? el('button', { className: 'entm-btn', onClick: () => { w.step = step - 1; emit() } }, '上一步') : el('span', null),
            el('button', {
              className: 'entm-btn primary',
              onClick: () => {
                if (step < 5) { w.step = step + 1; emit(); return }
                wizardSubmit()
              },
            }, step < 5 ? nextTitle : '完成并启动'),
          ),
        ))
    }

    async function wizardSubmit() {
      const w = store.wizard
      if (!w) return
      const d = w.draft
      if (!String(d.name || '').trim()) { toast('请填写智能体名称', 'err'); return }
      const presetId = d.start && d.start.indexOf('preset:') === 0 ? d.start.slice(7) : null
      const ok = await post('agent.create', {
        name: d.name.trim(),
        description: d.description,
        icon: d.avatar,
        color: wizardColor(d.name),
        presetId,
        skills: d.skills,
        plugins: d.plugins,
        autoInvokeSkills: d.autoInvokeSkills,
        profile: { howToCall: d.pfHowToCall, language: d.pfLanguage, note: d.pfNote, background: d.pfBackground },
      })
      if (ok) {
        store.wizard = null
        toast(`智能体「${d.name.trim()}」创建成功${presetId ? '，已绑定预置角色，可开始对话' : ''}`)
        emit()
      }
    }

    // -------- skills
    function SkillsPage() {
      const s = useStore()
      const snap = s.snap
      if (!snap) return el(Loading, null)
      const rows = snap.skills || []
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, '技能'),
        el('p', { className: 'entm-sub' }, '企业可用的方法（Skill）。在会话中输入 /<名称> 即可调用。'),
        rows.length === 0 ? el('div', { className: 'entm-empty' }, '当前没有可用的技能。') :
        el('div', { className: 'entm-grid' }, rows.map((sk) =>
          el('div', { key: sk.name, className: 'entm-card', onClick: () => toast(`在 DSH 会话中输入 /${sk.name} 使用`) },
            el('div', { className: 'entm-card-top' },
              el('div', { className: 'entm-icon', style: { background: 'var(--entm-accent-soft)', color: 'var(--entm-accent)' } }, el(Icon, { d: I.spark, size: 15 })),
              el('div', { className: 'entm-card-title' }, `/${esc(sk.name)}`),
            ),
            el('div', { className: 'entm-card-desc' }, esc(sk.description)),
            el('div', { className: 'entm-tags' },
              sk.modelInvocable ? el('span', { className: 'entm-tag accent' }, '模型可调用') : el('span', { className: 'entm-tag warn' }, '仅用户调用'),
              el('span', { className: 'entm-tag accent' }, '企业共享'),
              sk.source ? el('span', { className: 'entm-tag' }, esc(sk.source)) : null),
          )),
        ),
      )
    }

    // -------- api config (BYO-API: provider directory + generic settings editor)
    function walkSchemaRefs(nsView) {
      const schema = nsView && nsView.schema
      const refs = schema && schema.refs ? schema.refs : {}
      const root = schema ? (schema.root ?? schema.uid) : null
      const secretPaths = Array.isArray(nsView && nsView.secrets) ? nsView.secrets : []
      const out = []
      const walk = (id, path) => {
        if (id == null) return
        const sc = refs[String(id)]
        if (!sc) return
        if (sc.type === 'object' && sc.dict) {
          for (const k of Object.keys(sc.dict)) walk(sc.dict[k], [...path, k])
          return
        }
        if (sc.type === 'string' || sc.type === 'number' || sc.type === 'boolean') {
          if (sc.meta && sc.meta.secret === true) return
          out.push({ path, type: sc.type, meta: sc.meta || {}, secret: secretPaths.some((p) => JSON.stringify(p) === JSON.stringify(path)) })
          return
        }
      }
      walk(root, [])
      return out
    }
    function readPathObj(obj, path) {
      let cur = obj
      for (const k of path) { if (cur == null) return null; cur = cur[k] }
      return cur
    }
    function ApiConfigPage() {
      const s = useStore()
      const snap = s.snap
      const [providers, setProviders] = useState([])
      const [nsView, setNsView] = useState(null)
      const [editing, setEditing] = useState(null)
      const [busy, setBusy] = useState(false)
      useEffect(() => { load() }, [])
      const load = async () => {
        try {
          const v = await apiCall('llm.providers', {})
          setProviders(v && Array.isArray(v.providers) ? v.providers : [])
        } catch {
          setProviders([])
        }
        try {
          const dd = await apiCall('settings.describe', {})
          if (dd && Array.isArray(dd.namespaces)) setNsView(dd)
        } catch {
          /* noop */
        }
      }
      const openEditor = (ns, label) => {
        if (!nsView || !nsView.namespaces) { toast('设置描述不可用', 'err'); return }
        const view = nsView.namespaces.find((n) => n.ns === ns)
        if (!view) { toast('该命名空间未注册', 'err'); return }
        const fields = walkSchemaRefs(view).map((f) => ({
          ...f, name: f.path.join('.'), value: f.secret ? null : readPathObj(view.value ?? {}, f.path), dirty: false,
        }))
        if (fields.length === 0) { toast('该配置没有可编辑的标量字段（或已由部署固定）'); return }
        setEditing({ ns, label, fields, revision: view.revision })
      }
      const save = async () => {
        if (!editing) return
        setBusy(true)
        try {
          const ops = []
          for (const f of editing.fields) {
            if (!f.dirty) continue
            if (f.secret) { if (String(f.value || '').trim()) ops.push({ op: 'set', path: f.path, value: String(f.value) }); continue }
            if (f.type === 'boolean') ops.push({ op: 'set', path: f.path, value: f.value === true })
            else if (f.type === 'number') ops.push({ op: 'set', path: f.path, value: f.value === '' || f.value == null ? null : Number(f.value) })
            else ops.push({ op: 'set', path: f.path, value: String(f.value ?? '') })
          }
          if (ops.length === 0) { toast('没有变更'); setBusy(false); return }
          await apiCall('settings.mutate', { ns: editing.ns, ops, expectedRevision: editing.revision })
          toast('已保存并生效；Provider 配置变更后重启 dsh web 可确保完全生效')
          setEditing(null)
          load()
        } catch (error) {
          toast('保存失败: ' + String(error && error.message ? error.message : error), 'err')
        }
        setBusy(false)
      }
      const setField = (idx, patch) => {
        const fields = editing.fields.map((f, i) => (i === idx ? { ...f, dirty: true, ...patch } : f))
        setEditing({ ...editing, fields })
      }
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, 'API 配置（BYO-API）'),
        el('p', { className: 'entm-sub' }, '企业自购上游 API：配置 Provider（API Key / 地址等）后 DSH 即可使用该模型。密钥只写入 DSH 凭据/设置层，本页不回显。'),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '模型 Provider 目录'),
            el('span', { className: 'entm-caption' }, providers.length + ' 个')),
          el('table', { className: 'entm-table' },
            el('thead', null, el('tr', null,
              el('th', null, 'Provider'), el('th', null, '状态'), el('th', null, '配置命名空间'), el('th', null, ''))),
            el('tbody', null, providers.map((p) =>
              el('tr', { key: p.provider },
                el('td', { style: { fontWeight: 600 } }, esc(p.provider)),
                el('td', null, p.active === true ? el('span', { className: 'entm-tag accent' }, '已启用') : el('span', { className: 'entm-tag' }, '未启用')),
                el('td', null, el('span', { className: 'entm-caption' }, esc(p.settingsNs || '—'))),
                el('td', null, p.settingsNs ? el('button', { className: 'entm-btn sm', onClick: () => openEditor(p.settingsNs, p.provider) }, '配置') : null),
              ),
            ),
          ),
        ),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '默认模型')),
          el('div', { className: 'entm-kv' },
            el('div', null, el('b', null, '当前'), el('span', null, snap && snap.defaultModel ? `${snap.defaultModel.provider}/${snap.defaultModel.model}` : '未设置')),
            el('div', null, el('b', null, '入口'), el('span', null, 'DSH 原生设置 或 下方配置命名空间')),
          ),
          el('button', { className: 'entm-btn', onClick: () => openEditor('agent-default-model', '默认模型') }, '配置默认模型'),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '说明')),
          el('p', { className: 'entm-note' },
            '· 配置成功后 Provider 显示「已启用」；模型清单由 Provider 路由自动解析（无需手工逐个新增模型）。\n' +
            '· 若「配置」为空，说明该命名空间字段已由部署固定（如 llm-pi-ai 的 33+ 平台目录，可在 DSH 原生设置中按平台配置）。\n' +
            '· 密钥字段不回显；只有填写新值才会覆盖。'),
        ),
        editing ? el('div', { className: 'entm-modal-mask', onClick: () => setEditing(null) },
          el('div', { className: 'entm-modal', style: { width: 520, maxHeight: '80vh', overflow: 'auto' }, onClick: (e) => e.stopPropagation() },
            el('h3', null, '配置：' + editing.label),
            el('div', { className: 'entm-note' }, '命名空间 ' + editing.ns),
            el('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 } },
              editing.fields.map((f, i) =>
                el('div', { key: f.name, className: 'entm-field' },
                  el('label', null, f.name + (f.secret ? '（密钥，不回显）' : '')),
                  f.type === 'boolean'
                    ? el('div', { className: 'entm-toggle-row', onClick: () => setField(i, { value: !(f.value === true) }) },
                        el('div', null, el('div', { className: 'entm-toggle-label' }, f.value === true ? '开启' : '关闭')),
                        el('div', { className: 'entm-toggle' + (f.value === true ? ' on' : '') }),
                      )
                    : el('input', { className: 'entm-input', type: f.secret ? 'password' : f.type === 'number' ? 'number' : 'text', style: { width: '100%' }, placeholder: f.secret ? '••••••' : String(f.meta && f.meta.default !== undefined ? '默认: ' + f.meta.default : ''), value: f.value == null ? '' : String(f.value), onChange: (e) => setField(i, { value: e.target.value }) }),
                ),
              ),
            ),
            el('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 } },
              el('button', { className: 'entm-btn', onClick: () => setEditing(null) }, '取消'),
              el('button', { className: 'entm-btn primary', onClick: save, disabled: busy }, busy ? '保存中…' : '保存并生效'),
            ),
          ),
        ) : null,
      )
    }

    // -------- connections / providers (BYO-API 可见性)
    function ConnectionsPage() {
      const s = useStore()
      const snap = s.snap
      if (!snap) return el(Loading, null)
      const providers = snap.providers || []
      const model = snap.defaultModel
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, '连接与 Provider'),
        el('p', { className: 'entm-sub' }, '企业自购上游 API（BYO-API）：在 DSH 中配置 Provider 与模型后，这里展示当前生效的路由。外部账号目录（店铺 / GitHub / 飞书等）P1 接入。'),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '模型 Provider（当前部署）')),
          providers.length === 0 ? el('div', { className: 'entm-empty' }, '未探测到 Provider。请先在 DSH 设置中配置模型提供商。') :
          el('table', { className: 'entm-table' },
            el('thead', null, el('tr', null,
              el('th', null, 'Provider'), el('th', null, '名称'), el('th', null, '状态'))),
            el('tbody', null, providers.map((p) =>
              el('tr', { key: p.id },
                el('td', { style: { fontWeight: 600 } }, esc(p.id)),
                el('td', null, esc(p.name)),
                el('td', null, el('span', { className: 'entm-tag accent' }, '已配置')),
              ),
            )),
          ),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '默认模型')),
          el('div', { className: 'entm-kv' },
            el('div', null, el('b', null, 'Provider'), el('span', null, esc(model && model.provider ? model.provider : '未设置'))),
            el('div', null, el('b', null, '模型'), el('span', null, esc(model && model.model ? model.model : '未设置'))),
            el('div', null, el('b', null, '入口'), el('span', null, 'DSH 设置 → 模型（本页只读展示）')),
          ),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '外部账号目录')),
          el('p', { className: 'entm-note' }, 'P1：统一管理店铺 / GitHub / 飞书等连接（账号 + 凭证引用 + 资源范围 + Agent 绑定），见 docs/ACCOUNT-MODEL.md。'),
          el('div', { className: 'entm-empty' }, '暂无连接 · 该模块将在 P1 提供只读目录'),
        ),
      )
    }

    // -------- plugins & knowledge
    function PluginsPage() {
      const s = useStore()
      const snap = s.snap
      if (!snap) return el(Loading, null)
      const rows = snap.plugins || []
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, '插件'),
        el('p', { className: 'entm-sub' }, '当前部署的插件（bundle）。企业默认启用清单与供应链治理（白名单/更新窗口）P2。'),
        rows.length === 0 ? el('div', { className: 'entm-empty' }, '未读取到插件清单。') :
        el('div', { className: 'entm-grid' }, rows.map((p) =>
          el('div', { key: p.id, className: 'entm-card' },
            el('div', { className: 'entm-card-top' },
              el('div', { className: 'entm-icon', style: { background: 'var(--entm-accent-soft)', color: 'var(--entm-accent)' } }, el(Icon, { d: I.ext, size: 15 })),
              el('div', { className: 'entm-card-title' }, esc(p.name))),
            el('div', { className: 'entm-card-desc' }, '部署 bundle · 由 DSH profile 挂载'),
            el('div', { className: 'entm-tags' }, el('span', { className: 'entm-tag accent' }, '企业共享')),
          )),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '知识库')),
          el('div', { className: 'entm-empty' }, '企业知识库（P1 最小版：目录索引 + 可见范围）即将到来。'),
        ),
      )
    }

    function KnowledgePage() {
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, '知识库'),
        el('p', { className: 'entm-sub' }, '企业知识库（P1 最小版）：目录索引 + 可见范围 + Agent 引用字段。'),
        el('div', { className: 'entm-empty' }, '该模块将在 P1 实现：公司事实与方法的统一目录，Agent 引用时检索。'),
      )
    }

    // -------- assets
    function AssetsPage() {
      const s = useStore()
      const snap = s.snap
      if (!snap) return el(Loading, null)
      const typeLabel = { agent: '智能体', skill: '技能', plugin: '插件' }
      let rows = (snap.assets || []).filter((a) => {
        if (s.assetType !== 'all' && a.refType !== s.assetType) return false
        if (s.assetSharing !== 'all' && a.sharing !== s.assetSharing) return false
        return true
      })
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, '企业 AI 资产'),
        el('p', { className: 'entm-sub' }, '企业里可以被别人复用的 AI 能力都是企业 AI 资产。智能体 / 技能 / 插件在这里统一管理归属与共享。'),
        el('div', { className: 'entm-toolbar' },
          el('select', { className: 'entm-select', value: s.assetType, onChange: (e) => { store.assetType = e.target.value; emit() } },
            el('option', { value: 'all' }, '全部类型'), el('option', { value: 'agent' }, '智能体'), el('option', { value: 'skill' }, '技能'), el('option', { value: 'plugin' }, '插件')),
          el('select', { className: 'entm-select', value: s.assetSharing, onChange: (e) => { store.assetSharing = e.target.value; emit() } },
            el('option', { value: 'all' }, '全部状态'), el('option', { value: 'enterprise' }, '企业共享'), el('option', { value: 'personal' }, '个人')),
        ),
        rows.length === 0 ? el('div', { className: 'entm-empty' }, '没有匹配的资产。') :
        el('table', { className: 'entm-table' },
          el('thead', null, el('tr', null,
            el('th', null, '名称'), el('th', null, '类型'), el('th', null, '创建者'), el('th', null, '所属企业'),
            el('th', null, '是否共享'), el('th', null, '推荐'), el('th', null, '更新时间'))),
          el('tbody', null, rows.map((a) => {
            const owner = (snap.members || []).find((m) => m.id === a.ownerId)
            return el('tr', { key: a.id },
              el('td', { style: { fontWeight: 600 } },
                a.recommended ? el('span', { className: 'entm-tag accent', style: { marginRight: 6 } }, '★') : null,
                esc(a.name)),
              el('td', null, el('span', { className: 'entm-tag' }, typeLabel[a.refType] || a.refType)),
              el('td', null, esc(owner ? owner.name : '—')),
              el('td', null, esc(snap.org ? snap.org.name : '—')),
              el('td', null, el('button', {
                className: a.sharing === 'enterprise' ? 'entm-tag accent' : 'entm-tag',
                style: { cursor: 'pointer', border: 'none' },
                onClick: () => toggleShare(a),
              }, a.sharing === 'enterprise' ? '企业共享 ✓' : '个人')),
              el('td', null, el('button', {
                className: a.recommended ? 'entm-tag accent' : 'entm-tag',
                style: { cursor: 'pointer', border: 'none' },
                title: '推荐到首页（Admin）',
                onClick: () => toggleRecommend(a),
              }, a.recommended ? '已推荐' : '推荐')),
              el('td', null, el('span', { className: 'entm-caption' }, timeAgo(a.updatedAt))),
            )
          })),
        ),
        el('p', { className: 'entm-note', style: { marginTop: 10 } }, '「个人」资产仅创建者可见；「企业共享」对整个企业可用。MVP 为最基础概念，审核/版本/市场等后续再做。'),
      )
    }

    async function toggleShare(asset) {
      const next = asset.sharing === 'enterprise' ? 'personal' : 'enterprise'
      const ok = await post('asset.share', {
        assetId: asset.id, refType: asset.refType, refId: asset.refId,
        name: asset.name, ownerId: asset.ownerId, sharing: next,
      })
      if (ok) toast(`已切换为${next === 'enterprise' ? '企业共享' : '个人'}`)
    }

    async function toggleRecommend(asset) {
      const next = !asset.recommended
      const ok = await post('asset.recommend', {
        assetId: asset.id, refType: asset.refType, refId: asset.refId,
        name: asset.name, ownerId: asset.ownerId, recommended: next,
      })
      if (ok) toast(next ? '已推荐到首页' : '已取消推荐')
    }

    // -------- members
    function MembersPage() {
      const s = useStore()
      const snap = s.snap
      if (!snap) return el(Loading, null)
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, '成员'),
        el('p', { className: 'entm-sub' }, '谁在使用企业 AI，谁负责管理。Owner 拥有全部权限；Admin 管理成员与资产；Member 使用企业智能体 / 技能。'),
        el('div', { className: 'entm-toolbar' },
          el('button', { className: 'entm-btn primary', onClick: () => { store.membersOpen = true; emit() } }, el(Icon, { d: I.plus, size: 14 }), '添加成员')),
        el('table', { className: 'entm-table' },
          el('thead', null, el('tr', null,
            el('th', null, '成员'), el('th', null, '邮箱'), el('th', null, '角色'), el('th', null, '月度额度'), el('th', null, '加入时间'), el('th', null, ''))),
          el('tbody', null, (snap.members || []).map((m) =>
            el('tr', { key: m.id },
              el('td', null, el('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                el('div', { className: 'entm-user-dot', style: { background: m.color || '#00a573' } }, esc(m.name.slice(0, 1))),
                el('span', { style: { fontWeight: 600 } }, esc(m.name)))),
              el('td', null, esc(m.email)),
              el('td', null, m.role === 'owner'
                ? el('span', { className: 'entm-tag accent' }, 'Owner')
                : el('select', { className: 'entm-select', value: m.role, onChange: (e) => changeRole(m, e.target.value) },
                  el('option', { value: 'admin' }, 'Admin'), el('option', { value: 'member' }, 'Member'))),
              el('td', null, el('span', { className: 'entm-caption' }, m.quota != null ? '¥' + m.quota : '—')),
              el('td', null, el('span', { className: 'entm-caption' }, timeAgo(m.joinedAt))),
              el('td', null, m.role !== 'owner'
                ? el('button', { className: 'entm-btn danger sm', onClick: () => removeMember(m) }, '移除')
                : null),
            )),
          ),
        ),
      )
    }

    async function changeRole(member, role) {
      const ok = await post('member.role', { memberId: member.id, role })
      if (ok) toast(`${member.name} 的角色已更新为 ${role}`)
    }
    async function removeMember(member) {
      if (!window.confirm(`确定移除成员 ${member.name} 吗？`)) return
      const ok = await post('member.remove', { memberId: member.id })
      if (ok) toast(`已移除 ${member.name}`)
    }

    function MembersModal() {
      const s = useStore()
      const [name, setName] = useState('')
      const [email, setEmail] = useState('')
      const [role, setRole] = useState('member')
      if (!s.membersOpen) return null
      const submit = async () => {
        if (!name.trim() || !email.trim()) { toast('请填写名称与邮箱', 'err'); return }
        const ok = await post('member.add', { name: name.trim(), email: email.trim(), role })
        if (ok) { toast('成员已添加'); store.membersOpen = false; setName(''); setEmail(''); emit() }
      }
      return el('div', { className: 'entm-modal-mask', onClick: () => { store.membersOpen = false; emit() } },
        el('div', { className: 'entm-modal', onClick: (e) => e.stopPropagation() },
          el('h3', null, '添加成员'),
          el('div', { className: 'entm-field' }, el('label', null, '名称'), el('input', { className: 'entm-input', value: name, onChange: (e) => setName(e.target.value) })),
          el('div', { className: 'entm-field' }, el('label', null, '邮箱'), el('input', { className: 'entm-input', value: email, onChange: (e) => setEmail(e.target.value) })),
          el('div', { className: 'entm-field' }, el('label', null, '角色'),
            el('select', { className: 'entm-select', value: role, onChange: (e) => setRole(e.target.value) },
              el('option', { value: 'member' }, 'Member（使用企业智能体 / 技能）'),
              el('option', { value: 'admin' }, 'Admin（管理成员与资产）'))),
          el('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
            el('button', { className: 'entm-btn', onClick: () => { store.membersOpen = false; emit() } }, '取消'),
            el('button', { className: 'entm-btn primary', onClick: submit }, '添加')),
        ))
    }

    // -------- usage
    function UsagePage() {
      const s = useStore()
      const snap = s.snap
      if (!snap) return el(Loading, null)
      const u = snap.usage || {}
      const totals = u.totals || {}
      const currency = totals.costCurrency === 'USD' ? 'USD' : 'CNY'
      const money = (cost) => cost == null || !Number.isFinite(cost) ? '—' : (currency === 'USD' ? '$' : '¥') + cost.toFixed(2)
      const presetName = (id) => {
        if (!id || id === '__default__') return '默认会话'
        const p = (snap.presets || []).find((x) => x.id === id)
        return p ? p.name : id
      }
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, '使用量'),
        el('p', { className: 'entm-sub' }, '管理员视角：AI 大概被谁用了、花了多少。数据来自 DSH 会话统计与模型成本投影（最近 40 个会话）。'),
        el('div', { className: 'entm-stat-grid' },
          el(Stat, { label: '会话', value: fmtNum(totals.sessions) }),
          el(Stat, { label: '回合 (Turns)', value: fmtNum(totals.turns) }),
          el(Stat, { label: '步骤 (Steps)', value: fmtNum(totals.steps) }),
          el(Stat, { label: 'LLM 时间', value: fmtMs(totals.llmMs) }),
          el(Stat, { label: '输出 Tokens', value: fmtNum(totals.decodeTokens) }),
          el(Stat, { label: '估算成本', value: money(totals.costTotal) }),
        ),
        totals.costPriced === false ? el('p', { className: 'entm-note', style: { marginTop: 10 } }, '注意：部分模型没有已验证价格，「估算成本」为已定价部分之和；未收录价格模型标记为 ?。') : null,
        (u.byModel || []).length > 0 ? el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '按模型（真实价格）')),
          el('table', { className: 'entm-table' },
            el('thead', null, el('tr', null,
              el('th', null, '模型'), el('th', null, '成本'), el('th', null, '输入 Tokens'),
              el('th', null, '输出 Tokens'), el('th', null, '缓存读'), el('th', null, '缓存写'))),
            el('tbody', null, (u.byModel || []).map((m) =>
              el('tr', { key: m.provider + '/' + m.model },
                el('td', { style: { fontWeight: 600 } }, esc(m.displayName || `${m.provider}/${m.model}`)),
                el('td', null, money(m.cost) + (m.priced === false ? ' ?' : '')),
                el('td', null, fmtNum(m.uncachedInputTokens)),
                el('td', null, fmtNum(m.outputTokens)),
                el('td', null, fmtNum(m.cacheReadTokens)),
                el('td', null, fmtNum(m.cacheWriteTokens)),
              ),
            ),
          ),
        ),
        ) : el('p', { className: 'entm-note', style: { marginTop: 10 } }, '本机未启用成本投影（dsh-cost-line）或尚无带使用记录的消息 —— 安装 dsh-cost-line 后这里会显示按模型的真实成本。'),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '按智能体 / 角色')),
          el('table', { className: 'entm-table' },
            el('thead', null, el('tr', null,
              el('th', null, '智能体'), el('th', null, '会话'), el('th', null, '回合'),
              el('th', null, '步骤'), el('th', null, 'LLM 时间'), el('th', null, '输出 Tokens'), el('th', null, '成本'))),
            el('tbody', null, (u.byAgent || []).map((a) =>
              el('tr', { key: a.agentPreset },
                el('td', { style: { fontWeight: 600 } }, esc(presetName(a.agentPreset))),
                el('td', null, a.sessions),
                el('td', null, a.turns),
                el('td', null, a.steps),
                el('td', null, fmtMs(a.llmMs)),
                el('td', null, fmtNum(a.decodeTokens)),
                el('td', null, money(a.cost)),
              ),
            ),
          ),
        ),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '企业额度'),
            el('span', { className: 'entm-caption' }, '在 组织 → 设置 中修改')),
          el('div', { className: 'entm-kv', style: { maxWidth: 560 } },
            el('div', null, el('b', null, '周期'), el('span', null, u.budget && u.budget.period === 'month' ? '月度' : String((u.budget && u.budget.period) || 'month'))),
            el('div', null, el('b', null, '成本上限'), el('span', null, u.budget && u.budget.limitCny != null ? money(Number(u.budget.limitCny)) : '不限')),
            el('div', null, el('b', null, '告警阈值'), el('span', null, u.budget && u.budget.alertPercent != null ? u.budget.alertPercent + '%' : '80%')),
          ),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '按成员')),
          el('table', { className: 'entm-table' },
            el('thead', null, el('tr', null,
              el('th', null, '成员'), el('th', null, '会话'), el('th', null, '备注'))),
            el('tbody', null, (u.byMember || []).map((m) =>
              el('tr', { key: m.memberId },
                el('td', { style: { fontWeight: 600 } }, esc(m.label)),
                el('td', null, m.sessions),
                el('td', null, el('span', { className: 'entm-caption' }, '本地单用户实例 · 演示映射')),
              ),
            ),
          ),
        ),
        ),
        el('p', { className: 'entm-note', style: { marginTop: 10 } }, u.note || ''),
      )
    }

    function Stat({ label, value }) {
      return el('div', { className: 'entm-stat' },
        el('div', { className: 'entm-stat-num' }, value),
        el('div', { className: 'entm-stat-label' }, label))
    }

    // -------- settings
    function SettingsPage() {
      const s = useStore()
      const snap = s.snap
      const [name, setName] = useState('')
      const [desc, setDesc] = useState('')
      const [limitCny, setLimitCny] = useState('')
      const [alertPercent, setAlertPercent] = useState('80')
      useEffect(() => {
        if (!snap || !snap.org) return
        setName(snap.org.name || '')
        setDesc(snap.org.description || '')
        const b = snap.org.budget || { period: 'month', limitCny: null, alertPercent: 80 }
        setLimitCny(b.limitCny != null ? String(b.limitCny) : '')
        setAlertPercent(String(b.alertPercent != null ? b.alertPercent : 80))
      }, [snap ? snap.org : null])
      if (!snap) return el(Loading, null)
      const themeFace = ctxGet.modules.theme
      const localeFace = ctxGet.modules.locale
      const themeId = themeFace && typeof themeFace.getTheme === 'function' ? (themeFace.getTheme()?.id ?? '—') : '—'
      const localeId = localeFace && typeof localeFace.getLocale === 'function' ? (localeFace.getLocale()?.id ?? '—') : '—'
      const saveOrg = async () => {
        const limit = limitCny === '' ? null : Number(limitCny)
        const alert = Number(alertPercent)
        const ok = await post('org.update', {
          name,
          description: desc,
          budget: { period: 'month', limitCny: Number.isFinite(limit) && limit >= 0 ? limit : null, alertPercent: Number.isFinite(alert) && alert >= 0 && alert <= 100 ? alert : 80 },
        })
        if (ok) toast('企业信息已保存')
      }
      const resetDemo = async () => {
        if (!window.confirm('确定恢复为演示数据吗？企业信息与成员/智能体将被重置。')) return
        const ok = await post('reset.demo')
        if (ok) { toast('已恢复演示数据'); setName(snap.org ? snap.org.name : ''); setDesc(snap.org ? snap.org.description || '' : '') }
      }
      return el('div', { className: 'entm-page' },
        el('h1', { className: 'entm-h1' }, '设置'),
        el('p', { className: 'entm-sub' }, '企业基本信息与模式管理。'),
        el('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 } },
          el('div', { className: 'entm-field' }, el('label', null, '企业名称'), el('input', { className: 'entm-input', value: name, onChange: (e) => setName(e.target.value) })),
          el('div', { className: 'entm-field' }, el('label', null, '企业说明'), el('textarea', { className: 'entm-textarea', rows: 3, style: { resize: 'vertical' }, value: desc, onChange: (e) => setDesc(e.target.value) })),
          el('div', { className: 'entm-field' }, el('label', null, '企业额度（月度成本上限，空 = 不限；P1 只记账，P2 强制执行）'),
            el('div', { style: { display: 'flex', gap: 10 } },
              el('input', { className: 'entm-input', type: 'number', min: 0, placeholder: '例如 200（CNY）', value: limitCny, onChange: (e) => setLimitCny(e.target.value) }),
              el('input', { className: 'entm-input', type: 'number', min: 1, max: 100, placeholder: '告警阈值 %', value: alertPercent, style: { minWidth: 120 }, onChange: (e) => setAlertPercent(e.target.value) }),
            ),
          ),
          el('div', { style: { display: 'flex', gap: 8 } },
            el('button', { className: 'entm-btn primary', onClick: saveOrg }, '保存'),
            el('button', { className: 'entm-btn', onClick: refresh }, el(Icon, { d: I.refresh, size: 13 }), '刷新')),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '关于本模式')),
          el('div', { className: 'entm-kv', style: { maxWidth: 560 } },
            el('div', null, el('b', null, '版本'), el('span', null, 'dsh-enterprise · 开源试点（MVP）')),
            el('div', null, el('b', null, '数据位置'), el('span', null, '$DSH_HOME/enterprise/data.json')),
            el('div', null, el('b', null, '计费方式'), el('span', null, '企业自购上游 API（DeepSeek / OpenAI 兼容等），无平台积分，成本 = 真实 API 价格 × 用量')),
            el('div', null, el('b', null, '隔离说明'), el('span', null, '企业数据独立命名空间；DSH 的 Profile / Session / Workspace 数据只读引用，不会被修改。')),
            el('div', null, el('b', null, '移除方式'), el('span', null, '在 DSH 插件列表中卸载 dsh-enterprise 并重启，即可回到原版 DSH。')),
          ),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, 'DSH 原生设置映射')),
          el('div', { className: 'entm-kv', style: { maxWidth: 560 } },
            el('div', null, el('b', null, '界面主题'), el('span', null, esc(themeId))),
            el('div', null, el('b', null, '界面语言'), el('span', null, esc(localeId))),
            el('div', null, el('b', null, '模型 Provider'), el('span', null, (snap.providers || []).map((p) => p.id).join('、') || '未配置')),
            el('div', null, el('b', null, '默认模型'), el('span', null, snap.defaultModel ? `${snap.defaultModel.provider}/${snap.defaultModel.model}` : '未设置')),
            el('div', null, el('b', null, '已装插件'), el('span', null, (snap.plugins || []).length + ' 个')),
            el('div', null, el('b', null, 'Agent 角色'), el('span', null, (snap.presets || []).length + ' 个预置')),
          ),
          el('p', { className: 'entm-note', style: { marginTop: 8 } }, '以上均来自 DSH 原生配置，本页只读映射。修改请在 DSH 中进行（左下角 ⚙️ 设置）。'),
          el('button', { className: 'entm-btn', onClick: () => { close(); setTimeout(() => toast('已回到 DSH：点击左下角 ⚙️ 打开设置'), 400) } }, '在 DSH 中打开设置'),
        ),
        el('div', { className: 'entm-sec' },
          el('div', { className: 'entm-sec-head' }, el('span', { className: 'entm-sec-title' }, '工具')),
          el('button', { className: 'entm-btn danger', onClick: resetDemo }, '恢复为演示数据'),
        ),
      )
    }

    // -------- workspace modal + toasts + loading
    function WorkspacesModal() {
      const s = useStore()
      const [creating, setCreating] = useState(false)
      if (!s.workspacesOpen) return null
      const snap = s.snap
      const rows = snap ? snap.workspaces || [] : []
      const createWs = async () => {
        const workspacesFace = ctxGet.modules.workspaces
        if (!workspacesFace || typeof workspacesFace.pickDirectory !== 'function') { toast('当前环境不支持目录选择', 'err'); return }
        setCreating(true)
        try {
          const path = await workspacesFace.pickDirectory()
          if (!path) { setCreating(false); return }
          await workspacesFace.create({ path })
          store.workspacesOpen = false
          setCreating(false)
          toast('工作区已创建')
          refresh()
        } catch (error) {
          setCreating(false)
          toast('创建工作区失败: ' + String(error && error.message ? error.message : error), 'err')
        }
      }
      return el('div', { className: 'entm-modal-mask', onClick: () => { store.workspacesOpen = false; emit() } },
        el('div', { className: 'entm-modal', onClick: (e) => e.stopPropagation() },
          el('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            el('h3', { style: { flex: 1 } }, '打开工作区'),
            el('button', { className: 'entm-btn primary sm', onClick: createWs, disabled: creating }, el(Icon, { d: I.plus, size: 12 }), '新建工作区'),
          ),
          rows.length === 0 ? el('div', { className: 'entm-empty' }, '尚无可用的工作区。点击右上「新建工作区」选择一个目录。') :
          el('div', { className: 'entm-list' }, rows.map((w) =>
            el('div', { key: w.id, className: 'entm-row', onClick: () => openWorkspace(w) },
              el('div', { className: 'entm-row-main' },
                el('div', { className: 'entm-row-title' }, esc(w.title || w.path)),
                el('div', { className: 'entm-row-sub' }, esc(w.path || ''))),
              el('span', { className: 'entm-caption' }, '打开 →'))),
          ),
          el('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
            el('button', { className: 'entm-btn', onClick: () => { store.workspacesOpen = false; emit() } }, '关闭')),
        ))
    }

    async function openWorkspace(w) {
      const workspacesFace = ctxGet.modules.workspaces
      try {
        if (workspacesFace && typeof workspacesFace.connectWorkspace === 'function') {
          const sessionId = await workspacesFace.connectWorkspace(w.id)
          if (sessionId) {
            store.workspacesOpen = false
            openChat(sessionId)
            return
          }
        }
        store.workspacesOpen = false
        store.page = 'newtask'
        emit()
      } catch (error) {
        toast('打开工作区失败: ' + String(error && error.message ? error.message : error), 'err')
      }
    }

    function Loading() {
      return el('div', { className: 'entm-page' },
        el('div', { className: 'entm-empty' }, '正在加载企业工作台…'))
    }

    function Toasts() {
      const s = useStore()
      if (!s.toasts.length) return null
      return el('div', { className: 'entm-toasts' },
        s.toasts.map((t) => el('div', { key: t.id, className: 'entm-toast' + (t.kind === 'err' ? ' err' : '') }, t.text)))
    }

    // -------------------------------------------------------------- overlay
    function OverlayRoot() {
      const s = useStore()
      if (!s.open) return null
      const page = s.page
      const pageEl =
        page === 'newtask' ? el(NewTaskPage, null) :
        page === 'chat' ? el(ChatPage, null) :
        page === 'agents' ? el(AgentsPage, null) :
        page === 'plugins' ? el(PluginsPage, null) :
        page === 'knowledge' ? el(KnowledgePage, null) :
        page === 'skills' ? el(SkillsPage, null) :
        page === 'assets' ? el(AssetsPage, null) :
        page === 'members' ? el(MembersPage, null) :
        page === 'usage' ? el(UsagePage, null) :
        page === 'connections' ? el(ConnectionsPage, null) :
        page === 'apiconfig' ? el(ApiConfigPage, null) :
        page === 'settings' ? el(SettingsPage, null) : el(NewTaskPage, null)
      return el('div', { className: 'entm-overlay' },
        el(Sidebar, null),
        el('div', { className: 'entm-main' }, pageEl),
        el(AgentDrawer, null),
        el(TeamDrawer, null),
        el(CreateWizard, null),
        el(TeamEditorModal, null),
        el(MembersModal, null),
        el(WorkspacesModal, null),
        el(Toasts, null),
      )
    }

    // --------------------------------------------------------------- plugin
    const ctxGet = { modules: {} }
    const plugin = {
      name: 'dsh-enterprise',
      inject: ['slots'],
      apply(ctx) {
        const slots = ctx.get('slots')
        if (slots === undefined) return
        if (typeof document !== 'undefined') {
          const styleTag = document.createElement('style')
          styleTag.textContent = CSS
          document.head.appendChild(styleTag)
          ctx.effect(() => () => {
            if (styleTag.parentNode !== null) styleTag.parentNode.removeChild(styleTag)
          })
        }
        ctxGet.modules.sessions = ctx.get('sessions')
        ctxGet.modules.workspaces = ctx.get('workspaces')
        ctxGet.modules.theme = ctx.get('theme')
        ctxGet.modules.locale = ctx.get('locale')

        slots.inject('sidebar.footer.action', () =>
          slots.register(
            { name: 'sidebar.footer.action', id: 'dsh-enterprise', order: 95, label: 'Enterprise' },
            (props) => el(EntryButton, { wide: props ? props.wide : true }),
          ),
        )
        slots.inject('shell.overlay', () =>
          slots.register(
            { name: 'shell.overlay', id: 'dsh-enterprise-overlay', order: 999, label: 'Enterprise Mode' },
            () => el(OverlayRoot, null),
          ),
        )
      },
    }
    return plugin
  },
})
