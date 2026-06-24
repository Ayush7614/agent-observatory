# Architecture

> System design for Agent Observatory — local-first, adapter-based, zero-telemetry.

---

## Design goals

1. **Never block the agent** — if Observatory is down, agents work normally
2. **Local-first** — all data on disk under `~/.agent-observatory/`
3. **Adapter isolation** — each agent's quirks stay in its adapter package
4. **Zero core dependencies** — Node.js stdlib only in `core` and `server`
5. **Realtime by default** — SSE for live updates, no polling

---

## System diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER'S MACHINE                                 │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ Claude Code │  │    Aider    │  │  Codex CLI  │  ... more agents    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                      │
│         │ hooks/logs     │                │                              │
│         ▼                ▼                ▼                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     ADAPTER LAYER                                  │   │
│  │  claude-code │ aider │ codex │ cline │ generic                    │   │
│  │  Each adapter: watch files · parse events · normalize to Core     │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │ normalized events                        │
│                             ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     CORE (@agent-observatory/core)                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │ Session  │ │  Event   │ │  Search  │ │ Analytics│            │   │
│  │  │  Store   │ │   Bus    │ │  Index   │ │  Engine  │            │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │   │
│  │       └────────────┴────────────┴────────────┘                   │   │
│  │                         SQLite (~/.agent-observatory/data.db)    │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │                                          │
│                             ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     SERVER (@agent-observatory/server)             │   │
│  │  HTTP :7420  ·  REST API  ·  SSE /api/live  ·  Hook receivers   │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │ SSE / REST                               │
│                             ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                  DASHBOARD (@agent-observatory/dashboard)          │   │
│  │  React + Vite + Tailwind  ·  Mission Control  ·  Sessions  ·  ⚙  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Optional: ntfy.sh ──phone──▶  Approval buttons                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Package responsibilities

### `@agent-observatory/core`

The brain. Agent-agnostic logic.

| Module | Responsibility |
|--------|----------------|
| `types.js` | Universal Session, Message, ToolEvent, AgentAdapter interfaces |
| `store.js` | SQLite CRUD — sessions, messages, events |
| `search.js` | FTS5 full-text search index |
| `analytics.js` | Aggregations — cost, tokens, burn rate |
| `events.js` | In-process event bus (pub/sub) |
| `config.js` | Load/merge `~/.agent-observatory/config.json` |
| `cost.js` | Model price table + cost estimation |

### `@agent-observatory/server`

The HTTP layer.

| Module | Responsibility |
|--------|----------------|
| `index.js` | Bootstrap — load config, start adapters, listen |
| `routes/api.js` | REST endpoints |
| `routes/sse.js` | `/api/live` Server-Sent Events |
| `routes/hooks.js` | POST receivers for agent hooks |
| `watcher.js` | Orchestrate adapter file watchers |
| `notify.js` | Desktop + ntfy notifications |

### `@agent-observatory/dashboard`

The UI. Consumes REST + SSE only — no direct agent access.

### `@agent-observatory/adapter-*`

One package per agent. Implements the `AgentAdapter` interface.

---

## Adapter interface

Every adapter must implement:

```javascript
/**
 * @typedef {Object} AgentAdapter
 * @property {string} id           - e.g. "claude-code"
 * @property {string} name         - e.g. "Claude Code"
 * @property {string} version      - adapter semver
 *
 * @property {() => Promise<void>} start
 *   Begin watching agent data sources (file watchers, hooks).
 *
 * @property {() => Promise<void>} stop
 *   Clean shutdown.
 *
 * @property {() => Promise<Session[]>} listSessions
 *   Return all known sessions (from index + disk scan).
 *
 * @property {(id: string) => Promise<SessionDetail>} getSession
 *   Full session with messages and tool events.
 *
 * @property {(sessionId: string) => AsyncGenerator<ToolEvent>} watchLive
 *   Yield new tool events for active session (optional).
 *
 * @property {() => Promise<HookManifest>} getHookManifest
 *   Hook definitions to merge into agent settings.
 *
 * @property {(raw: unknown) => ToolEvent|null} parseHookPayload
 *   Parse incoming hook POST body into normalized ToolEvent.
 */
```

Adapters **never** write to the database directly — they emit events on the core event bus.

---

## Data flow: session ingestion

```
1. Claude Code writes message to ~/.claude/projects/<hash>/<uuid>.jsonl
2. claude-code adapter's fs.watch detects mtime change
3. Adapter parses new lines (incremental — tracks byte offset per file)
4. Adapter emits: session:updated, message:added, tool:executed
5. Core store upserts Session + Message + ToolEvent rows
6. Core search index updates FTS5
7. Core event bus broadcasts to SSE clients
8. Dashboard live feed updates
```

