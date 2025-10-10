import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useSearchParams } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { QRScanner } from "@/components/ui/QRScanner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAuthToken } from "@/lib/auth";
import { 
  ArrowLeft, 
  Smartphone, 
  Search, 
  User, 
  Mail, 
  Shield, 
  QrCode, 
  FileCheck, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface Device {
  id: string;
  device_name: string;
  brand: string;
  model: string;
  serial_number: string;
  status: string;
  blockchain_hash?: string;
}

const DeviceTransfer = () => {
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');
  
  const [selectedDevice, setSelectedDevice] = useState("");
  const [recipientInfo, setRecipientInfo] = useState({
    email: "",
    phone: "",
    stolenId: "",
    qrCode: ""
  });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [transferStep, setTransferStep] = useState(1);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserDevices();
  }, []);

  useEffect(() => {
    if (deviceId && devices.length > 0) {
      setSelectedDevice(deviceId);
    }
  }, [deviceId, devices]);

  const fetchUserDevices = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch('/api/v1/devices/my-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDevices(result.devices.filter((device: Device) => device.status === 'active'));
      } else {
        throw new Error(result.error || 'Failed to load devices');
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error Loading Devices",
        description: error instanceof Error ? error.message : "Failed to load devices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (result: string) => {
    setRecipientInfo(prev => ({ ...prev, qrCode: result }));
    setShowQRScanner(false);
    toast({
      title: "QR Code Scanned",
      description: "Recipient information loaded successfully",
    });
  };

  const initiateTransfer = () => {
    if (!selectedDevice || (!recipientInfo.email && !recipientInfo.qrCode)) {
      toast({
        title: "Missing Information",
        description: "Please select a device and provide recipient details",
        variant: "destructive",
      });
      return;
    }
    setTransferStep(2);
    toast({
      title: "Transfer Initiated",
      description: "OTP sent to recipient for verification",
    });
  };

  const confirmTransfer = () => {
    setTransferStep(3);
    toast({
      title: "Transfer Completed",
      description: "Device ownership successfully transferred",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= transferStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step < transferStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && <div className="w-16 h-1 bg-muted mx-2" />}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Secure Device Transfer</h1>
            <p className="text-muted-foreground">
              {transferStep === 1 && "Select device and recipient"}
              {transferStep === 2 && "Awaiting verification"}
              {transferStep === 3 && "Transfer completed"}
            </p>
          </div>
        </div>

        {transferStep === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Device Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Select Device
                </CardTitle>
                <CardDescription>Choose the device to transfer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading your devices...</p>
                  </div>
                ) : devices.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No active devices found.</p>
                    <Link to="/device/register">
                      <Button variant="outline" className="mt-2">Register Device</Button>
                    </Link>
                  </div>
                ) : (
                  devices.map((device) => (
                    <div 
                      key={device.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDevice === device.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setSelectedDevice(device.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{device.device_name}</h3>
                          <p className="text-sm text-muted-foreground">{device.brand} {device.model}</p>
                          <p className="text-xs text-muted-foreground font-mono">{device.serial_number}</p>
                        </div>
                        <Badge variant="default">
                          <Shield className="w-3 h-3 mr-1" />
                          {device.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Recipient Details
                </CardTitle>
                <CardDescription>Enter recipient information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="recipient@example.com"
                      className="pl-10"
                      value={recipientInfo.email}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    type="tel" 
                    placeholder="+27 11 123 4567"
                    value={recipientInfo.phone}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Scan Recipient QR Code</Label>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowQRScanner(true)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </Button>
                  {recipientInfo.qrCode && (
                    <p className="text-sm text-green-600">QR Code scanned successfully</p>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  onClick={initiateTransfer}
                  disabled={!selectedDevice || (!recipientInfo.email && !recipientInfo.qrCode)}
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Initiate Transfer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {transferStep === 2 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>Awaiting Verification</CardTitle>
              <CardDescription>
                OTP sent to recipient for verification. Transfer will complete once verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Transfer Details:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Device:</strong> {devices.find(d => d.id === selectedDevice)?.device_name}</p>
                  <p><strong>Recipient:</strong> {recipientInfo.email || "Via QR Code"}</p>
                  <p><strong>Status:</strong> Pending verification</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setTransferStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={confirmTransfer}>
                  Simulate Confirmation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {transferStep === 3 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Transfer Completed</CardTitle>
              <CardDescription>
                Device ownership has been successfully transferred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Blockchain Record Created</h3>
                <p className="text-sm text-green-700">
                  Transaction Hash: 0x1234567890abcdef...
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/dashboard">Return to Dashboard</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to="/ownership-history">View History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showQRScanner && (
          <QRScanner
            onScanSuccess={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DeviceTransfer;