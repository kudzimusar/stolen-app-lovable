import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  CheckCircle, 
  FileText, 
  Download, 
  Search, 
  Calendar,
  Heart,
  Users,
  Target,
  TrendingUp,
  Globe,
  Award,
  BarChart3,
  Activity,
  Gift,
  DollarSign,
  Eye,
  Share2,
  MapPin,
  Clock,
  Star,
  Zap
} from "lucide-react";

const NGODashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const { toast } = useToast();

  const donationRequests = [
    {
      id: "1",
      device: "iPhone 13 Pro",
      donor: "John Smith",
      status: "Pending",
      value: "$800",
      date: "2024-01-15"
    },
    {
      id: "2", 
      device: "MacBook Air M2",
      donor: "TechCorp Inc.",
      status: "Approved",
      value: "$1200",
      date: "2024-01-10"
    }
  ];

  const handleConfirmDelivery = (deviceId: string) => {
    toast({
      title: "Delivery Confirmed",
      description: "Device delivery has been confirmed and blockchain certificate generated."
    });
  };

  const handleExportTaxReport = () => {
    toast({
      title: "Tax Report Generated",
      description: "Tax report has been generated and is ready for download."
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">NGO Dashboard</h1>
            <p className="text-muted-foreground">Manage device donations and tax reporting</p>
          </div>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Verified NGO
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Devices Received</p>
                  <p className="text-2xl font-bold text-primary">24</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-success">18</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-warning">$12,400</p>
                </div>
                <DollarSign className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Impact Score</p>
                  <p className="text-2xl font-bold text-info">94%</p>
                </div>
                <Target className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Donation Management
              </CardTitle>
              <CardDescription>
                Comprehensive donation tracking and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Donations</span>
                  <Badge variant="secondary">6 Pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Donations</span>
                  <span className="font-semibold">$3,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Donor Satisfaction</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">4.8</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Impact Measurement
              </CardTitle>
              <CardDescription>
                Program effectiveness and community impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Beneficiaries Served</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Program Success Rate</span>
                  <span className="font-semibold text-success">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Community Reach</span>
                  <span className="font-semibold">3 Cities</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Community Outreach
              </CardTitle>
              <CardDescription>
                Education and awareness initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Awareness Events</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Educational Programs</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Volunteer Hours</span>
                  <span className="font-semibold">240h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="donations">Donation Management</TabsTrigger>
            <TabsTrigger value="queue">Charity Queue</TabsTrigger>
            <TabsTrigger value="reports">Tax Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Manage incoming device donations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donationRequests.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{donation.device}</h4>
                        <p className="text-sm text-muted-foreground">From: {donation.donor}</p>
                        <p className="text-sm text-muted-foreground">Value: {donation.value}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={donation.status === "Approved" ? "default" : "secondary"}>
                          {donation.status}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmDelivery(donation.id)}
                          disabled={donation.status !== "Approved"}
                        >
                          Confirm Delivery
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donation Queue</CardTitle>
                <CardDescription>Track and approve pending donations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search donations..." className="pl-8" />
                    </div>
                    <Button variant="outline">Filter</Button>
                  </div>
                  
                  <div className="space-y-3">
                    {donationRequests.map((donation) => (
                      <Card key={donation.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{donation.device}</h4>
                              <p className="text-sm text-muted-foreground">Donor: {donation.donor}</p>
                              <p className="text-sm text-muted-foreground">Date: {donation.date}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View Details</Button>
                              <Button size="sm">Approve</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Reporting</CardTitle>
                <CardDescription>Generate and export tax reports for donations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Input type="date" placeholder="Start Date" />
                  <Input type="date" placeholder="End Date" />
                  <Button onClick={handleExportTaxReport} className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">2024 Year-to-Date Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Donations</p>
                      <p className="font-medium">24 devices</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-medium">$12,400</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tax Deductible</p>
                      <p className="font-medium">$11,800</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Processing Fees</p>
                      <p className="font-medium">$600</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NGODashboard;