import { Cache } from './cache';

// 存储API密钥的本地存储键名
const API_KEY_STORAGE_KEY = 'ipipinfo_api_key';
// 缓存前缀
const IP_CACHE_PREFIX = 'ip_geo_';
// 缓存时间（7天，单位毫秒）
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
// 默认API KEY
const DEFAULT_API_KEY = '29a9fd77d1bd76';

// IP地理位置信息接口
export interface IpGeoInfo {
  ip?: string;
  country?: string;
  country_name?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  asn?: string;
  org?: string;
  timestamp?: number;
  [key: string]: any;
}

// API服务提供者
interface ApiProvider {
  name: string;
  getUrl: (ip: string, apiKey?: string) => string;
  parseResponse: (data: any) => IpGeoInfo | null;
  requiresKey: boolean;
}

// 配置API提供者
const API_PROVIDERS: ApiProvider[] = [
  {
    name: 'ipinfo.io',
    getUrl: (ip: string, apiKey?: string) => {
      return `https://ipinfo.io/${encodeURIComponent(ip)}?token=${apiKey || ''}`;
    },
    parseResponse: (data: any): IpGeoInfo | null => {
      if (!data || !data.ip) return null;
      
      // 解析位置信息
      const coordinates = parseLocation(data.loc);
      
      // 提取ASN信息
      let asn = '';
      if (data.asn) {
        asn = data.asn;
      } else if (data.as) {
        asn = data.as;
      } else if (data.org) {
        // 提取组织名称中的ASN信息, 格式通常为 "AS#### 组织名称"
        const asnMatch = data.org.match(/^AS(\d+)/);
        if (asnMatch && asnMatch[1]) {
          asn = asnMatch[1];
        } else {
          // 尝试从org中提取纯数字部分作为ASN
          const numericMatch = data.org.match(/(\d+)/);
          if (numericMatch && numericMatch[1]) {
            asn = numericMatch[1];
          } else {
            asn = data.org;
          }
        }
      }
      
      return {
        ip: data.ip,
        country: data.country || '',
        country_name: data.country_name || data.country || '',
        city: data.city || '',
        region: data.region || '',
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        isp: data.org || '',
        asn: asn,
        org: data.org || '',
        timestamp: Date.now()
      };
    },
    requiresKey: true
  },
  {
    name: 'ip-api.com',
    getUrl: (ip: string) => {
      return `https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`;
    },
    parseResponse: (data: any): IpGeoInfo | null => {
      if (!data || data.status !== 'success' || !data.query) return null;
      
      // 从AS字段中提取ASN (通常格式为 "AS12345 组织名称")
      let asn = '';
      if (data.as) {
        const asnMatch = data.as.match(/^AS(\d+)/);
        if (asnMatch && asnMatch[1]) {
          asn = asnMatch[1];
        }
      }
      
      return {
        ip: data.query,
        country: data.countryCode || '',
        country_name: data.country || data.countryCode || '',
        city: data.city || '',
        region: data.regionName || data.region || '',
        latitude: data.lat,
        longitude: data.lon,
        isp: data.isp || '',
        asn: asn || data.asname || '',
        org: data.org || data.as || '',
        timestamp: Date.now()
      };
    },
    requiresKey: false
  }
];

// 检查IP是否为私有IP
export function isPrivateIP(ip: string): boolean {
  // IPv4私有地址范围检查
  const ipv4PrivateRanges = [
    /^10\./,                              // 10.0.0.0 - 10.255.255.255
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,     // 172.16.0.0 - 172.31.255.255
    /^192\.168\./,                        // 192.168.0.0 - 192.168.255.255
    /^127\./,                             // 127.0.0.0 - 127.255.255.255 (本地回环)
    /^169\.254\./,                        // 169.254.0.0 - 169.254.255.255 (链路本地)
    /^0\./,                               // 0.0.0.0/8
    /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./  // 100.64.0.0 - 100.127.255.255 (Carrier-grade NAT)
  ];

  // IPv6私有地址检查
  const ipv6PrivateRanges = [
    /^::1/,                               // 回环地址
    /^fc00::/,                            // 唯一本地地址
    /^fd/,                                // 唯一本地地址
    /^fe80::/                             // 链路本地地址
  ];

  // 检查IPv4
  for (const range of ipv4PrivateRanges) {
    if (range.test(ip)) return true;
  }

  // 检查IPv6
  for (const range of ipv6PrivateRanges) {
    if (range.test(ip)) return true;
  }

  return false;
}

// 从本地存储获取API密钥，如果没有则返回默认KEY
export function getApiKey(): string {
  try {
    // 优先使用用户设置的KEY
    const userKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    return userKey || DEFAULT_API_KEY;
  } catch (error) {
    console.error('无法从本地存储获取API密钥:', error);
    return DEFAULT_API_KEY;
  }
}

