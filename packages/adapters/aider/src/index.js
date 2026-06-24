/**
 * Aider adapter — planned for v0.2.
 * See docs/ADAPTERS.md
 */

export const id = 'aider'
export const name = 'Aider'
export const version = '0.0.1'

export async function start() {
  console.log('[aider] Adapter not yet implemented — coming in v0.2')
}

export async function stop() {}
export async function listSessions() { return [] }
export async function getSession() { return null }
export function getHookManifest() { return { hooks: [] } }
export function parseHookPayload() { return null }
