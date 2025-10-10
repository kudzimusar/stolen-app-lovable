/**
 * =============================================================================
 * ENTERPRISE LOCATION MANAGER COMPONENT
 * =============================================================================
 * Comprehensive location management component providing:
 * - Real-time location tracking and display
 * - Location history visualization
 * - Geofencing management
 * - Location verification and validation
 * - Privacy controls and settings
 * - Blockchain integration display
 * - Advanced analytics and insights
 * =============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Navigation, 
  Shield, 
  Clock, 
  Globe, 
  Settings, 
  Eye, 
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  Map,
  History,
  Bell,
  Lock,
  Unlock,
  TrendingUp,
  BarChart3,
  Activity,
  Smartphone,
  Wifi,
  Bluetooth,
  Satellite
} from 'lucide-react';
import { 
  EnterpriseLocationService,
  DeviceLocationRecord,
  DeviceGeofence,
  LocationAnalytics,
  formatLocationForDisplay,
  getLocationAccuracyDescription,
  isLocationVerified,
  getLocationRiskLevel,
  LocationTrackingConfig
} from '@/services/enterprise-location-service';
import { useToast } from '@/hooks/use-toast';

interface EnterpriseLocationManagerProps {
  deviceId: string;
  deviceName?: string;
  showAdvancedFeatures?: boolean;
  enableRealTimeTracking?: boolean;
  onLocationUpdate?: (location: DeviceLocationRecord) => void;
  onGeofenceAlert?: (geofence: DeviceGeofence, location: DeviceLocationRecord) => void;
}

export const EnterpriseLocationManager: React.FC<EnterpriseLocationManagerProps> = ({
  deviceId,
  deviceName = 'Device',
  showAdvancedFeatures = true,
  enableRealTimeTracking = false,
  onLocationUpdate,
  onGeofenceAlert
}) => {
  const [currentLocation, setCurrentLocation] = useState<DeviceLocationRecord | null>(null);
  const [locationHistory, setLocationHistory] = useState<DeviceLocationRecord[]>([]);
  const [geofences, setGeofences] = useState<DeviceGeofence[]>([]);
  const [analytics, setAnalytics] = useState<LocationAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'standard' | 'private' | 'restricted'>('standard');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [trackingConfig, setTrackingConfig] = useState<LocationTrackingConfig>({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    enableBackgroundTracking: false,
    trackingInterval: 30000,
    enableGeofencing: true,
    enableBlockchainRecording: true,
    privacyLevel: 'standard',
    dataRetentionDays: 2555
  });

  const { toast } = useToast();
  const locationService = new EnterpriseLocationService(trackingConfig);

  // Load initial data
  useEffect(() => {
    loadLocationData();
  }, [deviceId]);

  const loadLocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current location
      const current = await locationService.getCurrentDeviceLocation(deviceId);
      setCurrentLocation(current);

      // Load location history
      const history = await locationService.getDeviceLocationHistory(deviceId, {
        limit: 50,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      });
      setLocationHistory(history);

      // Load geofences
      const geofenceData = await locationService.getDeviceGeofences(deviceId);
      setGeofences(geofenceData);

      // Load analytics if advanced features enabled
      if (showAdvancedFeatures) {
        const analyticsData = await locationService.getLocationAnalytics(deviceId);
        setAnalytics(analyticsData);
      }

    } catch (error) {
      console.error('Error loading location data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load location data');
      toast({
        title: "Error Loading Location Data",
        description: error instanceof Error ? error.message : 'Failed to load location data',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentLocation = async () => {
    try {
      setLoading(true);
      const coordinates = await locationService.getCurrentLocation();
      const locationRecord = await locationService.recordDeviceLocation(
        deviceId,
        'last_seen',
        coordinates
      );
      
      setCurrentLocation(locationRecord);
      onLocationUpdate?.(locationRecord);
      
      toast({
        title: "Location Updated",
        description: "Device location has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Location Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update location',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startTracking = useCallback(async () => {
    try {
      const stopTracking = await locationService.startLocationTracking(
        deviceId,
        (location) => {
          setCurrentLocation(location);
          setLocationHistory(prev => [location, ...prev.slice(0, 49)]);
          onLocationUpdate?.(location);
        },
        (error) => {
          console.error('Tracking error:', error);
          toast({
            title: "Location Tracking Error",
            description: error.message,
            variant: "destructive"
          });
        }
      );

      setIsTracking(true);
      
      // Store stop function for cleanup
      (window as any).stopLocationTracking = stopTracking;
      
      toast({
        title: "Location Tracking Started",
        description: "Real-time location tracking is now active",
      });
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast({
        title: "Failed to Start Tracking",
        description: error instanceof Error ? error.message : 'Failed to start location tracking',
        variant: "destructive"
      });
    }
  }, [deviceId, locationService, onLocationUpdate, toast]);

  const stopTracking = () => {
    if ((window as any).stopLocationTracking) {
      (window as any).stopLocationTracking();
      (window as any).stopLocationTracking = null;
    }
    setIsTracking(false);
    toast({
      title: "Location Tracking Stopped",
      description: "Real-time location tracking has been stopped",
    });
  };

  const getVerificationIcon = (status: DeviceLocationRecord['verificationStatus']) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'unverified': return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'expired': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'standard': return <Eye className="w-4 h-4" />;
      case 'private': return <EyeOff className="w-4 h-4" />;
      case 'restricted': return <Lock className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  if (loading && !currentLocation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading location data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Location Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Current Location
              </CardTitle>
              <CardDescription>
                Real-time location information for {deviceName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={updateCurrentLocation}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Update
              </Button>
              {enableRealTimeTracking && (
                <Button
                  variant={isTracking ? "destructive" : "default"}
                  size="sm"
                  onClick={isTracking ? stopTracking : startTracking}
                >
                  {isTracking ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Tracking
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Tracking
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentLocation ? (
            <div className="space-y-4">
              {/* Location Display */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {formatLocationForDisplay(currentLocation)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getLocationAccuracyDescription(currentLocation.accuracyLevel)}
                    </p>
                    {currentLocation.accuracyMeters && (
                      <p className="text-xs text-muted-foreground">
                        Accuracy: ±{currentLocation.accuracyMeters.toFixed(0)}m
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getVerificationIcon(currentLocation.verificationStatus)}
                    <Badge 
                      variant="outline" 
                      className={getRiskLevelColor(getLocationRiskLevel(currentLocation))}
                    >
                      {getLocationRiskLevel(currentLocation).toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Coordinates:</span>
                  <p className="font-mono text-xs">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p>{new Date(currentLocation.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Collection Method:</span>
                  <div className="flex items-center gap-1">
                    {currentLocation.collectionMethod === 'gps' && <Satellite className="w-3 h-3" />}
                    {currentLocation.collectionMethod === 'wifi' && <Wifi className="w-3 h-3" />}
                    {currentLocation.collectionMethod === 'bluetooth' && <Bluetooth className="w-3 h-3" />}
                    <span className="capitalize">{currentLocation.collectionMethod || 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Privacy Level:</span>
                  <div className="flex items-center gap-1">
                    {getPrivacyIcon(currentLocation.privacyLevel)}
                    <span className="capitalize">{currentLocation.privacyLevel}</span>
                  </div>
                </div>
              </div>

              {/* Blockchain Verification */}
              {currentLocation.blockchainVerified && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Location verified on blockchain
                    </span>
                  </div>
                  {currentLocation.blockchainHash && (
                    <p className="text-xs text-green-600 font-mono mt-1">
                      Hash: {currentLocation.blockchainHash.substring(0, 20)}...
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No location data available</p>
              <Button
                variant="outline"
                size="sm"
                onClick={updateCurrentLocation}
                className="mt-4"
                disabled={loading}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Current Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Features */}
      {showAdvancedFeatures && (
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="geofences">Geofences</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Location History
                </CardTitle>
                <CardDescription>
                  Recent location records for {deviceName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {locationHistory.length > 0 ? (
                  <div className="space-y-3">
                    {locationHistory.slice(0, 10).map((location) => (
                      <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {formatLocationForDisplay(location)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(location.createdAt).toLocaleString()} • 
                            {getLocationAccuracyDescription(location.accuracyLevel)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getVerificationIcon(location.verificationStatus)}
                          {location.blockchainVerified && (
                            <Shield className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No location history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geofences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Geofences
                </CardTitle>
                <CardDescription>
                  Location-based alerts and monitoring zones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {geofences.length > 0 ? (
                  <div className="space-y-3">
                    {geofences.map((geofence) => (
                      <div key={geofence.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{geofence.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {geofence.centerLat.toFixed(6)}, {geofence.centerLng.toFixed(6)} • 
                            Radius: {geofence.radiusMeters}m
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {geofence.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={geofence.isActive ? "default" : "secondary"}>
                            {geofence.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {geofence.alertEnabled && (
                            <Bell className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No geofences configured</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Create Geofence
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Location Analytics
                </CardTitle>
                <CardDescription>
                  Insights and patterns from location data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.map((analysis) => (
                      <div key={analysis.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">
                            {analysis.analysisType} Analysis
                          </h4>
                          <Badge className={getRiskLevelColor(analysis.riskLevel || 'low')}>
                            {analysis.riskLevel?.toUpperCase() || 'LOW'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Confidence: {(analysis.confidenceScore * 100).toFixed(1)}%
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Period: {new Date(analysis.analysisPeriodStart).toLocaleDateString()} - 
                          {new Date(analysis.analysisPeriodEnd).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No analytics data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Location Settings
                </CardTitle>
                <CardDescription>
                  Configure location tracking and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Privacy Level</label>
                  <div className="flex gap-2">
                    {(['public', 'standard', 'private', 'restricted'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={privacyLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPrivacyLevel(level)}
                      >
                        {getPrivacyIcon(level)}
                        <span className="ml-2 capitalize">{level}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Show Sensitive Data</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                  >
                    {showSensitiveData ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showSensitiveData ? "Hide" : "Show"} Sensitive Data
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Retention</label>
                  <p className="text-sm text-muted-foreground">
                    Location data will be retained for {trackingConfig.dataRetentionDays} days
                  </p>
                  <Progress value={(2555 - trackingConfig.dataRetentionDays) / 2555 * 100} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnterpriseLocationManager;
