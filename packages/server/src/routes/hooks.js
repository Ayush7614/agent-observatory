import { EVENT_TYPES } from '@agent-observatory/core'

async function readBody(req, limit = 1_048_576) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new Error('Payload too large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export async function handleHooks(req, res, ctx, url) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }))
    return
  }

  const hookType = url.pathname.replace('/api/hooks/', '')

  try {
    const body = await readBody(req)
    const payload = body.trim() ? JSON.parse(body) : {}

    const adapter = ctx.adapters.get('claude-code')

    if (hookType === 'notify' && adapter?.parseNotifyHook) {
      const notification = adapter.parseNotifyHook(payload)
      if (notification) {
        ctx.eventBus.emit(EVENT_TYPES.AGENT_STATE, notification)
      }
    } else if (adapter?.parseHookPayload) {
      const event = adapter.parseHookPayload(hookType, payload)
      if (event) {
        ctx.eventBus.emit(EVENT_TYPES.TOOL_EXECUTED, event)
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
  } catch (err) {
    console.warn(`[hooks] ${hookType} error:`, err.message)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, warning: err.message }))
  }
}
