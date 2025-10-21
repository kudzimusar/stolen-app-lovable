// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  Search, 
  Image, 
  Mail, 
  Clock, 
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import performanceMonitor from '@/lib/performance-monitoring';
import cacheManager from '@/lib/redis';
import backgroundJobs from '@/lib/optimization/background-jobs-browser';
import apiService from '@/lib/api-optimization';

interface ApiStats {
  responseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  cacheHitRate: number;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  size: number;
  evictions: number;
}

interface SearchStats {
  queryTime: number;
  resultsCount: number;
  indexSize: number;
}

interface BackgroundStats {
  jobsProcessed: number;
  queueSize: number;
  processingTime: number;
}

interface MemoryStats {
  used: number;
  total: number;
  heapUsed: number;
  heapTotal: number;
}

interface PerformanceStats {
  api: ApiStats;
  cache: CacheStats;
  search: SearchStats;
  background: BackgroundStats;
  memory: MemoryStats;
}

export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    api: {
      responseTime: 0,
      requestsPerSecond: 0,
      errorRate: 0,
      cacheHitRate: 0
    },
    cache: {
      hitRate: 0,
      missRate: 0,
      size: 0,
      evictions: 0
    },
    search: {
      queryTime: 0,
      resultsCount: 0,
      indexSize: 0
    },
    background: {
      jobsProcessed: 0,
      queueSize: 0,
      processingTime: 0
    },
    memory: {
      used: 0,
      total: 0,
      heapUsed: 0,
      heapTotal: 0
    },
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [
        performanceStats,
        queueStats,
        healthCheck,
      ] = await Promise.all([
        performanceMonitor.getAllStats(),
        backgroundJobs.getQueueStats(),
        apiService.healthCheck(),
      ]);

      setStats({
        api: performanceStats,
        cache: { status: healthCheck.cache ? 'healthy' : 'unhealthy' },
        search: { status: 'active' },
        background: queueStats,
        memory: performanceStats['memory:used'] ? {
          used: performanceStats['memory:used'],
          total: performanceStats['memory:total'],
        } : {},
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getApiPerformanceColor = (avg: number) => {
    if (avg < 500) return 'text-green-600';
    if (avg < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCacheHitRate = () => {
    const hits = stats.api['cache:hit']?.count || 0;
    const misses = stats.api['cache:miss']?.count || 0;
    const total = hits + misses;
    return total > 0 ? Math.round((hits / total) * 100) : 0;
  };

  const getMemoryUsage = () => {
    const used = stats.memory.used?.average || 0;
    const total = stats.memory.total?.average || 100;
    return Math.round((used / total) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of optimization services
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={fetchStats} 
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="background">Background Jobs</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* API Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Performance</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.api['api:mutation']?.average 
                    ? `${Math.round(stats.api['api:mutation'].average)}ms`
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            {/* Cache Hit Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCacheHitRate()}%</div>
                <p className="text-xs text-muted-foreground">
                  Cache efficiency
                </p>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getMemoryUsage()}%</div>
                <p className="text-xs text-muted-foreground">
                  Current usage
                </p>
              </CardContent>
            </Card>

            {/* Background Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.background.queueSize}
                </div>
                <p className="text-xs text-muted-foreground">
                  Running in background
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Redis Cache</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Search Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Image Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Background Jobs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.api)
                .filter(([key]) => key.startsWith('api:'))
                .map(([key, data]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{key.replace('api:', '')}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.count} calls
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getApiPerformanceColor(data.average)}`}>
                        {Math.round(data.average)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">
                        avg response
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Cache Hit Rate</span>
                <div className="flex items-center gap-2">
                  <Progress value={getCacheHitRate()} className="w-32" />
                  <span className="text-sm font-medium">{getCacheHitRate()}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.api['cache:hit']?.count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Cache Hits</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.api['cache:miss']?.count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Cache Misses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="background" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Background Job Queues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.background).map(([queueName, queueStats]) => (
                  <div key={queueName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{queueName.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="text-sm text-muted-foreground">
                        {queueStats.completed} completed, {queueStats.failed} failed
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant={queueStats.active > 0 ? 'default' : 'secondary'}>
                          {queueStats.active} active
                        </Badge>
                        <Badge variant="outline">
                          {queueStats.waiting} waiting
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Memory Usage</span>
                <div className="flex items-center gap-2">
                  <Progress value={getMemoryUsage()} className="w-32" />
                  <span className="text-sm font-medium">{getMemoryUsage()}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.round(stats.memory.used?.average || 0)}MB
                  </div>
                  <div className="text-sm text-muted-foreground">Used Memory</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.round(stats.memory.total?.average || 100)}MB
                  </div>
                  <div className="text-sm text-muted-foreground">Total Memory</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
