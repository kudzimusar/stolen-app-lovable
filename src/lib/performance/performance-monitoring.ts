import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Performance monitoring service
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private isInitialized = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize Sentry for error tracking and performance monitoring
   */
  init() {
    if (this.isInitialized) return;

    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN || 'your-sentry-dsn',
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            // Add your router history here if needed
          ),
        }),
      ],
      tracesSampleRate: 0.1, // Sample 10% of transactions
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: process.env.NODE_ENV || 'development',
    });

    this.isInitialized = true;
    console.log('✅ Performance monitoring initialized');
  }

  /**
   * Track API response time
   */
  trackApiCall(endpoint: string, duration: number, status: number) {
    const key = `api:${endpoint}`;
    this.recordMetric(key, duration);

    // Send to Sentry if it's a slow request
    if (duration > 2000) { // 2 seconds threshold
      Sentry.addBreadcrumb({
        category: 'api',
        message: `Slow API call: ${endpoint}`,
        data: { endpoint, duration, status },
        level: 'warning',
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 API Call: ${endpoint} - ${duration}ms - ${status}`);
    }
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, duration: number) {
    const key = `component:${componentName}`;
    this.recordMetric(key, duration);

    if (duration > 100) { // 100ms threshold for component renders
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `Slow component render: ${componentName}`,
        data: { componentName, duration },
        level: 'warning',
      });
    }
  }

  /**
   * Track page load time
   */
  trackPageLoad(pageName: string, duration: number) {
    const key = `page:${pageName}`;
    this.recordMetric(key, duration);

    // Send to Sentry if page load is slow
    if (duration > 3000) { // 3 seconds threshold
      Sentry.captureMessage(`Slow page load: ${pageName}`, 'warning');
    }
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(action: string, duration: number) {
    const key = `interaction:${action}`;
    this.recordMetric(key, duration);

    if (duration > 500) { // 500ms threshold for interactions
      Sentry.addBreadcrumb({
        category: 'user-interaction',
        message: `Slow user interaction: ${action}`,
        data: { action, duration },
        level: 'warning',
      });
    }
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);

      this.recordMetric('memory:used', usedMB);
      this.recordMetric('memory:total', totalMB);

      // Alert if memory usage is high
      if (usedMB > 100) { // 100MB threshold
        Sentry.addBreadcrumb({
          category: 'memory',
          message: 'High memory usage detected',
          data: { usedMB, totalMB },
          level: 'warning',
        });
      }
    }
  }

  /**
   * Track cache hit/miss rates
   */
  trackCachePerformance(hit: boolean, cacheKey: string) {
    const key = hit ? 'cache:hit' : 'cache:miss';
    this.recordMetric(key, 1);

    if (!hit) {
      Sentry.addBreadcrumb({
        category: 'cache',
        message: `Cache miss: ${cacheKey}`,
        data: { cacheKey },
        level: 'info',
      });
    }
  }

  /**
   * Record a metric
   */
  private recordMetric(key: string, value: number) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push(value);

    // Keep only last 100 values
    const values = this.metrics.get(key)!;
    if (values.length > 100) {
      values.splice(0, values.length - 100);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(key: string) {
    const values = this.metrics.get(key);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      count: values.length,
      average: Math.round(avg * 100) / 100,
      min,
      max,
      median,
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Get all performance metrics
   */
  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [key] of this.metrics) {
      stats[key] = this.getStats(key);
    }
    return stats;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
  }

  /**
   * Start a performance timer
   */
  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.trackApiCall(name, duration, 200);
    };
  }

  /**
   * Track error with performance context
   */
  trackError(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
      extra: {
        ...context,
        performance: this.getAllStats(),
      },
    });
  }

  /**
   * Set user context for better error tracking
   */
  setUserContext(userId: string, userData?: Record<string, any>) {
    Sentry.setUser({
      id: userId,
      ...userData,
    });
  }

  /**
   * Add custom breadcrumb
   */
  addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  }
}

// Performance monitoring hooks
export const usePerformanceTracking = () => {
  const monitor = PerformanceMonitor.getInstance();

  return {
    trackApiCall: monitor.trackApiCall.bind(monitor),
    trackComponentRender: monitor.trackComponentRender.bind(monitor),
    trackPageLoad: monitor.trackPageLoad.bind(monitor),
    trackUserInteraction: monitor.trackUserInteraction.bind(monitor),
    startTimer: monitor.startTimer.bind(monitor),
    getStats: monitor.getStats.bind(monitor),
    getAllStats: monitor.getAllStats.bind(monitor),
  };
};

// Initialize performance monitoring
const performanceMonitor = PerformanceMonitor.getInstance();
performanceMonitor.init();

export default performanceMonitor;
