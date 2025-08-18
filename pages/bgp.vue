<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-8">
      <i class="fas fa-network-wired mr-2"></i>BGP 路由分析
    </h1>

    <div class="max-w-4xl mx-auto">
      <div class="card bg-base-200/50 backdrop-blur-md p-6">
        <!-- 查询表单 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-lg">查询目标</span>
            <span class="label-text-alt">
              {{ isSelectedDN42 ? '支持IPv4/IPv6地址或前缀' : '仅支持IPv6地址或前缀' }}
            </span>
          </label>
          <div class="flex gap-2">
            <input v-model="query" type="text" :placeholder="getPlaceholder" class="input input-bordered flex-1"
              @keyup.enter="handleQuery" />
            <button class="btn btn-primary min-w-[120px]" @click="handleQuery" :disabled="loading || !isValidInput">
              <i class="fas fa-search mr-2"></i>查询
            </button>
          </div>

          <!-- 输入验证提示 -->
          <div v-if="query && !isValidInput" class="mt-2 text-error text-sm">
            <i class="fas fa-exclamation-circle mr-1"></i>
            {{ validationMessage }}
          </div>

          <!-- 服务器选择 -->
          <div class="mt-4 grid md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">网络类型</span>
              </label>
              <div class="dropdown w-full">
                <label tabindex="0" class="btn btn-outline w-full justify-between">
                  <span>{{ networkType === 'dn42' ? 'DN42 网络' : '公网' }}</span>
                  <i class="fas fa-chevron-down"></i>
                </label>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full">
                  <li><a @click="networkType = 'dn42'">DN42 网络</a></li>
                  <li><a @click="networkType = 'internet'">公网</a></li>
                </ul>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">查询节点</span>
              </label>
              <div class="dropdown w-full">
                <label tabindex="0" class="btn btn-outline w-full justify-between">
                  <span>{{ selectedServers.length ? `已选择 ${selectedServers.length} 个节点` : '选择节点' }}</span>
                  <i class="fas fa-chevron-down"></i>
                </label>
                <ul tabindex="0"
                  class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-y-auto">
                  <li v-for="server in filteredServers" :key="server">
                    <a @click="toggleServer(server)"
                      class="flex items-center gap-2 px-4 py-2 hover:bg-base-300 rounded-lg transition-colors"
                      :class="{ 'bg-primary/10': selectedServers.includes(server) }">
                      <div class="flex-none w-5 h-5 rounded border-2 flex items-center justify-center"
                        :class="selectedServers.includes(server) ? 'border-primary bg-primary/20' : 'border-base-content/50'">
                        <i v-if="selectedServers.includes(server)" class="fas fa-check text-sm text-primary"></i>
                      </div>
                      {{ server }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="mt-6 text-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mt-6 alert alert-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>

        <!-- 结果显示 -->
        <div v-if="results.length" class="mt-6 space-y-4">
          <!-- 路由分析摘要 -->
          <div class="card bg-base-300">
            <div class="card-body p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="card-title text-lg">
                  <i class="fas fa-chart-line mr-2"></i>路由分析
                </h3>
                <div class="tabs tabs-boxed bg-base-200">
                  <a class="tab" :class="{ 'tab-active': activeTab === 'summary' }" @click="activeTab = 'summary'">
                    <i class="fas fa-list-ul mr-1"></i>摘要
                  </a>
                  <a class="tab" :class="{ 'tab-active': activeTab === 'visibility' }"
                    @click="activeTab = 'visibility'">
                    <i class="fas fa-eye mr-1"></i>可见性
                  </a>
                  <a class="tab" :class="{ 'tab-active': activeTab === 'whois' }" @click="activeTab = 'whois'">
                    <i class="fas fa-info-circle mr-1"></i>WHOIS
                  </a>
                  <a class="tab" :class="{ 'tab-active': activeTab === 'raw' }" @click="activeTab = 'raw'">
                    <i class="fas fa-code mr-1"></i>原始
                  </a>
                </div>
              </div>

              <!-- 摘要视图 -->
              <div v-if="activeTab === 'summary'" class="grid gap-4">
                <!-- 基本信息 -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div class="stat bg-base-200 rounded-box p-3">
                    <div class="stat-title text-xs">注册对象</div>
                    <div v-if="loadingWhois" class="stat-value text-lg">
                      <span class="loading loading-spinner loading-sm"></span>
                    </div>
                    <div v-else>
                      <div class="stat-value text-lg">{{ whoisData?.name || 'N/A' }}</div>
                      <div class="stat-desc">{{ whoisData?.description || '' }}</div>
                    </div>
                  </div>
                  <div class="stat bg-base-200 rounded-box p-3">
                    <div class="stat-title text-xs">路由表</div>
                    <div class="stat-value text-lg">{{ routeSummary.table || 'N/A' }}</div>
                  </div>
                  <div class="stat bg-base-200 rounded-box p-3">
                    <div class="stat-title text-xs">协议</div>
                    <div class="stat-value text-lg">{{ routeSummary.protocol || 'N/A' }}</div>
                  </div>
                  <div class="stat bg-base-200 rounded-box p-3">
                    <div class="stat-title text-xs">状态</div>
                    <div class="stat-value text-lg">{{ routeSummary.status || 'N/A' }}</div>
                  </div>
                </div>

                <!-- AS路径 -->
                <div v-if="routeSummary.asPath" class="bg-base-200 rounded-box p-3">
                  <div class="text-sm font-semibold mb-2">AS路径</div>
                  <div class="flex flex-wrap gap-2">
                    <div v-for="(asn, index) in routeSummary.asPath" :key="index" class="flex items-center">
                      <span class="badge badge-primary">AS{{ asn }}</span>
                      <i v-if="index < routeSummary.asPath.length - 1"
                        class="fas fa-chevron-right mx-1 text-xs opacity-50"></i>
                    </div>
                  </div>
                </div>

                <!-- 下一跳 -->
                <div v-if="routeSummary.nextHops.length" class="bg-base-200 rounded-box p-3">
                  <div class="text-sm font-semibold mb-2">下一跳</div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="hop in routeSummary.nextHops" :key="hop" class="badge badge-secondary">
                      {{ hop }}
                    </span>
                  </div>
                </div>

                <!-- Communities -->
                <div v-if="routeSummary.communities.length" class="bg-base-200 rounded-box p-3">
                  <div class="text-sm font-semibold mb-2">BGP Community</div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="community in routeSummary.communities" :key="community" class="badge badge-accent">
                      {{ community }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 可见性分析视图 -->
              <div v-else-if="activeTab === 'visibility'" class="space-y-4">
                <!-- 加载动画 -->
                <div v-if="loadingVisibility" class="flex justify-center items-center py-8">
                  <div class="loading loading-spinner loading-lg text-primary"></div>
                  <span class="ml-2">正在检测路由可见性...</span>
                </div>

                <template v-else>
                  <!-- 可见性统计 -->
                  <div class="stats shadow bg-base-200">
                    <div class="stat">
                      <div class="stat-title">RIS 可见性</div>
                      <div class="stat-value text-primary">{{ visibilityData?.risVisibilityPercent }}%</div>
                      <div class="stat-desc">在 {{ visibilityData?.risTotal }} 个 RIS 节点中可见</div>
                    </div>
                    <div class="stat">
                      <div class="stat-title">Pysio Networks 可见性</div>
                      <div class="stat-value text-primary">{{ visibilityData?.pysioVisibilityPercent }}%</div>
                      <div class="stat-desc">在我们的节点中可见</div>
                    </div>
                  </div>

                  <!-- 探测点列表 -->
                  <div class="overflow-x-auto">
                    <table class="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>探测点</th>
                          <th>类型</th>
                          <th class="text-center">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="probe in visibilityData?.probes" :key="probe.name"
                          :class="{ 'bg-base-200': probe.type === 'custom' }">
                          <td>
                            <div class="flex items-center gap-2">
                              {{ probe.name }}
                            </div>
                          </td>
                          <td>{{ probe.type === 'ris' ? 'RIPE RIS' : 'Looking Glass' }}</td>
                          <td class="text-center">
                            <span :class="probe.visible ? 'text-success' : 'text-error'">
                              <i class="fas" :class="probe.visible ? 'fa-check' : 'fa-times'"></i>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
              </div>

              <!-- WHOIS信息视图 -->
              <div v-else-if="activeTab === 'whois'" class="grid gap-4">
                <div class="bg-base-200 rounded-box p-4">
                  <div class="flex items-center justify-between mb-4">
                    <div class="text-sm font-semibold">WHOIS 信息</div>
                    <div class="flex gap-2">
                      <button v-for="type in ['prefix', 'asn']" :key="type" class="btn btn-sm"
                        :class="{ 'btn-primary': whoisType === type }" @click="switchWhoisType(type)">
                        {{ type === 'prefix' ? '前缀' : 'ASN' }}
                      </button>
                    </div>
                  </div>

                  <div v-if="loadingWhois" class="text-center py-4">
                    <span class="loading loading-spinner"></span>
                  </div>
                  <div v-else-if="whoisData" class="space-y-4">
                    <!-- 基本信息 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="stat bg-base-300 rounded-box p-4">
                        <div class="stat-title">注册对象</div>
                        <div class="stat-value text-lg">{{ whoisData.name }}</div>
                        <div class="stat-desc">{{ whoisData.description }}</div>
                      </div>
                      <div class="stat bg-base-300 rounded-box p-4">
                        <div class="stat-title">状态</div>
                        <div class="stat-value text-lg">{{ whoisData.status }}</div>
                        <div class="stat-desc">最后更新: {{ formatDate(whoisData.lastModified) }}</div>
                      </div>
                    </div>

                    <!-- 联系信息 -->
                    <div class="bg-base-300 rounded-box p-4">
                      <div class="text-sm font-semibold mb-2">联系信息</div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="contact in whoisData.contacts" :key="contact.role">
                          <div class="font-medium">{{ contact.role }}</div>
                          <div class="text-sm opacity-75">{{ contact.name }}</div>
                          <div class="text-sm opacity-75">{{ contact.email }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 原始视图 -->
              <div v-else>
                <pre class="font-mono text-sm whitespace-pre-wrap overflow-x-auto">{{ results[0].data }}</pre>
              </div>
            </div>
          </div>

          <!-- 原始查询结果 -->
          <div v-for="result in results" :key="result.server" class="card bg-base-300">
            <div class="card-body p-4">
              <h3 class="card-title text-lg">
                <i class="fas fa-server mr-2"></i>
                {{ result.server }}
              </h3>
              <pre class="mt-2 font-mono text-sm whitespace-pre-wrap overflow-x-auto">{{ result.data }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const query = ref('')
const loading = ref(false)
const error = ref('')
const servers = ref([])
const networkType = ref('internet')
const selectedServers = ref([])
const results = ref([])
const activeTab = ref('summary')

// 添加新的响应式变量
const loadingVisibility = ref(false)
const loadingWhois = ref(false)
const visibilityData = ref(null)
const whoisData = ref(null)
const whoisType = ref('prefix')

// 计算属性
const isSelectedDN42 = computed(() => networkType.value === 'dn42')

const filteredServers = computed(() => {
  return servers.value.filter(server => {
    const serverLower = server.toLowerCase()
    if (networkType.value === 'dn42') {
      return serverLower.includes('dn42')
    } else {
      // 过滤掉DN42和home节点
      return !serverLower.includes('dn42') && !serverLower.includes('home')
    }
  })
})

const getPlaceholder = computed(() => {
  return isSelectedDN42.value
    ? '输入IPv4/IPv6地址或前缀，例如: 172.22.0.0/24 或 fd00::/8'
    : '输入IPv6地址或前缀，例如: 2607:f858::/32'
})

// 输入验证
const isValidInput = computed(() => {
  if (!query.value) return true
  const value = query.value.trim()

  // IPv6 验证 - 更宽松的验证规则
  const ipv6Segments = value.split('/')
  const ipv6Address = ipv6Segments[0]
  const prefix = ipv6Segments[1]

  // 检查前缀长度
  if (prefix !== undefined) {
    const prefixNum = parseInt(prefix)
    if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 128) {
      return false
    }
  }

  // 检查IPv6地址格式
  const hasValidChars = /^[0-9a-fA-F:]+$/.test(ipv6Address)
  const hasValidColons = ipv6Address.split(':').length <= 8
  const hasValidDoubleColon = (ipv6Address.match(/::/g) || []).length <= 1

  const isValidIPv6 = hasValidChars && hasValidColons && hasValidDoubleColon

  // IPv4 验证 (仅 DN42)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/

  if (isSelectedDN42.value) {
    return ipv4Regex.test(value) || isValidIPv6
  } else {
    return isValidIPv6
  }
})

const validationMessage = computed(() => {
  if (!query.value) return ''

  const value = query.value.trim()
  if (value.includes('/')) {
    const [, prefix] = value.split('/')
    const prefixNum = parseInt(prefix)
    if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 128) {
      return 'IPv6前缀长度必须在0-128之间'
    }
  }

  return isSelectedDN42.value
    ? '请输入有效的IPv4或IPv6地址/前缀'
    : '请输入有效的IPv6地址/前缀'
})

// 路由分析结果
const routeSummary = computed(() => {
  if (!results.value.length) return {}

  const summary = {
    table: null,
    protocol: null,
    status: null,
    asPath: null,
    nextHops: new Set(),
    communities: new Set()
  }

  const birdOutput = results.value[0].data

  // 提取表名
  const tableMatch = birdOutput.match(/Table ([^:]+):/)
  if (tableMatch) {
    summary.table = tableMatch[1]
  }

  // 提取协议名
  const protocolMatch = birdOutput.match(/\[(\w+)\s+\d{4}-\d{2}-\d{2}/)
  if (protocolMatch) {
    summary.protocol = protocolMatch[1]
  }

  // 提取状态
  const statusMatch = birdOutput.match(/(unreachable|unicast|blackhole)/)
  if (statusMatch) {
    summary.status = statusMatch[1]
  }

  // 提取AS路径 - 使用更精确的匹配模式
  const asPathMatch = birdOutput.match(/\] \* \(\d+\) \[(.*?)\]/)
  if (asPathMatch) {
    // 提取AS号码，处理带有i后缀的情况
    summary.asPath = asPathMatch[1]
      .split(' ')
      .filter(part => /AS?\d+i?/.test(part))
      .map(as => as.replace(/^AS/, '').replace('i', ''))
  }

  // 提取下一跳
  const nextHopMatches = birdOutput.matchAll(/via ([0-9a-fA-F:.]+)/gi)
  for (const match of nextHopMatches) {
    summary.nextHops.add(match[1])
  }

  // 提取Community
  const communityMatches = birdOutput.matchAll(/BGP.community: \[(.*?)\]/gi)
  for (const match of communityMatches) {
    match[1].split(' ').forEach(community => {
      summary.communities.add(community)
    })
  }

  return {
    ...summary,
    nextHops: Array.from(summary.nextHops),
    communities: Array.from(summary.communities)
  }
})

// 获取服务器列表
async function fetchServers() {
  try {
    const response = await fetch('https://lg.pysio.online/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        servers: [],
        type: 'server_list',
        args: ''
      })
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error)
    }

    // 过滤掉home节点
    servers.value = data.result
      .filter(r => !r.server.toLowerCase().includes('home'))
      .map(r => r.server)
    // 设置默认选择
    selectedServers.value = []
  } catch (err) {
    error.value = '获取服务器列表失败: ' + err.message
  }
}

