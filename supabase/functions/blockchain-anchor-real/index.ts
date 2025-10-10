// REAL Blockchain Anchor Edge Function using Polygon
// This version actually calls the smart contract on Polygon network

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ethers } from 'https://esm.sh/ethers@6.7.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Device Registry Contract ABI (only the functions we need)
const DEVICE_REGISTRY_ABI = [
  "function registerDevice(string memory _deviceId, string memory _deviceModel, string memory _deviceBrand) public",
  "function getDevice(string memory _deviceId) public view returns (string memory, string memory, address, uint256, bool)",
  "function isRegistered(string memory _deviceId) public view returns (bool)",
  "event DeviceRegistered(string indexed deviceId, string deviceModel, address indexed owner, uint256 timestamp)"
]

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const PRIVATE_KEY = Deno.env.get('BLOCKCHAIN_PRIVATE_KEY')
    const CONTRACT_ADDRESS = Deno.env.get('DEVICE_REGISTRY_ADDRESS')
    const RPC_URL = Deno.env.get('POLYGON_RPC_URL') || 'https://rpc-mumbai.maticvigil.com'
    
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
      throw new Error('Blockchain configuration missing. Please set BLOCKCHAIN_PRIVATE_KEY and DEVICE_REGISTRY_ADDRESS')
    }

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
    const { reportId, deviceData } = await req.json()

    console.log('🔗 Anchoring device to REAL blockchain:', {
      reportId,
      deviceId: deviceData.deviceId,
      network: RPC_URL.includes('mumbai') ? 'Mumbai Testnet' : 'Polygon Mainnet'
    })

    // Step 1: Connect to Polygon network
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DEVICE_REGISTRY_ABI, wallet)

    console.log('✅ Connected to blockchain')
    console.log('📍 Wallet address:', wallet.address)
    console.log('📍 Contract address:', CONTRACT_ADDRESS)

    // Step 2: Check if device is already registered
    const isRegistered = await contract.isRegistered(deviceData.deviceId)
    if (isRegistered) {
      throw new Error('Device already registered on blockchain')
    }

    // Step 3: Register device on blockchain
    console.log('📝 Sending transaction to blockchain...')
    const tx = await contract.registerDevice(
      deviceData.deviceId,
      deviceData.deviceModel,
      deviceData.deviceBrand
    )

    console.log('⏳ Transaction sent:', tx.hash)
    console.log('⏳ Waiting for confirmation...')

    // Step 4: Wait for transaction confirmation
    const receipt = await tx.wait()

    console.log('✅ Transaction confirmed!')
    console.log('📦 Block number:', receipt.blockNumber)
    console.log('⛽ Gas used:', receipt.gasUsed.toString())

    // Step 5: Calculate gas cost
    const gasPrice = tx.gasPrice
    const gasCost = receipt.gasUsed.mul(gasPrice)
    const gasCostEth = ethers.formatEther(gasCost)

    // Step 6: Store blockchain reference in Supabase
    const { data: blockchainTx, error: txError } = await supabase
      .from('blockchain_transactions')
      .insert({
        transaction_hash: tx.hash,
        block_number: receipt.blockNumber,
        confirmations: 1,
        gas_used: Number(receipt.gasUsed.toString()),
        gas_fee: parseFloat(gasCostEth),
        status: 'confirmed',
        network: RPC_URL.includes('mumbai') ? 'mumbai' : 'polygon',
        from_address: wallet.address,
        to_address: CONTRACT_ADDRESS,
        metadata: {
          reportId,
          deviceId: deviceData.deviceId,
          type: 'lost_found_anchor',
          reportType: deviceData.reportType,
          timestamp: new Date().toISOString(),
          realBlockchain: true
        }
      })
      .select()
      .single()

    if (txError) {
      console.error('Failed to store blockchain transaction:', txError)
      throw new Error('Failed to store blockchain transaction')
    }

    // Step 7: Update report with blockchain reference
    await supabase
      .from('lost_found_reports')
      .update({
        blockchain_tx_hash: tx.hash,
        blockchain_anchored: true,
        blockchain_anchored_at: new Date().toISOString()
      })
      .eq('id', reportId)

    console.log('✅ Device anchored to REAL blockchain:', tx.hash)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: Number(receipt.gasUsed.toString()),
          gasFee: gasCostEth,
          network: RPC_URL.includes('mumbai') ? 'mumbai' : 'polygon',
          blockchainTxId: blockchainTx.id,
          explorerUrl: RPC_URL.includes('mumbai') 
            ? `https://mumbai.polygonscan.com/tx/${tx.hash}`
            : `https://polygonscan.com/tx/${tx.hash}`,
          realBlockchain: true
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
        error: error.message,
        realBlockchain: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})



