<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-8">
      <i class="fas fa-search mr-2"></i>WHOIS 查询
    </h1>

    <div class="max-w-3xl mx-auto">
      <div class="card bg-base-200/50 backdrop-blur-md p-6">
        <!-- 查询表单 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-lg">查询对象</span>
            <span class="label-text-alt">
              支持域名、IP地址、ASN查询
            </span>
          </label>
          <div class="flex gap-2">
            <input 
              v-model="query" 
              type="text" 
              :placeholder="getPlaceholder" 
              class="input input-bordered flex-1"
              @keyup.enter="handleQuery"
            />
            <button 
              class="btn btn-primary min-w-[120px]" 
              @click="handleQuery"
              :disabled="loading"
            >
              <i class="fas fa-search mr-2"></i>查询
            </button>
          </div>
          
          <!-- 查询类型提示 -->
          <div class="mt-2 text-sm text-base-content/70">
            <span class="mr-4">
              <i :class="queryTypeIcon"></i> 
              当前识别为: {{ queryTypeText }}
            </span>
            <span v-if="queryExample" class="text-primary">
              示例: {{ queryExample }}
            </span>
          </div>
        </div>

        <!-- 结果显示 -->
        <div v-if="loading" class="mt-6 text-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        
        <div v-if="error" class="mt-6 alert alert-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>

        <div v-if="result" class="mt-6">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold">查询结果</h3>
            <button 
              class="btn btn-sm btn-ghost"
              @click="copyResult"
              :class="{ 'btn-success': copied }"
            >
              <i class="fas" :class="copied ? 'fa-check' : 'fa-copy'"></i>
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>
          <pre class="p-4 bg-base-300 rounded-lg overflow-x-auto font-mono text-sm">{{ result }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const query = ref('')
const result = ref('')
const loading = ref(false)
const error = ref('')
const copied = ref(false)

// 查询类型判断
const queryType = computed(() => {
  const value = query.value.trim()
  if (!value) return 'none'
  
  // ASN判断
  if (/^(AS)?\d+$/i.test(value)) return 'asn'
  
  // IP地址判断 (IPv4)
  if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value)) return 'ip'
  
  // IPv6判断
  if (ipv6Regex.test(value)) return 'ip'
  
  // 域名判断
  if (domainRegex.test(value)) return 'domain'
  
  return 'unknown'
})

// 查询类型文本
const queryTypeText = computed(() => {
  const types = {
    none: '等待输入',
    asn: 'ASN编号',
    ip: 'IP地址',
    domain: '域名',
    unknown: '未知类型'
  }
  return types[queryType.value]
})

// 查询类型图标
const queryTypeIcon = computed(() => {
  const icons = {
    none: 'fas fa-keyboard',
    asn: 'fas fa-network-wired',
    ip: 'fas fa-globe',
    domain: 'fas fa-server',
    unknown: 'fas fa-question-circle'
  }
  return icons[queryType.value]
})

// 占位符文本
const getPlaceholder = computed(() => {
  const placeholders = {
    none: '输入域名、IP地址或ASN编号',
    asn: '输入ASN编号，例如: AS13335',
    ip: '输入IP地址，例如: 1.1.1.1',
    domain: '输入域名，例如: example.com',
    unknown: '请输入有效的查询对象'
  }
  return placeholders[queryType.value]
})

// 示例文本
const queryExample = computed(() => {
  const examples = {
    asn: 'AS13335',
    ip: '1.1.1.1',
    domain: 'example.com'
  }
  return examples[queryType.value]
})

// 复制结果
async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '未知'
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

// 格式化查询结果
function formatResult(data, type) {
  if (typeof data === 'string') return data

  switch (type) {
    case 'domain':
      return formatDomainResult(data)
    case 'ip':
      return formatIPResult(data)
    case 'asn':
      return formatASNResult(data)
    default:
      return JSON.stringify(data, null, 2)
  }
}

