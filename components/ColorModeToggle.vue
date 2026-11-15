<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'

const colorMode = useColorMode()

const options = [
  { value: 'system', label: '跟随系统', icon: Monitor },
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
] as const
</script>

<template>
  <div class="inline-flex items-center rounded-full border p-0.5" role="radiogroup" aria-label="主题">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="colorMode.preference === option.value"
      :aria-label="option.label"
      :title="option.label"
      class="inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground aria-checked:bg-muted aria-checked:text-foreground"
      @click="colorMode.preference = option.value"
    >
      <component :is="option.icon" class="size-3.5" />
    </button>
  </div>
</template>
