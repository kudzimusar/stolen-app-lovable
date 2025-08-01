import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  Filter
} from "lucide-react";

const RetailerDashboard = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Mock retailer data
  const retailerStats = {
    devicesRegistered: 15423,
    monthlyRegistrations: 1247,
    verifiedBadgeStatus: "approved",
    apiUsage: {
      current: 8750,
      limit: 10000,
      billingPeriod: "January 2025"
    },
    salesAnalytics: {
      totalSales: 50000,
      avgDeviceValue: 425,
      certificatesIssued: 2156,
      customerSatisfaction: 4.8
    }
  };

  // Mock recent registrations
  const recentRegistrations = [
    {
      id: 1,
      batchId: "BATCH-2025-001",
      deviceCount: 250,
      status: "completed",
      uploadDate: "2025-01-20",
      deviceType: "Smartphones",
      successRate: 100
    },
    {
      id: 2,
      batchId: "BATCH-2025-002", 
      deviceCount: 150,
      status: "processing",
      uploadDate: "2025-01-20",
      deviceType: "Laptops",
      successRate: 95
    },
    {
      id: 3,
      batchId: "BATCH-2025-003",
      deviceCount: 75,
      status: "failed",
      uploadDate: "2025-01-19",
      deviceType: "Tablets",
      successRate: 0
    }
  ];

  // Mock API logs
  const apiLogs = [
    {
      timestamp: "2025-01-20 14:30:00",
      endpoint: "/api/devices/register",
      method: "POST",
      status: 200,
      responseTime: 125,
      requests: 45
    },
    {
      timestamp: "2025-01-20 14:25:00",
      endpoint: "/api/certificates/issue",
      method: "POST", 
      status: 200,
      responseTime: 89,
      requests: 12
    },
    {
      timestamp: "2025-01-20 14:20:00",
      endpoint: "/api/devices/bulk-upload",
      method: "POST",
      status: 201,
      responseTime: 2340,
      requests: 1
    }
  ];

  const handleFileUpload = async () => {
    if (!csvFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload Successful!",
            description: `${csvFile.name} has been processed. 250 devices registered.`,
            variant: "default"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "secondary";
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
              <Link to="/dashboard">
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
                <div className="text-xs text-muted-foreground mt-1">Based on 1,250 reviews</div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Registrations</h2>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentRegistrations.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{batch.batchId}</div>
                      <div className="text-sm text-muted-foreground">
                        {batch.deviceCount} {batch.deviceType} • {batch.uploadDate}
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
                ))}
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

          {/* API Access Tab */}
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
                      <div className="font-bold">87.5%</div>
                      <div className="text-muted-foreground">Used</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="font-bold">1,250</div>
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
                        value="sk_live_1234567890abcdef" 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Test API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        value="sk_test_abcdef1234567890" 
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

            {/* API Logs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent API Activity</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {apiLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 text-sm border border-border rounded">
                    <div className="space-y-1">
                      <div className="font-mono">{log.method} {log.endpoint}</div>
                      <div className="text-muted-foreground">{log.timestamp}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === 200 || log.status === 201 ? "secondary" : "destructive"}>
                          {log.status}
                        </Badge>
                        <span className="text-muted-foreground">{log.responseTime}ms</span>
                      </div>
                      <div className="text-muted-foreground">{log.requests} requests</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">POS Receipt Generator</h2>
              
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Serial Number</Label>
                      <Input placeholder="ABC123456789" />
                    </div>
                    <div className="space-y-2">
                      <Label>Sale Price</Label>
                      <Input placeholder="899.99" type="number" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Receipt Image</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Upload receipt image</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Generate & Email Certificate
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Certificate Preview</h3>
                  <div className="border border-border rounded-lg p-4 bg-muted/50">
                    <div className="text-center space-y-2">
                      <Shield className="w-12 h-12 text-primary mx-auto" />
                      <h4 className="font-bold">STOLEN Verified Certificate</h4>
                      <p className="text-sm text-muted-foreground">
                        This device has been registered and verified on the STOLEN blockchain platform.
                      </p>
                      <div className="mt-4 space-y-1 text-xs">
                        <div>Certificate ID: CERT-2025-001234</div>
                        <div>Blockchain Hash: 0x1234...abcd</div>
                        <div>Issue Date: January 20, 2025</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Certificates are blockchain-anchored and tamper-proof. 
                    They provide verifiable proof of legitimate purchase and ownership.
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