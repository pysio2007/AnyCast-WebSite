<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number | null
  hint?: string
  loading?: boolean
}>()
</script>

<template>
  <div class="flex flex-col gap-1 bg-background p-6">
    <p class="text-sm text-muted-foreground">{{ label }}</p>
    <Skeleton v-if="loading" class="mt-1 h-8 w-20" />
    <p v-else class="font-mono text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">{{ value ?? '—' }}</p>
    <p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p>
  </div>
</template>
