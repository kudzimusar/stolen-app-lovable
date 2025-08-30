import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Eye, 
  Share2,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  date: string;
  contact: {
    name: string;
    phone?: string;
    email?: string;
  };
  status: 'active' | 'resolved' | 'expired';
  deviceType?: string;
  reward?: number;
  verified: boolean;
}

const LostFoundBoard = () => {
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');

  // Mock data for lost and found items
  const [items, setItems] = useState<LostFoundItem[]>([
    {
      id: '1',
      type: 'lost',
      title: 'iPhone 15 Pro Max - Lost in Sandton',
      description: 'Lost my iPhone 15 Pro Max in Sandton City Mall. Black color, 256GB. Has a clear case with a photo of my dog on the lock screen.',
      location: 'Sandton City Mall, Johannesburg',
      date: '2024-12-15',
      contact: {
        name: 'Sarah M.',
        phone: '+27 82 123 4567',
        email: 'sarah@email.com'
      },
      status: 'active',
      deviceType: 'iPhone 15 Pro Max',
      reward: 5000,
      verified: true
    },
    {
      id: '2',
      type: 'found',
      title: 'Samsung Galaxy S23 Found in Cape Town',
      description: 'Found a Samsung Galaxy S23 in the V&A Waterfront area. Blue color, no case. Please contact if this is yours.',
      location: 'V&A Waterfront, Cape Town',
      date: '2024-12-14',
      contact: {
        name: 'Mike D.',
        phone: '+27 83 987 6543'
      },
      status: 'active',
      deviceType: 'Samsung Galaxy S23',
      verified: true
    },
    {
      id: '3',
      type: 'lost',
      title: 'MacBook Pro - Lost in Durban',
      description: 'Lost my MacBook Pro at Gateway Theatre of Shopping. Space Gray, 13-inch. Has a sticker of the South African flag.',
      location: 'Gateway Theatre of Shopping, Durban',
      date: '2024-12-13',
      contact: {
        name: 'David K.',
        email: 'david@email.com'
      },
      status: 'active',
      deviceType: 'MacBook Pro',
      reward: 8000,
      verified: false
    }
  ]);

  const filteredItems = items.filter(item => {
    const matchesType = item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesType && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><Clock className="w-3 h-3 mr-1" />Active</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case 'expired':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'lost' ? 
      <AlertTriangle className="w-4 h-4 text-red-500" /> : 
      <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader>
        <BackButton />
        <h1 className="text-xl font-semibold">Lost & Found Board</h1>
      </AppHeader>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Lost & Found Items
            </CardTitle>
            <CardDescription>
              Find lost devices or report found items in your area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by device, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('resolved')}
              >
                Resolved
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'lost' | 'found')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Lost Items ({items.filter(i => i.type === 'lost').length})
            </TabsTrigger>
            <TabsTrigger value="found" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Found Items ({items.filter(i => i.type === 'found').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  {activeTab === 'lost' ? (
                    <>
                      <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground" />
                      <h3 className="font-semibold">No Lost Items Found</h3>
                      <p className="text-muted-foreground">
                        No lost items match your search criteria. Try adjusting your filters.
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground" />
                      <h3 className="font-semibold">No Found Items</h3>
                      <p className="text-muted-foreground">
                        No found items match your search criteria. Try adjusting your filters.
                      </p>
                    </>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(item.type)}
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {item.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(item.date).toLocaleDateString()}
                              </div>
                              {item.deviceType && (
                                <Badge variant="outline">{item.deviceType}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          {item.verified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{item.description}</p>
                      
                      {item.reward && (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                            Reward: R{item.reward.toLocaleString()}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {item.contact.name}
                          </div>
                          {item.contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {item.contact.phone}
                            </div>
                          )}
                          {item.contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {item.contact.email}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add New Item Button */}
        <div className="fixed bottom-6 right-6">
          <Button size="lg" className="rounded-full shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Report {activeTab === 'lost' ? 'Lost' : 'Found'} Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LostFoundBoard;
