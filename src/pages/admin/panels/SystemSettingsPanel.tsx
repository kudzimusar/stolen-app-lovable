import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Mail, Database, Shield, Bell } from "lucide-react";

const SystemSettingsPanel = () => {
  return (
    <div className="space-y-6">
      {/* System Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Users</span>
                <Badge variant="secondary">1,234</Badge>
              </div>
              <div className="flex justify-between">
                <span>Admin Users</span>
                <Badge variant="outline">12</Badge>
              </div>
              <Button className="w-full mt-4">Manage Users</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Communication
            </CardTitle>
            <CardDescription>Email and notification settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Email Templates</span>
                <Badge variant="secondary">15</Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Notifications</span>
                <Badge variant="outline">8</Badge>
              </div>
              <Button className="w-full mt-4">Manage Communication</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Database management and backups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Database Size</span>
                <Badge variant="secondary">2.3 GB</Badge>
              </div>
              <div className="flex justify-between">
                <span>Last Backup</span>
                <Badge variant="outline">2 hours ago</Badge>
              </div>
              <Button className="w-full mt-4">Manage Database</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>Configure system settings and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">System Settings</h3>
            <p className="text-muted-foreground mb-4">
              Comprehensive system configuration tools coming soon.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">General Settings</Badge>
              <Badge variant="outline">Feature Toggles</Badge>
              <Badge variant="outline">API Configuration</Badge>
              <Badge variant="outline">Security Settings</Badge>
              <Badge variant="outline">Maintenance Mode</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsPanel;
