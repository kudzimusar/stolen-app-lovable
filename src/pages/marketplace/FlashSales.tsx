import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import FlashSaleSystem from "@/components/marketplace/FlashSaleSystem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Gift,
  Bell,
  Calendar,
  Users
} from "lucide-react";

const FlashSales = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Flash Sales
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lightning-fast deals with massive discounts! Limited time, limited quantities.
            Don't miss out on these incredible offers.
          </p>
        </div>

        {/* Flash Sale Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">2</div>
            <div className="text-sm text-muted-foreground">Active Sales</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">1.2k</div>
            <div className="text-sm text-muted-foreground">Items Sold</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">45%</div>
            <div className="text-sm text-muted-foreground">Avg Discount</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">8.7k</div>
            <div className="text-sm text-muted-foreground">Happy Buyers</div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="default" className="bg-red-600 hover:bg-red-700">
            <Zap className="w-4 h-4 mr-2" />
            Live Sales
          </Button>
          <Button variant="outline" onClick={() => navigate('/enhanced-hot-deals-feed')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Hot Deals Feed
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming Sales
          </Button>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>

        {/* Main Flash Sale System */}
        <FlashSaleSystem showUpcoming={true} maxDeals={20} />

        {/* How Flash Sales Work */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            How Flash Sales Work
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-blue-700">⚡ Lightning Fast</div>
              <p className="text-blue-600">
                Sales last only 1-6 hours with massive discounts up to 60% off regular prices.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-purple-700">📊 Limited Quantities</div>
              <p className="text-purple-600">
                Each deal has limited stock. When it's gone, it's gone! First come, first served.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-red-700">🔔 Stay Alert</div>
              <p className="text-red-600">
                Enable notifications to be the first to know when new flash sales go live.
              </p>
            </div>
          </div>
        </Card>

        {/* Popular Categories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Flash Sale Categories</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Smartphones", icon: "📱", count: "45 deals" },
              { name: "Laptops", icon: "💻", count: "23 deals" },
              { name: "Gaming", icon: "🎮", count: "18 deals" },
              { name: "Audio", icon: "🎧", count: "32 deals" },
              { name: "Tablets", icon: "📺", count: "15 deals" },
              { name: "Watches", icon: "⌚", count: "27 deals" },
              { name: "Cameras", icon: "📷", count: "12 deals" },
              { name: "Accessories", icon: "🔌", count: "68 deals" }
            ].map(category => (
              <Button
                key={category.name}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <div className="text-2xl">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
                <div className="text-xs text-muted-foreground">{category.count}</div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Success Stories */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Flash Sale Success Stories
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Sarah M.</div>
                <Badge className="bg-green-100 text-green-700">Saved R4,500</Badge>
              </div>
              <p className="text-sm text-gray-600">
                "Got an iPhone 15 Pro for R11,000 instead of R15,500 in yesterday's flash sale! 
                The countdown timer made it so exciting!"
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Michael K.</div>
                <Badge className="bg-blue-100 text-blue-700">Saved R3,200</Badge>
              </div>
              <p className="text-sm text-gray-600">
                "Managed to snag a MacBook Air M2 for R14,999. The real-time stock counter 
                showed only 3 left when I bought it!"
              </p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-8 text-center bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <h3 className="text-2xl font-bold mb-4">Never Miss a Flash Sale!</h3>
          <p className="mb-6 opacity-90">
            Enable notifications and be the first to know when lightning deals go live.
            Join over 50,000 smart shoppers who save big every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-white text-red-600 hover:bg-gray-100">
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
              <Gift className="w-4 h-4 mr-2" />
              Create Account & Save
            </Button>
          </div>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FlashSales;
