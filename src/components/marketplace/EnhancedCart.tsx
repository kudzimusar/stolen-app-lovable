import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, ShieldCheck, Minus, Plus, Trash2, CreditCard, Wallet, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { paymentService, PaymentMethod, WalletBalance } from '@/lib/services/payment-integration-service';
import { QRScanner } from '@/components/ui/QRScanner';

interface CartItem {
  id: number;
  listingId: string;
  deviceId: string;
  title: string;
  price: number;
  image: string;
  seller: string;
  sellerId: string;
  location: string;
  condition: string;
  stolenStatus: 'clean' | 'stolen' | 'lost';
  warrantyMonths: number;
  quantity: number;
  verified: boolean;
  escrowEligible: boolean;
}

interface CartSummary {
  subtotal: number;
  platformFee: number;
  paymentFee: number;
  escrowFee: number;
  total: number;
}

export const EnhancedCart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyingItem, setVerifyingItem] = useState<CartItem | null>(null);

  // Load cart data and payment methods
  useEffect(() => {
    loadCartData();
    loadPaymentMethods();
    loadWalletBalance();
  }, []);

  const loadCartData = () => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        const enhancedItems = parsed.map((item: any) => ({
          ...item,
          listingId: `listing_${item.id}`,
          deviceId: `device_${item.id}`,
          seller: item.seller || 'Unknown Seller',
          sellerId: `seller_${item.id}`,
          location: item.location || 'Unknown Location',
          condition: item.condition || 'Good',
          stolenStatus: item.stolenStatus || 'clean',
          warrantyMonths: item.warrantyMonths || 0,
          quantity: item.quantity || 1,
          verified: item.stolenStatus === 'clean',
          escrowEligible: true
        }));
        setCartItems(enhancedItems);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive'
      });
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getAvailablePaymentMethods();
      setAvailablePaymentMethods(methods);
      setSelectedPaymentMethod(methods[0]);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const loadWalletBalance = async () => {
    try {
      // Mock user ID - in real app, get from auth context
      const userId = 'user_123';
      const balance = await paymentService.getWalletBalance(userId);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (itemId: number) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    toast({
      title: 'Item removed',
      description: 'Item has been removed from your cart'
    });
  };

  const verifyDeviceInCart = (item: CartItem) => {
    setVerifyingItem(item);
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = (serialNumber: string) => {
    if (verifyingItem) {
      // In real implementation, validate against blockchain
      const updatedItems = cartItems.map(item =>
        item.id === verifyingItem.id 
          ? { ...item, verified: true, stolenStatus: 'clean' as const }
          : item
      );
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      toast({
        title: 'Device Verified',
        description: `Serial ${serialNumber} verified as clean`,
        variant: 'default'
      });
    }
    setShowVerificationModal(false);
    setVerifyingItem(null);
  };

  const calculateSummary = (): CartSummary => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (!selectedPaymentMethod) {
      return { subtotal, platformFee: 0, paymentFee: 0, escrowFee: 0, total: subtotal };
    }

    const fees = paymentService.calculatePaymentFees(subtotal, selectedPaymentMethod);
    const escrowFee = subtotal * 0.01; // 1% escrow fee

    return {
      subtotal,
      platformFee: fees.platformFee,
      paymentFee: fees.paymentFee,
      escrowFee,
      total: fees.total + escrowFee
    };
  };

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Add items to your cart before checkout',
        variant: 'destructive'
      });
      return;
    }

    const unverifiedItems = cartItems.filter(item => !item.verified);
    if (unverifiedItems.length > 0) {
      toast({
        title: 'Verification Required',
        description: 'Please verify all devices before checkout',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create payment intent for the cart
      const summary = calculateSummary();
      const paymentIntent = await paymentService.createPaymentIntent(
        summary.total,
        'ZAR',
        selectedPaymentMethod?.id || 'stripe',
        {
          listingId: cartItems[0].listingId,
          sellerId: cartItems[0].sellerId,
          buyerId: 'user_123', // Get from auth context
          deviceId: cartItems[0].deviceId
        }
      );

      // Navigate to checkout with payment intent
      navigate(`/checkout/${paymentIntent.id}`, {
        state: {
          cartItems,
          paymentIntent,
          summary
        }
      });
    } catch (error) {
      console.error('Checkout failed:', error);
      toast({
        title: 'Checkout Failed',
        description: 'Failed to initiate checkout process',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const summary = calculateSummary();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">
                Discover verified devices in our marketplace
              </p>
            </div>
            <Button asChild>
              <Link to="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-md object-cover"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Sold by {item.seller} • {item.location}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.stolenStatus === 'clean' ? (
                        <Badge variant="secondary" className="bg-verified/10 text-verified">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Clean
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {item.stolenStatus}
                        </Badge>
                      )}
                      
                      {item.verified ? (
                        <Badge variant="secondary" className="bg-verified/10 text-verified">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verifyDeviceInCart(item)}
                        >
                          Verify Device
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {new Intl.NumberFormat('en-ZA', {
                            style: 'currency',
                            currency: 'ZAR'
                          }).format(item.price * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('en-ZA', {
                              style: 'currency',
                              currency: 'ZAR'
                            }).format(item.price)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary & Payment */}
          <div className="space-y-4">
            {/* Payment Method Selection */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Payment Method</h3>
              <Tabs value={selectedPaymentMethod?.id} onValueChange={(value) => {
                const method = availablePaymentMethods.find(m => m.id === value);
                setSelectedPaymentMethod(method || null);
              }}>
                <TabsList className="grid w-full grid-cols-3">
                  {availablePaymentMethods.map((method) => (
                    <TabsTrigger key={method.id} value={method.id} className="text-xs">
                      {method.icon} {method.type === 's-pay' ? 'Wallet' : method.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {availablePaymentMethods.map((method) => (
                  <TabsContent key={method.id} value={method.id} className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{method.name}</span>
                        {method.testMode && (
                          <Badge variant="outline" className="text-xs">Test Mode</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      
                      {method.type === 's-pay' && walletBalance && (
                        <div className="p-3 bg-muted rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Available Balance:</span>
                            <span className="font-semibold">
                              {new Intl.NumberFormat('en-ZA', {
                                style: 'currency',
                                currency: 'ZAR'
                              }).format(walletBalance.available)}
                            </span>
                          </div>
                          {walletBalance.available < summary.total && (
                            <div className="text-sm text-destructive mt-1">
                              Insufficient balance. Please add funds.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>

            {/* Order Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(summary.subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(summary.platformFee)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Payment Fee</span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(summary.paymentFee)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    Escrow Protection
                    <Lock className="w-3 h-3" />
                  </span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(summary.escrowFee)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR'
                  }).format(summary.total)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={proceedToCheckout}
                disabled={isLoading || cartItems.some(item => !item.verified)}
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    Secure Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                Protected by escrow. Funds released after delivery confirmation.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Device Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Device: {verifyingItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Scan the device QR code or enter the serial number to verify authenticity and ownership.
            </p>
            
            <Tabs defaultValue="qr">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR Scanner</TabsTrigger>
                <TabsTrigger value="serial">Serial Number</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qr" className="space-y-4">
                <QRScanner onScanSuccess={handleVerificationSuccess} />
              </TabsContent>
              
              <TabsContent value="serial" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Serial Number</label>
                  <Input 
                    placeholder="Enter device serial number"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          handleVerificationSuccess(input.value.trim());
                        }
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Usually found in Settings {'>'} About Device or on the device packaging
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
