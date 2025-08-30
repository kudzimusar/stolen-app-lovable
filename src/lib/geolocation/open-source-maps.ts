import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LocationData {
  country: string;
  countryCode: string;
  province: string;
  provinceCode: string;
  city: string;
  timezone: string;
  currency: string;
  coordinates?: [number, number];
}

export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    country: string;
    state: string;
    city: string;
    suburb?: string;
  };
}

export class OpenSourceMapService {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  
  // South African default location
  private readonly defaultLocation: [number, number] = [-26.2041, 28.0473]; // Johannesburg
  
  initializeMap(containerId: string, center?: [number, number]): L.Map {
    this.map = L.map(containerId).setView(center || this.defaultLocation, 10);
    
    // Free OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
    
    return this.map;
  }
  
  // Free geocoding with Nominatim
  async geocode(address: string, countryCode: string = 'za'): Promise<GeocodingResult[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=${countryCode}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const results = await response.json();
      return results.map((result: any) => ({
        display_name: result.display_name,
        lat: result.lat,
        lon: result.lon,
        address: result.address
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }
  
  // Free reverse geocoding
  async reverseGeocode(lat: number, lng: number, countryCode: string = 'za'): Promise<LocationData | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=${countryCode}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const result = await response.json();
      
      // Map to South African provinces
      const provinceMapping: { [key: string]: string } = {
        'Gauteng': 'GP',
        'Western Cape': 'WC',
        'KwaZulu-Natal': 'KZN',
        'Eastern Cape': 'EC',
        'Mpumalanga': 'MP',
        'Limpopo': 'LP',
        'North West': 'NW',
        'Free State': 'FS',
        'Northern Cape': 'NC'
      };
      
      const province = result.address?.state || 'Gauteng';
      const provinceCode = provinceMapping[province] || 'GP';
      
      return {
        country: result.address?.country || 'South Africa',
        countryCode: result.address?.country_code?.toUpperCase() || 'ZA',
        province: province,
        provinceCode: provinceCode,
        city: result.address?.city || result.address?.town || result.address?.suburb || 'Johannesburg',
        timezone: 'Africa/Johannesburg',
        currency: 'ZAR',
        coordinates: [parseFloat(result.lat), parseFloat(result.lon)]
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
  
  // Add marker to map
  addMarker(lat: number, lng: number, title?: string, popup?: string): L.Marker {
    if (!this.map) {
      throw new Error('Map not initialized');
    }
    
    const marker = L.marker([lat, lng]).addTo(this.map);
    
    if (title) {
      marker.bindTooltip(title);
    }
    
    if (popup) {
      marker.bindPopup(popup);
    }
    
    this.markers.push(marker);
    return marker;
  }
  
  // Clear all markers
  clearMarkers(): void {
    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });
    this.markers = [];
  }
  
  // Fit map to markers
  fitToMarkers(): void {
    if (this.map && this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }
  
  // Get current map center
  getCenter(): [number, number] | null {
    if (!this.map) return null;
    const center = this.map.getCenter();
    return [center.lat, center.lng];
  }
  
  // Set map center
  setCenter(lat: number, lng: number): void {
    if (this.map) {
      this.map.setView([lat, lng]);
    }
  }
  
  // Get map zoom level
  getZoom(): number | null {
    if (!this.map) return null;
    return this.map.getZoom();
  }
  
  // Set map zoom level
  setZoom(zoom: number): void {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }
  
  // Search for places in South Africa
  async searchPlaces(query: string, lat?: number, lng?: number): Promise<GeocodingResult[]> {
    const searchQuery = `${query}, South Africa`;
    return this.geocode(searchQuery, 'za');
  }
  
  // Get nearby places (simplified implementation)
  async getNearbyPlaces(lat: number, lng: number, radius: number = 1000): Promise<GeocodingResult[]> {
    // Use reverse geocoding to get the area name, then search for places
    const location = await this.reverseGeocode(lat, lng);
    if (location) {
      return this.searchPlaces(location.city);
    }
    return [];
  }
  
  // Calculate distance between two points
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  // Destroy map instance
  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers = [];
  }
}

// Export singleton instance
export const openSourceMapService = new OpenSourceMapService();
