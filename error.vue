<script setup lang="ts">
import type { NuxtError } from '#app'
import { ArrowLeft, Home, RefreshCw } from '@lucide/vue'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error?.statusCode)

const copy = computed(() => {
  const code = statusCode.value ?? 0
  if (code === 404)
    return { title: '页面不存在', description: '你访问的地址在本站上不存在，可能已被移动或删除。' }
  if (code === 403)
    return { title: '访问被拒绝', description: '你没有访问此页面的权限。' }
  if (code >= 500)
    return { title: '服务器错误', description: '服务器返回了意外的错误，请稍后再试。' }
  return { title: '发生错误', description: '处理请求时遇到了意外情况。' }
})

const goHome = () => clearError({ redirect: '/' })
const route = useRoute()
const retry = () => clearError({ redirect: route.fullPath })
function goBack() {
  if (window.history.length > 1)
    clearError().then(() => window.history.back())
  else
    goHome()
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <PageSeo :title="`${statusCode ?? '错误'} · ${copy.title}`" :description="copy.description" />
    <SiteHeader />

    <main class="relative flex flex-1 items-center overflow-hidden">
      <div class="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div class="page-container relative flex flex-col items-center gap-6 py-24 text-center md:py-32">
        <p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">Error</p>
        <h1 class="font-mono text-7xl font-semibold tracking-tighter tabular-nums md:text-9xl">
          {{ statusCode ?? '???' }}
        </h1>
        <div class="flex max-w-xl flex-col gap-2">
          <h2 class="text-2xl font-semibold tracking-tight">{{ copy.title }}</h2>
          <p class="text-pretty text-muted-foreground">{{ copy.description }}</p>
        </div>

        <pre
          v-if="error?.message && error.message !== copy.title"
          class="max-w-full overflow-x-auto rounded-lg border bg-muted/50 px-4 py-3 text-left font-mono text-xs whitespace-pre-wrap break-all text-muted-foreground"
        >{{ error.message }}</pre>

        <div class="flex flex-wrap justify-center gap-3 pt-2">
          <Button size="lg" class="px-4" @click="goHome">
            <Home data-icon="inline-start" /> 返回首页
          </Button>
          <Button v-if="statusCode !== 404" size="lg" variant="outline" class="px-4" @click="retry">
            <RefreshCw data-icon="inline-start" /> 重试
          </Button>
          <Button size="lg" variant="ghost" class="px-4" @click="goBack">
            <ArrowLeft data-icon="inline-start" /> 返回上一页
          </Button>
        </div>

        <p class="text-xs text-muted-foreground">
          如果你认为这是一个错误，请
          <a href="mailto:team@pysio.online" class="underline underline-offset-4 hover:text-foreground">联系我们</a>
        </p>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
