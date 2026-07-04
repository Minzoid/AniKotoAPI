/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — cache.helper.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   In-memory LRU cache with configurable TTL per endpoint.
 *   Evicts least recently used entries when max size reached.
 *   Supports cache statistics and manual invalidation.
 *
 * @exports
 *   getCache, setCache, clearCache, getCacheStats, LRUCache
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

class LRUCache {
  constructor(maxSize = 100, defaultTTL = 300000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return undefined;
    }

    const entry = this.cache.get(key);
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value, ttl) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl || this.defaultTTL)
    });
    this.stats.sets++;
  }

  delete(key) {
    const existed = this.cache.delete(key);
    if (existed) this.stats.deletes++;
    return existed;
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    return size;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + '%' : '0%'
    };
  }

  has(key) {
    if (!this.cache.has(key)) return false;
    const entry = this.cache.get(key);
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

const TTL = {
  home: 600000,
  search: 300000,
  info: 600000,
  episodes: 300000,
  servers: 600000,
  stream: 180000,
  spotlight: 600000,
  trending: 600000,
  schedule: 1800000,
  genres: 3600000,
  suggestions: 300000,
  default: 300000
};

const cache = new LRUCache(
  parseInt(process.env.CACHE_MAX_SIZE) || 200,
  parseInt(process.env.CACHE_DEFAULT_TTL) || 300000
);

const getCache = (key) => cache.get(key);
const setCache = (key, data, ttl) => cache.set(key, data, ttl);
const clearCache = () => cache.clear();
const getCacheStats = () => cache.getStats();

export { getCache, setCache, clearCache, getCacheStats, LRUCache, TTL };
