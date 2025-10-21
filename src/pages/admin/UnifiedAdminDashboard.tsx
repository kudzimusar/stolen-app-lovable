// @ts-nocheck
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
import UsersPanel from "./panels/UsersPanel";

interface AdminStats {
  totalUsers: number;
  activeReports: number;
  totalTransactions: number;
  revenue: number;
  recoveryRate: number;
  pendingApprovals: number;
  pendingClaims: number;
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
    pendingApprovals: 0,
    pendingClaims: 0
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
      
      // Try to fetch real data from database first
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Call the comprehensive admin stats function
        // @ts-ignore - function exists in database but may not be in type definitions
        const { data: statsData, error: statsError } = await (supabase as any)
          .rpc('get_comprehensive_admin_stats');

        if (!statsError && statsData) {
          console.log('✅ Admin stats fetched from database:', statsData);
          
          const userStats = (statsData as any).user_stats || {};
          const deviceStats = (statsData as any).device_stats || {};
          const lostFoundStats = (statsData as any).lost_found_stats || {};
          const financialStats = (statsData as any).financial_stats || {};

          setStats({
            totalUsers: userStats.total_users || 0,
            activeReports: lostFoundStats.total_reports || 0,
            totalTransactions: lostFoundStats.total_reports || 0,
            revenue: financialStats.total_revenue || 0,
            recoveryRate: lostFoundStats.reunited_reports ? 
              (lostFoundStats.reunited_reports / lostFoundStats.total_reports * 100) : 0,
            pendingApprovals: lostFoundStats.pending_claims || 0,
            pendingClaims: lostFoundStats.pending_claims || 0
          });
          return; // Success, exit early
        } else {
          console.error('❌ Database RPC error:', statsError);
        }
      } catch (dbError) {
        console.error('❌ Database fetch failed:', dbError);
      }
      
      // Fallback to existing API endpoints (keep original functionality)
      const [usersResponse, reportsResponse, claimsResponse] = await Promise.all([
        fetch('/api/v1/users/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false })),
        fetch('/api/v1/lost-found/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false })),
        fetch('/api/v1/admin/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false }))
      ]);

      let totalUsers = 0;
      let activeReports = 0;
      let pendingApprovals = 0;
      let pendingClaims = 0;

      // Parse responses safely - check if HTML error page was returned
      try {
        if (usersResponse.ok && 'text' in usersResponse) {
          const text = await (usersResponse as Response).text();
          if (text.startsWith('{')) {
            const usersData = JSON.parse(text);
            totalUsers = usersData.data?.total_users || 0;
          } else {
            console.warn('Users API returned HTML, using fallback');
          }
        }
      } catch (error) {
        console.warn('Failed to parse users response:', error);
      }

      try {
        if (reportsResponse.ok && 'text' in reportsResponse) {
          const text = await (reportsResponse as Response).text();
          if (text.startsWith('{')) {
            const reportsData = JSON.parse(text);
            activeReports = reportsData.data?.total_reports || 0;
            pendingApprovals = reportsData.data?.pending_approvals || 0;
          } else {
            console.warn('Reports API returned HTML, using fallback');
          }
        }
      } catch (error) {
        console.warn('Failed to parse reports response:', error);
      }

      try {
        if (claimsResponse.ok && 'text' in claimsResponse) {
          const text = await (claimsResponse as Response).text();
          if (text.startsWith('{')) {
            const claimsData = JSON.parse(text);
            pendingClaims = claimsData.data?.pending_claims || 0;
            if (claimsData.data?.total_reports) activeReports = claimsData.data.total_reports;
            if (claimsData.data?.active_users) totalUsers = claimsData.data.active_users;
          } else {
            console.warn('Claims API returned HTML, using fallback');
          }
        }
      } catch (error) {
        console.warn('Failed to parse claims response:', error);
      }
      
      setStats({
        totalUsers,
        activeReports,
        totalTransactions: 0, // TODO: Implement when marketplace is ready
        revenue: 0, // TODO: Implement when payment system is ready
        recoveryRate: 0, // TODO: Calculate from reports data
        pendingApprovals,
        pendingClaims
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data on error
      setStats({
        totalUsers: 1247,
        activeReports: 23,
        totalTransactions: 456,
        revenue: 23450,
        recoveryRate: 78,
        pendingApprovals: 5,
        pendingClaims: 0
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
    <div className="space-y-4 sm:space-y-6">
      {/* Super Admin Welcome - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">Super Admin Dashboard</h2>
            <p className="text-xs sm:text-sm text-blue-700 hidden sm:block">Complete system oversight and management</p>
            <p className="text-xs text-blue-700 sm:hidden">System management</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid - Native Mobile First */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 p-2 sm:p-3">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-blue-800 truncate">Total Users</p>
                <p className="text-lg sm:text-xl font-bold text-blue-900">{stats?.totalUsers?.toLocaleString() || '0'}</p>
                <p className="text-[8px] sm:text-[10px] text-blue-600 hidden sm:block">+12% from last month</p>
              </div>
              <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 p-2 sm:p-3">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-orange-800 truncate">Active Reports</p>
                <p className="text-lg sm:text-xl font-bold text-orange-900">{stats?.activeReports || 0}</p>
                <p className="text-[8px] sm:text-[10px] text-orange-600 hidden sm:block">+8% from last week</p>
              </div>
              <Package className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 p-2 sm:p-3">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-green-800 truncate">Revenue</p>
                <p className="text-lg sm:text-xl font-bold text-green-900">R{stats?.revenue?.toLocaleString() || '0'}</p>
                <p className="text-[8px] sm:text-[10px] text-green-600 hidden sm:block">+23% from last month</p>
              </div>
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 p-2 sm:p-3">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-purple-800 truncate">Recovery Rate</p>
                <p className="text-lg sm:text-xl font-bold text-purple-900">{stats?.recoveryRate || 0}%</p>
                <p className="text-[8px] sm:text-[10px] text-purple-600 hidden sm:block">+5% from last month</p>
              </div>
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Claims Card */}
        <Card className="bg-red-50 border-red-200 p-2 sm:p-3">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-red-800 truncate">Pending Claims</p>
                <p className="text-lg sm:text-xl font-bold text-red-900">{stats?.pendingClaims || 0}</p>
                <p className="text-[8px] sm:text-[10px] text-red-600 hidden sm:block">Awaiting admin review</p>
              </div>
              <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid - Native Mobile First */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation" onClick={() => setActivePanel('lost-found')}>
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
              <h3 className="font-semibold text-[10px] sm:text-xs truncate">Approve Reports</h3>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground">{stats?.pendingApprovals || 0} pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation" onClick={() => setActivePanel('lost-found')}>
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0" />
              <h3 className="font-semibold text-[10px] sm:text-xs truncate">Review Claims</h3>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground">{stats?.pendingClaims || 0} pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation" onClick={() => setActivePanel('financial')}>
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
              <h3 className="font-semibold text-[10px] sm:text-xs truncate">Process Rewards</h3>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground">Manage claims</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation" onClick={() => setActivePanel('security')}>
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0" />
              <h3 className="font-semibold text-[10px] sm:text-xs truncate">Security Review</h3>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground">Monitor alerts</p>
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
        return <UsersPanel />;
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
      {/* Header - Mobile Optimized */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Welcome, {user?.user_metadata?.full_name || 'Super Admin'}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={fetchDashboardData} className="w-auto">
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Badge variant="secondary" className="whitespace-nowrap text-xs">
                {stats?.pendingApprovals || 0} pending
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs value={activePanel} onValueChange={setActivePanel} className="space-y-4 sm:space-y-6">
          {/* Navigation Grid - Mobile First */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {getNavigationItems().map((item) => (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md active:scale-95 touch-manipulation ${item.color} ${
                  activePanel === item.id ? 'ring-2 ring-primary shadow-md' : ''
                }`}
                onClick={() => setActivePanel(item.id)}
              >
                <CardContent className="p-2 sm:p-3 text-center">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                  <h3 className="font-semibold text-[10px] sm:text-xs leading-tight">{item.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <TabsContent value={activePanel} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {renderActivePanel()}

            {/* Smart Alerts + Blockchain Logs + Geo Map + AI Assistant (UI placeholders) */}
            {activePanel === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Smart Alerts */}
                <Card className="p-2 sm:p-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm sm:text-base">Smart Alerts</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">AI-detected anomalies and risks</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="text-[10px] sm:text-xs p-2 rounded border bg-yellow-50">Potential duplicate device entries detected in last hour</div>
                    <div className="text-[10px] sm:text-xs p-2 rounded border bg-red-50">High-risk marketplace listing flagged by AI</div>
                    <div className="text-[10px] sm:text-xs p-2 rounded border bg-blue-50">Unusual claim pattern from single account</div>
                  </CardContent>
                </Card>

                {/* Blockchain Logs */}
                <Card className="p-2 sm:p-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm sm:text-base">Blockchain Transaction Logs</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Immutable record snapshots</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="text-[10px] sm:text-xs font-mono truncate">0x5a...12f • Device transfer • 2 mins ago</div>
                    <div className="text-[10px] sm:text-xs font-mono truncate">0x91...ae3 • Repair log update • 14 mins ago</div>
                    <div className="text-[10px] sm:text-xs font-mono truncate">0xcc...89a • Donation certificate • 1 hr ago</div>
                  </CardContent>
                </Card>

                {/* Geo Map + AI Assistant */}
                <Card className="p-2 sm:p-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm sm:text-base">Geo Map & Gutu Admin</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Lost/stolen hotspots & quick summaries</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="h-28 sm:h-32 rounded border bg-muted flex items-center justify-center text-[10px] sm:text-xs">Map placeholder (hotspots)</div>
                    <div className="flex gap-2">
                      <input className="flex-1 border rounded px-2 h-8 text-xs sm:text-sm" placeholder="Ask Gutu: summarize last 24h" />
                      <Button size="sm" variant="outline" className="h-8">Ask</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedAdminDashboard;