import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { 
      device_serial_number,
      found_location,
      found_date,
      finder_contact,
      device_photos,
      description,
      anonymous_report
    } = await req.json();

    console.log('Processing found device report');

    // Input validation
    if (!device_serial_number || !found_location || !found_date) {
      throw new Error('Missing required found report information');
    }

    let finder_id = null;
    
    // Get user if not anonymous
    if (!anonymous_report) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        finder_id = user?.id;
      }
    }

    // Check if device exists and is reported as stolen
    const { data: device, error: deviceError } = await supabaseServiceClient
      .from('devices')
      .select('id, serial_number, status, owner_id, device_type, brand, model')
      .eq('serial_number', device_serial_number)
      .single();

    if (deviceError || !device) {
      throw new Error('Device not found in system');
    }

    if (device.status !== 'stolen') {
      throw new Error('Device is not reported as stolen');
    }

    // Get active stolen report
    const { data: stolenReport } = await supabaseServiceClient
      .from('stolen_reports')
      .select('id, reward_amount')
      .eq('device_id', device.id)
      .eq('status', 'active')
      .single();

    // Create found tip
    const { data: foundTip, error: tipError } = await supabaseServiceClient
      .from('found_tips')
      .insert({
        device_id: device.id,
        stolen_report_id: stolenReport?.id,
        finder_id,
        found_location,
        found_date,
        finder_contact: anonymous_report ? null : finder_contact,
        device_photos,
        description,
        anonymous_report: anonymous_report || false,
        tip_date: new Date().toISOString(),
        status: 'pending_verification'
      })
      .select()
      .single();

    if (tipError) {
      console.error('Found tip creation error:', tipError);
      throw new Error('Failed to create found tip');
    }

    // TODO: Notify device owner via secure messaging
    // await notifyOwner({
    //   device_id: device.id,
    //   found_tip_id: foundTip.id,
    //   anonymous: anonymous_report
    // });

    // TODO: Calculate and set aside reward for finder
    // if (stolenReport?.reward_amount > 0 && finder_id) {
    //   await reserveReward(finder_id, stolenReport.reward_amount);
    // }

    // TODO: Alert law enforcement
    // await alertLawEnforcement({
    //   device_id: device.id,
    //   found_tip_id: foundTip.id
    // });

    console.log('Found tip created successfully:', foundTip.id);

    return new Response(JSON.stringify({ 
      success: true, 
      tip_id: foundTip.id,
      reward_eligible: !!stolenReport?.reward_amount,
      message: anonymous_report ? 
        'Anonymous tip submitted successfully' : 
        'Found report submitted successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in report-found:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});