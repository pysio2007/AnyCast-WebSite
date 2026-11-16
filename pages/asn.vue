<script setup lang="ts">
import type { OperatedAsn, OrgId } from '@/lib/site'
import { ArrowUpRight, RefreshCw } from '@lucide/vue'
import { OPERATED_ASNS, ORGANIZATIONS, registryLookupUrl } from '@/lib/site'

interface AsOverview { holder: string | null, announced: boolean }
interface AnnouncedPrefixes { prefixes: { prefix: string }[] }
interface AsnNeighbours { neighbour_counts: { left: number, right: number, uncertain: number, unique: number } }

const rows = OPERATED_ASNS.map(meta => ({
  meta,
  overview: useRipeStat<AsOverview>('as-overview', { resource: `AS${meta.asn}` }),
  prefixes: useRipeStat<AnnouncedPrefixes>('announced-prefixes', { resource: `AS${meta.asn}` }),
  neighbours: useRipeStat<AsnNeighbours>('asn-neighbours', { resource: `AS${meta.asn}` }),
}))
type Row = (typeof rows)[number]
type Req = Row['overview'] | Row['prefixes'] | Row['neighbours']

const isPending = (r: Req) => r.status.value === 'pending' || r.status.value === 'idle'
const allRequests = rows.flatMap(r => [r.overview, r.prefixes, r.neighbours] as Req[])
const failed = computed(() => allRequests.filter(r => r.status.value === 'error'))
const loading = computed(() => allRequests.some(isPending))

function prefixSplit(row: Row) {
  const list = row.prefixes.data.value?.prefixes ?? []
  const v6 = list.filter(p => p.prefix.includes(':')).length
  return { v4: list.length - v6, v6 }
}

const totals = computed(() => {
  const all = new Set(rows.flatMap(r => r.prefixes.data.value?.prefixes.map(p => p.prefix) ?? []))
  const v6 = [...all].filter(p => p.includes(':')).length
  return {
    announced: rows.filter(r => r.overview.data.value?.announced).length,
    v4: all.size - v6,
    v6,
  }
})

const groups = (Object.keys(ORGANIZATIONS) as OrgId[]).map(id => ({
  org: ORGANIZATIONS[id],
  rows: rows.filter(r => r.meta.org === id),
}))

function retry() {
  for (const r of failed.value) r.refresh()
}

const externalLinks = (meta: OperatedAsn) => [
  { label: 'bgp.tools', href: `https://bgp.tools/as/${meta.asn}` },
  { label: meta.registry, href: registryLookupUrl(meta) },
  ...(meta.peeringdb ? [{ label: 'PeeringDB', href: `https://www.peeringdb.com/net/${meta.peeringdb}` }] : []),
]
</script>

<template>
  <div>
    <PageSeo
      title="自治系统"
      :description="`Pysio Networks、Akaere Networks 与 Skimit 运营的 ${OPERATED_ASNS.length} 个自治系统：${OPERATED_ASNS.map(a => `AS${a.asn}`).join('、')}。`"
    />

    <PageHeader
      eyebrow="网络"
      title="自治系统"
      description="我们在 RIPE NCC、APNIC 与 ARIN 注册并运营的全部 ASN。"
    >
      <template #actions>
        <Button variant="outline" size="sm" as-child>
          <NuxtLink to="/prefixes">全部前缀</NuxtLink>
        </Button>
        <Button v-if="failed.length" variant="outline" size="sm" @click="retry">
          <RefreshCw data-icon="inline-start" /> 重试失败的请求
        </Button>
      </template>
    </PageHeader>

    <section class="page-container py-12">
      <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        <StatCard label="自治系统" :value="OPERATED_ASNS.length" :hint="`${Object.keys(ORGANIZATIONS).length} 个组织`" />
        <StatCard label="正在公告" :value="`${totals.announced} / ${OPERATED_ASNS.length}`" :loading="loading" hint="RIS 可见" />
        <StatCard label="IPv4 前缀" :value="totals.v4" :loading="loading" hint="去重合计" />
        <StatCard label="IPv6 前缀" :value="totals.v6" :loading="loading" hint="去重合计" />
      </div>
    </section>

    <section v-for="group in groups" :key="group.org.id" class="page-container flex flex-col gap-6 border-t py-12">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-2xl font-semibold tracking-tight">{{ group.org.name }}</h2>
          <p class="text-muted-foreground">{{ group.org.description }}</p>
        </div>
        <Button variant="ghost" size="sm" as-child>
          <a :href="group.org.website" target="_blank" rel="noopener">
            {{ group.org.website.replace(/^https:\/\/(www\.)?|\/$/g, '') }}
            <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      </div>

      <div class="overflow-x-auto rounded-xl border">
        <Table class="min-w-[760px]">
          <TableHeader>
            <TableRow class="bg-muted/40 hover:bg-muted/40">
              <TableHead class="pl-4">ASN</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>状态</TableHead>
              <TableHead class="text-right">IPv4</TableHead>
              <TableHead class="text-right">IPv6</TableHead>
              <TableHead class="text-right">上游 / 下游</TableHead>
              <TableHead class="pr-4 text-right">链接</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in group.rows" :key="row.meta.asn">
              <TableCell class="pl-4">
                <NuxtLink :to="`/bgp?q=AS${row.meta.asn}`" class="font-mono font-medium tabular-nums underline-offset-4 hover:underline">
                  AS{{ row.meta.asn }}
                </NuxtLink>
              </TableCell>
              <TableCell class="max-w-72">
                <Skeleton v-if="isPending(row.overview)" class="h-4 w-48" />
                <span v-else class="block truncate" :title="row.overview.data.value?.holder ?? ''">{{ row.overview.data.value?.holder || '—' }}</span>
              </TableCell>
              <TableCell>
                <Skeleton v-if="isPending(row.overview)" class="h-5 w-14" />
                <Badge v-else-if="row.overview.data.value?.announced" class="border-transparent bg-success/15 text-success">公告中</Badge>
                <Badge v-else-if="row.overview.data.value" variant="secondary">未公告</Badge>
                <span v-else class="text-sm text-destructive">加载失败</span>
              </TableCell>
              <TableCell class="text-right font-mono tabular-nums">
                <Skeleton v-if="isPending(row.prefixes)" class="ml-auto h-4 w-6" />
                <template v-else>{{ row.prefixes.data.value ? prefixSplit(row).v4 : '—' }}</template>
              </TableCell>
              <TableCell class="text-right font-mono tabular-nums">
                <Skeleton v-if="isPending(row.prefixes)" class="ml-auto h-4 w-6" />
                <template v-else>{{ row.prefixes.data.value ? prefixSplit(row).v6 : '—' }}</template>
              </TableCell>
              <TableCell class="text-right font-mono tabular-nums">
                <Skeleton v-if="isPending(row.neighbours)" class="ml-auto h-4 w-12" />
                <template v-else-if="row.neighbours.data.value">
                  {{ row.neighbours.data.value.neighbour_counts.left }} / {{ row.neighbours.data.value.neighbour_counts.right }}
                </template>
                <template v-else>—</template>
              </TableCell>
              <TableCell class="pr-4">
                <div class="flex justify-end gap-3 text-sm">
                  <a
                    v-for="link in externalLinks(row.meta)"
                    :key="link.label"
                    :href="link.href"
                    target="_blank"
                    rel="noopener"
                    class="whitespace-nowrap text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >{{ link.label }}</a>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  </div>
</template>
