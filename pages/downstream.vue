<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, Copy, Info, Mail } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { PRIMARY_ASN } from '@/lib/site'

const requirements = [
  { title: '使用用途', text: '仅限非商业用途，包括学习、研究、个人项目等。' },
  { title: 'ASN 要求', text: '必须拥有有效的公共 ASN。' },
  { title: '前缀要求', text: '必须拥有有效的 IPv4 和/或 IPv6 前缀，并通过 RPKI 验证。' },
  { title: '技术能力', text: '必须具备基本的 BGP 配置能力。' },
]

const connectionTypes = ['IPv4 BGP 会话', 'IPv6 BGP 会话', 'VXLAN 隧道', 'GRE 隧道']

const importPolicy = ['仅接受客户自己的前缀', '必须通过 RPKI 验证', '添加社区标记 (213605:0:100) 和 (213605:0:1000)']
const exportPolicy = ['向客户导出我们的前缀', '向客户导出对等路由', '向客户导出上游路由']

const baseCommunities = [
  { community: '213605:0:100', description: '客户路由 (CUSTOMER)' },
  { community: '213605:0:200', description: '对等路由 (PEER)' },
  { community: '213605:0:300', description: '传输/上游路由 (TRANSIT)' },
  { community: '213605:0:1000', description: '下游路由 (DOWNSTREAM)' },
  { community: '213605:0:666', description: '黑洞路由 (BLACKHOLE)' },
  { community: '213605:66:nnn', description: '区域黑洞路由 (REGIONAL BLACKHOLE，nnn 为 ISO 3166-1 国家代码)' },
  { community: '213605:0:9000', description: '导出到路由服务器 (Route Server)' },
  { community: '213605:0:34927', description: '不向上游导出 (Do Not Export to Upstream)' },
]

const validationCommunities = [
  { community: '213605:10:1', description: 'RPKI 有效 (RPKI Valid)' },
  { community: '213605:10:2', description: 'RPKI 未知 (RPKI Unknown)' },
  { community: '213605:10:3', description: 'RPKI 无效 (RPKI Invalid)' },
  { community: '213605:10:4', description: 'ASPA 有效 (ASPA Valid)' },
  { community: '213605:10:5', description: 'ASPA 未知 (ASPA Unknown)' },
  { community: '213605:10:6', description: 'ASPA 无效 (ASPA Invalid)' },
]

const routeClassification = [
  { community: '213605:0:100', text: '标记客户路由，为客户路由设置较高优先级（本地优先级为 200）' },
  { community: '213605:0:200', text: '标记来自对等体的路由' },
  { community: '213605:0:300', text: '标记来自上游提供商的路由' },
  { community: '213605:0:1000', text: '通用标记，用于识别所有下游路由，带有此标记的路由会被导出到对等和上游' },
]

const routeControl = [
  { community: '213605:0:666', text: '标记应当被黑洞的路由，用于缓解 DDoS 攻击，带有此标记的路由会被丢弃' },
  { community: '213605:66:nnn', text: '区域黑洞路由，nnn 为 ISO 3166-1 国家代码（如 840 代表美国），仅在特定区域内黑洞' },
  { community: '213605:0:9000', text: '标记允许导出到路由服务器的路由' },
  { community: '213605:0:34927', text: '标记不应该向我们的上游导出的路由' },
]

const upstreamControl = [
  { provider: 'Hurricane Electric', noExport: '(213605, 3, 9130)', prepend1: '(213605, 3, 9131)', prepend2: '(213605, 3, 9132)' },
  { provider: 'Liberty Global', noExport: '(213605, 3, 9560)', prepend1: '(213605, 3, 9561)', prepend2: '(213605, 3, 9562)' },
  { provider: 'Cogent', noExport: '(213605, 3, 9470)', prepend1: '(213605, 3, 9471)', prepend2: '(213605, 3, 9472)' },
  { provider: 'Lumen', noExport: '(213605, 3, 9650)', prepend1: '(213605, 3, 9651)', prepend2: '(213605, 3, 9652)' },
  { provider: 'Zare', noExport: '(213605, 3, 9170)', prepend1: '(213605, 3, 9171)', prepend2: '(213605, 3, 9172)' },
  { provider: 'Telia', noExport: '(213605, 3, 9610)', prepend1: '(213605, 3, 9611)', prepend2: '(213605, 3, 9612)' },
]

