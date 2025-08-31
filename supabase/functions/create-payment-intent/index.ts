import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  metadata: {
    listingId: string;
    sellerId: string;
    buyerId: string;
    deviceId: string;
  };
  escrow: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { amount, currency, paymentMethodId, metadata, escrow }: PaymentRequest = await req.json()

    // Validate request
    if (!amount || !currency || !paymentMethodId || !metadata) {
      throw new Error('Missing required fields')
    }

    let paymentIntentId: string;
    let clientSecret: string | undefined;

    // Handle different payment methods
    if (paymentMethodId === 'stripe') {
      // Create Stripe payment intent
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
      if (!stripeSecretKey) {
        throw new Error('Stripe not configured')
      }

      const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: (amount * 100).toString(), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: JSON.stringify(metadata),
          capture_method: escrow ? 'manual' : 'automatic', // Manual capture for escrow
        }),
      })

      const stripeData = await stripeResponse.json()
      
      if (!stripeResponse.ok) {
        throw new Error(`Stripe error: ${stripeData.error?.message || 'Unknown error'}`)
      }

      paymentIntentId = stripeData.id
      clientSecret = stripeData.client_secret
    } else if (paymentMethodId === 'paypal') {
      // PayPal integration would go here
      paymentIntentId = `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } else if (paymentMethodId === 's-pay') {
      // S-Pay wallet integration would go here
      paymentIntentId = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } else {
      throw new Error('Invalid payment method')
    }

    // Store payment intent in database
    const { data: paymentIntent, error: dbError } = await supabaseClient
      .from('payment_intents')
      .insert({
        id: paymentIntentId,
        user_id: user.id,
        amount,
        currency,
        payment_method: paymentMethodId,
        status: 'pending',
        metadata,
        escrow_enabled: escrow,
        stripe_client_secret: clientSecret,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store payment intent')
    }

    // If escrow is enabled, create escrow record
    if (escrow) {
      const { error: escrowError } = await supabaseClient
        .from('escrow_transactions')
        .insert({
          payment_intent_id: paymentIntentId,
          amount,
          status: 'pending',
          release_conditions: [
            'Device delivered',
            'Buyer confirmation',
            'Dispute resolution'
          ],
          expected_release_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })

      if (escrowError) {
        console.error('Escrow creation error:', escrowError)
        // Continue anyway, escrow can be created later
      }
    }

    return new Response(
      JSON.stringify({
        id: paymentIntentId,
        client_secret: clientSecret,
        amount,
        currency,
        status: 'pending',
        escrow_enabled: escrow,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment intent' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
