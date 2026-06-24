/**
 * Full-text search index (SQLite FTS5).
 */

export class SearchIndex {
  /** @param {import('./store.js').SessionStore} store */
  constructor(store) {
    this.store = store
  }

  /** @returns {import('node:sqlite').DatabaseSync} */
  #db() {
    if (!this.store.db) throw new Error('SessionStore not initialized')
    return this.store.db
  }

  /**
   * @param {string} query
   * @param {object} [options]
   * @returns {Promise<Array<{sessionId: string, snippet: string, score: number, projectName?: string, updatedAt?: string}>>}
   */
  async search(query, options = {}) {
    const limit = options.limit || 50
    const trimmed = query.trim()
    if (!trimmed) return []

    const db = this.#db()
    // Escape FTS special chars loosely — wrap terms for prefix match
    const ftsQuery = trimmed
      .split(/\s+/)
      .map((term) => term.replace(/[^\w-]/g, ''))
      .filter(Boolean)
      .map((term) => `"${term}"*`)
      .join(' ')

    if (!ftsQuery) return []

    try {
      const rows = db.prepare(`
        SELECT session_id, content
        FROM sessions_fts
        WHERE sessions_fts MATCH ?
        LIMIT ?
      `).all(ftsQuery, limit * 5)

      const seen = new Set()
      const results = []

      for (const row of rows) {
        const sessionId = String(row.session_id)
        if (seen.has(sessionId)) continue
        seen.add(sessionId)

        const session = db.prepare(
          'SELECT project_name, updated_at FROM sessions WHERE id = ?'
        ).get(sessionId)

        const content = String(row.content || '')
        const idx = content.toLowerCase().indexOf(trimmed.toLowerCase().split(/\s+/)[0])
        const snippet =
          idx >= 0
            ? `...${content.slice(Math.max(0, idx - 20), idx + 60)}...`
            : content.slice(0, 80)

        results.push({
          sessionId,
          snippet,
          score: 0,
          projectName: session?.project_name ? String(session.project_name) : undefined,
          updatedAt: session?.updated_at ? String(session.updated_at) : undefined,
        })

        if (results.length >= limit) break
      }

      return results
    } catch (err) {
      console.warn('[search] Query failed:', err.message)
      return []
    }
  }
}
