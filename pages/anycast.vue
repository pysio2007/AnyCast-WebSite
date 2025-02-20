<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">AS213605 Network</h1>
      
      <p class="mb-4">
        PYSIO-NetWork (
        <a href="https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=AS213605&type=aut-num" 
           class="text-blue-500 hover:text-blue-600" target="_blank">AS213605</a>
        ) 是一个独立运营的网络系统。
      </p>

      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 dark:bg-yellow-900/20">
        <p class="text-yellow-700 dark:text-yellow-200">
          本网络不接受任何对等互联请求。如果您对 DN42 网络感兴趣，请查看我们的 DN42 页面。
        </p>
      </div>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">网络信息</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">ASN</h3>
            <code class="block bg-gray-100 p-2 rounded dark:bg-gray-700">AS213605</code>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">IPv6 地址块</h3>
            <code class="block bg-gray-100 p-2 rounded dark:bg-gray-700">2a14:67c1:a020::/44</code>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">Looking Glass</h2>
        <p class="mb-4">
          您可以通过我们的 Looking Glass 服务查看网络状态：
          <a href="http://lg.pysio.online/" class="text-blue-500 hover:text-blue-600" target="_blank">
            http://lg.pysio.online/
          </a>
        </p>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">节点列表</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- New Jersey -->
          <div :class="[
            'bg-gray-50 p-4 rounded-lg dark:bg-gray-800',
            isNodeOffline('Anycast-NewJersey') ? 'bg-red-50 dark:bg-red-900/20' : ''
          ]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-us w-5 mr-2"></span>
                Anycast-NewJersey
              </h3>
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$3.5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 0.5TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Vultr</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <template v-if="nodeData['Anycast-NewJersey']?.status">
                <li><i class="fas fa-tachometer-alt mr-2"></i>CPU: {{ nodeData['Anycast-NewJersey'].status.cpu_usage?.toFixed(1) || '0.0' }}%</li>
                <li><i class="fas fa-arrow-down mr-2"></i>入站: {{ formatSpeed(nodeData['Anycast-NewJersey'].status.network?.in_speed) }}</li>
                <li><i class="fas fa-arrow-up mr-2"></i>出站: {{ formatSpeed(nodeData['Anycast-NewJersey'].status.network?.out_speed) }}</li>
                <li><i class="fas fa-exchange-alt mr-2"></i>总流量: {{ formatTraffic(nodeData['Anycast-NewJersey'].status.network?.in) }} / {{ formatTraffic(nodeData['Anycast-NewJersey'].status.network?.out) }}</li>
              </template>
            </ul>
          </div>

          <!-- Tokyo -->
          <div :class="[
            'bg-gray-50 p-4 rounded-lg dark:bg-gray-800',
            isNodeOffline('Anycast-Tokyo') ? 'bg-red-50 dark:bg-red-900/20' : ''
          ]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-jp w-5 mr-2"></span>
                Anycast-Tokyo
              </h3>
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Vultr</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <template v-if="nodeData['Anycast-Tokyo']?.status">
                <li><i class="fas fa-tachometer-alt mr-2"></i>CPU: {{ nodeData['Anycast-Tokyo'].status.cpu_usage?.toFixed(1) || '0.0' }}%</li>
                <li><i class="fas fa-arrow-down mr-2"></i>入站: {{ formatSpeed(nodeData['Anycast-Tokyo'].status.network?.in_speed) }}</li>
                <li><i class="fas fa-arrow-up mr-2"></i>出站: {{ formatSpeed(nodeData['Anycast-Tokyo'].status.network?.out_speed) }}</li>
                <li><i class="fas fa-exchange-alt mr-2"></i>总流量: {{ formatTraffic(nodeData['Anycast-Tokyo'].status.network?.in) }} / {{ formatTraffic(nodeData['Anycast-Tokyo'].status.network?.out) }}</li>
              </template>
            </ul>
          </div>

          <!-- Amsterdam -->
          <div :class="[
            'bg-gray-50 p-4 rounded-lg dark:bg-gray-800',
            isNodeOffline('Anycast-Amsterdam') ? 'bg-red-50 dark:bg-red-900/20' : ''
          ]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-nl w-5 mr-2"></span>
                Anycast-Amsterdam
              </h3>
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Vultr</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <template v-if="nodeData['Anycast-Amsterdam']?.status">
                <li><i class="fas fa-tachometer-alt mr-2"></i>CPU: {{ nodeData['Anycast-Amsterdam'].status.cpu_usage?.toFixed(1) || '0.0' }}%</li>
                <li><i class="fas fa-arrow-down mr-2"></i>入站: {{ formatSpeed(nodeData['Anycast-Amsterdam'].status.network?.in_speed) }}</li>
                <li><i class="fas fa-arrow-up mr-2"></i>出站: {{ formatSpeed(nodeData['Anycast-Amsterdam'].status.network?.out_speed) }}</li>
                <li><i class="fas fa-exchange-alt mr-2"></i>总流量: {{ formatTraffic(nodeData['Anycast-Amsterdam'].status.network?.in) }} / {{ formatTraffic(nodeData['Anycast-Amsterdam'].status.network?.out) }}</li>
              </template>
            </ul>
          </div>

          <!-- Mumbai -->
          <div :class="[
            'bg-gray-50 p-4 rounded-lg dark:bg-gray-800',
            isNodeOffline('Anycast-Mumbai') ? 'bg-red-50 dark:bg-red-900/20' : ''
          ]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-in w-5 mr-2"></span>
                Anycast-Mumbai
              </h3>
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Vultr</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <template v-if="nodeData['Anycast-Mumbai']?.status">
                <li><i class="fas fa-tachometer-alt mr-2"></i>CPU: {{ nodeData['Anycast-Mumbai'].status.cpu_usage?.toFixed(1) || '0.0' }}%</li>
                <li><i class="fas fa-arrow-down mr-2"></i>入站: {{ formatSpeed(nodeData['Anycast-Mumbai'].status.network?.in_speed) }}</li>
                <li><i class="fas fa-arrow-up mr-2"></i>出站: {{ formatSpeed(nodeData['Anycast-Mumbai'].status.network?.out_speed) }}</li>
                <li><i class="fas fa-exchange-alt mr-2"></i>总流量: {{ formatTraffic(nodeData['Anycast-Mumbai'].status.network?.in) }} / {{ formatTraffic(nodeData['Anycast-Mumbai'].status.network?.out) }}</li>
              </template>
            </ul>
          </div>

          <!-- Hong Kong -->
          <div :class="[
            'bg-gray-50 p-4 rounded-lg dark:bg-gray-800',
            isNodeOffline('Anycast-HongKong') ? 'bg-red-50 dark:bg-red-900/20' : ''
          ]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-hk w-5 mr-2"></span>
                Anycast-HongKong
              </h3>
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">¥31/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>500Mbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Akile</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session (Premium)</li>
              <template v-if="nodeData['Anycast-HongKong']?.status">
                <li><i class="fas fa-tachometer-alt mr-2"></i>CPU: {{ nodeData['Anycast-HongKong'].status.cpu_usage?.toFixed(1) || '0.0' }}%</li>
                <li><i class="fas fa-arrow-down mr-2"></i>入站: {{ formatSpeed(nodeData['Anycast-HongKong'].status.network?.in_speed) }}</li>
                <li><i class="fas fa-arrow-up mr-2"></i>出站: {{ formatSpeed(nodeData['Anycast-HongKong'].status.network?.out_speed) }}</li>
                <li><i class="fas fa-exchange-alt mr-2"></i>总流量: {{ formatTraffic(nodeData['Anycast-HongKong'].status.network?.in) }} / {{ formatTraffic(nodeData['Anycast-HongKong'].status.network?.out) }}</li>
              </template>
            </ul>
          </div>

          <!-- Florida -->
          <div :class="[
            'bg-gray-50 p-4 rounded-lg dark:bg-gray-800',
            isNodeOffline('Anycast-Florida') ? 'bg-red-50 dark:bg-red-900/20' : ''
          ]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-us w-5 mr-2"></span>
                AnyCast-Florida
              </h3>
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$3.5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>3Gbps, 100TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Frantech</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <template v-if="nodeData['Anycast-Florida']?.status">
                <li><i class="fas fa-tachometer-alt mr-2"></i>CPU: {{ nodeData['Anycast-Florida'].status.cpu_usage?.toFixed(1) || '0.0' }}%</li>
                <li><i class="fas fa-arrow-down mr-2"></i>入站: {{ formatSpeed(nodeData['Anycast-Florida'].status.network?.in_speed) }}</li>
                <li><i class="fas fa-arrow-up mr-2"></i>出站: {{ formatSpeed(nodeData['Anycast-Florida'].status.network?.out_speed) }}</li>
                <li><i class="fas fa-exchange-alt mr-2"></i>总流量: {{ formatTraffic(nodeData['Anycast-Florida'].status.network?.in) }} / {{ formatTraffic(nodeData['Anycast-Florida'].status.network?.out) }}</li>
              </template>
            </ul>
          </div>

          <!-- Tallinn -->
          <div :class="[
            'bg-gray-50 p-4 rounded-lg dark:bg-gray-800',
            isNodeOffline('Anycast-Tallinn') ? 'bg-red-50 dark:bg-red-900/20' : ''
          ]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-ee w-5 mr-2"></span>
                Anycast-Tallinn
              </h3>
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">€18.95/季</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>V.PS</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <template v-if="nodeData['Anycast-Tallinn']?.status">
                <li><i class="fas fa-tachometer-alt mr-2"></i>CPU: {{ nodeData['Anycast-Tallinn'].status.cpu_usage?.toFixed(1) || '0.0' }}%</li>
                <li><i class="fas fa-arrow-down mr-2"></i>入站: {{ formatSpeed(nodeData['Anycast-Tallinn'].status.network?.in_speed) }}</li>
                <li><i class="fas fa-arrow-up mr-2"></i>出站: {{ formatSpeed(nodeData['Anycast-Tallinn'].status.network?.out_speed) }}</li>
                <li><i class="fas fa-exchange-alt mr-2"></i>总流量: {{ formatTraffic(nodeData['Anycast-Tallinn'].status.network?.in) }} / {{ formatTraffic(nodeData['Anycast-Tallinn'].status.network?.out) }}</li>
              </template>
            </ul>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