// 执行查询
async function handleQuery() {
  if (!query.value.trim()) {
    error.value = '请输入查询目标'
    return
  }

  if (!selectedServers.value.length) {
    error.value = '请选择查询节点'
    return
  }

  if (!isValidInput.value) {
    error.value = validationMessage.value
    return
  }

  loading.value = true
  error.value = ''
  results.value = []
  // 清空之前的数据
  whoisData.value = null
  visibilityData.value = null

  try {
    const response = await fetch('https://lg.pysio.online/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        servers: selectedServers.value,
        type: 'bird',
        args: `show route for ${query.value}`
      })
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error)
    }

    results.value = data.result
    // 立即获取WHOIS数据
    await fetchWhoisData()
  } catch (err) {
    error.value = '查询失败: ' + err.message
  } finally {
    loading.value = false
  }
}

// 页面加载时获取服务器列表
onMounted(() => {
  fetchServers()
  fetchCustomProbes()
})

// 格式化日期
function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 切换WHOIS类型
async function switchWhoisType(type) {
  whoisType.value = type
  await fetchWhoisData()
}

// 移除自定义节点配置，改为从API获取
const customProbes = ref([])

// 获取自定义节点列表
async function fetchCustomProbes() {
  try {
    const response = await fetch('https://lg.pysio.online/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: [],
        type: 'server_list',
        args: ''
      })
    })
    const data = await response.json()
    if (!data.error) {
      // 过滤掉DN42节点
      customProbes.value = data.result
        .filter(server => {
          const serverLower = server.server.toLowerCase()
          return !serverLower.includes('dn42') && !serverLower.includes('home')
        })
        .map(server => ({
          name: server.server
        }))
    }
  } catch (err) {
    console.error('获取节点列表失败:', err)
  }
}

// 修改可见性数据处理函数
async function refreshVisibility() {
  if (!query.value || loadingVisibility.value) return

  loadingVisibility.value = true
  try {
    const [ripeResponse, customResponse] = await Promise.all([
      fetch(`https://stat.ripe.net/data/visibility/data.json?resource=${query.value}`),
      fetch('https://lg.pysio.online/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servers: customProbes.value.map(p => p.name),
          type: 'bird',
          args: `show route for ${query.value}`
        })
      })
    ])

    const ripeData = await ripeResponse.json()
    const customData = await customResponse.json()

    if (ripeData.status === 'ok') {
      // 处理RIPE RIS数据
      const ripeProbes = ripeData.data.visibilities.map(probe => ({
        name: probe.probe.name,
        ixp: probe.probe.ixp,
        ipv4_peers: probe.probe.ipv4_peer_count,
        ipv6_peers: probe.probe.ipv6_peer_count,
        ipv6_full_peers: probe.ipv6_full_table_peer_count,
        visible: probe.ipv6_full_table_peers_not_seeing.length === 0,
        type: 'ris'
      }))

      // 处理自定义节点数据
      const customResults = customProbes.value.map((probe, index) => ({
        name: probe.name,
        visible: customData.result?.[index]?.data?.includes(query.value) ?? false,
        type: 'custom'
      }))

      // 计算可见性
      const totalRISPeers = ripeProbes.reduce((sum, probe) => sum + probe.ipv6_full_peers, 0)
      const visibleRISPeers = ripeProbes.reduce((sum, probe) =>
        sum + (probe.visible ? probe.ipv6_full_peers : 0), 0)
      const risVisibilityPercent = (visibleRISPeers / totalRISPeers * 100).toFixed(1)

      const totalCustomProbes = customResults.length
      const visibleCustomProbes = customResults.filter(p => p.visible).length
      const pysioVisibilityPercent = (visibleCustomProbes / totalCustomProbes * 100).toFixed(1)

      visibilityData.value = {
        risTotal: totalRISPeers,
        risVisibilityPercent,
        pysioVisibilityPercent,
        probes: [...customResults, ...ripeProbes]
      }
    }
  } catch (err) {
    console.error('获取可见性数据失败:', err)
  } finally {
    loadingVisibility.value = false
  }
}

