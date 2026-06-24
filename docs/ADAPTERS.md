# Adapter Guide

> How Agent Observatory integrates with each coding agent.

---

## Adapter philosophy

Each coding agent stores data differently. Adapters are **thin translation layers** that:

1. **Watch** the agent's data sources (files, hooks, APIs)
2. **Parse** agent-specific formats into raw events
3. **Normalize** into the universal Session / Message / ToolEvent model
4. **Emit** on the core event bus — never write to DB directly

If an adapter crashes, other adapters and the agent itself are unaffected.

---

## Integration methods (ranked by reliability)

| Method | Description | Best for |
|--------|-------------|----------|
| **Session files** | Watch JSONL/log files on disk | Claude Code, Aider |
| **Lifecycle hooks** | Agent fires HTTP command on events | Claude Code, Cline |
| **Extension bridge** | Custom IDE extension reads storage | Cursor, Copilot |
| **Log tail + parser** | User-configured regex/JSON path | Any CLI tool |
| **Official API** | Agent exposes REST/WebSocket | OpenHands, Devin |

---

## Claude Code (P0 — MVP)

### Data sources

| Source | Path | Content |
|--------|------|---------|
| Session logs | `~/.claude/projects/<project-hash>/<session-uuid>.jsonl` | Full conversation + tool calls + usage |
| Settings | `~/.claude/settings.json` | Hook configuration |
| Status stdin | Piped JSON on status refresh | Rate limits, model, context (reference only) |

### JSONL message types

```javascript
// User message
{ "type": "user", "message": { "role": "user", "content": "..." } }

// Assistant message with usage
{ "type": "assistant", "message": { "role": "assistant", "content": "..." }, "usage": { ... } }

// Tool use
{ "type": "assistant", "message": { "content": [{ "type": "tool_use", "name": "Read", "input": {...} }] } }

// Tool result
{ "type": "user", "message": { "content": [{ "type": "tool_result", "content": "..." }] } }
```

### Hooks to install

```json
{
  "hooks": {
    "Notification": [{
      "matcher": "",
      "hooks": [{ "type": "command", "command": "node <observatory>/hooks/claude-code/notify.js" }]
    }],
    "PostToolUse": [{
      "matcher": "",
      "hooks": [{ "type": "command", "command": "node <observatory>/hooks/claude-code/post-tool-use.js" }]
    }],
    "PreToolUse": [{
      "matcher": "",
      "hooks": [{ "type": "command", "command": "node <observatory>/hooks/claude-code/pre-tool-use.js" }]
    }]
  }
}
```

### Capabilities

| Capability | Support |
|------------|---------|
| Live monitoring | ✅ JSONL watch + PostToolUse hook |
| Token usage | ✅ From `usage` blocks in JSONL |
| Context window | ✅ From stdin JSON (when available) |
| Session recovery | ✅ Read JSONL from disk |
| Full-text search | ✅ Index message content |
| Remote approvals | 🔶 PreToolUse hook (v0.2) |
| Rate limits | ✅ From stdin `rate_limits` field |

### Parser strategy

- Track byte offset per file in `~/.agent-observatory/state/file-offsets.json`
- On mtime change: read only new bytes
- On first scan: index all existing JSONL files
- Cache session metadata; re-parse only when mtime changes

---

## Aider (P1 — v0.2)

### Data sources

| Source | Path | Content |
|--------|------|---------|
| Chat history | `.aider.chat.history.md` (per project) | Markdown conversation |
| Input history | `.aider.input.history` | User prompts |
| Tags | `.aider.tags.cache` | File tags |

### Integration approach

1. Watch `.aider*` files in project directories (configurable roots)
2. Parse markdown chat format into messages
3. Infer tool events from `/commit`, `/run`, file edit blocks
4. Git diff for lines changed metrics

### Capabilities

| Capability | Support |
|------------|---------|
| Live monitoring | 🔶 File watch (no native hooks) |
| Token usage | ⚠️ Estimated from message length if not in output |
| Session recovery | ✅ Chat history file |
| Full-text search | ✅ |
| Remote approvals | ❌ No hook support |

---

## OpenAI Codex CLI (P1 — v0.2)

