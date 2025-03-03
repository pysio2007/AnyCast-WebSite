<!-- 重定向页面 -->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  // 获取节点名称
  const nodeName = decodeURIComponent(route.params.name as string)
  
  try {
    // 获取所有节点数据
    const response = await fetch('https://bmclapiii.akaere.online/')
    const nodes = await response.json()
    
    // 查找匹配的节点
    const targetNode = nodes.find((node: any) => node.name === nodeName)
    
    if (targetNode) {
      // 将节点信息存储到 localStorage
      localStorage.setItem('openNodeDetails', JSON.stringify(targetNode))
    }
    
    // 重定向到主页面，使用节点名称作为查询参数
    router.replace({
      path: '/openbmclapi',
      query: targetNode ? { node: encodeURIComponent(targetNode.name) } : undefined
    })
  } catch (error) {
    console.error('获取节点数据失败:', error)
    // 发生错误时也重定向到主页面
    router.replace('/openbmclapi')
  }
})
</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
</template> 