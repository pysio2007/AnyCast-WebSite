<script setup lang="ts">
import type * as Leaflet from 'leaflet'
import type { GlobalpingProbe, MtrHop, MtrResult, TracerouteHop, TracerouteResult } from '~/composables/useGlobalping'
import type { IpGeoInfo } from '~/utils/geoip'
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
import countryCenters from '~/utils/country-centers'
import { getIpGeoLocation, isPrivateIP } from '~/utils/geoip'
import 'leaflet/dist/leaflet.css'

type TraceResult = MtrResult | TracerouteResult
type TraceHop = MtrHop | TracerouteHop
type ProbeTone = 'running' | 'reached' | 'unreached' | 'failed'

interface ProbeRow {
  index: number
  probe: GlobalpingProbe
  result: TraceResult
  hops: TraceHop[]
  /** 最后一个响应的跃点就是目标地址 */
  reached: boolean
  tone: ProbeTone
}

interface PathPoint {
  kind: 'probe' | 'hop' | 'target'
  /** 跃点序号；起点与未到达的目标为 null */
  hop: number | null
  address: string | null
  hostname: string | null
  asn: string
  org: string
  country: string
  city: string
  private: boolean
  /** 任播地址：地理库位置不可信，地图上取上一跳位置 */
  anycast: boolean
  locating: boolean
  latitude?: number
  longitude?: number
  loss: number | null
  rtt: number | null
}

const PROBE_COUNTS = ['3', '5', '10']
const PROTOCOLS = ['ICMP', 'TCP', 'UDP']
const IP_VERSIONS = [
  { value: 'auto', label: '自动' },
  { value: '4', label: 'IPv4' },
  { value: '6', label: 'IPv6' },
]
const TONES: Record<ProbeTone, { label: string, dot: string, badge: string, color: string, popup: string }> = {
  running: { label: '进行中', dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground', color: 'var(--muted-foreground)', popup: '' },
  reached: { label: '已到达', dot: 'bg-success', badge: 'bg-success/15 text-success', color: 'var(--success)', popup: 'gt-ok' },
  unreached: { label: '未到达', dot: 'bg-warning', badge: 'bg-warning/15 text-warning', color: 'var(--warning)', popup: 'gt-warn' },
  failed: { label: '失败', dot: 'bg-destructive', badge: 'bg-destructive/15 text-destructive', color: 'var(--destructive)', popup: 'gt-fail' },
}

const [DefineHopTable, ReuseHopTable] = createReusableTemplate<{ compact?: boolean }>()
const colorMode = useColorMode()
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
    const hops: TraceHop[] = result.hops ?? []
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

const countryLabel = (code: string) => countryCenters[code]?.country_name || code

const placeText = (country: string, city: string) => [country && countryLabel(country), city].filter(Boolean).join(', ') || '未知'

const flagClass = (code?: string) => (code && /^[a-z]{2}$/i.test(code) ? `fi-${code.toLowerCase()}` : '')

const rttText = (rtt: number | null) => (rtt === null ? '—' : `${Number(rtt.toFixed(2))} ms`)

const lossText = (loss: number | null) => (loss === null ? '—' : `${Number(loss.toFixed(1))}%`)

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]!)

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

// ---------- 跃点地理位置 ----------

const geoCache = shallowReactive(new Map<string, IpGeoInfo | null>())
const geoPending = new Set<string>()

const locate = async (ip: string) => {
  if (geoCache.has(ip) || geoPending.has(ip)) return
  geoPending.add(ip)
  geoCache.set(ip, await getIpGeoLocation(ip))
  geoPending.delete(ip)
}

const lookupPoint = (kind: PathPoint['kind'], hop: number | null, address: string | null, hostname: string | null, asns: number[]): PathPoint => {
  const isPrivate = !!address && isPrivateIP(address)
  const geo = address && !isPrivate ? geoCache.get(address) : undefined
  const anycast = geo?.anycast === true
  return {
    kind,
    hop,
    address,
    hostname: hostname && hostname !== address ? hostname : null,
    asn: asns.length ? asns.map(asn => `AS${asn}`).join(' ') : geo?.asn ? `AS${geo.asn}` : '',
    org: geo?.org.replace(/^AS\d+\s*/, '') ?? '',
    country: geo?.country ?? '',
    city: geo?.city ?? '',
    private: isPrivate,
    anycast,
    locating: !!address && !isPrivate && !geoCache.has(address),
    latitude: anycast ? undefined : geo?.latitude,
    longitude: anycast ? undefined : geo?.longitude,
    loss: null,
    rtt: null,
  }
}

