<script lang="ts">
export interface TraceMapOrigin {
  lat: number
  lon: number
  label: string
}

/** Plain dot shown while no route is drawn (e.g. probe overview); clicking emits `select-marker`. */
export interface TraceMapMarker {
  id: number
  lat: number
  lon: number
  /** Any CSS colour, e.g. `var(--success)`. */
  color: string
  title: string
  lines: string[]
}
</script>

<script setup lang="ts">
import type { TraceLocation, TraceRoute } from '#shared/types/xmsl'
import type * as Leaflet from 'leaflet'
import { Loader2, TriangleAlert } from '@lucide/vue'
import { useResizeObserver } from '@vueuse/core'
import 'leaflet/dist/leaflet.css'

interface MarkerGroup {
  locations: TraceLocation[]
  marker: Leaflet.Marker
}

const props = defineProps<{
  route: TraceRoute | null
  /** Extra start point (the probe) drawn when the analysis has no origin location of its own. */
  origin?: TraceMapOrigin | null
  selectedTtl?: number | null
  markers?: TraceMapMarker[]
}>()

const emit = defineEmits<{
  'select-ttl': [ttl: number]
  'select-marker': [id: number]
}>()

const MAX_POPUP_IPS = 6
const CONFIDENCE_LABELS: Record<string, string> = { high: '高', medium: '中', low: '低' }

const colorMode = useColorMode()
const el = ref<HTMLElement | null>(null)
const loading = ref(true)
const mapError = ref('')

let L: typeof Leaflet | null = null
let map: Leaflet.Map | null = null
let tiles: Leaflet.TileLayer | null = null
let layer: Leaflet.FeatureGroup | null = null
let groups: MarkerGroup[] = []
let fittedRoute: TraceRoute | null = null
let fittedMarkers = ''
let disposed = false

const originLocation = computed(() =>
  props.route && !props.route.locations.some(loc => loc.kind === 'origin') ? props.origin ?? null : null,
)
const originKey = computed(() => (originLocation.value ? `${originLocation.value.lat},${originLocation.value.lon},${originLocation.value.label}` : ''))
// Overview markers only matter while no route is drawn; ignoring them otherwise avoids redraws during polling.
const markersKey = computed(() => (props.route ? '' : JSON.stringify(props.markers ?? [])))
const unlocated = computed(() => !!props.route && !props.route.locations.length)

const tileUrl = () =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${colorMode.value === 'dark' ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]!)

const confidenceClass = (confidence?: string) => `tm-${confidence && confidence in CONFIDENCE_LABELS ? confidence : 'low'}`

const inferred = (loc: TraceLocation) => loc.confidence === 'low' || !!loc.relocated

/** 1,2,3,5 → "1–3, 5" */
const ttlText = (ttls: number[]) => {
  const parts: string[] = []
  let start = ttls[0]
  ttls.forEach((ttl, i) => {
    const next = ttls[i + 1]
    if (next === ttl + 1) return
    parts.push(start === ttl ? String(ttl) : `${start}–${ttl}`)
    start = next
  })
  return parts.join(', ')
}

const locationPopup = (loc: TraceLocation) => {
  const ips = loc.ips.slice(0, MAX_POPUP_IPS).map(ip => `<li>${escapeHtml(ip)}</li>`).join('')
  const more = loc.ips.length > MAX_POPUP_IPS ? `<li class="tm-popup-muted">另有 ${loc.ips.length - MAX_POPUP_IPS} 个地址</li>` : ''
  const conf = loc.confidence ?? 'low'
  return `
    <section>
      <div class="tm-popup-title">#${loc.index + 1} · ${escapeHtml(loc.label)}</div>
      <dl>
        <dt>跃点</dt><dd>${escapeHtml(ttlText(loc.ttls))}</dd>
        ${loc.rttMs != null ? `<dt>延迟</dt><dd>${Number(loc.rttMs.toFixed(1))} ms</dd>` : ''}
        <dt>置信度</dt><dd class="${confidenceClass(conf)}-text">${escapeHtml(CONFIDENCE_LABELS[conf] ?? conf)}</dd>
      </dl>
      ${ips ? `<ul>${ips}${more}</ul>` : ''}
      ${loc.relocated ? '<div class="tm-popup-muted">数据库位置与延迟不符，已校正</div>' : ''}
    </section>`
}

