<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowRight } from '@lucide/vue'

defineProps<{
  to: string
  title: string
  description?: string
  icon?: Component
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-muted/40"
  >
    <span v-if="icon" class="flex size-9 items-center justify-center rounded-lg border bg-background">
      <component :is="icon" class="size-4" />
    </span>
    <span class="flex flex-col gap-1">
      <span class="flex items-center gap-1 font-medium">
        {{ title }}
        <ArrowRight class="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
      <span v-if="description" class="text-sm text-muted-foreground">{{ description }}</span>
    </span>
  </NuxtLink>
</template>
