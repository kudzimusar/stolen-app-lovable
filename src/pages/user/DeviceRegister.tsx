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
import { notificationService } from "@/lib/services/notification-service";

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

// Processor options (Latest 2025-2026 to Older)
const PROCESSOR_OPTIONS = [
  // Apple (Latest)
  { value: "A18 Pro", label: "Apple A18 Pro (iPhone 16 Pro, 2024)" },
  { value: "A18", label: "Apple A18 (iPhone 16, 2024)" },
  { value: "A17 Pro", label: "Apple A17 Pro (iPhone 15 Pro, 2023)" },
  { value: "A16 Bionic", label: "Apple A16 Bionic (iPhone 15/14 Pro, 2022-23)" },
  { value: "A15 Bionic", label: "Apple A15 Bionic (iPhone 14/13, 2021-22)" },
  { value: "A14 Bionic", label: "Apple A14 Bionic (iPhone 12, 2020)" },
  { value: "A13 Bionic", label: "Apple A13 Bionic (iPhone 11, 2019)" },
  { value: "A12 Bionic", label: "Apple A12 Bionic (iPhone XS, 2018)" },
  { value: "A11 Bionic", label: "Apple A11 Bionic (iPhone 8/X, 2017)" },
  { value: "A10 Fusion", label: "Apple A10 Fusion (iPhone 7, 2016)" },
  // Apple M-series (MacBooks)
  { value: "M4", label: "Apple M4 (MacBook 2024)" },
  { value: "M3", label: "Apple M3 (MacBook 2023)" },
  { value: "M2", label: "Apple M2 (MacBook 2022-23)" },
  { value: "M1", label: "Apple M1 (MacBook 2020-21)" },
  // Qualcomm Snapdragon (Latest)
  { value: "Snapdragon 8 Elite", label: "Snapdragon 8 Elite (S25, 2025)" },
  { value: "Snapdragon 8 Gen 3", label: "Snapdragon 8 Gen 3 (S24 Ultra, 2024)" },
  { value: "Snapdragon 8 Gen 2", label: "Snapdragon 8 Gen 2 (S23, 2023)" },
  { value: "Snapdragon 8 Gen 1", label: "Snapdragon 8 Gen 1 (S22, 2022)" },
  { value: "Snapdragon 888", label: "Snapdragon 888 (S21, 2021)" },
  { value: "Snapdragon 865", label: "Snapdragon 865 (S20, 2020)" },
  // Samsung Exynos (Latest)
  { value: "Exynos 2500", label: "Samsung Exynos 2500 (S26, 2026)" },
  { value: "Exynos 2400", label: "Samsung Exynos 2400 (S24, 2024)" },
  { value: "Exynos 2200", label: "Samsung Exynos 2200 (S22, 2022)" },
  { value: "Exynos 2100", label: "Samsung Exynos 2100 (S21, 2021)" },
  // MediaTek (Latest)
  { value: "Dimensity 9400", label: "MediaTek Dimensity 9400 (2025)" },
  { value: "Dimensity 9300", label: "MediaTek Dimensity 9300 (2024)" },
  { value: "Dimensity 9200", label: "MediaTek Dimensity 9200 (2023)" },
  { value: "Dimensity 9000", label: "MediaTek Dimensity 9000 (2022)" },
  // Google Tensor
  { value: "Tensor G4", label: "Google Tensor G4 (Pixel 9, 2024)" },
  { value: "Tensor G3", label: "Google Tensor G3 (Pixel 8, 2023)" },
  { value: "Tensor G2", label: "Google Tensor G2 (Pixel 7, 2022)" },
  { value: "Other", label: "Other / Don't Know" }
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

      // Send device registration notification
      try {
        await notificationService.notifyDeviceRegistered(
          user.id,
          formData.deviceName,
          {
            serial_number: formData.serialNumber,
            brand: formData.brand,
            model: formData.model,
            registration_date: new Date().toISOString(),
            device_id: data?.device_id
          }
        );
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail registration if notification fails
      }

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
            
            {/* RESPONSIVE GRID LAYOUT */}
            <div className="space-y-4">
              {/* Basic Info - 2 columns on tablet+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <EnhancedSelect
                    placeholder="Select device brand"
                    options={DEVICE_BRANDS}
                    value={formData.brand}
                    onValueChange={(value) => {
                      setFormData({...formData, brand: value});
                      // Auto-fill device name if empty
                      if (!formData.deviceName || formData.deviceName === '') {
                        setFormData(prev => ({...prev, brand: value, deviceName: `${value} Device`}));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., iPhone 8 Plus, Galaxy S24 Ultra"
                    value={formData.model}
                    onChange={(e) => {
                      setFormData({...formData, model: e.target.value});
                      // Auto-update device name when model is entered
                      if (formData.brand && e.target.value) {
                        setFormData(prev => ({...prev, model: e.target.value, deviceName: `${formData.brand} ${e.target.value}`}));
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Exact model name (check Settings → About or device box)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Nickname (Optional)</Label>
                  <Input
                    id="deviceName"
                    placeholder="Auto-filled or customize (e.g., 'My iPhone', 'Work Phone')"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Auto-filled from brand + model, customize if you like</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type</Label>
                  <EnhancedSelect
                    placeholder="Select device type"
                    options={DEVICE_TYPES}
                    value={formData.deviceType}
                    onValueChange={(value) => setFormData({...formData, deviceType: value})}
                  />
                  <p className="text-xs text-muted-foreground">Smartphone, Tablet, Laptop, etc.</p>
                </div>
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
                <p className="text-xs text-muted-foreground">Dial *#06# to find IMEI</p>
              </div>
              
              {/* Physical Specs - 2-3 columns on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <EnhancedSelect
                    placeholder="Select color"
                    options={[
                      { value: "Space Gray", label: "Space Gray" },
                      { value: "Silver", label: "Silver" },
                      { value: "Gold", label: "Gold" },
                      { value: "Midnight", label: "Midnight" },
                      { value: "Natural Titanium", label: "Natural Titanium" },
                      { value: "Blue Titanium", label: "Blue Titanium" },
                      { value: "Phantom Black", label: "Phantom Black" },
                      { value: "Green", label: "Green" },
                      { value: "Black", label: "Black" },
                      { value: "White", label: "White" },
                      { value: "Red", label: "Red" },
                      { value: "Blue", label: "Blue" },
                      { value: "Other", label: "Other" }
                    ]}
                    value={formData.color}
                    onValueChange={(value) => setFormData({...formData, color: value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storageCapacity">Storage Capacity</Label>
                  <EnhancedSelect
                    placeholder="Select storage"
                    options={STORAGE_OPTIONS}
                    value={formData.storageCapacity}
                    onValueChange={(value) => setFormData({...formData, storageCapacity: value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ramGb">RAM (Memory)</Label>
                  <EnhancedSelect
                    placeholder="Select RAM"
                    options={RAM_OPTIONS}
                    value={formData.ramGb}
                    onValueChange={(value) => setFormData({...formData, ramGb: value})}
                  />
                  <p className="text-xs text-muted-foreground">Check Settings → About</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processor">Processor</Label>
                  <EnhancedSelect
                    placeholder="Select processor"
                    options={PROCESSOR_OPTIONS}
                    value={formData.processor}
                    onValueChange={(value) => setFormData({...formData, processor: value})}
                  />
                  <p className="text-xs text-muted-foreground">iPhone 8 Plus: A11 Bionic</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="screenSizeInch">Screen Size</Label>
                  <EnhancedSelect
                    placeholder="Select screen size"
                    options={[
                      // Latest iPhones (2024-2025)
                      { value: "6.9", label: "6.9\" - iPhone 16 Pro Max (2024)" },
                      { value: "6.7", label: "6.7\" - iPhone 12-16 Pro Max" },
                      { value: "6.3", label: "6.3\" - iPhone 16 Pro (2024)" },
                      { value: "6.1", label: "6.1\" - iPhone 11-16, 12-15 Pro" },
                      { value: "5.8", label: "5.8\" - iPhone X, XS, 11 Pro" },
                      { value: "5.5", label: "5.5\" - iPhone 8 Plus, 7 Plus" },
                      { value: "5.4", label: "5.4\" - iPhone 12/13 Mini" },
                      { value: "4.7", label: "4.7\" - iPhone 8, SE (2nd/3rd)" },
                      { value: "4.0", label: "4.0\" - iPhone SE (1st gen)" },
                      // Samsung (Latest)
                      { value: "6.9", label: "6.9\" - Samsung S26 Ultra (2026)" },
                      { value: "6.8", label: "6.8\" - Samsung S24/S25 Ultra" },
                      { value: "6.6", label: "6.6\" - Samsung S24+ (2024)" },
                      { value: "6.2", label: "6.2\" - Samsung S24/S25" },
                      // Other sizes
                      { value: "10.9", label: "10.9\" - iPad Air" },
                      { value: "11.0", label: "11\" - iPad Pro" },
                      { value: "12.9", label: "12.9\" - iPad Pro" },
                      { value: "13.0", label: "13\" - MacBook Air" },
                      { value: "14.0", label: "14\" - MacBook Pro" },
                      { value: "16.0", label: "16\" - MacBook Pro" },
                      { value: "Other", label: "Other / Don't Know" }
                    ]}
                    value={formData.screenSizeInch}
                    onValueChange={(value) => setFormData({...formData, screenSizeInch: value})}
                  />
                  <p className="text-xs text-muted-foreground">Check device box or Apple/Samsung website</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batteryHealthPercentage">Battery Health</Label>
                  <EnhancedSelect
                    placeholder="Select battery health"
                    options={[
                      { value: "100", label: "100% - Brand New" },
                      { value: "95", label: "95-99% - Excellent" },
                      { value: "90", label: "90-94% - Very Good" },
                      { value: "85", label: "85-89% - Good" },
                      { value: "80", label: "80-84% - Fair" },
                      { value: "75", label: "75-79% - Consider Replacement" },
                      { value: "70", label: "70-74% - Replace Soon" },
                      { value: "60", label: "< 70% - Poor" }
                    ]}
                    value={formData.batteryHealthPercentage}
                    onValueChange={(value) => setFormData({...formData, batteryHealthPercentage: value})}
                  />
                  <p className="text-xs text-muted-foreground">iPhone: Settings → Battery → Battery Health</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g., 12"
                    value={formData.warrantyMonths}
                    onChange={(e) => setFormData({...formData, warrantyMonths: e.target.value})}
                    min="0"
                    max="120"
                  />
                  <p className="text-xs text-muted-foreground">Enter 0 if expired, leave empty if unknown</p>
                </div>
              </div>
              
              {/* Ownership Info - 2 columns on tablet+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceOrigin">Where did you get this device?</Label>
                  <Input
                    id="deviceOrigin"
                    placeholder="e.g., Apple Store Sandton"
                    value={formData.deviceOrigin}
                    onChange={(e) => setFormData({...formData, deviceOrigin: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Builds ownership history</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="acquisitionMethod">How did you acquire it?</Label>
                  <EnhancedSelect
                    placeholder="Select method"
                    options={ACQUISITION_OPTIONS}
                    value={formData.acquisitionMethod}
                    onValueChange={(value) => setFormData({...formData, acquisitionMethod: value})}
                  />
                  <p className="text-xs text-muted-foreground">Verifies ownership chain</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="previousOwner">Previous Owner (if applicable)</Label>
                <Input
                  id="previousOwner"
                  placeholder="e.g., John Doe, or leave empty for new device"
                  value={formData.previousOwner}
                  onChange={(e) => setFormData({...formData, previousOwner: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">Leave empty if brand new</p>
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