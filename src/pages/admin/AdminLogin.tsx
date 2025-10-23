import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Building, Wrench, Scale, Badge, Heart, User } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('kudzimusar@gmail.com');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin', icon: Shield, color: 'text-red-600' },
    { value: 'retailer', label: 'Retailer Department', icon: Building, color: 'text-blue-600' },
    { value: 'repair_shop', label: 'Repair Shop Department', icon: Wrench, color: 'text-orange-600' },
    { value: 'insurance', label: 'Insurance Department', icon: Scale, color: 'text-purple-600' },
    { value: 'law_enforcement', label: 'Law Enforcement Department', icon: Badge, color: 'text-green-600' },
    { value: 'ngo', label: 'NGO Department', icon: Heart, color: 'text-pink-600' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.data && !result.error) {
        // Check if user has the selected role
        const userRole = result.data.user?.role;
        const userEmail = result.data.user?.email;
        
        // Special privilege: kudzimusar@gmail.com can access all departments
        const isSuperAdminAccount = userEmail === 'kudzimusar@gmail.com' && userRole === 'super_admin';
        
        if (userRole === selectedRole || userRole === 'super_admin' || userRole === 'admin' || isSuperAdminAccount) {
          // Redirect based on role
          const roleRoutes = {
            'super_admin': '/admin',
            'admin': '/admin',
            'retailer': '/retailer-admin',
            'repair_shop': '/repair-shop-admin',
            'insurance': '/insurance-admin',
            'law_enforcement': '/law-enforcement-admin',
            'ngo': '/ngo-admin'
          };

          const redirectPath = roleRoutes[selectedRole as keyof typeof roleRoutes] || '/admin';
          navigate(redirectPath);
          
          if (isSuperAdminAccount) {
            toast.success(`Super Admin access granted to ${roleOptions.find(r => r.value === selectedRole)?.label}`);
          } else {
            toast.success(`Welcome to ${roleOptions.find(r => r.value === selectedRole)?.label}`);
          }
        } else {
          toast.error(`Access denied. Your account role (${userRole}) doesn't match selected department (${selectedRole})`);
        }
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleValue: string) => {
    const role = roleOptions.find(r => r.value === roleValue);
    return role ? role.icon : User;
  };

  const getRoleColor = (roleValue: string) => {
    const role = roleOptions.find(r => r.value === roleValue);
    return role ? role.color : 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-blue-600">STOLEN</CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Admin Portal</CardTitle>
          </div>
          <CardDescription>
            Sign in to access the administrative dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Select Department</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${role.color}`} />
                          <span>{role.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Portal'}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Security Notice</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              This is a secure admin portal. All login attempts are logged and monitored.
            </p>
          </div>

          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-gray-600">
              <a href="#" className="text-blue-600 hover:underline">
                Need help? Contact system administrator
              </a>
            </p>
            <p className="text-sm">
              <a href="/" className="text-blue-600 hover:underline">
                Back to Main App
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;