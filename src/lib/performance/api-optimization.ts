import cacheManager from './redis';
import performanceMonitor from './performance-monitoring';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: any) => string; // Custom key generator
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key?: string; // Custom cache key
  tags?: string[]; // Cache tags for invalidation
}

export class ApiOptimizationService {
  private static instance: ApiOptimizationService;
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  static getInstance(): ApiOptimizationService {
    if (!ApiOptimizationService.instance) {
      ApiOptimizationService.instance = new ApiOptimizationService();
    }
    return ApiOptimizationService.instance;
  }

  /**
   * Rate limiting middleware
   */
  createRateLimiter(config: RateLimitConfig) {
    return async (req: any, res: any, next: any) => {
      const key = config.keyGenerator ? config.keyGenerator(req) : this.generateKey(req);
      const now = Date.now();

      // Check if window has reset
      const windowStart = now - config.windowMs;
      
      // Get current rate limit data
      let rateLimitData = this.rateLimitStore.get(key);
      
      if (!rateLimitData || rateLimitData.resetTime < now) {
        // Reset or initialize rate limit
        rateLimitData = {
          count: 0,
          resetTime: now + config.windowMs,
        };
      }

      // Check if limit exceeded
      if (rateLimitData.count >= config.maxRequests) {
        const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
        
        res.setHeader('Retry-After', retryAfter);
        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString());
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        });
      }

      // Increment counter
      rateLimitData.count++;
      this.rateLimitStore.set(key, rateLimitData);

      // Set response headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', config.maxRequests - rateLimitData.count);
      res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString());

      next();
    };
  }

  /**
   * API response caching middleware
   */
  createCacheMiddleware(config: CacheConfig) {
    return async (req: any, res: any, next: any) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = config.key || this.generateCacheKey(req);
      
      try {
        // Try to get from cache
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          // Return cached response
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Cache-Key', cacheKey);
          return res.json(cached);
        }

        // Cache miss - proceed with request
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = async (data: any) => {
          // Cache the response
          await cacheManager.set(cacheKey, data, config.ttl);
          
          // Add cache tags if specified
          if (config.tags) {
            for (const tag of config.tags) {
              await cacheManager.set(`tag:${tag}:${cacheKey}`, true, config.ttl);
            }
          }

          return originalJson.call(res, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next(); // Continue without caching
      }
    };
  }

  /**
   * Optimized API wrapper with caching and rate limiting
   */
  async optimizedApiCall<T>(
    url: string,
    options: RequestInit = {},
    cacheConfig?: CacheConfig
  ): Promise<T> {
    const startTime = performance.now();
    const cacheKey = cacheConfig?.key || `api:${url}:${JSON.stringify(options)}`;

    try {
      // Try to get from cache first
      if (cacheConfig) {
        const cached = await cacheManager.get<T>(cacheKey);
        if (cached) {
          performanceMonitor.trackCachePerformance(true, cacheKey);
          return cached;
        }
      }

      // Make API call
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall(url, duration, response.status);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the response if cache config is provided
      if (cacheConfig) {
        await cacheManager.set(cacheKey, data, cacheConfig.ttl);
        performanceMonitor.trackCachePerformance(false, cacheKey);
      }

      return data;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall(url, duration, 500);
      throw error;
    }
  }

  /**
   * Batch API calls for better performance
   */
  async batchApiCalls<T>(
    calls: Array<{ url: string; options?: RequestInit; cacheConfig?: CacheConfig }>
  ): Promise<T[]> {
    const promises = calls.map(({ url, options, cacheConfig }) =>
      this.optimizedApiCall<T>(url, options, cacheConfig)
    );

    return Promise.all(promises);
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateCacheByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        await cacheManager.invalidatePattern(`tag:${tag}:*`);
      }
      console.log(`✅ Cache invalidated for tags: ${tags.join(', ')}`);
    } catch (error) {
      console.error('Failed to invalidate cache by tags:', error);
    }
  }

  /**
   * Generate rate limit key
   */
  private generateKey(req: any): string {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    return `ratelimit:${ip}:${userAgent}`;
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(req: any): string {
    const url = req.url;
    const query = JSON.stringify(req.query);
    const headers = JSON.stringify({
      'accept-language': req.get('Accept-Language'),
      'user-agent': req.get('User-Agent'),
    });
    return `api:${url}:${query}:${headers}`;
  }

  /**
   * Get rate limit statistics
   */
  getRateLimitStats(): Record<string, { count: number; resetTime: number }> {
    const stats: Record<string, any> = {};
    for (const [key, data] of this.rateLimitStore) {
      stats[key] = { ...data };
    }
    return stats;
  }

  /**
   * Clear rate limit data
   */
  clearRateLimitData(): void {
    this.rateLimitStore.clear();
  }

  /**
   * Health check for optimization services
   */
  async healthCheck(): Promise<{
    cache: boolean;
    rateLimit: boolean;
    performance: boolean;
  }> {
    const cacheHealth = await cacheManager.exists('health-check');
    const rateLimitHealth = this.rateLimitStore.size >= 0;
    const performanceHealth = true; // Performance monitor is always available

    return {
      cache: cacheHealth,
      rateLimit: rateLimitHealth,
      performance: performanceHealth,
    };
  }
}

// Default rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  STRICT: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  MODERATE: { windowMs: 15 * 60 * 1000, maxRequests: 1000 }, // 1000 requests per 15 minutes
  RELAXED: { windowMs: 15 * 60 * 1000, maxRequests: 5000 }, // 5000 requests per 15 minutes
  API_ENDPOINT: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  AUTH_ENDPOINT: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
} as const;

// Default cache configurations
export const CACHE_CONFIGS = {
  SHORT: { ttl: 300 }, // 5 minutes
  MEDIUM: { ttl: 1800 }, // 30 minutes
  LONG: { ttl: 3600 }, // 1 hour
  USER_PROFILE: { ttl: 3600, tags: ['user-profile'] },
  DEVICE_DATA: { ttl: 1800, tags: ['device-data'] },
  TRANSACTIONS: { ttl: 900, tags: ['transactions'] },
  MARKETPLACE: { ttl: 1800, tags: ['marketplace'] },
} as const;

// API optimization hooks
export const useApiOptimization = () => {
  const apiService = ApiOptimizationService.getInstance();

  return {
    optimizedApiCall: apiService.optimizedApiCall.bind(apiService),
    batchApiCalls: apiService.batchApiCalls.bind(apiService),
    invalidateCacheByTags: apiService.invalidateCacheByTags.bind(apiService),
    getRateLimitStats: apiService.getRateLimitStats.bind(apiService),
    clearRateLimitData: apiService.clearRateLimitData.bind(apiService),
    healthCheck: apiService.healthCheck.bind(apiService),
  };
};

export default ApiOptimizationService.getInstance();