// 选中探针的完整路径：起点（探针自身坐标）→ 各跃点 → 目标
const currentPath = computed<PathPoint[]>(() => {
  const row = selectedRow.value
  if (!row) return []
  const { probe, result } = row
  const points: PathPoint[] = [{
    kind: 'probe',
    hop: null,
    address: null,
    hostname: null,
    asn: `AS${probe.asn}`,
    org: probe.network,
    country: probe.country,
    city: probe.city,
    private: false,
    anycast: false,
    locating: false,
    latitude: probe.latitude,
    longitude: probe.longitude,
    loss: null,
    rtt: null,
  }]

  let anchor: [number, number] = [probe.latitude, probe.longitude]
  const endIndex = row.reached ? row.hops.findLastIndex(hop => hop.resolvedAddress) : -1

  row.hops.forEach((hop, i) => {
    const point = lookupPoint(i === endIndex ? 'target' : 'hop', i + 1, hop.resolvedAddress, hop.resolvedHostname, 'asn' in hop ? hop.asn : [])
    if ('stats' in hop) {
      point.rtt = hop.stats.avg
      point.loss = hop.stats.loss
    }
    else if (hop.timings.length) {
      point.rtt = hop.timings.reduce((acc, t) => acc + t.rtt, 0) / hop.timings.length
    }
    if (point.anycast) [point.latitude, point.longitude] = anchor
    else if (point.latitude !== undefined && point.longitude !== undefined) anchor = [point.latitude, point.longitude]
    points.push(point)
  })

  // 未到达目标时追加目标本身（任播目标无法可靠定位，只列出不上图）
  if (!row.reached && row.tone !== 'running' && result.resolvedAddress) {
    points.push(lookupPoint('target', null, result.resolvedAddress, result.resolvedHostname, []))
  }
  return points
})

const pathLocating = computed(() => currentPath.value.some(point => point.locating))

watch(currentPath, (points) => {
  for (const point of points) {
    if (point.locating && point.address) locate(point.address)
  }
})

// ---------- 地图 ----------

const mapEl = ref<HTMLElement | null>(null)
const fullscreenEl = ref<HTMLElement | null>(null)
const loadingMap = ref(false)
const mapError = ref('')
const hasPath = ref(false)
let L: typeof Leaflet | null = null
let map: Leaflet.Map | null = null
let tiles: Leaflet.TileLayer | null = null
let probeMarkers = new Map<number, Leaflet.Marker>()
let pathLines: Leaflet.Polyline[] = []
let pathMarkers: Leaflet.Marker[] = []
let fittedMeasurement = ''
let fittedProbe: number | null = null

// 全屏地图与浮动跃点窗口
const isFullscreenMap = ref(false)
let fullscreenMap: Leaflet.Map | null = null
let fullscreenTiles: Leaflet.TileLayer | null = null
let fullscreenLayer: Leaflet.FeatureGroup | null = null
const isTableMinimized = ref(false)
const isTableCollapsed = ref(false)
const routeTableWindow = ref<HTMLElement | null>(null)
const windowPos = ref<{ left: number, top: number } | null>(null)
let isDragging = false
let dragOffsetX = 0
let dragOffsetY = 0

const loadLeaflet = async () => {
  L ??= (await import('leaflet')).default
  return L
}

