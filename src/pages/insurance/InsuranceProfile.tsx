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
  FileText,
  HelpCircle
} from "lucide-react";

const InsuranceProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "SecureGuard Insurance",
    email: "admin@secureguard.com",
    phone: "+1 (555) 456-7890",
    location: "San Francisco, CA",
    memberSince: "February 2024"
  });

  const [businessInfo, setBusinessInfo] = useState({
    companyName: "SecureGuard Insurance Company",
    registrationNumber: "CA-INS-789012345",
    licenseNumber: "INS-CA-2024-003",
    businessAddress: "789 Insurance Plaza, San Francisco, CA 94104",
    contactPerson: "Michael Rodriguez",
    website: "https://secureguard-insurance.com",
    taxId: "87-7890123",
    businessType: "Insurance Provider",
    yearsInBusiness: "25",
    certifications: "A.M. Best Rating A+, NAIC Certified",
    policyTypes: "Device Insurance, Theft Protection, Extended Warranty",
    regulatoryBody: "California Department of Insurance",
    membershipNumber: "CDI-2024-789"
  });

  const [notifications, setNotifications] = useState({
    claimAlerts: true,
    policyUpdates: true,
    fraudAlerts: true,
    securityAlerts: true,
    regulatoryUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    claimStatistics: false,
    policyOfferings: true,
    contactInformation: true
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
              <BackButton to="/insurance-dashboard" />
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-semibold">Insurance Profile</span>
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
              <AvatarFallback className="text-lg">SG</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <TrustBadge type="secure" text="A+ Rated" />
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Insurance Admin
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
              Insurance Company Information
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
                <Label htmlFor="registrationNumber">Insurance Registration Number</Label>
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
                <Label htmlFor="licenseNumber">Insurance License Number</Label>
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
                <Label htmlFor="membershipNumber">Regulatory Membership Number</Label>
                {isEditing ? (
                  <Input
                    id="membershipNumber"
                    value={businessInfo.membershipNumber}
                    onChange={(e) => setBusinessInfo({...businessInfo, membershipNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.membershipNumber}</p>
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
                <Label htmlFor="regulatoryBody">Regulatory Body</Label>
                {isEditing ? (
                  <Input
                    id="regulatoryBody"
                    value={businessInfo.regulatoryBody}
                    onChange={(e) => setBusinessInfo({...businessInfo, regulatoryBody: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{businessInfo.regulatoryBody}</p>
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
              <Label htmlFor="policyTypes">Policy Types Offered</Label>
              {isEditing ? (
                <Input
                  id="policyTypes"
                  value={businessInfo.policyTypes}
                  onChange={(e) => setBusinessInfo({...businessInfo, policyTypes: e.target.value})}
                />
              ) : (
                <p className="text-sm">{businessInfo.policyTypes}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications & Ratings</Label>
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
                <p className="font-medium">Claim Alerts</p>
                <p className="text-sm text-muted-foreground">New claims and verification updates</p>
              </div>
              <Switch
                checked={notifications.claimAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, claimAlerts: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fraud Alerts</p>
                <p className="text-sm text-muted-foreground">Suspicious activity and fraud detection</p>
              </div>
              <Switch
                checked={notifications.fraudAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, fraudAlerts: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Regulatory Updates</p>
                <p className="text-sm text-muted-foreground">Industry regulations and compliance changes</p>
              </div>
              <Switch
                checked={notifications.regulatoryUpdates}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, regulatoryUpdates: checked})
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
                <p className="font-medium">Company Profile Visibility</p>
                <p className="text-sm text-muted-foreground">Allow public access to company information</p>
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
                <p className="font-medium">Policy Offerings Display</p>
                <p className="text-sm text-muted-foreground">Show available policies and coverage options</p>
              </div>
              <Switch
                checked={privacy.policyOfferings}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, policyOfferings: checked})
                }
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/insurance-dashboard">
              <FileText className="w-4 h-4 mr-3" />
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

export default InsuranceProfile;