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
                    
                    <!-- 结果表格 -->
                    <div class="overflow-x-auto">
                      <table class="table table-sm w-full">
                        <thead>
                          <tr>
                            <th>探针</th>
                            <th>位置</th>
                            <th>ISP</th>
                            <th>最小延迟</th>
                            <th>平均延迟</th>
                            <th>最大延迟</th>
                            <th>丢包</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="result in processedResults" :key="result.probe_id">
                            <td>{{ result.probe_id }}</td>
                            <td>
                              <template v-if="result.loading_geo">
                                <span class="loading loading-dots loading-xs"></span>
                              </template>
                              <template v-else>
                                <i class="fas fa-globe-americas mr-1 opacity-50"></i>
                                {{ result.country || '未知' }}
                                <span v-if="result.city">, {{ result.city }}</span>
                              </template>
                            </td>
                            <td>
                              <template v-if="result.loading_geo">
                                <span class="loading loading-dots loading-xs"></span>
                              </template>
                              <template v-else>
                                <span class="text-xs whitespace-nowrap">
                                  {{ result.asn || '未知' }}
                                </span>
                              </template>
                            </td>
                            <td>{{ result.min_rtt }} ms</td>
                            <td>{{ result.avg_rtt }} ms</td>
                            <td>{{ result.max_rtt }} ms</td>
                            <td>{{ result.packet_loss }}%</td>
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

const target = ref('')
const probes = ref('200')
const ipv = ref('0')
const loading = ref(false)
const error = ref('')
const measurementId = ref('')
const resultData = ref<any>(null)
const processedResults = ref<any[]>([])
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
  const date = new Date(dateString)
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
  
  // 如果GeoIP数据库尚未加载，尝试再次加载
  if (!dbLoaded.value) {
    dbLoaded.value = await loadGeoIpDatabase()
    if (!dbLoaded.value) {
      console.error('GeoIP数据库加载失败，无法获取地理位置信息')
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
        
        console.log(`获取IP ${probe.ip} 的地理位置成功:`, geoData)
      }
    } catch (err) {
      console.error(`获取IP ${probe.ip} 的地理位置失败:`, err)
    } finally {
      probe.loading_geo = false
    }
  }
  
  console.log('完成地理位置信息获取')
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
</style> 