/**
 * Parse a single JSONL line from Claude Code session files.
 * @param {string} line
 * @returns {object|null}
 */
export function parseJsonlLine(line) {
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
}

/**
 * Extract a ToolEvent from a parsed JSONL entry.
 * @param {object} entry
 * @param {string} sessionId
 * @returns {import('@agent-observatory/core').ToolEvent|null}
 */
export function extractToolEvent(entry, sessionId) {
  if (entry.type !== 'assistant') return null

  const content = entry.message?.content
  if (!Array.isArray(content)) return null

  const toolUse = content.find((c) => c.type === 'tool_use')
  if (!toolUse) return null

  const inputStr = JSON.stringify(toolUse.input || {})
  return {
    id: toolUse.id || `${Date.now()}`,
    sessionId,
    timestamp: entry.timestamp || new Date().toISOString(),
    tool: toolUse.name || 'unknown',
    inputSummary: inputStr.slice(0, 200),
  }
}

/**
 * Extract token usage from an assistant message.
 * @param {object} entry
 * @returns {import('@agent-observatory/core').TokenUsage|null}
 */
export function extractTokenUsage(entry) {
  const usage = entry.usage || entry.message?.usage
  if (!usage) return null

  return {
    input: usage.input_tokens || usage.input || 0,
    output: usage.output_tokens || usage.output || 0,
    cacheRead: usage.cache_read_input_tokens || usage.cache_read || 0,
    cacheWrite: usage.cache_creation_input_tokens || usage.cache_write || 0,
  }
}
