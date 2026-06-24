/**
 * Claude Code PreToolUse hook.
 * Logs tool intent to Observatory — never blocks Claude Code.
 */

const PORT = process.env.AO_PORT || 7420

async function main() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  const payload = Buffer.concat(chunks).toString('utf8')

  try {
    await fetch(`http://127.0.0.1:${PORT}/api/hooks/pre-tool-use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload || '{}',
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // Never block Claude Code
  }
}

main()
