<template>
  <div class="container mx-auto p-4">
    <div class="card backdrop-blur-md bg-opacity-50 bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6 text-center justify-center">
          <i class="fas fa-route mr-2"></i>路由追踪
        </h2>

        <div class="w-full max-w-4xl mx-auto">
          <!-- 输入区域 -->
          <div class="flex flex-col gap-4">
            <!-- 第一行：服务器选择和目标输入 -->
            <div class="flex flex-col md:flex-row gap-4 items-end">
              <!-- 服务器选择 -->
              <div class="form-control md:w-1/3">
                <label class="label">
                  <span class="label-text">选择服务器</span>
                </label>
                <div class="dropdown w-full">
                  <label tabindex="0"
                    class="btn btn-ghost w-full justify-between bg-opacity-70 bg-base-100 hover:bg-opacity-70 hover:bg-base-200">
                    <span class="normal-case">{{ selectedServer ? serverDisplayNames[selectedServer] : '请选择服务器'
                      }}</span>
                    <i class="fas fa-chevron-down text-xs opacity-50"></i>
                  </label>
                  <ul tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow-lg bg-opacity-95 bg-base-200 backdrop-blur-md rounded-box w-full max-h-60 overflow-auto">
                    <li v-for="server in availableServers" :key="server">
                      <a @click="selectedServer = server" :class="{ 'active': selectedServer === server }">
                        <i class="fas fa-server text-xs opacity-50"></i>
                        {{ serverDisplayNames[server] }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- 目标输入 -->
              <div class="form-control flex-1">
                <label class="label">
                  <span class="label-text">目标地址</span>
                </label>
                <div class="join w-full">
                  <input v-model="target" type="text" placeholder="8.8.8.8 或 google.com"
                    class="input input-bordered join-item flex-1 bg-opacity-70 bg-base-100" :disabled="!selectedServer"
                    @keyup.enter="performTraceroute" />
                  <button class="btn btn-primary join-item w-24" @click="performTraceroute" :disabled="!canQuery">
                    <i class="fas fa-play mr-1"></i>
                    <span class="hidden sm:inline">追踪</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 结果显示 -->
          <div class="mt-8">
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 transform -translate-y-4" enter-to-class="opacity-100 transform translate-y-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 transform translate-y-0"
              leave-to-class="opacity-0 transform -translate-y-4">
              <div v-if="loading" class="text-center p-8">
                <span class="loading loading-spinner loading-lg"></span>
                <p class="mt-4 text-base-content/70">
                  <template v-if="processingIpInfo">
                    正在获取 IP 信息 ({{ processedCount }}/{{ totalHops }})
                    <div class="w-64 mx-auto mt-2">
                      <div class="flex justify-between text-xs opacity-70 mb-1">
                        <span>进度</span>
                        <span>{{ Math.round((processedCount / totalHops) * 100) }}%</span>
                      </div>
                      <progress class="progress progress-primary" :value="processedCount" :max="totalHops"></progress>
                    </div>
                  </template>
                  <template v-else>
                    正在追踪路由...
                  </template>
                </p>
              </div>

              <div v-else-if="parsedResult" class="card bg-opacity-70 bg-base-100 backdrop-blur shadow-lg">
                <div class="card-body">
                  <!-- 标题信息 -->
                  <div class="text-sm font-mono mb-4">{{ parsedResult.header }}</div>

                  <!-- 跳转信息表格 -->
                  <div class="overflow-x-auto">
                    <table class="table table-sm w-full">
                      <thead>
                        <tr>
                          <th>跳数</th>
                          <th>地址</th>
                          <th>延迟</th>
                          <th>位置</th>
                          <th>ASN</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-for="hop in parsedResult.hops" :key="hop.hop">
                          <tr :class="{ 'opacity-50': hop.isPrivate }">
                            <td>{{ hop.hop }}</td>
                            <td class="font-mono">{{ hop.address }}</td>
                            <td>{{ hop.delay }}</td>
                            <td>
                              <div v-if="!hop.isPrivate">
                                <span v-if="hop.ipInfo?.loading" class="loading loading-dots loading-xs"></span>
                                <span v-else-if="hop.ipInfo">
                                  <i class="fas fa-globe-americas mr-1 opacity-50"></i>
                                  {{ hop.ipInfo.country }}
                                  <span v-if="hop.ipInfo.city">, {{ hop.ipInfo.city }}</span>
                                </span>
                                <span v-else class="text-base-content/50">获取失败</span>
                              </div>
                              <span v-else class="text-base-content/50">
                                <i class="fas fa-home mr-1 opacity-50"></i>
                                私有地址
                              </span>
                            </td>
                            <td>
                              <div v-if="!hop.isPrivate">
                                <span v-if="hop.ipInfo?.loading" class="loading loading-dots loading-xs"></span>
                                <span v-else-if="hop.ipInfo?.org" class="text-xs whitespace-nowrap">
                                  <i class="fas fa-network-wired mr-1 opacity-50"></i>
                                  {{ formatASN(hop.ipInfo.org) }}
                                </span>
                              </div>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>

                  <!-- 未响应跳数提示 -->
                  <div v-if="parsedResult.noResponseHops" class="mt-4 text-sm text-base-content/70">
                    {{ parsedResult.noResponseHops }} 跳未响应
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const availableServers = ['dn42', 'bgp', 'home']
const serverDisplayNames: Record<string, string> = {
  'dn42': 'DN42',
  'bgp': '法兰克福',
  'home': '成都'
}
const selectedServer = ref('')
const target = ref('')
const loading = ref(false)
const result = ref('')
const apiUrl = 'https://lg.pysio.online/api/'
const processingIpInfo = ref(false)
const processedCount = ref(0)
const totalHops = ref(0)

const canQuery = computed(() => {
  return selectedServer.value && target.value.trim()
})

const performTraceroute = async () => {
  if (!canQuery.value) return

  loading.value = true
  result.value = ''
  parsedResult.value = null
  processingIpInfo.value = false
  processedCount.value = 0
  totalHops.value = 0

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: [selectedServer.value],
        type: 'traceroute',
        args: target.value.trim()
      })
    })

    const data = await response.json()
    if (data.error) {
      result.value = `错误: ${data.error}`;
      parsedResult.value = null;
    } else if (data.result && data.result.length > 0) {
      result.value = data.result[0].data;
      await parseTracerouteResult(data.result[0].data);
    }
  } catch (error) {
    console.error('Traceroute error:', error);
    result.value = '请求失败: ' + (error instanceof Error ? error.message : String(error));
  } finally {
    loading.value = false
  }
}

