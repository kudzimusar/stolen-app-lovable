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
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Lock,
  Smartphone,
  CreditCard,
  HelpCircle,
  LogOut,
  Edit3,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    memberSince: "January 2024"
  });

  const [notifications, setNotifications] = useState({
    deviceAlerts: true,
    communityUpdates: true,
    marketplaceOffers: false,
    securityAlerts: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    locationSharing: true,
    activityStatus: false
  });

  const connectedDevices = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      status: "verified",
      registeredDate: "2024-01-15"
    },
    {
      id: 2,
      name: "MacBook Pro M3",
      status: "needs-attention",
      registeredDate: "2024-02-20"
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <STOLENLogo />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Mobile Back Navigation - Fallback */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-lg">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <TrustBadge type="secure" text="Verified" />
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground">
                Member since {profile.memberSince}
              </p>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{profile.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{profile.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{showSensitive ? profile.phone : "••• ••• ••67"}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSensitive(!showSensitive)}
                    >
                      {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{profile.location}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            )}
          </div>
        </Card>

        {/* Connected Devices */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Connected Devices
          </h2>
          
          <div className="space-y-3">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Registered {device.registeredDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {device.status === "verified" ? (
                    <TrustBadge type="secure" text="Verified" />
                  ) : (
                    <Badge variant="secondary">Needs Attention</Badge>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/device/${device.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full" asChild>
            <Link to="/device/register">
              <Smartphone className="w-4 h-4 mr-2" />
              Register New Device
            </Link>
          </Button>
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
                <p className="text-sm text-muted-foreground">Stolen device matches and recovery updates</p>
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
                <p className="font-medium">Community Updates</p>
                <p className="text-sm text-muted-foreground">Lost and found posts in your area</p>
              </div>
              <Switch
                checked={notifications.communityUpdates}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, communityUpdates: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketplace Offers</p>
                <p className="text-sm text-muted-foreground">New listings and price alerts</p>
              </div>
              <Switch
                checked={notifications.marketplaceOffers}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, marketplaceOffers: checked})
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
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
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
                <p className="font-medium">Location Sharing</p>
                <p className="text-sm text-muted-foreground">Share general location for device recovery</p>
              </div>
              <Switch
                checked={privacy.locationSharing}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, locationSharing: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activity Status</p>
                <p className="text-sm text-muted-foreground">Show when you're active on the platform</p>
              </div>
              <Switch
                checked={privacy.activityStatus}
                onCheckedChange={(checked) => 
                  setPrivacy({...privacy, activityStatus: checked})
                }
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/wallet">
              <CreditCard className="w-4 h-4 mr-3" />
              Wallet & Payments
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/support">
              <HelpCircle className="w-4 h-4 mr-3" />
              Help & Support
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/analytics-insights">
              <Settings className="w-4 h-4 mr-3" />
              Advanced Settings
            </Link>
          </Button>
          
          <Separator />
          
          <Button variant="destructive" className="w-full justify-start" asChild>
            <Link to="/login">
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;