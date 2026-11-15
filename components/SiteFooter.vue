<script setup lang="ts">
import { GitCommitHorizontal } from '@lucide/vue'
import { GITHUB_REPO, LOGO_URL, networkLinks, ORGANIZATIONS, resourceLinks, SITE_ASNS, toolLinks } from '@/lib/site'

const gitHash = useRuntimeConfig().public.gitHash as string
const year = new Date().getFullYear()

const columns = [
  { title: '网络', links: networkLinks },
  { title: '工具', links: toolLinks },
  { title: '资源', links: resourceLinks },
]
</script>

<template>
  <footer class="mt-auto border-t">
    <div class="page-container grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
      <div class="flex flex-col gap-4">
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold tracking-tight">
          <img :src="LOGO_URL" alt="" class="size-6 rounded-full" width="24" height="24">
          Pysio Networks
        </NuxtLink>
        <p class="max-w-xs text-sm text-muted-foreground">
          独立运营的 Anycast / BGP 网络。
          <NuxtLink to="/asn" class="hover:text-foreground">{{ SITE_ASNS.length }} 个自治系统</NuxtLink>，隶属
          <template v-for="(org, i) in Object.values(ORGANIZATIONS)" :key="org.id">
            <span v-if="i">、</span>
            <a :href="org.website" target="_blank" rel="noopener" class="hover:text-foreground">{{ org.name }}</a>
          </template>。
        </p>
        <ClientOnly>
          <ColorModeToggle class="self-start" />
          <template #fallback>
            <div class="h-7 w-20" />
          </template>
        </ClientOnly>
      </div>
      <div v-for="column in columns" :key="column.title" class="flex flex-col gap-3">
        <p class="text-sm font-medium">{{ column.title }}</p>
        <ul class="flex flex-col gap-2">
          <li v-for="link in column.links" :key="link.to">
            <NuxtLink :to="link.to" class="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {{ link.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t">
      <div class="page-container flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <p>© {{ year }} Pysio Networks. All rights reserved.</p>
        <a
          :href="`https://github.com/${GITHUB_REPO}/commit/${gitHash}`"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 font-mono hover:text-foreground"
        >
          <GitCommitHorizontal class="size-3.5" />
          {{ gitHash }}
        </a>
      </div>
    </div>
  </footer>
</template>