// 获取WHOIS数据
async function fetchWhoisData() {
  if (!query.value || loadingWhois.value) return

  loadingWhois.value = true
  try {
    let resource = ''
    let endpoint = ''

    if (whoisType.value === 'prefix') {
      endpoint = 'ip'
      resource = query.value.split('/')[0]
    } else {
      endpoint = 'asn'
      // 改进AS号码提取逻辑
      const asPath = routeSummary.value?.asPath
      if (!asPath?.length) {
        throw new Error('未找到AS信息')
      }
      // 获取第一个AS号码，移除任何非数字字符
      resource = asPath[0].replace(/\D/g, '')
    }

    if (!resource) {
      throw new Error('无效的查询对象')
    }

    const response = await fetch(`https://whois.akaere.online/${endpoint}/${encodeURIComponent(resource)}`)
    const data = await response.json()

    if (data.success) {
      whoisData.value = {
        name: data.data.name,
        description: data.data.description,
        status: Array.isArray(data.data.status) ? data.data.status.join(', ') : data.data.status,
        lastModified: data.data.lastModified,
        contacts: data.data.entities?.map(entity => ({
          role: entity.roles[0],
          name: entity.vcardArray[1].find(f => f[0] === 'fn')?.[3],
          email: entity.vcardArray[1].find(f => f[0] === 'email')?.[3]
        })) || []
      }
    } else {
      throw new Error(data.error || '查询失败')
    }
  } catch (err) {
    console.error('获取WHOIS数据失败:', err)
    error.value = err.message
    whoisData.value = null
  } finally {
    loadingWhois.value = false
  }
}

// 监听查询结果变化，自动获取额外信息
watch(results, async () => {
  if (results.value.length > 0) {
    // 总是先获取WHOIS数据
    await fetchWhoisData()
    if (activeTab.value === 'visibility') {
      await refreshVisibility()
    }
  }
})

// 监听标签切换
watch(activeTab, async (newTab) => {
  if (newTab === 'visibility' && !visibilityData.value && results.value.length > 0) {
    await refreshVisibility()
  } else if (newTab === 'whois' && !whoisData.value && results.value.length > 0) {
    await fetchWhoisData()
  }
})

// 添加切换服务器选择的函数
function toggleServer(server) {
  const index = selectedServers.value.indexOf(server)
  if (index === -1) {
    selectedServers.value.push(server)
  } else {
    selectedServers.value.splice(index, 1)
  }
}
</script>

<style scoped>
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

.visibility-data {
  margin: 20px 0;
}

.controls {
  margin-bottom: 15px;
}

.controls button {
  padding: 8px 16px;
  background: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #2d3748;
}

pre {
  background: #f7fafc;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.dropdown-content {
  max-height: 300px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
