import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Phone, Mail, Camera, Fingerprint, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkIMEIDatabase, verifyReceiptOCR, detectOSTampering, attestDevice, generateDeviceFingerprint, logSecurityEvent } from "@/lib/security";

interface SecurityVerificationProps {
  onVerificationComplete?: (results: any) => void;
  showAllChecks?: boolean;
}

export const SecurityVerification = ({ onVerificationComplete, showAllChecks = false }: SecurityVerificationProps) => {
  const [verificationResults, setVerificationResults] = useState<any>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [phoneCode, setPhoneCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [imei, setImei] = useState("");
  const { toast } = useToast();

  const runSecurityCheck = async (checkType: string, checkFunction: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [checkType]: true }));
    
    try {
      const result = await checkFunction();
      setVerificationResults(prev => ({ ...prev, [checkType]: result }));
      
      await logSecurityEvent(`security_check_${checkType}`, result);
      
      toast({
        title: `${checkType} Check Complete`,
        description: `Status: ${result.status || (result.isGenuine !== undefined ? (result.isGenuine ? 'Genuine' : 'Suspicious') : 'Completed')}`,
      });
    } catch (error) {
      toast({
        title: "Security Check Failed",
        description: `Failed to complete ${checkType} verification`,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [checkType]: false }));
    }
  };

  const handleIMEICheck = () => {
    if (!imei) {
      toast({
        title: "IMEI Required",
        description: "Please enter an IMEI number to check",
        variant: "destructive"
      });
      return;
    }
    runSecurityCheck('imei', () => checkIMEIDatabase(imei));
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      runSecurityCheck('receipt', () => verifyReceiptOCR(file));
    }
  };

  const handleDeviceFingerprint = async () => {
    const fingerprint = await generateDeviceFingerprint();
    setVerificationResults(prev => ({ 
      ...prev, 
      fingerprint: { id: fingerprint, timestamp: new Date().toISOString() }
    }));
    
    logSecurityEvent('device_fingerprint', { fingerprint });
    
    toast({
      title: "Device Fingerprint Generated",
      description: `ID: ${fingerprint.substring(0, 8)}...`
    });
  };

  const handleOSCheck = () => {
    const result = detectOSTampering();
    setVerificationResults(prev => ({ ...prev, osCheck: result }));
    
    logSecurityEvent('os_tamper_check', result);
    
    toast({
      title: "OS Integrity Check",
      description: result.isTampered ? "⚠️ Tampering detected" : "✅ Device secure",
      variant: result.isTampered ? "destructive" : "default"
    });
  };

  const handleDeviceAttestation = () => {
    runSecurityCheck('attestation', attestDevice);
  };

  const handlePhoneVerification = () => {
    // Mock phone verification
    const success = phoneCode === "123456";
    const result = { verified: success, method: 'SMS' };
    
    setVerificationResults(prev => ({ ...prev, phone: result }));
    logSecurityEvent('phone_verification', result);
    
    toast({
      title: success ? "Phone Verified" : "Verification Failed",
      description: success ? "SMS verification successful" : "Invalid code. Try '123456' for testing",
      variant: success ? "default" : "destructive"
    });
  };

  const handleEmailVerification = () => {
    // Mock email verification
    const success = emailCode === "VERIFY";
    const result = { verified: success, method: 'Email' };
    
    setVerificationResults(prev => ({ ...prev, email: result }));
    logSecurityEvent('email_verification', result);
    
    toast({
      title: success ? "Email Verified" : "Verification Failed",
      description: success ? "Email verification successful" : "Invalid code. Try 'VERIFY' for testing",
      variant: success ? "default" : "destructive"
    });
  };

  const getStatusBadge = (result: any, type: string) => {
    if (!result) return null;
    
    let variant: "default" | "destructive" | "secondary" = "default";
    let text = "Unknown";
    
    switch (type) {
      case 'imei':
        variant = result.isStolen ? "destructive" : "default";
        text = result.status;
        break;
      case 'receipt':
        variant = result.isAuthentic ? "default" : "destructive";
        text = result.isAuthentic ? "Authentic" : "Suspicious";
        break;
      case 'osCheck':
        variant = result.isTampered ? "destructive" : "default";
        text = result.isTampered ? "Tampered" : "Secure";
        break;
      case 'attestation':
        variant = result.isGenuine ? "default" : "destructive";
        text = result.isGenuine ? "Genuine" : "Suspicious";
        break;
      case 'phone':
      case 'email':
        variant = result.verified ? "default" : "destructive";
        text = result.verified ? "Verified" : "Failed";
        break;
    }
    
    return <Badge variant={variant}>{text}</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Verification Center
        </CardTitle>
        <CardDescription>
          Test and verify security features. Use test values as described below.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Device Verification */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Device Verification</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI Check</Label>
              <div className="flex gap-2">
                <Input
                  id="imei"
                  placeholder="Enter IMEI (try: 123456789012345)"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                />
                <Button 
                  onClick={handleIMEICheck}
                  disabled={loading.imei}
                  size="sm"
                >
                  {loading.imei ? "Checking..." : "Check"}
                </Button>
              </div>
              {verificationResults.imei && getStatusBadge(verificationResults.imei, 'imei')}
            </div>

            <div className="space-y-2">
              <Label>Receipt Verification</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="file:mr-2"
                />
                <Camera className="h-4 w-4 self-center" />
              </div>
              {verificationResults.receipt && getStatusBadge(verificationResults.receipt, 'receipt')}
              <p className="text-xs text-muted-foreground">
                Tip: Use filename with 'real' for authentic, anything else for suspicious
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* User Verification */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">User Verification</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Verification</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  placeholder="Enter code (try: 123456)"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                />
                <Button 
                  onClick={handlePhoneVerification}
                  size="sm"
                  variant="outline"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
              {verificationResults.phone && getStatusBadge(verificationResults.phone, 'phone')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Verification</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  placeholder="Enter code (try: VERIFY)"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                />
                <Button 
                  onClick={handleEmailVerification}
                  size="sm"
                  variant="outline"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              {verificationResults.email && getStatusBadge(verificationResults.email, 'email')}
            </div>
          </div>
        </div>

        <Separator />

        {/* Device Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Device Security</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={handleDeviceFingerprint}
              variant="outline"
              size="sm"
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              Fingerprint
            </Button>
            
            <Button 
              onClick={handleOSCheck}
              variant="outline"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              OS Check
            </Button>
            
            <Button 
              onClick={handleDeviceAttestation}
              disabled={loading.attestation}
              variant="outline"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading.attestation ? "Checking..." : "Attestation"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {verificationResults.fingerprint && (
              <div className="p-2 bg-muted rounded">
                <strong>Fingerprint:</strong> {verificationResults.fingerprint.id.substring(0, 12)}...
              </div>
            )}
            {verificationResults.osCheck && (
              <div className={`p-2 rounded ${verificationResults.osCheck.isTampered ? 'bg-destructive/10' : 'bg-green-100'}`}>
                <strong>OS Status:</strong> {verificationResults.osCheck.isTampered ? 'Tampered' : 'Secure'}
              </div>
            )}
            {verificationResults.attestation && (
              <div className={`p-2 rounded ${verificationResults.attestation.isGenuine ? 'bg-green-100' : 'bg-destructive/10'}`}>
                <strong>Attestation:</strong> {verificationResults.attestation.details}
              </div>
            )}
          </div>
        </div>

        {Object.keys(verificationResults).length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Verification Summary</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(verificationResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};