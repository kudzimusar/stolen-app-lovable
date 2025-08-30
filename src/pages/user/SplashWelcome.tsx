import { useEffect, useState } from "react";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, Zap, Users, Building, Wrench, FileText, Gavel, Heart } from "lucide-react";

const SplashWelcome = () => {
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const roles = [
    { id: "member", label: "Member", icon: Users, description: "Individual user protecting personal devices" },
    { id: "retailer", label: "Retailer Admin", icon: Building, description: "Business managing device inventory" },
    { id: "repairer", label: "Repairer Admin", icon: Wrench, description: "Repair shop tracking device history" },
    { id: "insurance", label: "Insurance Admin", icon: FileText, description: "Insurance company verifying claims" },
    { id: "law-enforcement", label: "Law Enforcement Admin", icon: Gavel, description: "Police and security agencies" },
    { id: "ngo", label: "NGO Admin", icon: Heart, description: "Non-profit organizations" },
    { id: "other", label: "Other", icon: Shield, description: "Other professional use cases" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="animate-pulse-glow">
            <STOLENLogo className="scale-150" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Securing Your Digital World
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <STOLENLogo className="scale-150" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Welcome to STOLEN
          </h1>
          <p className="text-lg text-white/90 mb-2">
            Choose your role to get started
          </p>
          <p className="text-sm text-white/70">
            Blockchain-powered device security and recovery platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card
                key={role.id}
                className={`p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-glow ${
                  selectedRole === role.id 
                    ? 'bg-white/20 border-white/40 ring-2 ring-white/50' 
                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-lg">
                    {role.label}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {role.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col items-center space-y-4">
          {selectedRole && (
            <Button 
              asChild 
              className="bg-white text-primary hover:bg-white/90 px-8"
              size="lg"
            >
              <Link to={`/register?role=${selectedRole}`}>
                Continue with {roles.find(r => r.id === selectedRole)?.label}
              </Link>
            </Button>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <p className="text-white/80 text-sm">
              Already have an account?
            </p>
            <Button 
              variant="outline" 
              asChild 
              className="border-white text-white hover:bg-white/10"
              size="sm"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          <p className="text-xs text-white/70 text-center max-w-md">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashWelcome;