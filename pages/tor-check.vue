<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">Tor 节点查询</h1>

      <!-- 搜索框 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="输入IP地址..."
              class="input input-bordered w-full"
              @keyup.enter="searchNode"
            />
          </div>
          <button
            @click="searchNode"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <i class="fas fa-search mr-2"></i>
            {{ isLoading ? '查询中...' : '查询' }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <div class="loading loading-spinner loading-lg"></div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="alert alert-error mb-8">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span>{{ error }}</span>
      </div>

      <!-- 查询结果 -->
      <div v-if="nodeInfo && !isLoading">
        <!-- 状态横幅 -->
        <div :class="[
          'mb-8 rounded-lg border p-4',
          nodeInfo.isNode 
            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
        ]">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <i :class="[
                'text-xl',
                nodeInfo.isNode 
                  ? 'text-green-600 dark:text-green-400 fas fa-check-circle' 
                  : 'text-yellow-600 dark:text-yellow-400 fas fa-exclamation-triangle'
              ]"></i>
            </div>
            <div class="ml-3">
              <h3 :class="[
                'text-base font-semibold',
                nodeInfo.isNode 
                  ? 'text-green-800 dark:text-green-300' 
                  : 'text-yellow-800 dark:text-yellow-300'
              ]">
                {{ nodeInfo.isNode ? '这是一个Tor节点' : '这不是一个Tor节点' }}
              </h3>
              <div :class="[
                'mt-1 text-sm',
                nodeInfo.isNode 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-yellow-700 dark:text-yellow-300'
              ]">
                {{ nodeInfo.isNode 
                  ? `这是一个${getNodeType(nodeInfo.flags)}节点` 
                  : '该IP地址未在Tor网络中注册' 
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- 详细信息卡片 -->
        <div v-if="nodeInfo.isNode" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold">{{ nodeInfo.nickname }}</h2>
              <p class="text-gray-600 dark:text-gray-400">指纹: {{ nodeInfo.fingerprint }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <i class="fas fa-code-branch mr-1"></i>
                版本 {{ nodeInfo.version }}
                <span :class="[
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  nodeInfo.recommended_version ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                ]">
                  {{ nodeInfo.version_status }}
                </span>
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="flag in nodeInfo.flags" :key="flag" 
                    class="bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full text-sm flex items-center">
                <img 
                  :src="getFlagIconUrl(flag)" 
                  :alt="flag"
                  @error="handleFlagIconError($event, flag)"
                  class="w-4 h-4 mr-1.5 flag-icon"
                >
                <span class="text-green-800 dark:text-green-200">{{ flag }}</span>
              </span>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- 节点详细信息 -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold mb-2">节点信息</h3>
                <ul class="space-y-2">
                  <li class="flex items-center">
                    <i class="fas fa-tachometer-alt mr-2 w-6"></i>
                    <span>观察带宽: {{ formatBandwidth(nodeInfo.observed_bandwidth) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-broadcast-tower mr-2 w-6"></i>
                    <span>广播带宽: {{ formatBandwidth(nodeInfo.advertised_bandwidth) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-bolt mr-2 w-6"></i>
                    <span>带宽限制: {{ formatBandwidth(nodeInfo.bandwidth_rate) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-network-wired mr-2 w-6"></i>
                    <span>IPv4: {{ nodeInfo.or_addresses?.[0] }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-network-wired mr-2 w-6"></i>
                    <span>IPv6: {{ nodeInfo.or_addresses?.[1] }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-map-marker-alt mr-2 w-6"></i>
                    <span>位置: {{ nodeInfo.country_name }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-building mr-2 w-6"></i>
                    <span>AS: {{ nodeInfo.as }} ({{ nodeInfo.as_name }})</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-envelope mr-2 w-6"></i>
                    <span>联系方式: {{ nodeInfo.contact }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 运行状态 -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold mb-2">运行状态</h3>
                <ul class="space-y-2">
                  <li class="flex items-center">
                    <i class="fas fa-percentage mr-2 w-6"></i>
                    <span>出口概率: {{ formatPercentage(nodeInfo.exit_probability) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-shield-alt mr-2 w-6"></i>
                    <span>守卫概率: {{ formatPercentage(nodeInfo.guard_probability) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-exchange-alt mr-2 w-6"></i>
                    <span>中继概率: {{ formatPercentage(nodeInfo.middle_probability) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-weight mr-2 w-6"></i>
                    <span>共识权重: {{ nodeInfo.consensus_weight }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-balance-scale mr-2 w-6"></i>
                    <span>权重占比: {{ formatPercentage(nodeInfo.consensus_weight_fraction) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-clock mr-2 w-6"></i>
                    <span>首次发现: {{ formatDate(nodeInfo.first_seen) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-sync mr-2 w-6"></i>
                    <span>最后更新: {{ formatDate(nodeInfo.last_seen) }}</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-redo mr-2 w-6"></i>
                    <span>最后重启: {{ formatDate(nodeInfo.last_restarted) }}</span>
                  </li>
                </ul>
              </div>

              <!-- 出口策略 -->
              <div v-if="nodeInfo.exit_policy_summary">
                <h3 class="text-lg font-semibold mb-2">出口策略</h3>
                <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <h4 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">拒绝端口</h4>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="port in nodeInfo.exit_policy_summary.reject" :key="port"
                          class="px-2 py-0.5 bg-red-100 dark:bg-red-800/30 rounded text-red-800 dark:text-red-200 text-sm">
                      {{ port }}
                    </span>
                  </div>
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
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

const searchQuery = ref('')
const isLoading = ref(false)
const error = ref('')
const nodeInfo = ref<any>(null)

// 格式化带宽
const formatBandwidth = (bytes: number) => {
  if (!bytes) return '0 B/s'
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GiB/s`
  }
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MiB/s`
}

// 格式化百分比
const formatPercentage = (value: number) => {
  if (!value) return '0%'
  return `${(value * 100).toFixed(4)}%`
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
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

// 查询节点信息
const searchNode = async () => {
  if (!searchQuery.value) {
    error.value = '请输入IP地址'
    return
  }

  isLoading.value = true
  error.value = ''
  nodeInfo.value = null

  try {
    // 尝试主要API
    let response = await fetch(`https://onionoo.torproject.org/details?search=${searchQuery.value}`)
    
    // 如果主要API失败，尝试备用API
    if (!response.ok) {
      response = await fetch(`https://cdn.akaere.online/https://onionoo.torproject.org/details?search=${searchQuery.value}`)
    }

    if (!response.ok) {
      throw new Error('API请求失败')
    }

    const data = await response.json()
    
    if (data.relays && data.relays.length > 0) {
      nodeInfo.value = {
        isNode: true,
        ...data.relays[0]
      }
    } else {
      nodeInfo.value = {
        isNode: false
      }
    }
  } catch (e) {
    error.value = '查询失败，请稍后重试'
    console.error('查询失败:', e)
  } finally {
    isLoading.value = false
  }
}

// 获取节点类型
const getNodeType = (flags: string[]) => {
  if (!flags) return '未知'
  
  const types = []
  if (flags.includes('Exit')) types.push('出口')
  if (flags.includes('Guard')) types.push('守卫')
  if (!flags.includes('Exit') && !flags.includes('Guard')) types.push('中继')
  
  return types.join('、') || '未知'
}

// 获取 Flag 图标 URL
const getFlagIconUrl = (flag: string) => {
  const flagName = flag.toLowerCase()
  const primaryUrl = `https://metrics.torproject.org/images/flags/${flagName}.png`
  return primaryUrl
}

// 处理图标加载失败，切换到备用地址
const handleFlagIconError = (event: Event, flag: string) => {
  const img = event.target as HTMLImageElement
  if (img) {
    const flagName = flag.toLowerCase()
    const backupUrl = `https://cdn.akaere.online/https://metrics.torproject.org/images/flags/${flagName}.png`
    
    // 如果当前不是备用地址，则切换到备用地址
    if (!img.src.includes('cdn.akaere.online')) {
      img.src = backupUrl
    }
  }
}

// 获取节点角色描述
const getRoleDescription = (flags: string[]) => {
  if (!flags) return ''
  
  const roles = []
  if (flags.includes('Exit')) roles.push('可以作为出口节点，允许流量离开Tor网络')
  if (flags.includes('Guard')) roles.push('作为守卫节点，是进入Tor网络的第一跳')
  if (flags.includes('Fast')) roles.push('这是一个高速节点')
  if (flags.includes('Stable')) roles.push('这是一个稳定的节点')
  if (flags.includes('Running')) roles.push('节点当前正在运行')
  if (flags.includes('V2Dir')) roles.push('支持V2目录协议')
  if (flags.includes('Valid')) roles.push('这是一个有效的节点')
  if (flags.includes('HSDir')) roles.push('作为隐藏服务目录')
  
  return roles.join('；')
}
</script>

<style scoped>
.alert {
  backdrop-filter: blur(8px);
}

.flag-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
</style> 