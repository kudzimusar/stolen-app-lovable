import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { PhotoUpload, UploadedFile } from "@/components/shared/upload/PhotoUpload";
import { EnhancedSelect, DEVICE_TYPES, DEVICE_BRANDS } from "@/components/forms/EnhancedSelect";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Camera, Upload, MapPin, CheckCircle } from "lucide-react";

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
];

// Processor options
const PROCESSOR_OPTIONS = [
  { value: "A17 Pro", label: "Apple A17 Pro" },
  { value: "A16 Bionic", label: "Apple A16 Bionic" },
  { value: "A15 Bionic", label: "Apple A15 Bionic" },
  { value: "A14 Bionic", label: "Apple A14 Bionic" },
  { value: "A13 Bionic", label: "Apple A13 Bionic" },
  { value: "A12 Bionic", label: "Apple A12 Bionic" },
  { value: "A11 Bionic", label: "Apple A11 Bionic" },
  { value: "A10 Fusion", label: "Apple A10 Fusion" },
  { value: "Snapdragon 8 Gen 3", label: "Snapdragon 8 Gen 3" },
  { value: "Snapdragon 8 Gen 2", label: "Snapdragon 8 Gen 2" },
  { value: "Exynos 2400", label: "Exynos 2400" },
];

// Device condition options
const CONDITION_OPTIONS = [
  { value: "Excellent", label: "Excellent - Like new, no visible wear" },
  { value: "Very Good", label: "Very Good - Minor wear, fully functional" },
  { value: "Good", label: "Good - Some wear, fully functional" },
  { value: "Fair", label: "Fair - Noticeable wear, fully functional" },
  { value: "Poor", label: "Poor - Heavy wear or damage" }
];

