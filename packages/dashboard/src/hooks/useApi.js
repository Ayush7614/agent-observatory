import { useCallback, useEffect, useState } from 'react'

export function useApi(path, refreshMs = 0) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(Boolean(path))

  const reload = useCallback(async () => {
    if (!path) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(path)
      if (!res.ok) throw new Error(`${res.status}`)
      setData(await res.json())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    if (!path) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    reload()
    if (!refreshMs) return
    const id = setInterval(reload, refreshMs)
    return () => clearInterval(id)
  }, [reload, refreshMs, path])

  return { data, error, loading, reload }
}

export function useLiveEvents() {
  const [events, setEvents] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource('/api/live')

    es.onopen = () => setConnected(true)
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        if (parsed.type === 'connected') return
        setEvents((prev) => [parsed, ...prev].slice(0, 100))
      } catch {}
    }
    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [])

  return { events, connected }
}
