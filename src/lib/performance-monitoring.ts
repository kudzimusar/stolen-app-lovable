// Performance monitoring stub
class PerformanceMonitor {
  static getInstance() {
    return new PerformanceMonitor();
  }
  
  trackMetric() {}
  getMetrics() {
    return {
      apiResponseTime: 0,
      pageLoadTime: 0,
      cacheHitRate: 0
    };
  }
  getAllStats() {
    return { api: {}, cache: {}, memory: {} };
  }
}

const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
