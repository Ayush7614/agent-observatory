# Public launch guide — v0.1.0

Checklist to take Agent Observatory from private development to a public GitHub release.

---

## Pre-flight (done in code)

- [x] MVP features shipped (Mission Control, Sessions, Settings, export, hooks, snapshots)
- [x] README polished for v0.1.0
- [x] CHANGELOG.md with release notes
- [x] LICENSE confirmed (MIT)
- [x] Node 22+ requirement documented
- [x] `npm test` passing (29 tests)

---

## Screenshots (manual — ~5 min)

Capture from your machine after `npm run build:dashboard && npm run start`:

| File | What to capture |
|------|-----------------|
| `docs/screenshots/mission-control.png` | Mission Control tab — active session + stats |
| `docs/screenshots/sessions.png` | Sessions tab — list + search + detail panel |
| `docs/screenshots/settings.png` | Settings tab — budgets and agents section |

**Tips**

- Use dark mode / default theme
- Blur or use a generic project name if your session titles are personal
- macOS: `Cmd+Shift+4` → select window
- Optional GIF: [Kap](https://getkap.co/) or Screen Studio for live tool feed

After adding images, commit them and push:

```bash
git add docs/screenshots/*.png
git commit -m "docs: add v0.1.0 screenshots"
git push
```

Then uncomment the screenshot block in `README.md` (search for `<!-- screenshots`).

---

## Make repository public

```bash
# Requires repo admin access
gh repo edit Ayush7614/agent-observatory --visibility public
```

Or: GitHub → **Settings** → **General** → **Change visibility** → Public.

---

## Create GitHub release

After merging the launch PR and tagging:

```bash
git checkout main && git pull
git tag v0.1.0
git push origin v0.1.0

gh release create v0.1.0 \
  --title "v0.1.0 — Claude Code dashboard MVP" \
  --notes-file CHANGELOG.md
```

---

## Optional announcement

**One-liner**

> Agent Observatory v0.1.0 — a local-first dashboard for Claude Code. Live tool feed, session search, export/recover, Ollama-friendly. Zero telemetry. MIT.

**Where to post**

- Twitter/X — attach `mission-control.png`
- Hacker News — Show HN: Agent Observatory – local dashboard for Claude Code
- Reddit r/ClaudeAI, r/LocalLLaMA — mention Ollama $0 cost display

**Suggested HN title**

> Show HN: Agent Observatory – local mission-control dashboard for Claude Code

---

## Post-launch

- [ ] Watch GitHub Issues for install problems
- [ ] Respond to adapter requests (Aider, Codex CLI are v0.2)
- [ ] Start v0.2 branch from [ROADMAP.md](./ROADMAP.md)
