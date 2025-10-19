// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Layers, 
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  Locate
} from 'lucide-react';

export interface OpenStreetMapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  title: string;
  description?: string;
  type: 'device' | 'user' | 'incident' | 'police' | 'custom';
  status?: 'active' | 'inactive' | 'warning' | 'danger';
  metadata?: Record<string, any>;
}

export interface OpenStreetMapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  accuracy?: number;
}

export interface OpenStreetMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: OpenStreetMapMarker[];
  onLocationSelect?: (location: OpenStreetMapLocation) => void;
  onMarkerClick?: (marker: OpenStreetMapMarker) => void;
  enableSearch?: boolean;
  enableLayers?: boolean;
  enableGPS?: boolean;
  enableClustering?: boolean;
  enableHeatmap?: boolean;
  className?: string;
  height?: string;
}

export const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  center = [-26.2041, 28.0473], // Johannesburg, South Africa
  zoom = 10,
  markers = [],
  onLocationSelect,
  onMarkerClick,
  enableSearch = true,
  enableLayers = true,
  enableGPS = true,
  enableClustering = true,
  enableHeatmap = false,
  className = '',
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapMarkers, setMapMarkers] = useState<any[]>(null);
  const [currentLocation, setCurrentLocation] = useState<OpenStreetMapLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('default');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Initialize OpenStreetMap with Leaflet
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        
        // Dynamic import for Leaflet
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        const mapInstance = L.map(mapRef.current).setView(center, zoom);
        
        // Add OpenStreetMap tile layer
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstance);

        // Add custom South African tile layer option
        const saTileLayer = L.tileLayer('https://tiles.openfreemap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenFreeMap contributors',
          maxZoom: 18
        });

        // Add satellite layer option
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 18
        });

        // Store layer references
        mapInstance.layerControl = L.control.layers({
          'OpenStreetMap': tileLayer,
          'South African': saTileLayer,
          'Satellite': satelliteLayer
        }, {}, {
          position: 'topright'
        }).addTo(mapInstance);

        setMap(mapInstance);
        setIsConnected(true);
        setIsLoading(false);

        // Add click listener for location selection
        if (onLocationSelect) {
          mapInstance.on('click', async (event: any) => {
            const lat = event.latlng.lat;
            const lng = event.latlng.lng;
            
            try {
              // Reverse geocoding with Nominatim
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en-ZA`
              );
              const data = await response.json();

              const location: OpenStreetMapLocation = {
                latitude: lat,
                longitude: lng,
                address: data.display_name,
                city: data.address?.city || data.address?.town || data.address?.village,
                province: data.address?.state,
                country: data.address?.country,
                accuracy: 10 // Default accuracy for click events
              };

              onLocationSelect(location);
            } catch (error) {
              console.error('Reverse geocoding failed:', error);
              onLocationSelect({
                latitude: lat,
                longitude: lng
              });
            }
          });
        }

      } catch (error) {
        console.error('OpenStreetMap initialization failed:', error);
        setIsLoading(false);
        setIsConnected(false);
        toast({
          title: "Map Error",
          description: "Failed to initialize map. Please check your internet connection.",
          variant: "destructive"
        });
      }
    };

    initializeMap();
  }, [center, zoom, onLocationSelect, toast]);

  // Add markers to map
  useEffect(() => {
    if (!map || !markers.length) return;

    const newMarkers: any[] = [];

    markers.forEach((marker) => {
      const L = require('leaflet');
      
      // Create custom icon based on marker type
      const icon = L.divIcon({
        className: `custom-marker ${marker.type} ${marker.status || 'active'}`,
        html: `<div class="marker-content">
          <div class="marker-icon">${getMarkerIcon(marker.type)}</div>
          <div class="marker-title">${marker.title}</div>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      const mapMarker = L.marker([marker.position[0], marker.position[1]], {
        icon: icon
      }).addTo(map);

      if (onMarkerClick) {
        mapMarker.on('click', () => onMarkerClick(marker));
      }

      newMarkers.push(mapMarker);
    });

    setMapMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => {
        if (marker.remove) marker.remove();
      });
    };
  }, [map, markers, onMarkerClick]);

  const getMarkerIcon = (type: string) => {
    const icons = {
      device: '📱',
      user: '👤',
      incident: '⚠️',
      police: '👮',
      custom: '📍'
    };
    return icons[type] || '📍';
  };

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const location: OpenStreetMapLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      setCurrentLocation(location);

      if (map) {
        map.setView([location.latitude, location.longitude], 15);
      }

      onLocationSelect?.(location);

      toast({
        title: "Location Found",
        description: `Accuracy: ${Math.round(location.accuracy || 0)}m`
      });
    } catch (error) {
      console.error('Geolocation error:', error);
      toast({
        title: "Location Error",
        description: "Could not get your current location",
        variant: "destructive"
      });
    }
  }, [map, onLocationSelect, toast]);

  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || !map) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&accept-language=en-ZA&countrycodes=za`
      );
      const results = await response.json();

      if (results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        map.setView([lat, lng], 15);

        const location: OpenStreetMapLocation = {
          latitude: lat,
          longitude: lng,
          address: result.display_name,
          city: result.address?.city || result.address?.town,
          province: result.address?.state,
          country: result.address?.country
        };

        onLocationSelect?.(location);
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find the specified location",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Could not search for location",
        variant: "destructive"
      });
    }
  }, [map, onLocationSelect, toast]);

  const zoomIn = () => {
    if (map) map.zoomIn();
  };

  const zoomOut = () => {
    if (map) map.zoomOut();
  };

  const getLayerColor = (layer: string) => {
    const colors = {
      default: 'bg-blue-100 text-blue-800',
      satellite: 'bg-green-100 text-green-800',
      'south_african': 'bg-purple-100 text-purple-800'
    };
    return colors[layer] || colors.default;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              OpenStreetMap
              {isConnected ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {enableLayers && (
                <select
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="default">OpenStreetMap</option>
                  <option value="satellite">Satellite</option>
                  <option value="south_african">South African</option>
                </select>
              )}
              {enableGPS && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                >
                  <Locate className="w-4 h-4 mr-1" />
                  GPS
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {enableSearch && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for a location in South Africa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
              <Button
                onClick={() => searchLocation(searchQuery)}
                disabled={!searchQuery.trim() || isLoading}
              >
                Search
              </Button>
            </div>
          )}

          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading map...</span>
                </div>
              </div>
            )}
            
            <div
              ref={mapRef}
              className="w-full rounded-lg border"
              style={{ height }}
            />
          </div>

          {/* Map Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={isLoading}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={isLoading}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {enableClustering && (
                <Badge variant="outline">Clustering</Badge>
              )}
              {enableHeatmap && (
                <Badge variant="outline">Heatmap</Badge>
              )}
            </div>
          </div>

          {markers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Map Markers ({markers.length})</h4>
              <div className="flex flex-wrap gap-2">
                {markers.map((marker) => (
                  <Badge
                    key={marker.id}
                    variant={marker.status === 'danger' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {marker.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {currentLocation && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Current Location:</span>
                <span className="text-muted-foreground">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </span>
              </div>
              {currentLocation.address && (
                <p className="text-xs text-muted-foreground mt-1">
                  {currentLocation.address}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom CSS for markers */}
      <style jsx>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        
        .marker-content {
          background: white;
          border: 2px solid #3B82F6;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
        }
        
        .marker-icon {
          font-size: 16px;
        }
        
        .marker-title {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
        }
        
        .custom-marker.device .marker-content {
          border-color: #10B981;
        }
        
        .custom-marker.user .marker-content {
          border-color: #8B5CF6;
        }
        
        .custom-marker.incident .marker-content {
          border-color: #F59E0B;
        }
        
        .custom-marker.police .marker-content {
          border-color: #EF4444;
        }
        
        .custom-marker.warning .marker-content {
          border-color: #F59E0B;
          background: #FEF3C7;
        }
        
        .custom-marker.danger .marker-content {
          border-color: #EF4444;
          background: #FEE2E2;
        }
      `}</style>
    </div>
  );
};



