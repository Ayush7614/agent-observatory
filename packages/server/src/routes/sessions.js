import path from 'node:path'
import { writeSessionExport, getDataDir } from '@agent-observatory/core'

export async function handleSessions(req, res, ctx, url) {
  const parts = url.pathname.split('/').filter(Boolean)
  // /api/sessions | /api/sessions/:id | /api/sessions/:id/export

  if (req.method === 'GET' && parts.length === 2) {
    const sessions = await ctx.store.listSessions()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ sessions }))
    return
  }

  if (req.method === 'GET' && parts.length === 3 && parts[2] !== 'export') {
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

  if (req.method === 'POST' && parts.length === 4 && parts[3] === 'export') {
    const sessionId = parts[2]
    const detail = await ctx.store.getSession(sessionId)
    if (!detail) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Session not found', code: 'NOT_FOUND' }))
      return
    }

    const exportsDir = path.join(getDataDir(ctx.config), 'exports')
    const { filepath, filename, markdown } = writeSessionExport(detail, exportsDir)

    const download = url.searchParams.get('download') === '1'
    if (download) {
      res.writeHead(200, {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      })
      res.end(markdown)
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        sessionId,
        filename,
        filepath,
        markdown,
        messageCount: detail.messages.length,
        toolCallCount: detail.toolEvents.length,
      })
    )
    return
  }

  res.writeHead(405, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }))
}
