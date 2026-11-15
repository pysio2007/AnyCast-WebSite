<script setup lang="ts">
import type * as Leaflet from 'leaflet'
import type { GeoLookupResponse, GeoProviderResult, GeoRecord } from '#shared/types/xmsl'
import { AlertCircle, ArrowUpRight, Loader2, MapPinOff, RefreshCw, Search, TriangleAlert } from '@lucide/vue'
import { FetchError } from 'ofetch'
import 'leaflet/dist/leaflet.css'

interface OkRow { provider: string, name: string, record: GeoRecord }
interface FailedRow { provider: string, name: string, error: string }
interface Tally<T> { value: T, count: number, total: number }
interface LookupError { message: string, retryable: boolean, rateLimited: boolean }

const EXAMPLES = ['1.1.1.1', '8.8.8.8', '2606:4700::1111', '49.213.62.1']

// ---------- validation ----------

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

function isIPv6(s: string) {
  if (!s.includes(':') || !/^[\da-f:.]+$/i.test(s)) return false
  try {
    new URL(`http://[${s}]`)
    return true
  }
  catch {
    return false
  }
}

/** Normalized IP, or '' when the input is not a single IPv4/IPv6 address. */
function parseIp(raw: string) {
  const v = raw.trim().replace(/^\[(.*)\]$/, '$1')
  if (IPV4.test(v)) return v
  if (isIPv6(v)) return v.toLowerCase()
  return ''
}

// ---------- formatting ----------

const regionNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
  ? new Intl.DisplayNames(['zh-CN'], { type: 'region' })
  : null

/** Placeholder / non-country codes some databases return (e.g. IPIP.NET gives "UN" for Cloudflare). */
const PSEUDO_CODES = new Set(['UN', 'ZZ', 'XX', 'EU', 'AP', '--'])

function countryCode(r: GeoRecord) {
  const code = r.countryCode.trim().toUpperCase()
  return /^[A-Z]{2}$/.test(code) && !PSEUDO_CODES.has(code) ? code : ''
}

function countryLabel(code: string) {
  try {
    return regionNames?.of(code) || code
  }
  catch {
    return code
  }
}

function countryText(r: GeoRecord) {
  const code = countryCode(r)
  return code ? countryLabel(code) : r.country || '—'
}

function placeText(r: GeoRecord) {
  const parts: string[] = []
  for (const p of [r.region, r.city, r.district]) {
    const v = p.trim()
    if (v && !parts.includes(v) && v !== r.country) parts.push(v)
  }
  return parts.join(' · ')
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]!))
}

const fmtCoord = (r: GeoRecord) => `${r.lat!.toFixed(4)}, ${r.lon!.toFixed(4)}`
const hasCoords = (r: GeoRecord) => Number.isFinite(r.lat) && Number.isFinite(r.lon)

// ---------- state ----------

const route = useRoute()
const router = useRouter()
const routeQuery = () => (typeof route.query.q === 'string' ? route.query.q : '')

const input = ref(routeQuery())
/** Last rejected input; the hint shows until the user edits it. */
const rejected = ref('')
const showInvalid = computed(() => !!rejected.value && rejected.value === input.value.trim())

const target = ref('')
const data = shallowRef<GeoLookupResponse | null>(null)
const loading = ref(false)
const error = ref<LookupError | null>(null)
let runId = 0

function toLookupError(e: unknown): LookupError {
  if (e instanceof FetchError) {
    const status = e.statusCode ?? 0
    const serverMessage = e.data?.statusMessage
    const message = typeof serverMessage === 'string' && serverMessage
      ? serverMessage
      : status ? `定位服务返回错误（HTTP ${status}）` : '无法连接定位服务，请检查网络后重试'
    return { message, rateLimited: status === 429, retryable: status !== 429 && status !== 400 }
  }
  return { message: e instanceof Error ? e.message : String(e), rateLimited: false, retryable: true }
}

async function lookup(ip: string) {
  const id = ++runId
  target.value = ip
  data.value = null
  error.value = null
  loading.value = true
  try {
    const res = await $fetch<GeoLookupResponse>('/api/geo', { query: { ip } })
    if (id === runId) data.value = res
  }
  catch (e) {
    if (id === runId) error.value = toLookupError(e)
  }
  finally {
    if (id === runId) loading.value = false
  }
}

