import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/AppHeader";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Wrench,
  Users,
  Star,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Filter
} from "lucide-react";

const RepairAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30");

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalRevenue: 24580,
      revenueGrowth: 12.5,
      repairsCompleted: 156,
      repairsGrowth: 8.3,
      avgRepairTime: 2.4,
      timeReduction: -15.2,
      customerSatisfaction: 4.8,
      satisfactionChange: 0.3
    },
    monthlyStats: [
      { month: "Jan", revenue: 18500, repairs: 120, avgRating: 4.6 },
      { month: "Feb", revenue: 21200, repairs: 138, avgRating: 4.7 },
      { month: "Mar", revenue: 24580, repairs: 156, avgRating: 4.8 },
    ],
    repairTypes: [
      { type: "Screen Replacement", count: 45, revenue: 9000, percentage: 28.8 },
      { type: "Battery Replacement", count: 38, revenue: 5700, percentage: 24.4 },
      { type: "Water Damage", count: 22, revenue: 6600, percentage: 14.1 },
      { type: "Charging Port", count: 28, revenue: 4200, percentage: 17.9 },
      { type: "Camera Repair", count: 15, revenue: 3750, percentage: 9.6 },
      { type: "Other", count: 8, revenue: 1600, percentage: 5.1 }
    ],
    customerStats: {
      newCustomers: 45,
      returningCustomers: 111,
      customerRetentionRate: 71.2
    },
    topDevices: [
      { brand: "iPhone", model: "13 Pro", count: 32, avgPrice: 185 },
      { brand: "Samsung", model: "Galaxy S22", count: 28, avgPrice: 145 },
      { brand: "iPhone", model: "12", count: 24, avgPrice: 165 },
      { brand: "Google", model: "Pixel 7", count: 18, avgPrice: 125 },
      { brand: "iPhone", model: "14", count: 16, avgPrice: 195 }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Repair Analytics & Insights</h1>
            <p className="text-muted-foreground">Track your repair shop performance and identify growth opportunities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <select 
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <Badge variant={analyticsData.overview.revenueGrowth > 0 ? "default" : "destructive"} className="text-xs">
                {analyticsData.overview.revenueGrowth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(analyticsData.overview.revenueGrowth)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(analyticsData.overview.totalRevenue)}</h3>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <Wrench className="w-6 h-6 text-success" />
              </div>
              <Badge variant="default" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {analyticsData.overview.repairsGrowth}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{analyticsData.overview.repairsCompleted}</h3>
            <p className="text-sm text-muted-foreground">Repairs Completed</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <Badge variant="default" className="text-xs">
                <TrendingDown className="w-3 h-3 mr-1" />
                {Math.abs(analyticsData.overview.timeReduction)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{analyticsData.overview.avgRepairTime}h</h3>
            <p className="text-sm text-muted-foreground">Avg Repair Time</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-brand-purple/10 rounded-lg">
                <Star className="w-6 h-6 text-brand-purple" />
              </div>
              <Badge variant="default" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {analyticsData.overview.satisfactionChange}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{analyticsData.overview.customerSatisfaction}</h3>
            <p className="text-sm text-muted-foreground">Customer Rating</p>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {analyticsData.monthlyStats.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(month.revenue / 25000) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{formatCurrency(month.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Repair Types Breakdown */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Repair Types</h3>
              <PieChart className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {analyticsData.repairTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{type.type}</span>
                      <span className="text-xs text-muted-foreground">{type.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-foreground">{type.count}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(type.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Customer Insights */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Customer Insights</h3>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">New Customers</p>
                  <p className="text-xl font-bold text-foreground">{analyticsData.customerStats.newCustomers}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Returning</p>
                  <p className="text-xl font-bold text-foreground">{analyticsData.customerStats.returningCustomers}</p>
                </div>
              </div>
              <div className="p-3 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Customer Retention Rate</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full"
                      style={{ width: `${analyticsData.customerStats.customerRetentionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground">{analyticsData.customerStats.customerRetentionRate}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Devices */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Most Repaired Devices</h3>
              <Award className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {analyticsData.topDevices.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{device.brand} {device.model}</p>
                    <p className="text-sm text-muted-foreground">{device.count} repairs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(device.avgPrice)}</p>
                    <p className="text-sm text-muted-foreground">avg price</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Goals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Performance Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue Target</span>
                <span className="text-sm font-medium text-foreground">R30,000</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full" style={{ width: '82%' }} />
              </div>
              <span className="text-xs text-muted-foreground">82% achieved (R24,580)</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Repair Target</span>
                <span className="text-sm font-medium text-foreground">200 repairs</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-success h-3 rounded-full" style={{ width: '78%' }} />
              </div>
              <span className="text-xs text-muted-foreground">78% achieved (156 repairs)</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Satisfaction Target</span>
                <span className="text-sm font-medium text-foreground">4.9 stars</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-brand-purple h-3 rounded-full" style={{ width: '98%' }} />
              </div>
              <span className="text-xs text-muted-foreground">98% achieved (4.8 stars)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RepairAnalytics;