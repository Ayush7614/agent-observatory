# Changelog

All notable changes to Agent Observatory are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — 2026-06-24

First public release. **Claude Code** is the primary supported agent.

### Added

- **Mission Control** — live session stats, token usage, context gauge, cost display
- **Sessions** — browse all indexed sessions, full-text search, transcript preview
- **Settings** — budgets, notifications, snapshot interval, agent toggles
- **Claude Code adapter** — watches `~/.claude/projects/**/*.jsonl`, indexes sessions
- **Live SSE feed** — real-time tool calls and agent alerts via hooks
- **Session export** — Markdown export from dashboard or CLI (`ao recover`, `ao export-all`)
- **Auto-snapshots** — periodic backups to `~/.agent-observatory/snapshots/`
- **CLI** — `start`, `stop`, `status`, `recover`, `export-all`, `install-hooks`, `doctor`
- **Local/Ollama support** — local models show $0 / "Free · local" (no fake API costs)
- **SQLite + FTS5** — local session store and search at `~/.agent-observatory/data.db`

### Security

- Server binds to `127.0.0.1` by default
- Hook and settings APIs are localhost-only
- No outbound telemetry

[0.1.0]: https://github.com/Ayush7614/agent-observatory/releases/tag/v0.1.0
