import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/AppHeader";
import { UploadComponent } from "@/components/UploadComponent";
import { QRScanner } from "@/components/QRScanner";
import { EnhancedSelect, DEVICE_TYPES, DEVICE_BRANDS, SA_CITIES } from "@/components/EnhancedSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload, Scan, MapPin, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DeviceRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    deviceName: "",
    serialNumber: "",
    model: "",
    brand: "",
    deviceType: "",
    purchaseDate: "",
    purchasePrice: "",
    purchaseLocation: "",
    description: "",
    enableLocation: false,
    photos: [] as File[],
    receipt: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const progress = (step / 4) * 100;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Device Registered Successfully!",
      description: "Your device has been secured on the blockchain.",
    });
    
    navigate("/dashboard");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Device Information</h2>
              <p className="text-muted-foreground">Enter your device details to get started</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  placeholder="e.g., iPhone 15 Pro"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <EnhancedSelect
                  placeholder="Select device type"
                  options={DEVICE_TYPES}
                  value={formData.deviceType}
                  onValueChange={(value) => setFormData({...formData, deviceType: value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <EnhancedSelect
                  placeholder="Select device brand"
                  options={DEVICE_BRANDS}
                  value={formData.brand}
                  onValueChange={(value) => setFormData({...formData, brand: value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., A2848"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial/IMEI Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="serialNumber"
                    placeholder="Enter serial or IMEI"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  />
                  <QRScanner 
                    onScanSuccess={(data) => {
                      // Extract serial from QR data
                      const serial = data.split(':').pop() || '';
                      setFormData({...formData, serialNumber: serial});
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Camera className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Device Photos</h2>
              <p className="text-muted-foreground">Add photos to verify your device</p>
            </div>
            
            <div className="space-y-4">
              <UploadComponent
                variant="photo"
                accept="image/*"
                multiple={true}
                maxSize={10}
                onUpload={(files) => setFormData({...formData, photos: files.map(f => f as any)})}
              />
              
              <UploadComponent
                variant="receipt"
                accept="image/*,application/pdf"
                multiple={false}
                maxSize={5}
                onUpload={(files) => setFormData({...formData, receipt: files[0] as any})}
              />
              
              <div className="space-y-2">
                <Label htmlFor="description">Additional Description</Label>
                <Textarea
                  id="description"
                  placeholder="Any unique markings, accessories, or special features..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Purchase Details</h2>
              <p className="text-muted-foreground">Help us verify your ownership</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (ZAR)</Label>
                  <Input
                    id="purchasePrice"
                    placeholder="R15,000"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchaseLocation">Purchase Location</Label>
                <EnhancedSelect
                  placeholder="Select city where purchased"
                  options={SA_CITIES}
                  value={formData.purchaseLocation}
                  onValueChange={(value) => setFormData({...formData, purchaseLocation: value})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Enable Location Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Help recover your device if lost
                  </p>
                </div>
                <Switch
                  checked={formData.enableLocation}
                  onCheckedChange={(checked) => setFormData({...formData, enableLocation: checked})}
                />
              </div>
              
              <Button variant="outline" className="w-full">
                Link Insurance Policy
              </Button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <h2 className="text-xl font-semibold">Review & Submit</h2>
              <p className="text-muted-foreground">Confirm your device information</p>
            </div>
            
            <Card className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device:</span>
                <span className="font-medium">{formData.deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand:</span>
                <span className="font-medium">{formData.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serial:</span>
                <span className="font-mono text-sm">{formData.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{formData.enableLocation ? "Enabled" : "Disabled"}</span>
              </div>
            </Card>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                By registering this device, you confirm ownership and agree to the STOLEN platform terms.
                Your device will be secured on the blockchain.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Register Device" showBackButton={true} backTo="/dashboard" />

      <div className="container mx-auto px-4 py-6">
        {/* Progress */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {step} of 4</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto">
          {renderStep()}
          
          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            
            {step < 4 ? (
              <Button 
                onClick={handleNext} 
                className="flex-1"
                disabled={!formData.deviceName || !formData.serialNumber}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register Device"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceRegister;