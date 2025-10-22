// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Package, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  MessageCircle,
  Shield,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  BarChart3,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";

interface LostFoundReport {
  id: string;
  device_model: string;
  device_category?: string;
  report_type: 'lost' | 'found';
  status: string;
  verification_status: string;
  reward_amount: number;
  created_at: string;
  claim_status?: string;
  claim_submitted_at?: string;
  claimant_name?: string;
  claim_verification_notes?: string;
  users: {
    display_name: string;
    email: string;
  };
  community_tips_count: number;
  location_address: string;
  description: string;
}

interface CommunityTip {
  id: string;
  tip_type: string;
  tip_description: string;
  created_at: string;
  users: {
    display_name: string;
    email: string;
  };
}

interface LostFoundPanelProps {
  roleFilter?: string;
}

const LostFoundPanel = ({ roleFilter }: LostFoundPanelProps = {}) => {
  const { getAuthToken } = useAuth();
  const [reports, setReports] = useState<LostFoundReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LostFoundReport | null>(null);
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch('/api/v1/lost-found/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setReports(result.data || []);
      } else {
        console.error('Failed to fetch reports');
        toast.error("Failed to load reports");
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error("Error loading reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchTipsForReport = async (reportId: string) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`/api/v1/community-tips?report_id=${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTips(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    }
  };

  const handleViewDetails = (report: LostFoundReport) => {
    setSelectedReport(report);
    fetchTipsForReport(report.id);
  };

  const handleApproveReward = async () => {
    if (!selectedReport) return;
    
    try {
      setActionLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch(`/api/v1/lost-found/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'pending_verification',
          verification_status: 'pending'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Approval successful:', result);
        toast.success("✅ Reward approved! Owner will be notified to verify the device.");
        
        // Close modal and reset state
        setShowApprovalDialog(false);
        setSelectedReport(null);
        
        // Refresh data
        await fetchReports();
        
        // Additional success notification
        setTimeout(() => {
          toast.success("🎉 Report status updated successfully!");
        }, 500);
      } else {
        const errorData = await response.json();
        console.error('Approval failed:', errorData);
        toast.error(`❌ Failed to approve reward: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving reward:', error);
      toast.error("Error approving reward");
    } finally {
      setActionLoading(false);
      // Ensure modal closes even on error
      setTimeout(() => {
        setShowApprovalDialog(false);
        setSelectedReport(null);
      }, 1000);
    }
  };

  const handleRejectReward = async () => {
    if (!selectedReport) return;
    
    try {
      setActionLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch(`/api/v1/lost-found/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'active',
          verification_status: 'unverified'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Rejection successful:', result);
        toast.success("✅ Reward rejected. Device remains lost.");
        
        // Close modal and reset state
        setShowRejectionDialog(false);
        setSelectedReport(null);
        
        // Refresh data
        await fetchReports();
        
        // Additional success notification
        setTimeout(() => {
          toast.success("🎉 Report status updated successfully!");
        }, 500);
      } else {
        const errorData = await response.json();
        console.error('Rejection failed:', errorData);
        toast.error(`❌ Failed to reject reward: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting reward:', error);
      toast.error("Error rejecting reward");
    } finally {
      setActionLoading(false);
      // Ensure modal closes even on error
      setTimeout(() => {
        setShowRejectionDialog(false);
        setSelectedReport(null);
      }, 1000);
    }
  };

  const handleApproveClaim = async (reportId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/approve-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          report_id: reportId,
          approval_status: 'approved',
          admin_notes: 'Claim approved by admin'
        })
      });

      if (response.ok) {
        toast.success("✅ Claim approved successfully.");
        await fetchReports();
        setSelectedReport(null);
      } else {
        throw new Error('Failed to approve claim');
      }
    } catch (error) {
      console.error('Error approving claim:', error);
      toast.error("❌ Failed to approve claim. Please try again.");
    }
  };

  const handleRejectClaim = async (reportId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/approve-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          report_id: reportId,
          approval_status: 'rejected',
          admin_notes: 'Claim rejected by admin - insufficient proof of ownership'
        })
      });

      if (response.ok) {
        toast.success("✅ Claim rejected.");
        await fetchReports();
        setSelectedReport(null);
      } else {
        throw new Error('Failed to reject claim');
      }
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error("❌ Failed to reject claim. Please try again.");
    }
  };

  const getStatusBadge = (status: string, verificationStatus: string, claimStatus?: string) => {
    if (status === 'reunited') {
      return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Successfully Reunited</Badge>;
    }
    if (status === 'reward_paid') {
      return <Badge className="bg-yellow-200 text-yellow-900 border-yellow-400"><DollarSign className="w-3 h-3 mr-1" />Reward Paid</Badge>;
    }
    if (claimStatus === 'claim_pending') {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-300"><AlertTriangle className="w-3 h-3 mr-1" />Claim Pending</Badge>;
    }
    if (status === 'pending_verification') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300"><Clock className="w-3 h-3 mr-1" />Awaiting Verification</Badge>;
    }
    if (status === 'contacted') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertTriangle className="w-3 h-3 mr-1" />Contact Received</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 border-red-300"><Package className="w-3 h-3 mr-1" />Lost</Badge>;
  };

  const getRewardStatus = (report: LostFoundReport) => {
    if (!report.reward_amount || report.reward_amount === 0) {
      return <span className="text-muted-foreground">No reward</span>;
    }
    
    if (report.status === 'reunited') {
      return <span className="text-green-600 font-semibold">Reward Paid</span>;
    }
    if (report.status === 'pending_verification') {
      return <span className="text-orange-600 font-semibold">Reward Processing</span>;
    }
    if (report.status === 'contacted') {
      return <span className="text-yellow-600 font-semibold">Reward Pending</span>;
    }
    return <span className="text-blue-600 font-semibold">Reward Offered</span>;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.device_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.users.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStats = () => {
    const total = reports.length;
    const active = reports.filter(r => r.status === 'active').length;
    const contacted = reports.filter(r => r.status === 'contacted').length;
    const pending = reports.filter(r => r.status === 'pending_verification').length;
    const reunited = reports.filter(r => r.status === 'reunited').length;
    const claim_pending = reports.filter(r => r.claim_status === 'claim_pending').length;
    const totalRewards = reports.reduce((sum, r) => sum + (r.reward_amount || 0), 0);
    
    return { total, active, contacted, pending, reunited, claim_pending, totalRewards };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Overview Stats - Native Mobile First */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Total Reports</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.total}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">All time</p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Active Reports</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.active}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">Currently lost</p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Pending Approval</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.contacted + stats.pending}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Reunited</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.reunited}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">Successfully returned</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Management Toolbar */}
      <DataManagementToolbar
        dataType="lost_reports"
        data={filteredReports}
        onImportComplete={async (importedData) => {
          // Handle imported reports
          console.log('Imported reports:', importedData);
          toast.success(`${importedData.length} reports imported successfully`);
          await fetchReports(); // Refresh the list
        }}
        showTemplateDownload={true}
        showImport={true}
        showExport={true}
      />

      {/* Search and Filter - Native Mobile */}
      <Card className="p-2 sm:p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">Lost & Found Management</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage device reports, rewards, and verification</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search devices, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 sm:pl-10 pr-3 py-2 w-full border rounded-lg text-xs sm:text-sm h-8 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 min-w-[120px] px-2 py-2 border rounded-lg text-xs sm:text-sm h-8 sm:h-10"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="contacted">Contacted</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="reunited">Reunited</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchReports} className="flex-shrink-0 h-8 sm:h-10 text-xs sm:text-sm">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-shrink-0 hidden sm:flex h-8 sm:h-10 text-xs sm:text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-full min-w-max sm:grid sm:w-full sm:grid-cols-5 gap-1">
                <TabsTrigger value="pending" className="text-[10px] sm:text-xs whitespace-nowrap px-2 sm:px-3">
                  Contact ({stats.contacted})
                </TabsTrigger>
                <TabsTrigger value="claims" className="text-[10px] sm:text-xs whitespace-nowrap px-2 sm:px-3">
                  Claims ({stats.claim_pending || 0})
                </TabsTrigger>
                <TabsTrigger value="verification" className="text-[10px] sm:text-xs whitespace-nowrap px-2 sm:px-3">
                  Verify ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-[10px] sm:text-xs whitespace-nowrap px-2 sm:px-3">
                  Reunited ({stats.reunited})
                </TabsTrigger>
                <TabsTrigger value="all" className="text-[10px] sm:text-xs whitespace-nowrap px-2 sm:px-3">
                  All ({stats.total})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pending" className="space-y-4">
              {filteredReports.filter(r => r.status === 'contacted').map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          <h3 className="text-lg font-semibold">{report.device_model}</h3>
                          {getStatusBadge(report.status, report.verification_status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.users.display_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {report.community_tips_count} responses
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {getRewardStatus(report)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)} className="flex-1 lg:flex-none">
                          <Eye className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 lg:flex-none"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowApprovalDialog(true);
                          }}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Approve</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1 lg:flex-none"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowRejectionDialog(true);
                          }}
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Reject</span>
                          <span className="sm:hidden">✗</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="claims" className="space-y-4">
              {filteredReports.filter(r => r.claim_status === 'claim_pending').map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{report.device_model}</h3>
                        <p className="text-sm text-gray-600">{report.device_category}</p>
                        <p className="text-xs text-gray-500">Claim submitted: {new Date(report.claim_submitted_at).toLocaleDateString()}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />Claim Pending
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Claimant:</p>
                        <p className="text-sm text-gray-600">{report.claimant_name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Verification Score:</p>
                        <p className="text-sm text-gray-600">{report.claim_verification_notes || 'Not calculated'}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveClaim(report.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />Approve Claim
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectClaim(report.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />Reject Claim
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="w-4 h-4 mr-1" />View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredReports.filter(r => r.claim_status === 'claim_pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending claims at the moment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              {filteredReports.filter(r => r.status === 'pending_verification').map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          <h3 className="text-lg font-semibold">{report.device_model}</h3>
                          {getStatusBadge(report.status, report.verification_status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.users.display_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {getRewardStatus(report)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Awaiting owner verification...</p>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)} className="flex-1 lg:flex-none">
                          <Eye className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1 lg:flex-none"
                          onClick={async () => {
                            try {
                              setActionLoading(true);
                              const token = await getAuthToken();
                              
                              const response = await fetch(`/api/v1/lost-found/reports/${report.id}`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  status: 'reunited',
                                  verification_status: 'verified'
                                })
                              });

                              if (response.ok) {
                                toast.success("✅ Device marked as reunited! Owner will be notified.");
                                fetchReports();
                              } else {
                                toast.error("❌ Failed to mark device as reunited");
                              }
                            } catch (error) {
                              console.error('Error marking device as reunited:', error);
                              toast.error("Error marking device as reunited");
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Mark as Reunited</span>
                          <span className="sm:hidden">Reunite</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {filteredReports.filter(r => r.status === 'reunited').map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{report.device_model}</h3>
                          {getStatusBadge(report.status, report.verification_status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.users.display_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {getRewardStatus(report)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{report.device_model}</h3>
                          {getStatusBadge(report.status, report.verification_status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.users.display_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {report.community_tips_count} responses
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {getRewardStatus(report)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Details Modal - Mobile Optimized */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={() => setSelectedReport(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {selectedReport.device_model} - {selectedReport.report_type.toUpperCase()}
              </CardTitle>
              <CardDescription>
                Report ID: {selectedReport.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Owner Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedReport.users.display_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {selectedReport.users.email}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Device Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {selectedReport.device_model}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedReport.location_address}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedReport.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reward Information</h4>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">R{selectedReport.reward_amount}</span>
                  <span className="text-sm text-muted-foreground">({getRewardStatus(selectedReport)})</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Community Responses ({tips.length})</h4>
                <div className="space-y-2">
                  {tips.map((tip) => (
                    <div key={tip.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{tip.users.display_name}</span>
                        <Badge variant="outline">{tip.tip_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{tip.tip_description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(tip.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.status === 'contacted' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => setShowApprovalDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve Reward
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => setShowRejectionDialog(true)}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject Claim
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Approval Dialog */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Reward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the reward for this device? 
              The owner will be notified to verify the device is found.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApproveReward}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Processing..." : "Approve Reward"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this claim? 
              The device will remain marked as lost and the reward will stay active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectReward}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Processing..." : "Reject Claim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LostFoundPanel;
