import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Clock,
  CreditCard,
  Wallet,
  AlertCircle,
  FileText,
  MessageCircle,
  Star,
  DollarSign,
  Lock,
  Zap
} from "lucide-react";

const EscrowPayment = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [paymentMethod, setPaymentMethod] = useState("s-pay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [delivery, setDelivery] = useState<'courier' | 'in-person'>("courier");
  const [terms, setTerms] = useState(false);
  const { toast } = useToast();

  // Mock transaction data
  const transaction = {
    id: "TXN-12345",
    device: "iPhone 15 Pro Max - Space Black",
    seller: "TechStore Pro",
    sellerRating: 4.9,
    price: 899,
    currency: "USD",
    fees: {
      platform: 26.97,
      escrow: 8.99,
      total: 35.96
    },
    protection: {
      included: true,
      coverage: "$1,200",
      duration: "30 days"
    },
    milestones: [
      {
        name: "Payment Submitted",
        status: "completed",
        date: "2025-01-20 14:30"
      },
      {
        name: "Funds in Escrow",
        status: "in_progress",
        date: "Pending verification"
      },
      {
        name: "Seller Ships Device",
        status: "pending",
        date: "Waiting for payment"
      },
      {
        name: "Buyer Confirms Receipt",
        status: "pending",
        date: "After shipping"
      },
      {
        name: "Funds Released",
        status: "pending",
        date: "Final step"
      }
    ]
  };

  // User's S-Pay wallet balance
  const walletBalance = 1250.75;

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Payment Successful!",
      description: "Funds are now held securely in escrow. The seller has been notified.",
      variant: "default"
    });
    setIsProcessing(false);
    navigate(`/order/${transaction.id}/confirmation`);
  };

  const totalAmount = transaction.price + transaction.fees.total;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/marketplace">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Transaction Overview */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{transaction.device}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">Sold by</span>
                <span className="font-medium">{transaction.seller}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{transaction.sellerRating}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline">ID: {transaction.id}</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-lg">
              <span>Device Price</span>
              <span className="font-semibold">${transaction.price.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (3%)</span>
                <span>${transaction.fees.platform.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escrow Protection (1%)</span>
                <span>${transaction.fees.escrow.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold border-t pt-4">
              <span>Total Amount</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Escrow Protection Info */}
        <Card className="p-6 bg-success/5 border-success/20">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-success mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-success">Escrow Protection Included</h3>
              <p className="text-sm text-muted-foreground">
                Your payment is held securely until you confirm receipt of the device.
                Coverage up to {transaction.protection.coverage} for {transaction.protection.duration}.
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Full refund if device not as described</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Protection against fraud and theft</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>24/7 dispute resolution support</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Delivery & Handover */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Delivery & Handover</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Button variant={delivery==='courier'? 'default':'outline'} onClick={()=>setDelivery('courier')}>Courier Delivery</Button>
            <Button variant={delivery==='in-person'? 'default':'outline'} onClick={()=>setDelivery('in-person')}>In‑Person Handover</Button>
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            If this is a donation, <Link to="/transfer-donate" className="underline">NGO verification</Link> will be required before handover.
          </div>
        </Card>


        {/* Payment Method Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          
          <div className="space-y-3">
            {/* S-Pay Option */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 's-pay' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setPaymentMethod('s-pay')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">STOLEN Pay (S-Pay)</div>
                    <div className="text-sm text-muted-foreground">
                      Balance: ${walletBalance.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Instant
                  </Badge>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 's-pay' ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`} />
                </div>
              </div>
            </div>

            {/* Credit Card Option */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-muted-foreground">
                      Visa, Mastercard, American Express
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  paymentMethod === 'card' ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`} />
              </div>
            </div>
          </div>

          {paymentMethod === 's-pay' && walletBalance < totalAmount && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Insufficient Balance</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                You need ${(totalAmount - walletBalance).toFixed(2)} more. Add funds to your S-Pay wallet.
              </p>
              <Button size="sm" variant="outline" className="mt-2">
                Add Funds
              </Button>
            </div>
          )}
        </Card>

        {/* Insurance Quote */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Insurance Quote</h2>
          <div className="text-sm text-muted-foreground mb-3">Protect your device from theft and damage. Instant quote based on device price.</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Basic Plan</div>
              <div className="text-sm text-muted-foreground">R99/month • R5,000 coverage</div>
              <Button size="sm" className="mt-2">Select</Button>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Plus Plan</div>
              <div className="text-sm text-muted-foreground">R149/month • R10,000 coverage</div>
              <Button size="sm" className="mt-2" variant="outline">Select</Button>
            </div>
          </div>
        </Card>

        {/* Payment Progress */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Process</h2>
          
          <div className="space-y-4">
            {transaction.milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.status === 'completed' ? 'bg-success text-white' :
                  milestone.status === 'in_progress' ? 'bg-warning text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : milestone.status === 'in_progress' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{milestone.name}</div>
                  <div className="text-sm text-muted-foreground">{milestone.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <input id="terms" type="checkbox" className="w-4 h-4" checked={terms} onChange={(e)=>setTerms(e.target.checked)} />
            <label htmlFor="terms">I agree to the <Link to={`/orders/${transaction.id}`} className="underline">terms and return policy</Link></label>
          </div>
          <Button 
            className="w-full h-12 text-lg"
            onClick={handlePayment}
            disabled={isProcessing || (paymentMethod === 's-pay' && walletBalance < totalAmount) || !terms}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Pay ${totalAmount.toFixed(2)} Securely
              </div>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to="/seller/techdeals-pro">
                <MessageCircle className="w-4 h-4" />
                Contact Seller
              </Link>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to={`/orders/${transaction.id}`}>
                <FileText className="w-4 h-4" />
                View Terms
              </Link>
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm space-y-1">
              <div className="font-medium">Your payment is secure</div>
              <div className="text-muted-foreground">
                All transactions are encrypted and protected by blockchain technology. 
                Your funds are held in escrow until you confirm receipt.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EscrowPayment;