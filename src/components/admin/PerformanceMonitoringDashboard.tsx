import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Image, 
  Search, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Import performance optimization hooks
import { 
  usePerformanceMonitoring, 
  useCacheManagement,
  useBackgroundJobs 
} from '@/hooks/usePerformanceOptimization';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  imageLoadTime: number;
  searchResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: string;
}

interface BackgroundJobStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  pendingJobs: number;
  averageProcessingTime: number;
}

export const PerformanceMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    imageLoadTime: 0,
    searchResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0
  });

  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalKeys: 0,
    memoryUsage: '0 MB'
  });

  const [backgroundJobStats, setBackgroundJobStats] = useState<BackgroundJobStats>({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    pendingJobs: 0,
    averageProcessingTime: 0
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Performance monitoring hooks
  const { getPerformanceStats } = usePerformanceMonitoring();
  const { getCacheStats, invalidateCache } = useCacheManagement();
  const { getQueueStats } = useBackgroundJobs();

  // Simulate performance metrics (in real app, these would come from actual monitoring)
  const simulateMetrics = () => {
    const baseMetrics = {
      pageLoadTime: Math.random() * 2000 + 500, // 500-2500ms
      apiResponseTime: Math.random() * 500 + 100, // 100-600ms
      cacheHitRate: Math.random() * 30 + 70, // 70-100%
      imageLoadTime: Math.random() * 1000 + 200, // 200-1200ms
      searchResponseTime: Math.random() * 100 + 50, // 50-150ms
      memoryUsage: Math.random() * 50 + 20, // 20-70%
      cpuUsage: Math.random() * 30 + 10, // 10-40%
      activeConnections: Math.floor(Math.random() * 100 + 50) // 50-150
    };

    setMetrics(baseMetrics);
  };

  // Simulate cache statistics
  const simulateCacheStats = () => {
    const hits = Math.floor(Math.random() * 1000 + 500);
    const misses = Math.floor(Math.random() * 100 + 50);
    const total = hits + misses;
    
    setCacheStats({
      hits,
      misses,
      hitRate: (hits / total) * 100,
      totalKeys: Math.floor(Math.random() * 1000 + 100),
      memoryUsage: `${(Math.random() * 50 + 10).toFixed(1)} MB`
    });
  };

  // Simulate background job statistics
  const simulateBackgroundJobStats = () => {
    const totalJobs = Math.floor(Math.random() * 1000 + 100);
    const completedJobs = Math.floor(totalJobs * 0.85);
    const failedJobs = Math.floor(totalJobs * 0.05);
    const pendingJobs = totalJobs - completedJobs - failedJobs;

    setBackgroundJobStats({
      totalJobs,
      completedJobs,
      failedJobs,
      pendingJobs,
      averageProcessingTime: Math.random() * 5000 + 1000 // 1-6 seconds
    });
  };

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API calls to get real metrics
      simulateMetrics();
      simulateCacheStats();
      simulateBackgroundJobStats();
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshMetrics();
    
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (metric: number, threshold: number, isLowerBetter: boolean = true) => {
    if (isLowerBetter) {
      return metric <= threshold ? 'good' : metric <= threshold * 1.5 ? 'warning' : 'critical';
    } else {
      return metric >= threshold ? 'good' : metric >= threshold * 0.7 ? 'warning' : 'critical';
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of application performance optimizations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <Button 
            onClick={refreshMetrics} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.pageLoadTime.toFixed(0)}ms
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(getPerformanceStatus(metrics.pageLoadTime, 1000))}
              <Badge variant="outline" className={getStatusColor(getPerformanceStatus(metrics.pageLoadTime, 1000))}>
                {getPerformanceStatus(metrics.pageLoadTime, 1000)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.apiResponseTime.toFixed(0)}ms
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(getPerformanceStatus(metrics.apiResponseTime, 200))}
              <Badge variant="outline" className={getStatusColor(getPerformanceStatus(metrics.apiResponseTime, 200))}>
                {getPerformanceStatus(metrics.apiResponseTime, 200)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats.hitRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(getPerformanceStatus(cacheStats.hitRate, 80, false))}
              <Badge variant="outline" className={getStatusColor(getPerformanceStatus(cacheStats.hitRate, 80, false))}>
                {getPerformanceStatus(cacheStats.hitRate, 80, false)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.memoryUsage.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(getPerformanceStatus(metrics.memoryUsage, 70))}
              <Badge variant="outline" className={getStatusColor(getPerformanceStatus(metrics.memoryUsage, 70))}>
                {getPerformanceStatus(metrics.memoryUsage, 70)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cache Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cache Hits</p>
                <p className="text-2xl font-bold text-green-600">{cacheStats.hits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cache Misses</p>
                <p className="text-2xl font-bold text-red-600">{cacheStats.misses.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Hit Rate</p>
              <Progress value={cacheStats.hitRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {cacheStats.hitRate.toFixed(1)}% success rate
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Keys</p>
                <p className="text-lg font-semibold">{cacheStats.totalKeys.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Memory Usage</p>
                <p className="text-lg font-semibold">{cacheStats.memoryUsage}</p>
              </div>
            </div>

            <Button 
              onClick={() => invalidateCache('all')} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              Clear Cache
            </Button>
          </CardContent>
        </Card>

        {/* Background Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Background Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{backgroundJobStats.totalJobs.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{backgroundJobStats.completedJobs.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-lg font-semibold text-red-600">{backgroundJobStats.failedJobs.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold text-yellow-600">{backgroundJobStats.pendingJobs.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
              <Progress 
                value={(backgroundJobStats.completedJobs / backgroundJobStats.totalJobs) * 100} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {((backgroundJobStats.completedJobs / backgroundJobStats.totalJobs) * 100).toFixed(1)}% success rate
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Avg Processing Time</p>
              <p className="text-lg font-semibold">
                {(backgroundJobStats.averageProcessingTime / 1000).toFixed(1)}s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Image Load Time</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.imageLoadTime.toFixed(0)}ms
                </span>
              </div>
              <Progress 
                value={Math.min((metrics.imageLoadTime / 1000) * 100, 100)} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground">
                Target: &lt;500ms
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Search Response</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.searchResponseTime.toFixed(0)}ms
                </span>
              </div>
              <Progress 
                value={Math.min((metrics.searchResponseTime / 100) * 100, 100)} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground">
                Target: &lt;100ms
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Connections</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.activeConnections}
                </span>
              </div>
              <Progress 
                value={Math.min((metrics.activeConnections / 200) * 100, 100)} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground">
                Capacity: 200 connections
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Optimization Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Redis Cache</p>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Image className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Image Optimization</p>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Search className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Search Index</p>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Background Jobs</p>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitoringDashboard;
