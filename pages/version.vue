<script setup lang="ts">
import { ArrowUpRight, CircleAlert, GitCommitHorizontal, RefreshCw } from '@lucide/vue'
import { GITHUB_REPO } from '@/lib/site'

interface GitHubCommit {
  sha: string
  html_url: string
  commit: { message: string, author: { name: string, date: string } }
  author: { login: string, avatar_url: string, html_url: string } | null
}

type CommitType = 'feat' | 'fix' | 'docs' | 'perf' | 'other'

interface Commit {
  sha: string
  url: string
  type: CommitType
  scope: string | null
  message: string
  author: string
  authorUrl: string | null
  avatar: string | null
  date: Date
}

const REPO_URL = `https://github.com/${GITHUB_REPO}`
const MAX_DAYS = 10
const TYPE_LABELS: Record<CommitType, string> = {
  feat: '新功能',
  fix: '问题修复',
  docs: '文档更新',
  perf: '性能优化',
  other: '其他更改',
}
const TYPE_CLASSES: Record<CommitType, string> = {
  feat: 'border-transparent bg-info/15 text-info',
  fix: 'border-transparent bg-warning/15 text-warning',
  docs: '',
  perf: 'border-transparent bg-success/15 text-success',
  other: '',
}

const gitHash = String(useRuntimeConfig().public.gitHash ?? '')
const buildHash = gitHash.slice(0, 7)
const buildIsCommit = /^[0-9a-f]{7,40}$/i.test(gitHash)

const CONVENTIONAL = /^(feat|fix|perf|docs|chore|style|refactor|test|build|ci|revert)(\(.+\))?!?: (.+)$/

function parseCommit(raw: GitHubCommit): Commit {
  const subject = raw.commit.message.split('\n')[0]!.trim()
  const match = subject.match(CONVENTIONAL)
  const type = match?.[1]
  return {
    sha: raw.sha,
    url: raw.html_url,
    type: type === 'feat' || type === 'fix' || type === 'docs' || type === 'perf' ? type : 'other',
    scope: match?.[2]?.slice(1, -1) ?? null,
    message: match?.[3] ?? subject,
    author: raw.author?.login ?? raw.commit.author.name,
    authorUrl: raw.author?.html_url ?? null,
    avatar: raw.author?.avatar_url ?? null,
    date: new Date(raw.commit.author.date),
  }
}

const { data: commits, status, error, refresh } = useAsyncData(
  'github-commits',
  async () => (await $fetch<GitHubCommit[]>(`https://api.github.com/repos/${GITHUB_REPO}/commits`)).map(parseCommit),
  { server: false, lazy: true, default: () => [] as Commit[] },
)

const loading = computed(() => status.value === 'pending' || status.value === 'idle')

const dayKey = (date: Date) => date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-')
const timeOfDay = (date: Date) => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
const absolute = (date: Date) => date.toLocaleString('zh-CN', { hour12: false })

const relativeFormat = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]
function relative(date: Date) {
  const seconds = (date.getTime() - Date.now()) / 1000
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size)
      return relativeFormat.format(Math.round(seconds / size), unit)
  }
  return '刚刚'
}

const groups = computed(() => {
  const byDay = new Map<string, Commit[]>()
  for (const commit of commits.value) {
    const key = dayKey(commit.date)
    byDay.set(key, [...(byDay.get(key) ?? []), commit])
  }
  return [...byDay.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, MAX_DAYS)
    .map(([day, items]) => ({ day, items }))
})

const latest = computed(() => commits.value[0] ?? null)
const commitsBehind = computed(() => {
  if (!buildIsCommit || !commits.value.length)
    return null
  const index = commits.value.findIndex(c => c.sha.startsWith(gitHash.toLowerCase()))
  return index === -1 ? null : index
})
const shownCount = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0))
</script>

