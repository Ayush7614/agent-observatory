/**
 * Persist file read offsets for incremental JSONL parsing.
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * @param {string} stateDir
 */
export function loadOffsets(stateDir) {
  const file = path.join(stateDir, 'file-offsets.json')
  if (!fs.existsSync(file)) return new Map()
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return new Map(Object.entries(data))
  } catch {
    return new Map()
  }
}

/**
 * @param {string} stateDir
 * @param {Map<string, number>} offsets
 */
export function saveOffsets(stateDir, offsets) {
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 })
  const file = path.join(stateDir, 'file-offsets.json')
  const obj = Object.fromEntries(offsets)
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), { mode: 0o600 })
}
