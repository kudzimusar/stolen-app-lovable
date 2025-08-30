import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Brain,
  Target,
  Activity,
  Zap,
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Users,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const PaymentFraud = () => {
  const [timeRange, setTimeRange] = useState("24h");
  const [modelVersion, setModelVersion] = useState("v2.1");

  // Mock fraud detection data - would come from API
  const stats = {
    fraudPrevented: 98.5,
    falsePositives: 2.1,
    flaggedTransactions: 156,
    blockedAmount: 125750,
    fraudAttempts: 432,
    accuracyRate: 97.8,
    processingTime: 85,
    modelsActive: 5
  };

  const alertsData = [
    {
      id: "alert_001",
      severity: "high",
      type: "suspicious_velocity",
      description: "Multiple high-value transactions from same IP",
      amount: 15600,
      transactions: 8,
      ip: "192.168.1.100",
      location: "Nigeria",
      timestamp: "2024-01-20 14:30:00",
      status: "investigating",
      riskScore: 92
    },
    {
      id: "alert_002", 
      severity: "medium",
      type: "card_testing",
      description: "Multiple failed card attempts detected",
      amount: 4320,
      transactions: 24,
      ip: "203.45.67.89",
      location: "Romania",
      timestamp: "2024-01-20 14:25:00",
      status: "blocked",
      riskScore: 78
    },
    {
      id: "alert_003",
      severity: "high",
      type: "stolen_device",
      description: "Payment from device flagged as stolen",
      amount: 2850,
      transactions: 1,
      ip: "45.123.45.67",
      location: "Unknown",
      timestamp: "2024-01-20 14:20:00",
      status: "blocked",
      riskScore: 95
    },
    {
      id: "alert_004",
      severity: "low",
      type: "unusual_pattern",
      description: "Unusual spending pattern detected",
      amount: 850,
      transactions: 3,
      ip: "123.45.67.89",
      location: "United States",
      timestamp: "2024-01-20 14:15:00",
      status: "monitoring",
      riskScore: 45
    }
  ];

  const fraudModels = [
    {
      name: "Velocity Filter",
      version: "v3.2",
      accuracy: 94.5,
      falsePositives: 3.2,
      status: "active",
      detections: 156,
      description: "Detects unusual transaction velocity patterns"
    },
    {
      name: "Device Fingerprinting",
      version: "v2.8",
      accuracy: 97.1,
      falsePositives: 1.8,
      status: "active", 
      detections: 89,
      description: "Identifies suspicious device characteristics"
    },
    {
      name: "Behavioral Analysis",
      version: "v4.1",
      accuracy: 96.3,
      falsePositives: 2.5,
      status: "active",
      detections: 234,
      description: "Analyzes user behavior patterns"
    },
    {
      name: "Geolocation Anomaly",
      version: "v1.9",
      accuracy: 89.7,
      falsePositives: 4.1,
      status: "active",
      detections: 67,
      description: "Detects impossible travel patterns"
    },
    {
      name: "Card BIN Analysis",
      version: "v2.4",
      accuracy: 91.2,
      falsePositives: 3.8,
      status: "training",
      detections: 0,
      description: "Analyzes card issuer patterns"
    }
  ];

  const fraudPatterns = [
    {
      pattern: "Card Testing",
      count: 156,
      amount: 45200,
      percentage: 36.2,
      trend: "increasing"
    },
    {
      pattern: "Account Takeover",
      count: 89,
      amount: 67800,
      percentage: 20.7,
      trend: "stable"
    },
    {
      pattern: "Stolen Cards",
      count: 134,
      amount: 23400,
      percentage: 31.1,
      trend: "decreasing"
    },
    {
      pattern: "Synthetic Identity",
      count: 52,
      amount: 89600,
      percentage: 12.0,
      trend: "increasing"
    }
  ];

  const riskMetrics = [
    { name: "Transaction Volume", current: 87, threshold: 85, status: "warning" },
    { name: "Velocity Score", current: 72, threshold: 80, status: "normal" },
    { name: "Device Trust", current: 94, threshold: 90, status: "normal" },
    { name: "Geographic Risk", current: 45, threshold: 60, status: "normal" },
    { name: "Behavioral Score", current: 91, threshold: 85, status: "warning" }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success";
      case "training": return "text-warning";
      case "inactive": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "blocked": return "bg-destructive text-destructive-foreground";
      case "investigating": return "bg-warning text-warning-foreground";
      case "monitoring": return "bg-primary text-primary-foreground";
      case "resolved": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskStatusColor = (status: string) => {
    switch (status) {
      case "warning": return "text-warning";
      case "normal": return "text-success";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="w-3 h-3 text-destructive" />;
      case "decreasing": return <TrendingUp className="w-3 h-3 text-success rotate-180" />;
      default: return <Activity className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                Fraud Detection & Prevention
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                AI-powered fraud detection protecting your payment ecosystem
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={modelVersion} onValueChange={setModelVersion}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v2.1">v2.1</SelectItem>
                  <SelectItem value="v2.0">v2.0</SelectItem>
                  <SelectItem value="v1.9">v1.9</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fraud Prevented</p>
                  <p className="text-2xl sm:text-3xl font-bold text-success">{stats.fraudPrevented}%</p>
                  <div className="text-sm text-success">+2.3% vs last month</div>
                </div>
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Amount Blocked</p>
                  <p className="text-2xl sm:text-3xl font-bold text-destructive">${(stats.blockedAmount / 1000).toFixed(0)}K</p>
                  <div className="text-sm text-success">Prevented losses</div>
                </div>
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">False Positives</p>
                  <p className="text-2xl sm:text-3xl font-bold text-warning">{stats.falsePositives}%</p>
                  <div className="text-sm text-success">-0.8% improvement</div>
                </div>
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.processingTime}ms</p>
                  <div className="text-sm text-success">Real-time protection</div>
                </div>
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="patterns">Fraud Patterns</TabsTrigger>
            <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
          </TabsList>

          {/* Active Alerts */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Active Fraud Alerts
                </CardTitle>
                <CardDescription>
                  Real-time fraud detection alerts requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertsData.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-l-4" style={{
                      borderLeftColor: alert.severity === "high" ? "rgb(239 68 68)" : 
                                      alert.severity === "medium" ? "rgb(245 158 11)" : "rgb(59 130 246)"
                    }}>
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-3 h-3 rounded-full mt-2",
                          alert.severity === "high" ? "bg-destructive" :
                          alert.severity === "medium" ? "bg-warning" : "bg-primary"
                        )} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{alert.description}</h4>
                            <Badge className={getSeverityBadgeColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Amount:</span> {formatCurrency(alert.amount)}
                            </div>
                            <div>
                              <span className="font-medium">Transactions:</span> {alert.transactions}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span> {alert.location}
                            </div>
                            <div>
                              <span className="font-medium">Risk Score:</span> {alert.riskScore}%
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{alert.timestamp}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadgeColor(alert.status)}>
                          {alert.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Investigate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Models */}
          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Fraud Detection Models
                </CardTitle>
                <CardDescription>
                  Machine learning models powering fraud prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fraudModels.map((model) => (
                    <div key={model.name} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{model.name}</h4>
                          <p className="text-sm text-muted-foreground">{model.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{model.version}</Badge>
                          <Badge className={model.status === "active" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                            {model.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Accuracy</p>
                          <div className="flex items-center gap-2">
                            <Progress value={model.accuracy} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{model.accuracy}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">False Positives</p>
                          <p className="text-lg font-bold">{model.falsePositives}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Detections</p>
                          <p className="text-lg font-bold">{model.detections}</p>
                        </div>
                        <div className="flex items-end">
                          <Button size="sm" variant="outline" disabled={model.status === "training"}>
                            {model.status === "active" ? "Configure" : "Training..."}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Patterns */}
          <TabsContent value="patterns">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Fraud Pattern Analysis
                  </CardTitle>
                  <CardDescription>
                    Common fraud patterns detected in the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fraudPatterns.map((pattern) => (
                      <div key={pattern.pattern} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pattern.pattern}</span>
                            {getTrendIcon(pattern.trend)}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{pattern.count} cases</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(pattern.amount)}</p>
                          </div>
                        </div>
                        <Progress value={pattern.percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{pattern.percentage}% of total fraud</span>
                          <span>{pattern.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Risk Distribution</CardTitle>
                  <CardDescription>
                    Fraud attempts by geographic region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { region: "Eastern Europe", risk: 78, attempts: 156 },
                      { region: "West Africa", risk: 85, attempts: 89 },
                      { region: "Southeast Asia", risk: 45, attempts: 234 },
                      { region: "South America", risk: 52, attempts: 67 },
                      { region: "North America", risk: 12, attempts: 445 }
                    ].map((region) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{region.region}</p>
                          <p className="text-sm text-muted-foreground">{region.attempts} attempts</p>
                        </div>
                        <div className="text-right">
                          <Badge className={region.risk > 60 ? "bg-destructive text-destructive-foreground" : 
                                          region.risk > 30 ? "bg-warning text-warning-foreground" : 
                                          "bg-success text-success-foreground"}>
                            {region.risk}% risk
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Metrics */}
          <TabsContent value="risk">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Real-Time Risk Metrics
                  </CardTitle>
                  <CardDescription>
                    Current risk levels across key fraud indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {riskMetrics.map((metric) => (
                      <div key={metric.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{metric.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-semibold", getRiskStatusColor(metric.status))}>
                              {metric.current}%
                            </span>
                            {metric.current >= metric.threshold ? 
                              <AlertTriangle className="w-4 h-4 text-warning" /> :
                              <CheckCircle className="w-4 h-4 text-success" />
                            }
                          </div>
                        </div>
                        <Progress 
                          value={metric.current} 
                          className={cn(
                            "h-3",
                            metric.current >= metric.threshold && "bg-warning/20"
                          )}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Threshold: {metric.threshold}%</span>
                          <span className={getRiskStatusColor(metric.status)}>
                            {metric.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Performance</CardTitle>
                  <CardDescription>
                    Overall fraud detection system performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-success mb-2">{stats.accuracyRate}%</div>
                      <p className="text-muted-foreground">Overall Accuracy</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <div className="text-2xl font-bold text-success">{stats.flaggedTransactions}</div>
                        <p className="text-sm text-muted-foreground">Transactions Flagged</p>
                      </div>
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{stats.modelsActive}</div>
                        <p className="text-sm text-muted-foreground">Active Models</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Processing Speed</span>
                        <span className="text-sm font-medium">{stats.processingTime}ms avg</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentFraud;
