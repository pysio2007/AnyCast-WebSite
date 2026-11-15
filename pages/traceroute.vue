<script setup lang="ts">
import type { HopPlace } from '~/composables/useTraceAnalysis'
import type { TraceMapOrigin } from '~/components/TraceMap.vue'
import { AlertCircle, ArrowUpRight, ChevronDown, ChevronUp, Copy, Link2, Loader2, Play } from '@lucide/vue'
import { toast } from 'vue-sonner'

type Protocol = 'ICMP' | 'TCP' | 'UDP'

interface HopRow {
  index: number
  address: string | null
  hostname: string | null
  asns: number[]
  loss: number
  sent: number
  recv: number
  last: number | null
  avg: number | null
  best: number | null
  worst: number | null
  stdev: number | null
  /** Cross-database placement from xmsl.Dev GeoAPI, matched by TTL. */
  place: HopPlace | null
}

const DEFAULT_PORT: Record<Exclude<Protocol, 'ICMP'>, string> = { TCP: '80', UDP: '53' }
const PACKET_OPTIONS = ['3', '5', '10']

const route = useRoute()
const router = useRouter()
const { measurement, state, error, run, load } = useGlobalping<MtrResult>()

const target = ref('')
const probeLocation = ref('Hong Kong')
const protocol = ref<Protocol>('ICMP')
const port = ref('')
const packets = ref('5')
const ipVersion = ref<'4' | '6'>('4')
const showRaw = ref(false)

const isIpLiteral = (value: string) => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) || value.includes(':')
const targetIsHostname = computed(() => !!target.value.trim() && !isIpLiteral(target.value.trim()))
const portValid = computed(() => {
  if (protocol.value === 'ICMP') return true
  const n = Number(port.value)
  return Number.isInteger(n) && n >= 1 && n <= 65535
})
const busy = computed(() => state.value === 'creating' || state.value === 'running')
const canSubmit = computed(() => !!target.value.trim() && portValid.value && !busy.value)

function setProtocol(v: unknown) {
  if (v !== 'ICMP' && v !== 'TCP' && v !== 'UDP') return
  protocol.value = v
  if (v !== 'ICMP') port.value = DEFAULT_PORT[v]
}

function setIpVersion(v: unknown) {
  if (v === '4' || v === '6') ipVersion.value = v
}

let lastAction: (() => unknown) | null = null

async function submit() {
  if (!canSubmit.value) return
  const t = target.value.trim()
  const measurementOptions: Record<string, unknown> = { protocol: protocol.value, packets: Number(packets.value) }
  if (protocol.value !== 'ICMP') measurementOptions.port = Number(port.value)
  if (!isIpLiteral(t)) measurementOptions.ipVersion = Number(ipVersion.value)
  lastAction = submit
  showRaw.value = false
  const { id: _, ...query } = route.query
  router.replace({ query })
  await run({
    type: 'mtr',
    target: t,
    locations: [{ magic: probeLocation.value.trim() || 'world', limit: 1 }],
    measurementOptions,
  })
}

function retry() {
  lastAction?.()
}

// Reflect the running measurement in the URL so it can be shared, and fill the form from shared results.
watch(() => measurement.value?.id, (id) => {
  if (id && route.query.id !== id) router.replace({ query: { ...route.query, id } })
})
watch(measurement, (m) => {
  if (m && !target.value) target.value = m.target
})

onMounted(() => {
  const id = route.query.id
  if (typeof id === 'string' && id) {
    lastAction = () => load(id)
    load(id)
  }
})

const probe = computed(() => measurement.value?.results[0]?.probe ?? null)
const result = computed(() => measurement.value?.results[0]?.result ?? null)
const probeFailed = computed(() => result.value?.status === 'failed' || result.value?.status === 'offline')

// Geolocate hops once the probe has finished (results cached per raw output).
const analysisText = computed(() => {
  const r = result.value
  return state.value === 'finished' && r?.status === 'finished' && r.hops.some(hop => hop.resolvedAddress) ? r.rawOutput : null
})
const { data: analysis, pending: analysisPending, error: analysisError, retry: retryAnalysis } = useTraceAnalysis(analysisText)
const selectedTtl = ref<number | null>(null)

