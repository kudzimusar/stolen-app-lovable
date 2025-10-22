import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Authorization header missing")
    }
    const token = authHeader.replace("Bearer ", "")
    
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
    )
    
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error("User not authenticated")
    }

    console.log("👮 Law Enforcement Department Stats - User:", user.id)

    // Get law enforcement department statistics
    const { data: lawStats, error: lawError } = await supabaseClient
      .from('law_enforcement_admin_stats')
      .select('*')
      .eq('law_enforcement_id', user.id)
      .single()

    if (lawError && lawError.code !== 'PGRST116') {
      console.error('Error fetching law enforcement stats:', lawError)
      throw new Error('Failed to fetch law enforcement statistics')
    }

    // Get recent stolen reports
    const { data: stolenReports, error: reportsError } = await supabaseClient
      .from('stolen_reports')
      .select(`
        id, report_type, incident_date, incident_location, 
        police_report_number, reward_amount, status, created_at,
        devices!inner(id, brand, model, serial_number, device_name),
        users!stolen_reports_reporter_id_fkey(id, display_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (reportsError) {
      console.error('Error fetching stolen reports:', reportsError)
    }

    // Get lost/found reports
    const { data: lostFoundReports, error: lostFoundError } = await supabaseClient
      .from('lost_found_reports')
      .select(`
        id, report_type, incident_date, incident_location,
        description, status, created_at,
        devices!inner(id, brand, model, serial_number, device_name),
        users!lost_found_reports_user_id_fkey(id, display_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (lostFoundError) {
      console.error('Error fetching lost/found reports:', lostFoundError)
    }

    // Get reports by status
    const { data: reportsByStatus, error: reportsStatusError } = await supabaseClient
      .from('stolen_reports')
      .select('status')

    if (reportsStatusError) {
      console.error('Error fetching reports by status:', reportsStatusError)
    }

    // Get reports by type
    const { data: reportsByType, error: reportsTypeError } = await supabaseClient
      .from('stolen_reports')
      .select('report_type')

    if (reportsTypeError) {
      console.error('Error fetching reports by type:', reportsTypeError)
    }

    // Calculate additional metrics
    const reportStatusCounts = reportsByStatus?.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const reportTypeCounts = reportsByType?.reduce((acc, report) => {
      acc[report.report_type] = (acc[report.report_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const stats = {
      // Basic stats from view
      total_cases: lawStats?.total_cases || 0,
      active_cases: lawStats?.active_cases || 0,
      resolved_cases: lawStats?.resolved_cases || 0,
      closed_cases: lawStats?.closed_cases || 0,
      total_reports_accessed: lawStats?.total_reports_accessed || 0,
      cases_last_30_days: lawStats?.cases_last_30_days || 0,
      resolution_rate: lawStats?.resolution_rate || 0,
      
      // Status breakdowns
      case_status_breakdown: reportStatusCounts,
      report_type_breakdown: reportTypeCounts,
      
      // Recent data
      recent_stolen_reports: stolenReports || [],
      recent_lost_found_reports: lostFoundReports || [],
      
      // Performance indicators
      average_case_resolution_time: lawStats?.total_cases > 0 
        ? Math.round((lawStats.resolved_cases / lawStats.total_cases) * 30) // Approximate days
        : 0,
      
      high_priority_cases: stolenReports?.filter(report => 
        report.reward_amount && report.reward_amount > 500
      )?.length || 0,
      
      // Time-based metrics
      reports_this_month: stolenReports?.filter(report => 
        new Date(report.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )?.length || 0,
      
      // Geographic analysis
      reports_by_location: stolenReports?.reduce((acc, report) => {
        const location = report.incident_location ? 'With Location' : 'No Location'
        acc[location] = (acc[location] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      
      // Evidence and documentation
      reports_with_police_numbers: stolenReports?.filter(report => 
        report.police_report_number
      )?.length || 0,
      
      reports_with_rewards: stolenReports?.filter(report => 
        report.reward_amount && report.reward_amount > 0
      )?.length || 0,
      
      // Recovery metrics
      total_rewards_offered: stolenReports?.reduce((sum, report) => 
        sum + (report.reward_amount || 0), 0
      ) || 0,
      
      // Device types most reported
      device_types_reported: stolenReports?.reduce((acc, report) => {
        const deviceType = report.devices?.brand || 'Unknown'
        acc[deviceType] = (acc[deviceType] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
    }

    console.log('✅ Law enforcement stats fetched successfully:', stats)

    return new Response(
      JSON.stringify({
        success: true,
        data: stats,
        department: 'law_enforcement',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Law enforcement stats error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        department: 'law_enforcement'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
