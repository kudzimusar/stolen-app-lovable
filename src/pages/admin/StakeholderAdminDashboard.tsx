// @ts-nocheck
/**
 * Stakeholder Admin Dashboard - Base Component
 * Department-specific admin dashboard for internal staff
 * Shows only relevant panels and data for each department
 */

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
  RefreshCw,
  Activity,
  Store,
  Wrench,
  Scale,
  Heart,
  Bell,
  Clock
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { getDepartmentConfig } from "@/lib/constants/departmentConfigs";
import { DepartmentConfig } from "@/lib/types/departmentConfig";

// Import department-specific panels
import LostFoundPanel from "./panels/LostFoundPanel";
import MarketplacePanel from "./panels/MarketplacePanel";
import StakeholderPanel from "./panels/StakeholderPanel";
import FinancialPanel from "./panels/FinancialPanel";
import SecurityPanel from "./panels/SecurityPanel";
import SystemSettingsPanel from "./panels/SystemSettingsPanel";
import UsersPanel from "./panels/UsersPanel";

interface StakeholderAdminDashboardProps {
  roleType: 'retailer' | 'repair_shop' | 'insurance' | 'law_enforcement' | 'ngo';
  roleName: string;
  roleIcon: any;
  roleColor: string;
}

interface AdminStats {
  totalUsers: number;
  activeReports: number;
  totalTransactions: number;
  revenue: number;
  recoveryRate: number;
  pendingApprovals: number;
  pendingClaims: number;
  // Role-specific stats
  totalListings?: number;
  activeListings?: number;
  totalRepairs?: number;
  pendingRepairs?: number;
  totalPolicies?: number;
  totalClaims?: number;
  totalCases?: number;
  activeCases?: number;
  totalDonations?: number;
}

