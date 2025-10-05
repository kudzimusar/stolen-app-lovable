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
    // Create Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          isAdmin: false, 
          error: 'Authentication failed',
          details: authError?.message
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is an admin with comprehensive role and permission validation
    const { data: adminUser, error: adminError } = await supabaseClient
      .from('admin_users')
      .select(`
        *,
        admin_roles:admin_role_id (
          id,
          role_name,
          permissions,
          description
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminUser) {
      console.error('Admin check failed:', adminError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          isAdmin: false, 
          error: 'User is not an admin or admin access is inactive',
          details: adminError?.message
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get additional admin session information
    const { data: sessionInfo, error: sessionError } = await supabaseClient
      .from('admin_sessions')
      .select('*')
      .eq('admin_user_id', adminUser.id)
      .eq('is_active', true)
      .order('last_activity', { ascending: false })
      .limit(1)
      .single()

    // Log admin access attempt
    const { error: logError } = await supabaseClient
      .from('admin_activity_log')
      .insert({
        admin_user_id: adminUser.id,
        activity_type: 'admin_check',
        activity_description: 'Admin status verification',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    if (logError) {
      console.warn('Failed to log admin activity:', logError)
    }

    // Return comprehensive admin status with full role information
    return new Response(
      JSON.stringify({ 
        success: true, 
        isAdmin: true, 
        adminUser: {
          id: adminUser.id,
          user_id: adminUser.user_id,
          role: adminUser.role,
          permissions: adminUser.permissions,
          department: adminUser.department,
          position: adminUser.position,
          employee_id: adminUser.employee_id,
          is_active: adminUser.is_active,
          created_at: adminUser.created_at,
          updated_at: adminUser.updated_at,
          role_details: adminUser.admin_roles,
          session_info: sessionInfo
        },
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin check error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        isAdmin: false, 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})