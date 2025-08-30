import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/navigation/AppHeader";
import { 
  Search, 
  AlertTriangle, 
  Shield, 
  Eye,
  Calendar,
  MapPin,
  User,
  Smartphone,
  TrendingUp,
  Database
} from "lucide-react";

const FraudDatabase = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockBlacklistedDevices = [
    {
      id: "1",
      serial: "F2LLD789XYZ",
      brand: "Apple",
      model: "iPhone 14 Pro",
      status: "stolen",
      reportDate: "2024-01-10",
      location: "Johannesburg, GP",
      reportedBy: "John Doe",
      policeCase: "JHB2024/001234",
      riskLevel: "high"
    },
    {
      id: "2",
      serial: "SM-G998BZKA",
      brand: "Samsung",
      model: "Galaxy S21 Ultra",
      status: "insurance_fraud",
      reportDate: "2024-01-08",
      location: "Cape Town, WC",
      reportedBy: "Insurance Corp",
      policeCase: "CPT2024/000567",
      riskLevel: "medium"
    },
    {
      id: "3",
      serial: "MLY33ZA/A",
      brand: "Apple",
      model: "MacBook Pro 16",
      status: "stolen",
      reportDate: "2024-01-05",
      location: "Durban, KZN",
      reportedBy: "Tech Corp Ltd",
      policeCase: "DBN2024/000890",
      riskLevel: "high"
    }
  ];

  const mockOffenders = [
    {
      id: "1",
      name: "Anonymous User #1234",
      totalIncidents: 5,
      riskScore: 85,
      lastActivity: "2024-01-12",
      regions: ["Gauteng", "Western Cape"],
      deviceTypes: ["Smartphones", "Laptops"],
      status: "active"
    },
    {
      id: "2",
      name: "Anonymous User #5678",
      totalIncidents: 3,
      riskScore: 62,
      lastActivity: "2024-01-08",
      regions: ["KwaZulu-Natal"],
      deviceTypes: ["Gaming Consoles"],
      status: "monitored"
    }
  ];

  const fraudStats = {
    totalReports: 1247,
    activeInvestigations: 156,
    recoveredDevices: 89,
    preventedSales: 234
  };

  const filteredDevices = mockBlacklistedDevices.filter(device =>
    device.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stolen': return 'destructive';
      case 'insurance_fraud': return 'secondary';
      case 'recovered': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Fraud Database</h1>
            <Badge variant="outline">Public Registry</Badge>
          </div>
          <p className="text-muted-foreground">
            Public database of blacklisted devices and fraud patterns
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{fraudStats.totalReports.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{fraudStats.activeInvestigations}</p>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{fraudStats.recoveredDevices}</p>
                  <p className="text-sm text-muted-foreground">Recovered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{fraudStats.preventedSales}</p>
                  <p className="text-sm text-muted-foreground">Prevented Sales</p>
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
              placeholder="Search by serial number, brand, or model..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="devices" className="space-y-6">
          <TabsList>
            <TabsTrigger value="devices">Blacklisted Devices</TabsTrigger>
            <TabsTrigger value="offenders">Repeat Offenders</TabsTrigger>
            <TabsTrigger value="analytics">Fraud Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            {filteredDevices.map((device) => (
              <Card key={device.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">
                            {device.brand} {device.model}
                          </h3>
                        </div>
                        <Badge variant={getStatusColor(device.status)}>
                          {device.status.replace('_', ' ')}
                        </Badge>
                        <div className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(device.riskLevel)}`}>
                          {device.riskLevel} risk
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Serial Number:</span>
                          <p className="font-mono font-medium">{device.serial}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Report Date:</span>
                          <p className="font-medium">{device.reportDate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{device.location}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Reported By:</span>
                          <p className="font-medium">{device.reportedBy}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Police Case:</span>
                          <p className="font-mono font-medium">{device.policeCase}</p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Warning: Do not purchase this device</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          This device has been reported as {device.status.replace('_', ' ')} and should not be purchased or sold.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDevices.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No blacklisted devices found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "No devices match your search criteria." : "No devices currently blacklisted."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="offenders" className="space-y-4">
            {mockOffenders.map((offender) => (
              <Card key={offender.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{offender.name}</h3>
                        </div>
                        <Badge variant={offender.status === 'active' ? 'destructive' : 'secondary'}>
                          {offender.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Incidents:</span>
                          <p className="font-bold text-lg">{offender.totalIncidents}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk Score:</span>
                          <p className={`font-bold text-lg ${offender.riskScore > 70 ? 'text-red-600' : 'text-orange-600'}`}>
                            {offender.riskScore}/100
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Activity:</span>
                          <p className="font-medium">{offender.lastActivity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Regions:</span>
                          <p className="font-medium">{offender.regions.join(', ')}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-muted-foreground text-sm">Device Types:</span>
                        <div className="flex gap-2 mt-1">
                          {offender.deviceTypes.map((type) => (
                            <Badge key={type} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fraud Analytics Dashboard</CardTitle>
                <CardDescription>
                  Analytics and trends in device fraud and theft
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Detailed fraud analytics and visualization coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FraudDatabase;