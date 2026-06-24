import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  extractSessionId,
  summarizeToolInput,
  parseToolHook,
  parseNotifyHook,
} from '../src/hooks.js'

describe('Claude Code hook parser', () => {
  it('extracts session id from transcript_path', () => {
    const id = extractSessionId({
      transcript_path: '/Users/me/.claude/projects/foo/abc123.jsonl',
    })
    assert.equal(id, 'abc123')
  })

  it('summarizes tool_input file_path', () => {
    assert.equal(
      summarizeToolInput({ file_path: '/repo/src/app.ts' }),
      '/repo/src/app.ts'
    )
  })

  it('parses PostToolUse payload', () => {
    const event = parseToolHook('post-tool-use', {
      session_id: 'sess-1',
      tool_name: 'Read',
      tool_input: { file_path: 'src/index.ts' },
      tool_response: { success: true },
    })
    assert.ok(event)
    assert.equal(event.sessionId, 'sess-1')
    assert.equal(event.tool, 'Read')
    assert.equal(event.inputSummary, 'src/index.ts')
  })

  it('parses Notification payload', () => {
    const note = parseNotifyHook({
      session_id: 'sess-2',
      message: 'Waiting for permission',
    })
    assert.ok(note)
    assert.equal(note.sessionId, 'sess-2')
    assert.equal(note.state, 'waiting')
  })
})
