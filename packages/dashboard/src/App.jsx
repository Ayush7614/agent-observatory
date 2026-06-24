import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function App() {
  const [health, setHealth] = useState(null)
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(console.error)

    const es = new EventSource('/api/live')
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        setEvents((prev) => [parsed, ...prev].slice(0, 50))
      } catch {}
    }
    return () => es.close()
  }, [])

  return (
    <div className="min-h-screen p-6 md:p-8">
      <header className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold gradient-text"
        >
          Agent Observatory
        </motion.h1>
        <p className="text-zinc-400 mt-1">Universal dashboard for coding AI agents</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6"
        >
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Server Status
          </h2>
          {health ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm">Online</span>
              </div>
              <p className="text-zinc-300 text-sm">Version {health.version}</p>
              <p className="text-zinc-500 text-xs">
                Adapters: {health.adapters?.map((a) => a.name).join(', ') || 'none'}
              </p>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Connecting...</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:col-span-2"
        >
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Live Events
          </h2>
          <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
            {events.length === 0 ? (
              <p className="text-zinc-500">Waiting for agent activity...</p>
            ) : (
              events.map((ev, i) => (
                <div key={i} className="text-zinc-400 truncate">
                  <span className="text-accent">{ev.type}</span>
                  {ev.data?.tool && (
                    <span className="text-zinc-300"> → {ev.data.tool}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 lg:col-span-3"
        >
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Development Progress
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Core & Store', status: 'scaffold', day: 'Day 1' },
              { label: 'Claude Code Adapter', status: 'scaffold', day: 'Day 1-2' },
              { label: 'API + SSE', status: 'scaffold', day: 'Day 3' },
              { label: 'Dashboard UI', status: 'in progress', day: 'Day 4-5' },
              { label: 'Search & Recovery', status: 'planned', day: 'Day 5-6' },
              { label: 'Hooks & CLI', status: 'planned', day: 'Day 6' },
              { label: 'Polish & Public', status: 'planned', day: 'Day 7' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3"
              >
                <p className="text-sm text-zinc-200">{item.label}</p>
                <p className="text-xs text-zinc-500 mt-1">{item.day}</p>
                <span
                  className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                    item.status === 'in progress'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : item.status === 'scaffold'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-zinc-500/20 text-zinc-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
