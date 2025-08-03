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
  Package,
  FileText,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  HelpCircle
} from "lucide-react";

const RetailerProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "TechMart Electronics",
    email: "admin@techmart.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    memberSince: "January 2024"
  });

  const [businessInfo, setBusinessInfo] = useState({
    companyName: "TechMart Electronics Inc.",
    registrationNumber: "CA-REG-123456789",
    licenseNumber: "RTL-SF-2024-001",
    businessAddress: "123 Market Street, San Francisco, CA 94102",
    contactPerson: "John Smith",
    website: "https://techmart-electronics.com",
    taxId: "87-1234567",
    businessType: "Electronics Retailer",
    yearsInBusiness: "15",
    certifications: "FCC Certified, Apple Authorized Reseller"
  });

  const [notifications, setNotifications] = useState({
    deviceAlerts: true,
    apiUpdates: true,
    bulkUploadStatus: true,
    securityAlerts: true,
    marketplaceOffers: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    businessHours: true,
    locationSharing: true
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
              <BackButton to="/retailer-dashboard" />
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-semibold">Retailer Profile</span>
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
              <AvatarFallback className="text-lg">TM</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <TrustBadge type="secure" text="STOLEN Verified" />
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success">
                  <Shield className="w-3 h-3 mr-1" />
                  Retailer Admin
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
                <Label htmlFor="licenseNumber">Retail License Number</Label>
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
                <Label htmlFor="taxId">Tax ID Number</Label>
                {isEditing ? (
                  <Input
                    id="taxId"
                    value={businessInfo.taxId}
                    onChange={(e) => setBusinessInfo({...businessInfo, taxId: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.taxId}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={businessInfo.website}
                    onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.website}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                {isEditing ? (
                  <Input
                    id="yearsInBusiness"
                    value={businessInfo.yearsInBusiness}
                    onChange={(e) => setBusinessInfo({...businessInfo, yearsInBusiness: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.yearsInBusiness} years</p>
                )}
              </div>
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
                <p className="font-medium">Device Alerts</p>
                <p className="text-sm text-muted-foreground">Bulk upload status and device verification alerts</p>
              </div>
              <Switch
                checked={notifications.deviceAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, deviceAlerts: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">API Updates</p>
                <p className="text-sm text-muted-foreground">API usage limits and new feature announcements</p>
              </div>
              <Switch
                checked={notifications.apiUpdates}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, apiUpdates: checked})
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
                <p className="text-sm text-muted-foreground">Allow customers to see your business profile</p>
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
                <p className="font-medium">Business Hours Display</p>
                <p className="text-sm text-muted-foreground">Show operating hours to customers</p>
              </div>
              <Switch
                checked={privacy.businessHours}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, businessHours: checked})
                }
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/retailer-dashboard">
              <Package className="w-4 h-4 mr-3" />
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

export default RetailerProfile;