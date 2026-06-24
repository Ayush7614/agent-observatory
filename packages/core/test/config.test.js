import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { patchConfig, toSettingsView } from '../src/config.js'

describe('config settings', () => {
  it('toSettingsView returns defaults', () => {
    const view = toSettingsView({ port: 7420 })
    assert.equal(view.port, 7420)
    assert.equal(view.agents['claude-code'].enabled, true)
    assert.equal(view.budgets.day, 200)
  })

  it('patchConfig validates port', () => {
    assert.throws(() => patchConfig({ port: 7420 }, { port: 99 }))
  })

  it('patchConfig merges budgets and flags restart on port change', () => {
    const { config, requiresRestart } = patchConfig(
      { port: 7420, budgets: {} },
      { port: 8080, budgets: { day: 100 } }
    )
    assert.equal(config.port, 8080)
    assert.equal(config.budgets.day, 100)
    assert.equal(requiresRestart, true)
  })

  it('patchConfig allows disabling snapshots', () => {
    const { config } = patchConfig({ agents: {} }, {
      agents: { 'claude-code': { snapshotMinutes: 0 } },
    })
    assert.equal(config.agents['claude-code'].snapshotMinutes, 0)
  })
})
