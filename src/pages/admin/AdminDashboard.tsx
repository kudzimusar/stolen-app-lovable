// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Building, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Settings,
  Activity,
  DollarSign,
  Package,
  Smartphone,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SmartNotificationCenter } from "@/components/notifications/SmartNotificationCenter";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("24h");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBusinesses: 0,
    pendingVerifications: 0,
    systemHealth: 0,
    totalDevices: 0,
    totalTransactions: 0,
    revenue: 0,
    blockchainVerified: 0,
    stolenDevices: 0,
    lostDevices: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch real admin statistics
  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      // Call the comprehensive admin stats function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_comprehensive_admin_stats');

      if (statsError) {
        console.error('Error fetching admin stats:', statsError);
        throw new Error('Failed to fetch admin statistics');
      }

      if (statsData) {
        const userStats = statsData.user_stats || {};
        const deviceStats = statsData.device_stats || {};
        const lostFoundStats = statsData.lost_found_stats || {};
        const financialStats = statsData.financial_stats || {};

        setStats({
          totalUsers: userStats.total_users || 0,
          activeUsers: userStats.active_users || 0,
          totalBusinesses: 0, // Will be added when business system is implemented
          pendingVerifications: lostFoundStats.pending_claims || 0,
          systemHealth: statsData.system_health === 'HEALTHY' ? 98.5 : 85.0,
          totalDevices: deviceStats.total_devices || 0,
          totalTransactions: lostFoundStats.total_reports || 0,
          revenue: financialStats.total_revenue || 0,
          blockchainVerified: deviceStats.blockchain_verified || 0,
          stolenDevices: deviceStats.stolen_devices || 0,
          lostDevices: deviceStats.lost_devices || 0
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Error Loading Statistics",
        description: error instanceof Error ? error.message : "Failed to load admin statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const recentActivity = [
    { id: 1, type: "user_registration", message: "New user registered: John Doe", time: "2 min ago", severity: "info" },
    { id: 2, type: "business_verification", message: "Business verification pending: TechStore Inc.", time: "5 min ago", severity: "warning" },
    { id: 3, type: "fraud_alert", message: "Fraud alert: Suspicious device registration", time: "12 min ago", severity: "error" },
    { id: 4, type: "system_update", message: "System maintenance completed successfully", time: "1 hour ago", severity: "success" },
    { id: 5, type: "payment_processed", message: "High-value transaction processed: $5,000", time: "2 hours ago", severity: "info" }
  ];

  const systemStatus = [
    { name: "API Gateway", status: "operational", uptime: 99.9 },
    { name: "Database", status: "operational", uptime: 99.8 },
    { name: "Blockchain", status: "operational", uptime: 99.7 },
    { name: "Payment System", status: "degraded", uptime: 98.5 },
    { name: "ML/AI Services", status: "operational", uptime: 99.9 }
  ];

  const pendingActions = [
    { id: 1, type: "Business Verification", count: 12, priority: "high" },
    { id: 2, type: "Fraud Investigations", count: 5, priority: "critical" },
    { id: 3, type: "System Updates", count: 3, priority: "medium" },
    { id: 4, type: "User Appeals", count: 8, priority: "medium" }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "text-destructive";
      case "warning": return "text-warning";
      case "success": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-success";
      case "degraded": return "text-warning";
      case "down": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <SmartNotificationCenter />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                Platform Administration
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Monitor and manage the STOLEN platform ecosystem
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {["24h", "7d", "30d", "90d"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-sm"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                </div>
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Devices</p>
                  <p className="text-xl sm:text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.totalDevices.toLocaleString()}</p>
                </div>
                <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Blockchain Verified</p>
                  <p className="text-xl sm:text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.blockchainVerified.toLocaleString()}</p>
                </div>
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stolen Devices</p>
                  <p className="text-xl sm:text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.stolenDevices.toLocaleString()}</p>
                </div>
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold">${stats.revenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* System Health */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Real-time monitoring of platform components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus.map((system) => (
                  <div key={system.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        system.status === "operational" ? "bg-success" :
                        system.status === "degraded" ? "bg-warning" : "bg-destructive"
                      )} />
                      <span className="font-medium">{system.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStatusColor(system.status)}>
                        {system.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{system.uptime}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall System Health</span>
                  <span>{stats.systemHealth}%</span>
                </div>
                <Progress value={stats.systemHealth} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Pending Actions
              </CardTitle>
              <CardDescription>
                Items requiring admin attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{action.type}</p>
                      <Badge className={cn("text-xs", getPriorityColor(action.priority))}>
                        {action.priority}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{action.count}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                View All Actions
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest platform events and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      activity.severity === "error" ? "bg-destructive" :
                      activity.severity === "warning" ? "bg-warning" :
                      activity.severity === "success" ? "bg-success" : "bg-primary"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(activity.severity)}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-xs">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Building className="w-5 h-5" />
              <span className="text-xs">Verify Business</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-xs">Security Audit</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-xs">System Config</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Package className="w-5 h-5" />
              <span className="text-xs">Backup Data</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;