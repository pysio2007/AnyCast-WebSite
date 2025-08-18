<template>
  <div class="container mx-auto px-4 py-8">
    <PageSeo title="Looking Glass" description="专业的网络路由信息查看工具，提供 BGP 路由表查询、路由可达性测试等功能。" />
    <article class="prose dark:prose-invert max-w-none">
      <!-- 添加加载状态提示 -->
      <div v-if="statusLoading" class="flex justify-center items-center mb-4">
        <div class="loading loading-spinner loading-lg text-primary"></div>
        <span class="ml-2">正在获取Bird状态...</span>
      </div>

      <!-- 显示错误节点信息 -->
      <div v-if="!statusLoading && errorServers.length > 0" class="alert alert-error mb-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-bold">无法连接的节点</h3>
            <div class="text-sm">以下节点连接超时或出现错误：</div>
            <div class="mt-1 space-x-2">
              <span v-for="server in errorServers" :key="server" class="badge badge-ghost">
                {{ server }}
              </span>
            </div>
            <button class="btn btn-sm btn-ghost mt-2" @click="retryErrorServers">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重试失败节点
            </button>
          </div>
        </div>
      </div>

      <template v-for="server in serverStatus" :key="server.server">
        <div class="mb-8">
          <h2 class="text-xl font-bold mb-4">{{ server.server }}: show protocols</h2>

          <div class="overflow-x-auto">
            <table class="table table-sm w-full border">
              <thead>
                <tr>
                  <th scope="col" class="border">Name</th>
                  <th scope="col" class="border">Proto</th>
                  <th scope="col" class="border">Table</th>
                  <th scope="col" class="border">State</th>
                  <th scope="col" class="border">Since</th>
                  <th scope="col" class="border">Info</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="peer in server.data" :key="peer.name" :class="getRowClass(peer.state, peer.info)">
                  <td class="border">
                    <NuxtLink :to="`/detail/${server.server}/${peer.name}`" class="text-primary hover:underline">
                      {{ peer.name }}
                    </NuxtLink>
                  </td>
                  <td class="border">{{ peer.proto }}</td>
                  <td class="border">{{ peer.table || '---' }}</td>
                  <td class="border">{{ peer.state }}</td>
                  <td class="border">{{ peer.since }}</td>
                  <td class="border">{{ peer.info }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- 刷新按钮 -->
      <div class="fixed bottom-4 right-4">
        <button class="btn btn-circle btn-primary" @click="fetchAllServerStatus" :disabled="statusLoading">
          <i class="fas fa-sync-alt" :class="{ 'animate-spin': statusLoading }"></i>
        </button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Cache, type ApiResponse, type ApiSummaryResultPair } from '~/utils/cache'

interface ServerListItem {
  server: string;
}

const serverStatus = ref<ApiSummaryResultPair[]>([])
const errorServers = ref<string[]>([])
const statusLoading = ref(false)
const apiUrl = 'https://lg.pysio.online/api/'

// 获取所有服务器的BGP状态
const fetchAllServerStatus = async () => {
  statusLoading.value = true
  errorServers.value = [] // 重置错误服务器列表
  try {
    // 尝试从缓存获取数据
    const cachedData = Cache.get<ApiSummaryResultPair[]>('serverStatus');
    if (cachedData) {
      serverStatus.value = cachedData;
      statusLoading.value = false;
      return;
    }

    // 如果没有缓存数据，则从API获取
    const serverListResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: [],
        type: 'server_list',
        args: ''
      })
    })
    const serverListData = await serverListResponse.json() as ApiResponse<ServerListItem>;

    // 检查是否有错误
    if (serverListData.error) {
      console.error('获取服务器列表失败:', serverListData.error);
      errorServers.value = ['API服务器'];
      serverStatus.value = [];
      return;
    }

    if (!serverListData.result || !Array.isArray(serverListData.result)) {
      console.error('服务器列表数据格式错误');
      errorServers.value = ['API服务器'];
      serverStatus.value = [];
      return;
    }

    let serverList = serverListData.result
      .map((item: ServerListItem) => item.server)
      .filter(server => server !== 'OpenBmclapi-Bgp'); // 移除已知的故障节点

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: serverList,
        type: 'summary',
        args: ''
      })
    })
    const data = await response.json() as ApiResponse<ApiSummaryResultPair>;

    if (data.error) {
      // 如果返回错误，尝试解析错误信息找出故障节点
      const errorMessage = data.error.toLowerCase();
      const failedServer = serverList.find(server => errorMessage.includes(server.toLowerCase()));

      if (failedServer) {
        // 将故障节点添加到错误列表
        errorServers.value.push(failedServer);
        // 从服务器列表中移除故障节点
        serverList = serverList.filter(server => server !== failedServer);

        // 重试剩余节点
        const retryResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            servers: serverList,
            type: 'summary',
            args: ''
          })
        });
        const retryData = await retryResponse.json() as ApiResponse<ApiSummaryResultPair>;

        if (retryData.result) {
          const validResults: ApiSummaryResultPair[] = [];
          retryData.result.forEach(item => {
            if (!('error' in item) && Array.isArray(item.data)) {
              validResults.push(item);
            } else {
              errorServers.value.push(item.server);
            }
          });

          serverStatus.value = validResults;
          if (validResults.length > 0) {
            Cache.set('serverStatus', validResults);
          }
        }
      } else {
        console.error('获取服务器状态失败:', data.error);
        errorServers.value = serverList;
        serverStatus.value = [];
      }
      return;
    }

    if (data.result) {
      // 分离正常和错误的服务器
      const validResults: ApiSummaryResultPair[] = [];
      data.result.forEach(item => {
        if ('error' in item || !Array.isArray(item.data)) {
          errorServers.value.push(item.server);
        } else {
          validResults.push(item);
        }
      });

      serverStatus.value = validResults;
      if (validResults.length > 0) {
        Cache.set('serverStatus', validResults);
      }
    } else {
      errorServers.value = serverList;
      serverStatus.value = [];
    }
  } catch (error) {
    console.error('获取服务器状态失败:', error);
    errorServers.value = ['API服务器'];
    serverStatus.value = [];
  } finally {
    statusLoading.value = false;
  }
}

