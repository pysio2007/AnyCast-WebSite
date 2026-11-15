import type { Component } from 'vue'
import {
  Activity,
  BookOpen,
  Boxes,
  Cable,
  Database,
  Earth,
  Globe,
  History,
  Layers,
  Network,
  Radar,
  Route,
  Search,
  Server,
  Share2,
  VenetianMask,
  Waypoints,
} from '@lucide/vue'

export interface SiteLink {
  title: string
  to: string
  description: string
  icon: Component
}

export type OrgId = 'pysio' | 'akaere' | 'skimit'

export interface Organization {
  id: OrgId
  name: string
  website: string
  description: string
}

export interface OperatedAsn {
  asn: number
  org: OrgId
  /** Registry of the aut-num object; used for the authoritative lookup link. */
  registry: 'RIPE NCC' | 'APNIC' | 'ARIN'
  /** PeeringDB network id, if registered. */
  peeringdb?: number
}

export const ORGANIZATIONS: Record<OrgId, Organization> = {
  pysio: { id: 'pysio', name: 'Pysio Networks', website: 'https://www.pysio.online/', description: '个人研究网络，运营全球 Anycast 节点' },
  akaere: { id: 'akaere', name: 'Akaere Networks', website: 'https://www.akae.re/', description: 'BGP、BGP Tunnel 与 IXP 服务' },
  skimit: { id: 'skimit', name: 'Skimit', website: 'https://www.skimit.org/', description: '面向个人与教育的友好网络运营商' },
}

/** Every autonomous system we operate. Holder names and prefixes are fetched live from RIPEstat. */
export const OPERATED_ASNS: OperatedAsn[] = [
  { asn: 213605, org: 'pysio', registry: 'RIPE NCC', peeringdb: 38457 },
  { asn: 201944, org: 'pysio', registry: 'RIPE NCC', peeringdb: 41422 },
  { asn: 154185, org: 'pysio', registry: 'APNIC', peeringdb: 40212 },
  { asn: 210440, org: 'akaere', registry: 'RIPE NCC', peeringdb: 39090 },
  { asn: 203031, org: 'akaere', registry: 'RIPE NCC', peeringdb: 41047 },
  { asn: 403098, org: 'skimit', registry: 'ARIN' },
]

export const SITE_ASNS = OPERATED_ASNS.map(a => a.asn)
/** ASNs announcing the Anycast network described on /anycast. */
export const ANYCAST_ASNS = [213605, 154185] as const
export const PRIMARY_ASN = 213605
/** PeeringDB network id for AS213605. */
export const PEERINGDB_NET_ID = 38457

export function registryLookupUrl({ asn, registry }: OperatedAsn): string {
  switch (registry) {
    case 'RIPE NCC': return `https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=AS${asn}&type=aut-num`
    case 'APNIC': return `https://wq.apnic.net/apnic-bin/whois.pl?searchtext=AS${asn}`
    case 'ARIN': return `https://whois.arin.net/rest/asn/AS${asn}`
  }
}

export const GITHUB_REPO = 'pysio2007/AnyCast-WebSite'
export const LOGO_URL = 'https://www.pysio.online/assets/imgs/avast.svg'

export const networkLinks: SiteLink[] = [
  { title: '自治系统', to: '/asn', description: '我们运营的全部 ASN 与实时路由', icon: Server },
  { title: 'Anycast', to: '/anycast', description: '全球 Anycast 节点与上游互联', icon: Globe },
  { title: 'IX 互联', to: '/ix', description: '接入的互联网交换中心', icon: Cable },
  { title: '网络前缀', to: '/prefixes', description: '实时公告的 IPv4 / IPv6 前缀', icon: Layers },
  { title: '下游接入', to: '/downstream', description: 'BGP 下游接入政策', icon: Share2 },
  { title: 'DN42 AutoPeer', to: '/dn42', description: '免费的 DN42 自动化 Peering', icon: Network },
  { title: 'LIR 服务', to: '/lir', description: 'RIPE NCC / APNIC 资源服务', icon: Boxes },
]

export const toolLinks: SiteLink[] = [
  { title: 'BGP 路由查询', to: '/bgp', description: 'RIPE RIS 公共 Looking Glass', icon: Radar },
  { title: '全球 Ping', to: '/ping', description: '全球多点延迟与可达性测试', icon: Activity },
  { title: '路由追踪', to: '/traceroute', description: '从任意位置发起 MTR', icon: Route },
  { title: '全球路由追踪', to: '/global-traceroute', description: '多探针路由追踪与地图', icon: Waypoints },
  { title: 'WHOIS', to: '/whois', description: 'RDAP 域名 / IP / ASN 注册信息', icon: Database },
  { title: 'Tor 节点查询', to: '/tor-check', description: '查询 Tor 中继与出口节点', icon: VenetianMask },
]

export const resourceLinks: SiteLink[] = [
  { title: '博客', to: '/blog', description: '最新文章', icon: BookOpen },
  { title: '更新日志', to: '/version', description: '网站版本与提交记录', icon: History },
  { title: '工具箱', to: '/tools', description: '全部网络工具', icon: Earth },
]
