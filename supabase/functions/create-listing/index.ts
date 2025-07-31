import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateListingRequest {
  deviceId: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  conditionRating: number;
  warrantyRemainingMonths?: number;
  negotiable?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const listingData: CreateListingRequest = await req.json();

    // Verify device ownership and eligibility
    const { data: device, error: deviceError } = await supabaseClient
      .from("devices")
      .select("id, current_owner_id, status, serial_number")
      .eq("id", listingData.deviceId)
      .eq("current_owner_id", user.id)
      .single();

    if (deviceError || !device) {
      throw new Error("Device not found or you don't own this device");
    }

    if (device.status !== "active") {
      throw new Error("Cannot list device with status: " + device.status);
    }

    // Check for existing active listings
    const { data: existingListing } = await supabaseClient
      .from("marketplace_listings")
      .select("id")
      .eq("device_id", listingData.deviceId)
      .eq("status", "active")
      .single();

    if (existingListing) {
      throw new Error("Device already has an active listing");
    }

    // Create marketplace listing
    const { data: newListing, error: listingError } = await supabaseClient
      .from("marketplace_listings")
      .insert({
        device_id: listingData.deviceId,
        seller_id: user.id,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        currency: listingData.currency || "USD",
        condition_rating: listingData.conditionRating,
        warranty_remaining_months: listingData.warrantyRemainingMonths || 0,
        negotiable: listingData.negotiable ?? true,
        status: "active"
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
      throw listingError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        listing: newListing,
        message: "Listing created successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Create listing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});