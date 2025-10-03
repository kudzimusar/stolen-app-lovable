import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch dashboard statistics
    const [
      { count: totalUsers },
      { count: activeReports },
      { count: totalTransactions },
      { data: revenueData },
      { count: pendingApprovals }
    ] = await Promise.all([
      supabaseClient.from('users').select('*', { count: 'exact', head: true }),
      supabaseClient.from('lost_found_reports').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseClient.from('transactions').select('*', { count: 'exact', head: true }),
      supabaseClient.from('lost_found_reports').select('reward_amount').not('reward_amount', 'is', null),
      supabaseClient.from('lost_found_reports').select('*', { count: 'exact', head: true }).eq('status', 'contacted')
    ]);

    // Calculate total revenue
    const totalRevenue = revenueData?.reduce((sum, report) => sum + (report.reward_amount || 0), 0) || 0;

    // Calculate recovery rate (reunited / total reports)
    const { count: reunitedReports } = await supabaseClient
      .from('lost_found_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'reunited');
    
    const { count: totalReports } = await supabaseClient
      .from('lost_found_reports')
      .select('*', { count: 'exact', head: true });
    
    const recoveryRate = totalReports > 0 ? Math.round((reunitedReports || 0) / totalReports * 100) : 0;

    const dashboardData = {
      totalUsers: totalUsers || 0,
      activeReports: activeReports || 0,
      totalTransactions: totalTransactions || 0,
      revenue: totalRevenue,
      recoveryRate,
      pendingApprovals: pendingApprovals || 0
    };

    console.log('📊 Dashboard data fetched:', dashboardData);

    return new Response(
      JSON.stringify({
        success: true,
        data: dashboardData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-overview:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch dashboard data'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
