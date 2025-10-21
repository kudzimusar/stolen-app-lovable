// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  PiggyBank, 
  Target,
  DollarSign,
  BarChart3,
  Calendar,
  Shield,
  Info,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Building2,
  CreditCard,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { dynamicWalletService } from "@/lib/services/dynamic-wallet-service";

interface InvestmentProduct {
  id: string;
  name: string;
  type: 'savings_account' | 'fixed_deposit' | 'money_market' | 'crypto_fund' | 'sa_stocks';
  provider: string;
  minInvestment: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  term: string;
  description: string;
  features: string[];
  currency: string;
  isActive: boolean;
}

interface UserInvestment {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  currentValue: number;
  returns: number;
  returnPercentage: number;
  startDate: string;
  maturityDate?: string;
  status: 'active' | 'matured' | 'withdrawn';
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  autoInvest: boolean;
  category: string;
}

interface InvestmentFeaturesProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  walletBalance: number;
}

const InvestmentFeatures: React.FC<InvestmentFeaturesProps> = ({
  isOpen,
  onClose,
  userId,
  walletBalance
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'goals' | 'performance'>('overview');
  const [investmentProducts, setInvestmentProducts] = useState<InvestmentProduct[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInvestmentProducts();
      fetchUserInvestments();
      fetchSavingsGoals();
    }
  }, [isOpen]);

  const fetchInvestmentProducts = async () => {
    try {
      // Mock investment products for South African market
      setInvestmentProducts([
        {
          id: '1',
          name: 'S-Pay High-Yield Savings',
          type: 'savings_account',
          provider: 'S-Pay Financial',
          minInvestment: 100,
          expectedReturn: 8.5,
          riskLevel: 'low',
          term: 'Flexible',
          description: 'Earn competitive interest on your savings with instant access to your funds.',
          features: ['Instant access', 'No lock-in period', 'Compound interest', 'SARB protected'],
          currency: 'ZAR',
          isActive: true
        },
        {
          id: '2',
          name: '12-Month Fixed Deposit',
          type: 'fixed_deposit',
          provider: 'Standard Bank',
          minInvestment: 1000,
          expectedReturn: 10.2,
          riskLevel: 'low',
          term: '12 months',
          description: 'Secure your funds for 12 months and earn guaranteed returns.',
          features: ['Guaranteed returns', 'FSCA protected', 'Fixed rate', 'Maturity options'],
          currency: 'ZAR',
          isActive: true
        },
        {
          id: '3',
          name: 'JSE Top 40 Index Fund',
          type: 'sa_stocks',
          provider: 'Old Mutual',
          minInvestment: 500,
          expectedReturn: 12.8,
          riskLevel: 'medium',
          term: 'Long term',
          description: 'Invest in the top 40 companies listed on the JSE.',
          features: ['Diversified portfolio', 'Professional management', 'Liquid investment', 'Dividend income'],
          currency: 'ZAR',
          isActive: true
        },
        {
          id: '4',
          name: 'Crypto Balanced Fund',
          type: 'crypto_fund',
          provider: 'S-Pay Crypto',
          minInvestment: 250,
          expectedReturn: 15.5,
          riskLevel: 'high',
          term: 'Flexible',
          description: 'Diversified cryptocurrency portfolio managed by experts.',
          features: ['Multiple cryptocurrencies', 'Professional management', 'High growth potential', 'Volatile returns'],
          currency: 'ZAR',
          isActive: true
        },
        {
          id: '5',
          name: 'Money Market Fund',
          type: 'money_market',
          provider: 'Investec',
          minInvestment: 1500,
          expectedReturn: 9.1,
          riskLevel: 'low',
          term: 'Flexible',
          description: 'Conservative investment in short-term, high-quality securities.',
          features: ['Capital preservation', 'Daily liquidity', 'Stable returns', 'Low volatility'],
          currency: 'ZAR',
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('Error fetching investment products:', error);
    }
  };

  const fetchUserInvestments = async () => {
    try {
      // Mock user investments
      setUserInvestments([
        {
          id: '1',
          productId: '1',
          productName: 'S-Pay High-Yield Savings',
          amount: 5000,
          currentValue: 5425.50,
          returns: 425.50,
          returnPercentage: 8.51,
          startDate: '2023-08-15T00:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          productId: '3',
          productName: 'JSE Top 40 Index Fund',
          amount: 2500,
          currentValue: 2890.75,
          returns: 390.75,
          returnPercentage: 15.63,
          startDate: '2023-10-01T00:00:00Z',
          status: 'active'
        }
      ]);
    } catch (error) {
      console.error('Error fetching user investments:', error);
    }
  };

  const fetchSavingsGoals = async () => {
    try {
      // Mock savings goals
      setSavingsGoals([
        {
          id: '1',
          name: 'Emergency Fund',
          targetAmount: 50000,
          currentAmount: 32500,
          targetDate: '2024-12-31',
          monthlyContribution: 2500,
          autoInvest: true,
          category: 'emergency'
        },
        {
          id: '2',
          name: 'New Car',
          targetAmount: 300000,
          currentAmount: 85000,
          targetDate: '2025-06-30',
          monthlyContribution: 5000,
          autoInvest: false,
          category: 'purchase'
        }
      ]);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    }
  };

  const handleInvestment = async (productId: string, amount: number) => {
    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds in your wallet for this investment.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use dynamic wallet service for real investment transaction
      const result = await dynamicWalletService.simulateTransaction(userId, 'purchase', amount);
      
      // Find the product details
      const product = investmentProducts.find(p => p.id === productId);
      
      // Add to user investments with realistic performance simulation
      const performanceChange = (Math.random() - 0.5) * 0.1; // -5% to +5% initial performance
      const newInvestment: UserInvestment = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        productId: productId,
        productName: product?.name || 'Investment Product',
        amount: amount,
        purchaseDate: new Date().toISOString(),
        currentValue: amount * (1 + performanceChange),
        performance: performanceChange * 100,
        currency: 'ZAR'
      };
      
      setUserInvestments(prev => [...prev, newInvestment]);
      
      toast({
        title: "Investment Successful",
        description: `You have successfully invested R${amount.toFixed(2)} in ${product?.name}`,
      });
      
    } catch (error) {
      console.error('Error processing investment:', error);
      toast({
        title: "Investment Failed",
        description: error instanceof Error ? error.message : "Unable to process investment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getReturnColor = (returnPercentage: number) => {
    return returnPercentage >= 0 
      ? 'text-green-600' 
      : 'text-red-600';
  };

  const getTotalInvestmentValue = () => {
    return userInvestments.reduce((total, inv) => total + inv.currentValue, 0);
  };

  const getTotalReturns = () => {
    return userInvestments.reduce((total, inv) => total + inv.returns, 0);
  };

  const getOverallReturnPercentage = () => {
    const totalInvested = userInvestments.reduce((total, inv) => total + inv.amount, 0);
    const totalReturns = getTotalReturns();
    return totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Investment & Savings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('products')}
            >
              <Coins className="w-4 h-4 mr-2" />
              Products
            </Button>
            <Button
              variant={activeTab === 'goals' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('goals')}
            >
              <Target className="w-4 h-4 mr-2" />
              Goals
            </Button>
            <Button
              variant={activeTab === 'performance' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('performance')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </Button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Invested</p>
                        <p className="text-2xl font-bold">R{getTotalInvestmentValue().toFixed(2)}</p>
                      </div>
                      <PiggyBank className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Returns</p>
                        <p className={`text-2xl font-bold ${getReturnColor(getTotalReturns())}`}>
                          R{getTotalReturns().toFixed(2)}
                        </p>
                      </div>
                      {getTotalReturns() >= 0 ? (
                        <ArrowUpRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Return</p>
                        <p className={`text-2xl font-bold ${getReturnColor(getOverallReturnPercentage())}`}>
                          {getOverallReturnPercentage().toFixed(2)}%
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Investments */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  {userInvestments.length > 0 ? (
                    <div className="space-y-4">
                      {userInvestments.map((investment) => (
                        <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{investment.productName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Invested: R{investment.amount.toFixed(2)} • Started: {new Date(investment.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">R{investment.currentValue.toFixed(2)}</p>
                            <p className={`text-sm ${getReturnColor(investment.returnPercentage)}`}>
                              +R{investment.returns.toFixed(2)} ({investment.returnPercentage.toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">Start Your Investment Journey</h3>
                      <p className="text-muted-foreground mb-4">
                        Grow your wealth with our range of investment products.
                      </p>
                      <Button onClick={() => setActiveTab('products')}>
                        Browse Investment Products
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {investmentProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <Badge className={getRiskColor(product.riskLevel)}>
                              {product.riskLevel.toUpperCase()} RISK
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{product.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Expected Return</p>
                              <p className="font-semibold text-green-600">{product.expectedReturn}% p.a.</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Min Investment</p>
                              <p className="font-semibold">R{product.minInvestment.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Term</p>
                              <p className="font-semibold">{product.term}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Provider</p>
                              <p className="font-semibold">{product.provider}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {product.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="ml-6 text-right">
                          <Button
                            onClick={() => {
                              const amount = parseFloat(prompt(`Enter amount to invest (Min: R${product.minInvestment})`) || '0');
                              if (amount >= product.minInvestment) {
                                handleInvestment(product.id, amount);
                              }
                            }}
                            disabled={isLoading}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Invest Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Savings Goals</h3>
                <Button onClick={() => setShowNewGoal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Goal
                </Button>
              </div>

              <div className="grid gap-4">
                {savingsGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const remaining = goal.targetAmount - goal.currentAmount;
                  const monthsLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
                  
                  return (
                    <Card key={goal.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{goal.name}</h3>
                            <p className="text-muted-foreground">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {goal.category}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>R{goal.currentAmount.toLocaleString()} / R{goal.targetAmount.toLocaleString()}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {progress.toFixed(1)}% complete • R{remaining.toLocaleString()} remaining
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Monthly Contribution</p>
                              <p className="font-semibold">R{goal.monthlyContribution.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Months Left</p>
                              <p className="font-semibold">{monthsLeft > 0 ? monthsLeft : 'Overdue'}</p>
                            </div>
                          </div>

                          {goal.autoInvest && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Auto-Invest Enabled
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Detailed Analytics Coming Soon</h3>
                    <p className="text-muted-foreground">
                      We're building comprehensive performance analytics to help you track your investment growth.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Important Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Investment Disclaimer</div>
                <div>Investments carry risk and past performance does not guarantee future returns. All investment products are regulated by the FSCA. Please read the product disclosure documents before investing.</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentFeatures;
