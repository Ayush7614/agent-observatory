/**
 * Session export to Markdown — used by CLI recover and dashboard export.
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
  return String(name || 'session')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'session'
}

/**
 * @param {string} iso
 * @returns {string}
 */
function fmt(iso) {
  try {
    return new Date(iso).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  } catch {
    return iso || '—'
  }
}

/**
 * @param {import('./types.js').SessionDetail} detail
 * @returns {string}
 */
export function sessionToMarkdown(detail) {
  const { session, messages = [], toolEvents = [] } = detail
  const tokens = session.tokenUsage || {}
  const exportedAt = new Date().toISOString()

  const lines = [
    `# Session Export — ${session.projectName || 'Unknown project'}`,
    '',
    '> Exported by Agent Observatory for session recovery.',
    '',
    '## Session info',
    '',
    `| Field | Value |`,
    `| --- | --- |`,
    `| **Session ID** | \`${session.id}\` |`,
    `| **Agent** | ${session.agentId} |`,
    `| **Model** | ${session.model || 'unknown'} |`,
    `| **Project** | ${session.projectPath || session.projectName || '—'} |`,
    `| **Status** | ${session.status} |`,
    `| **Started** | ${fmt(session.startedAt)} |`,
    `| **Last updated** | ${fmt(session.updatedAt)} |`,
    `| **Messages** | ${session.messageCount ?? messages.length} |`,
    `| **Tool calls** | ${session.toolCallCount ?? toolEvents.length} |`,
    `| **Tokens (in/out)** | ${tokens.input ?? 0} / ${tokens.output ?? 0} |`,
    `| **Est. cost (USD)** | ${session.estimatedCostUsd ?? 0} |`,
    `| **Exported at** | ${fmt(exportedAt)} |`,
    '',
    '---',
    '',
    '## Transcript',
    '',
  ]

  /** @type {Array<{kind: 'message'|'tool', ts: string, data: object}>} */
  const timeline = [
    ...messages.map((m) => ({ kind: /** @type {const} */ ('message'), ts: m.timestamp, data: m })),
    ...toolEvents.map((t) => ({ kind: /** @type {const} */ ('tool'), ts: t.timestamp, data: t })),
  ].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())

  if (timeline.length === 0) {
    lines.push('_No messages or tool calls indexed for this session._', '')
  } else {
    for (const item of timeline) {
      if (item.kind === 'message') {
        const m = /** @type {import('./types.js').Message} */ (item.data)
        const role = m.role.charAt(0).toUpperCase() + m.role.slice(1)
        lines.push(`### ${role} — ${fmt(m.timestamp)}`, '')
        lines.push(m.content || '_(empty)_', '')
      } else {
        const t = /** @type {import('./types.js').ToolEvent} */ (item.data)
        lines.push(`### Tool: ${t.tool} — ${fmt(t.timestamp)}`, '')
        if (t.inputSummary) lines.push(`**Input:** \`${t.inputSummary}\``, '')
        if (t.outputSummary) {
          lines.push('', '**Output:**', '', '```', t.outputSummary, '```', '')
        }
        const stats = []
        if (t.linesAdded) stats.push(`+${t.linesAdded} lines`)
        if (t.linesRemoved) stats.push(`-${t.linesRemoved} lines`)
        if (t.durationMs != null) stats.push(`${t.durationMs}ms`)
        if (t.exitCode != null) stats.push(`exit ${t.exitCode}`)
        if (stats.length) lines.push(`_${stats.join(' · ')}_`, '')
      }
      lines.push('')
    }
  }

  lines.push('---', '', '## Recovery prompt', '', 'Paste the following into a new agent session:', '')
  lines.push(
    '```',
    `Continue this coding session. Context exported from Agent Observatory.`,
    `Project: ${session.projectName || session.projectPath || 'unknown'}`,
    `Previous session ID: ${session.id}`,
    `Last updated: ${fmt(session.updatedAt)}`,
    'Review the transcript above and pick up where we left off.',
    '```',
    ''
  )

  return lines.join('\n')
}

/**
 * @param {import('./types.js').SessionDetail} detail
 * @returns {string}
 */
export function buildExportFilename(detail) {
  const date = (detail.session.updatedAt || detail.session.startedAt || new Date().toISOString()).slice(
    0,
    10
  )
  const shortId = detail.session.id.slice(0, 8)
  return `${slugify(detail.session.projectName)}-${date}-${shortId}.md`
}

/**
 * @param {import('./types.js').SessionDetail} detail
 * @param {string} exportsDir
 * @param {{ prefix?: string }} [options]
 * @returns {{ filepath: string, filename: string, markdown: string }}
 */
export function writeSessionExport(detail, exportsDir, options = {}) {
  const markdown = sessionToMarkdown(detail)
  const filename = `${options.prefix || ''}${buildExportFilename(detail)}`
  fs.mkdirSync(exportsDir, { recursive: true, mode: 0o700 })
  const filepath = path.join(exportsDir, filename)
  fs.writeFileSync(filepath, markdown, { encoding: 'utf8', mode: 0o600 })
  return { filepath, filename, markdown }
}

/**
 * Resolve session by 1-based index, id prefix, or "last".
 * @param {import('./store.js').SessionStore} store
 * @param {string} [ref]
 * @returns {Promise<import('./types.js').Session|null>}
 */
export async function resolveSessionRef(store, ref = '1') {
  const sessions = await store.listSessions()
  if (!sessions.length) return null

  const key = String(ref || '1').trim().toLowerCase()
  if (!key || key === '1' || key === 'last' || key === 'latest') {
    return sessions[0]
  }

  const index = Number(key)
  if (Number.isInteger(index) && index >= 1 && index <= sessions.length) {
    return sessions[index - 1]
  }

  const exact = sessions.find((s) => s.id === ref)
  if (exact) return exact

  const matches = sessions.filter((s) => s.id.startsWith(ref))
  if (matches.length === 1) return matches[0]

  return null
}