const numberIcon = (leaflet: typeof Leaflet, text: string, cls: string) => {
  const width = Math.max(22, 10 + text.length * 7)
  return leaflet.divIcon({
    className: 'tm-icon',
    html: `<span class="tm-marker ${cls}" style="width:${width}px">${escapeHtml(text)}</span>`,
    iconSize: [width, 22],
    iconAnchor: [width / 2, 11],
    popupAnchor: [0, -11],
  })
}

const dotIcon = (leaflet: typeof Leaflet, color: string) =>
  leaflet.divIcon({
    className: 'tm-icon',
    html: `<span class="tm-dot" style="background:${color}"></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  })

const groupIcon = (leaflet: typeof Leaflet, group: MarkerGroup) => {
  const selected = props.selectedTtl != null && group.locations.some(loc => loc.ttls.includes(props.selectedTtl!))
  const text = group.locations.map(loc => loc.index + 1).join(',')
  return numberIcon(leaflet, text, `${confidenceClass(group.locations[0]!.confidence)}${selected ? ' tm-selected' : ''}`)
}

const addLine = (leaflet: typeof Leaflet, target: Leaflet.FeatureGroup, from: [number, number], to: [number, number], dashed: boolean, tooltip: string) => {
  const line = leaflet.polyline([from, to], {
    weight: dashed ? 1.5 : 2,
    dashArray: dashed ? '4 6' : undefined,
    className: dashed ? 'tm-line tm-line-inferred' : 'tm-line',
  }).addTo(target)
  if (tooltip) line.bindTooltip(tooltip, { sticky: true, className: 'tm-tooltip' })
}

const drawRoute = (leaflet: typeof Leaflet, target: Leaflet.FeatureGroup, route: TraceRoute) => {
  const locations = [...route.locations].sort((a, b) => a.index - b.index)
  const origin = originLocation.value

  // Unwrap longitudes along the path so legs crossing the antimeridian take the short way round.
  const lons = new Map<number, number>()
  let previous = origin?.lon ?? null
  for (const loc of locations) {
    let lon = loc.lon
    if (previous !== null) {
      while (lon - previous > 180) lon -= 360
      while (lon - previous < -180) lon += 360
    }
    lons.set(loc.index, lon)
    previous = lon
  }
  const point = (loc: TraceLocation): [number, number] => [loc.lat, lons.get(loc.index) ?? loc.lon]
  const byIndex = new Map(locations.map(loc => [loc.index, loc]))

  const first = locations[0]
  if (origin && first) addLine(leaflet, target, [origin.lat, origin.lon], point(first), inferred(first), '')
  for (const segment of route.segments) {
    const from = byIndex.get(segment.from)
    const to = byIndex.get(segment.to)
    if (!from || !to) continue
    const rtt = segment.rttDeltaMs != null ? ` · ${segment.rttDeltaMs >= 0 ? '+' : ''}${Number(segment.rttDeltaMs.toFixed(1))} ms` : ''
    addLine(leaflet, target, point(from), point(to), segment.gap || inferred(from) || inferred(to), `${Math.round(segment.distanceKm)} km${rtt}`)
  }

  if (origin) {
    leaflet.marker([origin.lat, origin.lon], { icon: numberIcon(leaflet, '起', 'tm-origin') })
      .bindPopup(`<div class="tm-popup-body"><div class="tm-popup-title">起点</div><div class="tm-popup-muted">${escapeHtml(origin.label)}</div></div>`, { className: 'tm-popup' })
      .addTo(target)
  }

  // Locations sharing coordinates (path revisits a city) collapse into one marker.
  const byPoint = new Map<string, TraceLocation[]>()
  for (const loc of locations) {
    const [lat, lon] = point(loc)
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`
    byPoint.set(key, [...(byPoint.get(key) ?? []), loc])
  }
  for (const group of byPoint.values()) {
    const entry: MarkerGroup = { locations: group, marker: leaflet.marker(point(group[0]!), { zIndexOffset: 100 }) }
    entry.marker
      .setIcon(groupIcon(leaflet, entry))
      .bindPopup(`<div class="tm-popup-body">${group.map(locationPopup).join('')}</div>`, { className: 'tm-popup' })
      .on('click', () => {
        const ttl = group[0]!.ttls[0]
        if (ttl !== undefined && !group.some(loc => loc.ttls.includes(props.selectedTtl ?? -1))) emit('select-ttl', ttl)
      })
      .addTo(target)
    groups.push(entry)
  }
}

