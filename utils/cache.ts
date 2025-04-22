// 基础接口定义
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// API 相关接口定义
export interface ApiResponse<T> {
  error: string | null;
  result: T[];
}

export interface ApiResultPair {
  server: string;
  data: string;
}

export interface SummaryRowData {
  name: string;
  proto: string;
  table: string;
  state: string;
  since: string;
  info: string;
}

export interface ApiSummaryResultPair {
  server: string;
  data: SummaryRowData[];
}

// 缓存类
export class Cache {
  // 默认缓存时间：10分钟
  private static DEFAULT_CACHE_DURATION = 10 * 60 * 1000; 
  
  // 针对不同类型数据的缓存时间配置
  private static CACHE_DURATIONS: {[key: string]: number} = {
    'ip_geo_': 7 * 24 * 60 * 60 * 1000, // IP地理信息缓存7天
    'api_req_': 10 * 60 * 1000,         // API请求缓存10分钟
    'traceroute_': 60 * 60 * 1000       // 路由追踪结果缓存1小时
  };

  /**
   * 根据缓存键名选择合适的缓存时间
   * @param key 缓存键名
   * @returns 缓存时间（毫秒）
   */
  private static getCacheDuration(key: string): number {
    // 检查键名前缀匹配
    for (const prefix in this.CACHE_DURATIONS) {
      if (key.startsWith(prefix)) {
        return this.CACHE_DURATIONS[prefix];
      }
    }
    // 未找到匹配的前缀，使用默认值
    return this.DEFAULT_CACHE_DURATION;
  }

  /**
   * 设置缓存
   * @param key 缓存键名
   * @param data 要缓存的数据
   * @param duration 可选的缓存时间（毫秒），如不指定则自动根据键名选择
   */
  static set<T>(key: string, data: T, duration?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * 获取缓存
   * @param key 缓存键名
   * @returns 缓存数据，如果缓存不存在或已过期则返回null
   */
  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const cacheItem = JSON.parse(itemStr) as CacheItem<T>;
      const now = Date.now();
      const cacheDuration = this.getCacheDuration(key);

      // 检查缓存是否已过期
      if (now - cacheItem.timestamp > cacheDuration) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  }
  
  /**
   * 清除特定前缀的所有缓存
   * @param prefix 缓存键名前缀
   */
  static clearByPrefix(prefix: string): void {
    // 获取所有的localStorage键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
  
  /**
   * 清除所有缓存
   */
  static clearAll(): void {
    localStorage.clear();
  }
}
