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
  [key: string]: any;
}

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

  // 获取API密钥（现在会返回用户KEY或默认KEY）
  let apiKey = getApiKey();
  let isDefaultKey = apiKey === DEFAULT_API_KEY;
  
  try {
    // 使用ipinfo.io API获取地理位置信息
    const response = await fetch(`https://ipinfo.io/${ip}?token=${apiKey}`);

    if (response.status === 401 || response.status === 403) {
      // API密钥无效或已耗尽配额
      console.error('API密钥无效或已耗尽配额');
      
      if (isDefaultKey) {
        // 如果是默认KEY失效，则提示用户输入新KEY
        console.log('默认API KEY已失效，需要用户提供自己的KEY');
        const newApiKey = await promptForApiKey();
        if (newApiKey) {
          // 使用新密钥重试
          return getIpGeoLocation(ip);
        }
        return null;
      } else {
        // 如果是用户KEY失效，先尝试默认KEY
        console.log('用户API KEY已失效，尝试使用默认KEY');
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        
        // 尝试使用默认KEY
        return getIpGeoLocation(ip);
      }
    }

    if (!response.ok) {
      throw new Error(`API请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();
    
    // 解析位置信息
    const coordinates = parseLocation(data.loc);
    
    // 转换ipinfo.io API响应为统一格式
    const geoInfo: IpGeoInfo = {
      ip: data.ip || ip,
      country: data.country || '',
      country_name: data.country || '',
      city: data.city || '',
      region: data.region || '',
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      isp: '',
      asn: data.org ? data.org.split(' ')[0].replace('AS', '') : '',
      org: data.org || ''
    };

    // 缓存结果
    Cache.set(cacheKey, geoInfo);
    
    return geoInfo;
  } catch (error) {
    console.error(`获取IP ${ip} 的地理位置信息失败:`, error);
    
    // 如果是API KEY相关错误，且当前使用的是用户提供的KEY
    if (!isDefaultKey && error instanceof Error && 
        (error.message.includes('API') || 
         error.message.includes('密钥') || 
         error.message.includes('key'))) {
      // 清除当前保存的密钥
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      
      // 尝试使用默认KEY
      return getIpGeoLocation(ip);
    } else if (isDefaultKey && error instanceof Error && 
              (error.message.includes('API') || 
               error.message.includes('密钥') || 
               error.message.includes('key'))) {
      // 如果默认KEY出错，提示用户输入新KEY
      const newApiKey = await promptForApiKey();
      if (newApiKey) {
        // 使用新密钥重试
        return getIpGeoLocation(ip);
      }
    }
    
    return null;
  }
} 