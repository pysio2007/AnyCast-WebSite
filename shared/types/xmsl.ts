/**
 * Types shared by server/api/geo + server/api/trace and the pages that consume them.
 * Upstream reference: https://stage-info-api.xmsl.dev/llms-full.txt
 */

export interface GeoProviderInfo {
  binary: string
  name: string
  /** Provider returns coordinates. */
  latlon: boolean
  ipv6: boolean
  chinese: boolean
}

export interface GeoRecord {
  provider: string
  name: string
  countryCode: string
  country: string
  region: string
  city: string
  district: string
  isp: string
  asn: number | null
  asName: string | null
  lat: number | null
  lon: number | null
  radiusKm: number | null
  timezone: string
  lastUpdated: string | null
  anycast: boolean
  idc: boolean
}

export interface GeoProviderResult {
  provider: string
  name: string
  ok: boolean
  record?: GeoRecord
  error?: string
}

export interface GeoLookupResponse {
  ip: string
  results: GeoProviderResult[]
  fetchedAt: string
}

export type TraceConfidence = 'high' | 'medium' | 'low' | string

export interface TraceHopHost {
  ip: string
  hostname?: string | null
  asn?: number | null
  geo?: {
    lat?: number
    lon?: number
    countryCode?: string
    country?: string
    region?: string
    city?: string
    isp?: string
    source?: { binary: string, ref: string, detail?: string }
  }
}

export interface TraceHop {
  ttl: number
  hosts: TraceHopHost[]
  primary?: number
  lossPct?: number
  avgMs?: number
  bestMs?: number
  worstMs?: number
  placement?: {
    lat: number
    lon: number
    source?: string
    confidence?: TraceConfidence
    place?: { countryCode?: string, country?: string, region?: string, city?: string }
  } | null
}

export interface TraceLocation {
  index: number
  kind: string
  lat: number
  lon: number
  label: string
  countryCode?: string
  city?: string
  ttls: number[]
  ips: string[]
  rttMs?: number
  confidence?: TraceConfidence
  relocated?: boolean
}

export interface TraceSegment {
  from: number
  to: number
  distanceKm: number
  rttDeltaMs?: number
  excessMs?: number
  kind: string
  gap: boolean
}

export interface TraceSummary {
  hops: number
  respondingHops: number
  locations: number
  countries: string[]
  asPath: number[]
  asns: { asn: number, name: string, countryCode?: string }[]
  distanceKm: number
  endRttMs?: number
  endLossPct?: number
  reached: boolean
  relocatedHops?: number
}

export interface TraceRoute {
  target: string
  hops: TraceHop[]
  locations: TraceLocation[]
  segments: TraceSegment[]
  summary: TraceSummary
}

export interface TraceAnalysisResponse {
  format: string
  db: { binary: string, ref: string }
  route: TraceRoute
  asNames: Record<string, string>
  analysisMs: number
}
