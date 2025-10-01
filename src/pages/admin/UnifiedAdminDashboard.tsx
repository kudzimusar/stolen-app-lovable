import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  Building2, 
  DollarSign, 
  Shield, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

// Import feature panels
import LostFoundPanel from "./panels/LostFoundPanel";
import MarketplacePanel from "./panels/MarketplacePanel";
import StakeholderPanel from "./panels/StakeholderPanel";
import FinancialPanel from "./panels/FinancialPanel";
import SecurityPanel from "./panels/SecurityPanel";
import SystemSettingsPanel from "./panels/SystemSettingsPanel";

interface AdminStats {
  totalUsers: number;
  activeReports: number;
  totalTransactions: number;
  revenue: number;
  recoveryRate: number;
  pendingApprovals: number;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

const UnifiedAdminDashboard = () => {
  const { user, getAuthToken } = useAuth();
  const [activePanel, setActivePanel] = useState("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeReports: 0,
    totalTransactions: 0,
    revenue: 0,
    recoveryRate: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchUserRole();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      // Fetch overview stats
      const response = await fetch('/api/v1/admin/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data || {
          totalUsers: 0,
          activeReports: 0,
          totalTransactions: 0,
          revenue: 0,
          recoveryRate: 0,
          pendingApprovals: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/v1/admin/user-role', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUserRole(result.data);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const hasPermission = (permission: string) => {
    if (!userRole) return false;
    return userRole.permissions.includes(permission) || userRole.permissions.includes('admin:full');
  };

  const getNavigationItems = () => {
    const items = [
      { id: "overview", label: "Overview & Analytics", icon: BarChart3, permission: "admin:overview" },
      { id: "users", label: "User Management", icon: Users, permission: "admin:users" },
      { id: "lost-found", label: "Lost & Found", icon: Package, permission: "admin:lost-found" },
      { id: "marketplace", label: "Marketplace", icon: ShoppingCart, permission: "admin:marketplace" },
      { id: "stakeholders", label: "Stakeholder Management", icon: Building2, permission: "admin:stakeholders" },
      { id: "financial", label: "Financial Management", icon: DollarSign, permission: "admin:financial" },
      { id: "security", label: "Security & Moderation", icon: Shield, permission: "admin:security" },
      { id: "settings", label: "System Settings", icon: Settings, permission: "admin:settings" }
    ];

    return items.filter(item => hasPermission(item.permission));
  };

  const renderOverviewPanel = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReports}</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recoveryRate}%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hasPermission("admin:lost-found") && (
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActivePanel("lost-found")}>
                <Package className="h-6 w-6" />
                <span>Lost & Found</span>
              </Button>
            )}
            {hasPermission("admin:marketplace") && (
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActivePanel("marketplace")}>
                <ShoppingCart className="h-6 w-6" />
                <span>Marketplace</span>
              </Button>
            )}
            {hasPermission("admin:stakeholders") && (
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActivePanel("stakeholders")}>
                <Building2 className="h-6 w-6" />
                <span>Stakeholders</span>
              </Button>
            )}
            {hasPermission("admin:financial") && (
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActivePanel("financial")}>
                <DollarSign className="h-6 w-6" />
                <span>Financial</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Device successfully reunited</p>
                <p className="text-sm text-muted-foreground">iPhone 14 Pro returned to owner</p>
              </div>
              <Badge variant="secondary">2 minutes ago</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Suspicious activity detected</p>
                <p className="text-sm text-muted-foreground">Multiple failed login attempts</p>
              </div>
              <Badge variant="secondary">5 minutes ago</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">New marketplace listing</p>
                <p className="text-sm text-muted-foreground">Samsung Galaxy S23 listed for sale</p>
              </div>
              <Badge variant="secondary">10 minutes ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivePanel = () => {
    switch (activePanel) {
      case "lost-found":
        return <LostFoundPanel />;
      case "marketplace":
        return <MarketplacePanel />;
      case "stakeholders":
        return <StakeholderPanel />;
      case "financial":
        return <FinancialPanel />;
      case "security":
        return <SecurityPanel />;
      case "settings":
        return <SystemSettingsPanel />;
      default:
        return renderOverviewPanel();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.display_name || user?.email}
                {userRole && <span className="ml-2 text-sm">({userRole.name})</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="secondary">
                {stats.pendingApprovals} pending
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activePanel} onValueChange={setActivePanel} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            {getNavigationItems().map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activePanel} className="space-y-6">
            {renderActivePanel()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedAdminDashboard;
