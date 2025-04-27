<template>
  <div class="container mx-auto p-4">
    <PageSeo 
      title="全球路由追踪" 
      description="使用RIPE Atlas网络探针从全球各地对目标主机进行路由追踪测试，分析网络路径和跃点。"
    />
    <div class="card backdrop-blur-md bg-opacity-50 bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6 text-center justify-center">
          <i class="fas fa-route mr-2"></i>全球路由追踪
        </h2>
        
        <div class="w-full max-w-4xl mx-auto">
          <!-- 输入区域 -->
          <div class="flex flex-col gap-4">
            <!-- 第一行：目标输入和选项 -->
            <div class="flex flex-col md:flex-row gap-4 items-end">
              <!-- 目标输入 -->
              <div class="form-control flex-1">
                <label class="label">
                  <span class="label-text">目标地址</span>
                </label>
                <div class="join w-full">
                  <input 
                    v-model="target"
                    type="text"
                    placeholder="8.8.8.8 或 google.com"
                    class="input input-bordered join-item flex-1 bg-opacity-70 bg-base-100"
                    @keyup.enter="performTraceroute"
                  />
                  <button 
                    class="btn btn-primary join-item w-24"
                    @click="performTraceroute"
                    :disabled="!canQuery"
                  >
                    <i class="fas fa-play mr-1"></i>
                    <span class="hidden sm:inline">追踪</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 第二行：选项 -->
            <div class="flex flex-col md:flex-row gap-4">
              <!-- 探针数量 -->
              <div class="form-control w-full md:w-1/3">
                <label class="label">
                  <span class="label-text">探针数量</span>
                </label>
                <select 
                  v-model="probes"
                  class="select select-bordered w-full bg-opacity-70 bg-base-100"
                >
                  <option value="50">50个</option>
                  <option value="100">100个</option>
                  <option value="200">200个</option>
                  <option value="300">300个</option>
                </select>
              </div>

              <!-- IP版本 -->
              <div class="form-control w-full md:w-1/3">
                <label class="label">
                  <span class="label-text">IP版本</span>
                </label>
                <select 
                  v-model="ipv"
                  class="select select-bordered w-full bg-opacity-70 bg-base-100"
                >
                  <option value="0">自动选择</option>
                  <option value="4">IPv4</option>
                  <option value="6">IPv6</option>
                </select>
              </div>

              <!-- API KEY设置 -->
              <div class="form-control w-full md:w-1/3">
                <label class="label">
                  <span class="label-text">ipinfo.io API KEY</span>
                  <span class="label-text-alt">
                    <button @click="openApiKeyModal" class="btn btn-xs btn-ghost">
                      <i class="fas fa-key mr-1"></i>设置
                    </button>
                  </span>
                </label>
                <div class="input input-bordered w-full bg-opacity-70 bg-base-100 flex items-center justify-between">
                  <span v-if="apiKeyMasked" class="truncate">{{ apiKeyMasked }}</span>
                  <span v-else class="opacity-50">使用内置API KEY</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 结果显示 -->
          <div class="mt-8">
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 transform -translate-y-4"
              enter-to-class="opacity-100 transform translate-y-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 transform translate-y-0"
              leave-to-class="opacity-0 transform -translate-y-4"
            >
              <div v-if="loading" class="text-center p-8">
                <span class="loading loading-spinner loading-lg"></span>
                <p class="mt-4 text-base-content/70">
                  正在启动全球路由追踪测量...
                </p>
              </div>
              
              <div v-else-if="measurementId && !resultData" class="text-center p-8">
                <span class="loading loading-dots loading-lg"></span>
                <p class="mt-4 text-base-content/70">
                  已启动测量 ID: {{ measurementId }}<br>
                  正在等待测量结果...
                </p>
                <button 
                  class="btn btn-primary mt-4"
                  @click="fetchResults"
                >
                  <i class="fas fa-sync-alt mr-1"></i>
                  刷新结果
                </button>
              </div>
              
              <div v-else-if="resultData" class="card bg-opacity-70 bg-base-100 backdrop-blur shadow-lg">
                <div class="card-body">
                  <!-- 测量信息 -->
                  <div class="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h3 class="text-lg font-semibold">
                        <i class="fas fa-info-circle mr-1 opacity-70"></i>
                        测量信息
                      </h3>
                      <p>目标: {{ resultData.target }}</p>
                      <p>测量 ID: {{ resultData.measurement_id }}</p>
                      <p>状态: {{ resultData.status }}</p>
                      <p>创建时间: {{ formatDate(resultData.created) }}</p>
                    </div>
                    <div class="flex md:flex-col mt-4 md:mt-0 gap-2 md:items-end">
                      <button
                        @click="copyShareLink"
                        class="btn btn-sm btn-outline"
                      >
                        <i class="fas fa-link mr-1"></i>
                        {{ showCopiedMessage ? '已复制!' : '复制链接' }}
                      </button>
                      <a 
                        v-if="resultData.ripe_url" 
                        :href="resultData.ripe_url" 
                        target="_blank" 
                        class="btn btn-sm btn-outline"
                      >
                        <i class="fas fa-external-link-alt mr-1"></i>
                        RIPE Atlas
                      </a>
                      <button 
                        v-if="selectedProbe && pathLines.length > 0"
                        @click="toggleFullscreenMap"
                        class="btn btn-sm btn-outline"
                      >
                        <i class="fas fa-expand mr-1"></i>
                        全屏地图
                      </button>
                      <button 
                        v-if="selectedProbe && pathLines.length > 0"
                        @click="clearSelectedProbe"
                        class="btn btn-sm btn-outline"
                      >
                        <i class="fas fa-times mr-1"></i>
                        退出路径
                      </button>
                    </div>
                  </div>
                  
                  <!-- 路由追踪结果 -->
                  <div v-if="resultData.results && resultData.results.length > 0" class="mt-4">
                    <h3 class="text-lg font-semibold mb-4">
                      <i class="fas fa-route mr-1 opacity-70"></i>
                      路由追踪结果
                    </h3>
                    
                    <!-- 结果统计 -->
                    <div class="stats shadow mb-4 bg-opacity-50 bg-base-200">
                      <div class="stat">
                        <div class="stat-title">探针数量</div>
                        <div class="stat-value">{{ resultData.results.length }}</div>
                        <div class="stat-desc">全球测量点</div>
                      </div>
                      
                      <div class="stat">
                        <div class="stat-title">平均跃点</div>
                        <div class="stat-value">{{ calculateAverageHops() }}</div>
                        <div class="stat-desc">全球平均</div>
                      </div>
                      
                      <div class="stat">
                        <div class="stat-title">成功率</div>
                        <div class="stat-value">{{ calculateSuccessRate() }}%</div>
                        <div class="stat-desc">测量完成率</div>
                      </div>
                    </div>
                    
                    <!-- 结果地图 -->
                    <div class="mb-6 relative">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="text-md font-semibold">
                          <i class="fas fa-map-marked-alt mr-1 opacity-70"></i>
                          探针分布地图
                        </h4>
                        <div class="flex gap-2 text-xs">
                          <div class="flex items-center">
                            <span class="inline-block w-3 h-3 rounded-full bg-success mr-1"></span>
                            成功
                          </div>
                          <div class="flex items-center">
                            <span class="inline-block w-3 h-3 rounded-full bg-error mr-1"></span>
                            失败
                          </div>
                        </div>
                      </div>
                      <div 
                        id="ripe-map" 
                        class="w-full h-[400px] rounded-lg shadow-inner bg-base-200 bg-opacity-50"
                        :class="{'loading-container': loadingMap || loadingGeo}"
                      >
                        <div v-if="loadingMap || loadingGeo" class="flex h-full items-center justify-center">
                          <span class="loading loading-spinner loading-md"></span>
                          <span class="ml-2">{{ loadingGeo ? '正在获取地理位置信息...' : '加载地图中...' }}</span>
                        </div>
                      </div>
                      <div v-if="!loadingMap && !loadingGeo && mapError" class="text-error text-center mt-2">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        {{ mapError }}
                      </div>
                    </div>
                    
                    <!-- 探针选择器 -->
                    <div class="mb-4">
                      <label class="label">
                        <span class="label-text">选择探针查看详细路径</span>
                      </label>
                      <select 
                        v-model="selectedProbe"
                        class="select select-bordered w-full md:w-1/3 bg-opacity-70 bg-base-100"
                      >
                        <option value="">请选择探针</option>
                        <option v-for="result in processedResults" :key="result.probe_id" :value="result.probe_id">
                          {{ result.probe_id }} - {{ result.country_name || result.country || '未知' }}{{ result.city ? ', ' + result.city : '' }}
                        </option>
                      </select>
                    </div>
                    
                    <!-- 选中探针的路由路径 -->
                    <div v-if="selectedProbe && selectedProbeData" class="card bg-opacity-50 bg-base-200 p-4 mb-4">
                      <h4 class="text-md font-semibold mb-2">
                        探针 {{ selectedProbe }} 的路由路径
                      </h4>
                      <div class="overflow-x-auto">
                        <table class="table table-sm w-full">
                          <thead>
                            <tr>
                              <th>跃点</th>
                              <th>地址</th>
                              <th>延迟</th>
                              <th>位置</th>
                              <th>ASN</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(hop, index) in currentPathHops" :key="index" :class="{'bg-success bg-opacity-5': index === 0}">
                              <td>
                                <span v-if="index === 0" class="badge badge-success badge-sm bg-opacity-70">起点</span>
                                <span v-else>{{ hop.hop || index }}</span>
                              </td>
                              <td class="font-mono text-xs">{{ hop.address || '* * *' }}</td>
                              <td class="text-xs">
                                <template v-if="hop.geo">
                                  {{ hop.geo.country_name || countryCenters[hop.geo.country]?.country_name || hop.geo.country || '未知' }}
                                  <span v-if="hop.geo.city">, {{ hop.geo.city }}</span>
                                </template>
                                <span v-else-if="isPrivateIP(hop.address)" class="opacity-70">
                                  私有地址
                                </span>
                                <span v-else>-</span>
                              </td>
                              <td class="text-xs">
                                <template v-if="hop.geo">
                                  <template v-if="hop.geo.asn">
                                    AS{{ hop.geo.asn }}
                                  </template>
                                  <template v-else-if="hop.geo.org">
                                    {{ hop.geo.org }}
                                  </template>
                                </template>
                                <span v-else>-</span>
                              </td>
                              <td class="text-xs">
                                <span v-if="index === 0">0 ms</span>
                                <span v-else>{{ hop.rtt ? hop.rtt + ' ms' : '-' }}</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <!-- 探针列表 -->
                    <div class="overflow-x-auto">
                      <table class="table table-sm w-full">
                        <thead>
                          <tr>
                            <th>探针</th>
                            <th>位置</th>
                            <th>ISP</th>
                            <th>跃点数</th>
                            <th>成功</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="result in processedResults" :key="result.probe_id" 
                              :class="{'bg-base-200 bg-opacity-30': selectedProbe === result.probe_id}">
                            <td>{{ result.probe_id }}</td>
                            <td>
                              <template v-if="result.loading_geo">
                                <span class="loading loading-dots loading-xs"></span>
                              </template>
                              <template v-else>
                                <i class="fas fa-globe-americas mr-1 opacity-50"></i>
                                {{ result.country_name || countryCenters[result.country]?.country_name || result.country || '未知' }}
                                <span v-if="result.city">, {{ result.city }}</span>
                              </template>
                            </td>
                            <td>
                              <template v-if="result.loading_geo">
                                <span class="loading loading-dots loading-xs"></span>
                              </template>
                              <template v-else>
                                <span class="text-xs whitespace-nowrap">
                                  <template v-if="result.asn">
                                    AS{{ result.asn }}
                                  </template>
                                  <template v-else>
                                    {{ result._raw?.as_v4 || result._raw?.as_v6 || result._raw?.as || '未知' }}
                                  </template>
                                </span>
                              </template>
                            </td>
                            <td>{{ result.hops ? result.hops.length : 0 }}</td>
                            <td>
                              <span v-if="result.success" class="text-success">
                                <i class="fas fa-check"></i>
                              </span>
                              <span v-else class="text-error">
                                <i class="fas fa-times"></i>
                              </span>
                            </td>
                            <td>
                              <button 
                                @click="selectedProbe = result.probe_id"
                                class="btn btn-xs btn-outline"
                              >
                                <i class="fas fa-eye mr-1"></i>
                                查看
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <!-- 无结果显示 -->
                  <div v-else class="alert">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>暂无测量结果数据，请稍后刷新查看。</span>
                  </div>
                </div>
              </div>
              
              <!-- 错误显示 -->
              <div v-else-if="error" class="alert alert-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ error }}</span>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- API Key 设置弹窗 -->
  <div class="modal" :class="{'modal-open': showApiKeyModal}">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">ipinfo.io API KEY 设置</h3>
      <p class="mb-4">请输入您的 ipinfo.io API KEY，用于获取IP地理位置信息。如不设置将使用内置的API KEY。</p>
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">API KEY</span>
        </label>
        <input 
          v-model="apiKeyInput" 
          type="text" 
          placeholder="输入您的API KEY" 
          class="input input-bordered w-full"
        />
        <label class="label">
          <span class="label-text-alt">可以在 <a href="https://ipinfo.io" target="_blank" class="link">ipinfo.io</a> 获取API KEY</span>
        </label>
      </div>
      <div class="modal-action">
        <button @click="closeApiKeyModal" class="btn btn-ghost">取消</button>
        <button @click="saveApiKey" class="btn btn-primary">保存</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="closeApiKeyModal"></div>
  </div>

  <!-- 全屏地图容器 -->
  <div 
    v-if="isFullscreenMap" 
    class="fixed inset-0 z-40 bg-base-100"
  >
    <div id="fullscreen-map" class="w-full h-full"></div>
    <button 
      @click="toggleFullscreenMap"
      class="fixed right-4 top-4 z-50 btn btn-circle bg-base-200 bg-opacity-70 backdrop-blur shadow-lg"
      title="退出全屏"
    >
      <i class="fas fa-times"></i>
    </button>
    
    <!-- 可拖动的路由跳跃表格 -->
    <div 
      ref="routeTableWindow"
      class="route-table-window fixed left-4 bottom-4 z-50 w-1/3 max-h-[60%] bg-base-200 bg-opacity-80 backdrop-blur-md shadow-lg rounded-lg overflow-hidden"
      :class="{
        'minimized': isTableMinimized,
        'collapsed': isTableCollapsed && !isTableMinimized,
        'expanded': !isTableCollapsed && !isTableMinimized
      }"
      @mousedown="startDrag"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="window-header p-2 flex justify-between items-center cursor-move bg-base-300 bg-opacity-80">
        <div class="flex items-center">
          <i class="fas fa-route mr-2"></i>
          <span class="font-semibold">路由跃点</span>
        </div>
        <div class="flex gap-1">
          <button 
            @click.stop="toggleTableCollapse" 
            class="btn btn-xs btn-ghost btn-circle"
            :title="isTableCollapsed ? '展开' : '收起'"
            v-if="!isTableMinimized"
          >
            <i :class="isTableCollapsed ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </button>
          <button 
            @click.stop="isTableMinimized = !isTableMinimized" 
            class="btn btn-xs btn-ghost btn-circle"
            :title="isTableMinimized ? '展开' : '最小化'"
          >
            <i :class="isTableMinimized ? 'fas fa-expand' : 'fas fa-minus'"></i>
          </button>
        </div>
      </div>
      
      <div v-if="!isTableMinimized" class="window-content p-2 overflow-auto max-h-[calc(60vh-40px)]">
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th>跃点</th>
              <th>IP地址</th>
              <th>位置</th>
              <th>ASN</th>
              <th>延迟</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(hop, index) in currentPathHops" :key="index" :class="{'bg-success bg-opacity-5': index === 0}">
              <td>
                <span v-if="index === 0" class="badge badge-success badge-sm bg-opacity-70">起点</span>
                <span v-else>{{ hop.hop || index }}</span>
              </td>
              <td class="font-mono text-xs">{{ hop.address || '* * *' }}</td>
              <td class="text-xs">
                <template v-if="hop.geo">
                  {{ hop.geo.country_name || countryCenters[hop.geo.country]?.country_name || hop.geo.country || '未知' }}
                  <span v-if="hop.geo.city">, {{ hop.geo.city }}</span>
                </template>
                <span v-else-if="isPrivateIP(hop.address)" class="opacity-70">
                  私有地址
                </span>
                <span v-else>-</span>
              </td>
              <td class="text-xs">
                <template v-if="hop.geo">
                  <template v-if="hop.geo.asn">
                    AS{{ hop.geo.asn }}
                  </template>
                  <template v-else-if="hop.geo.org">
                    {{ hop.geo.org }}
                  </template>
                </template>
                <span v-else>-</span>
              </td>
              <td class="text-xs">
                <span v-if="index === 0">0 ms</span>
                <span v-else>{{ hop.rtt ? hop.rtt + ' ms' : '-' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { loadGeoIpDatabase, getIpGeoLocation, isPrivateIP as checkPrivateIP, getApiKey, setApiKey } from '~/utils/geoip'
import countryCenters from '~/utils/country-centers'

// 添加Leaflet的类型声明
declare global {
  interface Window {
    L: any;
  }
}

const target = ref('')
const probes = ref('200')
const ipv = ref('0')
const loading = ref(false)
const error = ref('')
const measurementId = ref('')
const resultData = ref<any>(null)
const processedResults = ref<any[]>([])
const selectedProbe = ref('')
const apiUrl = 'https://ping.akaere.online'
const refreshInterval = ref<any>(null)
const showCopiedMessage = ref(false)
const dbLoaded = ref(false)

// 地图相关
const loadingMap = ref(false)
const loadingGeo = ref(false)
const mapError = ref('')
let map: any = null
let markers: any[] = []

// API KEY相关
const showApiKeyModal = ref(false)
const apiKeyInput = ref('')
const apiKeyMasked = ref('')

const canQuery = computed(() => {
  return target.value.trim()
})

const selectedProbeData = computed(() => {
  if (!selectedProbe.value || !processedResults.value.length) return null
  return processedResults.value.find(result => result.probe_id === selectedProbe.value)
})

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  
  let date: Date
  
  // 检查是否为Unix时间戳（秒级）
  if (/^\d+$/.test(dateString)) {
    // 将秒级时间戳转换为毫秒级
    const timestamp = parseInt(dateString) * 1000
    date = new Date(timestamp)
  } else {
    // 尝试直接解析日期字符串
    date = new Date(dateString)
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '未知日期'
  }
  
  return date.toLocaleString('zh-CN')
}

// 使用工具包中的isPrivateIP函数
const isPrivateIP = (ip: string): boolean => {
  return checkPrivateIP(ip)
}

// 执行路由追踪测量
const performTraceroute = async () => {
  if (!canQuery.value) return
  
  loading.value = true
  error.value = ''
  measurementId.value = ''
  resultData.value = null
  processedResults.value = []
  selectedProbe.value = ''
  
  try {
    const response = await fetch(`${apiUrl}/api/traceroute?target=${encodeURIComponent(target.value)}&probes=${probes.value}&ipv=${ipv.value}`)
    
    if (!response.ok) {
      throw new Error(`请求失败，状态码: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      error.value = data.error
    } else if (data.status === 'success' && data.measurement_id) {
      measurementId.value = data.measurement_id
      
      // 设置自动刷新结果
      startResultRefresh()
    } else {
      error.value = '未知错误，请稍后重试'
    }
  } catch (err) {
    console.error('Traceroute error:', err)
    error.value = err instanceof Error ? err.message : '请求失败'
  } finally {
    loading.value = false
  }
}

// 获取测量结果
const fetchResults = async () => {
  if (!measurementId.value) return
  
  try {
    const response = await fetch(`${apiUrl}/measurements/${measurementId.value}`)
    
    if (!response.ok) {
      throw new Error(`获取结果失败，状态码: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      error.value = data.error
    } else {
      resultData.value = data
      processResults()
      
      // 如果状态为完成，停止自动刷新
      if (data.status === 'Stopped' || data.status === 'Completed') {
        stopResultRefresh()
      }
    }
  } catch (err) {
    console.error('Fetch results error:', err)
    error.value = err instanceof Error ? err.message : '获取结果失败'
  } finally {
    loading.value = false // 确保无论结果如何都重置loading状态
  }
}

// 处理结果数据
const processResults = () => {
  if (!resultData.value || !resultData.value.results) return
  
  processedResults.value = resultData.value.results.map((result: any) => {
    // 处理路径信息
    let hops = []
    
    // 适配RIPE Atlas格式
    if (result.result && Array.isArray(result.result)) {
      hops = result.result.map((hop: any) => {
        const hopNumber = hop.hop || 0
        
        // 处理每个hop的结果数组
        if (hop.result && Array.isArray(hop.result)) {
          // 从三次测量中选择第一个有响应的结果
          const validResponse = hop.result.find((r: any) => r.from && !r.x)
          
          if (validResponse) {
            return {
              hop: hopNumber,
              address: validResponse.from,
              rtt: validResponse.rtt,
              size: validResponse.size,
              ttl: validResponse.ttl
            }
          } else {
            // 如果全部为*，则显示为超时
            return {
              hop: hopNumber,
              address: '* * *',
              rtt: null
            }
          }
        }
        
        // 向后兼容其他可能的格式
        return {
          hop: hopNumber,
          address: hop.from || hop.ip || hop.addr || '* * *',
          rtt: hop.rtt || hop.latency,
          as: hop.as,
          asn: hop.asn
        }
      })
    } else if (result.traceroute && Array.isArray(result.traceroute)) {
      hops = result.traceroute
    } else if (result.path && Array.isArray(result.path)) {
      hops = result.path
    } else if (result.hops && Array.isArray(result.hops)) {
      hops = result.hops
    }
    
    // 判断是否成功
    let success = false
    
    // 检查是否有destination_ip_responded字段
    if (result.hasOwnProperty('destination_ip_responded')) {
      success = result.destination_ip_responded === true
    } else {
      // 如果没有该字段，则检查是否有最后一跳到达目标IP
      const targetIp = result.dst_addr || resultData.value.target
      
      // 对所有跃点进行检查，寻找目标IP
      success = hops.some((hop: any) => {
        if (!hop.address || hop.address === '* * *') return false
        
        // 如果是数组形式的结果
        if (hop.result && Array.isArray(hop.result)) {
          return hop.result.some((r: any) => r.from === targetIp)
        }
        
        // 直接匹配IP
        return hop.address === targetIp
      })
    }
    
    return {
      probe_id: result.prb_id || '未知',
      country: result.country_code || '未知',
      city: result.city || '',
      asn: result.as || result.asn_v4 || result.asn_v6 || '未知',
      hops: hops,
      success: success,
      ip: result.from || result.src_addr || '',
      loading_geo: true, // 标记正在加载地理位置
      latitude: result.latitude || null,
      longitude: result.longitude || null,
      
      // 保留原始数据便于调试
      _raw: result
    }
  })
  
  // 如果有选中的探针，确保它在处理后的结果中仍然存在
  if (selectedProbe.value && !processedResults.value.some(r => r.probe_id === selectedProbe.value)) {
    selectedProbe.value = ''
  }
  
  // 输出解析后的数据结构，用于调试
  console.log('处理后的路由追踪结果:', processedResults.value)
  
  // 获取地理位置信息
  fetchLocationInfo()
}

// 获取地理位置信息
const fetchLocationInfo = async () => {
  console.log('开始获取地理位置信息')
  loadingGeo.value = true // 设置地理信息加载状态
  
  // 如果GeoIP数据库尚未加载，尝试再次加载
  if (!dbLoaded.value) {
    dbLoaded.value = await loadGeoIpDatabase()
    if (!dbLoaded.value) {
      console.error('GeoIP数据库加载失败，无法获取地理位置信息')
      loadingGeo.value = false // 重置加载状态
      return
    }
  }
  
  let locationsFetched = false
  
  // 遍历每个探针
  for (const probe of processedResults.value) {
    if (!probe.ip) {
      probe.loading_geo = false
      continue
    }
    
    try {
      // 尝试使用API查询IP地理位置
      const geoData = await getIpGeoLocation(probe.ip)
      
      if (geoData && geoData.country) {
        // 成功获取到地理位置
        updateProbeWithGeoData(probe, geoData);
        locationsFetched = true;
      }
      
      // 获取跃点IP的地理位置信息
      if (probe.hops && probe.hops.length > 0) {
        for (const hop of probe.hops) {
          // 跳过无效IP或私有IP
          if (!hop.address || hop.address === '* * *' || isPrivateIP(hop.address)) {
            continue
          }
          
          try {
            // 使用API查询跃点IP地理位置
            const hopGeoData = await getIpGeoLocation(hop.address)
            if (hopGeoData) {
              // 成功获取到地理位置
              updateHopWithGeoData(hop, hopGeoData);
            }
          } catch (err) {
            console.error(`获取跃点IP ${hop.address} 的地理位置失败:`, err)
          }
        }
      }
    } catch (err) {
      console.error(`获取探针IP ${probe.ip} 的地理位置失败:`, err)
    } finally {
      probe.loading_geo = false
    }
  }
  
  console.log('完成地理位置信息获取')
  
  // 如果没有获取到任何位置，尝试使用探针国家代码来填充位置数据
  if (!locationsFetched) {
    for (const probe of processedResults.value) {
      if (!probe.latitude && !probe.longitude && probe.country) {
        if (countryCenters[probe.country]) {
          const countryData = countryCenters[probe.country];
          const [lat, lng] = countryData.loc.split(',').map(Number);
          
          probe.latitude = lat;
          probe.longitude = lng;
          probe.country_name = countryData.country_name;
          
          // 添加一点随机偏移，使得同一国家的点不会完全重叠
          probe.latitude += (Math.random() - 0.5) * 2;
          probe.longitude += (Math.random() - 0.5) * 2;
          
          console.log(`使用国家中心位置 ${probe.country} 用于探针 ${probe.probe_id}`);
          locationsFetched = true;
        }
      }
    }
  }
  
  loadingGeo.value = false // 地理信息加载完成
  
  // 有效坐标检查 - 仅用于日志记录
  const probesWithCoords = processedResults.value.filter(
    probe => probe.latitude && probe.longitude
  )
  
  console.log(`地理信息加载完成，有 ${probesWithCoords.length} 个探针有有效坐标`)
  
  // 不再在这里调用initMap，而是通过loadingGeo状态监听器来处理
  if (probesWithCoords.length === 0) {
    mapError.value = '无法获取任何探针的地理位置信息'
  }
}

// 更新探针的地理位置信息
const updateProbeWithGeoData = (probe: any, geoData: any) => {
  probe.country = geoData.country || probe.country;
  probe.country_name = geoData.country_name || geoData.country || probe.country_name;
  probe.city = geoData.city || probe.city;
  
  // 提取ASN - 优先使用明确的ASN字段
  if (geoData.asn) {
    probe.asn = geoData.asn;
  } else if (geoData.org) {
    // 尝试从org中提取ASN
    const asnMatch = geoData.org.match(/^AS(\d+)/);
    if (asnMatch && asnMatch[1]) {
      probe.asn = asnMatch[1];
    } else {
      // 尝试提取纯数字部分
      const numericMatch = geoData.org.match(/(\d+)/);
      if (numericMatch && numericMatch[1]) {
        probe.asn = numericMatch[1];
      } else {
        probe.asn = geoData.org;
      }
    }
  }
  
  probe.geo = geoData;
  
  // 更新地理坐标用于地图显示
  if (geoData.loc) {
    const [lat, lng] = geoData.loc.split(',').map(Number);
    probe.latitude = lat;
    probe.longitude = lng;
    console.log(`获取探针IP ${probe.ip} 的地理位置成功: ${geoData.loc}`);
  } else if (geoData.latitude && geoData.longitude) {
    probe.latitude = geoData.latitude;
    probe.longitude = geoData.longitude;
    console.log(`获取探针IP ${probe.ip} 的地理位置成功: ${geoData.latitude},${geoData.longitude}`);
  }
};

// 更新跃点的地理位置信息
const updateHopWithGeoData = (hop: any, geoData: any) => {
  hop.geo = geoData;
  
  // 提取ASN - 优先使用明确的ASN字段
  if (geoData.asn) {
    hop.geo.asn = geoData.asn;
  } else if (geoData.org) {
    // 尝试从org中提取ASN
    const asnMatch = geoData.org.match(/^AS(\d+)/);
    if (asnMatch && asnMatch[1]) {
      hop.geo.asn = asnMatch[1];
    } else {
      // 尝试提取纯数字部分
      const numericMatch = geoData.org.match(/(\d+)/);
      if (numericMatch && numericMatch[1]) {
        hop.geo.asn = numericMatch[1];
      } else {
        hop.geo.asn = geoData.org;
      }
    }
  }
  
  // 更新跃点坐标
  if (geoData.loc) {
    const [lat, lng] = geoData.loc.split(',').map(Number);
    hop.latitude = lat;
    hop.longitude = lng;
    console.log(`获取跃点IP ${hop.address} 的地理位置成功: ${geoData.loc}`);
  } else if (geoData.latitude && geoData.longitude) {
    hop.latitude = geoData.latitude;
    hop.longitude = geoData.longitude;
    console.log(`获取跃点IP ${hop.address} 的地理位置成功: ${geoData.latitude},${geoData.longitude}`);
  }
};

// 计算平均跃点数
const calculateAverageHops = () => {
  if (!processedResults.value.length) return 0
  
  const validResults = processedResults.value.filter(r => r.hops && r.hops.length > 0)
  if (!validResults.length) return 0
  
  const sum = validResults.reduce((acc, result) => acc + result.hops.length, 0)
  return Math.round(sum / validResults.length)
}

// 计算成功率
const calculateSuccessRate = () => {
  if (!processedResults.value.length) return 0
  
  const successfulResults = processedResults.value.filter(r => r.success)
  return Math.round((successfulResults.length / processedResults.value.length) * 100)
}

// 开始自动刷新结果
const startResultRefresh = () => {
  stopResultRefresh() // 先停止之前的刷新
  
  // 立即获取一次结果
  fetchResults()
  
  // 设置定时刷新
  refreshInterval.value = setInterval(() => {
    fetchResults()
  }, 5000) // 每5秒刷新一次
}

// 停止自动刷新结果
const stopResultRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 页面卸载时清理地图
onUnmounted(() => {
  stopResultRefresh()
  
  // 清理事件监听器
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 清理自动收起计时器
  if (autoCollapseTimer !== null) {
    clearTimeout(autoCollapseTimer)
    autoCollapseTimer = null
  }
  
  if (map) {
    try {
      console.log('清理地图实例')
      markers.forEach(marker => {
        if (marker) map.removeLayer(marker);
      });
      markers = [];
      
      // 清除路径线条和标记
      clearPathLines();
      
      map.remove();
      map = null;
    } catch (e) {
      console.error('清理地图时出错:', e)
    }
  }
  
  // 清理全屏地图
  if (fullscreenMap) {
    try {
      fullscreenMap.remove();
      fullscreenMap = null;
    } catch (e) {
      console.error('清理全屏地图时出错:', e)
    }
  }
})

// 监控选中的探针变化
watch(selectedProbe, (newValue) => {
  if (newValue) {
    // 可以在这里添加额外的操作，如获取更详细的探针数据
    console.log('Selected probe:', newValue)
  }
})

// 监听地理信息加载状态
watch(loadingGeo, (isLoading) => {
  if (!isLoading) {
    // 地理信息加载完成，检查是否有有效坐标
    const probesWithCoords = processedResults.value.filter(
      probe => probe.latitude && probe.longitude
    )
    
    console.log(`地理信息加载完成，有 ${probesWithCoords.length} 个探针有有效坐标`)
    
    if (probesWithCoords.length === 0) {
      // 检查是否已设置API KEY
      if (!apiKeyMasked.value) {
        mapError.value = '未找到有效的地理位置信息，请设置IPInfo API Key'
        showApiKeyModal.value = true  // 自动打开API KEY设置对话框
      } else {
        mapError.value = '没有探针具有有效的地理位置信息，请检查API KEY设置'
      }
      loadingMap.value = false
    } else {
      // 有有效坐标，初始化地图
      setTimeout(() => {
        initMap().catch(err => {
          console.error('初始化地图失败:', err)
          mapError.value = '无法加载地图: ' + (err instanceof Error ? err.message : '未知错误')
        })
      }, 100)
    }
  }
})

// 监听结果数据变化
watch(() => resultData.value, (newData) => {
  if (newData) {
    // 如果已有地图实例，清理它以便重新创建
    if (map) {
      try {
        markers.forEach(marker => {
          if (marker) map.removeLayer(marker);
        });
        markers = [];
        map.remove();
        map = null;
      } catch (e) {
        console.error('清理地图时发生错误:', e);
      }
    }
  }
}, { deep: true });

// 页面加载时检查URL参数和加载GeoIP数据库
onMounted(async () => {
  // 加载GeoIP数据库
  dbLoaded.value = await loadGeoIpDatabase()
  
  // 更新API KEY显示
  updateApiKeyDisplay()
  
  // 获取URL查询参数
  const route = useRoute()
  
  // 检查URL是否包含测量ID作为查询参数
  const queryString = window.location.search
  if (queryString && queryString.startsWith('?') && !queryString.includes('=')) {
    // 提取测量ID
    const measId = queryString.substring(1).trim()
    if (measId && /^\d+$/.test(measId)) {
      // 设置ID并加载结果
      measurementId.value = measId
      loading.value = true
      console.log('从URL参数加载测量结果:', measId)
      
      // 直接调用一次，不使用自动刷新
      fetchResults().catch(err => {
        console.error('加载测量结果出错:', err)
        loading.value = false
        error.value = '加载测量结果失败'
      })
    }
  }
  
  // 预先加载Leaflet库
  loadLeaflet().catch(err => {
    console.error('预加载Leaflet库失败:', err)
  })
})

// 显示设置API KEY弹窗
const openApiKeyModal = () => {
  apiKeyInput.value = getApiKey() || '';
  showApiKeyModal.value = true;
}

// 关闭API KEY弹窗
const closeApiKeyModal = () => {
  showApiKeyModal.value = false;
}

// 保存API KEY
const saveApiKey = () => {
  if (apiKeyInput.value.trim()) {
    setApiKey(apiKeyInput.value.trim());
    updateApiKeyDisplay();
  } else {
    // 清除API KEY
    localStorage.removeItem('ipipinfo_api_key');
    apiKeyMasked.value = '';
  }
  closeApiKeyModal();
}

// 更新API KEY显示
const updateApiKeyDisplay = () => {
  const key = getApiKey();
  const defaultKey = '29a9fd77d1bd76';
  
  if (key && key !== defaultKey) {
    // 显示API KEY的前4位和后4位，中间用*代替
    if (key.length > 8) {
      apiKeyMasked.value = `${key.substring(0, 4)}****${key.substring(key.length - 4)}`;
    } else {
      apiKeyMasked.value = '****' + key.substring(key.length - 2);
    }
  } else {
    apiKeyMasked.value = '';
  }
}

// 复制分享链接
const copyShareLink = () => {
  if (!measurementId.value) return
  
  const url = `${window.location.origin}${window.location.pathname}?${measurementId.value}`
  navigator.clipboard.writeText(url)
    .then(() => {
      showCopiedMessage.value = true
      setTimeout(() => {
        showCopiedMessage.value = false
      }, 2000)
    })
    .catch(err => {
      console.error('复制链接失败:', err)
    })
}

// 初始化地图
const initMap = async () => {
  if (!processedResults.value.length) {
    console.error('没有处理结果，无法初始化地图')
    return
  }
  
  // 确保地图容器存在
  const mapContainer = document.getElementById('ripe-map')
  if (!mapContainer) {
    console.error('找不到地图容器元素')
    mapError.value = '地图容器不存在'
    return
  }
  
  loadingMap.value = true
  mapError.value = ''
  
  try {
    // 确保Leaflet已经加载
    if (!window.L) {
      console.log('开始加载Leaflet库')
      await loadLeaflet()
      console.log('Leaflet库加载完成')
    }
    
    // 清理旧的地图实例
    if (map) {
      console.log('清理现有地图实例')
      markers.forEach(marker => {
        if (marker) map.removeLayer(marker)
      })
      markers = []
      map.remove()
      map = null
    }
    
    // 清空地图容器内容
    mapContainer.innerHTML = ''
    
    // 重置地图样式，确保容器可见
    mapContainer.style.height = '400px'
    mapContainer.style.width = '100%'
    
    console.log('初始化新地图实例')
    // 初始化地图
    map = window.L.map('ripe-map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18
    })
    
    // 添加地图底图
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ['a', 'b', 'c']
    }).addTo(map)
    
    console.log('地图初始化完成')
    
    // 计算有多少探针有有效的地理坐标
    const probesWithCoords = processedResults.value.filter(
      probe => probe.latitude && probe.longitude
    )
    
    console.log(`有 ${probesWithCoords.length} 个探针有有效坐标`)
    
    if (probesWithCoords.length === 0) {
      mapError.value = '没有探针具有有效的地理位置信息'
      loadingMap.value = false
      return
    }
    
    // 创建标记
    probesWithCoords.forEach(probe => {
      // 根据成功/失败状态选择不同的图标颜色
      const markerColor = probe.success ? '#10b981' : '#ef4444'
      
      // 创建自定义图标
      const markerIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="width:10px;height:10px;border-radius:50%;background-color:${markerColor};box-shadow:0 0 0 2px rgba(255,255,255,0.5);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        popupAnchor: [0, -5]
      })
      
      // 创建标记并添加到地图
      const marker = window.L.marker([probe.latitude, probe.longitude], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`
          <div class="map-popup-content">
            <div class="popup-title">探针 ${probe.probe_id}</div>
            <div class="popup-location">${probe.country_name || probe.country || '未知国家'}, ${probe.city || '未知城市'}</div>
            <div class="popup-detail">
              <div class="detail-item">
                <span class="label">ASN:</span>
                <span class="value">${probe.asn ? 'AS'+probe.asn : '未知'}</span>
              </div>
              <div class="detail-item">
                <span class="label">状态:</span>
                <span class="value ${probe.success ? 'success' : 'error'}">${probe.success ? '成功' : '失败'}</span>
              </div>
              <div class="detail-item">
                <span class="label">跃点数:</span>
                <span class="value">${probe.hops?.length || 0}</span>
              </div>
            </div>
          </div>
        `, { className: 'map-custom-popup' })
      
      markers.push(marker)
      
      // 当选中探针时，自动打开其弹窗
      if (selectedProbe.value && probe.probe_id === selectedProbe.value) {
        marker.openPopup()
      }
    })
    
    console.log(`已添加 ${markers.length} 个标记点到地图`)
    
    // 如果所有探针位置都已知，调整地图视图以包含所有标记
    if (markers.length > 0) {
      try {
        const group = window.L.featureGroup(markers)
        const bounds = group.getBounds()
        if (bounds.isValid()) {
          console.log('设置地图边界以显示所有标记')
          map.fitBounds(bounds.pad(0.1))
        } else {
          console.log('标记边界无效，使用默认视图')
          map.setView([20, 0], 2)
        }
      } catch (e) {
        console.error('设置地图边界失败:', e)
        map.setView([20, 0], 2)
      }
    }
    
    // 强制重新渲染地图
    setTimeout(() => {
      if (map) map.invalidateSize()
    }, 100)
  } catch (err) {
    console.error('地图初始化失败:', err)
    mapError.value = '地图加载失败: ' + (err instanceof Error ? err.message : String(err))
  } finally {
    loadingMap.value = false
  }
}

