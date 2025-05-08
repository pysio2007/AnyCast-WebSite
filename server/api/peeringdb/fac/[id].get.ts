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
    
    // 从PeeringDB获取设施信息
    const response = await ofetch(`https://www.peeringdb.com/api/fac/${id}`, {
      headers: {
        'User-Agent': 'AnyCast-Website/1.0',
        'Accept': 'application/json'
      }
    })
    
    // 检查是否有结果
    if (!response?.data || response.data.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Facility not found'
      })
    }
    
    // 返回第一个结果
    return {
      facility: response.data[0],
      cached: false,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('Error fetching facility data:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch facility data'
    })
  }
}) 