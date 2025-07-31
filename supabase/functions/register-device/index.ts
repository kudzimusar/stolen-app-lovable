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
      serial_number, 
      device_type, 
      brand, 
      model, 
      purchase_price, 
      purchase_date, 
      purchase_location,
      receipt_image_url,
      device_photos,
      location_data 
    } = await req.json();

    console.log('Registering device for user:', user.id);

    // Input validation
    if (!serial_number || !device_type || !brand || !model) {
      throw new Error('Missing required device information');
    }

    // Check if device is already registered
    const { data: existingDevice } = await supabaseServiceClient
      .from('devices')
      .select('id, owner_id')
      .eq('serial_number', serial_number)
      .single();

    if (existingDevice) {
      throw new Error('Device already registered');
    }

    // TODO: Integrate with Blockchain API to create immutable ownership record
    // const blockchainTxId = await createBlockchainRecord({
    //   device_id: serial_number,
    //   owner_id: user.id,
    //   timestamp: new Date().toISOString()
    // });

    // TODO: Process receipt image with OCR API if provided
    // if (receipt_image_url) {
    //   const ocrResult = await processReceiptOCR(receipt_image_url);
    //   // Validate OCR results against provided data
    // }

    // Register device in database
    const { data: device, error: deviceError } = await supabaseServiceClient
      .from('devices')
      .insert({
        serial_number,
        device_type,
        brand,
        model,
        purchase_price,
        purchase_date,
        purchase_location,
        receipt_image_url,
        device_photos,
        location_data,
        owner_id: user.id,
        registration_date: new Date().toISOString(),
        status: 'active',
        blockchain_tx_id: 'placeholder_tx_' + Date.now() // TODO: Replace with actual blockchain TX ID
      })
      .select()
      .single();

    if (deviceError) {
      console.error('Device registration error:', deviceError);
      throw new Error('Failed to register device');
    }

    // Create initial ownership history record
    const { error: historyError } = await supabaseServiceClient
      .from('ownership_history')
      .insert({
        device_id: device.id,
        previous_owner_id: null,
        new_owner_id: user.id,
        transfer_type: 'initial_registration',
        transfer_date: new Date().toISOString(),
        blockchain_tx_id: device.blockchain_tx_id
      });

    if (historyError) {
      console.error('Ownership history error:', historyError);
    }

    // TODO: Trigger AI analysis for fraud detection
    // await triggerAIAnalysis(device.id, 'registration');

    console.log('Device registered successfully:', device.id);

    return new Response(JSON.stringify({ 
      success: true, 
      device_id: device.id,
      message: 'Device registered successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in register-device:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});