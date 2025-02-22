<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-8">
      <i class="fas fa-code-branch mr-2"></i>更新日志
    </h1>

    <div class="max-w-4xl mx-auto">
      <div class="card bg-base-200/50 backdrop-blur-md p-6">
        <!-- Git Hash 显示 -->
        <div class="text-sm text-center mb-6 opacity-75">
          当前版本: {{ gitHash }}
        </div>

        <!-- 更新日志列表 -->
        <div class="space-y-8">
          <div v-for="(changes, date) in groupedChangelog" :key="date" class="card bg-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl">
                <i class="fas fa-calendar mr-2"></i>{{ formatDate(date) }}
              </h2>
              
              <!-- 按类型分组显示变更 -->
              <div class="space-y-4 mt-4">
                <!-- 新功能 -->
                <div v-if="changes.feat?.length" class="space-y-2">
                  <h3 class="font-semibold flex items-center gap-2">
                    <i class="fas fa-star text-primary"></i>新功能
                  </h3>
                  <ul class="list-disc list-inside space-y-1 ml-4">
                    <li v-for="item in changes.feat" :key="item.hash" class="text-sm">
                      {{ item.message }}
                    </li>
                  </ul>
                </div>

                <!-- Bug修复 -->
                <div v-if="changes.fix?.length" class="space-y-2">
                  <h3 class="font-semibold flex items-center gap-2">
                    <i class="fas fa-bug text-warning"></i>问题修复
                  </h3>
                  <ul class="list-disc list-inside space-y-1 ml-4">
                    <li v-for="item in changes.fix" :key="item.hash" class="text-sm">
                      {{ item.message }}
                    </li>
                  </ul>
                </div>

                <!-- 文档更新 -->
                <div v-if="changes.docs?.length" class="space-y-2">
                  <h3 class="font-semibold flex items-center gap-2">
                    <i class="fas fa-book text-info"></i>文档更新
                  </h3>
                  <ul class="list-disc list-inside space-y-1 ml-4">
                    <li v-for="item in changes.docs" :key="item.hash" class="text-sm">
                      {{ item.message }}
                    </li>
                  </ul>
                </div>

                <!-- 性能优化 -->
                <div v-if="changes.perf?.length" class="space-y-2">
                  <h3 class="font-semibold flex items-center gap-2">
                    <i class="fas fa-bolt text-success"></i>性能优化
                  </h3>
                  <ul class="list-disc list-inside space-y-1 ml-4">
                    <li v-for="item in changes.perf" :key="item.hash" class="text-sm">
                      {{ item.message }}
                    </li>
                  </ul>
                </div>

                <!-- 其他更改 -->
                <div v-if="changes.other?.length" class="space-y-2">
                  <h3 class="font-semibold flex items-center gap-2">
                    <i class="fas fa-circle-info text-info"></i>其他更改
                  </h3>
                  <ul class="list-disc list-inside space-y-1 ml-4">
                    <li v-for="item in changes.other" :key="item.hash" class="text-sm">
                      {{ item.message }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="alert alert-error mt-4">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const gitHash = computed(() => config.public.gitHash.slice(0, 7))

const loading = ref(false)
const error = ref('')
const changelog = ref([])

// 按日期分组的更新日志
const groupedChangelog = computed(() => {
  const groups = {}
  
  for (const commit of changelog.value) {
    const date = new Date(commit.date).toISOString().split('T')[0]
    if (!groups[date]) {
      groups[date] = {
        feat: [],
        fix: [],
        docs: [],
        perf: [],
        other: []
      }
    }

    // 根据提交类型分类
    if (commit.type === 'feat') {
      groups[date].feat.push(commit)
    } else if (commit.type === 'fix') {
      groups[date].fix.push(commit)
    } else if (commit.type === 'docs') {
      groups[date].docs.push(commit)
    } else if (commit.type === 'perf') {
      groups[date].perf.push(commit)
    } else {
      groups[date].other.push(commit)
    }
  }

  // 只返回最近10天的数据
  return Object.fromEntries(
    Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 10)
  )
})

// 格式化日期
function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 解析常规提交格式
function parseConventionalCommit(message) {
  const regex = /^(feat|fix|perf|docs|chore|style|refactor|test|build|ci|revert)(\(.+\))?: (.+)$/
  const match = message.match(regex)
  
  if (match) {
    return {
      type: match[1],
      scope: match[2]?.slice(1, -1) || null,
      message: match[3]
    }
  }
  
  return {
    type: 'other',
    scope: null,
    message: message
  }
}

// 获取更新日志
async function fetchChangelog() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('https://api.github.com/repos/pysio2007/AnyCast-WebSite/commits')
    const commits = await response.json()
    
    changelog.value = commits.map(commit => {
      const parsed = parseConventionalCommit(commit.commit.message)
      return {
        hash: commit.sha,
        date: commit.commit.author.date,
        ...parsed
      }
    })
  } catch (err) {
    error.value = '获取更新日志失败: ' + err.message
    console.error('获取更新日志失败:', err)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取更新日志
onMounted(() => {
  fetchChangelog()
})
</script>

<style scoped>
.changelog-item {
  transition: all 0.3s ease;
}

.changelog-item:hover {
  transform: translateX(4px);
}
</style> 