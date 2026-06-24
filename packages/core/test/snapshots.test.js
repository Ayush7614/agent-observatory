import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { SessionStore } from '../src/store.js'
import { snapshotActiveSessions } from '../src/snapshots.js'
import { emptyTokenUsage } from '../src/types.js'

describe('snapshots', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-snapshot-test-'))
  /** @type {SessionStore} */
  let store

  before(async () => {
    store = new SessionStore(tmpDir)
    await store.init()
  })

  after(async () => {
    await store.close()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('writes snapshot files for recent active sessions', async () => {
    await store.upsertSession({
      id: 'snap-sess-1',
      agentId: 'claude-code',
      projectName: 'snap-test',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      tokenUsage: emptyTokenUsage(),
      contextPercent: 0,
      estimatedCostUsd: 0,
      messageCount: 1,
      toolCallCount: 0,
    })

    await store.insertMessage({
      id: 'snap-msg-1',
      sessionId: 'snap-sess-1',
      role: 'user',
      content: 'hello snapshot',
      timestamp: new Date().toISOString(),
    })

    const snapshotsDir = path.join(tmpDir, 'snapshots')
    const results = await snapshotActiveSessions(store, snapshotsDir)

    assert.equal(results.length, 1)
    assert.ok(results[0].filename.startsWith('snapshot-'))
    assert.ok(fs.existsSync(results[0].filepath))
    assert.match(fs.readFileSync(results[0].filepath, 'utf8'), /hello snapshot/)
  })
})
