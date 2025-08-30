import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/navigation/AppHeader";
import { SecurityEnhancements } from "@/components/security/SecurityEnhancements";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { 
  MapPin, 
  Navigation, 
  Radar, 
  Shield, 
  Users, 
  Building, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Loader2,
  Phone,
  Banknote
} from "lucide-react";
import { geoService, LocationData, DEFAULT_LOCATION } from "@/lib/geolocation/geolocation";
import { useToast } from "@/hooks/use-toast";

export default function GeolocationTesting() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [isTracking, setIsTracking] = useState(false);
  const [gpsPosition, setGpsPosition] = useState<GeolocationPosition | null>(null);
  const [nearbyServices, setNearbyServices] = useState<any[]>([]);
  const [geoFenceStatus, setGeoFenceStatus] = useState<string>("Inactive");
  const [sapsDivision, setSapsDivision] = useState("");

  useEffect(() => {
    // Initialize with South African defaults
    handleLocationSelected(DEFAULT_LOCATION);
  }, []);

  const handleLocationSelected = (location: LocationData) => {
    setCurrentLocation(location);
    
    // Update currency display and regional services
    if (location.countryCode === "ZA") {
      const division = geoService.getSAPSDivision(location.provinceCode);
      setSapsDivision(division);
    }
    
    toast({
      title: "Location Updated",
      description: `Set to ${location.city}, ${location.province} (${location.currency})`,
    });
  };

  const startGPSTracking = () => {
    setIsTracking(true);
    geoService.startGPSTracking((position) => {
      setGpsPosition(position);
      
      // Check for geo-fence alerts
      const alerts = geoService.checkGeoFences(
        position.coords.latitude,
        position.coords.longitude
      );
      
      if (alerts.length > 0) {
        setGeoFenceStatus(`Alert! ${alerts.length} geo-fence(s) triggered`);
        toast({
          title: "Geo-fence Alert",
          description: "Device detected in monitored area",
          variant: "destructive",
        });
      }
    });
    
    toast({
      title: "GPS Tracking Started",
      description: "Real-time location monitoring active",
    });
  };

  const stopGPSTracking = () => {
    geoService.stopGPSTracking();
    setIsTracking(false);
    setGeoFenceStatus("Inactive");
    
    toast({
      title: "GPS Tracking Stopped",
      description: "Location monitoring disabled",
    });
  };

  const findNearbyServices = async () => {
    if (!gpsPosition) {
      toast({
        title: "Location Required",
        description: "Please enable GPS tracking first",
        variant: "destructive",
      });
      return;
    }

    const services = await geoService.getNearbyServices(
      gpsPosition.coords.latitude,
      gpsPosition.coords.longitude,
      'repair_shop',
      25
    );
    
    setNearbyServices(services);
    
    toast({
      title: "Services Found",
      description: `Found ${services.length} nearby repair shops`,
    });
  };

  const testRegionalAlert = async () => {
    await geoService.sendRegionalAlert(
      "test-device-123",
      currentLocation,
      "Test lost device alert for geolocation testing"
    );
    
    toast({
      title: "Regional Alert Sent",
      description: `Alert broadcast to ${currentLocation.city} area`,
    });
  };

  const testSAPSIntegration = async () => {
    const result = await geoService.reportToSAPS(
      "test-device-456",
      currentLocation,
      "SAPS-TEST-2024-001"
    );
    
    if (result.success) {
      toast({
        title: "SAPS Report Successful",
        description: `Reported to ${result.sapsDivision}`,
      });
    } else {
      toast({
        title: "SAPS Report Failed",
        description: "Unable to connect to SAPS system",
        variant: "destructive",
      });
    }
  };

  const addTestGeoFence = () => {
    if (!gpsPosition) {
      toast({
        title: "Location Required",
        description: "Please enable GPS tracking first",
        variant: "destructive",
      });
      return;
    }

    geoService.addGeoFence(
      "test-device-789",
      gpsPosition.coords.latitude,
      gpsPosition.coords.longitude,
      5 // 5km radius
    );
    
    setGeoFenceStatus("Active - 5km radius");
    
    toast({
      title: "Geo-fence Added",
      description: "Monitoring area established (5km radius)",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Geolocation & Security Testing" 
      />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Geolocation-Based Protection Testing</h1>
          <p className="text-muted-foreground">
            Test location services, regional features, and enhanced security
          </p>
        </div>

        <Tabs defaultValue="location" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="tracking">GPS & Alerts</TabsTrigger>
            <TabsTrigger value="services">Regional Services</TabsTrigger>
            <TabsTrigger value="security">Security+</TabsTrigger>
          </TabsList>

          <TabsContent value="location" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <LocationSelector
                onLocationSelected={handleLocationSelected}
                initialLocation={currentLocation}
                showAutoDetect={true}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Banknote className="w-5 h-5" />
                    <span>Regional Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Location-based app configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Currency:</p>
                      <Badge variant="outline" className="mt-1">
                        {currentLocation.currency}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Timezone:</p>
                      <Badge variant="outline" className="mt-1">
                        {currentLocation.timezone}
                      </Badge>
                    </div>
                  </div>

                  {currentLocation.countryCode === "ZA" && (
                    <Alert>
                      <Shield className="w-4 h-4" />
                      <AlertDescription>
                        <strong>South African Features Active:</strong>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• Regional marketplace (province-filtered)</li>
                          <li>• SAPS integration: {sapsDivision}</li>
                          <li>• Local repair shop mapping</li>
                          <li>• Community recovery alerts</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Sample price formatting: {geoService.formatCurrency(1299.99, currentLocation)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Navigation className="w-5 h-5" />
                    <span>GPS Tracking</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time location monitoring for geo-fencing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    {!isTracking ? (
                      <Button onClick={startGPSTracking} className="flex-1">
                        <Navigation className="w-4 h-4" />
                        Start GPS Tracking
                      </Button>
                    ) : (
                      <Button onClick={stopGPSTracking} variant="destructive" className="flex-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Stop Tracking
                      </Button>
                    )}
                  </div>

                  {gpsPosition && (
                    <div className="space-y-2 text-sm">
                      <p><strong>Latitude:</strong> {gpsPosition.coords.latitude.toFixed(6)}</p>
                      <p><strong>Longitude:</strong> {gpsPosition.coords.longitude.toFixed(6)}</p>
                      <p><strong>Accuracy:</strong> ±{gpsPosition.coords.accuracy}m</p>
                    </div>
                  )}

                  <Alert>
                    <Radar className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Geo-fence Status:</strong> {geoFenceStatus}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Regional Alerts</span>
                  </CardTitle>
                  <CardDescription>
                    Test community-based alert system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addTestGeoFence} variant="outline" className="w-full">
                    <Radar className="w-4 h-4" />
                    Add Test Geo-fence
                  </Button>

                  <Button onClick={testRegionalAlert} className="w-full">
                    <Users className="w-4 h-4" />
                    Send Regional Alert
                  </Button>

                  <div className="text-xs text-muted-foreground">
                    Simulates broadcasting lost device alerts to nearby community members
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Nearby Services</span>
                  </CardTitle>
                  <CardDescription>
                    Find local repair shops and retailers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={findNearbyServices} className="w-full">
                    <MapPin className="w-4 h-4" />
                    Find Nearby Repair Shops
                  </Button>

                  {nearbyServices.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">Found Services:</p>
                      {nearbyServices.map((service, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          <p className="font-medium">{service.display_name}</p>
                          <p className="text-muted-foreground">{service.role}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Services within 25km radius of your current location
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>SAPS Integration</span>
                  </CardTitle>
                  <CardDescription>
                    South African Police Service reporting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={testSAPSIntegration} className="w-full">
                    <Phone className="w-4 h-4" />
                    Test SAPS Report
                  </Button>

                  {sapsDivision && (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Assigned Division:</strong><br />
                        {sapsDivision}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Automatic routing to correct provincial SAPS division based on location
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityEnhancements />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}