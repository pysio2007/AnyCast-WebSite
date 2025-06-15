<template>
  <div class="apple-layout">
    <NavBar />
    <main class="apple-main">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
// Layout setup if needed
</script>

<style scoped>
@reference "tailwindcss";

.apple-layout {
  @apply min-h-screen flex flex-col;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.apple-main {
  @apply flex-1;
}

@media (prefers-color-scheme: dark) {
  .apple-layout {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
}
</style> 