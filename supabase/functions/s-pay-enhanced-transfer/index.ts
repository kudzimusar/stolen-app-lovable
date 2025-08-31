import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferRequest {
  recipientId?: string;
  recipientIdentifier: string; // email, phone, or wallet ID
  amount: number;
  description?: string;
  paymentMethodId: string;
  fees: {
    processing: number;
    platform: number;
    total: number;
  };
  requireBlockchainRecord?: boolean;
  multiSigRequired?: boolean;
  location?: {
    lat: number;
    lng: number;
    country: string;
  };
  deviceFingerprint?: string;
}

interface BlockchainTransactionResult {
  transactionHash: string;
  blockNumber: number;
  confirmations: number;
  gasUsed: number;
  gasFee: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const transferData: TransferRequest = await req.json();

    // 1. Validate transfer request
    await validateTransferRequest(transferData, user.id, supabaseClient);

    // 2. Run fraud detection
    const fraudResult = await runFraudDetection(transferData, user.id, supabaseClient);
    
    if (fraudResult.recommendedAction === 'block') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Transaction blocked due to fraud risk',
        fraudAnalysis: fraudResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Handle multi-signature requirement
    if (transferData.multiSigRequired || fraudResult.requiresManualReview) {
      const multiSigResult = await createMultiSigTransaction(transferData, user.id, supabaseClient);
      
      return new Response(JSON.stringify({
        success: true,
        requiresMultiSig: true,
        multiSigId: multiSigResult.multiSigId,
        pendingSignatures: multiSigResult.pendingSignatures,
        fraudAnalysis: fraudResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Execute transfer
    const transferResult = await executeTransfer(transferData, user.id, supabaseClient);

    // 5. Record on blockchain if required
    let blockchainResult: BlockchainTransactionResult | null = null;
    if (transferData.requireBlockchainRecord !== false) {
      try {
        blockchainResult = await recordOnBlockchain(transferResult, supabaseClient);
      } catch (error) {
        console.error('Blockchain recording failed:', error);
        // Continue with transfer even if blockchain recording fails
      }
    }

    // 6. Send notifications
    await sendTransferNotifications(transferResult, blockchainResult, supabaseClient);

    return new Response(JSON.stringify({
      success: true,
      transfer: transferResult,
      blockchain: blockchainResult,
      fraudAnalysis: fraudResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Enhanced transfer error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function validateTransferRequest(
  transferData: TransferRequest, 
  userId: string, 
  supabase: any
): Promise<void> {
  // Validate amount
  if (!transferData.amount || transferData.amount <= 0) {
    throw new Error('Invalid transfer amount');
  }

  // Validate payment method exists and belongs to user
  const { data: paymentMethod, error: pmError } = await supabase
    .from('user_payment_methods')
    .select('*')
    .eq('id', transferData.paymentMethodId)
    .eq('user_id', userId)
    .single();

  if (pmError || !paymentMethod) {
    throw new Error('Invalid payment method');
  }

  // Validate recipient
  if (!transferData.recipientId && !transferData.recipientIdentifier) {
    throw new Error('Recipient information required');
  }

  // Check transaction limits
  await checkTransactionLimits(userId, transferData.amount, supabase);

  // Validate wallet balance if using wallet payment method
  if (paymentMethod.method_type === 'wallet') {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('available_balance')
      .eq('user_id', userId)
      .single();

    const totalAmount = transferData.amount + transferData.fees.total;
    if (!wallet || wallet.available_balance < totalAmount) {
      throw new Error('Insufficient wallet balance');
    }
  }
}

async function checkTransactionLimits(
  userId: string, 
  amount: number, 
  supabase: any
): Promise<void> {
  // Get user limits
  const { data: limits } = await supabase
    .from('transaction_limits')
    .select('*')
    .eq('user_id', userId);

  if (!limits || limits.length === 0) {
    // Create default limits if none exist
    await supabase
      .from('transaction_limits')
      .insert([
        {
          user_id: userId,
          limit_type: 'daily',
          current_amount: 0,
          limit_amount: 15000,
          reset_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          limit_type: 'monthly',
          current_amount: 0,
          limit_amount: 100000,
          reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          limit_type: 'single_transaction',
          current_amount: 0,
          limit_amount: 50000,
          reset_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    return; // New user, limits are fine
  }

  // Check each limit
  for (const limit of limits) {
    // Reset limit if expired
    if (new Date(limit.reset_date) < new Date()) {
      const resetDate = limit.limit_type === 'daily' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
        : limit.limit_type === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await supabase
        .from('transaction_limits')
        .update({
          current_amount: 0,
          reset_date: resetDate.toISOString()
        })
        .eq('id', limit.id);

      limit.current_amount = 0;
    }

    // Check if adding this amount would exceed limit
    if (limit.current_amount + amount > limit.limit_amount) {
      throw new Error(`${limit.limit_type} transaction limit exceeded`);
    }
  }
}

async function runFraudDetection(
  transferData: TransferRequest, 
  userId: string, 
  supabase: any
): Promise<any> {
  console.log('Running fraud detection for transfer:', { userId, amount: transferData.amount });

  let riskScore = 0;
  const triggers: string[] = [];

  // 1. Amount-based risk assessment
  if (transferData.amount > 10000) {
    riskScore += 30;
    triggers.push('High amount transaction');
  }
  if (transferData.amount > 50000) {
    riskScore += 50;
    triggers.push('Very high amount transaction');
  }

  // 2. User behavior analysis
  const { data: userStats } = await supabase
    .from('transactions')
    .select('amount')
    .eq('from_user_id', userId);

  const transactionCount = userStats?.length || 0;
  const averageAmount = transactionCount > 0 
    ? userStats.reduce((sum: number, tx: any) => sum + tx.amount, 0) / transactionCount
    : 0;

  if (transactionCount < 5) {
    riskScore += 15;
    triggers.push('New user with limited transaction history');
  }

  if (averageAmount > 0 && transferData.amount > averageAmount * 10) {
    riskScore += 25;
    triggers.push('Amount significantly higher than user average');
  }

  // 3. Time-based risk assessment
  const currentHour = new Date().getHours();
  if (currentHour < 6 || currentHour > 23) {
    riskScore += 15;
    triggers.push('Transaction during unusual hours');
  }

  // 4. Velocity checks
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentTxs } = await supabase
    .from('transactions')
    .select('amount')
    .eq('from_user_id', userId)
    .gte('created_at', oneDayAgo);

  const recentAmount = recentTxs?.reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0;
  if (recentAmount + transferData.amount > 25000) {
    riskScore += 40;
    triggers.push('High transaction velocity (24h limit exceeded)');
  }

  // 5. Geographic risk assessment
  if (transferData.location) {
    const suspiciousCountries = ['XXX', 'YYY']; // Configure based on business rules
    if (suspiciousCountries.includes(transferData.location.country)) {
      riskScore += 35;
      triggers.push('Transaction from high-risk country');
    }
  }

  // Determine risk level and action
  let riskLevel: string;
  let recommendedAction: string;
  let requiresManualReview = false;

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
  }

  // Store fraud analysis
  await supabase
    .from('fraud_analysis_logs')
    .insert({
      user_id: userId,
      transaction_data: transferData,
      risk_score: riskScore,
      risk_level: riskLevel,
      triggers: triggers,
      recommended_action: recommendedAction,
      requires_manual_review: requiresManualReview
    });

  return {
    riskScore,
    riskLevel,
    triggers,
    recommendedAction,
    requiresManualReview
  };
}

async function createMultiSigTransaction(
  transferData: TransferRequest, 
  userId: string, 
  supabase: any
): Promise<any> {
  const multiSigId = `multisig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get user's security configuration
  const { data: securityConfig } = await supabase
    .from('wallet_security_configs')
    .select('*')
    .eq('user_id', userId)
    .single();

  const requiredSignatures = securityConfig?.required_signatures || 2;
  const signers = securityConfig?.signers || [userId];

  await supabase
    .from('multisig_transactions')
    .insert({
      multisig_id: multiSigId,
      user_id: userId,
      transaction_data: transferData,
      required_signatures: requiredSignatures,
      current_signatures: 0,
      signers: signers,
      pending_signers: signers,
      status: 'pending_signatures',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  return {
    multiSigId,
    pendingSignatures: signers
  };
}

async function executeTransfer(
  transferData: TransferRequest, 
  userId: string, 
  supabase: any
): Promise<any> {
  const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Resolve recipient
  let recipientId = transferData.recipientId;
  if (!recipientId) {
    const recipient = await resolveRecipient(transferData.recipientIdentifier, supabase);
    recipientId = recipient?.id;
  }

  // Create transaction record
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      id: transferId,
      from_user_id: userId,
      to_user_id: recipientId,
      amount: transferData.amount,
      currency: 'ZAR',
      transaction_type: 'transfer',
      status: 'pending',
      description: transferData.description,
      fees: transferData.fees,
      payment_method_id: transferData.paymentMethodId,
      metadata: {
        location: transferData.location,
        deviceFingerprint: transferData.deviceFingerprint
      }
    })
    .select()
    .single();

  if (txError) {
    throw new Error('Failed to create transaction record');
  }

  // Process payment based on payment method
  await processPayment(transaction, transferData, supabase);

  // Update transaction limits
  await updateTransactionLimits(userId, transferData.amount, supabase);

  // Update transaction status
  await supabase
    .from('transactions')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', transferId);

  return {
    ...transaction,
    status: 'completed'
  };
}

async function resolveRecipient(identifier: string, supabase: any): Promise<any> {
  // Try to find user by email
  if (identifier.includes('@')) {
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', identifier)
      .single();
    
    return user;
  }

  // Try to find user by phone
  if (identifier.startsWith('+')) {
    const { data: user } = await supabase
      .from('users')
      .select('id, phone')
      .eq('phone', identifier)
      .single();
    
    return user;
  }

  // Try to find by wallet ID
  const { data: wallet } = await supabase
    .from('wallets')
    .select('user_id, users(id, email)')
    .eq('id', identifier)
    .single();

  return wallet?.users;
}

async function processPayment(
  transaction: any, 
  transferData: TransferRequest, 
  supabase: any
): Promise<void> {
  const { data: paymentMethod } = await supabase
    .from('user_payment_methods')
    .select('*')
    .eq('id', transferData.paymentMethodId)
    .single();

  if (paymentMethod.method_type === 'wallet') {
    // Process wallet-to-wallet transfer
    await processWalletTransfer(transaction, transferData, supabase);
  } else if (paymentMethod.method_type === 'stripe') {
    // Process Stripe payment
    await processStripePayment(transaction, transferData, paymentMethod, supabase);
  } else if (paymentMethod.method_type === 'bank') {
    // Process bank transfer
    await processBankTransfer(transaction, transferData, paymentMethod, supabase);
  }
}

async function processWalletTransfer(
  transaction: any, 
  transferData: TransferRequest, 
  supabase: any
): Promise<void> {
  const totalAmount = transferData.amount + transferData.fees.total;

  // Update sender wallet
  await supabase
    .from('wallets')
    .update({
      available_balance: supabase.sql`available_balance - ${totalAmount}`
    })
    .eq('user_id', transaction.from_user_id);

  // Update recipient wallet (if exists)
  if (transaction.to_user_id) {
    await supabase
      .from('wallets')
      .update({
        available_balance: supabase.sql`available_balance + ${transferData.amount}`
      })
      .eq('user_id', transaction.to_user_id);
  }
}

async function processStripePayment(
  transaction: any, 
  transferData: TransferRequest, 
  paymentMethod: any, 
  supabase: any
): Promise<void> {
  // Integration with Stripe API would go here
  console.log('Processing Stripe payment:', { transaction, paymentMethod });
  
  // For now, just log the payment
  await supabase
    .from('payment_processing_logs')
    .insert({
      transaction_id: transaction.id,
      payment_method_type: 'stripe',
      amount: transferData.amount,
      fees: transferData.fees,
      status: 'completed',
      external_reference: `stripe_${Date.now()}`
    });
}

async function processBankTransfer(
  transaction: any, 
  transferData: TransferRequest, 
  paymentMethod: any, 
  supabase: any
): Promise<void> {
  // Integration with banking APIs would go here
  console.log('Processing bank transfer:', { transaction, paymentMethod });
  
  // For now, just log the payment
  await supabase
    .from('payment_processing_logs')
    .insert({
      transaction_id: transaction.id,
      payment_method_type: 'bank',
      amount: transferData.amount,
      fees: transferData.fees,
      status: 'pending', // Bank transfers typically take time
      external_reference: `bank_${Date.now()}`
    });
}

async function updateTransactionLimits(
  userId: string, 
  amount: number, 
  supabase: any
): Promise<void> {
  // Update all relevant limits
  await supabase
    .from('transaction_limits')
    .update({
      current_amount: supabase.sql`current_amount + ${amount}`
    })
    .eq('user_id', userId);
}

async function recordOnBlockchain(
  transaction: any, 
  supabase: any
): Promise<BlockchainTransactionResult> {
  // Generate blockchain transaction hash
  const transactionHash = generateTransactionHash(transaction);
  
  // Mock blockchain recording for demo
  const blockchainResult = {
    transactionHash,
    blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
    confirmations: 0,
    gasUsed: 21000 + Math.floor(Math.random() * 50000),
    gasFee: parseFloat((Math.random() * 0.01).toFixed(6))
  };

  // Store blockchain transaction
  await supabase
    .from('blockchain_transactions')
    .insert({
      transaction_id: transaction.id,
      transaction_hash: transactionHash,
      block_number: blockchainResult.blockNumber,
      confirmations: blockchainResult.confirmations,
      gas_used: blockchainResult.gasUsed,
      gas_fee: blockchainResult.gasFee,
      status: 'pending',
      network: 'polygon'
    });

  return blockchainResult;
}

async function sendTransferNotifications(
  transaction: any, 
  blockchainResult: BlockchainTransactionResult | null, 
  supabase: any
): Promise<void> {
  // Send notification to sender
  await supabase
    .from('notifications')
    .insert({
      user_id: transaction.from_user_id,
      type: 'transfer_sent',
      title: 'Transfer Sent',
      message: `Your transfer of R${transaction.amount} has been processed successfully.`,
      data: {
        transactionId: transaction.id,
        blockchainHash: blockchainResult?.transactionHash
      }
    });

  // Send notification to recipient (if exists)
  if (transaction.to_user_id) {
    await supabase
      .from('notifications')
      .insert({
        user_id: transaction.to_user_id,
        type: 'transfer_received',
        title: 'Transfer Received',
        message: `You have received R${transaction.amount}.`,
        data: {
          transactionId: transaction.id,
          blockchainHash: blockchainResult?.transactionHash
        }
      });
  }
}

function generateTransactionHash(transaction: any): string {
  const data = JSON.stringify({
    ...transaction,
    timestamp: Date.now(),
    nonce: Math.random()
  });
  
  // Simple hash generation for demo
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}
