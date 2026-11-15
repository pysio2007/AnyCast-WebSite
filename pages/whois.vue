<script setup lang="ts">
import { AlertCircle, ArrowUpRight, Check, Copy, Globe, Hash, HelpCircle, Info, Keyboard, Loader2, Network, Search, ShieldAlert } from '@lucide/vue'
import { toast } from 'vue-sonner'

type Kind = 'ip' | 'autnum' | 'domain'
type Json = Record<string, any>
type ErrorKind = 'invalid' | 'notfound' | 'http' | 'network'

interface Target { kind: Kind, value: string }
interface VCard {
  fn?: string
  org?: string
  kind?: string
  title?: string
  emails: string[]
  phones: { value: string, fax: boolean }[]
  addresses: string[]
  urls: string[]
}
interface Contact {
  key: string
  handle?: string
  roles: string[]
  card: VCard
  parent?: string
  ids: string[]
  abuse: boolean
}
interface Note { key: string, source: '备注' | '声明', title: string, text: string, links: string[] }

class LookupError extends Error {
  constructor(public kind: ErrorKind, message: string) {
    super(message)
  }
}

const EXAMPLES = ['1.1.1.1', '2606:4700::/32', 'AS213605', 'pysio.online', 'google.com']

// ---------- query detection ----------

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
const DOMAIN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/

function isIPv6(s: string) {
  if (!s.includes(':') || !/^[\da-f:.]+$/i.test(s))
    return false
  try {
    new URL(`http://[${s}]`)
    return true
  }
  catch {
    return false
  }
}

function isIpOrCidr(v: string) {
  const [addr, len, ...rest] = v.split('/')
  if (rest.length || !addr)
    return false
  const v4 = IPV4.test(addr)
  if (!v4 && !isIPv6(addr))
    return false
  return len === undefined || (/^\d{1,3}$/.test(len) && Number(len) <= (v4 ? 32 : 128))
}

