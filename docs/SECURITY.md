# Security & Privacy

> Agent Observatory is local-first. Your agent data never leaves your machine unless you explicitly opt in.

---

## Threat model

### Assets

- Agent session transcripts (may contain code, secrets, business logic)
- Tool execution logs (shell commands, file paths)
- Token/cost usage data
- Git repository information

### Adversaries

| Threat | Likelihood | Impact |
|--------|------------|--------|
| Local network attacker reads dashboard | Low (requires `bindLan`) | High |
| Malicious adapter package | Low | High |
| ntfy topic guessing | Medium (if weak topic) | Medium |
| Hook injection via agent settings | Low | Medium |
| Supply chain (npm deps) | Low (zero deps in core) | High |

### Out of scope

- Protecting against attacker with shell access to your machine
- Encrypting data at rest (user's disk encryption is sufficient)
- Multi-tenant isolation (single-user tool)

---

## Default security posture

| Setting | Default | Rationale |
|---------|---------|-----------|
| Bind address | `127.0.0.1` | Localhost only |
| Authentication | None on localhost | Single-user local tool |
| Outbound network | **None** | Zero telemetry |
| Data directory | `~/.agent-observatory/` | User home, not world-readable |
| File permissions | `0o600` for config and DB | Owner read/write only |
| Hook endpoints | Localhost only | Reject non-local requests |

---

## Optional features that change the model

### Phone push (ntfy) — v0.2

When `ntfyTopic` is set:

- Approval prompts and summaries are sent through **ntfy.sh** public relay
- Anyone who knows your topic name can **read** notifications
- Replies (Allow/Deny) pass through the same topic

**Mitigations:**
- Use a long random topic: `ao-<uuid>`
- Self-host ntfy for stronger guarantees
- Use ntfy access tokens
- Observatory only acts on replies while genuinely waiting for that request

### LAN access (`bindLan: true`) — v0.2

When enabled:

- Server binds to `0.0.0.0` — accessible from local network
- Other devices can read dashboard and transcripts
- Required for `/phone` Wi-Fi view (alternative: use ntfy only)

**Mitigations:**
- Off by default
- Device token required for API access (v0.2)
- Only enable on trusted networks

### Telegram / Slack — v0.3

- Webhook URLs and bot tokens stored in local config only
- Messages contain session summaries, not full transcripts (configurable)

---

## Hook security

### Principles

1. Hooks **never** use `shell=True`
2. Hook scripts are **allowlisted paths** installed by Observatory
3. Hook POST endpoints validate `Content-Type: application/json`
4. Payload size limited to 1 MB
5. If Observatory is unreachable, hooks **exit 0** immediately (never block agent)

### PreToolUse approval flow

```
Agent wants to run tool
  → Hook POSTs to localhost:7420/api/hooks/pre-tool-use
  → Observatory validates request
  → If auto-allow (Read, Grep): return allow immediately
  → If approval needed: wait up to approvalTimeoutMs
  → On timeout/error: return {} (agent shows normal prompt)
  → Agent is NEVER hung indefinitely
```

---

## Data handling

### What we store

| Data | Location | Retention |
|------|----------|-----------|
| Session transcripts | SQLite + source files | Until user deletes |
| Tool events | SQLite | Until user deletes |
| Search index | SQLite FTS5 | Synced with sessions |
| Snapshots | `~/.agent-observatory/snapshots/` | Until user deletes |
| Config | `~/.agent-observatory/config.json` | Persistent |

### What we never store

- OAuth tokens (read from agent config, never copied)
- Passwords or API keys from agent output (flagged by secret scanner in v0.3)
- Telemetry or usage analytics about Observatory itself

### What we never send

- Session content to any external service (default)
- Crash reports (default)
- Analytics (default)

---

## Secret handling

### v0.3 secret scanner

Scan agent outputs for patterns:
- `sk-*`, `AKIA*`, `ghp_*`, `gho_*`
- Bearer tokens, JWT patterns
- `.env` file contents in tool output

Action: flag in dashboard, optionally redact in exports.

### User responsibility

- Session transcripts may contain secrets your agent encountered
- Do not expose dashboard via `bindLan` on untrusted networks
- Do not commit `~/.agent-observatory/` to git

---

## Dependency policy

| Package | Dependencies |
|---------|-------------|
| `core` | **Zero** npm dependencies |
| `server` | **Zero** npm dependencies |
| `dashboard` | React, Vite, Tailwind (dev/build only) |
| `adapters/*` | **Zero** (prefer stdlib) |

Rationale: minimize supply chain attack surface for a tool that reads sensitive agent data.

---

## Dangerous command protection (v0.3)

When `security.blockDangerousCommands` is true:

- PreToolUse hook checks command against blocklist
- Default patterns: `rm -rf /`, `mkfs`, `dd if=`, `:(){ :|:& };:`
- User can extend blocklist in config
- Blocked commands show denial in dashboard + optional notification

---

## Reporting vulnerabilities

Once public, report security issues via GitHub Security Advisories (private disclosure).

**Do not** open public issues for security vulnerabilities.

---

## Compliance notes

- Observatory is a **local developer tool**, not a SaaS
- No GDPR data processor relationship (data stays on user's machine)
- For team sync (v0.4): E2E encryption required before any cloud storage
