import type { GeoLookupResponse, GeoProviderInfo, GeoProviderResult, GeoRecord } from '#shared/types/xmsl'
import { isError } from 'h3'
import { isIP } from 'node:net'

interface UpstreamProvider {
  binary: string
  ref: string
  disabled?: boolean
  meta: { isChinese: boolean, isLatlon: boolean, ipv6: boolean }
}

interface UpstreamLocation {
  countryCode?: string
  country?: string
  region?: string
  city?: string
  district?: string
  isp?: string
  asn?: string | number
  asName?: string
  lat?: string | number
  lon?: string | number
  radius?: number
  timezone?: string
  lastUpdated?: string
  anycast?: boolean
  idc?: boolean
}

const getProviders = defineCachedFunction(async (): Promise<GeoProviderInfo[]> => {
  const res = await xmslFetch<{ Data: { handlers: UpstreamProvider[] } }>('/api/v1/r/instant-list/', { auth: true })
  return res.Data.handlers
    .filter(h => !h.disabled)
    .map(h => ({ binary: h.binary, name: h.ref, latlon: h.meta.isLatlon, ipv6: h.meta.ipv6, chinese: h.meta.isChinese }))
}, { name: 'xmsl-providers', maxAge: 60 * 60, swr: true, getKey: () => 'v1' })

function toNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

const lookup = defineCachedFunction(async (provider: string, name: string, ip: string): Promise<GeoRecord> => {
  const res = await xmslFetch<{ Data: UpstreamLocation }>(`/api/v1/r/${encodeURIComponent(provider)}/${encodeURIComponent(ip)}`, { auth: true })
  const d = res.Data
  const asn = toNumber(typeof d.asn === 'string' ? d.asn.replace(/^AS/i, '') : d.asn)
  const lat = toNumber(d.lat)
  const lon = toNumber(d.lon)
  return {
    provider,
    name,
    countryCode: d.countryCode ?? '',
    country: d.country ?? '',
    region: d.region ?? '',
    city: d.city ?? '',
    district: d.district ?? '',
    isp: d.isp ?? '',
    asn,
    asName: d.asName ?? null,
    // Providers without coordinates report 0,0; treat that as unknown.
    lat: lat === 0 && lon === 0 ? null : lat,
    lon: lat === 0 && lon === 0 ? null : lon,
    radiusKm: d.radius ?? null,
    timezone: d.timezone ?? '',
    lastUpdated: d.lastUpdated ?? null,
    anycast: d.anycast === true,
    idc: d.idc === true,
  }
}, { name: 'xmsl-lookup', maxAge: 60 * 60 * 24, getKey: (provider: string, _name: string, ip: string) => `${provider}:${ip}` })

/** GET /api/geo?ip=1.1.1.1[&providers=dbip,geolite2] — one IP against every (or the chosen) provider. */
export default defineEventHandler(async (event): Promise<GeoLookupResponse> => {
  const query = getQuery(event)
  const ip = String(query.ip ?? '').trim()
  const family = isIP(ip)
  if (!family)
    throw createError({ statusCode: 400, statusMessage: '请输入有效的 IPv4 或 IPv6 地址' })

  enforceRateLimit(event, 'geo', 20, 60 * 60 * 1000)

  const wanted = typeof query.providers === 'string' && query.providers
    ? new Set(query.providers.split(','))
    : null
  const providers = (await getProviders())
    .filter(p => !wanted || wanted.has(p.binary))
    .filter(p => family === 4 || p.ipv6)

  const results = await Promise.all(providers.map(async (p): Promise<GeoProviderResult> => {
    try {
      return { provider: p.binary, name: p.name, ok: true, record: await lookup(p.binary, p.name, ip) }
    }
    catch (error) {
      return { provider: p.binary, name: p.name, ok: false, error: (isError(error) && error.statusMessage) || '查询失败' }
    }
  }))

  return { ip, results, fetchedAt: new Date().toISOString() }
})
