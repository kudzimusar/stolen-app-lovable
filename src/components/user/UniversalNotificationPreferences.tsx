import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  Smartphone,
  MapPin,
  Settings,
  Save,
  CheckCircle,
  Shield,
  Package,
  CreditCard,
  Wrench,
  AlertTriangle,
  MessageCircle,
  Gift
} from "lucide-react";

interface NotificationPreference {
  category: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  frequency: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  filters: Record<string, any>;
}

const CATEGORIES = [
  { 
    id: 'device', 
    name: 'Device Management', 
    icon: Smartphone, 
    description: 'Device registration, verification, and ownership updates' 
  },
  { 
    id: 'marketplace', 
    name: 'Marketplace', 
    icon: Package, 
    description: 'Listing updates, price changes, and transaction notifications' 
  },
  { 
    id: 'insurance', 
    name: 'Insurance', 
    icon: Shield, 
    description: 'Claim updates, policy renewals, and fraud alerts' 
  },
  { 
    id: 'repair', 
    name: 'Repair Services', 
    icon: Wrench, 
    description: 'Booking confirmations, status updates, and completion alerts' 
  },
  { 
    id: 'payment', 
    name: 'Payments', 
    icon: CreditCard, 
    description: 'Transaction confirmations and wallet updates' 
  },
  { 
    id: 'security', 
    name: 'Security', 
    icon: AlertTriangle, 
    description: 'Security alerts, login notifications, and fraud detection' 
  },
  { 
    id: 'lost_found', 
    name: 'Lost & Found', 
    icon: MapPin, 
    description: 'Device found alerts and community tips' 
  },
  { 
    id: 'community', 
    name: 'Community', 
    icon: MessageCircle, 
    description: 'Social features, rewards, and community updates' 
  },
  { 
    id: 'admin', 
    name: 'Admin', 
    icon: Settings, 
    description: 'Administrative notifications and system updates' 
  }
];

