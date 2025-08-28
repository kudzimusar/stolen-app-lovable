import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Ban, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Mock user data - would come from API
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      role: "member",
      status: "active",
      joinDate: "2024-01-15",
      lastActivity: "2024-01-20",
      devicesCount: 3,
      transactionsCount: 12,
      verificationStatus: "verified"
    },
    {
      id: 2,
      name: "TechStore Inc.",
      email: "admin@techstore.com",
      role: "retailer",
      status: "active",
      joinDate: "2024-01-10",
      lastActivity: "2024-01-20",
      devicesCount: 1250,
      transactionsCount: 890,
      verificationStatus: "verified"
    },
    {
      id: 3,
      name: "QuickFix Repairs",
      email: "info@quickfix.com",
      role: "repair_shop",
      status: "active",
      joinDate: "2024-01-12",
      lastActivity: "2024-01-19",
      devicesCount: 45,
      transactionsCount: 156,
      verificationStatus: "pending"
    },
    {
      id: 4,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      role: "member",
      status: "suspended",
      joinDate: "2024-01-08",
      lastActivity: "2024-01-18",
      devicesCount: 1,
      transactionsCount: 2,
      verificationStatus: "rejected"
    },
    {
      id: 5,
      name: "CityPD",
      email: "admin@citypd.gov",
      role: "law_enforcement",
      status: "active",
      joinDate: "2024-01-05",
      lastActivity: "2024-01-20",
      devicesCount: 0,
      transactionsCount: 0,
      verificationStatus: "verified"
    }
  ];

  const userStats = {
    total: 15847,
    active: 12456,
    pending: 1234,
    suspended: 157,
    newToday: 23,
    newThisWeek: 156
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "member": return "bg-blue-100 text-blue-800";
      case "retailer": return "bg-purple-100 text-purple-800";
      case "repair_shop": return "bg-green-100 text-green-800";
      case "insurance": return "bg-orange-100 text-orange-800";
      case "law_enforcement": return "bg-red-100 text-red-800";
      case "ngo": return "bg-pink-100 text-pink-800";
      case "platform_admin": return "bg-gray-100 text-gray-800";
      case "payment_gateway": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success";
      case "pending": return "text-warning";
      case "suspended": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            User Management
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Manage all platform users and their access permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{userStats.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-success">{userStats.active.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-warning">{userStats.pending.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-destructive">{userStats.suspended}</p>
                <p className="text-sm text-muted-foreground">Suspended</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{userStats.newToday}</p>
                <p className="text-sm text-muted-foreground">New Today</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{userStats.newThisWeek}</p>
                <p className="text-sm text-muted-foreground">New This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="member">Members</SelectItem>
                    <SelectItem value="retailer">Retailers</SelectItem>
                    <SelectItem value="repair_shop">Repair Shops</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="law_enforcement">Law Enforcement</SelectItem>
                    <SelectItem value="ngo">NGO Partners</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button size="sm" className="flex-1 sm:flex-none">
                  <Users className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Devices</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            user.status === "active" ? "bg-success" :
                            user.status === "pending" ? "bg-warning" : "bg-destructive"
                          )} />
                          <span className={getStatusColor(user.status)}>
                            {user.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getVerificationColor(user.verificationStatus)}>
                          {user.verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.devicesCount}</TableCell>
                      <TableCell>{user.transactionsCount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastActivity}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={selectedUser.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={selectedUser.email} />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="retailer">Retailer</SelectItem>
                      <SelectItem value="repair_shop">Repair Shop</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="law_enforcement">Law Enforcement</SelectItem>
                      <SelectItem value="ngo">NGO Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={selectedUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Save Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUsers;