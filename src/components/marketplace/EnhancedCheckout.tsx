// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Shield, 
  Lock, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Truck,
  Clock,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentService, PaymentIntent } from '@/lib/services/payment-integration-service';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QqEWaAwwOABFtJ3YLEKOIe8Z9FN9l3z3Q3X5Q6jQQ8gQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ');

interface CheckoutState {
  cartItems: any[];
  paymentIntent: PaymentIntent;
  summary: {
    subtotal: number;
    platformFee: number;
    paymentFee: number;
    escrowFee: number;
    total: number;
  };
}

interface DeliveryInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryMethod: 'collection' | 'courier' | 'meetup';
  deliveryNotes: string;
}

const CheckoutForm = ({ paymentIntent, onSuccess, onError }: {
  paymentIntent: PaymentIntent;
  onSuccess: () => void;
  onError: (error: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe not loaded');
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        onError('Card element not found');
        return;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        onError(error.message || 'Payment failed');
        return;
      }

      // Process payment through our service
      const result = await paymentService.processStripePayment(
        paymentIntent.id,
        paymentIntent.clientSecret!,
        { payment_method: paymentMethod.id }
      );

      if (result.success) {
        onSuccess();
      } else {
        onError(result.error || 'Payment failed');
      }
    } catch (error) {
      onError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing Payment...' : `Pay ${new Intl.NumberFormat('en-ZA', {
          style: 'currency',
          currency: 'ZAR'
        }).format(paymentIntent.amount)}`}
      </Button>
    </form>
  );
};

export const EnhancedCheckout = () => {
  const { paymentIntentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [checkoutData, setCheckoutData] = useState<CheckoutState | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    province: 'gauteng',
    postalCode: '',
    deliveryMethod: 'courier',
    deliveryNotes: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Get checkout data from navigation state or fetch from API
    if (location.state) {
      setCheckoutData(location.state as CheckoutState);
    } else {
      // In real implementation, fetch payment intent data
      toast({
        title: 'Session Expired',
        description: 'Please try again from your cart',
        variant: 'destructive'
      });
      navigate('/cart');
    }
  }, [location.state, navigate, toast]);

  const handleDeliveryInfoChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateDeliveryInfo = (): boolean => {
    const required = ['fullName', 'phoneNumber', 'address', 'city', 'postalCode'];
    return required.every(field => deliveryInfo[field as keyof DeliveryInfo].trim() !== '');
  };

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      // Create escrow transaction
      if (checkoutData?.paymentIntent) {
        await paymentService.createEscrowTransaction(
          checkoutData.paymentIntent.id,
          checkoutData.summary.total
        );
      }

      // Clear cart
      localStorage.removeItem('cart');

      toast({
        title: 'Payment Successful!',
        description: 'Your order has been placed and funds are held in escrow',
        variant: 'default'
      });

      // Navigate to order confirmation
      navigate(`/order/${checkoutData?.paymentIntent.id}/confirmation`);
    } catch (error) {
      console.error('Post-payment processing failed:', error);
      toast({
        title: 'Order Processing Error',
        description: 'Payment successful but order processing failed. Contact support.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive'
    });
  };

  if (!checkoutData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Secure Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase with escrow protection</p>
          </div>
        </div>

        {/* Progress */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round(progressValue)}% Complete</span>
            </div>
            <Progress value={progressValue} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Delivery Info</span>
              <span>Review Order</span>
              <span>Payment</span>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Information */}
            {currentStep === 1 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Full Name *</label>
                      <Input
                        value={deliveryInfo.fullName}
                        onChange={(e) => handleDeliveryInfoChange('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone Number *</label>
                      <Input
                        value={deliveryInfo.phoneNumber}
                        onChange={(e) => handleDeliveryInfoChange('phoneNumber', e.target.value)}
                        placeholder="+27 123 456 789"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Address *</label>
                    <Input
                      value={deliveryInfo.address}
                      onChange={(e) => handleDeliveryInfoChange('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">City *</label>
                      <Input
                        value={deliveryInfo.city}
                        onChange={(e) => handleDeliveryInfoChange('city', e.target.value)}
                        placeholder="Johannesburg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Province *</label>
                      <select
                        value={deliveryInfo.province}
                        onChange={(e) => handleDeliveryInfoChange('province', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="gauteng">Gauteng</option>
                        <option value="western-cape">Western Cape</option>
                        <option value="kwazulu-natal">KwaZulu-Natal</option>
                        {/* Add more provinces */}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Postal Code *</label>
                      <Input
                        value={deliveryInfo.postalCode}
                        onChange={(e) => handleDeliveryInfoChange('postalCode', e.target.value)}
                        placeholder="2000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Delivery Method</label>
                    <div className="mt-2 space-y-2">
                      {[
                        { value: 'courier', label: 'Courier Delivery', icon: <Truck className="w-4 h-4" />, extra: 'R99' },
                        { value: 'collection', label: 'Collection Point', icon: <MapPin className="w-4 h-4" />, extra: 'Free' },
                        { value: 'meetup', label: 'Safe Meetup', icon: <Eye className="w-4 h-4" />, extra: 'Free' }
                      ].map((method) => (
                        <div key={method.value} className="flex items-center space-x-2">
                          <Checkbox
                            checked={deliveryInfo.deliveryMethod === method.value}
                            onCheckedChange={() => handleDeliveryInfoChange('deliveryMethod', method.value)}
                          />
                          <div className="flex items-center gap-2">
                            {method.icon}
                            <span>{method.label}</span>
                            <Badge variant="outline">{method.extra}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Delivery Notes</label>
                    <Textarea
                      value={deliveryInfo.deliveryNotes}
                      onChange={(e) => handleDeliveryInfoChange('deliveryNotes', e.target.value)}
                      placeholder="Special delivery instructions..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!validateDeliveryInfo()}
                    className="w-full"
                  >
                    Continue to Review
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Review Order */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Review Your Order</h2>
                  <div className="space-y-4">
                    {checkoutData.cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border rounded-md">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.seller} • {item.location}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-verified/10 text-verified">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                            <Badge variant="secondary">
                              Qty: {item.quantity}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {new Intl.NumberFormat('en-ZA', {
                              style: 'currency',
                              currency: 'ZAR'
                            }).format(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {deliveryInfo.fullName}</div>
                    <div><strong>Phone:</strong> {deliveryInfo.phoneNumber}</div>
                    <div><strong>Address:</strong> {deliveryInfo.address}, {deliveryInfo.city}, {deliveryInfo.province} {deliveryInfo.postalCode}</div>
                    <div><strong>Method:</strong> {deliveryInfo.deliveryMethod}</div>
                    {deliveryInfo.deliveryNotes && (
                      <div><strong>Notes:</strong> {deliveryInfo.deliveryNotes}</div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="mt-4"
                  >
                    Edit Delivery Info
                  </Button>
                </Card>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex-1">
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                
                <Alert className="mb-6">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your payment is protected by escrow. Funds will only be released to the seller after you confirm delivery.
                  </AlertDescription>
                </Alert>

                {checkoutData.paymentIntent.paymentMethod.type === 'stripe' && (
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      paymentIntent={checkoutData.paymentIntent}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                )}

                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={agreeToTerms}
                      onCheckedChange={setAgreeToTerms}
                    />
                    <label className="text-sm">
                      I agree to the <a href="/terms-of-service" className="underline">Terms of Service</a> and <a href="/privacy-policy" className="underline">Privacy Policy</a>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                  className="w-full mt-4"
                >
                  Back to Review
                </Button>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(checkoutData.summary.subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(checkoutData.summary.platformFee)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Payment Fee</span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(checkoutData.summary.paymentFee)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    Escrow Protection
                    <Lock className="w-3 h-3" />
                  </span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(checkoutData.summary.escrowFee)}</span>
                </div>
                
                {deliveryInfo.deliveryMethod === 'courier' && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>R99.00</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(checkoutData.summary.total + (deliveryInfo.deliveryMethod === 'courier' ? 99 : 0))}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
