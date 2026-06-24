import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseJsonlLine, extractToolEvent, extractTokenUsage } from '../src/parser.js'

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

  it('extracts token usage', () => {
    const entry = {
      usage: { input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: 500 },
    }
    const usage = extractTokenUsage(entry)
    assert.equal(usage.input, 1000)
    assert.equal(usage.output, 200)
    assert.equal(usage.cacheRead, 500)
  })
})
