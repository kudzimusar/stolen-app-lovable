import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Flag,
  Search,
  Filter,
  Ban,
  Check,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/auth';

interface Report {
  id: string;
  user_id: string;
  report_type: 'lost' | 'found';
  device_model: string;
  description: string;
  location_address: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'resolved';
  community_score: number;
  created_at: string;
  users: {
    display_name: string;
    email: string;
  };
  flags: Array<{
    id: string;
    reason: string;
    reported_by: string;
    created_at: string;
  }>;
}

interface User {
  id: string;
  display_name: string;
  email: string;
  role: string;
  reputation_score: number;
  created_at: string;
  last_active: string;
}

const AdminModerationTools = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [moderationAction, setModerationAction] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadReports();
    loadUsers();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('lost_found_reports')
        .select(`
          *,
          users!inner(display_name, email),
          flags:report_flags(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleModerationAction = async (reportId: string, action: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('lost_found_reports')
        .update({
          verification_status: action,
          moderation_reason: reason,
          moderated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Update local state
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, verification_status: action as any }
          : report
      ));

      setSelectedReport(null);
      setModerationAction('');
      setModerationReason('');
    } catch (error) {
      console.error('Error moderating report:', error);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'ban') {
        const { error } = await supabase
          .from('users')
          .update({ 
            role: 'banned',
            banned_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      } else if (action === 'unban') {
        const { error } = await supabase
          .from('users')
          .update({ 
            role: 'member',
            banned_at: null
          })
          .eq('id', userId);

        if (error) throw error;
      }

      loadUsers();
    } catch (error) {
      console.error('Error handling user action:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.device_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.users.display_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Admin Moderation Tools
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage community reports and user accounts
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.verification_status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.verification_status === 'verified').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Report Management</CardTitle>
                <CardDescription>
                  Review and moderate community reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{report.device_model}</h3>
                          {getStatusBadge(report.verification_status)}
                          {report.flags.length > 0 && (
                            <Badge variant="destructive">
                              <Flag className="w-3 h-3 mr-1" />
                              {report.flags.length} flags
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>by {report.users.display_name}</span>
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          <span>{report.location_address}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.display_name}</h4>
                          <Badge variant={user.role === 'banned' ? 'destructive' : 'outline'}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Reputation: {user.reputation_score} | 
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {user.role === 'banned' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'unban')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Unban
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'ban')}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Analytics</CardTitle>
                <CardDescription>
                  Insights and metrics for community health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Report Status Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span>{reports.filter(r => r.verification_status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verified</span>
                        <span>{reports.filter(r => r.verification_status === 'verified').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rejected</span>
                        <span>{reports.filter(r => r.verification_status === 'rejected').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolved</span>
                        <span>{reports.filter(r => r.verification_status === 'resolved').length}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">User Activity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Users</span>
                        <span>{users.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Users</span>
                        <span>{users.filter(u => u.role !== 'banned').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Banned Users</span>
                        <span>{users.filter(u => u.role === 'banned').length}</span>
                      </div>
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

export default AdminModerationTools;
