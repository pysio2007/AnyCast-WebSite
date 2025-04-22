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
  const date = new Date(dateString)
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
    const countryCenters = {
      // 北美洲
      'US': { loc: "39.8283,-95.5795", country_name: "United States" },
      'CA': { loc: "56.1304,-106.3468", country_name: "Canada" },
      'MX': { loc: "23.6345,-102.5528", country_name: "Mexico" },
      'GT': { loc: "15.7835,-90.2308", country_name: "Guatemala" },
      'BZ': { loc: "17.1899,-88.4976", country_name: "Belize" },
      'SV': { loc: "13.7942,-88.8965", country_name: "El Salvador" },
      'HN': { loc: "15.1991,-86.2419", country_name: "Honduras" },
      'NI': { loc: "12.8654,-85.2072", country_name: "Nicaragua" },
      'CR': { loc: "9.7489,-83.7534", country_name: "Costa Rica" },
      'PA': { loc: "8.5380,-80.7821", country_name: "Panama" },
      'CU': { loc: "21.5218,-77.7812", country_name: "Cuba" },
      'JM': { loc: "18.1096,-77.2975", country_name: "Jamaica" },
      'HT': { loc: "18.9712,-72.2852", country_name: "Haiti" },
      'DO': { loc: "18.7357,-70.1627", country_name: "Dominican Republic" },
      'PR': { loc: "18.2208,-66.5901", country_name: "Puerto Rico" },
      'BS': { loc: "25.0343,-77.3963", country_name: "Bahamas" },
      'TT': { loc: "10.6918,-61.2225", country_name: "Trinidad and Tobago" },
      'BB': { loc: "13.1939,-59.5432", country_name: "Barbados" },

      // 南美洲
      'BR': { loc: "-14.2350,-51.9253", country_name: "Brazil" },
      'AR': { loc: "-38.4161,-63.6167", country_name: "Argentina" },
      'CL': { loc: "-35.6751,-71.5430", country_name: "Chile" },
      'CO': { loc: "4.5709,-74.2973", country_name: "Colombia" },
      'PE': { loc: "-9.1900,-75.0152", country_name: "Peru" },
      'VE': { loc: "6.4238,-66.5897", country_name: "Venezuela" },
      'EC': { loc: "-1.8312,-78.1834", country_name: "Ecuador" },
      'BO': { loc: "-16.2902,-63.5887", country_name: "Bolivia" },
      'PY': { loc: "-23.4425,-58.4438", country_name: "Paraguay" },
      'UY': { loc: "-32.5228,-55.7658", country_name: "Uruguay" },
      'GY': { loc: "4.8604,-58.9302", country_name: "Guyana" },
      'SR': { loc: "3.9193,-56.0278", country_name: "Suriname" },

      // 欧洲
      'RU': { loc: "61.5240,105.3188", country_name: "Russia" },
      'DE': { loc: "51.1657,10.4515", country_name: "Germany" },
      'GB': { loc: "55.3781,-3.4360", country_name: "United Kingdom" },
      'FR': { loc: "46.6034,1.8883", country_name: "France" },
      'IT': { loc: "41.8719,12.5674", country_name: "Italy" },
      'ES': { loc: "40.4637,-3.7492", country_name: "Spain" },
      'UA': { loc: "48.3794,31.1656", country_name: "Ukraine" },
      'PL': { loc: "51.9194,19.1451", country_name: "Poland" },
      'RO': { loc: "45.9432,24.9668", country_name: "Romania" },
      'NL': { loc: "52.1326,5.2913", country_name: "Netherlands" },
      'BE': { loc: "50.5039,4.4699", country_name: "Belgium" },
      'GR': { loc: "39.0742,21.8243", country_name: "Greece" },
      'CZ': { loc: "49.8175,15.4730", country_name: "Czech Republic" },
      'PT': { loc: "39.3999,-8.2245", country_name: "Portugal" },
      'SE': { loc: "60.1282,18.6435", country_name: "Sweden" },
      'HU': { loc: "47.1625,19.5033", country_name: "Hungary" },
      'BY': { loc: "53.7098,27.9534", country_name: "Belarus" },
      'AT': { loc: "47.5162,14.5501", country_name: "Austria" },
      'CH': { loc: "46.8182,8.2275", country_name: "Switzerland" },
      'BG': { loc: "42.7339,25.4858", country_name: "Bulgaria" },
      'DK': { loc: "56.2639,9.5018", country_name: "Denmark" },
      'FI': { loc: "61.9241,25.7482", country_name: "Finland" },
      'SK': { loc: "48.6690,19.6990", country_name: "Slovakia" },
      'NO': { loc: "60.4720,8.4689", country_name: "Norway" },
      'IE': { loc: "53.1424,-7.6921", country_name: "Ireland" },
      'HR': { loc: "45.1000,15.2000", country_name: "Croatia" },
      'BA': { loc: "43.9159,17.6791", country_name: "Bosnia and Herzegovina" },
      'AL': { loc: "41.1533,20.1683", country_name: "Albania" },
      'LT': { loc: "55.1694,23.8813", country_name: "Lithuania" },
      'MK': { loc: "41.6086,21.7453", country_name: "North Macedonia" },
      'SI': { loc: "46.1512,14.9955", country_name: "Slovenia" },
      'LV': { loc: "56.8796,24.6032", country_name: "Latvia" },
      'EE': { loc: "58.5953,25.0136", country_name: "Estonia" },
      'CY': { loc: "35.1264,33.4299", country_name: "Cyprus" },
      'LU': { loc: "49.8153,6.1296", country_name: "Luxembourg" },
      'MT': { loc: "35.9375,14.3754", country_name: "Malta" },
      'IS': { loc: "64.9631,-19.0208", country_name: "Iceland" },
      'AD': { loc: "42.5462,1.6016", country_name: "Andorra" },
      'MC': { loc: "43.7384,7.4246", country_name: "Monaco" },
      'LI': { loc: "47.1660,9.5554", country_name: "Liechtenstein" },
      'SM': { loc: "43.9424,12.4578", country_name: "San Marino" },
      'VA': { loc: "41.9029,12.4534", country_name: "Vatican City" },
      'RS': { loc: "44.0165,21.0059", country_name: "Serbia" },
      'ME': { loc: "42.7087,19.3744", country_name: "Montenegro" },
      'XK': { loc: "42.6026,20.9030", country_name: "Kosovo" },
      'MD': { loc: "47.4116,28.3699", country_name: "Moldova" },

      // 亚洲
      'CN': { loc: "35.8617,104.1954", country_name: "China" },
      'IN': { loc: "20.5937,78.9629", country_name: "India" },
      'ID': { loc: "-0.7893,113.9213", country_name: "Indonesia" },
      'PK': { loc: "30.3753,69.3451", country_name: "Pakistan" },
      'BD': { loc: "23.6850,90.3563", country_name: "Bangladesh" },
      'JP': { loc: "36.2048,138.2529", country_name: "Japan" },
      'PH': { loc: "12.8797,121.7740", country_name: "Philippines" },
      'VN': { loc: "14.0583,108.2772", country_name: "Vietnam" },
      'TR': { loc: "38.9637,35.2433", country_name: "Turkey" },
      'IR': { loc: "32.4279,53.6880", country_name: "Iran" },
      'TH': { loc: "15.8700,100.9925", country_name: "Thailand" },
      'KR': { loc: "35.9078,127.7669", country_name: "South Korea" },
      'IQ': { loc: "33.2232,43.6793", country_name: "Iraq" },
      'AF': { loc: "33.9391,67.7100", country_name: "Afghanistan" },
      'SA': { loc: "23.8859,45.0792", country_name: "Saudi Arabia" },
      'MY': { loc: "4.2105,101.9758", country_name: "Malaysia" },
      'YE': { loc: "15.5527,48.5164", country_name: "Yemen" },
      'NP': { loc: "28.3949,84.1240", country_name: "Nepal" },
      'LK': { loc: "7.8731,80.7718", country_name: "Sri Lanka" },
      'KZ': { loc: "48.0196,66.9237", country_name: "Kazakhstan" },
      'SY': { loc: "34.8021,38.9968", country_name: "Syria" },
      'MM': { loc: "21.9162,95.9560", country_name: "Myanmar" },
      'JO': { loc: "30.5852,36.2384", country_name: "Jordan" },
      'AZ': { loc: "40.1431,47.5769", country_name: "Azerbaijan" },
      'AE': { loc: "23.4241,53.8478", country_name: "United Arab Emirates" },
      'IL': { loc: "31.0461,34.8516", country_name: "Israel" },
      'LB': { loc: "33.8547,35.8623", country_name: "Lebanon" },
      'KG': { loc: "41.2044,74.7661", country_name: "Kyrgyzstan" },
      'TJ': { loc: "38.8610,71.2761", country_name: "Tajikistan" },
      'TM': { loc: "38.9697,59.5563", country_name: "Turkmenistan" },
      'KP': { loc: "40.3399,127.5101", country_name: "North Korea" },
      'KW': { loc: "29.3117,47.4818", country_name: "Kuwait" },
      'OM': { loc: "21.4735,55.9754", country_name: "Oman" },
      'PS': { loc: "31.9522,35.2332", country_name: "Palestine" },
      'QA': { loc: "25.3548,51.1839", country_name: "Qatar" },
      'BH': { loc: "26.0667,50.5577", country_name: "Bahrain" },
      'TL': { loc: "-8.8742,125.7275", country_name: "Timor-Leste" },
      'BT': { loc: "27.5142,90.4336", country_name: "Bhutan" },
      'MN': { loc: "46.8625,103.8467", country_name: "Mongolia" },
      'SG': { loc: "1.3521,103.8198", country_name: "Singapore" },
      'HK': { loc: "22.3193,114.1694", country_name: "Hong Kong" },
      'MO': { loc: "22.1987,113.5439", country_name: "Macau" },
      'TW': { loc: "23.6978,120.9605", country_name: "Taiwan" },
      'UZ': { loc: "41.3775,64.5853", country_name: "Uzbekistan" },
      'AM': { loc: "40.0691,45.0382", country_name: "Armenia" },
      'GE': { loc: "42.3154,43.3569", country_name: "Georgia" },
      'BN': { loc: "4.5353,114.7277", country_name: "Brunei" },
      'MV': { loc: "3.2028,73.2207", country_name: "Maldives" },

      // 非洲
      'NG': { loc: "9.0820,8.6753", country_name: "Nigeria" },
      'ET': { loc: "9.1450,40.4897", country_name: "Ethiopia" },
      'EG': { loc: "26.8206,30.8025", country_name: "Egypt" },
      'CD': { loc: "-4.0383,21.7587", country_name: "Democratic Republic of the Congo" },
      'ZA': { loc: "-30.5595,22.9375", country_name: "South Africa" },
      'TZ': { loc: "-6.3690,34.8888", country_name: "Tanzania" },
      'KE': { loc: "0.0236,37.9062", country_name: "Kenya" },
      'DZ': { loc: "28.0339,1.6596", country_name: "Algeria" },
      'SD': { loc: "12.8628,30.2176", country_name: "Sudan" },
      'MA': { loc: "31.7917,-7.0926", country_name: "Morocco" },
      'UG': { loc: "1.3733,32.2903", country_name: "Uganda" },
      'MZ': { loc: "-18.6657,35.5296", country_name: "Mozambique" },
      'GH': { loc: "7.9465,-1.0232", country_name: "Ghana" },
      'AO': { loc: "-11.2027,17.8739", country_name: "Angola" },
      'CI': { loc: "7.5400,-5.5471", country_name: "Ivory Coast" },
      'CM': { loc: "7.3697,12.3547", country_name: "Cameroon" },
      'MG': { loc: "-18.7669,46.8691", country_name: "Madagascar" },
      'BF': { loc: "12.2383,-1.5616", country_name: "Burkina Faso" },
      'NE': { loc: "17.6078,8.0817", country_name: "Niger" },
      'ML': { loc: "17.5707,-3.9962", country_name: "Mali" },
      'MW': { loc: "-13.2543,34.3015", country_name: "Malawi" },
      'ZM': { loc: "-13.1339,27.8493", country_name: "Zambia" },
      'SN': { loc: "14.4974,-14.4524", country_name: "Senegal" },
      'TD': { loc: "15.4542,18.7322", country_name: "Chad" },
      'SO': { loc: "5.1521,46.1996", country_name: "Somalia" },
      'ZW': { loc: "-19.0154,29.1549", country_name: "Zimbabwe" },
      'GN': { loc: "9.9456,-9.6966", country_name: "Guinea" },
      'RW': { loc: "-1.9403,29.8739", country_name: "Rwanda" },
      'BJ': { loc: "9.3077,2.3158", country_name: "Benin" },
      'BI': { loc: "-3.3731,29.9189", country_name: "Burundi" },
      'TN': { loc: "33.8869,9.5375", country_name: "Tunisia" },
      'SS': { loc: "6.8770,31.3070", country_name: "South Sudan" },
      'TG': { loc: "8.6195,0.8248", country_name: "Togo" },
      'SL': { loc: "8.4606,-11.7799", country_name: "Sierra Leone" },
      'LY': { loc: "26.3351,17.2283", country_name: "Libya" },
      'CG': { loc: "-0.2280,15.8277", country_name: "Republic of the Congo" },
      'LR': { loc: "6.4281,-9.4295", country_name: "Liberia" },
      'CF': { loc: "6.6111,20.9394", country_name: "Central African Republic" },
      'MR': { loc: "21.0079,-10.9408", country_name: "Mauritania" },
      'ER': { loc: "15.1794,39.7823", country_name: "Eritrea" },
      'NA': { loc: "-22.9576,18.4904", country_name: "Namibia" },
      'GM': { loc: "13.4432,-15.3101", country_name: "Gambia" },
      'BW': { loc: "-22.3285,24.6849", country_name: "Botswana" },
      'GA': { loc: "-0.8037,11.6094", country_name: "Gabon" },
      'LS': { loc: "-29.6100,28.2336", country_name: "Lesotho" },
      'GQ': { loc: "1.6508,10.2679", country_name: "Equatorial Guinea" },
      'MU': { loc: "-20.3484,57.5522", country_name: "Mauritius" },
      'DJ': { loc: "11.8251,42.5903", country_name: "Djibouti" },
      'CV': { loc: "16.5388,-23.0418", country_name: "Cape Verde" },
      'KM': { loc: "-11.6455,43.3333", country_name: "Comoros" },
      'SZ': { loc: "-26.5225,31.4659", country_name: "Eswatini" },
      'SC': { loc: "-4.6796,55.4920", country_name: "Seychelles" },
      'ST': { loc: "0.1864,6.6131", country_name: "São Tomé and Príncipe" },

      // 大洋洲
      'AU': { loc: "-25.2744,133.7751", country_name: "Australia" },
      'PG': { loc: "-6.3150,143.9555", country_name: "Papua New Guinea" },
      'NZ': { loc: "-40.9006,174.8860", country_name: "New Zealand" },
      'FJ': { loc: "-17.7134,178.0650", country_name: "Fiji" },
      'SB': { loc: "-9.6457,160.1562", country_name: "Solomon Islands" },
      'VU': { loc: "-15.3767,166.9592", country_name: "Vanuatu" },
      'WS': { loc: "-13.7590,-172.1046", country_name: "Samoa" },
      'TO': { loc: "-21.1790,-175.1982", country_name: "Tonga" },
      'KI': { loc: "-3.3704,-168.7340", country_name: "Kiribati" },
      'FM': { loc: "7.4256,150.5508", country_name: "Micronesia" },
      'MH': { loc: "7.1315,171.1845", country_name: "Marshall Islands" },
      'PW': { loc: "7.5150,134.5825", country_name: "Palau" },
      'TV': { loc: "-7.1095,177.6493", country_name: "Tuvalu" },
      'NR': { loc: "-0.5228,166.9315", country_name: "Nauru" },
      
      // 特殊区域
      'AQ': { loc: "-75.2501,-0.0713", country_name: "Antarctica" },
      'GL': { loc: "71.7069,-42.6043", country_name: "Greenland" },
      'AS': { loc: "-14.3064,-170.6950", country_name: "American Samoa" },
      'GU': { loc: "13.4443,144.7937", country_name: "Guam" },
      'MP': { loc: "15.0979,145.6739", country_name: "Northern Mariana Islands" },
      'VI': { loc: "18.3358,-64.8963", country_name: "U.S. Virgin Islands" },
      'GF': { loc: "3.9339,-53.1258", country_name: "French Guiana" },
      'NC': { loc: "-20.9043,165.6180", country_name: "New Caledonia" },
      'PF': { loc: "-17.6797,-149.4068", country_name: "French Polynesia" },
      'PM': { loc: "46.9419,-56.2711", country_name: "Saint Pierre and Miquelon" },
      'WF': { loc: "-13.7687,-177.1560", country_name: "Wallis and Futuna" },
      'YT': { loc: "-12.8275,45.1662", country_name: "Mayotte" },
    };
    
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
          <div style="padding:5px;text-align:center;">
            <div style="font-weight:bold;">探针 ${probe.probe_id}</div>
            <div>${probe.country_name || probe.country || '未知国家'}, ${probe.city || '未知城市'}</div>
            <div style="font-size:0.75rem;">${probe.asn || '未知 ASN'}</div>
            <div style="font-size:0.75rem;margin-top:4px;">${probe.success ? '✅ 成功' : '❌ 失败'}</div>
            <div style="font-size:0.75rem;">跃点数: ${probe.hops?.length || 0}</div>
          </div>
        `)
      
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
</style> 