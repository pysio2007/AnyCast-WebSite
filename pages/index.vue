<template>
  <div class="container mx-auto p-4">
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[50vh]">
      <span class="loading loading-dots loading-lg"></span>
    </div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-8">
        来自 {{ organization }} 欢迎来到 Pysio's Networks
      </h1>

      <p class="text-lg mb-6">
        这里是 Pysio Networks 的网络监控/工具平台。你可以在此查询节点/BGP路由状态
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const organization = ref('')
const isLoading = ref(true)

onMounted(async () => {
  try {
    const ipResponse = await fetch('https://ip.akaere.online/')
    const ipData = await ipResponse.json()
    organization.value = ipData.org
  } catch (error) {
    console.error('Error fetching data:', error)
    organization.value = 'Unknown Organization'
  } finally {
    isLoading.value = false
  }
})
</script>
