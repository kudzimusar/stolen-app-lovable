import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

export interface AIInsight {
  id: string;
  type: 'spending' | 'security' | 'optimization' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestion?: string;
  metadata?: Record<string, any>;
}

export interface WalletData {
  userId: string;
  balance: number;
  currency: string;
  transactionCount: number;
  averageTransaction: number;
  lastTransaction: Date;
}

export interface TransactionData {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  timestamp: Date;
  merchant?: string;
}

export interface AIWalletInsightsProps {
  walletData: WalletData;
  transactions: TransactionData[];
  onInsightAction?: (insight: AIInsight, action: string) => void;
  enableRealTimeAnalysis?: boolean;
  confidenceThreshold?: number;
  className?: string;
}

export const AIWalletInsights: React.FC<AIWalletInsightsProps> = ({
  walletData,
  transactions,
  onInsightAction,
  enableRealTimeAnalysis = true,
  confidenceThreshold = 0.7,
  className = ''
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [spendingPattern, setSpendingPattern] = useState<any>(null);
  const [trustScore, setTrustScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (enableRealTimeAnalysis) {
      generateAIInsights();
    }
  }, [walletData, transactions, enableRealTimeAnalysis]);

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
      ].filter(insight => insight.confidence >= confidenceThreshold);

      setInsights(allInsights);
      setSpendingPattern(analyzeSpendingBehavior());
      setTrustScore(calculateTrustScore(allInsights));
      
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
    
    // Calculate spending metrics
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const averageExpense = totalExpenses / transactions.filter(t => t.type === 'expense').length || 0;
    
    // Spending trend analysis
    const recentTransactions = transactions
      .filter(t => t.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .filter(t => t.type === 'expense');
    
    const previousTransactions = transactions
      .filter(t => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        return t.timestamp > sixtyDaysAgo && t.timestamp <= thirtyDaysAgo;
      })
      .filter(t => t.type === 'expense');

    const recentTotal = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const spendingChange = previousTotal > 0 ? (recentTotal - previousTotal) / previousTotal : 0;

    if (spendingChange > 0.2) {
      insights.push({
        id: 'spending_increase',
        type: 'spending',
        title: 'Spending Increase Detected',
        description: `Your spending has increased by ${Math.round(spendingChange * 100)}% compared to last month`,
        confidence: 0.85,
        impact: 'medium',
        actionRequired: true,
        suggestion: 'Consider reviewing your recent transactions and setting a budget'
      });
    }

    if (averageExpense > 1000) {
      insights.push({
        id: 'high_average_spending',
        type: 'spending',
        title: 'High Average Transaction Value',
        description: `Your average transaction is R${averageExpense.toFixed(2)}, which is above typical range`,
        confidence: 0.75,
        impact: 'low',
        actionRequired: false,
        suggestion: 'Monitor large transactions for accuracy'
      });
    }

    return insights;
  };

  const analyzeSecurityPatterns = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Unusual spending patterns
    const recentTransactions = transactions
      .filter(t => t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const unusualTransactions = recentTransactions.filter(t => 
      t.amount > walletData.averageTransaction * 3
    );

    if (unusualTransactions.length > 0) {
      insights.push({
        id: 'unusual_transactions',
        type: 'security',
        title: 'Unusual Transaction Patterns',
        description: `Found ${unusualTransactions.length} transactions significantly above your average`,
        confidence: 0.9,
        impact: 'high',
        actionRequired: true,
        suggestion: 'Review these transactions and report any unauthorized activity'
      });
    }

    // Rapid spending detection
    const rapidTransactions = recentTransactions.filter(t => 
      t.type === 'expense' && t.amount > 500
    );

    if (rapidTransactions.length > 5) {
      insights.push({
        id: 'rapid_spending',
        type: 'security',
        title: 'Rapid High-Value Spending',
        description: `${rapidTransactions.length} high-value transactions in the past week`,
        confidence: 0.8,
        impact: 'medium',
        actionRequired: true,
        suggestion: 'Verify all recent high-value transactions'
      });
    }

    return insights;
  };

  const generateOptimizationSuggestions = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Fee optimization
    const totalFees = transactions
      .filter(t => t.category === 'fees')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalFees > 50) {
      insights.push({
        id: 'fee_optimization',
        type: 'optimization',
        title: 'Fee Optimization Opportunity',
        description: `You've paid R${totalFees.toFixed(2)} in fees this month`,
        confidence: 0.95,
        impact: 'medium',
        actionRequired: false,
        suggestion: 'Consider using fee-free payment methods or upgrading your account'
      });
    }

    // Balance optimization
    if (walletData.balance < 100) {
      insights.push({
        id: 'low_balance',
        type: 'optimization',
        title: 'Low Balance Alert',
        description: 'Your wallet balance is below recommended minimum',
        confidence: 1.0,
        impact: 'high',
        actionRequired: true,
        suggestion: 'Consider adding funds to avoid transaction failures'
      });
    }

    return insights;
  };

  const generatePredictions = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Monthly spending prediction
    const monthlySpending = transactions
      .filter(t => t.type === 'expense')
      .filter(t => t.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + t.amount, 0);

    const projectedMonthly = monthlySpending * 1.1; // 10% growth assumption

    insights.push({
      id: 'monthly_projection',
      type: 'prediction',
      title: 'Monthly Spending Projection',
      description: `Based on current patterns, you may spend R${projectedMonthly.toFixed(2)} this month`,
      confidence: 0.7,
      impact: 'medium',
      actionRequired: false,
      suggestion: 'Set a monthly budget to control spending'
    });

    // Balance depletion warning
    const dailyAverage = monthlySpending / 30;
    const daysUntilDepletion = Math.floor(walletData.balance / dailyAverage);

    if (daysUntilDepletion < 15) {
      insights.push({
        id: 'balance_depletion',
        type: 'prediction',
        title: 'Balance Depletion Warning',
        description: `At current spending rate, balance may be depleted in ${daysUntilDepletion} days`,
        confidence: 0.8,
        impact: 'high',
        actionRequired: true,
        suggestion: 'Consider reducing spending or adding funds'
      });
    }

    return insights;
  };

  const analyzeSpendingBehavior = () => {
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalSpending: Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0),
      categoryBreakdown: categorySpending,
      topCategory: Object.entries(categorySpending).reduce((max, [category, amount]) => 
        amount > max.amount ? { category, amount } : max, 
        { category: '', amount: 0 }
      )
    };
  };

  const calculateTrustScore = (insights: AIInsight[]): number => {
    const securityIssues = insights.filter(i => i.type === 'security' && i.impact === 'high').length;
    const optimizationIssues = insights.filter(i => i.type === 'optimization' && i.impact === 'high').length;
    
    let score = 100;
    score -= securityIssues * 20;
    score -= optimizationIssues * 10;
    
    return Math.max(0, score);
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      spending: TrendingUp,
      security: Shield,
      optimization: Target,
      prediction: Lightbulb
    };
    return icons[type] || Brain;
  };

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'security' && impact === 'high') return 'border-red-200 bg-red-50';
    if (type === 'optimization' && impact === 'high') return 'border-yellow-200 bg-yellow-50';
    if (type === 'prediction' && impact === 'high') return 'border-blue-200 bg-blue-50';
    return 'border-green-200 bg-green-50';
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[impact] || colors.low;
  };

  const handleInsightAction = (insight: AIInsight, action: string) => {
    onInsightAction?.(insight, action);
    toast({
      title: "Action Taken",
      description: `Applied ${action} for ${insight.title}`
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Wallet Insights
            {isAnalyzing && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Trust Score */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Wallet Trust Score</span>
              <span className="text-2xl font-bold">{trustScore}/100</span>
            </div>
            <Progress value={trustScore} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on spending patterns, security, and optimization opportunities
            </p>
          </div>

          {/* Spending Pattern Summary */}
          {spendingPattern && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-1">Total Spending</h4>
                <p className="text-lg font-bold">R{spendingPattern.totalSpending.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-1">Top Category</h4>
                <p className="text-lg font-bold">{spendingPattern.topCategory.category}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-1">Transaction Count</h4>
                <p className="text-lg font-bold">{transactions.length}</p>
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div className="space-y-4">
            <h4 className="font-medium">AI Insights ({insights.length})</h4>
            
            {insights.length === 0 && !isAnalyzing ? (
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  No significant insights found. Your wallet activity appears normal.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => {
                  const Icon = getInsightIcon(insight.type);
                  const colorClass = getInsightColor(insight.type, insight.impact);
                  
                  return (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border ${colorClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{insight.title}</h5>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(insight.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          {insight.suggestion && (
                            <p className="text-sm font-medium text-blue-700 mb-3">
                              💡 {insight.suggestion}
                            </p>
                          )}
                          {insight.actionRequired && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleInsightAction(insight, 'review')}
                              >
                                Review Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInsightAction(insight, 'dismiss')}
                              >
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={generateAIInsights}
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

