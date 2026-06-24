/**
 * SQLite session store.
 *
 * TODO (Day 1): Implement with node:sqlite (Node 22+) or sqlite3 fallback.
 * Schema defined in docs/ARCHITECTURE.md
 */

import fs from 'node:fs'
import path from 'node:path'

export class SessionStore {
  /** @param {string} dataDir */
  constructor(dataDir) {
    this.dataDir = dataDir
    this.dbPath = path.join(dataDir, 'data.db')
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 })
    // Database initialization will be implemented in Day 1 sprint
    this.ready = false
  }

  /** Initialize database schema. */
  async init() {
    // TODO: CREATE TABLE sessions, messages, tool_events, sessions_fts
    this.ready = true
    console.log(`[store] Database ready at ${this.dbPath}`)
  }

  /**
   * Upsert a session.
   * @param {import('./types.js').Session} session
   */
  async upsertSession(session) {
    // TODO: implement
    void session
  }

  /**
   * List sessions with optional filters.
   * @param {object} [filters]
   * @returns {Promise<import('./types.js').Session[]>}
   */
  async listSessions(filters = {}) {
    void filters
    return []
  }

  /**
   * Get session detail with messages and tool events.
   * @param {string} id
   * @returns {Promise<import('./types.js').SessionDetail|null>}
   */
  async getSession(id) {
    void id
    return null
  }

  /** Close database connection. */
  async close() {
    this.ready = false
  }
}
