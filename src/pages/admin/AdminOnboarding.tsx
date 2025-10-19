// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { STOLENLogo } from '@/components/ui/STOLENLogo';
import { 
  Shield, 
  Users, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Settings,
  Database,
  Activity,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

interface AdminRole {
  id: string;
  role_name: string;
  description: string;
  permissions: string[];
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  department: string;
  position: string;
  is_active: boolean;
  created_at: string;
}

const AdminOnboarding = () => {
  const navigate = useNavigate();
  const { user, getAuthToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'onboard' | 'manage' | 'system'>('onboard');
  const [initializing, setInitializing] = useState(true);
  
  // Onboarding form state
  const [onboardingForm, setOnboardingForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    employeeId: '',
    department: '',
    position: '',
    notes: ''
  });

  // System state
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    totalRoles: 0,
    recentActivity: 0
  });

  useEffect(() => {
    const initializeAdmin = async () => {
      if (user) {
        await checkAdminAccess();
        await loadSystemData();
      }
      setInitializing(false);
    };

    initializeAdmin();
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      if (!user) {
        toast.error("❌ Please log in first");
        navigate('/admin/login');
        return;
      }

      // Check admin status using Supabase directly
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        console.error('Admin access check failed:', adminError);
        toast.error("❌ Admin privileges required");
        navigate('/admin/login');
        return;
      }

      console.log('✅ Admin access verified:', adminUser.role);
    } catch (error) {
      console.error('Admin access check failed:', error);
      toast.error("❌ Failed to verify admin access");
      navigate('/admin/login');
    }
  };

  const loadSystemData = async () => {
    try {
      // Load admin roles using Supabase
      const { data: rolesData, error: rolesError } = await supabase
        .from('admin_roles')
        .select('*')
        .order('role_name');

      if (rolesError) {
        console.error('Failed to load admin roles:', rolesError);
      } else {
        setAdminRoles(rolesData || []);
      }

      // Load admin users using Supabase
      const { data: usersData, error: usersError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Failed to load admin users:', usersError);
      } else {
        setAdminUsers(usersData || []);
        setSystemStats({
          totalAdmins: usersData?.length || 0,
          activeAdmins: usersData?.filter((u: AdminUser) => u.is_active).length || 0,
          totalRoles: rolesData?.length || 0,
          recentActivity: 0 // TODO: Implement activity tracking
        });
      }
    } catch (error) {
      console.error('Failed to load system data:', error);
    }
  };

  const handleOnboardAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onboardingForm.password !== onboardingForm.confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    if (!onboardingForm.email || !onboardingForm.role || !onboardingForm.employeeId) {
      toast.error("❌ Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      console.log('👤 Onboarding new admin:', onboardingForm.email);

      // First, create the user account using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: onboardingForm.email,
        password: onboardingForm.password,
        email_confirm: true
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Get the selected role
      const selectedRole = adminRoles.find(role => role.id === onboardingForm.role);
      if (!selectedRole) {
        throw new Error('Selected role not found');
      }

      // Create admin user record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          admin_role_id: selectedRole.id,
          role: selectedRole.role_name,
          employee_id: onboardingForm.employeeId,
          department: onboardingForm.department,
          position: onboardingForm.position,
          permissions: selectedRole.permissions,
          is_active: true
        });

      if (adminError) {
        throw new Error(adminError.message);
      }

      toast.success("✅ Admin onboarded successfully!");
      setOnboardingForm({
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        employeeId: '',
        department: '',
        position: '',
        notes: ''
      });
      loadSystemData(); // Refresh the data
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(`❌ Failed to onboard admin: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setOnboardingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-300';
      case 'admin_manager': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'lost_found_admin': return 'bg-green-100 text-green-800 border-green-300';
      case 'marketplace_admin': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'support_admin': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'security_admin': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 's_pay_admin': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'law_enforcement_admin': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'insurance_admin': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'repair_admin': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'community_admin': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'analytics_admin': return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'system_admin': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'finance_admin': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'customer_support_admin': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'retailer_admin': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Show loading screen while initializing
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Initializing Admin Portal...</h2>
          <p className="text-gray-500 mt-2">Please wait while we verify your access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <STOLENLogo className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Onboarding</h1>
              <p className="text-gray-600">Manage administrative access and system roles</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
              <Settings className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/login')}>
              <Lock className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.totalAdmins}</p>
                  <p className="text-sm text-gray-600">Total Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.activeAdmins}</p>
                  <p className="text-sm text-gray-600">Active Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.totalRoles}</p>
                  <p className="text-sm text-gray-600">Admin Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.recentActivity}</p>
                  <p className="text-sm text-gray-600">Recent Activity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'onboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('onboard')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Onboard Admin
          </Button>
          <Button
            variant={activeTab === 'manage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('manage')}
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Admins
          </Button>
          <Button
            variant={activeTab === 'system' ? 'default' : 'outline'}
            onClick={() => setActiveTab('system')}
          >
            <Database className="w-4 h-4 mr-2" />
            System Info
          </Button>
        </div>

        {/* Onboard Admin Tab */}
        {activeTab === 'onboard' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Onboard New Administrator
              </CardTitle>
              <CardDescription>
                Create a new admin account with appropriate role and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOnboardAdmin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={onboardingForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="admin@stolen.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Admin Role *</Label>
                    <Select value={onboardingForm.role} onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select admin role" />
                      </SelectTrigger>
                      <SelectContent>
                        {adminRoles.map((role) => (
                          <SelectItem key={role.id} value={role.role_name}>
                            <div className="flex items-center gap-2">
                              <Badge className={getRoleBadgeColor(role.role_name)}>
                                {role.role_name.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <span>{role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={onboardingForm.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Enter secure password"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={onboardingForm.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input
                      id="employeeId"
                      value={onboardingForm.employeeId}
                      onChange={(e) => handleInputChange("employeeId", e.target.value)}
                      placeholder="EMP-001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={onboardingForm.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      placeholder="IT, Operations, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={onboardingForm.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      placeholder="Administrator, Manager, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Onboarding Notes</Label>
                  <Textarea
                    id="notes"
                    value={onboardingForm.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes about this admin user..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Onboarding Admin...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Onboard Administrator
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Manage Admins Tab */}
        {activeTab === 'manage' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Current Administrators
              </CardTitle>
              <CardDescription>
                View and manage existing admin accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminUsers.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.email}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleBadgeColor(admin.role)}>
                            {admin.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-600">{admin.department} • {admin.position}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={admin.is_active ? "default" : "secondary"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Info Tab */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminRoles.map((role) => (
                    <div key={role.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getRoleBadgeColor(role.role_name)}>
                          {role.role_name.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database Status:</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin System:</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Level:</span>
                    <Badge className="bg-blue-100 text-blue-800">High</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-sm">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOnboarding;
