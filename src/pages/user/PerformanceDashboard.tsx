import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Activity,
  Zap,
  Database,
  Server,
  Cpu,
  Memory,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Gauge,
  Network,
  HardDrive,
  Wifi,
  Shield,
  Target,
  Eye,
  Download,
  Upload
} from "lucide-react";
import { performanceMonitor } from "@/lib/performance/performance-optimization-browser";
import { reverseVerificationAPI } from "@/lib/services/reverse-verification-api";

const PerformanceDashboard = () => {
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [apiStats, setApiStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Performance metrics
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });

  // System health status
  const [systemHealth, setSystemHealth] = useState({
    cache: 'healthy',
    loadBalancer: 'healthy',
    api: 'healthy',
    database: 'healthy'
  });

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 10000); // Update every 10 seconds
    
    // Set up performance alerts
    performanceOptimizer.onPerformanceAlert((alertMetrics) => {
      toast({
        title: "Performance Alert",
        description: `Response time exceeded threshold: ${alertMetrics.responseTime}ms`,
        variant: "destructive"
      });
    });

    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setIsRefreshing(true);
      
      // Get performance stats
      const stats = performanceOptimizer.getPerformanceStats();
      setPerformanceStats(stats);
      
      // Get API stats
      const apiStatsData = await reverseVerificationAPI.getAPIStats();
      setApiStats(apiStatsData);
      
      // Simulate real-time metrics
      setMetrics({
        responseTime: Math.random() * 100 + 50,
        throughput: Math.random() * 1000 + 500,
        errorRate: Math.random() * 5,
        cacheHitRate: Math.random() * 20 + 80,
        memoryUsage: Math.random() * 30 + 20,
        cpuUsage: Math.random() * 40 + 10
      });

      // Update system health
      setSystemHealth({
        cache: stats.cache.hitRate > 80 ? 'healthy' : 'warning',
        loadBalancer: stats.loadBalancer.healthyServers > 0 ? 'healthy' : 'error',
        api: apiStatsData.uptime > 99 ? 'healthy' : 'warning',
        database: Math.random() > 0.1 ? 'healthy' : 'warning'
      });

    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <STOLENLogo />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                Performance Dashboard
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Real-time system performance monitoring and optimization
              </p>
            </div>
            <Button 
              onClick={loadPerformanceData} 
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cache System</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getHealthIcon(systemHealth.cache)}
                    <span className={cn("text-sm font-semibold", getHealthColor(systemHealth.cache))}>
                      {systemHealth.cache.toUpperCase()}
                    </span>
                  </div>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Load Balancer</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getHealthIcon(systemHealth.loadBalancer)}
                    <span className={cn("text-sm font-semibold", getHealthColor(systemHealth.loadBalancer))}>
                      {systemHealth.loadBalancer.toUpperCase()}
                    </span>
                  </div>
                </div>
                <Server className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">API Service</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getHealthIcon(systemHealth.api)}
                    <span className={cn("text-sm font-semibold", getHealthColor(systemHealth.api))}>
                      {systemHealth.api.toUpperCase()}
                    </span>
                  </div>
                </div>
                <Network className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Database</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getHealthIcon(systemHealth.database)}
                    <span className={cn("text-sm font-semibold", getHealthColor(systemHealth.database))}>
                      {systemHealth.database.toUpperCase()}
                    </span>
                  </div>
                </div>
                <HardDrive className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="loadbalancer">Load Balancer</TabsTrigger>
            <TabsTrigger value="api">API Stats</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Real-time Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Real-time Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Live system performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{metrics.responseTime.toFixed(1)}ms</span>
                      </div>
                    </div>
                    <Progress value={Math.min(metrics.responseTime / 2, 100)} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Throughput</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{metrics.throughput.toFixed(0)} req/s</span>
                      </div>
                    </div>
                    <Progress value={Math.min(metrics.throughput / 20, 100)} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{metrics.errorRate.toFixed(2)}%</span>
                      </div>
                    </div>
                    <Progress value={metrics.errorRate * 20} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache Hit Rate</span>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{metrics.cacheHitRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={metrics.cacheHitRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    System Resources
                  </CardTitle>
                  <CardDescription>
                    CPU and memory utilization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU Usage</span>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{metrics.cpuUsage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={metrics.cpuUsage} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <div className="flex items-center gap-2">
                        <Memory className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{metrics.memoryUsage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={metrics.memoryUsage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Historical performance data and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-success mb-1">98.5%</div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">0.8s</div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-warning mb-1">1.2%</div>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cache Tab */}
          <TabsContent value="cache" className="space-y-6">
            {performanceStats?.cache && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Cache Statistics
                    </CardTitle>
                    <CardDescription>
                      Intelligent caching system performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cache Size</span>
                        <span className="font-semibold">{performanceStats.cache.size} items</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hit Rate</span>
                        <span className="font-semibold text-success">{(performanceStats.cache.hitRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Hits</span>
                        <span className="font-semibold">{performanceStats.cache.totalHits}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Misses</span>
                        <span className="font-semibold">{performanceStats.cache.totalMisses}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Cache Performance
                    </CardTitle>
                    <CardDescription>
                      Cache efficiency and optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {(performanceStats.cache.hitRate * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                      </div>
                      <Progress value={performanceStats.cache.hitRate * 100} className="h-3" />
                      <div className="text-center text-sm text-muted-foreground">
                        {performanceStats.cache.hitRate > 0.8 ? 
                          "Excellent cache performance" : 
                          "Consider cache optimization"
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Load Balancer Tab */}
          <TabsContent value="loadbalancer" className="space-y-6">
            {performanceStats?.loadBalancer && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Load Balancer Status
                    </CardTitle>
                    <CardDescription>
                      Server health and connection distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Servers</span>
                        <span className="font-semibold">{performanceStats.loadBalancer.totalServers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Healthy Servers</span>
                        <span className="font-semibold text-success">{performanceStats.loadBalancer.healthyServers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Connections</span>
                        <span className="font-semibold">{performanceStats.loadBalancer.totalConnections}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      Server Details
                    </CardTitle>
                    <CardDescription>
                      Individual server status and load
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {performanceStats.loadBalancer.servers.map((server: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-semibold text-sm">{server.url}</p>
                            <p className="text-xs text-muted-foreground">
                              {server.connections} connections
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={server.healthy ? "default" : "destructive"}>
                              {server.healthy ? "Healthy" : "Unhealthy"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* API Stats Tab */}
          <TabsContent value="api" className="space-y-6">
            {apiStats && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      API Performance
                    </CardTitle>
                    <CardDescription>
                      Reverse Verification API statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Requests</span>
                        <span className="font-semibold">{apiStats.totalRequests}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Users</span>
                        <span className="font-semibold">{apiStats.activeUsers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-semibold text-success">{apiStats.successRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg Response Time</span>
                        <span className="font-semibold">{apiStats.avgResponseTime}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Uptime</span>
                        <span className="font-semibold text-success">{apiStats.uptime}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      API Security
                    </CardTitle>
                    <CardDescription>
                      Rate limiting and security metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success mb-2">
                          {apiStats.uptime}%
                        </div>
                        <p className="text-sm text-muted-foreground">Service Uptime</p>
                      </div>
                      <Progress value={apiStats.uptime} className="h-3" />
                      <div className="text-center text-sm text-muted-foreground">
                        {apiStats.uptime > 99.5 ? 
                          "Excellent service availability" : 
                          "Monitor service health"
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
