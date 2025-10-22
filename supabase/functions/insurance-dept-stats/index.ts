import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Authorization header missing")
    }
    const token = authHeader.replace("Bearer ", "")
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error("User not authenticated")
    }

    console.log("🛡️ Insurance Department Stats - User:", user.id)

    // Get insurance department statistics
    const { data: insuranceStats, error: insuranceError } = await supabaseClient
      .from('insurance_admin_stats')
      .select('*')
      .eq('insurance_id', user.id)
      .single()

    if (insuranceError && insuranceError.code !== 'PGRST116') {
      console.error('Error fetching insurance stats:', insuranceError)
      throw new Error('Failed to fetch insurance statistics')
    }

    // Get recent policies
    const { data: policies, error: policiesError } = await supabaseClient
      .from('insurance_policies')
      .select(`
        id, policy_number, policy_type, coverage_type, coverage_limit,
        premium_amount, status, start_date, end_date, created_at,
        devices!inner(id, brand, model, serial_number),
        users!insurance_policies_policyholder_id_fkey(id, display_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (policiesError) {
      console.error('Error fetching policies:', policiesError)
    }

    // Get recent claims
    const { data: claims, error: claimsError } = await supabaseClient
      .from('insurance_claims')
      .select(`
        id, claim_number, incident_type, claim_amount, approved_amount,
        status, submission_date, review_date, created_at,
        devices!inner(id, brand, model, serial_number),
        users!insurance_claims_claimant_id_fkey(id, display_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (claimsError) {
      console.error('Error fetching claims:', claimsError)
    }

    // Get policies by status
    const { data: policiesByStatus, error: policiesStatusError } = await supabaseClient
      .from('insurance_policies')
      .select('status')
      .eq('provider_id', user.id)

    if (policiesStatusError) {
      console.error('Error fetching policies by status:', policiesStatusError)
    }

    // Get claims by status
    const { data: claimsByStatus, error: claimsStatusError } = await supabaseClient
      .from('insurance_claims')
      .select('status')
      .eq('insurance_provider_id', user.id)

    if (claimsStatusError) {
      console.error('Error fetching claims by status:', claimsStatusError)
    }

    // Calculate additional metrics
    const policyStatusCounts = policiesByStatus?.reduce((acc, policy) => {
      acc[policy.status] = (acc[policy.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const claimStatusCounts = claimsByStatus?.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const stats = {
      // Basic stats from view
      total_policies: insuranceStats?.total_policies || 0,
      active_policies: insuranceStats?.active_policies || 0,
      total_claims: insuranceStats?.total_claims || 0,
      pending_claims: insuranceStats?.pending_claims || 0,
      approved_claims: insuranceStats?.approved_claims || 0,
      total_payouts: insuranceStats?.total_payouts || 0,
      claims_last_30_days: insuranceStats?.claims_last_30_days || 0,
      
      // Status breakdowns
      policy_status_breakdown: policyStatusCounts,
      claim_status_breakdown: claimStatusCounts,
      
      // Recent data
      recent_policies: policies || [],
      recent_claims: claims || [],
      
      // Performance indicators
      claim_approval_rate: insuranceStats?.total_claims > 0 
        ? Math.round((insuranceStats.approved_claims / insuranceStats.total_claims) * 100)
        : 0,
      
      average_claim_amount: claims?.length > 0
        ? Math.round(claims.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0) / claims.length)
        : 0,
      
      average_premium: policies?.length > 0
        ? Math.round(policies.reduce((sum, policy) => sum + (policy.premium_amount || 0), 0) / policies.length)
        : 0,
      
      // Time-based metrics
      policies_this_month: policies?.filter(policy => 
        new Date(policy.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )?.length || 0,
      
      claims_this_month: claims?.filter(claim => 
        new Date(claim.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )?.length || 0,
      
      // Risk metrics
      high_value_claims: claims?.filter(claim => claim.claim_amount > 1000)?.length || 0,
      fraud_alerts: claims?.filter(claim => 
        claim.incident_type === 'theft' && claim.claim_amount > 2000
      )?.length || 0,
      
      // Financial metrics
      total_premiums_collected: policies?.filter(policy => 
        policy.status === 'active'
      ).reduce((sum, policy) => sum + (policy.premium_amount || 0), 0) || 0,
      
      outstanding_claims_value: claims?.filter(claim => 
        claim.status === 'pending' || claim.status === 'under_review'
      ).reduce((sum, claim) => sum + (claim.claim_amount || 0), 0) || 0
    }

    console.log('✅ Insurance stats fetched successfully:', stats)

    return new Response(
      JSON.stringify({
        success: true,
        data: stats,
        department: 'insurance',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Insurance stats error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        department: 'insurance'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
