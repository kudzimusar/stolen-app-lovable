import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIAnalysisRequest {
  entityType: "device" | "listing" | "user" | "transaction" | "found_tip";
  entityId: string;
  data: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { entityType, entityId, data }: AIAnalysisRequest = await req.json();

    // Check for recent analysis
    const { data: existingScore } = await supabaseClient
      .from("ai_scores")
      .select("id, confidence_score, created_at")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existingScore) {
      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          score: existingScore
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let fraudIndicators: string[] = [];
    let confidenceScore = 0.95;

    // Basic fraud detection rules
    switch (entityType) {
      case "device":
        if (!data.receipt_url) {
          fraudIndicators.push("no_receipt");
          confidenceScore -= 0.1;
        }
        if (!data.device_photos || data.device_photos.length === 0) {
          fraudIndicators.push("no_photos");
          confidenceScore -= 0.05;
        }
        break;

      case "listing":
        if (data.price < 100) {
          fraudIndicators.push("suspiciously_low_price");
          confidenceScore -= 0.2;
        }
        break;

      case "found_tip":
        if (data.anonymous) {
          fraudIndicators.push("anonymous_tip");
          confidenceScore -= 0.1;
        }
        break;
    }

    confidenceScore = Math.max(0, Math.min(1, confidenceScore));

    const { data: aiScore, error: scoreError } = await supabaseClient
      .from("ai_scores")
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        confidence_score: confidenceScore,
        fraud_indicators: { indicators: fraudIndicators },
        ai_model_version: "v1.0",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (scoreError) {
      throw scoreError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        score: aiScore,
        confidenceScore,
        fraudIndicators,
        actionRequired: confidenceScore < 0.5
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});