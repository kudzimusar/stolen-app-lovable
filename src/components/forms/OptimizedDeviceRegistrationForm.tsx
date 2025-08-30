import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QrCode, Upload, MapPin, FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { TrustBadge } from "./TrustBadge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkIMEIDatabase, verifyReceiptOCR, generateDeviceFingerprint, logSecurityEvent, analyzeBehavior } from "@/lib/security";

// Import performance optimization hooks
import { 
  useOptimizedApiCall, 
  useImageOptimization, 
  useBackgroundJobs, 
  usePerformanceMonitoring,
  useDebounce 
} from '@/hooks/usePerformanceOptimization';

export const OptimizedDeviceRegistrationForm = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    deviceModel: '',
    serialNumber: '',
    imei: '',
    brand: '',
    color: '',
    description: '',
    purchasePrice: ''
  });
  const [securityChecks, setSecurityChecks] = useState({
    imeiVerified: false,
    receiptVerified: false,
    deviceFingerprint: '',
    osIntegrity: null as any
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Performance optimization hooks
  const { uploadImage, optimizeImageUrl } = useImageOptimization();
  const { addNotification, addDataProcessing } = useBackgroundJobs();
  const { trackComponentRender, trackUserInteraction } = usePerformanceMonitoring();
  
  // Debounced IMEI for search optimization
  const debouncedImei = useDebounce(formData.imei, 500);

  // Track component render performance
  useEffect(() => {
    const cleanup = trackComponentRender('OptimizedDeviceRegistrationForm');
    return cleanup;
  }, []);

  // Optimized API call for device registration
  const { mutate: registerDevice, isLoading: isRegisteringOptimized } = useOptimizedApiCall(
    'register-device',
    '/api/register-device',
    {},
    { 
      ttl: 0, // No cache for registration
      tags: ['device-registration'] 
    }
  );

  // Optimized IMEI verification with caching
  const { data: imeiVerification, refetch: verifyImei } = useOptimizedApiCall(
    `imei-verification-${debouncedImei}`,
    `/api/imei-verification/${debouncedImei}`,
    {},
    { 
      ttl: 3600, // Cache for 1 hour
      tags: ['imei-verification'],
      enabled: debouncedImei.length >= 15 // Only run when IMEI is complete
    }
  );

  // Auto-verify IMEI when it's complete
  useEffect(() => {
    if (debouncedImei.length >= 15) {
      verifyImei();
    }
  }, [debouncedImei, verifyImei]);

  const handleInputChange = useCallback((field: string, value: string) => {
    const cleanup = trackUserInteraction('form_input_change');
    setFormData(prev => ({ ...prev, [field]: value }));
    cleanup();
  }, [trackUserInteraction]);

  const handleIMEIVerification = useCallback(async () => {
    if (!formData.imei) {
      toast({
        title: "IMEI Required",
        description: "Please enter an IMEI number for verification",
        variant: "destructive"
      });
      return;
    }

    const cleanup = trackUserInteraction('imei_verification');
    
    try {
      const result = await checkIMEIDatabase(formData.imei);
      setSecurityChecks(prev => ({ ...prev, imeiVerified: !result.isStolen }));
      
      // Add background job for security logging
      await addDataProcessing({
        type: 'security_log',
        payload: {
          event: 'imei_verification',
          result,
          timestamp: new Date().toISOString()
        }
      });
      
      toast({
        title: result.isStolen ? "⚠️ SECURITY ALERT" : "✅ IMEI Verified",
        description: result.isStolen 
          ? "This device is flagged as stolen in our database" 
          : "Device passed IMEI verification checks",
        variant: result.isStolen ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Verification Failed", 
        description: "Could not verify IMEI at this time",
        variant: "destructive"
      });
    } finally {
      cleanup();
    }
  }, [formData.imei, addDataProcessing, trackUserInteraction, toast]);

  const handleReceiptUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const cleanup = trackUserInteraction('receipt_upload');
    setUploading(true);
    
    try {
      // Optimize image before processing
      const optimizedImage = await uploadImage(file, {
        width: 800,
        height: 600,
        quality: 85,
        format: 'webp'
      });

      const result = await verifyReceiptOCR(optimizedImage.url);
      setSecurityChecks(prev => ({ ...prev, receiptVerified: result.isAuthentic }));
      
      // Add background notification
      await addNotification({
        userId: 'current-user',
        type: 'receipt_verified',
        message: `Receipt for ${formData.deviceModel} verified successfully`,
        metadata: { result }
      });
      
      toast({
        title: result.isAuthentic ? "✅ Receipt Verified" : "⚠️ Suspicious Receipt",
        description: result.isAuthentic 
          ? "Receipt appears authentic and contains valid purchase information"
          : "Receipt verification failed - document may be tampered with",
        variant: result.isAuthentic ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not process receipt image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      cleanup();
    }
  }, [uploadImage, formData.deviceModel, addNotification, trackUserInteraction, toast]);

  const runSecurityChecks = useCallback(async () => {
    const cleanup = trackUserInteraction('security_checks');
    
    try {
      // Generate device fingerprint
      const fingerprint = await generateDeviceFingerprint();
      setSecurityChecks(prev => ({ ...prev, deviceFingerprint: fingerprint }));
      
      // Add background job for security logging
      await addDataProcessing({
        type: 'security_log',
        payload: {
          event: 'device_registration_attempt',
          deviceModel: formData.deviceModel,
          fingerprint,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      cleanup();
    }
  }, [formData.deviceModel, addDataProcessing, trackUserInteraction]);

  const handleRegister = useCallback(async () => {
    // Validate required fields
    if (!formData.deviceModel || !formData.serialNumber || !formData.brand) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const cleanup = trackUserInteraction('device_registration');
    setIsRegistering(true);
    
    try {
      await runSecurityChecks();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Use optimized API call for registration
      const result = await registerDevice({
        serialNumber: formData.serialNumber,
        imei: formData.imei,
        deviceName: formData.deviceModel,
        brand: formData.brand,
        model: formData.deviceModel,
        color: formData.color,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        devicePhotos: [],
        securityChecks
      });

      // Add background notification
      await addNotification({
        userId: user.id,
        type: 'device_registered',
        message: `${formData.deviceModel} registered successfully`,
        metadata: { deviceModel: formData.deviceModel, serialNumber: formData.serialNumber }
      });

      toast({
        title: "🎉 Device Registered Successfully!",
        description: `Your ${formData.deviceModel} has been securely registered on the blockchain.`,
      });

      // Reset form
      setFormData({
        deviceModel: '',
        serialNumber: '',
        imei: '',
        brand: '',
        color: '',
        description: '',
        purchasePrice: ''
      });
      setSecurityChecks({
        imeiVerified: false,
        receiptVerified: false,
        deviceFingerprint: '',
        osIntegrity: null
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to register device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
      cleanup();
    }
  }, [formData, runSecurityChecks, registerDevice, addNotification, trackUserInteraction, toast]);

  return (
    <Card className="p-8 bg-gradient-card backdrop-blur-sm border-0 shadow-card">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Register Your Device</h3>
          <p className="text-muted-foreground">Secure your device with blockchain verification and AI-powered fraud detection</p>
          <div className="flex justify-center gap-2 mt-4">
            <TrustBadge type="blockchain" text="Blockchain Secured" />
            <TrustBadge type="verified" text="AI Verified" />
            <Badge variant={securityChecks.imeiVerified ? "default" : "secondary"} className="gap-1">
              <Shield className="h-3 w-3" />
              {securityChecks.imeiVerified ? "IMEI Verified" : "Security Pending"}
            </Badge>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deviceModel">Device Model *</Label>
            <Input
              id="deviceModel"
              value={formData.deviceModel}
              onChange={(e) => handleInputChange('deviceModel', e.target.value)}
              placeholder="e.g., iPhone 13 Pro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="e.g., Apple"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              placeholder="Device serial number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imei">IMEI Number</Label>
            <div className="flex gap-2">
              <Input
                id="imei"
                value={formData.imei}
                onChange={(e) => handleInputChange('imei', e.target.value)}
                placeholder="15-digit IMEI"
                maxLength={15}
              />
              <Button 
                onClick={handleIMEIVerification}
                variant="outline"
                size="sm"
                disabled={!formData.imei || formData.imei.length < 15}
              >
                <Shield className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="e.g., Space Gray"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <Input
              id="purchasePrice"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Additional details about your device..."
            rows={3}
          />
        </div>

        {/* Receipt Upload */}
        <div className="space-y-2">
          <Label>Purchase Receipt (Optional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload receipt for additional verification
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleReceiptUpload}
              className="hidden"
              id="receipt-upload"
            />
            <Button asChild variant="outline" size="sm" disabled={uploading}>
              <label htmlFor="receipt-upload" className="cursor-pointer">
                {uploading ? "Uploading..." : "Choose File"}
              </label>
            </Button>
          </div>
        </div>

        {/* Security Status */}
        <div className="space-y-2">
          <Label>Security Status</Label>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant={securityChecks.imeiVerified ? "default" : "secondary"} className="gap-1">
              {securityChecks.imeiVerified ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              IMEI Verification
            </Badge>
            <Badge variant={securityChecks.receiptVerified ? "default" : "secondary"} className="gap-1">
              {securityChecks.receiptVerified ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              Receipt Verification
            </Badge>
          </div>
        </div>

        {/* Register Button */}
        <Button 
          onClick={handleRegister}
          disabled={isRegistering || isRegisteringOptimized}
          className="w-full"
          size="lg"
        >
          {isRegistering || isRegisteringOptimized ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Registering Device...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Register Device Securely
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default OptimizedDeviceRegistrationForm;