// 添加键盘事件处理
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && canQuery.value) {
    performTraceroute()
  }
}

onMounted(() => {
  window.addEventListener('keypress', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})

// 添加类型定义
interface IpInfo {
  ip: string;
  hostname?: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
  anycast?: boolean;
  loading?: boolean;
}

interface TracerouteHop {
  hop: number;
  address: string;
  delay: string;
  isPrivate: boolean;
  ipInfo?: IpInfo;
}

interface ParsedResult {
  header: string;
  hops: TracerouteHop[];
  noResponseHops?: number;
}

const parsedResult = ref<ParsedResult | null>(null);

// 判断是否为私有地址（支持 IPv4 和 IPv6）
const isPrivateIP = (ip: string): boolean => {
  // IPv4 私有地址检查
  if (ip.includes('.')) {
    const parts = ip.split('.').map(Number);
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      (parts[0] === 169 && parts[1] === 254)
    );
  }

  // IPv6 私有地址检查
  const ipv6Lower = ip.toLowerCase();
  return (
    ipv6Lower.startsWith('fe80:') || // Link-local
    ipv6Lower.startsWith('fc00:') || // Unique local
    ipv6Lower.startsWith('fd00:') || // Unique local
    ipv6Lower === '::1' ||           // Loopback
    ipv6Lower.startsWith('2001:db8:') // Documentation
  );
};

// 修改ip地址提取函数以更好地支持IPv6
const extractIP = (text: string): string | null => {
  // IPv6 地址可能包含括号
  const parenMatch = text.match(/\(([^)]+)\)/);
  if (parenMatch) {
    return parenMatch[1];
  }

  // 处理无括号的情况
  const words = text.trim().split(/\s+/);
  for (const word of words) {
    // 检查是否是有效的 IP 地址（IPv4 或 IPv6）
    if (
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(word) || // IPv4
      /^[0-9a-fA-F:]+$/.test(word)  // IPv6
    ) {
      return word;
    }
  }

  return null;
};

