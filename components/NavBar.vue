<template>
  <nav class="apple-navbar">
    <!-- 左侧Logo区域 -->
    <div class="apple-navbar-logo">
      <NuxtLink to="/" class="apple-logo-link">
        <img src="https://www.pysio.online/assets/imgs/avast.svg" class="apple-logo-img" alt="Pysio Logo" />
        <span class="apple-logo-text">Pysio Network</span>
      </NuxtLink>
    </div>

    <!-- 中间菜单区域 -->
    <div class="apple-navbar-center">
      <!-- 桌面端菜单 -->
      <ul class="apple-nav-menu">
        <li><NuxtLink to="/" class="apple-nav-item">
          <i class="apple-nav-icon fas fa-home"></i>
          <span>首页</span>
        </NuxtLink></li>
        <li><NuxtLink to="/anycast" class="apple-nav-item">
          <i class="apple-nav-icon fas fa-network-wired"></i>
          <span>AnyCast</span>
        </NuxtLink></li>
        <li><NuxtLink to="/tor" class="apple-nav-item">
          <i class="apple-nav-icon fas fa-user-secret"></i>
          <span>Tor</span>
        </NuxtLink></li>
        <li><NuxtLink to="/dn42" class="apple-nav-item">
          <i class="apple-nav-icon fas fa-project-diagram"></i>
          <span>DN42</span>
        </NuxtLink></li>
        <li><NuxtLink to="/tools" class="apple-nav-item">
          <i class="apple-nav-icon fas fa-tools"></i>
          <span>工具箱</span>
        </NuxtLink></li>
        <li><NuxtLink to="/blog" class="apple-nav-item">
          <i class="apple-nav-icon fas fa-blog"></i>
          <span>Blog</span>
        </NuxtLink></li>
      </ul>
    </div>

    <!-- 右侧区域 -->
    <div class="apple-navbar-right">
      <!-- 移动端菜单按钮 -->
      <div class="apple-mobile-menu">
        <button class="apple-menu-button" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </button>
        <div v-if="showMobileMenu" class="apple-mobile-dropdown">
          <ul class="apple-mobile-nav">
            <li><NuxtLink to="/" class="apple-mobile-nav-item" @click="closeMobileMenu">
              <i class="fas fa-home"></i>
              <span>首页</span>
            </NuxtLink></li>
            <li><NuxtLink to="/anycast" class="apple-mobile-nav-item" @click="closeMobileMenu">
              <i class="fas fa-network-wired"></i>
              <span>AnyCast</span>
            </NuxtLink></li>
            <li><NuxtLink to="/tor" class="apple-mobile-nav-item" @click="closeMobileMenu">
              <i class="fas fa-user-secret"></i>
              <span>Tor</span>
            </NuxtLink></li>
            <li><NuxtLink to="/dn42" class="apple-mobile-nav-item" @click="closeMobileMenu">
              <i class="fas fa-project-diagram"></i>
              <span>DN42</span>
            </NuxtLink></li>
            <li><NuxtLink to="/tools" class="apple-mobile-nav-item" @click="closeMobileMenu">
              <i class="fas fa-tools"></i>
              <span>工具箱</span>
            </NuxtLink></li>
            <li><NuxtLink to="/blog" class="apple-mobile-nav-item" @click="closeMobileMenu">
              <i class="fas fa-blog"></i>
              <span>Blog</span>
            </NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>

<style scoped>
@reference "tailwindcss";

.apple-navbar {
  @apply flex items-center justify-between px-6 py-4 sticky top-0 z-50;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.apple-navbar-logo {
  @apply flex-shrink-0 w-64;
}

.apple-logo-link {
  @apply flex items-center space-x-3 transition-all duration-200 ease-out;
}

.apple-logo-link:hover {
  @apply transform scale-105;
}

.apple-logo-img {
  @apply w-8 h-8;
}

.apple-logo-text {
  @apply text-xl font-semibold text-gray-900 dark:text-white;
}

.apple-navbar-center {
  @apply flex-1 flex justify-center;
}

.apple-nav-menu {
  @apply hidden lg:flex items-center space-x-2;
}

.apple-nav-item {
  @apply flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 transition-all duration-200 ease-out hover:bg-gray-100 dark:hover:bg-gray-800;
}

.apple-nav-item.router-link-active {
  @apply bg-blue-500 text-white shadow-lg;
  background: linear-gradient(135deg, #007AFF, #0051D5);
}

.apple-nav-icon {
  @apply text-sm;
}

.apple-navbar-right {
  @apply flex-shrink-0 w-64 flex justify-end;
}

.apple-mobile-menu {
  @apply lg:hidden relative;
}

.apple-menu-button {
  @apply p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200;
}

.apple-mobile-dropdown {
  @apply absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.apple-mobile-nav {
  @apply p-2;
}

.apple-mobile-nav-item {
  @apply flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800;
}

.apple-mobile-nav-item.router-link-active {
  @apply bg-blue-500 text-white;
  background: linear-gradient(135deg, #007AFF, #0051D5);
}

@media (prefers-color-scheme: dark) {
  .apple-navbar {
    background: rgba(0, 0, 0, 0.8);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .apple-mobile-dropdown {
    background: rgba(0, 0, 0, 0.9);
  }
}
</style>