### Data sources

| Source | Path | Content |
|--------|------|---------|
| Session logs | TBD — investigate `~/.codex/` or similar | Session transcripts |

### Integration approach

1. Discover log location on first run
2. JSON/JSONL parser similar to Claude Code
3. Map OpenAI usage fields to universal model

### Status

🔬 **Research needed** — log format to be documented during v0.2 sprint.

---

## Cline (P2 — v0.3)

### Data sources

| Source | Path | Content |
|--------|------|---------|
| Extension storage | VS Code globalStorage | Task history |
| Hooks | `cline_hooks` in settings | Event callbacks |

### Integration approach

1. Read VS Code extension globalStorage path
2. Wire Cline's hook system (similar to Claude Code)
3. Parse task/message format

---

## Continue (P2 — v0.3)

### Data sources

| Source | Path | Content |
|--------|------|---------|
| Config | `~/.continue/config.json` | Model config |
| Sessions | Continue session storage | Chat history |

### Integration approach

1. Open-source — read their session format from source
2. File watcher on session directory

---

## Cursor (P3 — research)

### Challenge

Cursor is closed-source. No documented session file format.

### Possible approaches

1. **Cursor extension** — build a VS Code extension that reads Cursor's internal state and POSTs to Observatory
2. **Log interception** — if Cursor writes logs to `~/Library/Application Support/Cursor/`
3. **MCP bridge** — if Cursor exposes session data via MCP
4. **Manual export** — user exports chat, Observatory imports

### Status

🔬 Research phase — will document findings in v0.3.

---

## Generic log adapter (P1 — v0.2)

For any agent not yet officially supported:

```json
{
  "agents": {
    "generic": {
      "enabled": true,
      "sources": [
        {
          "id": "my-custom-agent",
          "name": "My Custom Agent",
          "watchDir": "~/my-agent/logs",
          "format": "jsonl",
          "sessionFilePattern": "*.jsonl",
          "mappings": {
            "sessionId": "$.id",
            "timestamp": "$.timestamp",
            "role": "$.role",
            "content": "$.content",
            "tool": "$.tool.name",
            "tokens": "$.usage.total_tokens"
          }
        }
      ]
    }
  }
}
```

---

## Building a new adapter

### 1. Create package

```bash
mkdir -p packages/adapters/my-agent/src
```

### 2. Implement interface

```javascript
// packages/adapters/my-agent/src/index.js
export const id = 'my-agent';
export const name = 'My Agent';

export async function start(config, eventBus) { /* ... */ }
export async function stop() { /* ... */ }
export async function listSessions() { /* ... */ }
export async function getSession(id) { /* ... */ }
export function getHookManifest() { /* ... */ }
export function parseHookPayload(raw) { /* ... */ }
```

### 3. Register in server

```javascript
// packages/server/src/adapters.js
import * as myAgent from '@agent-observatory/adapter-my-agent';
const ADAPTERS = [claudeCode, myAgent];
```

### 4. Add config schema

Document required config fields in `config.example.json`.

### 5. Write tests

```bash
packages/adapters/my-agent/test/parser.test.js
```

---

## Adapter capability matrix

| Adapter | Live | Tokens | Hooks | Recovery | Search | Approvals |
|---------|------|--------|-------|----------|--------|-----------|
| Claude Code | ✅ | ✅ | ✅ | ✅ | ✅ | 🔶 |
| Aider | 🔶 | ⚠️ | ❌ | ✅ | ✅ | ❌ |
| Codex CLI | 🔶 | 🔶 | TBD | 🔶 | 🔶 | TBD |
| Cline | 🔶 | 🔶 | ✅ | 🔶 | 🔶 | 🔶 |
| Continue | 🔶 | 🔶 | ✅ | 🔶 | 🔶 | ❌ |
| Generic | ⚙️ | ⚙️ | ❌ | ⚙️ | ⚙️ | ❌ |
| Cursor | 🔬 | 🔬 | 🔬 | 🔬 | 🔬 | 🔬 |

✅ = full support · 🔶 = planned · ⚠️ = estimated · ⚙️ = user-configured · 🔬 = research · ❌ = not possible
