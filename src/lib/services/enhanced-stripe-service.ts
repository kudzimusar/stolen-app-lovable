import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Enhanced Stripe configuration for S-Pay integration
const stripeConfig = {
  // Test keys for development - replace with production keys for live environment
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QqEWaAwwOABFtJ3YLEKOIe8Z9FN9l3z3Q3X5Q6jQQ8gQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ',
  secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_51QqEWaAwwOABFtJ3YLEKOIe8Z9FN9l3z3Q3X5Q6jQQ8gQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ',
  currency: 'zar', // South African Rand
  testMode: true,
  apiVersion: '2023-10-16' as const
};

// Initialize Stripe
const stripePromise = loadStripe(stripeConfig.publishableKey);

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  metadata: Record<string, string>;
  created: number;
  payment_method?: any;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  metadata: Record<string, string>;
}

export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name: string;
    email: string;
    address: any;
  };
}

export interface SPay {
  userId: string;
  walletBalance: number;
  escrowBalance: number;
  dailyLimit: number;
  monthlyLimit: number;
  isVerified: boolean;
}

export class EnhancedStripeService {
  private static instance: EnhancedStripeService;
  private stripe: any = null;

  public static getInstance(): EnhancedStripeService {
    if (!EnhancedStripeService.instance) {
      EnhancedStripeService.instance = new EnhancedStripeService();
    }
    return EnhancedStripeService.instance;
  }

  async getStripe() {
    if (!this.stripe) {
      this.stripe = await stripePromise;
    }
    return this.stripe;
  }

  // Create customer for S-Pay wallet integration
  async createCustomer(userId: string, email: string, name: string): Promise<StripeCustomer> {
    try {
      const response = await fetch('/api/stripe/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          email,
          name,
          metadata: {
            userId,
            platform: 'stolen-s-pay',
            created_via: 'wallet'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  // Create payment intent for S-Pay wallet deposits
  async createWalletDeposit(
    amount: number, 
    customerId: string,
    paymentMethodId?: string
  ): Promise<StripePaymentIntent> {
    try {
      const response = await fetch('/api/stripe/payment-intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: stripeConfig.currency,
          customer: customerId,
          payment_method: paymentMethodId,
          confirmation_method: 'automatic',
          capture_method: 'automatic',
          setup_future_usage: 'off_session',
          metadata: {
            type: 'wallet_deposit',
            platform: 'stolen-s-pay',
            user_id: customerId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating wallet deposit:', error);
      throw error;
    }
  }

  // Create payment intent for marketplace purchases with escrow
  async createEscrowPayment(
    amount: number,
    customerId: string,
    marketplaceData: {
      listingId: string;
      sellerId: string;
      buyerId: string;
      deviceId: string;
      escrowDays?: number;
    }
  ): Promise<StripePaymentIntent> {
    try {
      const response = await fetch('/api/stripe/payment-intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: stripeConfig.currency,
          customer: customerId,
          capture_method: 'manual', // Hold funds in escrow
          confirmation_method: 'automatic',
          metadata: {
            type: 'marketplace_escrow',
            listing_id: marketplaceData.listingId,
            seller_id: marketplaceData.sellerId,
            buyer_id: marketplaceData.buyerId,
            device_id: marketplaceData.deviceId,
            escrow_days: String(marketplaceData.escrowDays || 7),
            platform: 'stolen-marketplace'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create escrow payment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating escrow payment:', error);
      throw error;
    }
  }

  // Confirm payment with S-Pay wallet integration
  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId?: string,
    useWallet?: boolean,
    walletAmount?: number
  ): Promise<{ paymentIntent: StripePaymentIntent; error?: any }> {
    try {
      const stripe = await this.getStripe();
      
      if (useWallet && walletAmount) {
        // Handle hybrid payment (partial wallet + Stripe)
        return await this.confirmHybridPayment(paymentIntentId, walletAmount, paymentMethodId);
      }

      const result = await stripe.confirmPayment({
        elements: paymentMethodId,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`
        }
      });

      if (result.error) {
        throw result.error;
      }

      return { paymentIntent: result.paymentIntent };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { paymentIntent: {} as StripePaymentIntent, error };
    }
  }

  // Handle hybrid payment (S-Pay wallet + Stripe)
  private async confirmHybridPayment(
    paymentIntentId: string,
    walletAmount: number,
    paymentMethodId?: string
  ): Promise<{ paymentIntent: StripePaymentIntent; error?: any }> {
    try {
      // First, deduct from S-Pay wallet
      const walletResponse = await this.deductFromWallet(walletAmount);
      if (!walletResponse.success) {
        throw new Error('Insufficient wallet balance');
      }

      // Then, process remaining amount via Stripe
      const stripe = await this.getStripe();
      const result = await stripe.confirmPayment({
        elements: paymentMethodId,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`
        }
      });

      if (result.error) {
        // Refund wallet deduction if Stripe payment fails
        await this.refundToWallet(walletAmount);
        throw result.error;
      }

      return { paymentIntent: result.paymentIntent };
    } catch (error) {
      console.error('Error with hybrid payment:', error);
      return { paymentIntent: {} as StripePaymentIntent, error };
    }
  }

  // Release escrow funds to seller
  async releaseEscrowFunds(paymentIntentId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/stripe/capture-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to release escrow: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error releasing escrow funds:', error);
      return false;
    }
  }

  // Refund escrow payment
  async refundEscrowPayment(paymentIntentId: string, reason?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/stripe/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          payment_intent: paymentIntentId,
          reason: reason || 'requested_by_customer',
          metadata: {
            refund_via: 'escrow_dispute',
            platform: 'stolen-marketplace'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to refund payment: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error refunding escrow payment:', error);
      return false;
    }
  }

  // S-Pay wallet integration methods
  async deductFromWallet(amount: number): Promise<{ success: boolean; newBalance?: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('s-pay-enhanced', {
        body: {
          action: 'deduct_balance',
          amount: amount
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deducting from wallet:', error);
      return { success: false };
    }
  }

  async refundToWallet(amount: number): Promise<{ success: boolean; newBalance?: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('s-pay-enhanced', {
        body: {
          action: 'add_balance',
          amount: amount,
          description: 'Refund from failed payment'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error refunding to wallet:', error);
      return { success: false };
    }
  }

  // Get saved payment methods
  async getPaymentMethods(customerId: string): Promise<StripePaymentMethod[]> {
    try {
      const response = await fetch(`/api/stripe/payment-methods?customer=${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment methods: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  // Calculate fees for different payment methods
  calculateFees(amount: number, paymentMethod: 'stripe' | 'wallet' | 'hybrid'): {
    subtotal: number;
    platformFee: number;
    paymentFee: number;
    total: number;
  } {
    const platformFeeRate = 0.035; // 3.5% platform fee
    let paymentFeeRate = 0;

    switch (paymentMethod) {
      case 'stripe':
        paymentFeeRate = 0.029; // 2.9% Stripe fee
        break;
      case 'wallet':
        paymentFeeRate = 0; // No fee for wallet payments
        break;
      case 'hybrid':
        paymentFeeRate = 0.015; // Reduced fee for hybrid payments
        break;
    }

    const platformFee = amount * platformFeeRate;
    const paymentFee = amount * paymentFeeRate;
    const total = amount + platformFee + paymentFee;

    return {
      subtotal: amount,
      platformFee,
      paymentFee,
      total
    };
  }

  // Test connection to Stripe
  async testConnection(): Promise<boolean> {
    try {
      const stripe = await this.getStripe();
      return !!stripe;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const enhancedStripeService = EnhancedStripeService.getInstance();
