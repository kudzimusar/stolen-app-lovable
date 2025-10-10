// Blockchain Anchor Edge Function
// This function handles anchoring Lost & Found device reports to blockchain

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BlockchainAnchorRequest {
  reportId: string;
  deviceData: {
    deviceId: string;
    serialNumber?: string;
    deviceModel: string;
    deviceBrand: string;
    reportType: 'lost' | 'found';
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    incidentDate: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { reportId, deviceData }: BlockchainAnchorRequest = await req.json()

    console.log('🔗 Anchoring device to blockchain:', {
      reportId,
      deviceId: deviceData.deviceId,
      user: user.id
    })

    // Step 1: Verify report exists and belongs to user
    const { data: report, error: reportError } = await supabase
      .from('lost_found_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      throw new Error('Report not found or unauthorized')
    }

    // Step 2: Generate blockchain transaction hash (mock for now, replace with real blockchain call)
    const transactionHash = await generateBlockchainTransaction(deviceData)
    const blockNumber = Math.floor(Math.random() * 1000000) + 18000000
    const gasUsed = 150000 + Math.floor(Math.random() * 50000)
    const gasFee = (Math.random() * 0.01).toFixed(6)

    // Step 3: Store blockchain reference in database
    const { data: blockchainTx, error: txError } = await supabase
      .from('blockchain_transactions')
      .insert({
        transaction_hash: transactionHash,
        block_number: blockNumber,
        confirmations: 1,
        gas_used: gasUsed,
        gas_fee: parseFloat(gasFee),
        status: 'confirmed',
        network: 'polygon',
        from_address: `0x${user.id.replace(/-/g, '').substring(0, 40)}`,
        to_address: '0x742d35Cc6634C0532925a3b8D9b9Fg2Ca1eB0e', // Contract address
        metadata: {
          reportId,
          deviceId: deviceData.deviceId,
          type: 'lost_found_anchor',
          reportType: deviceData.reportType,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (txError) {
      console.error('Failed to store blockchain transaction:', txError)
      throw new Error('Failed to store blockchain transaction')
    }

    // Step 4: Update report with blockchain reference
    const { error: updateError } = await supabase
      .from('lost_found_reports')
      .update({
        blockchain_tx_hash: transactionHash,
        blockchain_anchored: true,
        blockchain_anchored_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (updateError) {
      console.error('Failed to update report:', updateError)
    }

    console.log('✅ Device anchored to blockchain:', transactionHash)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transactionHash,
          blockNumber,
          gasUsed,
          gasFee,
          network: 'polygon',
          blockchainTxId: blockchainTx.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in blockchain-anchor function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper function to generate blockchain transaction
// TODO: Replace with actual blockchain integration (ethers.js, web3.js)
async function generateBlockchainTransaction(deviceData: any): Promise<string> {
  // For now, generate a mock transaction hash
  // In production, this should call actual blockchain network
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2)
  const dataHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(deviceData) + timestamp)
  )
  const hashArray = Array.from(new Uint8Array(dataHash))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `0x${hashHex.substring(0, 64)}`
}



