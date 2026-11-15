import type { H3Event } from 'h3'
import { FetchError, ofetch } from 'ofetch'

/**
 * xmsl.Dev GeoAPI client (server-only). The upstream only allows CORS from xmsl.dev and
 * its lookup endpoints need our account key, so every call goes through Nitro.
 */

const USER_AGENT = 'anycast.ink/1.0 (+https://anycast.ink)'

interface Problem { status?: number, detail?: string, title?: string }

export function xmslConfig() {
  const { xmsl } = useRuntimeConfig()
  return {
    baseUrl: xmsl.baseUrl as string,
    // Read at request time only (Netlify env var XMSL_KEY, or NUXT_XMSL_API_KEY via runtimeConfig).
    apiKey: (process.env.XMSL_KEY || xmsl.apiKey || '') as string,
  }
}

/** Fetch from the GeoAPI, mapping RFC 9457 problems to h3 errors. */
export async function xmslFetch<T>(path: string, init: { method?: 'GET' | 'POST' | 'DELETE', body?: Record<string, unknown>, auth?: boolean, headers?: Record<string, string> } = {}): Promise<T> {
  const { baseUrl, apiKey } = xmslConfig()
  if (init.auth && !apiKey)
    throw createError({ statusCode: 503, statusMessage: 'Geolocation service is not configured' })

  try {
    return await ofetch<T>(path, {
      baseURL: baseUrl,
      method: init.method ?? 'GET',
      body: init.body,
      timeout: 20_000,
      headers: {
        'User-Agent': USER_AGENT,
        ...(init.auth ? { 'X-Api-Key': apiKey } : {}),
        ...init.headers,
      },
    })
  }
  catch (error) {
    if (!(error instanceof FetchError)) throw error
    const status = error.statusCode ?? 502
    const problem: Problem | undefined = error.data && typeof error.data === 'object' ? error.data : undefined
    throw createError({
      statusCode: status === 401 || status === 403 ? 502 : status,
      statusMessage: problem?.detail || problem?.title || 'Geolocation upstream unavailable',
    })
  }
}

/**
 * Fixed-window per-client limiter so visitors cannot drain the shared account quota.
 * In-memory: on serverless each warm instance keeps its own window, which is an acceptable bound.
 */
const windows = new Map<string, { count: number, resetAt: number }>()

export function enforceRateLimit(event: H3Event, bucket: string, limit: number, windowMs: number) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const current = windows.get(key)
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs })
    if (windows.size > 10_000) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k)
    }
    return
  }
  if (current.count >= limit) {
    setResponseHeader(event, 'Retry-After', Math.ceil((current.resetAt - now) / 1000))
    throw createError({ statusCode: 429, statusMessage: '请求过于频繁，请稍后再试' })
  }
  current.count++
}
