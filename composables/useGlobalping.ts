/**
 * Globalping (https://globalping.io) — free, open global probe network.
 * Replaces the retired ping.akaere.online / lg.pysio.online backends for ping and traceroute.
 * Anonymous use: 250 probe tests per hour per client IP; CORS enabled.
 * API docs: https://globalping.io/docs/api.globalping.io
 */

const API = 'https://api.globalping.io/v1/measurements'
const POLL_MS = 600

export type GlobalpingType = 'ping' | 'traceroute' | 'mtr' | 'dns' | 'http'
export type GlobalpingProbeStatus = 'in-progress' | 'finished' | 'failed' | 'offline'

export interface GlobalpingProbe {
  continent: string
  region: string
  country: string
  state: string | null
  city: string
  asn: number
  longitude: number
  latitude: number
  network: string
  tags: string[]
}

export interface GlobalpingStats {
  min: number | null
  max: number | null
  avg: number | null
  total: number
  rcv: number
  drop: number
  loss: number
}

export interface PingResult {
  status: GlobalpingProbeStatus
  rawOutput: string
  resolvedAddress: string | null
  resolvedHostname: string | null
  timings: { rtt: number, ttl?: number }[]
  stats: GlobalpingStats
}

export interface TracerouteHop {
  resolvedAddress: string | null
  resolvedHostname: string | null
  timings: { rtt: number }[]
}

export interface TracerouteResult {
  status: GlobalpingProbeStatus
  rawOutput: string
  resolvedAddress: string | null
  resolvedHostname: string | null
  hops: TracerouteHop[]
}

export interface MtrHop extends TracerouteHop {
  asn: number[]
  stats: GlobalpingStats & { stDev: number, jMin: number, jMax: number, jAvg: number }
}

export interface MtrResult {
  status: GlobalpingProbeStatus
  rawOutput: string
  resolvedAddress: string | null
  resolvedHostname: string | null
  hops: MtrHop[]
}

export interface GlobalpingMeasurement<R> {
  id: string
  type: GlobalpingType
  status: 'in-progress' | 'finished'
  target: string
  probesCount: number
  createdAt: string
  updatedAt: string
  locations?: { magic?: string, limit?: number }[]
  results: { probe: GlobalpingProbe, result: R }[]
}

export interface GlobalpingRequest {
  type: GlobalpingType
  target: string
  /**
   * Free-text location ("world", "Asia", "Japan", "Tokyo", "AS13335", "Hetzner"…) with probe count.
   * The API rejects a top-level `limit` combined with per-location limits, so only per-location limits are exposed.
   */
  locations: { magic: string, limit: number }[]
  measurementOptions?: Record<string, unknown>
}

export interface GlobalpingRateLimit {
  limit: number
  remaining: number
  /** Epoch ms when the quota resets. */
  resetAt: number
}

export type GlobalpingState = 'idle' | 'creating' | 'running' | 'finished' | 'error'

function readRateLimit(headers: Headers): GlobalpingRateLimit | null {
  const limit = Number(headers.get('x-ratelimit-limit'))
  const remaining = Number(headers.get('x-ratelimit-remaining'))
  const reset = Number(headers.get('x-ratelimit-reset'))
  if (!Number.isFinite(limit) || !headers.has('x-ratelimit-limit')) return null
  return { limit, remaining, resetAt: Date.now() + reset * 1000 }
}

async function errorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => null) as { error?: { type?: string, message?: string } } | null
  if (res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset') || res.headers.get('retry-after'))
    const wait = Number.isFinite(reset) && reset > 0 ? `，约 ${Math.ceil(reset / 60)} 分钟后恢复` : ''
    return `已用完 Globalping 匿名额度（每小时 250 次探针测试）${wait}`
  }
  if (body?.error?.type === 'no_probes_found') return '所选位置当前没有可用探针，请换一个位置或 IP 版本'
  return body?.error?.message || `Globalping 请求失败（HTTP ${res.status}）`
}

export function useGlobalping<R>() {
  const measurement = shallowRef<GlobalpingMeasurement<R> | null>(null)
  const state = ref<GlobalpingState>('idle')
  const error = ref('')
  const rateLimit = useState<GlobalpingRateLimit | null>('globalping-rate-limit', () => null)
  let controller: AbortController | null = null

  function stop() {
    controller?.abort()
    controller = null
    if (state.value === 'creating' || state.value === 'running') state.value = measurement.value ? 'finished' : 'idle'
  }

  async function poll(id: string, signal: AbortSignal) {
    state.value = 'running'
    while (!signal.aborted) {
      const res = await fetch(`${API}/${encodeURIComponent(id)}`, { signal })
      if (!res.ok) throw new Error(res.status === 404 ? '测量不存在或已过期（Globalping 结果保留约 7 天）' : await errorMessage(res))
      const data = await res.json() as GlobalpingMeasurement<R>
      measurement.value = data
      if (data.status !== 'in-progress') {
        state.value = 'finished'
        return
      }
      const { promise, resolve } = Promise.withResolvers<void>()
      setTimeout(resolve, POLL_MS)
      await promise
    }
  }

  async function guard(task: (signal: AbortSignal) => Promise<void>) {
    stop()
    controller = new AbortController()
    const { signal } = controller
    error.value = ''
    try {
      await task(signal)
    }
    catch (e) {
      if (signal.aborted) return
      error.value = e instanceof Error ? e.message : String(e)
      state.value = 'error'
    }
  }

  /** Create a measurement and poll it until every probe has finished. Resolves with the id. */
  async function run(request: GlobalpingRequest): Promise<string | null> {
    let id: string | null = null
    measurement.value = null
    await guard(async (signal) => {
      state.value = 'creating'
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal,
      })
      rateLimit.value = readRateLimit(res.headers) ?? rateLimit.value
      if (!res.ok) throw new Error(await errorMessage(res))
      id = (await res.json() as { id: string }).id
      await poll(id, signal)
    })
    return id
  }

  /** Load (and keep polling, if unfinished) an existing measurement, e.g. from a share link. */
  async function load(id: string) {
    measurement.value = null
    await guard(signal => poll(id, signal))
  }

  onScopeDispose(stop)

  return { measurement, state, error, rateLimit, run, load, stop }
}
