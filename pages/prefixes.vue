<script setup lang="ts">
import { ArrowUpRight, RefreshCw, Search } from '@lucide/vue'
import { SITE_ASNS } from '@/lib/site'
import { Cache } from '~/utils/cache'

interface AnnouncedPrefixes {
  prefixes: { prefix: string, timelines: { starttime: string, endtime: string }[] }[]
  query_starttime: string
  query_endtime: string
}
type RpkiState = 'valid' | 'invalid' | 'unknown' | 'pending' | 'error'
type Family = 'all' | 'v4' | 'v6'

interface PrefixRow {
  prefix: string
  family: 4 | 6
  origins: number[]
  firstSeen: string | null
  sortKey: string
}

/** Above this many (origin, prefix) pairs RPKI checks are skipped to stay polite to RIPEstat. */
const RPKI_LIMIT = 200
const RPKI_CONCURRENCY = 6

const sources = SITE_ASNS.map(asn => ({
  asn,
  req: useRipeStat<AnnouncedPrefixes>('announced-prefixes', { resource: `AS${asn}` }),
}))

const isPending = (s: string) => s === 'pending' || s === 'idle'
const loading = computed(() => sources.some(s => isPending(s.req.status.value)))
const failedAsns = computed(() => sources.filter(s => s.req.status.value === 'error').map(s => s.asn))
const windowStart = computed(() => sources.map(s => s.req.data.value?.query_starttime).find(Boolean) ?? null)

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

const rows = computed<PrefixRow[]>(() => {
  const map = new Map<string, PrefixRow>()
  for (const { asn, req } of sources) {
    for (const p of req.data.value?.prefixes ?? []) {
      const start = p.timelines.reduce<string | null>((min, t) => (!min || t.starttime < min ? t.starttime : min), null)
      const row = map.get(p.prefix)
      if (row) {
        if (!row.origins.includes(asn))
          row.origins.push(asn)
        if (start && (!row.firstSeen || start < row.firstSeen))
          row.firstSeen = start
      }
      else {
        map.set(p.prefix, {
          prefix: p.prefix,
          family: p.prefix.includes(':') ? 6 : 4,
          origins: [asn],
          firstSeen: start,
          sortKey: sortKey(p.prefix),
        })
      }
    }
  }
  return [...map.values()].sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))
})

const v4Count = computed(() => rows.value.filter(r => r.family === 4).length)
const v6Count = computed(() => rows.value.length - v4Count.value)

// RPKI origin validation, one RIPEstat call per (origin, prefix), cached 10 min in localStorage.
const rpki = ref<Record<string, RpkiState>>({})
const rpkiKey = (asn: number, prefix: string) => `${asn}|${prefix}`
const rpkiPairs = computed(() => rows.value.flatMap(r => r.origins.map(asn => ({ asn, prefix: r.prefix }))))
const rpkiEnabled = computed(() => rpkiPairs.value.length <= RPKI_LIMIT)
const settled = (s?: RpkiState) => s === 'valid' || s === 'invalid' || s === 'unknown'

async function validate(asn: number, prefix: string): Promise<RpkiState> {
  const cacheKey = `api_req_rpki_${asn}_${prefix}`
  const cached = Cache.get<RpkiState>(cacheKey)
  if (cached)
    return cached
  try {
    const res = await $fetch<{ data: { status: string } }>('https://stat.ripe.net/data/rpki-validation/data.json', {
      query: { resource: `AS${asn}`, prefix, sourceapp: 'anycast-ink' },
    })
    const status = res.data.status
    const state: RpkiState = status === 'valid' ? 'valid' : status.startsWith('invalid') ? 'invalid' : 'unknown'
    Cache.set(cacheKey, state)
    return state
  }
  catch {
    return 'error'
  }
}

let rpkiRun = 0
async function runRpki() {
  if (import.meta.server || !rpkiEnabled.value)
    return
  const run = ++rpkiRun
  const queue = rpkiPairs.value.filter(p => !settled(rpki.value[rpkiKey(p.asn, p.prefix)]))
  for (const p of queue)
    rpki.value[rpkiKey(p.asn, p.prefix)] = 'pending'
  const worker = async () => {
    while (queue.length && run === rpkiRun) {
      const p = queue.shift()!
      const state = await validate(p.asn, p.prefix)
      if (run === rpkiRun)
        rpki.value[rpkiKey(p.asn, p.prefix)] = state
    }
  }
  await Promise.all(Array.from({ length: RPKI_CONCURRENCY }, worker))
}

