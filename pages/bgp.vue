<script setup lang="ts">
import { ArrowUpRight, ChevronRight, RotateCw, Search } from '@lucide/vue'
import { Cache } from '~/utils/cache'

type Kind = 'asn' | 'ip' | 'prefix'
interface Target { kind: Kind, resource: string, family: 4 | 6 | null }

interface LgPeer {
  asn_origin: string
  as_path: string
  community: string
  largeCommunity: string
  last_updated: string
  prefix: string
  peer: string
  origin: string
  next_hop: string
  community_info?: {
    regular?: Record<string, { description: string }>
    large?: Record<string, { description: string }>
  }
}
interface LookingGlass { rrcs: { rrc: string, location: string, peers: LgPeer[] }[] }
interface PrefixOverview {
  resource: string
  announced: boolean
  asns: { asn: number, holder: string }[]
  related_prefixes: string[]
  block?: { resource: string, desc: string, name: string }
}
interface Visibility { ris_peers_seeing: number, total_ris_peers: number }
interface SeenAt { prefix: string, origin: string, time: string }
interface RoutingStatus {
  resource: string
  visibility: { v4: Visibility, v6: Visibility }
  first_seen?: SeenAt | null
  last_seen?: SeenAt | null
  less_specifics?: { prefix: string, origin: number }[]
  more_specifics?: { prefix: string, origin: number }[]
  announced_space?: { v4: { prefixes: number, ips: number }, v6: { prefixes: number, '48s': number } }
  observed_neighbours?: number
}
interface Roa { origin: string, prefix: string, validity: string, max_length: number }
interface RpkiValidation { status: string, validating_roas: Roa[] }
interface RpkiResult extends RpkiValidation { asn: number }
interface AsOverview { resource: string, holder: string, announced: boolean, block?: { resource: string, desc: string } }
interface AnnouncedPrefixes { prefixes: { prefix: string, timelines: { starttime: string, endtime: string }[] }[] }
type NeighbourType = 'left' | 'right' | 'uncertain'
interface AsnNeighbours {
  neighbour_counts: { left: number, right: number, unique: number, uncertain: number }
  neighbours: { asn: number, type: NeighbourType, power: number, v4_peers: number, v6_peers: number }[]
}

interface Hop { asn: string, count: number }
interface Community { value: string, desc?: string }
interface Route {
  key: string
  rrc: string
  location: string
  prefix: string
  peer: string
  hops: Hop[]
  communities: Community[]
  nextHop: string
  lastUpdated: string
}

interface Section<T> { data: T | null, loading: boolean, error: string }

const EXAMPLES = ['1.1.1.1', '2001:4860::/32', 'AS213605', '49.213.62.0/24']
const ROUTE_PAGE = 50
const PREFIX_PAGE = 100
const NEIGHBOUR_PAGE = 25
const COMMUNITY_PREVIEW = 6
const UPSTREAM_TOP = 10

// ---------- input parsing ----------

function isV4(addr: string) {
  const m = addr.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  return !!m && m.slice(1).every(o => Number(o) <= 255)
}

function isV6(addr: string) {
  if (!addr.includes(':') || !/^[0-9a-f:.]+$/i.test(addr))
    return false
  try {
    new URL(`http://[${addr}]/`)
    return true
  }
  catch {
    return false
  }
}

function parseTarget(raw: string): Target | null {
  const v = raw.trim().replace(/\s+/g, '')
  const asn = v.match(/^(?:AS)?(\d{1,10})$/i)
  if (asn) {
    const n = Number(asn[1])
    return n > 0 && n <= 4294967295 ? { kind: 'asn', resource: `AS${n}`, family: null } : null
  }
  const [addr = '', len, ...rest] = v.split('/')
  if (rest.length)
    return null
  const family = isV4(addr) ? 4 : isV6(addr) ? 6 : null
  if (!family)
    return null
  if (len === undefined)
    return { kind: 'ip', resource: addr.toLowerCase(), family }
  if (!/^\d{1,3}$/.test(len) || Number(len) > (family === 4 ? 32 : 128))
    return null
  return { kind: 'prefix', resource: `${addr.toLowerCase()}/${Number(len)}`, family }
}

const kindLabel = (t: Target) => t.kind === 'asn' ? 'ASN' : `IPv${t.family} ${t.kind === 'ip' ? '地址' : '前缀'}`

// ---------- RIPEstat ----------

async function ripe<T>(call: string, query: Record<string, string>): Promise<T> {
  const res = await $fetch<{ status: string, data: T, messages?: [string, string][] }>(
    `https://stat.ripe.net/data/${call}/data.json`,
    { query: { ...query, sourceapp: 'anycast-ink' } },
  )
  if (res.status !== 'ok')
    throw new Error(res.messages?.find(m => m[0] === 'error')?.[1] ?? 'RIPEstat 返回错误')
  return res.data
}

function errorMessage(e: unknown): string {
  const err = e as { data?: { messages?: [string, string][] }, message?: string }
  return err.data?.messages?.find(m => m[0] === 'error')?.[1] ?? err.message ?? '未知错误'
}

const section = <T>() => shallowReactive<Section<T>>({ data: null, loading: false, error: '' })

const lg = section<LookingGlass>()
const overview = section<PrefixOverview>()
const status = section<RoutingStatus>()
const rpki = section<RpkiResult[]>()
const asOverview = section<AsOverview>()
const prefixes = section<AnnouncedPrefixes>()
const neighbours = section<AsnNeighbours>()
const allSections = [lg, overview, status, rpki, asOverview, prefixes, neighbours] as Section<unknown>[]

let runId = 0

async function load<T>(s: Section<T>, id: number, fn: () => Promise<T>) {
  s.loading = true
  try {
    const data = await fn()
    if (id === runId)
      s.data = data
  }
  catch (e) {
    if (id === runId)
      s.error = errorMessage(e)
  }
  finally {
    if (id === runId)
      s.loading = false
  }
}

// ---------- query state ----------

