<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">AS213605 下游政策</h1>
      
      <p class="mb-4">
        AS213605欢迎位于FogIXP内的网络运营商建立下游连接。我们提供IPv6连接服务，并遵循以下政策。
      </p>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">接入要求</h2>
        <div class="bg-gray-50 p-6 rounded-lg dark:bg-gray-800 mb-6">
          <ul class="space-y-4">
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">必须位于FogIXP内：</span>
                <span>所有希望建立下游连接的网络必须位于FogIXP交换点内。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">ASN要求：</span>
                <span>必须拥有有效的公共ASN。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">前缀要求：</span>
                <span>必须拥有有效的IPv6前缀，并通过RPKI验证。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">技术能力：</span>
                <span>必须具备基本的BGP配置能力。</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">连接详情</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-3">
              <i class="fas fa-network-wired text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-lg">连接类型</h3>
            </div>
            <p>IPv6 BGP会话</p>
          </div>
          
          <div class="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-3">
              <i class="fas fa-map-marker-alt text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-lg">连接位置</h3>
            </div>
            <p>FogIXP交换点</p>
          </div>
          
          <div class="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-3">
              <i class="fas fa-fingerprint text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-lg">本地AS</h3>
            </div>
            <p>213605</p>
          </div>
          
          <div class="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-3">
              <i class="fas fa-globe text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-lg">本地IP</h3>
            </div>
            <p class="font-mono">2001:7f8:ca:1::21:3605:1</p>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">路由策略</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-6 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-4">
              <i class="fas fa-arrow-right text-green-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-xl">导入策略</h3>
            </div>
            <ul class="space-y-2 pl-6 list-disc">
              <li>仅接受客户自己的前缀</li>
              <li>必须通过RPKI验证</li>
              <li>添加社区标记(213605:0:100)和(213605:0:1000)</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 p-6 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-4">
              <i class="fas fa-arrow-left text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-xl">导出策略</h3>
            </div>
            <ul class="space-y-2 pl-6 list-disc">
              <li>向客户导出我们的前缀</li>
              <li>向客户导出对等路由</li>
              <li>向客户导出上游路由</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">社区标记</h2>
        <p class="mb-4">我们使用以下社区标记来管理路由：</p>
        
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">社区标记</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">描述</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:100</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">客户路由(CUSTOMER)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:200</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">对等路由(PEER)</td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:300</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">传输/上游路由(TRANSIT)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:1000</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">下游路由(DOWNSTREAM)</td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:666</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">黑洞路由(BLACKHOLE)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:34927</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">不向上游导出</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">申请流程</h2>
        <div class="bg-blue-50 p-6 rounded-lg shadow-sm dark:bg-blue-900/20">
          <ol class="space-y-4 list-decimal pl-6">
            <li class="pl-2">确认您的网络位于FogIXP内</li>
            <li class="pl-2">准备您的ASN和IPv6前缀信息</li>
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
              <li>您的IPv6前缀</li>
              <li>您在FogIXP的连接信息</li>
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
import { ref, onMounted } from 'vue'

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