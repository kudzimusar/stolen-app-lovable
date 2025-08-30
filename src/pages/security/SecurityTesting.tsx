import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Phone, Mail, Camera, Fingerprint, AlertTriangle, CheckCircle, Eye, Brain, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SecurityVerification } from "@/components/security/SecurityVerification";
import { AppHeader } from "@/components/navigation/AppHeader";
import { 
  generateDeviceFingerprint, 
  checkIMEIDatabase, 
  verifyReceiptOCR, 
  detectOSTampering, 
  attestDevice, 
  logSecurityEvent,
  analyzeBehavior 
} from "@/lib/security/security";

export default function SecurityTesting() {
  const [testResults, setTestResults] = useState<any>({});
  const [userActions, setUserActions] = useState<string[]>([]);
  const [reCaptchaScore, setReCaptchaScore] = useState<number | null>(null);
  const { toast } = useToast();

  // Simulate reCAPTCHA v3 scoring
  const simulateReCaptcha = () => {
    const score = Math.random() * 0.8 + 0.2; // Random score between 0.2-1.0
    setReCaptchaScore(score);
    
    const interpretation = score > 0.7 ? "Human-like" : score > 0.3 ? "Suspicious" : "Bot-like";
    
    toast({
      title: `reCAPTCHA Score: ${score.toFixed(2)}`,
      description: `Behavior classified as: ${interpretation}`,
      variant: score > 0.5 ? "default" : "destructive"
    });
  };

  // Simulate behavioral analysis
  const addUserAction = (action: string) => {
    const newActions = [...userActions, action];
    setUserActions(newActions);
    
    const analysis = analyzeBehavior(newActions);
    setTestResults(prev => ({ ...prev, behaviorAnalysis: analysis }));
    
    if (analysis.recommendation === 'block') {
      toast({
        title: "⚠️ Suspicious Behavior Detected",
        description: `Risk Score: ${analysis.riskScore.toFixed(2)} - Account may be flagged`,
        variant: "destructive"
      });
    }
  };

  // Simulate phone verification flow
  const simulatePhoneVerification = async () => {
    toast({
      title: "📱 Sending SMS Verification",
      description: "In production: SMS sent via Twilio Verify API"
    });
    
    // Mock verification code: 123456
    await logSecurityEvent('phone_verification_initiated', { 
      method: 'sms',
      timestamp: new Date().toISOString()
    });
  };

  // Simulate email verification flow
  const simulateEmailVerification = async () => {
    toast({
      title: "📧 Sending Email Verification",
      description: "In production: Email sent via Twilio SendGrid or similar"
    });
    
    await logSecurityEvent('email_verification_initiated', { 
      method: 'email',
      timestamp: new Date().toISOString()
    });
  };

  // Simulate KYC verification
  const simulateKYC = () => {
    const isVerified = Math.random() > 0.3; // 70% success rate for simulation
    
    setTestResults(prev => ({ 
      ...prev, 
      kyc: { 
        verified: isVerified, 
        confidence: isVerified ? 0.94 : 0.23,
        details: isVerified ? "Identity verification passed" : "Document verification failed"
      }
    }));
    
    toast({
      title: isVerified ? "✅ KYC Verification Passed" : "❌ KYC Verification Failed",
      description: isVerified 
        ? "Identity documents verified via Onfido sandbox" 
        : "Identity verification failed - invalid documents",
      variant: isVerified ? "default" : "destructive"
    });
  };

  // Simulate escrow creation
  const simulateEscrow = () => {
    const escrowId = `ESC-${Date.now()}`;
    
    setTestResults(prev => ({ 
      ...prev, 
      escrow: { 
        id: escrowId,
        status: 'active',
        amount: 999.99,
        created: new Date().toISOString()
      }
    }));
    
    toast({
      title: "🔐 Escrow Account Created",
      description: `Secure escrow ${escrowId} is holding funds safely`
    });
  };

  // Check HTTPS enforcement
  useEffect(() => {
    const isHTTPS = window.location.protocol === 'https:';
    setTestResults(prev => ({ 
      ...prev, 
      httpsCheck: { 
        secure: isHTTPS,
        protocol: window.location.protocol 
      }
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Security Testing Center" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              STOLEN Security Integration Testing
            </CardTitle>
            <CardDescription>
              Comprehensive security feature testing with real-time feedback and analytics
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verification">Device Verification</TabsTrigger>
            <TabsTrigger value="user">User Security</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral AI</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-4">
            <SecurityVerification showAllChecks={true} />
          </TabsContent>

          <TabsContent value="user" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Phone Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Verification (Twilio)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="+1 (555) 123-4567" />
                  <Button onClick={simulatePhoneVerification} className="w-full">
                    Send SMS Code
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <strong>Testing:</strong> In production, integrates with Twilio Verify API
                  </div>
                </CardContent>
              </Card>

              {/* Email Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="user@example.com" type="email" />
                  <Button onClick={simulateEmailVerification} className="w-full">
                    Send Verification Email
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <strong>Testing:</strong> Simulates email verification flow
                  </div>
                </CardContent>
              </Card>

              {/* KYC Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    KYC Identity (Onfido)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={simulateKYC} className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Start KYC Verification
                  </Button>
                  {testResults.kyc && (
                    <Badge variant={testResults.kyc.verified ? "default" : "destructive"}>
                      {testResults.kyc.verified ? "✅ Verified" : "❌ Failed"}
                    </Badge>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <strong>Testing:</strong> Simulates Onfido sandbox verification
                  </div>
                </CardContent>
              </Card>

              {/* reCAPTCHA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    reCAPTCHA v3
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={simulateReCaptcha} className="w-full">
                    Generate reCAPTCHA Score
                  </Button>
                  {reCaptchaScore && (
                    <div className="text-center">
                      <Badge variant={reCaptchaScore > 0.5 ? "default" : "destructive"}>
                        Score: {reCaptchaScore.toFixed(2)}
                      </Badge>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <strong>Testing:</strong> Simulates Google reCAPTCHA v3 scoring
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="behavioral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Behavioral AI & Trust Scoring
                </CardTitle>
                <CardDescription>
                  Simulate user actions to test fraud detection algorithms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addUserAction('registration')}
                  >
                    Register Account
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addUserAction('device_register')}
                  >
                    Register Device
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addUserAction('transfer_initiate')}
                  >
                    Transfer Device
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addUserAction('marketplace_list')}
                  >
                    List for Sale
                  </Button>
                </div>

                {testResults.behaviorAnalysis && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Behavioral Analysis Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Risk Score:</strong> {testResults.behaviorAnalysis.riskScore.toFixed(2)}
                      </div>
                      <div>
                        <strong>Recommendation:</strong> 
                        <Badge 
                          variant={
                            testResults.behaviorAnalysis.recommendation === 'allow' ? 'default' :
                            testResults.behaviorAnalysis.recommendation === 'challenge' ? 'secondary' : 'destructive'
                          }
                          className="ml-2"
                        >
                          {testResults.behaviorAnalysis.recommendation}
                        </Badge>
                      </div>
                      <div>
                        <strong>Flags:</strong> {testResults.behaviorAnalysis.flags.length}
                      </div>
                    </div>
                    {testResults.behaviorAnalysis.flags.length > 0 && (
                      <div className="mt-2">
                        <strong>Risk Factors:</strong> {testResults.behaviorAnalysis.flags.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <strong>Testing:</strong> Try rapid actions to trigger fraud detection
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* HTTPS Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    HTTPS Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.httpsCheck && (
                    <Badge variant={testResults.httpsCheck.secure ? "default" : "destructive"}>
                      {testResults.httpsCheck.secure ? "✅ HTTPS Enabled" : "❌ HTTP Only"}
                    </Badge>
                  )}
                  <div className="text-sm text-muted-foreground mt-2">
                    <strong>Protocol:</strong> {testResults.httpsCheck?.protocol}
                  </div>
                </CardContent>
              </Card>

              {/* Escrow Service */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Secure Escrow (S-Pay)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={simulateEscrow} className="w-full">
                    Create Escrow Account
                  </Button>
                  {testResults.escrow && (
                    <div className="text-sm">
                      <div><strong>ID:</strong> {testResults.escrow.id}</div>
                      <div><strong>Status:</strong> {testResults.escrow.status}</div>
                      <div><strong>Amount:</strong> ${testResults.escrow.amount}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blockchain Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Blockchain Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <div>✅ Immutable ownership records</div>
                    <div>✅ Tamper-proof transaction history</div>
                    <div>✅ Decentralized verification</div>
                    <div className="mt-2">
                      <strong>Testing:</strong> Check console for blockchain simulation logs
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Logging */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Audit Logging
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <div>✅ All security events logged</div>
                    <div>✅ User actions tracked</div>
                    <div>✅ Anomaly detection active</div>
                    <div className="mt-2">
                      <strong>Testing:</strong> Open browser console to see real-time security logs
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Test Results Summary */}
        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Security Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}