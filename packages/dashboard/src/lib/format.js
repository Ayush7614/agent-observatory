export function formatTokens(n) {
  if (n == null || Number.isNaN(n)) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function formatCost(usd, { local = false } = {}) {
  if (local) return 'Free · local'
  if (usd == null || Number.isNaN(usd)) return '$0.00'
  return `$${Number(usd).toFixed(2)}`
}

/** Match Ollama/local model names for UI (mirrors core isLocalModel) */
export function isLocalModel(model) {
  if (!model || model === 'unknown') return false
  const m = model.toLowerCase()
  if (['claude-', 'gpt-', 'o1', 'o2', 'o3'].some((p) => m.startsWith(p))) return false
  if (/:[\w.]+/.test(m)) return true
  return ['ollama', 'qwen', 'llama', 'mistral', 'gemma', 'phi', 'deepseek'].some((n) =>
    m.includes(n)
  )
}

export function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return '—'
  }
}

export function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export function statusBadgeClass(status) {
  const map = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    idle: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
    completed: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    crashed: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  }
  return map[status] || map.idle
}

export function formatModel(model) {
  if (!model || model === 'unknown') return 'Unknown model'
  return model
    .replace(/^claude-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatAgent(agentId) {
  const map = {
    'claude-code': 'Claude Code',
    aider: 'Aider',
    generic: 'Generic',
  }
  return map[agentId] || agentId
}

export function toolColor(tool) {
  const colors = {
    Read: 'text-sky-400',
    Edit: 'text-amber-400',
    Write: 'text-amber-400',
    Bash: 'text-rose-400',
    Grep: 'text-violet-400',
    Glob: 'text-violet-400',
    Task: 'text-indigo-400',
  }
  for (const [name, color] of Object.entries(colors)) {
    if (tool?.startsWith(name)) return color
  }
  return 'text-zinc-300'
}

export function contextColor(percent) {
  if (percent >= 90) return 'bg-rose-500'
  if (percent >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}
