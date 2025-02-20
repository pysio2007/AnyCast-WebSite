<template>
  <div class="container mx-auto p-4">
    <div v-if="isLoading" class="flex justify-center">
      <span class="loading loading-dots loading-lg"></span>
    </div>
    <div v-else>
      <!-- 分类和标签过滤器 -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-2 mb-4">
          <button 
            v-for="category in categories" 
            :key="category"
            @click="toggleCategory(category)"
            class="btn btn-sm"
            :class="selectedCategory === category ? 'btn-primary' : 'btn-ghost'"
          >
            {{ getCategoryDisplayName(category) }}
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in tags" 
            :key="tag"
            @click="toggleTag(tag)"
            class="badge badge-lg cursor-pointer"
            :class="selectedTags.includes(tag) ? 'badge-primary' : 'badge-ghost'"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 文章列表 -->
      <div class="flex flex-col gap-6">
        <div v-for="post in displayedPosts" :key="post.link" 
             class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div class="flex flex-col lg:flex-row">
            <figure v-if="post.image" class="lg:w-1/3">
              <img :src="post.image" :alt="post.title" 
                   class="h-64 w-full object-cover rounded-t-xl lg:rounded-l-xl lg:rounded-t-none"
                   @error="handleImageError"/>
            </figure>
            <div class="card-body lg:w-2/3">
              <h2 class="card-title text-2xl">
                <a :href="post.link" target="_blank" class="hover:text-primary transition-colors">
                  {{ post.title }}
                </a>
              </h2>
              <div class="flex flex-wrap gap-2 my-2">
                <span class="badge badge-primary">{{ getCategoryDisplayName(post.category) }}</span>
                <span v-for="tag in post.tags" :key="tag" class="badge badge-ghost">
                  {{ tag }}
                </span>
              </div>
              <p class="text-sm text-gray-500">{{ formatDate(post.pubDate) }}</p>
              <p class="line-clamp-3 text-gray-600">{{ post.description }}</p>
              <div class="card-actions justify-end mt-4">
                 <a :href="post.link" target="_blank" class="btn btn-primary">
                  阅读全文
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页控制 -->
      <div class="join grid grid-cols-2 w-60 mx-auto mt-8">
        <button 
          class="join-item btn btn-outline"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <button 
          class="join-item btn btn-outline"
          :disabled="currentPage >= maxPage"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { parseStringPromise } from 'xml2js'

const posts = ref([])
const isLoading = ref(true)
const currentPage = ref(1)
const postsPerPage = 5
const selectedCategory = ref('全部')  // 将初始值设为'全部'
const selectedTags = ref([])

// 分类名称映射和过滤配置
const categoryConfig = {
  excludeList: ['NekoXii','resource'],
  displayNames: {
    'daily': '日常',
    'develop': '开发'
  }
}

// 提取分类和标签
const categories = computed(() => {
  // 确保首先过滤掉不需要的分类
  const validPosts = posts.value.filter(post => !categoryConfig.excludeList.includes(post.category))
  const uniqueCategories = [...new Set(validPosts.map(post => post.category))]
  return ['全部', ...uniqueCategories]
})

const tags = computed(() => [...new Set(posts.value.flatMap(post => post.tags))])

// 过滤后的文章
const filteredPosts = computed(() => {
  return posts.value
    .filter(post => !categoryConfig.excludeList.includes(post.category))
    .filter(post => {
      const categoryMatch = !selectedCategory.value || selectedCategory.value === '全部' || 
                          post.category === selectedCategory.value
      const tagsMatch = selectedTags.value.length === 0 || 
                       selectedTags.value.every(tag => post.tags.includes(tag))
      return categoryMatch && tagsMatch
    })
})

// 当前页显示的文章
const displayedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const filtered = filteredPosts.value.map(post => ({
    ...post,
    displayCategory: getCategoryDisplayName(post.category)
  }))
  return filtered.slice(start, start + postsPerPage)
})

// 最大页数
const maxPage = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage))

// 分类显示名称转换
const getCategoryDisplayName = (category) => {
  if (category === '全部') return category
  return categoryConfig.displayNames[category] || category
}

// 分类和标签过滤方法
const toggleCategory = (category) => {
  selectedCategory.value = selectedCategory.value === category ? '全部' : category
  currentPage.value = 1
}

const toggleTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
  currentPage.value = 1
}

// 日期格式化
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const extractImage = (content) => {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i)
  return imgMatch ? imgMatch[1] : null
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(async () => {
  try {
    const response = await fetch('https://www.pysio.online/rss.xml')
    const xmlText = await response.text()
    const result = await parseStringPromise(xmlText)
    
    // 在数据源处就过滤掉不需要的分类
    const filteredItems = result.rss.channel[0].item.filter(
      item => !categoryConfig.excludeList.includes(item.category?.[0])
    )
    
    posts.value = filteredItems.map(item => ({
      title: item.title[0],
      link: item.link[0],
      description: item.description[0],
      pubDate: item.pubDate[0],
      image: extractImage(item.description[0]),
      category: item.category?.[0] || '未分类',
      tags: item['content:encoded']?.[0].match(/#[\w\u4e00-\u9fa5]+/g)?.map(tag => tag.slice(1)) || []
    })).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  } catch (error) {
    console.error('Error fetching RSS:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.card {
  @apply transition-all duration-300 ease-in-out;
}
</style>
