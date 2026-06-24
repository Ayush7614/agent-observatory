# Contributing

> Agent Observatory is currently in **private development**. This guide applies once the repository goes public (~1 week).

---

## Welcome

Thank you for your interest in Agent Observatory! We're building the universal dashboard for coding AI agents, and community contributions — especially **adapters** for new agents — are highly valued.

---

## Ways to contribute

### 1. Adapters (highest impact)

Build an adapter for your favorite coding agent. See [ADAPTERS.md](./ADAPTERS.md).

Priority agents we'd love help with:
- Cursor
- GitHub Copilot
- Gemini CLI
- OpenHands
- Windsurf

### 2. Bug reports

Open an issue with:
- OS and Node version
- Agent and version
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs from `~/.agent-observatory/logs/`

**Do not** include real session transcripts in issues — they may contain secrets.

### 3. Feature requests

Check [FEATURES.md](./FEATURES.md) first. If not listed, open a discussion issue explaining the use case.

### 4. Documentation

Fix typos, improve guides, add adapter examples.

### 5. Dashboard UI

We want it beautiful. UI/UX PRs welcome — include screenshots.

---

## Development setup

See [DEVELOPMENT.md](./DEVELOPMENT.md).

---

## Pull request guidelines

1. **One concern per PR** — adapter OR feature OR fix, not all three
2. **Tests required** for parser/logic changes
3. **No new dependencies** in `core` or `server` without discussion
4. **JSDoc** for new public functions
5. **Update docs** if you change behavior

### PR template

```markdown
## Summary
Brief description of changes.

## Type
- [ ] Bug fix
- [ ] New feature
- [ ] New adapter
- [ ] Documentation
- [ ] UI improvement

## Test plan
- [ ] `npm test` passes
- [ ] Manual testing steps...

## Screenshots (if UI)
```

---

## Code of conduct

Be respectful. We're all here to build useful tools for developers.

---

## Adapter contribution checklist

- [ ] Implements `AgentAdapter` interface
- [ ] Zero npm dependencies (preferred)
- [ ] Test fixtures with sample data (no real sessions)
- [ ] Documented in ADAPTERS.md
- [ ] Config schema added to config.example.json
- [ ] Hook manifest (if applicable)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
