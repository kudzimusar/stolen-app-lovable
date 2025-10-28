import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    );

    // Get the user from the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { workflow_id, action, admin_notes, reason } = await req.json();
    
    // Validate action
    if (!['approve', 'reject', 'escalate'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('approval_workflows')
      .select('*')
      .eq('id', workflow_id)
      .single();

    if (workflowError || !workflow) {
      return new Response(
        JSON.stringify({ error: 'Workflow not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check permission
    const { data: hasPermission, error: permError } = await supabaseClient.rpc('check_admin_permission', {
      p_user_id: user.id,
      p_resource_type: workflow.workflow_type,
      p_required_permission: action
    });

    if (permError || !hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update workflow status
    const newStatus = action === 'approve' ? 'approved' : 
                      action === 'reject' ? 'rejected' : 'escalated';
    
    const { error: updateError } = await supabaseClient
      .from('approval_workflows')
      .update({
        current_status: newStatus,
        reviewed_by: user.id,
        review_date: new Date().toISOString(),
        approval_date: action === 'approve' ? new Date().toISOString() : null,
        admin_notes: admin_notes,
        escalation_reason: action === 'escalate' ? reason : null,
        assigned_to: action === 'escalate' ? 
          (await supabaseClient.from('users').select('id').eq('role', 'super_admin').single()).data?.id : 
          workflow.assigned_to,
        updated_at: new Date().toISOString()
      })
      .eq('id', workflow_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update workflow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update the actual entity
    const { error: entityError } = await supabaseClient
      .from(workflow.entity_table)
      .update({
        approval_status: newStatus,
        approved_by: user.id,
        approval_date: new Date().toISOString()
      })
      .eq('id', workflow.entity_id);

    if (entityError) {
      console.error('Failed to update entity:', entityError);
      // Don't fail the request, just log the error
    }
    
    return new Response(
      JSON.stringify({ success: true, status: newStatus }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin-workflow-approve:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
