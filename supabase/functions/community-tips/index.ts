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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route handling
    if (method === 'GET' && path.endsWith('/community-tips')) {
      return await handleGetTips(supabaseClient, url)
    } else if (method === 'POST' && path.endsWith('/community-tips')) {
      return await handleCreateTip(supabaseClient, req, user.id)
    } else if (method === 'GET' && path.includes('/community-tips/report/')) {
      return await handleGetTipsForReport(supabaseClient, url)
    } else if (method === 'GET' && path.includes('/community-tips/user')) {
      return await handleGetUserTips(supabaseClient, user.id)
    } else if (method === 'PUT' && path.includes('/community-tips/')) {
      return await handleUpdateTip(supabaseClient, req, url, user.id)
    } else if (method === 'DELETE' && path.includes('/community-tips/')) {
      return await handleDeleteTip(supabaseClient, url, user.id)
        } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleGetTips(supabaseClient: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const reportId = url.searchParams.get('reportId')

  let query = supabaseClient
    .from('community_tips')
    .select(`
      *,
      lost_found_reports!inner(
        id,
        report_type,
        device_model,
        device_category
      ),
      users(
        id,
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (reportId) {
    query = query.eq('report_id', reportId)
  }

  const { data: tips, error } = await query

  if (error) {
    console.error('Error fetching tips:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateTip(supabaseClient: any, req: Request, userId: string) {
  const body = await req.json()
  
  const tipData = {
    report_id: body.report_id,
    tipster_id: body.anonymous ? null : userId,
    tip_type: body.tip_type,
    tip_description: body.tip_description,
    tip_location_lat: body.tip_location_lat,
    tip_location_lng: body.tip_location_lng,
    tip_location_address: body.tip_location_address,
    contact_method: body.contact_method,
    anonymous: body.anonymous || false,
    reward_amount: body.reward_amount || 0
  }

  const { data: tip, error } = await supabaseClient
    .from('community_tips')
    .insert(tipData)
    .select(`
      *,
      lost_found_reports(
        id,
        report_type,
        device_model,
        device_category
      )
    `)
    .single()

  if (error) {
    console.error('Error creating tip:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update user reputation for contributing
  await supabaseClient
    .from('user_reputation')
    .upsert({
      user_id: userId,
      community_contributions: 1
    }, {
      onConflict: 'user_id'
    })

  return new Response(
    JSON.stringify({
      success: true,
      data: tip
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetTipsForReport(supabaseClient: any, url: URL) {
  const pathParts = url.pathname.split('/')
  const reportId = pathParts[pathParts.length - 1]

  const { data: tips, error } = await supabaseClient
    .from('community_tips')
    .select(`
      *,
      users(
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('report_id', reportId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tips for report:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: tips
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetUserTips(supabaseClient: any, userId: string) {
  const { data: tips, error } = await supabaseClient
    .from('community_tips')
    .select(`
      *,
      lost_found_reports(
        id,
        report_type,
        device_model,
        device_category
      )
    `)
    .eq('tipster_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user tips:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: tips
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateTip(supabaseClient: any, req: Request, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const tipId = pathParts[pathParts.length - 1]
  const body = await req.json()

  // Check if user owns the tip
  const { data: existingTip, error: fetchError } = await supabaseClient
    .from('community_tips')
    .select('tipster_id')
    .eq('id', tipId)
    .single()

  if (fetchError || !existingTip) {
    return new Response(
      JSON.stringify({ success: false, error: 'Tip not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (existingTip.tipster_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: tip, error } = await supabaseClient
    .from('community_tips')
    .update({
      tip_description: body.tip_description,
      tip_location_lat: body.tip_location_lat,
      tip_location_lng: body.tip_location_lng,
      tip_location_address: body.tip_location_address,
      contact_method: body.contact_method
    })
    .eq('id', tipId)
    .select()
    .single()

  if (error) {
    console.error('Error updating tip:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: tip
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeleteTip(supabaseClient: any, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const tipId = pathParts[pathParts.length - 1]

  // Check if user owns the tip
  const { data: existingTip, error: fetchError } = await supabaseClient
    .from('community_tips')
    .select('tipster_id')
    .eq('id', tipId)
    .single()

  if (fetchError || !existingTip) {
    return new Response(
      JSON.stringify({ success: false, error: 'Tip not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (existingTip.tipster_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabaseClient
    .from('community_tips')
    .delete()
    .eq('id', tipId)

  if (error) {
    console.error('Error deleting tip:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Tip deleted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}