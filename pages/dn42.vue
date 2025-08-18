<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">DN42 Network</h1>

      <p class="mb-4">
        PYSIO-NetWork (<a href="https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=AS213605&type=aut-num"
          class="text-blue-500 hover:text-blue-600" target="_blank">AS213605</a>) 由 Pysio 运营。
      </p>

      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 dark:bg-yellow-900/20">
        <p class="text-yellow-700 dark:text-yellow-200">
          本网络节点（中国大陆节点除外）不与中国大陆的服务器 Peer，以避免可能的法律问题
        </p>
      </div>

      <div class="flex flex-col md:flex-row gap-6 my-6">
        <div class="flex-1">
          <h2 class="text-2xl font-bold mb-4">DN42 网络</h2>
          <ul>
            <li>仅支持 IPv4</li>
            <li>仅支持 WireGuard</li>
          </ul>
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-bold mb-4">BGP AS213605 网络</h2>
          <ul>
            <li>仅支持 IPv6</li>
          </ul>
        </div>
      </div>

      <div class="mb-6">
        <p>
          Looking Glass:
          <a href="https://anycast.ink/lg" class="text-blue-500 hover:text-blue-600" target="_blank">
            https://anycast.ink/lg
          </a>
        </p>
      </div>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">前缀</h2>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">DN42 网络</h3>
            <code class="block bg-gray-100 p-2 rounded dark:bg-gray-700">IPv4: 172.20.183.0/27</code>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">BGP互联网</h3>
            <code class="block bg-gray-100 p-2 rounded dark:bg-gray-700">IPv6: 2a14:67c1:a020::/44</code>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">Peering</h2>
        <p class="mb-4">目前 PYSIO-NetWork 开放 Peering，您可以通过建立 WireGuard 隧道与我 Peering。</p>
        <p class="mb-4">
          请将以下信息通过电子邮件发送至
          <a href="mailto:pysio@youtrack.cloud" class="text-blue-500 hover:text-blue-600">pysio@youtrack.cloud</a>
          或
          <a href="https://pysio.youtrack.cloud/form/f7c5df18-0d12-4f6e-b7bd-a6c3521fa0bf"
            class="text-blue-500 hover:text-blue-600" target="_blank">新建一个Issues</a>
        </p>

        <pre class="bg-gray-100 p-4 rounded-lg dark:bg-gray-800 overflow-x-auto">
ASN: 424242xxxx
Public IP: x.x.x.x (使用 IPV4)
DN42 IPv4:
Server: 你的服务器名称
WireGuard Public Key:
WireGuard Listen Port: 13605</pre>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">服务器列表</h2>

        <div class="grid gap-6">
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">SG新加坡</h3>
            <ul class="space-y-2">
              <li><strong>WireGuard 公钥：</strong> <code>hIvaNhslwKskpJRYogahHaZJuCh5VMPm1wLwpvpYFkg=</code></li>
              <li><strong>端点：</strong> dn42.pysio.online:&lt;您 ASN 的最后五位数字&gt;</li>
              <li><strong>公共 IP：</strong> dn42.pysio.online / 43.159.51.252</li>
              <li><strong>DN42 IPv4：</strong> 172.20.183.1</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">中国成都电信</h3>
            <ul class="space-y-2">
              <li><strong>WireGuard 公钥：</strong> <code>ViTlLbeCvEwYehAF6WbI7eekghVrkLoTbuhwzk0g0C8=</code></li>
              <li><strong>端点：</strong> home.pysio.online:&lt;您 ASN 的最后五位数字&gt;</li>
              <li><strong>公共 IP：</strong> home.pysio.online (DDNS)</li>
              <li><strong>DN42 IPv4：</strong> 172.20.183.2</li>
            </ul>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<style lang="postcss" scoped>
.prose code {
  padding: 0 0.5rem;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
