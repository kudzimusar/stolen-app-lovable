import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/AppHeader";
import { LiveChatWidget } from "@/components/ui/LiveChatWidget";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Plus,
  Search,
  AlertTriangle,
  Wrench,
  Wallet,
  ShoppingCart,
  Bell,
  Settings,
  Shield,
  MapPin,
  Calendar,
  Award,
  Users,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  HeartHandshake,
  QrCode,
  Zap,
  Brain,
  Target,
  Activity,
  Cpu,
  Database,
  Network,
  Code,
  Globe,
  Lock,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  CheckSquare,
  XCircle,
  Eye,
  Clock,
  Star,
  Heart,
  Gift,
  ArrowUpDown
} from "lucide-react";

const Dashboard = () => {
  const devices = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      serial: "ABC123DEF456",
      status: "verified",
      registeredDate: "2024-01-15",
      location: "Cape Town, WC",
      // Enhanced metrics
      performance: {
        loadingTime: 0.8,
        verificationSpeed: 0.6,
        trustScore: 94.2,
        lastVerified: "2 hours ago"
      },
      reverseVerification: {
        integrated: true,
        lastCheck: "1 hour ago",
        fraudScore: 8,
        marketplaceAlerts: 0
      },
      // Phase 5 Production Metrics
      productionMetrics: {
        deploymentStatus: "live",
        uptime: 99.9,
        lastDeployment: "2024-01-25 14:30:00",
        version: "v2.1.0",
        environment: "production",
        monitoring: "active",
        alerts: 0,
        performance: "excellent"
      }
    },
    {
      id: 2,
      name: "MacBook Pro M3",
      serial: "XYZ789GHI012",
      status: "needs-attention",
      registeredDate: "2024-02-20",
      location: "Johannesburg, GP",
      // Enhanced metrics
      performance: {
        loadingTime: 1.2,
        verificationSpeed: 0.9,
        trustScore: 87.5,
        lastVerified: "1 day ago"
      },
      reverseVerification: {
        integrated: true,
        lastCheck: "2 days ago",
        fraudScore: 23,
        marketplaceAlerts: 1
      }
    }
  ];

  const quickActions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: "Register Device",
      href: "/device/register",
      variant: "hero" as const
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Hot Deals",
      href: "/hot-deals-hub",
      variant: "premium" as const
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Report Lost",
      href: "/lost-found-report",
      variant: "destructive" as const
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: "Check Device",
      href: "/device/check",
      variant: "outline" as const
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      label: "Transfer Device",
      href: "/device-transfer",
      variant: "outline" as const
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Lost & Found",
      href: "/community-board",
      variant: "outline" as const
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      label: "Repair Logs",
      href: "/user/repair-history",
      variant: "outline" as const
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      label: "S-Pay Wallet",
      href: "/wallet",
      variant: "secure" as const
    },
    // Phase 5 Production Features
    {
      icon: <Certificate className="w-5 h-5" />,
      label: "Production Status",
      href: "/production-status",
      variant: "outline" as const
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: "System Health",
      href: "/system-health",
      variant: "outline" as const
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: "End-to-End Tests",
      href: "/e2e-tests",
      variant: "outline" as const
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: "Quality Assurance",
      href: "/qa-dashboard",
      variant: "outline" as const
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: "Marketplace",
      href: "/marketplace",
      variant: "outline" as const
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: "My Devices",
      href: "/my-devices",
      variant: "outline" as const
    },
    {
      icon: <ArrowUpDown className="w-5 h-5" />,
      label: "AI Transfer Suggestions",
      href: "/ai-transfer-suggestions",
      variant: "outline" as const
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <TrustBadge type="secure" text="Verified" />;
      case "stolen":
        return <Badge variant="destructive">Stolen</Badge>;
      case "needs-attention":
        return <Badge variant="secondary">Needs Attention</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Dashboard" showLogo={true} />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Manage your registered devices and stay protected with STOLEN.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{devices.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Devices Protected</div>
          </Card>
          <Link to="/device-transfer">
            <Card className="p-4 md:p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-xl md:text-2xl font-bold text-primary">3</div>
              <div className="text-xs md:text-sm text-muted-foreground">Devices Transferred</div>
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground mt-1 mx-auto" />
            </Card>
          </Link>
          <Link to="/device-warranty-status">
            <Card className="p-4 md:p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-xl md:text-2xl font-bold text-success">2</div>
              <div className="text-xs md:text-sm text-muted-foreground">Active Warranties</div>
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground mt-1 mx-auto" />
            </Card>
          </Link>
          <Link to="/community-board">
            <Card className="p-4 md:p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-xl md:text-2xl font-bold text-primary">
                <div className="flex items-center justify-center gap-1">
                  <HeartHandshake className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Check</span>
                </div>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Lost & Found</div>
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground mt-1 mx-auto" />
            </Card>
          </Link>
          <Link to="/stolen-reports">
            <Card className="p-4 md:p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-xl md:text-2xl font-bold text-destructive">1</div>
              <div className="text-xs md:text-sm text-muted-foreground">Devices Reported Lost</div>
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground mt-1 mx-auto" />
            </Card>
          </Link>
          <Link to="/community-rewards">
            <Card className="p-4 md:p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-xl md:text-2xl font-bold text-primary">7</div>
              <div className="text-xs md:text-sm text-muted-foreground">Community Engagements</div>
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground mt-1 mx-auto" />
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {quickActions.slice(0, 8).map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-16 md:h-20 flex-col gap-2 text-xs md:text-sm"
                asChild
              >
                <Link to={action.href}>
                  {action.icon}
                  <span className="text-xs">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* QR Scanner Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Device Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-16 md:h-20 flex items-center justify-center gap-3"
              asChild
            >
              <Link to="/device/check">
                <QrCode className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">QR Code Scanner</div>
                  <div className="text-xs text-muted-foreground">Quickly verify any device</div>
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-16 md:h-20 flex items-center justify-center gap-3"
              asChild
            >
              <Link to="/reverse-verify">
                <Search className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Reverse Lookup</div>
                  <div className="text-xs text-muted-foreground">Search by serial number</div>
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Registered Devices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Devices</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/device/register">
                <Plus className="w-4 h-4" />
                Add Device
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {devices.map((device) => (
              <Card key={device.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{device.name}</h3>
                      {getStatusBadge(device.status)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{device.serial}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Registered {device.registeredDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {device.location}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/device/${device.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Award className="w-5 h-5 text-success" />
                <div>
                  <div className="font-medium">Device Verification Complete</div>
                  <div className="text-sm text-muted-foreground">
                    iPhone 15 Pro successfully verified on blockchain
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">Security Scan Complete</div>
                  <div className="text-sm text-muted-foreground">
                    All devices passed security verification
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-0"></div>
      
      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default Dashboard;