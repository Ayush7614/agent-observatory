/**
 * Claude Code adapter — watches JSONL session files and ingests into core store.
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  EVENT_TYPES,
  emptyTokenUsage,
  estimateCost,
  resolvePath,
} from '@agent-observatory/core'
import {
  parseJsonlLine,
  extractToolEvent,
  extractMessage,
  extractTokenUsage,
  extractModel,
  extractCwd,
  aggregateTokenUsage,
} from './parser.js'
import { loadOffsets, saveOffsets } from './offsets.js'

export const id = 'claude-code'
export const name = 'Claude Code'
export const version = '0.0.1'

/** @type {fs.FSWatcher[]} */
let watchers = []
/** @type {import('@agent-observatory/core').EventBus|null} */
let eventBus = null
/** @type {import('@agent-observatory/core').SessionStore|null} */
let store = null
/** @type {Map<string, number>} */
let fileOffsets = new Map()
/** @type {string} */
let stateDir = ''
/** @type {ReturnType<typeof setInterval>|null} */
let pollTimer = null

/**
 * @param {object} config
 * @param {import('@agent-observatory/core').EventBus} bus
 * @param {import('@agent-observatory/core').SessionStore} sessionStore
 */
export async function start(config, bus, sessionStore) {
  eventBus = bus
  store = sessionStore

  const dataDir = resolvePath(config?.dataDir || '~/.agent-observatory')
  stateDir = path.join(dataDir, 'state')
  fileOffsets = loadOffsets(stateDir)

  const watchDir = resolvePath(config?.watchDir || '~/.claude/projects')

  if (!fs.existsSync(watchDir)) {
    console.warn(`[claude-code] Watch directory not found: ${watchDir}`)
    fs.mkdirSync(watchDir, { recursive: true })
  }

  await scanDirectory(watchDir)
  watchRecursive(watchDir)

  // Fallback poll every 10s for platforms without recursive watch
  pollTimer = setInterval(() => scanDirectory(watchDir).catch(() => {}), 10000)

  console.log(`[claude-code] Watching ${watchDir}`)
}

export async function stop() {
  for (const w of watchers) w.close()
  watchers = []
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
  saveOffsets(stateDir, fileOffsets)
  eventBus = null
  store = null
}

/**
 * @param {string} dir
 */
async function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await scanDirectory(fullPath)
    } else if (entry.name.endsWith('.jsonl')) {
      await processFile(fullPath)
    }
  }
}

/**
 * @param {string} filePath
 */
async function processFile(filePath) {
  if (!store || !eventBus) return

  try {
    const stat = fs.statSync(filePath)
    const offset = fileOffsets.get(filePath) || 0
    if (stat.size <= offset) return

    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(stat.size - offset)
    fs.readSync(fd, buffer, 0, buffer.length, offset)
    fs.closeSync(fd)

    const sessionId = path.basename(filePath, '.jsonl')
    const lines = buffer.toString('utf8').split('\n').filter(Boolean)

    // Ensure session row exists before messages/tool_events (FK constraint)
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
      messageCount: 0,
      toolCallCount: 0,
      sourceFile: filePath,
      sourceMtime: stat.mtimeMs,
    })

    let model = 'unknown'
    let cwd = null
    let messageCount = 0
    let toolCallCount = 0
    const tokenUsages = []

    for (const line of lines) {
      const parsed = parseJsonlLine(line)
      if (!parsed) continue

      if (parsed.sessionId && parsed.sessionId !== sessionId) continue

      const lineModel = extractModel(parsed)
      if (lineModel) model = lineModel

      const lineCwd = extractCwd(parsed)
      if (lineCwd) cwd = lineCwd

      const usage = extractTokenUsage(parsed)
      if (usage) tokenUsages.push(usage)

      const message = extractMessage(parsed, sessionId)
      if (message) {
        await store.insertMessage(message)
        messageCount++
        eventBus.emit(EVENT_TYPES.MESSAGE_ADDED, message)
      }

      const toolEvent = extractToolEvent(parsed, sessionId)
      if (toolEvent) {
        await store.insertToolEvent(toolEvent)
        toolCallCount++
        eventBus.emit(EVENT_TYPES.TOOL_EXECUTED, toolEvent)
      }
    }

    fileOffsets.set(filePath, stat.size)
    saveOffsets(stateDir, fileOffsets)

    const tokenUsage =
      tokenUsages.length > 0 ? aggregateTokenUsage(tokenUsages) : emptyTokenUsage()

    const session = {
      id: sessionId,
      agentId: id,
      projectPath: cwd || path.dirname(filePath),
      projectName: cwd ? path.basename(cwd) : path.basename(path.dirname(filePath)),
      startedAt: new Date(stat.birthtime).toISOString(),
      updatedAt: new Date(stat.mtime).toISOString(),
      model,
      status: /** @type {'active'} */ ('active'),
      tokenUsage,
      contextPercent: 0,
      estimatedCostUsd: estimateCost(tokenUsage, model),
      messageCount,
      toolCallCount,
      sourceFile: filePath,
      sourceMtime: stat.mtimeMs,
    }

    await store.upsertSession(session)
    eventBus.emit(EVENT_TYPES.SESSION_UPDATED, session)
  } catch (err) {
    console.warn(`[claude-code] Error processing ${filePath}:`, err.message)
  }
}

/**
 * @param {string} dir
 */
function watchRecursive(dir) {
  if (!fs.existsSync(dir)) return

  try {
    const watcher = fs.watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename || !filename.endsWith('.jsonl')) return
      const fullPath = path.isAbsolute(filename) ? filename : path.join(dir, filename)
      processFile(fullPath).catch(() => {})
    })
    watchers.push(watcher)
  } catch {
    console.warn('[claude-code] Recursive watch unavailable — using poll fallback')
  }
}

export async function listSessions() {
  if (!store) return []
  return store.listSessions({ agentId: id })
}

/** @param {string} sessionId */
export async function getSession(sessionId) {
  if (!store) return null
  return store.getSession(sessionId)
}

import { parseHookPayload, parseNotifyHook } from './hooks.js'

export { parseHookPayload, parseNotifyHook } from './hooks.js'

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
