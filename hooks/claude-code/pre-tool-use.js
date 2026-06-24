/**
 * Claude Code PreToolUse hook.
 * Handles remote approval flow (v0.2).
 * MVP: auto-passes through — never blocks Claude Code.
 */

async function main() {
  // Read stdin (required by hook protocol)
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)

  // MVP: always pass through. Approval flow in v0.2.
  // Future: POST to /api/hooks/pre-tool-use and wait for decision
}

main()
