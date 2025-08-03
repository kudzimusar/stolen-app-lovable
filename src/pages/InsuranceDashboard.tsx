import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Shield,
  FileText,
  Search,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Eye
} from "lucide-react";

const InsuranceDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [claimForm, setClaimForm] = useState({
    deviceId: "",
    policyNumber: "",
    incidentType: "",
    damageDescription: ""
  });
  const { toast } = useToast();

  // Mock insurance provider stats
  const stats = {
    activePolicies: 12847,
    monthlyPremiums: 145000,
    claimsProcessed: 234,
    fraudPrevented: 45,
    avgClaimTime: "2.3 days",
    customerSatisfaction: 4.6,
    totalPayouts: 89000
  };

  const recentClaims = [
    {
      id: "CLM-001",
      device: "iPhone 15 Pro",
      policy: "POL-12345",
      amount: "$1200",
      status: "approved",
      submittedDate: "2024-01-20",
      claimant: "John Doe"
    },
    {
      id: "CLM-002", 
      device: "MacBook Pro M3",
      policy: "POL-67890",
      amount: "$2400",
      status: "pending",
      submittedDate: "2024-01-18",
      claimant: "Jane Smith"
    }
  ];

  const handleSearch = () => {
    toast({
      title: "Search Initiated",
      description: `Searching for device: ${searchQuery}`
    });
  };

  const handleClaimSubmit = () => {
    toast({
      title: "Claim Submitted",
      description: "Insurance claim has been submitted for review."
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <STOLENLogo />
              <span className="font-semibold">Insurance Dashboard</span>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <Shield className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Insurance Provider Portal</h1>
          <p className="text-muted-foreground">
            Manage policies, process claims, and prevent fraud with STOLEN's insurance integration.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{stats.activePolicies.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Active Policies</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-success">${stats.monthlyPremiums.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Monthly Premiums</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{stats.claimsProcessed}</div>
            <div className="text-sm text-muted-foreground">Claims This Month</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.fraudPrevented}</div>
            <div className="text-sm text-muted-foreground">Fraud Cases Prevented</div>
          </Card>
        </div>

        <Tabs defaultValue="claims" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="claims">Claims Management</TabsTrigger>
            <TabsTrigger value="verification">Device Verification</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="policies">Policy Management</TabsTrigger>
          </TabsList>

          {/* Claims Management */}
          <TabsContent value="claims" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Claims</h3>
                <div className="space-y-4">
                  {recentClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{claim.device}</div>
                        <div className="text-sm text-muted-foreground">
                          {claim.id} • {claim.claimant}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Submitted: {claim.submittedDate}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="font-semibold">{claim.amount}</div>
                        {getStatusBadge(claim.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Claim Processing Time</span>
                    <span className="font-semibold">{stats.avgClaimTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="font-semibold">{stats.customerSatisfaction}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Payouts (Month)</span>
                    <span className="font-semibold">${stats.totalPayouts.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fraud Detection Rate</span>
                    <span className="font-semibold text-success">98.2%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Device Verification */}
          <TabsContent value="verification" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Device Verification & History</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter device serial number or IMEI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Verify Device
                  </Button>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium">Blockchain Verification</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Instantly verify device ownership history, theft reports, and authenticity through blockchain records.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Claim Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Theft Claims</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Damage Claims</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Loss Claims</span>
                    <span className="font-semibold">20%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Risk Assessment
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk Devices</span>
                    <span className="font-semibold text-destructive">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Risk Devices</span>
                    <span className="font-semibold text-warning">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Risk Devices</span>
                    <span className="font-semibold text-success">12,788</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Policy Management */}
          <TabsContent value="policies" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Policy Administration</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-3" />
                    Create New Policy
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-3" />
                    Bulk Policy Updates
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-3" />
                    Export Policy Data
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <span className="font-medium">Expiring Policies</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      47 policies expire within the next 30 days
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default InsuranceDashboard;