const route = useRoute()
const router = useRouter()
const routeQuery = () => (typeof route.query.q === 'string' ? route.query.q : '')

const input = ref(routeQuery())
/** Last rejected input; the error shows until the user edits it. */
const rejected = ref('')
const target = shallowRef<Target | null>(null)
const inputTarget = computed(() => parseTarget(input.value))
const showInvalid = computed(() => !!rejected.value && rejected.value === input.value.trim())

function run(t: Target) {
  const id = ++runId
  target.value = t
  for (const s of allSections) {
    s.data = null
    s.error = ''
    s.loading = false
  }
  resetFilters()

  if (t.kind === 'asn') {
    load(asOverview, id, () => ripe<AsOverview>('as-overview', { resource: t.resource }))
    load(status, id, () => ripe<RoutingStatus>('routing-status', { resource: t.resource }))
    load(prefixes, id, () => ripe<AnnouncedPrefixes>('announced-prefixes', { resource: t.resource }))
    load(neighbours, id, () => ripe<AsnNeighbours>('asn-neighbours', { resource: t.resource }))
    return
  }

  load(lg, id, () => ripe<LookingGlass>('looking-glass', { resource: t.resource }))
  load(status, id, () => ripe<RoutingStatus>('routing-status', { resource: t.resource }))
  load(overview, id, () => ripe<PrefixOverview>('prefix-overview', { resource: t.resource })).then(() => {
    const o = overview.data
    if (id !== runId || !o?.announced || !o.asns.length)
      return
    load(rpki, id, () => Promise.all(o.asns.map(a =>
      ripe<RpkiValidation>('rpki-validation', { resource: `AS${a.asn}`, prefix: o.resource })
        .then(r => ({ ...r, asn: a.asn })),
    )))
  })
}

function submit(value = input.value) {
  const t = parseTarget(value)
  rejected.value = t ? '' : value.trim()
  if (!t)
    return
  input.value = t.resource
  if (routeQuery() === t.resource)
    run(t)
  else
    router.push({ query: { ...route.query, q: t.resource } })
}

function retry() {
  if (target.value)
    run(target.value)
}

