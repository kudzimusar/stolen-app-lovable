import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { PhotoUpload, UploadedFile } from "@/components/shared/upload/PhotoUpload";
import { QRScanner } from "@/components/ui/QRScanner";
import { EnhancedSelect, DEVICE_TYPES, DEVICE_BRANDS, SA_CITIES } from "@/components/forms/EnhancedSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Camera, Upload, Scan, MapPin, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormPersistence } from "@/components/providers/EnhancedUXProvider";
import { supabase } from "@/integrations/supabase/client";

// Storage capacity options
const STORAGE_OPTIONS = [
  { value: "16GB", label: "16GB" },
  { value: "32GB", label: "32GB" },
  { value: "64GB", label: "64GB" },
  { value: "128GB", label: "128GB" },
  { value: "256GB", label: "256GB" },
  { value: "512GB", label: "512GB" },
  { value: "1TB", label: "1TB" },
  { value: "2TB", label: "2TB" },
  { value: "4TB", label: "4TB" },
  { value: "Other", label: "Other" }
];

// RAM options
const RAM_OPTIONS = [
  { value: "2", label: "2GB" },
  { value: "3", label: "3GB" },
  { value: "4", label: "4GB" },
  { value: "6", label: "6GB" },
  { value: "8", label: "8GB" },
  { value: "12", label: "12GB" },
  { value: "16", label: "16GB" },
  { value: "32", label: "32GB" },
  { value: "64", label: "64GB" },
  { value: "Other", label: "Other" }
];

// Processor options (common ones)
const PROCESSOR_OPTIONS = [
  { value: "A17 Pro", label: "Apple A17 Pro" },
  { value: "A16 Bionic", label: "Apple A16 Bionic" },
  { value: "A15 Bionic", label: "Apple A15 Bionic" },
  { value: "A14 Bionic", label: "Apple A14 Bionic" },
  { value: "A13 Bionic", label: "Apple A13 Bionic" },
  { value: "Snapdragon 8 Gen 3", label: "Snapdragon 8 Gen 3" },
  { value: "Snapdragon 8 Gen 2", label: "Snapdragon 8 Gen 2" },
  { value: "Snapdragon 8 Gen 1", label: "Snapdragon 8 Gen 1" },
  { value: "Exynos 2400", label: "Exynos 2400" },
  { value: "MediaTek Dimensity 9300", label: "MediaTek Dimensity 9300" },
  { value: "Other", label: "Other" }
];

// Device condition options
const CONDITION_OPTIONS = [
  { value: "Excellent", label: "Excellent - Like new, no visible wear" },
  { value: "Very Good", label: "Very Good - Minor wear, fully functional" },
  { value: "Good", label: "Good - Some wear, fully functional" },
  { value: "Fair", label: "Fair - Noticeable wear, fully functional" },
  { value: "Poor", label: "Poor - Heavy wear or damage" }
];

// Acquisition method options
const ACQUISITION_OPTIONS = [
  { value: "purchase", label: "Purchase - Bought new or used" },
  { value: "gift", label: "Gift - Received as a gift" },
  { value: "inheritance", label: "Inheritance - Inherited from family" },
  { value: "trade", label: "Trade/Exchange - Traded for another item" }
];

