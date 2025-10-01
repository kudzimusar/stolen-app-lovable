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
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface LostFoundReport {
  id: string;
  device_model: string;
  report_type: 'lost' | 'found';
  status: string;
  verification_status: string;
  reward_amount: number;
  created_at: string;
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

const LostFoundAdmin = () => {
  const { getAuthToken } = useAuth();
  const [reports, setReports] = useState<LostFoundReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LostFoundReport | null>(null);
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      
      // Update report status to 'pending_verification'
      const response = await fetch(`/api/v1/lost-found/reports/${selectedReport.id}`, {
        method: 'PATCH',
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
        toast.success("✅ Reward approved! Owner will be notified to verify the device.");
        setShowApprovalDialog(false);
        fetchReports();
      } else {
        toast.error("❌ Failed to approve reward");
      }
    } catch (error) {
      console.error('Error approving reward:', error);
      toast.error("Error approving reward");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReward = async () => {
    if (!selectedReport) return;
    
    try {
      setActionLoading(true);
      const token = await getAuthToken();
      
      // Update report status back to 'active'
      const response = await fetch(`/api/v1/lost-found/reports/${selectedReport.id}`, {
        method: 'PATCH',
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
        toast.success("✅ Reward rejected. Device remains lost.");
        setShowRejectionDialog(false);
        fetchReports();
      } else {
        toast.error("❌ Failed to reject reward");
      }
    } catch (error) {
      console.error('Error rejecting reward:', error);
      toast.error("Error rejecting reward");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string, verificationStatus: string) => {
    if (status === 'reunited') {
      return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Reunited</Badge>;
    }
    if (status === 'pending_verification') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300"><Clock className="w-3 h-3 mr-1" />Pending Verification</Badge>;
    }
    if (status === 'contacted') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertTriangle className="w-3 h-3 mr-1" />Contact Received</Badge>;
    }
    return <Badge variant="secondary"><Package className="w-3 h-3 mr-1" />Active</Badge>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lost & Found Admin</h1>
          <p className="text-muted-foreground">Manage device reports, rewards, and verification</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Approval ({reports.filter(r => r.status === 'contacted').length})</TabsTrigger>
            <TabsTrigger value="verification">Awaiting Verification ({reports.filter(r => r.status === 'pending_verification').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({reports.filter(r => r.status === 'reunited').length})</TabsTrigger>
            <TabsTrigger value="all">All Reports ({reports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {reports.filter(r => r.status === 'contacted').map((report) => (
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
                      <p className="text-sm text-muted-foreground">{report.description}</p>
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

          <TabsContent value="verification" className="space-y-4">
            {reports.filter(r => r.status === 'pending_verification').map((report) => (
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
                          <DollarSign className="w-4 h-4" />
                          {getRewardStatus(report)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Awaiting owner verification...</p>
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

          <TabsContent value="completed" className="space-y-4">
            {reports.filter(r => r.status === 'reunited').map((report) => (
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
            {reports.map((report) => (
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

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
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
    </div>
  );
};

export default LostFoundAdmin;
