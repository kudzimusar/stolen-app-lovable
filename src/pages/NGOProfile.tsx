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
  Heart,
  HelpCircle
} from "lucide-react";

const NGOProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "TechBridge Foundation",
    email: "admin@techbridge.org",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    memberSince: "April 2024"
  });

  const [organizationInfo, setOrganizationInfo] = useState({
    organizationName: "TechBridge Foundation",
    registrationNumber: "CA-NGO-456789012",
    taxExemptNumber: "501(c)(3)-12345",
    organizationAddress: "321 Nonprofit Plaza, San Francisco, CA 94105",
    contactPerson: "Maria Garcia",
    website: "https://techbridge-foundation.org",
    taxId: "87-4567890",
    organizationType: "501(c)(3) Nonprofit",
    yearsActive: "12",
    missionStatement: "Bridging the digital divide through technology access and education",
    focusAreas: "Digital equity, Education technology, Community outreach",
    certifications: "GuideStar Platinum Seal, BBB Accredited Charity",
    annualBudget: "$2.5M - $5M",
    beneficiaryCount: "5,000+ annually"
  });

  const [notifications, setNotifications] = useState({
    donationAlerts: true,
    impactUpdates: true,
    programUpdates: true,
    securityAlerts: true,
    reportingDeadlines: true
  });

  const [privacy, setPrivacy] = useState({
    organizationVisibility: true,
    impactMetrics: true,
    donorInformation: false,
    programDetails: true
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
              <BackButton to="/ngo-dashboard" />
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-semibold">NGO Profile</span>
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
              <AvatarFallback className="text-lg">TB</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <TrustBadge type="secure" text="Verified NGO" />
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <Heart className="w-3 h-3 mr-1" />
                  NGO Admin
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {profile.memberSince}
              </p>
            </div>
          </div>
        </Card>

        {/* Organization Information */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization Information
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
                <Label htmlFor="organizationName">Organization Name</Label>
                {isEditing ? (
                  <Input
                    id="organizationName"
                    value={organizationInfo.organizationName}
                    onChange={(e) => setOrganizationInfo({...organizationInfo, organizationName: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{organizationInfo.organizationName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                {isEditing ? (
                  <Input
                    id="registrationNumber"
                    value={organizationInfo.registrationNumber}
                    onChange={(e) => setOrganizationInfo({...organizationInfo, registrationNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{organizationInfo.registrationNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxExemptNumber">Tax Exempt Number</Label>
                {isEditing ? (
                  <Input
                    id="taxExemptNumber"
                    value={organizationInfo.taxExemptNumber}
                    onChange={(e) => setOrganizationInfo({...organizationInfo, taxExemptNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{organizationInfo.taxExemptNumber}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organizationType">Organization Type</Label>
                {isEditing ? (
                  <Input
                    id="organizationType"
                    value={organizationInfo.organizationType}
                    onChange={(e) => setOrganizationInfo({...organizationInfo, organizationType: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{organizationInfo.organizationType}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationAddress">Organization Address</Label>
              {isEditing ? (
                <Input
                  id="organizationAddress"
                  value={organizationInfo.organizationAddress}
                  onChange={(e) => setOrganizationInfo({...organizationInfo, organizationAddress: e.target.value})}
                />
              ) : (
                <p className="text-sm">{organizationInfo.organizationAddress}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="missionStatement">Mission Statement</Label>
              {isEditing ? (
                <Input
                  id="missionStatement"
                  value={organizationInfo.missionStatement}
                  onChange={(e) => setOrganizationInfo({...organizationInfo, missionStatement: e.target.value})}
                />
              ) : (
                <p className="text-sm">{organizationInfo.missionStatement}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusAreas">Focus Areas</Label>
                {isEditing ? (
                  <Input
                    id="focusAreas"
                    value={organizationInfo.focusAreas}
                    onChange={(e) => setOrganizationInfo({...organizationInfo, focusAreas: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{organizationInfo.focusAreas}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearsActive">Years Active</Label>
                {isEditing ? (
                  <Input
                    id="yearsActive"
                    value={organizationInfo.yearsActive}
                    onChange={(e) => setOrganizationInfo({...organizationInfo, yearsActive: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{organizationInfo.yearsActive} years</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualBudget">Annual Budget</Label>
                {isEditing ? (
                  <Input
                    id="annualBudget"
                    value={organizationInfo.annualBudget}
                    onChange={(e) => setOrganizationInfo({...organizationInfo, annualBudget: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{organizationInfo.annualBudget}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="beneficiaryCount">Beneficiaries Served</Label>
                {isEditing ? (
                  <Input
                    id="beneficiaryCount"
                    value={organizationInfo.beneficiaryCount}
                    onChange={(e) => setOrganizationInfo({...organizationInfo, beneficiaryCount: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{organizationInfo.beneficiaryCount}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications & Accreditations</Label>
              {isEditing ? (
                <Input
                  id="certifications"
                  value={organizationInfo.certifications}
                  onChange={(e) => setOrganizationInfo({...organizationInfo, certifications: e.target.value})}
                />
              ) : (
                <p className="text-sm">{organizationInfo.certifications}</p>
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
                <p className="font-medium">Donation Alerts</p>
                <p className="text-sm text-muted-foreground">Device donations and donation opportunities</p>
              </div>
              <Switch
                checked={notifications.donationAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, donationAlerts: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Impact Updates</p>
                <p className="text-sm text-muted-foreground">Program outcomes and beneficiary updates</p>
              </div>
              <Switch
                checked={notifications.impactUpdates}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, impactUpdates: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reporting Deadlines</p>
                <p className="text-sm text-muted-foreground">Tax reporting and compliance deadlines</p>
              </div>
              <Switch
                checked={notifications.reportingDeadlines}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, reportingDeadlines: checked})
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
                <p className="font-medium">Organization Visibility</p>
                <p className="text-sm text-muted-foreground">Allow public access to organization information</p>
              </div>
              <Switch
                checked={privacy.organizationVisibility}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, organizationVisibility: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Impact Metrics Display</p>
                <p className="text-sm text-muted-foreground">Show program outcomes and impact statistics</p>
              </div>
              <Switch
                checked={privacy.impactMetrics}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, impactMetrics: checked})
                }
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/ngo-dashboard">
              <Heart className="w-4 h-4 mr-3" />
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

export default NGOProfile;