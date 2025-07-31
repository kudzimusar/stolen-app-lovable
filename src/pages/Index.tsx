import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STOLENLogo } from "@/components/STOLENLogo";
import { FeatureCard } from "@/components/FeatureCard";
import { TrustBadge } from "@/components/TrustBadge";
import { DeviceRegistrationForm } from "@/components/DeviceRegistrationForm";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Smartphone, 
  Search, 
  Users, 
  ChevronRight,
  QrCode,
  ShoppingCart,
  AlertTriangle,
  Award,
  Lock,
  Zap,
  ArrowRightLeft
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <STOLENLogo />
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <Link to="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
              <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">Support</Link>
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <TrustBadge type="blockchain" text="Blockchain Powered" />
                  <TrustBadge type="secure" text="Military Grade Security" />
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Protect Your Gadgets with{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Blockchain Security
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  STOLEN revolutionizes gadget security with immutable blockchain registration, 
                  AI-powered fraud detection, and a global community dedicated to gadget recovery.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="xl"
                  onClick={() => setShowRegistration(true)}
                  className="group"
                >
                  <Smartphone className="w-5 h-5" />
                  Register Your Gadget
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/device/check">
                    <QrCode className="w-5 h-5" />
                    Check Gadget Status
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/transfer-donate">
                    <ArrowRightLeft className="w-5 h-5" />
                    Transfer or Donate Gadget
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/40">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1M+</div>
                  <div className="text-sm text-muted-foreground">Gadgets Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Security Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Protection</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-20 animate-pulse-glow"></div>
              <img 
                src={heroImage} 
                alt="STOLEN Security Platform" 
                className="relative z-10 rounded-3xl shadow-card w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose STOLEN?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced blockchain technology meets community-driven security to create 
              the ultimate gadget protection platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="w-8 h-8" />}
              title="Blockchain Registration"
              description="Immutable gadget records stored on blockchain ensure permanent ownership proof and prevent fraud."
              gradient
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="AI Fraud Detection"
              description="Advanced AI algorithms analyze patterns to detect and prevent fraudulent activities before they happen."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Global Community"
              description="Millions of users worldwide help recover lost gadgets through our decentralized recovery network."
              gradient
            />
            <FeatureCard
              icon={<ShoppingCart className="w-8 h-8" />}
              title="Secure Marketplace"
              description="Buy and sell verified second-hand gadgets with confidence using our escrow-protected marketplace."
            />
            <FeatureCard
              icon={<Search className="w-8 h-8" />}
              title="Instant Verification"
              description="Quickly verify gadget authenticity and ownership history with our real-time lookup system."
              gradient
            />
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="Recovery Rewards"
              description="Earn rewards for helping others recover their lost gadgets and contributing to the community."
            />
          </div>
        </div>
      </section>

      {/* Registration Form Modal */}
      {showRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute -top-2 -right-2 z-10"
              onClick={() => setShowRegistration(false)}
            >
              ×
            </Button>
            <DeviceRegistrationForm />
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold">Ready to Secure Your Gadgets?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join millions of users who trust STOLEN to protect their valuable gadgets. 
              Start with our free registration today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="xl"
                onClick={() => setShowRegistration(true)}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Zap className="w-5 h-5" />
                Register Now - Free
              </Button>
              <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <STOLENLogo />
              <p className="text-muted-foreground">
                Blockchain-powered gadget security for the modern world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Gadget Registration</div>
                <div>Marketplace</div>
                <div>Recovery Network</div>
                <div>API Access</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Help Center</div>
                <div>Documentation</div>
                <div>Community</div>
                <div>Contact Us</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>About Us</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Security</div>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 STOLEN. All rights reserved. Securing gadgets with blockchain technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
