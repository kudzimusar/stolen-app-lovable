import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { 
  Search, 
  Smartphone, 
  Laptop,
  Headphones,
  Plus,
  ArrowUpRight,
  Shield,
  AlertTriangle,
  DollarSign,
  Clock,
  Eye,
  Edit,
  Share,
  MapPin
} from "lucide-react";

const MyDevices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const mockDevices = [
    {
      id: "1",
      name: "iPhone 14 Pro",
      brand: "Apple",
      model: "iPhone 14 Pro",
      serial: "F2LLD123ABC",
      status: "active",
      registrationDate: "2024-01-15",
      purchasePrice: "R18,999",
      currentValue: "R15,500",
      location: "Cape Town, WC",
      warrantyExpiry: "2025-01-15",
      insuranceStatus: "active",
      icon: Smartphone,
      photos: 3,
      transfers: 1
    },
    {
      id: "2",
      name: "MacBook Air M2",
      brand: "Apple",
      model: "MacBook Air",
      serial: "C02YL456DEF",
      status: "active",
      registrationDate: "2023-11-20",
      purchasePrice: "R22,999",
      currentValue: "R18,500",
      location: "Cape Town, WC",
      warrantyExpiry: "2024-11-20",
      insuranceStatus: "expired",
      icon: Laptop,
      photos: 2,
      transfers: 0
    },
    {
      id: "3",
      name: "AirPods Pro 2",
      brand: "Apple",
      model: "AirPods Pro",
      serial: "GLDM789GHI",
      status: "reported_lost",
      registrationDate: "2024-02-10",
      purchasePrice: "R4,999",
      currentValue: "R3,500",
      location: "Last seen: Johannesburg, GP",
      warrantyExpiry: "2025-02-10",
      insuranceStatus: "claim_pending",
      icon: Headphones,
      photos: 1,
      transfers: 0
    }
  ];

  const deviceStats = {
    total: mockDevices.length,
    active: mockDevices.filter(d => d.status === 'active').length,
    reported: mockDevices.filter(d => d.status === 'reported_lost').length,
    totalValue: mockDevices.reduce((sum, d) => sum + parseInt(d.currentValue.replace(/[R,]/g, '')), 0),
    insured: mockDevices.filter(d => d.insuranceStatus === 'active').length
  };

  const filteredDevices = mockDevices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.serial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'reported_lost': return 'destructive';
      case 'transferred': return 'secondary';
      default: return 'outline';
    }
  };

  const getInsuranceColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'expired': return 'text-red-600';
      case 'claim_pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Mobile Back Navigation - Fallback */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Devices</h1>
            <p className="text-muted-foreground">
              Manage all your registered devices in one place
            </p>
          </div>
          <Button asChild>
            <Link to="/device/register">
              <Plus className="w-4 h-4 mr-2" />
              Register Device
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{deviceStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{deviceStats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{deviceStats.reported}</p>
                  <p className="text-sm text-muted-foreground">Reported</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">R{deviceStats.totalValue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{deviceStats.insured}</p>
                  <p className="text-sm text-muted-foreground">Insured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search devices..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="reported_lost">Reported</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDevices.map((device) => {
            const IconComponent = device.icon;
            return (
              <Card key={device.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <CardDescription className="font-mono text-xs">
                          {device.serial}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(device.status)}>
                      {device.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Purchase Price:</span>
                      <p className="font-medium">{device.purchasePrice}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Value:</span>
                      <p className="font-medium">{device.currentValue}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warranty:</span>
                      <p className="font-medium text-xs">{device.warrantyExpiry}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Insurance:</span>
                      <p className={`font-medium text-xs ${getInsuranceColor(device.insuranceStatus)}`}>
                        {device.insuranceStatus.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{device.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{device.photos} photos</span>
                    <span>{device.transfers} transfers</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/device/${device.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    
                    {device.status === 'active' && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/hot-deals?deviceId=${device.id}`}>
                            <Clock className="w-4 h-4 mr-1" />
                            Hot Deal
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/device-transfer">
                            <Share className="w-4 h-4 mr-1" />
                            Transfer
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/marketplace">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Sell
                          </Link>
                        </Button>
                      </>
                    )}
                    
                    {device.status === 'reported_lost' && (
                      <Button variant="outline" size="sm" className="col-span-2" asChild>
                        <Link to="/device/recovery-status">
                          <Clock className="w-4 h-4 mr-1" />
                          Recovery Status
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredDevices.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Smartphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No devices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? "No devices match your current filters." 
                  : "Start by registering your first device."
                }
              </p>
              <div className="flex gap-2 justify-center">
                {(searchTerm || filterStatus !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button asChild>
                  <Link to="/device/register">
                    <Plus className="w-4 h-4 mr-2" />
                    Register Device
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyDevices;