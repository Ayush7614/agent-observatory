# Feature Catalog

> Complete feature list for Agent Observatory — MVP through v1.0.

Legend: ✅ MVP · 🔶 v0.2 · 🔷 v0.3 · ⬜ v0.4+ · 💡 Backlog

---

## 1. Live monitoring

| Feature | Version | Description |
|---------|---------|-------------|
| Real-time activity feed | ✅ | Stream of tool calls as they happen |
| Agent state indicator | ✅ | thinking · running · waiting · idle · crashed |
| Active session card | ✅ | Model, project, elapsed time at a glance |
| Multi-agent view | 🔶 | See Claude + Aider + Codex simultaneously |
| Tool input/output preview | ✅ | Expandable tool call details |
| Heartbeat / spinner | ✅ | Visual indicator during active tool use |
| Last tool display | 🔶 | Show most recent tool in status widget |
| Session timer | ✅ | Elapsed time for current session |
| Files changed counter | 🔶 | Live count of modified files |

---

## 2. Token & context

| Feature | Version | Description |
|---------|---------|-------------|
| Input token count | ✅ | Prompt tokens consumed |
| Output token count | ✅ | Completion tokens generated |
| Cache read/write tokens | ✅ | Anthropic cache metrics |
| Context window gauge | ✅ | Visual % fill with color thresholds |
| Context pressure warnings | ✅ | Alert at 70% and 90% |
| Per-turn token breakdown | ✅ | Tokens per message in transcript |
| Token velocity | 🔶 | Tokens/minute burn rate |
| Model display | ✅ | Opus / Sonnet / Haiku / GPT-4o etc. |

---

## 3. Cost & budgets

| Feature | Version | Description |
|---------|---------|-------------|
| Session cost estimate | ✅ | API-equivalent USD cost |
| Daily / weekly totals | 🔶 | Rolling cost aggregates |
| Cost by model | 🔶 | Breakdown chart |
| Cost by project/repo | 🔶 | Per-project spend |
| Cost by agent | 🔶 | Compare agent efficiency |
| Configurable budgets | ✅ | Set session/day/week caps |
| Budget warnings (80%) | ✅ | Dashboard + notification |
| Budget exceeded alerts | 🔶 | Push notification |
| Burn rate display | 🔶 | "+3%/hr" velocity |
| Limit predictor | 🔷 | "Weekly cap in ~4h" |
| Currency conversion | 🔷 | USD, GBP, EUR, INR, etc. |
| CSV/JSON export | 🔷 | For expense reporting |
| Cumulative all-time cost | 🔶 | Total spend widget |

---

## 4. Sessions & history

| Feature | Version | Description |
|---------|---------|-------------|
| Session list | ✅ | All sessions, sortable by date |
| Session detail / transcript | ✅ | Full conversation view |
| Full-text search | ✅ | Search all sessions on disk |
| Filter by date range | ✅ | Date picker filter |
| Filter by agent | 🔶 | Multi-agent filter |
| Filter by model | 🔶 | Opus vs Sonnet etc. |
| Filter by project | ✅ | Project path filter |
| Pin / star sessions | ⬜ | Mark important sessions |
| Tag sessions | ⬜ | Custom labels |
| Session timeline replay | 🔷 | Scrub through session |
| Continue from message N | ⬜ | Branch/recover at point |
| Compare two sessions | 💡 | Side-by-side diff |

---

## 5. Recovery & export

| Feature | Version | Description |
|---------|---------|-------------|
| `recover` CLI command | ✅ | Export last session to Markdown |
| Auto-snapshots | ✅ | Periodic snapshot of active sessions |
| Export to Markdown | ✅ | Readable transcript file |
| Export to JSON | 🔶 | Structured data export |
| Export all history | 🔶 | Single gzipped archive |
| Download from dashboard | ✅ | One-click export button |
| Snapshot on crash detection | 🔷 | Detect abrupt session end |
| Diff before/after recovery | 🔷 | What changed since snapshot |

---

## 6. Approvals & remote control

| Feature | Version | Description |
|---------|---------|-------------|
| Desktop approval cards | 🔶 | Allow / Deny / Allow all in dashboard |
| Phone push (ntfy) | 🔶 | Notification with action buttons |
| Telegram notifications | 🔷 | Bot-based alerts |
| Slack webhooks | 🔷 | Team channel alerts |
| Pause / resume agent | 🔶 | Stop tool execution until resumed |
| Kill switch | 🔷 | Emergency stop all agent activity |
| Auto-allow read-only tools | 🔶 | Read, Grep pass through |
| Approval timeout fallback | 🔶 | Fall back to terminal prompt |
| Tool allowlist / blocklist | 🔷 | Configurable per-tool rules |
| `/phone` mobile view | 🔶 | Optimized mobile dashboard |

---

## 7. Code impact

