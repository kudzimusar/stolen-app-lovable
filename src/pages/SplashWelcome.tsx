import { useEffect, useState } from "react";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Zap } from "lucide-react";

const SplashWelcome = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <STOLENLogo className="relative z-10 scale-150" />
        </div>
        
        <div className="space-y-4 text-white">
          <h1 className="text-3xl font-bold">
            Welcome to STOLEN
          </h1>
          <p className="text-lg text-white/90">
            Blockchain-powered device security and recovery platform
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>Fast</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Trusted</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            asChild 
            className="w-full bg-white text-primary hover:bg-white/90"
            size="lg"
          >
            <Link to="/login">Get Started</Link>
          </Button>
          <Button 
            variant="outline" 
            asChild 
            className="w-full border-white text-white hover:bg-white/10"
          >
            <Link to="/">Learn More</Link>
          </Button>
        </div>

        <p className="text-xs text-white/70">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SplashWelcome;