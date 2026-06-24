import { EVENT_TYPES } from './types.js'

/**
 * Simple in-process pub/sub event bus.
 * Used to fan out events from adapters → store → SSE clients.
 */
export class EventBus {
  /** @type {Map<string, Set<Function>>} */
  #listeners = new Map()

  /**
   * Subscribe to an event type.
   * @param {string} type
   * @param {(data: unknown) => void} handler
   * @returns {() => void} Unsubscribe function
   */
  on(type, handler) {
    if (!this.#listeners.has(type)) {
      this.#listeners.set(type, new Set())
    }
    this.#listeners.get(type).add(handler)
    return () => this.#listeners.get(type)?.delete(handler)
  }

  /**
   * Emit an event to all subscribers.
   * @param {string} type
   * @param {unknown} data
   */
  emit(type, data) {
    const handlers = this.#listeners.get(type)
    if (!handlers) return
    for (const handler of handlers) {
      try {
        handler(data)
      } catch (err) {
        console.error(`[eventbus] Handler error for ${type}:`, err.message)
      }
    }
  }

  /** Subscribe to all event types (for SSE fan-out). */
  onAny(handler) {
    const types = Object.values(EVENT_TYPES)
    const unsubs = types.map((t) => this.on(t, (data) => handler(t, data)))
    return () => unsubs.forEach((u) => u())
  }
}
