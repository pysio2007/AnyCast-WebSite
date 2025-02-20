<template>
  <div class="navbar bg-base-100 shadow-lg">
    <!-- 左侧Logo，固定宽度 -->
    <div class="w-64">
      <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">
        <img src="https://www.pysio.online/assets/imgs/avast.svg" class="w-8 h-8 mr-2" alt="Pysio Logo" />
        Pysio Network
      </NuxtLink>
    </div>

    <!-- 中间菜单部分 -->
    <div class="flex-1 flex justify-center">
      <!-- 桌面端菜单 -->
      <ul class="hidden lg:flex menu menu-horizontal px-1 gap-2">
        <li><NuxtLink to="/"><i class="fas fa-home mr-2"></i>首页</NuxtLink></li>
        <li><NuxtLink to="/anycast"><i class="fas fa-network-wired mr-2"></i>AnyCast</NuxtLink></li>
        <li><NuxtLink to="/dn42"><i class="fas fa-project-diagram mr-2"></i>DN42</NuxtLink></li>
        <li><NuxtLink to="/lg"><i class="fas fa-search mr-2"></i>Looking Glass</NuxtLink></li>
        <li><NuxtLink to="/blog"><i class="fas fa-blog mr-2"></i>Blog</NuxtLink></li>
      </ul>
    </div>

    <!-- 右侧占位，保持对称 -->
    <div class="w-64 flex justify-end">
      <!-- 移动端菜单 -->
      <div class="dropdown dropdown-end lg:hidden">
        <label tabindex="0" class="btn btn-ghost">
          <i class="fas fa-bars"></i>
        </label>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li><NuxtLink to="/"><i class="fas fa-home mr-2"></i>首页</NuxtLink></li>
          <li><NuxtLink to="/anycast"><i class="fas fa-network-wired mr-2"></i>AnyCast</NuxtLink></li>
          <li><NuxtLink to="/dn42"><i class="fas fa-project-diagram mr-2"></i>DN42</NuxtLink></li>
          <li><NuxtLink to="/lg"><i class="fas fa-search mr-2"></i>Looking Glass</NuxtLink></li>
          <li><NuxtLink to="/blog"><i class="fas fa-blog mr-2"></i>Blog</NuxtLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  padding: 0.5rem 1rem;
}
</style>
