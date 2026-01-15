// cacheService.js - Smart NLI Result Caching
import crypto from 'crypto';

class NLICache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000; // Max cached claims
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      stores: 0,
      evictions: 0
    };
    
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    
    console.log('✅ NLI Cache initialized:', {
      maxSize: this.maxSize,
      ttl: `${this.ttl / 1000 / 60 / 60}h`
    });
  }

  /**
   * Generate cache key from claim text
   */
  generateKey(claimText) {
    // Normalize claim text for consistent caching
    const normalized = claimText
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/[.,!?;:]$/g, ''); // Remove trailing punctuation
    
    // Use hash for shorter keys
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Get cached NLI results for a claim
   */
  get(claimText) {
    const key = this.generateKey(claimText);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      console.log(`❌ [Cache] MISS for: "${claimText.substring(0, 50)}..."`);
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      console.log(`⏰ [Cache] EXPIRED for: "${claimText.substring(0, 50)}..."`);
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    console.log(`✅ [Cache] HIT for: "${claimText.substring(0, 50)}..." (saved ${entry.nliResults?.length || 0} API calls)`);
    return entry;
  }

  /**
   * Store NLI results for a claim
   */
  set(claimText, canonical, nliResults, verdict, confidence) {
    const key = this.generateKey(claimText);
    
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.stats.evictions++;
      console.log(`🗑️ [Cache] Evicted oldest entry (LRU)`);
    }
    
    const entry = {
      claim: claimText,
      canonical,
      nliResults,
      verdict,
      confidence,
      timestamp: Date.now()
    };
    
    this.cache.set(key, entry);
    this.stats.stores++;
    console.log(`💾 [Cache] STORED: "${claimText.substring(0, 50)}..." (${nliResults?.length || 0} NLI results)`);
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 [Cache] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1)
      : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      stores: this.stats.stores,
      evictions: this.stats.evictions,
      hitRate: `${hitRate}%`
    };
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    console.log('🗑️ [Cache] Cleared all entries');
  }

  /**
   * Destroy cache and cleanup
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
    console.log('💥 [Cache] Destroyed');
  }
}

// Create singleton instance
const nliCache = new NLICache({
  maxSize: 1000,
  ttl: 24 * 60 * 60 * 1000 // 24 hours
});

export { nliCache };