// 加载Leaflet库
const loadLeaflet = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (window.L) {
        console.log('Leaflet已加载，直接使用')
        resolve()
        return
      }
      
      console.log('开始动态加载Leaflet库')
      
      // 加载CSS
      const linkElement = document.createElement('link')
      linkElement.rel = 'stylesheet'
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      linkElement.crossOrigin = ''
      document.head.appendChild(linkElement)
      
      // 加载JS
      const scriptElement = document.createElement('script')
      scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      scriptElement.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      scriptElement.crossOrigin = ''
      
      scriptElement.onload = () => {
        console.log('Leaflet库加载成功')
        if (window.L) {
          // 加载旋转标记插件
          loadRotatedMarker().then(() => {
            resolve();
          }).catch(err => {
            console.warn('旋转标记插件加载失败，将继续使用无旋转功能', err);
            resolve();
          });
        } else {
          reject(new Error('Leaflet加载完成但L对象不存在'))
        }
      }
      
      scriptElement.onerror = (e) => {
        console.error('Leaflet加载失败', e)
        reject(new Error('Failed to load Leaflet: Network error'))
      }
      
      document.head.appendChild(scriptElement)
    } catch (e) {
      console.error('加载Leaflet时发生异常:', e)
      reject(e)
    }
  })
}

// 加载旋转标记插件
const loadRotatedMarker = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      // 检查是否已加载
      if (window.L && window.L.Marker.prototype.setRotationAngle) {
        resolve();
        return;
      }
      
      // 内联旋转标记插件代码，避免额外请求
      const pluginCode = `
        (function() {
          // 在标记原型上添加旋转角度方法
          L.Marker.prototype.options.rotationAngle = 0;
          
          L.Marker.prototype.setRotationAngle = function(angle) {
            this.options.rotationAngle = angle;
            
            // 如果已有图标和元素，直接应用旋转
            if (this._icon) {
              this._icon.style.transform = this._icon.style.transform || '';
              this._icon.style.transform += ' rotate(' + angle + 'deg)';
            }
            
            return this;
          };
          
          // 添加到原始创建图标的方法
          const originalOnAdd = L.Marker.prototype.onAdd;
          
          L.Marker.prototype.onAdd = function(map) {
            originalOnAdd.call(this, map);
            
            if (this.options.rotationAngle) {
              this.setRotationAngle(this.options.rotationAngle);
            }
          };
        })();
      `;
      
      // 创建脚本元素并添加到文档
      const scriptElement = document.createElement('script');
      scriptElement.textContent = pluginCode;
      document.head.appendChild(scriptElement);
      
      // 插件已加载
      resolve();
    } catch (e) {
      console.error('加载旋转标记插件时发生异常:', e);
      reject(e);
    }
  });
};

// 监听selectedProbe变化，更新地图上高亮的探针
watch(selectedProbe, (newValue) => {
  if (!newValue || !map) return;
  
  // 清除之前的路径线条和弹窗
  clearPathLines();
  
  const probeData = processedResults.value.find(probe => probe.probe_id === newValue);
  if (!probeData) return;
  
  // 绘制路由路径
  drawTraceroutePath(probeData);
});

// 存储路径线条和标记的数组
let pathLines: any[] = [];
let pathMarkers: any[] = [];

// 清除之前的路径线条和标记
const clearPathLines = () => {
  if (!map) return;
  
  // 移除所有路径线条
  pathLines.forEach(line => {
    if (line) map.removeLayer(line);
  });
  pathLines = [];
  
  // 移除所有路径标记
  pathMarkers.forEach(marker => {
    if (marker) map.removeLayer(marker);
  });
  pathMarkers = [];
};

// 绘制路由追踪路径
const drawTraceroutePath = (probeData: any) => {
  if (!map || !probeData || !probeData.hops || probeData.hops.length === 0) return;
  
  console.log('绘制路由路径，探针:', probeData.probe_id);
  
  // 隐藏其他探针标记
  markers.forEach(marker => {
    if (marker) map.removeLayer(marker);
  });
  
  // 创建探针位置作为起始点对象
  const probeStartPoint = {
    address: probeData.ip,
    hop: 0,
    rtt: 0,
    latitude: probeData.latitude,
    longitude: probeData.longitude,
    geo: {
      country: probeData.country,
      country_name: probeData.country_name || countryCenters[probeData.country]?.country_name,
      city: probeData.city,
      asn: probeData.asn,
      org: probeData._raw?.as_v4_name || probeData._raw?.as_v6_name || ''
    },
    isProbe: true
  };
  
  // 检查探针是否有有效位置
  const hasValidProbeLocation = probeData.latitude && probeData.longitude;
  
  // 设置当前路径跃点供表格使用，包含起始探针点
  const allHops = hasValidProbeLocation ? [probeStartPoint, ...probeData.hops] : [...probeData.hops];
  currentPathHops.value = allHops;
  
  // 过滤出有效跃点用于地图显示(有地理位置数据且非私有IP)
  let validHops = probeData.hops.filter((hop: any) => 
    hop.address && 
    hop.address !== '* * *' && 
    !isPrivateIP(hop.address) &&
    hop.geo && 
    hop.latitude && 
    hop.longitude
  );
  
  if (validHops.length === 0) {
    console.log('没有有效的路由跃点可以显示');
    return;
  }
  
  // 处理起点（探针位置）
  let startPointAdded = false;
  
  // 优先使用探针的真实位置
  if (hasValidProbeLocation) {
    validHops = [probeStartPoint, ...validHops];
    startPointAdded = true;
    console.log('使用探针真实位置作为起点:', probeStartPoint.latitude, probeStartPoint.longitude);
  } 
  // 如果没有真实位置，尝试使用国家中心位置
  else if (probeData.country && countryCenters[probeData.country]) {
    const countryData = countryCenters[probeData.country];
    const [lat, lng] = countryData.loc.split(',').map(Number);
    
    // 创建一个从国家中心到第一跳的虚拟起点
    const virtualStartPoint = {
      ...probeStartPoint,
      latitude: lat,
      longitude: lng,
      geo: {
        ...probeStartPoint.geo,
        country_name: countryData.country_name
      },
      isVirtualStart: true
    };
    
    validHops = [virtualStartPoint, ...validHops];
    startPointAdded = true;
    console.log('使用国家中心位置作为起点:', lat, lng);
  }
  // 如果都没有，使用第一跳位置附近的点作为虚拟起点
  else if (validHops.length > 0) {
    const firstHop = validHops[0];
    // 创建一个偏移的虚拟起点
    const virtualStartPoint = {
      ...probeStartPoint,
      latitude: firstHop.latitude + (Math.random() - 0.5) * 3,
      longitude: firstHop.longitude + (Math.random() - 0.5) * 3,
      isVirtualStart: true
    };
    
    validHops = [virtualStartPoint, ...validHops];
    startPointAdded = true;
    console.log('使用第一跳附近位置作为虚拟起点');
  }
  
  if (!startPointAdded) {
    console.log('无法添加起点，将只显示跃点');
  }
  
  console.log(`绘制路径: 有${validHops.length}个有效跃点，包含起点: ${startPointAdded}`);
  
  // 创建连线
  for (let i = 0; i < validHops.length - 1; i++) {
    const from = validHops[i];
    const to = validHops[i + 1];
    
    // 创建线条 - 使用实线替代虚线
    const line = window.L.polyline(
      [
        [from.latitude, from.longitude],
        [to.latitude, to.longitude]
      ], 
      {
    color: '#3b82f6',
        weight: 2,
        opacity: 0.8,
        smoothFactor: 1,
        className: 'traceroute-path'
      }
    ).addTo(map);
    
    pathLines.push(line);
  }
  
  // 为每个跃点创建标记
  validHops.forEach((hop: any, index: number) => {
    // 使用不同样式标记起始点、中间点和终点
    let markerColor;
    if (hop.isProbe || hop.isVirtualStart) {
      markerColor = '#10b981'; // 起始点(探针)为绿色
    } else if (index === validHops.length - 1) {
      markerColor = '#ef4444'; // 终点为红色
    } else {
      markerColor = '#3b82f6'; // 中间点为蓝色
    }
    
    // 标记大小根据重要性设置
    const markerSize = (hop.isProbe || hop.isVirtualStart || index === validHops.length - 1) ? 10 : 6;
    
    // 创建自定义图标
    const markerIcon = window.L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        width:${markerSize}px;
        height:${markerSize}px;
        border-radius:50%;
        background-color:${markerColor};
        box-shadow:0 0 0 2px rgba(255,255,255,0.5);
      "></div>`,
      iconSize: [markerSize, markerSize],
      iconAnchor: [markerSize/2, markerSize/2],
      popupAnchor: [0, -markerSize/2]
    });
    
    // 创建ASN和地点显示文本
    const hopCountry = hop.geo?.country_name || countryCenters[hop.geo?.country]?.country_name || hop.geo?.country || '未知';
    const hopCity = hop.geo?.city ? `, ${hop.geo.city}` : '';
    const hopAsn = hop.geo?.asn ? `AS${hop.geo.asn}` : '';
    const hopOrg = hop.geo?.org && (!hop.geo.asn || !hop.geo.org.includes(hop.geo.asn)) ? hop.geo.org : '';
    
    // 格式化跃点/节点信息
    let hopLabel = '未知';
    if (hop.isProbe) {
      hopLabel = `探针 ${probeData.probe_id}`;
    } else if (hop.isVirtualStart) {
      hopLabel = `探针 ${probeData.probe_id} (估计位置)`;
    } else {
      hopLabel = `跃点 ${hop.hop || index}`;
    }
    
    const hopAddress = hop.address || 'Unknown';
    const hopRtt = hop.rtt ? `${hop.rtt} ms` : '';
    
    // 创建标记并添加到地图
    const marker = window.L.marker([hop.latitude, hop.longitude], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`
        <div class="map-popup-content">
          <div class="popup-title">${hopLabel}</div>
          <div class="popup-addr">${hopAddress}</div>
          <div class="popup-location">
            <i class="fas fa-globe-americas mr-1 opacity-50"></i>
            ${hopCountry}${hopCity}
        </div>
          <div class="popup-detail">
            ${hopRtt ? `<div class="detail-item">
              <span class="label">延迟:</span>
              <span class="value">${hopRtt}</span>
            </div>` : ''}
            ${hopAsn || hopOrg ? `<div class="detail-item">
              <span class="label">ASN:</span>
              <span class="value">${hopAsn} ${hopOrg}</span>
            </div>` : ''}
            <div class="detail-item">
              <span class="label">序号:</span>
              <span class="value">${index}/${validHops.length-1}</span>
          </div>
          </div>
          </div>
      `, { className: 'map-custom-popup' });
    
    pathMarkers.push(marker);
  });
  
  // 调整地图视图以显示整个路径
  try {
    const group = window.L.featureGroup([...pathLines, ...pathMarkers]);
    const bounds = group.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.1));
    }
  } catch (e) {
    console.error('设置路径边界失败:', e);
  }
};

