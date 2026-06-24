/**
 * Universal type definitions for Agent Observatory.
 * All adapters normalize their agent-specific data into these shapes.
 */

/** @typedef {'active'|'idle'|'completed'|'crashed'} SessionStatus */
export const SESSION_STATUS = Object.freeze({
  ACTIVE: 'active',
  IDLE: 'idle',
  COMPLETED: 'completed',
  CRASHED: 'crashed',
})

/** @typedef {'thinking'|'running'|'waiting'|'idle'|'crashed'} AgentState */
export const AGENT_STATE = Object.freeze({
  THINKING: 'thinking',
  RUNNING: 'running',
  WAITING: 'waiting',
  IDLE: 'idle',
  CRASHED: 'crashed',
})

/** Core event types emitted on the event bus */
export const EVENT_TYPES = Object.freeze({
  SESSION_UPDATED: 'session:updated',
  SESSION_CREATED: 'session:created',
  MESSAGE_ADDED: 'message:added',
  TOOL_EXECUTED: 'tool:executed',
  AGENT_STATE: 'agent:state',
  BUDGET_WARNING: 'budget:warning',
  BUDGET_EXCEEDED: 'budget:exceeded',
  APPROVAL_REQUESTED: 'approval:requested',
  APPROVAL_RESOLVED: 'approval:resolved',
})

/**
 * @typedef {Object} TokenUsage
 * @property {number} input
 * @property {number} output
 * @property {number} cacheRead
 * @property {number} cacheWrite
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} agentId
 * @property {string} [projectPath]
 * @property {string} [projectName]
 * @property {string} startedAt
 * @property {string} updatedAt
 * @property {string} [model]
 * @property {SessionStatus} status
 * @property {TokenUsage} tokenUsage
 * @property {number} contextPercent
 * @property {number} estimatedCostUsd
 * @property {number} messageCount
 * @property {number} toolCallCount
 * @property {string} [sourceFile]
 * @property {number} [sourceMtime]
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} sessionId
 * @property {'user'|'assistant'|'system'} role
 * @property {string} content
 * @property {string} timestamp
 * @property {TokenUsage} [usage]
 */

/**
 * @typedef {Object} ToolEvent
 * @property {string} id
 * @property {string} sessionId
 * @property {string} timestamp
 * @property {string} tool
 * @property {string} [inputSummary]
 * @property {string} [outputSummary]
 * @property {number} [linesAdded]
 * @property {number} [linesRemoved]
 * @property {number} [durationMs]
 * @property {number} [exitCode]
 */

/**
 * @typedef {Object} SessionDetail
 * @property {Session} session
 * @property {Message[]} messages
 * @property {ToolEvent[]} toolEvents
 */

/**
 * @typedef {Object} AgentAdapter
 * @property {string} id
 * @property {string} name
 * @property {string} version
 * @property {(config: object, eventBus: import('./events.js').EventBus) => Promise<void>} start
 * @property {() => Promise<void>} stop
 * @property {() => Promise<Session[]>} listSessions
 * @property {(id: string) => Promise<SessionDetail>} getSession
 * @property {() => import('./types.js').HookManifest} getHookManifest
 * @property {(raw: unknown) => ToolEvent|null} parseHookPayload
 */

/**
 * @typedef {Object} HookDefinition
 * @property {string} event - e.g. 'PostToolUse', 'Notification', 'PreToolUse'
 * @property {string} script - Absolute path to hook script
 */

/**
 * @typedef {Object} HookManifest
 * @property {HookDefinition[]} hooks
 */

/**
 * Create a empty token usage object.
 * @returns {TokenUsage}
 */
export function emptyTokenUsage() {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
}

/**
 * Generate a unique event ID.
 * @returns {string}
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
