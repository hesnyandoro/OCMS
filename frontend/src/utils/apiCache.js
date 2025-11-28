/**
 * API Response Cache Utility
 * Simple in-memory cache for API responses to reduce server load
 */

class APICache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
   * Get cached data if not expired
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if expired/missing
   */
  get(key) {
    const ttl = this.ttls.get(key);
    if (!ttl || Date.now() > ttl) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  /**
   * Set cache data with TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttlMs - Time to live in milliseconds (default: 2 minutes)
   */
  set(key, data, ttlMs = 120000) {
    this.cache.set(key, data);
    this.ttls.set(key, Date.now() + ttlMs);
  }

  /**
   * Invalidate cache entry
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Invalidate all cache entries matching pattern
   * @param {string} pattern - Pattern to match (e.g., 'farmers', 'deliveries')
   */
  invalidatePattern(pattern) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.ttls.delete(key);
    });
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  /**
   * Get cache stats
   * @returns {object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const apiCache = new APICache();

/**
 * Wrapper for API calls with caching
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function that returns data
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<any>} Cached or fresh data
 */
export async function cachedFetch(key, fetcher, ttl = 120000) {
  const cached = apiCache.get(key);
  if (cached !== null) {
    console.log(`[Cache HIT] ${key}`);
    return cached;
  }

  console.log(`[Cache MISS] ${key}`);
  const data = await fetcher();
  apiCache.set(key, data, ttl);
  return data;
}

/* Hook to invalidate cache on mutations. Call this after create/update/delete operations.*/
export function invalidateCache(patterns) {
  if (Array.isArray(patterns)) {
    patterns.forEach(pattern => apiCache.invalidatePattern(pattern));
  } else {
    apiCache.invalidatePattern(patterns);
  }
}
