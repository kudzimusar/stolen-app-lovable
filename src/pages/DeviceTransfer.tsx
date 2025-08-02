import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { QRScanner } from "@/components/QRScanner";
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
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DeviceTransfer = () => {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [recipientInfo, setRecipientInfo] = useState({
    email: "",
    phone: "",
    stolenId: "",
    qrCode: ""
  });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [transferStep, setTransferStep] = useState(1);
  const { toast } = useToast();

  const mockDevices = [
    { id: "1", name: "iPhone 14 Pro", serial: "F2LLD123ABC", status: "verified" },
    { id: "2", name: "MacBook Air M2", serial: "C02YL456DEF", status: "verified" },
    { id: "3", name: "AirPods Pro", serial: "GLDM789GHI", status: "verified" }
  ];

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
                {mockDevices.map((device) => (
                  <div 
                    key={device.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDevice === device.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">{device.serial}</p>
                      </div>
                      <Badge variant="default">
                        <Shield className="w-3 h-3 mr-1" />
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                  <p><strong>Device:</strong> {mockDevices.find(d => d.id === selectedDevice)?.name}</p>
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