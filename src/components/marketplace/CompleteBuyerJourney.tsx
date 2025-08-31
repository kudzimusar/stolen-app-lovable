import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { QRScanner } from '@/components/ui/QRScanner';
import { 
  Search,
  ShoppingCart,
  CreditCard,
  Package,
  CheckCircle,
  Shield,
  QrCode,
  Eye,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  Star,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhancedStripeService } from '@/lib/services/enhanced-stripe-service';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
  device: {
    serial: string;
    imei?: string;
    verified: boolean;
    stolen_status: 'clear' | 'stolen' | 'reported';
  };
  warranty_months: number;
  description: string;
  location: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  verified: boolean;
}

interface BuyerJourneyStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  icon: any;
}

interface CompleteBuyerJourneyProps {
  initialProduct?: Product;
  onComplete?: (orderId: string) => void;
}

export const CompleteBuyerJourney: React.FC<CompleteBuyerJourneyProps> = ({
  initialProduct,
  onComplete
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Journey state
  const [currentStep, setCurrentStep] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wallet' | 'hybrid'>('stripe');
  const [walletBalance, setWalletBalance] = useState(0);

  // Journey steps
  const journeySteps: BuyerJourneyStep[] = [
    {
      id: 'search',
      title: 'Search & Discover',
      description: 'Find and explore products',
      status: 'completed',
      icon: Search
    },
    {
      id: 'verify',
      title: 'Device Verification',
      description: 'Verify device authenticity',
      status: selectedProduct ? 'completed' : 'current',
      icon: Shield
    },
    {
      id: 'cart',
      title: 'Review Cart',
      description: 'Review selected items',
      status: 'pending',
      icon: ShoppingCart
    },
    {
      id: 'checkout',
      title: 'Secure Checkout',
      description: 'Payment and delivery',
      status: 'pending',
      icon: CreditCard
    },
    {
      id: 'escrow',
      title: 'Escrow Protection',
      description: 'Funds held safely',
      status: 'pending',
      icon: Package
    },
    {
      id: 'delivery',
      title: 'Delivery Tracking',
      description: 'Track your order',
      status: 'pending',
      icon: Truck
    },
    {
      id: 'complete',
      title: 'Order Complete',
      description: 'Transaction finished',
      status: 'pending',
      icon: CheckCircle
    }
  ];

  useEffect(() => {
    if (initialProduct) {
      verifyDevice(initialProduct);
    }
    fetchWalletBalance();
  }, [initialProduct]);

  const fetchWalletBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('available_balance')
        .single();

      if (!error && data) {
        setWalletBalance(data.available_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const verifyDevice = async (product: Product) => {
    setIsLoading(true);
    try {
      // QR Code verification
      const qrResult = await verifyQRCode(product.device.serial);
      
      // Serial number verification
      const serialResult = await verifySerialNumber(product.device.serial, product.device.imei);
      
      // OCR verification (if applicable)
      const ocrResult = await verifyWithOCR(product);

      const verificationResult = {
        qr: qrResult,
        serial: serialResult,
        ocr: ocrResult,
        overall: qrResult.valid && serialResult.valid && ocrResult.valid,
        trustScore: calculateTrustScore(qrResult, serialResult, ocrResult)
      };

      setVerification(verificationResult);

      if (verificationResult.overall) {
        toast({
          title: 'Device Verified',
          description: `Trust score: ${verificationResult.trustScore}%`,
          variant: 'default'
        });
        setCurrentStep(2); // Move to cart step
      } else {
        toast({
          title: 'Verification Issues',
          description: 'Device verification failed. Please review.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Device verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'Failed to verify device',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyQRCode = async (serial: string): Promise<{ valid: boolean; data: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-device-qr', {
        body: { serial }
      });

      return {
        valid: !error && data?.verified,
        data: data || {}
      };
    } catch (error) {
      return { valid: false, data: {} };
    }
  };

  const verifySerialNumber = async (serial: string, imei?: string): Promise<{ valid: boolean; data: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-serial-number', {
        body: { serial, imei }
      });

      return {
        valid: !error && data?.verified,
        data: data || {}
      };
    } catch (error) {
      return { valid: false, data: {} };
    }
  };

  const verifyWithOCR = async (product: Product): Promise<{ valid: boolean; data: any }> => {
    // Mock OCR verification - in real implementation, this would process images
    return {
      valid: true,
      data: { confidence: 0.95 }
    };
  };

  const calculateTrustScore = (qr: any, serial: any, ocr: any): number => {
    let score = 0;
    if (qr.valid) score += 40;
    if (serial.valid) score += 40;
    if (ocr.valid) score += 20;
    return score;
  };

  const handleQRScan = (data: string) => {
    setQrScannerOpen(false);
    // Process QR scan result
    console.log('QR scanned:', data);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        product, 
        quantity: 1, 
        verified: verification?.overall || false 
      }]);
    }

    setCurrentStep(2); // Move to cart step
    
    toast({
      title: 'Added to Cart',
      description: `${product.title} added to your cart`,
      variant: 'default'
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const calculateCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const fees = enhancedStripeService.calculateFees(subtotal, paymentMethod);
    return fees;
  };

  const proceedToCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Add items to your cart before checkout',
        variant: 'destructive'
      });
      return;
    }

    const unverifiedItems = cart.filter(item => !item.verified);
    if (unverifiedItems.length > 0) {
      toast({
        title: 'Verification Required',
        description: 'Please verify all devices before checkout',
        variant: 'destructive'
      });
      return;
    }

    setCurrentStep(3); // Move to checkout step
  };

  const processPayment = async () => {
    setIsLoading(true);
    try {
      const total = calculateCartTotal().total;

      // Create payment intent
      const paymentIntent = await enhancedStripeService.createEscrowPayment(
        total,
        'customer_123', // Should come from user context
        {
          listingId: cart[0].product.id,
          sellerId: cart[0].product.seller.id,
          buyerId: 'user_123',
          deviceId: cart[0].product.device.serial,
          escrowDays: 7
        }
      );

      if (paymentMethod === 'wallet' && walletBalance >= total) {
        // Process with wallet only
        await processWalletPayment(total);
      } else if (paymentMethod === 'hybrid' && walletBalance > 0) {
        // Process hybrid payment
        await processHybridPayment(total, walletBalance);
      } else {
        // Process with Stripe
        await processStripePayment(paymentIntent);
      }

      setCurrentStep(4); // Move to escrow step
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to process payment',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processWalletPayment = async (amount: number) => {
    const result = await enhancedStripeService.deductFromWallet(amount);
    if (!result.success) {
      throw new Error('Insufficient wallet balance');
    }
  };

  const processHybridPayment = async (total: number, walletAmount: number) => {
    const stripeAmount = total - walletAmount;
    
    // Deduct from wallet first
    await processWalletPayment(walletAmount);
    
    // Process remaining with Stripe
    // Implementation would continue with Stripe for remaining amount
  };

  const processStripePayment = async (paymentIntent: any) => {
    // Implementation would use Stripe Elements to process payment
    console.log('Processing Stripe payment:', paymentIntent);
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 0: // Search
        return (
          <Card>
            <CardHeader>
              <CardTitle>Search & Discovery</CardTitle>
              <CardDescription>
                Search completed. Product selected for verification.
              </CardDescription>
            </CardHeader>
          </Card>
        );

      case 1: // Verification
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Device Verification
              </CardTitle>
              <CardDescription>
                Verify device authenticity using our security technologies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <img 
                      src={selectedProduct.images[0]} 
                      alt={selectedProduct.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{selectedProduct.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Serial: {selectedProduct.device.serial}
                      </p>
                      <Badge variant={selectedProduct.device.stolen_status === 'clear' ? 'default' : 'destructive'}>
                        {selectedProduct.device.stolen_status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">R{selectedProduct.price}</div>
                      <div className="text-sm text-muted-foreground">{selectedProduct.condition}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <QrCode className="w-8 h-8 mx-auto mb-2" />
                        <h4 className="font-medium">QR Verification</h4>
                        <Badge variant={verification?.qr?.valid ? 'default' : 'secondary'}>
                          {verification?.qr?.valid ? 'Verified' : 'Pending'}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <Shield className="w-8 h-8 mx-auto mb-2" />
                        <h4 className="font-medium">Serial Check</h4>
                        <Badge variant={verification?.serial?.valid ? 'default' : 'secondary'}>
                          {verification?.serial?.valid ? 'Verified' : 'Pending'}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <Eye className="w-8 h-8 mx-auto mb-2" />
                        <h4 className="font-medium">OCR Analysis</h4>
                        <Badge variant={verification?.ocr?.valid ? 'default' : 'secondary'}>
                          {verification?.ocr?.valid ? 'Verified' : 'Pending'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {verification && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Trust Score</span>
                        <span className="font-bold">{verification.trustScore}%</span>
                      </div>
                      <Progress value={verification.trustScore} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={() => setQrScannerOpen(true)} variant="outline">
                      <QrCode className="w-4 h-4 mr-2" />
                      Scan QR Code
                    </Button>
                    <Button 
                      onClick={() => selectedProduct && addToCart(selectedProduct)}
                      disabled={!verification?.overall}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 2: // Cart
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Review Cart
              </CardTitle>
              <CardDescription>
                Review your selected items before checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.product.seller.name} • {item.product.condition}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={item.verified ? 'default' : 'secondary'}>
                            {item.verified ? 'Verified' : 'Unverified'}
                          </Badge>
                          <Badge variant="outline">
                            {item.product.warranty_months}m warranty
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">R{(item.product.price * item.quantity).toFixed(2)}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    {(() => {
                      const fees = calculateCartTotal();
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>R{fees.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Platform Fee</span>
                            <span>R{fees.platformFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Payment Fee</span>
                            <span>R{fees.paymentFee.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>R{fees.total.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <Button onClick={proceedToCheckout} className="w-full" size="lg">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        );

      case 3: // Checkout
        const fees = calculateCartTotal();
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Secure Checkout
              </CardTitle>
              <CardDescription>
                Choose your payment method and complete your purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h4 className="font-medium">Payment Method</h4>
                
                <div className="grid gap-3">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPaymentMethod('stripe')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Credit/Debit Card</div>
                          <div className="text-sm text-muted-foreground">
                            Visa, Mastercard, American Express
                          </div>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary" />
                    </div>
                  </div>

                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5" />
                        <div>
                          <div className="font-medium">S-Pay Wallet</div>
                          <div className="text-sm text-muted-foreground">
                            Balance: R{walletBalance.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {walletBalance >= fees.total && (
                          <Badge variant="default">Sufficient</Badge>
                        )}
                        {walletBalance < fees.total && (
                          <Badge variant="destructive">Insufficient</Badge>
                        )}
                        <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary" />
                      </div>
                    </div>
                  </div>

                  {walletBalance > 0 && walletBalance < fees.total && (
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'hybrid' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setPaymentMethod('hybrid')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-1">
                            <Package className="w-5 h-5 text-primary" />
                            <CreditCard className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <div className="font-medium">Wallet + Card</div>
                            <div className="text-sm text-muted-foreground">
                              R{walletBalance.toFixed(2)} wallet + R{(fees.total - walletBalance).toFixed(2)} card
                            </div>
                          </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R{fees.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Fee</span>
                    <span>R{fees.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Fee</span>
                    <span>R{fees.paymentFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>R{fees.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Escrow Protection Info */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your payment will be held in secure escrow until you confirm delivery. 
                  Funds are only released to the seller after you approve the transaction.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cart
                </Button>
                <Button 
                  onClick={processPayment} 
                  className="flex-1" 
                  size="lg"
                  disabled={isLoading || (paymentMethod === 'wallet' && walletBalance < fees.total)}
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Pay Securely - R{fees.total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Journey Complete!</h3>
              <p className="text-muted-foreground">
                Your order has been processed successfully.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Buyer Journey</h2>
            <Badge variant="outline">
              Step {currentStep + 1} of {journeySteps.length}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              const status = getStepStatus(index);
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className={`flex flex-col items-center min-w-0 ${
                    status === 'current' ? 'text-primary' : 
                    status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      status === 'current' ? 'border-primary bg-primary/10' :
                      status === 'completed' ? 'border-green-500 bg-green-500/10' :
                      'border-muted-foreground/20 bg-muted/20'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  
                  {index < journeySteps.length - 1 && (
                    <div className="flex-shrink-0 w-8 h-0.5 mx-4 bg-muted-foreground/20" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4">
            <Progress value={((currentStep + 1) / journeySteps.length) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {renderCurrentStepContent()}

      {/* QR Scanner Modal */}
      {qrScannerOpen && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setQrScannerOpen(false)}
        />
      )}
    </div>
  );
};
