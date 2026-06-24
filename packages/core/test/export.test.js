import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { SessionStore } from '../src/store.js'
import {
  sessionToMarkdown,
  buildExportFilename,
  writeSessionExport,
  resolveSessionRef,
} from '../src/export.js'

describe('export', () => {
  it('sessionToMarkdown includes metadata and transcript', () => {
    const md = sessionToMarkdown({
      session: {
        id: 'abc-123-def',
        agentId: 'claude-code',
        projectName: 'my-app',
        projectPath: '/tmp/my-app',
        startedAt: '2026-06-24T10:00:00Z',
        updatedAt: '2026-06-24T10:05:00Z',
        model: 'qwen2.5:0.5b',
        status: 'active',
        tokenUsage: { input: 100, output: 50, cacheRead: 0, cacheWrite: 0 },
        contextPercent: 10,
        estimatedCostUsd: 0,
        messageCount: 1,
        toolCallCount: 1,
      },
      messages: [
        {
          id: 'm1',
          sessionId: 'abc-123-def',
          role: 'user',
          content: 'Fix the login bug',
          timestamp: '2026-06-24T10:01:00Z',
        },
      ],
      toolEvents: [
        {
          id: 't1',
          sessionId: 'abc-123-def',
          timestamp: '2026-06-24T10:02:00Z',
          tool: 'Read',
          inputSummary: 'src/login.ts',
        },
      ],
    })

    assert.match(md, /# Session Export — my-app/)
    assert.match(md, /abc-123-def/)
    assert.match(md, /Fix the login bug/)
    assert.match(md, /Tool: Read/)
    assert.match(md, /Recovery prompt/)
  })

  it('buildExportFilename is filesystem-safe', () => {
    const name = buildExportFilename({
      session: {
        id: 'sess-abcdef12',
        agentId: 'claude-code',
        projectName: 'Agent Observatory!',
        startedAt: '2026-06-24T10:00:00Z',
        updatedAt: '2026-06-24T10:05:00Z',
        status: 'active',
        tokenUsage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextPercent: 0,
        estimatedCostUsd: 0,
        messageCount: 0,
        toolCallCount: 0,
      },
      messages: [],
      toolEvents: [],
    })
    assert.match(name, /^agent-observatory-2026-06-24-sess-abc\.md$/)
  })

  it('writeSessionExport writes file to exports dir', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-export-test-'))
    const detail = {
      session: {
        id: 'export-test-1',
        agentId: 'claude-code',
        projectName: 'test',
        startedAt: '2026-06-24T10:00:00Z',
        updatedAt: '2026-06-24T10:05:00Z',
        status: 'completed',
        tokenUsage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextPercent: 0,
        estimatedCostUsd: 0,
        messageCount: 0,
        toolCallCount: 0,
      },
      messages: [],
      toolEvents: [],
    }

    const result = writeSessionExport(detail, tmpDir)
    assert.ok(fs.existsSync(result.filepath))
    assert.ok(result.markdown.length > 0)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('resolveSessionRef resolves index and id', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-resolve-test-'))
    const store = new SessionStore(tmpDir)
    await store.init()

    await store.upsertSession({
      id: 'older-session',
      agentId: 'claude-code',
      projectName: 'old',
      startedAt: '2026-06-24T08:00:00Z',
      updatedAt: '2026-06-24T08:30:00Z',
      status: 'completed',
      tokenUsage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextPercent: 0,
      estimatedCostUsd: 0,
      messageCount: 0,
      toolCallCount: 0,
    })
    await store.upsertSession({
      id: 'newer-session',
      agentId: 'claude-code',
      projectName: 'new',
      startedAt: '2026-06-24T10:00:00Z',
      updatedAt: '2026-06-24T10:30:00Z',
      status: 'active',
      tokenUsage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextPercent: 0,
      estimatedCostUsd: 0,
      messageCount: 0,
      toolCallCount: 0,
    })

    const latest = await resolveSessionRef(store, '1')
    assert.equal(latest?.id, 'newer-session')

    const second = await resolveSessionRef(store, '2')
    assert.equal(second?.id, 'older-session')

    const byPrefix = await resolveSessionRef(store, 'older-ses')
    assert.equal(byPrefix?.id, 'older-session')

    await store.close()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })
})
