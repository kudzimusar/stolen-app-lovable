import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Store, 
  CreditCard, 
  QrCode,
  Smartphone,
  BarChart3,
  DollarSign,
  Users,
  ShoppingCart,
  Settings,
  Receipt,
  Zap,
  Globe,
  Wifi,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  RefreshCw,
  Plus,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MerchantProfile {
  id: string;
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isVerified: boolean;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  accountType: 'individual' | 'business' | 'enterprise';
}

interface PaymentMethod {
  id: string;
  type: 'qr_code' | 'nfc' | 'online' | 'in_store' | 'mobile_app';
  name: string;
  description: string;
  processingFee: number;
  setupCost: number;
  features: string[];
  isActive: boolean;
  monthlyLimit: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  customerInfo: string;
  timestamp: string;
  fee: number;
  netAmount: number;
}

interface Analytics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  successRate: number;
  topPaymentMethod: string;
  monthlyGrowth: number;
  peakHours: string[];
  customerRetention: number;
}

interface MerchantServicesProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const MerchantServices: React.FC<MerchantServicesProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'payments' | 'analytics' | 'settings'>('overview');
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMerchantProfile();
      fetchPaymentMethods();
      fetchRecentTransactions();
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchMerchantProfile = async () => {
    try {
      // Mock merchant profile
      setMerchantProfile({
        id: 'merchant_123',
        businessName: 'TechCorp Solutions',
        businessType: 'Technology Services',
        registrationNumber: '2019/123456/07',
        taxNumber: '9876543210',
        contactEmail: 'business@techcorp.co.za',
        contactPhone: '+27123456789',
        address: '123 Business St, Sandton, Johannesburg',
        isVerified: true,
        verificationLevel: 'enhanced',
        accountType: 'business'
      });
    } catch (error) {
      console.error('Error fetching merchant profile:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      // Mock payment methods
      setPaymentMethods([
        {
          id: '1',
          type: 'qr_code',
          name: 'QR Code Payments',
          description: 'Let customers scan QR codes to pay instantly',
          processingFee: 2.5,
          setupCost: 0,
          features: ['Instant payments', 'No hardware required', 'Works with any smartphone', 'Real-time notifications'],
          isActive: true,
          monthlyLimit: 500000
        },
        {
          id: '2',
          type: 'nfc',
          name: 'Tap-to-Pay (NFC)',
          description: 'Accept contactless card and mobile payments',
          processingFee: 2.9,
          setupCost: 299,
          features: ['Contactless payments', 'Card reader included', 'Apple Pay & Google Pay', 'EMV certified'],
          isActive: false,
          monthlyLimit: 1000000
        },
        {
          id: '3',
          type: 'online',
          name: 'Online Payments',
          description: 'Integrate payment gateway into your website',
          processingFee: 3.2,
          setupCost: 99,
          features: ['API integration', 'Hosted checkout', 'Multiple currencies', 'Fraud protection'],
          isActive: true,
          monthlyLimit: 2000000
        },
        {
          id: '4',
          type: 'mobile_app',
          name: 'Mobile App Integration',
          description: 'SDK for mobile app payment integration',
          processingFee: 2.8,
          setupCost: 199,
          features: ['Native SDKs', 'In-app purchases', 'Subscription billing', 'Wallet integration'],
          isActive: false,
          monthlyLimit: 1500000
        }
      ]);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      // Mock recent transactions
      setRecentTransactions([
        {
          id: 'txn_001',
          amount: 1250.00,
          currency: 'ZAR',
          status: 'completed',
          paymentMethod: 'QR Code',
          customerInfo: 'John D. (...4321)',
          timestamp: '2024-02-01T14:30:00Z',
          fee: 31.25,
          netAmount: 1218.75
        },
        {
          id: 'txn_002',
          amount: 850.50,
          currency: 'ZAR',
          status: 'completed',
          paymentMethod: 'Online Payment',
          customerInfo: 'Sarah W. (...8765)',
          timestamp: '2024-02-01T12:15:00Z',
          fee: 27.22,
          netAmount: 823.28
        },
        {
          id: 'txn_003',
          amount: 2100.00,
          currency: 'ZAR',
          status: 'pending',
          paymentMethod: 'NFC Payment',
          customerInfo: 'Mike J. (...2468)',
          timestamp: '2024-02-01T11:45:00Z',
          fee: 60.90,
          netAmount: 2039.10
        }
      ]);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Mock analytics
      setAnalytics({
        totalRevenue: 125480.75,
        totalTransactions: 342,
        averageTransactionValue: 366.90,
        successRate: 97.8,
        topPaymentMethod: 'QR Code Payments',
        monthlyGrowth: 23.5,
        peakHours: ['10:00-12:00', '14:00-16:00', '19:00-21:00'],
        customerRetention: 78.2
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleActivatePaymentMethod = async (methodId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/s-pay/merchant/payment-methods/${methodId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setPaymentMethods(prev => prev.map(method => 
            method.id === methodId 
              ? { ...method, isActive: true }
              : method
          ));
          
          toast({
            title: "Payment Method Activated",
            description: "The payment method has been activated successfully.",
          });
        }
      }
    } catch (error) {
      console.error('Error activating payment method:', error);
      toast({
        title: "Activation Failed",
        description: "Unable to activate payment method. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/merchant/qr-code/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          merchantId: merchantProfile?.id,
          amount: null // Dynamic amount
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Download QR code or show in modal
          const qrCodeData = result.qrCode;
          
          toast({
            title: "QR Code Generated",
            description: "Your merchant QR code has been generated successfully.",
          });
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate QR code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'qr_code':
        return <QrCode className="w-5 h-5" />;
      case 'nfc':
        return <Wifi className="w-5 h-5" />;
      case 'online':
        return <Globe className="w-5 h-5" />;
      case 'mobile_app':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'basic':
        return <Badge className="bg-blue-100 text-blue-800">Basic Verified</Badge>;
      case 'enhanced':
        return <Badge className="bg-green-100 text-green-800">Enhanced Verified</Badge>;
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium Verified</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Merchant Services
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'setup' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('setup')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Setup
            </Button>
            <Button
              variant={activeTab === 'payments' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('payments')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('analytics')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Business Profile Summary */}
              {merchantProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{merchantProfile.businessName}</span>
                      {getVerificationBadge(merchantProfile.verificationLevel)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Business Type</p>
                        <p className="font-medium">{merchantProfile.businessType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registration Number</p>
                        <p className="font-medium">{merchantProfile.registrationNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Type</p>
                        <p className="font-medium capitalize">{merchantProfile.accountType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Metrics */}
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold">R{analytics.totalRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Transactions</p>
                          <p className="text-2xl font-bold">{analytics.totalTransactions}</p>
                        </div>
                        <Receipt className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="text-2xl font-bold">{analytics.successRate}%</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                          <p className="text-2xl font-bold">R{analytics.averageTransactionValue.toFixed(0)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <p className="font-medium">R{transaction.amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.customerInfo} • {transaction.paymentMethod}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {transaction.status.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Net: R{transaction.netAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Setup Tab */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {paymentMethods.map((method) => (
                      <Card key={method.id} className={method.isActive ? 'border-green-200 bg-green-50' : ''}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                {getMethodIcon(method.type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{method.name}</h3>
                                <p className="text-muted-foreground mb-3">{method.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Processing Fee</p>
                                    <p className="font-semibold">{method.processingFee}%</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Setup Cost</p>
                                    <p className="font-semibold">
                                      {method.setupCost === 0 ? 'Free' : `R${method.setupCost}`}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Monthly Limit</p>
                                    <p className="font-semibold">R{method.monthlyLimit.toLocaleString()}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {method.features.map((feature, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="ml-6">
                              {method.isActive ? (
                                <div className="text-center">
                                  <Badge className="bg-green-100 text-green-800 mb-2">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                  {method.type === 'qr_code' && (
                                    <div>
                                      <Button size="sm" onClick={generateQRCode}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Get QR Code
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Button
                                  onClick={() => handleActivatePaymentMethod(method.id)}
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      Activating...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Detailed Transaction History</h3>
                    <p className="text-muted-foreground">
                      View, filter, and export your complete transaction history.
                    </p>
                    <Button className="mt-4">
                      <Download className="w-4 h-4 mr-2" />
                      Export Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Monthly Growth</span>
                        <span className="font-semibold text-green-600">+{analytics.monthlyGrowth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Retention</span>
                        <span className="font-semibold">{analytics.customerRetention}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Top Payment Method</span>
                        <span className="font-semibold">{analytics.topPaymentMethod}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Peak Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.peakHours.map((hour, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span>{hour}</span>
                            <Badge variant="outline">Peak</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {merchantProfile && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input id="businessName" value={merchantProfile.businessName} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessType">Business Type</Label>
                          <Input id="businessType" value={merchantProfile.businessType} readOnly />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">Registration Number</Label>
                          <Input id="registrationNumber" value={merchantProfile.registrationNumber} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxNumber">Tax Number</Label>
                          <Input id="taxNumber" value={merchantProfile.taxNumber} readOnly />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Input id="address" value={merchantProfile.address} readOnly />
                      </div>

                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          To modify business information, please contact our support team.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Important Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <Store className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Merchant Services</div>
                <div>All merchant services are regulated by the SARB and comply with South African payment regulations. Processing fees may vary based on transaction volume and business type.</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MerchantServices;
