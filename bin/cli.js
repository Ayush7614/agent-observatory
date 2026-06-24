/**
 * Agent Observatory CLI (loaded after Node version check).
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loadConfig, getDataDir, resolvePath, SessionStore, resolveSessionRef, writeSessionExport } from '@agent-observatory/core'
import { getHookManifest as claudeCodeHooks } from '@agent-observatory/adapter-claude-code'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')

const [,, command, ...args] = process.argv

function pidFile() {
  const config = loadConfig()
  const dataDir = getDataDir(config)
  return path.join(dataDir, 'state', 'server.pid')
}

async function cmdStart() {
  const pf = pidFile()
  if (fs.existsSync(pf)) {
    const pid = fs.readFileSync(pf, 'utf8').trim()
    try {
      process.kill(Number(pid), 0)
      console.log(`Agent Observatory already running (PID ${pid})`)
      return
    } catch {
      fs.unlinkSync(pf)
    }
  }

  const serverPath = path.join(REPO_ROOT, 'packages/server/src/index.js')
  const child = spawn(process.execPath, [serverPath], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  })

  fs.mkdirSync(path.dirname(pf), { recursive: true })
  fs.writeFileSync(pf, String(child.pid))

  child.unref()
  const config = loadConfig()
  console.log(`Agent Observatory started (PID ${child.pid})`)
  console.log(`Node ${process.version}`)
  console.log(`Dashboard: http://127.0.0.1:${config.port}`)
  console.log(`Tip: run "npm run build:dashboard" first to serve UI on :7420`)
}

function cmdStop() {
  const pf = pidFile()
  if (!fs.existsSync(pf)) {
    console.log('Agent Observatory is not running')
    return
  }
  const pid = Number(fs.readFileSync(pf, 'utf8').trim())
  try {
    process.kill(pid, 'SIGTERM')
    console.log(`Stopped Agent Observatory (PID ${pid})`)
  } catch {
    console.log('Process not found — cleaning up stale PID file')
  }
  fs.unlinkSync(pf)
}

function cmdStatus() {
  const pf = pidFile()
  const config = loadConfig()
  if (!fs.existsSync(pf)) {
    console.log('Status: stopped')
    return
  }
  const pid = fs.readFileSync(pf, 'utf8').trim()
  try {
    process.kill(Number(pid), 0)
    console.log(`Status: running (PID ${pid})`)
    console.log(`Dashboard: http://127.0.0.1:${config.port}`)
  } catch {
    console.log('Status: stopped (stale PID file)')
  }
}

async function cmdRecover() {
  const arg = args[0] || '1'
  const config = loadConfig()
  const dataDir = getDataDir(config)
  const store = new SessionStore(dataDir)
  await store.init()

  const session = await resolveSessionRef(store, arg)
  if (!session) {
    console.error('No session found for that reference.')
    console.error('Tip: run "agent-observatory status" and use 1 for latest, 2 for second, or a session id.')
    await store.close()
    process.exit(1)
  }

  const detail = await store.getSession(session.id)
  if (!detail) {
    console.error('Session detail not found in index.')
    await store.close()
    process.exit(1)
  }

  const exportsDir = path.join(dataDir, 'exports')
  const { filepath } = writeSessionExport(detail, exportsDir)
  await store.close()

  console.log(`Recovered: ${session.projectName || session.id}`)
  console.log(`Model: ${session.model || 'unknown'}`)
  console.log(`Messages: ${detail.messages.length} · Tool calls: ${detail.toolEvents.length}`)
  console.log(`Export saved: ${filepath}`)
  console.log('')
  console.log('Paste the export into a new agent session to continue.')
}

async function cmdExportAll() {
  const config = loadConfig()
  const dataDir = getDataDir(config)
  const store = new SessionStore(dataDir)
  await store.init()

  const sessions = await store.listSessions()
  if (!sessions.length) {
    console.log('No sessions to export.')
    await store.close()
    return
  }

  const exportsDir = path.join(dataDir, 'exports')
  let count = 0
  for (const s of sessions) {
    const detail = await store.getSession(s.id)
    if (detail) {
      writeSessionExport(detail, exportsDir)
      count++
    }
  }
  await store.close()
  console.log(`Exported ${count} session${count === 1 ? '' : 's'} to ${exportsDir}`)
}

function mergeHooks(existing, manifest) {
  const result = { ...existing }
  if (!result.hooks) result.hooks = {}

  for (const hook of manifest.hooks) {
    const entry = {
      matcher: '',
      hooks: [{ type: 'command', command: `node ${hook.script}` }],
    }
    if (!result.hooks[hook.event]) {
      result.hooks[hook.event] = [entry]
    } else {
      const already = result.hooks[hook.event].some((h) =>
        h.hooks?.some((hh) => hh.command?.includes('agent-observatory'))
      )
      if (!already) result.hooks[hook.event].push(entry)
    }
  }
  return result
}

function cmdInstallHooks() {
  const agent = args.includes('--agent')
    ? args[args.indexOf('--agent') + 1]
    : 'claude-code'

  if (agent !== 'claude-code') {
    console.error(`Unknown agent: ${agent}. Supported: claude-code`)
    process.exit(1)
  }

  const claudeSettings = path.join(os.homedir(), '.claude', 'settings.json')
  let settings = {}
  if (fs.existsSync(claudeSettings)) {
    settings = JSON.parse(fs.readFileSync(claudeSettings, 'utf8'))
    const backup = `${claudeSettings}.backup-${Date.now()}`
    fs.copyFileSync(claudeSettings, backup)
    console.log(`Backed up settings to ${backup}`)
  }

  const manifest = claudeCodeHooks()
  const merged = mergeHooks(settings, manifest)
  fs.mkdirSync(path.dirname(claudeSettings), { recursive: true })
  fs.writeFileSync(claudeSettings, JSON.stringify(merged, null, 2))

  console.log('Hooks installed for Claude Code')
  console.log('Restart Claude Code for hooks to take effect')
}

function cmdUninstallHooks() {
  const claudeSettings = path.join(os.homedir(), '.claude', 'settings.json')
  if (!fs.existsSync(claudeSettings)) {
    console.log('No Claude Code settings found')
    return
  }

  const settings = JSON.parse(fs.readFileSync(claudeSettings, 'utf8'))
  if (settings.hooks) {
    for (const event of Object.keys(settings.hooks)) {
      settings.hooks[event] = settings.hooks[event].filter(
        (h) => !h.hooks?.some((hh) => hh.command?.includes('agent-observatory'))
      )
      if (settings.hooks[event].length === 0) delete settings.hooks[event]
    }
  }
  fs.writeFileSync(claudeSettings, JSON.stringify(settings, null, 2))
  console.log('Agent Observatory hooks removed from Claude Code settings')
}

function printHelp() {
  console.log(`
Agent Observatory — Universal dashboard for coding AI agents

Requires Node.js 22+ (run: nvm use 22)

Usage:
  agent-observatory start              Start the server
  agent-observatory stop               Stop the server
  agent-observatory status             Check server status
  agent-observatory recover [n|id]     Export session to Markdown (default: latest)
  agent-observatory export-all         Export all indexed sessions
  agent-observatory install-hooks      Wire Claude Code hooks
  agent-observatory uninstall-hooks    Remove hooks

Documentation: ${REPO_ROOT}/docs/
`)
}

const commands = {
  start: cmdStart,
  stop: cmdStop,
  status: cmdStatus,
  recover: cmdRecover,
  'export-all': cmdExportAll,
  'install-hooks': cmdInstallHooks,
  'uninstall-hooks': cmdUninstallHooks,
  help: printHelp,
}

if (!command || command === 'help' || command === '--help') {
  printHelp()
} else if (commands[command]) {
  Promise.resolve(commands[command]()).catch((err) => {
    console.error('Error:', err.message)
    process.exit(1)
  })
} else {
  console.error(`Unknown command: ${command}`)
  printHelp()
  process.exit(1)
}
