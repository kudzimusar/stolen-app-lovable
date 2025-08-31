import { supabase } from '@/integrations/supabase/client';

export interface WalletBalance {
  available: number;
  escrow: number;
  pending: number;
  rewards: number;
  total: number;
  currency: string;
  lastUpdated: string;
}

export interface TransactionRecord {
  id: string;
  type: 'credit' | 'debit' | 'transfer' | 'escrow_hold' | 'escrow_release' | 'reward';
  amount: number;
  description: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: string;
  reference?: string;
  metadata?: any;
}

export interface BalanceUpdate {
  amount: number;
  type: 'add' | 'subtract';
  reason: string;
  category: 'available' | 'escrow' | 'pending' | 'rewards';
}

class DynamicWalletService {
  private static instance: DynamicWalletService;
  private balanceCache: Map<string, WalletBalance> = new Map();
  private transactionCache: Map<string, TransactionRecord[]> = new Map();

  static getInstance(): DynamicWalletService {
    if (!DynamicWalletService.instance) {
      DynamicWalletService.instance = new DynamicWalletService();
    }
    return DynamicWalletService.instance;
  }

  // Initialize wallet with realistic starting balance
  async initializeWallet(userId: string): Promise<WalletBalance> {
    try {
      // Try to get existing balance from database
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        const balance: WalletBalance = {
          available: data.available_balance || 0,
          escrow: data.escrow_balance || 0,
          pending: data.pending_balance || 0,
          rewards: data.reward_balance || 0,
          total: (data.available_balance || 0) + (data.escrow_balance || 0) + (data.pending_balance || 0) + (data.reward_balance || 0),
          currency: 'ZAR',
          lastUpdated: new Date().toISOString()
        };
        this.balanceCache.set(userId, balance);
        return balance;
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }

    // Fallback to dynamic mock data with variation
    const baseAmount = 800 + Math.random() * 2000; // R800-R2800 base
    const escrowAmount = Math.random() * 500; // R0-R500 in escrow
    const rewardsAmount = Math.random() * 100; // R0-R100 in rewards
    
    const balance: WalletBalance = {
      available: Math.round(baseAmount * 100) / 100,
      escrow: Math.round(escrowAmount * 100) / 100,
      pending: 0,
      rewards: Math.round(rewardsAmount * 100) / 100,
      total: Math.round((baseAmount + escrowAmount + rewardsAmount) * 100) / 100,
      currency: 'ZAR',
      lastUpdated: new Date().toISOString()
    };

    this.balanceCache.set(userId, balance);
    return balance;
  }

  // Update balance dynamically
  async updateBalance(userId: string, update: BalanceUpdate): Promise<WalletBalance> {
    const currentBalance = this.balanceCache.get(userId) || await this.initializeWallet(userId);
    
    const newBalance = { ...currentBalance };
    
    // Apply the update
    if (update.type === 'add') {
      newBalance[update.category] += update.amount;
    } else {
      newBalance[update.category] = Math.max(0, newBalance[update.category] - update.amount);
    }
    
    // Recalculate total
    newBalance.total = newBalance.available + newBalance.escrow + newBalance.pending + newBalance.rewards;
    newBalance.lastUpdated = new Date().toISOString();
    
    // Update cache
    this.balanceCache.set(userId, newBalance);
    
    // Create transaction record
    const transaction: TransactionRecord = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: update.type === 'add' ? 'credit' : 'debit',
      amount: update.amount,
      description: update.reason,
      currency: 'ZAR',
      status: 'completed',
      timestamp: new Date().toISOString(),
      reference: `${update.category}_${update.type}`,
      metadata: { category: update.category, originalReason: update.reason }
    };
    
    // Add to transaction history
    const transactions = this.transactionCache.get(userId) || [];
    transactions.unshift(transaction); // Add to beginning
    this.transactionCache.set(userId, transactions.slice(0, 50)); // Keep last 50 transactions
    
