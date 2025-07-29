import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, Upload, MapPin, FileText } from "lucide-react";
import { TrustBadge } from "./TrustBadge";
import { useToast } from "@/hooks/use-toast";

export const DeviceRegistrationForm = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  const handleRegister = async () => {
    setIsRegistering(true);
    // Simulate registration process
    setTimeout(() => {
      setIsRegistering(false);
      toast({
        title: "Device Registered Successfully!",
        description: "Your device has been securely registered on the blockchain.",
      });
    }, 2000);
  };

  return (
    <Card className="p-8 bg-gradient-card backdrop-blur-sm border-0 shadow-card">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Register Your Device</h3>
          <p className="text-muted-foreground">Secure your device with blockchain verification</p>
          <div className="flex justify-center gap-2 mt-4">
            <TrustBadge type="blockchain" text="Blockchain Secured" />
            <TrustBadge type="verified" text="Instantly Verified" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceModel">Device Model</Label>
              <Input id="deviceModel" placeholder="iPhone 15 Pro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" placeholder="Enter serial number" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Device Description</Label>
            <Textarea 
              id="description" 
              placeholder="Additional details about your device..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <QrCode className="w-6 h-6" />
              <span className="text-sm">Scan QR Code</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Upload className="w-6 h-6" />
              <span className="text-sm">Upload Receipt</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MapPin className="w-6 h-6" />
              <span className="text-sm">Add Location</span>
            </Button>
          </div>

          <Button 
            variant="hero" 
            size="lg" 
            className="w-full"
            onClick={handleRegister}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering on Blockchain...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Register Device
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};