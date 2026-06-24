import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Layout from './components/Layout'
import ActiveSessionCard from './components/ActiveSessionCard'
import LiveActivityFeed from './components/LiveActivityFeed'
import QuickStats from './components/QuickStats'
import { useApi, useLiveEvents } from './hooks/useApi'

export default function App() {
  const { events, connected: sseConnected } = useLiveEvents()
  const { data: sessionsData, loading: sessionsLoading } = useApi('/api/sessions', 5000)
  const { data: stats, loading: statsLoading } = useApi('/api/stats/today', 10000)
  const { data: health } = useApi('/api/health', 30000)

  const activeSession = useMemo(() => {
    const sessions = sessionsData?.sessions || []
    if (!sessions.length) return null
    return [...sessions].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0]
  }, [sessionsData])

  const lastTool = useMemo(() => {
    const toolEv = events.find((e) => e.type === 'tool:executed')
    return toolEv?.data || null
  }, [events])

  // Merge live session updates from SSE
  const displaySession = useMemo(() => {
    if (!activeSession) return null
    const liveUpdate = events.find(
      (e) => e.type === 'session:updated' && e.data?.id === activeSession.id
    )
    return liveUpdate?.data || activeSession
  }, [activeSession, events])

  return (
    <Layout activeTab="home" onTabChange={() => {}} connected={sseConnected}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <QuickStats stats={stats} loading={statsLoading} />

        <div className="grid gap-6 lg:grid-cols-2">
          <ActiveSessionCard session={displaySession} lastTool={lastTool} />
          <LiveActivityFeed events={events} connected={sseConnected} />
        </div>

        {health && (
          <div className="glass-card px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span>
              Server <span className="text-emerald-400">v{health.version}</span>
            </span>
            <span>·</span>
            <span>Uptime {Math.floor(health.uptime / 60)}m</span>
            <span>·</span>
            <span>
              Adapters:{' '}
              {health.adapters?.map((a) => a.name).join(', ') || 'none'}
            </span>
            {!sessionsLoading && (
              <>
                <span>·</span>
                <span>{sessionsData?.sessions?.length || 0} sessions indexed</span>
              </>
            )}
          </div>
        )}
      </motion.div>
    </Layout>
  )
}
