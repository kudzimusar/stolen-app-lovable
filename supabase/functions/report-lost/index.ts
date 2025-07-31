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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { 
      device_id,
      incident_description,
      incident_date,
      last_known_location,
      evidence_files,
      police_report_number,
      reward_amount
    } = await req.json();

    console.log('Processing lost device report for user:', user.id);

    // Input validation
    if (!device_id || !incident_description || !incident_date) {
      throw new Error('Missing required report information');
    }

    // Verify user owns the device
    const { data: device, error: deviceError } = await supabaseServiceClient
      .from('devices')
      .select('id, owner_id, serial_number, device_type, brand, model')
      .eq('id', device_id)
      .eq('owner_id', user.id)
      .single();

    if (deviceError || !device) {
      throw new Error('Device not found or not owned by user');
    }

    // Check if device is already reported as stolen
    const { data: existingReport } = await supabaseServiceClient
      .from('stolen_reports')
      .select('id')
      .eq('device_id', device_id)
      .eq('status', 'active')
      .single();

    if (existingReport) {
      throw new Error('Device is already reported as stolen');
    }

    // Create stolen report
    const { data: report, error: reportError } = await supabaseServiceClient
      .from('stolen_reports')
      .insert({
        device_id,
        reporter_id: user.id,
        incident_description,
        incident_date,
        last_known_location,
        evidence_files,
        police_report_number,
        reward_amount: reward_amount || 0,
        status: 'active',
        report_date: new Date().toISOString()
      })
      .select()
      .single();

    if (reportError) {
      console.error('Report creation error:', reportError);
      throw new Error('Failed to create stolen report');
    }

    // Update device status to stolen
    const { error: deviceUpdateError } = await supabaseServiceClient
      .from('devices')
      .update({ status: 'stolen' })
      .eq('id', device_id);

    if (deviceUpdateError) {
      console.error('Device status update error:', deviceUpdateError);
    }

    // TODO: Record on blockchain for immutable proof
    // const blockchainTxId = await recordStolenOnBlockchain({
    //   device_id,
    //   report_id: report.id,
    //   timestamp: new Date().toISOString()
    // });

    // TODO: Notify law enforcement via external API
    // await notifyLawEnforcement({
    //   report_id: report.id,
    //   device_info: device,
    //   incident_info: report
    // });

    // TODO: Alert community and marketplace
    // await alertCommunity(report.id);

    console.log('Stolen report created successfully:', report.id);

    return new Response(JSON.stringify({ 
      success: true, 
      report_id: report.id,
      message: 'Device reported as stolen successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in report-lost:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});