/** Converts IDNs to punycode so `例子.中国`-style input validates and queries correctly. */
function toAsciiHost(v: string) {
  if (!/^[^/?#@:\s]+$/.test(v))
    return ''
  try {
    return new URL(`http://${v}`).hostname
  }
  catch {
    return ''
  }
}

function detect(raw: string): Target | null {
  const v = raw.trim()
  if (!v)
    return null
  const asn = /^(?:AS)?(\d{1,10})$/i.exec(v)
  if (asn && Number(asn[1]) <= 4294967295)
    return { kind: 'autnum', value: String(Number(asn[1])) }
  if (isIpOrCidr(v))
    return { kind: 'ip', value: v.toLowerCase() }
  const host = toAsciiHost(v.replace(/\.$/, ''))
  if (host && DOMAIN.test(host))
    return { kind: 'domain', value: host }
  return null
}

const kindMeta: Record<Kind | 'none' | 'unknown', { text: string, icon: any }> = {
  none: { text: '等待输入', icon: Keyboard },
  autnum: { text: 'ASN', icon: Hash },
  ip: { text: 'IP 地址 / CIDR', icon: Network },
  domain: { text: '域名', icon: Globe },
  unknown: { text: '无法识别', icon: HelpCircle },
}

// ---------- state ----------

const route = useRoute()
const router = useRouter()

const query = ref('')
const data = ref<Json | null>(null)
const sourceUrl = ref('')
const loading = ref(false)
const error = ref<LookupError | null>(null)
const copied = ref(false)
/** Queried single IP (RDAP ip lookups land on `/ip/<addr>` URLs; CIDR queries keep a slash), for the geolocation cross-link. */
const singleIp = computed(() => {
  const m = sourceUrl.value.match(/\/ip\/([\da-f:.]+)$/i)
  return m?.[1] ?? ''
})

const detected = computed(() => detect(query.value))
const meta = computed(() => kindMeta[query.value.trim() ? (detected.value?.kind ?? 'unknown') : 'none'])

let lastQuery = ''
let controller: AbortController | null = null

async function lookup(raw: string) {
  lastQuery = raw.trim()
  controller?.abort()
  data.value = null
  error.value = null
  const target = detect(raw)
  if (!target) {
    loading.value = false
    error.value = new LookupError('invalid', lastQuery ? '请输入有效的域名、IP 地址 / CIDR 或 ASN' : '请输入要查询的内容')
    return
  }
  const ctrl = (controller = new AbortController())
  loading.value = true
  try {
    const path = target.kind === 'ip' ? target.value : encodeURIComponent(target.value)
    const res = await fetch(`https://rdap.org/${target.kind}/${path}`, { signal: ctrl.signal })
    if (res.status === 404)
      throw new LookupError('notfound', '该对象没有 RDAP 服务或不存在')
    if (res.status === 429)
      throw new LookupError('http', 'RDAP 服务请求过于频繁，请稍后重试')
    if (!res.ok) {
      const body = await res.json().catch(() => null) as Json | null
      const detail = body?.title || (Array.isArray(body?.description) ? body.description.join(' ') : '')
      throw new LookupError('http', `RDAP 服务返回 HTTP ${res.status}${detail ? `：${detail}` : ''}`)
    }
    const json = await res.json().catch(() => {
      throw new LookupError('http', 'RDAP 服务返回了无法解析的数据')
    }) as Json
    if (ctrl.signal.aborted)
      return
    data.value = json
    sourceUrl.value = res.url
  }
  catch (err) {
    if (ctrl.signal.aborted)
      return
    error.value = err instanceof LookupError ? err : new LookupError('network', '无法连接 RDAP 服务，请检查网络后重试')
  }
  finally {
    if (controller === ctrl)
      loading.value = false
  }
}

function submit() {
  const q = query.value.trim()
  if (route.query.q !== q)
    router.replace({ query: { ...route.query, q: q || undefined } })
  lookup(q)
}

function useExample(example: string) {
  query.value = example
  submit()
}

onMounted(() => {
  const q = route.query.q
  if (typeof q === 'string' && q.trim()) {
    query.value = q
    lookup(q)
  }
})

watch(() => route.query.q, (q) => {
  if (typeof q === 'string' && q.trim() && q.trim() !== lastQuery) {
    query.value = q
    lookup(q)
  }
})

onBeforeUnmount(() => controller?.abort())

// ---------- formatting helpers ----------

const pad = (n: number) => String(n).padStart(2, '0')

function parseDate(s?: string) {
  if (!s)
    return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}
function formatDay(s?: string) {
  const d = parseDate(s)
  return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : (s ?? '')
}
function formatDateTime(s?: string) {
  const d = parseDate(s)
  return d ? `${formatDay(s)} ${pad(d.getHours())}:${pad(d.getMinutes())}` : (s ?? '')
}

function textOf(v: unknown): string {
  if (Array.isArray(v))
    return v.map(textOf).filter(Boolean).join(', ')
  return v == null ? '' : String(v).trim()
}

/** Parses a jCard (`['vcard', [[name, params, type, value, ...], ...]]`, RFC 7095). */
function parseVCard(arr: unknown): VCard {
  const card: VCard = { emails: [], phones: [], addresses: [], urls: [] }
  const props = Array.isArray(arr) && arr[0] === 'vcard' && Array.isArray(arr[1]) ? arr[1] : []
  const push = (list: string[], v: string) => {
    if (v && !list.includes(v))
      list.push(v)
  }
  for (const p of props) {
    if (!Array.isArray(p))
      continue
    const [name, params, , ...values] = p as [string, Json | undefined, string, ...unknown[]]
    const value = values.length > 1 ? values : values[0]
    switch (String(name).toLowerCase()) {
      case 'fn': card.fn = textOf(value) || card.fn; break
      case 'org': card.org = textOf(value) || card.org; break
      case 'kind': card.kind = textOf(value) || card.kind; break
      case 'title': card.title = textOf(value) || card.title; break
      case 'email': push(card.emails, textOf(value).replace(/^mailto:/i, '')); break
      case 'url': push(card.urls, textOf(value)); break
      case 'tel': {
        const tel = textOf(value).replace(/^tel:/i, '')
        if (tel)
          card.phones.push({ value: tel, fax: [params?.type].flat().map(t => String(t).toLowerCase()).includes('fax') })
        break
      }
      case 'adr': {
        const label = typeof params?.label === 'string' ? params.label.trim() : ''
        push(card.addresses, label || textOf(value))
        break
      }
    }
  }
  return card
}

const ROLE_LABELS: Record<string, string> = {
  registrant: '注册人',
  technical: '技术',
  administrative: '管理',
  abuse: '滥用举报',
  billing: '账单',
  registrar: '注册商',
  reseller: '经销商',
  sponsor: '赞助方',
  proxy: '代理',
  notifications: '通知',
  noc: 'NOC',
}
const roleLabel = (r: string) => ROLE_LABELS[r.toLowerCase()] ?? r

const VCARD_KINDS: Record<string, string> = { individual: '个人', org: '组织', group: '团体', location: '地点' }

const OBJECT_CLASS: Record<string, string> = {
  'ip network': 'IP 网段',
  'autnum': '自治系统',
  'domain': '域名',
  'entity': '实体',
  'nameserver': '域名服务器',
}

const EVENT_LABELS: Record<string, string> = {
  'registration': '注册时间',
  'reregistration': '重新注册',
  'last changed': '最后变更',
  'expiration': '到期时间',
  'deletion': '删除',
  'reinstantiation': '恢复',
  'transfer': '转移',
  'locked': '锁定',
  'unlocked': '解锁',
  'last update of rdap database': 'RDAP 数据库更新',
  'registrar expiration': '注册商到期',
}
const KEY_EVENTS = ['registration', 'last changed', 'expiration']

const REGISTRIES: Record<string, string> = {
  'rdap.arin.net': 'ARIN',
  'rdap.db.ripe.net': 'RIPE NCC',
  'rdap.apnic.net': 'APNIC',
  'rdap.lacnic.net': 'LACNIC',
  'rdap.afrinic.net': 'AFRINIC',
  'rdap.verisign.com': 'Verisign',
}

function statusClass(s: string) {
  const v = s.toLowerCase()
  if (/^(?:active|ok|validated|allocated|assigned)/.test(v))
    return 'bg-success/15 text-success border-transparent'
  if (/inactive|redemption|pending|hold|revoked|removed|reserved/.test(v))
    return 'bg-warning/15 text-warning border-transparent'
  return 'bg-muted text-muted-foreground border-transparent'
}

// ---------- derived views ----------

const isDomain = computed(() => data.value?.objectClassName === 'domain')

const title = computed(() => {
  const d = data.value
  return d ? String(d.unicodeName || d.ldhName || d.name || d.handle || lastQuery) : ''
})

const source = computed(() => {
  let host = ''
  try {
    host = new URL(sourceUrl.value).host
  }
  catch {}
  if (host === 'rdap.org' || !host) {
    const self = (data.value?.links as Json[] | undefined)?.find(l => l.rel === 'self')?.href
    try {
      host = self ? new URL(self).host : host
    }
    catch {}
  }
  return { host, name: REGISTRIES[host] ?? '' }
})

const contacts = computed<Contact[]>(() => {
  const out: Contact[] = []
  const walk = (entities: unknown, parent: string | undefined, prefix: string) => {
    if (!Array.isArray(entities))
      return
    entities.forEach((e: Json, i) => {
      if (!e || typeof e !== 'object')
        return
      const key = `${prefix}${i}`
      const roles: string[] = Array.isArray(e.roles) ? e.roles.map(String) : []
      const card = parseVCard(e.vcardArray)
      out.push({
        key,
        handle: e.handle ? String(e.handle) : undefined,
        roles,
        card,
        parent,
        ids: Array.isArray(e.publicIds) ? e.publicIds.map((p: Json) => `${p.type}: ${p.identifier}`) : [],
        abuse: roles.some(r => r.toLowerCase() === 'abuse'),
      })
      walk(e.entities, card.fn || e.handle || roles.map(roleLabel).join('/'), `${key}.`)
    })
  }
  walk(data.value?.entities, undefined, '')
  // Abuse contacts first; Array.prototype.sort is stable so the rest keep registry order.
  return out.sort((a, b) => Number(b.abuse) - Number(a.abuse))
})

const abuseEmails = computed(() => [...new Set(contacts.value.filter(c => c.abuse).flatMap(c => c.card.emails))])

const registrar = computed(() => {
  const e = (data.value?.entities as Json[] | undefined)?.find(x => x?.roles?.includes('registrar'))
  if (!e)
    return null
  const card = parseVCard(e.vcardArray)
  const ianaId = (e.publicIds as Json[] | undefined)?.find(p => /iana/i.test(String(p.type)))?.identifier
  const url = card.urls[0] || (e.links as Json[] | undefined)?.find(l => l.rel !== 'self' && /^https?:/.test(l.href))?.href
  return { name: card.fn || card.org || e.handle, ianaId, url }
})

const summary = computed(() => {
  const d = data.value
  if (!d)
    return []
  const cidrs = Array.isArray(d.cidr0_cidrs)
    ? d.cidr0_cidrs.map((c: Json) => `${c.v4prefix ?? c.v6prefix}/${c.length}`).join(', ')
    : ''
  let autnums = ''
  if (d.startAutnum != null)
    autnums = d.endAutnum != null && d.endAutnum !== d.startAutnum ? `AS${d.startAutnum} – AS${d.endAutnum}` : `AS${d.startAutnum}`
  const rows: { k: string, v?: string, mono?: boolean }[] = [
    { k: '对象类型', v: OBJECT_CLASS[d.objectClassName] ?? d.objectClassName },
    { k: '句柄', v: d.handle, mono: true },
    { k: '名称', v: d.name, mono: true },
    { k: '域名', v: d.ldhName, mono: true },
    { k: 'Unicode 域名', v: d.unicodeName && d.unicodeName !== d.ldhName ? d.unicodeName : undefined },
    { k: '地址范围', v: d.startAddress && `${d.startAddress} – ${d.endAddress}`, mono: true },
    { k: 'CIDR', v: cidrs, mono: true },
    { k: 'ASN', v: autnums, mono: true },
    { k: 'IP 版本', v: d.ipVersion },
    { k: '类型', v: d.type },
    { k: '国家/地区', v: d.country, mono: true },
    { k: '上级对象', v: d.parentHandle, mono: true },
    { k: 'WHOIS 服务器', v: d.port43, mono: true },
  ]
  return rows.filter(r => r.v)
})

const statuses = computed<string[]>(() => (Array.isArray(data.value?.status) ? data.value.status.map(String) : []))

const events = computed(() => {
  const list: Json[] = Array.isArray(data.value?.events) ? data.value.events : []
  return list.map(e => ({
    action: String(e.eventAction ?? ''),
    label: EVENT_LABELS[String(e.eventAction).toLowerCase()] ?? String(e.eventAction),
    date: e.eventDate as string | undefined,
    actor: e.eventActor as string | undefined,
  }))
})
const keyEvents = computed(() => events.value.filter(e => KEY_EVENTS.includes(e.action.toLowerCase())))
const otherEvents = computed(() => events.value.filter(e => !KEY_EVENTS.includes(e.action.toLowerCase())))

function eventHint(e: { action: string, date?: string, actor?: string }) {
  const parts = [formatDateTime(e.date)]
  const d = parseDate(e.date)
  if (d && e.action.toLowerCase() === 'expiration') {
    const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000)
    parts.push(days >= 0 ? `剩余 ${days} 天` : '已过期')
  }
  if (e.actor)
    parts.push(e.actor)
  return parts.filter(Boolean).join(' · ')
}

const nameservers = computed(() => {
  const list: Json[] = Array.isArray(data.value?.nameservers) ? data.value.nameservers : []
  return list.map(ns => ({
    name: String(ns.unicodeName || ns.ldhName || ns.handle || ''),
    ips: [...(ns.ipAddresses?.v4 ?? []), ...(ns.ipAddresses?.v6 ?? [])] as string[],
  })).filter(ns => ns.name)
})

const secureDns = computed(() => {
  const s = data.value?.secureDNS as Json | undefined
  if (!s)
    return null
  const ds: Json[] = Array.isArray(s.dsData) ? s.dsData : []
  const keys: Json[] = Array.isArray(s.keyData) ? s.keyData : []
  return { signed: s.delegationSigned === true, ds, keys }
})

const notes = computed<Note[]>(() => {
  const toNotes = (list: unknown, src: Note['source']) => (Array.isArray(list) ? list : []).map((n: Json, i): Note => ({
    key: `${src}-${i}`,
    source: src,
    title: String(n.title || n.type || (Array.isArray(n.description) ? String(n.description[0] ?? '').slice(0, 80) : '') || src),
    text: Array.isArray(n.description) ? n.description.join('\n') : '',
    links: Array.isArray(n.links) ? n.links.map((l: Json) => String(l.href)).filter((h: string) => /^https?:/.test(h)) : [],
  }))
  return [...toNotes(data.value?.remarks, '备注'), ...toNotes(data.value?.notices, '声明')]
})

const rawJson = computed(() => (data.value ? JSON.stringify(data.value, null, 2) : ''))

async function copyRaw() {
  try {
    await navigator.clipboard.writeText(rawJson.value)
    copied.value = true
    toast.success('已复制到剪贴板')
    setTimeout(() => {
      copied.value = false
    }, 1500)
  }
  catch {
    toast.error('复制失败')
  }
}
</script>

<template>
  <div>
    <PageSeo title="WHOIS 查询" description="通过 RDAP 查询域名、IP 地址 / CIDR 与 ASN 的注册信息，自动识别查询类型。" />
    <PageHeader
      eyebrow="工具"
      title="WHOIS 查询"
      description="基于 RDAP 协议查询域名、IP 地址 / CIDR 与 ASN 的注册信息，自动识别查询类型并跳转至权威 RIR 或注册局。"
    />

    <section class="page-container py-12">
      <Card>
        <CardContent class="flex flex-col gap-3">
          <Label for="whois-query">查询对象</Label>
          <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
            <Input id="whois-query" v-model="query" placeholder="域名、IP 地址 / CIDR 或 ASN，例如 1.1.1.1" class="flex-1 font-mono" autocomplete="off" spellcheck="false" />
            <Button type="submit" :disabled="loading" class="sm:min-w-28">
              <Loader2 v-if="loading" data-icon="inline-start" class="animate-spin" />
              <Search v-else data-icon="inline-start" />
              查询
            </Button>
          </form>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span class="inline-flex items-center gap-1.5">
              <component :is="meta.icon" class="size-4" />
              当前识别为：{{ meta.text }}
            </span>
            <div class="flex flex-wrap items-center gap-1.5">
              <span>示例</span>
              <Button
                v-for="ex in EXAMPLES"
                :key="ex"
                type="button"
                size="xs"
                variant="outline"
                class="font-mono"
                :disabled="loading"
                @click="useExample(ex)"
              >
                {{ ex }}
              </Button>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            数据经
            <a href="https://rdap.org" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">rdap.org</a>
            引导至各 RIR / 域名注册局的 RDAP 服务实时查询。部分 ccTLD（如 .cn）尚未提供 RDAP。
          </p>
        </CardContent>
      </Card>
    </section>

    <section v-if="loading || error || data" class="page-container flex flex-col gap-6 pb-24">
      <template v-if="loading">
        <Skeleton class="h-56 w-full rounded-xl" />
        <Skeleton class="h-72 w-full rounded-xl" />
      </template>

      <Alert v-else-if="error?.kind === 'notfound' || error?.kind === 'invalid'">
        <Info />
        <AlertTitle>{{ error.kind === 'notfound' ? '未找到结果' : '无法查询' }}</AlertTitle>
        <AlertDescription>{{ error.message }}</AlertDescription>
      </Alert>

      <Alert v-else-if="error" variant="destructive">
        <AlertCircle />
        <AlertTitle>查询失败</AlertTitle>
        <AlertDescription>{{ error.message }}</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline" @click="lookup(lastQuery)">重试</Button>
        </AlertAction>
      </Alert>

      <template v-else-if="data">
        <!-- 概要 -->
        <Card>
          <CardHeader>
            <CardTitle class="font-mono break-all">{{ title }}</CardTitle>
            <CardDescription>
              概要<template v-if="source.host"> · 来自
                <a :href="sourceUrl" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">
                  {{ source.name ? `${source.name}（${source.host}）` : source.host }}
                </a>
              </template>
            </CardDescription>
            <CardAction v-if="singleIp">
              <Button variant="outline" size="sm" as-child>
                <NuxtLink :to="{ path: '/ip', query: { q: singleIp } }">IP 定位</NuxtLink>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent class="flex flex-col gap-6">
            <div v-if="keyEvents.length" class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
              <StatCard v-for="e in keyEvents" :key="e.action" :label="e.label" :value="formatDay(e.date)" :hint="eventHint(e)" />
            </div>

            <dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[9rem_1fr]">
              <template v-for="row in summary" :key="row.k">
                <dt class="text-muted-foreground">{{ row.k }}</dt>
                <dd class="min-w-0 break-all" :class="row.mono && 'font-mono tabular-nums'">{{ row.v }}</dd>
              </template>
              <template v-if="statuses.length">
                <dt class="text-muted-foreground">状态</dt>
                <dd class="flex flex-wrap gap-1">
                  <Badge v-for="s in statuses" :key="s" :class="statusClass(s)">{{ s }}</Badge>
                </dd>
              </template>
              <template v-if="abuseEmails.length">
                <dt class="text-muted-foreground">滥用举报</dt>
                <dd class="flex min-w-0 flex-wrap gap-x-3 font-mono break-all">
                  <a v-for="m in abuseEmails" :key="m" :href="`mailto:${m}`" class="underline-offset-4 hover:underline">{{ m }}</a>
                </dd>
              </template>
              <template v-for="e in otherEvents" :key="`${e.action}-${e.date}`">
                <dt class="text-muted-foreground">{{ e.label }}</dt>
                <dd class="font-mono tabular-nums">
                  {{ formatDateTime(e.date) }}<span v-if="e.actor" class="text-muted-foreground"> · {{ e.actor }}</span>
                </dd>
              </template>
              <template v-if="source.host">
                <dt class="text-muted-foreground">数据来源</dt>
                <dd class="min-w-0 break-all">
                  <a :href="sourceUrl" target="_blank" rel="noopener" class="inline-flex items-center gap-1 font-mono underline-offset-4 hover:underline">
                    {{ source.host }}<ArrowUpRight class="size-3.5" />
                  </a>
                  <span v-if="source.name" class="text-muted-foreground"> · {{ source.name }}</span>
                </dd>
              </template>
            </dl>
          </CardContent>
        </Card>

        <!-- 域名 -->
        <Card v-if="isDomain">
          <CardHeader>
            <CardTitle>域名</CardTitle>
            <CardDescription>注册商、域名服务器与 DNSSEC 状态</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-6">
            <dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[9rem_1fr]">
              <dt class="text-muted-foreground">注册商</dt>
              <dd class="min-w-0 break-all">
                <template v-if="registrar">
                  {{ registrar.name }}
                  <span v-if="registrar.ianaId" class="font-mono text-muted-foreground tabular-nums"> · IANA ID {{ registrar.ianaId }}</span>
                  <a v-if="registrar.url" :href="registrar.url" target="_blank" rel="noopener" class="ml-2 inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    网站<ArrowUpRight class="size-3.5" />
                  </a>
                </template>
                <span v-else class="text-muted-foreground">未提供</span>
              </dd>

              <dt class="text-muted-foreground">DNSSEC</dt>
              <dd>
                <Badge v-if="secureDns?.signed" class="bg-success/15 text-success border-transparent">已签名</Badge>
                <Badge v-else-if="secureDns" class="bg-muted text-muted-foreground border-transparent">未签名</Badge>
                <span v-else class="text-muted-foreground">未提供</span>
              </dd>

              <dt class="text-muted-foreground">域名服务器</dt>
              <dd class="min-w-0">
                <ul v-if="nameservers.length" class="flex flex-col gap-1 font-mono">
                  <li v-for="ns in nameservers" :key="ns.name" class="break-all">
                    {{ ns.name }}<span v-if="ns.ips.length" class="text-muted-foreground tabular-nums"> · {{ ns.ips.join(', ') }}</span>
                  </li>
                </ul>
                <span v-else class="text-muted-foreground">未提供</span>
              </dd>
            </dl>

            <div v-if="secureDns?.ds.length" class="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="pl-4">Key Tag</TableHead>
                    <TableHead>算法</TableHead>
                    <TableHead>摘要类型</TableHead>
                    <TableHead class="pr-4">摘要</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(ds, i) in secureDns.ds" :key="i">
                    <TableCell class="pl-4 font-mono tabular-nums">{{ ds.keyTag }}</TableCell>
                    <TableCell class="font-mono tabular-nums">{{ ds.algorithm }}</TableCell>
                    <TableCell class="font-mono tabular-nums">{{ ds.digestType }}</TableCell>
                    <TableCell class="pr-4 font-mono text-xs break-all whitespace-normal">{{ ds.digest }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div v-if="secureDns?.keys.length" class="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="pl-4">Flags</TableHead>
                    <TableHead>协议</TableHead>
                    <TableHead>算法</TableHead>
                    <TableHead class="pr-4">公钥</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(k, i) in secureDns.keys" :key="i">
                    <TableCell class="pl-4 font-mono tabular-nums">{{ k.flags }}</TableCell>
                    <TableCell class="font-mono tabular-nums">{{ k.protocol }}</TableCell>
                    <TableCell class="font-mono tabular-nums">{{ k.algorithm }}</TableCell>
                    <TableCell class="pr-4 font-mono text-xs break-all whitespace-normal">{{ k.publicKey }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <!-- 联系人 -->
        <Card>
          <CardHeader>
            <CardTitle>联系人</CardTitle>
            <CardDescription>注册信息中的实体（含嵌套实体），滥用举报联系人优先显示</CardDescription>
          </CardHeader>
          <CardContent>
            <p v-if="!contacts.length" class="text-sm text-muted-foreground">该对象未包含联系人信息</p>
            <div v-else class="grid gap-3 md:grid-cols-2">
              <div
                v-for="c in contacts"
                :key="c.key"
                class="flex min-w-0 flex-col gap-3 rounded-xl border p-4 text-sm"
                :class="c.abuse && 'border-warning/50 bg-warning/5'"
              >
                <div class="flex flex-wrap items-center gap-1.5">
                  <ShieldAlert v-if="c.abuse" class="size-4 text-warning" />
                  <Badge
                    v-for="r in c.roles"
                    :key="r"
                    :class="r.toLowerCase() === 'abuse' ? 'bg-warning/15 text-warning border-transparent' : 'bg-muted text-muted-foreground border-transparent'"
                  >
                    {{ roleLabel(r) }}
                  </Badge>
                  <span v-if="c.handle" class="ml-auto font-mono text-xs text-muted-foreground break-all">{{ c.handle }}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <p class="font-medium break-words">{{ c.card.fn || c.card.org || c.handle || '未提供名称' }}</p>
                  <p v-if="c.card.org && c.card.org !== c.card.fn" class="text-muted-foreground break-words">{{ c.card.org }}</p>
                  <p v-if="c.card.title || c.card.kind" class="text-xs text-muted-foreground">
                    {{ [c.card.title, c.card.kind && (VCARD_KINDS[c.card.kind] ?? c.card.kind)].filter(Boolean).join(' · ') }}
                  </p>
                  <p v-if="c.parent" class="text-xs text-muted-foreground break-words">隶属于 {{ c.parent }}</p>
                </div>
                <dl v-if="c.card.emails.length || c.card.phones.length || c.card.addresses.length || c.card.urls.length || c.ids.length" class="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-1.5">
                  <template v-if="c.card.emails.length">
                    <dt class="text-muted-foreground">邮箱</dt>
                    <dd class="flex min-w-0 flex-col font-mono break-all">
                      <a v-for="m in c.card.emails" :key="m" :href="`mailto:${m}`" class="underline-offset-4 hover:underline">{{ m }}</a>
                    </dd>
                  </template>
                  <template v-if="c.card.phones.length">
                    <dt class="text-muted-foreground">电话</dt>
                    <dd class="flex min-w-0 flex-col font-mono break-all tabular-nums">
                      <span v-for="p in c.card.phones" :key="p.value + p.fax">{{ p.value }}<span v-if="p.fax" class="text-muted-foreground">（传真）</span></span>
                    </dd>
                  </template>
                  <template v-if="c.card.addresses.length">
                    <dt class="text-muted-foreground">地址</dt>
                    <dd class="flex min-w-0 flex-col gap-1 break-words whitespace-pre-line">
                      <span v-for="a in c.card.addresses" :key="a">{{ a }}</span>
                    </dd>
                  </template>
                  <template v-if="c.card.urls.length">
                    <dt class="text-muted-foreground">网址</dt>
                    <dd class="flex min-w-0 flex-col font-mono break-all">
                      <a v-for="u in c.card.urls" :key="u" :href="u" target="_blank" rel="noopener" class="underline-offset-4 hover:underline">{{ u }}</a>
                    </dd>
                  </template>
                  <template v-if="c.ids.length">
                    <dt class="text-muted-foreground">标识</dt>
                    <dd class="flex min-w-0 flex-col font-mono break-all">
                      <span v-for="id in c.ids" :key="id">{{ id }}</span>
                    </dd>
                  </template>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 备注与声明 -->
        <Card v-if="notes.length">
          <CardHeader>
            <CardTitle>备注与声明</CardTitle>
            <CardDescription>注册机构附带的备注（remarks）与服务声明（notices）</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" class="border-t">
              <AccordionItem v-for="n in notes" :key="n.key" :value="n.key">
                <AccordionTrigger>
                  <span class="flex min-w-0 items-center gap-2">
                    <Badge class="bg-muted text-muted-foreground border-transparent">{{ n.source }}</Badge>
                    <span class="break-words">{{ n.title }}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p v-if="n.text" class="break-words whitespace-pre-line">{{ n.text }}</p>
                    <a
                      v-for="href in n.links"
                      :key="href"
                      :href="href"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex w-fit items-center gap-1 font-mono text-xs break-all underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {{ href }}<ArrowUpRight class="size-3.5 shrink-0" />
                    </a>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <!-- 原始数据 -->
        <Card class="gap-0 py-0">
          <div class="flex items-center justify-between gap-3 border-b px-5 py-3">
            <span class="text-sm font-medium">原始 RDAP JSON</span>
            <Button size="sm" variant="ghost" @click="copyRaw">
              <Check v-if="copied" data-icon="inline-start" class="text-success" />
              <Copy v-else data-icon="inline-start" />
              {{ copied ? '已复制' : '复制' }}
            </Button>
          </div>
          <div class="max-h-[640px] overflow-auto">
            <pre class="p-5 font-mono text-xs leading-relaxed">{{ rawJson }}</pre>
          </div>
        </Card>
      </template>
    </section>
  </div>
</template>
