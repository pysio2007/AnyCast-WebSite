<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-8">
      来自 {{ organization }} 欢迎来到 Pysio's Networks
    </h1>

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
import { ref } from 'vue'
import { useFetch, useAsyncData } from 'nuxt/app'

// 使用服务端渲染获取IP信息
const organization = ref('')

async function fetchOrganizationData() {
  try {
    // 使用Nuxt的useFetch在服务端获取数据
    const { data } = await useFetch('https://ip.akaere.online/')
    return data.value?.org || '未知组织'
  } catch (error) {
    console.error('Error fetching IP data:', error)
    return '未知组织'
  }
}

// 使用Nuxt的useAsyncData来处理服务端数据获取
const { data: orgData } = await useAsyncData('organization', () => fetchOrganizationData())
organization.value = orgData.value
</script>
