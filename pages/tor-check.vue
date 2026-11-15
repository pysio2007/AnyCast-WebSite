<script setup lang="ts">
import { AlertCircle, CheckCircle2, Loader2, Search, TriangleAlert } from '@lucide/vue'

interface Relay {
  nickname: string
  fingerprint: string
  flags?: string[]
  version?: string
  version_status?: string
  recommended_version?: boolean
  observed_bandwidth?: number
  advertised_bandwidth?: number
  bandwidth_rate?: number
  or_addresses?: string[]
  country?: string
  country_name?: string
  as?: string
  as_name?: string
  contact?: string
  exit_probability?: number
  guard_probability?: number
  middle_probability?: number
  consensus_weight?: number
  consensus_weight_fraction?: number
  first_seen?: string
  last_seen?: string
  last_restarted?: string
  running?: boolean
  exit_policy_summary?: { accept?: string[], reject?: string[] }
}

const searchQuery = ref('')
const isLoading = ref(false)
const error = ref('')
const relays = ref<Relay[] | null>(null)

const formatBandwidth = (bytes?: number) => {
  if (!bytes) return '0 B/s'
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GiB/s`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB/s`
}

const formatPercentage = (value?: number) => (value ? `${(value * 100).toFixed(4)}%` : '0%')

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  // onionoo dates are UTC "YYYY-MM-DD hh:mm:ss"
  const date = new Date(`${dateStr.replace(' ', 'T')}Z`)
  if (Number.isNaN(date.getTime())) return dateStr
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(date)
}

const getNodeType = (flags?: string[]) => {
  if (!flags) return '未知'
  const types: string[] = []
  if (flags.includes('Exit')) types.push('出口')
  if (flags.includes('Guard')) types.push('守卫')
  if (!types.length) types.push('中继')
  return types.join('、')
}

const searchNode = async () => {
  const q = searchQuery.value.trim()
  if (!q) {
    error.value = '请输入IP地址'
    return
  }
  isLoading.value = true
  error.value = ''
  relays.value = null
  try {
    const url = `https://onionoo.torproject.org/details?search=${encodeURIComponent(q)}`
    let response: Response | null = null
    try {
      response = await fetch(url)
    }
    catch {
      response = null
    }
    if (!response?.ok) response = await fetch(`https://cdn.akaere.online/${url}`)
    if (!response.ok) throw new Error('API请求失败')
    const data = await response.json()
    relays.value = data.relays ?? []
  }
  catch (e) {
    error.value = '查询失败，请稍后重试'
    console.error('查询失败:', e)
  }
  finally {
    isLoading.value = false
  }
}

const getFlagIconUrl = (flag: string) => `https://metrics.torproject.org/images/flags/${flag.toLowerCase()}.png`

const handleFlagIconError = (event: Event, flag: string) => {
  const img = event.target as HTMLImageElement
  if (!img) return
  if (!img.src.includes('cdn.akaere.online')) img.src = `https://cdn.akaere.online/${getFlagIconUrl(flag)}`
  else img.style.display = 'none'
}

const infoRows = (r: Relay) => [
  { k: '观察带宽', v: formatBandwidth(r.observed_bandwidth), mono: true },
  { k: '广播带宽', v: formatBandwidth(r.advertised_bandwidth), mono: true },
  { k: '带宽限制', v: formatBandwidth(r.bandwidth_rate), mono: true },
  { k: 'AS', v: r.as ? `${r.as}${r.as_name ? ` (${r.as_name})` : ''}` : '—', mono: false },
  { k: '联系方式', v: r.contact || '—', mono: false },
]

const statusRows = (r: Relay) => [
  { k: '出口概率', v: formatPercentage(r.exit_probability) },
  { k: '守卫概率', v: formatPercentage(r.guard_probability) },
  { k: '中继概率', v: formatPercentage(r.middle_probability) },
  { k: '共识权重', v: String(r.consensus_weight ?? '—') },
  { k: '权重占比', v: formatPercentage(r.consensus_weight_fraction) },
  { k: '首次发现', v: formatDate(r.first_seen) },
  { k: '最后更新', v: formatDate(r.last_seen) },
  { k: '最后重启', v: formatDate(r.last_restarted) },
]
</script>

