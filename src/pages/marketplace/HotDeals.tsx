import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import UrgencyBoost from "@/components/marketplace/UrgencyBoost";
import AutoRelistOptions from "@/components/marketplace/AutoRelistOptions";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Flame as Fire, 
  Plus, 
  Zap, 
  DollarSign, 
  MessageCircle,
  Camera,
  QrCode,
  MapPin,
  Calendar
} from "lucide-react";

const HotDeals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entryMode, setEntryMode] = useState<'selection' | 'registered' | 'quick'>('selection');
  const [price, setPrice] = useState("");
  const [openToOffers, setOpenToOffers] = useState(false);
  const [urgencyTag, setUrgencyTag] = useState("48-hours");
  const [description, setDescription] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Hot Deals | STOLEN";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.setAttribute('content', 'Create quick sale listings for immediate offers. Fast deals for time-sensitive device sales on STOLEN marketplace.');
  }, []);

  // Mock registered devices - in real app would come from API
  const registeredDevices = [
    { id: 1, name: "iPhone 15 Pro Max", model: "256GB Natural Titanium", serial: "ABC123456789", estimatedValue: 18999 },
    { id: 2, name: "MacBook Pro M3", model: "14-inch 512GB", serial: "DEF987654321", estimatedValue: 32999 },
    { id: 3, name: "Samsung Galaxy S24 Ultra", model: "512GB Titanium Black", serial: "GHI456789123", estimatedValue: 14999 }
  ];

  const urgencyOptions = [
    { value: "today-only", label: "Today Only", color: "bg-destructive text-destructive-foreground" },
    { value: "48-hours", label: "48 Hours", color: "bg-orange-500 text-white" },
    { value: "1-week", label: "1 Week", color: "bg-primary text-primary-foreground" },
    { value: "negotiable", label: "Negotiable", color: "bg-muted text-muted-foreground" }
  ];

  const handleSubmitHotDeal = () => {
    if (entryMode === 'registered' && !deviceName) {
      toast({
        title: "Please select a device",
        description: "Choose one of your registered devices to create a hot deal.",
        variant: "destructive"
      });
      return;
    }

    if (entryMode === 'quick' && (!deviceName || !serialNumber)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required device details.",
        variant: "destructive"
      });
      return;
    }

    if (!openToOffers && !price) {
      toast({
        title: "Set a price",
        description: "Please set a price or enable 'Open to Offers'.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Hot Deal Created!",
      description: "Your device is now listed in the Hot Deals feed.",
    });

    // In real app, would submit to API
    navigate('/hot-deals-feed');
  };

  if (entryMode === 'selection') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Hot Deals" showBackButton backTo="/marketplace" />
        
        <main className="container-responsive spacing-responsive pb-20">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Fire className="w-4 h-4" />
                <span className="font-medium">Quick Sale Mode</span>
              </div>
              <h1 className="text-2xl font-bold">Create a Hot Deal</h1>
              <p className="text-muted-foreground">
                List your device for immediate sale with urgency tags to attract active buyers
              </p>
            </div>

            <div className="grid gap-4">
              <Card 
                className="p-6 cursor-pointer hover:shadow-card transition-all border-2 hover:border-primary/50"
                onClick={() => setEntryMode('registered')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">From My Registered Devices</h3>
                    <p className="text-muted-foreground text-sm">
                      Quick listing with pre-filled details from your registered devices
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-card transition-all border-2 hover:border-primary/50"
                onClick={() => setEntryMode('quick')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">New Device Quick Entry</h3>
                    <p className="text-muted-foreground text-sm">
                      Enter basic specs and create a fast listing for any device
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="pt-4">
              <Link to="/hot-deals-feed">
                <Button variant="outline" className="w-full">
                  Browse Hot Deals Instead
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title={entryMode === 'registered' ? "Hot Deal - Registered Device" : "Hot Deal - Quick Entry"} 
        showBackButton 
        backTo="/hot-deals" 
      />
      
      <main className="container-responsive spacing-responsive pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {entryMode === 'registered' && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Device to List</Label>
              <div className="grid gap-3">
                {registeredDevices.map((device) => (
                  <Card 
                    key={device.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      deviceName === device.name 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setDeviceName(device.name);
                      setPrice(device.estimatedValue.toString());
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{device.name}</h4>
                        <p className="text-sm text-muted-foreground">{device.model}</p>
                        <p className="text-xs text-muted-foreground">Serial: {device.serial}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R{device.estimatedValue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Est. value</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {entryMode === 'quick' && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="device-name">Device Name *</Label>
                  <Input
                    id="device-name"
                    placeholder="e.g., iPhone 15 Pro Max 256GB"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="serial">Serial Number / IMEI *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="serial"
                      placeholder="Enter serial number or IMEI"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Device Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-2">
                    <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Add photos to increase buyer confidence
                    </p>
                    <Button variant="outline" size="sm">
                      Upload Photos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-base">Open to Offers</Label>
                <p className="text-sm text-muted-foreground">
                  Let buyers make their best offer
                </p>
              </div>
              <Switch 
                checked={openToOffers}
                onCheckedChange={setOpenToOffers}
              />
            </div>

            {!openToOffers && (
              <div>
                <Label htmlFor="price">Set Price (ZAR)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-base mb-3 block">Urgency Tag</Label>
              <div className="grid grid-cols-2 gap-2">
                {urgencyOptions.map((option) => (
                  <Card
                    key={option.value}
                    className={`p-3 cursor-pointer transition-all border-2 ${
                      urgencyTag === option.value 
                        ? 'border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setUrgencyTag(option.value)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Additional Details (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any specific details about condition, accessories, or sale terms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-6">
            <Button 
              onClick={handleSubmitHotDeal}
              className="w-full"
              size="lg"
            >
              <Fire className="w-4 h-4 mr-2" />
              Create Hot Deal
            </Button>
            
            <UrgencyBoost onBoostApplied={(type) => console.log('Boost applied:', type)} />
            
            <AutoRelistOptions onSettingsChange={(settings) => console.log('Auto-relist settings:', settings)} />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Your listing will appear in Hot Deals feed immediately</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HotDeals;