import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/navigation/AppHeader";
import { DocumentDownloader } from "@/components/ui/DocumentDownloader";
import { 
  Shield, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  Bell,
  Settings,
  Smartphone,
  Search
} from "lucide-react";

const DeviceWarrantyStatus = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockDevices = [
    {
      id: "1",
      name: "iPhone 14 Pro",
      serial: "F2LLD123ABC",
      purchaseDate: "2024-01-15",
      warrantyStart: "2024-01-15",
      warrantyEnd: "2025-01-15",
      warrantyType: "manufacturer",
      status: "active",
      daysRemaining: 289,
      retailer: "iStore Century City",
      retailerWarranty: "2024-07-15",
      extendedWarranty: null,
      claimsUsed: 0,
      claimsAllowed: 2
    },
    {
      id: "2",
      name: "MacBook Air M2",
      serial: "C02YL456DEF",
      purchaseDate: "2023-11-20",
      warrantyStart: "2023-11-20",
      warrantyEnd: "2024-11-20",
      warrantyType: "manufacturer",
      status: "expiring_soon",
      daysRemaining: 45,
      retailer: "Apple Store V&A",
      retailerWarranty: "2024-05-20",
      extendedWarranty: "AppleCare+",
      claimsUsed: 1,
      claimsAllowed: 3
    },
    {
      id: "3",
      name: "AirPods Pro 2",
      serial: "GLDM789GHI",
      purchaseDate: "2023-02-10",
      warrantyStart: "2023-02-10",
      warrantyEnd: "2024-02-10",
      warrantyType: "manufacturer",
      status: "expired",
      daysRemaining: -45,
      retailer: "Takealot",
      retailerWarranty: "2023-08-10",
      extendedWarranty: null,
      claimsUsed: 0,
      claimsAllowed: 1
    }
  ];

  const filteredDevices = mockDevices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expiring_soon': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getWarrantyProgress = (device: any) => {
    const total = new Date(device.warrantyEnd).getTime() - new Date(device.warrantyStart).getTime();
    const used = Date.now() - new Date(device.warrantyStart).getTime();
    return Math.max(0, Math.min(100, (used / total) * 100));
  };

  const formatDaysRemaining = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return "Expires today";
    if (days === 1) return "1 day remaining";
    return `${days} days remaining`;
  };

  const warrantyStats = {
    total: mockDevices.length,
    active: mockDevices.filter(d => d.status === 'active').length,
    expiring: mockDevices.filter(d => d.status === 'expiring_soon').length,
    expired: mockDevices.filter(d => d.status === 'expired').length
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Device Warranty Status</h1>
          <p className="text-muted-foreground">
            Track warranty coverage and expiry dates for all your devices
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{warrantyStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{warrantyStats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{warrantyStats.expiring}</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{warrantyStats.expired}</p>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search devices..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Devices List */}
        <div className="space-y-6">
          {filteredDevices.map((device) => (
            <Card key={device.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{device.name}</h3>
                      <Badge variant={getStatusColor(device.status)}>
                        {device.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{device.serial}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Set Alerts
                    </Button>
                    <DocumentDownloader 
                      type="certificate"
                      deviceName={device.name}
                      serialNumber={device.serial}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Warranty Progress */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Manufacturer Warranty</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDaysRemaining(device.daysRemaining)}
                        </span>
                      </div>
                      <Progress value={getWarrantyProgress(device)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{device.warrantyStart}</span>
                        <span>{device.warrantyEnd}</span>
                      </div>
                    </div>

                    {device.extendedWarranty && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Extended Warranty: {device.extendedWarranty}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600">
                          Additional coverage and benefits active
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Warranty Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Purchase Date:</span>
                        <p className="font-medium">{device.purchaseDate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Retailer:</span>
                        <p className="font-medium">{device.retailer}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Warranty Type:</span>
                        <p className="font-medium capitalize">{device.warrantyType}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Claims Used:</span>
                        <p className="font-medium">{device.claimsUsed}/{device.claimsAllowed}</p>
                      </div>
                    </div>

                    {device.retailerWarranty && (
                      <div>
                        <span className="text-sm text-muted-foreground">Retailer Warranty Until:</span>
                        <p className="font-medium">{device.retailerWarranty}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="w-4 h-4 mr-2" />
                        View Terms
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Claim Support
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Alerts and Recommendations */}
                {device.status === 'expiring_soon' && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Warranty Expiring Soon</span>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                      Your warranty expires in {device.daysRemaining} days. Consider extending coverage or purchasing insurance.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Extend Warranty
                      </Button>
                      <Button size="sm" variant="outline">
                        View Insurance Options
                      </Button>
                    </div>
                  </div>
                )}

                {device.status === 'expired' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">Warranty Expired</span>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      Your warranty has expired. You may still have repair options through third-party services.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Find Repair Service
                      </Button>
                      <Button size="sm" variant="outline">
                        Get Insurance Quote
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No devices found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No devices match your search." : "No warranty information available."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Warranty Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Warranty Tips</CardTitle>
            <CardDescription>Get the most out of your device warranties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Keep Records</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Save purchase receipts and warranty documents in a safe place.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-800">Set Reminders</h3>
                </div>
                <p className="text-sm text-green-700">
                  Enable warranty expiry alerts to never miss extension opportunities.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-purple-800">Regular Maintenance</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Follow manufacturer guidelines to maintain warranty validity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceWarrantyStatus;