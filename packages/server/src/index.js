#!/usr/bin/env node
/**
 * @agent-observatory/server
 *
 * Local HTTP server for Agent Observatory.
 * Binds to 127.0.0.1 by default — see docs/SECURITY.md
 */

import http from 'node:http'
import {
  loadConfig,
  getDataDir,
  EventBus,
  SessionStore,
  SearchIndex,
} from '@agent-observatory/core'
import { createRouter } from './routes/index.js'
import { AdapterManager } from './adapters.js'
import { wirePersistence } from './persistence.js'

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }
const logLevel = LOG_LEVELS[process.env.AO_LOG_LEVEL || 'info'] ?? 1

function log(level, ...args) {
  if (LOG_LEVELS[level] >= logLevel) {
    console[level === 'debug' ? 'log' : level](`[server]`, ...args)
  }
}

export async function startServer(options = {}) {
  const config = loadConfig(options.configPath)
  const dataDir = getDataDir(config)
  const eventBus = new EventBus()
  const store = new SessionStore(dataDir)
  await store.init()

  const search = new SearchIndex(store)
  wirePersistence(eventBus, store)
  const adapters = new AdapterManager(config, eventBus, store)

  const host = config.bindLan ? '0.0.0.0' : config.host || '127.0.0.1'
  const port = config.port || 7420

  const router = createRouter({ config, store, search, eventBus, adapters })

  const server = http.createServer((req, res) => {
    // Localhost-only guard for hook endpoints
    if (req.url?.startsWith('/api/hooks/')) {
      const remote = req.socket.remoteAddress
      const isLocal = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1'
      if (!isLocal && !config.bindLan) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Hook endpoints are localhost-only', code: 'FORBIDDEN' }))
        return
      }
    }

    router(req, res).catch((err) => {
      log('error', err.message)
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error', code: 'INTERNAL' }))
      }
    })
  })

  await adapters.startAll()

  await new Promise((resolve, reject) => {
    server.listen(port, host, () => {
      log('info', `Agent Observatory running at http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}`)
      resolve()
    })
    server.on('error', reject)
  })

  return { server, config, store, eventBus, adapters }
}

// Run directly: node packages/server/src/index.js
import { pathToFileURL } from 'node:url'
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  startServer().catch((err) => {
    console.error('[server] Failed to start:', err.message)
    process.exit(1)
  })
}
