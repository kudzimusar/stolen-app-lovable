import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Camera,
  Eye,
  MessageCircle,
  Shield,
  Send
} from "lucide-react";

interface CommunityTipFormProps {
  reportId: string;
  reportType: "lost" | "found";
  deviceName: string;
  onTipSubmitted?: () => void;
  onClose?: () => void;
}

const CommunityTipForm = ({ 
  reportId, 
  reportType, 
  deviceName, 
  onTipSubmitted, 
  onClose 
}: CommunityTipFormProps) => {
  const [formData, setFormData] = useState({
    tipType: "sighting" as "sighting" | "information" | "contact",
    tipDescription: "",
    tipLocation: "",
    contactMethod: "",
    anonymous: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get user's current location if available
      let userLocation = null;
      if (navigator.geolocation && !formData.anonymous) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        } catch (error) {
          console.log("Could not get user location:", error);
        }
      }

      const tipData = {
        report_id: reportId,
        tip_type: formData.tipType,
        tip_description: formData.tipDescription,
        tip_location_lat: userLocation?.lat || null,
        tip_location_lng: userLocation?.lng || null,
        tip_location_address: formData.tipLocation,
        contact_method: formData.contactMethod,
        anonymous: formData.anonymous
      };

      const response = await fetch('/api/v1/community-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(tipData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit tip');
      }

      toast({
        title: "Tip Submitted",
        description: "Your tip has been submitted successfully. Thank you for helping!",
      });

      onTipSubmitted?.();
      onClose?.();
    } catch (error) {
      console.error('Error submitting tip:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit tip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTipTypeDescription = (type: string) => {
    switch (type) {
      case "sighting":
        return "I saw this device recently";
      case "information":
        return "I have information about this device";
      case "contact":
        return "I want to contact the owner/finder";
      default:
        return "";
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Submit a Tip</h3>
        <p className="text-sm text-muted-foreground">
          Help reunite this {reportType} {deviceName} with its owner
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tip Type Selection */}
        <div className="space-y-2">
          <Label>Tip Type</Label>
          <Select 
            value={formData.tipType} 
            onValueChange={(value) => setFormData({...formData, tipType: value as any})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sighting">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Sighting
                </div>
              </SelectItem>
              <SelectItem value="information">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Information
                </div>
              </SelectItem>
              <SelectItem value="contact">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Contact
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getTipTypeDescription(formData.tipType)}
          </p>
        </div>

        {/* Tip Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder={
              formData.tipType === "sighting" 
                ? "Where and when did you see this device? Any details that could help identify it..."
                : formData.tipType === "information"
                ? "What information do you have about this device? Any relevant details..."
                : "How would you like to be contacted? What's your message?"
            }
            value={formData.tipDescription}
            onChange={(e) => setFormData({...formData, tipDescription: e.target.value})}
            required
            rows={4}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location (Optional)</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="Where did you see/find this device?"
              value={formData.tipLocation}
              onChange={(e) => setFormData({...formData, tipLocation: e.target.value})}
            />
            <Button type="button" variant="outline" size="icon">
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contact Method */}
        {formData.tipType === "contact" && (
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Method</Label>
            <Input
              id="contact"
              placeholder="Email, phone, or preferred contact method"
              value={formData.contactMethod}
              onChange={(e) => setFormData({...formData, contactMethod: e.target.value})}
            />
          </div>
        )}

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={formData.anonymous}
            onCheckedChange={(checked) => 
              setFormData({...formData, anonymous: checked as boolean})
            }
          />
          <Label htmlFor="anonymous" className="text-sm">
            Submit anonymously
          </Label>
        </div>

        {/* Privacy Notice */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Privacy Protected</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formData.anonymous 
              ? "Your identity will be completely hidden. Only the tip information will be shared."
              : "Your contact information will only be shared with the device owner when necessary."
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isLoading || !formData.tipDescription}
          >
            {isLoading ? "Submitting..." : "Submit Tip"}
          </Button>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default CommunityTipForm;
