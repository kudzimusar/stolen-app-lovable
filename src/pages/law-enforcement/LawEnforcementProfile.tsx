import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { BackButton } from "@/components/navigation/BackButton";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Building,
  Shield,
  Bell,
  Lock,
  Edit3,
  LogOut,
  HelpCircle
} from "lucide-react";

const LawEnforcementProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "SFPD Digital Crimes Unit",
    email: "digital.crimes@sfpd.gov",
    phone: "+1 (415) 553-0123",
    location: "San Francisco, CA",
    memberSince: "January 2024"
  });

  const [agencyInfo, setAgencyInfo] = useState({
    agencyName: "San Francisco Police Department",
    registrationNumber: "CA-LEA-123456789",
    badgeNumber: "DCU-2024-001",
    agencyAddress: "850 Bryant Street, San Francisco, CA 94103",
    contactPerson: "Detective Jane Smith",
    website: "https://www.sanfranciscopolice.org",
    agencyType: "Municipal Police Department",
    jurisdiction: "San Francisco County",
    specialization: "Digital Crimes, Cybersecurity, Device Theft",
    certifications: "POST Certified, FBI NCIC Access",
    supervisorName: "Lieutenant Michael Johnson",
    supervisorBadge: "LT-5678"
  });

  const [notifications, setNotifications] = useState({
    deviceMatches: true,
    recoveryAlerts: true,
    investigationUpdates: true,
    securityAlerts: true,
    systemUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    agencyVisibility: true,
    caseStatistics: false,
    contactInformation: true,
    jurisdictionInfo: true
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
              <BackButton to="/law-enforcement-dashboard" />
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">Law Enforcement Profile</span>
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
              <AvatarFallback className="text-lg">SF</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <TrustBadge type="secure" text="Verified Agency" />
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Law Enforcement Admin
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {profile.memberSince}
              </p>
            </div>
          </div>
        </Card>

        {/* Agency Information */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building className="w-5 h-5" />
              Agency Information
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
                <Label htmlFor="agencyName">Agency Name</Label>
                {isEditing ? (
                  <Input
                    id="agencyName"
                    value={agencyInfo.agencyName}
                    onChange={(e) => setAgencyInfo({...agencyInfo, agencyName: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{agencyInfo.agencyName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Agency Registration Number</Label>
                {isEditing ? (
                  <Input
                    id="registrationNumber"
                    value={agencyInfo.registrationNumber}
                    onChange={(e) => setAgencyInfo({...agencyInfo, registrationNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{agencyInfo.registrationNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badgeNumber">Badge/Unit Number</Label>
                {isEditing ? (
                  <Input
                    id="badgeNumber"
                    value={agencyInfo.badgeNumber}
                    onChange={(e) => setAgencyInfo({...agencyInfo, badgeNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{agencyInfo.badgeNumber}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                {isEditing ? (
                  <Input
                    id="jurisdiction"
                    value={agencyInfo.jurisdiction}
                    onChange={(e) => setAgencyInfo({...agencyInfo, jurisdiction: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{agencyInfo.jurisdiction}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencyAddress">Agency Address</Label>
              {isEditing ? (
                <Input
                  id="agencyAddress"
                  value={agencyInfo.agencyAddress}
                  onChange={(e) => setAgencyInfo({...agencyInfo, agencyAddress: e.target.value})}
                />
              ) : (
                <p className="text-sm">{agencyInfo.agencyAddress}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supervisorName">Supervisor Name</Label>
                {isEditing ? (
                  <Input
                    id="supervisorName"
                    value={agencyInfo.supervisorName}
                    onChange={(e) => setAgencyInfo({...agencyInfo, supervisorName: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{agencyInfo.supervisorName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisorBadge">Supervisor Badge</Label>
                {isEditing ? (
                  <Input
                    id="supervisorBadge"
                    value={agencyInfo.supervisorBadge}
                    onChange={(e) => setAgencyInfo({...agencyInfo, supervisorBadge: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{agencyInfo.supervisorBadge}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              {isEditing ? (
                <Input
                  id="specialization"
                  value={agencyInfo.specialization}
                  onChange={(e) => setAgencyInfo({...agencyInfo, specialization: e.target.value})}
                />
              ) : (
                <p className="text-sm">{agencyInfo.specialization}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications & Access</Label>
              {isEditing ? (
                <Input
                  id="certifications"
                  value={agencyInfo.certifications}
                  onChange={(e) => setAgencyInfo({...agencyInfo, certifications: e.target.value})}
                />
              ) : (
                <p className="text-sm">{agencyInfo.certifications}</p>
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
                <p className="font-medium">Device Matches</p>
                <p className="text-sm text-muted-foreground">Stolen device matches and recovery opportunities</p>
              </div>
              <Switch
                checked={notifications.deviceMatches}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, deviceMatches: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Investigation Updates</p>
                <p className="text-sm text-muted-foreground">Case status changes and evidence updates</p>
              </div>
              <Switch
                checked={notifications.investigationUpdates}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, investigationUpdates: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-muted-foreground">System security and unauthorized access attempts</p>
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
                <p className="font-medium">Agency Visibility</p>
                <p className="text-sm text-muted-foreground">Allow public access to agency information</p>
              </div>
              <Switch
                checked={privacy.agencyVisibility}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, agencyVisibility: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Jurisdiction Information</p>
                <p className="text-sm text-muted-foreground">Display jurisdiction and contact information</p>
              </div>
              <Switch
                checked={privacy.jurisdictionInfo}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, jurisdictionInfo: checked})
                }
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/law-enforcement-dashboard">
              <Shield className="w-4 h-4 mr-3" />
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

export default LawEnforcementProfile;