const isFullscreenMap = ref(false)
let fullscreenMap: any = null
const isTableMinimized = ref(false)
const isTableCollapsed = ref(false)
const routeTableWindow = ref<HTMLElement | null>(null)
const currentPathHops = ref<any[]>([])
let isDragging = false
let dragOffsetX = 0
let dragOffsetY = 0
let autoCollapseTimer: number | null = null
let isMouseOverTable = false

// 鼠标进入表格
const handleMouseEnter = () => {
  isMouseOverTable = true;
  
  // 如果表格处于折叠状态，自动展开
  if (isTableCollapsed.value && !isTableMinimized.value) {
    toggleTableCollapse();
  }
};

// 鼠标离开表格
const handleMouseLeave = () => {
  isMouseOverTable = false;
};

// 切换表格收起/展开状态
const toggleTableCollapse = () => {
  isTableCollapsed.value = !isTableCollapsed.value;
  
  // 如果是展开，重置到左下角位置
  if (!isTableCollapsed.value && routeTableWindow.value) {
    // 延迟执行以确保动画完成后才设置位置
    setTimeout(() => {
      if (routeTableWindow.value && !isDragging) {
        routeTableWindow.value.style.left = '16px';
        routeTableWindow.value.style.bottom = '16px';
        routeTableWindow.value.style.top = 'auto';
      }
    }, 350);
  }
};

