/**
 * Parse Claude Code hook payloads into normalized Observatory events.
 * Schema: https://code.claude.com/docs/en/hooks
 */

import { generateId } from '@agent-observatory/core'
import path from 'node:path'

/**
 * @param {unknown} payload
 * @returns {Record<string, unknown>}
 */
function asObject(payload) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return /** @type {Record<string, unknown>} */ (payload)
  }
  return {}
}

/**
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
export function extractSessionId(data) {
  if (data.session_id) return String(data.session_id)
  if (data.sessionId) return String(data.sessionId)

  const transcript = data.transcript_path ? String(data.transcript_path) : ''
  if (transcript) {
    const base = path.basename(transcript, '.jsonl')
    if (base) return base
  }

  return 'unknown'
}

/**
 * @param {unknown} toolInput
 * @returns {string}
 */
export function summarizeToolInput(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') {
    return typeof toolInput === 'string' ? toolInput.slice(0, 200) : ''
  }

  const input = /** @type {Record<string, unknown>} */ (toolInput)
  if (typeof input.file_path === 'string') return input.file_path
  if (typeof input.command === 'string') return input.command.slice(0, 200)
  if (typeof input.pattern === 'string') return input.pattern
  if (typeof input.query === 'string') return input.query.slice(0, 200)
  if (typeof input.path === 'string') return input.path

  return JSON.stringify(input).slice(0, 200)
}

/**
 * @param {string} hookType
 * @param {unknown} payload
 * @returns {import('@agent-observatory/core').ToolEvent|null}
 */
export function parseToolHook(hookType, payload) {
  const normalized = hookType.replace(/_/g, '-').toLowerCase()
  if (normalized !== 'post-tool-use' && normalized !== 'tool-use') return null

  const data = asObject(payload)
  const toolInput = data.tool_input ?? data.input ?? data.toolInput

  return {
    id: String(data.tool_use_id || data.toolUseId || generateId()),
    sessionId: extractSessionId(data),
    timestamp: new Date().toISOString(),
    tool: String(data.tool_name || data.tool || 'unknown'),
    inputSummary: summarizeToolInput(toolInput),
    outputSummary: data.tool_response
      ? JSON.stringify(data.tool_response).slice(0, 500)
      : undefined,
  }
}

/**
 * @param {unknown} payload
 * @returns {{ sessionId: string, state: string, message?: string }|null}
 */
export function parseNotifyHook(payload) {
  const data = asObject(payload)
  const message = data.message || data.notification || data.title

  return {
    sessionId: extractSessionId(data),
    state: 'waiting',
    message: message ? String(message).slice(0, 500) : 'Claude Code needs your attention',
  }
}

/**
 * @param {string} hookType
 * @param {unknown} payload
 * @returns {import('@agent-observatory/core').ToolEvent|null}
 */
export function parseHookPayload(hookType, payload) {
  return parseToolHook(hookType, payload)
}
