import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Shield, Heart, Wrench, Store } from "lucide-react";

const StakeholderPanel = () => {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stakeholders</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retailers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Active partners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repair Shops</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Certified repairers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NGOs</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Partner organizations</p>
          </CardContent>
        </Card>
      </div>

      {/* Stakeholder Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Retailers
            </CardTitle>
            <CardDescription>Manage retail partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Retailers</span>
                <Badge variant="secondary">45</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pending Applications</span>
                <Badge variant="outline">3</Badge>
              </div>
              <Button className="w-full mt-4">Manage Retailers</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Repair Shops
            </CardTitle>
            <CardDescription>Manage repair partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Certified Repairers</span>
                <Badge variant="secondary">32</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pending Certification</span>
                <Badge variant="outline">7</Badge>
              </div>
              <Button className="w-full mt-4">Manage Repairers</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Law Enforcement
            </CardTitle>
            <CardDescription>Manage law enforcement access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Authorized Officers</span>
                <Badge variant="secondary">28</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pending Requests</span>
                <Badge variant="outline">2</Badge>
              </div>
              <Button className="w-full mt-4">Manage Officers</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StakeholderPanel;
