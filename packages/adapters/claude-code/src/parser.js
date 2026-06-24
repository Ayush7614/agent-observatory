/**
 * Parse a single JSONL line from Claude Code session files.
 */

/**
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
 * Extract plain text from message content (string or array).
 * @param {unknown} content
 * @returns {string}
 */
export function extractTextContent(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''

  return content
    .filter((block) => block?.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n')
    .trim()
}

/**
 * @param {object} entry
 * @param {string} sessionId
 * @returns {import('@agent-observatory/core').Message|null}
 */
export function extractMessage(entry, sessionId) {
  if (entry.type !== 'user' && entry.type !== 'assistant') return null
  if (!entry.message?.role) return null

  const content = extractTextContent(entry.message.content)
  if (!content) return null

  const usage = extractTokenUsage(entry)

  return {
    id: entry.uuid || entry.message?.id || `${sessionId}-${entry.timestamp}`,
    sessionId,
    role: entry.message.role,
    content: content.slice(0, 10000),
    timestamp: entry.timestamp || new Date().toISOString(),
    usage: usage || undefined,
  }
}

/**
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
 * @param {object} entry
 * @returns {import('@agent-observatory/core').TokenUsage|null}
 */
export function extractTokenUsage(entry) {
  const usage = entry.message?.usage || entry.usage
  if (!usage) return null

  return {
    input: usage.input_tokens || usage.input || 0,
    output: usage.output_tokens || usage.output || 0,
    cacheRead: usage.cache_read_input_tokens || usage.cache_read || 0,
    cacheWrite: usage.cache_creation_input_tokens || usage.cache_write || 0,
  }
}

/**
 * @param {object} entry
 * @returns {string|null}
 */
export function extractModel(entry) {
  if (entry.type !== 'assistant') return null
  return entry.message?.model || null
}

/**
 * @param {object} entry
 * @returns {string|null}
 */
export function extractCwd(entry) {
  return entry.cwd || null
}

/**
 * Aggregate token totals from multiple usage objects.
 * @param {import('@agent-observatory/core').TokenUsage[]} usages
 */
export function aggregateTokenUsage(usages) {
  return usages.reduce(
    (acc, u) => ({
      input: acc.input + (u.input || 0),
      output: acc.output + (u.output || 0),
      cacheRead: acc.cacheRead + (u.cacheRead || 0),
      cacheWrite: acc.cacheWrite + (u.cacheWrite || 0),
    }),
    { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  )
}
