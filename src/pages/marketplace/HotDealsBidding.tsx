import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import RealtimeBidding from "@/components/marketplace/RealtimeBidding";
import HotDealsCountdown from "@/components/marketplace/HotDealsCountdown";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Shield, MapPin, Star } from "lucide-react";

const HotDealsBidding = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();

  if (!dealId) {
    navigate('/hot-deals-hub');
    return null;
  }

  // Mock deal data for bidding
  const dealData = {
    id: dealId,
    title: "iPhone 15 Pro Max 256GB - Natural Titanium",
    description: "Brand new iPhone 15 Pro Max in pristine condition. Original packaging, all accessories included.",
    currentPrice: 15999,
    originalPrice: 18999,
    minimumBid: 16100,
    reservePrice: 15500,
    seller: "TechPro_ZA",
    rating: 4.8,
    location: "Johannesburg, Gauteng",
    condition: "Like New",
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    verified: true,
    views: 342,
    interested: 87,
    messages: 23,
    biddingEnabled: true
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/hot-deals-hub')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Live Bidding</h1>
            <p className="text-muted-foreground">Place your bids in real-time</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Deal Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Deal Image and Basic Info */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
                
                <div>
                  <h2 className="font-bold text-lg line-clamp-2">{dealData.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{dealData.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Condition:</span>
                    <Badge variant="secondary">{dealData.condition}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Seller:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{dealData.seller}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs">{dealData.rating}</span>
                      </div>
                      {dealData.verified && <Shield className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{dealData.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Countdown Timer */}
            <HotDealsCountdown
              dealId={dealData.id}
              endTime={dealData.endTime}
              urgencyLevel="lightning"
              currentPrice={dealData.currentPrice}
              originalPrice={dealData.originalPrice}
              views={dealData.views}
              interested={dealData.interested}
              messages={dealData.messages}
              showActions={false}
            />
          </div>

          {/* Bidding Interface */}
          <div className="lg:col-span-2">
            <RealtimeBidding
              dealId={dealData.id}
              currentPrice={dealData.currentPrice}
              minimumBid={dealData.minimumBid}
              reservePrice={dealData.reservePrice}
              biddingEnabled={dealData.biddingEnabled}
              endTime={dealData.endTime}
              userId="user-123"
              userName="You"
            />
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default HotDealsBidding;
