<script setup lang="ts">
import { ArrowLeft, ArrowUpRight, Check, Globe, Mail, RefreshCw } from '@lucide/vue'
import { PEERINGDB_NET_ID, PRIMARY_ASN } from '@/lib/site'

interface NetIxLan {
  ix_id: number
  name: string
  ipaddr4: string | null
  ipaddr6: string | null
  speed: number
  is_rs_peer: boolean
  bfd_support: boolean
  operational: boolean
}
interface Ix { id: number, name: string, name_long: string, city: string, country: string, website: string, net_count: number }

/** Exchanges where we also offer downstream connectivity (not tracked by PeeringDB). */
const DOWNSTREAM_IX_IDS = new Set([2084, 823, 4059, 3792, 3352])

const netixlans = usePeeringDb<NetIxLan>('netixlan', { net_id: PEERINGDB_NET_ID })
const ixIds = computed(() => [...new Set((netixlans.data.value ?? []).map(l => l.ix_id))].sort((a, b) => a - b).join(','))

// Second request for exchange metadata; waits for the netixlan list so it never queries every IX.
const ixs = useAsyncData(
  'ix:details',
  async () => {
    const ids = ixIds.value
    if (!ids) return { ids, list: [] as Ix[] }
    const res = await $fetch<{ data: Ix[] }>('https://www.peeringdb.com/api/ix', {
      query: { id__in: ids, fields: 'id,name,name_long,city,country,website,net_count' },
    })
    return { ids, list: res.data }
  },
  { server: false, lazy: true, watch: [ixIds] },
)

const isPending = (s: { status: Ref<string> }) => s.status.value === 'pending' || s.status.value === 'idle'
const loading = computed(() => isPending(netixlans) || (ixs.status.value !== 'error' && ixs.data.value?.ids !== ixIds.value))

const rows = computed(() => {
  const byId = new Map((ixs.data.value?.list ?? []).map(ix => [ix.id, ix]))
  return (netixlans.data.value ?? [])
    .map(lan => ({ ...lan, ix: byId.get(lan.ix_id), downstream: DOWNSTREAM_IX_IDS.has(lan.ix_id) }))
    .sort((a, b) => Number(b.operational) - Number(a.operational) || (a.ix?.name ?? a.name).localeCompare(b.ix?.name ?? b.name))
})

const stats = computed(() => {
  const lans = netixlans.data.value ?? []
  return {
    exchanges: new Set(lans.map(l => l.ix_id)).size,
    operational: lans.filter(l => l.operational).length,
    v4: lans.filter(l => l.ipaddr4).length,
    capacity: lans.filter(l => l.operational).reduce((sum, l) => sum + l.speed, 0),
  }
})

function formatSpeed(mbps: number) {
  if (mbps >= 1_000_000) return `${+(mbps / 1_000_000).toFixed(1)} Tbps`
  if (mbps >= 1000) return `${+(mbps / 1000).toFixed(1)} Gbps`
  return `${mbps} Mbps`
}

const policies = [
  { title: '开放政策', text: '我们支持所有地区和所有人的 Peer 和下游链接，无门槛，仅限非商业用途。' },
  { title: 'BFD 支持', text: '我们支持 BFD 快速检测，以提高网络稳定性和故障转移速度。' },
  { title: '路由服务器支持', text: '我们接受通过路由服务器建立的会话，简化配置过程。' },
  { title: 'RPKI 验证', text: '我们使用 RPKI 验证所有路由，确保路由安全。' },
]

const requiredInfo = ['您的 ASN', '您的 IPv6 地址', '您所在的 IX 交换点', '技术联系人信息']
</script>

