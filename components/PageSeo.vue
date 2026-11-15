<template>
  <div></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
}>()

const siteTitle = 'Pysio Networks'
const defaultDescription = 'Pysio Networks 提供 Anycast 网络服务与开放网络工具集，包括 BGP 路由查询、全球 Ping、路由追踪、WHOIS 查询和 Tor 节点查询等功能。'

useHead({
  title: props.title ? `${props.title} - ${siteTitle}` : siteTitle,
  meta: [
    {
      name: 'description',
      content: props.description || defaultDescription
    },
    {
      property: 'og:title',
      content: props.title ? `${props.title} - ${siteTitle}` : siteTitle
    },
    {
      property: 'og:description',
      content: props.description || defaultDescription
    },
    {
      name: 'twitter:title',
      content: props.title ? `${props.title} - ${siteTitle}` : siteTitle
    },
    {
      name: 'twitter:description',
      content: props.description || defaultDescription
    }
  ]
})
</script> 