import { getSnapshotStatus } from '../snapshots.js'

export function handleHealth(_req, res, ctx) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      status: 'ok',
      version: '0.1.0',
      adapters: ctx.adapters.list().map((a) => ({ id: a.id, name: a.name })),
      uptime: process.uptime(),
      snapshots: getSnapshotStatus(ctx.config),
    })
  )
}
