import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { 
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Phone,
  MessageCircle,
  CreditCard,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FailureDetails {
  id: string;
  amount: number;
  currency: string;
  method: string;
  timestamp: string;
  error: string;
  errorCode: string;
  canRetry: boolean;
}

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [failureDetails, setFailureDetails] = useState<FailureDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get failure details from URL params or API
    const paymentIntentId = searchParams.get('payment_intent');
    const sessionId = searchParams.get('session_id');
    const errorParam = searchParams.get('error');
    
    if (paymentIntentId || sessionId || errorParam) {
      fetchFailureDetails(paymentIntentId, sessionId, errorParam);
    } else {
      // Fallback to mock data if no params
      setFailureDetails({
        id: 'pay_failed_' + Date.now(),
        amount: 500.00,
        currency: 'ZAR',
        method: 'Standard Bank Visa Card',
        timestamp: new Date().toISOString(),
        error: 'Payment was declined by your bank',
        errorCode: 'card_declined',
        canRetry: true
      });
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchFailureDetails = async (paymentIntentId: string | null, sessionId: string | null, error: string | null) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/s-pay/payment/failure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ paymentIntentId, sessionId, error })
      });

      const result = await response.json();
      
      if (result.success) {
        setFailureDetails(result.failure);
      } else {
        throw new Error(result.error || 'Failed to fetch failure details');
      }
    } catch (error) {
      console.error('Error fetching failure details:', error);
      // Fallback to mock data
      setFailureDetails({
        id: 'pay_failed_' + Date.now(),
        amount: 500.00,
        currency: 'ZAR',
        method: 'Standard Bank Visa Card',
        timestamp: new Date().toISOString(),
        error: 'Payment processing failed',
        errorCode: 'processing_error',
        canRetry: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'card_declined':
        return {
          title: 'Payment Declined',
          description: 'Your bank declined this payment. Please check your card details or try a different payment method.',
          suggestions: [
            'Verify your card details are correct',
            'Check if you have sufficient funds',
            'Contact your bank to authorize online payments',
            'Try a different payment method'
          ]
        };
      case 'insufficient_funds':
        return {
          title: 'Insufficient Funds',
          description: 'Your account does not have enough funds to complete this payment.',
          suggestions: [
            'Check your account balance',
            'Transfer funds to your account',
            'Try a different payment method',
            'Reduce the payment amount'
          ]
        };
      case 'expired_card':
        return {
          title: 'Card Expired',
          description: 'The payment card you used has expired.',
          suggestions: [
            'Use a different payment card',
            'Update your card details',
            'Contact your bank for a new card'
          ]
        };
      case 'network_error':
        return {
          title: 'Network Error',
          description: 'There was a connection issue during payment processing.',
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Use a different network if possible'
          ]
        };
      default:
        return {
          title: 'Payment Failed',
          description: 'We encountered an issue processing your payment.',
          suggestions: [
            'Try again in a few moments',
            'Check your payment details',
            'Contact support if the issue persists'
          ]
        };
    }
  };

  const handleRetryPayment = () => {
    // Navigate back to add funds with the same amount
    navigate(`/wallet/add-funds?retry=true&amount=${failureDetails?.amount}`);
  };

  const handleContactSupport = () => {
    navigate('/support');
  };

  const handleCallSupport = () => {
    window.open('tel:+27117840000', '_self');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const errorInfo = failureDetails ? getErrorMessage(failureDetails.errorCode) : null;

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
            <Badge variant="outline" className="text-red-700 bg-red-50">
              Payment Failed
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Failure Icon */}
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">{errorInfo?.title}</h1>
            <p className="text-muted-foreground">
              {errorInfo?.description}
            </p>
          </div>

          {/* Payment Details */}
          {failureDetails && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  Failed Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold text-lg">R{failureDetails.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Method</p>
                    <p className="font-semibold">{failureDetails.method}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Error Code</p>
                    <p className="font-mono text-xs">{failureDetails.errorCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date & Time</p>
                    <p className="text-sm">{new Date(failureDetails.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {failureDetails.error}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {errorInfo && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <HelpCircle className="w-5 h-5" />
                  What to do next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-700">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {failureDetails?.canRetry && (
              <Button 
                onClick={handleRetryPayment} 
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => navigate('/wallet/add-funds')}
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Try Different Method
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleContactSupport}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat Support
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCallSupport}
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/wallet')}
              className="w-full"
            >
              Back to Wallet
            </Button>
          </div>

          {/* Support Notice */}
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Need help? Our support team is available 24/7
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-blue-600">
                <span>📞 +27 11 784 0000</span>
                <span>💬 Live Chat</span>
                <span>📧 support@stolen.co.za</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
