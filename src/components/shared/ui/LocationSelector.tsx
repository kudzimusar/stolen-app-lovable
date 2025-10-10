import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { EnhancedSelect } from '../forms/EnhancedSelect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Loader2, Navigation, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface LocationData {
  country: string;
  countryCode: string;
  province: string;
  provinceCode: string;
  city: string;
  latitude: number;
  longitude: number;
  currency: string;
  timezone: string;
}

export interface LocationSelectorProps {
  onLocationSelected: (location: LocationData) => void;
  initialLocation?: LocationData;
  showAutoDetect?: boolean;
  enableGPS?: boolean;
  className?: string;
}

// South African provinces and cities data
export const SA_PROVINCES = [
  { value: "GP", label: "Gauteng" },
  { value: "WC", label: "Western Cape" },
  { value: "KZN", label: "KwaZulu-Natal" },
  { value: "EC", label: "Eastern Cape" },
  { value: "FS", label: "Free State" },
  { value: "MP", label: "Mpumalanga" },
  { value: "LP", label: "Limpopo" },
  { value: "NW", label: "North West" },
  { value: "NC", label: "Northern Cape" }
];

export const SA_CITIES_BY_PROVINCE: Record<string, string[]> = {
  "GP": ["Johannesburg", "Pretoria", "Soweto", "Vereeniging", "Germiston", "Kempton Park"],
  "WC": ["Cape Town", "Stellenbosch", "Paarl", "Worcester", "George", "Knysna"],
  "KZN": ["Durban", "Pietermaritzburg", "Newcastle", "Pinetown", "Umlazi", "Chatsworth"],
  "EC": ["Port Elizabeth", "East London", "Uitenhage", "King Williams Town", "Queenstown", "Grahamstown"],
  "FS": ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg", "Odendaalsrus"],
  "MP": ["Nelspruit", "Witbank", "Secunda", "Standerton", "Ermelo", "Bethal"],
  "LP": ["Polokwane", "Tzaneen", "Mokopane", "Lephalale", "Thohoyandou", "Musina"],
  "NW": ["Mahikeng", "Klerksdorp", "Potchefstroom", "Rustenburg", "Brits", "Orkney"],
  "NC": ["Kimberley", "Upington", "Kuruman", "Springbok", "De Aar", "Calvinia"]
};

export const COUNTRIES = [
  { value: "ZA", label: "South Africa", currency: "ZAR", timezone: "Africa/Johannesburg" },
  { value: "US", label: "United States", currency: "USD", timezone: "America/New_York" },
  { value: "GB", label: "United Kingdom", currency: "GBP", timezone: "Europe/London" },
  { value: "AU", label: "Australia", currency: "AUD", timezone: "Australia/Sydney" },
  { value: "CA", label: "Canada", currency: "CAD", timezone: "America/Toronto" }
];

export const DEFAULT_LOCATION: LocationData = {
  country: "South Africa",
  countryCode: "ZA",
  province: "Gauteng",
  provinceCode: "GP",
  city: "Johannesburg",
  latitude: -26.2041,
  longitude: 28.0473,
  currency: "ZAR",
  timezone: "Africa/Johannesburg"
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelected,
  initialLocation = DEFAULT_LOCATION,
  showAutoDetect = true,
  enableGPS = true,
  className = ""
}) => {
  const { toast } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(initialLocation);
  const [availableCities, setAvailableCities] = useState<string[]>(
    SA_CITIES_BY_PROVINCE[initialLocation.provinceCode] || []
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
          city: cities[0] || "",
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude
        }));
      }
    }
  }, [selectedLocation.provinceCode, selectedLocation.countryCode]);

  useEffect(() => {
    onLocationSelected(selectedLocation);
  }, [selectedLocation, onLocationSelected]);

  const detectLocation = async () => {
    if (!enableGPS || !navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
      return;
    }

    setIsDetecting(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      // For demo purposes, we'll use a simple reverse geocoding
      // In production, you'd use a proper geocoding service
      const detectedLocation: LocationData = {
        ...DEFAULT_LOCATION,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: "Detected Location",
        province: "Detected Province"
      };

      setSelectedLocation(detectedLocation);
      
      toast({
        title: "Location Detected",
        description: `Found location at ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
      });
    } catch (error) {
      console.error('Location detection failed:', error);
      toast({
        title: "Detection Failed",
        description: "Could not detect your location. Please select manually.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.value === countryCode);
    if (country) {
      setSelectedLocation(prev => ({
        ...prev,
        country: country.label,
        countryCode: country.value,
        currency: country.currency,
        timezone: country.timezone,
        // Reset province and city for non-SA countries
        province: countryCode === "ZA" ? prev.province : "",
        provinceCode: countryCode === "ZA" ? prev.provinceCode : "",
        city: countryCode === "ZA" ? prev.city : "",
        latitude: countryCode === "ZA" ? prev.latitude : DEFAULT_LOCATION.latitude,
        longitude: countryCode === "ZA" ? prev.longitude : DEFAULT_LOCATION.longitude
      }));
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    const province = SA_PROVINCES.find(p => p.value === provinceCode);
    if (province) {
      const cities = SA_CITIES_BY_PROVINCE[provinceCode] || [];
      setSelectedLocation(prev => ({
        ...prev,
        province: province.label,
        provinceCode: province.value,
        city: cities[0] || "",
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude
      }));
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedLocation(prev => ({
      ...prev,
      city,
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude
    }));
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Location Selection</h3>
          {showAutoDetect && enableGPS && (
            <Button
              variant="outline"
              size="sm"
              onClick={detectLocation}
              disabled={isDetecting}
              className="ml-auto"
            >
              {isDetecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Auto Detect
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <EnhancedSelect
              placeholder="Select country"
              options={COUNTRIES}
              value={selectedLocation.countryCode}
              onValueChange={handleCountryChange}
              className="w-full"
            />
          </div>

          {/* Province Selection (only for South Africa) */}
          {selectedLocation.countryCode === "ZA" && (
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <EnhancedSelect
                placeholder="Select province"
                options={SA_PROVINCES}
                value={selectedLocation.provinceCode}
                onValueChange={handleProvinceChange}
                className="w-full"
              />
            </div>
          )}

          {/* City Selection */}
          <div className="space-y-2">
            <Label htmlFor="city">
              {selectedLocation.countryCode === "ZA" ? "City" : "Location"}
            </Label>
            {selectedLocation.countryCode === "ZA" ? (
              <EnhancedSelect
                placeholder="Select city"
                options={availableCities.map(city => ({ value: city, label: city }))}
                value={selectedLocation.city}
                onValueChange={handleCityChange}
                className="w-full"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {selectedLocation.country}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Location Summary */}
        <Alert>
          <MapPin className="w-4 h-4" />
          <AlertDescription>
            <strong>Selected Location:</strong> {selectedLocation.city}, {selectedLocation.province}, {selectedLocation.country}
            <br />
            <span className="text-xs text-muted-foreground">
              Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </span>
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
};



