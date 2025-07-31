import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { action, ...params } = await req.json();

    console.log('S-Pay action:', action, 'by user:', user.id);

    switch (action) {
      case 'initiate_transfer':
        return await handleTransferInitiation(supabaseServiceClient, params, user.id);
      
      case 'release_escrow':
        return await handleEscrowRelease(supabaseServiceClient, params, user.id);
      
      case 'handle_dispute':
        return await handleDispute(supabaseServiceClient, params, user.id);
      
      case 'process_reward':
        return await handleRewardProcessing(supabaseServiceClient, params, user.id);
      
      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in s-pay-transfer:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleTransferInitiation(supabase: any, params: any, user_id: string) {
  const { recipient_id, amount, transfer_type, listing_id, description } = params;

  // Get sender wallet
  const { data: senderWallet, error: senderError } = await supabase
    .from('wallets')
    .select('id, available_balance')
    .eq('user_id', user_id)
    .single();

  if (senderError || !senderWallet) {
    throw new Error('Sender wallet not found');
  }

  if (senderWallet.available_balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Get recipient wallet
  const { data: recipientWallet, error: recipientError } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', recipient_id)
    .single();

  if (recipientError || !recipientWallet) {
    throw new Error('Recipient wallet not found');
  }

  // For marketplace transactions, use escrow
  if (transfer_type === 'marketplace_purchase' && listing_id) {
    return await initiateEscrowTransaction(supabase, {
      sender_wallet_id: senderWallet.id,
      recipient_wallet_id: recipientWallet.id,
      amount,
      listing_id,
      description
    });
  }

  // Direct transfer
  const transaction_id = crypto.randomUUID();

  // Create transaction record
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      id: transaction_id,
      sender_wallet_id: senderWallet.id,
      recipient_wallet_id: recipientWallet.id,
      amount,
      transaction_type: transfer_type,
      description,
      status: 'completed',
      transaction_date: new Date().toISOString()
    });

  if (transactionError) {
    throw new Error('Failed to create transaction');
  }

  // Update wallet balances
  await Promise.all([
    supabase
      .from('wallets')
      .update({ 
        available_balance: senderWallet.available_balance - amount 
      })
      .eq('id', senderWallet.id),
    
    supabase
      .from('wallets')
      .update({ 
        available_balance: supabase.rpc('get_wallet_balance', { wallet_id: recipientWallet.id }) + amount 
      })
      .eq('id', recipientWallet.id)
  ]);

  return new Response(JSON.stringify({ 
    success: true, 
    transaction_id,
    message: 'Transfer completed successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function initiateEscrowTransaction(supabase: any, params: any) {
  const { sender_wallet_id, recipient_wallet_id, amount, listing_id, description } = params;

  const escrow_id = crypto.randomUUID();
  const transaction_id = crypto.randomUUID();

  // Create escrow account
  const { error: escrowError } = await supabase
    .from('escrow_accounts')
    .insert({
      id: escrow_id,
      buyer_wallet_id: sender_wallet_id,
      seller_wallet_id: recipient_wallet_id,
      amount,
      listing_id,
      status: 'pending',
      created_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });

  if (escrowError) {
    throw new Error('Failed to create escrow account');
  }

  // Create pending transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      id: transaction_id,
      sender_wallet_id,
      recipient_wallet_id,
      amount,
      transaction_type: 'escrow_hold',
      description,
      status: 'pending',
      escrow_id,
      transaction_date: new Date().toISOString()
    });

  if (transactionError) {
    throw new Error('Failed to create transaction');
  }

  // Update sender's available balance (move to escrow)
  const { data: senderWallet } = await supabase
    .from('wallets')
    .select('available_balance, escrow_balance')
    .eq('id', sender_wallet_id)
    .single();

  await supabase
    .from('wallets')
    .update({ 
      available_balance: senderWallet.available_balance - amount,
      escrow_balance: senderWallet.escrow_balance + amount
    })
    .eq('id', sender_wallet_id);

  return new Response(JSON.stringify({ 
    success: true, 
    transaction_id,
    escrow_id,
    message: 'Escrow transaction initiated successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleEscrowRelease(supabase: any, params: any, user_id: string) {
  const { escrow_id, release_type } = params; // release_type: 'complete' or 'cancel'

  // Get escrow details
  const { data: escrow, error: escrowError } = await supabase
    .from('escrow_accounts')
    .select('*')
    .eq('id', escrow_id)
    .single();

  if (escrowError || !escrow) {
    throw new Error('Escrow account not found');
  }

  if (escrow.status !== 'pending') {
    throw new Error('Escrow is not in pending status');
  }

  // Verify user authorization (buyer or seller)
  const { data: buyerWallet } = await supabase
    .from('wallets')
    .select('user_id')
    .eq('id', escrow.buyer_wallet_id)
    .single();

  const { data: sellerWallet } = await supabase
    .from('wallets')
    .select('user_id')
    .eq('id', escrow.seller_wallet_id)
    .single();

  if (user_id !== buyerWallet.user_id && user_id !== sellerWallet.user_id) {
    throw new Error('Unauthorized to modify this escrow');
  }

  if (release_type === 'complete') {
    // Release funds to seller
    await releaseEscrowToSeller(supabase, escrow);
  } else if (release_type === 'cancel') {
    // Return funds to buyer
    await returnEscrowToBuyer(supabase, escrow);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: `Escrow ${release_type}d successfully` 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function releaseEscrowToSeller(supabase: any, escrow: any) {
  // Update escrow status
  await supabase
    .from('escrow_accounts')
    .update({ 
      status: 'completed',
      completion_date: new Date().toISOString()
    })
    .eq('id', escrow.id);

  // Update transaction status
  await supabase
    .from('transactions')
    .update({ status: 'completed' })
    .eq('escrow_id', escrow.id);

  // Update wallet balances
  const [{ data: buyerWallet }, { data: sellerWallet }] = await Promise.all([
    supabase.from('wallets').select('*').eq('id', escrow.buyer_wallet_id).single(),
    supabase.from('wallets').select('*').eq('id', escrow.seller_wallet_id).single()
  ]);

  await Promise.all([
    supabase
      .from('wallets')
      .update({ 
        escrow_balance: buyerWallet.escrow_balance - escrow.amount 
      })
      .eq('id', escrow.buyer_wallet_id),
    
    supabase
      .from('wallets')
      .update({ 
        available_balance: sellerWallet.available_balance + escrow.amount 
      })
      .eq('id', escrow.seller_wallet_id)
  ]);
}

async function returnEscrowToBuyer(supabase: any, escrow: any) {
  // Update escrow status
  await supabase
    .from('escrow_accounts')
    .update({ 
      status: 'cancelled',
      completion_date: new Date().toISOString()
    })
    .eq('id', escrow.id);

  // Update transaction status
  await supabase
    .from('transactions')
    .update({ status: 'cancelled' })
    .eq('escrow_id', escrow.id);

  // Return funds to buyer
  const { data: buyerWallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', escrow.buyer_wallet_id)
    .single();

  await supabase
    .from('wallets')
    .update({ 
      available_balance: buyerWallet.available_balance + escrow.amount,
      escrow_balance: buyerWallet.escrow_balance - escrow.amount 
    })
    .eq('id', escrow.buyer_wallet_id);
}

async function handleDispute(supabase: any, params: any, user_id: string) {
  const { escrow_id, dispute_reason, evidence } = params;

  // Update escrow to disputed status
  const { error } = await supabase
    .from('escrow_accounts')
    .update({ 
      status: 'disputed',
      dispute_reason,
      dispute_evidence: evidence,
      dispute_date: new Date().toISOString()
    })
    .eq('id', escrow_id);

  if (error) {
    throw new Error('Failed to initiate dispute');
  }

  // TODO: Notify admin/arbitration system
  // await notifyArbitrationTeam(escrow_id);

  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Dispute initiated successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleRewardProcessing(supabase: any, params: any, user_id: string) {
  const { reward_type, amount, reference_id } = params;

  // Get user wallet
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (walletError || !wallet) {
    throw new Error('User wallet not found');
  }

  const transaction_id = crypto.randomUUID();

  // Create reward transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      id: transaction_id,
      recipient_wallet_id: wallet.id,
      amount,
      transaction_type: 'reward',
      description: `${reward_type} reward`,
      status: 'completed',
      transaction_date: new Date().toISOString()
    });

  if (transactionError) {
    throw new Error('Failed to create reward transaction');
  }

  // Update wallet balance
  await supabase
    .from('wallets')
    .update({ 
      available_balance: wallet.available_balance + amount,
      total_rewards: wallet.total_rewards + amount
    })
    .eq('id', wallet.id);

  return new Response(JSON.stringify({ 
    success: true, 
    transaction_id,
    message: 'Reward processed successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}