function submit(value = input.value) {
  const ip = parseIp(value)
  rejected.value = ip ? '' : value.trim()
  if (!ip) return
  input.value = ip
  if (routeQuery() === ip) lookup(ip)
  else router.replace({ query: { ...route.query, q: ip } })
}

function retry() {
  if (target.value) lookup(target.value)
}

onMounted(() => {
  watch(() => route.query.q, (q) => {
    const value = typeof q === 'string' ? q : ''
    input.value = value
    const ip = parseIp(value)
    rejected.value = ip || !value.trim() ? '' : value.trim()
    if (ip) {
      lookup(ip)
      return
    }
    // Invalid or cleared ?q=: drop any stale result instead of showing it under a different query.
    runId++
    target.value = ''
    data.value = null
    error.value = null
    loading.value = false
  }, { immediate: true })
})

// ---------- results ----------

const okRows = computed<OkRow[]>(() => (data.value?.results ?? [])
  .filter((r): r is GeoProviderResult & { record: GeoRecord } => r.ok && !!r.record)
  .map(r => ({ provider: r.provider, name: r.name || r.record.name, record: r.record })))

const failedRows = computed<FailedRow[]>(() => (data.value?.results ?? [])
  .filter(r => !r.ok || !r.record)
  .map(r => ({ provider: r.provider, name: r.name, error: r.error || '未返回数据' })))

/** Most frequent value (first seen wins ties); `total` is how many records had a value at all. */
function tally<T>(values: (T | null)[], keyOf: (v: T) => string): Tally<T> | null {
  const counts = new Map<string, { value: T, count: number }>()
  let total = 0
  for (const v of values) {
    if (v == null) continue
    total++
    const key = keyOf(v)
    const entry = counts.get(key)
    if (entry) entry.count++
    else counts.set(key, { value: v, count: 1 })
  }
  let best: { value: T, count: number } | null = null
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry
  }
  return best ? { ...best, total } : null
}

const consensus = computed(() => {
  const records = okRows.value.map(r => r.record)
  const country = tally(records.map(r => countryCode(r) || null), v => v)
  // Prefer cities inside the consensus country so a stray foreign city can't win on its own.
  const cityPool = records.filter(r => r.city.trim() && (!country || countryCode(r) === country.value))
  const city = tally(cityPool.map(r => r.city.trim()), v => v.toLowerCase())
  const asn = tally(records.map(r => r.asn), v => String(v))
  const asName = asn ? records.find(r => r.asn === asn.value && r.asName)?.asName ?? '' : ''
  return {
    country,
    city,
    asn,
    asName,
    total: records.length,
    anycast: okRows.value.filter(r => r.record.anycast).map(r => r.name),
    idc: okRows.value.filter(r => r.record.idc).map(r => r.name),
  }
})

function disagrees(r: GeoRecord) {
  const code = countryCode(r)
  const c = consensus.value.country
  return !!code && !!c && code !== c.value
}

// ---------- map ----------

const colorMode = useColorMode()
const mapEl = ref<HTMLElement>()
const loadingMap = ref(false)
const mapError = ref('')
let L: typeof Leaflet | null = null
let map: Leaflet.Map | null = null
let tileLayer: Leaflet.TileLayer | null = null
let markerLayer: Leaflet.LayerGroup | null = null