watch(loading, (l) => {
  if (!l)
    runRpki()
}, { immediate: true })

const rpkiStates = computed(() => rpkiPairs.value.map(p => rpki.value[rpkiKey(p.asn, p.prefix)]))
const rpkiPending = computed(() => loading.value || (rpkiEnabled.value && rpkiStates.value.some(s => !s || s === 'pending')))
const rpkiValidCount = computed(() => rows.value.filter(r => r.origins.every(asn => rpki.value[rpkiKey(asn, r.prefix)] === 'valid')).length)
const rpkiErrors = computed(() => rpkiStates.value.filter(s => s === 'error').length)

function refreshAll() {
  // The loading watcher re-runs RPKI checks (including failed ones) once the refresh settles.
  for (const s of sources)
    s.req.refresh()
}

const rpkiOf = (asn: number, prefix: string) => rpki.value[rpkiKey(asn, prefix)]

const query = ref('')
const family = ref<Family>('all')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase().replace(/^as/, '')
  return rows.value.filter((r) => {
    if (family.value === 'v4' && r.family !== 4)
      return false
    if (family.value === 'v6' && r.family !== 6)
      return false
    return !q || r.prefix.toLowerCase().includes(q) || r.origins.some(asn => String(asn).includes(q))
  })
})

function setFamily(v: unknown) {
  if (v === 'all' || v === 'v4' || v === 'v6')
    family.value = v
}

const formatTime = (t: string | null) => (t ? `${t.replace('T', ' ').slice(0, 16)}` : '—')

const rpkiBadge: Record<Exclude<RpkiState, 'pending'>, { label: string, class: string }> = {
  valid: { label: '有效', class: 'bg-success/15 text-success border-transparent' },
  invalid: { label: '无效', class: 'bg-destructive/15 text-destructive border-transparent' },
  unknown: { label: '未知', class: 'bg-muted text-muted-foreground border-transparent' },
  error: { label: '查询失败', class: 'bg-warning/15 text-warning border-transparent' },
}
</script>

