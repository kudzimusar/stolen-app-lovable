import { createClient } from 'redis';

// Redis client configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

// Connect to Redis
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

// Initialize connection
let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Fallback to in-memory cache if Redis is not available
      return false;
    }
  }
  return isConnected;
};

// Cache utility functions
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; expiry: number }>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (isConnected) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // Fallback to in-memory cache
        const item = this.cache.get(key);
        if (item && item.expiry > Date.now()) {
          return item.data;
        }
        this.cache.delete(key);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      if (isConnected) {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
      } else {
        // Fallback to in-memory cache
        this.cache.set(key, {
          data,
          expiry: Date.now() + ttlSeconds * 1000,
        });
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (isConnected) {
        await redisClient.del(key);
      } else {
        this.cache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (isConnected) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        // Fallback: delete all keys matching pattern
        for (const key of this.cache.keys()) {
          if (key.includes(pattern.replace('*', ''))) {
            this.cache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (isConnected) {
        return await redisClient.exists(key) > 0;
      } else {
        const item = this.cache.get(key);
        return item ? item.expiry > Date.now() : false;
      }
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
}

// Cache keys constants
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_SESSION: (sessionId: string) => `user:session:${sessionId}`,
  TRANSACTIONS: (userId: string) => `user:transactions:${userId}`,
  NOTIFICATIONS: (userId: string) => `user:notifications:${userId}`,
  DEVICE_REGISTRATIONS: (userId: string) => `user:devices:${userId}`,
  SEARCH_RESULTS: (query: string) => `search:${query}`,
  API_RESPONSE: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
  MARKETPLACE_LISTINGS: (category?: string) => `marketplace:listings:${category || 'all'}`,
  INSURANCE_POLICIES: (userId: string) => `insurance:policies:${userId}`,
  LAW_ENFORCEMENT_CASES: (userId: string) => `law:cases:${userId}`,
} as const;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  USER_PROFILE: 3600, // 1 hour
  USER_SESSION: 86400, // 24 hours
  TRANSACTIONS: 1800, // 30 minutes
  NOTIFICATIONS: 900, // 15 minutes
  DEVICE_REGISTRATIONS: 7200, // 2 hours
  SEARCH_RESULTS: 300, // 5 minutes
  API_RESPONSE: 600, // 10 minutes
  MARKETPLACE_LISTINGS: 1800, // 30 minutes
  INSURANCE_POLICIES: 3600, // 1 hour
  LAW_ENFORCEMENT_CASES: 3600, // 1 hour
} as const;

// Initialize cache connection
connectRedis();

export default CacheManager.getInstance();
