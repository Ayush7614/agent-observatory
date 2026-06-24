/**
 * SQLite session store — Node.js built-in node:sqlite (Node 22+).
 */

import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { initSchema } from './db.js'
import { emptyTokenUsage } from './types.js'

/** @param {Record<string, unknown>|null} row */
function rowToSession(row) {
  if (!row) return null
  return {
    id: String(row.id),
    agentId: String(row.agent_id),
    projectPath: row.project_path ? String(row.project_path) : undefined,
    projectName: row.project_name ? String(row.project_name) : undefined,
    startedAt: String(row.started_at),
    updatedAt: String(row.updated_at),
    model: row.model ? String(row.model) : undefined,
    status: /** @type {import('./types.js').SessionStatus} */ (row.status || 'active'),
    tokenUsage: {
      input: Number(row.input_tokens) || 0,
      output: Number(row.output_tokens) || 0,
      cacheRead: Number(row.cache_read_tokens) || 0,
      cacheWrite: Number(row.cache_write_tokens) || 0,
    },
    contextPercent: Number(row.context_percent) || 0,
    estimatedCostUsd: Number(row.estimated_cost_usd) || 0,
    messageCount: Number(row.message_count) || 0,
    toolCallCount: Number(row.tool_call_count) || 0,
    sourceFile: row.source_file ? String(row.source_file) : undefined,
    sourceMtime: row.source_mtime != null ? Number(row.source_mtime) : undefined,
  }
}

