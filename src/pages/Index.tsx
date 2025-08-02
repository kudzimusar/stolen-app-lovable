import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STOLENLogo } from "@/components/STOLENLogo";
import { AppHeader } from "@/components/AppHeader";
import { LiveChatWidget } from "@/components/LiveChatWidget";
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
      <AppHeader 
        showLogo={true}
        rightActions={
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Features</a>
            <Link to="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Marketplace</Link>
            <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Support</Link>
            <Button variant="outline" size="sm" asChild className="md:size-default">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild className="md:size-default">
              <Link to="/splash-welcome">Get Started</Link>
            </Button>
          </div>
        }
      />

      {/* Hero Section */}
      <section className="relative spacing-responsive overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container-responsive">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                  <TrustBadge type="blockchain" text="Blockchain Powered" />
                  <TrustBadge type="secure" text="Military Grade Security" />
                </div>
                <h1 className="heading-responsive">
                  Protect Your Gadgets with{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Blockchain Security
                  </span>
                </h1>
                <p className="text-responsive text-muted-foreground max-w-2xl">
                  STOLEN revolutionizes gadget security with immutable blockchain registration, 
                  AI-powered fraud detection, and a global community dedicated to gadget recovery.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <Button 
                  variant="hero" 
                  size="xl"
                  onClick={() => setShowRegistration(true)}
                  className="group w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                  Register Your Gadget
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                    <Link to="/device/check">
                      <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                      Check Status
                    </Link>
                  </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link to="/device-transfer">
                    <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    Transfer/Donate
                  </Link>
                </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-border/40">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">1M+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Gadgets Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Security Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Protection</div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative max-w-md mx-auto lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-hero rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-20 animate-pulse-glow"></div>
              <img 
                src={heroImage} 
                alt="STOLEN Security Platform" 
                className="relative z-10 rounded-2xl sm:rounded-3xl shadow-card w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="spacing-responsive bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="subheading-responsive mb-4 sm:mb-6">Why Choose STOLEN?</h2>
            <p className="text-responsive text-muted-foreground max-w-2xl lg:max-w-3xl mx-auto">
              Advanced blockchain technology meets community-driven security to create 
              the ultimate gadget protection platform.
            </p>
          </div>

          <div className="grid-responsive-cards">
            <FeatureCard
              icon={<Lock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="Blockchain Registration"
              description="Immutable gadget records stored on blockchain ensure permanent ownership proof and prevent fraud."
              gradient
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="AI Fraud Detection"
              description="Advanced AI algorithms analyze patterns to detect and prevent fraudulent activities before they happen."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="Global Community"
              description="Millions of users worldwide help recover lost gadgets through our decentralized recovery network."
              gradient
            />
            <FeatureCard
              icon={<ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="Secure Marketplace"
              description="Buy and sell verified second-hand gadgets with confidence using our escrow-protected marketplace."
            />
            <FeatureCard
              icon={<Search className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="Instant Verification"
              description="Quickly verify gadget authenticity and ownership history with our real-time lookup system."
              gradient
            />
            <FeatureCard
              icon={<Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="Recovery Rewards"
              description="Earn rewards for helping others recover their lost gadgets and contributing to the community."
            />
          </div>
        </div>
      </section>

      {/* Registration Form Modal */}
      {showRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute -top-2 -right-2 z-10 bg-background shadow-md"
              onClick={() => setShowRegistration(false)}
            >
              ×
            </Button>
            <DeviceRegistrationForm />
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="spacing-responsive bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-responsive relative z-10">
          <div className="text-center space-y-6 sm:space-y-8">
            <h2 className="subheading-responsive text-white">Ready to Secure Your Gadgets?</h2>
            <p className="text-responsive text-white/90 max-w-xl lg:max-w-2xl mx-auto">
              Join millions of users who trust STOLEN to protect their valuable gadgets. 
              Start with our free registration today.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4 items-center">
              <Button 
                variant="secondary" 
                size="xl"
                onClick={() => setShowRegistration(true)}
                className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                Register Now - Free
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto" asChild>
                <Link to="/support">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border">
        <div className="container-responsive">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <STOLENLogo />
              <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
                Blockchain-powered gadget security for the modern world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link to="/device/register" className="block hover:text-foreground transition-colors cursor-pointer">Gadget Registration</Link>
                <Link to="/marketplace" className="block hover:text-foreground transition-colors cursor-pointer">Marketplace</Link>
                <Link to="/community-board" className="block hover:text-foreground transition-colors cursor-pointer">Recovery Network</Link>
                <Link to="/retailer-dashboard" className="block hover:text-foreground transition-colors cursor-pointer">API Access</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link to="/support" className="block hover:text-foreground transition-colors cursor-pointer">Help Center</Link>
                <Link to="/support" className="block hover:text-foreground transition-colors cursor-pointer">Documentation</Link>
                <Link to="/community-board" className="block hover:text-foreground transition-colors cursor-pointer">Community</Link>
                <Link to="/support" className="block hover:text-foreground transition-colors cursor-pointer">Contact Us</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link to="/support" className="block hover:text-foreground transition-colors cursor-pointer">About Us</Link>
                <Link to="/support" className="block hover:text-foreground transition-colors cursor-pointer">Privacy Policy</Link>
                <Link to="/support" className="block hover:text-foreground transition-colors cursor-pointer">Terms of Service</Link>
                <Link to="/support" className="block hover:text-foreground transition-colors cursor-pointer">Security</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground">
            <p className="text-xs sm:text-sm">&copy; 2024 STOLEN. All rights reserved. Securing gadgets with blockchain technology.</p>
          </div>
        </div>
      </footer>
      
      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default Index;
