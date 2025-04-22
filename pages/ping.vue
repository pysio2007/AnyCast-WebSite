<template>
  <div class="container mx-auto p-4">
    <PageSeo 
      title="全球PING" 
      description="使用RIPE Atlas网络探针从全球各地对目标主机进行PING测试，分析网络延迟和可达性。"
    />
    <div class="card backdrop-blur-md bg-opacity-50 bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6 text-center justify-center">
          <i class="fas fa-globe-asia mr-2"></i>全球PING
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
                    @keyup.enter="performPing"
                  />
                  <button 
                    class="btn btn-primary join-item w-24"
                    @click="performPing"
                    :disabled="!canQuery"
                  >
                    <i class="fas fa-play mr-1"></i>
                    <span class="hidden sm:inline">测试</span>
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
                  正在启动全球 PING 测量...
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
                  
                  <!-- 数据可视化 -->
                  <div v-if="resultData.results && resultData.results.length > 0" class="mt-4">
                    <h3 class="text-lg font-semibold mb-4">
                      <i class="fas fa-chart-bar mr-1 opacity-70"></i>
                      测量结果
                    </h3>
                    
                    <!-- 结果统计 -->
                    <div class="stats shadow mb-4 bg-opacity-50 bg-base-200">
                      <div class="stat">
                        <div class="stat-title">探针数量</div>
                        <div class="stat-value">{{ resultData.results.length }}</div>
                        <div class="stat-desc">全球测量点</div>
                      </div>
                      
                      <div class="stat">
                        <div class="stat-title">平均延迟</div>
                        <div class="stat-value">{{ calculateAverageRtt() }} ms</div>
                        <div class="stat-desc">全球平均</div>
                      </div>
                      
                      <div class="stat">
                        <div class="stat-title">延迟范围</div>
                        <div class="stat-value">{{ calculateMinRtt() }}-{{ calculateMaxRtt() }} ms</div>
                        <div class="stat-desc">最小-最大</div>
                      </div>
                      
                      <div class="stat">
                        <div class="stat-title">丢包率</div>
                        <div class="stat-value">{{ calculatePacketLoss() }}%</div>
                        <div class="stat-desc">平均</div>
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
                            <span class="inline-block w-3 h-3 rounded-full bg-[#4ade80] mr-1"></span>
                            ≤15ms
                          </div>
                          <div class="flex items-center">
                            <span class="inline-block w-3 h-3 rounded-full bg-[#10b981] mr-1"></span>
                            ≤60ms
                          </div>
                          <div class="flex items-center">
                            <span class="inline-block w-3 h-3 rounded-full bg-warning mr-1"></span>
                            ≤180ms
                          </div>
                          <div class="flex items-center">
                            <span class="inline-block w-3 h-3 rounded-full bg-error mr-1"></span>
                            >180ms
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
                    
                    <!-- 结果表格 -->
                    <div class="overflow-x-auto">
                      <table class="table table-sm w-full">
                        <thead>
                          <tr>
                            <th>探针</th>
                            <th>位置</th>
                            <th>ASN</th>
                            <th>延迟 (ms)</th>
                            <th>丢包率</th>
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
                                {{ result.country_name || result.country || '未知' }}
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
                            <td>
                              <div class="flex flex-col">
                                <span>{{ result.avg_rtt || '-' }}</span>
                                <span class="text-xs opacity-70">{{ result.min_rtt || '-' }} - {{ result.max_rtt || '-' }}</span>
                              </div>
                            </td>
                            <td>
                              <span :class="result.packet_loss > 0 ? 'text-error' : 'text-success'">
                                {{ result.packet_loss }}%
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
import { loadGeoIpDatabase, getIpGeoLocation, isPrivateIP, getApiKey, setApiKey } from '~/utils/geoip'

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
const selectedProbe = ref('') // 当前选中的探针ID
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

