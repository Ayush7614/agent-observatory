/**
 * Claude Code adapter for Agent Observatory.
 *
 * Watches ~/.claude/projects/**/*.jsonl and normalizes into universal session model.
 * See docs/ADAPTERS.md for full integration details.
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { EVENT_TYPES, generateId, emptyTokenUsage } from '@agent-observatory/core'
import { parseJsonlLine, extractToolEvent } from './parser.js'

export const id = 'claude-code'
export const name = 'Claude Code'
export const version = '0.0.1'

/** @type {fs.FSWatcher[]} */
let watchers = []
/** @type {import('@agent-observatory/core').EventBus|null} */
let eventBus = null
/** @type {Map<string, number>} */
const fileOffsets = new Map()

/**
 * @param {object} config
 * @param {import('@agent-observatory/core').EventBus} bus
 * @param {import('@agent-observatory/core').SessionStore} store
 */
export async function start(config, bus, store) {
  eventBus = bus
  const watchDir = (config?.watchDir || '~/.claude/projects').replace('~', os.homedir())

  if (!fs.existsSync(watchDir)) {
    console.warn(`[claude-code] Watch directory not found: ${watchDir}`)
    console.warn(`[claude-code] Adapter will activate when Claude Code creates sessions`)
    fs.mkdirSync(watchDir, { recursive: true })
  }

  // Initial scan
  await scanDirectory(watchDir, store)

  // Watch for changes
  watchRecursive(watchDir, store)
  console.log(`[claude-code] Watching ${watchDir}`)
}

export async function stop() {
  for (const w of watchers) w.close()
  watchers = []
  eventBus = null
}

/**
 * @param {string} dir
 * @param {import('@agent-observatory/core').SessionStore} store
 */
async function scanDirectory(dir, store) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await scanDirectory(fullPath, store)
    } else if (entry.name.endsWith('.jsonl')) {
      await processFile(fullPath, store)
    }
  }
}

/**
 * @param {string} filePath
 * @param {import('@agent-observatory/core').SessionStore} store
 */
async function processFile(filePath, store) {
  try {
    const stat = fs.statSync(filePath)
    const offset = fileOffsets.get(filePath) || 0

    if (stat.size <= offset) return

    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(stat.size - offset)
    fs.readSync(fd, buffer, 0, buffer.length, offset)
    fs.closeSync(fd)

    const lines = buffer.toString('utf8').split('\n').filter(Boolean)
    const sessionId = path.basename(filePath, '.jsonl')

    for (const line of lines) {
      const parsed = parseJsonlLine(line)
      if (!parsed) continue

      const toolEvent = extractToolEvent(parsed, sessionId)
      if (toolEvent && eventBus) {
        eventBus.emit(EVENT_TYPES.TOOL_EXECUTED, toolEvent)
      }
    }

    fileOffsets.set(filePath, stat.size)

    // Upsert session metadata
    await store.upsertSession({
      id: sessionId,
      agentId: id,
      projectPath: path.dirname(filePath),
      projectName: path.basename(path.dirname(filePath)),
      startedAt: new Date(stat.birthtime).toISOString(),
      updatedAt: new Date(stat.mtime).toISOString(),
      model: 'unknown',
      status: 'active',
      tokenUsage: emptyTokenUsage(),
      contextPercent: 0,
      estimatedCostUsd: 0,
      messageCount: lines.length,
      toolCallCount: 0,
      sourceFile: filePath,
      sourceMtime: stat.mtimeMs,
    })
  } catch (err) {
    console.warn(`[claude-code] Error processing ${filePath}:`, err.message)
  }
}

/**
 * @param {string} dir
 * @param {import('@agent-observatory/core').SessionStore} store
 */
function watchRecursive(dir, store) {
  if (!fs.existsSync(dir)) return

  try {
    const watcher = fs.watch(dir, { recursive: true }, (_event, filename) => {
      if (filename && filename.endsWith('.jsonl')) {
        processFile(path.join(dir, filename), store).catch(() => {})
      }
    })
    watchers.push(watcher)
  } catch {
    // recursive watch not supported on all platforms — fall back to polling in v0.1
    console.warn('[claude-code] Recursive watch unavailable, will poll in next sprint')
  }
}

export async function listSessions() {
  return []
}

/** @param {string} sessionId */
export async function getSession(sessionId) {
  void sessionId
  return null
}

export function getHookManifest() {
  const repoRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../../../../'
  )
  return {
    hooks: [
      { event: 'Notification', script: path.join(repoRoot, 'hooks/claude-code/notify.js') },
      { event: 'PostToolUse', script: path.join(repoRoot, 'hooks/claude-code/post-tool-use.js') },
      { event: 'PreToolUse', script: path.join(repoRoot, 'hooks/claude-code/pre-tool-use.js') },
    ],
  }
}

/**
 * @param {string} hookType
 * @param {unknown} payload
 */
export function parseHookPayload(hookType, payload) {
  if (hookType !== 'tool-use' && hookType !== 'post-tool-use') return null

  const data = /** @type {Record<string, unknown>} */ (payload)
  return {
    id: generateId(),
    sessionId: String(data.session_id || data.sessionId || 'unknown'),
    timestamp: new Date().toISOString(),
    tool: String(data.tool_name || data.tool || 'unknown'),
    inputSummary: JSON.stringify(data.tool_input || data.input || '').slice(0, 200),
  }
}
