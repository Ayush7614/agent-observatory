/**
 * Full-text search index (SQLite FTS5).
 * TODO (Day 1-2): Implement alongside SessionStore.
 */

export class SearchIndex {
  /** @param {import('./store.js').SessionStore} store */
  constructor(store) {
    this.store = store
  }

  /**
   * Index session content for search.
   * @param {string} sessionId
   * @param {string} content
   */
  async index(sessionId, content) {
    void sessionId
    void content
  }

  /**
   * Search across all indexed sessions.
   * @param {string} query
   * @param {object} [options]
   * @returns {Promise<Array<{sessionId: string, snippet: string, score: number}>>}
   */
  async search(query, options = {}) {
    void query
    void options
    return []
  }
}
