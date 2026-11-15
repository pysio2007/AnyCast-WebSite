<script setup lang="ts">
/** Credit line + remaining anonymous quota, shared by every Globalping-powered tool. */
const rateLimit = useState<GlobalpingRateLimit | null>('globalping-rate-limit', () => null)
const resetIn = computed(() => rateLimit.value ? Math.max(0, Math.ceil((rateLimit.value.resetAt - Date.now()) / 60000)) : 0)
</script>

<template>
  <p class="text-xs text-muted-foreground">
    探针由
    <a href="https://globalping.io" target="_blank" rel="noopener" class="underline-offset-4 hover:text-foreground hover:underline">Globalping</a>
    开放网络提供，匿名每小时 250 次探针测试
    <template v-if="rateLimit">
      · 剩余 <span class="font-mono tabular-nums text-foreground">{{ rateLimit.remaining }}</span> / {{ rateLimit.limit }}，{{ resetIn }} 分钟后重置
    </template>
  </p>
</template>
