import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { LiveChatWidget } from "@/components/LiveChatWidget";
import { TrustBadge } from "@/components/TrustBadge";
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
  HeartHandshake
} from "lucide-react";

const Dashboard = () => {
  const devices = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      serial: "ABC123DEF456",
      status: "verified",
      registeredDate: "2024-01-15",
      location: "Cape Town, WC"
    },
    {
      id: 2,
      name: "MacBook Pro M3",
      serial: "XYZ789GHI012",
      status: "needs-attention",
      registeredDate: "2024-02-20",
      location: "Johannesburg, GP"
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
      href: "/repair-shop-dashboard",
      variant: "outline" as const
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      label: "S-Pay Wallet",
      href: "/wallet",
      variant: "secure" as const
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{devices.length}</div>
            <div className="text-sm text-muted-foreground">Devices Protected</div>
          </Card>
          <Link to="/device-transfer">
            <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Devices Transferred</div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground mt-1 mx-auto" />
            </Card>
          </Link>
          <Link to="/device-warranty-status">
            <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-success">2</div>
              <div className="text-sm text-muted-foreground">Active Warranties</div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground mt-1 mx-auto" />
            </Card>
          </Link>
          <Link to="/community-board">
            <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-primary">
                <div className="flex items-center justify-center gap-1">
                  <HeartHandshake className="w-5 h-5" />
                  <span>Check</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Lost & Found</div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground mt-1 mx-auto" />
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-20 flex-col gap-2"
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
      
      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default Dashboard;