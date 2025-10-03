import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user data and role
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id, email, display_name, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make Musarurwa Shadreck Kudzanai the Super Admin
    const isSuperAdmin = userData.email === 'musarurwa.shadreck@gmail.com' || 
                        userData.display_name?.includes('Musarurwa') ||
                        userData.display_name?.includes('Shadreck');

    // Define role permissions
    const rolePermissions = {
      super_admin: [
        'admin:full',
        'admin:overview',
        'admin:users',
        'admin:lost-found',
        'admin:marketplace',
        'admin:stakeholders',
        'admin:financial',
        'admin:security',
        'admin:settings'
      ],
      admin: [
        'admin:overview',
        'admin:users',
        'admin:lost-found',
        'admin:marketplace',
        'admin:stakeholders',
        'admin:financial',
        'admin:security'
      ],
      lost_found_admin: [
        'admin:overview',
        'admin:users',
        'admin:lost-found',
        'admin:financial'
      ],
      marketplace_admin: [
        'admin:overview',
        'admin:users',
        'admin:marketplace',
        'admin:financial'
      ],
      stakeholder_manager: [
        'admin:overview',
        'admin:users',
        'admin:stakeholders',
        'admin:financial'
      ],
      financial_manager: [
        'admin:overview',
        'admin:users',
        'admin:financial',
        'admin:lost-found'
      ],
      security_admin: [
        'admin:overview',
        'admin:users',
        'admin:security',
        'admin:settings'
      ],
      law_enforcement: [
        'admin:overview',
        'admin:users',
        'admin:lost-found',
        'admin:stakeholders'
      ]
    };

    // Determine user role and permissions
    let userRole = userData.role || 'user';
    let permissions = rolePermissions[userRole] || [];

    // Override for Super Admin
    if (isSuperAdmin) {
      userRole = 'super_admin';
      permissions = rolePermissions.super_admin;
    }

    const roleData = {
      id: user.id,
      name: userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      permissions
    };

    console.log('👤 User role fetched:', { 
      user: userData.display_name, 
      email: userData.email, 
      role: userRole,
      isSuperAdmin 
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: roleData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-user-role:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch user role'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
