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
      price,
      description,
      condition,
      listing_images,
      warranty_info,
      negotiable
    } = await req.json();

    console.log('Creating marketplace listing for user:', user.id);

    // Input validation
    if (!device_id || !price || !description || !condition) {
      throw new Error('Missing required listing information');
    }

    // Verify user owns the device
    const { data: device, error: deviceError } = await supabaseServiceClient
      .from('devices')
      .select('id, owner_id, status, serial_number')
      .eq('id', device_id)
      .eq('owner_id', user.id)
      .single();

    if (deviceError || !device) {
      throw new Error('Device not found or not owned by user');
    }

    if (device.status !== 'active') {
      throw new Error('Cannot list inactive device');
    }

    // Check if device is already listed
    const { data: existingListing } = await supabaseServiceClient
      .from('marketplace_listings')
      .select('id')
      .eq('device_id', device_id)
      .eq('status', 'active')
      .single();

    if (existingListing) {
      throw new Error('Device is already listed on marketplace');
    }

    // TODO: Trigger AI confidence scoring for the listing
    // const confidenceScore = await calculateListingConfidence({
    //   device_id,
    //   price,
    //   condition,
    //   seller_reputation: userReputation
    // });

    // Create marketplace listing
    const { data: listing, error: listingError } = await supabaseServiceClient
      .from('marketplace_listings')
      .insert({
        device_id,
        seller_id: user.id,
        price,
        description,
        condition,
        listing_images,
        warranty_info,
        negotiable: negotiable || false,
        status: 'active',
        listed_date: new Date().toISOString(),
        confidence_score: 85 // TODO: Replace with actual AI confidence score
      })
      .select()
      .single();

    if (listingError) {
      console.error('Listing creation error:', listingError);
      throw new Error('Failed to create listing');
    }

    console.log('Marketplace listing created successfully:', listing.id);

    return new Response(JSON.stringify({ 
      success: true, 
      listing_id: listing.id,
      message: 'Listing created successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-listing:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});