import { formatAgent, formatModel, formatCost, formatTokens, contextColor, isLocalModel } from '../lib/format'

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-zinc-200 mt-0.5">{value}</p>
    </div>
  )
}

export default function ActiveSessionCard({ session, lastTool }) {
  if (!session) {
    return (
      <div className="glass-card p-6 h-full">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Active Session
        </h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3">
            <span className="text-2xl opacity-40">◎</span>
          </div>
          <p className="text-zinc-400 text-sm">No active session</p>
          <p className="text-zinc-600 text-xs mt-1">Start Claude Code to see live data</p>
        </div>
      </div>
    )
  }

  const tokens = session.tokenUsage || {}
  const context = session.contextPercent || 0
  const local = isLocalModel(session.model)

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Active Session
          </h2>
          <p className="text-lg font-semibold text-zinc-100 mt-1">
            {session.projectName || 'Unknown project'}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">
            {formatAgent(session.agentId)} · {formatModel(session.model)}
            {local && (
              <span className="ml-2 text-xs text-cyan-400/90">· Ollama / local</span>
            )}
          </p>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          {lastTool ? `Running ${lastTool.tool}` : session.status}
        </span>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
          <span>Context window</span>
          <span>{context > 0 ? `${Math.round(context)}%` : '—'}</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${contextColor(context)}`}
            style={{ width: `${Math.min(100, Math.max(context, context > 0 ? 4 : 0))}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <Stat label="Input" value={formatTokens(tokens.input)} />
        <Stat label="Output" value={formatTokens(tokens.output)} />
        <Stat label="Cache read" value={formatTokens(tokens.cacheRead)} />
        <Stat label="Session cost" value={formatCost(session.estimatedCostUsd, { local })} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 pt-3 border-t border-white/[0.06]">
        <span>{session.messageCount || 0} messages</span>
        <span>·</span>
        <span>{session.toolCallCount || 0} tools</span>
        {session.updatedAt && (
          <>
            <span>·</span>
            <span>Updated {new Date(session.updatedAt).toLocaleTimeString()}</span>
          </>
        )}
      </div>
    </div>
  )
}
