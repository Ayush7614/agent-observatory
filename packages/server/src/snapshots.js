import path from 'node:path'
import {
  getDataDir,
  snapshotActiveSessions,
  saveSnapshotState,
  loadSnapshotState,
} from '@agent-observatory/core'

/**
 * @param {import('@agent-observatory/core').SessionStore} store
 * @param {object} config
 * @param {(level: string, ...args: unknown[]) => void} log
 * @returns {() => void}
 */
export function startSnapshotScheduler(store, config, log = () => {}) {
  const minutes = config.agents?.['claude-code']?.snapshotMinutes ?? 5
  if (!minutes || minutes <= 0) {
    log('info', 'Auto-snapshots disabled (snapshotMinutes = 0)')
    return () => {}
  }

  const dataDir = getDataDir(config)
  const snapshotsDir = path.join(dataDir, 'snapshots')
  const stateDir = path.join(dataDir, 'state')

  const tick = async () => {
    try {
      const results = await snapshotActiveSessions(store, snapshotsDir)
      saveSnapshotState(stateDir, {
        lastRunAt: new Date().toISOString(),
        sessionCount: results.length,
        files: results.map((r) => r.filename),
      })
      if (results.length > 0) {
        log('info', `Snapshotted ${results.length} session(s) → ${snapshotsDir}`)
      }
    } catch (err) {
      log('warn', 'Snapshot failed:', err.message)
    }
  }

  // First snapshot shortly after startup
  const startup = setTimeout(tick, 15000)
  const interval = setInterval(tick, minutes * 60 * 1000)

  log('info', `Auto-snapshots every ${minutes} min → ${snapshotsDir}`)

  return () => {
    clearTimeout(startup)
    clearInterval(interval)
  }
}

/**
 * @param {object} config
 * @returns {{ enabled: boolean, intervalMinutes: number, lastRunAt?: string, sessionCount?: number }}
 */
export function getSnapshotStatus(config) {
  const minutes = config.agents?.['claude-code']?.snapshotMinutes ?? 5
  const dataDir = getDataDir(config)
  const state = loadSnapshotState(path.join(dataDir, 'state'))

  return {
    enabled: minutes > 0,
    intervalMinutes: minutes,
    lastRunAt: state?.lastRunAt,
    sessionCount: state?.sessionCount,
  }
}
