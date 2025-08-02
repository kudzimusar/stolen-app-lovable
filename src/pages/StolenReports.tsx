import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { 
  Search, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Eye, 
  Flag,
  Smartphone,
  Laptop,
  Headphones,
  Calendar
} from "lucide-react";

const StolenReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const mockReports = [
    {
      id: "1",
      deviceName: "iPhone 14 Pro Max",
      brand: "Apple",
      serial: "F2LLD***ABC",
      reportDate: "2024-01-20",
      location: "Cape Town, Western Cape",
      status: "active",
      reportedBy: "John D.",
      lastSeen: "2024-01-20 14:30",
      reward: "R2,000",
      icon: Smartphone,
      type: "theft"
    },
    {
      id: "2",
      deviceName: "MacBook Pro M2",
      brand: "Apple", 
      serial: "C02YL***DEF",
      reportDate: "2024-01-18",
      location: "Johannesburg, Gauteng",
      status: "found",
      reportedBy: "Sarah M.",
      lastSeen: "2024-01-18 09:15",
      reward: "R5,000",
      icon: Laptop,
      type: "theft"
    },
    {
      id: "3",
      deviceName: "AirPods Pro 2",
      brand: "Apple",
      serial: "GLDM***GHI",
      reportDate: "2024-01-22",
      location: "Durban, KwaZulu-Natal",
      status: "investigating",
      reportedBy: "Mike R.",
      lastSeen: "2024-01-22 11:45",
      reward: "R500",
      icon: Headphones,
      type: "lost"
    }
  ];

  const reportStats = {
    total: mockReports.length,
    active: mockReports.filter(r => r.status === 'active').length,
    found: mockReports.filter(r => r.status === 'found').length,
    investigating: mockReports.filter(r => r.status === 'investigating').length
  };

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'found': return 'default';
      case 'investigating': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active Report';
      case 'found': return 'Found';
      case 'investigating': return 'Under Investigation';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stolen Device Reports</h1>
          <p className="text-muted-foreground">
            Community database of reported stolen and lost devices
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{reportStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{reportStats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{reportStats.investigating}</p>
                  <p className="text-sm text-muted-foreground">Investigating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{reportStats.found}</p>
                  <p className="text-sm text-muted-foreground">Found</p>
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
              placeholder="Search reports by device, brand, serial, or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs value={filterType} onValueChange={setFilterType} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="theft">Stolen</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <IconComponent className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.deviceName}</CardTitle>
                        <CardDescription>
                          {report.brand} • Serial: {report.serial}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Reported By:</span>
                      <p className="font-medium">{report.reportedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reward:</span>
                      <p className="font-medium text-green-600">{report.reward}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{report.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Last seen: {report.lastSeen}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Reported: {report.reportDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {report.status === 'active' && (
                      <Button variant="default" className="flex-1">
                        <Flag className="w-4 h-4 mr-2" />
                        Report Found
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all' 
                  ? "No reports match your current filters." 
                  : "No stolen devices have been reported yet."
                }
              </p>
              {(searchTerm || filterType !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Community Notice */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Community Safety Notice</h3>
                <p className="text-blue-800 mb-4">
                  This database is powered by community reports. If you find a device that matches 
                  any of these reports, please contact the authorities and the device owner through 
                  our secure platform.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Report Found Device
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StolenReports;