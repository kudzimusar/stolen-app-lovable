import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowUpRight, 
  Heart, 
  DollarSign, 
  Gift, 
  Recycle, 
  Wrench, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Leaf,
  Shield,
  Info,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { TransferSuggestion } from '@/lib/ai/ai-transfer-suggestion-engine';
import { TransferPrompt } from '@/lib/ai/smart-transfer-prompt-engine';
import { TransferTiming } from '@/lib/ai/transfer-timing-optimizer';

interface TransferSuggestionCardProps {
  suggestion: TransferSuggestion;
  prompt?: TransferPrompt;
  timing?: TransferTiming;
  onAction: (suggestion: TransferSuggestion, action: string) => void;
  onDismiss: (suggestionId: string) => void;
  onLearnMore: (suggestion: TransferSuggestion) => void;
}

const TransferSuggestionCard: React.FC<TransferSuggestionCardProps> = ({
  suggestion,
  prompt,
  timing,
  onAction,
  onDismiss,
  onLearnMore
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'upgrade':
        return <ArrowUpRight className="w-5 h-5" />;
      case 'donate':
        return <Heart className="w-5 h-5" />;
      case 'sell':
        return <DollarSign className="w-5 h-5" />;
      case 'gift':
        return <Gift className="w-5 h-5" />;
      case 'recycle':
        return <Recycle className="w-5 h-5" />;
      case 'repair':
        return <Wrench className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAction = async (action: string) => {
    setIsProcessing(true);
    try {
      await onAction(suggestion, action);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  return (
    <Card className={`w-full transition-all duration-300 ${
      isExpanded ? 'shadow-lg' : 'hover:shadow-md'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              suggestion.suggestionType === 'upgrade' ? 'bg-blue-100 text-blue-600' :
              suggestion.suggestionType === 'donate' ? 'bg-pink-100 text-pink-600' :
              suggestion.suggestionType === 'sell' ? 'bg-green-100 text-green-600' :
              suggestion.suggestionType === 'gift' ? 'bg-purple-100 text-purple-600' :
              suggestion.suggestionType === 'recycle' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {getSuggestionIcon(suggestion.suggestionType)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {prompt?.title || suggestion.recommendedAction}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={getUrgencyColor(suggestion.urgency)}
                >
                  {suggestion.urgency} priority
                </Badge>
                <Badge variant="secondary">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(suggestion.deviceId)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Message */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {prompt?.message || suggestion.reasoning}
          </p>
          
          {suggestion.estimatedValue && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-medium">
                {formatCurrency(suggestion.estimatedValue)}
              </span>
              <span className="text-muted-foreground">estimated value</span>
            </div>
          )}
        </div>

        {/* Timing Information */}
        {timing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Optimal Timing</span>
            </div>
            <p className="text-sm text-blue-700 mb-2">{timing.reasoning}</p>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <span>Window: {timing.optimalWindow}</span>
              {timing.estimatedGain && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{formatCurrency(timing.estimatedGain)}
                </span>
              )}
              {timing.estimatedLoss && (
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -{formatCurrency(timing.estimatedLoss)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Market Analysis */}
            {suggestion.marketTrend && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Market Analysis
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Trend:</span>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.marketTrend}
                    </Badge>
                  </div>
                  {suggestion.optimalTiming && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Timing:</span>
                      <span>{suggestion.optimalTiming}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Environmental Impact */}
            {suggestion.environmentalImpact && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Environmental Impact
                </h4>
                <p className="text-xs text-muted-foreground">
                  {suggestion.environmentalImpact}
                </p>
              </div>
            )}

            {/* Tax Benefits */}
            {suggestion.taxBenefits && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Tax Benefits
                </h4>
                <p className="text-xs text-muted-foreground">
                  {suggestion.taxBenefits}
                </p>
              </div>
            )}

            {/* Confidence Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence Level</span>
                <span className={getConfidenceColor(suggestion.confidence)}>
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
              <Progress 
                value={suggestion.confidence * 100} 
                className="h-2"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            onClick={() => handleAction('primary')}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              prompt?.callToAction.primary || suggestion.recommendedAction
            )}
          </Button>
          
          {prompt?.callToAction.secondary && (
            <Button
              variant="outline"
              onClick={() => onLearnMore(suggestion)}
            >
              {prompt.callToAction.secondary}
            </Button>
          )}
        </div>

        {/* Dismiss Option */}
        {prompt?.callToAction.dismiss && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(suggestion.deviceId)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {prompt.callToAction.dismiss}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferSuggestionCard;
