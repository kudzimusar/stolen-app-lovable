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
      case 'analyze_transaction':
        return await analyzeTransaction(supabase, params, user.id)
      
      case 'get_user_risk_profile':
        return await getUserRiskProfile(supabase, params, user.id)
      
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

async function analyzeTransaction(supabase: any, params: any, admin_user_id: string): Promise<Response> {
  const { user_id, transaction_type, amount, recipient_id, device_info } = params

  // Get user's historical data
  const userProfile = await getUserHistoricalData(supabase, user_id)
  
  // Get transaction patterns
  const transactionPatterns = await analyzeTransactionPatterns(supabase, user_id)
  
  // Get device analysis
  const deviceAnalysis = await analyzeDeviceAndLocation(supabase, user_id, device_info)
  
  // Get amount analysis
  const amountAnalysis = await analyzeAmountPatterns(supabase, user_id, amount, transaction_type)
  
  // Get recipient analysis
  const recipientAnalysis = await analyzeRecipient(supabase, user_id, recipient_id)
  
  // Enhanced fraud detection with Gemini AI
  const geminiAnalysis = await performGeminiFraudAnalysis({
    userProfile,
    transactionPatterns,
    deviceAnalysis,
    amountAnalysis,
    recipientAnalysis,
    transaction_type,
    amount,
    user_id,
    recipient_id,
    device_info
  });

  const fraudScore = geminiAnalysis.fraudScore || calculateFraudScore({
    userProfile,
    transactionPatterns,
    deviceAnalysis,
    amountAnalysis,
    recipientAnalysis,
    transaction_type,
    amount
  });

  // Determine risk level and recommendations
  const result = {
    fraud_score: fraudScore,
    risk_level: getRiskLevel(fraudScore),
    risk_factors: identifyRiskFactors({
      userProfile,
      transactionPatterns,
      deviceAnalysis,
      amountAnalysis,
      recipientAnalysis
    }),
    recommendations: generateRecommendations(fraudScore, {
      userProfile,
      transactionPatterns,
      deviceAnalysis,
      amountAnalysis,
      recipientAnalysis
    }),
    should_block: fraudScore > 85,
    requires_review: fraudScore > 70,
    confidence: calculateConfidence({
      userProfile,
      transactionPatterns,
      deviceAnalysis,
      amountAnalysis,
      recipientAnalysis
    })
  }

  // Log fraud analysis
  await logFraudAnalysis(supabase, {
    user_id,
    transaction_type,
    amount,
    fraud_score: fraudScore,
    risk_level: result.risk_level,
    risk_factors: result.risk_factors
  })

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: result 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getUserHistoricalData(supabase: any, user_id: string) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('from_user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single()

  const { data: ficaStatus } = await supabase
    .from('fica_verifications')
    .select('*')
    .eq('user_id', user_id)

  const { data: disputes } = await supabase
    .from('transaction_disputes')
    .select('*')
    .eq('user_id', user_id)

  return {
    total_transactions: transactions?.length || 0,
    total_volume: transactions?.reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0,
    average_transaction: transactions?.length > 0 ? 
      transactions.reduce((sum: number, tx: any) => sum + tx.amount, 0) / transactions.length : 0,
    account_age: wallet?.created_at ? 
      Math.floor((Date.now() - new Date(wallet.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    fica_verified: ficaStatus?.some((doc: any) => doc.verification_status === 'approved') || false,
    dispute_count: disputes?.length || 0,
    wallet_balance: wallet?.available_balance || 0,
    is_verified: wallet?.is_verified || false
  }
}

async function analyzeTransactionPatterns(supabase: any, user_id: string) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('from_user_id', user_id)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (!transactions || transactions.length === 0) {
    return { recent_transaction_count: 0, unusual_patterns: [] }
  }

  const anomalies: string[] = []

  // Check for rapid transactions
  const rapidTransactions = transactions.filter((tx, index) => {
    if (index === 0) return false
    const timeDiff = new Date(tx.created_at).getTime() - new Date(transactions[index - 1].created_at).getTime()
    return timeDiff < 5 * 60 * 1000
  })

  if (rapidTransactions.length > 3) {
    anomalies.push('high_transaction_velocity')
  }

  // Check for unusual amounts
  const amounts = transactions.map(tx => tx.amount)
  const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length
  const stdDev = Math.sqrt(variance)
  
  const unusualAmounts = amounts.filter(amount => Math.abs(amount - mean) > 2 * stdDev)
  if (unusualAmounts.length > amounts.length * 0.2) {
    anomalies.push('unusual_amount_patterns')
  }

  return { recent_transaction_count: transactions.length, unusual_patterns: anomalies }
}

async function analyzeDeviceAndLocation(supabase: any, user_id: string, device_info?: any) {
  if (!device_info) {
    return { risk_score: 0, anomalies: [] }
  }

  const anomalies: string[] = []
  let risk_score = 0

  // Check for suspicious user agent
  if (device_info.user_agent) {
    const suspiciousPatterns = ['bot', 'crawler', 'spider', 'scraper', 'headless']
    const isSuspicious = suspiciousPatterns.some(pattern => 
      device_info.user_agent.toLowerCase().includes(pattern)
    )

    if (isSuspicious) {
      anomalies.push('suspicious_user_agent')
      risk_score += 25
    }
  }

  return { risk_score, anomalies }
}

async function analyzeAmountPatterns(supabase: any, user_id: string, amount: number, transaction_type: string) {
  const anomalies: string[] = []
  let risk_score = 0

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('from_user_id', user_id)
    .eq('transaction_type', transaction_type)
    .order('created_at', { ascending: false })
    .limit(20)

  if (transactions && transactions.length > 0) {
    const amounts = transactions.map(tx => tx.amount)
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    const stdDev = Math.sqrt(
      amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length
    )

    if (Math.abs(amount - mean) > 3 * stdDev) {
      anomalies.push('unusual_amount_for_user')
      risk_score += 20
    }
  }

  if (amount > 50000) {
    anomalies.push('very_large_amount')
    risk_score += 15
  }

  return { risk_score, anomalies }
}

async function analyzeRecipient(supabase: any, user_id: string, recipient_id?: string) {
  if (!recipient_id) {
    return { risk_score: 0, anomalies: [] }
  }

  const anomalies: string[] = []
  let risk_score = 0

  const { data: previousTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('from_user_id', user_id)
    .eq('to_user_id', recipient_id)

  if (!previousTransactions || previousTransactions.length === 0) {
    anomalies.push('new_recipient')
    risk_score += 10
  }

  const { data: recipientWallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', recipient_id)
    .single()

  if (recipientWallet && !recipientWallet.is_verified) {
    anomalies.push('unverified_recipient')
    risk_score += 15
  }

  return { risk_score, anomalies }
}

function calculateFraudScore(analysis: any): number {
  let score = 0

  if (!analysis.userProfile.fica_verified) score += 20
  if (analysis.userProfile.dispute_count > 2) score += 15
  if (analysis.userProfile.account_age < 7) score += 10

  score += analysis.transactionPatterns.unusual_patterns.length * 5
  score += analysis.deviceAnalysis.risk_score
  score += analysis.amountAnalysis.risk_score
  score += analysis.recipientAnalysis.risk_score

  return Math.min(100, Math.max(0, score))
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 30) return 'low'
  if (score < 50) return 'medium'
  if (score < 80) return 'high'
  return 'critical'
}

function identifyRiskFactors(analysis: any): string[] {
  const factors: string[] = []

  if (!analysis.userProfile.fica_verified) factors.push('user_not_fica_verified')
  if (analysis.userProfile.dispute_count > 2) factors.push('high_dispute_history')
  if (analysis.userProfile.account_age < 7) factors.push('new_account')
  
  factors.push(...analysis.transactionPatterns.unusual_patterns)
  factors.push(...analysis.deviceAnalysis.anomalies)
  factors.push(...analysis.amountAnalysis.anomalies)
  factors.push(...analysis.recipientAnalysis.anomalies)

  return [...new Set(factors)]
}

function generateRecommendations(score: number, analysis: any): string[] {
  const recommendations: string[] = []

  if (score > 70) {
    recommendations.push('Requires manual review before processing')
    recommendations.push('Consider additional verification steps')
  }

  if (score > 50) {
    recommendations.push('Monitor transaction closely')
  }

  if (!analysis.userProfile.fica_verified) {
    recommendations.push('Complete FICA verification')
  }

  return recommendations
}

function calculateConfidence(analysis: any): number {
  let confidence = 100

  if (analysis.userProfile.total_transactions < 5) confidence -= 20
  if (analysis.userProfile.account_age < 1) confidence -= 15

  return Math.max(50, confidence)
}

async function logFraudAnalysis(supabase: any, data: any) {
  await supabase
    .from('fraud_analysis_logs')
    .insert({
      user_id: data.user_id,
      transaction_type: data.transaction_type,
      amount: data.amount,
      fraud_score: data.fraud_score,
      risk_level: data.risk_level,
      risk_factors: data.risk_factors,
      created_at: new Date().toISOString()
    })
}

async function getUserRiskProfile(supabase: any, params: any, user_id: string): Promise<Response> {
  const { target_user_id } = params

  const userProfile = await getUserHistoricalData(supabase, target_user_id)
  const transactionPatterns = await analyzeTransactionPatterns(supabase, target_user_id)

  const riskProfile = {
    user_id: target_user_id,
    risk_score: calculateUserRiskScore(userProfile, transactionPatterns),
    risk_factors: identifyUserRiskFactors(userProfile, transactionPatterns),
    recommendations: generateUserRecommendations(userProfile, transactionPatterns),
    last_updated: new Date().toISOString()
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: riskProfile 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function calculateUserRiskScore(userProfile: any, transactionPatterns: any): number {
  let score = 0

  if (!userProfile.fica_verified) score += 25
  if (userProfile.dispute_count > 2) score += 20
  if (userProfile.account_age < 7) score += 15
  if (userProfile.total_transactions < 5) score += 10

  score += transactionPatterns.unusual_patterns.length * 5

  return Math.min(100, Math.max(0, score))
}

function identifyUserRiskFactors(userProfile: any, transactionPatterns: any): string[] {
  const factors: string[] = []

  if (!userProfile.fica_verified) factors.push('not_fica_verified')
  if (userProfile.dispute_count > 2) factors.push('high_disputes')
  if (userProfile.account_age < 7) factors.push('new_account')
  if (userProfile.total_transactions < 5) factors.push('low_activity')

  factors.push(...transactionPatterns.unusual_patterns)

  return factors
}

function generateUserRecommendations(userProfile: any, transactionPatterns: any): string[] {
  const recommendations: string[] = []

  if (!userProfile.fica_verified) {
    recommendations.push('Complete FICA verification to reduce risk score')
  }

  if (userProfile.dispute_count > 2) {
    recommendations.push('Review and resolve outstanding disputes')
  }

  if (userProfile.account_age < 7) {
    recommendations.push('Build transaction history to establish trust')
  }

  return recommendations
}


async function performGeminiFraudAnalysis(data: any): Promise<any> {
  try {
    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    const apiKey = 'AIzaSyCH3m-j0qTrOGxiDZw1IQ628e5_BjgePNY';
    
    const prompt = `
Analyze this transaction for fraud on STOLEN platform:
Transaction Data: ${JSON.stringify(data)}
User Profile: ${JSON.stringify(data.userProfile)}
Device Info: ${JSON.stringify(data.device_info)}
Transaction Type: ${data.transaction_type}
Amount: ${data.amount}

Provide JSON response:
{
  "fraudScore": 0-100,
  "riskLevel": "low|medium|high|critical",
  "riskFactors": ["factor1"],
  "recommendations": ["rec1"],
  "confidence": 0.0-1.0,
  "aiInsights": "analysis"
}
    `;

    const response = await fetch(`${geminiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
    }

    return {
      fraudScore: 50,
      riskLevel: 'medium',
      riskFactors: ['Insufficient data'],
      recommendations: ['Manual review'],
      confidence: 0.5,
      aiInsights: 'Fallback analysis'
    };
  } catch (error) {
    console.error('Gemini fraud analysis error:', error);
    return {
      fraudScore: 50,
      riskLevel: 'medium',
      riskFactors: ['API unavailable'],
      recommendations: ['Manual review'],
      confidence: 0.3,
      aiInsights: 'Fallback analysis due to API error'
    };
  }
}
