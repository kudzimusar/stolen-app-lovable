import React, { useState, useEffect } from 'react';
import { useOptimizedSearch, useOptimizedApiCall, useImageOptimization } from '@/hooks/usePerformanceOptimization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'lost' | 'found' | 'stolen';
  location: string;
  imageUrl?: string;
  userId: string;
  createdAt: string;
}

export const OptimizedDeviceSearch: React.FC = () => {
  const [searchResults, setSearchResults] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use optimized search hook
  const { 
    query, 
    setQuery, 
    suggestions, 
    searchFunction 
  } = useOptimizedSearch('devices');

  // Use optimized API call for device details
  const { data: deviceStats } = useOptimizedApiCall(
    'device-stats',
    '/api/devices/stats',
    {},
    { ttl: 1800, tags: ['device-stats'] }
  );

  // Use image optimization
  const { optimizeImageUrl } = useImageOptimization();

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchFunction();
      setSearchResults(results.hits || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch();
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Optimized Device Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search devices..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
            )}
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button 
            onClick={handleSearch} 
            disabled={loading || !query.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Devices
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((device) => (
                <Card key={device.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {device.imageUrl ? (
                      <img
                        src={optimizeImageUrl(device.imageUrl, {
                          width: 300,
                          height: 200,
                          quality: 85,
                          format: 'webp'
                        })}
                        alt={device.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Badge 
                      variant={
                        device.status === 'found' ? 'default' : 
                        device.status === 'stolen' ? 'destructive' : 'secondary'
                      }
                      className="absolute top-2 right-2"
                    >
                      {device.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{device.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {device.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {device.category}
                      </span>
                      <span className="text-muted-foreground">
                        {device.location}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Statistics */}
      {deviceStats && (
        <Card>
          <CardHeader>
            <CardTitle>Device Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {deviceStats.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Devices</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {deviceStats.lost || 0}
                </div>
                <div className="text-sm text-muted-foreground">Lost</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {deviceStats.found || 0}
                </div>
                <div className="text-sm text-muted-foreground">Found</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizedDeviceSearch;
