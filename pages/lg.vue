<template>
  <div class="container mx-auto p-4">
    <!-- 添加加载状态提示 -->
    <div v-if="statusLoading" class="flex justify-center items-center mb-4">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <span class="ml-2">正在获取服务器状态...</span>
    </div>

    <template v-for="server in serverStatus" :key="server.server">
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">{{ server.server }}: show protocols</h2>
        
        <div class="overflow-x-auto">
          <table class="table table-sm w-full border">
            <thead>
              <tr>
                <th scope="col" class="border">Name</th>
                <th scope="col" class="border">Proto</th>
                <th scope="col" class="border">Table</th>
                <th scope="col" class="border">State</th>
                <th scope="col" class="border">Since</th>
                <th scope="col" class="border">Info</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="peer in server.data" 
                  :key="peer.name"
                  :class="getRowClass(peer.state)">
                <td class="border">
                  <NuxtLink 
                    :to="`/detail/${server.server}/${peer.name}`"
                    class="text-primary hover:underline"
                  >
                    {{ peer.name }}
                  </NuxtLink>
                </td>
                <td class="border">{{ peer.proto }}</td>
                <td class="border">{{ peer.table || '---' }}</td>
                <td class="border">{{ peer.state }}</td>
                <td class="border">{{ peer.since }}</td>
                <td class="border">{{ peer.info }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 刷新按钮 -->
    <div class="fixed bottom-4 right-4">
      <button class="btn btn-circle btn-primary" 
              @click="fetchAllServerStatus" 
              :disabled="statusLoading">
        <i class="fas fa-sync-alt" :class="{ 'animate-spin': statusLoading }"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cache, type ApiResponse, type ApiSummaryResultPair, type SummaryRowData } from '~/utils/cache'

interface ServerListItem {
  server: string;
}

const serverStatus = ref<ApiSummaryResultPair[]>([])
const statusLoading = ref(false)
const apiUrl = 'https://lg.pysio.online/api/'

// 获取所有服务器的BGP状态
const fetchAllServerStatus = async () => {
  statusLoading.value = true
  try {
    // 尝试从缓存获取数据
    const cachedData = Cache.get<ApiSummaryResultPair[]>('serverStatus');
    if (cachedData) {
      serverStatus.value = cachedData;
      return;
    }

    // 如果没有缓存数据，则从API获取
    const serverListResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: [],
        type: 'server_list',
        args: ''
      })
    })
    const serverListData = await serverListResponse.json() as ApiResponse<ServerListItem>;
    const serverList = serverListData.result.map((item: ServerListItem) => item.server);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: serverList,
        type: 'summary',
        args: ''
      })
    })
    const data = await response.json() as ApiResponse<ApiSummaryResultPair>;
    if (data.result) {
      serverStatus.value = data.result;
      Cache.set('serverStatus', data.result);
    }
  } catch (error) {
    console.error('获取服务器状态失败:', error)
  } finally {
    statusLoading.value = false
  }
}

// 获取行样式
const getRowClass = (state: string): string => {
  switch (state.toLowerCase()) {
    case 'up':
      return 'bg-success/10 hover:bg-success/20'
    case 'down':
      return 'bg-error/10 hover:bg-error/20'
    case 'start':
      return 'bg-warning/10 hover:bg-warning/20'
    default:
      return 'hover:bg-base-200'
  }
}

// 页面加载时获取状态
onMounted(async () => {
  await fetchAllServerStatus()
})
</script>

<style lang="postcss" scoped>
.table {
  @apply text-sm;
}

.table th {
  @apply bg-base-200 text-base-content/70 font-bold text-xs uppercase tracking-wider py-2 px-3;
}

.table td {
  @apply py-2 px-3;
}

/* 确保表格在移动设备上可以水平滚动 */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

/* 保持表格紧凑 */
.table-sm th,
.table-sm td {
  @apply py-1.5 px-2;
}

/* 实心边框样式 */
.border {
  @apply border-base-300;
}
</style>
