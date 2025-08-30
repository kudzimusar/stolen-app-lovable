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
      case 'setup_mfa':
        return await setupMFA(supabase, params, user.id)
      
      case 'verify_mfa':
        return await verifyMFA(supabase, params, user.id)
      
      case 'send_sms_code':
        return await sendSMSCode(supabase, params, user.id)
      
      case 'verify_sms_code':
        return await verifySMSCode(supabase, params, user.id)
      
      case 'get_mfa_status':
        return await getMFAStatus(supabase, user.id)
      
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

async function setupMFA(supabase: any, params: any, user_id: string): Promise<Response> {
  const { mfa_type, phone_number } = params

  // Generate secret for TOTP
  const secret = generateTOTPSecret()
  
  // Generate backup codes
  const backupCodes = generateBackupCodes()

  // Store MFA setup
  const { data: mfaSetup, error } = await supabase
    .from('mfa_setup')
    .insert({
      user_id: user_id,
      mfa_type: mfa_type,
      secret: secret,
      backup_codes: backupCodes,
      phone_number: phone_number,
      is_active: true,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to setup MFA')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        secret: secret,
        backup_codes: backupCodes,
        qr_code_url: generateQRCodeURL(secret, user_id),
        message: 'MFA setup completed. Please verify with a code.'
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function verifyMFA(supabase: any, params: any, user_id: string): Promise<Response> {
  const { code, transaction_id, amount } = params

  // Get MFA setup
  const { data: mfaSetup, error: mfaError } = await supabase
    .from('mfa_setup')
    .select('*')
    .eq('user_id', user_id)
    .eq('is_active', true)
    .single()

  if (mfaError || !mfaSetup) {
    throw new Error('MFA not setup')
  }

  // Verify TOTP code
  const isValidTOTP = verifyTOTPCode(code, mfaSetup.secret)
  
  // Check backup codes
  const isValidBackup = mfaSetup.backup_codes.includes(code)

  if (!isValidTOTP && !isValidBackup) {
    throw new Error('Invalid MFA code')
  }

  // If backup code used, remove it
  if (isValidBackup) {
    const updatedBackupCodes = mfaSetup.backup_codes.filter((c: string) => c !== code)
    await supabase
      .from('mfa_setup')
      .update({ backup_codes: updatedBackupCodes })
      .eq('user_id', user_id)
  }

  // Log MFA verification
  await supabase
    .from('mfa_verifications')
    .insert({
      user_id: user_id,
      transaction_id: transaction_id,
      amount: amount,
      verification_type: isValidBackup ? 'backup_code' : 'totp',
      verified_at: new Date().toISOString()
    })

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'MFA verification successful' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendSMSCode(supabase: any, params: any, user_id: string): Promise<Response> {
  const { phone_number } = params

  // Generate SMS code
  const smsCode = generateSMSCode()
  
  // Store SMS code with expiration
  const { error } = await supabase
    .from('sms_codes')
    .insert({
      user_id: user_id,
      phone_number: phone_number,
      code: smsCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      created_at: new Date().toISOString()
    })

  if (error) {
    throw new Error('Failed to send SMS code')
  }

  // In production, integrate with SMS service
  console.log(`SMS Code for ${phone_number}: ${smsCode}`)

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'SMS code sent successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function verifySMSCode(supabase: any, params: any, user_id: string): Promise<Response> {
  const { code, phone_number } = params

  // Get SMS code
  const { data: smsCode, error } = await supabase
    .from('sms_codes')
    .select('*')
    .eq('user_id', user_id)
    .eq('phone_number', phone_number)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !smsCode) {
    throw new Error('Invalid or expired SMS code')
  }

  // Mark code as used
  await supabase
    .from('sms_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', smsCode.id)

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'SMS code verified successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getMFAStatus(supabase: any, user_id: string): Promise<Response> {
  const { data: mfaSetup, error } = await supabase
    .from('mfa_setup')
    .select('*')
    .eq('user_id', user_id)
    .eq('is_active', true)
    .single()

  const { data: recentVerifications } = await supabase
    .from('mfa_verifications')
    .select('*')
    .eq('user_id', user_id)
    .order('verified_at', { ascending: false })
    .limit(5)

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        is_setup: !!mfaSetup,
        mfa_type: mfaSetup?.mfa_type,
        phone_number: mfaSetup?.phone_number,
        backup_codes_remaining: mfaSetup?.backup_codes?.length || 0,
        recent_verifications: recentVerifications || []
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

function generateBackupCodes(): string[] {
  const codes = []
  for (let i = 0; i < 8; i++) {
    codes.push(Math.random().toString(36).substring(2, 8).toUpperCase())
  }
  return codes
}

function generateSMSCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function generateQRCodeURL(secret: string, user_id: string): string {
  const issuer = 'STOLEN S-Pay'
  const account = user_id
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`
}

function verifyTOTPCode(code: string, secret: string): boolean {
  // In production, use a proper TOTP library
  // This is a simplified implementation
  const currentTime = Math.floor(Date.now() / 30000) // 30-second window
  const expectedCode = generateTOTPCode(secret, currentTime)
  return code === expectedCode
}

function generateTOTPCode(secret: string, time: number): string {
  // Simplified TOTP implementation
  // In production, use a proper TOTP library
  const hash = btoa(secret + time.toString())
  const code = parseInt(hash.substring(0, 6), 16) % 1000000
  return code.toString().padStart(6, '0')
}
