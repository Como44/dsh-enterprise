// dsh-enterprise — host plugin: the Enterprise Mode data layer.
//
// Owns the enterprise records that DSH does not have (organization, members,
// enterprise agents, asset sharing) and republishes live DSH capabilities
// (agent presets, skills, sessions, workspaces, session stats) as one JSON
// snapshot for the Enterprise Mode client surface.
//
// Persistence: one versioned JSON file under $DSH_HOME/enterprise/ (atomic
// tmp-write + rename). Nothing here writes into DSH's profile, session, or
// workspace data — DSH objects are read-only references.
//
// Routes (loopback web surface of the deployment):
//   GET  /plugins/dsh-enterprise/state  -> full snapshot
//   POST /plugins/dsh-enterprise/state  -> { action, payload } -> { ok, state }
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export const name = 'dsh-enterprise'
export const inject = ['webServer']

const ROUTE = '/plugins/dsh-enterprise/state'
const CONV_ROUTE = '/plugins/dsh-enterprise/conversation'
const MAX_BODY = 256 * 1024

const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const DATA_DIR = path.join(DSH_HOME, 'enterprise')
const DATA_FILE = path.join(DATA_DIR, 'data.json')

const now = () => Date.now()

// ---------------------------------------------------------------------------
// Seed (first run) — clearly marked demo data, editable in the UI.
// ---------------------------------------------------------------------------
function seedRecord() {
  const t = now()
  return {
    version: 1,
    org: {
      id: 'org-1',
      name: '云帆贸易（示例企业）',
      description: '示例企业空间：您可以在 组织 → 设置 中修改企业名称与说明。',
      createdAt: t,
      plan: 'enterprise-mvp',
      budget: { period: 'month', limitCny: null, alertPercent: 80 },
    },
    members: [
      { id: 'u-self', name: '本地用户（你）', email: 'owner@demo.local', role: 'owner', color: '#00a573', joinedAt: t },
      { id: 'u-wangfang', name: '王芳', email: 'wangfang@demo.local', role: 'admin', color: '#0ea5e9', joinedAt: t },
      { id: 'u-liqiang', name: '李强', email: 'liqiang@demo.local', role: 'member', color: '#f59e0b', joinedAt: t },
      { id: 'u-chenzhiyuan', name: '陈志远', email: 'chenzhiyuan@demo.local', role: 'member', color: '#10b981', joinedAt: t },
    ],
    agents: [
      {
        id: 'agent-supply', name: '供应分析 Agent',
        description: '聚合询盘与供应商数据，输出可比较、可追溯的供应报价分析。',
        icon: '📦', color: '#0ea5e9',
        capabilities: ['报价比较', '供应商画像', '交期风险'],
        skills: ['报价分析', '供应商评估'],
        model: '', workspace: '', visibility: 'enterprise', creatorId: 'u-self', demo: true, presetId: null,
      },
      {
        id: 'agent-research', name: '产品研究 Agent',
        description: '把分散的客户声音整理成可判断的产品机会与市场趋势。',
        icon: '🔎', color: '#8b5cf6',
        capabilities: ['机会扫描', '市场趋势', '竞品对比'],
        skills: ['产品机会研究'],
        model: '', workspace: '', visibility: 'enterprise', creatorId: 'u-self', demo: true, presetId: null,
      },
      {
        id: 'agent-ops', name: '运营 Agent',
        description: '覆盖日常运营事务：素材初审、发品检查、内容生成与数据整理。',
        icon: '⚙️', color: '#f59e0b',
        capabilities: ['素材审核', '内容生成', '发品检查'],
        skills: ['运营检查清单'],
        model: '', workspace: '', visibility: 'enterprise', creatorId: 'u-self', demo: true, presetId: null,
      },
      {
        id: 'agent-dev', name: '开发 Agent',
        description: '面向研发与工程任务：需求拆解、代码实现、测试与交付说明。',
        icon: '🛠️', color: '#10b981',
        capabilities: ['需求拆解', '代码实现', '测试验证'],
        skills: ['工程落地'],
        model: '', workspace: '', visibility: 'enterprise', creatorId: 'u-self', demo: true, presetId: null,
      },
      {
        id: 'agent-data', name: '数据分析 Agent',
        description: '把业务数据变成可读的结论：指标解读、异常发现与复盘报告。',
        icon: '📊', color: '#ef4444',
        capabilities: ['指标解读', '异常发现', '复盘报告'],
        skills: ['数据分析方法'],
        model: '', workspace: '', visibility: 'enterprise', creatorId: 'u-self', demo: true, presetId: null,
      },
    ],
    assets: [],
    teams: [],
  }
}

// ---------------------------------------------------------------------------
// Durable record load/save.
// ---------------------------------------------------------------------------
function loadRecord() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) return seedRecord()
    const seeded = seedRecord()
    return {
      version: 1,
      org: {
        ...(parsed.org ?? seeded.org),
        budget: parsed.org?.budget ?? seeded.org.budget,
      },
      members: Array.isArray(parsed.members) ? parsed.members : [],
      agents: Array.isArray(parsed.agents) ? parsed.agents : [],
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
    }
  } catch {
    return seedRecord()
  }
}

function saveRecord(record) {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 })
  const tmp = DATA_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(record, null, 2), 'utf8')
  fs.renameSync(tmp, DATA_FILE)
}

// ---------------------------------------------------------------------------
// Read-only DSH capability readers (best-effort; never fail the snapshot).
// ---------------------------------------------------------------------------
async function listPresets(ctx) {
  const service = ctx.get('agentPresets')
  if (service === undefined) return []
  try {
    const rows = await service.list()
    return rows.map((p) => ({
      id: p.id,
      name: p.name || p.id,
      description: p.description || '',
      trust: p.trust || 'system',
      broken: p.broken ?? null,
      order: p.order ?? 0,
    }))
  } catch {
    return []
  }
}

async function listSkills(ctx) {
  const service = ctx.get('skills')
  if (service === undefined) return []
  try {
    const rows = await service.list()
    return rows.map((s) => ({
      name: s.name,
      description: s.description || '',
      whenToUse: s.whenToUse || '',
      modelInvocable: s.invocation ? s.invocation.modelInvocable ?? true : true,
      provider: s.provider || '',
      source: s.source || '',
    }))
  } catch {
    return []
  }
}

async function listSessions(ctx, limit = 40) {
  const service = ctx.get('sessionQuery')
  if (service === undefined) return []
  try {
    const records = await service.listSessions()
    const sorted = [...records]
      .filter((r) => r && r.header)
      .sort((a, b) => (b.header.createdAt ?? 0) - (a.header.createdAt ?? 0))
      .slice(0, limit)
    const ids = sorted.map((r) => r.header.id)
    let titles = new Map()
    if (typeof service.readTitleSnapshots === 'function' && ids.length > 0) {
      try {
        const obs = await service.readTitleSnapshots(ids)
        for (const o of obs ?? []) {
          if (o && o.status === 'fulfilled' && o.value) {
            const title = o.value.title
            titles.set(String(o.sessionId), title && typeof title === 'object' ? title.title ?? null : null)
          }
        }
      } catch {
        /* titles are best-effort */
      }
    }
    const stats = await sessionUsageOf(ctx, sorted)
    return sorted.map((r, i) => {
      const header = r.header
      return {
        id: header.id,
        title: titles.get(String(header.id)) || null,
        createdAt: header.createdAt ?? 0,
        cwd: header.cwd ?? '',
        agentPreset: header.agentPreset ?? null,
        parentSession: header.parentSession ?? null,
        live: !!r.live,
        persisted: !!r.persisted,
        stats: stats[i] ? stats[i].stats : null,
        cost: stats[i] ? stats[i].cost : null,
      }
    })
  } catch {
    return []
  }
}

async function sessionUsageOf(ctx, records) {
  const out = new Array(records.length).fill(null)
  const projections = ctx.get('sessionProjections')
  const live = ctx.get('sessions')
  const cache = ctx.get('sessionProjectionCache')
  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    try {
      let stats = null
      let cost = null
      if (projections && rec.live && live) {
        const session = live.get(rec.header.id)
        if (session) {
          const statsValue = projections.stateOf(session, 'sessionStats')
          if (statsValue) stats = pickStats(statsValue)
          cost = normalizeCost(projections.stateOf(session, 'usageCost'))
        }
      }
      if ((!stats || !cost) && cache && rec.persisted) {
        try {
          const snap = cache.cachedSnapshot(rec.header)
          if (snap) {
            if (snap.sessionStats) stats = stats ?? pickStats(snap.sessionStats)
            if (snap.usageCost) cost = cost ?? normalizeCost(snap.usageCost)
          }
        } catch {
          /* projected cache miss is fine */
        }
      }
      out[i] = { stats, cost }
    } catch {
      /* one bad session never breaks the snapshot */
    }
  }
  return out
}

