# Hook scripts for Agent Observatory

These scripts are injected into coding agents via `agent-observatory install-hooks`.

## Claude Code

| Hook | Script | Purpose |
|------|--------|---------|
| `Notification` | `claude-code/notify.js` | Agent needs attention |
| `PostToolUse` | `claude-code/post-tool-use.js` | Live activity feed |
| `PreToolUse` | `claude-code/pre-tool-use.js` | Remote approvals (v0.2) |

All hooks:
- POST to `http://127.0.0.1:7420/api/hooks/*`
- **Never block the agent** on failure
- Exit cleanly even if Observatory is not running

## Install

```bash
agent-observatory install-hooks --agent claude-code
```