export const UniversalNotificationPreferences = () => {
  const { getAuthToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, NotificationPreference>>({});

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch('/api/v1/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success && result.data) {
        const prefsMap: Record<string, NotificationPreference> = {};
        result.data.forEach((pref: any) => {
          prefsMap[pref.category] = pref;
        });
        setPreferences(prefsMap);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Please log in to save preferences");
        return;
      }

      const preferencesArray = Object.values(preferences);
      const response = await fetch('/api/v1/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences: preferencesArray })
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Preferences saved successfully!");
      } else {
        toast.error(result.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (category: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const getDefaultPreference = (category: string): NotificationPreference => ({
    category,
    email_enabled: true,
    sms_enabled: category === 'security' || category === 'payment',
    push_enabled: true,
    in_app_enabled: true,
    frequency: 'immediate',
    filters: {}
  });

  const getPreferenceForCategory = (category: string): NotificationPreference => {
    return preferences[category] || getDefaultPreference(category);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.icon : Bell;
  };

  const getCategoryDescription = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.description : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize how you receive notifications across all STOLEN features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="device" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="device">Device</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="repair">Repair</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              const pref = getPreferenceForCategory(category.id);
              
              return (
                <TabsContent key={category.id} value={category.id} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>

                    {/* Notification Channels */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Notification Channels</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <div>
                              <Label htmlFor={`${category.id}-email`}>Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive updates via email
                              </p>
                            </div>
                          </div>
                          <Switch
                            id={`${category.id}-email`}
                            checked={pref.email_enabled}
                            onCheckedChange={(checked) => handlePreferenceChange(category.id, 'email_enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-green-600" />
                            <div>
                              <Label htmlFor={`${category.id}-push`}>Push Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive push notifications on your device
                              </p>
                            </div>
                          </div>
                          <Switch
                            id={`${category.id}-push`}
                            checked={pref.push_enabled}
                            onCheckedChange={(checked) => handlePreferenceChange(category.id, 'push_enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-orange-600" />
                            <div>
                              <Label htmlFor={`${category.id}-sms`}>SMS Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive text messages for urgent updates
                              </p>
                            </div>
                          </div>
                          <Switch
                            id={`${category.id}-sms`}
                            checked={pref.sms_enabled}
                            onCheckedChange={(checked) => handlePreferenceChange(category.id, 'sms_enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                            <div>
                              <Label htmlFor={`${category.id}-in-app`}>In-App Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Show notifications within the app
                              </p>
                            </div>
                          </div>
                          <Switch
                            id={`${category.id}-in-app`}
                            checked={pref.in_app_enabled}
                            onCheckedChange={(checked) => handlePreferenceChange(category.id, 'in_app_enabled', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Frequency Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Frequency Settings</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`${category.id}-frequency`}>Notification Frequency</Label>
                        <Select
                          value={pref.frequency}
                          onValueChange={(value) => handlePreferenceChange(category.id, 'frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate - Get notified right away</SelectItem>
                            <SelectItem value="hourly">Hourly - Get a summary every hour</SelectItem>
                            <SelectItem value="daily">Daily - Get a daily digest</SelectItem>
                            <SelectItem value="weekly">Weekly - Get a weekly summary</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          How often you want to receive notifications for {category.name.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    {/* Quiet Hours (for non-immediate frequencies) */}
                    {pref.frequency !== 'immediate' && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Quiet Hours</h4>
                        <p className="text-sm text-muted-foreground">
                          Set times when you don't want to receive notifications
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${category.id}-quiet-start`}>Start Time</Label>
                            <Select
                              value={pref.quiet_hours_start || '22:00'}
                              onValueChange={(value) => handlePreferenceChange(category.id, 'quiet_hours_start', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="22:00">10:00 PM</SelectItem>
                                <SelectItem value="23:00">11:00 PM</SelectItem>
                                <SelectItem value="00:00">12:00 AM</SelectItem>
                                <SelectItem value="01:00">1:00 AM</SelectItem>
                                <SelectItem value="02:00">2:00 AM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`${category.id}-quiet-end`}>End Time</Label>
                            <Select
                              value={pref.quiet_hours_end || '08:00'}
                              onValueChange={(value) => handlePreferenceChange(category.id, 'quiet_hours_end', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="06:00">6:00 AM</SelectItem>
                                <SelectItem value="07:00">7:00 AM</SelectItem>
                                <SelectItem value="08:00">8:00 AM</SelectItem>
                                <SelectItem value="09:00">9:00 AM</SelectItem>
                                <SelectItem value="10:00">10:00 AM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category-specific filters */}
                    {category.id === 'lost_found' && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Lost & Found Filters</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={`${category.id}-high-value`}>High Value Devices Only</Label>
                              <p className="text-sm text-muted-foreground">
                                Only notify about devices with rewards above R1000
                              </p>
                            </div>
                            <Switch
                              id={`${category.id}-high-value`}
                              checked={pref.filters.high_value_only || false}
                              onCheckedChange={(checked) => handlePreferenceChange(category.id, 'filters', {
                                ...pref.filters,
                                high_value_only: checked
                              })}
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label>Notification Radius (km)</Label>
                            <Slider
                              value={[pref.filters.radius_km || 10]}
                              onValueChange={(value) => handlePreferenceChange(category.id, 'filters', {
                                ...pref.filters,
                                radius_km: value[0]
                              })}
                              max={50}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>1 km</span>
                              <span className="font-medium">{pref.filters.radius_km || 10} km</span>
                              <span>50 km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {category.id === 'marketplace' && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Marketplace Filters</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={`${category.id}-price-alerts`}>Price Drop Alerts</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when items in your watchlist drop in price
                              </p>
                            </div>
                            <Switch
                              id={`${category.id}-price-alerts`}
                              checked={pref.filters.price_alerts || true}
                              onCheckedChange={(checked) => handlePreferenceChange(category.id, 'filters', {
                                ...pref.filters,
                                price_alerts: checked
                              })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={`${category.id}-bid-alerts`}>Bid Alerts</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when someone bids on your items
                              </p>
                            </div>
                            <Switch
                              id={`${category.id}-bid-alerts`}
                              checked={pref.filters.bid_alerts || true}
                              onCheckedChange={(checked) => handlePreferenceChange(category.id, 'filters', {
                                ...pref.filters,
                                bid_alerts: checked
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={savePreferences}
          disabled={saving}
          className="min-w-32"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Privacy & Data Usage</p>
              <p>
                Your notification preferences are stored securely and used only to customize your experience. 
                You can update these settings at any time. Location data is only used for relevant notifications 
                and is not shared with third parties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
