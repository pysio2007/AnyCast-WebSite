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
    
    // 从PeeringDB获取IX对等信息
    const response = await ofetch(`https://www.peeringdb.com/api/netixlan?ix_id=${id}`, {
      headers: {
        'User-Agent': 'AnyCast-Website/1.0',
        'Accept': 'application/json'
      }
    })
    
    // 检查是否有结果
    if (!response?.data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'IX peers not found'
      })
    }
    
    return {
      peers: response.data,
      count: response.data.length,
      cached: false,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('Error fetching IX peers data:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch IX peers data'
    })
  }
}) 