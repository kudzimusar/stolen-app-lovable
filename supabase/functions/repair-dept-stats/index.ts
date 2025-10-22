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

    console.log("🔧 Repair Shop Department Stats - User:", user.id)

    // Get repair shop department statistics
    const { data: repairStats, error: repairError } = await supabaseClient
      .from('repair_shop_admin_stats')
      .select('*')
      .eq('repair_shop_id', user.id)
      .single()

    if (repairError && repairError.code !== 'PGRST116') {
      console.error('Error fetching repair stats:', repairError)
      throw new Error('Failed to fetch repair shop statistics')
    }

    // Get recent repair orders
    const { data: repairOrders, error: ordersError } = await supabaseClient
      .from('repair_orders')
      .select(`
        id, repair_type, issue_description, status, priority,
        labor_cost, parts_cost, total_cost, created_at,
        devices!inner(id, brand, model, serial_number),
        users!repair_orders_customer_id_fkey(id, display_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (ordersError) {
      console.error('Error fetching repair orders:', ordersError)
    }

    // Get repair orders by status
    const { data: ordersByStatus, error: statusError } = await supabaseClient
      .from('repair_orders')
      .select('status')
      .eq('repair_shop_id', user.id)

    if (statusError) {
      console.error('Error fetching orders by status:', statusError)
    }

    // Get repair types breakdown
    const { data: repairTypes, error: typesError } = await supabaseClient
      .from('repair_orders')
      .select('repair_type')
      .eq('repair_shop_id', user.id)

    if (typesError) {
      console.error('Error fetching repair types:', typesError)
    }

    // Calculate additional metrics
    const statusCounts = ordersByStatus?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const typeCounts = repairTypes?.reduce((acc, order) => {
      acc[order.repair_type] = (acc[order.repair_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const stats = {
      // Basic stats from view
      total_repairs: repairStats?.total_repairs || 0,
      pending_repairs: repairStats?.pending_repairs || 0,
      completed_repairs: repairStats?.completed_repairs || 0,
      total_customers: repairStats?.total_customers || 0,
      total_revenue: repairStats?.total_revenue || 0,
      repairs_last_30_days: repairStats?.repairs_last_30_days || 0,
      average_rating: repairStats?.average_rating || 0,
      
      // Status breakdown
      status_breakdown: statusCounts,
      
      // Repair types breakdown
      repair_types: typeCounts,
      
      // Recent data
      recent_orders: repairOrders || [],
      
      // Performance indicators
      completion_rate: repairStats?.total_repairs > 0 
        ? Math.round((repairStats.completed_repairs / repairStats.total_repairs) * 100)
        : 0,
      
      average_repair_cost: repairOrders?.length > 0
        ? Math.round(repairOrders.reduce((sum, order) => sum + (order.total_cost || 0), 0) / repairOrders.length)
        : 0,
      
      // Time-based metrics
      orders_this_month: repairOrders?.filter(order => 
        new Date(order.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )?.length || 0,
      
      revenue_this_month: repairOrders?.filter(order => 
        order.status === 'completed' && 
        new Date(order.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).reduce((sum, order) => sum + (order.total_cost || 0), 0) || 0,
      
      // Quality metrics
      high_priority_orders: repairOrders?.filter(order => order.priority === 'high' || order.priority === 'urgent')?.length || 0,
      warranty_claims: repairOrders?.filter(order => order.status === 'warranty_claim')?.length || 0
    }

    console.log('✅ Repair shop stats fetched successfully:', stats)

    return new Response(
      JSON.stringify({
        success: true,
        data: stats,
        department: 'repair_shop',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Repair shop stats error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        department: 'repair_shop'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
