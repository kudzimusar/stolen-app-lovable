import { supabase } from "@/integrations/supabase/client";

export interface BlockchainTransaction {
  id: string;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  blockNumber?: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasFee?: number;
  timestamp: string;
  metadata?: any;
}

export interface WalletSecurityConfig {
  multiSigRequired: boolean;
  requiredSignatures: number;
  signers: string[];
  dailyLimit: number;
  monthlyLimit: number;
  requireHardwareAuth: boolean;
  allowedCountries: string[];
  blockSuspiciousIPs: boolean;
}

export interface FraudDetectionResult {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  blockedReason?: string;
  requiresManualReview: boolean;
  recommendedAction: 'approve' | 'review' | 'block';
}

export class BlockchainWalletService {
  private apiKey: string;
  private networkRPC: string;
  private contractAddress: string;

  constructor() {
    this.apiKey = process.env.VITE_BLOCKCHAIN_API_KEY || 'demo_key';
    this.networkRPC = process.env.VITE_BLOCKCHAIN_RPC || 'https://polygon-rpc.com';
    this.contractAddress = process.env.VITE_SPAY_CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b8D9b9Fg2Ca1eB0e';
  }

  /**
   * Record transaction on blockchain for immutable audit trail
   */
  async recordTransactionOnBlockchain(transaction: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    currency: string;
    type: string;
    description?: string;
  }): Promise<BlockchainTransaction> {
    try {
      console.log('Recording transaction on blockchain:', transaction);

      // 1. Generate transaction hash
      const transactionHash = this.generateTransactionHash(transaction);
      
      // 2. Submit to blockchain network
      const blockchainResponse = await this.submitToBlockchain({
        ...transaction,
        hash: transactionHash,
        timestamp: new Date().toISOString()
      });

      // 3. Store in Supabase for quick access
      const { data: dbTransaction, error } = await supabase
        .from('blockchain_transactions')
        .insert({
          transaction_hash: transactionHash,
          from_user_id: transaction.fromUserId,
          to_user_id: transaction.toUserId,
          amount: transaction.amount,
          currency: transaction.currency,
          transaction_type: transaction.type,
          description: transaction.description,
          block_number: blockchainResponse.blockNumber,
          status: 'pending',
          confirmations: 0,
          gas_used: blockchainResponse.gasUsed,
          gas_fee: blockchainResponse.gasFee,
          metadata: blockchainResponse.metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing blockchain transaction:', error);
        throw new Error('Failed to store blockchain transaction');
      }

      return {
        id: dbTransaction.id,
        transactionHash,
        fromAddress: blockchainResponse.fromAddress,
        toAddress: blockchainResponse.toAddress,
        amount: transaction.amount,
        currency: transaction.currency,
        blockNumber: blockchainResponse.blockNumber,
        confirmations: 0,
        status: 'pending',
        gasUsed: blockchainResponse.gasUsed,
        gasFee: blockchainResponse.gasFee,
        timestamp: new Date().toISOString(),
        metadata: blockchainResponse.metadata
      };
    } catch (error) {
      console.error('Error recording blockchain transaction:', error);
      throw new Error('Failed to record transaction on blockchain');
    }
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyBlockchainTransaction(transactionHash: string): Promise<BlockchainTransaction | null> {
    try {
      // 1. Check local database first
      const { data: localTx, error } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .eq('transaction_hash', transactionHash)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching local transaction:', error);
      }

      // 2. Verify on blockchain network
      const blockchainData = await this.queryBlockchain(transactionHash);
      
      if (!blockchainData) {
        return null;
      }

      // 3. Update local record with latest blockchain data
      if (localTx) {
        const { data: updatedTx } = await supabase
          .from('blockchain_transactions')
          .update({
            confirmations: blockchainData.confirmations,
            status: blockchainData.confirmations >= 12 ? 'confirmed' : 'pending',
            block_number: blockchainData.blockNumber
          })
          .eq('transaction_hash', transactionHash)
          .select()
          .single();

        if (updatedTx) {
          return {
            id: updatedTx.id,
            transactionHash: updatedTx.transaction_hash,
            fromAddress: blockchainData.from,
            toAddress: blockchainData.to,
            amount: updatedTx.amount,
            currency: updatedTx.currency,
            blockNumber: blockchainData.blockNumber,
            confirmations: blockchainData.confirmations,
            status: blockchainData.confirmations >= 12 ? 'confirmed' : 'pending',
            gasUsed: updatedTx.gas_used,
            gasFee: updatedTx.gas_fee,
            timestamp: updatedTx.created_at,
            metadata: updatedTx.metadata
          };
        }
      }

      return {
        id: '',
        transactionHash,
        fromAddress: blockchainData.from,
        toAddress: blockchainData.to,
        amount: blockchainData.value,
        currency: 'MATIC',
        blockNumber: blockchainData.blockNumber,
        confirmations: blockchainData.confirmations,
        status: blockchainData.confirmations >= 12 ? 'confirmed' : 'pending',
        timestamp: new Date(blockchainData.timestamp * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error verifying blockchain transaction:', error);
      return null;
    }
  }

  /**
   * Multi-signature transaction creation
   */
  async createMultiSigTransaction(
    transaction: any,
    signers: string[],
    requiredSignatures: number
  ): Promise<{ multiSigId: string; pendingSignatures: string[] }> {
    try {
      const multiSigId = `multisig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store multi-sig transaction
      const { data, error } = await supabase
        .from('multisig_transactions')
        .insert({
          multisig_id: multiSigId,
          transaction_data: transaction,
          required_signatures: requiredSignatures,
          current_signatures: 0,
          signers: signers,
          pending_signers: signers,
          status: 'pending_signatures',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating multi-sig transaction:', error);
        throw new Error('Failed to create multi-sig transaction');
      }

      return {
        multiSigId,
        pendingSignatures: signers
      };
    } catch (error) {
      console.error('Error creating multi-sig transaction:', error);
      throw new Error('Failed to create multi-sig transaction');
    }
  }

  /**
   * Sign multi-signature transaction
   */
  async signMultiSigTransaction(
    multiSigId: string,
    signerUserId: string,
    signature: string
  ): Promise<{ completed: boolean; executionResult?: any }> {
    try {
      // Get current multi-sig transaction
      const { data: multiSigTx, error: fetchError } = await supabase
        .from('multisig_transactions')
        .select('*')
        .eq('multisig_id', multiSigId)
        .single();

      if (fetchError || !multiSigTx) {
        throw new Error('Multi-sig transaction not found');
      }

      if (multiSigTx.status !== 'pending_signatures') {
        throw new Error('Multi-sig transaction is not pending signatures');
      }

      // Verify signer is authorized
      if (!multiSigTx.signers.includes(signerUserId)) {
        throw new Error('Unauthorized signer');
      }

      // Check if already signed
      if (!multiSigTx.pending_signers.includes(signerUserId)) {
        throw new Error('Already signed by this user');
      }

      // Add signature
      const newSignatures = multiSigTx.current_signatures + 1;
      const newPendingSigners = multiSigTx.pending_signers.filter((id: string) => id !== signerUserId);

      // Store signature
      await supabase
        .from('multisig_signatures')
        .insert({
          multisig_id: multiSigId,
          signer_user_id: signerUserId,
          signature: signature,
          signed_at: new Date().toISOString()
        });

      // Update multi-sig transaction
      const updateData: any = {
        current_signatures: newSignatures,
        pending_signers: newPendingSigners
      };

      // Check if we have enough signatures
      if (newSignatures >= multiSigTx.required_signatures) {
        updateData.status = 'ready_for_execution';
        
        // Execute the transaction
        const executionResult = await this.executeMultiSigTransaction(multiSigTx.transaction_data);
        updateData.status = executionResult.success ? 'executed' : 'execution_failed';
        updateData.execution_result = executionResult;
        updateData.executed_at = new Date().toISOString();

        await supabase
          .from('multisig_transactions')
          .update(updateData)
          .eq('multisig_id', multiSigId);

        return {
          completed: true,
          executionResult
        };
      } else {
        await supabase
          .from('multisig_transactions')
          .update(updateData)
          .eq('multisig_id', multiSigId);

        return {
          completed: false
        };
      }
    } catch (error) {
      console.error('Error signing multi-sig transaction:', error);
      throw new Error('Failed to sign multi-sig transaction');
    }
  }

  /**
   * Advanced fraud detection using AI and pattern analysis
   */
  async detectFraud(transaction: {
    userId: string;
    amount: number;
    recipientId?: string;
    paymentMethodId: string;
    location?: { lat: number; lng: number; country: string };
    deviceFingerprint?: string;
  }): Promise<FraudDetectionResult> {
    try {
      console.log('Running fraud detection for transaction:', transaction);

      let riskScore = 0;
      const triggers: string[] = [];

      // 1. Amount-based risk assessment
      if (transaction.amount > 10000) {
        riskScore += 30;
        triggers.push('High amount transaction');
      }
      if (transaction.amount > 50000) {
        riskScore += 50;
        triggers.push('Very high amount transaction');
      }

      // 2. User behavior analysis
      const userStats = await this.getUserTransactionStats(transaction.userId);
      
      if (transaction.amount > userStats.averageTransaction * 10) {
        riskScore += 25;
        triggers.push('Amount significantly higher than user average');
      }

      if (userStats.transactionCount < 5) {
        riskScore += 15;
        triggers.push('New user with limited transaction history');
      }

      // 3. Velocity checks
      const recentTransactions = await this.getRecentTransactions(transaction.userId, 24); // Last 24 hours
      const totalRecentAmount = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      if (totalRecentAmount + transaction.amount > 25000) {
        riskScore += 40;
        triggers.push('High transaction velocity (24h limit exceeded)');
      }

      if (recentTransactions.length > 10) {
        riskScore += 20;
        triggers.push('High transaction frequency');
      }

      // 4. Geographic risk assessment
      if (transaction.location) {
        const suspiciousCountries = ['XXX', 'YYY']; // Mock suspicious countries
        if (suspiciousCountries.includes(transaction.location.country)) {
          riskScore += 35;
          triggers.push('Transaction from high-risk country');
        }

        // Check for unusual location
        const userLocations = await this.getUserRecentLocations(transaction.userId);
        if (userLocations.length > 0) {
          const distanceKm = this.calculateDistance(
            userLocations[0],
            transaction.location
          );
          
          if (distanceKm > 1000) {
            riskScore += 25;
            triggers.push('Transaction from unusual location');
          }
        }
      }

      // 5. Device fingerprint analysis
      if (transaction.deviceFingerprint) {
        const knownDevices = await this.getUserKnownDevices(transaction.userId);
        if (!knownDevices.includes(transaction.deviceFingerprint)) {
          riskScore += 20;
          triggers.push('Transaction from unknown device');
        }
      }

      // 6. Time-based risk assessment
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 23) {
        riskScore += 15;
        triggers.push('Transaction during unusual hours');
      }

      // 7. Recipient risk assessment
      if (transaction.recipientId) {
        const recipientRisk = await this.getRecipientRiskScore(transaction.recipientId);
        riskScore += recipientRisk;
        if (recipientRisk > 30) {
          triggers.push('High-risk recipient');
        }
      }

      // Determine risk level and recommended action
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      let recommendedAction: 'approve' | 'review' | 'block';
      let requiresManualReview = false;
      let blockedReason: string | undefined;

      if (riskScore <= 30) {
        riskLevel = 'low';
        recommendedAction = 'approve';
      } else if (riskScore <= 50) {
        riskLevel = 'medium';
        recommendedAction = 'review';
        requiresManualReview = true;
      } else if (riskScore <= 80) {
        riskLevel = 'high';
        recommendedAction = 'review';
        requiresManualReview = true;
      } else {
        riskLevel = 'critical';
        recommendedAction = 'block';
        requiresManualReview = true;
        blockedReason = 'High fraud risk detected - manual review required';
      }

      // Store fraud analysis results
      await supabase
        .from('fraud_analysis_logs')
        .insert({
          user_id: transaction.userId,
          transaction_data: transaction,
          risk_score: riskScore,
          risk_level: riskLevel,
          triggers: triggers,
          recommended_action: recommendedAction,
          blocked_reason: blockedReason,
          requires_manual_review: requiresManualReview
        });

      return {
        riskScore,
        riskLevel,
        triggers,
        blockedReason,
        requiresManualReview,
        recommendedAction
      };
    } catch (error) {
      console.error('Error in fraud detection:', error);
      // Return safe defaults on error
      return {
        riskScore: 100,
        riskLevel: 'critical',
        triggers: ['Fraud detection system error'],
        blockedReason: 'System error - manual review required',
        requiresManualReview: true,
        recommendedAction: 'block'
      };
    }
  }

  /**
   * Configure wallet security settings
   */
  async configureWalletSecurity(
    userId: string, 
    config: WalletSecurityConfig
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('wallet_security_configs')
        .upsert({
          user_id: userId,
          multi_sig_required: config.multiSigRequired,
          required_signatures: config.requiredSignatures,
          signers: config.signers,
          daily_limit: config.dailyLimit,
          monthly_limit: config.monthlyLimit,
          require_hardware_auth: config.requireHardwareAuth,
          allowed_countries: config.allowedCountries,
          block_suspicious_ips: config.blockSuspiciousIPs,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error configuring wallet security:', error);
        throw new Error('Failed to configure wallet security');
      }
    } catch (error) {
      console.error('Error configuring wallet security:', error);
      throw new Error('Failed to configure wallet security');
    }
  }

  // Private helper methods

  private generateTransactionHash(transaction: any): string {
    const data = JSON.stringify({
      ...transaction,
      timestamp: Date.now(),
      nonce: Math.random()
    });
    
    // Simple hash generation for demo - use proper crypto in production
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  private async submitToBlockchain(transaction: any): Promise<any> {
    // Mock blockchain submission for demo
    return {
      fromAddress: `0x${transaction.fromUserId.slice(-40)}`,
      toAddress: `0x${transaction.toUserId.slice(-40)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      gasUsed: 21000 + Math.floor(Math.random() * 50000),
      gasFee: (Math.random() * 0.01).toFixed(6),
      metadata: {
        network: 'polygon',
        contractAddress: this.contractAddress
      }
    };
  }

  private async queryBlockchain(transactionHash: string): Promise<any> {
    // Mock blockchain query for demo
    return {
      hash: transactionHash,
      from: `0x${Math.random().toString(36).substr(2, 40)}`,
      to: `0x${Math.random().toString(36).substr(2, 40)}`,
      value: Math.random() * 1000,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      confirmations: Math.floor(Math.random() * 20),
      timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400)
    };
  }

  private async executeMultiSigTransaction(transactionData: any): Promise<any> {
    try {
      // Execute the actual transaction
      const blockchainTx = await this.recordTransactionOnBlockchain(transactionData);
      
      return {
        success: true,
        transactionHash: blockchainTx.transactionHash,
        blockNumber: blockchainTx.blockNumber
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getUserTransactionStats(userId: string): Promise<{
    transactionCount: number;
    averageTransaction: number;
    totalVolume: number;
  }> {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('from_user_id', userId);

    if (error || !data) {
      return { transactionCount: 0, averageTransaction: 0, totalVolume: 0 };
    }

    const totalVolume = data.reduce((sum, tx) => sum + tx.amount, 0);
    const averageTransaction = data.length > 0 ? totalVolume / data.length : 0;

    return {
      transactionCount: data.length,
      averageTransaction,
      totalVolume
    };
  }

  private async getRecentTransactions(userId: string, hours: number): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('from_user_id', userId)
      .gte('created_at', cutoffTime);

    return data || [];
  }

  private async getUserRecentLocations(userId: string): Promise<any[]> {
    // Mock user locations for demo
    return [
      { lat: -26.2041, lng: 28.0473, country: 'ZA' } // Johannesburg
    ];
  }

  private async getUserKnownDevices(userId: string): Promise<string[]> {
    // Mock known devices for demo
    return ['device_fingerprint_1', 'device_fingerprint_2'];
  }

  private async getRecipientRiskScore(recipientId: string): Promise<number> {
    // Mock recipient risk score for demo
    return Math.floor(Math.random() * 50);
  }

  private calculateDistance(point1: any, point2: any): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const blockchainWalletService = new BlockchainWalletService();
