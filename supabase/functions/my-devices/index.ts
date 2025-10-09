import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeviceWithStats {
  id: string;
  serial_number: string;
  imei?: string;
  device_name: string;
  brand: string;
  model: string;
  color?: string;
  purchase_date?: string;
  purchase_price?: number;
  status: string;
  registration_date: string;
  device_photos?: string[];
  blockchain_hash?: string;
  insurance_policy_id?: string;
  warranty_expiry?: string;
  transfer_count: number;
  photo_count: number;
}

interface DeviceStats {
  total: number;
  active: number;
  reported: number;
  totalValue: number;
  insured: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    console.log("📱 My Devices API - User:", user.id);

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Route handling
    switch (req.method) {
      case "GET":
        if (path === "stats") {
          return await handleGetStats(supabaseServiceClient, user);
        } else {
          return await handleGetMyDevices(supabaseServiceClient, user);
        }
      
      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error("My Devices API error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

/**
 * Get all devices for the authenticated user
 */
async function handleGetMyDevices(supabase: any, user: any): Promise<Response> {
  console.log("🔍 Fetching devices for user:", user.id);

  // Fetch devices with ownership history count
  const { data: devices, error: devicesError } = await supabase
    .from("devices")
    .select(`
      *,
      ownership_history(count)
    `)
    .eq("current_owner_id", user.id)
    .order("created_at", { ascending: false });

  if (devicesError) {
    console.error("Error fetching devices:", devicesError);
    throw devicesError;
  }

  console.log(`✅ Found ${devices?.length || 0} devices`);

  // Transform devices data
  const transformedDevices = devices?.map((device: any) => {
    // Calculate warranty expiry (assuming 1 year warranty from purchase)
    let warrantyExpiry = null;
    if (device.purchase_date) {
      const purchaseDate = new Date(device.purchase_date);
      purchaseDate.setFullYear(purchaseDate.getFullYear() + 1);
      warrantyExpiry = purchaseDate.toISOString().split('T')[0];
    }

    // Determine insurance status
    let insuranceStatus = 'expired';
    if (device.insurance_policy_id) {
      // Check if warranty is still valid
      if (warrantyExpiry && new Date(warrantyExpiry) > new Date()) {
        insuranceStatus = 'active';
      }
    }

    // Get transfer count
    const transferCount = device.ownership_history?.[0]?.count || 0;

    // Calculate current value (depreciation: 10% per year)
    let currentValue = device.purchase_price;
    if (device.purchase_date && device.purchase_price) {
      const yearsSincePurchase = (Date.now() - new Date(device.purchase_date).getTime()) / (365 * 24 * 60 * 60 * 1000);
      const depreciationRate = 0.10;
      currentValue = device.purchase_price * Math.pow(1 - depreciationRate, yearsSincePurchase);
    }

    return {
      id: device.id,
      name: device.device_name,
      brand: device.brand,
      model: device.model,
      serial: device.serial_number,
      imei: device.imei,
      status: device.status,
      registrationDate: device.registration_date || device.created_at,
      purchaseDate: device.purchase_date,
      purchasePrice: device.purchase_price,
      currentValue: Math.round(currentValue),
      location: getLocationString(device),
      warrantyExpiry,
      insuranceStatus,
      photos: device.device_photos || [],
      photoCount: device.device_photos?.length || 0,
      transfers: transferCount,
      blockchainHash: device.blockchain_hash,
      blockchainVerified: !!device.blockchain_hash,
      color: device.color,
      receiptUrl: device.receipt_url
    };
  }) || [];

  // Calculate statistics
  const stats = calculateStats(transformedDevices);

  return new Response(
    JSON.stringify({
      success: true,
      devices: transformedDevices,
      stats,
      total: transformedDevices.length
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Get statistics for user's devices
 */
async function handleGetStats(supabase: any, user: any): Promise<Response> {
  console.log("📊 Fetching device stats for user:", user.id);

  const { data: devices, error } = await supabase
    .from("devices")
    .select("status, purchase_price, insurance_policy_id")
    .eq("current_owner_id", user.id);

  if (error) {
    throw error;
  }

  const stats = {
    total: devices?.length || 0,
    active: devices?.filter((d: any) => d.status === 'active').length || 0,
    reported: devices?.filter((d: any) => ['lost', 'stolen'].includes(d.status)).length || 0,
    totalValue: devices?.reduce((sum: number, d: any) => sum + (d.purchase_price || 0), 0) || 0,
    insured: devices?.filter((d: any) => d.insurance_policy_id).length || 0
  };

  return new Response(
    JSON.stringify({
      success: true,
      stats
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Helper: Calculate device statistics
 */
function calculateStats(devices: any[]): DeviceStats {
  return {
    total: devices.length,
    active: devices.filter(d => d.status === 'active').length,
    reported: devices.filter(d => ['lost', 'stolen', 'reported_lost'].includes(d.status)).length,
    totalValue: devices.reduce((sum, d) => sum + (d.currentValue || 0), 0),
    insured: devices.filter(d => d.insuranceStatus === 'active').length
  };
}

/**
 * Helper: Get location string from device
 */
function getLocationString(device: any): string {
  if (device.status === 'lost' || device.status === 'stolen') {
    return "Last seen: Johannesburg, GP";
  }
  return "Cape Town, WC";
}

