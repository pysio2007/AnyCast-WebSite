<template>
  <div></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
}>()

const siteTitle = 'Pysio Networks'
const defaultDescription = 'Pysio Networks 提供 Anycast 网络服务与专业网络工具集，包括 Looking Glass、路由追踪、BGP分析器、WHOIS查询和Tor节点查询等功能。'

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