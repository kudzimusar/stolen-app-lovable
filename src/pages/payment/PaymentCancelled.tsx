import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { 
  Clock,
  ArrowLeft,
  RefreshCw,
  CreditCard,
  Wallet,
  Info,
  MessageCircle
} from "lucide-react";

interface CancellationDetails {
  id: string;
  amount: number;
  currency: string;
  method: string;
  timestamp: string;
  reason: string;
}

const PaymentCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cancellationDetails, setCancellationDetails] = useState<CancellationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get cancellation details from URL params or create mock data
    const paymentIntentId = searchParams.get('payment_intent');
    const sessionId = searchParams.get('session_id');
    const amount = searchParams.get('amount');
    
    if (paymentIntentId || sessionId || amount) {
      // In real implementation, fetch cancellation details from API
      setCancellationDetails({
        id: paymentIntentId || 'pay_cancelled_' + Date.now(),
        amount: amount ? parseFloat(amount) : 500.00,
        currency: 'ZAR',
        method: 'Standard Bank Visa Card',
        timestamp: new Date().toISOString(),
        reason: 'User cancelled the payment process'
      });
    } else {
      // Fallback to mock data
      setCancellationDetails({
        id: 'pay_cancelled_' + Date.now(),
        amount: 500.00,
        currency: 'ZAR',
        method: 'Payment Method',
        timestamp: new Date().toISOString(),
        reason: 'Payment was cancelled'
      });
    }
    setIsLoading(false);
  }, [searchParams]);

  const handleRetryPayment = () => {
    // Navigate back to add funds with the same amount
    navigate(`/wallet/add-funds?retry=true&amount=${cancellationDetails?.amount}`);
  };

  const handleContactSupport = () => {
    navigate('/support');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

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
            <Badge variant="outline" className="text-yellow-700 bg-yellow-50">
              Payment Cancelled
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Cancellation Icon */}
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-yellow-800 mb-2">Payment Cancelled</h1>
            <p className="text-muted-foreground">
              Your payment was cancelled and no charges were made
            </p>
          </div>

          {/* Cancellation Details */}
          {cancellationDetails && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Info className="w-5 h-5" />
                  Cancelled Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold text-lg">R{cancellationDetails.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Method</p>
                    <p className="font-semibold">{cancellationDetails.method}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-xs">{cancellationDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date & Time</p>
                    <p className="text-sm">{new Date(cancellationDetails.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    <strong>Status:</strong> {cancellationDetails.reason}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-800 mb-1">No Charges Applied</p>
                  <p className="text-blue-700">
                    Since the payment was cancelled, no funds have been charged to your account. 
                    Your wallet balance remains unchanged.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-center">What would you like to do?</h3>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRetryPayment} 
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Payment Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/wallet/add-funds')}
                className="w-full"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Choose Different Method
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/wallet')}
                className="w-full"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Back to Wallet
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => navigate('/marketplace')}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* Support Section */}
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium mb-2">Need assistance?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Our support team is here to help with any payment questions
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleContactSupport}
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                All payment attempts are secured with bank-level encryption. 
                Your financial information is always protected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
