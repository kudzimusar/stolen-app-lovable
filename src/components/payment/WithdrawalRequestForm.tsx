import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowDownLeft, 
  Building2, 
  CreditCard, 
  Bitcoin,
  AlertCircle,
  Info,
  DollarSign
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  method_type: 'bank_account' | 'credit_card' | 'crypto_wallet';
  method_name: string;
  method_data: any;
  is_default: boolean;
  is_verified: boolean;
}

interface WithdrawalRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
}

const WithdrawalRequestForm: React.FC<WithdrawalRequestFormProps> = ({
  isOpen,
  onClose,
  walletBalance
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processingFee, setProcessingFee] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  useEffect(() => {
    if (amount && selectedMethod) {
      calculateFees();
    }
  }, [amount, selectedMethod]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/wallet/payment-methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPaymentMethods(result.data);
        // Set default method if available
        const defaultMethod = result.data.find((method: PaymentMethod) => method.is_default);
        if (defaultMethod) {
          setSelectedMethod(defaultMethod.id);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to mock data
      setPaymentMethods([
        {
          id: '1',
          method_type: 'bank_account',
          method_name: 'Chase Bank Account',
          method_data: { last4: '1234', bank_name: 'Chase Bank' },
          is_default: true,
          is_verified: true
        },
        {
          id: '2',
          method_type: 'credit_card',
          method_name: 'Visa Card',
          method_data: { last4: '5678', card_type: 'Visa' },
          is_default: false,
          is_verified: true
        }
      ]);
      setSelectedMethod('1');
    }
  };

  const calculateFees = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setProcessingFee(0);
      setNetAmount(0);
      return;
    }

    try {
      const response = await fetch('/api/v1/s-pay/wallet/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          amount: numAmount,
          transaction_type: 'withdrawal',
          calculate_fees_only: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setProcessingFee(result.fee_amount || 0);
        setNetAmount(numAmount - (result.fee_amount || 0));
      }
    } catch (error) {
      console.error('Error calculating fees:', error);
      // Fallback fee calculation (2% + $1.00)
      const fee = Math.max(1.00, numAmount * 0.02);
      setProcessingFee(fee);
      setNetAmount(numAmount - fee);
    }
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    
    if (!selectedMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method for withdrawal.",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive"
      });
      return;
    }

    if (numAmount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive"
      });
      return;
    }

    if (numAmount < 10) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is $10.00.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/s-pay/wallet/withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          amount: numAmount,
          payment_method_id: selectedMethod,
          description: `Withdrawal to ${getSelectedMethodName()}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Withdrawal Request Submitted",
          description: "Your withdrawal request has been submitted and is being processed.",
        });
        onClose();
        resetForm();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setProcessingFee(0);
    setNetAmount(0);
  };

  const getSelectedMethodName = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    return method?.method_name || '';
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_account':
        return <Building2 className="w-4 h-4" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'crypto_wallet':
        return <Bitcoin className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getMethodTypeLabel = (type: string) => {
    switch (type) {
      case 'bank_account':
        return 'Bank Account';
      case 'credit_card':
        return 'Credit Card';
      case 'crypto_wallet':
        return 'Crypto Wallet';
      default:
        return type;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5" />
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Available Balance */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Balance</span>
                <span className="text-xl font-bold">{formatAmount(walletBalance)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                min="10"
                max={walletBalance}
                step="0.01"
              />
            </div>
            <p className="text-sm text-gray-500">
              Minimum: $10.00 | Maximum: {formatAmount(walletBalance)}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {getMethodIcon(method.method_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.method_name}</span>
                          {method.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                          {method.is_verified ? (
                            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {getMethodTypeLabel(method.method_type)}
                          {method.method_data?.last4 && ` •••• ${method.method_data.last4}`}
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          {amount && selectedMethod && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Fee Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Withdrawal Amount</span>
                    <span>{formatAmount(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="text-red-600">-{formatAmount(processingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Net Amount</span>
                    <span>{formatAmount(netAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Time Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium">Processing Time</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Bank transfers: 1-3 business days</li>
                    <li>• Credit card refunds: 5-10 business days</li>
                    <li>• Crypto withdrawals: 10-30 minutes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">Important Notice</p>
                  <p>
                    Withdrawal requests are processed during business hours. Large amounts may require 
                    additional verification. You will receive email confirmation once your withdrawal 
                    is processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !amount || !selectedMethod || parseFloat(amount) <= 0}
            >
              {loading ? "Processing..." : "Submit Withdrawal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalRequestForm;
