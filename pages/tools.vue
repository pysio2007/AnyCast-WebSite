<template>
  <div class="apple-tools-page">
    <PageSeo 
      title="网络工具箱" 
      description="专业的网络工具集，提供 Looking Glass、路由追踪、BGP分析器、WHOIS查询和Tor节点查询等功能。"
    />
    
    <!-- Page Header -->
    <div class="apple-header-section">
      <div class="apple-header-icon">
        <i class="fas fa-tools"></i>
      </div>
      <h1 class="apple-page-title">网络工具箱</h1>
      <p class="apple-page-subtitle">专业的网络分析和监控工具集</p>
    </div>

    <!-- Tools Grid -->
    <div class="apple-tools-grid">
      <!-- Looking Glass -->
      <NuxtLink to="/lg" class="apple-tool-card apple-tool-card-blue">
        <div class="apple-tool-icon">
          <i class="fas fa-search"></i>
        </div>
        <div class="apple-tool-content">
          <h2 class="apple-tool-title">Looking Glass</h2>
          <p class="apple-tool-description">查看网络路由信息和BGP状态</p>
        </div>
        <div class="apple-tool-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </NuxtLink>

      <!-- 全球PING -->
      <NuxtLink to="/ping" class="apple-tool-card apple-tool-card-green">
        <div class="apple-tool-icon">
          <i class="fas fa-globe-asia"></i>
        </div>
        <div class="apple-tool-content">
          <h2 class="apple-tool-title">全球PING</h2>
          <p class="apple-tool-description">全球多点测试网络延迟和可达性</p>
        </div>
        <div class="apple-tool-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </NuxtLink>

      <!-- 路由追踪 -->
      <NuxtLink to="/traceroute" class="apple-tool-card apple-tool-card-orange">
        <div class="apple-tool-icon">
          <i class="fas fa-route"></i>
        </div>
        <div class="apple-tool-content">
          <h2 class="apple-tool-title">路由追踪</h2>
          <p class="apple-tool-description">追踪网络数据包的传输路径</p>
        </div>
        <div class="apple-tool-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </NuxtLink>

      <!-- 全球路由追踪 -->
      <NuxtLink to="/global-traceroute" class="apple-tool-card apple-tool-card-purple">
        <div class="apple-tool-icon">
          <i class="fas fa-project-diagram"></i>
        </div>
        <div class="apple-tool-content">
          <h2 class="apple-tool-title">全球路由追踪</h2>
          <p class="apple-tool-description">全球多点测试网络路径和跃点</p>
        </div>
        <div class="apple-tool-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </NuxtLink>

      <!-- BGP分析器 -->
      <NuxtLink to="/bgp" class="apple-tool-card apple-tool-card-red">
        <div class="apple-tool-icon">
          <i class="fas fa-network-wired"></i>
        </div>
        <div class="apple-tool-content">
          <h2 class="apple-tool-title">BGP分析器</h2>
          <p class="apple-tool-description">分析BGP路由可见性和路径信息</p>
        </div>
        <div class="apple-tool-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </NuxtLink>

      <!-- WHOIS查询 -->
      <NuxtLink to="/whois" class="apple-tool-card apple-tool-card-yellow">
        <div class="apple-tool-icon">
          <i class="fas fa-database"></i>
        </div>
        <div class="apple-tool-content">
          <h2 class="apple-tool-title">WHOIS查询</h2>
          <p class="apple-tool-description">查询域名和IP地址的注册信息</p>
        </div>
        <div class="apple-tool-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </NuxtLink>

      <!-- Tor节点查询 -->
      <NuxtLink to="/tor-check" class="apple-tool-card apple-tool-card-pink">
        <div class="apple-tool-icon">
          <i class="fas fa-mask"></i>
        </div>
        <div class="apple-tool-content">
          <h2 class="apple-tool-title">Tor节点查询</h2>
          <p class="apple-tool-description">查询IP地址是否为Tor网络节点</p>
        </div>
        <div class="apple-tool-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.apple-tools-page {
  @apply max-w-7xl mx-auto px-6 py-8 space-y-12;
}

.apple-header-section {
  @apply text-center space-y-6;
}

.apple-header-icon {
  @apply w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white text-3xl;
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
}

.apple-page-title {
  @apply text-4xl md:text-5xl font-bold text-gray-900 dark:text-white;
}

.apple-page-subtitle {
  @apply text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto;
}

.apple-tools-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.apple-tool-card {
  @apply p-6 rounded-2xl transition-all duration-300 ease-out cursor-pointer;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.apple-tool-card:hover {
  @apply transform -translate-y-2;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.apple-tool-icon {
  @apply w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl mb-4;
}

.apple-tool-card-blue .apple-tool-icon {
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
}

.apple-tool-card-green .apple-tool-icon {
  background: linear-gradient(135deg, #34C759, #30D158);
}

.apple-tool-card-orange .apple-tool-icon {
  background: linear-gradient(135deg, #FF9500, #FF8C00);
}

.apple-tool-card-purple .apple-tool-icon {
  background: linear-gradient(135deg, #AF52DE, #BF5AF2);
}

.apple-tool-card-red .apple-tool-icon {
  background: linear-gradient(135deg, #FF3B30, #FF2D92);
}

.apple-tool-card-yellow .apple-tool-icon {
  background: linear-gradient(135deg, #FFCC00, #FFB000);
}

.apple-tool-card-pink .apple-tool-icon {
  background: linear-gradient(135deg, #FF2D92, #FF1744);
}

.apple-tool-content {
  @apply flex-1 space-y-2;
}

.apple-tool-title {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.apple-tool-description {
  @apply text-gray-600 dark:text-gray-400 leading-relaxed;
}

.apple-tool-arrow {
  @apply text-gray-400 text-sm transition-all duration-200;
}

.apple-tool-card:hover .apple-tool-arrow {
  @apply text-gray-600 transform translate-x-1;
}

.apple-tool-card {
  @apply flex items-start space-x-4;
}

@media (prefers-color-scheme: dark) {
  .apple-tool-card {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .apple-tool-card:hover .apple-tool-arrow {
    @apply text-gray-300;
  }
}
</style>
