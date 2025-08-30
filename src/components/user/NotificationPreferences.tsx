import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Mail,
  Smartphone,
  MapPin,
  Shield,
  Save,
  RotateCcw
} from "lucide-react";

interface NotificationPreferencesProps {
  onClose?: () => void;
}

const NotificationPreferences = ({ onClose }: NotificationPreferencesProps) => {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    radius_km: 10,
    high_value_only: false,
    daily_digest: true,
    immediate_alerts: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/lost-found/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setPreferences(result.data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Use default preferences if loading fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/v1/lost-found/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(preferences)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save preferences');
      }

      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated successfully.",
      });

      onClose?.();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences({
      email: true,
      push: true,
      sms: false,
      radius_km: 10,
      high_value_only: false,
      daily_digest: true,
      immediate_alerts: true
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Customize how you receive notifications about lost and found devices
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h4 className="font-medium">Notification Channels</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Checkbox
                id="email"
                checked={preferences.email}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, email: checked as boolean})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="push" className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">In-app and browser notifications</p>
                </div>
              </div>
              <Checkbox
                id="push"
                checked={preferences.push}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, push: checked as boolean})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="sms" className="text-sm font-medium">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">Text messages for urgent alerts</p>
                </div>
              </div>
              <Checkbox
                id="sms"
                checked={preferences.sms}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, sms: checked as boolean})
                }
              />
            </div>
          </div>
        </div>

        {/* Geographic Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Geographic Settings</h4>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Notification Radius</Label>
                <Badge variant="outline">{preferences.radius_km} km</Badge>
              </div>
              <Slider
                value={[preferences.radius_km]}
                onValueChange={(value) => setPreferences({...preferences, radius_km: value[0]})}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only receive notifications for devices within this distance
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="high_value" className="text-sm font-medium">High-Value Devices Only</Label>
                  <p className="text-xs text-muted-foreground">Only notify about devices with rewards</p>
                </div>
              </div>
              <Checkbox
                id="high_value"
                checked={preferences.high_value_only}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, high_value_only: checked as boolean})
                }
              />
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Frequency Settings</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="immediate" className="text-sm font-medium">Immediate Alerts</Label>
                  <p className="text-xs text-muted-foreground">Get notified as soon as new reports are posted</p>
                </div>
              </div>
              <Checkbox
                id="immediate"
                checked={preferences.immediate_alerts}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, immediate_alerts: checked as boolean})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="digest" className="text-sm font-medium">Daily Digest</Label>
                  <p className="text-xs text-muted-foreground">Receive a summary of all new reports once per day</p>
                </div>
              </div>
              <Checkbox
                id="digest"
                checked={preferences.daily_digest}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, daily_digest: checked as boolean})
                }
              />
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Privacy & Data Usage</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your location data is only used to send relevant notifications and is never shared with third parties. 
            You can disable location-based notifications at any time.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSave} 
          className="flex-1" 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={isSaving}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        {onClose && (
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
};

export default NotificationPreferences;
