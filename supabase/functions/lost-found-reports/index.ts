import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LostFoundReport {
  id?: string;
  user_id?: string;
  report_type: "lost" | "found";
  device_category: string;
  device_model?: string;
  serial_number?: string;
  description: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  incident_date?: string;
  reward_amount?: number;
  contact_preferences?: any;
  privacy_settings?: any;
  photos?: string[];
  documents?: string[];
}

interface ReportResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
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

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    switch (req.method) {
      case "POST":
        return await handleCreateReport(req, supabaseServiceClient, user);
      
      case "GET":
        if (path === "nearby") {
          return await handleGetNearbyReports(req, supabaseServiceClient, user);
        } else if (path === "user") {
          return await handleGetUserReports(req, supabaseServiceClient, user);
        } else if (path === "matches") {
          return await handleGetMatches(req, supabaseServiceClient, user);
        } else {
          return await handleGetReports(req, supabaseServiceClient, user);
        }
      
      case "PUT":
        return await handleUpdateReport(req, supabaseServiceClient, user);
      
      case "DELETE":
        return await handleDeleteReport(req, supabaseServiceClient, user);
      
      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error("Lost and Found API error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleCreateReport(req: Request, supabase: any, user: any): Promise<Response> {
  const reportData: LostFoundReport = await req.json();
  
  // Validate required fields
  if (!reportData.report_type || !reportData.device_category || !reportData.description) {
    throw new Error("Missing required fields: report_type, device_category, description");
  }

  // Prepare report data
  const reportPayload = {
    user_id: user.id,
    report_type: reportData.report_type,
    device_category: reportData.device_category,
    device_model: reportData.device_model,
    serial_number: reportData.serial_number,
    description: reportData.description,
    location_lat: reportData.location_lat,
    location_lng: reportData.location_lng,
    location_address: reportData.location_address,
    incident_date: reportData.incident_date,
    reward_amount: reportData.reward_amount,
    contact_preferences: reportData.contact_preferences || {},
    privacy_settings: reportData.privacy_settings || {},
    photos: reportData.photos || [],
    documents: reportData.documents || []
  };

  // Insert report
  const { data: report, error } = await supabase
    .from("lost_found_reports")
    .insert(reportPayload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Check for potential matches
  const matches = await findPotentialMatches(supabase, report);

  // Send notifications to nearby users
  await sendNearbyNotifications(supabase, report);

  return new Response(
    JSON.stringify({
      success: true,
      data: report,
      matches: matches.length,
      message: `${reportData.report_type} report created successfully`
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetReports(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const reportType = url.searchParams.get("type");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = supabase
    .from("lost_found_reports")
    .select(`
      *,
      users!inner(display_name, avatar_url),
      user_reputation!inner(reputation_score, trust_level)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (reportType) {
    query = query.eq("report_type", reportType);
  }

  const { data: reports, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: reports,
      pagination: {
        limit,
        offset,
        hasMore: reports.length === limit
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetUserReports(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || user.id;
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const { data: reports, error } = await supabase
    .from("lost_found_reports")
    .select(`
      *,
      community_tips(count),
      device_matches!lost_report_id(count)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: reports,
      pagination: {
        limit,
        offset,
        hasMore: reports.length === limit
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetNearbyReports(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get("lat") || "0");
  const lng = parseFloat(url.searchParams.get("lng") || "0");
  const radius = parseFloat(url.searchParams.get("radius") || "10");

  if (!lat || !lng) {
    throw new Error("Latitude and longitude are required");
  }

  // Use the database function to find nearby reports
  const { data: nearbyReports, error } = await supabase
    .rpc("find_nearby_reports", {
      search_lat: lat,
      search_lng: lng,
      radius_km: radius
    });

  if (error) {
    throw error;
  }

  // Get full report details for nearby reports
  const reportIds = nearbyReports.map((r: any) => r.id);
  const { data: fullReports, error: fullError } = await supabase
    .from("lost_found_reports")
    .select(`
      *,
      users!inner(display_name, avatar_url),
      user_reputation!inner(reputation_score, trust_level)
    `)
    .in("id", reportIds);

  if (fullError) {
    throw fullError;
  }

  // Merge distance data with full reports
  const reportsWithDistance = fullReports.map((report: any) => {
    const nearbyData = nearbyReports.find((r: any) => r.id === report.id);
    return {
      ...report,
      distance_km: nearbyData?.distance_km
    };
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: reportsWithDistance,
      search_params: { lat, lng, radius }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetMatches(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");

  if (!reportId) {
    throw new Error("Report ID is required");
  }

  const { data: matches, error } = await supabase
    .from("device_matches")
    .select(`
      *,
      lost_found_reports!lost_report_id(*),
      lost_found_reports!found_report_id(*)
    `)
    .or(`lost_report_id.eq.${reportId},found_report_id.eq.${reportId}`)
    .order("match_confidence", { ascending: false });

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: matches
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleUpdateReport(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const reportId = url.pathname.split("/").pop();
  const updateData = await req.json();

  // Verify user owns the report
  const { data: existingReport, error: checkError } = await supabase
    .from("lost_found_reports")
    .select("user_id")
    .eq("id", reportId)
    .single();

  if (checkError || !existingReport) {
    throw new Error("Report not found");
  }

  if (existingReport.user_id !== user.id) {
    throw new Error("Unauthorized to update this report");
  }

  const { data: updatedReport, error } = await supabase
    .from("lost_found_reports")
    .update(updateData)
    .eq("id", reportId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedReport,
      message: "Report updated successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleDeleteReport(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const reportId = url.pathname.split("/").pop();

  // Verify user owns the report
  const { data: existingReport, error: checkError } = await supabase
    .from("lost_found_reports")
    .select("user_id")
    .eq("id", reportId)
    .single();

  if (checkError || !existingReport) {
    throw new Error("Report not found");
  }

  if (existingReport.user_id !== user.id) {
    throw new Error("Unauthorized to delete this report");
  }

  const { error } = await supabase
    .from("lost_found_reports")
    .delete()
    .eq("id", reportId);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Report deleted successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function findPotentialMatches(supabase: any, report: any): Promise<any[]> {
  if (!report.location_lat || !report.location_lng) {
    return [];
  }

  // Find reports of opposite type within 10km
  const { data: nearbyReports } = await supabase
    .rpc("find_nearby_reports", {
      search_lat: report.location_lat,
      search_lng: report.location_lng,
      radius_km: 10
    });

  const oppositeType = report.report_type === "lost" ? "found" : "lost";
  const potentialMatches = nearbyReports.filter((r: any) => r.report_type === oppositeType);

  // Create match records for high-confidence matches
  const matches = [];
  for (const match of potentialMatches) {
    const confidence = calculateMatchConfidence(report, match);
    if (confidence > 0.7) {
      const matchData = {
        lost_report_id: report.report_type === "lost" ? report.id : match.id,
        found_report_id: report.report_type === "found" ? report.id : match.id,
        match_confidence: confidence,
        match_criteria: {
          location_match: true,
          device_category_match: report.device_category === match.device_category,
          time_proximity: true
        },
        status: "pending"
      };

      const { data: createdMatch } = await supabase
        .from("device_matches")
        .insert(matchData)
        .select()
        .single();

      if (createdMatch) {
        matches.push(createdMatch);
      }
    }
  }

  return matches;
}

function calculateMatchConfidence(report1: any, report2: any): number {
  let confidence = 0;

  // Location match (40% weight)
  if (report1.location_lat && report2.location_lat) {
    const distance = calculateDistance(
      report1.location_lat, report1.location_lng,
      report2.location_lat, report2.location_lng
    );
    if (distance <= 1) confidence += 0.4;
    else if (distance <= 5) confidence += 0.2;
    else if (distance <= 10) confidence += 0.1;
  }

  // Device category match (30% weight)
  if (report1.device_category === report2.device_category) {
    confidence += 0.3;
  }

  // Device model match (20% weight)
  if (report1.device_model && report2.device_model && 
      report1.device_model.toLowerCase() === report2.device_model.toLowerCase()) {
    confidence += 0.2;
  }

  // Time proximity (10% weight)
  const timeDiff = Math.abs(new Date(report1.created_at).getTime() - new Date(report2.created_at).getTime());
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  if (daysDiff <= 7) confidence += 0.1;
  else if (daysDiff <= 30) confidence += 0.05;

  return Math.min(confidence, 1);
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function sendNearbyNotifications(supabase: any, report: any): Promise<void> {
  if (!report.location_lat || !report.location_lng) {
    return;
  }

  // Get users with notification preferences for this area
  const { data: users } = await supabase
    .from("user_notifications")
    .select(`
      user_id,
      preferences
    `)
    .eq("notification_type", "lost_found");

  for (const user of users || []) {
    const preferences = user.preferences;
    const radius = preferences.radius_km || 10;
    
    // Check if user is within notification radius
    const { data: nearbyReports } = await supabase
      .rpc("find_nearby_reports", {
        search_lat: report.location_lat,
        search_lng: report.location_lng,
        radius_km: radius
      });

    if (nearbyReports && nearbyReports.length > 0) {
      // TODO: Send actual notification (email, push, SMS)
      console.log(`Sending notification to user ${user.user_id} about new ${report.report_type} report`);
    }
  }
}
