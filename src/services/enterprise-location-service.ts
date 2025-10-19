// @ts-nocheck
/**
 * =============================================================================
 * ENTERPRISE LOCATION TRACKING SERVICE
 * =============================================================================
 * Comprehensive location management service providing:
 * - Real-time location tracking and updates
 * - Geofencing and location-based alerts
 * - Location verification and validation
 * - Privacy controls and GDPR compliance
 * - Blockchain integration for immutable records
 * - Advanced analytics and insights
 * =============================================================================
 */

import { supabase } from '@/integrations/supabase/client';
import { getAuthToken } from '@/lib/auth';

// Comprehensive TypeScript interfaces for enterprise location system
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  accuracyLevel: 'exact' | 'approximate' | 'neighborhood' | 'district' | 'city' | 'region' | 'country' | 'manual';
  coordinateSystem: 'WGS84' | 'UTM' | 'MGRS' | 'Web_Mercator' | 'Custom';
}

export interface LocationHierarchy {
  id: string;
  level: number; // 1=Country, 2=Region, 3=City, 4=District, 5=Neighborhood, 6=Street, 7=Building
  parentId?: string;
  name: string;
  nameLocalized?: Record<string, string>;
  code?: string;
  centroidLat?: number;
  centroidLng?: number;
  boundaryPolygon?: any; // GeoJSON polygon
  areaSqKm?: number;
  population?: number;
  timezone?: string;
  currency?: string;
  languageCodes?: string[];
  administrativeLevel?: string;
  metadata?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceLocationRecord {
  id: string;
  deviceId: string;
  locationType: 'registration' | 'last_seen' | 'checkpoint' | 'incident' | 'recovery' | 'transfer' | 'maintenance';
  
  // Primary location data
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracyMeters?: number;
  accuracyLevel: LocationCoordinates['accuracyLevel'];
  coordinateSystem: LocationCoordinates['coordinateSystem'];
  
  // Address information
  countryCode?: string;
  regionName?: string;
  cityName?: string;
  districtName?: string;
  neighborhoodName?: string;
  streetAddress?: string;
  buildingNumber?: string;
  postalCode?: string;
  formattedAddress?: string;
  
  // Location hierarchy references
  countryId?: string;
  regionId?: string;
  cityId?: string;
  districtId?: string;
  neighborhoodId?: string;
  
  // Verification and validation
  verificationStatus: 'verified' | 'pending' | 'unverified' | 'rejected' | 'expired';
  verifiedAt?: string;
  verifiedBy?: string;
  verificationMethod?: 'gps' | 'ip_geolocation' | 'manual' | 'api' | 'blockchain';
  verificationConfidence?: number; // 0.0 to 1.0
  
  // Privacy and compliance
  privacyLevel: 'public' | 'standard' | 'private' | 'restricted';
  dataRetentionDays: number;
  gdprCompliant: boolean;
  consentGiven: boolean;
  consentTimestamp: string;
  
  // Source and tracking
  sourceDeviceId?: string;
  sourceAppVersion?: string;
  sourcePlatform?: 'mobile' | 'web' | 'api' | 'blockchain';
  collectionMethod?: 'gps' | 'wifi' | 'cellular' | 'bluetooth' | 'manual';
  
  // Geofencing
  geofenceId?: string;
  isGeofenceBreach: boolean;
  alertTriggered: boolean;
  alertSentAt?: string;
  
  // Blockchain integration
  blockchainHash?: string;
  blockchainVerified: boolean;
  blockchainTimestamp?: string;
  blockchainNetwork?: 'polygon' | 'ethereum' | 'mumbai';
  
  // Additional metadata
  metadata?: any;
  tags?: string[];
  notes?: string;
  
  // Audit trail
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  expiresAt?: string;
  
  // Soft delete
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
}

export interface DeviceGeofence {
  id: string;
  deviceId: string;
  name: string;
  description?: string;
  
  // Geofence geometry
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  polygonCoordinates?: any; // For complex polygon geofences
  
  // Behavior
  triggerOnEntry: boolean;
  triggerOnExit: boolean;
  triggerOnDwell: boolean;
  dwellTimeSeconds: number;
  
  // Alert configuration
  alertEnabled: boolean;
  alertRecipients: string[];
  alertMessageTemplate?: string;
  alertChannels: ('email' | 'push' | 'sms' | 'webhook')[];
  
  // Status
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface LocationAnalytics {
  id: string;
  deviceId?: string;
  analysisType: 'pattern' | 'anomaly' | 'trend' | 'security';
  analysisPeriodStart: string;
  analysisPeriodEnd: string;
  insights: any;
  confidenceScore: number; // 0.0 to 1.0
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: any;
  autoActionsTaken?: string[];
  algorithmVersion?: string;
  processingTimeMs?: number;
  createdAt: string;
  expiresAt?: string;
}

export interface LocationTrackingConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  enableBackgroundTracking: boolean;
  trackingInterval: number; // milliseconds
  enableGeofencing: boolean;
  enableBlockchainRecording: boolean;
  privacyLevel: DeviceLocationRecord['privacyLevel'];
  dataRetentionDays: number;
}

export class EnterpriseLocationService {
  private config: LocationTrackingConfig;