| Feature | Version | Description |
|---------|---------|-------------|
| Lines added/removed | 🔶 | +N / -N per session |
| Files touched list | 🔶 | Which files agent modified |
| Files heatmap | 🔷 | Visual file activity map |
| Git branch display | ✅ | Current branch in session card |
| Git drift (ahead/behind) | 🔶 | Commits ahead/behind remote |
| Uncommitted changes | 🔶 | Agent's uncommitted work |
| Command log | 🔷 | All shell commands + exit codes |
| PR-ready summary | 🔷 | Auto changelog for PR description |
| Rollback helper | 💡 | Git revert agent changes |

---

## 8. Analytics & insights

| Feature | Version | Description |
|---------|---------|-------------|
| Today's quick stats | ✅ | Sessions, tools, cost, lines |
| Activity heatmap | 🔶 | Hourly usage grid |
| Weekly digest | 🔷 | Summary notification |
| Peak vs off-peak indicator | 🔷 | Anthropic peak hours |
| Duplicate work detector | ⬜ | "You did this before" |
| Model recommendation | ⬜ | Best model for repo type |
| Anomaly detection | ⬜ | Sudden cost/token spikes |
| Agent efficiency score | 💡 | Cost per useful line changed |

---

## 9. Search & discovery

| Feature | Version | Description |
|---------|---------|-------------|
| Full-text search (FTS5) | ✅ | Keyword search all sessions |
| Search filters | ✅ | Agent, date, model, project |
| Semantic search | ⬜ | "Find where I fixed auth" |
| Search result highlighting | ✅ | Match context in results |
| Recent searches | 🔶 | Search history |
| Project memory panel | ⬜ | Recurring patterns per repo |

---

## 10. Security & audit

| Feature | Version | Description |
|---------|---------|-------------|
| Full audit trail | 🔷 | Every tool, file, command logged |
| Secret scanner | 🔷 | Detect API keys in outputs |
| Dangerous command block | 🔷 | Block rm -rf etc. |
| Session risk score | 🔷 | High shell usage = higher risk |
| Compliance export | ⬜ | Audit log for teams |
| Sandbox status | 💡 | Which agents run unsandboxed |

---

## 11. Dashboard UX

| Feature | Version | Description |
|---------|---------|-------------|
| Dark theme | ✅ | Default polished dark UI |
| Light theme | 🔶 | Alternative theme |
| OLED theme | 🔶 | True black for OLED displays |
| Responsive layout | ✅ | Works on desktop + tablet |
| Widget grid | 🔶 | Drag & drop customizable |
| Ambient mode | 🔷 | Second-monitor minimal view |
| Command palette (⌘K) | 🔷 | Quick navigation |
| Keyboard shortcuts | 🔷 | Power user navigation |
| Smooth animations | ✅ | Framer Motion transitions |
| Glassmorphism cards | ✅ | Modern card design |
| Loading skeletons | ✅ | Polished loading states |
| Empty states | ✅ | Helpful onboarding hints |

---

## 12. CLI

| Feature | Version | Description |
|---------|---------|-------------|
| `start` / `stop` / `status` | ✅ | Daemon management |
| `recover` | ✅ | Session recovery |
| `install-hooks` | ✅ | Wire agent hooks |
| `uninstall-hooks` | ✅ | Remove hooks safely |
| `export-all` | 🔶 | Bulk export |
| `search` | 🔶 | CLI search |
| `stats` | 🔶 | Print usage stats |
| `install-service` | 🔷 | macOS launchd / Linux systemd |

---

## 13. Platform & extensibility

| Feature | Version | Description |
|---------|---------|-------------|
| Adapter plugin system | ✅ | Core architecture |
| Claude Code adapter | ✅ | First official adapter |
| Generic log adapter | 🔶 | BYO parser config |
| Adapter SDK docs | 🔷 | How to build adapters |
| `ao create-adapter` CLI | ⬜ | Scaffold new adapter |
| Plugin marketplace | ⬜ | Community adapter registry |
| MCP server export | 💡 | Expose data via MCP |
| Public REST API | ⬜ | Third-party integrations |
| Docker image | ⬜ | Headless deployment |
| macOS menu bar app | ⬜ | Native menu bar widget |

---

## 14. Team & sync (opt-in)

| Feature | Version | Description |
|---------|---------|-------------|
| Encrypted cloud sync | ⬜ | Optional E2E encrypted backup |
| Team dashboard | ⬜ | Multi-user spend view |
| Shared budgets | ⬜ | Per-project team caps |
| Role-based access | ⬜ | Admin vs viewer roles |

---

## Feature count summary

| Version | Features |
|---------|----------|
| MVP (v0.1) | ~35 |
| v0.2 | +25 |
| v0.3 | +30 |
| v0.4+ | +25 |
| Backlog | +15 |
| **Total planned** | **~130** |
