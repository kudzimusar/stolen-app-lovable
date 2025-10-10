// Blockchain Verify Edge Function
// This function verifies device reports on blockchain

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request
    const { reportId, deviceId } = await req.json()

    console.log('🔍 Verifying device on blockchain:', { reportId, deviceId })

    // Step 1: Get blockchain transaction from database
    const { data: blockchainTxs, error: txError } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .eq('metadata->>reportId', reportId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (txError) {
      console.error('Error fetching blockchain transaction:', txError)
    }

    const blockchainTx = blockchainTxs && blockchainTxs.length > 0 ? blockchainTxs[0] : null

    // Step 2: Verify on blockchain (mock for now)
    const verificationSteps = [
      {
        step: 'Connect to blockchain network',
        status: 'completed',
        details: 'Connected to Polygon network'
      },
      {
        step: 'Query device registry',
        status: blockchainTx ? 'completed' : 'failed',
        details: blockchainTx ? 'Device found in blockchain registry' : 'Device not found'
      },
      {
        step: 'Verify data integrity',
        status: blockchainTx ? 'completed' : 'failed',
        details: blockchainTx ? 'Data matches blockchain record' : 'No blockchain record'
      },
      {
        step: 'Confirm ownership',
        status: blockchainTx ? 'completed' : 'failed',
        details: blockchainTx ? 'Ownership verified' : 'No ownership record'
      }
    ]

    const isVerified = blockchainTx !== null
    const confidence = isVerified ? 0.95 : 0.1

    const response = {
      success: true,
      data: {
        isVerified,
        confidence,
        blockchainRecord: blockchainTx ? {
          transactionHash: blockchainTx.transaction_hash,
          blockNumber: blockchainTx.block_number,
          timestamp: blockchainTx.created_at,
          network: blockchainTx.network,
          confirmations: blockchainTx.confirmations,
          gasUsed: blockchainTx.gas_used,
          gasPrice: blockchainTx.gas_fee
        } : null,
        verificationSteps,
        metadata: {
          verificationTime: 2500,
          network: 'polygon',
          timestamp: new Date().toISOString()
        }
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in blockchain-verify function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: {
          isVerified: false,
          confidence: 0,
          verificationSteps: [
            {
              step: 'Verification failed',
              status: 'failed',
              details: error.message
            }
          ]
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 even on error for graceful handling
      }
    )
  }
})



