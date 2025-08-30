import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Upload,
  AlertTriangle,
  Search,
  Camera,
  FileText,
  Shield
} from "lucide-react";
import Map from "@/components/ui/Map";
import { useToast } from "@/hooks/use-toast";

const LostFoundReport = () => {
  const [reportType, setReportType] = useState<"lost" | "found">("lost");
  const [formData, setFormData] = useState({
    deviceName: "",
    serial: "",
    lastKnownLocation: "",
    description: "",
    contactMethod: "",
    reward: "",
    policeReport: false,
    publicPost: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get user's current location if available
      let userLocation = null;
      if (navigator.geolocation) {
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

      // Prepare report data
      const reportData = {
        report_type: reportType,
        device_category: formData.deviceName.split(' ')[0] || 'Unknown', // Extract category from device name
        device_model: formData.deviceName,
        serial_number: formData.serial || null,
        description: formData.description,
        location_lat: userLocation?.lat || null,
        location_lng: userLocation?.lng || null,
        location_address: formData.lastKnownLocation,
        incident_date: new Date().toISOString(),
        reward_amount: formData.reward ? parseFloat(formData.reward.replace(/[^0-9.]/g, '')) : null,
        contact_preferences: {
          method: formData.contactMethod,
          public: formData.publicPost
        },
        privacy_settings: {
          anonymous: false,
          location_precision: 'approximate'
        }
      };

      // Submit to API
      const response = await fetch('/api/v1/lost-found/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(reportData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit report');
      }

      toast({
        title: `${reportType === "lost" ? "Lost" : "Found"} Device Reported`,
        description: `Your report has been submitted to the community. ${result.matches} potential matches found.`,
      });
      
      navigate("/lost-found-board");
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <AlertTriangle className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Report Device</h1>
            <p className="text-muted-foreground">
              Help the community recover lost devices
            </p>
          </div>

          {/* Report Type Selection */}
          <Card className="p-4">
            <Label className="text-base font-semibold">Report Type</Label>
            <RadioGroup 
              value={reportType} 
              onValueChange={(value) => setReportType(value as "lost" | "found")}
              className="mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  I lost my device
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-success" />
                  I found a device
                </Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Device Information */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Device Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name/Model</Label>
                <Input
                  id="deviceName"
                  placeholder="e.g., iPhone 15 Pro, Samsung Galaxy S24"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serial">Serial/IMEI Number (if known)</Label>
                <Input
                  id="serial"
                  placeholder="Enter serial or IMEI"
                  value={formData.serial}
                  onChange={(e) => setFormData({...formData, serial: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder={reportType === "lost" 
                    ? "Describe your device (color, case, unique markings)..." 
                    : "Where did you find it? Any visible details..."
                  }
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
            </Card>

            {/* Location */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Location Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="location">
                  {reportType === "lost" ? "Last Known Location" : "Found Location"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Enter address or landmark"
                    value={formData.lastKnownLocation}
                    onChange={(e) => setFormData({...formData, lastKnownLocation: e.target.value})}
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Map 
                center={[-26.2041, 28.0473]} // Johannesburg, South Africa
                zoom={10}
                markers={[
                  {
                    position: [-26.2041, 28.0473],
                    popup: "Click to mark location"
                  }
                ]}
                className="h-48 w-full"
              />
            </Card>

            {/* Additional Information */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Additional Information</h3>
              
              {reportType === "lost" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reward">Reward Amount (Optional)</Label>
                    <Input
                      id="reward"
                      placeholder="e.g., R500"
                      value={formData.reward}
                      onChange={(e) => setFormData({...formData, reward: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="policeReport"
                      checked={formData.policeReport}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, policeReport: checked as boolean})
                      }
                    />
                    <Label htmlFor="policeReport" className="text-sm">
                      I have filed a police report
                    </Label>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Method</Label>
                <Input
                  id="contact"
                  placeholder={reportType === "lost" 
                    ? "How should finders contact you?" 
                    : "How should the owner contact you?"
                  }
                  value={formData.contactMethod}
                  onChange={(e) => setFormData({...formData, contactMethod: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publicPost"
                  checked={formData.publicPost}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, publicPost: checked as boolean})
                  }
                />
                <Label htmlFor="publicPost" className="text-sm">
                  Post to public community board
                </Label>
              </div>
            </Card>

            {/* Evidence Upload */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Evidence & Photos</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="h-20 flex-col gap-2">
                  <Camera className="w-5 h-5" />
                  <span className="text-xs">Add Photos</span>
                </Button>
                
                {reportType === "lost" && (
                  <Button type="button" variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">Police Report</span>
                  </Button>
                )}
                
                <Button type="button" variant="outline" className="h-20 flex-col gap-2">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Upload Docs</span>
                </Button>
              </div>
            </Card>

            {/* Privacy Notice */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Privacy Protected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your personal information is encrypted and only shared with verified community members
                when necessary for device recovery.
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !formData.deviceName || !formData.lastKnownLocation}
            >
              {isLoading ? "Submitting..." : `Report ${reportType === "lost" ? "Lost" : "Found"} Device`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LostFoundReport;