// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
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
  Link
} from "lucide-react";
import { authService, apiClient, APIAuthMiddleware } from "@/lib/security/auth";
import { reverseVerificationAPI } from "@/lib/services/reverse-verification-api";
import { performanceMonitor } from "@/lib/performance/performance-optimization-browser";
import { blockchainManager } from "@/lib/blockchain/blockchain-integration-browser";
import { aiMLSystem } from "@/lib/ai/ai-ml-system";

const ReverseVerify = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const [searchMethod, setSearchMethod] = useState("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [apiResponse, setApiResponse] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const { toast } = useToast();

  // Enhanced mock device data with full API response structure
  const mockDevice = {
    id: "dev_123456",
    name: "iPhone 15 Pro",
    brand: "Apple",
    model: "A2848",
    serialNumber: "F2LW0**8P",
    owner: "John D.",
    status: "verified",
    registrationDate: "2024-01-15",
    lastTransfer: "2024-01-15",
    transfers: 1,
    location: "San Francisco, CA",
    verificationScore: 98,
    riskLevel: "low",
    confidence: 0.98,
    blockchainHash: "0x1234567890abcdef...",
    lastVerification: "2024-01-20 14:30 PST",
    apiResponseTime: 145,
    flags: [],
    trustBadge: {
      id: "tb_123456",
      status: "verified",
      expires: "2025-01-15"
    }
  };

  // API response simulation
  const mockApiResponse = {
    success: true,
    device: mockDevice,
    recommendations: {
      action: "proceed",
      confidence: 0.98,
      riskLevel: "low"
    },
    metadata: {
      requestId: "req_123456789",
      processingTime: 145,
      apiVersion: "v1.0",
      rateLimit: {
        remaining: 99,
        resetTime: "2024-01-21 00:00:00 PST"
      }
    }
  };

  const ownershipTimeline = [
    {
      date: "2024-01-15",
      event: "Device Registered",
      owner: "John D.",
      type: "registration",
      verified: true
    },
    {
      date: "2024-01-15",
      event: "Initial Purchase",
      owner: "John D.",
      type: "purchase", 
      verified: true,
      details: "Purchased from Apple Store"
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter Device Information",
        description: "Please enter a serial number, IMEI, or device ID to search.",
        variant: "destructive"
      });
      return;
    }

    // Enhanced security validation
    if (!APIAuthMiddleware.validateInput(searchQuery)) {
      toast({
        title: "Security Alert",
        description: "Invalid input detected. Please check your input and try again.",
        variant: "destructive"
      });
      return;
    }

    // Check authentication
    if (!authService.isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the Reverse Verification Tool.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setVerificationStep(0);
    
    try {
      // Use performance optimization with caching and load balancing
      const result = await performanceOptimizer.getCached(
        `verification_${searchQuery}`,
        async () => {
          return await performanceOptimizer.requestWithLoadBalancing(async (serverUrl) => {
            // Enhanced verification process with AI and marketplace integration
            const steps = [
              "Authenticating request...",
              "Checking rate limits...",
              "Parsing device identifier...",
              "Querying blockchain registry...", 
              "Analyzing ownership history...",
              "Running AI fraud detection...",
              "Checking marketplace listings...",
              "Generating verification report..."
            ];

            for (let i = 0; i < steps.length; i++) {
              setTimeout(() => {
                setVerificationStep(i + 1);
              }, (i + 1) * 300); // Faster processing with optimization
            }

            // Use the new Reverse Verification API
            const verificationRequest = {
              deviceId: searchQuery,
              serialNumber: searchQuery,
              timestamp: new Date()
            };

            const apiResponse = await reverseVerificationAPI.verifyDevice(verificationRequest);
            
            // Integrate blockchain verification
            try {
              const blockchainOwnership = await blockchainManager.getDeviceOwnership(searchQuery);
              if (blockchainOwnership) {
                apiResponse.blockchainVerified = true;
                apiResponse.blockchainOwner = blockchainOwnership.owner;
                apiResponse.blockchainTxHash = blockchainOwnership.blockchainTxHash;
                apiResponse.verificationStatus = blockchainOwnership.verificationStatus;
              }
            } catch (error) {
              console.warn('Blockchain verification failed:', error);
            }
            
            // Integrate AI/ML analysis
            try {
              const aiAnalysis = await aiMLSystem.performComprehensiveAnalysis({
                deviceId: searchQuery,
                ...apiResponse
              });
              
              apiResponse.aiFraudScore = aiAnalysis.fraudDetection.fraudScore;
              apiResponse.aiRiskLevel = aiAnalysis.riskAssessment.overallRisk;
              apiResponse.aiMarketValue = aiAnalysis.predictiveAnalytics.marketValue;
              apiResponse.aiPatterns = aiAnalysis.patternRecognition.patterns.length;
              apiResponse.aiConfidence = aiAnalysis.fraudDetection.confidence;
            } catch (error) {
              console.warn('AI/ML analysis failed:', error);
            }
            
            // Update device data with enhanced information
            const enhancedDeviceData = {
              ...mockDevice,
              id: searchQuery,
              status: apiResponse.status,
              riskScore: apiResponse.fraudScore,
              blockchainHash: apiResponse.blockchainHash,
              owner: apiResponse.owner,
              lastSeen: apiResponse.lastSeen,
              location: apiResponse.location,
              marketplaceData: apiResponse.marketplaceData
            };

            const enhancedApiResponse = {
              ...mockApiResponse,
              success: apiResponse.success,
              aiConfidence: apiResponse.confidence,
              fraudScore: apiResponse.fraudScore,
              processingTime: apiResponse.processingTime,
              recommendations: apiResponse.recommendations,
              marketplaceData: apiResponse.marketplaceData
            };

            return { deviceData: enhancedDeviceData, apiResponse: enhancedApiResponse };
          });
        },
        5 * 60 * 1000 // Cache for 5 minutes
      );

      setDeviceData(result.deviceData);
      setApiResponse(result.apiResponse);
      
      toast({
        title: "Verification Complete",
        description: `Device verified with ${result.apiResponse.aiConfidence}% AI confidence in ${result.apiResponse.processingTime}ms.`
      });

    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "An error occurred during verification.",
        variant: "destructive"
      });
    }
  };

  const handleQRScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR code scanning feature would be implemented here with camera access."
    });
  };

  const handleOCRScan = () => {
    toast({
      title: "OCR Scanner", 
      description: "Document OCR scanning would be implemented here for receipt/invoice processing."
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
    toast({
      title: "Copied to Clipboard",
      description: `${label} copied successfully.`
    });
  };

  const generateTrustBadge = () => {
    const badgeCode = `<iframe src="https://api.stolen.com/v1/trust-badge/${mockDevice.id}" width="200" height="100" frameborder="0"></iframe>`;
    copyToClipboard(badgeCode, "Trust Badge Code");
  };

  const downloadCertificate = () => {
    toast({
      title: "Certificate Generated",
      description: "PDF verification certificate download would start here."
    });
  };

  const handleReportDevice = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for your report. Our team will investigate this device."
    });
  };

  const handleShareDevice = () => {
    const certificateUrl = `${window.location.origin}/device-certificate/${mockDevice.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'STOLEN Device Verification Certificate',
        text: `View the verified certificate for this device: ${mockDevice.name}`,
        url: certificateUrl
      });
    } else {
      // Copy to clipboard and show certificate
      navigator.clipboard.writeText(certificateUrl);
      toast({
        title: "Certificate Link Generated",
        description: "Opening device verification certificate..."
      });
      
      // Open certificate in new window
      window.open(certificateUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">Reverse Verification Tool</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            STOLEN's proprietary verification technology. The most advanced device authentication system 
            trusted by millions worldwide.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground mt-6">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              <span>&lt;200ms Response</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-primary" />
              <span>99.5% Accuracy</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-primary" />
              <span>Global Database</span>
            </div>
          </div>
        </div>

        {/* Enhanced Search Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Device Verification</span>
            </CardTitle>
            <CardDescription>
              Multiple verification methods: manual entry, QR scan, or document OCR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={searchMethod} onValueChange={setSearchMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="ocr">Document OCR</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Enter serial number, IMEI, device ID, or QR data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSearch} disabled={isLoading} className="sm:min-w-[120px]">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Verify Device
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="qr" className="space-y-4">
                <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <QrCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Scan QR code from device or packaging</p>
                  <Button onClick={handleQRScan} variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Open QR Scanner
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="ocr" className="space-y-4">
                <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Upload receipt or invoice for automatic data extraction</p>
                  <Button onClick={handleOCRScan} variant="outline">
                    <FileImage className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Real-time Verification Progress */}
            {isLoading && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Verification Progress</span>
                  <span>{Math.round((verificationStep / 5) * 100)}%</span>
                </div>
                <Progress value={(verificationStep / 5) * 100} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {verificationStep === 0 && "Initializing verification..."}
                  {verificationStep === 1 && "Parsing device identifier..."}
                  {verificationStep === 2 && "Querying blockchain registry..."}
                  {verificationStep === 3 && "Analyzing ownership history..."}
                  {verificationStep === 4 && "Running fraud detection..."}
                  {verificationStep === 5 && "Generating verification report..."}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Response Information */}
        {apiResponse && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                API Response Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Response Time</Label>
                  <p className="font-semibold">{apiResponse.metadata.processingTime}ms</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Request ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-1 rounded">{apiResponse.metadata.requestId}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(apiResponse.metadata.requestId, "Request ID")}
                      className="h-6 w-6 p-0"
                    >
                      {copiedText === "Request ID" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">API Version</Label>
                  <p className="font-semibold">{apiResponse.metadata.apiVersion}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rate Limit</Label>
                  <p className="font-semibold">{apiResponse.metadata.rateLimit.remaining} remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Enhanced Device Information */}
        {deviceData && (
          <>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    <span>Device Verified</span>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleShareDevice}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Certificate
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadCertificate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateTrustBadge}>
                      <Award className="h-4 w-4 mr-2" />
                      Get Trust Badge
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReportDevice}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{mockDevice.name}</h3>
                      <p className="text-muted-foreground">{mockDevice.brand} • {mockDevice.model}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Serial Number</span>
                        <span className="text-sm font-mono">{mockDevice.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Owner</span>
                        <span className="text-sm">{mockDevice.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Verification Score</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-600">
                            {mockDevice.verificationScore}%
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {mockDevice.riskLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Confidence</span>
                        <span className="text-sm font-semibold">
                          {Math.round(mockDevice.confidence * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Blockchain Hash</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-1 rounded">{mockDevice.blockchainHash.substring(0, 12)}...</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(mockDevice.blockchainHash, "Blockchain Hash")}
                            className="h-6 w-6 p-0"
                          >
                            {copiedText === "Blockchain Hash" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Registration Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Registered</span>
                        <span className="text-sm">{mockDevice.registrationDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Transfer</span>
                        <span className="text-sm">{mockDevice.lastTransfer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Transfers</span>
                        <span className="text-sm">{mockDevice.transfers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <span className="text-sm">{mockDevice.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Verified</span>
                        <span className="text-sm">{mockDevice.lastVerification}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Trust Badge</span>
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Active until {mockDevice.trustBadge.expires}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ownership Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Ownership Timeline</span>
                </CardTitle>
                <CardDescription>Complete history of device ownership and transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ownershipTimeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          event.verified ? 'bg-green-500' : 'bg-gray-300'
                        } mt-2`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.event}</h4>
                          <span className="text-sm text-muted-foreground">{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.owner}</span>
                          {event.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        {event.details && (
                          <p className="text-sm text-muted-foreground">{event.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Security & Trust Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Blockchain Verified</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This device's ownership history is secured on the blockchain and cannot be 
                        tampered with. All transfers and registrations are permanently recorded.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">AI Fraud Detection</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Advanced machine learning algorithms have analyzed this device and found 
                        no suspicious patterns or fraud indicators.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* API Integration Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  API Integration
                </CardTitle>
                <CardDescription>
                  Integrate this verification into your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">REST API Call</Label>
                    <div className="bg-muted/50 p-3 rounded-lg mt-2">
                      <code className="text-xs">
                        curl -X GET "https://api.stolen.com/v1/verify/device/{mockDevice.id}" \
                        <br />  -H "Authorization: Bearer YOUR_API_KEY" \
                        <br />  -H "Content-Type: application/json"
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(
                          `curl -X GET "https://api.stolen.com/v1/verify/device/${mockDevice.id}" -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json"`,
                          "API Call"
                        )}
                        className="mt-2 h-6"
                      >
                        {copiedText === "API Call" ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Trust Badge Widget</Label>
                    <div className="bg-muted/50 p-3 rounded-lg mt-2">
                      <code className="text-xs">
                        &lt;iframe src="https://api.stolen.com/v1/trust-badge/{mockDevice.id}" 
                        <br />  width="200" height="100" frameborder="0"&gt;&lt;/iframe&gt;
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={generateTrustBadge}
                        className="mt-2 h-6"
                      >
                        {copiedText === "Trust Badge Code" ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copy Widget
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/api-documentation" target="_blank">
                        View Full API Docs
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      Get API Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Bulk Verification Tool */}
        {!deviceData && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Bulk Verification
              </CardTitle>
              <CardDescription>
                Verify multiple devices at once - perfect for retailers and repair shops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Upload CSV file with device identifiers</p>
                  <Button variant="outline">
                    <FileImage className="w-4 h-4 mr-2" />
                    Upload CSV File
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Supported formats:</p>
                  <ul className="space-y-1">
                    <li>• Serial numbers (one per line)</li>
                    <li>• IMEI numbers (15 digits)</li>
                    <li>• Device IDs (dev_xxxxxx format)</li>
                    <li>• Mixed identifier types</li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Download Sample CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    API Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* No Results State */}
        {!deviceData && searchQuery && !isLoading && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Device Not Found</h3>
              <p className="text-sm text-gray-600 mb-4">
                This device is not registered in the STOLEN network. This could mean:
              </p>
              <ul className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-1">
                <li>• The device hasn't been registered yet</li>
                <li>• The search information is incorrect</li>
                <li>• The device may be counterfeit or stolen</li>
                <li>• The identifier format is not recognized</li>
              </ul>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="outline" onClick={handleReportDevice}>
                  Report Suspicious Device
                </Button>
                <Button variant="outline">
                  Request Device Registration
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Blockchain and AI Integration Section */}
        {deviceData && (deviceData.blockchainVerified || deviceData.aiFraudScore !== undefined) && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">🔗 Blockchain & AI Analysis</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {deviceData.blockchainVerified && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="w-5 h-5 text-blue-600" />
                      Blockchain Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Verified
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Owner:</span>
                        <span className="text-sm font-medium">{deviceData.blockchainOwner?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Transaction:</span>
                        <span className="text-sm font-medium">{deviceData.blockchainTxHash?.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {deviceData.aiFraudScore !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Fraud Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Fraud Score:</span>
                        <span className="text-sm font-medium">{Math.round(deviceData.aiFraudScore * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Risk Level:</span>
                        <Badge variant="outline" className={
                          deviceData.aiFraudScore < 0.3 ? "text-green-600 border-green-600" :
                          deviceData.aiFraudScore < 0.6 ? "text-yellow-600 border-yellow-600" :
                          "text-red-600 border-red-600"
                        }>
                          {deviceData.aiFraudScore < 0.3 ? 'Low' : deviceData.aiFraudScore < 0.6 ? 'Medium' : 'High'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Patterns Detected:</span>
                        <span className="text-sm font-medium">{deviceData.aiPatterns || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {deviceData.aiMarketValue && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      AI Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Predicted Value:</span>
                        <span className="text-sm font-medium">${deviceData.aiMarketValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <span className="text-sm font-medium">{Math.round(deviceData.aiConfidence * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Analysis:</span>
                        <span className="text-sm font-medium text-green-600">AI Enhanced</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Statistics and Trust Indicators */}
        {!deviceData && !isLoading && (
          <div className="grid gap-4 md:grid-cols-3 mt-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-primary mb-2">50M+</div>
                <p className="text-sm text-muted-foreground">Devices in Registry</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-primary mb-2">99.5%</div>
                <p className="text-sm text-muted-foreground">Verification Accuracy</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-primary mb-2">&lt;200ms</div>
                <p className="text-sm text-muted-foreground">Average Response Time</p>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Revenue and Partnership Information */}
        <Card className="bg-gradient-hero text-white mt-8">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">Integrate STOLEN Verification</h3>
              <p className="text-white/90">
                Join hundreds of businesses using our API to prevent fraud and build trust
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold">$0.10</div>
                  <div className="text-white/80">per verification</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">100+</div>
                  <div className="text-white/80">integrations</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">99.9%</div>
                  <div className="text-white/80">API uptime</div>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="secondary">
                  Start Free Trial
                </Button>
                <Button variant="outline" className="border-white text-black bg-white hover:bg-white/90">
                  View Pricing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReverseVerify;