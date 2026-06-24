import { estimateCost } from './cost.js'

/**
 * Compute aggregate statistics for a time window.
 * @param {import('./types.js').Session[]} sessions
 * @param {import('./types.js').ToolEvent[]} [toolEvents]
 * @returns {object}
 */
export function computeStats(sessions, toolEvents = []) {
  let totalInput = 0
  let totalOutput = 0
  let totalCost = 0

  for (const s of sessions) {
    totalInput += s.tokenUsage?.input || 0
    totalOutput += s.tokenUsage?.output || 0
    totalCost += s.estimatedCostUsd || 0
  }

  return {
    sessionCount: sessions.length,
    toolCallCount: toolEvents.length || sessions.reduce((n, s) => n + (s.toolCallCount || 0), 0),
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalCostUsd: Math.round(totalCost * 100) / 100,
  }
}

/**
 * Compute usage burn rate (% per hour).
 * @param {Array<{timestamp: string, contextPercent: number}>} history
 * @returns {number|null}
 */
export function computeBurnRate(history) {
  if (history.length < 2) return null

  const first = history[0]
  const last = history[history.length - 1]
  const hours =
    (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) /
    (1000 * 60 * 60)

  if (hours <= 0) return null
  return Math.round(((last.contextPercent - first.contextPercent) / hours) * 10) / 10
}

/**
 * Re-export for convenience in analytics pipelines.
 */
export { estimateCost }
