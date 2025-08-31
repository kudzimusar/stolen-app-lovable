import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HotDeal {
  id?: string;
  listing_id: string;
  seller_id: string;
  urgency_level: 'today-only' | '48-hours' | '1-week' | 'negotiable' | 'lightning' | 'flash';
  end_time: string;
  original_price: number;
  current_price: number;
  minimum_price?: number;
  reserve_price?: number;
  dynamic_pricing_enabled?: boolean;
  bidding_enabled?: boolean;
}

interface BidRequest {
  deal_id: string;
  bidder_id: string;
  bid_amount: number;
  max_bid?: number;
  bid_type?: 'manual' | 'auto' | 'reserve';
}

interface NotificationRequest {
  deal_id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  channels?: {
    push?: boolean;
    email?: boolean;
    sms?: boolean;
    in_app?: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const { url, method } = req
  const urlParts = new URL(url).pathname.split('/')
  const action = urlParts[urlParts.length - 1]

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    switch (action) {
      case 'create-deal':
        return await createHotDeal(req, supabaseClient)
      case 'place-bid':
        return await placeBid(req, supabaseClient)
      case 'update-pricing':
        return await updateDynamicPricing(req, supabaseClient)
      case 'send-notification':
        return await sendNotification(req, supabaseClient)
      case 'expire-deals':
        return await expireDeals(supabaseClient)
      case 'ai-analysis':
        return await performAIAnalysis(req, supabaseClient)
      case 'boost-deal':
        return await boostDeal(req, supabaseClient)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Hot deals engine error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function createHotDeal(req: Request, supabase: any) {
  const dealData: HotDeal = await req.json()
  
  // Validate required fields
  if (!dealData.listing_id || !dealData.seller_id || !dealData.urgency_level) {
    throw new Error('Missing required fields')
  }

  // Calculate end time based on urgency
  const now = new Date()
  let endTime = new Date()
  
  switch (dealData.urgency_level) {
    case 'today-only':
      endTime.setHours(23, 59, 59, 999)
      break
    case '48-hours':
      endTime = new Date(now.getTime() + 48 * 60 * 60 * 1000)
      break
    case '1-week':
      endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      break
    case 'lightning':
      endTime = new Date(now.getTime() + 6 * 60 * 60 * 1000) // 6 hours
      break
    case 'flash':
      endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
      break
    default:
      endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }

  // Insert hot deal
  const { data: deal, error } = await supabase
    .from('hot_deals')
    .insert({
      ...dealData,
      end_time: endTime.toISOString(),
      current_price: dealData.original_price,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error

  // Perform initial AI analysis
  await performInitialAIAnalysis(deal.id, supabase)

  // Send creation notification to interested users
  await notifyInterestedUsers(deal, 'deal_created', supabase)

  return new Response(
    JSON.stringify({ deal, message: 'Hot deal created successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function placeBid(req: Request, supabase: any) {
  const bidData: BidRequest = await req.json()
  
  // Validate bid
  const { data: deal } = await supabase
    .from('hot_deals')
    .select('current_price, minimum_price, bidding_enabled, status, end_time')
    .eq('id', bidData.deal_id)
    .single()

  if (!deal || deal.status !== 'active') {
    throw new Error('Deal is not active')
  }

  if (!deal.bidding_enabled) {
    throw new Error('Bidding is not enabled for this deal')
  }

  if (new Date(deal.end_time) <= new Date()) {
    throw new Error('Deal has expired')
  }

  const minimumBid = Math.max(deal.current_price * 1.05, deal.minimum_price || 0)
  if (bidData.bid_amount < minimumBid) {
    throw new Error(`Bid must be at least ${minimumBid}`)
  }

  // Insert bid
  const { data: bid, error } = await supabase
    .from('hot_deals_bids')
    .insert({
      ...bidData,
      status: 'active',
      bid_confidence_score: await calculateBidConfidence(bidData, deal)
    })
    .select()
    .single()

  if (error) throw error

  // Update deal current price if this is the highest bid
  const { data: highestBid } = await supabase
    .from('hot_deals_bids')
    .select('bid_amount')
    .eq('deal_id', bidData.deal_id)
    .eq('status', 'active')
    .order('bid_amount', { ascending: false })
    .limit(1)
    .single()

  if (highestBid && highestBid.bid_amount === bidData.bid_amount) {
    await supabase
      .from('hot_deals')
      .update({ current_price: bidData.bid_amount })
      .eq('id', bidData.deal_id)
  }

  // Notify other bidders they've been outbid
  await notifyOutbidders(bidData.deal_id, bidData.bidder_id, supabase)

  return new Response(
    JSON.stringify({ bid, message: 'Bid placed successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateDynamicPricing(req: Request, supabase: any) {
  const { deal_id, ai_triggered = true } = await req.json()

  // Get deal data
  const { data: deal } = await supabase
    .from('hot_deals')
    .select('*')
    .eq('id', deal_id)
    .single()

  if (!deal || !deal.dynamic_pricing_enabled) {
    throw new Error('Dynamic pricing not enabled for this deal')
  }

  // Get AI analysis
  const { data: aiAnalysis } = await supabase
    .from('hot_deals_ai_analytics')
    .select('optimal_price, price_recommendation')
    .eq('deal_id', deal_id)
    .order('analysis_date', { ascending: false })
    .limit(1)
    .single()

  if (!aiAnalysis) {
    throw new Error('No AI analysis available')
  }

  const newPrice = aiAnalysis.optimal_price || deal.current_price
  const priceChange = newPrice - deal.current_price

  // Only update if the change is significant (>2%)
  if (Math.abs(priceChange / deal.current_price) > 0.02) {
    // Record price history
    await supabase
      .from('hot_deals_price_history')
      .insert({
        deal_id,
        old_price: deal.current_price,
        new_price: newPrice,
        change_reason: 'ai_optimization',
        ai_triggered
      })

    // Update deal price
    await supabase
      .from('hot_deals')
      .update({ 
        current_price: newPrice,
        ai_price_suggestion: newPrice
      })
      .eq('id', deal_id)

    // Notify watchers of price change
    if (priceChange < 0) { // Price drop
      await notifyPriceDrop(deal_id, deal.current_price, newPrice, supabase)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Price updated successfully',
        old_price: deal.current_price,
        new_price: newPrice,
        change_percentage: (priceChange / deal.current_price) * 100
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'No significant price change needed' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendNotification(req: Request, supabase: any) {
  const notificationData: NotificationRequest = await req.json()

  // Insert notification
  const { data: notification, error } = await supabase
    .from('hot_deals_notifications')
    .insert({
      ...notificationData,
      push_notification: notificationData.channels?.push ?? true,
      email_notification: notificationData.channels?.email ?? false,
      sms_notification: notificationData.channels?.sms ?? false,
      in_app_notification: notificationData.channels?.in_app ?? true,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error

  // TODO: Integrate with actual push notification service
  // This would call Firebase, OneSignal, or similar service

  return new Response(
    JSON.stringify({ notification, message: 'Notification queued successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function expireDeals(supabase: any) {
  // Call the database function to expire deals
  const { error } = await supabase.rpc('expire_hot_deals')
  
  if (error) throw error

  // Get newly expired deals to send notifications
  const { data: expiredDeals } = await supabase
    .from('hot_deals')
    .select('id, seller_id')
    .eq('status', 'expired')
    .gte('updated_at', new Date(Date.now() - 60000).toISOString()) // Last minute

  // Send expiration notifications
  for (const deal of expiredDeals || []) {
    await supabase
      .from('hot_deals_notifications')
      .insert({
        deal_id: deal.id,
        user_id: deal.seller_id,
        notification_type: 'deal_expired',
        title: 'Deal Expired',
        message: 'Your hot deal has expired',
        status: 'pending'
      })
  }

  return new Response(
    JSON.stringify({ 
      message: 'Deal expiration check completed',
      expired_count: expiredDeals?.length || 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function performAIAnalysis(req: Request, supabase: any) {
  const { deal_id } = await req.json()

  // Get deal data
  const { data: deal } = await supabase
    .from('hot_deals')
    .select('*, marketplace_listings(*)')
    .eq('id', deal_id)
    .single()

  if (!deal) throw new Error('Deal not found')

  // Simulate AI analysis (in production, this would call actual AI services)
  const analysis = {
    deal_id,
    predicted_demand: Math.floor(Math.random() * 100),
    demand_trend: ['rising', 'stable', 'falling'][Math.floor(Math.random() * 3)],
    optimal_price: deal.current_price * (0.9 + Math.random() * 0.2), // ±10%
    price_elasticity: Math.random() * 2,
    predicted_views: Math.floor(Math.random() * 1000),
    predicted_bids: Math.floor(Math.random() * 50),
    predicted_sale_probability: Math.random() * 100,
    confidence_score: 70 + Math.floor(Math.random() * 30)
  }

  // Insert analysis
  const { error } = await supabase
    .from('hot_deals_ai_analytics')
    .insert(analysis)

  if (error) throw error

  return new Response(
    JSON.stringify({ analysis, message: 'AI analysis completed' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function boostDeal(req: Request, supabase: any) {
  const { deal_id, boost_type, duration_hours, price_paid } = await req.json()

  const boostLevels = {
    'priority': 1,
    'premium': 2,
    'lightning': 3
  }

  // Insert boost record
  const endTime = new Date(Date.now() + duration_hours * 60 * 60 * 1000)
  
  const { data: boost, error } = await supabase
    .from('hot_deals_boosts')
    .insert({
      deal_id,
      boost_type,
      boost_level: boostLevels[boost_type as keyof typeof boostLevels] || 1,
      duration_hours,
      price_paid,
      end_time: endTime.toISOString()
    })
    .select()
    .single()

  if (error) throw error

  // Update deal boost level
  await supabase
    .from('hot_deals')
    .update({ 
      boost_level: boostLevels[boost_type as keyof typeof boostLevels] || 1,
      featured: true
    })
    .eq('id', deal_id)

  return new Response(
    JSON.stringify({ boost, message: 'Deal boosted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Helper functions
async function performInitialAIAnalysis(dealId: string, supabase: any) {
  // Trigger AI analysis for new deal
  const analysisData = {
    deal_id: dealId,
    predicted_demand: 50 + Math.floor(Math.random() * 50),
    demand_trend: 'stable',
    confidence_score: 75
  }

  await supabase
    .from('hot_deals_ai_analytics')
    .insert(analysisData)
}

async function notifyInterestedUsers(deal: any, type: string, supabase: any) {
  // In production, this would query user preferences and send targeted notifications
  console.log(`Notifying users about ${type} for deal ${deal.id}`)
}

async function calculateBidConfidence(bidData: BidRequest, deal: any): Promise<number> {
  // Simulate bid confidence calculation
  const priceRatio = bidData.bid_amount / deal.current_price
  if (priceRatio > 1.2) return 90
  if (priceRatio > 1.1) return 75
  if (priceRatio > 1.05) return 60
  return 40
}

async function notifyOutbidders(dealId: string, newBidderId: string, supabase: any) {
  // Get all other active bidders
  const { data: outbidders } = await supabase
    .from('hot_deals_bids')
    .select('bidder_id')
    .eq('deal_id', dealId)
    .eq('status', 'active')
    .neq('bidder_id', newBidderId)

  // Send notifications to outbidders
  for (const bidder of outbidders || []) {
    await supabase
      .from('hot_deals_notifications')
      .insert({
        deal_id: dealId,
        user_id: bidder.bidder_id,
        notification_type: 'outbid',
        title: 'You\'ve been outbid!',
        message: 'Someone placed a higher bid on an item you\'re watching',
        status: 'pending'
      })
  }
}

async function notifyPriceDrop(dealId: string, oldPrice: number, newPrice: number, supabase: any) {
  // Get users watching this deal
  const { data: watchers } = await supabase
    .from('hot_deals_notifications')
    .select('user_id')
    .eq('deal_id', dealId)
    .eq('notification_type', 'price_drop')

  const discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100)

  for (const watcher of watchers || []) {
    await supabase
      .from('hot_deals_notifications')
      .insert({
        deal_id: dealId,
        user_id: watcher.user_id,
        notification_type: 'price_drop',
        title: `Price Drop: ${discountPercent}% Off!`,
        message: `The price dropped from ${oldPrice} to ${newPrice}`,
        status: 'pending'
      })
  }
}