const nodeData = ref<Record<string, any>>({})
const currentTime = ref<number>(0)

const formatSpeed = (speed: number | undefined) => {
  if (speed === undefined || isNaN(speed)) return '0.0K/s'
  if (speed < 1024) return `${speed.toFixed(1)}K/s`
  return `${(speed / 1024).toFixed(1)}M/s`
}

const formatTraffic = (bytes: number | undefined) => {
  if (bytes === undefined || isNaN(bytes)) return '0.00 GB'
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(2)} GB`
}

const isNodeOffline = (nodeName: string) => {
  const node = nodeData.value[nodeName]
  if (!node?.status?.last_active || !currentTime.value) return false
  const lastActive = new Date(node.status.last_active)
  return currentTime.value - lastActive.getTime() > 10 * 60 * 1000
}

const updateTime = () => {
  currentTime.value = Date.now()
}

const fetchNodeData = async () => {
  try {
    const response = await fetch('https://anycast-node.akaere.online/')
    const data = await response.json()
    const nodesMap: Record<string, any> = {}
    data.servers.forEach((server: any) => {
      nodesMap[server.name] = server
    })
    nodeData.value = nodesMap
    updateTime()
  } catch (error) {
    console.error('Failed to fetch node data:', error)
  }
}

onMounted(() => {
  updateTime()
  fetchNodeData()
  setInterval(() => {
    updateTime()
    fetchNodeData()
  }, 30000)
})
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
