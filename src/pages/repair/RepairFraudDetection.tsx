import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  Camera, 
  Search, 
  CheckCircle, 
  XCircle,
  Eye,
  Fingerprint,
  Scan,
  Flag,
  Phone
} from "lucide-react";

interface DeviceCheck {
  serialNumber: string;
  imei?: string;
  status: 'clean' | 'suspicious' | 'flagged' | 'stolen';
  confidence: number;
  flags: string[];
  lastSeen?: string;
  reportedStolen?: boolean;
  tamperingDetected?: boolean;
}

const RepairFraudDetection = () => {
  const [serialNumber, setSerialNumber] = useState("");
  const [imei, setImei] = useState("");
  const [deviceCheck, setDeviceCheck] = useState<DeviceCheck | null>(null);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleDeviceCheck = async () => {
    if (!serialNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a serial number",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    
    // Simulate AI fraud detection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response based on serial number
    const mockResults: DeviceCheck[] = [
      {
        serialNumber: "CLEAN123456789",
        status: 'clean',
        confidence: 95,
        flags: [],
        lastSeen: "2024-01-20",
        reportedStolen: false,
        tamperingDetected: false
      },
      {
        serialNumber: "SUSPICIOUS987654",
        status: 'suspicious',
        confidence: 70,
        flags: ['Multiple ownership changes', 'Repair history inconsistencies'],
        lastSeen: "2024-01-18",
        reportedStolen: false,
        tamperingDetected: true
      },
      {
        serialNumber: "STOLEN456789012",
        status: 'stolen',
        confidence: 98,
        flags: ['Reported stolen', 'Active police case', 'Insurance claim'],
        lastSeen: "2024-01-15",
        reportedStolen: true,
        tamperingDetected: true
      }
    ];

    // Find matching mock result or create a default
    const result = mockResults.find(r => serialNumber.includes(r.serialNumber.substring(0, 6))) || {
      serialNumber,
      status: Math.random() > 0.7 ? 'suspicious' : 'clean' as any,
      confidence: Math.floor(Math.random() * 30) + 70,
      flags: Math.random() > 0.5 ? ['Minor inconsistencies detected'] : [],
      lastSeen: "2024-01-20",
      reportedStolen: false,
      tamperingDetected: Math.random() > 0.8
    };

    setDeviceCheck(result);
    setIsScanning(false);
  };

  const handleReportToLawEnforcement = () => {
    toast({
      title: "Report Submitted",
      description: "Suspicious device has been flagged and reported to law enforcement",
      variant: "default"
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 6));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean': return 'bg-success/10 text-success border-success';
      case 'suspicious': return 'bg-warning/10 text-warning border-warning';
      case 'flagged': return 'bg-destructive/10 text-destructive border-destructive';
      case 'stolen': return 'bg-destructive/10 text-destructive border-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean': return <CheckCircle className="w-5 h-5" />;
      case 'suspicious': return <AlertTriangle className="w-5 h-5" />;
      case 'flagged': return <Flag className="w-5 h-5" />;
      case 'stolen': return <XCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    document.title = "Fraud Detection | STOLEN – Verify Device Authenticity";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Fraud Detection" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/repair-shop-dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Device Fraud Detection
          </h1>
          <p className="text-muted-foreground">
            Verify device authenticity and detect potential fraud or theft
          </p>
        </div>

        {/* Device Input */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Device Verification</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="serial"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Enter serial number..."
                  />
                  <Button variant="outline" size="icon">
                    <Scan className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imei">IMEI (Optional)</Label>
                <Input
                  id="imei"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="Enter IMEI..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Device Photos</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary file:text-primary-foreground"
              />
              <p className="text-sm text-muted-foreground">
                Upload photos of device, serial number, and any damage ({photos.length}/6)
              </p>
            </div>

            <Button 
              onClick={handleDeviceCheck} 
              disabled={isScanning || !serialNumber.trim()}
              className="w-full"
              size="lg"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scanning Device...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check Device
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {deviceCheck && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Results</h2>
            
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(deviceCheck.status)} text-lg px-4 py-2`}>
                    {getStatusIcon(deviceCheck.status)}
                    <span className="ml-2 capitalize">{deviceCheck.status}</span>
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Confidence Score</div>
                    <div className="text-2xl font-bold">{deviceCheck.confidence}%</div>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Device Information</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Serial Number:</span>
                      <span className="font-mono">{deviceCheck.serialNumber}</span>
                    </div>
                    {imei && (
                      <div className="flex justify-between">
                        <span>IMEI:</span>
                        <span className="font-mono">{imei}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Last Seen:</span>
                      <span>{deviceCheck.lastSeen}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Security Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {deviceCheck.reportedStolen ? (
                        <XCircle className="w-4 h-4 text-destructive" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                      <span className="text-sm">
                        {deviceCheck.reportedStolen ? 'Reported Stolen' : 'Not Reported Stolen'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {deviceCheck.tamperingDetected ? (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                      <span className="text-sm">
                        {deviceCheck.tamperingDetected ? 'Tampering Detected' : 'No Tampering Detected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flags */}
              {deviceCheck.flags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-destructive">Security Flags</h3>
                  <div className="space-y-2">
                    {deviceCheck.flags.map((flag, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{flag}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Investigation Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes about your findings..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 flex-wrap">
                  {deviceCheck.status === 'clean' && (
                    <Button variant="default">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Proceed with Repair
                    </Button>
                  )}
                  
                  {(deviceCheck.status === 'suspicious' || deviceCheck.status === 'stolen') && (
                    <>
                      <Button variant="destructive" onClick={handleReportToLawEnforcement}>
                        <Flag className="w-4 h-4 mr-2" />
                        Report to Law Enforcement
                      </Button>
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Customer
                      </Button>
                    </>
                  )}
                  
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full History
                  </Button>
                  
                  <Button variant="outline">
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Advanced Scan
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Best Practices */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Fraud Detection Best Practices</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-success">✓ What to Look For</h3>
              <ul className="space-y-1 text-sm">
                <li>• Matching serial numbers on device and documentation</li>
                <li>• Original packaging and accessories</li>
                <li>• Clean device history without multiple quick sales</li>
                <li>• Customer can provide purchase proof</li>
                <li>• No signs of physical tampering</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-destructive">⚠ Red Flags</h3>
              <ul className="space-y-1 text-sm">
                <li>• Serial numbers don't match or are missing</li>
                <li>• Customer is evasive about device origin</li>
                <li>• Unusually low price for device condition</li>
                <li>• Multiple devices from same customer</li>
                <li>• Signs of serial number tampering</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default RepairFraudDetection;