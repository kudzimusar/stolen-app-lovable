import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeftRight, 
  ArrowLeft,
  Wallet,
  CreditCard,
  Building2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Shield,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WalletAccount {
  id: string;
  type: 'spay' | 'bank' | 'card';
  name: string;
  balance?: number;
  accountNumber?: string;
  isDefault?: boolean;
  icon: string;
}

interface TransferHistory {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  fees: number;
  status: 'completed' | 'pending' | 'failed';
  transferType: 'internal' | 'bank' | 'card';
  date: string;
}

const TransferMoney = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'accounts' | 'amount' | 'confirm' | 'processing'>('accounts');
  const [fromAccount, setFromAccount] = useState<WalletAccount | null>(null);
  const [toAccount, setToAccount] = useState<WalletAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferHistory[]>([]);
  const [fees, setFees] = useState({ processing: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchTransferHistory();
  }, []);

  useEffect(() => {
    if (amount && fromAccount && toAccount) {
      calculateFees();
    }
  }, [amount, fromAccount, toAccount]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      
      // For now, using mock data - replace with actual API call
      const mockAccounts: WalletAccount[] = [
        {
          id: 'spay_main',
          type: 'spay',
          name: 'S-Pay Wallet',
          balance: 2450.75,
          isDefault: true,
          icon: 'wallet'
        },
        {
          id: 'fnb_account',
          type: 'bank',
          name: 'FNB Cheque Account',
          balance: 8920.50,
          accountNumber: '****7892',
          isDefault: false,
          icon: 'bank'
        },
        {
          id: 'standard_savings',
          type: 'bank',
          name: 'Standard Bank Savings',
          balance: 15670.25,
          accountNumber: '****4521',
          isDefault: false,
          icon: 'bank'
        },
        {
          id: 'visa_card',
          type: 'card',
          name: 'Visa Credit Card',
          accountNumber: '****4242',
          isDefault: false,
          icon: 'card'
        }
      ];
      
      setAccounts(mockAccounts);
      
      // Set default from account
      const defaultAccount = mockAccounts.find(acc => acc.isDefault);
      if (defaultAccount) {
        setFromAccount(defaultAccount);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransferHistory = async () => {
    try {
      // Mock transfer history - replace with API call
      setTransferHistory([
        {
          id: '1',
          fromAccount: 'S-Pay Wallet',
          toAccount: 'FNB Cheque Account',
          amount: 500.00,
          fees: 12.50,
          status: 'completed',
          transferType: 'bank',
          date: '2024-02-01T10:30:00Z'
        },
        {
          id: '2',
          fromAccount: 'FNB Cheque Account',
          toAccount: 'S-Pay Wallet',
          amount: 1000.00,
          fees: 15.00,
          status: 'completed',
          transferType: 'bank',
          date: '2024-01-30T14:20:00Z'
        },
        {
          id: '3',
          fromAccount: 'S-Pay Wallet',
          toAccount: 'Standard Bank Savings',
          amount: 750.00,
          fees: 18.75,
          status: 'pending',
          transferType: 'bank',
          date: '2024-01-29T09:45:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching transfer history:', error);
    }
  };

  const calculateFees = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || !fromAccount || !toAccount) return;

    let processingFee = 0;

    // Calculate fees based on transfer type
    if (fromAccount.type === 'spay' && toAccount.type === 'spay') {
      // Internal S-Pay transfer
      processingFee = Math.max(2.50, numAmount * 0.005); // R2.50 min, 0.5%
      processingFee = Math.min(processingFee, 25.00); // R25 max
    } else if (fromAccount.type === 'bank' || toAccount.type === 'bank') {
      // Bank transfer
      processingFee = Math.max(10.00, numAmount * 0.01); // R10 min, 1%
      processingFee = Math.min(processingFee, 75.00); // R75 max
    } else if (fromAccount.type === 'card' || toAccount.type === 'card') {
      // Card transfer
      processingFee = Math.max(15.00, numAmount * 0.025); // R15 min, 2.5%
      processingFee = Math.min(processingFee, 100.00); // R100 max
    }

    setFees({
      processing: processingFee,
      total: processingFee
    });
  };

  const handleAccountSelection = () => {
    if (!fromAccount) {
      toast({
        title: "Error",
        description: "Please select a source account",
        variant: "destructive"
      });
      return;
    }

    if (!toAccount) {
      toast({
        title: "Error",
        description: "Please select a destination account",
        variant: "destructive"
      });
      return;
    }

    if (fromAccount.id === toAccount.id) {
      toast({
        title: "Error",
        description: "Source and destination accounts cannot be the same",
        variant: "destructive"
      });
      return;
    }

    setStep('amount');
  };

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = numAmount + fees.total;
    if (fromAccount?.balance && totalAmount > fromAccount.balance) {
      toast({
        title: "Error",
        description: "Insufficient balance including fees",
        variant: "destructive"
      });
      return;
    }

    setStep('confirm');
  };

  const executeTransfer = async () => {
    setStep('processing');
    
    try {
      const transferData = {
        fromAccountId: fromAccount?.id,
        toAccountId: toAccount?.id,
        amount: parseFloat(amount),
        fees: fees
      };

      const response = await fetch('/api/v1/s-pay/internal-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(transferData)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Transfer Successful",
          description: `Successfully transferred R${amount} from ${fromAccount?.name} to ${toAccount?.name}`,
        });
        
        // Navigate back to wallet
        navigate('/wallet?transfer=success');
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: "Unable to process transfer. Please try again.",
        variant: "destructive"
      });
      setStep('confirm');
    }
  };

  const swapAccounts = () => {
    const temp = fromAccount;
    setFromAccount(toAccount);
    setToAccount(temp);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'spay': return <Wallet className="w-5 h-5" />;
      case 'bank': return <Building2 className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getTransferTypeLabel = (type: string) => {
    switch (type) {
      case 'internal': return 'Internal Transfer';
      case 'bank': return 'Bank Transfer';
      case 'card': return 'Card Transfer';
      default: return 'Transfer';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <RefreshCw className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'accounts':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>From Account</Label>
              <div className="grid gap-3">
                {accounts.map((account) => (
                  <div
                    key={`from-${account.id}`}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      fromAccount?.id === account.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFromAccount(account)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAccountIcon(account.type)}
                        <div>
                          <div className="font-medium">{account.name}</div>
                          {account.accountNumber && (
                            <div className="text-sm text-muted-foreground">
                              {account.accountNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {account.balance !== undefined && (
                          <div className="font-medium">R{account.balance.toFixed(2)}</div>
                        )}
                        {account.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapAccounts}
                disabled={!fromAccount || !toAccount}
                className="rounded-full"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <Label>To Account</Label>
              <div className="grid gap-3">
                {accounts
                  .filter(account => account.id !== fromAccount?.id)
                  .map((account) => (
                    <div
                      key={`to-${account.id}`}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        toAccount?.id === account.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setToAccount(account)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAccountIcon(account.type)}
                          <div>
                            <div className="font-medium">{account.name}</div>
                            {account.accountNumber && (
                              <div className="text-sm text-muted-foreground">
                                {account.accountNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {account.balance !== undefined && (
                            <div className="font-medium">R{account.balance.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <Button onClick={handleAccountSelection} className="w-full">
              Continue
            </Button>
          </div>
        );

      case 'amount':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getAccountIcon(fromAccount?.type || '')}
                  <span>{fromAccount?.name}</span>
                </div>
                <ArrowLeftRight className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  {getAccountIcon(toAccount?.type || '')}
                  <span>{toAccount?.name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Transfer Amount (ZAR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {fromAccount?.balance && (
                  <p className="text-sm text-muted-foreground">
                    Available: R{fromAccount.balance.toFixed(2)}
                  </p>
                )}
              </div>

              {amount && fees.total > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Transfer Amount</span>
                    <span>R{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span>R{fees.processing.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Deducted</span>
                    <span>R{(parseFloat(amount) + fees.total).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('accounts')}>
                  Back
                </Button>
                <Button onClick={handleAmountSubmit} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h3 className="font-semibold">Transfer Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span>{fromAccount?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span>{toAccount?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>R{parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fees:</span>
                  <span>R{fees.total.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>R{(parseFloat(amount) + fees.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  This transfer will be processed immediately. Bank transfers may take 1-3 business days to reflect.
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('amount')}>
                Back
              </Button>
              <Button onClick={executeTransfer} className="flex-1">
                <Shield className="w-4 h-4 mr-2" />
                Confirm Transfer
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="font-semibold text-lg">Processing Transfer</h3>
              <p className="text-muted-foreground">
                Please wait while we process your transfer...
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step === 'accounts' ? navigate('/wallet') : setStep('accounts')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Transfer Money</h1>
          <p className="text-muted-foreground">Move funds between accounts</p>
        </div>
      </div>

      {/* Progress Indicator */}
      {step !== 'processing' && (
        <div className="flex gap-2">
          {['accounts', 'amount', 'confirm'].map((stepName, index) => (
            <div
              key={stepName}
              className={`flex-1 h-2 rounded-full ${
                ['accounts', 'amount', 'confirm'].indexOf(step) >= index
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            {step === 'accounts' && 'Select Accounts'}
            {step === 'amount' && 'Enter Amount'}
            {step === 'confirm' && 'Confirm Transfer'}
            {step === 'processing' && 'Processing'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Transfer History */}
      {step === 'accounts' && transferHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transferHistory.slice(0, 3).map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(transfer.status)}
                    <div>
                      <div className="font-medium">R{transfer.amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {transfer.fromAccount} → {transfer.toAccount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTransferTypeLabel(transfer.transferType)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={transfer.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {transfer.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(transfer.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex gap-2">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <div className="font-medium">Secure Transfers</div>
            <div>All transfers are encrypted and protected by multi-layered security protocols.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferMoney;
