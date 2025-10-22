/**
 * Bulk Data Import Edge Function
 * Handles server-side bulk data import with validation and transaction management
 * Supports devices, marketplace listings, lost reports, and other data types
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkImportRequest {
  data_type: string;
  data: any[];
  user_id: string;
  options?: {
    skip_duplicates?: boolean;
    update_existing?: boolean;
    batch_size?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { data_type, data, user_id, options = {} } = await req.json() as BulkImportRequest;

    if (!data_type || !data || !Array.isArray(data) || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: data_type and data array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has permission for bulk import
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allowedRoles = ['admin', 'super_admin', 'retailer', 'repair_shop', 'insurance', 'law_enforcement', 'ngo'];
    if (!allowedRoles.includes(userData.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions for bulk import' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start bulk import process
    const startTime = Date.now();
    const batchSize = options.batch_size || 100;
    const results = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: [] as any[],
      inserted_ids: [] as string[],
    };

    // Process data in batches
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        const batchResult = await processBatch(
          supabaseClient,
          data_type,
          batch,
          user.id,
          options
        );
        
        results.successful += batchResult.successful;
        results.failed += batchResult.failed;
        results.errors.push(...batchResult.errors);
        results.inserted_ids.push(...batchResult.inserted_ids);
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error);
        results.failed += batch.length;
        results.errors.push({
          batch: i / batchSize + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const processingTime = Date.now() - startTime;

    // Log the operation
    await supabaseClient.rpc('log_file_operation', {
      p_admin_user_id: user.id,
      p_operation_type: 'upload',
      p_file_type: data_type,
      p_file_format: 'json',
      p_rows_processed: results.total,
      p_rows_successful: results.successful,
      p_rows_failed: results.failed,
      p_processing_time_ms: processingTime,
      p_storage_location: 'supabase',
      p_error_log: results.errors,
      p_success_log: { inserted_ids: results.inserted_ids },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Bulk import completed: ${results.successful} successful, ${results.failed} failed`,
        results,
        processing_time_ms: processingTime,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk import error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Process a batch of records
 */
async function processBatch(
  supabase: any,
  dataType: string,
  batch: any[],
  userId: string,
  options: any
): Promise<{
  successful: number;
  failed: number;
  errors: any[];
  inserted_ids: string[];
}> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[],
    inserted_ids: [] as string[],
  };

  switch (dataType) {
    case 'devices':
      return await importDevices(supabase, batch, userId, options);
    
    case 'marketplace_listings':
      return await importMarketplaceListings(supabase, batch, userId, options);
    
    case 'lost_reports':
    case 'found_reports':
      return await importLostReports(supabase, batch, userId, options);
    
    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }
}

/**
 * Import devices in bulk
 */
async function importDevices(
  supabase: any,
  devices: any[],
  userId: string,
  options: any
): Promise<any> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[],
    inserted_ids: [] as string[],
  };

  for (const device of devices) {
    try {
      // Prepare device data
      const deviceData = {
        device_name: device.device_name,
        device_type: device.device_type,
        brand: device.brand,
        model: device.model,
        serial_number: device.serial_number,
        imei: device.imei || null,
        mac_address: device.mac_address || null,
        color: device.color || null,
        storage_capacity: device.storage_capacity || null,
        ram: device.ram || null,
        condition: device.condition || null,
        purchase_date: device.purchase_date || null,
        purchase_price: device.purchase_price ? parseFloat(device.purchase_price) : null,
        purchase_location: device.purchase_location || null,
        receipt_url: device.receipt_url || null,
        warranty_status: device.warranty_status || null,
        warranty_expiry: device.warranty_expiry || null,
        warranty_provider: device.warranty_provider || null,
        insurance_policy_id: device.insurance_policy_id || null,
        insurer_name: device.insurer_name || null,
        device_photos: device.device_photos ? device.device_photos.split(',').map((u: string) => u.trim()) : [],
        notes: device.notes || null,
        tags: device.tags ? device.tags.split(',').map((t: string) => t.trim()) : [],
        current_owner_id: userId,
        status: 'active',
      };

      // Check for duplicates if not skipping
      if (!options.skip_duplicates) {
        const { data: existing } = await supabase
          .from('devices')
          .select('id')
          .eq('serial_number', deviceData.serial_number)
          .single();

        if (existing) {
          if (options.update_existing) {
            // Update existing device
            const { error } = await supabase
              .from('devices')
              .update(deviceData)
              .eq('id', existing.id);

            if (error) throw error;
            
            results.successful++;
            results.inserted_ids.push(existing.id);
            continue;
          } else {
            results.failed++;
            results.errors.push({
              serial_number: deviceData.serial_number,
              error: 'Duplicate serial number',
            });
            continue;
          }
        }
      }

      // Insert new device
      const { data: inserted, error } = await supabase
        .from('devices')
        .insert(deviceData)
        .select('id')
        .single();

      if (error) throw error;

      results.successful++;
      results.inserted_ids.push(inserted.id);

    } catch (error) {
      results.failed++;
      results.errors.push({
        device: device.serial_number || device.device_name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Import marketplace listings in bulk
 */
async function importMarketplaceListings(
  supabase: any,
  listings: any[],
  userId: string,
  options: any
): Promise<any> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[],
    inserted_ids: [] as string[],
  };

  for (const listing of listings) {
    try {
      const listingData = {
        title: listing.title,
        description: listing.description,
        price: parseFloat(listing.price),
        brand: listing.brand,
        model: listing.model,
        condition: listing.condition,
        storage: listing.storage || null,
        color: listing.color || null,
        warranty_months: listing.warranty_months ? parseInt(listing.warranty_months) : null,
        images: listing.photos_url ? listing.photos_url.split(',').map((u: string) => u.trim()) : [],
        seller_id: userId,
        status: 'active',
      };

      const { data: inserted, error } = await supabase
        .from('marketplace_listings')
        .insert(listingData)
        .select('id')
        .single();

      if (error) throw error;

      results.successful++;
      results.inserted_ids.push(inserted.id);

    } catch (error) {
      results.failed++;
      results.errors.push({
        listing: listing.title,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Import lost/found reports in bulk
 */
async function importLostReports(
  supabase: any,
  reports: any[],
  userId: string,
  options: any
): Promise<any> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[],
    inserted_ids: [] as string[],
  };

  for (const report of reports) {
    try {
      const reportData = {
        report_type: report.report_type,
        device_category: report.device_category,
        device_model: report.device_model,
        serial_number: report.serial_number || null,
        incident_date: report.incident_date,
        location_address: report.location_address,
        location_lat: report.location_lat ? parseFloat(report.location_lat) : null,
        location_lng: report.location_lng ? parseFloat(report.location_lng) : null,
        reward_amount: report.reward_amount ? parseFloat(report.reward_amount) : null,
        contact_phone: report.contact_phone,
        photos: report.photos_url ? report.photos_url.split(',').map((u: string) => u.trim()) : [],
        user_id: userId,
        status: 'active',
      };

      const { data: inserted, error } = await supabase
        .from('lost_found_reports')
        .insert(reportData)
        .select('id')
        .single();

      if (error) throw error;

      results.successful++;
      results.inserted_ids.push(inserted.id);

    } catch (error) {
      results.failed++;
      results.errors.push({
        report: report.device_model,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

