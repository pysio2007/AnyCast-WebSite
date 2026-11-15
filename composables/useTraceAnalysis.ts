import type { TraceAnalysisResponse, TraceConfidence, TraceHop } from '#shared/types/xmsl'
import { FetchError } from 'ofetch'

export interface TraceAnalysisEntry {
  pending: boolean
  data: TraceAnalysisResponse | null
  error: string
}

export interface HopPlace {
  countryCode: string
  city: string
  confidence: TraceConfidence | null
  /** Where the placement came from: the winning database, or the inference used instead. */
  source: string
}

const NON_DB_SOURCES: Record<string, string> = {
  rdns: 'PTR 主机名',
  rtt: 'RTT 推断',
  nearby: '相邻跃点推断',
}

export const CONFIDENCE: Record<string, { label: string, badge: string }> = {
  high: { label: '高置信', badge: 'border-transparent bg-success/15 text-success' },
  medium: { label: '中置信', badge: 'border-transparent bg-warning/15 text-warning' },
  low: { label: '低置信', badge: 'border-transparent bg-muted text-muted-foreground' },
}

const regionNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' })

/** ISO 3166 code → Chinese country name (falls back to the code). */
export function countryName(code: string) {
  try {
    return regionNames.of(code.toUpperCase()) ?? code
  }
  catch {
    return code
  }
}

/** `city, 国家` with whichever parts are known. */
export function placeLabel(countryCode?: string | null, city?: string | null) {
  return [city, countryCode && countryName(countryCode)].filter(Boolean).join(', ')
}

/** Final placement of a hop (cross-checked across databases, PTR names and RTT), or null if unplaced. */
export function hopPlace(hop: TraceHop | undefined): HopPlace | null {
  const placement = hop?.placement
  if (!hop || !placement) return null
  const geo = hop.hosts[hop.primary ?? 0]?.geo
  const place = placement.place ?? {}
  return {
    countryCode: place.countryCode ?? geo?.countryCode ?? '',
    city: place.city ?? '',
    confidence: placement.confidence ?? null,
    source: (placement.source && NON_DB_SOURCES[placement.source]) || geo?.source?.ref || '',
  }
}

function errorText(error: unknown) {
  if (error instanceof FetchError) {
    const data: unknown = error.data
    if (data && typeof data === 'object' && 'statusMessage' in data && typeof data.statusMessage === 'string')
      return data.statusMessage
    return error.statusMessage || error.message
  }
  return error instanceof Error ? error.message : String(error)
}

/**
 * Cross-database hop geolocation via POST /api/trace for the given MTR/traceroute report.
 * Results are cached per text for the lifetime of the caller, so switching back to a report
 * never refetches; in-flight requests keep running when the text changes and are aborted on dispose.
 */
export function useTraceAnalysis(text: MaybeRefOrGetter<string | null | undefined>) {
  const cache = shallowReactive(new Map<string, TraceAnalysisEntry>())
  const controllers = new Map<string, AbortController>()

  async function analyze(key: string) {
    const existing = cache.get(key)
    if (existing && !existing.error) return

    const controller = new AbortController()
    controllers.set(key, controller)
    cache.set(key, { pending: true, data: null, error: '' })
    try {
      const data = await $fetch<TraceAnalysisResponse>('/api/trace', {
        method: 'POST',
        body: { text: key },
        signal: controller.signal,
      })
      cache.set(key, { pending: false, data, error: '' })
    }
    catch (error) {
      if (controller.signal.aborted) cache.delete(key)
      else cache.set(key, { pending: false, data: null, error: errorText(error) })
    }
    finally {
      controllers.delete(key)
    }
  }

  const key = computed(() => toValue(text)?.trim() || '')
  const entry = computed(() => (key.value ? cache.get(key.value) ?? null : null))

  watch(key, (value) => {
    if (value && import.meta.client) analyze(value)
  }, { immediate: true })

  onScopeDispose(() => {
    for (const controller of controllers.values()) controller.abort()
  })

  return {
    data: computed(() => entry.value?.data ?? null),
    pending: computed(() => entry.value?.pending ?? false),
    error: computed(() => entry.value?.error ?? ''),
    retry: () => key.value && analyze(key.value),
  }
}