// 开始拖动表格窗口
const startDrag = (event: MouseEvent) => {
  // 忽略来自按钮的点击事件
  if ((event.target as HTMLElement).closest('button')) return;
  
  const element = routeTableWindow.value;
  if (!element) return;
  
  isDragging = true;
  
  // 记录鼠标位置和元素当前位置的偏移量
  const rect = element.getBoundingClientRect();
  dragOffsetX = event.clientX - rect.left;
  dragOffsetY = event.clientY - rect.top;
  
  // 添加移动和释放事件处理器
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  
  // 防止选中文本等默认行为
  event.preventDefault();
};

// 处理拖动移动
const handleDrag = (event: MouseEvent) => {
  if (!isDragging || !routeTableWindow.value) return;
  
  // 如果表格处于折叠状态，拖动时自动展开
  if (isTableCollapsed.value) {
    isTableCollapsed.value = false;
  }
  
  const element = routeTableWindow.value;
  
  // 计算新位置，确保不超出窗口边界
  const newLeft = Math.max(0, Math.min(window.innerWidth - element.offsetWidth, event.clientX - dragOffsetX));
  const newTop = Math.max(0, Math.min(window.innerHeight - element.offsetHeight, event.clientY - dragOffsetY));
  
  // 设置新位置
  element.style.left = `${newLeft}px`;
  element.style.top = `${newTop}px`;
  element.style.bottom = 'auto';
};