const drawMarkers = (leaflet: typeof Leaflet, target: Leaflet.FeatureGroup) => {
  for (const item of props.markers ?? []) {
    const lines = item.lines.map(line => `<div class="tm-popup-muted">${escapeHtml(line)}</div>`).join('')
    leaflet.marker([item.lat, item.lon], { icon: dotIcon(leaflet, item.color) })
      .bindPopup(`<div class="tm-popup-body"><div class="tm-popup-title">${escapeHtml(item.title)}</div>${lines}</div>`, { className: 'tm-popup' })
      .on('click', () => emit('select-marker', item.id))
      .addTo(target)
  }
}

const render = () => {
  const leaflet = L
  const current = map
  if (!leaflet || !current) return
  layer?.remove()
  groups = []
  layer = leaflet.featureGroup().addTo(current)

  let fit = false
  if (props.route) {
    drawRoute(leaflet, layer, props.route)
    fit = fittedRoute !== props.route
    fittedRoute = props.route
    fittedMarkers = ''
  }
  else {
    drawMarkers(leaflet, layer)
    fit = fittedMarkers !== markersKey.value
    fittedMarkers = markersKey.value
    fittedRoute = null
  }

  const bounds = layer.getBounds()
  if (fit && bounds.isValid()) current.fitBounds(bounds.pad(0.15), { maxZoom: 8 })
}

const syncSelection = () => {
  const leaflet = L
  const current = map
  if (!leaflet || !current) return
  for (const group of groups) group.marker.setIcon(groupIcon(leaflet, group))
  const ttl = props.selectedTtl
  if (ttl == null) return
  const selected = groups.find(group => group.locations.some(loc => loc.ttls.includes(ttl)))
  if (!selected) return
  if (!current.getBounds().contains(selected.marker.getLatLng())) current.panTo(selected.marker.getLatLng())
  selected.marker.openPopup()
}

watch([() => props.route, originKey, markersKey], render)
watch(() => props.selectedTtl, syncSelection)
watch(() => colorMode.value, () => tiles?.setUrl(tileUrl()))
useResizeObserver(el, () => map?.invalidateSize())

onMounted(async () => {
  try {
    L ??= (await import('leaflet')).default
    if (disposed || !el.value) return
    map = L.map(el.value, { center: [20, 0], zoom: 2, minZoom: 1, maxZoom: 16 })
    tiles = L.tileLayer(tileUrl(), {
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
      maxZoom: 16,
    }).addTo(map)
    render()
    syncSelection()
  }
  catch (err) {
    console.error('地图初始化失败:', err)
    mapError.value = `地图加载失败: ${err instanceof Error ? err.message : String(err)}`
  }
  finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  disposed = true
  map?.remove()
  map = null
  tiles = null
  layer = null
  groups = []
})
</script>

<template>
  <div class="relative isolate overflow-hidden bg-muted">
    <div ref="el" class="tm-map absolute inset-0 z-0" />

    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/60 text-sm text-muted-foreground"
    >
      <Loader2 class="size-4 animate-spin" />
      加载地图中…
    </div>

    <p
      v-if="mapError"
      class="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b bg-background/90 px-4 py-3 text-sm text-destructive"
    >
      <TriangleAlert class="size-4 shrink-0" />{{ mapError }}
    </p>

    <p
      v-else-if="unlocated"
      class="pointer-events-none absolute inset-x-0 top-3 z-10 mx-auto w-fit rounded-lg border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground"
    >
      没有可定位的公网跃点
    </p>

    <div
      v-if="route && !mapError"
      class="pointer-events-none absolute right-2 bottom-6 z-10 flex flex-col gap-1.5 rounded-lg border bg-background/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm max-sm:bottom-10 max-sm:left-2 max-sm:flex-row max-sm:flex-wrap max-sm:gap-x-3 max-sm:gap-y-1 max-sm:px-2 max-sm:py-1.5 max-sm:text-[11px]"
    >
      <span v-if="originLocation" class="flex items-center gap-2">
        <span class="tm-marker tm-origin tm-legend">起</span>起点
      </span>
      <span class="flex items-center gap-2"><span class="tm-marker tm-high tm-legend" />高置信</span>
      <span class="flex items-center gap-2"><span class="tm-marker tm-medium tm-legend" />中置信</span>
      <span class="flex items-center gap-2"><span class="tm-marker tm-low tm-legend" />低置信</span>
      <span class="flex items-center gap-2"><span class="tm-legend-line" />实测路径</span>
      <span class="flex items-center gap-2"><span class="tm-legend-line tm-legend-line-inferred" />推测 / 缺口</span>
    </div>
  </div>
