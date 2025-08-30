import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const { action, ...params } = await req.json()

    switch (action) {
      case 'get_wallet_balance':
        return await handleGetWalletBalance(supabase, user.id)
      
      case 'get_transactions':
        return await handleGetTransactions(supabase, user.id, params)
      
      case 'initiate_transfer':
        return await handleTransferInitiation(supabase, params, user.id)
      
      case 'get_payment_methods':
        return await handleGetPaymentMethods(supabase, user.id)
      
      case 'add_payment_method':
        return await handleAddPaymentMethod(supabase, params, user.id)
      
      case 'initiate_withdrawal':
        return await handleWithdrawalRequest(supabase, params, user.id)
      
      case 'create_dispute':
        return await handleCreateDispute(supabase, params, user.id)
      
      case 'calculate_fees':
        return await handleCalculateFees(supabase, params)
      
      case 'process_reward':
        return await handleRewardProcessing(supabase, params, user.id)
      
      case 'check_fraud_analysis':
        return await handleFraudAnalysis(supabase, params, user.id)
      
      case 'require_mfa_verification':
        return await handleMFAVerification(supabase, params, user.id)
      
      case 'check_rate_limit':
        return await handleRateLimitCheck(supabase, params, user.id)
      
      default:
        throw new Error('Invalid action specified')
    }
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleGetWalletBalance(supabase: any, user_id: string) {
  const { data: wallet, error } = await supabase
    .from('wallets')
    .select(`
      *,
      users!inner(display_name, email)
    `)
    .eq('user_id', user_id)
    .single()

  if (error || !wallet) {
    throw new Error('Wallet not found')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        available_balance: wallet.available_balance || 0,
        escrow_balance: wallet.escrow_balance || 0,
        pending_balance: wallet.pending_balance || 0,
        total_rewards: wallet.total_rewards || 0,
        is_verified: wallet.is_verified || false,
        fica_status: wallet.fica_status || 'pending',
        daily_limit: wallet.daily_limit || 15000,
        monthly_limit: wallet.monthly_limit || 100000,
        currency: wallet.currency || 'ZAR'
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetTransactions(supabase: any, user_id: string, params: any) {
  const { limit = 20, offset = 0, type, status } = params

  let query = supabase
    .from('transactions')
    .select(`
      *,
      from_wallet:from_wallet_id(wallets!inner(users(display_name, email))),
      to_wallet:to_wallet_id(wallets!inner(users(display_name, email)))
    `)
    .or(`from_user_id.eq.${user_id},to_user_id.eq.${user_id}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('transaction_type', type)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data: transactions, error } = await query

  if (error) {
    throw new Error('Failed to fetch transactions')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.from_user_id === user_id ? 'sent' : 'received',
        amount: tx.amount,
        fee_amount: tx.fee_amount || 0,
        net_amount: tx.net_amount || tx.amount,
        description: tx.description,
        transaction_type: tx.transaction_type,
        status: tx.status,
        date: tx.created_at,
        from: tx.from_wallet?.users?.display_name || 'Unknown',
        to: tx.to_wallet?.users?.display_name || 'Unknown'
      }))
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleTransferInitiation(supabase: any, params: any, user_id: string) {
  const { recipient_id, amount, transfer_type, description, reference_id } = params

  // Calculate fees
  const { data: feeAmount } = await supabase.rpc('calculate_transaction_fee', {
    amount: amount,
    transaction_type: transfer_type
  })

  const totalAmount = amount + (feeAmount || 0)

  // Get sender wallet
  const { data: senderWallet, error: senderError } = await supabase
    .from('wallets')
    .select('id, available_balance, is_verified, fica_status')
    .eq('user_id', user_id)
    .single()

  if (senderError || !senderWallet) {
    throw new Error('Sender wallet not found')
  }

  // Check FICA compliance for large transactions
  if (amount > 5000 && senderWallet.fica_status !== 'verified') {
    throw new Error('FICA verification required for transactions over R5,000')
  }

  if (senderWallet.available_balance < totalAmount) {
    throw new Error('Insufficient balance including fees')
  }

  // Get recipient wallet
  const { data: recipientWallet, error: recipientError } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', recipient_id)
    .single()

  if (recipientError || !recipientWallet) {
    throw new Error('Recipient wallet not found')
  }

  const transaction_id = crypto.randomUUID()

  // Create transaction record
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      id: transaction_id,
      from_user_id: user_id,
      to_user_id: recipient_id,
      from_wallet_id: senderWallet.id,
      to_wallet_id: recipientWallet.id,
      amount: amount,
      fee_amount: feeAmount || 0,
      net_amount: amount,
      transaction_type: transfer_type,
      description: description,
      reference_id: reference_id,
      status: 'completed',
      currency: 'ZAR'
    })

  if (transactionError) {
    throw new Error('Failed to create transaction')
  }

  // Update wallet balances
  await Promise.all([
    supabase
      .from('wallets')
      .update({ 
        available_balance: senderWallet.available_balance - totalAmount,
        last_transaction_date: new Date().toISOString()
      })
      .eq('id', senderWallet.id),
    
    supabase
      .from('wallets')
      .update({ 
        available_balance: supabase.rpc('get_wallet_balance', { wallet_id: recipientWallet.id }) + amount,
        last_transaction_date: new Date().toISOString()
      })
      .eq('id', recipientWallet.id)
  ])

  return new Response(
    JSON.stringify({ 
      success: true, 
      transaction_id,
      fee_amount: feeAmount || 0,
      total_amount: totalAmount,
      message: 'Transfer completed successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetPaymentMethods(supabase: any, user_id: string) {
  const { data: paymentMethods, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', user_id)
    .order('is_default', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch payment methods')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: paymentMethods 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAddPaymentMethod(supabase: any, params: any, user_id: string) {
  const { method_type, method_data, is_default } = params

  // If this is set as default, unset other defaults
  if (is_default) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', user_id)
      .eq('is_default', true)
  }

  const { data: paymentMethod, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: user_id,
      method_type: method_type,
      method_data: method_data,
      is_default: is_default || false
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to add payment method')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: paymentMethod,
      message: 'Payment method added successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleWithdrawalRequest(supabase: any, params: any, user_id: string) {
  const { amount, payment_method_id } = params

  // Get user wallet
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('available_balance')
    .eq('user_id', user_id)
    .single()

  if (walletError || !wallet) {
    throw new Error('Wallet not found')
  }

  if (wallet.available_balance < amount) {
    throw new Error('Insufficient balance')
  }

  // Calculate withdrawal fees
  const { data: feeAmount } = await supabase.rpc('calculate_transaction_fee', {
    amount: amount,
    transaction_type: 'withdrawal'
  })

  const netAmount = amount - (feeAmount || 0)

  // Create withdrawal request
  const { data: withdrawalRequest, error: withdrawalError } = await supabase
    .from('withdrawal_requests')
    .insert({
      user_id: user_id,
      amount: amount,
      payment_method_id: payment_method_id,
      processing_fee: feeAmount || 0,
      net_amount: netAmount,
      status: 'pending'
    })
    .select()
    .single()

  if (withdrawalError) {
    throw new Error('Failed to create withdrawal request')
  }

  // Deduct from available balance
  await supabase
    .from('wallets')
    .update({ 
      available_balance: wallet.available_balance - amount,
      last_transaction_date: new Date().toISOString()
    })
    .eq('user_id', user_id)

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: withdrawalRequest,
      message: 'Withdrawal request submitted successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateDispute(supabase: any, params: any, user_id: string) {
  const { transaction_id, dispute_type, reason, evidence_urls } = params

  // Verify transaction ownership
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transaction_id)
    .or(`from_user_id.eq.${user_id},to_user_id.eq.${user_id}`)
    .single()

  if (transactionError || !transaction) {
    throw new Error('Transaction not found or unauthorized')
  }

  // Create dispute
  const { data: dispute, error: disputeError } = await supabase
    .from('transaction_disputes')
    .insert({
      transaction_id: transaction_id,
      user_id: user_id,
      dispute_type: dispute_type,
      reason: reason,
      evidence_urls: evidence_urls || [],
      status: 'open'
    })
    .select()
    .single()

  if (disputeError) {
    throw new Error('Failed to create dispute')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: dispute,
      message: 'Dispute created successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCalculateFees(supabase: any, params: any) {
  const { amount, transaction_type } = params

  const { data: feeAmount } = await supabase.rpc('calculate_transaction_fee', {
    amount: amount,
    transaction_type: transaction_type
  })

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        amount: amount,
        transaction_type: transaction_type,
        fee_amount: feeAmount || 0,
        total_amount: amount + (feeAmount || 0)
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRewardProcessing(supabase: any, params: any, user_id: string) {
  const { reward_type, amount, reference_id, description } = params

  // Get user wallet
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single()

  if (walletError || !wallet) {
    throw new Error('User wallet not found')
  }

  const transaction_id = crypto.randomUUID()

  // Create reward transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      id: transaction_id,
      to_user_id: user_id,
      to_wallet_id: wallet.id,
      amount: amount,
      fee_amount: 0,
      net_amount: amount,
      transaction_type: 'reward',
      description: description || `${reward_type} reward`,
      reference_id: reference_id,
      status: 'completed',
      currency: 'ZAR'
    })

  if (transactionError) {
    throw new Error('Failed to create reward transaction')
  }

  // Update wallet balance
  await supabase
    .from('wallets')
    .update({ 
      available_balance: wallet.available_balance + amount,
      total_rewards: wallet.total_rewards + amount,
      last_transaction_date: new Date().toISOString()
    })
    .eq('id', wallet.id)

  return new Response(
    JSON.stringify({ 
      success: true, 
      transaction_id,
      message: 'Reward processed successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Enhanced security handlers
async function handleFraudAnalysis(supabase: any, params: any, user_id: string): Promise<Response> {
  const { transaction_type, amount, recipient_id, device_info } = params

  // Call AI fraud detection
  const fraudResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-fraud-detection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    },
    body: JSON.stringify({
      action: 'analyze_transaction',
      user_id: user_id,
      transaction_type: transaction_type,
      amount: amount,
      recipient_id: recipient_id,
      device_info: device_info
    })
  })

  const fraudResult = await fraudResponse.json()

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: fraudResult.data 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleMFAVerification(supabase: any, params: any, user_id: string): Promise<Response> {
  const { code, transaction_id, amount } = params

  // Call MFA verification
  const mfaResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/mfa-authentication`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    },
    body: JSON.stringify({
      action: 'verify_mfa',
      code: code,
      transaction_id: transaction_id,
      amount: amount
    })
  })

  const mfaResult = await mfaResponse.json()

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: mfaResult.data 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRateLimitCheck(supabase: any, params: any, user_id: string): Promise<Response> {
  const { endpoint, action, transaction_type, amount } = params

  // Call rate limiting
  const rateLimitResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/advanced-rate-limiting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    },
    body: JSON.stringify({
      action: 'check_rate_limit',
      endpoint: endpoint,
      action: action,
      transaction_type: transaction_type,
      amount: amount
    })
  })

  const rateLimitResult = await rateLimitResponse.json()

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: rateLimitResult.data 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
