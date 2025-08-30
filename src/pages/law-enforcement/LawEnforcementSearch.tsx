import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  MapPin,
  Clock,
  User,
  Phone
} from "lucide-react";

interface SearchResult {
  id: string;
  deviceName: string;
  serialNumber: string;
  owner: string;
  ownerPhone: string;
  lastSeen: string;
  location: string;
  status: 'stolen' | 'found' | 'recovered' | 'suspicious';
  reportDate: string;
}

const LawEnforcementSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          deviceName: 'iPhone 15 Pro',
          serialNumber: 'ABC123DEF456',
          owner: 'John Doe',
          ownerPhone: '+27123456789',
          lastSeen: '2024-01-20 14:30',
          location: 'Johannesburg CBD',
          status: 'stolen',
          reportDate: '2024-01-20'
        },
        {
          id: '2',
          deviceName: 'Samsung Galaxy S24',
          serialNumber: 'XYZ789GHI012',
          owner: 'Jane Smith',
          ownerPhone: '+27123456788',
          lastSeen: '2024-01-19 09:15',
          location: 'Cape Town Central',
          status: 'found',
          reportDate: '2024-01-19'
        }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stolen':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Stolen</Badge>;
      case 'found':
        return <Badge className="bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" />Found</Badge>;
      case 'recovered':
        return <Badge className="bg-blue-100 text-blue-800"><Shield className="w-3 h-3 mr-1" />Recovered</Badge>;
      case 'suspicious':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Suspicious</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Device Search</h1>
          <p className="text-muted-foreground">
            Search for devices by serial number, IMEI, or owner information
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Devices
            </CardTitle>
            <CardDescription>
              Enter device serial number, IMEI, or owner details to search
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter serial number, IMEI, or owner name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
              <CardDescription>
                Found {searchResults.length} device(s) matching your search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{result.deviceName}</h3>
                            <p className="text-sm text-muted-foreground">SN: {result.serialNumber}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {getStatusBadge(result.status)}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Owner:</span>
                              <span className="font-medium">{result.owner}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-medium">{result.ownerPhone}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Last Seen:</span>
                              <span className="font-medium">{result.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">{result.lastSeen}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Contact Owner</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common search patterns and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Search className="w-6 h-6 mb-2" />
                <span>Search by IMEI</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <User className="w-6 h-6 mb-2" />
                <span>Search by Owner</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <MapPin className="w-6 h-6 mb-2" />
                <span>Search by Location</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LawEnforcementSearch;
