import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    console.log("📱 My Devices API - User:", user.id);

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    switch (req.method) {
      case "GET":
        if (path === "stats") {
          return await handleGetStats(supabaseClient, user);
        } else {
          return await handleGetMyDevices(supabaseClient, user);
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});

async function handleGetMyDevices(supabase, user) {
  console.log("🔍 Fetching devices for user:", user.id);

  const { data: devices, error: devicesError } = await supabase
    .from("devices")
    .select(`
      *,
      ownership_history(count),
      marketplace_listings!marketplace_listings_device_id_fkey(
        id,
        title,
        price,
        status,
        featured,
        view_count,
        created_at
      )
    `)
    .eq("current_owner_id", user.id)
    .order("created_at", { ascending: false });

  if (devicesError) {
    console.error("Error fetching devices:", devicesError);
    throw devicesError;
  }

  console.log(`✅ Found ${devices?.length || 0} devices`);

  const transformedDevices = devices?.map((device) => {
    let warrantyExpiry = null;
    if (device.purchase_date) {
      const purchaseDate = new Date(device.purchase_date);
      purchaseDate.setFullYear(purchaseDate.getFullYear() + 1);
      warrantyExpiry = purchaseDate.toISOString().split('T')[0];
    }

    let insuranceStatus = 'expired';
    if (device.insurance_policy_id) {
      if (warrantyExpiry && new Date(warrantyExpiry) > new Date()) {
        insuranceStatus = 'active';
      }
    }

    const transferCount = device.ownership_history?.[0]?.count || 0;

    let currentValue = device.purchase_price;
    if (device.purchase_date && device.purchase_price) {
      const yearsSincePurchase = (Date.now() - new Date(device.purchase_date).getTime()) / (365 * 24 * 60 * 60 * 1000);
      const depreciationRate = 0.10;
      currentValue = device.purchase_price * Math.pow(1 - depreciationRate, yearsSincePurchase);
    }

    // Extract active marketplace listing if exists (approved, pending, or active)
    const activeListing = device.marketplace_listings?.find((listing: any) => 
      ['approved', 'pending', 'active'].includes(listing.status)
    );
    const marketplaceStatus = {
      isListed: !!activeListing,
      listingId: activeListing?.id || null,
      listingTitle: activeListing?.title || null,
      listingPrice: activeListing?.price || null,
      isFeatured: activeListing?.featured || false,
      viewCount: activeListing?.view_count || 0,
      listedAt: activeListing?.created_at || null
    };

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
      receiptUrl: device.receipt_url,
      storage_capacity: device.storage_capacity,
      device_condition: device.device_condition,
      warranty_months: device.warranty_months,
      warranty_expiry_date: device.warranty_expiry_date,
      proof_of_purchase_url: device.proof_of_purchase_url,
      user_identity_url: device.user_identity_url,
      warranty_document_url: device.warranty_document_url,
      registration_certificate_url: device.registration_certificate_url,
      registration_location_lat: device.registration_location_lat,
      registration_location_lng: device.registration_location_lng,
      registration_location_address: device.registration_location_address,
      last_seen_location_lat: device.last_seen_location_lat,
      last_seen_location_lng: device.last_seen_location_lng,
      marketplaceStatus: marketplaceStatus
    };
  }) || [];

  const stats = calculateStats(transformedDevices);

  return new Response(
    JSON.stringify({
      success: true,
      devices: transformedDevices,
      stats,
      total: transformedDevices.length
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

async function handleGetStats(supabase, user) {
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
    active: devices?.filter((d) => d.status === 'active').length || 0,
    reported: devices?.filter((d) => ['lost', 'stolen'].includes(d.status)).length || 0,
    totalValue: devices?.reduce((sum, d) => sum + (d.purchase_price || 0), 0) || 0,
    insured: devices?.filter((d) => d.insurance_policy_id).length || 0
  };

  return new Response(
    JSON.stringify({
      success: true,
      stats
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

function calculateStats(devices) {
  return {
    total: devices.length,
    active: devices.filter((d) => d.status === 'active').length,
    reported: devices.filter((d) => ['lost', 'stolen', 'reported_lost'].includes(d.status)).length,
    totalValue: devices.reduce((sum, d) => sum + (d.currentValue || 0), 0),
    insured: devices.filter((d) => d.insuranceStatus === 'active').length
  };
}

function getLocationString(device) {
  if (device.status === 'lost' || device.status === 'stolen') {
    return "Last seen: Johannesburg, GP";
  }
  return "Cape Town, WC";
}