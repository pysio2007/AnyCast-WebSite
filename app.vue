<template>
  <TooltipProvider :delay-duration="150">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="bottom-right" />
  </TooltipProvider>
</template>

<script setup>
import 'vue-sonner/style.css'

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg'
    }
  ]
})
</script>
