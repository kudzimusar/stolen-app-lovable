import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  MapPin,
  MessageCircle,
  Eye,
  EyeOff,
  Send,
  AlertCircle
} from "lucide-react";

interface CommunityTipFormProps {
  reportId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CommunityTipForm = ({ reportId, onSuccess, onCancel }: CommunityTipFormProps) => {
  const { getAuthToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tip_type: "sighting",
    tip_description: "",
    tip_location_address: "",
    contact_method: "",
    anonymous: false,
    reward_amount: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Please log in to submit a tip");
        return;
      }

      const response = await fetch('/api/v1/community-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          report_id: reportId,
          ...formData
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Tip submitted successfully!");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to submit tip");
      }
    } catch (error) {
      console.error('Error submitting tip:', error);
      toast.error("Failed to submit tip");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Submit a Community Tip
        </CardTitle>
        <CardDescription>
          Help the community by sharing information about this device. Your tip could lead to a successful recovery!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tip Type */}
      <div className="space-y-2">
            <Label htmlFor="tip_type">Tip Type</Label>
          <Select 
              value={formData.tip_type}
              onValueChange={(value) => handleInputChange('tip_type', value)}
          >
            <SelectTrigger>
                <SelectValue placeholder="Select tip type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="sighting">Sighting - I saw this device</SelectItem>
                <SelectItem value="information">Information - I have relevant info</SelectItem>
                <SelectItem value="contact">Contact - I can help connect people</SelectItem>
            </SelectContent>
          </Select>
        </div>

          {/* Description */}
        <div className="space-y-2">
            <Label htmlFor="tip_description">Description *</Label>
          <Textarea
              id="tip_description"
              placeholder="Describe what you saw, know, or how you can help..."
              value={formData.tip_description}
              onChange={(e) => handleInputChange('tip_description', e.target.value)}
            required
            rows={4}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
            <Label htmlFor="tip_location_address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location (optional)
            </Label>
            <Input
              id="tip_location_address"
              placeholder="Where did you see this or where is it now?"
              value={formData.tip_location_address}
              onChange={(e) => handleInputChange('tip_location_address', e.target.value)}
            />
        </div>

        {/* Contact Method */}
          <div className="space-y-2">
            <Label htmlFor="contact_method">Contact Method (optional)</Label>
            <Input
              id="contact_method"
              placeholder="How can you be reached? (phone, email, etc.)"
              value={formData.contact_method}
              onChange={(e) => handleInputChange('contact_method', e.target.value)}
            />
          </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={formData.anonymous}
              onCheckedChange={(checked) => handleInputChange('anonymous', checked)}
          />
            <Label htmlFor="anonymous" className="flex items-center gap-2">
              {formData.anonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Submit anonymously
          </Label>
        </div>

          {/* Reward Amount */}
          <div className="space-y-2">
            <Label htmlFor="reward_amount">Reward Amount (optional)</Label>
            <Input
              id="reward_amount"
              type="number"
              placeholder="0"
              value={formData.reward_amount}
              onChange={(e) => handleInputChange('reward_amount', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
            <p className="text-sm text-muted-foreground">
              If you're offering a reward for information leading to recovery
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Privacy Notice</p>
                <p>
                  Your tip will be shared with the device owner and community moderators. 
                  If you choose to remain anonymous, your identity will not be revealed.
                </p>
              </div>
            </div>
        </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
              disabled={loading || !formData.tip_description.trim()}
            className="flex-1" 
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Submitting..." : "Submit Tip"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
            </Button>
          )}
        </div>
      </form>
      </CardContent>
    </Card>
  );
};