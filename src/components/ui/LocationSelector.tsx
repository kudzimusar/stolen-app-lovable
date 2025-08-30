import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { EnhancedSelect } from "@/components/forms/EnhancedSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Loader2, Navigation, Globe } from "lucide-react";
import { geoService, LocationData, SA_PROVINCES, SA_CITIES_BY_PROVINCE, DEFAULT_LOCATION } from "@/lib/geolocation/geolocation";
import { useToast } from "@/hooks/use-toast";

interface LocationSelectorProps {
  onLocationSelected: (location: LocationData) => void;
  initialLocation?: LocationData;
  showAutoDetect?: boolean;
  className?: string;
}

const COUNTRIES = [
  { value: "ZA", label: "South Africa", currency: "ZAR", timezone: "Africa/Johannesburg" },
  { value: "US", label: "United States", currency: "USD", timezone: "America/New_York" },
  { value: "GB", label: "United Kingdom", currency: "GBP", timezone: "Europe/London" },
  { value: "AU", label: "Australia", currency: "AUD", timezone: "Australia/Sydney" },
  { value: "CA", label: "Canada", currency: "CAD", timezone: "America/Toronto" },
];

export const LocationSelector = ({ 
  onLocationSelected, 
  initialLocation, 
  showAutoDetect = true,
  className = ""
}: LocationSelectorProps) => {
  const { toast } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(
    initialLocation || DEFAULT_LOCATION
  );
  const [availableCities, setAvailableCities] = useState<string[]>(
    SA_CITIES_BY_PROVINCE[DEFAULT_LOCATION.provinceCode] || []
  );

  useEffect(() => {
    // Update available cities when province changes
    if (selectedLocation.countryCode === "ZA") {
      const cities = SA_CITIES_BY_PROVINCE[selectedLocation.provinceCode] || [];
      setAvailableCities(cities);
      
      // Reset city if current city is not in new province
      if (!cities.includes(selectedLocation.city)) {
        setSelectedLocation(prev => ({
          ...prev,
          city: cities[0] || "Johannesburg"
        }));
      }
    }
  }, [selectedLocation.provinceCode, selectedLocation.countryCode]);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const detectedLocation = await geoService.detectLocation();
      setSelectedLocation(detectedLocation);
      onLocationSelected(detectedLocation);
      
      toast({
        title: "Location Detected",
        description: `Found you in ${detectedLocation.city}, ${detectedLocation.province}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Auto-detection failed:", error);
      toast({
        title: "Detection Failed",
        description: "Could not detect your location. Please select manually.",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.value === countryCode);
    if (!country) return;

    let newLocation: LocationData;

    if (countryCode === "ZA") {
      // Default to South Africa settings
      newLocation = {
        ...DEFAULT_LOCATION,
        country: country.label,
        countryCode: country.value,
        currency: country.currency,
        timezone: country.timezone
      };
    } else {
      // Other countries - simplified implementation
      newLocation = {
        country: country.label,
        countryCode: country.value,
        province: "Default Province",
        provinceCode: "DP",
        city: "Default City",
        currency: country.currency,
        timezone: country.timezone
      };
    }

    setSelectedLocation(newLocation);
    onLocationSelected(newLocation);
  };

  const handleProvinceChange = (provinceCode: string) => {
    const province = SA_PROVINCES.find(p => p.code === provinceCode);
    if (!province) return;

    const cities = SA_CITIES_BY_PROVINCE[provinceCode] || [];
    const newLocation = {
      ...selectedLocation,
      province: province.name,
      provinceCode: province.code,
      city: cities[0] || province.capital
    };

    setSelectedLocation(newLocation);
    onLocationSelected(newLocation);
  };

  const handleCityChange = (city: string) => {
    const newLocation = {
      ...selectedLocation,
      city
    };

    setSelectedLocation(newLocation);
    onLocationSelected(newLocation);
  };

  const provinceOptions = SA_PROVINCES.map(province => ({
    value: province.code,
    label: province.name
  }));

  const cityOptions = availableCities.map(city => ({
    value: city,
    label: city
  }));

  const countryOptions = COUNTRIES.map(country => ({
    value: country.value,
    label: country.label
  }));

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Select Your Location</h3>
      </div>

      {showAutoDetect && (
        <div className="space-y-3">
          <Button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            variant="outline"
            className="w-full"
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {isDetecting ? "Detecting..." : "Auto-Detect My Location"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            or select manually below
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <EnhancedSelect
              placeholder="Select country"
              options={countryOptions}
              value={selectedLocation.countryCode}
              onValueChange={handleCountryChange}
              className="flex-1"
            />
          </div>
        </div>

        {selectedLocation.countryCode === "ZA" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <EnhancedSelect
                placeholder="Select province"
                options={provinceOptions}
                value={selectedLocation.provinceCode}
                onValueChange={handleProvinceChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City/Town *</Label>
              <EnhancedSelect
                placeholder="Select city"
                options={cityOptions}
                value={selectedLocation.city}
                onValueChange={handleCityChange}
              />
            </div>
          </>
        )}

        <Alert>
          <MapPin className="w-4 h-4" />
          <AlertDescription>
            <strong>Selected Location:</strong> {selectedLocation.city}, {selectedLocation.province}, {selectedLocation.country}
            <br />
            <strong>Currency:</strong> {selectedLocation.currency} | <strong>Timezone:</strong> {selectedLocation.timezone}
          </AlertDescription>
        </Alert>
      </div>

      {selectedLocation.countryCode === "ZA" && (
        <Alert>
          <AlertDescription className="text-sm">
            <strong>South African Services:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Regional marketplace filtering</li>
              <li>• SAPS integration for theft reporting</li>
              <li>• Local repair shop mapping</li>
              <li>• Community-based recovery alerts</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};
