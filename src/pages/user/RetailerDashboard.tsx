import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Upload,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Package,
  TrendingUp,
  Shield,
  Star,
  Users,
  Download,
  Eye,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Zap,
  Brain,
  Target,
  Activity,
  Cpu,
  Database,
  Network,
  Settings,
  Code,
  Globe,
  Lock,
  BarChart,
  PieChart,
  LineChart,
  TrendingDown,
  AlertTriangle,
  CheckSquare,
  XCircle
} from "lucide-react";

const RetailerDashboard = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [retailerStats, setRetailerStats] = useState({
    devicesRegistered: 0,
    monthlyRegistrations: 0,
    verifiedBadgeStatus: "pending",
    apiUsage: {
      current: 0,
      limit: 10000,
      billingPeriod: "Current Month"
    },
    salesAnalytics: {
      totalSales: 0,
      avgDeviceValue: 0,
      certificatesIssued: 0,
      customerSatisfaction: 0
    }
  });

  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.invoke('retailer-dept-stats');
      if (data) {
        if (data.stats) setRetailerStats(prev => ({ ...prev, ...data.stats }));
        if (data.recentRegistrations) setRecentRegistrations(data.recentRegistrations);
      }
    } catch (error) {
      console.error("Failed to fetch retailer stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFileUpload = async () => {
    if (!csvFile) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Read file content
      const text = await csvFile.text();
      setUploadProgress(30);

      // Upload to bulk import endpoint
      const { data, error } = await apiClient.invoke('bulk-data-import', {
        fileContent: text,
        fileName: csvFile.name,
        type: 'devices'
      });

      setUploadProgress(70);

      if (error) throw error;

      setUploadProgress(100);
      toast({
        title: "Upload Successful!",
        description: `${csvFile.name} has been processed. ${data?.count || 0} devices queued for registration.`,
        variant: "default"
      });

      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error("Upload failed", error);
      toast({
        title: "Upload Failed",
        description: "Could not process the CSV file.",
        variant: "destructive"
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "secondary"; // Green-ish usually
      case "processing": return "secondary"; 
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/retailer-dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-semibold">Retailer Dashboard</span>
              {retailerStats.verifiedBadgeStatus === "approved" && (
                <Badge variant="secondary" className="bg-success/10 text-success">
                  <Shield className="w-3 h-3 mr-1" />
                  STOLEN Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bulk-register">Bulk Register</TabsTrigger>
            <TabsTrigger value="api-access">API Access</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{retailerStats.devicesRegistered.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Devices</div>
                <div className="text-xs text-success flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{retailerStats.monthlyRegistrations} this month
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-success">${retailerStats.salesAnalytics.totalSales.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Monthly Sales</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Avg: ${retailerStats.salesAnalytics.avgDeviceValue}
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">{retailerStats.salesAnalytics.certificatesIssued}</div>
                <div className="text-sm text-muted-foreground">Certificates Issued</div>
                <div className="text-xs text-success flex items-center justify-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  All verified
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                  <Star className="w-6 h-6 fill-current" />
                  {retailerStats.salesAnalytics.customerSatisfaction}
                </div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
                <div className="text-xs text-muted-foreground mt-1">Based on reviews</div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Registrations</h2>
                <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentRegistrations.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No recent registrations found.</div>
                ) : (
                  recentRegistrations.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{batch.batchId || 'Batch #' + batch.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {batch.deviceCount} {batch.deviceType || 'Devices'} • {batch.uploadDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <div className="font-medium">{batch.successRate}% success</div>
                          <Badge variant={getStatusColor(batch.status)} className="text-xs">
                            {batch.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Bulk Register Tab */}
          <TabsContent value="bulk-register" className="space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Bulk Device Registration</h2>
              
              <div className="space-y-6">
                {/* Upload Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csv-upload">Upload CSV File</Label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">
                        {csvFile ? csvFile.name : "Drag and drop your CSV file here, or click to browse"}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('csv-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  {csvFile && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="font-medium mb-2">File Preview: {csvFile.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Expected columns: device_name, brand, model, serial_number, purchase_date, purchase_price
                        </div>
                      </div>

                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Processing...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} />
                        </div>
                      )}

                      <Button 
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? "Processing..." : "Upload and Register Devices"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Download Template */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-primary">Need a template?</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Download our CSV template to ensure your data is formatted correctly.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* API Access Tab & Certificates Tab left as is/static for now */}

          <TabsContent value="api-access" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* API Usage */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">API Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Usage</span>
                      <span>{retailerStats.apiUsage.current.toLocaleString()} / {retailerStats.apiUsage.limit.toLocaleString()}</span>
                    </div>
                    <Progress value={(retailerStats.apiUsage.current / retailerStats.apiUsage.limit) * 100} />
                    <div className="text-xs text-muted-foreground mt-1">
                      Billing period: {retailerStats.apiUsage.billingPeriod}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="font-bold">{(retailerStats.apiUsage.current / retailerStats.apiUsage.limit * 100).toFixed(1)}%</div>
                      <div className="text-muted-foreground">Used</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="font-bold">{(retailerStats.apiUsage.limit - retailerStats.apiUsage.current).toLocaleString()}</div>
                      <div className="text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Upgrade Plan
                  </Button>
                </div>
              </Card>

              {/* API Keys */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Production API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        value="sk_live_****************"
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">POS Receipt Generator</h2>
              {/* Static certificate generator UI */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Customer Email</Label>
                    <Input placeholder="customer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Device Details</Label>
                    <Input placeholder="iPhone 15 Pro Max" />
                  </div>
                  <Button className="w-full">Generate</Button>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Certificate Preview</h3>
                  <div className="border border-border rounded-lg p-4 bg-muted/50">
                    <div className="text-center space-y-2">
                      <Shield className="w-12 h-12 text-primary mx-auto" />
                      <h4 className="font-bold">STOLEN Verified Certificate</h4>
                      <p className="text-sm text-muted-foreground">Preview Mode</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RetailerDashboard;
