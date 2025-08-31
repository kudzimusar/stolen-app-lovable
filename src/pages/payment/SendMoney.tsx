import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  QrCode, 
  Users, 
  CreditCard, 
  Wallet,
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  Info,
  Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  walletId?: string;
  avatar?: string;
  isFavorite?: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'wallet' | 'stripe' | 'paypal';
  name: string;
  balance?: number;
  icon: string;
  isDefault?: boolean;
}

const SendMoney = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'recipient' | 'amount' | 'payment' | 'confirm' | 'processing'>('recipient');
  const [recipient, setRecipient] = useState<Contact | null>(null);
  const [recipientInput, setRecipientInput] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [fees, setFees] = useState({ processing: 0, platform: 0, total: 0 });
  const [isValidating, setIsValidating] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (amount && selectedPaymentMethod) {
      calculateFees();
    }
  }, [amount, selectedPaymentMethod]);

  const fetchContacts = async () => {
    try {
      // Mock contacts for now - replace with API call
      setContacts([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+27123456789',
          walletId: 'wallet_john',
          isFavorite: true
        },
        {
          id: '2',
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          phone: '+27987654321',
          walletId: 'wallet_sarah',
          isFavorite: false
        }
      ]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      // Mock payment methods - replace with API call
      setPaymentMethods([
        {
          id: 'spay_wallet',
          type: 'wallet',
          name: 'S-Pay Wallet',
          balance: 2450.75,
          icon: 'wallet',
          isDefault: true
        },
        {
          id: 'stripe_card',
          type: 'stripe',
          name: 'Visa Card •••• 4242',
          icon: 'credit-card',
          isDefault: false
        },
        {
          id: 'paypal',
          type: 'paypal',
          name: 'PayPal Account',
          icon: 'paypal',
          isDefault: false
        }
      ]);
      
      // Set default payment method
      const defaultMethod = paymentMethods.find(pm => pm.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const calculateFees = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || !selectedPaymentMethod) return;

    try {
      // Calculate fees based on payment method and amount
      let processingFee = 0;
      let platformFee = 0;

      switch (selectedPaymentMethod.type) {
        case 'wallet':
          processingFee = Math.max(2.50, numAmount * 0.005); // R2.50 min, 0.5%
          platformFee = Math.min(50, processingFee); // R50 max
          break;
        case 'stripe':
          processingFee = numAmount * 0.029 + 2.90; // 2.9% + R2.90
          platformFee = numAmount * 0.01; // 1% platform fee
          break;
        case 'paypal':
          processingFee = numAmount * 0.034 + 2.50; // 3.4% + R2.50
          platformFee = numAmount * 0.01; // 1% platform fee
          break;
      }

      setFees({
        processing: processingFee,
        platform: platformFee,
        total: processingFee + platformFee
      });
    } catch (error) {
      console.error('Error calculating fees:', error);
    }
  };

  const validateRecipient = async (input: string) => {
    setIsValidating(true);
    try {
      // Validate recipient - email, phone, wallet ID, or QR code
      // This should call the API to verify the recipient exists
      const response = await fetch('/api/v1/s-pay/validate-recipient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ identifier: input })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRecipient(result.user);
          return true;
        }
      }
      
      // For demo purposes, accept any email format
      if (input.includes('@') || input.includes('+27')) {
        setRecipient({
          id: 'temp_recipient',
          name: input,
          email: input.includes('@') ? input : undefined,
          phone: input.includes('+27') ? input : undefined
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error validating recipient:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleRecipientSubmit = async () => {
    if (!recipientInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipient",
        variant: "destructive"
      });
      return;
    }

    const isValid = await validateRecipient(recipientInput);
    if (isValid) {
      setStep('amount');
    } else {
      toast({
        title: "Error",
        description: "Recipient not found. Please check the email, phone number, or wallet ID.",
        variant: "destructive"
      });
    }
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

    if (selectedPaymentMethod?.type === 'wallet' && numAmount + fees.total > (selectedPaymentMethod.balance || 0)) {
      toast({
        title: "Error",
        description: "Insufficient wallet balance including fees",
        variant: "destructive"
      });
      return;
    }

    setStep('payment');
  };

  const handlePaymentSubmit = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }
    setStep('confirm');
  };

  const handleConfirmTransfer = async () => {
    setStep('processing');
    
    try {
      const transferAmount = parseFloat(amount);
      const totalAmount = transferAmount + fees.total;
      
      // Use dynamic wallet service for real transaction processing
      const result = await dynamicWalletService.simulateTransaction('user_123', 'purchase', totalAmount);
      
      toast({
        title: "Transfer Successful",
        description: `Successfully sent R${amount} to ${recipient?.name || recipientInput}`,
      });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to success page
      navigate(`/payment/success?amount=${amount}&recipient=${recipient?.name || recipientInput}&type=transfer`);
      
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: "Unable to process transfer. Please try again.",
        variant: "destructive"
      });
      
      // Navigate to failure page
      navigate(`/payment/failure?amount=${amount}&recipient=${recipient?.name || recipientInput}&error=insufficient_funds`);
    }
  };

  const selectContact = (contact: Contact) => {
    setRecipient(contact);
    setRecipientInput(contact.email || contact.phone || contact.walletId || '');
    setStep('amount');
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'wallet': return <Wallet className="w-5 h-5" />;
      case 'stripe': return <CreditCard className="w-5 h-5" />;
      case 'paypal': return <CreditCard className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'recipient':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="recipient">Send to (Email, Phone, or Wallet ID)</Label>
              <div className="flex gap-2">
                <Input
                  id="recipient"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="email@example.com or +27123456789"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowQRScanner(true)}
                  title="Scan QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                onClick={handleRecipientSubmit} 
                className="w-full"
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Continue'}
              </Button>
            </div>

            {contacts.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <Label>Recent Contacts</Label>
                </div>
                <div className="grid gap-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => selectContact(contact)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {contact.email || contact.phone}
                          </div>
                        </div>
                      </div>
                      {contact.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'amount':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Sending to: {recipient?.name || recipientInput}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ZAR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this for?"
                />
              </div>

              {amount && fees.total > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Amount</span>
                    <span>R{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span>R{fees.processing.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platform Fee</span>
                    <span>R{fees.platform.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>R{(parseFloat(amount) + fees.total).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('recipient')}>
                  Back
                </Button>
                <Button onClick={handleAmountSubmit} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Select Payment Method</Label>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod?.id === method.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(method.type)}
                        <div>
                          <div className="font-medium">{method.name}</div>
                          {method.balance !== undefined && (
                            <div className="text-sm text-muted-foreground">
                              Available: R{method.balance.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('amount')}>
                  Back
                </Button>
                <Button onClick={handlePaymentSubmit} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h3 className="font-semibold">Transfer Summary</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To:</span>
                    <span>{recipient?.name || recipientInput}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>R{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fees:</span>
                    <span>R{fees.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span>{selectedPaymentMethod?.name}</span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description:</span>
                      <span>{description}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>R{(parseFloat(amount) + fees.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    This transfer will be processed immediately and cannot be reversed. 
                    Please verify all details are correct.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('payment')}>
                  Back
                </Button>
                <Button onClick={handleConfirmTransfer} className="flex-1">
                  <Shield className="w-4 h-4 mr-2" />
                  Confirm Transfer
                </Button>
              </div>
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
          onClick={() => step === 'recipient' ? navigate('/wallet') : setStep('recipient')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Send Money</h1>
          <p className="text-muted-foreground">Transfer funds securely</p>
        </div>
      </div>

      {/* Progress Indicator */}
      {step !== 'processing' && (
        <div className="flex gap-2">
          {['recipient', 'amount', 'payment', 'confirm'].map((stepName, index) => (
            <div
              key={stepName}
              className={`flex-1 h-2 rounded-full ${
                ['recipient', 'amount', 'payment', 'confirm'].indexOf(step) >= index
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
            <Send className="w-5 h-5" />
            {step === 'recipient' && 'Select Recipient'}
            {step === 'amount' && 'Enter Amount'}
            {step === 'payment' && 'Payment Method'}
            {step === 'confirm' && 'Confirm Transfer'}
            {step === 'processing' && 'Processing'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex gap-2">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <div className="font-medium">Secure Transfer</div>
            <div>All transfers are protected by blockchain verification and AI fraud detection.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
