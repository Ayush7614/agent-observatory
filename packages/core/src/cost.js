/**
 * Model pricing for API-equivalent cost estimation.
 * Prices in USD per 1M tokens. Updated periodically.
 * Subscription users don't pay per-token — this is a usage proxy only.
 */

export const MODEL_PRICES = Object.freeze({
  'claude-opus-4-6': { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  'claude-opus-4-5': { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  'claude-sonnet-4-6': { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  'claude-sonnet-4-5': { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  'claude-haiku-4-5': { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 },
  'gpt-4o': { input: 2.5, output: 10, cacheRead: 1.25, cacheWrite: 0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6, cacheRead: 0.075, cacheWrite: 0 },
  'o3': { input: 10, output: 40, cacheRead: 2.5, cacheWrite: 0 },
  default: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
})

/**
 * Estimate cost in USD from token usage.
 * @param {import('./types.js').TokenUsage} usage
 * @param {string} [model]
 * @returns {number}
 */
export function estimateCost(usage, model = 'default') {
  const prices = MODEL_PRICES[model] || MODEL_PRICES.default
  const inputCost = (usage.input / 1_000_000) * prices.input
  const outputCost = (usage.output / 1_000_000) * prices.output
  const cacheReadCost = (usage.cacheRead / 1_000_000) * prices.cacheRead
  const cacheWriteCost = (usage.cacheWrite / 1_000_000) * prices.cacheWrite
  return Math.round((inputCost + outputCost + cacheReadCost + cacheWriteCost) * 10000) / 10000
}
