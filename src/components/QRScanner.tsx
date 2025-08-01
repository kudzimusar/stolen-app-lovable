import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  onScanSuccess?: (data: string) => void;
  onClose?: () => void;
}

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setIsScanning(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      // Simulate QR code detection after 3 seconds
      setTimeout(() => {
        const mockQRData = "STOLEN:DEVICE:ABC123DEF456";
        handleScanSuccess(mockQRData);
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera permissions to scan QR codes",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (data: string) => {
    stopScanning();
    onScanSuccess?.(data);
    
    toast({
      title: "QR Code Scanned",
      description: "Device information retrieved successfully"
    });
  };

  const handleClose = () => {
    stopScanning();
    onClose?.();
  };

  if (!isScanning) {
    return (
      <Card className="p-8 text-center space-y-4">
        <QrCode className="w-16 h-16 mx-auto text-primary" />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">QR Code Scanner</h3>
          <p className="text-sm text-muted-foreground">
            Scan a device QR code to instantly retrieve its information
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={startScanning} size="lg">
            <Camera className="w-4 h-4 mr-2" />
            Start Scanning
          </Button>
          {onClose && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Scanning QR Code...</h3>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Position the QR code within the frame
        </p>
        <Button variant="outline" onClick={stopScanning} size="sm">
          Stop Scanning
        </Button>
      </div>
    </Card>
  );
};