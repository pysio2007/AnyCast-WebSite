<script setup lang="ts">
import type * as Leaflet from 'leaflet'
import type { PingResult } from '~/composables/useGlobalping'
import { Check, Copy, ExternalLink, Loader2, Play, RefreshCw, Square } from '@lucide/vue'
import { toast } from 'vue-sonner'
import 'leaflet/dist/leaflet.css'

interface ProbeRow {
  key: string
  country: string
  countryName: string
  city: string
  asn: number
  network: string
  ip: string
  status: PingResult['status']
  min_rtt: number
  avg_rtt: number
  max_rtt: number
  packet_loss: number | null
  latitude: number
  longitude: number
}

const probeOptions = ['5', '10', '20', '50']
const packetOptions = ['3', '5', '10']
const ipvOptions = [
  { value: 'auto', label: '自动选择' },
  { value: '4', label: 'IPv4' },
  { value: '6', label: 'IPv6' },
]

const route = useRoute()
const router = useRouter()
const { measurement, state, error, run, load, stop } = useGlobalping<PingResult>()

const target = ref('')
const location = ref('world')
const probes = ref('20')
const packets = ref('3')
const ipv = ref('auto')
const selectedProbe = ref('')
const copied = ref(false)
/** Share-link id being loaded, so retry knows whether to reload or re-run. */
const loadedId = ref('')

const busy = computed(() => state.value === 'creating' || state.value === 'running')
const canQuery = computed(() => target.value.trim().length > 0)
// Globalping only accepts ipVersion when the target is a hostname.
const isHostname = computed(() => {
  const t = target.value.trim()
  return /[a-z]/i.test(t) && !t.includes(':') && !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(t)
})

watch(isHostname, (hostname) => {
  if (!hostname) ipv.value = 'auto'
})

// ---------- Formatting ----------

const regionNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
  ? new Intl.DisplayNames(['zh-CN'], { type: 'region' })
  : null

function countryLabel(code: string) {
  if (!/^[A-Z]{2}$/i.test(code)) return code
  try {
    return regionNames?.of(code.toUpperCase()) || code.toUpperCase()
  }
  catch {
    return code.toUpperCase()
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-CN')
}

function fmtMs(v: number) {
  return v > 0 ? v.toFixed(2) : '—'
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]!))
}

interface LatencyLevel { label: string, dot: string, text: string, css: string }
const latencyLevels: (LatencyLevel & { max: number })[] = [
  { max: 15, label: '≤15ms', dot: 'bg-success', text: 'text-success', css: 'var(--success)' },
  { max: 60, label: '≤60ms', dot: 'bg-success/55', text: 'text-success', css: 'color-mix(in oklch, var(--success) 55%, transparent)' },
  { max: 180, label: '≤180ms', dot: 'bg-warning', text: 'text-warning', css: 'var(--warning)' },
  { max: Infinity, label: '>180ms', dot: 'bg-destructive', text: 'text-destructive', css: 'var(--destructive)' },
]
const failedLevel: LatencyLevel = { label: '失败', dot: 'bg-destructive', text: 'text-muted-foreground', css: 'var(--destructive)' }
const pendingCss = 'var(--muted-foreground)'

function latencyLevel(rtt: number): LatencyLevel {
  if (rtt <= 0) return failedLevel
  return latencyLevels.find(l => rtt <= l.max)!
}

function markerCss(p: ProbeRow) {
  return p.status === 'in-progress' ? pendingCss : latencyLevel(p.avg_rtt).css
}

const statusMeta: Record<string, { label: string, class: string }> = {
  'in-progress': { label: '测量中', class: 'bg-info/15 text-info' },
  'ok': { label: '成功', class: 'bg-success/15 text-success' },
  'unreachable': { label: '不可达', class: 'bg-destructive/10 text-destructive' },
  'failed': { label: '失败', class: 'bg-destructive/10 text-destructive' },
  'offline': { label: '离线', class: 'bg-muted text-muted-foreground' },
}

