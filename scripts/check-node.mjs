#!/usr/bin/env node
/**
 * Exit with a helpful message if Node.js < 22 (required for node:sqlite).
 */

const major = Number(process.version.slice(1).split('.')[0])

if (major < 22) {
  console.error(`
❌ Agent Observatory requires Node.js 22 or newer.

   Current:  ${process.version}
   Required: Node.js >= 22.0.0 (uses built-in node:sqlite)

   Fix (nvm):
     source ~/.nvm/nvm.sh
     nvm use 22

   Or set default:
     nvm alias default 22

   See .nvmrc in the project root.
`)
  process.exit(1)
}