const mapOrigin = computed<TraceMapOrigin | null>(() => {
  const p = probe.value
  return p ? { lat: p.latitude, lon: p.longitude, label: `${placeLabel(p.country, p.city)} · AS${p.asn} ${p.network}` } : null
})

const hops = computed<HopRow[]>(() => {
  const analysed = new Map((analysis.value?.route.hops ?? []).map(hop => [hop.ttl, hop]))
  return (result.value?.hops ?? []).map((hop, i) => {
    const rtts = hop.timings.map(t => t.rtt).filter((r): r is number => typeof r === 'number')
    return {
      index: i + 1,
      address: hop.resolvedAddress,
      hostname: hop.resolvedHostname && hop.resolvedHostname !== hop.resolvedAddress ? hop.resolvedHostname : null,
      asns: hop.asn ?? [],
      loss: hop.stats?.loss ?? 100,
      sent: hop.stats?.total ?? hop.timings.length,
      recv: hop.stats?.rcv ?? rtts.length,
      last: rtts.at(-1) ?? null,
      avg: hop.stats?.avg ?? null,
      best: hop.stats?.min ?? null,
      worst: hop.stats?.max ?? null,
      stdev: hop.stats?.stDev ?? null,
      place: hopPlace(analysed.get(i + 1)),
    }
  })
})
const timeoutCount = computed(() => hops.value.filter(h => !h.address).length)

function selectHop(hop: HopRow) {
  if (hop.place) selectedTtl.value = hop.index
}
watch(analysisText, () => {
  selectedTtl.value = null
})

// AS names: one batched RIPEstat `as-names` call per finished measurement, for ASNs not seen yet.
const asNames = ref<Record<number, string>>({})
const asNamesLoading = ref(false)

async function resolveAsNames() {
  const asns = new Set<number>(hops.value.flatMap(h => h.asns))
  if (probe.value?.asn) asns.add(probe.value.asn)
  const missing = [...asns].filter(asn => !(asn in asNames.value))
  if (!missing.length) return
  asNamesLoading.value = true
  try {
    const res = await $fetch<{ data: { names: Record<string, string> } }>('https://stat.ripe.net/data/as-names/data.json', {
      query: { resource: missing.map(asn => `AS${asn}`).join(','), sourceapp: 'anycast-ink' },
    })
    const next = { ...asNames.value }
    for (const asn of missing) next[asn] = res.data.names[String(asn)] ?? ''
    asNames.value = next
  }
  catch (e) {
    console.error('RIPEstat as-names 查询失败:', e)
  }
  finally {
    asNamesLoading.value = false
  }
}

watch(state, (s) => {
  if (s === 'finished') resolveAsNames()
})

const ms = (v: number | null) => (v === null ? '—' : v.toFixed(1))
const lossClass = (loss: number) => (loss === 0 ? 'text-success' : loss < 50 ? 'text-warning' : 'text-destructive')

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`已复制${label}`)
  }
  catch {
    toast.error('复制失败，请手动复制')
  }
}

const copyRaw = () => result.value && copyText(result.value.rawOutput, '原始输出')
const copyShareLink = () => copyText(window.location.href, '分享链接')
</script>

