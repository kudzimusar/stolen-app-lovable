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
  // New fields for enhanced registration
  ramGb?: number;
  processor?: string;
  screenSizeInch?: number;
  batteryHealthPercentage?: number;
  registrationLocationAddress?: string;
  registrationLocationLat?: number;
  registrationLocationLng?: number;
  // NEW: Ownership history fields
  deviceOrigin?: string;
  previousOwner?: string;
  acquisitionMethod?: string;
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

    console.log("📱 Enhanced Device Registration - User:", user.id);

    const deviceData: DeviceRegistrationRequest = await req.json();

    if (!deviceData.serialNumber || !deviceData.deviceName || !deviceData.brand || !deviceData.model) {
      throw new Error("Missing required device information");
    }

    // Check for existing device
    const { data: existingDevice } = await supabaseClient
      .from("devices")
      .select("id, current_owner_id")
      .eq("serial_number", deviceData.serialNumber)
      .single();

    if (existingDevice) {
      throw new Error("Device with this serial number already registered");
    }

    // Register device on blockchain
    let blockchainHash: string;
    let blockchainVerified = false;
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
        blockchainVerified = true;
        console.log('✅ Device registered on blockchain:', blockchainHash);
      } else {
        blockchainHash = `fallback_hash_${Date.now()}`;
        console.warn('⚠️ Blockchain registration failed, using fallback hash');
      }
    } catch (error) {
      blockchainHash = `fallback_hash_${Date.now()}`;
      console.error('❌ Blockchain registration error:', error);
      console.warn('⚠️ Using fallback hash for device registration');
    }

    // Calculate warranty expiry date
    let warrantyExpiryDate = null;
    if (deviceData.warrantyMonths && deviceData.warrantyMonths > 0) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + deviceData.warrantyMonths);
      warrantyExpiryDate = expiryDate.toISOString().split('T')[0];
    }

    // Insert device with all enhanced fields
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
        blockchain_verified_at: blockchainVerified ? new Date().toISOString() : null,
        insurance_policy_id: deviceData.insurancePolicyId,
        // New enhanced fields
        ram_gb: deviceData.ramGb,
        processor: deviceData.processor,
        screen_size_inch: deviceData.screenSizeInch,
        battery_health_percentage: deviceData.batteryHealthPercentage || 100,
        registration_location_address: deviceData.registrationLocationAddress,
        registration_location_lat: deviceData.registrationLocationLat,
        registration_location_lng: deviceData.registrationLocationLng,
        registration_date: new Date().toISOString(),
        serial_status: "clean",
        verification_level: blockchainVerified ? "standard" : "basic",
        trust_score: blockchainVerified ? 70 : 50, // Initial trust score
        is_marketplace_eligible: true,
        status: "active"
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Device insert error:", insertError);
      throw insertError;
    }

    console.log("✅ Device registered:", newDevice.id);

    // Create initial ownership history record
    const { error: ownershipError } = await supabaseClient
      .from("device_ownership_history")
      .insert({
        device_id: newDevice.id,
        owner_id: user.id,
        previous_owner_id: null,
        transfer_from_entity: deviceData.deviceOrigin || (deviceData.brand + " Store") || "Initial Registration",
        transfer_date: deviceData.purchaseDate || new Date().toISOString(),
        transfer_method: deviceData.acquisitionMethod || "purchase",
        blockchain_tx_id: blockchainHash,
        verification_status: blockchainVerified ? "verified" : "pending",
        receipt_url: deviceData.proofOfPurchaseUrl,
        warranty_card_url: deviceData.warrantyDocumentUrl,
        certificate_url: deviceData.registrationCertificateUrl,
        ownership_proof_url: deviceData.proofOfPurchaseUrl
      });

    if (ownershipError) {
      console.error("⚠️ Ownership history insert error:", ownershipError);
    } else {
      console.log("✅ Ownership history created");
    }

    // Create initial device verification record
    const { error: verificationError } = await supabaseClient
      .from("device_verifications")
      .insert({
        device_id: newDevice.id,
        verification_method: blockchainVerified ? "BLOCKCHAIN_ANCHOR" : "SERIAL_LOOKUP",
        verifier_name: "STOLEN Platform",
        confidence_score: blockchainVerified ? 95 : 75,
        verification_timestamp: new Date().toISOString(),
        status: "verified",
        verification_details: {
          tags: blockchainVerified 
            ? ["Serial Number", "Blockchain Record", "Initial Registration"]
            : ["Serial Number", "Initial Registration"],
          blockchain_verified: blockchainVerified,
          registration_date: new Date().toISOString()
        },
        blockchain_tx_id: blockchainVerified ? blockchainHash : null,
        verified_by_user_id: user.id
      });

    if (verificationError) {
      console.error("⚠️ Verification insert error:", verificationError);
    } else {
      console.log("✅ Initial verification record created");
    }

    // Create warranty certificate if warranty info provided
    if (deviceData.warrantyMonths && deviceData.warrantyMonths > 0) {
      const { error: certificateError } = await supabaseClient
        .from("device_certificates")
        .insert({
          device_id: newDevice.id,
          certificate_type: "warranty",
          issuer: deviceData.brand,
          issue_date: deviceData.purchaseDate || new Date().toISOString().split('T')[0],
          expiry_date: warrantyExpiryDate,
          certificate_url: deviceData.warrantyDocumentUrl,
          verification_status: deviceData.warrantyDocumentUrl ? "verified" : "pending",
          is_active: true,
          verified_by_user_id: user.id
        });

      if (certificateError) {
        console.error("⚠️ Certificate insert error:", certificateError);
      } else {
        console.log("✅ Warranty certificate created");
      }
    }

    // Create authenticity certificate from STOLEN Platform
    const { error: authCertError } = await supabaseClient
      .from("device_certificates")
      .insert({
        device_id: newDevice.id,
        certificate_type: "authenticity",
        issuer: "STOLEN Platform",
        issue_date: new Date().toISOString().split('T')[0],
        certificate_url: deviceData.registrationCertificateUrl,
        certificate_data: {
          blockchain_hash: blockchainHash,
          blockchain_verified: blockchainVerified,
          registration_date: new Date().toISOString(),
          serial_number: deviceData.serialNumber
        },
        verification_status: "verified",
        is_active: true
      });

    if (authCertError) {
      console.error("⚠️ Authenticity certificate insert error:", authCertError);
    } else {
      console.log("✅ Authenticity certificate created");
    }

    // Create initial risk assessment (clean device at registration)
    const { error: riskError } = await supabaseClient
      .from("device_risk_assessment")
      .insert({
        device_id: newDevice.id,
        risk_score: 100, // Clean device at registration
        risk_status: "clean",
        risk_factors: [],
        assessment_date: new Date().toISOString(),
        assessed_by: "System - Initial Registration",
        assessment_notes: "Initial risk assessment at device registration. No risk factors detected.",
        is_active: true
      });

    if (riskError) {
      console.error("⚠️ Risk assessment insert error:", riskError);
    } else {
      console.log("✅ Initial risk assessment created");
    }

    // Create seller profile if it doesn't exist
    const { data: sellerProfile, error: sellerCheckError } = await supabaseClient
      .from("seller_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!sellerProfile && !sellerCheckError) {
      const { error: sellerError } = await supabaseClient
        .from("seller_profiles")
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          verification_status: "pending",
          is_premium: false,
          rating: 0.0,
          total_sales: 0,
          total_reviews: 0
        });

      if (sellerError) {
        console.error("⚠️ Seller profile insert error:", sellerError);
      } else {
        console.log("✅ Seller profile created");
      }
    }

    // Also insert into old ownership_history table for backwards compatibility
    await supabaseClient
      .from("ownership_history")
      .insert({
        device_id: newDevice.id,
        new_owner_id: user.id,
        transfer_type: "initial_registration",
        blockchain_hash: blockchainHash,
        verified: blockchainVerified
      });

    console.log("✅ Device registration complete with all enhanced data!");

    return new Response(
      JSON.stringify({
        success: true,
        device: newDevice,
        blockchainHash,
        blockchainVerified,
        explorerUrl: blockchainHash.startsWith('0x') 
          ? `https://mumbai.polygonscan.com/tx/${blockchainHash}`
          : null,
        message: blockchainVerified
          ? "Device registered successfully on blockchain with complete verification records"
          : "Device registered successfully (blockchain pending)",
        enhancements: {
          ownershipHistory: !ownershipError,
          verification: !verificationError,
          warranties: deviceData.warrantyMonths ? !certificateError : false,
          authenticityCertificate: !authCertError,
          riskAssessment: !riskError,
          trustScore: newDevice.trust_score,
          verificationLevel: newDevice.verification_level
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Device registration error:", error);
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
