// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRScanner } from '@/components/ui/QRScanner';
import { 
  QrCode, 
  Fingerprint, 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Zap,
  Eye,
  Download,
  Share,
  Clock,
  MapPin,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TrustVisualization } from './TrustVisualization';

interface VerificationResult {
  success: boolean;
  deviceId?: string;
  serialNumber?: string;
  status: 'clean' | 'stolen' | 'lost' | 'flagged' | 'unknown';
  confidence: number;
  method: 'qr_scan' | 'serial_lookup' | 'ocr_document' | 'image_recognition';
  timestamp: Date;
  evidence: string[];
  riskFactors: string[];
  recommendations: string[];
  blockchainHash?: string;
}

interface VerificationScannerProps {
  onVerificationComplete?: (result: VerificationResult) => void;
  mode?: 'full' | 'quick' | 'embedded';
  autoStart?: boolean;
}

export const EnhancedVerificationScanner: React.FC<VerificationScannerProps> = ({
  onVerificationComplete,
  mode = 'full',
  autoStart = false
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [activeTab, setActiveTab] = useState<'qr' | 'serial' | 'ocr' | 'image'>('qr');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Input states
  const [serialNumber, setSerialNumber] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (autoStart && activeTab === 'qr') {
      setIsScanning(true);
    }
  }, [autoStart, activeTab]);

  // Verification methods
  const handleQRScan = async (data: string) => {
    setIsScanning(false);
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate processing steps
      const steps = [
        { step: 'Parsing QR data...', progress: 20 },
        { step: 'Checking blockchain records...', progress: 40 },
        { step: 'Validating ownership...', progress: 60 },
        { step: 'Running fraud checks...', progress: 80 },
        { step: 'Generating trust score...', progress: 100 }
      ];

      for (const { step, progress: stepProgress } of steps) {
        setProgress(stepProgress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Mock verification result
      const result: VerificationResult = {
        success: true,
        deviceId: data.includes('DEVICE') ? data.split('DEVICE')[1].slice(0, 8) : 'DEV12345',
        serialNumber: `SN${data.slice(-8)}`,
        status: 'clean',
        confidence: 96,
        method: 'qr_scan',
        timestamp: new Date(),
        evidence: ['QR Code Valid', 'Blockchain Record Found', 'No Theft Reports'],
        riskFactors: [],
        recommendations: ['Device verified as authentic', 'Safe to proceed with transaction'],
        blockchainHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'
      };

      setVerificationResult(result);
      setShowResult(true);
      onVerificationComplete?.(result);

      toast({
        title: 'Device Verified',
        description: `Device verified as ${result.status} with ${result.confidence}% confidence`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Unable to verify device. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSerialVerification = async () => {
    if (!serialNumber.trim()) {
      toast({
        title: 'Serial Number Required',
        description: 'Please enter a valid serial number',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate serial number verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: VerificationResult = {
        success: true,
        deviceId: 'DEV' + serialNumber.slice(-5),
        serialNumber,
        status: 'clean',
        confidence: 88,
        method: 'serial_lookup',
        timestamp: new Date(),
        evidence: ['Serial Number Valid', 'No Theft Reports'],
        riskFactors: [],
        recommendations: ['Device appears legitimate'],
        blockchainHash: '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p1a'
      };

      setVerificationResult(result);
      setShowResult(true);
      onVerificationComplete?.(result);

      toast({
        title: 'Verification Complete',
        description: `Serial number verified with ${result.confidence}% confidence`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Unable to verify serial number',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentOCR = async () => {
    if (!documentText.trim()) {
      toast({
        title: 'Document Text Required',
        description: 'Please enter document text to analyze',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result: VerificationResult = {
        success: true,
        deviceId: 'DOCDEV123',
        serialNumber: 'SN123456789',
        status: 'clean',
        confidence: 92,
        method: 'ocr_document',
        timestamp: new Date(),
        evidence: ['Document Text Analyzed', 'Receipt Validated', 'Purchase Date Valid'],
        riskFactors: [],
        recommendations: ['Document appears authentic'],
        blockchainHash: '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p1a2b'
      };

      setVerificationResult(result);
      setShowResult(true);
      onVerificationComplete?.(result);

      toast({
        title: 'Document Verified',
        description: `Document verified with ${result.confidence}% confidence`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Unable to process document',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    
    try {
      // Simulate image processing
      await new Promise(resolve => setTimeout(resolve, 4000));

      const result: VerificationResult = {
        success: true,
        deviceId: 'IMGDEV456',
        serialNumber: 'SN987654321',
        status: 'clean',
        confidence: 85,
        method: 'image_recognition',
        timestamp: new Date(),
        evidence: ['Device Image Recognized', 'Model Identified', 'No Visual Damage'],
        riskFactors: ['Image quality could be better'],
        recommendations: ['Consider taking a clearer photo for higher confidence'],
        blockchainHash: '0x4d5e6f7g8h9i0j1k2l3m4n5o6p1a2b3c'
      };

      setVerificationResult(result);
      setShowResult(true);
      onVerificationComplete?.(result);

      toast({
        title: 'Image Verified',
        description: `Device recognized with ${result.confidence}% confidence`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Unable to process image',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string, confidence: number) => {
    if (confidence >= 90) {
      return status === 'clean' ? <CheckCircle className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-600" />;
    } else if (confidence >= 70) {
      return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    } else {
      return <XCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (mode === 'embedded' && verificationResult) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(verificationResult.status, verificationResult.confidence)}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{verificationResult.status}</span>
              <Badge variant="outline">{verificationResult.confidence}% confidence</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Verified via {verificationResult.method.replace('_', ' ')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowResult(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Details
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Scanner Interface */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Device Verification</h3>
            <p className="text-sm text-muted-foreground">
              Verify device authenticity using multiple methods
            </p>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h4 className="font-medium">Verifying Device...</h4>
              <p className="text-sm text-muted-foreground">
                Running security checks and blockchain validation
              </p>
            </div>
            <Progress value={progress} className="max-w-xs mx-auto" />
          </div>
        )}

        {/* Scanner Tabs */}
        {!isProcessing && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="serial" className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                Serial
              </TabsTrigger>
              <TabsTrigger value="ocr" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Document
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium mb-2">Scan QR Code</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Point your camera at the device QR code or STOLEN verification tag
                </p>
                {isScanning ? (
                  <div className="max-w-sm mx-auto">
                    <QRScanner onScanSuccess={handleQRScan} />
                  </div>
                ) : (
                  <Button onClick={() => setIsScanning(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Start QR Scanner
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="serial" className="space-y-4">
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Enter Serial Number</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Find the serial number in device settings or on the device label
                  </p>
                </div>
                <Input
                  placeholder="Enter device serial number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="text-center font-mono"
                />
                <Button onClick={handleSerialVerification} className="w-full">
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Verify Serial Number
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ocr" className="space-y-4">
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Document Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Paste receipt text or document content for verification
                  </p>
                </div>
                <Textarea
                  placeholder="Paste receipt or document text here..."
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  rows={6}
                />
                <Button onClick={handleDocumentOCR} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Analyze Document
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Image Recognition</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a clear photo of the device for AI analysis
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline" 
                  className="w-full h-24 border-dashed"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm">Click to upload image</div>
                  </div>
                </Button>

                {uploadedFile && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {uploadedFile.name}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Card>

      {/* Verification Result Modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Device Verification Result</DialogTitle>
          </DialogHeader>
          
          {verificationResult && (
            <div className="space-y-6">
              {/* Result Summary */}
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(verificationResult.status, verificationResult.confidence)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold capitalize">
                        {verificationResult.status}
                      </span>
                      <Badge variant="outline">
                        {verificationResult.confidence}% Confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Verified via {verificationResult.method.replace('_', ' ')} on {verificationResult.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Evidence & Risk Factors */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Evidence Found
                  </h4>
                  <div className="space-y-2">
                    {verificationResult.evidence.map((evidence, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        {evidence}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Risk Factors
                  </h4>
                  {verificationResult.riskFactors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No risk factors detected</p>
                  ) : (
                    <div className="space-y-2">
                      {verificationResult.riskFactors.map((risk, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                          {risk}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {verificationResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Trust Visualization */}
              {verificationResult.deviceId && (
                <TrustVisualization 
                  deviceId={verificationResult.deviceId} 
                  showFullDetails={true}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
