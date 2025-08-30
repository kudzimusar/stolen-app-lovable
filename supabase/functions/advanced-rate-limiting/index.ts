import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitConfig {
  user_id: string;
  endpoint: string;
  action: string;
  user_role: string;
  risk_level: string;
  transaction_type?: string;
  amount?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining_requests: number;
  reset_time: number;
  limit_type: string;
  cooldown_period?: number;
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
      case 'check_rate_limit':
        return await checkRateLimit(supabase, params, user.id)
      
      case 'update_rate_limit':
        return await updateRateLimit(supabase, params, user.id)
      
      case 'get_rate_limit_status':
        return await getRateLimitStatus(supabase, user.id)
      
      case 'reset_rate_limit':
        return await resetRateLimit(supabase, params, user.id)
      
      case 'update_rate_limit_config':
        return await updateRateLimitConfig(supabase, params, user.id)
      
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

async function checkRateLimit(supabase: any, params: any, user_id: string): Promise<Response> {
  const { endpoint, action, transaction_type, amount } = params

  // Get user role and risk level
  const userProfile = await getUserProfile(supabase, user_id)
  
  // Get rate limit configuration
  const rateLimitConfig = await getRateLimitConfiguration(supabase, {
    user_id,
    endpoint,
    action,
    user_role: userProfile.role,
    risk_level: userProfile.risk_level,
    transaction_type,
    amount
  })

  // Check current usage
  const currentUsage = await getCurrentUsage(supabase, user_id, rateLimitConfig)

  // Apply rate limiting rules
  const result = applyRateLimitRules(currentUsage, rateLimitConfig, userProfile)

  // Log rate limit check
  await logRateLimitCheck(supabase, {
    user_id,
    endpoint,
    action,
    allowed: result.allowed,
    remaining_requests: result.remaining_requests,
    limit_type: result.limit_type
  })

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: result 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateRateLimit(supabase: any, params: any, user_id: string): Promise<Response> {
  const { endpoint, action, success } = params

  // Update usage count
  await updateUsageCount(supabase, user_id, endpoint, action, success)

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Rate limit updated' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getRateLimitStatus(supabase: any, user_id: string): Promise<Response> {
  // Get user's current rate limit status across all endpoints
  const { data: rateLimits, error } = await supabase
    .from('rate_limit_usage')
    .select('*')
    .eq('user_id', user_id)
    .gte('window_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  if (error) {
    throw new Error('Failed to fetch rate limit status')
  }

  // Get user profile
  const userProfile = await getUserProfile(supabase, user_id)

  // Calculate status for each endpoint
  const status = rateLimits?.map((limit: any) => {
    const config = getDefaultRateLimitConfig(userProfile.role, userProfile.risk_level)
    return {
      endpoint: limit.endpoint,
      action: limit.action,
      current_usage: limit.request_count,
      limit: config.limit,
      remaining: Math.max(0, config.limit - limit.request_count),
      reset_time: new Date(limit.window_start).getTime() + config.window_ms,
      window_type: config.window_type
    }
  }) || []

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        user_id: user_id,
        role: userProfile.role,
        risk_level: userProfile.risk_level,
        rate_limits: status
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function resetRateLimit(supabase: any, params: any, user_id: string): Promise<Response> {
  const { endpoint, action } = params

  // Check if user has admin privileges
  const userProfile = await getUserProfile(supabase, user_id)
  if (userProfile.role !== 'platform_admin') {
    throw new Error('Unauthorized: Admin privileges required')
  }

  // Reset rate limit for specified endpoint
  await supabase
    .from('rate_limit_usage')
    .delete()
    .eq('user_id', user_id)
    .eq('endpoint', endpoint)
    .eq('action', action)

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Rate limit reset successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateRateLimitConfig(supabase: any, params: any, user_id: string): Promise<Response> {
  const { config } = params

  // Check if user has admin privileges
  const userProfile = await getUserProfile(supabase, user_id)
  if (userProfile.role !== 'platform_admin') {
    throw new Error('Unauthorized: Admin privileges required')
  }

  // Update rate limit configuration
  await supabase
    .from('rate_limit_config')
    .upsert({
      id: 'default',
      config: config,
      updated_by: user_id,
      updated_at: new Date().toISOString()
    })

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Rate limit configuration updated' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getUserProfile(supabase: any, user_id: string) {
  // Get user role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user_id)
    .single()

  // Get user risk level
  const { data: riskProfile } = await supabase
    .from('user_risk_profiles')
    .select('risk_level')
    .eq('user_id', user_id)
    .single()

  return {
    role: userRole?.role || 'individual',
    risk_level: riskProfile?.risk_level || 'medium'
  }
}

async function getRateLimitConfiguration(supabase: any, config: RateLimitConfig) {
  // Get custom rate limit configuration
  const { data: customConfig } = await supabase
    .from('rate_limit_config')
    .select('config')
    .eq('id', 'default')
    .single()

  if (customConfig?.config) {
    return getCustomRateLimitConfig(config, customConfig.config)
  }

  // Return default configuration
  return getDefaultRateLimitConfig(config.user_role, config.risk_level, config.endpoint, config.action)
}

function getDefaultRateLimitConfig(userRole: string, riskLevel: string, endpoint?: string, action?: string) {
  // Base limits by user role
  const baseLimits = {
    individual: { limit: 100, window_ms: 60 * 60 * 1000 }, // 100 requests per hour
    retailer: { limit: 500, window_ms: 60 * 60 * 1000 }, // 500 requests per hour
    repair_shop: { limit: 300, window_ms: 60 * 60 * 1000 }, // 300 requests per hour
    insurance: { limit: 1000, window_ms: 60 * 60 * 1000 }, // 1000 requests per hour
    law_enforcement: { limit: 200, window_ms: 60 * 60 * 1000 }, // 200 requests per hour
    ngo: { limit: 200, window_ms: 60 * 60 * 1000 }, // 200 requests per hour
    platform_admin: { limit: 10000, window_ms: 60 * 60 * 1000 }, // 10000 requests per hour
    payment_gateway: { limit: 5000, window_ms: 60 * 60 * 1000 } // 5000 requests per hour
  }

  // Risk level adjustments
  const riskAdjustments = {
    low: 1.5, // 50% increase for low risk
    medium: 1.0, // No adjustment for medium risk
    high: 0.5, // 50% decrease for high risk
    critical: 0.25 // 75% decrease for critical risk
  }

  // Endpoint-specific adjustments
  const endpointAdjustments: { [key: string]: number } = {
    's-pay-enhanced': 1.0,
    'ai-fraud-detection': 0.5, // More restrictive for fraud detection
    'mfa-authentication': 0.3, // Very restrictive for MFA
    'real-time-verification': 0.2, // Very restrictive for verification
    'advanced-rate-limiting': 0.1 // Extremely restrictive for rate limiting
  }

  // Action-specific adjustments
  const actionAdjustments: { [key: string]: number } = {
    'initiate_transfer': 0.8, // More restrictive for transfers
    'initiate_withdrawal': 0.5, // Very restrictive for withdrawals
    'analyze_transaction': 0.6, // Restrictive for fraud analysis
    'verify_sa_id': 0.3, // Very restrictive for ID verification
    'setup_mfa': 0.2 // Extremely restrictive for MFA setup
  }

  const baseLimit = baseLimits[userRole as keyof typeof baseLimits] || baseLimits.individual
  const riskAdjustment = riskAdjustments[riskLevel as keyof typeof riskAdjustments] || 1.0
  const endpointAdjustment = endpointAdjustments[endpoint || ''] || 1.0
  const actionAdjustment = actionAdjustments[action || ''] || 1.0

  const adjustedLimit = Math.floor(baseLimit.limit * riskAdjustment * endpointAdjustment * actionAdjustment)

  return {
    limit: Math.max(1, adjustedLimit), // Minimum 1 request
    window_ms: baseLimit.window_ms,
    window_type: 'sliding',
    cooldown_period: getCooldownPeriod(userRole, riskLevel, endpoint, action)
  }
}

function getCustomRateLimitConfig(config: RateLimitConfig, customConfig: any) {
  // Apply custom configuration rules
  const customRules = customConfig.rules || []
  
  for (const rule of customRules) {
    if (matchesRule(config, rule)) {
      return {
        limit: rule.limit,
        window_ms: rule.window_ms,
        window_type: rule.window_type || 'sliding',
        cooldown_period: rule.cooldown_period
      }
    }
  }

  // Fall back to default configuration
  return getDefaultRateLimitConfig(config.user_role, config.risk_level, config.endpoint, config.action)
}

function matchesRule(config: RateLimitConfig, rule: any): boolean {
  if (rule.user_role && rule.user_role !== config.user_role) return false
  if (rule.risk_level && rule.risk_level !== config.risk_level) return false
  if (rule.endpoint && rule.endpoint !== config.endpoint) return false
  if (rule.action && rule.action !== config.action) return false
  if (rule.transaction_type && rule.transaction_type !== config.transaction_type) return false
  if (rule.min_amount && config.amount && config.amount < rule.min_amount) return false
  if (rule.max_amount && config.amount && config.amount > rule.max_amount) return false
  
  return true
}

function getCooldownPeriod(userRole: string, riskLevel: string, endpoint?: string, action?: string): number {
  // Base cooldown periods
  const baseCooldowns = {
    individual: 0,
    retailer: 0,
    repair_shop: 0,
    insurance: 0,
    law_enforcement: 0,
    ngo: 0,
    platform_admin: 0,
    payment_gateway: 0
  }

  // Risk level adjustments
  const riskCooldowns = {
    low: 0,
    medium: 5 * 60 * 1000, // 5 minutes
    high: 15 * 60 * 1000, // 15 minutes
    critical: 60 * 60 * 1000 // 1 hour
  }

  // Endpoint-specific cooldowns
  const endpointCooldowns: { [key: string]: number } = {
    'mfa-authentication': 30 * 60 * 1000, // 30 minutes for MFA
    'real-time-verification': 60 * 60 * 1000, // 1 hour for verification
    'ai-fraud-detection': 10 * 60 * 1000 // 10 minutes for fraud detection
  }

  // Action-specific cooldowns
  const actionCooldowns: { [key: string]: number } = {
    'initiate_withdrawal': 30 * 60 * 1000, // 30 minutes for withdrawals
    'verify_sa_id': 60 * 60 * 1000, // 1 hour for ID verification
    'setup_mfa': 60 * 60 * 1000 // 1 hour for MFA setup
  }

  const baseCooldown = baseCooldowns[userRole as keyof typeof baseCooldowns] || 0
  const riskCooldown = riskCooldowns[riskLevel as keyof typeof riskCooldowns] || 0
  const endpointCooldown = endpointCooldowns[endpoint || ''] || 0
  const actionCooldown = actionCooldowns[action || ''] || 0

  return Math.max(baseCooldown, riskCooldown, endpointCooldown, actionCooldown)
}

async function getCurrentUsage(supabase: any, user_id: string, config: any) {
  const windowStart = new Date(Date.now() - config.window_ms).toISOString()

  const { data: usage, error } = await supabase
    .from('rate_limit_usage')
    .select('*')
    .eq('user_id', user_id)
    .gte('window_start', windowStart)

  if (error) {
    throw new Error('Failed to get current usage')
  }

  return {
    request_count: usage?.length || 0,
    window_start: windowStart,
    window_end: new Date().toISOString()
  }
}

function applyRateLimitRules(currentUsage: any, config: any, userProfile: any): RateLimitResult {
  const remaining = Math.max(0, config.limit - currentUsage.request_count)
  const allowed = remaining > 0

  // Check cooldown period
  let cooldownPeriod = 0
  if (!allowed && config.cooldown_period) {
    cooldownPeriod = config.cooldown_period
  }

  return {
    allowed,
    remaining_requests: remaining,
    reset_time: new Date(currentUsage.window_start).getTime() + config.window_ms,
    limit_type: `${config.limit} requests per ${config.window_ms / (60 * 1000)} minutes`,
    cooldown_period: cooldownPeriod
  }
}

async function updateUsageCount(supabase: any, user_id: string, endpoint: string, action: string, success: boolean) {
  const windowStart = new Date().toISOString()

  await supabase
    .from('rate_limit_usage')
    .insert({
      user_id: user_id,
      endpoint: endpoint,
      action: action,
      window_start: windowStart,
      success: success,
      created_at: new Date().toISOString()
    })
}

async function logRateLimitCheck(supabase: any, data: any) {
  await supabase
    .from('rate_limit_logs')
    .insert({
      user_id: data.user_id,
      endpoint: data.endpoint,
      action: data.action,
      allowed: data.allowed,
      remaining_requests: data.remaining_requests,
      limit_type: data.limit_type,
      created_at: new Date().toISOString()
    })
}
