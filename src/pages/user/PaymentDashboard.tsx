import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield,
  Activity,
  BarChart3,
  Users,
  Globe,
  Zap,
  RefreshCw,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

const PaymentDashboard = () => {
  const [timeRange, setTimeRange] = useState("24h");

  // Mock payment data - would come from API
  const stats = {
    totalVolume: 2847350,
    volumeGrowth: 15.2,
    totalTransactions: 12456,
    transactionGrowth: 8.7,
    successRate: 99.2,
    fraudPrevented: 98.5,
    averageTicket: 228.65,
    activeGateways: 5,
    processingTime: 145,
    uptime: 99.9
  };

  const recentTransactions = [
    {
      id: "txn_123456",
      type: "marketplace_sale",
      amount: 450.00,
      currency: "USD",
      status: "completed",
      timestamp: "2024-01-20 14:30 PST",
      gateway: "PayPal",
      risk: "low"
    },
    {
      id: "txn_123457",
      type: "escrow_release",
      amount: 1250.00,
      currency: "USD", 
      status: "pending",
      timestamp: "2024-01-20 14:25 PST",
      gateway: "Stripe",
      risk: "low"
    },
    {
      id: "txn_123458",
      type: "device_registration",
      amount: 25.00,
      currency: "EUR",
      status: "completed",
      timestamp: "2024-01-20 14:20 PST",
      gateway: "Stripe",
      risk: "low"
    },
    {
      id: "txn_123459",
      type: "marketplace_sale",
      amount: 875.00,
      currency: "USD",
      status: "flagged",
      timestamp: "2024-01-20 14:15 PST",
      gateway: "PayPal",
      risk: "high"
    },
    {
      id: "txn_123460",
      type: "insurance_premium",
      amount: 89.99,
      currency: "GBP",
      status: "completed",
      timestamp: "2024-01-20 14:10 PST",
      gateway: "Stripe",
      risk: "low"
    }
  ];

  const gateways = [
    {
      name: "PayPal",
      status: "operational",
      volume: 1250000,
      transactions: 5234,
      successRate: 99.1,
      fees: 2.9
    },
    {
      name: "Stripe",
      status: "operational", 
      volume: 980000,
      transactions: 4567,
      successRate: 99.4,
      fees: 2.7
    },
    {
      name: "Apple Pay",
      status: "operational",
      volume: 456000,
      transactions: 2890,
      successRate: 99.8,
      fees: 3.1
    },
    {
      name: "Google Pay",
      status: "operational",
      volume: 145000,
      transactions: 1234,
      successRate: 99.2,
      fees: 2.8
    },
    {
      name: "Bank Transfer",
      status: "degraded",
      volume: 16350,
      transactions: 531,
      successRate: 97.8,
      fees: 1.5
    }
  ];

  const currencies = [
    { code: "USD", volume: 1850000, percentage: 65.0, rate: 1.0 },
    { code: "EUR", volume: 569000, percentage: 20.0, rate: 0.85 },
    { code: "GBP", volume: 284500, percentage: 10.0, rate: 0.75 },
    { code: "CAD", volume: 113800, percentage: 4.0, rate: 1.35 },
    { code: "AUD", volume: 28450, percentage: 1.0, rate: 1.55 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "pending": return "text-warning";
      case "flagged": return "text-destructive";
      case "failed": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "flagged": return "bg-destructive text-destructive-foreground";
      case "failed": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getGatewayStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-success";
      case "degraded": return "text-warning";
      case "down": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
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
                Payment Gateway Dashboard
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Monitor payment processing, fraud detection, and gateway performance
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
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-5 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Volume</p>
                  <p className="text-xl sm:text-2xl font-bold">${stats.totalVolume.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-sm text-success">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{stats.volumeGrowth}%</span>
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
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-sm text-success">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{stats.transactionGrowth}%</span>
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
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.successRate}%</p>
                  <div className="text-sm text-success">Excellent</div>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fraud Blocked</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.fraudPrevented}%</p>
                  <div className="text-sm text-success">Protected</div>
                </div>
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Processing</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.processingTime}ms</p>
                  <div className="text-sm text-success">Fast</div>
                </div>
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Gateway Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Gateway Status
              </CardTitle>
              <CardDescription>
                Real-time status and performance of all payment gateways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gateways.map((gateway) => (
                  <div key={gateway.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        gateway.status === "operational" ? "bg-success" :
                        gateway.status === "degraded" ? "bg-warning" : "bg-destructive"
                      )} />
                      <div>
                        <h4 className="font-semibold">{gateway.name}</h4>
                        <p className={cn("text-sm", getGatewayStatusColor(gateway.status))}>
                          {gateway.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-semibold">${(gateway.volume / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-semibold">{gateway.transactions.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-semibold">{gateway.successRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Fees</p>
                        <p className="font-semibold">{gateway.fees}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Multi-Currency Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Multi-Currency Processing
              </CardTitle>
              <CardDescription>
                Global currency distribution and exchange rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currencies.map((currency) => (
                  <div key={currency.code} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{currency.code}</span>
                        <Badge variant="outline" className="text-xs">
                          {currency.rate.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${(currency.volume / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">{currency.percentage}%</p>
                      </div>
                    </div>
                    <Progress value={currency.percentage} className="h-2" />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-3 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Exchange Rate API</h4>
                <p className="text-xs text-muted-foreground">
                  Real-time rates updated every 60 seconds via multiple providers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Latest payment processing activity and fraud detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        transaction.status === "completed" ? "bg-success" :
                        transaction.status === "pending" ? "bg-warning" : "bg-destructive"
                      )} />
                      <div>
                        <h4 className="font-semibold text-sm">{transaction.id}</h4>
                        <p className="text-xs text-muted-foreground">
                          {transaction.type.replace('_', ' ')} • {transaction.gateway}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <Badge variant="outline" className={getRiskColor(transaction.risk)}>
                        {transaction.risk} risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-xs">Fraud Detection</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Download className="w-5 h-5" />
              <span className="text-xs">Export Data</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-xs">Disputes</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-xs">Currency Settings</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs">Alerts</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;