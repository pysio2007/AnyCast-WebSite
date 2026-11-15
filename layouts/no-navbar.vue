<template>
  <div class="lir-root flex flex-col min-h-screen" data-theme="light">
    <main class="flex-grow">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
// Used only by the LIR pages, which keep their legacy DaisyUI + Font Awesome design.
import '~/assets/css/lir.css'

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap',
    },
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
      integrity: 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==',
      crossorigin: 'anonymous',
      referrerpolicy: 'no-referrer',
    },
  ],
})
</script>