const DeviceRegister = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);
  
  // Enhanced form persistence
  const {
    formData: persistedData,
    updateFormData,
    clearFormData,
    submitAndClear,
    isDirty
  } = useFormPersistence('device-register');

  // Initialize form data with defaults
  const [formData, setFormData] = useState({
    deviceName: "",
    serialNumber: "",
    imeiNumber: "",
    model: "",
    brand: "",
    deviceType: "",
    color: "", // Device color
    storageCapacity: "", // e.g., "128GB", "256GB", "512GB", "1TB"
    ramGb: "", // RAM in GB
    processor: "", // Processor type
    screenSizeInch: "", // Screen size in inches
    batteryHealthPercentage: "", // Battery health percentage
    deviceCondition: "", // Excellent, Very Good, Good, Fair, Poor
    warrantyMonths: "", // Remaining warranty duration in months
    purchaseDate: "",
    purchasePrice: "",
    purchaseLocation: "",
    description: "",
    // NEW FIELDS for ownership history
    deviceOrigin: "", // Where you got the device (e.g., "Apple Store Sandton")
    previousOwner: "", // Previous owner name (if applicable)
    acquisitionMethod: "", // How you got it: purchase, gift, inheritance, trade
    enableLocation: false,
    // Document uploads with systematic categorization
    photos: [] as UploadedFile[], // Device photos
    receipt: null as UploadedFile | null, // Proof of Purchase
    userIdentity: null as UploadedFile | null, // User Identity Verification
    warrantyDocument: null as UploadedFile | null, // Warranty/Insurance Document
    registrationCertificate: null as UploadedFile | null, // Registration Certificate
    ...persistedData // Override with persisted data
  });

  // Update form data and persist changes
  const updateField = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateFormData(newData);
  };

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
    
    try {
      // Validate required fields
      if (!formData.serialNumber || !formData.deviceName || !formData.brand || (!formData.model && !formData.deviceType)) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields (Device Name, Brand, Serial Number, Model)",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Get authentication token
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to register a device",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Prepare device data for API call
      const deviceData = {
        serialNumber: formData.serialNumber,
        imei: formData.imeiNumber || undefined,
        deviceName: formData.deviceName,
        brand: formData.brand,
        model: formData.model || formData.deviceName || formData.deviceType, // Ensure model is never empty
        color: formData.color || formData.description || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice.toString().replace(/[^0-9.]/g, '')) : undefined,
        // Complete device specifications
        storageCapacity: formData.storageCapacity || undefined,
        ramGb: formData.ramGb ? parseInt(formData.ramGb) : undefined,
        processor: formData.processor || undefined,
        screenSizeInch: formData.screenSizeInch ? parseFloat(formData.screenSizeInch) : undefined,
        batteryHealthPercentage: formData.batteryHealthPercentage ? parseInt(formData.batteryHealthPercentage) : undefined,
        deviceCondition: formData.deviceCondition || undefined,
        warrantyMonths: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : undefined,
        // NEW: Ownership history fields
        deviceOrigin: formData.deviceOrigin || undefined,
        previousOwner: formData.previousOwner || undefined,
        acquisitionMethod: formData.acquisitionMethod || "purchase",
        // Systematic document categorization
        devicePhotos: formData.photos?.map(photo => photo.url).filter(url => url) || [],
        proofOfPurchaseUrl: formData.receipt?.url || undefined,
        userIdentityUrl: formData.userIdentity?.url || undefined,
        warrantyDocumentUrl: formData.warrantyDocument?.url || undefined,
        registrationCertificateUrl: formData.registrationCertificate?.url || undefined,
        insurancePolicyId: undefined // Can be linked to warranty document
      };

      // Additional validation to ensure model is not empty
      if (!deviceData.model || deviceData.model.trim() === '') {
        toast({
          title: "Missing Model Information",
          description: "Please provide a device model",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log('📱 Registering device for user:', user.id);
      console.log('📋 Device data:', deviceData);
      console.log('📋 Device data JSON:', JSON.stringify(deviceData, null, 2));
      console.log('📋 Photos array:', formData.photos);
      console.log('📋 Receipt:', formData.receipt);

      // Call the register-device edge function
      const { data, error } = await supabase.functions.invoke('register-device', {
        body: deviceData
      });

      if (error) {
        console.error('❌ Registration error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        throw new Error(error.message || 'Failed to register device');
      }

      console.log('✅ Registration response:', data);

      // Success!
    toast({
      title: "Device Registered Successfully!",
        description: `${formData.deviceName} has been secured on the blockchain.`,
      });

      // Clear form data
      clearFormData();
      setFormData({
        deviceName: "",
        serialNumber: "",
        imeiNumber: "",
        model: "",
        brand: "",
        deviceType: "",
        color: "",
        storageCapacity: "",
        ramGb: "",
        processor: "",
        screenSizeInch: "",
        batteryHealthPercentage: "",
        deviceCondition: "",
        warrantyMonths: "",
        purchaseDate: "",
        purchasePrice: "",
        purchaseLocation: "",
        description: "",
        deviceOrigin: "",
        previousOwner: "",
        acquisitionMethod: "",
        enableLocation: false,
        // Clear all document uploads
        photos: [] as UploadedFile[],
        receipt: null as UploadedFile | null,
        userIdentity: null as UploadedFile | null,
        warrantyDocument: null as UploadedFile | null,
        registrationCertificate: null as UploadedFile | null
      });

      // Navigate to My Devices to see the new device
      navigate("/my-devices");

    } catch (error) {
      console.error('❌ Device registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto" />
              <h2 className="text-lg sm:text-xl font-semibold">Device Information</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Enter your device details to get started</p>
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
                <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input
                    id="serialNumber"
                    placeholder="Enter device serial number"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    required
                  />
                
                {/* QR Scanner Section */}
                <div className="mt-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Scan className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">QR Code Scanner</h4>
                        <p className="text-sm text-gray-600">Quick device identification</p>
                      </div>
                    </div>
                    
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
              
              <div className="space-y-2">
                <Label htmlFor="imeiNumber">IMEI Number</Label>
                <Input
                  id="imeiNumber"
                  placeholder="Enter IMEI number (for mobile devices)"
                  value={formData.imeiNumber || ""}
                  onChange={(e) => setFormData({...formData, imeiNumber: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="e.g., Space Gray, Midnight, Natural Titanium"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storageCapacity">Storage Capacity</Label>
                <EnhancedSelect
                  placeholder="Select storage capacity"
                  options={STORAGE_OPTIONS}
                  value={formData.storageCapacity}
                  onValueChange={(value) => setFormData({...formData, storageCapacity: value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ramGb">RAM (Memory)</Label>
                <EnhancedSelect
                  placeholder="Select RAM capacity"
                  options={RAM_OPTIONS}
                  value={formData.ramGb}
                  onValueChange={(value) => setFormData({...formData, ramGb: value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="processor">Processor</Label>
                <EnhancedSelect
                  placeholder="Select processor"
                  options={PROCESSOR_OPTIONS}
                  value={formData.processor}
                  onValueChange={(value) => setFormData({...formData, processor: value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="screenSizeInch">Screen Size (inches)</Label>
                <Input
                  id="screenSizeInch"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 6.7"
                  value={formData.screenSizeInch}
                  onChange={(e) => setFormData({...formData, screenSizeInch: e.target.value})}
                  min="3"
                  max="20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batteryHealthPercentage">Battery Health (%)</Label>
                <Input
                  id="batteryHealthPercentage"
                  type="number"
                  placeholder="e.g., 95"
                  value={formData.batteryHealthPercentage}
                  onChange={(e) => setFormData({...formData, batteryHealthPercentage: e.target.value})}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-muted-foreground">Check in Settings {'>'} Battery {'>'} Battery Health</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceCondition">Device Condition *</Label>
                <EnhancedSelect
                  placeholder="Select device condition"
                  options={CONDITION_OPTIONS}
                  value={formData.deviceCondition}
                  onValueChange={(value) => setFormData({...formData, deviceCondition: value})}
                />
                <p className="text-xs text-muted-foreground">Honest assessment helps build trust with buyers</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warrantyMonths">Warranty Remaining (months)</Label>
                <Input
                  id="warrantyMonths"
                  type="number"
                  placeholder="e.g., 12 (leave empty if no warranty)"
                  value={formData.warrantyMonths}
                  onChange={(e) => setFormData({...formData, warrantyMonths: e.target.value})}
                  min="0"
                  max="120"
                />
                <p className="text-xs text-muted-foreground">Enter 0 if warranty has expired or leave empty if unknown</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceOrigin">Where did you get this device?</Label>
                <Input
                  id="deviceOrigin"
                  placeholder="e.g., Apple Store Sandton, Takealot Online, Private Seller"
                  value={formData.deviceOrigin}
                  onChange={(e) => setFormData({...formData, deviceOrigin: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">This helps build ownership history and trust</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="acquisitionMethod">How did you acquire it?</Label>
                <EnhancedSelect
                  placeholder="Select acquisition method"
                  options={ACQUISITION_OPTIONS}
                  value={formData.acquisitionMethod}
                  onValueChange={(value) => setFormData({...formData, acquisitionMethod: value})}
                />
                <p className="text-xs text-muted-foreground">Helps verify ownership chain</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="previousOwner">Previous Owner (if applicable)</Label>
                <Input
                  id="previousOwner"
                  placeholder="e.g., John Doe, or leave empty for new device"
                  value={formData.previousOwner}
                  onChange={(e) => setFormData({...formData, previousOwner: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">Leave empty if this is a brand new device</p>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto" />
              <h2 className="text-lg sm:text-xl font-semibold">Ownership Evidence</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Upload required documents for blockchain verification</p>
            </div>
            
            <div className="space-y-6">
              {/* 1. Device Photos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-base">Device Photos</h3>
                  <Badge variant="outline" className="text-xs">Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Upload clear photos showing the device from multiple angles</p>
                <PhotoUpload
                  variant="device-photo"
                multiple={true}
                maxSize={10}
                  enableLocation={true}
                  enableOCR={false}
                  enableCompression={true}
                  enableDragDrop={true}
                  enableCamera={true}
                  userId={userId || 'anonymous'}
                  onUpload={(files) => {
                    console.log('Device photos uploaded:', files);
                    setFormData(prev => ({
                      ...prev,
                      photos: files
                    }));
                  }}
                />
              </div>

              {/* 2. Proof of Purchase (Receipt) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-base">Proof of Purchase</h3>
                  <Badge variant="outline" className="text-xs">Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Upload receipt, invoice, or purchase confirmation</p>
                <PhotoUpload
                variant="receipt"
                  multiple={false}
                  maxSize={5}
                  enableLocation={false}
                  enableOCR={true}
                  enableCompression={true}
                  enableDragDrop={true}
                  enableCamera={false}
                  userId={userId || 'anonymous'}
                  onUpload={(files) => {
                    console.log('Proof of Purchase uploaded:', files);
                    setFormData(prev => ({
                      ...prev,
                      receipt: files[0] || null
                    }));
                  }}
                />
              </div>

              {/* 3. User Identity Verification */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h3 className="font-semibold text-base">Identity Verification</h3>
                  <Badge variant="outline" className="text-xs">Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Upload national ID, passport, or driver's license for verification</p>
                <PhotoUpload
                  variant="document"
                  multiple={false}
                  maxSize={5}
                  enableLocation={false}
                  enableOCR={true}
                  enableCompression={true}
                  enableDragDrop={true}
                  enableCamera={false}
                  userId={userId || 'anonymous'}
                  onUpload={(files) => {
                    console.log('User Identity uploaded:', files);
                    setFormData(prev => ({
                      ...prev,
                      userIdentity: files[0] || null
                    }));
                  }}
                />
              </div>

              {/* 4. Warranty/Insurance Document */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <h3 className="font-semibold text-base">Warranty/Insurance</h3>
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Upload warranty certificate or insurance policy document</p>
                <PhotoUpload
                  variant="document"
                  multiple={false}
                  maxSize={5}
                  enableLocation={false}
                  enableOCR={true}
                  enableCompression={true}
                  enableDragDrop={true}
                  enableCamera={false}
                  userId={userId || 'anonymous'}
                  onUpload={(files) => {
                    console.log('Warranty/Insurance uploaded:', files);
                    setFormData(prev => ({
                      ...prev,
                      warrantyDocument: files[0] || null
                    }));
                  }}
                />
              </div>

              {/* 5. Registration Certificate (for secondary sellers) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <h3 className="font-semibold text-base">Registration Certificate</h3>
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Upload previous registration certificate if this is a secondary sale</p>
                <PhotoUpload
                  variant="document"
                multiple={false}
                maxSize={5}
                  enableLocation={false}
                  enableOCR={true}
                  enableCompression={true}
                  enableDragDrop={true}
                  enableCamera={false}
                  userId={userId || 'anonymous'}
                  onUpload={(files) => {
                    console.log('Registration Certificate uploaded:', files);
                    setFormData(prev => ({
                      ...prev,
                      registrationCertificate: files[0] || null
                    }));
                  }}
                />
              </div>
              
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
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto" />
              <h2 className="text-lg sm:text-xl font-semibold">Purchase Details</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Help us verify your ownership</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-success mx-auto" />
              <h2 className="text-lg sm:text-xl font-semibold">Review & Submit</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Confirm your device information</p>
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

      <div className="container mx-auto px-4 py-4 pb-24 sm:pb-6">
        {/* Mobile Back Navigation - Fallback */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        
        {/* Progress */}
        <div className="mb-4 sm:mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {step} of 4</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Why Register Banner */}
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-primary/5 border border-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium">Why register with STOLEN?</span>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/why-stolen" className="text-primary hover:text-primary/80">
                Learn More →
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto">
          {renderStep()}
          
          {/* Navigation - Fixed positioning for mobile */}
          <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 pb-4 sm:pb-0">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                Back
              </Button>
            )}
            
            {step < 4 ? (
              <Button 
                onClick={handleNext} 
                className="flex-1 h-12"
                disabled={!formData.deviceName || !formData.serialNumber}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="flex-1 h-12"
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