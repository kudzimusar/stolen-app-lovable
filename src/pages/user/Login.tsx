import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Mail, Smartphone, Fingerprint, Users, Building, Wrench, FileText, Gavel, Heart, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(searchParams.get('role') || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: "individual", label: "Member", icon: Users },
    { id: "retailer", label: "Retailer Admin", icon: Building },
    { id: "repair_shop", label: "Repairer Admin", icon: Wrench },
    { id: "insurance", label: "Insurance Admin", icon: FileText },
    { id: "law_enforcement", label: "Law Enforcement Admin", icon: Gavel },
    { id: "ngo", label: "NGO Admin", icon: Heart },
    { id: "other", label: "Other", icon: Shield }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role before signing in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Add timeout to prevent infinite loading
      const loginTimeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          toast({
            title: "Login Timeout",
            description: "Login is taking too long. Please try again.",
            variant: "destructive",
          });
        }
      }, 10000); // 10 second timeout

      const credential = loginMethod === "email" ? email : phone;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginMethod === "email" ? credential : `${credential}@placeholder.com`, // Phone auth would need different setup
        password,
      });

      clearTimeout(loginTimeout);

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Check if user exists in our users table and get their role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          // User doesn't exist in our users table, create them with selected role
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              role: selectedRole as any,
              display_name: email.split('@')[0],
            });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
          }
        }

        // Navigate based on role
        const roleRoutes = {
          "individual": "/dashboard",
          "admin": "/admin",
          "super_admin": "/admin",
          "retailer": "/retailer-admin",  // New admin panel
          "repair_shop": "/repair-shop-admin",  // New admin panel
          "insurance": "/insurance-admin",  // New admin panel
          "law_enforcement": "/law-enforcement-admin",  // New admin panel
          "ngo": "/ngo-admin",  // New admin panel
          "other": "/dashboard"
        };
        
        const userRole = userData?.role || selectedRole;
        const route = roleRoutes[userRole as keyof typeof roleRoutes] || "/dashboard";
        navigate(route);
        
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <STOLENLogo />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Your Role</Label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <Button
                  key={role.id}
                  variant={selectedRole === role.id ? "default" : "outline"}
                  size="sm"
                  className={`h-auto p-3 flex flex-col items-center space-y-1 ${
                    selectedRole === role.id ? "ring-2 ring-primary/20" : ""
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {role.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={loginMethod === "email" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setLoginMethod("email")}
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button
            variant={loginMethod === "phone" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setLoginMethod("phone")}
          >
            <Smartphone className="w-4 h-4" />
            Phone
          </Button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credential">
              {loginMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <Input
              id="credential"
              type={loginMethod === "email" ? "email" : "tel"}
              placeholder={
                loginMethod === "email" ? "user@example.com" : "+27 82 123 4567"
              }
              className="h-12"
              value={loginMethod === "email" ? email : phone}
              onChange={(e) => loginMethod === "email" ? setEmail(e.target.value) : setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12" 
            size="lg"
            disabled={!selectedRole || isLoading}
          >
            <Lock className="w-4 h-4" />
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            size="lg"
            disabled={!selectedRole}
          >
            <Fingerprint className="w-4 h-4" />
            Use Biometric Login
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up for free
            </Link>
          </p>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;