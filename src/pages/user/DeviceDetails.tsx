import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { deviceLocationService, DeviceLocationData } from "@/services/device-location-service";
import { supabase } from "@/integrations/supabase/client";
import { getAuthToken } from "@/lib/auth";
import { notificationService } from "@/lib/services/notification-service";
import {
  ArrowLeft,
  Shield,
  MapPin,
  Calendar,
  DollarSign,
  History,
  AlertTriangle,
  Smartphone,
  Share2,
  Download,
  Loader2,
  ExternalLink,
  Edit
} from "lucide-react";

// Utility function to hash serial numbers for security (reused from Lost & Found feature)
const hashSerialNumber = (serial: string): string => {
  if (!serial) return "Not available";
  // Show first 4 and last 4 characters with asterisks in between
  if (serial.length <= 8) return serial;
  return `${serial.substring(0, 4)}****${serial.substring(serial.length - 4)}`;
};

interface Device {
  id: string;
  device_name: string;
  brand: string;
  model: string;
  serial_number: string;
  status: string;
  purchase_date?: string;
  purchase_price?: number;
  last_seen_location?: string;
  registration_location_address?: string;
  registration_location_lat?: number;
  registration_location_lng?: number;
  last_seen_location_lat?: number;
  last_seen_location_lng?: number;
  color?: string;
  registration_date: string;
  device_photos?: string[];
  blockchain_hash?: string;
  blockchain_verified?: boolean;
  insurance_policy_id?: string;
  current_owner_id: string;
  user_identity_url?: string;
  warranty_document_url?: string;
  registration_certificate_url?: string;
  receipt_url?: string;
}

interface RepairHistory {
  id: string;
  date: string;
  shop: string;
  issue: string;
  cost: string;
  verified: boolean;
}

