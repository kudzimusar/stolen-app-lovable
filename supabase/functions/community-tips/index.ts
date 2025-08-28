import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommunityTip {
  id?: string;
  report_id: string;
  tipster_id?: string;
  tip_type: "sighting" | "information" | "contact";
  tip_description: string;
  tip_location_lat?: number;
  tip_location_lng?: number;
  tip_location_address?: string;
  contact_method?: string;
  anonymous?: boolean;
  verified?: boolean;
  reward_claimed?: boolean;
  reward_amount?: number;
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
    let user = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
      if (!authError && authUser) {
        user = authUser;
      }
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    switch (req.method) {
      case "POST":
        return await handleCreateTip(req, supabaseServiceClient, user);
      
      case "GET":
        if (path === "report") {
          return await handleGetTipsForReport(req, supabaseServiceClient, user);
        } else if (path === "user") {
          return await handleGetUserTips(req, supabaseServiceClient, user);
        } else {
          return await handleGetTips(req, supabaseServiceClient, user);
        }
      
      case "PUT":
        return await handleUpdateTip(req, supabaseServiceClient, user);
      
      case "DELETE":
        return await handleDeleteTip(req, supabaseServiceClient, user);
      
      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error("Community Tips API error:", error);
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

async function handleCreateTip(req: Request, supabase: any, user: any): Promise<Response> {
  const tipData: CommunityTip = await req.json();
  
  // Validate required fields
  if (!tipData.report_id || !tipData.tip_type || !tipData.tip_description) {
    throw new Error("Missing required fields: report_id, tip_type, tip_description");
  }

  // Verify the report exists
  const { data: report, error: reportError } = await supabase
    .from("lost_found_reports")
    .select("id, user_id")
    .eq("id", tipData.report_id)
    .single();

  if (reportError || !report) {
    throw new Error("Report not found");
  }

  // Prepare tip data
  const tipPayload = {
    report_id: tipData.report_id,
    tipster_id: tipData.anonymous ? null : user?.id,
    tip_type: tipData.tip_type,
    tip_description: tipData.tip_description,
    tip_location_lat: tipData.tip_location_lat,
    tip_location_lng: tipData.tip_location_lng,
    tip_location_address: tipData.tip_location_address,
    contact_method: tipData.contact_method,
    anonymous: tipData.anonymous || false,
    verified: false,
    reward_claimed: false,
    reward_amount: tipData.reward_amount
  };

  // Insert tip
  const { data: tip, error } = await supabase
    .from("community_tips")
    .insert(tipPayload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Update user reputation if not anonymous
  if (user && !tipData.anonymous) {
    await updateUserReputation(supabase, user.id, "tip_submitted");
  }

  // Send notification to report owner
  await sendTipNotification(supabase, report.user_id, tip);

  return new Response(
    JSON.stringify({
      success: true,
      data: tip,
      message: "Tip submitted successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetTips(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const tipType = url.searchParams.get("type");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = supabase
    .from("community_tips")
    .select(`
      *,
      lost_found_reports!inner(report_type, device_category, device_model),
      users!inner(display_name, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tipType) {
    query = query.eq("tip_type", tipType);
  }

  const { data: tips, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: tips,
      pagination: {
        limit,
        offset,
        hasMore: tips.length === limit
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetTipsForReport(req: Request, supabase: any, user: any): Promise<Response> {
  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");

  if (!reportId) {
    throw new Error("Report ID is required");
  }

  // Verify the report exists and user has access
  const { data: report, error: reportError } = await supabase
    .from("lost_found_reports")
    .select("user_id")
    .eq("id", reportId)
    .single();

  if (reportError || !report) {
    throw new Error("Report not found");
  }

  // Check if user is the report owner or has permission to view tips
  const canViewAll = user && (report.user_id === user.id || user.role === "admin");

  let query = supabase
    .from("community_tips")
    .select(`
      *,
      users!inner(display_name, avatar_url)
    `)
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  // If not the owner, only show verified tips
  if (!canViewAll) {
    query = query.eq("verified", true);
  }

  const { data: tips, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: tips,
      can_view_all: canViewAll
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetUserTips(req: Request, supabase: any, user: any): Promise<Response> {
  if (!user) {
    throw new Error("Authentication required");
  }

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const { data: tips, error } = await supabase
    .from("community_tips")
    .select(`
      *,
      lost_found_reports!inner(report_type, device_category, device_model)
    `)
    .eq("tipster_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: tips,
      pagination: {
        limit,
        offset,
        hasMore: tips.length === limit
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleUpdateTip(req: Request, supabase: any, user: any): Promise<Response> {
  if (!user) {
    throw new Error("Authentication required");
  }

  const url = new URL(req.url);
  const tipId = url.pathname.split("/").pop();
  const updateData = await req.json();

  // Verify user owns the tip or is admin
  const { data: existingTip, error: checkError } = await supabase
    .from("community_tips")
    .select("tipster_id, anonymous")
    .eq("id", tipId)
    .single();

  if (checkError || !existingTip) {
    throw new Error("Tip not found");
  }

  if (existingTip.anonymous || existingTip.tipster_id !== user.id) {
    throw new Error("Unauthorized to update this tip");
  }

  const { data: updatedTip, error } = await supabase
    .from("community_tips")
    .update(updateData)
    .eq("id", tipId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedTip,
      message: "Tip updated successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleDeleteTip(req: Request, supabase: any, user: any): Promise<Response> {
  if (!user) {
    throw new Error("Authentication required");
  }

  const url = new URL(req.url);
  const tipId = url.pathname.split("/").pop();

  // Verify user owns the tip or is admin
  const { data: existingTip, error: checkError } = await supabase
    .from("community_tips")
    .select("tipster_id, anonymous")
    .eq("id", tipId)
    .single();

  if (checkError || !existingTip) {
    throw new Error("Tip not found");
  }

  if (existingTip.anonymous || existingTip.tipster_id !== user.id) {
    throw new Error("Unauthorized to delete this tip");
  }

  const { error } = await supabase
    .from("community_tips")
    .delete()
    .eq("id", tipId);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Tip deleted successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function updateUserReputation(supabase: any, userId: string, action: string): Promise<void> {
  const reputationPoints = {
    "tip_submitted": 5,
    "tip_verified": 10,
    "recovery_assisted": 15
  };

  const points = reputationPoints[action] || 0;
  if (points === 0) return;

  const { error } = await supabase
    .from("user_reputation")
    .upsert({
      user_id: userId,
      community_contributions: 1,
      reputation_score: points
    }, {
      onConflict: "user_id"
    });

  if (error) {
    console.error("Error updating user reputation:", error);
  }
}

async function sendTipNotification(supabase: any, reportOwnerId: string, tip: any): Promise<void> {
  // Get report owner's notification preferences
  const { data: notificationPrefs } = await supabase
    .from("user_notifications")
    .select("preferences")
    .eq("user_id", reportOwnerId)
    .eq("notification_type", "lost_found")
    .single();

  if (notificationPrefs?.preferences?.email) {
    // TODO: Send email notification
    console.log(`Sending email notification to user ${reportOwnerId} about new tip`);
  }

  if (notificationPrefs?.preferences?.push) {
    // TODO: Send push notification
    console.log(`Sending push notification to user ${reportOwnerId} about new tip`);
  }
}
