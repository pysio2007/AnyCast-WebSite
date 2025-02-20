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
  private static CACHE_DURATION = 10 * 60 * 1000; // 10分钟

  static set<T>(key: string, data: T): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const cacheItem = JSON.parse(itemStr) as CacheItem<T>;
      const now = Date.now();

      if (now - cacheItem.timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  }
}
