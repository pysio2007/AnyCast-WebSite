<template>
  <div class="container mx-auto p-4">
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[50vh]">
      <span class="loading loading-dots loading-lg"></span>
    </div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-8">
        欢迎来自 {{ organization }} 的用户
      </h1>

      <!-- 网络状态统计 -->
      <div class="stats shadow bg-base-200 dark:bg-base-300 mb-8">
        <div class="stat">
          <div class="stat-figure">
            <i class="fas fa-server text-2xl text-base-content"></i>
          </div>
          <div class="stat-title">在线节点</div>
          <div class="stat-value">{{ onlineNodes }}/{{ totalNodes }}</div>
          <div class="stat-desc">
            <i class="fas fa-arrow-up text-success" v-if="onlineNodes === totalNodes"></i>
            <i class="fas fa-arrow-down text-error" v-else></i>
            节点在线率 {{ ((onlineNodes / totalNodes) * 100).toFixed(1) }}%
          </div>
        </div>
        
        <div class="stat">
          <div class="stat-figure">
            <i class="fas fa-arrow-up text-2xl text-base-content"></i>
          </div>
          <div class="stat-title">实时上行</div>
          <div class="stat-value">{{ formatSpeed(currentUpSpeed) }}</div>
          <div class="stat-desc" :class="{'text-success': !isFirstUpdate && upSpeedTrend > 0, 'text-error': !isFirstUpdate && upSpeedTrend < 0}">
            <i :class="['fas', upSpeedTrend > 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            较30s前 {{ Math.abs(upSpeedTrend).toFixed(1) }}%
          </div>
        </div>
        
        <div class="stat">
          <div class="stat-figure">
            <i class="fas fa-arrow-down text-2xl text-base-content"></i>
          </div>
          <div class="stat-title">实时下行</div>
          <div class="stat-value">{{ formatSpeed(currentDownSpeed) }}</div>
          <div class="stat-desc" :class="{'text-success': !isFirstUpdate && downSpeedTrend > 0, 'text-error': !isFirstUpdate && downSpeedTrend < 0}">
            <i :class="['fas', downSpeedTrend > 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            较30s前 {{ Math.abs(downSpeedTrend).toFixed(1) }}%
          </div>
        </div>

        <div class="stat">
          <div class="stat-figure">
            <i class="fas fa-cloud-upload-alt text-2xl text-base-content"></i>
          </div>
          <div class="stat-title">历史总上行</div>
          <div class="stat-value">{{ formatTraffic(totalUpTraffic) }}</div>
          <div class="stat-desc">自节点启动以来</div>
        </div>
        
        <div class="stat">
          <div class="stat-figure">
            <i class="fas fa-cloud-download-alt text-2xl text-base-content"></i>
          </div>
          <div class="stat-title">历史总下行</div>
          <div class="stat-value">{{ formatTraffic(totalDownTraffic) }}</div>
          <div class="stat-desc">自节点启动以来</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const organization = ref('')
const isLoading = ref(true)
const nodeData = ref({})
const previousUpSpeed = ref(0)
const previousDownSpeed = ref(0)
const upSpeedTrend = ref(0)
const downSpeedTrend = ref(0)
const isFirstUpdate = ref(true)

const formatSpeed = (speed) => {
  if (speed === undefined || isNaN(speed)) return '0.0Kb/s'
  if (speed < 1024) return `${speed.toFixed(1)}K/s`
  if (speed < 10240000) return `${(speed/10240).toFixed(1)}M/s`
  return `${(speed/10240000).toFixed(1)}G/s`
}

const formatTraffic = (bytes) => {
  if (bytes === undefined || isNaN(bytes)) return '0.00 GB'
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb < 1024) return `${gb.toFixed(2)} GB`
  return `${(gb/1024).toFixed(2)} TB`
}

// 统计数据
const onlineNodes = computed(() => {
  if (!nodeData.value.servers) return 0
  return nodeData.value.servers.filter(node => {
    const lastActive = new Date(node.status.last_active)
    return Date.now() - lastActive.getTime() <= 10 * 60 * 1000
  }).length
})

const totalNodes = computed(() => {
  return nodeData.value.servers?.length || 0
})

// 修改速度计算
const currentUpSpeed = computed(() => {
  if (!nodeData.value.servers) return 0
  return nodeData.value.servers.reduce((sum, node) => 
    sum + (node.status?.network?.out_speed || 0), 0)
})

const currentDownSpeed = computed(() => {
  if (!nodeData.value.servers) return 0
  return nodeData.value.servers.reduce((sum, node) => 
    sum + (node.status?.network?.in_speed || 0), 0)
})

const totalUpTraffic = computed(() => {
  if (!nodeData.value.servers) return 0
  return nodeData.value.servers.reduce((sum, node) => 
    sum + (node.status.network?.out || 0), 0)
})

const totalDownTraffic = computed(() => {
  if (!nodeData.value.servers) return 0
  return nodeData.value.servers.reduce((sum, node) => 
    sum + (node.status.network?.in || 0), 0)
})

const updateSpeedTrends = () => {
  if (previousUpSpeed.value > 0) {
    upSpeedTrend.value = ((currentUpSpeed.value - previousUpSpeed.value) / previousUpSpeed.value) * 100
  }
  if (previousDownSpeed.value > 0) {
    downSpeedTrend.value = ((currentDownSpeed.value - previousDownSpeed.value) / previousDownSpeed.value) * 100
  }
  previousUpSpeed.value = currentUpSpeed.value
  previousDownSpeed.value = currentDownSpeed.value
  
  // 第一次更新后设置标志
  if (isFirstUpdate.value) {
    isFirstUpdate.value = false
  }
}

const fetchNodeData = async () => {
  try {
    const response = await fetch('https://anycast-node.akaere.online/')
    nodeData.value = await response.json()
    updateSpeedTrends()
  } catch (error) {
    console.error('Error fetching node data:', error)
  }
}

onMounted(async () => {
  try {
    const [ipResponse, nodeResponse] = await Promise.all([
      fetch('https://ip.akaere.online/'),
      fetch('https://anycast-node.akaere.online/')
    ])
    
    const [ipData, nodeDataResponse] = await Promise.all([
      ipResponse.json(),
      nodeResponse.json()
    ])
    
    organization.value = ipData.org
    nodeData.value = nodeDataResponse
    updateSpeedTrends()
  } catch (error) {
    console.error('Error fetching data:', error)
    organization.value = 'Unknown Organization'
  } finally {
    isLoading.value = false
  }

  setInterval(fetchNodeData, 30000)
})
</script>