  constructor(config: Partial<LocationTrackingConfig> = {}) {
    this.config = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      enableBackgroundTracking: false,
      trackingInterval: 30000, // 30 seconds
      enableGeofencing: true,
      enableBlockchainRecording: true,
      privacyLevel: 'standard',
      dataRetentionDays: 2555, // 7 years
      ...config
    };
  }

  /**
   * Get current device location using browser geolocation API
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: this.config.enableHighAccuracy,
        timeout: this.config.timeout,
        maximumAge: this.config.maximumAge
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const accuracy = position.coords.accuracy;
          let accuracyLevel: LocationCoordinates['accuracyLevel'] = 'manual';
          
          if (accuracy < 5) accuracyLevel = 'exact';
          else if (accuracy < 50) accuracyLevel = 'approximate';
          else if (accuracy < 500) accuracyLevel = 'neighborhood';
          else if (accuracy < 2000) accuracyLevel = 'district';
          else if (accuracy < 10000) accuracyLevel = 'city';
          else if (accuracy < 50000) accuracyLevel = 'region';
          else accuracyLevel = 'country';

          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: accuracy,
            accuracyLevel,
            coordinateSystem: 'WGS84'
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        options
      );
    });
  }

  /**
   * Record device location with comprehensive metadata
   */
  async recordDeviceLocation(
    deviceId: string,
    locationType: DeviceLocationRecord['locationType'],
    coordinates: LocationCoordinates,
    additionalData: Partial<DeviceLocationRecord> = {}
  ): Promise<DeviceLocationRecord> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Get formatted address using reverse geocoding
      const formattedAddress = await this.reverseGeocode(coordinates.latitude, coordinates.longitude);

      const locationRecord: Partial<DeviceLocationRecord> = {
        deviceId,
        locationType,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        altitude: coordinates.altitude,
        accuracyMeters: coordinates.accuracy,
        accuracyLevel: coordinates.accuracyLevel,
        coordinateSystem: coordinates.coordinateSystem,
        formattedAddress,
        verificationStatus: 'unverified',
        privacyLevel: this.config.privacyLevel,
        dataRetentionDays: this.config.dataRetentionDays,
        gdprCompliant: true,
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
        sourcePlatform: 'web',
        collectionMethod: 'gps',
        blockchainVerified: false,
        isDeleted: false,
        ...additionalData
      };