const StakeholderAdminDashboard = ({
  roleType,
  roleName,
  roleIcon: RoleIcon,
  roleColor
}: StakeholderAdminDashboardProps) => {
  const { user, getAuthToken } = useAuth();
  const [activePanel, setActivePanel] = useState("overview");
  const [isSuperAdminView, setIsSuperAdminView] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Get department-specific configuration
  const departmentConfig = getDepartmentConfig(roleType);

  useEffect(() => {
    // Wait for user to be loaded before fetching data
    if (!user?.id) {
      console.log('⏳ Waiting for user to load...');
      return;
    }

    console.log('✅ User loaded, fetching dashboard data for:', user.id);
    
    // Check if super admin is viewing this dashboard
    const checkSuperAdmin = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData && (userData.role === 'admin' || userData.role === 'super_admin')) {
          setIsSuperAdminView(true);
        }
      } catch (error) {
        console.log('Role check:', error);
      }
    };
    
    checkSuperAdmin();
    fetchDashboardData();
  }, [user?.id]); // Add dependency on user.id

  const fetchDashboardData = async () => {
    if (!user?.id) {
      console.log('⚠️ Cannot fetch data: user.id is undefined');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log(`📊 Fetching ${roleType} department stats for user:`, user.id);
      
      // Fetch role-specific stats
      let viewName = '';
      switch (roleType) {
        case 'retailer':
          viewName = 'retailer_admin_stats';
          break;
        case 'repair_shop':
          viewName = 'repair_shop_admin_stats';
          break;
        case 'insurance':
          viewName = 'insurance_admin_stats';
          break;
        case 'law_enforcement':
          viewName = 'law_enforcement_admin_stats';
          break;
        case 'ngo':
          viewName = 'ngo_admin_stats';
          break;
      }

      if (viewName) {
        // Fetch aggregated department stats (no user filtering - department-wide)
        const { data: roleStats, error } = await supabase
          .from(viewName)
          .select('*')
          .single();

        if (!error && roleStats) {
          console.log(`✅ ${roleType} stats loaded:`, roleStats);
          
          // Map the stats with proper formatting
          const mappedStats: any = {
            // Common metrics for all departments
            totalUsers: roleStats.total_sellers || roleStats.total_customers || roleStats.total_donors || roleStats.total_beneficiaries || 0,
            activeReports: roleStats.active_cases || roleStats.pending_repairs || roleStats.pending_claims || roleStats.pending_donations || 0,
            totalTransactions: roleStats.total_listings || roleStats.total_repairs || roleStats.total_policies || roleStats.total_cases || roleStats.total_donations || 0,
            revenue: roleStats.total_revenue || roleStats.total_payouts || roleStats.total_donation_value || 0,
            recoveryRate: roleStats.resolution_rate || roleStats.completion_rate || roleStats.claim_approval_rate || 0,
            pendingApprovals: roleStats.pending_verification || roleStats.pending_repairs || roleStats.pending_claims || roleStats.pending_donations || 0,
            
            // Department-specific metrics
            ...roleStats
          };
          
          setStats(mappedStats);
        } else {
          console.error(`❌ Error fetching ${roleType} stats:`, error);
          setStats({});
        }
      }
    } catch (error) {
      console.error('Error fetching stakeholder admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getNavigationItems = () => {
    if (!departmentConfig) {
      return [];
    }
    
    return departmentConfig.panels.map(panel => ({
      id: panel.id,
      label: panel.label,
      icon: panel.icon,
      description: panel.description,
      color: panel.color
    }));
  };

  const getRoleSpecificStats = () => {
    switch (roleType) {
      case 'retailer':
        return [
          {
            title: 'Total Listings',
            value: stats.totalListings || 0,
            trend: '+12% from last month',
            icon: ShoppingCart,
            color: 'blue'
          },
          {
            title: 'Active Listings',
            value: stats.activeListings || 0,
            trend: 'Currently for sale',
            icon: Package,
            color: 'green'
          },
          {
            title: 'Total Revenue',
            value: `R${(stats.revenue || 0).toLocaleString()}`,
            trend: '+23% from last month',
            icon: DollarSign,
            color: 'emerald'
          },
          {
            title: 'Transactions',
            value: stats.totalTransactions || 0,
            trend: 'This month',
            icon: TrendingUp,
            color: 'purple'
          }
        ];
      
      case 'repair_shop':
        return [
          {
            title: 'Total Repairs',
            value: stats.totalRepairs || 0,
            trend: 'All time',
            icon: Wrench,
            color: 'blue'
          },
          {
            title: 'Pending Repairs',
            value: stats.pendingRepairs || 0,
            trend: 'Awaiting completion',
            icon: Clock,
            color: 'orange'
          },
          {
            title: 'Total Revenue',
            value: `R${(stats.revenue || 0).toLocaleString()}`,
            trend: '+15% from last month',
            icon: DollarSign,
            color: 'emerald'
          },
          {
            title: 'Customers',
            value: stats.totalUsers || 0,
            trend: 'Active customers',
            icon: Users,
            color: 'purple'
          }
        ];

      case 'insurance':
        return [
          {
            title: 'Active Policies',
            value: stats.totalPolicies || 0,
            trend: 'Active coverage',
            icon: Shield,
            color: 'blue'
          },
          {
            title: 'Pending Claims',
            value: stats.pendingClaims || 0,
            trend: 'Awaiting review',
            icon: AlertTriangle,
            color: 'orange'
          },
          {
            title: 'Total Payouts',
            value: `R${(stats.revenue || 0).toLocaleString()}`,
            trend: 'This year',
            icon: DollarSign,
            color: 'emerald'
          },
          {
            title: 'Total Claims',
            value: stats.totalClaims || 0,
            trend: 'All time',
            icon: CheckCircle,
            color: 'purple'
          }
        ];

      case 'law_enforcement':
        return [
          {
            title: 'Total Cases',
            value: stats.totalCases || 0,
            trend: 'All time',
            icon: Shield,
            color: 'blue'
          },
          {
            title: 'Active Cases',
            value: stats.activeCases || 0,
            trend: 'Under investigation',
            icon: Activity,
            color: 'orange'
          },
          {
            title: 'Recovery Rate',
            value: `${stats.recoveryRate || 0}%`,
            trend: '+5% from last month',
            icon: TrendingUp,
            color: 'emerald'
          },
          {
            title: 'Reports Accessed',
            value: stats.activeReports || 0,
            trend: 'This month',
            icon: Package,
            color: 'purple'
          }
        ];

      case 'ngo':
        return [
          {
            title: 'Total Donations',
            value: stats.totalDonations || 0,
            trend: 'Devices donated',
            icon: Heart,
            color: 'blue'
          },
          {
            title: 'Beneficiaries',
            value: stats.totalUsers || 0,
            trend: 'People helped',
            icon: Users,
            color: 'green'
          },
          {
            title: 'Devices Managed',
            value: stats.activeReports || 0,
            trend: 'Currently active',
            icon: Package,
            color: 'purple'
          },
          {
            title: 'Impact Score',
            value: '95%',
            trend: 'Community rating',
            icon: TrendingUp,
            color: 'emerald'
          }
        ];

      default:
        return [];
    }
  };

  const renderOverviewPanel = () => {
    if (!departmentConfig) {
      return <div className="p-6 text-center">Loading department configuration...</div>;
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Department Welcome */}
        <div className={`bg-gradient-to-r ${roleColor} text-white rounded-lg p-4 sm:p-6`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <RoleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{roleName} Dashboard</h2>
              <p className="text-xs sm:text-sm opacity-90 hidden sm:block">{departmentConfig.description}</p>
              <p className="text-xs opacity-90 sm:hidden">Department center</p>
            </div>
          </div>
        </div>

        {/* Department-Specific Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {departmentConfig.metrics.map((metric, index) => {
            const value = stats[metric.key] || 0;
            const formattedValue = metric.format === 'currency' 
              ? `R${value.toLocaleString()}` 
              : metric.format === 'percentage' 
              ? `${value}%` 
              : value.toLocaleString();
            
            return (
              <Card key={index} className="p-2 sm:p-3">
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{metric.label}</p>
                      <p className="text-lg sm:text-xl font-bold">{formattedValue}</p>
                    </div>
                    <metric.icon className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions - Department Specific */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {departmentConfig.panels.slice(1, 4).map((panel) => (
            <Card 
              key={panel.id}
              className="cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation" 
              onClick={() => setActivePanel(panel.id)}
            >
              <CardContent className="p-2 sm:p-3">
                <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
                  <panel.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-[10px] sm:text-xs truncate">{panel.label}</h3>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">{panel.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <p className="text-sm font-medium">System updated</p>
                  <p className="text-xs text-muted-foreground">Latest data synchronized successfully</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">New data available</p>
                  <p className="text-xs text-muted-foreground">Fresh statistics ready for review</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Dashboard refreshed</p>
                  <p className="text-xs text-muted-foreground">All metrics updated in real-time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderActivePanel = () => {
    // Department-specific panel routing
    switch (activePanel) {
      case "overview":
        return renderOverviewPanel();
      
      // Retailer Department panels
      case "marketplace":
        return <MarketplacePanel roleFilter={roleType} />;
      case "sellers":
        return <UsersPanel roleFilter={roleType} />;
      case "inventory":
        return <div className="p-6 text-center"><h3>Inventory Management</h3><p>Track stock levels, SKUs, and product categories</p></div>;
      case "verification":
        return <div className="p-6 text-center"><h3>Product Verification</h3><p>Review and approve product listings</p></div>;
      
      // Repair Shop Department panels
      case "repair_orders":
        return <div className="p-6 text-center"><h3>Repair Orders</h3><p>All ongoing and completed repairs</p></div>;
      case "service_partners":
        return <UsersPanel roleFilter={roleType} />;
      case "quality_control":
        return <div className="p-6 text-center"><h3>Quality Control</h3><p>Review repair quality and warranty claims</p></div>;
      
      // Insurance Department panels
      case "policies":
        return <div className="p-6 text-center"><h3>Insurance Policies</h3><p>Active insurance policies</p></div>;
      case "claims":
        return <div className="p-6 text-center"><h3>Insurance Claims</h3><p>Pending and processed claims</p></div>;
      case "policyholders":
        return <UsersPanel roleFilter={roleType} />;
      case "risk_assessment":
        return <div className="p-6 text-center"><h3>Risk Assessment</h3><p>Fraud detection and high-risk devices</p></div>;
      
      // Law Enforcement Department panels
      case "stolen_reports":
        return <LostFoundPanel roleFilter={roleType} />;
      case "active_cases":
        return <div className="p-6 text-center"><h3>Active Cases</h3><p>Ongoing investigations</p></div>;
      case "recovered_devices":
        return <div className="p-6 text-center"><h3>Recovered Devices</h3><p>Successfully recovered items</p></div>;
      case "law_enforcement_partners":
        return <UsersPanel roleFilter={roleType} />;
      case "evidence_management":
        return <div className="p-6 text-center"><h3>Evidence Management</h3><p>Documentation and chain of custody</p></div>;
      
      // NGO Department panels
      case "donations":
        return <div className="p-6 text-center"><h3>Device Donations</h3><p>Device donation tracking</p></div>;
      case "beneficiaries":
        return <UsersPanel roleFilter={roleType} />;
      case "ngo_partners":
        return <UsersPanel roleFilter={roleType} />;
      case "impact_tracking":
        return <div className="p-6 text-center"><h3>Impact Tracking</h3><p>Social impact metrics and success stories</p></div>;
      
      // Common panels
      case "financial":
        return <FinancialPanel roleFilter={roleType} />;
      case "settings":
        return <SystemSettingsPanel roleFilter={roleType} />;
      
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
      {/* Super Admin View Banner */}
      {isSuperAdminView && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" />
            <span>Super Admin View: You're viewing the {roleName} dashboard</span>
            <a href="/admin" className="underline ml-2">← Back to Super Admin</a>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{roleName} Admin</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={fetchDashboardData} className="w-auto">
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Badge variant="secondary" className="whitespace-nowrap text-xs">
                {stats.pendingApprovals || 0} pending
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs value={activePanel} onValueChange={setActivePanel} className="space-y-4 sm:space-y-6">
          {/* Navigation Grid */}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StakeholderAdminDashboard;

