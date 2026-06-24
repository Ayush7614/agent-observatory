import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { SessionStore } from '../src/store.js'
import { SearchIndex } from '../src/search.js'
import { emptyTokenUsage } from '../src/types.js'

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-store-test-'))

describe('SessionStore', () => {
  /** @type {SessionStore} */
  let store
  /** @type {SearchIndex} */
  let search

  before(async () => {
    store = new SessionStore(tmpDir)
    await store.init()
    search = new SearchIndex(store)
  })

  after(async () => {
    await store.close()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('upserts and retrieves a session', async () => {
    const session = {
      id: 'sess-1',
      agentId: 'claude-code',
      projectPath: '/tmp/project',
      projectName: 'my-app',
      startedAt: '2026-06-24T10:00:00Z',
      updatedAt: '2026-06-24T10:05:00Z',
      model: 'claude-opus-4-6',
      status: 'active',
      tokenUsage: { input: 1000, output: 200, cacheRead: 500, cacheWrite: 0 },
      contextPercent: 35,
      estimatedCostUsd: 0.42,
      messageCount: 2,
      toolCallCount: 1,
    }

    await store.upsertSession(session)
    const listed = await store.listSessions()
    assert.equal(listed.length, 1)
    assert.equal(listed[0].id, 'sess-1')
    assert.equal(listed[0].model, 'claude-opus-4-6')
    assert.equal(listed[0].tokenUsage.input, 1000)
  })

  it('inserts messages and tool events', async () => {
    await store.insertMessage({
      id: 'msg-1',
      sessionId: 'sess-1',
      role: 'user',
      content: 'fix the authentication bug in login.ts',
      timestamp: '2026-06-24T10:01:00Z',
    })

    await store.insertToolEvent({
      id: 'tool-1',
      sessionId: 'sess-1',
      timestamp: '2026-06-24T10:02:00Z',
      tool: 'Read',
      inputSummary: 'src/login.ts',
    })

    const detail = await store.getSession('sess-1')
    assert.ok(detail)
    assert.equal(detail.messages.length, 1)
    assert.equal(detail.toolEvents.length, 1)
    assert.equal(detail.toolEvents[0].tool, 'Read')
  })

  it('full-text search finds indexed content', async () => {
    const results = await search.search('authentication')
    assert.ok(results.length >= 1)
    assert.equal(results[0].sessionId, 'sess-1')
    assert.match(results[0].snippet, /authentication/i)
  })

  it('filters sessions by agent', async () => {
    await store.upsertSession({
      id: 'sess-2',
      agentId: 'aider',
      startedAt: '2026-06-24T11:00:00Z',
      updatedAt: '2026-06-24T11:00:00Z',
      status: 'active',
      tokenUsage: emptyTokenUsage(),
      contextPercent: 0,
      estimatedCostUsd: 0,
      messageCount: 0,
      toolCallCount: 0,
    })

    const claudeSessions = await store.listSessions({ agentId: 'claude-code' })
    assert.equal(claudeSessions.length, 1)
    assert.equal(claudeSessions[0].agentId, 'claude-code')
  })
})
