import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DASHBOARD_DIST = path.resolve(__dirname, '../../dashboard/dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
}

export function dashboardBuilt() {
  return fs.existsSync(path.join(DASHBOARD_DIST, 'index.html'))
}

/**
 * Serve built dashboard from packages/dashboard/dist
 * @returns {boolean} true if handled
 */
export function serveDashboard(req, res, pathname) {
  if (!dashboardBuilt()) return false

  let filePath = pathname === '/' ? '/index.html' : pathname
  const resolved = path.normalize(path.join(DASHBOARD_DIST, filePath))

  // Prevent path traversal
  if (!resolved.startsWith(DASHBOARD_DIST)) {
    res.writeHead(403)
    res.end('Forbidden')
    return true
  }

  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    const ext = path.extname(resolved)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    fs.createReadStream(resolved).pipe(res)
    return true
  }

  // SPA fallback
  if (!pathname.startsWith('/api')) {
    const index = path.join(DASHBOARD_DIST, 'index.html')
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    fs.createReadStream(index).pipe(res)
    return true
  }

  return false
}

export { DASHBOARD_DIST }