// 格式化域名查询结果
function formatDomainResult(data) {
  const sections = []
  const raw = data.raw || data
  
  // 基本信息
  sections.push(`域名信息：
  域名：      ${data.domainName || raw.ldhName || '未知'}
  状态：      ${Array.isArray(data.status) ? data.status.join(', ') : (data.status || '未知')}
  注册商：    ${data.registrar || '未知'}
  创建时间：  ${formatDate(data.createdDate)}
  过期时间：  ${formatDate(data.expiryDate)}
  更新时间：  ${formatDate(data.updatedDate)}`)

  // 域名服务器
  if (data.nameServers && data.nameServers.length) {
    sections.push(`域名服务器：
  ${data.nameServers.map(ns => `  • ${ns}`).join('\n')}`)
  }

  // DNSSEC 信息
  if (raw.secureDNS && raw.secureDNS.delegationSigned) {
    const dsData = raw.secureDNS.dsData[0]
    sections.push(`DNSSEC 信息：
  签名状态：  已签名
  密钥标签：  ${dsData.keyTag}
  算法：      ${dsData.algorithm}
  摘要类型：  ${dsData.digestType}
  摘要：      ${dsData.digest}`)
  }

  // 注册人信息
  const registrant = raw.entities?.find(e => e.roles.includes('registrant'))
  if (registrant) {
    const vcard = registrant.vcardArray[1]
    const getVCardValue = (key) => {
      const field = vcard.find(f => f[0] === key)
      return field ? field[3] : '未知'
    }
    const adr = vcard.find(f => f[0] === 'adr')
    const address = adr ? adr[3] : []

    sections.push(`注册人信息：
  所在地区：  ${address[4] || '未知'}, ${address[6] || ''}
  隐私保护：  ${registrant.remarks ? '已启用' : '未启用'}`)
  }

  // 滥用举报联系方式
  const registrarEntity = raw.entities?.find(e => e.roles.includes('registrar'))
  const abuseContact = registrarEntity?.entities?.find(e => e.roles.includes('abuse'))
  if (abuseContact) {
    const vcard = abuseContact.vcardArray[1]
    const getVCardValue = (key) => {
      const field = vcard.find(f => f[0] === key)
      return field ? field[3] : '未知'
    }

    sections.push(`滥用举报联系方式：
  联系人：    ${getVCardValue('fn')}
  组织：      ${getVCardValue('org')}
  邮箱：      ${getVCardValue('email')}
  电话：      ${getVCardValue('tel')?.replace('tel:', '')}`)
  }

  // WHOIS服务器
  if (raw.port43) {
    sections.push(`WHOIS服务器：
  ${raw.port43}`)
  }

  // 重要提示
  const notices = raw.notices?.filter(n => !n.title.includes('Terms of Use'))
  if (notices?.length) {
    sections.push(`重要提示：
${notices.map(n => `  • ${n.title}：${n.description[0]}`).join('\n')}`)
  }

  return sections.join('\n\n')
}

// 格式化IP查询结果
function formatIPResult(data) {
  const sections = []
  
  // 基本信息
  sections.push(`IP地址信息：
  IP范围：    ${data.startAddress} - ${data.endAddress}
  CIDR：      ${data.cidr0_cidrs?.[0]?.v4prefix}/${data.cidr0_cidrs?.[0]?.length}
  名称：      ${data.name || '未知'}
  类型：      ${data.type || '未知'}
  状态：      ${Array.isArray(data.status) ? data.status.join(', ') : (data.status || '未知')}
  国家/地区： ${data.country || '未知'}
  WHOIS：     ${data.port43 || '未知'}`)

  // 描述信息
  const descriptions = data.remarks?.find(r => r.title === 'description')?.description
  if (descriptions?.length) {
    sections.push(`描述信息：
${descriptions.map(desc => `  • ${desc}`).join('\n')}`)
  }

  // 备注信息
  const remarks = data.remarks?.find(r => r.title === 'remarks')?.description
  if (remarks?.length) {
    sections.push(`备注信息：
${remarks.map(remark => `  • ${remark}`).join('\n')}`)
  }

  // 注册机构信息
  const registrant = data.entities?.find(e => e.roles.includes('registrant'))
  if (registrant) {
    const vcard = registrant.vcardArray[1]
    const getVCardValue = (key) => {
      const field = vcard.find(f => f[0] === key)
      return field ? field[3] : '未知'
    }
    const adr = vcard.find(f => f[0] === 'adr')
    const address = adr?.label || '未知'

    sections.push(`注册机构：
  名称：      ${getVCardValue('fn')}
  地址：      ${address}
  电话：      ${getVCardValue('tel')}
  传真：      ${vcard.find(f => f[0] === 'tel' && f[1].type === 'fax')?.[3] || '未知'}
  邮箱：      ${getVCardValue('email')}`)
  }

  // 技术联系人
  const techContact = data.entities?.find(e => e.roles.includes('technical'))
  if (techContact) {
    const vcard = techContact.vcardArray[1]
    const getVCardValue = (key) => {
      const field = vcard.find(f => f[0] === key)
      return field ? field[3] : '未知'
    }
    const adr = vcard.find(f => f[0] === 'adr')
    const address = adr?.label || '未知'

    sections.push(`技术联系人：
  名称：      ${getVCardValue('fn')}
  地址：      ${address}
  电话：      ${getVCardValue('tel')}
  邮箱：      ${getVCardValue('email')}`)
  }

  // 滥用举报联系人
  const abuseContact = data.entities?.find(e => e.roles.includes('abuse'))
  if (abuseContact) {
    const vcard = abuseContact.vcardArray[1]
    const getVCardValue = (key) => {
      const field = vcard.find(f => f[0] === key)
      return field ? field[3] : '未知'
    }
    const adr = vcard.find(f => f[0] === 'adr')
    const address = adr?.label || '未知'

    sections.push(`滥用举报联系方式：
  名称：      ${getVCardValue('fn')}
  地址：      ${address}
  邮箱：      ${getVCardValue('email')}`)

    // 添加验证信息
    const validationRemark = abuseContact.remarks?.find(r => r.title === 'remarks')?.description?.[0]
    if (validationRemark) {
      sections[sections.length - 1] += `\n  验证信息：  ${validationRemark}`
    }
  }

  // 注册信息
  const events = data.events || []
  const regDate = events.find(e => e.eventAction === 'registration')?.eventDate
  const lastChanged = events.find(e => e.eventAction === 'last changed')?.eventDate
  
  sections.push(`注册信息：
  注册时间：  ${formatDate(regDate)}
  最后更新：  ${formatDate(lastChanged)}`)

  // 重要提示
  const notices = data.notices?.filter(n => 
    !n.title.includes('Terms and Conditions') && 
    !n.title.includes('Source')
  )
  if (notices?.length) {
    sections.push(`重要提示：
${notices.map(n => `  • ${n.title}：${n.description.join(' ')}`).join('\n')}`)
  }

  return sections.join('\n\n')
}

// 格式化ASN查询结果
function formatASNResult(data) {
  const sections = []
  
  // 基本信息
  sections.push(`ASN信息：
  ASN：       AS${data.startAutnum || '未知'}
  名称：      ${data.name || '未知'}
  状态：      ${Array.isArray(data.status) ? data.status.join(', ') : (data.status || '未知')}
  WHOIS：     ${data.port43 || '未知'}`)

  // 查找管理联系人
  const adminContact = data.entities?.find(e => e.roles.includes('administrative'))
  if (adminContact) {
    const vcard = adminContact.vcardArray[1]
    const getVCardValue = (key) => {
      const field = vcard.find(f => f[0] === key)
      return field ? field[3] : '未知'
    }
    const adr = vcard.find(f => f[0] === 'adr')
    const address = adr?.label || '未知'

    sections.push(`管理联系人：
  姓名：      ${getVCardValue('fn')}
  电话：      ${getVCardValue('tel')}
  邮箱：      ${getVCardValue('email')}
  地址：      ${address}`)
  }

  // 查找组织信息
  const orgInfo = data.entities?.find(e => e.vcardArray?.[1]?.find(f => f[0] === 'kind' && f[3] === 'org'))
  if (orgInfo) {
    const vcard = orgInfo.vcardArray[1]
    const getVCardValue = (key) => {
      const field = vcard.find(f => f[0] === key)
      return field ? field[3] : '未知'
    }
    const adr = vcard.find(f => f[0] === 'adr')
    const address = adr?.label || '未知'

    sections.push(`组织信息：
  名称：      ${getVCardValue('fn')}
  地址：      ${address}`)
  }

  // 滥用举报联系人
  const abuseContact = data.entities?.find(e => e.roles.includes('abuse'))
  if (abuseContact) {
    const vcard = abuseContact.vcardArray[1]
    const getVCardValue = (key) => {
      const field = vcard.find(f => f[0] === key)
      return field ? field[3] : '未知'
    }

    sections.push(`滥用举报联系方式：
  联系人：    ${getVCardValue('fn')}
  电话：      ${getVCardValue('tel')}
  邮箱：      ${getVCardValue('email')}`)
  }

  // 注册信息
  const events = data.events || []
  const regDate = events.find(e => e.eventAction === 'registration')?.eventDate
  const lastChanged = events.find(e => e.eventAction === 'last changed')?.eventDate
  
  sections.push(`注册信息：
  注册时间：  ${formatDate(regDate)}
  最后更新：  ${formatDate(lastChanged)}`)

  // 重要提示
  const notices = data.notices?.filter(n => 
    !n.title.includes('Terms and Conditions') && 
    !n.title.includes('Source')
  )
  if (notices?.length) {
    sections.push(`重要提示：
${notices.map(n => `  • ${n.title}：${n.description.join(' ')}`).join('\n')}`)
  }

  return sections.join('\n\n')
}

async function handleQuery() {
  if (!query.value.trim()) {
    error.value = '请输入要查询的内容'
    return
  }

  if (queryType.value === 'unknown') {
    error.value = '请输入有效的域名、IP地址或ASN编号'
    return
  }

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    // 根据查询类型选择不同的API端点
    let endpoint = ''
    const queryValue = query.value.trim()
    
    switch (queryType.value) {
      case 'ip':
        endpoint = `/ip/${queryValue}`
        break
      case 'asn':
        // 移除可能的'AS'前缀
        const asnNumber = queryValue.replace(/^AS/i, '')
        endpoint = `/asn/${asnNumber}`
        break
      case 'domain':
        endpoint = `/domain/${queryValue}`
        break
    }

    const response = await fetch(`https://whois.akaere.online${endpoint}`)
    if (!response.ok) {
      throw new Error('查询失败')
    }
    
    const data = await response.json() // 改为JSON解析，因为API返回JSON格式
    
    if (!data.success) {
      throw new Error(data.error || '查询失败')
    }
    
    // 使用新的格式化函数处理结果
    result.value = formatResult(data.data, queryType.value)

  } catch (err) {
    error.value = err.message || '查询失败，请稍后重试'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 改进域名验证正则以支持更多TLD
const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

// 改进IPv6验证正则
const ipv6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$|^((?:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*)?)::((?:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*)?)/i
</script>

<style scoped>
.font-mono {
  font-family: 'JetBrains Mono', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

pre {
  tab-size: 8;
}
</style> 