import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Lock, Eye, EyeOff, Smartphone, QrCode, 
  AlertTriangle, CheckCircle, Clock, Zap, Users,
  Activity, BarChart3, Settings, RefreshCw, Download,
  Upload, Key, Fingerprint, Globe, Building2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SecurityEnhancementProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MFASetup {
  is_setup: boolean;
  mfa_type?: string;
  phone_number?: string;
  backup_codes_remaining: number;
  recent_verifications: any[];
}

interface FraudAnalysis {
  fraud_score: number;
  risk_level: string;
  risk_factors: string[];
  recommendations: string[];
  should_block: boolean;
  requires_review: boolean;
  confidence: number;
}

interface VerificationStatus {
  sa_id?: any;
  passport?: any;
  drivers_license?: any;
  proof_of_address?: any;
  bank_account?: any;
  overall_status: string;
}

interface RateLimitStatus {
  user_id: string;
  role: string;
  risk_level: string;
  rate_limits: any[];
}

const SecurityEnhancement: React.FC<SecurityEnhancementProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [mfaSetup, setMfaSetup] = useState<MFASetup | null>(null);
  const [fraudAnalysis, setFraudAnalysis] = useState<FraudAnalysis | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);
  
  // MFA Setup states
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaType, setMfaType] = useState("totp");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Real-time verification states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationType, setVerificationType] = useState("");
  const [verificationData, setVerificationData] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      fetchSecurityStatus();
    }
  }, [isOpen]);

  const fetchSecurityStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch MFA status
      const mfaResponse = await fetch('/api/v1/mfa-authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: 'get_mfa_status'
        })
      });
      
      if (mfaResponse.ok) {
        const mfaResult = await mfaResponse.json();
        setMfaSetup(mfaResult.data);
      }

      // Fetch verification status
      const verificationResponse = await fetch('/api/v1/real-time-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: 'get_verification_status'
        })
      });
      
      if (verificationResponse.ok) {
        const verificationResult = await verificationResponse.json();
        setVerificationStatus(verificationResult.data);
      }

      // Fetch rate limit status
      const rateLimitResponse = await fetch('/api/v1/advanced-rate-limiting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: 'get_rate_limit_status'
        })
      });
      
      if (rateLimitResponse.ok) {
        const rateLimitResult = await rateLimitResponse.json();
        setRateLimitStatus(rateLimitResult.data);
      }

    } catch (error) {
      console.error('Error fetching security status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupMFA = async () => {
    try {
      const response = await fetch('/api/v1/mfa-authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: 'setup_mfa',
          mfa_type: mfaType,
          phone_number: phoneNumber
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setQrCodeUrl(result.data.qr_code_url);
        setBackupCodes(result.data.backup_codes);
        toast({
          title: "MFA Setup",
          description: "MFA setup completed. Please verify with a code.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error setting up MFA:', error);
      toast({
        title: "Error",
        description: "Failed to setup MFA. Please try again.",
        variant: "destructive"
      });
    }
  };

  const verifyMFA = async () => {
    try {
      const response = await fetch('/api/v1/mfa-authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: 'verify_mfa',
          code: totpCode
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "MFA Verified",
          description: "MFA verification successful.",
        });
        setShowMFASetup(false);
        fetchSecurityStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast({
        title: "Error",
        description: "Failed to verify MFA code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const initiateVerification = async () => {
    try {
      const response = await fetch('/api/v1/real-time-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: `verify_${verificationType}`,
          ...verificationData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Verification Initiated",
          description: "Document verification has been initiated.",
        });
        setShowVerification(false);
        fetchSecurityStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error initiating verification:', error);
      toast({
        title: "Error",
        description: "Failed to initiate verification. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Advanced Security Features
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mfa">MFA</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Security Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <Progress value={87} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on MFA, verification, and fraud detection
                  </p>
                </CardContent>
              </Card>

              {/* MFA Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">MFA Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {mfaSetup?.is_setup ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className="font-medium">
                      {mfaSetup?.is_setup ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {mfaSetup?.is_setup && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {mfaSetup.backup_codes_remaining} backup codes remaining
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">FICA Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getVerificationStatusColor(verificationStatus?.overall_status || 'pending')}>
                    {verificationStatus?.overall_status?.replace('_', ' ') || 'Not Started'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time verification
                  </p>
                </CardContent>
              </Card>

              {/* Rate Limits */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {rateLimitStatus?.rate_limits?.length || 0} active limits
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rateLimitStatus?.role} • {rateLimitStatus?.risk_level} risk
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Security Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Security Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!mfaSetup?.is_setup && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <div className="font-medium">Enable Multi-Factor Authentication</div>
                          <div className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => setActiveTab("mfa")}>
                        Setup MFA
                      </Button>
                    </div>
                  )}

                  {verificationStatus?.overall_status !== 'fully_verified' && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Complete FICA Verification</div>
                          <div className="text-sm text-muted-foreground">
                            Verify your identity documents for higher limits
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => setActiveTab("verification")}>
                        Verify Documents
                      </Button>
                    </div>
                  )}

                  {fraudAnalysis?.risk_level === 'high' && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-medium">High Risk Profile Detected</div>
                          <div className="text-sm text-muted-foreground">
                            Review your transaction patterns
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => setActiveTab("monitoring")}>
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mfa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Multi-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mfaSetup?.is_setup ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">MFA is enabled</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="font-medium">Type</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {mfaSetup.mfa_type}
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="font-medium">Backup Codes</div>
                        <div className="text-sm text-muted-foreground">
                          {mfaSetup.backup_codes_remaining} remaining
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-medium">Recent Verifications</div>
                      {mfaSetup.recent_verifications?.map((verification: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="text-sm">
                            {verification.verification_type} • {new Date(verification.verified_at).toLocaleDateString()}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {verification.amount ? `R${verification.amount}` : 'Setup'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">MFA is not enabled</span>
                    </div>
                    
                    <Button onClick={() => setShowMFASetup(true)}>
                      <Lock className="w-4 h-4 mr-2" />
                      Setup MFA
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Real-time Document Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SA ID */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">South African ID</div>
                      <Badge className={getVerificationStatusColor(verificationStatus?.sa_id?.status || 'pending')}>
                        {verificationStatus?.sa_id?.status || 'Not Verified'}
                      </Badge>
                    </div>
                    {verificationStatus?.sa_id?.confidence_score && (
                      <div className="text-sm text-muted-foreground">
                        Confidence: {Math.round(verificationStatus.sa_id.confidence_score * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Passport */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Passport</div>
                      <Badge className={getVerificationStatusColor(verificationStatus?.passport?.status || 'pending')}>
                        {verificationStatus?.passport?.status || 'Not Verified'}
                      </Badge>
                    </div>
                    {verificationStatus?.passport?.confidence_score && (
                      <div className="text-sm text-muted-foreground">
                        Confidence: {Math.round(verificationStatus.passport.confidence_score * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Driver's License */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Driver's License</div>
                      <Badge className={getVerificationStatusColor(verificationStatus?.drivers_license?.status || 'pending')}>
                        {verificationStatus?.drivers_license?.status || 'Not Verified'}
                      </Badge>
                    </div>
                    {verificationStatus?.drivers_license?.confidence_score && (
                      <div className="text-sm text-muted-foreground">
                        Confidence: {Math.round(verificationStatus.drivers_license.confidence_score * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Proof of Address */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Proof of Address</div>
                      <Badge className={getVerificationStatusColor(verificationStatus?.proof_of_address?.status || 'pending')}>
                        {verificationStatus?.proof_of_address?.status || 'Not Verified'}
                      </Badge>
                    </div>
                    {verificationStatus?.proof_of_address?.confidence_score && (
                      <div className="text-sm text-muted-foreground">
                        Confidence: {Math.round(verificationStatus.proof_of_address.confidence_score * 100)}%
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <Button onClick={() => setShowVerification(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Verify New Document
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Rate Limits */}
                  <div>
                    <div className="font-medium mb-2">Rate Limits</div>
                    <div className="space-y-2">
                      {rateLimitStatus?.rate_limits?.map((limit: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="text-sm">
                            {limit.endpoint} • {limit.action}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {limit.remaining}/{limit.limit} remaining
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Risk Profile */}
                  <div>
                    <div className="font-medium mb-2">Risk Profile</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Role</div>
                        <div className="font-medium capitalize">{rateLimitStatus?.role}</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Risk Level</div>
                        <Badge className={getRiskLevelColor(rateLimitStatus?.risk_level || 'medium')}>
                          {rateLimitStatus?.risk_level}
                        </Badge>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Active Limits</div>
                        <div className="font-medium">{rateLimitStatus?.rate_limits?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MFA Setup Modal */}
        <Dialog open={showMFASetup} onOpenChange={setShowMFASetup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Setup Multi-Factor Authentication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mfa_type">MFA Type</Label>
                <Select value={mfaType} onValueChange={setMfaType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="totp">Authenticator App (TOTP)</SelectItem>
                    <SelectItem value="sms">SMS Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mfaType === 'sms' && (
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+27 123 456 789"
                  />
                </div>
              )}

              {qrCodeUrl && (
                <div className="text-center">
                  <div className="font-medium mb-2">Scan QR Code</div>
                  <div className="p-4 border rounded-lg inline-block">
                    <QrCode className="w-32 h-32" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use Google Authenticator or similar app
                  </p>
                </div>
              )}

              {backupCodes.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Backup Codes</div>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="text-sm font-mono">{code}</div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Save these codes in a secure location
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="totp_code">Verification Code</Label>
                <Input
                  id="totp_code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowMFASetup(false)}>
                  Cancel
                </Button>
                {!qrCodeUrl ? (
                  <Button onClick={setupMFA}>
                    Setup MFA
                  </Button>
                ) : (
                  <Button onClick={verifyMFA}>
                    Verify Code
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Verification Modal */}
        <Dialog open={showVerification} onOpenChange={setShowVerification}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="verification_type">Document Type</Label>
                <Select value={verificationType} onValueChange={setVerificationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sa_id">South African ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="address">Proof of Address</SelectItem>
                    <SelectItem value="bank_account">Bank Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {verificationType === 'sa_id' && (
                <>
                  <div>
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input
                      id="id_number"
                      value={verificationData.id_number || ''}
                      onChange={(e) => setVerificationData({...verificationData, id_number: e.target.value})}
                      placeholder="8001015009087"
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={verificationData.full_name || ''}
                      onChange={(e) => setVerificationData({...verificationData, full_name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={verificationData.date_of_birth || ''}
                      onChange={(e) => setVerificationData({...verificationData, date_of_birth: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="document_image">Document Image</Label>
                <Input
                  id="document_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setVerificationData({...verificationData, document_image: e.target.files?.[0]})}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowVerification(false)}>
                  Cancel
                </Button>
                <Button onClick={initiateVerification}>
                  Verify Document
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityEnhancement;
