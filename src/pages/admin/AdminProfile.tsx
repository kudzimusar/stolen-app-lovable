import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Settings, 
  Shield, 
  Key, 
  Bell, 
  Activity, 
  Clock, 
  Lock,
  Mail,
  Phone,
  Building,
  MapPin,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartNotificationCenter } from "@/components/notifications/SmartNotificationCenter";

const AdminProfile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock admin data - would come from API
  const adminData = {
    id: "admin_001",
    name: "Alex Johnson",
    email: "alex.johnson@stolen.com",
    phone: "+1 (555) 123-4567",
    role: "Super Admin",
    department: "Platform Operations",
    location: "San Francisco, CA",
    timezone: "Pacific Standard Time",
    joinDate: "2023-06-15",
    lastLogin: "2024-01-20 14:30 PST",
    loginCount: 1247,
    permissions: [
      "user_management",
      "system_administration", 
      "financial_reports",
      "security_monitoring",
      "api_management",
      "audit_logs"
    ]
  };

  const securityLogs = [
    {
      id: 1,
      action: "Password Changed",
      timestamp: "2024-01-20 10:15 PST",
      ip: "192.168.1.100",
      location: "San Francisco, CA",
      status: "success"
    },
    {
      id: 2,
      action: "2FA Enabled",
      timestamp: "2024-01-19 16:45 PST",
      ip: "192.168.1.100",
      location: "San Francisco, CA",
      status: "success"
    },
    {
      id: 3,
      action: "Login Attempt",
      timestamp: "2024-01-19 09:30 PST",
      ip: "192.168.1.100",
      location: "San Francisco, CA",
      status: "success"
    },
    {
      id: 4,
      action: "Failed Login",
      timestamp: "2024-01-18 23:22 PST",
      ip: "203.45.67.89",
      location: "Unknown",
      status: "failed"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "security",
      title: "Unusual login detected",
      message: "Login from new location detected",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      type: "system",
      title: "System maintenance scheduled",
      message: "Planned maintenance window: Tonight 2-4 AM PST",
      time: "4 hours ago",
      read: true
    },
    {
      id: 3,
      type: "user",
      title: "New business verification",
      message: "TechStore Inc. submitted verification documents",
      time: "1 day ago",
      read: true
    }
  ];

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      user_management: "User Management",
      system_administration: "System Administration",
      financial_reports: "Financial Reports",
      security_monitoring: "Security Monitoring",
      api_management: "API Management",
      audit_logs: "Audit Logs"
    };
    return labels[permission] || permission;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "security": return <Shield className="w-4 h-4 text-warning" />;
      case "system": return <Settings className="w-4 h-4 text-primary" />;
      case "user": return <User className="w-4 h-4 text-success" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-success";
      case "failed": return "text-destructive";
      case "warning": return "text-warning";
      default: return "text-muted-foreground";
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
                Admin Profile
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Manage your admin account settings and security preferences
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={isEditing ? "default" : "outline"} 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                {adminData.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{adminData.name}</h2>
                  <Badge className="bg-primary text-primary-foreground w-fit">{adminData.role}</Badge>
                </div>
                <p className="text-muted-foreground mb-2">{adminData.department}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{adminData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{adminData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{adminData.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">{adminData.joinDate}</p>
                <p className="text-sm text-muted-foreground mt-2">Last login</p>
                <p className="font-medium">{adminData.lastLogin}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        defaultValue={adminData.name} 
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        defaultValue={adminData.email} 
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        defaultValue={adminData.phone} 
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input 
                        id="department" 
                        defaultValue={adminData.department} 
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        defaultValue={adminData.location} 
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue={adminData.timezone} disabled={!isEditing}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pacific Standard Time">Pacific Standard Time</SelectItem>
                          <SelectItem value="Mountain Standard Time">Mountain Standard Time</SelectItem>
                          <SelectItem value="Central Standard Time">Central Standard Time</SelectItem>
                          <SelectItem value="Eastern Standard Time">Eastern Standard Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Brief description about yourself..."
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive SMS alerts for critical issues</p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div>
                      <h4 className="font-medium mb-3">Change Password</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input 
                              id="current-password" 
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter current password"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" placeholder="Enter new password" />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                        </div>
                        <Button className="w-full">Update Password</Button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Switch
                          checked={twoFactorEnabled}
                          onCheckedChange={setTwoFactorEnabled}
                        />
                      </div>
                      
                      {twoFactorEnabled && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-success">
                            <CheckCircle className="w-4 h-4" />
                            <span>Two-factor authentication is enabled</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Key className="w-4 h-4 mr-2" />
                            View Recovery Codes
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Security Activity
                  </CardTitle>
                  <CardDescription>
                    Recent security events and login history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          log.status === "success" ? "bg-success" : "bg-destructive"
                        )} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{log.action}</p>
                            <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {log.ip} • {log.location}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={log.status === "success" ? "text-success" : "text-destructive"}
                        >
                          {log.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    View Full Security Log
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Admin Permissions
                </CardTitle>
                <CardDescription>
                  Your current administrative permissions and access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {adminData.permissions.map((permission) => (
                    <div key={permission} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="font-medium">{getPermissionLabel(permission)}</span>
                      </div>
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-warning/10 border border-warning rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-medium text-warning">Permission Changes</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permission changes require approval from a Super Admin and may take up to 24 hours to process.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your recent administrative actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Created new user account", time: "2 hours ago", type: "user" },
                      { action: "Updated system configuration", time: "4 hours ago", type: "system" },
                      { action: "Approved business verification", time: "6 hours ago", type: "business" },
                      { action: "Generated security report", time: "1 day ago", type: "report" },
                      { action: "Modified user permissions", time: "2 days ago", type: "permission" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Recent notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={cn(
                        "p-3 rounded-lg border",
                        notification.read ? "bg-muted/30" : "bg-primary/10 border-primary"
                      )}>
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={cn(
                                "font-medium text-sm",
                                !notification.read && "text-primary"
                              )}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminProfile;