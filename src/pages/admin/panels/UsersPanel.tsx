// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Users, 
  UserPlus, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Ban,
  UserCheck,
  Building2,
  Wrench,
  Scale,
  Car,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  role: string;
  display_name: string;
  avatar_url?: string;
  phone?: string;
  address?: any;
  verification_status: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  device_count?: number;
  report_count?: number;
}

const UsersPanel = () => {
  const { getAuthToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      // Fetch users from database
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      // Transform the data with default counts
      const transformedUsers = (usersData || []).map((user) => {
        return {
          ...user,
          device_count: 0, // Will be populated by backend API
          report_count: 0  // Will be populated by backend API
        };
      });

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'verify' | 'suspend' | 'activate') => {
    try {
      setActionLoading(true);
      
      let updateData: any = {};
      
      switch (action) {
        case 'verify':
          updateData = { verification_status: true };
          break;
        case 'suspend':
          updateData = { verification_status: false };
          break;
        case 'activate':
          updateData = { verification_status: true };
          break;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'individual': return <Users className="w-4 h-4" />;
      case 'retailer': return <Building2 className="w-4 h-4" />;
      case 'repair_shop': return <Wrench className="w-4 h-4" />;
      case 'law_enforcement': return <Shield className="w-4 h-4" />;
      case 'insurance': return <Scale className="w-4 h-4" />;
      case 'ngo': return <GraduationCap className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'individual': return 'bg-blue-100 text-blue-800';
      case 'retailer': return 'bg-green-100 text-green-800';
      case 'repair_shop': return 'bg-orange-100 text-orange-800';
      case 'law_enforcement': return 'bg-red-100 text-red-800';
      case 'insurance': return 'bg-purple-100 text-purple-800';
      case 'ngo': return 'bg-pink-100 text-pink-800';
      case 'admin': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    verified: users.filter(u => u.verification_status).length,
    pending: users.filter(u => !u.verification_status).length,
    individual: users.filter(u => u.role === 'individual').length,
    business: users.filter(u => ['retailer', 'repair_shop', 'insurance'].includes(u.role)).length,
    admin: users.filter(u => u.role === 'admin').length
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Stats Cards - Native Mobile First */}
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Total Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{userStats.total}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">
              {userStats.verified} verified, {userStats.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Individual Users</CardTitle>
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{userStats.individual}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">
              Regular device owners
            </p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Business Partners</CardTitle>
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{userStats.business}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">
              Retailers, repair shops, insurance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls - Native Mobile with Quick Actions */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="flex-1 px-2 py-2 border rounded-md bg-background text-xs sm:text-sm h-8 sm:h-10"
          >
            <option value="all">All Roles</option>
            <option value="individual">Individual</option>
            <option value="retailer">Retailer</option>
            <option value="repair_shop">Repair Shop</option>
            <option value="law_enforcement">Law Enforcement</option>
            <option value="insurance">Insurance</option>
            <option value="ngo">NGO</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={fetchUsers} variant="outline" size="sm" className="h-8 sm:h-10 text-xs sm:text-sm">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 sm:h-10 text-xs sm:text-sm">Export</Button>
          <Button size="sm" className="h-8 sm:h-10 text-xs sm:text-sm">Add User</Button>
        </div>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage user accounts, verification status, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="p-3 sm:p-4">
                  {/* Mobile Card Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.display_name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <Users className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium truncate">{user.display_name || 'Unnamed User'}</h3>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {user.verification_status ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-[9px] px-2 py-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] px-2 py-0">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        <Badge variant="outline" className={`${getRoleColor(user.role)} text-[9px] px-2 py-0`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                      <div className="flex items-center gap-3">
                        <span>{user.device_count || 0} devices</span>
                        <span>{user.report_count || 0} reports</span>
                      </div>
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDialog(true);
                        }}
                        className="h-8 text-[10px] flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {!user.verification_status && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'verify')}
                          disabled={actionLoading}
                          className="h-8 text-[10px] flex-1"
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.display_name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <Users className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.display_name || 'Unnamed User'}</p>
                          {user.verification_status ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            <Badge variant="outline" className={getRoleColor(user.role)}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{user.device_count || 0} devices</span>
                          <span>{user.report_count || 0} reports</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {!user.verification_status && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'verify')}
                          disabled={actionLoading}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <AlertDialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>User Details</AlertDialogTitle>
            <AlertDialogDescription>
              View and manage user account information
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt={selectedUser.display_name} className="w-16 h-16 rounded-full" />
                  ) : (
                    <Users className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{selectedUser.display_name || 'Unnamed User'}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getRoleColor(selectedUser.role)}>
                      {getRoleIcon(selectedUser.role)}
                      <span className="ml-1">{selectedUser.role.replace('_', ' ')}</span>
                    </Badge>
                    {selectedUser.verification_status ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-mono text-xs">{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined:</span>
                      <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(selectedUser.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Devices:</span>
                      <span>{selectedUser.device_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reports:</span>
                      <span>{selectedUser.report_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedUser.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {selectedUser && !selectedUser.verification_status && (
              <AlertDialogAction
                onClick={() => {
                  handleUserAction(selectedUser.id, 'verify');
                  setShowUserDialog(false);
                }}
                disabled={actionLoading}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Verify User
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPanel;
