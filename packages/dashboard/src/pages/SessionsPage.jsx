import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SessionRow from '../components/SessionRow'
import SessionDetailPanel from '../components/SessionDetailPanel'
import { useApi } from '../hooks/useApi'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'idle', label: 'Idle' },
  { value: 'completed', label: 'Completed' },
  { value: 'crashed', label: 'Crashed' },
]

export default function SessionsPage() {
  const { data: sessionsData, loading: sessionsLoading } = useApi('/api/sessions', 10000)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const sessions = sessionsData?.sessions || []

  const models = useMemo(() => {
    const set = new Set(sessions.map((s) => s.model).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [sessions])

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    let cancelled = false
    setSearchLoading(true)

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled) setSearchResults(data.results || [])
      })
      .catch(() => {
        if (!cancelled) setSearchResults([])
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (modelFilter !== 'all' && s.model !== modelFilter) return false
      return true
    })
  }, [sessions, statusFilter, modelFilter])

  const displayItems = useMemo(() => {
    if (!debouncedQuery) {
      return filteredSessions.map((session) => ({ session, snippet: null }))
    }

    const sessionMap = new Map(sessions.map((s) => [s.id, s]))
    return searchResults
      .map((hit) => {
        const session = sessionMap.get(hit.sessionId)
        if (!session) return null
        if (statusFilter !== 'all' && session.status !== statusFilter) return null
        if (modelFilter !== 'all' && session.model !== modelFilter) return null
        return { session, snippet: hit.snippet }
      })
      .filter(Boolean)
  }, [debouncedQuery, filteredSessions, searchResults, sessions, statusFilter, modelFilter])

  const handleSelect = useCallback((id) => {
    setSelectedId(id)
  }, [])

  const listLoading = sessionsLoading || (debouncedQuery && searchLoading)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="session-search" className="text-xs text-zinc-500 uppercase tracking-wider">
            Search sessions
          </label>
          <div className="relative mt-1.5">
            <input
              id="session-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages and tool calls…"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/30"
            />
            {searchLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                Searching…
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <div>
            <label htmlFor="status-filter" className="text-xs text-zinc-500 uppercase tracking-wider">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1.5 block rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-zinc-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="model-filter" className="text-xs text-zinc-500 uppercase tracking-wider">
              Model
            </label>
            <select
              id="model-filter"
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="mt-1.5 block rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-accent/40 min-w-[140px]"
            >
              {models.map((m) => (
                <option key={m} value={m} className="bg-zinc-900">
                  {m === 'all' ? 'All models' : m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-600">
        {debouncedQuery
          ? `${displayItems.length} result${displayItems.length === 1 ? '' : 's'} for "${debouncedQuery}"`
          : `${displayItems.length} session${displayItems.length === 1 ? '' : 's'} indexed`}
      </p>

      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <div className="lg:col-span-2 glass-card overflow-hidden min-h-[420px] max-h-[calc(100vh-16rem)] flex flex-col">
          {listLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-zinc-800/40 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <p className="text-zinc-400 text-sm">
                {debouncedQuery ? 'No matches found' : 'No sessions indexed yet'}
              </p>
              <p className="text-zinc-600 text-xs mt-1">
                {debouncedQuery
                  ? 'Try different keywords'
                  : 'Run Claude Code — sessions appear automatically'}
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {displayItems.map(({ session, snippet }) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  snippet={snippet}
                  selected={selectedId === session.id}
                  onClick={() => handleSelect(session.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 min-h-[420px] max-h-[calc(100vh-16rem)]">
          <SessionDetailPanel sessionId={selectedId} onClose={() => setSelectedId(null)} />
        </div>
      </div>
    </motion.div>
  )
}
