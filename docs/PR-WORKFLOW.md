# Pull Request Workflow

> **All changes go through PRs** — no direct commits to `main`.

---

## Branch naming

```
feat/<short-description>    # New features
fix/<short-description>     # Bug fixes
docs/<short-description>    # Documentation only
chore/<short-description>   # Tooling, deps, CI
```

Examples:
- `feat/core-sqlite-store`
- `feat/claude-code-ingestion`
- `feat/dashboard-mission-control`

---

## Process

```bash
# 1. Branch from main
git checkout main
git pull origin main
git checkout -b feat/my-feature

# 2. Develop + test
npm test

# 3. Commit
git add -A
git commit -m "feat(core): description"

# 4. Push + open PR
git push -u origin feat/my-feature
gh pr create --title "feat(core): description" --body "..."
```

---

## PR requirements

- [ ] `npm test` passes (Node 22 — see `.nvmrc`)
- [ ] Focused scope — one concern per PR
- [ ] Docs updated if behavior changes
- [ ] No secrets or personal paths in commits

---

## Stacked PRs (optional)

For dependent work, branch from the feature branch:

```bash
git checkout feat/core-sqlite-store
git checkout -b feat/claude-code-ingestion
# ... work ...
gh pr create --base feat/core-sqlite-store
```

Merge bottom-up: merge PR #1 first, then rebase PR #2 onto main.

---

## Merge strategy

- **Squash merge** for feature PRs (clean history)
- Delete branch after merge

```bash
gh pr merge <number> --squash --delete-branch
```

---

## Current PR queue

| PR | Branch | Status |
|----|--------|--------|
| [#1](https://github.com/Ayush7614/agent-observatory/pull/1) | `feat/core-sqlite-store` | Open — SQLite store + FTS search |
| [#2](https://github.com/Ayush7614/agent-observatory/pull/2) | `feat/claude-code-ingestion` | Open — Claude Code live ingestion |
| #3 | `feat/dashboard-mission-control` | Planned — Dashboard UI |

_Update this table as PRs are opened/merged._
