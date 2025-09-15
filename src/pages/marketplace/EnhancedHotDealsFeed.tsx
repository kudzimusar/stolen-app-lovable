import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import HotDealsCountdown from "@/components/marketplace/HotDealsCountdown";
import RealtimeBidding from "@/components/marketplace/RealtimeBidding";
import HotDealsRealtimeService from "@/lib/services/hot-deals-realtime-service";
import HotDealsAIService from "@/lib/services/hot-deals-ai-service";
import { useOptimizedApiCall, usePerformanceMonitoring } from "@/hooks/usePerformanceOptimization";
import { 
  Flame as Fire, 
  Clock, 
  MessageCircle, 
  Heart,
  Eye,
  MapPin,
  ShieldCheck,
  Star,
  AlertTriangle,
  Package,
  TrendingUp,
  Zap,
  Filter,
  Search,
  SortAsc,
  Bell,
  Target,
  Gavel,
  Users,
  Plus
} from "lucide-react";

interface HotDeal {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  seller: string;
  rating: number;
  location: string;
  urgency: 'today-only' | '48-hours' | '1-week' | 'lightning' | 'flash' | 'negotiable';
  timeLeft: string;
  endTime: Date;
  description: string;
  verified: boolean;
  views: number;
  interested: number;
  messages: number;
  category: string;
  condition: string;
  bidding_enabled: boolean;
  boost_level: number;
  ai_score: number;
  demand_prediction: number;
  fraud_risk: number;
}

const EnhancedHotDealsFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Performance monitoring
  usePerformanceMonitoring('enhanced-hot-deals-feed');
  
  // State management
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBiddingOnly, setShowBiddingOnly] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Services
  const realtimeService = HotDealsRealtimeService.getInstance();
  const aiService = HotDealsAIService.getInstance();

  useEffect(() => {
    document.title = "Enhanced Hot Deals Feed | STOLEN";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.setAttribute('content', 'Real-time hot deals with AI-powered recommendations, live bidding, and instant notifications. Find the best device deals now!');
  }, []);

  // Enhanced hot deals data with AI features
  const hotDeals: HotDeal[] = [
    {
      id: "deal-1",
      title: "iPhone 15 Pro Max 256GB - Natural Titanium",
      price: 15999,
      originalPrice: 18999,
      seller: "TechPro_ZA",
      rating: 4.8,
      location: "Johannesburg, Gauteng",
      urgency: "lightning",
      timeLeft: "2h 15m",
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
      description: "LIGHTNING DEAL! Brand new iPhone 15 Pro Max in pristine condition. Original packaging, all accessories included.",
      verified: true,
      views: 342,
      interested: 87,
      messages: 23,
      category: "smartphones",
      condition: "Like New",
      bidding_enabled: true,
      boost_level: 3,
      ai_score: 95,
      demand_prediction: 89,
      fraud_risk: 5
    },
    {
      id: "deal-2",
      title: "MacBook Pro M3 14\" 512GB - Space Black",
      price: 28999,
      originalPrice: 32999,
      seller: "AppleExpert",
      rating: 4.9,
      location: "Cape Town, Western Cape",
      urgency: "today-only",
      timeLeft: "6h 42m",
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000 + 42 * 60 * 1000),
      description: "TODAY ONLY! MacBook Pro M3 with excellent performance. Perfect for creative professionals.",
      verified: true,
      views: 198,
      interested: 54,
      messages: 18,
      category: "laptops",
      condition: "Excellent",
      bidding_enabled: false,
      boost_level: 2,
      ai_score: 88,
      demand_prediction: 76,
      fraud_risk: 8
    },
    {
      id: "deal-3",
      title: "Samsung Galaxy S24 Ultra 512GB",
      price: 12999,
      originalPrice: 14999,
      seller: "Mobile_Guru",
      rating: 4.6,
      location: "Durban, KwaZulu-Natal",
      urgency: "flash",
      timeLeft: "45m",
      endTime: new Date(Date.now() + 45 * 60 * 1000),
      description: "FLASH SALE! Last 45 minutes! Samsung Galaxy S24 Ultra with S Pen included.",
      verified: true,
      views: 523,
      interested: 156,
      messages: 67,
      category: "smartphones",
      condition: "Like New",
      bidding_enabled: true,
      boost_level: 3,
      ai_score: 92,
      demand_prediction: 94,
      fraud_risk: 3
    },
    {
      id: "deal-4",
      title: "iPad Pro 12.9\" M2 256GB WiFi + Cellular",
      price: 14999,
      originalPrice: 18999,
      seller: "CreativeStudio",
      rating: 4.7,
      location: "Pretoria, Gauteng",
      urgency: "48-hours",
      timeLeft: "18h 30m",
      endTime: new Date(Date.now() + 18 * 60 * 60 * 1000 + 30 * 60 * 1000),
      description: "iPad Pro with Magic Keyboard and Apple Pencil included. Perfect for digital artists.",
      verified: true,
      views: 289,
      interested: 73,
      messages: 29,
      category: "tablets",
      condition: "Excellent",
      bidding_enabled: true,
      boost_level: 1,
      ai_score: 85,
      demand_prediction: 71,
      fraud_risk: 12
    },
    {
      id: "deal-5",
      title: "PlayStation 5 Digital Edition + Extra Controller",
      price: 7999,
      originalPrice: 9999,
      seller: "GameCollector",
      rating: 4.5,
      location: "Port Elizabeth, Eastern Cape",
      urgency: "1-week",
      timeLeft: "5d 12h",
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
      description: "PS5 Digital Edition in excellent condition. Includes extra DualSense controller and 3 games.",
      verified: true,
      views: 445,
      interested: 198,
      messages: 82,
      category: "gaming",
      condition: "Excellent",
      bidding_enabled: false,
      boost_level: 1,
      ai_score: 79,
      demand_prediction: 83,
      fraud_risk: 15
    }
  ];

  // Real-time updates effect
  useEffect(() => {
    if (!liveUpdatesEnabled) return;

    const handleDealUpdate = (data: any) => {
      toast({
        title: "Deal Updated! 🔥",
        description: `${data.title} has been updated`,
      });
    };

    const handleNewDeal = (data: any) => {
      toast({
        title: "New Hot Deal! ⚡",
        description: `${data.title} just went live!`,
      });
    };

    const handleNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      
      if (notification.priority > 7) {
        toast({
          title: notification.title,
          description: notification.message,
        });
      }
    };

    realtimeService.on('deal_updated', handleDealUpdate);
    realtimeService.on('deal_created', handleNewDeal);
    realtimeService.on('notification', handleNotification);

    return () => {
      realtimeService.off('deal_updated', handleDealUpdate);
      realtimeService.off('deal_created', handleNewDeal);
      realtimeService.off('notification', handleNotification);
    };
  }, [liveUpdatesEnabled, toast]);

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    const filtered = hotDeals.filter(deal => {
      const matchesFilter = filter === "all" || deal.urgency === filter;
      const matchesSearch = searchQuery === "" || 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.seller.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || deal.category === selectedCategory;
      const matchesPriceRange = 
        (priceRange.min === "" || deal.price >= parseFloat(priceRange.min)) &&
        (priceRange.max === "" || deal.price <= parseFloat(priceRange.max));
      const matchesBidding = !showBiddingOnly || deal.bidding_enabled;

      return matchesFilter && matchesSearch && matchesCategory && matchesPriceRange && matchesBidding;
    });

    // Sort deals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "urgency": {
          const urgencyOrder = { "flash": 4, "lightning": 3, "today-only": 2, "48-hours": 1, "1-week": 0, "negotiable": -1 };
          return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        }
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "ai_score":
          return b.ai_score - a.ai_score;
        case "popularity":
          return (b.views + b.interested) - (a.views + a.interested);
        case "ending_soon":
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [hotDeals, filter, searchQuery, selectedCategory, priceRange, showBiddingOnly, sortBy]);

  const urgencyColors = {
    "flash": "bg-red-600 text-white animate-pulse",
    "lightning": "bg-yellow-500 text-black",
    "today-only": "bg-orange-500 text-white",
    "48-hours": "bg-blue-500 text-white",
    "1-week": "bg-purple-500 text-white",
    "negotiable": "bg-gray-500 text-white"
  };

  const urgencyLabels = {
    "flash": "FLASH SALE",
    "lightning": "LIGHTNING DEAL",
    "today-only": "TODAY ONLY",
    "48-hours": "48 HOURS",
    "1-week": "1 WEEK",
    "negotiable": "NEGOTIABLE"
  };

  const handleContactSeller = (dealId: string) => {
    toast({
      title: "Opening Chat",
      description: "Starting secure conversation with seller...",
    });
    navigate(`/hot-deals-chat/${dealId}`);
  };

  const handleWatchDeal = (dealId: string) => {
    realtimeService.joinDeal(dealId);
    toast({
      title: "Now Watching! 👀",
      description: "You'll receive real-time updates for this deal",
    });
  };

  const handleNotificationToggle = async () => {
    if (liveUpdatesEnabled) {
      const hasPermission = await realtimeService.requestNotificationPermission();
      if (!hasPermission) {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings for real-time alerts",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              🔥 Enhanced Hot Deals Feed
            </h1>
            <p className="text-muted-foreground">Real-time deals with AI recommendations and live bidding</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={liveUpdatesEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setLiveUpdatesEnabled(!liveUpdatesEnabled);
                handleNotificationToggle();
              }}
            >
              <Bell className="w-4 h-4 mr-2" />
              Live Updates
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => navigate('/hot-deals')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Deal
            </Button>
          </div>
        </div>

        {/* Live Notifications Bar */}
        {notifications.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Live Updates:</span>
              <span className="text-sm text-blue-600">{notifications[0]?.message}</span>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals, sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="smartphones">Smartphones</SelectItem>
                <SelectItem value="laptops">Laptops</SelectItem>
                <SelectItem value="tablets">Tablets</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
              </SelectContent>
            </Select>

            {/* Urgency Filter */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="flash">Flash Sale</SelectItem>
                <SelectItem value="lightning">Lightning</SelectItem>
                <SelectItem value="today-only">Today Only</SelectItem>
                <SelectItem value="48-hours">48 Hours</SelectItem>
                <SelectItem value="1-week">1 Week</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgency">Urgency</SelectItem>
                <SelectItem value="ending_soon">Ending Soon</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="ai_score">AI Score</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div className="space-y-1">
              <label className="text-sm font-medium">Min Price</label>
              <Input
                type="number"
                placeholder="R 0"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Max Price</label>
              <Input
                type="number"
                placeholder="R 100,000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showBiddingOnly}
                  onChange={(e) => setShowBiddingOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Bidding only</span>
              </label>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showAIRecommendations}
                  onChange={(e) => setShowAIRecommendations(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">AI Recommendations</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedDeals.length} of {hotDeals.length} deals
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{notifications.length} recent updates</span>
            </div>
          </div>
        </div>

        {/* Hot Deals Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedDeals.map((deal) => (
            <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Deal Header */}
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
                
                {/* Urgency Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={urgencyColors[deal.urgency]}>
                    <Clock className="w-3 h-3 mr-1" />
                    {urgencyLabels[deal.urgency]}
                  </Badge>
                </div>

                {/* Boost Level */}
                {deal.boost_level > 0 && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Boosted
                    </Badge>
                  </div>
                )}

                {/* AI Score */}
                {showAIRecommendations && deal.ai_score > 80 && (
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Target className="w-3 h-3 mr-1" />
                      AI: {deal.ai_score}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Deal Content */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Title and Verification */}
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">{deal.title}</h3>
                      {deal.verified && (
                        <ShieldCheck className="w-5 h-5 text-green-500 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <HotDealsCountdown
                    dealId={deal.id}
                    endTime={deal.endTime}
                    urgencyLevel={deal.urgency}
                    currentPrice={deal.price}
                    originalPrice={deal.originalPrice}
                    views={deal.views}
                    interested={deal.interested}
                    messages={deal.messages}
                    showActions={false}
                  />

                  {/* Price and Discount */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        R{deal.price.toLocaleString()}
                      </div>
                      {deal.originalPrice > deal.price && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground line-through">
                            R{deal.originalPrice.toLocaleString()}
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            Save R{(deal.originalPrice - deal.price).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium">{deal.seller}</div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{deal.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="text-xs">{deal.location}</span>
                    </div>
                  </div>

                  {/* Deal Stats */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{deal.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{deal.interested}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{deal.messages}</span>
                    </div>
                    {deal.bidding_enabled && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Gavel className="w-3 h-3" />
                        <span>Bidding</span>
                      </div>
                    )}
                  </div>

                  {/* AI Insights */}
                  {showAIRecommendations && (
                    <div className="bg-purple-50 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-medium text-purple-700">AI Insights</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Demand:</span>
                          <span className="ml-1 font-medium">{deal.demand_prediction}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk:</span>
                          <span className={`ml-1 font-medium ${deal.fraud_risk < 10 ? 'text-green-600' : deal.fraud_risk < 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {deal.fraud_risk}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => navigate(`/marketplace/product/${deal.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleWatchDeal(deal.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => handleContactSeller(deal.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      
                      {deal.bidding_enabled ? (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => navigate(`/hot-deals-bidding/${deal.id}`)}
                        >
                          <Gavel className="w-4 h-4 mr-2" />
                          Bid Now
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedDeals.length === 0 && (
          <Card className="p-12 text-center">
            <Fire className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Hot Deals Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms to find more deals
            </p>
            <Button onClick={() => {
              setFilter("all");
              setSearchQuery("");
              setSelectedCategory("all");
              setPriceRange({ min: "", max: "" });
            }}>
              Clear All Filters
            </Button>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default EnhancedHotDealsFeed;
