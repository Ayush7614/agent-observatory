# Development Guide

> Local setup, conventions, and workflow for Agent Observatory contributors.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **Git**
- **Claude Code** (for testing the Claude Code adapter)

---

## Getting started

```bash
# Clone
git clone git@github.com:Ayush7614/agent-observatory.git
cd agent-observatory

# Install all workspace packages
npm install

# Copy example config
cp config.example.json ~/.agent-observatory/config.json

# Start development server (API + file watcher)
npm run dev

# In another terminal: start dashboard dev server
npm run dev:dashboard

# Open dashboard
open http://127.0.0.1:7420
```

---

## Monorepo structure

```
packages/
├── core/                    # @agent-observatory/core
│   └── src/
│       ├── index.js         # Public exports
│       ├── types.js         # Type definitions (JSDoc)
│       ├── store.js         # SQLite persistence
│       ├── search.js        # FTS5 search
│       ├── events.js        # Event bus
│       ├── config.js        # Config loader
│       ├── analytics.js     # Aggregations
│       └── cost.js          # Cost estimation
├── server/                  # @agent-observatory/server
│   └── src/
│       ├── index.js         # Entry point
│       ├── routes/          # HTTP routes
│       └── watcher.js       # Adapter orchestration
├── dashboard/               # @agent-observatory/dashboard
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       ├── components/
│       └── hooks/
└── adapters/
    ├── claude-code/         # @agent-observatory/adapter-claude-code
    ├── aider/               # @agent-observatory/adapter-aider
    └── generic/             # @agent-observatory/adapter-generic
```

---

## Coding conventions

### Language

- **JavaScript** (ES modules) for core, server, adapters — no TypeScript in v0.1
- **JSX** for dashboard
- **JSDoc** for type documentation in core

### Style

- No semicolons (match existing files)
- 2-space indent
- Single quotes
- Named exports preferred over default exports
- Async/await over raw promises

### File naming

- `kebab-case.js` for modules
- `PascalCase.jsx` for React components
- `*.test.js` for tests (Node.js built-in test runner)

### Error handling

- Adapters: log and continue — never crash the server
- API routes: return `{ error, code }` JSON with appropriate HTTP status
- Hooks: always exit 0 — never block the agent

---

## Testing

```bash
# Run all tests
npm test

# Run specific adapter tests
node --test packages/adapters/claude-code/test/*.test.js

# Manual integration test
npm run dev
# In another terminal, run Claude Code and verify dashboard updates
```

### Test data

Fixtures live in `packages/adapters/*/test/fixtures/` — sample JSONL files, never real session data.

---

## Git workflow

### Branch naming

```
feature/claude-code-parser
fix/sse-reconnect
docs/adapter-guide
```

### Commit messages

```
feat(core): add SQLite session store
fix(adapter): handle malformed JSONL lines
docs: update MVP checklist
chore: bump version to 0.1.0
```

Prefixes: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`

### PR process (post-public)

1. Fork → branch → PR
2. One adapter per PR when possible
3. Include test fixtures for parser changes

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AO_PORT` | Server port | `7420` |
| `AO_HOST` | Bind host | `127.0.0.1` |
| `AO_DATA_DIR` | Data directory | `~/.agent-observatory` |
| `AO_LOG_LEVEL` | `debug` / `info` / `warn` / `error` | `info` |
| `AO_CONFIG` | Config file path | `~/.agent-observatory/config.json` |

---

## Debugging

```bash
# Verbose logging
AO_LOG_LEVEL=debug npm run dev

# Inspect SQLite
sqlite3 ~/.agent-observatory/data.db ".tables"
sqlite3 ~/.agent-observatory/data.db "SELECT id, agent_id, model, updated_at FROM sessions ORDER BY updated_at DESC LIMIT 10;"

# Test hook manually
curl -X POST http://127.0.0.1:7420/api/hooks/tool-use \
  -H "Content-Type: application/json" \
  -d @packages/adapters/claude-code/test/fixtures/hook-payload.json

# Watch SSE stream
curl -N http://127.0.0.1:7420/api/live
```

---

## Dashboard development

The dashboard uses Vite with a proxy to the API server:

```javascript
// packages/dashboard/vite.config.js
export default {
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:7420'
    }
  }
}
```

During development:
- Terminal 1: `npm run dev` (API on :7420)
- Terminal 2: `npm run dev:dashboard` (Vite on :5173)

---

## Release process

1. Update version in root `package.json` and all workspace packages
2. Complete checklist in [MVP.md](./MVP.md) or [ROADMAP.md](./ROADMAP.md)
3. `npm test` passes
4. Tag: `git tag v0.1.0`
5. GitHub Release with changelog
6. For v0.1: switch repo to public

---

## Useful commands

```bash
agent-observatory start          # Production start
agent-observatory status         # Check if running
agent-observatory install-hooks  # Wire Claude Code hooks
agent-observatory recover        # Export last session
npm run lint                     # Syntax check
```
