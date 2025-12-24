<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">AS213605 IX互联政策</h1>

      <p class="mb-4">
        PYSIO-NetWork (
        <a href="https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=AS213605&type=aut-num"
          class="text-blue-500 hover:text-blue-600" target="_blank">AS213605</a>
        ) 目前在以下IX交换点提供对等互联服务。
      </p>

      <div class="bg-green-50 border-l-4 border-green-400 p-4 my-4 dark:bg-green-900/20">
        <p class="text-green-700 dark:text-green-200">
          我们支持所有地区和所有人的Peer和下游链接，无门槛，仅限非商业用途。如果您对下游连接感兴趣，请查看我们的
          <a href="/downstream"
            class="text-blue-600 hover:text-blue-800 font-semibold dark:text-blue-300 dark:hover:text-blue-100">下游政策</a>。
        </p>
      </div>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">支持的IX交换点</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- AKIX -->
          <div
            class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="bg-blue-50 dark:bg-blue-900/30 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xl">AKIX</h3>
                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-800 dark:text-blue-200">
                  Frankfurt
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Akaere Internet Exchange Point
              </p>
            </div>
            <div class="p-4">
              <div class="mb-3">
                <a href="https://www.peeringdb.com/ix/4718" target="_blank"
                  class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                  <i class="fas fa-external-link-alt mr-1"></i> PeeringDB: IX #4718
                </a>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="font-medium">对等节点:</p>
                  <p>9</p>
                </div>
                <div>
                  <p class="font-medium">开放政策:</p>
                  <p>8</p>
                </div>
                <div>
                  <p class="font-medium">总速率:</p>
                  <p>31G</p>
                </div>
                <div>
                  <p class="font-medium">IPv6 覆盖:</p>
                  <p>100%</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="font-medium mb-1">我们的对等信息:</p>
                <div class="bg-gray-50 p-2 rounded dark:bg-gray-700 font-mono text-xs">
                  <p>ASN: 213605</p>
                  <p>IPv6: 2a14:67c1:a080::100</p>
                  <p>速率: 1G</p>
                  <p>策略: RS PEER BFD Support</p>
                </div>
              </div>
            </div>
          </div>

          <!-- FogIXP -->
          <div
            class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="bg-blue-50 dark:bg-blue-900/30 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xl">FogIXP</h3>
                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-800 dark:text-blue-200">
                  Avers, CH
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Fog Internet Exchange Point
              </p>
            </div>
            <div class="p-4">
              <div class="mb-3">
                <a href="https://www.peeringdb.com/ix/3756" target="_blank"
                  class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                  <i class="fas fa-external-link-alt mr-1"></i> PeeringDB: IX #3756
                </a>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="font-medium">对等节点:</p>
                  <p>345</p>
                </div>
                <div>
                  <p class="font-medium">开放政策:</p>
                  <p>317</p>
                </div>
                <div>
                  <p class="font-medium">总速率:</p>
                  <p>891G</p>
                </div>
                <div>
                  <p class="font-medium">IPv6 覆盖:</p>
                  <p>99%</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="font-medium mb-1">我们的对等信息:</p>
                <div class="bg-gray-50 p-2 rounded dark:bg-gray-700 font-mono text-xs">
                  <p>ASN: 213605</p>
                  <p>IPv6: 2001:7f8:ca:1:0:21:3605:1</p>
                  <p>速率: 1G</p>
                  <p>策略: RS PEER BFD Support</p>
                </div>
              </div>
            </div>
          </div>

          <!-- LOCIX FRANKFURT -->
          <div
            class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="bg-green-50 dark:bg-green-900/30 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xl">LOCIX FRANKFURT</h3>
                <div class="flex gap-2">
                  <span
                    class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-800 dark:text-green-200">
                    Frankfurt am Main
                  </span>
                  <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-800 dark:text-blue-200">
                    下游支持
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                LOCIX EXCHANGE FRANKFURT
              </p>
            </div>
            <div class="p-4">
              <div class="mb-3">
                <a href="https://www.peeringdb.com/ix/2084" target="_blank"
                  class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                  <i class="fas fa-external-link-alt mr-1"></i> PeeringDB: IX #2084
                </a>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="font-medium">对等节点:</p>
                  <p>303</p>
                </div>
                <div>
                  <p class="font-medium">开放政策:</p>
                  <p>279</p>
                </div>
                <div>
                  <p class="font-medium">总速率:</p>
                  <p>2.6T</p>
                </div>
                <div>
                  <p class="font-medium">IPv6 覆盖:</p>
                  <p>100%</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="font-medium mb-1">我们的对等信息:</p>
                <div class="bg-gray-50 p-2 rounded dark:bg-gray-700 font-mono text-xs">
                  <p>ASN: 213605</p>
                  <p>IPv6: 2001:7f8:f2:e1:0:21:3605:1</p>
                  <p>速率: 1G</p>
                  <p>策略: RS PEER BFD Support</p>
                </div>
              </div>
            </div>
          </div>

          <!-- INTERIX -->
          <div
            class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="bg-purple-50 dark:bg-purple-900/30 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xl">INTERIX</h3>
                <span
                  class="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded dark:bg-purple-800 dark:text-purple-200">
                  Amsterdam
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                InterIX Internet Exchange Amsterdam
              </p>
            </div>
            <div class="p-4">
              <div class="mb-3">
                <a href="https://www.peeringdb.com/ix/3990" target="_blank"
                  class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                  <i class="fas fa-external-link-alt mr-1"></i> PeeringDB: IX #3990
                </a>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="font-medium">对等节点:</p>
                  <p>139</p>
                </div>
                <div>
                  <p class="font-medium">开放政策:</p>
                  <p>114</p>
                </div>
                <div>
                  <p class="font-medium">总速率:</p>
                  <p>5.1T</p>
                </div>
                <div>
                  <p class="font-medium">IPv6 覆盖:</p>
                  <p>98%</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="font-medium mb-1">我们的对等信息:</p>
                <div class="bg-gray-50 p-2 rounded dark:bg-gray-700 font-mono text-xs">
                  <p>ASN: 213605</p>
                  <p>IPv6: 2001:7f8:134::a0</p>
                  <p>速率: 1G</p>
                  <p>策略: RS PEER BFD Support</p>
                </div>
              </div>
            </div>
          </div>

          <!-- TPIX-TW -->
          <div
            class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="bg-orange-50 dark:bg-orange-900/30 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xl">TPIX-TW</h3>
                <div class="flex gap-2">
                  <span
                    class="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded dark:bg-orange-800 dark:text-orange-200">
                    Taipei
                  </span>
                  <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-800 dark:text-blue-200">
                    下游支持
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Taipei Internet Exchange
              </p>
            </div>
            <div class="p-4">
              <div class="mb-3">
                <a href="https://www.peeringdb.com/ix/823" target="_blank"
                  class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                  <i class="fas fa-external-link-alt mr-1"></i> PeeringDB: IX #823
                </a>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="font-medium">对等节点:</p>
                  <p>149</p>
                </div>
                <div>
                  <p class="font-medium">开放政策:</p>
                  <p>107</p>
                </div>
                <div>
                  <p class="font-medium">总速率:</p>
                  <p>3.2T</p>
                </div>
                <div>
                  <p class="font-medium">IPv6 覆盖:</p>
                  <p>78%</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="font-medium mb-1">我们的对等信息:</p>
                <div class="bg-gray-50 p-2 rounded dark:bg-gray-700 font-mono text-xs">
                  <p>ASN: 213605</p>
                  <p>IPv4: 203.163.223.49</p>
                  <p>IPv6: 2406:d400:1:133:203:163:223:49</p>
                  <p>速率: 1G</p>
                  <p>策略: RS PEER Open</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ONIX -->
          <div
            class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xl">ONIX</h3>
                <div class="flex gap-2">
                  <span
                    class="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded dark:bg-indigo-800 dark:text-indigo-200">
                    Toronto
                  </span>
                  <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-800 dark:text-blue-200">
                    下游支持
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Ontario Internet Exchange
              </p>
            </div>
            <div class="p-4">
              <div class="mb-3">
                <a href="https://www.peeringdb.com/ix/4059" target="_blank"
                  class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                  <i class="fas fa-external-link-alt mr-1"></i> PeeringDB: IX #4059
                </a>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="font-medium">对等节点:</p>
                  <p>149</p>
                </div>
                <div>
                  <p class="font-medium">开放政策:</p>
                  <p>138</p>
                </div>
                <div>
                  <p class="font-medium">总速率:</p>
                  <p>863G</p>
                </div>
                <div>
                  <p class="font-medium">IPv6 覆盖:</p>
                  <p>98%</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="font-medium mb-1">我们的对等信息:</p>
                <div class="bg-gray-50 p-2 rounded dark:bg-gray-700 font-mono text-xs">
                  <p>ASN: 213605</p>
                  <p>IPv4: 149.112.50.137</p>
                  <p>IPv6: 2001:504:125:e1::137</p>
                  <p>速率: 1G</p>
                  <p>策略: RS PEER BFD Support Open</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Poema IX -->
          <div
            class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="bg-teal-50 dark:bg-teal-900/30 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xl">Poema IX</h3>
                <div class="flex gap-2">
                  <span
                    class="text-sm bg-teal-100 text-teal-800 px-2 py-1 rounded dark:bg-teal-800 dark:text-teal-200">
                    Taipei City
                  </span>
                  <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-800 dark:text-blue-200">
                    下游支持
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Poema eXchange LLC
              </p>
            </div>
            <div class="p-4">
              <div class="mb-3">
                <a href="https://www.peeringdb.com/ix/3792" target="_blank"
                  class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                  <i class="fas fa-external-link-alt mr-1"></i> PeeringDB: IX #3792
                </a>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="font-medium">对等节点:</p>
                  <p>61</p>
                </div>
                <div>
                  <p class="font-medium">开放政策:</p>
                  <p>55</p>
                </div>
                <div>
                  <p class="font-medium">总速率:</p>
                  <p>41G</p>
                </div>
                <div>
                  <p class="font-medium">IPv6 覆盖:</p>
                  <p>100%</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="font-medium mb-1">我们的对等信息:</p>
                <div class="bg-gray-50 p-2 rounded dark:bg-gray-700 font-mono text-xs">
                  <p>ASN: 213605</p>
                  <p>IPv6: 2404:f4c0:f70e:1980::213:605</p>
                  <p>速率: 500M</p>
                  <p>策略: RS PEER Open</p>
                </div>
              </div>
            </div>
          </div>

          <!-- STUIX -->
          <div
            class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="bg-red-50 dark:bg-red-900/30 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xl">STUIX</h3>
                <div class="flex gap-2">
                  <span
                    class="text-sm bg-red-100 text-red-800 px-2 py-1 rounded dark:bg-red-800 dark:text-red-200">
                    Taipei City
                  </span>
                  <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-800 dark:text-blue-200">
                    下游支持
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Student & Technology United Internet Exchanges
              </p>
            </div>
            <div class="p-4">
              <div class="mb-3">
                <a href="https://www.peeringdb.com/ix/3352" target="_blank"
                  class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                  <i class="fas fa-external-link-alt mr-1"></i> PeeringDB: IX #3352
                </a>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="font-medium">对等节点:</p>
                  <p>108</p>
                </div>
                <div>
                  <p class="font-medium">开放政策:</p>
                  <p>94</p>
                </div>
                <div>
                  <p class="font-medium">总速率:</p>
                  <p>3.2T</p>
                </div>
                <div>
                  <p class="font-medium">IPv6 覆盖:</p>
                  <p>98%</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="font-medium mb-1">我们的对等信息:</p>
                <div class="bg-gray-50 p-2 rounded dark:bg-gray-700 font-mono text-xs">
                  <p>ASN: 213605</p>
                  <p>IPv4: 103.158.187.170</p>
                  <p>IPv6: 2a0f:5707:ffe3::170</p>
                  <p>速率: 10G</p>
                  <p>策略: RS PEER BFD Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">对等互联政策</h2>
        <div class="bg-gray-50 p-6 rounded-lg dark:bg-gray-800 mb-6">
          <ul class="space-y-4">
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">开放政策：</span>
                <span>我们支持所有地区和所有人的Peer和下游链接，无门槛，仅限非商业用途。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">BFD支持：</span>
                <span>我们支持BFD快速检测，以提高网络稳定性和故障转移速度。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">路由服务器支持：</span>
                <span>我们接受通过路由服务器建立的会话，简化配置过程。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">RPKI验证：</span>
                <span>我们使用RPKI验证所有路由，确保路由安全。</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">申请流程</h2>
        <div class="bg-blue-50 p-6 rounded-lg shadow-sm dark:bg-blue-900/20">
          <ol class="space-y-4 list-decimal pl-6">
            <li class="pl-2">确认您的网络位于我们支持的IX交换点内</li>
            <li class="pl-2">准备您的ASN和IPv6地址信息</li>
            <li class="pl-2">通过邮件联系我们：
              <a href="mailto:team@pysio.online" class="text-blue-500 hover:text-blue-600 font-medium">
                team@pysio.online
              </a>
            </li>
          </ol>

          <div class="mt-6 bg-white p-5 rounded-md dark:bg-gray-800 border-l-4 border-blue-500">
            <h4 class="font-bold text-lg mb-3">提供以下信息：</h4>
            <ul class="space-y-2 pl-5 list-disc">
              <li>您的ASN</li>
              <li>您的IPv6地址</li>
              <li>您所在的IX交换点</li>
              <li>技术联系人信息</li>
            </ul>
          </div>
        </div>
      </section>

      <div class="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <a href="/anycast" class="inline-flex items-center text-blue-500 hover:text-blue-600">
          <i class="fas fa-arrow-left mr-2"></i>
          返回AS213605网络
        </a>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

onMounted(() => {
  // 页面初始化
})
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
