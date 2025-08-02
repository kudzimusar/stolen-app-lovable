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

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      alert("Please agree to the terms and conditions");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      if (formData.role === "other") {
        alert("Thank you for your registration. Our team will review your application and contact you within 24-48 hours.");
      } else {
        navigate("/dashboard");
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-6">
        <div className="text-center space-y-4">
          <STOLENLogo />
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