interface OwnershipHistory {
  date: string;
  event: string;
  details: string;
  verified: boolean;
}

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [device, setDevice] = useState<Device | null>(null);
  const [repairHistory, setRepairHistory] = useState<RepairHistory[]>([]);
  const [ownershipHistory, setOwnershipHistory] = useState<OwnershipHistory[]>([]);
  const [locationData, setLocationData] = useState<DeviceLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDeviceDetails();
      loadLocationData();
    }
  }, [id]);

  const loadLocationData = async () => {
    if (!id) return;
    
    try {
      setLocationLoading(true);
      const location = await deviceLocationService.getCurrentDeviceLocation(id);
      setLocationData(location);
    } catch (error) {
      console.error('Error loading location data:', error);
      setLocationData(null);
    } finally {
      setLocationLoading(false);
    }
  };

  const updateLocation = async () => {
    if (!id) return;
    
    try {
      setLocationLoading(true);
      const newLocation = await deviceLocationService.updateDeviceLocationWithGPS(id);
      setLocationData(newLocation);
      toast({
        title: "Location Updated",
        description: `Device location updated to ${deviceLocationService.formatLocationForDisplay(newLocation)}`,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Location Update Failed",
        description: "Failed to update device location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchDeviceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      // Fetch device details
      const { data: deviceData, error: deviceError } = await supabase
        .from('devices')
        .select(`
          id, device_name, brand, model, serial_number, status,
          purchase_date, purchase_price, last_seen_location, color,
          registration_date, device_photos, blockchain_hash,
          insurance_policy_id, current_owner_id, receipt_url
        `)
        .eq('id', id)
        .single();

      if (deviceError) {
        throw new Error(`Failed to fetch device: ${deviceError.message}`);
      }

      if (!deviceData) {
        throw new Error('Device not found');
      }

      setDevice(deviceData as Device);

      // Fetch ownership history
      const { data: ownershipData, error: ownershipError } = await supabase
        .from('ownership_history')
        .select(`
          id, transfer_type, verified, blockchain_hash,
          new_owner_id, previous_owner_id
        `)
        .eq('device_id', id)
        .order('id', { ascending: false });

      if (!ownershipError && ownershipData) {
        const formattedOwnership = ownershipData.map(record => ({
          date: new Date().toLocaleDateString(), // Use current date as fallback
          event: record.transfer_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          details: `Transferred to ${record.new_owner_id} ${record.verified ? '(Verified)' : '(Pending)'}`,
          verified: record.verified
        }));
        setOwnershipHistory(formattedOwnership);
      }

      // Mock repair history for now (can be connected to repair system later)
      setRepairHistory([
        {
          id: "1",
          date: new Date().toLocaleDateString(),
          shop: "STOLEN Platform",
          issue: "Initial registration",
          cost: "Free",
          verified: true
        }
      ]);

    } catch (error) {
      console.error('Error fetching device details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load device details');
      toast({
        title: "Error Loading Device",
        description: error instanceof Error ? error.message : "Failed to load device details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-destructive">{error || 'Device not found'}</p>
          <Button onClick={() => navigate('/my-devices')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Devices
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <TrustBadge type="secure" text="Active & Verified" />;
      case "verified":
        return <TrustBadge type="secure" text="Verified Clean" />;
      case "stolen":
        return <Badge variant="destructive">Reported Stolen</Badge>;
      case "lost":
        return <Badge variant="secondary">Reported Lost</Badge>;
      case "needs-attention":
        return <Badge variant="secondary">Needs Attention</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">Status: {status || 'Active'}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/my-devices">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <STOLENLogo />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                if (device.blockchain_hash && device.blockchain_hash.startsWith('0x')) {
                  window.open(`https://mumbai.polygonscan.com/tx/${device.blockchain_hash}`, '_blank');
                } else {
                  // Fallback: share device info
                  const shareData = {
                    title: `${device.device_name} - STOLEN Verified Device`,
                    text: `Check out my verified device: ${device.brand} ${device.model} - Secured on blockchain`,
                    url: window.location.href
                  };
                  if (navigator.share) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link Copied",
                      description: "Device link copied to clipboard",
                    });
                  }
                }
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6">
        {/* Device Overview */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">{device.device_name}</h1>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/device/${id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Device
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div></div>
                {getStatusBadge(device.status)}
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{device.brand} • {device.model}</p>
                <p className="font-mono">{hashSerialNumber(device.serial_number)}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Registered {new Date(device.registration_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {locationData ? deviceLocationService.formatLocationForDisplay(locationData) : 'Location not specified'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={updateLocation}
                    disabled={locationLoading}
                    className="h-6 w-6 p-0 ml-1"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <MapPin className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to={`/device/${device.id}/certificate`}>
              <Download className="w-5 h-5" />
              <span className="text-xs">Download Certificate</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to={`/lost-found-report?deviceId=${device.id}&reportType=lost`}>
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs">Report Issue</span>
            </Link>
          </Button>
        </div>

        {/* Device Information Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="repairs">Repairs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold">Device Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span>{device.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span>{device.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serial Number:</span>
                  <span className="font-mono">{hashSerialNumber(device.serial_number)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Date:</span>
                  <span>{device.purchase_date ? new Date(device.purchase_date).toLocaleDateString() : 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <span>{device.purchase_price ? `R${device.purchase_price.toLocaleString()}` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color:</span>
                  <span>{device.color || 'Not specified'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="font-semibold">Security Features</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blockchain Verification</span>
                  {device.blockchain_hash ? (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  ) : (
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Insurance Linked</span>
                  {device.insurance_policy_id ? (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">Linked</span>
                    </div>
                  ) : (
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Location Tracking</span>
                  {device.last_seen_location ? (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  ) : (
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Current Location</h3>
                <Button 
                  onClick={updateLocation}
                  disabled={locationLoading}
                  size="sm"
                >
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  Update Location
                </Button>
              </div>
              
              {locationData ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{deviceLocationService.formatLocationForDisplay(locationData)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Coordinates:</span>
                      <p className="font-mono">{locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <p>{deviceLocationService.getLocationAccuracyDescription(locationData.accuracy)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Source:</span>
                      <p className="capitalize">{locationData.source}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <p>{locationData.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {locationData.verified && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Location Verified</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No location data available</p>
                  <p className="text-sm">Click "Update Location" to get current position</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              {ownershipHistory.map((event, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{event.event}</p>
                        <span className="text-xs text-muted-foreground">{event.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                      {event.verified && (
                        <div className="flex items-center gap-1 text-xs text-success">
                          <Shield className="w-3 h-3" />
                          Blockchain Verified
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="repairs" className="space-y-4">
            <div className="space-y-3">
              {repairHistory.map((repair) => (
                <Card key={repair.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{repair.issue}</p>
                      <span className="text-sm font-medium">{repair.cost}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{repair.shop}</span>
                      <span>{repair.date}</span>
                    </div>
                    {repair.verified && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <Shield className="w-3 h-3" />
                        Verified Repair Shop
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            <Button variant="outline" className="w-full" asChild>
              <Link to={`/repair/booking?deviceId=${device.id}`}>
                <History className="w-4 h-4 mr-2" />
                Log New Repair
              </Link>
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeviceDetails;