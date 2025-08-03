import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { STOLENLogo } from "@/components/STOLENLogo";
import { TrustBadge } from "@/components/TrustBadge";
import { BackButton } from "@/components/BackButton";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Building,
  Shield,
  Bell,
  Lock,
  Edit3,
  LogOut,
  Wrench,
  Award,
  HelpCircle
} from "lucide-react";

const RepairerProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "QuickFix Repair Center",
    email: "admin@quickfix.com",
    phone: "+1 (555) 987-6543",
    location: "San Francisco, CA",
    memberSince: "March 2024"
  });

  const [businessInfo, setBusinessInfo] = useState({
    companyName: "QuickFix Repair Center LLC",
    registrationNumber: "CA-REG-987654321",
    licenseNumber: "REP-SF-2024-002",
    businessAddress: "456 Repair Avenue, San Francisco, CA 94103",
    contactPerson: "Sarah Johnson",
    website: "https://quickfix-repair.com",
    taxId: "87-9876543",
    businessType: "Electronics Repair Shop",
    yearsInBusiness: "8",
    specializations: "iPhone, Samsung, Laptop repairs, Water damage recovery",
    certifications: "Apple Certified Technician, Samsung Authorized Service",
    insuranceNumber: "INS-REP-2024-001",
    operatingHours: "Mon-Fri 9AM-6PM, Sat 10AM-4PM"
  });

  const [notifications, setNotifications] = useState({
    repairAlerts: true,
    appointmentReminders: true,
    customerUpdates: true,
    securityAlerts: true,
    qualityUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    businessHours: true,
    locationSharing: true,
    customerReviews: true
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save to backend
  };

  const handleLogout = () => {
    // Check screen size and redirect accordingly
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      navigate("/splash-welcome");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton to="/repair-shop-dashboard" />
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              <span className="font-semibold">Repairer Profile</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-lg">QF</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <TrustBadge type="secure" text="Gold Certified" />
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  <Award className="w-3 h-3 mr-1" />
                  Repairer Admin
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {profile.memberSince}
              </p>
            </div>
          </div>
        </Card>

        {/* Business Information */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building className="w-5 h-5" />
              Business Information
            </h2>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                {isEditing ? (
                  <Input
                    id="companyName"
                    value={businessInfo.companyName}
                    onChange={(e) => setBusinessInfo({...businessInfo, companyName: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.companyName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Business Registration Number</Label>
                {isEditing ? (
                  <Input
                    id="registrationNumber"
                    value={businessInfo.registrationNumber}
                    onChange={(e) => setBusinessInfo({...businessInfo, registrationNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.registrationNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Repair License Number</Label>
                {isEditing ? (
                  <Input
                    id="licenseNumber"
                    value={businessInfo.licenseNumber}
                    onChange={(e) => setBusinessInfo({...businessInfo, licenseNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.licenseNumber}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Insurance Policy Number</Label>
                {isEditing ? (
                  <Input
                    id="insuranceNumber"
                    value={businessInfo.insuranceNumber}
                    onChange={(e) => setBusinessInfo({...businessInfo, insuranceNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.insuranceNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              {isEditing ? (
                <Input
                  id="businessAddress"
                  value={businessInfo.businessAddress}
                  onChange={(e) => setBusinessInfo({...businessInfo, businessAddress: e.target.value})}
                />
              ) : (
                <p className="text-sm">{businessInfo.businessAddress}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations</Label>
              {isEditing ? (
                <Input
                  id="specializations"
                  value={businessInfo.specializations}
                  onChange={(e) => setBusinessInfo({...businessInfo, specializations: e.target.value})}
                  placeholder="e.g., iPhone, Samsung, Laptop repairs"
                />
              ) : (
                <p className="text-sm">{businessInfo.specializations}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications & Authorizations</Label>
              {isEditing ? (
                <Input
                  id="certifications"
                  value={businessInfo.certifications}
                  onChange={(e) => setBusinessInfo({...businessInfo, certifications: e.target.value})}
                />
              ) : (
                <p className="text-sm">{businessInfo.certifications}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingHours">Operating Hours</Label>
              {isEditing ? (
                <Input
                  id="operatingHours"
                  value={businessInfo.operatingHours}
                  onChange={(e) => setBusinessInfo({...businessInfo, operatingHours: e.target.value})}
                />
              ) : (
                <p className="text-sm">{businessInfo.operatingHours}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            )}
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Repair Alerts</p>
                <p className="text-sm text-muted-foreground">Device repair logging and quality updates</p>
              </div>
              <Switch
                checked={notifications.repairAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, repairAlerts: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Appointment Reminders</p>
                <p className="text-sm text-muted-foreground">Customer appointments and schedule updates</p>
              </div>
              <Switch
                checked={notifications.appointmentReminders}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, appointmentReminders: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-muted-foreground">Account security and fraud warnings</p>
              </div>
              <Switch
                checked={notifications.securityAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, securityAlerts: checked})
                }
              />
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Privacy Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Business Profile Visibility</p>
                <p className="text-sm text-muted-foreground">Allow customers to see your repair shop profile</p>
              </div>
              <Switch
                checked={privacy.profileVisibility}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, profileVisibility: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Customer Reviews Display</p>
                <p className="text-sm text-muted-foreground">Show customer reviews and ratings publicly</p>
              </div>
              <Switch
                checked={privacy.customerReviews}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, customerReviews: checked})
                }
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/repair-shop-dashboard">
              <Wrench className="w-4 h-4 mr-3" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/support">
              <HelpCircle className="w-4 h-4 mr-3" />
              Help & Support
            </Link>
          </Button>
          
          <Separator />
          
          <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RepairerProfile;