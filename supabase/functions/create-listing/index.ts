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
      throw new Error("Authorization header missing");
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

    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const listingData = await req.json();
    console.log("🔍 Debug - Listing data received:", {
      device_id: listingData.device_id,
      user_id: user.id,
      title: listingData.title
    });

    // Verify device ownership and eligibility
    const { data: device, error: deviceError } = await supabaseClient
      .from("devices")
      .select("id, current_owner_id, status, serial_number")
      .eq("id", listingData.device_id)
      .eq("current_owner_id", user.id)
      .single();

    console.log("🔍 Debug - Device query result:", {
      device: device,
      error: deviceError,
      deviceId: listingData.device_id,
      userId: user.id
    });

    if (deviceError || !device) {
      console.error("❌ Device not found or ownership mismatch:", {
        deviceId: listingData.device_id,
        userId: user.id,
        error: deviceError
      });
      throw new Error("Device not found or you don't own this device");
    }

    if (device.status !== "active") {
      throw new Error("Cannot list device with status: " + device.status);
    }

    // Check for existing listings (active, pending, or approved)
    const { data: existingListing } = await supabaseClient
      .from("marketplace_listings")
      .select("id, status")
      .eq("device_id", listingData.device_id)
      .in("status", ["active", "pending", "approved"])
      .single();

    if (existingListing) {
      throw new Error("Device already has an active listing");
    }

    // Create marketplace listing with admin review workflow
    // Using "pending" status for admin review (this should exist in your enum)
    const { data: newListing, error: listingError } = await supabaseClient
      .from("marketplace_listings")
      .insert({
        device_id: listingData.device_id,
        seller_id: user.id,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        currency: listingData.currency || "USD",
        condition_rating: listingData.condition_rating,
        warranty_remaining_months: listingData.warranty_remaining_months || 0,
        negotiable: listingData.negotiable ?? true,
        featured: listingData.featured ?? false,
        status: "pending" // All new listings require admin approval
      })
      .select(`
        *,
        devices (
          serial_number,
          device_name,
          brand,
          model,
          device_photos
        )
      `)
      .single();

    if (listingError) {
      console.error("❌ Error creating listing:", listingError);
      throw listingError;
    }

    console.log("✅ Listing created successfully:", {
      listingId: newListing.id,
      status: newListing.status,
      title: newListing.title
    });

    return new Response(JSON.stringify({
      success: true,
      listing: newListing,
      message: "Listing created successfully and is pending admin review"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Create listing error:", error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});