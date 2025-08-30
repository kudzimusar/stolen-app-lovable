import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QrCode, Upload, MapPin, FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkIMEIDatabase, verifyReceiptOCR, generateDeviceFingerprint, logSecurityEvent, analyzeBehavior } from "@/lib/security/security";

export const DeviceRegistrationForm = () => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIMEIVerification = async () => {
    if (!formData.imei) {
      toast({
        title: "IMEI Required",
        description: "Please enter an IMEI number for verification",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await checkIMEIDatabase(formData.imei);
      setSecurityChecks(prev => ({ ...prev, imeiVerified: !result.isStolen }));
      
      await logSecurityEvent('imei_verification', result);
      
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
    }
  };

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await verifyReceiptOCR(file);
      setSecurityChecks(prev => ({ ...prev, receiptVerified: result.isAuthentic }));
      
      await logSecurityEvent('receipt_verification', result);
      
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
    }
  };

  const runSecurityChecks = async () => {
    // Generate device fingerprint
    const fingerprint = await generateDeviceFingerprint();
    setSecurityChecks(prev => ({ ...prev, deviceFingerprint: fingerprint }));
    
    // Log security event
    await logSecurityEvent('device_registration_attempt', {
      deviceModel: formData.deviceModel,
      fingerprint,
      timestamp: new Date().toISOString()
    });
  };

  const handleRegister = async () => {
    // Validate required fields
    if (!formData.deviceModel || !formData.serialNumber || !formData.brand) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      await runSecurityChecks();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Call the register-device edge function
      const { data, error } = await supabase.functions.invoke('register-device', {
        body: {
          serialNumber: formData.serialNumber,
          imei: formData.imei,
          deviceName: formData.deviceModel,
          brand: formData.brand,
          model: formData.deviceModel,
          color: formData.color,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
          devicePhotos: [],
          securityChecks
        }
      });

      if (error) throw error;

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
    }
  };

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

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input 
                id="brand" 
                placeholder="Apple, Samsung, etc."
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceModel">Device Model *</Label>
              <Input 
                id="deviceModel" 
                placeholder="iPhone 15 Pro, Galaxy S24, etc."
                value={formData.deviceModel}
                onChange={(e) => handleInputChange('deviceModel', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input 
                id="serialNumber" 
                placeholder="Enter device serial number"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI Number</Label>
              <div className="flex gap-2">
                <Input 
                  id="imei" 
                  placeholder="Enter IMEI (try: 123456789012345)"
                  value={formData.imei}
                  onChange={(e) => handleInputChange('imei', e.target.value)}
                />
                <Button 
                  onClick={handleIMEIVerification}
                  variant="outline"
                  size="sm"
                  disabled={!formData.imei}
                >
                  {securityChecks.imeiVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                GSMA database check for stolen/blacklisted devices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input 
                id="color" 
                placeholder="Space Black, White, etc."
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input 
                id="purchasePrice" 
                type="number"
                placeholder="1099.99"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea 
              id="description" 
              placeholder="Any additional information about your device..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <QrCode className="w-6 h-6" />
              <span className="text-sm">Scan QR Code</span>
            </Button>
            
            <div className="relative">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 w-full relative overflow-hidden"
                disabled={uploading}
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">
                  {uploading ? "Processing..." : securityChecks.receiptVerified ? "✅ Receipt Verified" : "Upload Receipt"}
                </span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
              {securityChecks.receiptVerified && (
                <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-600" />
              )}
            </div>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MapPin className="w-6 h-6" />
              <span className="text-sm">Add Location</span>
            </Button>
          </div>

          <Button 
            variant="hero" 
            size="lg" 
            className="w-full"
            onClick={handleRegister}
            disabled={isRegistering || !formData.deviceModel || !formData.serialNumber || !formData.brand}
          >
            {isRegistering ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering on Blockchain...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Register Device with Security Verification
              </>
            )}
          </Button>

          {/* Security Status Panel */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className={`flex items-center gap-2 ${securityChecks.imeiVerified ? 'text-green-600' : 'text-muted-foreground'}`}>
                {securityChecks.imeiVerified ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                IMEI Verification
              </div>
              <div className={`flex items-center gap-2 ${securityChecks.receiptVerified ? 'text-green-600' : 'text-muted-foreground'}`}>
                {securityChecks.receiptVerified ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                Receipt Authenticity
              </div>
              <div className={`flex items-center gap-2 ${securityChecks.deviceFingerprint ? 'text-green-600' : 'text-muted-foreground'}`}>
                {securityChecks.deviceFingerprint ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                Device Fingerprint
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};