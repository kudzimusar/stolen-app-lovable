import { supabase } from "@/integrations/supabase/client";

export interface LocationData {
  country: string;
  countryCode: string;
  province: string;
  provinceCode: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  currency: string;
}

export interface GeoFenceAlert {
  id: string;
  deviceId: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number; // in kilometers
  alertType: 'entry' | 'exit' | 'proximity';
  timestamp: Date;
}

// South African provinces and major cities
export const SA_PROVINCES = [
  { code: "GP", name: "Gauteng", capital: "Johannesburg" },
  { code: "KZN", name: "KwaZulu-Natal", capital: "Pietermaritzburg" },
  { code: "WC", name: "Western Cape", capital: "Cape Town" },
  { code: "EC", name: "Eastern Cape", capital: "East London" },
  { code: "MP", name: "Mpumalanga", capital: "Nelspruit" },
  { code: "LP", name: "Limpopo", capital: "Polokwane" },
  { code: "NW", name: "North West", capital: "Rustenburg" },
  { code: "FS", name: "Free State", capital: "Bloemfontein" },
  { code: "NC", name: "Northern Cape", capital: "Kimberley" }
];

export const SA_CITIES_BY_PROVINCE: Record<string, string[]> = {
  "GP": ["Johannesburg", "Pretoria", "Ekurhuleni", "Randburg", "Sandton", "Roodepoort", "Soweto", "Germiston", "Benoni", "Boksburg"],
  "KZN": ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ladysmith", "Empangeni", "Pinetown", "Chatsworth", "Umlazi"],
  "WC": ["Cape Town", "Stellenbosch", "Paarl", "George", "Worcester", "Mossel Bay", "Oudtshoorn", "Hermanus", "Knysna"],
  "EC": ["East London", "Port Elizabeth", "Mthatha", "King William's Town", "Grahamstown", "Queenstown", "Uitenhage", "Alice"],
  "MP": ["Nelspruit", "Witbank", "Secunda", "Standerton", "Middelburg", "Ermelo", "Barberton", "Komatipoort"],
  "LP": ["Polokwane", "Tzaneen", "Thohoyandou", "Lebowakgomo", "Giyani", "Louis Trichardt", "Mokopane", "Bela-Bela"],
  "NW": ["Rustenburg", "Klerksdorp", "Potchefstroom", "Brits", "Vryburg", "Lichtenburg", "Zeerust", "Madikwe"],
  "FS": ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg", "Phuthaditjhaba", "Virginia", "Odendaalsrus"],
  "NC": ["Kimberley", "Upington", "Kuruman", "De Aar", "Springbok", "Calvinia", "Postmasburg", "Kathu"]
};

export const DEFAULT_LOCATION: LocationData = {
  country: "South Africa",
  countryCode: "ZA",
  province: "Gauteng",
  provinceCode: "GP",
  city: "Johannesburg",
  timezone: "Africa/Johannesburg",
  currency: "ZAR"
};

export class GeolocationService {
  private static instance: GeolocationService;
  private watchId: number | null = null;
  private geoFences: GeoFenceAlert[] = [];

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  // Auto-detect user location using browser geolocation API
  async detectLocation(): Promise<LocationData> {
    try {
      const position = await this.getCurrentPosition();
      const reverseGeocode = await this.reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );
      
      return {
        ...reverseGeocode,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.warn('Auto-detection failed, using default SA location:', error);
      return DEFAULT_LOCATION;
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Reverse geocode using a public API (mock implementation for now)
  private async reverseGeocode(lat: number, lng: number): Promise<LocationData> {
    // In a real implementation, you would use a service like:
    // - OpenCage Geocoder API
    // - Google Places API
    // - Nominatim (OpenStreetMap)
    
    // Mock implementation - check if coordinates are in South Africa
    const isInSouthAfrica = this.isCoordinateInSouthAfrica(lat, lng);
    
    if (isInSouthAfrica) {
      // For now, return a reasonable South African location
      // In production, make actual API call
      return {
        country: "South Africa",
        countryCode: "ZA",
        province: this.getProvinceFromCoordinates(lat, lng),
        provinceCode: this.getProvinceCodeFromCoordinates(lat, lng),
        city: this.getCityFromCoordinates(lat, lng),
        timezone: "Africa/Johannesburg",
        currency: "ZAR"
      };
    }
    
    return DEFAULT_LOCATION;
  }

  private isCoordinateInSouthAfrica(lat: number, lng: number): boolean {
    // South Africa approximate bounds
    return lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33;
  }

  private getProvinceFromCoordinates(lat: number, lng: number): string {
    // Simplified province detection based on coordinates
    if (lat >= -26.5 && lat <= -25.5 && lng >= 27.5 && lng <= 29) return "Gauteng";
    if (lat >= -30 && lat <= -28.5 && lng >= 29.5 && lng <= 31.5) return "KwaZulu-Natal";
    if (lat >= -34.5 && lat <= -32.5 && lng >= 18 && lng <= 20) return "Western Cape";
    return "Gauteng"; // Default
  }

  private getProvinceCodeFromCoordinates(lat: number, lng: number): string {
    const province = this.getProvinceFromCoordinates(lat, lng);
    const provinceData = SA_PROVINCES.find(p => p.name === province);
    return provinceData?.code || "GP";
  }

  private getCityFromCoordinates(lat: number, lng: number): string {
    const province = this.getProvinceFromCoordinates(lat, lng);
    const provinceCode = this.getProvinceCodeFromCoordinates(lat, lng);
    const cities = SA_CITIES_BY_PROVINCE[provinceCode] || SA_CITIES_BY_PROVINCE["GP"];
    return cities[0] || "Johannesburg";
  }

  // Start GPS tracking for geo-fencing
  startGPSTracking(onLocationUpdate: (position: GeolocationPosition) => void): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      onLocationUpdate,
      (error) => console.warn('GPS tracking error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000 // 1 minute
      }
    );
  }

