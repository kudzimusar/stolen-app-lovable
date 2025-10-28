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

    const { item_type, item_id, reason } = await req.json();
    
    // item_type: 'workflow' or 'task'
    // item_id: UUID of workflow or task
    
    if (item_type === 'workflow') {
      // Get super admin ID
      const { data: superAdmin, error: adminError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('role', 'super_admin')
        .single();

      if (adminError || !superAdmin) {
        return new Response(
          JSON.stringify({ error: 'Super admin not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Escalate workflow to Super Admin
      const { data: workflow, error: workflowError } = await supabaseClient
        .from('approval_workflows')
        .update({
          current_status: 'escalated',
          escalation_reason: reason,
          assigned_to: superAdmin.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', item_id)
        .select()
        .single();

      if (workflowError) {
        return new Response(
          JSON.stringify({ error: 'Failed to escalate workflow' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, workflow }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (item_type === 'task') {
      // Get super admin ID
      const { data: superAdmin, error: adminError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('role', 'super_admin')
        .single();

      if (adminError || !superAdmin) {
        return new Response(
          JSON.stringify({ error: 'Super admin not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Escalate task to Super Admin
      const { data: task, error: taskError } = await supabaseClient
        .from('admin_tasks')
        .update({
          status: 'escalated',
          escalation_count: supabaseClient.sql`escalation_count + 1`,
          assigned_to: superAdmin.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', item_id)
        .select()
        .single();

      if (taskError) {
        return new Response(
          JSON.stringify({ error: 'Failed to escalate task' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, task }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid item type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin-escalate:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
