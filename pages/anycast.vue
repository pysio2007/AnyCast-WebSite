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
          本网络不接受任何对等互联请求。如果您对 DN42 网络感兴趣，请查看我们的 DN42 页面。
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
          <a href="http://lg.pysio.online/" class="text-blue-500 hover:text-blue-600" target="_blank">
            http://lg.pysio.online/
          </a>
        </p>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
