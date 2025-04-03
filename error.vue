<template>
  <div class="error-container min-h-screen flex flex-col bg-white dark:bg-gray-900">
    <PageSeo title="Error | Pysio Networks" />
    
    <!-- 顶部橙色边框 -->
    <div class="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500"></div>
    
    <!-- 导航条 -->
    <div class="border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div class="container mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center">
          <span class="font-bold text-base text-gray-800 dark:text-gray-100">Pysio Networks</span>
        </div>
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ new Date().toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
    
    <!-- 主内容 -->
    <div class="container mx-auto px-6 py-12 md:py-16 flex-grow flex flex-col md:flex-row items-center justify-center">
      <!-- 左侧状态码 -->
      <div class="w-full md:w-1/3 text-center md:text-right md:pr-12 mb-8 md:mb-0">
        <h1 class="text-9xl font-bold text-gray-100 dark:text-gray-800 select-none">
          {{ error.statusCode || '???' }}
        </h1>
      </div>
      
      <!-- 右侧内容 -->
      <div class="w-full md:w-2/3 md:pl-12 md:border-l border-gray-100 dark:border-gray-800">
        <div class="mb-8">
          <h2 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            <template v-if="error.statusCode === 404">
              Page not found
            </template>
            <template v-else-if="error.statusCode >= 500">
              Web server is returning an unknown error
            </template>
            <template v-else-if="error.statusCode === 403">
              Access denied
            </template>
            <template v-else>
              An error occurred
            </template>
          </h2>
          
          <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            <template v-if="error.statusCode === 404">
              The requested URL was not found on this server. That's all we know.
            </template>
            <template v-else-if="error.statusCode >= 500">
              The web server is returning an unexpected error. Please try again later.
            </template>
            <template v-else-if="error.statusCode === 403">
              You do not have access to this page. Please check your permissions.
            </template>
            <template v-else>
              An unexpected condition was encountered. Our technical staff have been notified of the error.
            </template>
          </p>
          
          <div class="flex flex-wrap gap-2 items-center text-sm text-gray-500 dark:text-gray-500">
            <div class="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-sm border border-gray-100 dark:border-gray-700">Error {{ error.statusCode || 'Unknown' }}</div>
            <span class="px-1">•</span>
            <span>Pysio Networks</span>
          </div>
          
          <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 text-sm font-mono text-gray-600 dark:text-gray-400 overflow-x-auto" v-if="error.message">
            <div class="mb-1 font-semibold text-gray-700 dark:text-gray-300">Error details:</div>
            {{ error.message }}
          </div>
        </div>
        
        <div class="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
          <h3 class="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-4">What happened?</h3>
          
          <div class="flex flex-wrap gap-3">
            <button @click="handleError" class="px-4 py-2 rounded-sm bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 text-white font-medium transition-colors">
              <span v-if="error.statusCode === 404">Back to homepage</span>
              <span v-else>Try again</span>
            </button>
            
            <button @click="goBack" class="px-4 py-2 rounded-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-25 text-gray-700 dark:text-gray-300 font-medium transition-colors">
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部 -->
    <div class="border-t border-gray-100 dark:border-gray-800 mt-auto bg-gray-50 dark:bg-gray-800">
      <div class="container mx-auto px-6 py-4">
        <div class="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div class="mb-2 md:mb-0 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pysio Networks | Anycast</span>
          </div>
          <p>If you think this is a mistake, please <a href="mailto:team@pysio.online" class="text-orange-500 hover:text-orange-600 hover:underline">contact support</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object
})

const handleError = () => {
  if (props.error?.statusCode === 404) {
    navigateTo('/')
  } else {
    clearError({ redirect: window.location.pathname })
  }
}

const goHome = () => {
  navigateTo('/')
}

const goBack = () => {
  window.history.length > 1 ? window.history.back() : navigateTo('/')
}
</script>

<style scoped>
.error-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 