function pickStats(value) {
  return {
    turns: numberOr(value.turns),
    steps: numberOr(value.steps),
    llmMs: numberOr(value.llmMs),
    ttftMs: numberOr(value.ttftMs),
    decodeMs: numberOr(value.decodeMs),
    decodeTokens: numberOr(value.decodeTokens),
    toolMs: numberOr(value.toolMs),
  }
}

function numberOr(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function listWorkspaces(ctx) {
  const service = ctx.get('workspaceRegistry')
  if (service === undefined) return []
  try {
    return service.list().map((w) => ({
      id: w.id,
      title: w.title || '',
      path: w.path || '',
      createdAt: w.createdAt || null,
    }))
  } catch {
    return []
  }
}

function listPlugins() {
  // Bundles are composed in the web profile; read them statically so the
  // Assets page can show Plugins as first-class enterprise AI assets.
  const profileFile = path.join(DSH_HOME, 'profiles', 'web', 'package.json')
  try {
    const pkg = JSON.parse(fs.readFileSync(profileFile, 'utf8'))
    const bundles = pkg?.dsh?.profile?.bundles ?? []
    return bundles.map((b, i) => ({ id: `plugin-${i}`, name: String(b), source: 'bundle' }))
  } catch {
    return []
  }
}

function listProviders(ctx) {
  // BYO-API visibility: which provider routes the deployment actually serves.
  const service = ctx.get('llm')
  if (service === undefined || typeof service.listProviders !== 'function') return []
  try {
    return service.listProviders().map((p) => ({ id: p.id, name: p.name || p.id }))
  } catch {
    return []
  }
}

function defaultModel(ctx) {
  const service = ctx.get('agentDefaultModel')
  if (service === undefined || typeof service.currentSelection !== 'function') return null
  try {
    const sel = service.currentSelection()
    if (!sel) return null
    return { provider: sel.provider ?? null, model: sel.model ?? null }
  } catch {
    return null
  }
}

// Normalize the usageCost projection value (view or raw fold state) to one
// plain cost summary. Never fabricate numbers: unknown price -> priced=false.
function normalizeCost(value) {
  if (!value || typeof value !== 'object') return null
  if (typeof value.total === 'number') {
    // view shape: { currency, total, priced, byModel: [...] }
    return {
      currency: typeof value.currency === 'string' ? value.currency : 'CNY',
      total: numberOr(value.total),
      priced: value.priced !== false,
      byModel: (Array.isArray(value.byModel) ? value.byModel : []).map((m) => ({
        provider: String(m.provider ?? 'unknown'),
        model: String(m.model ?? 'unknown'),
        displayName: typeof m.displayName === 'string' ? m.displayName : null,
        cost: numberOr(m.cost),
        priced: m.priced !== false,
        uncachedInputTokens: numberOr(m.uncachedInputTokens),
        outputTokens: numberOr(m.outputTokens),
        cacheReadTokens: numberOr(m.cacheReadTokens),
        cacheWriteTokens: numberOr(m.cacheWriteTokens),
      })),
    }
  }
  // raw fold state shape: { current, byModel: { key: {provider, model, cost, priced, ...} } }
  const byModel = []
  const map = value.byModel && typeof value.byModel === 'object' ? value.byModel : {}
  for (const key of Object.keys(map)) {
    const m = map[key] ?? {}
    const cost = numberOr(m.cost)
    byModel.push({
      provider: String(m.provider ?? key.split('/')[0] ?? 'unknown'),
      model: String(m.model ?? key.split('/')[1] ?? 'unknown'),
      displayName: null,
      cost,
      priced: m.priced !== false && cost > 0,
      uncachedInputTokens: numberOr(m.uncachedInputTokens),
      outputTokens: numberOr(m.outputTokens),
      cacheReadTokens: numberOr(m.cacheReadTokens),
      cacheWriteTokens: numberOr(m.cacheWriteTokens),
    })
  }
  return {
    currency: 'CNY',
    total: byModel.reduce((sum, m) => sum + m.cost, 0),
    priced: byModel.every((m) => m.priced),
    byModel,
  }
}

// ---------------------------------------------------------------------------
// Snapshot assembly.
// ---------------------------------------------------------------------------
async function buildSnapshot(ctx, record) {
  const presets = await listPresets(ctx)
  const skills = await listSkills(ctx)
  const sessions = await listSessions(ctx, 40)
  const plugins = listPlugins()
  const workspaces = listWorkspaces(ctx)
  const providers = listProviders(ctx)
  const model = defaultModel(ctx)

  const assets = buildAssets(record, agentsView(record, presets), skills, plugins)

  // Usage aggregate: real per-agent numbers, real per-model cost, structure-first member view.
  const byAgent = new Map()
  const byModel = new Map()
  let totals = {
    sessions: sessions.length, withStats: 0, turns: 0, steps: 0, llmMs: 0,
    decodeTokens: 0, decodeMs: 0,
    costTotal: 0, costCurrency: 'CNY', costPriced: true, costSessions: 0,
  }
  for (const s of sessions) {
    const key = s.agentPreset || '__default__'
    const acc = byAgent.get(key) ?? { agentPreset: key, sessions: 0, turns: 0, steps: 0, llmMs: 0, decodeTokens: 0, cost: 0 }
    acc.sessions += 1
    if (s.stats) {
      totals.withStats += 1
      totals.turns += s.stats.turns
      totals.steps += s.stats.steps
      totals.llmMs += s.stats.llmMs
      totals.decodeMs += s.stats.decodeMs
      totals.decodeTokens += s.stats.decodeTokens
      acc.turns += s.stats.turns
      acc.steps += s.stats.steps
      acc.llmMs += s.stats.llmMs
      acc.decodeTokens += s.stats.decodeTokens
    }
    if (s.cost && s.cost.byModel.length > 0) {
      totals.costSessions += 1
      totals.costTotal += s.cost.total
      totals.costCurrency = s.cost.currency || totals.costCurrency
      if (s.cost.priced === false) totals.costPriced = false
      acc.cost += s.cost.total
      for (const m of s.cost.byModel) {
        const mk = `${m.provider}/${m.model}`
        const row = byModel.get(mk) ?? {
          provider: m.provider, model: m.model, displayName: m.displayName,
          cost: 0, priced: true, uncachedInputTokens: 0, outputTokens: 0,
          cacheReadTokens: 0, cacheWriteTokens: 0,
        }
        row.cost += numberOr(m.cost)
        if (m.priced === false) row.priced = false
        row.uncachedInputTokens += numberOr(m.uncachedInputTokens)
        row.outputTokens += numberOr(m.outputTokens)
        row.cacheReadTokens += numberOr(m.cacheReadTokens)
        row.cacheWriteTokens += numberOr(m.cacheWriteTokens)
        byModel.set(mk, row)
      }
    }
    byAgent.set(key, acc)
  }
  const usage = {
    totals,
    byAgent: [...byAgent.values()].sort((a, b) => b.sessions - a.sessions),
    byModel: [...byModel.values()].sort((a, b) => b.cost - a.cost),
    byMember: [
      { memberId: 'u-self', sessions: sessions.length, label: '本地用户（你）' },
    ],
    budget: record.org.budget ?? { period: 'month', limitCny: null, alertPercent: 80 },
    note: 'DSH 为本地单实例，成员级用量按演示映射展示；统计来自最近 40 个会话。成本来自 session usageCost 投影（真实价格表，未知价格不计入且标记不可定价）。',
  }

  return {
    org: record.org,
    members: record.members,
    agents: agentsView(record, presets),
    assets,
    presets,
    skills,
    plugins,
    providers,
    defaultModel: model,
    teams: record.teams ?? [],
    workspaces,
    sessions,
    usage,
  }
}

// Best-effort runtime view of a live team session (DSH agentTeams seam).
function teamRuntimeView(ctx, sessionId) {
  const service = ctx.get('agentTeams')
  const sessions = ctx.get('sessions')
  if (!service || !sessions) return { note: 'agentTeams 未挂载' }
  const agent = sessions.get(sessionId)
  if (!agent) return { note: '会话不在运行（非 live）' }
  let membership
  try {
    membership = service.tryMembership(agent)
  } catch {
    return { note: '无法解析团队身份' }
  }
  if (!membership) return { note: '该会话不是团队成员会话' }
  const out = {
    membership: {
      team: String(membership.team ?? ''),
      role: String(membership.role ?? ''),
      name: String(membership.name ?? ''),
    },
    members: null,
    tasks: null,
    note: '',
  }
  try {
    out.members = service.listMembers(agent).map((m) => ({
      name: typeof m.name === 'string' ? m.name : String(m.name ?? ''),
      role: typeof m.role === 'string' ? m.role : String(m.role ?? ''),
      status: typeof m.status === 'string' ? m.status : String(m.status ?? ''),
    }))
  } catch {
    out.members = null
  }
  try {
    out.tasks = service.listTasks(agent).map((t) => ({
      id: String(t.id ?? ''),
      title: typeof t.text === 'string' ? t.text : String(t.title ?? t.id ?? ''),
      status: String(t.status ?? ''),
      blockers: Array.isArray(t.blockers) ? t.blockers.map(String) : null,
    }))
  } catch {
    out.tasks = null
  }
  return out
}

function agentsView(record, presets) {
  const lookup = new Map(presets.map((p) => [p.id, p]))
  return record.agents.map((a) => {
    const preset = a.presetId ? lookup.get(a.presetId) : undefined
    return {
      ...a,
      preset: preset
        ? { id: preset.id, name: preset.name, description: preset.description, trust: preset.trust, broken: preset.broken }
        : null,
      updatedAt: a.updatedAt ?? 0,
    }
  })
}

function buildAssets(record, agents, skills, plugins) {
  const overrides = new Map((record.assets ?? []).map((a) => [`${a.refType}:${a.refId}`, a]))
  const rows = []
  for (const agent of agents) {
    const override = overrides.get(`agent:${agent.id}`)
    rows.push({
      id: `asset-agent-${agent.id}`,
      refType: 'agent',
      refId: agent.id,
      name: agent.name,
      ownerId: agent.creatorId ?? 'u-self',
      sharing: override ? override.sharing : agent.visibility === 'personal' ? 'personal' : 'enterprise',
      recommended: override ? override.recommended === true : false,
      updatedAt: override ? override.updatedAt ?? now() : agent.updatedAt ?? 0,
    })
  }
  for (const skill of skills) {
    const override = overrides.get(`skill:${skill.name}`)
    rows.push({
      id: `asset-skill-${skill.name}`,
      refType: 'skill',
      refId: skill.name,
      name: skill.name,
      ownerId: 'u-self',
      sharing: override ? override.sharing : 'enterprise',
      recommended: override ? override.recommended === true : false,
      updatedAt: override ? override.updatedAt ?? now() : 0,
    })
  }
  for (const plugin of plugins) {
    const override = overrides.get(`plugin:${plugin.id}`)
    rows.push({
      id: `asset-plugin-${plugin.id}`,
      refType: 'plugin',
      refId: plugin.id,
      name: plugin.name,
      ownerId: 'u-self',
      sharing: override ? override.sharing : 'enterprise',
      recommended: override ? override.recommended === true : false,
      updatedAt: override ? override.updatedAt ?? now() : 0,
    })
  }
  rows.sort((a, b) => String(a.name).localeCompare(String(b.name)))
  return rows
}

// ---------------------------------------------------------------------------
// Mutations.
// ---------------------------------------------------------------------------
async function applyAction(record, action, payload, ctx) {
  const body = payload ?? {}
  switch (action) {
    case 'agent.create': {
      const name = String(body.name ?? '').trim()
      if (name === '') throw new Error('Agent 名称不能为空')
      const presetId = body.presetId ? String(body.presetId) : null
      if (presetId) {
        const presets = await listPresets(ctx)
        if (!presets.some((p) => p.id === presetId)) throw new Error(`预置角色不存在: ${presetId}`)
      }
      record.agents.push({
        id: `agent-${now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.slice(0, 80),
        description: String(body.description ?? '').slice(0, 300),
        icon: String(body.icon ?? '🤖').slice(0, 8),
        color: String(body.color ?? pickColor(record.agents.length)).slice(0, 16),
        capabilities: Array.isArray(body.capabilities) ? body.capabilities.slice(0, 12).map(String) : [],
        skills: Array.isArray(body.skills) ? body.skills.slice(0, 12).map(String) : [],
        plugins: Array.isArray(body.plugins) ? body.plugins.slice(0, 12).map(String) : [],
        model: String(body.model ?? '').slice(0, 120),
        workspace: '',
        visibility: body.visibility === 'personal' ? 'personal' : 'enterprise',
        creatorId: 'u-self',
        demo: false,
        presetId,
        autoInvokeSkills: body.autoInvokeSkills === true,
        profile: body.profile && typeof body.profile === 'object' ? {
          howToCall: String(body.profile.howToCall ?? '').slice(0, 60),
          language: String(body.profile.language ?? '').slice(0, 20),
          note: String(body.profile.note ?? '').slice(0, 120),
          background: String(body.profile.background ?? '').slice(0, 300),
        } : {},
        updatedAt: now(),
      })
      return
    }
    case 'agent.bind': {
      const agent = record.agents.find((a) => a.id === body.id)
      if (!agent) throw new Error('Agent 不存在')
      const presetId = String(body.presetId ?? '')
      if (presetId === '') throw new Error('请选择要绑定的 DSH 预置角色')
      const presets = await listPresets(ctx)
      if (!presets.some((p) => p.id === presetId)) throw new Error(`预置角色不存在: ${presetId}`)
      agent.presetId = presetId
      agent.demo = false
      agent.updatedAt = now()
      return
    }
    case 'org.update': {
      if (typeof body.name === 'string' && body.name.trim().length > 0) record.org.name = body.name.trim().slice(0, 120)
      if (typeof body.description === 'string') record.org.description = body.description.slice(0, 500)
      const budget = body.budget ?? body.orgBudget ?? null
      if (budget && typeof budget === 'object') {
        const current = record.org.budget ?? { period: 'month', limitCny: null, alertPercent: 80 }
        if (budget.limitCny === null || (typeof budget.limitCny === 'number' && budget.limitCny >= 0)) current.limitCny = budget.limitCny
        if (typeof budget.alertPercent === 'number' && budget.alertPercent >= 0 && budget.alertPercent <= 100) current.alertPercent = budget.alertPercent
        if (typeof budget.period === 'string' && budget.period.trim()) current.period = budget.period.trim().slice(0, 20)
        record.org.budget = current
      }
      return
    }
    case 'member.add': {
      const name = String(body.name ?? '').trim().slice(0, 60)
      const email = String(body.email ?? '').trim().slice(0, 120)
      const role = body.role === 'admin' || body.role === 'member' ? body.role : 'member'
      if (name === '' || email === '') throw new Error('成员需要名称与邮箱')
      if (record.members.some((m) => m.email === email)) throw new Error('该邮箱已存在')
      record.members.push({
        id: `u-${now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        email,
        role,
        color: pickColor(record.members.length),
        joinedAt: now(),
      })
      return
    }
    case 'member.remove': {
      const member = record.members.find((m) => m.id === body.memberId)
      if (!member) throw new Error('成员不存在')
      if (member.role === 'owner') throw new Error('不能移除 Owner')
      record.members = record.members.filter((m) => m.id !== body.memberId)
      return
    }
    case 'member.role': {
      const member = record.members.find((m) => m.id === body.memberId)
      if (!member) throw new Error('成员不存在')
      if (member.role === 'owner') throw new Error('不能修改 Owner 角色')
      const role = body.role
      if (role !== 'admin' && role !== 'member') throw new Error('角色只能是 admin / member')
      member.role = role
      return
    }
    case 'team.create': {
      const name = String(body.name ?? '').trim()
      if (name === '') throw new Error('团队名称不能为空')
      record.teams = record.teams ?? []
      record.teams.push({
        id: `team-${now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.slice(0, 80),
        description: String(body.description ?? '').slice(0, 300),
        tlPresetId: body.tlPresetId ? String(body.tlPresetId) : '',
        memberPresetIds: Array.isArray(body.memberPresetIds) ? body.memberPresetIds.slice(0, 12).map(String) : [],
        workspace: '',
        createdAt: now(),
      })
      return
    }
    case 'team.update': {
      const team = (record.teams ?? []).find((t) => t.id === body.id)
      if (!team) throw new Error('团队不存在')
      if (typeof body.name === 'string' && body.name.trim().length > 0) team.name = body.name.trim().slice(0, 80)
      if (typeof body.description === 'string') team.description = body.description.slice(0, 300)
      if (typeof body.tlPresetId === 'string') team.tlPresetId = body.tlPresetId
      if (Array.isArray(body.memberPresetIds)) team.memberPresetIds = body.memberPresetIds.slice(0, 12).map(String)
      return
    }
    case 'team.delete': {
      const before = (record.teams ?? []).length
      record.teams = (record.teams ?? []).filter((t) => t.id !== body.id)
      if (record.teams.length === before) throw new Error('团队不存在')
      return
    }
    case 'team.runtime': {
      const sessionId = String(body.sessionId ?? '')
      if (sessionId === '') throw new Error('缺少 sessionId')
      return teamRuntimeView(ctx, sessionId)
    }
    case 'agent.update': {
      const agent = record.agents.find((a) => a.id === body.id)
      if (!agent) throw new Error('Agent 不存在')
      if (typeof body.name === 'string' && body.name.trim().length > 0) agent.name = body.name.trim().slice(0, 80)
      if (typeof body.description === 'string') agent.description = body.description.slice(0, 300)
      if (body.visibility === 'enterprise' || body.visibility === 'personal') agent.visibility = body.visibility
      agent.updatedAt = now()
      return
    }
    case 'asset.share': {
      const asset = record.assets.find((a) => a.id === body.assetId)
      const target = {
        refType: asset ? asset.refType : String(body.refType ?? ''),
        refId: asset ? asset.refId : String(body.refId ?? ''),
      }
      if (!target.refType || !target.refId) throw new Error('资产不存在')
      const sharing = body.sharing === 'personal' ? 'personal' : 'enterprise'
      const existing = record.assets.find((a) => a.refType === target.refType && a.refId === target.refId)
      if (existing) {
        existing.sharing = sharing
        existing.updatedAt = now()
      } else {
        record.assets.push({
          id: `asset-${now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          refType: target.refType,
          refId: target.refId,
          name: String(body.name ?? target.refId).slice(0, 120),
          ownerId: String(body.ownerId ?? 'u-self'),
          sharing,
          updatedAt: now(),
        })
      }
      return
    }
    case 'asset.recommend': {
      const asset = record.assets.find((a) => a.id === body.assetId)
      const target = {
        refType: asset ? asset.refType : String(body.refType ?? ''),
        refId: asset ? asset.refId : String(body.refId ?? ''),
      }
      if (!target.refType || !target.refId) throw new Error('资产不存在')
      const recommended = body.recommended === true
      const existing = record.assets.find((a) => a.refType === target.refType && a.refId === target.refId)
      if (existing) {
        existing.recommended = recommended
        existing.updatedAt = now()
      } else {
        record.assets.push({
          id: `asset-${now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          refType: target.refType,
          refId: target.refId,
          name: String(body.name ?? target.refId).slice(0, 120),
          ownerId: String(body.ownerId ?? 'u-self'),
          sharing: 'enterprise',
          recommended,
          updatedAt: now(),
        })
      }
      return
    }
    case 'reset.demo': {
      const fresh = seedRecord()
      record.org = { ...fresh.org, id: record.org.id, createdAt: record.org.createdAt }
      record.members = fresh.members
      record.agents = fresh.agents
      record.assets = []
      return
    }
    default:
      throw new Error(`未知操作: ${action}`)
  }
}

function pickColor(index) {
  const colors = ['#00a573', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']
  return colors[index % colors.length]
}

// ---------------------------------------------------------------------------
// Inline conversation view (mode-internal chat): map the session surface to a
// minimal message list the Enterprise UI can render.
// ---------------------------------------------------------------------------
function mapSurfaceEvent(ev) {
  const data = ev && ev.data
  const blocks = data && Array.isArray(data.content) ? data.content : []
  const texts = []
  const tools = []
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue
    if (b.type === 'text' && typeof b.text === 'string' && b.text.trim()) { texts.push(b.text); continue }
    if (b.type === 'tool-call' && typeof b.name === 'string') { tools.push(b.name); continue }
    if (b.type === 'tool-result') {
      const n = typeof b.name === 'string' ? b.name : typeof b.toolName === 'string' ? b.toolName : null
      if (n) tools.push(n)
      continue
    }
  }
  if (ev.type === 'user/message') {
    return texts.length ? { kind: 'user', text: texts.join('\n') } : null
  }
  if (ev.type === 'assistant/message') {
    if (texts.length) return { kind: 'assistant', text: texts.join('\n') }
    if (tools.length) return { kind: 'tool', text: '工具调用：' + tools.join('、') }
    return null
  }
  if (ev.type === 'tool/result') {
    if (tools.length) return { kind: 'tool', text: '⚙️ ' + tools.join('、') + ' 完成' }
    return null
  }
  return null
}

async function conversationView(ctx, sessionId, afterSeq) {
  const q = ctx.get('sessionQuery')
  if (!q || typeof q.readSurface !== 'function') throw new Error('sessionQuery 未挂载')
  let events = []
  let seqNum = 0
  let sessionHeader = null
  try {
    const surface = await q.readSurface(sessionId)
    events = Array.isArray(surface.events) ? surface.events : []
    seqNum = surface.capturedThroughSeq ?? 0
    sessionHeader = surface.session ?? null
  } catch {
    // Cold/legacy sessions may not fold a surface; fall back to the raw log.
    const log = await q.readSession(sessionId)
    events = Array.isArray(log.events) ? log.events : []
    seqNum = events.length ? events[events.length - 1].seq ?? 0 : 0
    sessionHeader = log.session ?? null
  }
  const after = Number(afterSeq) || 0
  const messages = []
  for (const ev of events) {
    const s = ev && typeof ev.seq === 'number' ? ev.seq : 0
    if (after > 0 && s <= after) continue
    const m = mapSurfaceEvent(ev)
    if (m) messages.push({ ...m, seq: s })
  }
  let title = null
  let agentPreset = null
  try {
    const t = await q.readTitle(sessionId)
    title = t && typeof t.title === 'string' ? t.title : null
  } catch {
    /* title best-effort */
  }
  try {
    agentPreset = sessionHeader && typeof sessionHeader.agentPreset === 'string' ? sessionHeader.agentPreset : null
  } catch {
    /* best-effort */
  }
  const cwd = sessionHeader && typeof sessionHeader.cwd === 'string' ? sessionHeader.cwd : null
  return { ok: true, seq: seqNum, title, agentPreset, cwd, messages }
}

// ---------------------------------------------------------------------------
// Plugin.
// ---------------------------------------------------------------------------
export function apply(ctx) {
  const web = ctx.webServer
  let record = loadRecord()

  function sendJson(res, status, value) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(value))
  }

  web.register({
    kind: 'exact',
    path: ROUTE,
    async handler(req, res) {      try {
        if (req.method === 'GET' || req.method === undefined) {
          const state = await buildSnapshot(ctx, record)
          sendJson(res, 200, { ok: true, state })
          return
        }
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += String(chunk)
            if (body.length > MAX_BODY) req.destroy()
          })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}')
              const action = String(parsed.action ?? '')
              const result = await applyAction(record, action, parsed.payload, ctx)
              if (action === 'team.runtime') {
                sendJson(res, 200, { ok: true, runtime: result ?? null })
                return
              }
              saveRecord(record)
              const state = await buildSnapshot(ctx, record)
              sendJson(res, 200, { ok: true, state })
            } catch (error) {
              sendJson(res, 400, { ok: false, error: String(error?.message ?? error) })
            }
          })
          return
        }
        sendJson(res, 405, { ok: false, error: 'method not allowed' })
      } catch (error) {
        try {
          sendJson(res, 500, { ok: false, error: String(error?.message ?? error) })
        } catch {
          /* response already gone */
        }
      }
    },
  })

  // Inline conversation view for the Enterprise chat surface (polling-safe).
  web.register({
    kind: 'exact',
    path: CONV_ROUTE,
    async handler(req, res) {
      try {
        const raw = String(req.url ?? '')
        const at = raw.indexOf('?')
        const query = new URLSearchParams(at === -1 ? '' : raw.slice(at + 1))
        const sessionId = query.get('sessionId') || ''
        const after = Number(query.get('after') || 0) || 0
        if (sessionId === '') {
          sendJson(res, 400, { ok: false, error: 'missing sessionId' })
          return
        }
        const view = await conversationView(ctx, sessionId, after)
        sendJson(res, 200, view)
      } catch (error) {
        try {
          sendJson(res, 200, { ok: true, seq: 0, title: null, agentPreset: null, messages: [], note: String(error?.message ?? error) })
        } catch {
          /* response already gone */
        }
      }
    },
  })
}
