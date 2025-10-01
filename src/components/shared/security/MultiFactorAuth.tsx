import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Clock,
  RefreshCw,
  QrCode,
  Copy
} from 'lucide-react';

export interface MFAMethod {
  id: string;
  type: 'sms' | 'email' | 'totp' | 'backup_codes' | 'biometric';
  name: string;
  enabled: boolean;
  verified: boolean;
  lastUsed?: Date;
}

export interface MFASetup {
  userId: string;
  methods: MFAMethod[];
  backupCodes: string[];
  qrCode?: string;
  secretKey?: string;
}

export interface MultiFactorAuthProps {
  userId: string;
  onSetupComplete?: (setup: MFASetup) => void;
  onVerificationComplete?: (method: string) => void;
  enableBiometric?: boolean;
  requireBackupCodes?: boolean;
  className?: string;
}

export const MultiFactorAuth: React.FC<MultiFactorAuthProps> = ({
  userId,
  onSetupComplete,
  onVerificationComplete,
  enableBiometric = true,
  requireBackupCodes = true,
  className = ''
}) => {
  const [mfaSetup, setMfaSetup] = useState<MFASetup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const { toast } = useToast();

  // Mock MFA setup data
  const mockMFASetup: MFASetup = {
    userId,
    methods: [
      {
        id: 'sms',
        type: 'sms',
        name: 'SMS Verification',
        enabled: false,
        verified: false
      },
      {
        id: 'email',
        type: 'email',
        name: 'Email Verification',
        enabled: false,
        verified: false
      },
      {
        id: 'totp',
        type: 'totp',
        name: 'Authenticator App',
        enabled: false,
        verified: false
      },
      {
        id: 'backup_codes',
        type: 'backup_codes',
        name: 'Backup Codes',
        enabled: false,
        verified: false
      }
    ],
    backupCodes: [
      'ABCD-EFGH-IJKL',
      'MNOP-QRST-UVWX',
      'YZAB-CDEF-GHIJ',
      'KLMN-OPQR-STUV',
      'WXYZ-ABCD-EFGH'
    ],
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    secretKey: 'JBSWY3DPEHPK3PXP'
  };

  useEffect(() => {
    fetchMFASetup();
  }, [userId]);

  const fetchMFASetup = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMfaSetup(mockMFASetup);
      
    } catch (error) {
      console.error('Failed to fetch MFA setup:', error);
      toast({
        title: "Error",
        description: "Failed to load MFA settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enableMethod = async (methodId: string) => {
    if (!mfaSetup) return;

    try {
      setIsVerifying(true);
      
      // Simulate enabling method
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSetup = {
        ...mfaSetup,
        methods: mfaSetup.methods.map(method =>
          method.id === methodId 
            ? { ...method, enabled: true, verified: true, lastUsed: new Date() }
            : method
        )
      };
      
      setMfaSetup(updatedSetup);
      setSelectedMethod(methodId);
      setStep('verify');
      
      toast({
        title: "Method Enabled",
        description: `${mfaSetup.methods.find(m => m.id === methodId)?.name} has been enabled`
      });
      
    } catch (error) {
      console.error('Failed to enable method:', error);
      toast({
        title: "Error",
        description: "Failed to enable MFA method",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a verification code",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsVerifying(true);
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification success
      if (verificationCode === '123456' || verificationCode.length >= 6) {
        toast({
          title: "Verification Successful",
          description: "MFA method has been verified and enabled"
        });
        
        setStep('complete');
        onVerificationComplete?.(selectedMethod);
        
        // Update the method as verified
        if (mfaSetup) {
          const updatedSetup = {
            ...mfaSetup,
            methods: mfaSetup.methods.map(method =>
              method.id === selectedMethod 
                ? { ...method, verified: true, lastUsed: new Date() }
                : method
            )
          };
          setMfaSetup(updatedSetup);
        }
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyBackupCodes = () => {
    if (mfaSetup?.backupCodes) {
      navigator.clipboard.writeText(mfaSetup.backupCodes.join('\n'));
      toast({
        title: "Backup Codes Copied",
        description: "Backup codes have been copied to clipboard"
      });
    }
  };

  const getMethodIcon = (type: string) => {
    const icons = {
      sms: Smartphone,
      email: Mail,
      totp: Key,
      backup_codes: Shield,
      biometric: Shield
    };
    return icons[type] || Shield;
  };

  const getMethodDescription = (type: string) => {
    const descriptions = {
      sms: 'Receive verification codes via SMS',
      email: 'Receive verification codes via email',
      totp: 'Use authenticator apps like Google Authenticator',
      backup_codes: 'One-time use codes for account recovery',
      biometric: 'Use fingerprint or face recognition'
    };
    return descriptions[type] || 'MFA method';
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!mfaSetup) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-2" />
          <p>Unable to load MFA settings</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Multi-Factor Authentication
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'setup' && (
            <>
              <div className="text-sm text-muted-foreground">
                Secure your account with multiple authentication methods. 
                We recommend enabling at least 2 methods for better security.
              </div>

              {/* MFA Methods */}
              <div className="space-y-3">
                {mfaSetup.methods.map((method) => {
                  const Icon = getMethodIcon(method.type);
                  const isEnabled = method.enabled && method.verified;
                  
                  return (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg ${
                        isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{method.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getMethodDescription(method.type)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isEnabled ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => enableMethod(method.id)}
                              disabled={isVerifying}
                            >
                              {isVerifying ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Shield className="w-4 h-4 mr-2" />
                              )}
                              Enable
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Backup Codes */}
              {requireBackupCodes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-800">Backup Codes</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Save these backup codes in a secure location. You can use them to access your account if you lose your other authentication methods.
                      </p>
                      <div className="mt-3">
                        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                          {mfaSetup.backupCodes.map((code, index) => (
                            <div key={index} className="p-2 bg-white rounded border">
                              {code}
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyBackupCodes}
                          className="mt-3"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Codes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Verify Your Method</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the verification code sent to your {selectedMethod === 'sms' ? 'phone' : 'email'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Verification Code</label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="mt-1"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={verifyCode}
                    disabled={!verificationCode.trim() || isVerifying}
                    className="flex-1"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Verify Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep('setup')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">MFA Setup Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Your account is now protected with multi-factor authentication.
              </p>
              <Button onClick={() => setStep('setup')}>
                Manage MFA Settings
              </Button>
            </div>
          )}

          {/* Security Status */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Security Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Enabled Methods:</span>
                <span className="font-medium">
                  {mfaSetup.methods.filter(m => m.enabled && m.verified).length} / {mfaSetup.methods.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
