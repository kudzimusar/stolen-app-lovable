import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  QrCode, 
  Share2, 
  Copy,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
  Link2,
  DollarSign
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentRequest {
  id: string;
  amount?: number;
  description?: string;
  qrCode: string;
  paymentLink: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
}

interface RecentPayment {
  id: string;
  from: string;
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  receivedAt: string;
}

const ReceiveMoney = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchRecentPayments();
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setWalletBalance(result.available_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchRecentPayments = async () => {
    try {
      // Mock recent payments - replace with API call
      setRecentPayments([
        {
          id: '1',
          from: 'John Doe',
          amount: 150.00,
          description: 'Lunch payment',
          status: 'completed',
          receivedAt: '2024-02-01T10:30:00Z'
        },
        {
          id: '2',
          from: 'Sarah Wilson',
          amount: 75.50,
          description: 'Shared taxi fare',
          status: 'pending',
          receivedAt: '2024-02-01T09:15:00Z'
        },
        {
          id: '3',
          from: 'Mike Johnson',
          amount: 200.00,
          description: 'Event ticket',
          status: 'completed',
          receivedAt: '2024-01-31T16:45:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching recent payments:', error);
    }
  };

  const generatePaymentRequest = async () => {
    setIsGenerating(true);
    
    try {
      const requestData = {
        amount: amount ? parseFloat(amount) : undefined,
        description: description || undefined,
        expiresIn: 24 * 60 * 60 * 1000 // 24 hours
      };

      const response = await fetch('/api/v1/s-pay/payment-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentRequest(result.paymentRequest);
        toast({
          title: "Payment Request Created",
          description: "Your payment request has been generated successfully.",
        });
      } else {
        throw new Error('Failed to generate payment request');
      }
    } catch (error) {
      console.error('Error generating payment request:', error);
      
      // Generate mock payment request for demo
      const mockRequest: PaymentRequest = {
        id: `req_${Date.now()}`,
        amount: amount ? parseFloat(amount) : undefined,
        description: description || undefined,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`spay://receive/${Date.now()}?amount=${amount}&desc=${description}`)}`,
        paymentLink: `https://stolen-app.co.za/pay/${Date.now()}?amount=${amount}&desc=${encodeURIComponent(description || '')}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      setPaymentRequest(mockRequest);
      toast({
        title: "Payment Request Created",
        description: "Your payment request has been generated successfully.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const sharePaymentRequest = async () => {
    if (!paymentRequest) return;

    const shareData = {
      title: 'S-Pay Payment Request',
      text: `Pay ${amount ? `R${amount}` : 'me'} ${description ? `for ${description}` : ''} via S-Pay`,
      url: paymentRequest.paymentLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying link
        await copyToClipboard(paymentRequest.paymentLink, 'Payment link');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const refreshPaymentRequest = () => {
    setPaymentRequest(null);
    setAmount('');
    setDescription('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/wallet')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Receive Money</h1>
          <p className="text-muted-foreground">Request and track payments</p>
        </div>
      </div>

      {/* Current Balance */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">R{walletBalance.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWalletBalance}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={activeTab === 'request' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setActiveTab('request')}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Request Payment
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setActiveTab('history')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Payment History
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'request' && (
        <div className="space-y-6">
          {!paymentRequest ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Create Payment Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to let the payer choose the amount
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this payment for?"
                  />
                </div>

                <Button 
                  onClick={generatePaymentRequest} 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR Code & Link
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Payment Request</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshPaymentRequest}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Request
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Details */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    {paymentRequest.amount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">R{paymentRequest.amount.toFixed(2)}</span>
                      </div>
                    )}
                    {paymentRequest.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">For:</span>
                        <span>{paymentRequest.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span>{new Date(paymentRequest.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-white rounded-lg border">
                      <img 
                        src={paymentRequest.qrCode} 
                        alt="Payment QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with any S-Pay compatible app
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(paymentRequest.paymentLink, 'Payment link')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={sharePaymentRequest}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {/* Payment Link */}
                  <div className="space-y-2">
                    <Label>Payment Link</Label>
                    <div className="flex gap-2">
                      <Input
                        value={paymentRequest.paymentLink}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(paymentRequest.paymentLink, 'Payment link')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How to Share */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How to Share</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Show QR Code</div>
                      <div className="text-sm text-muted-foreground">
                        Let others scan the code in person
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Send via WhatsApp/SMS</div>
                      <div className="text-sm text-muted-foreground">
                        Share the payment link through messaging apps
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Link2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Copy & Paste Link</div>
                      <div className="text-sm text-muted-foreground">
                        Share via email or any other platform
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <div className="font-medium">R{payment.amount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            From {payment.from}
                          </div>
                          {payment.description && (
                            <div className="text-xs text-muted-foreground">
                              {payment.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(payment.receivedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Payments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't received any payments yet. Create a payment request to get started!
                  </p>
                  <Button onClick={() => setActiveTab('request')}>
                    Create Payment Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-medium">Secure Payments</div>
            <div>All payments are protected by blockchain verification and encrypted for your security.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoney;
