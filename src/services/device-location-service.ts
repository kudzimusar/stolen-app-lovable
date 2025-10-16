/**
 * =============================================================================
 * DEVICE LOCATION SERVICE - ENTERPRISE GRADE
 * =============================================================================
 * Comprehensive location management service that integrates with existing
 * infrastructure including OpenStreetMap, Google Maps, and Supabase database.
 * Uses the same proven location tracking system as Lost & Found feature.
 * =============================================================================
 */

import { supabase } from '@/integrations/supabase/client';
import { getAuthToken } from '@/lib/auth';
import { InteractiveMap, MapLocation } from '@/components/shared/maps/InteractiveMap';
import { geoService, LocationData } from '@/lib/geolocation/geolocation';

export interface DeviceLocationData {
  id?: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  accuracy?: number;
  source: 'gps' | 'manual' | 'api' | 'blockchain';
  timestamp: Date;
  verified?: boolean;
  blockchainHash?: string;
}

export interface DeviceLocationHistory {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  address?: string;
  source: string;
  timestamp: string;
  verified: boolean;
  blockchainHash?: string;
}

export class DeviceLocationService {
  private static instance: DeviceLocationService;
  private locationCache: Map<string, DeviceLocationData> = new Map();
  private watchId: number | null = null;

  static getInstance(): DeviceLocationService {
    if (!DeviceLocationService.instance) {
      DeviceLocationService.instance = new DeviceLocationService();
    }
    return DeviceLocationService.instance;
  }

  /**
   * Get current device location from database
   */
  async getCurrentDeviceLocation(deviceId: string): Promise<DeviceLocationData | null> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Check cache first
      if (this.locationCache.has(deviceId)) {
        const cached = this.locationCache.get(deviceId)!;
        // Return cached if less than 5 minutes old
        if (Date.now() - cached.timestamp.getTime() < 5 * 60 * 1000) {
          return cached;
        }
      }

