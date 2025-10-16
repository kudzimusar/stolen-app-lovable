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
import { getAuthToken } from "@/lib/auth";
import { Loader2, Download } from "lucide-react";
import { 
  Smartphone, 
  Package, 
  Clock, 
  DollarSign, 
  Camera,
  CheckCircle,
  Zap,
  Flame as Fire,
  Calendar,
  Shield,
  Award
} from "lucide-react";

const ListMyDevice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [price, setPrice] = useState("");
  const [isHotDeal, setIsHotDeal] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [registeredDevices, setRegisteredDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "List My Device | STOLEN";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.setAttribute('content', 'List your registered devices for sale with pre-filled details and blockchain verification.');
    
    fetchUserDevices();
  }, []);

  const fetchUserDevices = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your devices.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      console.log('🔍 Fetching user devices...');
      const response = await fetch('/api/v1/devices/my-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Raw API Response:', result);
        
        if (result.success && result.devices) {
          console.log('📱 Raw Devices Data:', result.devices);
          console.log('📱 First Device Sample:', result.devices[0]);
          // Transform the device data to match the expected format
          const transformedDevices = result.devices.map((device: any, index: number) => {
            console.log(`🔄 Transforming device ${index + 1}:`, device);
            
            // Calculate warranty months from expiry date if not provided
            let warrantyMonths = device.warranty_months;
            if (!warrantyMonths && device.warranty_expiry_date) {
              const expiryDate = new Date(device.warranty_expiry_date);
              const now = new Date();
              if (expiryDate > now) {
                warrantyMonths = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
              } else {
                warrantyMonths = 0; // Expired
              }
            }
            
            // Format registration date
            let formattedRegistrationDate = device.registration_date;
            if (device.registration_date) {
              try {
                const date = new Date(device.registration_date);
                formattedRegistrationDate = date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
              } catch (e) {
                console.warn('Invalid registration date:', device.registration_date);
                formattedRegistrationDate = device.registration_date;
              }
            }
            
            const transformedDevice = {
              id: device.id,
              name: device.name || device.device_name || `${device.brand} ${device.model}`,
              model: device.storage_capacity 
                ? `${device.brand} ${device.model} ${device.storage_capacity}`
                : `${device.brand} ${device.model}`,
              serial: device.serial || device.serial_number,
              estimatedValue: device.purchasePrice || device.purchase_price || 0,
              registrationDate: device.registrationDate || formattedRegistrationDate,
              condition: device.device_condition || getDeviceCondition(device),
              photos: device.photos || device.device_photos || [],
              documents: {
                proofOfPurchase: device.proof_of_purchase_url || device.receiptUrl || device.receipt_url,
                userIdentity: device.user_identity_url,
                warranty: device.warranty_document_url,
                registrationCertificate: device.registration_certificate_url
              },
              repairHistory: [], // TODO: Add repair history from database
              warrantyMonths: device.warranty_months !== undefined ? device.warranty_months : (warrantyMonths !== undefined ? warrantyMonths : getWarrantyMonths(device)),
              warrantyExpiryDate: device.warranty_expiry_date || device.warrantyExpiry,
              blockchainHash: device.blockchainHash || device.blockchain_hash,
              status: device.status,
              storageCapacity: device.storage_capacity,
              // Additional fields for listing form
              brand: device.brand,
              deviceType: device.device_type,
              color: device.color,
              imei: device.imei,
              purchaseDate: device.purchaseDate || device.purchase_date,
              currentValue: device.currentValue || device.current_value || device.purchase_price || 0,
              insuranceStatus: device.insuranceStatus || device.insurance_status || 'unknown',
              location: device.location || device.location_address || device.last_seen_location,
              transfers: device.transfers || device.transfer_count || 0,
              photoCount: device.photoCount || device.photo_count || (device.photos?.length || device.device_photos?.length || 0)
            };
            
            console.log(`✅ Transformed device ${index + 1}:`, transformedDevice);
            return transformedDevice;
          });
          
          console.log('🎯 Final transformed devices:', transformedDevices);
          setRegisteredDevices(transformedDevices);
        } else {
          console.warn('No devices found or API error:', result);
          setRegisteredDevices([]);
        }
      } else {
        throw new Error('Failed to fetch devices');
      }
    } catch (error) {
      console.error('Error fetching user devices:', error);
      toast({
        title: "Error Loading Devices",
        description: "Failed to load your registered devices. Please try again.",
        variant: "destructive"
      });
      setRegisteredDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceCondition = (device: any): string => {
    // Simple condition logic based on device age and status
    const registrationDate = new Date(device.registration_date);
    const ageInMonths = (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (ageInMonths < 3) return "Excellent";
    if (ageInMonths < 12) return "Very Good";
    if (ageInMonths < 24) return "Good";
    return "Fair";
  };

  const getWarrantyMonths = (device: any): number => {
    // Simple warranty logic - could be enhanced with real warranty data
    const registrationDate = new Date(device.registration_date);
    const ageInMonths = (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const totalWarranty = 12; // Default 12 months warranty
    return Math.max(0, totalWarranty - Math.floor(ageInMonths));
  };


  const handlePublishListing = async () => {
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

    try {
      const token = await getAuthToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a listing.",
          variant: "destructive"
        });
        return;
      }

      // Create marketplace listing
      const listingData = {
        device_id: selectedDevice.id,
        title: `${selectedDevice.name} - ${selectedDevice.model}`,
        description: description || `Well-maintained ${selectedDevice.name} in ${selectedDevice.condition.toLowerCase()} condition. Blockchain verified and ready for sale.`,
        price: parseFloat(price),
        currency: 'ZAR',
        condition_rating: getConditionRating(selectedDevice.condition),
        warranty_remaining_months: selectedDevice.warrantyMonths,
        negotiable: true,
        featured: isHotDeal,
        status: 'active'
      };

      console.log('📝 Listing data being sent:', listingData);

      const response = await fetch('/api/v1/marketplace/create-listing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Listing Created!",
          description: `Your ${selectedDevice.name} is now listed on the marketplace.`,
        });

        if (isHotDeal) {
          navigate('/marketplace?tab=hot-deals');
        } else {
          navigate('/marketplace');
        }
      } else {
        const errorData = await response.json();
        console.error('Listing creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to create listing: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error Creating Listing",
        description: "Failed to create your listing. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getConditionRating = (condition: string): number => {
    switch (condition.toLowerCase()) {
      case 'excellent': return 5;
      case 'very good': return 4;
      case 'good': return 3;
      case 'fair': return 2;
      default: return 3;
    }
  };

  const hashSerialNumber = (serial: string): string => {
    if (!serial || serial.length < 4) return '****';
    const visibleStart = serial.slice(0, 2);
    const visibleEnd = serial.slice(-2);
    const maskedMiddle = '*'.repeat(Math.min(serial.length - 4, 8));
    return `${visibleStart}${maskedMiddle}${visibleEnd}`;
  };

  // Use only real devices (no more mock data needed)
  const allDevices = registeredDevices.map(device => ({ ...device, isMock: false }));

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

            {loading ? (
              <Card className="p-8 text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-muted-foreground animate-spin" />
                <div>
                  <h3 className="font-semibold mb-2">Loading Your Devices</h3>
                  <p className="text-muted-foreground">
                    Fetching your registered devices...
                  </p>
                </div>
              </Card>
            ) : allDevices.length === 0 ? (
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
                {allDevices.map((device) => (
                  <Card 
                    key={device.id}
                    className="p-6 cursor-pointer hover:shadow-card transition-all border-2 hover:border-primary/50"
                    onClick={() => {
                      console.log('🎯 Device selected for listing:', device);
                      setSelectedDevice(device);
                      setPrice(device.currentValue ? device.currentValue.toString() : device.estimatedValue.toString());
                      setDescription(`Well-maintained ${device.name} in ${device.condition.toLowerCase()} condition. ${device.storageCapacity ? `Storage: ${device.storageCapacity}. ` : ''}${device.warrantyMonths > 0 ? `Warranty: ${device.warrantyMonths} months remaining. ` : ''}Blockchain verified and ready for sale.`);
                      setPhotos(device.photos || []);
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{device.name}</h3>
                          </div>
                          <p className="text-muted-foreground">{device.model}</p>
                          <p className="text-xs text-muted-foreground font-mono">Serial: {hashSerialNumber(device.serial)}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {device.blockchainHash ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Blockchain Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Verification
                            </Badge>
                          )}
                        </div>
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
                        <span>Registered {device.registrationDate ? new Date(device.registrationDate).toISOString().split('T')[0] : 'Not specified'}</span>
                      </div>
                      
                      {device.transfers > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Package className="w-3 h-3" />
                          <span>{device.transfers} transfer{device.transfers > 1 ? 's' : ''}</span>
                        </div>
                      )}
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
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{selectedDevice.name}</h3>
                </div>
                <p className="text-muted-foreground">{selectedDevice.model}</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedDevice.blockchainHash ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Blockchain Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Verification
                    </Badge>
                  )}
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

            {/* Device Photos from Registration */}
            <div>
              <Label htmlFor="photos" className="text-base font-semibold">Device Photos</Label>
              <p className="text-sm text-muted-foreground mb-3">Photos uploaded during device registration</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {selectedDevice.photos && selectedDevice.photos.length > 0 ? (
                  selectedDevice.photos.map((photo: string, index: number) => (
                    <img 
                      key={index}
                      src={photo} 
                      alt={`${selectedDevice.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))
                ) : (
                  <div className="col-span-2 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
                    <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No photos uploaded during registration</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ownership Documents */}
            <div>
              <Label className="text-base font-semibold">Ownership Documents</Label>
              <p className="text-sm text-muted-foreground mb-3">Documents uploaded during device registration</p>
              <div className="space-y-3">
                {selectedDevice.documents.proofOfPurchase && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Proof of Purchase</p>
                        <p className="text-sm text-green-600">Receipt uploaded</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedDevice.documents.proofOfPurchase, '_blank')}>
                      View
                    </Button>
                  </div>
                )}

                {selectedDevice.documents.userIdentity && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Identity Verification</p>
                        <p className="text-sm text-blue-600">ID document uploaded</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedDevice.documents.userIdentity, '_blank')}>
                      View
                    </Button>
                  </div>
                )}

                {selectedDevice.documents.warranty && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-800">Warranty Document</p>
                        <p className="text-sm text-purple-600">Warranty certificate uploaded</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedDevice.documents.warranty, '_blank')}>
                      View
                    </Button>
                  </div>
                )}

                {selectedDevice.documents.registrationCertificate && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-orange-800">Registration Certificate</p>
                        <p className="text-sm text-orange-600">Previous registration proof</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedDevice.documents.registrationCertificate, '_blank')}>
                      View
                    </Button>
                  </div>
                )}

                {!selectedDevice.documents.proofOfPurchase && !selectedDevice.documents.userIdentity && !selectedDevice.documents.warranty && !selectedDevice.documents.registrationCertificate && (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <Shield className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No ownership documents uploaded during registration</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer History */}
            <div>
              <Label className="text-base font-semibold">Transfer History</Label>
              <p className="text-sm text-muted-foreground mb-3">Ownership transfer history for this device</p>
              <div className="space-y-2">
                {selectedDevice.transfers > 0 ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">{selectedDevice.transfers} Transfer{selectedDevice.transfers > 1 ? 's' : ''}</p>
                        <p className="text-sm text-blue-600">Device has changed ownership</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      Verified
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Original Owner</p>
                        <p className="text-sm text-green-600">No previous transfers</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      First Owner
                    </Badge>
                  </div>
                )}
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
                  <p className="font-mono">{hashSerialNumber(selectedDevice.serial)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Storage Capacity</p>
                  <p>{selectedDevice.storageCapacity || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Device Condition</p>
                  <p>{selectedDevice.condition}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Warranty Remaining</p>
                  <p>{selectedDevice.warrantyMonths > 0 ? `${selectedDevice.warrantyMonths} months` : 'No warranty'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registration Date</p>
                  <p>{selectedDevice.registrationDate ? new Date(selectedDevice.registrationDate).toISOString().split('T')[0] : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Blockchain Status</p>
                  <p className={selectedDevice.blockchainHash ? 'text-green-600' : 'text-yellow-600'}>
                    {selectedDevice.blockchainHash ? 'Verified' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Certificate</p>
                  <p className="text-blue-600">
                    <Link 
                      to={`/device/${selectedDevice.id}/certificate`}
                      className="hover:underline flex items-center gap-1"
                      target="_blank"
                    >
                      <Download className="w-3 h-3" />
                      View Certificate
                    </Link>
                  </p>
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