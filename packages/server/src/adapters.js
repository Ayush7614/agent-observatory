/**
 * Adapter manager — loads and orchestrates all enabled agent adapters.
 */

import * as claudeCode from '@agent-observatory/adapter-claude-code'

const BUILTIN_ADAPTERS = [claudeCode]

export class AdapterManager {
  /** @type {Map<string, object>} */
  #active = new Map()

  /**
   * @param {object} config
   * @param {import('@agent-observatory/core').EventBus} eventBus
   * @param {import('@agent-observatory/core').SessionStore} store
   */
  constructor(config, eventBus, store) {
    this.config = config
    this.eventBus = eventBus
    this.store = store
  }

  async startAll() {
    for (const adapter of BUILTIN_ADAPTERS) {
      const agentConfig = {
        ...(this.config.agents?.[adapter.id] || {}),
        dataDir: this.config.dataDir,
      }
      if (agentConfig.enabled === false) {
        console.log(`[adapters] Skipping disabled adapter: ${adapter.id}`)
        continue
      }
      try {
        await adapter.start(agentConfig, this.eventBus, this.store)
        this.#active.set(adapter.id, adapter)
        console.log(`[adapters] Started: ${adapter.name}`)
      } catch (err) {
        console.error(`[adapters] Failed to start ${adapter.id}:`, err.message)
      }
    }
  }

  async stopAll() {
    for (const [id, adapter] of this.#active) {
      try {
        await adapter.stop()
        console.log(`[adapters] Stopped: ${id}`)
      } catch (err) {
        console.error(`[adapters] Error stopping ${id}:`, err.message)
      }
    }
    this.#active.clear()
  }

  /** @returns {object|null} */
  get(id) {
    return this.#active.get(id) || null
  }

  /** @returns {object[]} */
  list() {
    return [...this.#active.values()]
  }
}