function rowStatus(p: ProbeRow) {
  if (p.status === 'finished') return statusMeta[p.avg_rtt > 0 ? 'ok' : 'unreachable']!
  return statusMeta[p.status] ?? statusMeta.failed!
}

// ---------- Results ----------

const processedResults = computed<ProbeRow[]>(() => {
  const rows = (measurement.value?.results ?? []).map(({ probe, result }, i): ProbeRow => {
    const stats = result.stats
    return {
      key: String(i),
      country: probe.country || '',
      countryName: countryLabel(probe.country || ''),
      city: probe.city || '',
      asn: probe.asn,
      network: probe.network || '',
      ip: result.resolvedAddress || '',
      status: result.status,
      min_rtt: stats?.min ?? 0,
      avg_rtt: stats?.avg ?? 0,
      max_rtt: stats?.max ?? 0,
      packet_loss: result.status === 'finished' && stats ? stats.loss : null,
      latitude: probe.latitude,
      longitude: probe.longitude,
    }
  })
  // Sort by average latency; unanswered / unfinished probes last.
  return rows.sort((a, b) => {
    if (a.avg_rtt === 0 && b.avg_rtt === 0) return 0
    if (a.avg_rtt === 0) return 1
    if (b.avg_rtt === 0) return -1
    return a.avg_rtt - b.avg_rtt
  })
})

const summary = computed(() => {
  const rows = processedResults.value
  const valid = rows.filter(r => r.avg_rtt > 0)
  const finished = rows.filter(r => r.packet_loss != null)
  return {
    total: rows.length,
    success: valid.length,
    successRate: rows.length ? Math.round((valid.length / rows.length) * 100) : 0,
    avg: valid.length ? (valid.reduce((s, r) => s + r.avg_rtt, 0) / valid.length).toFixed(1) : '—',
    min: valid.length ? Math.min(...valid.map(r => r.min_rtt || r.avg_rtt)).toFixed(2) : '—',
    max: valid.length ? Math.max(...valid.map(r => r.max_rtt || r.avg_rtt)).toFixed(2) : '—',
    loss: finished.length ? `${Math.round(finished.reduce((s, r) => s + r.packet_loss!, 0) / finished.length)}%` : '—',
    pending: rows.length - finished.length,
  }
})

// ---------- Measurement ----------

function performPing() {
  if (!canQuery.value || busy.value) return
  selectedProbe.value = ''
  loadedId.value = ''
  const measurementOptions: Record<string, unknown> = { packets: Number(packets.value) }
  if (isHostname.value && ipv.value !== 'auto') measurementOptions.ipVersion = Number(ipv.value)
  run({
    type: 'ping',
    target: target.value.trim(),
    locations: [{ magic: location.value.trim() || 'world', limit: Number(probes.value) }],
    measurementOptions,
  })
}

function loadShared(id: string) {
  selectedProbe.value = ''
  loadedId.value = id
  load(id)
}

function retry() {
  if (loadedId.value) loadShared(loadedId.value)
  else performPing()
}

// Keep ?id= in sync with the current measurement so the URL is always shareable.
watch(() => measurement.value?.id, (id) => {
  if (!id) return
  if (!target.value) target.value = measurement.value!.target
  if (route.query.id !== id) router.replace({ query: { ...route.query, id } })
})

function copyShareLink() {
  const id = measurement.value?.id
  if (!id) return
  const url = `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(id)}`
  navigator.clipboard.writeText(url)
    .then(() => {
      copied.value = true
      toast.success('已复制分享链接')
      setTimeout(() => (copied.value = false), 2000)
    })
    .catch((err) => {
      console.error('复制链接失败:', err)
      toast.error('复制失败')
    })
}

// ---------- Map ----------

const colorMode = useColorMode()
const mapEl = ref<HTMLElement>()
const loadingMap = ref(false)
const mapError = ref('')
let L: typeof Leaflet | null = null
let map: Leaflet.Map | null = null
let tileLayer: Leaflet.TileLayer | null = null
let markerLayer: Leaflet.LayerGroup | null = null
let lastFitKey = ''
const markersById = new Map<string, Leaflet.Marker>()

