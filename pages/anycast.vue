<script setup lang="ts">
import { ArrowRight, ArrowUpRight, Cable, Mail, Network, RefreshCw, Search, Share2 } from '@lucide/vue'
import { ANYCAST_ASNS, PEERINGDB_NET_ID, PRIMARY_ASN } from '@/lib/site'

interface AnnouncedPrefixes { prefixes: { prefix: string }[] }
interface Neighbour { asn: number, type: 'left' | 'right' | 'uncertain', power: number, v4_peers: number, v6_peers: number }
interface AsnNeighbours {
  neighbour_counts: { left: number, right: number, unique: number, uncertain: number }
  neighbours: Neighbour[]
}
interface NetIxLan { ix_id: number, name: string }

type NodeTag = 'edge' | 'downstream' | 'new'

interface AnycastNode {
  name: string
  country: string
  bandwidth: string
  provider: string
  session: string
  price: string
  tags?: NodeTag[]
  notes?: string[]
}

const registries = [
  { asn: 213605, registry: 'RIPE DB', href: 'https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=AS213605&type=aut-num' },
  { asn: 154185, registry: 'APNIC', href: 'https://wq.apnic.net/apnic-bin/whois.pl?searchtext=AS154185' },
]

/** Registry allocations; RIPEstat only exposes the more-specific announcements (see /prefixes). */
const addressBlocks = {
  v6: ['2a14:67c1:a020::/44', '2a14:67c1:b100::/40'],
  v4: ['49.213.62.0/24'],
}

const tagMeta: Record<NodeTag, { label: string, class: string }> = {
  edge: { label: '边缘节点', class: 'bg-info/15 text-info border-transparent' },
  downstream: { label: '下游服务', class: 'bg-success/15 text-success border-transparent' },
  new: { label: '新增', class: 'bg-warning/15 text-warning border-transparent' },
}

const nodes: AnycastNode[] = [
  { name: 'AKIX-Frankfurt', country: 'de', bandwidth: '10Gbps', provider: 'Digital Realty Frankfurt FRA1-16', session: 'AS210440 & AKIXP 主控', price: '暂不公开/月' },
  { name: 'HongKong Master', country: 'hk', bandwidth: '30Gbps', provider: 'Equinix HK2', session: 'AS213605 BGP Session', price: '暂不公开/月', notes: ['接入 AKIX'] },
  { name: 'Anycast-NewJersey', country: 'us', bandwidth: '1Gbps, 0.5TB/月', provider: 'Vultr', session: 'AS213605 BGP Session', price: '$3.5/月' },
  { name: 'Anycast-Tokyo', country: 'jp', bandwidth: '1Gbps, 1TB/月', provider: 'Vultr', session: 'AS213605 BGP Session', price: '$5/月' },
  { name: 'Anycast-Amsterdam', country: 'nl', bandwidth: '1Gbps, 1TB/月', provider: 'Vultr', session: 'AS213605 BGP Session', price: '$5/月' },
  { name: 'Anycast-Mumbai', country: 'in', bandwidth: '1Gbps, 1TB/月', provider: 'Vultr', session: 'AS213605 BGP Session', price: '$5/月' },
  { name: 'Anycast-HongKong', country: 'hk', bandwidth: '500Mbps, 1TB/月', provider: 'SkyWolf', session: 'AS213605 BGP Session (Premium)', price: '¥31/月' },
  { name: 'AnyCast-Florida', country: 'us', bandwidth: '3Gbps, 100TB/月', provider: 'Frantech', session: 'AS213605 BGP Session', price: '$3.5/月' },
  { name: 'Anycast-Tallinn', country: 'ee', bandwidth: '1Gbps, 1TB/月', provider: 'V.PS', session: 'AS213605 BGP Session', price: '€18.95/季' },
  { name: 'Luxembourg', country: 'lu', bandwidth: '10Gbps', provider: 'BUYVM', session: 'AS213605 BGP Session', price: '$15/月', tags: ['edge'] },
  { name: 'NewYork', country: 'us', bandwidth: '10Gbps', provider: 'BUYVM', session: 'AS213605 BGP Session', price: '$15/月', tags: ['edge'] },
  { name: 'Schweiz', country: 'ch', bandwidth: '1Gbps, 1TB/月', provider: 'IFog', session: 'AS213605 BGP Session', price: 'CHF 12.00/季', tags: ['downstream'], notes: ['接入 FogIXP'] },
  { name: 'HK-Downstreams', country: 'hk', bandwidth: '1Gbps', provider: 'Equinix HK1', session: 'AS213605 BGP Session', price: '暂不公开/月', tags: ['downstream'] },
  { name: 'US-Downstreams', country: 'us', bandwidth: '1Gbps', provider: 'SkyWolf', session: 'AS213605 BGP Session', price: '$2/月', tags: ['downstream'] },
  { name: 'STUIX-Taipei', country: 'tw', bandwidth: '1Gbps', provider: 'Moedove', session: 'AS213605 BGP Session', price: '暂不公开/月', tags: ['downstream'] },
  { name: 'HongKong', country: 'hk', bandwidth: '1Gbps', provider: 'Moedove', session: 'AS213605 BGP Session', price: '暂不公开/月', tags: ['downstream'] },
  { name: 'Singapore', country: 'sg', bandwidth: '1Gbps', provider: 'Moedove', session: 'AS213605 BGP Session', price: '暂不公开/月', tags: ['downstream'] },
  { name: 'Germany', country: 'de', bandwidth: '1Gbps', provider: 'Moedove', session: 'AS213605 BGP Session', price: '暂不公开/月', tags: ['downstream'] },
  { name: 'USA', country: 'us', bandwidth: '1Gbps', provider: 'Moedove', session: 'AS213605 BGP Session', price: '暂不公开/月', tags: ['downstream'] },
  { name: 'ONIX-Ontario', country: 'ca', bandwidth: '100Mbps', provider: 'Ontario Internet Exchange', session: 'AS213605 BGP Session', price: '—', tags: ['downstream', 'new'] },
]

