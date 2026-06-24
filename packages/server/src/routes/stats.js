import { computeStats } from '@agent-observatory/core'

export async function handleStats(_req, res, ctx) {
  const sessions = await ctx.store.listSessions()
  const today = new Date().toISOString().slice(0, 10)
  const todaySessions = sessions.filter((s) => s.updatedAt?.startsWith(today))
  const stats = computeStats(todaySessions)

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ date: today, ...stats }))
}
