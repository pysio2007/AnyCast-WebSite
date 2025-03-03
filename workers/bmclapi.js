// BMCLAPI 代理服务
const BMCLAPI_URL = 'https://bd.bangbang93.com'
const BMCLAPI_RANK_PATH = '/openbmclapi/metric/rank'
const BMCLAPI_HISTORY_PATH = '/openbmclapi/metric/cluster'

export default {
  async fetch(request, env, ctx) {
    // 配置 CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      })
    }

    try {
      const url = new URL(request.url)
      let targetUrl = BMCLAPI_URL

      // 判断请求类型
      if (url.pathname.startsWith('/metric/cluster/')) {
        // 历史数据请求
        const nodeId = url.pathname.split('/').pop()
        targetUrl += `${BMCLAPI_HISTORY_PATH}/${nodeId}`
      } else {
        // 排名数据请求
        targetUrl += BMCLAPI_RANK_PATH
      }

      // 获取 BMCLAPI 数据
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Cloudflare Worker BMCLAPI Proxy',
          'Cookie': ''
        }
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      // 获取响应数据
      const data = await response.json()

      // 返回响应
      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json;charset=UTF-8',
          'Cache-Control': 'public, max-age=60', // 缓存1分钟
        }
      })
    } catch (error) {
      // 错误处理
      return new Response(JSON.stringify({
        error: '获取数据失败',
        message: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json;charset=UTF-8'
        }
      })
    }
  }
} 