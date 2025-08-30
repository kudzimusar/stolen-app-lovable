import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STOLENLogo } from "@/components/STOLENLogo";
import { BackButton } from "@/components/BackButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Shield, 
  TrendingUp, 
  Smartphone, 
  AlertTriangle,
  DollarSign,
  Globe,
  Users,
  CheckCircle,
  ArrowRight,
  Eye,
  Heart,
  Zap,
  Lock,
  FileText,
  MapPin,
  Building2
} from "lucide-react";

const WhyStolen = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const globalStats = [
    {
      icon: Smartphone,
      stat: "Less than 10%",
      description: "of stolen mobile phones are recovered worldwide",
      source: "GSMA Intelligence, Interpol, & regional police reports"
    },
    {
      icon: TrendingUp,
      stat: "70 million+",
      description: "smartphones are stolen each year globally, with only 7–10% returned to owners",
      source: "Kensington, a computer security company"
    },
    {
      icon: AlertTriangle,
      stat: "1 in 10",
      description: "smartphone users in the U.S. has had a phone stolen at some point",
      source: "Consumer Reports"
    },
    {
      icon: MapPin,
      stat: "#1 Theft Type",
      description: "on public transportation in major cities (London, Tokyo, New York)",
      source: "Transport for London, MTA NYC, Tokyo Metro"
    }
  ];

  const fraudStats = [
    {
      icon: DollarSign,
      stat: "10-15%",
      description: "of all mobile-related claims are fraudulent",
      source: "Coalition Against Insurance Fraud"
    },
    {
      icon: AlertTriangle,
      stat: "Up to 25%",
      description: "fraudulent claims for high-end electronics with insurers",
      source: "Insurance Information Institute (III)"
    },
    {
      icon: TrendingUp,
      stat: "20-40%",
      description: "reduction in resale values due to lack of reliable device history",
      source: "GSMA Mobile Device Certification Forum"
    }
  ];

  const marketplaceStats = [
    {
      icon: Globe,
      stat: "1.5 billion",
      description: "used phones will be in circulation by 2026, yet fraud and trust issues hinder safe trade",
      source: "IDC, Statista"
    },
    {
      icon: Users,
      stat: "60%",
      description: "of users would register their device if a universal, tamper-proof registry existed",
      source: "GSMA survey (2022)"
    },
    {
      icon: Building2,
      stat: "Millions Lost",
      description: "yearly by retailers due to stolen inventory entering second-hand markets untraceable",
      source: "Retail Industry Leaders Association (RILA)"
    }
  ];

  const socialImpactStats = [
    {
      icon: Globe,
      stat: "Global South",
      description: "Africa, Southeast Asia, and South America are the fastest-growing markets for used electronics—and also the most impacted by counterfeit, stolen, and untraceable devices",
      source: "World Bank, GSMA Mobile Economy Report"
    },
    {
      icon: Heart,
      stat: "Over 40%",
      description: "of devices donated to NGOs are lost, resold, or never verified as delivered",
      source: "OECD, TechForGood audit reports"
    },
    {
      icon: Shield,
      stat: "Only 5%",
      description: "of global governments have access to a shared database to verify stolen phones and ownership",
      source: "Interpol & ITU Report (2023)"
    }
  ];

  const solutions = [
    "Prevents fraud through blockchain-secured registration",
    "Reduces insurance fraud via AI-powered validation and tamper-proof records",
    "Improves recovery chances by enabling real-time lost-and-found reporting",
    "Restores market trust with Clean Report Badges, repair logs, and verified resale data",
    "Incentivizes recovery via community rewards and partnerships with NGOs, insurers, and governments"
  ];

  const reasons = [
    {
      icon: Shield,
      title: "Stop Gadget Theft at the Source",
      description: "Registering your device makes it traceable. Thieves avoid registered gadgets due to traceability."
    },
    {
      icon: TrendingUp,
      title: "Sell or Donate with Confidence",
      description: "Listings with STOLEN Clean Report Badges sell faster and earn more. Donors can issue blockchain-verified transfer records."
    },
    {
      icon: FileText,
      title: "Instant Ownership Proof",
      description: "Useful during travel, insurance claims, disputes, or resale. Blockchain-anchored ownership = zero forgery."
    },
    {
      icon: Zap,
      title: "Verified Repair Logs",
      description: "Add value with official repair history. See what work was done and by who."
    },
    {
      icon: MapPin,
      title: "Lost & Found Recovery Tools",
      description: "Activate geofencing alerts. Crowdsource help and earn rewards for returning devices."
    },
    {
      icon: Users,
      title: "Community-Driven Safety",
      description: "Anonymous tips and verified sightings. Build a global registry backed by real people."
    },
    {
      icon: Building2,
      title: "Insurance Integration",
      description: "Linked device = discounts and smoother claim processing. Fraud is reduced, benefits go to honest users."
    },
    {
      icon: Globe,
      title: "Multi-Role Support",
      description: "NGOs, police, insurers, and retailers have role-based dashboards. Collaborate to improve recoveries, recycling, and resale trust."
    }
  ];

  const StatCard = ({ icon: Icon, stat, description, source }: any) => (
    <Card className="bg-card/80 backdrop-blur-sm border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-primary">{stat}</div>
            <p className="text-sm text-foreground leading-relaxed">{description}</p>
            <p className="text-xs text-muted-foreground italic">Source: {source}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ReasonCard = ({ icon: Icon, title, description }: any) => (
    <Card className="bg-card/80 backdrop-blur-sm border-0 hover:shadow-card transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Custom Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-responsive flex h-16 items-center justify-between">
          {/* Left side - Back button (desktop only) */}
          <div className="flex items-center">
            {!isMobile && (
              <BackButton className="mr-4" />
            )}
          </div>
          
          {/* Center - Logo linking to landing page */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <STOLENLogo />
            </Link>
          </div>
          
          {/* Right side - Empty space for balance */}
          <div className="w-12"></div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="section-spacing bg-gradient-hero text-white relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container-responsive relative z-10 text-center">
          <h1 className="heading-hero mb-6">
            The World of Untracked Devices: Why We Must Change
          </h1>
          <p className="subheading-responsive mb-8 max-w-4xl mx-auto">
            With the rise in theft, untraceable sales, and fake listings, a new solution is needed
          </p>
          <div className="prose-responsive max-w-5xl mx-auto">
            <p className="text-lg leading-relaxed">
              The STOLEN App is built to bring transparency, security, and trust into the world of electronics ownership and resale. 
              With the rise in theft, untraceable sales, and fake listings, STOLEN offers a new ecosystem powered by blockchain, 
              AI, and community verification.
            </p>
          </div>
        </div>
      </section>

      {/* Global Device Theft Statistics */}
      <section className="section-spacing bg-background">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">A Global Epidemic: Device Theft By the Numbers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The scale of device theft worldwide reveals an urgent need for systematic change
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalStats.map((item, index) => (
              <StatCard key={index} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Insurance, Fraud, and Recovery Challenges */}
      <section className="section-spacing bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">The Hidden Costs of Device Fraud</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Financial and trust-related problems plague the current system
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fraudStats.map((item, index) => (
              <StatCard key={index} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace and Ecosystem Needs */}
      <section className="section-spacing bg-background">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">Restoring Trust to the Second-Hand Economy</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The growing second-hand market needs reliable verification systems
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketplaceStats.map((item, index) => (
              <StatCard key={index} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Social Impact and Global South Dynamics */}
      <section className="section-spacing bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">Beyond the Numbers: The Human and Social Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The worldwide problem affects communities and economies globally
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialImpactStats.map((item, index) => (
              <StatCard key={index} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* STOLEN's Solutions */}
      <section className="section-spacing bg-background">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">💡 How STOLEN App Addresses This:</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive approach tackles each of these critical issues
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-4">
              {solutions.map((solution, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-card/80 backdrop-blur-sm rounded-lg border-0">
                  <CheckCircle className="w-5 h-5 text-verified flex-shrink-0" />
                  <p className="text-foreground">{solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Reasons to Register */}
      <section className="section-spacing bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">Detailed Reasons to Register</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the comprehensive benefits of joining the STOLEN ecosystem
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, index) => (
              <ReasonCard key={index} {...reason} />
            ))}
          </div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="section-spacing bg-gradient-hero text-white relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container-responsive relative z-10 text-center">
          <h2 className="heading-section mb-6">Ready to Join the Movement?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Be part of the solution. Help create a world where device theft becomes obsolete and trust is restored to the electronics ecosystem.
          </p>
          <Button 
            size="xl" 
            variant="secondary"
            onClick={() => navigate('/device/register')}
            className="bg-white text-primary hover:bg-white/90 shadow-glow"
          >
            Register Your Device Now – It's Free and Forever
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default WhyStolen;