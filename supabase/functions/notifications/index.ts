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
    if (method === 'GET' && path.endsWith('/notifications')) {
      return await handleGetNotifications(supabaseClient, user.id)
    } else if (method === 'POST' && path.endsWith('/notifications')) {
      return await handleCreateNotification(supabaseClient, req, user.id)
    } else if (method === 'PUT' && path.includes('/notifications/')) {
      return await handleUpdateNotification(supabaseClient, req, url, user.id)
    } else if (method === 'DELETE' && path.includes('/notifications/')) {
      return await handleDeleteNotification(supabaseClient, url, user.id)
    } else if (method === 'POST' && path.endsWith('/notifications/subscribe')) {
      return await handleSubscribeToNotifications(supabaseClient, req, user.id)
    } else if (method === 'GET' && path.endsWith('/notifications/preferences')) {
      return await handleGetNotificationPreferences(supabaseClient, user.id)
    } else if (method === 'PUT' && path.endsWith('/notifications/preferences')) {
      return await handleUpdateNotificationPreferences(supabaseClient, req, user.id)
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

async function handleGetNotifications(supabaseClient: any, userId: string) {
  const { data: notifications, error } = await supabaseClient
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: notifications
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateNotification(supabaseClient: any, req: Request, userId: string) {
  const body = await req.json()
  
  const notificationData = {
    user_id: userId,
    notification_type: body.notification_type,
    preferences: body.preferences || {}
  }

  const { data: notification, error } = await supabaseClient
    .from('user_notifications')
    .insert(notificationData)
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: notification
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateNotification(supabaseClient: any, req: Request, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const notificationId = pathParts[pathParts.length - 1]
  const body = await req.json()

  const { data: notification, error } = await supabaseClient
    .from('user_notifications')
    .update({
      preferences: body.preferences,
      last_sent: body.last_sent
    })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: notification
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeleteNotification(supabaseClient: any, url: URL, userId: string) {
  const pathParts = url.pathname.split('/')
  const notificationId = pathParts[pathParts.length - 1]

  const { error } = await supabaseClient
    .from('user_notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Notification deleted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleSubscribeToNotifications(supabaseClient: any, req: Request, userId: string) {
  const body = await req.json()
  
  // Create or update notification preferences
  const { data: notification, error } = await supabaseClient
    .from('user_notifications')
    .upsert({
      user_id: userId,
      notification_type: 'lost_found',
      preferences: {
        email: body.email || true,
        push: body.push || true,
        sms: body.sms || false,
        radius_km: body.radius_km || 10,
        high_value_only: body.high_value_only || false,
        frequency: body.frequency || 'immediate'
      }
    }, {
      onConflict: 'user_id,notification_type'
    })
    .select()
    .single()

  if (error) {
    console.error('Error subscribing to notifications:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: notification
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetNotificationPreferences(supabaseClient: any, userId: string) {
  const { data: preferences, error } = await supabaseClient
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('notification_type', 'lost_found')
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching notification preferences:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Return default preferences if none exist
  const defaultPreferences = {
    email: true,
    push: true,
    sms: false,
    radius_km: 10,
    high_value_only: false,
    frequency: 'immediate'
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: preferences || { preferences: defaultPreferences }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateNotificationPreferences(supabaseClient: any, req: Request, userId: string) {
  const body = await req.json()
  
  const { data: preferences, error } = await supabaseClient
    .from('user_notifications')
    .upsert({
      user_id: userId,
      notification_type: 'lost_found',
      preferences: body.preferences
    }, {
      onConflict: 'user_id,notification_type'
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating notification preferences:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: preferences
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