// 执行PING测量
const performPing = async () => {
  if (!canQuery.value) return
  
  loading.value = true
  error.value = ''
  measurementId.value = ''
  resultData.value = null
  processedResults.value = []
  
  try {
    const response = await fetch(`${apiUrl}/api/ping?target=${encodeURIComponent(target.value)}&probes=${probes.value}&ipv=${ipv.value}`)
    
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
    console.error('PING error:', err)
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
    // 计算丢包率
    const sent = result.sent || 0
    const rcvd = result.rcvd || 0
    let packetLoss = 0
    if (sent > 0) {
      packetLoss = Math.round(((sent - rcvd) / sent) * 100)
    }

    // 处理延迟值 (-1表示所有包都丢失)
    const minRtt = result.min !== undefined && result.min >= 0 ? Math.round(result.min * 1000) / 1000 : 0
    const avgRtt = result.avg !== undefined && result.avg >= 0 ? Math.round(result.avg * 1000) / 1000 : 0
    const maxRtt = result.max !== undefined && result.max >= 0 ? Math.round(result.max * 1000) / 1000 : 0
    
    return {
      probe_id: result.prb_id || '未知',
      country: result.country_code || '未知',
      city: result.city || '',
      asn: result.as || result.asn_v4 || result.asn_v6 || '未知',
      min_rtt: minRtt,
      avg_rtt: avgRtt,
      max_rtt: maxRtt,
      packet_loss: packetLoss,
      ip: result.from || '',
      loading_geo: true, // 标记正在加载地理位置
      
      // 保留原始数据便于调试
      _raw: result
    }
  })
  
  // 尝试按平均延迟排序 (仅排序有效值)
  processedResults.value.sort((a, b) => {
    // 如果两者都是0，保持原顺序
    if (a.avg_rtt === 0 && b.avg_rtt === 0) return 0
    // 如果a是0，b排前面
    if (a.avg_rtt === 0) return 1
    // 如果b是0，a排前面
    if (b.avg_rtt === 0) return -1
    // 正常排序
    return a.avg_rtt - b.avg_rtt
  })
  
  // 输出解析后的数据结构，用于调试
  console.log('处理后的结果数据:', processedResults.value)
  
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
  
  // 遍历每个探针
  for (const probe of processedResults.value) {
    if (!probe.ip) {
      probe.loading_geo = false
      continue
    }
    
    try {
      // 使用本地数据库查询IP地理位置
      const geoData = await getIpGeoLocation(probe.ip)
      
      if (geoData) {
        // 更新探针信息
        probe.country = geoData.country || probe.country
        probe.country_name = geoData.country_name
        probe.city = geoData.city || probe.city
        probe.asn = geoData.asn || geoData.org || probe.asn
        probe.geo = geoData
        
        // 更新地理坐标用于地图显示
        if (geoData.latitude && geoData.longitude) {
          probe.latitude = geoData.latitude;
          probe.longitude = geoData.longitude;
        } else if (geoData.loc) {
          const [lat, lng] = geoData.loc.split(',').map(Number);
          probe.latitude = lat;
          probe.longitude = lng;
        }
        
        console.log(`获取IP ${probe.ip} 的地理位置成功:`, geoData)
      }
    } catch (err) {
      console.error(`获取IP ${probe.ip} 的地理位置失败:`, err)
    } finally {
      probe.loading_geo = false
    }
  }
  
  console.log('完成地理位置信息获取')
  loadingGeo.value = false // 地理信息加载完成
}

// 计算平均延迟
const calculateAverageRtt = () => {
  if (!processedResults.value.length) return 0
  
  const sum = processedResults.value.reduce((acc, result) => acc + result.avg_rtt, 0)
  return Math.round(sum / processedResults.value.length)
}

// 计算最小延迟
const calculateMinRtt = () => {
  if (!processedResults.value.length) return 0
  
  return Math.min(...processedResults.value.map(r => r.min_rtt))
}

// 计算最大延迟
const calculateMaxRtt = () => {
  if (!processedResults.value.length) return 0
  
  return Math.max(...processedResults.value.map(r => r.max_rtt))
}

// 计算丢包率
const calculatePacketLoss = () => {
  if (!processedResults.value.length) return 0
  
  const sum = processedResults.value.reduce((acc, result) => acc + result.packet_loss, 0)
  return Math.round(sum / processedResults.value.length)
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
})

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

