import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  CreditCard, 
  Globe, 
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  Activity,
  Target,
  Users,
  Clock,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const PaymentAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [reportType, setReportType] = useState("overview");

  // Mock analytics data - would come from API
  const overviewStats = {
    totalVolume: 5847350,
    volumeGrowth: 18.5,
    totalTransactions: 45678,
    transactionGrowth: 12.3,
    averageTicket: 128.09,
    ticketGrowth: 5.2,
    successRate: 99.3,
    conversionRate: 94.7,
    chargebackRate: 0.8,
    refundRate: 2.1
  };

  const gatewayPerformance = [
    {
      name: "PayPal",
      volume: 2250000,
      percentage: 38.5,
      transactions: 18456,
      successRate: 99.1,
      avgTime: 145,
      fees: 2.9,
      growth: 15.2
    },
    {
      name: "Stripe",
      volume: 1850000,
      percentage: 31.6,
      transactions: 15234,
      successRate: 99.4,
      avgTime: 128,
      fees: 2.7,
      growth: 22.1
    },
    {
      name: "Apple Pay",
      volume: 980000,
      percentage: 16.8,
      transactions: 8901,
      successRate: 99.8,
      avgTime: 95,
      fees: 3.1,
      growth: 8.7
    },
    {
      name: "Google Pay",
      percentage: 8.5,
      volume: 497500,
      transactions: 2456,
      successRate: 99.2,
      avgTime: 112,
      fees: 2.8,
      growth: 25.3
    },
    {
      name: "Bank Transfer",
      volume: 269850,
      percentage: 4.6,
      transactions: 631,
      successRate: 97.8,
      avgTime: 2850,
      fees: 1.5,
      growth: -5.2
    }
  ];

  const transactionTypes = [
    { type: "Marketplace Sales", volume: 2450000, count: 15678, percentage: 41.9, growth: 18.5 },
    { type: "Device Registration", volume: 890000, count: 35600, percentage: 15.2, growth: 12.1 },
    { type: "Insurance Premiums", volume: 1250000, count: 8934, percentage: 21.4, growth: 25.3 },
    { type: "Escrow Deposits", volume: 780000, count: 2890, percentage: 13.3, growth: 8.7 },
    { type: "API Subscriptions", volume: 477350, count: 1576, percentage: 8.2, growth: 45.6 }
  ];

  const geographicData = [
    { region: "North America", volume: 2950000, percentage: 50.5, transactions: 23456, growth: 15.2 },
    { region: "Europe", volume: 1754250, percentage: 30.0, transactions: 14567, growth: 22.1 },
    { region: "Asia Pacific", volume: 701400, percentage: 12.0, transactions: 6789, growth: 35.6 },
    { region: "Latin America", volume: 292470, percentage: 5.0, transactions: 2890, growth: 18.9 },
    { region: "Africa", volume: 146235, percentage: 2.5, transactions: 1123, growth: 45.3 }
  ];

  const currencyBreakdown = [
    { code: "USD", volume: 3802775, percentage: 65.0, rate: 1.0, growth: 15.2 },
    { code: "EUR", volume: 1169470, percentage: 20.0, rate: 0.85, growth: 18.7 },
    { code: "GBP", volume: 584735, percentage: 10.0, rate: 0.75, growth: 12.3 },
    { code: "CAD", volume: 233894, percentage: 4.0, rate: 1.35, growth: 22.1 },
    { code: "AUD", volume: 58474, percentage: 1.0, rate: 1.55, growth: 8.9 }
  ];

  const performanceMetrics = [
    {
      metric: "Average Processing Time",
      value: "132ms",
      trend: "down",
      change: "-15ms",
      target: "< 150ms",
      status: "good"
    },
    {
      metric: "Success Rate",
      value: "99.3%",
      trend: "up", 
      change: "+0.2%",
      target: "> 99%",
      status: "excellent"
    },
    {
      metric: "Failed Transactions",
      value: "0.7%",
      trend: "down",
      change: "-0.1%",
      target: "< 1%",
      status: "good"
    },
    {
      metric: "Chargeback Rate",
      value: "0.8%",
      trend: "stable",
      change: "0.0%",
      target: "< 1%",
      status: "good"
    },
    {
      metric: "Customer Disputes",
      value: "2.1%",
      trend: "down",
      change: "-0.3%",
      target: "< 3%",
      status: "good"
    },
    {
      metric: "Authorization Rate",
      value: "94.7%",
      trend: "up",
      change: "+1.2%",
      target: "> 90%",
      status: "excellent"
    }
  ];

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-3 h-3 text-success" />;
    if (growth < 0) return <TrendingDown className="w-3 h-3 text-destructive" />;
    return <Activity className="w-3 h-3 text-muted-foreground" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-success";
    if (growth < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-success";
      case "good": return "text-primary";
      case "warning": return "text-warning";
      case "poor": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-3 h-3 text-success" />;
      case "down": return <TrendingDown className="w-3 h-3 text-success" />;
      default: return <Activity className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
                Payment Analytics
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Comprehensive insights into payment performance and trends
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
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
              
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-5 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-xl sm:text-2xl font-bold">{formatCurrency(overviewStats.totalVolume)}</p>
                  <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(overviewStats.volumeGrowth))}>
                    {getGrowthIcon(overviewStats.volumeGrowth)}
                    <span>+{overviewStats.volumeGrowth}%</span>
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
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl sm:text-2xl font-bold">{overviewStats.totalTransactions.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Avg. Ticket</p>
                  <p className="text-xl sm:text-2xl font-bold">${overviewStats.averageTicket.toFixed(0)}</p>
                  <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(overviewStats.ticketGrowth))}>
                    {getGrowthIcon(overviewStats.ticketGrowth)}
                    <span>+{overviewStats.ticketGrowth}%</span>
                  </div>
                </div>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-xl sm:text-2xl font-bold">{overviewStats.successRate}%</p>
                  <div className="text-sm text-success">Excellent</div>
                </div>
                <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="text-xl sm:text-2xl font-bold">{overviewStats.conversionRate}%</p>
                  <div className="text-sm text-success">High Converting</div>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="gateways" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="gateways">Gateways</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="currency">Currency</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Gateway Performance */}
          <TabsContent value="gateways">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Gateway Performance
                </CardTitle>
                <CardDescription>
                  Comparative analysis of payment gateway performance and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {gatewayPerformance.map((gateway) => (
                    <div key={gateway.name} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{gateway.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(gateway.volume)} • {gateway.transactions.toLocaleString()} transactions
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{gateway.percentage}%</div>
                          <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(gateway.growth))}>
                            {getGrowthIcon(gateway.growth)}
                            <span>{gateway.growth > 0 ? '+' : ''}{gateway.growth}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <Progress value={gateway.percentage} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-semibold">{gateway.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg. Time</p>
                          <p className="font-semibold">{gateway.avgTime}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fee Rate</p>
                          <p className="font-semibold">{gateway.fees}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Growth</p>
                          <p className={cn("font-semibold", getGrowthColor(gateway.growth))}>
                            {gateway.growth > 0 ? '+' : ''}{gateway.growth}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction Types */}
          <TabsContent value="transactions">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Transaction Types
                  </CardTitle>
                  <CardDescription>
                    Breakdown by transaction category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactionTypes.map((type) => (
                      <div key={type.type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{type.type}</span>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatCurrency(type.volume)}</p>
                            <p className="text-xs text-muted-foreground">{type.count.toLocaleString()} txns</p>
                          </div>
                        </div>
                        <Progress value={type.percentage} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{type.percentage}% of volume</span>
                          <span className={getGrowthColor(type.growth)}>
                            {type.growth > 0 ? '+' : ''}{type.growth}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Trends</CardTitle>
                  <CardDescription>
                    Volume and count trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">Transaction trends chart would go here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geographic Analysis */}
          <TabsContent value="geography">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription>
                    Payment volume by geographic region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geographicData.map((region) => (
                      <div key={region.region} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{region.region}</span>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatCurrency(region.volume)}</p>
                            <p className="text-xs text-muted-foreground">{region.transactions.toLocaleString()} txns</p>
                          </div>
                        </div>
                        <Progress value={region.percentage} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{region.percentage}% of volume</span>
                          <span className={getGrowthColor(region.growth)}>
                            {region.growth > 0 ? '+' : ''}{region.growth}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Growth</CardTitle>
                  <CardDescription>
                    Growth rate by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geographicData
                      .sort((a, b) => b.growth - a.growth)
                      .map((region) => (
                        <div key={region.region} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="font-medium">{region.region}</span>
                          <div className="flex items-center gap-2">
                            {getGrowthIcon(region.growth)}
                            <span className={cn("font-semibold", getGrowthColor(region.growth))}>
                              {region.growth > 0 ? '+' : ''}{region.growth}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Currency Analysis */}
          <TabsContent value="currency">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Multi-Currency Analytics
                </CardTitle>
                <CardDescription>
                  Payment volume and trends by currency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    {currencyBreakdown.map((currency) => (
                      <div key={currency.code} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{currency.code}</span>
                            <Badge variant="outline" className="text-xs">
                              {currency.rate !== 1.0 ? currency.rate.toFixed(2) : '1.00'}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatCurrency(currency.volume)}</p>
                            <p className="text-xs text-muted-foreground">{currency.percentage}%</p>
                          </div>
                        </div>
                        <Progress value={currency.percentage} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Exchange rate: {currency.rate}</span>
                          <span className={getGrowthColor(currency.growth)}>
                            {currency.growth > 0 ? '+' : ''}{currency.growth}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <h4 className="font-semibold mb-2">Currency Insights</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• USD dominates with 65% of total volume</li>
                        <li>• EUR showing strong 18.7% growth</li>
                        <li>• CAD experiencing highest growth at 22.1%</li>
                        <li>• Real-time rates updated every 60 seconds</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Exchange Rate API</h4>
                      <p className="text-sm text-muted-foreground">
                        Powered by multiple exchange rate providers with automatic failover
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Metrics */}
          <TabsContent value="performance">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Key performance indicators and benchmarks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric) => (
                      <div key={metric.metric} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{metric.metric}</p>
                          <p className="text-sm text-muted-foreground">Target: {metric.target}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-lg font-bold", getStatusColor(metric.status))}>
                              {metric.value}
                            </span>
                            {getTrendIcon(metric.trend)}
                          </div>
                          <p className="text-sm text-muted-foreground">{metric.change}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Historical performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">Performance trends chart would go here</p>
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

export default PaymentAnalytics;
