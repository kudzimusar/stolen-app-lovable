import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/STOLENLogo";
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

  const balance = 1250.75;
  const escrowAmount = 450.00;
  const rewardsEarned = 85.50;

  const transactions = [
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
    },
    {
      id: 3,
      type: "escrow",
      amount: 450.00,
      description: "MacBook Pro purchase (pending)",
      date: "2024-07-26",
      status: "pending",
      to: "Apple Certified"
    },
    {
      id: 4,
      type: "received",
      amount: 25.00,
      description: "Referral bonus",
      date: "2024-07-25",
      status: "completed",
      from: "STOLEN Rewards"
    }
  ];

  const rewards = [
    {
      id: 1,
      title: "Device Recovery Hero",
      amount: 50.00,
      description: "Helped recover stolen iPhone 15",
      date: "2024-07-28",
      sponsor: "InsureSafe"
    },
    {
      id: 2,
      title: "Community Contributor",
      amount: 25.00,
      description: "Referral bonus for new user",
      date: "2024-07-25",
      sponsor: "STOLEN"
    },
    {
      id: 3,
      title: "Verification Helper",
      amount: 10.50,
      description: "Helped verify device authenticity",
      date: "2024-07-20",
      sponsor: "BlockChain Security"
    }
  ];

  const escrowTransactions = [
    {
      id: 1,
      device: "MacBook Pro M3 14-inch",
      amount: 450.00,
      seller: "Apple Certified",
      status: "awaiting_delivery",
      date: "2024-07-26",
      estimatedRelease: "2024-07-30"
    }
  ];

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
            <Button variant="outline" size="sm">
              <CreditCard className="w-4 h-4" />
              Add Funds
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
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
              <div className="text-sm text-white/80">Available Balance</div>
              <div className="text-4xl font-bold">
                {showBalance ? `$${balance.toFixed(2)}` : "••••••"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {showBalance ? `$${escrowAmount.toFixed(2)}` : "••••"}
                </div>
                <div className="text-xs text-white/80">In Escrow</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {showBalance ? `$${rewardsEarned.toFixed(2)}` : "••••"}
                </div>
                <div className="text-xs text-white/80">Rewards Earned</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Send className="w-5 h-5" />
            <span>Send</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Download className="w-5 h-5" />
            <span>Receive</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Plus className="w-5 h-5" />
            <span>Request</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <CreditCard className="w-5 h-5" />
            <span>Withdraw</span>
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
                <Card key={transaction.id} className="p-4">
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
                        {transaction.type === "sent" ? "-" : "+"}${transaction.amount.toFixed(2)}
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
                ${rewardsEarned.toFixed(2)} Total
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
                        +${reward.amount.toFixed(2)}
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
                ${escrowAmount.toFixed(2)} Secured
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
                          <div className="font-semibold">${escrow.amount.toFixed(2)}</div>
                          {getStatusBadge(escrow.status)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Funds will be released automatically on {escrow.estimatedRelease} upon delivery confirmation
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Contact Seller
                        </Button>
                        <Button variant="outline" size="sm">
                          Dispute Transaction
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
      </div>
    </div>
  );
};

export default Wallet;