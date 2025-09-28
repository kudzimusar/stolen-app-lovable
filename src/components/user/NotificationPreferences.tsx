import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  Smartphone,
  MapPin,
  Settings,
  Save,
  CheckCircle
} from "lucide-react";

export const NotificationPreferences = () => {
  const { getAuthToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    radius_km: 10,
    high_value_only: false,
    frequency: "immediate"
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch('/api/v1/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success && result.data?.preferences) {
        setPreferences(result.data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
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

      const response = await fetch('/api/v1/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences })
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

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Customize how you receive notifications about lost and found devices in your area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Notification Channels */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Notification Channels</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <Switch
                id="email"
                checked={preferences.email}
                onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <Label htmlFor="push">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
              </div>
              <Switch
                id="push"
                checked={preferences.push}
                onCheckedChange={(checked) => handlePreferenceChange('push', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-orange-600" />
                <div>
                  <Label htmlFor="sms">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive text messages for urgent updates
                  </p>
                </div>
              </div>
              <Switch
                id="sms"
                checked={preferences.sms}
                onCheckedChange={(checked) => handlePreferenceChange('sms', checked)}
              />
            </div>
          </div>
        </div>

        {/* Geographic Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Geographic Settings</h3>
          
          <div className="space-y-4">
          <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <Label>Notification Radius</Label>
              </div>
              <div className="px-3">
              <Slider
                value={[preferences.radius_km]}
                  onValueChange={(value) => handlePreferenceChange('radius_km', value[0])}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 km</span>
                  <span className="font-medium">{preferences.radius_km} km</span>
                  <span>50 km</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Only receive notifications for devices within this radius of your location
              </p>
            </div>

            <div className="flex items-center justify-between">
                <div>
                <Label htmlFor="high_value_only">High Value Devices Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only notify about devices with rewards above R1000
                </p>
              </div>
              <Switch
                id="high_value_only"
                checked={preferences.high_value_only}
                onCheckedChange={(checked) => handlePreferenceChange('high_value_only', checked)}
              />
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Frequency Settings</h3>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select
              value={preferences.frequency}
              onValueChange={(value) => handlePreferenceChange('frequency', value)}
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
              How often you want to receive notifications
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Privacy & Data Usage</p>
              <p>
                Your location data is only used to determine relevant notifications and is not shared with third parties. 
                You can update these preferences at any time.
              </p>
            </div>
        </div>
      </div>

        {/* Save Button */}
        <div className="pt-4">
        <Button 
            onClick={savePreferences}
            disabled={saving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
      </div>
      </CardContent>
    </Card>
  );
};