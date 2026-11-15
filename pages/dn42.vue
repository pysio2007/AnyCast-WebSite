<script setup lang="ts">
import { ArrowUpRight, Check, Copy, Gift, Mail, Network, RefreshCw, Zap } from '@lucide/vue'
import { toast } from 'vue-sonner'

const AUTOPEER = 'https://www.autopeer.su'
const NOC_EMAIL = 'noc@akae.re'
const REFRESH_MS = 60_000

const { data, status, error, refresh } = useFetch('/api/autopeer', {
  key: 'autopeer',
  lazy: true,
  server: false,
})

const pending = computed(() => status.value === 'pending' || status.value === 'idle')
const loading = computed(() => pending.value && !data.value)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    if (!pending.value)
      refresh()
  }, REFRESH_MS)
})
onBeforeUnmount(() => clearInterval(timer))

const LOCATIONS: Record<string, { city: string, flag: string }> = {
  HKG: { city: '香港', flag: 'hk' },
  AMS: { city: '阿姆斯特丹', flag: 'nl' },
  CAN: { city: '广州', flag: 'cn' },
}

const nodes = computed(() => {
  const stats = new Map((data.value?.stats.nodes ?? []).map(s => [s.node_id, s]))
  return (data.value?.nodes ?? [])
    .filter(n => n.enabled)
    .map(n => ({ ...n, place: LOCATIONS[n.location], peers: stats.get(n.id)?.peers_active ?? null }))
})
const onlineCount = computed(() => nodes.value.filter(n => n.online).length)

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${i ? v.toFixed(v >= 100 ? 0 : 1) : v} ${units[i]}`
}

const traffic = computed(() => {
  const s = data.value?.stats
  if (!s || s.total_rx_bytes + s.total_tx_bytes === 0)
    return null
  return { total: formatBytes(s.total_rx_bytes + s.total_tx_bytes), rx: formatBytes(s.total_rx_bytes), tx: formatBytes(s.total_tx_bytes) }
})
const avgRtt = computed(() => {
  const rtt = data.value?.stats.avg_rtt_ms
  return rtt ? `${rtt.toFixed(1)} ms` : null
})
const updatedAt = computed(() => data.value
  ? new Date(data.value.fetchedAt).toLocaleTimeString('zh-CN', { hour12: false })
  : null)

const shortKey = (key: string) => `${key.slice(0, 8)}…${key.slice(-6)}`

const copied = ref<string | null>(null)
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = text
    toast.success('已复制到剪贴板')
    setTimeout(() => {
      if (copied.value === text)
        copied.value = null
    }, 1500)
  }
  catch {
    toast.error('复制失败')
  }
}

const steps = [
  { title: '登录 AutoPeer', description: '登录 AutoPeer 控制台，以你的 DN42 ASN 身份管理 Peering。' },
  { title: '选择节点并提交', description: '选择要 Peering 的节点，提交你的 ASN 与 WireGuard 公钥。' },
  { title: '自动建立会话', description: '平台自动建立 WireGuard 隧道并配置 BGP 会话，无需人工介入。' },
]

const features = [
  { icon: Zap, title: '零配置', description: '无需人工审核与邮件往来，隧道参数与 BGP 配置全部自动生成并下发。' },
  { icon: Network, title: '多节点冗余', description: '在多个地区部署 Peering 节点，可同时与多个节点互联以获得冗余路径。' },
  { icon: Gift, title: '完全免费', description: '面向 DN42 社区的公益服务，不收取任何费用。' },
]

const moreLinks = [
  { label: '状态', href: `${AUTOPEER}/status` },
  { label: 'Atlas 探针', href: `${AUTOPEER}/atlas` },
  { label: '路由抖动', href: `${AUTOPEER}/flap` },
  { label: '开源', href: `${AUTOPEER}/opensource` },
]
</script>

<template>
  <div>
    <PageSeo
      title="DN42 AutoPeer"
      description="DN42 AutoPeer：免费的 DN42 自动化 BGP Peering 平台，提交 ASN 与 WireGuard 公钥即可自动建立隧道与会话。实时查看节点状态、Endpoint 与 WireGuard 公钥。"
    />

    <PageHeader
      eyebrow="网络"
      title="DN42 AutoPeer"
      description="免费的 DN42 自动化 BGP Peering 平台，提交 ASN 与 WireGuard 公钥即可自动建立隧道与会话；由 Akaere Networks / Pysio 运营，AS213605。"
    >
      <template #actions>
        <Button as-child>
          <a :href="`${AUTOPEER}/login`" target="_blank" rel="noopener">开始 Peering <ArrowUpRight data-icon="inline-end" /></a>
        </Button>
        <Button variant="outline" as-child>
          <a :href="`${AUTOPEER}/docs`" target="_blank" rel="noopener">文档 <ArrowUpRight data-icon="inline-end" /></a>
        </Button>
        <Button variant="ghost" as-child>
          <a :href="`${AUTOPEER}/looking-glass`" target="_blank" rel="noopener">Looking Glass <ArrowUpRight data-icon="inline-end" /></a>
        </Button>
      </template>
    </PageHeader>

    <section class="page-container flex flex-col gap-3 py-12">
      <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        <StatCard
          label="在线节点"
          :value="data ? `${onlineCount} / ${nodes.length}` : null"
          :loading="loading"
          hint="已启用的公共节点"
        />
        <StatCard label="活跃 Peer" :value="data?.stats.peers_active" :loading="loading" hint="全部节点合计" />
        <StatCard
          label="24h 流量"
          :value="traffic?.total"
          :loading="loading"
          :hint="traffic ? `↓ ${traffic.rx} · ↑ ${traffic.tx}` : '暂无数据'"
        />
        <StatCard label="平均 RTT" :value="avgRtt" :loading="loading" :hint="avgRtt ? '全部活跃会话' : '暂无数据'" />
      </div>
      <p class="text-xs text-muted-foreground">
        数据来自
        <a :href="AUTOPEER" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">AutoPeer</a>
        公共 API，每 60 秒自动刷新<template v-if="updatedAt">，更新于 <span class="font-mono tabular-nums">{{ updatedAt }}</span></template>
      </p>
    </section>

    <section class="page-container flex flex-col gap-6 pb-16">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-semibold tracking-tight">公共 Peering 节点</h2>
          <p class="text-muted-foreground">所有节点均以 <span class="font-mono">AS213605</span> 与你建立 DN42 BGP 会话。</p>
        </div>
        <Button variant="outline" :disabled="pending" class="self-start sm:self-auto" @click="refresh()">
          <RefreshCw data-icon="inline-start" :class="pending && 'animate-spin'" />
          刷新
        </Button>
      </div>

      <Alert v-if="error" variant="destructive">
        <AlertTitle>节点数据获取失败</AlertTitle>
        <AlertDescription>
          暂时无法从 AutoPeer 获取节点状态{{ data ? '，以下为上次成功获取的数据' : '' }}。
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline" :disabled="pending" @click="refresh()">重试</Button>
        </AlertAction>
      </Alert>

      <div class="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="pl-4">节点</TableHead>
              <TableHead>位置</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Link-local</TableHead>
              <TableHead>WireGuard 公钥</TableHead>
              <TableHead class="text-right">活跃 Peer</TableHead>
              <TableHead class="pr-4">状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading">
              <TableRow v-for="i in 3" :key="i">
                <TableCell class="pl-4"><Skeleton class="h-5 w-28" /></TableCell>
                <TableCell><Skeleton class="h-5 w-24" /></TableCell>
                <TableCell><Skeleton class="h-5 w-36" /></TableCell>
                <TableCell><Skeleton class="h-5 w-32" /></TableCell>
                <TableCell><Skeleton class="h-5 w-28" /></TableCell>
                <TableCell><Skeleton class="ml-auto h-5 w-8" /></TableCell>
                <TableCell class="pr-4"><Skeleton class="h-5 w-12" /></TableCell>
              </TableRow>
            </template>
            <TableEmpty v-else-if="!nodes.length" :colspan="7">
              <span class="text-muted-foreground">{{ error ? '暂无可用数据' : '暂无公共节点' }}</span>
            </TableEmpty>
            <template v-else>
              <TableRow v-for="node in nodes" :key="node.id">
                <TableCell class="pl-4">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ node.name }}</span>
                    <Badge v-if="node.china_mode" variant="outline">中国大陆</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2 whitespace-nowrap">
                    <span v-if="node.place" :class="`fi fi-${node.place.flag} rounded-[2px]`" />
                    <span v-if="node.place">{{ node.place.city }}</span>
                    <span class="font-mono text-xs text-muted-foreground">{{ node.location }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <code class="font-mono text-xs">{{ node.public_ip }}</code>
                    <Button variant="ghost" size="icon-xs" aria-label="复制 Endpoint" class="shrink-0" @click="copy(node.public_ip)">
                      <Check v-if="copied === node.public_ip" />
                      <Copy v-else />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <code class="font-mono text-xs whitespace-nowrap">{{ node.our_lla }}</code>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <code class="font-mono text-xs whitespace-nowrap" :title="node.our_wg_pubkey">{{ shortKey(node.our_wg_pubkey) }}</code>
                    <Button variant="ghost" size="icon-xs" aria-label="复制 WireGuard 公钥" class="shrink-0" @click="copy(node.our_wg_pubkey)">
                      <Check v-if="copied === node.our_wg_pubkey" />
                      <Copy v-else />
                    </Button>
                  </div>
                </TableCell>
                <TableCell class="text-right font-mono tabular-nums">{{ node.peers ?? '—' }}</TableCell>
                <TableCell class="pr-4">
                  <Badge
                    :class="node.online
                      ? 'bg-success/15 text-success border-transparent'
                      : 'bg-destructive/15 text-destructive border-transparent'"
                  >
                    {{ node.online ? '在线' : '离线' }}
                  </Badge>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <p class="text-xs text-muted-foreground">
        WireGuard 端口与隧道参数在 AutoPeer 控制台中自动生成。标记“中国大陆”的节点位于中国大陆境内。
      </p>
    </section>

    <section class="border-t">
      <div class="page-container flex flex-col gap-8 py-16">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-semibold tracking-tight">如何 Peering</h2>
          <p class="text-muted-foreground">无需邮件或工单，三步完成。</p>
        </div>
        <ol class="grid gap-4 md:grid-cols-3">
          <li v-for="(step, i) in steps" :key="step.title">
            <Card class="h-full">
              <CardHeader>
                <span class="font-mono text-sm text-muted-foreground tabular-nums">{{ String(i + 1).padStart(2, '0') }}</span>
                <CardTitle>{{ step.title }}</CardTitle>
                <CardDescription>{{ step.description }}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        </ol>
      </div>
    </section>

    <section class="border-t">
      <div class="page-container flex flex-col gap-8 py-16">
        <h2 class="text-2xl font-semibold tracking-tight">为什么选择 AutoPeer</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div v-for="f in features" :key="f.title" class="flex flex-col gap-3 rounded-xl border bg-card p-5">
            <span class="flex size-9 items-center justify-center rounded-lg border bg-background">
              <component :is="f.icon" class="size-4" />
            </span>
            <div class="flex flex-col gap-1">
              <h3 class="font-medium">{{ f.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ f.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-t">
      <div class="page-container grid gap-8 pt-16 pb-24 lg:grid-cols-[1.4fr_1fr]">
        <div class="flex flex-col gap-4">
          <h2 class="text-2xl font-semibold tracking-tight">更多工具</h2>
          <div class="flex flex-wrap gap-2">
            <Button v-for="link in moreLinks" :key="link.href" variant="outline" size="sm" as-child>
              <a :href="link.href" target="_blank" rel="noopener">{{ link.label }} <ArrowUpRight data-icon="inline-end" /></a>
            </Button>
            <Button variant="outline" size="sm" as-child>
              <a :href="`mailto:${NOC_EMAIL}`"><Mail data-icon="inline-start" /> {{ NOC_EMAIL }}</a>
            </Button>
          </div>
          <p class="text-sm text-muted-foreground">
            AutoPeer 目前处于 Beta 阶段，如遇问题或有改进建议，欢迎发送邮件至
            <a :href="`mailto:${NOC_EMAIL}`" class="font-mono text-foreground underline-offset-4 hover:underline">{{ NOC_EMAIL }}</a>
            反馈。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>我们的 DN42 资源</CardTitle>
            <CardDescription>登记于 DN42 Registry</CardDescription>
          </CardHeader>
          <CardContent>
            <dl class="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2 text-sm">
              <dt class="text-muted-foreground">IPv4</dt>
              <dd class="font-mono tabular-nums">172.20.183.0/27</dd>
              <dt class="text-muted-foreground">netname</dt>
              <dd class="font-mono">PYSIO-NETWORK</dd>
              <dt class="text-muted-foreground">路由起源</dt>
              <dd class="font-mono tabular-nums">AS213605 · AS210440</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>
