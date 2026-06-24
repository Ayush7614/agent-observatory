import { formatCost, formatTokens } from '../lib/format'

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-zinc-100 mt-1">{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}

export default function QuickStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  const s = stats || {}

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Today's cost" value={formatCost(s.totalCostUsd)} sub={s.date} />
      <StatCard label="Sessions" value={s.sessionCount ?? 0} />
      <StatCard label="Tool calls" value={s.toolCallCount ?? 0} />
      <StatCard
        label="Tokens"
        value={formatTokens((s.totalInputTokens || 0) + (s.totalOutputTokens || 0))}
        sub={`${formatTokens(s.totalInputTokens)} in · ${formatTokens(s.totalOutputTokens)} out`}
      />
    </div>
  )
}
