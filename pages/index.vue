<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="flex items-center justify-center h-32 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse">
      <span class="text-gray-500 dark:text-gray-300">正在获取组织信息...</span>
    </div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-8">
        来自 {{ organization }} 欢迎来到 Pysio's Networks
      </h1>
    </div>
    <p class="text-lg mb-6">
      这里是 Pysio Networks 的网络监控/工具平台。你可以在此查询节点/BGP路由状态
    </p>

    <!-- 服务更新通知区 -->
    <div class="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-5 mb-8 shadow-sm">
      <h2 class="text-xl font-bold mb-3 text-blue-800 dark:text-blue-300">📢 网络服务更新</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <h3 class="font-bold text-lg mb-2 flex items-center">
            <i class="fas fa-handshake text-blue-500 mr-2"></i>
            IXP内对等互联
          </h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            我们现在支持与位于相同IX交换点的网络运营商建立对等互联！
          </p>
          <a href="/anycast" class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            了解详情 <i class="fas fa-arrow-right ml-1 text-sm"></i>
          </a>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <h3 class="font-bold text-lg mb-2 flex items-center">
            <i class="fas fa-network-wired text-green-500 mr-2"></i>
            下游连接
          </h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            FogIXP内的网络现可申请成为AS213605的下游，获取全球优质路由！
          </p>
          <a href="/downstream" class="inline-flex items-center text-green-600 hover:text-green-800 font-medium">
            查看政策 <i class="fas fa-arrow-right ml-1 text-sm"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const organization = ref('')
const loading = ref(true)

async function fetchOrganizationData() {
  try {
    const response = await fetch('https://ip.akaere.online/')
    const data = await response.json()
    return data.org || '未知组织'
  } catch (error) {
    console.error('Error fetching IP data:', error)
    return '未知组织'
  }
}

onMounted(async () => {
  organization.value = await fetchOrganizationData()
  loading.value = false
})
</script>
