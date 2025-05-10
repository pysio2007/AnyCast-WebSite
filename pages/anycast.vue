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
          我们目前接受位于<a href="/ix" class="text-yellow-600 hover:text-yellow-800 font-semibold dark:text-yellow-300 dark:hover:text-yellow-100">AKIX和FogIXP</a>交换点的网络运营商的对等互联请求。如果您对 DN42 网络感兴趣，请查看我们的 DN42 页面。
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
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">ASN</h3>
            <code class="block bg-gray-100 p-2 rounded dark:bg-gray-700">AS213605</code>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">IPv6 地址块</h3>
            <code class="block bg-gray-100 p-2 rounded dark:bg-gray-700">2a14:67c1:a020::/44</code>
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
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">CHF 12.00/季</span>
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

onMounted(() => {
  // 仅保留基本的页面初始化
})
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
