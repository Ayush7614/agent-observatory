# Day 1 Sprint Checklist

> Start here. Today’s goal: core foundation + Claude Code JSONL parser.

## Setup

- [ ] `npm install` succeeds
- [ ] `npm test` passes (parser tests)
- [ ] Copy `config.example.json` → `~/.agent-observatory/config.json`

## Core (`packages/core`)

- [ ] Implement SQLite schema in `store.js` (see docs/ARCHITECTURE.md)
- [ ] Implement FTS5 search in `search.js`
- [ ] Wire event bus → store on `session:updated` and `tool:executed`

## Claude Code adapter

- [ ] Verify JSONL parsing against real `~/.claude/projects/` files
- [ ] Incremental file offset tracking in `~/.agent-observatory/state/file-offsets.json`
- [ ] Extract token usage from `usage` blocks
- [ ] Map model names correctly

## Server

- [ ] `npm run dev` starts on :7420
- [ ] `curl http://127.0.0.1:7420/api/health` returns JSON
- [ ] `curl -N http://127.0.0.1:7420/api/live` streams SSE

## Verify

- [ ] Run Claude Code session → events appear in SSE stream
- [ ] Sessions listed at `/api/sessions`

## Notes

_Add blockers and discoveries here._
