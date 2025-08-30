import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Camera,
  QrCode,
  Upload,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Smartphone,
  Shield,
  Zap,
  AlertTriangle
} from "lucide-react";

interface RepairOrder {
  id: string;
  deviceInfo?: {
    brand: string;
    model: string;
    serial: string;
    owner: string;
    warranty?: boolean;
  };
  issueType: string;
  repairType: 'minor' | 'major' | 'diagnostic';
  estimatedCost: string;
  estimatedTimeline: string;
  description: string;
  proofPhotos: File[];
}

const RepairOrderFlow = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<RepairOrder>({
    id: "",
    issueType: "",
    repairType: 'minor',
    estimatedCost: "",
    estimatedTimeline: "",
    description: "",
    proofPhotos: []
  });

  const [deviceFound, setDeviceFound] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Mock device search
  const handleDeviceSearch = () => {
    if (!searchQuery.trim()) return;
    
    setDeviceFound(true);
    setOrder(prev => ({
      ...prev,
      deviceInfo: {
        brand: "Apple",
        model: "iPhone 15 Pro",
        serial: searchQuery,
        owner: "John Smith",
        warranty: true
      }
    }));

    // Mock AI suggestions
    setAiSuggestions([
      "Device is under warranty - contact Apple first",
      "Common issue: Camera module failure for this model",
      "Parts availability: 2-3 day wait time expected"
    ]);

    toast({
      title: "Device Found",
      description: "iPhone 15 Pro located in STOLEN registry",
    });
  };

  const handleQRScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR scanner would open here",
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setOrder(prev => ({
      ...prev,
      proofPhotos: [...prev.proofPhotos, ...files].slice(0, 5)
    }));
  };

  const handleSubmitOrder = () => {
    toast({
      title: "Repair Order Created",
      description: "Order logged to blockchain and customer notified",
    });
    
    // Reset form
    setCurrentStep(1);
    setOrder({
      id: "",
      issueType: "",
      repairType: 'minor',
      estimatedCost: "",
      estimatedTimeline: "",
      description: "",
      proofPhotos: []
    });
    setDeviceFound(false);
    setSearchQuery("");
    setAiSuggestions([]);
  };

  const issueTypes = [
    "Screen replacement",
    "Battery replacement", 
    "Charging port repair",
    "Camera malfunction",
    "Speaker/microphone issues",
    "Water damage",
    "Software issues",
    "Hardware diagnosis",
    "Other"
  ];

  const getRepairTypeColor = (type: string) => {
    switch (type) {
      case 'minor': return 'bg-success/10 text-success';
      case 'major': return 'bg-destructive/10 text-destructive';
      case 'diagnostic': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="New Repair Order" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/repair-shop-dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Device Search */}
        {currentStep === 1 && (
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Device Search & Verification</h2>
              <p className="text-muted-foreground">Locate the device in STOLEN registry</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search by Serial Number, IMEI, or QR Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter serial number or IMEI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleDeviceSearch} disabled={!searchQuery.trim()}>
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={handleQRScan}>
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {deviceFound && order.deviceInfo && (
                <Card className="p-4 bg-success/5 border-success/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-success/10 rounded">
                      <Smartphone className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{order.deviceInfo.brand} {order.deviceInfo.model}</h3>
                        {order.deviceInfo.warranty && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Under Warranty
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Owner: {order.deviceInfo.owner}</div>
                        <div className="font-mono">Serial: {order.deviceInfo.serial}</div>
                      </div>
                      
                      {/* AI Suggestions */}
                      {aiSuggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Zap className="w-4 h-4 text-primary" />
                            AI Suggestions
                          </div>
                          {aiSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                </Card>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!deviceFound}
                >
                  Continue to Repair Details
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Repair Details */}
        {currentStep === 2 && (
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Repair Details</h2>
              <p className="text-muted-foreground">Specify the issue and repair requirements</p>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reported Issue</Label>
                  <Select value={order.issueType} onValueChange={(value) => setOrder(prev => ({...prev, issueType: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypes.map((issue) => (
                        <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Repair Type</Label>
                  <Select value={order.repairType} onValueChange={(value: any) => setOrder(prev => ({...prev, repairType: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnostic">Diagnostic Only</SelectItem>
                      <SelectItem value="minor">Minor Repair</SelectItem>
                      <SelectItem value="major">Major Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Cost ($)</Label>
                  <Input
                    type="number"
                    value={order.estimatedCost}
                    onChange={(e) => setOrder(prev => ({...prev, estimatedCost: e.target.value}))}
                    placeholder="299.99"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estimated Timeline</Label>
                  <Select value={order.estimatedTimeline} onValueChange={(value) => setOrder(prev => ({...prev, estimatedTimeline: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same_day">Same Day</SelectItem>
                      <SelectItem value="1_day">1 Day</SelectItem>
                      <SelectItem value="2_3_days">2-3 Days</SelectItem>
                      <SelectItem value="1_week">1 Week</SelectItem>
                      <SelectItem value="2_weeks">2+ Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Detailed Description</Label>
                <Textarea
                  value={order.description}
                  onChange={(e) => setOrder(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe the issue in detail and planned repair approach..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!order.issueType || !order.estimatedCost}
                >
                  Continue to Documentation
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Documentation & Submit */}
        {currentStep === 3 && (
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Documentation & Proof</h2>
              <p className="text-muted-foreground">Upload photos and complete the repair order</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Proof Photos</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload photos of device condition, serial number, and damage
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos ({order.proofPhotos.length}/5)
                    </label>
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <Card className="p-4 bg-muted/50">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Device:</span>
                    <span>{order.deviceInfo?.brand} {order.deviceInfo?.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issue:</span>
                    <span>{order.issueType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repair Type:</span>
                    <Badge className={getRepairTypeColor(order.repairType)}>
                      {order.repairType}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Cost:</span>
                    <span className="font-semibold">${order.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span>{order.estimatedTimeline?.replace('_', ' ')}</span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={!order.issueType || !order.estimatedCost}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create Repair Order
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RepairOrderFlow;