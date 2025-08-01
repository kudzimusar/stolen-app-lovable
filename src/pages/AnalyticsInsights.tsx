import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Download, AlertTriangle, Shield, Users, MapPin } from "lucide-react";

const AnalyticsInsights = () => {
  const { toast } = useToast();

  const theftTrendsData = [
    { month: 'Jan', thefts: 45, recoveries: 32 },
    { month: 'Feb', thefts: 52, recoveries: 38 },
    { month: 'Mar', thefts: 38, recoveries: 41 },
    { month: 'Apr', thefts: 67, recoveries: 45 },
    { month: 'May', thefts: 59, recoveries: 52 },
    { month: 'Jun', thefts: 43, recoveries: 48 }
  ];

  const deviceTypesData = [
    { name: 'Smartphones', value: 45, color: '#8884d8' },
    { name: 'Laptops', value: 30, color: '#82ca9d' },
    { name: 'Tablets', value: 15, color: '#ffc658' },
    { name: 'Others', value: 10, color: '#ff7300' }
  ];

  const locationData = [
    { location: 'San Francisco', reports: 89, recoveries: 67 },
    { location: 'Los Angeles', reports: 76, recoveries: 54 },
    { location: 'New York', reports: 92, recoveries: 71 },
    { location: 'Chicago', reports: 45, recoveries: 32 },
    { location: 'Miami', reports: 38, recoveries: 28 }
  ];

  const fraudMetrics = [
    { metric: 'Fraud Detection Rate', value: '94.7%', trend: 'up', change: '+2.3%' },
    { metric: 'False Positives', value: '3.2%', trend: 'down', change: '-0.8%' },
    { metric: 'Response Time', value: '2.4h', trend: 'down', change: '-0.6h' },
    { metric: 'Claims Processed', value: '1,247', trend: 'up', change: '+156' }
  ];

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated and is ready for download.`
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
            <p className="text-muted-foreground">Data-driven insights for law enforcement and stakeholders</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExportReport('Monthly')}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="theft">Theft Trends</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Analysis</TabsTrigger>
            <TabsTrigger value="recovery">Recovery Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reports</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recoveries</p>
                      <p className="text-2xl font-bold">856</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+18% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recovery Rate</p>
                      <p className="text-2xl font-bold">68.6%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+5.2% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">12,456</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8% this month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Device Types Reported</CardTitle>
                  <CardDescription>Distribution of reported stolen devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceTypesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Theft reports vs recoveries over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={theftTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="thefts" stroke="#ef4444" strokeWidth={2} name="Thefts" />
                      <Line type="monotone" dataKey="recoveries" stroke="#10b981" strokeWidth={2} name="Recoveries" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="theft" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Theft Reports by Location</span>
                </CardTitle>
                <CardDescription>Geographic distribution of theft reports and recovery rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reports" fill="#ef4444" name="Reports" />
                    <Bar dataKey="recoveries" fill="#10b981" name="Recoveries" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hot Spots Analysis</CardTitle>
                  <CardDescription>Areas with highest theft activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locationData.slice(0, 3).map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{location.location}</h4>
                          <p className="text-sm text-muted-foreground">
                            {location.reports} reports • {((location.recoveries / location.reports) * 100).toFixed(1)}% recovery rate
                          </p>
                        </div>
                        <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Patterns</CardTitle>
                  <CardDescription>When thefts are most likely to occur</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Peak Hours</span>
                        <span className="font-medium">2PM - 6PM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Peak Days</span>
                        <span className="font-medium">Friday - Sunday</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Most Targeted</span>
                        <span className="font-medium">Public Transport</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fraud" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fraudMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{metric.metric}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <div className="flex items-center">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Fraud Detection Performance</CardTitle>
                <CardDescription>Model accuracy and prediction confidence over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={theftTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="thefts" stroke="#8884d8" strokeWidth={2} name="Detection Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recovery Success Metrics</CardTitle>
                <CardDescription>Track the effectiveness of recovery efforts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Recovery Time</p>
                    <p className="text-2xl font-bold">4.2 days</p>
                    <p className="text-sm text-green-600">-0.8 days from last month</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Community Contributions</p>
                    <p className="text-2xl font-bold">67%</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Law Enforcement Recovery</p>
                    <p className="text-2xl font-bold">33%</p>
                    <p className="text-sm text-blue-600">Official channels</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Methods</CardTitle>
                <CardDescription>How devices are being recovered</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { method: 'Community Tips', count: 234 },
                    { method: 'Police Recovery', count: 156 },
                    { method: 'Anonymous Reports', count: 189 },
                    { method: 'Marketplace Detection', count: 98 },
                    { method: 'Direct Contact', count: 67 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsInsights;