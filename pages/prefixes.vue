<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">
        <i class="fas fa-broadcast-tower mr-2"></i>
        网络前缀公告
      </h1>

      <p class="mb-6 text-gray-600 dark:text-gray-400">
        查看 AS213605 (Pysio Networks) 公告的网络前缀信息，包括 IPv4 和 IPv6 地址块的详细信息。
      </p>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="mt-4 text-gray-600 dark:text-gray-400">正在获取前缀数据...</p>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="alert alert-error mb-6">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ error }}</span>
      </div>

      <!-- 前缀数据展示 -->
      <div v-if="prefixData && !loading" class="space-y-6">
        <!-- 统计信息 -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition duration-300 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-globe text-blue-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-blue-800 dark:text-blue-200">IPv4 前缀</h3>
            </div>
            <div class="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {{ prefixData.ipv4_prefixes.length }}
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition duration-300 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-network-wired text-green-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-green-800 dark:text-green-200">IPv6 前缀</h3>
            </div>
            <div class="text-2xl font-bold text-green-900 dark:text-green-300">
              {{ prefixData.ipv6_prefixes.length }}
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition duration-300 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-shield-alt text-purple-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-purple-800 dark:text-purple-200">ROA 验证</h3>
            </div>
            <div class="text-2xl font-bold text-purple-900 dark:text-purple-300">
              {{ validRoaCount }}
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition duration-300 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-flag text-orange-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-orange-800 dark:text-orange-200">国家/地区</h3>
            </div>
            <div class="text-2xl font-bold text-orange-900 dark:text-orange-300">
              {{ uniqueCountries.length }}
            </div>
          </div>
        </div>

        <!-- IPv4 前缀列表 -->
        <div v-if="prefixData.ipv4_prefixes.length > 0"
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold mb-4 flex items-center">
            <i class="fas fa-globe mr-2 text-blue-500"></i>
            IPv4 前缀
          </h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="text-left py-3 px-4">前缀</th>
                  <th class="text-left py-3 px-4">名称</th>
                  <th class="text-left py-3 px-4">描述</th>
                  <th class="text-left py-3 px-4">国家</th>
                  <th class="text-left py-3 px-4">ROA 状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prefix in prefixData.ipv4_prefixes" :key="prefix.prefix"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="py-3 px-4">
                    <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      {{ prefix.prefix }}
                    </code>
                  </td>
                  <td class="py-3 px-4">{{ prefix.name || '-' }}</td>
                  <td class="py-3 px-4">{{ prefix.description || '-' }}</td>
                  <td class="py-3 px-4">
                    <span v-if="prefix.country_code" class="flex items-center gap-2">
                      <span :class="`fi fi-${prefix.country_code.toLowerCase()}`"></span>
                      {{ prefix.country_code }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded text-xs font-medium" :class="getRoaStatusClass(prefix.roa_status)">
                      {{ prefix.roa_status || 'Unknown' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- IPv6 前缀列表 -->
        <div v-if="prefixData.ipv6_prefixes.length > 0"
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold mb-4 flex items-center">
            <i class="fas fa-network-wired mr-2 text-green-500"></i>
            IPv6 前缀
          </h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="text-left py-3 px-4">前缀</th>
                  <th class="text-left py-3 px-4">名称</th>
                  <th class="text-left py-3 px-4">描述</th>
                  <th class="text-left py-3 px-4">国家</th>
                  <th class="text-left py-3 px-4">ROA 状态</th>
                  <th class="text-left py-3 px-4">父前缀</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prefix in prefixData.ipv6_prefixes" :key="prefix.prefix"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="py-3 px-4">
                    <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      {{ prefix.prefix }}
                    </code>
                  </td>
                  <td class="py-3 px-4">{{ prefix.name || '-' }}</td>
                  <td class="py-3 px-4">{{ prefix.description || '-' }}</td>
                  <td class="py-3 px-4">
                    <span v-if="prefix.country_code" class="flex items-center gap-2">
                      <span :class="`fi fi-${prefix.country_code.toLowerCase()}`"></span>
                      {{ prefix.country_code }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded text-xs font-medium" :class="getRoaStatusClass(prefix.roa_status)">
                      {{ prefix.roa_status || 'Unknown' }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span v-if="prefix.parent" class="text-sm text-gray-600 dark:text-gray-400">
                      <code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                        {{ prefix.parent.prefix }}
                      </code>
                      <br>
                      <span class="text-xs">{{ prefix.parent.rir_name }}</span>
                    </span>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 数据源信息 -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-info-circle"></i>
            <span class="font-medium">数据源信息</span>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <strong>API 版本:</strong> {{ apiMeta.api_version }}
            </div>
            <div>
              <strong>执行时间:</strong> {{ apiMeta.execution_time }}
            </div>
            <div>
              <strong>时区:</strong> {{ apiMeta.time_zone }}
            </div>
            <div>
              <strong>数据提供:</strong> <a href="https://bgpview.io" target="_blank"
                class="text-blue-500 hover:text-blue-600">BGPView.io</a>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Cache } from '~/utils/cache'

definePageMeta({
  layout: 'default'
})

// 接口定义
interface PrefixData {
  prefix: string
  ip: string
  cidr: number
  roa_status: string
  name: string
  description: string
  country_code: string
  parent?: {
    prefix: string
    ip: string
    cidr: number
    rir_name: string
    allocation_status: string
  }
}

interface ApiResponse {
  status: string
  status_message: string
  data: {
    ipv4_prefixes: PrefixData[]
    ipv6_prefixes: PrefixData[]
  }
  '@meta': {
    time_zone: string
    api_version: number
    execution_time: string
  }
}

// 响应式数据
const loading = ref(false)
const error = ref('')
const prefixData = ref<ApiResponse['data'] | null>(null)
const apiMeta = ref<ApiResponse['@meta']>({
  time_zone: 'UTC',
  api_version: 1,
  execution_time: '0 ms'
})

// 计算属性
const validRoaCount = computed(() => {
  if (!prefixData.value) return 0
  const ipv4Valid = prefixData.value.ipv4_prefixes.filter(p => p.roa_status === 'Valid').length
  const ipv6Valid = prefixData.value.ipv6_prefixes.filter(p => p.roa_status === 'Valid').length
  return ipv4Valid + ipv6Valid
})

const uniqueCountries = computed(() => {
  if (!prefixData.value) return []
  const countries = new Set<string>()
  prefixData.value.ipv4_prefixes.forEach(p => p.country_code && countries.add(p.country_code))
  prefixData.value.ipv6_prefixes.forEach(p => p.country_code && countries.add(p.country_code))
  return Array.from(countries)
})

// 获取 ROA 状态样式
const getRoaStatusClass = (status: string) => {
  const classes = {
    'Valid': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    'Invalid': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    'NotFound': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    'Unknown': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }
  return classes[status as keyof typeof classes] || classes.Unknown
}

// 获取前缀数据
const fetchPrefixData = async () => {
  const cacheKey = 'prefix_data_213605'

  // 检查缓存
  const cachedData = Cache.get<ApiResponse>(cacheKey)
  if (cachedData) {
    prefixData.value = cachedData.data
    apiMeta.value = cachedData['@meta']
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch('https://cdn.akaere.online/https://api.bgpview.io/asn/213605/prefixes')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data: ApiResponse = await response.json()

    if (data.status !== 'ok') {
      throw new Error(data.status_message || '获取数据失败')
    }

    prefixData.value = data.data
    apiMeta.value = data['@meta']

    // 缓存数据 1 小时
    Cache.set(cacheKey, data, 60 * 60 * 1000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取前缀数据失败'
    console.error('获取前缀数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchPrefixData()
})
</script>

<style scoped>
@reference "tailwindcss";

.prose code {
  @apply text-sm;
}

.table {
  @apply border-collapse;
}

.table th,
.table td {
  @apply border-b border-gray-200 dark:border-gray-700;
}

.table-zebra tbody tr:nth-child(even) {
  @apply bg-gray-50 dark:bg-gray-700/50;
}

.fi {
  @apply w-4 h-4 inline-block;
}
</style>
