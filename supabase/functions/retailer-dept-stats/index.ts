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

    console.log("🏪 Retailer Department Stats - User:", user.id)

    // Get retailer department statistics
    const { data: retailerStats, error: retailerError } = await supabaseClient
      .from('retailer_admin_stats')
      .select('*')
      .eq('retailer_id', user.id)
      .single()

    if (retailerError && retailerError.code !== 'PGRST116') {
      console.error('Error fetching retailer stats:', retailerError)
      throw new Error('Failed to fetch retailer statistics')
    }

    // Get marketplace listings
    const { data: listings, error: listingsError } = await supabaseClient
      .from('marketplace_listings')
      .select(`
        id, title, price, status, created_at,
        devices!inner(id, brand, model, color)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
    }

    // Get recent transactions
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('marketplace_transactions')
      .select(`
        id, amount, status, created_at,
        marketplace_listings!inner(title, price)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
    }

    // Get top-selling categories
    const { data: categories, error: categoriesError } = await supabaseClient
      .rpc('get_top_selling_categories')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    const stats = {
      // Basic stats from view
      total_listings: retailerStats?.total_listings || 0,
      active_listings: retailerStats?.active_listings || 0,
      sold_listings: retailerStats?.sold_listings || 0,
      total_revenue: retailerStats?.total_revenue || 0,
      total_transactions: retailerStats?.total_transactions || 0,
      transactions_last_30_days: retailerStats?.transactions_last_30_days || 0,
      
      // Additional calculated metrics
      conversion_rate: retailerStats?.total_listings > 0 
        ? Math.round((retailerStats.sold_listings / retailerStats.total_listings) * 100)
        : 0,
      average_listing_price: listings?.length > 0
        ? Math.round(listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length)
        : 0,
      
      // Recent data
      recent_listings: listings || [],
      recent_transactions: transactions || [],
      top_categories: categories || [],
      
      // Performance indicators
      pending_verification: listings?.filter(l => l.status === 'pending')?.length || 0,
      featured_listings: listings?.filter(l => l.featured)?.length || 0,
      
      // Time-based metrics
      listings_this_month: listings?.filter(l => 
        new Date(l.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )?.length || 0,
      
      revenue_this_month: transactions?.filter(t => 
        t.status === 'completed' && 
        new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).reduce((sum, t) => sum + t.amount, 0) || 0
    }

    console.log('✅ Retailer stats fetched successfully:', stats)

    return new Response(
      JSON.stringify({
        success: true,
        data: stats,
        department: 'retailer',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Retailer stats error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        department: 'retailer'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