<template>
  <div>
    <PageSeo title="网络前缀" description="Pysio Networks、Akaere Networks 与 Skimit 各 ASN 当前公告的 IPv4 / IPv6 前缀与 RPKI 验证状态，数据实时来自 RIPEstat。" />

    <PageHeader
      eyebrow="网络"
      title="网络前缀"
      description="我们运营的全部 ASN（Pysio / Akaere / Skimit）当前在全球路由表中公告的 IPv4 / IPv6 前缀，以及每条前缀的 RPKI 起源验证状态。"
    >
      <template #actions>
        <Button variant="outline" :disabled="loading" @click="refreshAll">
          <RefreshCw data-icon="inline-start" :class="loading && 'animate-spin'" />
          刷新
        </Button>
        <Button v-for="asn in SITE_ASNS" :key="asn" variant="ghost" as-child>
          <a :href="`https://bgp.tools/as/${asn}#prefixes`" target="_blank" rel="noopener" class="font-mono">
            AS{{ asn }} <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      </template>
    </PageHeader>

    <section class="page-container flex flex-col gap-3 py-12">
      <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        <StatCard label="前缀总数" :value="rows.length" :loading="loading" :hint="`${SITE_ASNS.length} 个 ASN 去重`" />
        <StatCard label="IPv4 前缀" :value="v4Count" :loading="loading" />
        <StatCard label="IPv6 前缀" :value="v6Count" :loading="loading" />
        <StatCard
          label="RPKI 有效"
          :value="rpkiEnabled ? rpkiValidCount : null"
          :loading="rpkiPending"
          :hint="rpkiEnabled ? (rpkiErrors ? `${rpkiErrors} 条查询失败` : `共 ${rows.length} 条前缀`) : '前缀过多，已跳过验证'"
        />
      </div>
      <p class="text-xs text-muted-foreground">
        数据实时来自
        <a href="https://stat.ripe.net" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">RIPEstat</a>
        （RIS 路由收集器 announced-prefixes 与 rpki-validation）
      </p>
    </section>

    <section class="page-container flex flex-col gap-6 pb-24">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">前缀列表</h2>
        <p class="text-muted-foreground">按地址排序，点击右侧链接在 bgp.tools 查看路由详情。</p>
      </div>

      <Alert v-if="failedAsns.length" variant="destructive">
        <AlertTitle>部分数据获取失败</AlertTitle>
        <AlertDescription>
          无法从 RIPEstat 获取 <span class="font-mono">{{ failedAsns.map(a => `AS${a}`).join('、') }}</span> 的公告前缀。
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline" @click="refreshAll">重试</Button>
        </AlertAction>
      </Alert>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full sm:max-w-xs">
          <Label for="prefix-filter" class="sr-only">筛选前缀</Label>
          <Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="prefix-filter" v-model="query" placeholder="筛选前缀或 ASN" class="pl-8 font-mono" />
        </div>
        <ToggleGroup type="single" variant="outline" :model-value="family" @update:model-value="setFamily">
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
              <TableHead>起源 ASN</TableHead>
              <TableHead>RPKI</TableHead>
              <TableHead>首次可见 (UTC)</TableHead>
              <TableHead class="pr-4 text-right">详情</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading && !rows.length">
              <TableRow v-for="i in 6" :key="i">
                <TableCell class="pl-4"><Skeleton class="h-5 w-40" /></TableCell>
                <TableCell><Skeleton class="h-5 w-20" /></TableCell>
                <TableCell><Skeleton class="h-5 w-12" /></TableCell>
                <TableCell><Skeleton class="h-5 w-32" /></TableCell>
                <TableCell class="pr-4"><Skeleton class="ml-auto h-5 w-16" /></TableCell>
              </TableRow>
            </template>
            <TableEmpty v-else-if="!filtered.length" :colspan="5">
              <span class="text-muted-foreground">{{ rows.length ? '没有匹配的前缀' : '暂无前缀数据' }}</span>
            </TableEmpty>
            <template v-else>
            <TableRow v-for="row in filtered" :key="row.prefix">
              <TableCell class="pl-4 font-mono tabular-nums">{{ row.prefix }}</TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-x-2 font-mono tabular-nums">
                  <a
                    v-for="asn in row.origins"
                    :key="asn"
                    :href="`https://bgp.tools/as/${asn}`"
                    target="_blank"
                    rel="noopener"
                    class="underline-offset-4 hover:underline"
                  >AS{{ asn }}</a>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <template v-for="asn in row.origins" :key="asn">
                    <span v-if="!rpkiEnabled" class="text-muted-foreground">—</span>
                    <Skeleton v-else-if="!settled(rpkiOf(asn, row.prefix)) && rpkiOf(asn, row.prefix) !== 'error'" class="h-5 w-12" />
                    <Badge v-else :class="rpkiBadge[rpkiOf(asn, row.prefix) as keyof typeof rpkiBadge].class">
                      {{ rpkiBadge[rpkiOf(asn, row.prefix) as keyof typeof rpkiBadge].label }}<template v-if="row.origins.length > 1"> · AS{{ asn }}</template>
                    </Badge>
                  </template>
                </div>
              </TableCell>
              <TableCell class="font-mono text-muted-foreground tabular-nums">{{ formatTime(row.firstSeen) }}</TableCell>
              <TableCell class="pr-4 text-right">
                <Button variant="ghost" size="xs" as-child>
                  <a :href="`https://bgp.tools/prefix/${row.prefix}`" target="_blank" rel="noopener">
                    bgp.tools <ArrowUpRight data-icon="inline-end" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <p class="text-xs text-muted-foreground">
        “首次可见”为 RIPEstat 查询窗口<template v-if="windowStart">（<span class="font-mono tabular-nums">{{ formatTime(windowStart) }}</span> UTC 起）</template>内该前缀最早被 RIS 观测到的时间。
        RPKI 状态由 RIPEstat（Routinator）按起源 ASN 验证，结果在本地缓存 10 分钟。
      </p>
    </section>
  </div>
</template>
