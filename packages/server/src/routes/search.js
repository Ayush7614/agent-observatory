export async function handleSearch(_req, res, ctx, url) {
  const q = url.searchParams.get('q') || ''
  if (!q.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Query parameter q is required', code: 'BAD_REQUEST' }))
    return
  }

  const results = await ctx.search.search(q, {
    limit: ctx.config.search?.maxResults || 50,
  })

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ query: q, results }))
}
