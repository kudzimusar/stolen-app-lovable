import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // TODO: Add admin role check here
    // For now, allowing any authenticated user to approve/reject
    // In production, you should check if user has admin role

    const { listingId, action } = await req.json();
    
    if (!listingId || !action) {
      throw new Error("listingId and action are required");
    }

    if (!["approve", "reject"].includes(action)) {
      throw new Error("Action must be 'approve' or 'reject'");
    }

    console.log(`🔍 Admin ${action} for listing:`, listingId);

    // Check if listing exists and is pending
    const { data: listing, error: listingError } = await supabaseClient
      .from("marketplace_listings")
      .select("id, status, title")
      .eq("id", listingId)
      .eq("status", "pending")
      .single();

    if (listingError || !listing) {
      throw new Error("Listing not found or not pending approval");
    }

    // Update listing status
    const newStatus = action === "approve" ? "approved" : "rejected";
    
    const { data: updatedListing, error: updateError } = await supabaseClient
      .from("marketplace_listings")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", listingId)
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

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Listing ${action}d successfully:`, {
      listingId,
      newStatus,
      title: updatedListing.title
    });

    return new Response(JSON.stringify({
      success: true,
      listing: updatedListing,
      message: `Listing ${action}d successfully`
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Admin listing action error:", error);
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
