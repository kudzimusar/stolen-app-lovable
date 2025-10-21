import { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Clock, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  Flame,
  Target,
  Gift,
  Percent,
  Timer,
  Bell
} from "lucide-react";
import HotDealsRealtimeService from '@/lib/services/hot-deals-realtime-service';

interface FlashSale {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  maxItems: number;
  itemsSold: number;
  discountPercentage: number;
  status: 'scheduled' | 'active' | 'ended' | 'sold_out';
  deals: FlashDeal[];
}

interface FlashDeal {
  id: string;
  title: string;
  originalPrice: number;
  flashPrice: number;
  quantityLimit: number;
  soldQuantity: number;
  image?: string;
  category: string;
  seller: string;
  timeLeft: number;
}

interface FlashSaleSystemProps {
  saleId?: string;
  showUpcoming?: boolean;
  maxDeals?: number;
}

const FlashSaleSystem = ({ 
  saleId, 
  showUpcoming = true, 
  maxDeals = 10 
}: FlashSaleSystemProps) => {
  const [currentSale, setCurrentSale] = useState<FlashSale | null>(null);
  const [upcomingSales, setUpcomingSales] = useState<FlashSale[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [purchasingDeals, setPurchasingDeals] = useState<Set<string>>(new Set());
  
  const realtimeService = HotDealsRealtimeService.getInstance();
  const { toast } = useToast();

  // Mock flash sales data
  const mockFlashSales: FlashSale[] = [
    {
      id: "flash-1",
      name: "Lightning Tech Sale",
      description: "Massive discounts on premium electronics - 2 hours only!",
      startTime: new Date(Date.now() + 1000), // Starting now
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      maxItems: 100,
      itemsSold: 43,
      discountPercentage: 40,
      status: 'active',
      deals: [
        {
          id: "flash-deal-1",
          title: "iPhone 15 Pro 128GB",
          originalPrice: 18999,
          flashPrice: 11399,
          quantityLimit: 20,
          soldQuantity: 12,
          category: "smartphones",
          seller: "TechFlash",
          timeLeft: 7200 // 2 hours
        },
        {
          id: "flash-deal-2",
          title: "Samsung Galaxy Buds Pro",
          originalPrice: 2999,
          flashPrice: 1499,
          quantityLimit: 50,
          soldQuantity: 31,
          category: "audio",
          seller: "AudioZone",
          timeLeft: 7200
        },
        {
          id: "flash-deal-3",
          title: "MacBook Air M2",
          originalPrice: 24999,
          flashPrice: 14999,
          quantityLimit: 15,
          soldQuantity: 8,
          category: "laptops",
          seller: "AppleDeals",
          timeLeft: 7200
        }
      ]
    },
    {
      id: "flash-2",
      name: "Gaming Madness Flash",
      description: "Gaming gear flash sale starting soon!",
      startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      maxItems: 75,
      itemsSold: 0,
      discountPercentage: 35,
      status: 'scheduled',
      deals: [
        {
          id: "flash-deal-4",
          title: "PlayStation 5",
          originalPrice: 11999,
          flashPrice: 7799,
          quantityLimit: 25,
          soldQuantity: 0,
          category: "gaming",
          seller: "GameWorld",
          timeLeft: 10800 // 3 hours until start
        }
      ]
    }
  ];

  useEffect(() => {
    // Find current active sale or specific sale
    const activeSale = saleId 
      ? mockFlashSales.find(sale => sale.id === saleId)
      : mockFlashSales.find(sale => sale.status === 'active');
    
    setCurrentSale(activeSale || null);

    // Set upcoming sales
    if (showUpcoming) {
      const upcoming = mockFlashSales.filter(sale => 
        sale.status === 'scheduled' && 
        (!saleId || sale.id !== saleId)
      );
      setUpcomingSales(upcoming);
    }
  }, [saleId, showUpcoming]);

  useEffect(() => {
    if (!currentSale) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(currentSale.endTime);
      const remaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      
      setTimeLeft(remaining);
      setIsActive(remaining > 0 && currentSale.status === 'active');

      if (remaining === 0 && currentSale.status === 'active') {
        toast({
          title: "Flash Sale Ended! ⚡",
          description: `${currentSale.name} has ended. Check out upcoming sales!`,
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentSale, toast]);

  // Real-time updates
  useEffect(() => {
    const handleSaleUpdate = (data: any) => {
      if (data.saleId === currentSale?.id) {
        setCurrentSale(prev => prev ? { ...prev, ...data.updates } : null);
      }
    };

    const handleDealSold = (data: any) => {
      if (currentSale?.deals.some(deal => deal.id === data.dealId)) {
        setCurrentSale(prev => {
          if (!prev) return null;
          return {
            ...prev,
            deals: prev.deals.map(deal => 
              deal.id === data.dealId 
                ? { ...deal, soldQuantity: data.soldQuantity }
                : deal
            ),
            itemsSold: prev.itemsSold + 1
          };
        });

        toast({
          title: "Deal Updated! 🔥",
          description: `${data.title} - ${data.remaining} left!`,
        });
      }
    };

    realtimeService.on('flash_sale_updated', handleSaleUpdate);
    realtimeService.on('flash_deal_sold', handleDealSold);

    return () => {
      realtimeService.off('flash_sale_updated', handleSaleUpdate);
      realtimeService.off('flash_deal_sold', handleDealSold);
    };
  }, [currentSale, realtimeService, toast]);

  const formatTimeLeft = useCallback((seconds: number) => {
    if (seconds <= 0) return 'ENDED';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else {
      return `${minutes}m ${secs}s`;
    }
  }, []);

  const purchaseDeal = async (deal: FlashDeal) => {
    if (purchasingDeals.has(deal.id)) return;
    
    setPurchasingDeals(prev => new Set(prev).add(deal.id));

    try {
      // Simulate purchase delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful purchase
      toast({
        title: "Flash Deal Purchased! 🎉",
        description: `${deal.title} added to cart at flash price!`,
      });
      
      // Update local state to reflect purchase
      setCurrentSale(prev => {
        if (!prev) return null;
        return {
          ...prev,
          deals: prev.deals.map(d => 
            d.id === deal.id 
              ? { ...d, soldQuantity: d.soldQuantity + 1 }
              : d
          ),
          itemsSold: prev.itemsSold + 1
        };
      });

    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Unable to complete purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasingDeals(prev => {
        const next = new Set(prev);
        next.delete(deal.id);
        return next;
      });
    }
  };

  const getStockPercentage = (deal: FlashDeal) => {
    return ((deal.quantityLimit - deal.soldQuantity) / deal.quantityLimit) * 100;
  };

  const getStockStatus = (deal: FlashDeal) => {
    const percentage = getStockPercentage(deal);
    if (percentage === 0) return { text: 'SOLD OUT', color: 'text-red-600' };
    if (percentage < 20) return { text: 'ALMOST GONE', color: 'text-red-500' };
    if (percentage < 50) return { text: 'SELLING FAST', color: 'text-orange-500' };
    return { text: 'IN STOCK', color: 'text-green-500' };
  };

  if (!currentSale) {
    return (
      <Card className="p-8 text-center">
        <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Flash Sales</h3>
        <p className="text-gray-500 mb-4">Check back soon for lightning deals!</p>
        
        {upcomingSales.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Upcoming Flash Sales:</h4>
            {upcomingSales.map(sale => (
              <div key={sale.id} className="bg-blue-50 rounded-lg p-3">
                <div className="font-medium">{sale.name}</div>
                <div className="text-sm text-blue-600">
                  Starts {sale.startTime.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flash Sale Header */}
      <Card className="p-6 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-red-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <Badge className="bg-red-500 text-white animate-pulse">
                FLASH SALE LIVE
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">{currentSale.name}</h2>
            <p className="text-gray-600">{currentSale.description}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <ShoppingCart className="w-4 h-4" />
                <span>{currentSale.itemsSold} sold</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{currentSale.maxItems} total items</span>
              </div>
              <div className="flex items-center space-x-1">
                <Percent className="w-4 h-4" />
                <span>Up to {currentSale.discountPercentage}% off</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex flex-col items-center">
            <CountdownCircleTimer
              isPlaying={isActive}
              duration={7200} // 2 hours
              initialRemainingTime={timeLeft}
              colors={'#ef4444' as any}
              size={120}
              strokeWidth={8}
            >
              {({ remainingTime }) => (
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">
                    {formatTimeLeft(remainingTime)}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    TIME LEFT
                  </div>
                </div>
              )}
            </CountdownCircleTimer>
          </div>
        </div>

        {/* Sale Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Sale Progress</span>
            <span>{Math.round((currentSale.itemsSold / currentSale.maxItems) * 100)}% sold</span>
          </div>
          <Progress 
            value={(currentSale.itemsSold / currentSale.maxItems) * 100} 
            className="h-2"
          />
        </div>
      </Card>

      {/* Flash Deals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentSale.deals.slice(0, maxDeals).map((deal) => {
          const stockStatus = getStockStatus(deal);
          const stockPercentage = getStockPercentage(deal);
          const isAvailable = stockPercentage > 0 && isActive;
          const isPurchasing = purchasingDeals.has(deal.id);
          const discountPercentage = Math.round(((deal.originalPrice - deal.flashPrice) / deal.originalPrice) * 100);

          return (
            <Card key={deal.id} className={`overflow-hidden ${!isAvailable ? 'opacity-60' : ''}`}>
              {/* Deal Image */}
              <div className="relative h-48 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                <Gift className="w-16 h-16 text-red-300" />
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-600 text-white font-bold">
                    -{discountPercentage}%
                  </Badge>
                </div>

                {/* Stock Status */}
                <div className="absolute top-3 right-3">
                  <Badge variant={stockPercentage === 0 ? "destructive" : "secondary"} 
                         className={stockStatus.color}>
                    {stockStatus.text}
                  </Badge>
                </div>

                {/* Flash Sale Indicator */}
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-yellow-500 text-black animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    FLASH
                  </Badge>
                </div>
              </div>

              {/* Deal Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-2">{deal.title}</h3>
                  <p className="text-sm text-gray-500">by {deal.seller}</p>
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-red-600">
                      R{deal.flashPrice.toLocaleString()}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">
                        R{deal.originalPrice.toLocaleString()}
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        Save R{(deal.originalPrice - deal.flashPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock</span>
                    <span className={stockStatus.color}>
                      {deal.quantityLimit - deal.soldQuantity} left
                    </span>
                  </div>
                  <Progress 
                    value={stockPercentage} 
                    className="h-2"
                  />
                </div>

                {/* Time Remaining */}
                <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
                  <Timer className="w-4 h-4" />
                  <span className="font-medium">{formatTimeLeft(timeLeft)} remaining</span>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full"
                  disabled={!isAvailable || isPurchasing}
                  onClick={() => purchaseDeal(deal)}
                  variant={stockPercentage === 0 ? "secondary" : "default"}
                >
                  {isPurchasing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : stockPercentage === 0 ? (
                    'SOLD OUT'
                  ) : !isActive ? (
                    'SALE ENDED'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Flash Price
                    </>
                  )}
                </Button>

                {/* Flash Deal Stats */}
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>{deal.soldQuantity} sold</span>
                  <span>{deal.quantityLimit} total</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Sales Preview */}
      {showUpcoming && upcomingSales.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Upcoming Flash Sales
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingSales.map((sale) => (
              <div key={sale.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="space-y-2">
                  <div className="font-medium">{sale.name}</div>
                  <div className="text-sm text-gray-600">{sale.description}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">
                      Starts: {sale.startTime.toLocaleString()}
                    </span>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {sale.discountPercentage}% off
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Live Updates Indicator */}
      <div className="fixed bottom-20 right-4 z-50">
        <div className="bg-red-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Flash Sale Live</span>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleSystem;