// 停止拖动
const stopDrag = () => {
  isDragging = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  
  // 移除自动折叠功能
};

// 清除选中的探针
const clearSelectedProbe = () => {
  selectedProbe.value = ''
  currentPathHops.value = []
  isTableMinimized.value = false
  isTableCollapsed.value = false
  
  // 如果处于全屏模式，退出全屏
  if (isFullscreenMap.value) {
    toggleFullscreenMap()
  }
  
  // 重新显示所有探针标记
  if (map) {
    markers.forEach(marker => {
      if (marker) map.addLayer(marker)
    })
  }
  
  // 清除路径线条
  clearPathLines()
}

// 切换地图全屏显示
const toggleFullscreenMap = () => {
  isFullscreenMap.value = !isFullscreenMap.value
  
  if (isFullscreenMap.value) {
    // 进入全屏模式时，确保表格处于展开状态
    isTableCollapsed.value = false;
    isTableMinimized.value = false;
    
    // 进入全屏模式
    nextTick(() => {
      const fullscreenContainer = document.getElementById('fullscreen-map')
      if (!fullscreenContainer) return
      
      // 创建全屏地图
      fullscreenMap = window.L.map('fullscreen-map', {
        center: map ? map.getCenter() : [20, 0],
        zoom: map ? map.getZoom() : 2,
        minZoom: 1,
        maxZoom: 18
      })
      
      // 添加地图底图
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c']
      }).addTo(fullscreenMap)
      
      // 复制原地图上的路径线条到全屏地图
      pathLines.forEach(line => {
        if (!line) return;
        
        try {
          const latLngs = line.getLatLngs()
          window.L.polyline(latLngs, {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.8,
            smoothFactor: 1,
            className: 'traceroute-path'
          }).addTo(fullscreenMap)
        } catch (e) {
          console.error('复制路径线条失败:', e)
        }
      })
      
      // 复制原地图上的标记到全屏地图
      pathMarkers.forEach(marker => {
        if (!marker) return;
        
        try {
          const pos = marker.getLatLng()
          const icon = marker.options.icon
          const popup = marker.getPopup()
          
          const newMarker = window.L.marker(pos, { icon }).addTo(fullscreenMap)
          
          if (popup) {
            newMarker.bindPopup(popup.getContent(), { className: 'map-custom-popup' })
          }
        } catch (e) {
          console.error('复制标记失败:', e)
        }
      })
      
      // 设置地图视图以包含所有标记
      try {
        if (pathLines.length > 0 || pathMarkers.length > 0) {
          const allFeatures: any[] = [];
          
          // 收集所有有效的路径和标记
          pathLines.forEach(line => {
            if (line) allFeatures.push(line);
          });
          
          pathMarkers.forEach(marker => {
            if (marker) allFeatures.push(marker);
          });
          
          if (allFeatures.length > 0) {
            const group = window.L.featureGroup(allFeatures);
            const bounds = group.getBounds();
            if (bounds.isValid()) {
              fullscreenMap.fitBounds(bounds.pad(0.1));
            }
          }
        }
      } catch (e) {
        console.error('设置全屏地图边界失败:', e)
      }
      
      // 重置表格窗口状态
      isTableMinimized.value = false
      isTableCollapsed.value = false
      
      // 设置表格窗口初始位置
      nextTick(() => {
        if (routeTableWindow.value) {
          routeTableWindow.value.style.left = '16px';
          routeTableWindow.value.style.bottom = '16px';
          routeTableWindow.value.style.top = 'auto';
          
          // 防止可拖动窗口在初始显示时闪烁
          setTimeout(() => {
            if (routeTableWindow.value) {
              routeTableWindow.value.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }
          }, 100);
        }
      });
    })
  } else {
    // 退出全屏模式
    if (fullscreenMap) {
      fullscreenMap.remove()
      fullscreenMap = null
    }
  }
}
</script>

