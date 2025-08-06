import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Smartphone, 
  Users, 
  Lock, 
  Fingerprint, 
  Camera, 
  Phone, 
  Mail, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  Globe,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Additional security implementations beyond the basic framework
interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void;
}

const PhoneVerification = ({ onVerified }: PhoneVerificationProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const sendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid South African phone number",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    // Simulate Twilio Verify API call
    setTimeout(() => {
      setIsCodeSent(true);
      setIsVerifying(false);
      toast({
        title: "Verification Code Sent",
        description: `Code sent to ${phoneNumber}`,
      });
    }, 2000);
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      if (verificationCode === "123456") { // Mock success code
        onVerified(phoneNumber);
        toast({
          title: "Phone Verified",
          description: "Your phone number has been successfully verified",
          variant: "default",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="w-5 h-5" />
          <span>Phone Verification</span>
        </CardTitle>
        <CardDescription>
          Verify your phone number to enhance account security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCodeSent ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="phone">South African Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+27 XX XXX XXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={15}
              />
            </div>
            <Button 
              onClick={sendVerificationCode} 
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              Send Verification Code
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Enter the 6-digit code sent to {phoneNumber}
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={verifyCode} 
                disabled={isVerifying}
                className="flex-1"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Verify Code
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCodeSent(false)}
                disabled={isVerifying}
              >
                Change Number
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface KYCVerificationProps {
  userRole: string;
  onVerified: () => void;
}

const KYCVerification = ({ userRole, onVerified }: KYCVerificationProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState<string[]>([]);
  const { toast } = useToast();

  const requiredDocuments = userRole === 'retailer' || userRole === 'repair_shop' 
    ? ['id_document', 'business_registration', 'proof_of_address']
    : ['id_document', 'proof_of_address'];

  const documentLabels: Record<string, string> = {
    id_document: 'South African ID Document',
    business_registration: 'Business Registration Certificate',
    proof_of_address: 'Proof of Address (3 months)'
  };

  const handleDocumentUpload = async (documentType: string) => {
    setIsUploading(true);
    
    // Simulate Onfido/KYC service upload
    setTimeout(() => {
      setDocumentsUploaded(prev => [...prev, documentType]);
      setIsUploading(false);
      
      toast({
        title: "Document Uploaded",
        description: `${documentLabels[documentType]} uploaded successfully`,
      });

      // Check if all documents are uploaded
      if (documentsUploaded.length + 1 === requiredDocuments.length) {
        setTimeout(() => onVerified(), 1000);
      }
    }, 2000);
  };

  const completionPercentage = (documentsUploaded.length / requiredDocuments.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>KYC Identity Verification</span>
        </CardTitle>
        <CardDescription>
          Complete identity verification for enhanced privileges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Verification Progress</span>
            <span>{documentsUploaded.length}/{requiredDocuments.length} documents</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-3">
          {requiredDocuments.map((docType) => {
            const isUploaded = documentsUploaded.includes(docType);
            
            return (
              <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {isUploaded ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{documentLabels[docType]}</p>
                    <p className="text-sm text-muted-foreground">
                      {isUploaded ? 'Uploaded and verified' : 'Required for verification'}
                    </p>
                  </div>
                </div>
                
                {!isUploaded && (
                  <Button
                    size="sm"
                    onClick={() => handleDocumentUpload(docType)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Upload'
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {completionPercentage === 100 && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              KYC verification completed! Your account has been upgraded with enhanced privileges.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

interface DeviceFingerprintingProps {
  onFingerprintGenerated: (fingerprint: string) => void;
}

const DeviceFingerprinting = ({ onFingerprintGenerated }: DeviceFingerprintingProps) => {
  const [fingerprint, setFingerprint] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fingerprintDetails, setFingerprintDetails] = useState<any>(null);

  const generateFingerprint = async () => {
    setIsGenerating(true);
    
    // Simulate FingerprintJS library
    setTimeout(() => {
      const mockFingerprint = `fp_${Math.random().toString(36).substr(2, 16)}`;
      const details = {
        browser: navigator.userAgent.split(')')[0].split('(')[1] || 'Unknown',
        platform: navigator.platform || 'Unknown',
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine ? 'Online' : 'Offline'
      };
      
      setFingerprint(mockFingerprint);
      setFingerprintDetails(details);
      setIsGenerating(false);
      onFingerprintGenerated(mockFingerprint);
    }, 2000);
  };

  useEffect(() => {
    generateFingerprint();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Fingerprint className="w-5 h-5" />
          <span>Device Fingerprinting</span>
        </CardTitle>
        <CardDescription>
          Unique device identification for security monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Generating device fingerprint...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Device Fingerprint ID</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  {fingerprint}
                </code>
                <Badge variant="outline" className="bg-success/10 text-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            {fingerprintDetails && (
              <div className="space-y-2">
                <Label>Device Details</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p><strong>Browser:</strong> {fingerprintDetails.browser}</p>
                    <p><strong>Platform:</strong> {fingerprintDetails.platform}</p>
                    <p><strong>Screen:</strong> {fingerprintDetails.screen}</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong>Timezone:</strong> {fingerprintDetails.timezone}</p>
                    <p><strong>Language:</strong> {fingerprintDetails.language}</p>
                    <p><strong>Status:</strong> {fingerprintDetails.onlineStatus}</p>
                  </div>
                </div>
              </div>
            )}

            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                This fingerprint helps detect multiple accounts from the same device and prevents fraud.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ReCaptchaProps {
  onScoreReceived: (score: number) => void;
}

const ReCaptchaSimulator = ({ onScoreReceived }: ReCaptchaProps) => {
  const [score, setScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const analyzeUser = async () => {
    setIsAnalyzing(true);
    setAttemptCount(prev => prev + 1);
    
    // Simulate reCAPTCHA v3 scoring (lower score = more bot-like)
    setTimeout(() => {
      const mockScore = Math.max(0.1, 0.9 - (attemptCount * 0.15) + (Math.random() * 0.2 - 0.1));
      setScore(Math.round(mockScore * 100) / 100);
      setIsAnalyzing(false);
      onScoreReceived(mockScore);
    }, 1500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-success";
    if (score >= 0.3) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.7) return "Human";
    if (score >= 0.3) return "Suspicious";
    return "Likely Bot";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>reCAPTCHA v3 Protection</span>
        </CardTitle>
        <CardDescription>
          Invisible bot protection running in the background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          {isAnalyzing ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Analyzing user behavior...</p>
            </div>
          ) : score !== null ? (
            <div className="space-y-3">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <p className="text-muted-foreground">Confidence Score</p>
              </div>
              <Badge 
                variant="outline" 
                className={`${score >= 0.7 ? 'bg-success/10 text-success' : 
                           score >= 0.3 ? 'bg-warning/10 text-warning' : 
                           'bg-destructive/10 text-destructive'}`}
              >
                {getScoreLabel(score)}
              </Badge>
            </div>
          ) : null}
          
          <Button onClick={analyzeUser} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Test Bot Detection'}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Attempt #{attemptCount} - Score decreases with repeated attempts
          </div>
        </div>

        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            Scores below 0.3 trigger additional verification steps or account restrictions.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export const SecurityEnhancements = () => {
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [recaptchaScore, setRecaptchaScore] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Enhanced Security Features</h2>
        <p className="text-muted-foreground">
          Advanced security implementations beyond basic framework
        </p>
      </div>

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="fingerprint">Fingerprinting</TabsTrigger>
          <TabsTrigger value="protection">Protection</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <PhoneVerification onVerified={() => setPhoneVerified(true)} />
            <KYCVerification 
              userRole="retailer" 
              onVerified={() => setKycCompleted(true)} 
            />
          </div>
        </TabsContent>

        <TabsContent value="fingerprint" className="space-y-6">
          <DeviceFingerprinting onFingerprintGenerated={setDeviceFingerprint} />
        </TabsContent>

        <TabsContent value="protection" className="space-y-6">
          <ReCaptchaSimulator onScoreReceived={setRecaptchaScore} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Status Overview</CardTitle>
              <CardDescription>Summary of all security features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5" />
                    <span>Phone Verification</span>
                  </div>
                  {phoneVerified ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5" />
                    <span>KYC Verification</span>
                  </div>
                  {kycCompleted ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Fingerprint className="w-5 h-5" />
                    <span>Device Fingerprint</span>
                  </div>
                  {deviceFingerprint ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5" />
                    <span>Bot Protection</span>
                  </div>
                  {recaptchaScore !== null ? (
                    <Badge variant={recaptchaScore >= 0.7 ? "default" : "destructive"}>
                      {recaptchaScore}
                    </Badge>
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};