export class SessionStore {
  /** @param {string} dataDir */
  constructor(dataDir) {
    this.dataDir = dataDir
    this.dbPath = path.join(dataDir, 'data.db')
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 })
    /** @type {import('node:sqlite').DatabaseSync|null} */
    this.db = null
    this.ready = false
  }

  async init() {
    this.db = new DatabaseSync(this.dbPath)
    initSchema(this.db)
    this.ready = true
    console.log(`[store] Database ready at ${this.dbPath}`)
  }

  /** @returns {import('node:sqlite').DatabaseSync} */
  #db() {
    if (!this.db) throw new Error('SessionStore not initialized')
    return this.db
  }

  /**
   * Upsert a session record.
   * @param {import('./types.js').Session} session
   */
  async upsertSession(session) {
    const db = this.#db()
    db.prepare(`
      INSERT INTO agents (id, name, last_seen_at) VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET last_seen_at = excluded.last_seen_at
    `).run(session.agentId, session.agentId, session.updatedAt)

    db.prepare(`
      INSERT INTO sessions (
        id, agent_id, project_path, project_name, started_at, updated_at,
        model, status, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens,
        context_percent, estimated_cost_usd, message_count, tool_call_count,
        source_file, source_mtime
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        project_path = excluded.project_path,
        project_name = excluded.project_name,
        updated_at = excluded.updated_at,
        model = excluded.model,
        status = excluded.status,
        input_tokens = excluded.input_tokens,
        output_tokens = excluded.output_tokens,
        cache_read_tokens = excluded.cache_read_tokens,
        cache_write_tokens = excluded.cache_write_tokens,
        context_percent = excluded.context_percent,
        estimated_cost_usd = excluded.estimated_cost_usd,
        message_count = excluded.message_count,
        tool_call_count = excluded.tool_call_count,
        source_file = excluded.source_file,
        source_mtime = excluded.source_mtime
    `).run(
      session.id,
      session.agentId,
      session.projectPath ?? null,
      session.projectName ?? null,
      session.startedAt,
      session.updatedAt,
      session.model ?? null,
      session.status,
      session.tokenUsage?.input ?? 0,
      session.tokenUsage?.output ?? 0,
      session.tokenUsage?.cacheRead ?? 0,
      session.tokenUsage?.cacheWrite ?? 0,
      session.contextPercent ?? 0,
      session.estimatedCostUsd ?? 0,
      session.messageCount ?? 0,
      session.toolCallCount ?? 0,
      session.sourceFile ?? null,
      session.sourceMtime ?? null
    )
  }

  /**
   * Insert a message (ignore duplicates).
   * @param {import('./types.js').Message} message
   */
  async insertMessage(message) {
    const db = this.#db()
    const result = db.prepare(`
      INSERT OR IGNORE INTO messages (id, session_id, role, content, timestamp, input_tokens, output_tokens)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      message.id,
      message.sessionId,
      message.role,
      message.content ?? '',
      message.timestamp,
      message.usage?.input ?? 0,
      message.usage?.output ?? 0
    )

    if (result.changes > 0 && message.content) {
      db.prepare(`
        INSERT INTO sessions_fts (session_id, content) VALUES (?, ?)
      `).run(message.sessionId, message.content)
    }
  }

  /**
   * Insert a tool event (ignore duplicates).
   * @param {import('./types.js').ToolEvent} event
   */
  async insertToolEvent(event) {
    const db = this.#db()
    db.prepare(`
      INSERT OR IGNORE INTO tool_events (
        id, session_id, timestamp, tool, input_summary, output_summary,
        lines_added, lines_removed, duration_ms, exit_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.sessionId,
      event.timestamp,
      event.tool,
      event.inputSummary ?? null,
      event.outputSummary ?? null,
      event.linesAdded ?? 0,
      event.linesRemoved ?? 0,
      event.durationMs ?? null,
      event.exitCode ?? null
    )

    db.prepare(`
      UPDATE sessions SET tool_call_count = tool_call_count + 1, updated_at = ?
      WHERE id = ?
    `).run(event.timestamp, event.sessionId)

    const summary = `${event.tool} ${event.inputSummary || ''}`.trim()
    if (summary) {
      db.prepare(`INSERT INTO sessions_fts (session_id, content) VALUES (?, ?)`).run(
        event.sessionId,
        summary
      )
    }
  }

  /**
   * @param {object} [filters]
   * @returns {Promise<import('./types.js').Session[]>}
   */
  async listSessions(filters = {}) {
    const db = this.#db()
    let sql = 'SELECT * FROM sessions WHERE 1=1'
    const params = []

    if (filters.agentId) {
      sql += ' AND agent_id = ?'
      params.push(filters.agentId)
    }
    if (filters.status) {
      sql += ' AND status = ?'
      params.push(filters.status)
    }

    sql += ' ORDER BY updated_at DESC'

    if (filters.limit) {
      sql += ' LIMIT ?'
      params.push(filters.limit)
    }

    return db.prepare(sql).all(...params).map(rowToSession).filter(Boolean)
  }

  /**
   * @param {string} id
   * @returns {Promise<import('./types.js').SessionDetail|null>}
   */
  async getSession(id) {
    const db = this.#db()
    const session = rowToSession(db.prepare('SELECT * FROM sessions WHERE id = ?').get(id))
    if (!session) return null

    const messages = db.prepare(
      'SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC'
    ).all(id).map((row) => ({
      id: String(row.id),
      sessionId: String(row.session_id),
      role: /** @type {'user'|'assistant'|'system'} */ (row.role),
      content: row.content ? String(row.content) : '',
      timestamp: String(row.timestamp),
      usage: {
        input: Number(row.input_tokens) || 0,
        output: Number(row.output_tokens) || 0,
        cacheRead: 0,
        cacheWrite: 0,
      },
    }))

    const toolEvents = db.prepare(
      'SELECT * FROM tool_events WHERE session_id = ? ORDER BY timestamp ASC'
    ).all(id).map((row) => ({
      id: String(row.id),
      sessionId: String(row.session_id),
      timestamp: String(row.timestamp),
      tool: String(row.tool),
      inputSummary: row.input_summary ? String(row.input_summary) : undefined,
      outputSummary: row.output_summary ? String(row.output_summary) : undefined,
      linesAdded: Number(row.lines_added) || 0,
      linesRemoved: Number(row.lines_removed) || 0,
      durationMs: row.duration_ms != null ? Number(row.duration_ms) : undefined,
      exitCode: row.exit_code != null ? Number(row.exit_code) : undefined,
    }))

    return { session, messages, toolEvents }
  }

  async close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.ready = false
  }
}
