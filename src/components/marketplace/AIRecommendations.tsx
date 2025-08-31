import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Star, 
  MapPin, 
  Shield, 
  Zap, 
  Target, 
  Eye,
  ChevronRight,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { aiMarketplaceService } from '@/lib/services/ai-marketplace-service';

interface AIRecommendationsProps {
  userId?: string;
  context?: 'home' | 'product' | 'search' | 'category';
  currentDeviceId?: string;
  userPreferences?: any;
  limit?: number;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  userId = 'user-123',
  context = 'home',
  currentDeviceId,
  userPreferences,
  limit = 6
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [marketInsights, setMarketInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [aiContext, setAiContext] = useState('Analyzing your preferences...');

  useEffect(() => {
    loadAIRecommendations();
    loadMarketInsights();
  }, [userId, context, currentDeviceId]);

  const loadAIRecommendations = async () => {
    setIsLoading(true);
    setAiContext('Analyzing your preferences and market trends...');
    
    try {
      // Simulate AI processing steps
      const steps = [
        'Analyzing your browsing history...',
        'Checking market trends...',
        'Finding best matches...',
        'Calculating confidence scores...',
        'Finalizing recommendations...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setAiContext(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const recs = await aiMarketplaceService.getPersonalizedRecommendations(
        userId,
        userPreferences,
        [], // viewingHistory
        context
      );

      setRecommendations(recs.slice(0, limit));
      
      toast({
        title: 'AI Recommendations Ready',
        description: `Found ${recs.length} personalized suggestions for you`,
        variant: 'default'
      });

    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
      toast({
        title: 'Recommendations Unavailable',
        description: 'Unable to load personalized recommendations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMarketInsights = async () => {
    try {
      const insights = await aiMarketplaceService.getMarketInsights();
      setMarketInsights(insights);
    } catch (error) {
      console.error('Failed to load market insights:', error);
    }
  };

  const handleRecommendationClick = (rec: any) => {
    // Track AI recommendation click
    console.log('AI Recommendation clicked:', rec);
    navigate(`/marketplace/product/${rec.deviceId}`);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'price_trend':
        return <TrendingUp className="w-4 h-4" />;
      case 'demand_spike':
        return <BarChart3 className="w-4 h-4" />;
      case 'new_release':
        return <Sparkles className="w-4 h-4" />;
      case 'seasonal_trend':
        return <Clock className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground">{aiContext}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-32 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Personalized suggestions based on your preferences and market trends
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showInsights} onOpenChange={setShowInsights}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Market Insights
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Market Intelligence</DialogTitle>
                </DialogHeader>
                <MarketInsightsView insights={marketInsights} />
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={loadAIRecommendations}>
              <Zap className="w-4 h-4 mr-2" />
              Refresh AI
            </Button>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium text-lg mb-2">Building Your Profile</h4>
            <p className="text-muted-foreground mb-4">
              Browse some devices to help our AI understand your preferences
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Explore Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <Card 
                key={rec.deviceId} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-purple-500"
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="relative">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-purple-100 text-purple-800">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Pick
                    </Badge>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-verified/10 text-verified">
                      <Shield className="w-3 h-3 mr-1" />
                      {rec.trustScore}%
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {rec.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat('en-ZA', {
                          style: 'currency',
                          currency: 'ZAR'
                        }).format(rec.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Target className={`w-4 h-4 ${getConfidenceColor(rec.confidence)}`} />
                        <span className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                          {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{rec.location}</span>
                    <span>•</span>
                    <span>{rec.seller}</span>
                  </div>

                  <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded-md">
                    <div className="flex items-start gap-2">
                      <Brain className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{rec.reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Recommended</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={loadAIRecommendations}>
              <Brain className="w-4 h-4 mr-2" />
              Get More AI Recommendations
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Market Insights */}
      {marketInsights.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Quick Market Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {marketInsights.slice(0, 3).map((insight, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  {getInsightIcon(insight.type)}
                  <span className="text-sm font-medium">{insight.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Market Insights Component
const MarketInsightsView: React.FC<{ insights: any[] }> = ({ insights }) => {
  return (
    <Tabs defaultValue="trends" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="trends">Price Trends</TabsTrigger>
        <TabsTrigger value="demand">Demand Analysis</TabsTrigger>
        <TabsTrigger value="alerts">Market Alerts</TabsTrigger>
      </TabsList>

      <TabsContent value="trends" className="space-y-4">
        {insights.filter(i => i.type === 'price_trend').map((insight, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </div>
            {insight.data && (
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-green-600">
                  {insight.data.change > 0 ? '+' : ''}{insight.data.change}%
                </div>
                <div className="text-sm text-muted-foreground">
                  over {insight.data.timeframe}
                </div>
              </div>
            )}
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="demand" className="space-y-4">
        {insights.filter(i => i.type === 'demand_spike').map((insight, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </div>
            {insight.data && (
              <Progress value={insight.data.increase} className="h-2" />
            )}
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="alerts" className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold">Market Opportunities</h4>
          </div>
          <div className="space-y-2">
            {insights.filter(i => i.actionable).map((insight, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{insight.title}: {insight.description}</span>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
