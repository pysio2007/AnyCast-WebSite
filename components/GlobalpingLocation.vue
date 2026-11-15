<script setup lang="ts">
/** Globalping "magic" location input: preset chips plus free text (country, city, ASN, provider…). */
const model = defineModel<string>({ required: true })

defineProps<{ id?: string }>()

const presets = [
  { label: '全球', value: 'world' },
  { label: '亚洲', value: 'Asia' },
  { label: '欧洲', value: 'Europe' },
  { label: '北美', value: 'North America' },
  { label: '中国香港', value: 'Hong Kong' },
  { label: '中国台湾', value: 'Taiwan' },
  { label: '日本', value: 'Japan' },
  { label: '新加坡', value: 'Singapore' },
  { label: '德国', value: 'Germany' },
  { label: '美国', value: 'United States' },
  { label: '英国', value: 'United Kingdom' },
  { label: '中国大陆', value: 'China' },
]
</script>

<template>
  <div class="flex flex-col gap-2">
    <Input
      :id="id"
      v-model="model"
      placeholder="world / Japan / Tokyo / AS13335 / Hetzner"
      autocomplete="off"
      spellcheck="false"
      class="font-mono"
    />
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="preset in presets"
        :key="preset.value"
        type="button"
        class="cursor-pointer rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:text-foreground"
        :aria-pressed="model === preset.value"
        @click="model = preset.value"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>
