<script setup lang="ts">
import type { GeoLookupResponse } from '#shared/types/xmsl'
import { ArrowRight, ArrowUpRight } from '@lucide/vue'
import { networkLinks, OPERATED_ASNS, ORGANIZATIONS, PEERINGDB_NET_ID, PRIMARY_ASN, SITE_ASNS, toolLinks } from '@/lib/site'

interface AnnouncedPrefixes { prefixes: { prefix: string }[] }
interface AsnNeighbours { neighbour_counts: { left: number, right: number, unique: number, uncertain: number } }
interface NetIxLan { ix_id: number }
interface VisitorInfo { ip: string, city: string, region: string, country: string, org: string }

const prefixes = SITE_ASNS.map(asn => useRipeStat<AnnouncedPrefixes>('announced-prefixes', { resource: `AS${asn}` }))
const neighbours = useRipeStat<AsnNeighbours>('asn-neighbours', { resource: `AS${PRIMARY_ASN}` })
const ixlans = usePeeringDb<NetIxLan>('netixlan', { net_id: PEERINGDB_NET_ID })

const visitor = useFetch<VisitorInfo>('https://ip.akaere.online/', {
  headers: { Accept: 'application/json' },
  server: false,
  lazy: true,
  key: 'visitor-ip',
})

const prefixLoading = computed(() => prefixes.some(p => p.status.value === 'pending' || p.status.value === 'idle'))
const prefixCount = computed(() => {
  const all = new Set(prefixes.flatMap(p => p.data.value?.prefixes.map(x => x.prefix) ?? []))
  const v6 = [...all].filter(p => p.includes(':')).length
  return { v4: all.size - v6, v6 }
})
const ixCount = computed(() => ixlans.data.value ? new Set(ixlans.data.value.map(x => x.ix_id)).size : null)
const viaOurNetwork = computed(() => SITE_ASNS.some(asn => visitor.data.value?.org?.includes(`AS${asn}`)))

/** One cheap lookup (DB-IP, cached 24h server-side) instead of the full ~11-provider comparison; full view lives on /ip. */
const visitorIp = computed(() => visitor.data.value?.ip ?? '')
const visitorGeo = useFetch<GeoLookupResponse>('/api/geo', {
  query: computed(() => ({ ip: visitorIp.value, providers: 'dbip' })),
  immediate: false,
  server: false,
  lazy: true,
  key: 'visitor-geo',
})
watch(visitorIp, (ip) => { if (ip) visitorGeo.execute() }, { immediate: true })
const geoLabel = computed(() => {
  const r = visitorGeo.data.value?.results[0]?.record
  return r ? [r.city, r.region, r.country].filter(Boolean).join(', ') : ''
})

const isPending = (s: { status: Ref<string> }) => s.status.value === 'pending' || s.status.value === 'idle'

const orgGroups = Object.values(ORGANIZATIONS).map(org => ({ org, asns: OPERATED_ASNS.filter(a => a.org === org.id) }))
</script>

