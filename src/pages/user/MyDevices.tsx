import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Smartphone, 
  Laptop,
  Headphones,
  Plus,
  ArrowUpRight,
  Shield,
  AlertTriangle,
  DollarSign,
  Clock,
  Eye,
  Edit,
  Share,
  MapPin,
  RefreshCw,
  ExternalLink,
  Loader2
} from "lucide-react";

interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serial: string;
  status: string;
  registrationDate: string;
  purchasePrice: number;
  currentValue: number;
  location: string;
  warrantyExpiry: string;
  insuranceStatus: string;
  icon?: any;
  photos: string[];
  photoCount: number;
  transfers: number;
  blockchainHash?: string;
  blockchainVerified?: boolean;
}

interface DeviceStats {
  total: number;
  active: number;
  reported: number;
  totalValue: number;
  insured: number;
}

const MyDevices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    total: 0,
    active: 0,
    reported: 0,
    totalValue: 0,
    insured: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load devices on component mount
  useEffect(() => {
    checkAuthAndLoadDevices();
    
    // Set up real-time subscription for device updates
    const channel = supabase
      .channel('my-devices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
          filter: `current_owner_id=eq.${supabase.auth.getUser().then(r => r.data.user?.id)}`
        },
        (payload) => {
          console.log('🔄 Device change detected:', payload);
          fetchDevices(); // Refresh devices on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check authentication and load devices
  const checkAuthAndLoadDevices = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your devices",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      await fetchDevices();
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/login');
    }
  };

  // Fetch devices from edge function API
  const fetchDevices = async () => {
    try {
      setRefreshing(true);
      console.log('📱 Fetching devices via edge function...');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch('/api/v1/devices/my-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Devices loaded:', result);

      if (result.success) {
        // Map device types to icons
        const devicesWithIcons = result.devices.map((device: Device) => ({
          ...device,
          icon: getDeviceIcon(device.brand, device.model)
        }));

        setDevices(devicesWithIcons);
        setDeviceStats(result.stats);
      } else {
        throw new Error(result.error || 'Failed to load devices');
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error Loading Devices",
        description: error instanceof Error ? error.message : "Failed to load devices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper: Get appropriate icon for device
  const getDeviceIcon = (brand: string, model: string) => {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('iphone') || modelLower.includes('phone') || modelLower.includes('samsung')) {
      return Smartphone;
    } else if (modelLower.includes('macbook') || modelLower.includes('laptop') || modelLower.includes('thinkpad')) {
      return Laptop;
    } else if (modelLower.includes('airpods') || modelLower.includes('headphone') || modelLower.includes('earbuds')) {
      return Headphones;
    }
    return Smartphone; // Default
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.serial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'reported_lost': return 'destructive';
      case 'transferred': return 'secondary';
      default: return 'outline';
    }
  };

  const getInsuranceColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'expired': return 'text-red-600';
      case 'claim_pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your devices...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Mobile Back Navigation - Fallback */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Devices</h1>
            <p className="text-muted-foreground">
              Manage all your registered devices in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchDevices}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          <Button asChild>
            <Link to="/device/register">
              <Plus className="w-4 h-4 mr-2" />
              Register Device
            </Link>
          </Button>
          </div>
        </div>

        {/* Compact Stats Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-900">{deviceStats.total}</p>
                <p className="text-xs text-gray-500 truncate">Total</p>
              </div>
            </div>
          
              <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-900">{deviceStats.active}</p>
                <p className="text-xs text-gray-500 truncate">Active</p>
              </div>
            </div>
          
              <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-900">{deviceStats.reported}</p>
                <p className="text-xs text-gray-500 truncate">Reported</p>
              </div>
            </div>
          
              <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-900">R{deviceStats.totalValue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 truncate">Value</p>
              </div>
            </div>
          
              <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-900">{deviceStats.insured}</p>
                <p className="text-xs text-gray-500 truncate">Insured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search devices..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="reported_lost">Reported</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => {
            const IconComponent = device.icon;
            return (
              <Card key={device.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">{device.name}</CardTitle>
                        <CardDescription className="font-mono text-xs truncate">
                          {device.serial}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(device.status)} className="flex-shrink-0 text-xs">
                      {device.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Purchase:</span>
                      <p className="font-medium text-sm">R{device.purchasePrice?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Current:</span>
                      <p className="font-medium text-sm">R{device.currentValue?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Warranty:</span>
                      <p className="font-medium text-xs">{device.warrantyExpiry || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Insurance:</span>
                      <p className={`font-medium text-xs ${getInsuranceColor(device.insuranceStatus)}`}>
                        {device.insuranceStatus.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{device.location}</span>
                  </div>

                  {/* Blockchain Verification Badge */}
                  {device.blockchainVerified && device.blockchainHash && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-green-800">Blockchain Verified</p>
                        <p className="text-xs text-green-600 truncate font-mono">
                          {device.blockchainHash.substring(0, 12)}...
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0"
                        onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${device.blockchainHash}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{device.photoCount} photos</span>
                    <span>{device.transfers} transfers</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link to={`/device/${device.id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    
                    {device.status === 'active' && (
                      <Button variant="outline" size="sm" asChild className="text-xs">
                          <Link to={`/hot-deals?deviceId=${device.id}`}>
                          <Clock className="w-3 h-3 mr-1" />
                            Sell
                          </Link>
                        </Button>
                    )}
                    
                    {device.status === 'lost' && (
                      <Button variant="outline" size="sm" className="col-span-2 text-xs" asChild>
                        <Link to="/device/recovery-status">
                          <Clock className="w-3 h-3 mr-1" />
                          Recovery Status
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredDevices.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Smartphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No devices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? "No devices match your current filters." 
                  : "Start by registering your first device."
                }
              </p>
              <div className="flex gap-2 justify-center">
                {(searchTerm || filterStatus !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button asChild>
                  <Link to="/device/register">
                    <Plus className="w-4 h-4 mr-2" />
                    Register Device
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyDevices;