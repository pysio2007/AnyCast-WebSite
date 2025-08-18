<template>
  <div class="apple-page">
    <!-- Main Content -->
    <div class="apple-main-content">
      <!-- Welcome Hero -->
      <div class="apple-hero-section">
        <h1 class="apple-hero-title">
          <span class="apple-hero-from-container">
            来自
            <span class="apple-hero-org-wrapper">
              <span class="">{{ organization || '加载中...' }}</span>
            </span>
          </span>
        </h1>
        <h2 class="apple-hero-subtitle">
          欢迎来到 Pysio's Networks
        </h2>
        <p class="apple-hero-description">
          这里是 Pysio Networks 的网络监控/工具平台。你可以在此查询节点/BGP路由状态
        </p>
      </div>

      <!-- Services Update Section -->
      <div class="apple-services-section">

        <div class="apple-services-grid">
          <!-- IXP Peering Card -->
          <div class="apple-service-card apple-service-card-blue">
            <div class="apple-service-header">
              <div class="apple-service-icon">
                <i class="fas fa-handshake"></i>
              </div>
              <h3 class="apple-service-title">IXP内对等互联</h3>
            </div>
            <p class="apple-service-description">
              我们现在支持与位于相同IX交换点的网络运营商建立对等互联！
            </p>
            <NuxtLink to="/anycast" class="apple-service-link">
              <span>了解详情</span>
              <i class="fas fa-arrow-right apple-service-arrow"></i>
            </NuxtLink>
          </div>

          <!-- Downstream Connection Card -->
          <div class="apple-service-card apple-service-card-green">
            <div class="apple-service-header">
              <div class="apple-service-icon">
                <i class="fas fa-network-wired"></i>
              </div>
              <h3 class="apple-service-title">下游连接</h3>
            </div>
            <p class="apple-service-description">
              现支持FogIXP、AKIXP和LOCIX FRANKFURT内网络，以及香港/美国地区的下游接入。
            </p>
            <NuxtLink to="/downstream" class="apple-service-link">
              <span>查看政策</span>
              <i class="fas fa-arrow-right apple-service-arrow"></i>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const organization = ref('')

async function fetchOrganizationData() {
  try {
    const response = await fetch('https://ip.akaere.online/')
    const data = await response.json()
    return data.org || '未知组织'
  } catch (error) {
    console.error('Error fetching IP data:', error)
    return '未知组织'
  }
}

onMounted(async () => {
  organization.value = await fetchOrganizationData()
})
</script>

<style scoped>
@reference "tailwindcss";

.apple-page {
  @apply min-h-screen px-6 py-8;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.apple-main-content {
  @apply max-w-6xl mx-auto space-y-10;
}

.apple-hero-section {
  @apply text-center py-12 space-y-6;
}

.apple-hero-title {
  @apply text-4xl md:text-5xl font-bold text-gray-900 leading-tight;
}

.apple-hero-from-container {
  @apply inline-block;
}

.apple-hero-org-wrapper {
  @apply relative inline-block;
  min-width: 300px;
  min-height: 1.2em;
  display: inline-block;
}

.apple-hero-org {
  @apply text-transparent bg-clip-text;
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
}

.apple-hero-subtitle {
  @apply text-2xl md:text-3xl font-semibold text-gray-700;
}

.apple-hero-description {
  @apply text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed;
}

.apple-services-section {
  @apply space-y-8;
}

.apple-section-header {
  @apply flex items-center justify-center space-x-3;
}

.apple-section-icon {
  @apply text-2xl;
}

.apple-section-title {
  @apply text-2xl font-bold text-gray-900;
}

.apple-services-grid {
  @apply grid md:grid-cols-2 gap-4;
}

.apple-service-card {
  @apply p-6 rounded-xl shadow-sm backdrop-blur-sm transition-all duration-300 ease-out;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.apple-service-card:hover {
  @apply transform -translate-y-1 shadow-lg;
}

.apple-service-card-blue {
  border-left: 3px solid #007AFF;
}

.apple-service-card-green {
  border-left: 3px solid #34C759;
}

.apple-service-header {
  @apply flex items-center space-x-3 mb-3;
}

.apple-service-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm;
}

.apple-service-card-blue .apple-service-icon {
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
}

.apple-service-card-green .apple-service-icon {
  background: linear-gradient(135deg, #34C759, #30D158);
}

.apple-service-title {
  @apply text-lg font-bold text-gray-900;
}

.apple-service-description {
  @apply text-gray-600 leading-relaxed mb-4 text-sm;
}

.apple-service-link {
  @apply inline-flex items-center space-x-2 font-medium transition-all duration-200 ease-out;
}

.apple-service-card-blue .apple-service-link {
  @apply text-blue-600 hover:text-blue-700;
}

.apple-service-card-green .apple-service-link {
  @apply text-green-600 hover:text-green-700;
}

.apple-service-arrow {
  @apply text-sm transition-transform duration-200;
}

.apple-service-link:hover .apple-service-arrow {
  @apply transform translate-x-1;
}

@media (prefers-color-scheme: dark) {
  .apple-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .apple-service-card {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .apple-hero-title,
  .apple-section-title,
  .apple-service-title {
    @apply text-white;
  }

  .apple-hero-subtitle {
    @apply text-gray-300;
  }

  .apple-hero-description,
  .apple-service-description {
    @apply text-gray-400;
  }
}
</style>
