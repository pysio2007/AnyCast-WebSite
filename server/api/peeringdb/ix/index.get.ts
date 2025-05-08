import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const ids = query.ids
    
    if (!ids) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: ids'
      })
    }
    
    // 支持多个ID，以逗号分隔
    const idArray = Array.isArray(ids) ? ids : String(ids).split(',')
    
    // 并行获取所有IX数据
    const ixPromises = idArray.map(async (id) => {
      try {
        const response = await ofetch(`https://www.peeringdb.com/api/ix/${id}`, {
          headers: {
            'User-Agent': 'AnyCast-Website/1.0',
            'Accept': 'application/json'
          }
        })
        
        if (response?.data && response.data.length > 0) {
          return response.data[0]
        }
        return null
      } catch (error) {
        console.error(`Error fetching IX data for ID ${id}:`, error)
        return null
      }
    })
    
    const results = await Promise.all(ixPromises)
    const validResults = results.filter(Boolean)
    
    if (validResults.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No IX found with the provided IDs'
      })
    }
    
    return {
      ixs: validResults,
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