import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseJsonlLine,
  extractToolEvent,
  extractTokenUsage,
  extractMessage,
  extractModel,
  extractTextContent,
} from '../src/parser.js'

describe('Claude Code JSONL parser', () => {
  it('parses valid JSONL', () => {
    const line = '{"type":"user","message":{"role":"user","content":"hello"}}'
    const result = parseJsonlLine(line)
    assert.equal(result.type, 'user')
  })

  it('returns null for invalid JSON', () => {
    assert.equal(parseJsonlLine('not json'), null)
  })

  it('extracts tool use events', () => {
    const entry = {
      type: 'assistant',
      timestamp: '2026-06-24T12:00:00Z',
      message: {
        content: [
          { type: 'tool_use', id: 'tu_1', name: 'Read', input: { file_path: '/test.ts' } },
        ],
      },
    }
    const event = extractToolEvent(entry, 'session-123')
    assert.ok(event)
    assert.equal(event.tool, 'Read')
    assert.equal(event.sessionId, 'session-123')
  })

  it('extracts user messages', () => {
    const entry = {
      type: 'user',
      uuid: 'u1',
      timestamp: '2026-06-24T10:00:00Z',
      message: { role: 'user', content: 'hello world' },
    }
    const msg = extractMessage(entry, 'sess-1')
    assert.ok(msg)
    assert.equal(msg.role, 'user')
    assert.equal(msg.content, 'hello world')
  })

  it('extracts model from assistant entry', () => {
    const entry = {
      type: 'assistant',
      message: { model: 'claude-opus-4-6', role: 'assistant', content: [] },
    }
    assert.equal(extractModel(entry), 'claude-opus-4-6')
  })

  it('extracts text from content blocks', () => {
    const text = extractTextContent([
      { type: 'text', text: 'Hello' },
      { type: 'tool_use', name: 'Read' },
    ])
    assert.equal(text, 'Hello')
  })
})