// CARTO 底图现已要求 API KEY，改用无需密钥的 Esri Canvas 灰度底图
const tileUrl = () =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${colorMode.value === 'dark' ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`

const addTiles = (leaflet: typeof Leaflet, target: Leaflet.Map) =>
  leaflet.tileLayer(tileUrl(), {
    attribution: 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 16,
  }).addTo(target)

watch(() => colorMode.value, () => {
  tiles?.setUrl(tileUrl())
  fullscreenTiles?.setUrl(tileUrl())
})

const dotIcon = (leaflet: typeof Leaflet, color: string, size: number) =>
  leaflet.divIcon({
    className: 'gt-dot-icon',
    html: `<span class="gt-dot" style="width:${size}px;height:${size}px;background:${color}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })

const popupRow = (label: string, value: string, cls = '') =>
  `<dt>${label}</dt><dd class="${cls}">${value}</dd>`

const probePopup = (row: ProbeRow) => `
  <div class="gt-popup-body">
    <div class="gt-popup-title">${escapeHtml(placeText(row.probe.country, row.probe.city))}</div>
    <div class="gt-popup-sub">${escapeHtml(row.probe.network)}</div>
    <dl>
      ${popupRow('ASN', `AS${row.probe.asn}`)}
      ${popupRow('状态', TONES[row.tone].label, TONES[row.tone].popup)}
      ${popupRow('跃点数', String(row.hops.length))}
    </dl>
  </div>`

const pointPopup = (point: PathPoint, index: number, last: number) => {
  const title = point.kind === 'probe'
    ? `探针 · ${placeText(point.country, point.city)}`
    : point.hop === null ? '目标（未到达）' : `跃点 ${point.hop}${point.kind === 'target' ? ' · 目标' : ''}`
  const sub = point.kind === 'probe'
    ? point.org
    : point.anycast ? '任播地址，位置按上一跳估计' : placeText(point.country, point.city)
  const asn = `${point.asn} ${point.kind === 'probe' ? '' : point.org}`.trim()
  return `
    <div class="gt-popup-body">
      <div class="gt-popup-title">${escapeHtml(title)}</div>
      ${point.address ? `<div class="gt-popup-addr">${escapeHtml(point.address)}</div>` : ''}
      ${point.hostname ? `<div class="gt-popup-addr">${escapeHtml(point.hostname)}</div>` : ''}
      <div class="gt-popup-sub">${escapeHtml(sub)}</div>
      <dl>
        ${point.rtt !== null ? popupRow('延迟', escapeHtml(rttText(point.rtt))) : ''}
        ${point.loss !== null ? popupRow('丢包', escapeHtml(lossText(point.loss))) : ''}
        ${asn ? popupRow('ASN', escapeHtml(asn)) : ''}
        ${popupRow('序号', `${index}/${last}`)}
      </dl>
    </div>`
}

const clearPath = () => {
  pathLines.forEach(line => line.remove())
  pathMarkers.forEach(marker => marker.remove())
  pathLines = []
  pathMarkers = []
}

const destroyMap = () => {
  map?.remove()
  map = null
  tiles = null
  probeMarkers = new Map()
  pathLines = []
  pathMarkers = []
  hasPath.value = false
  fittedMeasurement = ''
  fittedProbe = null
}

const fitLayers = (leaflet: typeof Leaflet, target: Leaflet.Map, layers: Leaflet.Layer[]) => {
  const bounds = leaflet.featureGroup(layers).getBounds()
  if (bounds.isValid()) target.fitBounds(bounds.pad(0.1), { maxZoom: 8 })
}

const syncFullscreen = (fit = false) => {
  const leaflet = L
  const full = fullscreenMap
  if (!leaflet || !full) return
  fullscreenLayer?.remove()
  fullscreenLayer = leaflet.featureGroup([
    ...pathLines.map(line => leaflet.polyline(line.getLatLngs() as Leaflet.LatLngExpression[], { ...line.options })),
    ...pathMarkers.map((marker) => {
      const copy = leaflet.marker(marker.getLatLng(), { icon: marker.options.icon })
      const content = marker.getPopup()?.getContent()
      if (typeof content === 'string') copy.bindPopup(content, { className: 'gt-popup' })
      return copy
    }),
  ]).addTo(full)
  if (fit) {
    const bounds = fullscreenLayer.getBounds()
    if (bounds.isValid()) full.fitBounds(bounds.pad(0.1), { maxZoom: 8 })
  }
}

const renderPath = () => {
  const leaflet = L
  const current = map
  if (!leaflet || !current) return
  clearPath()

  const row = selectedRow.value
  const points = pathLocating.value
    ? []
    : currentPath.value.filter(point => point.latitude !== undefined && point.longitude !== undefined)
  const last = points.length - 1

  for (let i = 0; i < last; i++) {
    const from = points[i]!
    const to = points[i + 1]!
    pathLines.push(
      leaflet.polyline([[from.latitude!, from.longitude!], [to.latitude!, to.longitude!]], {
        weight: 2,
        opacity: 0.85,
        className: 'gt-path',
        // 未到达的目标用虚线连接
        dashArray: to.kind === 'target' && to.hop === null ? '4 6' : undefined,
      }).addTo(current),
    )
  }

  if (pathLines.length) {
    points.forEach((point, index) => {
      const color = point.kind === 'probe' ? 'var(--success)' : point.kind === 'target' ? 'var(--destructive)' : 'var(--info)'
      const size = point.kind === 'hop' ? 6 : 10
      pathMarkers.push(
        leaflet.marker([point.latitude!, point.longitude!], { icon: dotIcon(leaflet, color, size) })
          .addTo(current)
          .bindPopup(pointPopup(point, index, last), { className: 'gt-popup' }),
      )
    })
  }

  hasPath.value = pathLines.length > 0
  probeMarkers.forEach(marker => (hasPath.value ? marker.remove() : marker.addTo(current)))

  if (!hasPath.value) {
    fittedProbe = null
    if (row && !pathLocating.value) probeMarkers.get(row.index)?.openPopup()
  }
  else if (row && fittedProbe !== row.index) {
    fittedProbe = row.index
    fitLayers(leaflet, current, [...pathLines, ...pathMarkers])
  }
  syncFullscreen()
}

const renderProbes = async (el: HTMLElement) => {
  loadingMap.value = true
  mapError.value = ''
  try {
    const leaflet = await loadLeaflet()
    if (mapEl.value !== el) return
    if (!map || map.getContainer() !== el) {
      destroyMap()
      map = leaflet.map(el, { center: [20, 0], zoom: 2, minZoom: 1, maxZoom: 16 })
      tiles = addTiles(leaflet, map)
    }

    probeMarkers.forEach(marker => marker.remove())
    probeMarkers = new Map()
    for (const row of probes.value) {
      const marker = leaflet
        .marker([row.probe.latitude, row.probe.longitude], { icon: dotIcon(leaflet, TONES[row.tone].color, 10) })
        .bindPopup(probePopup(row), { className: 'gt-popup' })
      probeMarkers.set(row.index, marker)
    }

    const id = measurement.value?.id ?? ''
    if (fittedMeasurement !== id) {
      fittedMeasurement = id
      fitLayers(leaflet, map, [...probeMarkers.values()])
    }
    renderPath()
    setTimeout(() => map?.invalidateSize(), 100)
  }
  catch (err) {
    console.error('地图初始化失败:', err)
    mapError.value = `地图加载失败: ${err instanceof Error ? err.message : String(err)}`
  }
  finally {
    loadingMap.value = false
  }
}

// 探针状态变化时重绘探针点（轮询中每 600ms 替换一次结果，签名不变则不重绘）
const probeSignature = computed(() => `${measurement.value?.id}|${probes.value.map(row => row.tone).join()}`)

watch([mapEl, probeSignature], ([el]) => {
  if (!el) {
    destroyMap()
    return
  }
  if (probes.value.length) renderProbes(el)
}, { flush: 'post' })

const pathSignature = computed(() =>
  `${selectedIndex.value}|${pathLocating.value}|${currentPath.value.map(p => `${p.kind}${p.hop}${p.address}${p.latitude},${p.longitude}${p.rtt}${p.loss}`).join(';')}`,
)

watch(pathSignature, renderPath, { flush: 'post' })

const clearSelectedProbe = () => {
  if (isFullscreenMap.value) toggleFullscreenMap()
  isTableMinimized.value = false
  isTableCollapsed.value = false
  selectedIndex.value = null
}

// ---------- 全屏地图 ----------

const onFullscreenKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreenMap.value) toggleFullscreenMap()
}

