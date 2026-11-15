<script setup lang="ts">
import type { HopPlace } from '~/composables/useTraceAnalysis'
import type { GlobalpingProbe, MtrHop, MtrResult, TracerouteHop, TracerouteResult } from '~/composables/useGlobalping'
import type { TraceMapMarker, TraceMapOrigin } from '~/components/TraceMap.vue'
import {
  ChevronDown,
  ChevronUp,
  Link,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  Route,
  TriangleAlert,
  X,
} from '@lucide/vue'
import { createReusableTemplate } from '@vueuse/core'
import { toast } from 'vue-sonner'

type TraceResult = MtrResult | TracerouteResult
type ProbeHop = MtrHop | TracerouteHop
type ProbeTone = 'running' | 'reached' | 'unreached' | 'failed'

interface ProbeRow {
  index: number
  probe: GlobalpingProbe
  result: TraceResult
  hops: ProbeHop[]
  /** 最后一个响应的跃点就是目标地址 */
  reached: boolean
  tone: ProbeTone
}

interface HopRow {
  ttl: number
  address: string | null
  hostname: string | null
  asns: number[]
  loss: number | null
  rtt: number | null
  place: HopPlace | null
  /** 已到达目标时，最后一个响应的跃点 */
  target: boolean
}

const PROBE_COUNTS = ['3', '5', '10']
const PROTOCOLS = ['ICMP', 'TCP', 'UDP']
const IP_VERSIONS = [
  { value: 'auto', label: '自动' },
  { value: '4', label: 'IPv4' },
  { value: '6', label: 'IPv6' },
]
const TONES: Record<ProbeTone, { label: string, dot: string, badge: string, color: string }> = {
  running: { label: '进行中', dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground', color: 'var(--muted-foreground)' },
  reached: { label: '已到达', dot: 'bg-success', badge: 'bg-success/15 text-success', color: 'var(--success)' },
  unreached: { label: '未到达', dot: 'bg-warning', badge: 'bg-warning/15 text-warning', color: 'var(--warning)' },
  failed: { label: '失败', dot: 'bg-destructive', badge: 'bg-destructive/15 text-destructive', color: 'var(--destructive)' },
}

const [DefineHopTable, ReuseHopTable] = createReusableTemplate<{ compact?: boolean }>()
const route = useRoute()
const router = useRouter()
const { measurement, state, error, run, load } = useGlobalping<TraceResult>()

const target = ref('')
const location = ref('world')
const probeCount = ref('5')
const protocol = ref('ICMP')
const port = ref<string | number>(80)
const ipVersion = ref('auto')
const selectedIndex = ref<number | null>(null)
const selectedTtl = ref<number | null>(null)
let retryAction: (() => unknown) | null = null

const busy = computed(() => state.value === 'creating' || state.value === 'running')
// Globalping 仅允许对域名指定 IP 版本
const isIpLiteral = computed(() => /^[\d.]+$|:/.test(target.value.trim()))
const canQuery = computed(() => target.value.trim() !== '' && !busy.value)
const wrongType = computed(() => {
  const type = measurement.value?.type
  return type && type !== 'mtr' && type !== 'traceroute' ? type : ''
})

const probes = computed<ProbeRow[]>(() => {
  if (!measurement.value || wrongType.value) return []
  return measurement.value.results.map(({ probe, result }, index) => {
    const hops: ProbeHop[] = result.hops ?? []
    const reached = !!result.resolvedAddress && hops.findLast(hop => hop.resolvedAddress)?.resolvedAddress === result.resolvedAddress
    let tone: ProbeTone = 'running'
    if (result.status === 'failed' || result.status === 'offline') tone = 'failed'
    else if (result.status === 'finished') tone = reached ? 'reached' : 'unreached'
    return { index, probe, result, hops, reached, tone }
  })
})

const selectedRow = computed(() => (selectedIndex.value === null ? null : probes.value[selectedIndex.value] ?? null))

const finishedProbes = computed(() => probes.value.filter(row => row.tone !== 'running'))
const reachedCount = computed(() => probes.value.filter(row => row.reached).length)
const reachRate = computed(() =>
  finishedProbes.value.length ? Math.round((reachedCount.value / finishedProbes.value.length) * 100) : 0,
)
const averageHops = computed(() => {
  const withHops = finishedProbes.value.filter(row => row.hops.length)
  return withHops.length ? Math.round(withHops.reduce((acc, row) => acc + row.hops.length, 0) / withHops.length) : 0
})

// ---------- 格式化 ----------

const probePlace = (probe: GlobalpingProbe) => placeLabel(probe.country, probe.city) || '未知'

const flagClass = (code?: string) => (code && /^[a-z]{2}$/i.test(code) ? `fi-${code.toLowerCase()}` : '')

const rttText = (rtt: number | null) => (rtt === null ? '—' : `${Number(rtt.toFixed(2))} ms`)

const lossText = (loss: number | null) => (loss === null ? '—' : `${Number(loss.toFixed(1))}%`)

// ---------- 测量 ----------

const performTraceroute = async () => {
  if (!canQuery.value) return
  retryAction = performTraceroute
  selectedIndex.value = null

  const measurementOptions: Record<string, unknown> = { protocol: protocol.value }
  if (protocol.value !== 'ICMP') measurementOptions.port = Number(port.value) || 80
  if (!isIpLiteral.value && ipVersion.value !== 'auto') measurementOptions.ipVersion = Number(ipVersion.value)

  await run({
    type: 'mtr',
    target: target.value.trim(),
    locations: [{ magic: location.value.trim() || 'world', limit: Number(probeCount.value) }],
    measurementOptions,
  })
}

const loadShared = (id: string) => {
  retryAction = () => loadShared(id)
  selectedIndex.value = null
  return load(id)
}

const retry = () => retryAction?.()

// 新测量出现时写入分享链接；打开分享链接时回填表单
watch(() => measurement.value?.id, (id) => {
  if (!id) return
  if (route.query.id !== id) router.replace({ query: { ...route.query, id } })
  if (!target.value.trim()) {
    target.value = measurement.value!.target
    location.value = measurement.value!.locations?.[0]?.magic || location.value
  }
})

const copyShareLink = async () => {
  if (!measurement.value) return
  try {
    await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?id=${measurement.value.id}`)
    toast.success('分享链接已复制')
  }
  catch (err) {
    console.error('复制链接失败:', err)
    toast.error('复制失败')
  }
}

// ---------- 跨库定位（xmsl.Dev GeoAPI） ----------

// 只分析已完成且有响应跃点的探针输出；结果按文本缓存，切回已分析的探针不会重复请求
const { data: analysis, pending: analysisPending, error: analysisError, retry: retryAnalysis } = useTraceAnalysis(() => {
  const row = selectedRow.value
  return row?.result.status === 'finished' && row.hops.some(hop => hop.resolvedAddress) ? row.result.rawOutput : null
})

const traceRoute = computed(() => analysis.value?.route ?? null)
const summary = computed(() => traceRoute.value?.summary ?? null)

const asNames = computed(() => {
  const names = new Map<number, string>()
  for (const { asn, name } of summary.value?.asns ?? []) if (name) names.set(asn, name)
  for (const [asn, name] of Object.entries(analysis.value?.asNames ?? {})) if (name) names.set(Number(asn), name)
  return names
})

// 连续重复的国家只保留一个
const countryPath = computed(() => (summary.value?.countries ?? []).filter((code, i, all) => code !== all[i - 1]))

const hopRows = computed<HopRow[]>(() => {
  const row = selectedRow.value
  if (!row) return []
  const analysed = new Map((traceRoute.value?.hops ?? []).map(hop => [hop.ttl, hop]))
  const targetIndex = row.reached ? row.hops.findLastIndex(hop => hop.resolvedAddress) : -1
  return row.hops.map((hop, i) => {
    const ttl = i + 1
    const info = analysed.get(ttl)
    const host = info?.hosts[info.primary ?? 0]
    const asns = 'asn' in hop && hop.asn.length ? hop.asn : host?.asn ? [host.asn] : []
    let rtt: number | null = null
    if ('stats' in hop) rtt = hop.stats.avg
    else if (hop.timings.length) rtt = hop.timings.reduce((acc, t) => acc + t.rtt, 0) / hop.timings.length
    return {
      ttl,
      address: hop.resolvedAddress,
      hostname: hop.resolvedHostname && hop.resolvedHostname !== hop.resolvedAddress ? hop.resolvedHostname : null,
      asns,
      loss: 'stats' in hop ? hop.stats.loss : null,
      rtt,
      place: hopPlace(info),
      target: i === targetIndex,
    }
  })
})

// ---------- 地图 ----------

const mapOrigin = computed<TraceMapOrigin | null>(() => {
  const probe = selectedRow.value?.probe
  return probe ? { lat: probe.latitude, lon: probe.longitude, label: `${probePlace(probe)} · AS${probe.asn} ${probe.network}` } : null
})

const probeMarkers = computed<TraceMapMarker[]>(() => probes.value.map(row => ({
  id: row.index,
  lat: row.probe.latitude,
  lon: row.probe.longitude,
  color: TONES[row.tone].color,
  title: probePlace(row.probe),
  lines: [`AS${row.probe.asn} · ${row.probe.network}`, `${TONES[row.tone].label} · ${row.hops.length} 跳`],
})))

watch(selectedIndex, () => {
  selectedTtl.value = null
})

const selectHop = (hop: HopRow) => {
  if (hop.place) selectedTtl.value = hop.ttl
}

// 全屏地图与浮动跃点窗口
const isFullscreenMap = ref(false)
const isTableMinimized = ref(false)
const isTableCollapsed = ref(false)
const routeTableWindow = ref<HTMLElement | null>(null)
const windowPos = ref<{ left: number, top: number } | null>(null)
let isDragging = false
let dragOffsetX = 0
let dragOffsetY = 0

const onFullscreenKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreenMap.value) toggleFullscreenMap()
}

const toggleFullscreenMap = () => {
  isFullscreenMap.value = !isFullscreenMap.value
  if (!isFullscreenMap.value) {
    window.removeEventListener('keydown', onFullscreenKeydown)
    return
  }
  isTableCollapsed.value = false
  isTableMinimized.value = false
  windowPos.value = null
  window.addEventListener('keydown', onFullscreenKeydown)
}

const clearSelectedProbe = () => {
  if (isFullscreenMap.value) toggleFullscreenMap()
  isTableMinimized.value = false
  isTableCollapsed.value = false
  selectedIndex.value = null
}

const windowStyle = computed(() =>
  isTableMinimized.value || isTableCollapsed.value || !windowPos.value
    ? { left: '16px', bottom: '16px' }
    : { left: `${windowPos.value.left}px`, top: `${windowPos.value.top}px` },
)

// 鼠标进入折叠的窗口时自动展开
const handleMouseEnter = () => {
  if (isTableCollapsed.value && !isTableMinimized.value) toggleTableCollapse()
}

const toggleTableCollapse = () => {
  isTableCollapsed.value = !isTableCollapsed.value
  windowPos.value = null
}

const startDrag = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest('button')) return
  const element = routeTableWindow.value
  if (!element) return

  isDragging = true
  const rect = element.getBoundingClientRect()
  dragOffsetX = event.clientX - rect.left
  dragOffsetY = event.clientY - rect.top
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  event.preventDefault()
}

const handleDrag = (event: MouseEvent) => {
  const element = routeTableWindow.value
  if (!isDragging || !element) return
  if (isTableCollapsed.value) isTableCollapsed.value = false

  windowPos.value = {
    left: Math.max(0, Math.min(window.innerWidth - element.offsetWidth, event.clientX - dragOffsetX)),
    top: Math.max(0, Math.min(window.innerHeight - element.offsetHeight, event.clientY - dragOffsetY)),
  }
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// ---------- 生命周期 ----------

onMounted(() => {
  const id = route.query.id
  if (typeof id === 'string' && id) loadShared(id)
})

onUnmounted(() => {
  stopDrag()
  window.removeEventListener('keydown', onFullscreenKeydown)
})
</script>

<template>
  <div>
    <PageSeo title="全球路由追踪" description="使用 Globalping 全球探针对目标进行 MTR 路由追踪，在地图上还原每一跳的位置、ASN、延迟与丢包。" />

    <DefineHopTable v-slot="{ compact }">
      <Table :class="compact ? 'text-xs' : ''">
        <TableHeader>
          <TableRow>
            <TableHead class="w-16">跃点</TableHead>
            <TableHead>地址</TableHead>
            <TableHead>ASN / 组织</TableHead>
            <TableHead>位置</TableHead>
            <TableHead class="text-right">丢包</TableHead>
            <TableHead class="text-right">平均延迟</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="selectedRow" class="bg-success/5">
            <TableCell>
              <Badge class="border-transparent bg-success/15 text-success">起点</Badge>
            </TableCell>
            <TableCell class="text-muted-foreground">探针</TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span class="font-mono tabular-nums">AS{{ selectedRow.probe.asn }}</span>
                <span class="truncate text-muted-foreground" :class="compact ? 'max-w-40' : 'max-w-64'">{{ selectedRow.probe.network }}</span>
              </div>
            </TableCell>
            <TableCell>
              <span class="inline-flex items-center gap-2">
                <span v-if="flagClass(selectedRow.probe.country)" class="fi shrink-0 rounded-[2px]" :class="flagClass(selectedRow.probe.country)" />
                {{ probePlace(selectedRow.probe) }}
              </span>
            </TableCell>
            <TableCell class="text-right font-mono text-muted-foreground tabular-nums">—</TableCell>
            <TableCell class="text-right font-mono text-muted-foreground tabular-nums">—</TableCell>
          </TableRow>
          <TableRow
            v-for="hop in hopRows"
            :key="hop.ttl"
            :class="[
              hop.place ? 'cursor-pointer' : '',
              selectedTtl === hop.ttl ? 'bg-muted' : hop.target ? 'bg-muted/50' : '',
            ]"
            @click="selectHop(hop)"
          >
            <TableCell>
              <span class="inline-flex items-center gap-2">
                <span class="font-mono tabular-nums text-muted-foreground">{{ hop.ttl }}</span>
                <Badge v-if="hop.target" variant="outline">目标</Badge>
              </span>
            </TableCell>
            <TableCell>
              <div v-if="hop.address" class="flex flex-col">
                <span class="font-mono tabular-nums">{{ hop.address }}</span>
                <span
                  v-if="hop.hostname"
                  class="truncate font-mono text-xs text-muted-foreground"
                  :class="compact ? 'max-w-40' : 'max-w-64'"
                  :title="hop.hostname"
                >{{ hop.hostname }}</span>
              </div>
              <span v-else class="font-mono text-muted-foreground">*</span>
            </TableCell>
            <TableCell>
              <div v-if="hop.asns.length" class="flex flex-col gap-0.5">
                <div v-for="asn in hop.asns" :key="asn" class="flex min-w-0 flex-col">
                  <span class="font-mono tabular-nums">AS{{ asn }}</span>
                  <span
                    v-if="asNames.get(asn)"
                    class="truncate text-muted-foreground"
                    :class="compact ? 'max-w-40' : 'max-w-64'"
                    :title="asNames.get(asn)"
                  >{{ asNames.get(asn) }}</span>
                </div>
              </div>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell>
              <Skeleton v-if="analysisPending && hop.address" class="h-4 w-24" />
              <div v-else-if="hop.place" class="flex flex-col gap-0.5">
                <span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="inline-flex items-center gap-2 whitespace-nowrap">
                    <span v-if="flagClass(hop.place.countryCode)" class="fi shrink-0 rounded-[2px]" :class="flagClass(hop.place.countryCode)" />
                    {{ placeLabel(hop.place.countryCode, hop.place.city) || '未知' }}
                  </span>
                  <Badge v-if="hop.place.confidence && CONFIDENCE[hop.place.confidence]" :class="CONFIDENCE[hop.place.confidence]!.badge">
                    {{ CONFIDENCE[hop.place.confidence]!.label }}
                  </Badge>
                </span>
                <span v-if="hop.place.source" class="text-xs text-muted-foreground">定位来源 {{ hop.place.source }}</span>
              </div>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell
              class="text-right font-mono tabular-nums"
              :class="hop.loss === null || hop.loss === 0 ? 'text-muted-foreground' : 'text-warning'"
            >
              {{ lossText(hop.loss) }}
            </TableCell>
            <TableCell class="text-right font-mono tabular-nums">
              {{ rttText(hop.rtt) }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DefineHopTable>

    <PageHeader
      eyebrow="工具"
      title="全球路由追踪"
      description="调用 Globalping 全球探针，从多个网络同时对目标执行 MTR 路由追踪，并在地图上还原每一跳的位置。"
    />

    <section class="page-container flex flex-col gap-8 py-12">
      <Card class="gap-0 py-0">
        <form class="flex flex-col gap-4 p-6" @submit.prevent="performTraceroute">
          <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-[minmax(0,1fr)_7rem_7rem_7rem_auto] lg:items-end">
            <div class="flex flex-col gap-2 sm:col-span-3 lg:col-span-1">
              <Label for="gt-target">目标地址</Label>
              <Input
                id="gt-target"
                v-model="target"
                placeholder="8.8.8.8 或 google.com"
                class="font-mono"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="gt-probes">探针数量</Label>
              <Select v-model="probeCount">
                <SelectTrigger id="gt-probes" class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="n in PROBE_COUNTS" :key="n" :value="n">{{ n }} 个</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="gt-protocol">协议</Label>
              <Select v-model="protocol">
                <SelectTrigger id="gt-protocol" class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in PROTOCOLS" :key="p" :value="p">{{ p }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="gt-ipv">IP 版本</Label>
              <Select v-model="ipVersion" :disabled="isIpLiteral">
                <SelectTrigger id="gt-ipv" class="w-full" :title="isIpLiteral ? '目标为 IP 地址时由地址本身决定' : undefined">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="v in IP_VERSIONS" :key="v.value" :value="v.value">{{ v.label }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" class="sm:col-span-3 lg:col-span-1" :disabled="!canQuery">
              <Loader2 v-if="busy" class="animate-spin" data-icon="inline-start" />
              <Play v-else data-icon="inline-start" />
              {{ busy ? '追踪中' : '开始追踪' }}
            </Button>
          </div>
          <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
            <div class="flex flex-col gap-2">
              <Label for="gt-location">探针位置</Label>
              <GlobalpingLocation id="gt-location" v-model="location" />
            </div>
            <div v-if="protocol !== 'ICMP'" class="flex flex-col gap-2">
              <Label for="gt-port">端口</Label>
              <Input id="gt-port" v-model="port" type="number" min="1" max="65535" class="font-mono tabular-nums" />
            </div>
          </div>
        </form>
        <div class="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-3 text-xs text-muted-foreground">
          <GlobalpingQuota />
          <span>跨库定位由 <a href="https://xmsl.dev" target="_blank" rel="noopener" class="text-foreground underline-offset-4 hover:underline">xmsl.Dev GeoAPI</a> 提供</span>
        </div>
      </Card>

      <Alert v-if="state === 'error'" variant="destructive">
        <TriangleAlert />
        <AlertTitle>请求失败</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="xs" @click="retry">
            <RefreshCw data-icon="inline-start" />
            重试
          </Button>
        </AlertAction>
      </Alert>

      <Alert v-if="wrongType" variant="destructive">
        <TriangleAlert />
        <AlertTitle>无法显示该测量</AlertTitle>
        <AlertDescription>该分享链接是 {{ wrongType }} 测量，不是路由追踪。</AlertDescription>
      </Alert>

      <!-- 启动中 -->
      <div v-if="busy && !measurement" class="flex flex-col gap-4">
        <p class="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 class="size-4 animate-spin" />
          {{ state === 'creating' ? '正在创建路由追踪测量…' : '正在加载测量结果…' }}
        </p>
        <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
          <StatCard v-for="label in ['探针数量', '平均跃点', '到达率', '状态']" :key="label" :label="label" loading />
        </div>
        <Skeleton class="h-[420px] w-full rounded-xl" />
      </div>

      <!-- 结果 -->
      <template v-else-if="measurement && !wrongType">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex min-w-0 flex-col gap-2">
            <h2 class="text-2xl font-semibold tracking-tight">测量结果</h2>
            <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>目标 <span class="font-mono text-foreground">{{ measurement.target }}</span></span>
              <span>测量 ID <span class="font-mono text-foreground">{{ measurement.id }}</span></span>
            </p>
          </div>
          <Button variant="outline" size="sm" class="self-start sm:self-auto" @click="copyShareLink">
            <Link data-icon="inline-start" />
            复制链接
          </Button>
        </div>

        <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
          <StatCard label="探针数量" :value="probes.length" :hint="measurement.locations?.[0]?.magic || '全球'" />
          <StatCard label="平均跃点" :value="averageHops" hint="已完成探针平均" />
          <StatCard label="到达率" :value="`${reachRate}%`" :hint="`${reachedCount}/${finishedProbes.length} 个探针到达目标`" />
          <StatCard
            label="状态"
            :value="measurement.status === 'in-progress' ? '进行中' : '已完成'"
            :hint="`创建于 ${new Date(measurement.createdAt).toLocaleString('zh-CN')}`"
          />
        </div>

        <p
          v-if="!probes.length"
          class="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground"
        >
          该测量没有探针结果。
        </p>

        <div v-else class="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <!-- 探针列表 -->
          <Card class="gap-0 self-start py-0">
            <div class="flex items-center justify-between border-b px-4 py-3">
              <span class="font-medium">探针</span>
              <span class="font-mono text-xs tabular-nums text-muted-foreground">
                {{ reachedCount }}/{{ probes.length }} 到达
              </span>
            </div>
            <ul class="max-h-[28rem] divide-y overflow-y-auto lg:max-h-[46rem]">
              <li v-for="row in probes" :key="row.index">
                <button
                  type="button"
                  class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  :class="selectedIndex === row.index ? 'bg-muted' : ''"
                  :aria-pressed="selectedIndex === row.index"
                  @click="selectedIndex = row.index"
                >
                  <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="TONES[row.tone].dot" :title="TONES[row.tone].label" />
                  <span class="flex min-w-0 flex-1 flex-col gap-1">
                    <span class="flex items-center justify-between gap-2">
                      <span class="flex min-w-0 items-center gap-2 text-sm">
                        <span v-if="flagClass(row.probe.country)" class="fi shrink-0 rounded-[2px]" :class="flagClass(row.probe.country)" />
                        <span class="truncate">{{ probePlace(row.probe) }}</span>
                      </span>
                      <Loader2 v-if="row.tone === 'running'" class="size-3 shrink-0 animate-spin text-muted-foreground" />
                      <span v-else class="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{{ row.hops.length }} 跳</span>
                    </span>
                    <span class="truncate text-xs text-muted-foreground">
                      <span class="font-mono tabular-nums">AS{{ row.probe.asn }}</span> · {{ row.probe.network }}
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </Card>

          <div class="flex min-w-0 flex-col gap-6">
            <!-- 地图 -->
            <Card class="gap-0 py-0">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                <span class="font-medium">
                  <template v-if="selectedRow && traceRoute">{{ probePlace(selectedRow.probe) }} 路由路径</template>
                  <template v-else>探针分布地图</template>
                </span>
                <div class="flex flex-wrap items-center gap-4">
                  <div v-if="!traceRoute" class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span v-for="(tone, key) in TONES" :key="key" class="flex items-center gap-1.5">
                      <span class="size-2 rounded-full" :class="tone.dot" />{{ tone.label }}
                    </span>
                  </div>
                  <div v-if="selectedRow" class="flex gap-1">
                    <Button v-if="traceRoute" variant="ghost" size="xs" @click="toggleFullscreenMap">
                      <Maximize2 data-icon="inline-start" />
                      全屏
                    </Button>
                    <Button variant="ghost" size="xs" @click="clearSelectedProbe">
                      <X data-icon="inline-start" />
                      退出路径
                    </Button>
                  </div>
                </div>
              </div>
              <div class="relative h-[420px]">
                <TraceMap
                  class="size-full"
                  :route="traceRoute"
                  :origin="mapOrigin"
                  :markers="probeMarkers"
                  :selected-ttl="selectedTtl"
                  @select-ttl="selectedTtl = $event"
                  @select-marker="selectedIndex = $event"
                />
                <div
                  v-if="analysisPending"
                  class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/60 text-sm text-muted-foreground"
                >
                  <Loader2 class="size-4 animate-spin" />
                  正在跨库定位跃点…
                </div>
              </div>
            </Card>

            <!-- 选中探针的路由路径 -->
            <Card v-if="selectedRow" class="gap-0 py-0">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div class="flex min-w-0 flex-col">
                  <span class="font-medium">{{ probePlace(selectedRow.probe) }} 的路由路径</span>
                  <span class="truncate text-xs text-muted-foreground">
                    <span class="font-mono tabular-nums">AS{{ selectedRow.probe.asn }}</span> · {{ selectedRow.probe.network }}
                  </span>
                </div>
                <Badge class="border-transparent" :class="TONES[selectedRow.tone].badge">
                  {{ TONES[selectedRow.tone].label }}
                </Badge>
              </div>

              <div v-if="analysisPending" class="flex flex-wrap gap-2 border-b px-4 py-3">
                <Skeleton v-for="i in 4" :key="i" class="h-7 w-28 rounded-md" />
              </div>
              <div v-else-if="summary" class="flex flex-wrap items-center gap-2 border-b px-4 py-3 text-xs">
                <span v-if="summary.asPath.length" class="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-md border px-2 py-1">
                  <span class="text-muted-foreground">AS 路径</span>
                  <template v-for="(asn, i) in summary.asPath" :key="`${i}-${asn}`">
                    <span v-if="i" class="text-muted-foreground">→</span>
                    <span class="font-mono tabular-nums" :title="asNames.get(asn)">AS{{ asn }}</span>
                  </template>
                </span>
                <span v-if="countryPath.length" class="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-md border px-2 py-1">
                  <span class="text-muted-foreground">途经</span>
                  <template v-for="(code, i) in countryPath" :key="`${i}-${code}`">
                    <span v-if="i" class="text-muted-foreground">→</span>
                    <span class="inline-flex items-center gap-1">
                      <span v-if="flagClass(code)" class="fi rounded-[2px]" :class="flagClass(code)" />{{ countryName(code) }}
                    </span>
                  </template>
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1">
                  <span class="text-muted-foreground">总距离</span>
                  <span class="font-mono tabular-nums">{{ Math.round(summary.distanceKm).toLocaleString('zh-CN') }} km</span>
                </span>
                <Badge class="border-transparent" :class="summary.reached ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'">
                  {{ summary.reached ? '已到达目标' : '未到达目标' }}
                </Badge>
              </div>
              <div v-else-if="analysisError" class="border-b p-4">
                <Alert variant="destructive">
                  <TriangleAlert />
                  <AlertTitle>跃点定位失败</AlertTitle>
                  <AlertDescription>{{ analysisError }}</AlertDescription>
                  <AlertAction>
                    <Button variant="outline" size="xs" @click="retryAnalysis">
                      <RefreshCw data-icon="inline-start" />
                      重试
                    </Button>
                  </AlertAction>
                </Alert>
              </div>

              <div class="overflow-x-auto px-2 pb-2">
                <p v-if="selectedRow.tone === 'running' && !selectedRow.hops.length" class="px-2 py-8 text-center text-sm text-muted-foreground">
                  该探针仍在追踪中…
                </p>
                <p v-else-if="!selectedRow.hops.length" class="px-2 py-8 text-center text-sm text-muted-foreground">
                  该探针没有跃点数据
                </p>
                <ReuseHopTable v-else />
              </div>
            </Card>
            <p v-else class="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
              从探针列表中选择一个探针，查看完整路由路径与每一跳的地理位置。
            </p>
          </div>
        </div>
      </template>

      <!-- 空闲 -->
      <p
        v-else-if="state === 'idle'"
        class="flex items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground"
      >
        <Route class="size-4" />
        输入目标地址后，将从 Globalping 全球探针发起 MTR 路由追踪。
      </p>
    </section>

    <!-- 全屏地图 -->
    <div v-if="isFullscreenMap && traceRoute" class="fixed inset-0 z-[60] overflow-hidden bg-background">
      <TraceMap
        class="size-full"
        :route="traceRoute"
        :origin="mapOrigin"
        :selected-ttl="selectedTtl"
        @select-ttl="selectedTtl = $event"
      />
      <Button
        variant="outline"
        size="icon"
        class="absolute top-4 right-4 z-10 bg-background"
        title="退出全屏"
        aria-label="退出全屏"
        @click="toggleFullscreenMap"
      >
        <X />
      </Button>

      <!-- 可拖动的路由跃点窗口 -->
      <div
        ref="routeTableWindow"
        class="absolute z-10 flex flex-col overflow-hidden rounded-xl border bg-background/95 shadow-lg backdrop-blur-md transition-[transform,width] duration-300 select-none"
        :class="isTableMinimized
          ? 'w-auto'
          : isTableCollapsed
            ? 'w-36 translate-y-[calc(100%-2.75rem)]'
            : 'max-h-[70%] w-[calc(100%-2rem)] md:w-[45%]'"
        :style="windowStyle"
        @mouseenter="handleMouseEnter"
      >
        <div class="flex h-11 shrink-0 cursor-move items-center justify-between gap-3 border-b px-3" @mousedown="startDrag">
          <span class="flex items-center gap-2 text-sm font-medium">
            <Route class="size-4 text-muted-foreground" />
            路由跃点
          </span>
          <div class="flex gap-1">
            <Button
              v-if="!isTableMinimized"
              variant="ghost"
              size="icon-xs"
              :title="isTableCollapsed ? '展开' : '收起'"
              :aria-label="isTableCollapsed ? '展开' : '收起'"
              @click.stop="toggleTableCollapse"
            >
              <ChevronUp v-if="isTableCollapsed" />
              <ChevronDown v-else />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              :title="isTableMinimized ? '展开' : '最小化'"
              :aria-label="isTableMinimized ? '展开' : '最小化'"
              @click.stop="isTableMinimized = !isTableMinimized"
            >
              <Maximize2 v-if="isTableMinimized" />
              <Minimize2 v-else />
            </Button>
          </div>
        </div>
        <div v-if="!isTableMinimized" class="min-h-0 flex-1 overflow-auto p-1 select-text">
          <ReuseHopTable compact />
        </div>
      </div>
    </div>
  </div>
</template>