const prefixes = ANYCAST_ASNS.map(asn => useRipeStat<AnnouncedPrefixes>('announced-prefixes', { resource: `AS${asn}` }))
const neighbours = useRipeStat<AsnNeighbours>('asn-neighbours', { resource: `AS${PRIMARY_ASN}` })
const ixlans = usePeeringDb<NetIxLan>('netixlan', { net_id: PEERINGDB_NET_ID })

const isPending = (s: { status: Ref<string> }) => s.status.value === 'pending' || s.status.value === 'idle'

const prefixLoading = computed(() => prefixes.some(isPending))
const prefixError = computed(() => prefixes.some(p => p.status.value === 'error'))
const prefixCount = computed(() => {
  const all = new Set(prefixes.flatMap(p => p.data.value?.prefixes.map(x => x.prefix) ?? []))
  const v6 = [...all].filter(p => p.includes(':')).length
  return { v4: all.size - v6, v6 }
})

const exchanges = computed(() => {
  const byId = new Map<number, string>()
  for (const lan of ixlans.data.value ?? []) {
    if (!byId.has(lan.ix_id)) byId.set(lan.ix_id, lan.name.split(':')[0]!.trim())
  }
  return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
})

const upstreams = computed(() => (neighbours.data.value?.neighbours ?? [])
  .filter(n => n.type === 'left')
  .sort((a, b) => b.power - a.power))
const upstreamResource = computed(() => upstreams.value.map(n => `AS${n.asn}`).join(','))

// One batched RIPEstat as-names call for every upstream; skipped until the neighbour list is known.
const asNames = useAsyncData(
  'anycast:upstream-names',
  async () => {
    const resource = upstreamResource.value
    if (!resource) return { resource, names: {} as Record<string, string> }
    const res = await $fetch<{ data: { names: Record<string, string> } }>('https://stat.ripe.net/data/as-names/data.json', {
      query: { resource, sourceapp: 'anycast-ink' },
    })
    return { resource, names: res.data.names }
  },
  { server: false, lazy: true, watch: [upstreamResource] },
)
const namesLoading = computed(() => asNames.status.value !== 'error' && asNames.data.value?.resource !== upstreamResource.value)

