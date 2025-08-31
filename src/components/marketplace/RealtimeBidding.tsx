import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Gavel, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Target
} from "lucide-react";
import HotDealsRealtimeService, { BidUpdate } from '@/lib/services/hot-deals-realtime-service';

interface Bid {
  id: string;
  bidAmount: number;
  bidder: string;
  timestamp: Date;
  isWinning: boolean;
  isUserBid: boolean;
}

interface RealtimeBiddingProps {
  dealId: string;
  currentPrice: number;
  minimumBid: number;
  reservePrice?: number;
  biddingEnabled: boolean;
  endTime: Date;
  userId: string;
  userName: string;
  onBidPlaced?: (bid: Bid) => void;
}

const RealtimeBidding = ({
  dealId,
  currentPrice,
  minimumBid,
  reservePrice,
  biddingEnabled,
  endTime,
  userId,
  userName,
  onBidPlaced
}: RealtimeBiddingProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState<string>('');
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [totalBidders, setTotalBidders] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [userHighestBid, setUserHighestBid] = useState<number>(0);
  const [isWinning, setIsWinning] = useState(false);
  const [showBidConfirmation, setShowBidConfirmation] = useState(false);
  
  const bidsContainerRef = useRef<HTMLDivElement>(null);
  const realtimeService = HotDealsRealtimeService.getInstance();
  const { toast } = useToast();

  useEffect(() => {
    // Join the bidding room
    realtimeService.joinDeal(dealId);

    // Listen for bid updates
    const handleBidUpdate = (bidUpdate: BidUpdate) => {
      if (bidUpdate.dealId === dealId) {
        const newBid: Bid = {
          id: `${bidUpdate.dealId}-${bidUpdate.timestamp}`,
          bidAmount: bidUpdate.bidAmount,
          bidder: bidUpdate.bidder,
          timestamp: bidUpdate.timestamp,
          isWinning: bidUpdate.isWinning,
          isUserBid: bidUpdate.bidder === userName
        };

        setBids(prev => [newBid, ...prev.slice(0, 9)]); // Keep last 10 bids
        setBidHistory(prev => [newBid, ...prev]);
        setTotalBidders(bidUpdate.totalBids);

        // Check if user is winning
        if (bidUpdate.bidder === userName && bidUpdate.isWinning) {
          setIsWinning(true);
          toast({
            title: "You're winning! 🎉",
            description: `Your bid of R${bidUpdate.bidAmount.toLocaleString()} is currently the highest`,
          });
        } else if (isWinning && bidUpdate.bidder !== userName && bidUpdate.isWinning) {
          setIsWinning(false);
          toast({
            title: "You've been outbid! 😔",
            description: `Someone bid R${bidUpdate.bidAmount.toLocaleString()}. Place a higher bid to win!`,
            variant: "destructive"
          });
        }

        onBidPlaced?.(newBid);
        
        // Auto-scroll to latest bid
        if (bidsContainerRef.current) {
          bidsContainerRef.current.scrollTop = 0;
        }
      }
    };

    // Listen for time updates
    const handleTimeUpdate = (countdown: any) => {
      if (countdown.dealId === dealId) {
        setTimeLeft(countdown.timeLeft);
      }
    };

    realtimeService.on('bid_placed', handleBidUpdate);
    realtimeService.on('time_update', handleTimeUpdate);

    return () => {
      realtimeService.off('bid_placed', handleBidUpdate);
      realtimeService.off('time_update', handleTimeUpdate);
      realtimeService.leaveDeal(dealId);
    };
  }, [dealId, userName, isWinning, onBidPlaced, toast]);

  const getMinimumNextBid = () => {
    const highestBid = bids.length > 0 ? bids[0].bidAmount : currentPrice;
    return Math.max(minimumBid, highestBid + 50); // Minimum R50 increment
  };

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    const minBid = getMinimumNextBid();

    if (amount < minBid) {
      toast({
        title: "Bid too low",
        description: `Minimum bid is R${minBid.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    if (timeLeft <= 0) {
      toast({
        title: "Bidding ended",
        description: "This auction has ended",
        variant: "destructive"
      });
      return;
    }

    setIsPlacingBid(true);
    setShowBidConfirmation(true);
  };

  const confirmBid = async () => {
    const amount = parseFloat(bidAmount);
    
    try {
      realtimeService.placeBid(dealId, amount, {
        userId,
        userName,
        timestamp: new Date().toISOString()
      });

      setUserHighestBid(Math.max(userHighestBid, amount));
      setBidAmount('');
      setShowBidConfirmation(false);
      
      toast({
        title: "Bid placed! 🎯",
        description: `Your bid of R${amount.toLocaleString()} has been submitted`,
      });
    } catch (error) {
      toast({
        title: "Bid failed",
        description: "Failed to place bid. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPlacingBid(false);
    }
  };

  const enableAutoBid = () => {
    const maxAmount = parseFloat(autoBidMax);
    if (maxAmount > getMinimumNextBid()) {
      setAutoBidEnabled(true);
      toast({
        title: "Auto-bid enabled",
        description: `Auto-bidding up to R${maxAmount.toLocaleString()}`,
      });
    }
  };

  const getTimeLeftDisplay = () => {
    if (timeLeft <= 0) return 'ENDED';
    if (timeLeft < 60) return `${timeLeft}s`;
    if (timeLeft < 3600) return `${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s`;
    return `${Math.floor(timeLeft / 3600)}h ${Math.floor((timeLeft % 3600) / 60)}m`;
  };

  const getBidStatusColor = (bid: Bid) => {
    if (bid.isWinning) return 'text-green-600 bg-green-50';
    if (bid.isUserBid) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (!biddingEnabled) {
    return (
      <Card className="p-6 text-center">
        <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-600">Bidding Not Available</h3>
        <p className="text-gray-500">This item has a fixed price</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bidding Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gavel className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Live Bidding</h3>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <Badge variant={timeLeft <= 300 ? "destructive" : "secondary"}>
            <Clock className="w-3 h-3 mr-1" />
            {getTimeLeftDisplay()}
          </Badge>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              R{(bids[0]?.bidAmount || currentPrice).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Current Bid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalBidders}
            </div>
            <div className="text-sm text-muted-foreground">Bidders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {bids.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Bids</div>
          </div>
        </div>

        {/* User Status */}
        {userHighestBid > 0 && (
          <div className={`p-3 rounded-lg border ${isWinning ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isWinning ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-medium ${isWinning ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isWinning ? 'You\'re winning!' : 'You\'ve been outbid'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Your bid: R{userHighestBid.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Bid Placement */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Place Your Bid</h4>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Bid Amount (Minimum: R{getMinimumNextBid().toLocaleString()})
            </label>
            <div className="flex space-x-2 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R</span>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={getMinimumNextBid().toString()}
                  className="pl-8"
                  min={getMinimumNextBid()}
                  step="50"
                />
              </div>
              <Button 
                onClick={placeBid}
                disabled={!bidAmount || isPlacingBid || timeLeft <= 0}
                className="px-6"
              >
                {isPlacingBid ? 'Placing...' : 'Bid'}
              </Button>
            </div>
          </div>

          {/* Quick Bid Buttons */}
          <div className="flex space-x-2">
            {[50, 100, 200, 500].map((increment) => {
              const quickBid = getMinimumNextBid() + increment;
              return (
                <Button
                  key={increment}
                  variant="outline"
                  size="sm"
                  onClick={() => setBidAmount(quickBid.toString())}
                  className="text-xs"
                >
                  +R{increment}
                </Button>
              );
            })}
          </div>

          {/* Auto-Bid Section */}
          <div className="border-t pt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Auto-Bid</span>
              {autoBidEnabled && (
                <Badge variant="secondary" className="text-xs">
                  Active up to R{autoBidMax}
                </Badge>
              )}
            </div>
            
            {!autoBidEnabled ? (
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">R</span>
                  <Input
                    type="number"
                    value={autoBidMax}
                    onChange={(e) => setAutoBidMax(e.target.value)}
                    placeholder="Maximum auto-bid amount"
                    className="pl-8"
                    min={getMinimumNextBid() + 100}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={enableAutoBid}
                  disabled={!autoBidMax}
                  size="sm"
                >
                  Enable
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm text-yellow-700">
                  Auto-bidding enabled up to R{parseFloat(autoBidMax).toLocaleString()}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAutoBidEnabled(false)}
                  className="text-yellow-700"
                >
                  Disable
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Recent Bids */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Recent Bids</h4>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{totalBidders} bidders</span>
          </div>
        </div>
        
        <div 
          ref={bidsContainerRef}
          className="space-y-2 max-h-64 overflow-y-auto"
        >
          {bids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No bids yet. Be the first to bid!</p>
            </div>
          ) : (
            bids.map((bid, index) => (
              <div 
                key={bid.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getBidStatusColor(bid)}`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {bid.bidder.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {bid.bidder === userName ? 'You' : bid.bidder}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bid.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    R{bid.bidAmount.toLocaleString()}
                  </div>
                  {bid.isWinning && (
                    <Badge variant="default" className="text-xs">
                      Winning
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Bid Confirmation Modal */}
      {showBidConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-3">Confirm Your Bid</h3>
            <p className="text-muted-foreground mb-4">
              You are about to bid <strong>R{parseFloat(bidAmount).toLocaleString()}</strong> on this item.
            </p>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowBidConfirmation(false);
                  setIsPlacingBid(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmBid}
                disabled={isPlacingBid}
                className="flex-1"
              >
                {isPlacingBid ? 'Placing...' : 'Confirm Bid'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reserve Price Info */}
      {reservePrice && (
        <Card className="p-3 bg-amber-50 border-amber-200">
          <div className="flex items-center space-x-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              Reserve price not yet met (R{reservePrice.toLocaleString()})
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RealtimeBidding;
