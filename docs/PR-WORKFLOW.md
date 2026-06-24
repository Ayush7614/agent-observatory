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

## Stacked PRs (use with caution)

**Default: always open PRs against `main`.** Stacked PRs caused PR #2 to merge into a feature branch instead of `main`.

If you must stack:

```bash
git checkout feat/core-sqlite-store
git checkout -b feat/claude-code-ingestion
gh pr create --base feat/core-sqlite-store
```

**After merging a stacked PR, you MUST also merge into `main`:**

```bash
# After PR #1 merges to main and PR #2 merges to the feature branch:
git checkout main && git pull
git merge origin/feat/core-sqlite-store   # or rebase PR #2 onto main
git push origin main
```

Or open a follow-up PR: `feat/core-sqlite-store` → `main` to sync remaining commits.

**Recommended:** Avoid stacked PRs. Branch everything from `main` and keep PRs independent.

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
| [#1](https://github.com/Ayush7614/agent-observatory/pull/1) | `feat/core-sqlite-store` | Merged |
| [#2](https://github.com/Ayush7614/agent-observatory/pull/2) | `feat/claude-code-ingestion` | Merged (into feature branch — synced via #3) |
| #3 | `fix/sync-pr2-to-main` | Sync PR #2 ingestion into `main` |
| #4 | `feat/dashboard-mission-control` | Planned — Dashboard UI |

_Update this table as PRs are opened/merged._