    // Try to persist to database
    try {
      await supabase
        .from('wallets')
        .upsert({
          user_id: userId,
          available_balance: newBalance.available,
          escrow_balance: newBalance.escrow,
          pending_balance: newBalance.pending,
          reward_balance: newBalance.rewards,
          last_updated: newBalance.lastUpdated
        });
    } catch (error) {
      console.error('Error persisting wallet balance:', error);
    }
    
    return newBalance;
  }

  // Simulate a successful transaction (for testing)
  async simulateTransaction(userId: string, type: 'purchase' | 'sale' | 'funding' | 'withdrawal', amount: number): Promise<{ balance: WalletBalance; transaction: TransactionRecord }> {
    let update: BalanceUpdate;
    
    switch (type) {
      case 'funding':
        update = {
          amount,
          type: 'add',
          reason: 'Wallet funding via card payment',
          category: 'available'
        };
        break;
      case 'purchase':
        update = {
          amount,
          type: 'subtract',
          reason: 'Marketplace purchase - funds held in escrow',
          category: 'available'
        };
        // Also add to escrow
        await this.updateBalance(userId, {
          amount,
          type: 'add',
          reason: 'Purchase funds held in escrow',
          category: 'escrow'
        });
        break;
      case 'sale':
        update = {
          amount,
          type: 'add',
          reason: 'Sale proceeds from marketplace',
          category: 'available'
        };
        break;
      case 'withdrawal':
        update = {
          amount,
          type: 'subtract',
          reason: 'Withdrawal to bank account',
          category: 'available'
        };
        break;
    }
    
    const newBalance = await this.updateBalance(userId, update);
    const transactions = this.transactionCache.get(userId) || [];
    const latestTransaction = transactions[0];
    
    return { balance: newBalance, transaction: latestTransaction };
  }

  // Get current balance
  async getBalance(userId: string): Promise<WalletBalance> {
    const cached = this.balanceCache.get(userId);
    if (cached) {
      return cached;
    }
    return await this.initializeWallet(userId);
  }

  // Get transaction history
  getTransactionHistory(userId: string): TransactionRecord[] {
    return this.transactionCache.get(userId) || [];
  }

  // Add sample transactions for realistic testing
  async addSampleTransactions(userId: string): Promise<void> {
    const sampleTransactions: Omit<TransactionRecord, 'id' | 'timestamp'>[] = [
      {
        type: 'credit',
        amount: 500.00,
        description: 'Wallet funding via FNB account',
        currency: 'ZAR',
        status: 'completed',
        reference: 'funding_fnb'
      },
      {
        type: 'debit',
        amount: 299.99,
        description: 'Purchase: iPhone 14 Pro case',
        currency: 'ZAR',
        status: 'completed',
        reference: 'purchase_iphone_case'
      },
      {
        type: 'credit',
        amount: 50.00,
        description: 'Device recovery reward',
        currency: 'ZAR',
        status: 'completed',
        reference: 'reward_recovery'
      },
      {
        type: 'debit',
        amount: 150.00,
        description: 'Transfer to John Doe',
        currency: 'ZAR',
        status: 'completed',
        reference: 'transfer_john'
      }
    ];

    const transactions = sampleTransactions.map(txn => ({
      ...txn,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random time in last week
    }));

    this.transactionCache.set(userId, transactions);
  }

  // Clear cache (useful for testing)
  clearCache(userId?: string): void {
    if (userId) {
      this.balanceCache.delete(userId);
      this.transactionCache.delete(userId);
    } else {
      this.balanceCache.clear();
      this.transactionCache.clear();
    }
  }

  // Simulate real-time balance updates (for WebSocket integration)
  onBalanceUpdate(userId: string, callback: (balance: WalletBalance) => void): () => void {
    const interval = setInterval(async () => {
      // Simulate small random fluctuations (rewards, micro-transactions)
      if (Math.random() < 0.1) { // 10% chance every check
        const randomReward = Math.random() * 5; // R0-R5 random reward
        await this.updateBalance(userId, {
          amount: randomReward,
          type: 'add',
          reason: 'Micro-reward from platform activity',
          category: 'rewards'
        });
        
        const updatedBalance = await this.getBalance(userId);
        callback(updatedBalance);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }
}

export const dynamicWalletService = DynamicWalletService.getInstance();