const closeFullscreenMap = () => {
  fullscreenMap?.remove()
  fullscreenMap = null
  fullscreenTiles = null
  fullscreenLayer = null
  window.removeEventListener('keydown', onFullscreenKeydown)
}

const toggleFullscreenMap = async () => {
  isFullscreenMap.value = !isFullscreenMap.value
  if (!isFullscreenMap.value) {
    closeFullscreenMap()
    return
  }

  isTableCollapsed.value = false
  isTableMinimized.value = false
  windowPos.value = null
  window.addEventListener('keydown', onFullscreenKeydown)

  await nextTick()
  const el = fullscreenEl.value
  const leaflet = L
  if (!el || !leaflet || !isFullscreenMap.value) return

  fullscreenMap = leaflet.map(el, {
    center: map ? map.getCenter() : [20, 0],
    zoom: map ? map.getZoom() : 2,
    minZoom: 1,
    maxZoom: 16,
  })
  fullscreenTiles = addTiles(leaflet, fullscreenMap)
  syncFullscreen(true)
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
  loadLeaflet().catch(err => console.error('预加载 Leaflet 失败:', err))
})

onUnmounted(() => {
  stopDrag()
  closeFullscreenMap()
  destroyMap()
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
            <TableHead class="text-right">延迟</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="(point, index) in currentPath"
            :key="index"
            :class="point.kind === 'probe' ? 'bg-success/5' : point.kind === 'target' ? 'bg-muted/50' : ''"
          >
            <TableCell>
              <Badge v-if="point.kind === 'probe'" class="border-transparent bg-success/15 text-success">起点</Badge>
              <Badge v-else-if="point.hop === null" variant="outline">目标</Badge>
              <span v-else class="inline-flex items-center gap-2">
                <span class="font-mono tabular-nums text-muted-foreground">{{ point.hop }}</span>
                <Badge v-if="point.kind === 'target'" variant="outline">目标</Badge>
              </span>
            </TableCell>
            <TableCell>
              <span v-if="point.kind === 'probe'" class="text-muted-foreground">探针</span>
              <div v-else-if="point.address" class="flex flex-col">
                <span class="font-mono tabular-nums">{{ point.address }}</span>
                <span
                  v-if="point.hostname"
                  class="truncate font-mono text-xs text-muted-foreground"
                  :class="compact ? 'max-w-40' : 'max-w-64'"
                >{{ point.hostname }}</span>
              </div>
              <span v-else class="font-mono text-muted-foreground">*</span>
            </TableCell>
            <TableCell>
              <div v-if="point.asn || point.org" class="flex flex-col">
                <span class="font-mono tabular-nums">{{ point.asn }}</span>
                <span v-if="point.org" class="truncate text-muted-foreground" :class="compact ? 'max-w-40' : 'max-w-64'">{{ point.org }}</span>
              </div>
              <Skeleton v-else-if="point.locating" class="h-4 w-20" />
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell>
              <Skeleton v-if="point.locating" class="h-4 w-24" />
              <span v-else-if="point.private" class="text-muted-foreground">私有地址</span>
              <Badge v-else-if="point.anycast" variant="outline" title="任播地址，地理位置不代表实际节点，地图上按上一跳位置绘制">任播</Badge>
              <span v-else-if="point.country" class="inline-flex items-center gap-2">
                <span v-if="flagClass(point.country)" class="fi rounded-[2px]" :class="flagClass(point.country)" />
                {{ placeText(point.country, point.city) }}
              </span>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell
              class="text-right font-mono tabular-nums"
              :class="point.loss === null || point.loss === 0 ? 'text-muted-foreground' : 'text-warning'"
            >
              {{ lossText(point.loss) }}
            </TableCell>
            <TableCell class="text-right font-mono tabular-nums">
              {{ rttText(point.rtt) }}
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
          <span>跃点位置来自 ipinfo.io / ipwho.is</span>
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
                        <span class="truncate">{{ placeText(row.probe.country, row.probe.city) }}</span>
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
                  <template v-if="selectedRow && hasPath">{{ placeText(selectedRow.probe.country, selectedRow.probe.city) }} 路由路径</template>
                  <template v-else>探针分布地图</template>
                </span>
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <template v-if="hasPath">
                      <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-success" />起点</span>
                      <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-info" />跃点</span>
                      <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-destructive" />目标</span>
                    </template>
                    <template v-else>
                      <span v-for="(tone, key) in TONES" :key="key" class="flex items-center gap-1.5">
                        <span class="size-2 rounded-full" :class="tone.dot" />{{ tone.label }}
                      </span>
                    </template>
                  </div>
                  <div v-if="selectedRow && hasPath" class="flex gap-1">
                    <Button variant="ghost" size="xs" @click="toggleFullscreenMap">
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
                <div ref="mapEl" class="gt-map isolate size-full bg-muted" />
                <div
                  v-if="loadingMap || pathLocating"
                  class="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/60 text-sm text-muted-foreground"
                >
                  <Loader2 class="size-4 animate-spin" />
                  {{ pathLocating ? '正在获取跃点地理位置…' : '加载地图中…' }}
                </div>
              </div>
              <p
                v-if="!loadingMap && mapError"
                class="flex items-center gap-2 border-t px-4 py-3 text-sm text-destructive"
              >
                <TriangleAlert class="size-4" />{{ mapError }}
              </p>
            </Card>

            <!-- 选中探针的路由路径 -->
            <Card v-if="selectedRow" class="gap-0 py-0">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div class="flex min-w-0 flex-col">
                  <span class="font-medium">{{ placeText(selectedRow.probe.country, selectedRow.probe.city) }} 的路由路径</span>
                  <span class="truncate text-xs text-muted-foreground">
                    <span class="font-mono tabular-nums">AS{{ selectedRow.probe.asn }}</span> · {{ selectedRow.probe.network }}
                  </span>
                </div>
                <Badge class="border-transparent" :class="TONES[selectedRow.tone].badge">
                  {{ TONES[selectedRow.tone].label }}
                </Badge>
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
    <div v-if="isFullscreenMap" class="fixed inset-0 z-[60] overflow-hidden bg-background">
      <div ref="fullscreenEl" class="gt-map isolate size-full bg-muted" />
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

<style>
.gt-map.leaflet-container {
  font-family: inherit;
  background: var(--muted);
}

.gt-map .leaflet-bar {
  border: 1px solid var(--border);
  box-shadow: none;
}

.gt-map .leaflet-bar a {
  background: var(--background);
  color: var(--foreground);
  border-bottom-color: var(--border);
}

.gt-map .leaflet-bar a:hover {
  background: var(--muted);
}

.gt-map .leaflet-control-attribution {
  background: color-mix(in oklab, var(--background) 80%, transparent);
  color: var(--muted-foreground);
}

.gt-map .leaflet-control-attribution a {
  color: var(--foreground);
}

.gt-dot-icon {
  background: transparent;
  border: none;
}

.gt-dot {
  display: block;
  border-radius: 9999px;
  box-shadow: 0 0 0 2px var(--background);
}

.gt-path {
  stroke: var(--info);
}

.gt-popup .leaflet-popup-content-wrapper {
  background: var(--popover);
  color: var(--popover-foreground);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  padding: 0;
}

.gt-popup .leaflet-popup-content {
  margin: 0;
  width: auto !important;
  font-size: 0.75rem;
  line-height: 1.4;
}

.gt-popup .leaflet-popup-tip {
  background: var(--popover);
  border: 1px solid var(--border);
}

.gt-popup a.leaflet-popup-close-button {
  color: var(--muted-foreground);
}

.gt-popup-body {
  min-width: 180px;
  padding: 0.75rem;
}

.gt-popup-title {
  font-weight: 600;
  font-size: 0.875rem;
}

.gt-popup-addr {
  font-family: var(--font-mono, ui-monospace, monospace);
  color: var(--muted-foreground);
  margin-top: 0.125rem;
}

.gt-popup-sub {
  color: var(--muted-foreground);
  margin-top: 0.125rem;
}

.gt-popup-body dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.75rem;
  margin: 0.5rem 0 0;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.gt-popup-body dt {
  color: var(--muted-foreground);
}

.gt-popup-body dd {
  margin: 0;
  text-align: right;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}

.gt-popup-body .gt-ok {
  color: var(--success);
}

.gt-popup-body .gt-warn {
  color: var(--warning);
}

.gt-popup-body .gt-fail {
  color: var(--destructive);
}
</style>
