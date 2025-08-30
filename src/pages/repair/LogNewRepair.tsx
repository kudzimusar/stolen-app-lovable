import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  CheckCircle,
  Camera,
  Upload,
  Wrench,
  User,
  Smartphone,
  AlertTriangle,
  DollarSign,
  Calendar,
  QrCode
} from "lucide-react";

const LogNewRepair = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [searchSerial, setSearchSerial] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [deviceInfo, setDeviceInfo] = useState({
    serialNumber: "",
    brand: "",
    model: "",
    color: "",
    condition: "",
    imei: "",
    verified: false
  });
  const [repairDetails, setRepairDetails] = useState({
    issue: "",
    issueCategory: "",
    description: "",
    cost: "",
    parts: "",
    warrantyDays: "30",
    priority: "normal",
    estimatedCompletion: ""
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const handleDeviceSearch = () => {
    // Mock device search
    if (searchSerial) {
      const mockDevice = {
        serialNumber: searchSerial,
        brand: "Apple",
        model: "iPhone 15 Pro",
        color: "Space Black",
        condition: "Good",
        imei: "123456789012345",
        verified: true,
        owner: "John Smith",
        ownerEmail: "john.smith@email.com",
        ownerPhone: "+1 (555) 123-4567"
      };
      
      setDeviceInfo({
        serialNumber: mockDevice.serialNumber,
        brand: mockDevice.brand,
        model: mockDevice.model,
        color: mockDevice.color,
        condition: mockDevice.condition,
        imei: mockDevice.imei,
        verified: mockDevice.verified
      });
      
      setCustomerInfo({
        name: mockDevice.owner,
        email: mockDevice.ownerEmail,
        phone: mockDevice.ownerPhone,
        address: ""
      });
      
      toast({
        title: "Device Found",
        description: `${mockDevice.brand} ${mockDevice.model} found in STOLEN registry`,
        variant: "default"
      });
    }
  };

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmitRepair = () => {
    toast({
      title: "Repair Logged Successfully",
      description: "Repair has been added to blockchain and customer notified",
      variant: "default"
    });
    
    // Reset form and go back to dashboard
    setTimeout(() => {
      window.location.href = '/repair-shop-dashboard';
    }, 2000);
  };

  const stepTitles = [
    "Device Lookup",
    "Customer Info",
    "Repair Details",
    "Review & Submit"
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Log New Repair" showLogo={true} />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <BackButton to="/repair-shop-dashboard" />
          <div>
            <h1 className="text-2xl font-bold">Log New Repair</h1>
            <p className="text-muted-foreground">Walk-in customer repair registration</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step > index + 1 ? 'bg-green-600 text-white' :
                  step === index + 1 ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${step === index + 1 ? 'font-medium' : 'text-muted-foreground'}`}>
                  {title}
                </span>
                {index < stepTitles.length - 1 && (
                  <div className={`ml-4 w-8 h-0.5 ${step > index + 1 ? 'bg-green-600' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-6">
          {/* Step 1: Device Lookup */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Device Lookup</h2>
                <p className="text-muted-foreground">Search for the device in STOLEN registry</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Serial Number / IMEI</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter serial number or IMEI..."
                      value={searchSerial}
                      onChange={(e) => setSearchSerial(e.target.value)}
                    />
                    <Button onClick={handleDeviceSearch} disabled={!searchSerial}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline">
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {deviceInfo.verified && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="space-y-2">
                        <h3 className="font-medium text-green-800">Device Found & Verified</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                          <div>Brand: {deviceInfo.brand}</div>
                          <div>Model: {deviceInfo.model}</div>
                          <div>Color: {deviceInfo.color}</div>
                          <div>Serial: {deviceInfo.serialNumber}</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Legitimate Device
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-medium">Or manually enter device details:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Select onValueChange={(value) => setDeviceInfo({...deviceInfo, brand: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="samsung">Samsung</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="oneplus">OnePlus</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input 
                        placeholder="e.g., iPhone 15 Pro"
                        value={deviceInfo.model}
                        onChange={(e) => setDeviceInfo({...deviceInfo, model: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep}
                  disabled={!deviceInfo.brand || !deviceInfo.model}
                >
                  Next: Customer Info
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Customer Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Customer Information</h2>
                <p className="text-muted-foreground">Enter walk-in customer details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input 
                    placeholder="John Smith"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input 
                    placeholder="+1 (555) 123-4567"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    placeholder="john@email.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address (Optional)</Label>
                  <Input 
                    placeholder="123 Main St, City, State"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  Back
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!customerInfo.name || !customerInfo.phone}
                >
                  Next: Repair Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Repair Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Wrench className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Repair Details</h2>
                <p className="text-muted-foreground">Specify the repair work needed</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Category *</Label>
                    <Select onValueChange={(value) => setRepairDetails({...repairDetails, issueCategory: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="screen">Screen/Display</SelectItem>
                        <SelectItem value="battery">Battery</SelectItem>
                        <SelectItem value="camera">Camera</SelectItem>
                        <SelectItem value="charging">Charging Port</SelectItem>
                        <SelectItem value="speaker">Speaker/Audio</SelectItem>
                        <SelectItem value="button">Buttons/Hardware</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="water">Water Damage</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select onValueChange={(value) => setRepairDetails({...repairDetails, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Issue Summary *</Label>
                  <Input 
                    placeholder="e.g., Cracked screen, won't turn on, battery drains fast"
                    value={repairDetails.issue}
                    onChange={(e) => setRepairDetails({...repairDetails, issue: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <Textarea 
                    placeholder="Provide detailed description of the issue and repair work needed..."
                    rows={3}
                    value={repairDetails.description}
                    onChange={(e) => setRepairDetails({...repairDetails, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Repair Cost ($) *</Label>
                    <Input 
                      type="number"
                      placeholder="299.99"
                      value={repairDetails.cost}
                      onChange={(e) => setRepairDetails({...repairDetails, cost: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Warranty (Days)</Label>
                    <Input 
                      type="number"
                      value={repairDetails.warrantyDays}
                      onChange={(e) => setRepairDetails({...repairDetails, warrantyDays: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Completion</Label>
                    <Input 
                      type="date"
                      value={repairDetails.estimatedCompletion}
                      onChange={(e) => setRepairDetails({...repairDetails, estimatedCompletion: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Parts/Components Needed</Label>
                  <Input 
                    placeholder="e.g., Screen assembly, battery, charging port"
                    value={repairDetails.parts}
                    onChange={(e) => setRepairDetails({...repairDetails, parts: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Before/After Photos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Before photo</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">After photo</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  Back
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!repairDetails.issueCategory || !repairDetails.issue || !repairDetails.cost}
                >
                  Next: Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
                <p className="text-muted-foreground">Verify all information before logging the repair</p>
              </div>

              <div className="space-y-4">
                {/* Device Summary */}
                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Device Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Brand: {deviceInfo.brand}</div>
                    <div>Model: {deviceInfo.model}</div>
                    <div>Serial: {deviceInfo.serialNumber}</div>
                    <div>IMEI: {deviceInfo.imei}</div>
                  </div>
                </Card>

                {/* Customer Summary */}
                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Name: {customerInfo.name}</div>
                    <div>Phone: {customerInfo.phone}</div>
                    <div>Email: {customerInfo.email || 'Not provided'}</div>
                    <div>Address: {customerInfo.address || 'Not provided'}</div>
                  </div>
                </Card>

                {/* Repair Summary */}
                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Repair Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>Category: {repairDetails.issueCategory}</div>
                      <div>Priority: {repairDetails.priority}</div>
                      <div>Cost: ${repairDetails.cost}</div>
                      <div>Warranty: {repairDetails.warrantyDays} days</div>
                    </div>
                    <div>Issue: {repairDetails.issue}</div>
                    <div>Description: {repairDetails.description}</div>
                    <div>Parts: {repairDetails.parts}</div>
                    <div>Est. Completion: {repairDetails.estimatedCompletion}</div>
                  </div>
                </Card>

                {/* Important Notes */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Before submitting:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Ensure all information is accurate</li>
                        <li>Customer has agreed to repair cost and terms</li>
                        <li>Device photos have been taken</li>
                        <li>Repair will be logged to blockchain permanently</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  Back
                </Button>
                <Button onClick={handleSubmitRepair} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Log Repair to Blockchain
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LogNewRepair;