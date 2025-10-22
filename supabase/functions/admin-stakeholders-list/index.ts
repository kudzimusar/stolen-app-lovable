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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authentication failed' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is an admin using the existing admin system
    const { data: adminUser, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Admin privileges required' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request parameters
    const { action, stakeholder_type, status, search, limit, offset } = await req.json()

    switch (action) {
      case 'get_stats':
        return await handleGetStats(supabaseClient)
      
      case 'list_stakeholders':
        return await handleListStakeholders(supabaseClient, {
          stakeholder_type: stakeholder_type || 'all',
          status: status || 'all',
          search: search || '',
          limit: limit || 50,
          offset: offset || 0
        })
      
      case 'get_stakeholder_details':
        const { user_id } = await req.json()
        return await handleGetStakeholderDetails(supabaseClient, user_id)
      
      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action specified' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Admin stakeholders list error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleGetStats(supabase: any) {
  try {
    // Get stakeholder statistics using the database function
    const { data: stats, error } = await supabase
      .rpc('get_admin_stakeholder_stats')

    if (error) {
      console.error('Error fetching stakeholder stats:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch stakeholder statistics' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        stats: stats || {}
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in handleGetStats:', error)
    throw error
  }
}

async function handleListStakeholders(supabase: any, params: {
  stakeholder_type: string
  status: string
  search: string
  limit: number
  offset: number
}) {
  try {
    // Get stakeholder list using the database function
    const { data: stakeholders, error } = await supabase
      .rpc('list_stakeholders', {
        p_stakeholder_type: params.stakeholder_type,
        p_status: params.status,
        p_search: params.search,
        p_limit: params.limit,
        p_offset: params.offset
      })

    if (error) {
      console.error('Error fetching stakeholders:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch stakeholders' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        stakeholders: stakeholders || [],
        pagination: {
          limit: params.limit,
          offset: params.offset,
          has_more: (stakeholders || []).length === params.limit
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in handleListStakeholders:', error)
    throw error
  }
}

async function handleGetStakeholderDetails(supabase: any, user_id: string) {
  try {
    if (!user_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User ID is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get stakeholder details using the database function
    const { data: details, error } = await supabase
      .rpc('get_stakeholder_details', { p_user_id: user_id })

    if (error) {
      console.error('Error fetching stakeholder details:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch stakeholder details' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        details: details || {}
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in handleGetStakeholderDetails:', error)
    throw error
  }
}
