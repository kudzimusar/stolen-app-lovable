// @ts-nocheck
import { useEffect, useCallback, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cacheManager from '../lib/performance/redis';
import performanceMonitor from '../lib/performance/performance-monitoring';
import searchService from '../lib/performance/search-optimization';
import apiService from '../lib/performance/api-optimization';
import backgroundJobs from '../lib/optimization/background-jobs-browser';
import imageService from '../lib/performance/image-optimization';

/**
 * Hook for optimized API calls with caching and performance monitoring
 */
export const useOptimizedApiCall = <T>(
  key: string,
  url: string,
  options: RequestInit = {},
  cacheConfig?: {
    ttl?: number;
    tags?: string[];
  }
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [key, url, options],
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        // Try cache first
        const cacheKey = `api:${key}:${url}`;
        const cached = await cacheManager.get<T>(cacheKey);
        if (cached) {
          performanceMonitor.trackCachePerformance(true, cacheKey);
          return cached;
        }

        // Make API call
        const data = await apiService.optimizedApiCall<T>(url, options, {
          ttl: cacheConfig?.ttl || 300,
          tags: cacheConfig?.tags,
        });

        // Cache the result
        await cacheManager.set(cacheKey, data, cacheConfig?.ttl || 300);
        performanceMonitor.trackCachePerformance(false, cacheKey);

        return data;
      } catch (error) {
        const duration = performance.now() - startTime;
        performanceMonitor.trackApiCall(url, duration, 500);
        throw error;
      }
    },
    staleTime: (cacheConfig?.ttl || 300) * 1000,
    gcTime: (cacheConfig?.ttl || 300) * 1000 * 2,
  });
};

/**
 * Hook for optimized mutations with background processing
 */
export const useOptimizedMutation = <T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: Error, variables: V) => void;
    invalidateQueries?: string[];
    backgroundJob?: boolean;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: V) => {
      const startTime = performance.now();
      
      try {
        const result = await mutationFn(variables);
        
        const duration = performance.now() - startTime;
        performanceMonitor.trackApiCall('mutation', duration, 200);

        // Invalidate related queries
        if (options?.invalidateQueries) {
          options.invalidateQueries.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        performanceMonitor.trackApiCall('mutation', duration, 500);
        throw error;
      }
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook for optimized search functionality
 */
export const useOptimizedSearch = (
  searchType: 'devices' | 'users' | 'transactions' | 'marketplace'
) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const searchFunction = useCallback(async () => {
    if (!query.trim()) return { hits: [] };

    const startTime = performance.now();
    
    try {
      let results;
      switch (searchType) {
        case 'devices':
          results = await searchService.searchDevices(query, filters);
          break;
        case 'users':
          results = await searchService.searchUsers(query, filters);
          break;
        case 'transactions':
          results = await searchService.searchTransactions(query, filters);
          break;
        case 'marketplace':
          results = await searchService.searchMarketplace(query, filters);
          break;
        default:
          results = { hits: [] };
      }

      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall(`search:${searchType}`, duration, 200);

      return results;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall(`search:${searchType}`, duration, 500);
      throw error;
    }
  }, [query, filters, searchType]);

  const getSuggestions = useCallback(async () => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await searchService.getSuggestions(query, searchType);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      setSuggestions([]);
    }
  }, [query, searchType]);

  useEffect(() => {
    const timeoutId = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [getSuggestions]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    suggestions,
    searchFunction,
  };
};

/**
 * Hook for image optimization
 */
export const useImageOptimization = () => {
  const uploadImage = useCallback(async (
    file: File,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png' | 'auto';
      crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    }
  ) => {
    const startTime = performance.now();
    
    try {
      // Add to background job queue for processing
      await backgroundJobs.addImageProcessingJob({
        imageUrl: URL.createObjectURL(file),
        operations: options,
      });

      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('imageUpload', duration, 200);

      return { success: true, jobQueued: true };
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('imageUpload', duration, 500);
      throw error;
    }
  }, []);

  const optimizeImageUrl = useCallback((url: string, options?: any) => {
    return imageService.optimizeExistingUrl(url, options);
  }, []);

  const generateResponsiveUrls = useCallback((publicId: string) => {
    return imageService.generateResponsiveUrls(publicId);
  }, []);

  return {
    uploadImage,
    optimizeImageUrl,
    generateResponsiveUrls,
  };
};

/**
 * Hook for background job management
 */
export const useBackgroundJobs = () => {
  const addNotification = useCallback(async (data: any) => {
    return backgroundJobs.addNotificationJob(data);
  }, []);

  const addEmail = useCallback(async (data: any) => {
    return backgroundJobs.addEmailJob(data);
  }, []);

  const addDataProcessing = useCallback(async (data: any) => {
    return backgroundJobs.addDataProcessingJob(data);
  }, []);

  const getQueueStats = useCallback(async () => {
    return backgroundJobs.getQueueStats();
  }, []);

  return {
    addNotification,
    addEmail,
    addDataProcessing,
    getQueueStats,
  };
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitoring = () => {
  const componentRef = useRef<string>('');

  const trackComponentRender = useCallback((componentName: string) => {
    componentRef.current = componentName;
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      performanceMonitor.trackComponentRender(componentName, duration);
    };
  }, []);

  const trackUserInteraction = useCallback((action: string) => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      performanceMonitor.trackUserInteraction(action, duration);
    };
  }, []);

  const trackPageLoad = useCallback((pageName: string) => {
    const startTime = performance.now();
    
    useEffect(() => {
      const duration = performance.now() - startTime;
      performanceMonitor.trackPageLoad(pageName, duration);
    }, [pageName]);
  }, []);

  const getPerformanceStats = useCallback(() => {
    return performanceMonitor.getAllStats();
  }, []);

  return {
    trackComponentRender,
    trackUserInteraction,
    trackPageLoad,
    getPerformanceStats,
  };
};

/**
 * Hook for cache management
 */
export const useCacheManagement = () => {
  const invalidateCache = useCallback(async (pattern: string) => {
    await cacheManager.invalidatePattern(pattern);
  }, []);

  const clearCache = useCallback(async () => {
    await cacheManager.invalidatePattern('*');
  }, []);

  const getCacheStats = useCallback(async () => {
    // This would need to be implemented based on your cache implementation
    return { status: 'available' };
  }, []);

  return {
    invalidateCache,
    clearCache,
    getCacheStats,
  };
};

/**
 * Hook for lazy loading and code splitting
 */
export const useLazyLoading = <T>(importFn: () => Promise<{ default: T }>) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component) return Component;

    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();
      const module = await importFn();
      const duration = performance.now() - startTime;
      
      performanceMonitor.trackApiCall('lazyLoad', duration, 200);
      
      setComponent(module.default);
      return module.default;
    } catch (err) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('lazyLoad', duration, 500);
      
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [Component, importFn]);

  return {
    Component,
    loading,
    error,
    loadComponent,
  };
};

/**
 * Hook for debounced operations
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttled operations
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  ) as T;
};

/**
 * Debounced search hook for performance optimization
 */
export const useDebouncedSearch = (query: string, delay: number = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return debouncedQuery;
};

export default {
  useOptimizedApiCall,
  useOptimizedMutation,
  useOptimizedSearch,
  useImageOptimization,
  useBackgroundJobs,
  usePerformanceMonitoring,
  useCacheManagement,
  useLazyLoading,
  useDebounce,
  useThrottle,
  useDebouncedSearch,
};