const exclusiveExport = [
  { community: '(213605, 5, 6939)', description: '只向 Hurricane Electric 导出' },
  { community: '(213605, 5, 6830)', description: '只向 Liberty Global 导出' },
  { community: '(213605, 5, 174)', description: '只向 Cogent 导出' },
  { community: '(213605, 5, 3356)', description: '只向 Lumen 导出' },
  { community: '(213605, 5, 35228)', description: '只向 Zare 导出' },
  { community: '(213605, 5, 1299)', description: '只向 Telia 导出' },
]

const applySteps = [
  '确认您的网络位于支持的地区（FogIXP、AKIXP、香港或美国）',
  '准备您的 ASN 和 IPv6 前缀信息',
  '选择合适的连接方式（直连 / VXLAN / GRE 隧道）',
  '通过邮件联系我们',
]

const requiredInfo = [
  '您的 ASN',
  '您的 IPv6 前缀',
  '您的地理位置和连接信息',
  '首选连接方式（直连 / VXLAN / GRE）',
  '如需隧道连接，请提供端点 IP 地址',
  '技术联系人信息',
]

const copied = ref<string | null>(null)
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = text
    toast.success('已复制', { description: text })
    setTimeout(() => {
      if (copied.value === text) copied.value = null
    }, 1500)
  }
  catch {
    toast.error('复制失败')
  }
}
</script>

