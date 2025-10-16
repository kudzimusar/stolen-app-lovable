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
  storageCapacity?: string;
  deviceCondition?: string;
  warrantyMonths?: number;
  devicePhotos?: string[];
  proofOfPurchaseUrl?: string;
  userIdentityUrl?: string;
  warrantyDocumentUrl?: string;
  registrationCertificateUrl?: string;
  insurancePolicyId?: string;
}

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

    let blockchainHash: string;
    try {
      const blockchainResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/blockchain-anchor-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
        },
        body: JSON.stringify({
          deviceId: deviceData.serialNumber,
          deviceName: deviceData.deviceName,
          brand: deviceData.brand,
          model: deviceData.model,
          ownerId: user.id
        })
      });

      if (blockchainResponse.ok) {
        const blockchainResult = await blockchainResponse.json();
        blockchainHash = blockchainResult.data.transactionHash;
        console.log('Device registered on blockchain:', blockchainHash);
      } else {
        blockchainHash = `fallback_hash_${Date.now()}`;
        console.warn('Blockchain registration failed, using fallback hash');
      }
    } catch (error) {
      blockchainHash = `fallback_hash_${Date.now()}`;
      console.error('Blockchain registration error:', error);
      console.warn('Using fallback hash for device registration');
    }

    let warrantyExpiryDate = null;
    if (deviceData.warrantyMonths && deviceData.warrantyMonths > 0) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + deviceData.warrantyMonths);
      warrantyExpiryDate = expiryDate.toISOString().split('T')[0];
    }

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
        storage_capacity: deviceData.storageCapacity,
        device_condition: deviceData.deviceCondition,
        warranty_months: deviceData.warrantyMonths,
        warranty_expiry_date: warrantyExpiryDate,
        current_owner_id: user.id,
        device_photos: deviceData.devicePhotos,
        proof_of_purchase_url: deviceData.proofOfPurchaseUrl,
        receipt_url: deviceData.proofOfPurchaseUrl,
        user_identity_url: deviceData.userIdentityUrl,
        warranty_document_url: deviceData.warrantyDocumentUrl,
        registration_certificate_url: deviceData.registrationCertificateUrl,
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
        blockchainVerified: !blockchainHash.startsWith('fallback'),
        explorerUrl: blockchainHash.startsWith('0x') 
          ? `https://mumbai.polygonscan.com/tx/${blockchainHash}`
          : null,
        message: blockchainHash.startsWith('0x') 
          ? "Device registered successfully on blockchain"
          : "Device registered successfully (blockchain pending)"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Device registration error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
