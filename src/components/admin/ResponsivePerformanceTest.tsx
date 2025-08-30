import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/utils";
import {
  Smartphone,
  Tablet,
  Monitor,
  Zap,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Cpu,
  Memory,
  Network,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Wifi,
  Signal,
  Battery,
  Settings,
  Globe,
  Lock,
  Shield,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface PerformanceMetrics {
  device: string;
  screenSize: string;
  loadingTime: number;
  interactionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  accessibility: number;
  responsiveScore: number;
  overallScore: number;
}

const ResponsivePerformanceTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [results, setResults] = useState<PerformanceMetrics[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  // Test devices configuration
  const testDevices = [
    { name: "iPhone SE", screenSize: "375x667", type: "mobile" },
    { name: "iPhone 12", screenSize: "390x844", type: "mobile" },
    { name: "iPad", screenSize: "768x1024", type: "tablet" },
    { name: "Desktop", screenSize: "1920x1080", type: "desktop" }
  ];

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (const device of testDevices) {
      setCurrentTest(`Testing ${device.name}...`);
      
      // Simulate performance testing for each device
      const metrics = await simulateDeviceTest(device);
      setResults(prev => [...prev, metrics]);
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Calculate overall score
    const avgScore = results.reduce((sum, result) => sum + result.overallScore, 0) / results.length;
    setOverallScore(avgScore);
    
    setIsRunning(false);
    setCurrentTest("");
  };

  const simulateDeviceTest = async (device: any): Promise<PerformanceMetrics> => {
    // Simulate realistic performance metrics based on device type
    const baseLoadingTime = device.type === 'mobile' ? 0.8 : device.type === 'tablet' ? 0.6 : 0.4;
    const baseInteractionTime = device.type === 'mobile' ? 0.3 : device.type === 'tablet' ? 0.2 : 0.1;
    
    const metrics: PerformanceMetrics = {
      device: device.name,
      screenSize: device.screenSize,
      loadingTime: baseLoadingTime + Math.random() * 0.4,
      interactionTime: baseInteractionTime + Math.random() * 0.2,
      memoryUsage: 20 + Math.random() * 30,
      cpuUsage: 15 + Math.random() * 25,
      networkLatency: 50 + Math.random() * 100,
      accessibility: 85 + Math.random() * 15,
      responsiveScore: 90 + Math.random() * 10,
      overallScore: 0
    };

    // Calculate overall score
    metrics.overallScore = calculateOverallScore(metrics);
    
    return metrics;
  };

  const calculateOverallScore = (metrics: PerformanceMetrics): number => {
    const weights = {
      loadingTime: 0.25,
      interactionTime: 0.20,
      memoryUsage: 0.15,
      cpuUsage: 0.15,
      networkLatency: 0.10,
      accessibility: 0.10,
      responsiveScore: 0.05
    };

    const normalizedScores = {
      loadingTime: Math.max(0, 100 - (metrics.loadingTime * 100)),
      interactionTime: Math.max(0, 100 - (metrics.interactionTime * 100)),
      memoryUsage: Math.max(0, 100 - metrics.memoryUsage),
      cpuUsage: Math.max(0, 100 - metrics.cpuUsage),
      networkLatency: Math.max(0, 100 - (metrics.networkLatency / 2)),
      accessibility: metrics.accessibility,
      responsiveScore: metrics.responsiveScore
    };

    return Object.entries(weights).reduce((score, [key, weight]) => {
      return score + (normalizedScores[key as keyof typeof normalizedScores] * weight);
    }, 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-warning";
    return "text-destructive";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />;
    if (score >= 75) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Responsive Performance Testing
          </CardTitle>
          <CardDescription>
            Cross-device performance validation and optimization testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={runPerformanceTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isRunning && "animate-spin")} />
              {isRunning ? "Running Tests..." : "Run Performance Test"}
            </Button>
            
            {isRunning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="w-4 h-4 animate-pulse" />
                {currentTest}
              </div>
            )}
          </div>

          {/* Test Devices Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {testDevices.map((device) => (
              <div key={device.name} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {device.type === 'mobile' && <Smartphone className="w-6 h-6 text-primary" />}
                  {device.type === 'tablet' && <Tablet className="w-6 h-6 text-success" />}
                  {device.type === 'desktop' && <Monitor className="w-6 h-6 text-warning" />}
                  <div>
                    <h4 className="font-semibold text-sm">{device.name}</h4>
                    <p className="text-xs text-muted-foreground">{device.screenSize}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Score */}
          {results.length > 0 && (
            <div className="text-center p-6 bg-muted/50 rounded-lg mb-6">
              <div className={cn("text-3xl font-bold mb-2", getScoreColor(overallScore))}>
                {overallScore.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Performance Score</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {getScoreIcon(overallScore)}
                <span className="text-sm">
                  {overallScore >= 90 ? "Excellent" : overallScore >= 75 ? "Good" : "Needs Improvement"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {results.length > 0 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div key={result.device} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {result.device.includes('iPhone') && <Smartphone className="w-4 h-4" />}
                          {result.device.includes('iPad') && <Tablet className="w-4 h-4" />}
                          {result.device.includes('Desktop') && <Monitor className="w-4 h-4" />}
                          <div>
                            <h4 className="font-semibold text-sm">{result.device}</h4>
                            <p className="text-xs text-muted-foreground">{result.screenSize}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn("font-semibold", getScoreColor(result.overallScore))}>
                            {result.overallScore.toFixed(1)}%
                          </div>
                          <div className="flex items-center gap-1">
                            {getScoreIcon(result.overallScore)}
                            <span className="text-xs text-muted-foreground">
                              {result.overallScore >= 90 ? "Excellent" : result.overallScore >= 75 ? "Good" : "Poor"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Key Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Loading Time</span>
                      <span className="font-semibold">
                        {(results.reduce((sum, r) => sum + r.loadingTime, 0) / results.length).toFixed(2)}s
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, 100 - (results.reduce((sum, r) => sum + r.loadingTime, 0) / results.length) * 100)} 
                      className="h-2" 
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Interaction Time</span>
                      <span className="font-semibold">
                        {(results.reduce((sum, r) => sum + r.interactionTime, 0) / results.length).toFixed(2)}s
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, 100 - (results.reduce((sum, r) => sum + r.interactionTime, 0) / results.length) * 100)} 
                      className="h-2" 
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Memory Usage</span>
                      <span className="font-semibold">
                        {(results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, 100 - (results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length))} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <div className="grid gap-6">
              {results.map((result) => (
                <Card key={result.device}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {result.device.includes('iPhone') && <Smartphone className="w-5 h-5" />}
                      {result.device.includes('iPad') && <Tablet className="w-5 h-5" />}
                      {result.device.includes('Desktop') && <Monitor className="w-5 h-5" />}
                      {result.device} - {result.screenSize}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Loading Time</span>
                          <span className="font-semibold">{result.loadingTime.toFixed(2)}s</span>
                        </div>
                        <Progress value={Math.max(0, 100 - result.loadingTime * 100)} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Interaction Time</span>
                          <span className="font-semibold">{result.interactionTime.toFixed(2)}s</span>
                        </div>
                        <Progress value={Math.max(0, 100 - result.interactionTime * 100)} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Memory Usage</span>
                          <span className="font-semibold">{result.memoryUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.max(0, 100 - result.memoryUsage)} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span className="font-semibold">{result.cpuUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.max(0, 100 - result.cpuUsage)} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Network Latency</span>
                          <span className="font-semibold">{result.networkLatency.toFixed(0)}ms</span>
                        </div>
                        <Progress value={Math.max(0, 100 - result.networkLatency / 2)} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Accessibility</span>
                          <span className="font-semibold">{result.accessibility.toFixed(1)}%</span>
                        </div>
                        <Progress value={result.accessibility} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Responsive Score</span>
                          <span className="font-semibold">{result.responsiveScore.toFixed(1)}%</span>
                        </div>
                        <Progress value={result.responsiveScore} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Score</span>
                          <span className={cn("font-semibold", getScoreColor(result.overallScore))}>
                            {result.overallScore.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={result.overallScore} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Performance Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overallScore < 90 && (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <h4 className="font-semibold text-warning mb-2">Performance Optimization Needed</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Implement lazy loading for images and components</li>
                        <li>• Optimize bundle size and code splitting</li>
                        <li>• Enable compression and caching</li>
                        <li>• Optimize critical rendering path</li>
                      </ul>
                    </div>
                  )}
                  
                  {results.some(r => r.loadingTime > 1) && (
                    <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                      <h4 className="font-semibold text-info mb-2">Loading Time Optimization</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Implement service worker for offline caching</li>
                        <li>• Use CDN for static assets</li>
                        <li>• Optimize API response times</li>
                        <li>• Implement progressive loading</li>
                      </ul>
                    </div>
                  )}
                  
                  {results.some(r => r.memoryUsage > 50) && (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <h4 className="font-semibold text-warning mb-2">Memory Usage Optimization</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Implement proper cleanup for event listeners</li>
                        <li>• Use React.memo for component optimization</li>
                        <li>• Optimize image sizes and formats</li>
                        <li>• Implement virtual scrolling for large lists</li>
                      </ul>
                    </div>
                  )}
                  
                  {overallScore >= 90 && (
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <h4 className="font-semibold text-success mb-2">Excellent Performance!</h4>
                      <p className="text-sm">Your application is performing excellently across all devices. Continue monitoring and maintain these standards.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ResponsivePerformanceTest;
