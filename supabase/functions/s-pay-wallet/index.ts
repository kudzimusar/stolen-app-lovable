import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WalletBalance {
  available_balance: number;
  escrow_balance: number;
  pending_balance: number;
  total_rewards: number;
  total_balance: number;
}

interface TransactionRequest {
  recipient_id?: string;
  amount: number;
  transaction_type: "transfer" | "escrow" | "reward" | "withdrawal";
  description?: string;
  reference_id?: string;
  payment_method_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    switch (req.method) {
      case "GET":
        if (path === "balance") {
          return await handleGetBalance(req, supabaseServiceClient, user);
        } else if (path === "transactions") {
          return await handleGetTransactions(req, supabaseServiceClient, user);
        } else if (path === "payment-methods") {
          return await handleGetPaymentMethods(req, supabaseServiceClient, user);
        } else if (path === "withdrawals") {
          return await handleGetWithdrawals(req, supabaseServiceClient, user);
        } else if (path === "disputes") {
          return await handleGetDisputes(req, supabaseServiceClient, user);
        } else {
          return await handleGetWallet(req, supabaseServiceClient, user);
        }
      
      case "POST":
        if (path === "transfer") {
          return await handleTransfer(req, supabaseServiceClient, user);
        } else if (path === "withdrawal") {
          return await handleWithdrawal(req, supabaseServiceClient, user);
        } else if (path === "payment-method") {
          return await handleAddPaymentMethod(req, supabaseServiceClient, user);
        } else if (path === "dispute") {
          return await handleCreateDispute(req, supabaseServiceClient, user);
        } else if (path === "verify") {
          return await handleVerifyWallet(req, supabaseServiceClient, user);
        }
        break;
      
      case "PUT":
        if (path === "limits") {
          return await handleUpdateLimits(req, supabaseServiceClient, user);
        } else if (path === "payment-method") {
          return await handleUpdatePaymentMethod(req, supabaseServiceClient, user);
        }
        break;
      
      case "DELETE":
        if (path === "payment-method") {
          return await handleDeletePaymentMethod(req, supabaseServiceClient, user);
        }
        break;
      
      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error("S-Pay Wallet API error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleGetWallet(req: Request, supabase: any, user: any): Promise<Response> {
  const { data: wallet, error } = await supabase
    .from("wallets")
    .select(`
      *,
      users!inner(display_name, email, avatar_url)
    `)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  // Calculate total balance
  const totalBalance = (wallet.available_balance || 0) + 
                      (wallet.escrow_balance || 0) + 
                      (wallet.pending_balance || 0);

  const walletData = {
    ...wallet,
    total_balance: totalBalance,
    is_verified: wallet.is_verified || false
  };

  return new Response(
    JSON.stringify({
      success: true,
      data: walletData
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetBalance(req: Request, supabase: any, user: any): Promise<Response> {
  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("available_balance, escrow_balance, pending_balance, total_rewards")
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  const balance: WalletBalance = {
    available_balance: wallet.available_balance || 0,
    escrow_balance: wallet.escrow_balance || 0,
    pending_balance: wallet.pending_balance || 0,
    total_rewards: wallet.total_rewards || 0,
    total_balance: (wallet.available_balance || 0) + 
                   (wallet.escrow_balance || 0) + 
                   (wallet.pending_balance || 0)
  };

  return new Response(
    JSON.stringify({
      success: true,
      data: balance
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetTransactions(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");

  // Get user's wallet
  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  let query = supabase
    .from("transactions")
    .select(`
      *,
      from_wallet:from_wallet_id(wallets!inner(users!inner(display_name, email))),
      to_wallet:to_wallet_id(wallets!inner(users!inner(display_name, email)))
    `)
    .or(`from_wallet_id.eq.${wallet.id},to_wallet_id.eq.${wallet.id}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq("transaction_type", type);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data: transactions, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetPaymentMethods(req: Request, supabase: any, user: any): Promise<Response> {
  const { data: paymentMethods, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: paymentMethods
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetWithdrawals(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const { data: withdrawals, error } = await supabase
    .from("withdrawal_requests")
    .select(`
      *,
      payment_methods!inner(method_type, method_name)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: withdrawals,
      pagination: {
        limit,
        offset,
        hasMore: withdrawals.length === limit
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetDisputes(req: Request, supabase: any, user: any): Promise<Response> {
  const { data: disputes, error } = await supabase
    .from("transaction_disputes")
    .select(`
      *,
      transactions!inner(amount, transaction_type, description)
    `)
    .eq("initiator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: disputes
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleTransfer(req: Request, supabase: any, user: any): Promise<Response> {
  const transferData: TransactionRequest = await req.json();
  
  // Validate required fields
  if (!transferData.amount || transferData.amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (transferData.transaction_type === "transfer" && !transferData.recipient_id) {
    throw new Error("Recipient ID required for transfers");
  }

  // Get sender wallet
  const { data: senderWallet, error: senderError } = await supabase
    .from("wallets")
    .select("id, available_balance, daily_limit, monthly_limit")
    .eq("user_id", user.id)
    .single();

  if (senderError || !senderWallet) {
    throw new Error("Sender wallet not found");
  }

  // Validate transaction limits
  const isValid = await validateTransactionLimits(supabase, user.id, transferData.amount, transferData.transaction_type);
  if (!isValid) {
    throw new Error("Transaction exceeds limits");
  }

  // Calculate fees
  const feeAmount = await calculateTransactionFee(supabase, transferData.amount, transferData.transaction_type);
  const totalAmount = transferData.amount + feeAmount;

  // Check sufficient balance
  if (senderWallet.available_balance < totalAmount) {
    throw new Error("Insufficient balance");
  }

  let transaction;
  let recipientWallet = null;

  if (transferData.transaction_type === "transfer" && transferData.recipient_id) {
    // Get recipient wallet
    const { data: recipient, error: recipientError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", transferData.recipient_id)
      .single();

    if (recipientError || !recipient) {
      throw new Error("Recipient wallet not found");
    }
    recipientWallet = recipient;

    // Create transfer transaction
    transaction = await createTransaction(supabase, {
      from_wallet_id: senderWallet.id,
      to_wallet_id: recipientWallet.id,
      amount: transferData.amount,
      fee_amount: feeAmount,
      transaction_type: "transfer",
      description: transferData.description || "Transfer",
      reference_id: transferData.reference_id
    });
  } else if (transferData.transaction_type === "withdrawal") {
    // Handle withdrawal request
    const withdrawal = await createWithdrawalRequest(supabase, {
      user_id: user.id,
      amount: transferData.amount,
      payment_method_id: transferData.payment_method_id,
      description: transferData.description
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: withdrawal,
        message: "Withdrawal request created successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } else {
    throw new Error("Invalid transaction type");
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: transaction,
      message: "Transfer completed successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleWithdrawal(req: Request, supabase: any, user: any): Promise<Response> {
  const withdrawalData = await req.json();
  
  if (!withdrawalData.amount || withdrawalData.amount <= 0) {
    throw new Error("Invalid withdrawal amount");
  }

  if (!withdrawalData.payment_method_id) {
    throw new Error("Payment method required");
  }

  // Get user wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("available_balance")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    throw new Error("Wallet not found");
  }

  if (wallet.available_balance < withdrawalData.amount) {
    throw new Error("Insufficient balance");
  }

  // Calculate withdrawal fee
  const feeAmount = await calculateTransactionFee(supabase, withdrawalData.amount, "withdrawal");
  const netAmount = withdrawalData.amount - feeAmount;

  // Create withdrawal request
  const { data: withdrawal, error } = await supabase
    .from("withdrawal_requests")
    .insert({
      user_id: user.id,
      amount: withdrawalData.amount,
      payment_method_id: withdrawalData.payment_method_id,
      processing_fee: feeAmount,
      net_amount: netAmount,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: withdrawal,
      message: "Withdrawal request created successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleAddPaymentMethod(req: Request, supabase: any, user: any): Promise<Response> {
  const paymentMethodData = await req.json();
  
  if (!paymentMethodData.method_type || !paymentMethodData.method_name) {
    throw new Error("Method type and name required");
  }

  // If this is the first payment method, make it default
  const { data: existingMethods } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const isDefault = !existingMethods || existingMethods.length === 0;

  // If setting as default, unset other defaults
  if (isDefault) {
    await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data: paymentMethod, error } = await supabase
    .from("payment_methods")
    .insert({
      user_id: user.id,
      method_type: paymentMethodData.method_type,
      method_name: paymentMethodData.method_name,
      method_data: paymentMethodData.method_data || {},
      is_default: isDefault,
      is_verified: false
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: paymentMethod,
      message: "Payment method added successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleUpdatePaymentMethod(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const methodId = url.searchParams.get("id");
  const updateData = await req.json();

  if (!methodId) {
    throw new Error("Payment method ID required");
  }

  // Verify ownership
  const { data: existingMethod, error: checkError } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("id", methodId)
    .eq("user_id", user.id)
    .single();

  if (checkError || !existingMethod) {
    throw new Error("Payment method not found or unauthorized");
  }

  const { data: paymentMethod, error } = await supabase
    .from("payment_methods")
    .update(updateData)
    .eq("id", methodId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: paymentMethod,
      message: "Payment method updated successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleDeletePaymentMethod(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const methodId = url.searchParams.get("id");

  if (!methodId) {
    throw new Error("Payment method ID required");
  }

  // Verify ownership
  const { data: existingMethod, error: checkError } = await supabase
    .from("payment_methods")
    .select("id, is_default")
    .eq("id", methodId)
    .eq("user_id", user.id)
    .single();

  if (checkError || !existingMethod) {
    throw new Error("Payment method not found or unauthorized");
  }

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: false })
    .eq("id", methodId);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Payment method deleted successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleCreateDispute(req: Request, supabase: any, user: any): Promise<Response> {
  const disputeData = await req.json();
  
  if (!disputeData.transaction_id || !disputeData.reason || !disputeData.dispute_type) {
    throw new Error("Transaction ID, reason, and dispute type required");
  }

  // Verify transaction ownership
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select("id, from_wallet_id, to_wallet_id")
    .eq("id", disputeData.transaction_id)
    .single();

  if (transactionError || !transaction) {
    throw new Error("Transaction not found");
  }

  // Get user's wallet
  const { data: userWallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!userWallet) {
    throw new Error("User wallet not found");
  }

  // Check if user is involved in the transaction
  if (transaction.from_wallet_id !== userWallet.id && transaction.to_wallet_id !== userWallet.id) {
    throw new Error("Not authorized to dispute this transaction");
  }

  const { data: dispute, error } = await supabase
    .from("transaction_disputes")
    .insert({
      transaction_id: disputeData.transaction_id,
      initiator_id: user.id,
      dispute_type: disputeData.dispute_type,
      reason: disputeData.reason,
      evidence: disputeData.evidence || {},
      status: "open"
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: dispute,
      message: "Dispute created successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleVerifyWallet(req: Request, supabase: any, user: any): Promise<Response> {
  const verificationData = await req.json();
  
  if (!verificationData.verification_type || !verificationData.verification_data) {
    throw new Error("Verification type and data required");
  }

  const { data: verification, error } = await supabase
    .from("wallet_verifications")
    .insert({
      user_id: user.id,
      verification_type: verificationData.verification_type,
      verification_data: verificationData.verification_data,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: verification,
      message: "Verification request submitted successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleUpdateLimits(req: Request, supabase: any, user: any): Promise<Response> {
  const limitsData = await req.json();
  
  const { data: wallet, error } = await supabase
    .from("wallets")
    .update({
      daily_limit: limitsData.daily_limit,
      monthly_limit: limitsData.monthly_limit
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: wallet,
      message: "Transaction limits updated successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Helper functions
async function validateTransactionLimits(supabase: any, userId: string, amount: number, transactionType: string): Promise<boolean> {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("daily_limit, monthly_limit, daily_transaction_count, monthly_transaction_count")
    .eq("user_id", userId)
    .single();

  if (!wallet) {
    return false;
  }

  // Check daily limit
  if (amount > wallet.daily_limit) {
    return false;
  }

  // Check monthly limit
  if (amount > wallet.monthly_limit) {
    return false;
  }

  // Check daily transaction count (limit to 50 transactions per day)
  if (wallet.daily_transaction_count >= 50) {
    return false;
  }

  // Check monthly transaction count (limit to 500 transactions per month)
  if (wallet.monthly_transaction_count >= 500) {
    return false;
  }

  return true;
}

async function calculateTransactionFee(supabase: any, amount: number, transactionType: string): Promise<number> {
  const { data: feeInfo } = await supabase
    .from("transaction_fees")
    .select("fee_percentage, fixed_fee, min_fee, max_fee")
    .eq("transaction_type", transactionType)
    .eq("is_active", true)
    .single();

  if (!feeInfo) {
    return 0.00;
  }

  // Calculate percentage fee
  let calculatedFee = (amount * feeInfo.fee_percentage) + feeInfo.fixed_fee;

  // Apply min/max constraints
  if (calculatedFee < feeInfo.min_fee) {
    calculatedFee = feeInfo.min_fee;
  } else if (calculatedFee > feeInfo.max_fee) {
    calculatedFee = feeInfo.max_fee;
  }

  return calculatedFee;
}

async function createTransaction(supabase: any, transactionData: any): Promise<any> {
  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert({
      from_wallet_id: transactionData.from_wallet_id,
      to_wallet_id: transactionData.to_wallet_id,
      amount: transactionData.amount,
      fee_amount: transactionData.fee_amount,
      transaction_type: transactionData.transaction_type,
      description: transactionData.description,
      reference_id: transactionData.reference_id,
      status: "completed"
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return transaction;
}

async function createWithdrawalRequest(supabase: any, withdrawalData: any): Promise<any> {
  const feeAmount = await calculateTransactionFee(supabase, withdrawalData.amount, "withdrawal");
  const netAmount = withdrawalData.amount - feeAmount;

  const { data: withdrawal, error } = await supabase
    .from("withdrawal_requests")
    .insert({
      user_id: withdrawalData.user_id,
      amount: withdrawalData.amount,
      payment_method_id: withdrawalData.payment_method_id,
      processing_fee: feeAmount,
      net_amount: netAmount,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return withdrawal;
}
