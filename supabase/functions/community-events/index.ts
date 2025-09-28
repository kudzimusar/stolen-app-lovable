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
    if (method === 'GET' && path.endsWith('/community-events')) {
      return await handleGetEvents(supabaseClient, url)
    } else if (method === 'POST' && path.endsWith('/community-events')) {
      return await handleCreateEvent(supabaseClient, req, user.id)
    } else if (method === 'GET' && path.includes('/community-events/')) {
      return await handleGetEvent(supabaseClient, url)
    } else if (method === 'PUT' && path.includes('/community-events/')) {
      return await handleUpdateEvent(supabaseClient, req, url, user.id)
    } else if (method === 'DELETE' && path.includes('/community-events/')) {
      return await handleDeleteEvent(supabaseClient, url, user.id)
    } else if (method === 'POST' && path.includes('/community-events/') && path.includes('/join')) {
      return await handleJoinEvent(supabaseClient, url, user.id)
    } else if (method === 'POST' && path.includes('/community-events/') && path.includes('/leave')) {
      return await handleLeaveEvent(supabaseClient, url, user.id)
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

async function handleGetEvents(supabaseClient: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const status = url.searchParams.get('status')
  const eventType = url.searchParams.get('event_type')

  let query = supabaseClient
    .from('community_events')
    .select(`
      *,
      users(
        id,
        display_name,
        avatar_url
      ),
      event_participants(
        id,
        user_id,
        role,
        joined_at,
        users(
          id,
          display_name,
          avatar_url
        )
      )
    `)
    .order('start_date', { ascending: true })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  if (eventType) {
    query = query.eq('event_type', eventType)
  }

  const { data: events, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: events,
      pagination: {
        limit,
        offset,
        hasMore: events.length === limit
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateEvent(supabaseClient: any, req: Request, userId: string) {
  const body = await req.json()
  
  const eventData = {
    organizer_id: userId,
    event_type: body.event_type,
    title: body.title,
    description: body.description,
    location_lat: body.location_lat,
    location_lng: body.location_lng,
    location_address: body.location_address,
    start_date: body.start_date,
    end_date: body.end_date,
    max_participants: body.max_participants,
    status: 'upcoming'
  }

  const { data: event, error } = await supabaseClient
    .from('community_events')
    .insert(eventData)
    .select(`
      *,
      users(
        id,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Error creating event:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Add organizer as participant
  await supabaseClient
    .from('event_participants')
    .insert({
      event_id: event.id,
      user_id: userId,
      role: 'organizer'
    })

  return new Response(
    JSON.stringify({
      success: true,
      data: event
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetEvent(supabaseClient: any, url: URL) {
  const pathParts = url.pathname.split('/')
  const eventId = pathParts[pathParts.length - 1]

  const { data: event, error } = await supabaseClient
    .from('community_events')
    .select(`
      *,
      users(
        id,
        display_name,
        avatar_url
      ),
      event_participants(
        id,
        user_id,
        role,
        joined_at,
        users(
          id,
          display_name,
          avatar_url
        )
      )
    `)
    .eq('id', eventId)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: event
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateEvent(supabaseClient: any, req: Request, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const eventId = pathParts[pathParts.length - 1]
  const body = await req.json()

  // Check if user is the organizer
  const { data: event, error: fetchError } = await supabaseClient
    .from('community_events')
    .select('organizer_id')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) {
    return new Response(
      JSON.stringify({ success: false, error: 'Event not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (event.organizer_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: updatedEvent, error } = await supabaseClient
    .from('community_events')
    .update({
      title: body.title,
      description: body.description,
      location_lat: body.location_lat,
      location_lng: body.location_lng,
      location_address: body.location_address,
      start_date: body.start_date,
      end_date: body.end_date,
      max_participants: body.max_participants,
      status: body.status
    })
    .eq('id', eventId)
    .select()
    .single()

  if (error) {
    console.error('Error updating event:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedEvent
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeleteEvent(supabaseClient: any, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const eventId = pathParts[pathParts.length - 1]

  // Check if user is the organizer
  const { data: event, error: fetchError } = await supabaseClient
    .from('community_events')
    .select('organizer_id')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) {
    return new Response(
      JSON.stringify({ success: false, error: 'Event not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (event.organizer_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabaseClient
    .from('community_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Error deleting event:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Event deleted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleJoinEvent(supabaseClient: any, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const eventId = pathParts[pathParts.length - 2] // /events/{id}/join

  // Check if event exists and has space
  const { data: event, error: fetchError } = await supabaseClient
    .from('community_events')
    .select('max_participants, current_participants, status')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) {
    return new Response(
      JSON.stringify({ success: false, error: 'Event not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (event.status !== 'upcoming') {
    return new Response(
      JSON.stringify({ success: false, error: 'Event is not open for registration' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (event.max_participants && event.current_participants >= event.max_participants) {
    return new Response(
      JSON.stringify({ success: false, error: 'Event is full' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Add participant
  const { data: participant, error } = await supabaseClient
    .from('event_participants')
    .insert({
      event_id: eventId,
      user_id: userId,
      role: 'participant'
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return new Response(
        JSON.stringify({ success: false, error: 'Already registered for this event' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.error('Error joining event:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update participant count
  await supabaseClient
    .from('community_events')
    .update({ current_participants: event.current_participants + 1 })
    .eq('id', eventId)

  return new Response(
    JSON.stringify({
      success: true,
      data: participant
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleLeaveEvent(supabaseClient: any, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const eventId = pathParts[pathParts.length - 2] // /events/{id}/leave

  // Remove participant
  const { error } = await supabaseClient
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error leaving event:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update participant count
  const { data: event } = await supabaseClient
    .from('community_events')
    .select('current_participants')
    .eq('id', eventId)
    .single()

  if (event) {
    await supabaseClient
      .from('community_events')
      .update({ current_participants: Math.max(0, event.current_participants - 1) })
      .eq('id', eventId)
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Left event successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