<template>
  <div>
    <PageSeo title="IX 互联" description="AS213605 接入的互联网交换中心、对等地址与互联政策，数据实时来自 PeeringDB。" />

    <PageHeader eyebrow="网络" title="AS213605 IX 互联政策">
      <template #description>
        PYSIO-NetWork（<a href="https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=AS213605&type=aut-num" target="_blank" rel="noopener" class="font-mono text-foreground underline-offset-4 hover:underline">AS{{ PRIMARY_ASN }}</a>）目前在以下 IX 交换点提供对等互联服务。
      </template>
      <template #actions>
        <Button size="sm" as-child>
          <a href="mailto:team@pysio.online"><Mail data-icon="inline-start" /> 申请 Peer</a>
        </Button>
        <Button variant="outline" size="sm" as-child>
          <a :href="`https://www.peeringdb.com/net/${PEERINGDB_NET_ID}`" target="_blank" rel="noopener">PeeringDB <ArrowUpRight data-icon="inline-end" /></a>
        </Button>
      </template>
    </PageHeader>

    <section class="page-container flex flex-col gap-4 py-12">
      <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        <StatCard label="交换点" :value="netixlans.data.value ? stats.exchanges : null" :loading="isPending(netixlans)" hint="PeeringDB 登记" />
        <StatCard label="运行中会话" :value="netixlans.data.value ? stats.operational : null" :loading="isPending(netixlans)" hint="operational" />
        <StatCard label="IPv4 接入" :value="netixlans.data.value ? stats.v4 : null" :loading="isPending(netixlans)" hint="其余仅 IPv6" />
        <StatCard label="端口总速率" :value="netixlans.data.value ? formatSpeed(stats.capacity) : null" :loading="isPending(netixlans)" hint="运行中端口合计" />
      </div>
      <p class="text-xs text-muted-foreground">
        数据实时来自
        <a :href="`https://www.peeringdb.com/net/${PEERINGDB_NET_ID}`" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">PeeringDB</a>
      </p>
    </section>

    <section class="page-container flex flex-col gap-8 pb-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">支持的 IX 交换点</h2>
        <p class="text-muted-foreground">
          我们支持所有地区和所有人的 Peer 和下游链接，无门槛，仅限非商业用途。如果您对下游连接感兴趣，请查看我们的
          <NuxtLink to="/downstream" class="font-medium text-foreground underline underline-offset-4">下游政策</NuxtLink>。
        </p>
      </div>

      <Alert v-if="netixlans.status.value === 'error'" variant="destructive">
        <AlertTitle>无法加载 PeeringDB 数据</AlertTitle>
        <AlertDescription>
          <p>PeeringDB 请求失败（匿名访问存在频率限制），请稍后重试。</p>
          <Button variant="outline" size="sm" class="mt-2" @click="netixlans.refresh()">
            <RefreshCw data-icon="inline-start" /> 重试
          </Button>
        </AlertDescription>
      </Alert>

      <div v-else class="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/40 hover:bg-muted/40">
              <TableHead class="pl-4">交换点</TableHead>
              <TableHead>城市</TableHead>
              <TableHead>IPv4</TableHead>
              <TableHead>IPv6</TableHead>
              <TableHead class="text-right">速率</TableHead>
              <TableHead>属性</TableHead>
              <TableHead class="text-right">成员</TableHead>
              <TableHead class="pr-4 text-right">链接</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading">
              <TableRow v-for="i in 6" :key="i">
                <TableCell v-for="j in 8" :key="j" :class="j === 1 ? 'pl-4' : j === 8 ? 'pr-4' : ''">
                  <Skeleton class="h-4" :class="j === 1 || j === 4 ? 'w-40' : 'w-16'" />
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="!rows.length">
              <TableCell colspan="8" class="py-8 text-center text-muted-foreground">PeeringDB 暂无登记的交换点</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="row in rows" :key="`${row.ix_id}-${row.ipaddr6 ?? row.ipaddr4}`" :class="row.operational ? '' : 'text-muted-foreground'">
                <TableCell class="pl-4">
                  <div class="flex items-center gap-2">
                    <span v-if="row.ix?.country" :class="`fi fi-${row.ix.country.toLowerCase()} shrink-0 rounded-[2px]`" />
                    <div class="flex min-w-0 flex-col">
                      <span class="font-medium">{{ row.ix?.name ?? row.name }}</span>
                      <span v-if="row.ix?.name_long && row.ix.name_long !== row.ix.name" class="max-w-64 truncate text-xs text-muted-foreground">{{ row.ix.name_long }}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="text-muted-foreground">{{ row.ix?.city || '—' }}</TableCell>
                <TableCell class="font-mono text-xs tabular-nums">
                  <span v-if="row.ipaddr4">{{ row.ipaddr4 }}</span>
                  <span v-else class="text-muted-foreground">—</span>
                </TableCell>
                <TableCell class="font-mono text-xs tabular-nums">
                  <span v-if="row.ipaddr6">{{ row.ipaddr6 }}</span>
                  <span v-else class="text-muted-foreground">—</span>
                </TableCell>
                <TableCell class="text-right font-mono text-xs tabular-nums">{{ formatSpeed(row.speed) }}</TableCell>
                <TableCell>
                  <div class="flex flex-wrap gap-1.5">
                    <Badge v-if="!row.operational" class="bg-warning/15 text-warning border-transparent">未运行</Badge>
                    <Badge v-if="row.is_rs_peer" variant="outline">RS Peer</Badge>
                    <Badge v-if="row.bfd_support" variant="outline">BFD</Badge>
                    <Badge v-if="row.downstream" class="bg-success/15 text-success border-transparent">下游支持</Badge>
                  </div>
                </TableCell>
                <TableCell class="text-right font-mono text-xs tabular-nums">{{ row.ix?.net_count ?? '—' }}</TableCell>
                <TableCell class="pr-4">
                  <div class="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button variant="ghost" size="icon-xs" as-child>
                          <a :href="`https://www.peeringdb.com/ix/${row.ix_id}`" target="_blank" rel="noopener" :aria-label="`PeeringDB IX #${row.ix_id}`">
                            <ArrowUpRight />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>PeeringDB: IX #{{ row.ix_id }}</TooltipContent>
                    </Tooltip>
                    <Tooltip v-if="row.ix?.website">
                      <TooltipTrigger as-child>
                        <Button variant="ghost" size="icon-xs" as-child>
                          <a :href="row.ix.website" target="_blank" rel="noopener" aria-label="官网">
                            <Globe />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>官网</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          所有会话 ASN 均为 <span class="font-mono">AS{{ PRIMARY_ASN }}</span>；速率为 PeeringDB 登记的端口速率，成员为该交换点在 PeeringDB 登记的网络数。
        </p>
        <Button v-if="ixs.status.value === 'error'" variant="outline" size="xs" @click="ixs.refresh()">
          <RefreshCw data-icon="inline-start" /> 交换点详情加载失败，重试
        </Button>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">对等互联政策</h2>
      </div>
      <div class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
        <div v-for="p in policies" :key="p.title" class="flex gap-3 bg-background p-6">
          <Check class="mt-0.5 size-4 shrink-0 text-success" />
          <div class="flex flex-col gap-1">
            <p class="font-medium">{{ p.title }}</p>
            <p class="text-sm text-muted-foreground">{{ p.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12 pb-24">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">申请流程</h2>
      </div>
      <div class="grid gap-6 lg:grid-cols-2">
        <ol class="flex flex-col gap-4">
          <li v-for="(step, i) in ['确认您的网络位于我们支持的 IX 交换点内', '准备您的 ASN 和 IPv6 地址信息', '通过邮件联系我们']" :key="step" class="flex items-start gap-4">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs tabular-nums">{{ i + 1 }}</span>
            <div class="flex flex-col gap-2 pt-0.5">
              <p>{{ step }}</p>
              <Button v-if="i === 2" variant="outline" size="sm" as-child class="w-fit">
                <a href="mailto:team@pysio.online"><Mail data-icon="inline-start" /> team@pysio.online</a>
              </Button>
            </div>
          </li>
        </ol>
        <Card>
          <CardHeader>
            <CardTitle>提供以下信息</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="flex flex-col gap-2 text-sm">
              <li v-for="item in requiredInfo" :key="item" class="flex items-center gap-2">
                <span class="size-1 rounded-full bg-muted-foreground" />
                {{ item }}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Button variant="ghost" size="sm" as-child class="w-fit">
        <NuxtLink to="/anycast"><ArrowLeft data-icon="inline-start" /> 返回 AS213605 网络</NuxtLink>
      </Button>
    </section>
  </div>
</template>
