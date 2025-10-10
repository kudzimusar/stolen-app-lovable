import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Shield,
  Gift,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export interface WalletBalanceData {
  totalBalance: number;
  availableBalance: number;
  escrowBalance: number;
  pendingBalance: number;
  currency: string;
  lastUpdated: Date;
  isVisible: boolean;
}

export interface TransactionSummary {
  today: {
    income: number;
    expenses: number;
    net: number;
  };
  thisWeek: {
    income: number;
    expenses: number;
    net: number;
  };
  thisMonth: {
    income: number;
    expenses: number;
    net: number;
  };
}

export interface WalletBalanceProps {
  userId: string;
  onBalanceUpdate?: (balance: WalletBalanceData) => void;
  onTransactionClick?: () => void;
  showQuickActions?: boolean;
  enablePrivacy?: boolean;
  className?: string;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  userId,
  onBalanceUpdate,
  onTransactionClick,
  showQuickActions = true,
  enablePrivacy = true,
  className = ''
}) => {
  const [balance, setBalance] = useState<WalletBalanceData | null>(null);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  const mockBalance: WalletBalanceData = {
    totalBalance: 1250.75,
    availableBalance: 850.25,
    escrowBalance: 300.50,
    pendingBalance: 100.00,
    currency: 'ZAR',
    lastUpdated: new Date(),
    isVisible: true
  };

  const mockTransactionSummary: TransactionSummary = {
    today: {
      income: 150.00,
      expenses: 75.50,
      net: 74.50
    },
    thisWeek: {
      income: 450.00,
      expenses: 320.75,
      net: 129.25
    },
    thisMonth: {
      income: 1850.00,
      expenses: 1200.50,
      net: 649.50
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, [userId]);

  const fetchWalletBalance = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBalance(mockBalance);
      setTransactionSummary(mockTransactionSummary);
      onBalanceUpdate?.(mockBalance);
      
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet balance",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    setIsRefreshing(true);
    await fetchWalletBalance();
    setIsRefreshing(false);
    
    toast({
      title: "Balance Updated",
      description: "Wallet balance refreshed successfully"
    });
  };

  const toggleBalanceVisibility = () => {
    if (balance) {
      const updatedBalance = { ...balance, isVisible: !balance.isVisible };
      setBalance(updatedBalance);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getBalanceColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (amount < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Wallet className="w-12 h-12 mx-auto mb-2" />
          <p>Unable to load wallet balance</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Balance Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              S-Pay Wallet
            </CardTitle>
            <div className="flex items-center gap-2">
              {enablePrivacy && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBalanceVisibility}
                >
                  {balance.isVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshBalance}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Total Balance */}
          <div className="text-center">
            <div className="text-3xl font-bold">
              {balance.isVisible ? formatCurrency(balance.totalBalance, balance.currency) : '••••••'}
            </div>
            <p className="text-sm text-muted-foreground">
              Total Balance
            </p>
          </div>

          {/* Balance Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Available</span>
              </div>
              <div className="text-lg font-semibold">
                {balance.isVisible ? formatCurrency(balance.availableBalance, balance.currency) : '••••'}
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Escrow</span>
              </div>
              <div className="text-lg font-semibold">
                {balance.isVisible ? formatCurrency(balance.escrowBalance, balance.currency) : '••••'}
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-lg font-semibold">
                {balance.isVisible ? formatCurrency(balance.pendingBalance, balance.currency) : '••••'}
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Rewards</span>
              </div>
              <div className="text-lg font-semibold">
                {balance.isVisible ? '1,250 pts' : '••••'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => console.log('Send money')}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => console.log('Receive money')}
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Receive
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onTransactionClick}
              >
                History
              </Button>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {balance.lastUpdated.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      {transactionSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Today */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Today</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Income:</span>
                    <span className={getBalanceColor(transactionSummary.today.income)}>
                      {formatCurrency(transactionSummary.today.income)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Expenses:</span>
                    <span className={getBalanceColor(-transactionSummary.today.expenses)}>
                      -{formatCurrency(transactionSummary.today.expenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium border-t pt-1">
                    <span>Net:</span>
                    <span className={getBalanceColor(transactionSummary.today.net)}>
                      {formatCurrency(transactionSummary.today.net)}
                    </span>
                  </div>
                </div>
              </div>

              {/* This Week */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">This Week</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Income:</span>
                    <span className={getBalanceColor(transactionSummary.thisWeek.income)}>
                      {formatCurrency(transactionSummary.thisWeek.income)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Expenses:</span>
                    <span className={getBalanceColor(-transactionSummary.thisWeek.expenses)}>
                      -{formatCurrency(transactionSummary.thisWeek.expenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium border-t pt-1">
                    <span>Net:</span>
                    <span className={getBalanceColor(transactionSummary.thisWeek.net)}>
                      {formatCurrency(transactionSummary.thisWeek.net)}
                    </span>
                  </div>
                </div>
              </div>

              {/* This Month */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">This Month</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Income:</span>
                    <span className={getBalanceColor(transactionSummary.thisMonth.income)}>
                      {formatCurrency(transactionSummary.thisMonth.income)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Expenses:</span>
                    <span className={getBalanceColor(-transactionSummary.thisMonth.expenses)}>
                      -{formatCurrency(transactionSummary.thisMonth.expenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium border-t pt-1">
                    <span>Net:</span>
                    <span className={getBalanceColor(transactionSummary.thisMonth.net)}>
                      {formatCurrency(transactionSummary.thisMonth.net)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};



