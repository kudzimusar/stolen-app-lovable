import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Camera, 
  Upload, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Info,
  Smartphone,
  Copy
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QRCodeData {
  type: 'payment_request' | 'wallet_id' | 'contact_info' | 'verification_code';
  amount?: number;
  currency?: string;
  description?: string;
  recipientId?: string;
  recipientName?: string;
  paymentId?: string;
  walletAddress?: string;
  expiresAt?: string;
  metadata?: any;
}

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (data: QRCodeData) => void;
  mode?: 'payment' | 'contact' | 'verification';
  title?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  isOpen,
  onClose,
  onScanResult,
  mode = 'payment',
  title
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<QRCodeData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestCameraPermission();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      setHasPermission(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
      setScanError('Camera access denied. Please enable camera permissions or upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    if (!hasPermission) {
      requestCameraPermission();
      return;
    }
    
    setIsScanning(true);
    setScanError(null);
    scanQRCode();
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // In a real implementation, you would use a QR code library like jsQR
      // For demo purposes, we'll simulate QR code detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrResult = await simulateQRDetection(imageData);
      
      if (qrResult) {
        const parsedData = parseQRCode(qrResult);
        if (parsedData) {
          setScannedData(parsedData);
          setIsScanning(false);
          processQRResult(parsedData);
        }
      } else if (isScanning) {
        // Continue scanning
        setTimeout(scanQRCode, 100);
      }
    } catch (error) {
      console.error('QR scanning error:', error);
      setScanError('Failed to scan QR code. Please try again.');
      setIsScanning(false);
    }
  };

  const simulateQRDetection = async (imageData: ImageData): Promise<string | null> => {
    // Simulate QR code detection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Enhanced QR code detection with realistic patterns
    const random = Math.random();
    
    // Simulate more realistic scanning - 30% chance instead of 5%
    if (random > 0.7) {
      // Generate different types of QR codes based on probability
      const qrType = Math.random();
      
      if (qrType > 0.8) {
        // Payment request QR
        const amount = (Math.random() * 500 + 50).toFixed(2);
        const recipient = `user_${Math.floor(Math.random() * 1000)}`;
        return `spay://payment?amount=${amount}&recipient=${recipient}&description=Payment Request&id=pay_${Date.now()}`;
      } else if (qrType > 0.6) {
        // Device verification QR
        const deviceId = `DEV${Math.floor(Math.random() * 100000)}`;
        return `stolen://device?id=${deviceId}&action=verify&brand=Samsung&model=Galaxy S23`;
      } else if (qrType > 0.4) {
        // Contact/Wallet QR
        const walletId = `wallet_${Math.floor(Math.random() * 10000)}`;
        return `spay://contact?walletId=${walletId}&name=John Doe&email=john@example.com`;
      } else {
        // Marketplace listing QR
        const listingId = `listing_${Math.floor(Math.random() * 50000)}`;
        const price = (Math.random() * 2000 + 100).toFixed(2);
        return `stolen://listing?id=${listingId}&price=${price}&title=iPhone 14 Pro&seller=seller123`;
      }
    }
    return null;
  };

  const parseQRCode = (qrData: string): QRCodeData | null => {
    try {
      // Parse S-Pay payment URLs
      if (qrData.startsWith('spay://payment')) {
        const url = new URL(qrData);
        return {
          type: 'payment_request',
          amount: url.searchParams.get('amount') ? parseFloat(url.searchParams.get('amount')!) : undefined,
          currency: url.searchParams.get('currency') || 'ZAR',
          description: url.searchParams.get('description') || undefined,
          recipientId: url.searchParams.get('recipient') || undefined,
          recipientName: url.searchParams.get('name') || undefined,
          paymentId: url.searchParams.get('id') || undefined,
          expiresAt: url.searchParams.get('expires') || undefined
        };
      }

      // Parse wallet IDs
      if (qrData.startsWith('spay://wallet/')) {
        const walletId = qrData.replace('spay://wallet/', '');
        return {
          type: 'wallet_id',
          recipientId: walletId,
          walletAddress: walletId
        };
      }

      // Parse contact info
      if (qrData.startsWith('spay://contact/')) {
        try {
          const contactData = JSON.parse(atob(qrData.replace('spay://contact/', '')));
          return {
            type: 'contact_info',
            recipientId: contactData.id,
            recipientName: contactData.name,
            metadata: contactData
          };
        } catch {
          return null;
        }
      }

      // Parse verification codes
      if (qrData.startsWith('spay://verify/')) {
        return {
          type: 'verification_code',
          metadata: { code: qrData.replace('spay://verify/', '') }
        };
      }

      // Try to parse as JSON
      try {
        const jsonData = JSON.parse(qrData);
        if (jsonData.type && ['payment_request', 'wallet_id', 'contact_info', 'verification_code'].includes(jsonData.type)) {
          return jsonData as QRCodeData;
        }
      } catch {
        // Not JSON, ignore
      }

      return null;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  };

  const processQRResult = async (data: QRCodeData) => {
    setIsProcessing(true);
    
    try {
      // Validate QR code data based on mode
      if (mode === 'payment' && data.type !== 'payment_request' && data.type !== 'wallet_id') {
        throw new Error('Invalid payment QR code');
      }
      
      if (mode === 'contact' && data.type !== 'contact_info' && data.type !== 'wallet_id') {
        throw new Error('Invalid contact QR code');
      }
      
      if (mode === 'verification' && data.type !== 'verification_code') {
        throw new Error('Invalid verification QR code');
      }

      // Check if payment request is expired
      if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        throw new Error('This payment request has expired');
      }

      toast({
        title: "QR Code Scanned",
        description: getSuccessMessage(data),
      });

      // Pass result to parent component
      onScanResult(data);
      
      // Close scanner after successful scan
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error processing QR result:', error);
      setScanError(error instanceof Error ? error.message : 'Invalid QR code');
      setScannedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSuccessMessage = (data: QRCodeData): string => {
    switch (data.type) {
      case 'payment_request':
        return data.amount 
          ? `Payment request for R${data.amount.toFixed(2)} scanned successfully`
          : 'Payment request scanned successfully';
      case 'wallet_id':
        return 'Wallet ID scanned successfully';
      case 'contact_info':
        return `Contact ${data.recipientName || 'information'} scanned successfully`;
      case 'verification_code':
        return 'Verification code scanned successfully';
      default:
        return 'QR code scanned successfully';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setScanError(null);

    try {
      // Create image element
      const img = new Image();
      const canvas = canvasRef.current;
      
      if (!canvas) throw new Error('Canvas not available');

      img.onload = async () => {
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context not available');

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simulate QR detection from image
        const qrResult = await simulateQRDetectionFromImage(imageData);
        
        if (qrResult) {
          const parsedData = parseQRCode(qrResult);
          if (parsedData) {
            setScannedData(parsedData);
            processQRResult(parsedData);
          } else {
            throw new Error('Could not parse QR code from image');
          }
        } else {
          throw new Error('No QR code found in image');
        }
      };

      img.onerror = () => {
        throw new Error('Failed to load image');
      };

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing uploaded image:', error);
      setScanError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const simulateQRDetectionFromImage = async (imageData: ImageData): Promise<string | null> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful detection for demo
    return 'spay://payment?amount=75.50&recipient=user456&description=Shared dinner&id=pay_def456';
  };

  const getModeTitle = () => {
    if (title) return title;
    
    switch (mode) {
      case 'payment':
        return 'Scan Payment QR Code';
      case 'contact':
        return 'Scan Contact QR Code';
      case 'verification':
        return 'Scan Verification Code';
      default:
        return 'Scan QR Code';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'payment':
        return 'Point your camera at a payment QR code to send money quickly and securely.';
      case 'contact':
        return 'Scan a contact QR code to add someone to your S-Pay contacts.';
      case 'verification':
        return 'Scan a verification QR code to confirm your identity or transaction.';
      default:
        return 'Position the QR code within the camera frame to scan.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {getModeTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {getModeDescription()}
          </p>

          {/* Camera View */}
          {hasPermission && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                autoPlay
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Permission denied state */}
          {hasPermission === false && (
            <Card>
              <CardContent className="p-6 text-center">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Camera Access Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please allow camera access to scan QR codes, or upload an image instead.
                </p>
                <Button onClick={requestCameraPermission} className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Enable Camera
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {hasPermission && !isScanning && (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            )}
            
            {isScanning && (
              <Button variant="outline" onClick={() => setIsScanning(false)} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {scanError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <div className="font-medium">Scan Failed</div>
                  <div>{scanError}</div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {scannedData && !scanError && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <div className="font-medium">QR Code Scanned Successfully</div>
                  {scannedData.type === 'payment_request' && scannedData.amount && (
                    <div>Amount: R{scannedData.amount.toFixed(2)}</div>
                  )}
                  {scannedData.description && (
                    <div>Description: {scannedData.description}</div>
                  )}
                  {scannedData.recipientName && (
                    <div>Recipient: {scannedData.recipientName}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Scanning Tips</div>
                <ul className="mt-1 space-y-1">
                  <li>• Hold your device steady</li>
                  <li>• Ensure good lighting</li>
                  <li>• Position QR code within the frame</li>
                  <li>• Keep a distance of 10-30cm</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
