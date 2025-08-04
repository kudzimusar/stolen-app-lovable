import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { STOLENLogo } from "@/components/STOLENLogo";
import { EnhancedSelect } from "@/components/EnhancedSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  Mail, 
  User, 
  Building2, 
  Shield, 
  Wrench, 
  Scale, 
  Car, 
  GraduationCap,
  MoreHorizontal 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: "individual", label: "Member", icon: <User className="w-4 h-4" /> },
    { value: "retailer", label: "Retailer Admin", icon: <Building2 className="w-4 h-4" /> },
    { value: "repair_shop", label: "Repairer Admin", icon: <Wrench className="w-4 h-4" /> },
    { value: "insurance", label: "Insurance Admin", icon: <Shield className="w-4 h-4" /> },
    { value: "law_enforcement", label: "Law Enforcement Admin", icon: <Scale className="w-4 h-4" /> },
    { value: "ngo", label: "NGO Admin", icon: <GraduationCap className="w-4 h-4" /> },
    { value: "business", label: "For Business", icon: <Building2 className="w-4 h-4" /> },
    { value: "other", label: "Other", icon: <MoreHorizontal className="w-4 h-4" /> }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: formData.fullName,
            role: formData.role,
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Create user profile in our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: formData.email,
            display_name: formData.fullName,
            role: formData.role as any,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        if (formData.role === "other") {
          toast({
            title: "Registration Submitted",
            description: "Thank you for your registration. Our team will review your application and contact you within 24-48 hours.",
          });
          navigate("/login");
          return;
        }

        toast({
          title: "Registration Successful",
          description: "Please check your email to confirm your account.",
        });

        // Role-based redirection
        const roleRoutes = {
          "individual": "/dashboard",
          "retailer": "/retailer-dashboard",
          "repair_shop": "/repair-shop-dashboard",
          "insurance": "/insurance-dashboard",
          "law_enforcement": "/law-enforcement-dashboard",
          "ngo": "/ngo-dashboard",
          "business": "/retailer-dashboard"
        };

        const route = roleRoutes[formData.role as keyof typeof roleRoutes] || "/dashboard";
        navigate(route);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <STOLENLogo />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create Your Account</h1>
            <p className="text-muted-foreground">
              Join the STOLEN community and secure your devices
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <EnhancedSelect
              placeholder="Select your role"
              options={roleOptions}
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm leading-5">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12" 
            size="lg"
            disabled={isLoading || !agreeToTerms}
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in here
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

export default Register;