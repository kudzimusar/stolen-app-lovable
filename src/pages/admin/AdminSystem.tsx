import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server, 
  Database, 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Settings,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Lock,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

const AdminSystem = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Mock system data - would come from API
  const systemHealth = {
    overall: 98.5,
    api: 99.2,
    database: 98.8,
    blockchain: 99.1,
    ai_ml: 97.9,
    storage: 99.5,
    network: 98.3
  };

  const serverMetrics = {
    cpu: 65,
    memory: 78,
    disk: 42,
    network: 23
  };

  const services = [
    {
      name: "API Gateway",
      status: "operational",
      uptime: 99.9,
      responseTime: 145,
      requests: 12456,
      errors: 12
    },
    {
      name: "Authentication Service",
      status: "operational",
      uptime: 99.8,
      responseTime: 89,
      requests: 8934,
      errors: 5
    },
    {
      name: "Database Cluster",
      status: "operational",
      uptime: 99.7,
      responseTime: 23,
      requests: 45678,
      errors: 8
    },
    {
      name: "Blockchain Node",
      status: "operational",
      uptime: 99.6,
      responseTime: 567,
      requests: 2345,
      errors: 2
    },
    {
      name: "AI/ML Services",
      status: "degraded",
      uptime: 97.9,
      responseTime: 1234,
      requests: 5678,
      errors: 45
    },
    {
      name: "Payment Gateway",
      status: "operational",
      uptime: 99.4,
      responseTime: 234,
      requests: 3456,
      errors: 3
    }
  ];

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "High CPU Usage",
      message: "Server CPU usage has exceeded 80% for the last 15 minutes",
      time: "5 minutes ago",
      severity: "medium"
    },
    {
      id: 2,
      type: "error",
      title: "AI Service Degraded",
      message: "ML model prediction service response time increased by 300%",
      time: "12 minutes ago",
      severity: "high"
    },
    {
      id: 3,
      type: "info",
      title: "Scheduled Maintenance",
      message: "Database maintenance window scheduled for tonight at 2 AM UTC",
      time: "1 hour ago",
      severity: "low"
    },
    {
      id: 4,
      type: "success",
      title: "Backup Completed",
      message: "Daily backup completed successfully with 0 errors",
      time: "2 hours ago",
      severity: "low"
    }
  ];

  const performanceMetrics = [
    { name: "API Response Time", value: 145, unit: "ms", trend: "down", good: true },
    { name: "Database Query Time", value: 23, unit: "ms", trend: "stable", good: true },
    { name: "Error Rate", value: 0.12, unit: "%", trend: "down", good: true },
    { name: "Throughput", value: 1250, unit: "req/min", trend: "up", good: true }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-success";
      case "degraded": return "text-warning";
      case "down": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-success text-success-foreground";
      case "degraded": return "bg-warning text-warning-foreground";
      case "down": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error": return "bg-destructive/10 border-destructive";
      case "warning": return "bg-warning/10 border-warning";
      case "success": return "bg-success/10 border-success";
      default: return "bg-primary/10 border-primary";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "success": return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                System Monitoring
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Real-time platform health and performance monitoring
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              System Health Overview
            </CardTitle>
            <CardDescription>
              Overall platform health: {systemHealth.overall}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={systemHealth.overall} className="h-3" />
              
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: "API Services", value: systemHealth.api, icon: Server },
                  { name: "Database", value: systemHealth.database, icon: Database },
                  { name: "Blockchain", value: systemHealth.blockchain, icon: Shield },
                  { name: "AI/ML", value: systemHealth.ai_ml, icon: Zap }
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <item.icon className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-2xl font-bold">{item.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid gap-4">
              {services.map((service) => (
                <Card key={service.name}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          service.status === "operational" ? "bg-success" :
                          service.status === "degraded" ? "bg-warning" : "bg-destructive"
                        )} />
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <Badge className={getStatusBadgeColor(service.status)}>
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Uptime</p>
                          <p className="font-medium">{service.uptime}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Response</p>
                          <p className="font-medium">{service.responseTime}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requests</p>
                          <p className="font-medium">{service.requests.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Errors</p>
                          <p className="font-medium">{service.errors}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric) => (
                      <div key={metric.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Trend: {metric.trend}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {metric.value}{metric.unit}
                          </p>
                          <div className={cn(
                            "text-xs",
                            metric.good ? "text-success" : "text-destructive"
                          )}>
                            {metric.good ? "Good" : "Needs Attention"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Chart</CardTitle>
                  <CardDescription>
                    Real-time performance monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">Performance chart would go here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Server Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          CPU Usage
                        </span>
                        <span>{serverMetrics.cpu}%</span>
                      </div>
                      <Progress value={serverMetrics.cpu} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4" />
                          Memory Usage
                        </span>
                        <span>{serverMetrics.memory}%</span>
                      </div>
                      <Progress value={serverMetrics.memory} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          Disk Usage
                        </span>
                        <span>{serverMetrics.disk}%</span>
                      </div>
                      <Progress value={serverMetrics.disk} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <Network className="w-4 h-4" />
                          Network Usage
                        </span>
                        <span>{serverMetrics.network}%</span>
                      </div>
                      <Progress value={serverMetrics.network} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Infrastructure Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Load Balancer", status: "operational" },
                      { name: "CDN", status: "operational" },
                      { name: "File Storage", status: "operational" },
                      { name: "Backup System", status: "operational" },
                      { name: "Monitoring", status: "operational" },
                      { name: "Security Scanner", status: "degraded" }
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <Badge className={getStatusBadgeColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  System Alerts
                </CardTitle>
                <CardDescription>
                  Recent system alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={cn(
                      "p-4 rounded-lg border",
                      getAlertColor(alert.type)
                    )}>
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <span className="text-xs text-muted-foreground">{alert.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSystem;