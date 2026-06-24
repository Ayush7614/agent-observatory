/**
 * Generic log adapter — planned for v0.2.
 * User-configured JSON/regex parsers for any agent.
 * See docs/ADAPTERS.md
 */

export const id = 'generic'
export const name = 'Generic Log Adapter'
export const version = '0.0.1'

export async function start() {
  console.log('[generic] Adapter not yet implemented — coming in v0.2')
}

export async function stop() {}
export async function listSessions() { return [] }
export async function getSession() { return null }
export function getHookManifest() { return { hooks: [] } }
export function parseHookPayload() { return null }
