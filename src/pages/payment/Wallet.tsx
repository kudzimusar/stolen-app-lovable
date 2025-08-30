import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import PaymentMethodManager from "@/components/PaymentMethodManager";
import WithdrawalRequestForm from "@/components/WithdrawalRequestForm";
import SABankingIntegration from "@/components/SABankingIntegration";
import SecurityEnhancement from "@/components/SecurityEnhancement";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/STOLENLogo";
import { BackButton } from "@/components/BackButton";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Wallet as WalletIcon,
  Send,
  Download,
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Shield,
  Gift,
  CreditCard,
  RefreshCw
} from "lucide-react";

const Wallet = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<"transactions" | "rewards" | "escrow">("transactions");
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [escrowTransactions, setEscrowTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [showSABanking, setShowSABanking] = useState(false);
  const [showSecurityEnhancement, setShowSecurityEnhancement] = useState(false);

  // Fetch wallet data on component mount
  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/s-pay-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: 'get_wallet_balance'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setWalletData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch wallet data');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Fallback to mock data
      setWalletData({
        available_balance: 1250.75,
        escrow_balance: 450.00,
        total_rewards: 85.50,
        is_verified: true,
        fica_status: 'pending',
        daily_limit: 15000,
        monthly_limit: 100000,
        currency: 'ZAR'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/v1/s-pay-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: 'get_transactions',
          limit: 10
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to mock data
      setTransactions([
        {
          id: 1,
          type: "received",
          amount: 50.00,
          description: "Recovery reward - iPhone 15",
          date: "2024-07-28",
          status: "completed",
          from: "STOLEN Rewards"
        },
        {
          id: 2,
          type: "sent",
          amount: 299.99,
          description: "Marketplace purchase - Galaxy S24",
          date: "2024-07-27",
          status: "completed",
          to: "TechDeals Pro"
        }
      ]);
    }
  };

  // Calculate balances from wallet data (ZAR currency)
  const balance = walletData?.available_balance || 1250.75;
  const escrowAmount = walletData?.escrow_balance || 450.00;
  const rewardsEarned = walletData?.total_rewards || 85.50;
  const currency = walletData?.currency || 'ZAR';
  const ficaStatus = walletData?.fica_status || 'pending';
  const isVerified = walletData?.is_verified || false;

  const handleDispute = async (transactionId: string) => {
    try {
      const response = await fetch('/api/v1/s-pay-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          action: 'create_dispute',
          transaction_id: transactionId,
          dispute_type: 'general',
          reason: 'Transaction dispute'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Dispute Created",
          description: "Your dispute has been submitted successfully.",
        });
        setShowTransactionDetails(false);
        fetchTransactions(); // Refresh transactions
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast({
        title: "Error",
        description: "Failed to create dispute. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Mock rewards data (will be replaced with API call)

  // Mock escrow transactions data (will be replaced with API call)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "sent":
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case "received":
        return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case "escrow":
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="text-success">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="text-warning">Pending</Badge>;
      case "awaiting_delivery":
        return <Badge variant="secondary" className="text-primary">Awaiting Delivery</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <STOLENLogo />
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/escrow-payment">
                <CreditCard className="w-4 h-4" />
                Add Funds
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Mobile Back Navigation - Fallback */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        {/* Balance Card */}
        <Card className="p-6 bg-gradient-hero text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WalletIcon className="w-6 h-6" />
                <h1 className="text-xl font-semibold">S-Pay Wallet</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:bg-white/20"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/80">Available Balance</div>
                <div className="flex items-center gap-2">
                  {ficaStatus === 'verified' && (
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300">
                      FICA Verified
                    </Badge>
                  )}
                  {ficaStatus === 'pending' && (
                    <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300">
                      FICA Pending
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-4xl font-bold">
                {loading ? (
                  <div className="animate-pulse bg-white/20 h-12 w-32 rounded"></div>
                ) : (
                  showBalance ? `R${balance.toFixed(2)}` : "••••••"
                )}
              </div>
              <div className="text-sm text-white/60">{currency} • South African Rand</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {loading ? (
                    <div className="animate-pulse bg-white/20 h-6 w-16 rounded mx-auto"></div>
                  ) : (
                    showBalance ? `R${escrowAmount.toFixed(2)}` : "••••"
                  )}
                </div>
                <div className="text-xs text-white/80">In Escrow</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {loading ? (
                    <div className="animate-pulse bg-white/20 h-6 w-16 rounded mx-auto"></div>
                  ) : (
                    showBalance ? `R${rewardsEarned.toFixed(2)}` : "••••"
                  )}
                </div>
                <div className="text-xs text-white/80">Rewards Earned</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2" asChild>
            <Link to="/escrow-payment">
              <Send className="w-5 h-5" />
              <span>Send</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2" asChild>
            <Link to="/escrow-payment">
              <Download className="w-5 h-5" />
              <span>Receive</span>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => setShowPaymentMethods(true)}
          >
            <CreditCard className="w-5 h-5" />
            <span>Payment Methods</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => setShowWithdrawalForm(true)}
          >
            <ArrowDownLeft className="w-5 h-5" />
            <span>Withdraw</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => setShowSABanking(true)}
          >
            <Building2 className="w-5 h-5" />
            <span>SA Banking</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => setShowSecurityEnhancement(true)}
          >
            <Shield className="w-5 h-5" />
            <span>Security</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={activeTab === "transactions" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </Button>
          <Button
            variant={activeTab === "rewards" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("rewards")}
          >
            Rewards
          </Button>
          <Button
            variant={activeTab === "escrow" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("escrow")}
          >
            Escrow
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card 
                  key={transaction.id} 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setShowTransactionDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.type === "sent" ? `To: ${transaction.to}` : 
                           transaction.type === "received" ? `From: ${transaction.from}` : 
                           `To: ${transaction.to}`} • {transaction.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`font-semibold ${
                        transaction.type === "sent" ? "text-destructive" : 
                        transaction.type === "received" ? "text-success" : ""
                      }`}>
                        {transaction.type === "sent" ? "-" : "+"}R{transaction.amount.toFixed(2)}
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Earned Rewards</h2>
              <Badge variant="secondary" className="text-success">
                <Gift className="w-3 h-3 mr-1" />
                R{rewardsEarned.toFixed(2)} Total
              </Badge>
            </div>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <Card key={reward.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-success" />
                      <div>
                        <div className="font-medium">{reward.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {reward.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sponsored by {reward.sponsor} • {reward.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-success">
                        +R{reward.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "escrow" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Escrow Transactions</h2>
              <Badge variant="secondary" className="text-warning">
                <Shield className="w-3 h-3 mr-1" />
                R{escrowAmount.toFixed(2)} Secured
              </Badge>
            </div>
            {escrowTransactions.length > 0 ? (
              <div className="space-y-3">
                {escrowTransactions.map((escrow) => (
                  <Card key={escrow.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{escrow.device}</div>
                          <div className="text-sm text-muted-foreground">
                            Seller: {escrow.seller}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">R{escrow.amount.toFixed(2)}</div>
                          {getStatusBadge(escrow.status)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Funds will be released automatically on {escrow.estimatedRelease} upon delivery confirmation
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/support">
                            Contact Seller
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/support">
                            Dispute Transaction
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Active Escrow</h3>
                <p className="text-muted-foreground mb-4">
                  Your marketplace purchases will appear here while in escrow protection.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/marketplace">
                    Browse Marketplace
                  </Link>
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Modals */}
        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            isOpen={showTransactionDetails}
            onClose={() => {
              setShowTransactionDetails(false);
              setSelectedTransaction(null);
            }}
            onDispute={handleDispute}
          />
        )}

        <PaymentMethodManager
          isOpen={showPaymentMethods}
          onClose={() => setShowPaymentMethods(false)}
        />

                          <WithdrawalRequestForm
                    isOpen={showWithdrawalForm}
                    onClose={() => setShowWithdrawalForm(false)}
                    walletBalance={balance}
                  />
                  <SABankingIntegration
                    isOpen={showSABanking}
                    onClose={() => setShowSABanking(false)}
                  />
                  <SecurityEnhancement
                    isOpen={showSecurityEnhancement}
                    onClose={() => setShowSecurityEnhancement(false)}
                  />
      </div>
    </div>
  );
};

export default Wallet;