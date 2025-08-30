import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  EyeOff,
  Building,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
    phone: "",
    address: null,
    role: "individual",
    verification_status: false,
    avatar_url: ""
  });

  const [devices, setDevices] = useState<any[]>([]);

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

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate('/login');
        return;
      }

      setUser(user);

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        return;
      }

      setProfile({
        display_name: userProfile.display_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        address: userProfile.address,
        role: userProfile.role || "individual",
        verification_status: userProfile.verification_status || false,
        avatar_url: userProfile.avatar_url || ""
      });

      // Get user devices
      const { data: userDevices, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .eq('current_owner_id', user.id);

      if (devicesError) {
        console.error('Error loading devices:', devicesError);
      } else {
        setDevices(userDevices || []);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          display_name: profile.display_name,
          phone: profile.phone,
          address: profile.address
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile changes",
          variant: "destructive"
        });
        return;
      }

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile changes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  const getDashboardLink = () => {
    switch (profile.role) {
      case "retailer": return "/retailer-dashboard";
      case "repair_shop": return "/repair-shop-dashboard";
      case "insurance": return "/insurance-dashboard";
      case "law_enforcement": return "/law-enforcement-dashboard";
      case "ngo": return "/ngo-dashboard";
      default: return "/dashboard";
    }
  };

  const getRoleDisplayName = () => {
    switch (profile.role) {
      case "retailer": return "Retailer";
      case "repair_shop": return "Repair Shop";
      case "insurance": return "Insurance Provider";
      case "law_enforcement": return "Law Enforcement";
      case "ngo": return "NGO";
      default: return "Individual User";
    }
  };

  const formatMemberSince = () => {
    if (!user?.created_at) return "Recently joined";
    return new Date(user.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getLocationDisplay = () => {
    if (!profile.address) return "Not specified";
    if (typeof profile.address === 'string') return profile.address;
    if (typeof profile.address === 'object') {
      const addr = profile.address as any;
      return `${addr.city || ''}, ${addr.country || ''}`.replace(/^,\s*|,\s*$/g, '') || "Not specified";
    }
    return "Not specified";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" asChild>
              <Link to={getDashboardLink()}>
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
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">
                {profile.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.display_name || "User"}</h1>
                {profile.verification_status && (
                  <TrustBadge type="secure" text="Verified" />
                )}
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getRoleDisplayName()}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {formatMemberSince()}
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
                    value={profile.display_name}
                    onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-sm">{profile.display_name || "Not specified"}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="opacity-60"
                  />
                ) : (
                  <p className="text-sm">{profile.email}</p>
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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
                    <p className="text-sm">
                      {profile.phone ? (
                        showSensitive ? profile.phone : profile.phone.replace(/\d(?=\d{4})/g, '•')
                      ) : (
                        "Not specified"
                      )}
                    </p>
                    {profile.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSensitive(!showSensitive)}
                      >
                        {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={typeof profile.address === 'string' ? profile.address : ''}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-sm">{getLocationDisplay()}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                  Cancel
                </Button>
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
            {devices.length > 0 ? (
              devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{device.device_name || `${device.brand} ${device.model}`}</p>
                    <p className="text-sm text-muted-foreground">
                      Registered {new Date(device.registration_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Status: {device.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.status === "active" ? (
                      <TrustBadge type="secure" text="Active" />
                    ) : (
                      <Badge variant="secondary">{device.status}</Badge>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/device-details?id=${device.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No devices registered yet</p>
              </div>
            )}
          </div>
          
          <Button variant="outline" className="w-full" asChild>
            <Link to="/device/register">
              <Smartphone className="w-4 h-4 mr-2" />
              Register New Device
            </Link>
          </Button>
          
          <Button variant="premium" className="w-full" asChild>
            <Link to="/hot-deals-hub">
              <TrendingUp className="w-4 h-4 mr-2" />
              Create Hot Deal
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
            <Link to={getDashboardLink()}>
              <Shield className="w-4 h-4 mr-3" />
              Go to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/analytics-insights">
              <Settings className="w-4 h-4 mr-3" />
              Advanced Settings
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

export default Profile;