// 获取行样式
const getRowClass = (state: string, info?: string): string => {
  // 检查 Info 中是否包含错误信息
  if (info && info.toLowerCase().includes('error')) {
    return 'bg-error/10 hover:bg-error/20'
  }

  // 如果没有错误信息，则按照原来的状态判断
  switch (state.toLowerCase()) {
    case 'up':
      return 'bg-success/10 hover:bg-success/20'
    case 'down':
      return 'bg-error/10 hover:bg-error/20'
    case 'start':
      return 'bg-warning/10 hover:bg-warning/20'
    default:
      return 'hover:bg-base-200'
  }
}

const retryErrorServers = async () => {
  if (errorServers.value.length === 0) return;

  statusLoading.value = true;
  try {
    // 过滤掉已知的故障节点
    const serversToRetry = errorServers.value.filter(server => server !== 'OpenBmclapi-Bgp');

    if (serversToRetry.length === 0) {
      console.log('没有可重试的节点');
      return;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: serversToRetry,
        type: 'summary',
        args: ''
      })
    });

    const data = await response.json() as ApiResponse<ApiSummaryResultPair>;

    if (data.error) {
      // 如果返回错误，尝试解析错误信息找出故障节点
      const errorMessage = data.error.toLowerCase();
      const failedServer = serversToRetry.find(server => errorMessage.includes(server.toLowerCase()));

      if (failedServer) {
        // 保持故障节点在错误列表中
        const remainingServers = serversToRetry.filter(server => server !== failedServer);
        if (remainingServers.length > 0) {
          // 重试剩余节点
          const retryResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              servers: remainingServers,
              type: 'summary',
              args: ''
            })
          });
          const retryData = await retryResponse.json() as ApiResponse<ApiSummaryResultPair>;

          if (retryData.result) {
            const validResults: ApiSummaryResultPair[] = [];
            retryData.result.forEach(item => {
              if (!('error' in item) && Array.isArray(item.data)) {
                validResults.push(item);
                // 从错误列表中移除成功的服务器
                const index = errorServers.value.indexOf(item.server);
                if (index > -1) {
                  errorServers.value.splice(index, 1);
                }
              }
            });

            if (validResults.length > 0) {
              serverStatus.value = [...serverStatus.value, ...validResults];
              Cache.set('serverStatus', serverStatus.value);
            }
          }
        }
      }
      return;
    }

    if (data.result) {
      const validResults: ApiSummaryResultPair[] = [];

      data.result.forEach(item => {
        if (!('error' in item) && Array.isArray(item.data)) {
          validResults.push(item);
          // 从错误列表中移除成功重试的服务器
          const index = errorServers.value.indexOf(item.server);
          if (index > -1) {
            errorServers.value.splice(index, 1);
          }
        }
      });

      if (validResults.length > 0) {
        serverStatus.value = [...serverStatus.value, ...validResults];
        Cache.set('serverStatus', serverStatus.value);
      }
    }
  } catch (error) {
    console.error('重试失败节点时出错:', error);
  } finally {
    statusLoading.value = false;
  }
};

// 页面加载时获取状态
onMounted(async () => {
  await fetchAllServerStatus()
})
</script>

<style lang="postcss" scoped>
.table {
  font-size: 0.875rem;
}

.table th {
  background-color: var(--b2);
  color: rgba(var(--bc), 0.7);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0.75rem;
}

.table td {
  padding: 0.5rem 0.75rem;
}

/* 确保表格在移动设备上可以水平滚动 */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

/* 保持表格紧凑 */
.table-sm th,
.table-sm td {
  padding: 0.375rem 0.5rem;
}

/* 实心边框样式 */
.border {
  border-color: var(--b3);
}
</style>