<style scoped>
.card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: rgba(9, 111, 220, 0.3);
  background-color: rgba(255, 255, 255, 0.05);
}

.input, .select {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input:focus, .select:focus {
  box-shadow: none;
  border-color: rgba(255, 255, 255, 0.1);
  outline: none;
}

.join {
  display: flex;
  align-items: stretch;
}

.join > .join-item:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.join > .join-item:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

/* 表格样式 */
.table th {
  background-color: rgba(var(--b2), 0.5);
  color: rgba(var(--bc), 0.7);
}

.table td {
  border-color: rgba(var(--b3), 0.2);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 统计卡片样式 */
.stats {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
  font-size: 1.75rem;
}

/* 地图样式 */
#ripe-map, #fullscreen-map {
  height: 400px;
  width: 100%;
  z-index: 1;
}

#fullscreen-map {
  height: 100%;
}

:global(.custom-div-icon) {
  background: transparent;
  border: none;
}

:global(.traceroute-path) {
  animation: flow 1.5s linear infinite;
}

@keyframes flow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 20;
  }
}

:global(.leaflet-popup-content) {
  margin: 5px;
}

:global(.leaflet-container) {
  font-family: inherit;
}

.loading-container {
  position: relative;
}

.loading-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 999;
  border-radius: 0.5rem;
}

/* 地图标记弹出窗口样式 */
:global(.map-custom-popup) {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:global(.map-custom-popup .leaflet-popup-content-wrapper) {
  background-color: rgba(var(--b1), 0.75);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  overflow: hidden;
}

:global(.map-custom-popup .leaflet-popup-content) {
  margin: 0;
  padding: 0;
  width: auto !important;
}

:global(.map-custom-popup .leaflet-popup-tip) {
  background-color: rgba(var(--b1), 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:global(.map-popup-content) {
  padding: 10px;
  min-width: 180px;
}

:global(.map-popup-content .popup-title) {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 5px;
  text-align: center;
  color: rgba(var(--pc), 1);
}

:global(.map-popup-content .popup-addr) {
  font-family: monospace;
  font-size: 0.8rem;
  margin-bottom: 5px;
  text-align: center;
  color: rgba(var(--bc), 0.8);
}

:global(.map-popup-content .popup-location) {
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-align: center;
  color: rgba(var(--bc), 0.9);
}

:global(.map-popup-content .popup-detail) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
}

:global(.map-popup-content .detail-item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:global(.map-popup-content .label) {
  color: rgba(var(--bc), 0.7);
}

:global(.map-popup-content .value) {
  font-weight: 500;
  color: rgba(var(--bc), 0.9);
}

:global(.map-popup-content .success) {
  color: rgba(var(--su), 0.9);
}

:global(.map-popup-content .error) {
  color: rgba(var(--er), 0.9);
}

/* 可拖动窗口样式 */
.route-table-window {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform-origin: bottom left;
  width: 45% !important; /* 增加表格宽度 */
  max-height: 70% !important; /* 增加表格高度 */
}

.route-table-window.minimized {
  height: 40px !important;
  width: auto !important;
  overflow: hidden;
  transform: translateY(0) !important;
  bottom: 16px !important;
  left: 16px !important;
  top: auto !important;
}

.route-table-window.collapsed {
  transform: translateY(calc(100% - 40px));
  width: 140px !important;
  bottom: 16px !important;
  left: 16px !important;
  top: auto !important;
}

.route-table-window.expanded {
  transform: translateY(0);
}

.window-header {
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 表格样式优化 */
.route-table-window .table {
  background: transparent;
}

.route-table-window .table th {
  position: sticky;
  top: 0;
  background-color: rgba(var(--b3), 0.7);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.route-table-window .table td {
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
}

@media (max-width: 768px) {
  .route-table-window {
    width: 90% !important;
  }
}
</style> 