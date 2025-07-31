import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LostReportRequest {
  deviceId: string;
  reportType: "lost" | "stolen";
  incidentDate?: string;
  incidentLocation?: { lat: number; lng: number };
  policeReportNumber?: string;
  description: string;
  rewardAmount?: number;
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

    const reportData: LostReportRequest = await req.json();

    const { data: device, error: deviceError } = await supabaseClient
      .from("devices")
      .select("id, current_owner_id, serial_number")
      .eq("id", reportData.deviceId)
      .eq("current_owner_id", user.id)
      .single();

    if (deviceError || !device) {
      throw new Error("Device not found or you don't own this device");
    }

    let locationPoint = null;
    if (reportData.incidentLocation) {
      locationPoint = `POINT(${reportData.incidentLocation.lng} ${reportData.incidentLocation.lat})`;
    }

    const { data: stolenReport, error: reportError } = await supabaseClient
      .from("stolen_reports")
      .insert({
        device_id: reportData.deviceId,
        reporter_id: user.id,
        report_type: reportData.reportType,
        incident_date: reportData.incidentDate,
        incident_location: locationPoint,
        police_report_number: reportData.policeReportNumber,
        description: reportData.description,
        reward_amount: reportData.rewardAmount,
        status: "active"
      })
      .select()
      .single();

    if (reportError) {
      throw reportError;
    }

    const newStatus = reportData.reportType === "stolen" ? "stolen" : "lost";
    await supabaseClient
      .from("devices")
      .update({ status: newStatus })
      .eq("id", reportData.deviceId);

    return new Response(
      JSON.stringify({
        success: true,
        report: stolenReport,
        message: `Device reported as ${reportData.reportType} successfully`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Lost report error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});