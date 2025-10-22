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

    console.log("❤️ NGO Department Stats - User:", user.id)

    // Get NGO department statistics
    const { data: ngoStats, error: ngoError } = await supabaseClient
      .from('ngo_admin_stats')
      .select('*')
      .eq('ngo_id', user.id)
      .single()

    if (ngoError && ngoError.code !== 'PGRST116') {
      console.error('Error fetching NGO stats:', ngoError)
      throw new Error('Failed to fetch NGO statistics')
    }

    // Get recent donations
    const { data: donations, error: donationsError } = await supabaseClient
      .from('device_donations')
      .select(`
        id, donation_type, donation_value, status, donation_date, created_at,
        devices!inner(id, brand, model, serial_number, device_name),
        users!device_donations_donor_id_fkey(id, display_name, email),
        users!device_donations_recipient_id_fkey(id, display_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (donationsError) {
      console.error('Error fetching donations:', donationsError)
    }

    // Get donations by status
    const { data: donationsByStatus, error: donationsStatusError } = await supabaseClient
      .from('device_donations')
      .select('status')
      .eq('ngo_id', user.id)

    if (donationsStatusError) {
      console.error('Error fetching donations by status:', donationsStatusError)
    }

    // Get donations by type
    const { data: donationsByType, error: donationsTypeError } = await supabaseClient
      .from('device_donations')
      .select('donation_type')
      .eq('ngo_id', user.id)

    if (donationsTypeError) {
      console.error('Error fetching donations by type:', donationsTypeError)
    }

    // Get NGO partners
    const { data: ngoPartners, error: partnersError } = await supabaseClient
      .from('users')
      .select('id, display_name, email, created_at')
      .eq('role', 'ngo')
      .neq('id', user.id)

    if (partnersError) {
      console.error('Error fetching NGO partners:', partnersError)
    }

    // Calculate additional metrics
    const donationStatusCounts = donationsByStatus?.reduce((acc, donation) => {
      acc[donation.status] = (acc[donation.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const donationTypeCounts = donationsByType?.reduce((acc, donation) => {
      acc[donation.donation_type] = (acc[donation.donation_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const stats = {
      // Basic stats from view
      total_donations: ngoStats?.total_donations || 0,
      pending_donations: ngoStats?.pending_donations || 0,
      completed_donations: ngoStats?.completed_donations || 0,
      total_donors: ngoStats?.total_donors || 0,
      total_beneficiaries: ngoStats?.total_beneficiaries || 0,
      devices_managed: ngoStats?.devices_managed || 0,
      donations_last_30_days: ngoStats?.donations_last_30_days || 0,
      
      // Status breakdowns
      donation_status_breakdown: donationStatusCounts,
      donation_type_breakdown: donationTypeCounts,
      
      // Recent data
      recent_donations: donations || [],
      ngo_partners: ngoPartners || [],
      
      // Performance indicators
      completion_rate: ngoStats?.total_donations > 0 
        ? Math.round((ngoStats.completed_donations / ngoStats.total_donations) * 100)
        : 0,
      
      average_donation_value: donations?.length > 0
        ? Math.round(donations.reduce((sum, donation) => sum + (donation.donation_value || 0), 0) / donations.length)
        : 0,
      
      // Time-based metrics
      donations_this_month: donations?.filter(donation => 
        new Date(donation.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )?.length || 0,
      
      total_donation_value: donations?.reduce((sum, donation) => 
        sum + (donation.donation_value || 0), 0
      ) || 0,
      
      // Impact metrics
      devices_awaiting_distribution: donations?.filter(donation => 
        donation.status === 'pending' || donation.status === 'in_transit'
      )?.length || 0,
      
      // Donor analysis
      repeat_donors: donations?.reduce((acc, donation) => {
        const donorId = donation.users?.id
        if (donorId) {
          acc[donorId] = (acc[donorId] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {},
      
      // Device types donated
      device_types_donated: donations?.reduce((acc, donation) => {
        const deviceType = donation.devices?.brand || 'Unknown'
        acc[deviceType] = (acc[deviceType] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      
      // Impact score calculation
      impact_score: Math.min(100, Math.round(
        (ngoStats?.completed_donations || 0) * 2 + 
        (ngoStats?.total_beneficiaries || 0) * 1.5 +
        (ngoStats?.donations_last_30_days || 0) * 3
      )),
      
      // Program effectiveness
      active_programs: ngoPartners?.length || 0,
      average_beneficiaries_per_donation: ngoStats?.total_donations > 0 
        ? Math.round((ngoStats.total_beneficiaries / ngoStats.total_donations) * 10) / 10
        : 0
    }

    console.log('✅ NGO stats fetched successfully:', stats)

    return new Response(
      JSON.stringify({
        success: true,
        data: stats,
        department: 'ngo',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ NGO stats error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        department: 'ngo'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
