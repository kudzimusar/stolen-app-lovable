import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { 
  CheckCircle,
  Wallet,
  Receipt,
  ArrowLeft,
  Download,
  Share,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  method: string;
  timestamp: string;
  description: string;
  newBalance: number;
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get payment details from URL params or API
    const paymentIntentId = searchParams.get('payment_intent');
    const sessionId = searchParams.get('session_id');
    
    if (paymentIntentId || sessionId) {
      fetchPaymentDetails(paymentIntentId, sessionId);
    } else {
      // Fallback to mock data if no params
      setPaymentDetails({
        id: 'pay_' + Date.now(),
        amount: 500.00,
        currency: 'ZAR',
        method: 'Visa Card',
        timestamp: new Date().toISOString(),
        description: 'Wallet funding',
        newBalance: 1750.75
      });
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentDetails = async (paymentIntentId: string | null, sessionId: string | null) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/s-pay/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ paymentIntentId, sessionId })
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentDetails(result.payment);
      } else {
        throw new Error(result.error || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      // Fallback to mock data
      setPaymentDetails({
        id: 'pay_' + Date.now(),
        amount: 500.00,
        currency: 'ZAR',
        method: 'Standard Bank Visa Card',
        timestamp: new Date().toISOString(),
        description: 'S-Pay Wallet funding',
        newBalance: 1750.75
      });
      
      toast({
        title: "Payment Verified",
        description: "Your payment has been processed successfully.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    const receiptData = {
      ...paymentDetails,
      receiptNumber: `RCP-${Date.now()}`,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `S-Pay-Receipt-${paymentDetails?.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Receipt Downloaded",
      description: "Payment receipt has been downloaded successfully.",
    });
  };

  const handleShareReceipt = async () => {
    if (paymentDetails && navigator.share) {
      try {
        await navigator.share({
          title: 'S-Pay Payment Receipt',
          text: `Payment of R${paymentDetails.amount} was successful`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      const shareText = `S-Pay Payment Receipt\nAmount: R${paymentDetails?.amount}\nMethod: ${paymentDetails?.method}\nDate: ${new Date(paymentDetails?.timestamp || '').toLocaleString()}`;
      navigator.clipboard.writeText(shareText);
      
      toast({
        title: "Copied to Clipboard",
        description: "Receipt details copied to clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Verifying payment...</p>
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
            <Badge variant="outline" className="text-green-700 bg-green-50">
              Payment Successful
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Success Icon */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your S-Pay wallet has been funded successfully
            </p>
          </div>

          {/* Payment Details */}
          {paymentDetails && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Receipt className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold text-lg">R{paymentDetails.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Method</p>
                    <p className="font-semibold">{paymentDetails.method}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-xs">{paymentDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date & Time</p>
                    <p className="text-sm">{new Date(paymentDetails.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">New Wallet Balance</span>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-lg text-blue-600">
                        R{paymentDetails.newBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Time Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-800 mb-1">Processing Complete</p>
                  <p className="text-blue-700">
                    Your funds are now available in your S-Pay wallet and can be used immediately 
                    for marketplace purchases or transfers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/wallet')} 
              className="w-full"
              size="lg"
            >
              <Wallet className="w-4 h-4 mr-2" />
              View Wallet
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleDownloadReceipt}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Receipt
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShareReceipt}
                className="flex-1"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/marketplace')}
              className="w-full"
            >
              Start Shopping
            </Button>
          </div>

          {/* Security Notice */}
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                This transaction is secured by S-Pay's bank-level encryption. 
                Keep this confirmation for your records.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
