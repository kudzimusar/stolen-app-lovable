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
  Shield,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PhotoUpload, DocumentUpload, InteractiveMap } from "@/components/shared";
import type { UploadedFile, UploadedDocument, MapLocation } from "@/components/shared";
import { getAuthToken } from "@/lib/auth";
import { lostFoundBlockchainService } from "@/lib/services/lost-found-blockchain-service";
import { BlockchainVerification } from "@/components/shared/blockchain/BlockchainVerification";

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
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnchoringToBlockchain, setIsAnchoringToBlockchain] = useState(false);
  const [blockchainResult, setBlockchainResult] = useState<any>(null);
  const [enableBlockchain, setEnableBlockchain] = useState(true);
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

      // Prepare report data with uploaded files and location
      const reportData = {
        report_type: reportType,
        device_category: formData.deviceName.split(' ')[0] || 'Unknown',
        device_model: formData.deviceName,
        serial_number: formData.serial || null,
        description: formData.description,
        location_lat: selectedLocation?.latitude || userLocation?.lat || null,
        location_lng: selectedLocation?.longitude || userLocation?.lng || null,
        location_address: selectedLocation?.address || formData.lastKnownLocation,
        incident_date: new Date().toISOString(),
        reward_amount: formData.reward ? parseFloat(formData.reward.replace(/[^0-9.]/g, '')) : null,
        contact_preferences: {
          method: formData.contactMethod,
          public: formData.publicPost
        },
        privacy_settings: {
          anonymous: false,
          location_precision: 'exact'
        },
        photos: uploadedPhotos.length > 0 
          ? uploadedPhotos.map(photo => photo.url) 
          : [],
        documents: uploadedDocuments.length > 0 
          ? uploadedDocuments.map(doc => doc.url) 
          : []
      };

      console.log('📋 Report data being sent:', {
        ...reportData,
        photosCount: reportData.photos.length,
        documentsCount: reportData.documents.length,
        contact: reportData.contact_preferences.method
      });

      // Get authentication token
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Please log in to submit a report');
      }

      // Submit to API
      const response = await fetch('/api/v1/lost-found/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      console.log('📤 API Response Status:', response.status);
      const result = await response.json();
      console.log('📤 API Response Data:', result);

      if (!result.success) {
        console.error('❌ Report submission failed:', result.error);
        throw new Error(result.error || 'Failed to submit report');
      }

      console.log('✅ Report submitted successfully! ID:', result.data?.id);
      console.log('📊 Data saved to Supabase:', {
        reportId: result.data?.id,
        type: result.data?.report_type,
        device: result.data?.device_model,
        location: result.data?.location_address,
        photos: result.data?.photos?.length || 0,
        documents: result.data?.documents?.length || 0
      });

      // Anchor to blockchain if enabled
      if (enableBlockchain && result.data?.id) {
        setIsAnchoringToBlockchain(true);
        try {
          const deviceData = {
            reportId: result.data.id,
            deviceId: `LF_${result.data.id}`,
            serialNumber: formData.serial || undefined,
            imeiNumber: undefined, // Could be extracted from device info
            deviceModel: formData.deviceName,
            deviceBrand: formData.deviceName.split(' ')[0] || 'Unknown',
            ownerAddress: '0x' + Math.random().toString(16).substr(2, 40), // Mock address
            reportType: reportType,
            location: {
              latitude: selectedLocation?.latitude || userLocation?.lat || 0,
              longitude: selectedLocation?.longitude || userLocation?.lng || 0,
              address: selectedLocation?.address || formData.lastKnownLocation
            },
            incidentDate: new Date().toISOString(),
            photos: uploadedPhotos.map(photo => photo.url),
            documents: uploadedDocuments.map(doc => doc.url),
            rewardAmount: formData.reward ? parseFloat(formData.reward.replace(/[^0-9.]/g, '')) : undefined,
            contactMethod: formData.contactMethod,
            isPublic: formData.publicPost
          };

          const blockchainResult = await lostFoundBlockchainService.anchorDeviceReport(deviceData);
          setBlockchainResult(blockchainResult);

          if (blockchainResult.success) {
            toast({
              title: "🔗 Device Anchored to Blockchain",
              description: `Your device record is now permanently secured on the blockchain. Transaction: ${blockchainResult.transactionHash?.substring(0, 10)}...`,
            });
          } else {
            toast({
              title: "⚠️ Blockchain Anchoring Failed",
              description: "Your report was saved but blockchain anchoring failed. You can retry later.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('❌ Blockchain anchoring failed:', error);
          toast({
            title: "⚠️ Blockchain Anchoring Failed",
            description: "Your report was saved but blockchain anchoring failed. You can retry later.",
            variant: "destructive"
          });
        } finally {
          setIsAnchoringToBlockchain(false);
        }
      }

      toast({
        title: `${reportType === "lost" ? "Lost" : "Found"} Device Reported`,
        description: `Your report has been submitted with ${uploadedPhotos.length} photos and ${uploadedDocuments.length} documents. ${result.matches || 0} potential matches found.`,
      });
      
      // Navigate to community board and force refresh
      navigate("/community-board");
      window.location.reload(); // Force refresh to show new data
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
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

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-md mx-auto space-y-4 pb-6">
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
              
              <InteractiveMap
                center={[-26.2041, 28.0473]} // Johannesburg, South Africa
                zoom={10}
                onLocationSelect={setSelectedLocation}
                enableSearch={true}
                enableGPS={true}
                enableLayers={true}
                height="300px"
                className="w-full"
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
            <Card className="p-3 space-y-3">
              <h3 className="font-semibold text-sm">Evidence & Photos</h3>
              
              <div className="space-y-4">
                {/* Device Photos */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Device Photos (Required)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Upload clear photos of your device from multiple angles
                  </p>
                  <div className="border-2 border-dashed rounded-lg p-3">
                    <PhotoUpload
                      onUpload={setUploadedPhotos}
                      variant="evidence"
                      multiple={true}
                      maxSize={10}
                      autoOptimize={true}
                      enableLocation={true}
                    />
                  </div>
                </div>
                
                {/* Police Report (Lost items only) */}
                {reportType === "lost" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Police Report (Optional)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Upload your official police report if you filed one
                    </p>
                    <div className="border-2 border-dashed rounded-lg p-3">
                      <DocumentUpload
                        onUpload={setUploadedDocuments}
                        variant="receipt"
                        multiple={false}
                        maxSize={5}
                        enableOCR={true}
                        autoExtract={true}
                      />
                    </div>
                  </div>
                )}
                
                {/* Additional Documents */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Additional Documents (Optional)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Upload purchase receipts, warranty documents, or proof of ownership
                  </p>
                  <div className="border-2 border-dashed rounded-lg p-3">
                    <DocumentUpload
                      onUpload={setUploadedDocuments}
                      variant="general"
                      multiple={true}
                      maxSize={5}
                      enableOCR={true}
                      autoExtract={true}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Blockchain Security Options */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Blockchain Security</h3>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Anchor to Blockchain</p>
                  <p className="text-sm text-muted-foreground">
                    Create an immutable record that cannot be tampered with
                  </p>
                </div>
                <Checkbox
                  checked={enableBlockchain}
                  onCheckedChange={(checked) => setEnableBlockchain(checked as boolean)}
                />
              </div>
              
              {enableBlockchain && (
                <div className="bg-primary/5 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Blockchain Benefits</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Permanent, tamper-proof record</li>
                    <li>• Verifiable ownership proof</li>
                    <li>• Enhanced security and trust</li>
                    <li>• Global accessibility</li>
                  </ul>
                </div>
              )}
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
              disabled={isLoading || isAnchoringToBlockchain || !formData.deviceName || !formData.lastKnownLocation}
            >
              {isLoading ? "Submitting..." : 
               isAnchoringToBlockchain ? "Anchoring to Blockchain..." :
               `Report ${reportType === "lost" ? "Lost" : "Found"} Device`}
            </Button>
            
            {/* Blockchain Status */}
            {blockchainResult && (
              <div className={`p-3 rounded-lg ${blockchainResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {blockchainResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {blockchainResult.success ? 'Blockchain Anchored' : 'Blockchain Failed'}
                  </span>
                </div>
                {blockchainResult.success && blockchainResult.transactionHash && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Transaction: {blockchainResult.transactionHash.substring(0, 20)}...
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LostFoundReport;