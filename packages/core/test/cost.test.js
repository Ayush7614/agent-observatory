import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { estimateCost, isLocalModel } from '../src/cost.js'

describe('isLocalModel', () => {
  it('detects Ollama-style tags', () => {
    assert.equal(isLocalModel('qwen2.5:0.5b'), true)
    assert.equal(isLocalModel('llama3:latest'), true)
    assert.equal(isLocalModel('mistral:7b'), true)
  })

  it('does not mark Claude cloud models as local', () => {
    assert.equal(isLocalModel('claude-opus-4-8'), false)
    assert.equal(isLocalModel('claude-sonnet-4-6'), false)
  })
})

describe('estimateCost for local models', () => {
  it('returns 0 for Ollama models', () => {
    const usage = { input: 4100, output: 747, cacheRead: 0, cacheWrite: 0 }
    assert.equal(estimateCost(usage, 'qwen2.5:0.5b'), 0)
  })

  it('still estimates for Claude models', () => {
    const usage = { input: 1000, output: 200, cacheRead: 0, cacheWrite: 0 }
    assert.ok(estimateCost(usage, 'claude-sonnet-4-6') > 0)
  })
})
