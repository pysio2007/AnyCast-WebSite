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
          我们目前接受位于<a href="/ix" class="text-yellow-600 hover:text-yellow-800 font-semibold dark:text-yellow-300 dark:hover:text-yellow-100">AKIX、FogIXP、LOCIX FRANKFURT和INTERIX</a>交换点的网络运营商的对等互联请求。如果您对 DN42 网络感兴趣，请查看我们的 DN42 页面。
        </p>
      </div>

      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 dark:bg-blue-900/20">
        <p class="text-blue-700 dark:text-blue-200">
          我们现在支持下游连接！如果您的网络位于FogIXP内，欢迎查看我们的
          <a href="/downstream" class="text-blue-600 hover:text-blue-800 font-semibold dark:text-blue-300 dark:hover:text-blue-100">下游政策</a>。
        </p>
      </div>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">网络信息</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition duration-300 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-network-wired text-blue-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-blue-800 dark:text-blue-200">ASN</h3>
            </div>
            <code class="block bg-white/80 p-3 rounded-lg font-mono text-lg font-semibold text-blue-900 dark:bg-gray-800 dark:text-blue-300">AS213605</code>
          </div>
          
                     <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition duration-300 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700">
             <div class="flex items-center mb-3">
               <div class="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                 <i class="fas fa-globe text-purple-500 text-lg"></i>
               </div>
               <h3 class="font-bold text-purple-800 dark:text-purple-200">IPv6 地址块</h3>
             </div>
             <div class="space-y-2">
               <code class="block bg-white/80 p-3 rounded-lg font-mono text-sm font-semibold text-purple-900 dark:bg-gray-800 dark:text-purple-300">2a14:67c1:a020::/44</code>
               <code class="block bg-white/80 p-3 rounded-lg font-mono text-sm font-semibold text-purple-900 dark:bg-gray-800 dark:text-purple-300">2a14:67c1:b100::/40</code>
             </div>
           </div>

          <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition duration-300 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-exchange-alt text-green-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-green-800 dark:text-green-200">交换点</h3>
            </div>
            <div class="space-y-2">
              <div class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">AKIX</div>
              <div class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">FogIXP</div>
              <div class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">LOCIX FRANKFURT</div>
              <div class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">INTERIX</div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition duration-300 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-handshake text-orange-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-orange-800 dark:text-orange-200">对等政策</h3>
            </div>
            <div class="space-y-2">
              <div class="bg-white/80 p-2 rounded text-sm font-medium text-orange-900 dark:bg-gray-800 dark:text-orange-300">开放对等</div>
              <div class="bg-white/80 p-2 rounded text-sm font-medium text-orange-900 dark:bg-gray-800 dark:text-orange-300">支持下游</div>
            </div>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">Looking Glass</h2>
        <p class="mb-4">
          您可以通过我们的 Looking Glass 服务查看网络状态：
          <a href="https://anycast.ink/lg" class="text-blue-500 hover:text-blue-600" target="_blank">
            https://anycast.ink/lg
          </a>
        </p>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">BIRD 配置文件</h2>
        <p class="mb-4">
          我们公开了以下节点的BIRD配置文件，您可以通过以下Git仓库访问：
        </p>
        <div class="grid md:grid-cols-3 gap-6">
          <a href="https://git.pysio.online/pysio-team/akix" target="_blank" class="block bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-300 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3 dark:bg-orange-900">
                <i class="fab fa-gitlab text-orange-500 text-xl"></i>
              </div>
              <h3 class="font-bold text-lg">AKIX 配置</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">AKIX交换点节点配置</p>
            <div class="mt-4 flex items-center text-blue-500 text-sm">
              <i class="fas fa-code-branch mr-1"></i> <span>{{ repoData.akix.commits }}次提交</span>
              <i class="fas fa-history ml-3 mr-1"></i> <span>{{ repoData.akix.lastUpdated }}</span>
            </div>
          </a>
          <a href="https://git.pysio.online/pysio-team/ifog" target="_blank" class="block bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-300 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3 dark:bg-orange-900">
                <i class="fab fa-gitlab text-orange-500 text-xl"></i>
              </div>
              <h3 class="font-bold text-lg">IFog 配置</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">瑞士IFog节点配置</p>
            <div class="mt-4 flex items-center text-blue-500 text-sm">
              <i class="fas fa-code-branch mr-1"></i> <span>{{ repoData.ifog.commits }}次提交</span>
              <i class="fas fa-history ml-3 mr-1"></i> <span>{{ repoData.ifog.lastUpdated }}</span>
            </div>
          </a>
          <a href="https://git.pysio.online/pysio-team/skywolf" target="_blank" class="block bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-300 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3 dark:bg-orange-900">
                <i class="fab fa-gitlab text-orange-500 text-xl"></i>
              </div>
              <h3 class="font-bold text-lg">SkyWolf 配置</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">香港SkyWolf节点配置</p>
            <div class="mt-4 flex items-center text-blue-500 text-sm">
              <i class="fas fa-code-branch mr-1"></i> <span>{{ repoData.skywolf.commits }}次提交</span>
              <i class="fas fa-history ml-3 mr-1"></i> <span>{{ repoData.skywolf.lastUpdated }}</span>
            </div>
          </a>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">节点列表</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- AKIX-Frankfurt -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-de w-5 mr-2"></span>
                AKIX-Frankfurt
              </h3>
              <span class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>10Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Digital Realty Frankfurt FRA1-16</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS210440 & AKIXP 主控</li>
            </ul>
          </div>

          <!-- HongKong Master -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-hk w-5 mr-2"></span>
                HongKong Master
              </h3>
              <span class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>30Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Equinix HK2</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-exchange-alt mr-2"></i>接入 AKIX</li>
            </ul>
          </div>

          <!-- New Jersey -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
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
            </ul>
          </div>

          <!-- Tokyo -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
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
            </ul>
          </div>

          <!-- Amsterdam -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
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
            </ul>
          </div>

          <!-- Mumbai -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
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
            </ul>
          </div>

          <!-- Hong Kong -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-hk w-5 mr-2"></span>
                Anycast-HongKong
              </h3>
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">¥31/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>500Mbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>SkyWolf</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session (Premium)</li>
            </ul>
          </div>

          <!-- Florida -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
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
            </ul>
          </div>

          <!-- Tallinn -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
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
            </ul>
          </div>

          <!-- IFog Switzerland -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-ch w-5 mr-2"></span>
                Schweiz
              </h3>
              <div class="flex gap-2">
                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">CHF 12.00/季</span>
                <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>IFog</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-exchange-alt mr-2"></i>接入 FogIXP</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- HK Downstreams -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-hk w-5 mr-2"></span>
                HK-Downstreams
              </h3>
              <div class="flex gap-2">
                <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Equinix HK1</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- US Downstreams -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-us w-5 mr-2"></span>
                US-Downstreams
              </h3>
              <div class="flex gap-2">
                <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$2/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>SkyWolf</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'default'
})

