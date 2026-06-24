/**
 * Wire event bus → session store for hook events.
 */

import { EVENT_TYPES } from '@agent-observatory/core'

/**
 * @param {import('@agent-observatory/core').EventBus} eventBus
 * @param {import('@agent-observatory/core').SessionStore} store
 */
export function wirePersistence(eventBus, store) {
  eventBus.on(EVENT_TYPES.TOOL_EXECUTED, async (event) => {
    try {
      await store.insertToolEvent(event)
    } catch (err) {
      console.warn('[persistence] tool event:', err.message)
    }
  })
}
