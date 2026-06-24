export function handleLive(req, res, ctx) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', data: { version: '0.1.0' } })}\n\n`)

  const unsubscribe = ctx.eventBus.onAny((type, data) => {
    try {
      res.write(`data: ${JSON.stringify({ type, data })}\n\n`)
    } catch {
      unsubscribe()
    }
  })

  // Heartbeat every 30s
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`)
    } catch {
      clearInterval(heartbeat)
      unsubscribe()
    }
  }, 30000)

  req.on('close', () => {
    clearInterval(heartbeat)
    unsubscribe()
  })
}
