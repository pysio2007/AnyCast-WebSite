<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">LIR 服务</h1>
      
      <p class="mb-4">
        我们是 RIPE NCC 和 APNIC 的正式会员，提供全面的 LIR (Local Internet Registry) 服务，
        包括 ASN 分配和 IPv4/IPv6 地址空间管理。
      </p>

      <div class="flex flex-wrap gap-8 my-8 items-center justify-center">
        <img src="/RIR/RIPE-NCC-Member.png" alt="RIPE NCC Member Logo" class="h-16 max-w-[220px] object-contain" />
        <img src="/RIR/APNIC_logo.svg" alt="APNIC Logo" class="h-14 max-w-[200px] object-contain" />
      </div>

      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 dark:bg-blue-900/20">
        <p class="text-blue-700 dark:text-blue-200">
          我们提供优质的 LIR 服务，支持中文服务，全程协助您完成资源申请和配置过程。所有价格已包含 RIPE/APNIC 会费分摊。
        </p>
      </div>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">RIPE NCC LIR 服务</h2>
        
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>RIPE定价种类</th>
                <th>价格（月付CNY）</th>
                <th>价格（月付USD）</th>
                <th>价格（年付CNY）</th>
                <th>价格（年付USD）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ASN Registration + /44 IPv6</td>
                <td>不适用</td>
                <td>不适用</td>
                <td>¥620/年</td>
                <td>$85/年</td>
              </tr>
              <tr>
                <td>IPv6 PA /44 ~ /48</td>
                <td>¥0/月</td>
                <td>$0/月</td>
                <td>¥0/年</td>
                <td>$0/年</td>
              </tr>
              <tr>
                <td>IPv6 Subnet Rental (/40)</td>
                <td>不适用</td>
                <td>不适用</td>
                <td>¥80/年</td>
                <td>$10/年</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">APNIC LIR 服务</h2>
        
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>APNIC定价种类</th>
                <th>价格（月付CNY）</th>
                <th>价格（月付USD）</th>
                <th>价格（年付CNY）</th>
                <th>价格（年付USD）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>APNIC IPv6 PA /44 ~ /48</td>
                <td>¥0/月</td>
                <td>$0/月</td>
                <td>¥0/年</td>
                <td>$0/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /43</td>
                <td>¥40/月</td>
                <td>$5/月</td>
                <td>¥370/年</td>
                <td>$50/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /42</td>
                <td>¥50/月</td>
                <td>$6/月</td>
                <td>¥440/年</td>
                <td>$60/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /41</td>
                <td>¥60/月</td>
                <td>$7/月</td>
                <td>¥510/年</td>
                <td>$70/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /40</td>
                <td>¥60/月</td>
                <td>$8/月</td>
                <td>¥590/年</td>
                <td>$80/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /39</td>
                <td>¥100/月</td>
                <td>$13/月</td>
                <td>¥950/年</td>
                <td>$130/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /38</td>
                <td>¥150/月</td>
                <td>$20/月</td>
                <td>¥1460/年</td>
                <td>$200/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /37</td>
                <td>¥210/月</td>
                <td>$28/月</td>
                <td>¥2040/年</td>
                <td>$280/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /36</td>
                <td>¥300/月</td>
                <td>$40/月</td>
                <td>¥2910/年</td>
                <td>$400/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /35</td>
                <td>¥440/月</td>
                <td>$60/月</td>
                <td>¥4370/年</td>
                <td>$600/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /34</td>
                <td>¥660/月</td>
                <td>$90/月</td>
                <td>¥6550/年</td>
                <td>$900/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /33</td>
                <td>¥1170/月</td>
                <td>$160/月</td>
                <td>¥11640/年</td>
                <td>$1600/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PI /48</td>
                <td>¥40/月</td>
                <td>$5/月</td>
                <td>¥370/年</td>
                <td>$50/年</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PI /32</td>
                <td>¥1600/月</td>
                <td>$220/月</td>
                <td>¥16000/年</td>
                <td>$2200/年</td>
              </tr>
              <tr>
                <td>APNIC ASN Registration</td>
                <td>不适用</td>
                <td>不适用</td>
                <td>首年¥5090<br>后续¥730/年</td>
                <td>首年$700<br>后续$100/年</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">LIR 服务说明</h2>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">什么是 LIR?</h3>
            <p>LIR (Local Internet Registry) 是互联网号码资源的本地注册机构，负责向终端用户或较小的 ISP 分配 IP 地址和 AS 号码。我们作为 RIPE 和 APNIC 的会员，可以帮助您申请和管理这些资源。</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">PA vs PI</h3>
            <p>PA (Provider Aggregatable) 地址是通过 ISP 分配的地址，当您更换提供商时需要放弃。PI (Provider Independent) 地址是直接从 RIR 获得的，可以带到任何 ISP。PI 地址价格更高但提供更好的灵活性。</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">服务内容</h3>
            <ul class="list-disc pl-5">
              <li>申请和分配 IP 地址空间</li>
              <li>申请和分配 AS 号码</li>
              <li>IP 地址反向解析 (rDNS) 配置</li>
              <li>RPKI (Resource Public Key Infrastructure) 配置</li>
              <li>IRR (Internet Routing Registry) 记录维护</li>
              <li>专业技术支持和咨询</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">申请流程</h3>
            <ol class="list-decimal pl-5">
              <li>提交申请表格</li>
              <li>完成资格审核</li>
              <li>签署服务协议</li>
              <li>缴纳相应费用</li>
              <li>1-3 个工作日内完成资源分配</li>
              <li>提供技术支持和配置指导</li>
            </ol>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">联系我们</h2>
        <p class="mb-4">
          如果您对我们的 LIR 服务有任何疑问或需要更多信息，请通过以下方式联系我们：
        </p>
        <div class="flex flex-wrap gap-4">
          <a href="mailto:lir@example.com" class="btn btn-outline gap-2">
            <i class="fas fa-envelope"></i> 电子邮件
          </a>
          <a href="https://t.me/example" class="btn btn-outline gap-2">
            <i class="fab fa-telegram"></i> Telegram
          </a>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'no-navbar'
})

onMounted(() => {
  // 基本页面初始化
})
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style> 