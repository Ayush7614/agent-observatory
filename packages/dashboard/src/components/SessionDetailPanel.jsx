import { useApi } from '../hooks/useApi'
import {
  formatAgent,
  formatCost,
  formatDateTime,
  formatModel,
  formatTokens,
  isLocalModel,
  statusBadgeClass,
  toolColor,
} from '../lib/format'

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const preview =
    message.content?.length > 500 ? `${message.content.slice(0, 500)}…` : message.content

  return (
    <div
      className={`rounded-lg px-3 py-2 text-sm ${
        isUser ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/[0.03] border border-white/[0.06]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">{message.role}</span>
        <span className="text-[10px] text-zinc-600">{formatDateTime(message.timestamp)}</span>
      </div>
      <p className="text-zinc-300 whitespace-pre-wrap break-words text-xs leading-relaxed">{preview}</p>
    </div>
  )
}

function ToolEventRow({ event }) {
  return (
    <div className="flex gap-2 text-xs py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-zinc-600 shrink-0 w-16">{formatDateTime(event.timestamp).split(',')[1]?.trim()}</span>
      <span className={`shrink-0 font-medium ${toolColor(event.tool)}`}>{event.tool}</span>
      <span className="text-zinc-400 truncate font-mono">{event.inputSummary || '—'}</span>
    </div>
  )
}

export default function SessionDetailPanel({ sessionId, onClose }) {
  const { data, loading, error } = useApi(sessionId ? `/api/sessions/${sessionId}` : null, 0)

  if (!sessionId) {
    return (
      <div className="glass-card h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3">
          <span className="text-2xl opacity-40">▤</span>
        </div>
        <p className="text-zinc-400 text-sm">Select a session</p>
        <p className="text-zinc-600 text-xs mt-1">Click a row to view transcript preview</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card h-full p-6 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-zinc-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data?.session) {
    return (
      <div className="glass-card h-full p-6 flex items-center justify-center">
        <p className="text-rose-400 text-sm">Failed to load session</p>
      </div>
    )
  }

  const { session, messages = [], toolEvents = [] } = data
  const local = isLocalModel(session.model)
  const tokens = session.tokenUsage || {}

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      <div className="p-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-zinc-100 truncate">
              {session.projectName || 'Unknown project'}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {formatAgent(session.agentId)} · {formatModel(session.model)}
              {local && <span className="ml-2 text-cyan-400/90">· Ollama / local</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadgeClass(session.status)}`}
            >
              {session.status}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div>
            <p className="text-zinc-600 uppercase tracking-wider">Started</p>
            <p className="text-zinc-300 mt-0.5">{formatDateTime(session.startedAt)}</p>
          </div>
          <div>
            <p className="text-zinc-600 uppercase tracking-wider">Updated</p>
            <p className="text-zinc-300 mt-0.5">{formatDateTime(session.updatedAt)}</p>
          </div>
          <div>
            <p className="text-zinc-600 uppercase tracking-wider">Tokens</p>
            <p className="text-zinc-300 mt-0.5">
              {formatTokens(tokens.input)} in · {formatTokens(tokens.output)} out
            </p>
          </div>
          <div>
            <p className="text-zinc-600 uppercase tracking-wider">Cost</p>
            <p className="text-zinc-300 mt-0.5">{formatCost(session.estimatedCostUsd, { local })}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {toolEvents.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Tool calls ({toolEvents.length})
            </h3>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-3">
              {toolEvents.map((ev) => (
                <ToolEventRow key={ev.id} event={ev} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Messages ({messages.length})
          </h3>
          {messages.length === 0 ? (
            <p className="text-xs text-zinc-600">No messages indexed yet</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
