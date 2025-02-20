<template>
  <div class="container mx-auto p-4">
    <div class="card backdrop-blur-md bg-base-200/50 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6 text-center justify-center">
          <i class="fas fa-route mr-2"></i>路由追踪
        </h2>
        
        <div class="w-full max-w-4xl mx-auto">
          <!-- 输入区域 -->
          <div class="flex flex-col md:flex-row gap-4 items-end">
            <!-- 服务器选择 -->
            <div class="form-control md:w-1/3">
              <label class="label">
                <span class="label-text">选择服务器</span>
              </label>
              <div class="dropdown w-full">
                <label tabindex="0" class="btn btn-ghost w-full justify-between bg-base-100/70 hover:bg-base-200/70">
                  <span class="normal-case">{{ selectedServer || '请选择服务器' }}</span>
                  <i class="fas fa-chevron-down text-xs opacity-50"></i>
                </label>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200/95 backdrop-blur-md rounded-box w-full max-h-60 overflow-auto">
                  <li v-for="server in availableServers" :key="server">
                    <a 
                      @click="selectedServer = server"
                      :class="{'active': selectedServer === server}"
                    >
                      <i class="fas fa-server text-xs opacity-50"></i>
                      {{ server }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 目标输入 -->
            <div class="form-control flex-1">
              <label class="label">
                <span class="label-text">目标地址</span>
              </label>
              <div class="join w-full">
                <input 
                  v-model="target"
                  type="text"
                  placeholder="8.8.8.8 或 google.com"
                  class="input input-bordered join-item flex-1 bg-base-100/70"
                  :disabled="!selectedServer"
                  @keyup.enter="performTraceroute"
                />
                <button 
                  class="btn btn-primary join-item w-24"
                  @click="performTraceroute"
                  :disabled="!canQuery"
                >
                  <i class="fas fa-play mr-1"></i>
                  <span class="hidden sm:inline">追踪</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 结果显示 -->
          <div class="mt-8">
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 transform -translate-y-4"
              enter-to-class="opacity-100 transform translate-y-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 transform translate-y-0"
              leave-to-class="opacity-0 transform -translate-y-4"
            >
              <div v-if="loading" class="text-center p-8">
                <span class="loading loading-spinner loading-lg"></span>
                <p class="mt-4 text-base-content/70">正在追踪路由...</p>
              </div>
              
              <div v-else-if="result" class="card bg-base-100/70 backdrop-blur shadow-lg">
                <div class="card-body">
                  <pre class="whitespace-pre-wrap text-sm font-mono">{{ result }}</pre>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const availableServers = ['dn42', 'bgp', 'home']
const selectedServer = ref('')
const target = ref('')
const loading = ref(false)
const result = ref('')
const apiUrl = 'https://lg.pysio.online/api/'

const canQuery = computed(() => {
  return selectedServer.value && target.value.trim()
})

const performTraceroute = async () => {
  if (!canQuery.value) return
  
  loading.value = true
  result.value = ''
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servers: [selectedServer.value],
        type: 'traceroute',
        args: target.value.trim()
      })
    })
    
    const data = await response.json()
    if (data.error) {
      result.value = `错误: ${data.error}`
    } else if (data.result && data.result.length > 0) {
      result.value = data.result[0].data
    }
  } catch (error) {
    result.value = '请求失败: ' + (error instanceof Error ? error.message : String(error))
  } finally {
    loading.value = false
  }
}

// 添加键盘事件处理
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && canQuery.value) {
    performTraceroute()
  }
}

onMounted(() => {
  window.addEventListener('keypress', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})
</script>

<style scoped>
.card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input, .select {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input:focus, .select:focus {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.join {
  display: flex;
  align-items: stretch;
}

.join > .join-item:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.join > .join-item:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

/* 添加下拉菜单相关样式 */
.dropdown-content {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-content li a {
  transition: all 0.2s ease;
}

.dropdown-content li a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-content li a.active {
  background: rgba(var(--p), 0.2);
  color: hsl(var(--p));
}

.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