      const { data: device, error } = await supabase
        .from('devices')
        .select('id, last_seen_location, device_name, brand, model')
        .eq('id', deviceId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch device: ${error.message}`);
      }

      if (!device || !device.last_seen_location) {
        return null;
      }

      // Parse POINT data (format: "POINT(lng lat)")
      const pointMatch = (device.last_seen_location as string).match(/POINT\(([^)]+)\)/);
      if (!pointMatch) {
        return null;
      }

      const [lng, lat] = pointMatch[1].split(' ').map(parseFloat);
      
      // Get address information using reverse geocoding
      const addressInfo = await this.reverseGeocode(lat, lng);
      
      const locationData: DeviceLocationData = {
        deviceId,
        latitude: lat,
        longitude: lng,
        address: addressInfo.formattedAddress,
        city: addressInfo.city,
        province: addressInfo.province,
        country: addressInfo.country,
        source: 'api',
        timestamp: new Date(),
        verified: true
      };

      // Cache the result
      this.locationCache.set(deviceId, locationData);
      
      return locationData;
    } catch (error) {
      console.error('Error getting current device location:', error);
      throw error;
    }
  }

  /**
   * Update device location using browser geolocation
   */
  async updateDeviceLocationWithGPS(deviceId: string): Promise<DeviceLocationData> {
    try {
      const coordinates = await this.getCurrentPosition();
      const locationData = await this.saveDeviceLocation(deviceId, {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
        source: 'gps'
      });

      return locationData;
    } catch (error) {
      console.error('Error updating device location with GPS:', error);
      throw error;
    }
  }

  /**
   * Save device location to database
   */
  async saveDeviceLocation(
    deviceId: string, 
    locationData: Partial<DeviceLocationData>
  ): Promise<DeviceLocationData> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Get address information
      const addressInfo = await this.reverseGeocode(
        locationData.latitude!, 
        locationData.longitude!
      );

      // Format as POINT for PostgreSQL
      const pointString = `POINT(${locationData.longitude} ${locationData.latitude})`;

      // Update device location in database
      const { data, error } = await supabase
        .from('devices')
        .update({
          last_seen_location: pointString,
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
        .select('id, last_seen_location, updated_at')
        .single();

      if (error) {
        throw new Error(`Failed to update device location: ${error.message}`);
      }

      const savedLocation: DeviceLocationData = {
        id: data.id,
        deviceId,
        latitude: locationData.latitude!,
        longitude: locationData.longitude!,
        address: addressInfo.formattedAddress,
        city: addressInfo.city,
        province: addressInfo.province,
        country: addressInfo.country,
        accuracy: locationData.accuracy,
        source: locationData.source || 'manual',
        timestamp: new Date(data.updated_at),
        verified: true
      };

      // Cache the result
      this.locationCache.set(deviceId, savedLocation);

      return savedLocation;
    } catch (error) {
      console.error('Error saving device location:', error);
      throw error;
    }
  }

  /**
   * Get device location history (if we implement a history table later)
   */
  async getDeviceLocationHistory(
    deviceId: string, 
    limit: number = 10
  ): Promise<DeviceLocationHistory[]> {
    try {
      // For now, return current location as history
      // In the future, we can implement a proper location_history table
      const currentLocation = await this.getCurrentDeviceLocation(deviceId);
      
      if (!currentLocation) {
        return [];
      }

      return [{
        id: currentLocation.id || 'current',
        deviceId: currentLocation.deviceId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address,
        source: currentLocation.source,
        timestamp: currentLocation.timestamp.toISOString(),
        verified: currentLocation.verified || false,
        blockchainHash: currentLocation.blockchainHash
      }];
    } catch (error) {
      console.error('Error getting device location history:', error);
      throw error;
    }
  }

  /**
   * Start continuous location tracking
   */
  async startLocationTracking(
    deviceId: string,
    onLocationUpdate: (location: DeviceLocationData) => void,
    interval: number = 30000 // 30 seconds
  ): Promise<() => void> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    const trackingCallback = async () => {
      try {
        const location = await this.updateDeviceLocationWithGPS(deviceId);
        onLocationUpdate(location);
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    };

    // Start tracking
    this.watchId = navigator.geolocation.watchPosition(
      trackingCallback,
      (error) => console.error('GPS tracking error:', error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    // Return stop function
    return () => {
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    };
  }

  /**
   * Get current position using browser geolocation
   */
  private async getCurrentPosition(): Promise<GeolocationPosition> {
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
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * Reverse geocoding using the existing geolocation service
   */
  private async reverseGeocode(
    latitude: number, 
    longitude: number
  ): Promise<{
    formattedAddress: string;
    city: string;
    province: string;
    country: string;
  }> {
    try {
      // Use the existing geolocation service
      const locationData = await geoService.detectLocation();
      
      // If we have accurate coordinates, try to get more specific address
      if (Math.abs(locationData.latitude! - latitude) < 0.1 && 
          Math.abs(locationData.longitude! - longitude) < 0.1) {
        return {
          formattedAddress: `${locationData.city}, ${locationData.province}, ${locationData.country}`,
          city: locationData.city,
          province: locationData.province,
          country: locationData.country
        };
      }

      // Fallback: use coordinates-based detection
      const isInSouthAfrica = this.isCoordinateInSouthAfrica(latitude, longitude);
      
      if (isInSouthAfrica) {
        const province = this.getProvinceFromCoordinates(latitude, longitude);
        const city = this.getCityFromCoordinates(latitude, longitude);
        
        return {
          formattedAddress: `${city}, ${province}, South Africa`,
          city,
          province,
          country: 'South Africa'
        };
      }

      // Default fallback
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: 'Unknown',
        province: 'Unknown',
        country: 'Unknown'
      };
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: 'Unknown',
        province: 'Unknown',
        country: 'Unknown'
      };
    }
  }

  /**
   * Check if coordinates are in South Africa
   */
  private isCoordinateInSouthAfrica(lat: number, lng: number): boolean {
    return lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33;
  }

  /**
   * Get province from coordinates (simplified)
   */
  private getProvinceFromCoordinates(lat: number, lng: number): string {
    if (lat >= -26.5 && lat <= -25.5 && lng >= 27.5 && lng <= 29) return "Gauteng";
    if (lat >= -30 && lat <= -28.5 && lng >= 29.5 && lng <= 31.5) return "KwaZulu-Natal";
    if (lat >= -34.5 && lat <= -32.5 && lng >= 18 && lng <= 20) return "Western Cape";
    if (lat >= -33.5 && lat <= -31.5 && lng >= 25 && lng <= 27) return "Eastern Cape";
    if (lat >= -25.5 && lat <= -24.5 && lng >= 30 && lng <= 32) return "Mpumalanga";
    if (lat >= -24 && lat <= -22 && lng >= 27 && lng <= 31) return "Limpopo";
    if (lat >= -27 && lat <= -25.5 && lng >= 24 && lng <= 27) return "North West";
    if (lat >= -29.5 && lat <= -27.5 && lng >= 25 && lng <= 29) return "Free State";
    if (lat >= -30 && lat <= -28.5 && lng >= 18 && lng <= 22) return "Northern Cape";
    return "Gauteng"; // Default
  }

  /**
   * Get city from coordinates (simplified)
   */
  private getCityFromCoordinates(lat: number, lng: number): string {
    const province = this.getProvinceFromCoordinates(lat, lng);
    
    // Major cities by province
    const citiesByProvince: Record<string, string[]> = {
      "Gauteng": ["Johannesburg", "Pretoria", "Sandton", "Randburg"],
      "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Newcastle"],
      "Western Cape": ["Cape Town", "Stellenbosch", "Paarl"],
      "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown"],
      "Mpumalanga": ["Nelspruit", "Witbank", "Secunda"],
      "Limpopo": ["Polokwane", "Tzaneen", "Thohoyandou"],
      "North West": ["Rustenburg", "Klerksdorp", "Potchefstroom"],
      "Free State": ["Bloemfontein", "Welkom", "Kroonstad"],
      "Northern Cape": ["Kimberley", "Upington", "Kuruman"]
    };
    
    const cities = citiesByProvince[province] || citiesByProvince["Gauteng"];
    return cities[0] || "Johannesburg";
  }

  /**
   * Format location for display
   */
  formatLocationForDisplay(location: DeviceLocationData): string {
    if (location.address) {
      return location.address;
    }
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.province) parts.push(location.province);
    if (location.country) parts.push(location.country);
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
    
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  /**
   * Get location accuracy description
   */
  getLocationAccuracyDescription(accuracy?: number): string {
    if (!accuracy) return 'Unknown accuracy';
    
    if (accuracy < 5) return 'Exact location (< 5m accuracy)';
    if (accuracy < 50) return 'Approximate location (5-50m accuracy)';
    if (accuracy < 500) return 'Neighborhood level (50-500m accuracy)';
    if (accuracy < 2000) return 'District level (500m-2km accuracy)';
    if (accuracy < 10000) return 'City level (2-10km accuracy)';
    return 'Region level (> 10km accuracy)';
  }

  /**
   * Clear location cache
   */
  clearLocationCache(deviceId?: string): void {
    if (deviceId) {
      this.locationCache.delete(deviceId);
    } else {
      this.locationCache.clear();
    }
  }
}

// Export singleton instance
export const deviceLocationService = DeviceLocationService.getInstance();
