<template>
  <div class="container mx-auto p-4">
    <PageSeo 
      title="网络工具箱" 
      description="专业的网络工具集，提供 Looking Glass、路由追踪、BGP分析器、WHOIS查询和Tor节点查询等功能。"
    />
    <h1 class="text-3xl font-bold text-center mb-8">
      <i class="fas fa-tools mr-2"></i>网络工具箱
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Looking Glass 卡片 -->
      <NuxtLink to="/lg"
        class="card bg-base-200/50 backdrop-blur-md hover:bg-base-200/70 transition-all duration-300 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">
            <i class="fas fa-search text-primary"></i>
            Looking Glass
          </h2>
          <p class="text-base-content/70">查看网络路由信息和BGP状态</p>
        </div>
      </NuxtLink>

      <!-- 路由追踪卡片 -->
      <NuxtLink to="/traceroute"
        class="card bg-base-200/50 backdrop-blur-md hover:bg-base-200/70 transition-all duration-300 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">
            <i class="fas fa-route text-primary"></i>
            路由追踪
          </h2>
          <p class="text-base-content/70">追踪网络数据包的传输路径</p>
        </div>
      </NuxtLink>

      <!-- BGP分析器卡片 -->
      <NuxtLink to="/bgp"
        class="card bg-base-200/50 backdrop-blur-md hover:bg-base-200/70 transition-all duration-300 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">
            <i class="fas fa-network-wired text-primary"></i>
            BGP分析器
          </h2>
          <p class="text-base-content/70">分析BGP路由可见性和路径信息</p>
        </div>
      </NuxtLink>

      <!-- WHOIS查询卡片 -->
      <NuxtLink to="/whois"
        class="card bg-base-200/50 backdrop-blur-md hover:bg-base-200/70 transition-all duration-300 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">
            <i class="fas fa-database text-primary"></i>
            WHOIS查询
          </h2>
          <p class="text-base-content/70">查询域名和IP地址的注册信息</p>
        </div>
      </NuxtLink>

      <!-- Tor节点查询卡片 -->
      <NuxtLink to="/tor-check"
        class="card bg-base-200/50 backdrop-blur-md hover:bg-base-200/70 transition-all duration-300 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">
            <i class="fas fa-mask text-primary"></i>
            Tor节点查询
          </h2>
          <p class="text-base-content/70">查询IP地址是否为Tor网络节点</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card:hover {
  border-color: rgba(9, 111, 220, 0.3);
  transform: translateY(-2px);
}
</style>
