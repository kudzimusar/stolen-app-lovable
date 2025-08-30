import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Flame as Fire, 
  Clock, 
  MessageCircle, 
  Heart,
  Eye,
  MapPin,
  ShieldCheck,
  Star,
  AlertTriangle
} from "lucide-react";

const HotDealsFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    document.title = "Hot Deals Feed | STOLEN";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.setAttribute('content', 'Browse urgent device sales with time-sensitive offers. Connect directly with sellers for immediate deals.');
  }, []);

  // Mock hot deals data - in real app would come from API
  const hotDeals = [
    {
      id: 1,
      title: "iPhone 15 Pro Max 256GB",
      price: 16999,
      originalPrice: 18999,
      image: "https://placehold.co/300x200?text=iPhone",
      seller: "TechPro_ZA",
      rating: 4.8,
      location: "Sandton, Gauteng",
      urgency: "today-only",
      timeLeft: "6 hours",
      description: "Pristine condition, all accessories included. Need quick sale due to upgrade.",
      verified: true,
      views: 45,
      interested: 12,
      messages: 8
    },
    {
      id: 2,
      title: "MacBook Pro M3 14-inch",
      price: 28999,
      originalPrice: 32999,
      image: "https://placehold.co/300x200?text=MacBook",
      seller: "AppleExpert",
      rating: 4.9,
      location: "Cape Town, Western Cape",
      urgency: "48-hours",
      timeLeft: "1 day 4 hours",
      description: "Barely used, still under warranty. Moving abroad, must sell.",
      verified: true,
      views: 89,
      interested: 23,
      messages: 15
    },
    {
      id: 3,
      title: "Samsung Galaxy S24 Ultra",
      price: 12999,
      originalPrice: 14999,
      image: "https://placehold.co/300x200?text=Galaxy",
      seller: "Mobile_Guru",
      rating: 4.6,
      location: "Durban, KwaZulu-Natal",
      urgency: "1-week",
      timeLeft: "5 days",
      description: "Excellent condition, with S-Pen and case. Open to reasonable offers.",
      verified: true,
      views: 67,
      interested: 18,
      messages: 22
    },
    {
      id: 4,
      title: "iPad Pro 12.9 M2",
      price: 15999,
      originalPrice: 18999,
      image: "https://placehold.co/300x200?text=iPad",
      seller: "CreativeStudio",
      rating: 4.7,
      location: "Pretoria, Gauteng",
      urgency: "negotiable",
      timeLeft: "Open",
      description: "Perfect for creative work, includes Magic Keyboard and Apple Pencil.",
      verified: false,
      views: 34,
      interested: 9,
      messages: 5
    },
    {
      id: 5,
      title: "PlayStation 5 Digital Edition",
      price: 7999,
      originalPrice: 9999,
      image: "https://placehold.co/300x200?text=PS5",
      seller: "GameCollector",
      rating: 4.5,
      location: "Port Elizabeth, Eastern Cape",
      urgency: "today-only",
      timeLeft: "3 hours",
      description: "Urgent sale! Like new condition, includes extra controller.",
      verified: true,
      views: 123,
      interested: 31,
      messages: 28
    }
  ];

  const urgencyColors = {
    "today-only": "bg-destructive text-destructive-foreground",
    "48-hours": "bg-orange-500 text-white",
    "1-week": "bg-primary text-primary-foreground",
    "negotiable": "bg-muted text-muted-foreground"
  };

  const urgencyLabels = {
    "today-only": "Today Only",
    "48-hours": "48 Hours",
    "1-week": "1 Week",
    "negotiable": "Negotiable"
  };

  const handleContactSeller = (dealId: number) => {
    toast({
      title: "Opening Chat",
      description: "Starting secure conversation with seller...",
    });
    // In real app, would open chat interface
    navigate(`/chat/seller/${dealId}`);
  };

  const handleFlagDeal = (dealId: number) => {
    toast({
      title: "Deal Reported",
      description: "Thank you for helping keep our marketplace safe.",
    });
  };

  const filteredDeals = filter === "all" 
    ? hotDeals 
    : hotDeals.filter(deal => deal.urgency === filter);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Hot Deals" showBackButton backTo="/marketplace" />
      
      <main className="container-responsive spacing-responsive pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full">
              <Fire className="w-4 h-4" />
              <span className="font-medium">Hot Deals</span>
            </div>
            <h1 className="text-2xl font-bold">Time-Sensitive Offers</h1>
            <p className="text-muted-foreground">
              Connect directly with sellers for immediate deals on verified devices
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All Deals" },
              { id: "today-only", label: "Today Only" },
              { id: "48-hours", label: "48 Hours" },
              { id: "1-week", label: "This Week" },
              { id: "negotiable", label: "Negotiable" }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={filter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(tab.id)}
                className="whitespace-nowrap"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Hot Deals Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDeals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden hover:shadow-card transition-all">
                <div className="relative">
                  <img 
                    src={deal.image} 
                    alt={deal.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={urgencyColors[deal.urgency as keyof typeof urgencyColors]}>
                      <Clock className="w-3 h-3 mr-1" />
                      {urgencyLabels[deal.urgency as keyof typeof urgencyLabels]}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    {deal.verified && (
                      <Badge variant="secondary" className="bg-verified/90 text-verified-foreground">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {deal.timeLeft}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{deal.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        R{deal.price.toLocaleString()}
                      </span>
                      {deal.originalPrice && (
                        <span className="text-muted-foreground line-through">
                          R{deal.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{deal.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{deal.rating}</span>
                      <span className="text-muted-foreground">• {deal.seller}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{deal.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{deal.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{deal.interested}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{deal.messages}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleContactSeller(deal.id)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Seller
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleFlagDeal(deal.id)}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredDeals.length === 0 && (
            <Card className="p-8 text-center">
              <Fire className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Hot Deals Found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === "all" 
                  ? "No urgent deals available right now. Check back soon!"
                  : `No deals available for ${urgencyLabels[filter as keyof typeof urgencyLabels]} timeframe.`
                }
              </p>
              <Button variant="outline" onClick={() => setFilter("all")}>
                View All Deals
              </Button>
            </Card>
          )}

          <div className="text-center pt-4">
            <Link to="/hot-deals">
              <Button variant="outline">
                Create Your Own Hot Deal
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HotDealsFeed;