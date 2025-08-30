import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Flame, 
  Search, 
  Plus, 
  Clock, 
  MapPin, 
  Star,
  Filter,
  Users,
  ShoppingBag,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import DeviceHistoryIntegration from "@/components/marketplace/DeviceHistoryIntegration";
import UrgencyBoost from "@/components/marketplace/UrgencyBoost";
import SmartSuggestions from "@/components/marketplace/SmartSuggestions";

const HotDealsHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Hot Deals Hub - STOLEN";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'AI-powered marketplace for urgent device deals and buyer requests');
    }
  }, []);

  // Mock data for hot deals
  const hotDeals = [
    {
      id: 1,
      title: "iPhone 14 Pro Max - 256GB",
      price: 899,
      originalPrice: 1099,
      seller: "TechDealer99",
      urgency: "high",
      timeLeft: "2h 15m",
      location: "San Francisco, CA",
      condition: "Like New",
      verified: true,
      matchScore: 95
    },
    {
      id: 2,
      title: "MacBook Air M2 - 512GB",
      price: 999,
      originalPrice: 1199,
      seller: "ApplePro",
      urgency: "medium",
      timeLeft: "18h 30m",
      location: "Austin, TX",
      condition: "Excellent",
      verified: true,
      matchScore: 88
    }
  ];

  // Mock data for hot buyer requests
  const hotBuyerRequests = [
    {
      id: 1,
      title: "Looking for iPad Pro 12.9\" (2022)",
      budget: 800,
      buyer: "CreativeDesigner",
      urgency: "high",
      specs: "256GB minimum, Space Gray preferred",
      location: "Los Angeles, CA",
      timePosted: "1h ago",
      matchScore: 92
    },
    {
      id: 2,
      title: "Need Samsung Galaxy S24 Ultra",
      budget: 1000,
      buyer: "PhotoPro",
      urgency: "medium",
      specs: "512GB, Any color except Pink",
      location: "Miami, FL",
      timePosted: "3h ago",
      matchScore: 85
    }
  ];

  const urgencyColors = {
    high: "destructive",
    medium: "warning",
    low: "secondary"
  };

  const handleCreateHotDeal = () => {
    navigate('/hot-deals');
  };

  const handleCreateBuyerRequest = () => {
    navigate('/hot-buyer-request');
  };

  const handleDealClick = (dealId: number) => {
    navigate(`/hot-deals-chat/${dealId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Hot Deals Hub"
        showLogo={false}
      />
      
      <main className="container mx-auto px-4 pt-20 pb-24 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-8 h-8 text-destructive" />
            <h1 className="text-3xl font-bold">Hot Deals Hub</h1>
            <Zap className="w-8 h-8 text-warning" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered matching for urgent sellers and buyers. Create hot deals or post buyer requests to get instant matches.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">24</div>
              <div className="text-sm text-muted-foreground">Active Deals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold">18</div>
              <div className="text-sm text-muted-foreground">Hot Buyers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <div className="text-2xl font-bold">7</div>
              <div className="text-sm text-muted-foreground">Matches Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search deals or requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="hot-deals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hot-deals" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Hot Deals
            </TabsTrigger>
            <TabsTrigger value="hot-buyers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Hot Buyers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hot-deals" className="space-y-4">
            {/* Create Hot Deal CTA */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Got a device to sell urgently?</h3>
                    <p className="text-sm text-muted-foreground">Create a hot deal and get matched with buyers instantly</p>
                  </div>
                  <Button onClick={handleCreateHotDeal} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Hot Deal
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hot Deals List */}
            <div className="space-y-4">
              {hotDeals.map((deal) => (
                <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDealClick(deal.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{deal.title}</h3>
                          {deal.verified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                          <Badge variant={urgencyColors[deal.urgency as keyof typeof urgencyColors] as any} className="text-xs">
                            {deal.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {deal.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {deal.timeLeft} left
                          </span>
                          <span>Condition: {deal.condition}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">${deal.price}</span>
                          <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}% off
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          <span className="text-sm font-medium">{deal.matchScore}% match</span>
                        </div>
                        <p className="text-sm text-muted-foreground">by {deal.seller}</p>
                        <UrgencyBoost dealId={deal.id.toString()} />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <DeviceHistoryIntegration deviceId={deal.id.toString()} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hot-buyers" className="space-y-4">
            {/* Create Buyer Request CTA */}
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Looking for a specific device?</h3>
                    <p className="text-sm text-muted-foreground">Post a buyer request and get matched with sellers instantly</p>
                  </div>
                  <Button variant="outline" onClick={handleCreateBuyerRequest} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Post Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hot Buyer Requests List */}
            <div className="space-y-4">
              {hotBuyerRequests.map((request) => (
                <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.title}</h3>
                          <Badge variant={urgencyColors[request.urgency as keyof typeof urgencyColors] as any} className="text-xs">
                            {request.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {request.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {request.timePosted}
                          </span>
                        </div>

                        <p className="text-sm mb-2">{request.specs}</p>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">Budget: ${request.budget}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          <span className="text-sm font-medium">{request.matchScore}% match</span>
                        </div>
                        <p className="text-sm text-muted-foreground">by {request.buyer}</p>
                        <Button size="sm" className="mt-2">
                          Offer Deal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <SmartSuggestions
        ownedDevices={[]}
        currentProduct={null}
      />

      <BottomNavigation />
    </div>
  );
};

export default HotDealsHub;