<template>
  <div>
    <PageSeo title="路由追踪" description="从全球任意位置的 Globalping 探针发起 MTR 路由追踪，逐跳显示丢包、延迟与 ASN。" />
    <PageHeader eyebrow="工具" title="路由追踪" description="从全球任意位置的探针发起 MTR 路由追踪" />

    <section class="page-container flex flex-col gap-3 py-12">
      <Card>
        <CardContent>
          <form class="flex flex-col gap-6" @submit.prevent="submit">
            <div class="flex flex-col gap-4 md:flex-row md:items-end">
              <div class="flex flex-1 flex-col gap-2">
                <Label for="tr-target">目标地址</Label>
                <Input
                  id="tr-target"
                  v-model="target"
                  placeholder="1.1.1.1 / 2606:4700::1111 / example.com"
                  autocomplete="off"
                  spellcheck="false"
                  class="font-mono"
                />
              </div>
              <Button type="submit" :disabled="!canSubmit" class="md:w-28">
                <Loader2 v-if="busy" data-icon="inline-start" class="animate-spin" />
                <Play v-else data-icon="inline-start" />
                追踪
              </Button>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <Label for="tr-location">探针位置</Label>
                <GlobalpingLocation id="tr-location" v-model="probeLocation" />
              </div>

              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <Label>协议</Label>
                  <div class="flex flex-wrap items-center gap-3">
                    <ToggleGroup type="single" variant="outline" :model-value="protocol" @update:model-value="setProtocol">
                      <ToggleGroupItem value="ICMP" class="px-3">ICMP</ToggleGroupItem>
                      <ToggleGroupItem value="TCP" class="px-3">TCP</ToggleGroupItem>
                      <ToggleGroupItem value="UDP" class="px-3">UDP</ToggleGroupItem>
                    </ToggleGroup>
                    <div v-if="protocol !== 'ICMP'" class="flex items-center gap-2">
                      <Label for="tr-port" class="text-muted-foreground">端口</Label>
                      <Input
                        id="tr-port"
                        v-model="port"
                        inputmode="numeric"
                        class="w-24 font-mono tabular-nums"
                        :aria-invalid="!portValid"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-6">
                  <div class="flex flex-col gap-2">
                    <Label for="tr-packets">每跳数据包</Label>
                    <Select v-model="packets">
                      <SelectTrigger id="tr-packets" class="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="n in PACKET_OPTIONS" :key="n" :value="n">{{ n }} 个</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label>IP 版本</Label>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      :model-value="ipVersion"
                      :disabled="!targetIsHostname"
                      @update:model-value="setIpVersion"
                    >
                      <ToggleGroupItem value="4" class="px-3">IPv4</ToggleGroupItem>
                      <ToggleGroupItem value="6" class="px-3">IPv6</ToggleGroupItem>
                    </ToggleGroup>
                    <p v-if="!targetIsHostname" class="text-xs text-muted-foreground">仅对域名目标生效</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <GlobalpingQuota />
    </section>

    <section v-if="state !== 'idle'" class="page-container flex flex-col gap-6 pb-24">
      <Alert v-if="state === 'error'" variant="destructive">
        <AlertCircle />
        <AlertTitle>追踪失败</AlertTitle>
        <AlertDescription class="flex flex-col items-start gap-3">
          <span class="break-all">{{ error }}</span>
          <Button size="sm" variant="outline" :disabled="busy" @click="retry">重试</Button>
        </AlertDescription>
      </Alert>

      <template v-else>
        <div class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
          <div class="flex flex-col gap-1.5 bg-background p-5">
            <span class="text-sm text-muted-foreground">目标</span>
            <Skeleton v-if="!measurement" class="h-6 w-48" />
            <div v-else class="flex flex-col gap-0.5">
              <span class="font-mono text-lg break-all">{{ measurement.target }}</span>
              <span
                v-if="result?.resolvedAddress && result.resolvedAddress !== measurement.target"
                class="font-mono text-xs break-all text-muted-foreground tabular-nums"
              >{{ result.resolvedAddress }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1.5 bg-background p-5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm text-muted-foreground">探针</span>
              <Badge v-if="probeFailed" class="border-transparent bg-destructive/15 text-destructive">失败</Badge>
              <Badge v-else-if="busy" variant="outline" class="gap-1.5">
                <Loader2 class="animate-spin" />
                进行中
              </Badge>
              <Badge v-else class="border-transparent bg-success/15 text-success">已完成</Badge>
            </div>
            <Skeleton v-if="!probe" class="h-6 w-56" />
            <div v-else class="flex flex-col gap-0.5">
              <span class="flex items-center gap-2 text-lg">
                <span :class="`fi fi-${probe.country.toLowerCase()} shrink-0 rounded-[2px]`" />
                {{ probe.city }}, {{ countryName(probe.country) }}
              </span>
              <span class="flex min-w-0 flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span>{{ probe.network }}</span>
                <a
                  :href="`https://bgp.tools/as/${probe.asn}`"
                  target="_blank"
                  rel="noopener"
                  class="font-mono tabular-nums underline-offset-4 hover:text-foreground hover:underline"
                >AS{{ probe.asn }}</a>
              </span>
            </div>
          </div>
        </div>

        <Alert v-if="probeFailed" variant="destructive">
          <AlertCircle />
          <AlertTitle>探针执行失败</AlertTitle>
          <AlertDescription class="flex flex-col items-start gap-3">
            <span class="font-mono text-xs break-all whitespace-pre-wrap">{{ result?.rawOutput || '探针未返回任何输出' }}</span>
            <Button size="sm" variant="outline" :disabled="!canSubmit" @click="submit">重试</Button>
          </AlertDescription>
        </Alert>

        <Card v-else class="gap-0 py-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-12 pl-5">#</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead>ASN</TableHead>
                  <TableHead>位置</TableHead>
                  <TableHead class="text-right">丢包</TableHead>
                  <TableHead class="text-right">发送/接收</TableHead>
                  <TableHead class="text-right">最近</TableHead>
                  <TableHead class="text-right">平均</TableHead>
                  <TableHead class="text-right">最佳</TableHead>
                  <TableHead class="text-right">最差</TableHead>
                  <TableHead class="pr-5 text-right">标准差</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="!hops.length && busy">
                  <TableRow v-for="i in 6" :key="i">
                    <TableCell class="pl-5"><Skeleton class="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-24" /></TableCell>
                    <TableCell v-for="j in 6" :key="j"><Skeleton class="ml-auto h-5 w-10" /></TableCell>
                    <TableCell class="pr-5"><Skeleton class="ml-auto h-5 w-10" /></TableCell>
                  </TableRow>
                </template>
                <TableEmpty v-else-if="!hops.length" :colspan="11">
                  <span class="text-muted-foreground">探针未返回任何跳</span>
                </TableEmpty>
                <template v-for="hop in hops" :key="hop.index">
                  <TableRow v-if="!hop.address" class="text-muted-foreground">
                    <TableCell class="pl-5 font-mono tabular-nums">{{ hop.index }}</TableCell>
                    <TableCell class="font-mono">*</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell class="text-right font-mono tabular-nums">{{ hop.loss.toFixed(1) }}%</TableCell>
                    <TableCell class="text-right font-mono tabular-nums">{{ hop.sent }}/{{ hop.recv }}</TableCell>
                    <TableCell colspan="5" class="pr-5 text-right">无响应</TableCell>
                  </TableRow>
                  <TableRow
                    v-else
                    :class="[hop.place ? 'cursor-pointer' : '', selectedTtl === hop.index ? 'bg-muted' : '']"
                    @click="selectHop(hop)"
                  >
                    <TableCell class="pl-5 font-mono tabular-nums">{{ hop.index }}</TableCell>
                    <TableCell class="max-w-80">
                      <div class="font-mono tabular-nums">{{ hop.address }}</div>
                      <div v-if="hop.hostname" class="truncate font-mono text-xs text-muted-foreground" :title="hop.hostname">
                        {{ hop.hostname }}
                      </div>
                    </TableCell>
                    <TableCell class="max-w-64">
                      <span v-if="!hop.asns.length" class="text-muted-foreground">—</span>
                      <div v-for="asn in hop.asns" :key="asn" class="flex min-w-0 flex-col">
                        <a
                          :href="`https://bgp.tools/as/${asn}`"
                          target="_blank"
                          rel="noopener"
                          class="inline-flex w-fit items-center gap-0.5 font-mono tabular-nums underline-offset-4 hover:underline"
                        >AS{{ asn }}<ArrowUpRight class="size-3 text-muted-foreground" /></a>
                        <Skeleton v-if="asNamesLoading && !(asn in asNames)" class="mt-1 h-3 w-28" />
                        <span v-else-if="asNames[asn]" class="truncate text-xs text-muted-foreground" :title="asNames[asn]">{{ asNames[asn] }}</span>
                      </div>
                    </TableCell>
                    <TableCell class="max-w-64">
                      <Skeleton v-if="analysisPending" class="h-5 w-24" />
                      <span v-else-if="hop.place" class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="inline-flex items-center gap-2 whitespace-nowrap">
                          <span v-if="hop.place.countryCode" :class="`fi fi-${hop.place.countryCode.toLowerCase()} shrink-0 rounded-[2px]`" />
                          {{ placeLabel(hop.place.countryCode, hop.place.city) || '未知' }}
                        </span>
                        <Badge
                          v-if="hop.place.confidence && CONFIDENCE[hop.place.confidence]"
                          :class="CONFIDENCE[hop.place.confidence]!.badge"
                          :title="hop.place.source ? `定位来源 ${hop.place.source}` : undefined"
                        >{{ CONFIDENCE[hop.place.confidence]!.label }}</Badge>
                      </span>
                      <span v-else class="text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell class="text-right font-mono tabular-nums" :class="lossClass(hop.loss)">{{ hop.loss.toFixed(1) }}%</TableCell>
                    <TableCell class="text-right font-mono text-muted-foreground tabular-nums">{{ hop.sent }}/{{ hop.recv }}</TableCell>
                    <TableCell class="text-right font-mono tabular-nums">{{ ms(hop.last) }}</TableCell>
                    <TableCell class="text-right font-mono tabular-nums">{{ ms(hop.avg) }}</TableCell>
                    <TableCell class="text-right font-mono tabular-nums">{{ ms(hop.best) }}</TableCell>
                    <TableCell class="text-right font-mono tabular-nums">{{ ms(hop.worst) }}</TableCell>
                    <TableCell class="pr-5 text-right font-mono tabular-nums">{{ ms(hop.stdev) }}</TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3">
            <span class="text-sm text-muted-foreground">
              <template v-if="hops.length">
                共 <span class="font-mono tabular-nums">{{ hops.length }}</span> 跳<template v-if="timeoutCount">，<span class="font-mono tabular-nums">{{ timeoutCount }}</span> 跳无响应</template> · 延迟单位 ms
              </template>
            </span>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" :disabled="!result?.rawOutput" @click="showRaw = !showRaw">
                <ChevronUp v-if="showRaw" data-icon="inline-start" />
                <ChevronDown v-else data-icon="inline-start" />
                原始输出
              </Button>
              <Button size="sm" variant="ghost" :disabled="!result?.rawOutput" @click="copyRaw">
                <Copy data-icon="inline-start" />
                复制
              </Button>
              <Button size="sm" variant="ghost" :disabled="!measurement" @click="copyShareLink">
                <Link2 data-icon="inline-start" />
                分享链接
              </Button>
            </div>
          </div>
          <div v-if="showRaw && result?.rawOutput" class="max-h-[480px] overflow-auto border-t bg-muted/40">
            <pre class="p-5 font-mono text-xs leading-relaxed">{{ result.rawOutput }}</pre>
          </div>
        </Card>

        <Card v-if="analysisText" class="gap-0 py-0">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b px-5 py-3">
            <span class="font-medium">路由地图</span>
            <span v-if="analysis" class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>总距离 <span class="font-mono text-foreground tabular-nums">{{ Math.round(analysis.route.summary.distanceKm).toLocaleString('zh-CN') }} km</span></span>
              <span v-if="analysis.route.summary.countries.length" class="inline-flex items-center gap-1">
                途经
                <span
                  v-for="code in new Set(analysis.route.summary.countries)"
                  :key="code"
                  :class="`fi fi-${code.toLowerCase()} rounded-[2px]`"
                  :title="countryName(code)"
                />
              </span>
            </span>
          </div>
          <Skeleton v-if="analysisPending" class="h-[360px] w-full rounded-none sm:h-[420px]" />
          <div v-else-if="analysisError" class="p-5">
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>跃点定位失败</AlertTitle>
              <AlertDescription class="flex flex-col items-start gap-3">
                <span class="break-all">{{ analysisError }}</span>
                <Button size="sm" variant="outline" @click="retryAnalysis">重试</Button>
              </AlertDescription>
            </Alert>
          </div>
          <TraceMap
            v-else-if="analysis"
            class="h-[360px] sm:h-[420px]"
            :route="analysis.route"
            :origin="mapOrigin"
            :selected-ttl="selectedTtl"
            @select-ttl="selectedTtl = $event"
          />
        </Card>

        <p class="text-xs text-muted-foreground">
          由 Globalping 探针执行 MTR；ASN 名称来自 RIPEstat；跨库定位由 <a href="https://xmsl.dev" target="_blank" rel="noopener" class="text-foreground underline-offset-4 hover:underline">xmsl.Dev GeoAPI</a> 提供。分享链接中的测量结果由 Globalping 保留约 7 天。
        </p>
      </template>
    </section>
  </div>
</template>