<template>
  <div>
    <PageSeo title="下游政策" description="AS213605 下游接入政策：接入要求、连接方式、路由策略与 BGP 社区标记。" />

    <PageHeader
      eyebrow="网络"
      title="AS213605 下游政策"
      description="AS213605 提供 IPv4 和 IPv6 下游连接服务，支持多种连接方式，欢迎所有非商业用途的网络运营商申请。"
    >
      <template #actions>
        <Button size="sm" as-child>
          <a href="mailto:team@pysio.online"><Mail data-icon="inline-start" /> 申请接入</a>
        </Button>
        <Button variant="outline" size="sm" as-child>
          <NuxtLink to="/ix">IX 互联 <ArrowRight data-icon="inline-end" /></NuxtLink>
        </Button>
      </template>
    </PageHeader>

    <section class="page-container flex flex-col gap-8 py-12">
      <Alert>
        <Check class="text-success" />
        <AlertTitle>我们支持所有地区和所有人的 Peer 和下游链接，无门槛，仅限非商业用途。</AlertTitle>
      </Alert>

      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">接入要求</h2>
      </div>
      <div class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
        <div v-for="r in requirements" :key="r.title" class="flex gap-3 bg-background p-6">
          <Check class="mt-0.5 size-4 shrink-0 text-success" />
          <div class="flex flex-col gap-1">
            <p class="font-medium">{{ r.title }}</p>
            <p class="text-sm text-muted-foreground">{{ r.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12">
      <h2 class="text-2xl font-semibold tracking-tight">连接详情</h2>
      <div class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div class="flex flex-col gap-3 bg-background p-6">
          <p class="text-sm text-muted-foreground">连接类型</p>
          <ul class="flex flex-col gap-1.5 text-sm">
            <li v-for="t in connectionTypes" :key="t">{{ t }}</li>
          </ul>
        </div>
        <div class="flex flex-col gap-3 bg-background p-6">
          <p class="text-sm text-muted-foreground">连接位置</p>
          <p class="text-2xl font-semibold tracking-tight">全球</p>
        </div>
        <div class="flex flex-col gap-3 bg-background p-6">
          <p class="text-sm text-muted-foreground">本地 AS</p>
          <p class="font-mono text-2xl font-semibold tracking-tight tabular-nums">{{ PRIMARY_ASN }}</p>
        </div>
        <div class="flex flex-col gap-3 bg-background p-6">
          <p class="text-sm text-muted-foreground">连接 IP</p>
          <p class="text-sm">根据具体情况分配</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>隧道连接说明</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4 text-sm">
          <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-[8rem_1fr]">
            <dt class="font-medium">VXLAN 隧道</dt>
            <dd class="text-muted-foreground">适用于跨地区连接，支持二层扩展，提供灵活的网络部署。</dd>
            <dt class="font-medium">GRE 隧道</dt>
            <dd class="text-muted-foreground">传统三层隧道技术，兼容性好，适用于各种网络环境。</dd>
          </dl>
          <Separator />
          <p class="flex items-start gap-2 text-muted-foreground">
            <Info class="mt-0.5 size-4 shrink-0" />
            隧道连接需要提供端点 IP 地址和相关技术参数，我们将协助您完成配置。
          </p>
        </CardContent>
      </Card>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12">
      <h2 class="text-2xl font-semibold tracking-tight">路由策略</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <Card v-for="policy in [{ title: '导入策略', items: importPolicy }, { title: '导出策略', items: exportPolicy }]" :key="policy.title">
          <CardHeader>
            <CardTitle>{{ policy.title }}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="flex flex-col gap-2 text-sm">
              <li v-for="item in policy.items" :key="item" class="flex items-start gap-2">
                <span class="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {{ item }}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>

    <section class="page-container flex flex-col gap-10 border-t py-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">社区标记</h2>
        <p class="text-muted-foreground">我们使用以下社区标记来管理路由。</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div v-for="table in [{ title: '基础社区表', rows: baseCommunities }, { title: 'RPKI 和 ASPA 验证社区', rows: validationCommunities }]" :key="table.title" class="flex flex-col gap-3">
          <h3 class="font-medium">{{ table.title }}</h3>
          <div class="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/40 hover:bg-muted/40">
                  <TableHead class="pl-4">社区标记</TableHead>
                  <TableHead class="pr-4">描述</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in table.rows" :key="row.community">
                  <TableCell class="pl-4 font-mono text-xs whitespace-nowrap tabular-nums">{{ row.community }}</TableCell>
                  <TableCell class="pr-4 whitespace-normal">{{ row.description }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div v-for="group in [{ title: '路由分类', rows: routeClassification }, { title: '路由控制', rows: routeControl }]" :key="group.title" class="flex flex-col gap-3">
          <h3 class="font-medium">{{ group.title }}</h3>
          <dl class="flex flex-col divide-y rounded-xl border">
            <div v-for="row in group.rows" :key="row.community" class="flex flex-col gap-1 px-4 py-3 text-sm">
              <dt class="font-mono text-xs tabular-nums">{{ row.community }}</dt>
              <dd class="text-muted-foreground">{{ row.text }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h3 class="text-xl font-semibold tracking-tight">上游控制社区</h3>
          <p class="text-sm text-muted-foreground">基础控制社区：我们支持以下功能性社区，用于控制路由如何传递到各上游提供商。</p>
        </div>
        <div class="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/40 hover:bg-muted/40">
                <TableHead class="pl-4">上游提供商</TableHead>
                <TableHead>不导出</TableHead>
                <TableHead>1x AS 路径预置</TableHead>
                <TableHead class="pr-4">2x AS 路径预置</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in upstreamControl" :key="row.provider">
                <TableCell class="pl-4 font-medium">{{ row.provider }}</TableCell>
                <TableCell class="font-mono text-xs tabular-nums">{{ row.noExport }}</TableCell>
                <TableCell class="font-mono text-xs tabular-nums">{{ row.prepend1 }}</TableCell>
                <TableCell class="pr-4 font-mono text-xs tabular-nums">{{ row.prepend2 }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="flex flex-col gap-2">
          <h4 class="font-medium">独家导出社区</h4>
          <p class="text-sm text-muted-foreground">我们还提供“独家导出”社区，使您的路由只向指定的一个上游运营商导出，其他所有运营商都会收到不导出指令。</p>
        </div>
        <div class="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/40 hover:bg-muted/40">
                <TableHead class="pl-4">社区标记</TableHead>
                <TableHead class="pr-4">功能描述</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in exclusiveExport" :key="row.community">
                <TableCell class="pl-4 font-mono text-xs tabular-nums">{{ row.community }}</TableCell>
                <TableCell class="pr-4">{{ row.description }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">使用说明</h2>
        <p class="text-muted-foreground">当您使用上述社区标记路由时，我们的路由器会识别这些社区并按照您的要求控制路由向上游提供商的传播。</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>不导出到特定上游</CardTitle>
            <CardDescription>如果您希望某个前缀不被导出到特定上游，请在宣告该前缀时附加对应的“不导出”社区。</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-3 text-sm">
            <p class="text-muted-foreground">例如，不希望某个前缀被导出到 Hurricane Electric：</p>
            <div class="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 py-1.5 pr-1.5 pl-3 font-mono text-xs tabular-nums">
              (213605, 3, 9130)
              <Button variant="ghost" size="icon-xs" aria-label="复制" @click="copy('(213605, 3, 9130)')">
                <Check v-if="copied === '(213605, 3, 9130)'" /><Copy v-else />
              </Button>
            </div>
            <p class="text-muted-foreground">不希望某个前缀被导出到任何上游：</p>
            <div class="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 py-1.5 pr-1.5 pl-3 font-mono text-xs tabular-nums">
              (213605, 0, 34927)
              <Button variant="ghost" size="icon-xs" aria-label="复制" @click="copy('(213605, 0, 34927)')">
                <Check v-if="copied === '(213605, 0, 34927)'" /><Copy v-else />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AS 路径预置</CardTitle>
            <CardDescription>如果您希望增加某个前缀到达特定上游的路径长度，可以使用预置社区。</CardDescription>
          </CardHeader>
          <CardContent>
            <dl class="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-[1fr_auto]">
              <dt class="text-muted-foreground">单次 AS 路径预置（例如向 Cogent 做 1 次预置）</dt>
              <dd class="font-mono text-xs tabular-nums">(213605, 3, 9471)</dd>
              <dt class="text-muted-foreground">双次 AS 路径预置（例如向 Lumen 做 2 次预置）</dt>
              <dd class="font-mono text-xs tabular-nums">(213605, 3, 9652)</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>独家导出功能</CardTitle>
            <CardDescription>如果您希望某个前缀只向指定的一个上游运营商导出，可以使用“独家导出”社区。</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-3 text-sm">
            <dl class="grid gap-x-4 gap-y-3 sm:grid-cols-[1fr_auto]">
              <dt class="text-muted-foreground">只向 Hurricane Electric 导出</dt>
              <dd class="font-mono text-xs tabular-nums">(213605, 5, 6939)</dd>
              <dt class="text-muted-foreground">只向 Cogent 导出</dt>
              <dd class="font-mono text-xs tabular-nums">(213605, 5, 174)</dd>
            </dl>
            <p class="text-muted-foreground">使用这些社区时，系统会自动为其他所有运营商添加不导出标记，确保路由只传递给指定的运营商。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>黑洞路由</CardTitle>
            <CardDescription>如果您需要实现黑洞路由功能（例如缓解 DDoS 攻击），可以使用黑洞社区标记。</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-3 text-sm">
            <div class="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 py-1.5 pr-1.5 pl-3 font-mono text-xs tabular-nums">
              (213605, 0, 666)
              <Button variant="ghost" size="icon-xs" aria-label="复制" @click="copy('(213605, 0, 666)')">
                <Check v-if="copied === '(213605, 0, 666)'" /><Copy v-else />
              </Button>
            </div>
            <p class="text-muted-foreground">带有此标记的路由将会被丢弃，不会传递到目的地。</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12 pb-24">
      <h2 class="text-2xl font-semibold tracking-tight">申请流程</h2>
      <div class="grid gap-6 lg:grid-cols-2">
        <ol class="flex flex-col gap-4">
          <li v-for="(step, i) in applySteps" :key="step" class="flex items-start gap-4">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs tabular-nums">{{ i + 1 }}</span>
            <div class="flex flex-col gap-2 pt-0.5">
              <p>{{ step }}</p>
              <Button v-if="i === applySteps.length - 1" variant="outline" size="sm" as-child class="w-fit">
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
              <li v-for="item in requiredInfo" :key="item" class="flex items-start gap-2">
                <span class="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
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
