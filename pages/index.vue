<template>
  <div class="container mx-auto p-4">
    <h1 v-if="isLoading" class="text-2xl font-bold mb-4">
      <span class="loading loading-dots loading-lg"></span>
    </h1>
    <h1 v-else class="text-2xl font-bold mb-4">
      欢迎来自 {{ organization }} 的用户
    </h1>
  </div>
</template>

<script setup>
const organization = ref('')
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('https://ip.akaere.online/')
    const data = await response.json()
    organization.value = data.org
  } catch (error) {
    console.error('Error fetching IP info:', error)
    organization.value = 'Unknown Organization'
  } finally {
    isLoading.value = false
  }
})
</script>
