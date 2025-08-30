import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Smartphone, 
  Search, 
  User, 
  Mail, 
  Phone, 
  QrCode, 
  Shield, 
  FileCheck, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Download,
  X
} from "lucide-react";

const TransferDonate = () => {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [transferType, setTransferType] = useState("");
  const [recipientInfo, setRecipientInfo] = useState({
    email: "",
    phone: "",
    stolenId: ""
  });
  const [salePrice, setSalePrice] = useState("");

  // Mock device data - in real app, this would come from API
  const mockDevices = [
    { id: "1", name: "iPhone 14 Pro", serial: "F2LLD123ABC", status: "verified" },
    { id: "2", name: "MacBook Air M2", serial: "C02YL456DEF", status: "verified" },
    { id: "3", name: "AirPods Pro", serial: "GLDM789GHI", status: "pending" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Transfer or Donate Gadget</h1>
              <p className="text-muted-foreground">Securely transfer ownership of your registered gadgets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Transfer Form */}
          <div className="space-y-6">
            {/* Device Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Select Gadget to Transfer
                </CardTitle>
                <CardDescription>
                  Choose one of your registered gadgets to transfer or donate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="device-select">Your Registered Gadgets</Label>
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gadget..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          <div className="flex items-center gap-2">
                            <span>{device.name}</span>
                            <Badge variant={device.status === "verified" ? "default" : "secondary"}>
                              {device.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Input placeholder="Or search by serial number..." className="flex-1" />
                  <Button variant="outline" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Type */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Type</CardTitle>
                <CardDescription>
                  Specify the nature of this ownership transfer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={transferType} onValueChange={setTransferType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transfer type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="gift">Gift</SelectItem>
                    <SelectItem value="temporary">Temporary Lend</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Recipient Verification
                </CardTitle>
                <CardDescription>
                  Enter recipient's contact information for verification
                </CardDescription>
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
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="phone"
                      type="tel" 
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      value={recipientInfo.phone}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stolen-id">STOLEN ID (Optional)</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="stolen-id"
                      placeholder="STL123456789"
                      className="pl-10"
                      value={recipientInfo.stolenId}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, stolenId: e.target.value }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Alternative Options</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <QrCode className="w-4 h-4 mr-2" />
                      Share QR Code
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invite Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sale Price (if applicable) */}
            {transferType === "sale" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Sale Information
                  </CardTitle>
                  <CardDescription>
                    Optional sale price for informal records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Sale Price (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="price"
                        type="number" 
                        placeholder="0.00"
                        className="pl-10"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>STOLEN Pay escrow protection available for secure payments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transfer Summary & Actions */}
          <div className="space-y-6">
            {/* Device History Preview */}
            {selectedDevice && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Gadget History Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const device = mockDevices.find(d => d.id === selectedDevice);
                    return device ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Model</span>
                          <span className="text-sm font-medium">{device.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Serial</span>
                          <span className="text-sm font-mono">{device.serial}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant={device.status === "verified" ? "default" : "secondary"}>
                            {device.status === "verified" ? "✓ Clean Record" : "Pending Verification"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ownership</span>
                          <span className="text-sm text-green-600">No disputes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Blockchain Hash</span>
                          <span className="text-sm font-mono text-muted-foreground">0x1234...5678</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Transfer Process Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Transfer Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Dual Authentication Required</div>
                      <div className="text-muted-foreground">Recipient must accept transfer on their end</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Blockchain Record</div>
                      <div className="text-muted-foreground">Immutable record with serial, names, date & location</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Digital Certificate</div>
                      <div className="text-muted-foreground">Downloadable proof of transfer (PDF/QR)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button className="w-full" size="lg" disabled={!selectedDevice || !transferType}>
                <FileCheck className="w-5 h-5 mr-2" />
                Initiate Transfer
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Preview Certificate
                </Button>
                <Button variant="outline" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </div>

              <Button variant="ghost" className="w-full">
                <X className="w-4 h-4 mr-2" />
                Cancel Transfer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDonate;