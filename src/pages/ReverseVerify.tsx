import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, Clock, User, AlertTriangle, Share2, Flag } from "lucide-react";

const ReverseVerify = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const { toast } = useToast();

  // Mock device data
  const mockDevice = {
    id: "dev_123456",
    name: "iPhone 15 Pro",
    brand: "Apple",
    model: "A2848",
    serialNumber: "F2LW0**8P",
    owner: "John D.",
    status: "verified",
    registrationDate: "2024-01-15",
    lastTransfer: "2024-01-15",
    transfers: 1,
    location: "San Francisco, CA",
    verificationScore: 98
  };

  const ownershipTimeline = [
    {
      date: "2024-01-15",
      event: "Device Registered",
      owner: "John D.",
      type: "registration",
      verified: true
    },
    {
      date: "2024-01-15",
      event: "Initial Purchase",
      owner: "John D.",
      type: "purchase", 
      verified: true,
      details: "Purchased from Apple Store"
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter Device Information",
        description: "Please enter a serial number, IMEI, or device ID to search.",
        variant: "destructive"
      });
      return;
    }

    // Simulate search
    setDeviceData(mockDevice);
    toast({
      title: "Device Found",
      description: "Device information retrieved from blockchain registry."
    });
  };

  const handleReportDevice = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for your report. Our team will investigate this device."
    });
  };

  const handleShareDevice = () => {
    const certificateUrl = `${window.location.origin}/device-certificate/${mockDevice.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'STOLEN Device Verification Certificate',
        text: `View the verified certificate for this device: ${mockDevice.name}`,
        url: certificateUrl
      });
    } else {
      // Copy to clipboard and show certificate
      navigator.clipboard.writeText(certificateUrl);
      toast({
        title: "Certificate Link Generated",
        description: "Opening device verification certificate..."
      });
      
      // Open certificate in new window
      window.open(certificateUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Reverse Device Verification</h1>
          <p className="text-muted-foreground">
            Verify any device's authenticity and ownership history on the STOLEN network
          </p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Device Lookup</span>
            </CardTitle>
            <CardDescription>
              Enter a serial number, IMEI, or device ID to verify its status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter serial number, IMEI, or device ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        {deviceData && (
          <>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    <span>Device Verified</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleShareDevice}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReportDevice}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{mockDevice.name}</h3>
                      <p className="text-muted-foreground">{mockDevice.brand} • {mockDevice.model}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Serial Number</span>
                        <span className="text-sm font-mono">{mockDevice.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Owner</span>
                        <span className="text-sm">{mockDevice.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Verification Score</span>
                        <span className="text-sm font-semibold text-green-600">
                          {mockDevice.verificationScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Registration Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Registered</span>
                        <span className="text-sm">{mockDevice.registrationDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Transfer</span>
                        <span className="text-sm">{mockDevice.lastTransfer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Transfers</span>
                        <span className="text-sm">{mockDevice.transfers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <span className="text-sm">{mockDevice.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ownership Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Ownership Timeline</span>
                </CardTitle>
                <CardDescription>Complete history of device ownership and transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ownershipTimeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          event.verified ? 'bg-green-500' : 'bg-gray-300'
                        } mt-2`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.event}</h4>
                          <span className="text-sm text-muted-foreground">{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.owner}</span>
                          {event.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        {event.details && (
                          <p className="text-sm text-muted-foreground">{event.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Blockchain Verified</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This device's ownership history is secured on the blockchain and cannot be 
                      tampered with. All transfers and registrations are permanently recorded.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* No Results State */}
        {!deviceData && searchQuery && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Device Not Found</h3>
              <p className="text-sm text-gray-600 mb-4">
                This device is not registered in the STOLEN network. This could mean:
              </p>
              <ul className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-1">
                <li>• The device hasn't been registered yet</li>
                <li>• The search information is incorrect</li>
                <li>• The device may be counterfeit</li>
              </ul>
              <Button variant="outline" className="mt-4" onClick={handleReportDevice}>
                Report Suspicious Device
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReverseVerify;