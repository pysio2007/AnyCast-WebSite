<template>
  <footer class="apple-footer">
    <div class="apple-footer-content">
      <div class="apple-footer-info">
        <span class="apple-footer-text">Pysio's Network</span>
        <span class="apple-footer-year">{{ currentYear }}</span>
      </div>
      <div class="apple-footer-divider"></div>
      <a 
        :href="`https://github.com/pysio2007/AnyCast-WebSite/commit/${gitHash}`"
        target="_blank"
        class="apple-footer-link"
      >
        <div class="apple-github-icon">
          <svg class="apple-git-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <span class="apple-commit-hash">{{ gitHash }}</span>
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()
const gitHash = computed(() => config.public.gitHash)
const currentYear = computed<number>(() => new Date().getFullYear())
</script>

<style scoped>
@reference "tailwindcss";

.apple-footer {
  @apply mt-auto py-6 px-6;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.apple-footer-content {
  @apply flex items-center justify-center space-x-4 max-w-4xl mx-auto;
}

.apple-footer-info {
  @apply flex items-center space-x-2;
}

.apple-footer-text {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.apple-footer-year {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.apple-footer-divider {
  @apply w-px h-4 bg-gray-300 dark:bg-gray-600;
}

.apple-footer-link {
  @apply flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ease-out;
}

.apple-github-icon {
  @apply flex items-center;
}

.apple-git-svg {
  @apply w-4 h-4;
}

.apple-commit-hash {
  @apply text-xs font-mono;
}

@media (prefers-color-scheme: dark) {
  .apple-footer {
    background: rgba(0, 0, 0, 0.8);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