const tileUrl = computed(() =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${colorMode.value === 'dark' ? 'Dark' : 'Light'}_Gray_Base/MapServer/tile/{z}/{y}/{x}`)

const mappable = computed(() => okRows.value.filter(r => hasCoords(r.record)))

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

async function renderMap(rows: OkRow[]) {
  const m = await ensureMap()
  if (!m || !L || !markerLayer) return
  markerLayer.clearLayers()

  for (const { name, record: r } of rows) {
    const latlng: [number, number] = [r.lat!, r.lon!]
    const warn = disagrees(r)
    if (r.radiusKm && r.radiusKm > 0) {
      L.circle(latlng, { radius: r.radiusKm * 1000, className: `ip-geo-radius${warn ? ' is-warning' : ''}`, interactive: false })
        .addTo(markerLayer)
    }
    const icon = L.divIcon({
      className: `ip-geo-marker${warn ? ' is-warning' : ''}`,
      html: `<span class="ip-geo-marker-dot"></span><span class="ip-geo-marker-label">${escapeHtml(name)}</span>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })
    const place = [r.city, r.region, countryText(r)].map(s => s.trim()).filter((s, i, a) => s && s !== '—' && a.indexOf(s) === i)
    L.marker(latlng, { icon, title: name })
      .bindTooltip(`<div class="ip-geo-tip"><div class="ip-geo-tip-title">${escapeHtml(name)}</div>`
        + `<div>${escapeHtml(place.join(', ') || '未知位置')}</div>`
        + `<div class="ip-geo-tip-sub">${fmtCoord(r)}${r.radiusKm ? ` · ±${r.radiusKm} km` : ''}</div></div>`, {
        className: 'ip-geo-tooltip',
        direction: 'top',
        offset: [0, -8],
      })
      .addTo(markerLayer)
  }

  const bounds = L.latLngBounds(rows.map(r => [r.record.lat!, r.record.lon!] as [number, number]))
  // No animation: a zoom transition ending after the map is removed throws inside Leaflet.
  if (bounds.isValid()) m.fitBounds(bounds.pad(0.2), { maxZoom: 8, animate: false })
  else m.setView([20, 0], 2)
  m.invalidateSize()
}

watch([mappable, mapEl], () => {
  if (!mappable.value.length || !mapEl.value) return
  mapError.value = ''
  renderMap(mappable.value)
}, { flush: 'post' })

watch(tileUrl, url => tileLayer?.setUrl(url))

function destroyMap() {
  map?.remove()
  map = null
  tileLayer = null
  markerLayer = null
}

// The map card unmounts between lookups; drop the stale instance with it.
watch(mapEl, (el, old) => {
  if (old && el !== old) destroyMap()
})

onBeforeUnmount(destroyMap)
</script>

