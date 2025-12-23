<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <PageSeo title="根DNS服务 - Pysio Networks" description="Pysio Networks 托管的 RIPE K-Root 根服务器和 AuthDNS 权威域名服务统计信息"
        :keywords="['RIPE', 'K-Root', 'AuthDNS', '根DNS', '权威DNS', 'DNS', 'AS25152']" />

      <h1 class="text-4xl font-bold mb-6">根DNS服务</h1>

      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 dark:bg-blue-900/20">
        <p class="text-blue-700 dark:text-blue-200">
          我们很荣幸能够为互联网基础设施做出贡献，在香港托管了 K-Root 根服务器和 AuthDNS 权威域名服务节点。以下是我们香港节点的实时统计图表。
        </p>
      </div>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
          <i class="fas fa-server mr-2 text-blue-500"></i>
          节点信息
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Auth DNS 节点 -->
          <div
            class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition duration-300 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-database text-purple-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-purple-800 dark:text-purple-200">AuthDNS</h3>
            </div>
            <div class="space-y-2">
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">节点名称</p>
                <p class="font-mono font-semibold text-purple-900 dark:text-purple-300">ns1.hk-hkg</p>
              </div>
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">位置</p>
                <p class="font-semibold text-purple-900 dark:text-purple-300">
                  <span class="fi fi-hk mr-1"></span>香港
                </p>
              </div>
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">服务类型</p>
                <p class="font-semibold text-purple-900 dark:text-purple-300">权威DNS服务</p>
              </div>
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">托管区域</p>
                <p class="font-semibold text-purple-900 dark:text-purple-300">4000+ 域名区域</p>
              </div>
            </div>
          </div>

          <!-- K-Root 节点 -->
          <div
            class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition duration-300 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-network-wired text-green-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-green-800 dark:text-green-200">K-Root</h3>
            </div>
            <div class="space-y-2">
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">节点名称</p>
                <p class="font-mono font-semibold text-green-900 dark:text-green-300">ns3.hk-hkg</p>
              </div>
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">位置</p>
                <p class="font-semibold text-green-900 dark:text-green-300">
                  <span class="fi fi-hk mr-1"></span>香港
                </p>
              </div>
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">服务类型</p>
                <p class="font-semibold text-green-900 dark:text-green-300">根域名服务器</p>
              </div>
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">服务地位</p>
                <p class="font-semibold text-green-900 dark:text-green-300">13个根服务器之一</p>
              </div>
            </div>
          </div>

          <!-- 运营商信息 -->
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition duration-300 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-building text-blue-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-blue-800 dark:text-blue-200">服务运营方</h3>
            </div>
            <div class="space-y-2">
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">组织</p>
                <p class="font-semibold text-blue-900 dark:text-blue-300">RIPE NCC</p>
              </div>
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">更多</p>
                <a href="https://www.ripe.net/analyse/dns/k-root/" target="_blank"
                  class="block font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100">
                  K-Root 官方页面 <i class="fas fa-external-link-alt ml-1"></i>
                </a>
              </div>
              <div class="bg-white/80 p-3 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">更多</p>
                <a href="https://www.ripe.net/analyse/dns/authdns/" target="_blank"
                  class="block font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100">
                  AuthDNS 官方页面 <i class="fas fa-external-link-alt ml-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
          <i class="fas fa-chart-line mr-2 text-green-500"></i>
          K-Root 统计图表
        </h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400">
          K-Root (k.root-servers.net) 是全球 13 个互联网根域名服务器之一，由 RIPE NCC 运营。该服务通过 IPv4 和 IPv6 anycast 技术分布在全球多个节点，每个节点在
          AS25152 下宣告 193.0.14.0/23 前缀，部分节点还宣告 2001:7fd::/32 前缀。以下是我们香港节点的每日统计图表。
        </p>
        <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- K-Root 查询类型统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-chart-bar mr-2"></i>
                查询类型分布 (QTypes)
              </h3>
              <p class="text-green-100 text-sm">每日 DNS 查询类型统计</p>
            </div>
            <div class="p-4">
              <div class="relative aspect-video">
                <img
                  src="https://cdn.akaere.online/www-static.ripe.net/dynamic/dsc-graphs/kroot/ns3.hk-hkg/daily/qtypes.png"
                  alt="K-Root QTypes Statistics" class="w-full h-full object-contain rounded-lg" loading="lazy" />
                <div v-if="imageLoading.qtypes"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i class="fas fa-spinner fa-spin text-4xl text-green-500"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- K-Root 节点统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-server mr-2"></i>
                节点性能统计 (Nodes)
              </h3>
              <p class="text-blue-100 text-sm">每日节点连接和响应统计</p>
            </div>
            <div class="p-4">
              <div class="relative aspect-video">
                <img
                  src="https://cdn.akaere.online/www-static.ripe.net/dynamic/dsc-graphs/kroot/ns3.hk-hkg/daily/nodes.png"
                  alt="K-Root Nodes Statistics" class="w-full h-full object-contain rounded-lg" loading="lazy" />
                <div v-if="imageLoading.nodes"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- K-Root TLDs 统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-globe mr-2"></i>
                顶级域名分布 (TLDs)
              </h3>
              <p class="text-yellow-100 text-sm">每日顶级域名查询统计</p>
            </div>
            <div class="p-4">
              <div class="relative aspect-video">
                <img
                  src="https://cdn.akaere.online/https://www-static.ripe.net/dynamic/dsc-graphs/kroot/ns3.hk-hkg/daily/tlds.png"
                  alt="K-Root TLDs Statistics" class="w-full h-full object-contain rounded-lg" loading="lazy" />
                <div v-if="imageLoading.tlds"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i class="fas fa-spinner fa-spin text-4xl text-yellow-500"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- K-Root 返回码统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-reply mr-2"></i>
                返回码分布 (RCodes)
              </h3>
              <p class="text-red-100 text-sm">每日 DNS 返回码统计</p>
            </div>
            <div class="p-4">
              <div class="relative aspect-video">
                <img
                  src="https://cdn.akaere.online/https://www-static.ripe.net/dynamic/dsc-graphs/kroot/ns3.hk-hkg/daily/rcodes.png"
                  alt="K-Root RCodes Statistics" class="w-full h-full object-contain rounded-lg" loading="lazy" />
                <div v-if="imageLoading.rcodes"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i class="fas fa-spinner fa-spin text-4xl text-red-500"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
          <i class="fas fa-chart-area mr-2 text-purple-500"></i>
          AuthDNS 统计图表
        </h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400">
          RIPE AuthDNS 是 RIPE NCC 运营的权威域名服务，承载了超过 4000 个域名区域，包括反向 DNS 区域、ripe.net
          域名以及为多个国家代码顶级域名（ccTLD）提供辅助服务。以下是我们香港节点的每日统计图表。
        </p>
        <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Auth DNS 查询类型统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-chart-pie mr-2"></i>
                查询类型分布 (QTypes)
              </h3>
              <p class="text-purple-100 text-sm">每日 DNS 查询类型统计</p>
            </div>
            <div class="p-4">
              <div class="relative aspect-video">
                <img
                  src="https://cdn.akaere.online/https://www-static.ripe.net/dynamic/dsc-graphs/authdns/ns1.hk-hkg/daily/qtypes.png"
                  alt="Auth DNS QTypes Statistics" class="w-full h-full object-contain rounded-lg" loading="lazy" />
                <div v-if="imageLoading.authQtypes"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i class="fas fa-spinner fa-spin text-4xl text-purple-500"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Auth DNS 节点统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-project-diagram mr-2"></i>
                节点性能统计 (Nodes)
              </h3>
              <p class="text-orange-100 text-sm">每日节点连接和响应统计</p>
            </div>
            <div class="p-4">
              <div class="relative aspect-video">
                <img
                  src="https://cdn.akaere.online/www-static.ripe.net/dynamic/dsc-graphs/authdns/ns1.hk-hkg/daily/nodes.png"
                  alt="Auth DNS Nodes Statistics" class="w-full h-full object-contain rounded-lg" loading="lazy" />
                <div v-if="imageLoading.authNodes"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i class="fas fa-spinner fa-spin text-4xl text-orange-500"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Auth DNS TLDs 统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-globe mr-2"></i>
                顶级域名分布 (TLDs)
              </h3>
              <p class="text-teal-100 text-sm">每日顶级域名查询统计</p>
            </div>
            <div class="p-4">
              <div class="relative aspect-video">
                <img
                  src="https://cdn.akaere.online/https://www-static.ripe.net/dynamic/dsc-graphs/authdns/ns1.hk-hkg/daily/tlds.png"
                  alt="Auth DNS TLDs Statistics" class="w-full h-full object-contain rounded-lg" loading="lazy" />
                <div v-if="imageLoading.authTlds"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i class="fas fa-spinner fa-spin text-4xl text-teal-500"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Auth DNS 返回码统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-reply mr-2"></i>
                返回码分布 (RCodes)
              </h3>
              <p class="text-indigo-100 text-sm">每日 DNS 返回码统计</p>
            </div>
            <div class="p-4">
              <div class="relative aspect-video">
                <img
                  src="https://cdn.akaere.online/https://www-static.ripe.net/dynamic/dsc-graphs/authdns/ns1.hk-hkg/daily/rcodes.png"
                  alt="Auth DNS RCodes Statistics" class="w-full h-full object-contain rounded-lg" loading="lazy" />
                <div v-if="imageLoading.authRcodes"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i class="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">关于 RIPE DNS 服务</h2>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <p class="mb-4">
            RIPE NCC 运营着两个独立的 anycast DNS 服务：K-Root 和 AuthDNS。K-Root 是 13 个互联网根服务器之一，为全球提供 DNS 根解析服务；AuthDNS
            则提供权威域名服务，承载了大量域名区域。
          </p>
          <p class="mb-4">
            Pysio Networks 很荣幸在香港托管这两个关键的 DNS 服务节点。这些节点使用 anycast 技术运行，确保为亚太地区用户提供高性能、高可靠性的 DNS 解析服务。
          </p>
          <div class="grid md:grid-cols-2 gap-4 mt-6">
            <a href="https://www.ripe.net/analyse/dns/k-root/" target="_blank"
              class="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition duration-200">
              <i class="fas fa-info-circle text-2xl text-blue-500 mr-3"></i>
              <div>
                <p class="font-semibold text-blue-900 dark:text-blue-200">K-Root 服务</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">了解 K-Root 根服务器</p>
              </div>
              <i class="fas fa-external-link-alt ml-auto text-blue-400"></i>
            </a>
            <a href="https://www.ripe.net/analyse/dns/authdns/" target="_blank"
              class="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition duration-200">
              <i class="fas fa-server text-2xl text-purple-500 mr-3"></i>
              <div>
                <p class="font-semibold text-purple-900 dark:text-purple-200">AuthDNS 服务</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">了解权威 DNS 服务</p>
              </div>
              <i class="fas fa-external-link-alt ml-auto text-purple-400"></i>
            </a>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

// 图片加载状态
const imageLoading = ref({
  qtypes: true,
  nodes: true,
  tlds: true,
  rcodes: true,
  authQtypes: true,
  authNodes: true,
  authTlds: true,
  authRcodes: true
})

onMounted(() => {
  // 模拟图片加载完成
  setTimeout(() => {
    imageLoading.value.qtypes = false
    imageLoading.value.nodes = false
    imageLoading.value.tlds = false
    imageLoading.value.rcodes = false
    imageLoading.value.authQtypes = false
    imageLoading.value.authNodes = false
    imageLoading.value.authTlds = false
    imageLoading.value.authRcodes = false
  }, 1000)
})
</script>

<style scoped>
.prose img {
  border-radius: 0.5rem;
}
</style>
