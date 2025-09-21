<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">AS213605 网络地图</h1>

      <p class="mb-6">
        AS213605网络节点分布图，展示我们的全球网络基础设施和连接状况。
      </p>

      <!-- 地图容器 -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8 dark:bg-gray-800">
        <!-- 错误状态 -->
        <div v-if="mapError" class="flex items-center justify-center h-96 bg-gray-50 rounded-lg dark:bg-gray-700">
          <div class="text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-orange-500 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-300 mb-2">{{ mapError }}</p>
            <button @click="retryMapLoad" class="btn btn-primary btn-sm">重新加载</button>
          </div>
        </div>

        <!-- 地图 -->
        <div v-else id="network-map" class="w-full h-96 rounded-lg"></div>
      </div>

      <!-- 网络统计 -->
      <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="bg-blue-50 p-6 rounded-xl dark:bg-blue-900/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-600 text-sm font-medium dark:text-blue-400">总节点数</p>
              <p class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ networkStats.totalNodes }}</p>
            </div>
            <i class="fas fa-server text-blue-500 text-2xl"></i>
          </div>
        </div>

        <div class="bg-green-50 p-6 rounded-xl dark:bg-green-900/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-600 text-sm font-medium dark:text-green-400">IX交换点</p>
              <p class="text-3xl font-bold text-green-900 dark:text-green-100">{{ networkStats.ixPoints }}</p>
            </div>
            <i class="fas fa-exchange-alt text-green-500 text-2xl"></i>
          </div>
        </div>

        <div class="bg-purple-50 p-6 rounded-xl dark:bg-purple-900/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-600 text-sm font-medium dark:text-purple-400">覆盖地区</p>
              <p class="text-3xl font-bold text-purple-900 dark:text-purple-100">{{ networkStats.regions }}</p>
            </div>
            <i class="fas fa-globe text-purple-500 text-2xl"></i>
          </div>
        </div>

        <div class="bg-orange-50 p-6 rounded-xl dark:bg-orange-900/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-600 text-sm font-medium dark:text-orange-400">总带宽</p>
              <p class="text-3xl font-bold text-orange-900 dark:text-orange-100">{{ networkStats.totalBandwidth }}</p>
            </div>
            <i class="fas fa-tachometer-alt text-orange-500 text-2xl"></i>
          </div>
        </div>
      </div>

      <!-- 节点列表 -->
      <section class="my-8">
        <h2 class="text-2xl font-bold mb-6">网络节点详情</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="node in networkNodes" :key="node.id"
            class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow dark:bg-gray-800"
            :class="getNodeStatusClass(node.status)">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold flex items-center">
                <span :class="node.flag" class="w-5 mr-2"></span>
                {{ node.name }}
              </h3>
              <span class="px-2 py-1 rounded text-xs font-medium" :class="getStatusBadgeClass(node.status)">
                {{ node.status }}
              </span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center">
                <i class="fas fa-map-marker-alt w-4 mr-2 text-gray-500"></i>
                <span>{{ node.location }}</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-network-wired w-4 mr-2 text-gray-500"></i>
                <span>{{ node.bandwidth }}</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-exchange-alt w-4 mr-2 text-gray-500"></i>
                <span>{{ node.type }}</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-server w-4 mr-2 text-gray-500"></i>
                <span>{{ node.provider }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 连接图例 -->
      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">连接说明</h2>
        <div class="bg-gray-50 p-6 rounded-lg dark:bg-gray-800">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-bold mb-3">节点类型</h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span>IX交换点</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span>Anycast节点</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                  <span>边缘节点</span>
                </div>
              </div>
            </div>
            <div>
              <h3 class="font-bold mb-3">连接类型</h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <div class="w-6 h-0.5 bg-blue-500 mr-3"></div>
                  <span>主要连接</span>
                </div>
                <div class="flex items-center">
                  <div class="w-6 h-0.5 bg-gray-600 mr-3 border-dashed border-t border-gray-600"
                    style="background: repeating-linear-gradient(to right, #4b5563 0, #4b5563 5px, transparent 5px, transparent 10px);">
                  </div>
                  <span>次要连接</span>
                </div>
                <div class="flex items-center">
                  <div class="w-6 h-0.5 bg-purple-500 mr-3"
                    style="background: repeating-linear-gradient(to right, #8b5cf6 0, #8b5cf6 10px, transparent 10px, transparent 15px);">
                  </div>
                  <span>边缘连接</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-2 bg-green-500 mr-3"></div>
                  <span>运行正常</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import 'leaflet/dist/leaflet.css'

definePageMeta({
  layout: 'default'
})

// 地图状态
const mapError = ref('')
let mapInstance: any = null

// 网络统计数据
const networkStats = ref({
  totalNodes: 20,
  ixPoints: 6,
  regions: 10,
  totalBandwidth: '70G+'
})

// 网络节点数据（从Anycast页面复制的真实数据）
const networkNodes = ref([
  // IX交换点
  {
    id: 0,
    name: 'AKIX-Frankfurt',
    location: 'Frankfurt, Germany',
    bandwidth: '10Gbps',
    type: 'IX交换点',
    status: '运行中',
    flag: 'fi fi-de',
    lat: 50.1209,
    lng: 8.6721,
    provider: 'Digital Realty Frankfurt FRA1-16'
  },
  {
    id: 1,
    name: 'FogIXP-Switzerland',
    location: 'Avers, Switzerland',
    bandwidth: '1Gbps',
    type: 'IX交换点',
    status: '运行中',
    flag: 'fi fi-ch',
    lat: 46.5197,
    lng: 6.6323,
    provider: 'IFog'
  },
  {
    id: 2,
    name: 'LOCIX-Frankfurt',
    location: 'Frankfurt am Main, Germany',
    bandwidth: '1Gbps',
    type: 'IX交换点',
    status: '运行中',
    flag: 'fi fi-de',
    lat: 50.1109,
    lng: 8.6821,
    provider: 'LOCIX EXCHANGE FRANKFURT'
  },
  {
    id: 3,
    name: 'INTERIX-Amsterdam',
    location: 'Amsterdam, Netherlands',
    bandwidth: '1Gbps',
    type: 'IX交换点',
    status: '运行中',
    flag: 'fi fi-nl',
    lat: 52.3676,
    lng: 4.9041,
    provider: 'InterIX Internet Exchange'
  },
  {
    id: 4,
    name: 'STUIX-Taipei',
    location: 'Taipei City, Taiwan',
    bandwidth: '1Gbps',
    type: 'IX交换点',
    status: '运行中',
    flag: 'fi fi-tw',
    lat: 25.0330,
    lng: 121.5654,
    provider: 'Moedove'
  },
  {
    id: 21,
    name: 'ONIX',
    location: 'Ontario, Canada',
    bandwidth: '1Gbps',
    type: 'IX交换点',
    status: '运行中',
    flag: 'fi fi-ca',
    lat: 43.6532,
    lng: -79.3832,
    provider: 'Ontario Internet Exchange'
  },
  // Anycast节点
  {
    id: 5,
    name: 'HongKong Master',
    location: 'Hong Kong',
    bandwidth: '30Gbps',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-hk',
    lat: 22.3193,
    lng: 114.1694,
    provider: 'Equinix HK2'
  },
  {
    id: 6,
    name: 'Anycast-NewJersey',
    location: 'New Jersey, USA',
    bandwidth: '1Gbps, 0.5TB/月',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-us',
    lat: 40.2989,
    lng: -74.5210,
    provider: 'Vultr'
  },
  {
    id: 7,
    name: 'Anycast-Tokyo',
    location: 'Tokyo, Japan',
    bandwidth: '1Gbps, 1TB/月',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-jp',
    lat: 35.6762,
    lng: 139.6503,
    provider: 'Vultr'
  },
  {
    id: 8,
    name: 'Anycast-Amsterdam',
    location: 'Amsterdam, Netherlands',
    bandwidth: '1Gbps, 1TB/月',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-nl',
    lat: 52.3676,
    lng: 4.9041,
    provider: 'Vultr'
  },
  {
    id: 9,
    name: 'Anycast-Mumbai',
    location: 'Mumbai, India',
    bandwidth: '1Gbps, 1TB/月',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-in',
    lat: 19.0760,
    lng: 72.8777,
    provider: 'Vultr'
  },
  {
    id: 10,
    name: 'Anycast-HongKong',
    location: 'Hong Kong',
    bandwidth: '500Mbps, 1TB/月',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-hk',
    lat: 22.3193,
    lng: 114.1694,
    provider: 'SkyWolf'
  },
  {
    id: 11,
    name: 'AnyCast-Florida',
    location: 'Florida, USA',
    bandwidth: '3Gbps, 100TB/月',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-us',
    lat: 27.7663,
    lng: -82.6404,
    provider: 'Frantech'
  },
  {
    id: 12,
    name: 'Anycast-Tallinn',
    location: 'Tallinn, Estonia',
    bandwidth: '1Gbps, 1TB/月',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-ee',
    lat: 59.4370,
    lng: 24.7536,
    provider: 'V.PS'
  },
  {
    id: 13,
    name: 'HongKong',
    location: 'Hong Kong',
    bandwidth: '1Gbps',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-hk',
    lat: 22.3193,
    lng: 114.1694,
    provider: 'Moedove'
  },
  {
    id: 14,
    name: 'Singapore',
    location: 'Singapore',
    bandwidth: '1Gbps',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-sg',
    lat: 1.3521,
    lng: 103.8198,
    provider: 'Moedove'
  },
  {
    id: 15,
    name: 'Germany',
    location: 'Germany',
    bandwidth: '1Gbps',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-de',
    lat: 51.1657,
    lng: 10.4515,
    provider: 'Moedove'
  },
  {
    id: 16,
    name: 'USA',
    location: 'Missouri, USA',
    bandwidth: '1Gbps',
    type: 'Anycast节点',
    status: '运行中',
    flag: 'fi fi-us',
    lat: 38.5767,
    lng: -92.1735,
    provider: 'Moedove'
  },
  {
    id: 18,
    name: 'Luxembourg',
    location: 'Luxembourg City, Luxembourg',
    bandwidth: '10Gbps',
    type: '边缘节点',
    status: '运行中',
    flag: 'fi fi-lu',
    lat: 49.6116,
    lng: 6.1319,
    provider: 'BUYVM'
  },
  {
    id: 19,
    name: 'NewYork',
    location: 'New York, USA',
    bandwidth: '10Gbps',
    type: '边缘节点',
    status: '运行中',
    flag: 'fi fi-us',
    lat: 40.7128,
    lng: -74.0060,
    provider: 'BUYVM'
  }
])

// 节点连接配置
const nodeConnections = [
  // IX之间的主要连接
  { from: 0, to: 1, type: 'primary' }, // AKIX -> FogIXP
  { from: 0, to: 2, type: 'primary' }, // AKIX -> LOCIX
  { from: 0, to: 3, type: 'primary' }, // AKIX -> INTERIX
  { from: 0, to: 4, type: 'primary' }, // AKIX -> STUIX
  { from: 0, to: 21, type: 'primary' }, // AKIX -> ONIX
  { from: 1, to: 2, type: 'primary' }, // FogIXP -> LOCIX
  { from: 1, to: 3, type: 'primary' }, // FogIXP -> INTERIX
  { from: 1, to: 4, type: 'primary' }, // FogIXP -> STUIX
  { from: 1, to: 21, type: 'primary' }, // FogIXP -> ONIX
  { from: 2, to: 3, type: 'primary' }, // LOCIX -> INTERIX
  { from: 2, to: 4, type: 'primary' }, // LOCIX -> STUIX
  { from: 2, to: 21, type: 'primary' }, // LOCIX -> ONIX
  { from: 3, to: 4, type: 'primary' }, // INTERIX -> STUIX
  { from: 3, to: 21, type: 'primary' }, // INTERIX -> ONIX
  { from: 4, to: 21, type: 'primary' }, // STUIX -> ONIX

  // IX到Anycast的次要连接
  { from: 0, to: 5, type: 'secondary' }, // AKIX -> HongKong Master
  { from: 0, to: 6, type: 'secondary' }, // AKIX -> NewJersey
  { from: 0, to: 8, type: 'secondary' }, // AKIX -> Amsterdam
  { from: 0, to: 12, type: 'secondary' }, // AKIX -> Tallinn
  { from: 0, to: 15, type: 'secondary' }, // AKIX -> Moedove-Germany
  { from: 1, to: 15, type: 'secondary' }, // FogIXP -> Moedove-Germany
  { from: 1, to: 12, type: 'secondary' }, // FogIXP -> Tallinn
  { from: 3, to: 8, type: 'secondary' }, // INTERIX -> Amsterdam
  { from: 3, to: 12, type: 'secondary' }, // INTERIX -> Tallinn
  { from: 4, to: 7, type: 'secondary' }, // STUIX -> Tokyo
  { from: 4, to: 5, type: 'secondary' }, // STUIX -> HongKong Master
  { from: 4, to: 10, type: 'secondary' }, // STUIX -> Anycast-HongKong
  { from: 4, to: 13, type: 'secondary' }, // STUIX -> Moedove-HongKong
  { from: 4, to: 14, type: 'secondary' }, // STUIX -> Singapore
  { from: 21, to: 6, type: 'secondary' }, // ONIX -> NewJersey
  { from: 21, to: 16, type: 'secondary' }, // ONIX -> Moedove-USA

  // Anycast间连接
  { from: 5, to: 10, type: 'secondary' }, // HongKong Master -> Anycast-HongKong
  { from: 5, to: 13, type: 'secondary' }, // HongKong Master -> Moedove-HongKong
  { from: 6, to: 11, type: 'secondary' }, // NewJersey -> Florida
  { from: 6, to: 16, type: 'secondary' }, // NewJersey -> Moedove-USA
  { from: 7, to: 9, type: 'secondary' }, // Tokyo -> Mumbai
  { from: 7, to: 14, type: 'secondary' }, // Tokyo -> Singapore
  { from: 8, to: 12, type: 'secondary' }, // Amsterdam -> Tallinn
  { from: 8, to: 15, type: 'secondary' }, // Amsterdam -> Moedove-Germany
  { from: 9, to: 14, type: 'secondary' }, // Mumbai -> Singapore
  { from: 10, to: 13, type: 'secondary' }, // Anycast-HongKong -> Moedove-HongKong
  { from: 11, to: 16, type: 'secondary' }, // Florida -> Moedove-USA
  { from: 13, to: 14, type: 'secondary' }, // Moedove-HongKong -> Singapore
  
  // 边缘节点连接
  { from: 0, to: 17, type: 'edge' }, // AKIX -> BUYVM-Luxembourg
  { from: 1, to: 17, type: 'edge' }, // FogIXP -> BUYVM-Luxembourg
  { from: 6, to: 18, type: 'edge' }, // NewJersey -> BUYVM-NewYork
  { from: 11, to: 18, type: 'edge' } // Florida -> BUYVM-NewYork
]

// 获取节点状态样式
const getNodeStatusClass = (status: string) => {
  switch (status) {
    case '运行中': return 'border-l-4 border-green-500'
    case '维护中': return 'border-l-4 border-yellow-500'
    case '离线': return 'border-l-4 border-red-500'
    default: return 'border-l-4 border-gray-500'
  }
}

// 获取状态徽章样式
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case '运行中': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case '维护中': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case '离线': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

// 重试加载
const retryMapLoad = () => {
  mapError.value = ''
  initMap()
}

// 使用本地库的地图初始化
const initMap = async () => {
  try {
    // 动态导入本地 Leaflet
    const L = await import('leaflet')

    // 清理现有地图
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
    }

    // 创建地图
    mapInstance = L.map('network-map').setView([30, 20], 2)

    // 添加地图瓦片
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance)

    // 创建图标
    const createIcon = (color: string) => L.divIcon({
      html: `<div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      className: 'custom-icon'
    })

    const ixIcon = createIcon('#3b82f6')
    const anycastIcon = createIcon('#10b981')
    const edgeIcon = createIcon('#8b5cf6')

    // 添加节点标记
    networkNodes.value.forEach(node => {
      let icon = anycastIcon
      if (node.type === 'IX交换点') icon = ixIcon
      if (node.type === '边缘节点') icon = edgeIcon

      L.marker([node.lat, node.lng], { icon })
        .bindPopup(`
          <div>
            <h3 style="font-weight: bold;">${node.name}</h3>
            <p style="font-size: 12px; color: #666;">${node.location}</p>
            <p style="font-size: 12px;"><strong>带宽:</strong> ${node.bandwidth}</p>
            <p style="font-size: 12px;"><strong>类型:</strong> ${node.type}</p>
            <p style="font-size: 12px;"><strong>提供商:</strong> ${node.provider}</p>
          </div>
        `)
        .addTo(mapInstance)
    })

    // 绘制连接线
    nodeConnections.forEach(conn => {
      const fromNode = networkNodes.value[conn.from]
      const toNode = networkNodes.value[conn.to]

      let style
      if (conn.type === 'primary') {
        style = {
          color: '#3b82f6',
          weight: 2,
          opacity: 0.7
        }
      } else if (conn.type === 'edge') {
        style = {
          color: '#8b5cf6',
          weight: 1,
          opacity: 0.5,
          dashArray: '10,5'
        }
      } else {
        style = {
          color: '#6b7280',
          weight: 1.5,
          opacity: 0.6,
          dashArray: '5,5'
        }
      }

      L.polyline([
        [fromNode.lat, fromNode.lng],
        [toNode.lat, toNode.lng]
      ], style).addTo(mapInstance)
    })

  } catch (error) {
    console.error('Map initialization error:', error)
    mapError.value = '地图加载失败: ' + (error as Error).message
  }
}

onMounted(() => {
  setTimeout(initMap, 200)
})

onUnmounted(() => {
  if (mapInstance) {
    try {
      mapInstance.remove()
      mapInstance = null
    } catch (e) {
      console.error('清理地图时出错:', e)
    }
  }
})
</script>

<style>
/* 确保地图容器有正确的高度 */
#network-map {
  min-height: 400px;
}

/* 自定义标记样式 */
.custom-icon {
  background: none !important;
  border: none !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  #network-map {
    height: 300px;
  }
}
</style>