<template>
  <div>
    <PageSeo title="IP 定位对比" description="同时查询多家 IP 地理位置数据库，对比 DB-IP、MaxMind GeoIP2、IPinfo、IPIP.NET、纯真等对同一 IP 的国家、城市、ASN 与坐标定位结果。" />

    <PageHeader
      eyebrow="工具"
      title="IP 定位"
      description="同时查询多家地理位置数据库，对比各库对同一 IP 的定位结果"
    />

    <section class="page-container py-12">
      <Card>
        <CardContent class="flex flex-col gap-3">
          <Label for="ip-query">IP 地址</Label>
          <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submit()">
            <Input
              id="ip-query"
              v-model="input"
              placeholder="IPv4 或 IPv6 地址，例如 1.1.1.1"
              class="flex-1 font-mono"
              autocomplete="off"
              spellcheck="false"
              :aria-invalid="showInvalid || undefined"
            />
            <Button type="submit" :disabled="loading" class="sm:min-w-28">
              <Loader2 v-if="loading" data-icon="inline-start" class="animate-spin" />
              <Search v-else data-icon="inline-start" />
              查询
            </Button>
          </form>
          <p v-if="showInvalid" class="text-sm text-destructive">
            请输入有效的 IPv4 或 IPv6 地址（不支持域名与 CIDR）
          </p>
          <div class="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <span>示例</span>
            <Button
              v-for="ex in EXAMPLES"
              :key="ex"
              type="button"
              size="xs"
              variant="outline"
              class="font-mono"
              :disabled="loading"
              @click="submit(ex)"
            >
              {{ ex }}
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            数据由
            <a href="https://xmsl.dev" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">xmsl.Dev GeoAPI</a>
            提供 · 结果缓存 24 小时
          </p>
        </CardContent>
      </Card>
    </section>

    <section v-if="loading || error || data" class="page-container flex flex-col gap-6 pb-24">
      <template v-if="loading">
        <p class="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 class="size-4 animate-spin" />
          正在查询 <span class="font-mono text-foreground">{{ target }}</span> 的定位数据...
        </p>
        <div class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
          <StatCard v-for="label in ['国家 / 地区', '城市', 'ASN']" :key="label" :label="label" loading />
        </div>
        <Skeleton class="h-[380px] w-full rounded-xl" />
        <Skeleton class="h-72 w-full rounded-xl" />
      </template>

      <Alert v-else-if="error" variant="destructive">
        <AlertCircle />
        <AlertTitle>{{ error.rateLimited ? '查询过于频繁' : '查询失败' }}</AlertTitle>
        <AlertDescription>{{ error.message }}</AlertDescription>
        <AlertAction v-if="error.retryable">
          <Button size="xs" variant="outline" @click="retry">
            <RefreshCw data-icon="inline-start" />重试
          </Button>
        </AlertAction>
      </Alert>

      <template v-else-if="data">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div class="flex flex-col gap-2">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="font-mono text-2xl font-semibold tracking-tight break-all">{{ data.ip }}</h2>
              <Badge
                v-if="consensus.anycast.length"
                variant="outline"
                class="border-transparent bg-success/15 text-success"
                :title="`由 ${consensus.anycast.join('、')} 标记`"
              >
                Anycast
              </Badge>
              <Badge
                v-if="consensus.idc.length"
                variant="outline"
                class="border-transparent bg-muted text-foreground"
                :title="`由 ${consensus.idc.join('、')} 标记`"
              >
                IDC
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ consensus.total }} 个数据库返回结果<template v-if="failedRows.length">，{{ failedRows.length }} 个失败</template>
              <template v-if="data.fetchedAt"> · 获取于 <span class="font-mono tabular-nums">{{ new Date(data.fetchedAt).toLocaleString('zh-CN') }}</span></template>
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" as-child>
              <NuxtLink :to="{ path: '/whois', query: { q: data.ip } }">
                WHOIS <ArrowUpRight data-icon="inline-end" />
              </NuxtLink>
            </Button>
            <Button variant="outline" size="sm" as-child>
              <NuxtLink :to="{ path: '/bgp', query: { q: data.ip } }">
                BGP 路由查询 <ArrowUpRight data-icon="inline-end" />
              </NuxtLink>
            </Button>
          </div>
        </div>

        <p v-if="!okRows.length" class="text-sm text-muted-foreground">
          所有数据库均未返回该 IP 的定位数据。
        </p>

        <template v-else>
          <!-- 共识 -->
          <Card class="gap-0 overflow-hidden py-0">
            <div class="border-b px-5 py-3">
              <h3 class="text-sm font-medium">共识</h3>
            </div>
            <div class="grid gap-px bg-border sm:grid-cols-3">
              <div class="flex flex-col gap-1 bg-background p-6">
                <p class="text-sm text-muted-foreground">国家 / 地区</p>
                <p v-if="consensus.country" class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                  <span :class="`fi fi-${consensus.country.value.toLowerCase()} shrink-0 rounded-[2px] text-xl`" />
                  <span>{{ countryLabel(consensus.country.value) }}</span>
                  <span class="font-mono text-base font-normal text-muted-foreground">{{ consensus.country.value }}</span>
                </p>
                <p v-else class="font-mono text-2xl font-semibold">—</p>
                <p class="text-xs text-muted-foreground">
                  <template v-if="consensus.country">
                    <span class="font-mono tabular-nums">{{ consensus.country.count }}/{{ consensus.total }}</span> 库一致
                  </template>
                  <template v-else>无数据库给出国家代码</template>
                </p>
              </div>
              <div class="flex flex-col gap-1 bg-background p-6">
                <p class="text-sm text-muted-foreground">城市</p>
                <p class="truncate text-2xl font-semibold tracking-tight" :title="consensus.city?.value">
                  {{ consensus.city?.value ?? '—' }}
                </p>
                <p class="text-xs text-muted-foreground">
                  <template v-if="consensus.city">
                    <span class="font-mono tabular-nums">{{ consensus.city.count }}/{{ consensus.city.total }}</span> 个含城市数据的库一致
                  </template>
                  <template v-else>无数据库给出城市</template>
                </p>
              </div>
              <div class="flex min-w-0 flex-col gap-1 bg-background p-6">
                <p class="text-sm text-muted-foreground">ASN</p>
                <p v-if="consensus.asn" class="font-mono text-2xl font-semibold tracking-tight tabular-nums">
                  <NuxtLink
                    :to="{ path: '/bgp', query: { q: `AS${consensus.asn.value}` } }"
                    class="underline-offset-4 hover:underline"
                  >
                    AS{{ consensus.asn.value }}
                  </NuxtLink>
                </p>
                <p v-else class="font-mono text-2xl font-semibold">—</p>
                <p class="truncate text-xs text-muted-foreground" :title="consensus.asName || undefined">
                  <template v-if="consensus.asn">
                    <span v-if="consensus.asName">{{ consensus.asName }} · </span>
                    <span class="font-mono tabular-nums">{{ consensus.asn.count }}/{{ consensus.asn.total }}</span> 个含 ASN 的库一致
                  </template>
                  <template v-else>无数据库给出 ASN</template>
                </p>
              </div>
            </div>
            <div v-if="consensus.anycast.length || consensus.idc.length" class="flex flex-col gap-2 border-t px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
              <span v-if="consensus.anycast.length" class="flex items-center gap-2">
                <Badge variant="outline" class="border-transparent bg-success/15 text-success">Anycast</Badge>
                由 {{ consensus.anycast.join('、') }} 标记
              </span>
              <span v-if="consensus.idc.length" class="flex items-center gap-2">
                <Badge variant="outline" class="border-transparent bg-muted text-foreground">IDC</Badge>
                由 {{ consensus.idc.join('、') }} 标记
              </span>
            </div>
          </Card>

          <!-- 地图 -->
          <Card class="gap-0 overflow-hidden py-0">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
              <h3 class="text-sm font-medium">坐标分布</h3>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span class="font-mono tabular-nums">{{ mappable.length }}/{{ okRows.length }}</span>
                <span>个库提供坐标 · 圆圈为精度半径</span>
              </div>
            </div>
            <div v-if="mappable.length" class="relative isolate h-[380px]">
              <div ref="mapEl" class="ip-geo-map size-full" />
              <div
                v-if="loadingMap"
                class="absolute inset-0 z-[1001] flex items-center justify-center gap-2 bg-background/70 text-sm text-muted-foreground"
              >
                <Loader2 class="size-4 animate-spin" />加载地图中...
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 px-5 py-12 text-sm text-muted-foreground">
              <MapPinOff class="size-5" />
              没有数据库返回该 IP 的坐标
            </div>
            <p v-if="mapError" class="border-t px-5 py-3 text-sm text-destructive">{{ mapError }}</p>
          </Card>

          <!-- 对比表 -->
          <Card class="gap-0 overflow-hidden py-0">
            <div class="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="pl-5">数据库</TableHead>
                    <TableHead>国家</TableHead>
                    <TableHead>地区 / 城市</TableHead>
                    <TableHead>ASN / ISP</TableHead>
                    <TableHead>坐标</TableHead>
                    <TableHead class="text-right">精度</TableHead>
                    <TableHead class="pr-5 text-right">更新</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="row in okRows" :key="row.provider">
                    <TableCell class="pl-5">
                      <div class="flex items-center gap-2 whitespace-nowrap">
                        <span class="font-medium">{{ row.name }}</span>
                        <span v-if="disagrees(row.record)" title="与共识国家不一致" class="inline-flex text-warning">
                          <TriangleAlert class="size-3.5 shrink-0" aria-label="与共识国家不一致" />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        class="flex items-center gap-2 whitespace-nowrap"
                        :class="disagrees(row.record) ? 'text-warning' : countryCode(row.record) ? '' : 'text-muted-foreground'"
                      >
                        <span v-if="countryCode(row.record)" :class="`fi fi-${countryCode(row.record).toLowerCase()} shrink-0 rounded-[2px]`" />
                        <span class="max-w-48 truncate" :title="row.record.country || undefined">{{ countryText(row.record) }}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span v-if="placeText(row.record)" class="block max-w-56 truncate whitespace-nowrap" :title="placeText(row.record)">{{ placeText(row.record) }}</span>
                      <span v-else class="text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell>
                      <div class="flex max-w-64 items-center gap-2 whitespace-nowrap">
                        <NuxtLink
                          v-if="row.record.asn"
                          :to="{ path: '/bgp', query: { q: `AS${row.record.asn}` } }"
                          class="font-mono tabular-nums underline-offset-4 hover:underline"
                        >
                          AS{{ row.record.asn }}
                        </NuxtLink>
                        <span
                          v-if="row.record.isp || row.record.asName"
                          class="truncate text-muted-foreground"
                          :title="row.record.isp || row.record.asName || undefined"
                        >{{ row.record.isp || row.record.asName }}</span>
                        <span v-if="!row.record.asn && !row.record.isp && !row.record.asName" class="text-muted-foreground">—</span>
                      </div>
                    </TableCell>
                    <TableCell class="font-mono text-xs whitespace-nowrap tabular-nums" :class="hasCoords(row.record) ? '' : 'text-muted-foreground'">
                      {{ hasCoords(row.record) ? fmtCoord(row.record) : '—' }}
                    </TableCell>
                    <TableCell class="text-right font-mono whitespace-nowrap tabular-nums" :class="row.record.radiusKm ? '' : 'text-muted-foreground'">
                      {{ row.record.radiusKm ? `${row.record.radiusKm} km` : '—' }}
                    </TableCell>
                    <TableCell class="pr-5 text-right font-mono text-xs whitespace-nowrap tabular-nums text-muted-foreground">
                      {{ row.record.lastUpdated || '—' }}
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="row in failedRows" :key="row.provider" class="text-muted-foreground hover:bg-transparent">
                    <TableCell class="pl-5 whitespace-nowrap">{{ row.name }}</TableCell>
                    <TableCell colspan="6" class="pr-5 text-xs">
                      <span class="flex items-center gap-1.5">
                        <AlertCircle class="size-3.5 shrink-0" />
                        查询失败：{{ row.error }}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
          <p class="-mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <TriangleAlert class="size-3.5 text-warning" />
            表示该库的国家与多数库不一致。精度为数据库给出的定位半径。
          </p>
        </template>
      </template>
    </section>
  </div>
