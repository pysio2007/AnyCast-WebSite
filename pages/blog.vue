<script setup lang="ts">
import { ArrowUpRight, ChevronLeft, ChevronRight, CircleAlert, RefreshCw, Rss } from '@lucide/vue'

interface Post {
  title: string
  link: string
  description: string
  pubDate: Date
  image: string | null
  category: string
  tags: string[]
}

const FEED_URL = 'https://www.pysio.online/rss.xml'
const CONTENT_NS = 'http://purl.org/rss/1.0/modules/content/'
const EXCLUDED_CATEGORIES = ['NekoXii', 'resource']
const CATEGORY_NAMES: Record<string, string> = { daily: '日常', develop: '开发' }
const ALL = '全部'
const PAGE_SIZE = 5

const categoryName = (category: string) => CATEGORY_NAMES[category] ?? category

function htmlToText(html: string) {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
}

function parseFeed(xml: string): Post[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length)
    throw new Error('RSS 解析失败')

  return Array.from(doc.querySelectorAll('channel > item'), (item) => {
    const field = (tag: string) => item.getElementsByTagName(tag)[0]?.textContent?.trim() ?? ''
    const description = field('description')
    const content = item.getElementsByTagNameNS(CONTENT_NS, 'encoded')[0]?.textContent ?? ''
    const hashtags = htmlToText(content).matchAll(/(?:^|\s)#([\w\u4E00-\u9FA5]+)/g)
    return {
      title: field('title'),
      link: field('link'),
      description: htmlToText(description).trim(),
      pubDate: new Date(field('pubDate')),
      image: description.match(/<img[^>]+src="([^">]+)"/i)?.[1] ?? null,
      category: field('category') || '未分类',
      tags: [...new Set(Array.from(hashtags, m => m[1]!))],
    }
  })
    .filter(post => !EXCLUDED_CATEGORIES.includes(post.category))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
}

const { data: posts, status, error, refresh } = useAsyncData(
  'blog-rss',
  async () => parseFeed(await $fetch<string>(FEED_URL, { responseType: 'text' })),
  { server: false, lazy: true, default: () => [] as Post[] },
)

const loading = computed(() => status.value === 'pending' || status.value === 'idle')

const selectedCategory = ref(ALL)
const selectedTags = ref<string[]>([])
const currentPage = ref(1)

const categories = computed(() => [ALL, ...new Set(posts.value.map(post => post.category))])
const tags = computed(() => [...new Set(posts.value.flatMap(post => post.tags))])

const filteredPosts = computed(() => posts.value.filter(post =>
  (selectedCategory.value === ALL || post.category === selectedCategory.value)
  && selectedTags.value.every(tag => post.tags.includes(tag)),
))
const maxPage = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / PAGE_SIZE)))
const displayedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredPosts.value.slice(start, start + PAGE_SIZE)
})

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? ALL : category
  currentPage.value = 1
}

function toggleTag(tag: string) {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter(t => t !== tag)
    : [...selectedTags.value, tag]
  currentPage.value = 1
}

const formatDate = (date: Date) => Number.isNaN(date.getTime())
  ? '—'
  : date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-')

function hideImage(event: Event) {
  (event.target as HTMLElement).style.display = 'none'
}
</script>

<template>
  <div>
    <PageSeo title="博客" description="Pysio 的最新文章。" />

    <PageHeader eyebrow="资源" title="博客" description="日常与开发笔记。">
      <template #actions>
        <Button variant="outline" size="sm" as-child>
          <a href="https://www.pysio.online/" target="_blank" rel="noopener">访问博客 <ArrowUpRight data-icon="inline-end" /></a>
        </Button>
        <Button variant="ghost" size="sm" as-child>
          <a :href="FEED_URL" target="_blank" rel="noopener"><Rss data-icon="inline-start" /> RSS</a>
        </Button>
      </template>
    </PageHeader>

    <section class="page-container flex flex-col gap-8 py-12">
      <Alert v-if="status === 'error'" variant="destructive">
        <CircleAlert />
        <AlertTitle>文章加载失败</AlertTitle>
        <AlertDescription>{{ error?.message || '无法获取 RSS 订阅源' }}</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="sm" @click="refresh()">
            <RefreshCw data-icon="inline-start" /> 重试
          </Button>
        </AlertAction>
      </Alert>

      <template v-else-if="loading">
        <div class="flex flex-wrap gap-2">
          <Skeleton v-for="i in 3" :key="i" class="h-8 w-16" />
        </div>
        <div class="divide-y rounded-xl border">
          <div v-for="i in PAGE_SIZE" :key="i" class="grid gap-3 p-5 md:grid-cols-[8rem_1fr] md:gap-8 md:p-6">
            <Skeleton class="h-4 w-24" />
            <div class="flex flex-col gap-3">
              <Skeleton class="h-5 w-2/3" />
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="category in categories"
              :key="category"
              size="sm"
              :variant="selectedCategory === category ? 'secondary' : 'ghost'"
              :aria-pressed="selectedCategory === category"
              @click="selectCategory(category)"
            >
              {{ categoryName(category) }}
            </Button>
          </div>
          <div v-if="tags.length" class="flex flex-wrap gap-2">
            <Badge
              v-for="tag in tags"
              :key="tag"
              as="button"
              type="button"
              class="cursor-pointer"
              :variant="selectedTags.includes(tag) ? 'default' : 'outline'"
              :aria-pressed="selectedTags.includes(tag)"
              @click="toggleTag(tag)"
            >
              #{{ tag }}
            </Badge>
          </div>
        </div>

        <p v-if="!displayedPosts.length" class="py-12 text-center text-sm text-muted-foreground">
          没有符合条件的文章。
        </p>

        <ul v-else class="divide-y rounded-xl border">
          <li
            v-for="post in displayedPosts"
            :key="post.link"
            class="grid gap-3 p-5 md:grid-cols-[8rem_1fr] md:gap-8 md:p-6"
          >
            <time :datetime="formatDate(post.pubDate)" class="font-mono text-sm tabular-nums text-muted-foreground md:pt-0.5">
              {{ formatDate(post.pubDate) }}
            </time>
            <div class="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div class="flex min-w-0 flex-col gap-2">
                <a
                  :href="post.link"
                  target="_blank"
                  rel="noopener"
                  class="group inline-flex items-start gap-1 text-lg font-medium tracking-tight underline-offset-4 hover:underline"
                >
                  {{ post.title }}
                  <ArrowUpRight class="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                </a>
                <p class="line-clamp-3 text-sm text-pretty text-muted-foreground">{{ post.description }}</p>
                <div class="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="secondary">{{ categoryName(post.category) }}</Badge>
                  <Badge v-for="tag in post.tags" :key="tag" variant="outline">#{{ tag }}</Badge>
                </div>
              </div>
              <img
                v-if="post.image"
                :src="post.image"
                :alt="post.title"
                loading="lazy"
                class="aspect-video w-full shrink-0 rounded-lg border object-cover sm:w-48"
                @error="hideImage"
              >
            </div>
          </li>
        </ul>

        <div v-if="filteredPosts.length" class="flex items-center justify-between gap-4">
          <span class="font-mono text-sm tabular-nums text-muted-foreground">
            {{ currentPage }} / {{ maxPage }} · 共 {{ filteredPosts.length }} 篇
          </span>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage--">
              <ChevronLeft data-icon="inline-start" /> 上一页
            </Button>
            <Button variant="outline" size="sm" :disabled="currentPage >= maxPage" @click="currentPage++">
              下一页 <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
