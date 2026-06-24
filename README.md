# Agent Observatory

**One beautiful dashboard for every coding AI agent.**

Agent Observatory is a local-first, zero-telemetry platform that unifies monitoring, analytics, session recovery, and remote control for coding agents — whether open source or closed source.

> **Status:** Private development (target public release: ~1 week)  
> **License:** MIT  
> **Maintainer:** [Ayush7614](https://github.com/Ayush7614)

---

## The problem

Every coding agent ships its own siloed experience:

| Agent | Usage UI | Session history | Phone approvals | Cross-agent view |
|-------|----------|-----------------|-----------------|------------------|
| Claude Code | Status bar plugins | Local JSONL | Third-party only | ❌ |
| Cursor | Built-in billing | Limited | ❌ | ❌ |
| Aider | Terminal only | `.aider` chat logs | ❌ | ❌ |
| Codex CLI | OpenAI dashboard | Local logs | ❌ | ❌ |
| Cline | VS Code panel | Extension storage | ❌ | ❌ |

**Agent Observatory** gives you one mission-control dashboard for all of them.

---

## What you get

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Agent Observatory Dashboard          http://127.0.0.1:7420  │
├─────────────────────────────────────────────────────────────────┤
│  LIVE          │  Claude Code · running Edit on src/api.ts     │
│  TOKENS        │  Context ████████░░ 78%  ·  Session $2.41     │
│  ACTIVITY      │  Read → Edit → Bash → Read → …                │
│  SESSIONS      │  Search 847 sessions · Recover · Export       │
│  APPROVALS     │  Allow · Allow all · Deny  (phone + desktop)  │
└─────────────────────────────────────────────────────────────────┘
```

### Core capabilities (planned)

- **Live activity feed** — see every tool call, file edit, and shell command in real time
- **Token & context monitoring** — input/output/cache tokens, context window pressure
- **Multi-agent support** — Claude Code, Aider, Codex CLI, Cline, Continue, and more via adapters
- **Session recovery** — never lose context after a crash, freeze, or limit hit
- **Full-text search** — find anything across every session you've ever run
- **Cost intelligence** — hourly/daily/weekly spend, budgets, burn-rate alerts
- **Remote approvals** — Allow/Deny tool calls from your phone (ntfy, Telegram, Slack)
- **Git impact view** — lines changed, files touched, branch drift
- **Security audit** — full trail of what agents executed on your machine

---

## Architecture (high level)

```
  Coding Agents                    Agent Observatory
  ─────────────                    ─────────────────

  Claude Code ──adapter──┐
  Aider       ──adapter──┼──▶ Core (store · search · analytics)
  Codex CLI   ──adapter──┤         │
  Cline       ──adapter──┘         ▼
                              Server (SSE · REST)
                                   │
                                   ▼
                              Dashboard (React)
```

Each agent connects through a **plugin adapter** that normalizes events into a universal session model. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Quick start

**Requires Node.js 22+** (uses built-in `node:sqlite`). If you use nvm:

```bash
source ~/.nvm/nvm.sh
nvm use 22          # or: nvm alias default 22
node -v             # should show v22.x
```

```bash
git clone git@github.com:Ayush7614/agent-observatory.git
cd agent-observatory
npm install
```

### Development (two terminals)

```bash
# Terminal 1 — API server (:7420)
npm run dev

# Terminal 2 — Dashboard with hot reload (:5173)
npm run dev:dashboard
open http://127.0.0.1:5173
```

### Production (single port)

```bash
npm run build:dashboard
npm run start
open http://127.0.0.1:7420
```

### Optional: Claude Code hooks

```bash
npm run install-hooks
# Restart Claude Code
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [MVP Spec](./docs/MVP.md) | What we ship in week 1 |
| [Roadmap](./docs/ROADMAP.md) | v0.1 → v1.0 timeline |
| [Features](./docs/FEATURES.md) | Complete feature catalog |
| [Architecture](./docs/ARCHITECTURE.md) | System design & data model |
| [Adapters](./docs/ADAPTERS.md) | How to integrate each agent |
| [Development](./docs/DEVELOPMENT.md) | Local setup & conventions |
| [Security](./docs/SECURITY.md) | Privacy & threat model |
| [Contributing](./docs/CONTRIBUTING.md) | How to contribute (post-public) |

---

## Project structure

```
agent-observatory/
├── packages/
│   ├── core/              # Universal session model, store, search index
│   ├── server/            # Local HTTP server, SSE, REST API
│   ├── dashboard/         # React dashboard (Vite + Tailwind)
│   └── adapters/
│       ├── claude-code/   # Claude Code adapter (MVP)
│       ├── aider/         # Aider adapter (v0.2)
│       └── generic/       # Generic log-tail adapter (v0.3)
├── hooks/                 # Hook scripts injected into agents
├── bin/                   # CLI entry point
├── docs/                  # All planning & design docs
└── config.example.json    # Example user configuration
```

---

## Supported agents (roadmap)

| Agent | MVP | v0.2 | v0.3 | Notes |
|-------|-----|------|------|-------|
| Claude Code | ✅ | — | — | JSONL + hooks |
| Aider | — | ✅ | — | Git + chat logs |
| OpenAI Codex CLI | — | ✅ | — | Session logs |
| Cline | — | — | ✅ | VS Code hooks |
| Continue | — | — | ✅ | Open config |
| Cursor | — | — | 🔬 | Extension bridge (research) |
| Generic log adapter | — | — | ✅ | Bring your own parser |

---

## Principles

1. **Local-first** — data stays on your machine by default
2. **Zero telemetry** — no analytics, no phone-home
3. **Adapter-based** — new agents = new plugin, not fork
4. **Never hang the agent** — if Observatory is down, agents work normally
5. **Beautiful by default** — dashboard you'd actually want open all day

---

## Release plan

| Phase | Target | Visibility |
|-------|--------|------------|
| **Now** | Scaffold + docs + Claude Code adapter | Private repo |
| **Week 1** | MVP dashboard + live monitoring + search | **Go public** |
| **Week 2–4** | More adapters + phone approvals + analytics | Public |
| **Month 2+** | Team features, semantic search, plugin marketplace | Public |

---

## Tech stack

- **Runtime:** Node.js 20+
- **Backend:** Native `http` module (zero deps in core)
- **Frontend:** Vite + React + Tailwind CSS + Framer Motion
- **Storage:** SQLite (FTS5 for search) under `~/.agent-observatory/`
- **Realtime:** Server-Sent Events (SSE)

---

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  <strong>Agent Observatory</strong> — See everything your coding agents do.
</p>