const tileUrl = computed(() =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${colorMode.value === 'dark' ? 'Dark' : 'Light'}_Gray_Base/MapServer/tile/{z}/{y}/{x}`)

async function ensureMap() {
  if (map) return map
  if (!mapEl.value) return null
  loadingMap.value = true
  try {
    if (!L) {
      // leaflet ships UMD/CJS; Vite exposes it as `default`, the typings as a namespace.
      const mod = await import('leaflet')
      L = (mod as unknown as { default?: typeof Leaflet }).default ?? mod
    }
    if (!mapEl.value) return null
    map = L.map(mapEl.value, { center: [20, 0], zoom: 2, minZoom: 1, maxZoom: 16, worldCopyJump: true })
    tileLayer = L.tileLayer(tileUrl.value, {
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 16,
    }).addTo(map)
    markerLayer = L.layerGroup().addTo(map)
    return map
  }
  catch (err) {
    console.error('地图初始化失败:', err)
    mapError.value = `地图加载失败: ${err instanceof Error ? err.message : String(err)}`
    return null
  }
  finally {
    loadingMap.value = false
  }
}

function popupHtml(p: ProbeRow) {
  const level = latencyLevel(p.avg_rtt)
  const status = rowStatus(p)
  const row = (k: string, v: string, color = '') =>
    `<div class="ping-popup-row"><span>${k}</span><span class="font-mono tabular-nums"${color ? ` style="color:${color}"` : ''}>${v}</span></div>`
  return `<div class="ping-popup">
    <div class="ping-popup-title">${escapeHtml([p.city, p.countryName].filter(Boolean).join(', ') || '未知位置')}</div>
    <div class="ping-popup-sub">${escapeHtml(p.network || '未知网络')}</div>
    ${row('ASN', p.asn ? `AS${p.asn}` : '未知')}
    ${row('状态', status.label)}
    ${row('平均延迟', `${fmtMs(p.avg_rtt)} ms`, level.css)}
    ${row('最小 / 最大', `${fmtMs(p.min_rtt)} / ${fmtMs(p.max_rtt)} ms`)}
    ${p.packet_loss != null ? row('丢包率', `${p.packet_loss}%`, p.packet_loss > 0 ? 'var(--destructive)' : 'var(--success)') : ''}
  </div>`
}

async function renderMap(rows: ProbeRow[]) {
  const m = await ensureMap()
  if (!m || !L || !markerLayer) return

  markerLayer.clearLayers()
  markersById.clear()
  for (const p of rows) {
    const icon = L.divIcon({
      className: 'ping-marker',
      html: `<span style="background:${markerCss(p)}"></span>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -6],
    })
    const marker = L.marker([p.latitude, p.longitude], { icon })
      .bindPopup(popupHtml(p), { className: 'ping-map-popup' })
      .addTo(markerLayer)
    markersById.set(p.key, marker)
  }

  // Fit bounds only when the probe set changes, so live updates don't reset the user's view.
  const fitKey = rows.map(p => p.key).sort().join(',')
  if (fitKey !== lastFitKey) {
    lastFitKey = fitKey
    const bounds = L.latLngBounds(rows.map(p => [p.latitude, p.longitude] as [number, number]))
    // No animation: a zoom transition ending after the map is removed throws inside Leaflet.
    if (bounds.isValid()) m.fitBounds(bounds.pad(0.1), { maxZoom: 6, animate: false })
    else m.setView([20, 0], 2)
  }
  m.invalidateSize()

  if (selectedProbe.value) markersById.get(selectedProbe.value)?.openPopup()
}

const mappableResults = computed(() => processedResults.value
  .filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)))

const mapSignature = computed(() => mappableResults.value
  .map(p => `${p.key}:${p.status}:${p.avg_rtt}:${p.packet_loss}`)
  .join('|'))

watch([mapSignature, mapEl], () => {
  if (!mappableResults.value.length || !mapEl.value) return
  mapError.value = ''
  renderMap(mappableResults.value)
}, { flush: 'post' })

