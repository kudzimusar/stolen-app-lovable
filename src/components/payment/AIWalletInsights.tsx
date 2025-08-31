import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Brain, 
  Zap, 
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category?: string;
  timestamp: Date;
  merchant?: string;
}

interface WalletData {
  available_balance: number;
  escrow_balance: number;
  total_rewards: number;
  daily_limit: number;
  monthly_limit: number;
  currency: string;
}

interface AIInsight {
  id: string;
  type: 'spending' | 'security' | 'optimization' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  icon: any;
  color: string;
}

interface AIWalletInsightsProps {
  walletData: WalletData;
  transactions: Transaction[];
  onInsightAction?: (insight: AIInsight) => void;
}

export const AIWalletInsights: React.FC<AIWalletInsightsProps> = ({
  walletData,
  transactions,
  onInsightAction
}) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [spendingPattern, setSpendingPattern] = useState<any>(null);

  useEffect(() => {
    generateAIInsights();
  }, [walletData, transactions]);

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    try {
      // Analyze spending patterns
      const spendingAnalysis = analyzeSpendingPatterns();
      
      // Generate security insights
      const securityInsights = analyzeSecurityPatterns();
      
      // Generate optimization suggestions
      const optimizationSuggestions = generateOptimizationSuggestions();
      
      // Generate predictions
      const predictions = generatePredictions();

      const allInsights = [
        ...spendingAnalysis,
        ...securityInsights,
        ...optimizationSuggestions,
        ...predictions
      ];

      setInsights(allInsights);
      setSpendingPattern(analyzeSpendingBehavior());
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to generate wallet insights',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSpendingPatterns = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    if (transactions.length === 0) return insights;

    // Calculate spending trends
    const recentSpending = transactions
      .filter(t => t.type === 'payment' && t.amount < 0)
      .slice(0, 10)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const averageTransaction = recentSpending / Math.min(transactions.length, 10);

    // High spending alert
    if (averageTransaction > walletData.daily_limit * 0.3) {
      insights.push({
        id: 'high-spending',
        type: 'spending',
        title: 'High Spending Pattern Detected',
        description: `Your average transaction (R${averageTransaction.toFixed(2)}) is above normal. Consider setting spending alerts.`,
        confidence: 0.85,
        actionable: true,
        priority: 'medium',
        icon: TrendingUp,
        color: 'orange'
      });
    }

    // Frequent small transactions
    const smallTransactions = transactions.filter(t => Math.abs(t.amount) < 50).length;
    if (smallTransactions > transactions.length * 0.7) {
      insights.push({
        id: 'small-transactions',
        type: 'optimization',
        title: 'Many Small Transactions',
        description: 'You make many small transactions. Consider batching payments to save on fees.',
        confidence: 0.90,
        actionable: true,
        priority: 'low',
        icon: Target,
        color: 'blue'
      });
    }

    return insights;
  };

  const analyzeSecurityPatterns = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Check for unusual transaction patterns
    const nightTransactions = transactions.filter(t => {
      const hour = new Date(t.timestamp).getHours();
      return hour >= 22 || hour <= 5;
    }).length;

    if (nightTransactions > transactions.length * 0.2) {
      insights.push({
        id: 'night-transactions',
        type: 'security',
        title: 'Unusual Transaction Times',
        description: 'Multiple transactions detected during night hours. Enable transaction alerts for security.',
        confidence: 0.75,
        actionable: true,
        priority: 'medium',
        icon: Shield,
        color: 'red'
      });
    }

    // Check for balance protection
    if (walletData.available_balance > walletData.daily_limit) {
      insights.push({
        id: 'balance-protection',
        type: 'security',
        title: 'High Balance Risk',
        description: 'Your balance exceeds daily limits. Consider transferring excess to a secure account.',
        confidence: 0.80,
        actionable: true,
        priority: 'high',
        icon: AlertTriangle,
        color: 'red'
      });
    }

    return insights;
  };

  const generateOptimizationSuggestions = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Fee optimization
    const totalFees = transactions
      .filter(t => t.type === 'fee')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalFees > 100) {
      insights.push({
        id: 'fee-optimization',
        type: 'optimization',
        title: 'Reduce Transaction Fees',
        description: `You've paid R${totalFees.toFixed(2)} in fees this month. Use S-Pay wallet for free transfers.`,
        confidence: 0.95,
        actionable: true,
        priority: 'medium',
        icon: Zap,
        color: 'green'
      });
    }

    // Rewards optimization
    if (walletData.total_rewards < 100 && transactions.length > 20) {
      insights.push({
        id: 'rewards-optimization',
        type: 'optimization',
        title: 'Maximize Your Rewards',
        description: 'You could earn more rewards by using S-Pay for marketplace purchases and device registrations.',
        confidence: 0.85,
        actionable: true,
        priority: 'low',
        icon: Sparkles,
        color: 'purple'
      });
    }

    return insights;
  };

  const generatePredictions = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    if (transactions.length < 5) return insights;

    // Predict monthly spending
    const dailyAverage = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 30;

    const projectedMonthly = dailyAverage * 30;

    if (projectedMonthly > walletData.monthly_limit * 0.8) {
      insights.push({
        id: 'spending-prediction',
        type: 'prediction',
        title: 'Monthly Limit Warning',
        description: `Based on your spending pattern, you may reach R${projectedMonthly.toFixed(2)} this month, approaching your R${walletData.monthly_limit} limit.`,
        confidence: 0.75,
        actionable: true,
        priority: 'medium',
        icon: TrendingUp,
        color: 'orange'
      });
    }

    return insights;
  };

  const analyzeSpendingBehavior = () => {
    if (transactions.length === 0) return null;

    const categories = transactions.reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      topCategory: topCategory?.[0] || 'Unknown',
      topCategoryAmount: topCategory?.[1] || 0,
      totalCategories: Object.keys(categories).length,
      averageTransaction: transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
    };
  };

  const handleInsightAction = (insight: AIInsight) => {
    onInsightAction?.(insight);
    
    toast({
      title: 'Insight Action',
      description: `Applied suggestion: ${insight.title}`,
      variant: 'default'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Wallet Insights
          </CardTitle>
          <CardDescription>Analyzing your wallet activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Wallet Insights
            <Badge variant="secondary" className="ml-2">
              {insights.length} insights
            </Badge>
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your wallet activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No insights available yet. Complete more transactions to get personalized recommendations.
              </AlertDescription>
            </Alert>
          ) : (
            insights.map((insight) => {
              const IconComponent = insight.icon;
              return (
                <div
                  key={insight.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className={`p-2 rounded-lg bg-${insight.color}-100 text-${insight.color}-600`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                        {insight.priority}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Progress value={insight.confidence * 100} className="w-12 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInsightAction(insight)}
                      >
                        Apply Suggestion
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {spendingPattern && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Spending Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {spendingPattern.topCategory}
                </div>
                <div className="text-sm text-muted-foreground">
                  Top Spending Category
                </div>
                <div className="text-lg font-semibold">
                  R{spendingPattern.topCategoryAmount.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  R{spendingPattern.averageTransaction.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Transaction
                </div>
                <div className="text-lg font-semibold">
                  {spendingPattern.totalCategories} categories
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
