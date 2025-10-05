import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const {
      report_id,
      claimant_name,
      claimant_email,
      claimant_phone,
      claim_type,
      device_serial_provided,
      device_imei_provided,
      device_mac_provided,
      ownership_proof,
      claim_description
    } = await req.json()

    // Validate required fields
    if (!report_id || !claimant_name || !claimant_email || !device_serial_provided) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if report exists and is a found device
    const { data: report, error: reportError } = await supabaseClient
      .from('lost_found_reports')
      .select('*')
      .eq('id', report_id)
      .eq('report_type', 'found')
      .single()

    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: 'Report not found or not a found device' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if claim already exists for this report
    const { data: existingClaim, error: claimCheckError } = await supabaseClient
      .from('device_claims')
      .select('id')
      .eq('report_id', report_id)
      .eq('claimant_email', claimant_email)
      .single()

    if (existingClaim) {
      return new Response(
        JSON.stringify({ error: 'A claim has already been submitted for this device with this email' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call the database function to submit the claim
    const { data: result, error: claimError } = await supabaseClient
      .rpc('submit_device_claim', {
        p_report_id: report_id,
        p_claimant_user_id: null, // No user ID for non-registered users
        p_claimant_name: claimant_name,
        p_claimant_email: claimant_email,
        p_claimant_phone: claimant_phone,
        p_claim_type: claim_type || 'ownership_claim',
        p_device_serial_provided: device_serial_provided,
        p_device_imei_provided: device_imei_provided,
        p_device_mac_provided: device_mac_provided,
        p_ownership_proof: ownership_proof,
        p_claim_description: claim_description
      })

    if (claimError) {
      console.error('Claim submission error:', claimError)
      return new Response(
        JSON.stringify({ error: 'Failed to submit claim' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Claim submitted successfully. Admin review required.',
        data: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in submit-claim:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
