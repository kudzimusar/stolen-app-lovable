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
          error: 'Authentication failed',
          details: authError?.message
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is a super admin with comprehensive validation
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
      .eq('role', 'super_admin')
      .single()

    if (adminError || !adminUser) {
      console.error('Super admin check failed:', adminError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Super admin privileges required',
          details: adminError?.message
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse and validate request body
    const requestBody = await req.json()
    const { 
      user_email, 
      role_name, 
      employee_id, 
      department, 
      position, 
      onboarding_notes,
      temporary_password,
      send_welcome_email = true
    } = requestBody

    // Comprehensive validation
    if (!user_email || !role_name || !employee_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields',
          required_fields: ['user_email', 'role_name', 'employee_id'],
          provided_fields: Object.keys(requestBody)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user_email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email format' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if role exists
    const { data: roleExists, error: roleError } = await supabaseClient
      .from('admin_roles')
      .select('*')
      .eq('role_name', role_name)
      .single()

    if (roleError || !roleExists) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid admin role specified',
          available_roles: await getAvailableRoles(supabaseClient)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already exists in auth system
    const { data: existingUser, error: userCheckError } = await supabaseClient.auth.admin.getUserByEmail(user_email)
    
    if (userCheckError && userCheckError.message !== 'User not found') {
      console.error('Error checking existing user:', userCheckError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to check existing user',
          details: userCheckError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let targetUserId = existingUser?.user?.id

    // If user doesn't exist, create them in auth system
    if (!targetUserId) {
      const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
        email: user_email,
        password: temporary_password || generateTemporaryPassword(),
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          department: department || '',
          position: position || '',
          employee_id: employee_id
        }
      })

      if (createUserError || !newUser.user) {
        console.error('Failed to create user:', createUserError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to create user account',
            details: createUserError?.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      targetUserId = newUser.user.id
    }

    // Call the onboard_admin_user function with comprehensive parameters
    const { data: result, error: onboardError } = await supabaseClient
      .rpc('onboard_admin_user', {
        p_user_email: user_email,
        p_role_name: role_name,
        p_employee_id: employee_id,
        p_department: department || '',
        p_position: position || '',
        p_onboarding_notes: onboarding_notes || `Onboarded by ${adminUser.employee_id} (${adminUser.email})`
      })

    if (onboardError) {
      console.error('Onboard error:', onboardError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to onboard admin user',
          details: onboardError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the onboarding activity
    const { error: logError } = await supabaseClient
      .from('admin_activity_log')
      .insert({
        admin_user_id: adminUser.id,
        activity_type: 'admin_onboard',
        activity_description: `Onboarded new admin: ${user_email} with role: ${role_name}`,
        target_table: 'admin_users',
        target_record_id: result.admin_user_id,
        activity_data: {
          onboarded_user_email: user_email,
          role_name: role_name,
          department: department,
          position: position,
          employee_id: employee_id
        },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    if (logError) {
      console.warn('Failed to log onboarding activity:', logError)
    }

    // Send welcome email if requested
    if (send_welcome_email) {
      try {
        await sendWelcomeEmail(user_email, role_name, department, position, temporary_password)
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user onboarded successfully',
        data: {
          ...result,
          user_created: !existingUser,
          welcome_email_sent: send_welcome_email,
          onboarded_by: {
            admin_id: adminUser.id,
            admin_email: adminUser.email,
            admin_role: adminUser.role
          }
        },
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin onboard error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
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

// Helper function to get available roles
async function getAvailableRoles(supabaseClient: any) {
  try {
    const { data: roles } = await supabaseClient
      .from('admin_roles')
      .select('role_name, description')
      .order('role_name')
    return roles || []
  } catch (error) {
    console.error('Error fetching available roles:', error)
    return []
  }
}

// Helper function to generate temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Helper function to send welcome email
async function sendWelcomeEmail(email: string, role: string, department: string, position: string, tempPassword?: string) {
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  // For now, we'll just log it
  console.log(`Welcome email would be sent to ${email} for role ${role} in ${department}`)
  
  // In a real implementation, you would:
  // 1. Use SendGrid or AWS SES
  // 2. Send a welcome email with login credentials
  // 3. Include role-specific information
  // 4. Set up password reset if needed
}