---

## Data flow: hook event

```
1. Claude Code fires PostToolUse hook
2. hooks/post-tool-use.js POSTs to http://127.0.0.1:7420/api/hooks/tool-use
3. Server routes to claude-code adapter parseHookPayload()
4. Normalized ToolEvent emitted
5. Same path as step 5–8 above
```

---

## Storage layout

```
~/.agent-observatory/
├── config.json              # User configuration
├── data.db                  # SQLite (sessions, messages, events, FTS)
├── data.db-wal              # WAL mode for concurrent reads
├── snapshots/               # Auto-snapshot markdown files
│   └── <session-id>.md
├── exports/                 # Manual exports
│   └── <session-id>.md
├── state/                   # Runtime state
│   ├── server.pid
│   ├── hook-state.json      # Last tool call heartbeat
│   └── file-offsets.json    # Incremental parse offsets
└── logs/
    └── server.log
```

---

## SQLite schema (v1)

```sql
-- Agents registry
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  last_seen_at TEXT
);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
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
  source_file TEXT,           -- path to agent's raw session file
  source_mtime REAL           -- for cache invalidation
);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  role TEXT NOT NULL,
  content TEXT,
  timestamp TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0
);

-- Tool events
CREATE TABLE tool_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  timestamp TEXT NOT NULL,
  tool TEXT NOT NULL,
  input_summary TEXT,
  output_summary TEXT,
  lines_added INTEGER DEFAULT 0,
  lines_removed INTEGER DEFAULT 0,
  duration_ms INTEGER,
  exit_code INTEGER
);

-- Full-text search (FTS5 virtual table)
CREATE VIRTUAL TABLE sessions_fts USING fts5(
  session_id UNINDEXED,
  content,
  tokenize = 'porter unicode61'
);

-- Budget tracking
CREATE TABLE budget_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  window TEXT NOT NULL,       -- 'session', 'day', 'week'
  amount_usd REAL NOT NULL,
  threshold REAL NOT NULL,
  event_type TEXT NOT NULL    -- 'warning', 'exceeded'
);

CREATE INDEX idx_sessions_agent ON sessions(agent_id);
CREATE INDEX idx_sessions_updated ON sessions(updated_at DESC);
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_tool_events_session ON tool_events(session_id);
CREATE INDEX idx_tool_events_timestamp ON tool_events(timestamp DESC);
```

---

## API design

### REST conventions

- Base URL: `http://127.0.0.1:7420/api`
- JSON request/response
- Errors: `{ "error": "message", "code": "NOT_FOUND" }`

### SSE event types

```javascript
// Client: const es = new EventSource('/api/live')

{ "type": "tool:executed",  "data": { /* ToolEvent */ } }
{ "type": "session:updated", "data": { /* Session */ } }
{ "type": "agent:state",   "data": { "agentId": "claude-code", "state": "running" } }
{ "type": "budget:warning",  "data": { "window": "day", "percent": 82 } }
{ "type": "approval:requested", "data": { /* ApprovalRequest */ } }
```

---

## Security model

See [SECURITY.md](./SECURITY.md) for full details.

Summary:
- Binds to `127.0.0.1` by default
- `bindLan: true` exposes to local network (user opt-in)
- Hook endpoints accept localhost only
- No authentication on localhost (single-user tool)
- Optional device token for LAN access (v0.2)

---

## Performance considerations

| Concern | Strategy |
|---------|----------|
| 10,000+ sessions | Lazy indexing; index on first access; mtime cache |
| Large JSONL files | Incremental parse with byte offset tracking |
| SSE with many clients | Single event bus fan-out |
| Search latency | FTS5 with porter stemmer; limit 50 results |
| SQLite writes | WAL mode; batch inserts in transactions |

---

## Failure modes

| Failure | Behavior |
|---------|----------|
| Observatory down | Agents unaffected; hooks no-op gracefully |
| Adapter parse error | Log warning; skip bad line; continue |
| Database locked | Retry with backoff |
| Hook timeout | Agent falls back to normal terminal prompt |
| Disk full | Stop snapshots; alert user in dashboard |

---

## Future: plugin marketplace (v1.0)

```
packages/adapters/          ← official adapters (monorepo)
community-adapters/         ← separate repo or npm scope
  @ao-community/cursor
  @ao-community/copilot
```

Adapter manifest (`adapter.json`):

```json
{
  "id": "claude-code",
  "name": "Claude Code",
  "version": "1.0.0",
  "entry": "./dist/index.js",
  "capabilities": ["live", "hooks", "recovery", "tokens"],
  "configSchema": "./config-schema.json"
}
```
