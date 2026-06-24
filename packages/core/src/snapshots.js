/**
 * Auto-snapshot active sessions to disk for crash recovery.
 */

import fs from 'node:fs'
import path from 'node:path'
import { writeSessionExport } from './export.js'

/**
 * @typedef {Object} SnapshotResult
 * @property {string} sessionId
 * @property {string} filepath
 * @property {string} filename
 */

/**
 * @param {import('./store.js').SessionStore} store
 * @param {string} snapshotsDir
 * @param {object} [options]
 * @returns {Promise<SnapshotResult[]>}
 */
export async function snapshotActiveSessions(store, snapshotsDir, options = {}) {
  const maxAgeMinutes = options.maxAgeMinutes ?? 120
  const now = Date.now()
  const cutoff = now - maxAgeMinutes * 60 * 1000

  const sessions = await store.listSessions()
  const results = []

  for (const session of sessions) {
    const updatedAt = new Date(session.updatedAt).getTime()
    if (Number.isNaN(updatedAt) || updatedAt < cutoff) continue
    if (session.status !== 'active' && session.status !== 'idle') continue

    const detail = await store.getSession(session.id)
    if (!detail) continue
    if (detail.messages.length === 0 && detail.toolEvents.length === 0) continue

    const { filepath, filename } = writeSessionExport(detail, snapshotsDir, {
      prefix: 'snapshot-',
    })
    results.push({ sessionId: session.id, filepath, filename })
  }

  return results
}

/**
 * @param {string} stateDir
 * @param {{ lastRunAt: string, sessionCount: number, files: string[] }} state
 */
export function saveSnapshotState(stateDir, state) {
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 })
  const file = path.join(stateDir, 'snapshots.json')
  fs.writeFileSync(file, JSON.stringify(state, null, 2), { mode: 0o600 })
}

/**
 * @param {string} stateDir
 * @returns {{ lastRunAt?: string, sessionCount?: number, files?: string[] }|null}
 */
export function loadSnapshotState(stateDir) {
  const file = path.join(stateDir, 'snapshots.json')
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}
