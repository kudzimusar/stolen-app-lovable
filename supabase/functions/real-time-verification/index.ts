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
      case 'verify_sa_id':
        return await verifySAID(supabase, params, user.id)
      
      case 'verify_passport':
        return await verifyPassport(supabase, params, user.id)
      
      case 'verify_drivers_license':
        return await verifyDriversLicense(supabase, params, user.id)
      
      case 'verify_address':
        return await verifyAddress(supabase, params, user.id)
      
      case 'verify_bank_account':
        return await verifyBankAccount(supabase, params, user.id)
      
      case 'get_verification_status':
        return await getVerificationStatus(supabase, user.id)
      
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

async function verifySAID(supabase: any, params: any, user_id: string): Promise<Response> {
  const { id_number, full_name, date_of_birth, document_image } = params

  // Validate SA ID number format
  if (!isValidSAID(id_number)) {
    throw new Error('Invalid South African ID number format')
  }

  // Extract information from ID number
  const idInfo = extractIDInfo(id_number)
  
  // Verify against Home Affairs database (simulated)
  const verificationResult = await verifyWithHomeAffairs({
    id_number,
    full_name,
    date_of_birth,
    document_image
  })

  // Store verification result
  const { data: verification, error } = await supabase
    .from('real_time_verifications')
    .insert({
      user_id: user_id,
      document_type: 'sa_id',
      document_number: id_number,
      verification_data: {
        id_info: idInfo,
        verification_result: verificationResult,
        verified_at: new Date().toISOString()
      },
      status: verificationResult.verified ? 'verified' : 'failed',
      confidence_score: verificationResult.confidence,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to store verification result')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        details: verificationResult.details,
        verification_id: verification.id
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function verifyPassport(supabase: any, params: any, user_id: string): Promise<Response> {
  const { passport_number, full_name, date_of_birth, document_image } = params

  // Validate passport number format
  if (!isValidPassport(passport_number)) {
    throw new Error('Invalid passport number format')
  }

  // Verify against Department of Home Affairs (simulated)
  const verificationResult = await verifyWithHomeAffairs({
    passport_number,
    full_name,
    date_of_birth,
    document_image
  })

  // Store verification result
  const { data: verification, error } = await supabase
    .from('real_time_verifications')
    .insert({
      user_id: user_id,
      document_type: 'passport',
      document_number: passport_number,
      verification_data: {
        verification_result: verificationResult,
        verified_at: new Date().toISOString()
      },
      status: verificationResult.verified ? 'verified' : 'failed',
      confidence_score: verificationResult.confidence,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to store verification result')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        details: verificationResult.details,
        verification_id: verification.id
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function verifyDriversLicense(supabase: any, params: any, user_id: string): Promise<Response> {
  const { license_number, full_name, date_of_birth, document_image } = params

  // Validate license number format
  if (!isValidDriversLicense(license_number)) {
    throw new Error('Invalid driver\'s license number format')
  }

  // Verify against Department of Transport (simulated)
  const verificationResult = await verifyWithTransport({
    license_number,
    full_name,
    date_of_birth,
    document_image
  })

  // Store verification result
  const { data: verification, error } = await supabase
    .from('real_time_verifications')
    .insert({
      user_id: user_id,
      document_type: 'drivers_license',
      document_number: license_number,
      verification_data: {
        verification_result: verificationResult,
        verified_at: new Date().toISOString()
      },
      status: verificationResult.verified ? 'verified' : 'failed',
      confidence_score: verificationResult.confidence,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to store verification result')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        details: verificationResult.details,
        verification_id: verification.id
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function verifyAddress(supabase: any, params: any, user_id: string): Promise<Response> {
  const { address, utility_bill_image, bank_statement_image } = params

  // Verify address with utility companies (simulated)
  const utilityVerification = await verifyWithUtilityCompany({
    address,
    document_image: utility_bill_image
  })

  // Verify address with bank (simulated)
  const bankVerification = await verifyWithBank({
    address,
    document_image: bank_statement_image
  })

  // Combine verification results
  const verificationResult = {
    verified: utilityVerification.verified || bankVerification.verified,
    confidence: Math.max(utilityVerification.confidence, bankVerification.confidence),
    details: {
      utility_verified: utilityVerification.verified,
      bank_verified: bankVerification.verified,
      address: address
    }
  }

  // Store verification result
  const { data: verification, error } = await supabase
    .from('real_time_verifications')
    .insert({
      user_id: user_id,
      document_type: 'proof_of_address',
      document_number: address,
      verification_data: {
        verification_result: verificationResult,
        verified_at: new Date().toISOString()
      },
      status: verificationResult.verified ? 'verified' : 'failed',
      confidence_score: verificationResult.confidence,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to store verification result')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        details: verificationResult.details,
        verification_id: verification.id
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function verifyBankAccount(supabase: any, params: any, user_id: string): Promise<Response> {
  const { bank_name, account_number, account_holder_name, branch_code } = params

  // Verify with South African banks (simulated)
  const verificationResult = await verifyWithBank({
    bank_name,
    account_number,
    account_holder_name,
    branch_code
  })

  // Store verification result
  const { data: verification, error } = await supabase
    .from('real_time_verifications')
    .insert({
      user_id: user_id,
      document_type: 'bank_account',
      document_number: account_number,
      verification_data: {
        bank_name: bank_name,
        account_holder_name: account_holder_name,
        branch_code: branch_code,
        verification_result: verificationResult,
        verified_at: new Date().toISOString()
      },
      status: verificationResult.verified ? 'verified' : 'failed',
      confidence_score: verificationResult.confidence,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to store verification result')
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        details: verificationResult.details,
        verification_id: verification.id
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getVerificationStatus(supabase: any, user_id: string): Promise<Response> {
  const { data: verifications, error } = await supabase
    .from('real_time_verifications')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch verification status')
  }

  // Group verifications by type
  const verificationSummary = {
    sa_id: verifications?.find(v => v.document_type === 'sa_id'),
    passport: verifications?.find(v => v.document_type === 'passport'),
    drivers_license: verifications?.find(v => v.document_type === 'drivers_license'),
    proof_of_address: verifications?.find(v => v.document_type === 'proof_of_address'),
    bank_account: verifications?.find(v => v.document_type === 'bank_account'),
    overall_status: calculateOverallStatus(verifications || [])
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: verificationSummary 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Validation functions
function isValidSAID(idNumber: string): boolean {
  // South African ID number validation
  const pattern = /^\d{13}$/
  if (!pattern.test(idNumber)) return false

  // Luhn algorithm validation
  const digits = idNumber.split('').map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

function isValidPassport(passportNumber: string): boolean {
  // South African passport validation
  const pattern = /^[A-Z]\d{8}$/
  return pattern.test(passportNumber)
}

function isValidDriversLicense(licenseNumber: string): boolean {
  // South African driver's license validation
  const pattern = /^\d{13}$/
  return pattern.test(licenseNumber)
}

function extractIDInfo(idNumber: string) {
  // Extract date of birth, gender, and citizenship from SA ID
  const year = parseInt(idNumber.substring(0, 2))
  const month = parseInt(idNumber.substring(2, 4))
  const day = parseInt(idNumber.substring(4, 6))
  const gender = parseInt(idNumber.substring(6, 10)) >= 5000 ? 'male' : 'female'
  const citizenship = parseInt(idNumber.substring(10, 11)) === 0 ? 'citizen' : 'permanent_resident'

  return {
    date_of_birth: `19${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    gender: gender,
    citizenship: citizenship
  }
}

// Simulated verification functions
async function verifyWithHomeAffairs(data: any) {
  // Simulate Home Affairs verification
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay

  return {
    verified: Math.random() > 0.1, // 90% success rate
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    details: {
      name_match: Math.random() > 0.05,
      date_match: Math.random() > 0.05,
      document_valid: Math.random() > 0.05
    }
  }
}

async function verifyWithTransport(data: any) {
  // Simulate Department of Transport verification
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    verified: Math.random() > 0.15, // 85% success rate
    confidence: Math.random() * 0.25 + 0.75, // 75-100% confidence
    details: {
      license_valid: Math.random() > 0.05,
      name_match: Math.random() > 0.05,
      expiry_valid: Math.random() > 0.05
    }
  }
}

async function verifyWithUtilityCompany(data: any) {
  // Simulate utility company verification
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    verified: Math.random() > 0.2, // 80% success rate
    confidence: Math.random() * 0.2 + 0.8, // 80-100% confidence
    details: {
      address_match: Math.random() > 0.05,
      document_recent: Math.random() > 0.05
    }
  }
}

async function verifyWithBank(data: any) {
  // Simulate bank verification
  await new Promise(resolve => setTimeout(resolve, 3000))

  return {
    verified: Math.random() > 0.1, // 90% success rate
    confidence: Math.random() * 0.2 + 0.8, // 80-100% confidence
    details: {
      account_exists: Math.random() > 0.05,
      name_match: Math.random() > 0.05,
      branch_valid: Math.random() > 0.05
    }
  }
}

function calculateOverallStatus(verifications: any[]): string {
  const verifiedCount = verifications.filter(v => v.status === 'verified').length
  const totalCount = verifications.length

  if (totalCount === 0) return 'not_started'
  if (verifiedCount === totalCount) return 'fully_verified'
  if (verifiedCount > 0) return 'partially_verified'
  return 'failed'
}
