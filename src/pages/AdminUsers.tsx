import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Shield, 
  Building,
  Wrench,
  ShoppingCart,
  ShieldCheck,
  Heart,
  CreditCard,
  Settings,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Mock user data - would come from API
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "member",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2024-01-20",
      devices: 3,
      transactions: 12
    },
    {
      id: 2,
      name: "TechStore Inc.",
      email: "admin@techstore.com",
      role: "retailer",
      status: "verified",
      joinDate: "2024-01-10",
      lastActive: "2024-01-20",
      devices: 45,
      transactions: 89
    },
    {
      id: 3,
      name: "Mike's Repair Shop",
      email: "mike@repairshop.com",
      role: "repair_shop",
      status: "active",
      joinDate: "2024-01-12",
      lastActive: "2024-01-19",
      devices: 0,
      transactions: 23
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      role: "member",
      status: "suspended",
      joinDate: "2024-01-08",
      lastActive: "2024-01-18",
      devices: 1,
      transactions: 5
    },
    {
      id: 5,
      name: "Secure Insurance Co.",
      email: "claims@secureinsurance.com",
      role: "insurance",
      status: "verified",
      joinDate: "2024-01-05",
      lastActive: "2024-01-20",
      devices: 0,
      transactions: 156
    },
    {
      id: 6,
      name: "Detective Smith",
      email: "smith@police.gov",
      role: "law_enforcement",
      status: "active",
      joinDate: "2024-01-03",
      lastActive: "2024-01-20",
      devices: 0,
      transactions: 8
    },
    {
      id: 7,
      name: "Community Help NGO",
      email: "info@communityhelp.org",
      role: "ngo",
      status: "pending",
      joinDate: "2024-01-20",
      lastActive: "2024-01-20",
      devices: 0,
      transactions: 2
    },
    {
      id: 8,
      name: "PayFast Bank",
      email: "admin@payfast.com",
      role: "payment_gateway",
      status: "verified",
      joinDate: "2024-01-01",
      lastActive: "2024-01-20",
      devices: 0,
      transactions: 1234
    }
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "member": return "Individual User";
      case "retailer": return "Retailer";
      case "repair_shop": return "Repair Shop";
      case "insurance": return "Insurance";
      case "law_enforcement": return "Law Enforcement";
      case "ngo": return "NGO Partner";
      case "payment_gateway": return "Payment Gateway";
      case "platform_admin": return "Platform Admin";
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "member": return <Users className="w-4 h-4" />;
      case "retailer": return <ShoppingCart className="w-4 h-4" />;
      case "repair_shop": return <Wrench className="w-4 h-4" />;
      case "insurance": return <ShieldCheck className="w-4 h-4" />;
      case "law_enforcement": return <Shield className="w-4 h-4" />;
      case "ngo": return <Heart className="w-4 h-4" />;
      case "payment_gateway": return <CreditCard className="w-4 h-4" />;
      case "platform_admin": return <Settings className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "verified": return "bg-primary text-primary-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "suspended": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "member": return "bg-blue-100 text-blue-800";
      case "retailer": return "bg-green-100 text-green-800";
      case "repair_shop": return "bg-orange-100 text-orange-800";
      case "insurance": return "bg-purple-100 text-purple-800";
      case "law_enforcement": return "bg-red-100 text-red-800";
      case "ngo": return "bg-pink-100 text-pink-800";
      case "payment_gateway": return "bg-indigo-100 text-indigo-800";
      case "platform_admin": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            User Management
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Manage platform users and business accounts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === "active").length}</p>
                </div>
                <UserCheck className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === "pending").length}</p>
                </div>
                <Shield className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === "suspended").length}</p>
                </div>
                <UserX className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="member">Individual Users</SelectItem>
                  <SelectItem value="retailer">Retailers</SelectItem>
                  <SelectItem value="repair_shop">Repair Shops</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="law_enforcement">Law Enforcement</SelectItem>
                  <SelectItem value="ngo">NGO Partners</SelectItem>
                  <SelectItem value="payment_gateway">Payment Gateways</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4 sm:gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <div>
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={cn("text-xs", getRoleColor(user.role))}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge className={cn("text-xs", getStatusColor(user.status))}>
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.devices} devices</p>
                      <p className="text-sm text-muted-foreground">{user.transactions} transactions</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;