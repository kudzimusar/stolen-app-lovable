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
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Package, 
  Clock, 
  DollarSign, 
  Camera,
  CheckCircle,
  Zap,
  Flame as Fire,
  Calendar
} from "lucide-react";

const ListMyDevice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [price, setPrice] = useState("");
  const [isHotDeal, setIsHotDeal] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    document.title = "List My Device | STOLEN";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.setAttribute('content', 'List your registered devices for sale with pre-filled details and blockchain verification.');
  }, []);

  // Mock registered devices - in real app would come from API
  const registeredDevices = [
    { 
      id: 1, 
      name: "iPhone 15 Pro Max", 
      model: "256GB Natural Titanium", 
      serial: "ABC123456789", 
      estimatedValue: 18999,
      registrationDate: "2024-01-15",
      condition: "Excellent",
      photos: ["https://placehold.co/200x150?text=iPhone+Front", "https://placehold.co/200x150?text=iPhone+Back"],
      repairHistory: [],
      warrantyMonths: 8
    },
    { 
      id: 2, 
      name: "MacBook Pro M3", 
      model: "14-inch 512GB Space Black", 
      serial: "DEF987654321", 
      estimatedValue: 32999,
      registrationDate: "2023-11-20",
      condition: "Like New",
      photos: ["https://placehold.co/200x150?text=MacBook+Open", "https://placehold.co/200x150?text=MacBook+Closed"],
      repairHistory: [],
      warrantyMonths: 10
    },
    { 
      id: 3, 
      name: "Samsung Galaxy S24 Ultra", 
      model: "512GB Titanium Black", 
      serial: "GHI456789123", 
      estimatedValue: 14999,
      registrationDate: "2024-02-10",
      condition: "Good",
      photos: ["https://placehold.co/200x150?text=Galaxy+Front", "https://placehold.co/200x150?text=Galaxy+Back"],
      repairHistory: [{ date: "2024-06-15", description: "Screen protector replacement" }],
      warrantyMonths: 6
    },
    { 
      id: 4, 
      name: "iPad Pro 12.9", 
      model: "256GB Wi-Fi Space Gray", 
      serial: "JKL123789456", 
      estimatedValue: 16999,
      registrationDate: "2023-12-05",
      condition: "Excellent",
      photos: ["https://placehold.co/200x150?text=iPad+Front", "https://placehold.co/200x150?text=iPad+Back"],
      repairHistory: [],
      warrantyMonths: 12
    }
  ];

  const handlePublishListing = () => {
    if (!selectedDevice) {
      toast({
        title: "Please select a device",
        description: "Choose one of your registered devices to create a listing.",
        variant: "destructive"
      });
      return;
    }

    if (!price) {
      toast({
        title: "Set a price",
        description: "Please enter a price for your device.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Listing Created!",
      description: `Your ${selectedDevice.name} is now listed on the marketplace.`,
    });

    // In real app, would submit to API
    if (isHotDeal) {
      navigate('/marketplace?tab=hot-deals');
    } else {
      navigate('/marketplace');
    }
  };

  if (!selectedDevice) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="List My Device" showBackButton backTo="/" />
        
        <main className="container-responsive spacing-responsive pb-20">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Package className="w-4 h-4" />
                <span className="font-medium">Registered Devices</span>
              </div>
              <h1 className="text-2xl font-bold">Choose Device to List</h1>
              <p className="text-muted-foreground">
                Select from your registered devices with pre-verified details and blockchain proof
              </p>
            </div>

            {registeredDevices.length === 0 ? (
              <Card className="p-8 text-center space-y-4">
                <Smartphone className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold mb-2">No Registered Devices</h3>
                  <p className="text-muted-foreground mb-4">
                    You need to register your devices first before listing them for sale.
                  </p>
                  <Button asChild>
                    <Link to="/device/register">Register Device</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {registeredDevices.map((device) => (
                  <Card 
                    key={device.id}
                    className="p-6 cursor-pointer hover:shadow-card transition-all border-2 hover:border-primary/50"
                    onClick={() => {
                      setSelectedDevice(device);
                      setPrice(device.estimatedValue.toString());
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{device.name}</h3>
                          <p className="text-muted-foreground">{device.model}</p>
                          <p className="text-xs text-muted-foreground">Serial: {device.serial}</p>
                        </div>
                        <Badge variant="secondary" className="bg-verified/10 text-verified">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Condition</p>
                          <p className="font-medium">{device.condition}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Warranty</p>
                          <p className="font-medium">{device.warrantyMonths}mo</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Est. Value</p>
                          <p className="font-semibold text-primary">R{device.estimatedValue.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Registered {new Date(device.registrationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Don't see your device? Register it first to get blockchain verification.
              </p>
              <Button variant="outline" asChild>
                <Link to="/device/register">Register New Device</Link>
              </Button>
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
        title="Create Listing" 
        showBackButton 
        backTo="/list-my-device" 
      />
      
      <main className="container-responsive spacing-responsive pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Selected Device Summary */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedDevice.name}</h3>
                <p className="text-muted-foreground">{selectedDevice.model}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-verified/10 text-verified">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Blockchain Verified
                  </Badge>
                  <Badge variant="outline">{selectedDevice.condition}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Listing Form */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="price" className="text-base font-semibold">Set Your Price</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-10 text-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated value: R{selectedDevice.estimatedValue.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Fire className="w-4 h-4 text-orange-500" />
                  List as Hot Deal
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get more visibility with urgency tags for faster sales
                </p>
              </div>
              <Switch 
                checked={isHotDeal}
                onCheckedChange={setIsHotDeal}
              />
            </div>

            <div>
              <Label htmlFor="photos" className="text-base font-semibold">Additional Photos (Optional)</Label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {selectedDevice.photos.map((photo: string, index: number) => (
                  <img 
                    key={index}
                    src={photo} 
                    alt={`${selectedDevice.name} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                ))}
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <Camera className="w-6 h-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Add more photos</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-semibold">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any additional details about your device, accessories included, or special terms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Pre-filled Information Display */}
            <Card className="p-4 bg-muted/30">
              <h4 className="font-medium mb-3">Included in Your Listing</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Serial Number</p>
                  <p className="font-mono">{selectedDevice.serial}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Warranty Remaining</p>
                  <p>{selectedDevice.warrantyMonths} months</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Repair History</p>
                  <p>{selectedDevice.repairHistory.length === 0 ? "No repairs" : `${selectedDevice.repairHistory.length} repairs`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registration Date</p>
                  <p>{new Date(selectedDevice.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handlePublishListing}
              className="w-full"
              size="lg"
            >
              {isHotDeal ? (
                <>
                  <Fire className="w-4 h-4 mr-2" />
                  Publish Hot Deal
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Publish Listing
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span>Blockchain verification included automatically</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ListMyDevice;