<template>
  <div>
    <PageSeo title="Tor 节点查询" description="查询 IP 地址是否为 Tor 网络节点，并显示详细的节点信息，包括带宽、地理位置、运行状态等。" />
    <PageHeader eyebrow="工具" title="Tor 节点查询" description="通过 Tor Onionoo 查询 IP 地址、昵称或指纹对应的 Tor 中继。" />

    <section class="page-container py-12">
      <Card>
        <CardContent>
          <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="searchNode">
            <div class="flex flex-1 flex-col gap-2">
              <Label for="tor-query">查询对象</Label>
              <Input id="tor-query" v-model="searchQuery" placeholder="输入IP地址..." class="font-mono" />
            </div>
            <Button type="submit" :disabled="isLoading">
              <Loader2 v-if="isLoading" data-icon="inline-start" class="animate-spin" />
              <Search v-else data-icon="inline-start" />
              {{ isLoading ? '查询中...' : '查询' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>

    <section v-if="isLoading || error || relays" class="page-container flex flex-col gap-6 pb-16">
      <template v-if="isLoading">
        <Skeleton class="h-20 w-full rounded-xl" />
        <Skeleton class="h-80 w-full rounded-xl" />
      </template>

      <Alert v-else-if="error" variant="destructive">
        <AlertCircle />
        <AlertTitle>查询失败</AlertTitle>
        <AlertDescription class="flex flex-col items-start gap-3">
          {{ error }}
          <Button v-if="searchQuery.trim()" size="sm" variant="outline" @click="searchNode">重试</Button>
        </AlertDescription>
      </Alert>

      <template v-else-if="relays">
        <Alert v-if="relays.length" class="border-success/30 bg-success/10">
          <CheckCircle2 class="text-success" />
          <AlertTitle class="text-success">这是一个Tor节点</AlertTitle>
          <AlertDescription>
            找到 {{ relays.length }} 个匹配的中继{{ relays.length === 1 ? `，这是一个${getNodeType(relays[0]?.flags)}节点` : '' }}
          </AlertDescription>
        </Alert>
        <Alert v-else class="border-warning/30 bg-warning/10">
          <TriangleAlert class="text-warning" />
          <AlertTitle class="text-warning">这不是一个Tor节点</AlertTitle>
          <AlertDescription>该IP地址未在Tor网络中注册</AlertDescription>
        </Alert>

        <Card v-for="r in relays" :key="r.fingerprint">
          <CardHeader>
            <CardTitle class="flex flex-wrap items-center gap-2 text-xl">
              <span v-if="r.country" :class="`fi fi-${r.country.toLowerCase()} rounded-[2px]`" />
              {{ r.nickname }}
              <Badge variant="secondary">{{ getNodeType(r.flags) }}</Badge>
            </CardTitle>
            <CardDescription class="flex flex-col gap-1">
              <span class="font-mono text-xs break-all">{{ r.fingerprint }}</span>
              <span v-if="r.version" class="flex flex-wrap items-center gap-2 text-xs">
                版本 <span class="font-mono">{{ r.version }}</span>
                <Badge
                  v-if="r.version_status"
                  :class="r.recommended_version ? 'border-transparent bg-success/15 text-success' : 'border-transparent bg-warning/15 text-warning'"
                >
                  {{ r.version_status }}
                </Badge>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-6">
            <div v-if="r.flags?.length" class="flex flex-wrap gap-2">
              <Badge v-for="flag in r.flags" :key="flag" variant="outline" class="gap-1.5">
                <img :src="getFlagIconUrl(flag)" :alt="flag" class="size-3.5 object-contain" @error="handleFlagIconError($event, flag)">
                {{ flag }}
              </Badge>
            </div>

            <div class="grid gap-8 md:grid-cols-2">
              <div class="flex flex-col gap-3">
                <h3 class="text-sm font-medium">节点信息</h3>
                <dl class="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt class="text-muted-foreground">位置</dt>
                  <dd>{{ r.country_name || '—' }}</dd>
                  <dt class="text-muted-foreground">OR 地址</dt>
                  <dd class="flex min-w-0 flex-col font-mono tabular-nums break-all">
                    <span v-for="a in r.or_addresses ?? []" :key="a">{{ a }}</span>
                    <span v-if="!r.or_addresses?.length">—</span>
                  </dd>
                  <template v-for="row in infoRows(r)" :key="row.k">
                    <dt class="text-muted-foreground">{{ row.k }}</dt>
                    <dd class="min-w-0 break-all" :class="row.mono && 'font-mono tabular-nums'">{{ row.v }}</dd>
                  </template>
                </dl>
              </div>
              <div class="flex flex-col gap-3">
                <h3 class="text-sm font-medium">运行状态</h3>
                <dl class="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
                  <template v-for="row in statusRows(r)" :key="row.k">
                    <dt class="text-muted-foreground">{{ row.k }}</dt>
                    <dd class="font-mono tabular-nums">{{ row.v }}</dd>
                  </template>
                </dl>
              </div>
            </div>

            <div v-if="r.exit_policy_summary" class="flex flex-col gap-3 border-t pt-6">
              <h3 class="text-sm font-medium">出口策略</h3>
              <div v-if="r.exit_policy_summary.accept?.length" class="flex flex-col gap-2">
                <span class="text-xs text-muted-foreground">允许端口</span>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="p in r.exit_policy_summary.accept" :key="p" class="border-transparent bg-success/15 font-mono text-success">{{ p }}</Badge>
                </div>
              </div>
              <div v-if="r.exit_policy_summary.reject?.length" class="flex flex-col gap-2">
                <span class="text-xs text-muted-foreground">拒绝端口</span>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="p in r.exit_policy_summary.reject" :key="p" class="border-transparent bg-destructive/10 font-mono text-destructive">{{ p }}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </section>
  </div>
</template>
