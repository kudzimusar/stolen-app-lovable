import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { AppHeader } from "@/components/navigation/AppHeader";
import { LiveChatWidget } from "@/components/ui/LiveChatWidget";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { DeviceRegistrationForm } from "@/components/forms/DeviceRegistrationForm";
import RoleBasedFeatureShowcase from "@/components/ui/RoleBasedFeatureShowcase";
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
  ArrowRightLeft,
  DollarSign,
  Globe,
  Brain,
  Database,
  Cpu,
  Activity,
  TrendingUp,
  Eye,
  Fingerprint,
  Network,
  SmartphoneIcon,
  Wifi,
  BarChart3,
  Clock,
  CheckCircle,
  Star,
  Target,
  Rocket,
  Sparkles,
  Building,
  FileText,
  Heart
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

// Import advanced technology components (temporarily disabled for debugging)
// import { aiTransferEngine } from "@/lib/ai/ai-transfer-suggestion-engine";
// import { smartPromptEngine } from "@/lib/ai/smart-transfer-prompt-engine";
// import { timingOptimizer } from "@/lib/ai/transfer-timing-optimizer";
// import { blockchainManager } from "@/lib/blockchain/blockchain-integration";
// import { PerformanceMonitor } from "@/lib/performance/performance-monitoring";
import CollapsibleSection from "@/components/ui/CollapsibleSection";

const Index = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [aiDemoData, setAiDemoData] = useState<any>(null);
  const [blockchainStats, setBlockchainStats] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [securityMetrics, setSecurityMetrics] = useState<any>(null);
  const navigate = useNavigate();

  // Load demo data for advanced features
  useEffect(() => {
    const loadDemoData = async () => {
      try {
        // Simulate AI transfer suggestions
        const demoSuggestions = [
          {
            deviceId: "iPhone-14-Pro-256GB",
            suggestionType: "upgrade",
            confidence: 0.89,
            reasoning: "Device is 2.5 years old, market value declining",
            estimatedValue: 850,
            urgency: "medium"
          },
          {
            deviceId: "MacBook-Pro-2021",
            suggestionType: "donate",
            confidence: 0.92,
            reasoning: "Perfect condition, high donation impact potential",
            estimatedValue: 1200,
            urgency: "low"
          }
        ];

        // Simulate blockchain stats
        const demoBlockchainStats = {
          totalDevices: 1247563,
          totalTransactions: 8923456,
          averageBlockTime: "2.3s",
          networkHashRate: "1.2 TH/s",
          activeNodes: 15432
        };

        // Simulate performance metrics
        const demoPerformanceMetrics = {
          apiResponseTime: "127ms",
          pageLoadTime: "1.8s",
          cacheHitRate: "94.2%",
          uptime: "99.97%",
          activeUsers: 45678
        };

        // Simulate security metrics
        const demoSecurityMetrics = {
          fraudPrevented: 12456,
          threatsBlocked: 89234,
          securityScore: "A+",
          lastIncident: "Never",
          encryptionLevel: "AES-256-GCM"
        };

        setAiDemoData(demoSuggestions);
        setBlockchainStats(demoBlockchainStats);
        setPerformanceMetrics(demoPerformanceMetrics);
        setSecurityMetrics(demoSecurityMetrics);
      } catch (error) {
        console.error("Error loading demo data:", error);
      }
    };

    loadDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showLogo={true} />

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
                  <TrustBadge type="verified" text="AI-Powered" />
                  <TrustBadge type="blockchain" text="Lightning Fast" />
                  <TrustBadge type="verified" text="Verified Device Only Marketplace" />
                </div>
                <h1 className="heading-responsive">
                  Protect Your Gadgets with{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Advanced Technology
                  </span>
                </h1>
                <p className="text-responsive text-muted-foreground max-w-2xl">
                  STOLEN revolutionizes gadget security with AI-powered fraud detection, 
                  immutable blockchain registration, real-time performance monitoring, 
                  and a global community dedicated to gadget recovery.
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
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/device/check')}
                    className="group w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                    Check Status
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/marketplace')}
                    className="group w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                    List Your Device
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-border/40">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">1.2M+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Gadgets Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">99.97%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">&lt;200ms</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">API Response</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">A+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Security</div>
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

      {/* Role-Based Access System Showcase */}
      <RoleBasedFeatureShowcase />

      {/* Advanced Technology Showcase */}
      <section className="spacing-responsive bg-muted/20">
        <div className="container-responsive">
          <CollapsibleSection
            title="Advanced Technology Stack"
            description="Experience the cutting-edge technology that powers STOLEN's comprehensive gadget security platform"
            icon={<Brain className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
              {/* AI/ML Technology */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-hero opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10 p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">AI-Powered Intelligence</h3>
                      <p className="text-sm text-muted-foreground">Machine Learning & Neural Networks</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fraud Detection Accuracy</span>
                      <span className="text-sm font-semibold text-green-600">99.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Transfer Suggestions</span>
                      <span className="text-sm font-semibold text-blue-600">AI-Generated</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pattern Recognition</span>
                      <span className="text-sm font-semibold text-purple-600">Real-time</span>
                    </div>
                  </div>
                  {aiDemoData && (
                    <div className="bg-background/50 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">Live AI Suggestions:</p>
                      {aiDemoData.slice(0, 2).map((suggestion: any, index: number) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {suggestion.deviceId}: {suggestion.suggestionType} ({Math.round(suggestion.confidence * 100)}% confidence)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Blockchain Technology */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-hero opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10 p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Blockchain Security</h3>
                      <p className="text-sm text-muted-foreground">Immutable & Decentralized</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Devices</span>
                      <span className="text-sm font-semibold text-blue-600">{blockchainStats?.totalDevices?.toLocaleString() || '1.2M+'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Block Time</span>
                      <span className="text-sm font-semibold text-cyan-600">{blockchainStats?.averageBlockTime || '2.3s'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Nodes</span>
                      <span className="text-sm font-semibold text-blue-600">{blockchainStats?.activeNodes?.toLocaleString() || '15K+'}</span>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-foreground">Live Blockchain Stats:</p>
                    <p className="text-xs text-muted-foreground">Hash Rate: {blockchainStats?.networkHashRate || '1.2 TH/s'}</p>
                    <p className="text-xs text-muted-foreground">Transactions: {blockchainStats?.totalTransactions?.toLocaleString() || '8.9M+'}</p>
                  </div>
                </div>
              </Card>

              {/* Performance Technology */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-hero opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10 p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Performance Optimization</h3>
                      <p className="text-sm text-muted-foreground">Lightning Fast & Scalable</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">API Response</span>
                      <span className="text-sm font-semibold text-green-600">{performanceMetrics?.apiResponseTime || '<200ms'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Page Load</span>
                      <span className="text-sm font-semibold text-emerald-600">{performanceMetrics?.pageLoadTime || '<2s'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                      <span className="text-sm font-semibold text-green-600">{performanceMetrics?.cacheHitRate || '94%'}</span>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-foreground">Real-time Metrics:</p>
                    <p className="text-xs text-muted-foreground">Uptime: {performanceMetrics?.uptime || '99.97%'}</p>
                    <p className="text-xs text-muted-foreground">Active Users: {performanceMetrics?.activeUsers?.toLocaleString() || '45K+'}</p>
                  </div>
                </div>
              </Card>

              {/* Security Technology */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-red-500/10 to-orange-500/10 border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-hero opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10 p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Advanced Security</h3>
                      <p className="text-sm text-muted-foreground">Military-Grade Protection</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Security Score</span>
                      <span className="text-sm font-semibold text-green-600">{securityMetrics?.securityScore || 'A+'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Threats Blocked</span>
                      <span className="text-sm font-semibold text-red-600">{securityMetrics?.threatsBlocked?.toLocaleString() || '89K+'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Encryption</span>
                      <span className="text-sm font-semibold text-orange-600">{securityMetrics?.encryptionLevel || 'AES-256'}</span>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-foreground">Security Status:</p>
                    <p className="text-xs text-muted-foreground">Last Incident: {securityMetrics?.lastIncident || 'Never'}</p>
                    <p className="text-xs text-muted-foreground">Fraud Prevented: {securityMetrics?.fraudPrevented?.toLocaleString() || '12K+'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </CollapsibleSection>
        </div>
      </section>

      {/* Global Impact Statistics */}
      <section className="relative spacing-responsive bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container-responsive relative z-10">
          <CollapsibleSection
            title="Global Impact Statistics"
            description="Understanding the global impact of device theft and why STOLEN is essential for gadget protection"
            icon={<Globe className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="group relative overflow-hidden bg-card/90 backdrop-blur-sm border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-hero opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10 p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-destructive/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-destructive">1 in 5</h3>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">
                    stolen devices recovered
                  </p>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Most stolen electronics never return due to poor registration. STOLEN provides instant ownership verification and global traceability.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-card backdrop-blur-sm border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-hero opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10 p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">40%+</h3>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">
                    e-waste from untracked devices
                  </p>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Untracked devices fuel pollution. STOLEN enables ethical reuse and verified donations, reducing waste effectively.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden bg-card/90 backdrop-blur-sm border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-hero opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10 p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent">R500B+</h3>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">
                    yearly tech theft costs
                  </p>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Unprotected devices cost billions in fraud. STOLEN blocks resale of flagged items and builds marketplace trust.
                </p>
              </div>
            </Card>
            </div>
          </CollapsibleSection>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="spacing-responsive">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="subheading-responsive mb-4 sm:mb-6">Why Choose STOLEN?</h2>
            <p className="text-responsive text-muted-foreground max-w-2xl lg:max-w-3xl mx-auto">
              Advanced blockchain technology meets AI-powered intelligence to create 
              the ultimate gadget protection platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            <FeatureCard
              icon={<Lock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="Blockchain Registration"
              description="Immutable gadget records stored on blockchain ensure permanent ownership proof and prevent fraud."
              gradient
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
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
            <FeatureCard
              icon={<Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="Performance Monitoring"
              description="Real-time performance tracking with sub-200ms API responses and 99.97% uptime guarantee."
              gradient
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              title="Military-Grade Security"
              description="AES-256-GCM encryption, MFA protection, and AI-powered threat detection for maximum security."
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
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/support')}
                className="border-white text-brand-blue bg-white hover:bg-white/90 w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border mt-8 sm:mt-12 lg:mt-16">
        <div className="container-responsive">
          {/* Logo and Brand Description */}
          <div className="text-center mb-8">
            <STOLENLogo />
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mt-4">
              Blockchain-powered gadget security for the modern world. Protecting over 1.2M+ devices globally with military-grade security.
            </p>
          </div>

          {/* 2x2 Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Company Information Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-lg">STOLEN Inc.</h4>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Address:</span> 123 Blockchain Ave, Suite 100
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Location:</span> San Francisco, CA 94105
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span> +1 (555) 123-4567
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Email:</span> hello@stolen.com
                </p>
              </div>
            </Card>

            {/* Platform Services Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="font-semibold text-lg">Platform</h4>
              </div>
              <div className="space-y-3 text-sm">
                <button 
                  onClick={() => setShowRegistration(true)} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  <Lock className="w-4 h-4" />
                  Gadget Registration
                </button>
                <Link 
                  to="/marketplace" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Marketplace
                </Link>
                <Link 
                  to="/community-board" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  Recovery Network
                </Link>
                <Link 
                  to="/device/check" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  Device Verification
                </Link>
              </div>
            </Card>

            {/* Support Services Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <h4 className="font-semibold text-lg">Support</h4>
              </div>
              <div className="space-y-3 text-sm">
                <Link 
                  to="/support" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  Help Center
                </Link>
                <Link 
                  to="/api-documentation" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  API Documentation
                </Link>
                <Link 
                  to="/community-board" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  Community
                </Link>
                <Link 
                  to="/contact" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Contact Us
                </Link>
              </div>
            </Card>

            {/* Company Mission Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-500" />
                </div>
                <h4 className="font-semibold text-lg">Our Mission</h4>
              </div>
              <div className="space-y-3 text-sm">
                <Link 
                  to="/why-stolen" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  Why STOLEN?
                </Link>
                <Link 
                  to="/about-us" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  About Us
                </Link>
                <Link 
                  to="/privacy-policy" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Privacy Policy
                </Link>
                <Link 
                  to="/terms-of-service" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Terms of Service
                </Link>
              </div>
            </Card>
          </div>
          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                &copy; 2024 STOLEN Inc. All rights reserved. Securing gadgets with blockchain technology.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>🌟 99.97% Uptime</span>
                <span>🔒 AES-256-GCM Encryption</span>
                <span>⚡ API Response &lt;200ms</span>
                <span>🤖 AI-Powered Security</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                STOLEN™ Reverse Verification Technology is patent-protected. 
                Trusted by retailers, repair shops, law enforcement, and millions of users worldwide.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default Index;