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
    if (method === 'GET' && path.endsWith('/device-matches')) {
      return await handleGetMatches(supabaseClient, url, user.id)
    } else if (method === 'POST' && path.endsWith('/device-matches')) {
      return await handleCreateMatch(supabaseClient, req, user.id)
    } else if (method === 'GET' && path.includes('/device-matches/report/')) {
      return await handleGetMatchesForReport(supabaseClient, url)
    } else if (method === 'PUT' && path.includes('/device-matches/')) {
      return await handleUpdateMatch(supabaseClient, req, url, user.id)
    } else if (method === 'POST' && path.includes('/device-matches/')) {
      return await handleMatchAction(supabaseClient, req, url, user.id)
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

async function handleGetMatches(supabaseClient: any, url: URL, userId: string) {
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const status = url.searchParams.get('status')

  let query = supabaseClient
    .from('device_matches')
    .select(`
      *,
      lost_report:lost_found_reports!lost_report_id(
        id,
        report_type,
        device_model,
        device_category,
        description,
        location_address,
        incident_date,
        reward_amount,
        users(
          id,
          display_name,
          avatar_url
        )
      ),
      found_report:lost_found_reports!found_report_id(
        id,
        report_type,
        device_model,
        device_category,
        description,
        location_address,
        incident_date,
        reward_amount,
        users(
          id,
          display_name,
          avatar_url
        )
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  // Filter to show only matches where user is involved
  query = query.or(`lost_report.user_id.eq.${userId},found_report.user_id.eq.${userId}`)

  const { data: matches, error } = await query

  if (error) {
    console.error('Error fetching matches:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: matches,
      pagination: {
        limit,
        offset,
        hasMore: matches.length === limit
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateMatch(supabaseClient: any, req: Request, userId: string) {
  const body = await req.json()
  
  // Verify user owns one of the reports
  const { data: lostReport, error: lostError } = await supabaseClient
    .from('lost_found_reports')
    .select('user_id')
    .eq('id', body.lost_report_id)
    .single()

  const { data: foundReport, error: foundError } = await supabaseClient
    .from('lost_found_reports')
    .select('user_id')
    .eq('id', body.found_report_id)
    .single()

  if (lostError || foundError || (!lostReport && !foundReport)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid report IDs' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (lostReport?.user_id !== userId && foundReport?.user_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const matchData = {
    lost_report_id: body.lost_report_id,
    found_report_id: body.found_report_id,
    match_confidence: body.match_confidence || 0.8,
    match_criteria: body.match_criteria || {},
    status: 'pending'
  }

  const { data: match, error } = await supabaseClient
    .from('device_matches')
    .insert(matchData)
    .select(`
      *,
      lost_report:lost_found_reports!lost_report_id(
        id,
        report_type,
        device_model,
        device_category,
        description,
        location_address,
        incident_date,
        reward_amount,
        users(
          id,
          display_name,
          avatar_url
        )
      ),
      found_report:lost_found_reports!found_report_id(
        id,
        report_type,
        device_model,
        device_category,
        description,
        location_address,
        incident_date,
        reward_amount,
        users(
          id,
          display_name,
          avatar_url
        )
      )
    `)
    .single()

  if (error) {
    console.error('Error creating match:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: match
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetMatchesForReport(supabaseClient: any, url: URL) {
  const pathParts = url.pathname.split('/')
  const reportId = pathParts[pathParts.length - 1]

  const { data: matches, error } = await supabaseClient
    .from('device_matches')
    .select(`
      *,
      lost_report:lost_found_reports!lost_report_id(
        id,
        report_type,
        device_model,
        device_category,
        description,
        location_address,
        incident_date,
        reward_amount,
        users(
          id,
          display_name,
          avatar_url
        )
      ),
      found_report:lost_found_reports!found_report_id(
        id,
        report_type,
        device_model,
        device_category,
        description,
        location_address,
        incident_date,
        reward_amount,
        users(
          id,
          display_name,
          avatar_url
        )
      )
    `)
    .or(`lost_report_id.eq.${reportId},found_report_id.eq.${reportId}`)
    .order('match_confidence', { ascending: false })

  if (error) {
    console.error('Error fetching matches for report:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: matches
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateMatch(supabaseClient: any, req: Request, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const matchId = pathParts[pathParts.length - 1]
  const body = await req.json()

  // Check if user is involved in the match
  const { data: match, error: fetchError } = await supabaseClient
    .from('device_matches')
    .select(`
      *,
      lost_report:lost_found_reports!lost_report_id(user_id),
      found_report:lost_found_reports!found_report_id(user_id)
    `)
    .eq('id', matchId)
    .single()

  if (fetchError || !match) {
    return new Response(
      JSON.stringify({ success: false, error: 'Match not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (match.lost_report?.user_id !== userId && match.found_report?.user_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: updatedMatch, error } = await supabaseClient
    .from('device_matches')
    .update({
      status: body.status,
      match_confidence: body.match_confidence,
      match_criteria: body.match_criteria
    })
    .eq('id', matchId)
    .select()
    .single()

  if (error) {
    console.error('Error updating match:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedMatch
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleMatchAction(supabaseClient: any, req: Request, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const matchId = pathParts[pathParts.length - 1]
  const body = await req.json()

  // Check if user is involved in the match
  const { data: match, error: fetchError } = await supabaseClient
    .from('device_matches')
    .select(`
      *,
      lost_report:lost_found_reports!lost_report_id(user_id),
      found_report:lost_found_reports!found_report_id(user_id)
    `)
    .eq('id', matchId)
    .single()

  if (fetchError || !match) {
    return new Response(
      JSON.stringify({ success: false, error: 'Match not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (match.lost_report?.user_id !== userId && match.found_report?.user_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let updateData: any = {}

  switch (body.action) {
    case 'contact':
      updateData = {
        status: 'contacted',
        contact_initiated_at: new Date().toISOString()
      }
      break
    case 'verify':
      updateData = {
        status: 'verified'
      }
      break
    case 'recover':
      updateData = {
        status: 'recovered',
        recovery_confirmed_at: new Date().toISOString()
      }
      break
    case 'reject':
      updateData = {
        status: 'rejected'
      }
      break
    default:
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }

  const { data: updatedMatch, error } = await supabaseClient
    .from('device_matches')
    .update(updateData)
    .eq('id', matchId)
    .select()
    .single()

  if (error) {
    console.error('Error updating match action:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedMatch
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
