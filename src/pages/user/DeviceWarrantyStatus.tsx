// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/navigation/AppHeader";
import { DocumentDownloader } from "@/components/ui/DocumentDownloader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumSalesAssistant } from "@/lib/services/premium-sales-assistant";
import { EcosystemServices } from "@/lib/services/ecosystem-services";
import { 
  Shield, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  Bell,
  Settings,
  Smartphone,
  Search,
  Loader2,
  Bot,
  MapPin,
  Phone,
  Star
} from "lucide-react";

const DeviceWarrantyStatus = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [repairServices, setRepairServices] = useState<any[]>([]);
  const [insuranceQuotes, setInsuranceQuotes] = useState<any[]>([]);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { toast } = useToast();
  
  const premiumSalesAssistant = PremiumSalesAssistant.getInstance();
  const ecosystemServices = EcosystemServices.getInstance();

  // Load devices and AI analysis on component mount
  useEffect(() => {
    loadDevicesAndAnalysis();
  }, []);

  const loadDevicesAndAnalysis = async () => {
    try {
      setLoading(true);
      
      // Load user devices from Supabase
      const { data: userDevices, error } = await supabase
        .from('devices')
        .select('*')
        .eq('owner_id', 'current_user_id'); // Replace with actual user ID
      
      if (error) {
        console.error('Error loading devices:', error);
        // Fallback to mock data
        setDevices(mockDevices);
      } else {
        setDevices(userDevices || mockDevices);
      }

      // Get AI-powered warranty analysis
      const analysis = await premiumSalesAssistant.explainOwnershipHistory('device_1');
      setAiAnalysis(analysis);

      // Pre-load repair services and insurance quotes
      const repairData = await premiumSalesAssistant.findAndBookRepairServices('warranty check');
      setRepairServices(repairData.repairShops);

      const insuranceData = await premiumSalesAssistant.getInstantInsuranceQuotes(15000);
      setInsuranceQuotes(insuranceData.quotes || []);

    } catch (error) {
      console.error('Error loading data:', error);
      setDevices(mockDevices);
    } finally {
      setLoading(false);
    }
  };

  const mockDevices = [
    {
      id: "1",
      name: "iPhone 14 Pro",
      serial: "F2LLD123ABC",
      purchaseDate: "2024-01-15",
      warrantyStart: "2024-01-15",
      warrantyEnd: "2025-01-15",
      warrantyType: "manufacturer",
      status: "active",
      daysRemaining: 289,
      retailer: "iStore Century City",
      retailerWarranty: "2024-07-15",
      extendedWarranty: null,
      claimsUsed: 0,
      claimsAllowed: 2
    },
    {
      id: "2",
      name: "MacBook Air M2",
      serial: "C02YL456DEF",
      purchaseDate: "2023-11-20",
      warrantyStart: "2023-11-20",
      warrantyEnd: "2024-11-20",
      warrantyType: "manufacturer",
      status: "expiring_soon",
      daysRemaining: 45,
      retailer: "Apple Store V&A",
      retailerWarranty: "2024-05-20",
      extendedWarranty: "AppleCare+",
      claimsUsed: 1,
      claimsAllowed: 3
    },
    {
      id: "3",
      name: "AirPods Pro 2",
      serial: "GLDM789GHI",
      purchaseDate: "2023-02-10",
      warrantyStart: "2023-02-10",
      warrantyEnd: "2024-02-10",
      warrantyType: "manufacturer",
      status: "expired",
      daysRemaining: -45,
      retailer: "Takealot",
      retailerWarranty: "2023-08-10",
      extendedWarranty: null,
      claimsUsed: 0,
      claimsAllowed: 1
    }
  ];

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading warranty information...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expiring_soon': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getWarrantyProgress = (device: any) => {
    const total = new Date(device.warrantyEnd).getTime() - new Date(device.warrantyStart).getTime();
    const used = Date.now() - new Date(device.warrantyStart).getTime();
    return Math.max(0, Math.min(100, (used / total) * 100));
  };

  const formatDaysRemaining = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return "Expires today";
    if (days === 1) return "1 day remaining";
    return `${days} days remaining`;
  };

  // AI-powered action handlers
  const handleSetAlerts = async (deviceId: string) => {
    setProcessingAction(`alerts-${deviceId}`);
    try {
      const result = await premiumSalesAssistant.setWarrantyAlerts(deviceId, {
        expiryReminder: true,
        extensionReminder: true,
        claimReminder: true
      });
      
      toast({
        title: "Alerts Set Successfully",
        description: `Warranty alerts configured for ${result.deviceName}. You'll receive notifications 30, 7, and 1 day before expiry.`
      });
    } catch (error) {
      toast({
        title: "Error Setting Alerts",
        description: "Failed to set warranty alerts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleGetInsuranceQuote = async (deviceId: string, deviceValue: number) => {
    setProcessingAction(`insurance-${deviceId}`);
    try {
      const quotes = await premiumSalesAssistant.getInstantInsuranceQuotes(deviceValue);
      setInsuranceQuotes(quotes.quotes || []);
      
      toast({
        title: "Insurance Quotes Ready",
        description: `Found ${quotes.quotes?.length || 0} insurance options for your device.`
      });
    } catch (error) {
      toast({
        title: "Error Getting Quotes",
        description: "Failed to get insurance quotes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleFindRepairService = async (deviceId: string, issue: string) => {
    setProcessingAction(`repair-${deviceId}`);
    try {
      const repairData = await premiumSalesAssistant.findAndBookRepairServices(issue);
      setRepairServices(repairData.repairShops);
      
      toast({
        title: "Repair Services Found",
        description: `Found ${repairData.repairShops.length} repair shops near you.`
      });
    } catch (error) {
      toast({
        title: "Error Finding Services",
        description: "Failed to find repair services. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleExtendWarranty = async (deviceId: string) => {
    setProcessingAction(`extend-${deviceId}`);
    try {
      const result = await premiumSalesAssistant.extendWarranty(deviceId, {
        extensionType: 'manufacturer',
        duration: 12, // months
        cost: 299
      });
      
      toast({
        title: "Warranty Extension Available",
        description: `Extended warranty available for R${result.cost}. Valid for ${result.duration} months.`
      });
    } catch (error) {
      toast({
        title: "Error Extending Warranty",
        description: "Failed to process warranty extension. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewTerms = async (deviceId: string) => {
    setProcessingAction(`terms-${deviceId}`);
    try {
      const terms = await premiumSalesAssistant.getWarrantyTerms(deviceId);
      
      toast({
        title: "Warranty Terms",
        description: `Warranty terms loaded. Coverage includes ${terms.coverage.join(', ')}.`
      });
    } catch (error) {
      toast({
        title: "Error Loading Terms",
        description: "Failed to load warranty terms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleClaimSupport = async (deviceId: string) => {
    setProcessingAction(`claim-${deviceId}`);
    try {
      const claimData = await premiumSalesAssistant.initiateWarrantyClaim(deviceId, {
        issue: 'General inquiry',
        priority: 'medium'
      });
      
      toast({
        title: "Claim Support Initiated",
        description: `Warranty claim support started. Reference: ${claimData.referenceNumber}`
      });
    } catch (error) {
      toast({
        title: "Error Starting Claim",
        description: "Failed to initiate warranty claim support. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const warrantyStats = {
    total: devices.length,
    active: devices.filter(d => d.status === 'active').length,
    expiring: devices.filter(d => d.status === 'expiring_soon').length,
    expired: devices.filter(d => d.status === 'expired').length
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Mobile-optimized header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                Device Warranty Status
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Track warranty coverage and expiry dates for all your devices
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="icon" className="sm:hidden">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Mobile search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        {/* Mobile-optimized Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-foreground">{warrantyStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-foreground">{warrantyStats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-foreground">{warrantyStats.expiring}</p>
                  <p className="text-xs text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-foreground">{warrantyStats.expired}</p>
                  <p className="text-xs text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Devices List */}
        <div className="space-y-6">
          {filteredDevices.map((device) => (
            <Card key={device.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{device.name}</h3>
                      <Badge variant={getStatusColor(device.status)}>
                        {device.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{device.serial}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSetAlerts(device.id)}
                      disabled={processingAction === `alerts-${device.id}`}
                    >
                      {processingAction === `alerts-${device.id}` ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Bell className="w-4 h-4 mr-2" />
                      )}
                      Set Alerts
                    </Button>
                    <DocumentDownloader 
                      type="certificate"
                      deviceName={device.name}
                      serialNumber={device.serial}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Warranty Progress */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Manufacturer Warranty</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDaysRemaining(device.daysRemaining)}
                        </span>
                      </div>
                      <Progress value={getWarrantyProgress(device)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{device.warrantyStart}</span>
                        <span>{device.warrantyEnd}</span>
                      </div>
                    </div>

                    {device.extendedWarranty && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Extended Warranty: {device.extendedWarranty}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600">
                          Additional coverage and benefits active
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Warranty Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Purchase Date:</span>
                        <p className="font-medium">{device.purchaseDate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Retailer:</span>
                        <p className="font-medium">{device.retailer}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Warranty Type:</span>
                        <p className="font-medium capitalize">{device.warrantyType}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Claims Used:</span>
                        <p className="font-medium">{device.claimsUsed}/{device.claimsAllowed}</p>
                      </div>
                    </div>

                    {device.retailerWarranty && (
                      <div>
                        <span className="text-sm text-muted-foreground">Retailer Warranty Until:</span>
                        <p className="font-medium">{device.retailerWarranty}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewTerms(device.id)}
                        disabled={processingAction === `terms-${device.id}`}
                      >
                        {processingAction === `terms-${device.id}` ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        View Terms
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleClaimSupport(device.id)}
                        disabled={processingAction === `claim-${device.id}`}
                      >
                        {processingAction === `claim-${device.id}` ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Claim Support
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Alerts and Recommendations */}
                {device.status === 'expiring_soon' && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Warranty Expiring Soon</span>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                      Your warranty expires in {device.daysRemaining} days. Consider extending coverage or purchasing insurance.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExtendWarranty(device.id)}
                        disabled={processingAction === `extend-${device.id}`}
                      >
                        {processingAction === `extend-${device.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Shield className="w-3 h-3 mr-1" />
                        )}
                        Extend Warranty
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGetInsuranceQuote(device.id, 15000)}
                        disabled={processingAction === `insurance-${device.id}`}
                      >
                        {processingAction === `insurance-${device.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Bot className="w-3 h-3 mr-1" />
                        )}
                        View Insurance Options
                      </Button>
                    </div>
                  </div>
                )}

                {device.status === 'expired' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">Warranty Expired</span>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      Your warranty has expired. You may still have repair options through third-party services.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleFindRepairService(device.id, 'warranty expired')}
                        disabled={processingAction === `repair-${device.id}`}
                      >
                        {processingAction === `repair-${device.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <MapPin className="w-3 h-3 mr-1" />
                        )}
                        Find Repair Service
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGetInsuranceQuote(device.id, 12000)}
                        disabled={processingAction === `insurance-${device.id}`}
                      >
                        {processingAction === `insurance-${device.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Bot className="w-3 h-3 mr-1" />
                        )}
                        Get Insurance Quote
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No devices found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No devices match your search." : "No warranty information available."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis Section */}
        {aiAnalysis && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                AI Warranty Analysis
              </CardTitle>
              <CardDescription>
                Smart insights and recommendations for your device warranties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Analysis Summary</h4>
                  <p className="text-sm text-blue-700">{aiAnalysis.summary}</p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Risk Assessment</h4>
                  <p className="text-sm text-green-700">{aiAnalysis.riskAssessment}</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Recommendations</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {aiAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Repair Services Section */}
        {repairServices.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Nearby Repair Services
              </CardTitle>
              <CardDescription>
                Certified repair shops in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairServices.slice(0, 3).map((service: any) => (
                  <div key={service.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{service.shopName}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {service.address}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {service.phone}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{service.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {service.distance}km away
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">R{service.estimatedCost}</p>
                        <p className="text-xs text-muted-foreground">{service.estimatedTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insurance Quotes Section */}
        {insuranceQuotes.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Insurance Quotes
              </CardTitle>
              <CardDescription>
                Available insurance options for your devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insuranceQuotes.slice(0, 3).map((quote: any, index: number) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{quote.provider}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{quote.coverage}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">
                            <span className="font-medium">Monthly:</span> R{quote.monthlyPremium}
                          </span>
                          <span className="text-sm">
                            <span className="font-medium">Deductible:</span> R{quote.deductible}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Get Quote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warranty Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Warranty Tips</CardTitle>
            <CardDescription>Get the most out of your device warranties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Keep Records</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Save purchase receipts and warranty documents in a safe place.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-800">Set Reminders</h3>
                </div>
                <p className="text-sm text-green-700">
                  Enable warranty expiry alerts to never miss extension opportunities.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-purple-800">Regular Maintenance</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Follow manufacturer guidelines to maintain warranty validity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceWarrantyStatus;