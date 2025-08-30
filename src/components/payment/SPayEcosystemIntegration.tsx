import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  Shield, 
  Gift, 
  CreditCard, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  Smartphone,
  Car,
  Laptop,
  Watch
} from "lucide-react";
import { Link } from "react-router-dom";

interface EcosystemIntegrationProps {
  className?: string;
}

const SPayEcosystemIntegration: React.FC<EcosystemIntegrationProps> = ({ className }) => {
  const stakeholders = [
    {
      id: "users",
      name: "Individual Users",
      icon: <Users className="w-6 h-6" />,
      description: "Device owners, buyers, and sellers",
      features: [
        "Secure wallet for transactions",
        "Escrow protection for purchases",
        "Reward collection for recoveries",
        "Withdrawal to bank accounts"
      ],
      stats: {
        total: "50,000+",
        active: "85%",
        volume: "$2.5M"
      }
    },
    {
      id: "retailers",
      name: "Retail Partners",
      icon: <Building2 className="w-6 h-6" />,
      description: "Electronics stores and authorized dealers",
      features: [
        "Commission payments for referrals",
        "Device verification rewards",
        "Inventory purchase financing",
        "Customer loyalty programs"
      ],
      stats: {
        total: "500+",
        active: "92%",
        volume: "$1.8M"
      }
    },
    {
      id: "insurance",
      name: "Insurance Companies",
      icon: <Shield className="w-6 h-6" />,
      description: "Device insurance providers",
      features: [
        "Claim processing payments",
        "Recovery reward distribution",
        "Fraud prevention integration",
        "Risk assessment data"
      ],
      stats: {
        total: "25+",
        active: "100%",
        volume: "$3.2M"
      }
    },
    {
      id: "law-enforcement",
      name: "Law Enforcement",
      icon: <Shield className="w-6 h-6" />,
      description: "Police departments and agencies",
      features: [
        "Evidence reward payments",
        "Recovery incentive programs",
        "Anonymous tip rewards",
        "Community partnership funds"
      ],
      stats: {
        total: "200+",
        active: "78%",
        volume: "$500K"
      }
    },
    {
      id: "ngos",
      name: "NGOs & Charities",
      icon: <Gift className="w-6 h-6" />,
      description: "Non-profit organizations",
      features: [
        "Donation processing",
        "Fundraising campaigns",
        "Community program funding",
        "Transparent financial reporting"
      ],
      stats: {
        total: "50+",
        active: "88%",
        volume: "$200K"
      }
    },
    {
      id: "marketplace",
      name: "Marketplace Sellers",
      icon: <CreditCard className="w-6 h-6" />,
      description: "Device marketplace participants",
      features: [
        "Escrow payment protection",
        "Automatic seller payouts",
        "Dispute resolution support",
        "Transaction fee management"
      ],
      stats: {
        total: "10,000+",
        active: "91%",
        volume: "$4.1M"
      }
    }
  ];

  const deviceTypes = [
    { name: "Smartphones", icon: <Smartphone className="w-5 h-5" />, count: "25,000+" },
    { name: "Laptops", icon: <Laptop className="w-5 h-5" />, count: "8,500+" },
    { name: "Tablets", icon: <Smartphone className="w-5 h-5" />, count: "5,200+" },
    { name: "Smartwatches", icon: <Watch className="w-5 h-5" />, count: "3,800+" },
    { name: "Vehicles", icon: <Car className="w-5 h-5" />, count: "1,200+" }
  ];

  const ecosystemStats = {
    totalTransactions: "$12.3M",
    totalUsers: "50,000+",
    recoveryRate: "78%",
    averageReward: "$85",
    totalPartners: "775+",
    monthlyVolume: "$1.2M"
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Ecosystem Overview */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">S-Pay Ecosystem Integration</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          S-Pay serves as the financial backbone connecting all stakeholders in the STOLEN ecosystem, 
          enabling secure transactions, rewards, and payments across the entire device security network.
        </p>
      </div>

      {/* Ecosystem Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ecosystem Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{ecosystemStats.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{ecosystemStats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{ecosystemStats.recoveryRate}</div>
              <div className="text-sm text-muted-foreground">Recovery Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{ecosystemStats.averageReward}</div>
              <div className="text-sm text-muted-foreground">Avg. Reward</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{ecosystemStats.totalPartners}</div>
              <div className="text-sm text-muted-foreground">Partners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{ecosystemStats.monthlyVolume}</div>
              <div className="text-sm text-muted-foreground">Monthly Volume</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Integration */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">Stakeholder Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stakeholders.map((stakeholder) => (
            <Card key={stakeholder.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {stakeholder.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{stakeholder.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {stakeholder.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-sm font-semibold">{stakeholder.stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-green-600">{stakeholder.stats.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{stakeholder.stats.volume}</div>
                    <div className="text-xs text-muted-foreground">Volume</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Device Type Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Type Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {deviceTypes.map((device) => (
              <div key={device.name} className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
                  {device.icon}
                </div>
                <div className="font-medium">{device.name}</div>
                <div className="text-sm text-muted-foreground">{device.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Reduced transaction costs by 60%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Faster payment processing (real-time)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Transparent fee structure</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Automated escrow protection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Multi-currency support</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Fraud detection & prevention</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">KYC/AML compliance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Audit trail for all transactions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Dispute resolution system</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Join the S-Pay Ecosystem</h3>
          <p className="text-lg mb-6 opacity-90">
            Experience seamless payments, secure transactions, and comprehensive financial services 
            across the entire STOLEN platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/wallet">
                <DollarSign className="w-4 h-4 mr-2" />
                Access Your Wallet
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary" asChild>
              <Link to="/marketplace">
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore Marketplace
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SPayEcosystemIntegration;
