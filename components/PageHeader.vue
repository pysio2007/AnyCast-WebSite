<script setup lang="ts">
defineProps<{
  /** Small label above the title, e.g. "工具" or "网络". */
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <section class="relative overflow-hidden border-b">
    <div class="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
    <div class="page-container relative flex flex-col gap-4 py-12 md:py-16">
      <p v-if="eyebrow" class="font-mono text-xs uppercase tracking-widest text-muted-foreground">{{ eyebrow }}</p>
      <h1 class="text-3xl font-semibold tracking-tight text-balance md:text-5xl">{{ title }}</h1>
      <p v-if="description || $slots.description" class="max-w-2xl text-base text-pretty text-muted-foreground md:text-lg">
        <slot name="description">{{ description }}</slot>
      </p>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2 pt-2">
        <slot name="actions" />
      </div>
      <slot />
    </div>
  </section>
</template>
