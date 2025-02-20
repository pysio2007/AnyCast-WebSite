<template>
  <div class="container mx-auto p-4">
    <div class="mb-4 flex items-center gap-4">
      <NuxtLink to="/lg" class="btn btn-ghost">
        <i class="fas fa-arrow-left"></i>
        返回
      </NuxtLink>
      <h2 class="text-xl font-bold">
        {{ $route.params.server }}: show protocols all {{ $route.params.protocol }}
      </h2>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body font-mono">
        <pre v-if="errorMessage" class="text-error">{{ errorMessage }}</pre>
        <pre v-else class="whitespace-pre-wrap text-sm">{{ protocolDetails }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cache, type ApiResponse, type ApiResultPair } from '~/utils/cache'

const route = useRoute()
const protocolDetails = ref('')
const errorMessage = ref('') // 改名以避免冲突
const loading = ref(false)
const apiUrl = 'https://lg.pysio.online/api/'

// 获取协议详细信息
const fetchProtocolDetails = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const cacheKey = `protocol_${route.params.server}_${route.params.protocol}`;
    // 尝试从缓存获取数据
    const cachedData = Cache.get<string>(cacheKey);
    if (cachedData) {
      protocolDetails.value = cachedData;
      return;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: [route.params.server],
        type: 'bird',  // 修改为bird类型
        args: `show protocols all ${route.params.protocol}`  // 使用正确的BIRD命令格式
      })
    })
    const data = await response.json() as ApiResponse<ApiResultPair>;
    if (data.error) {
      errorMessage.value = data.error;
      return;
    }
    if (data.result && data.result.length > 0) {
      protocolDetails.value = data.result[0].data;
      // 存入缓存
      Cache.set(cacheKey, data.result[0].data);
    }
  } catch (err) {
    console.error('获取协议详情失败:', err)
    errorMessage.value = '请求失败: ' + (err instanceof Error ? err.message : String(err))
  } finally {
    loading.value = false
  }
}

// 页面加载时获取详情
onMounted(() => {
  fetchProtocolDetails()
})
</script>
