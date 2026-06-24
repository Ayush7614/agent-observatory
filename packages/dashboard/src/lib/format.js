export function formatTokens(n) {
  if (n == null || Number.isNaN(n)) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function formatCost(usd) {
  if (usd == null || Number.isNaN(usd)) return '$0.00'
  return `$${Number(usd).toFixed(2)}`
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
