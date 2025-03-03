<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">BMCLAPI 节点状态</h1>

      <!-- 搜索框 -->
      <div class="mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索节点名称..."
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
          <span class="absolute right-3 top-2.5 text-gray-400">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <template v-else>
        <!-- 状态概览卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-2">活跃节点</h3>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400">
              {{ activeNodes }}
              <span class="text-base font-normal text-gray-600 dark:text-gray-400">个</span>
            </p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-2">总流量</h3>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {{ formatBytes(totalBytes) }}
            </p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-2">总请求数</h3>
            <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatNumber(totalHits) }}
            </p>
          </div>
        </div>

        <!-- 节点列表 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">节点排名</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">排名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">节点名称</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">赞助商</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">流量</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">请求数</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(node, index) in filteredNodes" :key="node._id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" @click="openNodeDetails(node)">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <span :class="{
                          'text-yellow-500': !searchQuery && index === 0,
                          'text-gray-400': !searchQuery && index === 1,
                          'text-amber-600': !searchQuery && index === 2,
                          'text-gray-600 dark:text-gray-400': searchQuery || index > 2
                        }">
                          <i v-if="!searchQuery && index < 3" class="fas fa-trophy mr-2"></i>
                          {{ searchQuery ? index + 1 : index + 1 }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium">{{ node.name }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div v-if="node.sponsor" class="flex items-center">
                        <a :href="node.sponsor.url" target="_blank" 
                           class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          {{ node.sponsor.name }}
                        </a>
                      </div>
                      <div v-else class="text-sm text-gray-500 dark:text-gray-400">-</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm">{{ formatBytes(node.metric?.bytes || 0) }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm">{{ formatNumber(node.metric?.hits || 0) }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span :class="{
                        'px-2 py-1 text-xs font-medium rounded-full': true,
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400': node.isEnabled,
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400': !node.isEnabled
                      }">
                        {{ node.isEnabled ? '运行中' : '已停止' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 更新时间 -->
        <div class="mt-4 text-right text-sm text-gray-500 dark:text-gray-400">
          最后更新时间: {{ formatDate(lastUpdate) }}
        </div>
      </template>

      <!-- 节点详情弹窗 -->
      <div v-if="showNodeDetails" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           @click="showNodeDetails = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
             @click.stop>
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-2xl font-bold">{{ selectedNode?.name }}</h3>
              <button @click="showNodeDetails = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="space-y-4" v-if="selectedNode">
              <!-- 基本信息 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">节点状态</h4>
                  <p class="mt-1">
                    <span :class="{
                      'px-2 py-1 text-xs font-medium rounded-full': true,
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400': selectedNode.isEnabled,
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400': !selectedNode.isEnabled
                    }">
                      {{ selectedNode.isEnabled ? '运行中' : '已停止' }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- 运营者信息 -->
              <div>
                <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">运营信息</h4>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded p-4 space-y-2">
                  <div class="flex items-center">
                  </div>
                  <div v-if="selectedNode?.sponsor" class="flex items-center">
                    <span class="text-gray-600 dark:text-gray-400 w-24">赞助商：</span>
                    <div class="flex items-center">
                      <img v-if="selectedNode.sponsor.banner" 
                           :src="selectedNode.sponsor.banner" 
                           :alt="selectedNode.sponsor.name"
                           class="h-6 w-6 rounded-full mr-2">
                      <a :href="selectedNode.sponsor.url" 
                         target="_blank" 
                         class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        {{ selectedNode.sponsor.name }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 统计信息 -->
              <div>
                <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">统计信息</h4>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded p-4 space-y-2">
                  <div class="flex items-center">
                    <span class="text-gray-600 dark:text-gray-400 w-24">总流量：</span>
                    <span>{{ formatBytes(selectedNode.metric?.bytes || 0) }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-600 dark:text-gray-400 w-24">总请求数：</span>
                    <span>{{ formatNumber(selectedNode.metric?.hits || 0) }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-600 dark:text-gray-400 w-24">统计日期：</span>
                    <span>{{ selectedNode.metric ? formatDate(new Date(selectedNode.metric.date)) : '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- 历史流量图表 -->
              <div>
                <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">历史流量统计</h4>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded p-4">
                  <div v-if="isLoadingHistory" class="flex justify-center items-center h-[400px]">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                  <div v-else 
                       ref="chartRef" 
                       class="h-[400px] w-full"
                       :key="'chart-' + selectedNode?._id"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
import { useHead } from 'unhead'

definePageMeta({
  layout: 'default'
})

// 添加 SEO meta 信息
useHead({
  title: 'BMCLAPI 节点状态 - Pysio Networks',
  meta: [
    {
      name: 'description',
      content: 'BMCLAPI 节点状态实时监控面板，提供节点排名、流量统计、历史数据分析等功能。'
    },
    {
      name: 'keywords',
      content: 'BMCLAPI, 节点状态, 流量统计, Minecraft, 下载加速, 镜像服务'
    },
    // Open Graph
    {
      property: 'og:title',
      content: 'BMCLAPI 节点状态 - Pysio Networks'
    },
    {
      property: 'og:description',
      content: 'BMCLAPI 节点状态实时监控面板，提供节点排名、流量统计、历史数据分析等功能。'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: 'https://anycast.ink/openbmclapi'
    },
    // Twitter Card
    {
      name: 'twitter:card',
      content: 'summary'
    },
    {
      name: 'twitter:title',
      content: 'BMCLAPI 节点状态 - Pysio Networks'
    },
    {
      name: 'twitter:description',
      content: 'BMCLAPI 节点状态实时监控面板，提供节点排名、流量统计、历史数据分析等功能。'
    }
  ]
})

// 客户端导入 echarts
let echarts: any = null
if (process.client) {
  echarts = await import('echarts')
}

interface Sponsor {
  name: string
  url: string
  banner: string
}

interface Metric {
  bytes: number
  hits: number
  date: string
}

interface HistoryMetric {
  _id: string
  clusterId: string
  date: string
  bytes: number
  hits: number
}

interface Node {
  _id: string
  name: string
  isEnabled: boolean
  sponsor?: Sponsor
  metric: Metric
}

const nodes = ref<Node[]>([])
const lastUpdate = ref(new Date())
const selectedNode = ref<Node | null>(null)
const showNodeDetails = ref(false)
const chartRef = ref<HTMLElement | null>(null)
const chart = ref<any>(null)
const historyData = ref<HistoryMetric[]>([])
const isLoading = ref(true)
const isLoadingHistory = ref(false)
const searchQuery = ref('')

// 过滤节点
const filteredNodes = computed(() => {
  if (!searchQuery.value) return nodes.value
  const query = searchQuery.value.toLowerCase()
  return nodes.value.filter(node => 
    node.name.toLowerCase().includes(query)
  )
})

// 计算活跃节点数
const activeNodes = computed(() => {
  return filteredNodes.value.filter(node => node.isEnabled).length
})

// 计算总流量
const totalBytes = computed(() => {
  return filteredNodes.value.reduce((sum, node) => sum + (node.metric?.bytes || 0), 0)
})

// 计算总请求数
const totalHits = computed(() => {
  return filteredNodes.value.reduce((sum, node) => sum + (node.metric?.hits || 0), 0)
})

// 格式化字节数
const formatBytes = (bytes: number) => {
  if (typeof window === 'undefined') return '0 B' // 服务端渲染时返回默认值
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 格式化数字（添加千位分隔符）
const formatNumber = (num: number) => {
  if (typeof window === 'undefined') return '0' // 服务端渲染时返回默认值
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化日期
const formatDate = (date: Date) => {
  if (typeof window === 'undefined') return '-' // 服务端渲染时返回默认值
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}

// 获取节点数据
const fetchNodes = async () => {
  isLoading.value = true
  try {
    const response = await fetch('https://bmclapiii.akaere.online/')
    const data = await response.json()
    nodes.value = data
    lastUpdate.value = new Date()
  } catch (error) {
    console.error('获取节点数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 获取历史数据
const fetchHistoryData = async (nodeId: string) => {
  isLoadingHistory.value = true
  try {
    const response = await fetch(`https://bmclapiii.akaere.online/metric/cluster/${nodeId}`)
    const data = await response.json()
    historyData.value = data
    // 等待数据加载完成后再更新图表
    await nextTick()
    updateChart()
  } catch (error) {
    console.error('获取历史数据失败:', error)
  } finally {
    isLoadingHistory.value = false
  }
}

// 更新图表
const updateChart = async () => {
  if (!chartRef.value) return
  
  try {
    // 确保 echarts 已加载
    if (!echarts) {
      echarts = await import('echarts')
    }

    // 销毁旧的图表实例
    if (chart.value) {
      chart.value.dispose()
      chart.value = null
    }

    // 等待 DOM 更新完成
    await nextTick()
    
    // 确保容器存在且有尺寸
    if (!chartRef.value.offsetHeight || !chartRef.value.offsetWidth) {
      console.error('Chart container has no dimensions')
      return
    }

    // 创建新的图表实例
    chart.value = echarts.init(chartRef.value)

    const dates = historyData.value.map(item => formatDate(new Date(item.date)))
    const bytesData = historyData.value.map(item => item.bytes)
    const hitsData = historyData.value.map(item => item.hits)

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['流量', '请求数'],
        textStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
          color: '#666'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '流量',
          axisLabel: {
            formatter: (value: number) => formatBytes(value),
            color: '#666'
          },
          nameTextStyle: {
            color: '#666'
          }
        },
        {
          type: 'value',
          name: '请求数',
          axisLabel: {
            formatter: (value: number) => formatNumber(value),
            color: '#666'
          },
          nameTextStyle: {
            color: '#666'
          }
        }
      ],
      series: [
        {
          name: '流量',
          type: 'line',
          smooth: true,
          data: bytesData,
          yAxisIndex: 0,
          itemStyle: {
            color: '#3B82F6'
          }
        },
        {
          name: '请求数',
          type: 'line',
          smooth: true,
          data: hitsData,
          yAxisIndex: 1,
          itemStyle: {
            color: '#8B5CF6'
          }
        }
      ]
    }

    // 设置图表配置
    chart.value.setOption(option)
    
    // 添加自动调整大小
    window.addEventListener('resize', () => chart.value?.resize())
  } catch (error) {
    console.error('图表渲染失败:', error)
  }
}

// 修改 openNodeDetails 函数
const openNodeDetails = (node: Node) => {
  console.log('Opening node details:', node)
  selectedNode.value = node
  showNodeDetails.value = true
  // 获取历史数据
  fetchHistoryData(node._id)
}

// 监听弹窗状态变化
watch(showNodeDetails, async (newValue) => {
  if (!newValue && chart.value) {
    // 当弹窗关闭时，销毁图表实例
    chart.value.dispose()
    chart.value = null
  } else if (newValue && selectedNode.value) {
    // 当弹窗打开时，重新获取数据
    await fetchHistoryData(selectedNode.value._id)
  }
})

// 组件卸载时清理
onUnmounted(() => {
  if (chart.value) {
    chart.value.dispose()
    chart.value = null
  }
  // 移除resize监听器
  window.removeEventListener('resize', () => chart.value?.resize())
})

onMounted(() => {
  fetchNodes()
})
</script>

<style scoped>
.prose :where(h1):not(:where([class~="not-prose"] *)) {
  margin-bottom: 1.5rem;
}
</style> 