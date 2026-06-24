import { toSettingsView, patchConfig, saveConfig, getConfigPath } from '@agent-observatory/core'

async function readBody(req, limit = 65_536) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new Error('Payload too large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function isLocalRequest(req) {
  const remote = req.socket?.remoteAddress
  return remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1'
}

export async function handleSettings(req, res, ctx) {
  if (!isLocalRequest(req)) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Settings API is localhost-only', code: 'FORBIDDEN' }))
    return
  }

  const configPath = ctx.configPath || getConfigPath()

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(toSettingsView(ctx.config, configPath)))
    return
  }

  if (req.method === 'PUT') {
    try {
      const body = await readBody(req)
      const patch = JSON.parse(body)
      const { config, requiresRestart } = patchConfig(ctx.config, patch)

      saveConfig(config, configPath)
      ctx.config = config

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          ok: true,
          requiresRestart,
          settings: toSettingsView(config, configPath),
        })
      )
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message, code: 'BAD_REQUEST' }))
    }
    return
  }

  res.writeHead(405, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }))
}