      const { data, error } = await supabase
        .from('device_location_history')
        .insert(locationRecord)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to record location: ${error.message}`);
      }

      // Optionally record on blockchain
      if (this.config.enableBlockchainRecording) {
        await this.recordLocationOnBlockchain(data.id, coordinates);
      }

      return data;
    } catch (error) {
      console.error('Error recording device location:', error);
      throw error;
    }
  }

  /**
   * Get device location history with comprehensive filtering
   */
  async getDeviceLocationHistory(
    deviceId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      locationType?: DeviceLocationRecord['locationType'];
      limit?: number;
      includeDeleted?: boolean;
    } = {}
  ): Promise<DeviceLocationRecord[]> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      let query = supabase
        .from('device_location_history')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

      if (options.startDate) {
        query = query.gte('created_at', options.startDate.toISOString());
      }

      if (options.endDate) {
        query = query.lte('created_at', options.endDate.toISOString());
      }

      if (options.locationType) {
        query = query.eq('location_type', options.locationType);
      }

      if (!options.includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get location history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting device location history:', error);
      throw error;
    }
  }

  /**
   * Get current device location
   */
  async getCurrentDeviceLocation(deviceId: string): Promise<DeviceLocationRecord | null> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .rpc('get_device_current_location', { device_uuid: deviceId });

      if (error) {
        throw new Error(`Failed to get current location: ${error.message}`);
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting current device location:', error);
      throw error;
    }
  }

  /**
   * Verify device location
   */
  async verifyDeviceLocation(
    locationId: string,
    verificationStatus: DeviceLocationRecord['verificationStatus'],
    verificationMethod: DeviceLocationRecord['verificationMethod'],
    confidenceScore: number
  ): Promise<boolean> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .rpc('verify_device_location', {
          location_id: locationId,
          verification_status: verificationStatus,
          verification_method: verificationMethod,
          confidence_score: confidenceScore
        });

      if (error) {
        throw new Error(`Failed to verify location: ${error.message}`);
      }

      return data === true;
    } catch (error) {
      console.error('Error verifying device location:', error);
      throw error;
    }
  }

  /**
   * Create geofence for device
   */
  async createGeofence(geofence: Omit<DeviceGeofence, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeviceGeofence> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('device_geofences')
        .insert(geofence)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create geofence: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating geofence:', error);
      throw error;
    }
  }

  /**
   * Get device geofences
   */
  async getDeviceGeofences(deviceId: string): Promise<DeviceGeofence[]> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('device_geofences')
        .select('*')
        .eq('device_id', deviceId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get geofences: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting device geofences:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get formatted address
   */
  private async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      // Using a geocoding service (you can replace with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      
      // Format address components
      const addressParts = [];
      if (data.locality) addressParts.push(data.locality);
      if (data.principalSubdivision) addressParts.push(data.principalSubdivision);
      if (data.countryName) addressParts.push(data.countryName);
      
      return addressParts.join(', ');
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  /**
   * Record location on blockchain for immutable storage
   */
  private async recordLocationOnBlockchain(
    locationId: string,
    coordinates: LocationCoordinates
  ): Promise<void> {
    try {
      // Call blockchain service to record location
      const { data, error } = await supabase.functions.invoke('blockchain-anchor-real', {
        body: {
          deviceData: {
            deviceId: locationId,
            deviceModel: 'location_record',
            deviceBrand: 'stolen_platform',
            reportType: 'location_tracking',
            locationData: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              accuracy: coordinates.accuracy,
              timestamp: new Date().toISOString()
            }
          }
        }
      });

      if (error) {
        console.warn('Failed to record location on blockchain:', error);
        return;
      }

      // Update location record with blockchain hash
      await supabase
        .from('device_location_history')
        .update({
          blockchain_hash: data.data?.transactionHash,
          blockchain_verified: true,
          blockchain_timestamp: new Date().toISOString(),
          blockchain_network: 'mumbai'
        })
        .eq('id', locationId);

    } catch (error) {
      console.warn('Blockchain recording failed:', error);
    }
  }

  /**
   * Get location analytics and insights
   */
  async getLocationAnalytics(
    deviceId: string,
    analysisType?: LocationAnalytics['analysisType']
  ): Promise<LocationAnalytics[]> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      let query = supabase
        .from('location_analytics')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

      if (analysisType) {
        query = query.eq('analysis_type', analysisType);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get location analytics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting location analytics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive device location summary
   */
  async getDeviceLocationSummary(deviceId: string): Promise<any> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('device_location_summary')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (error) {
        throw new Error(`Failed to get location summary: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting device location summary:', error);
      throw error;
    }
  }

  /**
   * Start continuous location tracking
   */
  async startLocationTracking(
    deviceId: string,
    onLocationUpdate: (location: DeviceLocationRecord) => void,
    onError: (error: Error) => void
  ): Promise<() => void> {
    if (!this.config.enableBackgroundTracking) {
      throw new Error('Background location tracking is disabled');
    }

    let isTracking = true;
    let watchId: number | null = null;

    const trackLocation = async () => {
      if (!isTracking) return;

      try {
        const coordinates = await this.getCurrentLocation();
        const locationRecord = await this.recordDeviceLocation(
          deviceId,
          'checkpoint',
          coordinates
        );
        
        onLocationUpdate(locationRecord);
      } catch (error) {
        onError(error as Error);
      }

      if (isTracking) {
        setTimeout(trackLocation, this.config.trackingInterval);
      }
    };

    // Start tracking
    trackLocation();

    // Return stop function
    return () => {
      isTracking = false;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }
}

// Export singleton instance
export const locationService = new EnterpriseLocationService();

// Export utility functions
export const formatLocationForDisplay = (location: DeviceLocationRecord): string => {
  if (location.formattedAddress) {
    return location.formattedAddress;
  }
  
  const parts = [];
  if (location.streetAddress) parts.push(location.streetAddress);
  if (location.neighborhoodName) parts.push(location.neighborhoodName);
  if (location.cityName) parts.push(location.cityName);
  if (location.regionName) parts.push(location.regionName);
  if (location.countryCode) parts.push(location.countryCode);
  
  if (parts.length > 0) {
    return parts.join(', ');
  }
  
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};

export const getLocationAccuracyDescription = (accuracyLevel: LocationCoordinates['accuracyLevel']): string => {
  const descriptions = {
    exact: 'Exact location (< 5m accuracy)',
    approximate: 'Approximate location (5-50m accuracy)',
    neighborhood: 'Neighborhood level (50-500m accuracy)',
    district: 'District level (500m-2km accuracy)',
    city: 'City level (2-10km accuracy)',
    region: 'Region level (10-50km accuracy)',
    country: 'Country level (> 50km accuracy)',
    manual: 'Manually entered location'
  };
  
  return descriptions[accuracyLevel];
};

export const isLocationVerified = (location: DeviceLocationRecord): boolean => {
  return location.verificationStatus === 'verified' && 
         location.verificationConfidence !== undefined && 
         location.verificationConfidence >= 0.8;
};

export const getLocationRiskLevel = (location: DeviceLocationRecord): 'low' | 'medium' | 'high' | 'critical' => {
  if (!isLocationVerified(location)) {
    return 'high';
  }
  
  if (location.accuracyLevel === 'exact' || location.accuracyLevel === 'approximate') {
    return 'low';
  }
  
  if (location.accuracyLevel === 'neighborhood' || location.accuracyLevel === 'district') {
    return 'medium';
  }
  
  return 'high';
};
