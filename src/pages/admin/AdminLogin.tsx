import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Test Supabase connection on mount
  useEffect(() => {
    console.log('🧪 AdminLogin: Testing Supabase connection...');
    const testConnection = async () => {
      try {
        const startTime = Date.now();
        const { data, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 3000)
          )
        ]);
        const elapsed = Date.now() - startTime;
        console.log(`🧪 Supabase connection test: ${elapsed}ms`, { hasData: !!data, error });
      } catch (error) {
        console.error('🧪 Supabase connection test failed:', error);
      }
    };
    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Admin login attempt:', formData.email);
      
      // Sign in using the auth system
      console.log('📝 Calling signIn function...');
      const result = await signIn(formData.email, formData.password);
      console.log('📝 SignIn result received:', { hasData: !!result.data, hasError: !!result.error });
      
      if (result.data && !result.error) {
        console.log('🔐 User authenticated successfully, checking admin status...');
        console.log('🔐 User ID:', result.data.user.id);
        
        // Direct database check for admin status (simplified to avoid RLS recursion)
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', result.data.user.id)
          .eq('is_active', true)
          .single();
        
        console.log('🔍 Admin check result:', { adminUser, adminError });
        
        if (adminError) {
          console.error('❌ Admin check failed:', adminError);
          toast.error("❌ Failed to verify admin status. Please try again.");
          await supabase.auth.signOut();
          return;
        }
        
        if (adminUser) {
          console.log('✅ Admin user found:', adminUser.role);
          toast.success("✅ Admin login successful!");
          
          // Store admin info in localStorage for quick access
          localStorage.setItem('admin_user', JSON.stringify({
            id: adminUser.id,
            role: adminUser.role,
            permissions: adminUser.permissions,
            department: adminUser.department,
            position: adminUser.position
          }));
          
          navigate('/admin/dashboard');
        } else {
          console.log('❌ User is not an admin');
          toast.error("❌ Access denied. Admin privileges required.");
          await supabase.auth.signOut();
        }
      } else {
        console.error('❌ Authentication failed:', result.error);
        toast.error("❌ Invalid credentials");
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error("❌ Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <STOLENLogo />
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Admin Portal
          </CardTitle>
          <CardDescription>
            Sign in to access the administrative dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="admin@stolen.com"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pr-10"
                  autoComplete="current-password"
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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In to Admin Portal
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Security Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a secure admin portal. All login attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Access Info */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact system administrator
            </p>
            <Button 
              variant="link" 
              className="text-sm"
              onClick={() => navigate('/')}
            >
              Back to Main App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
