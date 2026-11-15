import type { TraceAnalysisResponse, TraceRoute } from '#shared/types/xmsl'
import { createHash } from 'node:crypto'

const MAX_TEXT = 32 * 1024

/**
 * xmsl's mtr parser drops every hop when the ASN column is followed by a single space
 * (e.g. `2. AS24940 core22.fsn1.hetzner.com (...)` in Globalping output whose widest ASN has 7 chars).
 * One extra space after each hop's ASN token keeps the report parseable without changing any value.
 */
const ASN_TOKEN = /^(\s*\d+\.\s+AS(?:\d+|\?\?\?))(\s)/gm

interface UploadResult { id: string, adminKey: string }
interface UpstreamAnalysis {
  format: string
  db: { binary: string, ref: string }
  routes: TraceRoute[]
  asNames: Record<string, string>
  analysisMs: number
}

/**
 * Upload the trace text, read back the hop-by-hop geolocation, then delete the stored trace
 * with its admin key: nothing we submit stays on xmsl.dev. Results are cached by text hash.
 */
const analyze = defineCachedFunction(async (text: string): Promise<TraceAnalysisResponse> => {
  const upload = await xmslFetch<UploadResult>('/api/v1/traces', { method: 'POST', body: { text } })
  try {
    const analysis = await xmslFetch<UpstreamAnalysis>(`/api/v1/traces/${encodeURIComponent(upload.id)}`)
    const route = analysis.routes[0]
    if (!route)
      throw createError({ statusCode: 422, statusMessage: '无法解析该路由追踪输出' })
    return {
      format: analysis.format,
      db: { binary: analysis.db.binary, ref: analysis.db.ref },
      route,
      asNames: analysis.asNames ?? {},
      analysisMs: analysis.analysisMs,
    }
  }
  finally {
    await xmslFetch(`/api/v1/traces/${encodeURIComponent(upload.id)}`, {
      method: 'DELETE',
      headers: { 'X-Trace-Admin-Key': upload.adminKey },
    }).catch(() => {})
  }
}, {
  name: 'xmsl-trace',
  maxAge: 60 * 60 * 24,
  getKey: (text: string) => createHash('sha256').update(text).digest('hex'),
})

/** POST /api/trace { text } — text is an MTR / traceroute report (e.g. Globalping `rawOutput`). */
export default defineEventHandler(async (event): Promise<TraceAnalysisResponse> => {
  const body = await readBody<{ text?: unknown }>(event)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!text)
    throw createError({ statusCode: 400, statusMessage: '缺少路由追踪文本' })
  if (text.length > MAX_TEXT)
    throw createError({ statusCode: 413, statusMessage: '路由追踪文本过长' })

  enforceRateLimit(event, 'trace', 60, 60 * 60 * 1000)
  return analyze(text.replace(ASN_TOKEN, '$1 $2'))
})