/** RIPEstat names look like "HANDLE - Organisation"; missing names fall back to the bare ASN. */
const holders = computed(() => {
  const map = new Map<number, { handle: string | null, org: string }>()
  for (const [asn, raw] of Object.entries(asNames.data.value?.names ?? {})) {
    const i = raw.indexOf(' - ')
    map.set(Number(asn), i === -1 ? { handle: null, org: raw } : { handle: raw.slice(0, i), org: raw.slice(i + 3) })
  }
  return map
})

function retryFailed() {
  for (const req of [...prefixes, neighbours, ixlans]) {
    if (req.status.value === 'error') req.refresh()
  }
}

const linkClass = 'underline-offset-4 hover:text-foreground hover:underline'
</script>

<template>
  <div>
    <PageSeo title="Anycast 网络" description="Pysio Networks AS213605 / AS154185 全球 Anycast 节点、地址块、交换点与上游互联。" />

    <PageHeader eyebrow="网络" title="AS213605 Networks">
      <template #description>
        PYSIO-NetWork（AS213605、AS154185）是一个独立运营的网络系统，在全球部署 Anycast 节点并接入多个互联网交换中心。
      </template>
      <template #actions>
        <Button v-for="r in registries" :key="r.asn" variant="outline" size="sm" as-child>
          <a :href="r.href" target="_blank" rel="noopener">
            <span class="font-mono">AS{{ r.asn }}</span>
            <span class="text-muted-foreground">{{ r.registry }}</span>
            <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
        <Button v-for="asn in ANYCAST_ASNS" :key="`bgptools-${asn}`" variant="ghost" size="sm" as-child>
          <a :href="`https://bgp.tools/as/${asn}`" target="_blank" rel="noopener">
            bgp.tools <span class="font-mono">AS{{ asn }}</span>
            <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      </template>
    </PageHeader>

    <section class="page-container flex flex-col gap-4 py-12">
      <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        <StatCard label="IPv4 前缀" :value="prefixError ? null : prefixCount.v4" :loading="prefixLoading" hint="全部 ASN 当前公告" />
        <StatCard label="IPv6 前缀" :value="prefixError ? null : prefixCount.v6" :loading="prefixLoading" hint="全部 ASN 当前公告" />
        <StatCard
          label="上游"
          :value="neighbours.data.value?.neighbour_counts.left"
          :loading="isPending(neighbours)"
          :hint="neighbours.data.value ? `下游 ${neighbours.data.value.neighbour_counts.right} · 对等/未定 ${neighbours.data.value.neighbour_counts.uncertain}` : `AS${PRIMARY_ASN}`"
        />
        <StatCard label="IX 接入" :value="ixlans.data.value ? exchanges.length : null" :loading="isPending(ixlans)" hint="PeeringDB 登记" />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          数据实时来自
          <a href="https://stat.ripe.net" target="_blank" rel="noopener" :class="linkClass">RIPEstat</a>
          与
          <a :href="`https://www.peeringdb.com/net/${PEERINGDB_NET_ID}`" target="_blank" rel="noopener" :class="linkClass">PeeringDB</a>
        </p>
        <Button
          v-if="prefixError || neighbours.status.value === 'error' || ixlans.status.value === 'error'"
          variant="outline"
          size="xs"
          @click="retryFailed"
        >
          <RefreshCw data-icon="inline-start" /> 部分数据加载失败，重试
        </Button>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 pb-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">网络信息</h2>
        <p class="text-muted-foreground">自治系统、地址块与接入的交换点。</p>
      </div>

      <Alert>
        <Network />
        <AlertTitle>开放互联</AlertTitle>
        <AlertDescription>
          <p>
            我们支持所有地区和所有人的 Peer 和下游链接，无门槛，仅限非商业用途。查看我们的
            <NuxtLink to="/ix" class="font-medium text-foreground underline underline-offset-4">IX 交换点</NuxtLink>
            了解详细信息；我们现在支持下游连接，无论您位于哪个地区，欢迎查看我们的
            <NuxtLink to="/downstream" class="font-medium text-foreground underline underline-offset-4">下游政策</NuxtLink>。
            如果您对 DN42 网络感兴趣，请查看我们的
            <NuxtLink to="/dn42" class="font-medium text-foreground underline underline-offset-4">DN42 页面</NuxtLink>。
          </p>
        </AlertDescription>
      </Alert>

      <div class="grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2 lg:grid-cols-4">
        <div class="flex flex-col gap-3 bg-background p-6">
          <p class="text-sm text-muted-foreground">ASN</p>
          <ul class="flex flex-col gap-1.5">
            <li v-for="r in registries" :key="r.asn">
              <a :href="r.href" target="_blank" rel="noopener" class="font-mono text-lg font-semibold tabular-nums underline-offset-4 hover:underline">AS{{ r.asn }}</a>
            </li>
          </ul>
        </div>
        <div class="flex flex-col gap-3 bg-background p-6">
          <p class="text-sm text-muted-foreground">IPv6 地址块</p>
          <ul class="flex flex-col gap-1.5 font-mono text-sm tabular-nums">
            <li v-for="block in addressBlocks.v6" :key="block">{{ block }}</li>
          </ul>
        </div>
        <div class="flex flex-col gap-3 bg-background p-6">
          <p class="text-sm text-muted-foreground">IPv4 地址块</p>
          <ul class="flex flex-col gap-1.5 font-mono text-sm tabular-nums">
            <li v-for="block in addressBlocks.v4" :key="block">{{ block }}</li>
          </ul>
          <NuxtLink to="/prefixes" class="mt-auto inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            查看实时公告前缀 <ArrowRight class="size-3" />
          </NuxtLink>
        </div>
        <div class="flex flex-col gap-3 bg-background p-6">
          <p class="text-sm text-muted-foreground">交换点</p>
          <div v-if="isPending(ixlans)" class="flex flex-wrap gap-1.5">
            <Skeleton v-for="i in 6" :key="i" class="h-5 w-16 rounded-full" />
          </div>
          <p v-else-if="ixlans.status.value === 'error'" class="text-sm text-destructive">加载失败</p>
          <p v-else-if="!exchanges.length" class="text-sm text-muted-foreground">暂无数据</p>
          <div v-else class="flex flex-wrap gap-1.5">
            <Badge v-for="ix in exchanges" :key="ix.id" variant="outline" as-child>
              <a :href="`https://www.peeringdb.com/ix/${ix.id}`" target="_blank" rel="noopener">{{ ix.name }}</a>
            </Badge>
          </div>
          <NuxtLink to="/ix" class="mt-auto inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            IX 互联详情 <ArrowRight class="size-3" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">节点列表</h2>
        <p class="text-muted-foreground">全部节点均支持 IPv4 + IPv6。</p>
      </div>

      <div class="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/40 hover:bg-muted/40">
              <TableHead class="pl-4">节点</TableHead>
              <TableHead>带宽</TableHead>
              <TableHead>机房 / 提供商</TableHead>
              <TableHead>BGP 会话</TableHead>
              <TableHead>备注</TableHead>
              <TableHead class="pr-4 text-right">价格</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="node in nodes" :key="node.name">
              <TableCell class="pl-4">
                <div class="flex items-center gap-2 font-medium">
                  <span :class="`fi fi-${node.country} shrink-0 rounded-[2px]`" />
                  {{ node.name }}
                </div>
              </TableCell>
              <TableCell class="font-mono text-xs tabular-nums">{{ node.bandwidth }}</TableCell>
              <TableCell class="text-muted-foreground">{{ node.provider }}</TableCell>
              <TableCell class="font-mono text-xs">{{ node.session }}</TableCell>
              <TableCell>
                <div class="flex flex-wrap items-center gap-1.5">
                  <Badge v-for="tag in node.tags ?? []" :key="tag" :class="tagMeta[tag].class">{{ tagMeta[tag].label }}</Badge>
                  <span v-for="note in node.notes ?? []" :key="note" class="text-xs text-muted-foreground">{{ note }}</span>
                  <span v-if="!node.tags?.length && !node.notes?.length" class="text-muted-foreground">—</span>
                </div>
              </TableCell>
              <TableCell class="pr-4 text-right font-mono text-xs tabular-nums">{{ node.price }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12">
      <div class="flex items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-semibold tracking-tight">上游</h2>
          <p class="text-muted-foreground">
            RIPEstat 观测到的 <span class="font-mono">AS{{ PRIMARY_ASN }}</span> 上游邻居，按可见度排序。
          </p>
        </div>
        <Button variant="ghost" size="sm" as-child>
          <a :href="`https://bgp.tools/as/${PRIMARY_ASN}`" target="_blank" rel="noopener">bgp.tools <ArrowUpRight data-icon="inline-end" /></a>
        </Button>
      </div>

      <Alert v-if="neighbours.status.value === 'error'" variant="destructive">
        <AlertTitle>无法加载上游数据</AlertTitle>
        <AlertDescription>
          <p>RIPEstat 请求失败，请稍后重试。</p>
          <Button variant="outline" size="sm" class="mt-2" @click="neighbours.refresh()">
            <RefreshCw data-icon="inline-start" /> 重试
          </Button>
        </AlertDescription>
      </Alert>

      <div v-else class="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/40 hover:bg-muted/40">
              <TableHead class="w-12 pl-4">#</TableHead>
              <TableHead>ASN</TableHead>
              <TableHead>名称</TableHead>
              <TableHead class="text-right">可见度</TableHead>
              <TableHead class="text-right">IPv4 观测</TableHead>
              <TableHead class="pr-4 text-right">IPv6 观测</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="isPending(neighbours)">
              <TableRow v-for="i in 6" :key="i">
                <TableCell v-for="j in 6" :key="j" :class="j === 1 ? 'pl-4' : j === 6 ? 'pr-4' : ''">
                  <Skeleton class="h-4" :class="j === 3 ? 'w-48' : 'w-12'" />
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="!upstreams.length">
              <TableCell colspan="6" class="py-8 text-center text-muted-foreground">暂无上游数据</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="(n, i) in upstreams" :key="n.asn">
                <TableCell class="pl-4 font-mono text-xs text-muted-foreground tabular-nums">{{ i + 1 }}</TableCell>
                <TableCell>
                  <a :href="`https://bgp.tools/as/${n.asn}`" target="_blank" rel="noopener" class="font-mono tabular-nums underline-offset-4 hover:underline">AS{{ n.asn }}</a>
                </TableCell>
                <TableCell class="max-w-80">
                  <Skeleton v-if="namesLoading" class="h-4 w-40" />
                  <div v-else-if="holders.get(n.asn)" class="flex min-w-0 items-baseline gap-2">
                    <span class="truncate">{{ holders.get(n.asn)!.org }}</span>
                    <span v-if="holders.get(n.asn)!.handle" class="shrink-0 font-mono text-xs text-muted-foreground">{{ holders.get(n.asn)!.handle }}</span>
                  </div>
                  <span v-else class="text-muted-foreground">—</span>
                </TableCell>
                <TableCell class="text-right font-mono tabular-nums">{{ n.power }}</TableCell>
                <TableCell class="text-right font-mono text-muted-foreground tabular-nums">{{ n.v4_peers }}</TableCell>
                <TableCell class="pr-4 text-right font-mono text-muted-foreground tabular-nums">{{ n.v6_peers }}</TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
      <p class="text-xs text-muted-foreground">
        可见度为 RIPE RIS 采集点观测到该邻接关系的次数；IPv4 / IPv6 观测为对应协议下的观测数。
      </p>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12 pb-24">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">互联与工具</h2>
        <p class="text-muted-foreground">建立 Peer、申请下游，或查看网络实时状态。</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LinkCard to="/bgp?q=AS213605" title="BGP 路由查询" description="通过 RIPE RIS 全球采集点查看我们的路由" :icon="Search" />
        <LinkCard to="/ix" title="IX 互联" description="交换点对等互联政策与接入信息" :icon="Cable" />
        <LinkCard to="/downstream" title="下游接入" description="面向所有地区的非商业下游连接" :icon="Share2" />
        <LinkCard to="/dn42" title="DN42" description="DN42 实验网络互联" :icon="Network" />
      </div>
      <Card class="flex-row flex-wrap items-center justify-between gap-4 px-6">
        <div class="flex flex-col gap-1">
          <p class="font-medium">联系我们</p>
          <p class="text-sm text-muted-foreground">Peer、下游或其他网络合作，请通过邮件联系。</p>
        </div>
        <Button as-child>
          <a href="mailto:team@pysio.online"><Mail data-icon="inline-start" /> team@pysio.online</a>
        </Button>
      </Card>
    </section>
  </div>
</template>
