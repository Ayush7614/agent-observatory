# Agent Observatory

**One beautiful dashboard for every coding AI agent.**

Agent Observatory is a **local-first, zero-telemetry** command center for coding agents. See live tool activity, search every session, export transcripts for recovery, and track token usage — starting with **Claude Code** today, more agents via adapters in v0.2.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js 22+](https://img.shields.io/badge/node-22%2B-green.svg)](.nvmrc)
[![Release](https://img.shields.io/badge/release-v0.1.0-violet.svg)](https://github.com/Ayush7614/agent-observatory/releases/tag/v0.1.0)

> **v0.1.0** — Claude Code MVP · MIT · [Changelog](./CHANGELOG.md)

---

## Screenshots

<!-- screenshots: uncomment after adding docs/screenshots/*.png

<p align="center">
  <img src="docs/screenshots/mission-control.png" alt="Mission Control" width="800" />
</p>

<p align="center">
  <img src="docs/screenshots/sessions.png" alt="Sessions search" width="800" />
</p>

-->

_Capture instructions: [docs/LAUNCH.md](./docs/LAUNCH.md)_

---

## Why Agent Observatory?

Every coding agent ships its own siloed UI. Agent Observatory gives you **one place** to monitor, search, and recover sessions — without sending data to the cloud.

| | Claude Code alone | + Agent Observatory |
|--|-------------------|---------------------|
| Live tool feed | Hook plugins (fragmented) | Built-in SSE feed |
| Search all sessions | Manual JSONL grep | Full-text search (FTS5) |
| Crash recovery | Copy/paste transcript | `ao recover` → Markdown |
| Local LLM (Ollama) | No cost visibility | **Free · local** ($0) |
| Multi-agent | ❌ | Adapters (v0.2+) |

---

## Features (v0.1.0)

| Feature | Status |
|---------|--------|
| Mission Control dashboard | ✅ |
| Live tool activity (SSE + hooks) | ✅ |
| Token & context display | ✅ |
| Session list + full-text search | ✅ |
| Transcript preview + Markdown export | ✅ |
| Auto-snapshots (every 5 min) | ✅ |
| Settings (budgets, notifications) | ✅ |
| Claude Code adapter (JSONL + hooks) | ✅ |
| Ollama / local models ($0 cost) | ✅ |
| CLI (`ao start`, `recover`, `doctor`) | ✅ |
| Aider, Codex, Cline adapters | 🔜 v0.2 |
| Phone approvals (ntfy) | 🔜 v0.2 |

---

## Quick start

**Requires Node.js 22+** (built-in `node:sqlite`).

```bash
source ~/.nvm/nvm.sh && nvm use 22   # if using nvm
git clone https://github.com/Ayush7614/agent-observatory.git
cd agent-observatory
npm install
npm run build:dashboard
npm run start
```

Open **http://127.0.0.1:7420**

### Development (hot reload)

```bash
npm run dev              # API :7420
npm run dev:dashboard    # UI  :5173
```

### Claude Code hooks (recommended)

Enables **real-time** tool feed and attention alerts:

```bash
npm run install-hooks    # wires ~/.claude/settings.json
# Restart Claude Code
ao doctor                # verify setup
```

### Session recovery

```bash
ao recover               # export latest session to Markdown
ao recover 2             # second most recent
ao export-all            # bulk export
```

Exports: `~/.agent-observatory/exports/`  
Auto-snapshots: `~/.agent-observatory/snapshots/`

---

## Local LLMs (Ollama)

Running Claude Code with **Ollama** (e.g. `qwen2.5:0.5b`)? Observatory detects local models and shows **$0 / Free · local** — no Anthropic API credits required. Cloud models still show API-equivalent cost estimates for usage tracking.

---

## CLI reference

| Command | Description |
|---------|-------------|
| `ao start` | Start server (background) |
| `ao stop` | Stop server |
| `ao status` | Running / stopped |
| `ao recover [n\|id]` | Export session to Markdown |
| `ao export-all` | Export all sessions |
| `ao install-hooks` | Wire Claude Code hooks |
| `ao uninstall-hooks` | Remove hooks |
| `ao doctor` | Check Node, DB, hooks, paths |

---

## Architecture

```
  Claude Code ──adapter──▶ Core (SQLite · FTS5 · export)
                                │
                                ▼
                          Server (REST · SSE)
                                │
                                ▼
                          Dashboard (React)
```

Data stays on your machine: `~/.agent-observatory/`

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Documentation

| Doc | Description |
|-----|-------------|
| [Launch guide](./docs/LAUNCH.md) | Go public + screenshots |
| [Roadmap](./docs/ROADMAP.md) | v0.2 → v1.0 |
| [MVP](./docs/MVP.md) | v0.1 scope |
| [Adapters](./docs/ADAPTERS.md) | Integrate new agents |
| [Security](./docs/SECURITY.md) | Privacy & threat model |
| [Contributing](./docs/CONTRIBUTING.md) | PRs welcome |

---

## Project structure

```
agent-observatory/
├── packages/core/           Session store, search, export, config
├── packages/server/         HTTP server, SSE, API
├── packages/dashboard/      React UI (Vite + Tailwind)
├── packages/adapters/
│   └── claude-code/         JSONL watcher + hook parser
├── hooks/claude-code/       Scripts for install-hooks
├── bin/agent-observatory.js CLI (ao)
└── docs/
```

---

## Roadmap snapshot

| Version | Theme | Highlights |
|---------|-------|------------|
| **v0.1** ✅ | See Claude Code clearly | Dashboard, search, export, hooks |
| **v0.2** | Multi-agent | Aider, Codex CLI, phone approvals |
| **v0.3** | Intelligence | Analytics, git impact, security audit |
| **v1.0** | Platform | Adapter SDK, marketplace |

---

## Tech stack

- **Runtime:** Node.js 22+ (`node:sqlite`, zero npm deps in core)
- **Frontend:** React 19 · Vite · Tailwind · Framer Motion
- **Storage:** SQLite + FTS5 under `~/.agent-observatory/`
- **Realtime:** Server-Sent Events (SSE)

---

## Contributing

Contributions welcome — especially **adapters** for new coding agents. See [CONTRIBUTING.md](./docs/CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  <strong>Agent Observatory</strong> — See everything your coding agents do.<br/>
  <sub>Built by <a href="https://github.com/Ayush7614">Ayush7614</a></sub>
</p>
