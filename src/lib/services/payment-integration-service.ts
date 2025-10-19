// @ts-nocheck
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Stripe configuration for testing
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QqEWaAwwOABFtJ3YLEKOIe8Z9FN9l3z3Q3X5Q6jQQ8gQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ';
const stripePromise = loadStripe(stripePublishableKey);

export interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal' | 's-pay';
  name: string;
  description: string;
  icon: string;
  available: boolean;
  testMode: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  clientSecret?: string;
  metadata: {
    listingId: string;
    sellerId: string;
    buyerId: string;
    deviceId: string;
  };
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
  lastUpdated: Date;
}

export interface EscrowTransaction {
  id: string;
  paymentIntentId: string;
  amount: number;
  status: 'held' | 'released' | 'refunded';
  releaseConditions: string[];
  createdAt: Date;
  expectedReleaseDate: Date;
}

export class PaymentIntegrationService {
  private static instance: PaymentIntegrationService;
  
  public static getInstance(): PaymentIntegrationService {
    if (!PaymentIntegrationService.instance) {
      PaymentIntegrationService.instance = new PaymentIntegrationService();
    }
    return PaymentIntegrationService.instance;
  }

  // Get available payment methods
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    return [
      {
        id: 'stripe',
        type: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        icon: '💳',
        available: true,
        testMode: true
      },
      {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        icon: '🔵',
        available: true,
        testMode: true
      },
      {
        id: 's-pay',
        type: 's-pay',
        name: 'S-Pay Wallet',
        description: 'Use your STOLEN wallet balance',
        icon: '🏦',
        available: true,
        testMode: false
      }
    ];
  }

  // Create payment intent with escrow
  async createPaymentIntent(
    amount: number,
    currency: string,
    paymentMethodId: string,
    metadata: {
      listingId: string;
      sellerId: string;
      buyerId: string;
      deviceId: string;
    }
  ): Promise<PaymentIntent> {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount,
          currency,
          paymentMethodId,
          metadata,
          escrow: true
        }
      });

      if (error) throw error;

      return {
        id: data.id,
        amount,
        currency,
        paymentMethod: await this.getPaymentMethodById(paymentMethodId),
        status: 'pending',
        clientSecret: data.client_secret,
        metadata
      };
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Process Stripe payment
  async processStripePayment(
    paymentIntentId: string,
    clientSecret: string,
    paymentMethodData: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodData
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Update payment status in our database
      await this.updatePaymentStatus(paymentIntentId, 'succeeded');

      return { success: true };
    } catch (error) {
      console.error('Stripe payment failed:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Process PayPal payment
  async processPayPalPayment(
    paymentIntentId: string,
    amount: number,
    currency: string
  ): Promise<{ success: boolean; error?: string; approvalUrl?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('process-paypal-payment', {
        body: {
          paymentIntentId,
          amount,
          currency
        }
      });

      if (error) throw error;

      return {
        success: true,
        approvalUrl: data.approvalUrl
      };
    } catch (error) {
      console.error('PayPal payment failed:', error);
      return { success: false, error: 'PayPal payment failed' };
    }
  }

  // Process S-Pay wallet payment
  async processSPayPayment(
    paymentIntentId: string,
    amount: number,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const balance = await this.getWalletBalance(userId);
      
      if (balance.available < amount) {
        return { success: false, error: 'Insufficient wallet balance' };
      }

      const { data, error } = await supabase.functions.invoke('process-spay-payment', {
        body: {
          paymentIntentId,
          amount,
          userId
        }
      });

      if (error) throw error;

      await this.updatePaymentStatus(paymentIntentId, 'succeeded');
      return { success: true };
    } catch (error) {
      console.error('S-Pay payment failed:', error);
      return { success: false, error: 'S-Pay payment failed' };
    }
  }

  // Get wallet balance
  async getWalletBalance(userId: string): Promise<WalletBalance> {
    try {
      const { data, error } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        available: data?.available_balance || 0,
        pending: data?.pending_balance || 0,
        currency: data?.currency || 'ZAR',
        lastUpdated: new Date(data?.updated_at || Date.now())
      };
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return {
        available: 0,
        pending: 0,
        currency: 'ZAR',
        lastUpdated: new Date()
      };
    }
  }

  // Create escrow transaction
  async createEscrowTransaction(
    paymentIntentId: string,
    amount: number
  ): Promise<EscrowTransaction> {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .insert({
          payment_intent_id: paymentIntentId,
          amount,
          status: 'held',
          release_conditions: [
            'Device delivered',
            'Buyer confirmation',
            'Dispute resolution'
          ],
          expected_release_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        paymentIntentId: data.payment_intent_id,
        amount: data.amount,
        status: data.status,
        releaseConditions: data.release_conditions,
        createdAt: new Date(data.created_at),
        expectedReleaseDate: new Date(data.expected_release_date)
      };
    } catch (error) {
      console.error('Failed to create escrow transaction:', error);
      throw new Error('Failed to create escrow transaction');
    }
  }

  // Release escrow funds
  async releaseEscrowFunds(
    escrowId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('release-escrow-funds', {
        body: {
          escrowId,
          reason
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to release escrow funds:', error);
      return { success: false, error: 'Failed to release escrow funds' };
    }
  }

  // Add funds to wallet (for testing)
  async addFundsToWallet(
    userId: string,
    amount: number,
    source: 'stripe' | 'paypal' | 'bank_transfer'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('add-wallet-funds', {
        body: {
          userId,
          amount,
          source
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to add funds to wallet:', error);
      return { success: false, error: 'Failed to add funds to wallet' };
    }
  }

  // Private helper methods
  private async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    const methods = await this.getAvailablePaymentMethods();
    return methods.find(m => m.id === id) || methods[0];
  }

  private async updatePaymentStatus(
    paymentIntentId: string,
    status: PaymentIntent['status']
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_intents')
        .update({ status })
        .eq('id', paymentIntentId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  }

  // Calculate fees and total
  calculatePaymentFees(amount: number, paymentMethod: PaymentMethod): {
    subtotal: number;
    platformFee: number;
    paymentFee: number;
    total: number;
  } {
    const platformFeeRate = 0.035; // 3.5% platform fee
    let paymentFeeRate = 0;

    switch (paymentMethod.type) {
      case 'stripe':
        paymentFeeRate = 0.029; // 2.9% + 30c
        break;
      case 'paypal':
        paymentFeeRate = 0.034; // 3.4%
        break;
      case 's-pay':
        paymentFeeRate = 0; // No additional fee for wallet
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
}

export const paymentService = PaymentIntegrationService.getInstance();
