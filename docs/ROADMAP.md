# Roadmap

> **Agent Observatory** — from private MVP to the universal coding-agent command center.

---

## Timeline overview

```
Week 1          Week 2–3         Week 4–6         Month 2+         Month 3+
  │                │                │                │                │
  ▼                ▼                ▼                ▼                ▼
v0.1 MVP        v0.2 Multi-      v0.3 Control     v0.4 Team        v1.0 Platform
Claude Code     agent + phone    + analytics      + semantic       marketplace
GO PUBLIC       approvals        + security       search           + cloud opt-in
```

---

## v0.1 — MVP (Week 1) 🎯 CURRENT

**Theme:** *"See Claude Code clearly"*

- [ ] Claude Code adapter (JSONL + hooks)
- [ ] Local dashboard (Mission Control, Sessions, Transcript, Settings)
- [ ] Live SSE activity feed
- [ ] Token/context/cost display
- [ ] Full-text search (SQLite FTS5)
- [ ] Session recovery + export
- [ ] CLI (`start`, `stop`, `recover`, `install-hooks`)
- [ ] **Make repository public**

---

## v0.2 — Multi-Agent (Week 2–3)

**Theme:** *"One dashboard, many agents"*

### Adapters
- [ ] **Aider** — parse `.aider.chat.history.md` + git diffs
- [ ] **OpenAI Codex CLI** — session log parser
- [ ] **Generic log adapter** — user-defined JSON/regex parser config

### Features
- [ ] Agent selector / multi-agent sidebar
- [ ] Unified session list across all agents
- [ ] Cross-agent search
- [ ] Per-agent color coding in UI
- [ ] Phone notifications via **ntfy**
- [ ] Remote tool approvals (Allow / Allow all / Deny)
- [ ] Pause / resume agent execution
- [ ] Budget alerts with push notifications
- [ ] `/phone` mobile-optimized view

### Dashboard
- [ ] Widget customization (drag & drop grid)
- [ ] 3 themes: dark, light, OLED
- [ ] Activity heatmap (hourly usage)

---

## v0.3 — Intelligence (Week 4–6)

**Theme:** *"Understand your agent spend"*

### Adapters
- [ ] **Cline** — VS Code extension storage + hooks
- [ ] **Continue** — config + session logs
- [ ] **Gemini CLI** — log parser

### Analytics
- [ ] Cost breakdown: hour / day / week / month
- [ ] By model, project, agent, repo
- [ ] Burn rate + limit predictor
- [ ] Weekly digest email/notification (local cron)
- [ ] Export CSV/JSON for reporting

### Code impact
- [ ] Lines added/removed per session
- [ ] Files touched heatmap
- [ ] Git drift (ahead/behind, uncommitted)
- [ ] Command log with exit codes
- [ ] Auto-generated PR summary from session

### Security
- [ ] Full audit trail export
- [ ] Secret scanner on agent outputs
- [ ] Dangerous command blocklist
- [ ] Risk score per session

### UX
- [ ] Ambient mode (second-monitor minimal view)
- [ ] Session timeline replay (scrubber)
- [ ] Command palette (⌘K)
- [ ] Sound alerts (optional)

---

## v0.4 — Team & Search (Month 2)

**Theme:** *"Agents at scale"*

### Research adapters
- [ ] **Cursor** — extension bridge (best effort)
- [ ] **GitHub Copilot** — limited telemetry bridge
- [ ] **OpenHands** — sandbox session API

### Team
- [ ] Optional encrypted sync (self-hosted or S3)
- [ ] Team dashboard (who's using what)
- [ ] Shared budgets per project
- [ ] Role-based transcript access

### Search
- [ ] Semantic search (local embeddings via Ollama or API)
- [ ] "Find similar sessions"
- [ ] Pin / tag / star sessions
- [ ] Project memory panel

### Smart insights
- [ ] Duplicate work detector
- [ ] "You asked this before" suggestions
- [ ] Model recommendation per repo

---

## v1.0 — Platform (Month 3+)

**Theme:** *"The agent observability standard"*

- [ ] **Plugin marketplace** — community adapter registry
- [ ] Adapter SDK + scaffolding CLI (`ao create-adapter`)
- [ ] Official adapters maintained in monorepo
- [ ] macOS menu bar app
- [ ] Windows system tray
- [ ] Docker image for headless server
- [ ] Optional cloud dashboard (opt-in, E2E encrypted)
- [ ] Webhook integrations (Slack, Discord, PagerDuty)
- [ ] API for third-party tools
- [ ] Documentation site (docs.agent-observatory.dev)

---

## Adapter priority matrix

| Agent | Users | Data access | Hook support | Priority |
|-------|-------|-------------|--------------|----------|
| Claude Code | High | Excellent (JSONL) | Yes | **P0** |
| Aider | High | Good (chat + git) | Partial | **P1** |
| Codex CLI | Growing | Good (logs) | TBD | **P1** |
| Cline | High | Medium (VS Code) | Yes | **P2** |
| Continue | Medium | Good (open) | Yes | **P2** |
| Gemini CLI | Growing | Good (logs) | TBD | **P2** |
| Cursor | Very high | Poor (closed) | Extension needed | **P3** |
| Copilot | Very high | Poor (closed) | Limited | **P3** |
| OpenHands | Medium | Good (API) | Yes | **P3** |
| Devin | Low | Cloud only | API | **P4** |

---

## Versioning policy

- **v0.x** — rapid iteration, breaking changes OK with migration notes
- **v1.0** — stable adapter SDK, semver guarantees
- Adapters version independently (`@agent-observatory/adapter-*`)

---

## Public launch checklist (end of week 1)

- [ ] MVP features complete (see [MVP.md](./MVP.md))
- [ ] README polished with screenshots/GIF
- [ ] SECURITY.md reviewed
- [ ] LICENSE confirmed (MIT)
- [ ] Remove any secrets / personal paths from git history
- [ ] Switch repo visibility: private → **public**
- [ ] Create GitHub release `v0.1.0`
- [ ] Optional: Product Hunt / HN / Twitter announcement

---

## Ideas backlog (no timeline)

- VS Code extension (embed dashboard panel)
- Browser extension for web-based agents
- Integration with WakaTime / timing apps
- "Agent pair programming" — compare two agents on same task
- Cost optimization suggestions ("switch to Sonnet for this task")
- MCP server exposing Observatory data to other tools
- Home Assistant integration for ambient display
- Apple Watch complication for approval buttons