watch(tileUrl, url => tileLayer?.setUrl(url))

function selectProbe(key: string) {
  selectedProbe.value = key
  mapEl.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

watch(selectedProbe, (key) => {
  const marker = key ? markersById.get(key) : undefined
  if (!marker || !map) return
  map.setView(marker.getLatLng(), 6)
  marker.openPopup()
})

// ---------- Lifecycle ----------

onMounted(() => {
  const id = route.query.id
  if (typeof id === 'string' && id.trim()) loadShared(id.trim())
})

function destroyMap() {
  map?.remove()
  map = null
  tileLayer = null
  markerLayer = null
  markersById.clear()
  lastFitKey = ''
}

// The map card unmounts when a new measurement starts; drop the stale instance with it.
watch(mapEl, (el, old) => {
  if (old && el !== old) destroyMap()
})

onBeforeUnmount(destroyMap)
</script>

<template>
  <div>
    <PageSeo title="全球PING" description="使用 Globalping 开放探针网络从全球各地对目标主机进行 PING 测试，分析网络延迟、丢包和可达性。" />

    <PageHeader
      eyebrow="工具"
      title="全球 Ping"
      description="借助 Globalping 开放探针网络，从全球多个城市与网络同时对目标发起 Ping，实时查看延迟、丢包与地理分布。"
    />

    <section class="page-container py-12">
      <Card class="gap-0 py-0">
        <form class="flex flex-col gap-5 p-5" @submit.prevent="performPing">
          <div class="grid gap-5 lg:grid-cols-2">
            <div class="flex flex-col gap-2">
              <Label for="ping-target">目标地址</Label>
              <Input
                id="ping-target"
                v-model="target"
                placeholder="1.1.1.1 或 google.com"
                autocomplete="off"
                spellcheck="false"
                class="font-mono"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="ping-location">探针位置</Label>
              <GlobalpingLocation id="ping-location" v-model="location" />
            </div>
          </div>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div class="grid grid-cols-3 gap-4 sm:flex">
              <div class="flex flex-col gap-2">
                <Label for="ping-probes">探针数量</Label>
                <Select v-model="probes">
                  <SelectTrigger id="ping-probes" class="w-full sm:w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="n in probeOptions" :key="n" :value="n">{{ n }} 个</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex flex-col gap-2">
                <Label for="ping-packets">包数</Label>
                <Select v-model="packets">
                  <SelectTrigger id="ping-packets" class="w-full sm:w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="n in packetOptions" :key="n" :value="n">{{ n }} 个</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex flex-col gap-2">
                <Label for="ping-ipv">IP 版本</Label>
                <Select v-model="ipv" :disabled="!isHostname">
                  <SelectTrigger id="ping-ipv" class="w-full sm:w-32" :title="isHostname ? undefined : '仅域名目标可选择 IP 版本'">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="o in ipvOptions" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="flex gap-2 sm:ml-auto">
              <Button v-if="busy" type="button" variant="outline" class="flex-1 sm:flex-none" @click="stop">
                <Square data-icon="inline-start" />停止
              </Button>
              <Button type="submit" class="flex-1 sm:flex-none" :disabled="!canQuery || busy">
                <Loader2 v-if="busy" data-icon="inline-start" class="animate-spin" />
                <Play v-else data-icon="inline-start" />
                测试
              </Button>
            </div>
          </div>
        </form>
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-5 py-3">
          <GlobalpingQuota />
          <span v-if="state === 'running'" class="flex items-center gap-2 text-xs text-muted-foreground">
            <span class="relative flex size-2">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span class="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            测量进行中，结果实时更新
          </span>
        </div>
      </Card>

      <Alert v-if="error" variant="destructive" class="mt-6">
        <AlertTitle>测量失败</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
        <AlertAction>
          <Button size="xs" variant="outline" @click="retry">
            <RefreshCw data-icon="inline-start" />重试
          </Button>
        </AlertAction>
      </Alert>
    </section>

    <!-- Creating a measurement / loading a shared one -->
    <section v-if="busy && !measurement" class="page-container flex flex-col gap-6 border-t py-12">
      <p class="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 class="size-4 animate-spin" />
        {{ loadedId ? `正在加载测量 ${loadedId} 的结果...` : '正在启动全球 PING 测量...' }}
      </p>
      <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3 lg:grid-cols-6">
        <StatCard v-for="label in ['探针', '成功', '平均延迟', '最小延迟', '最大延迟', '平均丢包']" :key="label" :label="label" loading />
      </div>
      <Skeleton class="h-[420px] w-full rounded-xl" />
    </section>

    <!-- Results (update live while probes report) -->
    <section v-else-if="measurement" class="page-container flex flex-col gap-8 border-t py-12">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="text-2xl font-semibold tracking-tight">
              测量 <span class="font-mono tabular-nums">#{{ measurement.id }}</span>
            </h2>
            <Badge
              variant="outline"
              class="border-transparent"
              :class="measurement.status === 'finished' ? 'bg-success/15 text-success' : 'bg-info/15 text-info'"
            >
              {{ measurement.status === 'finished' ? '已完成' : '进行中' }}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground">
            目标 <span class="font-mono text-foreground">{{ measurement.target }}</span>
            <template v-if="formatDate(measurement.createdAt)"> · 创建于 {{ formatDate(measurement.createdAt) }}</template>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" @click="copyShareLink">
            <Check v-if="copied" data-icon="inline-start" />
            <Copy v-else data-icon="inline-start" />
            {{ copied ? '已复制' : '复制链接' }}
          </Button>
          <Button variant="outline" size="sm" as-child>
            <a :href="`https://globalping.io?measurement=${encodeURIComponent(measurement.id)}`" target="_blank" rel="noopener">
              Globalping <ExternalLink data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </div>

      <p v-if="!processedResults.length" class="text-sm text-muted-foreground">
        暂无探针返回结果。
      </p>

      <template v-else>
        <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="探针" :value="summary.total" :hint="summary.pending ? `${summary.pending} 个测量中` : '全部完成'" />
          <StatCard label="成功" :value="summary.success" :hint="`${summary.successRate}% 可达`" />
          <StatCard label="平均延迟" :value="summary.avg" hint="ms · 成功探针" />
          <StatCard label="最小延迟" :value="summary.min" hint="ms" />
          <StatCard label="最大延迟" :value="summary.max" hint="ms" />
          <StatCard label="平均丢包" :value="summary.loss" hint="已完成探针" />
        </div>

        <Card class="gap-0 overflow-hidden py-0">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
            <h3 class="text-sm font-medium">探针分布</h3>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span v-for="l in latencyLevels" :key="l.label" class="flex items-center gap-1.5">
                <span class="size-2.5 rounded-full" :class="l.dot" />
                <span class="font-mono tabular-nums">{{ l.label }}</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="size-2.5 rounded-full bg-muted-foreground" />
                测量中
              </span>
            </div>
          </div>
          <div class="relative isolate h-[420px]">
            <div ref="mapEl" class="ping-map size-full" />
            <div
              v-if="loadingMap"
              class="absolute inset-0 z-[1001] flex items-center justify-center gap-2 bg-background/70 text-sm text-muted-foreground"
            >
              <Loader2 class="size-4 animate-spin" />加载地图中...
            </div>
          </div>
          <p v-if="mapError" class="border-t px-5 py-3 text-sm text-destructive">{{ mapError }}</p>
        </Card>

        <Card class="gap-0 overflow-hidden py-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="pl-5">位置</TableHead>
                  <TableHead>网络</TableHead>
                  <TableHead>解析 IP</TableHead>
                  <TableHead class="text-right">丢包</TableHead>
                  <TableHead class="text-right">最小</TableHead>
                  <TableHead class="text-right">平均</TableHead>
                  <TableHead class="text-right">最大</TableHead>
                  <TableHead class="pr-5 text-right">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="r in processedResults"
                  :key="r.key"
                  :data-state="selectedProbe === r.key ? 'selected' : undefined"
                  class="cursor-pointer"
                  @click="selectProbe(r.key)"
                >
                  <TableCell class="pl-5">
                    <div class="flex items-center gap-2 whitespace-nowrap">
                      <span v-if="/^[a-z]{2}$/i.test(r.country)" :class="`fi fi-${r.country.toLowerCase()} shrink-0 rounded-[2px]`" />
                      <span>{{ r.countryName || '未知' }}</span>
                      <span v-if="r.city" class="text-muted-foreground">{{ r.city }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex max-w-64 items-center gap-2 whitespace-nowrap">
                      <span class="font-mono tabular-nums">{{ r.asn ? `AS${r.asn}` : '未知' }}</span>
                      <span v-if="r.network" class="truncate text-muted-foreground" :title="r.network">{{ r.network }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="font-mono text-xs tabular-nums text-muted-foreground">{{ r.ip || '—' }}</TableCell>
                  <TableCell
                    class="text-right font-mono tabular-nums"
                    :class="r.packet_loss == null ? 'text-muted-foreground' : r.packet_loss >= 100 ? 'text-destructive' : r.packet_loss > 0 ? 'text-warning' : 'text-success'"
                  >
                    {{ r.packet_loss == null ? '—' : `${r.packet_loss}%` }}
                  </TableCell>
                  <TableCell class="text-right font-mono tabular-nums" :class="latencyLevel(r.min_rtt).text">{{ fmtMs(r.min_rtt) }}</TableCell>
                  <TableCell class="text-right font-mono font-medium tabular-nums" :class="latencyLevel(r.avg_rtt).text">{{ fmtMs(r.avg_rtt) }}</TableCell>
                  <TableCell class="text-right font-mono tabular-nums" :class="latencyLevel(r.max_rtt).text">{{ fmtMs(r.max_rtt) }}</TableCell>
                  <TableCell class="pr-5 text-right">
                    <Badge variant="outline" class="border-transparent" :class="rowStatus(r).class">
                      <Loader2 v-if="r.status === 'in-progress'" class="animate-spin" />
                      {{ rowStatus(r).label }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
        <p class="-mt-4 text-xs text-muted-foreground">延迟单位 ms，点击行可在地图上定位探针。</p>
      </template>
    </section>
  </div>
</template>

<style>
.ping-map.leaflet-container {
  background: var(--muted);
  font-family: inherit;
}

.ping-map .leaflet-control-zoom {
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 0.8);
  overflow: hidden;
  box-shadow: none;
}

.ping-map .leaflet-control-zoom a {
  background: var(--background);
  color: var(--foreground);
  border-color: var(--border);
}

.ping-map .leaflet-control-zoom a:hover {
  background: var(--muted);
}

.ping-map .leaflet-control-attribution {
  background: color-mix(in oklch, var(--background) 80%, transparent);
  color: var(--muted-foreground);
}

.ping-map .leaflet-control-attribution a {
  color: var(--foreground);
}

.ping-marker {
  background: transparent;
  border: none;
}

.ping-marker span {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  box-shadow: 0 0 0 2px var(--background);
}

.ping-map-popup .leaflet-popup-content-wrapper,
.ping-map-popup .leaflet-popup-tip {
  background: var(--popover);
  color: var(--popover-foreground);
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
}

.ping-map-popup .leaflet-popup-content-wrapper {
  border-radius: calc(var(--radius) * 1.4);
}

.ping-map-popup .leaflet-popup-content {
  margin: 12px 14px;
}

.ping-map-popup a.leaflet-popup-close-button {
  color: var(--muted-foreground);
}

.ping-popup {
  display: flex;
  min-width: 200px;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.ping-popup-title {
  font-size: 13px;
  font-weight: 600;
}

.ping-popup-sub {
  margin-bottom: 4px;
  color: var(--muted-foreground);
}

.ping-popup-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.ping-popup-row span:first-child {
  color: var(--muted-foreground);
}

.ping-popup-row span:last-child {
  text-align: right;
}
</style>
