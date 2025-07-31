import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeviceRegistrationRequest {
  serialNumber: string;
  imei?: string;
  deviceName: string;
  brand: string;
  model: string;
  color?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  devicePhotos?: string[];
  receiptUrl?: string;
  insurancePolicyId?: string;
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

    const deviceData: DeviceRegistrationRequest = await req.json();

    if (!deviceData.serialNumber || !deviceData.deviceName || !deviceData.brand || !deviceData.model) {
      throw new Error("Missing required device information");
    }

    const { data: existingDevice } = await supabaseClient
      .from("devices")
      .select("id, current_owner_id")
      .eq("serial_number", deviceData.serialNumber)
      .single();

    if (existingDevice) {
      throw new Error("Device with this serial number already registered");
    }

    // Placeholder for blockchain registration
    const blockchainHash = `mock_hash_${Date.now()}`;

    const { data: newDevice, error: insertError } = await supabaseClient
      .from("devices")
      .insert({
        serial_number: deviceData.serialNumber,
        imei: deviceData.imei,
        device_name: deviceData.deviceName,
        brand: deviceData.brand,
        model: deviceData.model,
        color: deviceData.color,
        purchase_date: deviceData.purchaseDate,
        purchase_price: deviceData.purchasePrice,
        current_owner_id: user.id,
        device_photos: deviceData.devicePhotos,
        receipt_url: deviceData.receiptUrl,
        blockchain_hash: blockchainHash,
        insurance_policy_id: deviceData.insurancePolicyId,
        status: "active"
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    await supabaseClient
      .from("ownership_history")
      .insert({
        device_id: newDevice.id,
        new_owner_id: user.id,
        transfer_type: "initial_registration",
        blockchain_hash: blockchainHash,
        verified: true
      });

    return new Response(
      JSON.stringify({
        success: true,
        device: newDevice,
        blockchainHash,
        message: "Device registered successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Device registration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});