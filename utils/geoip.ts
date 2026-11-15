import { Cache } from './cache'

/**
 * IP 地理位置查询（仅客户端调用，HTTPS + CORS，无需用户提供密钥）。
 * 主：ipinfo.io（内置 token）；备：ipwho.is（免密钥）。结果在 localStorage 缓存 7 天（见 utils/cache.ts）。
 */

// v2：新增 anycast 字段，旧格式条目不再读取（仍以 ip_geo_ 开头，沿用 7 天 TTL）
const IP_CACHE_PREFIX = 'ip_geo_v2_'
const IPINFO_TOKEN = '29a9fd77d1bd76'

export interface IpGeoInfo {
  ip: string
  /** ISO 3166-1 alpha-2 国家代码 */
  country: string
  country_name: string
  city: string
  region: string
  latitude?: number
  longitude?: number
  /** 纯数字 ASN，未知时为空字符串 */
  asn: string
  /** 组织名，可能带 "AS1234 " 前缀 */
  org: string
  /** ipinfo.io 识别出的任播地址，其地理位置不代表实际所在地 */
  anycast?: boolean
}

type Json = Record<string, unknown>

interface Provider {
  name: string
  url: (ip: string) => string
  parse: (data: Json) => IpGeoInfo | null
}

const str = (value: unknown) => (typeof value === 'string' ? value : '')
const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined)
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {})

const PROVIDERS: Provider[] = [
  {
    name: 'ipinfo.io',
    url: ip => `https://ipinfo.io/${encodeURIComponent(ip)}?token=${IPINFO_TOKEN}`,
    parse: (data) => {
      if (!str(data.ip) || data.bogon) return null
      const [latitude, longitude] = str(data.loc).split(',').map(part => num(Number.parseFloat(part)))
      const org = str(data.org)
      return {
        ip: str(data.ip),
        country: str(data.country),
        country_name: str(data.country),
        city: str(data.city),
        region: str(data.region),
        latitude: longitude === undefined ? undefined : latitude,
        longitude: latitude === undefined ? undefined : longitude,
        asn: org.match(/^AS(\d+)/)?.[1] ?? '',
        org,
        anycast: data.anycast === true,
      }
    },
  },
  {
    name: 'ipwho.is',
    url: ip => `https://ipwho.is/${encodeURIComponent(ip)}`,
    parse: (data) => {
      if (data.success !== true || !str(data.ip)) return null
      const connection = obj(data.connection)
      const asn = num(connection.asn)
      return {
        ip: str(data.ip),
        country: str(data.country_code),
        country_name: str(data.country) || str(data.country_code),
        city: str(data.city),
        region: str(data.region),
        latitude: num(data.latitude),
        longitude: num(data.longitude),
        asn: asn === undefined ? '' : String(asn),
        org: str(connection.org) || str(connection.isp),
      }
    },
  },
]

const PRIVATE_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT 100.64.0.0/10
  /^::1?$/,
  /^f[cd][0-9a-f]{2}:/i, // ULA fc00::/7
  /^fe[89ab][0-9a-f]:/i, // 链路本地 fe80::/10
]

/** 私有、回环、链路本地与 CGNAT 地址无法地理定位。 */
export function isPrivateIP(ip: string): boolean {
  return PRIVATE_RANGES.some(range => range.test(ip))
}

/** 依次尝试各提供方，成功结果缓存 7 天；全部失败时返回 null。 */
export async function getIpGeoLocation(ip: string): Promise<IpGeoInfo | null> {
  if (!ip || isPrivateIP(ip)) return null

  const cacheKey = `${IP_CACHE_PREFIX}${ip}`
  const cached = Cache.get<IpGeoInfo>(cacheKey)
  if (cached) return cached

  for (const provider of PROVIDERS) {
    try {
      const response = await fetch(provider.url(ip))
      if (!response.ok) continue
      const info = provider.parse(obj(await response.json()))
      if (info) {
        Cache.set(cacheKey, info)
        return info
      }
    }
    catch (error) {
      console.error(`${provider.name} 查询 ${ip} 失败:`, error)
    }
  }
  return null
}
