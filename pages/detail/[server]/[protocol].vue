<template>
  <div class="container mx-auto p-4">
    <!-- 头部导航和标题区域 -->
    <div class="mb-6 flex flex-wrap items-center gap-4 bg-opacity-50 bg-base-200 p-4 rounded-xl backdrop-blur-sm">
      <NuxtLink to="/lg" class="btn btn-ghost btn-sm gap-2 hover:bg-opacity-50 hover:bg-base-300">
        <i class="fas fa-arrow-left"></i>
        返回
      </NuxtLink>
      <div class="flex-1">
        <h2 class="text-xl font-bold">{{ $route.params.server }}</h2>
        <p class="text-sm opacity-70 text-base-content">show protocols all {{ $route.params.protocol }}</p>
      </div>
      <div class="join">
        <button 
          class="join-item btn btn-sm"
          :class="!showAnalysis ? 'btn-primary' : 'btn-ghost hover:bg-opacity-50 hover:bg-base-300'"
          @click="() => (showAnalysis = false)"
          :disabled="loading"
        >
          <i class="fas fa-code mr-2"></i>
          原始数据
        </button>
        <button 
          class="join-item btn btn-sm"
          :class="showAnalysis ? 'btn-primary' : 'btn-ghost hover:bg-opacity-50 hover:bg-base-300'"
          @click="() => (showAnalysis = true)"
          :disabled="loading"
        >
          <i class="fas fa-chart-line mr-2"></i>
          分析视图
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="card bg-opacity-50 bg-base-100 shadow-xl backdrop-blur-sm">
      <div class="card-body">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div class="loading loading-spinner loading-lg text-primary"></div>
          <span class="ml-2 opacity-70 text-base-content">正在获取详情...</span>
        </div>
        
        <!-- 错误信息 -->
        <div v-else-if="errorMessage" class="alert alert-error">
          <i class="fas fa-exclamation-circle"></i>
          <pre class="text-sm">{{ errorMessage }}</pre>
        </div>
        
        <!-- 分析视图 -->
        <div v-else-if="showAnalysis" class="space-y-6">
          <!-- 基本信息卡片 -->
          <div class="rounded-box bg-opacity-50 bg-base-200 p-6 backdrop-blur-sm">
            <h3 class="flex items-center gap-2 text-lg font-bold mb-4">
              <i class="fas fa-info-circle text-primary"></i>
              基本信息
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="(value, key) in analyzedData.basic" 
                  :key="key" 
                  class="flex items-center justify-between p-3 rounded-lg bg-opacity-30 bg-base-100 hover:bg-opacity-30 hover:bg-base-300 transition-colors">
                <span class="font-medium opacity-70 text-base-content">{{ key }}</span>
                <span class="font-mono text-primary">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- 路由统计表格 -->
          <div class="rounded-box bg-opacity-50 bg-base-200 p-6 backdrop-blur-sm">
            <h3 class="flex items-center gap-2 text-lg font-bold mb-4">
              <i class="fas fa-chart-bar text-primary"></i>
              路由统计
            </h3>
            <div class="overflow-x-auto">
              <table class="table table-zebra w-full">
                <thead>
                  <tr>
                    <th class="bg-opacity-50 bg-base-300 font-bold">类型</th>
                    <th class="bg-opacity-50 bg-base-300 text-right">接收</th>
                    <th class="bg-opacity-50 bg-base-300 text-right">拒绝</th>
                    <th class="bg-opacity-50 bg-base-300 text-right">过滤</th>
                    <th class="bg-opacity-50 bg-base-300 text-right">忽略</th>
                    <th class="bg-opacity-50 bg-base-300 text-right">接受</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(stats, type) in analyzedData.routeStats" :key="type">
                    <td class="font-medium bg-opacity-30 bg-base-100">{{ formatStatType(type) }}</td>
                    <td class="text-right font-mono bg-opacity-30 bg-base-100">{{ formatNumber(stats.received) }}</td>
                    <td class="text-right font-mono bg-opacity-30 bg-base-100">{{ formatNumber(stats.rejected) }}</td>
                    <td class="text-right font-mono bg-opacity-30 bg-base-100">{{ formatNumber(stats.filtered) }}</td>
                    <td class="text-right font-mono bg-opacity-30 bg-base-100">{{ formatNumber(stats.ignored) }}</td>
                    <td class="text-right font-mono bg-opacity-30 bg-base-100">{{ formatNumber(stats.accepted) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 原始数据 -->
        <pre v-else class="whitespace-pre-wrap text-sm font-mono bg-opacity-30 bg-base-200 p-4 rounded-lg">{{ protocolDetails }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cache, type ApiResponse, type ApiResultPair } from '~/utils/cache'

interface AnalyzedData {
  basic: {
    [key: string]: string;
  };
  routeStats: {
    [key: string]: {
      received?: string;
      rejected?: string;
      filtered?: string;
      ignored?: string;
      accepted?: string;
    };
  };
}

const route = useRoute()
const protocolDetails = ref('')
const errorMessage = ref('')
const loading = ref(false)
const showAnalysis = ref(false)
const analyzedData = ref<AnalyzedData>({
  basic: {},
  routeStats: {}
})
const apiUrl = 'https://lg.pysio.online/api/'

// 格式化统计类型名称
const formatStatType = (type: string | number): string => {
  const typeMap: { [key: string]: string } = {
    'Import updates': '导入更新',
    'Import withdraws': '导入撤回',
    'Export updates': '导出更新',
    'Export withdraws': '导出撤回',
    'BGP Next hop': 'BGP下一跳',
    'IGP IPv6 table': 'IGP IPv6表'
  }
  return typeMap[String(type)] || String(type)
}

// 格式化数字
const formatNumber = (value?: string): string => {
  if (!value || value === '---') return '---'
  const num = parseInt(value)
  if (isNaN(num)) return value
  return num.toLocaleString()
}

const analyzeBGPDetails = (details: string) => {
  const lines = details.split('\n')
  const analyzed: AnalyzedData = {
    basic: {},
    routeStats: {}
  }

  let currentSection = ''
  let inRouteStats = false

  lines.forEach(line => {
    line = line.trim()
    
    // 基本信息解析
    if (line.startsWith('BGP state:')) {
      analyzed.basic['BGP状态'] = line.split(':')[1].trim()
    } else if (line.startsWith('Neighbor address:')) {
      analyzed.basic['邻居地址'] = line.split(':')[1].trim()
    } else if (line.startsWith('Neighbor AS:')) {
      analyzed.basic['邻居AS'] = line.split(':')[1].trim()
    } else if (line.startsWith('Local AS:')) {
      analyzed.basic['本地AS'] = line.split(':')[1].trim()
    } else if (line.startsWith('Neighbor ID:')) {
      analyzed.basic['邻居ID'] = line.split(':')[1].trim()
    }

    // 路由统计解析
    if (line.includes('Route change stats:')) {
      inRouteStats = true
    } else if (inRouteStats && line.includes(':')) {
      const [type, stats] = line.split(':').map(s => s.trim())
      if (stats) {
        const values = stats.split(/\s+/).filter(v => v !== '')
        analyzed.routeStats[type] = {
          received: values[0],
          rejected: values[1],
          filtered: values[2],
          ignored: values[3],
          accepted: values[4]
        }
      }
    } else if (inRouteStats && !line.includes(':') && line !== '') {
      inRouteStats = false
    }
  })

  return analyzed
}

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
      // 立即解析缓存数据
      analyzedData.value = analyzeBGPDetails(cachedData);
      return;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: [route.params.server],
        type: 'bird',
        args: `show protocols all ${route.params.protocol}`
      })
    })
    const data = await response.json() as ApiResponse<ApiResultPair>;
    if (data.error) {
      errorMessage.value = data.error;
      return;
    }
    if (data.result && data.result.length > 0) {
      protocolDetails.value = data.result[0].data;
      // 立即解析新数据
      analyzedData.value = analyzeBGPDetails(data.result[0].data);
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

<style lang="postcss" scoped>
.card {
  border: 1px solid rgba(var(--b3), 0.2);
}

.rounded-box {
  border-radius: 0.75rem;
  border: 1px solid rgba(var(--b3), 0.2);
}

.table {
  font-size: 0.875rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th {
  color: rgba(var(--bc), 0.7);
}

.table th:first-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.table th:last-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.table td {
  border-color: rgba(var(--b3), 0.2);
}

.table-zebra tbody tr:nth-child(even) td {
  background-color: rgba(var(--b2), 0.3);
}

/* 确保表格在移动设备上可以水平滚动 */
.overflow-x-auto {
  border-radius: 0.5rem;
  border: 1px solid rgba(var(--b3), 0.2);
  -webkit-overflow-scrolling: touch;
}
</style>
