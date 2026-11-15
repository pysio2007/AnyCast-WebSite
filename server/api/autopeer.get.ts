// Server-side proxy for the public AutoPeer (autopeer.su) API: its CORS policy only allows
// https://autopeer.su, so the browser cannot call it directly from anycast.ink.
const UPSTREAM = 'https://www.autopeer.su/api/v1'
const USER_AGENT = 'anycast.ink/1.0 (+https://anycast.ink/dn42)'

interface UpstreamNode {
  id: string
  name: string
  location: string
  public_ip: string
  our_asn: number
  our_lla: string
  our_wg_pubkey: string
  online: boolean
  enabled: boolean
  china_mode: boolean
}

interface UpstreamNodeStats {
  node_id: string
  name: string
  peers_active: number
  avg_rtt_ms: number
  rx_bytes_24h: number
  tx_bytes_24h: number
}

interface UpstreamStats {
  avg_rtt_ms: number
  nodes: UpstreamNodeStats[]
  nodes_online: number
  peers_active: number
  total_rx_bytes: number
  total_tx_bytes: number
}

export default defineCachedEventHandler(async () => {
  const get = <T>(path: string) => $fetch<T>(`${UPSTREAM}${path}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    timeout: 10_000,
  })

  let nodes: UpstreamNode[]
  let stats: UpstreamStats
  try {
    [nodes, stats] = await Promise.all([get<UpstreamNode[]>('/nodes'), get<UpstreamStats>('/stats')])
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'AutoPeer upstream unavailable' })
  }

  return {
    nodes: nodes.map(n => ({
      id: n.id,
      name: n.name,
      location: n.location,
      public_ip: n.public_ip,
      our_asn: n.our_asn,
      our_lla: n.our_lla,
      our_wg_pubkey: n.our_wg_pubkey,
      online: n.online,
      enabled: n.enabled,
      china_mode: n.china_mode,
    })),
    stats: {
      avg_rtt_ms: stats.avg_rtt_ms,
      nodes: stats.nodes.map(s => ({
        node_id: s.node_id,
        name: s.name,
        peers_active: s.peers_active,
        avg_rtt_ms: s.avg_rtt_ms,
        rx_bytes_24h: s.rx_bytes_24h,
        tx_bytes_24h: s.tx_bytes_24h,
      })),
      nodes_online: stats.nodes_online,
      peers_active: stats.peers_active,
      total_rx_bytes: stats.total_rx_bytes,
      total_tx_bytes: stats.total_tx_bytes,
    },
    fetchedAt: new Date().toISOString(),
  }
}, {
  name: 'autopeer',
  getKey: () => 'v1',
  maxAge: 60,
  swr: true,
})