const EditDevice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
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
    photos: [] as UploadedFile[],
    receipt: null as UploadedFile | null,
    userIdentity: null as UploadedFile | null,
    warrantyDocument: null as UploadedFile | null,
    registrationCertificate: null as UploadedFile | null,
  });

  useEffect(() => {
    loadDevice();
  }, [id]);

  const loadDevice = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to edit devices",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("id", id)
        .eq("current_owner_id", user.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Device Not Found",
          description: "This device doesn't exist or you don't have permission to edit it",
          variant: "destructive"
        });
        navigate("/my-devices");
        return;
      }

      const deviceData = data as any;
      setFormData({
        deviceName: deviceData.device_name || "",
        serialNumber: deviceData.serial_number || "",
        imeiNumber: deviceData.imei || "",
        model: deviceData.model || "",
        brand: deviceData.brand || "",
        deviceType: "",
        color: deviceData.color || "",
        storageCapacity: deviceData.storage_capacity || "",
        ramGb: deviceData.ram_gb?.toString() || "",
        processor: deviceData.processor || "",
        screenSizeInch: deviceData.screen_size_inch?.toString() || "",
        batteryHealthPercentage: deviceData.battery_health_percentage?.toString() || "",
        deviceCondition: deviceData.device_condition || "",
        warrantyMonths: deviceData.warranty_months?.toString() || "",
        purchaseDate: deviceData.purchase_date || "",
        purchasePrice: deviceData.purchase_price?.toString() || "",
        purchaseLocation: "",
        description: "",
        photos: deviceData.device_photos?.map((url: string, idx: number) => ({ 
          id: `existing-${idx}`, 
          name: `photo-${idx}`, 
          size: 0, 
          type: 'image/jpeg', 
          url,
          preview: url
        } as UploadedFile)) || [],
        receipt: deviceData.proof_of_purchase_url ? { 
          id: 'existing-receipt', 
          name: 'receipt', 
          size: 0, 
          type: 'application/pdf', 
          url: deviceData.proof_of_purchase_url,
          preview: deviceData.proof_of_purchase_url
        } as UploadedFile : null,
        userIdentity: deviceData.user_identity_url ? { 
          id: 'existing-identity', 
          name: 'identity', 
          size: 0, 
          type: 'application/pdf', 
          url: deviceData.user_identity_url,
          preview: deviceData.user_identity_url
        } as UploadedFile : null,
        warrantyDocument: deviceData.warranty_document_url ? { 
          id: 'existing-warranty', 
          name: 'warranty', 
          size: 0, 
          type: 'application/pdf', 
          url: deviceData.warranty_document_url,
          preview: deviceData.warranty_document_url
        } as UploadedFile : null,
        registrationCertificate: deviceData.registration_certificate_url ? { 
          id: 'existing-cert', 
          name: 'certificate', 
          size: 0, 
          type: 'application/pdf', 
          url: deviceData.registration_certificate_url,
          preview: deviceData.registration_certificate_url
        } as UploadedFile : null,
      });
    } catch (error: any) {
      console.error("Error loading device:", error);
      toast({
        title: "Error Loading Device",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save changes",
          variant: "destructive"
        });
        return;
      }

      const updateData: any = {
        device_name: formData.deviceName,
        brand: formData.brand,
        model: formData.model,
        serial_number: formData.serialNumber,
        imei: formData.imeiNumber || null,
        color: formData.color || null,
        storage_capacity: formData.storageCapacity || null,
        ram_gb: formData.ramGb ? parseInt(formData.ramGb) : null,
        processor: formData.processor || null,
        screen_size_inch: formData.screenSizeInch ? parseFloat(formData.screenSizeInch) : null,
        battery_health_percentage: formData.batteryHealthPercentage ? parseInt(formData.batteryHealthPercentage) : null,
        device_condition: formData.deviceCondition || null,
        warranty_months: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : null,
        purchase_date: formData.purchaseDate || null,
        purchase_price: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        device_photos: formData.photos.map(p => p.url),
        proof_of_purchase_url: formData.receipt?.url || null,
        user_identity_url: formData.userIdentity?.url || null,
        warranty_document_url: formData.warrantyDocument?.url || null,
        registration_certificate_url: formData.registrationCertificate?.url || null,
      };

      const { error } = await supabase
        .from("devices")
        .update(updateData)
        .eq("id", id)
        .eq("current_owner_id", user.id);

      if (error) throw error;

      toast({
        title: "Device Updated Successfully!",
        description: `${formData.deviceName} has been updated with latest information.`,
      });

      navigate("/my-devices");
    } catch (error: any) {
      console.error("Error updating device:", error);
      toast({
        title: "Error Updating Device",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Device Information</h2>
              <p className="text-muted-foreground">Update your device details</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name *</Label>
                <Input
                  id="deviceName"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                  placeholder="e.g., iPhone 8 Plus"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <EnhancedSelect
                  placeholder="Select device brand"
                  options={DEVICE_BRANDS}
                  value={formData.brand}
                  onValueChange={(value) => setFormData({ ...formData, brand: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., iPhone 8 Plus"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="Device serial number"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Serial number cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imeiNumber">IMEI Number</Label>
                <Input
                  id="imeiNumber"
                  value={formData.imeiNumber}
                  onChange={(e) => setFormData({ ...formData, imeiNumber: e.target.value })}
                  placeholder="IMEI number (for mobile devices)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g., Space Gray, Green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageCapacity">Storage Capacity</Label>
                <EnhancedSelect
                  placeholder="Select storage"
                  options={STORAGE_OPTIONS}
                  value={formData.storageCapacity}
                  onValueChange={(value) => setFormData({ ...formData, storageCapacity: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ramGb">RAM</Label>
                <EnhancedSelect
                  placeholder="Select RAM"
                  options={RAM_OPTIONS}
                  value={formData.ramGb}
                  onValueChange={(value) => setFormData({ ...formData, ramGb: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processor">Processor</Label>
                <EnhancedSelect
                  placeholder="Select processor"
                  options={PROCESSOR_OPTIONS}
                  value={formData.processor}
                  onValueChange={(value) => setFormData({ ...formData, processor: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenSizeInch">Screen Size (inches)</Label>
                <Input
                  id="screenSizeInch"
                  type="number"
                  step="0.1"
                  value={formData.screenSizeInch}
                  onChange={(e) => setFormData({ ...formData, screenSizeInch: e.target.value })}
                  placeholder="e.g., 5.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batteryHealthPercentage">Battery Health (%)</Label>
                <Input
                  id="batteryHealthPercentage"
                  type="number"
                  value={formData.batteryHealthPercentage}
                  onChange={(e) => setFormData({ ...formData, batteryHealthPercentage: e.target.value })}
                  placeholder="e.g., 90"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceCondition">Device Condition</Label>
                <EnhancedSelect
                  placeholder="Select condition"
                  options={CONDITION_OPTIONS}
                  value={formData.deviceCondition}
                  onValueChange={(value) => setFormData({ ...formData, deviceCondition: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyMonths">Warranty Remaining (months)</Label>
                <Input
                  id="warrantyMonths"
                  type="number"
                  value={formData.warrantyMonths}
                  onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                  placeholder="e.g., 12"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Camera className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Update Documents</h2>
              <p className="text-muted-foreground">Update ownership documents and photos</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Device Photos</Label>
                <p className="text-sm text-muted-foreground mb-2">Upload clear photos of your device</p>
                <PhotoUpload
                  variant="device-photo"
                  multiple={true}
                  onUpload={(files) => setFormData({ ...formData, photos: files })}
                />
                {formData.photos.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">{formData.photos.length} photos uploaded</p>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Proof of Purchase</Label>
                <p className="text-sm text-muted-foreground mb-2">Receipt or invoice</p>
                <PhotoUpload
                  variant="receipt"
                  multiple={false}
                  onUpload={(files) => setFormData({ ...formData, receipt: files[0] || null })}
                />
                {formData.receipt && (
                  <p className="text-sm text-muted-foreground mt-2">✓ Receipt uploaded</p>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Warranty Document</Label>
                <p className="text-sm text-muted-foreground mb-2">Warranty or insurance document</p>
                <PhotoUpload
                  variant="document"
                  multiple={false}
                  onUpload={(files) => setFormData({ ...formData, warrantyDocument: files[0] || null })}
                />
                {formData.warrantyDocument && (
                  <p className="text-sm text-muted-foreground mt-2">✓ Warranty document uploaded</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Upload className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Purchase Information</h2>
              <p className="text-muted-foreground">Update purchase details</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="e.g., 12999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Notes</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any additional information about your device"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h2 className="text-xl font-semibold">Review & Save</h2>
              <p className="text-muted-foreground">Review your changes before saving</p>
            </div>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Device Information</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Name: {formData.deviceName}</p>
                  <p>Brand: {formData.brand || "Not specified"}</p>
                  <p>Model: {formData.model || "Not specified"}</p>
                  <p>Color: {formData.color || "Not specified"}</p>
                  <p>Storage: {formData.storageCapacity || "Not specified"}</p>
                  <p>RAM: {formData.ramGb ? `${formData.ramGb}GB` : "Not specified"}</p>
                  <p>Processor: {formData.processor || "Not specified"}</p>
                  <p>Screen Size: {formData.screenSizeInch ? `${formData.screenSizeInch}"` : "Not specified"}</p>
                  <p>Battery Health: {formData.batteryHealthPercentage ? `${formData.batteryHealthPercentage}%` : "Not specified"}</p>
                  <p>Condition: {formData.deviceCondition || "Not specified"}</p>
                  <p>Warranty: {formData.warrantyMonths ? `${formData.warrantyMonths} months` : "Not specified"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Documents</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Photos: {formData.photos.length} uploaded</p>
                  <p>Receipt: {formData.receipt ? "✓ Uploaded" : "Not uploaded"}</p>
                  <p>Warranty Document: {formData.warrantyDocument ? "✓ Uploaded" : "Not uploaded"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Purchase Information</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Purchase Date: {formData.purchaseDate || "Not specified"}</p>
                  <p>Purchase Price: {formData.purchasePrice ? `R${formData.purchasePrice}` : "Not specified"}</p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <BackButton />
        
        <div className="mt-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Device</h1>
            <p className="text-muted-foreground">Update your device information - Step {step} of 4</p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Device Info</span>
              <span>Documents</span>
              <span>Purchase</span>
              <span>Review</span>
            </div>
          </div>

          <Card className="p-6">
            {renderStep()}
          </Card>

          <div className="flex gap-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isSaving}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={isSaving}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={() => navigate("/my-devices")}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDevice;
