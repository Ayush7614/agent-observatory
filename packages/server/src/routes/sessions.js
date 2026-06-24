export async function handleSessions(req, res, ctx, url) {
  const parts = url.pathname.split('/').filter(Boolean)
  // /api/sessions or /api/sessions/:id or /api/sessions/:id/export

  if (req.method === 'GET' && parts.length === 2) {
    const sessions = await ctx.store.listSessions()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ sessions }))
    return
  }

  if (req.method === 'GET' && parts.length === 3) {
    const session = await ctx.store.getSession(parts[2])
    if (!session) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Session not found', code: 'NOT_FOUND' }))
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(session))
    return
  }

  res.writeHead(405, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }))
}
