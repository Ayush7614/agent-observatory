# MVP Specification — Week 1

> **Goal:** Ship a usable, beautiful local dashboard for Claude Code with live monitoring, session search, and recovery. Go public at end of week 1.

**Target version:** `v0.1.0`  
**Target date:** ~7 days from repo creation  
**Primary adapter:** Claude Code

---

## MVP scope

### In scope ✅

| # | Feature | Priority | Acceptance criteria |
|---|---------|----------|---------------------|
| 1 | Local web dashboard | P0 | Opens at `http://127.0.0.1:7420`, dark theme, responsive |
| 2 | Claude Code adapter | P0 | Reads `~/.claude/projects/**/*.jsonl`, parses sessions |
| 3 | Live activity feed | P0 | SSE stream of tool calls (Read, Edit, Bash, etc.) |
| 4 | Token & context display | P0 | Input/output/cache tokens + context % for active session |
| 5 | Session list | P0 | All sessions sorted by date, with agent/model/project |
| 6 | Full-text search | P0 | Search box finds text across all indexed sessions |
| 7 | Session recovery | P0 | Export session to Markdown; `ao recover` CLI command |
| 8 | Auto-snapshots | P1 | Snapshot active sessions every 5 min to `~/.agent-observatory/snapshots/` |
| 9 | Cost estimate | P1 | API-equivalent cost per session (configurable model prices) |
| 10 | CLI commands | P0 | `start`, `stop`, `status`, `recover`, `install-hooks` |
| 11 | Hook integration | P0 | Notification + PostToolUse hooks for Claude Code |
| 12 | Desktop notifications | P1 | Banner when Claude needs attention |
| 13 | Budget alerts | P2 | Warn at 80%/100% of configured daily budget |

### Out of scope ❌ (post-MVP)

- Multi-agent (Aider, Codex, Cline)
- Phone push (ntfy/Telegram)
- Remote tool approvals
- Semantic search
- Team sync / cloud
- Cursor/Copilot adapters
- Ambient mascot mode
- Plugin marketplace

---

## MVP screens

### 1. Home / Mission Control

```
┌──────────────────────────────────────────────────────────────┐
│  Agent Observatory                              ⚙ Settings  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Active Session ──────────────────────────────────────┐  │
│  │  Claude Code · Opus 4.6 · my-app                      │  │
│  │  State: Running tool (Edit)                           │  │
│  │  Context ████████░░ 78%    Session cost: $2.41        │  │
│  │  Tokens: 142k in · 8.2k out · 89k cache              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Live Activity ───────────────────────────────────────┐  │
│  │  12:04:02  Read     src/api/routes.ts                 │  │
│  │  12:04:05  Edit     src/api/routes.ts  (+12 -3)       │  │
│  │  12:04:08  Bash     npm test                          │  │
│  │  12:04:15  Read     src/api/routes.test.ts            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Quick Stats ─────────────────────────────────────────┐  │
│  │  Today: $8.42  ·  3 sessions  ·  847 tools  ·  +420 lines│  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 2. Sessions

- Search bar (full-text)
- Filter by date, model, project
- Click → session detail / transcript view
- Actions: Export MD, Recover, Delete from index

### 3. Session Detail / Transcript

- Chronological message list
- Tool calls expandable
- Token usage per turn
- Export buttons

### 4. Settings

- Port, theme, budgets
- Agent enable/disable
- Notification preferences

---

## Technical deliverables

### Packages

| Package | MVP deliverable |
|---------|-----------------|
| `@agent-observatory/core` | Session model, SQLite store, FTS search, event bus |
| `@agent-observatory/server` | HTTP server, SSE, REST API, file watcher |
| `@agent-observatory/dashboard` | React app — 4 screens above |
| `@agent-observatory/adapter-claude-code` | JSONL parser, hook handlers |

### API endpoints (MVP)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/sessions` | List sessions |
| GET | `/api/sessions/:id` | Session detail |
| GET | `/api/sessions/:id/transcript` | Full transcript |
| GET | `/api/search?q=` | Full-text search |
| GET | `/api/live` | SSE event stream |
| GET | `/api/stats/today` | Today's aggregates |
| POST | `/api/sessions/:id/export` | Export to Markdown |
| POST | `/api/hooks/notify` | Hook: agent notification |
| POST | `/api/hooks/tool-use` | Hook: post-tool-use |

### CLI commands (MVP)

```bash
agent-observatory start              # Start server (background option)
agent-observatory stop               # Stop server
agent-observatory status             # Is it running?
agent-observatory recover [n|id]     # Recover session
agent-observatory install-hooks      # Wire Claude Code hooks
agent-observatory uninstall-hooks    # Remove hooks
agent-observatory export-all         # Export all sessions
```

---

## Data model (MVP)

```typescript
// Universal session (normalized from any adapter)
interface Session {
  id: string;
  agentId: string;           // "claude-code"
  projectPath: string;
  startedAt: string;       // ISO 8601
  updatedAt: string;
  model: string;
  status: "active" | "idle" | "completed" | "crashed";
  tokenUsage: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
  contextPercent: number;
  estimatedCostUsd: number;
  messageCount: number;
  toolCallCount: number;
}

interface ToolEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  tool: string;              // "Read", "Edit", "Bash", etc.
  input: string;             // Sanitized summary
  output?: string;
  linesAdded?: number;
  linesRemoved?: number;
  durationMs?: number;
}

interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  usage?: TokenUsage;
}
```

---

## MVP milestones (daily)

| Day | Milestone |
|-----|-----------|
| **Day 1** | Repo scaffold, core types, SQLite schema, Claude Code JSONL parser |
| **Day 2** | File watcher + ingestion pipeline, session indexing |
| **Day 3** | HTTP server + SSE + REST API |
| **Day 4** | Dashboard shell + Mission Control screen + live feed |
| **Day 5** | Sessions list + search + transcript view |
| **Day 6** | Hooks, recovery, export, CLI polish |
| **Day 7** | Bug fixes, README polish, **make repo public**, announce |

---

## Definition of done (MVP)

- [x] `npm install && npm run dev` starts dashboard without errors
- [x] Active Claude Code session appears in dashboard within 5 seconds
- [x] Tool calls stream live via SSE (with hooks installed)
- [x] Search finds text from past sessions
- [x] `ao recover` exports readable Markdown
- [x] Hooks install cleanly via `install-hooks`
- [x] No outbound telemetry
- [x] Works on macOS (primary), Linux (best effort)
- [x] README and docs complete for public launch
- [ ] Repository public + GitHub release v0.1.0

---

## Success metrics (week 1 post-public)

| Metric | Target |
|--------|--------|
| GitHub stars | 50+ |
| Issues opened | Engagement (bugs welcome) |
| Daily active (self) | Used every coding session |
| Adapter PRs | 1+ community interest |

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Claude Code JSONL format changes | Version-detect parser; adapter isolation |
| Performance with 1000+ sessions | SQLite FTS + mtime cache; lazy indexing |
| Hook format breaking | Match Claude Code nested hook schema; `/doctor` docs |
| Scope creep | Strict MVP list above; everything else → v0.2 |
