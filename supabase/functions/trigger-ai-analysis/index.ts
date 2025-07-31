import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting cache (in production, use Redis or similar)
const rateLimitCache = new Map();

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

    const { 
      analysis_type,
      device_id,
      listing_id,
      transaction_id,
      context_data 
    } = await req.json();

    console.log('Triggering AI analysis:', analysis_type, 'by user:', user.id);

    // Input validation
    if (!analysis_type || (!device_id && !listing_id && !transaction_id)) {
      throw new Error('Missing required analysis parameters');
    }

    // Rate limiting check
    const rateLimitKey = `${user.id}_${analysis_type}`;
    const lastRequest = rateLimitCache.get(rateLimitKey);
    const now = Date.now();
    
    if (lastRequest && (now - lastRequest) < 60000) { // 1 minute cooldown
      throw new Error('Rate limit exceeded. Please wait before requesting another analysis.');
    }
    
    rateLimitCache.set(rateLimitKey, now);

    let aiScore;
    let analysisDetails;

    // Check for existing analysis (caching)
    const { data: existingAnalysis } = await supabaseServiceClient
      .from('ai_scores')
      .select('*')
      .eq('device_id', device_id || null)
      .eq('listing_id', listing_id || null)
      .eq('transaction_id', transaction_id || null)
      .eq('analysis_type', analysis_type)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24h cache
      .single();

    if (existingAnalysis) {
      console.log('Using cached AI analysis:', existingAnalysis.id);
      return new Response(JSON.stringify({ 
        success: true, 
        analysis_id: existingAnalysis.id,
        confidence_score: existingAnalysis.confidence_score,
        risk_factors: existingAnalysis.risk_factors,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Perform AI analysis based on type
    switch (analysis_type) {
      case 'device_registration':
        ({ aiScore, analysisDetails } = await analyzeDeviceRegistration(supabaseServiceClient, device_id, context_data));
        break;
      
      case 'marketplace_listing':
        ({ aiScore, analysisDetails } = await analyzeMarketplaceListing(supabaseServiceClient, listing_id, context_data));
        break;
      
      case 'transaction_fraud':
        ({ aiScore, analysisDetails } = await analyzeTransactionFraud(supabaseServiceClient, transaction_id, context_data));
        break;
      
      case 'ownership_verification':
        ({ aiScore, analysisDetails } = await analyzeOwnershipVerification(supabaseServiceClient, device_id, context_data));
        break;
      
      default:
        throw new Error('Invalid analysis type');
    }

    // Store AI analysis results
    const { data: analysis, error: analysisError } = await supabaseServiceClient
      .from('ai_scores')
      .insert({
        device_id,
        listing_id,
        transaction_id,
        analysis_type,
        confidence_score: aiScore,
        risk_factors: analysisDetails.riskFactors,
        recommendation: analysisDetails.recommendation,
        model_version: 'gemini-1.5-pro',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Failed to store AI analysis:', analysisError);
      throw new Error('Failed to store analysis results');
    }

    console.log('AI analysis completed:', analysis.id);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis_id: analysis.id,
      confidence_score: aiScore,
      risk_factors: analysisDetails.riskFactors,
      recommendation: analysisDetails.recommendation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in trigger-ai-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeDeviceRegistration(supabase: any, device_id: string, context: any) {
  // Get device details
  const { data: device } = await supabase
    .from('devices')
    .select('*')
    .eq('id', device_id)
    .single();

  // TODO: Integrate with Gemini AI API
  // const geminiResponse = await callGeminiAPI({
  //   prompt: `Analyze device registration for fraud detection:
  //     Device: ${device.brand} ${device.model}
  //     Serial: ${device.serial_number}
  //     Purchase Price: ${device.purchase_price}
  //     Purchase Date: ${device.purchase_date}
  //     Location: ${device.purchase_location}
  //     Context: ${JSON.stringify(context)}
  //     
  //     Assess likelihood of fraudulent registration (0-100).`,
  //   model: 'gemini-1.5-pro'
  // });

  // Mock AI analysis (replace with actual Gemini API call)
  const mockAnalysis = {
    confidenceScore: 85,
    riskFactors: [
      device.purchase_price > 1000 ? 'High value device' : null,
      !device.receipt_image_url ? 'No receipt provided' : null,
      !device.device_photos?.length ? 'No device photos' : null
    ].filter(Boolean),
    recommendation: 'APPROVE'
  };

  return {
    aiScore: mockAnalysis.confidenceScore,
    analysisDetails: {
      riskFactors: mockAnalysis.riskFactors,
      recommendation: mockAnalysis.recommendation
    }
  };
}

async function analyzeMarketplaceListing(supabase: any, listing_id: string, context: any) {
  // Get listing and device details
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select(`
      *,
      devices(*)
    `)
    .eq('id', listing_id)
    .single();

  // TODO: Integrate with Gemini AI API for listing analysis
  // const geminiResponse = await callGeminiAPI({
  //   prompt: `Analyze marketplace listing for fraud/trust scoring:
  //     Device: ${listing.devices.brand} ${listing.devices.model}
  //     Listed Price: ${listing.price}
  //     Original Price: ${listing.devices.purchase_price}
  //     Condition: ${listing.condition}
  //     Description: ${listing.description}
  //     Seller History: ${JSON.stringify(context.sellerHistory)}
  //     
  //     Calculate trust/confidence score (0-100).`,
  //   model: 'gemini-1.5-pro'
  // });

  // Mock AI analysis
  const priceRatio = listing.price / (listing.devices.purchase_price || listing.price);
  const mockAnalysis = {
    confidenceScore: Math.min(95, 60 + (priceRatio < 0.5 ? 20 : 0) + (listing.warranty_info ? 15 : 0)),
    riskFactors: [
      priceRatio < 0.3 ? 'Unusually low price' : null,
      !listing.warranty_info ? 'No warranty information' : null,
      listing.condition === 'poor' ? 'Poor condition reported' : null
    ].filter(Boolean),
    recommendation: priceRatio < 0.3 ? 'REVIEW_REQUIRED' : 'APPROVE'
  };

  return {
    aiScore: mockAnalysis.confidenceScore,
    analysisDetails: {
      riskFactors: mockAnalysis.riskFactors,
      recommendation: mockAnalysis.recommendation
    }
  };
}

async function analyzeTransactionFraud(supabase: any, transaction_id: string, context: any) {
  // Get transaction details
  const { data: transaction } = await supabase
    .from('transactions')
    .select(`
      *,
      sender_wallet:wallets!sender_wallet_id(*),
      recipient_wallet:wallets!recipient_wallet_id(*)
    `)
    .eq('id', transaction_id)
    .single();

  // TODO: Integrate with Gemini AI API for fraud detection
  // const geminiResponse = await callGeminiAPI({
  //   prompt: `Analyze transaction for fraud detection:
  //     Amount: ${transaction.amount}
  //     Type: ${transaction.transaction_type}
  //     Sender Balance: ${transaction.sender_wallet.available_balance}
  //     Transaction History: ${JSON.stringify(context.transactionHistory)}
  //     
  //     Assess fraud probability (0-100).`,
  //   model: 'gemini-1.5-pro'
  // });

  // Mock AI analysis
  const mockAnalysis = {
    confidenceScore: 75,
    riskFactors: [
      transaction.amount > 5000 ? 'High value transaction' : null,
      context.transactionHistory?.length < 3 ? 'Limited transaction history' : null
    ].filter(Boolean),
    recommendation: 'APPROVE'
  };

  return {
    aiScore: mockAnalysis.confidenceScore,
    analysisDetails: {
      riskFactors: mockAnalysis.riskFactors,
      recommendation: mockAnalysis.recommendation
    }
  };
}

async function analyzeOwnershipVerification(supabase: any, device_id: string, context: any) {
  // Get ownership history
  const { data: ownership } = await supabase
    .from('ownership_history')
    .select('*')
    .eq('device_id', device_id)
    .order('transfer_date', { ascending: false });

  // TODO: Integrate with Gemini AI API
  // const geminiResponse = await callGeminiAPI({
  //   prompt: `Verify ownership authenticity:
  //     Ownership History: ${JSON.stringify(ownership)}
  //     Verification Context: ${JSON.stringify(context)}
  //     
  //     Calculate ownership verification confidence (0-100).`,
  //   model: 'gemini-1.5-pro'
  // });

  // Mock AI analysis
  const mockAnalysis = {
    confidenceScore: 90,
    riskFactors: [
      ownership.length > 5 ? 'Multiple previous owners' : null,
      !ownership[0]?.blockchain_tx_id ? 'Missing blockchain verification' : null
    ].filter(Boolean),
    recommendation: 'VERIFIED'
  };

  return {
    aiScore: mockAnalysis.confidenceScore,
    analysisDetails: {
      riskFactors: mockAnalysis.riskFactors,
      recommendation: mockAnalysis.recommendation
    }
  };
}

// TODO: Implement actual Gemini API integration
// async function callGeminiAPI(params: any) {
//   const apiKey = Deno.env.get('GEMINI_API_KEY');
//   if (!apiKey) {
//     throw new Error('Gemini API key not configured');
//   }
//   
//   const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${apiKey}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       contents: [{
//         parts: [{ text: params.prompt }]
//       }]
//     })
//   });
//   
//   return await response.json();
// }