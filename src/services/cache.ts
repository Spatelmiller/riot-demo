/**
 * Cache service for storing API responses
 * Uses node-cache for in-memory caching with TTL support
 */

import NodeCache from 'node-cache';

const cacheConfig = {
  stdTTL: 300, 
  checkperiod: 60, 
  useClones: false, 
  maxKeys: 1000 
};

const cache = new NodeCache(cacheConfig);

export const CacheKeys = {
  account: (riotId: string, region: string) => `account:${riotId}:${region}`,
  icon: (iconId: number) => `icon:${iconId}`
};

// Cache TTL values (in seconds)
export const CacheTTL = {
  account: 86400, //24 hrs
  icon: 86400 
};

/**
 * Cache service class
 */
export class CacheService {
  /**
   * Get data from cache
   */
  static get<T>(key: string): T | undefined {
    return cache.get<T>(key);
  }

  /**
   * Set data in cache with TTL
   */
  static set<T>(key: string, data: T, ttl?: number): boolean {
    return cache.set(key, data, ttl || cacheConfig.stdTTL);
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return cache.getStats();
  }

  /**
   * Get all cache keys
   */
  static getKeys(): string[] {
    return cache.keys();
  }

  /**
   * Cache account data
   */
  static cacheAccount(riotId: string, region: string, data: any): boolean {
    const key = CacheKeys.account(riotId, region);
    return this.set(key, data, CacheTTL.account);
  }

  /**
   * Get cached account data
   */
  static getCachedAccount(riotId: string, region: string): any | undefined {
    const key = CacheKeys.account(riotId, region);
    return this.get(key);
  }

  /**
   * Cache profile icon
   */
  static cacheIcon(iconId: number, data: any): boolean {
    const key = CacheKeys.icon(iconId);
    return this.set(key, data, CacheTTL.icon);
  }

  /**
   * Get cached profile icon
   */
  static getCachedIcon(iconId: number): any | undefined {
    const key = CacheKeys.icon(iconId);
    return this.get(key);
  }
}

setInterval(() => {
  const stats = cache.getStats();
  if (stats.keys > 0) {
    console.log(`📊 Cache Stats: ${stats.keys} keys, ${stats.hits} hits, ${stats.misses} misses, ${(stats.hits / (stats.hits + stats.misses) * 100).toFixed(1)}% hit rate`);
  }
}, 60000); 

export default cache;
