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
    if (method === 'GET' && path.endsWith('/success-stories')) {
      return await handleGetSuccessStories(supabaseClient, url)
    } else if (method === 'POST' && path.endsWith('/success-stories')) {
      return await handleCreateSuccessStory(supabaseClient, req, user.id)
    } else if (method === 'GET' && path.includes('/success-stories/')) {
      return await handleGetSuccessStory(supabaseClient, url)
    } else if (method === 'PUT' && path.includes('/success-stories/')) {
      return await handleUpdateSuccessStory(supabaseClient, req, url, user.id)
    } else if (method === 'DELETE' && path.includes('/success-stories/')) {
      return await handleDeleteSuccessStory(supabaseClient, url, user.id)
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

async function handleGetSuccessStories(supabaseClient: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const featured = url.searchParams.get('featured')

  let query = supabaseClient
    .from('success_stories')
    .select(`
      *,
      device_matches(
        id,
        match_confidence,
        recovery_confirmed_at,
        lost_report:lost_found_reports!lost_report_id(
          id,
          device_model,
          device_category,
          users(
            id,
            display_name,
            avatar_url
          )
        ),
        found_report:lost_found_reports!found_report_id(
          id,
          device_model,
          device_category,
          users(
            id,
            display_name,
            avatar_url
          )
        )
      )
    `)
    .eq('public_share', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (featured === 'true') {
    query = query.eq('featured', true)
  }

  const { data: stories, error } = await query

  if (error) {
    console.error('Error fetching success stories:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: stories,
      pagination: {
        limit,
        offset,
        hasMore: stories.length === limit
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateSuccessStory(supabaseClient: any, req: Request, userId: string) {
  const body = await req.json()
  
  // Verify user is involved in the recovery
  const { data: match, error: matchError } = await supabaseClient
    .from('device_matches')
    .select(`
      *,
      lost_report:lost_found_reports!lost_report_id(user_id),
      found_report:lost_found_reports!found_report_id(user_id)
    `)
    .eq('id', body.recovery_id)
    .single()

  if (matchError || !match) {
    return new Response(
      JSON.stringify({ success: false, error: 'Recovery not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (match.lost_report?.user_id !== userId && match.found_report?.user_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (match.status !== 'recovered') {
    return new Response(
      JSON.stringify({ success: false, error: 'Recovery must be confirmed before sharing story' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const storyData = {
    recovery_id: body.recovery_id,
    title: body.title,
    story: body.story,
    photos: body.photos || [],
    public_share: body.public_share || false,
    featured: false // Only admins can feature stories
  }

  const { data: story, error } = await supabaseClient
    .from('success_stories')
    .insert(storyData)
    .select(`
      *,
      device_matches(
        id,
        match_confidence,
        recovery_confirmed_at,
        lost_report:lost_found_reports!lost_report_id(
          id,
          device_model,
          device_category,
          users(
            id,
            display_name,
            avatar_url
          )
        ),
        found_report:lost_found_reports!found_report_id(
          id,
          device_model,
          device_category,
          users(
            id,
            display_name,
            avatar_url
          )
        )
      )
    `)
    .single()

  if (error) {
    console.error('Error creating success story:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: story
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetSuccessStory(supabaseClient: any, url: URL) {
  const pathParts = url.pathname.split('/')
  const storyId = pathParts[pathParts.length - 1]

  const { data: story, error } = await supabaseClient
    .from('success_stories')
    .select(`
      *,
      device_matches(
        id,
        match_confidence,
        recovery_confirmed_at,
        lost_report:lost_found_reports!lost_report_id(
          id,
          device_model,
          device_category,
          description,
          location_address,
          incident_date,
          users(
            id,
            display_name,
            avatar_url
          )
        ),
        found_report:lost_found_reports!found_report_id(
          id,
          device_model,
          device_category,
          description,
          location_address,
          incident_date,
          users(
            id,
            display_name,
            avatar_url
          )
        )
      )
    `)
    .eq('id', storyId)
    .single()

  if (error) {
    console.error('Error fetching success story:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: story
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateSuccessStory(supabaseClient: any, req: Request, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const storyId = pathParts[pathParts.length - 1]
  const body = await req.json()

  // Check if user owns the story
  const { data: story, error: fetchError } = await supabaseClient
    .from('success_stories')
    .select(`
      *,
      device_matches(
        lost_report:lost_found_reports!lost_report_id(user_id),
        found_report:lost_found_reports!found_report_id(user_id)
      )
    `)
    .eq('id', storyId)
    .single()

  if (fetchError || !story) {
    return new Response(
      JSON.stringify({ success: false, error: 'Story not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const match = story.device_matches
  if (match.lost_report?.user_id !== userId && match.found_report?.user_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: updatedStory, error } = await supabaseClient
    .from('success_stories')
    .update({
      title: body.title,
      story: body.story,
      photos: body.photos,
      public_share: body.public_share
    })
    .eq('id', storyId)
    .select()
    .single()

  if (error) {
    console.error('Error updating success story:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedStory
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeleteSuccessStory(supabaseClient: any, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const storyId = pathParts[pathParts.length - 1]

  // Check if user owns the story
  const { data: story, error: fetchError } = await supabaseClient
    .from('success_stories')
    .select(`
      *,
      device_matches(
        lost_report:lost_found_reports!lost_report_id(user_id),
        found_report:lost_found_reports!found_report_id(user_id)
      )
    `)
    .eq('id', storyId)
    .single()

  if (fetchError || !story) {
    return new Response(
      JSON.stringify({ success: false, error: 'Story not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const match = story.device_matches
  if (match.lost_report?.user_id !== userId && match.found_report?.user_id !== userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabaseClient
    .from('success_stories')
    .delete()
    .eq('id', storyId)

  if (error) {
    console.error('Error deleting success story:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Success story deleted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
