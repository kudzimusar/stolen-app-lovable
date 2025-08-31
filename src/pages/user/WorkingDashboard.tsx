import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/AppHeader";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Link, useNavigate } from "react-router-dom";
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { useToast } from "@/hooks/use-toast";
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
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Zap,
  DollarSign,
  Activity
} from "lucide-react";

const WorkingDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { savePosition } = useScrollMemory(true);

  // Mock data for demonstration
  const [devices] = useState([
    {
      id: 1,
      name: "iPhone 15 Pro",
      serial: "ABC123XYZ",
      status: "verified",
      registeredDate: "2024-01-15",
      location: "Cape Town, WC"
    },
    {
      id: 2,
      name: "MacBook Pro M3",
      serial: "DEF456UVW",
      status: "verified",
      registeredDate: "2024-02-10",
      location: "Johannesburg, GP"
    }
  ]);

  const [userProfile] = useState({
    isNewUser: false,
    securityScore: 92,
    completedGoals: 4,
    totalGoals: 5,
    userType: 'active'
  });

  const quickActions = [
    {
      icon: Plus,
      title: "Register Device",
      description: "Add a new device to your portfolio",
      href: "/device-register",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: Search,
      title: "Device Check",
      description: "Verify device authenticity",
      href: "/device-check",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: ShoppingCart,
      title: "Marketplace",
      description: "Browse verified devices",
      href: "/marketplace",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: Wallet,
      title: "S-Pay Wallet",
      description: "Manage your payments",
      href: "/wallet",
      color: "bg-yellow-50 border-yellow-200"
    }
  ];

  const recentActivities = [
    {
      icon: CheckCircle,
      title: "Device Verification Complete",
      description: "iPhone 15 Pro successfully verified",
      time: "2 hours ago",
      type: "success"
    },
    {
      icon: TrendingUp,
      title: "Market Value Update",
      description: "Your device values increased by 5%",
      time: "1 day ago",
      type: "info"
    },
    {
      icon: Award,
      title: "Community Achievement",
      description: "Helped recover a device in your area",
      time: "3 days ago",
      type: "achievement"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your devices today
              </p>
            </div>
            <TrustBadge score={userProfile.securityScore} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Devices</p>
                  <p className="text-2xl font-bold">{devices.length}</p>
                </div>
                <Smartphone className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Security Score</p>
                  <p className="text-2xl font-bold">{userProfile.securityScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Goals Complete</p>
                  <p className="text-2xl font-bold">{userProfile.completedGoals}/{userProfile.totalGoals}</p>
                </div>
                <Award className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Community Rank</p>
                  <p className="text-2xl font-bold">Gold</p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`${action.color} rounded-lg p-4 border transition-all hover:shadow-md group`}
              >
                <action.icon className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* My Devices */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Devices</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/my-devices">
                View All <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{device.name}</p>
                    <p className="text-sm text-gray-600">Serial: {device.serial}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {device.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{device.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <activity.icon className={`h-5 w-5 mt-0.5 ${
                  activity.type === 'success' ? 'text-green-600' :
                  activity.type === 'info' ? 'text-blue-600' : 'text-purple-600'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingDashboard;
