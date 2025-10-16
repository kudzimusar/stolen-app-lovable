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

    console.log("📋 Fetching marketplace listings...");
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

    // Build base query with device join only
    // Note: Can't join auth.users directly via PostgREST, will fetch seller data separately
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
          device_photos,
          color,
          storage_capacity,
          status,
          blockchain_hash,
          registration_location_address,
          current_owner_id,
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
          // Admin or authenticated user can filter by specific status
          query = query.eq("status", status);
          console.log("👤 User filtering by status:", status);
        } else if (user && status === 'all') {
          // Admin viewing all statuses - no status filter
          console.log("👤 Admin viewing all listings (no status filter)");
        } else if (!user || !status) {
          // Public marketplace shows approved and active listings
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
    
    // Fetch seller data separately for all unique seller IDs
    const sellerIds = [...new Set(listings?.map(l => l.seller_id).filter(Boolean))];
    const sellersMap = new Map();
    
    if (sellerIds.length > 0) {
      console.log("👥 Fetching seller data for", sellerIds.length, "sellers");
      
      // Use admin client to fetch user data
      const { data: sellers, error: sellersError } = await supabaseClient.auth.admin.listUsers();
      
      if (!sellersError && sellers && sellers.users) {
        sellers.users.forEach((seller: any) => {
          if (sellerIds.includes(seller.id)) {
            sellersMap.set(seller.id, seller);
          }
        });
        console.log("✅ Fetched", sellersMap.size, "seller profiles");
      } else {
        console.warn("⚠️ Could not fetch seller data:", sellersError?.message);
      }
    }
    
    // Debug: Log first listing if any exist
    if (listings && listings.length > 0) {
      const firstListing = listings[0];
      const firstSeller = sellersMap.get(firstListing.seller_id);
      
      console.log("📋 First listing sample:", {
        id: firstListing.id,
        title: firstListing.title,
        price: firstListing.price,
        status: firstListing.status,
        device_id: firstListing.device_id,
        seller_id: firstListing.seller_id,
        device_name: firstListing.devices?.device_name,
        seller_email: firstSeller?.email || 'unknown'
      });
    } else {
      console.log("⚠️ No listings found. Possible reasons:");
      console.log("  - Database migration not applied");
      console.log("  - No listings created yet");
      console.log("  - RLS policies blocking access");
      console.log("  - Listings not approved by admin yet");
      console.log("  - Wrong status filter applied");
    }

    // Transform data to match marketplace display format
    const transformedListings = listings?.map((listing: any) => {
      const device = listing.devices || {};
      const seller = sellersMap.get(listing.seller_id) || {};

      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency || "USD",
        condition: listing.condition || "Good",
        conditionRating: listing.condition_rating || 4,
        warrantyMonths: listing.warranty_remaining_months || 0,
        negotiable: listing.negotiable ?? true,
        featured: listing.featured ?? false,
        status: listing.status,
        images: device.device_photos || [],
        brand: device.brand || "Unknown",
        model: device.model || "Unknown",
        color: device.color || "Unknown",
        storage: device.storage_capacity || "Unknown",
        location: device.registration_location_address || "Johannesburg",
        province: "gauteng",
        blockchainVerified: !!device.blockchain_hash,
        blockchainHash: device.blockchain_hash,
        seller: {
          id: seller.id || listing.seller_id,
          name: seller.user_metadata?.full_name || seller.email?.split('@')[0] || "Unknown Seller",
          email: seller.email || "unknown@example.com",
          type: "individual" // Default for now
        },
        createdAt: listing.created_at,
        views: listing.views_count || 0,
        watchlist: listing.watchlist_count || 0,
        inquiries: listing.inquiry_count || 0,
        // Additional fields for admin
        deviceId: device.id,
        deviceStatus: device.status,
        sellerId: listing.seller_id
      };
    }) || [];

    // Prepare response based on context
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