</template>

<style>
.tm-map.leaflet-container {
  font-family: inherit;
  background: var(--muted);
}

.tm-map .leaflet-bar {
  border: 1px solid var(--border);
  box-shadow: none;
}

.tm-map .leaflet-bar a {
  background: var(--background);
  color: var(--foreground);
  border-bottom-color: var(--border);
}

.tm-map .leaflet-bar a:hover {
  background: var(--muted);
}

.tm-map .leaflet-control-attribution {
  background: color-mix(in oklab, var(--background) 80%, transparent);
  color: var(--muted-foreground);
}

.tm-map .leaflet-control-attribution a {
  color: var(--foreground);
}

.tm-icon {
  background: transparent;
  border: none;
}

.tm-dot {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  box-shadow: 0 0 0 2px var(--background);
}

.tm-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  min-width: 22px;
  padding: 0 4px;
  border-radius: 9999px;
  border: 2px solid var(--foreground);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 0 0 2px var(--background);
  transition: box-shadow 150ms;
}

.tm-marker.tm-high {
  background: var(--foreground);
  color: var(--background);
}

.tm-marker.tm-medium {
  background: var(--background);
  color: var(--foreground);
}

.tm-marker.tm-low {
  background: var(--background);
  color: var(--muted-foreground);
  border-color: var(--muted-foreground);
  border-style: dashed;
}

.tm-marker.tm-origin {
  background: var(--success);
  border-color: var(--success);
  color: var(--background);
}

.tm-marker.tm-selected {
  box-shadow: 0 0 0 2px var(--background), 0 0 0 5px var(--ring);
}

.tm-marker.tm-legend {
  width: 14px;
  height: 14px;
  min-width: 14px;
  padding: 0;
  border-width: 1.5px;
  font-size: 8px;
  box-shadow: none;
}

.tm-legend-line {
  display: block;
  width: 14px;
  border-top: 2px solid var(--foreground);
  opacity: 0.75;
}

.tm-legend-line-inferred {
  border-top: 1.5px dashed var(--muted-foreground);
}

.tm-line {
  stroke: var(--foreground);
  stroke-opacity: 0.7;
}

.tm-line-inferred {
  stroke: var(--muted-foreground);
  stroke-opacity: 0.9;
}

.tm-tooltip {
  background: var(--popover);
  color: var(--popover-foreground);
  border: 1px solid var(--border);
  box-shadow: none;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}

.tm-tooltip::before {
  display: none;
}

.tm-popup .leaflet-popup-content-wrapper {
  background: var(--popover);
  color: var(--popover-foreground);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  padding: 0;
}

.tm-popup .leaflet-popup-content {
  margin: 0;
  width: auto !important;
  font-size: 0.75rem;
  line-height: 1.4;
}

.tm-popup .leaflet-popup-tip {
  background: var(--popover);
  border: 1px solid var(--border);
}

.tm-popup a.leaflet-popup-close-button {
  color: var(--muted-foreground);
}

.tm-popup-body {
  min-width: 200px;
  max-height: 320px;
  overflow-y: auto;
  padding: 0.75rem;
}

.tm-popup-body section + section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.tm-popup-title {
  font-weight: 600;
  font-size: 0.875rem;
  padding-right: 1rem;
}

.tm-popup-muted {
  color: var(--muted-foreground);
  margin-top: 0.25rem;
}

.tm-popup-body dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.75rem;
  margin: 0.5rem 0 0;
}

.tm-popup-body dt {
  color: var(--muted-foreground);
}

.tm-popup-body dd {
  margin: 0;
  text-align: right;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}

.tm-popup-body ul {
  margin: 0.5rem 0 0;
  padding: 0.5rem 0 0;
  list-style: none;
  border-top: 1px solid var(--border);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}

.tm-popup-body ul .tm-popup-muted {
  font-family: inherit;
}

.tm-high-text {
  color: var(--success);
}

.tm-medium-text {
  color: var(--warning);
}

.tm-low-text {
  color: var(--muted-foreground);
}
</style>
