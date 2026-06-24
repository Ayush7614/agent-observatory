import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const DEFAULT_CONFIG = {
  port: 7420,
  host: '127.0.0.1',
  bindLan: false,
  dataDir: '~/.agent-observatory',
  openBrowser: true,
  theme: 'dark',
  agents: {},
  budgets: {},
  notifications: {},
  approvals: {},
  search: {},
  dashboard: {},
  security: {},
}

/**
 * Expand ~ to home directory.
 * @param {string} p
 * @returns {string}
 */
export function resolvePath(p) {
  if (!p) return p
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2))
  if (p === '~') return os.homedir()
  return p
}

/**
 * Get the data directory, creating it if needed.
 * @param {object} config
 * @returns {string}
 */
export function getDataDir(config) {
  const dir = resolvePath(config?.dataDir || DEFAULT_CONFIG.dataDir)
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  return dir
}

/**
 * Deep merge two objects.
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      result[key] = deepMerge(target[key], source[key])
    } else if (source[key] !== undefined) {
      result[key] = source[key]
    }
  }
  return result
}

/**
 * Load configuration from file, merging with defaults.
 * @param {string} [configPath]
 * @returns {object}
 */
export function loadConfig(configPath) {
  const resolved =
    configPath ||
    process.env.AO_CONFIG ||
    path.join(os.homedir(), '.agent-observatory', 'config.json')

  let userConfig = {}
  if (fs.existsSync(resolved)) {
    try {
      userConfig = JSON.parse(fs.readFileSync(resolved, 'utf8'))
    } catch (err) {
      console.warn(`[config] Failed to parse ${resolved}: ${err.message}`)
    }
  }

  const config = deepMerge(DEFAULT_CONFIG, userConfig)

  // Environment overrides
  if (process.env.AO_PORT) config.port = Number(process.env.AO_PORT)
  if (process.env.AO_HOST) config.host = process.env.AO_HOST
  if (process.env.AO_DATA_DIR) config.dataDir = process.env.AO_DATA_DIR

  return config
}

/** Editable settings shape exposed to the dashboard. */
export function toSettingsView(config, configPath) {
  return {
    configPath: configPath || null,
    port: config.port ?? 7420,
    theme: config.theme ?? 'dark',
    dataDir: config.dataDir ?? '~/.agent-observatory',
    budgets: {
      session: config.budgets?.session ?? 50,
      day: config.budgets?.day ?? 200,
      week: config.budgets?.week ?? 800,
      currency: config.budgets?.currency ?? 'USD',
    },
    agents: {
      'claude-code': {
        enabled: config.agents?.['claude-code']?.enabled !== false,
        snapshotMinutes: config.agents?.['claude-code']?.snapshotMinutes ?? 5,
        watchDir: config.agents?.['claude-code']?.watchDir ?? '~/.claude/projects',
      },
    },
    notifications: {
      desktop: config.notifications?.desktop !== false,
      onBudgetWarning: config.notifications?.onBudgetWarning !== false,
      onBudgetExceeded: config.notifications?.onBudgetExceeded !== false,
      onAgentWaiting: config.notifications?.onAgentWaiting !== false,
      onSessionComplete: config.notifications?.onSessionComplete !== false,
    },
    search: {
      maxResults: config.search?.maxResults ?? 50,
    },
  }
}

/**
 * Merge dashboard settings patch into config (allowlisted keys only).
 * @param {object} config
 * @param {object} patch
 * @returns {{ config: object, requiresRestart: boolean }}
 */
export function patchConfig(config, patch) {
  const next = deepMerge(config, {})
  let requiresRestart = false

  if (patch.port != null) {
    const port = Number(patch.port)
    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      throw new Error('Port must be an integer between 1024 and 65535')
    }
    if (port !== config.port) requiresRestart = true
    next.port = port
  }

  if (patch.theme != null) {
    if (!['dark', 'light', 'oled'].includes(patch.theme)) {
      throw new Error('Theme must be dark, light, or oled')
    }
    next.theme = patch.theme
  }

  if (patch.budgets) {
    next.budgets = next.budgets || {}
    for (const key of ['session', 'day', 'week']) {
      if (patch.budgets[key] != null) {
        const val = Number(patch.budgets[key])
        if (Number.isNaN(val) || val < 0) throw new Error(`Invalid budget.${key}`)
        next.budgets[key] = val
      }
    }
    if (patch.budgets.currency != null) {
      next.budgets.currency = String(patch.budgets.currency)
    }
  }

  if (patch.agents?.['claude-code']) {
    next.agents = next.agents || {}
    const prevMins = config.agents?.['claude-code']?.snapshotMinutes ?? 5
    next.agents['claude-code'] = {
      ...(next.agents['claude-code'] || {}),
      ...patch.agents['claude-code'],
    }
    const mins = next.agents['claude-code'].snapshotMinutes
    if (mins != null) {
      const n = Number(mins)
      if (!Number.isInteger(n) || n < 0 || n > 1440) {
        throw new Error('snapshotMinutes must be 0–1440 (0 disables snapshots)')
      }
      next.agents['claude-code'].snapshotMinutes = n
      if (n !== prevMins) requiresRestart = true
    }
    if (
      patch.agents['claude-code'].enabled != null &&
      patch.agents['claude-code'].enabled !== config.agents?.['claude-code']?.enabled
    ) {
      requiresRestart = true
    }
  }

  if (patch.notifications) {
    next.notifications = { ...(next.notifications || {}), ...patch.notifications }
  }

  if (patch.search?.maxResults != null) {
    const n = Number(patch.search.maxResults)
    if (!Number.isInteger(n) || n < 1 || n > 500) {
      throw new Error('search.maxResults must be 1–500')
    }
    next.search = { ...(next.search || {}), maxResults: n }
  }

  return { config: next, requiresRestart }
}

/**
 * Resolve default config file path.
 * @returns {string}
 */
export function getConfigPath() {
  return (
    process.env.AO_CONFIG ||
    path.join(os.homedir(), '.agent-observatory', 'config.json')
  )
}

/**
 * Save configuration to disk.
 * @param {object} config
 * @param {string} [configPath]
 */
export function saveConfig(config, configPath) {
  const resolved =
    configPath ||
    process.env.AO_CONFIG ||
    path.join(os.homedir(), '.agent-observatory', 'config.json')

  const dir = path.dirname(resolved)
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  fs.writeFileSync(resolved, JSON.stringify(config, null, 2), { mode: 0o600 })
}
