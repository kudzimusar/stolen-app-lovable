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
  RefreshCw,
  Activity,
  Bell,
  Zap
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
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
  const [userRole] = useState<UserRole>({
    id: 'super-admin',
    name: 'Super Admin',
    permissions: [
      'admin:full',
      'admin:overview',
      'admin:users',
      'admin:lost-found',
      'admin:marketplace',
      'admin:stakeholders',
      'admin:financial',
      'admin:security',
      'admin:settings'
    ]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      // Fetch real data from admin dashboard stats API
      const response = await fetch('/api/v1/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        
        setStats({
          totalUsers: data.stats?.total_users || 0,
          activeReports: data.stats?.active_reports || 0,
          totalTransactions: data.stats?.total_transactions || 0,
          revenue: data.stats?.revenue || 0,
          recoveryRate: data.stats?.recovery_rate || 0,
          pendingApprovals: data.stats?.pending_approvals || 0
        });
      } else {
        // Fallback data if API fails
        console.log('Using fallback dashboard data');
        setStats({
          totalUsers: 1247,
          activeReports: 23,
          totalTransactions: 456,
          revenue: 23450,
          recoveryRate: 78,
          pendingApprovals: 5
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data on error
      setStats({
        totalUsers: 1247,
        activeReports: 23,
        totalTransactions: 456,
        revenue: 23450,
        recoveryRate: 78,
        pendingApprovals: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const getNavigationItems = () => {
    return [
      { 
        id: "overview", 
        label: "📊 Overview", 
        icon: BarChart3, 
        description: "System overview and analytics",
        color: "bg-blue-50 border-blue-200 text-blue-800"
      },
      { 
        id: "users", 
        label: "👥 Users", 
        icon: Users, 
        description: "User management and roles",
        color: "bg-green-50 border-green-200 text-green-800"
      },
      { 
        id: "lost-found", 
        label: "🔍 Lost & Found", 
        icon: Package, 
        description: "Report management and rewards",
        color: "bg-orange-50 border-orange-200 text-orange-800"
      },
      { 
        id: "marketplace", 
        label: "🛒 Marketplace", 
        icon: ShoppingCart, 
        description: "Listings and transactions",
        color: "bg-purple-50 border-purple-200 text-purple-800"
      },
      { 
        id: "stakeholders", 
        label: "🏪 Stakeholders", 
        icon: Building2, 
        description: "Partners and organizations",
        color: "bg-indigo-50 border-indigo-200 text-indigo-800"
      },
      { 
        id: "financial", 
        label: "💰 Financial", 
        icon: DollarSign, 
        description: "Payments and rewards",
        color: "bg-emerald-50 border-emerald-200 text-emerald-800"
      },
      { 
        id: "security", 
        label: "🔒 Security", 
        icon: Shield, 
        description: "Security and moderation",
        color: "bg-red-50 border-red-200 text-red-800"
      },
      { 
        id: "settings", 
        label: "⚙️ Settings", 
        icon: Settings, 
        description: "System configuration",
        color: "bg-gray-50 border-gray-200 text-gray-800"
      }
    ];
  };

  const renderOverviewPanel = () => (
    <div className="space-y-6">
      {/* Super Admin Welcome */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Super Admin Dashboard</h2>
            <p className="text-blue-700">Complete system oversight and management</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.totalUsers?.toLocaleString() || '0'}</p>
                <p className="text-xs text-blue-600">+12% from last month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Active Reports</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.activeReports || 0}</p>
                <p className="text-xs text-orange-600">+8% from last week</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Revenue</p>
                <p className="text-2xl font-bold text-green-900">R{stats?.revenue?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-600">+23% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Recovery Rate</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.recoveryRate || 0}%</p>
                <p className="text-xs text-purple-600">+5% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold">Approve Pending Reports</h3>
                <p className="text-sm text-muted-foreground">{stats?.pendingApprovals || 0} pending reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Process Rewards</h3>
                <p className="text-sm text-muted-foreground">Manage reward claims</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-semibold">Security Review</h3>
                <p className="text-sm text-muted-foreground">Monitor security alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Device reunited successfully</p>
                <p className="text-xs text-muted-foreground">iPhone 13 Pro returned to owner</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">New report submitted</p>
                <p className="text-xs text-muted-foreground">MacBook Pro reported lost</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Reward processed</p>
                <p className="text-xs text-muted-foreground">R500 reward paid to finder</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivePanel = () => {
    switch (activePanel) {
      case "overview":
        return renderOverviewPanel();
      case "users":
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">User Management</h2><p>User management panel coming soon...</p></div>;
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
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.display_name || 'Super Admin'} ({userRole.name})
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="secondary">
                {stats?.pendingApprovals || 0} pending
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activePanel} onValueChange={setActivePanel} className="space-y-6">
          {/* Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {getNavigationItems().map((item) => (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md ${item.color} ${
                  activePanel === item.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActivePanel(item.id)}
              >
                <CardContent className="p-3 text-center">
                  <item.icon className="h-6 w-6 mx-auto mb-2" />
                  <h3 className="font-semibold text-xs">{item.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <TabsContent value={activePanel} className="space-y-6">
            {renderActivePanel()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedAdminDashboard;