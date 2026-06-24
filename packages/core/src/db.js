/**
 * SQLite schema initialization for Agent Observatory.
 * Uses Node.js built-in node:sqlite (Node 22+).
 */

export const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  last_seen_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  project_path TEXT,
  project_name TEXT,
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  model TEXT,
  status TEXT DEFAULT 'active',
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cache_read_tokens INTEGER DEFAULT 0,
  cache_write_tokens INTEGER DEFAULT 0,
  context_percent REAL DEFAULT 0,
  estimated_cost_usd REAL DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  tool_call_count INTEGER DEFAULT 0,
  source_file TEXT,
  source_mtime REAL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT,
  timestamp TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tool_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  tool TEXT NOT NULL,
  input_summary TEXT,
  output_summary TEXT,
  lines_added INTEGER DEFAULT 0,
  lines_removed INTEGER DEFAULT 0,
  duration_ms INTEGER,
  exit_code INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE IF NOT EXISTS sessions_fts USING fts5(
  session_id UNINDEXED,
  content,
  tokenize = 'porter unicode61'
);

CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_events_session ON tool_events(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_events_timestamp ON tool_events(timestamp DESC);
`

/**
 * @param {import('node:sqlite').DatabaseSync} db
 */
export function initSchema(db) {
  db.exec(SCHEMA)
}
