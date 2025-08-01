import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Eye,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  Flag,
  RefreshCw
} from "lucide-react";

const LawEnforcementDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [reportForm, setReportForm] = useState({
    deviceId: "",
    caseNumber: "",
    recoveryLocation: "",
    notes: ""
  });
  const { toast } = useToast();

  // Mock law enforcement stats
  const stats = {
    totalReports: 1847,
    activeInvestigations: 156,
    devicesRecovered: 412,
    successRate: 87.5,
    monthlyRecoveries: 34,
    averageRecoveryTime: "4.2 days"
  };

  // Mock stolen reports
  const stolenReports = [
    {
      id: 1,
      reportNumber: "SR-2025-001234",
      device: "iPhone 15 Pro Max",
      serial: "ABC123456789",
      reportedDate: "2025-01-18",
      location: "Downtown SF, Union Square",
      owner: {
        name: "Sarah Johnson",
        phone: "+1 (555) 123-4567",
        email: "sarah.j@email.com"
      },
      status: "active",
      reward: 100,
      description: "Space Black iPhone with purple case, cracked screen protector",
      evidence: ["Police report #SF-2025-5678", "Security camera footage", "Witness statements"],
      lastSeen: "2025-01-18 15:30",
      tips: 3,
      verified: true
    },
    {
      id: 2,
      reportNumber: "SR-2025-001235",
      device: "MacBook Pro M3",
      serial: "XYZ987654321",
      reportedDate: "2025-01-17",
      location: "UCSF Campus, Library",
      owner: {
        name: "Michael Chen",
        phone: "+1 (555) 987-6543",
        email: "m.chen@email.com"
      },
      status: "investigating",
      reward: 200,
      description: "Space Gray MacBook with Apple stickers on lid",
      evidence: ["Police report #SF-2025-5677", "Campus security footage"],
      lastSeen: "2025-01-17 14:15",
      tips: 7,
      verified: true
    }
  ];

  // Mock recovery logs
  const recoveryLogs = [
    {
      id: 1,
      caseNumber: "RC-2025-009876",
      device: "Samsung Galaxy S24",
      serial: "DEF456789012",
      recoveredDate: "2025-01-19",
      location: "Pawn shop on Mission Street",
      owner: "Emily Rodriguez",
      officer: "Officer Johnson",
      status: "returned",
      notes: "Device found during routine pawn shop inspection"
    },
    {
      id: 2,
      caseNumber: "RC-2025-009875",
      device: "iPad Pro",
      serial: "GHI789012345",
      recoveredDate: "2025-01-18",
      location: "Recovered from suspect",
      owner: "David Wilson",
      officer: "Detective Smith",
      status: "evidence",
      notes: "Part of larger theft investigation, held as evidence"
    }
  ];

  const handleSearch = () => {
    // Mock search functionality
    const mockResults = stolenReports.filter(report => 
      report.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(mockResults);
    
    if (mockResults.length > 0) {
      toast({
        title: "Search Results Found",
        description: `Found ${mockResults.length} matching device(s) in stolen registry.`,
        variant: "default"
      });
    } else {
      toast({
        title: "No Matches Found",
        description: "Device not found in stolen device registry.",
        variant: "default"
      });
    }
  };

  const handleSubmitRecovery = () => {
    toast({
      title: "Recovery Report Submitted",
      description: "Device recovery has been logged and owner has been notified.",
      variant: "default"
    });
    
    setReportForm({
      deviceId: "",
      caseNumber: "",
      recoveryLocation: "",
      notes: ""
    });
  };

  const handleReturnApproval = (reportId: number) => {
    toast({
      title: "Return Approved",
      description: "Device owner has been contacted for pickup arrangements.",
      variant: "default"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "destructive";
      case "investigating": return "secondary";
      case "returned": return "secondary";
      case "evidence": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">Law Enforcement Dashboard</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Shield className="w-3 h-3 mr-1" />
                Verified Agency
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">Device Search</TabsTrigger>
            <TabsTrigger value="reports">Active Reports</TabsTrigger>
            <TabsTrigger value="recovery">Recovery Log</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Device Search Tab */}
          <TabsContent value="search" className="space-y-8">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{stats.totalReports.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">{stats.activeInvestigations}</div>
                <div className="text-sm text-muted-foreground">Active Investigations</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.devicesRecovered}</div>
                <div className="text-sm text-muted-foreground">Devices Recovered</div>
                <div className="text-xs text-success flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{stats.monthlyRecoveries} this month
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Avg time: {stats.averageRecoveryTime}
                </div>
              </Card>
            </div>

            {/* Search Interface */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Search Stolen Device Registry</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Serial Number, IMEI, or Report Number</Label>
                    <Input 
                      placeholder="Enter device identifier..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSearch} disabled={!searchQuery}>
                      <Search className="w-4 h-4 mr-2" />
                      Search Registry
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-medium">Search Results ({searchResults.length})</h3>
                    {searchResults.map((result) => (
                      <Card key={result.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{result.device}</h4>
                              <Badge variant={getStatusColor(result.status)}>
                                {result.status}
                              </Badge>
                              {result.verified && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Serial:</span> {result.serial}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Report #:</span> {result.reportNumber}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Owner:</span> {result.owner.name}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Reported:</span> {result.reportedDate}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{result.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {result.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Last seen: {result.lastSeen}
                              </span>
                              <span className="flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                {result.tips} community tips
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Button size="sm" onClick={() => setSelectedCase(result)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <div className="text-right text-sm">
                              <div className="font-medium text-success">${result.reward} reward</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Submit Recovery Report */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Submit Recovery Report</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Device Serial Number</Label>
                    <Input 
                      placeholder="ABC123456789"
                      value={reportForm.deviceId}
                      onChange={(e) => setReportForm(prev => ({ ...prev, deviceId: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Case Number</Label>
                    <Input 
                      placeholder="RC-2025-000123"
                      value={reportForm.caseNumber}
                      onChange={(e) => setReportForm(prev => ({ ...prev, caseNumber: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Recovery Location</Label>
                    <Input 
                      placeholder="Where was the device recovered?"
                      value={reportForm.recoveryLocation}
                      onChange={(e) => setReportForm(prev => ({ ...prev, recoveryLocation: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea 
                      placeholder="Additional details about the recovery..."
                      value={reportForm.notes}
                      onChange={(e) => setReportForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleSubmitRecovery}
                    disabled={!reportForm.deviceId || !reportForm.caseNumber}
                  >
                    Submit Recovery Report
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Recovery Process</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</div>
                      <div>
                        <div className="font-medium">Submit Recovery Report</div>
                        <div className="text-muted-foreground">Log device recovery with case details</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</div>
                      <div>
                        <div className="font-medium">Verify Ownership</div>
                        <div className="text-muted-foreground">Check blockchain ownership records</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</div>
                      <div>
                        <div className="font-medium">Contact Owner</div>
                        <div className="text-muted-foreground">Notify legitimate owner for pickup</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">4</div>
                      <div>
                        <div className="font-medium">Complete Return</div>
                        <div className="text-muted-foreground">Document successful return</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Active Reports Tab */}
          <TabsContent value="reports" className="space-y-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Active Stolen Device Reports</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {stolenReports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{report.device}</h3>
                            <Badge variant={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Report #{report.reportNumber} • Serial: {report.serial}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">${report.reward}</div>
                          <div className="text-xs text-muted-foreground">Reward</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{report.owner.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{report.owner.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{report.owner.email}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{report.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Reported: {report.reportedDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-muted-foreground" />
                            <span>{report.tips} community tips</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          Police Report
                        </Button>
                        <Button size="sm" onClick={() => handleReturnApproval(report.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Return
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Recovery Log Tab */}
          <TabsContent value="recovery" className="space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Recoveries</h2>
              
              <div className="space-y-3">
                {recoveryLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{log.device} - {log.owner}</div>
                      <div className="text-sm text-muted-foreground">
                        Case: {log.caseNumber} • Serial: {log.serial}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Recovered by {log.officer} from {log.location}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.notes}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">{log.recoveredDate}</div>
                      <Badge variant={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recovery Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-bold text-success">34 recoveries</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Month</span>
                    <span className="font-bold">28 recoveries</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-bold text-primary">87.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Recovery Time</span>
                    <span className="font-bold">4.2 days</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Top Recovery Locations
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Pawn Shops</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Online Marketplaces</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Private Individuals</span>
                    <span className="font-bold">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Locations</span>
                    <span className="font-bold">9%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LawEnforcementDashboard;