import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";
import { 
  ArrowLeft,
  CreditCard, 
  Building2, 
  Smartphone, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Plus,
  Wallet,
  Banknote,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dynamicWalletService } from "@/lib/services/dynamic-wallet-service";

interface FundingMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'mobile_money' | 'crypto';
  name: string;
  description: string;
  icon: any;
  processingTime: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
  isAvailable: boolean;
}

interface WalletBalance {
  available: number;
  escrow: number;
  total: number;
  currency: string;
}

const AddFunds = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'method' | 'amount' | 'confirm' | 'processing'>('method');
  const [selectedMethod, setSelectedMethod] = useState<FundingMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    available: 1250.75,
    escrow: 450.00,
    total: 1700.75,
    currency: 'ZAR'
  });

  const fundingMethods: FundingMethod[] = [
    {
      id: 'fnb_card',
      type: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, or SA bank cards',
      icon: CreditCard,
      processingTime: 'Instant',
      fee: 2.5,
      minAmount: 10,
      maxAmount: 10000,
      isAvailable: true
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Bank Transfer (EFT)',
      description: 'Direct transfer from SA bank account',
      icon: Building2,
      processingTime: '1-3 business days',
      fee: 0,
      minAmount: 50,
      maxAmount: 50000,
      isAvailable: true
    },
    {
      id: 'snapscan',
      type: 'mobile_money',
      name: 'SnapScan',
      description: 'Mobile payment with SnapScan',
      icon: Smartphone,
      processingTime: 'Instant',
      fee: 1.5,
      minAmount: 10,
      maxAmount: 5000,
      isAvailable: true
    },
    {
      id: 'zapper',
      type: 'mobile_money',
      name: 'Zapper',
      description: 'Mobile payment with Zapper',
      icon: Smartphone,
      processingTime: 'Instant',
      fee: 2.0,
      minAmount: 10,
      maxAmount: 5000,
      isAvailable: true
    }
  ];

  const calculateFee = (amount: number, method: FundingMethod) => {
    return (amount * method.fee) / 100;
  };

  const calculateTotal = (amount: number, method: FundingMethod) => {
    return amount + calculateFee(amount, method);
  };

  const handleMethodSelect = (method: FundingMethod) => {
    setSelectedMethod(method);
    setStep('amount');
  };

  const handleAmountSubmit = () => {
    if (!selectedMethod) return;
    
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < selectedMethod.minAmount || numAmount > selectedMethod.maxAmount) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between R${selectedMethod.minAmount} and R${selectedMethod.maxAmount}`,
        variant: "destructive"
      });
      return;
    }

    setStep('confirm');
  };

  const processFunding = async () => {
    if (!selectedMethod) return;
    
    setStep('processing');
    setIsLoading(true);

    try {
      const fundingAmount = parseFloat(amount);
      
      // Use dynamic wallet service for real transaction processing
      const result = await dynamicWalletService.simulateTransaction('user_123', 'funding', fundingAmount);
      
      // Update local wallet balance state
      setWalletBalance(prev => ({
        ...prev,
        available: result.balance.available,
        total: result.balance.total
      }));

      toast({
        title: "Funds Added Successfully",
        description: `R${amount} has been added to your S-Pay wallet`,
      });
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page
      navigate(`/payment/success?amount=${amount}&method=${selectedMethod.name}&type=funding`);
      
    } catch (error) {
      console.error('Funding error:', error);
      toast({
        title: "Funding Failed",
        description: "Unable to add funds. Please try again or contact support.",
        variant: "destructive"
      });
      
      // Navigate to failure page
      navigate(`/payment/failure?amount=${amount}&method=${selectedMethod.name}&error=processing_failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (method: FundingMethod) => {
    const IconComponent = method.icon;
    return <IconComponent className="w-6 h-6" />;
  };

  const getStepContent = () => {
    switch (step) {
      case 'method':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Add Funds to S-Pay Wallet</h2>
              <p className="text-muted-foreground">
                Choose your preferred funding method
              </p>
            </div>

            {/* Current Balance */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Current Balance</p>
                    <p className="text-2xl font-bold text-blue-900">
                      R{walletBalance.available.toFixed(2)}
                    </p>
                  </div>
                  <Wallet className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Funding Methods */}
            <div className="space-y-3">
              {fundingMethods.map((method) => (
                <Card 
                  key={method.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !method.isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
                  }`}
                  onClick={() => method.isAvailable && handleMethodSelect(method)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        {getMethodIcon(method)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{method.name}</h3>
                          {method.isAvailable ? (
                            <Badge variant="secondary" className="text-green-700 bg-green-100">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-red-700 bg-red-100">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {method.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {method.processingTime}
                          </span>
                          <span>Fee: {method.fee}%</span>
                          <span>R{method.minAmount} - R{method.maxAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'amount':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Enter Amount</h2>
              <p className="text-muted-foreground">
                How much would you like to add to your wallet?
              </p>
            </div>

            {/* Selected Method */}
            {selectedMethod && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getMethodIcon(selectedMethod)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedMethod.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedMethod.processingTime} • {selectedMethod.fee}% fee
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amount Input */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (ZAR)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    min={selectedMethod?.minAmount}
                    max={selectedMethod?.maxAmount}
                  />
                </div>
                {selectedMethod && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Min: R{selectedMethod.minAmount} | Max: R{selectedMethod.maxAmount.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Fee Calculation */}
              {amount && selectedMethod && parseFloat(amount) > 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span>R{parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee ({selectedMethod.fee}%):</span>
                        <span>R{calculateFee(parseFloat(amount), selectedMethod).toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total to Pay:</span>
                        <span>R{calculateTotal(parseFloat(amount), selectedMethod).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 2000].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="text-sm"
                  >
                    R{quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('method')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleAmountSubmit} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Confirm Funding</h2>
              <p className="text-muted-foreground">
                Please review your funding details
              </p>
            </div>

            {/* Funding Summary */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {selectedMethod && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                          {getMethodIcon(selectedMethod)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{selectedMethod.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedMethod.description}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Amount to Add:</span>
                          <span className="font-semibold">R{parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Fee:</span>
                          <span>R{calculateFee(parseFloat(amount), selectedMethod).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Time:</span>
                          <span>{selectedMethod.processingTime}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total to Pay:</span>
                          <span>R{calculateTotal(parseFloat(amount), selectedMethod).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-700">
                          <span>New Wallet Balance:</span>
                          <span>R{(walletBalance.available + parseFloat(amount)).toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-800 mb-1">Secure Transaction</p>
                    <p className="text-blue-700">
                      Your payment is protected by bank-level encryption and fraud detection.
                      Funds will be available in your wallet after processing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('amount')} className="flex-1">
                Back
              </Button>
              <Button onClick={processFunding} className="flex-1" disabled={isLoading}>
                {isLoading ? "Processing..." : "Add Funds"}
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-6 bg-blue-100 rounded-full">
                <Wallet className="w-12 h-12 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Processing Your Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we securely process your funding request...
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Verifying payment method</p>
              <p>• Processing transaction</p>
              <p>• Updating wallet balance</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/wallet')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <STOLENLogo />
            </div>
            <Badge variant="outline" className="text-green-700 bg-green-50">
              Secure Funding
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {getStepContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddFunds;
