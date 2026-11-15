<script setup lang="ts">
import { networkLinks, toolLinks } from '@/lib/site'
</script>

<template>
  <div>
    <PageSeo title="网络工具箱" description="基于 RIPE RIS、Globalping、RDAP 等公共数据的网络工具集：BGP 路由查询、全球 Ping、路由追踪、WHOIS 与 Tor 节点查询。" />

    <PageHeader
      eyebrow="工具"
      title="网络工具箱"
      description="诊断任何地址：BGP 路由查询、全球 Ping、路由追踪与 WHOIS，数据均来自公开服务。"
    />

    <section class="page-container flex flex-col gap-8 py-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">诊断工具</h2>
        <p class="text-muted-foreground">网络分析与监控工具。</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LinkCard v-for="link in toolLinks" :key="link.to" v-bind="link" />
      </div>
    </section>

    <section class="page-container flex flex-col gap-8 border-t py-12">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold tracking-tight">网络信息</h2>
        <p class="text-muted-foreground">节点、互联、前缀与服务。</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LinkCard v-for="link in networkLinks" :key="link.to" v-bind="link" />
      </div>
    </section>
  </div>
</template>
