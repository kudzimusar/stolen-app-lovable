// Browser-safe version of performance optimization
// This provides mock implementations for browser environments

export interface PerformanceConfig {
  monitoring: {
    enabled: boolean;
    interval: number;
    alertThreshold: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
  };
  loadBalancing: {
    enabled: boolean;
    strategy: 'round-robin' | 'least-connections' | 'weighted';
  };
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ServerInfo {
  url: string;
  healthy: boolean;
  connections: number;
  weight: number;
}

class BrowserLoadBalancer {
  private servers: ServerInfo[] = [];
  private currentIndex = 0;
  private healthCheckTimer?: number;

  constructor(servers: string[]) {
    this.servers = servers.map(url => ({
      url,
      healthy: true, // Assume healthy in browser
      connections: 0,
      weight: 1
    }));
    console.log('🌐 Using browser-safe load balancer');
  }

  async getNextServer(): Promise<string> {
    // Simple round-robin in browser
    const server = this.servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.servers.length;
    
    if (server) {
      server.connections++;
    }
    
    return server?.url || 'https://api.stolen.com';
  }

  async performHealthChecks(): Promise<void> {
    // Mock health checks - assume all servers are healthy
    this.servers.forEach(server => {
      server.healthy = true;
    });
  }

  releaseConnection(serverUrl: string): void {
    const server = this.servers.find(s => s.url === serverUrl);
    if (server && server.connections > 0) {
      server.connections--;
    }
  }

  getStats(): any {
    return {
      totalServers: this.servers.length,
      healthyServers: this.servers.length, // All healthy in browser
      totalConnections: this.servers.reduce((sum, s) => sum + s.connections, 0),
      servers: this.servers.map(s => ({
        url: s.url,
        healthy: s.healthy,
        connections: s.connections,
        weight: s.weight
      }))
    };
  }

  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

class BrowserPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig;
  private monitoringTimer?: NodeJS.Timeout;
  private alertCallbacks: Array<(metric: PerformanceMetrics) => void> = [];

  constructor(config: PerformanceConfig) {
    this.config = config;
    if (config.monitoring.enabled) {
      this.startMonitoring();
    }
    console.log('🌐 Using browser-safe performance monitor');
  }

  private startMonitoring(): void {
    this.monitoringTimer = setInterval(async () => {
      const metrics = await this.collectMetrics();
      this.metrics.push(metrics);
      
      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Check for alerts
      if (metrics.responseTime > this.config.monitoring.alertThreshold) {
        this.triggerAlert(metrics);
      }
    }, this.config.monitoring.interval);
  }

  private async collectMetrics(): Promise<PerformanceMetrics> {
    // Collect browser-safe metrics
    const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit : 0;
    
    return {
      responseTime: this.calculateAverageResponseTime(),
      throughput: this.calculateThroughput(),
      errorRate: this.calculateErrorRate(),
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage: memoryUsage * 100, // Convert to percentage
      cpuUsage: await this.getCPUUsage()
    };
  }

  private calculateAverageResponseTime(): number {
    // Simulate response time calculation
    return Math.random() * 100 + 50; // 50-150ms
  }

  private calculateThroughput(): number {
    // Simulate throughput calculation (requests per second)
    return Math.random() * 1000 + 500; // 500-1500 req/s
  }

  private calculateErrorRate(): number {
    // Simulate error rate calculation
    return Math.random() * 5; // 0-5%
  }

  private calculateCacheHitRate(): number {
    // Simulate cache hit rate calculation
    return Math.random() * 30 + 70; // 70-100%
  }

  private async getCPUUsage(): Promise<number> {
    // Simulate CPU usage
    return Math.random() * 50 + 20; // 20-70%
  }

  private triggerAlert(metric: PerformanceMetrics): void {
    this.alertCallbacks.forEach(callback => callback(metric));
  }

  onAlert(callback: (metric: PerformanceMetrics) => void): void {
    this.alertCallbacks.push(callback);
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  destroy(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }
  }
}

// Export browser-safe instances
export const loadBalancer = new BrowserLoadBalancer([
  'https://demo.supabase.co',
  'https://api.github.com', 
  'https://jsonplaceholder.typicode.com'
]);

export const performanceMonitor = new BrowserPerformanceMonitor({
  monitoring: {
    enabled: true,
    interval: 5000, // 5 seconds
    alertThreshold: 200 // 200ms
  },
  caching: {
    enabled: true,
    ttl: 300000 // 5 minutes
  },
  loadBalancing: {
    enabled: true,
    strategy: 'round-robin'
  }
});

export default {
  loadBalancer,
  performanceMonitor
};
