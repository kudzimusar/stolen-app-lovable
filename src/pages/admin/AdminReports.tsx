// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Shield, 
  Download, 
  Calendar,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminReports = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [reportType, setReportType] = useState("overview");

  // Mock analytics data - would come from API
  const overviewStats = {
    totalRevenue: 147890,
    revenueGrowth: 12.5,
    totalUsers: 15847,
    userGrowth: 8.2,
    totalTransactions: 45678,
    transactionGrowth: 15.7,
    totalDevices: 89654,
    deviceGrowth: 22.1
  };

  const stakeholderStats = [
    { role: "Individual Users", count: 12456, percentage: 78.6, revenue: 89450, growth: 8.2 },
    { role: "Retailers", count: 1234, percentage: 7.8, revenue: 35670, growth: 15.3 },
    { role: "Repair Shops", count: 876, percentage: 5.5, revenue: 12340, growth: 12.1 },
    { role: "Insurance", count: 456, percentage: 2.9, revenue: 7890, growth: 25.8 },
    { role: "Law Enforcement", count: 234, percentage: 1.5, revenue: 1230, growth: 5.2 },
    { role: "NGO Partners", count: 345, percentage: 2.2, revenue: 890, growth: 18.7 },
    { role: "Payment Gateways", count: 45, percentage: 0.3, revenue: 320, growth: 35.6 },
    { role: "Platform Admins", count: 201, percentage: 1.3, revenue: 100, growth: 2.1 }
  ];

  const deviceStats = [
    { category: "Smartphones", count: 45678, percentage: 50.9, verified: 89.5 },
    { category: "Laptops", count: 23456, percentage: 26.2, verified: 92.1 },
    { category: "Tablets", count: 12345, percentage: 13.8, verified: 87.3 },
    { category: "Smartwatches", count: 5678, percentage: 6.3, verified: 94.2 },
    { category: "Gaming Consoles", count: 2497, percentage: 2.8, verified: 96.8 }
  ];

  const securityMetrics = {
    fraudAttempts: 234,
    fraudPrevented: 98.5,
    suspiciousActivities: 456,
    blockedTransactions: 89,
    verificationSuccess: 94.7,
    falsePositives: 2.3
  };

  const revenueBreakdown = [
    { source: "Marketplace Fees", amount: 89450, percentage: 60.5 },
    { source: "Verification API", amount: 32100, percentage: 21.7 },
    { source: "Premium Features", amount: 15670, percentage: 10.6 },
    { source: "Partnership Revenue", amount: 8890, percentage: 6.0 },
    { source: "Insurance Commissions", value: 1780, percentage: 1.2 }
  ];

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? "text-success" : "text-destructive";
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                Analytics & Reports
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Comprehensive platform analytics and business intelligence
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold">${overviewStats.totalRevenue.toLocaleString()}</p>
                  <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(overviewStats.revenueGrowth))}>
                    {getGrowthIcon(overviewStats.revenueGrowth)}
                    <span>+{overviewStats.revenueGrowth}%</span>
                  </div>
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl sm:text-3xl font-bold">{overviewStats.totalUsers.toLocaleString()}</p>
                  <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(overviewStats.userGrowth))}>
                    {getGrowthIcon(overviewStats.userGrowth)}
                    <span>+{overviewStats.userGrowth}%</span>
                  </div>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl sm:text-3xl font-bold">{overviewStats.totalTransactions.toLocaleString()}</p>
                  <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(overviewStats.transactionGrowth))}>
                    {getGrowthIcon(overviewStats.transactionGrowth)}
                    <span>+{overviewStats.transactionGrowth}%</span>
                  </div>
                </div>
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Devices Registered</p>
                  <p className="text-2xl sm:text-3xl font-bold">{overviewStats.totalDevices.toLocaleString()}</p>
                  <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(overviewStats.deviceGrowth))}>
                    {getGrowthIcon(overviewStats.deviceGrowth)}
                    <span>+{overviewStats.deviceGrowth}%</span>
                  </div>
                </div>
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="stakeholders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Stakeholders Tab */}
          <TabsContent value="stakeholders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Stakeholder Analytics
                </CardTitle>
                <CardDescription>
                  User distribution and performance by stakeholder type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stakeholderStats.map((stakeholder) => (
                    <div key={stakeholder.role} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{stakeholder.role}</h4>
                          <p className="text-sm text-muted-foreground">
                            {stakeholder.count.toLocaleString()} users ({stakeholder.percentage}%)
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">${stakeholder.revenue.toLocaleString()}</p>
                        <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(stakeholder.growth))}>
                          {getGrowthIcon(stakeholder.growth)}
                          <span>+{stakeholder.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Device Categories
                  </CardTitle>
                  <CardDescription>
                    Device registration by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deviceStats.map((device) => (
                      <div key={device.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{device.category}</span>
                          <span className="text-sm text-muted-foreground">
                            {device.count.toLocaleString()} ({device.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Verified: {device.verified}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Verification Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-success/10 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold text-success">94.7%</p>
                        <p className="text-sm text-muted-foreground">Verification Success</p>
                      </div>
                      <div className="text-center p-4 bg-warning/10 rounded-lg">
                        <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
                        <p className="text-2xl font-bold text-warning">2.3 min</p>
                        <p className="text-sm text-muted-foreground">Avg. Verification Time</p>
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <Database className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">99.2%</p>
                      <p className="text-sm text-muted-foreground">API Reliability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Metrics
                  </CardTitle>
                  <CardDescription>
                    Platform security and fraud prevention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-destructive/10 rounded-lg">
                        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                        <p className="text-2xl font-bold text-destructive">{securityMetrics.fraudAttempts}</p>
                        <p className="text-sm text-muted-foreground">Fraud Attempts</p>
                      </div>
                      <div className="text-center p-4 bg-success/10 rounded-lg">
                        <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold text-success">{securityMetrics.fraudPrevented}%</p>
                        <p className="text-sm text-muted-foreground">Fraud Prevented</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Suspicious Activities Detected</span>
                        <Badge variant="outline">{securityMetrics.suspiciousActivities}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Blocked Transactions</span>
                        <Badge variant="outline">{securityMetrics.blockedTransactions}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Verification Success Rate</span>
                        <Badge className="bg-success text-success-foreground">{securityMetrics.verificationSuccess}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>False Positive Rate</span>
                        <Badge variant="outline">{securityMetrics.falsePositives}%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Trends</CardTitle>
                  <CardDescription>
                    Monthly security incidents and resolutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">Security trends chart would go here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Breakdown
                  </CardTitle>
                  <CardDescription>
                    Revenue sources and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueBreakdown.map((source) => (
                      <div key={source.source} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{source.source}</span>
                          <span className="text-sm">
                            ${source.amount.toLocaleString()} ({source.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>
                    Monthly revenue growth and projections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">Revenue trends chart would go here</p>
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

export default AdminReports;