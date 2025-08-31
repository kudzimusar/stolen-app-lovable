import { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { 
  Clock, 
  Flame, 
  Zap, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Heart,
  MessageCircle 
} from "lucide-react";
import HotDealsRealtimeService, { HotDealCountdown } from '@/lib/services/hot-deals-realtime-service';

interface HotDealsCountdownProps {
  dealId: string;
  endTime: Date;
  urgencyLevel?: 'today-only' | '48-hours' | '1-week' | 'lightning' | 'flash' | 'negotiable';
  currentPrice: number;
  originalPrice: number;
  views?: number;
  interested?: number;
  messages?: number;
  onTimeExpired?: () => void;
  showActions?: boolean;
}

const HotDealsCountdown = ({
  dealId,
  endTime,
  urgencyLevel = '48-hours',
  currentPrice,
  originalPrice,
  views = 0,
  interested = 0,
  messages = 0,
  onTimeExpired,
  showActions = true
}: HotDealsCountdownProps) => {
  const [countdown, setCountdown] = useState<HotDealCountdown | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showUrgencyPulse, setShowUrgencyPulse] = useState(false);
  const realtimeService = HotDealsRealtimeService.getInstance();

  useEffect(() => {
    // Start countdown timer
    realtimeService.startCountdownTimer(dealId, endTime);

    // Listen for time updates
    const handleTimeUpdate = (countdownData: HotDealCountdown) => {
      if (countdownData.dealId === dealId) {
        setCountdown(countdownData);
        
        if (countdownData.status === 'expired') {
          setIsExpired(true);
          onTimeExpired?.();
        }

        // Show urgency pulse for critical items
        if (countdownData.urgencyLevel === 'critical') {
          setShowUrgencyPulse(true);
        }
      }
    };

    realtimeService.on('time_update', handleTimeUpdate);

    return () => {
      realtimeService.off('time_update', handleTimeUpdate);
      realtimeService.stopCountdownTimer(dealId);
    };
  }, [dealId, endTime, onTimeExpired]);

  const getUrgencyConfig = () => {
    switch (urgencyLevel) {
      case 'lightning':
        return {
          color: '#fbbf24', // yellow
          label: 'LIGHTNING DEAL',
          icon: <Zap className="w-4 h-4" />,
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          intensity: 'high'
        };
      case 'flash':
        return {
          color: '#ef4444', // red
          label: 'FLASH SALE',
          icon: <Flame className="w-4 h-4" />,
          bgColor: 'bg-red-500',
          textColor: 'text-red-600',
          intensity: 'critical'
        };
      case 'today-only':
        return {
          color: '#f97316', // orange
          label: 'TODAY ONLY',
          icon: <AlertTriangle className="w-4 h-4" />,
          bgColor: 'bg-orange-500',
          textColor: 'text-orange-600',
          intensity: 'high'
        };
      case '48-hours':
        return {
          color: '#3b82f6', // blue
          label: '48 HOURS LEFT',
          icon: <Clock className="w-4 h-4" />,
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-600',
          intensity: 'medium'
        };
      default:
        return {
          color: '#6b7280', // gray
          label: 'LIMITED TIME',
          icon: <Clock className="w-4 h-4" />,
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-600',
          intensity: 'low'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig();
  const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const totalDuration = Math.floor((endTime.getTime() - Date.now()) / 1000);
  const progressPercentage = countdown ? (countdown.timeLeft / totalDuration) * 100 : 100;

  const formatTimeLeft = useCallback((timeLeft: number) => {
    if (timeLeft <= 0) return 'EXPIRED';
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  if (isExpired) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-red-700">Deal Expired</h3>
          <p className="text-red-600">This hot deal has ended</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${showUrgencyPulse ? 'animate-pulse border-red-400' : 'border-border'}`}>
      {/* Urgency Header */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="destructive" className={`${urgencyConfig.bgColor} ${urgencyConfig.textColor} px-3 py-1`}>
          {urgencyConfig.icon}
          <span className="ml-1 font-bold">{urgencyConfig.label}</span>
        </Badge>
        
        {discountPercentage > 0 && (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {discountPercentage}% OFF
          </Badge>
        )}
      </div>

      {/* Countdown Display */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <CountdownCircleTimer
            isPlaying={!isExpired}
            duration={totalDuration}
            initialRemainingTime={countdown?.timeLeft || 0}
            colors={[urgencyConfig.color]}
            size={120}
            strokeWidth={8}
          >
            {({ remainingTime }) => (
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {formatTimeLeft(remainingTime)}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  TIME LEFT
                </div>
              </div>
            )}
          </CountdownCircleTimer>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Time Progress</span>
          <span>{Math.round(100 - progressPercentage)}% Complete</span>
        </div>
        <Progress 
          value={100 - progressPercentage} 
          className="h-2"
        />
      </div>

      {/* Price Information */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-primary">
          R{currentPrice.toLocaleString()}
        </div>
        {originalPrice > currentPrice && (
          <div className="text-sm text-muted-foreground line-through">
            Originally R{originalPrice.toLocaleString()}
          </div>
        )}
      </div>

      {/* Deal Stats */}
      <div className="flex justify-around text-center text-sm text-muted-foreground mb-4">
        <div className="flex flex-col items-center">
          <Eye className="w-4 h-4 mb-1" />
          <span className="font-medium">{views}</span>
          <span className="text-xs">Views</span>
        </div>
        <div className="flex flex-col items-center">
          <Heart className="w-4 h-4 mb-1" />
          <span className="font-medium">{interested}</span>
          <span className="text-xs">Interested</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle className="w-4 h-4 mb-1" />
          <span className="font-medium">{messages}</span>
          <span className="text-xs">Messages</span>
        </div>
      </div>

      {/* Urgency Messages */}
      {countdown && (
        <div className="mb-4">
          {countdown.urgencyLevel === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-red-700 font-medium text-sm">
                🔥 ENDING VERY SOON! Don't miss out!
              </p>
            </div>
          )}
          
          {countdown.urgencyLevel === 'high' && countdown.timeLeft < 3600 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-orange-700 font-medium text-sm">
                ⏰ Less than 1 hour remaining!
              </p>
            </div>
          )}
          
          {countdown.timeLeft > 3600 && countdown.timeLeft < 86400 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-blue-700 font-medium text-sm">
                📈 Popular deal - {Math.floor(countdown.timeLeft / 3600)} hours left!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && !isExpired && (
        <div className="space-y-2">
          <Button className="w-full" size="lg">
            Buy Now - R{currentPrice.toLocaleString()}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" size="sm">
              Add to Cart
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              <Heart className="w-4 h-4 mr-1" />
              Watch
            </Button>
          </div>
        </div>
      )}

      {/* Live Indicators */}
      <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
          Live Updates Active
        </div>
      </div>
    </Card>
  );
};

export default HotDealsCountdown;
