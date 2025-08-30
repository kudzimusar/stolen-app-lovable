import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Search,
  Shield,
  Clock,
  User,
  AlertTriangle,
  Share2,
  Flag,
  QrCode,
  Camera,
  FileImage,
  Zap,
  TrendingUp,
  Award,
  Download,
  Copy,
  Check,
  Globe,
  Database,
  Lock,
  Brain,
  Cpu,
  BarChart3,
  Activity,
  Target,
  Bot,
  Upload,
  FileText,
  Smartphone,
  Code,
  Settings,
  Eye,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Play,
  Pause,
  Stop,
  RefreshCw
} from "lucide-react";

const ReverseVerifyEnhanced = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkData, setBulkData] = useState("");
  const [verificationStep, setVerificationStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [sdkStatus, setSdkStatus] = useState("disconnected");
  const { toast } = useToast();

  // Enhanced verification stats
  const stats = {
    totalVerifications: 125847,
    successRate: 98.5,
    avgResponseTime: "0.8s",
    fraudDetected: 2341,
    blockchainQueries: 89234,
    aiAccuracy: 99.2,
    // Bulk processing stats
    bulkProcessed: 15678,
    bulkSuccessRate: 97.8,
    avgBulkTime: "2.3s",
    // Analytics stats
    patternMatches: 8923,
    anomalyDetected: 456,
    mlPredictions: 23456,
    // Mobile SDK stats
    sdkDownloads: 1234,
    sdkActiveUsers: 892,
    sdkVerifications: 45678
  };

  // Bulk verification queue
  const bulkQueue = [
    { id: "BULK-001", status: "processing", progress: 75, total: 100, completed: 75 },
    { id: "BULK-002", status: "queued", progress: 0, total: 50, completed: 0 },
    { id: "BULK-003", status: "completed", progress: 100, total: 200, completed: 200 }
  ];

  // AI Analytics Data
  const analyticsData = {
    verificationPatterns: [
      { pattern: "Multiple Device Claims", count: 234, risk: "high" },
      { pattern: "Location Anomalies", count: 156, risk: "medium" },
      { pattern: "Time-based Patterns", count: 89, risk: "low" },
      { pattern: "Device History Gaps", count: 67, risk: "medium" }
    ],
    fraudTrends: [
      { month: "Jan", fraudRate: 2.1, verifications: 1234 },
      { month: "Feb", fraudRate: 1.8, verifications: 1456 },
      { month: "Mar", fraudRate: 2.3, verifications: 1678 },
      { month: "Apr", fraudRate: 1.9, verifications: 1890 }
    ],
    mlPredictions: [
      { prediction: "High Risk Device", confidence: 94.2, action: "Manual Review" },
      { prediction: "Legitimate Owner", confidence: 98.7, action: "Auto Approve" },
      { prediction: "Suspicious Pattern", confidence: 87.3, action: "Flag for Review" }
    ]
  };

  // Mobile SDK Integration Status
  const sdkStatuses = [
    { platform: "iOS", version: "2.1.0", status: "active", users: 456, verifications: 12345 },
    { platform: "Android", version: "2.0.8", status: "active", users: 436, verifications: 11890 },
    { platform: "React Native", version: "1.9.5", status: "beta", users: 89, verifications: 2345 },
    { platform: "Flutter", version: "1.8.2", status: "alpha", users: 23, verifications: 678 }
  ];

  // Mock device data for single verification
  const mockDevice = {
    id: "DEV-12345",
    type: "iPhone 15 Pro",
    serialNumber: "F17KQ2X1N5M8",
    imei: "123456789012345",
    status: "verified",
    owner: "John Doe",
    registrationDate: "2024-01-15",
    lastSeen: "2024-01-20",
    location: "New York, NY",
    riskScore: 12,
    blockchainHash: "0x1234567890abcdef...",
    verificationHistory: [
      { date: "2024-01-20", result: "verified", confidence: 98.5 },
      { date: "2024-01-18", result: "verified", confidence: 97.2 },
      { date: "2024-01-15", result: "verified", confidence: 96.8 }
    ]
  };

  // Mock API response
  const mockApiResponse = {
    success: true,
    data: mockDevice,
    processingTime: "0.8s",
    aiConfidence: 98.5,
    fraudScore: 12,
    recommendations: [
      "Device ownership verified",
      "No suspicious activity detected",
      "Blockchain record confirmed"
    ]
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter Device Information",
        description: "Please enter a serial number, IMEI, or device ID to search.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setVerificationStep(0);
    
    // Enhanced verification process with AI
    const steps = [
      "Parsing device identifier...",
      "Querying blockchain registry...", 
      "Analyzing ownership history...",
      "Running AI fraud detection...",
      "Generating verification report...",
      "Updating analytics database..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setTimeout(() => {
        setVerificationStep(i + 1);
        if (i === steps.length - 1) {
          setDeviceData(mockDevice);
          setApiResponse(mockApiResponse);
          setIsLoading(false);
          toast({
            title: "Verification Complete",
            description: `Device verified with ${mockApiResponse.aiConfidence}% AI confidence.`
          });
        }
      }, i * 800);
    }
  };

  const handleBulkVerification = async () => {
    if (!bulkData.trim()) {
      toast({
        title: "Enter Bulk Data",
        description: "Please enter device identifiers (one per line).",
        variant: "destructive"
      });
      return;
    }

    setIsBulkProcessing(true);
    const devices = bulkData.split('\n').filter(line => line.trim());
    
    // Simulate bulk processing
    const results = devices.map((device, index) => ({
      id: `BULK-${index + 1}`,
      device: device.trim(),
      status: Math.random() > 0.1 ? "verified" : "flagged",
      confidence: Math.floor(Math.random() * 20 + 80),
      processingTime: (Math.random() * 2 + 0.5).toFixed(2),
      fraudScore: Math.floor(Math.random() * 100)
    }));

    setTimeout(() => {
      setBulkResults(results);
      setIsBulkProcessing(false);
      toast({
        title: "Bulk Verification Complete",
        description: `Processed ${devices.length} devices with ${results.filter(r => r.status === "verified").length} verified.`
      });
    }, 3000);
  };

  const handleSdkConnect = () => {
    setSdkStatus("connecting");
    setTimeout(() => {
      setSdkStatus("connected");
      toast({
        title: "SDK Connected",
        description: "Mobile SDK successfully connected to verification service."
      });
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success text-success-foreground">Verified</Badge>;
      case "flagged":
        return <Badge variant="destructive">Flagged</Badge>;
      case "processing":
        return <Badge variant="secondary">Processing</Badge>;
      case "queued":
        return <Badge variant="outline">Queued</Badge>;
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSdkStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success";
      case "beta": return "text-warning";
      case "alpha": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <STOLENLogo />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            Reverse Verification Tool
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            AI-powered device verification with bulk processing and mobile SDK
          </p>
        </div>

        {/* Enhanced Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Verifications</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalVerifications.toLocaleString()}</p>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Accuracy</p>
                  <p className="text-2xl font-bold text-success">{stats.aiAccuracy}%</p>
                </div>
                <Brain className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bulk Processed</p>
                  <p className="text-2xl font-bold text-warning">{stats.bulkProcessed.toLocaleString()}</p>
                </div>
                <Upload className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SDK Users</p>
                  <p className="text-2xl font-bold text-info">{stats.sdkActiveUsers}</p>
                </div>
                <Smartphone className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="single">Single Verification</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Processing</TabsTrigger>
            <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
            <TabsTrigger value="sdk">Mobile SDK</TabsTrigger>
          </TabsList>

          {/* Single Verification Tab */}
          <TabsContent value="single" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Single Device Verification
                </CardTitle>
                <CardDescription>
                  Verify individual devices with AI-powered fraud detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter serial number, IMEI, or device ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>

                {isLoading && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">AI Processing...</span>
                    </div>
                    <Progress value={(verificationStep / 6) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Step {verificationStep} of 6: AI-powered verification in progress
                    </p>
                  </div>
                )}

                {deviceData && (
                  <div className="mt-6 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-success" />
                          Verification Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Device Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Device ID:</span>
                                <span>{deviceData.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <span>{deviceData.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Owner:</span>
                                <span>{deviceData.owner}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Risk Score:</span>
                                <span className={cn(
                                  "font-semibold",
                                  deviceData.riskScore > 50 ? "text-destructive" :
                                  deviceData.riskScore > 25 ? "text-warning" : "text-success"
                                )}>
                                  {deviceData.riskScore}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">AI Analysis</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Confidence:</span>
                                <span className="text-success font-semibold">{apiResponse.aiConfidence}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Processing Time:</span>
                                <span>{apiResponse.processingTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Fraud Score:</span>
                                <span className="text-warning font-semibold">{apiResponse.fraudScore}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Processing Tab */}
          <TabsContent value="bulk" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Bulk Verification
                  </CardTitle>
                  <CardDescription>
                    Process multiple devices simultaneously with AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bulk-data">Device Identifiers (one per line)</Label>
                      <Textarea
                        id="bulk-data"
                        placeholder="Enter device identifiers here...
iPhone-12345
Samsung-67890
MacBook-11111"
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                        rows={8}
                      />
                    </div>
                    <Button 
                      onClick={handleBulkVerification} 
                      disabled={isBulkProcessing}
                      className="w-full"
                    >
                      {isBulkProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Process Bulk Verification
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Processing Queue
                  </CardTitle>
                  <CardDescription>
                    Real-time bulk processing status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bulkQueue.map((item) => (
                      <div key={item.id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{item.id}</h4>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{item.completed}/{item.total}</span>
                          </div>
                          <Progress value={(item.completed / item.total) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {bulkResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Bulk Results
                  </CardTitle>
                  <CardDescription>
                    AI-powered verification results for all devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bulkResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-semibold">{result.device}</h4>
                            <p className="text-sm text-muted-foreground">ID: {result.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Confidence</p>
                            <p className="font-semibold text-success">{result.confidence}%</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Fraud Score</p>
                            <p className={cn(
                              "font-semibold",
                              result.fraudScore > 50 ? "text-destructive" :
                              result.fraudScore > 25 ? "text-warning" : "text-success"
                            )}>
                              {result.fraudScore}%
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Time</p>
                            <p className="font-semibold">{result.processingTime}s</p>
                          </div>
                          
                          {getStatusBadge(result.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Verification Patterns
                  </CardTitle>
                  <CardDescription>
                    AI-detected patterns and anomalies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.verificationPatterns.map((pattern) => (
                      <div key={pattern.pattern} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-sm">{pattern.pattern}</h4>
                          <p className="text-xs text-muted-foreground">{pattern.count} occurrences</p>
                        </div>
                        <Badge variant={pattern.risk === "high" ? "destructive" : pattern.risk === "medium" ? "secondary" : "outline"}>
                          {pattern.risk} risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Fraud Trends
                  </CardTitle>
                  <CardDescription>
                    Monthly fraud detection trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.fraudTrends.map((trend) => (
                      <div key={trend.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-sm">{trend.month}</h4>
                          <p className="text-xs text-muted-foreground">{trend.verifications} verifications</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{trend.fraudRate}%</p>
                          <p className="text-xs text-muted-foreground">fraud rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  ML Predictions
                </CardTitle>
                <CardDescription>
                  Machine learning model predictions and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {analyticsData.mlPredictions.map((prediction) => (
                    <div key={prediction.prediction} className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">{prediction.prediction}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence:</span>
                          <span className="font-semibold text-success">{prediction.confidence}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Action:</span>
                          <span className="text-muted-foreground">{prediction.action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile SDK Tab */}
          <TabsContent value="sdk" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    SDK Status
                  </CardTitle>
                  <CardDescription>
                    Mobile SDK integration and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Connection Status</span>
                      <Badge variant={sdkStatus === "connected" ? "default" : sdkStatus === "connecting" ? "secondary" : "outline"}>
                        {sdkStatus}
                      </Badge>
                    </div>
                    
                    <Button 
                      onClick={handleSdkConnect} 
                      disabled={sdkStatus === "connected"}
                      className="w-full"
                    >
                      {sdkStatus === "connected" ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Connected
                        </>
                      ) : sdkStatus === "connecting" ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Code className="w-4 h-4 mr-2" />
                          Connect SDK
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DownloadIcon className="w-5 h-5" />
                    SDK Downloads
                  </CardTitle>
                  <CardDescription>
                    Platform-specific SDK versions and usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sdkStatuses.map((sdk) => (
                      <div key={sdk.platform} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-sm">{sdk.platform}</h4>
                          <p className="text-xs text-muted-foreground">v{sdk.version}</p>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={sdk.status === "active" ? "default" : sdk.status === "beta" ? "secondary" : "outline"}>
                            {sdk.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{sdk.users} users</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  SDK Configuration
                </CardTitle>
                <CardDescription>
                  Mobile SDK configuration and integration options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">iOS Integration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Framework:</span>
                        <span>STOLENVerify.framework</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min iOS Version:</span>
                        <span>13.0+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Swift Package:</span>
                        <span>Available</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Android Integration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Library:</span>
                        <span>stolen-verify-android</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min SDK:</span>
                        <span>API 21+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gradle:</span>
                        <span>Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReverseVerifyEnhanced;
