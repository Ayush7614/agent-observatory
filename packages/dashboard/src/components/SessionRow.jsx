import {
  formatAgent,
  formatCost,
  formatDateTime,
  formatModel,
  formatTokens,
  isLocalModel,
  statusBadgeClass,
} from '../lib/format'

export default function SessionRow({ session, snippet, selected, onClick }) {
  const local = isLocalModel(session.model)
  const tokens = session.tokenUsage || {}
  const totalTokens = (tokens.input || 0) + (tokens.output || 0)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 transition-colors border-b border-white/[0.04] last:border-0 ${
        selected
          ? 'bg-accent/10 border-l-2 border-l-accent'
          : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-zinc-100 truncate">
              {session.projectName || 'Unknown project'}
            </p>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadgeClass(session.status)}`}
            >
              {session.status}
            </span>
            {local && (
              <span className="text-[10px] text-cyan-400/90 uppercase tracking-wide">local</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            {formatAgent(session.agentId)} · {formatModel(session.model)}
          </p>
          {snippet && (
            <p className="text-xs text-zinc-400 mt-2 line-clamp-2 font-mono">{snippet}</p>
          )}
        </div>
        <div className="shrink-0 text-right text-xs text-zinc-500 space-y-1">
          <p>{formatDateTime(session.updatedAt)}</p>
          <p className="text-zinc-400">{formatTokens(totalTokens)} tokens</p>
          <p className="text-zinc-300">{formatCost(session.estimatedCostUsd, { local })}</p>
        </div>
      </div>
      <div className="flex gap-3 mt-2 text-[11px] text-zinc-600">
        <span>{session.messageCount || 0} messages</span>
        <span>·</span>
        <span>{session.toolCallCount || 0} tools</span>
      </div>
    </button>
  )
}
