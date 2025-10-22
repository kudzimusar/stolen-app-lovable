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
    const { action, user_id, status, admin_notes, reason } = await req.json()

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

    switch (action) {
      case 'approve':
        return await handleApproveStakeholder(supabaseClient, user_id, user.id, admin_notes)
      
      case 'reject':
        return await handleRejectStakeholder(supabaseClient, user_id, user.id, admin_notes, reason)
      
      case 'suspend':
        return await handleSuspendStakeholder(supabaseClient, user_id, user.id, admin_notes, reason)
      
      case 'activate':
        return await handleActivateStakeholder(supabaseClient, user_id, user.id, admin_notes)
      
      case 'update_notes':
        return await handleUpdateNotes(supabaseClient, user_id, user.id, admin_notes)
      
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
    console.error('Admin stakeholders update error:', error)
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

async function handleApproveStakeholder(supabase: any, user_id: string, admin_id: string, admin_notes: string) {
  try {
    // Use the database function to update stakeholder status
    const { data: result, error } = await supabase
      .rpc('update_stakeholder_status', {
        p_user_id: user_id,
        p_status: 'approved',
        p_admin_id: admin_id,
        p_admin_notes: admin_notes || 'Approved by admin'
      })

    if (error) {
      console.error('Error approving stakeholder:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to approve stakeholder' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Stakeholder not found or update failed' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stakeholder approved successfully',
        action: 'approved'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in handleApproveStakeholder:', error)
    throw error
  }
}

async function handleRejectStakeholder(supabase: any, user_id: string, admin_id: string, admin_notes: string, reason: string) {
  try {
    // Use the database function to update stakeholder status
    const { data: result, error } = await supabase
      .rpc('update_stakeholder_status', {
        p_user_id: user_id,
        p_status: 'rejected',
        p_admin_id: admin_id,
        p_admin_notes: admin_notes || reason || 'Rejected by admin'
      })

    if (error) {
      console.error('Error rejecting stakeholder:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to reject stakeholder' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Stakeholder not found or update failed' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stakeholder rejected successfully',
        action: 'rejected'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in handleRejectStakeholder:', error)
    throw error
  }
}

async function handleSuspendStakeholder(supabase: any, user_id: string, admin_id: string, admin_notes: string, reason: string) {
  try {
    // Use the database function to update stakeholder status
    const { data: result, error } = await supabase
      .rpc('update_stakeholder_status', {
        p_user_id: user_id,
        p_status: 'suspended',
        p_admin_id: admin_id,
        p_admin_notes: admin_notes || reason || 'Suspended by admin'
      })

    if (error) {
      console.error('Error suspending stakeholder:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to suspend stakeholder' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Stakeholder not found or update failed' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stakeholder suspended successfully',
        action: 'suspended'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in handleSuspendStakeholder:', error)
    throw error
  }
}

async function handleActivateStakeholder(supabase: any, user_id: string, admin_id: string, admin_notes: string) {
  try {
    // Use the database function to update stakeholder status
    const { data: result, error } = await supabase
      .rpc('update_stakeholder_status', {
        p_user_id: user_id,
        p_status: 'approved',
        p_admin_id: admin_id,
        p_admin_notes: admin_notes || 'Activated by admin'
      })

    if (error) {
      console.error('Error activating stakeholder:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to activate stakeholder' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Stakeholder not found or update failed' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stakeholder activated successfully',
        action: 'activated'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in handleActivateStakeholder:', error)
    throw error
  }
}

async function handleUpdateNotes(supabase: any, user_id: string, admin_id: string, admin_notes: string) {
  try {
    if (!admin_notes) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Admin notes are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get stakeholder type first
    const { data: stakeholderType, error: typeError } = await supabase
      .rpc('get_stakeholder_type', { p_user_id: user_id })

    if (typeError || !stakeholderType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Stakeholder not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update admin notes based on stakeholder type
    let updateQuery;
    switch (stakeholderType) {
      case 'retailer':
        updateQuery = supabase
          .from('retailers')
          .update({ admin_notes: admin_notes, updated_at: new Date().toISOString() })
          .eq('user_id', user_id)
        break
      case 'repair_shop':
        updateQuery = supabase
          .from('repair_shops')
          .update({ admin_notes: admin_notes, updated_at: new Date().toISOString() })
          .eq('user_id', user_id)
        break
      case 'law_enforcement':
        updateQuery = supabase
          .from('law_enforcement')
          .update({ admin_notes: admin_notes, updated_at: new Date().toISOString() })
          .eq('user_id', user_id)
        break
      case 'insurance_partner':
        updateQuery = supabase
          .from('insurance_partners')
          .update({ admin_notes: admin_notes, updated_at: new Date().toISOString() })
          .eq('user_id', user_id)
        break
      case 'ngo':
        updateQuery = supabase
          .from('ngos')
          .update({ admin_notes: admin_notes, updated_at: new Date().toISOString() })
          .eq('user_id', user_id)
        break
      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid stakeholder type' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    const { error } = await updateQuery

    if (error) {
      console.error('Error updating admin notes:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to update admin notes' 
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
        message: 'Admin notes updated successfully',
        action: 'notes_updated'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in handleUpdateNotes:', error)
    throw error
  }
}
