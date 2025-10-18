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

    console.log("📱 My Devices API (Enhanced) - User:", user.id);

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
  console.log("🔍 Fetching devices with enhanced data for user:", user.id);

  // Fetch devices with marketplace listings
  const { data: devices, error: devicesError } = await supabase
    .from("devices")
    .select(`
      *,
      marketplace_listings!marketplace_listings_device_id_fkey(
        id,
        title,
        price,
        status,
        featured,
        views_count,
        watchlist_count,
        inquiry_count,
        created_at,
        updated_at
      )
    `)
    .eq("current_owner_id", user.id)
    .order("created_at", { ascending: false });

  if (devicesError) {
    console.error("Error fetching devices:", devicesError);
    throw devicesError;
  }

  console.log(`✅ Found ${devices?.length || 0} devices`);

  // Get all device IDs for enhanced data fetch
  const deviceIds = devices?.map(d => d.id) || [];

  // Fetch enhanced data for all devices
  const [verificationsData, certificatesData, repairsData, ownershipData, riskData] = await Promise.all([
    // Fetch verifications
    supabase
      .from("device_verifications")
      .select("*")
      .in("device_id", deviceIds)
      .eq("status", "verified")
      .order("verification_timestamp", { ascending: false }),
    
    // Fetch certificates
    supabase
      .from("device_certificates")
      .select("*")
      .in("device_id", deviceIds)
      .eq("is_active", true)
      .order("issue_date", { ascending: false }),
    
    // Fetch repairs
    supabase
      .from("device_repairs")
      .select("*")
      .in("device_id", deviceIds)
      .order("repair_date", { ascending: false }),
    
    // Fetch ownership history
    supabase
      .from("device_ownership_history")
      .select("*")
      .in("device_id", deviceIds)
      .order("transfer_date", { ascending: true }),
    
    // Fetch risk assessments
    supabase
      .from("device_risk_assessment")
      .select("*")
      .in("device_id", deviceIds)
      .eq("is_active", true)
  ]);

  // Create maps for quick lookup
  const verificationsMap = new Map();
  verificationsData.data?.forEach((v: any) => {
    if (!verificationsMap.has(v.device_id)) {
      verificationsMap.set(v.device_id, []);
    }
    verificationsMap.get(v.device_id).push(v);
  });

  const certificatesMap = new Map();
  certificatesData.data?.forEach((c: any) => {
    if (!certificatesMap.has(c.device_id)) {
      certificatesMap.set(c.device_id, []);
    }
    certificatesMap.get(c.device_id).push(c);
  });

  const repairsMap = new Map();
  repairsData.data?.forEach((r: any) => {
    if (!repairsMap.has(r.device_id)) {
      repairsMap.set(r.device_id, []);
    }
    repairsMap.get(r.device_id).push(r);
  });

  const ownershipMap = new Map();
  ownershipData.data?.forEach((o: any) => {
    if (!ownershipMap.has(o.device_id)) {
      ownershipMap.set(o.device_id, []);
    }
    ownershipMap.get(o.device_id).push(o);
  });

  const riskMap = new Map();
  riskData.data?.forEach((r: any) => {
    riskMap.set(r.device_id, r);
  });

  console.log(`✅ Loaded enhanced data:
    - Verifications: ${verificationsMap.size} devices
    - Certificates: ${certificatesMap.size} devices
    - Repairs: ${repairsMap.size} devices
    - Ownership History: ${ownershipMap.size} devices
    - Risk Assessments: ${riskMap.size} devices`);

  // Transform devices with all enhanced data
  const transformedDevices = devices?.map((device) => {
    // Get enhanced data for this device
    const verifications = verificationsMap.get(device.id) || [];
    const certificates = certificatesMap.get(device.id) || [];
    const repairs = repairsMap.get(device.id) || [];
    const ownershipHistory = ownershipMap.get(device.id) || [];
    const riskAssessment = riskMap.get(device.id) || null;

    // Calculate warranty expiry
    let warrantyExpiry = device.warranty_expiry_date;
    if (!warrantyExpiry && device.purchase_date && device.warranty_months) {
      const purchaseDate = new Date(device.purchase_date);
      purchaseDate.setMonth(purchaseDate.getMonth() + device.warranty_months);
      warrantyExpiry = purchaseDate.toISOString().split('T')[0];
    }

    // Calculate insurance status
    let insuranceStatus = 'expired';
    if (device.insurance_policy_id) {
      if (warrantyExpiry && new Date(warrantyExpiry) > new Date()) {
        insuranceStatus = 'active';
      }
    }

    // Get transfer count from ownership history
    const transferCount = ownershipHistory.length;

    // Calculate current value with depreciation
    let currentValue = device.estimated_value || device.purchase_price;
    if (!currentValue && device.purchase_date && device.purchase_price) {
      const yearsSincePurchase = (Date.now() - new Date(device.purchase_date).getTime()) / (365 * 24 * 60 * 60 * 1000);
      const depreciationRate = device.depreciation_rate || 0.10;
      currentValue = device.purchase_price * Math.pow(1 - depreciationRate, yearsSincePurchase);
    }

    // Extract active marketplace listing
    const activeListing = device.marketplace_listings?.find((listing: any) => 
      ['approved', 'pending', 'active'].includes(listing.status)
    );
    
    const marketplaceStatus = {
      isListed: !!activeListing,
      listingId: activeListing?.id || null,
      listingTitle: activeListing?.title || null,
      listingPrice: activeListing?.price || null,
      isFeatured: activeListing?.featured || false,
      viewCount: activeListing?.views_count || 0,
      watchlistCount: activeListing?.watchlist_count || 0,
      inquiryCount: activeListing?.inquiry_count || 0,
      listedAt: activeListing?.created_at || null,
      lastUpdated: activeListing?.updated_at || null
    };

    // Calculate trust score
    const trustScore = device.trust_score || 
      (verifications.length > 0 ? Math.round(verifications.reduce((sum: number, v: any) => sum + (v.confidence_score || 0), 0) / verifications.length) : 0);

    return {
      // Basic device info
      id: device.id,
      name: device.device_name,
      brand: device.brand,
      model: device.model,
      serial: device.serial_number,
      imei: device.imei,
      status: device.status,
      serialStatus: device.serial_status || "clean",
      
      // Dates
      registrationDate: device.registration_date || device.created_at,
      purchaseDate: device.purchase_date,
      lastVerifiedDate: device.last_verified_date,
      lastSeenDate: device.last_seen_date,
      
      // Financial
      purchasePrice: device.purchase_price,
      currentValue: Math.round(currentValue),
      estimatedValue: device.estimated_value,
      recommendedPrice: device.recommended_price,
      priceRangeMin: device.price_range_min,
      priceRangeMax: device.price_range_max,
      
      // Location
      location: getLocationString(device),
      registrationLocationLat: device.registration_location_lat,
      registrationLocationLng: device.registration_location_lng,
      registrationLocationAddress: device.registration_location_address,
      lastSeenLocationLat: device.last_seen_location_lat,
      lastSeenLocationLng: device.last_seen_location_lng,
      
      // Warranty and insurance
      warrantyExpiry,
      warrantyMonths: device.warranty_months,
      warrantyExpiryDate: device.warranty_expiry_date,
      insuranceStatus,
      insurancePolicyId: device.insurance_policy_id,
      
      // Media and documents
      photos: device.device_photos || [],
      photoCount: device.device_photos?.length || 0,
      color: device.color,
      receiptUrl: device.receipt_url,
      proofOfPurchaseUrl: device.proof_of_purchase_url,
      userIdentityUrl: device.user_identity_url,
      warrantyDocumentUrl: device.warranty_document_url,
      registrationCertificateUrl: device.registration_certificate_url,
      
      // Device specifications
      storageCapacity: device.storage_capacity,
      deviceCondition: device.device_condition,
      ramGb: device.ram_gb,
      processor: device.processor,
      screenSizeInch: device.screen_size_inch,
      batteryHealthPercentage: device.battery_health_percentage,
      deviceAgeMonths: device.device_age_months,
      
      // Blockchain and verification
      blockchainHash: device.blockchain_hash,
      blockchainVerified: !!device.blockchain_hash,
      blockchainVerifiedAt: device.blockchain_verified_at,
      trustScore: trustScore,
      verificationLevel: device.verification_level || "basic",
      lastRiskAssessmentDate: device.last_risk_assessment_date,
      
      // Marketplace
      isMarketplaceEligible: device.is_marketplace_eligible ?? true,
      marketplaceRestrictions: device.marketplace_restrictions || [],
      marketplaceStatus: marketplaceStatus,
      
      // Counts
      transfers: transferCount,
      verificationCount: verifications.length,
      certificateCount: certificates.length,
      repairCount: repairs.length,
      
      // Enhanced data arrays
      verifications: verifications.map((v: any) => ({
        id: v.id,
        method: v.verification_method,
        verifierName: v.verifier_name,
        confidenceScore: v.confidence_score,
        timestamp: v.verification_timestamp,
        status: v.status,
        details: v.verification_details,
        blockchainTxId: v.blockchain_tx_id
      })),
      
      certificates: certificates.map((c: any) => ({
        id: c.id,
        type: c.certificate_type,
        issuer: c.issuer,
        certificateNumber: c.certificate_number,
        issueDate: c.issue_date,
        expiryDate: c.expiry_date,
        certificateUrl: c.certificate_url,
        verificationStatus: c.verification_status,
        isActive: c.is_active
      })),
      
      repairs: repairs.map((r: any) => ({
        id: r.id,
        type: r.repair_type,
        serviceProvider: r.service_provider,
        date: r.repair_date,
        cost: r.cost,
        description: r.description,
        warrantyAfterRepairMonths: r.warranty_after_repair_months,
        verificationStatus: r.verification_status,
        receiptUrl: r.receipt_url
      })),
      
      ownershipHistory: ownershipHistory.map((o: any) => ({
        id: o.id,
        ownerId: o.owner_id,
        previousOwnerId: o.previous_owner_id,
        transferFrom: o.transfer_from_entity,
        transferDate: o.transfer_date,
        transferMethod: o.transfer_method,
        blockchainTxId: o.blockchain_tx_id,
        verificationStatus: o.verification_status,
        receiptUrl: o.receipt_url,
        warrantyCardUrl: o.warranty_card_url,
        salesAgreementUrl: o.sales_agreement_url,
        certificateUrl: o.certificate_url
      })),
      
      riskAssessment: riskAssessment ? {
        riskScore: riskAssessment.risk_score,
        riskStatus: riskAssessment.risk_status,
        riskFactors: riskAssessment.risk_factors || [],
        assessmentDate: riskAssessment.assessment_date,
        assessedBy: riskAssessment.assessed_by
      } : null
    };
  }) || [];

  const stats = calculateStats(transformedDevices);

  console.log(`✅ Transformed ${transformedDevices.length} devices with complete enhanced data`);

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
    .select("status, purchase_price, estimated_value, insurance_policy_id, is_marketplace_eligible")
    .eq("current_owner_id", user.id);

  if (error) {
    throw error;
  }

  const stats = {
    total: devices?.length || 0,
    active: devices?.filter((d) => d.status === 'active').length || 0,
    reported: devices?.filter((d) => ['lost', 'stolen'].includes(d.status)).length || 0,
    totalValue: devices?.reduce((sum, d) => sum + (d.estimated_value || d.purchase_price || 0), 0) || 0,
    insured: devices?.filter((d) => d.insurance_policy_id).length || 0,
    marketplaceEligible: devices?.filter((d) => d.is_marketplace_eligible !== false).length || 0
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
    insured: devices.filter((d) => d.insuranceStatus === 'active').length,
    listed: devices.filter((d) => d.marketplaceStatus?.isListed).length,
    verified: devices.filter((d) => d.blockchainVerified).length,
    highTrustScore: devices.filter((d) => d.trustScore >= 80).length
  };
}

function getLocationString(device) {
  if (device.registration_location_address) {
    return device.registration_location_address;
  }
  if (device.status === 'lost' || device.status === 'stolen') {
    return "Last seen: Johannesburg, GP";
  }
  return "Cape Town, WC";
}
