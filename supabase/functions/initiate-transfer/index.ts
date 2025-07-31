import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransferRequest {
  toUserId: string;
  amount: number;
  currency?: string;
  description?: string;
  referenceId?: string;
  transferType: "transfer" | "escrow" | "reward" | "refund";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const transferData: TransferRequest = await req.json();

    // Get sender wallet
    const { data: fromWallet, error: fromWalletError } = await supabaseClient
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .single();

    if (fromWalletError || !fromWallet) {
      throw new Error("Sender wallet not found");
    }

    // Get receiver wallet
    const { data: toWallet, error: toWalletError } = await supabaseClient
      .from("wallets")
      .select("id, balance")
      .eq("user_id", transferData.toUserId)
      .single();

    if (toWalletError || !toWallet) {
      throw new Error("Receiver wallet not found");
    }

    // Check sufficient balance
    if (fromWallet.balance < transferData.amount) {
      throw new Error("Insufficient balance");
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        from_wallet_id: fromWallet.id,
        to_wallet_id: toWallet.id,
        amount: transferData.amount,
        currency: transferData.currency || "USD",
        transaction_type: transferData.transferType,
        reference_id: transferData.referenceId,
        description: transferData.description,
        status: "pending"
      })
      .select()
      .single();

    if (transactionError) {
      throw transactionError;
    }

    // For regular transfers, update balances immediately
    if (transferData.transferType === "transfer" || transferData.transferType === "reward") {
      // Update sender balance
      await supabaseClient
        .from("wallets")
        .update({ balance: fromWallet.balance - transferData.amount })
        .eq("id", fromWallet.id);

      // Update receiver balance
      await supabaseClient
        .from("wallets")
        .update({ balance: toWallet.balance + transferData.amount })
        .eq("id", toWallet.id);

      // Update transaction status
      await supabaseClient
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", transaction.id);
    }

    // For escrow, create escrow account
    if (transferData.transferType === "escrow" && transferData.referenceId) {
      const { data: listing } = await supabaseClient
        .from("marketplace_listings")
        .select("seller_id")
        .eq("id", transferData.referenceId)
        .single();

      if (listing) {
        await supabaseClient
          .from("escrow_accounts")
          .insert({
            buyer_id: user.id,
            seller_id: listing.seller_id,
            listing_id: transferData.referenceId,
            amount: transferData.amount,
            currency: transferData.currency || "USD",
            status: "funded"
          });

        // Deduct from buyer's wallet for escrow
        await supabaseClient
          .from("wallets")
          .update({ balance: fromWallet.balance - transferData.amount })
          .eq("id", fromWallet.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction,
        message: "Transfer initiated successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Transfer error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});