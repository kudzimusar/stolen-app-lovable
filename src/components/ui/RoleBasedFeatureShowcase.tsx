import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building, 
  Wrench, 
  Gavel, 
  FileText, 
  Heart, 
  Shield, 
  CreditCard,
  CheckCircle,
  Lock,
  Eye,
  Star,
  Zap,
  Brain,
  Database,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";

interface RoleFeature {
  name: string;
  description: string;
  icon: React.ReactNode;
  access: "full" | "limited" | "view" | "none";
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: RoleFeature[];
  dashboardPath: string;
}

const RoleBasedFeatureShowcase: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const userRoles: UserRole[] = [
    {
      id: "individual",
      name: "Individual Users",
      description: "Personal device protection and marketplace participation",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      dashboardPath: "/dashboard",
      features: [
        {
          name: "Device Registration",
          description: "Register and manage personal devices",
          icon: <Database className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Marketplace Trading",
          description: "Buy and sell devices with escrow protection",
          icon: <Activity className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "AI Transfer Suggestions",
          description: "AI-powered device recommendations",
          icon: <Brain className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Wallet Management",
          description: "S-Pay wallet with secure transactions",
          icon: <CreditCard className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Insurance Claims",
          description: "File and track insurance claims",
          icon: <FileText className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Community Rewards",
          description: "Earn rewards for helping others",
          icon: <Star className="w-4 h-4" />,
          access: "full"
        }
      ]
    },
    {
      id: "repair_shop",
      name: "Repair Shops",
      description: "Device repair services and customer management",
      icon: <Wrench className="w-6 h-6" />,
      color: "bg-green-500",
      dashboardPath: "/repair-shop-dashboard",
      features: [
        {
          name: "Repair Management",
          description: "Log and track repair services",
          icon: <Wrench className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Customer Booking",
          description: "Appointment scheduling system",
          icon: <Users className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Inventory Management",
          description: "Parts and inventory tracking",
          icon: <Database className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Fraud Detection",
          description: "AI-powered repair fraud detection",
          icon: <Brain className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Insurance Integration",
          description: "Process insurance claims",
          icon: <FileText className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Business Analytics",
          description: "Repair business insights",
          icon: <TrendingUp className="w-4 h-4" />,
          access: "full"
        }
      ]
    },
    {
      id: "retailer",
      name: "Retailers",
      description: "Device sales and inventory management",
      icon: <Building className="w-6 h-6" />,
      color: "bg-purple-500",
      dashboardPath: "/retailer-dashboard",
      features: [
        {
          name: "Bulk Registration",
          description: "Register devices in bulk",
          icon: <Database className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Inventory Management",
          description: "Track device inventory",
          icon: <Activity className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Certificate Issuance",
          description: "Issue device verification certificates",
          icon: <CheckCircle className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "API Integration",
          description: "Automated registration APIs",
          icon: <Zap className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Sales Analytics",
          description: "Sales reporting and insights",
          icon: <TrendingUp className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Customer Verification",
          description: "KYC and customer verification",
          icon: <Shield className="w-4 h-4" />,
          access: "full"
        }
      ]
    },
    {
      id: "law_enforcement",
      name: "Law Enforcement",
      description: "Device investigation and recovery",
      icon: <Gavel className="w-6 h-6" />,
      color: "bg-red-500",
      dashboardPath: "/law-enforcement-dashboard",
      features: [
        {
          name: "Device Search",
          description: "Advanced device search capabilities",
          icon: <Eye className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Case Management",
          description: "Track investigation cases",
          icon: <FileText className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Evidence Collection",
          description: "Digital evidence management",
          icon: <Database className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Community Alerts",
          description: "Stolen device alerts",
          icon: <Activity className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Crime Analytics",
          description: "Pattern analysis and insights",
          icon: <Brain className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Inter-agency Coordination",
          description: "Multi-agency data sharing",
          icon: <Users className="w-4 h-4" />,
          access: "full"
        }
      ]
    },
    {
      id: "insurance",
      name: "Insurance Companies",
      description: "Claims processing and risk assessment",
      icon: <FileText className="w-6 h-6" />,
      color: "bg-yellow-500",
      dashboardPath: "/insurance-dashboard",
      features: [
        {
          name: "Claims Processing",
          description: "Automated claims processing",
          icon: <FileText className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Risk Assessment",
          description: "AI-powered risk assessment",
          icon: <Brain className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Policy Management",
          description: "Policy administration",
          icon: <Database className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Fraud Detection",
          description: "Claims fraud detection",
          icon: <Shield className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Customer Management",
          description: "Customer policy management",
          icon: <Users className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Insurance Analytics",
          description: "Risk modeling and analysis",
          icon: <TrendingUp className="w-4 h-4" />,
          access: "full"
        }
      ]
    },
    {
      id: "ngo",
      name: "NGO Partners",
      description: "Community programs and impact measurement",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-pink-500",
      dashboardPath: "/ngo-dashboard",
      features: [
        {
          name: "Donation Management",
          description: "Device donation processing",
          icon: <Heart className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Impact Measurement",
          description: "Program effectiveness tracking",
          icon: <TrendingUp className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Community Programs",
          description: "Community outreach programs",
          icon: <Users className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Fundraising Tools",
          description: "Donation and grant management",
          icon: <CreditCard className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Partnership Management",
          description: "Partner organization coordination",
          icon: <Users className="w-4 h-4" />,
          access: "full"
        },
        {
          name: "Transparency Tools",
          description: "Donation transparency",
          icon: <Eye className="w-4 h-4" />,
          access: "full"
        }
      ]
    }
  ];

  const getAccessBadge = (access: string) => {
    switch (access) {
      case "full":
        return <Badge variant="default" className="bg-green-500">Full Access</Badge>;
      case "limited":
        return <Badge variant="secondary" className="bg-yellow-500">Limited Access</Badge>;
      case "view":
        return <Badge variant="outline" className="bg-blue-500">View Only</Badge>;
      case "none":
        return <Badge variant="destructive">No Access</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <section className="spacing-responsive bg-muted/20">
      <div className="container-responsive">
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl">Role-Based Access System</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    STOLEN serves 8 distinct stakeholder types, each with specialized features and access levels. 
                    Our role-based system ensures users have access to the tools they need while maintaining security.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="transition-transform duration-200 hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <CardContent className="pt-0">
              <div className="grid gap-6 sm:gap-8 lg:gap-10">
                {userRoles.map((role) => (
                  <Card key={role.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${role.color}`}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl sm:text-2xl">{role.name}</CardTitle>
                          <p className="text-muted-foreground mt-1">{role.description}</p>
                        </div>
                        <div className="hidden sm:block">
                          <Button asChild variant="outline" size="sm">
                            <Link to={role.dashboardPath}>
                              Access Dashboard
                              <Zap className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {role.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                              {feature.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm truncate">{feature.name}</h4>
                                {getAccessBadge(feature.access)}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Security Features Section */}
              <div className="mt-12 sm:mt-16">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Advanced Security Features</CardTitle>
                        <p className="text-muted-foreground">Enterprise-grade security for all user types</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-sm">Multi-Factor Auth</p>
                          <p className="text-xs text-muted-foreground">SMS, Email, Authenticator</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-semibold text-sm">AI Fraud Detection</p>
                          <p className="text-xs text-muted-foreground">Real-time threat detection</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                        <Database className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-sm">Blockchain Security</p>
                          <p className="text-xs text-muted-foreground">Immutable records</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                        <Activity className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-semibold text-sm">Rate Limiting</p>
                          <p className="text-xs text-muted-foreground">Role-based limits</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-8 sm:mt-12">
                <p className="text-muted-foreground mb-4">
                  Ready to get started? Choose your role and create your account.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link to="/register">
                      <Users className="w-4 h-4 mr-2" />
                      Create Account
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/login">
                      <Lock className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default RoleBasedFeatureShowcase;
