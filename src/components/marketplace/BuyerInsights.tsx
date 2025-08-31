import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  Heart, 
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Bell,
  Star,
  Eye,
  DollarSign,
  Shield,
  Target,
  Sparkles,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PriceAlert {
  id: string;
  deviceName: string;
  targetPrice: number;
  currentPrice: number;
  priceChange: number;
  isBelow: boolean;
  image: string;
}

interface RecommendedDeal {
  id: string;
  title: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  timeLeft: string;
  confidence: number;
  reason: string;
  seller: string;
  image: string;
  verified: boolean;
}

interface MarketTrend {
  category: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
  opportunity: string;
}

export const BuyerInsights: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      deviceName: 'iPhone 15 Pro 256GB',
      targetPrice: 20000,
      currentPrice: 19500,
      priceChange: -2.5,
      isBelow: true,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop&auto=format'
    },
    {
      id: '2',
      deviceName: 'MacBook Air M3',
      targetPrice: 22000,
      currentPrice: 23500,
      priceChange: 1.2,
      isBelow: false,
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop&auto=format'
    }
  ]);

  const [recommendedDeals, setRecommendedDeals] = useState<RecommendedDeal[]>([
    {
      id: '1',
      title: 'Samsung Galaxy S24 Ultra 512GB',
      originalPrice: 28000,
      salePrice: 23500,
      discount: 16,
      timeLeft: '2 days',
      confidence: 95,
      reason: 'Excellent condition, verified seller, below market average',
      seller: 'TechPro Store',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&h=100&fit=crop&auto=format',
      verified: true
    },
    {
      id: '2',
      title: 'Google Pixel 8 Pro 256GB',
      originalPrice: 18000,
      salePrice: 15200,
      discount: 15,
      timeLeft: '5 hours',
      confidence: 88,
      reason: 'Great value, AI-verified authenticity',
      seller: 'Mobile Hub',
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=150&h=100&fit=crop&auto=format',
      verified: true
    }
  ]);

  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([
    {
      category: 'Flagship Phones',
      trend: 'down',
      percentage: -8,
      description: 'Prices dropping due to new releases',
      opportunity: 'Great time to buy premium devices'
    },
    {
      category: 'Gaming Laptops',
      trend: 'up',
      percentage: 12,
      description: 'High demand for remote work',
      opportunity: 'Consider waiting or checking alternatives'
    },
    {
      category: 'Tablets',
      trend: 'stable',
      percentage: 2,
      description: 'Steady market with seasonal patterns',
      opportunity: 'Good time for research and comparison'
    }
  ]);

  const handlePriceAlertAction = (alertId: string, action: 'buy' | 'adjust' | 'remove') => {
    const alert = priceAlerts.find(a => a.id === alertId);
    if (!alert) return;

    switch (action) {
      case 'buy':
        navigate(`/marketplace?q=${encodeURIComponent(alert.deviceName)}`);
        break;
      case 'adjust':
        toast({
          title: 'Price Target Updated',
          description: 'Your price alert has been adjusted',
          variant: 'default'
        });
        break;
      case 'remove':
        setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
        toast({
          title: 'Alert Removed',
          description: 'Price alert has been removed',
          variant: 'default'
        });
        break;
    }
  };

  const handleDealAction = (dealId: string, action: 'view' | 'buy' | 'save') => {
    const deal = recommendedDeals.find(d => d.id === dealId);
    if (!deal) return;

    switch (action) {
      case 'view':
        navigate(`/marketplace/product/${dealId}`);
        break;
      case 'buy':
        navigate(`/marketplace/product/${dealId}`);
        break;
      case 'save':
        toast({
          title: 'Saved to Wishlist',
          description: 'Deal has been added to your wishlist',
          variant: 'default'
        });
        break;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-600" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Smart Buyer Insights</h2>
          <p className="text-sm text-muted-foreground">AI-powered recommendations and market intelligence</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/marketplace')}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Browse Marketplace
        </Button>
      </div>

      {/* Price Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Price Alerts ({priceAlerts.length})
          </h3>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Manage Alerts
          </Button>
        </div>

        <div className="space-y-4">
          {priceAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border ${
              alert.isBelow ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <img 
                  src={alert.image} 
                  alt={alert.deviceName}
                  className="w-16 h-16 rounded-md object-cover"
                />
                
                <div className="flex-1">
                  <h4 className="font-medium">{alert.deviceName}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div>
                      <span className="text-sm text-muted-foreground">Target: </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(alert.targetPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Current: </span>
                      <span className={`font-medium ${alert.isBelow ? 'text-green-600' : ''}`}>
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(alert.currentPrice)}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      alert.priceChange < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {alert.priceChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      <span className="text-sm font-medium">{Math.abs(alert.priceChange)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {alert.isBelow && (
                    <Button size="sm" onClick={() => handlePriceAlertAction(alert.id, 'buy')}>
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Buy Now
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handlePriceAlertAction(alert.id, 'adjust')}>
                    Adjust
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handlePriceAlertAction(alert.id, 'remove')}>
                    ×
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Recommended Deals */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Recommended Deals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedDeals.map((deal) => (
            <Card key={deal.id} className="p-4 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex gap-3 mb-3">
                <img 
                  src={deal.image} 
                  alt={deal.title}
                  className="w-20 h-16 rounded-md object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-1">{deal.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm line-through text-muted-foreground">
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(deal.originalPrice)}
                    </span>
                    <span className="font-bold text-green-600">
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(deal.salePrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-red-100 text-red-800">{deal.discount}% OFF</Badge>
                    {deal.verified && (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span>AI Confidence:</span>
                  <span className="font-medium">{deal.confidence}%</span>
                </div>
                <Progress value={deal.confidence} className="h-1" />
                
                <p className="text-xs text-muted-foreground">{deal.reason}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">by {deal.seller}</span>
                  <span className="flex items-center gap-1 text-orange-600">
                    <Clock className="w-3 h-3" />
                    {deal.timeLeft} left
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => handleDealAction(deal.id, 'view')}>
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDealAction(deal.id, 'save')}>
                  <Heart className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Market Trends */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Market Trends & Opportunities
        </h3>

        <div className="space-y-4">
          {marketTrends.map((trend, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getTrendIcon(trend.trend)}
                  <h4 className="font-medium">{trend.category}</h4>
                  <span className={`text-sm font-medium ${getTrendColor(trend.trend)}`}>
                    {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                  </span>
                </div>
                <Badge variant="outline">
                  {trend.trend === 'up' ? 'Rising' : trend.trend === 'down' ? 'Falling' : 'Stable'}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
              
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{trend.opportunity}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="flex flex-col h-20 gap-1">
            <Bell className="w-5 h-5" />
            <span className="text-xs">Set Alerts</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-20 gap-1">
            <Heart className="w-5 h-5" />
            <span className="text-xs">Wishlist</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-20 gap-1">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs">Price History</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-20 gap-1">
            <Star className="w-5 h-5" />
            <span className="text-xs">Top Deals</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