</template>

<style>
.ip-geo-map.leaflet-container {
  background: var(--muted);
  font-family: inherit;
}

.ip-geo-map .leaflet-control-zoom {
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 0.8);
  overflow: hidden;
  box-shadow: none;
}

.ip-geo-map .leaflet-control-zoom a {
  background: var(--background);
  color: var(--foreground);
  border-color: var(--border);
}

.ip-geo-map .leaflet-control-zoom a:hover {
  background: var(--muted);
}

.ip-geo-map .leaflet-control-attribution {
  background: color-mix(in oklch, var(--background) 80%, transparent);
  color: var(--muted-foreground);
}

.ip-geo-map .leaflet-control-attribution a {
  color: var(--foreground);
}

.ip-geo-marker {
  --marker-color: var(--foreground);
  background: transparent;
  border: none;
}

.ip-geo-marker.is-warning {
  --marker-color: var(--warning);
}

.ip-geo-marker-dot {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: var(--marker-color);
  box-shadow: 0 0 0 2px var(--background);
}

.ip-geo-marker-label {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  padding: 1px 6px;
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 0.6);
  background: color-mix(in oklch, var(--background) 90%, transparent);
  color: var(--foreground);
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
}

.ip-geo-radius {
  stroke: var(--foreground);
  stroke-opacity: 0.35;
  stroke-width: 1px;
  fill: var(--foreground);
  fill-opacity: 0.06;
}

.ip-geo-radius.is-warning {
  stroke: var(--warning);
  fill: var(--warning);
}

.ip-geo-tooltip.leaflet-tooltip {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 1.2);
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  font-size: 12px;
}

.ip-geo-tooltip.leaflet-tooltip-top::before {
  border-top-color: var(--border);
}

.ip-geo-tip {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ip-geo-tip-title {
  font-size: 13px;
  font-weight: 600;
}

.ip-geo-tip-sub {
  color: var(--muted-foreground);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}
</style>