// 修改获取IP信息的函数以确保类型安全
const fetchIpInfo = async (ip: string): Promise<IpInfo> => {
  try {
    const response = await fetch(`https://ipinfo.io/${ip}?token=29a9fd77d1bd76`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // 显式类型转换和验证
    const ipInfo: IpInfo = {
      ip: data.ip || ip,
      hostname: data.hostname,
      city: data.city || '',
      region: data.region || '',
      country: data.country || '',
      loc: data.loc || '',
      org: data.org || '',
      postal: data.postal || '',
      timezone: data.timezone || '',
      anycast: data.anycast || false,
      loading: false
    };
    return ipInfo;
  } catch (error) {
    console.error(`Error fetching IP info for ${ip}:`, error);
    throw error;
  }
};

// 格式化 ASN 显示
const formatASN = (org: string): string => {
  const asnMatch = org.match(/^(AS\d+)\s/);
  if (asnMatch) {
    const [, asn] = asnMatch;
    const name = org.replace(asn, '').trim();
    return `${asn} ${name.length > 20 ? name.slice(0, 20) + '...' : name}`;
  }
  return org.length > 25 ? org.slice(0, 25) + '...' : org;
};

// 修改解析traceroute结果的函数
const parseTracerouteResult = async (text: string) => {
  const lines = text.split('\n').filter(line => line.trim());
  const header = lines[0];
  const hops: TracerouteHop[] = [];
  let noResponseCount = 0;

  // 更新正则表达式以更好地支持 IPv4 和 IPv6
  const hopRegex = /^\s*(\d+)\s+([^\s].*?)\s+([0-9.]+\s*ms)/;

  for (const line of lines.slice(1)) {
    const match = line.match(hopRegex);
    if (match) {
      const [, hopNum, addressPart, delayPart] = match;
      const ip = extractIP(addressPart);
      const isPrivate = ip ? isPrivateIP(ip) : true;

      const hop: TracerouteHop = {
        hop: parseInt(hopNum),
        address: addressPart.trim(),
        delay: delayPart.trim(),
        isPrivate,
        ipInfo: isPrivate ? undefined : { loading: true } as IpInfo
      };

      hops.push(hop);

      if (!isPrivate && ip) {
        // 使用Promise.race添加超时处理
        try {
          const ipInfo = await Promise.race([
            fetchIpInfo(ip),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ]);

          // 使用nextTick确保视图更新
          await nextTick(() => {
            const targetHop = hops.find(h => h.hop === hop.hop);
            if (targetHop) {
              targetHop.ipInfo = ipInfo; // 现在这里的类型是安全的
            }
          });
        } catch (error) {
          console.error(`Error fetching info for hop ${hop.hop}:`, error);
          await nextTick(() => {
            const targetHop = hops.find(h => h.hop === hop.hop);
            if (targetHop) {
              targetHop.ipInfo = undefined;
            }
          });
        }
      }
    }
  }

  // 更新进度状态 - 修改为包含所有跳数
  processedCount.value = 0
  totalHops.value = hops.length // 计算所有跳数，包括私有地址

  // 处理IP信息
  processingIpInfo.value = true
  for (const hop of hops) {
    if (!hop.isPrivate && extractIP(hop.address)) {
      const ip = extractIP(hop.address)!;
      try {
        hop.ipInfo = { loading: true } as IpInfo;
        const ipInfo = await Promise.race([
          fetchIpInfo(ip),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        hop.ipInfo = ipInfo;
      } catch (error) {
        console.error(`Error fetching info for hop ${hop.hop}:`, error);
        hop.ipInfo = undefined;
      }
    }
    processedCount.value++;
  }

  processingIpInfo.value = false;
  parsedResult.value = {
    header,
    hops: [...hops],
    noResponseHops: noResponseCount
  };
};
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

.input,
.select {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input:focus {
  box-shadow: none;
  border-color: rgba(255, 255, 255, 0.1);
  outline: none;
}

.join {
  display: flex;
  align-items: stretch;
}

.join>.join-item:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.join>.join-item:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

/* 添加下拉菜单相关样式 */
.dropdown-content {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-content li a {
  transition: all 0.2s ease;
}

.dropdown-content li a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-content li a.active {
  background: rgba(var(--p), 0.2);
  color: hsl(var(--p));
}

.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
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

.progress {
  height: 0.5rem;
  background-color: var(--b2);
}
</style>