<template>
  <div>
    <PageSeo title="更新日志" description="Pysio Networks 网站的版本信息与提交记录。" />

    <PageHeader eyebrow="资源" title="更新日志" description="网站源码的最新提交。">
      <template #actions>
        <Button variant="outline" size="sm" as-child>
          <a :href="REPO_URL" target="_blank" rel="noopener">GitHub 仓库 <ArrowUpRight data-icon="inline-end" /></a>
        </Button>
      </template>
    </PageHeader>

    <section class="page-container py-12">
      <div class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        <div class="flex flex-col gap-1 bg-background p-6">
          <p class="text-sm text-muted-foreground">当前构建</p>
          <a
            v-if="buildIsCommit"
            :href="`${REPO_URL}/commit/${gitHash}`"
            target="_blank"
            rel="noopener"
            class="font-mono text-2xl font-semibold tracking-tight tabular-nums underline-offset-4 hover:underline md:text-3xl"
          >{{ buildHash }}</a>
          <p v-else class="font-mono text-2xl font-semibold tracking-tight md:text-3xl">{{ gitHash || '—' }}</p>
          <div class="flex min-h-5 items-center">
            <Skeleton v-if="buildIsCommit && loading" class="h-4 w-20" />
            <Badge v-else-if="commitsBehind === 0" class="border-transparent bg-success/15 text-success">最新版本</Badge>
            <Badge v-else-if="commitsBehind" class="border-transparent bg-warning/15 text-warning">落后 {{ commitsBehind }} 个提交</Badge>
            <p v-else class="text-xs text-muted-foreground">本站部署版本</p>
          </div>
        </div>
        <StatCard
          label="最新提交"
          :value="latest?.sha.slice(0, 7)"
          :loading="loading"
          :hint="latest ? relative(latest.date) : 'main 分支'"
        />
        <StatCard
          label="近期提交"
          :value="shownCount"
          :loading="loading"
          :hint="`最近 ${groups.length || MAX_DAYS} 个活跃日`"
        />
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">提交记录</h2>
        <p class="text-muted-foreground">按日期分组，展示最近 {{ MAX_DAYS }} 个有提交的日期。</p>
      </div>

      <Alert v-if="status === 'error'" variant="destructive">
        <CircleAlert />
        <AlertTitle>获取更新日志失败</AlertTitle>
        <AlertDescription>{{ error?.message || 'GitHub API 请求失败，可能触发了速率限制。' }}</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="sm" @click="refresh()">
            <RefreshCw data-icon="inline-start" /> 重试
          </Button>
        </AlertAction>
      </Alert>

      <div v-else-if="loading" class="flex flex-col gap-10">
        <div v-for="i in 3" :key="i" class="grid gap-4 md:grid-cols-[9rem_1fr] md:gap-8">
          <Skeleton class="h-5 w-24" />
          <div class="divide-y rounded-xl border">
            <div v-for="j in 2" :key="j" class="flex flex-col gap-2 p-4">
              <Skeleton class="h-5 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>

      <p v-else-if="!groups.length" class="py-12 text-center text-sm text-muted-foreground">暂无提交记录。</p>

      <ol v-else class="flex flex-col gap-10">
        <li v-for="group in groups" :key="group.day" class="grid gap-4 md:grid-cols-[9rem_1fr] md:gap-8">
          <div class="flex items-center gap-2 md:sticky md:top-20 md:h-fit md:pt-4">
            <GitCommitHorizontal class="size-4 text-muted-foreground" />
            <time :datetime="group.day" class="font-mono text-sm tabular-nums">{{ group.day }}</time>
          </div>
          <ul class="divide-y rounded-xl border">
            <li
              v-for="commit in group.items"
              :key="commit.sha"
              class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <div class="flex min-w-0 flex-col gap-1.5">
                <p class="text-sm font-medium break-words">
                  <span v-if="commit.scope" class="font-mono text-muted-foreground">{{ commit.scope }}: </span>{{ commit.message }}
                </p>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <a
                    :href="commit.url"
                    target="_blank"
                    rel="noopener"
                    class="font-mono tabular-nums text-foreground underline-offset-4 hover:underline"
                  >{{ commit.sha.slice(0, 7) }}</a>
                  <component
                    :is="commit.authorUrl ? 'a' : 'span'"
                    :href="commit.authorUrl ?? undefined"
                    :target="commit.authorUrl ? '_blank' : undefined"
                    :rel="commit.authorUrl ? 'noopener' : undefined"
                    class="inline-flex items-center gap-1.5 underline-offset-4 hover:text-foreground"
                  >
                    <img v-if="commit.avatar" :src="`${commit.avatar}&s=32`" alt="" class="size-4 rounded-full border">
                    {{ commit.author }}
                  </component>
                  <time :datetime="commit.date.toISOString()" :title="absolute(commit.date)" class="font-mono tabular-nums">
                    {{ timeOfDay(commit.date) }} · {{ relative(commit.date) }}
                  </time>
                </div>
              </div>
              <Badge variant="outline" :class="['shrink-0', TYPE_CLASSES[commit.type]]">{{ TYPE_LABELS[commit.type] }}</Badge>
            </li>
          </ul>
        </li>
      </ol>
    </section>
  </div>
</template>