<template>
  <div>
    <PageSeo />

    <section class="relative overflow-hidden border-b">
      <div class="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div class="page-container relative grid gap-12 py-20 md:py-28 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div class="flex flex-col items-start gap-6">
          <Badge variant="outline" class="gap-2 rounded-full px-3 py-1 font-mono text-xs font-normal">
            <span class="relative flex size-2">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span class="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            AS{{ PRIMARY_ASN }} · {{ SITE_ASNS.length }} 个自治系统
          </Badge>
          <h1 class="text-4xl font-semibold tracking-tighter text-balance sm:text-5xl md:text-6xl">
            为全球互联而生的<br>独立 Anycast 网络
          </h1>
          <p class="max-w-xl text-lg text-pretty text-muted-foreground">
            Pysio Networks 在全球运营 Anycast 节点，接入多个互联网交换中心，并基于 RIPE RIS 与 Globalping 等公共数据提供 BGP 路由查询、全球 Ping、路由追踪等开放网络工具。
          </p>
          <div class="flex flex-wrap gap-3">
            <Button size="lg" as-child class="px-4">
              <NuxtLink to="/bgp">BGP 路由查询 <ArrowRight data-icon="inline-end" /></NuxtLink>
            </Button>
            <Button size="lg" variant="outline" as-child class="px-4">
              <NuxtLink to="/anycast">了解网络</NuxtLink>
            </Button>
          </div>
        </div>

        <Card class="gap-0 py-0 font-mono text-sm">
          <div class="flex items-center justify-between border-b px-5 py-3">
            <span class="text-xs uppercase tracking-widest text-muted-foreground">你的连接</span>
            <Badge v-if="viaOurNetwork" class="bg-success/15 text-success">经由本网络</Badge>
          </div>
          <dl class="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-3 px-5 py-5">
            <template v-for="row in [
              { k: 'IP', v: visitor.data.value?.ip },
              { k: '网络', v: visitor.data.value?.org },
              { k: '位置', v: geoLabel || (visitor.data.value && [visitor.data.value.city, visitor.data.value.region, visitor.data.value.country].filter(Boolean).join(', ')) },
            ]" :key="row.k">
              <dt class="text-muted-foreground">{{ row.k }}</dt>
              <dd class="min-w-0 break-all">
                <Skeleton v-if="isPending(visitor)" class="h-5 w-full max-w-48" />
                <span v-else>{{ row.v || '—' }}</span>
              </dd>
            </template>
          </dl>
          <div v-if="visitorIp" class="flex items-center justify-between gap-2 border-t px-5 py-3 font-sans text-xs text-muted-foreground">
            <span>{{ geoLabel ? '位置来自 DB-IP · xmsl.Dev' : '位置来自 ip.akaere.online' }}</span>
            <NuxtLink :to="{ path: '/ip', query: { q: visitorIp } }" class="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline">
              多库定位对比 <ArrowRight class="size-3" />
            </NuxtLink>
          </div>
        </Card>
      </div>
    </section>

    <section class="page-container py-16">
      <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        <StatCard label="IPv4 前缀" :value="prefixCount.v4" :loading="prefixLoading" hint="全部 ASN 当前公告" />
        <StatCard label="IPv6 前缀" :value="prefixCount.v6" :loading="prefixLoading" hint="全部 ASN 当前公告" />
        <StatCard label="BGP 邻居" :value="neighbours.data.value?.neighbour_counts.unique" :loading="isPending(neighbours)" :hint="neighbours.data.value ? `上游 ${neighbours.data.value.neighbour_counts.left} · 下游 ${neighbours.data.value.neighbour_counts.right}` : `AS${PRIMARY_ASN}`" />
        <StatCard label="IX 接入" :value="ixCount" :loading="isPending(ixlans)" hint="PeeringDB 登记" />
      </div>
      <p class="mt-3 text-xs text-muted-foreground">
        {{ SITE_ASNS.length }} 个 ASN 合计 · 数据实时来自
        <a href="https://stat.ripe.net" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">RIPEstat</a>
        与
        <a :href="`https://www.peeringdb.com/net/${PEERINGDB_NET_ID}`" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">PeeringDB</a>
      </p>

      <div class="mt-10 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
        <div v-for="group in orgGroups" :key="group.org.id" class="flex flex-col gap-3 bg-background p-6">
          <div class="flex items-center justify-between gap-2">
            <p class="font-medium">{{ group.org.name }}</p>
            <a :href="group.org.website" target="_blank" rel="noopener" class="text-muted-foreground hover:text-foreground" :aria-label="`${group.org.name} 官网`">
              <ArrowUpRight class="size-4" />
            </a>
          </div>
          <p class="text-sm text-muted-foreground">{{ group.org.description }}</p>
          <div class="mt-auto flex flex-wrap gap-1.5 pt-1">
            <Badge v-for="a in group.asns" :key="a.asn" variant="outline" as-child class="font-mono">
              <NuxtLink :to="`/bgp?q=AS${a.asn}`">AS{{ a.asn }}</NuxtLink>
            </Badge>
          </div>
        </div>
      </div>
      <div class="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" as-child>
          <NuxtLink to="/asn">查看全部自治系统 <ArrowRight data-icon="inline-end" /></NuxtLink>
        </Button>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 pb-16">
      <div class="flex items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-semibold tracking-tight">网络</h2>
          <p class="text-muted-foreground">节点、互联与服务。</p>
        </div>
        <Button variant="ghost" size="sm" as-child>
          <a :href="`https://bgp.tools/as/${PRIMARY_ASN}`" target="_blank" rel="noopener">bgp.tools <ArrowUpRight data-icon="inline-end" /></a>
        </Button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LinkCard v-for="link in networkLinks" :key="link.to" v-bind="link" />
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 pb-24">
      <div class="flex items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-semibold tracking-tight">工具</h2>
          <p class="text-muted-foreground">从我们的网络出发，诊断任何地址。</p>
        </div>
        <Button variant="ghost" size="sm" as-child>
          <NuxtLink to="/tools">全部工具 <ArrowRight data-icon="inline-end" /></NuxtLink>
        </Button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LinkCard v-for="link in toolLinks" :key="link.to" v-bind="link" />
      </div>
    </section>
  </div>
</template>
