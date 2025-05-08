import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: id'
      })
    }
    
    // 从PeeringDB获取IX信息
    const response = await ofetch(`https://www.peeringdb.com/api/ix/${id}`, {
      headers: {
        'User-Agent': 'AnyCast-Website/1.0',
        'Accept': 'application/json'
      }
    })
    
    // 检查是否有结果
    if (!response?.data || response.data.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'IX not found'
      })
    }
    
    // 返回第一个结果
    return {
      ix: response.data[0],
      cached: false,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('Error fetching IX data:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch IX data'
    })
  }
}) 