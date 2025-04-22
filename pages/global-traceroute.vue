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
                        :class="{'loading-container': loadingMap}"
                      >
                        <div v-if="loadingMap" class="flex h-full items-center justify-center">
                          <span class="loading loading-spinner loading-md"></span>
                          <span class="ml-2">加载地图中...</span>
                        </div>
                      </div>
                      <div v-if="!loadingMap && mapError" class="text-error text-center mt-2">
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
                            <tr v-for="(hop, index) in selectedProbeData.hops" :key="index">
                              <td>{{ hop.hop || index + 1 }}</td>
                              <td class="font-mono">{{ hop.address || '* * *' }}</td>
                              <td>{{ hop.rtt ? hop.rtt + ' ms' : '-' }}</td>
                              <td>
                                <template v-if="hop.address && hop.address !== '* * *'">
                                  <template v-if="hop.geo">
                                    <i class="fas fa-globe-americas mr-1 opacity-50"></i>
                                    {{ hop.geo.country_name || countryCenters[hop.geo.country]?.country_name || hop.geo.country || '未知' }}
                                    <span v-if="hop.geo.city">, {{ hop.geo.city }}</span>
                                  </template>
                                  <span v-else-if="isPrivateIP(hop.address)" class="text-base-content/50">
                                    <i class="fas fa-home mr-1 opacity-50"></i>
                                    私有地址
                                  </span>
                                  <span v-else class="text-base-content/50">
                                    <i class="fas fa-spinner fa-spin mr-1 opacity-50"></i>
                                    正在查询
                                  </span>
                                </template>
                                <span v-else>-</span>
                              </td>
                              <td>
                                <template v-if="hop.address && hop.address !== '* * *'">
                                  <template v-if="hop.geo && (hop.geo.org || hop.geo.asn)">
                                    <span class="text-xs whitespace-nowrap">
                                      <i class="fas fa-network-wired mr-1 opacity-50"></i>
                                      <template v-if="hop.geo.asn && hop.geo.org && !hop.geo.org.includes(hop.geo.asn)">
                                        AS{{ hop.geo.asn }} {{ hop.geo.org }}
                                      </template>
                                      <template v-else-if="hop.geo.asn">
                                        AS{{ hop.geo.asn }}
                                      </template>
                                      <template v-else>
                                        {{ hop.geo.org }}
                                      </template>
                                    </span>
                                  </template>
                                  <span v-else-if="!isPrivateIP(hop.address)" class="text-xs text-base-content/50">
                                    <i class="fas fa-spinner fa-spin mr-1 opacity-50"></i>
                                    正在查询
                                  </span>
                                </template>
                                <span v-else>-</span>
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
      success = hops.some(hop => {
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
  
  // 如果GeoIP数据库尚未加载，尝试再次加载
  if (!dbLoaded.value) {
    dbLoaded.value = await loadGeoIpDatabase()
    if (!dbLoaded.value) {
      console.error('GeoIP数据库加载失败，无法获取地理位置信息')
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
  
  // 只有当至少有一个位置信息被获取到时才加载地图
  if (locationsFetched) {
    // 延迟一点时间初始化地图，确保DOM已更新
    setTimeout(() => {
      initMap()
    }, 100)
  } else {
    loadingMap.value = false
    mapError.value = '无法获取任何探针的地理位置信息'
  }
}

// 更新探针的地理位置信息
const updateProbeWithGeoData = (probe, geoData) => {
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
const updateHopWithGeoData = (hop, geoData) => {
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

// 页面卸载时清除定时器
onUnmounted(() => {
  stopResultRefresh()
})

// 监控选中的探针变化
watch(selectedProbe, (newValue) => {
  if (newValue) {
    // 可以在这里添加额外的操作，如获取更详细的探针数据
    console.log('Selected probe:', newValue)
  }
})

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

// 地图相关
const loadingMap = ref(false)
const mapError = ref('')
let map: any = null
let markers: any[] = []

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
          resolve()
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

// 监听selectedProbe变化，更新地图上高亮的探针
watch(selectedProbe, (newValue) => {
  if (!newValue || !map || !markers.length) return;
  
  const probeIndex = processedResults.value.findIndex(probe => probe.probe_id === newValue);
  if (probeIndex >= 0 && probeIndex < markers.length) {
    const marker = markers[probeIndex];
    marker.openPopup();
    
    // 将地图中心移动到标记位置
    const latLng = marker.getLatLng();
    map.setView(latLng, 6);
  }
});

// 当结果数据变化时，重新初始化地图
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

// 页面卸载时清理地图
onUnmounted(() => {
  stopResultRefresh()
  
  if (map) {
    try {
      console.log('清理地图实例')
      markers.forEach(marker => {
        if (marker) map.removeLayer(marker);
      });
      markers = [];
      map.remove();
      map = null;
    } catch (e) {
      console.error('清理地图时出错:', e)
    }
  }
})
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
#ripe-map {
  height: 400px;
  width: 100%;
  z-index: 1;
}

:global(.custom-div-icon) {
  background: transparent;
  border: none;
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
</style> 