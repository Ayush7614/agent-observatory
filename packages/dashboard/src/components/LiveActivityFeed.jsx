import { motion, AnimatePresence } from 'framer-motion'
import { formatTime, toolColor } from '../lib/format'

export default function LiveActivityFeed({ events, connected }) {
  const activity = events.filter(
    (e) =>
      (e.type === 'tool:executed' && e.data?.tool) ||
      (e.type === 'agent:state' && e.data?.state === 'waiting')
  )

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Live Activity
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}
          />
          <span className="text-xs text-zinc-500">{connected ? 'Live' : 'Reconnecting'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-[240px] max-h-[360px] pr-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {activity.length === 0 ? (
            <p className="text-zinc-500 text-sm py-8 text-center">
              Waiting for agent activity…
            </p>
          ) : (
            activity.map((ev, i) => (
              <motion.div
                key={`${ev.type}-${ev.data?.id || ev.data?.sessionId || i}-${ev.data?.timestamp}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.03] font-mono text-xs group"
              >
                {ev.type === 'agent:state' ? (
                  <>
                    <span className="text-zinc-600 shrink-0 w-[72px]">{formatTime(new Date().toISOString())}</span>
                    <span className="shrink-0 w-20 font-semibold text-amber-400">Alert</span>
                    <span className="text-amber-200/90 truncate">{ev.data.message || 'Needs attention'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-zinc-600 shrink-0 w-[72px]">
                      {formatTime(ev.data.timestamp)}
                    </span>
                    <span className={`shrink-0 w-20 font-semibold ${toolColor(ev.data.tool)}`}>
                      {ev.data.tool}
                    </span>
                    <span className="text-zinc-400 truncate group-hover:text-zinc-300">
                      {summarizeInput(ev.data.inputSummary)}
                    </span>
                  </>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function summarizeInput(input) {
  if (!input) return ''
  try {
    const obj = JSON.parse(input)
    if (obj.file_path) return obj.file_path
    if (obj.command) return obj.command.slice(0, 120)
    if (obj.pattern) return obj.pattern
    return input.slice(0, 120)
  } catch {
    return input.slice(0, 120)
  }
}
