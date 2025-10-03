import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get dashboard stats using the function
    const { data: stats, error: statsError } = await supabaseClient
      .rpc('get_admin_dashboard_stats')

    if (statsError) {
      console.error('Error fetching dashboard stats:', statsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch dashboard stats' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get recent activity
    const { data: activity, error: activityError } = await supabaseClient
      .rpc('get_admin_recent_activity', { limit_count: 10 })

    if (activityError) {
      console.error('Error fetching recent activity:', activityError)
    }

    // Get pending reports
    const { data: pendingReports, error: pendingError } = await supabaseClient
      .rpc('get_admin_pending_reports')

    if (pendingError) {
      console.error('Error fetching pending reports:', pendingError)
    }

    const response = {
      success: true,
      data: {
        stats: stats || {},
        recentActivity: activity || [],
        pendingReports: pendingReports || []
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin dashboard stats error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