onMounted(() => {
  watch(() => route.query.q, (q, prev) => {
    const value = typeof q === 'string' ? q : ''
    input.value = value
    const t = parseTarget(value)
    rejected.value = t ? '' : value.trim()
    if (!t) {
      target.value = null
      return
    }
    run(t)
    if (prev !== undefined)
      document.getElementById('bgp-query-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, { immediate: true })
})

const failures = computed(() => ([
  ['looking-glass', lg],
  ['prefix-overview', overview],
  ['routing-status', status],
  ['rpki-validation', rpki],
  ['as-overview', asOverview],
  ['announced-prefixes', prefixes],
  ['asn-neighbours', neighbours],
] as [string, Section<unknown>][]).filter(([, s]) => s.error).map(([call, s]) => ({ call, error: s.error })))

// ---------- shared helpers ----------

const fmtNum = (n: number) => n.toLocaleString('en-US')
const fmtTime = (t?: string | null) => (t ? t.replace('T', ' ').slice(0, 16) : '—')
const pct = (v?: Visibility) => (v && v.total_ris_peers ? `${(v.ris_peers_seeing / v.total_ris_peers * 100).toFixed(1)}%` : '—')
const isAsn = (asn: string) => /^\d+$/.test(asn)
const queryLink = (q: string) => ({ query: { ...route.query, q } })

function sortKey(prefix: string): string {
  const [addr = '', len = '0'] = prefix.split('/')
  if (!addr.includes(':'))
    return `4${addr.split('.').map(o => o.padStart(3, '0')).join('')}/${len.padStart(3, '0')}`
  const [head = '', tail = ''] = addr.split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  const groups = [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t]
  return `6${groups.map(g => g.padStart(4, '0')).join('')}/${len.padStart(3, '0')}`
}

const rpkiBadges: Record<string, { label: string, class: string }> = {
  valid: { label: '有效', class: 'bg-success/15 text-success border-transparent' },
  invalid: { label: '无效', class: 'bg-destructive/15 text-destructive border-transparent' },
  invalid_asn: { label: '无效 · 起源不符', class: 'bg-destructive/15 text-destructive border-transparent' },
  invalid_length: { label: '无效 · 长度超限', class: 'bg-destructive/15 text-destructive border-transparent' },
  unknown: { label: '未知 · 无 ROA', class: 'bg-muted text-muted-foreground border-transparent' },
}
const rpkiBadge = (s: string) => rpkiBadges[s] ?? rpkiBadges.unknown!

// AS names (as-names), only for the handful of ASNs shown in summary lists.
const asNames = reactive<Record<string, string>>({})
const namesRequested = new Set<string>()

async function ensureNames(asns: string[]) {
  const todo: string[] = []
  for (const asn of asns) {
    if (!isAsn(asn) || namesRequested.has(asn))
      continue
    namesRequested.add(asn)
    const cached = Cache.get<string>(`api_req_asname_${asn}`)
    if (cached)
      asNames[asn] = cached
    else
      todo.push(asn)
  }
  await Promise.all(todo.map(async (asn) => {
    try {
      const d = await ripe<{ names: Record<string, string> }>('as-names', { resource: `AS${asn}` })
      const name = d.names[asn]
      if (name) {
        asNames[asn] = name
        Cache.set(`api_req_asname_${asn}`, name)
      }
    }
    catch {
      namesRequested.delete(asn)
    }
  }))
}

// ---------- prefix / IP mode ----------

function compressPath(path: string): Hop[] {
  const hops: Hop[] = []
  for (const asn of path.split(' ').filter(Boolean)) {
    const last = hops[hops.length - 1]
    if (last?.asn === asn)
      last.count++
    else
      hops.push({ asn, count: 1 })
  }
  return hops
}

const routes = computed<Route[]>(() => (lg.data?.rrcs ?? []).flatMap(rrc => rrc.peers.map((p, i) => ({
  key: `${rrc.rrc}-${p.peer}-${p.prefix}-${i}`,
  rrc: rrc.rrc,
  location: rrc.location,
  prefix: p.prefix,
  peer: p.peer,
  hops: compressPath(p.as_path),
  communities: [
    ...p.community.split(' ').filter(Boolean).map(value => ({ value, desc: p.community_info?.regular?.[value]?.description })),
    ...p.largeCommunity.split(' ').filter(Boolean).map(value => ({ value, desc: p.community_info?.large?.[value]?.description })),
  ],
  nextHop: p.next_hop,
  lastUpdated: p.last_updated,
}))).sort((a, b) => a.rrc.localeCompare(b.rrc) || a.hops.length - b.hops.length))

const collectors = computed(() => (lg.data?.rrcs ?? [])
  .map(r => ({ rrc: r.rrc, location: r.location, count: r.peers.length }))
  .sort((a, b) => a.rrc.localeCompare(b.rrc)))
const activeCollectors = computed(() => collectors.value.filter(c => c.count).length)
const matchedPrefixes = computed(() => [...new Set(routes.value.map(r => r.prefix))].sort((a, b) => sortKey(a).localeCompare(sortKey(b))))

const originAsns = computed(() => overview.data?.asns.length
  ? overview.data.asns.map(a => String(a.asn))
  : [...new Set(routes.value.map(r => r.hops[r.hops.length - 1]?.asn).filter((a): a is string => !!a))])
const originHolder = computed(() => overview.data?.asns.map(a => a.holder).join('；') || undefined)

const prefixVisibility = computed(() => {
  const v = status.data?.visibility
  if (!v)
    return undefined
  return target.value?.family === 6 ? v.v6 : v.v4
})

const rpkiSummary = computed(() => {
  const results = rpki.data
  if (!results?.length)
    return null
  const worst = results.find(r => r.status.startsWith('invalid')) ?? results.find(r => r.status !== 'valid') ?? results[0]!
  return { status: worst.status, label: rpkiBadge(worst.status).label }
})

const relatedPrefixes = computed(() => {
  const set = new Set<string>([
    ...(overview.data?.related_prefixes ?? []),
    ...(status.data?.less_specifics ?? []).map(p => p.prefix),
    ...(status.data?.more_specifics ?? []).map(p => p.prefix),
  ])
  for (const p of matchedPrefixes.value)
    set.delete(p)
  if (overview.data)
    set.delete(overview.data.resource)
  return [...set].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
})
const showAllRelated = ref(false)

const upstreams = computed(() => {
  const counts = new Map<string, number>()
  let total = 0
  let direct = 0
  for (const r of routes.value) {
    if (r.hops.length < 2) {
      direct++
      continue
    }
    const asn = r.hops[r.hops.length - 2]!.asn
    counts.set(asn, (counts.get(asn) ?? 0) + 1)
    total++
  }
  const list = [...counts.entries()].map(([asn, count]) => ({ asn, count })).sort((a, b) => b.count - a.count)
  return { total, direct, list, top: list.slice(0, UPSTREAM_TOP), others: Math.max(0, list.length - UPSTREAM_TOP) }
})

const rrcFilter = ref('all')
const prefixFilter = ref('all')
const routeSearch = ref('')
const routeLimit = ref(ROUTE_PAGE)
const expanded = reactive(new Set<string>())

const filteredRoutes = computed(() => {
  const q = routeSearch.value.trim().toLowerCase().replace(/^as(?=\d)/, '')
  return routes.value.filter((r) => {
    if (rrcFilter.value !== 'all' && r.rrc !== rrcFilter.value)
      return false
    if (prefixFilter.value !== 'all' && r.prefix !== prefixFilter.value)
      return false
    return !q
      || r.peer.toLowerCase().includes(q)
      || r.nextHop.toLowerCase().includes(q)
      || r.hops.some(h => h.asn === q)
      || r.communities.some(c => c.value.includes(q))
  })
})
const shownRoutes = computed(() => filteredRoutes.value.slice(0, routeLimit.value))

watch([rrcFilter, prefixFilter, routeSearch], () => {
  routeLimit.value = ROUTE_PAGE
})

// ---------- ASN mode ----------

type Family = 'all' | 'v4' | 'v6'
const prefixFamily = ref<Family>('all')
const prefixSearch = ref('')
const prefixLimit = ref(PREFIX_PAGE)

const prefixRows = computed(() => (prefixes.data?.prefixes ?? []).map(p => ({
  prefix: p.prefix,
  family: p.prefix.includes(':') ? 6 : 4,
  firstSeen: p.timelines.reduce<string | null>((min, t) => (!min || t.starttime < min ? t.starttime : min), null),
  key: sortKey(p.prefix),
})).sort((a, b) => a.key.localeCompare(b.key)))

const filteredPrefixes = computed(() => {
  const q = prefixSearch.value.trim().toLowerCase()
  return prefixRows.value.filter((r) => {
    if (prefixFamily.value === 'v4' && r.family !== 4)
      return false
    if (prefixFamily.value === 'v6' && r.family !== 6)
      return false
    return !q || r.prefix.includes(q)
  })
})
const shownPrefixes = computed(() => filteredPrefixes.value.slice(0, prefixLimit.value))

function setFamily(v: unknown) {
  if (v === 'all' || v === 'v4' || v === 'v6')
    prefixFamily.value = v
}

watch([prefixFamily, prefixSearch], () => {
  prefixLimit.value = PREFIX_PAGE
})

const neighbourTab = ref<NeighbourType>('left')
const neighbourLimit = ref(NEIGHBOUR_PAGE)
const neighbourTabs: { value: NeighbourType, label: string }[] = [
  { value: 'left', label: '上游' },
  { value: 'right', label: '下游' },
  { value: 'uncertain', label: '不确定' },
]
const neighbourCount = (type: NeighbourType) => neighbours.data?.neighbours.filter(n => n.type === type).length ?? 0
const filteredNeighbours = computed(() => (neighbours.data?.neighbours ?? [])
  .filter(n => n.type === neighbourTab.value)
  .sort((a, b) => b.power - a.power))
const shownNeighbours = computed(() => filteredNeighbours.value.slice(0, neighbourLimit.value))

function setNeighbourTab(v: string | number) {
  if (v === 'left' || v === 'right' || v === 'uncertain') {
    neighbourTab.value = v
    neighbourLimit.value = NEIGHBOUR_PAGE
  }
}

function resetFilters() {
  rrcFilter.value = 'all'
  prefixFilter.value = 'all'
  routeSearch.value = ''
  routeLimit.value = ROUTE_PAGE
  expanded.clear()
  showAllRelated.value = false
  prefixFamily.value = 'all'
  prefixSearch.value = ''
  prefixLimit.value = PREFIX_PAGE
  neighbourTab.value = 'left'
  neighbourLimit.value = NEIGHBOUR_PAGE
}

watch(
  () => target.value?.kind === 'asn'
    ? shownNeighbours.value.slice(0, NEIGHBOUR_PAGE).map(n => String(n.asn))
    : upstreams.value.top.map(u => u.asn),
  ensureNames,
)

// ---------- external links ----------

const links = computed(() => {
  const t = target.value
  if (!t)
    return []
  if (t.kind === 'asn') {
    const n = t.resource.slice(2)
    return [
      { label: 'bgp.tools', href: `https://bgp.tools/as/${n}` },
      { label: 'RIPEstat', href: `https://stat.ripe.net/app/launchpad/${t.resource}` },
      { label: 'Hurricane Electric', href: `https://bgp.he.net/${t.resource}` },
    ]
  }
  const prefix = t.kind === 'prefix' ? t.resource : (overview.data?.announced ? overview.data.resource : null)
  return [
    { label: 'bgp.tools', href: `https://bgp.tools/prefix/${prefix ?? t.resource}` },
    { label: 'RIPEstat', href: `https://stat.ripe.net/app/launchpad/${t.resource}` },
    { label: 'Hurricane Electric', href: t.kind === 'ip' ? `https://bgp.he.net/ip/${t.resource}` : `https://bgp.he.net/net/${t.resource}` },
  ]
})
const whoisQuery = computed(() => {
  const t = target.value
  return t ? (t.kind === 'prefix' ? t.resource.split('/')[0]! : t.resource) : ''
})
</script>

<template>
  <div>
    <PageSeo
      title="BGP 路由查询 · Looking Glass"
      description="基于 RIPE RIS 全球路由采集点的公共 Looking Glass：查询 IP、前缀或 ASN 的 BGP 路由、AS 路径、Community、RPKI 状态与上下游关系。"
    />

    <PageHeader
      eyebrow="工具"
      title="BGP 路由查询"
      description="以 RIPE RIS 全球路由采集点作为公共 Looking Glass，查看 IP、前缀或 ASN 在全球 BGP 路由表中的 AS 路径、Community、RPKI 状态与可见度。"
    />

    <section id="bgp-query-form" class="page-container scroll-mt-20 py-12">
      <Card>
        <CardHeader>
          <CardTitle>查询目标</CardTitle>
          <CardDescription>支持 IPv4 / IPv6 地址、CIDR 前缀或 ASN，自动识别类型。</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="submit()">
            <Label for="bgp-query" class="sr-only">IP、前缀或 ASN</Label>
            <Input
              id="bgp-query"
              v-model="input"
              class="flex-1 font-mono"
              placeholder="1.1.1.1、2001:4860::/32 或 AS213605"
              autocomplete="off"
              spellcheck="false"
              :aria-invalid="showInvalid"
            />
            <Button type="submit" :disabled="!input.trim()">
              <Search data-icon="inline-start" />
              查询
            </Button>
          </form>
          <p v-if="showInvalid" class="text-sm text-destructive">
            无法识别该输入，请输入 IPv4 / IPv6 地址、CIDR 前缀或 ASN（如 AS213605）。
          </p>
          <p v-else-if="inputTarget" class="text-sm text-muted-foreground">
            识别为 <span class="text-foreground">{{ kindLabel(inputTarget) }}</span>
            <span class="ml-1 font-mono text-foreground">{{ inputTarget.resource }}</span>
          </p>
          <div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            示例
            <Button
              v-for="ex in EXAMPLES"
              :key="ex"
              variant="outline"
              size="xs"
              class="font-mono"
              @click="submit(ex)"
            >
              {{ ex }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>

    <template v-if="target">
      <section class="page-container flex flex-col gap-6 border-t py-12">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div class="flex min-w-0 flex-col gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{{ kindLabel(target) }}</Badge>
              <Badge
                v-if="target.kind === 'asn' && asOverview.data"
                :class="asOverview.data.announced ? 'bg-success/15 text-success border-transparent' : 'bg-muted text-muted-foreground border-transparent'"
              >
                {{ asOverview.data.announced ? '正在公告' : '未公告' }}
              </Badge>
              <Badge
                v-else-if="target.kind !== 'asn' && overview.data"
                :class="overview.data.announced ? 'bg-success/15 text-success border-transparent' : 'bg-muted text-muted-foreground border-transparent'"
              >
                {{ overview.data.announced ? '正在公告' : '未公告' }}
              </Badge>
            </div>
            <h2 class="font-mono text-2xl font-semibold tracking-tight break-all md:text-3xl">{{ target.resource }}</h2>
            <Skeleton v-if="(target.kind === 'asn' ? asOverview : overview).loading" class="h-5 w-64" />
            <p v-else-if="target.kind === 'asn' && asOverview.data?.holder" class="text-muted-foreground">{{ asOverview.data.holder }}</p>
            <p v-else-if="target.kind !== 'asn' && originHolder" class="text-muted-foreground">{{ originHolder }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button v-for="l in links" :key="l.label" variant="outline" size="sm" as-child>
              <a :href="l.href" target="_blank" rel="noopener">
                {{ l.label }} <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
            <Button variant="outline" size="sm" as-child>
              <NuxtLink :to="{ path: '/whois', query: { q: whoisQuery } }">WHOIS</NuxtLink>
            </Button>
            <Button v-if="target?.kind === 'ip'" variant="outline" size="sm" as-child>
              <NuxtLink :to="{ path: '/ip', query: { q: target.resource } }">IP 定位</NuxtLink>
            </Button>
          </div>
        </div>

        <div v-if="target.kind === 'asn'" class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
          <StatCard
            label="IPv4 前缀"
            :value="status.data?.announced_space ? fmtNum(status.data.announced_space.v4.prefixes) : null"
            :hint="status.data ? `RIS 可见度 ${pct(status.data.visibility.v4)}` : undefined"
            :loading="status.loading"
          />
          <StatCard
            label="IPv6 前缀"
            :value="status.data?.announced_space ? fmtNum(status.data.announced_space.v6.prefixes) : null"
            :hint="status.data ? `RIS 可见度 ${pct(status.data.visibility.v6)}` : undefined"
            :loading="status.loading"
          />
          <StatCard
            label="上游"
            :value="neighbours.data ? fmtNum(neighbours.data.neighbour_counts.left) : null"
            :hint="neighbours.data ? `另有 ${neighbours.data.neighbour_counts.uncertain} 个关系不确定` : undefined"
            :loading="neighbours.loading"
          />
          <StatCard
            label="下游"
            :value="neighbours.data ? fmtNum(neighbours.data.neighbour_counts.right) : null"
            :hint="neighbours.data ? `共 ${neighbours.data.neighbour_counts.unique} 个邻居` : undefined"
            :loading="neighbours.loading"
          />
        </div>

        <div v-else class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
          <StatCard
            label="起源 AS"
            :value="originAsns.length ? originAsns.map(a => `AS${a}`).join(' ') : null"
            :hint="overview.data && !overview.data.announced ? '未在全球路由表中公告' : originAsns.length > 1 ? 'MOAS · 多起源' : undefined"
            :loading="overview.loading"
          />
          <StatCard
            label="RPKI"
            :value="rpkiSummary?.label ?? null"
            :hint="overview.data && !overview.data.announced ? '无可验证的路由' : rpkiSummary ? `RIPEstat · Routinator` : undefined"
            :loading="overview.loading || rpki.loading"
          />
          <StatCard
            label="RIS 可见度"
            :value="pct(prefixVisibility)"
            :hint="prefixVisibility ? `${prefixVisibility.ris_peers_seeing} / ${prefixVisibility.total_ris_peers} 个全表对等体` : undefined"
            :loading="status.loading"
          />
          <StatCard
            label="采集点 / 对等体"
            :value="lg.data ? `${activeCollectors} / ${routes.length}` : null"
            hint="RIPE RIS 路由采集点"
            :loading="lg.loading"
          />
        </div>

        <Alert v-if="failures.length" variant="destructive">
          <AlertTitle>部分数据获取失败</AlertTitle>
          <AlertDescription>
            <ul class="flex flex-col gap-0.5">
              <li v-for="f in failures" :key="f.call"><span class="font-mono">{{ f.call }}</span>：{{ f.error }}</li>
            </ul>
          </AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" @click="retry">
              <RotateCw data-icon="inline-start" />
              重试
            </Button>
          </AlertAction>
        </Alert>

        <p class="text-xs text-muted-foreground">
          数据实时来自
          <a href="https://stat.ripe.net" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">RIPEstat</a>
          （RIPE RIS 路由采集点），可见度按 RIS 全表对等体统计。
        </p>
      </section>

      <!-- Prefix / IP mode -->
      <template v-if="target.kind !== 'asn'">
        <section class="page-container grid gap-6 pb-12 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>前缀概览</CardTitle>
              <CardDescription>来自 prefix-overview、routing-status 与 rpki-validation。</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="overview.loading || status.loading" class="flex flex-col gap-3">
                <Skeleton v-for="i in 5" :key="i" class="h-5 w-full" />
              </div>
              <dl v-else class="grid gap-4 text-sm sm:grid-cols-[8rem_1fr]">
                <dt class="text-muted-foreground">匹配前缀</dt>
                <dd class="flex flex-wrap gap-2 font-mono tabular-nums">
                  <template v-if="matchedPrefixes.length || overview.data?.announced">
                    <NuxtLink
                      v-for="p in matchedPrefixes.length ? matchedPrefixes : [overview.data!.resource]"
                      :key="p"
                      :to="queryLink(p)"
                      class="underline-offset-4 hover:underline"
                    >{{ p }}</NuxtLink>
                  </template>
                  <span v-else class="text-muted-foreground">—</span>
                </dd>

                <dt class="text-muted-foreground">起源 AS</dt>
                <dd class="flex flex-col gap-1">
                  <template v-if="overview.data?.asns.length">
                    <div v-for="a in overview.data.asns" :key="a.asn" class="flex flex-wrap items-baseline gap-x-2">
                      <NuxtLink :to="queryLink(`AS${a.asn}`)" class="font-mono tabular-nums underline-offset-4 hover:underline">AS{{ a.asn }}</NuxtLink>
                      <span class="text-muted-foreground">{{ a.holder }}</span>
                    </div>
                  </template>
                  <span v-else class="text-muted-foreground">—</span>
                </dd>

                <dt class="text-muted-foreground">RPKI</dt>
                <dd class="flex flex-col gap-2">
                  <div v-if="rpki.loading" class="flex gap-2"><Skeleton class="h-5 w-16" /></div>
                  <template v-else-if="rpki.data?.length">
                    <div v-for="r in rpki.data" :key="r.asn" class="flex flex-col gap-1.5">
                      <div class="flex flex-wrap items-center gap-2">
                        <Badge :class="rpkiBadge(r.status).class">{{ rpkiBadge(r.status).label }}</Badge>
                        <span v-if="rpki.data.length > 1" class="font-mono text-xs text-muted-foreground">AS{{ r.asn }}</span>
                      </div>
                      <ul v-if="r.validating_roas.length" class="flex flex-col gap-0.5 font-mono text-xs text-muted-foreground tabular-nums">
                        <li v-for="roa in r.validating_roas" :key="`${roa.origin}-${roa.prefix}-${roa.max_length}`">
                          ROA {{ roa.prefix }} · max /{{ roa.max_length }} · AS{{ roa.origin }}
                          <span :class="roa.validity === 'valid' ? 'text-success' : 'text-destructive'">{{ roa.validity === 'valid' ? '匹配' : '不匹配' }}</span>
                        </li>
                      </ul>
                    </div>
                  </template>
                  <span v-else class="text-muted-foreground">—</span>
                </dd>

                <dt class="text-muted-foreground">所属地址块</dt>
                <dd>
                  <template v-if="overview.data?.block">
                    <span class="font-mono tabular-nums">{{ overview.data.block.resource }}</span>
                    <span class="ml-2 text-muted-foreground">{{ overview.data.block.desc }}</span>
                  </template>
                  <span v-else class="text-muted-foreground">—</span>
                </dd>

                <dt class="text-muted-foreground">首次 / 最近可见</dt>
                <dd class="font-mono text-muted-foreground tabular-nums">
                  {{ fmtTime(status.data?.first_seen?.time) }} / {{ fmtTime(status.data?.last_seen?.time) }}
                  <span class="font-sans">UTC</span>
                </dd>

                <dt class="text-muted-foreground">相关前缀</dt>
                <dd>
                  <div v-if="relatedPrefixes.length" class="flex flex-wrap gap-1.5">
                    <NuxtLink
                      v-for="p in showAllRelated ? relatedPrefixes : relatedPrefixes.slice(0, 12)"
                      :key="p"
                      :to="queryLink(p)"
                      class="rounded-md border px-1.5 py-0.5 font-mono text-xs tabular-nums hover:bg-muted"
                    >{{ p }}</NuxtLink>
                    <Button v-if="relatedPrefixes.length > 12" variant="ghost" size="xs" @click="showAllRelated = !showAllRelated">
                      {{ showAllRelated ? '收起' : `另有 ${relatedPrefixes.length - 12} 条` }}
                    </Button>
                  </div>
                  <span v-else class="text-muted-foreground">无</span>
                </dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>上游分布</CardTitle>
              <CardDescription>所有 RIS 路径中紧邻起源 AS 的上一跳 AS 出现频率。</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="lg.loading" class="flex flex-col gap-4">
                <Skeleton v-for="i in 5" :key="i" class="h-8 w-full" />
              </div>
              <p v-else-if="!upstreams.total" class="text-sm text-muted-foreground">
                {{ routes.length ? '所有路径均由起源 AS 直接通告给采集点。' : '暂无路由数据。' }}
              </p>
              <ul v-else class="flex flex-col gap-3">
                <li v-for="u in upstreams.top" :key="u.asn" class="flex flex-col gap-1.5">
                  <div class="flex items-baseline justify-between gap-3 text-sm">
                    <div class="flex min-w-0 items-baseline gap-2">
                      <NuxtLink
                        v-if="isAsn(u.asn)"
                        :to="queryLink(`AS${u.asn}`)"
                        class="shrink-0 font-mono tabular-nums underline-offset-4 hover:underline"
                      >AS{{ u.asn }}</NuxtLink>
                      <span v-else class="shrink-0 font-mono">{{ u.asn }}</span>
                      <span class="truncate text-muted-foreground">{{ asNames[u.asn] ?? '' }}</span>
                    </div>
                    <span class="shrink-0 font-mono text-muted-foreground tabular-nums">
                      {{ u.count }} · {{ (u.count / upstreams.total * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div class="h-full rounded-full bg-foreground" :style="{ width: `${u.count / upstreams.list[0]!.count * 100}%` }" />
                  </div>
                </li>
                <li v-if="upstreams.others || upstreams.direct" class="text-xs text-muted-foreground">
                  <template v-if="upstreams.others">另有 {{ upstreams.others }} 个上游 AS。</template>
                  <template v-if="upstreams.direct">{{ upstreams.direct }} 条路径由起源 AS 直接通告给采集点。</template>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section class="page-container flex flex-col gap-6 border-t py-12 pb-24">
          <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-semibold tracking-tight">RIS 路由</h2>
            <p class="text-muted-foreground">
              RIPE RIS 各路由采集点的对等体当前学到的路由（最近 24 小时内仍有效）。点击 AS 号可继续查询。
            </p>
          </div>

          <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <Select v-model="rrcFilter">
              <SelectTrigger class="w-full md:w-72" aria-label="采集点">
                <SelectValue placeholder="全部采集点" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部采集点</SelectItem>
                <SelectItem v-for="c in collectors" :key="c.rrc" :value="c.rrc" :disabled="!c.count">
                  <span class="font-mono">{{ c.rrc }}</span> {{ c.location }} · {{ c.count }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-if="matchedPrefixes.length > 1" v-model="prefixFilter">
              <SelectTrigger class="w-full md:w-56" aria-label="前缀">
                <SelectValue placeholder="全部前缀" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部前缀</SelectItem>
                <SelectItem v-for="p in matchedPrefixes" :key="p" :value="p" class="font-mono">{{ p }}</SelectItem>
              </SelectContent>
            </Select>
            <div class="relative w-full md:max-w-xs">
              <Label for="route-filter" class="sr-only">筛选路由</Label>
              <Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="route-filter" v-model="routeSearch" placeholder="对等体 IP、ASN 或 Community" class="pl-8 font-mono" />
            </div>
            <p v-if="lg.data" class="text-sm text-muted-foreground md:ml-auto">
              共 <span class="font-mono tabular-nums">{{ filteredRoutes.length }}</span> 条
            </p>
          </div>

          <div class="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="pl-4">采集点</TableHead>
                  <TableHead>对等体</TableHead>
                  <TableHead>AS 路径</TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>下一跳</TableHead>
                  <TableHead class="pr-4">更新时间 (UTC)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="lg.loading">
                  <TableRow v-for="i in 8" :key="i">
                    <TableCell class="pl-4"><Skeleton class="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-56" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-28" /></TableCell>
                    <TableCell class="pr-4"><Skeleton class="h-5 w-32" /></TableCell>
                  </TableRow>
                </template>
                <TableEmpty v-else-if="!filteredRoutes.length" :colspan="6">
                  <span class="text-muted-foreground">
                    {{ lg.error ? '路由数据获取失败' : routes.length ? '没有匹配的路由' : 'RIS 采集点未观测到该资源的路由' }}
                  </span>
                </TableEmpty>
                <template v-else>
                  <TableRow v-for="r in shownRoutes" :key="r.key" class="align-top">
                    <TableCell class="pl-4">
                      <div class="font-mono">{{ r.rrc }}</div>
                      <div class="text-xs text-muted-foreground">{{ r.location }}</div>
                    </TableCell>
                    <TableCell>
                      <div class="font-mono tabular-nums">{{ r.peer }}</div>
                      <div v-if="matchedPrefixes.length > 1" class="font-mono text-xs text-muted-foreground">{{ r.prefix }}</div>
                    </TableCell>
                    <TableCell class="min-w-72 whitespace-normal">
                      <div class="flex flex-wrap items-center gap-y-1">
                        <template v-for="(h, i) in r.hops" :key="i">
                          <ChevronRight v-if="i" class="size-3 shrink-0 text-muted-foreground" />
                          <NuxtLink
                            v-if="isAsn(h.asn)"
                            :to="queryLink(`AS${h.asn}`)"
                            class="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs tabular-nums hover:bg-muted"
                            :class="i === r.hops.length - 1 && 'bg-muted'"
                          >
                            {{ h.asn }}<span v-if="h.count > 1" class="text-muted-foreground">×{{ h.count }}</span>
                          </NuxtLink>
                          <span v-else class="rounded-md border px-1.5 py-0.5 font-mono text-xs">{{ h.asn }}</span>
                        </template>
                      </div>
                    </TableCell>
                    <TableCell class="min-w-56 whitespace-normal">
                      <div v-if="r.communities.length" class="flex flex-wrap gap-1">
                        <Badge
                          v-for="c in expanded.has(r.key) ? r.communities : r.communities.slice(0, COMMUNITY_PREVIEW)"
                          :key="c.value"
                          variant="outline"
                          class="font-mono font-normal tabular-nums"
                          :class="c.desc && 'cursor-help underline decoration-dotted underline-offset-2'"
                          :title="c.desc"
                        >
                          {{ c.value }}
                        </Badge>
                        <Button
                          v-if="r.communities.length > COMMUNITY_PREVIEW"
                          variant="ghost"
                          size="xs"
                          class="h-5"
                          @click="expanded.has(r.key) ? expanded.delete(r.key) : expanded.add(r.key)"
                        >
                          {{ expanded.has(r.key) ? '收起' : `+${r.communities.length - COMMUNITY_PREVIEW}` }}
                        </Button>
                      </div>
                      <span v-else class="text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell class="font-mono text-muted-foreground tabular-nums">{{ r.nextHop }}</TableCell>
                    <TableCell class="pr-4 font-mono text-muted-foreground tabular-nums">{{ fmtTime(r.lastUpdated) }}</TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>

          <div v-if="filteredRoutes.length > shownRoutes.length" class="flex justify-center">
            <Button variant="outline" @click="routeLimit += ROUTE_PAGE">
              显示更多（剩余 {{ filteredRoutes.length - shownRoutes.length }} 条）
            </Button>
          </div>
        </section>
      </template>

      <!-- ASN mode -->
      <template v-else>
        <section class="page-container grid gap-6 pb-12 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader>
              <CardTitle>AS 概览</CardTitle>
              <CardDescription>来自 as-overview 与 routing-status。</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="asOverview.loading || status.loading" class="flex flex-col gap-3">
                <Skeleton v-for="i in 5" :key="i" class="h-5 w-full" />
              </div>
              <dl v-else class="grid gap-4 text-sm sm:grid-cols-[8rem_1fr]">
                <dt class="text-muted-foreground">持有者</dt>
                <dd>{{ asOverview.data?.holder || '—' }}</dd>

                <dt class="text-muted-foreground">分配来源</dt>
                <dd>
                  <template v-if="asOverview.data?.block">
                    <span class="font-mono tabular-nums">{{ asOverview.data.block.resource }}</span>
                    <span class="ml-2 text-muted-foreground">{{ asOverview.data.block.desc }}</span>
                  </template>
                  <span v-else class="text-muted-foreground">—</span>
                </dd>

                <dt class="text-muted-foreground">RIS 可见度</dt>
                <dd class="font-mono tabular-nums">
                  <template v-if="status.data">
                    IPv4 {{ pct(status.data.visibility.v4) }}
                    <span class="text-muted-foreground">({{ status.data.visibility.v4.ris_peers_seeing }}/{{ status.data.visibility.v4.total_ris_peers }})</span>
                    · IPv6 {{ pct(status.data.visibility.v6) }}
                    <span class="text-muted-foreground">({{ status.data.visibility.v6.ris_peers_seeing }}/{{ status.data.visibility.v6.total_ris_peers }})</span>
                  </template>
                  <span v-else class="text-muted-foreground">—</span>
                </dd>

                <dt class="text-muted-foreground">公告地址空间</dt>
                <dd class="font-mono tabular-nums">
                  <template v-if="status.data?.announced_space">
                    {{ fmtNum(status.data.announced_space.v4.ips) }} 个 IPv4 地址 · {{ fmtNum(status.data.announced_space.v6['48s']) }} 个 IPv6 /48
                  </template>
                  <span v-else class="text-muted-foreground">—</span>
                </dd>

                <dt class="text-muted-foreground">首次 / 最近可见</dt>
                <dd class="font-mono text-muted-foreground tabular-nums">
                  {{ fmtTime(status.data?.first_seen?.time) }} / {{ fmtTime(status.data?.last_seen?.time) }}
                  <span class="font-sans">UTC</span>
                </dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>邻居 AS</CardTitle>
              <CardDescription>依据 RIS 观测到的 AS 路径推断的上下游关系，按路径强度排序。</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
              <Tabs :model-value="neighbourTab" @update:model-value="setNeighbourTab">
                <TabsList>
                  <TabsTrigger v-for="t in neighbourTabs" :key="t.value" :value="t.value">
                    {{ t.label }}
                    <span class="font-mono text-muted-foreground tabular-nums">{{ neighbourCount(t.value) }}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div class="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="pl-4">ASN</TableHead>
                      <TableHead>名称</TableHead>
                      <TableHead class="text-right">强度</TableHead>
                      <TableHead class="text-right">v4 对等体</TableHead>
                      <TableHead class="pr-4 text-right">v6 对等体</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <template v-if="neighbours.loading">
                      <TableRow v-for="i in 6" :key="i">
                        <TableCell class="pl-4"><Skeleton class="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton class="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton class="ml-auto h-5 w-10" /></TableCell>
                        <TableCell><Skeleton class="ml-auto h-5 w-10" /></TableCell>
                        <TableCell class="pr-4"><Skeleton class="ml-auto h-5 w-10" /></TableCell>
                      </TableRow>
                    </template>
                    <TableEmpty v-else-if="!filteredNeighbours.length" :colspan="5">
                      <span class="text-muted-foreground">{{ neighbours.error ? '邻居数据获取失败' : '暂无此类邻居' }}</span>
                    </TableEmpty>
                    <template v-else>
                      <TableRow v-for="n in shownNeighbours" :key="n.asn">
                        <TableCell class="pl-4">
                          <NuxtLink :to="queryLink(`AS${n.asn}`)" class="font-mono tabular-nums underline-offset-4 hover:underline">AS{{ n.asn }}</NuxtLink>
                        </TableCell>
                        <TableCell class="max-w-64 truncate text-muted-foreground">{{ asNames[n.asn] ?? '' }}</TableCell>
                        <TableCell class="text-right font-mono tabular-nums">{{ fmtNum(n.power) }}</TableCell>
                        <TableCell class="text-right font-mono text-muted-foreground tabular-nums">{{ fmtNum(n.v4_peers) }}</TableCell>
                        <TableCell class="pr-4 text-right font-mono text-muted-foreground tabular-nums">{{ fmtNum(n.v6_peers) }}</TableCell>
                      </TableRow>
                    </template>
                  </TableBody>
                </Table>
              </div>
              <div v-if="filteredNeighbours.length > shownNeighbours.length" class="flex justify-center">
                <Button variant="outline" size="sm" @click="neighbourLimit += NEIGHBOUR_PAGE">
                  显示更多（剩余 {{ filteredNeighbours.length - shownNeighbours.length }} 个）
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section class="page-container flex flex-col gap-6 border-t py-12 pb-24">
          <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-semibold tracking-tight">公告前缀</h2>
            <p class="text-muted-foreground">最近两周内 RIS 观测到由该 AS 起源的前缀，点击前缀查看其全球路由。</p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative w-full sm:max-w-xs">
              <Label for="asn-prefix-filter" class="sr-only">筛选前缀</Label>
              <Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="asn-prefix-filter" v-model="prefixSearch" placeholder="筛选前缀" class="pl-8 font-mono" />
            </div>
            <ToggleGroup type="single" variant="outline" :model-value="prefixFamily" @update:model-value="setFamily">
              <ToggleGroupItem value="all" class="px-3">全部</ToggleGroupItem>
              <ToggleGroupItem value="v4" class="px-3">IPv4</ToggleGroupItem>
              <ToggleGroupItem value="v6" class="px-3">IPv6</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div class="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="pl-4">前缀</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>窗口内首次可见 (UTC)</TableHead>
                  <TableHead class="pr-4 text-right">外部</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="prefixes.loading">
                  <TableRow v-for="i in 6" :key="i">
                    <TableCell class="pl-4"><Skeleton class="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-32" /></TableCell>
                    <TableCell class="pr-4"><Skeleton class="ml-auto h-5 w-16" /></TableCell>
                  </TableRow>
                </template>
                <TableEmpty v-else-if="!filteredPrefixes.length" :colspan="4">
                  <span class="text-muted-foreground">
                    {{ prefixes.error ? '前缀数据获取失败' : prefixRows.length ? '没有匹配的前缀' : '该 AS 当前未公告任何前缀' }}
                  </span>
                </TableEmpty>
                <template v-else>
                  <TableRow v-for="p in shownPrefixes" :key="p.prefix">
                    <TableCell class="pl-4">
                      <NuxtLink :to="queryLink(p.prefix)" class="font-mono tabular-nums underline-offset-4 hover:underline">{{ p.prefix }}</NuxtLink>
                    </TableCell>
                    <TableCell class="text-muted-foreground">IPv{{ p.family }}</TableCell>
                    <TableCell class="font-mono text-muted-foreground tabular-nums">{{ fmtTime(p.firstSeen) }}</TableCell>
                    <TableCell class="pr-4 text-right">
                      <Button variant="ghost" size="xs" as-child>
                        <a :href="`https://bgp.tools/prefix/${p.prefix}`" target="_blank" rel="noopener">
                          bgp.tools <ArrowUpRight data-icon="inline-end" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>

          <div v-if="filteredPrefixes.length > shownPrefixes.length" class="flex justify-center">
            <Button variant="outline" @click="prefixLimit += PREFIX_PAGE">
              显示更多（剩余 {{ filteredPrefixes.length - shownPrefixes.length }} 条）
            </Button>
          </div>
        </section>
      </template>
    </template>

    <section v-else class="page-container pb-24">
      <p class="text-sm text-muted-foreground">
        输入 IP、前缀或 ASN 开始查询。路由数据来自 RIPE RIS 分布在全球的 20 余个路由采集点及数百个全表对等体。
      </p>
    </section>
  </div>
</template>
