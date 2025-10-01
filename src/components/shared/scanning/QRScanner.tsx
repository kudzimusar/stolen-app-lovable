import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';

export interface QRScanResult {
  data: string;
  format: string;
  timestamp: Date;
  confidence?: number;
  metadata?: {
    type: 'device' | 'url' | 'text' | 'contact' | 'wifi' | 'unknown';
    parsed?: Record<string, any>;
  };
}

export interface QRScannerProps {
  onScan: (result: QRScanResult) => void;
  onError?: (error: string) => void;
  enableCamera?: boolean;
  enableFileUpload?: boolean;
  autoStart?: boolean;
  className?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  enableCamera = true,
  enableFileUpload = true,
  autoStart = false,
  className = ''
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResults, setScanResults] = useState<QRScanResult[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCurrentStream(stream);
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      setHasPermission(false);
      onError?.('Camera access denied or not available');
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [onError, toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    setIsScanning(false);
  }, [currentStream]);

  // Process QR code from image
  const processQRCode = useCallback(async (imageData: ImageData): Promise<QRScanResult | null> => {
    try {
      // In a real implementation, you would use a QR code library like jsQR
      // For now, we'll simulate QR code detection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate QR code detection
      const mockResult: QRScanResult = {
        data: `QR_CODE_${Date.now()}`,
        format: 'QR_CODE',
        timestamp: new Date(),
        confidence: 0.95,
        metadata: {
          type: 'device',
          parsed: {
            deviceId: 'DEVICE_12345',
            serialNumber: 'SN789012345',
            model: 'iPhone 13 Pro'
          }
        }
      };

      return mockResult;
    } catch (error) {
      console.error('QR processing failed:', error);
      return null;
    }
  }, []);

  // Capture frame and process
  const captureAndProcess = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Process QR code
    const result = await processQRCode(imageData);
    
    if (result) {
      setScanResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      onScan(result);
      
      toast({
        title: "QR Code Scanned",
        description: `Found: ${result.data.substring(0, 50)}...`
      });
    }
  }, [processQRCode, onScan, toast]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = new Image();
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (!canvas || !context) return;

      image.onload = async () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = await processQRCode(imageData);
        
        if (result) {
          setScanResults(prev => [result, ...prev.slice(0, 9)]);
          onScan(result);
          
          toast({
            title: "QR Code Found",
            description: `Scanned from image: ${result.data.substring(0, 50)}...`
          });
        } else {
          toast({
            title: "No QR Code Found",
            description: "No QR code detected in the image",
            variant: "destructive"
          });
        }
      };

      image.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('File processing failed:', error);
      onError?.('Failed to process image file');
    }
  }, [processQRCode, onScan, onError, toast]);

  // Auto-start camera
  useEffect(() => {
    if (autoStart && enableCamera) {
      initializeCamera();
    }

    return () => {
      stopCamera();
    };
  }, [autoStart, enableCamera, initializeCamera, stopCamera]);

  // Continuous scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning && hasPermission) {
      interval = setInterval(captureAndProcess, 1000); // Scan every second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, hasPermission, captureAndProcess]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "QR code data copied to clipboard"
    });
  };

  const getResultTypeColor = (type: string) => {
    const colors = {
      device: 'bg-blue-100 text-blue-800',
      url: 'bg-green-100 text-green-800',
      text: 'bg-gray-100 text-gray-800',
      contact: 'bg-purple-100 text-purple-800',
      wifi: 'bg-orange-100 text-orange-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.unknown;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera View */}
          {enableCamera && (
            <div className="relative">
              <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {!hasPermission && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p>Camera access required</p>
                    </div>
                  </div>
                )}
                
                {isScanning && hasPermission && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                {!isScanning ? (
                  <Button onClick={initializeCamera} disabled={hasPermission === false}>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="outline">
                    Stop Camera
                  </Button>
                )}
                
                {isScanning && (
                  <Button onClick={captureAndProcess}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan Now
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* File Upload */}
          {enableFileUpload && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Upload Image to Scan
              </Button>
            </div>
          )}

          {/* Scan Results */}
          {scanResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Scan Results ({scanResults.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scanResults.map((result, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getResultTypeColor(result.metadata?.type || 'unknown')}>
                            {result.metadata?.type || 'unknown'}
                          </Badge>
                          {result.confidence && (
                            <Badge variant="outline">
                              {Math.round(result.confidence * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-mono break-all">
                          {result.data}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.data)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {result.metadata?.type === 'url' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(result.data, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
