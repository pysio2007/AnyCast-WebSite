<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">Tor 中继节点服务</h1>

      <!-- 节点基本信息卡片 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold">{{ metrics.nickname || 'AkaereTor' }}</h2>
            <p class="text-gray-600 dark:text-gray-400">指纹: {{ metrics.fingerprint || '2F59BA21B8D07BE11FCD50C731CA5CAB638F624B' }}</p>
          </div>
          <div class="flex gap-2">
            <span v-for="flag in metrics.flags || defaultFlags" :key="flag" 
                  class="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-sm flex items-center">
              <img 
                :src="getFlagIconUrl(flag)" 
                :alt="flag"
                @error="handleFlagIconError($event, flag)"
                class="w-4 h-4 mr-1.5"
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
              <div v-if="metricsLoading" class="animate-pulse space-y-2">
                <div v-for="i in 8" :key="i" class="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <ul v-else class="space-y-2">
                <li class="flex items-center">
                  <i class="fas fa-tachometer-alt mr-2 w-6"></i>
                  <span>带宽限制: {{ formatBandwidth(metrics.bandwidth_rate) }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-bolt mr-2 w-6"></i>
                  <span>突发带宽: {{ formatBandwidth(metrics.bandwidth_burst) }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-server mr-2 w-6"></i>
                  <span>观察带宽: {{ formatBandwidth(metrics.observed_bandwidth) }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-broadcast-tower mr-2 w-6"></i>
                  <span>广播带宽: {{ formatBandwidth(metrics.advertised_bandwidth) }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-network-wired mr-2 w-6"></i>
                  <span>IPv4: {{ metrics.or_addresses?.[0] || '104.244.74.229:9001' }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-network-wired mr-2 w-6"></i>
                  <span>IPv6: {{ metrics.or_addresses?.[1] || '[2605:6400:30:f91b:8124:6a51:9ea2:5d13]:9001' }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-map-marker-alt mr-2 w-6"></i>
                  <span>位置: {{ metrics.country_name || '卢森堡' }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-building mr-2 w-6"></i>
                  <span>AS: {{ metrics.as }} ({{ metrics.as_name }})</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-envelope mr-2 w-6"></i>
                  <span>联系方式: {{ metrics.contact || 'noreply@pysio.shop' }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- 运行状态 -->
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">运行状态</h3>
              <div v-if="metricsLoading" class="animate-pulse space-y-2">
                <div v-for="i in 5" :key="i" class="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <ul v-else class="space-y-2">
                <li class="flex items-center">
                  <i class="fas fa-clock mr-2 w-6"></i>
                  <span>运行时间: {{ calculateUptime(metrics.last_restarted) }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-calendar mr-2 w-6"></i>
                  <span>首次发现: {{ formatDate(metrics.first_seen) }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-sync mr-2 w-6"></i>
                  <span>最后重启: {{ formatDate(metrics.last_restarted) }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-weight mr-2 w-6"></i>
                  <span>共识权重: {{ metrics.consensus_weight }}</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-microchip mr-2 w-6"></i>
                  <span>平台: {{ metrics.platform || 'Tor 0.4.8.13 on Linux' }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 出口策略 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h3 class="text-lg font-semibold mb-4">出口策略</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium mb-2">IPv4 拒绝端口</h4>
            <div class="space-y-1">
              <div v-for="port in ipv4RejectPorts" :key="port" 
                   class="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded text-sm inline-block mr-2 mb-2">
                <span class="text-red-800 dark:text-red-200">{{ port }}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 class="font-medium mb-2">IPv6 拒绝端口</h4>
            <div class="space-y-1">
              <div v-for="port in ipv6RejectPorts" :key="port"
                   class="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded text-sm inline-block mr-2 mb-2">
                <span class="text-red-800 dark:text-red-200">{{ port }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时数据 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">实时监控数据</h3>
          <div v-if="metricsLoading" class="text-gray-500 animate-pulse">
            <i class="fas fa-sync-alt fa-spin mr-2"></i>
            正在获取最新数据...
          </div>
          <div v-else-if="lastUpdateSuccess" class="text-green-500 transition-opacity duration-1000" :class="{ 'opacity-0': !showUpdateSuccess }">
            <i class="fas fa-check-circle mr-2"></i>
            数据已更新
          </div>
        </div>

        <div v-if="metricsLoading" class="animate-pulse">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div v-for="i in 2" :key="i" class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="i in 2" :key="i" class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <!-- 基础指标 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">观察带宽</p>
              <p class="font-medium text-lg">{{ formatBandwidth(metrics.observed_bandwidth) }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">广播带宽</p>
              <p class="font-medium text-lg">{{ formatBandwidth(metrics.advertised_bandwidth) }}</p>
            </div>
          </div>
          
          <!-- 概率指标 -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">出口概率</p>
              <p class="font-medium text-lg">{{ formatPercentage(metrics.exit_probability) }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">守卫概率</p>
              <p class="font-medium text-lg">{{ formatPercentage(metrics.guard_probability) }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">中继概率</p>
              <p class="font-medium text-lg">{{ formatPercentage(metrics.middle_probability) }}</p>
            </div>
          </div>

          <!-- 权重信息 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">共识权重</p>
              <p class="font-medium text-lg">{{ metrics.consensus_weight }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">权重占比</p>
              <p class="font-medium text-lg">{{ formatPercentage(metrics.consensus_weight_fraction) }}</p>
            </div>
          </div>

          <!-- 版本信息 -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">版本状态</p>
                <p class="font-medium text-lg">
                  <i class="fas fa-check-circle text-green-500 mr-1" v-if="metrics.recommended_version"></i>
                  <i class="fas fa-exclamation-circle text-yellow-500 mr-1" v-else></i>
                  {{ metrics.version }} ({{ metrics.version_status }})
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">最后更新</p>
                <p class="font-medium text-lg">{{ formatDate(metrics.last_seen) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>

    <!-- 更新提示 -->
    <div 
      v-if="showUpdateNotification" 
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500"
      :class="{ 'translate-y-0 opacity-100': showUpdateNotification, 'translate-y-10 opacity-0': !showUpdateNotification }"
    >
      <div class="flex items-center">
        <i class="fas fa-check-circle mr-2"></i>
        <span>数据已成功更新</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

const defaultFlags = ['Exit', 'Fast', 'Running', 'V2Dir', 'Valid', 'ReachableIPv6', 'IPv6 Exit']

const ipv4RejectPorts = ref([
  '25', '119', '135-139', '445', '563', '1214',
  '4661-4666', '6346-6429', '6699', '6881-6999'
])

const ipv6RejectPorts = ref([
  '25', '119', '135-139', '445', '563', '1214',
  '4661-4666', '6346-6429', '6699', '6881-6999'
])

const metricsLoading = ref(true)
const lastUpdateSuccess = ref(false)
const showUpdateSuccess = ref(false)
const showUpdateNotification = ref(false)

const metrics = ref({
  nickname: '',
  fingerprint: '',
  flags: [] as string[],
  or_addresses: [] as string[],
  exit_addresses: [] as string[],
  observed_bandwidth: 0,
  advertised_bandwidth: 0,
  bandwidth_rate: 0,
  bandwidth_burst: 0,
  exit_probability: 0,
  guard_probability: 0,
  middle_probability: 0,
  consensus_weight: 0,
  consensus_weight_fraction: 0,
  version: '',
  version_status: '',
  recommended_version: false,
  last_seen: '',
  last_restarted: '',
  first_seen: '',
  country: '',
  country_name: '',
  as: '',
  as_name: '',
  platform: '',
  contact: ''
})

// 计算运行时间
const calculateUptime = (lastRestarted: string) => {
  if (!lastRestarted) return ''
  const start = new Date(lastRestarted)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${days}天 ${hours}小时 ${minutes}分钟`
}

// 格式化带宽数据
const formatBandwidth = (bytes: number) => {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GiB/s`
  }
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MiB/s`
}

// 格式化百分比
const formatPercentage = (value: number) => {
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

// 显示更新成功动画
const showUpdateSuccessAnimation = () => {
  lastUpdateSuccess.value = true
  showUpdateSuccess.value = true
  showUpdateNotification.value = true

  // 3秒后隐藏成功图标
  setTimeout(() => {
    showUpdateSuccess.value = false
  }, 3000)

  // 3秒后隐藏通知
  setTimeout(() => {
    showUpdateNotification.value = false
  }, 3000)
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
  const flagName = flag.toLowerCase()
  const backupUrl = `https://cdn.akaere.online/https://metrics.torproject.org/images/flags/${flagName}.png`
  
  // 如果当前不是备用地址，则切换到备用地址
  if (!img.src.includes('cdn.akaere.online')) {
    img.src = backupUrl
  }
}

// 从 Onionoo API 获取数据
const fetchMetricsData = async () => {
  metricsLoading.value = true
  try {
    let response = await fetch('https://onionoo.torproject.org/details?lookup=2F59BA21B8D07BE11FCD50C731CA5CAB638F624B')
    
    if (!response.ok) {
      console.log('主要 API 访问失败，正在尝试备用地址...')
      response = await fetch('https://cdn.akaere.online/https://onionoo.torproject.org/details?lookup=2F59BA21B8D07BE11FCD50C731CA5CAB638F624B')
    }
    
    const data = await response.json()
    
    if (data.relays && data.relays[0]) {
      const relay = data.relays[0]
      metrics.value = {
        nickname: relay.nickname,
        fingerprint: relay.fingerprint,
        flags: relay.flags,
        or_addresses: relay.or_addresses,
        exit_addresses: relay.exit_addresses,
        observed_bandwidth: relay.observed_bandwidth,
        advertised_bandwidth: relay.advertised_bandwidth,
        bandwidth_rate: relay.bandwidth_rate,
        bandwidth_burst: relay.bandwidth_burst,
        exit_probability: relay.exit_probability,
        guard_probability: relay.guard_probability,
        middle_probability: relay.middle_probability,
        consensus_weight: relay.consensus_weight,
        consensus_weight_fraction: relay.consensus_weight_fraction,
        version: relay.version,
        version_status: relay.version_status,
        recommended_version: relay.recommended_version,
        last_seen: relay.last_seen,
        last_restarted: relay.last_restarted,
        first_seen: relay.first_seen,
        country: relay.country,
        country_name: relay.country_name,
        as: relay.as,
        as_name: relay.as_name,
        platform: relay.platform,
        contact: relay.contact
      }
      showUpdateSuccessAnimation()
    }
  } catch (error) {
    console.error('获取 Metrics 数据失败:', error)
  } finally {
    metricsLoading.value = false
  }
}

// 定期更新数据
const startMetricsUpdates = () => {
  fetchMetricsData()
  // 每5分钟更新一次数据
  setInterval(fetchMetricsData, 5 * 60 * 1000)
}

onMounted(() => {
  startMetricsUpdates()
})
</script>

<style scoped>
.prose :where(h1):not(:where([class~="not-prose"] *)) {
  margin-bottom: 1.5rem;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}
</style> 