  // Stop GPS tracking
  stopGPSTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Add geo-fence for device monitoring
  addGeoFence(deviceId: string, lat: number, lng: number, radius: number): void {
    const geoFence: GeoFenceAlert = {
      id: `${deviceId}-${Date.now()}`,
      deviceId,
      location: { lat, lng },
      radius,
      alertType: 'proximity',
      timestamp: new Date()
    };
    
    this.geoFences.push(geoFence);
    console.log(`Geo-fence added for device ${deviceId} at ${lat}, ${lng} with ${radius}km radius`);
  }

  // Check if current location triggers any geo-fence alerts
  checkGeoFences(currentLat: number, currentLng: number): GeoFenceAlert[] {
    const triggeredAlerts: GeoFenceAlert[] = [];
    
    this.geoFences.forEach(fence => {
      const distance = this.calculateDistance(
        currentLat,
        currentLng,
        fence.location.lat,
        fence.location.lng
      );
      
      if (distance <= fence.radius) {
        triggeredAlerts.push({
          ...fence,
          alertType: 'proximity',
          timestamp: new Date()
        });
      }
    });
    
    return triggeredAlerts;
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get nearby repair shops or retailers
  async getNearbyServices(
    lat: number, 
    lng: number, 
    serviceType: 'repair_shop' | 'retailer',
    radius: number = 25
  ): Promise<any[]> {
    try {
      // Query users table for nearby service providers
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', serviceType)
        .eq('verification_status', true);
      
      if (error) throw error;
      
      // Filter by distance (simplified - in production use PostGIS)
      const nearbyServices = data?.filter(service => {
        const address = service.address as any;
        if (!address?.latitude || !address?.longitude) return false;
        
        const distance = this.calculateDistance(
          lat,
          lng,
          address.latitude,
          address.longitude
        );
        
        return distance <= radius;
      }) || [];
      
      return nearbyServices;
    } catch (error) {
      console.error('Error fetching nearby services:', error);
      return [];
    }
  }

  // Send regional alert for lost/stolen device
  async sendRegionalAlert(deviceId: string, location: LocationData, description: string): Promise<void> {
    try {
      // Log the regional alert (in production, this would trigger notifications)
      console.log(`Regional Alert: Device ${deviceId} reported in ${location.city}, ${location.province}`);
      
      // This would integrate with push notifications, SMS alerts, etc.
      const alertData = {
        deviceId,
        location,
        description,
        timestamp: new Date().toISOString(),
        alertRadius: 50, // 50km radius
        priority: 'high'
      };
      
      // Store alert in database for nearby users
      await this.storeRegionalAlert(alertData);
      
    } catch (error) {
      console.error('Error sending regional alert:', error);
    }
  }

  private async storeRegionalAlert(alertData: any): Promise<void> {
    // Store in alerts table or trigger notification system
    console.log('Regional alert stored:', alertData);
  }

  // Integrate with SAPS (South African Police Service) by province
  async reportToSAPS(
    deviceId: string, 
    location: LocationData, 
    policeReportNumber?: string
  ): Promise<{ success: boolean; sapsDivision: string }> {
    try {
      // Map province to SAPS division
      const sapsDivision = this.getSAPSDivision(location.provinceCode);
      
      console.log(`Reporting to SAPS Division: ${sapsDivision}`);
      console.log(`Device: ${deviceId}, Location: ${location.city}, ${location.province}`);
      
      // In production, this would make actual API calls to SAPS systems
      // For now, simulate successful reporting
      
      return {
        success: true,
        sapsDivision
      };
    } catch (error) {
      console.error('Error reporting to SAPS:', error);
      return {
        success: false,
        sapsDivision: 'Unknown'
      };
    }
  }

  getSAPSDivision(provinceCode: string): string {
    const sapsDivisions: Record<string, string> = {
      "GP": "SAPS Gauteng Provincial Office",
      "KZN": "SAPS KwaZulu-Natal Provincial Office", 
      "WC": "SAPS Western Cape Provincial Office",
      "EC": "SAPS Eastern Cape Provincial Office",
      "MP": "SAPS Mpumalanga Provincial Office",
      "LP": "SAPS Limpopo Provincial Office",
      "NW": "SAPS North West Provincial Office",
      "FS": "SAPS Free State Provincial Office",
      "NC": "SAPS Northern Cape Provincial Office"
    };
    
    return sapsDivisions[provinceCode] || "SAPS National Office";
  }

  // Format currency based on location
  formatCurrency(amount: number, location: LocationData): string {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: location.currency,
      minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
  }

  // Get timezone info
  getTimezone(location: LocationData): string {
    return location.timezone;
  }

  // Validate South African postal code
  validateSAPostalCode(postalCode: string): boolean {
    // South African postal codes are 4 digits
    return /^\d{4}$/.test(postalCode);
  }
}

export const geoService = GeolocationService.getInstance();