// 设置API密钥到本地存储
export function setApiKey(apiKey: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } catch (error) {
    console.error('无法保存API密钥到本地存储:', error);
  }
}

// 弹出对话框让用户输入API密钥
export function promptForApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    const apiKey = prompt('请输入您的ipinfo.io API密钥以继续获取IP地理位置信息：');
    if (apiKey && apiKey.trim()) {
      setApiKey(apiKey.trim());
      resolve(apiKey.trim());
    } else {
      resolve(null);
    }
  });
}

// 初始化GeoIP服务
export async function loadGeoIpDatabase(): Promise<boolean> {
  // 这个函数只是为了保持与旧代码的兼容性
  // 实际上我们使用的是API服务，不需要加载数据库
  return true;
}

// 解析loc字段为经纬度
function parseLocation(loc: string): { latitude: number, longitude: number } | null {
  if (!loc) return null;
  
  const parts = loc.split(',');
  if (parts.length !== 2) return null;
  
  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);
  
  if (isNaN(latitude) || isNaN(longitude)) return null;
  
  return { latitude, longitude };
}

// 获取IP地理位置信息
export async function getIpGeoLocation(ip: string): Promise<IpGeoInfo | null> {
  if (!ip || isPrivateIP(ip)) {
    return null;
  }

  // 检查缓存中是否有此IP的地理位置信息
  const cacheKey = `${IP_CACHE_PREFIX}${ip}`;
  const cachedData = Cache.get<IpGeoInfo>(cacheKey);
  if (cachedData) {
    console.log(`从缓存中获取IP ${ip} 的地理位置信息`);
    return cachedData;
  }

  // 获取主API服务提供者
  const mainProvider = API_PROVIDERS[0];
  
  // 获取API密钥
  let apiKey = getApiKey();
  let isDefaultKey = apiKey === DEFAULT_API_KEY;
  
  // 尝试所有API提供者
  for (const provider of API_PROVIDERS) {
    // 如果提供者需要API密钥但我们没有有效的密钥，跳过此提供者
    if (provider.requiresKey && (!apiKey || apiKey.trim() === '')) {
      console.log(`跳过${provider.name}，因为没有API密钥`);
      continue;
    }
    
    try {
      console.log(`尝试使用${provider.name}获取IP ${ip} 的地理位置`);
      
      // 构建API URL
      const apiUrl = provider.requiresKey 
        ? provider.getUrl(ip, apiKey) 
        : provider.getUrl(ip);
      
      // 发送请求
      const response = await fetch(apiUrl);
      
      // 处理API密钥相关错误
      if (provider.requiresKey && (response.status === 401 || response.status === 403)) {
        console.error(`${provider.name} API密钥无效或已耗尽配额`);
        
        if (isDefaultKey) {
          // 如果是默认KEY失效，则提示用户输入新KEY
          console.log('默认API KEY已失效，需要用户提供自己的KEY');
          const newApiKey = await promptForApiKey();
          if (newApiKey) {
            // 更新KEY并重试
            apiKey = newApiKey;
            isDefaultKey = false;
            // 重试当前提供者
            continue;
          }
        } else {
          // 如果是用户KEY失效，先尝试默认KEY
          console.log('用户API KEY已失效，尝试使用默认KEY');
          localStorage.removeItem(API_KEY_STORAGE_KEY);
          apiKey = DEFAULT_API_KEY;
          isDefaultKey = true;
          // 重试当前提供者
          continue;
        }
        
        // 如果无法恢复API密钥，尝试下一个提供者
        continue;
      }
      
      // 通用错误处理
      if (!response.ok) {
        console.error(`${provider.name}接口错误: ${response.status} ${response.statusText}`);
        // 尝试下一个提供者
        continue;
      }
      
      // 解析响应数据
      const data = await response.json();
      
      // 检查数据有效性
      if (!data || Object.keys(data).length === 0) {
        console.error(`${provider.name}返回了空数据: ${ip}`);
        continue;
      }
      
      // 解析数据
      const geoInfo = provider.parseResponse(data);
      
      // 如果解析成功，缓存并返回结果
      if (geoInfo) {
        console.log(`成功从${provider.name}获取IP信息: ${ip}`);
        Cache.set(cacheKey, geoInfo);
        return geoInfo;
      }
    } catch (error) {
      console.error(`从${provider.name}获取IP ${ip} 的地理位置信息失败:`, error);
      // 错误发生时，尝试下一个提供者
    }
  }
  
  // 所有提供者都失败了，返回null
  console.error(`所有API提供者都无法获取IP ${ip} 的地理位置信息`);
  return null;
} 