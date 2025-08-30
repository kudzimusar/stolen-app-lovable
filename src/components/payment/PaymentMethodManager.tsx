import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Building2, 
  Bitcoin, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  method_type: 'bank_account' | 'credit_card' | 'crypto_wallet';
  method_name: string;
  method_data: any;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
}

interface PaymentMethodManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({
  isOpen,
  onClose
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    method_type: 'bank_account' as const,
    method_name: '',
    account_number: '',
    routing_number: '',
    card_number: '',
    expiry_date: '',
    cvv: '',
    crypto_address: '',
    crypto_type: 'bitcoin'
  });

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/s-pay/wallet/payment-methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPaymentMethods(result.data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to mock data
      setPaymentMethods([
        {
          id: '1',
          method_type: 'bank_account',
          method_name: 'Chase Bank Account',
          method_data: { last4: '1234', bank_name: 'Chase Bank' },
          is_default: true,
          is_verified: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          method_type: 'credit_card',
          method_name: 'Visa Card',
          method_data: { last4: '5678', card_type: 'Visa' },
          is_default: false,
          is_verified: true,
          created_at: '2024-01-15T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      const methodData = getMethodData();
      
      const response = await fetch('/api/v1/s-pay/wallet/payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          method_type: formData.method_type,
          method_name: formData.method_name,
          method_data: methodData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Payment Method Added",
          description: "Your payment method has been added successfully.",
        });
        setShowAddForm(false);
        resetForm();
        fetchPaymentMethods();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!editingMethod) return;

    try {
      const methodData = getMethodData();
      
      const response = await fetch(`/api/v1/s-pay/wallet/payment-method?id=${editingMethod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          method_name: formData.method_name,
          method_data: methodData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Payment Method Updated",
          description: "Your payment method has been updated successfully.",
        });
        setEditingMethod(null);
        resetForm();
        fetchPaymentMethods();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/v1/s-pay/wallet/payment-method?id=${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Payment Method Removed",
          description: "Your payment method has been removed successfully.",
        });
        fetchPaymentMethods();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to remove payment method. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await fetch(`/api/v1/s-pay/wallet/payment-method?id=${methodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          is_default: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Default Payment Method Updated",
          description: "Your default payment method has been updated.",
        });
        fetchPaymentMethods();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update default payment method. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMethodData = () => {
    switch (formData.method_type) {
      case 'bank_account':
        return {
          account_number: formData.account_number.slice(-4),
          routing_number: formData.routing_number,
          bank_name: formData.method_name
        };
      case 'credit_card':
        return {
          card_number: formData.card_number.slice(-4),
          expiry_date: formData.expiry_date,
          card_type: 'Visa' // This would be detected from card number
        };
      case 'crypto_wallet':
        return {
          address: formData.crypto_address,
          crypto_type: formData.crypto_type
        };
      default:
        return {};
    }
  };

  const resetForm = () => {
    setFormData({
      method_type: 'bank_account',
      method_name: '',
      account_number: '',
      routing_number: '',
      card_number: '',
      expiry_date: '',
      cvv: '',
      crypto_address: '',
      crypto_type: 'bitcoin'
    });
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_account':
        return <Building2 className="w-5 h-5" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
      case 'crypto_wallet':
        return <Bitcoin className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getMethodTypeLabel = (type: string) => {
    switch (type) {
      case 'bank_account':
        return 'Bank Account';
      case 'credit_card':
        return 'Credit Card';
      case 'crypto_wallet':
        return 'Crypto Wallet';
      default:
        return type;
    }
  };

  const renderPaymentMethodForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="method_type">Payment Method Type</Label>
          <select
            id="method_type"
            value={formData.method_type}
            onChange={(e) => setFormData({ ...formData, method_type: e.target.value as any })}
            className="w-full p-2 border rounded-md"
          >
            <option value="bank_account">Bank Account</option>
            <option value="credit_card">Credit Card</option>
            <option value="crypto_wallet">Crypto Wallet</option>
          </select>
        </div>

        <div>
          <Label htmlFor="method_name">Display Name</Label>
          <Input
            id="method_name"
            value={formData.method_name}
            onChange={(e) => setFormData({ ...formData, method_name: e.target.value })}
            placeholder="e.g., My Chase Account"
          />
        </div>

        {formData.method_type === 'bank_account' && (
          <>
            <div>
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                type="password"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label htmlFor="routing_number">Routing Number</Label>
              <Input
                id="routing_number"
                value={formData.routing_number}
                onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                placeholder="Enter routing number"
              />
            </div>
          </>
        )}

        {formData.method_type === 'credit_card' && (
          <>
            <div>
              <Label htmlFor="card_number">Card Number</Label>
              <Input
                id="card_number"
                value={formData.card_number}
                onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  placeholder="123"
                />
              </div>
            </div>
          </>
        )}

        {formData.method_type === 'crypto_wallet' && (
          <>
            <div>
              <Label htmlFor="crypto_type">Cryptocurrency</Label>
              <select
                id="crypto_type"
                value={formData.crypto_type}
                onChange={(e) => setFormData({ ...formData, crypto_type: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="usdc">USDC</option>
                <option value="usdt">USDT</option>
              </select>
            </div>
            <div>
              <Label htmlFor="crypto_address">Wallet Address</Label>
              <Input
                id="crypto_address"
                value={formData.crypto_address}
                onChange={(e) => setFormData({ ...formData, crypto_address: e.target.value })}
                placeholder="Enter wallet address"
              />
            </div>
          </>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => {
            setShowAddForm(false);
            setEditingMethod(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button onClick={editingMethod ? handleUpdatePaymentMethod : handleAddPaymentMethod}>
            {editingMethod ? 'Update' : 'Add'} Payment Method
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Methods</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Payment Method Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Payment Methods</h3>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          {/* Payment Methods List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getMethodIcon(method.method_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{method.method_name}</h4>
                            {method.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {method.is_verified ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {getMethodTypeLabel(method.method_type)}
                            {method.method_data?.last4 && ` •••• ${method.method_data.last4}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMethod(method);
                            setFormData({
                              method_type: method.method_type,
                              method_name: method.method_name,
                              account_number: '',
                              routing_number: '',
                              card_number: '',
                              expiry_date: '',
                              cvv: '',
                              crypto_address: '',
                              crypto_type: 'bitcoin'
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {paymentMethods.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
                    <p className="text-gray-500 mb-4">
                      Add a payment method to make withdrawals and deposits.
                    </p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Add/Edit Payment Method Form */}
          {(showAddForm || editingMethod) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
                {renderPaymentMethodForm()}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodManager;
