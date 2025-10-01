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
  Loader2
} from 'lucide-react';

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  title: string;
  description?: string;
  type: 'device' | 'user' | 'incident' | 'police' | 'custom';
  status?: 'active' | 'inactive' | 'warning' | 'danger';
  metadata?: Record<string, any>;
}

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  accuracy?: number;
}

export interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  onLocationSelect?: (location: MapLocation) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  enableSearch?: boolean;
  enableLayers?: boolean;
  enableGPS?: boolean;
  className?: string;
  height?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center = [-26.2041, 28.0473], // Johannesburg, South Africa
  zoom = 10,
  markers = [],
  onLocationSelect,
  onMarkerClick,
  enableSearch = true,
  enableLayers = true,
  enableGPS = true,
  className = '',
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('default');
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        
        // Load Google Maps script
        const { loadGoogleMapsScript } = await import('@/lib/googleMapsLoader');
        
        try {
          await loadGoogleMapsScript();
          
          // Check if Google Maps is now available
          if (typeof window !== 'undefined' && window.google && window.google.maps) {
            const mapInstance = new window.google.maps.Map(mapRef.current, {
              center: { lat: center[0], lng: center[1] },
              zoom: zoom,
              mapTypeId: window.google.maps.MapTypeId.ROADMAP,
              styles: getMapStyles(selectedLayer),
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: enableLayers,
              scaleControl: true,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: true
            });

            setMap(mapInstance);

            // Add click listener for location selection
            if (onLocationSelect) {
              mapInstance.addListener('click', async (event: any) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                
                try {
                  // Reverse geocoding
                  const geocoder = new window.google.maps.Geocoder();
                  const result = await geocoder.geocode({
                    location: { lat, lng }
                  });

                  const location: MapLocation = {
                    latitude: lat,
                    longitude: lng,
                    address: result.results[0]?.formatted_address,
                    accuracy: 10 // Default accuracy
                  };

                  onLocationSelect(location);
                } catch (error) {
                  console.error('Geocoding failed:', error);
                  onLocationSelect({
                    latitude: lat,
                    longitude: lng
                  });
                }
              });
            }

            setIsLoading(false);
          } else {
            // Fallback to OpenStreetMap
            await initializeOpenStreetMap();
          }
        } catch (googleMapsError) {
          console.log('Google Maps not available, using OpenStreetMap fallback');
          await initializeOpenStreetMap();
        }
      } catch (error) {
        console.error('Map initialization failed:', error);
        setIsLoading(false);
        toast({
          title: "Map Error",
          description: "Failed to initialize map. Using fallback.",
          variant: "destructive"
        });
      }
    };

    initializeMap();
    
    // Cleanup function
    return () => {
      if (map) {
        if (map.remove) {
          // Leaflet cleanup
          map.remove();
        }
        setMap(null);
      }
    };
  }, []);

  // Initialize OpenStreetMap fallback
  const initializeOpenStreetMap = async () => {
    try {
      // Check if map container already has a map
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        console.log('Map container already initialized, skipping...');
        setIsLoading(false);
        return;
      }

      // Dynamic import for Leaflet
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (!mapRef.current) {
        setIsLoading(false);
        return;
      }

      const mapInstance = L.map(mapRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance);

      // Add click listener for location selection
      if (onLocationSelect) {
        mapInstance.on('click', async (e: any) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          
          try {
            // Reverse geocoding with Nominatim
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const result = await response.json();

            const location: MapLocation = {
              latitude: lat,
              longitude: lng,
              address: result.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              accuracy: 10
            };

            setCurrentLocation(location);
            onLocationSelect(location);
            
            toast({
              title: "Location Selected",
              description: location.address
            });
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            const location: MapLocation = {
              latitude: lat,
              longitude: lng,
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            };
            setCurrentLocation(location);
            onLocationSelect(location);
          }
        });
      }

      setMap(mapInstance);
      setIsLoading(false);
    } catch (error) {
      console.error('OpenStreetMap initialization failed:', error);
      setIsLoading(false);
    }
  };

  // Add markers to map
  useEffect(() => {
    if (!map || !markers.length) return;

    const newMarkers: any[] = [];

    markers.forEach((marker) => {
      const markerOptions = {
        position: { lat: marker.position[0], lng: marker.position[1] },
        title: marker.title,
        icon: getMarkerIcon(marker.type, marker.status)
      };

      let mapMarker;
      
      if (window.google && window.google.maps) {
        mapMarker = new window.google.maps.Marker({
          ...markerOptions,
          map: map
        });
      } else {
        // Leaflet fallback
        const L = require('leaflet');
        mapMarker = L.marker([marker.position[0], marker.position[1]], {
          title: marker.title
        }).addTo(map);
      }

      if (onMarkerClick) {
        mapMarker.addListener('click', () => onMarkerClick(marker));
      }

      newMarkers.push(mapMarker);
    });

    setMapMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => {
        if (marker.setMap) marker.setMap(null);
        else if (marker.remove) marker.remove();
      });
    };
  }, [map, markers, onMarkerClick]);

  const getMarkerIcon = (type: string, status?: string) => {
    if (!window.google || !window.google.maps) return undefined;

    const colors = {
      device: '#3B82F6',
      user: '#10B981',
      incident: '#F59E0B',
      police: '#EF4444',
      custom: '#8B5CF6'
    };

    const statusColors = {
      active: '#10B981',
      inactive: '#6B7280',
      warning: '#F59E0B',
      danger: '#EF4444'
    };

    const color = status ? statusColors[status] : colors[type] || colors.custom;

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8
    };
  };

  const getMapStyles = (layer: string) => {
    const styles = {
      default: [],
      dark: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
      ],
      satellite: []
    };

    return styles[layer] || styles.default;
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

      const location: MapLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      setCurrentLocation(location);

      if (map && window.google && window.google.maps) {
        map.setCenter({ lat: location.latitude, lng: location.longitude });
        map.setZoom(15);
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
      if (window.google && window.google.maps) {
        // Google Maps geocoding
        const geocoder = new window.google.maps.Geocoder();
        const results = await geocoder.geocode({ address: query });

        if (results.results.length > 0) {
          const result = results.results[0];
          const location = result.geometry.location;

          map.setCenter(location);
          map.setZoom(15);

          const mapLocation: MapLocation = {
            latitude: location.lat(),
            longitude: location.lng(),
            address: result.formatted_address
          };

          onLocationSelect?.(mapLocation);
        }
      } else {
        // OpenStreetMap Nominatim geocoding (fallback)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const results = await response.json();

        if (results.length > 0) {
          const result = results[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          // Leaflet map
          map.setView([lat, lng], 15);

          const mapLocation: MapLocation = {
            latitude: lat,
            longitude: lng,
            address: result.display_name
          };

          setCurrentLocation(mapLocation);
          onLocationSelect?.(mapLocation);

          toast({
            title: "Location Found",
            description: result.display_name
          });
        } else {
          toast({
            title: "Not Found",
            description: `Could not find "${query}"`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Could not find the location",
        variant: "destructive"
      });
    }
  }, [map, onLocationSelect, toast, setCurrentLocation]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Interactive Map
          </CardTitle>
          <div className="flex items-center gap-2">
            {enableLayers && (
              <select
                value={selectedLayer}
                onChange={(e) => setSelectedLayer(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="satellite">Satellite</option>
              </select>
            )}
            {enableGPS && (
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isLoading}
              >
                <Navigation className="w-4 h-4 mr-1" />
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
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submission
                    e.stopPropagation();
                    searchLocation(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                searchLocation(searchQuery);
              }}
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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">Location Selected</span>
            </div>
            <div className="mt-2 text-xs text-green-800">
              <div className="font-mono">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </div>
              {currentLocation.address && (
                <p className="mt-1 text-green-700">
                  📍 {currentLocation.address}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
