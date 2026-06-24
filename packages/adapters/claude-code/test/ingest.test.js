import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SessionStore, EventBus } from '@agent-observatory/core'
import * as adapter from '../src/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureSrc = path.join(__dirname, 'fixtures', 'sample.jsonl')

describe('Claude Code ingestion', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-ingest-'))
  const watchDir = path.join(tmpDir, 'projects', 'my-app')
  const dataDir = path.join(tmpDir, 'data')
  const fixtureDest = path.join(watchDir, 'test-session-1.jsonl')

  /** @type {SessionStore} */
  let store

  before(async () => {
    fs.mkdirSync(watchDir, { recursive: true })
    fs.copyFileSync(fixtureSrc, fixtureDest)

    store = new SessionStore(dataDir)
    await store.init()

    const bus = new EventBus()
    await adapter.start({ watchDir, dataDir }, bus, store)
  })

  after(async () => {
    await adapter.stop()
    await store.close()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('indexes sessions from JSONL files', async () => {
    const sessions = await store.listSessions({ agentId: 'claude-code' })
    assert.ok(sessions.length >= 1)

    const session = sessions.find((s) => s.id === 'test-session-1')
    assert.ok(session)
    assert.equal(session.model, 'claude-sonnet-4-6')
    assert.equal(session.projectName, 'my-app')
    assert.ok(session.tokenUsage.input >= 1000)
  })

  it('extracts messages and tool events', async () => {
    const detail = await store.getSession('test-session-1')
    assert.ok(detail)
    assert.ok(detail.messages.length >= 1)
    assert.ok(detail.toolEvents.length >= 1)
    assert.equal(detail.toolEvents[0].tool, 'Read')
  })
})