// 定义仓库信息接口
interface RepoInfo {
  commits: number;
  lastUpdated: string;
}

interface GitlabData {
  akix: RepoInfo;
  ifog: RepoInfo;
  skywolf: RepoInfo;
}

// 定义GitLab API响应接口
interface GitLabApiResponse {
  commit_count: number;
  last_activity_at: string;
  [key: string]: any; // 允许其他属性
}

// 格式化日期为中文格式
const formatDate = (dateString: string) => {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
}

// 默认数据
const defaultData: GitlabData = {
  akix: { commits: 16, lastUpdated: '2025-05-10' },
  ifog: { commits: 17, lastUpdated: '2025-05-07' },
  skywolf: { commits: 24, lastUpdated: '2025-05-13' }
};

// 使用useAsyncData在服务端获取GitLab数据
const { data: gitlabData } = await useAsyncData('gitlabRepos', async () => {
  try {
    // GitLab API 端点
    const apiBase = 'https://git.pysio.online/api/v4/projects';
    
    // 并行请求三个仓库的数据
    const [akixData, ifogData, skywolfData] = await Promise.all([
      $fetch<GitLabApiResponse>(`${apiBase}/pysio-team%2Fakix`),
      $fetch<GitLabApiResponse>(`${apiBase}/pysio-team%2Fifog`),
      $fetch<GitLabApiResponse>(`${apiBase}/pysio-team%2Fskywolf`)
    ]);
    
    // 返回处理后的数据
    return {
      akix: { 
        commits: akixData.commit_count || 16, 
        lastUpdated: formatDate(akixData.last_activity_at) 
      },
      ifog: { 
        commits: ifogData.commit_count || 17, 
        lastUpdated: formatDate(ifogData.last_activity_at) 
      },
      skywolf: { 
        commits: skywolfData.commit_count || 24, 
        lastUpdated: formatDate(skywolfData.last_activity_at) 
      }
    } as GitlabData;
  } catch (error) {
    console.error('获取GitLab仓库数据失败:', error);
    // 发生错误时返回默认数据
    return defaultData;
  }
}, { server: true }) // 确保在服务端执行

// 为了处理gitlabData可能为null的情况，提供一个计算属性
const repoData = computed(() => gitlabData.value || defaultData);
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
