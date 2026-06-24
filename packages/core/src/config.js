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
