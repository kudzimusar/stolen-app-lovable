import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Get authorization header for user context
    const authHeader = req.headers.get("Authorization");
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser } } = await supabaseClient.auth.getUser(token);
      user = authUser;
    }

    console.log("📋 Fetching marketplace listings with enhanced data...");
    console.log("👤 User context:", user ? user.id : "anonymous");

    // Get query parameters for filtering
    const url = new URL(req.url);
    const listingId = url.searchParams.get("listingId");
    const category = url.searchParams.get("category");
    const location = url.searchParams.get("location");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const condition = url.searchParams.get("condition");
    const search = url.searchParams.get("search");
    const featured = url.searchParams.get("featured");
    const status = url.searchParams.get("status"); // For admin filtering
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    console.log("🔍 Query parameters:", {
      listingId,
      category,
      minPrice,
      maxPrice,
      search,
      featured,
      status,
      page,
      limit
    });

    // Build base query with device join
    let query = supabaseClient
      .from("marketplace_listings")
      .select(`
        *,
        devices (
          id,
          device_name,
          brand,
          model,
          serial_number,
          imei,
          device_photos,
          color,
          storage_capacity,
          status,
          blockchain_hash,
          registration_location_address,
          registration_location_lat,
          registration_location_lng,
          current_owner_id,
          purchase_date,
          purchase_price,
          device_condition,
          warranty_months,
          warranty_expiry_date,
          ram_gb,
          processor,
          screen_size_inch,
          battery_health_percentage,
          trust_score,
          serial_status,
          verification_level,
          blockchain_verified_at,
          created_at
        )
      `, { count: 'exact' });

    // Handle single listing fetch
    if (listingId) {
      query = query.eq("id", listingId);
      console.log("🎯 Fetching single listing:", listingId);
    } else {
      // For listing collections, apply status filter based on context
      if (user && status && status !== 'all') {
        query = query.eq("status", status);
        console.log("👤 User filtering by status:", status);
      } else if (user && status === 'all') {
        console.log("👤 Admin viewing all listings (no status filter)");
      } else if (!user || !status) {
        query = query.in("status", ["approved", "active"]);
        console.log("🌐 Public marketplace showing approved and active listings");
      }

      // Apply category filter
      if (category && category !== "all") {
        query = query.or(`devices.brand.ilike.%${category}%,devices.model.ilike.%${category}%`);
        console.log("📱 Filtering by category:", category);
      }

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,devices.brand.ilike.%${search}%,devices.model.ilike.%${search}%`);
        console.log("🔍 Applying search:", search);
      }

      // Apply price filters
      if (minPrice) {
        query = query.gte("price", parseFloat(minPrice));
        console.log("💰 Min price filter:", minPrice);
      }

      if (maxPrice) {
        query = query.lte("price", parseFloat(maxPrice));
        console.log("💰 Max price filter:", maxPrice);
      }

      // Apply condition filter
      if (condition && condition !== "all") {
        query = query.eq("condition", condition);
        console.log("📦 Condition filter:", condition);
      }

      // Apply featured filter
      if (featured === "true") {
        query = query.eq("featured", true);
        console.log("⭐ Featured filter applied");
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      console.log("📄 Pagination:", { page, limit, offset });
    }

    // Order by featured first, then by creation date
    query = query.order("featured", { ascending: false });
    query = query.order("created_at", { ascending: false });

    const { data: listings, error: listingsError, count } = await query;

    if (listingsError) {
      console.error("❌ Error fetching listings:", listingsError);
      throw listingsError;
    }

    console.log(`✅ Found ${listings?.length || 0} listings (Total: ${count || 0})`);
    
    // Fetch seller data and profiles separately
    const sellerIds = [...new Set(listings?.map(l => l.seller_id).filter(Boolean))];
    const sellersMap = new Map();
    const sellerProfilesMap = new Map();
    
    if (sellerIds.length > 0) {
      console.log("👥 Fetching seller data for", sellerIds.length, "sellers");
      
      // Fetch auth user data
      const { data: sellers, error: sellersError } = await supabaseClient.auth.admin.listUsers();
      
      if (!sellersError && sellers && sellers.users) {
        sellers.users.forEach((seller: any) => {
          if (sellerIds.includes(seller.id)) {
            sellersMap.set(seller.id, seller);
          }
        });
        console.log("✅ Fetched", sellersMap.size, "seller auth profiles");
      }
      
      // Fetch seller profiles from new table
      const { data: sellerProfiles, error: profilesError } = await supabaseClient
        .from("seller_profiles")
        .select("*")
        .in("user_id", sellerIds);
      
      if (!profilesError && sellerProfiles) {
        sellerProfiles.forEach((profile: any) => {
          sellerProfilesMap.set(profile.user_id, profile);
        });
        console.log("✅ Fetched", sellerProfilesMap.size, "seller profiles");
      }
    }
    
    // Fetch enhanced data for all devices
    const deviceIds = [...new Set(listings?.map(l => l.device_id).filter(Boolean))];
    const verificationsMap = new Map();
    const riskAssessmentsMap = new Map();
    const certificatesMap = new Map();
    const repairsMap = new Map();
    const ownershipHistoryMap = new Map();
    
    if (deviceIds.length > 0) {
      console.log("🔍 Fetching enhanced device data for", deviceIds.length, "devices");
      
      // Fetch device verifications
      const { data: verifications } = await supabaseClient
        .from("device_verifications")
        .select("*")
        .in("device_id", deviceIds)
        .eq("status", "verified")
        .order("verification_timestamp", { ascending: false });
      
      if (verifications) {
        verifications.forEach((v: any) => {
          if (!verificationsMap.has(v.device_id)) {
            verificationsMap.set(v.device_id, []);
          }
          verificationsMap.get(v.device_id).push(v);
        });
        console.log("✅ Fetched verifications for", verificationsMap.size, "devices");
      }
      
      // Fetch risk assessments
      const { data: riskAssessments } = await supabaseClient
        .from("device_risk_assessment")
        .select("*")
        .in("device_id", deviceIds)
        .eq("is_active", true);
      
      if (riskAssessments) {
        riskAssessments.forEach((r: any) => {
          riskAssessmentsMap.set(r.device_id, r);
        });
        console.log("✅ Fetched risk assessments for", riskAssessmentsMap.size, "devices");
      }
      
      // Fetch certificates (only active ones)
      const { data: certificates } = await supabaseClient
        .from("device_certificates")
        .select("*")
        .in("device_id", deviceIds)
        .eq("is_active", true)
        .eq("verification_status", "verified");
      
      if (certificates) {
        certificates.forEach((c: any) => {
          if (!certificatesMap.has(c.device_id)) {
            certificatesMap.set(c.device_id, []);
          }
          certificatesMap.get(c.device_id).push(c);
        });
        console.log("✅ Fetched certificates for", certificatesMap.size, "devices");
      }
      
      // Fetch repair history
      const { data: repairs } = await supabaseClient
        .from("device_repairs")
        .select("*")
        .in("device_id", deviceIds)
        .eq("verification_status", "verified")
        .order("repair_date", { ascending: false });
      
      if (repairs) {
        repairs.forEach((r: any) => {
          if (!repairsMap.has(r.device_id)) {
            repairsMap.set(r.device_id, []);
          }
          repairsMap.get(r.device_id).push(r);
        });
        console.log("✅ Fetched repairs for", repairsMap.size, "devices");
      }
      
      // Fetch ownership history
      const { data: ownershipHistory } = await supabaseClient
        .from("device_ownership_history")
        .select("*")
        .in("device_id", deviceIds)
        .eq("verification_status", "verified")
        .order("transfer_date", { ascending: true });
      
      if (ownershipHistory) {
        ownershipHistory.forEach((o: any) => {
          if (!ownershipHistoryMap.has(o.device_id)) {
            ownershipHistoryMap.set(o.device_id, []);
          }
          ownershipHistoryMap.get(o.device_id).push(o);
        });
        console.log("✅ Fetched ownership history for", ownershipHistoryMap.size, "devices");
      }
    }
    
    // Fetch price history for listings
    const listingIdsArray = listings?.map(l => l.id).filter(Boolean) || [];
    const priceHistoryMap = new Map();
    
    if (listingIdsArray.length > 0) {
      const { data: priceHistory } = await supabaseClient
        .from("price_history")
        .select("*")
        .in("listing_id", listingIdsArray)
        .order("recorded_at", { ascending: true });
      
      if (priceHistory) {
        priceHistory.forEach((p: any) => {
          if (!priceHistoryMap.has(p.listing_id)) {
            priceHistoryMap.set(p.listing_id, []);
          }
          priceHistoryMap.get(p.listing_id).push(p);
        });
        console.log("✅ Fetched price history for", priceHistoryMap.size, "listings");
      }
    }

    // Transform data to match marketplace display format with enhanced data
    const transformedListings = listings?.map((listing: any) => {
      const device = listing.devices || {};
      const seller = sellersMap.get(listing.seller_id) || {};
      const sellerProfile = sellerProfilesMap.get(listing.seller_id) || {};
      const verifications = verificationsMap.get(device.id) || [];
      const riskAssessment = riskAssessmentsMap.get(device.id) || null;
      const certificates = certificatesMap.get(device.id) || [];
      const repairs = repairsMap.get(device.id) || [];
      const ownershipHistory = ownershipHistoryMap.get(device.id) || [];
      const priceHistory = priceHistoryMap.get(listing.id) || [];

      // Calculate trust score from various factors
      const trustScore = device.trust_score || 
        (verifications.length > 0 ? verifications[0].confidence_score : 0);
      
      // Determine verification level
      const verificationLevel = device.verification_level || 
        (verifications.length >= 3 ? 'premium' : 
         verifications.length >= 2 ? 'standard' : 'basic');

      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency || "ZAR",
        condition: listing.condition || device.device_condition || "Good",
        conditionRating: listing.condition_rating || 4,
        warrantyMonths: device.warranty_months || listing.warranty_remaining_months || 0,
        warrantyExpiryDate: device.warranty_expiry_date,
        negotiable: listing.negotiable ?? listing.is_negotiable ?? true,
        featured: listing.featured ?? false,
        status: listing.status,
        slug: listing.slug,
        
        // Images and media
        images: device.device_photos || [],
        
        // Device details
        brand: device.brand || "Unknown",
        model: device.model || "Unknown",
        serialNumber: device.serial_number,
        imei: device.imei,
        color: device.color || "Unknown",
        storage: device.storage_capacity || "Unknown",
        ram: device.ram_gb ? `${device.ram_gb}GB` : null,
        processor: device.processor,
        screenSize: device.screen_size_inch,
        batteryHealth: device.battery_health_percentage,
        
        // Location
        location: device.registration_location_address || "Johannesburg",
        locationLat: device.registration_location_lat,
        locationLng: device.registration_location_lng,
        province: "gauteng", // TODO: Extract from address
        
        // Blockchain and verification
        blockchainVerified: !!device.blockchain_hash,
        blockchainHash: device.blockchain_hash,
        blockchainVerifiedAt: device.blockchain_verified_at,
        trustScore: trustScore,
        verificationLevel: verificationLevel,
        serialStatus: device.serial_status || "clean",
        
        // Seller information (enhanced)
        seller: {
          id: seller.id || listing.seller_id,
          name: sellerProfile.full_name || seller.user_metadata?.full_name || seller.email?.split('@')[0] || "Unknown Seller",
          email: seller.email || "unknown@example.com",
          profilePicture: sellerProfile.profile_picture_url,
          rating: sellerProfile.rating || 0,
          totalSales: sellerProfile.total_sales || 0,
          totalReviews: sellerProfile.total_reviews || 0,
          verificationStatus: sellerProfile.verification_status || "pending",
          isPremium: sellerProfile.is_premium || false,
          businessName: sellerProfile.business_name,
          type: sellerProfile.business_name ? "business" : "individual"
        },
        
        // Enhanced marketplace features
        viewsCount: listing.views_count || 0,
        watchlistCount: listing.watchlist_count || 0,
        inquiryCount: listing.inquiry_count || 0,
        clickCount: listing.click_count || 0,
        shareCount: listing.share_count || 0,
        conversionRate: listing.conversion_rate || 0,
        instantBuyEnabled: listing.instant_buy_enabled || false,
        escrowEnabled: listing.escrow_enabled ?? true,
        shippingIncluded: listing.shipping_included || false,
        shippingCost: listing.shipping_cost || 0,
        listingTags: listing.listing_tags || [],
        
        // Dates
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
        expiresAt: listing.expires_at,
        featuredUntil: listing.featured_until,
        purchaseDate: device.purchase_date,
        
        // Enhanced data (full objects for detailed views)
        verifications: verifications.map((v: any) => ({
          method: v.verification_method,
          verifierName: v.verifier_name,
          confidenceScore: v.confidence_score,
          timestamp: v.verification_timestamp,
          status: v.status,
          details: v.verification_details,
          blockchainTxId: v.blockchain_tx_id
        })),
        
        riskAssessment: riskAssessment ? {
          riskScore: riskAssessment.risk_score,
          riskStatus: riskAssessment.risk_status,
          riskFactors: riskAssessment.risk_factors || [],
          assessmentDate: riskAssessment.assessment_date
        } : null,
        
        certificates: certificates.map((c: any) => ({
          type: c.certificate_type,
          issuer: c.issuer,
          issueDate: c.issue_date,
          expiryDate: c.expiry_date,
          certificateUrl: c.certificate_url,
          verificationStatus: c.verification_status
        })),
        
        repairs: repairs.map((r: any) => ({
          type: r.repair_type,
          serviceProvider: r.service_provider,
          date: r.repair_date,
          cost: r.cost,
          description: r.description,
          verificationStatus: r.verification_status
        })),
        
        ownershipHistory: ownershipHistory.map((o: any) => ({
          ownerId: o.owner_id,
          previousOwnerId: o.previous_owner_id,
          transferFrom: o.transfer_from_entity,
          transferDate: o.transfer_date,
          transferMethod: o.transfer_method,
          blockchainTxId: o.blockchain_tx_id,
          verificationStatus: o.verification_status
        })),
        
        priceHistory: priceHistory.map((p: any) => ({
          price: p.price,
          currency: p.currency,
          changeType: p.price_change_type,
          recordedAt: p.recorded_at
        })),
        
        // Additional fields for admin
        deviceId: device.id,
        deviceStatus: device.status,
        sellerId: listing.seller_id,
        purchasePrice: device.purchase_price
      };
    }) || [];

    console.log("✅ Transformed", transformedListings.length, "listings with enhanced data");

    // Prepare response
    const response = {
      success: true,
      listings: transformedListings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      context: {
        user: user ? { id: user.id, email: user.email } : null,
        filters: {
          category,
          search,
          minPrice,
          maxPrice,
          featured,
          status
        }
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("❌ Marketplace listings API error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
