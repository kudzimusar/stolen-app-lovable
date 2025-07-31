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

    // TODO: Verify user has law enforcement role
    // const { data: userRole } = await supabaseServiceClient
    //   .from('user_roles')
    //   .select('role')
    //   .eq('user_id', user.id)
    //   .eq('role', 'law_enforcement')
    //   .single();
    
    // if (!userRole) {
    //   throw new Error('Unauthorized: Law enforcement access required');
    // }

    const { action, ...params } = await req.json();

    console.log('Law enforcement action:', action, 'by user:', user.id);

    switch (action) {
      case 'search_device':
        return await handleDeviceSearch(supabaseServiceClient, params);
      
      case 'verify_ownership':
        return await handleOwnershipVerification(supabaseServiceClient, params);
      
      case 'initiate_recovery':
        return await handleRecoveryInitiation(supabaseServiceClient, params, user.id);
      
      case 'submit_recovery_report':
        return await handleRecoveryReport(supabaseServiceClient, params, user.id);
      
      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in law-enforcement-access:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleDeviceSearch(supabase: any, params: any) {
  const { serial_number, device_type, brand, model } = params;
  
  let query = supabase
    .from('devices')
    .select(`
      id, serial_number, device_type, brand, model, status,
      owner_id, registration_date, blockchain_tx_id,
      stolen_reports!inner(*)
    `);

  if (serial_number) {
    query = query.eq('serial_number', serial_number);
  } else {
    if (device_type) query = query.eq('device_type', device_type);
    if (brand) query = query.ilike('brand', `%${brand}%`);
    if (model) query = query.ilike('model', `%${model}%`);
  }

  const { data: devices, error } = await query;

  if (error) {
    throw new Error('Device search failed');
  }

  return new Response(JSON.stringify({ 
    success: true, 
    devices,
    count: devices.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleOwnershipVerification(supabase: any, params: any) {
  const { device_id } = params;

  const { data: ownership, error } = await supabase
    .from('ownership_history')
    .select(`
      id, device_id, new_owner_id, transfer_type, transfer_date,
      blockchain_tx_id, previous_owner_id
    `)
    .eq('device_id', device_id)
    .order('transfer_date', { ascending: false });

  if (error) {
    throw new Error('Ownership verification failed');
  }

  return new Response(JSON.stringify({ 
    success: true, 
    ownership_history: ownership
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleRecoveryInitiation(supabase: any, params: any, officer_id: string) {
  const { device_id, recovery_location, recovery_notes } = params;

  // Update device status to recovered
  const { error: deviceError } = await supabase
    .from('devices')
    .update({ status: 'recovered' })
    .eq('id', device_id);

  if (deviceError) {
    throw new Error('Failed to update device status');
  }

  // Update stolen report status
  const { error: reportError } = await supabase
    .from('stolen_reports')
    .update({ 
      status: 'recovered',
      recovery_date: new Date().toISOString(),
      recovery_officer_id: officer_id,
      recovery_location,
      recovery_notes
    })
    .eq('device_id', device_id)
    .eq('status', 'active');

  if (reportError) {
    console.error('Failed to update stolen report:', reportError);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Device recovery initiated successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleRecoveryReport(supabase: any, params: any, officer_id: string) {
  const { device_id, returned_to_owner, return_notes } = params;

  if (returned_to_owner) {
    // Update device status back to active
    const { error: deviceError } = await supabase
      .from('devices')
      .update({ status: 'active' })
      .eq('id', device_id);

    if (deviceError) {
      throw new Error('Failed to update device status');
    }

    // Mark stolen report as resolved
    const { error: reportError } = await supabase
      .from('stolen_reports')
      .update({ 
        status: 'resolved',
        return_date: new Date().toISOString(),
        return_notes
      })
      .eq('device_id', device_id);

    if (reportError) {
      console.error('Failed to update stolen report:', reportError);
    }
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Recovery report submitted successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}