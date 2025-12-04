// Simple in-memory cache implementation
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttlTimers = new Map();
  }

  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  set(key, value, ttl = 120) {
    // Clear existing timer if any
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
    }

    // Store the value
    this.cache.set(key, value);

    // Set up TTL timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.ttlTimers.delete(key);
    }, ttl * 1000);

    this.ttlTimers.set(key, timer);
  }

  /**
   * Get a value from cache
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a key from cache
   */
  delete(key) {
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
      this.ttlTimers.delete(key);
    }
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern (e.g., "user:123:*")
   */
  deletePattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.ttlTimers.clear();
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      keys: this.cache.size,
      memory: process.memoryUsage().heapUsed
    };
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cache key generators
export const cacheKeys = {
  dashboardSummary: (userId) => `dashboard:summary:${userId}`,
  recentTransactions: (userId, limit) => `dashboard:transactions:${userId}:${limit}`,
  expenseTrends: (userId, months) => `dashboard:trends:${userId}:${months}`,
  expenseCategories: (userId) => `dashboard:categories:${userId}`,
  userPattern: (userId) => `*:${userId}:*`
};
