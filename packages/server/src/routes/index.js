import { handleHealth } from './health.js'
import { handleSessions } from './sessions.js'
import { handleSearch } from './search.js'
import { handleLive } from './sse.js'
import { handleHooks } from './hooks.js'
import { handleStats } from './stats.js'

/**
 * Simple HTTP router.
 * @param {object} ctx
 */
export function createRouter(ctx) {
  return async function router(req, res) {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    const { pathname } = url
    const method = req.method || 'GET'

    // CORS for dashboard dev server
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    // API routes
    if (pathname === '/api/health') return handleHealth(req, res, ctx)
    if (pathname === '/api/live') return handleLive(req, res, ctx)
    if (pathname === '/api/search') return handleSearch(req, res, ctx, url)
    if (pathname === '/api/stats/today') return handleStats(req, res, ctx)
    if (pathname.startsWith('/api/sessions')) return handleSessions(req, res, ctx, url)
    if (pathname.startsWith('/api/hooks/')) return handleHooks(req, res, ctx, url)

    // Dashboard static files (production — served by dashboard build)
    if (pathname === '/' || pathname.startsWith('/assets/')) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(getPlaceholderHtml(ctx.config.port))
      return
    }

    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found', code: 'NOT_FOUND' }))
  }
}

function getPlaceholderHtml(port) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agent Observatory</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f;
      color: #e4e4e7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      text-align: center;
      padding: 3rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      backdrop-filter: blur(20px);
      max-width: 480px;
    }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .gradient {
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: #a1a1aa; margin: 1rem 0; line-height: 1.6; }
    .status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border-radius: 999px;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
    code { background: rgba(255,255,255,0.06); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1><span class="gradient">Agent Observatory</span></h1>
    <p>Server is running. Dashboard UI coming in Day 4 sprint.</p>
    <p>API available at <code>/api/*</code></p>
    <div class="status">● Online — port ${port}</div>
  </div>
</body>
</html>`
}