// 添加地图相关变量
const loadingMap = ref(false)
const loadingGeo = ref(false)
const mapError = ref('')
let map: any = null
let markers: any[] = []

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
      
      // 使用CDN加载Leaflet CSS
      const linkElement = document.createElement('link')
      linkElement.rel = 'stylesheet'
      linkElement.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(linkElement)
      
      // 使用CDN加载Leaflet JS
      const scriptElement = document.createElement('script')
      scriptElement.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
      
      scriptElement.onload = () => {
        console.log('Leaflet库加载成功')
        setTimeout(() => resolve(), 100) // 给浏览器一点时间来处理
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
    
    // 准备地图容器
    mapContainer.innerHTML = ''
    mapContainer.style.height = '400px'
    mapContainer.style.width = '100%'
    
    // 创建一个新的div元素，这样可以避免可能的DOM问题
    const mapDiv = document.createElement('div')
    mapDiv.id = 'leaflet-map'
    mapDiv.style.height = '100%'
    mapDiv.style.width = '100%'
    mapContainer.appendChild(mapDiv)
    
    console.log('初始化地图')
    
    // 创建地图实例
    map = window.L.map('leaflet-map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18
    })
    
    // 添加高可靠度的地图图层 - 使用CartoDB的Voyager底图
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map)
    
    // 等待地图完成初始渲染
    map.on('load', () => console.log('地图加载完成'))
    
    // 计算有多少探针有有效的地理坐标
    const probesWithCoords = processedResults.value.filter(
      probe => probe.latitude && probe.longitude
    )
    
    console.log(`有 ${probesWithCoords.length} 个探针有有效坐标`)
    
    // 如果没有有效的地理位置信息，显示错误
    if (probesWithCoords.length === 0) {
      mapError.value = '没有探针具有有效的地理位置信息'
      loadingMap.value = false
      return
    }
    
    // 计算延迟的最小值和最大值，用于颜色映射
    const rtts = probesWithCoords.map(probe => probe.avg_rtt).filter(rtt => rtt > 0 && rtt < 10000)
    const minRtt = Math.min(...rtts)
    const maxRtt = Math.max(...rtts)
    const medianRtt = calculateMedianRtt()
    
    // 根据延迟返回颜色
    const getRttColor = (rtt) => {
      if (rtt <= 0 || rtt >= 10000) return '#ef4444' // 失败或异常值，红色
      
      if (rtt <= 15) {
        return '#4ade80' // 15ms以下，浅绿色
      } else if (rtt <= 60) {
        return '#10b981' // 60ms以下，深绿色
      } else if (rtt <= 180) {
        return '#f59e0b' // 180ms以下，黄色
      } else {
        return '#ef4444' // 180ms以上，红色
      }
    }
    
    // 创建标记
    probesWithCoords.forEach(probe => {
      // 根据延迟选择不同的图标颜色
      const markerColor = getRttColor(probe.avg_rtt)
      
      // 创建自定义图标
      const markerIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="width:12px;height:12px;border-radius:50%;background-color:${markerColor};box-shadow:0 0 0 2px white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -6]
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
                <span class="label">平均延迟:</span>
                <span class="value">${probe.avg_rtt.toFixed(2)} ms</span>
              </div>
              <div class="detail-item">
                <span class="label">最小延迟:</span>
                <span class="value">${probe.min_rtt.toFixed(2)} ms</span>
              </div>
              <div class="detail-item">
                <span class="label">最大延迟:</span>
                <span class="value">${probe.max_rtt.toFixed(2)} ms</span>
              </div>
              <div class="detail-item">
                <span class="label">丢包率:</span>
                <span class="value ${probe.packet_loss > 0 ? 'error' : 'success'}">${probe.packet_loss.toFixed(1)}%</span>
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
    map.invalidateSize(true)
    
    // 额外添加一个重置地图大小的操作，确保完全渲染
    setTimeout(() => {
      if (map) {
        map.invalidateSize(true)
        console.log('地图尺寸已重新计算')
      }
    }, 300)
  } catch (err) {
    console.error('地图初始化失败:', err)
    mapError.value = '地图加载失败: ' + (err instanceof Error ? err.message : String(err))
  } finally {
    loadingMap.value = false
  }
}

// 计算中位数延迟
const calculateMedianRtt = () => {
  if (!processedResults.value.length) return 0
  
  const rtts = processedResults.value
    .map(r => r.avg_rtt)
    .filter(rtt => rtt > 0 && rtt < 10000)
    .sort((a, b) => a - b)
  
  if (rtts.length === 0) return 0
  const mid = Math.floor(rtts.length / 2)
  return rtts.length % 2 === 0 ? (rtts[mid - 1] + rtts[mid]) / 2 : rtts[mid]
}

// 页面卸载时清理地图
onUnmounted(() => {
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

// 监听resultData，当结果改变时自动处理并获取地理信息
watch(resultData, (newVal) => {
  if (newVal) {
    processResults()
    fetchLocationInfo()
  }
}, { deep: true })

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
        // 尝试再次获取位置信息
        setTimeout(() => {
          fetchLocationInfo()
        }, 2000)
      }
      loadingMap.value = false
    } else {
      // 有有效坐标，初始化地图
      initMap().catch(err => {
        console.error('初始化地图失败:', err)
        mapError.value = '无法加载地图: ' + (err instanceof Error ? err.message : '未知错误')
      })
    }
  }
})

// 加载GeoIP数据库和地图
onMounted(async () => {
  // 已有的其他初始化代码...
  
  // 提前加载Leaflet库
  loadLeaflet().catch(err => {
    console.error('预加载Leaflet库失败:', err)
  })
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

/* 地图相关样式 */
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

:global(.custom-div-icon) {
  background: transparent;
  border: none;
}

:global(.leaflet-popup-content) {
  margin: 5px;
}

:global(.leaflet-container) {
  font-family: inherit;
  background-color: rgba(var(--b2), 0.3);
}

:global(.leaflet-control-zoom a) {
  background-color: rgba(var(--b1), 0.7);
  color: rgba(var(--bc), 0.9);
  border: 1px solid rgba(var(--bc), 0.2);
}

:global(.leaflet-control-zoom a:hover) {
  background-color: rgba(var(--b1), 0.9);
}

:global(.leaflet-control-attribution) {
  background-color: rgba(var(--b1), 0.5);
  backdrop-filter: blur(4px);
}
</style> 